# PairSpace — Complete Setup, Configuration & Technical Documentation
## A → Z Coverage — Everything You Need to Build, Run, and Ship

---

## TABLE OF CONTENTS

1. [Prerequisites & System Requirements](#1-prerequisites--system-requirements)
2. [Local Development Setup](#2-local-development-setup)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Database Setup & Migrations](#4-database-setup--migrations)
5. [Demo Data & Testing Accounts](#5-demo-data--testing-accounts)
6. [Architecture Deep Dive](#6-architecture-deep-dive)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend Architecture](#8-backend-architecture)
9. [Real-time System (Socket.IO)](#9-real-time-system-socketio)
10. [Feature Implementation Guide](#10-feature-implementation-guide)
11. [API Reference — All 29 Route Groups](#11-api-reference)
12. [Security Model](#12-security-model)
13. [Scheduled Jobs Reference](#13-scheduled-jobs-reference)
14. [Performance Guide](#14-performance-guide)
15. [Testing Guide](#15-testing-guide)
16. [Deployment — Render, Docker, VPS](#16-deployment)
17. [Troubleshooting](#17-troubleshooting)
18. [Extending PairSpace](#18-extending-pairspace)
19. [Known Limitations & Roadmap](#19-known-limitations--roadmap)

---

## 1. PREREQUISITES & SYSTEM REQUIREMENTS

### Development Machine
| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20.x+ | LTS recommended |
| npm | 9.x+ | Uses workspaces |
| Git | Any | For cloning |
| MongoDB | Atlas free / local 6+ | See Database Setup |
| OS | macOS / Linux / Windows WSL2 | Windows native untested |

### Production Server (minimum)
| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 512MB | 1GB+ |
| CPU | 1 vCPU | 2 vCPU |
| Storage | 1GB | 10GB (for media uploads) |
| Node.js | 20.x | 20.x LTS |

---

## 2. LOCAL DEVELOPMENT SETUP

### Step 1: Clone and Install

```bash
git clone https://github.com/your-org/pairspace.git
cd PairSpace

# Install all workspaces (apps/web + services/api + root)
npm install
```

This installs ~800MB of dependencies across all workspaces. First install takes 2–3 minutes.

### Step 2: Create Environment Files

**Backend** (`services/api/.env`):
```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/pairspace?retryWrites=true&w=majority
JWT_SECRET=your_256_bit_secret_here
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
MAX_FILE_SIZE_MB=50
RETENTION_DAYS_DELETED=30
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Frontend** (`apps/web/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

In development, `VITE_API_URL` is optional. The Vite dev server proxies `/api/*` to `localhost:5000` automatically (`vite.config.js` `proxy` setting).

### Step 3: Seed Demo Data

```bash
node scripts/seedDemoData.js
```

Output:
```
🌱 Connected to MongoDB
🧹 Cleaning up existing demo data...
👤 Creating demo users...
🔗 Creating relationships...
💬 Seeding messages (100)...
📸 Seeding memories (25)...
📅 Seeding plans (15)...
📓 Seeding journal entries (10)...
🎁 Seeding gifts (6)...
⏳ Seeding time capsules (3)...
🔔 Seeding notifications (20)...
🌤️ Seeding mood entries...
✅ Demo data seeded successfully!

Login credentials:
  parth.demo@example.com  /  Demo@123
  alex.demo@example.com   /  Demo@123
```

### Step 4: Run

```bash
# Both frontend and backend simultaneously:
npm run dev

# Or separately in two terminals:
npm run dev:api   # Backend on http://localhost:5000
npm run dev:web   # Frontend on http://localhost:5173
```

### Step 5: Verify

Visit `http://localhost:5173` → you should see the PairSpace landing page.
Check backend health: `curl http://localhost:5000/health` → `{"status":"ok"}`

---

## 3. ENVIRONMENT VARIABLES REFERENCE

### Backend (`services/api/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | HTTP server port |
| `MONGO_URI` | **Yes** | — | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | **Yes** | — | JWT signing secret. Min 32 chars. Use `openssl rand -hex 64` |
| `NODE_ENV` | No | development | `development` or `production` |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | CORS allowed origins (comma-separated) |
| `MAX_FILE_SIZE_MB` | No | 50 | Maximum media upload size in MB |
| `RETENTION_DAYS_DELETED` | No | 30 | Days before soft-deleted items are hard-purged |
| `SENTRY_DSN` | No | — | Sentry error tracking DSN (production only) |
| `TURN_SERVER_URL` | No | — | WebRTC TURN server URL (e.g. `turn:yourserver.com:3478`) |
| `TURN_USERNAME` | No | — | TURN server credential username |
| `TURN_CREDENTIAL` | No | — | TURN server credential password |

### Frontend (`apps/web/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No (dev) | `""` (proxy) | Backend URL. Required in production. |
| `VITE_SOCKET_URL` | No (dev) | `""` (proxy) | Socket.IO URL. Usually same as API URL. |
| `VITE_MEDIA_URL` | No | Same as VITE_API_URL | Override if media is served from a CDN |

### Environment Precedence

```
apps/web/.env.local         ← highest (git-ignored)
apps/web/.env.development   ← dev only
apps/web/.env               ← base
apps/web/.env.production    ← production only
```

---

## 4. DATABASE SETUP & MIGRATIONS

### MongoDB Atlas Setup (Free Tier)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster (512MB)
3. Database Access → Add Database User (username + password)
4. Network Access → Add IP → `0.0.0.0/0` (or your server IP for production)
5. Connect → Drivers → Copy connection string
6. Replace `<password>` with your password → set as `MONGO_URI`

### Local MongoDB

```bash
# macOS (Homebrew)
brew tap mongodb/brew && brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# MONGO_URI for local:
MONGO_URI=mongodb://localhost:27017/pairspace
```

### Automatic Migrations

Migrations run automatically on every server startup. The migration runner checks `_migrations` collection:

```
Migration 001: Create chat message indexes
Migration 002: Add memory emotion tags
Migration 003: Add notification delivery fields
Migration 004: Add journal visibility fields
Migration 005: Add plan recurrence
Migration 006: Add gift reveal animation
Migration 007: Add journal response types
Migration 008: Add gift opened field
Migration 009: Add memory lockPin field (privacy locking)
Migration 010: Add user role field (admin access control)
```

Each migration is idempotent — safe to run multiple times.

### Database Indexes

Created automatically via `services/api/src/config/indexes.js`:

```javascript
// Messages — primary access pattern
{ relationshipId: 1, createdAt: 1 }     // timeline pagination
{ content: "text" }                      // full-text search

// Memories
{ relationshipId: 1, memoryDate: -1 }   // timeline
{ pinned: -1, memoryDate: -1 }          // pinned-first display

// Notifications
{ userId: 1, read: 1, createdAt: -1 }  // unread first
{ scheduledFor: 1 }                     // cron delivery

// Plans
{ relationshipId: 1, status: 1, dueDate: 1 }  // planner view
```

### Backup & Restore

```bash
# Backup all demo data to JSON files
node scripts/backupMongo.js

# Restore from backup
node scripts/restoreBackup.js

# GDPR: purge soft-deleted items older than RETENTION_DAYS_DELETED
node scripts/retentionCleanup.js

# Verify all indexes exist
node scripts/verifyIndexes.js

# Check data integrity (orphan cleanup)
node scripts/checkDataIntegrity.js
```

---

## 5. DEMO DATA & TESTING ACCOUNTS

### Seed Script

`scripts/seedDemoData.js` creates a rich, realistic demo environment:

**Demo Accounts:**
| Name | Email | Password | Role |
|------|-------|----------|------|
| Parth | `parth.demo@example.com` | `Demo@123` | user |
| Alex | `alex.demo@example.com` | `Demo@123` | user |

**What's seeded:**
- 1 active romantic relationship (30 days together)
- 100 realistic chat messages with varied types
- 25 memories (photos, milestones, voice notes, text)
- 15 plans (habits, events, goals with streaks)
- 10 journal entries (shared, private, future-dated)
- 6 gifts (instant, countdown, scheduled)
- 3 time capsules (1 open, 1 locked, 1 unlocking soon)
- 20 notifications (mix of read/unread types)
- 2 mood check-in entries (today)
- AI insights, relationship insights, stories
- User settings with theme and preferences

**Reset demo data:**
```bash
node scripts/resetDemoData.js
```

**Custom seed** — modify the constants at the top of `seedDemoData.js`:
```javascript
const DEMO_EMAILS = ["parth.demo@example.com", "alex.demo@example.com"];
const RELATIONSHIP_DAYS_AGO = 30;   // how long they've been together
const MESSAGE_COUNT = 100;           // number of messages to seed
```

---

## 6. ARCHITECTURE DEEP DIVE

### System Overview

```
                    ┌──────────────────────────────────────┐
                    │           Browser (React)            │
                    │  RelationshipProvider (context)      │
                    │  ├─ NotificationContext              │
                    │  ├─ CallProvider (WebRTC)            │
                    │  └─ SyncProvider (offline queue)     │
                    └──────────┬────────────┬─────────────┘
                               │ HTTP/REST  │ WS/Socket.IO
                    ┌──────────▼────────────▼─────────────┐
                    │         Express Server               │
                    │  authMiddleware (JWT verify)         │
                    │  rateLimiter                         │
                    │  globalErrorHandler                  │
                    │  ├─ 29 REST route groups             │
                    │  └─ 6 Socket.IO namespaces           │
                    └──────────┬──────────────────────────┘
                               │ Mongoose ODM
                    ┌──────────▼──────────────────────────┐
                    │         MongoDB Atlas                │
                    │  20 collections, 15 indexes          │
                    └─────────────────────────────────────┘
```

### Request Lifecycle

```
Browser → Vite proxy (dev) / CDN (prod)
       → Express authMiddleware (JWT decode → req.user.userId)
       → rateLimiter (check Redis-less in-memory counter)
       → Route handler
          → verifyRelationshipMember (IDOR protection)
          → Business logic
          → MongoDB via Mongoose
          → JSON response
       → globalErrorHandler (catches unhandled throws)
```

### Data Isolation Model

Every piece of data has a `relationshipId` field. Every endpoint that accesses relationship data calls `verifyRelationshipMember(relationshipId, userId)` which confirms the requesting user belongs to that relationship. Cross-relationship data access returns 403.

---

## 7. FRONTEND ARCHITECTURE

### Directory Structure

```
apps/web/src/
├── App.jsx                    # Router with all 30 routes
├── main.jsx                   # React root, strict mode
├── index.css                  # Imports theme.css only
├── styles/
│   └── theme.css              # SINGLE design token source
│
├── pages/                     # 30 page-level components
│   ├── Login.jsx, Signup.jsx  # Auth pages (Lovable theme)
│   ├── OnboardingFlow.jsx     # 5-step onboarding
│   ├── InvitePartner.jsx      # Invite flow
│   ├── PendingInviteSent/Received.jsx
│   ├── RelationshipHomeUltra.jsx  # Main dashboard
│   ├── ChatPageUltra.jsx      # Real-time chat
│   ├── TimelinePageUltra.jsx  # Memory timeline
│   ├── ActivityPageUltra.jsx  # Watch/focus sessions
│   ├── GiftGalleryUltra.jsx   # Digital gifts
│   ├── JournalPageUltra.jsx   # Shared journal
│   ├── TimeCapsulePageUltra.jsx
│   ├── PlannerPage.jsx        # Habits/events/goals
│   ├── GamesPage.jsx          # Couple games
│   ├── InsightsPage.jsx       # AI insights
│   ├── StoryPage.jsx          # AI story
│   ├── SettingsPage.jsx       # Settings + Danger Zone
│   ├── PersonalizationPage.jsx
│   ├── SearchPage.jsx
│   └── RelationshipListPage.jsx
│
├── features/                  # 32 feature-scoped modules
│   ├── activity/              # useActivity, ActivityPlayerUltra, ActivityControlBarUltra
│   ├── call/                  # useCall, CallScreen, IncomingCallModal
│   ├── chat/                  # MessageBubble, MessageList, MessageInput, TypingIndicator
│   ├── gifts/                 # GiftCard, GiftRevealModal (with countdown)
│   ├── heartbeat/             # HeartbeatButton (with cooldown + particles)
│   ├── mood/                  # MoodCheckIn
│   ├── timezone/              # TimezoneBridge
│   ├── memory/                # MemoryCard, MemoryCreateModal, MemoryDetailModal
│   ├── notification/          # useNotifications, ToastContainer, NotificationBell
│   ├── offline/               # SyncProvider, offlineDB, useSyncQueue
│   ├── presence/              # usePresence, StatusSelector
│   ├── planner/               # HabitTracker, CalendarView, PlanCard
│   ├── games/                 # useGame, GameBoard
│   ├── privacy/               # DataExportPanel, SessionManager, PrivacySettings
│   ├── relationship/          # RelationshipSwitcher, RelationshipCard
│   └── ...more
│
├── context/
│   ├── RelationshipProvider.jsx   # Single fetch, all pages consume useRelationship()
│   ├── CallProvider.jsx           # WebRTC state, toast on error
│   └── NotificationContext.js     # Shared context (no circular imports)
│
├── socket/                    # One factory file per namespace
│   ├── chatSocket.js          # → /chat
│   ├── presenceSocket.js      # → /presence
│   ├── callSocket.js          # → /call
│   ├── gameSocket.js          # → /game
│   ├── activitySocket.js      # → /activity
│   └── notificationSocket.js  # → /notification
│
├── services/
│   ├── api.js                 # Axios instance with JWT interceptor + 401 redirect
│   ├── auth/authService.js    # login, signup, logout, 401 handler
│   └── relationship/          # relationshipService, relationshipContext
│
├── components/
│   ├── AppShell.jsx           # App wrapper: Notification + Relationship + Call + Sync
│   ├── ProtectedRoute.jsx     # JWT check + onboarding gate + sessionStorage cache
│   ├── PartnerAvatar.jsx      # Themed gradient avatar with heartbeat pulse
│   ├── RelationshipBadge.jsx  # Relationship type pill badge
│   ├── FirstConnectionCelebration.jsx  # Confetti on first pair-up
│   └── ui/
│       ├── ConfirmModal.jsx   # Replaces all native confirm() calls
│       └── Modal.jsx
│
├── hooks/
│   ├── useCurrentUserId.js    # Decode JWT → userId
│   └── useAnalytics.js
│
└── utils/
    ├── motionPresets.js       # Framer Motion variant presets
    ├── soundEffects.js        # Web Audio API sound helpers
    └── motionConfig.js
```

### Design Token System

`styles/theme.css` is the **single source of truth**. Every color, spacing, animation, and effect is a CSS variable:

```css
/* Backgrounds */
--bg-primary: #120a17;          /* Deep intimate night */
--bg-secondary: #1c1024;
--bg-tertiary: #271533;
--bg-elevated: #32194a;

/* Accents */
--accent-love: #ff5d7e;         /* Warm rose/coral */
--accent-dream: #a855f7;        /* Violet/orchid */
--accent-glow: #ffc163;         /* Gold (milestones) */

/* Typography */
--font-display: 'Fraunces';     /* Romantic italic display */
--font-heading: 'Poppins';
--font-body: 'Inter';

/* Motion */
--motion-bounce: 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
--motion-spring: 0.5s cubic-bezier(0.22, 1, 0.36, 1);
```

### RelationshipProvider Pattern

```jsx
// ONE fetch on app load. Every page consumes via hook:
const { rel, loading, refresh, switchRelationship } = useRelationship();

// Before (broken — 3× duplicate fetches):
// AppShell → getMyRelationship()
// RelationshipHomeUltra → getMyRelationship()
// ChatPageUltra → getMyRelationship()

// After (fixed — shared context):
// AppShell wraps everything in <RelationshipProvider>
// All children call useRelationship() → same data, zero extra fetches
```

### Optimistic Messaging Pattern

```jsx
// Message appears IMMEDIATELY in the UI:
const optimisticMsg = { _id: `temp_${Date.now()}`, content, status: "sending", _optimistic: true };
setMessages(prev => [...prev, optimisticMsg]);

// When socket echo arrives, replace or remove the optimistic:
socket.on("receive_message", (msg) => {
  setMessages(prev => {
    const withoutOptimistic = prev.filter(m => !m._optimistic);
    return prev.find(m => m._id === msg._id) ? prev : [...withoutOptimistic, msg];
  });
});
```

### Offline Queue

```
User types + sends → isOnline check →
  Online: socket.emit(send_message) + optimistic echo
  Offline: enqueue to IndexedDB (deduped by tempId)
           Message shows amber "Queued" indicator

Reconnect → useSyncQueue drains IndexedDB →
  POST /api/sync/batch (all pending actions)
  Server processes in order
  No duplicates (deduplicateQueue removes by actionType+entityId)
```

---

## 8. BACKEND ARCHITECTURE

### Module Structure

Each of the 25 modules follows this pattern:

```
modules/feature/
├── feature.model.js       # Mongoose schema + indexes
├── feature.controller.js  # Business logic functions
├── feature.routes.js      # Express router + auth middleware
└── feature.socket.js      # Socket.IO namespace handler (optional)
```

### Server Startup Sequence

```javascript
// services/api/src/server.js

1. Import all 25 route modules + 6 socket modules
2. Initialize Sentry (production only)
3. Create Express app + apply middleware:
   - Helmet (security headers)
   - CORS
   - requestLogger
   - rateLimiter (three tiers)
   - JSON body parser
   - Multipart (Multer for file uploads)
4. Mount 29 route groups (app.use("/api/...", router))
5. Register 404 + globalErrorHandler
6. Create HTTP server
7. connectDB() → MongoDB Atlas
   └── runMigrations() (idempotent, runs every time)
   └── ensureIndexes()
   └── initSocket(httpServer)
       └── mount 6 Socket.IO namespaces
   └── initScheduler(io)     → 1-min + 5-min crons
   └── initInsightScheduler() → Sunday 8am cron
   └── initAnniversaryScheduler() → Daily 8am cron
   └── initPlugins()         → load /plugins/* (registry only)
8. httpServer.listen(PORT)
```

### Error Handling

```javascript
// Every controller wraps in try/catch:
export const createMemory = async (req, res) => {
  try {
    const rel = await verifyRelationshipMember(relationshipId, userId);
    if (!rel) return res.status(403).json({ error: true, message: "Access denied" });
    // ...
  } catch (err) {
    logger.error("createMemory failed", { error: err.message });
    res.status(500).json({ error: true, message: "Server error" });
  }
};

// Global catch-all for unhandled throws:
app.use(globalErrorHandler); // logs + returns 500
```

### Shared Utilities

```javascript
// shared/utils/relationshipValidator.js
export const verifyRelationshipMember = async (relationshipId, userId) => {
  const rel = await Relationship.findById(relationshipId);
  if (!rel || rel.status !== "active") return null;
  const isMember = rel.user1Id.toString() === userId
                || rel.user2Id.toString() === userId;
  return isMember ? rel : null;
};

export const getPartnerId = (rel, userId) =>
  rel.user1Id.toString() === userId
    ? rel.user2Id.toString()
    : rel.user1Id.toString();
```

---

## 9. REAL-TIME SYSTEM (SOCKET.IO)

### 6 Namespaces

| Namespace | Purpose | Auth | Room Pattern |
|-----------|---------|------|--------------|
| `/chat` | Messages, reactions, typing | JWT | `relationship_${id}` |
| `/presence` | Online/offline/status | JWT | `user_${id}` |
| `/call` | WebRTC signaling | JWT | `call_${id}` |
| `/game` | Turn-based games | JWT | `game_${id}` |
| `/activity` | Watch/focus sync | JWT | `activity_${id}` |
| `/notification` | Notification delivery | JWT | `user_notification_${id}` |

### Authentication Flow

All namespaces use the same JWT middleware:
```javascript
io.of("/chat").use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("auth_required"));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.userId = decoded.userId;
  next();
});
```

### Watch-Together Sync Protocol

```
Parth creates activity → creates Activity doc, status: "created"
Parth sends activity_invite via /chat namespace

Alex receives invite → joins via /activity namespace

Backend:
  1. activity_join received
  2. Alex joins room
  3. Backend emits activity_request_position to Parth (not Alex)
  4. Alex receives stale DB state as immediate starting point

Parth's useActivity handles activity_request_position:
  1. Reads playerRef.current.currentTime (LIVE value)
  2. Emits activity_position_report { activityId, currentTime, paused }

Backend:
  1. Receives activity_position_report from Parth
  2. Emits activity_sync_correct to Alex (the joiner)
  3. Updates DB with live currentTime

Alex's player:
  1. Receives activity_sync_correct
  2. Seeks to live position
  3. Starts playing ← NOW IN SYNC with Parth

During playback (every 5s):
  Parth emits activity_sync_ping { currentTime }
  Backend: updates DB + echoes to Alex
  Alex: corrects if drift > 0.5s
```

### Call WebRTC Protocol

```
Parth.startCall("video"):
  1. Register socket.once("call_initiated") ← BEFORE emitting (race fix)
  2. socket.emit("call_initiate", { relationshipId, callType })

Backend:
  1. Creates Call doc (status: "ringing")
  2. Emits call_incoming to Alex
  3. Emits call_initiated to Parth (includes iceServers)
  4. Starts 30-second timeout timer

Parth receives call_initiated:
  1. Creates RTCPeerConnection with iceServers
  2. Creates SDP offer
  3. socket.emit("call_offer", { offer, callId })

Alex receives call_incoming:
  1. Shows IncomingCallModalUltra
  2. Alex accepts → socket.emit("call_answer")
  3. Creates RTCPeerConnection
  4. Receives offer → creates answer → socket.emit("call_answer_sdp")

ICE candidates exchanged via call_ice_candidate events
Peer connection established → P2P media flow begins

If Alex doesn't answer in 30s:
  Backend: marks Call as "missed"
  Backend: emits call_missed to both
  Both UIs: return to IDLE with "Call wasn't answered" toast
```

---

## 10. FEATURE IMPLEMENTATION GUIDE

### Adding a New Feature

1. **Create the module:**
```bash
mkdir modules/my-feature
touch modules/my-feature/my-feature.model.js
touch modules/my-feature/my-feature.controller.js
touch modules/my-feature/my-feature.routes.js
```

2. **Register routes in `server.js`:**
```javascript
import myFeatureRouter from "../../../modules/my-feature/my-feature.routes.js";
// ...
app.use("/api/my-feature", myFeatureRouter);
```

3. **Create the frontend service:**
```javascript
// apps/web/src/features/my-feature/myFeatureService.js
import api from "../../services/api.js";
export const createItem = (data) => api.post("/api/my-feature", data).then(r => r.data);
```

4. **Create the React feature component:**
```jsx
// apps/web/src/features/my-feature/MyFeature.jsx
import { useRelationship } from "../../context/RelationshipProvider.jsx";
export default function MyFeature() {
  const { rel } = useRelationship(); // relationship from shared context
  // ...
}
```

5. **Add to App.jsx routing if needed.**

### Adding a Socket Event

```javascript
// Backend (in namespace handler):
socket.on("my_event", async (data) => {
  try {
    // validate membership
    const rel = await verifyRelationshipMember(data.relationshipId, socket.userId);
    if (!rel) return socket.emit("error", { message: "Access denied" });
    // process
    socket.to(ROOM(data.relationshipId)).emit("my_event_broadcast", processedData);
  } catch { /* non-critical */ }
});

// Frontend (in feature hook):
socket.on("my_event_broadcast", (data) => {
  setMyState(data);
});

// Always clean up in useEffect return:
return () => {
  socket.off("my_event_broadcast");
};
```

---

## 11. API REFERENCE

### Authentication (`/api/auth`)
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/signup` | — | `{email, password, displayName}` | `{token, user}` |
| POST | `/login` | — | `{email, password}` | `{token, user}` |
| GET | `/me` | ✓ | — | `{user}` |
| PATCH | `/profile` | ✓ | `{displayName, avatarUrl, timezone, location}` | `{user}` |
| PATCH | `/password` | ✓ | `{currentPassword, newPassword}` | `{message}` |
| DELETE | `/account` | ✓ | — | `{message}` |

### Relationship (`/api/relationship`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/invite` | ✓ | Send invite to partner email |
| POST | `/accept` | ✓ | Accept invite by relationshipId |
| POST | `/reject` | ✓ | Decline invite |
| POST | `/cancel` | ✓ | Cancel sent invite |
| POST | `/end` | ✓ | End active relationship |
| GET | `/my` | ✓ | Get current active relationship |
| GET | `/list` | ✓ | List all relationships |
| GET | `/:id/stats` | ✓ | `{messageCount, memoryCount, daysTogether}` |
| PATCH | `/rename` | ✓ | Rename the space |
| POST | `/pin` | ✓ | Pin/unpin relationship |
| POST | `/mute` | ✓ | Mute/unmute notifications |
| POST | `/archive` | ✓ | Archive relationship |

### Chat (`/api/chat`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/messages/:relId` | ✓ | `?limit=30&cursor=ISO_DATE` Paginated messages |
| GET | `/search/:relId` | ✓ | `?q=text` Search messages (regex-safe) |
| DELETE | `/messages/:id` | ✓ | Soft-delete own message |

### Media (`/api/media`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload` | ✓ | Multipart upload (rate: 20/min) |
| GET | `/:id` | ✓ | Get media metadata |
| DELETE | `/:id` | ✓ | Delete own media |

### Memory (`/api/memory`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | ✓ | Create memory |
| GET | `/timeline` | ✓ | `?limit=20&cursor=ISO_DATE` |
| GET | `/search` | ✓ | `?q=text&emotionTag=romantic&type=photo` |
| GET | `/:id` | ✓ | Get single memory |
| PATCH | `/:id` | ✓ | Edit memory |
| DELETE | `/:id` | ✓ | Soft-delete memory |
| PATCH | `/:id/pin` | ✓ | Toggle pin |
| POST | `/:id/favorite` | ✓ | Toggle favorite |
| POST | `/:id/react` | ✓ | Add/change reaction |
| POST | `/:id/comment` | ✓ | Add comment |

### Notifications (`/api/notifications`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✓ | `?limit=30&read=false` |
| PATCH | `/:id/read` | ✓ | Mark single as read |
| POST | `/read-all` | ✓ | Mark all read |
| DELETE | `/clear-read` | ✓ | Delete read notifications |
| GET | `/preferences` | ✓ | Get notification preferences |
| PATCH | `/preferences` | ✓ | Update preferences |

### AI Insights (`/api/ai`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/analyze` | ✓ | Trigger on-demand relationship analysis |
| GET | `/insights` | ✓ | Get AI insight cards |
| POST | `/weekly-summary` | ✓ | Generate narrative weekly recap |

### Heartbeat (`/api/heartbeat`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/tap` | ✓ | Send "thinking of you" tap (rate: 1/30s) |

### Mood (`/api/mood`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/checkin` | ✓ | `{relationshipId, emoji, note?}` |
| GET | `/today/:relId` | ✓ | Both partners' today moods |
| GET | `/history/:relId` | ✓ | Last 14 days of moods |

### Timezone Bridge (`/api/timezone`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/bridge/:relId` | ✓ | Both local times, awake status, distance |
| PATCH | `/me` | ✓ | `{timezone, location?}` Update own timezone |

### Admin Routes (require `role: "admin"`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/feedback/admin/all` | All user feedback |
| PATCH | `/api/feedback/admin/:id/status` | Update feedback status |
| GET | `/api/feedback/admin/stats` | Feedback statistics |
| GET | `/api/analytics/admin/dashboard` | Analytics dashboard |
| GET | `/api/analytics/admin/user/:id/journey` | User journey data |
| GET | `/api/analytics/admin/retention` | Retention metrics |

*Full API reference continues for gifts, journals, capsules, planner, games, settings, personalization, privacy, search, sync, activity, call, presence, stories, plugins — all following the same pattern above.*

---

## 12. SECURITY MODEL

### Authentication Layer

Every protected route uses `authMiddleware`:
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = { userId: decoded.userId, email: decoded.email };
```

JWT expiry: 7 days. On expiry → axios interceptor catches 401 → redirects to `/login?expired=1` with session-expired banner.

### Authorization Layer

`verifyRelationshipMember(relationshipId, userId)` is called on **every single data endpoint**:
- Returns the Relationship document if authorized
- Returns null (→ 403) if user doesn't belong to that relationship
- Returns null if relationship is not `status: "active"`

No endpoint returns data from a relationship the user isn't part of.

### Admin Access Control

```javascript
// adminMiddleware.js — checks User.role === "admin"
const user = await User.findById(req.user.userId).select("role isActive");
if (user.role !== "admin") return res.status(403).json({ ... });
```

To make a user admin:
```javascript
// In MongoDB (Atlas UI or mongo shell):
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

### Rate Limiting

```javascript
// Three-tier rate limiting (no Redis — in-memory, resets on restart)
loginLimiter:   10 requests per 15 minutes (per IP)
apiLimiter:     200 requests per 15 minutes (per IP)
uploadLimiter:  20 requests per minute (per IP)
```

For production with multiple server instances, replace with Redis-backed rate limiting (e.g. `rate-limit-redis`).

### Input Validation

- **Search inputs**: All `$regex` queries escape special regex chars before MongoDB query
- **File uploads**: Multer validates MIME type against allowlist (`image/*`, `video/*`, `audio/*`)
- **Message length**: Max 2000 characters enforced at socket level
- **DB query limits**: All paginated endpoints cap at `Math.min(requestedLimit, 100)`
- **Express Validator**: Used on auth routes for email format, password strength

### Known Accepted Risks

| Risk | Why Accepted | Mitigation |
|------|-------------|------------|
| JWT in localStorage | Migration to httpOnly cookies requires CORS changes | Short JWT expiry (7d), 401 interceptor, Helmet XSS headers |
| STUN-only WebRTC | TURN server = paid infra decision | Documented in deployment guide |
| In-memory rate limiting | Resets on server restart | Acceptable for early stage; upgrade to Redis for scale |

---

## 13. SCHEDULED JOBS REFERENCE

All crons initialized in `services/api/src/server.js` after DB connect.

### 1. Notification Delivery Cron
**Schedule:** Every 1 minute  
**File:** `modules/notification/notification.scheduler.js`  
**What it does:** Finds `Notification` documents where `scheduledFor <= now` and `delivered = false`, delivers via Socket.IO `/notification` namespace, marks as delivered.

### 2. Gift + Capsule Delivery Cron
**Schedule:** Every 5 minutes  
**File:** `modules/notification/notification.scheduler.js`  
**What it does:**  
- `deliverScheduledGifts()`: finds gifts where `scheduledRevealTime <= now` and `opened = false`, sends notification to recipient
- `checkScheduledUnlocks()`: finds capsules where `lockedUntil <= now` and `opened = false`, sends "your capsule is ready" notification to both

### 3. Weekly Insights Cron
**Schedule:** Every Sunday at 8:00 AM (server timezone)  
**File:** `modules/insights/insight.scheduler.js`  
**What it does:** Iterates all active relationships, runs `runInsightsForRelationship()`, stores `RelationshipInsight` documents for 15 insight types.

### 4. Anniversary Reminder Cron
**Schedule:** Every day at 8:00 AM  
**File:** `modules/notification/anniversary.scheduler.js`  
**What it does:**  
- Checks all active relationships with a `startDate`
- Calculates days since start
- On milestone days (7, 30, 90, 180, 365, then every 365): sends celebration notification to both
- On milestone eve (1 day before): sends "tomorrow is your X anniversary" heads-up
- Milestone labels: "1 week", "1 month", "3 months", "6 months", "1 year", "2 years", etc.

### Cron Expression Reference
| Expression | Meaning |
|------------|---------|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 8 * * 0` | Sunday at 8am |
| `0 8 * * *` | Every day at 8am |

---

## 14. PERFORMANCE GUIDE

### Frontend Performance

**Dashboard load time: ~250ms** (was ~900ms)
- `Promise.all([personalization, timeline, messages, stats])` — all parallel
- RelationshipProvider fetches once, all 30 pages share the same data
- Skeleton loading during data fetch (no layout shift)

**Bundle size:** 553KB gzipped to 139KB
- Vendor split: React (53KB), Socket.IO (13KB), utilities (15KB)
- Code split by route (`React.lazy` — implement if bundle grows beyond 800KB)

**Socket efficiency:**
- 6 namespaces = only relevant events reach the client
- Typing indicator: emitted max once per 10 seconds (throttled)
- `checkMilestones`: fires every 10th message (was every message — N+1 fixed)

### Backend Performance

**MongoDB queries:**
- All pagination uses cursor-based (not skip/offset — safe at 10M+ records)
- All limits capped at 100 per request
- Compound indexes on all common query patterns
- Lean queries (`.lean()`) where documents don't need Mongoose methods

**File uploads:**
- Images: compressed to 85% quality, max 1920px width via Sharp
- Thumbnails: 400x300px max for video/image previews
- Files served as static (not through Node.js) for production

**Socket:**
- Room-based broadcasting (no namespace broadcast) — only connected partners receive events
- Socket disconnect: immediate presence update, no polling

### Scaling Considerations

For >1000 concurrent users:
1. **Multiple Node.js instances** → need Redis adapter for Socket.IO (sticky sessions or `socket.io-redis`)
2. **Rate limiting** → replace in-memory with Redis (`rate-limit-redis`)
3. **Media uploads** → serve from S3/Cloudflare R2 instead of disk
4. **MongoDB** → ensure Atlas M10+ with dedicated RAM
5. **TURN server** → Twilio, Xirsys, or self-hosted coturn

---

## 15. TESTING GUIDE

### Running Tests

```bash
npm test                    # All 124 tests
npm run test:watch          # Watch mode (re-runs on file change)
```

### Test Infrastructure

- **Framework:** Jest with ESM support (`--experimental-vm-modules`)
- **Database:** `mongodb-memory-server` — no external DB needed
- **Test setup:** `tests/helpers/db.js` (connect/clear/close), `tests/helpers/factories.js` (data builders)

### Test Suites

| Suite | File | Tests | Covers |
|-------|------|-------|--------|
| Auth | `tests/backend/auth.test.js` | 18 | signup, login, JWT, profile, password |
| Relationship | `tests/backend/relationship.test.js` | 22 | invite, accept, reject, cancel, end, stats |
| Chat | `tests/backend/chat.test.js` | 15 | messages, search, pagination |
| Memory | `tests/backend/memory.test.js` | 20 | CRUD, pin, favorite, react, lock (PIN) |
| Planner | `tests/backend/planner.test.js` | 12 | habits, events, goals, streaks |
| Privacy | `tests/backend/privacy.test.js` | 14 | lock memory, unlock PIN, session revoke |
| Feedback | `tests/backend/feedback.test.js` | 11 | submit, admin routes, auth check |
| Chat Socket | `tests/socket/chatSocket.test.js` | 7 | send, react, edit, delete |
| Presence Socket | `tests/socket/presenceSocket.test.js` | 5 | status update, partner notification |
| Utils | `tests/utils/utils.test.js` | — | shared utilities |

### Writing New Tests

```javascript
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.js";
import { makeUser, makeRelationship } from "../helpers/factories.js";
import request from "supertest";
import app from "../../services/api/src/server.js";

describe("My Feature", () => {
  beforeAll(connectTestDB);
  afterEach(clearTestDB);
  afterAll(closeTestDB);

  it("should do the thing", async () => {
    const { userA, userB, rel, tokenA } = await makeRelationship();
    
    const res = await request(app)
      .post("/api/my-feature")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ relationshipId: rel._id.toString(), data: "value" });
    
    expect(res.status).toBe(201);
    expect(res.body.item.data).toBe("value");
  });
});
```

### Factory Reference

```javascript
// tests/helpers/factories.js

// Single user
const user = await makeUser({ role: "admin" });

// Full relationship with both users and tokens
const { userA, userB, rel, tokenA, tokenB } = await makeRelationship();

// With custom overrides
const { rel } = await makeRelationship({
  userAOverrides: { timezone: "Asia/Kolkata" },
  relOverrides: { startDate: new Date("2024-01-01") },
});
```

---

## 16. DEPLOYMENT

### Render (Recommended — Free Tier Available)

**Deploy Backend (Web Service):**

1. Connect GitHub repo to Render
2. New → Web Service
3. Settings:
   ```
   Environment: Node
   Build Command: npm install
   Start Command: node services/api/src/server.js
   Health Check Path: /health
   ```
4. Environment variables: (copy from `.env.production.example`)

**Deploy Frontend (Static Site):**

1. New → Static Site
2. Settings:
   ```
   Build Command: npm run build --workspace=apps/web
   Publish Directory: apps/web/dist
   ```
3. Environment variables:
   ```
   VITE_API_URL=https://your-api-name.onrender.com
   VITE_SOCKET_URL=https://your-api-name.onrender.com
   ```

**IMPORTANT for production:**
- Free tier Render services sleep after 15 min of inactivity → Socket.IO disconnects. Upgrade to Starter ($7/mo) for always-on.
- Set `ALLOWED_ORIGINS` to your frontend URL exactly.

### Docker

```bash
# Build and run both services:
docker compose up --build

# Services: api (port 5000), web (port 5173), mongo (port 27017)
```

`docker-compose.yml` in root configures all three. For production, remove the `mongo` service and use Atlas.

### VPS (DigitalOcean, Linode, etc.)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone ... && cd PairSpace
npm install --production
cp services/api/.env.production.example services/api/.env
# Edit .env with production values

# Use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save && pm2 startup

# Frontend: build and serve via Nginx
npm run build --workspace=apps/web
# Copy apps/web/dist to Nginx web root
```

`ecosystem.config.js` is included in the root — configures PM2 clustering.

### Production Checklist

```
[ ] MONGO_URI points to Atlas (not localhost)
[ ] JWT_SECRET is a random 64-char string (not a readable phrase)
[ ] NODE_ENV=production
[ ] ALLOWED_ORIGINS includes your frontend domain exactly
[ ] TURN_SERVER_URL configured (or document calls may fail on restricted networks)
[ ] Sentry DSN set for error tracking
[ ] nginx or CDN in front for media files (don't stream through Node.js)
[ ] PM2 or similar process manager with auto-restart
[ ] SSL/TLS certificate (Let's Encrypt via Certbot)
```

---

## 17. TROUBLESHOOTING

### "Socket not connecting / realtime events not working"

1. Check `VITE_SOCKET_URL` matches the backend URL exactly (no trailing slash)
2. In production: the backend must be HTTPS (browsers block WS from HTTPS pages)
3. If behind a load balancer: enable sticky sessions or use `@socket.io/redis-adapter`
4. Check CORS: `ALLOWED_ORIGINS` must include the frontend origin

### "Images/media returning 404 in production"

1. `VITE_API_URL` must be set in the frontend production environment
2. The `MEDIA_BASE` constant in `shared/constants/urls.js` auto-detects environment
3. Verify `/uploads` directory exists and is writable on the server

### "Calls fail / can't connect"

1. STUN works for ~80% of networks. For the rest, configure a TURN server.
2. Free TURN options: Metered.ca free tier, Xirsys hobby tier
3. Check browser console for ICE connection state changes
4. Ensure WebRTC isn't blocked by corporate firewall

### "Tests fail with MongoDB download error"

`mongodb-memory-server` downloads a MongoDB binary on first run.

```bash
# If behind corporate proxy/firewall:
export MONGOMS_DOWNLOAD_URL=https://mirror.url/mongodb-linux-x86_64-rhel80-7.0.0.tgz
npm test

# Or skip with a real test DB (not recommended):
MONGO_URI=mongodb://localhost:27017/pairspace_test npm test
```

### "Anniversary/gift/capsule notifications not sending"

1. Check cron is initialized: look for `"Anniversary reminder scheduler started"` in server logs
2. Verify `startDate` is set on the relationship (set during `POST /api/relationship/accept`)
3. Check notifications collection for scheduled entries

### "Onboarding theme not applying after pairing"

Personalization saved during onboarding is in `sessionStorage` (`pairspace_pending_theme`). It's applied when `getPersonalization(rel.id)` is called after pairing. If not applied:
1. Check the relationship is `status: "active"`
2. Check `sessionStorage` in browser dev tools for `pairspace_pending_theme`
3. Force-apply via `PATCH /api/personalization` in the Settings page

---

## 18. EXTENDING PAIRSPACE

### Adding a New Game

1. Add to `modules/games/game.socket.js`:
```javascript
const initGameState = (gameType, creatorId) => {
  if (gameType === "my_new_game") return { board: [], score: {[creatorId]: 0} };
  // ...existing games
};
```

2. Add the game type to `shared/constants/gameTypes.js`
3. Create `apps/web/src/features/games/MyNewGame.jsx`
4. Render it in `GamesPage.jsx` based on `session.gameType`

### Adding a New Activity Type

1. Add to `shared/constants/activityTypes.js`
2. Add label to `ACTIVITY_LABELS` in `modules/sync/activity.socket.js`
3. Create `apps/web/src/features/activity/MyActivityPlayer.jsx`
4. Render in `ActivityPlayerUltra.jsx` with a switch on `activity.activityType`

### Plugin System

The plugin registry is loaded on startup. To add a plugin:

1. Create `plugins/my-plugin/index.js`:
```javascript
export default {
  id: "my-plugin",
  name: "My Plugin",
  version: "1.0.0",
  triggerOn: ["milestone_reached"],
  execute: async ({ relationshipId, type, value }) => {
    // Custom behavior on milestone
  },
};
```

2. Fire the hook in the core code:
```javascript
import { getPluginsByType } from "../plugin-system/plugin.registry.js";
const plugins = getPluginsByType("milestone_reached");
await Promise.all(plugins.map(p => p.execute({ relationshipId, type, value }).catch(() => {})));
```

---

## 19. KNOWN LIMITATIONS & ROADMAP

### Current Limitations

| Limitation | Impact | Planned Fix |
|-----------|--------|-------------|
| STUN-only WebRTC | Calls fail ~20% of networks (NAT) | Configure TURN server (Twilio/Xirsys) |
| JWT in localStorage | XSS risk (mitigated by Helmet) | Migrate to httpOnly cookies |
| In-memory rate limiting | Resets on server restart | Redis rate limiter for scale |
| No web push notifications | Background delivery requires browser open | Service worker + FCM/Web Push |
| Plugin hooks not wired to core | Plugins registered but never invoked | Wire in 3 key event points |
| No email verification | Any email can be signed up with | Add verification email flow |
| API response format mixed | `{error:true}` vs `{success:true}` | Standardize in v2 |

### Roadmap

**v1.1 — Reliability**
- TURN server integration
- Web Push notifications (service worker)
- Email verification on signup
- Refresh token flow

**v1.2 — Experience**
- Mobile app (React Native or Expo)
- GIF support in chat
- Voice messages in journal
- Shared photo albums
- Map memories by location

**v1.3 — Intelligence**
- Real AI/LLM integration for story generation (currently rule-based templates)
- Smarter insight analysis (sentiment, emotion correlation)
- Relationship health score with trend graph
- Personalized activity suggestions

**v2.0 — Platform**
- Plugin marketplace
- Premium tier (advanced AI, unlimited storage)
- Public API for third-party integrations
- Multi-language support (i18n)

---

*Documentation version: 1.0 — Post-full-audit*  
*Last updated: Complete QA audit + all fixes applied*  
*Tests: 124 passing | Build: Clean | Theme: Unified Lovable*
