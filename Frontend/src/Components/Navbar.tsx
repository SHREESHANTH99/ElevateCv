import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  FileText,
  Target,
  Mail,
  BarChart3,
  User,
  Menu,
  LogIn,
  LogOut,
  Sparkles,
  X,
} from "lucide-react";
const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };
  const navItems = [
    { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { path: "/resume/builder", icon: FileText, label: "Resume Builder" },
    { path: "/job-matcher", icon: Target, label: "Job Matcher" },
    { path: "/cover-letter", icon: Mail, label: "Cover Letter" },
    { path: "/templates", icon: FileText, label: "Templates" },
    { path: "/profile", icon: User, label: "Profile" },
  ];
  return (
    <motion.nav
      className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200/50 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <motion.div
                className="relative w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-6 h-6 text-white" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl opacity-0 group-hover:opacity-20"
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ElevateCv
                </span>
                <motion.div
                  className="flex items-center text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI-Powered
                </motion.div>
              </div>
            </Link>
          </motion.div>
          <motion.div
            className="hidden md:flex items-center space-x-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {navItems.map(({ path, icon: Icon, label }, index) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              >
                <Link
                  to={path}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 group ${
                    location.pathname === path
                      ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span>{label}</span>
                  {location.pathname === path && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                      layoutId="navbar-active"
                      initial={false}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {!user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg font-semibold"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              </motion.div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/profile"
                    className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 border border-gray-200 hover:border-blue-200"
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="hidden md:flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-300 font-semibold border border-gray-200 hover:border-red-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            )}
            <div className="relative">
              <Link
                to="/profile"
                className="flex items-center space-x-1 p-2 rounded-md hover:bg-gray-50"
              >
                <User className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
            <motion.button
              className="md:hidden p-3 rounded-xl hover:bg-blue-50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-blue-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden py-6 border-t border-gray-200/50 bg-gradient-to-br from-blue-50 to-purple-50"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navItems.map(({ path, icon: Icon, label }, index) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    to={path}
                    className={`flex items-center space-x-3 px-6 py-4 text-base font-semibold transition-all duration-300 ${
                      location.pathname === path
                        ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 mx-4 rounded-xl shadow-lg"
                        : "text-gray-700 hover:text-blue-600 hover:bg-white/50 mx-4 rounded-xl"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                className="mt-4 pt-4 border-t border-gray-200/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {!user ? (
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-6 py-4 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 mx-4 rounded-xl shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-6 py-4 text-base font-semibold text-red-600 bg-red-50 hover:bg-red-100 mx-4 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
export default Navbar;
