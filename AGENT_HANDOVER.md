StudyHub — Agent Handover Notes

> **Date**: 2026-04-16
> **Conversation**: 23772589-4e0a-45b9-abf3-550e4133d0d0
> **Status**: Phase 1 + Phase 2 complete, build verified (16/16 pages, exit code 0)

---

## 1. Project Overview

**StudyHub** is a collaborative study platform for university students. It's being built as a **global app** targeting Play Store and Apple Store deployment — NOT a single-university tool.

**Core features**: Real-time chat, file sharing, AI study assistant (OpenAI GPT-4o), WebRTC voice/video calls, course modules, polls, user discovery.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Zustand (state), Socket.io-client |
| **Styling** | Vanilla CSS (`globals.css` — 1600+ lines), no Tailwind |
| **Backend** | Node.js, Express, MongoDB/Mongoose, Socket.io |
| **AI** | OpenAI API (GPT-4o) |
| **Auth** | JWT + Google OAuth |
| **Calls** | WebRTC (signaling only — peer connections not fully implemented) |
| **File upload** | Multer |

---

## 3. Project Structure

```
StudyHub/
├── backend/
│   └── src/
│       ├── index.js              # Express server + Socket.io setup
│       ├── models/
│       │   ├── User.js           # User schema (notifications embedded, capped at 100)
│       │   ├── Channel.js        # Channel schema (group/direct, members, admins)
│       │   ├── Message.js        # Message schema (text/file/poll, reactions, edit history, isPinned)
│       │   └── CourseFile.js     # File storage with AI processing status
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── channelController.js  # CRUD + messages + search + pinned
│       │   ├── userController.js     # Search/pagination added
│       │   ├── fileController.js
│       │   └── aiController.js
│       ├── routes/
│       │   ├── auth.js           # Strong password validation (8+, upper, lower, digit)
│       │   ├── channels.js       # Includes leave, search, pinned routes
│       │   └── users.js
│       ├── socket/
│       │   └── socketHandler.js  # All real-time: messages, edit, delete, polls, pin, typing, WebRTC
│       └── middleware/
│           ├── auth.js           # JWT authenticate + role authorize
│           ├── validation.js
│           └── upload.js
├── frontend/
│   ├── app/
│   │   ├── layout.js             # Root layout (cursor, shards, toaster)
│   │   ├── page.js               # Landing page (unauthenticated users)
│   │   ├── globals.css           # ALL styles (~1600 lines)
│   │   ├── login/page.js
│   │   ├── register/page.js      # Has password strength meter
│   │   ├── forgot-password/page.js
│   │   ├── auth/callback/page.js # Google OAuth callback
│   │   └── (app)/                # Authenticated layout group
│   │       ├── layout.js         # Sidebar + socket listeners + ErrorBoundary
│   │       ├── channels/
│   │       │   ├── page.js       # Channel list + discover modal
│   │       │   └── [id]/page.js  # Chat page (edit/delete/polls/pin/search/images/infinite scroll)
│   │       ├── people/page.js    # [NEW] User discovery + search
│   │       ├── modules/page.js
│   │       ├── ai/page.js
│   │       ├── calls/page.js
│   │       ├── profile/page.js
│   │       ├── settings/page.js
│   │       └── admin/page.js
│   ├── components/
│   │   ├── Sidebar.js            # Nav + channel list with show more/less
│   │   ├── ErrorBoundary.js      # [NEW] React error boundary
│   │   ├── CustomCursor.js
│   │   ├── MouseGlow.js
│   │   └── BackgroundShards.js
│   ├── store/index.js            # Zustand: auth, UI, chat (with edit/delete/poll/pin), notifications
│   └── lib/
│       ├── api.js                # Axios client with all endpoints
│       └── socket.js             # Socket.io client singleton
```

---

## 4. What Was Completed

### Phase 1: Fix, Harden & Polish ✅

| Category | Change |
|----------|--------|
| **Bug** | Fixed `setSidebarOpen` crash in `channels/[id]/page.js` — was calling undefined function |
| **Bug** | Fixed sidebar truncating channels silently — now has "Show N more" toggle |
| **Bug** | Removed 47 lines of duplicate cursor CSS from `globals.css` |
| **Security** | Channel delete now checks channel admin / creator / platform admin (was admin-only route) |
| **Security** | Password requires 8+ chars, uppercase, lowercase, digit (was 6 chars min) |
| **Security** | Notification array capped at 100 per user via `$slice` |
| **Feature** | Message edit (own messages only, with edit history saved) |
| **Feature** | Message delete (sender + channel admin + platform admin) |
| **Feature** | Inline image previews in chat with full-screen lightbox |
| **Feature** | Infinite scroll message pagination (50/page) |
| **Feature** | Professional landing page (`/`) for unauthenticated users |
| **Feature** | React ErrorBoundary wrapping all authenticated content |
| **Feature** | Leave channel endpoint (`POST /api/channels/:id/leave`) |
| **Arch** | Extracted `pushNotification()` helper in socket handler |
| **Arch** | All socket event handlers now have try/catch |

### Phase 2: Core Features ✅

| Category | Change |
|----------|--------|
| **Polls** | `create-poll` socket event — creates Message with type 'poll' |
| **Polls** | `vote-poll` socket event — single/multiple choice, toggle votes |
| **Polls** | `poll-updated` real-time broadcast to channel |
| **Polls** | Frontend: create modal (dynamic options, multiple choice toggle), inline poll cards with animated vote bars |
| **People** | New `/people` page with user grid, search (username/email), pagination |
| **People** | One-click DM initiation, online status, last seen, role badges |
| **People** | Backend: `GET /api/users` now supports `?search=&page=&limit=` |
| **Search** | `GET /api/channels/:id/messages/search?q=` — regex text search + pagination |
| **Search** | Frontend: slide-out search panel in chat with results |
| **Pin** | `pin-message` socket event (toggle pin/unpin) |
| **Pin** | `isPinned` field on Message model |
| **Pin** | `GET /api/channels/:id/pinned` endpoint |
| **Pin** | Pin button in message actions, "📌 Pinned" badge in message header |
| **Register** | Password strength meter with 4-segment bar + requirement checklist |

---

## 5. Current Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `send-message` | Client → Server | Send text/file message |
| `new-message` | Server → Client | Broadcast new message |
| `edit-message` | Client → Server | Edit own message |
| `message-edited` | Server → Client | Broadcast edit |
| `delete-message` | Client → Server | Delete message |
| `message-deleted` | Server → Client | Broadcast deletion |
| `add-reaction` | Client → Server | Toggle emoji reaction |
| `message-reaction` | Server → Client | Broadcast reaction change |
| `create-poll` | Client → Server | Create poll message |
| `vote-poll` | Client → Server | Vote on poll option |
| `poll-updated` | Server → Client | Broadcast poll vote change |
| `pin-message` | Client → Server | Toggle pin |
| `message-pinned` | Server → Client | Broadcast pin change |
| `typing` | Client → Server | Typing indicator |
| `user-typing` | Server → Client | Broadcast typing |
| `join-channel` | Client → Server | Join socket room |
| `call-offer/answer/ice-candidate/end` | Bidirectional | WebRTC signaling |
| `user-online/offline` | Server → Client | Presence |
| `notification` | Server → Client | Push notification |

---

## 6. Known Issues & Technical Debt

> [!WARNING]
> These are known but NOT yet addressed:

1. **Notifications still embedded in User model** — should be a separate collection for scale, but capped at 100 for now
2. **No email verification** on registration
3. **OpenAI API key** handling in backend has hardcoded placeholders / mock bypasses in `aiController.js`
4. **WebRTC calls** — only signaling is implemented, no actual peer connection code
5. **No rate limiting** on API endpoints
6. **No input sanitization** on message content (XSS risk via markdown rendering)
7. **`channels/[id]/page.js`** is 700 lines — should be decomposed into smaller components
8. **`globals.css`** is 1600+ lines — could benefit from CSS modules per component
9. **No loading skeletons** — pages show a generic spinner during load
10. **No offline support / PWA** configuration

---

## 7. Phase 3 Roadmap (What To Build Next)

| Priority | Feature | Notes |
|----------|---------|-------|
| 1 | **Study Timer / Pomodoro** | Daily engagement hook, relatively self-contained |
| 2 | **Bookmarks / Saved messages** | Personal utility, new model needed |
| 3 | **Events / Calendar** | Study session scheduling, date picker UI |
| 4 | **Task Board / To-Dos** | Shared checklists per channel/group |
| 5 | **Screen sharing in calls** | Complete the WebRTC experience |
| 6 | **Push notifications (PWA)** | `manifest.json` + service worker |
| 7 | **AI Study Plan Generator** | Personalized schedules from uploaded materials |
| 8 | **Threads / Reply chains** | Discord-style thread conversations |
| 9 | **User profiles (public)** | Bio, courses, study interests |
| 10 | **Content moderation** | Auto-flag inappropriate content |

---

## 8. Critical Rules

> [!IMPORTANT]
> The user has mandated these rules:

1. **Production-ready quality** — no half-measures, no "we'll fix it later"
2. **Save quota** — be efficient with compute/API resources
3. **Global audience** — not university-specific, must scale
4. **App store deployment** — Play Store first, Apple Store later
5. **Senior engineering prerogative** — the agent decides what to build and in what order
6. **CSS is vanilla** — no Tailwind, all styles in `globals.css`
7. **Preserve existing comments/docstrings** unless directly editing that code

---

## 9. Environment Setup

```bash
# Backend
cd backend
npm install
# Requires .env with: MONGODB_URI, JWT_SECRET, OPENAI_API_KEY, FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
npm run dev  # Runs on port 5000

# Frontend
cd frontend
npm install
# Requires .env.local with: NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev  # Runs on port 3000
```

---

## 10. Quick Reference — Key File Locations

| What | Path |
|------|------|
| All CSS styles | `frontend/app/globals.css` |
| Zustand store | `frontend/store/index.js` |
| API client | `frontend/lib/api.js` |
| Socket client | `frontend/lib/socket.js` |
| Socket handler (backend) | `backend/src/socket/socketHandler.js` |
| Chat page (largest file) | `frontend/app/(app)/channels/[id]/page.js` |
| Sidebar | `frontend/components/Sidebar.js` |
| App layout (socket listeners) | `frontend/app/(app)/layout.js` |
| Message model | `backend/src/models/Message.js` |
| Channel controller | `backend/src/controllers/channelController.js` |

---

> **Last build**: ✓ 16/16 pages compiled successfully, exit code 0  
> **Last verified**: 2026-04-16T11:02:06Z
