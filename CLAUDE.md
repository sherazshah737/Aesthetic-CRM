# Aesthetic Clinic CRM

Multi-tenant SaaS CRM for aesthetic clinics in Pakistan (services: PRP face, PRP hair, vampire facial, hair transplant, etc.).

## About the user
The owner is a non-developer. Explain briefly what you do, keep code simple and well organized.

## Product
Clinic CRM covering:
- Leads
- Patients
- Appointments
- Session packages
- Payments
- WhatsApp reminders

## Market
- Country: Pakistan
- Currency: PKR
- Timezone: Asia/Karachi
- Phone format: +92
- WhatsApp message templates are written in Roman Urdu

## Stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- Supabase (Postgres, Auth, Storage)
- Deployed on Vercel

## Rules
- Every table has a `clinic_id` and Row Level Security (RLS), so one clinic can never see another clinic's data.
- Never hardcode secrets. Use `.env.local` (and keep it out of git).
- Mobile-first UI, because receptionists use phones.
- Keep components small.
- Add loading and error states.
- Run lint and typecheck before saying a task is done.

## Workflow
- We build in numbered steps.
- After each step, list what to test manually.
