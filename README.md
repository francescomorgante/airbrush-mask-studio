# Airbrush Mask Studio 0.2

[Apri app online](https://francescomorgante.github.io/airbrush-mask-studio/) · [Guida alla generazione automatica](GENERATION.md)

Web app desktop-first React + Vite per progettare maschere da aerografo. Tutte le immagini e le maschere sono elaborate nel browser.

## Avvio

Richiede Node.js 22 e pnpm 11.25.0 (`corepack enable`, poi `corepack prepare pnpm@11.25.0 --activate`, se Corepack è disponibile).

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

## Utilizzo

1. Importa PNG o JPG (massimo 24 megapixel e 80 MB).
2. Imposta la larghezza o altezza reale in mm; l'altra dimensione segue le proporzioni originali. La scala va specificata dall'utente: non viene dedotta dalla fotografia.
3. Premi **Genera maschera**, regola soglia, inversione e dettaglio, quindi **Crea livello**. Oppure dipingi sul livello selezionato; cambia nome, colore e visibilità o aggiungi maschere. La gomma cancella solo la maschera attiva. Il diametro è espresso in pixel dell'immagine originale.
4. B: pennello, E: gomma, H: sposta. Spazio + trascinamento o pulsante centrale: pan. Rotella: zoom sul puntatore. Adatta: centra l'immagine. Annulla/Ripeti conserva fino a 30 operazioni.
5. Salva un `.airbrush.json`. Include immagine, dimensioni, livelli e tratti. Aprilo da qualsiasi PC per proseguire. Il file va salvato esplicitamente: non esiste autosalvataggio o sincronizzazione cloud. Prima di chiudere, l'app segnala le modifiche non salvate.

## GitHub e pubblicazione

Creare un **nuovo repository vuoto** `airbrush-mask-studio`, senza inizializzazione README. Non utilizzare un repository esistente. Dalla cartella del progetto:

```sh
git init -b main
git add .
git commit -m "Airbrush Mask Studio v0.1"
git remote add origin https://github.com/ACCOUNT/airbrush-mask-studio.git
git push -u origin main
```

In GitHub: Settings → Pages → Build and deployment → Source → GitHub Actions. Il workflow esegue test e build sulle pull request e pubblica i push su main. Con Pages abilitato, eseguire nuovamente il workflow se il primo deploy fallisce. Il sito sarà su `https://ACCOUNT.github.io/airbrush-mask-studio/`. Vite usa percorsi relativi, compatibili con le sottocartelle Pages. Per Pages gratuito usare un repository pubblico; disponibilità di repository privati dipende dal piano GitHub.

Da un altro PC basta aprire quell'indirizzo. I file progetto devono essere trasferiti a parte (chiavetta, cartella condivisa, ecc.). Non sono caricati su GitHub. La UI usa un font Google opzionale con fallback di sistema; nessuna immagine viene inviata a servizi remoti.

## Architettura

- `src/engine/project.js`: modello documento versionato, validazione, serializzazione e coordinate, senza dipendenze React o DOM.
- `src/engine/render.js`: composizione Canvas 2D. Ogni maschera è composta separatamente; la gomma non modifica la foto o altri livelli.
- `src/engine/extensions.js`: punti di estensione futuri per vettorializzazione, raccordi, SVG e AI. Non implementati nella v0.1. Geometria in pixel sorgente, conversione in mm tramite dimensioni documento.
- `src/main.jsx`: UI React, gestione file, gesture, cronologia e viewport.
- `tests/engine.test.js`: round trip, validazione, trasformazione coordinate e composizione della gomma.

Il modello conserva tratti rasterizzabili anziché screenshot: zoom e salvataggio sono indipendenti dalla risoluzione dello schermo. L'immagine embedded rende il file autonomo. File versione futura vengono rifiutati per evitare letture scorrette. Limiti: composizione ricalcolata a ogni modifica, massimo 100 livelli e due milioni di punti; immagini grandi o molti tratti possono rallentare. Nessun export SVG, taglio macchina, raccordo o servizio AI attivo in questa versione. Le misure mm sono metadati progettuali e non garantiscono accuratezza di stampa.
