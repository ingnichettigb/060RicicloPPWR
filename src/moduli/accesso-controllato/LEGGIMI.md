<!--
======================================================================
Nome File: LEGGIMI.md
Percorso: src/moduli/accesso-controllato/LEGGIMI.md
Revisione: Rev. 1
Data/Ora: 2026-10-01 21:45
======================================================================
-->

# Modulo accesso-controllato

Accesso a 3 fasi (OTP email, licenza multi-seat con PUK, condizioni d'uso) e quota export PDF per singola PUK.
Schermate: 0001 `/auth`, 0002 `/attivazione`, 0003 `/condizioni`, 0004 `/licenza-scaduta`, frame 0005 dialog export esauriti.

## 1. Come portarlo su un'altra SaaS

1. Copia l'intera cartella `src/moduli/accesso-controllato/` nel nuovo progetto.
2. Apri `config.ts` e sostituisci i segnaposto in grassetto: **INSERISCI_QUI_APP_CODE** e **INSERISCI_QUI_MITTENTE_EMAIL** (compresi gli asterischi). Cambia anche `APP_NAME`.
3. Controlla `adattatore.ts`: è l'unico punto che usa l'app ospitante (lingua, selettore lingua, client Supabase).
4. Crea le 4 rotte di collegamento in `src/routes/` (`auth.tsx`, `attivazione.tsx`, `condizioni.tsx`, `licenza-scaduta.tsx`), come nell'app PPWR.
5. In `src/routes/_authenticated/route.tsx` avvolgi `<Outlet />` con `FN047_PortaAccesso`.
6. Sul pulsante di generazione PDF usa `useExportQuota` (`consume()` prima di generare) e `FN060_ExportCountBadge`.
7. Esegui `sql/lead_emails.sql` sul database locale della SaaS.
8. Imposta i secret del progetto (sezione 2).

## 2. Secret richiesti (impostali tu, non vanno scritti nel codice)

1. `EXTERNAL_SUPABASE_URL`
2. `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY`
3. `RESEND_API_KEY`
4. `LOVABLE_API_KEY`
5. `SUPABASE_SERVICE_ROLE_KEY` (di solito già presente nel progetto Lovable Cloud)

## 3. Codici errore

1. Da `ERR001` a `ERR500`: standard del portfolio (ex `E-001` ... `E-500`).
2. `ERR010`-`ERR016`: aggiunte di questo modulo (email non valida, troppe richieste, OTP errato, invio email, sessione, campi mancanti).
3. `ERR900`: logout non riuscito (pulsante di uscita dell'app).

## 4. Note

1. Il testo delle condizioni d'uso in `testi.ts` è una bozza: sostituiscilo con il testo legale.
2. Le server function protette leggono l'email dal token di sessione, mai dal corpo della richiesta.
3. Il decremento della quota PDF non disattiva mai la licenza.
