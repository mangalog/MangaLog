/* MangaLog Naruto cover trial: local-only, never changes collection or cloud data. */
(()=>{'use strict';
const DB='mangalog-private-covers-v1',STORE='covers',PREFIX='naruto-serie-rossa:';
let db, busy=false, urls=new Map(), painted=new WeakSet();
const style=document.createElement('style');style.textContent=`
.ml-cover-tools{margin:12px 0;padding:14px;border:1px solid #6a505b;border-radius:12px;background:#1b1c25}
.ml-cover-tools p{font-size:13px;color:#c7c7cf;margin:7px 0}
.ml-cover-tools input{max-width:100%;font-size:13px;margin:8px 0}
.ml-cover-status{color:#ff9baa;font-weight:700}
.volume.ml-with-cover{padding:4px 3px 9px;overflow:hidden}
.volume.ml-with-cover .ml-cover-photo{display:block;width:100%;aspect-ratio:2/3;object-fit:contain;border-radius:5px;margin-bottom:6px;background:#111}
.volume.ml-with-cover .volume-number{display:block}
`;document.head.append(style);
const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};req.onsuccess=()=>{db=req.result;refresh()};
function isNaruto(){const h=document.querySelector('#content .detail-hero h1');if(h?.textContent.trim().toLowerCase()!=='naruto')return false;return /serie rossa/i.test(document.querySelector('#content .detail-head .muted')?.textContent||'')}
function get(n){return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readonly').objectStore(STORE).get(PREFIX+n);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function put(n,blob){return new Promise((resolve,reject)=>{const r=db.transaction(STORE,'readwrite').objectStore(STORE).put(blob,PREFIX+n);r.onsuccess=resolve;r.onerror=()=>reject(r.error)})}
function toBlob(src){const match=/^data:image\/(jpeg|jpg|png|webp);base64,([\s\S]+)$/i.exec(src||'');if(!match)throw Error('Formato immagine non valido');const raw=atob(match[2].replace(/\s/g,'')),a=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)a[i]=raw.charCodeAt(i);return new Blob([a],{type:'image/'+(match[1]==='jpg'?'jpeg':match[1])})}
async function importJSON(file,status){
 if(busy||!file)return;busy=true;status.textContent='Controllo del backup in corso…';
 try{
 const parsed=JSON.parse(await file.text());
 const s=parsed.series?.find(x=>String(x.title).trim().toLowerCase()==='naruto'&&/serie rossa/i.test(x.edition||''));
 if(!s||!s.volumeCovers)throw Error('Backup Naruto Serie Rossa con volumeCovers non trovato');
 const images=[];for(let n=1;n<=72;n++){const src=s.volumeCovers[n]||s.volumeCovers[String(n)];if(!src)throw Error('Manca la copertina '+n);images.push(toBlob(src))}
 status.textContent='Salvataggio delle 72 copertine sul dispositivo…';
 for(let n=1;n<=72;n++)await put(n,images[n-1]);
 status.textContent='72 copertine salvate! Ora compaiono sui volumi.';await paint();
 }catch(e){status.textContent='Importazione non riuscita: '+e.message}finally{busy=false}
}
async function paint(){
 if(!db||!isNaruto())return;
 const grid=document.querySelector('#content .volume-grid');if(!grid)return;
 for(let n=1;n<=72;n++){
 const btn=grid.querySelector('[data-volume="'+n+'"]');if(!btn||painted.has(btn))continue;
 const blob=await get(n);if(!blob||!btn.isConnected)continue;
 const img=document.createElement('img');img.className='ml-cover-photo';img.alt='Copertina Naruto Serie Rossa '+n;img.loading='lazy';
 const url=URL.createObjectURL(blob);img.src=url;urls.set(btn,url);
 btn.insertBefore(img,btn.firstChild);btn.classList.add('ml-with-cover');painted.add(btn)
 }
}
function refresh(){
 if(!db||!isNaruto())return;
 const grid=document.querySelector('#content .volume-grid');if(!grid)return;
 if(!document.querySelector('.ml-cover-tools')){
 const panel=document.createElement('section');panel.className='ml-cover-tools';
 const h=document.createElement('strong');h.textContent='Copertine Naruto · prova privata';
 const p=document.createElement('p');p.textContent='Carica una sola volta il JSON contenuto nello ZIP Naruto. Importa soltanto le immagini: non sostituisce la collezione, non modifica i volumi posseduti e non invia fotografie a Supabase.';
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','Seleziona backup Naruto con 72 copertine');
 const status=document.createElement('p');status.className='ml-cover-status';status.setAttribute('role','status');
 input.addEventListener('change',()=>importJSON(input.files?.[0],status));
 panel.append(h,p,input,status);grid.before(panel)
 }
 paint().catch(console.error)
}
let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;for(const [node,url] of urls){if(!node.isConnected){URL.revokeObjectURL(url);urls.delete(node)}}refresh()})}).observe(document.body,{childList:true,subtree:true});
})();