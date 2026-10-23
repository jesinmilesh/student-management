const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const {
  createStudentValidator,
  updateStudentValidator,
  studentIdParamValidator
} = require('../validators/studentValidator');
const { authenticate, authorize } = require('../middleware/auth');

// Public or authenticated reading
router.get('/', authenticate, studentController.getStudents);
router.get('/:id', authenticate, studentIdParamValidator, studentController.getStudentById);

// Admin-only operations
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createStudentValidator,
  studentController.createStudent
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateStudentValidator,
  studentController.updateStudent
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  studentIdParamValidator,
  studentController.deleteStudent
);

module.exports = router;
