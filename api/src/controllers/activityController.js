const amqp = require('amqplib');

let channel = null;
const queue = 'user_activities';

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672');
    channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    // In a production app, we'd want to retry connection or handle this more gracefully
    process.exit(1);
  }
}

const publishActivity = async (activity) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  
  const buffer = Buffer.from(JSON.stringify(activity));
  return channel.sendToQueue(queue, buffer, { persistent: true });
};

const activityController = {
  ingestActivity: async (req, res) => {
    try {
      const { userId, eventType, timestamp, payload } = req.body;

      // Basic validation
      if (!userId || !eventType || !timestamp) {
        return res.status(400).json({ error: 'Invalid input payload. userId, eventType, and timestamp are required.' });
      }

      const activityEvent = {
        userId,
        eventType,
        timestamp,
        payload: payload || {},
        receivedAt: new Date().toISOString()
      };

      // Publish to RabbitMQ
      await publishActivity(activityEvent);

      return res.status(202).json({ 
        message: 'Event successfully received and queued.',
        eventId: activityEvent.timestamp // Or generate a UUID as hinted in requirements
      });
    } catch (error) {
      console.error('Error ingesting activity:', error);
      return res.status(500).json({ error: 'Internal server error while processing activity.' });
    }
  },
  
  healthCheck: (req, res) => {
    res.status(200).json({ status: 'healthy' });
  }
};

module.exports = { activityController, connectRabbitMQ };
