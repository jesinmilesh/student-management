const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware that inspects express-validator results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return sendError(
      res,
      400,
      `Validation error: ${formattedErrors.map((e) => e.message).join('; ')}`,
      formattedErrors
    );
  }
  next();
};

module.exports = validate;
