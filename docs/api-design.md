
# QuickNotes API Design

## 1. Overview

The QuickNotes API is a RESTful service that allows authenticated users to create, view, update, and delete notes and organize them with tags.

The backend API described here is the proposed production API, not the JSONPlaceholder practice API used by the front-end client.

### Base URL

`https://api.quicknotes.example.com/v1`

All request and response bodies use JSON unless otherwise stated. Protected endpoints require a valid authentication token.

## 2. REST Endpoints

| Method | Path | Description | Success Status |
|---|---|---|---|
| POST | `/auth/register` | Register a new user account | 201 Created |
| POST | `/auth/login` | Authenticate a user and return an access token | 200 OK |
| GET | `/notes` | List the authenticated user's notes, with pagination | 200 OK |
| GET | `/notes/{id}` | Retrieve one note by ID | 200 OK |
| POST | `/notes` | Create a new note | 201 Created |
| PATCH | `/notes/{id}` | Update selected fields of an existing note | 200 OK |
| DELETE | `/notes/{id}` | Delete a note owned by the authenticated user | 204 No Content |
| GET | `/tags` | List the authenticated user's tags | 200 OK |
| POST | `/notes/{id}/tags` | Associate a tag with a note | 201 Created |

## 3. Create a Note

### Request

`POST /v1/notes`

Headers:

- `Authorization: Bearer <access-token>`
- `Content-Type: application/json`

Request JSON:

```json
{
  "title": "Shopping list",
  "body": "Buy matooke, tomatoes and onions",
  "tagIds": [2, 3]
}
```

The title is required and must contain between 1 and 100 characters after trimming whitespace. The body is optional.

### Successful Response

Status: `201 Created`

```json
{
  "id": 101,
  "userId": 7,
  "title": "Shopping list",
  "body": "Buy matooke, tomatoes and onions",
  "tags": [
    {
      "id": 2,
      "name": "Shopping"
    },
    {
      "id": 3,
      "name": "Personal"
    }
  ],
  "createdAt": "2026-10-20T08:00:00Z",
  "updatedAt": "2026-10-20T08:00:00Z"
}
```

The server generates the note ID and timestamps. The server obtains the user ID from the authenticated session rather than trusting a user ID supplied by the client.

## 4. List Notes

### Request

`GET /v1/notes?page=1&limit=20`

Headers:

- `Authorization: Bearer <access-token>`

The endpoint returns only notes belonging to the authenticated user. Pagination limits the amount of data returned in one request.

### Successful Response

Status: `200 OK`

```json
{
  "data": [
    {
      "id": 101,
      "userId": 7,
      "title": "Shopping list",
      "body": "Buy matooke, tomatoes and onions",
      "createdAt": "2026-10-20T08:00:00Z",
      "updatedAt": "2026-10-20T08:00:00Z"
    },
    {
      "id": 102,
      "userId": 7,
      "title": "Study plan",
      "body": "Finish the system design assignment",
      "createdAt": "2026-10-20T08:10:00Z",
      "updatedAt": "2026-10-20T08:10:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

If the user has no notes, the endpoint returns `200 OK` with an empty `data` array.

## 5. Error Status Codes

| Status | Name | When It Is Used |
|---|---|---|
| 400 | Bad Request | Invalid JSON, missing title, or invalid field values |
| 401 | Unauthorized | Missing, invalid, or expired authentication token |
| 403 | Forbidden | The user is authenticated but lacks permission to perform the action |
| 404 | Not Found | The requested note or resource does not exist or is not accessible |
| 409 | Conflict | A request conflicts with an existing resource or constraint |
| 422 | Unprocessable Content | The request format is valid but business validation fails |
| 429 | Too Many Requests | The client exceeds its allowed request rate |
| 500 | Internal Server Error | An unexpected server-side failure occurs |
| 503 | Service Unavailable | The service is temporarily unable to handle requests |

### Example Error Response

Status: `400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The note could not be created.",
    "details": [
      {
        "field": "title",
        "message": "Title is required and must not exceed 100 characters."
      }
    ],
    "requestId": "req-7f82ab"
  }
}
```

Error responses should use a consistent structure and must not expose passwords, authentication tokens, stack traces, or other sensitive internal details.

## 6. Authentication and Authorization

- Use HTTPS for all API traffic.
- Require authentication for private notes and other user-specific resources.
- Verify ownership before reading, updating, or deleting a note.
- Store passwords using a suitable salted password-hashing algorithm.
- Apply rate limits to reduce abuse and brute-force attempts.
- Validate and normalize all client-supplied input on the server.

## 7. API Design Principles

The API uses resource-oriented URLs and standard HTTP methods. It uses appropriate status codes, JSON representations, pagination, and consistent error responses. These choices make the API predictable for clients and easier for backend developers to maintain and extend.
