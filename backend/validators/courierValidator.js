const { body, param } = require('express-validator');
const validate = require('./validate');
const { COURIER_STATUSES } = require('../models/Courier');

const createCourierValidator = [
  body('senderName')
    .trim()
    .notEmpty()
    .withMessage('Sender name is required'),
  body('senderPhone')
    .trim()
    .notEmpty()
    .withMessage('Sender phone is required'),
  body('receiverName')
    .trim()
    .notEmpty()
    .withMessage('Receiver name is required'),
  body('receiverPhone')
    .trim()
    .notEmpty()
    .withMessage('Receiver phone is required'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Source location is required'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination location is required'),
  body('packageDescription')
    .trim()
    .notEmpty()
    .withMessage('Package description is required'),
  validate
];

const updateCourierStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid courier Mongo ID is required in URL parameter'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(COURIER_STATUSES)
    .withMessage(`Status must be one of: ${COURIER_STATUSES.join(', ')}`),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Current location is required'),
  body('message')
    .optional()
    .trim(),
  validate
];

const courierIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid courier Mongo ID is required in URL parameter'),
  validate
];

const trackingIdParamValidator = [
  param('trackingId')
    .trim()
    .notEmpty()
    .withMessage('Tracking ID parameter is required')
    .toUpperCase(),
  validate
];

module.exports = {
  createCourierValidator,
  updateCourierStatusValidator,
  courierIdParamValidator,
  trackingIdParamValidator
};
