# Discussion Room API Documentation

## Base URL
```
/api/
```

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register/`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
```json
{
    "username": "string",
    "email": "string",
    "password": "string",
    "confirm_password": "string"
}
```
- **Success Response**: `201 CREATED`
```json
{
    "refresh": "string",
    "access": "string",
    "user": {
        "id": integer,
        "username": "string",
        "email": "string",
        "profile": {
            "bio": "string",
            "avatar": "url_string"
        }
    }
}
```

#### Login
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
```json
{
    "username": "string",
    "password": "string"
}
```
- **Success Response**: `200 OK`
```json
{
    "refresh": "string",
    "access": "string",
    "user": {
        "id": integer,
        "username": "string",
        "email": "string",
        "profile": {
            "bio": "string",
            "avatar": "url_string"
        }
    }
}
```

#### Logout
- **URL**: `/api/auth/logout/`
- **Method**: `POST`
- **Auth required**: Yes
- **Success Response**: `200 OK`
```json
{
    "message": "Logged out successfully"
}
```

#### Get Current User
- **URL**: `/api/auth/user/`
- **Method**: `GET`
- **Auth required**: Yes
- **Success Response**: `200 OK`
```json
{
    "id": integer,
    "username": "string",
    "email": "string",
    "profile": {
        "bio": "string",
        "avatar": "url_string"
    }
}
```

#### Update Profile
- **URL**: `/api/auth/update_profile/`
- **Method**: `PUT/PATCH`
- **Auth required**: Yes
- **Request Body**:
```json
{
    "email": "string",
    "profile": {
        "bio": "string",
        "avatar": "file"
    }
}
```
- **Success Response**: `200 OK`

#### Refresh Token
- **URL**: `/api/auth/refresh_token/`
- **Method**: `POST`
- **Auth required**: No
- **Request Body**:
```json
{
    "refresh": "string"
}
```
- **Success Response**: `200 OK`
```json
{
    "access": "string"
}
```

### Discussion Topics

#### List Topics
- **URL**: `/api/topics/`
- **Method**: `GET`
- **Auth required**: No
- **Query Parameters**:
  - `page`: integer (default=1)
  - `page_size`: integer (default=20)
  - `search`: string
  - `ordering`: string (created_at, -created_at, last_activity, -last_activity)
  - `category`: string
- **Success Response**: `200 OK`
```json
{
    "count": integer,
    "next": "url_string",
    "previous": "url_string",
    "results": [
        {
            "id": integer,
            "title": "string",
            "description": "string",
            "created_at": "datetime",
            "is_active": boolean,
            "category": "string",
            "pinned": boolean,
            "participant_count": integer,
            "message_count": integer,
            "last_activity": "datetime"
        }
    ]
}
```

#### Create Topic (Staff Only)
- **URL**: `/api/topics/`
- **Method**: `POST`
- **Auth required**: Yes (Staff only)
- **Request Body**:
```json
{
    "title": "string",
    "description": "string",
    "category": "string",
    "max_participants": integer,
    "pinned": boolean
}
```
- **Success Response**: `201 CREATED`

#### Get Topic Details
- **URL**: `/api/topics/{id}/`
- **Method**: `GET`
- **Auth required**: No
- **Success Response**: `200 OK`
```json
{
    "id": integer,
    "title": "string",
    "description": "string",
    "created_at": "datetime",
    "updated_at": "datetime",
    "is_active": boolean,
    "created_by": {
        "id": integer,
        "username": "string"
    },
    "category": "string",
    "pinned": boolean,
    "participants": [
        {
            "id": integer,
            "username": "string"
        }
    ],
    "max_participants": integer,
    "messages": [
        {
            "id": integer,
            "content": "string",
            "created_at": "datetime",
            "user": {
                "id": integer,
                "username": "string"
            }
        }
    ]
}
```

#### Join Topic
- **URL**: `/api/topics/{id}/join/`
- **Method**: `POST`
- **Auth required**: Yes
- **Success Response**: `200 OK`
```json
{
    "status": "joined"
}
```

#### Leave Topic
- **URL**: `/api/topics/{id}/leave/`
- **Method**: `POST`
- **Auth required**: Yes
- **Success Response**: `200 OK`
```json
{
    "status": "left"
}
```

### Messages

#### List Messages
- **URL**: `/api/topics/{topic_id}/messages/`
- **Method**: `GET`
- **Auth required**: No
- **Query Parameters**:
  - `page`: integer (default=1)
  - `page_size`: integer (default=20)
- **Success Response**: `200 OK`
```json
{
    "count": integer,
    "next": "url_string",
    "previous": "url_string",
    "results": [
        {
            "id": integer,
            "content": "string",
            "created_at": "datetime",
            "updated_at": "datetime",
            "is_edited": boolean,
            "user": {
                "id": integer,
                "username": "string"
            },
            "parent": integer,
            "mentioned_users": [
                {
                    "id": integer,
                    "username": "string"
                }
            ]
        }
    ]
}
```

#### Create Message
- **URL**: `/api/topics/{topic_id}/messages/`
- **Method**: `POST`
- **Auth required**: Yes
- **Request Body**:
```json
{
    "content": "string",
    "parent": integer,
    "mentioned_users": [integer]
}
```
- **Success Response**: `201 CREATED`

#### Update Message
- **URL**: `/api/topics/{topic_id}/messages/{id}/`
- **Method**: `PUT/PATCH`
- **Auth required**: Yes (Message owner only)
- **Request Body**:
```json
{
    "content": "string"
}
```
- **Success Response**: `200 OK`

#### Delete Message
- **URL**: `/api/topics/{topic_id}/messages/{id}/`
- **Method**: `DELETE`
- **Auth required**: Yes (Message owner or staff only)
- **Success Response**: `204 NO CONTENT`

### WebSocket Connection

#### Connect to Topic Chat
- **URL**: `ws://your-domain/ws/chat/{topic_id}/`
- **Auth required**: Yes (via token query parameter)
- **Example Connection URL**:
```
ws://your-domain/ws/chat/1/?token=<your_access_token>
```

#### WebSocket Message Format
- **Send Message**:
```json
{
    "message": "string",
    "username": "string"
}
```
- **Receive Message**:
```json
{
    "message": "string",
    "username": "string"
}
```
- **Receive Cached Messages**:
```json
{
    "type": "cached_messages",
    "messages": [
        {
            "id": integer,
            "content": "string",
            "created_at": "datetime",
            "user": {
                "id": integer,
                "username": "string"
            }
        }
    ]
}
```

## Error Responses
All endpoints may return these error responses:

- **401 Unauthorized**:
```json
{
    "error": "Authentication required"
}
```
- **403 Forbidden**:
```json
{
    "error": "You do not have permission to perform this action"
}
```
- **404 Not Found**:
```json
{
    "error": "Not found"
}
```
- **400 Bad Request**:
```json
{
    "field_name": [
        "error message"
    ]
}
```

## Rate Limiting
- API requests are limited to 1000 per hour per user
- WebSocket connections are limited to 100 concurrent connections per user

## Notes
1. All datetime fields are in ISO 8601 format
2. All endpoints that return lists support pagination
3. Staff members have additional privileges throughout the API
4. WebSocket connections require authentication via token
5. File uploads (avatars) should be sent as multipart/form-data