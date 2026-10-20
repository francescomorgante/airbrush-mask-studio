# Raccordi stencil — versione 0.4

La modalità stencil individua le **isole**, cioè regioni non tagliate completamente circondate dalla maschera. Senza un collegamento queste parti si staccherebbero dal foglio dopo il taglio.

## Uso

1. Apri **Esporta maschera** e scegli il livello attivo oppure l'unione dei livelli visibili.
2. Imposta la larghezza automatica in millimetri e premi **Rigenera tutti**. Il motore crea un solo ponte essenziale per isola, scegliendo percorsi brevi nello spazio fisico ed evitando, quando possibile, uscite troppo ravvicinate.
3. Controlla l'anteprima e la voce `isole residue`. Zero indica che ogni isola rilevata è collegata all'esterno.
4. Seleziona un'isola per evidenziarla e filtrare i suoi ponti. Puoi rigenerare la sola isola, aggiungere un ponte, trascinarne i nodi sull'anteprima, modificarlo in millimetri o eliminarlo. **Annulla/Ripeti** agisce sulle modifiche stencil.
5. Scarica SVG o PNG. Entrambi usano la stessa geometria. Salva anche il progetto per conservare le modifiche.

La colonna dei controlli scorre indipendentemente: anteprima, zoom e posizione restano stabili. La rotella modifica lo zoom soltanto quando il puntatore è sopra l'anteprima. I pulsanti **Prima/Dopo** permettono di confrontare la maschera originale con la geometria connessa finale.

## Modello geometrico

Il riconoscimento usa componenti con connettività a quattro lati. Il bordo dell'immagine è considerato esterno. Un calcolo multi-sorgente pesato in millimetri trova i collegamenti corti; tra candidati equivalenti viene penalizzata la vicinanza alle uscite già usate. Ogni isola riceve al massimo un ponte automatico, evitando duplicati. La larghezza è misurata nello spazio fisico del documento, quindi rimane corretta anche quando pixel e millimetri hanno proporzioni diverse sugli assi.

Il percorso automatico è un punto di partenza: prima della produzione verificare sempre resistenza del materiale, scala di stampa al 100% e anteprima. Dettagli diagonali o ponti molto sottili possono richiedere correzioni manuali.
