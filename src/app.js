import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { CORS_ORIGIN } from "./config/index.js";
import { APIError } from "./utils/APIError.js";

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

//Import routes
import userRoutes from "./routes/user.routes.js";
import bookRoutes from "./routes/book.routes.js";
import reviewRoutes from "./routes/review.routes.js";

//Routes

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/books", bookRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// Handle 404 errors
app.use((req, res, next) => {
  next(new APIError(404, "Route not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof APIError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      details: err.details || null,
    });
  } else {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
      details: err,
    });
  }
});

export { app };
