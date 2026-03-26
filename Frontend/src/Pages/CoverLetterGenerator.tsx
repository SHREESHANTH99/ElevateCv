import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Copy,
  RefreshCw,
  Mail,
  User,
  Building,
  Calendar,
  Eye,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Phone,
} from "lucide-react";

interface CoverLetterData {
  recipientName: string;
  companyName: string;
  position: string;
  yourName: string;
  yourEmail: string;
  yourPhone: string;
  date: string;
  content: string;
}

const CoverLetterGenerator: React.FC = () => {
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    recipientName: "",
    companyName: "",
    position: "",
    yourName: "",
    yourEmail: "",
    yourPhone: "",
    date: new Date().toLocaleDateString(),
    content: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field: keyof CoverLetterData, value: string) => {
    setCoverLetterData((prev) => ({ ...prev, [field]: value }));
  };

  const generateCoverLetter = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedContent = `Dear ${coverLetterData.recipientName || "[Hiring Manager]"},

I am writing to express my strong interest in the ${coverLetterData.position} position at ${coverLetterData.companyName}. With my background in [your field] and passion for [relevant area], I am excited about the opportunity to contribute to your team.

In my previous role, I have demonstrated strong skills in [relevant skills] and have successfully [achievement]. I am particularly drawn to ${coverLetterData.companyName} because of [company-specific reason].

I would welcome the opportunity to discuss how my experience and enthusiasm can contribute to ${coverLetterData.companyName}'s continued success. Thank you for considering my application.

Sincerely,
${coverLetterData.yourName}`;

      setCoverLetterData((prev) => ({ ...prev, content: generatedContent }));
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetterData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsPDF = () => {
    if (!coverLetterData.content.trim()) { alert("Please generate a cover letter first"); return; }
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Cover Letter - ${coverLetterData.yourName}</title><style>body{font-family:'Arial',sans-serif;line-height:1.6;color:#333;max-width:800px;margin:0 auto;padding:40px 20px;}.header{text-align:right;margin-bottom:30px;color:#666;}.content{white-space:pre-line;margin-bottom:30px;}.contact-info{margin-top:10px;font-size:14px;color:#666;}</style></head><body><div class="header">${coverLetterData.date}</div><div>${coverLetterData.recipientName || "[Hiring Manager]"}<br/>${coverLetterData.companyName}</div><div class="content">${coverLetterData.content}</div><div class="contact-info">${coverLetterData.yourEmail} | ${coverLetterData.yourPhone}</div></body></html>`;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none"; a.href = url;
    a.download = `cover-letter-${coverLetterData.companyName || "application"}.html`;
    document.body.appendChild(a); a.click();
    window.URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center text-zinc-400 hover:text-zinc-200 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </button>
          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadAsPDF}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-2xl p-12 max-w-3xl mx-auto text-gray-800"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          <div className="text-right text-sm text-gray-500 mb-8">{coverLetterData.date}</div>
          <div className="mb-6 text-sm">
            <div className="font-medium">{coverLetterData.recipientName || "[Hiring Manager]"}</div>
            <div>{coverLetterData.companyName}</div>
          </div>
          <div className="whitespace-pre-line leading-relaxed text-sm">{coverLetterData.content}</div>
          <div className="mt-10 border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-500">
              {coverLetterData.yourEmail} | {coverLetterData.yourPhone}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100">Cover Letter Generator</h1>
        </div>
        <p className="text-zinc-500 ml-[52px]">Create compelling cover letters tailored to specific job applications</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-sm font-semibold text-zinc-300 mb-6 uppercase tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-violet-500" />
              Cover Letter Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                  <User className="w-3 h-3 inline mr-1" /> Your Name *
                </label>
                <input
                  type="text"
                  value={coverLetterData.yourName}
                  onChange={(e) => handleInputChange("yourName", e.target.value)}
                  className="input-dark"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                  <Mail className="w-3 h-3 inline mr-1" /> Your Email *
                </label>
                <input
                  type="email"
                  value={coverLetterData.yourEmail}
                  onChange={(e) => handleInputChange("yourEmail", e.target.value)}
                  className="input-dark"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                  <Phone className="w-3 h-3 inline mr-1" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={coverLetterData.yourPhone}
                  onChange={(e) => handleInputChange("yourPhone", e.target.value)}
                  className="input-dark"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                  <Calendar className="w-3 h-3 inline mr-1" /> Date
                </label>
                <input
                  type="text"
                  value={coverLetterData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="input-dark"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                  <User className="w-3 h-3 inline mr-1" /> Recipient Name
                </label>
                <input
                  type="text"
                  value={coverLetterData.recipientName}
                  onChange={(e) => handleInputChange("recipientName", e.target.value)}
                  className="input-dark"
                  placeholder="Hiring Manager"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                  <Building className="w-3 h-3 inline mr-1" /> Company Name *
                </label>
                <input
                  type="text"
                  value={coverLetterData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className="input-dark"
                  placeholder="Google"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                  <FileText className="w-3 h-3 inline mr-1" /> Position Title *
                </label>
                <input
                  type="text"
                  value={coverLetterData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  className="input-dark"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
                Cover Letter Content
              </label>
              <textarea
                value={coverLetterData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={12}
                className="input-dark resize-none"
                placeholder="Your cover letter content will appear here after generation..."
              />
            </div>

            <div className="mt-6 flex space-x-3">
              <motion.button
                onClick={generateCoverLetter}
                disabled={isGenerating || !coverLetterData.companyName || !coverLetterData.position}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={() => setShowPreview(true)}
                disabled={!coverLetterData.content}
                className="flex items-center px-6 py-3 border border-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm hover:border-zinc-500 hover:text-zinc-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                whileHover={{ scale: !coverLetterData.content ? 1 : 1.02 }}
                whileTap={{ scale: !coverLetterData.content ? 1 : 0.98 }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="lg:col-span-1 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Tips */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
              Tips for Success
            </h3>
            <div className="space-y-3">
              {[
                { title: "Personalize", desc: "Address the hiring manager by name and mention specific company details.", color: "emerald" },
                { title: "Be Specific", desc: "Include specific examples of achievements related to the job.", color: "cyan" },
                { title: "Show Enthusiasm", desc: "Express genuine interest in the company and position.", color: "violet" },
                { title: "Keep it Concise", desc: "Aim for 3-4 paragraphs and keep it under one page.", color: "amber" },
              ].map(({ title, desc, color }) => (
                <div key={title} className={`p-3 rounded-xl bg-${color}-500/5 border border-${color}-500/10`}>
                  <h4 className={`text-sm font-medium text-${color}-400 mb-1`}>{title}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {coverLetterData.content && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-sm font-semibold text-zinc-300 mb-4 uppercase tracking-wider">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </button>
                <button
                  onClick={downloadAsPDF}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-all"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
