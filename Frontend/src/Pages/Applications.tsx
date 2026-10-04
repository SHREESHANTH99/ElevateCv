import { useDocumentTitle } from '../hooks/useDocumentTitle';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Plus,
  Search,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  Trash2,
  Edit2,
  TrendingUp,
  Sparkles,
  RefreshCw,
  X
} from "lucide-react";

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

type ApplicationStatus = "Bookmarked" | "Applied" | "Interviewing" | "Offered" | "Rejected";

interface ApplicationItem {
  _id: string;
  company: string;
  role: string;
  jobDescription?: string;
  status: ApplicationStatus;
  resumeVersionId?: string;
  resumeVersionLabel?: string;
  notes?: string;
  salary?: string;
  location?: string;
  url?: string;
  appliedDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicationStats {
  total: number;
  active: number;
  byStatus: Record<ApplicationStatus, number>;
  interviewRate: number;
  offerRate: number;
  rejectionRate: number;
}

const STATUS_COLUMNS: Array<{
  status: ApplicationStatus;
  label: string;
  color: string;
  bg: string;
  border: string;
  badge: string;
}> = [
  {
    status: "Bookmarked",
    label: "Bookmarked",
    color: "text-zinc-400",
    bg: "bg-zinc-900/40",
    border: "border-zinc-800",
    badge: "bg-zinc-800 text-zinc-300",
  },
  {
    status: "Applied",
    label: "Applied",
    color: "text-cyan-400",
    bg: "bg-cyan-950/20",
    border: "border-cyan-500/20",
    badge: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  },
  {
    status: "Interviewing",
    label: "Interviewing",
    color: "text-amber-400",
    bg: "bg-amber-950/20",
    border: "border-amber-500/20",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  },
  {
    status: "Offered",
    label: "Offered",
    color: "text-emerald-400",
    bg: "bg-emerald-950/20",
    border: "border-emerald-500/20",
    badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  },
  {
    status: "Rejected",
    label: "Rejected",
    color: "text-rose-400",
    bg: "bg-rose-950/20",
    border: "border-rose-500/20",
    badge: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  },
];

const Applications: React.FC = () => {
  useDocumentTitle("Application Tracker");

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationItem | null>(null);
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formStatus, setFormStatus] = useState<ApplicationStatus>("Bookmarked");
  const [formSalary, setFormSalary] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formJobDesc, setFormJobDesc] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/applications`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/applications/stats`, { headers: getAuthHeaders() }),
      ]);

      if (!appsRes.ok) throw new Error("Failed to load applications");
      const appsData = await appsRes.json();
      setApplications(appsData.applications || []);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load application tracker data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingApp(null);
    setFormCompany("");
    setFormRole("");
    setFormStatus("Bookmarked");
    setFormSalary("");
    setFormLocation("");
    setFormUrl("");
    setFormNotes("");
    setFormJobDesc("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (app: ApplicationItem) => {
    setEditingApp(app);
    setFormCompany(app.company);
    setFormRole(app.role);
    setFormStatus(app.status);
    setFormSalary(app.salary || "");
    setFormLocation(app.location || "");
    setFormUrl(app.url || "");
    setFormNotes(app.notes || "");
    setFormJobDesc(app.jobDescription || "");
    setIsModalOpen(true);
  };

  const handleSaveApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompany.trim() || !formRole.trim()) return;

    setIsSaving(true);
    try {
      const payload = {
        company: formCompany.trim(),
        role: formRole.trim(),
        status: formStatus,
        salary: formSalary.trim(),
        location: formLocation.trim(),
        url: formUrl.trim(),
        notes: formNotes.trim(),
        jobDescription: formJobDesc.trim(),
      };

      const url = editingApp
        ? `${API_BASE_URL}/applications/${editingApp._id}`
        : `${API_BASE_URL}/applications`;
      const method = editingApp ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save application");
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save application");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      // Optimistic update
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );

      const res = await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Status update failed");
      // Refresh stats
      const statsRes = await fetch(`${API_BASE_URL}/applications/stats`, {
        headers: getAuthHeaders(),
      });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err: any) {
      console.error(err);
      loadData();
    }
  };

  const handleDelete = async (appId: string, company: string) => {
    if (!window.confirm(`Delete application for ${company}?`)) return;
    try {
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      await fetch(`${API_BASE_URL}/applications/${appId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      loadData();
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const filteredApps = applications.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.company.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      (a.location && a.location.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Application Tracker</h1>
          </div>
          <p className="text-xs text-zinc-400 ml-1">
            Manage your job pipeline across Kanban stages with conversion intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter company or role..."
              className="input-dark !pl-9 text-xs py-2 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Track Application
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-[#121916] border border-zinc-800">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Total Applications
            </span>
            <span className="text-2xl font-extrabold text-white">{stats.total}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121916] border border-zinc-800">
            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
              Active Pipeline
            </span>
            <span className="text-2xl font-extrabold text-cyan-400">{stats.active}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121916] border border-zinc-800">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
              Interview Rate
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold text-amber-400">{stats.interviewRate}%</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#121916] border border-zinc-800">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
              Offers Received
            </span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {stats.byStatus.Offered}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#121916] border border-zinc-800">
            <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block mb-1">
              Rejection Rate
            </span>
            <span className="text-2xl font-extrabold text-rose-400">{stats.rejectionRate}%</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Kanban Columns */}
      {loading ? (
        <div className="text-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
          <p className="text-xs text-zinc-400">Loading your job pipeline...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colApps = filteredApps.filter((a) => a.status === col.status);
            return (
              <div
                key={col.status}
                className={`p-3 rounded-2xl border ${col.border} ${col.bg} flex flex-col min-h-[500px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80 px-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${col.badge}`}>
                    {colApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colApps.map((app) => (
                    <motion.div
                      key={app._id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3.5 rounded-xl bg-[#0f1513] border border-zinc-800 hover:border-zinc-700 transition-all shadow-md space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            {app.company}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{app.role}</p>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(app)}
                            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                            title="Edit Application"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(app._id, app.company)}
                            className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Metadata Badges */}
                      <div className="flex flex-wrap gap-1.5 text-[10px]">
                        {app.salary && (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 flex items-center gap-1">
                            <DollarSign className="w-2.5 h-2.5 text-emerald-400" /> {app.salary}
                          </span>
                        )}
                        {app.location && (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 text-cyan-400" /> {app.location}
                          </span>
                        )}
                        {app.resumeVersionLabel && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> {app.resumeVersionLabel}
                          </span>
                        )}
                      </div>

                      {/* Notes snippet */}
                      {app.notes && (
                        <p className="text-[11px] text-zinc-500 bg-[#090d0b] p-2 rounded-lg border border-zinc-900 line-clamp-2">
                          {app.notes}
                        </p>
                      )}

                      {/* Footer: Date & Quick Column Move */}
                      <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {app.appliedDate
                            ? new Date(app.appliedDate).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })
                            : new Date(app.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                        </span>

                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleQuickStatusChange(app._id, e.target.value as ApplicationStatus)
                          }
                          className="bg-[#141b18] text-zinc-300 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] cursor-pointer hover:border-zinc-700"
                        >
                          <option value="Bookmarked">Move: Bookmarked</option>
                          <option value="Applied">Move: Applied</option>
                          <option value="Interviewing">Move: Interviewing</option>
                          <option value="Offered">Move: Offered</option>
                          <option value="Rejected">Move: Rejected</option>
                        </select>
                      </div>
                    </motion.div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-zinc-900 rounded-xl">
                      <p className="text-[11px] text-zinc-600">No applications</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card w-full max-w-lg bg-[#0e1412] border border-emerald-500/20 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                {editingApp ? "Edit Job Application" : "Track New Job Application"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="input-dark w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ApplicationStatus)}
                    className="input-dark w-full"
                  >
                    <option value="Bookmarked">Bookmarked</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Offered">Offered</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="e.g. $160k - $190k"
                    className="input-dark w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Remote / New York, NY"
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Job Post URL</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://company.com/careers/..."
                    className="input-dark w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Notes & Follow-ups</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Referral name, recruiter email, interview round dates..."
                  className="input-dark w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Job Description (Optional)</label>
                <textarea
                  rows={2}
                  value={formJobDesc}
                  onChange={(e) => setFormJobDesc(e.target.value)}
                  placeholder="Paste requirements for instant ATS semantic tailoring and matching..."
                  className="input-dark w-full resize-none font-mono text-[10px]"
                />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  {editingApp ? "Save Changes" : "Create Application"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Applications;
