const { Courier } = require('../models/Courier');
const TrackingHistory = require('../models/TrackingHistory');
const { generateTrackingId } = require('../utils/idGenerators');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Create a new courier shipment
 * POST /api/couriers
 */
const createCourier = async (req, res, next) => {
  try {
    const {
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      source,
      destination,
      packageDescription
    } = req.body;

    // Generate unique tracking ID
    let trackingId;
    let isUnique = false;
    while (!isUnique) {
      trackingId = generateTrackingId();
      const existing = await Courier.findOne({ trackingId });
      if (!existing) {
        isUnique = true;
      }
    }

    const courier = await Courier.create({
      trackingId,
      senderName,
      senderPhone,
      receiverName,
      receiverPhone,
      source,
      destination,
      packageDescription,
      status: 'Booked'
    });

    // Automatically record initial tracking history
    await TrackingHistory.create({
      courierId: courier._id,
      status: 'Booked',
      location: source,
      message: 'Shipment has been booked and scheduled for pickup.'
    });

    return sendSuccess(res, 201, 'Courier shipment created successfully', courier);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all couriers with optional filter & search
 * GET /api/couriers
 */
const getCouriers = async (req, res, next) => {
  try {
    const { status, source, destination, search } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (source) {
      filter.source = new RegExp(source, 'i');
    }

    if (destination) {
      filter.destination = new RegExp(destination, 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { trackingId: searchRegex },
        { senderName: searchRegex },
        { receiverName: searchRegex },
        { source: searchRegex },
        { destination: searchRegex }
      ];
    }

    const couriers = await Courier.find(filter).sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Couriers fetched successfully', {
      count: couriers.length,
      couriers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search shipment by Tracking ID or ID
 * GET /api/couriers/:trackingId
 */
const getCourierByTrackingId = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    // Check if trackingId is a valid ObjectId, or match trackingId directly
    let courier;
    if (trackingId.match(/^[0-9a-fA-F]{24}$/)) {
      courier = await Courier.findById(trackingId);
    }

    if (!courier) {
      courier = await Courier.findOne({ trackingId: trackingId.toUpperCase() });
    }

    if (!courier) {
      return sendError(res, 404, `Shipment with tracking ID '${trackingId}' not found.`);
    }

    // Include recent tracking history in response
    const history = await TrackingHistory.find({ courierId: courier._id }).sort({ timestamp: 1 });

    const courierObj = courier.toObject();
    courierObj.trackingHistory = history;

    return sendSuccess(res, 200, 'Shipment details fetched successfully', courierObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Update delivery status
 * PUT /api/couriers/:id/status
 * Automatically logs a new tracking history entry
 */
const updateCourierStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, location, message } = req.body;

    const courier = await Courier.findById(id);
    if (!courier) {
      return sendError(res, 404, 'Courier shipment not found.');
    }

    courier.status = status;
    await courier.save();

    // Automatically create tracking history record
    const historyEntry = await TrackingHistory.create({
      courierId: courier._id,
      status,
      location,
      message: message || `Status updated to ${status} at ${location}`,
      timestamp: new Date()
    });

    return sendSuccess(res, 200, 'Courier status updated successfully', {
      courier,
      latestHistory: historyEntry
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View tracking history
 * GET /api/couriers/:id/history
 */
const getTrackingHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const courier = await Courier.findById(id);
    if (!courier) {
      return sendError(res, 404, 'Courier shipment not found.');
    }

    const history = await TrackingHistory.find({ courierId: id }).sort({ timestamp: 1 });

    return sendSuccess(res, 200, 'Tracking history fetched successfully', {
      trackingId: courier.trackingId,
      currentStatus: courier.status,
      history
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete courier and associated tracking history
 * DELETE /api/couriers/:id
 */
const deleteCourier = async (req, res, next) => {
  try {
    const { id } = req.params;

    const courier = await Courier.findByIdAndDelete(id);
    if (!courier) {
      return sendError(res, 404, 'Courier shipment not found.');
    }

    await TrackingHistory.deleteMany({ courierId: id });

    return sendSuccess(res, 200, 'Courier shipment and history deleted successfully', {
      deletedId: id,
      trackingId: courier.trackingId
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourier,
  getCouriers,
  getCourierByTrackingId,
  updateCourierStatus,
  getTrackingHistory,
  deleteCourier
};
