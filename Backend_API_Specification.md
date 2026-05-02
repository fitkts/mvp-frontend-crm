# Backend API Specification (RESTful)

This document provides a comprehensive RESTful API specification for the Fitness Center Management System backend. It is designed to be directly implmentable with Node.js/Express and strictly follows the `schema.prisma` definitions.

## 1. General Guidelines

* **Base URL**: `/api/v1`
* **Content-Type**: `application/json`
* **Authentication**: All endpoints require a Bearer token in the Authorization header (`Authorization: Bearer <token>`).
* **Date Format**: All dates and timestamps are in **ISO 8601 format** (e.g., `2026-05-01T10:30:00Z`).
* **Pagination**: List endpoints use `?page=1&limit=20` query parameters. Responses include a `meta` field for pagination.

### Standard Response Format
**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

---

## 2. Staff Management (`/staff`)

### 2.1. GET `/staff`
Retrieve a list of staff members.
* **Query Params**: `status` (ACTIVE/INACTIVE), `role`, `page`, `limit`
* **Response `data`**: Array of `Staff` objects.

### 2.2. POST `/staff`
Create a new staff member.
* **Request Body**:
```json
{
  "name": "윤지성",
  "role": "TRAINER",
  "phone": "010-1234-5678",
  "email": "yoon@example.com",
  "gender": "남",
  "birthDate": "1990-01-01",
  "joinDate": "2026-05-01T00:00:00Z",
  "description": "수석 트레이너"
}
```

### 2.3. GET `/staff/:id`
* **Response**: Detailed `Staff` object including assigned members `members[]` and `payrolls[]`.

### 2.4. PUT `/staff/:id`
Update staff information. Partial updates supported.

### 2.5. DELETE `/staff/:id`
Soft delete (update `status` to "INACTIVE") or hard delete.

---

## 3. Member Management (`/members`)

### 3.1. GET `/members`
Retrieve a list of members.
* **Query Params**: `status` (ACTIVE/STOP/EXPIRED), `trainerId`, `search` (name/phone)

### 3.2. POST `/members`
Register a new member.
* **Request Body**:
```json
{
  "name": "홍길동",
  "gender": "남",
  "phone": "010-9876-5432",
  "email": "hong@example.com",
  "registrationDate": "2026-05-01T00:00:00Z",
  "goal": "체력 증진",
  "assignedTrainerId": 1
}
```

### 3.3. GET `/members/:id`
* **Response**: Includes relations `assignedTrainer`, `paymentHistories[]`, `lockers[]`.

### 3.4. PUT `/members/:id`
Update member info (e.g., changing `status` to "STOP", updating `remainingSessions`).

### 3.5. DELETE `/members/:id`
Soft delete a member. Updates the member's `status` to "EXPIRED".

---

## 4. Product Management (`/products`)

### 4.1. GET `/products`
* **Query Params**: `category` (PT/MEMBERSHIP/PILATES/LOCKER), `isActive` (boolean)

### 4.2. POST `/products`
Create a new product or membership plan.
* **Request Body**:
```json
{
  "name": "PT 프리미엄 20회",
  "category": "PT",
  "price": 1500000,
  "originalPrice": 2000000,
  "sessionCnt": 20,
  "validDays": 90,
  "isActive": true,
  "membershipAccess": "[\"Gym\", \"Sauna\"]"
}
```

### 4.3. PUT `/products/:id`
Update product pricing, status, or details.

### 4.4. DELETE `/products/:id`
Soft delete a product. Updates the product's `status` to "INACTIVE".

---

## 5. Payments & Transactions (`/payments`)

### 5.1. GET `/payments`
Retrieve a list of all payments.
* **Query Params**: `startDate`, `endDate`, `status`, `memberId`, `page`, `limit`
* **Response `data`**: Array of payment objects.

### 5.2. POST `/payments`
Record a new payment (usually triggered when a member purchases a product).

**Important**: This endpoint uses a Prisma `$transaction` to ensure the following operations are processed atomically:
1. Create `PaymentHistory` record.
2. Increment `Member.totalPaid` by `discountedPrice`.
3. Increment `Member.remainingSessions` by `sessions`.
4. Update `Member.recentPurchase` to `product` (product name).
5. If `Member.status` is "EXPIRED", update it to "ACTIVE".

If any of these operations fail, the entire transaction is rolled back.

* **Request Body**:
```json
{
  "memberId": 1,
  "date": "2026-05-01T10:00:00Z",
  "product": "PT 프리미엄 20회",
  "sessions": 20,
  "basePrice": 2000000,
  "discountedPrice": 1500000,
  "method": "카드",
  "installment": "3개월",
  "trainerId": 1,
  "status": "COMPLETED"
}
```

### 5.2. GET `/payments/:memberId`
Retrieve payment history for a specific member.

### 5.3. PUT `/payments/:id`
Update payment status or process a refund.
* **Request Body**:
```json
{
  "status": "EXPIRED"
}
```

---

## 6. Locker Management (`/lockers`)

### 6.1. GET `/lockers`
Retrieve all lockers and their current status.
* **Query Params**: `status` (AVAILABLE, IN_USE, EXPIRED, MAINTENANCE)

### 6.2. POST `/lockers`
Register a new locker.
* **Request Body**:
```json
{
  "id": "A-01",
  "status": "AVAILABLE"
}
```

### 6.3. POST `/lockers/:id/assign`
Assign a member to a locker.
* **Request Body**:
```json
{
  "memberId": 1,
  "startDate": "2026-05-01T00:00:00Z",
  "expireDate": "2026-05-31T23:59:59Z",
  "productId": 5,
  "paymentStatus": "PAID"
}
```

### 6.3. POST `/lockers/:id/release`
Release a locker, making it `AVAILABLE`. Creates an automatic `LockerHistory` record.

### 6.4. GET `/lockers/:id/history`
Retrieve history of a specific locker.

### 6.5. DELETE `/lockers/:id`
Delete a locker.
* **Error**: Returns `409 CONFLICT` if the locker's `status` is currently `IN_USE`.

---

## 7. Payroll Management (`/payrolls`)

### 7.1. GET `/payrolls`
Retrieve payrolls.
* **Query Params**: `period` (e.g., `2026-05`), `staffId`, `status`

### 7.2. POST `/payrolls/generate`
Batch generate/calculate payrolls for a specific period based on sessions, events, and base salary.
* **Request Body**:
```json
{
  "period": "2026-05"
}
```

### 7.3. PUT `/payrolls/:id/status`
Update payroll payment status (e.g., from `PENDING` to `PAID`).

---

## 8. Schedule & Events (`/events`)

### 8.1. GET `/events`
Get calendar events.
* **Query Params**: `startDate`, `endDate`, `trainerId`, `type`

### 8.2. POST `/events`
Book a PT session or group class.
* **Request Body**:
```json
{
  "title": "Jane Doe PT",
  "time": "2026-05-02T14:00:00Z",
  "duration": "01:00",
  "trainerId": 1,
  "type": "PT",
  "color": "bg-emerald-500"
}
```

### 8.3. DELETE `/events/:id`
Hard delete a calendar event.

---

## 9. Dashboard (`/dashboard`)

### 9.1. GET `/dashboard`
Retrieve dashboard overview metrics.
* **Response `data`**:
```json
{
  "monthlyRevenue": 15000000,
  "newMembersThisMonth": 25,
  "expiringMembersIn7Days": 10,
  "lockerUsageRate": 85.5
}
```

---

## 10. Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token. |
| `FORBIDDEN` | 403 | User does not have the required role/permissions. |
| `NOT_FOUND` | 404 | The requested resource (ID) does not exist. |
| `VALIDATION_ERROR` | 400 | The request body is missing required fields or has invalid types. |
| `CONFLICT` | 409 | Resource conflict (e.g., assigning a locker that is already IN_USE, duplicate email). |
| `SERVER_ERROR` | 500 | Unexpected internal server error. |
