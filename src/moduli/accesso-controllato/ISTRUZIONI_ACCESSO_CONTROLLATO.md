# MANUALE DI INTEGRAZIONE: MODULO ACCESSO CONTROLLATO

**Versione:** 1.0
**Autore:** Corporate Boost Service
**Ambiente:** TanStack Start v1 (React 19) + Lovable Cloud + Cloudflare Workers

---

## 1. SCOPO E ARCHITETTURA DEL MODULO

Il modulo `accesso-controllato` è un package autonomo e riusabile per governare l'accesso alle web application SaaS del portfolio.
Isola la logica di autenticazione e licenza in tre fasi obbligatorie e sequenziali:

```text
[ Utente apre l'app ]
         │
         ▼
[ FN047_PortaAccesso ] ──► Verifica stato nei tre livelli
         │
         ├─► [FASE 1] /auth        ── OTP email a 6 cifre (antispam, max 3/24h)
         ├─► [FASE 2] /attivazione ── Chiave Licenza + PUK (multi-seat atomico)
         └─► [FASE 3] /condizioni  ── Consenso legale tracciato con timestamp/IP
         │
         ▼
[ Area Protetta: _authenticated/* ]
         │
         └─► Esportazione PDF con decurtazione quote PUK sul server centrale
```

### I due database coinvolti

1. **Database locale (della singola SaaS):** gestisce solo la registrazione iniziale delle email e i codici OTP temporanei tramite la tabella `lead_emails`.
2. **Database esterno centrale (del portfolio):** gestisce licenze vendute, quote di esportazione PDF, assegnazione dei PUK e storico dei consensi legali (tabelle `licenses`, `puks`, `users`, `license_consents`).

---

## 2. PREREQUISITI E VARIABILI D'AMBIENTE (SECRETS)

```env
# Database esterno centrale (portfolio licenze)
EXTERNAL_SUPABASE_URL="https://xxxxxxxxxxxxxxxx.supabase.co"
EXTERNAL_SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Servizio invio email transazionali
RESEND_API_KEY="re_xxxxxxxxxxxxxx"
RESEND_FROM_EMAIL="team@corporateboostservice.eu"

# Database locale della SaaS (Lovable Cloud - iniettati in automatico)
VITE_SUPABASE_URL="https://yyyyyyyyyyyyyyyy.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
```

---

## 3. STRUTTURA DELLA CARTELLA

```text
src/moduli/accesso-controllato/
├── ISTRUZIONI_ACCESSO_CONTROLLATO.md  <-- Questo manuale
├── config.ts                          <-- UNICO FILE DA PERSONALIZZARE PER OGNI SAAS
├── adattatore.ts                      <-- PONTE verso client database e lingue
├── tipi.ts                            <-- Interfacce TypeScript
├── errori.ts                          <-- Registro codici errore ERR001 - ERR900
├── testi.ts                           <-- Dizionario localizzato (IT, EN, DE, ES)
├── stili.ts                           <-- Costanti grafiche e Tailwind
├── stato.ts                           <-- Storage locale con namespace (FN008, FN016)
├── hookAccesso.ts                     <-- Hook React dello stato di accesso
├── PortaAccesso.tsx                   <-- Componente guardia (FN047_PortaAccesso)
├── accesso.functions.ts               <-- Server functions client-server
├── pagine/
│   ├── CorniceAccesso.tsx             <-- Layout grafico uniforme delle 3 fasi
│   ├── PaginaAuth.tsx                 <-- Fase 1: OTP Email (FN048)
│   ├── PaginaAttivazione.tsx          <-- Fase 2: Licenza + PUK (FN052)
│   ├── PaginaCondizioni.tsx           <-- Fase 3: Accettazione legale (FN054)
│   └── PaginaLicenzaScaduta.tsx       <-- Blocco per rinnovo (FN056)
├── esportazione/
│   ├── useExportQuota.ts              <-- Verifica e scala le quote PDF
│   ├── ExportCountBadge.tsx           <-- Badge quote residue (FN060)
│   └── DialogExportEsauriti.tsx       <-- Modale acquisto nuove quote
├── server/
│   ├── esterno.server.ts              <-- Connessione DB centrale
│   ├── otp.server.ts                  <-- OTP, crypto, Resend (bounced/suppressed)
│   └── licenza.server.ts              <-- Claim PUK e validazione quote
└── sql/
    └── lead_emails.sql                <-- Schema per il DB locale
```

---

## 4. SCHEMA DATABASE DA APPLICARE (DB LOCALE)

```sql
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
```

---

## 5. I 2 SOLI FILE DA CONFIGURARE ALL'INTEGRAZIONE

### 5.1 `config.ts` (identità della SaaS)

```typescript
export const APP_CODE = "060RicicloPPWR";      // Codice registrato nel DB centrale
export const APP_NAME = "Riciclabilità PPWR";  // Nome mostrato a video ed email
export const APP_VERSION = "1.0.0";
export const ROTTA_HOME = "/valutazioni";      // Pagina di atterraggio dopo il login
export const ROTTA_AUTH = "/auth";
export const ROTTA_ATTIVAZIONE = "/attivazione";
export const ROTTA_CONDIZIONI = "/condizioni";
export const ROTTA_LICENZA_SCADUTA = "/licenza-scaduta";
```

### 5.2 `adattatore.ts` (ponte di collegamento)

```typescript
import { supabase } from "@/integrations/supabase/client";
import { useLingua } from "@/hooks/useLingua"; // Adattare all'hook lingua del progetto

export { supabase };

export function useLinguaApp(): "it" | "en" | "de" | "es" {
  try {
    const { lingua } = useLingua();
    if (lingua === "it" || lingua === "en" || lingua === "de" || lingua === "es") {
      return lingua;
    }
    return "it";
  } catch {
    return "it";
  }
}
```

---

## 6. FILE DA CREARE NELL'APPLICAZIONE OSPITANTE

### File 1: `src/routes/auth.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { FN048_PaginaAuth } from "@/moduli/accesso-controllato/pagine/PaginaAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Accesso - Verifica Email" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FN048_PaginaAuth,
});
```

### File 2: `src/routes/attivazione.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { FN052_PaginaAttivazione } from "@/moduli/accesso-controllato/pagine/PaginaAttivazione";

export const Route = createFileRoute("/attivazione")({
  head: () => ({
    meta: [
      { title: "Attivazione Licenza" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FN052_PaginaAttivazione,
});
```

### File 3: `src/routes/condizioni.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { FN054_PaginaCondizioni } from "@/moduli/accesso-controllato/pagine/PaginaCondizioni";

export const Route = createFileRoute("/condizioni")({
  head: () => ({
    meta: [
      { title: "Condizioni d'Uso" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FN054_PaginaCondizioni,
});
```

### File 4: `src/routes/licenza-scaduta.tsx`

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { FN056_PaginaLicenzaScaduta } from "@/moduli/accesso-controllato/pagine/PaginaLicenzaScaduta";

export const Route = createFileRoute("/licenza-scaduta")({
  head: () => ({
    meta: [
      { title: "Licenza Scaduta" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: FN056_PaginaLicenzaScaduta,
});
```

### File 5: `src/routes/_authenticated/route.tsx` (protezione area riservata)

```tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { FN047_PortaAccesso } from "@/moduli/accesso-controllato/PortaAccesso";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw redirect({ to: "/auth" });
    }
  },
  component: () => (
    <FN047_PortaAccesso>
      <Outlet />
    </FN047_PortaAccesso>
  ),
});
```

### File 6: `src/start.ts` (token per le server functions)

```typescript
import { createStart } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
}));
```

> Se `src/start.ts` contiene già altri middleware, **aggiungere** `attachSupabaseAuth` all'array esistente senza sostituirlo.

### File 7: `src/components/Intestazione.tsx` (header)

Mostra in alto a destra l'email connessa (letta da `FN008_LeggiChiave(VERIFIED_EMAIL_KEY)` con fallback `supabase.auth.getUser()`), il tasto **Chiudi applicazione** (FN001: signOut + `window.close()` + fallback `/auth`) e **Esci e cancella tutto** (FN063: `FN016_EsciECancellaTutto` + navigate `/auth`).

---

## 7. INTEGRAZIONE DELLE QUOTE DI ESPORTAZIONE PDF

```tsx
import { useExportQuota } from "@/moduli/accesso-controllato/esportazione/useExportQuota";
import { FN060_ExportCountBadge } from "@/moduli/accesso-controllato/esportazione/ExportCountBadge";
import { DialogExportEsauriti } from "@/moduli/accesso-controllato/esportazione/DialogExportEsauriti";

export function BottoneStampaReport() {
  const { rimanenti, totale, loading, consume, dialogAperto, setDialogAperto } = useExportQuota();

  const gestisciStampa = async () => {
    // 1. Scala la quota sul DB esterno
    const ok = await consume();
    if (!ok) return; // Quota esaurita: il dialog si apre in automatico

    // 2. Genera il PDF
    eseguiGenerazionePdf();
  };

  return (
    <>
      <button onClick={gestisciStampa} disabled={loading}>
        Stampa Report
        <FN060_ExportCountBadge rimanenti={rimanenti} totale={totale} />
      </button>
      <DialogExportEsauriti open={dialogAperto} onOpenChange={setDialogAperto} />
    </>
  );
}
```

> Verificare i nomi esatti restituiti da `useExportQuota` nel file del modulo prima di copiare.

---

## 8. PROCEDURA DI INTEGRAZIONE (PASSO-PASSO)

1. Copiare la cartella `accesso-controllato` in `src/moduli/` della nuova SaaS.
2. Personalizzare `config.ts` (APP_CODE, APP_NAME, ROTTA_HOME).
3. Verificare `adattatore.ts` (client database e hook lingua).
4. Eseguire `sql/lead_emails.sql` sul database locale.
5. Creare le 4 rotte (auth, attivazione, condizioni, licenza-scaduta) e la guardia `_authenticated/route.tsx`.
6. Registrare `attachSupabaseAuth` in `src/start.ts`.
7. Aggiungere i secrets: `EXTERNAL_SUPABASE_URL`, `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
8. Registrare l'APP_CODE nella tabella `licenses` del DB centrale.

---

## 9. NOTE OPERATIVE IMPORTANTI

- **Email errate:** `otp.server.ts` controlla lo stato Resend dopo 600 ms (`suppressed`) e dopo altri 1400 ms (`bounced`); in entrambi i casi restituisce `ERR017` e azzera il codice OTP senza consumare un tentativo.
- **PUK copiato dall'email:** `PaginaAttivazione.tsx` ripulisce PUK e chiave da punti elenco, asterischi, trattini e spazi iniziali (`pulisciPuk`, `pulisciChiave`).
- **Email licenza (server esterno):** evitare `<ul><li>` attorno al PUK; usare box `<div>` singoli per non copiare il punto elenco.

---

## 10. REGISTRO DEGLI ERRORI GESTITI

| Codice | Descrizione tecnica | Comportamento UI |
| :--- | :--- | :--- |
| **ERR001** | Email non verificata | Rimanda a `/auth` per inserire l'OTP |
| **ERR010** | Formato email errato | Avviso rosso sotto il campo |
| **ERR011** | Superato limite 3 invii OTP in 24h | Blocco con invito a riprovare dopo 24h |
| **ERR012** | Codice OTP errato o scaduto (>10 min) | Mostra tentativi rimasti (max 5) |
| **ERR013** | Errore servizio email (Resend) | Invito a riprovare tra qualche istante |
| **ERR014** | Errore creazione sessione | Richiede ricaricamento della pagina |
| **ERR015** | Token sessione mancante o scaduto | Reindirizzamento su `/auth` |
| **ERR016** | Parametri obbligatori assenti | Invito a compilare tutti i campi |
| **ERR017** | Email rimbalzata o bloccata (bounced/suppressed) | Segnala casella inesistente, controllare l'indirizzo |
| **ERR101** | Chiave licenza non trovata | Chiave errata o di altra applicazione |
| **ERR103** | Licenza scaduta | Reindirizza a `/licenza-scaduta` |
| **ERR201** | PUK non valido | PUK non corrispondente alla licenza |
| **ERR202** | PUK già attivato da altro utente | Blocco con contatto supporto |
| **ERR203** | Postazioni (seats) esaurite | Tutti i posti acquistati occupati |
| **ERR204** | Licenza sospesa/revocata | Blocco immediato |
| **ERR302** | Registrazione consenso fallita | Invito a riprovare |
| **ERR500** | Errore server imprevisto | Messaggio generico rassicurante |
| **ERR900** | Chiusura applicazione / logout | Pulizia storage e redirect |
