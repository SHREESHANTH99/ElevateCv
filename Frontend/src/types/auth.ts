export type Address = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
};
export type SocialLinks = {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
  website?: string;
};
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}
export interface Experience {
  id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}
export interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}
export interface Skill {
  id?: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category: string;
}
export interface Project {
  id?: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate: string;
  endDate?: string;
}
export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  template?: string;
}
export type UserProfile = {
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string;
  address?: Address;
  socialLinks?: SocialLinks;
  avatar?: string;
  website?: string;
  resume?: ResumeData;
};
export type Subscription = {
  plan: string;
  status: string;
  expiresAt?: string;
};
export type UserPreferences = {
  theme?: string;
  notifications?: boolean;
};
export type User = {
  id: string;
  email: string;
  profile: UserProfile;
  subscription?: Subscription;
  preferences?: UserPreferences;
};
export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string>;
};