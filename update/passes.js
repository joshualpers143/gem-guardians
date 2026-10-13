// ---------- Game Passes (2026.10.11.27) ----------
// Passes are one-time unlocks owned by a Cloud Save account, so they work on every device. They add
// convenience or looks, never extra power. The server is the only place that can add a pass
// (redeem codes now; verified payments later). The game keeps a copy so passes also work offline.
// Players who played before this update keep x3 Speed for free (a thank-you to early players).
const GG_PASSES={
  speed3:{n:'×3 Speed',i:'⏩',d:'Unlocks Speed ×3 in every battle. Speed ×1 and ×2 stay free for everyone.'},
  afk2:{n:'2× AFK Rewards',i:'🌙',d:'AFK mode gives double gems (10–20 every minute) and a double chance (10%) of a trait reroll.'},
  autosum:{n:'Auto Summon+',i:'🎰',d:'Start Auto Summon with 450 gems or more (instead of more than 1,000). It keeps waiting for gems instead of stopping below 400.'},
  vip:{n:'VIP',i:'👑',d:'A gold name with a crown in the header, your profile and the leaderboards, plus a golden glow under your units in battle. Looks only, no extra power.'}
};
const GG_PASS_KEY='gemGuardiansPasses_'+GG_EDITION,GG_LEGACY_KEY='gemGuardiansLegacyPasses_'+GG_EDITION;
const ggPass=(()=>{let p={};try{p=JSON.parse(localStorage.getItem(GG_PASS_KEY)||'{}')||{}}catch(e){}return {uid:p.uid||null,list:Array.isArray(p.list)?p.list.filter(x=>GG_PASSES[x]):[],at:p.at||0};})();
function ggPassStore(){try{localStorage.setItem(GG_PASS_KEY,JSON.stringify({uid:ggPass.uid,list:ggPass.list,at:ggPass.at}))}catch(e){}}
// Passes the server says this account owns (the cached copy is only used for the same account).
function ggServerPasses(){const s=ggCloud.session;return s&&s.user&&ggPass.uid===s.user.id?ggPass.list:[];}
function ggLegacyPasses(){let dev=false;try{dev=localStorage.getItem(GG_LEGACY_KEY)==='speed3'}catch(e){}return (dev||Array.isArray(S.passLegacy)&&S.passLegacy.includes('speed3'))?['speed3']:[];}
// Creator Edition (private testing build) has every pass.
function ggHasPass(id){if(GG_EDITION!=='public')return true;return ggServerPasses().includes(id)||ggLegacyPasses().includes(id);}
function ggServerHasPass(id){if(GG_EDITION!=='public')return true;return ggServerPasses().includes(id);}
// Early players: anyone with progress from before this update keeps x3 Speed.
function ggPassLegacyCheck(){
  if(S.passLegacyChecked)return;S.passLegacyChecked=true;
  const played=(+S.cleared||0)>0||(+S.playerLevel||1)>1||(+S.playerExp||0)>0||(S.stats&&(+S.stats.waves||0)>0);
  if(played){S.passLegacy=['speed3'];try{localStorage.setItem(GG_LEGACY_KEY,'speed3')}catch(e){}}
  save(false);}
async function ggPassSync(){
  if(GG_EDITION!=='public'||!ggCloud.session||!ggIsOnline())return;
  const r=await ggRpc('my_passes',{},true);if(!r.ok||!Array.isArray(r.data))return;
  ggPass.uid=ggCloud.session.user.id;ggPass.list=r.data.filter(x=>GG_PASSES[x]);ggPass.at=Date.now();ggPassStore();ggPassUI();}
// ----- x3 Speed -----
// Ranked leaderboard runs use what the server knows you own, so every ranked run is timed fairly.
function ggMaxSpeed(){if(!G)return 3;const ranked=G.lbBoard&&!G.lbSkip;return (ranked?ggServerHasPass('speed3'):ggHasPass('speed3'))?3:2;}
function ggSpeedLabel(){const b=$('#bSpd');if(!b||!G)return;const auto=/\(Auto\)/.test(b.textContent);b.textContent='Speed x'+G.speed+(auto&&G.autoSpeed?' (Auto)':'');}
function ggClampSpeed(){if(!G)return;const m=ggMaxSpeed();if(G.speed>m){G.speed=m;ggSpeedLabel();}}
$('#bSpd').onclick=()=>{if(!G)return;const m=ggMaxSpeed();let next=G.speed%3+1;
  if(next>m){next=1;if(!G.speedHint){G.speedHint=true;const ranked=G.lbBoard&&!G.lbSkip&&ggHasPass('speed3');
    toast(ranked?'⏩ Ranked runs use Speed ×3 only when your account owns the ×3 Speed pass.':'⏩ Speed ×3 needs the ×3 Speed pass. See 💎 Passes in the ☰ menu.');}}
  G.speed=next;G.manualSpeed=true;G.autoSpeed=false;$('#bSpd').textContent='Speed x'+G.speed;
  if(G.autoPlay)toast('Speed set manually: Auto Play will keep Speed x'+G.speed+' for this battle.');};
(function(){const o=aiSpeed;aiSpeed=function(){const r=o.apply(this,arguments);try{const m=ggMaxSpeed();if(G&&G.speed>m){G.speed=m;const b=$('#bSpd');if(b)b.textContent='Speed x'+m+' (Auto)';}}catch(e){}return r;};})();
(function(){const o=hud;hud=function(){try{ggClampSpeed()}catch(e){}return o.apply(this,arguments);};})();
setInterval(()=>{try{ggClampSpeed()}catch(e){}},300);
// ----- 2x AFK rewards -----
function ggAfkMult(){return ggHasPass('afk2')?2:1;}
// ----- Auto Summon+ -----
function ggAutoSumPlus(){return ggHasPass('autosum');}
refreshAutoSummonUI=function(){
  const btn=$('#autoSummonToggle'),status=$('#autoSummonStatus');if(!btn||!status)return;const plus=ggAutoSumPlus(),need=plus?450:1001;
  btn.textContent=autoSummonActive?'■ Stop Auto Summon':'▶ Auto Summon ×10'+(plus?' +':'');
  btn.disabled=!autoSummonActive&&S.gems<need;
  status.textContent=autoSummonActive?(S.gems<450?(plus?'Auto Summon+: waiting for 450 gems…':'Waiting for 450 gems to summon ×10…'):'Auto summoning ×10 for 450 gems'):(S.gems>=need?'Ready — summon ×10 automatically':(plus?'Auto Summon+: needs 450 gems to start':'Requires more than 1,000 gems to start; stops below 400 gems'));};
$('#autoSummonToggle').onclick=()=>{
  const plus=ggAutoSumPlus();
  if(autoSummonActive){autoSummonActive=false;toast('Auto Summon stopped');}
  else if(S.gems>1000||plus&&S.gems>=450){autoSummonActive=true;toast('Auto Summon'+(plus?'+':'')+' started: ×10 pulls');}
  else toast(plus?'Auto Summon+ needs 450 gems to start':'More than 1,000 gems required to start Auto Summon (Auto Summon+ starts at 450)');
  refreshAutoSummonUI();};
// ----- VIP looks -----
function ggVipUI(){const on=ggHasPass('vip');document.body.classList.toggle('gg-vip',on);
  const pc=$('#profileModal .profile-card');if(pc){let b=$('#ggVipBadge');if(on&&!b){pc.querySelector('h2').insertAdjacentHTML('afterend','<span id="ggVipBadge" class="gg-vip-badge">👑 VIP</span>');}else if(!on&&b)b.remove();}}
(function(){const o=drawPathBadges;drawPathBadges=function(){const r=o.apply(this,arguments);try{
  if(G&&!ggFx.perf&&ggHasPass('vip')&&G.us.length){const t=performance.now()/600;cx.save();
    for(const u of G.us){const a=.35+.15*Math.sin(t+u.x*.05);cx.strokeStyle='rgba(250,204,21,'+a.toFixed(2)+')';cx.lineWidth=2;cx.beginPath();cx.ellipse(u.x,u.y+13,15,5,0,0,7);cx.stroke();}
    cx.restore();}}catch(e){}return r;};})();
// Leaderboards: crown and gold name for VIP players.
(function(){const o=ggRpc;ggRpc=async function(fn){const r=await o.apply(this,arguments);if(fn==='lb_top'&&r&&r.ok&&Array.isArray(r.data))ggLb.lastTop=r.data;return r;};})();
(function(){const o=ggLbRender;ggLbRender=async function(){const r=await o.apply(this,arguments);try{
  const rows=ggLb.lastTop||[];document.querySelectorAll('#ggLbList .gg-lb-row').forEach((li,i)=>{const d=rows[i];if(d&&d.vip&&!li.classList.contains('vip')){li.classList.add('vip');const n=li.querySelector('.gg-lb-name');if(n)n.insertAdjacentHTML('afterbegin','<span class="gg-lb-crown" title="VIP">👑</span>');}});}catch(e){}return r;};})();
// ----- Passes window -----
document.body.insertAdjacentHTML('beforeend','<div id="ggShop" class="settings-panel hide" role="dialog" aria-modal="true" aria-labelledby="ggShopTitle"><div class="settings-box gg-shop-box"><div class="row" style="justify-content:space-between;align-items:center"><h2 id="ggShopTitle">💎 Game Passes</h2><button class="alt" id="ggShopClose">Close ✕</button></div>'
 +'<p class="gg-shop-intro">One-time unlocks saved to your Cloud Save account, so they work on every device. Passes add convenience or looks, <b>never extra power</b>.</p>'
 +'<div id="ggShopList" class="gg-shop-list"></div>'
 +'<div class="gg-shop-redeem"><b>🎟️ Redeem a code</b><div id="ggShopRedeemBody"></div><p id="ggShopMsg" class="gg-shop-msg hide" role="status"></p></div>'
 +'<small class="gg-shop-note">Buying passes with real money is coming soon. Until then, passes come from codes (events, gifts and founder rewards).</small></div></div>');
function ggShopOpen(focus){$('#ggShop').classList.remove('hide');ggShopRender();ggPassSync().then(ggShopRender);if(focus){const c=$('#ggPass_'+focus);if(c){c.classList.add('gg-shop-flash');setTimeout(()=>c.classList.remove('gg-shop-flash'),1600);c.scrollIntoView({block:'nearest'});}}}
$('#ggShopClose').onclick=()=>$('#ggShop').classList.add('hide');
$('#ggShop').addEventListener('click',e=>{if(e.target.id==='ggShop')$('#ggShop').classList.add('hide');});
function ggShopMsg(t,k){const m=$('#ggShopMsg');m.textContent=t||'';m.className='gg-shop-msg'+(k?' '+k:'');m.classList.toggle('hide',!t);}
function ggShopRender(){
  const server=ggServerPasses(),legacy=ggLegacyPasses(),cre=GG_EDITION!=='public';
  $('#ggShopList').innerHTML=Object.entries(GG_PASSES).map(([id,p])=>{
    const own=cre||server.includes(id),leg=!own&&legacy.includes(id);
    const st=cre?'<span class="gg-pass-own">✓ Unlocked in Creator Edition</span>':own?'<span class="gg-pass-own">✓ Owned</span>':leg?'<span class="gg-pass-own">✓ Free for early players — thank you!</span>':'<button class="alt" disabled>Coming soon</button>';
    const extra=leg&&id==='speed3'?'<small class="gg-pass-sub">Ranked leaderboard runs need the pass on your account. Accounts that existed before this update already have it.</small>':'';
    return '<div class="gg-pass'+(own||leg?' owned':'')+'" id="ggPass_'+id+'"><div class="gg-pass-ico">'+p.i+'</div><div class="gg-pass-txt"><b>'+p.n+'</b><small>'+p.d+'</small>'+extra+'</div><div class="gg-pass-act">'+st+'</div></div>';}).join('');
  const body=$('#ggShopRedeemBody');
  if(cre){body.innerHTML='<small>Codes are redeemed in the Public Edition.</small>';return;}
  if(!ggCloud.session){body.innerHTML='<small>Sign in to Cloud Save so your passes are saved to your account.</small> <button class="gg-linkbtn" id="ggShopSignIn">Sign in</button>';$('#ggShopSignIn').onclick=()=>{$('#ggShop').classList.add('hide');ggGoToCloudSave();};return;}
  if(!$('#ggCodeIn')){body.innerHTML='<div class="row"><input id="ggCodeIn" maxlength="40" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Enter code" aria-label="Redeem code"><button id="ggCodeGo">Redeem</button></div>';
    ggNetTag('#ggCodeGo','Redeeming a code');$('#ggCodeGo').onclick=ggRedeem;$('#ggCodeIn').addEventListener('keydown',e=>{if(e.key==='Enter')ggRedeem();});}
  try{ggNetApply()}catch(e){}}
const GG_CODE_WHY={invalid:'That code does not exist. Check it and try again.',used:'That code has already been used up.',expired:'That code has expired.',already:'You already redeemed this code.',slow:'Too many wrong codes. Please wait an hour and try again.',signin:'Sign in to Cloud Save first.'};
async function ggRedeem(){
  const v=($('#ggCodeIn').value||'').trim();if(!v)return ggShopMsg('Type a code first.','bad');
  if(!ggOnlineGate('Redeeming a code'))return;
  $('#ggCodeGo').disabled=true;ggShopMsg('Checking code…','');
  const r=await ggRpc('redeem_code',{p_code:v},true);$('#ggCodeGo').disabled=false;
  if(!r.ok)return ggShopMsg(ggCloudErr(r),'bad');
  const d=r.data||{};if(!d.ok)return ggShopMsg(GG_CODE_WHY[d.reason]||'That code cannot be used.','bad');
  if(Array.isArray(d.owned)){ggPass.uid=ggCloud.session.user.id;ggPass.list=d.owned.filter(x=>GG_PASSES[x]);ggPass.at=Date.now();ggPassStore();}
  $('#ggCodeIn').value='';const got=(d.passes||[]).map(x=>GG_PASSES[x]?GG_PASSES[x].i+' '+GG_PASSES[x].n:x);
  ggShopMsg(got.length?'🎉 Unlocked: '+got.join(', ')+'!':'Code redeemed. You already owned everything in it.','good');
  if(got.length)toast('🎉 Unlocked: '+got.join(', '));ggPassUI();ggShopRender();}
// Small hints where passes matter.
function ggPassUI(){try{ggVipUI()}catch(e){}try{refreshAutoSummonUI()}catch(e){}try{ggClampSpeed()}catch(e){}
  const a=$('#ggAfkPass');if(a){const on=ggHasPass('afk2');a.innerHTML=on?'🌙 <b>2× AFK Rewards</b> active: 10–20 gems a minute and a 10% reroll chance.':'🌙 Want double AFK rewards? <button class="gg-linkbtn" data-pass="afk2">See the 2× AFK Rewards pass</button>';a.classList.toggle('on',on);}
  const s=$('#ggSumPass');if(s){const on=ggHasPass('autosum');s.innerHTML=on?'🎰 <b>Auto Summon+</b> active: starts at 450 gems and waits for more gems.':'🎰 <button class="gg-linkbtn" data-pass="autosum">Auto Summon+</button> starts at 450 gems and never stops early.';}
  try{if(!$('#ggShop').classList.contains('hide'))ggShopRender();}catch(e){}}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-pass]');if(b){e.preventDefault();ggShopOpen(b.dataset.pass);}});
(function(){
  const q=$('#bQol');if(q&&!$('#bPasses')){q.insertAdjacentHTML('beforebegin','<button class="alt hdr-more" id="bPasses">💎 Passes</button>');
    $('#bPasses').addEventListener('click',()=>{ggShopOpen();const h=$('header');if(h)h.classList.remove('more-open');const m=$('#bMore');if(m)m.setAttribute('aria-expanded','false');});}
  const afkBtn=$('#enterAfk');if(afkBtn&&!$('#ggAfkPass'))afkBtn.insertAdjacentHTML('afterend','<p id="ggAfkPass" class="gg-pass-hint"></p>');
  const st=$('#autoSummonStatus');if(st&&!$('#ggSumPass'))st.insertAdjacentHTML('afterend','<small id="ggSumPass" class="gg-pass-hint"></small>');
  try{if(typeof ggIconize==='function')ggIconize($('#bPasses'));}catch(e){}
})();
// Keep passes in step with the account.
(function(){const o=ggCloudAfterLogin;ggCloudAfterLogin=async function(){const r=await o.apply(this,arguments);await ggPassSync();return r;};})();
(function(){const o=ggCloudSignOut;ggCloudSignOut=async function(){const r=await o.apply(this,arguments);ggPass.uid=null;ggPass.list=[];ggPassStore();ggPassUI();return r;};})();
(function(){const o=ggCloudDelete;ggCloudDelete=async function(){const r=await o.apply(this,arguments);if(!ggCloud.session){ggPass.uid=null;ggPass.list=[];ggPassStore();ggPassUI();}return r;};})();
// Imported or restored saves are checked for early-player x3 Speed too.
(function(){const o=importSaveText;importSaveText=async function(){const r=await o.apply(this,arguments);try{ggPassLegacyCheck();ggPassUI();}catch(e){}return r;};})();
window.addEventListener('online',()=>setTimeout(ggPassSync,2500));
setInterval(()=>{if(document.visibilityState==='visible')ggPassSync();},300000);
ggPassLegacyCheck();ggPassUI();setTimeout(ggPassSync,3000);
