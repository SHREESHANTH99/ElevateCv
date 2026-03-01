import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { ResumeApi } from "../services/resumeApi";
import {
  Lock,
  CheckCircle,
  FileText,
  LogOut,
  Plus,
  Sun,
  Moon,
  Loader2,
  XCircle,
  Calendar,
  Download,
  Mail,
  Github,
  Linkedin,
  Globe,
  Sparkles,
  Edit3,
  Save,
} from "lucide-react";
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}
interface Resume {
  _id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  template: string;
  isPublic?: boolean;
  personalInfo?: {
    fullName?: string;
  };
}
interface LoadingState {
  profile: boolean;
  resume: boolean;
}
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [themePreference, setThemePreference] = useState<
    "light" | "dark" | "system"
  >("light");
  const [loading, setLoading] = useState<LoadingState>({
    profile: true,
    resume: false,
  });
  const [editData, setEditData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
  });
  useEffect(() => {
    if (!user) return;
    setEditData({
      firstName: user.profile?.firstName || "",
      lastName: user.profile?.lastName || "",
      email: user.email,
      role: user.profile?.role || "",
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
      website: user.profile?.website || "",
      github: user.profile?.github || "",
      linkedin: user.profile?.linkedin || "",
    });
    const loadUserData = async () => {
      try {
        setLoading((prev) => ({ ...prev, profile: true, resume: true }));
        const userResumes = await ResumeApi.getResumes();
        const formattedResumes = userResumes.map((resume: any) => ({
          _id: resume._id || resume.id,
          title: resume.title || "Untitled Resume",
          updatedAt:
            resume.updatedAt || resume.lastModified || new Date().toISOString(),
          createdAt: resume.createdAt || new Date().toISOString(),
          template: resume.template || "modern",
          isPublic: resume.isPublic || false,
          personalInfo: resume.personalInfo,
        }));
        setResumes(formattedResumes);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading((prev) => ({
          ...prev,
          profile: false,
          resume: false,
        }));
      }
    };
    loadUserData();
  }, [user]);
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
      setError("Failed to log out. Please try again.");
    }
  };
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile({
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
      });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteResume = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this resume? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, resume: true }));
      setError("");
      await ResumeApi.deleteResume(id);
      setResumes((prev) => prev.filter((resume) => resume._id !== id));
      setSuccess("Resume deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("Failed to delete resume. Please try again later.");
    } finally {
      setLoading((prev) => ({ ...prev, resume: false }));
    }
  };
  const handleDownloadResume = async (resumeId: string, title: string) => {
    try {
      setLoading((prev) => ({ ...prev, resume: true }));
      setError("");
      await ResumeApi.exportResume(
        resumeId,
        `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
      );
      setSuccess("Resume downloaded successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error downloading resume:", error);
      setError("Failed to download resume. Please try again later.");
    } finally {
      setLoading((prev) => ({ ...prev, resume: false }));
    }
  };
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md w-full">
          <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your profile.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  if (loading.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 max-w-md"
          >
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Profile Avatar */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative inline-block mb-8"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-white">
                {editData.firstName?.charAt(0) || "U"}
              </div>
              {!isEditing && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Edit3 className="w-4 h-4 text-blue-600" />
                </motion.button>
              )}
            </motion.div>

            {/* Name and Role */}
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto space-y-4 mb-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={editData.firstName}
                    onChange={(e) =>
                      setEditData({ ...editData, firstName: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={editData.lastName}
                    onChange={(e) =>
                      setEditData({ ...editData, lastName: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Your Role"
                  value={editData.role}
                  onChange={(e) =>
                    setEditData({ ...editData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                />
                <textarea
                  placeholder="Short bio..."
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center resize-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Location"
                    value={editData.location}
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={editData.email}
                    disabled
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-center"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={editData.website}
                    onChange={(e) =>
                      setEditData({ ...editData, website: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                  <input
                    type="url"
                    placeholder="GitHub URL"
                    value={editData.github}
                    onChange={(e) =>
                      setEditData({ ...editData, github: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    value={editData.linkedin}
                    onChange={(e) =>
                      setEditData({ ...editData, linkedin: e.target.value })
                    }
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors text-center"
                  />
                </div>
                <div className="flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="inline-block w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <>
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">
                  {editData.firstName} {editData.lastName}
                </h1>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <p className="text-xl md:text-2xl text-blue-600 font-semibold">
                    {editData.role}
                  </p>
                </div>
                <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                  {editData.bio}
                </p>
                {editData.location && (
                  <p className="text-gray-500 mb-8">{editData.location}</p>
                )}

                {/* Social Links */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  {editData.email && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      href={`mailto:${editData.email}`}
                      className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Mail className="w-5 h-5 text-gray-700" />
                    </motion.a>
                  )}
                  {editData.github && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      href={editData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Github className="w-5 h-5 text-gray-700" />
                    </motion.a>
                  )}
                  {editData.linkedin && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      href={editData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Linkedin className="w-5 h-5 text-gray-700" />
                    </motion.a>
                  )}
                  {editData.website && (
                    <motion.a
                      whileHover={{ scale: 1.1, y: -2 }}
                      href={editData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Globe className="w-5 h-5 text-gray-700" />
                    </motion.a>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/resume/builder")}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-shadow flex items-center justify-center"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Create Resume
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center border-2 border-gray-200"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Get in Touch
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* My Resumes Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              My <span className="text-blue-600">Resumes</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Manage and download your resumes
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/resume/builder")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Resume
            </motion.button>
          </motion.div>

          {loading.resume ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100"
            >
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No resumes yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your professional resume today
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/resume/builder")}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Resume
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume, index) => (
                <motion.div
                  key={resume._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {resume.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {resume.personalInfo?.fullName || "No name"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${resume.isPublic
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {resume.isPublic ? "Public" : "Private"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>
                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleDownloadResume(resume._id, resume.title)
                        }
                        disabled={loading.resume}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-shadow flex items-center justify-center disabled:opacity-50"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteResume(resume._id)}
                        disabled={loading.resume}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-900 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full opacity-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full opacity-10"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Let's Work <span className="text-yellow-300">Together</span>
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Have a project in mind? Let's discuss how we can collaborate
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`mailto:${editData.email}`}
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-shadow inline-flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Send Email
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all inline-flex items-center justify-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Settings Quick Access (Floating Button) */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setThemePreference(themePreference === "light" ? "dark" : "light")}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl transition-shadow z-40"
      >
        {themePreference === "light" ? (
          <Moon className="w-6 h-6" />
        ) : (
          <Sun className="w-6 h-6" />
        )}
      </motion.button>
    </div>
  );
};
export default ProfilePage;
