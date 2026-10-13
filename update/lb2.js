// ---------- Leaderboards: Most time played & Most summons (2026.10.11.31) ----------
// Both totals are kept on the server. About once a minute while the game is open on screen, a signed-in
// player with a claimed name sends a heartbeat. The server adds the real time since the account's last
// heartbeat (at most 65 seconds, nothing after a break) and accepts summons at a realistic rate.
// Summons made while signed in are counted, also offline; they are sent when the game is back online.
const GG_LB2_KEY='gemGuardiansLbStats_'+GG_EDITION;
const ggLb2=(()=>{let p={};try{p=JSON.parse(localStorage.getItem(GG_LB2_KEY)||'{}')||{}}catch(e){}
  return {uid:p.uid||null,pending:Math.max(0,Math.floor(+p.pending||0)),busy:false,seconds:+p.seconds||0,summons:+p.summons||0};})();
function ggLb2Store(){try{localStorage.setItem(GG_LB2_KEY,JSON.stringify({uid:ggLb2.uid,pending:ggLb2.pending,seconds:ggLb2.seconds,summons:ggLb2.summons}))}catch(e){}}
function ggLb2Eligible(){return GG_EDITION==='public'&&ggCanJoinLeaderboards();}
function ggLb2Account(){const uid=ggCloud.session&&ggCloud.session.user&&ggCloud.session.user.id;if(uid&&ggLb2.uid!==uid){ggLb2.uid=uid;ggLb2.pending=0;ggLb2.seconds=0;ggLb2.summons=0;ggLb2Store();}return uid;}
// Count summons (a ×10 counts as 10).
(function(){const o=pull;pull=function(n){const pre=S.gems;const r=o.apply(this,arguments);
  try{if(S.gems<pre&&ggLb2Eligible()&&ggLb2Account()){ggLb2.pending+=n===10?10:1;ggLb2Store();}}catch(e){}return r;};})();
async function ggLb2Beat(){
  if(ggLb2.busy||!ggLb2Eligible()||!ggIsOnline()||!ggLb2Account())return null;ggLb2.busy=true;
  try{const send=Math.min(ggLb2.pending,100000);
    const r=await ggRpc('lb_heartbeat',{p_summons:send,p_version:GAME_VERSION},true);
    if(r.ok&&r.data&&r.data.ok){const took=Math.max(0,Math.floor(+r.data.summons_taken||0));ggLb2.pending=Math.max(0,ggLb2.pending-took);
      ggLb2.seconds=+r.data.seconds||0;ggLb2.summons=+r.data.summons||0;ggLb2Store();return r.data;}
    return null;}finally{ggLb2.busy=false;}}
setInterval(()=>{if(document.visibilityState==='visible')ggLb2Beat();},60000);
document.addEventListener('visibilitychange',()=>ggLb2Beat());
window.addEventListener('online',()=>setTimeout(ggLb2Beat,2000));
(function(){const o=ggCloudAfterLogin;ggCloudAfterLogin=async function(){const r=await o.apply(this,arguments);ggLb2Beat();return r;};})();
setTimeout(ggLb2Beat,5000);
// ----- Leaderboard window: two new tabs -----
function ggLbFmtPlayed(s){s=Math.max(0,Math.floor(+s||0));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h.toLocaleString()+'h '+m+'m':m?m+'m':s+'s';}
(function(){const o=ggLbScore;ggLbScore=function(b,v,s){if(b==='time')return ggLbFmtPlayed(v);if(b==='summons')return Number(v||0).toLocaleString()+' summons';return o.apply(this,arguments);};})();
(function(){const o=ggLbBoardName;ggLbBoardName=function(b){if(b==='time')return 'Most time played';if(b==='summons')return 'Most summons';return o.apply(this,arguments);};})();
(function(){const tabs=document.querySelector('#ggLbModal .gg-lb-tabs');if(!tabs||tabs.querySelector('[data-lbt="time"]'))return;
  tabs.insertAdjacentHTML('beforeend','<button role="tab" data-lbt="time">⏱️ Time played</button><button role="tab" data-lbt="summons">🎰 Summons</button>');
  tabs.querySelectorAll('[data-lbt="time"],[data-lbt="summons"]').forEach(b=>b.onclick=()=>{ggLb.tab=b.dataset.lbt;ggLbRender();});
  const rules=document.querySelector('#ggLbModal .gg-lb-rules');if(rules)rules.insertAdjacentHTML('beforeend',' Time played counts while the game is open on your screen and you are signed in; summons count while you are signed in. Both started counting with this update.');})();
(function(){const o=ggLbRender;ggLbRender=async function(){
  if(ggLb.tab!=='time'&&ggLb.tab!=='summons')return o.apply(this,arguments);
  try{localStorage.setItem('gemGuardiansLbView',JSON.stringify({tab:ggLb.tab,map:ggLb.map}))}catch(e){}
  document.querySelectorAll('[data-lbt]').forEach(b=>{const on=b.dataset.lbt===ggLb.tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on);});
  $('#ggLbMapRow').classList.add('hide');const board=ggLb.tab;
  $('#ggLbHint').textContent=board==='time'?'Total time with the game open on your screen while signed in.':'Total summons made while signed in (a ×10 counts as 10).';
  const el=$('#ggLbElig');const why=GG_EDITION!=='public'?'Creator Edition does not count on the public leaderboards.':ggLeaderboardBlockReason();
  el.innerHTML=why?'<div class="gg-lb-elig"><span>'+ggEsc(why)+'</span>'+(GG_EDITION==='public'?'<button id="ggLbJoin">'+(ggCloud.session?'Claim name':'Sign in')+'</button>':'')+'</div>':'';
  const jb=$('#ggLbJoin');if(jb)jb.onclick=()=>{$('#ggLbModal').classList.add('hide');if(ggCloud.session)ggNameOpen();else ggGoToCloudSave();};
  const list=$('#ggLbList'),me=$('#ggLbMe');const seq=++ggLb.seq;list.innerHTML='<li class="gg-lb-empty">Loading…</li>';me.classList.add('hide');
  if(!ggIsOnline()){list.innerHTML='<li class="gg-lb-empty">You are offline. Connect to the internet to see the leaderboard.</li>';return;}
  if(!why)await ggLb2Beat();if(seq!==ggLb.seq)return;
  const top=await ggRpc('lb_top',{p_board:board,p_limit:50},!!ggCloud.session);if(seq!==ggLb.seq)return;
  if(!top.ok||!Array.isArray(top.data)){list.innerHTML='<li class="gg-lb-empty">'+ggEsc(ggCloudErr(top))+'</li>';return;}
  list.innerHTML=top.data.length?top.data.map(r=>'<li class="gg-lb-row'+(r.is_me?' me':'')+(r.rank<=3?' top'+r.rank:'')+(r.vip?' vip':'')+'"><span class="gg-lb-rank">'+(r.rank<=3?['🥇','🥈','🥉'][r.rank-1]:'#'+r.rank)+'</span><span class="gg-lb-name">'+(r.vip?'<span class="gg-lb-crown" title="VIP">👑</span>':'')+ggEsc(r.name)+(r.is_me?' <small>(you)</small>':'')+'</span><span class="gg-lb-val">'+ggEsc(ggLbScore(board,r.value,r.seconds))+'</span></li>').join(''):'<li class="gg-lb-empty">No one is on this board yet. Play while signed in to be the first!</li>';
  if(ggCanJoinLeaderboards()){const m=await ggRpc('lb_me',{p_board:board},true);if(seq!==ggLb.seq)return;
    if(m.ok&&m.data&&m.data.rank){me.innerHTML='Your total: <b>'+ggEsc(ggLbScore(board,m.data.value,m.data.seconds))+'</b> · Rank <b>#'+m.data.rank+'</b> of '+m.data.total;me.classList.remove('hide');}
    else{me.textContent=board==='time'?'Your time starts counting while the game is open and you are signed in.':'Your summons start counting from your next summon while signed in.';me.classList.remove('hide');}}};})();
