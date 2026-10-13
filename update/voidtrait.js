// ---------- Void Sovereign secret trait, Auto Reroll pass & gifts (2026.10.11.29) ----------
// Void Sovereign: the only Secret trait. 0.1% per reroll, guaranteed by 1,000 rerolls without it.
// +500% damage, +50% range, +30% attack speed, but a unit with it can be placed only once per battle.
// Auto Reroll is now a pass; everyone who played before this update keeps it for free.
// Gifts: the owner can send a player a trait; it arrives the next time they open the game signed in.
const GG_VOID='void',GG_VOID_PITY=1000;
GG_TRAIT_RANK.Secret=5;
MYTHIC_VISUALS[GG_VOID]={color:'#d0103a',secondary:'#3b0a4d',symbol:'☠',name:'Abyssal maw'};
function ggVoidPity(){return Math.min(GG_VOID_PITY-1,Math.max(0,Math.floor(+S.traitSecretPity||0)));}
// ===== Rolling: odds, pity, protection =====
let ggForceVoid=false;
(function(){const o=pickTrait;pickTrait=function(){if(ggForceVoid){ggForceVoid=false;return GG_VOID;}return o.apply(this,arguments);};})();
(function(){const o=rollSelectedTrait;rollSelectedTrait=function(auto=false){
  const u=S.units.find(u=>String(u.uid)===$('#traitUnit').value);
  if(auto&&!ggHasPass('autotrait')){ggStopAuto('Auto Reroll needs the Auto Reroll pass.');return false;}
  if(auto&&u&&u.trait===GG_VOID){ggStopAuto('Auto Reroll stopped: '+UNITS[u.id].n+' has Void Sovereign.');return false;}
  const pity=ggVoidPity();ggForceVoid=pity>=GG_VOID_PITY-1;
  let r;try{r=o.apply(this,arguments);}finally{ggForceVoid=false;}
  if(r&&u){
    if(u.trait===GG_VOID){S.traitSecretPity=0;S.traitPity=0;S.traitRollLockUntil=Date.now()+HIGH_TRAIT_REROLL_DELAY_MS;
      if(S.autoTraitEnabled)ggStopAuto('Kept Void Sovereign (Secret)! Auto Reroll stopped.');
      save(false);ggVoidReveal({title:'☠ SECRET TRAIT ☠',unit:u,sub:pity>=GG_VOID_PITY-1?'Guaranteed by Secret pity':'A 0.1% roll'});}
    else{S.traitSecretPity=pity+1;save(false);}
    try{renderTraits()}catch(e){}}
  return r;};})();
// Trait Forge text: odds and Secret pity.
(function(){
  const odds=$('#traitOdds');if(odds)odds.innerHTML='Odds per reroll: <b class="Common">Common 39.9%</b> · <b class="Rare">Rare 30%</b> · <b class="Epic">Epic 20%</b> · <b class="Legendary">Legendary 9%</b> · <b class="Mythic">Mythic 1%</b> · <b class="Secret">Secret 0.1%</b>';
  const p=$('#traitPity');if(p&&!$('#ggVoidPity'))p.insertAdjacentHTML('afterend','<p id="ggVoidPity" class="gg-void-pity"></p>');})();
(function(){const o=renderTraits;renderTraits=function(){const r=o.apply(this,arguments);try{const el=$('#ggVoidPity');if(el)el.innerHTML='☠ <b class="Secret">Secret trait pity</b>: '+ggVoidPity()+'/'+GG_VOID_PITY+' rerolls (Void Sovereign guaranteed at '+GG_VOID_PITY.toLocaleString()+')';}catch(e){}return r;};})();
// ===== One placement per battle =====
function ggPlaceFull(inst){if(!inst)return true;if(placedNameCount(inst.id)>=unitPlacementCap(inst.id))return true;return inst.trait===GG_VOID&&!!G&&G.us.some(u=>u.uid===inst.uid);}
(function(){const o=cv.onclick;cv.onclick=function(e){try{if(G&&!G.over&&!G.autoPlay&&G.pl){const inst=S.units.find(x=>x.uid===G.pl);
  if(inst&&inst.trait===GG_VOID&&G.us.some(u=>u.uid===inst.uid)){const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;
    if(!G.us.some(u=>Math.hypot(u.x-x,u.y-y)<18))return toast('☠ A unit with Void Sovereign can be placed only once.');}}}catch(err){}return o.call(this,e);};})();
(function(){const o=refreshPlacementBar;refreshPlacementBar=function(){const r=o.apply(this,arguments);try{if(!G)return r;
  document.querySelectorAll('#bar .card[data-uid]').forEach(card=>{const inst=S.units.find(u=>u.uid===Number(card.dataset.uid));if(!inst||inst.trait!==GG_VOID)return;
    const mine=G.us.filter(u=>u.uid===inst.uid).length;card.classList.toggle('off',ggPlaceFull(inst));card.classList.add('gg-void-unit');
    const b=card.querySelector('.placement-count');if(b){b.textContent='☠ Placed '+mine+'/1';b.title='Void Sovereign: this unit can be placed only once';}});}catch(e){}return r;};})();
// ===== Ominous look =====
function ggVoidAura(c,x,y,s,t){
  c.save();c.translate(x,y);c.scale(s,s);const pulse=.5+.5*Math.sin(t*2.2);
  const g=c.createRadialGradient(0,9,2,0,9,32);g.addColorStop(0,'rgba(8,0,14,.6)');g.addColorStop(.55,'rgba(70,0,28,.38)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.beginPath();c.ellipse(0,10,32,12,0,0,Math.PI*2);c.fill();
  c.shadowColor='#ff1744';c.shadowBlur=7+7*pulse;c.strokeStyle='rgba(214,18,58,'+(.45+.45*pulse).toFixed(2)+')';c.lineWidth=1.5;
  c.beginPath();c.ellipse(0,10,25,8.5,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<5;i++){const a=t*.7+i*Math.PI*2/5,b=a+Math.PI*4/5;c.beginPath();c.moveTo(Math.cos(a)*25,10+Math.sin(a)*8.5);c.lineTo(Math.cos(b)*25,10+Math.sin(b)*8.5);c.stroke();}
  c.shadowBlur=0;
  for(let i=0;i<8;i++){const ph=(t*.55+i/8)%1,side=i%2?1:-1,xx=side*(13+Math.sin(i*2.3+t*1.2)*5)*(1-ph*.3),yy=10-ph*44;c.fillStyle='rgba(40,0,52,'+(.42*(1-ph)).toFixed(2)+')';c.beginPath();c.arc(xx,yy,2.5+ph*4.5,0,Math.PI*2);c.fill();}
  for(let i=0;i<5;i++){const a=-t*1.3+i*Math.PI*2/5;c.fillStyle=i%2?'#ff1f4f':'#1a0024';c.beginPath();c.arc(Math.cos(a)*21,-8+Math.sin(a)*12,1.9,0,Math.PI*2);c.fill();}
  const open=Math.sin(t*1.3)>.96?.15:1;c.fillStyle='rgba(255,24,64,.92)';c.shadowColor='#ff0033';c.shadowBlur=9;
  c.beginPath();c.ellipse(-6,-37,2.6,1.3*open,-.25,0,Math.PI*2);c.ellipse(6,-37,2.6,1.3*open,.25,0,Math.PI*2);c.fill();
  c.restore();}
(function(){const o=traitAura;traitAura=function(c,trait,x,y,scale=1,time=Date.now()/1000){if(trait!==GG_VOID)return o.apply(this,arguments);try{ggVoidAura(c,x,y,scale,time)}catch(e){}};})();
// Big reveal for a rolled or gifted Void Sovereign.
document.body.insertAdjacentHTML('beforeend','<div id="ggVoidReveal" class="gg-void-reveal hide" role="dialog" aria-modal="true" aria-labelledby="ggVoidTitle"><div class="gg-void-card"><div class="gg-void-sigil" aria-hidden="true"><canvas width="200" height="200" id="ggVoidCv"></canvas></div><b id="ggVoidTitle"></b><h2>Void Sovereign</h2><p id="ggVoidUnit"></p><p class="gg-void-stats">+500% damage · +50% range · +30% attack speed</p><p class="gg-void-rule">A unit with this trait can be placed only once per battle.</p><small id="ggVoidSub"></small><button id="ggVoidOk">Embrace the void</button></div></div>');
let ggVoidAnim=0;
function ggVoidReveal(o){const box=$('#ggVoidReveal');$('#ggVoidTitle').textContent=o.title||'☠ SECRET TRAIT ☠';
  $('#ggVoidUnit').textContent=o.unit?unitLabel(o.unit)+' is now a Void Sovereign.':'';$('#ggVoidSub').textContent=o.sub||'';
  box.classList.remove('hide');try{ggJingle('summon_Secret')}catch(e){}
  const cvs=$('#ggVoidCv'),c=cvs.getContext('2d'),id=o.unit?o.unit.id:'abyss_summoner';cancelAnimationFrame(ggVoidAnim);
  const draw=()=>{if(box.classList.contains('hide'))return;const t=performance.now()/1000;c.clearRect(0,0,200,200);
    try{ggVoidAura(c,100,150,3.3,t);}catch(e){}
    ggVoidAnim=requestAnimationFrame(draw);};draw();}
$('#ggVoidOk').onclick=()=>{$('#ggVoidReveal').classList.add('hide');cancelAnimationFrame(ggVoidAnim);};
// ===== Auto Reroll pass =====
GG_PASSES.autotrait={n:'Auto Reroll',i:'🔁',d:'Use Auto Reroll in the Trait Forge: it rerolls a unit\'s trait for you until it lands a great trait or your target. Rolls still cost rerolls or gems as usual.'};
const GG_LEGACY_AT_KEY=GG_LEGACY_KEY+'_autotrait';
(function(){const o=ggLegacyPasses;ggLegacyPasses=function(){const r=o.apply(this,arguments).slice();let dev=false;try{dev=localStorage.getItem(GG_LEGACY_AT_KEY)==='1'}catch(e){}
  if(dev||Array.isArray(S.passLegacy)&&S.passLegacy.includes('autotrait'))r.push('autotrait');return r;};})();
// Everyone who already played keeps Auto Reroll for free.
function ggAutoTraitLegacyCheck(){if(S.autoTraitLegacyChecked)return;S.autoTraitLegacyChecked=true;
  const played=(+S.cleared||0)>0||(+S.playerLevel||1)>1||(+S.playerExp||0)>0||(S.stats&&(+S.stats.waves||0)>0);
  if(played){S.passLegacy=[...new Set([...(Array.isArray(S.passLegacy)?S.passLegacy:[]),'autotrait'])];try{localStorage.setItem(GG_LEGACY_AT_KEY,'1')}catch(e){}}
  save(false);}
(function(){const b=$('#autoTraitToggle');if(!b)return;const orig=b.onclick;b.onclick=function(e){
  if(!S.autoTraitEnabled&&!ggHasPass('autotrait')){toast('🔁 Auto Reroll needs the Auto Reroll pass. See 💎 Passes.');ggShopOpen('autotrait');return;}
  return orig.call(this,e);};})();
(function(){const o=refreshAutoTraitUI;refreshAutoTraitUI=function(){const r=o.apply(this,arguments);try{if(!ggHasPass('autotrait')){const b=$('#autoTraitToggle');if(b){b.textContent='🔒 Auto Reroll (pass)';b.classList.add('gg-pass-locked');}}else{const b=$('#autoTraitToggle');if(b)b.classList.remove('gg-pass-locked');}}catch(e){}return r;};})();
(function(){const o=ggPassUI;ggPassUI=function(){const r=o.apply(this,arguments);try{if(S.autoTraitEnabled&&!ggHasPass('autotrait')){S.autoTraitEnabled=false;S.autoTraitUnitUid=null;save(false);}refreshAutoTraitUI();}catch(e){}return r;};})();
(function(){const o=importSaveText;importSaveText=async function(){const r=await o.apply(this,arguments);try{ggAutoTraitLegacyCheck();ggPassUI();}catch(e){}return r;};})();
// ===== Gifts from the owner =====
let ggGiftBusy=false;
function ggApplyGift(g){
  if(g.kind==='trait'){const p=g.payload||{},t=p.trait,id=p.unit;if(!TRAITS[t]||!UNITS[id])return null;
    let u=S.units.filter(x=>x.id===id).sort((a,b)=>b.lv-a.lv||b.st-a.st||a.uid-b.uid)[0],made=false;
    if(!u){u={uid:S.nid++,id,lv:1,xp:0,st:0,trait:''};S.units.push(u);if(!S.discovered.includes(id))S.discovered.push(id);made=true;}
    u.trait=t;return {unit:u,trait:t,made,note:g.note||''};}
  return null;}
async function ggGiftSync(){
  if(ggGiftBusy||GG_EDITION!=='public'||!ggCloud.session||ggCloud.conflict||!ggIsOnline())return;ggGiftBusy=true;
  try{const r=await ggRpc('my_gifts',{},true);if(!r.ok||!Array.isArray(r.data))return;
    S.giftsApplied=Array.isArray(S.giftsApplied)?S.giftsApplied.filter(x=>typeof x==='string').slice(-200):[];
    for(const g of r.data){if(!g||typeof g.id!=='string')continue;
      if(!S.giftsApplied.includes(g.id)){const res=ggApplyGift(g);if(!res)continue;S.giftsApplied.push(g.id);save(false);try{renderAll()}catch(e){}
        if(res.trait===GG_VOID)ggVoidReveal({title:'🎁 A GIFT FROM THE VOID',unit:res.unit,sub:(res.made?'You also received a new '+UNITS[res.unit.id].n+'. ':'')+(res.note||'')});
        else toast('🎁 Gift: '+TRAITS[res.trait].n+' on '+unitLabel(res.unit)+'!');}
      await ggRpc('claim_gift',{p_id:g.id},true);}
  }finally{ggGiftBusy=false;}}
(function(){const o=ggCloudAfterLogin;ggCloudAfterLogin=async function(){const r=await o.apply(this,arguments);await ggGiftSync();return r;};})();
window.addEventListener('online',()=>setTimeout(ggGiftSync,3000));
setInterval(()=>{if(document.visibilityState==='visible')ggGiftSync();},300000);
ggAutoTraitLegacyCheck();ggPassUI();setTimeout(ggGiftSync,4000);
try{renderTraits()}catch(e){}
