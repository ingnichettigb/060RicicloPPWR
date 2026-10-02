-- ======================================================================
-- Nome File: lead_emails.sql
-- Percorso: src/moduli/accesso-controllato/sql/lead_emails.sql
-- Revisione: Rev. 1
-- Data/Ora: 2026-10-01 21:45
-- ======================================================================

-- Tabella locale per la verifica email con OTP. Accessibile SOLO dal server (service role): RLS attiva e nessuna policy.
-- Colonne otp_sent_at e otp_failures: aggiunte del modulo per scadenza (10 minuti) e limite di errori (5) del codice.

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

alter table public.lead_emails enable row level security;
revoke all on public.lead_emails from anon, authenticated;
