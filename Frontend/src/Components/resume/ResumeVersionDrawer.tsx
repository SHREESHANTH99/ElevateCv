import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History,
  X,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  GitCompare,
  FileCheck
} from "lucide-react";

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

export interface ResumeVersionItem {
  _id: string;
  versionNumber: number;
  label: string;
  atsScore: number;
  dimensionScores: Record<string, number>;
  createdAt: string;
  snapshotData?: any;
}

export interface DimensionComparisonItem {
  v1: number;
  v2: number;
  delta: number;
}

export interface ComparisonResult {
  v1: {
    id: string;
    versionNumber: number;
    label: string;
    atsScore: number;
    dimensionScores: Record<string, number>;
    createdAt: string;
  };
  v2: {
    id: string;
    versionNumber: number;
    label: string;
    atsScore: number;
    dimensionScores: Record<string, number>;
    createdAt: string;
  };
  scoreDelta: number;
  dimensionComparison: Record<string, DimensionComparisonItem>;
  fieldChanges: {
    summaryChanged: boolean;
    experiences: {
      totalBulletsV1: number;
      totalBulletsV2: number;
      bulletsAdded: string[];
      bulletsRemoved: string[];
    };
    skills: {
      added: string[];
      removed: string[];
      retained: string[];
    };
    projectsChanged: boolean;
  };
}

interface ResumeVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  currentResumeData: any;
  onRestoreSnapshot: (restoredData: any) => void;
}

export const ResumeVersionDrawer: React.FC<ResumeVersionDrawerProps> = ({
  isOpen,
  onClose,
  resumeId,
  currentResumeData,
  onRestoreSnapshot
}) => {
  const [activeResumeId, setActiveResumeId] = useState<string>(resumeId || "");
  const [versions, setVersions] = useState<ResumeVersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedV1, setSelectedV1] = useState<number | null>(null);
  const [selectedV2, setSelectedV2] = useState<number | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loadingCompare, setLoadingCompare] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "compare">("history");

  useEffect(() => {
    if (resumeId) setActiveResumeId(resumeId);
  }, [resumeId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const getOrResolveResumeId = async (): Promise<string | null> => {
    if (activeResumeId) return activeResumeId;
    if (resumeId) return resumeId;
    try {
      const getRes = await fetch(`${API_BASE_URL}/resume`, { headers: getAuthHeaders() });
      if (getRes.ok) {
        const data = await getRes.json();
        const id = data?.resume?._id || (data?.resumes && data.resumes.length > 0 ? data.resumes[0]._id : null) || data?._id;
        if (id) {
          setActiveResumeId(id);
          return id;
        }
      }
      // Auto-create active draft if none exists yet
      const postRes = await fetch(`${API_BASE_URL}/resume`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(currentResumeData),
      });
      if (postRes.ok) {
        const postData = await postRes.json();
        const id = postData?.resume?._id || postData?._id || postData?.id;
        if (id) {
          setActiveResumeId(id);
          return id;
        }
      }
    } catch (e) {
      console.error("Failed to auto-resolve resume ID:", e);
    }
    return null;
  };

  const fetchVersions = async () => {
    const id = await getOrResolveResumeId();
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/resume/${id}/versions`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch version history");
      const data = await response.json();
      setVersions(data.versions || []);

      // Auto-set comparison between latest two if available
      if (data.versions && data.versions.length >= 2) {
        setSelectedV1(data.versions[1].versionNumber);
        setSelectedV2(data.versions[0].versionNumber);
      } else if (data.versions && data.versions.length === 1) {
        setSelectedV1(data.versions[0].versionNumber);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load version history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, resumeId]);

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = await getOrResolveResumeId();
    if (!id) {
      setError("Please save your resume first before creating a version snapshot.");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/resume/${id}/versions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          label: newLabel.trim() || undefined,
          snapshotData: currentResumeData,
        }),
      });

      if (!response.ok) throw new Error("Failed to create snapshot");
      setNewLabel("");
      await fetchVersions();
    } catch (err: any) {
      setError(err.message || "Failed to create snapshot");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCompare = async (v1Num: number, v2Num: number) => {
    if (!v1Num || !v2Num || v1Num === v2Num) return;
    const id = await getOrResolveResumeId();
    if (!id) return;
    setLoadingCompare(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/resume/${id}/versions/compare?v1=${v1Num}&v2=${v2Num}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error("Failed to compute comparison diff");
      const data = await response.json();
      setComparison(data);
      setActiveTab("compare");
    } catch (err: any) {
      setError(err.message || "Comparison failed");
    } finally {
      setLoadingCompare(false);
    }
  };

  const handleRestore = async (version: ResumeVersionItem) => {
    const confirm = window.confirm(
      `Are you sure you want to restore Version ${version.versionNumber} (${version.label})? Any unsaved edits will be replaced.`
    );
    if (!confirm) return;

    try {
      const id = await getOrResolveResumeId();
      if (!id) return;
      const response = await fetch(
        `${API_BASE_URL}/resume/${id}/versions/${version._id}/restore`,
        {
          method: "POST",
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to restore snapshot");
      const data = await response.json();
      if (data.resume) {
        onRestoreSnapshot(data.resume);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to restore version");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="glass-card w-full max-w-2xl h-full flex flex-col bg-[#0c110f] border-l border-emerald-500/20 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-[#121916]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Resume Versioning & Progression
              </h2>
              <p className="text-xs text-zinc-400">
                Track historical snapshots, dimension improvements, and ATS score deltas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-[#0e1412] px-6">
          <button
            onClick={() => setActiveTab("history")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "history"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Version History ({versions.length})
          </button>
          <button
            onClick={() => {
              if (selectedV1 && selectedV2) {
                handleCompare(selectedV1, selectedV2);
              }
              setActiveTab("compare");
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "compare"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <GitCompare className="w-4 h-4" />
            Score Comparison & Deltas
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Snapshot Creation Form */}
              <form
                onSubmit={handleCreateSnapshot}
                className="p-4 rounded-xl bg-[#141d19] border border-emerald-500/20 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Save New Version Snapshot
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Tailored for Cloud Architect / Added quantification"
                    className="input-dark flex-1 text-xs py-2"
                  />
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 flex-shrink-0"
                  >
                    {isCreating ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Snapshot
                  </button>
                </div>
              </form>

              {/* Version History List */}
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">Loading version timeline...</p>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                  <History className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-zinc-300">No Versions Saved Yet</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Save snapshots to track your ATS score progression and compare improvements over time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((ver, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div
                        key={ver._id}
                        className="p-4 rounded-xl bg-[#121916] border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                                v{ver.versionNumber}
                              </span>
                              <h4 className="text-sm font-semibold text-white">{ver.label}</h4>
                              {isLatest && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-medium border border-cyan-500/30">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ver.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">ATS Score</span>
                            <span className="text-base font-extrabold text-emerald-400">
                              {ver.atsScore}/100
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedV1(ver.versionNumber);
                              const prev = versions[idx + 1] || versions[0];
                              setSelectedV2(prev.versionNumber);
                              handleCompare(prev.versionNumber, ver.versionNumber);
                            }}
                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                          >
                            <GitCompare className="w-3.5 h-3.5" /> Compare with another version
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRestore(ver)}
                            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Restore to Editor
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "compare" && (
            <div className="space-y-6">
              {/* Version Selector Bar */}
              <div className="p-4 rounded-xl bg-[#141d19] border border-emerald-500/20 space-y-3">
                <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Select Versions to Diff
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Baseline Version (From)</label>
                    <select
                      value={selectedV1 || ""}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        setSelectedV1(num);
                        if (selectedV2) handleCompare(num, selectedV2);
                      }}
                      className="input-dark w-full text-xs"
                    >
                      <option value="">Select baseline...</option>
                      {versions.map((v) => (
                        <option key={v._id} value={v.versionNumber}>
                          v{v.versionNumber} ({v.label}) - {v.atsScore} pts
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">Target Version (To)</label>
                    <select
                      value={selectedV2 || ""}
                      onChange={(e) => {
                        const num = parseInt(e.target.value, 10);
                        setSelectedV2(num);
                        if (selectedV1) handleCompare(selectedV1, num);
                      }}
                      className="input-dark w-full text-xs"
                    >
                      <option value="">Select target...</option>
                      {versions.map((v) => (
                        <option key={v._id} value={v.versionNumber}>
                          v{v.versionNumber} ({v.label}) - {v.atsScore} pts
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {loadingCompare ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-zinc-500">Calculating dimension score improvements...</p>
                </div>
              ) : comparison ? (
                <div className="space-y-6">
                  {/* Score Delta Highlight Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#14231d] to-[#121c24] border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
                        Overall ATS Score Progression
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-zinc-300">
                          v{comparison.v1.versionNumber} ({comparison.v1.atsScore})
                        </span>
                        <ArrowRight className="w-5 h-5 text-emerald-400" />
                        <span className="text-2xl font-extrabold text-white">
                          v{comparison.v2.versionNumber} ({comparison.v2.atsScore})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-sm ${
                          comparison.scoreDelta >= 0
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                        }`}
                      >
                        {comparison.scoreDelta >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>
                          {comparison.scoreDelta >= 0 ? `+${comparison.scoreDelta}` : comparison.scoreDelta} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 8-Dimension Delta Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" /> 8-Dimension Improvement Deltas
                    </h3>

                    <div className="grid grid-cols-1 gap-2.5">
                      {Object.entries(comparison.dimensionComparison || {}).map(([dim, data]) => {
                        const dimName = dim.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                        const isPositive = data.delta > 0;
                        const isZero = data.delta === 0;

                        return (
                          <div
                            key={dim}
                            className="p-3 rounded-xl bg-[#121916] border border-zinc-800 flex items-center justify-between"
                          >
                            <div className="space-y-1">
                              <span className="text-xs font-medium text-white">{dimName}</span>
                              <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                                <span>v{comparison.v1.versionNumber}: {data.v1}%</span>
                                <span>$\rightarrow$</span>
                                <span className="text-zinc-200">v{comparison.v2.versionNumber}: {data.v2}%</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                  isPositive
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : isZero
                                    ? "bg-zinc-800 text-zinc-400"
                                    : "bg-rose-500/20 text-rose-400"
                                }`}
                              >
                                {isPositive ? `+${data.delta}%` : `${data.delta}%`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field Level Changes */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                      Content Modifications
                    </h3>

                    <div className="p-4 rounded-xl bg-[#121916] border border-zinc-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Professional Summary</span>
                        <span className={comparison.fieldChanges.summaryChanged ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
                          {comparison.fieldChanges.summaryChanged ? "Refined & Updated" : "Unchanged"}
                        </span>
                      </div>

                      <div className="border-t border-zinc-800 pt-2 flex items-center justify-between">
                        <span className="text-zinc-400">Experience Bullets</span>
                        <span className="text-zinc-200">
                          {comparison.fieldChanges.experiences.bulletsAdded.length} added,{" "}
                          {comparison.fieldChanges.experiences.bulletsRemoved.length} replaced
                        </span>
                      </div>

                      {comparison.fieldChanges.skills.added.length > 0 && (
                        <div className="border-t border-zinc-800 pt-2 space-y-1">
                          <span className="text-zinc-400 block">Skills Added:</span>
                          <div className="flex flex-wrap gap-1">
                            {comparison.fieldChanges.skills.added.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                                + {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                  <p className="text-xs text-zinc-500">Select two versions above to see their dimension improvements.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
