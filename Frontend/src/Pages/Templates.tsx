import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Eye, Download, Star } from "lucide-react";
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
  rating: number;
  downloads: number;
  colors: string[];
  features: string[];
}
const Templates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
    icon?: "download" | "preview" | "check";
  } | null>(null);
  const categories = [
    { id: "all", name: "All Templates", count: 15 },
    { id: "executive", name: "Executive", count: 4 },
    { id: "modern", name: "Modern", count: 4 },
    { id: "creative", name: "Creative", count: 3 },
    { id: "minimal", name: "Minimal", count: 2 },
    { id: "ats", name: "ATS Optimized", count: 2 },
  ];
  const templates: Template[] = [
    {
      id: "executive",
      name: "Executive Blue",
      description:
        "Professional and authoritative design for C-suite and senior executives",
      category: "executive",
      preview: "/templates/executive-blue-preview.png",
      isPopular: true,
      isFree: false,
      rating: 4.9,
      downloads: 15800,
      colors: ["#1e40af", "#1e3a8a", "#172554"],
      features: [
        "Leadership Focus",
        "Two-Column Layout",
        "Achievement Highlights",
        "Professional",
      ],
    },
    {
      id: "corporate",
      name: "Corporate Classic",
      description:
        "Timeless design for corporate professionals and business leaders",
      category: "executive",
      preview: "/templates/corporate-classic-preview.png",
      isPopular: true,
      isFree: false,
      rating: 4.8,
      downloads: 14200,
      colors: ["#1f2937", "#111827", "#030712"],
      features: [
        "Professional",
        "Traditional Layout",
        "Results-Oriented",
        "ATS Friendly",
      ],
    },
    {
      id: "modern",
      name: "Modern Professional",
      description:
        "Clean and contemporary design perfect for tech and business roles",
      category: "modern",
      preview: "/templates/modern-professional-preview.png",
      isPopular: true,
      isFree: true,
      rating: 4.8,
      downloads: 22500,
      colors: ["#2563eb", "#1d4ed8", "#1e40af"],
      features: [
        "ATS Optimized",
        "Single Column",
        "Modern Typography",
        "Color Accents",
      ],
    },
    {
      id: "tech",
      name: "Tech Innovator",
      description:
        "Sleek design specifically for technology professionals and developers",
      category: "modern",
      preview: "/templates/tech-innovator-preview.png",
      isPopular: true,
      isFree: false,
      rating: 4.9,
      downloads: 18900,
      colors: ["#7c3aed", "#6d28d9", "#5b21b6"],
      features: [
        "Skills Matrix",
        "Project Showcase",
        "GitHub Integration",
        "Code Samples",
      ],
    },
    {
      id: "creative",
      name: "Creative Vision",
      description: "Modern and artistic design for creative professionals",
      category: "creative",
      preview: "/templates/creative-vision-preview.png",
      isPopular: true,
      isFree: false,
      rating: 4.7,
      downloads: 16700,
      colors: ["#c026d3", "#a21caf", "#86198f"],
      features: [
        "Portfolio Integration",
        "Visual Elements",
        "Creative Layout",
        "Colorful",
      ],
    },
    {
      id: "engineer",
      name: "Design Pro",
      description: "For designers, artists, and creative professionals",
      category: "creative",
      preview: "/templates/design-pro-preview.png",
      isPopular: false,
      isFree: false,
      rating: 4.8,
      downloads: 12300,
      colors: ["#e11d48", "#be123c", "#9f1239"],
      features: [
        "Visual Portfolio",
        "Project Showcase",
        "Skills Visualization",
        "Creative",
      ],
    },
    {
      id: "minimalist",
      name: "Minimalist",
      description: "Clean and elegant design that emphasizes your content",
      category: "minimal",
      preview: "/templates/minimalist-preview.png",
      isPopular: true,
      isFree: true,
      rating: 4.6,
      downloads: 18700,
      colors: ["#4b5563", "#374151", "#1f2937"],
      features: [
        "Clean Layout",
        "Readable Typography",
        "Professional",
        "Timeless",
      ],
    },
    {
      id: "ats",
      name: "ATS Pro",
      description:
        "Optimized for Applicant Tracking Systems with perfect structure",
      category: "ats",
      preview: "/templates/ats-pro-preview.png",
      isPopular: true,
      isFree: true,
      rating: 4.9,
      downloads: 24500,
      colors: ["#0d9488", "#0f766e", "#115e59"],
      features: [
        "ATS Optimized",
        "Single Column",
        "Keyword Rich",
        "High Conversion",
      ],
    },
    {
      id: "classic",
      name: "Career Starter",
      description: "Perfect for entry-level candidates and career changers",
      category: "ats",
      preview: "/templates/career-starter-preview.png",
      isPopular: false,
      isFree: true,
      rating: 4.7,
      downloads: 17800,
      colors: ["#0ea5e9", "#0284c7", "#0369a1"],
      features: [
        "ATS Friendly",
        "Skills-Based",
        "Education Focus",
        "Internship Ready",
      ],
    },
    {
      id: "ind-1",
      name: "Healthcare Pro",
      description:
        "Professional template for healthcare and medical professionals",
      category: "executive",
      preview: "/templates/healthcare-pro-preview.png",
      isPopular: false,
      isFree: false,
      rating: 4.8,
      downloads: 12600,
      colors: ["#0d9488", "#0f766e", "#115e59"],
      features: [
        "Certification Focus",
        "Clinical Experience",
        "Patient Care",
        "Professional",
      ],
    },
    {
      id: "ind-2",
      name: "Sales Champion",
      description: "Highlight your sales achievements and metrics effectively",
      category: "modern",
      preview: "/templates/sales-champion-preview.png",
      isPopular: false,
      isFree: false,
      rating: 4.7,
      downloads: 9800,
      colors: ["#b91c1c", "#991b1b", "#7f1d1d"],
      features: [
        "Metrics Focus",
        "Achievement Driven",
        "Results Oriented",
        "Client Success",
      ],
    },
    {
      id: "ind-3",
      name: "Academic Scholar",
      description:
        "Formal template perfect for academic and research positions",
      category: "executive",
      preview: "/templates/academic-scholar-preview.png",
      isPopular: false,
      isFree: true,
      rating: 4.6,
      downloads: 8700,
      colors: ["#4b5563", "#374151", "#1f2937"],
      features: [
        "Publication List",
        "Research Focus",
        "Academic Format",
        "Citations",
      ],
    },
    {
      id: "ind-4",
      name: "Tech Leader",
      description:
        "For senior technology professionals and engineering managers",
      category: "executive",
      preview: "/templates/tech-leader-preview.png",
      isPopular: true,
      isFree: false,
      rating: 4.9,
      downloads: 15400,
      colors: ["#7c3aed", "#6d28d9", "#5b21b6"],
      features: [
        "Leadership Focus",
        "Technical Depth",
        "Team Management",
        "Project Highlights",
      ],
    },
  ];
  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((template) => template.category === selectedCategory);

  const handleDownloadSample = async (template: Template) => {
    try {
      // Generate sample data for the template
      const sampleData = {
        templateId: template.id,
        templateName: template.name,
        sampleContent: `Sample resume data for ${template.name} template`,
        features: template.features,
        colors: template.colors,
        timestamp: new Date().toISOString(),
      };

      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(sampleData, null, 2)], {
        type: "application/json",
      });
      element.href = URL.createObjectURL(file);
      element.download = `${template.name.replace(/\s+/g, "_")}_Sample.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setToast({
        message: `${template.name} sample downloaded successfully!`,
        type: "success",
        icon: "download",
      });
    } catch (error) {
      console.error("Error downloading sample:", error);
      setToast({
        message: "Failed to download sample. Please try again.",
        type: "error",
      });
    }
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setToast({
      message: `Previewing ${template.name} template`,
      type: "info",
      icon: "preview",
    });
  };

  const TemplateModal = () => {
    if (!selectedTemplate) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedTemplate.name}
                </h2>
                <p className="text-gray-600 mt-2">
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="text-center text-gray-500">
                    <FileText className="w-24 h-24 mx-auto mb-4" />
                    <p>Template Preview</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Features
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Color Scheme
                    </h3>
                    <div className="flex space-x-2">
                      {selectedTemplate.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">
                        {selectedTemplate.rating}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Download className="w-4 h-4 mr-1" />
                      {selectedTemplate.downloads.toLocaleString()} downloads
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedTemplate.isFree
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {selectedTemplate.isFree ? "Free" : "Pro"}
                    </span>
                    {selectedTemplate.isPopular && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    to={`/resume/builder?template=${selectedTemplate.id}`}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    onClick={() => {
                      localStorage.setItem(
                        "selectedTemplate",
                        selectedTemplate.id
                      );
                    }}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Use This Template
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(selectedTemplate);
                    }}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    Preview Full Size
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSample(selectedTemplate);
                    }}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Sample
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
        <p className="text-gray-600 mt-2">
          Choose from professionally designed templates to create your perfect
          resume
        </p>
      </div>
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
            onClick={() => setSelectedTemplate(template)}
          >
            <div className="p-4">
              <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-gray-200 transition-colors">
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Preview</p>
                </div>

                {/* Quick Action Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(template);
                      }}
                      className="bg-white text-gray-800 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors flex items-center text-sm font-medium shadow-lg"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSample(template);
                      }}
                      className="bg-white text-gray-800 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors flex items-center text-sm font-medium shadow-lg"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Sample
                    </button>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">
                    {template.name}
                  </h3>
                  {template.isPopular && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-gray-600">{template.rating}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Download className="w-3 h-3 mr-1" />
                    <span className="text-xs">
                      {(template.downloads / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    template.isFree
                      ? "bg-green-100 text-green-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {template.isFree ? "Free" : "Pro"}
                </span>
              </div>
              <div className="space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/resume/builder?template=${template.id}`}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.setItem("selectedTemplate", template.id);
                  }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Use Template
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(template);
                    }}
                    className="bg-gray-600 text-white py-1.5 px-2 rounded text-xs hover:bg-gray-700 flex items-center justify-center"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSample(template);
                    }}
                    className="border border-gray-300 text-gray-700 py-1.5 px-2 rounded text-xs hover:bg-gray-50 flex items-center justify-center"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Sample
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {}
      <TemplateModal />

      {/* Preview Modal */}
      {previewTemplate && (
        <PreviewModal
          templateId={previewTemplate.id}
          templateName={previewTemplate.name}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          icon={toast.icon}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
export default Templates;
