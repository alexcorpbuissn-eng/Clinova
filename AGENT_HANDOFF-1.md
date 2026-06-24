# Clinova SaaS Transformation — Agent Handoff

## Project Identity

| Field | Value |
|-------|-------|
| **Repository** | `https://github.com/alexcorpbuissn-eng/Clinova` |
| **Local path** | `C:\Project JndA\Clinova` |
| **Vercel URL** | `https://clinova-woad.vercel.app` |
| **GitHub account for push** | `alexcorpbuissn-eng` |
| **Switch account** | `gh auth switch --user alexcorpbuissn-eng` |
| **DB** | Neon PostgreSQL (serverless) — `DATABASE_URL` only in Vercel env vars, never locally |

**What this project is:** A dental clinic booking system ("Habibullo-Hilola") being converted into a multi-tenant SaaS platform called "Clinova". Each clinic is a tenant. Zero cross-tenant data leakage.

---

## Non-Negotiable Rules

1. **NEVER use `prisma migrate dev`** — only `npx prisma db push`
2. **Vercel deploys from the repo root**, not from `booking-module/`. Always apply schema changes to both `prisma/schema.prisma` (root) AND `booking-module/prisma/schema.prisma` to keep them in sync. Vercel uses root.
3. `Patient` has **no `clinicId`** — it is a global model. Isolation is via `Appointment.clinicId`.
4. `Otp` has **no `clinicId`** — global.
5. `User.clinicId` is **permanently `String?`** (nullable) — SUPER_ADMIN has no clinic.
6. After each significant step: commit + push (as `alexcorpbuissn-eng`).
7. Report to user before pushing after schema changes.

---

## Stack

- **Next.js 15** App Router — API routes only in `/src/app/api/`. Frontend is pure HTML/Vanilla JS in `/public/`.
- **Prisma ORM v7.8.0** — Breaking change: `url` is NOT in `schema.prisma` datasource; it lives in `prisma.config.ts` as `process.env.DATABASE_URL ?? ''`
- **`vercel.json`** has `"buildCommand": "npx prisma db push && next build"` — schema is auto-pushed to Neon on every Vercel deploy
- **JWT auth** via `jose` library. Payload: `{ userId, role, clinicId?, doctorId? }`

---

## Overall SaaS Transformation Plan

6 stages total. Stage 1 is **complete**. Stage 2 is **partially complete** (see below).

| Stage | Description | Status |
|-------|-------------|--------|
| 1 | `Clinic` model, `clinicId` on all models, `SUPER_ADMIN` role, JWT clinicId | ✅ Complete |
| 2 | `clinicId` injected into all `create`/`createMany` calls | ⏳ In progress — changes made, **not yet pushed** |
| 3 | Add `clinicId` filters to all `findMany`/`findUnique` GET routes (read isolation) | ❌ Not started |
| 4 | Tenant onboarding UI — create new clinics, assign admins | ❌ Not started |
| 5 | Per-clinic Telegram bot tokens | ❌ Not started |
| 6 | Billing, plan enforcement, SUPER_ADMIN dashboard | ❌ Not started |

---

## Stage 1 — Complete (Pushed)

### Commits on `main`

| Commit | Description |
|--------|-------------|
| `43471e3` | Stage 1 schema changes, auth.ts, clinic-guard.ts, login route |
| `4ea8c57` | Copied changes to root (Vercel deploys from root) |
| `23c6c85` | Fixed TS error: `doctorId: user.doctorId ?? undefined` in verify-otp |
| `53f7c36` | Pass 2: `clinicId String?` → `clinicId String` NOT NULL for 9 models |
| `79d3776` | Cleanup: deleted seed files and one-time HTTP seed endpoint |

### What Stage 1 Included

**`prisma/schema.prisma`** — Added:
- `Clinic` model with all required fields: `id, name, slug, logoUrl, address, phone, telegramBotToken, telegramBotUsername, timezone, isActive, plan, planExpiresAt, createdAt, updatedAt`
- `ClinicPlan` enum: `TRIAL, BASIC, PRO, ENTERPRISE`
- `SUPER_ADMIN` added to `Role` enum
- `clinicId String` (NOT NULL) + `clinic Clinic @relation(...)` + `@@index([clinicId])` on: Doctor, Leave, Procedure, Slot, Complaint, Appointment, SavedDraft, Visit, Purchase
- `User.clinicId String?` stays nullable permanently

**`prisma.config.ts`** — `datasource.url = process.env.DATABASE_URL ?? ''` (avoids Prisma throwing when no local DB)

**`vercel.json`** — `buildCommand: "npx prisma db push && next build"`

**`src/lib/auth.ts`** — `JWTPayload` extended with `clinicId?: string` and `doctorId?: string`

**`src/lib/clinic-guard.ts`** (new file) — `requireClinicAccess(request)` and `requireRole(request, roles[])` — extracts session with `{ userId, role, clinicId, doctorId }` from JWT

**`src/app/api/doctor/login/route.ts`** — JWT now includes `clinicId: user.clinicId ?? undefined`

**Seeding:** One-time HTTP endpoint `/api/superadmin/seed-stage1` ran on Vercel and created the "Habibullo-Hilola" clinic. Endpoint is now deleted. Clinic record in production DB:

```json
{
  "id": "a826d7e9-84fc-403b-b090-8db7e61bec89",
  "name": "Habibullo-Hilola",
  "slug": "habibullo-hilola"
}
```

---

## Stage 2 — In Progress (NOT YET PUSHED)

**Current git status: 16 files modified, uncommitted.**

The build was failing because `clinicId String` (NOT NULL) was being violated by create calls that didn't pass `clinicId`. All 13 create call sites have been fixed. The user has reviewed and approved the changes but has not yet said "push."

### Files Modified (Not Committed)

| File | Change |
|------|--------|
| `src/lib/slot-generator.ts` | Added `clinicId: string` param to `generateSlotsForDoctor()`; passes it into `toCreate` array |
| `src/app/api/admin/doctors/route.ts` | Import `requireClinicAccess`; POST uses session; `prisma.doctor.create` gets `clinicId: session.clinicId`; `generateSlotsForDoctor` caller updated |
| `src/app/api/admin/doctors/[id]/route.ts` | `generateSlotsForDoctor(doctor.id)` → `generateSlotsForDoctor(doctor.id, doctor.clinicId)` |
| `src/app/api/cron/generate-slots/route.ts` | `generateSlotsForDoctor(doctor.id, 30)` → `generateSlotsForDoctor(doctor.id, doctor.clinicId, 30)` |
| `src/app/api/admin/leaves/route.ts` | Import `requireClinicAccess`; POST uses session; `prisma.leave.create` gets `clinicId` |
| `src/app/api/admin/slots/route.ts` | `toCreate` type includes `clinicId`; bulk `toCreate.push` gets `clinicId: doctor.clinicId`; single `slot.create` gets `clinicId: doctor.clinicId` |
| `src/app/api/admin/visits/route.ts` | Import `requireClinicAccess`; POST uses session; `prisma.visit.create` gets `clinicId` |
| `src/app/api/admin/appointments/route.ts` | Import `requireClinicAccess`; POST uses session; `tx.appointment.create` gets `clinicId: session.clinicId` |
| `src/app/api/admin/appointments/[id]/route.ts` | `prisma.visit.create` gets `clinicId: appointment.clinicId` (derived from the appointment being marked complete) |
| `src/app/api/doctor/book/route.ts` | Rewritten: uses `requireClinicAccess`; `tx.appointment.create` gets `clinicId: session.clinicId` |
| `src/app/api/doctor/slots/route.ts` | Import `requireClinicAccess`; POST uses session; `prisma.slot.create` gets `clinicId: session.clinicId` |
| `src/app/api/inventory/purchases/route.ts` | Import `requireClinicAccess`; POST uses session; `prisma.purchase.create` gets `clinicId: session.clinicId`; `recordedBy: null` (JWT payload has no phone) |
| `src/app/api/public/book/route.ts` | `tx.appointment.create` gets `clinicId: slot.clinicId` — derived from slot row (`s.*` in raw SQL includes clinicId) |
| `src/app/api/public/complaints/route.ts` | Now requires `clinicSlug` in request body; does `prisma.clinic.findFirst({ where: { slug: clinicSlug, isActive: true } })`; `prisma.complaint.create` gets `clinicId: clinic.id` |
| `src/app/api/reception/drafts/route.ts` | Import `requireClinicAccess`; POST uses session; `prisma.savedDraft.create` gets `clinicId` |

### What Was NOT Modified (Intentionally)

- `prisma.patient.create` in 3 files — Patient is global, no clinicId
- `prisma.user.create` in `verify-otp/route.ts` — User.clinicId is nullable; bootstrap case has no clinic context

---

## Immediate Next Action

**The 15 modified route/lib files are ready to commit.** Wait for user to say "push," then:

```bash
cd "C:/Project JndA/Clinova"
gh auth switch --user alexcorpbuissn-eng

git add src/lib/slot-generator.ts \
  src/app/api/admin/appointments/route.ts \
  "src/app/api/admin/appointments/[id]/route.ts" \
  src/app/api/admin/doctors/route.ts \
  "src/app/api/admin/doctors/[id]/route.ts" \
  src/app/api/admin/leaves/route.ts \
  src/app/api/admin/slots/route.ts \
  src/app/api/admin/visits/route.ts \
  src/app/api/cron/generate-slots/route.ts \
  src/app/api/doctor/book/route.ts \
  src/app/api/doctor/slots/route.ts \
  src/app/api/inventory/purchases/route.ts \
  src/app/api/public/book/route.ts \
  src/app/api/public/complaints/route.ts \
  src/app/api/reception/drafts/route.ts

git commit -m "feat(saas): Stage 2 — inject clinicId into all create calls (14 files)"
git push origin main
```

> **Do NOT stage `booking-module/package-lock.json`** — it is an unrelated change.

After the deploy goes green, verify the build passes. The `prisma db push` in `buildCommand` will run but is a no-op since the schema is already in sync.

---

## What Comes After — Stage 2 Remainder (Read Isolation)

Stage 2 is not just writes — it also includes **read isolation**: every `findMany`/`findUnique` in GET routes must be filtered by `clinicId`. Currently all GET routes return data for ALL clinics (no filter). This is the next work item after the commit above is pushed.

The pattern for every GET route:

```ts
const session = await requireClinicAccess(request);
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

// Add to every findMany:
where: { clinicId: session.clinicId, ... }
```

### Routes That Need Read Isolation Added

| Route file | Method | Notes |
|------------|--------|-------|
| `src/app/api/admin/appointments/route.ts` | GET | |
| `src/app/api/admin/doctors/route.ts` | GET | |
| `src/app/api/admin/leaves/route.ts` | GET | |
| `src/app/api/admin/slots/route.ts` | GET | |
| `src/app/api/admin/visits/route.ts` | GET | |
| `src/app/api/admin/procedures/route.ts` | GET | |
| `src/app/api/admin/purchases/route.ts` (inventory) | GET | |
| `src/app/api/doctor/slots/route.ts` | GET | |
| `src/app/api/reception/drafts/route.ts` | GET | if exists |
| All `[id]` routes | PATCH/DELETE | Add clinic ownership check before mutating |

For public booking routes (`/api/public/book`, `/api/public/doctors`, `/api/public/slots`) the clinic is identified by slug in the URL or by the slot/doctor already belonging to a clinic — no JWT required.

---

## Key Architecture Decisions (Do Not Revisit)

- **Patient is global** — one patient can book at multiple clinics. Clinic isolation goes through `Appointment.clinicId`, not `Patient.clinicId`.
- **`User.clinicId` is permanently nullable** — SUPER_ADMIN (platform owner) has no clinic. This is by design.
- **`clinic-guard.ts`** is the single auth utility for all routes going forward. Do not create new local auth helpers.
- **Public booking routes have no JWT** — `clinicId` must be derived from context: slot's `clinicId` for `/public/book`, `clinicSlug` body param for `/public/complaints`.
- **Slot generator derives `clinicId` via parameter** — callers pass `doctor.clinicId`.
- **`as string` assertions on `session.clinicId`** are intentional — `ClinicSession.clinicId` is typed `string | undefined` for SUPER_ADMIN, but any ADMIN/DOCTOR/RECEPTION/INVENTORY user always has a clinicId. If SUPER_ADMIN ever calls a clinic-scoped endpoint, it would fail at DB level. Guard for that in Stage 3 if needed.

---

## Authoritative Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema (root — what Vercel uses) |
| `booking-module/prisma/schema.prisma` | Mirror of schema (kept in sync) |
| `src/lib/clinic-guard.ts` | Auth middleware for all tenant-scoped routes |
| `src/lib/auth.ts` | JWT types (`JWTPayload`) |
| `src/lib/slot-generator.ts` | Auto-generates slots for doctors |
| `booking-module/SAAS_TRANSFORMATION_PLAN.md` | Master SaaS plan document |
| `booking-module/AI_CHANGELOG.md` | Log of all AI agent changes |
| `AGENT_HANDOFF.md` | This file |
