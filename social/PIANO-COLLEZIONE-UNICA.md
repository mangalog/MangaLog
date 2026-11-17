# MangaLog Next — Collezione unica e Social (piano approvato)

## Situazione al 17 novembre 2026
- Gli utenti hanno verificato su due dispositivi **registrazione, Feed, amicizie, notifiche e confronto manuale**.
- L'app attuale ha un archivio `data.series` con `title`, `edition`, `publisher`, `owned` e `specialVolumes`; per gli utenti cloud è salvato nel JSON `payload` della tabella `mangalog_collections`.
- Il Social Test usa un **altro progetto Supabase**; gli utenti di prova e gli utenti dell'app ufficiale non sono automaticamente la stessa identità.
- Il sito pubblico MangaLog e il database della produzione rimangono immutati.

## Principio del prodotto
**Una sola Collezione, mantenuta nell'app.** Il Social mostra una proiezione dei volumi posseduti, non crea un secondo archivio da modificare a mano.

## Fase A — Proiezione sicura (base già pronta)
`social/collection-bridge.js` trasforma il payload della Collezione in righe di soli volumi posseduti:
- considera titolo, edizione, editore e numero;
- evita duplicati e ignora Wishlist, note, prezzi, piani d'acquisto e volumi non posseduti;
- distingue gli speciali per etichetta, anche quando il numero coincide con quello di un volume normale;
- include automaticamente i volumi unici posseduti;
- prepara inserimenti/aggiornamenti/rimozioni, perché se un volume non è più posseduto deve sparire dal confronto;
- non effettua richieste di rete, non legge le informazioni del sito ufficiale e non tocca il database.

## Fase B — Collezione completa nel progetto Next TEST (da sviluppare)
1. Creare la versione di prova della schermata Collezione nello stesso ambiente/app Social (senza migrare i dati reali degli utenti).
2. Usare lo **stesso account di test** per Collezione e Social.
3. Salvare la Collezione TEST in una tabella con RLS basata sull'utente (evitare copie di dati reali o credenziali del progetto online).
4. Conservare le funzionalità già stabilizzate: Home, Collezione, Mancolista, Wishlist, priorità e compatibilità smartphone/PC.

## Fase C — Sincronizzazione Social automatica ma consensuale
1. In Profilo → Privacy mostrare un'opzione esplicita `Condividi i volumi della mia collezione`, disattivata inizialmente.
2. Dopo consenso, sincronizzare i **soli numeri posseduti** sulla tabella `social_collection_volumes` protetta da RLS, senza importare altri dati.
3. Ogni salvataggio nella Collezione TEST aggiorna il confronto in modo automatico (anche cancellazioni e cambi di edizione).
4. In assenza di consenso, il Social non deve esporre alcun elenco di volumi.
5. Se il consenso viene revocato, fermare gli aggiornamenti e rendere subito il confronto privato; definire opzione per cancellare la copia Social.
6. Non cancellare un'intera copia quando il caricamento dei dati originali fallisce: nessun `[]` di fallback distruttivo.

## Fase D — Collaudo reale e release
- Due account, due browser/dispositivi; aggiunta, rimozione, volumi unici e speciali; edizioni omonime con editori differenti.
- Rispetto privacy `private`, `friends`, `public`, blocchi e richieste; rilevare errori di sincronizzazione.
- Verificare RLS e performance prima di trasferire il design e i servizi nella nuova app completa.
- **Non importare né trasferire automaticamente** la collezione MangaLog ufficiale durante questi collaudi.
- Marketplace e caricamento foto rimangono fuori dal perimetro attuale.

## Nota sulle chiavi di matching
Il primo matching è conservativo: titolo + edizione + editore; eventuali abbreviazioni o sinonimi possono far risultare non coincidenti due versioni realmente uguali. Per migliorare l'accuratezza sarà utile un identificativo catalogo canonico per edizione. Non assumere che tutte le serie con lo stesso titolo siano identiche.

## Limiti attuali (non confondere con funzionalità già attive)
`collection-bridge.js` **non è ancora collegato all'interfaccia**, né al database test.
Nel Social Test il confronto continua a utilizzare gli snapshot condivisi manualmente.
La versione online ufficiale non è stata modificata.
