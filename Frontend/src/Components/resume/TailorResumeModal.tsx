import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Briefcase,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

export interface TailoredBulletItem {
  original: string;
  tailored: string;
  changesExplained: Array<{ change: string; reason: string }>;
  grounded: boolean;
  engine?: string;
  isTailored?: boolean;
  retriedOnce?: boolean;
  fallbackToOriginal?: boolean;
  fallbackUsed?: boolean;
  accepted?: boolean;
}

export interface TailoredExperienceItem {
  id?: string;
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  bullets: TailoredBulletItem[];
}

interface TailorResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData?: any;
  resumeId?: string;
  initialJobDescription?: string;
  onApplyChanges?: (updatedExperiences: any[]) => void;
}

export const TailorResumeModal: React.FC<TailorResumeModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  resumeId,
  initialJobDescription = "",
  onApplyChanges
}) => {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tailoredExperiences, setTailoredExperiences] = useState<TailoredExperienceItem[]>([]);
  const [summary, setSummary] = useState<{ totalBullets: number; tailoredCount: number; unchangedCount: number } | null>(null);

  useEffect(() => {
    if (initialJobDescription) {
      setJobDescription(initialJobDescription);
    }
  }, [initialJobDescription]);

  const handleFetchTailoring = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a target job description to tailor against.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`${API_BASE_URL}/ai/tailor-resume`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeId,
          resumeData,
          jobDescription,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to generate tailored bullets");
      }

      const data = await response.json();
      
      // Default all tailored bullets (that changed) to accepted = true, unchanged to false
      const initialized = (data.tailoredExperiences || []).map((exp: TailoredExperienceItem) => ({
        ...exp,
        bullets: exp.bullets.map((b) => ({
          ...b,
          accepted: b.tailored !== b.original,
        })),
      }));

      setTailoredExperiences(initialized);
      setSummary(data.summary || null);
    } catch (err: any) {
      console.error("Tailoring error:", err);
      setError(err.message || "Failed to tailor resume against the job description.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBulletAcceptance = (expIdx: number, bulletIdx: number) => {
    setTailoredExperiences((prev) => {
      const copy = [...prev];
      const targetExp = { ...copy[expIdx] };
      const targetBullets = [...targetExp.bullets];
      targetBullets[bulletIdx] = {
        ...targetBullets[bulletIdx],
        accepted: !targetBullets[bulletIdx].accepted,
      };
      targetExp.bullets = targetBullets;
      copy[expIdx] = targetExp;
      return copy;
    });
  };

  const setAllAcceptance = (status: boolean) => {
    setTailoredExperiences((prev) =>
      prev.map((exp) => ({
        ...exp,
        bullets: exp.bullets.map((b) => ({ ...b, accepted: status })),
      }))
    );
  };

  const handleApply = () => {
    if (!onApplyChanges) {
      onClose();
      return;
    }

    // Build the updated experience structure
    const updatedExperiences = (resumeData?.experiences || resumeData?.experience || []).map(
      (origExp: any, expIdx: number) => {
        const tailoredExp = tailoredExperiences[expIdx];
        if (!tailoredExp) return origExp;

        const newDescriptions = tailoredExp.bullets.map((b) =>
          b.accepted ? b.tailored : b.original
        );

        return {
          ...origExp,
          description: newDescriptions,
        };
      }
    );

    onApplyChanges(updatedExperiences);
    onClose();
  };

  const acceptedCount = tailoredExperiences.reduce(
    (acc, exp) => acc + exp.bullets.filter((b) => b.accepted).length,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl border border-emerald-500/20 bg-[#0d1210] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-emerald-500/10 flex items-center justify-between bg-[#121916]/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Resume $\rightarrow$ Job Tailoring Engine
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 uppercase tracking-wider">
                  Anti-Hallucination Guarded
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Grounds experience in job keywords & verified skills without inventing metrics or unverified tools.
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Job Description Input Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center">
                <FileText className="w-4 h-4 mr-1.5 text-emerald-500" />
                Target Job Description
              </label>
              <button
                type="button"
                onClick={handleFetchTailoring}
                disabled={loading || !jobDescription.trim()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing & Tailoring...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {tailoredExperiences.length > 0 ? "Re-tailor Bullets" : "Generate Tailored Bullets"}
                  </>
                )}
              </button>
            </div>

            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target job requirements and qualifications here to optimize experience bullet points..."
              rows={3}
              className="input-dark w-full text-xs font-mono resize-y"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Summary & Global Controls */}
          {tailoredExperiences.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#161f1c] border border-emerald-500/20">
              <div className="flex items-center gap-4 text-xs">
                <span className="text-zinc-400">
                  Total Bullets: <strong className="text-white">{summary?.totalBullets || 0}</strong>
                </span>
                <span className="text-emerald-400">
                  Tailored: <strong>{summary?.tailoredCount || 0}</strong>
                </span>
                <span className="text-zinc-400">
                  Accepted for Apply: <strong className="text-emerald-400">{acceptedCount}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAllAcceptance(true)}
                  className="px-3 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium transition-colors"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={() => setAllAcceptance(false)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-colors"
                >
                  Reject All
                </button>
              </div>
            </div>
          )}

          {/* Side-by-Side Tailoring List */}
          {tailoredExperiences.map((exp, expIdx) => (
            <div key={expIdx} className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-white">
                  {exp.position} <span className="text-zinc-500 font-normal">at</span> {exp.company}
                </h3>
              </div>

              <div className="space-y-4">
                {exp.bullets.map((b, bIdx) => {
                  const hasChanged = b.tailored !== b.original;
                  return (
                    <div
                      key={bIdx}
                      className={`p-4 rounded-xl border transition-all ${
                        b.accepted
                          ? "bg-emerald-950/20 border-emerald-500/40"
                          : "bg-[#141b18] border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Original Bullet */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            <span>Original Experience</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed bg-[#0c110f] p-3 rounded-lg border border-zinc-800">
                            {b.original}
                          </p>
                        </div>

                        {/* Tailored Bullet */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider">
                            <span className={hasChanged ? "text-emerald-400" : "text-zinc-400"}>
                              {hasChanged ? "Optimized & Grounded Bullet" : "Original Retained"}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {b.grounded && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-normal">
                                  <ShieldCheck className="w-3 h-3" /> Grounded
                                </span>
                              )}
                              {b.retriedOnce && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-normal">
                                  Retried & Verified
                                </span>
                              )}
                              {b.engine === "deterministic-rule-engine" && hasChanged && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-normal">
                                  Deterministic Rule Engine
                                </span>
                              )}
                              {b.fallbackToOriginal && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700 font-normal">
                                  Anti-Hallucination Safe
                                </span>
                              )}
                            </div>
                          </div>

                          <p
                            className={`text-xs leading-relaxed p-3 rounded-lg border ${
                              hasChanged
                                ? "bg-emerald-950/30 text-emerald-200 border-emerald-500/30 font-medium"
                                : "bg-[#0c110f] text-zinc-400 border-zinc-800"
                            }`}
                          >
                            {b.tailored}
                          </p>
                        </div>
                      </div>

                      {/* Changes Explained & Per-Bullet Toggle */}
                      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          {b.changesExplained.map((c, cIdx) => (
                            <div key={cIdx} className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                              <span className="text-emerald-400 font-semibold">• {c.change}:</span>
                              <span className="text-zinc-500">{c.reason}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleBulletAcceptance(expIdx, bIdx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            b.accepted
                              ? "bg-emerald-600 text-white shadow-md shadow-emerald-950"
                              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          {b.accepted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" /> Accept Suggestion
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {tailoredExperiences.length === 0 && !loading && (
            <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-2xl">
              <Sparkles className="w-8 h-8 text-emerald-500/40 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-300">No Tailoring Run Yet</p>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                Paste a target job description above and click "Generate Tailored Bullets" to align your experience with job requirements.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-emerald-500/10 bg-[#121916]/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={acceptedCount === 0}
              onClick={handleApply}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
            >
              <Check className="w-4 h-4" />
              Apply {acceptedCount} Accepted Changes to Resume
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
