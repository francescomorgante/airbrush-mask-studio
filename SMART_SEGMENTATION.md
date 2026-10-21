# Segmentazione intelligente v0.6

La prima tranche stabile implementa **Separa per colore** con K-means deterministico nello spazio percettivo CIELAB. Il calcolo avviene in un Web Worker e non modifica il progetto finché l’utente non conferma.

## Flusso disponibile

1. Importare una fotografia e scegliere **Segmenta colori**.
2. Selezionare da 2 a 16 gruppi e avviare l’analisi.
3. Scegliere una singola regione connessa oppure l’intero gruppo cromatico.
4. Combinare scelte con aggiungi, sottrai o interseca.
5. Applicare al livello attivo, creare una maschera oppure creare una maschera per ciascun gruppo scelto.
6. Rifinire normalmente con pennello/gomma ed esportare in PNG o SVG.

Le maschere confermate sono salvate come raster binari RLE nel `.airbrush.json`; non dipendono dal ricalcolo di K-means e restano compatibili con Undo/Redo, livelli, raccordi ed export. L’elaborazione è limitata a 8 megapixel per contenere l’uso di memoria della prima versione.

## Non ancora completato

- Il controllo dettaglio è predisposto nell’interfaccia, ma filtri micro-regioni in mm² e confronto prima/dopo richiedono un incremento successivo.
- SLIC/superpixel non è ancora disponibile.
- **Isola soggetto** non è incluso in questa tranche: non viene presentato come equivalente a flood fill o rettangolo. Sarà abilitato soltanto dopo segmentazione soggetto/sfondo reale, correzioni foreground/background e test interattivi.
- L’annullamento interrompe il Worker chiudendo il dialogo; non è ancora presente un pulsante di stop separato durante il calcolo.
