import React, { useState } from "react";
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
  const handleInputChange = (field: keyof CoverLetterData, value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const generateCoverLetter = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedContent = `Dear ${coverLetterData.recipientName || '[Hiring Manager]'},
I am writing to express my strong interest in the ${coverLetterData.position} position at ${coverLetterData.companyName}. With my background in [your field] and passion for [relevant area], I am excited about the opportunity to contribute to your team.
In my previous role, I have demonstrated strong skills in [relevant skills] and have successfully [achievement]. I am particularly drawn to ${coverLetterData.companyName} because of [company-specific reason].
I would welcome the opportunity to discuss how my experience and enthusiasm can contribute to ${coverLetterData.companyName}'s continued success. Thank you for considering my application.
Sincerely,
${coverLetterData.yourName}`;
      setCoverLetterData(prev => ({
        ...prev,
        content: generatedContent
      }));
      setIsGenerating(false);
    }, 2000);
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetterData.content);
  };
  const downloadAsPDF = () => {
    if (!coverLetterData.content.trim()) {
      alert("Please generate a cover letter first");
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Cover Letter - ${coverLetterData.yourName}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: right;
            margin-bottom: 30px;
            color: #666;
          }
          .recipient {
            margin-bottom: 20px;
          }
          .content {
            white-space: pre-line;
            margin-bottom: 30px;
          }
          .signature {
            margin-top: 30px;
          }
          .contact-info {
            margin-top: 10px;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${coverLetterData.date}
        </div>
        <div class="recipient">
          <div>${coverLetterData.recipientName || '[Hiring Manager]'}</div>
          <div>${coverLetterData.companyName}</div>
        </div>
        <div>
          <div>Dear ${coverLetterData.recipientName || '[Hiring Manager]'},</div>
        </div>
        <div class="content">
          ${coverLetterData.content}
        </div>
        <div class="signature">
          <div>Sincerely,</div>
          <div style="margin-top: 20px;">${coverLetterData.yourName}</div>
          <div class="contact-info">
            ${coverLetterData.yourEmail} | ${coverLetterData.yourPhone}
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `cover-letter-${coverLetterData.companyName || 'application'}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  const CoverLetterPreview = () => (
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="text-right text-sm text-gray-600 mb-4">
          {coverLetterData.date}
        </div>
        <div className="mb-4">
          <div>{coverLetterData.recipientName || '[Hiring Manager]'}</div>
          <div>{coverLetterData.companyName}</div>
        </div>
        <div className="mb-4">
          <div>Dear {coverLetterData.recipientName || '[Hiring Manager]'},</div>
        </div>
      </div>
      <div className="mb-6 whitespace-pre-line">
        {coverLetterData.content}
      </div>
      <div className="mt-8">
        <div>Sincerely,</div>
        <div className="mt-4">{coverLetterData.yourName}</div>
        <div className="text-sm text-gray-600 mt-2">
          {coverLetterData.yourEmail} | {coverLetterData.yourPhone}
        </div>
      </div>
    </div>
  );
  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow-sm border-b p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-semibold">Cover Letter Preview</h1>
            <div className="flex space-x-3">
              <button
                onClick={downloadAsPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>
        <div className="p-8">
          <CoverLetterPreview />
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cover Letter Generator</h1>
        <p className="text-gray-600 mt-2">
          Create compelling cover letters tailored to specific job applications
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Cover Letter Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Your Name *
                </label>
                <input
                  type="text"
                  value={coverLetterData.yourName}
                  onChange={(e) => handleInputChange("yourName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Your Email *
                </label>
                <input
                  type="email"
                  value={coverLetterData.yourEmail}
                  onChange={(e) => handleInputChange("yourEmail", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={coverLetterData.yourPhone}
                  onChange={(e) => handleInputChange("yourPhone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="text"
                  value={coverLetterData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={coverLetterData.recipientName}
                  onChange={(e) => handleInputChange("recipientName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hiring Manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Company Name *
                </label>
                <input
                  type="text"
                  value={coverLetterData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Google"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Position Title *
                </label>
                <input
                  type="text"
                  value={coverLetterData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Software Engineer"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter Content
              </label>
              <textarea
                value={coverLetterData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your cover letter content will appear here after generation..."
              />
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={generateCoverLetter}
                disabled={isGenerating || !coverLetterData.companyName || !coverLetterData.position}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </button>
              <button
                onClick={() => setShowPreview(true)}
                disabled={!coverLetterData.content}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tips for Great Cover Letters
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Personalize</h4>
                <p className="text-sm text-blue-700">
                  Address the hiring manager by name when possible and mention specific details about the company.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Be Specific</h4>
                <p className="text-sm text-green-700">
                  Include specific examples of your achievements and how they relate to the job requirements.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Show Enthusiasm</h4>
                <p className="text-sm text-purple-700">
                  Express genuine interest in the company and position. Research the company beforehand.
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Keep it Concise</h4>
                <p className="text-sm text-orange-700">
                  Aim for 3-4 paragraphs and keep it under one page. Be clear and to the point.
                </p>
              </div>
            </div>
          </div>
          {coverLetterData.content && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </button>
                <button
                  onClick={downloadAsPDF}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CoverLetterGenerator;
