const mongoose = require('mongoose');

const COURIER_STATUSES = [
  'Booked',
  'Picked Up',
  'In Transit',
  'Reached Hub',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
];

const courierSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: [true, 'Tracking ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    senderName: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true
    },
    senderPhone: {
      type: String,
      required: [true, 'Sender phone is required'],
      trim: true
    },
    receiverName: {
      type: String,
      required: [true, 'Receiver name is required'],
      trim: true
    },
    receiverPhone: {
      type: String,
      required: [true, 'Receiver phone is required'],
      trim: true
    },
    source: {
      type: String,
      required: [true, 'Source location is required'],
      trim: true
    },
    destination: {
      type: String,
      required: [true, 'Destination location is required'],
      trim: true
    },
    packageDescription: {
      type: String,
      required: [true, 'Package description is required'],
      trim: true
    },
    status: {
      type: String,
      enum: COURIER_STATUSES,
      default: 'Booked'
    }
  },
  {
    timestamps: true
  }
);

const Courier = mongoose.model('Courier', courierSchema, 'couriers');

module.exports = {
  Courier,
  COURIER_STATUSES
};
