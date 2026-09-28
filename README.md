# Manim Video Generator — Frontend

## 1. What it is

A React + Vite single-page UI for a text-to-Manim-animation backend. Users type a
description of an animation, the app calls the backend to generate a Manim video
(optionally AI-enhanced), and the result is added to a video library where past
videos can be previewed, downloaded, or deleted. The app has two views: a
**Generate** tab (prompt form, quality/AI options, progress tracking) and a
**Library** tab (grid of previously generated videos with a preview modal).

## 2. Tech stack

From `package.json`:

**Dependencies**
- `react` / `react-dom` — UI framework
- `framer-motion` — animations/transitions
- `lucide-react` — icon set
- `react-hot-toast` — toast notifications

**Dev dependencies**
- `vite` / `@vitejs/plugin-react` — dev server & build tool
- `tailwindcss` / `postcss` / `autoprefixer` — styling
- `eslint` + `eslint-plugin-react` / `-react-hooks` / `-react-refresh` — linting
- `@types/react` / `@types/react-dom` — type defs (JS project, no TypeScript build)

## 3. Project structure

```
src/
├── App.jsx                       # Root component: tab state (generate/library), polls
│                                  # backend + AI status on load, renders the status widget
├── main.jsx                      # React entry point, mounts <App/>
├── App.css / index.css           # Global/Tailwind styles
├── components/
│   ├── Header.jsx                 # Top bar (title, status indicators, refresh)
│   ├── Footer.jsx                 # Page footer
│   ├── VideoGenerator.jsx         # Prompt form: quality/AI options, calls
│   │                               # generateVideoWithPolling, shows progress
│   └── VideoLibrary.jsx           # Video grid + preview modal, download/delete actions
└── services/
    ├── ManimApiService.js         # ManimApiService class — all backend HTTP calls
    ├── apiConfig.js               # Base URL (from VITE_API_URL), timeouts, quality/status enums
    └── apiUtils.js                # ApiError class, response handling, URL building
```

## 4. Prerequisites

- Node.js 18+ (required by Vite 5; no `engines` field is set in `package.json`, so
  this is a recommended minimum, not an enforced one)
- The backend API must be running and reachable — this app has no functionality
  without it

## 5. Setup

```bash
cp .env.example .env
npm install
npm run dev
```

The dev server runs at **http://localhost:3000** — this is set explicitly in
`vite.config.js` (`server.port: 3000`), overriding Vite's default of 5173.

## 6. Environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (no trailing slash) |

```bash
# Local dev
VITE_API_URL=http://localhost:8000

# Production example
VITE_API_URL=https://your-backend.onrender.com
```

If unset, the app falls back to `http://localhost:8000` (see `src/services/apiConfig.js`).

Vite inlines `VITE_*` variables into the JS bundle **at build time**. On Vercel (or
any static host), changing `VITE_API_URL` in the project settings has no effect on
an already-built deployment — you must trigger a new build/redeploy for the new
value to take effect.

## 7. How it talks to the backend

All requests go through `ManimApiService` (`src/services/ManimApiService.js`),
prefixed with `VITE_API_URL`.

| Endpoint | Method | Service method | Used by |
|---|---|---|---|
| `/` | GET | `getApiStatus()` | Backend connectivity check on load |
| `/ai-status` | GET | `getAiStatus()` | AI readiness check on load |
| `/generate-video` | POST | `generateVideo()` (wrapped by `generateVideoWithPolling()`) | VideoGenerator submit |
| `/status/:videoId` | GET | `getVideoStatus()` (polled by `pollVideoStatus()`) | VideoGenerator progress |
| `/videos` | GET | `listVideos()` | Loads the library on page load |
| `/download/:videoId` | GET | `downloadVideo()` / `downloadVideoBlob()` | VideoLibrary download & inline `<video>` preview |
| `/delete/:videoId` | DELETE | `deleteVideo()` | VideoLibrary delete |

On mount, `App.jsx` calls `GET /videos` to load the library from the backend's
persisted index, so previously generated videos persist across page refreshes
rather than resetting every load.

## 8. Troubleshooting

- **"Backend Offline" / "Disconnected" status** — almost always CORS. The
  backend's `ALLOWED_ORIGINS` must include this app's exact origin
  (`http://localhost:3000` locally, or the deployed frontend URL in production).
- **Page unreachable at `localhost:5173`** — this app runs on port **3000**, not
  Vite's default. Use `http://localhost:3000`.
- **Generate button stays disabled** — the backend status check (`GET /`) is
  failing. Confirm the backend is running and that `VITE_API_URL` points to it
  correctly.
- **Generation takes 30–90+ seconds** — this is normal; Manim rendering is slow,
  especially at higher quality settings.
- **AI status shows "Limited" / generation used "Fallback Mode"** — the backend's
  AI provider (e.g. Gemini) is hitting a quota or model error. Check the backend
  logs, not the frontend.

## 9. Deployment (Vercel)

1. Connect the repo in Vercel, framework preset **Vite**.
2. Set the `VITE_API_URL` environment variable to the deployed backend's URL
   (no trailing slash).
3. Deploy.
4. Update the backend's `ALLOWED_ORIGINS` to include the Vercel deployment URL,
   then redeploy the backend (CORS is enforced server-side, so the frontend
   won't work until the backend allows its origin).

## 10. Build

```bash
npm run build
```

Output is written to `dist/` (`build.outDir` in `vite.config.js`), with
sourcemaps enabled. Preview a production build locally with `npm run preview`.

## 11. Git and secrets

- Never commit `.env`. Commit only `.env.example`. `VITE_API_URL` itself isn't a
  secret (Vite inlines it into the browser bundle, so it's public either way),
  but keep the habit — never put an API key or secret in a `VITE_`-prefixed
  variable, since **everything prefixed `VITE_` ships to the browser and is
  publicly readable**.
- `.gitignore` should include at least:
  ```
  .env
  node_modules/
  dist/
  ```
- First push to a new remote:
  ```bash
  git init
  git add .
  git status
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin <repo-url>
  git push -u origin main
  ```
  Before pushing, confirm `.env` isn't tracked:
  ```bash
  git ls-files | grep -E "\.env$"
  ```
  This should print nothing.

## 12. Deployment checklist

- [ ] Backend deployed first and its URL copied
- [ ] `VITE_API_URL` set in Vercel to that URL, no trailing slash
- [ ] Deployed
- [ ] Backend's `ALLOWED_ORIGINS` updated with the Vercel URL, backend redeployed
- [ ] Tested: status pill shows Connected, a video generates, library persists
      after refresh
- [ ] Remember: changing `VITE_API_URL` later requires a Vercel redeploy
