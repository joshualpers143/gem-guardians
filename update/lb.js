// ---------- Leaderboards (2026.10.11.25) ----------
// Infinite Mode (one board per map, highest wave reached) and Raids (highest level, fastest clear breaks ties).
// Only runs that start while signed in with a claimed name and online can count. The server times every run
// with its own clock and rejects results that would be impossible at Speed x3; raid levels count in order.
const GG_LB_PENDING_KEY='gemGuardiansLbPending_'+GG_EDITION;
const GG_LB_WHY={creator:'Creator Edition runs do not count on the public leaderboards.',signin:'Sign in to Cloud Save to join leaderboards.',name:'Claim your unique player name to join leaderboards.',order:'Raid levels count on the leaderboard in order.',too_fast:'This result was faster than the game allows, so it was not counted.',offline:'This run started offline, so it cannot be counted.',expired:'This run is more than a day old, so it can no longer be counted.',used:'This run was already counted.',busy:'Too many unfinished runs. Finish or quit a run first.',board:'This mode has no leaderboard.',level:'This raid level has no leaderboard.',run:'This run could not be found on the server.',value:'This result could not be counted.'};
function ggLbBoard(g){if(!g)return null;if(g.raidLevel)return 'raid';if(g.mode==='infinite')return 'inf:'+g.si;return null;}
function ggLbPending(){try{return JSON.parse(localStorage.getItem(GG_LB_PENDING_KEY)||'[]')||[]}catch(e){return []}}
function ggLbSetPending(a){try{localStorage.setItem(GG_LB_PENDING_KEY,JSON.stringify(a.slice(-20)))}catch(e){}}
function ggLbFmtTime(s){s=Math.max(0,Math.round(s||0));const m=Math.floor(s/60),x=s%60;return m+':'+String(x).padStart(2,'0');}
function ggLbBoardName(b){if(b==='raid')return 'Raids';const si=+String(b).split(':')[1];return (STAGES[si]?STAGES[si].n:'Map '+(si+1))+' · Infinite';}
function ggLbScore(b,v,s){return b==='raid'?'Level '+v+' · '+ggLbFmtTime(s):'Wave '+v;}
// Start: ask the server for a timed run ticket.
(function(){const o=startBattle;startBattle=function(si,mode,raidLevel){const r=o.apply(this,arguments);try{
  const g=G;if(!g||g.lbStarted)return r;g.lbStarted=true;const board=ggLbBoard(g);if(!board)return r;g.lbBoard=board;ggLbNote('');
  // Creator Edition (private, with developer tools) never submits to the public leaderboards.
  if(GG_EDITION!=='public'){g.lbSkip='creator';return r;}
  if(!ggCanJoinLeaderboards()){g.lbSkip=!ggCloud.session?'signin':'name';return r;}
  if(!ggIsOnline()){g.lbSkip='offline';return r;}
  g.lbStartP=ggRpc('lb_start_run',board==='raid'?{p_board:board,p_level:g.raidLevel}:{p_board:board},true).then(x=>{
    if(x.ok&&x.data&&x.data.ok){g.lbRun=x.data.run;}else{g.lbSkip=x.ok&&x.data?x.data.reason:'offline';g.lbNext=x.data&&x.data.next;}
  }).catch(()=>{g.lbSkip='offline';});
}catch(e){}return r;};})();
// Finish: send the result (or keep it until the connection is back).
(function(){const o=finish;finish=function(win){const g=G;const r=o.apply(this,arguments);try{if(g&&g.lbBoard&&!g.lbDone){g.lbDone=true;ggLbFinish(g,!!win);}}catch(e){}return r;};})();
async function ggLbFinish(g,win){
  if(g.lbStartP)await g.lbStartP;
  const board=g.lbBoard,name=ggLbBoardName(board);
  if(board==='raid'&&!win){if(g.lbRun)ggLbSend({run:g.lbRun,result:0,board});return;}
  if(!g.lbRun){const why=g.lbSkip;ggLbNote('🏆 '+(why==='order'?'Raid Level '+g.raidLevel+' was not counted: clear Raid Level '+(g.lbNext||1)+' first while signed in.':(GG_LB_WHY[why]||'This run was not counted.')),'muted');return;}
  const result=board==='raid'?1:g.wave;
  ggLbNote('🏆 Sending your result to the '+name+' leaderboard…','muted');
  const res=await ggLbSend({run:g.lbRun,result,board,wave:g.wave,level:g.raidLevel});
  if(!res){ggLbNote('🏆 You are offline. Your result will be sent to the leaderboard when you are back online.','muted');return;}
  ggLbShowResult(res,board);
}
function ggLbShowResult(d,board){
  if(!d.ok){ggLbNote('🏆 '+(GG_LB_WHY[d.reason]||'This result was not counted.'),'bad');return;}
  if(!d.counted)return;
  const me=d.me||{},name=ggLbBoardName(board);
  if(d.improved)ggLbNote('🏆 New personal best on '+name+'! '+ggLbScore(board,me.value,me.seconds)+' · Rank #'+me.rank+' of '+me.total,'good');
  else ggLbNote('🏆 '+name+': your best is '+ggLbScore(board,me.value,me.seconds)+' · Rank #'+me.rank+' of '+me.total,'muted');
}
// Returns the server answer, or null if it could not be sent (then it is kept for later).
async function ggLbSend(p){
  const x=await ggRpc('lb_finish_run',{p_run:p.run,p_result:p.result,p_version:GAME_VERSION},true);
  if(x.ok&&x.data)return x.data;
  if(x.status===0||!x.ok&&x.status>=500){const a=ggLbPending();if(!a.some(q=>q.run===p.run))a.push(Object.assign({t:Date.now()},p));ggLbSetPending(a);return null;}
  return {ok:false,reason:'value'};
}
let ggLbFlushing=false;
async function ggLbFlush(){if(ggLbFlushing||!ggCloud.session||!ggIsOnline())return;const a=ggLbPending();if(!a.length)return;ggLbFlushing=true;
  try{const keep=[];for(const p of a){if(Date.now()-p.t>86400000)continue;const x=await ggRpc('lb_finish_run',{p_run:p.run,p_result:p.result,p_version:GAME_VERSION},true);
      if(x.ok&&x.data){if(x.data.ok&&x.data.counted&&x.data.improved)toast('🏆 Leaderboard updated: '+ggLbBoardName(p.board)+' · '+ggLbScore(p.board,x.data.me.value,x.data.me.seconds)+' (Rank #'+x.data.me.rank+')');}
      else if(x.status===0||x.status>=500)keep.push(p);}
    ggLbSetPending(keep);}finally{ggLbFlushing=false;}}
window.addEventListener('online',()=>setTimeout(ggLbFlush,1500));
setInterval(ggLbFlush,60000);setTimeout(ggLbFlush,6000);
// Result card line.
function ggLbNote(txt,kind){let el=$('#ggLbNote');if(!el){const n=$('#battleOutcomeNote');if(!n)return;n.insertAdjacentHTML('afterend','<div id="ggLbNote" class="gg-lb-note"></div>');el=$('#ggLbNote');}
  el.textContent=txt||'';el.className='gg-lb-note'+(kind?' '+kind:'');el.classList.toggle('hide',!txt);}
// ----- Leaderboard window -----
document.body.insertAdjacentHTML('beforeend','<div id="ggLbModal" class="settings-panel hide" role="dialog" aria-modal="true" aria-labelledby="ggLbTitle"><div class="settings-box gg-lb-box"><div class="row" style="justify-content:space-between;align-items:center"><h2 id="ggLbTitle">🏆 Leaderboards</h2><button class="alt" id="ggLbClose">Close ✕</button></div>'
 +'<div class="gg-lb-tabs" role="tablist"><button role="tab" data-lbt="inf">♾️ Infinite</button><button role="tab" data-lbt="raid">🏰 Raids</button></div>'
 +'<div id="ggLbMapRow" class="gg-lb-maprow"><label for="ggLbMap">Map</label><select id="ggLbMap"></select></div>'
 +'<p id="ggLbHint" class="gg-lb-hint"></p><div id="ggLbElig"></div><div id="ggLbMe" class="gg-lb-me hide"></div><ol id="ggLbList" class="gg-lb-list"></ol>'
 +'<small class="gg-lb-rules">Scores count only for runs started while you are signed in with a claimed name and online. Every run is timed by the server: results faster than the game allows (even at Speed ×3) are not counted. Raid levels count in order, starting from Level 1.</small></div></div>');
const ggLb={tab:'inf',map:0,seq:0};
try{const p=JSON.parse(localStorage.getItem('gemGuardiansLbView')||'{}');if(p.tab)ggLb.tab=p.tab;if(Number.isFinite(p.map))ggLb.map=p.map;}catch(e){}
function ggLbOpen(tab,map){if(tab)ggLb.tab=tab;if(Number.isFinite(map))ggLb.map=map;$('#ggLbModal').classList.remove('hide');ggLbRender();}
$('#ggLbClose').onclick=()=>$('#ggLbModal').classList.add('hide');
$('#ggLbModal').addEventListener('click',e=>{if(e.target.id==='ggLbModal')$('#ggLbModal').classList.add('hide');});
document.querySelectorAll('[data-lbt]').forEach(b=>b.onclick=()=>{ggLb.tab=b.dataset.lbt;ggLbRender();});
$('#ggLbMap').onchange=e=>{ggLb.map=+e.target.value;ggLbRender();};
async function ggLbRender(){
  try{localStorage.setItem('gemGuardiansLbView',JSON.stringify({tab:ggLb.tab,map:ggLb.map}))}catch(e){}
  document.querySelectorAll('[data-lbt]').forEach(b=>{const on=b.dataset.lbt===ggLb.tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);});
  const sel=$('#ggLbMap');if(!sel.options.length)sel.innerHTML=STAGES.map((s,i)=>'<option value="'+i+'">'+(i+1)+'. '+ggEsc(s.n)+'</option>').join('');
  if(ggLb.map>=STAGES.length)ggLb.map=0;sel.value=ggLb.map;
  $('#ggLbMapRow').classList.toggle('hide',ggLb.tab!=='inf');
  const board=ggLb.tab==='raid'?'raid':'inf:'+ggLb.map;
  $('#ggLbHint').textContent=ggLb.tab==='raid'?'Highest raid level cleared. Faster clears rank higher.':'Highest wave reached in Infinite Mode on this map.';
  const el=$('#ggLbElig');const why=ggLeaderboardBlockReason();
  el.innerHTML=why?'<div class="gg-lb-elig"><span>'+ggEsc(why)+'</span><button id="ggLbJoin">'+(ggCloud.session?'Claim name':'Sign in')+'</button></div>':'';
  if(why)$('#ggLbJoin').onclick=()=>{$('#ggLbModal').classList.add('hide');if(ggCloud.session)ggNameOpen();else ggGoToCloudSave();};
  const list=$('#ggLbList'),me=$('#ggLbMe');const seq=++ggLb.seq;
  list.innerHTML='<li class="gg-lb-empty">Loading…</li>';me.classList.add('hide');
  if(!ggIsOnline()){list.innerHTML='<li class="gg-lb-empty">You are offline. Connect to the internet to see the leaderboard.</li>';return;}
  const top=await ggRpc('lb_top',{p_board:board,p_limit:50},!!ggCloud.session);if(seq!==ggLb.seq)return;
  if(!top.ok||!Array.isArray(top.data)){list.innerHTML='<li class="gg-lb-empty">'+ggEsc(ggCloudErr(top))+'</li>';return;}
  list.innerHTML=top.data.length?top.data.map(r=>'<li class="gg-lb-row'+(r.is_me?' me':'')+(r.rank<=3?' top'+r.rank:'')+'"><span class="gg-lb-rank">'+(r.rank<=3?['🥇','🥈','🥉'][r.rank-1]:'#'+r.rank)+'</span><span class="gg-lb-name">'+ggEsc(r.name)+(r.is_me?' <small>(you)</small>':'')+'</span><span class="gg-lb-val">'+ggEsc(ggLbScore(board,r.value,r.seconds))+'</span></li>').join(''):'<li class="gg-lb-empty">No scores yet. Be the first!</li>';
  if(ggCanJoinLeaderboards()){const m=await ggRpc('lb_me',{p_board:board},true);if(seq!==ggLb.seq)return;
    if(m.ok&&m.data&&m.data.rank){me.innerHTML='Your best: <b>'+ggEsc(ggLbScore(board,m.data.value,m.data.seconds))+'</b> · Rank <b>#'+m.data.rank+'</b> of '+m.data.total;me.classList.remove('hide');}
    else{me.textContent='You have no score here yet.';me.classList.remove('hide');}}
}
// Entry points: header menu, Battle screen and Raids panel.
(function(){
  const q=$('#bQol');if(q&&!$('#bRanks')){q.insertAdjacentHTML('beforebegin','<button class="alt hdr-more" id="bRanks">🏆 Leaderboards</button>');
    $('#bRanks').addEventListener('click',()=>{ggLbOpen();const h=$('header');if(h)h.classList.remove('more-open');const m=$('#bMore');if(m)m.setAttribute('aria-expanded','false');});}
  const mi=$('#modeInfo');if(mi&&!$('#ggLbFromBattle')){mi.insertAdjacentHTML('afterend','<button class="alt gg-lb-open" id="ggLbFromBattle">🏆 Leaderboards</button>');$('#ggLbFromBattle').onclick=()=>ggLbOpen('inf');}
  const rh=$('#raidPanel h2');if(rh&&!$('#ggLbFromRaid')){rh.insertAdjacentHTML('afterend','<button class="alt gg-lb-open" id="ggLbFromRaid">🏆 Raid leaderboard</button>');$('#ggLbFromRaid').onclick=()=>ggLbOpen('raid');}
  try{if(typeof ggIconize==='function')ggIconize($('#bRanks'));}catch(e){}
})();
