// ---------- Rare pull celebrations and the new summon banner (2026.10.11.42) ----------
// Mythic pulls get a highlight; Secret pulls get a full cinematic (dark screen, crimson lightning, shockwave,
// embers, the unit's 3D portrait). Works for Summon x1/x10, Summon again and Auto Summon (Auto Summon is never
// paused: its celebrations do not block taps and fade by themselves). Settings -> Mythic & Secret pull effects.
const GGC_KEY='gemGuardiansCelebPrefs';
const ggCeleb=(()=>{let p={};try{p=JSON.parse(localStorage.getItem(GGC_KEY)||'{}')||{}}catch(e){}return Object.assign({on:true},p);})();
const GGC_COL={Mythic:['#ff68e9','#ffd27a','#fff2ff'],Secret:['#ff314d','#ff9aa8','#2a0008']};
const GGC={q:[],busy:false,raf:0,stats:{Mythic:0,Secret:0},last:null};
document.body.insertAdjacentHTML('beforeend','<div id="ggCeleb" class="ggc hide" aria-live="assertive"><canvas id="ggCelebCv"></canvas><div class="ggc-flash"></div><div class="ggc-card"><div class="ggc-kicker"></div><div class="ggc-port"></div><div class="ggc-name"></div><div class="ggc-sub"></div></div><button type="button" class="ggc-skip">Tap to continue</button></div>');
function ggcReduced(){try{return matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
function ggcPortrait(id){try{if(typeof gg3dPortrait==='function'&&G3.on&&!G3.failed){const im=gg3dPortrait(id);if(im){const c=document.createElement('canvas');c.width=288;c.height=256;c.getContext('2d').drawImage(im,0,0);return c;}}}catch(e){}
  const c=document.createElement('canvas');c.className='ico';c.width=72;c.height=64;c.dataset.id=id;setTimeout(()=>{try{paintIcons()}catch(e){}},0);return c;}
// Parse the last summon from the results line (the same source the reveal cards use).
function ggcLastPull(){const res=$('#res');if(!res)return [];const byName={};Object.keys(UNITS).forEach(id=>{byName[UNITS[id].n]=id;});
  return [...res.querySelectorAll('b[class]')].map(b=>{const name=b.textContent.replace(/ \(auto-sold\)$/,'');return {id:byName[name],r:b.className};}).filter(x=>x.id);}
// mode: 'intro' (blocks taps, before the reveal cards), 'auto' (never blocks; Auto Summon or reveal off)
function ggCelebrate(best,ids,mode,done){if(!ggCeleb.on||!(best==='Mythic'||best==='Secret')){if(done)done();return;}
  GGC.stats[best]=(GGC.stats[best]||0)+1;GGC.last={best,ids,mode};
  if(GGC.busy){if(mode==='intro'){ggcFinish(true);}else{if(GGC.q.length<3)GGC.q.push([best,ids,mode,done]);return;}}
  GGC.busy=true;const ov=$('#ggCeleb'),secret=best==='Secret',col=GGC_COL[best],dur=(secret?3.2:mode==='intro'?1.9:2.8)*(ggcReduced()?.6:1);
  ov.className='ggc ggc-'+best+' ggc-'+mode;ov.style.setProperty('--c1',col[0]);ov.style.setProperty('--c2',col[1]);
  const id=ids[0],u=UNITS[id]||{};ov.querySelector('.ggc-kicker').textContent=secret?'SECRET UNIT':'✨ MYTHIC ✨';
  ov.querySelector('.ggc-name').textContent=u.n||'';ov.querySelector('.ggc-sub').textContent=ids.length>1?('+ '+(ids.length-1)+' more '+best+(ids.length>2?' units':' unit')):(secret?'The banner’s featured Secret is yours!':'A Mythic unit joins your team!');
  const port=ov.querySelector('.ggc-port');port.innerHTML='';port.appendChild(ggcPortrait(id));
  ov.classList.remove('hide');void ov.offsetWidth;ov.classList.add('ggc-go');
  try{if(secret&&navigator.vibrate&&mode!=='auto')navigator.vibrate([60,40,140]);}catch(e){}
  if(secret&&mode!=='auto'&&!ggcReduced()){const sh=$('#summonReveal');if(sh){sh.classList.remove('ggc-shake');void sh.offsetWidth;sh.classList.add('ggc-shake');}}
  GGC.done=done;GGC.t0=performance.now();GGC.dur=dur*1000;ggcFx(best,mode);
  clearTimeout(GGC.tm);GGC.tm=setTimeout(()=>ggcFinish(false),dur*1000);}
function ggcFinish(now){const ov=$('#ggCeleb');clearTimeout(GGC.tm);cancelAnimationFrame(GGC.raf);GGC.busy=false;
  const d=GGC.done;GGC.done=null;ov.classList.remove('ggc-go');ov.classList.add('hide');if(d)try{d()}catch(e){}
  if(GGC.q.length){const n=GGC.q.shift();setTimeout(()=>ggCelebrate(...n),now?0:250);}}
$('#ggCeleb').addEventListener('click',()=>{if($('#ggCeleb').classList.contains('ggc-intro'))ggcFinish(true);});
// particles: rays, sparks, shockwaves, embers, and crimson lightning for Secrets
function ggcFx(best,mode){const cv=$('#ggCelebCv'),x=cv.getContext('2d'),W=cv.width=Math.min(1600,innerWidth*Math.min(2,devicePixelRatio||1)),H=cv.height=Math.round(W*innerHeight/innerWidth);
  const secret=best==='Secret',col=GGC_COL[best],red=ggcReduced(),N=red?40:(secret?220:150),P=[];const cxp=W/2,cyp=H*(mode==='auto'&&!secret?.3:.45),S=W/800;
  for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,v=(1.5+Math.random()*7)*S;P.push({x:cxp,y:cyp,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(secret?0:1.5*S),l:1,d:.006+Math.random()*.012,r:(1+Math.random()*3)*S,c:col[Math.random()<.6?0:1],spark:Math.random()<.5});}
  const E=[];if(secret)for(let i=0;i<(red?10:60);i++)E.push({x:Math.random()*W,y:H+Math.random()*H*.3,vy:-(1+Math.random()*2.6)*S,r:(1+Math.random()*2)*S,ph:Math.random()*6});
  const bolts=[];const bolt=()=>{const pts=[];let px=cxp+(Math.random()-.5)*W*.9,py=0;while(py<cyp){pts.push([px,py]);px+=(Math.random()-.5)*60*S;py+=(18+Math.random()*30)*S;}pts.push([cxp+(Math.random()-.5)*40*S,cyp]);return {pts,l:1};};
  const t0=performance.now();let lastBolt=0;
  const step=now=>{const t=(now-t0)/1000,k=Math.min(1,(now-t0)/GGC.dur);x.clearRect(0,0,W,H);
    if(mode!=='auto'||secret){x.fillStyle=secret?'rgba(8,0,4,'+(.72*Math.min(1,t*3)*(1-Math.max(0,(k-.85)/.15)))+')':'rgba(20,6,30,'+(.45*Math.min(1,t*3)*(1-Math.max(0,(k-.85)/.15)))+')';x.fillRect(0,0,W,H);}
    // light rays
    x.save();x.translate(cxp,cyp);x.rotate(t*(secret?.5:.8));x.globalCompositeOperation='lighter';const ra=(mode==='auto'&&!secret?.35:.6)*(1-k*.6);
    for(let i=0;i<(secret?10:14);i++){x.rotate(Math.PI*2/(secret?10:14));const g=x.createLinearGradient(0,0,0,-H);g.addColorStop(0,col[0]+'cc');g.addColorStop(1,col[0]+'00');x.globalAlpha=ra;x.fillStyle=g;x.beginPath();x.moveTo(0,0);x.lineTo(-30*S,-H);x.lineTo(30*S,-H);x.closePath();x.fill();}
    x.restore();x.globalCompositeOperation='lighter';
    // shockwaves
    for(let w=0;w<(secret?3:2);w++){const tt=t-w*.28;if(tt<0||tt>1.2)continue;x.globalAlpha=Math.max(0,1-tt/1.2);x.strokeStyle=w%2?col[1]:col[0];x.lineWidth=(secret?7:5)*S*(1-tt/1.2)+1;x.beginPath();x.arc(cxp,cyp,tt*(secret?520:380)*S,0,Math.PI*2);x.stroke();}
    // lightning
    if(secret&&!red){if(now-lastBolt>260&&k<.75){lastBolt=now;bolts.push(bolt());}for(const b of bolts){if(b.l<=0)continue;x.globalAlpha=b.l;x.strokeStyle='#ffd6dc';x.lineWidth=3*S;x.shadowColor=col[0];x.shadowBlur=24*S;x.beginPath();b.pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.stroke();x.shadowBlur=0;b.l-=.06;}}
    // sparks
    for(const p of P){if(p.l<=0)continue;p.x+=p.vx;p.y+=p.vy;p.vx*=.985;p.vy=p.vy*.985+(secret?.02:.05)*S;p.l-=p.d;x.globalAlpha=Math.max(0,p.l);x.fillStyle=p.c;
      if(p.spark){x.save();x.translate(p.x,p.y);x.rotate(t*4+p.r);x.fillRect(-p.r*2,-p.r*.35,p.r*4,p.r*.7);x.fillRect(-p.r*.35,-p.r*2,p.r*.7,p.r*4);x.restore();}else{x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill();}}
    for(const e of E){e.y+=e.vy;e.x+=Math.sin(t*2+e.ph)*.6*S;x.globalAlpha=.7*(1-k*.7);x.fillStyle=Math.sin(e.ph+t*6)>0?'#ff6a3a':'#ff314d';x.beginPath();x.arc(e.x,e.y,e.r,0,7);x.fill();}
    x.globalAlpha=1;x.globalCompositeOperation='source-over';if(GGC.busy&&k<1)GGC.raf=requestAnimationFrame(step);};
  cancelAnimationFrame(GGC.raf);GGC.raf=requestAnimationFrame(step);}
// Manual summons with the reveal: the cinematic plays first, then the cards flip; Mythic/Secret cards are highlighted.
(function(){if(typeof showSummonReveal!=='function')return;const o=showSummonReveal;showSummonReveal=function(n){GGC.revealShown=true;const r=o.apply(this,arguments);
  try{const ov=$('#summonReveal');const cards=[...ov.querySelectorAll('.sr-card')];cards.forEach(c=>{if(c.classList.contains('r-Mythic')||c.classList.contains('r-Secret'))c.classList.add('sr-star');});
    const got=ggcLastPull(),best=got.some(g=>g.r==='Secret')?'Secret':got.some(g=>g.r==='Mythic')?'Mythic':null;
    if(best&&ggCeleb.on){ov.classList.add('sr-hold');ggCelebrate(best,got.filter(g=>g.r===best).map(g=>g.id),'intro',()=>{ov.classList.remove('sr-hold');ov.classList.remove('sr-in');void ov.offsetWidth;ov.classList.add('sr-in');});}}catch(e){ $('#summonReveal').classList.remove('sr-hold'); }
  return r;};})();
// Every other summon (Auto Summon, reveal turned off): a highlight that never blocks the game.
(function(){const o=pull;pull=function(n){const before=($('#res')||{}).innerHTML;GGC.revealShown=false;const r=o.apply(this,arguments);
  try{const after=($('#res')||{}).innerHTML;if(after!==before&&!GGC.revealShown&&!(document.getElementById('ggGuide')&&document.getElementById('ggGuide').matches(':not(.hide)'))){
      const got=ggcLastPull(),best=got.some(g=>g.r==='Secret')?'Secret':got.some(g=>g.r==='Mythic')?'Mythic':null;if(best)ggCelebrate(best,got.filter(g=>g.r===best).map(g=>g.id),'auto');}}catch(e){}
  return r;};})();
// Settings toggle
(function(){const t=$('#ggRevealToggle');const row=t&&t.closest('label.setting');if(!row)return;
  row.insertAdjacentHTML('afterend','<label class="setting"><span><b>🌟 Mythic &amp; Secret pull effects</b><small>A highlight for Mythic pulls and a full cinematic for Secret pulls, also during Auto Summon (it never pauses Auto Summon). Saved on this device only.</small></span><input type="checkbox" id="ggCelebToggle"></label>');
  const c=$('#ggCelebToggle');c.checked=ggCeleb.on;c.onchange=()=>{ggCeleb.on=c.checked;if(!c.checked){GGC.q.length=0;if(GGC.busy)ggcFinish(true);}try{localStorage.setItem(GGC_KEY,JSON.stringify(ggCeleb))}catch(e){}};})();
// ---- The rotating summon banner: featured Secret and Mythic up front, then Legendary/Epic/Rare, then Commons ----
function ggBannerDecorate(){const pool=$('#summonPool');if(!pool)return;const cards=[...pool.querySelectorAll('.card')];if(!cards.length)return;
  const rar=c=>{const b=c.querySelector('b[class]');return b?b.className.split(' ')[0]:'Common';};cards.forEach(c=>{c.classList.add('ggb-card','ggb-'+rar(c));c.removeAttribute('style');});
  const by=r=>cards.filter(c=>rar(c)===r),row=(cls,arr,label)=>{const d=document.createElement('div');d.className='ggb-row '+cls;if(label)d.insertAdjacentHTML('beforeend','<div class="ggb-label">'+label+'</div>');const g=document.createElement('div');g.className='ggb-grid';arr.forEach(x=>g.appendChild(x));d.appendChild(g);return d;};
  const hero=[...by('Secret'),...by('Mythic')];hero.forEach(c=>{if(!c.querySelector('.ggb-tag'))c.insertAdjacentHTML('afterbegin','<span class="ggb-tag">'+(rar(c)==='Secret'?'☠ FEATURED SECRET':'✨ FEATURED MYTHIC')+'</span>');});
  pool.innerHTML='';pool.classList.add('ggb-pool');pool.append(row('ggb-hero',hero),row('ggb-mid',[...by('Legendary'),...by('Epic'),...by('Rare')],'Featured Legendary · Epic · Rare'),row('ggb-commons',by('Common'),'Featured Commons'));
  const panel=pool.closest('.panel');if(panel){panel.classList.add('ggb-panel');const tm=$('#bannerTimer');if(tm&&!$('#ggbBar'))tm.insertAdjacentHTML('afterend','<div class="ggb-bar" aria-hidden="true"><i id="ggbBar"></i></div>');}}
(function(){if(typeof renderSummonPool!=='function')return;const o=renderSummonPool;renderSummonPool=function(){const r=o.apply(this,arguments);try{ggBannerDecorate()}catch(e){}return r;};})();
setInterval(()=>{const tm=$('#bannerTimer'),bar=$('#ggbBar');if(!tm||!bar)return;const m=/(\d+):(\d+)/.exec(tm.textContent||'');if(!m)return;const left=(+m[1])*60+(+m[2]);bar.style.width=Math.max(0,Math.min(100,(1-left/300)*100))+'%';},1000);
try{ggBannerDecorate()}catch(e){}
