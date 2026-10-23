const { sendError } = require('../utils/apiResponse');

/**
 * 404 Route Not Found Handler
 */
const notFound = (req, res) => {
  return sendError(res, 404, `API route not found: ${req.method} ${req.originalUrl}`);
};

module.exports = notFound;
