// ---------- Unit abilities (2026.10.11.21) ----------
// Every Common to Legendary unit has one clear, named ability that does exactly what its card says.
// Status effects on enemies: Burn, Poison, Sunder (takes more damage), Stun, Root, Freeze, Slow and Knockback.
// Mythic and Secret units keep their battlefield abilities; their cards now describe them accurately.
const GG_ROLES={st:['Single Target','#fca5a5'],area:['Area','#fdba74'],dot:['Damage over Time','#86efac'],ctrl:['Control','#93c5fd'],sup:['Support','#fde68a'],eco:['Economy','#facc15'],shield:['Anti-Shield','#7dd3fc'],air:['Anti-Air','#c4b5fd'],fin:['Finisher','#f9a8d4']};
const GG_ABIL={
 knight:{n:'Shield Bash',r:['st','ctrl'],d:'Every 5th hit stuns the target for 0.4s.'},
 archer:{n:'Twin Arrows',r:['st','air'],d:'Every 3rd shot also hits a second enemy for 60% damage. Deals +20% damage to flying enemies.'},
 apprentice:{n:'Arcane Splash',r:['area'],d:'Every attack splashes nearby enemies for 60% damage.'},
 squire:{n:'Shield Breaker',r:['shield','sup'],d:'Deals double damage to shields. Every 3rd hit Sunders the target: it takes +15% damage from everyone for 3s.'},
 slingshot:{n:'Ricochet',r:['area'],d:'Every pebble bounces to one more nearby enemy for 40% damage.'},
 herbalist:{n:'Toxic Herbs',r:['dot'],d:'Hits Poison the target: 20% damage per second for 4s. Stacks up to 3 times.'},
 lancer:{n:'Piercing Lance',r:['area'],d:'Every attack also pierces the enemy right behind the target for 50% damage.'},
 torch:{n:'Torch Flame',r:['dot'],d:'Hits Burn the target for 40% damage per second for 3s. Burning enemies receive 50% less healing.'},
 hunter:{n:'Finishing Shot',r:['fin'],d:'Instantly defeats non-boss enemies below 18% health. Deals +30% damage to bosses below 25% health.'},
 miner:{n:'Gold Strike',r:['eco'],d:'Every 4th hit digs up coins: 4, plus 2 for each boost after the first.'},
 monk:{n:'Calm Aura',r:['sup'],d:'Units inside the Monk\'s range (including itself) attack 10% faster. Several Monks do not stack.'},
 scout:{n:'Quick Draw',r:['st','air'],d:'Every 3rd attack fires twice. Deals +30% damage to flying enemies.'},
 guard:{n:'Stagger',r:['ctrl'],d:'Every 4th hit deals +50% damage and stuns the target for 0.6s (shorter on bosses).'},
 lizardscout:{n:'Venom Dart',r:['dot','ctrl'],d:'Hits Poison the target: 20% damage per second for 4s, stacking 3 times. Each stack slows it by 5%.'},
 alchemist:{n:'Acid Flask',r:['area','sup'],d:'Every 3rd attack splashes acid: 40% damage to nearby enemies and Sunders them (+12% damage taken for 3s).'},
 falconer:{n:'Falcon Dive',r:['st','air'],d:'Every 2nd attack the falcon dives for an extra 60% damage. Deals +50% damage to flying enemies.'},
 spearman:{n:'Long Thrust',r:['area'],d:'Every thrust also hits the enemy right behind the target for 60% damage.'},
 druid:{n:'Entangling Roots',r:['ctrl'],d:'Every 4th hit Roots the target in place for 1.2s (0.4s on bosses). Rooted Tide Crabs cannot dive.'},
 pirate:{n:'Powder Keg',r:['area'],d:'Every shot explodes, dealing 45% damage to enemies near the target.'},
 brawler:{n:'Heavy Blow',r:['st','ctrl'],d:'Every 3rd hit deals +80% damage and knocks the enemy back down the road (not bosses).'},
 trickster:{n:'Lucky Trick',r:['st'],d:'Each attack has a 25% chance to deal double damage.'},
 beekeeper:{n:'Bee Swarm',r:['area','dot'],d:'Every 3rd attack sends bees at up to 3 nearby enemies: 40% damage and Poison (15% per second for 3s).'},
 rune:{n:'Arcane Echo',r:['st'],d:'Every 4th attack echoes a moment later, hitting the same enemy again for full damage.'},
 fencer:{n:'Rapid Combo',r:['st'],d:'Each hit in a row on the same enemy deals +8% more damage, up to +40%. Switching targets resets the combo.'},
 moonling:{n:'Plasma Pulse',r:['area','ctrl'],d:'Every 5th attack pulses around itself: 50% damage to every enemy in range and a 1s slow.'},
 blade:{n:'Whirling Blades',r:['area'],d:'Every 4th hit spins, striking every enemy in range for 50% damage.'},
 sniper:{n:'Headshot',r:['st'],d:'Every 3rd shot deals +70% damage. Deals +25% damage to bosses.'},
 mage:{n:'Deep Freeze',r:['ctrl'],d:'Every hit slows the target. Every 5th hit Freezes it for 0.8s (0.25s on bosses).'},
 storm:{n:'Chain Lightning',r:['area'],d:'Every 3rd hit lightning jumps to 3 more enemies for 50%, 40% and 30% damage.'},
 assassin:{n:'Backstab',r:['st','fin'],d:'Deals +35% damage to enemies below half health. Every 3rd hit deals +40% damage.'},
 ballista:{n:'Piercing Bolt',r:['area'],d:'Every 2nd bolt pierces through every enemy close behind the target for 50% damage.'},
 witch:{n:'Hex',r:['area','sup'],d:'Attacks splash dark mist for 25% damage. Every 3rd hit Hexes the target for 3s: it is slowed and takes +20% damage.'},
 berserker:{n:'Blood Fury',r:['st'],d:'Each attack makes it 3% faster, up to +45%. The fury fades after 2s without a target. Every 3rd hit deals +30% damage.'},
 oracle:{n:'Fated Mark',r:['sup','st'],d:'Every 4th hit deals +35% damage and Marks the target for 4s: it takes +25% damage from everyone.'},
 ranger:{n:'Thorn Volley',r:['area'],d:'Every attack fires 2 extra arrows at other enemies in range for 45% damage each.'},
 pyro:{n:'Ember Burst',r:['dot','area'],d:'Hits Burn the target (25% per second for 3s). Every 4th hit explodes: 40% damage nearby and every enemy hit starts burning.'},
 samurai:{n:'Crescent Cleave',r:['area'],d:'Every 3rd attack cleaves every enemy near the target for 60% damage.'},
 tinker:{n:'Gear Burst',r:['area'],d:'Every 3rd attack launches 4 gears at random enemies in range for 40% damage each.'},
 drake:{n:'Ember Breath',r:['area','dot'],d:'Every 4th attack breathes fire on enemies near the target: 30% damage and Burn (30% per second for 3s).'},
 dragon:{n:'Dragon Cleave',r:['area','dot'],d:'Attacks splash nearby enemies. Every 3rd hit cleaves for 55% damage and sets them Burning (25% per second for 3s).'},
 warden:{n:'Radiant Verdict',r:['shield','st'],d:'Deals triple damage to shields. Every 4th attack strikes for +80% damage.'},
 phoenix:{n:'Rebirth Flames',r:['dot','area'],d:'Hits Burn the target (25% per second for 3s). Every 4th hit unleashes a firestorm: 50% damage to nearby enemies and sets them Burning.'},
 titan:{n:'Earthquake',r:['area','ctrl'],d:'Every 4th attack shakes the ground: 45% damage to nearby enemies and a 0.6s stun.'},
 celestial:{n:'Meteor Arrows',r:['area','dot'],d:'Arrows splash 25% damage nearby. Every 3rd attack drops a meteor: 60% damage nearby and a short Burn.'},
 void:{n:'Void Siphon',r:['st'],d:'Every 4th attack rips away 6% of the target\'s current health (2% on bosses): at least 60% damage, at most double damage.'},
 leviathan:{n:'Tidal Wave',r:['area','ctrl'],d:'Every 4th attack sends a wave: 45% damage to nearby enemies, a 1.5s slow, and pushes them back (not bosses).'},
 paladin:{n:'Holy Judgment',r:['sup','st'],d:'Every 4th hit deals +65% damage and Blesses every unit in the Paladin\'s range: +12% damage for 5s.'},
 chronos:{n:'Time Lock',r:['ctrl'],d:'Every 4th hit Freezes the target for 1s (0.3s on bosses) and enemies near it for 0.5s.'},
 seraph:{n:'Radiant Chain',r:['area','sup'],d:'Every 3rd attack chains to 2 more enemies for 50% damage and Sunders all 3 (+15% damage taken for 3s).'},
 reptileking:{n:'Ancient Venom',r:['dot','area','ctrl'],d:'Hits Poison the target (20% per second for 3s, stacks 3 times). Every 4th attack bursts venom: 40% damage nearby, a 1.5s slow and Poison.'}
};
// Mythic and Secret units: accurate descriptions of what they already do.
const GG_ABIL_TEXT={
 cosmos:{n:'Supernova Mud',r:['area','dot'],d:'Every 5s (1s faster per boost, down to 1s) fills 3 spots along the road with cosmic mud for 5s, dealing 30% damage per second to enemies inside. Every attack also splashes 32% damage nearby.'},
 abyss:{n:'Abyss Hounds',r:['st','area'],d:'Every 15s releases 2 shadow wolves that race along the road and bite the first enemy they reach for 125% damage. Every 3rd attack deals +95% damage, and hits slow the target briefly.'},
 worldtree:{n:'Ancient Roots',r:['st'],d:'Attacks reach any enemy on the map and always hit the one closest to your base. Loses 3% damage for each other unit you have placed.'},
 dragonlord:{n:'Dragonfire',r:['area','eco'],d:'Every attack scorches enemies near the target for 65% damage. Every 4th attack finds 3 coins. At boost 5/5 it also leaves a fire field on the lead enemy every 8s (35% damage per second for 5s).'},
 starlord:{n:'Astral Ricochet',r:['area'],d:'Every arrow ricochets to 4 more enemies for 90%, 80%, 70% and 60% damage.'},
 eternity:{n:'Eternal Blessing',r:['sup','ctrl'],d:'Blesses nearby units for 7.5s, switching between +20% damage and +25% attack speed (recast every 15s, 1.5s faster per boost). Hits slow the target.'},
 xenowarden:{n:'Triune Wards',r:['ctrl'],d:'Places a ward on the road every 2s (up to 3). Each lasts 3s and slows, stuns or freezes enemies on it. Every 5th attack slows nearby enemies.'},
 rift_blade:{n:'Rift Slash',r:['area'],d:'Sweeping energy slashes. Every 4th strike unleashes a shockwave dealing 140% damage to the target and every enemy near it.'}
};
(function(){
  for(const id in GG_ABIL){const U=UNITS[id];if(!U)continue;U.abilityFx=U.ability||'';U.ability=GG_ABIL[id].n+': '+GG_ABIL[id].d;if(typeof RANKED_ATTACK_SKILLS!=='undefined')delete RANKED_ATTACK_SKILLS[id];}
  for(const id in GG_ABIL_TEXT){const U=UNITS[id];if(!U)continue;U.abilityFx=U.ability||'';U.ability=GG_ABIL_TEXT[id].n+': '+GG_ABIL_TEXT[id].d;}
})();
function ggAbilInfo(id){return GG_ABIL[id]||GG_ABIL_TEXT[id]||null;}
// ----- Status helpers -----
function ggFxOn(){return S.settings&&S.settings.attackFx;}
function ggHit(u,e,amt){if(!e||e.hp<=0||!(amt>0))return;e.hp-=amt;e.lastHitUid=u.uid;e.lastHitBoost=u.bl;}
function ggNear(x,y,r,excl){return G.en.filter(e=>e.hp>0&&e!==excl&&Math.hypot(e.x-x,e.y-y)<=r);}
function ggBehind(b,len,excl){return G.en.filter(e=>e.hp>0&&e!==b&&e!==excl&&e.d<b.d&&b.d-e.d<=len).sort((a,c)=>c.d-a.d);}
function ggLabel(e,txt,col){if(!e._ggL||G.time-e._ggL>.7){e._ggL=G.time;try{ggDamagePopup(e,txt,'text',col)}catch(x){}}}
function ggBurn(u,e,pct,dur){if(e.hp<=0)return;const dps=u.d*pct;e.ggBurnDps=e.ggBurnT>0?Math.max(e.ggBurnDps||0,dps):dps;e.ggBurnT=Math.max(e.ggBurnT||0,dur);e.ggBurnUid=u.uid;e.ggBurnBl=u.bl;}
function ggPoison(u,e,pct,dur,max){if(e.hp<=0)return;const per=u.d*pct;if(!(e.ggPoisT>0)){e.ggPoisN=0;e.ggPoisPer=0;}e.ggPoisN=Math.min(max||3,(e.ggPoisN||0)+1);e.ggPoisPer=Math.max(e.ggPoisPer||0,per);e.ggPoisT=dur;e.ggPoisUid=u.uid;e.ggPoisBl=u.bl;e.ggPoisSlow=u.id==='lizardscout'?.05:(e.ggPoisSlow||0);}
function ggSunder(e,pct,dur){if(e.hp<=0)return;e.ggVuln=e.ggVulnT>0?Math.max(e.ggVuln||0,pct):pct;e.ggVulnT=Math.max(e.ggVulnT||0,dur);}
function ggStun(e,dur,lbl){if(e.hp<=0||e.kind==='flyer')return;e.stunned=Math.max(e.stunned||0,e.boss?dur*.35:dur);if(lbl)ggLabel(e,lbl,'#fde68a');}
function ggRoot(e,dur){if(e.hp<=0||e.kind==='flyer')return;const t=e.boss?.4:dur;e.stunned=Math.max(e.stunned||0,t);e.ggRootT=Math.max(e.ggRootT||0,t);ggLabel(e,'ROOTED','#86efac');}
function ggFreeze(e,dur,bossDur){if(e.hp<=0||e.kind==='flyer')return;e.frozen=Math.max(e.frozen||0,e.boss?bossDur:dur);}
function ggSlow(e,dur){if(e.hp<=0)return;e.sl=Math.max(e.sl||0,dur);}
function ggKnock(e,dist){if(e.hp<=0||e.boss||e.kind==='miniboss')return;e.d=Math.max(0,e.d-dist);[e.x,e.y]=posAt(e.d);e.ggKnockT=.25;}
function ggRing(x,y,r,col,life){if(!ggFxOn())return;(G.ggFx=G.ggFx||[]).push({k:'ring',x,y,r,col,l:life||.45,max:life||.45});if(G.ggFx.length>80)G.ggFx.shift();}
function ggArc(pts,col){if(!ggFxOn())return;(G.ggFx=G.ggFx||[]).push({k:'arc',pts,col,l:.3,max:.3});if(G.ggFx.length>80)G.ggFx.shift();}
function ggLine(a,b,col){if(!ggFxOn())return;(G.ggFx=G.ggFx||[]).push({k:'line',a,b,col,l:.25,max:.25});if(G.ggFx.length>80)G.ggFx.shift();}
function ggBoom(x,y,col,imp){if(!ggFxOn())return;G.fx.push({kind:'impact2',imp:imp||'burst',x,y:y-6,col,delay:0,l:.45,max:.45});}
function ggIsAir(e){return e.kind==='flyer';}
// ----- Damage and attack-speed modifiers (applied to the main attack) -----
function ggAbilDmg(u,b){
  let m=1;
  if(u.ggBlessUntil&&G.time<u.ggBlessUntil)m*=1.12;
  switch(u.id){
    case 'fencer':if(u.ggComboE===b)u.ggCombo=Math.min(5,(u.ggCombo||0)+1);else{u.ggComboE=b;u.ggCombo=0;}m*=1+.08*u.ggCombo;break;
    case 'assassin':if(b.hp<b.mx*.5)m*=1.35;break;
    case 'sniper':if(b.boss)m*=1.25;break;
    case 'falconer':if(ggIsAir(b))m*=1.5;break;
    case 'scout':if(ggIsAir(b))m*=1.3;break;
    case 'archer':if(ggIsAir(b))m*=1.2;break;
    case 'hunter':if(b.boss&&b.hp<b.mx*.25)m*=1.3;break;
    case 'trickster':if(Math.random()<.25){m*=2;ggLabel(b,'CRIT!','#fbbf24');}break;
  }
  return m;
}
function ggAbilCd(u){
  let m=1;
  for(const k of G.us)if(k.id==='monk'&&Math.hypot(k.x-u.x,k.y-u.y)<=k.rg){m/=1.10;break;}
  if(u.id==='berserker'){u.ggFury=Math.min(15,(u.ggFury||0)+1);u.ggLastAtk=G.time;m/=1+.03*u.ggFury;}
  return m;
}
// ----- On-hit abilities (after the main attack) -----
function ggAbilOnHit(u,b,hits){
  const A=GG_ABIL[u.id];if(!A||!b)return;const d=u.d;
  switch(u.id){
    case 'knight':if(hits%5===0)ggStun(b,.4,'STUN');break;
    case 'archer':if(hits%3===0){const o=ggNear(b.x,b.y,90,b)[0];if(o){ggHit(u,o,d*.6);ggLine([b.x,b.y],[o.x,o.y],'#f4e6c8');}}break;
    case 'apprentice':break; // base splash
    case 'squire':b.ggShieldX=Math.max(b.ggShieldX||0,2);if(hits%3===0){ggSunder(b,.15,3);ggLabel(b,'SUNDER','#c084fc');}break;
    case 'slingshot':{const o=ggNear(b.x,b.y,70,b).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];if(o){ggHit(u,o,d*.4);ggLine([b.x,b.y],[o.x,o.y],'#a3e635');}break;}
    case 'herbalist':ggPoison(u,b,.2,4,3);break;
    case 'lizardscout':ggPoison(u,b,.2,4,3);break;
    case 'lancer':{const o=ggBehind(b,40)[0];if(o){ggHit(u,o,d*.5);ggLine([b.x,b.y],[o.x,o.y],'#67e8f9');}break;}
    case 'spearman':{const o=ggBehind(b,45)[0];if(o){ggHit(u,o,d*.6);ggLine([b.x,b.y],[o.x,o.y],'#fb923c');}break;}
    case 'torch':ggBurn(u,b,.4,3);break;
    case 'hunter':if(!b.boss&&b.kind!=='miniboss'&&b.hp>0&&b.hp<=b.mx*.18){ggHit(u,b,b.hp+1);ggLabel(b,'EXECUTE','#f9a8d4');ggBoom(b.x,b.y,'#f9a8d4','slash');}break;
    case 'miner':if(hits%4===0){const c=4+2*Math.max(0,(u.bl||1)-1);G.coins+=c;if(ggFxOn())G.fx.push({kind:'coin',txt:'+'+c,x:u.x,y:u.y-30,l:1,max:1});try{ggSfx('coin')}catch(x){}}break;
    case 'monk':break; // aura
    case 'scout':if(hits%3===0){ggHit(u,b,d);ggLabel(b,'DOUBLE','#f0abfc');}break;
    case 'guard':if(hits%4===0){ggHit(u,b,d*.5);ggStun(b,.6,'STAGGER');ggBoom(b.x,b.y,'#fdba74','burst');}break;
    case 'alchemist':if(hits%3===0){for(const e of [b,...ggNear(b.x,b.y,45,b)]){if(e!==b)ggHit(u,e,d*.4);ggSunder(e,.12,3);}ggRing(b.x,b.y,45,'#a3e635');}break;
    case 'falconer':if(hits%2===0){ggHit(u,b,d*.6*(ggIsAir(b)?1.5:1));ggArc([[u.x,u.y-30],[(u.x+b.x)/2,Math.min(u.y,b.y)-50],[b.x,b.y]],'#e9d5a1');}break;
    case 'druid':if(hits%4===0)ggRoot(b,1.2);break;
    case 'pirate':{for(const e of ggNear(b.x,b.y,40,b))ggHit(u,e,d*.45);ggBoom(b.x,b.y,'#ffb347','explode');break;}
    case 'brawler':if(hits%3===0){ggHit(u,b,d*.8);ggKnock(b,25);ggLabel(b,'KNOCKBACK','#86efac');}break;
    case 'trickster':break; // crit in damage multiplier
    case 'beekeeper':if(hits%3===0){const t=[b,...ggNear(b.x,b.y,60,b)].slice(0,3);for(const e of t){ggHit(u,e,d*.4);ggPoison(u,e,.15,3,3);ggLine([u.x,u.y-20],[e.x,e.y],'#facc15');}}break;
    case 'rune':if(hits%4===0)(G.ggQ=G.ggQ||[]).push({t:.4,u,e:b,amt:d,col:'#f0abfc'});break;
    case 'fencer':break;
    case 'moonling':if(hits%5===0){for(const e of ggNear(u.x,u.y,u.rg)){ggHit(u,e,d*.5);ggSlow(e,1);}ggRing(u.x,u.y,u.rg,'#8ddcff',.55);}break;
    case 'blade':if(hits%4===0){for(const e of ggNear(u.x,u.y,u.rg))ggHit(u,e,d*.5);ggRing(u.x,u.y,u.rg,'#22d3ee',.4);}break;
    case 'sniper':if(hits%3===0){ggHit(u,b,d*.7);ggLabel(b,'HEADSHOT','#fca5a5');}break;
    case 'mage':ggSlow(b,1.5);if(hits%5===0){ggFreeze(b,.8,.25);ggBoom(b.x,b.y,'#bfefff','frost');}break;
    case 'storm':if(hits%3===0){const done=new Set([b]);let last=b;const pts=[[b.x,b.y]];for(const p of [.5,.4,.3]){const n=G.en.filter(e=>e.hp>0&&!done.has(e)&&Math.hypot(e.x-last.x,e.y-last.y)<=90).sort((a,c)=>Math.hypot(a.x-last.x,a.y-last.y)-Math.hypot(c.x-last.x,c.y-last.y))[0];if(!n)break;ggHit(u,n,d*p);done.add(n);last=n;pts.push([n.x,n.y]);}if(pts.length>1)ggArc(pts,'#a5b4fc');}break;
    case 'assassin':if(hits%3===0)ggHit(u,b,d*.4);break;
    case 'ballista':if(hits%2===0){for(const e of ggBehind(b,70)){ggHit(u,e,d*.5);}const t=ggBehind(b,70).pop();if(t)ggLine([b.x,b.y],[t.x,t.y],'#fb923c');}break;
    case 'witch':for(const e of ggNear(b.x,b.y,45,b))ggHit(u,e,d*.25);if(hits%3===0){ggSunder(b,.2,3);ggSlow(b,3);ggLabel(b,'HEXED','#c084fc');ggRing(b.x,b.y,22,'#c084fc');}break;
    case 'berserker':if(hits%3===0)ggHit(u,b,d*.3);break;
    case 'oracle':if(hits%4===0){ggHit(u,b,d*.35);ggSunder(b,.25,4);ggLabel(b,'MARKED','#86efac');}break;
    case 'ranger':{const t=ggNear(u.x,u.y,u.rg,b).sort((a,c)=>c.d-a.d).slice(0,2);for(const e of t){ggHit(u,e,d*.45);ggLine([u.x,u.y-20],[e.x,e.y],'#a3e635');}break;}
    case 'pyro':ggBurn(u,b,.25,3);if(hits%4===0){for(const e of ggNear(b.x,b.y,55,b)){ggHit(u,e,d*.4);ggBurn(u,e,.25,3);}ggBoom(b.x,b.y,'#ff8a2a','explode');ggRing(b.x,b.y,55,'#ff8a2a');}break;
    case 'samurai':if(hits%3===0){for(const e of ggNear(b.x,b.y,60,b))ggHit(u,e,d*.6);ggHit(u,b,d*.6);ggRing(b.x,b.y,60,'#f0abfc',.35);}break;
    case 'tinker':if(hits%3===0){const pool=ggNear(u.x,u.y,u.rg);for(let i=0;i<4&&pool.length;i++){const e=pool[Math.floor(Math.random()*pool.length)];ggHit(u,e,d*.4);ggLine([u.x,u.y-20],[e.x,e.y],'#fdba74');}}break;
    case 'drake':if(hits%4===0){for(const e of [b,...ggNear(b.x,b.y,70,b)]){ggHit(u,e,d*.3);ggBurn(u,e,.3,3);}ggBoom(b.x,b.y,'#ff7849','explode');}break;
    case 'dragon':if(hits%3===0){for(const e of ggNear(b.x,b.y,65,b)){ggHit(u,e,d*.55);ggBurn(u,e,.25,3);}ggBurn(u,b,.25,3);ggRing(b.x,b.y,65,'#a855f7');}break;
    case 'warden':b.ggShieldX=Math.max(b.ggShieldX||0,3);if(hits%4===0){ggHit(u,b,d*.8);ggBoom(b.x,b.y,'#fde68a','burst');}break;
    case 'phoenix':ggBurn(u,b,.25,3);if(hits%4===0){for(const e of ggNear(b.x,b.y,70,b)){ggHit(u,e,d*.5);ggBurn(u,e,.25,3);}ggBoom(b.x,b.y,'#ff8a2a','explode');ggRing(b.x,b.y,70,'#ffb347');}break;
    case 'titan':if(hits%4===0){for(const e of ggNear(b.x,b.y,75,b)){ggHit(u,e,d*.45);ggStun(e,.6);}ggStun(b,.6,'QUAKE');ggRing(b.x,b.y,75,'#a3e635',.5);}break;
    case 'celestial':for(const e of ggNear(b.x,b.y,50,b))ggHit(u,e,d*.25);if(hits%3===0){for(const e of [b,...ggNear(b.x,b.y,65,b)]){ggHit(u,e,d*.6);ggBurn(u,e,.2,2);}ggBoom(b.x,b.y,'#fb923c','explode');}break;
    case 'void':if(hits%4===0){const pct=b.boss||b.kind==='miniboss'?.02:.06;ggHit(u,b,Math.min(d*2,Math.max(d*.6,b.hp*pct)));ggLabel(b,'SIPHON','#67e8f9');ggRing(b.x,b.y,24,'#67e8f9');}break;
    case 'leviathan':if(hits%4===0){for(const e of [b,...ggNear(b.x,b.y,80,b)]){ggHit(u,e,d*.45);ggSlow(e,1.5);ggKnock(e,20);}ggRing(b.x,b.y,80,'#7dd3fc',.55);}break;
    case 'paladin':if(hits%4===0){ggHit(u,b,d*.65);for(const v of G.us)if(Math.hypot(v.x-u.x,v.y-u.y)<=u.rg)v.ggBlessUntil=G.time+5;ggRing(u.x,u.y,u.rg,'#fde68a',.6);}break;
    case 'chronos':if(hits%4===0){ggFreeze(b,1,.3);for(const e of ggNear(b.x,b.y,50,b))ggFreeze(e,.5,.15);ggRing(b.x,b.y,50,'#80f0ff');ggLabel(b,'TIME LOCK','#80f0ff');}break;
    case 'seraph':if(hits%3===0){const t=ggNear(b.x,b.y,100,b).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y)).slice(0,2);ggSunder(b,.15,3);const pts=[[b.x,b.y]];for(const e of t){ggHit(u,e,d*.5);ggSunder(e,.15,3);pts.push([e.x,e.y]);}if(pts.length>1)ggArc(pts,'#bfdbfe');}break;
    case 'reptileking':ggPoison(u,b,.2,3,3);if(hits%4===0){for(const e of ggNear(b.x,b.y,65,b)){ggHit(u,e,d*.4);ggSlow(e,1.5);ggPoison(u,e,.2,3,3);}ggSlow(b,1.5);ggRing(b.x,b.y,65,'#84cc16');}break;
  }
}
// ----- Per-frame ticking: burn, poison, sunder and root timers, echo hits, fury decay -----
function ggAbilTick(dt){
  if(!G)return;
  for(const e of G.en){
    if(e.hp<=0)continue;
    e.ggShieldX=0;
    if(e.ggBurnT>0){e.ggBurnT-=dt;e.hp-=e.ggBurnDps*dt;e.lastHitUid=e.ggBurnUid;e.lastHitBoost=e.ggBurnBl;}
    if(e.ggPoisT>0){e.ggPoisT-=dt;e.hp-=e.ggPoisPer*e.ggPoisN*dt;e.lastHitUid=e.ggPoisUid;e.lastHitBoost=e.ggPoisBl;
      if(e.ggPoisSlow&&!(e.sl>0)&&e.kind!=='flyer'&&!(e.frozen>0||e.stunned>0))e.d=Math.max(0,e.d-e.v*e.ggPoisSlow*e.ggPoisN*dt);
      if(e.ggPoisT<=0){e.ggPoisN=0;e.ggPoisSlow=0;}}
    if(e.ggVulnT>0)e.ggVulnT-=dt;
    if(e.ggRootT>0)e.ggRootT-=dt;
    if(e.ggKnockT>0)e.ggKnockT-=dt;
  }
  if(G.ggQ&&G.ggQ.length){for(const q of G.ggQ){q.t-=dt;if(q.t<=0&&q.e.hp>0){ggHit(q.u,q.e,q.amt);ggLabel(q.e,'ECHO','#f0abfc');ggRing(q.e.x,q.e.y,18,q.col,.3);}}G.ggQ=G.ggQ.filter(q=>q.t>0);}
  for(const u of G.us)if(u.id==='berserker'&&u.ggFury&&G.time-(u.ggLastAtk||0)>2)u.ggFury=0;
  if(G.ggFx){for(const f of G.ggFx)f.l-=dt;G.ggFx=G.ggFx.filter(f=>f.l>0);}
}
(function(){const orig=enemyAbilitiesPre;enemyAbilitiesPre=function(dt){const r=orig.apply(this,arguments);try{ggAbilTick(dt)}catch(x){}
  // Burn and poison damage happens after the frame's starting health is recorded so shields, Tide Crab dives and Sunder apply to it.
  return r;};})();
// ----- Drawing: status icons under enemies, ability rings and arcs, buffed-unit sparkles -----
function ggDrawStatus(){
  if(!G||!G.en)return;const c=cx,t=performance.now()/1000;c.save();c.setTransform(1,0,0,1,0,0);
  for(const f of (G.ggFx||[])){const a=Math.max(0,f.l/f.max);c.globalAlpha=a;c.strokeStyle=f.col;c.shadowColor=f.col;c.shadowBlur=8;
    if(f.k==='ring'){c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,f.r*(1.05-.25*a),0,Math.PI*2);c.stroke();}
    else if(f.k==='arc'){c.lineWidth=2.4;c.beginPath();f.pts.forEach((p,i)=>{const jx=i&&i<f.pts.length-1?0:0;if(!i)c.moveTo(p[0],p[1]);else{const q=f.pts[i-1],mx=(q[0]+p[0])/2+(Math.random()*10-5),my=(q[1]+p[1])/2+(Math.random()*10-5);c.lineTo(mx,my);c.lineTo(p[0]+jx,p[1]);}});c.stroke();}
    else if(f.k==='line'){c.lineWidth=2;c.beginPath();c.moveTo(f.a[0],f.a[1]);c.lineTo(f.b[0],f.b[1]);c.stroke();}}
  c.shadowBlur=0;c.globalAlpha=1;
  const look=typeof ENEMY_LOOK!=='undefined'?ENEMY_LOOK:{};
  for(const e of G.en){
    if(e.hp<=0||e.x==null)continue;
    const pips=[];
    if(e.ggBurnT>0)pips.push(['#ff8a2a','B']);
    if(e.ggPoisT>0)pips.push(['#7cff6b',e.ggPoisN>1?String(e.ggPoisN):'P']);
    if(e.ggVulnT>0)pips.push(['#c084fc','S']);
    if(e.ggRootT>0)pips.push(['#65a30d','R']);
    else if(e.stunned>0)pips.push(['#fde68a','!']);
    if(e.frozen>0)pips.push(['#bfefff','F']);
    if(e.ggBurnT>0&&ggFxOn()){c.globalAlpha=.55;c.fillStyle='#ff8a2a';for(let i=0;i<2;i++){const ph=(t*2.2+i*.5+(e.d%7)*.13)%1;c.beginPath();c.arc(e.x+(i?5:-5),e.y-6-ph*12,2.6*(1-ph)+.6,0,Math.PI*2);c.fill();}c.globalAlpha=1;}
    if(e.ggPoisT>0&&ggFxOn()){c.globalAlpha=.5;c.fillStyle='#7cff6b';const ph=(t*1.6+(e.d%5)*.2)%1;c.beginPath();c.arc(e.x+3,e.y-4-ph*10,2.2*(1-ph)+.5,0,Math.PI*2);c.fill();c.globalAlpha=1;}
    if(e.ggRootT>0){c.strokeStyle='#4d7c0f';c.lineWidth=2;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(e.x+i*6,e.y+10);c.quadraticCurveTo(e.x+i*9,e.y+2,e.x+i*4,e.y-2);c.stroke();}}
    if(!pips.length)continue;
    const r=((look[e.kind]&&look[e.kind].r)||(e.boss?20:12)),y=e.y+r+9,w=pips.length*11;
    pips.forEach((p,i)=>{const x=e.x-w/2+5.5+i*11;c.fillStyle='#0b0b16';c.beginPath();c.arc(x,y,5.4,0,Math.PI*2);c.fill();c.fillStyle=p[0];c.beginPath();c.arc(x,y,4.2,0,Math.PI*2);c.fill();
      c.fillStyle='#0b0b16';c.font='bold 6.5px system-ui,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(p[1],x,y+.3);});
  }
  for(const u of G.us){const blessed=u.ggBlessUntil&&G.time<u.ggBlessUntil,fury=u.ggFury>0;
    let calm=false;for(const k of G.us)if(k.id==='monk'&&Math.hypot(k.x-u.x,k.y-u.y)<=k.rg){calm=true;break;}
    if(!blessed&&!fury&&!calm)continue;let i=0;
    const mark=(col)=>{const x=u.x+14-i*7,y=u.y-30+Math.sin(t*3+i)*1.5;c.fillStyle=col;c.beginPath();c.moveTo(x,y-4);c.lineTo(x+3.4,y+1.5);c.lineTo(x-3.4,y+1.5);c.closePath();c.fill();i++;};
    if(blessed)mark('#fde68a');if(calm)mark('#93c5fd');if(fury)mark('#f87171');}
  c.restore();
}
(function(){const orig=draw;draw=function(){const r=orig.apply(this,arguments);try{ggDrawStatus()}catch(x){}return r;};})();
// ----- Unit cards: ability name, role tags and a status legend -----
function ggRoleChips(id){const A=ggAbilInfo(id);if(!A)return'';return '<div class="gg-roles">'+A.r.map(k=>'<span class="gg-role" style="--rc:'+GG_ROLES[k][1]+'">'+GG_ROLES[k][0]+'</span>').join('')+'</div>';}
function ggEsc(s){return String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
function ggAbilityHtml(id,extraLines){const U=UNITS[id],A=ggAbilInfo(id);let h='';
  if(extraLines)h+=extraLines.map(l=>'<p class="gg-abil-line">'+ggEsc(l)+'</p>').join('');
  if(A)h+='<div class="gg-abil"><div class="gg-abil-name">'+(typeof GGI!=='undefined'&&GGI.sparkle?'<span class="ggi-wrap">'+GGI.sparkle+'</span>':'')+ggEsc(A.n)+'</div>'+ggRoleChips(id)+'<p>'+ggEsc(A.d)+'</p></div>';
  else h+='<p>'+ggEsc((U&&U.ability)||'Standard attack')+'</p>';
  return h;}
(function(){
  const o1=showUnitInfo;showUnitInfo=function(uid){const r=o1.apply(this,arguments);try{const inst=S.units.find(i=>i.uid===uid);if(inst){const b=$('#unitInfoBody');b.innerHTML=ggAbilityHtml(inst.id);b.classList.remove('hide');}}catch(x){}return r;};
  const o2=ggShowUnitById;ggShowUnitById=function(id){const r=o2.apply(this,arguments);try{const u=UNITS[id];if(u){$('#unitInfoBody').innerHTML=ggAbilityHtml(id,['Damage '+u.d+(u.rg?' · Range '+u.rg:'')+' · Cost '+u.c+' coins']);}}catch(x){}return r;};
})();
// Battle info: a short legend of the status icons, added to the Help screen if present.
(function(){const h=$('#ggHelp .settings-box')||$('#ggHelp');if(!h||h.querySelector('.gg-status-legend'))return;
  h.insertAdjacentHTML('beforeend','<div class="gg-status-legend"><h3>Ability effects</h3><p><b style="color:#ff8a2a">B</b> Burn: damage every second; burning enemies heal 50% less. <b style="color:#7cff6b">P</b> Poison: damage every second, stacks up to 3. <b style="color:#c084fc">S</b> Sunder: takes extra damage from every unit. <b style="color:#fde68a">!</b> Stun and <b style="color:#65a30d">R</b> Root: cannot move. <b style="color:#bfefff">F</b> Freeze: cannot move. Flying enemies ignore slow, stun, root and freeze. Bosses resist stuns and freezes.</p></div>');})();
