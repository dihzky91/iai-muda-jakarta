# HR Command Center - IAI Muda Jakarta

## Overview

HR Command Center adalah sistem manajemen SDM untuk IAI Muda Wilayah DKI Jakarta yang dirancang berdasarkan FGD Calon Pengurus HR Periode 2026/2027.

### Framework SOS (Systematic Control, Operational Standard, Solidarity Internal)

1. **Systematic Control** → Real-time status monitoring + Academic Load tracking
2. **Operational Standard** → Leave system + SOP intervention tracking + Monthly evaluation
3. **Solidarity Internal** → (mostly offline, light support in system)

### Problems Solved

- ❌ **Before**: No radar to detect withdrawing members
- ✅ **Now**: Real-time status tracking (Hijau/Kuning/Merah/Biru)

- ❌ **Before**: Unstructured leave (cuti)
- ✅ **Now**: Formal leave request system with H-10 rule & 7 days/2 months quota

- ❌ **Before**: No visibility of academic load (UTS/UAS conflicts)
- ✅ **Now**: Self-reported weekly academic load from 13+ universities

- ❌ **Before**: Difficulty providing data to BPH
- ✅ **Now**: Dashboard with charts, reports, and member history

- ❌ **Before**: Reactive HR culture
- ✅ **Now**: Proactive SOP intervention tracking (H+1 to H+21)

---

## Database Tables

### 1. `member_statuses`
Track status changes over time (append-only log).

**Columns:**
- `id` - Primary key
- `member_id` - FK to members
- `status` - ENUM('hijau', 'kuning', 'merah', 'biru')
- `reason` - TEXT (optional explanation)
- `changed_by` - FK to users (admin who changed)
- `created_at` - Timestamp

**Status Meanings:**
- 🟢 **Hijau**: Normal / Active
- 🟡 **Kuning**: Early Warning (needs attention)
- 🔴 **Merah**: Critical (immediate intervention needed)
- 🔵 **Biru**: On Leave (Cuti)

### 2. `member_academic_loads`
Self-reported academic load per week.

**Columns:**
- `id` - Primary key
- `member_id` - FK to members
- `week_start` - VARCHAR(10) YYYY-MM-DD (Monday)
- `load_type` - ENUM('uts', 'uas', 'quiz', 'project', 'sick', 'personal', 'other')
- `description` - TEXT (optional details)
- `intensity` - ENUM('low', 'medium', 'high')
- `created_at`, `updated_at`

### 3. `leave_requests`
Leave (cuti) request workflow.

**Columns:**
- `id` - Primary key
- `member_id` - FK to members
- `start_date`, `end_date` - VARCHAR(10) YYYY-MM-DD
- `reason` - TEXT (required)
- `leave_type` - ENUM('regular', 'emergency')
- `status` - ENUM('pending', 'approved', 'rejected')
- `reviewed_by` - FK to users (admin who reviewed)
- `reviewed_at` - Timestamp
- `review_notes` - TEXT
- `submitted_at` - Timestamp
- `created_at`, `updated_at`

**Business Rules:**
- Max 7 days per 2 months
- Regular leave: must submit H-10 (10 days advance)
- Emergency leave: can skip H-10 rule

### 4. `intervention_logs`
SOP intervention tracking (H+1 to H+21).

**Columns:**
- `id` - Primary key
- `member_id` - FK to members
- `stage` - ENUM('h1', 'h3', 'h3_h7', 'h7_zoom', 'h7_h14', 'h14_h21', 'post_h21')
- `notes` - TEXT
- `action_taken` - TEXT
- `performed_by` - FK to users
- `scheduled_date` - VARCHAR(10) YYYY-MM-DD
- `completed_date` - VARCHAR(10) YYYY-MM-DD (null if ongoing)
- `created_at`

**SOP Timeline:**
- **H+1**: First contact
- **H+3**: Follow-up
- **H+3 to H+7**: Continuous monitoring
- **H+7**: Zoom Evaluation I
- **H+7 to H+14**: Extended monitoring
- **H+14 to H+21**: Final monitoring period
- **Post H+21**: Post-intervention follow-up

### 5. `monthly_evaluations`
HR monthly evaluations per member.

**Columns:**
- `id` - Primary key
- `member_id` - FK to members
- `month` - VARCHAR(7) YYYY-MM
- `evaluation_notes` - TEXT
- `action_items` - TEXT
- `rating` - INT (1-5)
- `evaluated_by` - FK to users
- `created_at`, `updated_at`

**Unique Constraint:** (member_id, month)

---

## API Routes

### Admin Routes (Require admin/superadmin role)

#### Dashboard
- `GET /api/hr/dashboard` - HR Command Center overview

#### Members
- `GET /api/hr/members` - List all members with current status
- `GET /api/hr/members/[id]` - Member detail + full HR history
- `POST /api/hr/members/[id]/status` - Change member status

#### Leave Management
- `GET /api/hr/leave?status=pending` - List leave requests (optional filter)
- `PATCH /api/hr/leave/[id]` - Approve/reject leave request

#### Interventions
- `GET /api/hr/interventions?memberId=123` - List interventions (optional filter)
- `POST /api/hr/interventions` - Create intervention log

#### Evaluations
- `GET /api/hr/evaluations?memberId=123&month=2026-07` - List evaluations
- `POST /api/hr/evaluations` - Create/update monthly evaluation

### Member Portal Routes (Require member auth)

#### Status
- `GET /api/member/hr/status` - Get own current status

#### Academic Load
- `GET /api/member/hr/academic-load` - Get own academic loads
- `POST /api/member/hr/academic-load` - Submit/update weekly academic load

#### Leave
- `GET /api/member/hr/leave` - Get own leave requests
- `POST /api/member/hr/leave` - Submit new leave request (with validation)

---

## Database Migration

### Generate Migration

```bash
npx drizzle-kit generate:mysql
```

This will generate SQL migration files in `db/migrations/` based on the schema changes.

### Apply Migration

```bash
npx drizzle-kit push:mysql
```

Or manually run the generated SQL against your TiDB database.

### Verify Migration

```bash
npx drizzle-kit introspect:mysql
```

Check that all 5 new tables exist with proper indices and foreign keys.

---

## Admin UI Usage

### Access HR Command Center

1. Login as admin at `/admin/login`
2. Click **"HR Command Center"** tab in left sidebar
3. You'll see 5 sub-sections:
   - Dashboard
   - Members
   - Leave
   - Interventions
   - Evaluations

### Dashboard

Shows:
- Status distribution pie chart (Hijau/Kuning/Merah/Biru counts)
- Members needing attention (Merah & Kuning)
- Pending leave requests
- Ongoing interventions
- Members who haven't updated academic load this week

### Members Management

- View all members with color-coded status badges
- Filter by status, generation, or division
- Click member → See full HR history (status, academic load, leaves, interventions, evaluations)
- **Change Status**: Click "Change Status" button → Select new status + reason

### Leave Management

- View all leave requests (pending/approved/rejected)
- Filter by status
- **Approve/Reject**: Click on pending request → Add review notes → Approve or Reject

### Interventions

- View all intervention logs
- Filter by member
- **Log Intervention**: Click "Add Intervention" → Select member, stage, notes, action taken, dates

### Evaluations

- View monthly evaluations
- Filter by member or month
- **Create Evaluation**: Click "Add Evaluation" → Select member, month, notes, action items, rating (1-5)

---

## Member Portal Usage

### View HR Status

On portal dashboard (`/portal/dashboard`), you'll see 3 new cards:

#### 1. HR Status Card
- Shows current status badge (Hijau/Kuning/Merah/Biru)
- Displays reason if status is not Hijau
- Last updated timestamp

#### 2. Academic Load Card
- "This Week's Load" indicator
- Button: **"Update Load"** → Opens form
- Shows current intensity (Low/Medium/High) if already submitted

**How to Update:**
1. Click "Update Load"
2. Select load type (UTS, UAS, Quiz, Project, Sick, Personal, Other)
3. Select intensity (Low/Medium/High)
4. Add description (optional)
5. Submit

#### 3. Leave Request Card
- Button: **"Request Leave"** → Opens form
- Shows status of last leave request

**How to Request Leave:**
1. Click "Request Leave"
2. Fill in:
   - Start date & End date (max 7 days)
   - Reason (required)
   - Leave type: Regular (H-10 rule) or Emergency
3. Submit
4. Wait for HR approval

**Important Rules:**
- Max 7 days per 2 months
- Regular leave must be submitted at least 10 days in advance
- Emergency leave can skip the 10-day rule

---

## Best Practices

### For HR Admin

1. **Status Update Frequency**: Update member status at least weekly
2. **Intervention Timing**: Log each intervention stage promptly
3. **Leave Response Time**: Review pending leaves within 2-3 days
4. **Monthly Evaluation**: Complete evaluations by the 5th of each month
5. **Dashboard Monitoring**: Check dashboard daily for members needing attention

### For Members

1. **Academic Load**: Update every Monday morning for the current week
2. **Leave Planning**: Submit regular leave requests at least 10 days in advance
3. **Status Awareness**: Check your status regularly, reach out to HR if yellow/red
4. **Honesty**: Be honest about academic load and personal challenges

---

## Technical Notes

### Access Control

- **Admin Side**: Only users with role `admin` or `superadmin` can access `/api/hr/*` endpoints
- **Member Side**: Only authenticated members can access `/api/member/hr/*` for their own data
- **Academic Load Privacy**: Only HR admins can see other members' academic loads

### Status Algorithm (Future Enhancement)

Currently, status changes are 100% manual. Future versions may include:
- Auto-suggestion based on academic load + event attendance
- Warning alerts when member hasn't updated load for 2+ weeks
- Predictive analytics for withdrawal risk

### Performance Considerations

- Status queries use indexed lookups (member_id, created_at)
- Dashboard aggregations are optimized with proper indices
- Leave validation queries are cached for 2-month window

---

## Support & Feedback

For technical issues or feature requests related to HR Command Center:
- Contact: IAI Muda Tech Team
- Report bugs via `/reportbug` command in the system

---

**Version:** 1.0.0 (MVP)
**Last Updated:** July 2026
**Maintained By:** IAI Muda Jakarta Development Team
