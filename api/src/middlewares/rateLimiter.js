const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000, // 1 minute
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 50, // Limit each IP to 50 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded, please try again later.'
  },
  handler: (req, res, next, options) => {
    const timeRemaining = Math.max(0, Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000));
    res.setHeader('Retry-After', timeRemaining);
    res.status(options.statusCode).send(options.message);
  }
});

module.exports = limiter;
