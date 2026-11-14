# MangaLog Next — Identità visiva e visione definitiva

**Design approvato il 14 novembre 2026.**

## Nome e destinazione

**MangaLog Next** è soltanto il nome di sviluppo della nuova generazione.
Quando le funzioni saranno complete, sicure e collaudate, l'applicazione pubblica si chiamerà **MangaLog** (non "MangaLog Next"), con sostituzione della versione stabile soltanto dopo un rilascio pianificato e backup verificati.

La MangaLog stabile attuale deve rimanere intatta durante tutto lo sviluppo parallelo.

## Riferimenti grafici forniti e approvati dall'utente

Sono stati recuperati i bozzetti originali:
- **Dashboard MangaLog: Collezione Manga in Notte Giapponese.png** — Home/Collezione desktop: sfondo giapponese notturno, aceri rossi, sidebar a sinistra, pannelli blu scuro, contatori, copertine, progressi e pulsanti rossi.
- **Dashboard Social MangaLog di Notte Giapponese.png** — Social desktop: tab Amici / Aggiungi amici / Collezioni; barra numeri; tre colonne "I tuoi amici", "Attività degli amici", "Collezioni in evidenza"; confronto collezioni.
- **Mercato Manga nella Notte Giapponese.png** — Market desktop: intestazione, riquadri fumetterie/offerte/spedizioni, ricerca, filtri a chip, banner in evidenza, schede manga, navigazione laterale.
- **Anteprime MangaLog in stile neon-manga.png** — ulteriori viste mobile/desktop, Mancolista, Wishlist, Statistiche e varianti di tema.
Queste immagini sono il riferimento **di layout, gerarchia visiva, atmosfera e colori**; non costituiscono autorizzazione a riutilizzare personaggi o copertine protetti o a inventare offerte e negozi realmente attivi.

## Regole di design approvate

- Tema principale: **Giappone di notte** blu-nero, aceri giapponesi rossi, luna e architettura tradizionale.
- **Navigazione principale definitiva a cinque voci**: Home, Collezione, Mancolista, Social, Market, sia su desktop sia su smartphone. Wishlist, Statistiche, Volumi posseduti, Gestione acquisti e Impostazioni sono accessibili con pulsanti interni alla sezione Collezione. La futura Dashboard Admin sarà accessibile soltanto all'amministratore dalla sua area riservata.
- Navigazione mobile comoda, senza sidebar laterale permanente; evitare tremolii o scroll anomali dello sfondo su iPhone.
- Pannelli scuri con bordo blu, testo bianco leggibile, azioni principali rosse, secondarie azzurre, badge funzionali.
- **Home/Collezione**: contatori, libreria visibile, filtro grid/list, copertine quando legali, posseduti, Mancolista e dettaglio edizioni.
- **Social**: richieste di amicizia, attività e collezioni in evidenza, consenso esplicito alla condivisione, confronto consentito. Privacy di default.
- **Market**: ricerca, mancanti, offerte e novità, filtri per negozi e disponibilità, schede con editore, volume e fumetteria; vendita solo quando negozi, accordi, prezzi e infrastruttura sono verificati.
- Titoli, etichette, prezzi e disponibilità visibili nell'anteprima attuale sono **esempi**, non dati reali.
- Logo MangaLog coerente e originale, evitando elementi testuali giapponesi di significato incerto.

## Stato tecnico corrente

- `next/index.html`: versione Next che riutilizza direttamente **le pagine, CSS, componenti e logica Collezione/Mancolista/Wishlist/Statistiche dell'ultima MangaLog stabile**, con menu semplificato, Social segnaposto e Market vuoto. Dati campione locali su chiave distinta, senza Supabase.
- `next/next-visual.css`: prime regole per aderire ai quattro bozzetti approvati.
- Nessuna lettura dei dati della collezione stabile, nessuna autenticazione, nessun acquisto.
- Nuovo backend Social e la sicurezza RLS devono usare **un ambiente di prova distinto**.

## Prossimi step

1. Rifinire fedeltà visiva su Samsung, PC e iPhone, partendo dalle schermate Social e Market originali, senza usare direttamente le immagini come screenshot non interattivi.
2. Portare Mancolista, Wishlist, Statistiche e gestione collezione in un modello di test separato.
3. Profili veri, richieste di amicizia, consenso, privacy, blocchi e confronto.
4. Market vetrina per negozi pilota dopo accordi e catalogo autorizzato.
5. Test di migrazione dati e rilascio graduale finale con backup e rollback.

## Decisione successiva — Navigazione e riutilizzo (14 novembre 2026)

Confermato dall'utente: **non ridisegnare** le funzioni già funzionanti della MangaLog originale; mantenere le stesse schermate, accorpandole sotto Collezione (e Mancolista in voce principale). La copia originale in Next usa `mangalog_next_actual_collection_2026` come chiave dati locale, scollegata da Supabase, e non registra un service worker separato. Non deve essere confusa con la versione pubblica completa. Il vecchio prototipo Social è archiviato in `next/anteprima-social-archivio.html`. Sul ramo principale soltanto `/next/` mostra la nuova struttura; `/MangaLog/` non cambia.
