from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 7
TINYFISH_API_KEY = os.environ.get('TINYFISH_API_KEY', '')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helpers ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode({"sub": user_id, "exp": expire}, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        return None
    # Check session in DB
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user

# --- Models ---
class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleCallbackRequest(BaseModel):
    session_id: str

class WaitlistRequest(BaseModel):
    email: str

class ProfileUpdateRequest(BaseModel):
    name: str
    email: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class RolesUpdateRequest(BaseModel):
    roles: List[str]

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    venue: str
    city: str
    country: str
    lat: float
    lng: float
    capacity: int
    category: str
    tags: List[str] = []
    funding_goal: float = 0
    image_url: str = ""

class EventCreateNew(BaseModel):
    title: str
    description: str
    event_type: str  # 'normal', 'crowdfunded', 'sponsored'
    funding_goal: Optional[float] = 0
    region: str
    luma_link: Optional[str] = None
    attendee_limit: Optional[int] = None
    date: Optional[str] = None

# --- Auth Routes ---
@api_router.post("/auth/register")
async def register(data: RegisterRequest, response: Response):
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(400, "Email already registered")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "auth_provider": "jwt",
        "picture": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_id}",
        "role": "attendee",
        "reputation_score": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id)
    expires = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    await db.user_sessions.insert_one({
        "session_token": token, "user_id": user_id,
        "expires_at": expires, "created_at": datetime.now(timezone.utc)
    })
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", path="/", max_age=604800)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    return {"user": user_doc, "token": token}

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(user["user_id"])
    expires = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    await db.user_sessions.insert_one({
        "session_token": token, "user_id": user["user_id"],
        "expires_at": expires, "created_at": datetime.now(timezone.utc)
    })
    response.set_cookie("session_token", token, httponly=True, secure=True, samesite="none", path="/", max_age=604800)
    user.pop("password_hash", None)
    return {"user": user, "token": token}

@api_router.post("/auth/google/callback")
async def google_callback(data: GoogleCallbackRequest, response: Response):
    async with httpx.AsyncClient() as hclient:
        res = await hclient.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": data.session_id}
        )
    if res.status_code != 200:
        raise HTTPException(400, "Invalid Google session")
    session_data = res.json()
    email = session_data.get("email")
    name = session_data.get("name", "")
    picture = session_data.get("picture", "")
    google_session_token = session_data.get("session_token")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": name, "picture": picture}})
        existing.update({"name": name, "picture": picture})
        user_doc = existing
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id, "email": email, "name": name, "picture": picture,
            "auth_provider": "google", "role": "attendee",
            "reputation_score": 0, "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)

    expires = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRE_DAYS)
    await db.user_sessions.insert_one({
        "session_token": google_session_token, "user_id": user_id,
        "expires_at": expires, "created_at": datetime.now(timezone.utc)
    })
    response.set_cookie("session_token", google_session_token, httponly=True, secure=True, samesite="none", path="/", max_age=604800)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    return {"user": user_doc, "token": google_session_token}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    user.pop("password_hash", None)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}

# --- User Profile Routes ---
@api_router.put("/user/profile")
async def update_profile(data: ProfileUpdateRequest, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    # Check if email is being changed and if it's already taken
    if data.email != user["email"]:
        existing = await db.users.find_one({"email": data.email, "user_id": {"$ne": user["user_id"]}}, {"_id": 0})
        if existing:
            raise HTTPException(400, "Email already in use")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"name": data.name, "email": data.email}}
    )
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    updated_user.pop("password_hash", None)
    return updated_user

@api_router.put("/user/password")
async def change_password(data: PasswordChangeRequest, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    if user.get("auth_provider") == "google":
        raise HTTPException(400, "Cannot change password for Google accounts")
    
    # Verify current password
    full_user = await db.users.find_one({"user_id": user["user_id"]})
    if not verify_password(data.current_password, full_user.get("password_hash", "")):
        raise HTTPException(400, "Current password is incorrect")
    
    # Update password
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"password_hash": hash_password(data.new_password)}}
    )
    
    return {"message": "Password updated successfully"}

@api_router.get("/user/events")
async def get_user_events(request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    # Get events created by user
    created = await db.events.find({"organizer_id": user["user_id"]}, {"_id": 0}).to_list(50)
    
    # Get events attended by user (for now return empty, would need event_attendees collection)
    attended = []
    
    return {"created": created, "attended": attended}

@api_router.put("/user/roles")
async def update_user_roles(data: RolesUpdateRequest, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    # Validate roles
    valid_roles = ["attendee", "organizer", "sponsor"]
    roles = [r for r in data.roles if r in valid_roles]
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"roles": roles, "roles_selected": True}}
    )
    
    updated_user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    updated_user.pop("password_hash", None)
    return updated_user

# --- Events Routes ---
@api_router.get("/events")
async def get_events(category: Optional[str] = None, city: Optional[str] = None):
    query = {}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    events = await db.events.find(query, {"_id": 0}).to_list(100)
    return events

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    event = await db.events.find_one({"event_id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(404, "Event not found")
    return event

@api_router.post("/events")
async def create_event(data: EventCreate, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    event_id = f"evt_{uuid.uuid4().hex[:8]}"
    event_doc = {
        "event_id": event_id, **data.model_dump(),
        "attendee_count": 0, "funding_raised": 0,
        "milestones": [], "organizer_id": user["user_id"],
        "organizer_name": user["name"], "organizer_avatar": user.get("picture", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(event_doc)
    event_doc.pop("_id", None)
    return event_doc

@api_router.post("/events/create")
async def create_event_new(data: EventCreateNew, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    
    event_id = f"evt_{uuid.uuid4().hex[:8]}"
    event_doc = {
        "event_id": event_id,
        "title": data.title,
        "description": data.description,
        "event_type": data.event_type,
        "funding_goal": data.funding_goal or 0,
        "funding_raised": 0,
        "region": data.region,
        "luma_link": data.luma_link,
        "attendee_limit": data.attendee_limit,
        "attendee_count": 0,
        "date": data.date,
        "organizer_id": user["user_id"],
        "organizer_name": user["name"],
        "organizer_avatar": user.get("picture", ""),
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(event_doc)
    event_doc.pop("_id", None)
    return event_doc

# --- Communities Routes ---
@api_router.get("/communities")
async def get_communities():
    communities = await db.communities.find({}, {"_id": 0}).to_list(50)
    return communities

@api_router.post("/communities/{community_id}/join")
async def join_community(community_id: str, request: Request):
    user = await get_current_user(request)
    if not user:
        raise HTTPException(401, "Not authenticated")
    await db.communities.update_one({"community_id": community_id}, {"$inc": {"member_count": 1}})
    return {"message": "Joined successfully"}

# --- Waitlist Route ---
@api_router.post("/waitlist")
async def join_waitlist(data: WaitlistRequest):
    existing = await db.waitlist.find_one({"email": data.email}, {"_id": 0})
    if existing:
        return {"message": "Already on waitlist"}
    await db.waitlist.insert_one({
        "id": f"wl_{uuid.uuid4().hex[:8]}", "email": data.email,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Added to waitlist successfully"}

@api_router.get("/health")
async def health():
    return {"status": "ok"}

# --- AI Concierge: Event Scraping ---
EVENT_SOURCES = [
    {"id": "solana", "name": "Solana Events", "url": "https://solana.com/events"},
    {"id": "cryptonomads", "name": "Crypto Nomads", "url": "https://cryptonomads.org/"},
    {"id": "ethglobal", "name": "ETH Global", "url": "https://ethglobal.com/events"},
]

SCRAPE_GOAL = "Extract all events listed on this page. For each event return: event_name, event_description, start_date, end_date (if different from start date, otherwise null), event_time, event_location. Return as a JSON array."

async def scrape_events_from_source(source_url: str):
    """Scrape events from a single source using TinyFish API"""
    if not TINYFISH_API_KEY:
        return {"error": "TinyFish API key not configured"}
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as http_client:
            response = await http_client.post(
                "https://agent.tinyfish.ai/v1/automation/run-sse",
                headers={
                    "X-API-Key": TINYFISH_API_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "url": source_url,
                    "goal": SCRAPE_GOAL,
                }
            )
            
            # Parse SSE response
            result = None
            for line in response.text.split('\n'):
                if line.startswith('data: '):
                    try:
                        event = json.loads(line[6:])
                        if event.get('type') == 'COMPLETE':
                            result = event.get('result')
                            break
                    except json.JSONDecodeError:
                        continue
            
            return result
    except Exception as e:
        logger.error(f"Error scraping {source_url}: {str(e)}")
        return {"error": str(e)}

@api_router.get("/ai-concierge/events")
async def get_ai_concierge_events():
    """Get cached scraped events or return empty if not yet scraped"""
    cached = await db.scraped_events.find_one({"_id": "latest"}, {"_id": 0})
    if cached:
        # Reset scrape status to complete if we have data
        await db.scrape_status.update_one(
            {"_id": "current"},
            {"$set": {"status": "complete"}},
            upsert=True
        )
        return cached
    return {"solana": [], "cryptonomads": [], "ethglobal": [], "last_updated": None}

@api_router.post("/ai-concierge/scrape")
async def scrape_all_events(request: Request, background_tasks: BackgroundTasks):
    """Trigger scraping of all event sources (runs in background)"""
    if not TINYFISH_API_KEY:
        raise HTTPException(500, "TinyFish API key not configured")
    
    # Check if already scraping
    status = await db.scrape_status.find_one({"_id": "current"})
    if status and status.get("status") == "scraping":
        return {"status": "already_scraping", "message": "Scraping is already in progress"}
    
    # Mark as scraping
    await db.scrape_status.update_one(
        {"_id": "current"},
        {"$set": {"status": "scraping", "started_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True
    )
    
    # Run scraping in background
    background_tasks.add_task(run_scrape_task)
    
    return {"status": "started", "message": "Scraping started in background"}

async def run_scrape_task():
    """Background task to scrape all event sources"""
    try:
        results = {}
        for source in EVENT_SOURCES:
            logger.info(f"Scraping events from {source['name']}...")
            result = await scrape_events_from_source(source['url'])
            results[source['id']] = result if result else []
        
        # Cache results in database
        await db.scraped_events.update_one(
            {"_id": "latest"},
            {"$set": {
                **results,
                "last_updated": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        # Mark as complete
        await db.scrape_status.update_one(
            {"_id": "current"},
            {"$set": {"status": "complete", "completed_at": datetime.now(timezone.utc).isoformat()}}
        )
        logger.info("Scraping completed successfully")
    except Exception as e:
        logger.error(f"Scraping failed: {str(e)}")
        await db.scrape_status.update_one(
            {"_id": "current"},
            {"$set": {"status": "error", "error": str(e)}}
        )

@api_router.get("/ai-concierge/status")
async def get_scrape_status():
    """Get current scraping status"""
    status = await db.scrape_status.find_one({"_id": "current"}, {"_id": 0})
    return status or {"status": "idle"}

@api_router.get("/ai-concierge/sources")
async def get_event_sources():
    """Get list of event sources"""
    return EVENT_SOURCES

# --- Scout: Event Concierge & Web3 Opportunity Hunter ---

# BRAVE_API_KEY = os.environ.get('BRAVE_API_KEY', '')  # Commented out for future use

class ScoutSearchRequest(BaseModel):
    query: str
    count: int = 5

class ScoutEventRequest(BaseModel):
    sources: List[str]

class ScoutOpportunityRequest(BaseModel):
    sources: List[str]
    goal: str

async def duckduckgo_search(query: str, count: int = 5) -> List[str]:
    """Search DuckDuckGo HTML for URLs matching a query"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            response = await http_client.get(
                f"https://html.duckduckgo.com/html/?q={query}",
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
                },
                follow_redirects=True,
            )
            html = response.text
            import re
            from urllib.parse import unquote
            matches = re.findall(r'uddg=(https?[^"&]+)', html)
            urls = [unquote(m) for m in matches if 'duckduckgo.com' not in m]
            # Deduplicate by hostname
            seen = set()
            unique = []
            for url in urls:
                try:
                    from urllib.parse import urlparse
                    hostname = urlparse(url).hostname
                    if hostname and hostname not in seen:
                        seen.add(hostname)
                        unique.append(url)
                except Exception:
                    continue
            return unique[:count]
    except Exception as e:
        logger.error(f"DuckDuckGo search failed: {str(e)}")
        return []

# async def brave_search(query: str, count: int = 5) -> List[str]:
#     """Search Brave API for URLs — commented out for future use"""
#     try:
#         async with httpx.AsyncClient(timeout=15.0) as http_client:
#             response = await http_client.get(
#                 f"https://api.search.brave.com/res/v1/web/search?q={query}&count={count}",
#                 headers={
#                     "Accept": "application/json",
#                     "X-Subscription-Token": BRAVE_API_KEY,
#                 },
#             )
#             data = response.json()
#             return [r["url"] for r in data.get("web", {}).get("results", [])]
#     except Exception as e:
#         logger.error(f"Brave search failed: {str(e)}")
#         return []

@api_router.post("/scout/search-urls")
async def search_urls(data: ScoutSearchRequest):
    """Search the web for relevant URLs using DuckDuckGo"""
    urls = await duckduckgo_search(data.query, data.count)
    results = []
    for url in urls:
        try:
            from urllib.parse import urlparse
            hostname = urlparse(url).hostname
            results.append({"url": url, "name": hostname})
        except Exception:
            results.append({"url": url, "name": url})
    return {"urls": results}

async def scrape_url_with_goal(url: str, goal: str):
    """Scrape a URL with a specific goal using TinyFish API"""
    if not TINYFISH_API_KEY:
        return {"error": "TinyFish API key not configured"}
    try:
        async with httpx.AsyncClient(timeout=120.0) as http_client:
            response = await http_client.post(
                "https://agent.tinyfish.ai/v1/automation/run-sse",
                headers={
                    "X-API-Key": TINYFISH_API_KEY,
                    "Content-Type": "application/json",
                },
                json={"url": url, "goal": goal},
            )
            result = None
            for line in response.text.split('\n'):
                if line.startswith('data: '):
                    try:
                        event = json.loads(line[6:])
                        if event.get('type') == 'COMPLETE':
                            result = event.get('result')
                            break
                    except json.JSONDecodeError:
                        continue
            return result
    except Exception as e:
        logger.error(f"Error scraping {url}: {str(e)}")
        return {"error": str(e)}

@api_router.get("/scout/events")
async def get_scout_events():
    """Get cached scout event results"""
    cached = await db.scout_events.find_one({"_id": "latest"}, {"_id": 0})
    if cached:
        return cached
    return {"results": {}, "last_updated": None}

@api_router.post("/scout/events/scrape")
async def scrape_scout_events(data: ScoutEventRequest, background_tasks: BackgroundTasks):
    """Start scraping events from provided sources"""
    if not TINYFISH_API_KEY:
        raise HTTPException(500, "TinyFish API key not configured")
    status = await db.scout_events_status.find_one({"_id": "current"})
    if status and status.get("status") == "scraping":
        return {"status": "already_scraping"}
    await db.scout_events_status.update_one(
        {"_id": "current"},
        {"$set": {"status": "scraping", "started_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    background_tasks.add_task(run_scout_events_task, data.sources)
    return {"status": "started"}

async def run_scout_events_task(sources: List[str]):
    """Background task to scrape events from all provided sources"""
    goal = "Extract all events listed on this page. For each event return: event_name, event_description, start_date, end_date, event_time, event_location. Return as a JSON array."
    try:
        results = {}
        for url in sources:
            try:
                from urllib.parse import urlparse
                domain = urlparse(url).hostname or url
                logger.info(f"Scout: Scraping events from {domain}...")
                result = await scrape_url_with_goal(url, goal)
                results[domain] = result if result else []
            except Exception as e:
                logger.error(f"Scout: Error scraping {url}: {str(e)}")
                results[url] = []
        await db.scout_events.update_one(
            {"_id": "latest"},
            {"$set": {"results": results, "last_updated": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        await db.scout_events_status.update_one(
            {"_id": "current"},
            {"$set": {"status": "complete", "completed_at": datetime.now(timezone.utc).isoformat()}},
        )
    except Exception as e:
        logger.error(f"Scout events failed: {str(e)}")
        await db.scout_events_status.update_one(
            {"_id": "current"},
            {"$set": {"status": "error", "error": str(e)}},
        )

@api_router.get("/scout/events/status")
async def get_scout_events_status():
    status = await db.scout_events_status.find_one({"_id": "current"}, {"_id": 0})
    return status or {"status": "idle"}

@api_router.get("/scout/opportunities")
async def get_scout_opportunities():
    cached = await db.scout_opportunities.find_one({"_id": "latest"}, {"_id": 0})
    if cached:
        return cached
    return {"results": {}, "last_updated": None}

@api_router.post("/scout/opportunities/scrape")
async def scrape_scout_opportunities(data: ScoutOpportunityRequest, background_tasks: BackgroundTasks):
    """Start scraping opportunities from provided sources"""
    if not TINYFISH_API_KEY:
        raise HTTPException(500, "TinyFish API key not configured")
    status = await db.scout_opportunities_status.find_one({"_id": "current"})
    if status and status.get("status") == "scraping":
        return {"status": "already_scraping"}
    await db.scout_opportunities_status.update_one(
        {"_id": "current"},
        {"$set": {"status": "scraping", "started_at": datetime.now(timezone.utc).isoformat(), "goal": data.goal}},
        upsert=True,
    )
    background_tasks.add_task(run_scout_opportunities_task, data.sources, data.goal)
    return {"status": "started"}

async def run_scout_opportunities_task(sources: List[str], user_goal: str):
    """Background task to scrape opportunities from all provided sources"""
    goal = f"Find opportunities matching this goal: {user_goal}. Extract: title, description, company, location, salary/prize/amount if mentioned, deadline, url. Return as a JSON array."
    try:
        results = {}
        for url in sources:
            try:
                from urllib.parse import urlparse
                domain = urlparse(url).hostname or url
                logger.info(f"Scout: Searching opportunities at {domain}...")
                result = await scrape_url_with_goal(url, goal)
                results[domain] = result if result else []
            except Exception as e:
                logger.error(f"Scout: Error at {url}: {str(e)}")
                results[url] = []
        await db.scout_opportunities.update_one(
            {"_id": "latest"},
            {"$set": {"results": results, "goal": user_goal, "last_updated": datetime.now(timezone.utc).isoformat()}},
            upsert=True,
        )
        await db.scout_opportunities_status.update_one(
            {"_id": "current"},
            {"$set": {"status": "complete", "completed_at": datetime.now(timezone.utc).isoformat()}},
        )
    except Exception as e:
        logger.error(f"Scout opportunities failed: {str(e)}")
        await db.scout_opportunities_status.update_one(
            {"_id": "current"},
            {"$set": {"status": "error", "error": str(e)}},
        )

@api_router.get("/scout/opportunities/status")
async def get_scout_opportunities_status():
    status = await db.scout_opportunities_status.find_one({"_id": "current"}, {"_id": 0})
    return status or {"status": "idle"}

app.include_router(api_router)

# --- Seed Data ---
SAMPLE_EVENTS = [
    {
        "event_id": "evt_001", "title": "Seoul Web3 Builder Meetup",
        "description": "The largest Web3 builder community in Seoul. Connect with founders, developers, and investors shaping the future of the open web.",
        "date": "2025-03-15T18:00:00", "venue": "Startup Alliance Seoul",
        "city": "Seoul", "country": "South Korea", "lat": 37.5665, "lng": 126.9780,
        "capacity": 200, "attendee_count": 120, "category": "Meetup",
        "tags": ["Web3", "Networking", "Builders"],
        "funding_goal": 8000, "funding_raised": 5000,
        "milestones": [
            {"title": "Venue Booked", "completed": True, "amount": 2000},
            {"title": "Speakers Confirmed", "completed": True, "amount": 3000},
            {"title": "Event Day — Funds Released", "completed": False, "amount": 3000}
        ],
        "image_url": "https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=800&q=80",
        "organizer_name": "Jake Kim", "organizer_id": "org_001",
        "organizer_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=jake",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "event_id": "evt_002", "title": "Singapore DeFi Summit",
        "description": "Two days of DeFi protocol workshops, panels, and networking with Asia's top builders.",
        "date": "2025-04-22T09:00:00", "venue": "Marina Bay Sands Expo",
        "city": "Singapore", "country": "Singapore", "lat": 1.3521, "lng": 103.8198,
        "capacity": 500, "attendee_count": 380, "category": "Conference",
        "tags": ["DeFi", "Web3", "Conference"],
        "funding_goal": 50000, "funding_raised": 42000,
        "milestones": [
            {"title": "Venue Secured", "completed": True, "amount": 20000},
            {"title": "Speakers Booked", "completed": True, "amount": 15000},
            {"title": "Event Day — Funds Released", "completed": False, "amount": 15000}
        ],
        "image_url": "https://images.unsplash.com/photo-1752649938189-05463ebbe6bd?w=800&q=80",
        "organizer_name": "Sarah Chen", "organizer_id": "org_002",
        "organizer_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "event_id": "evt_003", "title": "Dubai Blockchain Week",
        "description": "The Middle East's premier blockchain and Web3 event. A week of summits, hackathons, and deal-making.",
        "date": "2025-05-10T10:00:00", "venue": "Dubai World Trade Centre",
        "city": "Dubai", "country": "UAE", "lat": 25.2048, "lng": 55.2708,
        "capacity": 1000, "attendee_count": 750, "category": "Conference",
        "tags": ["Blockchain", "Web3", "NFT"],
        "funding_goal": 100000, "funding_raised": 85000,
        "milestones": [
            {"title": "Venue Secured", "completed": True, "amount": 40000},
            {"title": "Sponsors Locked", "completed": True, "amount": 40000},
            {"title": "Event Day — Funds Released", "completed": False, "amount": 20000}
        ],
        "image_url": "https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=800&q=80",
        "organizer_name": "Ahmed Al-Rashid", "organizer_id": "org_003",
        "organizer_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "event_id": "evt_004", "title": "Lisbon AI Conference",
        "description": "Exploring the intersection of AI and decentralized systems. Europe's hottest AI x Web3 event.",
        "date": "2025-06-18T09:00:00", "venue": "Centro de Congressos de Lisboa",
        "city": "Lisbon", "country": "Portugal", "lat": 38.7223, "lng": -9.1393,
        "capacity": 300, "attendee_count": 210, "category": "Conference",
        "tags": ["AI", "Web3", "Research"],
        "funding_goal": 30000, "funding_raised": 22000,
        "milestones": [
            {"title": "Venue Booked", "completed": True, "amount": 10000},
            {"title": "Speakers Confirmed", "completed": True, "amount": 12000},
            {"title": "Event Day — Funds Released", "completed": False, "amount": 8000}
        ],
        "image_url": "https://images.unsplash.com/photo-1752649938189-05463ebbe6bd?w=800&q=80",
        "organizer_name": "Ana Ferreira", "organizer_id": "org_004",
        "organizer_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "event_id": "evt_005", "title": "Denver Tech Festival",
        "description": "The Rocky Mountain tech scene's biggest annual gathering. Startups, VCs, and makers.",
        "date": "2025-07-25T11:00:00", "venue": "Colorado Convention Center",
        "city": "Denver", "country": "USA", "lat": 39.7392, "lng": -104.9903,
        "capacity": 800, "attendee_count": 600, "category": "Festival",
        "tags": ["Tech", "AI", "Startup"],
        "funding_goal": 75000, "funding_raised": 60000,
        "milestones": [
            {"title": "Venue Locked", "completed": True, "amount": 25000},
            {"title": "Lineup Announced", "completed": True, "amount": 30000},
            {"title": "Event Day — Funds Released", "completed": False, "amount": 20000}
        ],
        "image_url": "https://images.unsplash.com/photo-1749723477883-4e3dde4e3a28?w=800&q=80",
        "organizer_name": "Mike Johnson", "organizer_id": "org_005",
        "organizer_avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

SAMPLE_COMMUNITIES = [
    {"community_id": "com_001", "name": "Seoul Builders", "member_count": 2840, "upcoming_events_count": 3, "tags": ["Web3", "Builders", "Korea"], "description": "Go-to community for Seoul's tech and Web3 builders."},
    {"community_id": "com_002", "name": "ETH Hackers", "member_count": 5200, "upcoming_events_count": 5, "tags": ["Ethereum", "Hackathon", "DeFi"], "description": "Global community for Ethereum developers and hackers."},
    {"community_id": "com_003", "name": "AI x Crypto", "member_count": 3100, "upcoming_events_count": 2, "tags": ["AI", "Web3", "Research"], "description": "Exploring AI and blockchain convergence."},
    {"community_id": "com_004", "name": "Indie Music Seoul", "member_count": 1200, "upcoming_events_count": 4, "tags": ["Music", "Seoul", "Culture"], "description": "Seoul's independent music scene."},
    {"community_id": "com_005", "name": "Web3 Women Korea", "member_count": 890, "upcoming_events_count": 2, "tags": ["Web3", "Women", "Korea"], "description": "Empowering women in Korean Web3 and tech."},
    {"community_id": "com_006", "name": "DeFi Asia", "member_count": 4500, "upcoming_events_count": 6, "tags": ["DeFi", "Asia", "Finance"], "description": "Asia's largest DeFi community. Singapore to Seoul."},
]

@app.on_event("startup")
async def seed_database():
    if await db.events.count_documents({}) == 0:
        await db.events.insert_many(SAMPLE_EVENTS)
        logger.info("Seeded events")
    if await db.communities.count_documents({}) == 0:
        await db.communities.insert_many(SAMPLE_COMMUNITIES)
        logger.info("Seeded communities")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
