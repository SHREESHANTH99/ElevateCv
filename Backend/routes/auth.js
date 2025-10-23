const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { verifyFirebaseToken } = require("../config/firebase");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};
const getUserData = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    email: user.email,
    profile: user.profile || {},
    subscription: user.subscription || { plan: "free", status: "active" },
    preferences: user.preferences || { theme: "light", notifications: true },
  };
};
router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[0-9]/)
      .withMessage("Password must contain a number")
      .matches(/[a-z]/)
      .withMessage("Password must contain a lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain an uppercase letter"),
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ max: 50 })
      .withMessage("First name cannot exceed 50 characters"),
    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ max: 50 })
      .withMessage("Last name cannot exceed 50 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }
      const { email, password, firstName, lastName } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      console.log("Creating new user with email:", email);
      console.log("Password length:", password ? password.length : 0);
      const user = new User({
        email,
        password,
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
        subscription: {
          plan: "free",
          status: "active",
        },
        preferences: {
          theme: "light",
          notifications: {
            email: true,
            push: true,
          },
        },
      });
      console.log("Saving user to database...");
      try {
        await user.save();
        console.log("User saved successfully");
        console.log("User document from DB:", JSON.stringify(user, null, 2));
      } catch (saveError) {
        console.error("Error saving user:", saveError);
        if (saveError.name === "ValidationError") {
          console.error("Validation errors:", saveError.errors);
        }
        throw saveError;
      }
      const token = generateToken(user._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: getUserData(user),
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);
      const user = await User.findOne({ email }).select("+password");
      console.log("User found:", user ? "Yes" : "No");
      if (!user) {
        console.log("No user found with email:", email);
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
          error: "User not found",
        });
      }
      console.log("Comparing password...");
      const isMatch = await user.comparePassword(password);
      console.log("Password match:", isMatch);
      if (!isMatch) {
        console.log("Password does not match");
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
          error: "Incorrect password",
        });
      }
      const token = generateToken(user._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      const userData = getUserData(user);
      res.json({
        success: true,
        message: "Login successful",
        token,
        user: userData,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during login",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      user: getUserData(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { firstName, lastName, fullName, website, socialLinks } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (fullName !== undefined) user.profile.fullName = fullName;
    if (website !== undefined) user.profile.website = website;
    if (socialLinks !== undefined) user.profile.socialLinks = socialLinks;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: getUserData(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Upload profile image
router.post("/upload", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert file to base64 for simple storage
    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    user.profile.avatar = base64Image;
    await user.save();

    res.json({
      success: true,
      message: "Profile image uploaded successfully",
      user: getUserData(user),
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
router.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
router.post("/firebase-login", async (req, res) => {
  try {
    const { token, firebaseUser } = req.body;
    if (!token || !firebaseUser) {
      return res.status(400).json({
        success: false,
        message: "Firebase token and user data are required",
      });
    }
    const decodedToken = await verifyFirebaseToken(token);
    if (decodedToken.uid !== firebaseUser.id) {
      return res.status(400).json({
        success: false,
        message: "Token UID does not match user ID",
      });
    }
    let user = await User.findOne({
      $or: [
        { email: firebaseUser.email },
        { "firebase.uid": decodedToken.uid },
      ],
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
        requiresRegistration: true,
      });
    }
    if (!user.firebase || user.firebase.uid !== decodedToken.uid) {
      user.firebase = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      await user.save();
    }
    const appToken = generateToken(user._id);
    res.json({
      success: true,
      message: "Firebase login successful",
      token: appToken,
      user: getUserData(user),
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    res.status(500).json({
      success: false,
      message: "Firebase authentication failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
router.post("/firebase-register", async (req, res) => {
  try {
    const { token, firebaseUser } = req.body;
    if (!token || !firebaseUser) {
      return res.status(400).json({
        success: false,
        message: "Firebase token and user data are required",
      });
    }
    const decodedToken = await verifyFirebaseToken(token);
    if (decodedToken.uid !== firebaseUser.id) {
      return res.status(400).json({
        success: false,
        message: "Token UID does not match user ID",
      });
    }
    const existingUser = await User.findOne({
      $or: [
        { email: firebaseUser.email },
        { "firebase.uid": decodedToken.uid },
      ],
    });
    if (existingUser) {
      const appToken = generateToken(existingUser._id);
      return res.json({
        success: true,
        message: "User already exists, logged in successfully",
        token: appToken,
        user: getUserData(existingUser),
      });
    }
    const user = new User({
      email: firebaseUser.email,
      profile: {
        firstName: firebaseUser.profile.firstName || "",
        lastName: firebaseUser.profile.lastName || "",
        fullName: firebaseUser.profile.fullName || "",
        avatar: firebaseUser.profile.avatar,
      },
      firebase: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
      subscription: {
        plan: "free",
        status: "active",
      },
      preferences: {
        theme: "light",
        notifications: {
          email: true,
          push: true,
        },
      },
    });
    await user.save();
    const appToken = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: "Firebase registration successful",
      token: appToken,
      user: getUserData(user),
    });
  } catch (error) {
    console.error("Firebase registration error:", error);
    res.status(500).json({
      success: false,
      message: "Firebase registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
module.exports = router;
