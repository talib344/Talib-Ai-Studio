# Talib AI Studio

A production-grade AI content automation platform for YouTube documentary creators. Generate complete documentary videos from a single topic through a continuous pipeline:

**Topic → Research → Script → Scene Breakdown → Image Prompts → Assets → Voice → Video → Thumbnail → SEO → Upload**

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- React Router (routing)
- TanStack React Query (data)
- React Hook Form (forms)
- Zustand (state)
- Lucide Icons
- Recharts (analytics)

**Backend (scaffold)**
- Python FastAPI
- REST API, async endpoints, modular services
- SQLAlchemy + SQLite

**Design**
- Dark theme, glassmorphism, modern gradients
- Animated cards, floating panels, smooth transitions
- Premium SaaS UI, desktop-first responsive

## Project Structure

```
talib-ai-studio/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── .env.example
├── requirements.txt
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── lib/
│   │   ├── utils.ts          # helpers
│   │   ├── store.ts          # Zustand stores
│   │   ├── data.ts           # dashboard seed data
│   │   └── aiService.ts      # local generation service
│   ├── components/
│   │   ├── ui/               # reusable primitives
│   │   │   ├── Primitives.tsx
│   │   │   └── Generating.tsx
│   │   ├── landing/
│   │   │   └── LandingPage.tsx
│   │   └── dashboard/
│   │       ├── Sidebar.tsx
│   │       ├── Topbar.tsx
│   │       └── DashboardLayout.tsx
│   └── pages/
│       ├── DashboardHome.tsx
│       ├── ResearchPage.tsx
│       ├── ScriptPage.tsx
│       ├── ScenesPage.tsx
│       ├── ImagePromptsPage.tsx
│       ├── AssetsPage.tsx
│       ├── VoicePage.tsx
│       ├── VideoPage.tsx
│       ├── ThumbnailPage.tsx
│       ├── SeoPage.tsx
│       ├── UploadPage.tsx
│       ├── AnalyticsPage.tsx
│       └── SettingsPage.tsx
└── backend/
    └── app/
        ├── main.py
        ├── core/config.py
        ├── db/
        │   ├── database.py
        │   └── models.py
        ├── services/
        │   └── pipeline.py
        └── routers/
            ├── research.py
            ├── script.py
            ├── scenes.py
            ├── image_prompts.py
            ├── assets.py
            ├── voice.py
            ├── video.py
            ├── thumbnail.py
            ├── seo.py
            ├── upload.py
            ├── analytics.py
            └── settings.py
```

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`. The studio is fully interactive in the browser — every module generates real, structured output through a local simulation service, so you can explore the full pipeline without any API keys.

### Backend (optional)

```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

## Configuration

Copy `.env.example` to `.env` and fill in keys as needed. All keys are optional — the frontend runs in interactive demo mode without them. No credentials are ever hard-coded.

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Frontend → backend API base URL |
| `OPENAI_API_KEY` | LLM generation (scripts, SEO, research) |
| `IMAGE_API_KEY` | Image / asset generation |
| `VOICE_API_KEY` | Text-to-speech narration |
| `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` | YouTube OAuth upload |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Facebook upload |

## Modules

| Module | What it does |
|---|---|
| Dashboard | Overview — videos created, research, pending tasks, API status, recent projects, quick actions, activity feed |
| Topic Research | Trending ideas with difficulty, virality, competition and estimated-view scoring |
| Script Generator | Hooks, scene-by-scene narration, endings and CTAs for 8–12 min videos |
| Scene Generator | Timed scene list with visuals, transitions and timeline |
| Image Prompts | Cinematic prompts across realistic, documentary, news, war, history, politics, nature |
| Asset Manager | Royalty-free image/video browser with preview and download |
| Voice | Multilingual narrators with speed, pitch, live preview and generation |
| Video Generator | Visualized render pipeline, timeline, queue and 1080p export |
| Thumbnail | Headlines, prompts, CTR suggestions and color palettes |
| SEO | Titles, description, tags, hashtags, keywords and SEO score |
| Upload | YouTube / Facebook publishing, scheduling, progress and history |
| Analytics | Views, CTR, watch time, retention, top videos, topic recommendations |
| Settings | API keys (empty placeholders), theme, language, storage, logs |

## Security

- All API keys are loaded from environment variables — never hard-coded.
- The upload module uses an OAuth-ready architecture with no stored credentials.
- Settings fields for keys are empty placeholders only.

## License

Built for demonstration purposes.
