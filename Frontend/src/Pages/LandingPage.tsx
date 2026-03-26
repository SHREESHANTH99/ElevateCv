import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import {
  FileText,
  Target,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Download,
  Eye,
  ChevronRight,
} from "lucide-react";

const Landing: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      description:
        "Create professional resumes with AI-powered suggestions and ATS optimization.",
      gradient: "from-emerald-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "Smart Job Matching",
      description:
        "Tailor your resume for specific jobs with intelligent keyword matching.",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Mail,
      title: "Cover Letter Generator",
      description:
        "Generate compelling cover letters that complement your resume.",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Sparkles,
      title: "Template Gallery",
      description:
        "Choose from professional templates designed by career experts.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: Zap,
      title: "Instant Export",
      description: "Download your resume in multiple formats instantly.",
      gradient: "from-rose-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "ATS Optimized",
      description: "Beat applicant tracking systems with optimized formatting.",
      gradient: "from-blue-500 to-indigo-500",
    },
  ];



  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-[120px]"
            animate={{
              x: [0, 60, 0],
              y: [0, -40, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-[120px]"
            animate={{
              x: [0, -60, 0],
              y: [0, 40, 0],
              scale: [1.2, 1, 1.2],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 3,
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full filter blur-[150px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Navbar spacer */}
        <nav className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">ElevateCv</span>
              </Link>
              <div className="flex items-center space-x-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-sm font-semibold"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors hidden sm:block"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-sm font-semibold"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-40">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-light text-sm text-zinc-400 mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI-Powered Resume Platform</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[0.95]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="text-zinc-100">Land Your</span>
              <br />
              <span className="text-zinc-100">Dream Job with </span>
              <span className="gradient-text">AI</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Transform your career with intelligent resume building, smart job
              matching, and professional templates — all powered by cutting-edge AI.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold text-base hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
                >
                  <span>{user ? "Go to Dashboard" : "Get Started Free"}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to="/templates"
                  className="inline-flex items-center justify-center space-x-2 border border-zinc-700 text-zinc-300 px-8 py-4 rounded-xl font-semibold text-base hover:border-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all duration-300"
                >
                  <Eye className="w-5 h-5" />
                  <span>View Templates</span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>


      </div>

      {/* Features Section */}
      <motion.div
        className="py-32 relative"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4 block">
              Features
            </span>
            <h2 className="text-4xl md:text-6xl font-bold text-zinc-100 mb-6">
              Everything You Need to{" "}
              <span className="gradient-text">Get Hired</span>
            </h2>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              Our comprehensive suite of tools helps you create, optimize, and
              track your job applications
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="glass-card rounded-2xl p-8 h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3 group-hover:text-emerald-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-500 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="py-32 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Background glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[150px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-12 md:p-16 text-center">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-zinc-100 mb-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              Ready to{" "}
              <span className="gradient-text">Elevate Your Career?</span>
            </motion.h2>
            <motion.p
              className="text-lg text-zinc-500 max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Start building your professional resume today with AI-powered tools
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="group inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{user ? "Go to Dashboard" : "Start Building Now"}</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/templates"
                  className="inline-flex items-center justify-center space-x-2 border border-zinc-700 text-zinc-300 px-10 py-4 rounded-xl font-semibold text-lg hover:border-zinc-500 hover:text-zinc-100 transition-all duration-300"
                >
                  <Download className="w-5 h-5" />
                  <span>Free Templates</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold gradient-text">ElevateCv</span>
            </div>
            <p className="text-zinc-600 text-sm">
              © 2026 ElevateCv. Crafted with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
