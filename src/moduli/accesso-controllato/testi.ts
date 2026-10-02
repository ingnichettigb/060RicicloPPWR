// ======================================================================
// Nome File: testi.ts
// Percorso: src/moduli/accesso-controllato/testi.ts
// Revisione: Rev. 1
// Data/Ora: 2026-10-01 21:43
// ======================================================================

// Testi del modulo nelle 4 lingue (IT, EN, DE, ES). Le condizioni d'uso sono una BOZZA da sostituire con il testo legale.
import { useLinguaApp } from "./adattatore";
import { CODICI_ERRORE, type CodiceErrore } from "./errori";
import type { LinguaAccesso } from "./tipi";

const it = {
  "auth.titolo": "Accedi",
  "auth.intro": "Inserisci la tua email: ti invieremo un codice di verifica.",
  "auth.email": "Email",
  "auth.invia": "Invia codice",
  "auth.inviando": "Invio in corso…",
  "auth.codiceInviato": "Abbiamo inviato un codice a {email}. È valido {minuti} minuti.",
  "auth.codice": "Codice di verifica (6 cifre)",
  "auth.verifica": "Verifica e accedi",
  "auth.verificando": "Verifica in corso…",
  "auth.cambiaEmail": "Usa un'altra email",
  "att.titolo": "Attiva la licenza",
  "att.intro": "Inserisci la chiave di licenza e il codice PUK della tua postazione.",
  "att.email": "Email verificata: {email}",
  "att.chiave": "Chiave di licenza",
  "att.puk": "Codice PUK",
  "att.attiva": "Attiva",
  "att.attivando": "Attivazione in corso…",
  "con.titolo": "Condizioni d'uso",
  "con.p1":
    "Il programma è uno strumento di supporto al calcolo: l'utente verifica sempre i risultati sul testo ufficiale del Reg. (UE) 2025/40.",
  "con.p2":
    "La licenza è associata a una singola postazione (codice PUK) e non può essere ceduta a terzi.",
  "con.p3": "I dati inseriti sono conservati per consentire il funzionamento del servizio.",
  "con.p4":
    "L'accettazione viene registrata con data, lingua, versione delle condizioni e dati tecnici di connessione.",
  "con.accetto": "Ho letto e accetto le condizioni d'uso",
  "con.continua": "Accetta e continua",
  "con.salvataggio": "Salvataggio…",
  "con.verifica": "Verifica in corso…",
  "sca.titolo": "Licenza non valida",
  "sca.expired": "La licenza è scaduta.",
  "sca.deactivated": "La licenza è stata disattivata.",
  "sca.not_found": "La licenza non è stata trovata.",
  "sca.riattiva": "Inserisci una nuova licenza",
  "gate.verifica": "Verifica dell'accesso…",
  "quota.tooltip": "{n} export PDF rimasti con questo codice PUK",
  "quota.ultimo": "Ultimo export PDF disponibile con questo codice PUK",
  "quota.titoloEsaurito": "Export PDF esauriti",
  "quota.testoEsaurito":
    "Hai usato tutti gli export PDF previsti per questo codice PUK. Le altre postazioni della licenza non sono interessate.",
  "quota.capito": "Ho capito",
  "err.ERR001": "Email non verificata tramite OTP.",
  "err.ERR010": "Indirizzo email non valido.",
  "err.ERR011": "Troppe richieste di codice: riprova più tardi.",
  "err.ERR012": "Codice di verifica errato o scaduto.",
  "err.ERR013": "Invio dell'email con il codice non riuscito.",
  "err.ERR014": "Creazione della sessione di accesso non riuscita.",
  "err.ERR015": "Sessione di accesso assente o scaduta.",
  "err.ERR016": "Campi obbligatori mancanti.",
  "err.ERR101": "Licenza inesistente per questo prodotto oppure disattivata.",
  "err.ERR103": "Licenza scaduta.",
  "err.ERR201": "Codice PUK inesistente.",
  "err.ERR202": "Codice PUK già associato a un altro utente.",
  "err.ERR203": "Codice PUK appartenente a un altro prodotto.",
  "err.ERR204": "Codice PUK non associato alla licenza inserita.",
  "err.ERR302": "Licenza non valida in fase di salvataggio del consenso.",
  "err.ERR500": "Errore imprevisto del server.",
  "err.ERR900": "Logout non riuscito durante la chiusura dell'applicazione.",
} as const;

export type ChiaveTesto = keyof typeof it;

const en: Record<ChiaveTesto, string> = {
  "auth.titolo": "Sign in",
  "auth.intro": "Enter your email: we will send you a verification code.",
  "auth.email": "Email",
  "auth.invia": "Send code",
  "auth.inviando": "Sending…",
  "auth.codiceInviato": "We sent a code to {email}. It is valid for {minuti} minutes.",
  "auth.codice": "Verification code (6 digits)",
  "auth.verifica": "Verify and sign in",
  "auth.verificando": "Verifying…",
  "auth.cambiaEmail": "Use another email",
  "att.titolo": "Activate your license",
  "att.intro": "Enter the license key and the PUK code of your seat.",
  "att.email": "Verified email: {email}",
  "att.chiave": "License key",
  "att.puk": "PUK code",
  "att.attiva": "Activate",
  "att.attivando": "Activating…",
  "con.titolo": "Terms of use",
  "con.p1":
    "The program is a calculation support tool: users must always check the results against the official text of Reg. (EU) 2025/40.",
  "con.p2":
    "The license is tied to a single seat (PUK code) and cannot be transferred to third parties.",
  "con.p3": "The data you enter is stored to allow the service to work.",
  "con.p4":
    "Acceptance is recorded with date, language, terms version and technical connection data.",
  "con.accetto": "I have read and accept the terms of use",
  "con.continua": "Accept and continue",
  "con.salvataggio": "Saving…",
  "con.verifica": "Checking…",
  "sca.titolo": "Invalid license",
  "sca.expired": "The license has expired.",
  "sca.deactivated": "The license has been deactivated.",
  "sca.not_found": "The license could not be found.",
  "sca.riattiva": "Enter a new license",
  "gate.verifica": "Checking access…",
  "quota.tooltip": "{n} PDF exports left with this PUK code",
  "quota.ultimo": "Last PDF export available with this PUK code",
  "quota.titoloEsaurito": "PDF exports used up",
  "quota.testoEsaurito":
    "You have used all the PDF exports allowed for this PUK code. Other seats of the license are not affected.",
  "quota.capito": "Understood",
  "err.ERR001": "Email not verified via OTP.",
  "err.ERR010": "Invalid email address.",
  "err.ERR011": "Too many code requests: try again later.",
  "err.ERR012": "Verification code wrong or expired.",
  "err.ERR013": "Sending the email with the code failed.",
  "err.ERR014": "Creating the sign-in session failed.",
  "err.ERR015": "Sign-in session missing or expired.",
  "err.ERR016": "Required fields missing.",
  "err.ERR101": "License not found for this product or deactivated.",
  "err.ERR103": "License expired.",
  "err.ERR201": "PUK code not found.",
  "err.ERR202": "PUK code already linked to another user.",
  "err.ERR203": "PUK code belongs to another product.",
  "err.ERR204": "PUK code not linked to the license entered.",
  "err.ERR302": "License not valid when saving the consent.",
  "err.ERR500": "Unexpected server error.",
  "err.ERR900": "Sign-out failed while closing the application.",
};

const de: Record<ChiaveTesto, string> = {
  "auth.titolo": "Anmelden",
  "auth.intro": "Gib deine E-Mail-Adresse ein: Wir senden dir einen Bestätigungscode.",
  "auth.email": "E-Mail",
  "auth.invia": "Code senden",
  "auth.inviando": "Wird gesendet…",
  "auth.codiceInviato": "Wir haben einen Code an {email} gesendet. Er ist {minuti} Minuten gültig.",
  "auth.codice": "Bestätigungscode (6 Ziffern)",
  "auth.verifica": "Bestätigen und anmelden",
  "auth.verificando": "Wird geprüft…",
  "auth.cambiaEmail": "Andere E-Mail verwenden",
  "att.titolo": "Lizenz aktivieren",
  "att.intro": "Gib den Lizenzschlüssel und den PUK-Code deines Arbeitsplatzes ein.",
  "att.email": "Bestätigte E-Mail: {email}",
  "att.chiave": "Lizenzschlüssel",
  "att.puk": "PUK-Code",
  "att.attiva": "Aktivieren",
  "att.attivando": "Aktivierung läuft…",
  "con.titolo": "Nutzungsbedingungen",
  "con.p1":
    "Das Programm ist ein Hilfsmittel zur Berechnung: Die Ergebnisse sind stets am offiziellen Text der Verordnung (EU) 2025/40 zu prüfen.",
  "con.p2":
    "Die Lizenz gilt für einen einzelnen Arbeitsplatz (PUK-Code) und darf nicht an Dritte weitergegeben werden.",
  "con.p3": "Die eingegebenen Daten werden gespeichert, damit der Dienst funktioniert.",
  "con.p4":
    "Die Zustimmung wird mit Datum, Sprache, Version der Bedingungen und technischen Verbindungsdaten protokolliert.",
  "con.accetto": "Ich habe die Nutzungsbedingungen gelesen und akzeptiere sie",
  "con.continua": "Akzeptieren und fortfahren",
  "con.salvataggio": "Wird gespeichert…",
  "con.verifica": "Wird geprüft…",
  "sca.titolo": "Ungültige Lizenz",
  "sca.expired": "Die Lizenz ist abgelaufen.",
  "sca.deactivated": "Die Lizenz wurde deaktiviert.",
  "sca.not_found": "Die Lizenz wurde nicht gefunden.",
  "sca.riattiva": "Neue Lizenz eingeben",
  "gate.verifica": "Zugang wird geprüft…",
  "quota.tooltip": "Noch {n} PDF-Exporte mit diesem PUK-Code",
  "quota.ultimo": "Letzter verfügbarer PDF-Export mit diesem PUK-Code",
  "quota.titoloEsaurito": "PDF-Exporte aufgebraucht",
  "quota.testoEsaurito":
    "Du hast alle für diesen PUK-Code vorgesehenen PDF-Exporte verbraucht. Andere Arbeitsplätze der Lizenz sind nicht betroffen.",
  "quota.capito": "Verstanden",
  "err.ERR001": "E-Mail nicht per OTP bestätigt.",
  "err.ERR010": "Ungültige E-Mail-Adresse.",
  "err.ERR011": "Zu viele Code-Anfragen: bitte später erneut versuchen.",
  "err.ERR012": "Bestätigungscode falsch oder abgelaufen.",
  "err.ERR013": "Versand der E-Mail mit dem Code fehlgeschlagen.",
  "err.ERR014": "Erstellung der Anmeldesitzung fehlgeschlagen.",
  "err.ERR015": "Anmeldesitzung fehlt oder ist abgelaufen.",
  "err.ERR016": "Pflichtfelder fehlen.",
  "err.ERR101": "Lizenz für dieses Produkt nicht vorhanden oder deaktiviert.",
  "err.ERR103": "Lizenz abgelaufen.",
  "err.ERR201": "PUK-Code nicht vorhanden.",
  "err.ERR202": "PUK-Code bereits einem anderen Benutzer zugeordnet.",
  "err.ERR203": "PUK-Code gehört zu einem anderen Produkt.",
  "err.ERR204": "PUK-Code gehört nicht zur eingegebenen Lizenz.",
  "err.ERR302": "Lizenz beim Speichern der Zustimmung nicht gültig.",
  "err.ERR500": "Unerwarteter Serverfehler.",
  "err.ERR900": "Abmeldung beim Schließen der Anwendung fehlgeschlagen.",
};

const es: Record<ChiaveTesto, string> = {
  "auth.titolo": "Iniciar sesión",
  "auth.intro": "Introduce tu correo: te enviaremos un código de verificación.",
  "auth.email": "Correo electrónico",
  "auth.invia": "Enviar código",
  "auth.inviando": "Enviando…",
  "auth.codiceInviato": "Hemos enviado un código a {email}. Es válido durante {minuti} minutos.",
  "auth.codice": "Código de verificación (6 dígitos)",
  "auth.verifica": "Verificar y entrar",
  "auth.verificando": "Verificando…",
  "auth.cambiaEmail": "Usar otro correo",
  "att.titolo": "Activa la licencia",
  "att.intro": "Introduce la clave de licencia y el código PUK de tu puesto.",
  "att.email": "Correo verificado: {email}",
  "att.chiave": "Clave de licencia",
  "att.puk": "Código PUK",
  "att.attiva": "Activar",
  "att.attivando": "Activando…",
  "con.titolo": "Condiciones de uso",
  "con.p1":
    "El programa es una herramienta de apoyo al cálculo: el usuario debe comprobar siempre los resultados con el texto oficial del Reg. (UE) 2025/40.",
  "con.p2":
    "La licencia está asociada a un único puesto (código PUK) y no puede cederse a terceros.",
  "con.p3": "Los datos introducidos se conservan para que el servicio funcione.",
  "con.p4":
    "La aceptación se registra con fecha, idioma, versión de las condiciones y datos técnicos de conexión.",
  "con.accetto": "He leído y acepto las condiciones de uso",
  "con.continua": "Aceptar y continuar",
  "con.salvataggio": "Guardando…",
  "con.verifica": "Comprobando…",
  "sca.titolo": "Licencia no válida",
  "sca.expired": "La licencia ha caducado.",
  "sca.deactivated": "La licencia ha sido desactivada.",
  "sca.not_found": "No se ha encontrado la licencia.",
  "sca.riattiva": "Introducir una nueva licencia",
  "gate.verifica": "Comprobando el acceso…",
  "quota.tooltip": "Quedan {n} exportaciones PDF con este código PUK",
  "quota.ultimo": "Última exportación PDF disponible con este código PUK",
  "quota.titoloEsaurito": "Exportaciones PDF agotadas",
  "quota.testoEsaurito":
    "Has usado todas las exportaciones PDF previstas para este código PUK. Los demás puestos de la licencia no se ven afectados.",
  "quota.capito": "Entendido",
  "err.ERR001": "Correo no verificado mediante OTP.",
  "err.ERR010": "Dirección de correo no válida.",
  "err.ERR011": "Demasiadas solicitudes de código: inténtalo más tarde.",
  "err.ERR012": "Código de verificación incorrecto o caducado.",
  "err.ERR013": "No se pudo enviar el correo con el código.",
  "err.ERR014": "No se pudo crear la sesión de acceso.",
  "err.ERR015": "Sesión de acceso ausente o caducada.",
  "err.ERR016": "Faltan campos obligatorios.",
  "err.ERR101": "Licencia inexistente para este producto o desactivada.",
  "err.ERR103": "Licencia caducada.",
  "err.ERR201": "Código PUK inexistente.",
  "err.ERR202": "Código PUK ya asociado a otro usuario.",
  "err.ERR203": "Código PUK perteneciente a otro producto.",
  "err.ERR204": "Código PUK no asociado a la licencia introducida.",
  "err.ERR302": "Licencia no válida al guardar el consentimiento.",
  "err.ERR500": "Error inesperado del servidor.",
  "err.ERR900": "No se pudo cerrar la sesión al cerrar la aplicación.",
};

const TESTI: Record<LinguaAccesso, Record<ChiaveTesto, string>> = { it, en, de, es };

type Vars = Record<string, string | number>;

// ======================================================================
// FN005[CalcolaTesto]: restituisce il testo nella lingua richiesta sostituendo i segnaposto {nome}.
// ======================================================================
function FN005_CalcolaTesto(lingua: LinguaAccesso, chiave: ChiaveTesto, vars?: Vars): string {
  let testo = TESTI[lingua][chiave] ?? it[chiave];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) testo = testo.split(`{${k}}`).join(String(v));
  }
  return testo;
}

// ======================================================================
// FN006[useTestiAccesso]: hook che fornisce t() per i testi del modulo e te() per i messaggi 'ERRxxx: testo'.
// ======================================================================
export function useTestiAccesso() {
  const lingua = useLinguaApp();
  const t = (chiave: ChiaveTesto, vars?: Vars) => FN005_CalcolaTesto(lingua, chiave, vars);
  const te = (codice: CodiceErrore) => {
    const noto = codice in CODICI_ERRORE ? codice : "ERR500";
    return `${noto}: ${FN005_CalcolaTesto(lingua, `err.${noto}` as ChiaveTesto)}`;
  };
  return { t, te, lingua };
}
