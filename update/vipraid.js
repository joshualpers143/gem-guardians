// ---------- VIP perks, Raids ×3 Speed pass, permanent passes (2026.10.11.35) ----------
// VIP: +25% gems from battles, raids, Infinite waves, AFK and quests (not from selling units, the Index or
// level milestones), +25% unit EXP and +50% player EXP. Speed ×3 in raids is its own pass (raid3): the ×3 Speed
// pass and the free early-player ×3 cover map battles only. Every pass is permanent.
const GG_VIP={gems:1.25,unitXp:1.25,playerXp:1.5};
(function(){const raid3={n:'Raids ×3 Speed',i:'🏰',d:'Unlocks Speed ×3 in Duskmoor Castle raids. Raids are only covered by this pass: the ×3 Speed pass and the free early-player ×3 do not include them.'};
  GG_PASSES.speed3.d='Unlocks Speed ×3 in every map battle, including Infinite Mode. Raids need the Raids ×3 Speed pass. Speed ×1 and ×2 stay free for everyone.';
  GG_PASSES.vip.d='+25% gems from battles, raids, AFK and quests, +25% unit EXP and +50% player EXP. Plus a gold name with a crown in the header, your profile and the leaderboards, and a golden glow under your units in battle.';
  const all=Object.assign({},GG_PASSES,{raid3}),order=['speed3','raid3','afk2','autosum','autotrait','vip'];
  for(const k of Object.keys(GG_PASSES))delete GG_PASSES[k];
  for(const k of order.concat(Object.keys(all)))if(all[k]&&!GG_PASSES[k])GG_PASSES[k]=all[k];
  // The saved copy of the account's passes was read before Raids ×3 Speed existed: read it again.
  try{const p=JSON.parse(localStorage.getItem(GG_PASS_KEY)||'{}');if(p&&p.uid===ggPass.uid&&Array.isArray(p.list))ggPass.list=p.list.filter(x=>GG_PASSES[x]);}catch(e){}})();
function ggIsVip(){return ggHasPass('vip');}
// ----- Raids ×3 Speed -----
ggMaxSpeed=function(){if(!G)return 3;const id=G.raidLevel?'raid3':'speed3',ranked=G.lbBoard&&!G.lbSkip;return (ranked?ggServerHasPass(id):ggHasPass(id))?3:2;};
// ----- VIP: player EXP ×1.5, unit EXP ×1.25 -----
const ggVipRun={gems:0,unitXp:0,pxp:0};
(function(){const o=gainPlayerExp;gainPlayerExp=function(amount){if(ggIsVip()&&amount>0){const b=Math.round(amount*(GG_VIP.playerXp-1));ggVipRun.pxp+=b;amount+=b;}return o.call(this,amount);};})();
(function(){const o=addXp;addXp=function(i,x){if(ggIsVip()&&x>0&&i&&i.lv<100){const b=Math.round(x*(GG_VIP.unitXp-1));ggVipRun.unitXp+=b;x+=b;}return o.call(this,i,x);};})();
// ----- VIP: +25% gems -----
function ggVipGemBonus(gain){if(!ggIsVip()||!(gain>0))return 0;const b=Math.round(gain*(GG_VIP.gems-1));S.gems+=b;return b;}
(function(){const o=infReward;infReward=function(){const pre=S.gems;const r=o.apply(this,arguments);try{const b=ggVipGemBonus(S.gems-pre);if(b){ggVipRun.gems+=b;if(G)G.ig=(G.ig||0)+b;gemUI();}}catch(e){}return r;};})();
(function(){const o=claimAfkRewards;claimAfkRewards=function(){const pre=S.gems;const r=o.apply(this,arguments);try{const b=ggVipGemBonus(S.gems-pre);if(b){save(false);gemUI();toast('👑 VIP bonus: +'+b+' gems');}}catch(e){}return r;};})();
(function(){const o=giveReward;giveReward=function(){const pre=S.gems;const r=o.apply(this,arguments);try{const b=ggVipGemBonus(S.gems-pre);if(b){save(false);gemUI();setTimeout(()=>toast('👑 VIP bonus: +'+b+' gems'),1300);}}catch(e){}return r;};})();
// Battles and raids: count the run's VIP bonus and show it on the Victory/Defeat card.
(function(){const o=startBattle;startBattle=function(){ggVipRun.gems=0;ggVipRun.unitXp=0;ggVipRun.pxp=0;return o.apply(this,arguments);};})();
(function(){const o=finish;finish=function(){const pre=S.gems;const r=o.apply(this,arguments);
  try{const b=ggVipGemBonus(S.gems-pre);ggVipRun.gems+=b;if(b){save(false);gemUI();}
    if(ggIsVip()&&(ggVipRun.gems||ggVipRun.unitXp||ggVipRun.pxp)){const box=$('#battleOutcomeRewards');const parts=[];
      if(ggVipRun.gems)parts.push('+'+ggVipRun.gems+' gems');if(ggVipRun.pxp)parts.push('+'+ggVipRun.pxp+' player EXP');if(ggVipRun.unitXp)parts.push('+'+ggVipRun.unitXp+' unit EXP');
      const t='👑 VIP bonus: '+parts.join(', ');
      if(box)box.insertAdjacentHTML('beforeend','<div class="gg-vip-bonus">'+t+'</div>');const msg=$('#msg');if(msg)msg.textContent+=' '+t+'.';}}catch(e){}
  return r;};})();
