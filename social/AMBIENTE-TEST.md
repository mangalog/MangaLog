# MangaLog Social Test — ambiente di prova

- **Progetto:** `MangaLog Social Test`, Supabase `bwohofvlcihlfixesnus`, regione `eu-west-2`.
- **Costo comunicato da Supabase durante la creazione:** 0 USD/mese, piano Free.
- **Progetto online da non toccare:** `trfbpctrqrlaqczpyzks`.
- **Ramo GitHub:** `mangalog-vnext-social-market`.
- **Connessione browser:** `social-test-config.js` contiene soltanto URL e chiave *publishable* del progetto di prova. Non contiene segreti o service_role.

### Migrazioni applicate
1. `social/schema.sql`
2. `social/collection-compare.sql`
3. `social/privacy-hardening.sql`
4. `social/api-privileges.sql` (RPC anon bloccate)\n5. `social/safe-friendship-responses.sql` (accettazione con RLS senza RPC privilegiata)\n6. `social/private-rls-helpers.sql` (funzioni interne fuori dallo schema pubblico)
7. `social/notifications.sql` (notifiche testuali: richieste, accettazioni, commenti e like)

Le otto tabelle `social_*` hanno tutte RLS attivo. Le RPC sensibili sono negate al ruolo `anon`. Le due funzioni interne `SECURITY DEFINER` sono nello schema non esposto `social_private`, richiamabili soltanto dal ruolo autenticato. L'advisor di sicurezza Supabase non segnala più avvisi nel progetto di test (verifica del 16 novembre 2026).

### Test eseguiti
- SQL transazionale con due identità fittizie, **ROLLBACK** al termine.
- Snapshot privato: non visibile ad altro utente.
- Amicizia accettata + visibilità amici: confronto consentito.
- Blocco dell'altro utente: accesso nuovamente negato.
- Nessun account di prova fittizio rimasto nel database.

### Navigazione approvata
- **PC:** menu laterale MangaLog → Social espanso (Feed, Amici, Confronta, Profilo, Privacy).
- **Smartphone:** quattro tab Social in alto (Feed, Amici, Confronta, Profilo), Privacy dentro Profilo; **una sola barra principale MangaLog** in basso.
- **Fotografie:** disattivate, si usa solo testo e numeri volumi.

### Limitazioni attuali
- Test reale con due account registrati in Supabase Auth ancora da verificare tramite una distribuzione di test sotto un'origine affidabile.
- La pagina `social-preview-standalone.html` usa *solo dati fittizi* e non chiede credenziali.
- Il database Social non importa in automatico la Collezione principale: gli utenti decidono esplicitamente cosa condividere.
- Non utilizzare un visualizzatore HTML di terze parti per inserire password reali, nemmeno di test, senza averne verificato l'affidabilità.

### Verifica delle risposte alle richieste\nIl mittente non può accettare una richiesta: solo il destinatario può aggiornare `status` da `pending` a `accepted` o `declined`, attraverso RLS e permessi di colonna. L'indice `social_friend_unique_pair_idx` evita richieste duplicate anche in direzioni opposte. Le prove con SQL vengono sempre annullate tramite `ROLLBACK`.\n
### Notifiche (fase successiva)
- Campanella nella barra in alto; non aggiunge una quinta scheda alla navigazione Social mobile.
- Eventi generati nel database, senza immagini o caricamenti in Storage.
- Il destinatario può segnare le notifiche come lette; gli utenti bloccati non compaiono più nelle notifiche visibili.
- Test transazionale `social/tests/notifications-rollback.sql`: inviti, accettazioni, commenti, like, accesso del destinatario e blocchi. Tutti i dati del test sono annullati.
- Il test browser con due account reali è ancora da fare su un'origine web affidabile: non inserire password nell'anteprima servita da visualizzatori esterni.
