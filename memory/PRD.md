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

## What's Been Implemented (March 2025 → Updated March 2026)

### REDESIGN (March 2026) — Black & White Glassmorphism
- Pure #0A0A0A black background, heavy glassmorphism on all elements
- Three.js 3D globe (vanilla, no r3f) with wireframe grid, city pins, atmospheric glow
- Satoshi font (Fontshare CDN) for ultra-bold display headings
- Dark CartoDB map tiles (black world map with white pulsing pins)
- New section structure: Hero(Globe) → Explore → Create Events → Communities(Coming Soon) → For Organizers → Reputation → Event Types → Footer
- Communities section with "Coming Soon" glassmorphism badge + "Launching Q2 2026" label
- CreateEventsSection merged with HowItWorks + EventDetail into one powerful section
- Community button in navbar disabled with red "COMING SOON" badge

### Profile Page (March 2026)
- ✅ Full profile page at /profile route (protected, login required)
- ✅ Circular profile avatar button in navbar (logged-in users only)
- ✅ Profile header with avatar, name, email, join date, role badge
- ✅ Three tabs: Profile, My Events, Settings
- ✅ Profile tab: Personal information display + edit functionality
- ✅ Reputation Stats section with "COMING SOON" badge (placeholder for future)
- ✅ My Events tab: Events created and attended by user
- ✅ Settings tab: Change password form (disabled for Google OAuth users)
- ✅ Backend APIs: PUT /api/user/profile, PUT /api/user/password, GET /api/user/events

### Bug Fixes (March 2026)
- ✅ Fixed auth modal centering (was appearing at bottom/side)
- ✅ Fixed Leaflet map z-index (was appearing over auth modal)

### Backend (`/app/backend/server.py`)
- ✅ JWT auth: POST /api/auth/register, /api/auth/login, /api/auth/logout
- ✅ Google OAuth: POST /api/auth/google/callback (Emergent Auth)
- ✅ Auth middleware: GET /api/auth/me (cookie + bearer token)
- ✅ Events CRUD: GET /api/events, GET /api/events/:id, POST /api/events
- ✅ Communities: GET /api/communities, POST /api/communities/:id/join
- ✅ Waitlist: POST /api/waitlist
- ✅ Seeded: 5 events (Seoul, Singapore, Dubai, Lisbon, Denver), 6 communities

### Frontend Sections
- ✅ Navbar — sticky glassmorphism, responsive mobile menu
- ✅ HeroSection — word-by-word text animation, 3 floating event cards, stats, scroll indicator
- ✅ MapSection — Leaflet + OpenStreetMap, coral pulsing pins, 9 filter tags, event cards list
- ✅ EventDetailSection — Seoul Web3 Builder Meetup showcase, animated progress bar, milestone tracker, sponsor avatars
- ✅ HowItWorksSection — 3-step flow (Propose, Fund, Attend), staggered reveal
- ✅ CommunitySection — 6 community cards from API, join button, stagger animation
- ✅ ForOrganizersSection — 3 pain-point cards, pulsing CTA
- ✅ ReputationSection — 3 profile cards (Attendee, Organizer, Sponsor) with 3D tilt hover
- ✅ EventTypesSection — 8 event type cards (grid on desktop, horizontal scroll mobile)
- ✅ Footer — email waitlist, social icons, "Powered by Agastya Labs"
- ✅ AuthModal — Login/Register tabs + Google OAuth button

## Design System
- **Primary**: #FF6B4A (coral/orange)
- **Secondary**: #1A1A2E (deep navy)
- **Background**: #FAFAFA (off-white)
- **Typography**: Outfit (headings) + Inter (body)
- **Animations**: Framer-motion scroll reveals, floating cards, stagger children

## Core Requirements (Static)
- Cinematic scroll experience
- Leaflet interactive map with event pins
- Sponsorship escrow milestone tracker
- Community cards
- JWT + Google OAuth
- Email waitlist storage
- "Powered by Agastya Labs" in footer

## Prioritized Backlog

### P0 (Critical for launch)
- [x] User profile page with personal info, event history, settings
- [ ] Event creation flow (authenticated form)
- [ ] Reputation score display on profile

### P1 (Important)
- [ ] Event search/full-text search
- [ ] Sponsor application flow
- [ ] Event registration/RSVP
- [ ] Mobile PWA manifest

### P2 (Nice-to-have)
- [ ] Email notifications on waitlist join
- [ ] Community chat/forum
- [ ] On-chain reputation verification
- [ ] Analytics dashboard for organizers
- [ ] Event recommendations based on interests

## Test Results (March 2025)
- Backend: 100% (15/15 tests pass)
- Frontend: 95% (filter bug fixed — bidirectional tag matching)
