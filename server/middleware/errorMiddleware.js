/**
 * Global error handler middleware
 * Must be added LAST in server.js after all routes
 */
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('🔥 Error:', err.stack);

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
