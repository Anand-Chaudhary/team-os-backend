# Salary Slip API Documentation

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
