const Activity = require('../models/Activity');

const processActivity = async (activityData) => {
  try {
    // Basic validation check before saving
    if (!activityData.userId || !activityData.eventType) {
      throw new Error('Invalid activity data: missing userId or eventType');
    }

    const activity = new Activity({
      userId: activityData.userId,
      eventType: activityData.eventType,
      timestamp: new Date(activityData.timestamp),
      payload: activityData.payload || {},
      processedAt: new Date()
    });

    await activity.save();
    console.log(`[Processor] Saved event: ${activityData.eventType} for user: ${activityData.userId}`);
    return true;
  } catch (error) {
    console.error('[Processor] Error saving activity:', error.message);
    throw error; // Let the worker handle the nack
  }
};

module.exports = { processActivity };
