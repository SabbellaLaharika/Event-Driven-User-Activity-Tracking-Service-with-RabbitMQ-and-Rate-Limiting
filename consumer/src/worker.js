require('dotenv').config();
const amqp = require('amqplib');
const mongoose = require('mongoose');
const { processActivity } = require('./services/activityProcessor');

const queue = 'user_activities';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://user:password@database:27017/activity_db?authSource=admin';

async function startWorker() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(DATABASE_URL);
    console.log('Connected to MongoDB');

    // 2. Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Durable queue
    await channel.assertQueue(queue, { durable: true });
    
    // Perfetch - don't overwhelm the consumer
    channel.prefetch(1);

    console.log(`Worker waiting for messages in ${queue}...`);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`[Worker] Received activity: ${content.eventType}`);
          
          // Process and persist
          await processActivity(content);
          
          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error('[Worker] Error processing message:', error.message);
          
          // Nack and requeue unless it's a malformed JSON
          const isInvalidJson = error instanceof SyntaxError;
          channel.nack(msg, false, !isInvalidJson); 
        }
      }
    });

  } catch (error) {
    console.error('Worker failed to start:', error);
    process.exit(1);
  }
}

// Global error handlers for cleaner process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

startWorker();
