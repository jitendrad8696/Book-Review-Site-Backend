import sendgridMail from "@sendgrid/mail";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { SENDGRID_FROM_EMAIL } from "../config/index.js";

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 86400000,
};

const clearCookiesOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

const generateRandomPassword = (length = 8) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  return Array.from(
    { length },
    () => charset[Math.floor(Math.random() * charset.length)]
  ).join("");
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    if (await User.findOne({ email })) {
      return next(new APIError(400, "Email is already in use."));
    }

    const user = await User.create({
      email,
      firstName,
      lastName,
      userType: "user",
      password,
    });

    if (!user) {
      return next(new APIError(500, "User registration failed."));
    }

    const userObj = user.toObject();
    delete userObj.password;

    const token = user.genAccessToken();
    res.cookie("token", token, cookiesOptions);
    res.status(201).json(
      new APIResponse(201, "User registered successfully", {
        user: userObj,
        token,
      })
    );
  } catch (error) {
    console.error("Error: User registration failed:", error);
    next(new APIError(500, error.message));
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError(404, "User does not exist."));
    }

    if (!(await user.isPasswordValid(password))) {
      return next(new APIError(400, "Invalid password."));
    }

    const token = user.genAccessToken();
    const userObj = user.toObject();
    delete userObj.password;

    res.cookie("token", token, cookiesOptions);
    res.status(200).json(
      new APIResponse(200, "User logged in successfully", {
        user: userObj,
        token,
      })
    );
  } catch (error) {
    console.error("Error: User login failed:", error);
    next(new APIError(500, error.message));
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError(404, "User with this email does not exist."));
    }

    const randomPassword = generateRandomPassword();
    user.password = randomPassword;
    await user.save();

    await sendgridMail.send({
      to: user.email,
      from: SENDGRID_FROM_EMAIL,
      subject: "Password Reset",
      text: `Your new password is: ${randomPassword}\nPlease change your password after logging in.`,
    });

    res.clearCookie("token", clearCookiesOptions);
    res
      .status(200)
      .json(new APIResponse(200, "Password reset email sent successfully"));
  } catch (error) {
    console.error("Error sending password reset email:", error);
    next(new APIError(500, error.message));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError(404, "User not found."));
    }

    if (!(await user.isPasswordValid(oldPassword))) {
      return next(new APIError(401, "Invalid old password."));
    }

    user.password = newPassword;
    await user.save();

    res.clearCookie("token", clearCookiesOptions);
    res.status(200).json(new APIResponse(200, "Password reset successfully."));
  } catch (error) {
    console.error("Error resetting password:", error);
    next(new APIError(500, error.message));
  }
};

export const logoutUser = (req, res, next) => {
  try {
    res.clearCookie("token", clearCookiesOptions);
    res.status(200).json(new APIResponse(200, "User logged out successfully"));
  } catch (error) {
    console.error("Error logging out user:", error);
    next(new APIError(500, error.message));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { _id } = req;

    if (!_id) {
      return next(new APIError(401, "Unauthorized access."));
    }

    const user = await User.findById(_id).select("-password");
    if (!user) {
      return next(new APIError(404, "User not found."));
    }

    res
      .status(200)
      .json(new APIResponse(200, "User fetched successfully.", user));
  } catch (error) {
    console.error("Error fetching user data:", error);
    next(new APIError(500, error.message));
  }
};
