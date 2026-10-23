const { body, param } = require('express-validator');
const validate = require('./validate');

const createStudentValidator = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Student name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Year must be a positive integer'),
  body('section')
    .trim()
    .notEmpty()
    .withMessage('Section is required'),
  validate
];

const updateStudentValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid student Mongo ID is required in URL parameter'),
  body('studentId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Student ID cannot be empty'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone cannot be empty'),
  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
  body('year')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Year must be a positive integer'),
  body('section')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Section cannot be empty'),
  validate
];

const studentIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Valid student Mongo ID is required in URL parameter'),
  validate
];

module.exports = {
  createStudentValidator,
  updateStudentValidator,
  studentIdParamValidator
};
