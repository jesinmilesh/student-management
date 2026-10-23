const mongoose = require('mongoose');
const { COURIER_STATUSES } = require('./Courier');

const trackingHistorySchema = new mongoose.Schema(
  {
    courierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Courier',
      required: [true, 'Courier ID is required']
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: COURIER_STATUSES
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    message: {
      type: String,
      trim: true,
      default: ''
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Index to quickly fetch courier history in chronological order
trackingHistorySchema.index({ courierId: 1, timestamp: 1 });

const TrackingHistory = mongoose.model(
  'TrackingHistory',
  trackingHistorySchema,
  'tracking_history'
);

module.exports = TrackingHistory;
