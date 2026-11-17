# Pubblicare il Social TEST su Vercel (senza toccare MangaLog online)

> **Attenzione:** il precedente link `https://bwohofvlcihlfixesnus.supabase.co/functions/v1/mangalog-social-test` non deve essere usato per il login. Supabase Edge sul dominio condiviso restituisce HTML come testo: lo abbiamo sostituito con un reindirizzamento alla demo senza credenziali.

## Configurazione
Il sito statico pronto per Vercel si trova nel ramo GitHub `mangalog-vnext-social-market` alla directory `social/test-site`.
Contiene `index.html` (HTML/CSS/JS completo, nessuna chiave segreta) e `vercel.json` (intestazioni di sicurezza).
Il backend usato è **solo** `MangaLog Social Test` (`bwohofvlcihlfixesnus`). **Non** è il progetto principale.

Per pubblicare:
1. Apri [Vercel — Add New Project](https://vercel.com/new), seleziona GitHub e scegli il repository `mangalog/MangaLog`.
2. Crea un progetto **distinto**, ad esempio `mangalog-social-test`.
3. Imposta **Framework Preset: Other** e **Root Directory: `social/test-site`** (nessun comando di build per il sito statico).
4. Imposta **Production Branch: `mangalog-vnext-social-market`** in Project Settings → Environments / Git secondo l'interfaccia Vercel. Verifica che il sito Social **non** venga pubblicato dal ramo `main`.
5. Pubblica dal ramo di test. Vercel assegnerà un dominio `*.vercel.app` che deve aprire la schermata Social, **non** il codice sorgente.
6. Se attivata, la protezione dei Preview Deployments può richiedere un login Vercel. Per prove con due utenti su browser diversi configura l'accesso in modo appropriato, senza disabilitare la sicurezza del database.
7. In Supabase **Social Test** → Authentication → URL Configuration, registra l'**esatto dominio HTTPS Vercel** come redirect autorizzato per le email di conferma. Non modificare la configurazione del Supabase di produzione.
8. Usa due email diverse e password di prova uniche; verifica login, amicizie e confronto volumi come in `social/hosting/COME-PROVARE.md`.

## Importante
- Non è necessario pagare alcun piano per il solo codice HTML statico, ma **Vercel Hobby è destinato a uso personale e non commerciale**. Prima di ospitare pubblicamente funzionalità commerciali/marketplace, verificare il piano e i termini.
- Non inserire password nel sito statico servito da `raw.githack.com` o da altri proxy non controllati.
- Non cambiare mai il ramo `main`, la distribuzione MangaLog ufficiale o le credenziali della produzione.
- Vercel e Supabase hanno pannelli separati: la pagina statica usa Supabase JS per autenticare e interrogare il database con RLS.
- Gli aggiornamenti di `social-vnext.js` e `social-vnext.css` richiedono di rigenerare `social/test-site/index.html`; i test GitHub lo verificano.
