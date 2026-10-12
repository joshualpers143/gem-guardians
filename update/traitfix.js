// ---------- Trait fixes (2026.10.11.20) ----------
// Auto Reroll stops on good traits and keeps a gem reserve, great traits ask before being replaced,
// and the Trait Forge shows its odds.
const GG_TRAIT_RANK={Common:0,Rare:1,Epic:2,Legendary:3,Mythic:4};
function ggTraitRank(k){const t=TRAITS[k];return t?GG_TRAIT_RANK[t.rarity]??0:-1;}
if(!['legendary','mythic','target'].includes(S.autoTraitStop))S.autoTraitStop='legendary';
if(!Number.isFinite(S.autoTraitGemFloor)||S.autoTraitGemFloor<0)S.autoTraitGemFloor=500;
(function(){
  const st=$('#autoTraitStatus');if(!st)return;
  st.insertAdjacentHTML('beforebegin','<div class="trait-auto-opts"><label>Stop when I roll <select id="autoTraitStop"><option value="legendary">Legendary or better</option><option value="mythic">Mythic only</option><option value="target">Only my target trait</option></select></label><label>Keep at least <input id="autoTraitFloor" type="number" min="0" step="50" inputmode="numeric"> gems</label></div>');
  const s=$('#autoTraitStop'),f=$('#autoTraitFloor');s.value=S.autoTraitStop;f.value=S.autoTraitGemFloor;
  s.onchange=()=>{S.autoTraitStop=s.value;save(false);};
  f.onchange=()=>{S.autoTraitGemFloor=Math.max(0,Math.floor(+f.value||0));f.value=S.autoTraitGemFloor;save(false);};
  const pity=$('#traitPity');if(pity)pity.insertAdjacentHTML('afterend','<p id="traitOdds" class="trait-odds">Odds per reroll: <b class="Common">Common 40%</b> · <b class="Rare">Rare 30%</b> · <b class="Epic">Epic 20%</b> · <b class="Legendary">Legendary 9%</b> · <b class="Mythic">Mythic 1%</b></p>');
})();
function ggStopAuto(msg){S.autoTraitEnabled=false;S.autoTraitUnitUid=null;save(false);try{refreshAutoTraitUI()}catch(e){}if(msg)toast(msg);}
(function(){const orig=rollSelectedTrait;rollSelectedTrait=function(auto=false){
  const u=S.units.find(u=>String(u.uid)===$('#traitUnit').value);
  if(!auto&&u&&ggTraitRank(u.trait)>=3&&traitRerollSecondsLeft()===0){
    if(!confirm('Replace '+TRAITS[u.trait].n+' ('+TRAITS[u.trait].rarity+')? The new trait is random and this one will be lost.'))return false;}
  if(auto){
    if(u&&S.autoTraitStop!=='target'&&ggTraitRank(u.trait)>=(S.autoTraitStop==='mythic'?4:3)){ggStopAuto('Auto Reroll stopped: '+UNITS[u.id].n+' already has '+TRAITS[u.trait].n+'.');return false;}
    if(S.traitRerolls<=0&&S.gems-30<(S.autoTraitGemFloor||0)){ggStopAuto('Auto Reroll stopped to keep at least '+(S.autoTraitGemFloor||0).toLocaleString()+' gems.');return false;}}
  const r=orig.apply(this,arguments);
  if(r&&auto&&u&&S.autoTraitEnabled){const k=u.trait,rk=ggTraitRank(k);
    if(S.autoTraitStop!=='target'&&rk>=(S.autoTraitStop==='mythic'?4:3))ggStopAuto('Kept '+TRAITS[k].n+' ('+TRAITS[k].rarity+')! Auto Reroll stopped.');}
  return r;};})();
// Starting Auto Reroll on a unit that already has a great trait asks first.
(function(){const b=$('#autoTraitToggle');if(!b)return;const orig=b.onclick;b.onclick=function(e){
  if(!S.autoTraitEnabled){const u=S.units.find(u=>String(u.uid)===$('#traitUnit').value);
    if(u&&ggTraitRank(u.trait)>=3&&!confirm(UNITS[u.id].n+' has '+TRAITS[u.trait].n+' ('+TRAITS[u.trait].rarity+'). Start Auto Reroll anyway? It may replace it.'))return;}
  return orig.call(this,e);};})();
