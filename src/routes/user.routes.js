import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUser,
} from "../controllers/user.controllers.js";

import {
  validateRegisterUser,
  validateLoginUser,
  validateForgotPassword,
  validateResetPassword,
} from "../middlewares/validation.middleware.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";

const router = express.Router();

router.post("/register", validateRegisterUser, registerUser);

router.post("/login", validateLoginUser, loginUser);

router.post("/logout", logoutUser);

router.post("/forgot-password", validateForgotPassword, forgotPassword);

router.put("/reset-password", validateResetPassword, resetPassword);

// Authenticated Route
router.get("/user", verifyToken, getUser);

// TEMP
router.get("/get-all-users", async (req, res, next) => {
  try {
    const { limit = 1000, offset = 0 } = req.query;

    const users = await User.find({})
      .select("-password")
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res
      .status(200)
      .json(
        new APIResponse(200, "Users fetched successfully", { total, users })
      );
  } catch (error) {
    console.error("Error fetching users:", error);
    next(new APIError(500, "Error fetching users", error.message));
  }
});

export default router;
