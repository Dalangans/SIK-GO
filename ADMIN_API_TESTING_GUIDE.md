# Admin API Testing Guide - SIK-GO

## Overview
This guide provides complete instructions for testing all admin-protected endpoints in the SIK-GO backend using Postman. All admin endpoints require authentication with Bearer token and Admin role.

---

## Setup Instructions

### 1. Prerequisite
- Backend running at `http://localhost:3000`
- Postman installed
- Admin user account created in database

### 2. Environment Variables in Postman

Create a new Postman Environment with these variables:

```
baseUrl = http://localhost:3000
adminToken = (will be filled after login)
adminEmail = admin@sik-go.com
adminPassword = admin123
```

### 3. Get Admin Bearer Token

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@sik-go.com",
  "password": "admin123"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@sik-go.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Save the token** in Postman environment variable:
- Copy `token` value from response
- Go to Environment → Select current environment → Set `adminToken` variable

---

## Admin Endpoints Documentation

### **1. PROPOSALS MANAGEMENT**

#### 1.1 Get All Proposals (Admin View)

**Endpoint:** `GET {{baseUrl}}/api/proposals/admin/all`

**Authentication:** Required
- Header: `Authorization: Bearer {{adminToken}}`

**Postman Setup:**
- Method: GET
- URL: `{{baseUrl}}/api/proposals/admin/all`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student"
      },
      "title": "Research Proposal",
      "description": "Description of proposal",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved all proposals
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not admin

---

#### 1.2 Update Proposal Status

**Endpoint:** `PUT {{baseUrl}}/api/proposals/:id/status`

**Parameters:**
- `id` (path): Proposal ID

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Status Values:** `pending`, `approved`, `rejected`

**Postman Setup:**
- Method: PUT
- URL: `{{baseUrl}}/api/proposals/507f1f77bcf86cd799439012/status`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`
  - Key: `Content-Type`
  - Value: `application/json`
- Body (raw JSON):
  ```json
  {
    "status": "approved"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Proposal status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "status": "approved",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Status updated successfully
- `400 Bad Request` - Invalid status value
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not admin
- `404 Not Found` - Proposal not found

---

### **2. ROOMS MANAGEMENT**

#### 2.1 Create New Room (Admin Only)

**Endpoint:** `POST {{baseUrl}}/api/rooms`

**Request Body:**
```json
{
  "roomName": "Meeting Room A",
  "capacity": 20,
  "location": "Building 1",
  "facilities": ["projector", "whiteboard", "wifi"],
  "description": "Modern meeting room"
}
```

**Postman Setup:**
- Method: POST
- URL: `{{baseUrl}}/api/rooms`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`
  - Key: `Content-Type`
  - Value: `application/json`
- Body (raw JSON):
  ```json
  {
    "roomName": "Meeting Room A",
    "capacity": 20,
    "location": "Building 1",
    "facilities": ["projector", "whiteboard", "wifi"],
    "description": "Modern meeting room"
  }
  ```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "roomName": "Meeting Room A",
    "capacity": 20,
    "location": "Building 1",
    "facilities": ["projector", "whiteboard", "wifi"],
    "createdAt": "2024-01-15T11:30:00.000Z"
  }
}
```

**Status Codes:**
- `201 Created` - Room created successfully
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not admin

---

#### 2.2 Update Room Details

**Endpoint:** `PUT {{baseUrl}}/api/rooms/:roomId`

**Parameters:**
- `roomId` (path): Room ID to update

**Request Body:**
```json
{
  "roomName": "Meeting Room A - Updated",
  "capacity": 25,
  "facilities": ["projector", "whiteboard", "wifi", "ac"]
}
```

**Postman Setup:**
- Method: PUT
- URL: `{{baseUrl}}/api/rooms/507f1f77bcf86cd799439014`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`
  - Key: `Content-Type`
  - Value: `application/json`
- Body (raw JSON):
  ```json
  {
    "roomName": "Meeting Room A - Updated",
    "capacity": 25,
    "facilities": ["projector", "whiteboard", "wifi", "ac"]
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Room updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "roomName": "Meeting Room A - Updated",
    "capacity": 25,
    "facilities": ["projector", "whiteboard", "wifi", "ac"],
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Room updated successfully
- `400 Bad Request` - Invalid field values
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not admin
- `404 Not Found` - Room not found

---

### **3. USERS MANAGEMENT**

#### 3.1 Get All Users (Admin Only)

**Endpoint:** `GET {{baseUrl}}/api/users`

**Authentication:** Required
- Header: `Authorization: Bearer {{adminToken}}`

**Query Parameters (Optional):**
- `role` - Filter by role (admin, student, teacher)
- `limit` - Number of results per page
- `skip` - Number of results to skip

**Postman Setup:**
- Method: GET
- URL: `{{baseUrl}}/api/users`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "createdAt": "2024-01-10T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "student",
      "createdAt": "2024-01-12T14:30:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved all users
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not admin

---

### **4. SIK DOCUMENTS MANAGEMENT**

#### 4.1 Get All Documents (Admin View)

**Endpoint:** `GET {{baseUrl}}/api/sik-documents/admin/all`

**Authentication:** Required
- Header: `Authorization: Bearer {{adminToken}}`

**Postman Setup:**
- Method: GET
- URL: `{{baseUrl}}/api/sik-documents/admin/all`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "userId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "fileName": "proposal_2024.pdf",
      "status": "pending",
      "uploadedAt": "2024-01-14T09:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved all documents
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not admin

---

#### 4.2 Update Document Status

**Endpoint:** `PUT {{baseUrl}}/api/sik-documents/:docId/status`

**Parameters:**
- `docId` (path): Document ID

**Request Body:**
```json
{
  "status": "approved"
}
```

**Valid Status Values:** `pending`, `approved`, `rejected`

**Postman Setup:**
- Method: PUT
- URL: `{{baseUrl}}/api/sik-documents/507f1f77bcf86cd799439016/status`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`
  - Key: `Content-Type`
  - Value: `application/json`
- Body (raw JSON):
  ```json
  {
    "status": "approved"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Document status updated",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "status": "approved",
    "updatedAt": "2024-01-15T12:30:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Status updated successfully
- `400 Bad Request` - Invalid status value
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not admin
- `404 Not Found` - Document not found

---

### **5. BOOKINGS MANAGEMENT**

#### 5.1 Get All Bookings

**Endpoint:** `GET {{baseUrl}}/api/bookings`

**Authentication:** Required
- Header: `Authorization: Bearer {{adminToken}}`

**Postman Setup:**
- Method: GET
- URL: `{{baseUrl}}/api/bookings`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "userId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "John Doe"
      },
      "roomId": {
        "_id": "507f1f77bcf86cd799439014",
        "roomName": "Meeting Room A"
      },
      "date": "2024-01-20",
      "startTime": "10:00",
      "endTime": "12:00",
      "status": "pending",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved all bookings
- `401 Unauthorized` - Invalid or missing token

---

#### 5.2 Get Pending Bookings

**Endpoint:** `GET {{baseUrl}}/api/bookings/status/pending`

**Authentication:** Required
- Header: `Authorization: Bearer {{adminToken}}`

**Postman Setup:**
- Method: GET
- URL: `{{baseUrl}}/api/bookings/status/pending`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439017",
      "userId": { "name": "John Doe" },
      "roomId": { "roomName": "Meeting Room A" },
      "date": "2024-01-20",
      "status": "pending"
    }
  ]
}
```

---

#### 5.3 Approve Booking

**Endpoint:** `PUT {{baseUrl}}/api/bookings/:id/approve`

**Parameters:**
- `id` (path): Booking ID

**Postman Setup:**
- Method: PUT
- URL: `{{baseUrl}}/api/bookings/507f1f77bcf86cd799439017/approve`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "status": "approved",
    "updatedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK` - Booking approved
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Booking not found

---

#### 5.4 Reject Booking

**Endpoint:** `PUT {{baseUrl}}/api/bookings/:id/reject`

**Parameters:**
- `id` (path): Booking ID

**Request Body (Optional):**
```json
{
  "reason": "Room already booked"
}
```

**Postman Setup:**
- Method: PUT
- URL: `{{baseUrl}}/api/bookings/507f1f77bcf86cd799439017/reject`
- Headers:
  - Key: `Authorization`
  - Value: `Bearer {{adminToken}}`
- Body (raw JSON) - Optional:
  ```json
  {
    "reason": "Room already booked"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking rejected successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "status": "rejected",
    "updatedAt": "2024-01-15T13:05:00.000Z"
  }
}
```

---

## cURL Command Examples

### Login and Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sik-go.com",
    "password": "admin123"
  }'
```

### Get All Proposals
```bash
curl -X GET http://localhost:3000/api/proposals/admin/all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update Proposal Status
```bash
curl -X PUT http://localhost:3000/api/proposals/PROPOSAL_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
```

### Create New Room
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "Meeting Room A",
    "capacity": 20,
    "location": "Building 1",
    "facilities": ["projector", "whiteboard", "wifi"]
  }'
```

### Get All Users
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get All Documents (Admin)
```bash
curl -X GET http://localhost:3000/api/sik-documents/admin/all \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update Document Status
```bash
curl -X PUT http://localhost:3000/api/sik-documents/DOC_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
```

### Get All Bookings
```bash
curl -X GET http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Approve Booking
```bash
curl -X PUT http://localhost:3000/api/bookings/BOOKING_ID/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Troubleshooting Common Issues

### Error: "User not authenticated"
**Cause:** Missing or invalid Bearer token
**Solution:** 
1. Verify token in Authorization header
2. Check token hasn't expired (typical: 24 hours)
3. Re-login to get fresh token

### Error: "User is not authorized"
**Cause:** User account doesn't have admin role
**Solution:**
1. Verify user's role in database
2. Update user role to "admin" in MongoDB
3. Re-login after role update

### Error: "Invalid token format"
**Cause:** Bearer token malformed
**Solution:**
1. Check token format: `Bearer <token>`
2. No extra spaces or characters
3. Copy token directly from login response

### Error: "Cannot GET /api/..."
**Cause:** Wrong URL or endpoint doesn't exist
**Solution:**
1. Verify base URL: `http://localhost:3000`
2. Check exact endpoint path spelling
3. Verify backend is running

### Error: "Server Error 500"
**Cause:** Backend error during processing
**Solution:**
1. Check backend console logs
2. Verify database connection
3. Check request body format (valid JSON)
4. Verify all required fields are provided

---

## Testing Workflow Example

### Complete Admin Testing Flow

1. **Login as Admin**
   ```
   POST /api/auth/login
   → Save token in environment variable
   ```

2. **View All Proposals**
   ```
   GET /api/proposals/admin/all
   → Identify proposal to approve
   ```

3. **Approve a Proposal**
   ```
   PUT /api/proposals/{id}/status
   Body: { "status": "approved" }
   ```

4. **Create a Room**
   ```
   POST /api/rooms
   Body: { roomName, capacity, location, facilities }
   → Note room ID
   ```

5. **View All Bookings**
   ```
   GET /api/bookings
   → Check pending bookings
   ```

6. **Approve a Booking**
   ```
   PUT /api/bookings/{id}/approve
   ```

7. **Check All Users**
   ```
   GET /api/users
   ```

8. **View All Documents**
   ```
   GET /api/sik-documents/admin/all
   ```

9. **Approve Document**
   ```
   PUT /api/sik-documents/{docId}/status
   Body: { "status": "approved" }
   ```

---

## Summary of All Admin Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Get admin token |
| GET | `/api/proposals/admin/all` | View all proposals |
| PUT | `/api/proposals/:id/status` | Update proposal status |
| POST | `/api/rooms` | Create new room |
| PUT | `/api/rooms/:roomId` | Update room details |
| GET | `/api/users` | List all users |
| GET | `/api/sik-documents/admin/all` | View all documents |
| PUT | `/api/sik-documents/:docId/status` | Update document status |
| GET | `/api/bookings` | View all bookings |
| GET | `/api/bookings/status/pending` | View pending bookings |
| PUT | `/api/bookings/:id/approve` | Approve booking |
| PUT | `/api/bookings/:id/reject` | Reject booking |

---

## Key Requirements

✅ All admin endpoints require Bearer token in `Authorization` header
✅ Middleware order: `protect` (authentication) → `authorize('admin')` (authorization)
✅ All endpoints use JSON for request/response
✅ Status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found)
✅ Admin user must have `role: "admin"` in database

---

**Last Updated:** 2024-01-15
**Backend Version:** Node.js/Express
**Database:** MongoDB with Mongoose
