const { body, param } = require('express-validator');
const validate = require('./validate');

const createEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required'),
  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Event date must be a valid ISO8601 date (e.g. YYYY-MM-DD)'),
  body('time')
    .trim()
    .notEmpty()
    .withMessage('Event time is required (e.g. 10:00 AM)'),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Event venue is required'),
  body('organizer')
    .trim()
    .notEmpty()
    .withMessage('Event organizer is required'),
  body('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be an integer of at least 1'),
  validate
];

const updateEventValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid event ID is required in URL parameter'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event title cannot be empty'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event description cannot be empty'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Event date must be a valid ISO8601 date'),
  body('time')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event time cannot be empty'),
  body('venue')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event venue cannot be empty'),
  body('organizer')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Event organizer cannot be empty'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be an integer of at least 1'),
  validate
];

const eventIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid event ID is required in URL parameter'),
  validate
];

module.exports = {
  createEventValidator,
  updateEventValidator,
  eventIdParamValidator
};
