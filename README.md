# Hacienda Trip Ticket System (core)
1. Run `supabase/schema.sql` in the Supabase SQL editor, disable signups, create the first user, then promote them to admin (see the prompt's "First-admin bootstrap").
2. `cp .env.example .env.local`, fill in the keys, then `npm install && npm run dev`.

Built: login, issue ticket (user-entered barcode), dual-copy print with reprint tracking, ticket list/search, net weight.
Not yet built: planters CRUD/CSV, reports, user management, MFA enrollment UI, idle timeout, void UI, dashboard.

## Update
Also run `supabase/patch_reports.sql` once, then `npm install` (adds papaparse). Admins must enroll TOTP at /mfa before using Planters edit, Reports, Users or Void.
Now built: planters CRUD + CSV, dashboard, reports + CSV export, users, MFA, idle timeout, void.
