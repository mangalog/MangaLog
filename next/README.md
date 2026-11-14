# MangaLog Next — sviluppo parallelo

**Data avvio:** 14 novembre 2026  
**Versione stabile conservata:** commit `12bf03aea26bd84ba43649da4b11f11912462451`  
**Ramo stabile:** [mangalog-stabile-2026-11-14](https://github.com/mangalog/MangaLog/tree/mangalog-stabile-2026-11-14)  
**Ramo di sviluppo:** `mangalog-vnext-social-market`

## Principio non negoziabile

Non modificare, sovrascrivere o migrare automaticamente la MangaLog pubblicata su `https://mangalog.github.io/MangaLog/`, le collezioni reali degli utenti o il suo Supabase di produzione.

Questo ramo e la pagina `next/index.html` rappresentano un nuovo progetto. L'anteprima è una demo statica, senza credenziali, API reali, letture/scritture cloud, negozi reali o ordini.

## Visione approvata

Tre grandi aree: **Home/Collezione**, **Social** e **Market**.
- La collezione personale, la Mancolista, la Wishlist e la sincronizzazione continueranno a essere gratuite.
- **Social**: profilo con nickname/avatar/bio, amicizie con richiesta/accettazione/rimozione/blocco, ricerca per nickname, consenso per la condivisione della collezione, confronto titoli comuni/esclusivi, privacy per impostazione predefinita.
- **Market**: **inizialmente pagina segnaposto**; poi vetrina delle fumetterie aderenti, ricerca di volumi mancanti, link dai risultati della Mancolista e, solo in una fase successiva e dopo verifiche, eventuali ordini e pagamenti. L'idea di tariffazione per i negozi non è una decisione già presa.
- Immagini, copertine, cataloghi e ISBN italiani: soltanto fonti legalmente riutilizzabili; questione da affrontare separatamente. Nessun uso non autorizzato di immagini o dati editoriali.

## Stato reale al primo commit

- ✅ Backup del codice stabile tramite ramo e SHA identificato.
- ✅ Nuovo ramo indipendente.
- ✅ Prima anteprima responsive `next/index.html`: Home, Collezione demo, Social demo interattivo, Market senza vendite.
- ⬜ Backend Social test separato (Supabase dedicato/non produzione).
- ⬜ Login isolato, account, privacy, RLS verificati.
- ⬜ Amicizie reali, confronti reali, notifiche.
- ⬜ Marketplace reale, negozi e inventario.

## Prossimi incrementi, nell'ordine

1. **Architettura dati e sicurezza**: progetto Supabase di prova separato, login di test, schema minimo utenti Social, accesso RLS; nessuna connessione al database stabile.
2. **Profili e amicizie**: nickname pubblico, profilo facoltativo, richieste in attesa, accettazione/rifiuto, rimozione e blocco, controlli anti-abuso.
3. **Condivisione privata delle collezioni**: consenso esplicito revocabile, elenco per amici autorizzati, niente email o dati degli acquisti/prezzi esposti.
4. **Confronto tra amici**: titoli/edizioni in comune, esclusivi, numeri posseduti; gestire edizioni diverse senza confonderle.
5. **Rifinitura UI/UX su Samsung, iPhone e PC** e test multi-account.
6. **Market pagina iniziale**: progettare una prima vetrina per 1–3 negozi pilota, senza pagamenti integrati; decidere il modello commerciale solo dopo i test.
7. **Catalogo italiano ISBN/copertine**: tema complesso e separato, non blocca la struttura Social.

## Sicurezza

- Una collezione è **privata per default**. La possibilità di compararla non equivale a renderla pubblica.
- Un'amicizia non implica automaticamente accesso a note, prezzi, dati anagrafici o email.
- RLS sul server, non semplice filtraggio grafico.
- Nessuna chiave segreta nel browser o nel repository.
- Per i test, solo utenti e serie fittizie; nessun backup di collezioni reali caricato nel progetto di prova.
- Niente ordini veri, pagamenti, annunci live o gestione di dati di pagamento finché non esiste una struttura legale e tecnica verificata.

## Sviluppo e anteprime

L'anteprima è un unico HTML statico. È intenzionalmente isolata dai file `index.html` e `cloud-config.js` della MangaLog stabile. Non usare la preview come prova che Social o Market siano connessi o pubblicati.

In futuro, ogni nuova funzione entra prima in ambiente di sviluppo e viene testata sui browser e dispositivi usati; soltanto con una decisione esplicita si pianifica un'eventuale migrazione della nuova versione al pubblico.
