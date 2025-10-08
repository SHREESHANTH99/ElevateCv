# ElevateCV - Resume Builder

eb application for creating professional resumes. Build your resume with our easy-to-use builder and choose from multiple templates.

## What you can do

- **Build resumes easily** - Use our step-by-step builder to create your resume
- **Choose from templates** - Pick from 9 different professional templates
- **Preview in real-time** - See how your resume looks as you type
- **Works on mobile** - Use it on your phone, tablet, or computer
- **Download as PDF** - Get your resume as a PDF file
- **Save multiple resumes** - Create different versions for different jobs
- **Job matching** - See how well your resume matches job descriptions
- **User accounts** - Sign up to save your work

## Available Templates

We have 9 professional resume templates:

- **ATS Template** - Works well with job application systems
- **Classic Template** - Traditional and professional look
- **Corporate Template** - Perfect for business jobs
- **Creative Template** - Great for creative fields
- **Engineer Template** - Designed for technical roles
- **Executive Template** - For leadership positions
- **Graduate Template** - Perfect for new graduates
- **Minimalist Template** - Clean and simple design
- **Tech Template** - Made for tech professionals

### � **Comprehensive Dashboard**

- **Career Analytics**: Track resume views, match scores, and progress
- **Achievement System**: Gamified experience with milestone badges
- **Activity Timeline**: Monitor your career development journey
- **Quick Actions**: Fast access to all platform features
- **Personalized Greeting**: Dynamic, time-aware welcome messages

### � **User Profile Management**

- **Streamlined Profile**: Clean, focused user information management
- **Resume Library**: Organized collection of all your resumes
- **Theme Preferences**: Light/dark mode customization
- **Account Security**: Secure profile and password management

## Technology used

**Frontend:**

- React with TypeScript
- Tailwind CSS for styling
- Vite for fast development

**Backend:**

- Node.js with Express
- MongoDB for data storage
- JWT for user authentication

## Setup and Installation

### What you need

- Node.js (version 16 or higher)
- MongoDB
- npm or yarn

### Getting started

1. **Download the code**

```bash
git clone https://github.com/SHREESHANTH99/ElevateCv.git
cd ElevateCv
```

2. **Setup the backend**

```bash
cd Backend
npm install
```

Create a `.env` file in the Backend folder:

```
MONGODB_URI=mongodb://localhost:27017/elevatecv
JWT_SECRET=your-secret-key-here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

3. **Setup the frontend**

```bash
cd Frontend
npm install
```

4. **Start the application**

First, start the backend:

```bash
cd Backend
npm start
```

Then start the frontend:

```bash
cd Frontend
npm run dev
```

5. **Open your browser** and go to `http://localhost:5173`

## API Routes

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/resume` - Get your resumes
- `POST /api/resume` - Save a resume
- `DELETE /api/resume/:id` - Delete a resume
- `POST /api/resume/export` - Download resume as PDF

## Project structure

```
ElevateCv/
├── Backend/           # Server code
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Auth and other middleware
│   └── server.js      # Main server file
├── Frontend/          # Web app code
│   ├── src/
│   │   ├── Components/    # Reusable components
│   │   ├── Pages/         # Different pages
│   │   └── types/         # TypeScript types
│   └── package.json
└── README.md
```

## Contributing

Want to help improve this project?

1. Fork this repository
2. Create a new branch for your changes
3. Make your improvements
4. Submit a pull request

## License

This project is open source and available under the MIT License.

## Need help?

If you run into problems or have questions, please create an issue on GitHub.
