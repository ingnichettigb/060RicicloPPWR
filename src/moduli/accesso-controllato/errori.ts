// ======================================================================
// Nome File: errori.ts
// Percorso: src/moduli/accesso-controllato/errori.ts
// Revisione: Rev. 2 (aggiunta ERR017 ed estensione descrizioni tecniche)
// Data/Ora: 2026-10-03 14:50
// ======================================================================

// Codici errore standard ERRxxx. Da ERR001 a ERR500 coincidono con lo standard del portfolio (ex E-xxx).
// ERR010-ERR017 sono specifiche di questo modulo. ERR900 è usato dal pulsante di uscita dell'app.

export const CODICI_ERRORE = {
  ERR001: "Email non verificata tramite OTP.",
  ERR010: "Indirizzo email non valido.",
  ERR011: "Troppe richieste di codice: riprova più tardi.",
  ERR012: "Codice di verifica errato o scaduto.",
  ERR013: "Invio dell'email con il codice non riuscito.",
  ERR014: "Creazione della sessione di accesso non riuscita.",
  ERR015: "Sessione di accesso assente o scaduta.",
  ERR016: "Campi obbligatori mancanti.",
  ERR017: "Indirizzo email inesistente o non raggiungibile.",
  ERR101: "Licenza inesistente per questo prodotto oppure disattivata.",
  ERR103: "Licenza scaduta.",
  ERR201: "Codice PUK inesistente.",
  ERR202: "Codice PUK già associato a un altro utente.",
  ERR203: "Codice PUK appartenente a un altro prodotto.",
  ERR204: "Codice PUK non associato alla licenza inserita.",
  ERR302: "Licenza non valida in fase di salvataggio del consenso.",
  ERR500: "Errore imprevisto del server.",
  ERR900: "Logout non riuscito durante la chiusura dell'applicazione.",
} as const;

export type CodiceErrore = keyof typeof CODICI_ERRORE;

// ======================================================================
// FN004[FormattaErrore]: compone il messaggio standard 'ERRxxx: testo' (italiano, per i log del server).
// ======================================================================
export function FN004_FormattaErrore(codice: CodiceErrore): string {
  return `${codice}: ${CODICI_ERRORE[codice]}`;
}
