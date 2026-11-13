/* MangaLog ISBN Beta 7 — Public bibliographic sources only.
   The returned data is a suggestion, not proof of the Italian edition.
   No collection, authentication or storage access. */
(function(){
'use strict';
function sameISBN(list,code){return Array.isArray(list)&&list.some(x=>String(x||'').replace(/[^0-9]/g,'')===code)}
function titleParts(raw){
 const title=String(raw||'').trim().slice(0,140);
 if(title.length<2)return null;
 const suffix=/(?:[\s,.:\-])(?:vol(?:ume)?\.?|n(?:umero)?\.?|tomo)\s*(\d{1,4})\s*$/i;
 const m=title.match(suffix);
 return {series:(m?title.slice(0,m.index):title).replace(/[.:\-,\s]+$/,'').slice(0,120).trim(),
  volume:m?Number(m[1]):null};
}
async function getJSON(url,wait){
 const controller=new AbortController();
 const t=setTimeout(()=>controller.abort(),wait||8000);
 try{
  const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(response.status===404)return null;
  if(!response.ok)throw new Error('HTTP '+response.status);
  return await response.json()
 }finally{clearTimeout(t)}
}
async function openLibraryISBN(code){
 const data=await getJSON('https://openlibrary.org/isbn/'+code+'.json',7500);
 if(!data||typeof data.title!=='string')return null;
 const identifiers=[].concat(data.isbn_13||[],data.isbn_10||[]);
 if(identifiers.length&&!sameISBN(identifiers,code))return null;
 const parsed=titleParts(data.title);
 if(!parsed||!parsed.series)return null;
 const publishers=Array.isArray(data.publishers)?data.publishers:[];
 const pub=publishers.map(x=>typeof x==='string'?x:(x&&x.name)||'').find(Boolean)||'';
 return {series:parsed.series,volume:parsed.volume,edition:'',publisher:String(pub).slice(0,100),
  source:'https://openlibrary.org/isbn/'+code,provider:'Open Library · ISBN',
  confidence:'scheda dell’edizione',details:'Codice corrispondente a una scheda bibliografica.'}
}
async function googleBooksISBN(code){
 const url='https://www.googleapis.com/books/v1/volumes?q='+encodeURIComponent('isbn:'+code)+'&maxResults=10&printType=books';
 const data=await getJSON(url,8500),items=Array.isArray(data&&data.items)?data.items:[];
 for(const entry of items){
  const info=entry&&entry.volumeInfo;
  if(!info||typeof info.title!=='string')continue;
  const identifiers=Array.isArray(info.industryIdentifiers)?info.industryIdentifiers:[];
  if(!identifiers.some(x=>x&&x.type==='ISBN_13'&&sameISBN([x.identifier],code)))continue;
  const parsed=titleParts(info.title);
  if(!parsed||!parsed.series)continue;
  return {series:parsed.series,volume:parsed.volume,edition:'',publisher:String(info.publisher||'').slice(0,100),
   source:typeof info.infoLink==='string'&&info.infoLink.startsWith('https://')?info.infoLink:
    'https://books.google.com/books?vid=ISBN'+code,
   provider:'Google Books',confidence:'ISBN-13 corrispondente',
   details:'La scheda include il medesimo ISBN-13.'}
 }
 return null
}
async function inventaireISBN(code){
 const url='https://inventaire.io/api/entities?action=by-uris&uris='+encodeURIComponent('isbn:'+code);
 const data=await getJSON(url,8500),entities=data&&data.entities;
 if(!entities||typeof entities!=='object')return null;
 const entity=entities['isbn:'+code];
 if(!entity||(entity.uri&&entity.uri!=='isbn:'+code))return null;
 const claims=entity.claims||{},isbnClaims=claims['wdt:P212']||claims.P212;
 if(Array.isArray(isbnClaims)&&isbnClaims.length&&!sameISBN(isbnClaims,code))return null;
 const labels=entity.labels||{};
 let label=labels.it||labels.en||labels.fr||Object.values(labels).find(x=>typeof x==='string');
 if(label&&typeof label==='object')label=label.value||label.label||'';
 const parsed=titleParts(label);if(!parsed||!parsed.series)return null;
 // Do not resolve Wikidata publisher IDs as if they were publisher names.
 return {series:parsed.series,volume:parsed.volume,edition:'',publisher:'',
  source:'https://inventaire.io/entity/isbn:'+code,
  provider:'Inventaire · dati aperti',confidence:'scheda ISBN',
  details:'Dati aperti; editore e nome commerciale dell’edizione da verificare.'}
}
async function openLibraryWork(code){
 // This endpoint returns works, NOT a reliable identification of an edition.
 const url='https://openlibrary.org/search.json?isbn='+encodeURIComponent(code)+
  '&fields=key,title,isbn&limit=4';
 const data=await getJSON(url,7500),docs=Array.isArray(data&&data.docs)?data.docs:[];
 for(const doc of docs){
  if(!doc||!sameISBN(doc.isbn,code))continue;
  const parsed=titleParts(doc.title);
  if(!parsed||!parsed.series)continue;
  return {series:parsed.series,volume:null,edition:'',publisher:'',
   source:'https://openlibrary.org/search?q='+encodeURIComponent(code),
   provider:'Open Library · opera',confidence:'solo titolo suggerito',
   details:'Il libro è associato a un’opera con molte edizioni: numero, editore ed edizione non verificati.'}
 }
 return null
}
async function lookup(code,onProgress){
 if(!/^97[89]\d{10}$/.test(String(code)))throw new Error('ISBN-13 invalido');
 const names=['Open Library ISBN','Google Books','Inventaire','Open Library ricerca opera'];
 const states=['in corso…','in corso…','in corso…','eventuale'];
 const report=()=>{if(typeof onProgress==='function')onProgress(names.map((n,i)=>n+': '+states[i]).join('\n'))};
 report();
 const funcs=[openLibraryISBN,googleBooksISBN,inventaireISBN];
 const results=await Promise.all(funcs.map((fn,i)=>Promise.resolve().then(()=>fn(code)).then(item=>{
  states[i]=item?'scheda trovata':'ISBN non presente';report();return {item,ok:true};
 }).catch(err=>{
  const msg=String(err&&err.message||err);
  states[i]=/AbortError|abort/i.test(msg)?'tempo scaduto':'errore di servizio / rete';report();return {item:null,ok:false};
 })));
 let found=results.map(r=>r.item).find(Boolean)||null;
 let success=results.some(r=>r.ok);
 if(!found){
  states[3]='in corso…';report();
  // Avoid consecutive requests to Open Library within its public rate limit.
  await new Promise(resolve=>setTimeout(resolve,1100));
  try{
   found=await openLibraryWork(code);
   states[3]=found?'titolo suggerito, edizione non nota':'ISBN non presente';
   success=true;
  }catch(err){
   states[3]=/AbortError|abort/i.test(String(err&&err.message||err))?'tempo scaduto':'errore di servizio / rete';
  }
 }else states[3]='non necessaria';
 report();
 return {item:found,success,statuses:states}
}
window.MangaLogISBNProviders={lookup,openLibraryISBN,googleBooksISBN,inventaireISBN,openLibraryWork,titleParts,sameISBN,version:'Beta 7'};
})();