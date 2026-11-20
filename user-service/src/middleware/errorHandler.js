const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    error.message = errors.join(', ');
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json(error);
  }

  // Supabase errors
  if (err.code && err.message) {
    return res.status(400).json({
      ...error,
      message: err.message,
      code: err.code,
    });
  }

  // Default 500 server error
  res.status(err.statusCode || 500).json(error);
};

module.exports = { errorHandler };