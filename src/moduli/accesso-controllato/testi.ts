// ======================================================================
// Nome File: testi.ts
// Percorso: src/moduli/accesso-controllato/testi.ts
// Revisione: Rev. 2 (messaggi di errore arricchiti con indicazioni pratiche in IT, EN, DE, ES)
// Data/Ora: 2026-10-03 14:50
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
  "auth.codiceInviato":
    "Abbiamo inviato un codice a {email}. È valido {minuti} minuti. Controlla anche nello Spam se non lo vedi subito.",
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
  "con.p2": "La licenza è associata a una singola postazione (codice PUK) e non può essere ceduta a terzi.",
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
  "err.ERR001":
    "Email non ancora verificata. Inserisci il codice a 6 cifre ricevuto via email per completare la verifica.",
  "err.ERR010":
    "Indirizzo email non valido. Controlla di aver scritto correttamente l'indirizzo (es. nome@dominio.it senza spazi o caratteri errati).",
  "err.ERR011":
    "Limite richieste raggiunto. Hai richiesto troppi codici in poco tempo: attendi qualche minuto o riprova più tardi.",
  "err.ERR012":
    "Codice non valido o scaduto. Il codice dura 10 minuti. Controlla di aver digitato le 6 cifre esatte dell'ultima email, oppure richiedine uno nuovo.",
  "err.ERR013":
    "Invio dell'email non riuscito. Si è verificato un problema temporaneo nel servizio di posta. Attendi 30 secondi e riprova.",
  "err.ERR014":
    "Avvio sessione non riuscito. Non è stato possibile creare la sessione di lavoro. Riprova tra pochi istanti.",
  "err.ERR015":
    "Sessione scaduta per inattività. Per proteggere i tuoi dati, effettua nuovamente l'accesso con la tua email.",
  "err.ERR016": "Dati incompleti. Compila tutti i campi obbligatori prima di procedere.",
  "err.ERR017":
    "Indirizzo email non raggiungibile. La casella di posta non esiste o non può ricevere messaggi: controlla che l'indirizzo sia corretto.",
  "err.ERR101":
    "Licenza non valida o non attiva. Controlla la chiave di licenza ricevuta via email oppure contatta l'assistenza.",
  "err.ERR103":
    "Periodo di licenza terminato. La validità temporale del tuo piano è scaduta. Rinnova la licenza per continuare a usare l'applicazione.",
  "err.ERR201":
    "Codice PUK non riconosciuto. Verifica il codice PUK ricevuto via email (es. PUK-XXXXXXXXXX) e assicurati di non aver inserito spazi o caratteri estranei.",
  "err.ERR202":
    "Codice PUK già in uso su un'altra postazione. Utilizza un altro dei codici PUK inclusi nella tua licenza.",
  "err.ERR203":
    "Codice PUK non valido per questa applicazione. Questo PUK appartiene a un altro applicativo del portfolio.",
  "err.ERR204":
    "Abbinamento non corrispondente. Il codice PUK inserito non appartiene alla licenza specificata: verifica l'email di riepilogo della licenza.",
  "err.ERR302":
    "Impossibile salvare il consenso alle condizioni. Si è verificato un errore di connessione: riprova tra qualche istante.",
  "err.ERR500": "Errore momentaneo di connessione del server. Ricarica la pagina o riprova tra un minuto.",
  "err.ERR900":
    "Disconnessione completata parzialmente. I dati locali sono stati rimossi: puoi chiudere tranquillamente la scheda.",
} as const;

export type ChiaveTesto = keyof typeof it;

const en: Record<ChiaveTesto, string> = {
  "auth.titolo": "Sign in",
  "auth.intro": "Enter your email: we will send you a verification code.",
  "auth.email": "Email",
  "auth.invia": "Send code",
  "auth.inviando": "Sending…",
  "auth.codiceInviato":
    "We sent a code to {email}. It is valid for {minuti} minutes. Please also check Spam if you do not see it.",
  "auth.codice": "Verification code (6 digits)",
  "auth.verifica": "Verify and sign in",
  "auth.verificando": "Verifying…",
  "auth.cambiaEmail": "Use another email",
  "att.titolo": "Activate license",
  "att.intro": "Enter the license key and the PUK code for your seat.",
  "att.email": "Verified email: {email}",
  "att.chiave": "License key",
  "att.puk": "PUK code",
  "att.attiva": "Activate",
  "att.attivando": "Activating…",
  "con.titolo": "Terms of use",
  "con.p1": "This tool supports calculations: users must always verify results against Reg. (EU) 2025/40.",
  "con.p2": "The license is tied to a single seat (PUK code) and cannot be transferred to third parties.",
  "con.p3": "Entered data is kept only to allow the service to run.",
  "con.p4": "Acceptance is logged with date, language, terms version and technical connection data.",
  "con.accetto": "I have read and accept the terms of use",
  "con.continua": "Accept and continue",
  "con.salvataggio": "Saving…",
  "con.verifica": "Verifying…",
  "sca.titolo": "Invalid license",
  "sca.expired": "The license has expired.",
  "sca.deactivated": "The license has been deactivated.",
  "sca.not_found": "The license was not found.",
  "sca.riattiva": "Enter a new license",
  "gate.verifica": "Checking access…",
  "quota.tooltip": "{n} PDF exports left for this PUK code",
  "quota.ultimo": "Last PDF export available for this PUK code",
  "quota.titoloEsaurito": "PDF exports exhausted",
  "quota.testoEsaurito":
    "You have used all PDF exports for this PUK code. Other seats on the license are not affected.",
  "quota.capito": "Understood",
  "err.ERR001": "Email not verified. Enter the 6-digit code received via email to complete verification.",
  "err.ERR010": "Invalid email address. Please make sure the format is correct (e.g. name@domain.com).",
  "err.ERR011": "Too many requests. Please wait a few minutes before requesting a new code.",
  "err.ERR012": "Invalid or expired code. The code lasts 10 minutes. Check the 6 digits or request a new code.",
  "err.ERR013": "Failed to send email. Temporary issue with the mail service: please wait 30 seconds and retry.",
  "err.ERR014": "Failed to start session. Please try again in a few moments.",
  "err.ERR015": "Session expired due to inactivity. Please sign in again with your email.",
  "err.ERR016": "Missing required fields. Please fill in all fields before proceeding.",
  "err.ERR017":
    "Email address unreachable. The mailbox does not exist or cannot receive messages: please verify the address.",
  "err.ERR101": "Invalid or inactive license. Check your license email or contact support.",
  "err.ERR103": "License expired. Please renew your license to continue using the application.",
  "err.ERR201": "PUK code not recognized. Check the PUK received via email (e.g. PUK-XXXXXXXXXX).",
  "err.ERR202": "PUK code already in use on another workstation. Please use another PUK code from your license.",
  "err.ERR203": "PUK code not valid for this application. It belongs to another portfolio tool.",
  "err.ERR204": "License and PUK mismatch. This PUK is not linked to the specified license.",
  "err.ERR302": "Unable to save terms acceptance. Connection issue: please retry shortly.",
  "err.ERR500": "Temporary server connection error. Reload the page or retry in a minute.",
  "err.ERR900": "Partial sign out. Local data removed: you may safely close this tab.",
};

const de: Record<ChiaveTesto, string> = {
  "auth.titolo": "Anmelden",
  "auth.intro": "Geben Sie Ihre E-Mail ein: Wir senden Ihnen einen Bestätigungscode.",
  "auth.email": "E-Mail",
  "auth.invia": "Code senden",
  "auth.inviando": "Wird gesendet…",
  "auth.codiceInviato": "Code an {email} gesendet (gültig {minuti} Minuten). Bitte prüfen Sie auch den Spam-Ordner.",
  "auth.codice": "Bestätigungscode (6 Ziffern)",
  "auth.verifica": "Bestätigen und anmelden",
  "auth.verificando": "Wird überprüft…",
  "auth.cambiaEmail": "Andere E-Mail verwenden",
  "att.titolo": "Lizenz aktivieren",
  "att.intro": "Geben Sie den Lizenzschlüssel und den PUK-Code Ihres Arbeitsplatzes ein.",
  "att.email": "Bestätigte E-Mail: {email}",
  "att.chiave": "Lizenzschlüssel",
  "att.puk": "PUK-Code",
  "att.attiva": "Aktivieren",
  "att.attivando": "Wird aktiviert…",
  "con.titolo": "Nutzungsbedingungen",
  "con.p1": "Berechnungshilfe: Ergebnisse sind immer anhand der VO (EU) 2025/40 zu prüfen.",
  "con.p2": "Lizenz gilt für einen Arbeitsplatz (PUK) und ist nicht übertragbar.",
  "con.p3": "Eingegebene Daten werden für die Bereitstellung des Dienstes gespeichert.",
  "con.p4": "Die Zustimmung wird mit Datum, Sprache, Version und technischen Verbindungsdaten protokolliert.",
  "con.accetto": "Ich habe die Nutzungsbedingungen gelesen und akzeptiere sie",
  "con.continua": "Akzeptieren und fortfahren",
  "con.salvataggio": "Wird gespeichert…",
  "con.verifica": "Wird überprüft…",
  "sca.titolo": "Ungültige Lizenz",
  "sca.expired": "Die Lizenz ist abgelaufen.",
  "sca.deactivated": "Die Lizenz wurde deaktiviert.",
  "sca.not_found": "Die Lizenz wurde nicht gefunden.",
  "sca.riattiva": "Neue Lizenz eingeben",
  "gate.verifica": "Zugriff wird überprüft…",
  "quota.tooltip": "Noch {n} PDF-Exporte mit diesem PUK-Code verfügbar",
  "quota.ultimo": "Letzter verfügbarer PDF-Export für diesen PUK-Code",
  "quota.titoloEsaurito": "PDF-Exporte aufgebraucht",
  "quota.testoEsaurito": "Alle PDF-Exporte für diesen PUK-Code wurden verbraucht.",
  "quota.capito": "Verstanden",
  "err.ERR001": "E-Mail noch nicht bestätigt. Bitte den 6-stelligen Code eingeben.",
  "err.ERR010": "Ungültige E-Mail-Adresse. Bitte Format überprüfen.",
  "err.ERR011": "Zu viele Anfragen. Bitte warten Sie einige Minuten.",
  "err.ERR012": "Ungültiger oder abgelaufener Code. Bitte Code erneut eingeben.",
  "err.ERR013": "E-Mail-Versand fehlgeschlagen. Bitte in 30 Sekunden erneut versuchen.",
  "err.ERR014": "Sitzungserstellung fehlgeschlagen. Bitte erneut versuchen.",
  "err.ERR015": "Sitzung wegen Inaktivität abgelaufen. Bitte erneut anmelden.",
  "err.ERR016": "Pflichtfelder fehlen. Bitte füllen Sie alle Felder aus.",
  "err.ERR017": "E-Mail unzustellbar. Postfach existiert nicht: Adresse bitte überprüfen.",
  "err.ERR101": "Lizenz ungültig oder inaktiv. Bitte Schlüssel prüfen.",
  "err.ERR103": "Lizenz abgelaufen. Bitte Lizenz erneuern.",
  "err.ERR201": "PUK-Code unbekannt. Bitte Eingabe prüfen.",
  "err.ERR202": "PUK-Code bereits an einem anderen Arbeitsplatz in Verwendung.",
  "err.ERR203": "PUK-Code gehört zu einer anderen Anwendung.",
  "err.ERR204": "PUK-Code stimmt nicht mit der Lizenz überein.",
  "err.ERR302": "Zustimmung konnte nicht gespeichert werden.",
  "err.ERR500": "Vorübergehender Serverfehler. Bitte Seite neu laden.",
  "err.ERR900": "Abmeldung teilweise erfolgt. Tab kann geschlossen werden.",
};

const es: Record<ChiaveTesto, string> = {
  "auth.titolo": "Iniciar sesión",
  "auth.intro": "Introduce tu correo: te enviaremos un código de verificación.",
  "auth.email": "Correo",
  "auth.invia": "Enviar código",
  "auth.inviando": "Enviando…",
  "auth.codiceInviato": "Código enviado a {email} (válido {minuti} min). Revisa también la carpeta de Spam.",
  "auth.codice": "Código de verificación (6 dígitos)",
  "auth.verifica": "Verificar y entrar",
  "auth.verificando": "Verificando…",
  "auth.cambiaEmail": "Usar otro correo",
  "att.titolo": "Activar licencia",
  "att.intro": "Introduce la clave de licencia y el código PUK de tu puesto.",
  "att.email": "Correo verificado: {email}",
  "att.chiave": "Clave de licencia",
  "att.puk": "Código PUK",
  "att.attiva": "Activar",
  "att.attivando": "Activando…",
  "con.titolo": "Condiciones de uso",
  "con.p1": "Herramienta de cálculo: el usuario siempre verifica según el Reg. (UE) 2025/40.",
  "con.p2": "Licencia vinculada a un solo puesto (PUK) y no transferible.",
  "con.p3": "Los datos introducidos se conservan para prestar el servicio.",
  "con.p4": "La aceptación se registra con fecha, idioma, versión y datos técnicos.",
  "con.accetto": "He leído y acepto las condiciones de uso",
  "con.continua": "Aceptar y continuar",
  "con.salvataggio": "Guardando…",
  "con.verifica": "Verificando…",
  "sca.titolo": "Licencia no válida",
  "sca.expired": "La licencia ha caducado.",
  "sca.deactivated": "La licencia ha sido desactivada.",
  "sca.not_found": "No se encontró la licencia.",
  "sca.riattiva": "Introducir nueva licencia",
  "gate.verifica": "Comprobando acceso…",
  "quota.tooltip": "Quedan {n} exportaciones PDF para este código PUK",
  "quota.ultimo": "Última exportación PDF disponible para este código PUK",
  "quota.titoloEsaurito": "Exportaciones PDF agotadas",
  "quota.testoEsaurito": "Has agotado las exportaciones PDF para este PUK.",
  "quota.capito": "Entendido",
  "err.ERR001": "Correo no verificado. Introduce el código de 6 dígitos recibido por correo.",
  "err.ERR010": "Dirección de correo no válida. Revisa el formato.",
  "err.ERR011": "Demasiadas solicitudes. Espera unos minutos y vuelve a intentarlo.",
  "err.ERR012": "Código no válido o caducado (dura 10 min). Revisa los dígitos o pide otro.",
  "err.ERR013": "Error al enviar el correo. Espera 30 segundos y vuelve a intentarlo.",
  "err.ERR014": "No se pudo iniciar la sesión. Vuelve a intentarlo en unos instantes.",
  "err.ERR015": "Sesión caducada por inactividad. Vuelve a iniciar sesión.",
  "err.ERR016": "Faltan campos obligatorios. Completa todos los datos.",
  "err.ERR017": "Correo no alcanzable. El buzón no existe o no admite mensajes: comprueba la dirección.",
  "err.ERR101": "Licencia no válida o inactiva. Revisa la clave o contacta con soporte.",
  "err.ERR103": "Licencia caducada. Renuévala para continuar.",
  "err.ERR201": "Código PUK no reconocido. Revisa el código recibido por correo.",
  "err.ERR202": "Código PUK ya en uso en otro equipo.",
  "err.ERR203": "Código PUK no válido para esta aplicación.",
  "err.ERR204": "El código PUK no coincide con la licencia indicada.",
  "err.ERR302": "No se pudo registrar la aceptación de condiciones.",
  "err.ERR500": "Error de conexión temporal del servidor. Recarga la página.",
  "err.ERR900": "Cierre parcial. Datos locales eliminados: puedes cerrar la pestaña.",
};

const DIZIONARI: Record<LinguaAccesso, Record<ChiaveTesto, string>> = { it, en, de, es };

// ======================================================================
// FN005[OttieniTesto]: restituisce il testo localizzato per una chiave, sostituendo eventuali parametri.
// ======================================================================
export function FN005_OttieniTesto(
  lingua: LinguaAccesso,
  chiave: ChiaveTesto,
  parametri?: Record<string, string | number>,
): string {
  const dizionario = DIZIONARI[lingua] ?? DIZIONARI.it;
  let testo = dizionario[chiave] ?? DIZIONARI.it[chiave] ?? chiave;
  if (parametri) {
    for (const [k, v] of Object.entries(parametri)) {
      testo = testo.replaceAll(`{${k}}`, String(v));
    }
  }
  return testo;
}

// ======================================================================
// FN006[OttieniTestoErrore]: restituisce il messaggio descrittivo per un codice errore (standard ERRxxx).
// ======================================================================
export function FN006_OttieniTestoErrore(lingua: LinguaAccesso, codice: CodiceErrore): string {
  const chiave = `err.${codice}` as ChiaveTesto;
  const dizionario = DIZIONARI[lingua] ?? DIZIONARI.it;
  return dizionario[chiave] ?? CODICI_ERRORE[codice] ?? codice;
}

// ======================================================================
// FN007[useTestiAccesso]: hook React che fornisce le funzioni di traduzione per la lingua corrente dell'app.
// ======================================================================
export function useTestiAccesso() {
  const lingua = useLinguaApp();
  return {
    lingua,
    t: (chiave: ChiaveTesto, parametri?: Record<string, string | number>) =>
      FN005_OttieniTesto(lingua, chiave, parametri),
    te: (codice: CodiceErrore) => FN006_OttieniTestoErrore(lingua, codice),
  };
}
