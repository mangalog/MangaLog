# MangaLog Next — prima prova Collezione + Social integrati

Ambiente: **solo test**, nessuna modifica alla versione pubblicata di MangaLog.
- Sito: https://mangalog-social-test.vercel.app
- Collezione Next TEST: https://mangalog-social-test.vercel.app/collection.html
- Social Next TEST: https://mangalog-social-test.vercel.app/
- Database: Supabase `MangaLog Social Test` (`bwohofvlcihlfixesnus`).
- Ramo sorgente: `mangalog-vnext-social-market`.
- Account: gli stessi account di test già usati per provare Feed e amicizie.
- Collezione di produzione: **NON** letta, importata o modificata.

## Procedura con due utenti
1. Accedi con A al Social test da PC, apri **Collezione** nella barra principale.
2. La schermata Collezione è una copia della versione recente online, ma salva **solo** nel database TEST. Aggiungi una serie di prova e spunta 1, 2, 3 come volumi posseduti. Attendi l'indicazione di sincronizzazione cloud.
3. Da Social → Profilo → Privacy seleziona **Condividi automaticamente i miei volumi**; scegli **Solo amici**. Le informazioni non diventano pubbliche prima del tuo consenso.
4. Con account B su telefono, esegui analogamente la stessa serie/edizione/editore, ad esempio volumi 1 e 2. Attiva condivisione e Solo amici.
5. In **Social → Confronta**, seleziona l'altro utente; verifica **2 in comune, 1 solo tuo**. Il confronto si basa su titolo, edizione, editore e volume, per ora senza identificativo catalogo canonico.
6. Torna nella Collezione TEST, aggiungi il volume 4. Dopo il salvataggio cloud torna in Social → Confronta: il nuovo volume deve apparire automaticamente.
7. Rimuovi un volume di prova: deve sparire dal confronto al successivo aggiornamento. Prova anche volume unico e numero speciale.
8. Disattiva **Condividi automaticamente**. L'altra persona non deve più visualizzare i volumi; i dati condivisi vengono eliminati dallo snapshot Social di test.

## Dettagli tecnici
- La versione Collection TEST è derivata dal file `index.html` della versione ufficiale su `main` al 17/11/2026, senza modificare l'originale.
- Collezione e Social si autenticano con lo stesso progetto e lo stesso storage key Supabase sul medesimo dominio Vercel.
- Solo dopo la conferma esplicita, i **volumi posseduti** vengono trasformati da `next-collection-bridge.js` e salvati tramite `social_sync_owned_volumes`, RPC con `SECURITY INVOKER` e RLS. Non vengono sincronizzati Wishlist, note, prezzi o dati personali non necessari.
- I volumi si sincronizzano dopo un salvataggio cloud completato, non durante modifiche offline o un caricamento cloud fallito. In caso di errore la copia Social precedente non viene sostituita da una lista vuota.
- La sincronizzazione automatica è limitata per ora a 5000 volumi alla volta; è un limite prudenziale dei test.
- Le grafiche libreria vengono recuperate dai file statici nel repository GitHub; se alcune risorse non sono accessibili, andranno incluse nell'hosting Next.
- Non è ancora un'unica SPA: Collezione e Social sono due schermate/pagine collegate nello stesso sito e account. L'unificazione della navigazione e le rifiniture grafiche restano successive.
- **Da collaudare nel browser reale**: ritorno Social ↔ Collezione con le due sessioni già aperte e sincronizzazione automatica end-to-end.
- In fase di rilascio ripristinare conferma email e configurare SMTP adeguato.

## Sicurezza
La tabella `public.mangalog_collections` del progetto TEST ha RLS per singolo utente. `public.social_collection_volumes` è condivisa con gli altri utenti solo quando `auto_sync_enabled=true` e la visibilità è amici/pubblica, rispettando i blocchi. Le verifiche SQL simulate e i test statici sono separati dalla prova browser.
