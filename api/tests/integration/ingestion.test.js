// This would be a more complex test requiring mocking of RabbitMQ 
// For now, providing a structured template for integration testing

// mock amqplib
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn().mockResolvedValue({}),
      sendToQueue: jest.fn().mockResolvedValue(true),
      close: jest.fn()
    }),
    close: jest.fn()
  })
}));

const request = require('supertest');
const express = require('express');
const { activityController } = require('../../src/controllers/activityController');

describe('Activity Ingestion Integration', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/v1/activities', activityController.ingestActivity);
  });

  it('should reject requests with missing fields', async () => {
    const response = await request(app)
      .post('/api/v1/activities')
      .send({ userId: '123' }); // Missing eventType and timestamp
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });

  it('should accept valid ingestion requests and match snapshot', async () => {
    const response = await request(app)
      .post('/api/v1/activities')
      .send({ 
        userId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 
        eventType: 'test', 
        timestamp: new Date().toISOString() 
      });
    
    expect(response.status).toBe(202);
    expect(response.body).toMatchSnapshot();
  });
});
