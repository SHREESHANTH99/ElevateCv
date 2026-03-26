import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ResumeApi } from "../services/resumeApi";
import { v4 as uuidv4 } from "uuid";
import {
  Loader2,
  Eye,
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
  Sparkles,
  Target,
  BarChart3,
} from "lucide-react";
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
  type TemplateType,
} from "../Components/resume/templates";
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
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetJobDescription, setTargetJobDescription] = useState("");
  const [analysisResults, setAnalysisResults] = useState<{
    score: number;
    label: string;
    color: string;
    feedback: string[];
    analysisBreakdown: any;
    sectionScores: { [key: string]: number };
    reasoning: { type: string; section: string; message: string }[];
    match?: {
      score: number;
      missingSkills: string[];
      matchDetails: any;
    };
    context?: string;
  } | null>(null);
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

    // Read template from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTemplate =
      urlParams.get("template") || localStorage.getItem("selectedTemplate") || "modern";

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
      template: selectedTemplate as TemplateType,
      lastUpdated: new Date(),
    };
  });
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showPreview) {
        setShowPreview(false);
      }
    };
    if (showPreview) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [showPreview]);
  useEffect(() => {
    const loadResume = async () => {
      try {
        setIsLoading(true);
        const urlParams = new URLSearchParams(window.location.search);
        const selectedTemplate =
          urlParams.get("template") || localStorage.getItem("selectedTemplate");
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
            template: selectedTemplate || apiData.template || "modern",
          };
          setResumeData(normalizedData);
        }
      } catch (error) {
        console.error("Error loading resume:", error);
      } finally {
        // Clear the selected template from localStorage after using it
        const urlParams = new URLSearchParams(window.location.search);
        const templateParam = urlParams.get("template") || localStorage.getItem("selectedTemplate");
        if (templateParam) {
          localStorage.removeItem("selectedTemplate");
        }
        setIsLoading(false);
      }
    };
    loadResume();
  }, []);
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
    if (!user) {
      setErrorMessage("Please log in to download your resume");
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage("");
      }, 5000);
      return;
    }

    // Validate resume before download
    const validation = validateResume();
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage("");
      }, 8000);
      return;
    }

    if (!resumeData.personalInfo?.location?.trim()) {
      setErrorMessage("Location is required for PDF download");
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage("");
      }, 5000);
      return;
    }

    try {
      setIsDownloading(true);
      setSaveStatus("saving");
      setErrorMessage("");
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
      setErrorMessage("");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error in handleDownloadPDF:", error);
      setSaveStatus("error");
      setErrorMessage("Failed to generate PDF. Please make sure all required fields are filled and try again.");
      setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage("");
      }, 5000);
    } finally {
      setIsDownloading(false);
    }
  }, [resumeData, user]);

  const validateResume = (): { isValid: boolean; message: string } => {
    const errors: string[] = [];

    // Basic personal info validation
    if (!resumeData.personalInfo?.fullName?.trim()) {
      errors.push("Full name is required");
    }
    if (!resumeData.personalInfo?.email?.trim()) {
      errors.push("Email address is required");
    }
    if (!resumeData.personalInfo?.phone?.trim()) {
      errors.push("Phone number is required");
    }

    // Professional summary validation
    if (!resumeData.summary?.trim()) {
      errors.push("Professional summary is required");
    }

    // Experience validation
    if (resumeData.experiences.length === 0) {
      errors.push("At least one work experience is required");
    } else {
      resumeData.experiences.forEach((exp, index) => {
        if (!exp.company?.trim()) {
          errors.push(`Work experience #${index + 1}: Company name is required`);
        }
        if (!exp.title?.trim()) {
          errors.push(`Work experience #${index + 1}: Job title is required`);
        }
      });
    }

    // Education validation
    if (resumeData.education.length === 0) {
      errors.push("At least one education entry is required");
    } else {
      resumeData.education.forEach((edu, index) => {
        if (!edu.institution?.trim()) {
          errors.push(`Education #${index + 1}: Institution name is required`);
        }
        if (!edu.degree?.trim()) {
          errors.push(`Education #${index + 1}: Degree is required`);
        }
      });
    }

    // Skills validation
    if (resumeData.skills.length === 0) {
      errors.push("At least one skill is required");
    }

    if (errors.length > 0) {
      return {
        isValid: false,
        message: errors.join("; ")
      };
    }

    return { isValid: true, message: "" };
  };

  const [analysisStatus, setAnalysisStatus] = useState("");

  const handleAnalyze = async () => {
    if (isAnalyzing || targetJobDescription.length < 50) return;
    
    setIsAnalyzing(true);
    setAnalysisStatus("Initializing Intelligence Pipeline...");
    
    const statusTimers = [
      setTimeout(() => setAnalysisStatus("Extracting Semantic Requirements..."), 800),
      setTimeout(() => setAnalysisStatus("Calculating Role Alignment..."), 2200),
      setTimeout(() => setAnalysisStatus("Calibrating Final Scoring..."), 4000)
    ];

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/analyze-resume`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          resumeData,
          jobDescription: targetJobDescription 
        })
      });
      
      statusTimers.forEach(clearTimeout);
      setAnalysisStatus("Finalizing Analysis...");

      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data);
        setActiveSection("analysis");
      }
    } catch (error) {
      console.error("Analysis Pipeline Error:", error);
      setAnalysisStatus("Connection Error. Retrying...");
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setAnalysisStatus(""), 2000);
    }
  };

  const improveBulletWithAI = async (experienceId: string, bulletIndex: number) => {
    const experience = resumeData.experiences.find(e => e.id === experienceId);
    if (!experience) return;
    
    const bullet = experience.description[bulletIndex];
    if (!bullet || bullet.length < 10) return;

    try {
      const token = localStorage.getItem("authToken") || localStorage.getItem("token");
      const resp = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/ai/improve-smart`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          section: "experience_bullet",
          content: { bullet },
          feedbackContext: analysisResults?.context || "Rewrite this bullet point to be more professional, using strong action verbs and including metrics or results if possible."
        })
      });
      
      if (resp.ok) {
        const data = await resp.json();
        const improvedBullet = data.improvedContent.bullet;
        const newExperiences = [...resumeData.experiences];
        const expIndex = newExperiences.findIndex(e => e.id === experienceId);
        newExperiences[expIndex].description[bulletIndex] = improvedBullet;
        setResumeData({ ...resumeData, experiences: newExperiences });
      }
    } catch (err) {
      console.error("AI Improvement Error:", err);
    }
  };

  const handleSaveResume = useCallback(async () => {
    if (!user) {
      setErrorMessage("Please log in to save your resume");
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage("");
      }, 5000);
      return;
    }

    // Validate resume data
    const validation = validateResume();
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      setSaveStatus("error");
      setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage("");
      }, 8000);
      return;
    }

    try {
      setSaveStatus("saving");
      setErrorMessage("");
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
      setErrorMessage("");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving resume:", error);
      setSaveStatus("error");
      setErrorMessage("Failed to save resume. Please check your internet connection and try again.");
      setTimeout(() => {
        setSaveStatus("idle");
        setErrorMessage("");
      }, 5000);
    }
  }, [resumeData, user]);
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-zinc-400 font-medium animate-pulse">Loading Builder...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 lg:pb-0 text-zinc-100 pt-20">
      <div className="glass sticky top-20 z-40 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text">
                Resume Builder
              </h1>
              <p className="text-xs text-zinc-500 mt-1">Design your professional future</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300 flex-1 sm:flex-none justify-center group"
              >
                <Eye className="h-4 w-4 mr-2 group-hover:text-emerald-500 transition-colors" />
                Preview
              </button>
              <button
                onClick={handleSaveResume}
                disabled={saveStatus === "saving"}
                className="inline-flex items-center px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all duration-300 disabled:opacity-50 flex-1 sm:flex-none justify-center group"
              >
                {saveStatus === "saving" ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2 text-emerald-500" />
                ) : (
                  <Save className="h-4 w-4 mr-2 group-hover:text-emerald-500 transition-colors" />
                )}
                {saveStatus === "saving" ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 rounded-xl text-sm font-semibold text-white transition-all duration-300 disabled:opacity-50 flex-1 sm:flex-none justify-center group"
              >
                {isDownloading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                )}
                <span className="hidden sm:inline">
                  {isDownloading ? "Generating..." : "Download PDF"}
                </span>
                <span className="sm:hidden">
                  {isDownloading ? "..." : "PDF"}
                </span>
              </button>
            </div>
          </div>

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

      <div className="glass border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="w-full max-w-md">
            <label
              htmlFor="resume-title"
              className="block text-sm font-medium text-zinc-400 mb-2"
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
              className="input-dark !py-2.5"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-7xl mx-auto py-4 lg:py-8">
          {saveStatus === "saved" && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center animate-in fade-in slide-in-from-top-4">
              <CheckCircle className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Resume saved successfully!</span>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Unable to save resume</p>
                  <p className="text-xs opacity-80">{errorMessage || "An error occurred. Please try again."}</p>
                </div>
              </div>
            </div>
          )}

          <div className="w-full">
            <div className="w-full">
              <div className="glass-card rounded-2xl p-4 lg:p-6 mb-6 lg:mb-10">
                <h2 className="text-lg lg:text-xl font-bold mb-6 flex items-center">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3" />
                  Resume Sections
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 lg:gap-4">
                  {[
                    { id: "personal", label: "Personal Info", short: "Personal" },
                    { id: "summary", label: "Summary", short: "Summary" },
                    { id: "experience", label: "Experience", short: "Experience" },
                    { id: "education", label: "Education", short: "Education" },
                    { id: "skills", label: "Skills", short: "Skills" },
                    { id: "projects", label: "Projects", short: "Projects" },
                    { id: "certifications", label: "Certifications", short: "Certs" },
                    { id: "awards", label: "Awards", short: "Awards" },
                    { id: "languages", label: "Languages", short: "Lang" },
                    { id: "publications", label: "Publications", short: "Pubs" },
                    { id: "volunteer", label: "Volunteer", short: "Volunteer" },
                    { id: "references", label: "References", short: "Refs" },
                    { id: "template", label: "Template", short: "Template" },
                    { id: "analysis", label: "AI Analysis", short: "AI" },
                  ].map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`p-3 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-300 border ${
                        activeSection === section.id
                          ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/10"
                          : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                      }`}
                    >
                      <span className="hidden sm:inline">{section.label}</span>
                      <span className="sm:hidden">{section.short}</span>
                    </button>
                  ))}
                </div>
              </div>

          {activeSection === "personal" && (
            <div className="glass-card rounded-2xl p-6 lg:p-8 animate-in fade-in duration-500">
              <h2 className="text-lg lg:text-xl font-bold mb-8 flex items-center text-zinc-100">
                <div className="w-1 h-5 bg-emerald-500 rounded-full mr-3" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                    className="input-dark"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                    className="input-dark"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                    className="input-dark"
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                    className="input-dark"
                    placeholder="City, Country"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                    className="input-dark text-sm"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    LinkedIn
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-zinc-500 text-sm">
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
                      className="input-dark !rounded-l-none text-sm"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                    className="input-dark"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    GitHub
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-zinc-500 text-sm">
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
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Twitter
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-zinc-500 text-sm">
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
                <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                  className="input-dark text-sm"
                  rows={4}
                  placeholder="Write a brief professional summary highlighting your key skills and experience..."
                />
              </div>
            </div>
          )}
          {activeSection === "summary" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
                Professional Summary
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
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
                    className="input-dark text-sm"
                    rows={6}
                    placeholder="Write a brief professional summary highlighting your key skills, experience, and career objectives. This should be 2-4 sentences that give employers a quick overview of what you bring to the table..."
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Tip: Focus on your most relevant skills and achievements
                    that match the job you're applying for.
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeSection === "experience" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-lg lg:text-xl font-semibold">
                  Work Experience
                </h2>
                <button
                  onClick={addExperience}
                  className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 font-semibold text-sm w-full sm:w-auto justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </button>
              </div>
              {resumeData.experiences.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-2xl shadow-xl shadow-black/20">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-zinc-100">
                    No experience added
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
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
                      className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark text-sm"
                            placeholder="e.g., Senior Developer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="e.g., San Francisco, CA"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                              className="input-dark"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                              className={`input-dark ${exp.current ? "bg-zinc-950" : ""
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
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-zinc-400">
                            Job Description
                          </label>
                          <button 
                            onClick={() => {
                              const newDescriptions = [...exp.description, ""];
                              updateExperience(exp.id, { description: newDescriptions });
                            }}
                            className="text-[10px] text-emerald-500 hover:text-emerald-400 uppercase font-bold tracking-widest flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add Bullet
                          </button>
                        </div>
                        <div className="space-y-3">
                          {exp.description.map((bullet, bIdx) => (
                            <div key={bIdx} className="relative group">
                              <textarea
                                value={bullet}
                                onChange={(e) => {
                                  const newDescriptions = [...exp.description];
                                  newDescriptions[bIdx] = e.target.value;
                                  updateExperience(exp.id, { description: newDescriptions });
                                }}
                                className="input-dark !pr-12 text-sm"
                                rows={2}
                                placeholder="Describe impact (e.g., Increased sales by 20%...)"
                              />
                              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => improveBulletWithAI(exp.id, bIdx)}
                                  className="p-1.5 bg-zinc-800 rounded-lg text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                                  title="Improve with AI"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                                {exp.description.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newDescriptions = exp.description.filter((_, i) => i !== bIdx);
                                      updateExperience(exp.id, { description: newDescriptions });
                                    }}
                                    className="p-1.5 bg-zinc-800 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                    title="Remove Bullet"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "education" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Education</h2>
                <button
                  onClick={addEducation}
                  className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 font-semibold text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </button>
              </div>
              {resumeData.education.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-2xl shadow-xl shadow-black/20">
                  <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-zinc-100">
                    No education added
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
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
                      className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="University Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="e.g., Bachelor of Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Field of Study
                          </label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) =>
                              updateEducation(edu.id, { field: e.target.value })
                            }
                            className="input-dark"
                            placeholder="e.g., Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="e.g., City, Country"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className={`input-dark ${edu.current ? "bg-zinc-950" : ""
                              }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            GPA (Optional)
                          </label>
                          <input
                            type="text"
                            value={edu.gpa || ""}
                            onChange={(e) =>
                              updateEducation(edu.id, { gpa: e.target.value })
                            }
                            className="input-dark"
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
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={edu.description || ""}
                          onChange={(e) =>
                            updateEducation(edu.id, {
                              description: e.target.value,
                            })
                          }
                          className="input-dark"
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

          {activeSection === "skills" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Skills</h2>
                <button
                  onClick={addSkill}
                  className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 font-semibold text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </button>
              </div>
              {resumeData.skills.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-2xl shadow-xl shadow-black/20">
                  <Code className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-zinc-100">
                    No skills added
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
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
                      className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Skill Name
                          </label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) =>
                              updateSkill(skill.id, { name: e.target.value })
                            }
                            className="input-dark"
                            placeholder="e.g., JavaScript, Python, Project Management"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Category
                          </label>
                          <select
                            value={skill.category}
                            onChange={(e) =>
                              updateSkill(skill.id, {
                                category: e.target.value,
                              })
                            }
                            className="input-dark"
                          >
                            <option value="Technical">Technical</option>
                            <option value="Soft">Soft Skills</option>
                            <option value="Language">Languages</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                                  <span className="ml-2 text-sm text-zinc-400">
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

          {activeSection === "projects" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Projects</h2>
                <button
                  onClick={addProject}
                  className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 font-semibold text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </button>
              </div>
              {resumeData.projects.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-2xl shadow-xl shadow-black/20">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-zinc-100">
                    No projects added
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
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
                      className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Project Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Project URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={project.url || ""}
                            onChange={(e) =>
                              updateProject(project.id, { url: e.target.value })
                            }
                            className="input-dark"
                            placeholder="https://example.com/project"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Description
                        </label>
                        <textarea
                          value={project.description}
                          onChange={(e) =>
                            updateProject(project.id, {
                              description: e.target.value,
                            })
                          }
                          className="input-dark"
                          rows={3}
                          placeholder="Describe the project, your role, and key achievements"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                          className="input-dark"
                          placeholder="e.g., React, Node.js, MongoDB"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "certifications" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6">
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
                <p className="text-zinc-500 text-center py-8">
                  No certifications added yet. Click "Add Certification" to get
                  started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="border border-zinc-800/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="AWS Certified Solutions Architect"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Amazon Web Services"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="ABC123456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
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

          {activeSection === "awards" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6">
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
                <p className="text-zinc-500 text-center py-8">
                  No awards added yet. Click "Add Award" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.awards.map((award) => (
                    <div
                      key={award.id}
                      className="border border-zinc-800/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Award Title
                          </label>
                          <input
                            type="text"
                            value={award.title}
                            onChange={(e) =>
                              updateAward(award.id, { title: e.target.value })
                            }
                            className="input-dark"
                            placeholder="Employee of the Year"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Issuer/Organization
                          </label>
                          <input
                            type="text"
                            value={award.issuer}
                            onChange={(e) =>
                              updateAward(award.id, { issuer: e.target.value })
                            }
                            className="input-dark"
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Date Received
                          </label>
                          <input
                            type="date"
                            value={award.date}
                            onChange={(e) =>
                              updateAward(award.id, { date: e.target.value })
                            }
                            className="input-dark"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Description (Optional)
                        </label>
                        <textarea
                          value={award.description || ""}
                          onChange={(e) =>
                            updateAward(award.id, {
                              description: e.target.value,
                            })
                          }
                          className="input-dark"
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

          {activeSection === "languages" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6">
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
                <p className="text-zinc-500 text-center py-8">
                  No languages added yet. Click "Add Language" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.languages.map((language) => (
                    <div
                      key={language.id}
                      className="border border-zinc-800/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Spanish"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
                            Proficiency Level
                          </label>
                          <select
                            value={language.proficiency}
                            onChange={(e) =>
                              updateLanguage(language.id, {
                                proficiency: e.target.value as any,
                              })
                            }
                            className="input-dark"
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

          {activeSection === "publications" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6">
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
                <p className="text-zinc-500 text-center py-8">
                  No publications added yet. Click "Add Publication" to get
                  started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.publications.map((publication) => (
                    <div
                      key={publication.id}
                      className="border border-zinc-800/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Research Paper Title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Journal Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="https://journal.com/article"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Description/Abstract (Optional)
                        </label>
                        <textarea
                          value={publication.description || ""}
                          onChange={(e) =>
                            updatePublication(publication.id, {
                              description: e.target.value,
                            })
                          }
                          className="input-dark"
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

          {activeSection === "volunteer" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6">
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
                <p className="text-zinc-500 text-center py-8">
                  No volunteer experience added yet. Click "Add Volunteer
                  Experience" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.volunteerExperience.map((volunteer) => (
                    <div
                      key={volunteer.id}
                      className="border border-zinc-800/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Red Cross"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Volunteer Coordinator"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
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
                          <span className="text-sm text-zinc-400">
                            Currently volunteering here
                          </span>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">
                          Description
                        </label>
                        <textarea
                          value={volunteer.description[0] || ""}
                          onChange={(e) =>
                            updateVolunteerExperience(volunteer.id, {
                              description: [e.target.value],
                            })
                          }
                          className="input-dark"
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

          {activeSection === "references" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-6">
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
                <p className="text-zinc-500 text-center py-8">
                  No references added yet. Click "Add Reference" to get started.
                </p>
              ) : (
                <div className="space-y-6">
                  {resumeData.references.map((reference) => (
                    <div
                      key={reference.id}
                      className="border border-zinc-800/50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-zinc-100">
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
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="John Smith"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Senior Manager"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="ABC Corporation"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="Former Supervisor"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
                            placeholder="john.smith@company.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">
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
                            className="input-dark"
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

          {activeSection === "template" && (
            <div className="glass-card rounded-2xl shadow-xl shadow-black/20 p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-semibold mb-4 lg:mb-6">
                Choose Template
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[
                  {
                    id: "modern",
                    name: "Modern",
                    description: "Clean and professional with gradient header",
                  },
                  {
                    id: "executive",
                    name: "Executive",
                    description:
                      "Sophisticated design for senior professionals",
                  },
                  {
                    id: "creative",
                    name: "Creative",
                    description: "Vibrant design for creative professionals",
                  },
                  {
                    id: "minimalist",
                    name: "Minimalist",
                    description: "Simple and clean monochrome design",
                  },
                  {
                    id: "ats",
                    name: "ATS-Friendly",
                    description: "Optimized for applicant tracking systems",
                  },
                  {
                    id: "tech",
                    name: "Tech",
                    description: "Terminal-style design for developers",
                  },
                  {
                    id: "classic",
                    name: "Classic",
                    description: "Traditional academic resume format",
                  },
                  {
                    id: "corporate",
                    name: "Corporate",
                    description: "Professional business template",
                  },
                  {
                    id: "engineer",
                    name: "Engineer",
                    description: "Technical template for engineers",
                  },
                  {
                    id: "graduate",
                    name: "Graduate",
                    description: "Perfect for new graduates and students",
                  },
                ].map((template) => (
                  <div
                    key={template.id}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${resumeData.template === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-zinc-800/50 hover:border-gray-300"
                      }`}
                    onClick={() => {
                      setResumeData((prev) => ({
                        ...prev,
                        template: template.id as TemplateType,
                      }));
                      localStorage.setItem("selectedTemplate", template.id);
                    }}
                  >
                    {resumeData.template === template.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {template.description}
                    </p>
                    <div className="mt-4 h-32 bg-zinc-950 rounded border flex items-center justify-center">
                      <span className="text-zinc-500 text-xs">Preview</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Tip:</strong> You can preview your resume with
                  different templates in real-time using the preview panel on
                  the right.
                </p>
              </div>
            </div>
          )}

          {activeSection === "analysis" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Target Job Input Block */}
              <div className="glass-card rounded-3xl p-6 lg:p-8 border-emerald-500/10 transition-all hover:border-emerald-500/30">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-100">Specify Target Job</h2>
                    <p className="text-zinc-500 text-xs">AI will align your scoring and matching to this role.</p>
                  </div>
                </div>
                <textarea
                  value={targetJobDescription}
                  onChange={(e) => setTargetJobDescription(e.target.value)}
                  placeholder="Paste the Job Description here (Min 50 chars for deep analysis)..."
                  className="input-dark min-h-[120px] text-sm leading-relaxed"
                />
                <div className="mt-4 flex justify-end">
                   <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || targetJobDescription.length < 50}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold shadow-xl hover:shadow-emerald-500/20 transition-all disabled:opacity-30 flex items-center group overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
                    {isAnalyzing ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-5 h-5 mb-2 animate-spin text-white" />
                        <span className="text-[10px] font-medium tracking-widest uppercase opacity-70">{analysisStatus}</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span>{isAnalyzing ? "Processing..." : "Analyze & Align Resume"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {analysisResults ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  {/* Left Column: ATS Score & Breakdown */}
                    <div className="xl:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-3xl text-center relative overflow-hidden group border-emerald-500/20">
                      {analysisResults.metadata?.cached && (
                        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                          <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Instant Cached</span>
                        </div>
                      )}
                      
                      {analysisResults.metadata?.timings && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 text-[9px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Total: {analysisResults.metadata.timings.total}ms</span>
                          <span>Align: {analysisResults.metadata.timings.heavy_alignment}ms</span>
                        </div>
                      )}
                      
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="relative w-48 h-48 mx-auto mb-6">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle className="text-zinc-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="44" cx="50" cy="50" />
                          <circle 
                            className="transition-all duration-1000 ease-out" 
                            style={{ color: analysisResults.color || '#10b981' }}
                            strokeWidth="6" 
                            strokeDasharray={276.4}
                            strokeDashoffset={276.4 - (276.4 * (analysisResults?.match?.score || analysisResults.score)) / 100}
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                            r="44" cx="50" cy="50" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black text-white">{analysisResults?.match?.score || analysisResults.score}</span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-1">Intelligence Score</span>
                        </div>
                      </div>
                      <div className="px-5 py-2 rounded-2xl border transition-all inline-block" 
                           style={{ backgroundColor: `${analysisResults.color}15`, borderColor: `${analysisResults.color}30`, color: analysisResults.color }}>
                        <span className="text-xs font-black uppercase tracking-[0.15em]">{analysisResults.label || 'Analyzing...'}</span>
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-3xl space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 px-1">Section Analysis</h3>
                      {Object.entries(analysisResults.sectionScores || {}).map(([section, val], i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-zinc-400 capitalize">{section}</span>
                            <span className={val > 70 ? 'text-emerald-400' : 'text-amber-400'}>{val}%</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000" 
                              style={{ 
                                width: `${val}%`, 
                                backgroundColor: val > 70 ? '#10b98199' : '#f59e0b99'
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Feedback & Skills Gap */}
                  <div className="xl:col-span-8 space-y-8">
                    {/* Job Match Module */}
                    {analysisResults?.match && (
                      <div className="glass-card rounded-3xl p-6 border-cyan-500/10">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                                <Target className="w-4 h-4 text-cyan-500" />
                              </div>
                              <h3 className="text-sm font-black uppercase tracking-widest text-cyan-500">Semantic Accuracy</h3>
                           </div>
                          <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{analysisResults.match.score}% match</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase mb-3 px-1">Verified Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults.match.matchDetails?.["Job Skills"]?.filter((s: string) => !analysisResults.match?.missingSkills.includes(s)).map((skill: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/10">{skill}</span>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                            <p className="text-[10px] font-bold text-rose-500 uppercase mb-3 px-1">Detected Skill Gaps</p>
                            <div className="flex flex-wrap gap-2">
                              {analysisResults.match.missingSkills.map((skill: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-rose-500/10 text-rose-400 rounded text-[10px] font-bold border border-rose-500/10 flex items-center">
                                  <Plus className="w-2.5 h-2.5 mr-1" /> {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Explainability Layer */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 px-1">Score Reasoning & Roadmap</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {(analysisResults.reasoning || []).map((reason, i) => (
                          <div key={i} className="flex items-start p-5 bg-zinc-900/40 rounded-3xl border border-zinc-800/50 hover:border-blue-500/20 transition-all group">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${
                                reason.type === 'critical' ? 'bg-rose-500/10' : 'bg-blue-500/10'
                            }`}>
                              {reason.type === 'critical' ? 
                                <AlertCircle className="w-5 h-5 text-rose-500" /> : 
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                              }
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{reason.section}</span>
                                  {reason.type === 'critical' && <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Critical</span>}
                               </div>
                              <p className="text-sm text-zinc-300 leading-relaxed font-medium">{reason.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Intelligent Loop - Copy text */}
                    <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 relative group">
                       <Sparkles className="absolute top-4 right-4 w-5 h-5 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" />
                       <h4 className="text-[11px] font-black uppercase text-emerald-500 mb-2">Optimization Context</h4>
                       <p className="text-xs text-zinc-400 italic">"Use this context when clicking 'Improve with AI' in the editor for better results."</p>
                       <div className="mt-3 p-3 bg-zinc-950 rounded-xl text-[11px] text-emerald-400/70 font-mono border border-emerald-500/5">
                          {analysisResults.context}
                       </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-zinc-800/50 p-4 lg:hidden z-20">
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </button>
          <button
            onClick={handleSaveResume}
            disabled={saveStatus === "saving"}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg text-sm font-bold disabled:opacity-50"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="animate-spin h-4 w-4 mr-1" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {saveStatus === "saving" ? "Saving..." : "Save"}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="animate-spin h-4 w-4 mr-1" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            PDF
          </button>
        </div>
      </div>
    </div>
  </div>

      {showPreview && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 lg:p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPreview(false);
            }
          }}
        >
          <div className="glass-card rounded-2xl w-full h-full lg:max-w-5xl lg:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-zinc-800/50">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Eye className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-100">
                    Resume Preview
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {resumeData.template.charAt(0).toUpperCase() + resumeData.template.slice(1)} Template
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 text-sm font-bold"
                >
                  {isDownloading ? (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isDownloading ? "Generating..." : "Download PDF"}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-zinc-900/30 p-4 lg:p-8">
              <div className="max-w-4xl mx-auto shadow-2xl rounded-sm overflow-hidden bg-white">
                <div
                  id="resume-preview-modal"
                  ref={previewRef}
                  className="p-8 bg-white"
                  style={{ minHeight: "1122px" }} // A4 aspect ratio approx
                >
                  {(() => {
                    switch (resumeData.template) {
                      case "modern": return <ModernTemplate data={resumeData} />;
                      case "executive": return <ExecutiveTemplate data={resumeData} />;
                      case "creative": return <CreativeTemplate data={resumeData} />;
                      case "minimalist": return <MinimalistTemplate data={resumeData} />;
                      case "ats": return <ATSTemplate data={resumeData} />;
                      case "tech": return <TechTemplate data={resumeData} />;
                      case "classic": return <ClassicTemplate data={resumeData} />;
                      case "corporate": return <CorporateTemplate data={resumeData} />;
                      case "engineer": return <EngineerTemplate data={resumeData} />;
                      case "graduate": return <GraduateTemplate data={resumeData} />;
                      default: return <ModernTemplate data={resumeData} />;
                    }
                  })()}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-zinc-400 flex items-center">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                Formatting and styling will be preserved in the exported PDF.
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="w-full sm:w-auto px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-20 lg:hidden"></div>
    </div>
  );
};

export default ResumeBuilder;
