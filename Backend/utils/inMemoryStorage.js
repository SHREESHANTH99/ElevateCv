class InMemoryStorage {
  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.resumeVersions = new Map();
    this.nextUserId = 1;
    this.nextResumeId = 1;
    this.nextVersionId = 1;
  }

  async createUser(userData) {
    const user = {
      _id: this.nextUserId.toString(),
      email: userData.email || "",
      password: userData.password || "",
      profile: {
        firstName: userData.profile?.firstName || "",
        lastName: userData.profile?.lastName || "",
        avatar: userData.profile?.avatar || "",
      },
      subscription: {
        type: "free",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      preferences: {
        theme: "light",
        notifications: {
          email: true,
          push: false,
        },
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      ...userData,
    };
    this.users.set(user._id, user);
    this.nextUserId++;
    return user;
  }

  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id?.toString()) || null;
  }

  async updateUser(id, updateData) {
    const user = this.users.get(id?.toString());
    if (!user) return null;
    const updatedUser = { ...user, ...updateData };
    this.users.set(id?.toString(), updatedUser);
    return updatedUser;
  }

  async createResume(resumeData) {
    const resume = {
      _id: this.nextResumeId.toString(),
      userId: resumeData.userId?.toString() || "",
      title: resumeData.title || "Untitled Resume",
      personalInfo: resumeData.personalInfo || {},
      summary: resumeData.summary || "",
      experiences: resumeData.experiences || [],
      education: resumeData.education || [],
      skills: resumeData.skills || [],
      projects: resumeData.projects || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      ...resumeData,
    };
    this.resumes.set(resume._id, resume);
    this.nextResumeId++;
    return resume;
  }

  async findResumesByUserId(userId) {
    const userResumes = [];
    const uid = userId?.toString();
    for (const resume of this.resumes.values()) {
      if (resume.userId === uid) {
        userResumes.push(resume);
      }
    }
    return userResumes;
  }

  async findResumeById(id) {
    return this.resumes.get(id?.toString()) || null;
  }

  async updateResume(id, updateData) {
    const resume = this.resumes.get(id?.toString());
    if (!resume) return null;
    const updatedResume = {
      ...resume,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    this.resumes.set(id?.toString(), updatedResume);
    return updatedResume;
  }

  async deleteResume(id) {
    return this.resumes.delete(id?.toString());
  }

  async createResumeVersion(versionData) {
    const version = {
      _id: this.nextVersionId.toString(),
      resumeId: versionData.resumeId?.toString() || "",
      userId: versionData.userId?.toString() || "",
      versionNumber: versionData.versionNumber || 1,
      label: versionData.label || "Snapshot",
      snapshotData: versionData.snapshotData || {},
      atsScore: versionData.atsScore || 0,
      dimensionScores: versionData.dimensionScores || {},
      createdAt: new Date().toISOString(),
      ...versionData,
    };
    this.resumeVersions.set(version._id, version);
    this.nextVersionId++;
    return version;
  }

  async findResumeVersionsByResumeId(resumeId, userId) {
    const rid = resumeId?.toString();
    const uid = userId?.toString();
    const versions = [];
    for (const ver of this.resumeVersions.values()) {
      if (ver.resumeId === rid && ver.userId === uid) {
        versions.push(ver);
      }
    }
    return versions.sort((a, b) => b.versionNumber - a.versionNumber);
  }

  async findResumeVersionByIdOrNumber(val, resumeId, userId) {
    const rid = resumeId?.toString();
    const uid = userId?.toString();
    const num = parseInt(val, 10);
    for (const ver of this.resumeVersions.values()) {
      if (ver.resumeId === rid && ver.userId === uid) {
        if (ver._id === val?.toString() || (!isNaN(num) && ver.versionNumber === num)) {
          return ver;
        }
      }
    }
    return null;
  }

  async createApplication(appData) {
    const app = {
      _id: (this.nextAppId || 1).toString(),
      userId: appData.userId?.toString() || "",
      company: appData.company || "",
      role: appData.role || "",
      jobDescription: appData.jobDescription || "",
      status: appData.status || "Bookmarked",
      resumeVersionId: appData.resumeVersionId || null,
      resumeVersionLabel: appData.resumeVersionLabel || "",
      notes: appData.notes || "",
      salary: appData.salary || "",
      location: appData.location || "",
      url: appData.url || "",
      appliedDate: appData.appliedDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...appData,
    };
    if (!this.applications) this.applications = new Map();
    this.nextAppId = (this.nextAppId || 1) + 1;
    this.applications.set(app._id, app);
    return app;
  }

  async findApplicationsByUserId(userId, status) {
    if (!this.applications) this.applications = new Map();
    const uid = userId?.toString();
    const list = [];
    for (const app of this.applications.values()) {
      if (app.userId === uid) {
        if (!status || app.status === status) {
          list.push(app);
        }
      }
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async findApplicationById(id, userId) {
    if (!this.applications) this.applications = new Map();
    const app = this.applications.get(id?.toString());
    if (app && app.userId === userId?.toString()) return app;
    return null;
  }

  async updateApplication(id, userId, updateData) {
    if (!this.applications) this.applications = new Map();
    const app = this.applications.get(id?.toString());
    if (!app || app.userId !== userId?.toString()) return null;
    const updated = {
      ...app,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    this.applications.set(id?.toString(), updated);
    return updated;
  }

  async deleteApplication(id, userId) {
    if (!this.applications) this.applications = new Map();
    const app = this.applications.get(id?.toString());
    if (!app || app.userId !== userId?.toString()) return false;
    return this.applications.delete(id?.toString());
  }

  async generateToken(userId) {
    return `demo-token-${userId}-${Date.now()}`;
  }

  async verifyToken(token) {
    const parts = token.split("-");
    if (parts.length >= 3 && parts[0] === "demo" && parts[1] === "token") {
      const userId = parts[2];
      return this.findUserById(userId);
    }
    return null;
  }
}

const inMemoryStorage = new InMemoryStorage();
module.exports = inMemoryStorage;