
(function(){
'use strict';
const root=document.getElementById('social-app'), view=document.getElementById('social-view');
const banner=document.getElementById('social-banner');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=[['feed','◉','Feed'],['friends','♧','Amici'],['compare','▤','Confronta'],['profile','◯','Profilo']];
const makePerson=(id,name)=>({user_id:id,username:name.toLowerCase(),display_name:name,collection_visibility:'friends'});
const examplePeople=[makePerson('riko','RikoManga'),makePerson('luca','LucaCollects'),makePerson('vale','MangaVale'),makePerson('hiro','MangaHiro'),makePerson('sakura','SakuraReads'),makePerson('ken','KenManga')];
const exampleVolumes=[['One Piece','Standard',1,1,1],['One Piece','Standard',2,1,1],['One Piece','Standard',3,1,0],['One Piece','Standard',4,0,1],['Frieren','Standard',1,1,1],['Frieren','Standard',2,0,1],['Frieren','Standard',3,1,0],['Berserk','Serie Nera',1,1,1],['Berserk','Serie Nera',2,1,0],['Berserk','Serie Nera',3,0,1],['Chainsaw Man','Standard',1,1,1],['Chainsaw Man','Standard',2,1,0]].map(v=>({series_title:v[0],series_key:v[1],volume_number:v[2],mine:!!v[3],theirs:!!v[4]}));
const examplePosts=[
 {id:'demo1',author_id:'me',body:'Finalmente ho completato la mia serie preferita! 📚 Quale manga state leggendo?',created_at:'Adesso',audience:'friends',likes:12,liked:false,comments:[{body:'Bellissimo traguardo!',author_id:'riko'}]},
 {id:'demo2',author_id:'riko',body:'Oggi ho recuperato gli ultimi due volumi di Frieren. Non vedo l’ora di leggerli!',created_at:'2 ore fa',audience:'public',likes:24,liked:false,comments:[]},
 {id:'demo3',author_id:'luca',body:'La mia collezione di Berserk cresce! Qualcuno sta recuperando la Serie Nera?',created_at:'Ieri',audience:'friends',likes:8,liked:false,comments:[]}
];
const S={page:'feed',friendTab:'list',filter:'all',compare:'riko',search:'',searchResults:[],activePost:'',busy:false,mode:'demo',authTab:'login',
 user:null,profile:{user_id:'me',username:'mangacollector',display_name:'MangaCollector',bio:'Collezionista di manga 📚 Amo completare le mie serie!',collection_visibility:'private'},
 people:Object.fromEntries(examplePeople.map(x=>[x.user_id,x])),friends:['riko','luca','vale'],requests:[{id:'req1',sender_id:'hiro',receiver_id:'me',status:'pending'},{id:'req2',sender_id:'sakura',receiver_id:'me',status:'pending'}],sent:[],posts:examplePosts,volumes:exampleVolumes,compareLocked:false
};
let client=null;
function note(text,error){banner.textContent=text||'';banner.classList.toggle('error',!!error)}
function err(e){note('Operazione non riuscita: '+String(e.message||e),true)}
function dateLabel(d){if(!d)return '';if(isNaN(Date.parse(d)))return esc(d);return new Date(d).toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'})}
function person(id){return id===myId()&&S.profile?S.profile:(S.people[id]||makePerson(id,'Utente'))}
function avatar(p){const letter=String(p.display_name||'?')[0].toUpperCase(),kind=letter==='R'?' gold':letter==='L'?' blue':letter==='M'?' red':'';return '<div class="avatar'+kind+'">'+esc(letter)+'</div>'}
function button(text,action,value,secondary){return '<button type="button" class="btn'+(secondary?' alt':'')+'" data-'+action+'="'+esc(value)+'">'+text+'</button>'}
function head(title,description){return '<h1>'+title+'</h1><p class="sub">'+description+'</p>'}
function navigation(){
 const tabs=pages.map(p=>'<button class="social-tab '+(S.page===p[0]?'active':'')+'" data-page="'+p[0]+'"><span class="nav-icon">'+p[1]+'</span>'+p[2]+'</button>').join('');
 const mainLinks=[['home','⌂','Home'],['collection','▦','Collezione'],['missing','☷','Mancolista'],['wishlist','♡','Wishlist'],['stats','▥','Statistiche'],['social','♧','Social']];
 const mainHtml=mainLinks.map(p=>'<button class="nav '+(p[0]==='social'?'active':'')+'" data-main-nav="'+p[0]+'"><span class="nav-icon">'+p[1]+'</span>'+p[2]+'</button>').join('');
 const sidebarLinks=mainLinks.map(p=>'<button class="nav '+(p[0]==='social'?'active':'')+'" data-main-nav="'+p[0]+'"><span class="nav-icon">'+p[1]+'</span>'+p[2]+'</button>'+ (p[0]==='social'?'<div class="desktop-social-submenu">'+tabs+'<button class="social-tab '+(S.page==='privacy'?'active':'')+'" data-page="privacy"><span class="nav-icon">⚙</span>Privacy</button></div>':'')).join('');
 document.getElementById('social-side').innerHTML='<div class="section-label">MANGALOG NEXT</div>'+sidebarLinks+'<div class="sidebar-tip">'+(S.mode==='demo'?'Anteprima locale · dati di esempio':'Progetto Supabase di TEST')+'<br>Le tue collezioni reali restano intatte.</div>';
 document.getElementById('social-bottom').innerHTML=mainHtml;
 document.getElementById('social-mobile-tabs').innerHTML=tabs;
 document.getElementById('social-mobile-tabs').hidden=S.page==='privacy';
 document.getElementById('social-mode').textContent=S.mode==='demo'?'DEMO NAVIGABILE':'TEST ISOLATO';
}

function section(content){return '<section class="panel">'+content+'</section>'}
function peopleCard(p,actions){return '<div class="person row between"><div class="row">'+avatar(p)+'<div><strong>'+esc(p.display_name)+'</strong><small>@'+esc(p.username)+'</small></div></div><div class="row actions">'+actions+'</div></div>'}
function stats(a,b,c){return '<div class="stats"><div><strong>'+a+'</strong><small>In comune</small></div><div><strong>'+b+'</strong><small>Solo tuoi</small></div><div><strong>'+c+'</strong><small>Solo suoi</small></div></div>'}
function feed(){
let content=head('Feed Social','Aggiornamenti e conversazioni tra appassionati di manga.');
content+=section('<div class="row">'+avatar(S.profile)+'<strong>Condividi un aggiornamento</strong></div><form id="post-form"><textarea name="body" class="field" maxlength="2000" required placeholder="Cosa hai letto o acquistato di recente?"></textarea><div class="row between"><span class="hint">Solo testo · senza foto</span><div class="row"><select name="audience" class="field compact"><option value="friends">Amici</option><option value="public">Pubblico</option></select><button class="btn" type="submit">Pubblica</button></div></div></form>');
if(!S.posts.length)content+=section('<p class="hint">Ancora nessun post visibile.</p>');
for(const p of S.posts){const author=p.author_id===myId()?S.profile:person(p.author_id),open=S.activePost===p.id;
 content+=section('<div class="row between"><div class="row">'+avatar(author)+'<div><strong>'+esc(author.display_name)+'</strong><small>'+dateLabel(p.created_at)+' · '+(p.audience==='friends'?'Amici':'Community')+'</small></div></div>'+(p.author_id===myId()?button('Elimina','delete-post',p.id,true):'')+'</div><p class="post-text">'+esc(p.body)+'</p><div class="row spread"><div class="row">'+button((p.liked?'♥ ':'♡ ')+p.likes,'like',p.id,true)+button('Commenti '+p.comments.length,'open-comments',p.id,true)+'</div><span class="hint">'+(p.audience==='friends'?'Solo amici':'Pubblico')+'</span></div>'+(open?'<div class="comments">'+(p.comments.length?p.comments.map(c=>'<p><strong>'+esc(person(c.author_id).display_name)+'</strong> · '+esc(c.body)+'</p>').join(''):'<p class="hint">Nessun commento</p>')+'<form class="row" data-comment-form="'+esc(p.id)+'"><input class="field" name="body" maxlength="1000" required placeholder="Scrivi un commento…"><button class="btn" type="submit">Invia</button></form></div>':''));
}return content;
}
function profileForm(){const p=S.profile;return '<form id="profile-form" class="fields"><label>Nickname (3–24 caratteri)<input class="field" name="username" pattern="[a-z0-9_]{3,24}" minlength="3" maxlength="24" required value="'+esc(p?.username||'')+'"></label><label>Nome visualizzato<input class="field" name="display_name" maxlength="60" required value="'+esc(p?.display_name||'')+'"></label><label>Biografia<textarea class="field" name="bio" maxlength="300">'+esc(p?.bio||'')+'</textarea></label><button class="btn" type="submit">Salva profilo</button></form>'}
function profile(){
if(!S.profile)return head('Crea il tuo profilo','Il tuo primo passo nella community.')+section(profileForm());
const p=S.profile,vol=S.mode==='demo'?'428':'—',series=S.mode==='demo'?'37':'—';
return head('Il mio profilo','La tua identità nella community MangaLog.')+'<section class="panel profile-panel"><div class="cover-strip"></div><div class="profile-content"><div class="row between" style="margin-top:-26px;position:relative">'+avatar(p)+button('Modifica profilo','edit-profile','yes',true)+'</div><h2>'+esc(p.display_name)+'</h2><small>@'+esc(p.username)+'</small><p class="bio">'+esc(p.bio||'Nessuna biografia inserita.')+'</p><div class="profile-stats"><div><strong>'+vol+'</strong><small>Volumi</small></div><div><strong>'+series+'</strong><small>Serie</small></div><div><strong>'+S.friends.length+'</strong><small>Amici</small></div></div><button class="btn alt full" data-page="privacy">🔒 Collezione '+visLabel(p.collection_visibility)+'　›</button>'+(S.mode==='real'?'<p class="hint">Le statistiche complete saranno disponibili solo dopo aver consentito la condivisione.</p>':'')+'</div></section><div id="profile-editor"></div>'+section('<strong>La mia attività</strong><p class="hint">I tuoi post e aggiornamenti appariranno qui.</p>'+button('Vai al Feed','page','feed',true));
}
function friends(){
const accepted=S.friends.map(person),received=S.requests.filter(r=>r.status==='pending'&&r.receiver_id===myId()),sent=S.requests.filter(r=>r.status==='pending'&&r.sender_id===myId());
let html=head('Amici e collezionisti','Cerca utenti, gestisci richieste e scopri le loro collezioni.');
html+='<div class="tabs">'+[['list','I miei amici'],['requests','Richieste ('+received.length+')'],['search','Cerca utenti']].map(t=>'<button class="tab '+(t[0]===S.friendTab?'active':'')+'" data-friend-tab="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
if(S.friendTab==='list')return html+section('<h3>I miei amici · '+accepted.length+'</h3>'+(accepted.map(p=>peopleCard(p,button('Confronta','compare-friend',p.user_id)+button('Blocca','block',p.user_id,true))).join('')||'<p class="hint">Non hai ancora amici.</p>'));
if(S.friendTab==='requests')return html+section('<h3>Richieste ricevute</h3>'+(received.map(r=>peopleCard(person(r.sender_id),button('Accetta','accept',r.id)+button('Rifiuta','decline',r.id,true))).join('')||'<p class="hint">Nessuna richiesta in sospeso.</p>')+(sent.length?'<h3>Richieste inviate</h3>'+sent.map(r=>peopleCard(person(r.receiver_id),button('Annulla','cancel',r.id,true))).join(''):''));
return html+section('<h3>Cerca per nickname</h3><form id="search-form" class="row"><input class="field" name="term" minlength="2" maxlength="24" placeholder="Es. mangahiro" value="'+esc(S.search)+'" required><button class="btn" type="submit">Cerca</button></form><div id="search-results">'+searchResults()+'</div>');
}
function searchResults(){if(!S.search)return '<p class="hint">Inserisci almeno due caratteri per cercare un collezionista.</p>';return S.searchResults.length?S.searchResults.map(p=>peopleCard(p,button(S.sent.includes(p.user_id)?'Inviata ✓':'Aggiungi','add',p.user_id))).join(''):'<p class="hint">Nessun risultato trovato.</p>'}
function compare(){
const friends=S.friends.map(person);if(!friends.length)return head('Confronta collezioni','Trova volumi in comune con i tuoi amici.')+section('<p class="hint">Aggiungi almeno un amico per utilizzare il confronto.</p>');
if(!S.friends.includes(S.compare))S.compare=S.friends[0];
const selected=person(S.compare),filtered=S.volumes.filter(r=>S.filter==='all'||(S.filter==='common'&&r.mine&&r.theirs)||(S.filter==='mine'&&r.mine&&!r.theirs)||(S.filter==='theirs'&&!r.mine&&r.theirs));
const common=S.volumes.filter(r=>r.mine&&r.theirs).length,mine=S.volumes.filter(r=>r.mine&&!r.theirs).length,theirs=S.volumes.filter(r=>!r.mine&&r.theirs).length;
let html=head('Confronta collezioni','Scopri i manga e i volumi che possedete entrambi.');
html+=section('<label class="fields">Confronta con<select id="compare-select" class="field">'+friends.map(p=>'<option value="'+esc(p.user_id)+'" '+(p.user_id===S.compare?'selected':'')+'>'+esc(p.display_name)+'</option>').join('')+'</select></label>'+(S.compareLocked?'<p class="warning">La collezione di questo utente è privata. Non è possibile effettuare il confronto.</p>':stats(common,mine,theirs))+'<p class="hint">'+(S.mode==='demo'?'Dati dimostrativi: 12 volumi di esempio.':'Confronto dei soli numeri condivisi volontariamente nel Social.')+'</p>');
if(!S.compareLocked)html+=section('<div class="tabs">'+[['all','Tutti'],['common','In comune'],['mine','Solo miei'],['theirs','Solo suoi']].map(t=>'<button class="tab '+(S.filter===t[0]?'active':'')+'" data-filter="'+t[0]+'">'+t[1]+'</button>').join('')+'</div><div class="volume-row heading-row"><span>Serie / edizione / N.</span><span>Tu</span><span>'+esc(selected.display_name.slice(0,7))+'</span></div>'+(filtered.map(v=>'<div class="volume-row"><div><strong>'+esc(v.series_title)+'</strong><small>'+esc(v.series_key.split('::').slice(-1)[0])+' · Vol. '+v.volume_number+'</small></div><span class="'+(v.mine?'yes':'no')+'">'+(v.mine?'✓':'—')+'</span><span class="'+(v.theirs?'yes':'no')+'">'+(v.theirs?'✓':'—')+'</span></div>').join('')||'<p class="hint">Nessun volume per questo filtro.</p>'));
if(S.mode==='real')html+=section('<h3>La mia lista condivisa · '+S.myVolumes.length+' volumi</h3><p class="hint">Aggiungi soltanto i numeri che desideri condividere. La Collezione principale non viene letta né modificata.</p><form id="volumes-form" class="fields"><label>Titolo serie<input class="field" name="title" maxlength="90" required placeholder="Es. One Piece"></label><label>Edizione<input class="field" name="edition" maxlength="55" required placeholder="Es. Standard"></label><label>Volumi posseduti (separati da virgole)<input class="field" name="numbers" required placeholder="Es. 1, 2, 3"></label><button class="btn" type="submit">Aggiungi alla lista condivisa</button></form>'+(S.myVolumes.length?'<div class="space">'+button('Cancella la lista condivisa','clear-volumes','yes',true)+'</div>':''));
return html;
}
function visLabel(v){return v==='public'?'pubblica':v==='friends'?'visibile agli amici':'privata'}
function privacy(){const vis=S.profile?.collection_visibility||'private';return head('Privacy e visibilità','Scegli chi può vedere i tuoi dati e i volumi condivisi.')+section('<h3>La mia collezione Social</h3>'+[['private','🔒 Privata','Visibile soltanto a te'],['friends','♧ Solo amici','Visibile agli amici accettati'],['public','◎ Pubblica','Visibile agli utenti autenticati']].map(v=>'<label class="privacy-choice"><input type="radio" name="visibility" value="'+v[0]+'" '+(vis===v[0]?'checked':'')+'><span><strong>'+v[1]+'</strong><small>'+v[2]+'</small></span></label>').join('')+'<p class="hint">Nessun volume della Collezione principale viene pubblicato in automatico.</p>')+section('<h3>Foto e archiviazione</h3><p class="hint">I post sono soltanto testuali. Non sono previsti caricamenti di immagini sui server.</p>'+(S.mode==='real'?button('Esci dal Social di test','logout','yes',true):''));
}
function auth(){return head('Social di test','Accedi solo con un account del progetto Supabase di test.')+section('<div class="tabs"><button class="tab '+(S.authTab==='login'?'active':'')+'" data-auth-tab="login">Accedi</button><button class="tab '+(S.authTab==='signup'?'active':'')+'" data-auth-tab="signup">Registrati</button></div><form id="auth-form" class="fields"><label>Email<input class="field" name="email" type="email" required></label><label>Password<input class="field" name="password" type="password" minlength="6" required></label><button class="btn" type="submit">'+(S.authTab==='login'?'Accedi':'Crea account')+'</button></form><p class="hint">La versione online di MangaLog utilizza un database diverso.</p>')}
function myId(){return S.mode==='real'?S.user?.id:'me'}
function render(){navigation();view.innerHTML=S.mode==='real'&&!S.user?auth():S.mode==='real'&&!S.profile&&S.page!=='profile'?head('Benvenuto nel Social','Crea prima un profilo personale.')+section(button('Crea profilo','page','profile')):({feed,profile,friends,compare,privacy}[S.page]||feed)()}
async function get(query){const {data,error}=await query;if(error)throw error;return data}
async function names(ids){let unique=[...new Set(ids.filter(Boolean))];if(!unique.length)return{};const list=await get(client.from('social_profiles').select('user_id,username,display_name,collection_visibility').in('user_id',unique));return Object.fromEntries(list.map(p=>[p.user_id,p]))}
async function reload(){
if(S.mode!=='real'||!S.user){render();return}
view.innerHTML='<div class="panel">Caricamento Social…</div>';
try{
 S.profile=await get(client.from('social_profiles').select('*').eq('user_id',S.user.id).maybeSingle());
 if(S.page==='friends'||S.page==='compare'||S.page==='profile'){
 const req=await get(client.from('social_friend_requests').select('id,sender_id,receiver_id,status').or('sender_id.eq.'+S.user.id+',receiver_id.eq.'+S.user.id).limit(150));
 S.requests=req;let ids=req.flatMap(r=>[r.sender_id,r.receiver_id]);Object.assign(S.people,await names(ids));
 S.friends=[...new Set(req.filter(r=>r.status==='accepted').map(r=>r.sender_id===S.user.id?r.receiver_id:r.sender_id))];
 }
 if(S.page==='feed'){
 const posts=await get(client.from('social_posts').select('id,author_id,body,audience,created_at').order('created_at',{ascending:false}).limit(30));
 let likes=[],comments=[];
 if(posts.length){Object.assign(S.people,await names(posts.map(p=>p.author_id)));const ids=posts.map(p=>p.id);
 likes=await get(client.from('social_likes').select('post_id,user_id').in('post_id',ids));
 comments=await get(client.from('social_comments').select('id,post_id,author_id,body').in('post_id',ids).limit(250));Object.assign(S.people,await names(comments.map(c=>c.author_id)));}
 S.posts=posts.map(p=>({...p,likes:likes.filter(x=>x.post_id===p.id).length,liked:likes.some(x=>x.post_id===p.id&&x.user_id===S.user.id),comments:comments.filter(x=>x.post_id===p.id)}));
 }
 if(S.page==='compare'){
 S.myVolumes=await get(client.from('social_collection_volumes').select('series_key,series_title,volume_number').eq('user_id',S.user.id).limit(3000));
 if(!S.friends.includes(S.compare))S.compare=S.friends[0]||'';
 S.volumes=[];S.compareLocked=false;
 if(S.compare){let p=person(S.compare);if(p.collection_visibility==='private')S.compareLocked=true;
 else {let rows=await get(client.rpc('social_compare_collections',{other_user:S.compare}));S.volumes=rows||[]}}
 }
 render();
}catch(e){err(e);render()}
}
async function act(fn){if(S.busy)return;S.busy=true;try{await fn()}catch(e){err(e)}finally{S.busy=false}}
async function route(p){S.page=p;S.activePost='';note('');await reload()}
async function respond(id,value){if(S.mode==='real'){await get(client.rpc('social_respond_to_request',{request_id:id,response:value}))}else{let r=S.requests.find(r=>r.id===id);if(r){r.status=value;if(value==='accepted')S.friends.push(r.sender_id)}}await reload()}
async function searchUsers(term){S.search=term.toLowerCase().replace(/[%]/g,'');if(S.mode==='real')S.searchResults=await get(client.from('social_profiles').select('user_id,username,display_name').ilike('username','%'+S.search+'%').neq('user_id',S.user.id).limit(25));
else S.searchResults=examplePeople.filter(p=>p.username.includes(S.search)&&!S.friends.includes(p.user_id)&&!S.sent.includes(p.user_id));render()}
root.addEventListener('click',event=>{
const btn=event.target.closest('button');if(!btn)return;
const d=btn.dataset;
if(d.mainNav){
 if(d.mainNav==='social'){act(()=>route('feed'));return}
 try{sessionStorage.setItem('mangalog_next_target',d.mainNav)}catch(e){}
 window.location.href='./index.html';return;
}
if(d.page){act(()=>route(d.page));return}
if(d.friendTab){S.friendTab=d.friendTab;render();return}
if(d.filter){S.filter=d.filter;render();return}
if(d.authTab){S.authTab=d.authTab;render();return}
if(d.editProfile){document.getElementById('profile-editor').innerHTML=section(profileForm());return}
if(d.compareFriend){S.compare=d.compareFriend;S.filter='all';act(()=>route('compare'));return}
if(d.openComments){S.activePost=S.activePost===d.openComments?'':d.openComments;render();return}
if(d.accept){act(()=>respond(d.accept,'accepted'));return}
if(d.decline){act(()=>respond(d.decline,'declined'));return}
if(d.add){act(async()=>{if(S.mode==='real')await get(client.from('social_friend_requests').insert({sender_id:S.user.id,receiver_id:d.add}));else{S.sent.push(d.add);S.searchResults=S.searchResults.filter(p=>p.user_id!==d.add)}note('Richiesta inviata.');await reload()});return}
if(d.cancel){act(async()=>{await get(client.from('social_friend_requests').delete().eq('id',d.cancel));await reload()});return}
if(d.like){act(async()=>{const p=S.posts.find(p=>p.id===d.like);if(!p)return;if(S.mode==='real'){if(p.liked)await get(client.from('social_likes').delete().eq('post_id',p.id).eq('user_id',S.user.id));else await get(client.from('social_likes').insert({post_id:p.id,user_id:S.user.id}))}else{p.likes+=p.liked?-1:1;p.liked=!p.liked}await reload()});return}
if(d.deletePost){if(!confirm('Eliminare il post?'))return;act(async()=>{if(S.mode==='real')await get(client.from('social_posts').delete().eq('id',d.deletePost).eq('author_id',S.user.id));else S.posts=S.posts.filter(p=>p.id!==d.deletePost);await reload()});return}
if(d.block){if(!confirm('Bloccare questo utente?'))return;act(async()=>{if(S.mode==='real')await get(client.from('social_blocks').insert({blocker_id:S.user.id,blocked_id:d.block}));else S.friends=S.friends.filter(id=>id!==d.block);await reload()});return}
if(d.clearVolumes){if(!confirm('Cancellare tutti i volumi condivisi nel Social?'))return;act(async()=>{await get(client.from('social_collection_volumes').delete().eq('user_id',S.user.id));await reload()});return}
if(d.logout){act(async()=>{await client.auth.signOut();S.user=null;S.profile=null;render()});return}
});
root.addEventListener('change',event=>{
const t=event.target;if(t.id==='compare-select'){S.compare=t.value;S.filter='all';act(reload);return}
if(t.name==='visibility'){act(async()=>{if(S.mode==='real')await get(client.from('social_profiles').update({collection_visibility:t.value}).eq('user_id',S.user.id));else S.profile.collection_visibility=t.value;await reload();note('Preferenza di privacy aggiornata.')})}
});
root.addEventListener('submit',event=>{
const form=event.target;if(!form.matches('form'))return;event.preventDefault();const fd=new FormData(form);
if(form.id==='search-form'){act(()=>searchUsers(String(fd.get('term')||'').trim()));return}
if(form.id==='auth-form'){act(async()=>{const email=String(fd.get('email')||''),password=String(fd.get('password')||'');if(S.authTab==='signup'){const {data,error}=await client.auth.signUp({email,password});if(error)throw error;if(!data.session){note('Registrazione inviata. Controlla la tua email per confermare l’account di test.');return}}else{const {error}=await client.auth.signInWithPassword({email,password});if(error)throw error}const {data,error}=await client.auth.getUser();if(error)throw error;S.user=data.user;await reload()});return}
if(form.id==='profile-form'){act(async()=>{let username=String(fd.get('username')||'').toLowerCase().trim(),display_name=String(fd.get('display_name')||'').trim(),bio=String(fd.get('bio')||'').trim();if(!/^[a-z0-9_]{3,24}$/.test(username)||!display_name)throw Error('Nome o nickname non validi');const p={username,display_name,bio};if(S.mode==='real')await get(client.from('social_profiles').upsert({...p,user_id:S.user.id},{onConflict:'user_id'}));else Object.assign(S.profile,p);await reload();note('Profilo salvato.')});return}
if(form.id==='post-form'){act(async()=>{const body=String(fd.get('body')||'').trim(),audience=fd.get('audience');if(!body)throw Error('Scrivi un testo');if(S.mode==='real')await get(client.from('social_posts').insert({body,audience,author_id:S.user.id}));else S.posts.unshift({id:'demo'+Date.now(),author_id:'me',body,audience,created_at:'Adesso',likes:0,liked:false,comments:[]});await reload();note('Post pubblicato.')});return}
if(form.hasAttribute('data-comment-form')){act(async()=>{const id=form.dataset.commentForm,body=String(fd.get('body')||'').trim();if(!body)throw Error('Inserisci un commento');if(S.mode==='real')await get(client.from('social_comments').insert({post_id:id,author_id:S.user.id,body}));else S.posts.find(p=>p.id===id)?.comments.push({author_id:'me',body});await reload();note('Commento pubblicato.')});return}
if(form.id==='volumes-form'){act(async()=>{const title=String(fd.get('title')||'').trim(),edition=String(fd.get('edition')||'').trim(),raw=String(fd.get('numbers')||'');const nums=[...new Set(raw.split(/[,;\s]+/).filter(Boolean).map(Number))];if(!title||!edition||!nums.length||nums.length>100||nums.some(n=>!Number.isSafeInteger(n)||n<1||n>10000))throw Error('Dati volumi non validi');const slug=s=>s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');const key=slug(title)+'::'+slug(edition);if(key.length>160)throw Error('Titolo/edizione troppo lunghi');await get(client.from('social_collection_volumes').upsert(nums.map(n=>({user_id:S.user.id,series_key:key,series_title:title,volume_number:n})),{onConflict:'user_id,series_key,volume_number'}));await reload();note('Volumi condivisi salvati. La Collezione principale non è stata modificata.')});return}
});
async function boot(){
const c=window.MANGALOG_SOCIAL_TEST_CONFIG;
if(c&&c.enabled){
const url=String(c.url||''),key=String(c.publishableKey||'');
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)||!key||url.includes('trfbpctrqrlaqczpyzks')){note('Configurazione di test non valida o collegata alla produzione. La demo resta isolata.',true)}
else if(!window.supabase){note('Supabase non disponibile. Modalità demo.',true)}
else try{client=window.supabase.createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'mangalog-social-test-only'}});S.mode='real';S.profile=null;const {data,error}=await client.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;S.user=data.user;await reload();return}catch(e){S.mode='demo';S.user=null;client=null;note('Ambiente di test non raggiungibile: '+e.message+'. Mostro la demo.',true)}}
render();
}
boot();
})();
