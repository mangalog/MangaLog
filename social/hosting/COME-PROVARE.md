# MangaLog Social Next — Sito di test HTTPS

**Indirizzo di prova (Supabase, progetto separato):**
https://bwohofvlcihlfixesnus.supabase.co/functions/v1/mangalog-social-test

- Progetto Supabase test: `bwohofvlcihlfixesnus`.
- Branch GitHub: `mangalog-vnext-social-market`.
- Progetto ufficiale **da non modificare**: `trfbpctrqrlaqczpyzks`.
- Funzione HTTP: `mangalog-social-test`; codice sorgente `social/hosting/supabase-edge-social-test.ts`.
- La pagina HTML è pubblica per permettere registrazione/login. **Tutti i dati Social sono protetti** tramite login Supabase e policy RLS.
- È vietato inserire credenziali dell'account principale nella pagina test: creare password diverse e account dedicati.
- Il sito è marcato `noindex`, ma **il link rimane accessibile a chi lo conosce**.
- Non sono utilizzate immagini caricate né chiavi privilegiate.

## Prova multiutente

1. Aprire il link in un browser PC. Registrare l'**account prova A** con email e password dedicate. Confermare l'eventuale email di attivazione e tornare al link di prova.
2. Creare un profilo con nickname e nome visibile.
3. Aprire il link sul telefono o in un **altro profilo browser**. Registrare l'**account prova B** con un indirizzo distinto e una password dedicata. Creare il profilo.
4. Con A, andare in **Amici → Cerca utenti**, trovare il nickname di B, e inviare la richiesta.
5. Con B, entrare in **Amici → Richieste** e accettare; controllare le notifiche della campanella.
6. Con B, in **Confronta**, aggiungere volontariamente una serie e volumi (es. `One Piece`, `Standard`, `1, 2`). In **Profilo → Privacy**, scegliere **Solo amici**.
7. Con A, inserire manualmente un proprio snapshot e confrontare con B; controllare i filtri **In comune / Solo miei / Solo suoi**.
8. Provare Feed, commenti, like e notifiche. Testare Privacy **Privata** e blocco: i dati non autorizzati devono sparire.

**Attenzione:** non inserire dati di collezioni reali se non si desidera condividerli volontariamente. È una piattaforma di sviluppo.

## Limiti conosciuti
- Le collezioni ufficiali non vengono importate automaticamente. Sono separati i numeri salvati nel Social Test.
- La pagina di login non è stata ancora verificata manualmente con browser e indirizzi email reali.
- Il sito test è servito da una funzione con risposta HTML pubblica; il database non ha accesso pubblico alle righe social.
- L'anteprima `social-preview-standalone.html` usa solo dati fittizi e **non richiede password**.
- Le sei voci della barra inferiore mobile stanno sulla stessa riga; le quattro schede Social restano in alto.

## Aggiornamenti del sito
Quando cambia `social.html`, `social-vnext.css` o `social-vnext.js`, ricostruire e distribuire di nuovo `social/hosting/supabase-edge-social-test.ts` nel **progetto test**. I test automatici verificano che il codice HTML ospitato corrisponda al codice Social corrente.

## Correzione redirect email (registrazione)

Se cliccando sulla mail di conferma il browser apre `localhost` e mostra `ERR_CONNECTION_REFUSED`, significa che **Supabase Auth** ha ancora `Site URL` impostato su localhost. L'utente potrebbe **essere già confermato**: tornare a Vercel e provare **Accedi**.

Configurare solo il progetto **Supabase MangaLog Social Test**:
- Dashboard: https://supabase.com/dashboard/project/bwohofvlcihlfixesnus/auth/url-configuration
- **Site URL:** `https://mangalog-social-test.vercel.app/`
- **Redirect URLs:** aggiungere `https://mangalog-social-test.vercel.app/**`
- Salvare le modifiche. **Non** modificare il progetto MangaLog principale.
- In `social-vnext.js`, `signUp` passa ora `options.emailRedirectTo` con il dominio Vercel di test.

La precedente mail già utilizzata non va rinviata se il conto è confermato; effettuare l'accesso. I nuovi collegamenti di conferma useranno il sito Vercel dopo che le impostazioni Supabase saranno salvate.

