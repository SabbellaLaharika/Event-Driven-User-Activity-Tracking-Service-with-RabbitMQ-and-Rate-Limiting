const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true }, // Original event timestamp
  processedAt: { type: Date, default: Date.now }, // When consumer processed it
  payload: { type: mongoose.Schema.Types.Mixed }, // flexible JSON object
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Adding a unique constraint to timestamp+userId if we want simple idempotency
// activitySchema.index({ userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.model('Activity', activitySchema);
