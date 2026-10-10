# ElevateCV

ElevateCV is an AI-assisted resume builder and job-application workspace. It combines a React resume editor with resume versioning, ATS-style scoring, job matching, AI-assisted tailoring, PDF generation, and application tracking.

The repository contains three cooperating services:

- **Frontend**: React 18 + TypeScript + Vite application.
- **Backend**: Node.js + Express REST API for authentication, resume data, AI workflows, PDF export, and applications.
- **Python service**: FastAPI microservice for local sentence-transformer embeddings, PDF layout extraction, section segmentation, and spaCy entity extraction.

## Features

- Resume creation, editing, deletion, export, and live template previews.
- Multiple resume templates, including ATS, classic, corporate, creative, engineer, executive, graduate, minimalist, modern, and tech layouts.
- Resume version history, comparison, and restore.
- Resume parsing and uploaded-PDF analysis.
- ATS-style resume scoring with keyword, required-skill, project, education, summary, and quantification dimensions.
- Job-description analysis and semantic job matching.
- AI-assisted bullet improvement and resume tailoring.
- Cover-letter generation.
- Application tracking with status statistics.
- Firebase authentication with JWT-backed API sessions.
- Local semantic embeddings using `all-MiniLM-L6-v2`, with Gemini embeddings as a fallback.
- Server-side PDF rendering with Puppeteer.
- Redis-backed caching with an in-memory cache layer.
- Health endpoints for the Node and Python services.

## Architecture

```text
┌──────────────────────────────┐
│ React/Vite frontend :5173    │
│ Frontend/                     │
└──────────────┬───────────────┘
               │ REST + cookies/JWT
               ▼
┌──────────────────────────────┐
│ Express API :5000            │
│ Backend/                     │
│ auth, resumes, AI, apps      │
└───────┬───────────┬──────────┘
        │           │
        │           ├── MongoDB (persistent data)
        │           ├── Redis (cache)
        │           ├── Firebase Admin (token verification)
        │           └── Gemini API (generation/fallback embeddings)
        │
        ▼
┌──────────────────────────────┐
│ FastAPI service :8000        │
│ PythonService/               │
│ embeddings, PDF layout, NER  │
└──────────────────────────────┘
```

The backend calls the Python service through `PYTHON_SERVICE_URL`. If the Python service is unavailable, layout and entity extraction degrade gracefully, and semantic matching can fall back from local embeddings to Gemini.

## Repository layout

```text
.
├── Backend/
│   ├── config/                 # MongoDB, Redis, and Firebase setup
│   ├── middleware/             # Authentication middleware
│   ├── models/                 # Mongoose models
│   ├── routes/                 # Auth, resume, AI, and application routes
│   ├── scripts/                # Lifecycle, benchmark, and verification scripts
│   ├── tests/                  # Backend Vitest tests
│   └── utils/                  # AI, parsing, caching, scoring, and PDF helpers
├── Frontend/
│   ├── src/Components/         # Shared UI and resume components
│   ├── src/Pages/              # Application pages
│   ├── src/services/           # Frontend API and Firebase clients
│   ├── tests/e2e/              # Playwright end-to-end tests
│   └── public/                 # Static assets and template previews
├── PythonService/
│   ├── app.py                  # FastAPI application
│   ├── layout_extractor.py     # PDF layout extraction
│   ├── segmenter.py            # Layout block sectioning
│   ├── ner_extractor.py        # spaCy entity extraction
│   └── requirements.txt
├── start.bat                   # Windows helper for frontend/backend startup
└── vercel.json                 # Frontend deployment configuration
```

## Prerequisites

- Node.js 18 or newer and npm 8 or newer.
- Python 3.10+ recommended.
- MongoDB for persistent storage. MongoDB Atlas or a local MongoDB instance both work.
- Redis for the cache layer. A local Redis server or a hosted Redis-compatible service works.
- A Firebase project with Authentication enabled.
- A Google Gemini API key for AI generation and the embedding fallback.
- Chromium dependencies supported by Puppeteer for server-side PDF generation.

The backend can run without MongoDB by setting `USE_IN_MEMORY_STORAGE=true`. This mode is intended for demos and tests; data is lost when the process exits.

## Installation

Clone the repository and install each JavaScript workspace:

```bash
git clone https://github.com/SHREESHANTH99/ElevateCv.git
cd ElevateCv

cd Backend
npm install

cd ..\Frontend
npm install
```

Create and activate a Python virtual environment, then install the Python dependencies:

```bash
cd ..\PythonService
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

The spaCy model is optional for starting the service, but entity extraction returns empty results when `en_core_web_sm` is not installed.

## Configuration

### Backend environment

Create `Backend\.env`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Persistent storage
MONGODB_URI=mongodb://localhost:27017/elevatecv
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account", "...":"..."}

# AI and Python services
GEMINI_API_KEY=your-gemini-api-key
PYTHON_SERVICE_URL=http://127.0.0.1:8000

# Optional observability
SENTRY_DSN=
```

`FIREBASE_SERVICE_ACCOUNT_KEY` must contain the service-account JSON as a single environment-variable value. Do not commit it or any other secret.

For a backend-only demo without MongoDB:

```env
USE_IN_MEMORY_STORAGE=true
JWT_SECRET=local-development-secret
```

When `MONGODB_URI` is missing or the MongoDB connection fails, the backend also switches to its in-memory storage fallback. Redis and Gemini remain optional at runtime, but disabling them reduces caching and AI functionality.

### Frontend environment

Create `Frontend\.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

Only variables prefixed with `VITE_` are exposed to the browser. Firebase web configuration is not a replacement for protecting backend secrets.

## Running locally

Start the Python service:

```bash
cd PythonService
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal, start the backend:

```bash
cd Backend
npm run dev
```

In a third terminal, start the frontend:

```bash
cd Frontend
npm run dev
```

Open `http://localhost:5173`.

On Windows, `start.bat` can start the Node backend and frontend together. Its full backend option expects MongoDB; the in-memory option is suitable for a quick demo. The script does not start the Python service, so start that service separately when using embeddings or PDF layout extraction.

The root scripts are frontend-focused:

```bash
npm run dev       # equivalent to cd Frontend && npm run dev
npm run build     # installs frontend dependencies and builds Frontend
npm start         # serves the built frontend with Vite preview
```

## API surface

The backend listens on `http://localhost:5000` and exposes:

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | Registration, login, Firebase login/register, profile, avatar upload, current user, logout |
| `/api/resume` | Resume CRUD, export, versions, comparison, restore, and tailoring-related resume operations |
| `/api/ai` | Resume/job analysis, ATS simulation, scoring, parsing, bullet analysis/improvement, tailoring, and uploaded-resume analysis |
| `/api/applications` | Application CRUD and application statistics |
| `/api/health` | MongoDB, Redis, and Gemini queue status |

The Python service listens on `http://127.0.0.1:8000`:

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Service and embedding-model status |
| `POST /embed` | Generate up to 10 normalized `all-MiniLM-L6-v2` embeddings |
| `POST /extract-layout` | Extract PDF blocks and segmented resume sections |
| `POST /segment-layout` | Segment supplied layout blocks into resume sections |
| `POST /extract-entities` | Extract dates, organizations, and locations with spaCy |

Most `/api` routes require an authenticated session. See the route files in `Backend/routes/` for request and response details.

## Testing and quality checks

Run backend unit tests:

```bash
cd Backend
npm test
```

Run frontend linting and a production build:

```bash
cd Frontend
npm run lint
npm run build
```

Run the Playwright end-to-end test. The test mocks backend requests, so it can run without MongoDB or Gemini:

```bash
cd Frontend
npx playwright test
```

Run the Python service smoke test after starting the service:

```bash
cd PythonService
python test_service.py
```

Additional backend verification and benchmark scripts are available in `Backend/scripts/`, including resume versioning, tailoring guards, pipeline checks, and application tracking.

## Deployment

The frontend is configured for Vercel through [`vercel.json`](./vercel.json). Its build output is `Frontend/dist`, and the rewrite sends client-side routes to `index.html`.

The backend and Python service are separate processes and must be deployed as services that can reach:

- the configured MongoDB instance;
- the configured Redis instance;
- Firebase Admin credentials;
- the Gemini API;
- each other through `FRONTEND_URL` and `PYTHON_SERVICE_URL`.

Set production environment variables in the hosting provider rather than committing `.env` files. Configure the frontend `VITE_API_URL` to the public backend URL and configure backend CORS with the public frontend URL.

## Security and operational notes

- Never commit API keys, JWT secrets, Firebase service-account JSON, database credentials, or Redis credentials.
- Use a long, random `JWT_SECRET` outside local development.
- Keep `FRONTEND_URL` restricted to trusted origins in production.
- The backend applies Helmet, compression, request-size limits, rate limiting, and Sentry error handling.
- Gemini requests are queued and retried for rate-limit responses.
- The `/api/health` endpoint returns `503` when MongoDB or Redis is not ready.
- In-memory storage is non-persistent and must not be used for production data.

## License

The backend package declares an MIT license. Confirm the intended repository-wide licensing terms before distributing the complete application.
