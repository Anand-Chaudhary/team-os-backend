# Unreal Studioz — "Team OS" Rebuild — Build Plan

Tracks remaining work against the proposal's modules and the Prisma schema.
Check items off as they're built. Each phase assumes the previous phase's
 data model is in place (phases are ordered by dependency, not by proposal
 section number).

---

## Phase 0 — Foundation

- [x] Authentication & Account System
  - [x] Login / logout, secure password auth
  - [x] Session management (access + refresh tokens)
  - [x] Join-request flow (new staff registration → admin approval)
  - [x] Self-service password change
  - [x] Role-based access: Super Admin, Leader, Manager, Executive, Sales, Client
  - [x] Server-enforced per-user/per-module permission matrix
  - [x] Protected dashboards by role

**Milestone: staff can log in, get routed to a role-correct dashboard, and every API route rejects unauthorized calls server-side.**

---

## Phase 1 — Core Data Layer

- [x] Team Management (admin CRUD)
  - [x] Employee CRUD: role, permission level, job type, work hours/grace period
  - [x] Approve/reject pending join requests (admin-side UI)
  - [x] Activate/deactivate accounts
- [x] Client Management
  - [x] Client (brand) records: contact info, POC staff, WhatsApp group link, content tags
  - [x] Per-client monthly content plan/goal
  - [x] Auto-generate tokenized read-only calendar share link per client

**Milestone: an admin can add a staff member and a client from scratch, with correct roles and relationships, with nothing left in placeholder/mock data.**

---

## Phase 2 — Attendance & Leave

- [x] Punch in/out with geofence validation against office coordinates
- [x] Lunch break timer/tracking
- [x] Late/on-time computation against configured report time + grace period
- [x] Manager approval queue for out-of-geofence punches
- [x] Monthly attendance history and stats per employee
- [x] Leave request and approval workflow
- [x] Leave calculations (each employee has 2 paid leaves put the logic to calculate if any leaves have been taken by the employee or not also update the model for it and while getting employee also show that)

**Milestone: a staff member can punch in/out from the field, a flagged (out-of-geofence) punch shows up in a manager's approval queue, and monthly stats are correct.**

---

## Phase 3 — Task & Production Management

- [x] Task creation and assignment (single/multiple assignees)
- [x] Deadlines, priority, auto-escalation as deadlines approach
- [x] Status lifecycle: planned → in progress → submitted → internal QC → approved/revision → posted
- [x] Revision rounds with visible history log per task
- [x] Internal QC/approval gate before anything reaches the client
- [x] Shoot/production scheduling: crew assignment, gear checklist, cost logging
- [x] "My Work" view sorted by deadline/priority per staff member

**Milestone: a task can move through the full lifecycle end-to-end (create → assign → submit → QC → approve → post) with a visible revision log, and a shoot can be scheduled with crew + gear checklist.**

---

## Phase 4 — Content Calendar + Client Portal

- [x] Content Calendar
  - [x] Month-grid view, filterable by content type
  - [x] Per-post detail: caption, scheduled date, post type, approval status
  - [x] "Mark as posted" action
  - [x] Public share view (read-only, token-based, no login)
- [x] Client Portal
  - [x] Month scorecard (planned/posted/approved/scheduled counts)
  - [x] Approve / request revision / reject on submitted content, with reason/comment
  - [x] Submit ad‑hoc requests to the agency (optional assignee + deadline)
  - [x] View own calendar
  - [x] Notifications inbox (portal‑side)

**Milestone: a client contact can log in, see their calendar, approve or request revision on a post with a reason, and submit an ad‑hoc request — all without staff intervention.**

---

## Phase 5 — Leads & Finance

- [ ] Leads Pipeline
  - [ ] Lead capture with stage tracking (new → contacted → qualified → won/lost)
  - [ ] Assignment to sales staff
  - [ ] Basic list/filter view
- [ ] Finance
  - [ ] Monthly income/expense entries by category, by client or internal
  - [ ] Monthly summary/report view
  - [ ] Restricted to Super Admin/Leader roles

**Milestone: a lead can be captured and moved through stages, and a monthly income/expense report renders correctly with role restriction enforced.**

---

## Phase 6 — Notifications & Onboarding

- [ ] In-app notification feed per user (read/unread state)
- [ ] Optional WhatsApp deep-link handoff for a notification
- [ ] Onboarding flow: chat-style landing intro wired to real server-side signup data

**Milestone: a status change (e.g. task approved, punch flagged) generates a notification the relevant user actually sees, and the public landing page collects real signups.**

---

## Phase 7 — Non-Functional / Launch Readiness

- [ ] Audit log for approvals, deletions, and permission changes
- [ ] Automated tests: permission matrix + task/approval state machine (minimum bar from the proposal)
- [ ] Error monitoring/logging (e.g. Sentry) replacing silent try/catch
- [ ] Data migration script: Apps Script/Google Sheets → new schema
- [ ] Mobile-responsive pass across all modules
- [ ] Staging deployment, smoke test, domain cutover
- [ ] Basic admin documentation (add employees, add clients, manage permissions)

**Milestone: staging is fully tested and approved, migration has run against real data without loss, and the domain is pointed at the new system.**

---

## Suggested order of attack

```
Phase 0 (done) → Phase 1 → Phase 2 ─┐
                                      ├─→ Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
                            Phase 1 ─┘
```

Phase 1 (team + client records) unblocks everything downstream — attendance needs
employees to exist, tasks/calendar need clients to exist. Phase 2 (attendance) and
Phase 3 (tasks) can run in parallel once Phase 1 is done, since they don't depend
on each other. Phase 4 depends on Phase 3 (calendar posts can originate from tasks).
Phase 5 is independent and can be pulled forward or done in parallel if useful.
Phase 6 and 7 close out the project once everything above is functionally complete.
