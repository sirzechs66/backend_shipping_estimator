class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Async wrapper to forward errors to Express error handler.
 */
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, "NOT_FOUND"));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({
    error: code,
    message,
  });
}

module.exports = { AppError, asyncHandler, notFound, errorHandler };