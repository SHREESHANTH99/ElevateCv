export interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
}
export interface UserProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  socialLinks?: SocialLinks;
  photoUrl?: string;
  headline?: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  profile?: UserProfile;
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
  github?: string;
  twitter?: string;
  headline?: string;
  photo?: string;
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
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  gpa?: string;
  description?: string;
}
export interface Skill {
  id: string;
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
  startDate?: string;
  endDate?: string;
  current?: boolean;
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