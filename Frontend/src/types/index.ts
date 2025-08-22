export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: "free" | "pro" | "enterprise";
  createdAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  templateId: string;
  content: ResumeContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeContent {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  customSections: CustomSection[];
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa?: string;
}

export interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  postedDate: Date;
}

export interface Application {
  id: string;
  jobId: string;
  resumeId: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected";
  appliedDate: Date;
  matchScore: number;
  notes: string;
}

export interface Template {
  id: string;
  name: string;
  category: "modern" | "classic" | "creative" | "ats-friendly";
  preview: string;
  isPremium: boolean;
}
