const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const eventRoutes = require('./eventRoutes');
const busRoutes = require('./busRoutes');
const bookingRoutes = require('./bookingRoutes');
const courierRoutes = require('./courierRoutes');

// Mount module routes
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/events', eventRoutes);
router.use('/buses', busRoutes);
router.use('/bookings', bookingRoutes);
router.use('/couriers', courierRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is operational and healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
