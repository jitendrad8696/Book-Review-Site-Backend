import { check, body, validationResult } from "express-validator";
import { APIError } from "../utils/APIError.js";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new APIError(400, "Validation failed", errors.array()));
  }
  next();
};

const passwordValidation = [
  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/)
    .withMessage(
      "Password must include one special character, one lowercase letter, one uppercase letter, and one numeric value."
    ),
];

export const validateRegisterUser = [
  check("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  check("firstName")
    .isLength({ min: 3, max: 20 })
    .withMessage("First name should be 3-20 characters long."),
  check("lastName")
    .optional()
    .isLength({ max: 20 })
    .withMessage("Last name should not exceed 20 characters."),
  ...passwordValidation,
  validateRequest,
];

export const validateLoginUser = [
  check("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  check("password").notEmpty().withMessage("Password is required."),
  validateRequest,
];

export const validateForgotPassword = [
  check("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  validateRequest,
];

export const validateResetPassword = [
  check("email")
    .isEmail()
    .withMessage("Valid email is required.")
    .normalizeEmail(),
  check("oldPassword").notEmpty().withMessage("Old password is required."),
  check("newPassword")
    .isLength({ min: 8 })
    .withMessage("New Password must be at least 8 characters long.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)/)
    .withMessage(
      "New Password must include one special character, one lowercase letter, one uppercase letter, and one numeric value."
    ),
  validateRequest,
];

const bookValidation = [
  body("title").notEmpty().withMessage("Title is required"),
  body("author").notEmpty().withMessage("Author is required"),
  body("genre").notEmpty().withMessage("Genre is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("publishedYear")
    .isInt({ min: 0 })
    .withMessage("Published Year must be a positive integer"),
];

export const validateAddBook = [...bookValidation, validateRequest];

export const validateEditBook = [...bookValidation, validateRequest];

export const reviewValidationRules = [
  check("bookId").isMongoId().withMessage("Invalid book ID"),
  check("reviewText")
    .isLength({ min: 1 })
    .withMessage("Review content is required"),
  check("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  validateRequest,
];

export const editReviewValidationRules = [
  check("reviewText")
    .optional()
    .isLength({ min: 1 })
    .withMessage("Review content is required"),
  check("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  validateRequest,
];
