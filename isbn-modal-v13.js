/* MangaLog v13 — integrated ISBN modal. Italian editions, no external book API.
   Renderer is isolated; mutations are delegated to MangaLog's guarded writer. */
(function(){
'use strict';
const catalog={
'9788822636799':{title:'Look Back',volume:1,edition:'Deluxe Edition',publisher:'Star Comics'},
'9788864201870':{title:'One Piece',volume:1,edition:'New Edition',publisher:'Star Comics'},
'9788834911259':{title:'DanDaDan',volume:1,edition:'Regular',publisher:'J-POP Manga'},
'9788822636782':{title:'The God of High School',volume:1,edition:'Edizione italiana Star Comics',publisher:'Star Comics'},
'9788822636829':{title:'The God of High School',volume:2,edition:'Edizione italiana Star Comics',publisher:'Star Comics'},
'9788822640819':{title:'The God of High School',volume:3,edition:'Edizione italiana Star Comics',publisher:'Star Comics'},
'9788822641663':{title:'The God of High School',volume:4,edition:'Edizione italiana Star Comics',publisher:'Star Comics'},
'9788822643032':{title:'The God of High School',volume:5,edition:'Edizione italiana Star Comics',publisher:'Star Comics'},
'9788822650467':{title:'The God of High School',volume:6,edition:'Edizione italiana Star Comics',publisher:'Star Comics'},
'9788822654182':{title:'The God of High School',volume:7,edition:'Edizione italiana Star Comics',publisher:'Star Comics'},
'9788822630896':{title:'Sweet Home',volume:1,edition:'Edizione italiana Star Comics · Manhwa',publisher:'Star Comics'}
};
const style=document.createElement('style');
style.textContent=[
'.modal.isbn-flow-modal{width:min(600px,100%);padding:0;max-height:92vh;overflow:auto;border:1px solid #65525a}',
'#mlISBN{color:#f6f4f5;line-height:1.5}',
'#mlISBN .isbn-top{padding:22px 24px 18px;border-bottom:1px solid #36343d;background:linear-gradient(115deg,#2c1822,#181b22 80%)}',
'#mlISBN .isbn-kicker{font-size:10px;letter-spacing:2px;font-weight:900;color:#ffa0aa;text-transform:uppercase}',
'#mlISBN .isbn-top h2{font-size:25px;margin:6px 0 4px;line-height:1.15}',
'#mlISBN .isbn-desc{font-size:13px;color:#bbb9c6;margin:5px 0 0}',
'#mlISBN .isbn-content{padding:20px 24px 24px}',
'#mlISBN .isbn-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}',
'#mlISBN .isbn-tab{border:1px solid #56505d;border-radius:11px;background:#23232d;color:#eee;padding:13px 7px;font-weight:800;font-size:13px}',
'#mlISBN .isbn-tab[aria-selected=true]{border-color:#ff6177;background:#3d202d;color:#fff;box-shadow:inset 0 -2px #ee4d63}',
'#mlISBN .isbn-label{display:block;font-size:12px;color:#ded9e0;font-weight:800;margin:13px 0 6px}',
'#mlISBN .isbn-input{display:block;width:100%;min-width:0;min-height:43px;padding:11px 12px;background:#11151d;border:1px solid #5c5464;border-radius:9px;color:#fff;font-size:15px}',
'#mlISBN .isbn-input:focus{outline:2px solid #ff8091;outline-offset:1px}',
'#mlISBN .isbn-inline{display:flex;align-items:stretch;gap:9px}',
'#mlISBN .isbn-inline .isbn-input{flex:1}',
'#mlISBN .isbn-inline .btn{flex:0 0 auto}',
'#mlISBN .isbn-muted{color:#bbb9c6;font-size:12px;line-height:1.45}',
'#mlISBN .isbn-note{margin:14px 0 0;padding:12px 13px;border:1px solid #444753;border-radius:11px;background:#20232c;font-size:13px;line-height:1.5;white-space:pre-line}',
'#mlISBN .isbn-note.ok{background:#17352e;border-color:#488b73;color:#d0ffea}',
'#mlISBN .isbn-note.err{background:#3e2029;border-color:#b85c71;color:#ffdce3}',
'#mlISBN .isbn-line{border:0;border-top:1px solid #393943;margin:20px 0}',
'#mlISBN .isbn-h3{font-size:15px;margin:0 0 6px}',
'#mlISBN .isbn-fields{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}',
'#mlISBN .isbn-fields .wide{grid-column:1/-1}',
'#mlISBN .isbn-result{margin:0 0 12px;padding:10px 12px;border-left:3px solid #ff6177;background:#29232d;border-radius:0 9px 9px 0;font-size:13px}',
'#mlISBN .isbn-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:19px}',
'#mlISBN .isbn-actions .btn.primary{flex:2 1 185px}',
'#mlISBN .isbn-actions .btn:not(.primary){flex:1 1 125px}',
'#mlISBN .isbn-review{border:1px solid #504957;border-radius:12px;background:#22232b;padding:16px;white-space:pre-line;font-size:14px;line-height:1.75}',
'#mlISBN .isbn-camera-frame{position:relative;background:#06080e;border:1px solid #5c5364;border-radius:12px;overflow:hidden;margin:10px 0}',
'#mlISBN .isbn-camera-frame video{display:block;width:100%;height:240px;object-fit:cover;background:#0b0c11}',
'#mlISBN .isbn-camera-line{position:absolute;left:15%;right:15%;top:50%;height:2px;background:#ff5471;box-shadow:0 0 12px #ff5471;pointer-events:none}',
'#mlISBN .isbn-success{padding:20px 12px;text-align:center}',
'#mlISBN .isbn-success-icon{font-size:44px;color:#7bdfaa}',
'#mlISBN [hidden]{display:none!important}',
'@media(max-width:540px){.modal.isbn-flow-modal{max-height:94dvh}#mlISBN .isbn-top{padding:18px 16px 15px}#mlISBN .isbn-content{padding:17px 16px 23px}#mlISBN .isbn-inline{flex-direction:column}#mlISBN .isbn-fields{grid-template-columns:1fr}#mlISBN .isbn-fields .wide{grid-column:auto}#mlISBN .isbn-camera-frame video{height:210px}}'
].join('\n');
document.head.appendChild(style);
const clean=raw=>String(raw||'').replace(/[\s-]/g,'').trim();
function validISBN(raw){
 const code=clean(raw);if(!/^97[89]\d{10}$/.test(code))return false;
 let sum=0;for(let i=0;i<12;i++)sum+=(code.charCodeAt(i)-48)*(i%2?3:1);
 return (10-sum%10)%10===code.charCodeAt(12)-48;
}
function fromBarcode(raw){
 const c=clean(raw);if(validISBN(c))return c;
 const digits=String(raw||'').replace(/\D/g,'');let matches=[];
 for(let i=0;i<=digits.length-13;i++){
  const sub=digits.slice(i,i+13);
  if(validISBN(sub)&&!matches.includes(sub))matches.push(sub)
 }
 return matches.length===1?matches[0]:c;
}
function norm(str){return String(str||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').replace(/[^a-z0-9]+/g,' ').trim()}
let active=null,loader=null;
const get=id=>document.getElementById(id);
function note(text,type){
 const target=get('mlISBNNotice');if(!target)return;
 target.textContent=text||'';target.className='isbn-note'+(type?' '+type:'');target.hidden=!text;
}
function option(select,value,label){
 const o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o);
}
function getSeries(){
 return (active&&active.api.getSeries?active.api.getSeries():[]).filter(x=>x&&x.id&&x.title);
}
function fields(){
 const meta=active&&active.info;
 return {code:active&&active.code,meta,
  target:get('mlISBNTarget').value,volume:Number(get('mlISBNNumber').value),
  title:get('mlISBNTitle').value.trim(),edition:get('mlISBNEdition').value.trim(),
  publisher:get('mlISBNPublisher').value.trim(),total:Number(get('mlISBNTotal').value)};
}
function plan(){
 if(!active||!active.code)return {ok:false,message:'Prima verifica un ISBN valido.'};
 const f=fields();
 if(!Number.isInteger(f.volume)||f.volume<1||f.volume>2000)
  return {ok:false,message:'Inserisci il numero di volume corretto (1–2000).'};
 if(!f.target)return {ok:false,message:'Scegli una serie esistente oppure crea una nuova edizione.'};
 const series=getSeries();
 if(f.target==='__new__'){
  if(!f.title||f.title.length>120||!f.edition||f.edition.length>100||f.publisher.length>100)
   return {ok:false,message:'Per creare una nuova serie completa titolo ed edizione (l’editore è facoltativo).'};
  if(!Number.isInteger(f.total)||f.total<f.volume||f.total>2000)
   return {ok:false,message:'Indica un totale valido, almeno pari al volume che stai inserendo.'};
  const existed=series.find(s=>norm(s.title)===norm(f.title)&&norm(s.edition)===norm(f.edition));
  if(existed)return {ok:false,message:'Questa serie ed edizione esistono già in collezione. Seleziona la scheda esistente, così evitiamo duplicati.'};
  if(f.meta&&(norm(f.meta.title)!==norm(f.title)||norm(f.meta.edition)!==norm(f.edition)||norm(f.meta.publisher)!==norm(f.publisher)))
   return {ok:false,message:'I dati della nuova serie sono diversi dall’ISBN riconosciuto. Se hai una variante diversa, inserisci il codice specifico dell’edizione corretta.'};
  return {ok:true,code:f.code,kind:'new',title:f.title,edition:f.edition,publisher:f.publisher||'Non specificato',
   volume:f.volume,total:f.total,description:'Nuova serie: '+f.title+'\nEdizione: '+f.edition+'\nEditore: '+(f.publisher||'Non specificato')+'\nVolume: '+f.volume+' / '+f.total};
 }
 const target=series.find(s=>String(s.id)===f.target);
 if(!target)return {ok:false,message:'La serie selezionata non è più disponibile. Riapri lo scanner.'};
 if((target.owned||[]).some(n=>Number(n)===f.volume))
  return {ok:false,message:'⛔ GIÀ POSSEDUTO — '+target.title+' · '+target.edition+' n. '+f.volume+'. Nessun doppione verrà aggiunto.'};
 if(f.meta&&(norm(target.title)!==norm(f.meta.title)||norm(target.edition)!==norm(f.meta.edition)||
  norm(target.publisher)!==norm(f.meta.publisher)))
  return {ok:false,message:'⚠ EDIZIONE DIVERSA — Il codice indica '+f.meta.title+' · '+f.meta.edition+' ('+f.meta.publisher+').\nLa serie scelta è '+target.title+' · '+target.edition+' ('+target.publisher+').\nSeleziona l’edizione corretta o creane una separata.'};
 return {ok:true,code:f.code,kind:'existing',targetId:String(target.id),volume:f.volume,
  title:target.title,edition:target.edition,publisher:target.publisher,
  description:'Serie: '+target.title+'\nEdizione: '+target.edition+'\nVolume: '+f.volume+
   '\nPosseduti: '+target.owned.length+' → '+(target.owned.length+1)+
   (f.volume>target.total?'\nTotale: '+target.total+' → '+f.volume:'')+
   (target.purchasePlans&&target.purchasePlans[String(f.volume)]?'\nRimuoveremo il volume dalla Mancolista acquisti.':'')};
}
function renderPlan(){
 if(!active||!active.code)return;
 const f=fields(),series=getSeries();
 const target=series.find(s=>String(s.id)===f.target);
 get('mlISBNNewFields').hidden=f.target!=='__new__';
 get('mlISBNExisting').hidden=!target;
 if(target)get('mlISBNExisting').textContent='Nella tua collezione: '+target.title+' · '+target.edition+
  ' · '+target.publisher+' · '+target.owned.length+'/'+target.total+' posseduti.';
 const p=plan();note(p.ok?'Controlla il riepilogo prima di aggiungere il volume.':p.message,p.ok?'ok':'err');
 get('mlISBNNext').disabled=!p.ok;
}
function renderTarget(){
 if(!active||!active.code)return;
 const sel=get('mlISBNTarget'),before=sel.value,items=getSeries().slice().sort((a,b)=>a.title.localeCompare(b.title,'it'));
 sel.innerHTML='';option(sel,'','Seleziona una serie…');
 items.forEach(s=>option(sel,String(s.id),s.title+' — '+s.edition));
 option(sel,'__new__','＋ Crea nuova serie / edizione');
 const meta=active.info;
 const exact=meta?items.filter(s=>norm(s.title)===norm(meta.title)&&norm(s.edition)===norm(meta.edition)&&norm(s.publisher)===norm(meta.publisher)):[];
 const selected=items.some(s=>String(s.id)===before)?before:(exact.length===1?String(exact[0].id):meta?'__new__':'');
 sel.value=selected;
 renderPlan();
}
function verified(raw){
 if(!active)return;
 const code=fromBarcode(raw);
 if(!validISBN(code)){
  active.code=null;active.info=null;active.reviewSignature=null;
  get('mlISBNDetails').hidden=true;get('mlISBNReview').hidden=true;
  get('mlISBNResult').hidden=true;
  note('Questo non è un ISBN-13 valido. Controlla le 13 cifre che iniziano con 978 o 979.','err');
  return
 }
 cameraStop();
 const m=catalog[code]||null;
 active.code=code;active.info=m;active.reviewSignature=null;
 get('mlISBNCode').value=code;get('mlISBNNumber').value=m?String(m.volume):'';
 get('mlISBNTitle').value=m?m.title:'';
 get('mlISBNEdition').value=m?m.edition:'';
 get('mlISBNPublisher').value=m?m.publisher:'';
 get('mlISBNTotal').value=m?String(m.volume):'1';
 get('mlISBNDetails').hidden=false;
 get('mlISBNReview').hidden=true;get('mlISBNSuccess').hidden=true;
 get('mlISBNEntry').hidden=false;
 get('mlISBNResult').textContent=m?
  '✓ Scheda trovata nell’archivio verificato: '+m.title+' · n. '+m.volume+' · '+m.edition:
  'ISBN valido, ma non ancora riconosciuto dal catalogo. Puoi indicare manualmente serie, edizione e numero.';
 get('mlISBNResult').hidden=false;
 get('mlISBNTarget').value='';
 renderTarget();
 get('mlISBNDetails').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function preview(){
 const p=plan();if(!p.ok){renderPlan();return}
 active.reviewSignature=JSON.stringify(p);
 get('mlISBNReviewText').textContent=p.description+'\n\nISBN: '+p.code;
 get('mlISBNEntry').hidden=true;
 get('mlISBNDetails').hidden=true;
 get('mlISBNReview').hidden=false;
 note('',null);
}
async function finish(){
 if(!active||active.submitting)return;
 const p=plan();
 if(!p.ok||JSON.stringify(p)!==active.reviewSignature){
  get('mlISBNReview').hidden=true;get('mlISBNEntry').hidden=false;get('mlISBNDetails').hidden=false;
  renderPlan();return
 }
 const btn=get('mlISBNFinal');active.submitting=true;btn.disabled=true;btn.textContent='Salvataggio…';
 try{
  const result=await active.api.commit(p);
  if(!active)return;
  get('mlISBNReview').hidden=true;
  get('mlISBNSuccess').hidden=false;
  get('mlISBNSuccessText').textContent=p.title+' · Volume '+p.volume+' aggiunto.'+
   (result&&result.synced?'\n✓ Sincronizzato con MangaLog Cloud.':'\n✓ Salvato su questo dispositivo.');
  active.savedId=result&&result.id||p.targetId;
 }catch(e){
  if(active)note('Non è stato salvato: '+String(e&&e.message||e).slice(0,220),'err');
 }finally{
  if(active){active.submitting=false;btn.disabled=false;btn.textContent='✓ Aggiungi alla collezione'}
 }
}
function cameraStop(){
 if(!active)return;
 active.cameraToken++;if(active.timer){clearTimeout(active.timer);active.timer=null}
 if(active.control){try{active.control.stop()}catch(_){ }active.control=null}
 if(active.stream){for(const track of active.stream.getTracks())track.stop();active.stream=null}
 const v=get('mlISBNVideo');if(v){try{v.pause();v.srcObject=null}catch(_){}}
 const btn=get('mlISBNStart');if(btn)btn.disabled=false;
}
async function zxingLoad(){
 if(window.ZXingBrowser)return;
 if(loader)return loader;
 loader=new Promise((resolve,reject)=>{
  const urls=['https://cdn.jsdelivr.net/npm/@zxing/browser@0.2.1/umd/zxing-browser.min.js','https://unpkg.com/@zxing/browser@0.2.1/umd/zxing-browser.min.js'];
  const next=i=>{
   if(i>=urls.length){reject(Error('Lettore fotocamera non disponibile. Puoi inserire l’ISBN manualmente.'));return}
   const script=document.createElement('script');script.src=urls[i];
   script.onload=()=>window.ZXingBrowser?resolve():next(i+1);
   script.onerror=()=>next(i+1);document.head.appendChild(script)
  };next(0)
 }).catch(e=>{loader=null;throw e});
 return loader;
}
async function cameraStart(){
 if(!active||active.submitting)return;
 cameraStop();
 const sess=active,token=sess.cameraToken;
 const status=get('mlISBNCameraStatus'),btn=get('mlISBNStart'),video=get('mlISBNVideo');
 btn.disabled=true;status.textContent='Attivazione fotocamera…';
 try{
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.isSecureContext)
   throw Error('La fotocamera richiede Chrome/Safari in HTTPS. Usa la scheda Inserimento manuale.');
  const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
  if(!active||active!==sess||token!==sess.cameraToken){stream.getTracks().forEach(t=>t.stop());return}
  sess.stream=stream;video.srcObject=stream;await video.play().catch(()=>{});
  status.textContent='Inquadra il barcode sul retro del volume.';
  if('BarcodeDetector' in window){
   let detector;
   try{detector=new window.BarcodeDetector({formats:['ean_13']})}catch(_){}
   if(detector){
    const tick=async()=>{
     if(!active||active!==sess||token!==sess.cameraToken)return;
     try{
      const results=await detector.detect(video);
      for(const r of results){
       const n=fromBarcode(r.rawValue);
       if(validISBN(n)){verified(n);return}
      }
     }catch(_){}
     if(active===sess&&token===sess.cameraToken)sess.timer=setTimeout(tick,220)
    };
    sess.timer=setTimeout(tick,250);return
   }
  }
  await zxingLoad();
  if(!active||active!==sess||token!==sess.cameraToken)return;
  const reader=new window.ZXingBrowser.BrowserMultiFormatOneDReader();
  const control=await reader.decodeFromStream(stream,video,function(result,err,c){
   if(!result||!active||active!==sess||token!==sess.cameraToken)return;
   const n=fromBarcode(result.getText());if(validISBN(n)){sess.control=c;verified(n)}
  });
  if(active===sess&&token===sess.cameraToken)sess.control=control;else try{control.stop()}catch(_){}
 }catch(err){
  cameraStop();
  if(active===sess){status.textContent=String(err&&err.message||err).slice(0,190);btn.disabled=false}
 }
}
function selectMethod(which){
 if(!active)return;
 cameraStop();
 get('mlISBNManualTab').setAttribute('aria-selected',String(which==='manual'));
 get('mlISBNCameraTab').setAttribute('aria-selected',String(which==='camera'));
 get('mlISBNManualPane').hidden=which!=='manual';
 get('mlISBNCameraPane').hidden=which!=='camera';
 if(which==='manual')get('mlISBNCode').focus();
}
function resetForAnother(){
 if(!active)return;
 cameraStop();active.code=null;active.info=null;active.savedId=null;
 active.reviewSignature=null;active.submitting=false;
 get('mlISBNDetails').hidden=true;get('mlISBNReview').hidden=true;get('mlISBNSuccess').hidden=true;
 get('mlISBNEntry').hidden=false;get('mlISBNResult').hidden=true;
 get('mlISBNCode').value='';note('',null);selectMethod('manual');
}
function cleanup(){
 if(!active)return;
 cameraStop();
 const modal=get('modalContent');if(modal)modal.classList.remove('isbn-flow-modal');
 active=null;
}
function open(api){
 if(!api||!api.present||!api.getSeries||!api.commit)throw Error('Scanner API non disponibile.');
 cleanup();
 active={api,code:null,info:null,submitting:false,cameraToken:0,stream:null,control:null,timer:null};
 api.present([
 '<div id="mlISBN">',
 '<div class="isbn-top"><div class="isbn-kicker">MangaLog · La tua collezione</div>',
 '<h2>Scanner ISBN</h2><p class="isbn-desc">Aggiungi un volume in pochi passaggi, senza uscire dall’app.</p></div>',
 '<div class="isbn-content">',
 '<div id="mlISBNEntry"><div class="isbn-tabs" role="tablist" aria-label="Metodo di lettura">',
 '<button type="button" class="isbn-tab" id="mlISBNCameraTab" role="tab" aria-selected="false">▣ Fotocamera</button>',
 '<button type="button" class="isbn-tab" id="mlISBNManualTab" role="tab" aria-selected="true">⌨ Inserisci ISBN</button>',
 '</div>',
 '<div id="mlISBNManualPane" role="tabpanel"><form id="mlISBNForm">',
 '<label class="isbn-label" for="mlISBNCode">Codice ISBN-13</label><div class="isbn-inline">',
 '<input class="isbn-input" id="mlISBNCode" inputmode="numeric" autocomplete="off" maxlength="30" placeholder="978-88..." aria-describedby="mlISBNHint">',
 '<button type="submit" class="btn primary">Verifica ISBN</button></div></form>',
 '<p class="isbn-muted" id="mlISBNHint">Puoi scriverlo con o senza trattini. Non serve conoscere l’editore in anticipo.</p></div>',
 '<div id="mlISBNCameraPane" role="tabpanel" hidden>',
 '<div class="isbn-camera-frame"><video id="mlISBNVideo" autoplay muted playsinline></video><div class="isbn-camera-line" aria-hidden="true"></div></div>',
 '<p class="isbn-muted" id="mlISBNCameraStatus" aria-live="polite">Fotocamera inattiva.</p>',
 '<div class="isbn-actions"><button type="button" id="mlISBNStart" class="btn primary">Attiva fotocamera</button>',
 '<button type="button" id="mlISBNStop" class="btn">Ferma</button></div></div></div>',
 '<div id="mlISBNResult" class="isbn-result" hidden></div>',
 '<div id="mlISBNDetails" hidden><hr class="isbn-line"><h3 class="isbn-h3">Dettagli del volume</h3>',
 '<label class="isbn-label" for="mlISBNTarget">Dove vuoi aggiungerlo?</label><select class="isbn-input" id="mlISBNTarget"></select>',
 '<div id="mlISBNExisting" class="isbn-note" hidden></div>',
 '<div id="mlISBNNewFields" hidden><div class="isbn-fields">',
 '<div class="wide"><label class="isbn-label" for="mlISBNTitle">Titolo della serie</label><input id="mlISBNTitle" class="isbn-input" maxlength="120" placeholder="Es. Look Back"></div>',
 '<div><label class="isbn-label" for="mlISBNEdition">Edizione</label><input id="mlISBNEdition" class="isbn-input" maxlength="100" placeholder="Es. Deluxe Edition"></div>',
 '<div><label class="isbn-label" for="mlISBNPublisher">Editore</label><input id="mlISBNPublisher" class="isbn-input" maxlength="100" placeholder="Es. Star Comics"></div>',
 '<div><label class="isbn-label" for="mlISBNTotal">Totale volumi della serie</label><input id="mlISBNTotal" class="isbn-input" type="number" min="1" max="2000" value="1"></div>',
 '</div></div>',
 '<label class="isbn-label" for="mlISBNNumber">Numero del volume</label><input class="isbn-input" id="mlISBNNumber" type="number" min="1" max="2000" placeholder="Es. 1">',
 '<p class="isbn-muted">Le edizioni vengono tenute separate. I numeri già posseduti non possono essere aggiunti di nuovo.</p>',
 '<div class="isbn-actions"><button type="button" class="btn" id="mlISBNCancel">Annulla</button>',
 '<button type="button" class="btn primary" id="mlISBNNext" disabled>Continua →</button></div></div>',
 '<div id="mlISBNReview" hidden><hr class="isbn-line"><h3 class="isbn-h3">Conferma il volume</h3>',
 '<p class="isbn-muted">Verifica che numero ed edizione corrispondano alla tua copia prima di salvare.</p>',
 '<div class="isbn-review" id="mlISBNReviewText"></div>',
 '<div class="isbn-actions"><button type="button" class="btn" id="mlISBNBack">← Indietro</button>',
 '<button type="button" class="btn primary" id="mlISBNFinal">✓ Aggiungi alla collezione</button></div></div>',
 '<div id="mlISBNSuccess" class="isbn-success" hidden><div class="isbn-success-icon">✓</div>',
 '<h3>Volume aggiunto!</h3><p id="mlISBNSuccessText" class="isbn-muted"></p>',
 '<div class="isbn-actions"><button type="button" class="btn" id="mlISBNAnother">Altro volume</button>',
 '<button type="button" class="btn primary" id="mlISBNView">Apri la collezione</button></div></div>',
 '<p id="mlISBNNotice" class="isbn-note" role="status" aria-live="polite" hidden></p>',
 '</div></div>'
 ].join(''));
 get('modalContent').classList.add('isbn-flow-modal');
 get('mlISBNForm').addEventListener('submit',e=>{e.preventDefault();verified(get('mlISBNCode').value)});
 get('mlISBNCode').addEventListener('input',()=>{
  if(!active||!active.code||clean(get('mlISBNCode').value)===active.code)return;
  active.code=null;active.info=null;active.reviewSignature=null;
  get('mlISBNDetails').hidden=true;get('mlISBNReview').hidden=true;
  get('mlISBNResult').hidden=true;
  note('Il codice è cambiato: premi Verifica ISBN per controllare il nuovo volume.');
 });
 get('mlISBNCameraTab').addEventListener('click',()=>selectMethod('camera'));
 get('mlISBNManualTab').addEventListener('click',()=>selectMethod('manual'));
 get('mlISBNStart').addEventListener('click',cameraStart);
 get('mlISBNStop').addEventListener('click',()=>{cameraStop();get('mlISBNCameraStatus').textContent='Fotocamera fermata.'});
 get('mlISBNTarget').addEventListener('change',renderPlan);
 for(const name of ['mlISBNTitle','mlISBNEdition','mlISBNPublisher','mlISBNTotal','mlISBNNumber'])get(name).addEventListener('input',renderPlan);
 get('mlISBNNext').addEventListener('click',preview);
 get('mlISBNBack').addEventListener('click',()=>{get('mlISBNReview').hidden=true;get('mlISBNEntry').hidden=false;get('mlISBNDetails').hidden=false;renderPlan()});
 get('mlISBNFinal').addEventListener('click',finish);
 get('mlISBNAnother').addEventListener('click',resetForAnother);
 get('mlISBNView').addEventListener('click',()=>{const id=active&&active.savedId;cleanup();api.dismiss();if(api.goToCollection)api.goToCollection(id)});
 get('mlISBNCancel').addEventListener('click',()=>{cleanup();api.dismiss()});
 selectMethod('manual');
}
window.addEventListener('pagehide',cleanup);
window.MangaLogISBNModal={open,cleanup,validISBN,fromBarcode,plan,catalog,version:'v13 integrated'};
})();
