import { Book } from "../models/book.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const addBook = async (req, res, next) => {
  try {
    const { title, author, genre, description, publishedYear } = req.body;

    if (!req.file) {
      return next(new APIError(400, "Image is required"));
    }

    const image = await uploadOnCloudinary(req.file.path);

    if (!image) {
      return next(new APIError(500, "Error uploading image"));
    }

    const newBook = new Book({
      title,
      author,
      genre,
      description,
      publishedYear,
      image: image.secure_url,
    });

    await newBook.save();

    res
      .status(201)
      .json(new APIResponse(201, "Book added successfully", newBook));
  } catch (error) {
    console.error("Error adding book:", error);
    next(new APIError(500, "Error adding book"));
  }
};

export const editBook = async (req, res, next) => {
  try {
    const { title, author, genre, description, publishedYear } = req.body;
    let imageUrl = undefined;

    if (req.file) {
      const uploadedImage = await uploadOnCloudinary(req.file.path);
      imageUrl = uploadedImage?.secure_url;
    }

    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return next(new APIError(404, "Book not found"));
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        genre,
        description,
        publishedYear,
        image: imageUrl || existingBook.image,
      },
      { new: true }
    );

    res
      .status(200)
      .json(new APIResponse(200, "Book updated successfully", updatedBook));
  } catch (error) {
    console.error("Error updating book:", error);
    next(new APIError(500, "Error updating book"));
  }
};

export const getAllBooks = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0, search = "" } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ],
      };
    }

    const books = await Book.aggregate([
      { $match: query },
      { $skip: parseInt(offset) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "book",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: {
            $avg: "$reviews.rating",
          },
        },
      },
      {
        $project: {
          title: 1,
          author: 1,
          genre: 1,
          description: 1,
          publishedYear: 1,
          image: 1,
          averageRating: { $ifNull: ["$averageRating", "N/A"] },
        },
      },
    ]);

    const totalBooks = await Book.countDocuments(query);

    res.status(200).json(
      new APIResponse(200, "Books fetched successfully", {
        books,
        totalBooks,
        limit: parseInt(limit),
        offset: parseInt(offset),
      })
    );
  } catch (error) {
    console.error("Error fetching books:", error);
    next(new APIError(500, "Error fetching books"));
  }
};

export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return next(new APIError(404, "Book not found"));
    }
    res
      .status(200)
      .json(new APIResponse(200, "Book fetched successfully", book));
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    next(new APIError(500, "Error fetching book by ID"));
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      return next(new APIError(404, "Book not found"));
    }
    res
      .status(200)
      .json(new APIResponse(200, "Book deleted successfully", deletedBook));
  } catch (error) {
    console.error("Error deleting book:", error);
    next(new APIError(500, "Error deleting book"));
  }
};
