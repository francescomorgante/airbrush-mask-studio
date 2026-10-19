# Esportazione — v0.3

1. Importa una foto o riapri un progetto, poi dipingi o genera la maschera.
2. Imposta le dimensioni reali in mm nel progetto.
3. Premi **Esporta maschera** nella barra superiore.
4. Scegli il **livello attivo** (anche se nascosto) oppure **l'unione dei livelli visibili**. La gomma di un livello non cancella le aree degli altri livelli.
5. Scegli PNG o SVG, controlla l'anteprima e premi **Scarica**.

## PNG bianco/nero

Nero indica le aree della maschera, bianco lo sfondo. Il file ha le dimensioni in pixel dell'immagine originale, senza fotografia o colori dei livelli. La selezione usa una soglia di opacità del 50% per ottenere bordi binari. I metadati PNG pHYs contengono la risoluzione calcolata dalle misure mm: alcuni programmi di stampa possono ignorarli. Impostare il formato desiderato e stampare al 100%, senza adattamento alla pagina.

## SVG vettoriale

Contiene veri contorni chiusi, senza immagine raster incorporata. Larghezza e altezza sono espresse in mm; il viewBox usa le coordinate dell'immagine originale. I fori sono trasparenti e conservati mediante riempimento evenodd. La visualizzazione in anteprima usa uno sfondo chiaro per rendere visibili i fori, che non viene esportato come rettangolo aggiuntivo.

**Semplifica contorni** accetta 0–3 pixel: 0 conserva i contorni esatti dei pixel, un valore maggiore riduce i vertici. Il filtro conserva tutti gli anelli e ripiega sui contorni esatti se rileva incroci, cambi di contenimento o troppa complessità per la verifica. La semplificazione può modificare dettagli piccoli: controllare l'anteprima. Il valore è espresso nei pixel originali, non in mm.

Per maschere molto rumorose, oltre 200.000 segmenti di bordo, l'SVG viene rifiutato con un messaggio che propone PNG o una nuova generazione con meno dettagli. Questo limite evita file ingestibili e blocchi prolungati.

Esportare non salva il documento modificabile: conserva anche il file `.airbrush.json`. Nessun dato lascia il dispositivo durante l'esportazione. Ponti per sostenere le isole dello stencil, raccordi e compensazione del taglio non sono inclusi in questa versione.

## Verifica

16 test automatici superati: inclusa ricostruzione esatta di tutte le 512 maschere binarie 3×3, contatti diagonali, fori, semplificazione, dimensioni SVG, metadati PNG e compatibilità progetti. Build production riuscita.
