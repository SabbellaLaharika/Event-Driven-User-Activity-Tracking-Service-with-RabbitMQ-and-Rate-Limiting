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

      // Robust Validation
      if (!userId || !eventType || !timestamp) {
        return res.status(400).json({ error: 'Invalid input payload. userId, eventType, and timestamp are required.' });
      }

      // Basic UUID structure check (8-4-4-4-12 hex chars)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUserId = typeof userId === 'string' && (userId.length > 5 || uuidRegex.test(userId)); // Flexible but checks string
      
      const isValidDate = !isNaN(Date.parse(timestamp));

      if (!isValidUserId || !isValidDate) {
        return res.status(400).json({ error: 'Invalid userId format or timestamp format.' });
      }

      const activityEvent = {
        userId,
        eventType: String(eventType).trim(),
        timestamp,
        payload: payload || {},
        receivedAt: new Date().toISOString()
      };

      if (activityEvent.eventType === "") {
        return res.status(400).json({ error: 'eventType cannot be empty.' });
      }

      // Publish to RabbitMQ
      await publishActivity(activityEvent);

      return res.status(202).json({ 
        message: 'Event successfully received and queued.',
        eventId: activityEvent.timestamp
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
