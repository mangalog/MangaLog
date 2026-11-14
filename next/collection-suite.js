/* MangaLog Next — Collezione 1.0 / isolated interactive demo, November 2026.
   No production cloud access. Only uses a unique sessionStorage key. */
(function(){
'use strict';
const KEY='mangalog-next-demo-collection-2026-v1';
const priorityNames={high:'Alta',medium:'Media',low:'Bassa'};
const priorityRank={high:0,medium:1,low:2};
const pages=new Set(['collection','missing','wishlist','statistics','purchases','series-detail']);
const seq=(n)=>Array.from({length:n},(_,i)=>i+1);
const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const label=x=>String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function seed(){
 return {
  series:[
   {id:'op',title:'One Piece',edition:'New Edition',publisher:'Star Comics',total:110,owned:seq(34),priority:'high',notes:'Sto recuperando gli ultimi volumi.'},
   {id:'dd',title:'Dandadan',edition:'Edizione italiana',publisher:'J-POP Manga',total:20,owned:seq(12),priority:'high',notes:''},
   {id:'be',title:'Berserk',edition:'Serie Nera',publisher:'Planet Manga',total:41,owned:seq(9),priority:'medium',notes:'Controllare eventuali ristampe.'},
   {id:'fr',title:'Frieren',edition:'Edizione italiana',publisher:'J-POP Manga',total:14,owned:seq(6),priority:'low',notes:''},
   {id:'na',title:'Naruto',edition:'Planet Manga',publisher:'Panini Manga',total:72,owned:seq(72),priority:'low',notes:'Collezione completa.'}
  ],
  wishlist:[
   {id:'w1',title:'Blue Period',edition:'Edizione italiana',priority:'high',targetPrice:'',notes:'Iniziare dal primo volume.'},
   {id:'w2',title:'Atelier of Witch Hat',edition:'Edizione italiana',priority:'medium',targetPrice:'',notes:''},
   {id:'w3',title:'ReLIFE',edition:'Edizione italiana',priority:'low',targetPrice:'',notes:''}
  ],
  orders:[
   {id:'o1',label:'Volumi mancanti di One Piece',vendor:'Fumetteria demo',volumes:'35, 36',status:'in-progress'},
   {id:'o2',label:'Dandadan volume 12',vendor:'Ordine demo',volumes:'12',status:'completed'}
  ],
  activity:[]
 };
}
function validData(raw){
 return !!raw&&Array.isArray(raw.series)&&Array.isArray(raw.wishlist)&&Array.isArray(raw.orders)&&
 raw.series.every(s=>s&&typeof s.id==='string'&&typeof s.title==='string'&&Number.isInteger(s.total)&&s.total>=1&&s.total<=2000&&Array.isArray(s.owned));
}
function read(){
 try{
  const cached=sessionStorage.getItem(KEY);
  if(cached){const parsed=JSON.parse(cached);if(validData(parsed))return parsed}
 }catch(err){console.info('Demo storage not available',err)}
 return seed();
}
let data=read();
const view={layout:'grid',query:'',filter:'all',sort:'title',detailId:null,
 selectedSeries:'',selected:new Set(),missingFilter:'all',wishSort:'priority',ordersFilter:'in-progress',dialog:null};
function save(){
 try{sessionStorage.setItem(KEY,JSON.stringify(data))}catch(err){console.info('Demo persistence unavailable',err)}
}
function missing(s){
 const owned=new Set(s.owned.map(Number));
 return Array.from({length:s.total},(_,i)=>i+1).filter(n=>!owned.has(n));
}
function priorityClass(s){return priorityNames[s.priority]?s.priority:'medium'}
function sortedMissing(){
 return data.series.filter(s=>missing(s).length).sort((a,b)=>priorityRank[priorityClass(a)]-priorityRank[priorityClass(b)]||a.title.localeCompare(b.title,'it'));
}
function stats(){
 const owned=data.series.reduce((sum,s)=>sum+s.owned.length,0),total=data.series.reduce((sum,s)=>sum+s.total,0);
 return {series:data.series.length,owned,total,missing:Math.max(0,total-owned),
  completed:data.series.filter(s=>s.owned.length>=s.total).length,
  wishlist:data.wishlist.length,progress:total?Math.round(100*owned/total):0};
}
function getOverviewSeries(){return data.series.map(s=>({title:s.title,edition:s.edition,publisher:s.publisher,owned:s.owned.length,total:s.total,initial:s.title.slice(0,2).toUpperCase()}))}
function chipPriority(p){return '<span class="priority-chip '+esc(p)+'">● '+priorityNames[p]+'</span>'}
function note(){return '<div class="library-demo-banner">▣ <strong>Ambiente di prova MangaLog Next.</strong> Questi sono dati inventati: le modifiche restano soltanto nella scheda del browser, non vengono inviate al tuo account e non cambiano MangaLog stabile. Puoi ripristinare la demo quando vuoi.</div>'}
function heading(eyebrow,title,caption){
 return '<div class="kicker">'+eyebrow+'</div><h1 class="heading">'+title+'</h1><p class="subtitle">'+caption+'</p>'
}
function summaryCards(){
 const s=stats();
 return '<div class="library-stats">'+[
  ['▦ Volumi posseduti',s.owned,'Nella libreria demo'],
  ['▤ Serie',s.series,s.completed+' completate'],
  ['☷ Mancolista',s.missing,'Numeri ancora mancanti'],
  ['♡ Wishlist',s.wishlist,'Desideri nella demo']
 ].map(x=>'<div class="library-stat"><span class="label">'+x[0]+'</span><span class="value">'+x[1]+'</span><span class="detail">'+x[2]+'</span></div>').join('')+'</div>'
}
function collectionCard(s){
 const p=Math.min(100,Math.round(100*s.owned.length/s.total));
 return '<article class="library-card"><span class="priority-mark '+priorityClass(s)+'"></span>'+
  '<div class="volume-art"><small>MANGALOG · MANGA</small><strong>'+esc(s.title)+'</strong></div>'+
  '<div class="main-info"><h3>'+esc(s.title)+'</h3><div class="meta">'+esc(s.edition)+' · '+esc(s.publisher)+'</div>'+
  '<div class="bar"><span style="width:'+p+'%"></span></div>'+
  '<div class="counts">'+s.owned.length+' / '+s.total+' volumi · '+p+'%</div>'+
  '<div style="margin-top:8px">'+chipPriority(priorityClass(s))+'</div>'+
  '<div class="library-actions"><button type="button" class="btn secondary" data-library-action="detail" data-id="'+esc(s.id)+'">ⓘ Dettagli</button>'+
  (missing(s).length?'<button type="button" class="btn" data-library-action="missing-series" data-id="'+esc(s.id)+'">☷ Mancanti ('+missing(s).length+')</button>':
   '<span class="badge green">Completa</span>')+'</div></div></article>'
}
function collection(){
 const query=label(view.query);
 const filtered=data.series.filter(s=>(!query||label([s.title,s.edition,s.publisher].join(' ')).includes(query))&&
  (view.filter==='all'||view.filter==='complete'&&s.owned.length===s.total||view.filter==='incomplete'&&s.owned.length<s.total));
 filtered.sort((a,b)=>view.sort==='progress'?(b.owned.length/b.total-a.owned.length/a.total):a.title.localeCompare(b.title,'it'));
 return heading('LA TUA LIBRERIA','La tua collezione','Serie, edizioni e volumi insieme. Dal dettaglio puoi segnare i numeri posseduti o raggiungere rapidamente la Mancolista.')+
 summaryCards()+
 '<div class="library-toolbar">'+
 '<input id="librarySearch" class="library-search" type="search" aria-label="Cerca serie" placeholder="⌕ Cerca manga, edizione, editore..." value="'+esc(view.query)+'">'+
 '<select id="libraryFilter" class="library-select" aria-label="Filtra serie">'+
 [['all','Tutte le serie'],['incomplete','Da completare'],['complete','Completate']].map(o=>'<option value="'+o[0]+'" '+(view.filter===o[0]?'selected':'')+'>'+o[1]+'</option>').join('')+'</select>'+
 '<select id="librarySort" class="library-select" aria-label="Ordina serie">'+
 [['title','Titolo A–Z'],['progress','Più completate']].map(o=>'<option value="'+o[0]+'" '+(view.sort===o[0]?'selected':'')+'>'+o[1]+'</option>').join('')+'</select>'+
 '<button class="btn '+(view.layout==='grid'?'primary':'')+'" data-library-action="layout" data-value="grid" aria-label="Vista griglia">▦</button>'+
 '<button class="btn '+(view.layout==='list'?'primary':'')+'" data-library-action="layout" data-value="list" aria-label="Vista elenco">☷</button>'+
 '<button class="btn primary" data-library-action="new-series">＋ Nuova serie</button></div>'+
 '<div class="library-grid '+(view.layout==='list'?'list':'')+'">'+
 (filtered.length?filtered.map(collectionCard).join(''):'<div class="library-empty">Nessuna serie corrisponde alla ricerca. Puoi cambiare i filtri oppure aggiungere una serie alla demo.</div>')+'</div>'+
 '<div class="library-actions-row"><button class="btn" data-library-action="reset">↻ Ripristina dati demo</button></div>'+note()+dialogHtml();
}
function detail(){
 const s=data.series.find(x=>x.id===view.detailId)||data.series[0];
 if(!s)return heading('COLLEZIONE','La tua collezione','Nessuna serie presente.')+'<button class="btn" data-library-action="back">← Indietro</button>'+note();
 view.detailId=s.id;
 const owned=new Set(s.owned);
 const ownedCards=Array.from({length:s.total},(_,i)=>i+1).map(n=>
  '<button type="button" class="library-volume '+(owned.has(n)?'owned':'missing')+'" data-library-action="toggle-owned" data-id="'+esc(s.id)+'" data-num="'+n+'" title="'+(owned.has(n)?'Segna come mancante':'Segna come posseduto')+'"> '+n+(owned.has(n)?' ✓':'')+'</button>').join('');
 return '<div class="library-actions-row"><button class="btn" data-library-action="back">← Torna alla collezione</button></div>'+
 '<div class="library-details-box"><div class="library-detail"><div class="detail-art">'+esc(s.title)+'</div>'+
 '<div><div class="kicker">DETTAGLIO SERIE</div><h1 class="heading" style="margin-top:7px">'+esc(s.title)+'</h1>'+
 '<p class="small">'+esc(s.edition)+' · '+esc(s.publisher)+'</p>'+
 '<p class="small">'+s.owned.length+' / '+s.total+' volumi posseduti · '+missing(s).length+' mancanti</p>'+
 '<label class="small" for="librarySeriesPriority">Priorità di acquisto</label><select id="librarySeriesPriority" class="library-select" style="margin-top:7px;max-width:230px">'+
 Object.keys(priorityNames).map(p=>'<option value="'+p+'" '+(priorityClass(s)===p?'selected':'')+'>'+priorityNames[p]+'</option>').join('')+'</select>'+
 '<div class="library-actions-row"><button class="btn primary" data-library-action="missing-series" data-id="'+esc(s.id)+'">☷ Vai alla Mancolista</button>'+
 '<button class="btn" data-library-action="edit-series" data-id="'+esc(s.id)+'">✎ Modifica serie</button></div></div></div></div>'+
 '<div class="library-details-box"><h3>Volumi della tua collezione</h3><p class="small">Tocca un numero per spostarlo tra posseduti e mancanti. Le modifiche riguardano soltanto la demo.</p>'+
 '<div class="library-priority-legend"><span style="color:#92eac5">● Verde: posseduto</span><span style="color:#a5d3ee">● Blu: mancante</span></div>'+
 '<div class="library-volume-grid">'+ownedCards+'</div></div>'+
 (s.notes?'<div class="library-note"><strong>Note:</strong> '+esc(s.notes)+'</div>':'')+
 '<div class="library-actions-row"><button class="btn" data-library-action="back">← Torna alla collezione</button></div>'+note()+dialogHtml();
}
function missingPage(){
 const ordered=sortedMissing();
 const validChoice=ordered.some(s=>s.id===view.selectedSeries);
 if(!validChoice){view.selectedSeries=ordered[0]?.id||'';view.selected.clear()}
 const s=ordered.find(s=>s.id===view.selectedSeries);
 const chosen=view.selected.size;
 return heading('LA TUA MANCOLISTA','Mancolista','Scegli una serie, tocca i numeri mancanti e aggiungili alla collezione. Le serie con priorità alta vengono mostrate per prime.')+
 summaryCards()+
 (!ordered.length?'<div class="library-empty">Nessun volume mancante nella demo. Puoi aggiungere una nuova serie oppure segnare un volume come mancante dal dettaglio.</div>':
 '<div class="library-missing-layout"><section class="library-details-box" style="margin:0">'+
 '<label class="small" for="libraryMissingSeries"><strong>Seleziona una serie</strong></label>'+
 '<select id="libraryMissingSeries" class="library-select" style="margin:8px 0 14px">'+
 ordered.map(x=>'<option value="'+esc(x.id)+'" '+(x.id===view.selectedSeries?'selected':'')+'>'+esc(x.title)+' · '+missing(x).length+' mancanti · '+priorityNames[priorityClass(x)]+'</option>').join('')+'</select>'+
 (s?'<div class="card-row" style="justify-content:space-between;gap:10px"><div><strong>'+esc(s.title)+'</strong><div class="small">'+esc(s.edition)+'</div></div>'+
 chipPriority(priorityClass(s))+'</div>'+
 '<label class="small" for="libraryMissingPriority" style="display:block;margin:15px 0 6px">Priorità della serie</label>'+
 '<select id="libraryMissingPriority" class="library-select" style="max-width:230px">'+
 Object.keys(priorityNames).map(p=>'<option value="'+p+'" '+(priorityClass(s)===p?'selected':'')+'>'+priorityNames[p]+'</option>').join('')+'</select>'+
 '<div class="library-heading"><h2>Numeri mancanti</h2><span class="small">'+missing(s).length+' volumi</span></div>'+
 '<div class="library-volume-grid">'+missing(s).map(n=>'<button type="button" class="library-volume missing '+(view.selected.has(n)?'selected':'')+'" data-library-action="select-missing" data-num="'+n+'" aria-pressed="'+view.selected.has(n)+'">'+n+'</button>').join('')+'</div>'+
 '<div class="library-priority-legend">Tocca i numeri per selezionarli. Nessun volume viene modificato fino alla conferma.</div>':
 '')+'</section>'+
 '<aside class="library-missing-side"><strong>Volumi selezionati</strong><div class="library-stat" style="margin-top:13px"><span class="value">'+chosen+'</span><span class="label">da aggiungere</span></div>'+
 '<button class="btn primary" data-library-action="add-selected" '+(!chosen?'disabled':'')+'>✓ Aggiungi alla collezione</button>'+
 '<button class="btn" data-library-action="clear-selected" '+(!chosen?'disabled':'')+'>Annulla selezione</button>'+
 '<div class="library-note" style="margin-top:18px">Dopo la conferma, i volumi compariranno tra i posseduti e spariranno dalla Mancolista. Nella demo non vengono effettuati ordini reali.</div></aside></div>')+
 '<div class="library-heading"><h2>Tutte le serie con volumi mancanti</h2></div>'+
 '<div class="library-missing-series">'+ordered.map(x=>'<div class="row '+(x.id===view.selectedSeries?'selected':'')+'"><button data-library-action="missing-series" data-id="'+esc(x.id)+'">'+esc(x.title)+'</button>'+
 chipPriority(priorityClass(x))+'<span class="small">'+missing(x).length+'</span></div>').join('')+'</div>'+
 note();
}
function wishlistPage(){
 const list=data.wishlist.slice().sort((a,b)=>view.wishSort==='priority'?priorityRank[priorityClass(a)]-priorityRank[priorityClass(b)]||a.title.localeCompare(b.title,'it'):a.title.localeCompare(b.title,'it'));
 return heading('I TUOI DESIDERI','Wishlist','Serie da acquistare con priorità alta, media o bassa. Il prezzo desiderato è facoltativo: il valore di mercato arriverà in una fase successiva.')+
 '<div class="library-toolbar"><select class="library-select" id="libraryWishSort" style="max-width:290px">'+
 '<option value="priority" '+(view.wishSort==='priority'?'selected':'')+'>Ordina per priorità</option>'+
 '<option value="title" '+(view.wishSort==='title'?'selected':'')+'>Titolo A–Z</option></select>'+
 '<button class="btn primary" data-library-action="new-wish">＋ Aggiungi desiderio</button></div>'+
 (list.length?'<div class="library-wish-grid">'+list.map(w=>
 '<article class="library-wish '+priorityClass(w)+'">'+chipPriority(priorityClass(w))+'<h3>'+esc(w.title)+'</h3><p>'+esc(w.edition||'Edizione da definire')+'</p>'+
 '<p>Prezzo desiderato: '+(w.targetPrice?'€ '+esc(w.targetPrice):'non indicato')+'</p>'+
 (w.notes?'<p>Note: '+esc(w.notes)+'</p>':'')+
 '<div class="library-actions-row"><button class="btn secondary" data-library-action="edit-wish" data-id="'+esc(w.id)+'">✎ Modifica</button>'+
 '<button class="btn" data-library-action="remove-wish" data-id="'+esc(w.id)+'">Rimuovi</button></div></article>').join('')+'</div>':
 '<div class="library-empty">La Wishlist demo è vuota. Puoi aggiungere una serie da acquistare.</div>')+
 note()+dialogHtml();
}
function statisticsPage(){
 const s=stats();
 const byPublisher={};
 data.series.forEach(x=>{const pub=x.publisher||'Non specificato';byPublisher[pub]=(byPublisher[pub]||0)+x.owned.length});
 const entries=Object.entries(byPublisher).sort((a,b)=>b[1]-a[1]);
 const max=Math.max(1,...entries.map(x=>x[1]));
 return heading('I NUMERI DELLA TUA PASSIONE','Statistiche','Andamento della collezione, completamento e distribuzione per editore. Tutti i numeri seguenti sono calcolati dalla demo, non dal tuo account.')+
 summaryCards()+
 '<div class="grid2"><section class="panel"><h2>Completamento collezione</h2><div class="library-stat" style="margin-bottom:13px"><span class="value">'+s.progress+'%</span><span class="detail">'+s.owned+' su '+s.total+' volumi</span>'+
 '<div class="progress-track"><div class="progress-fill" style="width:'+s.progress+'%"></div></div></div>'+
 '<p>Serie complete: <strong>'+s.completed+'</strong> su '+s.series+'</p>'+
 '<p>Volumi ancora da acquistare: <strong>'+s.missing+'</strong></p></section>'+
 '<section class="panel"><h2>Volumi posseduti per editore</h2>'+
 (entries.length?entries.map(x=>'<div class="library-chart-row"><div class="name">'+esc(x[0])+'</div>'+
 '<div class="track"><div class="fill" style="width:'+Math.round(100*x[1]/max)+'%"></div></div>'+
 '<div class="number">'+x[1]+'</div></div>').join(''):'<p>Nessun dato.</p>')+'</section></div>'+
 '<div class="section-head"><div><h2>Serie da completare</h2><p>Ordinate per percentuale di completamento</p></div></div>'+
 '<div class="library-grid">'+data.series.filter(x=>missing(x).length).sort((a,b)=>b.owned.length/b.total-a.owned.length/a.total).map(collectionCard).join('')+'</div>'+
 note();
}
function ordersPage(){
 const list=data.orders.filter(x=>view.ordersFilter==='all'||x.status===view.ordersFilter);
 return heading('I TUOI ORDINI','Gestione acquisti','Tieni separati gli ordini in corso da quelli completati. Qui tutte le informazioni sono esempi dimostrativi.')+
 '<div class="library-toolbar"><select id="libraryOrdersFilter" class="library-select" style="max-width:300px">'+
 [['in-progress','Ordini in corso'],['completed','Completati'],['all','Tutti gli ordini']].map(x=>'<option value="'+x[0]+'" '+(view.ordersFilter===x[0]?'selected':'')+'>'+x[1]+'</option>').join('')+'</select></div>'+
 '<div class="library-orders">'+(list.length?list.map(o=>
 '<article class="library-order"><div><strong>'+esc(o.label)+'</strong><div class="small">'+esc(o.vendor)+' · Volumi '+esc(o.volumes)+'</div></div>'+
 '<div>'+ (o.status==='completed'?'<span class="badge green">Completato</span>':'<span class="priority-chip medium">In corso</span>')+'</div>'+
 '<button class="btn" data-library-action="order-toggle" data-id="'+esc(o.id)+'">'+(o.status==='completed'?'Segna in corso':'Segna completato')+'</button></article>').join(''):
 '<div class="library-empty">Nessun ordine demo in questa categoria.</div>')+'</div>'+note();
}
function dialogHtml(){
 if(!view.dialog)return '';
 const editing=view.dialog.type==='editseries'||view.dialog.type==='editwish';
 const seriesForm=['newseries','editseries'].includes(view.dialog.type);
 const target=editing?(seriesForm?data.series:data.wishlist).find(x=>x.id===view.dialog.id):null;
 const existing=target||{};
 const dialogTitle=seriesForm?(editing?'Modifica serie':'Nuova serie'):(editing?'Modifica desiderio':'Aggiungi alla Wishlist');
 return '<dialog class="library-form-dialog" id="libraryDialog"><form id="libraryDialogForm" class="library-form">'+
 '<div class="wide"><h2>'+dialogTitle+'</h2><p>Questi campi modificano soltanto la demo parallela.</p></div>'+
 '<div class="wide"><label for="libraryTitle">Titolo</label><input class="library-field" name="title" id="libraryTitle" required maxlength="120" value="'+esc(existing.title||'')+'"></div>'+
 '<div><label for="libraryEdition">Edizione</label><input class="library-field" name="edition" id="libraryEdition" maxlength="100" value="'+esc(existing.edition||'')+'" placeholder="Es. New Edition"></div>'+
 (seriesForm?
 '<div><label for="libraryPublisher">Editore</label><input class="library-field" name="publisher" id="libraryPublisher" maxlength="100" value="'+esc(existing.publisher||'')+'" placeholder="Es. Star Comics"></div>'+
 '<div><label for="libraryTotal">Numero totale volumi</label><input class="library-field" name="total" type="number" min="1" max="2000" required id="libraryTotal" value="'+(existing.total||1)+'"></div>':
 '<div><label for="libraryPrice">Prezzo desiderato (€)</label><input class="library-field" name="targetPrice" type="number" step="0.01" min="0" max="100000" id="libraryPrice" value="'+esc(existing.targetPrice||'')+'" placeholder="Facoltativo"></div>')+
 '<div><label for="libraryPriority">Priorità</label><select class="library-field" id="libraryPriority" name="priority">'+
 Object.keys(priorityNames).map(p=>'<option value="'+p+'" '+((existing.priority||'medium')===p?'selected':'')+'>'+priorityNames[p]+'</option>').join('')+'</select></div>'+
 '<div class="wide"><label for="libraryNotes">Note</label><textarea class="library-field" style="min-height:84px" id="libraryNotes" name="notes" maxlength="500">'+esc(existing.notes||'')+'</textarea></div>'+
 '<div class="wide library-actions-row"><button type="button" class="btn" data-library-action="close-dialog">Annulla</button>'+
 '<button type="submit" class="btn primary">✓ Salva nella demo</button></div></form></dialog>'
}
function uniqueID(prefix){return prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function submitDialog(form){
 if(!view.dialog)return false;
 const title=String(form.elements.title.value||'').trim();
 const edition=String(form.elements.edition.value||'').trim();
 const priority=String(form.elements.priority.value||'medium');
 const notes=String(form.elements.notes.value||'').trim();
 if(!title||title.length>120||edition.length>100||notes.length>500||!priorityNames[priority]){alert('Completa correttamente i dati.');return false}
 const type=view.dialog.type;
 if(['newseries','editseries'].includes(type)){
  const publisher=String(form.elements.publisher.value||'').trim();
  const total=Number(form.elements.total.value);
  if(!Number.isInteger(total)||total<1||total>2000||publisher.length>100){alert('Controlla il totale dei volumi (1–2000) e l’editore.');return false}
  const old=type==='editseries'?data.series.find(s=>s.id===view.dialog.id):null;
  if(old&&old.owned.some(n=>n>total)){alert('Non puoi ridurre il totale sotto un numero di volume già posseduto.');return false}
  const duplicate=data.series.some(s=>s.id!==old?.id&&label(s.title)===label(title)&&label(s.edition)===label(edition));
  if(duplicate){alert('La stessa serie ed edizione sono già presenti nella demo.');return false}
  if(old){Object.assign(old,{title,edition,publisher,total,priority,notes})}
  else data.series.push({id:uniqueID('s'),title,edition,publisher,total,owned:[],priority,notes});
 }else{
  const priceValue=String(form.elements.targetPrice.value||'').trim();
  const price=priceValue===''?'':Number(priceValue);
  if(price!==''&&(!Number.isFinite(price)||price<0||price>100000)){alert('Prezzo non valido.');return false}
  const old=type==='editwish'?data.wishlist.find(w=>w.id===view.dialog.id):null;
  if(old)Object.assign(old,{title,edition,priority,notes,targetPrice:price});
  else data.wishlist.push({id:uniqueID('w'),title,edition,priority,notes,targetPrice:price});
 }
 save();view.dialog=null;return true;
}
function render(page){
 switch(page){
  case 'collection':return collection();
  case 'series-detail':return detail();
  case 'missing':return missingPage();
  case 'wishlist':return wishlistPage();
  case 'statistics':return statisticsPage();
  case 'purchases':return ordersPage();
  default:return '';
 }
}
function keepInput(input,callback){
 const type=input?.id;
 if(!input)return;
 input.addEventListener('input',e=>{
  const position=e.target.selectionStart;
  callback(e.target.value);
  if(view._draw){view._draw();const next=document.getElementById(type);if(next){next.focus();if(position!=null&&next.setSelectionRange)next.setSelectionRange(position,position)}}
 });
}
function afterRender(draw){
 view._draw=draw;
 keepInput(document.getElementById('librarySearch'),val=>view.query=val);
 const id=document.getElementById('libraryDialog');
 if(id){
  id.addEventListener('close',()=>{if(view.dialog){view.dialog=null;draw()}});
  id.querySelector('form')?.addEventListener('submit',e=>{e.preventDefault();if(submitDialog(e.currentTarget)){draw()}});
  try{id.showModal()}catch(err){id.setAttribute('open','')}
 }
}
function handleChange(el,draw){
 if(!el)return false;
 const id=el.id,value=el.value;
 if(id==='libraryFilter')view.filter=value;
 else if(id==='librarySort')view.sort=value;
 else if(id==='libraryMissingSeries'){view.selectedSeries=value;view.selected.clear()}
 else if(id==='librarySeriesPriority'||id==='libraryMissingPriority'){
  const s=data.series.find(x=>x.id===(id==='librarySeriesPriority'?view.detailId:view.selectedSeries));
  if(s&&priorityNames[value]){s.priority=value;save()}
 }
 else if(id==='libraryWishSort')view.wishSort=value;
 else if(id==='libraryOrdersFilter')view.ordersFilter=value;
 else return false;
 draw();return true;
}
function handleClick(btn,callbacks){
 if(!btn)return false;
 const action=btn.dataset.libraryAction;
 if(!action)return false;
 const id=btn.dataset.id,num=Number(btn.dataset.num),draw=callbacks.draw;
 const go=p=>callbacks.go(p);
 if(action==='layout')view.layout=btn.dataset.value==='list'?'list':'grid';
 else if(action==='detail'){view.detailId=id;go('series-detail');return true}
 else if(action==='back'){go('collection');return true}
 else if(action==='missing-series'){view.selectedSeries=id;view.selected.clear();go('missing');return true}
 else if(action==='new-series')view.dialog={type:'newseries'};
 else if(action==='edit-series')view.dialog={type:'editseries',id};
 else if(action==='new-wish')view.dialog={type:'newwish'};
 else if(action==='edit-wish')view.dialog={type:'editwish',id};
 else if(action==='close-dialog'){view.dialog=null}
 else if(action==='reset'){
  if(!confirm('Vuoi ripristinare tutti i dati dimostrativi di MangaLog Next? La tua collezione reale non verrà modificata.'))return true;
  data=seed();save();view.selected.clear();view.selectedSeries='';view.detailId=null;view.dialog=null;go('collection');return true;
 }
 else if(action==='toggle-owned'){
  const s=data.series.find(x=>x.id===id);
  if(!s||!Number.isInteger(num)||num<1||num>s.total)return true;
  const wasOwned=s.owned.includes(num);
  const message=wasOwned?'Vuoi segnare il volume '+num+' di '+s.title+' come mancante nella demo?':
   'Vuoi aggiungere il volume '+num+' di '+s.title+' alla collezione demo?';
  if(!confirm(message))return true;
  if(wasOwned)s.owned=s.owned.filter(n=>n!==num);
  else s.owned=[...s.owned,num].sort((a,b)=>a-b);
  data.activity.unshift({date:Date.now(),seriesId:s.id,number:num,type:wasOwned?'remove':'add'});
  data.activity=data.activity.slice(0,100);save();
 }
 else if(action==='select-missing'){
  const s=data.series.find(x=>x.id===view.selectedSeries);
  if(!s||!missing(s).includes(num))return true;
  if(view.selected.has(num))view.selected.delete(num);else view.selected.add(num);
 }
 else if(action==='clear-selected')view.selected.clear();
 else if(action==='add-selected'){
  const s=data.series.find(x=>x.id===view.selectedSeries);
  if(!s||!view.selected.size)return true;
  const possible=missing(s),numbers=[...view.selected].filter(n=>possible.includes(n)).sort((a,b)=>a-b);
  if(!numbers.length)return true;
  if(!confirm('Aggiungere '+numbers.length+' volumi di '+s.title+' alla collezione DEMO? Numeri: '+numbers.join(', ')+'.'))return true;
  s.owned=[...new Set([...s.owned,...numbers])].sort((a,b)=>a-b);
  numbers.forEach(number=>data.activity.unshift({date:Date.now(),seriesId:s.id,number,type:'add'}));
  data.activity=data.activity.slice(0,100);view.selected.clear();save();
 }
 else if(action==='remove-wish'){
  const w=data.wishlist.find(w=>w.id===id);
  if(!w||!confirm('Rimuovere '+w.title+' dalla Wishlist demo?'))return true;
  data.wishlist=data.wishlist.filter(x=>x.id!==id);save();
 }
 else if(action==='order-toggle'){
  const o=data.orders.find(x=>x.id===id);
  if(o){o.status=o.status==='completed'?'in-progress':'completed';save()}
 }
 else return false;
 draw();return true;
}
function morePage(){
 return heading('TUTTE LE SEZIONI','Altro','Raggiungi Mancolista, Wishlist, Statistiche, Gestione acquisti e le altre aree di MangaLog.')+
 '<div class="grid2">'+[
  ['missing','☷','Mancolista','Seleziona i volumi mancanti'],
  ['wishlist','♡','Wishlist','Dai una priorità ai desideri'],
  ['statistics','▥','Statistiche','Analizza i progressi'],
  ['purchases','▣','Gestione acquisti','Ordini in corso e completati'],
  ['market','▧','Market','Vetrina futura delle fumetterie'],
  ['social','♧','Social','Amici e collezioni']
 ].map(a=>'<button class="panel" style="text-align:left;cursor:pointer;color:#fff" data-go="'+a[0]+'"><div class="card-icon">'+a[1]+'</div><h2>'+a[2]+'</h2><p>'+a[3]+'</p></button>').join('')+'</div>'+note()
}
window.MangaLogNextCollection={pages,render,afterRender,handleChange,handleClick,summary:stats,getOverviewSeries,morePage,
  previewState:()=>JSON.parse(JSON.stringify(data)),version:'collection-1.0-demo'};
})();
