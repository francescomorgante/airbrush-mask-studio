# Raccordi stencil — versione 0.4

La modalità stencil individua le **isole**, cioè regioni non tagliate completamente circondate dalla maschera. Senza un collegamento queste parti si staccherebbero dal foglio dopo il taglio.

## Uso

1. Apri **Esporta maschera** e scegli il livello attivo oppure l'unione dei livelli visibili.
2. Imposta la larghezza automatica in millimetri e premi **Rileva isole e genera**.
3. Controlla l'anteprima e la voce `isole residue`. Zero indica che ogni isola rilevata è collegata all'esterno.
4. Ogni ponte può essere disattivato, rimosso, ridimensionato o corretto impostando inizio e fine in millimetri. **+ Manuale** aggiunge un ponte modificabile.
5. Scarica SVG o PNG. Entrambi usano la stessa geometria. Salva anche il progetto per conservare le modifiche.

## Modello geometrico

Il riconoscimento usa componenti con connettività a quattro lati. Il bordo dell'immagine è considerato esterno. Per ogni isola il motore calcola il percorso più corto sulla griglia verso l'esterno e lo converte in un raccordo. La larghezza è misurata nello spazio fisico del documento, quindi rimane corretta anche quando pixel e millimetri hanno proporzioni diverse sugli assi.

Il percorso automatico è un punto di partenza: prima della produzione verificare sempre resistenza del materiale, scala di stampa al 100% e anteprima. Dettagli diagonali o ponti molto sottili possono richiedere correzioni manuali.
