// ---------- Path summons fight by collision; enemy HP numbers (2026.10.11.32) ----------
// Every creature a unit summons onto the road (Abyss Summoner's shadow monsters and Elite Ghouls,
// Abyss Monarch's Hell Wolves) now:
//  - appears at your base and walks the road toward the enemy entrance;
//  - never shoots: it damages enemies by running into them. It can't walk through a living enemy, so it
//    keeps ramming the enemy in front of it (one hit per enemy every 0.6 s) until one of them falls;
//  - has its own HP bar: HP = 275% of the summoning unit's damage (its damage +175%), so every boost
//    of the unit (+35% damage) also gives its creatures +35% HP, including creatures already on the road;
//  - loses HP on every collision: 8% of that enemy's max HP (5% for bosses and mini-bosses).
//    It is knocked back a little on each hit and disappears when its HP runs out or it reaches the entrance.
const GG_ALLY_HP_MULT=2.75,GG_ALLY_HIT_CD=.6;
function ggAllyHp(u){return Math.max(1,(u&&u.d||0)*GG_ALLY_HP_MULT);}
function ggAllyRecoil(e){return Math.max(1,(e.mx||e.hp||0)*(e.boss?.05:.08));}
function ggAllyRadius(a){return a.kind==='ghoul'?14:a.kind==='wolf'?12:10;}
function ggEnemyRadius(e){
  if(typeof GGA==='undefined')return e.boss?18:e.kind==='tank'?14:e.kind==='runner'?9:e.kind==='elite'?13:11;
  const kind=e.boss?'boss':(GGA.ENEMY_LOOK[e.kind]?e.kind:'normal');return kind==='boss'?18:(GGA.ENEMY_LOOK[kind].r||11);}
// Short numbers: exact below 10,000 (1000/1000), then 12.3K, 123K, 1.2M, 4.5B, 6.7T.
function ggHpNum(v){v=Math.max(0,Math.ceil(v||0));if(v<1e4)return String(v);
  for(const [n,s] of [[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']])if(v>=n){const x=v/n;return (x<100?(Math.floor(x*10)/10).toFixed(1).replace(/\.0$/,''):Math.floor(x))+s;}
  return String(v);}
// Spawn at the player base (end of the enemy path). kind: 'shadow', 'ghoul' or 'wolf'.
summonPathAlly=function(owner,elite,hp,damage,offset=0,kind){
  if(!G)return;G.allies=G.allies||[];
  kind=kind||(elite?'ghoul':'shadow');
  const d=Math.max(0,G.tot-8-Math.max(0,offset)),[x,y]=posAt(d);
  hp=Math.max(1,+hp||1);
  const a={owner,elite:!!elite,kind,d,x,y,life:hp,maxLife:hp,damage,ttl:Math.max(35,G.tot/105+8),
    speed:kind==='wolf'?175:elite?125:145,hits:new Map(),bump:0,flash:0,dir:-1};
  G.allies.push(a);return a;};
// Move, collide, take damage.
function ggAlliesStep(dt){
  G.allies=G.allies||[];G.allyFx=G.allyFx||[];
  for(const f of G.allyFx)f.l-=dt;G.allyFx=G.allyFx.filter(f=>f.l>0);
  const now=G.time||0;
  for(const a of G.allies){
    a.ttl-=dt;if(a.ttl<=0||a.life<=0)continue;
    a.flash=Math.max(0,(a.flash||0)-dt);
    if(!Number.isFinite(a.d)){a.ttl=0;continue;}
    const px=a.x;
    if(a.bump>0){a.bump-=dt;a.d=Math.min(G.tot,a.d+70*dt);}
    else a.d=Math.max(0,a.d-(a.speed||145)*dt);
    const rA=ggAllyRadius(a);
    // A creature can't walk through a living enemy in front of it: it stays in contact and keeps ramming it
    // (enemies are never blocked and push it back as they advance).
    for(const e of G.en){if(e.hp<=0||e.leak||e.submerged>0||e.d>a.d)continue;const hold=e.d+(rA+ggEnemyRadius(e)*.8)*.85;if(a.d<hold)a.d=Math.min(G.tot,hold);}
    [a.x,a.y]=posAt(a.d);if(Math.abs(a.x-px)>.05)a.dir=a.x<px?-1:1;
    if(a.d<=0){a.ttl=0;continue;}
    if(!(a.hits instanceof Map))a.hits=new Map();
    for(const e of G.en){
      if(e.hp<=0||e.leak||e.submerged>0)continue;
      if(Math.abs(e.d-a.d)>rA+ggEnemyRadius(e)*.8)continue;
      const last=a.hits.get(e);if(last!=null&&now-last<GG_ALLY_HIT_CD)continue;
      a.hits.set(e,now);
      e.hp-=a.damage;
      a.life-=ggAllyRecoil(e);a.flash=.16;a.bump=.14;
      if(S.settings.attackFx&&G.allyFx.length<80)G.allyFx.push({x:(a.x+e.x)/2,y:(a.y+e.y)/2-6,l:.3,max:.3,c:a.kind==='wolf'?'#f43f5e':a.elite?'#ff3656':'#c084fc'});
      if(a.life<=0){a.life=0;a.ttl=0;if(S.settings.attackFx&&G.allyFx.length<80)G.allyFx.push({x:a.x,y:a.y-6,l:.45,max:.45,c:'#e9d5ff',poof:1});break;}
    }
    if(a.hits.size>40)for(const [e] of a.hits)if(e.hp<=0||!G.en.includes(e))a.hits.delete(e);
  }
  G.allies=G.allies.filter(a=>a.ttl>0&&a.life>0);
}
// Each boost: +35% damage for the unit, so its creatures on the road also get +35% HP and damage.
(function(){const o=upgradePlacedUnit;upgradePlacedUnit=function(u){const b=u&&u.bl,r=o.apply(this,arguments);
  try{if(r&&G&&u.bl>b)for(const a of (G.allies||[]))if(a.owner===u.uid){a.maxLife*=1.35;a.life*=1.35;a.damage*=1.35;}}catch(e){}return r;};})();
// Drawing: creature, then its HP bar (teal, so it never looks like an enemy bar).
function ggDrawAllies(){
  const t=performance.now()/1000;
  for(const a of (G.allies||[])){
    if(a.kind==='wolf'){
      if(typeof GGA!=='undefined')GGA.drawWolf(cx,a.x,a.y,t,a.dir||-1);
      else{cx.save();cx.translate(a.x,a.y);cx.fillStyle='#371a20';cx.beginPath();cx.ellipse(0,0,11,7,0,0,7);cx.fill();cx.restore();}
    }else drawSummonedCreature(a);
    if(a.flash>0){cx.save();cx.globalAlpha=Math.min(.55,a.flash*3.4);cx.fillStyle='#ffffff';cx.beginPath();cx.ellipse(a.x,a.y-4,ggAllyRadius(a)+2,ggAllyRadius(a)+4,0,0,7);cx.fill();cx.restore();}
    const w=a.kind==='ghoul'?30:24,top=a.y-(a.kind==='ghoul'?36:a.kind==='wolf'?24:30),p=Math.max(0,Math.min(1,a.life/a.maxLife));
    cx.fillStyle='#0b0f1c';cx.fillRect(a.x-w/2,top,w,4);
    cx.fillStyle=p>.35?'#2dd4bf':'#f59e0b';cx.fillRect(a.x-w/2,top,w*p,4);
    cx.strokeStyle='#e6fffb';cx.globalAlpha=.75;cx.lineWidth=1;cx.strokeRect(a.x-w/2-.5,top-.5,w+1,5);cx.globalAlpha=1;
  }
  for(const f of (G.allyFx||[])){const k=1-f.l/f.max;cx.save();cx.globalAlpha=Math.max(0,1-k);cx.strokeStyle=f.c;cx.lineWidth=f.poof?2:2.5;
    cx.beginPath();cx.arc(f.x,f.y,(f.poof?6:4)+k*(f.poof?16:11),0,7);cx.stroke();cx.restore();}
}
// Enemy HP numbers above every enemy health bar (Settings â Enemy HP numbers).
function ggEnemyHpLabels(){
  if(!G||S.settings.hpNumbers===false)return;
  cx.save();cx.font='bold 9px system-ui,-apple-system,Segoe UI,sans-serif';cx.textAlign='center';cx.textBaseline='alphabetic';cx.lineJoin='round';cx.lineWidth=2.6;cx.strokeStyle='rgba(5,8,18,.92)';
  for(const e of G.en){
    if(e.hp<=0||e.leak)continue;
    const r=ggEnemyRadius(e),y=e.y-r-(e.shield>0&&e.shMax?24:19),txt=ggHpNum(e.hp)+'/'+ggHpNum(e.mx);
    cx.strokeText(txt,e.x,y);cx.fillStyle=e.boss?'#ffd6de':'#ffffff';cx.fillText(txt,e.x,y);
  }
  cx.restore();
}
if(typeof S.settings.hpNumbers!=='boolean')S.settings.hpNumbers=true;
try{syncSettings();}catch(e){}
// Descriptions.
UNITS.abyss_summoner.ability='Summons three shadow monsters every 5 seconds at your base; they walk the road toward the enemy entrance and ram enemies (55% damage per collision). Each has HP equal to 275% of this unit\'s damage and loses HP on every collision. At map boost 5/5 summons two Elite Ghouls instead (150% damage per collision)';
if(typeof GG_ABIL_TEXT!=='undefined'&&GG_ABIL_TEXT.abyss)GG_ABIL_TEXT.abyss.d='Every 15s releases 2 Hell Wolves at your base that race up the road toward the enemy entrance, ramming enemies for 125% damage per collision. Each wolf has HP equal to 275% of this unit\'s damage and loses HP on every collision. Every 3rd attack deals +95% damage, and hits slow the target briefly.';
