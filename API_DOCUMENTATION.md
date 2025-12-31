# Agile Flow - API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require an Authorization header:
```
Authorization: Bearer <supabase_access_token>
```

---

## 🔐 Authentication

### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "Student"
}
```

**Roles:** `HOD`, `Professor`, `Supporting Staff`, `Student`

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Student"
  }
}
```

### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "Student",
    "online_status": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

## 👥 Users

### Get All Users
```http
GET /users
```

**Auth Required:** Yes  
**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "Student",
      "online_status": false,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Users by Role
```http
GET /users/role/:role
```

**Params:** `role` - HOD, Professor, Supporting Staff, Student

### Create User (HOD Only)
```http
POST /users
```

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Smith",
  "role": "Professor"
}
```

### Update User
```http
PUT /users/:id
```

**Body:**
```json
{
  "name": "Updated Name",
  "role": "Professor"
}
```

### Delete User (HOD Only)
```http
DELETE /users/:id
```

### Update Online Status
```http
PATCH /users/status/online
```

**Body:**
```json
{
  "online_status": true
}
```

---

## ✅ Tasks

### Get All Tasks
```http
GET /tasks
```

**Query Params:**
- `status` - Pending, In Progress, Completed
- `assigned_to` - User ID
- `assigned_by` - User ID

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Complete Assignment",
      "description": "Submit by Friday",
      "deadline": "2025-12-31T23:59:59Z",
      "status": "Pending",
      "assigned_by": "uuid",
      "assigned_to": "uuid",
      "assigner": {
        "id": "uuid",
        "name": "Professor Name",
        "role": "Professor"
      },
      "assignee": {
        "id": "uuid",
        "name": "Student Name",
        "role": "Student"
      },
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### Get Task by ID
```http
GET /tasks/:id
```

### Create Task (HOD/Professor Only)
```http
POST /tasks
```

**Body:**
```json
{
  "title": "Complete Assignment",
  "description": "Submit research paper",
  "deadline": "2025-12-31T23:59:59Z",
  "assigned_to": "user_uuid"
}
```

**Permissions:**
- HOD: Can assign to anyone
- Professor: Can assign to Students and Supporting Staff only

### Update Task
```http
PUT /tasks/:id
```

**Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "In Progress",
  "deadline": "2025-12-31T23:59:59Z"
}
```

**Permissions:**
- Assignee: Can only update status
- Assigner: Can update all fields
- HOD: Can update all fields

### Delete Task
```http
DELETE /tasks/:id
```

**Permissions:** Task creator or HOD

### Get Task Statistics
```http
GET /tasks/stats
```

**Response:**
```json
{
  "stats": {
    "total": 10,
    "pending": 3,
    "inProgress": 5,
    "completed": 2,
    "assigned": 7,
    "received": 3
  }
}
```

---

## 💬 Messages

### Community Chat

#### Get Community Messages
```http
GET /messages/community?limit=100
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "message": "Hello everyone!",
      "created_at": "2025-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "role": "Student"
      }
    }
  ]
}
```

#### Send Community Message
```http
POST /messages/community
```

**Body:**
```json
{
  "message": "Hello everyone!"
}
```

### Private Messages (HOD ↔ Professor Only)

#### Get Private Messages
```http
GET /messages/private?otherUserId=uuid
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "sender_id": "uuid",
      "receiver_id": "uuid",
      "message": "Hello!",
      "read": false,
      "created_at": "2025-01-01T00:00:00Z",
      "sender": {
        "id": "uuid",
        "name": "HOD Name",
        "role": "HOD"
      },
      "receiver": {
        "id": "uuid",
        "name": "Professor Name",
        "role": "Professor"
      }
    }
  ]
}
```

#### Send Private Message
```http
POST /messages/private
```

**Body:**
```json
{
  "receiver_id": "uuid",
  "message": "Hello!"
}
```

**Auth Required:** HOD or Professor role

#### Mark Message as Read
```http
PATCH /messages/private/:id/read
```

#### Get Unread Count
```http
GET /messages/private/unread-count
```

**Response:**
```json
{
  "unreadCount": 5
}
```

#### Get Conversations
```http
GET /messages/private/conversations
```

**Response:**
```json
{
  "conversations": [
    {
      "user": {
        "id": "uuid",
        "name": "Professor Name",
        "role": "Professor"
      },
      "lastMessage": "Hello!",
      "lastMessageTime": "2025-01-01T00:00:00Z",
      "unread": true
    }
  ]
}
```

---

## 🔒 Role-Based Access Control

### Access Matrix

| Endpoint | HOD | Professor | Staff | Student |
|----------|-----|-----------|-------|---------|
| GET /users | ✅ | ✅ | ✅ | ✅ |
| POST /users | ✅ | ❌ | ❌ | ❌ |
| DELETE /users | ✅ | ❌ | ❌ | ❌ |
| GET /tasks | ✅ (all) | ✅ (own) | ✅ (assigned) | ✅ (assigned) |
| POST /tasks | ✅ (to all) | ✅ (to staff/students) | ❌ | ❌ |
| PUT /tasks (status) | ✅ | ✅ | ✅ | ✅ |
| PUT /tasks (other) | ✅ | ✅ (own) | ❌ | ❌ |
| DELETE /tasks | ✅ (all) | ✅ (own) | ❌ | ❌ |
| Community Messages | ✅ | ✅ | ✅ | ✅ |
| Private Messages | ✅ | ✅ | ❌ | ❌ |

---

## 🔄 Real-time Features (Supabase)

### Community Messages Subscription
```javascript
const channel = supabase
  .channel('community_messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'community_messages'
  }, (payload) => {
    console.log('New message:', payload);
  })
  .subscribe();
```

### Private Messages Subscription
```javascript
const channel = supabase
  .channel('private_messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${userId}`
  }, (payload) => {
    console.log('New private message:', payload);
  })
  .subscribe();
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "All fields are required"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "required": ["HOD"],
  "current": "Student"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 📧 Email Notifications

Email notifications are automatically sent when:
- HOD assigns a task to any user
- Professor assigns a task to student/staff

Email includes:
- Task title and description
- Deadline
- Assigner name
- Link to dashboard

---

## 🧪 Testing with cURL

### Login (Supabase)
```bash
curl -X POST https://your-project.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete Assignment",
    "description": "Submit by Friday",
    "deadline": "2025-12-31T23:59:59Z",
    "assigned_to": "user_uuid"
  }'
```

### Get Tasks
```bash
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Rate Limiting

API is rate-limited to **100 requests per 15 minutes** per IP address.

**Response when limit exceeded:**
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## 🔐 Security Best Practices

1. **Never expose service role key** in frontend
2. **Always use HTTPS** in production
3. **Validate all inputs** on backend
4. **Use environment variables** for secrets
5. **Enable CORS** only for trusted domains
6. **Implement request logging** for audit trail
7. **Use rate limiting** to prevent abuse
8. **Keep dependencies updated**

---

## 🚀 Performance Tips

1. **Pagination**: Use limit/offset for large datasets
2. **Caching**: Implement Redis for frequently accessed data
3. **Indexing**: Database indexes already created for common queries
4. **Connection Pooling**: Supabase handles this automatically
5. **Lazy Loading**: Load data as needed in frontend

---

## 📝 Change Log

### Version 1.0.0 (2025-01-01)
- Initial release
- User management
- Task management
- Community chat
- Private messaging
- Email notifications
- Role-based access control

---

For more information, see [README.md](README.md) and [SETUP_GUIDE.md](SETUP_GUIDE.md)
