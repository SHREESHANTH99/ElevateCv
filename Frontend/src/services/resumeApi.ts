import type { ResumeData } from '../types/auth';
const API_BASE_URL = 'http://localhost:5000/api';
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
};
export const ResumeApi = {
  async saveResume(resumeData: Partial<ResumeData>): Promise<ResumeData> {
    try {
      const response = await fetch(`${API_BASE_URL}/resume`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(resumeData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save resume');
      }
      return data.data;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw new Error(getErrorMessage(error));
    }
  },
  async getResume(): Promise<ResumeData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/resume`, {
        headers: getAuthHeader(),
      });
      if (response.status === 404) {
        return null;
      }
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch resume');
      }
      return data.data;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw new Error(getErrorMessage(error));
    }
  },
  async updateResume(updates: Partial<ResumeData>): Promise<ResumeData> {
    try {
      const response = await fetch(`${API_BASE_URL}/resume`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update resume');
      }
      return data.data;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw new Error(getErrorMessage(error));
    }
  },
  async deleteResume(resumeId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const url = resumeId 
        ? `${API_BASE_URL}/resume/${resumeId}`
        : `${API_BASE_URL}/resume`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete resume');
      }
      return {
        success: true,
        message: data.message || 'Resume deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error(getErrorMessage(error));
    }
  },
  async exportResume(resumeId?: string): Promise<Blob> {
    try {
      const url = resumeId 
        ? `${API_BASE_URL}/resume/export/${resumeId}`
        : `${API_BASE_URL}/resume/export`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to export resume');
      }
      return await response.blob();
    } catch (error) {
      console.error('Error exporting resume:', error);
      throw new Error(getErrorMessage(error));
    }
  },
};