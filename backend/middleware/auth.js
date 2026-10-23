const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/apiResponse');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Validates Bearer JWT in Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No authentication token provided.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 401, 'Access denied. Token missing.');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'Invalid authentication token: user no longer exists.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Authentication token has expired.');
    }
    return sendError(res, 401, 'Invalid authentication token.');
  }
};

/**
 * Role-based Authorization Middleware
 * @param  {...string} roles Allowed roles (e.g., 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'User not authenticated.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, `Access forbidden. Required role: ${roles.join(' or ')}.`);
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
