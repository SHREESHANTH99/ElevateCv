// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar.tsx";
import Dashboard from "./Pages/DashBoard.tsx";
import ResumeBuilder from "./Pages/ResumeBuilder.tsx";
import JobMatcher from "./Pages/JobMatcher.tsx";
// import CoverLetterGenerator from "./pages/CoverLetterGenerator";
// import ApplicationTracker from "./pages/ApplicationTracker";
// import Templates from "./pages/Templates";
// import Analytics from "./pages/Analytics";
// import Profile from "./Pages/"
import Landing from "./Pages/LandingPage.tsx";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/resume/builder" element={<ResumeBuilder />} />
                  <Route
                    path="/resume/builder/:id"
                    element={<ResumeBuilder />}
                  />
                  <Route path="/job-matcher" element={<JobMatcher />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
