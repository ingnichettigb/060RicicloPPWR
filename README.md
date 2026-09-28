# Recycle Right

RICICLABILITÀ PPWR: Riproduci l'applicazione a partire dal file zip allegato, implementandola con autenticazione utente e salvataggio su database cloud (Lovable Cloud) in modo che le valutazioni, i dati aziendali e il logo siano persistiti online e sincronizzati tra dispositivi.

Caratteristiche principali dell'applicazione da riprodurre:
- Calcolo della riciclabilità degli imballaggi secondo il Regolamento UE 2025/40 (PPWR)
- Composizione dei prodotti/imballaggi tramite componenti con nome, materiale, peso (g) e indice di riciclabilità (%)
- Calcolo automatico di peso totale, massa riciclabile effettiva, percentuale complessiva e classificazione del grado PPWR:
  * Grado A: ≥ 95% (Eccellenza)
  * Grado B: ≥ 80% (Alta riciclabilità)
  * Grado C: ≥ 70% (Soglia minima di ammissibilità)
  * Inferiore al 70%: non conforme / non ammesso
- Sezione Impostazioni per i dati aziendali (ragione sociale, indirizzo, P.IVA, referente, email) e caricamento logo
- Elenco delle valutazioni con possibilità di creare nuove analisi, duplicare, modificare ed eliminare
- Report tecnico completo stampabile e pronto per l'esportazione PDF con intestazione aziendale e logo

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/91d0fe95-f88e-4987-b1c5-a0be51442fb9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
