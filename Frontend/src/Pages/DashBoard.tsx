import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

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
      if (!response.ok) throw new Error("Failed to load resumes");
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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const stats = [
    {
      label: "Total Resumes",
      value: resumes.length.toString(),
      icon: FileText,
      gradient: "from-emerald-500 to-cyan-500",
      description: "Professional resumes created",
    },

  ];

  const quickActions = [
    {
      to: "/resume/builder",
      icon: Plus,
      title: "Create New Resume",
      description: "Start building a professional resume from scratch",
      gradient: "from-emerald-500 to-cyan-500",
    },
    {
      to: "/job-matcher",
      icon: Target,
      title: "Match Job",
      description: "Optimize your resume for specific job postings",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      to: "/cover-letter",
      icon: Mail,
      title: "Cover Letter",
      description: "Generate compelling cover letters",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const quickTips = [
    {
      title: "Optimize for ATS",
      description: "Use standard section headings and avoid graphics for better parsing",
      icon: CheckCircle,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Tailor Your Resume",
      description: "Customize your resume for each job application to increase match scores",
      icon: Target,
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "Keep It Updated",
      description: "Regular updates ensure your resume reflects your latest achievements",
      icon: Clock,
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-8">
        {/* Hero Greeting */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-[80px]" />
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-2">
                  {getCurrentGreeting()}! 👋
                </h1>
                <p className="text-zinc-400 text-lg">
                  Ready to take your career to the next level?
                </p>
                <p className="text-zinc-600 text-sm mt-1">
                  Track your progress, optimize your resumes, and land your dream job
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center border border-emerald-500/20">
                  <Zap className="w-10 h-10 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, gradient, description }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-zinc-100">{value}</p>
                    <p className="text-sm font-medium text-zinc-400">{label}</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>



        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickActions.map(({ to, icon: Icon, title, description, gradient }, index) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            >
              <Link
                to={to}
                className="group glass-card rounded-xl p-6 block hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-1 group-hover:text-emerald-400 transition-colors flex items-center">
                  {title}
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-zinc-500">{description}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Resumes */}
        <motion.div
          className="glass-card rounded-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="p-6 border-b border-zinc-800/60">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-200">Recent Resumes</h2>
              <Link
                to="/resume/builder"
                className="text-emerald-500 hover:text-emerald-400 text-sm font-medium flex items-center space-x-1 transition-colors"
              >
                <span>Create New</span>
                <Plus className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-zinc-500 mt-4 text-sm">Loading resumes...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-400">
                  <p>{error}</p>
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-zinc-600" />
                  </div>
                  <p className="text-zinc-400 mb-1 font-medium">No resumes found</p>
                  <p className="text-zinc-600 text-sm mb-6">Create your first resume to get started</p>
                  <Link
                    to="/resume/builder"
                    className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Resume
                  </Link>
                </div>
              ) : (
                resumes.map((resume, index) => (
                  <motion.div
                    key={resume._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800/60 hover:border-zinc-700/60 group"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                        {resume.title}
                      </h3>
                      <p className="text-sm text-zinc-500">
                        {resume.company ? `Tailored for ${resume.company}` : "General Resume"}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-xs text-zinc-600 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(resume.updatedAt || resume.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right mr-2">
                        <div className="text-sm font-semibold text-zinc-300">
                          {resume.matchScore ? `${resume.matchScore}%` : "N/A"}
                        </div>
                        <div className="text-xs text-zinc-600">Match</div>
                      </div>
                      <Link
                        to={`/resume/builder/${resume._id}`}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                      >
                        Edit
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          className="glass-card rounded-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="p-6 border-b border-zinc-800/60">
            <h2 className="text-lg font-semibold text-zinc-200 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
              Quick Tips for Success
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickTips.map((tip, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-800/60"
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tip.gradient} flex items-center justify-center mr-3`}>
                      <tip.icon className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-zinc-200 text-sm">{tip.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
