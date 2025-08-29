import React, { useState, useEffect } from "react";
import {
  Save,
  Download,
  Eye,
  Settings,
  Plus,
  Trash2,
  Edit,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  LogOut,
  LogIn,
} from "lucide-react";

// API Configuration
// const API_BASE_URL =
//   process.env.REACT_APP_API_URL || "http://localhost:5000/api";
interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

interface Experience {
  id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

interface Skill {
  id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
}

interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate: string;
  endDate?: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

interface User {
  id: string;
  email: string;
}
class ResumeAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    localStorage.setItem("authToken", data.token);
    return data;
  }

  static async register(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();
    localStorage.setItem("authToken", data.token);
    return data;
  }

  static async loadResume(): Promise<ResumeData> {
    const response = await fetch(`${API_BASE_URL}/resume`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to load resume");
    }

    return response.json();
  }

  static async saveResume(data: ResumeData) {
    const response = await fetch(`${API_BASE_URL}/resume`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save resume");
    }

    return response.json();
  }

  static async exportToPDF(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/resume/export`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to export PDF");
    }

    return response.blob();
  }

  static async getAISuggestions(section: string, currentData: any) {
    const response = await fetch(`${API_BASE_URL}/ai/suggestions`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ section, currentData }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI suggestions");
    }

    return response.json();
  }

  static logout() {
    localStorage.removeItem("authToken");
  }

  static isAuthenticated() {
    return !!localStorage.getItem("authToken");
  }
}
const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: User) => void;
}> = ({ isOpen, onClose, onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = isLogin
        ? await ResumeAPI.login(email, password)
        : await ResumeAPI.register(email, password);

      onAuth(result.user);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isLogin ? "Login" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                {isLogin ? "Logging in..." : "Creating account..."}
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                {isLogin ? "Login" : "Create Account"}
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {isLogin
              ? "Don't have an account? Create one"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResumeBuilder: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  });

  const [summary, setSummary] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => {
    if (ResumeAPI.isAuthenticated()) {
      loadResumeData();
    } else {
      setShowAuthModal(true);
    }
  }, []);

  const handleAuth = (userData: User) => {
    setUser(userData);
    loadResumeData();
  };

  const handleLogout = () => {
    ResumeAPI.logout();
    setUser(null);
    setShowAuthModal(true);
    setPersonalInfo({
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    });
    setSummary("");
    setExperiences([]);
    setEducation([]);
    setSkills([]);
    setProjects([]);
  };

  const loadResumeData = async () => {
    try {
      const data = await ResumeAPI.loadResume();
      setPersonalInfo(data.personalInfo);
      setSummary(data.summary);
      setExperiences(data.experiences || []);
      setEducation(data.education || []);
      setSkills(data.skills || []);
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error loading resume data:", error);
      setSaveStatus("error");
    }
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const resumeData: ResumeData = {
        personalInfo,
        summary,
        experiences,
        education,
        skills,
        projects,
      };

      await ResumeAPI.saveResume(resumeData);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving resume:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const exportToPDF = async () => {
    try {
      setSaveStatus("saving");
      const blob = await ResumeAPI.exportToPDF();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${personalInfo.fullName || "resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error exporting PDF. Please try again.");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const getAISuggestions = async () => {
    try {
      const currentData = {
        personal: activeSection === "personal" ? personalInfo : null,
        summary: activeSection === "summary" ? summary : null,
        experiences: activeSection === "experience" ? experiences : null,
        education: activeSection === "education" ? education : null,
        skills: activeSection === "skills" ? skills : null,
        projects: activeSection === "projects" ? projects : null,
      };

      const response = await ResumeAPI.getAISuggestions(
        activeSection,
        currentData
      );
      setAiSuggestions(response.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      alert("Unable to get AI suggestions at this time");
    }
  };

  const sections = [
    {
      id: "personal",
      label: "Personal Info",
      icon: User,
      completed: personalInfo.fullName !== "" && personalInfo.email !== "",
    },
    {
      id: "summary",
      label: "Summary",
      icon: FileText,
      completed: summary.trim().length > 10,
    },
    {
      id: "experience",
      label: "Experience",
      icon: Briefcase,
      completed: experiences.length > 0,
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      completed: education.length > 0,
    },
    {
      id: "skills",
      label: "Skills",
      icon: Code,
      completed: skills.length > 0,
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderOpen,
      completed: projects.length > 0,
    },
  ];
  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [""],
    };
    setExperiences([...experiences, newExp]);
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setExperiences(
      experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    };
    setEducation([...education, newEdu]);
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setEducation(
      education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: "",
      level: "Intermediate",
      category: "Technical",
    };
    setSkills([...skills, newSkill]);
  };

  const updateSkill = (id: string, field: string, value: any) => {
    setSkills(
      skills.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    );
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((skill) => skill.id !== id));
  };
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: [],
      url: "",
      github: "",
      startDate: "",
      endDate: "",
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, field: string, value: any) => {
    setProjects(
      projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  const updateProjectTechnologies = (id: string, techs: string) => {
    const techArray = techs
      .split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech);
    updateProject(id, "technologies", techArray);
  };
  const ResumePreview = () => (
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto">
      <div className="border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="mt-2 text-gray-600 space-y-1">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
          {personalInfo.website && <div>{personalInfo.website}</div>}
        </div>
      </div>

      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Professional Summary
          </h2>
          <p className="text-gray-700">{summary}</p>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Experience
          </h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {exp.position}
                  </h3>
                  <p className="text-gray-700">{exp.company}</p>
                </div>
                <div className="text-right text-gray-600 text-sm">
                  <div>{exp.location}</div>
                  <div>
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </div>
                </div>
              </div>
              {exp.description[0] && (
                <div className="mt-2 text-gray-700 text-sm">
                  {exp.description[0].split("\n").map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {edu.degree} in {edu.field}
                  </h3>
                  <p className="text-gray-700">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
                  )}
                </div>
                <div className="text-right text-gray-600 text-sm">
                  <div>{edu.location}</div>
                  <div>
                    {edu.startDate} - {edu.endDate}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Skills</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(
              skills.reduce((acc, skill) => {
                const category = skill.category;
                if (!acc[category]) acc[category] = [];
                acc[category].push(skill);
                return acc;
              }, {} as Record<string, Skill[]>)
            ).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                <div className="space-y-1">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="flex justify-between">
                      <span className="text-gray-700">{skill.name}</span>
                      <span className="text-gray-500 text-sm">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Projects</h2>
          {projects.map((project) => (
            <div key={project.id} className="mb-4">
              <h3 className="font-semibold text-gray-900">{project.name}</h3>
              <p className="text-gray-700 text-sm mt-1">
                {project.description}
              </p>
              {project.technologies.length > 0 && (
                <div className="mt-2">
                  <span className="text-gray-600 text-sm">Technologies: </span>
                  <span className="text-gray-700 text-sm">
                    {project.technologies.join(", ")}
                  </span>
                </div>
              )}
              <div className="mt-1 text-gray-600 text-sm">
                {project.startDate} - {project.endDate || "Present"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  const AISuggestionsModal = () =>
    showSuggestions && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">AI Suggestions</h3>
            <button
              onClick={() => setShowSuggestions(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      </div>
    );

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm border-b p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">Resume Preview</h1>
            <div className="flex space-x-3">
              <button
                onClick={exportToPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Close Preview
              </button>
            </div>
          </div>
        </div>
        <div className="p-8">
          <ResumePreview />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />
      <AISuggestionsModal />

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-600 mt-2">
            Create your professional resume step by step
            {user && (
              <span className="ml-2 text-sm">• Logged in as {user.email}</span>
            )}
          </p>
        </div>
        <div className="flex space-x-3">
          {user && (
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || !user}
            className={`px-4 py-2 rounded-lg flex items-center ${
              saveStatus === "saving"
                ? "bg-gray-400 text-white cursor-not-allowed"
                : saveStatus === "saved"
                ? "bg-green-600 text-white"
                : saveStatus === "error"
                ? "bg-red-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saveStatus === "saving" ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : saveStatus === "error" ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                Error
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </button>
          <button
            onClick={exportToPDF}
            disabled={!user}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Resume Sections
            </h3>
            <div className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      activeSection === section.id
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <IconComponent className="w-4 h-4 mr-2" />
                      <span>{section.label}</span>
                    </div>
                    {section.completed && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">AI Assistant</h4>
              <p className="text-sm text-blue-700 mb-3">
                Get AI-powered suggestions for better content
              </p>
              <button
                onClick={getAISuggestions}
                disabled={!user}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Get Suggestions
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow">
            {activeSection === "personal" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.fullName}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={personalInfo.linkedin}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          linkedin: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/in/johndoe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={personalInfo.website}
                      onChange={(e) =>
                        setPersonalInfo({
                          ...personalInfo,
                          website: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://johndoe.com"
                    />
                  </div>
                </div>
              </div>
            )}
            {activeSection === "summary" && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Professional Summary
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary *
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write a compelling summary that highlights your key qualifications, experience, and career objectives. Keep it concise and impactful (2-3 sentences)."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Start with your years of experience, mention your key
                    skills, and highlight your biggest achievement or career
                    goal.
                  </p>
                </div>
              </div>
            )}
            {activeSection === "experience" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Work Experience
                  </h2>
                  <button
                    onClick={addExperience}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </button>
                </div>

                <div className="space-y-6">
                  {experiences.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">
                          Experience #{index + 1}
                        </h3>
                        <button
                          onClick={() => removeExperience(exp.id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title *
                          </label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) =>
                              updateExperience(
                                exp.id!,
                                "position",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company *
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              updateExperience(
                                exp.id!,
                                "company",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Google"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) =>
                              updateExperience(
                                exp.id!,
                                "location",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="San Francisco, CA"
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Start Date *
                            </label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) =>
                                updateExperience(
                                  exp.id!,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              End Date
                            </label>
                            <input
                              type="month"
                              value={exp.endDate || ""}
                              onChange={(e) =>
                                updateExperience(
                                  exp.id!,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              disabled={exp.current}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={exp.current}
                            onChange={(e) => {
                              updateExperience(
                                exp.id!,
                                "current",
                                e.target.checked
                              );
                              if (e.target.checked) {
                                updateExperience(exp.id!, "endDate", "");
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            I currently work here
                          </span>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={exp.description[0] || ""}
                          onChange={(e) =>
                            updateExperience(exp.id!, "description", [
                              e.target.value,
                            ])
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe your responsibilities, achievements, and impact..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use bullet points and quantify achievements when
                          possible
                        </p>
                      </div>
                    </div>
                  ))}

                  {experiences.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-gray-400 mb-4">
                        <Briefcase className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        No work experience added yet
                      </p>
                      <button
                        onClick={addExperience}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                      >
                        Add Your First Experience
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSection === "education" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Education
                  </h2>
                  <button
                    onClick={addEducation}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </button>
                </div>

                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div
                      key={edu.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">
                          Education #{index + 1}
                        </h3>
                        <button
                          onClick={() => removeEducation(edu.id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Institution *
                          </label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) =>
                              updateEducation(
                                edu.id!,
                                "institution",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Stanford University"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Degree *
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) =>
                              updateEducation(edu.id!, "degree", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Bachelor of Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Field of Study *
                          </label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) =>
                              updateEducation(edu.id!, "field", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) =>
                              updateEducation(
                                edu.id!,
                                "location",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Stanford, CA"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date *
                          </label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) =>
                              updateEducation(
                                edu.id!,
                                "startDate",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date *
                          </label>
                          <input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) =>
                              updateEducation(
                                edu.id!,
                                "endDate",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GPA (Optional)
                          </label>
                          <input
                            type="text"
                            value={edu.gpa || ""}
                            onChange={(e) =>
                              updateEducation(edu.id!, "gpa", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="3.8/4.0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Info
                          </label>
                          <input
                            type="text"
                            value={edu.description || ""}
                            onChange={(e) =>
                              updateEducation(
                                edu.id!,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Magna Cum Laude, Dean's List"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {education.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-gray-400 mb-4">
                        <GraduationCap className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        No education added yet
                      </p>
                      <button
                        onClick={addEducation}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                      >
                        Add Your First Education
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSection === "skills" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Skills
                  </h2>
                  <button
                    onClick={addSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </button>
                </div>

                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div
                      key={skill.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-900">
                          Skill #{index + 1}
                        </h3>
                        <button
                          onClick={() => removeSkill(skill.id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skill Name *
                          </label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill(skill.id!, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="JavaScript"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level *
                          </label>
                          <select
                            value={skill.level}
                            onChange={(e) =>
                              updateSkill(skill.id!, "level", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                          </label>
                          <select
                            value={skill.category}
                            onChange={(e) =>
                              updateSkill(skill.id!, "category", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Technical">Technical</option>
                            <option value="Programming">Programming</option>
                            <option value="Framework">Framework</option>
                            <option value="Database">Database</option>
                            <option value="Tools">Tools</option>
                            <option value="Soft Skills">Soft Skills</option>
                            <option value="Languages">Languages</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {skills.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-gray-400 mb-4">
                        <Code className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-4">No skills added yet</p>
                      <button
                        onClick={addSkill}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                      >
                        Add Your First Skill
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSection === "projects" && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Projects
                  </h2>
                  <button
                    onClick={addProject}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </button>
                </div>

                <div className="space-y-6">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-gray-900">
                          Project #{index + 1}
                        </h3>
                        <button
                          onClick={() => removeProject(project.id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name *
                          </label>
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) =>
                              updateProject(project.id!, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="E-commerce Platform"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Technologies *
                          </label>
                          <input
                            type="text"
                            value={project.technologies.join(", ")}
                            onChange={(e) =>
                              updateProjectTechnologies(
                                project.id!,
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="React, Node.js, MongoDB"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Separate technologies with commas
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date *
                          </label>
                          <input
                            type="month"
                            value={project.startDate}
                            onChange={(e) =>
                              updateProject(
                                project.id!,
                                "startDate",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={project.endDate || ""}
                            onChange={(e) =>
                              updateProject(
                                project.id!,
                                "endDate",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Live URL
                          </label>
                          <input
                            type="url"
                            value={project.url || ""}
                            onChange={(e) =>
                              updateProject(project.id!, "url", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://myproject.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GitHub URL
                          </label>
                          <input
                            type="url"
                            value={project.github || ""}
                            onChange={(e) =>
                              updateProject(
                                project.id!,
                                "github",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description *
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) =>
                            updateProject(
                              project.id!,
                              "description",
                              e.target.value
                            )
                          }
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe what the project does, your role, key features, and impact..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Highlight the problem solved, your approach, and
                          results achieved
                        </p>
                      </div>
                    </div>
                  ))}

                  {projects.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-gray-400 mb-4">
                        <FolderOpen className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        No projects added yet
                      </p>
                      <button
                        onClick={addProject}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                      >
                        Add Your First Project
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
