// ---------- Restart Map, Offline Lock & one Secret per banner (2026.10.11.26) ----------
// 1) Restart Map: start the current map again from wave 1 at any time. A restart ends the run with no
//    rewards (so it can never be used to farm loss rewards) and a ranked run that is restarted does not count.
// 2) Offline Lock: the game checks whether it can really reach the game server (the phone's own
//    "online" signal is often wrong). While offline, every online feature is locked: Cloud Save, player
//    names and leaderboards, plus anything added later through ggOnlineGate(). Gameplay and saving on
//    this device keep working. Everything unlocks by itself when the connection comes back.
// ===== Offline Lock =====
const ggNet={online:navigator.onLine!==false,checked:false,checking:null,lastOk:0};
const GG_NET_MSG='You are offline. Online features (Cloud Save, player names and leaderboards) are locked until you reconnect. Your game keeps saving on this device.';
// Any answer from the game server means the connection works; only a failed request means offline.
const ggNetFetch1=ggCloudFetch1;
ggCloudFetch1=async function(path,opt){
  const ping=opt&&opt._ping;
  if(!ping&&!ggIsOnline())return {ok:false,status:0,data:null,offline:true};
  const r=await ggNetFetch1(path,opt);
  if(r.status===0){if(navigator.onLine===false||ping||Date.now()-ggNet.lastOk>4000)ggNetSet(false);}
  else{ggNet.lastOk=Date.now();ggNetSet(true);}
  return r;};
ggIsOnline=function(){return navigator.onLine!==false&&ggNet.online;};
// Check the connection now. Returns true when the game server can be reached.
function ggNetCheck(){
  if(navigator.onLine===false){ggNetSet(false);return Promise.resolve(false);}
  if(ggNet.checking)return ggNet.checking;
  ggNet.checking=ggCloudFetch1('/auth/v1/health',{_ping:true}).then(r=>r.status!==0).catch(()=>false).finally(()=>{ggNet.checking=null;});
  return ggNet.checking;}
function ggNetSet(on){on=!!on&&navigator.onLine!==false;const first=!ggNet.checked;ggNet.checked=true;
  if(on===ggNet.online&&!first){return;}
  const was=ggNet.online;ggNet.online=on;ggNetApply();
  if(!first&&was!==on){toast(on?'✅ Back online. Online features are unlocked.':'📴 '+GG_NET_MSG);
    if(on){setTimeout(()=>{try{ggCloudAuto()}catch(e){}try{ggLbFlush()}catch(e){}try{if(ggCloud.session)ggNameSync(false)}catch(e){}},800);}}}
// Use from any online feature: if(!ggOnlineGate('The shop'))return;
function ggOnlineGate(what){if(ggIsOnline())return true;toast('📴 '+(what||'This feature')+' needs an internet connection. Connect and try again.');return false;}
// Buttons that need the internet: tagged with data-gg-online="<feature name>".
function ggNetTag(sel,what){const el=typeof sel==='string'?$(sel):sel;if(el)el.dataset.ggOnline=what;return el;}
window.addEventListener('click',e=>{const el=e.target&&e.target.closest&&e.target.closest('[data-gg-online]');if(!el||ggIsOnline())return;
  e.preventDefault();e.stopImmediatePropagation();ggOnlineGate(el.dataset.ggOnline);ggNetCheck();},true);
function ggNetApply(){
  const off=!ggIsOnline();document.body.classList.toggle('gg-offline',off);
  const b=$('#ggNetBadge');if(b)b.classList.toggle('hide',!off);
  document.querySelectorAll('[data-gg-online]').forEach(el=>{el.classList.toggle('gg-net-locked',off);if(off)el.setAttribute('aria-disabled','true');else el.removeAttribute('aria-disabled');});
  ggNetCloudLock();
  try{if(!$('#ggLbModal').classList.contains('hide'))ggLbRender();}catch(e){}
  try{if(!$('#ggNameModal').classList.contains('hide'))ggNameCheck();}catch(e){}}
// Cloud Save panel: show why it is locked and disable its controls while offline.
function ggNetCloudLock(){
  const box=$('#ggCloud');if(!box)return;const off=!ggIsOnline();
  // The Choose-your-name button is an online feature too.
  const pick=ggNetTag('#ggNamePick','Choosing a player name');if(pick)pick.classList.toggle('gg-net-locked',off);
  let n=$('#ggCloudOffline');if(!n){box.querySelector(':scope > small').insertAdjacentHTML('afterend','<p id="ggCloudOffline" class="gg-net-note hide" role="status"></p>');n=$('#ggCloudOffline');}
  n.innerHTML=off?'📴 <b>Offline</b> · Cloud Save is locked until you reconnect. Your progress is still saved on this device. <button class="gg-linkbtn" id="ggNetRetry">Check again</button>':'';
  n.classList.toggle('hide',!off);if(off)$('#ggNetRetry').onclick=ggNetRetry;
  box.querySelectorAll('#ggCloudBody button,#ggCloudBody input,#ggCloudChoice button').forEach(el=>{
    if(off){if(!el.disabled){el.disabled=true;el.dataset.ggNetOff='1';}}
    else if(el.dataset.ggNetOff){el.disabled=false;delete el.dataset.ggNetOff;}});}
async function ggNetRetry(){toast('Checking your connection…');const on=await ggNetCheck();if(!on)toast('📴 Still offline. '+'Online features stay locked until the game server can be reached.');}
// Redraws of the Cloud panel keep the lock.
(function(){const o=ggCloudRender;ggCloudRender=function(){const r=o.apply(this,arguments);try{ggNetCloudLock()}catch(e){}return r;};})();
(function(){const o=ggCloudChoose;ggCloudChoose=function(){const r=o.apply(this,arguments);try{ggNetCloudLock()}catch(e){}return r;};})();
// Clear offline messages everywhere.
(function(){const o=ggCloudErr;ggCloudErr=function(res){if((!res||res.status===0)&&!ggIsOnline())return 'You are offline. Your game is still saved on this device.';return o.apply(this,arguments);};})();
// Automatic backups never try while offline.
(function(){const o=ggCloudAuto;ggCloudAuto=function(){if(!ggIsOnline())return Promise.resolve();return o.apply(this,arguments);};})();
// Header badge, tagged buttons and connection checks.
(function(){
  const q=$('#bQuests');if(q&&!$('#ggNetBadge')){q.insertAdjacentHTML('beforebegin','<button class="alt gg-net-badge hide" id="ggNetBadge" title="You are offline. Tap to check again." aria-label="Offline. Online features are locked. Tap to check the connection again.">📴 Offline</button>');
    $('#ggNetBadge').onclick=()=>{toast('📴 '+GG_NET_MSG);ggNetCheck();};}
  ggNetTag('#bRanks','Leaderboards');ggNetTag('#ggLbFromBattle','Leaderboards');ggNetTag('#ggLbFromRaid','Leaderboards');
  window.addEventListener('online',()=>{ggNetCheck();});
  window.addEventListener('offline',()=>ggNetSet(false));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ggNetCheck();});
  // Re-check every 20 seconds while offline (to unlock quickly) and every 2 minutes while online.
  let tick=0;setInterval(()=>{if(document.visibilityState==='hidden')return;tick++;if(!ggIsOnline()||tick%6===0)ggNetCheck();},20000);
  ggNetApply();setTimeout(ggNetCheck,1200);
})();
ggCloudView='';ggCloudRender();
(function(){const pl=[...document.querySelectorAll('#settingsModal p')].find(p=>/Nothing leaves your device unless you sign in/.test(p.textContent));
  if(pl)pl.insertAdjacentHTML('beforeend',' The game only checks whether its server can be reached (no personal data is sent).');})();
// ===== Restart Map =====
// A button next to Leave stage (also in fullscreen). Asks first inside the battle screen, so fullscreen stays on.
(function(){
  const q=$('#bQuit');if(!q||$('#bRestartMap'))return;
  q.insertAdjacentHTML('beforebegin','<button class="alt" id="bRestartMap" title="Start this map again from wave 1">↻ Restart Map</button>');
  const wrap=$('#arena .battle-canvas-wrap');
  wrap.insertAdjacentHTML('beforeend','<div id="ggRestartAsk" class="gg-restart-ask hide" role="dialog" aria-modal="true" aria-labelledby="ggRestartTitle"><div class="gg-restart-card"><b id="ggRestartTitle">↻ Restart this map?</b><p id="ggRestartText"></p><div class="row"><button id="ggRestartYes">Restart</button><button class="alt" id="ggRestartNo">Keep playing</button></div></div></div>');
  let wasPaused=false;
  const close=()=>{$('#ggRestartAsk').classList.add('hide');if(G&&!G.over){G.paused=wasPaused;$('#bPause').textContent=G.paused?'Resume':'Pause';}};
  $('#bRestartMap').onclick=()=>{
    if(!G)return;
    if(typeof guide!=='undefined'&&guide.active)return toast('Restart Map is available after the tutorial.');
    // Nothing to lose yet (or the map already ended): restart right away.
    if(G.over||(G.wave===0&&!G.us.length))return ggRestartMapNow();
    const lines=['The current run ends now and starts again from wave 1. You get <b>no rewards</b> for a restarted run.'];
    if(G.mode==='infinite')lines.push('To keep your Infinite Mode rewards, use <b>End Run</b> instead.');
    if(G.lbBoard&&G.lbRun)lines.push('This ranked run will not count on the leaderboard. The new run starts a new one.');
    $('#ggRestartText').innerHTML=lines.join('<br>');
    wasPaused=!!G.paused;G.paused=true;$('#bPause').textContent='Resume';
    $('#ggRestartAsk').classList.remove('hide');$('#ggRestartYes').focus();};
  $('#ggRestartNo').onclick=close;
  $('#ggRestartYes').onclick=()=>{$('#ggRestartAsk').classList.add('hide');ggRestartMapNow();};
  // Close the question if the battle ends or is left while it is open.
  (function(){const o=finish;finish=function(){$('#ggRestartAsk').classList.add('hide');return o.apply(this,arguments);};})();
  const oq=q.onclick;q.onclick=function(e){$('#ggRestartAsk').classList.add('hide');return oq&&oq.call(this,e);};
  try{if(typeof ggIconize==='function')ggIconize($('#bRestartMap'));}catch(e){}
})();
function ggRestartMapNow(){
  const old=G;if(!old)return;
  const {si,mode,raidLevel=0}=old,keepSpeed=old.speed||1,keepManual=!!old.manualSpeed,wasAuto=!!old.autoPlay;
  // End the old run quietly: no rewards, no leaderboard result, no auto restart.
  old.over=true;old.restarted=true;old.lbDone=true;old.restartTimer=0;
  $('#ggRestartAsk').classList.add('hide');
  startBattle(si,mode,raidLevel);
  if(G===old){toast('This map cannot be restarted right now.');return;}
  G.speed=keepSpeed;G.manualSpeed=keepManual;$('#bSpd').textContent='Speed x'+G.speed;
  if(wasAuto&&autoPlayEligible(si,mode,raidLevel)){G.autoPlay=true;G.autoPlayTimer=0;G.autoPlayStartDelay=3;G.autoSpeed=!G.manualSpeed;G.autoUpgrade=false;
    $('#bAutoPlay').textContent='Auto Play: ON';$('#bAutoPlay').setAttribute('aria-pressed','true');}
  hud();try{syncScreenWake()}catch(e){}
  toast('↻ Map restarted from wave 1');}
