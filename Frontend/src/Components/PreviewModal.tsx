import React, { useRef } from "react";
import { X, Download } from "lucide-react";
import { generateSampleResumeData } from "../utils/sampleResumeData";
import {
  ModernTemplate,
  ExecutiveTemplate,
  CreativeTemplate,
  MinimalistTemplate,
  ATSTemplate,
  TechTemplate,
  ClassicTemplate,
  CorporateTemplate,
  EngineerTemplate,
  GraduateTemplate,
} from "./resume/templates";
import type { ResumeData } from "../types/resume";

interface PreviewModalProps {
  templateId: string;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  templateId,
  templateName,
  isOpen,
  onClose,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const sampleData: ResumeData = {
    ...generateSampleResumeData(),
    template: templateId,
  };

  const renderTemplate = () => {
    switch (templateId) {
      case "modern":
        return <ModernTemplate data={sampleData} ref={previewRef} />;
      case "executive":
        return <ExecutiveTemplate data={sampleData} ref={previewRef} />;
      case "creative":
        return <CreativeTemplate data={sampleData} ref={previewRef} />;
      case "minimalist":
        return <MinimalistTemplate data={sampleData} ref={previewRef} />;
      case "ats":
        return <ATSTemplate data={sampleData} ref={previewRef} />;
      case "tech":
        return <TechTemplate data={sampleData} ref={previewRef} />;
      case "classic":
        return <ClassicTemplate data={sampleData} ref={previewRef} />;
      case "corporate":
        return <CorporateTemplate data={sampleData} ref={previewRef} />;
      case "engineer":
        return <EngineerTemplate data={sampleData} ref={previewRef} />;
      case "graduate":
        return <GraduateTemplate data={sampleData} ref={previewRef} />;
      // Fallback cases for templates that don't have components yet
      case "ind-1":
      case "ind-2":
      case "ind-3":
      case "ind-4":
        return <ModernTemplate data={sampleData} ref={previewRef} />;
      default:
        return <ModernTemplate data={sampleData} ref={previewRef} />;
    }
  };

  const handleDownloadSample = async () => {
    try {
      // TODO: In a production app, this would call your PDF generation API
      // For now, we'll simulate a PDF download with sample data

      // Create a more comprehensive sample file
      const sampleContent = {
        templateId,
        templateName,
        sampleData,
        instructions:
          "This is sample data for preview purposes. Use the Resume Builder to create your own resume with this template.",
        downloadDate: new Date().toISOString(),
        features: {
          preview: "Full template preview with sample data",
          customization: "Fully customizable with your personal information",
          pdfExport: "Professional PDF export available",
          atsOptimized: "Applicant Tracking System compatible",
        },
      };

      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(sampleContent, null, 2)], {
        type: "application/json",
      });
      element.href = URL.createObjectURL(file);
      element.download = `${templateName.replace(
        /\s+/g,
        "_"
      )}_Sample_Data.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      // Show success message with more context
      const message = `Sample data for "${templateName}" template downloaded successfully!\n\nThis file contains sample resume data that you can use as a reference. To create your own resume with this template, click "Use This Template" button.`;
      alert(message);
    } catch (error) {
      console.error("Error downloading sample:", error);
      alert("Failed to download sample. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {templateName} - Preview
            </h2>
            <p className="text-gray-600 mt-1">
              Preview with sample data - customize with your own information
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadSample}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
            <div className="transform scale-75 md:scale-90 origin-top transition-transform duration-300">
              {renderTemplate()}
            </div>
          </div>

          {/* Preview Instructions */}
          <div className="max-w-4xl mx-auto mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Preview Information
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  This preview shows how the template looks with sample data.
                  You can customize all content, colors, and sections when you
                  create your own resume.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              This is a preview with sample data. Your actual resume will use
              your personal information.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadSample}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Sample Data
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
