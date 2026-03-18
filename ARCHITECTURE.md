# System Architecture

## Overview
The **User Activity Tracking Service** follows an event-driven microservices architecture to ensure high performance, scalability, and resilience.

## Diagram

```mermaid
graph TD
    user((User Client)) -->|"POST /api/v1/activities"| api[API Ingestion Service]
    
    subgraph "API Service"
        api --> rl[Rate Limiter Middleware]
        rl --> pub[RabbitMQ Publisher]
    end

    pub -->|"user_activities queue"| rmq[(RabbitMQ Broker)]
    
    rmq -->|"consume"| con[Consumer Worker]
    
    subgraph "Consumer Service"
        con --> proc[Activity Processor]
        proc --> mongo[(MongoDB Database)]
    end

    api -.-> health1[/health]
    con -.-> health2[Health Monitoring]
```

## Key Components

### 1. API Ingestion Point
- Built with **Express.js**.
- Implements **Rate Limiting** to prevent abuse.
- Acts as a producer that quickly acknowledges the client with `202 Accepted` after queuing the event.

### 2. Message Broker (RabbitMQ)
- Decouples the ingestion layer from the persistence layer.
- Provides a **Durable Queue** (`user_activities`) to ensure message reliability.
- Allows for horizontal scaling of consumers during traffic spikes.

### 3. Consumer Worker
- Built with **Node.js**.
- Processes messages from the queue one at a time (`prefetch 1`).
- Implements **Idempotency** (can be extended with event IDs) and **Explicit Acknowledgments** to prevent data loss.

### 4. Database (MongoDB)
- Stores activity events in a flexible schema using **Mongoose**.
- Indexed by `userId` and `timestamp` for efficient querying.
