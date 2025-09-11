import React, { useReducer, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ResumeApi } from '../../services/resumeApi';
import { 
  Save, Download, Eye, Plus, Trash2, X, 
  CheckCircle, AlertCircle, User, Briefcase, 
  GraduationCap, Code, FolderOpen, Link as LinkIcon, ExternalLink
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
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
  url?: string;
  github?: string;
  startDate: string;
  endDate?: string;
};
type ResumeState = {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  template: string;
  isLoading: boolean;
  error: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
};
type ResumeAction =
  | { type: 'SET_PERSONAL_INFO'; payload: Partial<ResumeState['personalInfo']> }
  | { type: 'SET_SUMMARY'; payload: string }
  | { type: 'ADD_EXPERIENCE'; payload?: Partial<Experience> }
  | { type: 'UPDATE_EXPERIENCE'; id: string; updates: Partial<Experience> }
  | { type: 'REMOVE_EXPERIENCE'; id: string }
  | { type: 'ADD_EDUCATION'; payload?: Partial<Education> }
  | { type: 'UPDATE_EDUCATION'; id: string; updates: Partial<Education> }
  | { type: 'REMOVE_EDUCATION'; id: string }
  | { type: 'ADD_SKILL'; payload?: Partial<Skill> }
  | { type: 'UPDATE_SKILL'; id: string; updates: Partial<Skill> }
  | { type: 'REMOVE_SKILL'; id: string }
  | { type: 'ADD_PROJECT'; payload?: Partial<Project> }
  | { type: 'UPDATE_PROJECT'; id: string; updates: Partial<Project> }
  | { type: 'REMOVE_PROJECT'; id: string }
  | { type: 'SET_TEMPLATE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVE_STATUS'; payload: ResumeState['saveStatus'] }
  | { type: 'SET_RESUME'; payload: Partial<ResumeState> };
const initialState: ResumeState = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: ''
  },
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  projects: [],
  template: 'modern',
  isLoading: false,
  error: null,
  saveStatus: 'idle'
};
function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case 'SET_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: { ...state.personalInfo, ...action.payload }
      };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'ADD_EXPERIENCE':
      const newExp: Experience = {
        id: uuidv4(),
        company: '',
        position: '',
        location: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        current: false,
        description: [''],
        ...action.payload
      };
      return {
        ...state,
        experiences: [...state.experiences, newExp]
      };
    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        experiences: state.experiences.map(exp =>
          exp.id === action.id ? { ...exp, ...action.updates } : exp
        )
      };
    case 'REMOVE_EXPERIENCE':
      return {
        ...state,
        experiences: state.experiences.filter(exp => exp.id !== action.id)
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SET_RESUME':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
const useResume = () => {
  const [state, dispatch] = useReducer(resumeReducer, initialState);
  const { user } = useAuth();
  const loadResume = useCallback(async () => {
    if (!user?.resumeId) return;
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const data = await ResumeApi.getResume(user.resumeId);
      if (data) {
        dispatch({ type: 'SET_RESUME', payload: data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load resume' });
      console.error('Error loading resume:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);
  const saveResume = useCallback(async () => {
    if (!user) return;
    dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const resumeData = {
        personalInfo: state.personalInfo,
        summary: state.summary,
        experiences: state.experiences,
        education: state.education,
        skills: state.skills,
        projects: state.projects,
        template: state.template
      };
      if (user.resumeId) {
        await ResumeApi.updateResume(user.resumeId, resumeData);
      } else {
        const result = await ResumeApi.createResume(resumeData);
      }
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' });
      setTimeout(() => dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' }), 3000);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save resume' });
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
      console.error('Error saving resume:', error);
    }
  }, [state, user]);
  const exportResume = useCallback(async (format: 'pdf' | 'docx' = 'pdf') => {
  }, [state]);
  const addExperience = useCallback((experience?: Partial<Experience>) => {
    dispatch({ type: 'ADD_EXPERIENCE', payload: experience });
  }, []);
  const addEducation = useCallback((education?: Partial<Education>) => {
    dispatch({ type: 'ADD_EDUCATION', payload: education });
  }, []);
  const addSkill = useCallback((skill?: Partial<Skill>) => {
    dispatch({ type: 'ADD_SKILL', payload: skill });
  }, []);
  const addProject = useCallback((project?: Partial<Project>) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  }, []);
  const updateExperience = useCallback((id: string, updates: Partial<Experience>) => {
    dispatch({ type: 'UPDATE_EXPERIENCE', id, updates });
  }, []);
  const updateEducation = useCallback((id: string, updates: Partial<Education>) => {
    dispatch({ type: 'UPDATE_EDUCATION', id, updates });
  }, []);
  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    dispatch({ type: 'UPDATE_SKILL', id, updates });
  }, []);
  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', id, updates });
  }, []);
  const removeExperience = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_EXPERIENCE', id });
  }, []);
  const removeEducation = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_EDUCATION', id });
  }, []);
  const removeSkill = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SKILL', id });
  }, []);
  const removeProject = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_PROJECT', id });
  }, []);
  const updatePersonalInfo = useCallback((updates: Partial<ResumeState['personalInfo']>) => {
    dispatch({ type: 'SET_PERSONAL_INFO', payload: updates });
  }, []);
  const updateSummary = useCallback((summary: string) => {
    dispatch({ type: 'SET_SUMMARY', payload: summary });
  }, []);
  const setTemplate = useCallback((template: string) => {
    dispatch({ type: 'SET_TEMPLATE', payload: template });
  }, []);
  const formatDate = useCallback((dateString: string): string => {
    if (!dateString) return 'Present';
    try {
      return format(parseISO(dateString), 'MMM yyyy');
    } catch (error) {
      return dateString;
    }
  }, []);
  return {
    state,
    actions: {
      loadResume,
      saveResume,
      exportResume,
      addExperience,
      updateExperience,
      removeExperience,
      addEducation,
      updateEducation,
      removeEducation,
      addSkill,
      updateSkill,
      removeSkill,
      addProject,
      updateProject,
      removeProject,
      updatePersonalInfo,
      updateSummary,
      setTemplate,
      formatDate
    }
  };
};
export { useResume };
export type { Experience, Education, Skill, Project };