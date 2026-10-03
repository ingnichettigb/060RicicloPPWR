// ======================================================================
// Nome File: condizioni-uso.ts
// Percorso: src/moduli/accesso-controllato/condizioni-uso.ts
// Revisione: Rev. 1 (testo legale completo delle condizioni d'uso, 4 lingue)
// Data/Ora: 2026-10-03 20:45
// ======================================================================

// Testo legale delle condizioni d'uso nelle 4 lingue (IT, EN, DE, ES).
// Il segnaposto {{APP_NAME}} viene sostituito con APP_NAME da config.ts.
import { APP_NAME } from "./config";
import type { LinguaAccesso } from "./tipi";

export type SezioneCondizioni = { titolo: string; corpo: string };
export type ContenutoCondizioni = {
  etichettaLingua: string;
  titoloPagina: string;
  passo: string;
  intro: string;
  intestazione: string;
  sottotitolo: string;
  sezioni: SezioneCondizioni[];
  piePagina: string;
};

const it: ContenutoCondizioni = {
  etichettaLingua: "Italiano",
  titoloPagina: "Condizioni d'Uso",
  passo: "Passaggio 3 di 3",
  intro: "Per completare l'attivazione, leggi e accetta le condizioni d'uso del software.",
  intestazione: "CONDIZIONI D'USO DEL SOFTWARE",
  sottotitolo: "{{APP_NAME}} — Versione 1.0",
  sezioni: [
    {
      titolo: "1. OGGETTO",
      corpo:
        'Le presenti condizioni regolano l\'utilizzo del software {{APP_NAME}} ("Software"), fornito da Dott. Ing. Nichetti Gian Battista, P.IVA IT01235350194, con sede in Soresina (CR), Italia, tramite il brand CorporateBoostService ("Fornitore").',
    },
    {
      titolo: "2. LICENZA D'USO",
      corpo:
        "Il Fornitore concede all'Utente una licenza d'uso non esclusiva, non trasferibile e limitata nel tempo, secondo i termini di validità associati alla licenza acquistata. La licenza non costituisce cessione di proprietà intellettuale sul Software, che resta di esclusiva proprietà del Fornitore.",
    },
    {
      titolo: "3. MODALITÀ DI ACQUISTO E FATTURAZIONE",
      corpo:
        "I pagamenti sono gestiti da Paddle.com Market Limited in qualità di Merchant of Record. Per dettagli consultare la pagina /pagamenti-merchant-of-record.",
    },
    {
      titolo: "4. USO CONSENTITO",
      corpo:
        "L'Utente si impegna a utilizzare il Software esclusivamente per le finalità previste, a non tentare di decompilare, modificare o distribuire il Software, e a non condividere le proprie credenziali di accesso.",
    },
    {
      titolo: "5. DATI E PRIVACY",
      corpo:
        "Il trattamento dei dati personali è disciplinato dalla Privacy Policy disponibile sul sito, in conformità al Regolamento (UE) 2016/679 (GDPR).",
    },
    {
      titolo: "6. LIMITAZIONE DI RESPONSABILITÀ",
      corpo:
        "Il Software è uno strumento di supporto al calcolo: l'Utente è tenuto a verificare sempre i risultati sul testo ufficiale della normativa di riferimento. Il Fornitore non risponde di danni diretti o indiretti derivanti dall'uso dei risultati prodotti dal Software.",
    },
  ],
  piePagina:
    "L'accettazione viene registrata con data, ora, lingua, versione delle condizioni e dati tecnici di connessione.",
};

const en: ContenutoCondizioni = {
  etichettaLingua: "English",
  titoloPagina: "Terms of Use",
  passo: "Step 3 of 3",
  intro: "To complete activation, read and accept the software terms of use.",
  intestazione: "SOFTWARE TERMS OF USE",
  sottotitolo: "{{APP_NAME}} — Version 1.0",
  sezioni: [
    {
      titolo: "1. PURPOSE",
      corpo:
        'These terms govern the use of the software {{APP_NAME}} ("Software"), provided by Dott. Ing. Nichetti Gian Battista, VAT IT01235350194, based in Soresina (CR), Italy, through the CorporateBoostService brand ("Provider").',
    },
    {
      titolo: "2. LICENSE",
      corpo:
        "The Provider grants the User a non-exclusive, non-transferable, time-limited license according to the validity terms of the purchased license. The license does not constitute a transfer of intellectual property, which remains the exclusive property of the Provider.",
    },
    {
      titolo: "3. PURCHASE AND BILLING",
      corpo:
        "Payments are handled by Paddle.com Market Limited as Merchant of Record. For details see the /pagamenti-merchant-of-record page.",
    },
    {
      titolo: "4. PERMITTED USE",
      corpo:
        "The User agrees to use the Software only for its intended purposes, not to decompile, modify or distribute it, and not to share access credentials.",
    },
    {
      titolo: "5. DATA AND PRIVACY",
      corpo:
        "Personal data processing is governed by the Privacy Policy available on the website, in compliance with Regulation (EU) 2016/679 (GDPR).",
    },
    {
      titolo: "6. LIMITATION OF LIABILITY",
      corpo:
        "The Software is a calculation support tool: the User must always verify results against the official text of the reference regulation. The Provider is not liable for direct or indirect damages arising from the use of the Software's results.",
    },
  ],
  piePagina:
    "Acceptance is logged with date, time, language, terms version and technical connection data.",
};

const de: ContenutoCondizioni = {
  etichettaLingua: "Deutsch",
  titoloPagina: "Nutzungsbedingungen",
  passo: "Schritt 3 von 3",
  intro: "Um die Aktivierung abzuschließen, lesen und akzeptieren Sie die Nutzungsbedingungen.",
  intestazione: "NUTZUNGSBEDINGUNGEN DER SOFTWARE",
  sottotitolo: "{{APP_NAME}} — Version 1.0",
  sezioni: [
    {
      titolo: "1. GEGENSTAND",
      corpo:
        'Diese Bedingungen regeln die Nutzung der Software {{APP_NAME}} ("Software"), bereitgestellt von Dott. Ing. Nichetti Gian Battista, USt-IdNr. IT01235350194, Soresina (CR), Italien, über die Marke CorporateBoostService ("Anbieter").',
    },
    {
      titolo: "2. NUTZUNGSLIZENZ",
      corpo:
        "Der Anbieter gewährt dem Nutzer eine nicht exklusive, nicht übertragbare, zeitlich begrenzte Lizenz gemäß den Gültigkeitsbedingungen der erworbenen Lizenz. Die Lizenz stellt keine Übertragung geistigen Eigentums dar.",
    },
    {
      titolo: "3. KAUF UND ABRECHNUNG",
      corpo:
        "Zahlungen werden von Paddle.com Market Limited als Merchant of Record abgewickelt. Details siehe Seite /pagamenti-merchant-of-record.",
    },
    {
      titolo: "4. ERLAUBTE NUTZUNG",
      corpo:
        "Der Nutzer verpflichtet sich, die Software nur für die vorgesehenen Zwecke zu verwenden, sie nicht zu dekompilieren, zu verändern oder zu verbreiten und Zugangsdaten nicht weiterzugeben.",
    },
    {
      titolo: "5. DATEN UND DATENSCHUTZ",
      corpo:
        "Die Verarbeitung personenbezogener Daten richtet sich nach der Datenschutzerklärung auf der Website gemäß Verordnung (EU) 2016/679 (DSGVO).",
    },
    {
      titolo: "6. HAFTUNGSBESCHRÄNKUNG",
      corpo:
        "Die Software ist ein Berechnungshilfsmittel: Der Nutzer muss die Ergebnisse stets anhand des offiziellen Normtextes prüfen. Der Anbieter haftet nicht für direkte oder indirekte Schäden aus der Nutzung der Ergebnisse.",
    },
  ],
  piePagina:
    "Die Zustimmung wird mit Datum, Uhrzeit, Sprache, Version der Bedingungen und technischen Verbindungsdaten protokolliert.",
};

const es: ContenutoCondizioni = {
  etichettaLingua: "Español",
  titoloPagina: "Condiciones de Uso",
  passo: "Paso 3 de 3",
  intro: "Para completar la activación, lee y acepta las condiciones de uso del software.",
  intestazione: "CONDICIONES DE USO DEL SOFTWARE",
  sottotitolo: "{{APP_NAME}} — Versión 1.0",
  sezioni: [
    {
      titolo: "1. OBJETO",
      corpo:
        'Estas condiciones regulan el uso del software {{APP_NAME}} ("Software"), proporcionado por Dott. Ing. Nichetti Gian Battista, IVA IT01235350194, con sede en Soresina (CR), Italia, a través de la marca CorporateBoostService ("Proveedor").',
    },
    {
      titolo: "2. LICENCIA DE USO",
      corpo:
        "El Proveedor concede al Usuario una licencia de uso no exclusiva, intransferible y limitada en el tiempo, según los términos de validez de la licencia adquirida. La licencia no constituye cesión de propiedad intelectual.",
    },
    {
      titolo: "3. COMPRA Y FACTURACIÓN",
      corpo:
        "Los pagos son gestionados por Paddle.com Market Limited como Merchant of Record. Para más detalles consulte la página /pagamenti-merchant-of-record.",
    },
    {
      titolo: "4. USO PERMITIDO",
      corpo:
        "El Usuario se compromete a utilizar el Software exclusivamente para los fines previstos, a no descompilarlo, modificarlo o distribuirlo, y a no compartir sus credenciales de acceso.",
    },
    {
      titolo: "5. DATOS Y PRIVACIDAD",
      corpo:
        "El tratamiento de datos personales se rige por la Política de Privacidad disponible en el sitio, conforme al Reglamento (UE) 2016/679 (RGPD).",
    },
    {
      titolo: "6. LIMITACIÓN DE RESPONSABILIDAD",
      corpo:
        "El Software es una herramienta de apoyo al cálculo: el Usuario debe verificar siempre los resultados con el texto oficial de la normativa. El Proveedor no responde de daños directos o indirectos derivados del uso de los resultados.",
    },
  ],
  piePagina:
    "La aceptación se registra con fecha, hora, idioma, versión de las condiciones y datos técnicos de conexión.",
};

const CONTENUTI: Record<LinguaAccesso, ContenutoCondizioni> = { it, en, de, es };

// ======================================================================
// FN070_OttieniCondizioni: restituisce il testo legale nella lingua
// richiesta, con {{APP_NAME}} sostituito dal nome dell'applicazione.
// ======================================================================
export function FN070_OttieniCondizioni(lingua: LinguaAccesso): ContenutoCondizioni {
  const base = CONTENUTI[lingua] ?? CONTENUTI.it;
  const sostituisci = (testo: string) => testo.replaceAll("{{APP_NAME}}", APP_NAME);
  return {
    ...base,
    intro: sostituisci(base.intro),
    intestazione: sostituisci(base.intestazione),
    sottotitolo: sostituisci(base.sottotitolo),
    piePagina: sostituisci(base.piePagina),
    sezioni: base.sezioni.map((s) => ({ titolo: sostituisci(s.titolo), corpo: sostituisci(s.corpo) })),
  };
}

