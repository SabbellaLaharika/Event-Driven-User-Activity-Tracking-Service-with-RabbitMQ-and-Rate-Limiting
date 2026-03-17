# API Documentation

## Base URL
`http://localhost:3000/api/v1`

## Authentication
None (IP-based rate limiting applied).

## Rate Limiting
- **Limit**: 50 requests per 60 seconds per IP.
- **Headers**:
  - `RateLimit-Limit`: Maximum requests.
  - `RateLimit-Remaining`: Remaining requests.
  - `Retry-After`: Seconds to wait before next request.

## Endpoints

### 1. Post User Activity
Ingests a user activity event into the tracking queue.

- **URL**: `/activities`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body Schema
| Field | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | Yes | Unique identifier for the user. |
| `eventType` | `string` | Yes | Type of event (e.g., `user_login`). |
| `timestamp` | `string` | Yes | ISO 8601 timestamp of the event. |
| `payload` | `object` | No | Additional event metadata. |

**Example Body:**
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

#### Responses

| Code | Status | Description |
|---|---|---|
| `202` | `Accepted` | Event received and queued for processing. |
| `400` | `Bad Request` | Missing required fields or invalid JSON. |
| `429` | `Too Many Requests` | Rate limit exceeded. Check `Retry-After` header. |
| `500` | `Internal Server Error` | Message queue or server failure. |

---

### 2. Health Check
Internal endpoint for container health monitoring.

- **URL**: `http://localhost:3000/health`
- **Method**: `GET`
- **Response**: `200 OK`
  ```json
  { "status": "healthy" }
  ```

---

## Swagger UI
Interactive documentation is available at:
`http://localhost:3000/api-docs` when the API service is running.
