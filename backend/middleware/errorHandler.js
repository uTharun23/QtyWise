import config from '../config/serverConfig.js';

/**
 * Centralized error handler middleware.
 * Formats errors uniformly and prevents stack trace leak in production.
 */
export default function errorHandler(err, req, res, next) {
  console.error('[ErrorHandler] Express caught unhandled error:', err);

  const statusCode = err.status || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  
  // Mask internal database or runtime server details in production environments
  const cleanMessage = config.env === 'production' && statusCode === 500
    ? 'An unexpected system error occurred. Please try again later.'
    : err.message || 'Internal System Error';

  res.status(statusCode).json({
    status: 'error',
    code: errorCode,
    message: cleanMessage,
    ...(config.env === 'development' && { stack: err.stack })
  });
}
