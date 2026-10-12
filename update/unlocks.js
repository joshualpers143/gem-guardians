// ---------- Level unlocks & system tutorials (2026.10.11.16) ----------
// New players start with Summon, Battle, Units, Bag and Quests. Other systems unlock with
// Player Level; each unlock shows a "New system unlocked" card with a short hands-on tutorial.
// Players who already had progress before this update keep every system (except Raids, which
// always needed Level 25).
const GG_FEATURES=[
 {id:'index',lv:2,tab:'index',icon:'book',n:'Index',d:'See every unit, enemy and item you have found. Each new unit you discover pays a one-time gem reward here.'},
 {id:'traits',lv:3,tab:'traits',icon:'sparkle',n:'Trait Forge',d:'Give a unit a permanent bonus such as extra damage, range or attack speed. You already own 25 free Trait Rerolls.'},
 {id:'afk',lv:4,tab:'afk',icon:'moon',n:'AFK Rewards',d:'Leave AFK mode open to earn gems every minute, with a small chance of a Trait Reroll.'},
 {id:'team5',lv:5,icon:'shield',n:'5th Team Slot & Auto Play',d:'You can equip a fifth unit, and Auto Play can finish maps where you already earned 3 stars.'},
 {id:'paths',lv:6,icon:'swords',n:'Upgrade Paths',d:'When a placed unit reaches Boost 3, you choose one of two specializations. Until now, units took their recommended path automatically.'},
 {id:'prestige',lv:10,icon:'star',n:'Prestige & 6th Team Slot',d:'Units that reach level 100 can prestige for permanent stars, and you can equip a sixth unit.'},
 {id:'raids',lv:25,tab:'raids',icon:'swords',n:'Raids',d:'Fight through Duskmoor Castle on Hell difficulty for big rewards and a 5% chance at Count Vesper on Level 5.'}
];
const GG_FEATURE=Object.fromEntries(GG_FEATURES.map(f=>[f.id,f]));
function ggEnsureUnlockState(){
  if(Array.isArray(S.unlockSeen)&&Array.isArray(S.unlockGrand)){S.unlockSeen=S.unlockSeen.filter(id=>GG_FEATURE[id]);S.unlockGrand=S.unlockGrand.filter(id=>GG_FEATURE[id]&&id!=='raids');return;}
  const existing=S.playerLevel>1||(S.cleared||0)>0||S.units.length>1;
  S.unlockGrand=existing?GG_FEATURES.filter(f=>f.id!=='raids').map(f=>f.id):[];
  S.unlockSeen=existing?GG_FEATURES.filter(f=>f.id!=='raids'||f.lv<=S.playerLevel).map(f=>f.id):[];
  try{save(false)}catch(e){}
}
function ggFeatureOn(id){const f=GG_FEATURE[id];if(!f)return true;ggEnsureUnlockState();return S.playerLevel>=f.lv||S.unlockGrand.includes(id);}
function ggRefreshLocks(){
  ggEnsureUnlockState();
  for(const f of GG_FEATURES){if(!f.tab)continue;const b=document.querySelector('.tabs button[data-tab="'+f.tab+'"]');if(!b)continue;
    const locked=!ggFeatureOn(f.id);b.classList.toggle('tab-locked',locked);b.setAttribute('aria-disabled',String(locked));
    let tag=b.querySelector('.tab-lock');if(locked&&!tag){tag=document.createElement('span');tag.className='tab-lock';b.appendChild(tag);}
    if(tag){if(locked)tag.innerHTML=GGI.lock+'Lv '+f.lv;else tag.remove();}
    b.title=locked?f.n+' unlocks at Player Level '+f.lv:'';
    if(locked&&b.classList.contains('on'))document.querySelector('.tabs button[data-tab="summon"]')?.click();}
}
// Locked tabs refuse clicks (real taps and code) with a friendly message.
document.querySelector('.tabs')?.addEventListener('click',e=>{const b=e.target.closest('button[data-tab]');if(!b)return;
  const f=GG_FEATURES.find(x=>x.tab===b.dataset.tab);if(f&&!ggFeatureOn(f.id)){e.stopImmediatePropagation();e.preventDefault();toast('🔒 '+f.n+' unlocks at Player Level '+f.lv+'. Win battles to earn Player EXP.');}},true);
// Prestige waits for its unlock level.
(function(){const orig=prestige;prestige=function(uid){if(!ggFeatureOn('prestige'))return toast('🔒 Prestige unlocks at Player Level '+GG_FEATURE.prestige.lv+'.');return orig.apply(this,arguments);};})();
// Before Upgrade Paths unlock, Boost 3 is a normal upgrade that applies the recommended path.
(function(){const orig=selUI;selUI=function(){const r=orig.apply(this,arguments);try{
  const u=G&&G.sel,box=document.querySelector('#unitQuick .quick-paths');
  if(u&&box&&!ggFeatureOn('paths')){const cost=boostCost(u),p=PATH_BY_KEY[defaultPath(u)];const b=document.createElement('button');b.id='bUp';b.textContent='⬆ Boost · '+cost+' coins';b.title='Applies '+p.n+' ('+p.d+')';
    box.replaceWith(b);b.onclick=()=>{if(!upgradePlacedUnit(u))toast('Not enough coins or already max boosted');};positionQuick();}}catch(e){}return r;};})();
// Daily quests never ask for a system the player has not unlocked yet.
(function(){const orig=questsForDay;questsForDay=function(day){const out=orig.apply(this,arguments);if(ggFeatureOn('traits'))return out;
  return out.map(q=>{if(q.stat!=='rerolls')return q;return QUEST_POOL.find(x=>x.stat!=='rerolls'&&!out.some(o=>o.stat===x.stat))||q;});};})();
// ---- System tutorials (use the guided-tutorial panel) ----
const GG_FEATURE_GUIDES={
 index:[
  {title:'📖 Open the Index',text:'Tap the glowing Index tab.',target:()=>tabBtn('index'),done:()=>tabOpen('index')},
  {title:'💎 Claim discovery rewards',text:'Every unit you discover has a one-time gem reward. Tap “Claim” on a unit card. Tap any discovered card to read its full skills. The Enemies tab describes every enemy you have met.',target:()=>document.querySelector('#indexGrid button[data-claim]')||document.querySelector('#indexTabs'),info:true,last:true}],
 traits:[
  {title:'✨ Open the Trait Forge',text:'Tap the glowing Traits tab.',target:()=>tabBtn('traits'),done:()=>tabOpen('traits')},
  {title:'✨ Reroll a trait',text:'Pick a unit, then tap “Reroll trait”. Each reroll uses one Trait Reroll crystal (you have {rerolls}); with none left it costs 30 gems. Rarer traits are stronger.',
   enter:b=>{b.rr=S.traitRerolls;b.gems=S.gems},target:()=>tabOpen('traits')?$('#traitRoll'):tabBtn('traits'),done:b=>S.traitRerolls<b.rr||S.gems<b.gems,skippable:true},
  {title:'💎 Getting more rerolls',text:'Trait Rerolls come from AFK mode, Player Level rewards every 5 levels, and boss waves on Hard or Hell. Every 150th reroll without a Mythic trait guarantees one.',info:true,last:true}],
 afk:[
  {title:'🌙 Open AFK',text:'Tap the glowing AFK tab.',target:()=>tabBtn('afk'),done:()=>tabOpen('afk')},
  {title:'🌙 Earn while away',text:'Tap “Enter AFK Mode” and leave it open. Every full minute adds 5–10 gems, with a 5% chance of a Trait Reroll. Leaving resets the timer, but rewards you earned stay saved until you claim them.',target:()=>$('#enterAfk'),info:true,last:true}],
 team5:[
  {title:'🛡️ A fifth unit',text:'Open the Units tab and tap “＋ Equip” on another unit. More units in battle means more coverage on long roads.',target:()=>tabOpen('units')?(firstEquipBtn()||$('#loadoutSlots')):tabBtn('units'),done:()=>(S.equipped||[]).length>=Math.min(unlockedLoadoutSlots(),S.units.length),skippable:true},
  {title:'🤖 Auto Play',text:'On any map where you earned 3 stars, “Auto Play” in battle places and upgrades units for you. It is great for farming fruit and gems.',info:true,last:true}],
 paths:[
  {title:'⚔️ Upgrade Paths',text:'In battle, tap a placed unit at Boost 2. Instead of one upgrade button you now see two paths, for example Sharpshooter (more range) or Rapid Fire (faster attacks). Pick the one that fits the map.',info:true},
  {title:'⚔️ Tips',text:'Splash paths are best against groups and swarms. Single-target paths beat tanks and bosses. Auto Upgrade always picks the recommended path.',info:true,last:true}],
 prestige:[
  {title:'⭐ Prestige',text:'When a unit reaches level 100, open the Units tab and tap Prestige. It returns to level 1 with a permanent star: +50% damage, +4% range and +6% attack speed per star. Common units can earn 1★, Rare 2★, and Epic or rarer up to 5★.',info:true},
  {title:'🛡️ Sixth team slot',text:'You can now equip six units. Open the Units tab to add one.',target:()=>tabBtn('units'),info:true,last:true}],
 raids:[
  {title:'⚔️ Open Raids',text:'Tap the glowing Raids tab.',target:()=>tabBtn('raids'),done:()=>tabOpen('raids')},
  {title:'🏰 Duskmoor Castle',text:'Raids are Hell-difficulty battles with five levels. Each level is 25% harder than the last and must be cleared to unlock the next. Level 5 has a 5% chance to drop Count Vesper.',info:true,last:true}]
};
function ggStartFeatureGuide(id){const steps=GG_FEATURE_GUIDES[id];if(!steps)return;
  if(typeof closeHelp==='function')closeHelp();
  GUIDE_STEPS=steps;guide.kind='feature';guide.label=GG_FEATURE[id].n;guide.active=true;guide.hidden=false;guideEnter(0);}
// ---- "New system unlocked" card ----
document.body.insertAdjacentHTML('beforeend','<div id="ggUnlock" class="gg-unlock hide" role="dialog" aria-modal="true" aria-labelledby="ggUnlockName"><div class="gg-unlock-card"><div class="gg-unlock-ico" id="ggUnlockIco"></div><div class="gg-unlock-kicker">New system unlocked!</div><h2 id="ggUnlockName"></h2><p id="ggUnlockText"></p><div class="gg-unlock-actions"><button type="button" class="alt" id="closeUnlockCard">Later</button><button type="button" id="ggUnlockGo">Show me how</button></div></div></div>');
let ggUnlockCurrent=null;
function ggShowUnlock(f){ggUnlockCurrent=f;$('#ggUnlockIco').innerHTML=GGI[f.icon]||'';$('#ggUnlockName').textContent=f.n;$('#ggUnlockText').textContent=f.d;
  if(!S.unlockSeen.includes(f.id)){S.unlockSeen.push(f.id);save(false);}
  const ov=$('#ggUnlock');ov.classList.remove('hide');ov.classList.remove('in');void ov.offsetWidth;ov.classList.add('in');try{ggJingle('levelup')}catch(e){}}
$('#closeUnlockCard').onclick=()=>{$('#ggUnlock').classList.add('hide');if(ggUnlockCurrent)toast('Replay it any time from ☰ → Help & Tutorials.');};
$('#ggUnlockGo').onclick=()=>{$('#ggUnlock').classList.add('hide');if(ggUnlockCurrent)ggStartFeatureGuide(ggUnlockCurrent.id);};
function ggUnlockTick(){
  try{ggEnsureUnlockState();
    if(document.hidden||guide.active||(G&&!G.over))return;
    if([...document.querySelectorAll('[role=dialog]')].some(d=>!d.classList.contains('hide')&&getComputedStyle(d).display!=='none'))return;
    const f=GG_FEATURES.find(f=>S.playerLevel>=f.lv&&!S.unlockSeen.includes(f.id));if(f)ggShowUnlock(f);}catch(e){}
}
setInterval(ggUnlockTick,1500);
(function(){const orig=gainPlayerExp;gainPlayerExp=function(){const r=orig.apply(this,arguments);try{ggRefreshLocks()}catch(e){}return r;};})();
(function(){const orig=renderAll;renderAll=function(){const r=orig.apply(this,arguments);try{ggRefreshLocks()}catch(e){}return r;};})();
// ---- Help & Tutorials ----
document.body.insertAdjacentHTML('beforeend','<div id="ggHelp" class="settings-panel hide" role="dialog" aria-modal="true" aria-labelledby="ggHelpTitle"><div class="settings-box gg-help-box"><div class="row" style="justify-content:space-between;align-items:center"><h2 id="ggHelpTitle">📖 Help &amp; Tutorials</h2><button class="alt" id="closeHelp">Close ✕</button></div><div id="ggHelpList"></div></div></div>');
function closeHelp(){$('#ggHelp').classList.add('hide');}
$('#closeHelp').onclick=closeHelp;
function openHelp(){
  const row=(icon,name,sub,btn)=>'<div class="gg-help-row"><span class="gg-help-ico">'+(GGI[icon]||'')+'</span><span class="gg-help-txt"><b>'+name+'</b><small>'+sub+'</small></span>'+btn+'</div>';
  let h=row('cap','Beginner tutorial','Summon, build a team and win your first battle.','<button type="button" data-help="intro">Play</button>');
  for(const f of GG_FEATURES){const on=ggFeatureOn(f.id);h+=row(f.icon,f.n,on?f.d:'Unlocks at Player Level '+f.lv+'.',on?'<button type="button" data-help="'+f.id+'">Show me</button>':'<span class="gg-help-locked">'+GGI.lock+'Lv '+f.lv+'</span>');}
  h+=row('book','Game overview','A quick read about every part of the game.','<button type="button" class="alt" data-help="overview">Read</button>');
  $('#ggHelpList').innerHTML=h;
  $('#ggHelpList').querySelectorAll('[data-help]').forEach(b=>b.onclick=()=>{const k=b.dataset.help;closeHelp();
    if(k==='intro'){document.querySelector('.tabs button[data-tab="summon"]')?.click();guideStart(0);}else if(k==='overview')ggTutorialOpen();else ggStartFeatureGuide(k);});
  $('#ggHelp').classList.remove('hide');$('#bMore')?.getAttribute('aria-expanded')==='true'&&$('#bMore').click();
}
(function(){const old=$('#bTutorial');if(!old)return;const b=old.cloneNode(true);b.removeAttribute('data-ggi');b.innerHTML='<span class="ggi-wrap">'+GGI.book+'</span>Help &amp; Tutorials';old.replaceWith(b);b.addEventListener('click',openHelp);})();
ggRefreshLocks();
