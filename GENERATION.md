# Generazione automatica — v0.2

App pubblicata: https://francescomorgante.github.io/airbrush-mask-studio/

1. Importa una foto PNG/JPG oppure riapri un progetto.
2. Nel pannello a destra premi **Genera maschera**.
3. Regola **Soglia luminosità**: un valore più alto include più zone scure. Con **Inverti** selezioni invece le zone più chiare della soglia.
4. **Riduci dettaglio** applica una media locale da 1 a 4 pixel prima della selezione. Aiuta ad attenuare particolari piccoli; non è una vettorializzazione o un riconoscimento del soggetto.
5. L'anteprima nasconde temporaneamente gli altri livelli. **Crea livello** aggiunge il risultato senza cambiare le maschere esistenti; **Annulla anteprima** ripristina la vista precedente.
6. Rifinisci il nuovo livello con pennello e gomma; puoi cambiarne colore, nome e visibilità, oppure annullare la creazione.
7. Salva il progetto: i parametri generativi e le correzioni manuali sono inclusi insieme all'immagine. I documenti v0.1 sono letti e aggiornati al formato 2. I nuovi documenti richiedono l'app v0.2 o successiva.

L'elaborazione avviene sul dispositivo. Le zone completamente trasparenti del PNG restano escluse; per calcolare la luminosità, i pixel semitrasparenti vengono considerati su fondo bianco. Il risultato è raster: SVG, ponti per stencil, raccordi e AI restano sviluppi futuri. Immagini molto grandi possono richiedere un breve tempo di calcolo.
