const mongoose = require('mongoose');

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, 'Bus number is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    operator: {
      type: String,
      required: [true, 'Operator name is required'],
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
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
      trim: true
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required'],
      trim: true
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1']
    },
    availableSeats: {
      type: Number,
      required: [true, 'Available seats is required'],
      min: [0, 'Available seats cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

const Bus = mongoose.model('Bus', busSchema, 'buses');

module.exports = Bus;
