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

## 5. Attendance & Leave

> Base path: **`/attendance`** – all routes require authentication.

| Method | Endpoint | Request Body | Description | Success `data` |
|--------|----------|--------------|-------------|----------------|
| **POST** | `/attendance/punch` | `{ "officeId":"…", "latitude": number, "longitude": number }` | Record a punch‑in. | `<Punch>` |
| **PATCH** | `/attendance/punch/:id/out` | – | Record punch‑out for the given punch `id`. | `<Punch>` |
| **POST** | `/attendance/punch/:id/lunch-start` | – | Start a lunch break for a punch. | `<LunchBreak>` |
| **PATCH** | `/attendance/lunch/:id/end` | – | End a lunch break. | `<LunchBreak>` |
| **GET** | `/attendance/flagged` | – | List punches flagged for manager review. | `Array<Punch>` |
| **PATCH** | `/attendance/flagged/:id/approve` | – | Approve a flagged punch. | `<Punch>` |
| **PATCH** | `/attendance/flagged/:id/reject` | – | Reject a flagged punch. | `<Punch>` |
| **GET** | `/attendance/stats/:userId/:year/:month` | – | Monthly attendance statistics for a user. | `<AttendanceStats>` |
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
{ "id": "string", "punchId": "string", "start": "ISO‑date‑time", "end": "ISO‑date-time|null" }
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

## 6. Ping / Demo Route

| Method | Endpoint | Description | Success `data` |
|--------|----------|-------------|----------------|
| **GET** | `/health/ping` (exposed as `/health/` in the router) | Returns a simple *pong* message. | `{ "message": "pong" }` |

---

### Integration Quick‑Check List
1. **Base URL** – prepend your deployment host (e.g. `https://api.team‑os.com`).
2. **Auth header** – after login/registration, store `token` and add `Authorization: Bearer <token>` to all subsequent calls.
3. **Error handling** – on failure `success` is `false`, `status` contains the HTTP error code, and `data` is `null` (or may contain validation details).
4. **Date formats** – all timestamps are ISO‑8601 strings.
5. **Pagination** – currently list endpoints return the full collection (no pagination).

---

*Generated with **Claude Code** – ready to be handed to the front‑end team for immediate integration.*