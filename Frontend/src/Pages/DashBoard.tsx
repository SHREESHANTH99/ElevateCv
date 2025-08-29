import React from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  FileText,
  Target,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const stats = [
    { label: "Resumes Created", value: "12", icon: FileText, color: "blue" },
    {
      label: "Avg Match Score",
      value: "85%",
      icon: TrendingUp,
      color: "purple",
    },
    { label: "Interviews", value: "3", icon: CheckCircle, color: "orange" },
  ];

  const recentResumes = [
    {
      id: "1",
      title: "Software Engineer Resume",
      company: "Google",
      matchScore: 92,
      updatedAt: "2 hours ago",
    },
    {
      id: "2",
      title: "Product Manager Resume",
      company: "Meta",
      matchScore: 88,
      updatedAt: "1 day ago",
    },
    {
      id: "3",
      title: "Data Scientist Resume",
      company: "Netflix",
      matchScore: 85,
      updatedAt: "3 days ago",
    },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Career Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Track your job search progress and manage your applications
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div
                className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 text-${color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/resume/builder"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6 hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
        >
          <Plus className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Create New Resume</h3>
          <p className="text-blue-100">
            Start building a professional resume from scratch
          </p>
        </Link>

        <Link
          to="/job-matcher"
          className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6 hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105"
        >
          <Target className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Match Job</h3>
          <p className="text-green-100">
            Optimize your resume for specific job postings
          </p>
        </Link>

        <Link
          to="/cover-letter"
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg p-6 hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105"
        >
          <Mail className="w-8 h-8 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Cover Letter</h3>
          <p className="text-purple-100">Generate compelling cover letters</p>
        </Link>
      </div>

      <div className="grid place-items-center grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Resumes
              </h2>
              <Link
                to="/resume/builder"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {resume.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tailored for {resume.company}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {resume.updatedAt}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {resume.matchScore}%
                      </div>
                      <div className="text-xs text-gray-500">Match</div>
                    </div>
                    <Link
                      to={`/resume/builder/${resume.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Upcoming Tasks
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Follow up with Google recruiter
                </p>
                <p className="text-xs text-gray-500">Due in 2 days</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Prepare for Meta interview
                </p>
                <p className="text-xs text-gray-500">Scheduled for tomorrow</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
