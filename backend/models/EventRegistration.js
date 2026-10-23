const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate registration: a user cannot register twice for the same event
eventRegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

const EventRegistration = mongoose.model(
  'EventRegistration',
  eventRegistrationSchema,
  'event_registrations'
);

module.exports = EventRegistration;
