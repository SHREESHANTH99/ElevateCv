import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import FirebaseAuthService from "../services/firebaseAuth";
import type { User, AuthContextType, UserProfile } from "../types/auth";
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }
        if (!data.token || !data.user) {
          throw new Error("Invalid response from server");
        }
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/dashboard");
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [navigate]
  );
  const register = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ): Promise<void> => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ email, password, firstName, lastName }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }
        if (!data.token || !data.user) {
          throw new Error("Invalid response from server");
        }
        localStorage.setItem("token", data.token);
        setUser(data.user);
        navigate("/dashboard");
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    [navigate]
  );
  const loginWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      console.log("Starting Google authentication...");
      const result = await FirebaseAuthService.signInWithGoogle();
      console.log("Firebase authentication successful, contacting backend...");
      const backendData = await FirebaseAuthService.authenticateWithBackend(
        result.user,
        result.token,
        result.isNewUser
      );
      if (!backendData.token || !backendData.user) {
        throw new Error("Invalid response from server. Please try again.");
      }
      localStorage.setItem("token", backendData.token);
      setUser(backendData.user);
      console.log("Google login successful, redirecting to dashboard...");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google login error:", error);
      try {
        await FirebaseAuthService.signOut();
      } catch (signOutError) {
        console.error("Error signing out from Firebase:", signOutError);
      }
      if (error.message && error.message.includes("Server error")) {
        throw new Error(
          "Unable to connect to our servers. Please try again later."
        );
      } else if (error.message && error.message.includes("not found")) {
        throw new Error(
          "Account not found. Please register first or try a different sign-in method."
        );
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  const logout = useCallback(async (): Promise<void> => {
    try {
      await FirebaseAuthService.signOut();
    } catch (error) {
      console.error("Firebase logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");
    }
  }, [navigate]);
  const updateProfile = useCallback(
    async (profileData: Partial<UserProfile>): Promise<void> => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Profile update failed");
        }
        setUser((prev: User | null) => {
          if (!prev) return null;
          return {
            ...prev,
            profile: {
              ...prev.profile,
              ...profileData,
            },
          };
        });
      } catch (error) {
        console.error("Profile update error:", error);
        throw error;
      }
    },
    []
  );
  const uploadProfileImage = useCallback(
    async (file: File): Promise<string> => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const formData = new FormData();
        formData.append("profileImage", file);
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Image upload failed");
        }
        setUser((prev: User | null) => {
          if (!prev) return null;
          return {
            ...prev,
            profile: {
              ...prev.profile,
              avatar: data.avatarUrl,
            },
          };
        });
        return data.avatarUrl;
      } catch (error) {
        console.error("Image upload error:", error);
        throw error;
      }
    },
    []
  );
  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      uploadProfileImage,
    }),
    [
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      uploadProfileImage,
    ]
  );
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
export default AuthContext;
