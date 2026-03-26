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
  ];

  return (
    <motion.nav
      className="glass sticky top-0 z-50 border-b border-zinc-800/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <motion.div
                className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FileText className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold gradient-text">
                  ElevateCv
                </span>
                <motion.div
                  className="flex items-center text-[10px] text-zinc-500 tracking-wider uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-500" />
                  AI-Powered
                </motion.div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <motion.div
            className="hidden lg:flex items-center space-x-1"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {navItems.map(({ path, icon: Icon, label }, index) => {
              const isActive = location.pathname === path;
              return (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.08 }}
                >
                  <Link
                    to={path}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-emerald-400"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                        layoutId="navbar-indicator"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right Side */}
          <motion.div
            className="flex items-center space-x-3"
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
                  className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 text-sm font-semibold"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </motion.div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all duration-300"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span>Profile</span>
                  </Link>
                </motion.div>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-800/50 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-zinc-400" />
                ) : (
                  <Menu className="w-5 h-5 text-zinc-400" />
                )}
              </motion.div>
            </motion.button>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden py-4 border-t border-zinc-800/60"
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
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    to={path}
                    className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg mx-2 my-0.5 transition-all duration-300 ${
                      location.pathname === path
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                className="mt-3 pt-3 border-t border-zinc-800/60 mx-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {!user ? (
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-emerald-400 bg-emerald-500/10 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg w-full"
                  >
                    <LogOut className="w-4 h-4" />
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
