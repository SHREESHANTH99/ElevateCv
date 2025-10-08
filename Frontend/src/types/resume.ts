export type Experience = {
  id: string;
  title: string;
  position?: string; // Add position property as optional for backward compatibility
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
};
export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  description?: string;
};
export type Skill = {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
};
export type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  github?: string;
};
export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  date?: string; // Add date property for backward compatibility
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
};
export type Award = {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
};
export type Language = {
  id: string;
  name: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
};
export type Publication = {
  id: string;
  title: string;
  publisher: string;
  publishDate: string;
  url?: string;
  description?: string;
};
export type VolunteerExperience = {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string[];
};
export type Reference = {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  relationship: string;
};
export type PersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github?: string;
  twitter?: string;
  headline?: string;
  photo?: string;
};
export type ResumeData = {
  title?: string;
  personalInfo: PersonalInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  publications: Publication[];
  volunteerExperience: VolunteerExperience[];
  references: Reference[];
  template: string;
  lastUpdated?: Date;
};
export type SocialLinks = {
  linkedin?: string;
  github?: string;
  twitter?: string;
};
export type UserProfile = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  website?: string;
  socialLinks?: SocialLinks;
};
export type AuthUser = {
  email?: string;
  profile?: UserProfile;
};
export type AuthContextType = {
  user: AuthUser | null;
};
