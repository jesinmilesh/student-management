const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      unique: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: [true, 'Bus ID is required']
    },
    seatNumber: {
      type: Number,
      required: [true, 'Seat number is required'],
      min: [1, 'Seat number must be at least 1']
    },
    passengerName: {
      type: String,
      required: [true, 'Passenger name is required'],
      trim: true
    },
    travelDate: {
      type: String,
      required: [true, 'Travel date is required (YYYY-MM-DD)'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled'],
      default: 'Confirmed'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate seat booking for the same bus and date when status is Confirmed
bookingSchema.index(
  { busId: 1, travelDate: 1, seatNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'Confirmed' }
  }
);

const Booking = mongoose.model('Booking', bookingSchema, 'bookings');

module.exports = Booking;
