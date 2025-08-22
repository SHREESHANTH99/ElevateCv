import React, { useState } from "react";
import {
  Upload,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Copy,
} from "lucide-react";

const JobMatcher: React.FC = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedResume, setSelectedResume] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const resumes = [
    { id: "1", title: "Software Engineer Resume", lastModified: "2 days ago" },
    {
      id: "2",
      title: "Full Stack Developer Resume",
      lastModified: "1 week ago",
    },
    { id: "3", title: "Senior Developer Resume", lastModified: "2 weeks ago" },
  ];

  const handleAnalyze = () => {
    if (!jobDescription || !selectedResume) return;

    setLoading(true);
    setTimeout(() => {
      setAnalysis({
        matchScore: 78,
        missingKeywords: ["React", "TypeScript", "AWS", "Docker"],
        presentKeywords: ["JavaScript", "Node.js", "Python", "Git"],
        suggestions: [
          "Add React experience to your skills section",
          "Mention TypeScript projects in your experience",
          "Include AWS certifications if you have any",
          "Add Docker usage examples from your projects",
        ],
        sectionScores: {
          skills: 85,
          experience: 72,
          education: 80,
          keywords: 65,
        },
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Smart Job Matcher</h1>
        <p className="text-gray-600 mt-2">
          Optimize your resume for specific job postings with AI-powered
          analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Resume
            </h2>
            <div className="space-y-3">
              {resumes.map((resume) => (
                <label
                  key={resume.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="resume"
                    value={resume.id}
                    checked={selectedResume === resume.id}
                    onChange={(e) => setSelectedResume(e.target.value)}
                    className="text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {resume.title}
                      </h3>
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Last modified: {resume.lastModified}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <button className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Resume
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Job Description
            </h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
            />
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {jobDescription.length} characters
              </p>
              <button
                onClick={handleAnalyze}
                disabled={!jobDescription || !selectedResume || loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Match
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          {analysis ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200"></div>
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                      style={{
                        background: `conic-gradient(from 0deg, #3B82F6 0deg, #10B981 ${
                          analysis.matchScore * 3.6
                        }deg, #E5E7EB ${analysis.matchScore * 3.6}deg)`,
                      }}
                    ></div>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {analysis.matchScore}%
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Match Score
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {analysis.matchScore >= 80
                      ? "Excellent match!"
                      : analysis.matchScore >= 60
                      ? "Good match with room for improvement"
                      : "Needs optimization"}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Section Breakdown
                </h3>
                <div className="space-y-3">
                  {Object.entries(analysis.sectionScores).map(
                    ([section, score]) => (
                      <div
                        key={section}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {section}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8"></span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map(
                    (keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Matched Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.presentKeywords.map(
                    (keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                  Improvement Suggestions
                </h3>
                <ul className="space-y-2">
                  {analysis.suggestions.map(
                    (suggestion: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm text-gray-700 flex items-start"
                      >
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        {suggestion}
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Auto-Optimize Resume
                  </button>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center">
                    <Copy className="w-4 h-4 mr-2" />
                    Generate Cover Letter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-600 text-sm">
                  Select a resume and paste a job description to get your match
                  score and optimization suggestions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatcher;
