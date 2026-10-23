const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const {
  createBookingValidator,
  bookingIdParamValidator
} = require('../validators/busValidator');
const { authenticate } = require('../middleware/auth');

// All booking routes require authentication
router.use(authenticate);

router.post('/', createBookingValidator, busController.createBooking);
router.get('/', busController.getBookings);
router.get('/:id', bookingIdParamValidator, busController.getBookingById);
router.delete('/:id', bookingIdParamValidator, busController.cancelBooking);

module.exports = router;
