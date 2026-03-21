# Event-Driven User Activity Tracking Service

A microservices-based system for tracking user activities using Node.js, RabbitMQ, and MongoDB, orchestrated with Docker.

## Architecture

- **API Service**: Ingests user activity events, applies rate limiting, and publishes messages to RabbitMQ.
- **RabbitMQ**: Message broker that decouples the API from the consumer.
- **Consumer Service**: Consumes messages from RabbitMQ and persists them to MongoDB.
- **MongoDB**: Persistent storage for user activities.

## Core Features

- **Event-Driven Architecture**: Fast ingestion with asynchronous processing.
- **Rate Limiting**: IP-based limiting (50 requests per minute).
- **Interactive Documentation**: Swagger UI available at `/api-docs`.
- **Containerized**: Fully managed via Docker Compose.
- **Robust Error Handling**: Proper message acknowledgment and retry logic.

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)

## Getting Started

1. **Clone the repository**
2. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
3. **Start the services**
   ```bash
   docker-compose up --build
   ```

## API Endpoints

### POST `/api/v1/activities`
Ingests a user activity event.

**Payload Example:**
```json
{
  "userId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "eventType": "user_login",
  "timestamp": "2023-10-27T10:00:00Z",
  "payload": {
    "ipAddress": "192.168.1.1",
    "device": "desktop",
    "browser": "Chrome"
  }
}
```

**Responses:**
- `202 Accepted`: Event queued.
- `400 Bad Request`: Validation error.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Generic error.

## Management & Monitoring

- **RabbitMQ Management UI**: [http://localhost:15672](http://localhost:15672) (User: `guest`, Pass: `guest`)
- **API Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **API Documentation (Swagger)**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Testing

Run tests inside the containers:
```bash
docker-compose exec api npm test
docker-compose exec consumer npm test
```
