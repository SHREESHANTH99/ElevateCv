import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Target,
  Mail,
  BarChart3,
  //   Settings,
  User,
  //   LogOut,
  Menu,
} from "lucide-react";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { path: "/resume/builder", icon: FileText, label: "Resume Builder" },
    { path: "/job-matcher", icon: Target, label: "Job Matcher" },
    { path: "/cover-letter", icon: Mail, label: "Cover Letter" },
    { path: "/templates", icon: FileText, label: "Templates" },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ResumeAI</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-sm text-gray-600">John Doe</span>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Pro
              </span>
            </div>

            <div className="relative">
              <button className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-50">
                <User className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                  location.pathname === path
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
