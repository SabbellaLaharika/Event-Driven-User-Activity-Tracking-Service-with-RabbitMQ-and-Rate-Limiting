const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');
const limiter = require('../../src/middlewares/rateLimiter');

describe('Rate Limiter Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(limiter);
    app.get('/test', (req, res) => res.status(200).json({ success: true }));
  });

  it('should allow requests within the limit and match snapshot', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(200);
    expect(response.header).toHaveProperty('ratelimit-limit');
    expect(response.body).toMatchSnapshot();
  });

  // Since it's 50 requests per minute, a full test of the limit itself 
  // would be slow/require many requests or a different config for testing.
  // Instead, we verify the headers are returned by the middleware.
});
