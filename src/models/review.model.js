import mongoose from "mongoose";
import { Book } from "./book.model.js";
import { APIError } from "../utils/APIError.js";

const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

reviewSchema.pre("save", async function (next) {
  try {
    const book = await Book.findById(this.book);
    if (!book) {
      return next(new APIError(400, "Book does not exist."));
    }
    next();
  } catch (error) {
    next(new APIError(500, "Internal Server Error"));
  }
});

export const Review = model("Review", reviewSchema);
