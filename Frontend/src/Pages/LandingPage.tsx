import { useDocumentTitle } from '../hooks/useDocumentTitle';
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
  Eye,
  BarChart3,
} from "lucide-react";
import { Compare } from "../Components/ui/compare";
import { TextAnimate } from "../Components/magicui/text-animate";

const Landing: React.FC = () => {
  useDocumentTitle('ElevateCV - Research-Grade AI Resume & ATS Platform');
  const { user } = useAuth();

  const atsDimensions = [
    { title: "Keyword Match", weight: "25%", desc: "Evaluates exact & normalized tech stack coverage against job descriptions.", color: "border-emerald-500/40 text-emerald-400" },
    { title: "Required Skills", weight: "20%", desc: "Hard requirement compliance parsed via Gemini 1.5 LLM skill ontology.", color: "border-emerald-500/40 text-emerald-400" },
    { title: "Experience Relevance", weight: "15%", desc: "70% subject-matter job alignment + 30% structural bullet impact.", color: "border-cyan-500/40 text-cyan-400" },
    { title: "Projects Relevance", weight: "15%", desc: "Technical project alignment matching job tech stack requirements.", color: "border-cyan-500/40 text-cyan-400" },
    { title: "Quantification", weight: "10%", desc: "Analyzes bullet metrics, scale ($/%), and impact action verbs.", color: "border-amber-500/40 text-amber-400" },
    { title: "Structure & ATS Parse", weight: "5%", desc: "Simulates legacy ATS parser section detection & layout readability.", color: "border-purple-500/40 text-purple-400" },
    { title: "Education Match", weight: "5%", desc: "Degree, field of study, and institutional qualification alignment.", color: "border-emerald-500/40 text-emerald-400" },
    { title: "Summary Quality", weight: "5%", desc: "Professional summary term density & targeted value proposition.", color: "border-cyan-500/40 text-cyan-400" },
  ];

  const features = [
    {
      icon: FileText,
      title: "AI Resume Builder",
      description: "Build ATS-compliant resumes with real-time AI suggestions and expert template designs.",
      badge: "Gemini 1.5 Powered"
    },
    {
      icon: Target,
      title: "8-Dimension Job Matcher",
      description: "Match your resume against any job description with multi-dimensional weighted ATS scoring.",
      badge: "Vector Embeddings"
    },
    {
      icon: Mail,
      title: "Cover Letter Generator",
      description: "Generate tailored, professional cover letters that highlight relevant experiences.",
      badge: "Instant Generation"
    },
    {
      icon: Sparkles,
      title: "Skill Ontology Engine",
      description: "Hierarchical skill matching mapping tech aliases (e.g., JS → JavaScript, PyTorch → ML).",
      badge: "Deep Parsing"
    },
    {
      icon: Zap,
      title: "PDF & DOCX Extraction",
      description: "Upload any resume file directly. Automatic text extraction powered by backend pdf-parse.",
      badge: "Native Parse"
    },
    {
      icon: Shield,
      title: "ATS Parser Simulation",
      description: "Simulate Workday, Greenhouse, Lever, and Taleo parsing algorithms before applying.",
      badge: "100% Compliant"
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d0b] text-zinc-100 selection:bg-emerald-500 selection:text-black overflow-hidden font-sans">
      {/* Background Ambient Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-[#1f2924] bg-[#090d0b]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-zinc-950 font-bold" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
                Elevate<span className="text-emerald-400">CV</span>
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                to="/job-matcher"
                className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 px-3 py-2 rounded-lg transition-colors"
              >
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Job Matcher</span>
              </Link>

              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-300"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-zinc-400 hover:text-white text-sm font-medium transition-colors hidden sm:block"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-300"
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

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#121815] border border-emerald-500/30 text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-8 shadow-xl"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>ElevateCV v2.0 • 8-Dimension Intelligence Matcher</span>
        </motion.div>

        <div className="max-w-4xl mx-auto mb-8 text-center">
          <TextAnimate
            animation="blurInUp"
            by="word"
            duration={0.6}
            as="h1"
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-white"
          >
            Stop Guessing. Beat the
          </TextAnimate>
          <TextAnimate
            animation="blurInUp"
            by="word"
            delay={0.2}
            duration={0.6}
            as="h1"
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] text-emerald-400 mt-2 block"
          >
            ATS Algorithms.
          </TextAnimate>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Calibrated across 8 weighted ATS dimensions, Gemini 1.5 LLM parsing, and deep skill ontology. Never get screened out by automated ATS filters again.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            to={user ? "/job-matcher" : "/register"}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-4 rounded-xl font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
          >
            <Target className="w-5 h-5" />
            <span>Analyze Job Match</span>
          </Link>
          <Link
            to="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#121815] border border-[#1f2924] hover:border-zinc-700 text-zinc-300 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:bg-[#18201c]"
          >
            <Eye className="w-5 h-5 text-emerald-400" />
            <span>Explore Templates</span>
          </Link>
        </motion.div>

        {/* Visual Transformation Drag Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto rounded-2xl p-2 bg-[#121815] border border-[#1f2924] shadow-2xl"
        >
          <div className="text-center py-4 border-b border-[#1f2924] mb-2 flex items-center justify-center space-x-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Drag Slider to Compare: Standard Resume vs. ElevateCV AI
            </span>
          </div>
          <Compare
            firstImage="/template-previews/before-example.png"
            secondImage="/template-previews/modern.png"
            className="h-[380px] sm:h-[480px] w-full rounded-xl overflow-hidden"
            slideMode="drag"
          />
        </motion.div>
      </section>

      {/* 8-Dimension Intelligence Bento Grid */}
      <section className="relative z-10 py-24 bg-[#0d120f]/80 border-y border-[#1f2924]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
              8-Dimension Weighted Scoring Engine
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Unlike generic keyword counters, ElevateCV evaluates your candidate profile across 8 weighted ATS dimensions to guarantee maximum interview call rates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {atsDimensions.map((dim, idx) => (
              <motion.div
                key={dim.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`p-6 rounded-2xl bg-[#121815] border ${dim.color} hover:bg-[#161e1b] transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                      Dim 0{idx + 1}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-extrabold text-xs">
                      {dim.weight}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{dim.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{dim.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">
            Features
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Everything Required to Win Interviews
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="p-8 rounded-2xl bg-[#121815] border border-[#1f2924] hover:border-emerald-500/40 hover:bg-[#161e1b] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all duration-300">
                  <item.icon className="w-6 h-6 text-emerald-400 group-hover:text-zinc-950" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#090d0b] text-zinc-400 border border-[#1f2924]">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="relative z-10 py-20 border-t border-[#1f2924] bg-[#0d120f]/60">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
            Ready to Elevate Your Resume?
          </h2>
          <p className="text-zinc-400 text-base mb-10 max-w-xl mx-auto">
            Build your tailored resume in minutes and verify your score against target job listings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="inline-flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-4 rounded-xl font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 text-zinc-950" />
              <span>{user ? "Go to Dashboard" : "Start Free Now"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1f2924] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-xs">
              E
            </div>
            <span className="font-bold text-white">ElevateCV</span>
            <span>• Research-Grade Resume Intelligence</span>
          </div>
          <p>© 2026 ElevateCV. Powered by Gemini 1.5 LLM & Multi-Dimensional ATS Scorer.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;


