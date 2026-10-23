const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');
const {
  createBusValidator,
  updateBusValidator,
  busIdParamValidator
} = require('../validators/busValidator');
const { authenticate, authorize } = require('../middleware/auth');

// Public or authenticated reading
router.get('/', busController.getBuses);
router.get('/:id', busIdParamValidator, busController.getBusById);

// Admin-only bus management
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createBusValidator,
  busController.createBus
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  updateBusValidator,
  busController.updateBus
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  busIdParamValidator,
  busController.deleteBus
);

module.exports = router;
