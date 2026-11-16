# Social vNext — Test e integrazione sicura

## Interfaccia approvata
La pagina `social.html` sul ramo `mangalog-vnext-social-market` contiene:
- Feed testuale con like e commenti
- Profilo con nickname, biografia, statistiche e privacy
- Ricerca amici e gestione richieste
- Confronto per serie, **edizione** e numero di volume
- Impostazioni di visibilità `private`, `friends`, `public`

In assenza di configurazione, `social.html` funziona in **modalità DEMO**, con dati fittizi soltanto in memoria browser. Le foto non vengono caricate.

## Solo dopo aver creato Supabase TEST
1. Creare un **nuovo** progetto Supabase, differente da quello pubblicato.
2. Eseguire **in sequenza**, nel database TEST: `social/schema.sql`, `social/collection-compare.sql`, `social/privacy-hardening.sql`.
3. Compilare `social-test-config.js` con `enabled:true`, l'URL del progetto TEST e **solo** una chiave publishable. Il codice rifiuta la URL nota del progetto principale.
4. Registrare almeno tre account di test.
5. Verificare: profilo privato per impostazione iniziale; invito/accettazione/rifiuto; blocco; feed pubblico/amicizie; post/like/commenti; nessuna visibilità dei volumi di utenti privati; confronto degli snapshot autorizzati.
6. Non eseguire queste migrazioni sul progetto di produzione senza revisione e test di sicurezza.

## Privacy e dati
Il confronto non consulta la collezione personale esistente: gli utenti inseriscono **volontariamente** i numeri in `social_collection_volumes`. Questo evita la divulgazione automatica. Le copertine e gli upload fotografici non sono implementati.

## Sviluppo in parallelo
Le correzioni ai pulsanti e al layout PC della sezione Collezione devono proseguire su un **ramo differente**. Mai committare direttamente sul ramo online.

## Stato reale
- Completato: design e demo navigabile integrati nel ramo social; codice API per funzionalità social.
- Da verificare: test multiutente sul nuovo database Supabase TEST e verifica RLS.
- Non pubblicato: nessuna modifica alla versione online.
