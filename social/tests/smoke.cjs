/* Smoke tests for the self-contained Social demo. No network, npm, or Supabase required. */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const base=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(base,'social-vnext.js'),'utf8');
const page=fs.readFileSync(path.join(base,'social-preview-standalone.html'),'utf8');
const live=fs.readFileSync(path.join(base,'social.html'),'utf8');
const config=fs.readFileSync(path.join(base,'social-test-config.js'),'utf8');
const nodes=new Map();
const handlers={};
for(const name of ['social-app','social-view','social-banner','social-side','social-bottom','social-mode','profile-editor','search-results']){
 nodes.set(name,{id:name,innerHTML:'',textContent:'',classList:{toggle(){}},
   addEventListener(type,listener){handlers[type]=listener;}});
}
const document={getElementById:id=>nodes.get(id)||null};
const context={document,window:{MANGALOG_SOCIAL_TEST_CONFIG:{enabled:false}},console,confirm:()=>true,
  FormData:class {constructor(form){this.values=form.values||{}}get(key){return this.values[key]}},};
vm.runInNewContext(source,context,{timeout:2000,filename:'social-vnext.js'});
const html=()=>nodes.get('social-view').innerHTML;
const click=data=>handlers.click({target:{closest:()=>({dataset:data})}});
const change=(name,value)=>handlers.change({target:{name,value}});
const submit=(id,values,dataset={})=>handlers.submit({preventDefault(){},target:{id,values,dataset,matches:()=>true,
  hasAttribute:n=>n==='data-comment-form'&&Boolean(dataset.commentForm)}});
const tick=async()=>{for(let i=0;i<30;i++)await Promise.resolve()};
async function main(){
  assert.match(html(),/Feed Social/);
  assert.match(html(),/Frieren/);
  assert.match(nodes.get('social-bottom').innerHTML,/Confronta/);
  click({page:'profile'});await tick();assert.match(html(),/Il mio profilo/);
  click({page:'friends'});await tick();assert.match(html(),/Amici e collezionisti/);
  click({friendTab:'requests'});assert.match(html(),/Richieste \(2\)/);
  click({accept:'req1'});await tick();assert.match(html(),/Richieste \(1\)/);
  click({friendTab:'list'});assert.match(html(),/MangaHiro/);
  click({page:'compare'});await tick();assert.match(html(),/Confronta collezioni/);
  assert.match(html(),/One Piece/);
  click({filter:'common'});assert.match(html(),/In comune/);
  click({page:'privacy'});await tick();assert.match(html(),/Privata/);
  change('visibility','friends');await tick();assert.match(html(),/Solo amici/);
  click({page:'feed'});await tick();
  submit('post-form',{body:'<script>alert("bad")</script>',audience:'friends'});await tick();
  assert.match(html(),/&lt;script&gt;/);
  assert.doesNotMatch(html(),/<script>alert/);
  assert.match(page,/DEMO NAVIGABILE/);
  assert.match(page,/window.MANGALOG_SOCIAL_TEST_CONFIG=\{enabled:false/);
  assert.doesNotMatch(page,/https:\/\/.*supabase\.co/);
  assert.doesNotMatch(page,/<script src=/);
  assert.match(live,/social-vnext\.js/);
  assert.match(config,/enabled:false/);
  console.log('PASS: Social demo navigation, friends, volume comparison, privacy, feed, escaping, standalone isolation');
}
main().catch(e=>{console.error(e);process.exitCode=1});
