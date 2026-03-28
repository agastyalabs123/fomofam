# FomoFam PRD — Event Discovery & Management Platform

## Problem Statement
Build a cinematic, scroll-choreographed event discovery and management platform called "FomoFam" — tagline: "Discover. Fund. Attend. On-Chain." Production-ready quality with Apple-level animation design.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Framer Motion + React-Leaflet
- **Backend**: FastAPI + Motor (async MongoDB driver)
- **Database**: MongoDB (local)
- **Auth**: JWT (email/password) + Google OAuth (Emergent Auth)
- **Maps**: Leaflet + OpenStreetMap (no API key)

## User Personas
1. **Event Attendees** — Discover and attend events, build reputation
2. **Event Organizers** — Create events with milestone-based fundraising
3. **Sponsors** — Back events with escrow-protected funds
4. **Community Members** — Join interest-based communities

## What's Been Implemented

### REDESIGN (March 2026) — Black & White Glassmorphism
- Pure #0A0A0A black background, heavy glassmorphism on all elements
- Three.js 3D globe (vanilla, no r3f) with wireframe grid, city pins, atmospheric glow, continent texture overlay
- Satoshi font (Fontshare CDN) for ultra-bold display headings
- Dark CartoDB map tiles (black world map with white pulsing pins)

### Profile Page (March 2026)
- Full profile page at /profile route (protected, login required)
- Circular profile avatar button in navbar (logged-in users only)
- Profile header with avatar, name, email, join date, role badge
- Three tabs: Profile, My Events, Settings
- Role Selection Modal for new users (Attendee, Organizer, Sponsor)
- Backend APIs: PUT /api/user/profile, PUT /api/user/password, GET /api/user/events, PUT /api/user/roles

### Create Event Page (March 2026)
- Event creation form with dropdowns and Shadcn Calendar integration
- Backend APIs: POST /api/events, POST /api/events/create

### Scout Page (March 2026)
- Two tabs: Event Concierge, Opportunity Hunter
- Source management (add/remove custom URLs)
- Background web scraping via TinyFish API with polling (BackgroundTasks)
- Clean layout without 3D animation (simplified per user request, March 28 2026)

### Backend (`/app/backend/server.py`)
- JWT auth: POST /api/auth/register, /api/auth/login, /api/auth/logout
- Google OAuth: POST /api/auth/google/callback (Emergent Auth)
- Auth middleware: GET /api/auth/me (cookie + bearer token)
- Events CRUD: GET /api/events, GET /api/events/:id, POST /api/events
- Communities: GET /api/communities, POST /api/communities/:id/join
- Scout: GET/POST /api/scout/events, /api/scout/opportunities (with /scrape and /status)
- Waitlist: POST /api/waitlist
- Seeded: 5 events, 6 communities

### Frontend Sections
- Navbar, HeroSection, ExploreSection, CreateEventsSection
- CommunitySection (Coming Soon), ForOrganizersSection
- ReputationSection, EventTypesSection, Footer, AuthModal

## Design System
- **Primary**: #FF6B4A (coral/orange)
- **Background**: #0A0A0A (deep black)
- **Typography**: Satoshi (headings) + Inter (body)
- **Animations**: Framer-motion scroll reveals, floating cards

## Prioritized Backlog

### P0 (Critical)
- [x] User profile page
- [x] Event creation flow
- [x] Scout page (Event Concierge + Opportunity Hunter)
- [ ] Backend refactoring (server.py -> routes/)

### P1 (Important)
- [ ] Communities section (functional, remove Coming Soon)
- [ ] Event Details Page (clicking events -> detailed view)
- [ ] Event search/full-text search

### P2 (Nice-to-have)
- [ ] Interactive map with dynamic event loading
- [ ] Sponsor application flow
- [ ] Event RSVP/registration
- [ ] Mobile PWA manifest

### P3 (Backlog)
- [ ] Reputation system UI/UX
- [ ] Email notifications
- [ ] Community chat/forum
- [ ] On-chain reputation verification
- [ ] Analytics dashboard for organizers

## Test Results
- Backend: 100% (19/19 tests pass) — March 28, 2026
- Frontend: 100% (all tested features work) — March 28, 2026
