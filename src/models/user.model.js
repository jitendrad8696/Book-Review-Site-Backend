import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_JWT } from "../config/index.js";
import { APIError } from "../utils/APIError.js";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
  } catch (error) {
    next(new APIError(500, "Error encrypting password"));
  }
});

userSchema.methods.isPasswordValid = async function (password) {
  try {
    return bcrypt.compareSync(password, this.password);
  } catch (error) {
    throw new APIError(500, "Error comparing passwords");
  }
};

userSchema.methods.genAccessToken = function () {
  try {
    return jwt.sign(
      { _id: this._id, userType: this.userType },
      ACCESS_TOKEN_JWT,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  } catch (error) {
    throw new APIError(500, "Error generating access token");
  }
};

export const User = model("User", userSchema);
