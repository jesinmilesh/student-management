/**
 * Helper to generate unique readable IDs for Couriers and Bookings
 */

const generateTrackingId = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `CR${year}${randomPart}`;
};

const generateBookingId = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `BK${year}${randomPart}`;
};

module.exports = {
  generateTrackingId,
  generateBookingId
};
