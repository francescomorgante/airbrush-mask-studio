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
