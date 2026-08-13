/**
 * Centralized Error Handling Middleware for Express
 */
export function errorHandler(err, req, res, next) {
  console.error('[Server Error]:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}

export default errorHandler;
