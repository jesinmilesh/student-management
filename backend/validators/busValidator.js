const { body, param } = require('express-validator');
const validate = require('./validate');

const createBusValidator = [
  body('busNumber')
    .trim()
    .notEmpty()
    .withMessage('Bus number is required')
    .toUpperCase(),
  body('operator')
    .trim()
    .notEmpty()
    .withMessage('Operator is required'),
  body('source')
    .trim()
    .notEmpty()
    .withMessage('Source location is required'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination location is required'),
  body('departureTime')
    .trim()
    .notEmpty()
    .withMessage('Departure time is required'),
  body('arrivalTime')
    .trim()
    .notEmpty()
    .withMessage('Arrival time is required'),
  body('totalSeats')
    .notEmpty()
    .withMessage('Total seats is required')
    .isInt({ min: 1 })
    .withMessage('Total seats must be at least 1'),
  body('availableSeats')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available seats must be a non-negative integer'),
  validate
];

const updateBusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid bus ID is required in URL parameter'),
  body('busNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Bus number cannot be empty')
    .toUpperCase(),
  body('operator')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Operator cannot be empty'),
  body('source')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Source cannot be empty'),
  body('destination')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Destination cannot be empty'),
  body('departureTime')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Departure time cannot be empty'),
  body('arrivalTime')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Arrival time cannot be empty'),
  body('totalSeats')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total seats must be at least 1'),
  body('availableSeats')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available seats cannot be negative'),
  validate
];

const busIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid bus ID is required in URL parameter'),
  validate
];

const createBookingValidator = [
  body('busId')
    .notEmpty()
    .withMessage('Bus ID is required')
    .isMongoId()
    .withMessage('Valid Bus Mongo ID is required'),
  body('seatNumber')
    .notEmpty()
    .withMessage('Seat number is required')
    .isInt({ min: 1 })
    .withMessage('Seat number must be an integer of at least 1'),
  body('passengerName')
    .trim()
    .notEmpty()
    .withMessage('Passenger name is required'),
  body('travelDate')
    .trim()
    .notEmpty()
    .withMessage('Travel date is required (YYYY-MM-DD)'),
  validate
];

const bookingIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid booking ID is required in URL parameter'),
  validate
];

module.exports = {
  createBusValidator,
  updateBusValidator,
  busIdParamValidator,
  createBookingValidator,
  bookingIdParamValidator
};
