const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const {
  createEventValidator,
  updateEventValidator,
  eventIdParamValidator
} = require('../validators/eventValidator');
const { authenticate, authorize } = require('../middleware/auth');

// Public or authenticated reading
router.get('/', eventController.getEvents);
router.get('/:id', eventIdParamValidator, eventController.getEventById);

// Admin-only event management
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createEventValidator,
  eventController.createEvent
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateEventValidator,
  eventController.updateEvent
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  eventIdParamValidator,
  eventController.deleteEvent
);

// Event registration endpoints (Authenticated users)
router.post(
  '/:id/register',
  authenticate,
  eventIdParamValidator,
  eventController.registerForEvent
);

router.delete(
  '/:id/register',
  authenticate,
  eventIdParamValidator,
  eventController.cancelEventRegistration
);

router.get(
  '/:id/registrations',
  authenticate,
  eventIdParamValidator,
  eventController.getEventRegistrations
);

module.exports = router;
