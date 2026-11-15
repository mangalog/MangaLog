# MangaLog Social vNext — fase 1
Branch: `mangalog-vnext-social-market`. Nessuna modifica alle sezioni Home, Collezione e Mancolista.
## Stato
- Schema SQL iniziale per profili, amicizie, blocchi, post, commenti e like.
- Privacy collezione: `private` predefinita; `friends` o `public` solo su scelta esplicita.
- RLS attivata sulle nuove tabelle. Nessun accesso alla collezione esistente introdotto.
- Da verificare in Supabase TEST: migrazione, permessi RPC, casi di blocco, amicizie reciproche, utenti anonimi e performance.
## Prima di attivare
1. Creare un progetto Supabase separato per test, senza riutilizzare credenziali di produzione.
2. Applicare `social/schema.sql` in SQL Editor sul progetto di test.
3. Verificare i test RLS con almeno tre utenti autenticati e un utente anonimo.
4. Integrare l'autenticazione dell'app, poi interfaccia profili e amici.
5. Integrare feed e notifiche. Per condividere collezioni creare RPC specifiche, senza aprire le tabelle private.
Non è un Social già pubblicato o funzionante: questa è la prima base backend.
