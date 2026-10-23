const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courierController');
const {
  createCourierValidator,
  updateCourierStatusValidator,
  courierIdParamValidator,
  trackingIdParamValidator
} = require('../validators/courierValidator');
const { authenticate, authorize } = require('../middleware/auth');

// Public tracking by tracking ID (allows customer tracking)
router.get('/track/:trackingId', trackingIdParamValidator, courierController.getCourierByTrackingId);

// View list of all couriers (Authenticated)
router.get('/', authenticate, courierController.getCouriers);

// Create shipment (Authenticated)
router.post('/', authenticate, createCourierValidator, courierController.createCourier);

// View shipment details by tracking ID or Mongo ID
router.get('/:trackingId', trackingIdParamValidator, courierController.getCourierByTrackingId);

// Update delivery status (Authenticated, staff/admin)
router.put(
  '/:id/status',
  authenticate,
  updateCourierStatusValidator,
  courierController.updateCourierStatus
);

// View tracking history
router.get('/:id/history', courierIdParamValidator, courierController.getTrackingHistory);

// Delete shipment (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  courierIdParamValidator,
  courierController.deleteCourier
);

module.exports = router;
