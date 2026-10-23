const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Create a new event
 * POST /api/events (Admin only)
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, time, venue, organizer, capacity } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      time,
      venue,
      organizer,
      capacity
    });

    return sendSuccess(res, 201, 'Event created successfully', event);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events with remaining capacity info
 * GET /api/events
 */
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    // Fetch registration count for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const registeredCount = await EventRegistration.countDocuments({ eventId: event._id });
        const eventObj = event.toObject();
        eventObj.registeredCount = registeredCount;
        eventObj.availableSeats = Math.max(0, event.capacity - registeredCount);
        return eventObj;
      })
    );

    return sendSuccess(res, 200, 'Events fetched successfully', {
      count: eventsWithStats.length,
      events: eventsWithStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by ID
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    const registeredCount = await EventRegistration.countDocuments({ eventId: event._id });
    const eventObj = event.toObject();
    eventObj.registeredCount = registeredCount;
    eventObj.availableSeats = Math.max(0, event.capacity - registeredCount);

    return sendSuccess(res, 200, 'Event details fetched successfully', eventObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Update event
 * PUT /api/events/:id (Admin only)
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    // If capacity is being updated, verify it is not less than already registered users
    if (req.body.capacity !== undefined) {
      const currentRegistrations = await EventRegistration.countDocuments({ eventId: id });
      if (req.body.capacity < currentRegistrations) {
        return sendError(
          res,
          400,
          `Cannot reduce capacity to ${req.body.capacity}. There are already ${currentRegistrations} confirmed registrations.`
        );
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after',
      runValidators: true
    });

    return sendSuccess(res, 200, 'Event updated successfully', updatedEvent);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event
 * DELETE /api/events/:id (Admin only)
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    // Cascade delete related registrations
    await EventRegistration.deleteMany({ eventId: id });

    return sendSuccess(res, 200, 'Event and associated registrations deleted successfully', {
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register current authenticated user for an event
 * POST /api/events/:id/register
 */
const registerForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    // Check if user is already registered
    const existingRegistration = await EventRegistration.findOne({ eventId, userId });
    if (existingRegistration) {
      return sendError(res, 409, 'You are already registered for this event.');
    }

    // Check capacity
    const currentCount = await EventRegistration.countDocuments({ eventId });
    if (currentCount >= event.capacity) {
      return sendError(res, 400, 'Event registration is closed. Capacity reached.');
    }

    const registration = await EventRegistration.create({
      eventId,
      userId
    });

    const populatedRegistration = await EventRegistration.findById(registration._id)
      .populate('eventId', 'title date time venue')
      .populate('userId', 'name email');

    return sendSuccess(res, 201, 'Successfully registered for event', populatedRegistration);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel registration for an event
 * DELETE /api/events/:id/register
 */
const cancelEventRegistration = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    const registration = await EventRegistration.findOneAndDelete({ eventId, userId });
    if (!registration) {
      return sendError(res, 404, 'You do not have an active registration for this event.');
    }

    return sendSuccess(res, 200, 'Event registration cancelled successfully', {
      eventId,
      userId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View event registrations
 * GET /api/events/:id/registrations
 */
const getEventRegistrations = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return sendError(res, 404, 'Event not found.');
    }

    const registrations = await EventRegistration.find({ eventId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Event registrations fetched successfully', {
      eventId,
      eventTitle: event.title,
      capacity: event.capacity,
      totalRegistrations: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration,
  getEventRegistrations
};
