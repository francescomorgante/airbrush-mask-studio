# Verifica v0.1 — 19 ottobre 2026

- Installazione da lockfile riuscita con pnpm 11.25.0; autorizzato esclusivamente lo script di build esbuild in pnpm-workspace.yaml.
- Build Vite production riuscita.
- 4 test automatici engine superati: serializzazione completa, coordinate zoom/pan, input non valido, composizione gomma.
- Anteprima HTTP locale: 200.
- Verifica browser eseguita con PNG 800 × 500: importazione, rinomina livello, scala 320 × 200 mm, pennello, gomma, download e riapertura del file completo, visibilità e zoom.
- Verificati layout desktop 1440 × 900 e disposizione su viewport stretta.
- Nuovo repository Git locale isolato. Nessun repository esistente modificato.
- Workflow Actions/Pages predisposto, ma non eseguito sui server GitHub. Nessun repository remoto creato e nessuna pubblicazione effettuata: la connessione GitHub disponibile non espone la creazione di repository.

Limiti di verifica: test browser manuali, nessuna suite end-to-end automatica; JPG, grandi immagini e carichi elevati non provati nel browser. Pan verificato nella trasformazione coordinate tramite test; gesture di pan non inclusa nel controllo browser. L'accesso da un altro PC sarà disponibile dopo il primo deploy Pages, seguendo il README.

## Revisione ponticelli v0.4 — 20 ottobre 2026

- Lavoro eseguito sul branch `feat/v0.4-bridge-ux`; `main` non è stato modificato.
- Suite Node completata: 22/22 test superati, inclusi connessione isola-esterno, larghezze fisiche, round trip progetto e misura dei percorsi in millimetri.
- Build Vite production completata con 30 moduli trasformati.
- Verificato l'avvio HTTP locale e il caricamento della schermata principale nel browser integrato, senza errori iniziali.
- La finestra stencil mantiene preview e viewport separati dallo scroll dei controlli; il wheel è legato alla sola area preview.
- L'export SVG continua a essere generato dalla maschera raster finale dopo l'applicazione dei ponti; il download viene disabilitato finché risultano isole residue.

Limiti: non è disponibile una suite end-to-end con fixture immagine per automatizzare drag, pan e scroll annidato. La verifica delle interazioni avanzate resta uno smoke test manuale consigliato prima del merge. Il motore usa una griglia a quattro vicini e una rosa massima di 32 candidati brevi per isola: privilegia percorsi puliti e distanziati, ma forme molto sottili, diagonali o materiali fragili possono richiedere correzione manuale.

## Avvio v0.5 — 21 ottobre 2026

- Branch dedicato creato da `feat/v0.4-bridge-ux`; `main` non modificato.
- Aggiunti test puri per flood fill contiguo/non contiguo, tolleranza e operazioni booleane, round trip dei punti selezione e regressione strutturale P0 della finestra export.
- Build production verificata dopo l'incremento. La verifica browser interattiva completa resta da eseguire prima del merge.
- P4 e il completamento della revisione algoritmica P5 restano esplicitamente aperti; l'attuale algoritmo v0.4 migliorato non viene dichiarato definitivo.
