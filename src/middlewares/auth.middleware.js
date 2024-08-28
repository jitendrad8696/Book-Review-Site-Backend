import jwt from "jsonwebtoken";

import { APIError } from "../utils/APIError.js";
import { ACCESS_TOKEN_JWT } from "../config/index.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers.Authorization;
  const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);

  if (!token) {
    return next(new APIError(401, "No token provided."));
  }

  jwt.verify(token, ACCESS_TOKEN_JWT, (error, decoded) => {
    if (error) {
      console.error("Token verification error:", error.message);
      return next(new APIError(401, "Invalid token."));
    }

    req._id = decoded._id;
    req.userType = decoded.userType;
    next();
  });
};
