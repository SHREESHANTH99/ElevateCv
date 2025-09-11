import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ResumeApi } from '../services/resumeApi';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';
import { 
  Loader2, 
  Eye, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Briefcase, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  Code, 
  FolderOpen,
  X 
} from 'lucide-react';
import ModernTemplate from '../Components/resume/templates/ModernTemplate';
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
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
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
type Experience = {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
};
type Education = {
  id: string;
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
type Skill = {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: string;
};
type Project = {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
  github?: string;
};
type PersonalInfo = {
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
type ResumeData = {
  personalInfo: PersonalInfo;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  template: string;
  lastUpdated?: Date;
};
const ResumeBuilder: React.FC = () => {
  interface AuthUser {
    email?: string;
    profile?: UserProfile;
  }
  interface AuthContextType {
    user: AuthUser | null;
  }
  const { user } = useAuth() as AuthContextType;
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'projects'>('personal');
  const [showPreview, setShowPreview] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const profile = user?.profile || {} as UserProfile;
    const socialLinks = profile?.socialLinks || {} as SocialLinks;
    return {
      personalInfo: {
        fullName: profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || '',
        email: user?.email || '',
        phone: '',
        location: '',
        linkedin: socialLinks?.linkedin || '',
        website: profile?.website || '',
        github: socialLinks?.github || '',
        twitter: socialLinks?.twitter || '',
        headline: '',
        photo: ''
      },
      summary: '',
      experiences: [],
      education: [],
      skills: [],
      projects: [],
      template: 'modern',
      lastUpdated: new Date()
    };
  });
  useEffect(() => {
    const loadResume = async () => {
      try {
        setIsLoading(true);
        const data = await ResumeApi.getResume();
        if (data) {
          const apiData = data as unknown as {
            personalInfo: PersonalInfo;
            summary: string;
            experiences: AuthExperience[];
            education: AuthEducation[];
            skills: AuthSkill[];
            projects: AuthProject[];
            template: string;
          };
          const normalizedData: ResumeData = {
            personalInfo: {
              fullName: apiData.personalInfo?.fullName || '',
              email: apiData.personalInfo?.email || '',
              phone: apiData.personalInfo?.phone || '',
              location: apiData.personalInfo?.location || '',
              linkedin: apiData.personalInfo?.linkedin || '',
              website: apiData.personalInfo?.website || '',
              github: apiData.personalInfo?.github,
              twitter: apiData.personalInfo?.twitter,
              headline: apiData.personalInfo?.headline,
              photo: apiData.personalInfo?.photo
            },
            summary: apiData.summary || '',
            experiences: (apiData.experiences || []).map(exp => ({
              id: exp.id || uuidv4(),
              company: exp.company || '',
              position: exp.position || '',
              location: exp.location || '',
              startDate: exp.startDate || new Date().toISOString().split('T')[0],
              endDate: exp.endDate || '',
              current: exp.current || false,
              description: exp.description || []
            })),
            education: (apiData.education || []).map(edu => ({
              id: edu.id || uuidv4(),
              institution: edu.institution || '',
              degree: edu.degree || '',
              field: edu.field || '',
              location: edu.location || '',
              startDate: edu.startDate || new Date().toISOString().split('T')[0],
              endDate: edu.endDate || '',
              current: edu.current || false,
              gpa: edu.gpa,
              description: edu.description
            })),
            skills: (apiData.skills || []).map(skill => ({
              id: skill.id || uuidv4(),
              name: skill.name || '',
              level: skill.level || 'Beginner',
              category: skill.category || ''
            })),
            projects: (apiData.projects || []).map(project => ({
              id: project.id || uuidv4(),
              name: project.name || '',
              description: project.description || '',
              technologies: project.technologies || [],
              startDate: project.startDate || new Date().toISOString().split('T')[0],
              endDate: project.endDate
            })),
            template: apiData.template || 'modern'
          };
          setResumeData(normalizedData);
        }
      } catch (error) {
        console.error('Error loading resume:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResume();
  }, []);
  const saveChanges = useCallback(async () => {
    if (isLoading) return;
    setSaveStatus('saving');
    try {
      await ResumeApi.saveResume(resumeData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving resume:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [resumeData, isLoading]);
  useEffect(() => {
    const timer = setTimeout(() => {
      saveChanges();
    }, 2000);
    return () => clearTimeout(timer);
  }, [resumeData, saveChanges]);
  const ResumePreview = () => {
    switch (resumeData.template) {
      case 'modern':
        return <ModernTemplate data={resumeData} />;
      default:
        return <div className="p-4 bg-gray-100 rounded-lg"><p>Select a template to see a preview.</p></div>;
    }
  };
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  const addExperience = () => {
    const newExp: Experience = {
      id: uuidv4(),
      company: '',
      position: '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      current: false,
      description: ['']
    };
    setResumeData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExp]
    }));
  };
  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };
  const updateExperience = (id: string, updates: Partial<Experience>) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      )
    }));
  };
  const addEducation = () => {
    const newEdu: Education = {
      id: uuidv4(),
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      current: false,
      gpa: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };
  const updateEducation = (id: string, updates: Partial<Education>) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, ...updates } : edu
      )
    }));
  };
  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };
  const addSkill = () => {
    const newSkill: Skill = {
      id: uuidv4(),
      name: '',
      level: 'Intermediate',
      category: 'Technical'
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };
  const updateSkill = (id: string, updates: Partial<Omit<Skill, 'level'>> & { level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' }) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, ...updates } : skill
      )
    }));
  };
  const removeSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };
  const addProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      name: '',
      description: '',
      technologies: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };
  const updateProject = (id: string, updates: Partial<Project>) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, ...updates } : proj
      )
    }));
  };
  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <div className="flex h-screen bg-gray-50">
      {}
      <div className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="p-4 flex items-center justify-between">
          {!isSidebarCollapsed && <h2 className="text-lg font-semibold">Resume Builder</h2>}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-gray-500 hover:text-gray-700 p-2"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
        </div>
        <nav className="p-2 space-y-1">
          <button
            onClick={() => setActiveSection('personal')}
            className={`w-full flex items-center px-4 py-2 rounded-md ${
              activeSection === 'personal'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User className="h-5 w-5 mr-3" />
            {!isSidebarCollapsed && 'Personal Info'}
          </button>
          <button
            onClick={() => setActiveSection('experience')}
            className={`w-full flex items-center px-4 py-2 rounded-md ${
              activeSection === 'experience'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="h-5 w-5 mr-3" />
            {!isSidebarCollapsed && 'Experience'}
            {!isSidebarCollapsed && resumeData.experiences.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {resumeData.experiences.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('education')}
            className={`w-full flex items-center px-4 py-2 rounded-md ${
              activeSection === 'education'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <GraduationCap className="h-5 w-5 mr-3" />
            {!isSidebarCollapsed && 'Education'}
            {!isSidebarCollapsed && resumeData.education.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {resumeData.education.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('skills')}
            className={`w-full flex items-center px-4 py-2 rounded-md ${
              activeSection === 'skills'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Code className="h-5 w-5 mr-3" />
            {!isSidebarCollapsed && 'Skills'}
            {!isSidebarCollapsed && resumeData.skills.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {resumeData.skills.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('projects')}
            className={`w-full flex items-center px-4 py-2 rounded-md ${
              activeSection === 'projects'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FolderOpen className="h-5 w-5 mr-3" />
            {!isSidebarCollapsed && 'Projects'}
            {!isSidebarCollapsed && resumeData.projects.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {resumeData.projects.length}
              </span>
            )}
          </button>
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {!isSidebarCollapsed && (showPreview ? 'Hide Preview' : 'Show Preview')}
            </button>
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              {!isSidebarCollapsed && <span>Auto-save</span>}
              {saveStatus === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {saveStatus === 'saved' && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
              {saveStatus === 'error' && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
            </div>
          </div>
        </nav>
      </div>
      {}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {}
          <div className="fixed bottom-4 right-4 bg-white shadow-md rounded-full px-4 py-2 flex items-center space-x-2 text-sm z-20">
            {saveStatus === 'saving' && (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-green-500 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Saved at {new Date().toLocaleTimeString()}
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error saving changes
              </span>
            )}
          </div>
            {activeSection === 'personal' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) =>
                      setResumeData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          fullName: e.target.value
                        }
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
                      setResumeData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          email: e.target.value
                        }
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
                      setResumeData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          phone: e.target.value
                        }
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
                      setResumeData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          location: e.target.value
                        }
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
                    value={resumeData.personalInfo.headline || ''}
                    onChange={(e) =>
                      setResumeData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          headline: e.target.value
                        }
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
                        setResumeData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            linkedin: e.target.value
                          }
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
                      setResumeData(prev => ({
                        ...prev,
                        personalInfo: {
                          ...prev.personalInfo,
                          website: e.target.value
                        }
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
                      value={resumeData.personalInfo.github || ''}
                      onChange={(e) =>
                        setResumeData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            github: e.target.value
                          }
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
                      value={resumeData.personalInfo.twitter || ''}
                      onChange={(e) =>
                        setResumeData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo,
                            twitter: e.target.value
                          }
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
                    setResumeData(prev => ({
                      ...prev,
                      summary: e.target.value
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Write a brief professional summary highlighting your key skills and experience..."
                />
              </div>
            </div>
          )}
          {}
          {activeSection === 'experience' && (
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
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No experience added</h3>
                  <p className="mt-1 text-sm text-gray-500">Add your work experience to get started.</p>
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
                    <div key={exp.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Experience</h3>
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
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
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
                            onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
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
                            onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
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
                              onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
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
                              onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                              disabled={exp.current}
                              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                exp.current ? 'bg-gray-100' : ''
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
                                  endDate: e.target.checked ? '' : exp.endDate
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
                          value={exp.description.join('\n')}
                          onChange={(e) => {
                            const descriptions = e.target.value.split('\n').filter(desc => desc.trim() !== '');
                            updateExperience(exp.id, { description: descriptions.length > 0 ? descriptions : [''] });
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
          {activeSection === 'education' && (
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
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No education added</h3>
                  <p className="mt-1 text-sm text-gray-500">Add your education history to get started.</p>
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
                    <div key={edu.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Education</h3>
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
                            onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
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
                            onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
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
                            onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
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
                            onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
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
                            onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
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
                            onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                            disabled={edu.current}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              edu.current ? 'bg-gray-100' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            GPA (Optional)
                          </label>
                          <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
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
                                  endDate: e.target.checked ? '' : edu.endDate
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
                          value={edu.description || ''}
                          onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
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
          {activeSection === 'skills' && (
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
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No skills added</h3>
                  <p className="mt-1 text-sm text-gray-500">Add your skills to showcase your expertise.</p>
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
                    <div key={skill.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Skill</h3>
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
                            onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
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
                            onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
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
                              {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((level) => (
                                <label key={level} className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                    checked={skill.level === level}
                                    onChange={() => updateSkill(skill.id, { level })}
                                  />
                                  <span className="ml-2 text-sm text-gray-700">{level}</span>
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
          {activeSection === 'projects' && (
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
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No projects added</h3>
                  <p className="mt-1 text-sm text-gray-500">Add your projects to showcase your work.</p>
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
                    <div key={project.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Project</h3>
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
                            onChange={(e) => updateProject(project.id, { name: e.target.value })}
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
                            value={project.url || ''}
                            onChange={(e) => updateProject(project.id, { url: e.target.value })}
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
                            value={project.github || ''}
                            onChange={(e) => updateProject(project.id, { github: e.target.value })}
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
                            onChange={(e) => updateProject(project.id, { startDate: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date (Leave empty if ongoing)
                          </label>
                          <input
                            type="date"
                            value={project.endDate || ''}
                            onChange={(e) => updateProject(project.id, { endDate: e.target.value || undefined })}
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
                          onChange={(e) => updateProject(project.id, { description: e.target.value })}
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
                          value={project.technologies.join(', ')}
                          onChange={(e) => {
                            const techs = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
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
        </div>
        {}
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