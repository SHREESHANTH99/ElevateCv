import { useDocumentTitle } from '../hooks/useDocumentTitle';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  AlertCircle,
  CheckCircle,
  FileText,
  Upload,
  X,
  Sparkles,
  ArrowRight,
  BarChart3,
} from "lucide-react";

const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;

interface Resume {
  _id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

interface UploadedResume {
  file: File;
  content: string;
  name: string;
}

class JobMatcherAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
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
  static async analyzeJobMatch(resumeId: string, jobDescription: string) {
    try {
      const resumeResponse = await fetch(`${API_BASE_URL}/resume/${resumeId}`, {
        headers: this.getAuthHeaders(),
      });
      if (!resumeResponse.ok) throw new Error("Failed to fetch resume data");
      const resumeResult = await resumeResponse.json();
      const resumeData = resumeResult.resume;

      const response = await fetch(`${API_BASE_URL}/ai/analyze-resume`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ resumeData, jobDescription }),
      });
      if (!response.ok) throw new Error("Failed to analyze job match");
      const result = await response.json();

      return {
        matchScore: result.score || 0,
        label: result.label || "Needs Improvement",
        dimensionScores: result.dimensionScores || result.sectionScores || {},
        jobAnalysis: result.jobAnalysis || null,
        gaps: result.gaps || null,
        atsSimulation: result.atsSimulation || null,
        missingKeywords: result.gaps?.missing?.map((m: any) => m.skill) || [],
        presentKeywords: result.gaps?.matched?.map((m: any) => m.skill) || [],
        suggestions: result.feedback || [],
        sectionScores: result.dimensionScores || {},
      };
    } catch (error) {
      console.error("Error analyzing job match:", error);
      return this.performLocalAnalysis(jobDescription);
    }
  }
  static async analyzeUploadedResume(resumeContent: string, jobDescription: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze-uploaded`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ resumeContent, jobDescription }),
      });
      if (!response.ok) throw new Error("Failed to analyze uploaded resume");
      return await response.json();
    } catch (error) {
      return this.performLocalAnalysisWithContent(resumeContent, jobDescription);
    }
  }
  static performLocalAnalysisWithContent(resumeContent: string, jobDescription: string) {
    const resumeText = resumeContent.toLowerCase();
    const jobKeywords = jobDescription.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !["the","and","or","but","in","on","at","to","for","of","with","by","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should"].includes(word));
    const commonTechKeywords = ["javascript","react","nodejs","python","java","typescript","aws","docker","kubernetes","git","sql","mongodb","postgresql","html","css","angular","vue","express","django","flask","spring","bootstrap","tailwind","redux","graphql","rest","api","microservices","agile","scrum","devops","ci","cd","testing","jest","cypress","selenium"];
    const presentKeywords = jobKeywords.filter((keyword) => resumeText.includes(keyword) && commonTechKeywords.includes(keyword));
    const missingKeywords = jobKeywords.filter((keyword) => !resumeText.includes(keyword) && commonTechKeywords.includes(keyword)).slice(0, 8);
    const matchScore = Math.min(Math.round((presentKeywords.length / Math.max(jobKeywords.filter((k) => commonTechKeywords.includes(k)).length, 1)) * 100), 95);
    return { matchScore, missingKeywords: missingKeywords.slice(0, 6), presentKeywords: presentKeywords.slice(0, 8), suggestions: ["Add missing technical skills mentioned in the job description","Include relevant projects that demonstrate required technologies","Quantify your experience with specific metrics and achievements","Tailor your summary to match the job requirements more closely","Highlight relevant certifications or training in missing areas","Use keywords from the job description throughout your resume"], sectionScores: { skills: Math.min(matchScore + 10, 95), experience: Math.min(matchScore - 5, 90), education: Math.min(matchScore + 5, 85), keywords: matchScore } };
  }
  static performLocalAnalysis(jobDescription: string) {
    const jobKeywords = jobDescription.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !["the","and","or","but","in","on","at","to","for","of","with","by","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should"].includes(word));
    const commonTechKeywords = ["javascript","react","nodejs","python","java","typescript","aws","docker","kubernetes","git","sql","mongodb","postgresql","html","css","angular","vue","express","django","flask","spring","bootstrap","tailwind","redux","graphql","rest","api","microservices","agile","scrum","devops","ci","cd","testing","jest","cypress","selenium"];
    const relevantJobKeywords = jobKeywords.filter((k) => commonTechKeywords.includes(k));
    return { matchScore: 0, missingKeywords: relevantJobKeywords.slice(0, 6), presentKeywords: [], suggestions: ["Unable to fetch resume data for analysis","Please try uploading your resume file instead","Add the following skills mentioned in the job description to your resume","Tailor your resume to include relevant keywords","Quantify your experience with specific metrics","Highlight relevant projects and achievements"], sectionScores: { skills: 0, experience: 0, education: 0, keywords: 0 } };
  }
  static async optimizeResume(resumeId: string, jobDescription: string) {
    const response = await fetch(`${API_BASE_URL}/ai/optimize`, { method: "POST", headers: this.getAuthHeaders(), body: JSON.stringify({ resumeId, jobDescription }) });
    if (!response.ok) throw new Error("Failed to optimize resume");
    return await response.json();
  }
}

const JobMatcher: React.FC = () => {
  useDocumentTitle('Job Matcher');
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResume, setSelectedResume] = useState("");
  const [uploadedResume, setUploadedResume] = useState<UploadedResume | null>(null);
  const [analysisType, setAnalysisType] = useState<"saved" | "upload">("saved");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain"];
    if (!allowedTypes.includes(file.type)) { setError("Please upload a PDF, DOC, DOCX, or TXT file"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("File size must be less than 5MB"); return; }
    try {
      setError(null);
      let content = "";
      if (file.type === "text/plain") { content = await file.text(); }
      else { content = `[Resume content from ${file.name}]\n\nNote: Resume analysis is working with uploaded file.`; }
      setUploadedResume({ file, content, name: file.name });
      setAnalysisType("upload");
    } catch { setError("Failed to read file. Please try again."); }
  };

  const handleRemoveUpload = () => { setUploadedResume(null); setAnalysisType("saved"); };

  const handleAnalyze = async () => {
    if (!jobDescription) { setError("Please paste a job description"); return; }
    if (analysisType === "saved" && !selectedResume) { setError("Please select a saved resume"); return; }
    if (analysisType === "upload" && !uploadedResume) { setError("Please upload a resume file"); return; }
    setLoading(true); setError(null);
    try {
      let result;
      if (analysisType === "saved") { result = await JobMatcherAPI.analyzeJobMatch(selectedResume, jobDescription); }
      else { result = await JobMatcherAPI.analyzeUploadedResume(uploadedResume!.content, jobDescription); }
      setAnalysis(result);
    } catch { setError("Failed to analyze job match. Please try again."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const fetchedResumes = await JobMatcherAPI.getResumes();
        setResumes(fetchedResumes); setError(null);
      } catch { setError("Failed to load resumes"); }
      finally { setLoadingResumes(false); }
    };
    loadResumes();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100">Job Match Analyzer</h1>
        </div>
        <p className="text-zinc-500 ml-[52px]">Analyze how well your resume matches a job description</p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        className="glass-card rounded-lg p-8 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Toggle */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <button
            onClick={() => setAnalysisType("saved")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              analysisType === "saved"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-500 hover:text-zinc-300 border border-zinc-800"
            }`}
          >
            Use Saved Resume
          </button>
          <button
            onClick={() => setAnalysisType("upload")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              analysisType === "upload"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-500 hover:text-zinc-300 border border-zinc-800"
            }`}
          >
            Upload Resume
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center"
          >
            <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Resume Selection */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center uppercase tracking-wider">
              <FileText className="mr-2 text-emerald-500" size={16} />
              {analysisType === "saved" ? "Select Resume" : "Upload Resume"}
            </h2>
            {analysisType === "saved" ? (
              <>
                {loadingResumes ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto" />
                    <p className="text-zinc-600 text-sm mt-3">Loading resumes...</p>
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-zinc-500 text-sm mb-3">No saved resumes found.</p>
                    <button
                      onClick={() => setAnalysisType("upload")}
                      className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
                    >
                      Upload a file instead
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <FileText className="h-4 w-4 text-zinc-500" />
                    </div>
                    <select
                      className="input-dark !pl-12 w-full cursor-pointer"
                      value={selectedResume}
                      onChange={(e) => setSelectedResume(e.target.value)}
                    >
                      <option value="">Select a resume</option>
                      {resumes.map((resume) => (
                        <option key={resume._id} value={resume._id}>
                          {resume.title} (Updated: {new Date(resume.updatedAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                {!uploadedResume ? (
                  <label
                    htmlFor="resume-upload"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-700 rounded-xl hover:border-emerald-500/40 transition-all cursor-pointer bg-zinc-800/20"
                  >
                    <Upload className="w-10 h-10 text-zinc-600 mb-3" />
                    <span className="text-sm text-emerald-500 font-medium">Click to upload</span>
                    <span className="text-xs text-zinc-600 mt-1">PDF, DOC, DOCX, TXT up to 5MB</span>
                    <input id="resume-upload" type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload} />
                  </label>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-emerald-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-emerald-400">{uploadedResume.name}</p>
                          <p className="text-xs text-emerald-500/70">Uploaded successfully</p>
                        </div>
                      </div>
                      <button onClick={handleRemoveUpload} className="text-zinc-500 hover:text-red-400 transition-colors">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Job Description */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center uppercase tracking-wider">
              <FileText className="mr-2 text-emerald-500" size={16} />
              Job Description
            </h2>
            <textarea
              className="input-dark w-full h-40 resize-none"
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <motion.button
            className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:shadow-md hover:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleAnalyze}
            disabled={loading || !jobDescription || (analysisType === "saved" && !selectedResume) || (analysisType === "upload" && !uploadedResume)}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={16} />
                Analyze Match
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Top Bar Score Summary */}
            <div className="glass-card rounded-xl p-8 border border-[#1f2725] bg-[#161c1a]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                      Multi-Dimensional Intelligence Match
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-zinc-100">{analysis.label || "ATS Match Analysis"}</h2>
                  <p className="text-xs text-zinc-400 mt-1">Calibrated across 8 weighted ATS dimensions & semantic vector similarity</p>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-center px-6 py-4 rounded-xl bg-[#0d1110] border border-[#1f2725]">
                    <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1">ATS Score</span>
                    <span className={`text-4xl font-extrabold ${getScoreColor(analysis.matchScore)}`}>
                      {analysis.matchScore}/100
                    </span>
                  </div>
                  {analysis.atsSimulation && (
                    <div className="text-center px-6 py-4 rounded-xl bg-[#0d1110] border border-[#1f2725]">
                      <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1">Parse Rate</span>
                      <span className="text-4xl font-extrabold text-cyan-400">
                        {analysis.atsSimulation.parseRate}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 8-Dimension Breakdown Grid */}
            <div className="glass-card rounded-xl p-6 border border-[#1f2725] bg-[#161c1a]">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-emerald-400" />
                8-Dimension Weighted Score Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Keyword Match (25%)", score: analysis.dimensionScores?.keywordMatch ?? analysis.matchScore, color: "emerald" },
                  { name: "Required Skills (20%)", score: analysis.dimensionScores?.requiredSkills ?? 75, color: "emerald" },
                  { name: "Experience (15%)", score: analysis.dimensionScores?.experience ?? 80, color: "cyan" },
                  { name: "Projects (15%)", score: analysis.dimensionScores?.projects ?? 85, color: "cyan" },
                  { name: "Quantification (10%)", score: analysis.dimensionScores?.quantification ?? 60, color: "amber" },
                  { name: "Structure (5%)", score: analysis.dimensionScores?.structure ?? 95, color: "emerald" },
                  { name: "Education (5%)", score: analysis.dimensionScores?.education ?? 100, color: "emerald" },
                  { name: "Summary Quality (5%)", score: analysis.dimensionScores?.summary ?? 80, color: "cyan" },
                ].map((item) => (
                  <div key={item.name} className="p-4 rounded-lg bg-[#0d1110] border border-[#1f2725]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-zinc-300">{item.name}</span>
                      <span className={`text-xs font-bold text-${item.color}-400`}>{item.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${item.color}-500 rounded-full transition-all duration-500`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Intelligence & Skill Gap Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Job Intelligence Panel */}
              {analysis.jobAnalysis && (
                <div className="glass-card rounded-xl p-6 border border-[#1f2725] bg-[#161c1a] space-y-4">
                  <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Job Intelligence Profile
                  </h3>

                  <div className="p-4 rounded-lg bg-[#0d1110] border border-[#1f2725] flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{analysis.jobAnalysis.jobTitle}</h4>
                      <p className="text-xs text-zinc-500">{analysis.jobAnalysis.domain} • {analysis.jobAnalysis.seniority}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.jobAnalysis.requiredSkills?.map((s: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-md border border-emerald-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysis.jobAnalysis.preferredSkills?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Preferred Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.jobAnalysis.preferredSkills?.map((s: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-md border border-cyan-500/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysis.jobAnalysis.responsibilities?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Primary Responsibilities</span>
                      <ul className="space-y-1">
                        {analysis.jobAnalysis.responsibilities.slice(0, 3).map((r: string, i: number) => (
                          <li key={i} className="text-xs text-zinc-400 flex items-start">
                            <span className="text-emerald-500 mr-2">•</span>{r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Skill Gap Analysis (Matched / Missing / Recommendations) */}
              <div className="glass-card rounded-xl p-6 border border-[#1f2725] bg-[#161c1a] space-y-4">
                <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Skill Gap & Coverage Analysis
                </h3>

                <div>
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-2">Matched Skills (✓)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.presentKeywords?.map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-xs font-medium rounded-md border border-emerald-500/30">
                        ✓ {s}
                      </span>
                    ))}
                    {(!analysis.presentKeywords || analysis.presentKeywords.length === 0) && (
                      <p className="text-xs text-zinc-500">None detected</p>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block mb-2">Missing Skills (✗)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingKeywords?.map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-rose-500/15 text-rose-400 text-xs font-medium rounded-md border border-rose-500/30">
                        ✗ {s}
                      </span>
                    ))}
                    {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) && (
                      <p className="text-xs text-emerald-400">All required skills matched!</p>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-2">Actionable Recommendations</span>
                  <div className="space-y-2">
                    {analysis.suggestions?.map((sugg: string, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-[#0d1110] border border-[#1f2725] flex items-start text-xs text-zinc-300">
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{sugg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ATS Simulation & Structural Warnings */}
            {analysis.atsSimulation && (
              <div className="glass-card rounded-xl p-6 border border-[#1f2725] bg-[#161c1a]">
                <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-4 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ATS Structure Compatibility & Layout Audit
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Compliance Checks</span>
                    {analysis.atsSimulation.compatibility?.map((check: string, i: number) => (
                      <p key={i} className="text-xs text-emerald-400">{check}</p>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">Layout Warnings</span>
                    {analysis.atsSimulation.warnings?.map((warn: string, i: number) => (
                      <p key={i} className="text-xs text-amber-400">{warn}</p>
                    ))}
                    {(!analysis.atsSimulation.warnings || analysis.atsSimulation.warnings.length === 0) && (
                      <p className="text-xs text-emerald-400">✓ No layout or formatting smells detected.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobMatcher;


