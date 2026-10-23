const { sendError } = require('../utils/apiResponse');

let apiLimiter;
let authLimiter;

try {
  const rateLimit = require('express-rate-limit');
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
  const generalMax = parseInt(process.env.RATE_LIMIT_MAX, 10) || 200;
  const authMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 50;

  const standardLimiterHandler = (req, res) => {
    return sendError(
      res,
      429,
      'Too many requests from this IP address. Please try again later.'
    );
  };

  apiLimiter = rateLimit({
    windowMs,
    max: generalMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: standardLimiterHandler
  });

  authLimiter = rateLimit({
    windowMs,
    max: authMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: standardLimiterHandler
  });
} catch (e) {
  // Built-in lightweight fallback limiter
  const createFallbackLimiter = (maxReq = 100) => {
    const counts = new Map();
    return (req, res, next) => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const current = counts.get(ip) || { count: 0, reset: now + 15 * 60 * 1000 };
      if (now > current.reset) {
        current.count = 1;
        current.reset = now + 15 * 60 * 1000;
      } else {
        current.count++;
      }
      counts.set(ip, current);
      if (current.count > maxReq) {
        return sendError(res, 429, 'Too many requests. Please try again later.');
      }
      next();
    };
  };
  apiLimiter = createFallbackLimiter(200);
  authLimiter = createFallbackLimiter(50);
}

module.exports = {
  apiLimiter,
  authLimiter
};
