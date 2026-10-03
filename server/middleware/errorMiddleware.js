exports.errorHandler = (err, req, res, next) => {

  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // MongoDB Invalid ID
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // MongoDB Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  // JWT Invalid
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // JWT Expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};