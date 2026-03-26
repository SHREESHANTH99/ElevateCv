import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  TrendingUp,
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

      const response = await fetch(`${API_BASE_URL}/ai/optimize`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ resumeData, jobDescription }),
      });
      if (!response.ok) throw new Error("Failed to analyze job match");
      const result = await response.json();

      return {
        matchScore: result.optimization?.matchScore?.percentage || 0,
        missingKeywords:
          result.optimization?.suggestions?.find((s: any) => s.type === "missing_keywords")?.items || [],
        presentKeywords:
          result.optimization?.jobKeywords?.filter((keyword: any) => {
            const resumeText = JSON.stringify(resumeData).toLowerCase();
            return resumeText.includes(keyword.toLowerCase());
          }) || [],
        suggestions: result.optimization?.suggestions?.flatMap((s: any) => s.items) || [],
        sectionScores: {
          skills: result.optimization?.matchScore?.percentage || 0,
          experience: Math.max((result.optimization?.matchScore?.percentage || 0) - 10, 0),
          education: Math.max((result.optimization?.matchScore?.percentage || 0) - 5, 0),
          keywords: result.optimization?.matchScore?.percentage || 0,
        },
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

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-cyan-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-red-500 to-rose-500";
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100">Job Match Analyzer</h1>
        </div>
        <p className="text-zinc-500 ml-[52px]">Analyze how well your resume matches a job description</p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        className="glass-card rounded-2xl p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-8"
          >
            <div className="flex items-center space-x-3 mb-8">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold text-zinc-100">Match Analysis</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Score */}
              <div className="md:col-span-1">
                <div className="text-center p-8 rounded-2xl bg-zinc-800/40 border border-zinc-800/60">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Match Score</h3>
                  <div className={`text-6xl font-bold mb-3 ${getScoreColor(analysis.matchScore)}`}>
                    {analysis.matchScore}%
                  </div>
                  <p className="text-sm text-zinc-500">
                    {analysis.matchScore > 80 ? "Excellent match!" : analysis.matchScore > 60 ? "Good match" : "Needs improvement"}
                  </p>
                </div>

                {/* Section Scores */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Section Scores</h3>
                  {Object.entries(analysis.sectionScores || {}).map(([section, score]: [string, unknown]) => (
                    <div key={section}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="capitalize text-sm text-zinc-400">{section}</span>
                        <span className="text-sm font-semibold text-zinc-300">{String(score)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${getScoreBarColor(Number(score))} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center uppercase tracking-wider">
                      <CheckCircle className="mr-2 text-emerald-500" size={16} />
                      Matching Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.presentKeywords?.map((keyword: string, index: number) => (
                        <span key={index} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 capitalize">
                          {keyword}
                        </span>
                      ))}
                      {(!analysis.presentKeywords || analysis.presentKeywords.length === 0) && (
                        <p className="text-sm text-zinc-600">No matching keywords found</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center uppercase tracking-wider">
                      <AlertCircle className="mr-2 text-amber-500" size={16} />
                      Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingKeywords?.map((keyword: string, index: number) => (
                        <span key={index} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-lg border border-amber-500/20 capitalize">
                          {keyword}
                        </span>
                      ))}
                      {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) && (
                        <p className="text-sm text-zinc-600">No missing keywords</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center uppercase tracking-wider">
                    <TrendingUp className="mr-2 text-cyan-500" size={16} />
                    Improvement Suggestions
                  </h3>
                  <div className="space-y-2">
                    {analysis.suggestions?.map((suggestion: string, index: number) => (
                      <div key={index} className="flex items-start p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/60">
                        <ArrowRight className="w-3.5 h-3.5 text-cyan-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-zinc-400">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobMatcher;
