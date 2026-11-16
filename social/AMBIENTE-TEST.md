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
4. `social/api-privileges.sql`

Le sette tabelle `social_*` hanno tutte RLS attivo. Le RPC sensibili sono negate al ruolo `anon`. L'advisor di sicurezza segnala ancora le funzioni `SECURITY DEFINER` richiamabili dal ruolo `authenticated`, una scelta controllata per amicizie e blocchi da riesaminare prima della produzione.

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
