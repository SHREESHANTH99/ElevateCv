import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Eye,
  Download,
  Star,
  Filter,
  Search,
  Sparkles,
  Crown,
  Zap,
  X,
} from "lucide-react";
import PreviewModal from "../Components/PreviewModal";
import Toast from "../Components/Toast";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  isPopular: boolean;
  isFree: boolean;
  colors: string[];
  features: string[];
}

const Templates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    icon?: "download" | "preview" | "check";
  } | null>(null);

  const categories = [
    { id: "all", name: "All", count: 15 },
    { id: "executive", name: "Executive", count: 4 },
    { id: "modern", name: "Modern", count: 4 },
    { id: "creative", name: "Creative", count: 3 },
    { id: "minimal", name: "Minimal", count: 2 },
    { id: "ats", name: "ATS Optimized", count: 2 },
  ];

  const templates: Template[] = [
    { id: "executive", name: "Executive Blue", description: "Professional and authoritative design for C-suite and senior executives", category: "executive", preview: "", isPopular: true, isFree: false, colors: ["#1e40af", "#1e3a8a", "#172554"], features: ["Leadership Focus", "Two-Column Layout", "Achievement Highlights", "Professional"] },
    { id: "corporate", name: "Corporate Classic", description: "Timeless design for corporate professionals and business leaders", category: "executive", preview: "", isPopular: true, isFree: false, colors: ["#1f2937", "#111827", "#030712"], features: ["Professional", "Traditional Layout", "Results-Oriented", "ATS Friendly"] },
    { id: "modern", name: "Modern Professional", description: "Clean and contemporary design perfect for tech and business roles", category: "modern", preview: "", isPopular: true, isFree: true, colors: ["#2563eb", "#1d4ed8", "#1e40af"], features: ["ATS Optimized", "Single Column", "Modern Typography", "Color Accents"] },
    { id: "tech", name: "Tech Innovator", description: "Sleek design specifically for technology professionals and developers", category: "modern", preview: "", isPopular: true, isFree: false, colors: ["#7c3aed", "#6d28d9", "#5b21b6"], features: ["Skills Matrix", "Project Showcase", "GitHub Integration", "Code Samples"] },
    { id: "creative", name: "Creative Vision", description: "Modern and artistic design for creative professionals", category: "creative", preview: "", isPopular: true, isFree: false, colors: ["#c026d3", "#a21caf", "#86198f"], features: ["Portfolio Integration", "Visual Elements", "Creative Layout", "Colorful"] },
    { id: "engineer", name: "Design Pro", description: "For designers, artists, and creative professionals", category: "creative", preview: "", isPopular: false, isFree: false, colors: ["#e11d48", "#be123c", "#9f1239"], features: ["Visual Portfolio", "Project Showcase", "Skills Visualization", "Creative"] },
    { id: "minimalist", name: "Minimalist", description: "Clean and elegant design that emphasizes your content", category: "minimal", preview: "", isPopular: true, isFree: true, colors: ["#4b5563", "#374151", "#1f2937"], features: ["Clean Layout", "Readable Typography", "Professional", "Timeless"] },
    { id: "ats", name: "ATS Pro", description: "Optimized for Applicant Tracking Systems with perfect structure", category: "ats", preview: "", isPopular: true, isFree: true, colors: ["#0d9488", "#0f766e", "#115e59"], features: ["ATS Optimized", "Single Column", "Keyword Rich", "High Conversion"] },
    { id: "classic", name: "Career Starter", description: "Perfect for entry-level candidates and career changers", category: "ats", preview: "", isPopular: false, isFree: true, colors: ["#0ea5e9", "#0284c7", "#0369a1"], features: ["ATS Friendly", "Skills-Based", "Education Focus", "Internship Ready"] },
    { id: "ind-1", name: "Healthcare Pro", description: "Professional template for healthcare and medical professionals", category: "executive", preview: "", isPopular: false, isFree: false, colors: ["#0d9488", "#0f766e", "#115e59"], features: ["Certification Focus", "Clinical Experience", "Patient Care", "Professional"] },
    { id: "ind-2", name: "Sales Champion", description: "Highlight your sales achievements and metrics effectively", category: "modern", preview: "", isPopular: false, isFree: false, colors: ["#b91c1c", "#991b1b", "#7f1d1d"], features: ["Metrics Focus", "Achievement Driven", "Results Oriented", "Client Success"] },
    { id: "ind-3", name: "Academic Scholar", description: "Formal template perfect for academic and research positions", category: "executive", preview: "", isPopular: false, isFree: true, colors: ["#4b5563", "#374151", "#1f2937"], features: ["Publication List", "Research Focus", "Academic Format", "Citations"] },
    { id: "ind-4", name: "Tech Leader", description: "For senior technology professionals and engineering managers", category: "executive", preview: "", isPopular: true, isFree: false, colors: ["#7c3aed", "#6d28d9", "#5b21b6"], features: ["Leadership Focus", "Technical Depth", "Team Management", "Project Highlights"] },
  ];

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter((template) => template.category === selectedCategory);

  const handleDownloadSample = async (template: Template) => {
    try {
      const sampleData = { templateId: template.id, templateName: template.name, sampleContent: `Sample resume data for ${template.name} template`, features: template.features, colors: template.colors, timestamp: new Date().toISOString() };
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(sampleData, null, 2)], { type: "application/json" });
      element.href = URL.createObjectURL(file);
      element.download = `${template.name.replace(/\s+/g, "_")}_Sample.json`;
      document.body.appendChild(element); element.click(); document.body.removeChild(element);
      setToast({ message: `${template.name} sample downloaded!`, type: "success", icon: "download" });
    } catch { setToast({ message: "Failed to download sample.", type: "error" }); }
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setToast({ message: `Previewing ${template.name}`, type: "info", icon: "preview" });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.span
            className="text-emerald-500 text-sm font-semibold uppercase tracking-widest mb-4 block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Template Gallery
          </motion.span>
          <motion.h1
            className="text-4xl md:text-6xl font-bold gradient-text mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Resume Templates
          </motion.h1>
          <motion.p
            className="text-lg text-zinc-500 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Choose from professionally designed templates crafted by experts to
            make your resume stand out
          </motion.p>
          <motion.div
            className="flex items-center justify-center space-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {[
              { icon: Sparkles, label: "ATS Optimized", color: "emerald" },
              { icon: Crown, label: "Expert Designed", color: "violet" },
              { icon: Zap, label: "Instant Download", color: "amber" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className={`flex items-center text-${color}-500 text-sm`}>
                <Icon className="w-4 h-4 mr-1.5" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Categories */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Template Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="glass-card rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => setSelectedTemplate(template)}
              >
                {/* Preview Area */}
                <div className="relative h-48 bg-zinc-800/50 flex items-center justify-center overflow-hidden">
                  {/* Color accent bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: `linear-gradient(90deg, ${template.colors[0]}, ${template.colors[1]})` }}
                  />
                  <div className="text-center">
                    <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                    <p className="text-xs text-zinc-600">Preview</p>
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-zinc-950/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePreview(template); }}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg text-xs font-medium hover:bg-white/20 transition-colors border border-white/10"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1.5" />Preview
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadSample(template); }}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg text-xs font-medium hover:bg-white/20 transition-colors border border-white/10"
                      >
                        <Download className="w-3.5 h-3.5 inline mr-1.5" />Sample
                      </button>
                    </div>
                  </div>
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    {template.isPopular && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-semibold rounded-full border border-amber-500/20">
                        Popular
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-zinc-200 text-sm group-hover:text-emerald-400 transition-colors">{template.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${template.isFree ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-400"}`}>
                      {template.isFree ? "Free" : "Pro"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3 line-clamp-2 leading-relaxed">{template.description}</p>

                    <div className="flex space-x-1">
                      {template.colors.map((color, i) => (
                        <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>


                  {/* Use Template Button (appears on hover) */}
                  <motion.div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/resume/builder?template=${template.id}`}
                      className="w-full flex items-center justify-center py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                      onClick={(e) => { e.stopPropagation(); localStorage.setItem("selectedTemplate", template.id); }}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5" />
                      Use Template
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Template Detail Modal */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedTemplate(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-card rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-100">{selectedTemplate.name}</h2>
                      <p className="text-zinc-500 mt-1 text-sm">{selectedTemplate.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="bg-zinc-800/50 rounded-xl p-8 mb-6 flex items-center justify-center h-48">
                        <FileText className="w-16 h-16 text-zinc-600" />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Features</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedTemplate.features.map((feature, i) => (
                              <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg border border-emerald-500/20">{feature}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Colors</h3>
                          <div className="flex space-x-2">
                            {selectedTemplate.colors.map((color, i) => (
                              <div key={i} className="w-8 h-8 rounded-lg border border-zinc-700" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="p-5 rounded-xl bg-zinc-800/30 border border-zinc-800/60 mb-6">
                        <div className="flex items-center justify-between">

                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedTemplate.isFree ? "bg-emerald-500/15 text-emerald-400" : "bg-violet-500/15 text-violet-400"}`}>
                            {selectedTemplate.isFree ? "Free" : "Pro"}
                          </span>
                          {selectedTemplate.isPopular && (
                            <span className="px-3 py-1 bg-amber-500/15 text-amber-400 rounded-lg text-xs font-semibold">Popular</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Link
                          to={`/resume/builder?template=${selectedTemplate.id}`}
                          className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                          onClick={() => localStorage.setItem("selectedTemplate", selectedTemplate.id)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Use This Template
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePreview(selectedTemplate); }}
                          className="w-full flex items-center justify-center py-3 border border-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm hover:border-zinc-500 hover:text-zinc-100 transition-all"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Full Size
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownloadSample(selectedTemplate); }}
                          className="w-full flex items-center justify-center py-3 border border-zinc-700 text-zinc-300 rounded-xl font-semibold text-sm hover:border-zinc-500 hover:text-zinc-100 transition-all"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Sample
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {previewTemplate && (
          <PreviewModal
            templateId={previewTemplate.id}
            templateName={previewTemplate.name}
            isOpen={!!previewTemplate}
            onClose={() => setPreviewTemplate(null)}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            icon={toast.icon}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Templates;
