# ElevateCV

**ElevateCV** is an open-source, production-grade AI resume builder and job matching platform. Designed to help job seekers bypass Applicant Tracking Systems (ATS), it combines traditional resume formatting with advanced semantic analysis, powered by Google's Gemini LLM and Python-based vector embeddings.

![ElevateCV Overview](https://img.shields.io/badge/Status-Production_Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-MERN_%7C_Redis-blue)
![AI](https://img.shields.io/badge/AI-Gemini_1.5_Flash-orange)

## ✨ Core Features

* **Intelligent ATS Scoring:** Get instant, actionable feedback on how your resume performs against industry-standard ATS algorithms.
* **Semantic Job Matcher:** Paste a job description and instantly see your alignment. We use LLM skill extraction paired with Gemini text-embedding-004 semantic similarity (vector embeddings) to score your match and identify missing keywords.
* **Smart Section Rewriting:** Hit writer's block? Let our controlled AI pipeline rewrite your experience bullets for maximum professional impact.
* **True ATS-Readable PDF Export:** Unlike many builders that export unparseable images, ElevateCV uses a server-side headless Chrome (Puppeteer) engine to render pixel-perfect, fully text-selectable PDFs across 10+ professional templates.
* **Real-time Previews:** See your resume update instantly as you type, with modern, accessible UI powered by React and Tailwind CSS.

## 🛠️ Technology Stack

**Frontend**
* React 18 (Vite)
* Tailwind CSS & Framer Motion (Styling & Animation)
* Firebase Authentication (Google OAuth & Email/Password)
* Zustand (State Management)

**Backend Core**
* Node.js & Express.js
* MongoDB (Mongoose ODM)
* Redis (ioredis)
* Puppeteer (Server-side PDF Rendering)

**AI & Microservices**
* Google Gemini 1.5 Flash (Generative text & extraction)
* Gemini `text-embedding-004` (Native Node.js Semantic Vector Embeddings)

## ⚡ Architecture & Performance Highlights

ElevateCV is built to scale, featuring aggressive optimization and defense-in-depth engineering:

* **Hybrid L1/L2 Caching:** Heavy AI computations are backed by an in-memory Map (L1) and Redis (L2), instantly returning cached ATS scores for exact Resume/Job Description combinations.
* **Cache Stampede Protection:** In-flight Promise deduplication locks ensure that simultaneous identical requests never burn redundant LLM quota.
* **Global Rate Limiting:** All Gemini API calls route through a strict `bottleneck` queue (15 RPM), equipped with exponential backoff, auto-retries on `429 Too Many Requests`, and graceful `503` fallbacks to prevent pipeline crashes.
* **Parallelized AI Pipelines:** Distinct LLM tasks and Python embedding lookups are executed concurrently via `Promise.all` with strict timeout bounds (8-10s).
* **Warm Puppeteer Instancing:** Drops PDF generation latency by 2-5 seconds per request by maintaining a persistent, self-healing headless Chrome instance rather than booting on every request.
* **Query Optimization:** Lean Mongoose querying strips heavy document hydration overhead across all authenticated routes.
* **DevOps Ready:** Integrated with Sentry (v10) for full-stack error tracing, comprehensive `/api/health` diagnostics, and daily automated MongoDB backups via GitHub Actions.

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* MongoDB instance (Local or Atlas)
* Redis server (Local or Upstash)
* Firebase Project & Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/SHREESHANTH99/ElevateCv.git
cd ElevateCv
```

### 2. Backend Setup
```bash
cd Backend
npm install
```
Create a `.env` file in the `Backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elevatecv
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
```
Create a `.env` file in the `Frontend` directory with your Firebase config and Backend URL:
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
# ... other firebase vars
```
Start the frontend dev server:
```bash
npm run dev
```

## 🛡️ Security Note
This project utilizes `.env` files for configuration. **Never** commit your API keys, database credentials, or JWT secrets to version control.

---
*Built to help you land the interview.*
