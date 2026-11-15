# Confronto collezioni — implementazione isolata
Questa migrazione crea uno **snapshot volontario** dei soli numeri di volume che l'utente decide di condividere.
Non legge né modifica i dati della collezione MangaLog esistente.
La visibilità è governata da `social_profiles.collection_visibility`: privata (predefinita), amici, pubblica.
La funzione `social_compare_collections(other_user)` restituisce una riga per volume:
- `mine=true, theirs=true`: in comune
- `mine=true, theirs=false`: soltanto nella mia collezione
- `mine=false, theirs=true`: soltanto nella collezione dell'altro utente
Se l'altra collezione è privata, la funzione restituisce solo i miei volumi (non prova l'esistenza di volumi nascosti).
**Da fare:** importazione volontaria dalla collezione attuale, interfaccia confronto, test RLS con utenti differenti e verifica di serie omonime/edizioni diverse. Le chiavi serie devono includere l'edizione per evitare falsi confronti.
Non applicare in produzione senza test.
