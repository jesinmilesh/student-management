/**
 * Standard API Response Utilities
 */

const sendSuccess = (res, statusCode = 200, message = 'Operation successful', data = null) => {
  const payload = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (res, statusCode = 400, message = 'An error occurred', errors = null) => {
  const payload = {
    success: false,
    message
  };

  if (errors !== null && errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError
};
