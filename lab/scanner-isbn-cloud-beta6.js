
/* MangaLog ISBN scanner Beta 6: authenticated, opt-in single-volume cloud writes.
   All writes are revision-checked, never automatic. */
(function(){
'use strict';
const E=id=>document.getElementById(id);
const bridge=window.MangaLogISBNBridge;
if(!bridge){console.warn('ISBN scanner bridge missing');return}
let client=null,account=null,snapshot=null,busy=false,selected='',lastCode='';
const norm=x=>String(x||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it').replace(/[^a-z0-9]+/g,' ').trim();
const owned=s=>new Set((Array.isArray(s.owned)?s.owned:[]).map(Number).filter(Number.isInteger));
function show(message,error){
 E('mlRealStatus').textContent=message;
 E('mlRealStatus').className='mlRealStatus'+(error?' error':'');
}
function value(){
 const c=bridge.candidate();
 return {isbn:String(c.isbn||''),title:String(c.title||'').trim(),edition:String(c.edition||'').trim(),
  publisher:String(c.publisher||'').trim(),volume:Number(c.volume)};
}
function addOption(value,text){
 const o=document.createElement('option');o.value=value;o.textContent=text;E('mlRealTarget').appendChild(o);
}
function render(){
 E('mlRealBody').hidden=!snapshot;
 if(!snapshot){E('mlRealSave').disabled=true;return}
 const c=value();
 if(!c.isbn){
  E('mlRealPreview').textContent='Scansiona un ISBN per iniziare.';
  E('mlRealSave').disabled=true;return
 }
 if(lastCode!==c.isbn){lastCode=c.isbn;selected='';E('mlRealAgree').checked=false}
 const possible=snapshot.payload.series.filter(s=>!!c.title&&norm(s.title)===norm(c.title));
 const select=E('mlRealTarget'),before=selected;
 select.innerHTML='';
 addOption('','— Scegli una destinazione —');
 possible.forEach(s=>addOption(String(s.id),s.title+' · '+(s.edition||'edizione non indicata')+' ('+owned(s).size+'/'+s.total+')'));
 addOption('__new__','＋ Crea nuova serie / edizione');
 const exact=possible.filter(s=>!!c.edition&&!!c.publisher&&norm(s.edition)===norm(c.edition)&&norm(s.publisher)===norm(c.publisher));
 selected=(possible.some(s=>String(s.id)===before)||before==='__new__')?before:(exact.length===1?String(exact[0].id):'');
 select.value=selected;
 E('mlRealTotalWrap').hidden=selected!=='__new__';
 if(!E('mlRealTotal').value&&Number.isInteger(c.volume))E('mlRealTotal').value=String(c.volume);
 preview();
}
function plan(){
 if(!snapshot)return {ok:false,reason:'Collega prima la collezione cloud.'};
 const c=value(),id=E('mlRealTarget').value;
 if(!bridge.valid(c.isbn)||!c.title||c.title.length>120||!c.edition||c.edition.length>100||
    !c.publisher||c.publisher.length>100||!Number.isInteger(c.volume)||c.volume<1||c.volume>2000)
  return {ok:false,reason:'Inserisci ISBN valido, titolo, numero (1–2000), edizione ed editore. Verifica la copia fisica.'};
 if(!id)return {ok:false,reason:'Scegli la serie corretta o crea una nuova edizione.'};
 const same=snapshot.payload.series.filter(s=>norm(s.title)===norm(c.title));
 if(id==='__new__'){
  if(same.some(s=>norm(s.edition)===norm(c.edition)))return {ok:false,reason:'Esiste già questa serie con la stessa edizione: selezionala e controlla i doppioni.'};
  const total=Number(E('mlRealTotal').value);
  if(!Number.isInteger(total)||total<c.volume||total>2000)return {ok:false,reason:'Per la nuova serie indica un totale provvisorio da '+c.volume+' a 2000.'};
  return {ok:true,mode:'new',c,total,description:'NUOVA SERIE · '+c.title+' · '+c.edition+
   '\nEditore: '+c.publisher+'\nPosseduto: volume '+c.volume+' di '+total+
   '\nQuesta serie verrà creata nella collezione cloud.'}
 }
 const target=snapshot.payload.series.find(s=>String(s.id)===id);
 if(!target||norm(target.title)!==norm(c.title))return {ok:false,reason:'Serie non corrispondente. Rileggi il cloud.'};
 if(owned(target).has(c.volume))return {ok:false,reason:'⛔ DOPPIONE: '+target.title+' · '+target.edition+' volume '+c.volume+' è già posseduto. Nessun salvataggio.'};
 if(norm(target.edition)!==norm(c.edition)||norm(target.publisher)!==norm(c.publisher))
  return {ok:false,reason:'⚠ Edizione/editore differenti:\nISBN: '+c.edition+' / '+c.publisher+
   '\nCloud: '+target.edition+' / '+target.publisher+'\nCorreggi i dati o crea una nuova edizione. Nessuna unione automatica.'};
 const extra=c.volume>Number(target.total);
 const inList=!!(target.purchasePlans&&Object.prototype.hasOwnProperty.call(target.purchasePlans,String(c.volume)));
 return {ok:true,mode:'existing',c,targetId:id,description:'SERIE ESISTENTE · '+target.title+' · '+target.edition+
  '\nVolume '+c.volume+'\nPosseduti '+owned(target).size+' → '+(owned(target).size+1)+
  (extra?'\nTotale serie '+target.total+' → '+c.volume:'')+
  (inList?'\nIl volume verrà tolto dalla lista acquisti.':'')+
  '\nTutti gli altri manga e dati restano invariati.'}
}
function preview(){
 if(!snapshot)return;
 const p=plan(),view=E('mlRealPreview');
 view.textContent=p.ok?p.description:p.reason;
 view.className='mlRealPreview'+(p.ok?' ready':' error');
 E('mlRealSave').disabled=!p.ok||!E('mlRealAgree').checked||busy;
}
function disable(){
 account=null;snapshot=null;selected='';lastCode='';E('mlRealBody').hidden=true;
 E('mlRealRefresh').disabled=true;E('mlRealAgree').checked=false;E('mlRealSave').disabled=true;
 show('Modalità reale disattivata. Nessun nuovo salvataggio verrà effettuato.')
}
function configure(){
 const c=window.MANGALOG_CLOUD||{};
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(String(c.url||''))||
    String(c.publishableKey||'').length<16)throw Error('Configurazione cloud non disponibile.');
 if(!window.supabase||!window.supabase.createClient)throw Error('Libreria Supabase non caricata, riprova con Internet attivo.');
 if(!client)client=window.supabase.createClient(c.url,c.publishableKey,
  {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 return client
}
async function identity(c){
 const auth=await c.auth.getUser();
 if(auth.error||!auth.data||!auth.data.user)throw Error('Non sei connesso. Accedi a MangaLog nello stesso browser, poi torna allo scanner.');
 const allowed=await c.rpc('mangalog_session_allowed');
 if(allowed.error||allowed.data!==true)throw Error('Sessione non autorizzata. Effettua nuovamente il login in MangaLog.');
 return auth.data.user
}
async function read(c,id){
 const response=await c.from('mangalog_collections').select('payload,revision').eq('user_id',id).maybeSingle();
 if(response.error)throw response.error;
 const row=response.data;
 if(!row||!row.payload||!Array.isArray(row.payload.series)||!Number.isInteger(Number(row.revision))||
   Number(row.revision)<1)throw Error('Collezione cloud non ancora presente o non valida. Apri MangaLog e verifica prima la sincronizzazione.');
 return {userId:id,revision:Number(row.revision),payload:row.payload}
}
async function connect(){
 if(busy)return;
 busy=true;E('mlRealConnect').disabled=true;E('mlRealRefresh').disabled=true;
 show('Lettura account, controllo autorizzazioni e caricamento collezione…');
 try{
  const c=configure(),user=await identity(c),currentData=await read(c,user.id);
  account={id:user.id,email:user.email||'Account MangaLog'};snapshot=currentData;
  selected='';lastCode='';E('mlRealAgree').checked=false;
  show('✓ Collezione reale collegata: '+account.email+'\n'+currentData.payload.series.length+
   ' serie · revisione cloud '+currentData.revision+'\nNessuna modifica effettuata.');
  E('mlRealRefresh').disabled=false;render();
 }catch(e){disable();show('Impossibile collegare: '+String(e.message||e).slice(0,230),true)}
 finally{busy=false;E('mlRealConnect').disabled=false;preview()}
}
function applyVolume(s,p){
 const copy=JSON.parse(JSON.stringify(s.payload)),c=p.c;
 if(!Array.isArray(copy.activity))copy.activity=[];
 let series;
 if(p.mode==='new'){
  const newId=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random();
  series={id:newId,title:c.title,edition:c.edition,publisher:c.publisher,author:'',total:p.total,
    owned:[],purchasePlans:{},specialVolumes:[],notes:'Serie creata con Scanner ISBN Beta 6; verifica il totale.',created:Date.now()};
  copy.series.push(series);
 }else{
  series=copy.series.find(x=>String(x.id)===p.targetId);
  if(!series)throw Error('La serie non è più disponibile.')
 }
 if(owned(series).has(c.volume))throw Error('Doppione. Nessun salvataggio.');
 series.owned=[...new Set([].concat(series.owned||[],[c.volume]).map(Number))].sort((a,b)=>a-b);
 series.total=Math.max(Number(series.total),c.volume);
 if(series.purchasePlans&&typeof series.purchasePlans==='object')delete series.purchasePlans[String(c.volume)];
 copy.activity=copy.activity.filter(a=>!(a&&String(a.seriesId)===String(series.id)&&Number(a.volume)===c.volume));
 copy.activity.unshift({seriesId:String(series.id),volume:c.volume,at:Date.now()});
 copy.activity=copy.activity.slice(0,120);
 return copy
}
async function save(){
 if(!snapshot||busy)return;
 let proposed=plan();
 if(!proposed.ok||!E('mlRealAgree').checked){preview();return}
 const signature=JSON.stringify(proposed);
 if(!window.confirm('SALVATAGGIO NELLA COLLEZIONE REALE\n\n'+proposed.description+
  '\n\nConfermi la modifica sul tuo MangaLog Cloud?'))return;
 if(signature!==JSON.stringify(plan())||!E('mlRealAgree').checked)return;
 busy=true;E('mlRealSave').disabled=true;E('mlRealConnect').disabled=true;E('mlRealRefresh').disabled=true;
 show('Verifica finale in corso: sessione, duplicati e revisione cloud…');
 try{
  const c=configure(),user=await identity(c);
  if(user.id!==snapshot.userId)throw Error('L’account è cambiato. Ricollegati prima di salvare.');
  const latest=await read(c,user.id);
  if(latest.revision!==snapshot.revision){
   snapshot=latest;selected='';lastCode='';
   throw Error('La collezione è stata aggiornata altrove. Ho riletto i dati: verifica di nuovo il volume e riconferma.')
  }
  if(signature!==JSON.stringify(plan())||!E('mlRealAgree').checked)
   throw Error('La scheda è cambiata dopo la conferma. Verifica di nuovo.');
  snapshot=latest;
  const safePlan=plan();
  if(!safePlan.ok)throw Error(safePlan.reason);
  const newPayload=applyVolume(latest,safePlan);
  const result=await c.from('mangalog_collections')
    .update({payload:newPayload,revision:latest.revision+1,updated_at:new Date().toISOString()})
    .eq('user_id',user.id).eq('revision',latest.revision).select('revision').maybeSingle();
  if(result.error)throw result.error;
  if(!result.data||!Number.isInteger(Number(result.data.revision))){
   snapshot=null;
   throw Error('CONFLITTO: un altro dispositivo ha scritto sul cloud. Nessun dato sovrascritto. Premi Collega per riprovare.')
  }
  snapshot={userId:user.id,revision:Number(result.data.revision),payload:newPayload};
  E('mlRealAgree').checked=false;selected='';lastCode='';
  show('✓ VOLUME SALVATO NEL CLOUD\n'+safePlan.c.title+' · n. '+safePlan.c.volume+
   ' · revisione '+snapshot.revision+'\nAggiorna MangaLog sul Samsung o sul PC per verificare il volume. Conserva il backup.');
  render();
 }catch(e){
  E('mlRealAgree').checked=false;
  if(snapshot)render();else E('mlRealBody').hidden=true;
  show('Salvataggio NON confermato: '+String(e.message||e).slice(0,270),true);
 }finally{busy=false;E('mlRealConnect').disabled=false;E('mlRealRefresh').disabled=!snapshot;preview()}
}
E('mlRealConnect').addEventListener('click',connect);
E('mlRealRefresh').addEventListener('click',connect);
E('mlRealClose').addEventListener('click',disable);
E('mlRealSave').addEventListener('click',save);
E('mlRealTarget').addEventListener('change',e=>{selected=e.target.value;
 E('mlRealTotalWrap').hidden=selected!=='__new__';
 E('mlRealAgree').checked=false;preview();
});
E('mlRealTotal').addEventListener('input',preview);
E('mlRealAgree').addEventListener('change',preview);
['series','volume','edition','publisher'].forEach(id=>E(id).addEventListener('input',render));
window.addEventListener('mangalog-isbn-change',render);
window.MangaLogBeta6Diagnostics={plan,applyVolume,render,connect,save,disable,version:'Beta 6'};
render();
})();
