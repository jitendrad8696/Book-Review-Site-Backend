import express from "express";

import {
  addReview,
  getReviewsForBook,
  editReview,
  getUserReviews,
  getReviewById,
} from "../controllers/review.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  editReviewValidationRules,
  reviewValidationRules,
} from "../middlewares/validation.middleware.js";
import { Review } from "../models/review.model.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";

const router = express.Router();

router.post("/review", verifyToken, reviewValidationRules, addReview);

router.put(
  "/review/:reviewId",
  verifyToken,
  editReviewValidationRules,
  editReview
);

router.get("/review/:reviewId", verifyToken, getReviewById);

router.get("/book/:bookId", verifyToken, getReviewsForBook);

router.get("/user/:userId", verifyToken, getUserReviews);

// TEMP
router.get("/get-all-reviews", async (req, res, next) => {
  try {
    const { limit = 1000, offset = 0 } = req.query;

    const reviews = await Review.find({})
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Review.countDocuments();

    res
      .status(200)
      .json(
        new APIResponse(200, "Reviews fetched successfully", { total, reviews })
      );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    next(new APIError(500, "Error fetching reviews", error.message));
  }
});

export default router;
