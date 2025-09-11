# ElevateCV - AI-Powered Resume Builder

A comprehensive resume building platform with AI-powered suggestions, job matching, and professional templates.

## Features

- 🚀 **AI-Powered Resume Builder** - Create professional resumes with intelligent suggestions
- 🎯 **Smart Job Matching** - Optimize your resume for specific job postings
- 📝 **Cover Letter Generator** - Generate compelling cover letters
- 📊 **Dashboard Analytics** - Track your job search progress
- 🔒 **Secure Authentication** - JWT-based user authentication
- 📄 **PDF Export** - Download your resume as a professional PDF

## Tech Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Lucide React for icons
- Vite for build tooling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Puppeteer for PDF generation
- Express Rate Limiting for security

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/SHREESHANTH99/ElevateCv.git
cd ElevateCv
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/elevatecv

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173

# AI Service (Optional)
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

## Running the Application

### Development Mode

1. Start the backend server:
```bash
cd Backend
npm start
```

2. Start the frontend development server:
```bash
cd Frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Production Mode

1. Build the frontend:
```bash
cd Frontend
npm run build
```

2. Start the backend server:
```bash
cd Backend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Resume Management
- `GET /api/resume` - Get user's resumes
- `GET /api/resume/:id` - Get specific resume
- `POST /api/resume` - Create or update resume
- `PUT /api/resume/:id` - Update specific resume
- `DELETE /api/resume/:id` - Delete resume
- `POST /api/resume/export` - Export resume as PDF

### AI Features
- `POST /api/ai/suggestions` - Get AI suggestions for resume improvement
- `POST /api/ai/optimize` - Optimize resume for specific job

## Project Structure

```
ElevateCv/
├── Backend/
│   ├── config/
│   │   └── db.ts
│   ├── controllers/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Resume.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resume.js
│   │   └── ai.js
│   ├── utils/
│   ├── package.json
│   └── server.js
├── Frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   └── Navbar.tsx
│   │   ├── Pages/
│   │   │   ├── DashBoard.tsx
│   │   │   ├── ResumeBuilder.tsx
│   │   │   ├── JobMatcher.tsx
│   │   │   ├── CoverLetterGenerator.tsx
│   │   │   ├── Templates.tsx
│   │   │   └── LandingPage.tsx
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Features Overview

### Resume Builder
- Step-by-step resume creation process
- Real-time preview
- AI-powered content suggestions
- Multiple sections: Personal Info, Summary, Experience, Education, Skills, Projects
- Auto-save functionality

### Job Matcher
- Upload or select existing resume
- Paste job description
- Get match score and optimization suggestions
- Keyword analysis
- Section-by-section scoring

### Cover Letter Generator
- Personalized cover letter creation
- Company and position-specific content
- Professional templates
- PDF export functionality

### Templates
- Multiple professional templates
- Category-based filtering
- Preview functionality
- Free and premium options

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- Helmet.js for security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@elevatecv.com or create an issue in the repository.

## Roadmap
- [ ] Resume analytics and insights
- [ ] Application tracking system
- [ ] Interview preparation tools
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Team collaboration features
