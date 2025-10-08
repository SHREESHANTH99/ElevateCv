import type { ResumeData } from "../types/auth";
const API_BASE_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000"
}/api`;
const getAuthHeader = () => {
  const token =
    localStorage.getItem("authToken") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
};
const formatValidationError = (error: any): string => {
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    if (error.message) return error.message;
    if (error.field && error.message) return `${error.field}: ${error.message}`;
    if (error.path && error.msg) return `${error.path}: ${error.msg}`;
    if (error.param && error.msg) return `${error.param}: ${error.msg}`;
    try {
      return JSON.stringify(error, null, 2);
    } catch (e) {
      return `Validation error: ${Object.prototype.toString.call(error)}`;
    }
  }
  return String(error);
};
const cleanResumeData = (
  resumeData: Partial<ResumeData>
): Partial<ResumeData> => {
  const cleaned = { ...resumeData };
  const requiredFields = ["summary", "title", "personalInfo"];
  Object.keys(cleaned).forEach((key) => {
    const value = (cleaned as any)[key];
    if (
      value === undefined ||
      value === null ||
      (value === "" && !requiredFields.includes(key))
    ) {
      delete (cleaned as any)[key];
    }
    if (Array.isArray(value)) {
      (cleaned as any)[key] = value
        .map((item) => {
          if (typeof item === "string") return item.trim() !== "" ? item : null;
          if (typeof item === "object" && item !== null) {
            const cleanedItem = { ...item };
            Object.keys(cleanedItem).forEach((itemKey) => {
              if (cleanedItem[itemKey] === "") {
                delete cleanedItem[itemKey];
              }
            });
            if (key === "education") {
              return cleanedItem.institution ||
                cleanedItem.degree ||
                cleanedItem.field
                ? cleanedItem
                : null;
            } else if (key === "experiences") {
              return cleanedItem.company ||
                cleanedItem.position ||
                cleanedItem.title
                ? cleanedItem
                : null;
            } else {
              const hasValidContent = Object.values(cleanedItem).some(
                (val) => val !== undefined && val !== null && val !== ""
              );
              return hasValidContent ? cleanedItem : null;
            }
          }
          return item;
        })
        .filter((item) => item !== null);
      if ((cleaned as any)[key].length === 0) {
        delete (cleaned as any)[key];
      }
    }
  });
  return cleaned;
};
export const ResumeApi = {
  async createResume(resumeData: Partial<ResumeData>): Promise<ResumeData> {
    try {
      const cleanedData = cleanResumeData(resumeData);
      console.log("🔍 Creating resume with data:", cleanedData);
      const response = await fetch(`${API_BASE_URL}/resume`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(cleanedData),
      });
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("❌ Failed to parse response JSON:", parseError);
        throw new Error(
          `Server returned invalid JSON response (${response.status})`
        );
      }
      if (!response.ok) {
        console.error("❌ Resume create failed:", {
          status: response.status,
          statusText: response.statusText,
          responseData: data,
        });
        if (response.status === 400 && data?.errors) {
          let validationMessage = "Validation failed:\n";
          if (Array.isArray(data.errors)) {
            validationMessage += data.errors
              .map(
                (error: any, index: number) =>
                  `${index + 1}. ${formatValidationError(error)}`
              )
              .join("\n");
          } else {
            validationMessage += formatValidationError(data.errors);
          }
          console.error("📋 Formatted validation errors:", validationMessage);
          throw new Error(validationMessage);
        }
        throw new Error(
          data?.message || `Failed to create resume (${response.status})`
        );
      }
      console.log("✅ Resume created successfully:", data);
      return data.resume || data.data || data;
    } catch (error) {
      console.error("❌ Error creating resume:", error);
      throw new Error(getErrorMessage(error));
    }
  },
  async saveResume(resumeData: Partial<ResumeData>): Promise<ResumeData> {
    return this.createResume(resumeData);
  },
  async getResumes(): Promise<ResumeData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/resume`, {
        headers: getAuthHeader(),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("❌ Resumes fetch failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(
          data?.message || `Failed to fetch resumes (${response.status})`
        );
      }
      console.log("✅ Resumes fetched successfully:", data);
      return data.resumes || data.data || data || [];
    } catch (error) {
      console.error("❌ Error fetching resumes:", error);
      throw new Error(getErrorMessage(error));
    }
  },
  async getResume(resumeId?: string): Promise<ResumeData | null> {
    try {
      const url = resumeId
        ? `${API_BASE_URL}/resume/${resumeId}`
        : `${API_BASE_URL}/resume`;
      const response = await fetch(url, {
        headers: getAuthHeader(),
      });
      if (response.status === 404) {
        return null;
      }
      const data = await response.json();
      if (!response.ok) {
        console.error("❌ Resume fetch failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(
          data?.message || `Failed to fetch resume (${response.status})`
        );
      }
      return data.data;
    } catch (error) {
      console.error("❌ Error fetching resume:", error);
      throw new Error(getErrorMessage(error));
    }
  },
  async updateResume(updates: Partial<ResumeData>): Promise<ResumeData> {
    try {
      const cleanedUpdates = cleanResumeData(updates);
      console.log("🔍 Updating resume with:", cleanedUpdates);
      const response = await fetch(`${API_BASE_URL}/resume`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(cleanedUpdates),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("❌ Resume update failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        if (response.status === 400 && data?.errors) {
          let validationMessage = "Validation failed:\n";
          if (Array.isArray(data.errors)) {
            validationMessage += data.errors
              .map(
                (error: any, index: number) =>
                  `${index + 1}. ${formatValidationError(error)}`
              )
              .join("\n");
          } else {
            validationMessage += formatValidationError(data.errors);
          }
          throw new Error(validationMessage);
        }
        throw new Error(
          data?.message || `Failed to update resume (${response.status})`
        );
      }
      return data.data;
    } catch (error) {
      console.error("❌ Error updating resume:", error);
      throw new Error(getErrorMessage(error));
    }
  },
  async deleteResume(
    resumeId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const url = resumeId
        ? `${API_BASE_URL}/resume/${resumeId}`
        : `${API_BASE_URL}/resume`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error("❌ Resume delete failed:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
        });
        throw new Error(
          data?.message || `Failed to delete resume (${response.status})`
        );
      }
      return {
        success: true,
        message: data.message || "Resume deleted successfully",
      };
    } catch (error) {
      console.error("❌ Error deleting resume:", error);
      throw new Error(getErrorMessage(error));
    }
  },
  async exportResume(resumeId?: string, filename?: string): Promise<void> {
    try {
      const url = resumeId
        ? `${API_BASE_URL}/resume/export/${resumeId}`
        : `${API_BASE_URL}/resume/export`;
      console.log("🔍 PDF Export URL:", url);
      console.log("🔍 Resume ID for export:", resumeId);
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("❌ Resume export failed:", {
          status: response.status,
          statusText: response.statusText,
          error,
        });
        throw new Error(
          error.message || `Failed to export resume (${response.status})`
        );
      }
      const blob = await response.blob();
      console.log("🔍 PDF Blob received:", {
        size: blob.size,
        type: blob.type,
      });
      if (blob.size === 0) {
        throw new Error("Received empty PDF file from server");
      }
      let finalBlob = blob;
      if (blob.type !== "application/pdf" && !blob.type.includes("pdf")) {
        console.warn("⚠️ Warning: Blob type is not PDF:", blob.type);
        const clonedBlob = blob.slice();
        const text = await clonedBlob.text();
        console.log(
          "🔍 Blob content (first 500 chars):",
          text.substring(0, 500)
        );
        if (
          text.includes("error") ||
          text.includes("Error") ||
          text.includes("<!DOCTYPE")
        ) {
          throw new Error(
            `Server returned error instead of PDF: ${text.substring(0, 200)}`
          );
        }
      }
      console.log("✅ PDF blob appears valid, proceeding with download...");
      const arrayBuffer = await finalBlob.slice(0, 10).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const pdfHeader = String.fromCharCode(...bytes.slice(0, 4));
      console.log("🔍 PDF Header check:", pdfHeader, "Expected: %PDF");
      if (pdfHeader !== "%PDF") {
        console.error("❌ Invalid PDF header detected");
        const fullText = await finalBlob.text();
        console.log(
          "🔍 Non-PDF content received:",
          fullText.substring(0, 1000)
        );
        try {
          const parsedData = JSON.parse(fullText);
          if (
            typeof parsedData === "object" &&
            parsedData !== null &&
            typeof parsedData["0"] === "number"
          ) {
            console.log(
              "🔧 Detected JSON-stringified buffer, attempting to reconstruct..."
            );
            const byteArray = new Uint8Array(Object.keys(parsedData).length);
            Object.keys(parsedData).forEach((key) => {
              byteArray[parseInt(key)] = parsedData[key];
            });
            finalBlob = new Blob([byteArray], { type: "application/pdf" });
            console.log("✅ Successfully reconstructed PDF from JSON data");
          } else {
            throw new Error(
              `Invalid PDF file received. Content starts with: ${fullText.substring(
                0,
                100
              )}`
            );
          }
        } catch (parseError) {
          throw new Error(
            `Invalid PDF file received. Content starts with: ${fullText.substring(
              0,
              100
            )}`
          );
        }
      }
      const downloadUrl = window.URL.createObjectURL(finalBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || `resume-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("❌ Error exporting resume:", error);
      throw new Error(getErrorMessage(error));
    }
  },
  async getResumeBlob(resumeId?: string): Promise<Blob> {
    try {
      const url = resumeId
        ? `${API_BASE_URL}/resume/export/${resumeId}`
        : `${API_BASE_URL}/resume/export`;
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("❌ Resume export failed:", {
          status: response.status,
          statusText: response.statusText,
          error,
        });
        throw new Error(
          error.message || `Failed to export resume (${response.status})`
        );
      }
      return await response.blob();
    } catch (error) {
      console.error("❌ Error getting resume blob:", error);
      throw new Error(getErrorMessage(error));
    }
  },
};
