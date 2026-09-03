# ElevateCV

**Build better resumes with AI.** ElevateCV is a modern, privacy-first career intelligence platform designed to help you land your dream job by analyzing, scoring, and formatting your resume to beat Applicant Tracking Systems (ATS).

![ElevateCV Dashboard](/Frontend/public/og-image.png)

## Why ElevateCV?

Most AI resume builders generate obvious, heavily formatted "slop" that gets rejected by modern ATS and turns off recruiters. ElevateCV takes a different approach:
- **Clean, professional exports:** Generates minimalist, highly-readable PDFs that parse perfectly in Greenhouse, Lever, and Workday.
- **Data-driven scoring:** Instead of just rewriting your text, it grades your resume against a target job description and highlights exactly which keywords you're missing.
- **Privacy first:** Your career data stays yours. No tracking pixels, no hidden data harvesting.

## Features

- **Resume Builder:** A distraction-free, side-by-side editor with real-time PDF generation.
- **Job Matcher:** Paste a job description and instantly see your alignment score and missing skills.
- **Smart Templates:** A curated selection of ATS-optimized templates that don't sacrifice design for parsability.
- **Cover Letter Generation:** Context-aware generation based on your resume data and the specific role.

## Tech Stack

ElevateCV is built for speed and maintainability:

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (Custom Charcoal & Emerald design system), Framer Motion
- **PDF Generation:** jsPDF + html2canvas
- **Backend/AI:** Node.js, Express, Google Gemini Pro 1.5, Firebase Auth

## Getting Started

### Prerequisites
- Node.js >= 18
- A Firebase project (for authentication)
- A Google Gemini API Key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SHREESHANTH99/ElevateCv.git
   cd ElevateCv
   ```

2. **Setup Frontend**
   ```bash
   cd Frontend
   npm install
   # Create a .env file and add your Firebase config and API URL
   npm run dev
   ```

3. **Setup Backend**
   ```bash
   cd Backend
   npm install
   # Create a .env file and add your Gemini API Key
   npm run start
   ```

## Security & Privacy
ElevateCV includes rate-limiting and Helmet out of the box to prevent abuse. Ensure you configure your production CORS settings to your specific deployment domains.

## License
MIT
