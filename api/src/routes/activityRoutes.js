const express = require('express');
const router = express.Router();
const { activityController } = require('../controllers/activityController');

/**
 * @openapi
 * /api/v1/activities:
 *   post:
 *     summary: Ingests a user activity event
 *     description: Receives a user activity event and queues it for asynchronous processing.
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - eventType
 *               - timestamp
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *               eventType:
 *                 type: string
 *                 example: "user_login"
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-10-27T10:00:00Z"
 *               payload:
 *                 type: object
 *                 example:
 *                   ipAddress: "192.168.1.1"
 *                   device: "desktop"
 *                   browser: "Chrome"
 *     responses:
 *       202:
 *         description: Event successfully received and queued.
 *       400:
 *         description: Invalid input payload.
 *       429:
 *         description: Rate limit exceeded.
 *       500:
 *         description: Internal server error.
 */
router.post('/activities', activityController.ingestActivity);

module.exports = router;
