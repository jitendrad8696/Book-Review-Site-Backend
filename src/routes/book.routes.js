import express from "express";

import {
  addBook,
  getAllBooks,
  getBookById,
  editBook,
} from "../controllers/book.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { APIError } from "../utils/APIError.js";
import {
  validateAddBook,
  validateEditBook,
} from "../middlewares/validation.middleware.js";
import { Book } from "../models/book.model.js";
import { APIResponse } from "../utils/APIResponse.js";

const router = express.Router();

router.get("/", verifyToken, getAllBooks);
router.get("/book/:id", verifyToken, getBookById);

// Admin only
const isAdmin = (req, res, next) => {
  if (req.userType === "admin") {
    return next();
  }
  next(new APIError(403, "Access denied. Admins only."));
};

router.post(
  "/book",
  verifyToken,
  isAdmin,
  upload.single("image"),
  validateAddBook,
  addBook
);

router.put(
  "/book/:id",
  verifyToken,
  isAdmin,
  upload.single("image"),
  validateEditBook,
  editBook
);

// TEMP
router.get("/get-all-books", async (req, res, next) => {
  try {
    const { limit = 1000, offset = 0 } = req.query;

    const books = await Book.find({})
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Book.countDocuments();

    res
      .status(200)
      .json(
        new APIResponse(200, "Books fetched successfully", { total, books })
      );
  } catch (error) {
    console.error("Error fetching books:", error);
    next(new APIError(500, "Error fetching books", error.message));
  }
});

export default router;
