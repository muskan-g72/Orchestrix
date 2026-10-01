# Orchestrix Web Console & Dashboard

A high-performance, dark-mode Next.js 14 App Router console for the **Orchestrix** deterministic AI execution gateway. Built with TypeScript, Tailwind CSS, Framer Motion, and Lucide React.

---

## 🚀 Overview

The Orchestrix Dashboard provides an interactive developer experience to execute skills, inspect multi-step workflow graphs, analyze execution attempt traces, monitor real-time token budgets, and manage tenant preferences.

### Key Capabilities

1. **Playground (`/dashboard`)**:
   - Execute single-turn skills (`summarize`, `extract_action_items`) or multi-step workflow pipelines (`article_processing`).
   - Validate structured outputs against strict Pydantic schemas.
   - Inspect provider metadata (`groq` primary vs `gemini` fallback), attempt count (initial vs bounded repair), and millisecond latency timers.
   - Keyboard shortcut: `⌘+Enter` / `Ctrl+Enter` to run.

2. **Execution Traces (`/dashboard/traces`)**:
   - Inspect detailed timelines of ordered execution attempts (`initial`, `repair`, `fallback`).
   - Audit error classifications (`validation_error`, `operational_error`) and validation error categories (`parsing`, `structure`, `semantic`).
   - View tool invocations and execution duration in milliseconds.
   - **Local Storage Trace History**: Because Orchestrix is a stateless gateway without a global trace list endpoint, recent execution IDs are automatically recorded in client `localStorage` with a clear "Saved Locally" indicator.

3. **Usage & Budgets (`/dashboard/usage`)**:
   - Real-time token accounting for Prompt Tokens (inbound) and Completion Tokens (outbound).
   - Visual progress gauges of requests consumed vs remaining quota.
   - **Friendly 429 Budget Exhaustion State**: When test keys like `vk_tiny` (5 request budget) or `vk_edge` (10 request budget) hit zero remaining allocation, the UI displays a clear 429 Alert Banner explaining PostgreSQL atomic locks with a 1-click button to switch to `vk_open` or Mock Mode.

4. **Gateway Settings & Preferences (`/dashboard/settings`)**:
   - Full CRUD management for tenant preference key-value storage (`/v1/preferences`).
   - Visual GUI editor and raw JSON editor with syntax validation.
   - Configure defaults like `language`, `summary_depth`, `enforce_bullet_points`, and `max_action_items`.

5. **Command Palette (`⌘K` / `Ctrl+K`)**:
   - Global hotkey overlay for quick actions: run skills, jump to recent traces, switch virtual keys, and toggle mock mode.

---

## ⚡ Live Mode vs. Mock (Demo) Mode

Orchestrix Web supports two execution engines with seamless instant toggling in the top bar:

| Feature | Live Gateway Mode ⚡ | Mock / Demo Mode 🧪 |
| :--- | :--- | :--- |
| **Backend Target** | Production FastAPI gateway (`https://orchestrix-yc6s.onrender.com` or local server) | Offline client-side deterministic mock generator |
| **Authentication** | Validates Bearer tokens (`vk_open`, etc.) via PostgreSQL atomic locks | Local schema mocking with deterministic test responses |
| **Providers Used** | Groq (`llama-3.3-70b-versatile`) with Gemini fallback | Instant simulated Groq/Gemini response structures |
| **Cold-Start Handling** | Automated detection and banner for free-tier gateway wake-up (~45–60s) | Instant (0–20ms latency) |
| **Labeling** | Live status indicators and real latency metrics | All mocked components and responses feature a <span style="color: #FBBF24; font-weight: bold;">DEMO DATA</span> badge |

---

## 🛠️ Environment Configuration

Create a `.env.local` file in `/web`:

```env
# URL to the Orchestrix FastAPI backend (defaults to production Render deployment)
NEXT_PUBLIC_API_URL=https://orchestrix-yc6s.onrender.com

# Default virtual key for client requests
NEXT_PUBLIC_DEFAULT_VIRTUAL_KEY=vk_open

# Set to "1" to default to Mock Mode on first visit (defaults to live "0")
NEXT_PUBLIC_MOCK=0
```

---

## 💻 Development & Build Commands

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Typecheck with TypeScript compiler
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```
