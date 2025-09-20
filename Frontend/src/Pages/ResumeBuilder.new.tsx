import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ResumeApi } from "../services/resumeApi";
import { v4 as uuidv4 } from "uuid";
import {
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  X,
  Download,
  Save,
} from "lucide-react";
import ModernTemplate from "../Components/resume/templates/ModernTemplate";
import type {
  ResumeData,
  Experience,
  Education,
  Skill,
  Project,
  PersonalInfo,
  Certification,
  Award,
  Language,
  Publication,
  VolunteerExperience,
  Reference,
} from "../types/resume";
type AuthExperience = {
  id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
};
type AuthEducation = {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  description?: string;
};
type AuthSkill = {
  id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
};
type AuthProject = {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
};
type SocialLinks = {
  linkedin?: string;
  github?: string;
  twitter?: string;
};
type UserProfile = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  website?: string;
  socialLinks?: SocialLinks;
};
const ResumeBuilder: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [showPreview, setShowPreview] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>("personal");
  const previewRef = useRef<HTMLDivElement>(null);
  interface AuthUser {
    email?: string;
    profile?: UserProfile;
  }
  interface AuthContextType {
    user: AuthUser | null;
  }
  const { user } = useAuth() as AuthContextType;
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const profile = user?.profile || ({} as UserProfile);
    const socialLinks = profile?.socialLinks || ({} as SocialLinks);
    return {
      title: "My Resume",
      personalInfo: {
        fullName:
          profile?.fullName ||
          `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
          "",
        email: user?.email || "",
        phone: "",
        location: "",
        linkedin: socialLinks?.linkedin || "",
        website: profile?.website || "",
        github: socialLinks?.github || "",
        twitter: socialLinks?.twitter || "",
        headline: "",
        photo: "",
      },
      summary: "",
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      awards: [],
      languages: [],
      publications: [],
      volunteerExperience: [],
      references: [],
      template: "modern",
      lastUpdated: new Date(),
    };
  });
  useEffect(() => {
    const loadResume = async () => {
      try {
        setIsLoading(true);
        const data = await ResumeApi.getResume();
        if (data) {
          const apiData = data as unknown as {
            title?: string;
            personalInfo: PersonalInfo;
            summary: string;
            experiences: AuthExperience[];
            education: AuthEducation[];
            skills: AuthSkill[];
            projects: AuthProject[];
            template: string;
          };
          const normalizedData: ResumeData = {
            title: apiData.title || "My Resume",
            personalInfo: {
              fullName: apiData.personalInfo?.fullName || "",
              email: apiData.personalInfo?.email || "",
              phone: apiData.personalInfo?.phone || "",
              location: apiData.personalInfo?.location || "",
              linkedin: apiData.personalInfo?.linkedin || "",
              website: apiData.personalInfo?.website || "",
              github: apiData.personalInfo?.github,
              twitter: apiData.personalInfo?.twitter,
              headline: apiData.personalInfo?.headline,
              photo: apiData.personalInfo?.photo,
            },
            summary: apiData.summary || "",
            experiences: (apiData.experiences || []).map((exp) => ({
              id: exp.id || uuidv4(),
              company: exp.company || "",
              title: exp.position || "",
              location: exp.location || "",
              startDate:
                exp.startDate || new Date().toISOString().split("T")[0],
              endDate: exp.endDate || "",
              current: exp.current || false,
              description: exp.description || [],
            })),
            education: (apiData.education || []).map((edu) => ({
              id: edu.id || uuidv4(),
              institution: edu.institution || "",
              degree: edu.degree || "",
              field: edu.field || "",
              location: edu.location || "",
              startDate:
                edu.startDate || new Date().toISOString().split("T")[0],
              endDate: edu.endDate || "",
              current: edu.current || false,
              gpa: edu.gpa,
              description: edu.description,
            })),
            skills: (apiData.skills || []).map((skill) => ({
              id: skill.id || uuidv4(),
              name: skill.name || "",
              level: skill.level || "Beginner",
              category: skill.category || "",
            })),
            projects: (apiData.projects || []).map((project) => ({
              id: project.id || uuidv4(),
              name: project.name || "",
              description: project.description || "",
              technologies: project.technologies || [],
              startDate:
                project.startDate || new Date().toISOString().split("T")[0],
              endDate: project.endDate,
            })),
            certifications: [],
            awards: [],
            languages: [],
            publications: [],
            volunteerExperience: [],
            references: [],
            template: apiData.template || "modern",
          };
          setResumeData(normalizedData);
        }
      } catch (error) {
        console.error("Error loading resume:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResume();
  }, []);
  const ResumePreview = () => {
    switch (resumeData.template) {
      case "modern":
        return <ModernTemplate data={resumeData} />;
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p>Select a template to see a preview.</p>
          </div>
        );
    }
  };
  const addExperience = () => {
    const newExp: Experience = {
      id: uuidv4(),
      company: "",
      title: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      current: false,
      description: [""],
    };
    setResumeData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newExp],
    }));
  };
  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  };
  const updateExperience = (id: string, updates: Partial<Experience>) => {
    setResumeData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    }));
  };
  const addEducation = () => {
    const newEdu: Education = {
      id: uuidv4(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      current: false,
      gpa: "",
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };
  const updateEducation = (id: string, updates: Partial<Education>) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    }));
  };
  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };
  const addSkill = () => {
    const newSkill: Skill = {
      id: uuidv4(),
      name: "",
      level: "Intermediate",
      category: "Technical",
    };
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  };
  const updateSkill = (
    id: string,
    updates: Partial<Omit<Skill, "level">> & {
      level?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    }
  ) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill) =>
        skill.id === id ? { ...skill, ...updates } : skill
      ),
    }));
  };
  const removeSkill = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill.id !== id),
    }));
  };
  const addProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      name: "",
      description: "",
      technologies: [],
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };
  const updateProject = (id: string, updates: Partial<Project>) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) =>
        proj.id === id ? { ...proj, ...updates } : proj
      ),
    }));
  };
  const removeProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }));
  };
  const addCertification = () => {
    const newCertification: Certification = {
      id: uuidv4(),
      name: "",
      issuer: "",
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    };
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCertification],
    }));
  };
  const updateCertification = (id: string, updates: Partial<Certification>) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) =>
        cert.id === id ? { ...cert, ...updates } : cert
      ),
    }));
  };
  const removeCertification = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }));
  };
  const addAward = () => {
    const newAward: Award = {
      id: uuidv4(),
      title: "",
      issuer: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      awards: [...prev.awards, newAward],
    }));
  };
  const updateAward = (id: string, updates: Partial<Award>) => {
    setResumeData((prev) => ({
      ...prev,
      awards: prev.awards.map((award) =>
        award.id === id ? { ...award, ...updates } : award
      ),
    }));
  };
  const removeAward = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      awards: prev.awards.filter((award) => award.id !== id),
    }));
  };
  const addLanguage = () => {
    const newLanguage: Language = {
      id: uuidv4(),
      name: "",
      proficiency: "Basic",
    };
    setResumeData((prev) => ({
      ...prev,
      languages: [...prev.languages, newLanguage],
    }));
  };
  const updateLanguage = (id: string, updates: Partial<Language>) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang) =>
        lang.id === id ? { ...lang, ...updates } : lang
      ),
    }));
  };
  const removeLanguage = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang.id !== id),
    }));
  };
  const addPublication = () => {
    const newPublication: Publication = {
      id: uuidv4(),
      title: "",
      publisher: "",
      publishDate: new Date().toISOString().split("T")[0],
      url: "",
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      publications: [...prev.publications, newPublication],
    }));
  };
  const updatePublication = (id: string, updates: Partial<Publication>) => {
    setResumeData((prev) => ({
      ...prev,
      publications: prev.publications.map((pub) =>
        pub.id === id ? { ...pub, ...updates } : pub
      ),
    }));
  };
  const removePublication = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      publications: prev.publications.filter((pub) => pub.id !== id),
    }));
  };
  const addVolunteerExperience = () => {
    const newVolunteer: VolunteerExperience = {
      id: uuidv4(),
      organization: "",
      role: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      current: false,
      description: [""],
    };
    setResumeData((prev) => ({
      ...prev,
      volunteerExperience: [...prev.volunteerExperience, newVolunteer],
    }));
  };
  const updateVolunteerExperience = (
    id: string,
    updates: Partial<VolunteerExperience>
  ) => {
    setResumeData((prev) => ({
      ...prev,
      volunteerExperience: prev.volunteerExperience.map((vol) =>
        vol.id === id ? { ...vol, ...updates } : vol
      ),
    }));
  };
  const removeVolunteerExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      volunteerExperience: prev.volunteerExperience.filter(
        (vol) => vol.id !== id
      ),
    }));
  };
  const addReference = () => {
    const newReference: Reference = {
      id: uuidv4(),
      name: "",
      title: "",
      company: "",
      email: "",
      phone: "",
      relationship: "",
    };
    setResumeData((prev) => ({
      ...prev,
      references: [...prev.references, newReference],
    }));
  };
  const updateReference = (id: string, updates: Partial<Reference>) => {
    setResumeData((prev) => ({
      ...prev,
      references: prev.references.map((ref) =>
        ref.id === id ? { ...ref, ...updates } : ref
      ),
    }));
  };
  const removeReference = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      references: prev.references.filter((ref) => ref.id !== id),
    }));
  };
  const handleDownloadPDF = useCallback(async () => {
    if (!resumeData.personalInfo?.fullName?.trim()) {
      alert("Please enter your full name before downloading.");
      return;
    }
    if (!user) {
      alert("Please log in to download your resume.");
      return;
    }
    if (!resumeData.personalInfo?.email?.trim()) {
      alert("Please enter your email address before downloading.");
      return;
    }
    if (!resumeData.personalInfo?.phone?.trim()) {
      alert("Please enter your phone number before downloading.");
      return;
    }
    if (!resumeData.personalInfo?.location?.trim()) {
      alert("Please enter your location before downloading.");
      return;
    }
    try {
      setIsDownloading(true);
      setSaveStatus("saving");
      const resumeToSave = {
        title:
          resumeData.title ||
          (resumeData.personalInfo?.fullName
            ? `${resumeData.personalInfo.fullName}'s Resume`
            : "My Resume"),
        personalInfo: resumeData.personalInfo,
        summary: resumeData.summary,
        experiences: resumeData.experiences.map((exp) => ({
          id: exp.id,
          company: exp.company,
          position: exp.title,
          location: exp.location || "",
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description,
        })),
        education: resumeData.education.map((edu) => ({
          ...edu,
          location: edu.location || "",
        })),
        skills: resumeData.skills.map((skill) => ({
          ...skill,
        })),
        projects: resumeData.projects.map((project) => ({
          ...project,
        })),
        template: resumeData.template || "modern",
      };
      const urlParams = new URLSearchParams(window.location.search);
      const resumeId = urlParams.get("resumeId");
      let targetResumeId = resumeId;
      if (resumeId) {
        console.log("🔍 Updating existing resume:", resumeId);
        await ResumeApi.updateResume(resumeToSave);
        targetResumeId = resumeId;
      } else {
        console.log("🔍 Creating new resume with data:", resumeToSave);
        const result = await ResumeApi.createResume(resumeToSave);
        console.log("🔍 Create resume result:", result);
        if (result && (result as any)._id) {
          targetResumeId = (result as any)._id;
        } else if (result && (result as any).id) {
          targetResumeId = (result as any).id;
        } else {
          console.error("❌ Invalid resume creation result:", result);
          throw new Error("Failed to create resume - no ID returned");
        }
      }
      const filename = `${resumeData.personalInfo.fullName
        .trim()
        .replace(/[^a-zA-Z0-9]/g, "_")}_Resume.pdf`;
      if (targetResumeId) {
        console.log(
          "🔍 Attempting PDF download with resume ID:",
          targetResumeId
        );
        console.log("🔍 Resume data for PDF:", resumeToSave);
        await ResumeApi.exportResume(targetResumeId, filename);
      } else {
        throw new Error("Failed to get resume ID for export");
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error in handleDownloadPDF:", error);
      setSaveStatus("error");
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }, [resumeData, user]);
  const handleSaveResume = useCallback(async () => {
    if (!user) {
      alert("Please log in to save your resume.");
      return;
    }
    try {
      setSaveStatus("saving");
      const resumeToSave = {
        title:
          resumeData.title ||
          (resumeData.personalInfo?.fullName
            ? `${resumeData.personalInfo.fullName}'s Resume`
            : "My Resume"),
        personalInfo: resumeData.personalInfo,
        summary: resumeData.summary,
        experiences: resumeData.experiences.map((exp) => ({
          id: exp.id,
          company: exp.company,
          position: exp.title,
          location: exp.location || "",
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description,
        })),
        education: resumeData.education.map((edu) => ({
          ...edu,
          location: edu.location || "",
        })),
        skills: resumeData.skills.map((skill) => ({
          ...skill,
        })),
        projects: resumeData.projects.map((project) => ({
          ...project,
        })),
        template: resumeData.template || "modern",
      };
      const urlParams = new URLSearchParams(window.location.search);
      const resumeId = urlParams.get("resumeId");
      if (resumeId) {
        await ResumeApi.updateResume(resumeToSave);
      } else {
        await ResumeApi.createResume(resumeToSave);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving resume:", error);
      setSaveStatus("error");
      alert("Failed to save resume. Please try again.");
    }
  }, [resumeData, user]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </button>
              <button
                onClick={handleSaveResume}
                disabled={saveStatus === "saving"}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {saveStatus === "saving" ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saveStatus === "saving" ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isDownloading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>
          {}
          <div className="mt-2 flex justify-end">
            {saveStatus === "saving" && (
              <div className="inline-flex items-center text-sm text-gray-600">
                <Loader2 className="animate-spin h-3 w-3 mr-1" />
                Auto-saving...
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="inline-flex items-center text-sm text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                All changes saved
              </div>
            )}
            {saveStatus === "error" && (
              <div className="inline-flex items-center text-sm text-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Failed to save changes
              </div>
            )}
            {saveStatus === "idle" && (
              <div className="inline-flex items-center text-sm text-gray-400">
                <CheckCircle className="h-3 w-3 mr-1" />
                All changes saved
              </div>
            )}
          </div>
        </div>
      </div>
      {}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-md">
            <label
              htmlFor="resume-title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Resume Title
            </label>
            <input
              id="resume-title"
              type="text"
              value={resumeData.title || ""}
              onChange={(e) =>
                setResumeData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="My Resume"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {saveStatus === "saved" && (
            <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Resume saved successfully!
            </div>
          )}
          {saveStatus === "error" && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              An error occurred. Please try again.
            </div>
          )}
          <div
            className={`grid ${
              showPreview ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
            } gap-8`}
          >
            <div className={showPreview ? "lg:col-span-2" : "col-span-1"}>
              {}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-6">Resume Sections</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <button
                    onClick={() => setActiveSection("personal")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "personal"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Personal Info
                  </button>
                  <button
                    onClick={() => setActiveSection("summary")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "summary"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Summary
                  </button>
                  <button
                    onClick={() => setActiveSection("experience")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "experience"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Experience
                  </button>
                  <button
                    onClick={() => setActiveSection("education")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "education"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Education
                  </button>
                  <button
                    onClick={() => setActiveSection("skills")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "skills"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Skills
                  </button>
                  <button
                    onClick={() => setActiveSection("projects")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "projects"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => setActiveSection("certifications")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "certifications"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Certifications
                  </button>
                  <button
                    onClick={() => setActiveSection("awards")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "awards"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Awards
                  </button>
                  <button
                    onClick={() => setActiveSection("languages")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "languages"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Languages
                  </button>
                  <button
                    onClick={() => setActiveSection("publications")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "publications"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Publications
                  </button>
                  <button
                    onClick={() => setActiveSection("volunteer")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "volunteer"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Volunteer
                  </button>
                  <button
                    onClick={() => setActiveSection("references")}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === "references"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    References
                  </button>
                </div>
              </div>
            </div>
            {showPreview && (
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">
                      Resume Preview
                    </h2>
                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      <div
                        id="resume-preview"
                        ref={previewRef}
                        className="p-6 bg-white"
                        style={{ width: "100%", minHeight: "800px" }}
                      >
                        <ModernTemplate data={resumeData} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {saveStatus === "saved" && (
              <span className="text-green-500 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Saved at {new Date().toLocaleTimeString()}
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error saving changes
              </span>
            )}
          </div>
          {activeSection === "personal" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          fullName: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          email: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          phone: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          location: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.headline || ""}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          headline: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      linkedin.com/in/
                    </span>
                    <input
                      type="text"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            linkedin: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.website}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          website: e.target.value,
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      github.com/
                    </span>
                    <input
                      type="text"
                      value={resumeData.personalInfo.github || ""}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            github: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      twitter.com/
                    </span>
                    <input
                      type="text"
                      value={resumeData.personalInfo.twitter || ""}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            twitter: e.target.value,
                          },
                        }))
                      }
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Summary
                </label>
                <textarea
                  value={resumeData.summary}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Write a brief professional summary highlighting your key skills and experience..."
                />
              </div>
            </div>
          )}
          {activeSection === "summary" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">
                Professional Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Summary
                  </label>
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) =>
                      setResumeData((prev) => ({
                        ...prev,
                        summary: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="Write a brief professional summary highlighting your key skills, experience, and career objectives. This should be 2-4 sentences that give employers a quick overview of what you bring to the table..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tip: Focus on your most relevant skills and achievements
                    that match the job you're applying for.
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeSection === "experience" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Work Experience</h2>
                <button
                  onClick={addExperience}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </button>
              </div>
              {resumeData.experiences.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No experience added
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your work experience to get started.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={addExperience}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Add Experience
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumeData.experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Experience
                        </h3>
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="text-red-600 hover:text-red-800"
                          type="button"
                          title="Remove experience"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title
                          </label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) =>
                              updateExperience(exp.id, {
                                title: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Senior Developer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) =>
                              updateExperience(exp.id, {
                                company: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) =>
                              updateExperience(exp.id, {
                                location: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., San Francisco, CA"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) =>
                                updateExperience(exp.id, {
                                  startDate: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) =>
                                updateExperience(exp.id, {
                                  endDate: e.target.value,
                                })
                              }
                              disabled={exp.current}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                exp.current ? "bg-gray-100" : ""
                              }`}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => {
                                updateExperience(exp.id, {
                                  current: e.target.checked,
                                  endDate: e.target.checked ? "" : exp.endDate,
                                });
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            Currently working here
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Description
                        </label>
                        <textarea
                          value={exp.description.join("\n")}
                          onChange={(e) => {
                            const descriptions = e.target.value
                              .split("\n")
                              .filter((desc) => desc.trim() !== "");
                            updateExperience(exp.id, {
                              description:
                                descriptions.length > 0 ? descriptions : [""],
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="• Describe your key responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Focus on quantifiable results when possible"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "education" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Education</h2>
                <button
                  onClick={addEducation}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </button>
              </div>
              {resumeData.education.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No education added
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your education history to get started.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={addEducation}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Add Education
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumeData.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Education
                        </h3>
                        <button
                          onClick={() => removeEducation(edu.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove education"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institution
                          </label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) =>
                              updateEducation(edu.id, {
                                institution: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="University Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) =>
                              updateEducation(edu.id, {
                                degree: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Bachelor of Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) =>
                              updateEducation(edu.id, { field: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) =>
                              updateEducation(edu.id, {
                                location: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., City, Country"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={edu.startDate}
                            onChange={(e) =>
                              updateEducation(edu.id, {
                                startDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={edu.endDate}
                            onChange={(e) =>
                              updateEducation(edu.id, {
                                endDate: e.target.value,
                              })
                            }
                            disabled={edu.current}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              edu.current ? "bg-gray-100" : ""
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            GPA (Optional)
                          </label>
                          <input
                            type="text"
                            value={edu.gpa || ""}
                            onChange={(e) =>
                              updateEducation(edu.id, { gpa: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 3.8/4.0"
                          />
                        </div>
                        <div>
                          <label className="flex items-center text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={edu.current}
                              onChange={(e) => {
                                updateEducation(edu.id, {
                                  current: e.target.checked,
                                  endDate: e.target.checked ? "" : edu.endDate,
                                });
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            Currently Enrolled
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={edu.description || ""}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Relevant coursework, achievements, or activities"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "skills" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Skills</h2>
                <button
                  onClick={addSkill}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </button>
              </div>
              {resumeData.skills.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <Code className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No skills added
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your skills to showcase your expertise.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={addSkill}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Add Skill
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumeData.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Skill
                        </h3>
                        <button
                          onClick={() => removeSkill(skill.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove skill"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skill Name
                          </label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill(skill.id, { name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., JavaScript, Python, Project Management"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            value={skill.category}
                            onChange={(e) =>
                              updateSkill(skill.id, {
                                category: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Technical">Technical</option>
                            <option value="Soft">Soft Skills</option>
                            <option value="Language">Languages</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proficiency Level
                          </label>
                          <div className="mt-2">
                            <div className="flex space-x-4">
                              {(
                                [
                                  "Beginner",
                                  "Intermediate",
                                  "Advanced",
                                  "Expert",
                                ] as const
                              ).map((level) => (
                                <label
                                  key={level}
                                  className="inline-flex items-center"
                                >
                                  <input
                                    type="radio"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    checked={skill.level === level}
                                    onChange={() =>
                                      updateSkill(skill.id, { level })
                                    }
                                  />
                                  <span className="ml-2 text-sm text-gray-700">
                                    {level}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "projects" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Projects</h2>
                <button
                  onClick={addProject}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </button>
              </div>
              {resumeData.projects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No projects added
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your projects to showcase your work.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={addProject}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="-ml-1 mr-2 h-4 w-4" />
                      Add Project
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumeData.projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white rounded-lg shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Project
                        </h3>
                        <button
                          onClick={() => removeProject(project.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove project"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                          </label>
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) =>
                              updateProject(project.id, {
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Project Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={project.url || ""}
                            onChange={(e) =>
                              updateProject(project.id, { url: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/project"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            GitHub URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={project.github || ""}
                            onChange={(e) =>
                              updateProject(project.id, {
                                github: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={project.startDate}
                            onChange={(e) =>
                              updateProject(project.id, {
                                startDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date (Leave empty if ongoing)
                          </label>
                          <input
                            type="date"
                            value={project.endDate || ""}
                            onChange={(e) =>
                              updateProject(project.id, {
                                endDate: e.target.value || undefined,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) =>
                            updateProject(project.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Describe the project, your role, and key achievements"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Technologies Used (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={project.technologies.join(", ")}
                          onChange={(e) => {
                            const techs = e.target.value
                              .split(",")
                              .map((t) => t.trim())
                              .filter(Boolean);
                            updateProject(project.id, { technologies: techs });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., React, Node.js, MongoDB"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "certifications" && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Certifications</h2>
                <button
                  onClick={addCertification}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </button>
              </div>
              {resumeData.certifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No certifications added yet. Click "Add Certification" to get
                  started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Certification
                        </h3>
                        <button
                          onClick={() => removeCertification(cert.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove certification"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Certification Name
                          </label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) =>
                              updateCertification(cert.id, {
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="AWS Certified Solutions Architect"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issuer
                          </label>
                          <input
                            type="text"
                            value={cert.issuer}
                            onChange={(e) =>
                              updateCertification(cert.id, {
                                issuer: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Amazon Web Services"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Date
                          </label>
                          <input
                            type="date"
                            value={cert.issueDate}
                            onChange={(e) =>
                              updateCertification(cert.id, {
                                issueDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={cert.expiryDate || ""}
                            onChange={(e) =>
                              updateCertification(cert.id, {
                                expiryDate: e.target.value || undefined,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Credential ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={cert.credentialId || ""}
                            onChange={(e) =>
                              updateCertification(cert.id, {
                                credentialId: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ABC123456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Credential URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={cert.credentialUrl || ""}
                            onChange={(e) =>
                              updateCertification(cert.id, {
                                credentialUrl: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://verify.certification.com"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "awards" && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Awards & Honors</h2>
                <button
                  onClick={addAward}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Award
                </button>
              </div>
              {resumeData.awards.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No awards added yet. Click "Add Award" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.awards.map((award) => (
                    <div
                      key={award.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Award
                        </h3>
                        <button
                          onClick={() => removeAward(award.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove award"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Award Title
                          </label>
                          <input
                            type="text"
                            value={award.title}
                            onChange={(e) =>
                              updateAward(award.id, { title: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Employee of the Year"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Issuer/Organization
                          </label>
                          <input
                            type="text"
                            value={award.issuer}
                            onChange={(e) =>
                              updateAward(award.id, { issuer: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date Received
                          </label>
                          <input
                            type="date"
                            value={award.date}
                            onChange={(e) =>
                              updateAward(award.id, { date: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={award.description || ""}
                          onChange={(e) =>
                            updateAward(award.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Brief description of the award and achievement"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "languages" && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Languages</h2>
                <button
                  onClick={addLanguage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Language
                </button>
              </div>
              {resumeData.languages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No languages added yet. Click "Add Language" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.languages.map((language) => (
                    <div
                      key={language.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Language
                        </h3>
                        <button
                          onClick={() => removeLanguage(language.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove language"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language Name
                          </label>
                          <input
                            type="text"
                            value={language.name}
                            onChange={(e) =>
                              updateLanguage(language.id, {
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Spanish"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proficiency Level
                          </label>
                          <select
                            value={language.proficiency}
                            onChange={(e) =>
                              updateLanguage(language.id, {
                                proficiency: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Basic">Basic</option>
                            <option value="Conversational">
                              Conversational
                            </option>
                            <option value="Fluent">Fluent</option>
                            <option value="Native">Native</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "publications" && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Publications</h2>
                <button
                  onClick={addPublication}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Publication
                </button>
              </div>
              {resumeData.publications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No publications added yet. Click "Add Publication" to get
                  started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.publications.map((publication) => (
                    <div
                      key={publication.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Publication
                        </h3>
                        <button
                          onClick={() => removePublication(publication.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove publication"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Publication Title
                          </label>
                          <input
                            type="text"
                            value={publication.title}
                            onChange={(e) =>
                              updatePublication(publication.id, {
                                title: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Research Paper Title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Publisher/Journal
                          </label>
                          <input
                            type="text"
                            value={publication.publisher}
                            onChange={(e) =>
                              updatePublication(publication.id, {
                                publisher: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Journal Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Publish Date
                          </label>
                          <input
                            type="date"
                            value={publication.publishDate}
                            onChange={(e) =>
                              updatePublication(publication.id, {
                                publishDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={publication.url || ""}
                            onChange={(e) =>
                              updatePublication(publication.id, {
                                url: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://journal.com/article"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description/Abstract (Optional)
                        </label>
                        <textarea
                          value={publication.description || ""}
                          onChange={(e) =>
                            updatePublication(publication.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Brief description or abstract of the publication"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "volunteer" && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Volunteer Experience</h2>
                <button
                  onClick={addVolunteerExperience}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Volunteer Experience
                </button>
              </div>
              {resumeData.volunteerExperience.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No volunteer experience added yet. Click "Add Volunteer
                  Experience" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.volunteerExperience.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Volunteer Experience
                        </h3>
                        <button
                          onClick={() =>
                            removeVolunteerExperience(volunteer.id)
                          }
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove volunteer experience"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Organization
                          </label>
                          <input
                            type="text"
                            value={volunteer.organization}
                            onChange={(e) =>
                              updateVolunteerExperience(volunteer.id, {
                                organization: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Red Cross"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role/Position
                          </label>
                          <input
                            type="text"
                            value={volunteer.role}
                            onChange={(e) =>
                              updateVolunteerExperience(volunteer.id, {
                                role: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Volunteer Coordinator"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={volunteer.startDate}
                            onChange={(e) =>
                              updateVolunteerExperience(volunteer.id, {
                                startDate: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={volunteer.endDate || ""}
                            onChange={(e) =>
                              updateVolunteerExperience(volunteer.id, {
                                endDate: e.target.value || undefined,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={volunteer.current}
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={volunteer.current}
                            onChange={(e) => {
                              updateVolunteerExperience(volunteer.id, {
                                current: e.target.checked,
                                endDate: e.target.checked
                                  ? undefined
                                  : volunteer.endDate,
                              });
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            Currently volunteering here
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={volunteer.description[0] || ""}
                          onChange={(e) =>
                            updateVolunteerExperience(volunteer.id, {
                              description: [e.target.value],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          placeholder="Describe your volunteer work and achievements"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {}
          {activeSection === "references" && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">References</h2>
                <button
                  onClick={addReference}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reference
                </button>
              </div>
              {resumeData.references.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No references added yet. Click "Add Reference" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.references.map((reference) => (
                    <div
                      key={reference.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Reference
                        </h3>
                        <button
                          onClick={() => removeReference(reference.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Remove reference"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={reference.name}
                            onChange={(e) =>
                              updateReference(reference.id, {
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title
                          </label>
                          <input
                            type="text"
                            value={reference.title}
                            onChange={(e) =>
                              updateReference(reference.id, {
                                title: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Senior Manager"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                          </label>
                          <input
                            type="text"
                            value={reference.company}
                            onChange={(e) =>
                              updateReference(reference.id, {
                                company: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ABC Corporation"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship
                          </label>
                          <input
                            type="text"
                            value={reference.relationship}
                            onChange={(e) =>
                              updateReference(reference.id, {
                                relationship: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Former Supervisor"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={reference.email}
                            onChange={(e) =>
                              updateReference(reference.id, {
                                email: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="john.smith@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            value={reference.phone || ""}
                            onChange={(e) =>
                              updateReference(reference.id, {
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {showPreview && (
          <div className="fixed inset-y-0 right-0 w-1/2 bg-white border-l border-gray-200 overflow-auto z-10">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Live Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-600 hover:text-red-600"
                aria-label="Close preview"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ResumePreview />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ResumeBuilder;