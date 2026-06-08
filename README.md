# HailiteManager — Supreme App 2

Business management platform for **Hailite Xteriors Inc.** (Edmonton, AB).
Built with Next.js 15, Supabase, TypeScript, and Tailwind CSS.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Supabase Auth (admin) + bcrypt PIN (employees) |
| Payments | Stripe |
| Maps | Google Maps API |
| Storage | Google Cloud Storage |
| Deploy | Vercel |

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — fill in Supabase URL, keys, etc.

# 3. Run dev server
npm run dev
```

---

## Database Setup (Supabase)

Run migrations in order in the **Supabase SQL Editor**:

```
supabase/migrations/001_initial_schema.sql   ← all tables & indexes
supabase/migrations/002_rls_policies.sql     ← Row Level Security
supabase/seed/001_company_and_admin.sql      ← company + admin user
supabase/seed/002_demo_data.sql              ← demo employees, clients, catalog
```

**Before running seed/001**, create the admin Supabase Auth user:
- Supabase Dashboard → Authentication → Users → Add User
- Email: `patrick@hailite.com` | Password: `0000` *(change on first login)*
- Copy the UUID → paste into `seed/001_company_and_admin.sql`

---

## Authentication

### Admin Login
- URL: `/login`
- Supabase Auth (email + password)
- First login credentials: `patrick@hailite.com` / `0000` — **change immediately**

### Employee Login (PIN)
- URL: `/employee-login`
- Search by name → enter 4–6 digit PIN
- PINs stored as bcrypt hashes — set via Admin → HR → Employees

---

## Project Structure

```
src/
  app/
    (auth)/
      login/               ← Admin login
      employee-login/      ← Employee PIN login
    (dashboard)/
      dashboard/           ← Main dashboard
    api/
      auth/signout/        ← Sign-out endpoint
  lib/
    auth.ts                ← Auth helpers (admin + employee PIN)
    supabase/
      client.ts            ← Browser Supabase client
      server.ts            ← Server Supabase client
  middleware.ts            ← Route protection
  types/
    database.ts            ← TypeScript types for all tables

supabase/
  migrations/              ← SQL schema & RLS
  seed/                    ← Initial data & demo data
```

---

## Post-First-Login Checklist

- [ ] Change password (strong, 20+ chars)
- [ ] Enable 2FA in Supabase Auth
- [ ] Upload company logo
- [ ] Add real employees with PINs
- [ ] Add subcontractors
- [ ] Verify siding & roofing catalogs
- [ ] Connect Stripe account
- [ ] Configure Google Maps API key
- [ ] Enable Supabase automated backups
- [ ] Review RLS policies are active
