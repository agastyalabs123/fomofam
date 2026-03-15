from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
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
