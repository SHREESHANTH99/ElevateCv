import React from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  FileText,
  Target,
  Mail,
  TrendingUp,
  Calendar,
  Award,
  Eye,
  Clock,
  Zap,
  Lightbulb,
  CheckCircle,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;
interface Resume {
  _id: string;
  title: string;
  company?: string;
  matchScore?: number;
  updatedAt: string;
  createdAt: string;
}
class DashboardAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }
  static async getResumes(): Promise<Resume[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/resume`, {
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to load resumes");
      }
      const data = await response.json();
      return data.resumes || [];
    } catch (error) {
      console.error("Error loading resumes:", error);
      return [];
    }
  }
}
const Dashboard: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        setLoading(true);
        const resumeData = await DashboardAPI.getResumes();
        setResumes(resumeData);
        setError(null);
      } catch (err) {
        setError("Failed to load resumes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };
  const stats = [
    {
      label: "Total Resumes",
      value: resumes.length.toString(),
      icon: FileText,
      color: "blue",
      description: "Professional resumes created",
    },
    {
      label: "Avg Match Score",
      value: "85%",
      icon: TrendingUp,
      color: "purple",
      description: "Job compatibility rating",
    },
    {
      label: "Profile Views",
      value: "127",
      icon: Eye,
      color: "green",
      description: "Resume views this month",
    },
  ];
  const quickTips = [
    {
      title: "Optimize for ATS",
      description:
        "Use standard section headings and avoid graphics for better parsing",
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Tailor Your Resume",
      description:
        "Customize your resume for each job application to increase match scores",
      icon: Target,
      color: "blue",
    },
    {
      title: "Keep It Updated",
      description:
        "Regular updates ensure your resume reflects your latest achievements",
      icon: Clock,
      color: "purple",
    },
  ];
  const achievements = [
    { label: "Top 10% Match Score", icon: Award, color: "yellow" },
    { label: "5+ Resumes Created", icon: Star, color: "blue" },
    { label: "Profile Complete", icon: CheckCircle, color: "green" },
  ];
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {getCurrentGreeting()}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Ready to take your career to the next level?
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  Track your progress, optimize your resumes, and land your
                  dream job
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="w-12 h-12 text-yellow-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map(({ label, value, icon: Icon, color, description }) => (
            <div
              key={label}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm font-medium text-gray-600">{label}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8 border border-yellow-200">
          <div className="flex items-center mb-4">
            <Award className="w-6 h-6 text-yellow-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              Your Achievements
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {achievements.map(({ label, icon: Icon, color }, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-${color}-200`}
              >
                <Icon className={`w-4 h-4 text-${color}-600`} />
                <span className="text-sm font-medium text-gray-700">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/resume/builder"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
          >
            <Plus className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Create New Resume</h3>
            <p className="text-blue-100">
              Start building a professional resume from scratch
            </p>
          </Link>
          <Link
            to="/job-matcher"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6 hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
          >
            <Target className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Match Job</h3>
            <p className="text-green-100">
              Optimize your resume for specific job postings
            </p>
          </Link>
          <Link
            to="/cover-letter"
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6 hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105"
          >
            <Mail className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Cover Letter</h3>
            <p className="text-purple-100">Generate compelling cover letters</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Resumes
                </h2>
                <Link
                  to="/resume/builder"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View All</span>
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading resumes...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>{error}</p>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      No resumes found. Create your first resume!
                    </p>
                    <Link
                      to="/resume/builder"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Resume
                    </Link>
                  </div>
                ) : (
                  resumes.map((resume) => (
                    <div
                      key={resume._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {resume.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {resume.company
                            ? `Tailored for ${resume.company}`
                            : "General Resume"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(resume.updatedAt || resume.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {resume.matchScore
                              ? `${resume.matchScore}%`
                              : "N/A"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Match Score
                          </div>
                        </div>
                        <Link
                          to={`/resume/builder/${resume._id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
              Quick Tips for Success
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickTips.map((tip, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg bg-${tip.color}-50 border border-${tip.color}-200`}
                >
                  <div className="flex items-center mb-3">
                    <tip.icon
                      className={`w-5 h-5 text-${tip.color}-600 mr-2`}
                    />
                    <h3 className="font-semibold text-gray-900">{tip.title}</h3>
                  </div>
                  <p className="text-sm text-gray-700">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
