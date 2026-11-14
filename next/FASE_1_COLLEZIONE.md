# MangaLog Next — FASE 1: Collezione

Data: 14 novembre 2026

## Ordine di sviluppo concordato

1. **Collezione completa**: Home, Collezione, Mancolista, Wishlist, Statistiche, Gestione acquisti, impostazioni essenziali, scanner ISBN e backup.
2. **Social**: account separati, nickname, richieste amici, privacy, condivisione selettiva, confronti ed eventi autorizzati.
3. **Market**: vetrine delle fumetterie, ricerca manga e volumi mancanti, accordi negozi, inventario e solo dopo gestione acquisti/pagamenti.

Durante lo sviluppo la piattaforma si chiama MangaLog Next. Al rilascio finale il nome pubblico sarà **MangaLog**.

## Demo Collezione 1.0, già sviluppata

Tutti i dati riportati nella preview sono **dimostrativi** e salvati soltanto in `sessionStorage` con chiave `mangalog-next-demo-collection-2026-v1`. Nessuna chiamata a Supabase e nessuna modifica alla MangaLog stabile.

- **Home**: contatori sincronizzati con la collezione demo, schede manga e accessi rapidi.
- **Collezione**: ricerca per serie/edizione/editore, filtri complete/incomplete, griglia/lista, creazione e modifica di serie, dettagli per numero, note, editore ed edizione.
- **Mancolista**: menu serie, solo numeri mancanti, selezione multipla tramite tocco, conferma unica, conversione a posseduti, priorità per **intera serie**, ordinamento alta/media/bassa, bordi rosso/giallo/verde marcati.
- **Wishlist**: nuova serie desiderata, modifica/rimozione, priorità e prezzo desiderato facoltativo.
- **Statistiche**: progressi, posseduti, volumi mancanti e distribuzione per editore che si aggiornano con i cambiamenti della demo.
- **Gestione acquisti**: lista e filtro ordini in corso/completati e cambio stato nella demo.
- **Navigazione**: barra laterale PC per tutte le sezioni; su mobile Home / Collezione / Mancolista / Social / Altro (Wishlist, Statistiche, acquisti e Market).

## Non ancora implementato: necessario prima di dichiarare completata la Collezione

- Sostituire il modello demo con un backend di **sviluppo** separato. Collegare account e sincronizzazione tra PC, Samsung e iPhone, con RLS.
- Migrazione controllata dello schema reale MangaLog, senza perdita di dati, con backup JSON e test di ripristino.
- Gestione avanzata: numerazioni speciali, autore, duplicati, ricerca e import/export delle edizioni italiane.
- Scanner ISBN con verifica edizione/duplicati e cloud sul nuovo backend.
- Rifinitura del multi-select mobile tramite pressione prolungata di 1 secondo e trascinamento desktop.
- Wishlist: suggerimento eventuale valore di mercato solo da fonti verificabili e lecite.
- Copertine e catalogo ISBN italiani: ricerca provider/licenze, nessun uso non autorizzato.
- Accesso Admin soltanto all'amministratore e flussi impostazioni, login/logout.
- Test responsive e accessibilità su PC, Samsung e iPhone; nessun banner pubblicitario o acquisto reale nella demo.

## Principi di sicurezza

- **Non collegare questa anteprima al Supabase di produzione**.
- La collezione privata non viene condivisa automaticamente nel Social.
- Nessuna operazione di vendita nel Market fino alla definizione dei requisiti tecnici, contrattuali e legali.
- Lo sviluppo procede sul ramo `mangalog-vnext-social-market`; una copia preview può essere pubblicata esclusivamente in `/MangaLog/next/`.
- Integrazione e sostituzione dell'app pubblica soltanto dopo collaudo e conferma.
