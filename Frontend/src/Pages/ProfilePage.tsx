import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ResumeApi } from "../services/resumeApi";
import {
  Lock,
  CheckCircle,
  FileText,
  Pencil,
  LogOut,
  Plus,
  Sun,
  Moon,
  Loader2,
  XCircle,
  Calendar,
  Download,
} from "lucide-react";
interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
}
interface Resume {
  _id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  template: string;
  isPublic?: boolean;
  personalInfo?: {
    fullName?: string;
  };
}
interface LoadingState {
  profile: boolean;
  resume: boolean;
}
const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [themePreference, setThemePreference] = useState<
    "light" | "dark" | "system"
  >("light");
  const [loading, setLoading] = useState<LoadingState>({
    profile: true,
    resume: false,
  });
  const [editData, setEditData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
  });
  useEffect(() => {
    if (!user) return;
    setEditData({
      firstName: user.profile?.firstName || "",
      lastName: user.profile?.lastName || "",
      email: user.email,
    });
    const loadUserData = async () => {
      try {
        setLoading((prev) => ({ ...prev, profile: true, resume: true }));
        const userResumes = await ResumeApi.getResumes();
        const formattedResumes = userResumes.map((resume: any) => ({
          _id: resume._id || resume.id,
          title: resume.title || "Untitled Resume",
          updatedAt:
            resume.updatedAt || resume.lastModified || new Date().toISOString(),
          createdAt: resume.createdAt || new Date().toISOString(),
          template: resume.template || "modern",
          isPublic: resume.isPublic || false,
          personalInfo: resume.personalInfo,
        }));
        setResumes(formattedResumes);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load profile data. Please try again later.");
      } finally {
        setLoading((prev) => ({
          ...prev,
          profile: false,
          resume: false,
        }));
      }
    };
    loadUserData();
  }, [user]);
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
      setError("Failed to log out. Please try again.");
    }
  };
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateProfile({
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
      });
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteResume = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this resume? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, resume: true }));
      setError("");
      await ResumeApi.deleteResume(id);
      setResumes((prev) => prev.filter((resume) => resume._id !== id));
      setSuccess("Resume deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("Failed to delete resume. Please try again later.");
    } finally {
      setLoading((prev) => ({ ...prev, resume: false }));
    }
  };
  const handleDownloadResume = async (resumeId: string, title: string) => {
    try {
      setLoading((prev) => ({ ...prev, resume: true }));
      setError("");
      await ResumeApi.exportResume(
        resumeId,
        `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
      );
      setSuccess("Resume downloaded successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error downloading resume:", error);
      setError("Failed to download resume. Please try again later.");
    } finally {
      setLoading((prev) => ({ ...prev, resume: false }));
    }
  };
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md w-full">
          <Lock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view your profile.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  if (loading.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-3 md:mt-0">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Sign out
            </button>
          </div>
        </div>
        {}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("resumes")}
              className={`${
                activeTab === "resumes"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Resumes
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`${
                activeTab === "settings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Settings
            </button>
          </nav>
        </div>
        {}
        <div className="mt-8">
          {}
          {activeTab === "profile" && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Profile Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Personal details and information.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-6 p-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="first-name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          First name
                        </label>
                        <input
                          type="text"
                          name="first-name"
                          id="first-name"
                          value={editData.firstName}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              firstName: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label
                          htmlFor="last-name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Last name
                        </label>
                        <input
                          type="text"
                          name="last-name"
                          id="last-name"
                          value={editData.lastName}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              lastName: e.target.value,
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-4">
                        <label
                          htmlFor="email-address"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email-address"
                          id="email-address"
                          value={editData.email}
                          disabled
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          First name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {editData.firstName || "Not set"}
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Last name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {editData.lastName || "Not set"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">
                          Email address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {editData.email}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Pencil className="-ml-1 mr-2 h-4 w-4" />
                        Edit Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {}
          {activeTab === "resumes" && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    My Resumes
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Manage your saved resumes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/resume-builder")}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  New Resume
                </button>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                {resumes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No resumes
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new resume.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => navigate("/resume-builder")}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="-ml-1 mr-2 h-4 w-4" />
                        New Resume
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden bg-white shadow sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {resumes.map((resume) => (
                        <li key={resume._id}>
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <p className="truncate text-sm font-medium text-blue-600">
                                {resume.title}
                              </p>
                              <div className="ml-2 flex flex-shrink-0">
                                <p className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                  {resume.isPublic ? "Public" : "Private"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                                  Updated {formatDate(resume.updatedAt)}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 space-x-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadResume(
                                      resume._id,
                                      resume.title
                                    )
                                  }
                                  className="text-green-600 hover:text-green-900 inline-flex items-center"
                                  disabled={loading.resume}
                                >
                                  <Download className="mr-1 h-4 w-4" />
                                  Download
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteResume(resume._id)}
                                  className="text-red-600 hover:text-red-900"
                                  disabled={loading.resume}
                                >
                                  {loading.resume ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          {}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Theme Preferences
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Customize how the app looks on your device.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Theme
                      </dt>
                      <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className="flex-grow">
                          {themePreference === "light" ? "Light" : "Dark"} mode
                        </span>
                        <span className="ml-4 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setThemePreference(
                                themePreference === "light" ? "dark" : "light"
                              )
                            }
                            className="bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {themePreference === "light" ? (
                              <Moon className="h-5 w-5" />
                            ) : (
                              <Sun className="h-5 w-5" />
                            )}
                          </button>
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              {}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-red-700">
                    Danger Zone
                  </h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <div className="mt-5">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {}
        {error && (
          <div className="mt-6">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="mt-6">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle
                    className="h-5 w-5 text-green-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;