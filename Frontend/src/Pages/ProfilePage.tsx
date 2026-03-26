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
  Loader2,
  XCircle,
  Calendar,
  Download,
  Mail,
  Github,
  Linkedin,
  Globe,
  Edit3,
  Save,
  MapPin,
  Briefcase,
  Trash2,
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
  personalInfo?: { fullName?: string };
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
  const [loading, setLoading] = useState<LoadingState>({ profile: true, resume: false });
  const [editData, setEditData] = useState<ProfileData>({
    firstName: "", lastName: "", email: "", role: "", bio: "", location: "", website: "", github: "", linkedin: "",
  });

  useEffect(() => {
    if (!user) return;
    setEditData({
      firstName: user.profile?.firstName || "", lastName: user.profile?.lastName || "", email: user.email,
      role: user.profile?.role || "", bio: user.profile?.bio || "", location: user.profile?.location || "",
      website: user.profile?.website || "", github: user.profile?.github || "", linkedin: user.profile?.linkedin || "",
    });
    const loadUserData = async () => {
      try {
        setLoading((prev) => ({ ...prev, profile: true, resume: true }));
        const userResumes = await ResumeApi.getResumes();
        const formattedResumes = userResumes.map((resume: any) => ({
          _id: resume._id || resume.id, title: resume.title || "Untitled Resume",
          updatedAt: resume.updatedAt || resume.lastModified || new Date().toISOString(),
          createdAt: resume.createdAt || new Date().toISOString(), template: resume.template || "modern",
          isPublic: resume.isPublic || false, personalInfo: resume.personalInfo,
        }));
        setResumes(formattedResumes);
      } catch { } finally { setLoading((prev) => ({ ...prev, profile: false, resume: false })); }
    };
    loadUserData();
  }, [user]);

  const handleLogout = async () => {
    try { await logout(); navigate("/login"); }
    catch { setError("Failed to log out. Please try again."); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true); setError(""); setSuccess("");
    try {
      await updateProfile({ firstName: editData.firstName.trim(), lastName: editData.lastName.trim() });
      setSuccess("Profile updated successfully!"); setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Failed to update profile. Please try again."); }
    finally { setIsSaving(false); }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      setLoading((prev) => ({ ...prev, resume: true })); setError("");
      await ResumeApi.deleteResume(id);
      setResumes((prev) => prev.filter((resume) => resume._id !== id));
      setSuccess("Resume deleted successfully."); setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Failed to delete resume."); }
    finally { setLoading((prev) => ({ ...prev, resume: false })); }
  };

  const handleDownloadResume = async (resumeId: string, title: string) => {
    try {
      setLoading((prev) => ({ ...prev, resume: true })); setError("");
      await ResumeApi.exportResume(resumeId, `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
      setSuccess("Resume downloaded successfully."); setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Failed to download resume."); }
    finally { setLoading((prev) => ({ ...prev, resume: false })); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center p-8 glass-card rounded-2xl max-w-md w-full">
          <Lock className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Access Denied</h2>
          <p className="text-zinc-500 mb-6 text-sm">Please log in to view your profile.</p>
          <button onClick={() => navigate("/login")} className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
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
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 right-4 z-50">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center"><XCircle className="h-4 w-4 text-red-400 mr-3" /><p className="text-sm text-red-400">{error}</p></div>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-4 right-4 z-50">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-lg backdrop-blur-sm">
              <div className="flex items-center"><CheckCircle className="h-4 w-4 text-emerald-400 mr-3" /><p className="text-sm text-emerald-400">{success}</p></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div className="absolute top-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-[120px]"
            animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }} />
          <motion.div className="absolute bottom-0 left-1/4 w-80 h-80 bg-violet-500/5 rounded-full filter blur-[120px]"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }} />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center">
            {/* Avatar */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.6, type: "spring" }} className="relative inline-block mb-8">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-emerald-500/20">
                {editData.firstName?.charAt(0) || "U"}
              </div>
              {!isEditing && (
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsEditing(true)}
                  className="absolute -bottom-2 -right-2 p-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 transition-colors shadow-lg">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                </motion.button>
              )}
            </motion.div>

            {isEditing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="First Name" value={editData.firstName} onChange={(e) => setEditData({ ...editData, firstName: e.target.value })} className="input-dark text-center" />
                  <input type="text" placeholder="Last Name" value={editData.lastName} onChange={(e) => setEditData({ ...editData, lastName: e.target.value })} className="input-dark text-center" />
                </div>
                <input type="text" placeholder="Your Role" value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })} className="input-dark text-center" />
                <textarea placeholder="Short bio..." value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} rows={3} className="input-dark text-center resize-none" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Location" value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} className="input-dark text-center" />
                  <input type="email" placeholder="Email" value={editData.email} disabled className="input-dark text-center opacity-50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="url" placeholder="Website" value={editData.website} onChange={(e) => setEditData({ ...editData, website: e.target.value })} className="input-dark text-center" />
                  <input type="url" placeholder="GitHub" value={editData.github} onChange={(e) => setEditData({ ...editData, github: e.target.value })} className="input-dark text-center" />
                  <input type="url" placeholder="LinkedIn" value={editData.linkedin} onChange={(e) => setEditData({ ...editData, linkedin: e.target.value })} className="input-dark text-center" />
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveProfile} disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50">
                    {isSaving ? (<><Loader2 className="inline-block w-4 h-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="inline-block w-4 h-4 mr-2" />Save Changes</>)}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsEditing(false)}
                    className="px-8 py-3 border border-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm hover:border-zinc-500 transition-all">
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-3">
                  {editData.firstName} {editData.lastName}
                </h1>
                {editData.role && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <p className="text-lg text-emerald-400 font-medium">{editData.role}</p>
                  </div>
                )}
                {editData.bio && <p className="text-zinc-500 max-w-xl mx-auto mb-6 leading-relaxed">{editData.bio}</p>}
                {editData.location && (
                  <p className="text-zinc-600 text-sm mb-6 flex items-center justify-center"><MapPin className="w-3.5 h-3.5 mr-1" />{editData.location}</p>
                )}

                {/* Social Links */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  {editData.email && (
                    <motion.a whileHover={{ scale: 1.1, y: -2 }} href={`mailto:${editData.email}`}
                      className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/30 transition-all">
                      <Mail className="w-4 h-4 text-zinc-400" />
                    </motion.a>
                  )}
                  {editData.github && (
                    <motion.a whileHover={{ scale: 1.1, y: -2 }} href={editData.github} target="_blank" rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/30 transition-all">
                      <Github className="w-4 h-4 text-zinc-400" />
                    </motion.a>
                  )}
                  {editData.linkedin && (
                    <motion.a whileHover={{ scale: 1.1, y: -2 }} href={editData.linkedin} target="_blank" rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/30 transition-all">
                      <Linkedin className="w-4 h-4 text-zinc-400" />
                    </motion.a>
                  )}
                  {editData.website && (
                    <motion.a whileHover={{ scale: 1.1, y: -2 }} href={editData.website} target="_blank" rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 hover:border-emerald-500/30 transition-all">
                      <Globe className="w-4 h-4 text-zinc-400" />
                    </motion.a>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/resume/builder")}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />Create Resume
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout}
                    className="px-8 py-3 border border-zinc-700 text-zinc-400 rounded-xl font-semibold text-sm hover:border-red-500/30 hover:text-red-400 transition-all flex items-center justify-center">
                    <LogOut className="w-4 h-4 mr-2" />Sign Out
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Resumes Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 mb-1">
                  My <span className="gradient-text">Resumes</span>
                </h2>
                <p className="text-zinc-500 text-sm">Manage and download your resumes</p>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/resume/builder")}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center">
                <Plus className="w-4 h-4 mr-2" />New Resume
              </motion.button>
            </div>
          </motion.div>

          {loading.resume ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-zinc-500 text-sm">Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 glass-card rounded-2xl">
              <FileText className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-200 mb-2">No resumes yet</h3>
              <p className="text-zinc-500 text-sm mb-6">Start building your professional resume today</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/resume/builder")}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold text-sm inline-flex items-center hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
                <Plus className="w-4 h-4 mr-2" />Create Your First Resume
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume, index) => (
                <motion.div key={resume._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }} whileHover={{ y: -2 }}>
                  <div className="glass-card rounded-xl p-5 flex items-center justify-between group">
                    <div className="flex-1">
                      <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors text-sm">{resume.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">{resume.personalInfo?.fullName || "No name"}</p>
                      <div className="flex items-center text-xs text-zinc-600 mt-2">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${resume.isPublic ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/50 text-zinc-500"}`}>
                        {resume.isPublic ? "Public" : "Private"}
                      </span>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownloadResume(resume._id, resume.title)} disabled={loading.resume}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center">
                        <Download className="w-3.5 h-3.5 mr-1.5" />Download
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteResume(resume._id)} disabled={loading.resume}
                        className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-red-500/30 hover:text-red-400 text-zinc-600 transition-all disabled:opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
