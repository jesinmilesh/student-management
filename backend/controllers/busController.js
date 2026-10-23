const Bus = require('../models/Bus');
const Booking = require('../models/Booking');
const { generateBookingId } = require('../utils/idGenerators');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Add a new bus
 * POST /api/buses (Admin only)
 */
const createBus = async (req, res, next) => {
  try {
    const {
      busNumber,
      operator,
      source,
      destination,
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats
    } = req.body;

    const existingBus = await Bus.findOne({ busNumber: busNumber.toUpperCase() });
    if (existingBus) {
      return sendError(res, 409, `Bus with number '${busNumber}' already exists.`);
    }

    const bus = await Bus.create({
      busNumber: busNumber.toUpperCase(),
      operator,
      source,
      destination,
      departureTime,
      arrivalTime,
      totalSeats,
      availableSeats: availableSeats !== undefined ? availableSeats : totalSeats
    });

    return sendSuccess(res, 201, 'Bus created successfully', bus);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all buses with search and filter
 * GET /api/buses
 */
const getBuses = async (req, res, next) => {
  try {
    const { source, destination, operator, search } = req.query;
    const filter = {};

    if (source) {
      filter.source = new RegExp(source, 'i');
    }

    if (destination) {
      filter.destination = new RegExp(destination, 'i');
    }

    if (operator) {
      filter.operator = new RegExp(operator, 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { busNumber: searchRegex },
        { operator: searchRegex },
        { source: searchRegex },
        { destination: searchRegex }
      ];
    }

    const buses = await Bus.find(filter).sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Buses fetched successfully', {
      count: buses.length,
      buses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get bus by ID with booked seats list for a given travelDate
 * GET /api/buses/:id
 */
const getBusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { travelDate } = req.query;

    const bus = await Bus.findById(id);
    if (!bus) {
      return sendError(res, 404, 'Bus not found.');
    }

    const busObj = bus.toObject();

    if (travelDate) {
      const confirmedBookings = await Booking.find({
        busId: id,
        travelDate,
        status: 'Confirmed'
      }).select('seatNumber');

      const bookedSeats = confirmedBookings.map((b) => b.seatNumber);
      busObj.bookedSeatsForDate = bookedSeats;
      busObj.availableSeatsForDate = bus.totalSeats - bookedSeats.length;
    }

    return sendSuccess(res, 200, 'Bus details fetched successfully', busObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Update bus
 * PUT /api/buses/:id (Admin only)
 */
const updateBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const bus = await Bus.findById(id);
    if (!bus) {
      return sendError(res, 404, 'Bus not found.');
    }

    if (updates.busNumber) {
      updates.busNumber = updates.busNumber.toUpperCase();
      const existing = await Bus.findOne({ busNumber: updates.busNumber, _id: { $ne: id } });
      if (existing) {
        return sendError(res, 409, `Bus with number '${updates.busNumber}' already exists.`);
      }
    }

    const updatedBus = await Bus.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true
    });

    return sendSuccess(res, 200, 'Bus updated successfully', updatedBus);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete bus
 * DELETE /api/buses/:id (Admin only)
 */
const deleteBus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bus = await Bus.findByIdAndDelete(id);
    if (!bus) {
      return sendError(res, 404, 'Bus not found.');
    }

    // Cascade delete or cancel bookings
    await Booking.deleteMany({ busId: id });

    return sendSuccess(res, 200, 'Bus and associated bookings deleted successfully', {
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Book a seat on a bus
 * POST /api/bookings (Authenticated user)
 */
const createBooking = async (req, res, next) => {
  try {
    const { busId, seatNumber, passengerName, travelDate } = req.body;
    const userId = req.user._id;

    // Validate bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return sendError(res, 404, 'Bus not found.');
    }

    // Validate seat number range
    if (seatNumber < 1 || seatNumber > bus.totalSeats) {
      return sendError(
        res,
        400,
        `Invalid seat number ${seatNumber}. Seat must be between 1 and ${bus.totalSeats}.`
      );
    }

    // Prevent duplicate seat booking for the same bus and travelDate
    const existingBooking = await Booking.findOne({
      busId,
      travelDate,
      seatNumber,
      status: 'Confirmed'
    });

    if (existingBooking) {
      return sendError(
        res,
        409,
        `Seat ${seatNumber} is already booked on ${travelDate} for bus ${bus.busNumber}. Please select another seat.`
      );
    }

    // Check available seats
    if (bus.availableSeats <= 0) {
      return sendError(res, 400, 'No seats available on this bus.');
    }

    // Generate unique booking ID
    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      userId,
      busId,
      seatNumber,
      passengerName,
      travelDate,
      status: 'Confirmed'
    });

    // Decrease available seats on the bus
    await Bus.findByIdAndUpdate(busId, { $inc: { availableSeats: -1 } });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('busId', 'busNumber operator source destination departureTime arrivalTime')
      .populate('userId', 'name email');

    return sendSuccess(res, 201, 'Seat booked successfully', populatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * View bookings
 * GET /api/bookings (Users see own bookings, admins see all)
 */
const getBookings = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .populate('busId', 'busNumber operator source destination departureTime arrivalTime')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Bookings fetched successfully', {
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View single booking by ID
 * GET /api/bookings/:id (Users can only view their own booking, admin can view any)
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('busId', 'busNumber operator source destination departureTime arrivalTime')
      .populate('userId', 'name email');

    if (!booking) {
      return sendError(res, 404, 'Booking not found.');
    }

    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access forbidden. You can only view your own bookings.');
    }

    return sendSuccess(res, 200, 'Booking details fetched successfully', booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 * DELETE /api/bookings/:id (Users can only cancel their own, admin can cancel any)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return sendError(res, 404, 'Booking not found.');
    }

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access forbidden. You can only cancel your own bookings.');
    }

    if (booking.status === 'Cancelled') {
      return sendError(res, 400, 'This booking has already been cancelled.');
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Increase available seats back on the bus
    await Bus.findByIdAndUpdate(booking.busId, { $inc: { availableSeats: 1 } });

    return sendSuccess(res, 200, 'Booking cancelled successfully', {
      bookingId: booking.bookingId,
      status: 'Cancelled'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBus,
  getBuses,
  getBusById,
  updateBus,
  deleteBus,
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
