// ---------- Easier scrolling & Quick Feed (2026.10.11.28) ----------
// 1) Lists like your unit collection no longer sit inside their own scroll box, which trapped your finger
//    on phones and made it hard to scroll back up. Small pickers still scroll, but reaching their end now
//    keeps scrolling the page. A ⬆ Top button appears when you are far down a page.
// 2) Quick Feed: tap a fruit (or 🍎 Feed on a unit card) to open one panel with the fruit, your units and
//    the Feed buttons together. It stays open while you feed, so there is no scrolling up and down.
// ===== Scrolling =====
(function(){
  document.body.insertAdjacentHTML('beforeend','<button id="ggToTop" class="gg-to-top hide" type="button" aria-label="Back to top">⬆<span> Top</span></button>');
  const btn=$('#ggToTop');
  const blocked=()=>{const a=$('#arena');if(a&&a.classList.contains('map-fullscreen'))return true;const k=$('#afkOverlay');if(k&&!k.classList.contains('hide'))return true;const f=$('#ggFeed');return !!(f&&!f.classList.contains('hide'));};
  const update=()=>{btn.classList.toggle('hide',scrollY<600||blocked());};
  addEventListener('scroll',update,{passive:true});setInterval(update,700);
  btn.onclick=()=>{scrollTo({top:0,behavior:'smooth'});btn.classList.add('hide');};
  // Switching tabs from far down the page brings the new tab into view.
  document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{const t=document.querySelector('.tabs');if(t&&t.getBoundingClientRect().top<0)t.scrollIntoView({block:'start',behavior:'smooth'});}));
})();
// ===== Quick Feed =====
const GG_FEED_KEY='gemGuardiansFeed_'+GG_EDITION;
const ggFeedState=(()=>{let p={};try{p=JSON.parse(localStorage.getItem(GG_FEED_KEY)||'{}')||{}}catch(e){}return {fruit:p.fruit||null,uid:p.uid||null,sort:p.sort||'rarityDesc',q:''};})();
function ggFeedStore(){try{localStorage.setItem(GG_FEED_KEY,JSON.stringify({fruit:ggFeedState.fruit,uid:ggFeedState.uid,sort:ggFeedState.sort}))}catch(e){}}
function ggFruits(){return Object.keys(ITEMS).filter(k=>S.bag&&S.bag[k]>0);}
// Simulate feeding without changing the unit: how many fruits get used and the level reached.
function ggFeedPreview(i,k,n){const c={lv:i.lv,xp:i.xp,st:i.st,id:i.id};let used=0;const have=S.bag[k]||0;
  while(used<n&&used<have&&c.lv<100){addXp(c,Math.min(2000,ITEMS[k].exp));used++;}return {used,lv:c.lv,xp:c.xp};}
function ggFeedRun(uid,k,n){const i=S.units.find(x=>x.uid===uid);if(!i||!ITEMS[k]||!(S.bag[k]>0))return null;
  const from=i.lv;let used=0;while(used<n&&S.bag[k]>0&&i.lv<100){addXp(i,Math.min(2000,ITEMS[k].exp));S.bag[k]--;used++;}
  if(!S.bag[k])delete S.bag[k];
  if(used){try{ggStat('feeds',used)}catch(e){}save(false);try{renderAll()}catch(e){}try{refreshQuestBadge()}catch(e){}}
  return {used,from,to:i.lv,unit:i};}
document.body.insertAdjacentHTML('beforeend','<div id="ggFeed" class="gg-feed hide" role="dialog" aria-modal="true" aria-labelledby="ggFeedTitle"><div class="gg-feed-box">'
 +'<div class="gg-feed-head"><h2 id="ggFeedTitle">🍎 Feed units</h2><button class="alt" id="ggFeedClose">Close ✕</button></div>'
 +'<div id="ggFeedFruits" class="gg-feed-fruits" role="tablist" aria-label="Fruits"></div>'
 +'<div id="ggFeedPick" class="gg-feed-pick"></div>'
 +'<div class="gg-feed-tools"><input id="ggFeedSearch" type="search" placeholder="Search units" aria-label="Search units" autocomplete="off"><select id="ggFeedSort" aria-label="Sort units"></select></div>'
 +'<div id="ggFeedList" class="gg-feed-list"></div></div></div>');
$('#ggFeedSort').innerHTML=UNIT_SORT_OPTIONS.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('');
function ggFeedOpen(opt){opt=opt||{};const fr=ggFruits();
  if(!fr.length){toast('You have no fruits. Clear maps or play Infinite Mode to earn them.');return;}
  if(opt.fruit&&fr.includes(opt.fruit))ggFeedState.fruit=opt.fruit;else if(!fr.includes(ggFeedState.fruit))ggFeedState.fruit=fr.reduce((a,b)=>S.bag[b]>S.bag[a]?b:a,fr[0]);
  if(opt.uid)ggFeedState.uid=opt.uid;
  const ok=S.units.filter(u=>u.lv<100);if(!ok.some(u=>u.uid===ggFeedState.uid))ggFeedState.uid=ok.length?sortedOwnedUnits(ok,ggFeedState.sort)[0].uid:null;
  ggFeedState.q='';$('#ggFeedSearch').value='';$('#ggFeedSort').value=ggFeedState.sort;
  $('#ggFeed').classList.remove('hide');document.body.classList.add('gg-feed-open');ggFeedRender();
  const sel=$('#ggFeedList .gg-feed-unit.sel');if(sel)sel.scrollIntoView({block:'nearest'});}
function ggFeedClose(){$('#ggFeed').classList.add('hide');document.body.classList.remove('gg-feed-open');ggFeedStore();try{renderBag()}catch(e){}}
$('#ggFeedClose').onclick=ggFeedClose;
$('#ggFeed').addEventListener('click',e=>{if(e.target.id==='ggFeed')ggFeedClose();});
$('#ggFeedSearch').addEventListener('input',e=>{ggFeedState.q=e.target.value.trim().toLowerCase();ggFeedRenderList();});
$('#ggFeedSort').onchange=e=>{ggFeedState.sort=e.target.value;ggFeedStore();ggFeedRenderList();};
function ggFeedRender(){ggFeedRenderFruits();ggFeedRenderPick();ggFeedRenderList();}
function ggFeedRenderFruits(){
  $('#ggFeedFruits').innerHTML=ggFruits().map(k=>'<button type="button" role="tab" class="gg-fruit'+(k===ggFeedState.fruit?' on':'')+'" data-fruit="'+k+'" aria-selected="'+(k===ggFeedState.fruit)+'"><canvas class="ico" width="72" height="64" data-item="'+k+'"></canvas><b>'+ggEsc(ITEMS[k].n)+'</b><small>×'+S.bag[k]+' · '+ITEMS[k].exp+' EXP</small></button>').join('');
  $('#ggFeedFruits').querySelectorAll('[data-fruit]').forEach(b=>b.onclick=()=>{ggFeedState.fruit=b.dataset.fruit;ggFeedStore();ggFeedRender();});
  paintIcons();
  const on=$('#ggFeedFruits .gg-fruit.on');if(on)on.scrollIntoView({block:'nearest',inline:'nearest'});}
function ggFeedRenderPick(){
  const box=$('#ggFeedPick'),k=ggFeedState.fruit,i=S.units.find(x=>x.uid===ggFeedState.uid);
  if(!i||i.lv>=100){box.innerHTML='<p class="gg-feed-empty">'+(S.units.some(u=>u.lv<100)?'Choose a unit below.':'All your units are level 100. Prestige them in the Units tab to keep leveling.')+'</p>';return;}
  const nd=need(i.lv,i.st,i.id),pct=Math.max(0,Math.min(100,Math.floor(i.xp/nd*100)));
  const p1=ggFeedPreview(i,k,1),p10=ggFeedPreview(i,k,10),pm=ggFeedPreview(i,k,1e6);
  const lvTxt=p=>p.lv>i.lv?'→ Lv '+p.lv:'+'+(p.used*ITEMS[k].exp).toLocaleString()+' EXP';
  box.innerHTML='<div class="gg-feed-sel"><canvas class="ico" width="72" height="64" data-id="'+i.id+'" data-trait="'+(i.trait||'')+'"></canvas><div class="gg-feed-sel-txt"><b class="'+UNITS[i.id].r+'" id="ggFeedSelName"></b><span>Level <b>'+i.lv+'</b>/100 · EXP '+Math.floor(i.xp).toLocaleString()+' / '+nd.toLocaleString()+'</span><div class="gg-feed-bar"><i style="width:'+pct+'%"></i></div></div></div>'
   +'<div class="gg-feed-btns"><button id="ggFeed1">Feed 1<small>'+lvTxt(p1)+'</small></button><button class="alt" id="ggFeed10"'+(p10.used<2?' disabled':'')+'>Feed '+p10.used+'<small>'+lvTxt(p10)+'</small></button><button class="alt" id="ggFeedMax"'+(pm.used<=p10.used?' disabled':'')+'>Feed max ('+pm.used+')<small>'+(pm.lv>=100?'→ Lv 100':lvTxt(pm))+'</small></button></div>';
  $('#ggFeedSelName').textContent=unitLabel(i);
  $('#ggFeed1').onclick=()=>ggFeedDo(1);$('#ggFeed10').onclick=()=>ggFeedDo(10);$('#ggFeedMax').onclick=()=>ggFeedDo(1e6);
  paintIcons();}
function ggFeedRenderList(){
  const q=ggFeedState.q,all=sortedOwnedUnits(S.units,ggFeedState.sort).filter(u=>!q||unitLabel(u).toLowerCase().includes(q));
  const list=[...all.filter(u=>u.lv<100),...all.filter(u=>u.lv>=100)];
  const box=$('#ggFeedList');
  box.innerHTML=list.length?list.map(u=>{const max=u.lv>=100,nd=max?1:need(u.lv,u.st,u.id),pct=max?100:Math.max(0,Math.min(100,Math.floor(u.xp/nd*100)));
    return '<button type="button" class="gg-feed-unit'+(u.uid===ggFeedState.uid?' sel':'')+(max?' max':'')+'" data-uid="'+u.uid+'"'+(max?' disabled':'')+'><canvas class="ico" width="72" height="64" data-id="'+u.id+'" data-trait="'+(u.trait||'')+'"></canvas><span class="gg-feed-unit-txt"><b class="'+UNITS[u.id].r+'"></b><small>'+(max?'Lv 100 · Max (prestige in Units)':'Lv '+u.lv)+(u.favorite?' ♥':'')+'</small><span class="gg-feed-bar"><i style="width:'+pct+'%"></i></span></span></button>';}).join(''):'<p class="gg-feed-empty">No units match.</p>';
  box.querySelectorAll('.gg-feed-unit').forEach(b=>{const u=S.units.find(x=>x.uid===+b.dataset.uid);b.querySelector('b').textContent=unitLabel(u);
    b.onclick=()=>{if(u.lv>=100)return;ggFeedState.uid=u.uid;ggFeedStore();box.querySelectorAll('.gg-feed-unit').forEach(x=>x.classList.toggle('sel',x===b));ggFeedRenderPick();};});
  paintIcons();}
function ggFeedDo(n){
  const k=ggFeedState.fruit,r=ggFeedRun(ggFeedState.uid,k,n);if(!r||!r.used){toast('Pick a unit below level 100 first');return;}
  const name=UNITS[r.unit.id].n;
  toast(name+' ate '+r.used+' '+ITEMS[k].n+(r.to>r.from?' · Level '+r.from+' → '+r.to+'!':''));
  if(r.to>r.from){try{ggSfx('claim')}catch(e){}}
  const left=ggFruits();
  if(!left.length){ggFeedClose();toast(name+' ate '+r.used+(r.to>r.from?' · Level '+r.from+' → '+r.to:'')+'. You are out of fruits.');return;}
  if(!(S.bag[k]>0)){ggFeedState.fruit=left.reduce((a,b)=>S.bag[b]>S.bag[a]?b:a,left[0]);setTimeout(()=>toast('Out of '+ITEMS[k].n+'. Switched to '+ITEMS[ggFeedState.fruit].n+'.'),1300);}
  if(r.to>=100){const nx=sortedOwnedUnits(S.units.filter(u=>u.lv<100),ggFeedState.sort)[0];setTimeout(()=>toast(name+' reached level 100! Prestige it in the Units tab.'),1300);if(nx)ggFeedState.uid=nx.uid;}
  ggFeedStore();ggFeedRender();
  const card=$('#ggFeedPick .gg-feed-sel');if(card&&r.to>r.from){card.classList.remove('gg-lvup');void card.offsetWidth;card.classList.add('gg-lvup');}}
// Bag: tapping a fruit opens Quick Feed; the old long picker is replaced by a short summary.
(function(){const o=renderBag;renderBag=function(){const r=o.apply(this,arguments);try{
  const k=bagSel&&ITEMS[bagSel]&&S.bag[bagSel]>0?bagSel:null,box=$('#bagInfo');
  if(k&&box){const it=ITEMS[k],ok=S.units.some(u=>u.lv<100);
    box.innerHTML='<div class="gg-bag-fruit"><canvas class="ico" width="72" height="64" data-item="'+k+'"></canvas><div><b>'+ggEsc(it.n)+'</b> ×'+S.bag[k]+'<br><small>Food from '+ggEsc(STAGES[it.map].n)+'. Each one gives a unit '+it.exp+' EXP. Earn more by clearing that map or playing its Infinite mode.</small></div></div>'
      +(ok?'<button id="ggBagFeed">🍎 Feed a unit</button>':'<p>You have no units below level 100 to feed.</p>');
    const b=$('#ggBagFeed');if(b)b.onclick=()=>ggFeedOpen({fruit:k});paintIcons();}
  else if(!k&&box&&bagSel!=='trait_reroll')box.innerHTML='<b>Feed fruits to level up your units</b><p>Tap a fruit to open Quick Feed. Pick a unit and feed it right there, as many times as you like, without leaving the panel.</p>';
  $('#bagGrid').querySelectorAll('.card[data-k]').forEach(c=>{const k2=c.dataset.k;if(!ITEMS[k2])return;c.onclick=()=>{bagSel=k2;renderBag();if(S.units.some(u=>u.lv<100))ggFeedOpen({fruit:k2});};});
}catch(e){}return r;};})();
// Units tab: a 🍎 Feed button on every unit below level 100.
(function(){const o=renderAll;renderAll=function(){const r=o.apply(this,arguments);try{
  if(!ggFruits().length)return r;
  $('#coll').querySelectorAll('[data-info]').forEach(b=>{const uid=+b.dataset.info,u=S.units.find(x=>x.uid===uid);if(!u||u.lv>=100)return;const row=b.parentElement;if(!row||row.querySelector('[data-feed]'))return;
    b.insertAdjacentHTML('afterend','<button class="alt gg-feed-card" data-feed="'+uid+'" aria-label="Feed '+ggEsc(UNITS[u.id].n)+'">🍎 Feed</button>');});
  $('#coll').querySelectorAll('[data-feed]').forEach(b=>b.onclick=()=>ggFeedOpen({uid:+b.dataset.feed}));
}catch(e){}return r;};})();
// Escape closes Quick Feed (the Android back button closes it like other windows).
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#ggFeed').classList.contains('hide'))ggFeedClose();});
try{renderAll()}catch(e){}
