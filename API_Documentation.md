# Team‑OS Backend API Documentation (Front‑end Integration)

**All endpoints return a JSON envelope** built by `utils/response.ts`:

```json
{
  "success": true|false,
  "message": "Human‑readable description",
  "status": 200|201|…,
  "data": <payload‑object|array|null>
}
```

*`data` contains the resource‑specific payload shown below.*

**Authentication** – The `accessToken` returned by **/auth/login** or **/auth/register** should be sent in the `Authorization: Bearer <token>` header on every protected request. A refresh‑token cookie is also set automatically.

---

## 1. Health & Misc

| Method | Endpoint | Description | Success `data` |
|--------|----------|-------------|----------------|
| **GET** | `/health` | Simple health‑check. | `{ "ok": true }` |
| **GET** | `/auth/me` | Returns the profile of the logged‑in user. | `{ "user": <User> }` |

*`User` (sanitized) fields:* `id, name, email, phone?, role, status, jobType?, reportTime?, gracePeriodMins?`

---

## 2. Authentication

| Method | Endpoint | Request Body (JSON) | Description | Success `data` |
|--------|----------|----------------------|-------------|----------------|
| **POST** | `/auth/register` | `{ "name": "…", "email": "…", "password": "…", "phone?": "…", "role?": "…" }` | Create a new user account. | `{ "user": <User>, "token": "<access‑token>" }` |
| **POST** | `/auth/login` | `{ "email": "…", "password": "…" }` | Log in and receive an access token. | `{ "user": <User>, "token": "<access‑token>" }` |
| **POST** | `/auth/logout` | – | Clears the refresh‑token cookie and ends the session. | `null` |

---

## 3. Team (Employee) Management

> Base path: **`/team`** – all routes require `requireAuth`.

| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **GET** | `/team` | – | List all employees. | `Array<User>` |
| **GET** | `/team/:id` | – | Get a single employee by `id`. | `<User>` |
| **POST** | `/team` | `{ "name":"…", "email":"…", "password":"…", "phone?":"…", "role?":"…", "jobType?":"…", "reportTime?":"hh:mm", "gracePeriodMins?":15 }` | Create a new employee. | `<User>` |
| **PATCH** | `/team/:id` | Any subset of the fields above (except password). | Update employee data. | `<User>` |
| **DELETE** | `/team/:id` | – | Delete an employee record. | `null` |

*All `User` objects returned are **sanitized** – the `passwordHash` field is omitted.*

---

## 4. Clients

> Base path: **`/clients`** – all routes require authentication.

| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **GET** | `/clients` | – | List all client records. | `Array<Client>` |
| **GET** | `/clients/:id` | – | Fetch a single client. | `<Client>` |
| **POST** | `/clients` | `{ "name":"…", "contactEmail?":"…", "contactPhone?":"…", "whatsappGroupUrl?":"…", "contentTags?": ["Reels","Static"], "monthlyGoal?": 30 }` | Create a new client. | `<Client>` |
| **PATCH** | `/clients/:id` | Any subset of the fields above. | Update client information. | `<Client>` |
| **DELETE** | `/clients/:id` | – | Delete a client. | `null` |
| **POST** | `/clients/:id/share` | – | Generate a tokenised read‑only calendar link for the client. | `<ShareLink>` |

### Payload shapes

**Client**
```json
{
  "id": "string",
  "name": "string",
  "contactEmail": "string|null",
  "contactPhone": "string|null",
  "whatsappGroupUrl": "string|null",
  "contentTags": ["string", …],
  "monthlyGoal": number|null,
  "poc": { "id": "…", "name": "…" }|null,
  "contacts": [{ "id": "…", "name": "…" }, …],
  "shareLink": { "token": "…", "active": true }|null
}
```

**ShareLink**
```json
{
  "id": "string",
  "clientId": "string",
  "token": "string",
  "active": true,
  "createdAt": "ISO‑date‑time"
}
```

---

## 5. Tasks

> Base path: **`/tasks`** – all routes require authentication.

| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **GET** | `/tasks` | – | List all tasks. | `Array<Task>` |
| **GET** | `/tasks/:id` | – | Get a single task by `id`. | `<Task>` |
| **POST** | `/tasks` | `{ "title":"…", "description?":"…", "clientId?":"…", "deadline?":"YYYY-MM-DD" or ISO string, "priority?":"LOW|MEDIUM|HIGH|URGENT (case‑insensitive)" }` | Create a new task. | `<Task>` |
| **PATCH** | `/tasks/:id` | Any subset of `title`, `description`, `status`, `priority`, `deadline`, `clientId`. | Update task data. | `<Task>` |
| **DELETE** | `/tasks/:id` | – | Delete a task. | `null` |
> **Note:** `priority` values are case‑insensitive; any of `low`, `medium`, `high`, `urgent` will be normalized to the Prisma enum. Invalid values default to `MEDIUM`.
| **POST** | `/tasks/:id/assignees` | `{ "assigneeIds":["user-id-1","user-id-2"] }` | Assign one or more users to a task. | `<Task>` |
| **POST** | `/tasks/:id/revisions` | `{ "note":"…", "attachmentUrl?":"https://…" }` | Add a revision note to a task. | `<TaskRevision>` |

### Payload snippets (summary)

**Task**
```json
{
  "id": "string",
  "title": "string",
  "description": "string|null",
  "status": "TODO|IN_PROGRESS|BLOCKED|DONE",
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "deadline": "ISO-date-time|null",
  "clientId": "string|null",
  "createdById": "string",
  "client": { "id": "…", "name": "…" }|null,
  "assignees": [{ "id": "…", "user": { "id": "…", "name": "…" } }],
  "revisions": [{ "id": "…", "note": "…", "roundNumber": 1 }],
  "createdAt": "ISO-date-time"
}
```

**TaskRevision**
```json
{
  "id": "string",
  "taskId": "string",
  "submittedById": "string",
  "roundNumber": 1,
  "note": "string",
  "attachmentUrl": "string|null",
  "createdAt": "ISO-date-time"
}
```

---

## 6. Shoots

> Base path: **`/shoots`** – all routes require authentication.

| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **GET** | `/shoots` | – | List all shoots. | `Array<Shoot>` |
| **GET** | `/shoots/:id` | – | Get a single shoot by `id`. | `<Shoot>` |
| **POST** | `/shoots` | `{ "clientId?":"…", "title":"…", "scheduledAt":"YYYY-MM-DDTHH:mm:ss.sssZ", "location?":"…", "cost?": 2500 }` | Create a new shoot. | `<Shoot>` |
| **PATCH** | `/shoots/:id` | Any subset of `title`, `scheduledAt`, `location`, `cost`, `clientId`. | Update shoot data. | `<Shoot>` |
| **DELETE** | `/shoots/:id` | – | Delete a shoot. | `null` |
| **POST** | `/shoots/:id/crew` | `{ "crew":[{"userId":"…","role?":"Camera"}] }` | Assign crew members to the shoot. Requires each crew object to include a `userId`. | `<Shoot>` |
| **POST** | `/shoots/:id/gear` | `{ "name":"Tripod", "packed?": false }` | Add a gear item to the shoot checklist. | `<GearItem>` |

### Payload snippets (summary)

**Shoot**
```json
{
  "id": "string",
  "clientId": "string|null",
  "title": "string",
  "scheduledAt": "ISO-date-time",
  "location": "string|null",
  "cost": 2500,
  "client": { "id": "…", "name": "…" }|null,
  "crew": [{ "id": "…", "userId": "…", "role": "string|null", "user": { "id": "…", "name": "…" } }],
  "gearChecklist": [{ "id": "…", "name": "Tripod", "packed": false }],
  "createdAt": "ISO-date-time"
}
```

**GearItem**
```json
{
  "id": "string",
  "shootId": "string",
  "name": "string",
  "packed": false,
  "createdAt": "ISO-date-time"
}
```

---

## 7. Attendance & Leave

> Base path: **`/attendance`** – all routes require authentication.

| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **POST** | `/attendance/punch` | `{ "officeId":"…", "latitude": number, "longitude": number }` | Record a punch‑in. | `<Punch>` |
| **POST** | `/attendance/punch/out` | – | Find the logged‑in user’s active punch and record the punch‑out. | `<Punch>` |
| **PATCH** | `/attendance/punch/out` | – | Same as above; kept for compatibility with client apps. | `<Punch>` |
| **PATCH** | `/attendance/punch/:id/out` | – | Legacy route: record punch‑out for a specific punch `id`. | `<Punch>` |
| **POST** | `/attendance/punch/:id/lunch-start` | – | Start a lunch break for a punch. | `<LunchBreak>` |
| **PATCH** | `/attendance/lunch/:id/end` | – | End a lunch break. | `<LunchBreak>` |
| **GET** | `/attendance/today` | – | Fetch the logged‑in user’s attendance status for today. | `{ "punched_in": boolean, "punch_in_time": "ISO‑date‑time|null", "punch_out_time": "ISO‑date‑time|null" }` |
| **GET** | `/attendance/flagged` | – | List punches flagged for manager review. | `Array<Punch>` |
| **PATCH** | `/attendance/flagged/:id/approve` | – | Approve a flagged punch. | `<Punch>` |
| **PATCH** | `/attendance/flagged/:id/reject` | – | Reject a flagged punch. | `<Punch>` |
| **GET** | `/attendance/stats/:userId/:year/:month` | – | Monthly attendance statistics for a user. | `<AttendanceStats>` |
| **GET** | `/attendance/leave-request` | Get a leave requests. | `<LeaveRequests>` |
| **POST** | `/attendance/leave-request` | `{ "startDate":"YYYY‑MM‑DD", "endDate":"YYYY‑MM‑DD", "reason":"…" }` | Submit a leave request. | `<LeaveRequest>` |
| **PATCH** | `/attendance/leave/:id/approve` | – | Manager approves a leave request. | `<LeaveRequest>` |
| **PATCH** | `/attendance/leave/:id/reject` | – | Manager rejects a leave request. | `<LeaveRequest>` |
| **GET** | `/attendance/leave-balance/:userId` | – | Get remaining leave balance for a user. | `<LeaveBalance>` |

### Payload snippets (summary)

**Punch**
```json
{
  "id": "string",
  "userId": "string",
  "officeId": "string|null",
  "checkIn": "ISO‑date‑time",
  "checkOut": "ISO‑date‑time|null",
  "checkInLat": number|null,
  "checkInLng": number|null,
  "distanceM": number|null,
  "status": "ON_TIME|LATE|FLAGGED|APPROVED|REJECTED",
  "approvedById": "string|null",
  "lunchBreaks": [{ "id":"…", "start":"…", "end":"…" }],
  "createdAt": "ISO‑date‑time"
}
```

**LunchBreak**
```json
{ "id": "string", "punchId": "string", "start": "ISO‑date‑time", "end": "ISO‑date‑time|null" }
```

**LeaveRequest**
```json
{
  "id": "string",
  "userId": "string",
  "startDate": "ISO‑date",
  "endDate": "ISO‑date",
  "reason": "string",
  "status": "PENDING|APPROVED|REJECTED",
  "reviewedById": "string|null",
  "createdAt": "ISO‑date‑time"
}
```

---

## 8. Ping / Demo Route

| Method | Endpoint | Description | Success `data` |
|--------|----------|-------------|----------------|
| **GET** | `/health/ping` (exposed as `/health/` in the router) | Returns a simple *pong* message. | `{ "message": "pong" }` |

---

## 9. Calendar

> Base path: **`/calendar`** – all routes (except the public endpoint) require `requireAuth`.

### Payload shapes

**CalendarPost**
```json
{
  "id": "string",
  "clientId": "string",
  "taskId": "string|null",
  "caption": "string|null",
  "postType": "string",
  "scheduledDate": "ISO‑date‑time",
  "approvalStatus": "string|null",
  "revisionReason": "string|null",
  "posted": false,
  "postedAt": "ISO‑date‑time|null",
  "createdAt": "ISO‑date‑time",
  "updatedAt": "ISO‑date‑time"
}
```

**CreateCalendarPostRequest**
```json
{
  "clientId": "string",
  "taskId": "string|null",
  "caption": "string|null",
  "postType": "string",
  "scheduledDate": "ISO‑date‑time",
  "approvalStatus": "string|null",
  "revisionReason": "string|null"
}
```

**UpdateCalendarPostRequest** – any subset of CalendarPost fields.

### Endpoints

| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **GET** | `/calendar` | – | List all calendar posts. | `Array<CalendarPost>` |
| **GET** | `/calendar/:id` | – | Retrieve a single calendar post. | `CalendarPost` |
| **POST** | `/calendar` | `CreateCalendarPostRequest` | Create a new calendar post. | `CalendarPost` |
| **PATCH** | `/calendar/:id` | `UpdateCalendarPostRequest` | Update an existing post. | `CalendarPost` |
| **DELETE** | `/calendar/:id` | – | Delete a calendar post. | `null` |
| **PATCH** | `/calendar/:id/mark-posted` | – | Mark the post as posted (sets `posted` flag). | `CalendarPost` |

### Public read‑only endpoint (no auth)

| Method | Endpoint | Query Params | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **GET** | `/clients/:clientId/calendar` | `token` (share‑link token) | Fetch public calendar posts for a client after validating the token. | `Array<CalendarPost>` |

### Integration Quick‑Check List
1. **Base URL** – prepend your deployment host (e.g. `https://api.team‑os.com`).
2. **Auth header** – after login/registration, store `token` and add `Authorization: Bearer <token>` to all subsequent calls.
3. **Error handling** – on failure `success` is `false`, `status` contains the HTTP error code, and `data` is `null` (or may contain validation details).
4. **Date formats** – all timestamps are ISO‑8601 strings.
5. **Pagination** – currently list endpoints return the full collection (no pagination).

---

## 10. Leads
> Base path: **`/leads`** – all routes require authentication.

### Payload shapes
**Lead**
```json
{
  "id": "string",
  "name": "string",
  "stage": "NEW|CONTACTED|QUALIFIED|PROPOSAL|CLOSED",
  "clientId": "string|null",
  "ownerId": "string",
  "createdAt": "ISO-date-time",
  "updatedAt": "ISO-date-time"
}
```

### Endpoints
| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **GET** | `/leads` | – | List all leads. | `Array<Lead>` |
| **GET** | `/leads/:id` | – | Retrieve a lead by ID. | `Lead` |
| **POST** | `/leads` | `Lead` (without `id`, timestamps) | Create a new lead. | `Lead` |
| **PATCH** | `/leads/:id` | Partial `Lead` | Update a lead. | `Lead` |
| **DELETE** | `/leads/:id` | – | Delete a lead. | `null` |

---

## 11. Finance
> Base path: **`/finance`** – all routes require authentication.

### Payload shapes
**FinanceEntry**
```json
{
  "id": "string",
  "type": "INCOME|EXPENSE",
  "category": "string",
  "amount": number,
  "month": "YYYY-MM",
  "clientId": "string|null",
  "isInternal": boolean,
  "note": "string|null",
  "enteredById": "string",
  "createdAt": "ISO-date-time",
  "updatedAt": "ISO-date-time"
}
```

### Endpoints
| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **GET** | `/finance` | – | List finance entries (optional `month`, `clientId` query). | `Array<FinanceEntry>` |
| **GET** | `/finance/:id` | – | Retrieve a finance entry. | `FinanceEntry` |
| **POST** | `/finance` | `FinanceEntry` (without `id`, timestamps) | Create a new entry. | `FinanceEntry` |
| **PATCH** | `/finance/:id` | Partial `FinanceEntry` | Update an entry. | `FinanceEntry` |
| **DELETE** | `/finance/:id` | – | Delete an entry. | `null` |
| **GET** | `/finance/summary/:year/:month` | – | Summarize totals per category/type for a month. | `Array<{category:string,type:string,total:number}>` |

## 12. Notifications

> Base path: **`/notifications`** – all routes require authentication (admin/system creates also require a valid token).

| Method | Endpoint | Request Body (JSON) | Description | Success `data` |
|--------|----------|---------------------|-------------|----------------|
| **GET** | `/notifications` | – | List all notifications for the logged‑in user. | `Array<Notification>` |
| **POST** | `/notifications` | `{ "userId": "string", "title": "string", "message": "string", "link?": "string", "whatsappLink?": "string" }` | Create a new notification for a specific user (admin/system use). | `<Notification>` |
| **PATCH** | `/notifications/:id/read` | `{ "read": true|false }` | Toggle the read/unread status of a notification. Only the owner may modify. | `<Notification>` |

### Payload shapes

**Notification**
```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "message": "string",
  "link": "string|null",
  "whatsappLink": "string|null",
  "read": false,
  "createdAt": "ISO‑date‑time"
}
```

**CreateNotificationRequest**
```json
{
  "userId": "string",   // The unique identifier of the user who will receive the notification. This corresponds to the `id` field of the `User` model (e.g., a UUID or database primary key). It must reference an existing user; otherwise the request is rejected.
  "title": "string",    // Short title of the notification.
  "message": "string",  // Full message body.
  "link": "string|null", // Optional URL that the notification can link to (e.g., a task or document view).
  "whatsappLink": "string|null" // Optional WhatsApp deep‑link for mobile notifications.
}
```

### Behaviour details
1. **Authentication** – All routes are protected by `requireAuth`. The `create` endpoint is intended for admin or system processes; it still requires a valid token, typically an admin token.
2. **User ID (`userId`)** – The `userId` field identifies the target user of the notification. It maps directly to the primary key of the `User` table in the Prisma schema. The service does not resolve usernames; the caller must supply the exact identifier.
3. **Listing** – `GET /notifications` returns notifications owned by the authenticated user, ordered by `createdAt` descending (most recent first).
4. **Read status** – The `read` flag is a boolean stored on the `Notification` record. The PATCH route updates this flag; only the notification owner can change it.
5. **Response envelope** – All endpoints follow the standard API response envelope (see top of this document). The `data` field contains the notification object(s) as defined above.
6. **Error handling** – Missing `userId`, `title`, or `message` on creation returns `400 Bad Request`. Attempting to modify a notification that does not belong to the authenticated user returns `403 Unauthorized`. Non‑existent IDs return `404 Not Found`.

---

## Salary Slip API Documentation

## Overview
Endpoints for generating and retrieving employee salary slips as PDFs. The slip generation is **idempotent per user per month** – if a slip already exists for the requested month, the existing PDF is returned instead of creating a new one.

## Endpoints

### POST `/api/v1/salary-slips`
Create (or fetch existing) a salary slip PDF.

**Headers**
- `Authorization: Bearer <token>` – must resolve to a user via the existing `requireAuth` middleware.

**Request Body (JSON)** – all fields are required:
```json
{
  "employeeId": "<user-id>",
  "salaryMonth": "YYYY-MM",        // e.g. "2024-09"
  "monthlySalary": 10000,            // number
  "attendanceDays": 22,              // number of days worked in the month
  "paidLeaves": 2,                   // number of paid leaves taken
  "unpaidLeaves": 1,                 // number of unpaid leaves taken
  "salaryPaymentDate": "2024-10-01" // ISO date string
}
```

**Responses**
- **201 Created** – a new slip was generated.
- **200 OK** – a slip already existed for this user/month and is returned.
- **400 Bad Request** – missing required fields.
- **401 Unauthorized** – no valid auth token.

**Response body (JSON)**
```json
{
  "success": true,
  "message": "Salary slip generated" | "Salary slip already generated for this month",
  "status": 201 | 200,
  "data": {
    "id": "YYYY-MM-DD_<userId>",
    "url": "/api/v1/salary-slips/<id>"
  }
}
```
The `url` can be used directly in an `<iframe src="...">` on the frontend to display the PDF.

### GET `/api/v1/salary-slips/:id`
Retrieve a generated salary slip PDF.

**Headers**
- `Authorization: Bearer <token>` – must belong to the owner of the slip.

**Path Parameter**
- `:id` – the identifier returned by the POST call (format `YYYY-MM-DD_<userId>`).

**Responses**
- **200 OK** – streams the PDF with `Content-Type: application/pdf`. This is iframe‑friendly.
- **401 Unauthorized** – missing or invalid auth.
- **403 Forbidden** – the authenticated user does not own the requested slip.
- **404 Not Found** – slip does not exist or the file is missing.

## Behaviour Details
1. **Idempotency** – The controller checks the `SalarySlip` table for a record matching the authenticated user and the month (`salaryMonth`). If found, the existing slip’s `id` and URL are returned; no new PDF is created.
2. **Naming** – Generated PDFs are saved as `YYYY-MM-DD_<userId>.pdf` inside the `uploads/` folder. The database stores the relative path (`uploads/<filename>.pdf`).
3. **Database** – A new `SalarySlip` model (see Prisma schema) tracks:
   - `id` (primary key, matches the filename without extension)
   - `userId` (FK to `User`)
   - `month` (first‑day of the month, UTC)
   - `pdfPath` (relative file location)
   - `createdAt`
   The combination of `userId` and `month` is unique.
4. **Security** – Both routes are protected by `requireAuth`. The GET handler verifies ownership before streaming the file.
5. **Iframe‑friendly** – The GET response includes `Content-Type: application/pdf`, allowing direct embedding in an `<iframe>`.

## Example Frontend Usage
```html
<iframe src="/api/v1/salary-slips/2024-09-15_abc123" width="100%" height="800px" frameborder="0"></iframe>
```
The iframe will display the PDF if the logged‑in user owns that slip.

---

*Generated with Claude Code – API documentation for Salary Slip feature.*

---

*Generated with **Claude Code** – ready to be handed to the front‑end team for immediate integration.*