<div align="center">

# 💞 PairSpace

**A private, beautiful digital world built for two.**

*Real-time chat · Voice & video calls · Shared memories · Watch together · AI insights · Gifts & time capsules · Games · Journal · Planner — and more*

![License](https://img.shields.io/badge/license-MIT-pink) ![Node](https://img.shields.io/badge/node-20+-green) ![React](https://img.shields.io/badge/react-18-blue) ![Tests](https://img.shields.io/badge/tests-124%20passing-brightgreen)

</div>

---

## What is PairSpace?

PairSpace is a **private relationship app for exactly two people.** Unlike group social networks, every feature is purpose-built for one relationship — a locked, intimate digital space. Think of it as a home you share online: private chat, memories, calls, journals, gifts, games, and daily rituals.

Designed for **long-distance couples, best friends, and any two people who want more than messaging.**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **Private Chat** | Real-time messaging with reactions, replies, edit, delete, typing indicators, read receipts, media, and voice notes |
| 📞 **Voice & Video Calls** | WebRTC peer-to-peer with mute, camera toggle, screen share, auto-timeout, and call history |
| 📸 **Memory Timeline** | Shared photo/video/milestone timeline with PIN locking, reactions, comments, and AI emotion tagging |
| 🎬 **Watch Together** | Synchronized video/audio activities with live position sync — partner joins at the exact right second |
| 💗 **Thinking of You** | One-tap heartbeat that pulses on your partner's screen instantly — no words needed |
| 🌤️ **Daily Mood** | Both partners share a daily emoji mood — visible on each other's dashboard |
| 🌍 **Timezone Bridge** | Shows both local times, awake/sleeping status, golden overlap hours, and distance apart |
| 🎁 **Digital Gifts** | Surprise gifts with countdown timers (precise hours/minutes), reveal animations, and reaction mechanics |
| ⏳ **Time Capsules** | Lock messages and media until a future date, mutual unlock, or anniversary |
| 📓 **Journal** | Shared journal with visibility rules — write for each other, or only reveal after they respond |
| 📅 **Planner** | Habits with streak tracking, events, goals, recurring reminders, and relationship calendar |
| 🎮 **Games** | 8 turn-based couple games: Truth or Dare, Word Association, Trivia, and more |
| 📊 **AI Insights** | Weekly relationship pattern analysis — message frequency, emotional diversity, activity consistency |
| 📖 **AI Story** | Milestone-triggered narrative stories: "100 messages together," "1 year anniversary" |
| 🔔 **Smart Notifications** | Anniversary reminders (with 1-day early heads-up), real-time delivery, scheduled system |
| 🔒 **Privacy Controls** | PIN-lock memories, session management, data export, incognito mode |
| 🎨 **Personalization** | Custom themes, wallpapers, relationship name, font, and mood settings |
| 📡 **Offline Sync** | Send messages offline — queued in IndexedDB, delivered automatically when reconnected |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 5, Tailwind CSS 3, Framer Motion 12 |
| **Backend** | Node.js 20, Express 4, Socket.IO 4 |
| **Database** | MongoDB (Mongoose 8) |
| **Realtime** | Socket.IO — 6 namespaces: `/chat` `/presence` `/call` `/game` `/activity` `/notification` |
| **Auth** | JWT (bcryptjs, 12 rounds) |
| **Media** | Multer + Sharp (compression + thumbnails) |
| **Scheduled Jobs** | node-cron (notifications, gifts, capsules, insights, anniversaries) |
| **Error Tracking** | Sentry (production only) |
| **Testing** | Jest + mongodb-memory-server (124 tests) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 9+ (workspaces)
- MongoDB Atlas (free tier) or local MongoDB

### 1. Clone & Install

```bash
git clone https://github.com/your-org/pairspace.git
cd pairspace
npm install
```

### 2. Configure Environment

**Backend** — create `services/api/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pairspace
JWT_SECRET=<run: openssl rand -hex 64>
NODE_ENV=development
```

**Frontend** — create `apps/web/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Demo Data (Optional)

```bash
node scripts/seedDemoData.js
```

Creates two demo accounts with rich sample data (messages, memories, gifts, journal entries, etc.):
- **Email:** `parth.demo@example.com` / **Password:** `Demo@123`
- **Email:** `alex.demo@example.com` / **Password:** `Demo@123`

### 4. Run

```bash
npm run dev          # Both frontend + backend concurrently
npm run dev:api      # Backend only (port 5000)
npm run dev:web      # Frontend only (port 5173)
```

### 5. Test

```bash
npm test             # Run all 124 backend tests
npm run test:watch   # Watch mode
```

---

## 📁 Project Structure

```
PairSpace/
├── apps/web/              # React + Vite frontend
│   └── src/
│       ├── pages/         # 30 page components (fully themed)
│       ├── features/      # 32 feature modules
│       ├── context/       # RelationshipProvider, CallProvider, NotificationContext
│       ├── socket/        # Socket factory files (one per namespace)
│       ├── services/      # API services, auth, relationship
│       └── styles/theme.css  # Single unified design token system
│
├── services/api/          # Node + Express backend
│   └── src/
│       ├── server.js      # Entry: mounts 29 route groups + 6 socket namespaces
│       ├── config/        # MongoDB, Socket.IO, DB indexes, migrations, Sentry
│       └── middleware/    # auth, admin, error, rate-limit, request-logger
│
├── modules/               # 25 feature modules
│   ├── auth/              # Signup, login, JWT, profile
│   ├── relationship/      # Invite, accept, pair, stats
│   ├── chat/              # Messages, reactions, edit, delete, search
│   ├── call/              # WebRTC signaling, 30s timeout
│   ├── media/             # Upload, compression, thumbnails
│   ├── memory/            # Timeline, pin, lock, AI trigger
│   ├── sync/              # Watch-together with live sync
│   ├── games/             # Turn-based games with disconnect cleanup
│   ├── heartbeat/         # "Thinking of You" tap system
│   ├── mood/              # Daily mood check-in
│   ├── timezone/          # Timezone bridge, distance calculation
│   ├── notification/      # Real-time delivery, cron scheduler
│   │   └── anniversary.scheduler.js  # Smart anniversary reminders
│   └── ...16 more
│
├── shared/                # Shared utilities (relationshipValidator, logger, etc.)
├── plugins/               # Extensible plugin system (2 example plugins)
├── scripts/               # seedDemoData, auditSystem, backupMongo, etc.
└── tests/                 # 124 backend tests (Jest + in-memory MongoDB)
```

---

## 🔐 Security

- **JWT authentication** on all protected routes
- **Admin role** required for `/admin/*` endpoints
- **Relationship isolation** — `verifyRelationshipMember()` on every data endpoint
- **Regex escaping** — all search inputs escaped (ReDoS protection)
- **Rate limiting** — login 10/15min, API 200/15min, upload 20/min
- **PIN memory locking** — bcrypt-hashed, schema-persisted
- **Helmet** security headers enabled
- **CORS** configurable via `ALLOWED_ORIGINS` env var

---

## 🌐 Deployment

### Render (Recommended)

**Backend (Web Service):**
```
Build Command: npm install
Start Command: node services/api/src/server.js
Health Check: /health
```

**Frontend (Static Site):**
```
Build Command: npm run build --workspace=apps/web
Publish Directory: apps/web/dist
Env Vars: VITE_API_URL=https://your-api.onrender.com
          VITE_SOCKET_URL=https://your-api.onrender.com
```

### Required Production Env Vars

```env
# Backend
NODE_ENV=production
MONGO_URI=<Atlas connection string>
JWT_SECRET=<256-bit random string>
ALLOWED_ORIGINS=https://your-frontend.onrender.com

# Optional (strongly recommended)
TURN_SERVER_URL=turn:your-turn-server.com
TURN_USERNAME=username
TURN_CREDENTIAL=credential
SENTRY_DSN=<your-sentry-dsn>
```

---

## 🧪 Running Tests

```bash
npm test                    # All 124 tests
npm run test:watch          # Watch mode

# If behind a corporate proxy (MongoDB binary download):
MONGOMS_DOWNLOAD_URL=https://your-mirror/mongod npm test
```

---

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `node scripts/seedDemoData.js` | Seed rich demo data (Parth + Alex) |
| `node scripts/resetDemoData.js` | Reset demo data to initial state |
| `node scripts/auditSystem.js` | Check data integrity |
| `node scripts/backupMongo.js` | Backup MongoDB to JSON files |
| `node scripts/restoreBackup.js` | Restore from backup |
| `node scripts/retentionCleanup.js` | GDPR soft-delete purge |
| `node scripts/verifyIndexes.js` | Verify all DB indexes exist |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Build: `npm run build --workspace=apps/web`
5. Submit a PR

---

## 📄 License

MIT © PairSpace Team

---

<div align="center">
Made with 💞 for two people who want to stay close
</div>
