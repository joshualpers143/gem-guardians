// ---------- Battle effects (2026.10.11.17) ----------
// Adds feedback on top of the existing art: hit flashes and sparks, death bursts with coins that
// fly to the coin counter, wave and boss banners, a boss health bar, screen shake, a red flash when
// a life is lost, placement and boost effects, and victory confetti. It only watches the battle
// state each frame, so game rules are unchanged. Performance mode keeps only banners and the boss bar.
const ggJuicePrefs=(()=>{let p={};try{p=JSON.parse(localStorage.getItem('gemGuardiansJuicePrefs')||'{}')||{}}catch(e){}return Object.assign({shake:true},p);})();
function ggJuiceSave(){try{localStorage.setItem('gemGuardiansJuicePrefs',JSON.stringify(ggJuicePrefs))}catch(e){}}
const GGJ={parts:[],rings:[],banner:null,shake:0,vignette:0,flash:0,last:0,prevEn:[],prevLives:null,prevWave:0,units:new Map(),bossSeen:new WeakSet(),overSeen:false,G:null,coinPulse:0};
const GGJ_COL={normal:'#ff5d5d',tank:'#b98cff',runner:'#7dffb2',elite:'#ff2b54',shield:'#7dd3fc',flyer:'#c79bff',healer:'#7cf08a',splitter:'#a6ff4d',gloopling:'#c6ff7a',dasher:'#9aa8ff',berserk:'#ff8a3d',burrower:'#ffb067',boss:'#ff3b6b',miniboss:'#ff7a45'};
function ggjLite(){return !!(typeof ggFx!=='undefined'&&ggFx.perf)||(typeof S!=='undefined'&&S.settings&&S.settings.attackFx===false);}
function ggjReset(){GGJ.parts.length=0;GGJ.rings.length=0;GGJ.banner=null;GGJ.shake=0;GGJ.vignette=0;GGJ.flash=0;GGJ.prevEn=[];GGJ.prevLives=G?G.lives:null;GGJ.prevWave=G?G.wave:0;GGJ.units=new Map();GGJ.overSeen=false;GGJ.G=G;try{cv.style.transform=''}catch(e){}}
function ggjShake(a){if(ggJuicePrefs.shake&&!ggjLite())GGJ.shake=Math.max(GGJ.shake,a);}
function ggjBurst(x,y,col,n,spd,life,size,extra){if(ggjLite())return;n=Math.min(n,260-GGJ.parts.length);for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=spd*(.35+Math.random()*.75);GGJ.parts.push(Object.assign({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-spd*.25,g:220,l:life*(.6+Math.random()*.5),max:life,r:size*(.6+Math.random()*.7),c:col,add:true},extra||{}));}}
function ggjRing(x,y,col,r0,r1,life,w){if(ggjLite())return;GGJ.rings.push({x,y,c:col,r0,r1,l:life,max:life,w:w||3});}
function ggjBanner(text,sub,kind){GGJ.banner={text,sub:sub||'',kind:kind||'wave',t:0,dur:kind==='boss'?2.4:1.7};}
function ggjCoinTarget(){const b=document.getElementById('bsCoins'),bs=document.getElementById('battleStats');
  if(b&&bs&&!bs.classList.contains('hide')){const r=cv.getBoundingClientRect(),q=b.getBoundingClientRect();if(r.width&&q.width)return [(q.left+q.width/2-r.left)*800/r.width,(q.top+q.height/2-r.top)*450/r.height];}
  return [770,18];}
function ggjCoin(x,y){if(ggjLite()||GGJ.parts.filter(p=>p.coin).length>40)return;const [tx,ty]=ggjCoinTarget();GGJ.parts.push({coin:true,x,y,sx:x,sy:y,tx,ty,l:1,max:1,t:-Math.random()*.15,c:'#ffc533',r:4.5});}
function ggjUpdate(dt){
  if(!G){return;}
  if(GGJ.G!==G)ggjReset();
  // enemies: hits, deaths, bosses
  const now=G.en;
  for(const e of now){
    if(e._jl!=null&&e.hp<e._jl&&e.hp>0){const dmg=e._jl-e.hp;e._jf=.12;
      if(!ggjLite()&&(!e._js||performance.now()-e._js>110)){e._js=performance.now();const big=dmg>e.mx*.12;ggjBurst(e.x,e.y-8,big?'#ffe27a':'#ffffff',big?7:3,big?150:95,.28,big?2.6:1.8);if(big)ggjShake(e.boss?3:1.5);}}
    e._jl=e.hp;if(e._jf>0)e._jf-=dt;
    if(e.boss&&!GGJ.bossSeen.has(e)){GGJ.bossSeen.add(e);const nm=e.kind==='miniboss'?'Mini-Boss':'Boss';ggjBanner('⚠ '+nm.toUpperCase()+' ⚠',nm==='Boss'?'A powerful enemy approaches!':'A tough enemy approaches!','boss');ggjShake(e.kind==='boss'?9:6);GGJ.vignette=Math.max(GGJ.vignette,.6);}
  }
  const cur=new Set(now);
  for(const e of GGJ.prevEn){if(cur.has(e))continue;
    if(e.hp<=0&&!e.leak){const col=GGJ_COL[e.kind]||'#ff6b6b';
      if(e.boss){ggjBurst(e.x,e.y-10,'#ffd34d',44,260,1,4);ggjBurst(e.x,e.y-10,col,30,200,.9,3.5);ggjRing(e.x,e.y-10,'#ffd34d',8,120,.7,6);ggjShake(e.kind==='boss'?12:8);for(let i=0;i<6;i++)ggjCoin(e.x+(Math.random()-.5)*30,e.y-10+(Math.random()-.5)*20);}
      else{ggjBurst(e.x,e.y-8,col,12,140,.55,2.8);ggjBurst(e.x,e.y-8,'#ffffff',4,70,.35,2);ggjRing(e.x,e.y-8,col,4,26,.35,2);ggjCoin(e.x,e.y-8);
        if(!ggjLite())GGJ.parts.push({soul:true,x:e.x,y:e.y-10,vx:0,vy:-38,g:0,l:.8,max:.8,r:5,c:'#e9e2ff',add:true});}}}
  GGJ.prevEn=now.slice();
  // lives lost
  if(GGJ.prevLives!=null&&G.lives<GGJ.prevLives){GGJ.vignette=Math.max(GGJ.vignette,1);ggjShake(5);}
  GGJ.prevLives=G.lives;
  // waves
  if(G.wave>GGJ.prevWave&&G.wave>0){const max=G.mode==='infinite'?0:(G.raidLevel?raidMaxWave(G.raidLevel):15);
    if(!(GGJ.banner&&GGJ.banner.kind==='boss'))ggjBanner(max&&G.wave===max?'FINAL WAVE':'WAVE '+G.wave,max?('Wave '+G.wave+' of '+max):'',max&&G.wave===max?'final':'wave');}
  GGJ.prevWave=G.wave;
  // placement and boosts
  const seen=new Set();
  for(const u of G.us){seen.add(u);const old=GGJ.units.get(u);
    if(old==null){ggjRing(u.x,u.y+4,'#ffffff',6,34,.4,3);ggjBurst(u.x,u.y+6,'#d9c7a0',10,90,.45,2.4,{add:false,g:260});}
    else if(u.bl>old){ggjRing(u.x,u.y,'#ffd34d',8,40,.55,4);ggjRing(u.x,u.y,'#fff3c4',4,26,.45,2);ggjBurst(u.x,u.y-6,'#ffd34d',14,120,.6,2.4,{vy:-90});
      if(!ggjLite())GGJ.parts.push({txt:'BOOST '+u.bl,x:u.x,y:u.y-30,vx:0,vy:-30,g:0,l:.9,max:.9,c:'#ffd34d'});}
    GGJ.units.set(u,u.bl);}
  for(const k of [...GGJ.units.keys()])if(!seen.has(k))GGJ.units.delete(k);
  // victory
  if(G.over&&!GGJ.overSeen){GGJ.overSeen=true;if(G.victory&&!ggjLite()){for(let i=0;i<90;i++)GGJ.parts.push({conf:true,x:Math.random()*800,y:-10-Math.random()*120,vx:(Math.random()-.5)*60,vy:60+Math.random()*90,g:30,l:3+Math.random()*1.5,max:4.5,r:3+Math.random()*3,rot:Math.random()*6,vr:(Math.random()-.5)*10,c:['#ffd34d','#7fe3ff','#ff68e9','#7cf08a','#ffffff','#a78bfa'][i%6]});}}
  // simulate
  for(const p of GGJ.parts){p.l-=dt;
    if(p.coin){p.t+=dt;p.l=1;const k=Math.min(1,p.t/.7);const e=k*k*(3-2*k);p.x=p.sx+(p.tx-p.sx)*e;p.y=p.sy+(p.ty-p.sy)*e-Math.sin(Math.PI*k)*40;if(k>=1){p.l=0;GGJ.coinPulse=.25;}}
    else{p.vy+=(p.g||0)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.rot!=null)p.rot+=p.vr*dt;}}
  GGJ.parts=GGJ.parts.filter(p=>p.l>0);
  for(const r of GGJ.rings)r.l-=dt;GGJ.rings=GGJ.rings.filter(r=>r.l>0);
  if(GGJ.banner){GGJ.banner.t+=dt;if(GGJ.banner.t>GGJ.banner.dur)GGJ.banner=null;}
  GGJ.vignette=Math.max(0,GGJ.vignette-dt*1.8);
  GGJ.shake=Math.max(0,GGJ.shake-dt*28);
  if(GGJ.coinPulse>0){GGJ.coinPulse-=dt;const b=document.getElementById('bsCoins');if(b&&!b.parentElement.classList.contains('bs-pulse')){b.parentElement.classList.add('bs-pulse');setTimeout(()=>b.parentElement.classList.remove('bs-pulse'),220);}}
}
function ggjDraw(){
  if(!G)return;const c=cx;c.save();c.setTransform(1,0,0,1,0,0);
  // hit flashes
  c.globalCompositeOperation='lighter';
  for(const e of G.en){if(e._jf>0&&e.hp>0){const r=e.boss?26:14;c.globalAlpha=Math.min(.55,e._jf*4.5);const g=c.createRadialGradient(e.x,e.y-8,0,e.x,e.y-8,r);g.addColorStop(0,'#ffffff');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(e.x,e.y-8,r,0,Math.PI*2);c.fill();}}
  // rings
  for(const r of GGJ.rings){const k=1-r.l/r.max;c.globalAlpha=(1-k)*.9;c.strokeStyle=r.c;c.lineWidth=r.w*(1-k*.6);c.beginPath();c.arc(r.x,r.y,r.r0+(r.r1-r.r0)*k,0,Math.PI*2);c.stroke();}
  // particles
  for(const p of GGJ.parts){const a=Math.max(0,Math.min(1,p.l/p.max));
    if(p.txt){c.globalCompositeOperation='source-over';c.globalAlpha=Math.min(1,a*1.6);c.font='900 13px "Trebuchet MS",Verdana,sans-serif';c.textAlign='center';c.lineWidth=3.5;c.strokeStyle='rgba(20,10,0,.85)';c.strokeText(p.txt,p.x,p.y);c.fillStyle=p.c;c.fillText(p.txt,p.x,p.y);c.globalCompositeOperation='lighter';continue;}
    if(p.conf){c.globalCompositeOperation='source-over';c.globalAlpha=Math.min(1,a*2);c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.c;c.fillRect(-p.r,-p.r*.45,p.r*2,p.r*.9);c.restore();c.globalCompositeOperation='lighter';continue;}
    if(p.coin){c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#ffc533';c.strokeStyle='#8a5a00';c.lineWidth=1.4;c.beginPath();c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff6c9';c.beginPath();c.arc(p.x-1.4,p.y-1.4,1.4,0,Math.PI*2);c.fill();c.globalCompositeOperation='lighter';continue;}
    if(p.soul){c.globalAlpha=a*.55;const g=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2.2);g.addColorStop(0,p.c);g.addColorStop(1,'rgba(233,226,255,0)');c.fillStyle=g;c.beginPath();c.arc(p.x,p.y,p.r*2.2,0,Math.PI*2);c.fill();continue;}
    c.globalCompositeOperation=p.add===false?'source-over':'lighter';c.globalAlpha=a;c.fillStyle=p.c;c.beginPath();c.arc(p.x,p.y,Math.max(.4,p.r*(.4+a*.6)),0,Math.PI*2);c.fill();}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;
  // boss health bar
  const boss=G.en.filter(e=>e.boss&&e.hp>0).sort((a,b)=>b.mx-a.mx)[0];
  if(boss){const w=300,x=400-w/2,y=50,k=Math.max(0,boss.hp/boss.mx);
    c.fillStyle='rgba(10,6,24,.78)';c.beginPath();c.roundRect?c.roundRect(x-8,y-18,w+16,34,10):c.rect(x-8,y-18,w+16,34);c.fill();
    c.font='900 11px "Trebuchet MS",Verdana,sans-serif';c.textAlign='center';c.fillStyle='#ffd0d8';c.fillText((boss.kind==='miniboss'?'MINI-BOSS':'BOSS')+'  ·  '+Math.ceil(k*100)+'%',400,y-5);
    c.fillStyle='#3a0d18';c.fillRect(x,y,w,9);const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#ff3b6b');g.addColorStop(1,'#ff9a3d');c.fillStyle=g;c.fillRect(x,y,w*k,9);c.strokeStyle='#ffd0d8';c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,8);}
  // red vignette when a life is lost or a boss arrives
  if(GGJ.vignette>0){const g=c.createRadialGradient(400,225,150,400,225,470);g.addColorStop(0,'rgba(255,0,40,0)');g.addColorStop(1,'rgba(255,20,60,'+(.55*Math.min(1,GGJ.vignette))+')');c.fillStyle=g;c.fillRect(0,0,800,450);}
  // banner
  const B=GGJ.banner;if(B){const t=B.t,d=B.dur,inT=.22,outT=.35;const k=t<inT?t/inT:t>d-outT?Math.max(0,(d-t)/outT):1;
    const slide=t<inT?(1-k)*-220:t>d-outT?(1-k)*220:0;const boss=B.kind==='boss',fin=B.kind==='final';
    c.globalAlpha=k*.85;const by=boss?190:200,bh=boss?74:56;const g=c.createLinearGradient(0,0,800,0);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.2,boss?'rgba(90,0,20,.9)':fin?'rgba(90,50,0,.88)':'rgba(30,18,80,.85)');g.addColorStop(.8,boss?'rgba(90,0,20,.9)':fin?'rgba(90,50,0,.88)':'rgba(30,18,80,.85)');g.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=g;c.fillRect(0,by,800,bh);
    if(boss){c.save();c.beginPath();c.rect(0,by,800,bh);c.clip();c.globalAlpha=k*.25;c.fillStyle='#ffcc00';const off=(t*90)%40;for(let i=-2;i<24;i++){c.beginPath();c.moveTo(i*40+off,by);c.lineTo(i*40+20+off,by);c.lineTo(i*40+off,by+bh);c.lineTo(i*40-20+off,by+bh);c.fill();}c.restore();}
    c.globalAlpha=k;c.textAlign='center';c.font='900 '+(boss?34:30)+'px "Trebuchet MS",Verdana,sans-serif';c.lineWidth=6;c.strokeStyle='rgba(10,4,20,.9)';
    const ty=by+(B.sub?bh*.52:bh*.66);c.strokeText(B.text,400+slide,ty);c.fillStyle=boss?'#ff5c7a':fin?'#ffd34d':'#ffffff';c.fillText(B.text,400+slide,ty);
    if(B.sub){c.font='800 13px "Trebuchet MS",Verdana,sans-serif';c.lineWidth=4;c.strokeText(B.sub,400+slide,ty+19);c.fillStyle='#e6e0ff';c.fillText(B.sub,400+slide,ty+19);}}
  c.restore();
  // screen shake (CSS transform on the canvas, so taps still map correctly after it settles)
  if(GGJ.shake>0.3){const s=GGJ.shake;cv.style.transform='translate('+((Math.random()-.5)*s).toFixed(1)+'px,'+((Math.random()-.5)*s).toFixed(1)+'px)';}
  else if(cv.style.transform)cv.style.transform='';
}
(function(){const orig=draw;draw=function(){const r=orig.apply(this,arguments);try{const t=performance.now();let dt=GGJ.last?(t-GGJ.last)/1000:0;GGJ.last=t;dt=Math.min(.05,dt)*(G&&G.paused?0:1);
  if(G){ggjUpdate(dt);ggjDraw();}else if(GGJ.G){GGJ.G=null;cv.style.transform='';}}catch(e){}return r;};})();
// Settings: screen shake toggle (next to the summon animation toggle).
(function(){const ref=$('#ggRevealToggle')?.closest('label.setting')||$('#ggPerf')?.closest('label.setting');if(!ref)return;
  ref.insertAdjacentHTML('afterend','<label class="setting"><span><b>📳 Screen shake</b><small>Shake the battlefield on boss arrivals, big hits and lost lives. Saved on this device only.</small></span><input type="checkbox" id="ggShakeToggle"></label>');
  const t=$('#ggShakeToggle');t.checked=ggJuicePrefs.shake;t.onchange=()=>{ggJuicePrefs.shake=t.checked;ggJuiceSave();if(!t.checked){GGJ.shake=0;cv.style.transform='';}};})();
