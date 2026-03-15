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

## What's Been Implemented (March 2025)

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
- [ ] Event creation flow (authenticated form)
- [ ] User dashboard with attended/created events
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
