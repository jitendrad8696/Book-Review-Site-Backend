import { Review } from "../models/review.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";

const paginateBookReviews = async (model, query, limit, offset) => {
  const total = await model.countDocuments(query);
  const results = await model
    .find(query)
    .skip(offset)
    .limit(limit)
    .populate("user", "firstName lastName");

  return { total, results };
};

const paginateUserReviews = async (model, query, limit, offset) => {
  const total = await model.countDocuments(query);
  const results = await model
    .find(query)
    .skip(offset)
    .limit(limit)
    .populate("book", "title");

  return { total, results };
};

export const addReview = async (req, res, next) => {
  try {
    const { bookId, reviewText, rating } = req.body;
    const userId = req._id;

    const review = new Review({
      book: bookId,
      user: userId,
      reviewText,
      rating,
    });

    await review.save();
    res
      .status(201)
      .json(new APIResponse(201, "Review added successfully", review));
  } catch (error) {
    console.error("Error adding review:", error);
    next(new APIError(500, "Error adding review", error.message));
  }
};

export const getReviewById = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).populate(
      "book",
      "title author"
    );

    if (!review) {
      return next(new APIError(404, "Review not found."));
    }

    res
      .status(200)
      .json(new APIResponse(200, "Review fetched successfully", review));
  } catch (error) {
    console.error("Error fetching review:", error);
    next(new APIError(500, "Error fetching review", error.message));
  }
};

export const getReviewsForBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const reviewsQuery = { book: bookId };

    const { total, results } = await paginateBookReviews(
      Review,
      reviewsQuery,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json(
      new APIResponse(200, "Reviews fetched successfully", {
        total,
        reviews: results,
      })
    );
  } catch (error) {
    console.error("Error fetching reviews for book:", error);
    next(new APIError(500, "Error fetching reviews for book", error.message));
  }
};

export const editReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { reviewText, rating } = req.body;
    const userId = req._id;

    if (!reviewText && !rating) {
      return next(
        new APIError(400, "At least one field is required for update.")
      );
    }

    const review = await Review.findById(reviewId);

    if (!review) {
      return next(new APIError(404, "Review not found."));
    }

    if (review.user.toString() !== userId) {
      return next(new APIError(403, "Not authorized to edit this review."));
    }

    if (reviewText) review.reviewText = reviewText;
    if (rating) review.rating = rating;

    await review.save();

    res
      .status(200)
      .json(new APIResponse(200, "Review updated successfully", review));
  } catch (error) {
    console.error("Error editing review:", error);
    next(new APIError(500, "Error editing review", error.message));
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const userId = req._id;
    const { limit = 20, offset = 0 } = req.query;

    const reviewsQuery = { user: userId };

    const { total, results } = await paginateUserReviews(
      Review,
      reviewsQuery,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json(
      new APIResponse(200, "User reviews fetched successfully", {
        total,
        reviews: results,
      })
    );
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    next(new APIError(500, "Error fetching user reviews", error.message));
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return next(new APIError(404, "Review not found."));
    }

    if (review.user.toString() !== userId) {
      return next(new APIError(403, "Not authorized to delete this review."));
    }

    await review.remove();

    res.status(200).json(new APIResponse(200, "Review deleted successfully"));
  } catch (error) {
    console.error("Error deleting review:", error);
    next(new APIError(500, "Error deleting review", error.message));
  }
};
