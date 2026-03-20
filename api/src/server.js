require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const activityRoutes = require('./routes/activityRoutes');
const limiter = require('./middlewares/rateLimiter');
const { connectRabbitMQ, activityController } = require('./controllers/activityController');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Swagger Documentation Setup
const YAML = require('yamljs');
const path = require('path');
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/v1', activityRoutes);

// Health check endpoint for Docker
app.get('/health', activityController.healthCheck);

// Start Server
const startServer = async () => {
  await connectRabbitMQ();
  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();
