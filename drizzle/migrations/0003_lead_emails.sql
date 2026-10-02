create table if not exists public.lead_emails (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  verification_code text,
  is_verified boolean not null default false,
  verified_at timestamptz,
  otp_attempts integer not null default 0,
  otp_window_start timestamptz,
  otp_sent_at timestamptz,
  otp_failures integer not null default 0,
  source text,
  created_at timestamptz not null default now()
);
create unique index if not exists lead_emails_email_key on public.lead_emails (email);
revoke all on public.lead_emails from anon, authenticated;
grant all on public.lead_emails to service_role;
alter table public.lead_emails enable row level security;