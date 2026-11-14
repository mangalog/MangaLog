/* MangaLog private covers experiment: local-only, no cloud writes. */
(()=>{'use strict';
const DB='mangalog-private-covers-v1',STORE='covers',PREFIX='naruto-serie-rossa:';
let db=null,active=false,urls=[];
const css=document.createElement('style');css.textContent=`
.ml-cover-tools{margin:12px 0;padding:13px;border:1px solid #59505c;border-radius:12px;background:#191a22}
.ml-cover-tools p{font-size:12px;color:#bfc0c9;margin:5px 0 12px}
.ml-cover-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:10px}
.ml-cover-item{border:1px solid #42434d;border-radius:9px;padding:7px;text-align:center;background:#23252e}
.ml-cover-item img{width:100%;aspect-ratio:2/3;object-fit:contain}
.ml-cover-item label{display:block;font-size:11px;margin-top:7px;cursor:pointer;color:#ff8b9a}
.ml-cover-item input{width:100%;font-size:10px;margin-top:4px}
.ml-cover-item button{font-size:10px;padding:5px;margin-top:5px}
`;document.head.append(css);
const req=indexedDB.open(DB,1);
req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE)};
req.onsuccess=()=>{db=req.result;refresh()};
function isNaruto(){const h=document.querySelector('#content .detail-hero h1');if(!h||h.textContent.trim().toLowerCase()!=='naruto')return false;const d=document.querySelector('#content .detail-head .muted');return !!d&&/serie rossa/i.test(d.textContent)}
function refresh(){
 if(!db||!isNaruto()){document.querySelector('.ml-cover-tools')?.remove();urls.forEach(u=>URL.revokeObjectURL(u));urls=[];active=false;return}
 if(document.querySelector('.ml-cover-tools'))return;
 active=true;const grid=document.querySelector('#content .volume-grid');if(!grid)return;
 const panel=document.createElement('section');panel.className='ml-cover-tools';
 const h=document.createElement('strong');h.textContent='Copertine personali · Naruto Serie Rossa';
 const p=document.createElement('p');p.textContent='Foto salvate soltanto in questo browser. Non vengono inviate al cloud; non si sincronizzano tra dispositivi. Per ogni volume scegli una tua immagine.';
 const strip=document.createElement('div');strip.className='ml-cover-strip';
 panel.append(h,p,strip);grid.before(panel);
 for(let n=1;n<=72;n++){
 const item=document.createElement('div');item.className='ml-cover-item';const title=document.createElement('strong');title.textContent=String(n);
 const preview=document.createElement('div');preview.textContent='—';
 const input=document.createElement('input');input.type='file';input.accept='image/*';input.setAttribute('aria-label','Copertina volume '+n);
 const remove=document.createElement('button');remove.type='button';remove.textContent='Rimuovi';remove.hidden=true;
 let current=null;const key=PREFIX+n;
 function show(blob){if(current){URL.revokeObjectURL(current);urls=urls.filter(u=>u!==current)}preview.replaceChildren();current=URL.createObjectURL(blob);urls.push(current);const img=document.createElement('img');img.src=current;img.alt='Naruto Serie Rossa volume '+n;preview.append(img);remove.hidden=false}
 const get=db.transaction(STORE,'readonly').objectStore(STORE).get(key);get.onsuccess=()=>{if(get.result&&item.isConnected)show(get.result)};
 input.onchange=()=>{const file=input.files?.[0];if(!file||!file.type.startsWith('image/')||file.size>8e6)return alert('Seleziona un’immagine inferiore a 8 MB');const put=db.transaction(STORE,'readwrite').objectStore(STORE).put(file,key);put.onsuccess=()=>show(file);put.onerror=()=>alert('Impossibile salvare la foto sul dispositivo')};
 remove.onclick=()=>{const del=db.transaction(STORE,'readwrite').objectStore(STORE).delete(key);del.onsuccess=()=>{if(current){URL.revokeObjectURL(current);urls=urls.filter(u=>u!==current);current=null}preview.textContent='—';remove.hidden=true;input.value=''}};
 item.append(title,preview,input,remove);strip.append(item)
 }
}
const observer=new MutationObserver(()=>{if(!db)return;if(isNaruto()&&!document.querySelector('.ml-cover-tools'))queueMicrotask(refresh);else if(!isNaruto()&&active)queueMicrotask(refresh)});
observer.observe(document.body,{subtree:true,childList:true});
})();