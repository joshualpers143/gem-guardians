/* Gem Guardians public edition · gg-art.js · Version 2026.10.11.12 · built from source/public/index.html by tools/split.py */
/* Gem Guardians Art Engine v2 (2026.10.11.3) */
/* ===================================================================
   Gem Guardians Art Engine v2 — core helpers + map renderer
   Original hand-drawn cartoon style (thick ink outlines, hard cel
   shading, chunky proportions). Everything is drawn with canvas code
   and cached to offscreen canvases so phones stay smooth.
   =================================================================== */
const GGA = (function(){
const INK = '#1d1426';
function rng(seed){let s=(seed>>>0)||7;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));}
function shade(h,a){const t=a<0?0:255,p=Math.abs(a);return '#'+hex2rgb(h).map(v=>Math.round((t-v)*p+v).toString(16).padStart(2,'0')).join('');}
function rgba(h,a){const [r,g,b]=hex2rgb(h);return `rgba(${r},${g},${b},${a})`;}
function canvas(w,h){const k=document.createElement('canvas');k.width=Math.ceil(w);k.height=Math.ceil(h);return k;}

/* ---- Path2D builders ---- */
const P={
  circle:(x,y,r)=>{const p=new Path2D();p.arc(x,y,r,0,Math.PI*2);return p;},
  ellipse:(x,y,rx,ry,rot=0)=>{const p=new Path2D();p.ellipse(x,y,rx,ry,rot,0,Math.PI*2);return p;},
  poly:(pts)=>{const p=new Path2D();p.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)p.lineTo(pts[i],pts[i+1]);p.closePath();return p;},
  rrect:(x,y,w,h,r)=>{const p=new Path2D();r=Math.min(r,w/2,h/2);p.moveTo(x+r,y);p.arcTo(x+w,y,x+w,y+h,r);p.arcTo(x+w,y+h,x,y+h,r);p.arcTo(x,y+h,x,y,r);p.arcTo(x,y,x+w,y,r);p.closePath();return p;},
  smooth:(pts,closed=true)=>{ // quadratic-smoothed polygon through midpoints
    const p=new Path2D(),n=pts.length/2,pt=i=>[pts[(i%n)*2],pts[(i%n)*2+1]];
    const mid=i=>{const a=pt(i),b=pt(i+1);return [(a[0]+b[0])/2,(a[1]+b[1])/2];};
    if(closed){const m=mid(n-1);p.moveTo(m[0],m[1]);for(let i=0;i<n;i++){const c=pt(i),m2=mid(i);p.quadraticCurveTo(c[0],c[1],m2[0],m2[1]);}p.closePath();}
    else{p.moveTo(pts[0],pts[1]);for(let i=1;i<n-1;i++){const c=pt(i),m2=mid(i);p.quadraticCurveTo(c[0],c[1],m2[0],m2[1]);}const l=pt(n-1);p.lineTo(l[0],l[1]);}
    return p;},
};
/* Filled shape with ink outline and a hard cel shadow on the lower-right. */
function fillInk(c,path,col,cx,cy,r,lw=1.4,opt={}){
  const g=c.createLinearGradient(cx-r,cy-r,cx+r,cy+r);
  const hi=opt.flat?col:shade(col,.18),lo=shade(col,opt.dark??-.3);
  g.addColorStop(0,hi);g.addColorStop(.32,col);g.addColorStop(.56,col);g.addColorStop(.58,lo);g.addColorStop(1,shade(lo,-.08));
  c.fillStyle=g;c.fill(path);
  if(lw){c.lineWidth=lw;c.strokeStyle=opt.ink||INK;c.lineJoin='round';c.lineCap='round';c.stroke(path);}
}
function stroke(c,path,col,lw){c.lineWidth=lw;c.strokeStyle=col;c.lineJoin='round';c.lineCap='round';c.stroke(path);}
function line(c,pts,col,lw,inkW=0){const p=new Path2D();p.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)p.lineTo(pts[i],pts[i+1]);if(inkW)stroke(c,p,INK,lw+inkW*2);stroke(c,p,col,lw);}
function glow(c,x,y,r,col,a=.55){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(col,a));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}

/* ---- Path geometry ---- */
function pathInfo(path){const segs=[];let tot=0;for(let i=1;i<path.length;i++){const [x1,y1]=path[i-1],[x2,y2]=path[i];const l=Math.hypot(x2-x1,y2-y1);segs.push({x1,y1,x2,y2,l,s:tot});tot+=l;}return {segs,tot};}
function pointAt(info,d){for(const s of info.segs){if(d<=s.s+s.l){const t=(d-s.s)/s.l;return {x:s.x1+(s.x2-s.x1)*t,y:s.y1+(s.y2-s.y1)*t,dx:(s.x2-s.x1)/s.l,dy:(s.y2-s.y1)/s.l};}}const s=info.segs[info.segs.length-1];return {x:s.x2,y:s.y2,dx:(s.x2-s.x1)/s.l,dy:(s.y2-s.y1)/s.l};}
function distToPath(info,x,y){let m=1e9;for(const s of info.segs){const vx=s.x2-s.x1,vy=s.y2-s.y1,t=Math.max(0,Math.min(1,((x-s.x1)*vx+(y-s.y1)*vy)/(s.l*s.l)));m=Math.min(m,Math.hypot(x-(s.x1+vx*t),y-(s.y1+vy*t)));}return m;}

/* ===================================================================
   MAP THEMES — every map is decorated to match its name.
   =================================================================== */
const THEMES={
  meadow:{ground:['#6aa84f','#5b9a43','#7bb85a','#4f8a3b'],road:'dirt',roadCol:'#cfa66a',edge:'#8a6a3e',props:{tree:16,bush:16,flower:60,rock:8,fence:3,hay:3,tuft:110,mushroom:6},entrance:'cave',sky:null},
  crystal:{ground:['#7d6f8f','#6c5f80','#8b7d9c','#5d5270'],road:'stone',roadCol:'#c9c2d6',edge:'#5a4f6b',props:{crystal:14,boulder:8,pebble:30,cliff:4,tuft:20},entrance:'cave'},
  ember:{ground:['#5e3b33','#4f312b','#6b4339','#3f2723'],road:'ash',roadCol:'#8d8580',edge:'#3a2a26',props:{lavapool:4,charred:7,vent:5,boulder:7,ember:30,crack:10},entrance:'cave'},
  marsh:{ground:['#2f5550','#29494a','#36625a','#1f3d3e'],road:'planks',roadCol:'#9a7350',edge:'#4b3524',props:{pond:6,reed:16,lily:10,glowshroom:10,deadtree:4,firefly:22,tuft:30},entrance:'cave'},
  desert:{ground:['#e2bd78','#d6ae68','#ecc98a','#c99d58'],road:'sand',roadCol:'#f0d9a6',edge:'#b48a4b',props:{dune:8,cactus:9,palm:3,bones:4,rock:6,pyramid:1,tuft:14},entrance:'cave'},
  tundra:{ground:['#e8f1f7','#dce9f2','#f4f9fc','#cfdfeb'],road:'snow',roadCol:'#b9d4e6',edge:'#7f9fb8',props:{pine:12,iceRock:8,icePatch:6,snowman:1,pebble:14,drift:10},entrance:'cave'},
  jungle:{ground:['#2f6a35','#285c2e','#3a7a3f','#1f4d27'],road:'moss',roadCol:'#8f8a55',edge:'#4a4425',props:{jtree:8,fern:16,toxicpool:4,vine:6,flower:14,mushroom:6,tuft:40},entrance:'cave'},
  volcanic:{ground:['#3b2c2e','#322527','#463437','#261b1d'],road:'basalt',roadCol:'#5d5258',edge:'#1c1416',props:{lavariver:3,obsidian:10,vent:6,ember:40,crack:14,charred:4},entrance:'cave'},
  nebula:{ground:['#2a2a5e','#24244f','#33336d','#1c1c42'],road:'starlight',roadCol:'#9b93e6',edge:'#4b438e',props:{star:120,starshard:10,planet:2,moonrock:7,comet:2},entrance:'portal'},
  ruins:{ground:['#7a7a5c','#6d6d52','#86866a','#5f5f47'],road:'flagstone',roadCol:'#b8b29a',edge:'#5d5845',props:{column:7,brokenwall:4,statue:2,vine:5,rock:8,tuft:40,flower:10},entrance:'cave'},
  hive:{ground:['#3e2856','#35224a','#4a3065','#2a1a3b'],road:'chitin',roadCol:'#9a74c4',edge:'#4a2f68',props:{egg:12,tendril:10,slime:5,spore:30,crystalHive:5},entrance:'hive'},
  reef:{ground:['#3f97a0','#37878f','#4aa6ae','#2c7480'],road:'sand',roadCol:'#f1dfae',edge:'#b8995c',props:{coral:16,kelp:12,shell:14,starfish:8,tidepool:3,rock:6,pebble:26},entrance:'cave'},
  castle:{ground:['#3a3343','#322c3a','#433b4e','#28232f'],road:'cobble',roadCol:'#77707f',edge:'#26202c',props:{grave:9,deadtree:5,candle:10,bat:6,wall:2,fog:8,tuft:16},entrance:'gate'}
};
const STAGE_THEME=['meadow','crystal','ember','marsh','desert','tundra','jungle','volcanic','nebula','ruins','hive','reef'];

/* ---- Ground ---- */
function paintGround(c,T,R,W,H){
  c.fillStyle=T.ground[0];c.fillRect(0,0,W,H);
  for(let i=0;i<260;i++){const x=R()*W,y=R()*H,r=10+R()*46;c.fillStyle=rgba(T.ground[1+Math.floor(R()*3)],.25+R()*.25);c.beginPath();c.ellipse(x,y,r,r*.6,0,0,Math.PI*2);c.fill();}
  for(let i=0;i<900;i++){const x=R()*W,y=R()*H;c.fillStyle=rgba(R()<.5?shade(T.ground[0],.2):shade(T.ground[0],-.25),.35);c.fillRect(x,y,1.6,1.6);}
}
/* ---- Road ---- */
function strokePath(c,path,w,col){c.lineCap='round';c.lineJoin='round';c.lineWidth=w;c.strokeStyle=col;c.beginPath();path.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();}
function roadTexture(c,T,R,info,W,H){
  const base=T.roadCol;c.fillStyle=base;c.fillRect(0,0,W,H);
  for(let i=0;i<500;i++){const x=R()*W,y=R()*H,r=4+R()*14;c.fillStyle=rgba(R()<.5?shade(base,.15):shade(base,-.15),.35);c.beginPath();c.ellipse(x,y,r,r*.6,R()*3,0,Math.PI*2);c.fill();}
  const along=(step,fn)=>{for(let d=0;d<info.tot;d+=step){const p=pointAt(info,d);fn(p,d);}};
  const stoneCell=(x,y,w,h,col,lw=1.1)=>{const p=P.rrect(x-w/2,y-h/2,w,h,Math.min(w,h)*.35);c.fillStyle=col;c.fill(p);c.lineWidth=lw;c.strokeStyle=rgba(T.edge,.85);c.stroke(p);c.fillStyle='rgba(255,255,255,.18)';c.fillRect(x-w/2+2,y-h/2+1.5,w*.45,1.4);};
  switch(T.road){
    case 'dirt': case 'moss': case 'sand': case 'ash':
      along(9,(p)=>{for(const o of [-9,9]){c.fillStyle=rgba(shade(base,-.22),.45);c.beginPath();c.ellipse(p.x-p.dy*o,p.y+p.dx*o,5,2.2,Math.atan2(p.dy,p.dx),0,Math.PI*2);c.fill();}});
      for(let i=0;i<(T.road==='sand'?60:240);i++){const d=R()*info.tot,p=pointAt(info,d),o=(R()-.5)*34;const x=p.x-p.dy*o,y=p.y+p.dx*o,r=1+R()*2.6;
        c.fillStyle=T.road==='moss'&&R()<.5?'#6f8f3a':shade(base,-.35+R()*.2);c.beginPath();c.ellipse(x,y,r,r*.75,0,0,Math.PI*2);c.fill();c.strokeStyle=rgba(T.edge,.6);c.lineWidth=.6;c.stroke();}
      if(T.road==='sand')along(14,(p)=>{c.strokeStyle=rgba(shade(base,-.12),.6);c.lineWidth=1;c.beginPath();c.moveTo(p.x-p.dy*14,p.y+p.dx*14);c.quadraticCurveTo(p.x+p.dx*4,p.y+p.dy*4,p.x+p.dy*14,p.y-p.dx*14);c.stroke();});
      break;
    case 'stone': case 'cobble': case 'basalt': case 'flagstone':{
      const s=T.road==='flagstone'?17:T.road==='basalt'?12:9;
      for(let y=-s;y<H+s;y+=s){const off=((y/s)%2)*s/2;for(let x=-s;x<W+s;x+=s){const col=shade(base,(R()-.5)*.28);
        if(T.road==='basalt'){const p=new Path2D();for(let k=0;k<6;k++){const a=k*Math.PI/3+Math.PI/6;const px=x+off+Math.cos(a)*s*.56,py=y+Math.sin(a)*s*.56;k?p.lineTo(px,py):p.moveTo(px,py);}p.closePath();c.fillStyle=col;c.fill(p);c.strokeStyle='#1a1214';c.lineWidth=1.2;c.stroke(p);}
        else stoneCell(x+off+(R()-.5)*2,y+(R()-.5)*2,s*(T.road==='flagstone'?1.15:.95)*(0.85+R()*.25),s*.82,col);}}
      if(T.road==='basalt')for(let i=0;i<30;i++){const d=R()*info.tot,p=pointAt(info,d);c.strokeStyle='#ff7a2a';c.lineWidth=1.2;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+(R()-.5)*16,p.y+(R()-.5)*16);c.stroke();}
      break;}
    case 'planks':
      along(7,(p,d)=>{const x=p.x,y=p.y,nx=-p.dy,ny=p.dx;c.strokeStyle=shade(base,((d*13)%7-3)*.035);c.lineWidth=6.2;c.lineCap='butt';c.beginPath();c.moveTo(x-nx*21,y-ny*21);c.lineTo(x+nx*21,y+ny*21);c.stroke();
        c.strokeStyle='#3b2618';c.lineWidth=.9;c.beginPath();c.moveTo(x-nx*21+p.dx*3.3,y-ny*21+p.dy*3.3);c.lineTo(x+nx*21+p.dx*3.3,y+ny*21+p.dy*3.3);c.stroke();
        c.fillStyle='#2a1a10';for(const o of[-15,15]){c.beginPath();c.arc(x+nx*o,y+ny*o,.9,0,7);c.fill();}});
      break;
    case 'snow':
      along(12,(p,d)=>{const o=((d/12)%2?5:-5);c.fillStyle=rgba('#7d9cb4',.45);c.beginPath();c.ellipse(p.x-p.dy*o,p.y+p.dx*o,2.4,3.6,Math.atan2(p.dy,p.dx)+Math.PI/2,0,Math.PI*2);c.fill();});
      for(let i=0;i<80;i++){const x=R()*W,y=R()*H;c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.ellipse(x,y,6+R()*10,3,0,0,7);c.fill();}
      break;
    case 'starlight':
      for(let i=0;i<420;i++){const x=R()*W,y=R()*H;c.fillStyle=R()<.3?'#fff7c2':'#e6e1ff';c.globalAlpha=.4+R()*.6;c.beginPath();c.arc(x,y,.6+R()*1.4,0,7);c.fill();}c.globalAlpha=1;
      along(26,(p)=>{c.save();c.translate(p.x,p.y);c.rotate(Math.atan2(p.dy,p.dx));c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.beginPath();c.moveTo(-6,-14);c.lineTo(6,-14);c.moveTo(-6,14);c.lineTo(6,14);c.stroke();c.restore();});
      break;
    case 'chitin':
      along(10,(p)=>{const nx=-p.dy,ny=p.dx;c.strokeStyle=shade(base,-.32);c.lineWidth=2;c.beginPath();c.moveTo(p.x-nx*20,p.y-ny*20);c.quadraticCurveTo(p.x+p.dx*5,p.y+p.dy*5,p.x+nx*20,p.y+ny*20);c.stroke();
        c.strokeStyle=rgba('#e9d5ff',.35);c.lineWidth=1;c.beginPath();c.moveTo(p.x-nx*16+p.dx*2,p.y-ny*16+p.dy*2);c.quadraticCurveTo(p.x+p.dx*7,p.y+p.dy*7,p.x+nx*16+p.dx*2,p.y+ny*16+p.dy*2);c.stroke();});
      for(let i=0;i<40;i++){const d=R()*info.tot,p=pointAt(info,d);glow(c,p.x+(R()-.5)*26,p.y+(R()-.5)*26,5,'#7cff6b',.5);}
      break;
  }
}
function paintRoad(c,T,R,path,info,W,H){
  // Shadow, dark rim and grassy/earth verge, then masked texture.
  c.save();c.translate(2,5);strokePath(c,path,50,'rgba(10,8,20,.35)');c.restore();
  strokePath(c,path,48,shade(T.ground[3],-.15));
  strokePath(c,path,44,T.edge);
  const layer=canvas(W,H),lc=layer.getContext('2d');
  roadTexture(lc,T,R,info,W,H);
  lc.globalCompositeOperation='destination-in';strokePath(lc,path,38,'#000');
  c.drawImage(layer,0,0);
  // inner light rim + edge stones / verge details
  c.save();c.globalAlpha=.35;strokePath(c,path,38,'transparent');c.restore();
  const vergeCol={meadow:'#4f8a3b',jungle:'#2c5e2f',ruins:'#5c6a3c',marsh:'#1f3d3e'}[T.key];
  for(let d=0;d<info.tot;d+=6){const p=pointAt(info,d);for(const side of[-1,1]){const o=side*(21.5+R()*1.5),x=p.x-p.dy*o,y=p.y+p.dx*o;
    if(vergeCol&&R()<.7){c.strokeStyle=vergeCol;c.lineWidth=1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x+(R()-.5)*3-p.dy*side*4,y-3-R()*3);c.stroke();}
    else if(R()<.35){const r=1.6+R()*2.2;c.fillStyle=shade(T.edge,.25+R()*.2);c.beginPath();c.ellipse(x,y,r,r*.75,0,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=.7;c.stroke();}}}
}

/* ---- Props (decor) ---- */
const PROPS={};
const tuftCols={meadow:['#3f7a2f','#8bc865'],jungle:['#1d4d24','#53a35a'],ruins:['#4d5a32','#8a9a5a'],marsh:['#204a40','#5e9c86'],desert:['#a88a4a','#cbb070'],crystal:['#5d5270','#9d8fb0'],castle:['#2a2530','#5b5265']};
PROPS.tuft=(c,R,T)=>{const [a,b]=tuftCols[T.key]||['#3f7a2f','#8bc865'];for(let i=0;i<5;i++){const x=(i-2)*1.8;c.strokeStyle=i%2?a:b;c.lineWidth=1.3;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+(i-2)*.8,-4,x+(i-2)*1.6,-6-R()*3);c.stroke();}};
PROPS.flower=(c,R,T)=>{const col=['#ff6b8b','#ffd93d','#ffffff','#b48cff','#ff9f43'][Math.floor(R()*5)];line(c,[0,0,0,-5],'#3d7a2a',1.2);for(let i=0;i<5;i++){const a=i*1.256;c.fillStyle=col;c.beginPath();c.arc(Math.cos(a)*2,-6+Math.sin(a)*2,1.6,0,7);c.fill();}c.fillStyle='#ffcf33';c.beginPath();c.arc(0,-6,1.1,0,7);c.fill();};
PROPS.bush=(c,R)=>{const g=['#3e7d30','#4f9a3d','#62b04a'];const p=P.smooth([-14,0,-15,-9,-8,-16,0,-18,9,-15,15,-8,14,0]);fillInk(c,p,g[1],0,-9,15,1.5);for(let i=0;i<4;i++){c.fillStyle=rgba('#a8e07a',.5);c.beginPath();c.arc(-8+i*5,-12+(i%2)*3,2,0,7);c.fill();}if(R()<.5)for(let i=0;i<3;i++){c.fillStyle='#e8344a';c.beginPath();c.arc(-6+i*6,-6-(i%2)*4,1.5,0,7);c.fill();}};
PROPS.tree=(c,R)=>{fillInk(c,P.poly([-4,0,-3,-18,3,-18,4,0]),'#7a4a2a',0,-9,8,1.5);const p=P.smooth([-20,-16,-22,-30,-12,-42,2,-46,16,-40,22,-28,18,-14,4,-10,-10,-10]);fillInk(c,p,'#4c9a3a',0,-28,22,1.8);
  for(let i=0;i<6;i++){c.fillStyle=rgba('#9fe07a',.55);c.beginPath();c.arc(-12+i*4,-36+Math.sin(i)*5,3,0,7);c.fill();}c.strokeStyle=rgba('#235a1e',.7);c.lineWidth=1.2;c.beginPath();c.arc(-6,-24,5,0.2,2.5);c.stroke();c.beginPath();c.arc(8,-30,5,0.2,2.5);c.stroke();};
PROPS.rock=(c,R)=>{const p=P.smooth([-11,0,-12,-6,-6,-12,3,-12,10,-8,12,0]);fillInk(c,p,'#9a9aa3',0,-6,11,1.5);c.strokeStyle=rgba('#ffffff',.35);c.lineWidth=1.2;c.beginPath();c.moveTo(-6,-9);c.lineTo(0,-10);c.stroke();};
PROPS.boulder=(c,R,T)=>{const p=P.smooth([-16,0,-17,-10,-9,-19,4,-19,14,-12,16,0]);fillInk(c,p,T.key==='crystal'?'#8c80a0':'#7a6a62',0,-9,16,1.7);c.strokeStyle=rgba(INK,.5);c.lineWidth=1;c.beginPath();c.moveTo(-2,-18);c.lineTo(2,-8);c.lineTo(-3,-2);c.stroke();};
PROPS.pebble=(c,R,T)=>{c.fillStyle=T.key==='tundra'?'#8aa3b5':'#9c90ad';c.beginPath();c.ellipse(0,0,2.5,1.8,0,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=.6;c.stroke();};
PROPS.fence=(c,R)=>{for(let i=0;i<4;i++)fillInk(c,P.rrect(-18+i*11,-14,4,15,1),'#a0703f',0,-7,8,1.2);fillInk(c,P.rrect(-20,-11,40,3.2,1),'#b88449',0,-10,20,1.1);fillInk(c,P.rrect(-20,-5,40,3.2,1),'#b88449',0,-4,20,1.1);};
PROPS.hay=(c,R)=>{const p=P.smooth([-13,0,-14,-10,-6,-16,6,-16,14,-10,13,0]);fillInk(c,p,'#e7c45a',0,-8,14,1.5);c.strokeStyle='#b58f2d';c.lineWidth=1;for(let i=-10;i<=10;i+=4){c.beginPath();c.moveTo(i,-1);c.lineTo(i*.8,-13);c.stroke();}};
PROPS.mushroom=(c,R)=>{fillInk(c,P.rrect(-2,-6,4,6,1.5),'#f2e6d0',0,-3,3,1);fillInk(c,P.smooth([-7,-5,-6,-10,0,-13,6,-10,7,-5]),'#e2453c',0,-9,7,1.2);c.fillStyle='#fff';[[-3,-9],[2,-10],[4,-7]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,1.1,0,7);c.fill();});};
PROPS.crystal=(c,R)=>{const col=R()<.5?'#5ee7f0':'#c084fc';glow(c,0,-10,22,col,.35);for(const [x,h,w,a] of [[-6,16,5,-.25],[0,24,6,0],[6,14,5,.3]]){c.save();c.translate(x,0);c.rotate(a);const p=P.poly([-w,0,-w,-h*.7,0,-h,w,-h*.7,w,0]);fillInk(c,p,col,0,-h/2,w*1.6,1.3);c.fillStyle='rgba(255,255,255,.55)';c.fill(P.poly([-w*.6,-2,-w*.6,-h*.65,0,-h*.9,-1,-3]));c.restore();}};
PROPS.cliff=(c,R)=>{const p=P.poly([-34,0,-30,-22,-14,-30,6,-26,26,-32,36,-14,34,0]);fillInk(c,p,'#6a5d7c',0,-15,30,2);c.strokeStyle=rgba(INK,.55);c.lineWidth=1.2;c.beginPath();c.moveTo(-14,-28);c.lineTo(-10,-8);c.moveTo(10,-26);c.lineTo(14,-6);c.stroke();};
PROPS.lavapool=(c,R)=>{const p=P.smooth([-26,0,-22,-9,-6,-13,12,-12,26,-6,22,4,4,8,-16,7]);c.save();c.shadowColor='#ff5a00';c.shadowBlur=18;fillInk(c,p,'#ff7a1a',0,-3,24,2,{flat:true,dark:-.15});c.restore();c.fillStyle='#ffd166';[[-8,-4,3],[6,-2,2.4],[14,-6,1.6]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,7);c.fill();});};
PROPS.charred=(c,R)=>{line(c,[0,0,0,-22],'#2b1d1a',3.5,1);line(c,[0,-12,-8,-20],'#2b1d1a',2.2,.8);line(c,[0,-16,7,-25],'#2b1d1a',2.2,.8);glow(c,0,-4,6,'#ff6a00',.4);};
PROPS.vent=(c,R)=>{fillInk(c,P.poly([-9,0,-5,-8,5,-8,9,0]),'#4a3631',0,-4,9,1.4);c.fillStyle='#ff8a2a';c.beginPath();c.ellipse(0,-8,4.5,1.6,0,0,7);c.fill();for(let i=0;i<3;i++){c.fillStyle=rgba('#9b8f8a',.35-i*.08);c.beginPath();c.arc(i*3-2,-14-i*7,4+i*2,0,7);c.fill();}};
PROPS.ember=(c,R)=>{glow(c,0,0,3,'#ffb347',.8);};
PROPS.crack=(c,R,T)=>{c.strokeStyle=T.key==='volcanic'?'#ff6a1a':'#2a1c19';c.lineWidth=1.4;c.beginPath();c.moveTo(-10,0);c.lineTo(-3,-2);c.lineTo(2,2);c.lineTo(10,-1);c.moveTo(-3,-2);c.lineTo(-2,-7);c.stroke();};
PROPS.pond=(c,R)=>{const p=P.smooth([-30,0,-26,-11,-8,-15,14,-14,30,-6,26,6,6,10,-18,8]);fillInk(c,p,'#2c6f78',0,-2,28,2,{dark:-.2});c.strokeStyle=rgba('#b5f0f0',.5);c.lineWidth=1.2;c.beginPath();c.ellipse(-6,-4,10,2.5,0,0,7);c.stroke();};
PROPS.reed=(c,R)=>{for(let i=0;i<3;i++){line(c,[i*3-3,0,i*3-4,-14-i*2],'#4f7a3a',1.4);c.fillStyle='#6b4423';c.beginPath();c.ellipse(i*3-4,-14-i*2,1.4,3,0,0,7);c.fill();}};
PROPS.lily=(c,R)=>{c.fillStyle='#4f9a5a';c.beginPath();c.arc(0,0,5,0.3,Math.PI*2-0.1);c.lineTo(0,0);c.fill();c.strokeStyle=INK;c.lineWidth=.8;c.stroke();if(R()<.5){c.fillStyle='#ffb3d1';c.beginPath();c.arc(1,-1,1.8,0,7);c.fill();}};
PROPS.glowshroom=(c,R)=>{const col=R()<.5?'#6ef0ff':'#c58bff';glow(c,0,-6,14,col,.4);fillInk(c,P.rrect(-1.5,-6,3,6,1),'#d8e9f0',0,-3,3,.9);fillInk(c,P.smooth([-6,-5,-5,-10,0,-12,5,-10,6,-5]),col,0,-8,6,1.1,{dark:-.15});};
PROPS.deadtree=(c,R,T)=>{const col=T.key==='castle'?'#3a3040':'#3f3a2e';line(c,[0,0,1,-26],col,4,1);line(c,[1,-14,-10,-24,-14,-22],col,2.2,.8);line(c,[1,-20,10,-30,14,-29],col,2.2,.8);line(c,[0,-8,7,-12],col,1.8,.7);};
PROPS.firefly=(c,R)=>{glow(c,0,0,5,'#e8ff7a',.7);c.fillStyle='#fbffc2';c.beginPath();c.arc(0,0,1,0,7);c.fill();};
PROPS.dune=(c,R)=>{const p=P.smooth([-40,0,-24,-9,0,-14,22,-9,40,0],true);fillInk(c,p,'#e9c682',0,-6,34,0,{dark:-.12});c.strokeStyle=rgba('#a8803f',.5);c.lineWidth=1.2;c.beginPath();c.moveTo(-20,-6);c.quadraticCurveTo(0,-13,22,-5);c.stroke();};
PROPS.cactus=(c,R)=>{const col='#4f9a4a';fillInk(c,P.rrect(-4,-24,8,24,4),col,0,-12,8,1.4);fillInk(c,P.rrect(-12,-17,5,10,2.5),col,-10,-12,5,1.2);fillInk(c,P.rrect(-12,-9,9,4,2),col,-8,-7,5,1.2);fillInk(c,P.rrect(7,-20,5,9,2.5),col,9,-16,5,1.2);fillInk(c,P.rrect(3,-13,9,4,2),col,8,-11,5,1.2);
  c.fillStyle='#fff6c8';for(let i=0;i<6;i++){c.fillRect(-2+(i%2)*3,-21+i*3.5,1,1);} if(R()<.5){c.fillStyle='#ff6b9a';c.beginPath();c.arc(0,-25,2.2,0,7);c.fill();}};
PROPS.palm=(c,R)=>{const p=new Path2D();p.moveTo(-2,0);p.quadraticCurveTo(-6,-16,2,-34);p.lineTo(6,-33);p.quadraticCurveTo(0,-16,4,0);p.closePath();fillInk(c,p,'#9a6b3a',0,-16,8,1.3);
  for(let i=0;i<5;i++){c.save();c.translate(4,-34);c.rotate(-2.6+i*1.05);fillInk(c,P.smooth([0,0,8,-4,18,-2,24,3,14,2,6,3]),'#3f9a3a',12,0,12,1.2);c.restore();}};
PROPS.bones=(c,R)=>{fillInk(c,P.smooth([-8,0,-8,-6,-3,-9,3,-9,8,-6,8,0]),'#f2ead8',0,-5,8,1.2);c.fillStyle=INK;c.beginPath();c.arc(-3,-5,1.4,0,7);c.arc(3,-5,1.4,0,7);c.fill();line(c,[-12,3,12,1],'#f2ead8',2.2,.7);};
PROPS.pyramid=(c,R)=>{const p=P.poly([-46,0,0,-52,46,0]);fillInk(c,p,'#d9b36a',0,-26,40,2);c.strokeStyle=rgba('#8a6a32',.6);c.lineWidth=1;for(let i=1;i<6;i++){const y=-i*8.6,w=46-i*7.7;c.beginPath();c.moveTo(-w,y);c.lineTo(w,y);c.stroke();}fillInk(c,P.rrect(-5,-12,10,12,2),'#4a3520',0,-6,6,1.2);};
PROPS.pine=(c,R)=>{fillInk(c,P.rrect(-3,-6,6,7,1),'#6b4a2e',0,-3,4,1.2);for(let i=0;i<3;i++){const y=-6-i*10,w=15-i*3.5;fillInk(c,P.poly([-w,y,0,y-16,w,y]),'#2f6b4f',0,y-8,w,1.4);c.fillStyle='#f4f9fc';c.fill(P.poly([-w*.75,y-3,0,y-15,w*.5,y-5,0,y-9]));}};
PROPS.iceRock=(c,R)=>{const p=P.smooth([-12,0,-12,-8,-5,-13,5,-13,12,-7,12,0]);fillInk(c,p,'#8aa3b5',0,-6,12,1.5);c.fillStyle='#fbfdff';c.fill(P.smooth([-10,-7,-5,-12,5,-12,11,-7,4,-8,-4,-8]));};
PROPS.icePatch=(c,R)=>{c.fillStyle=rgba('#a6d8f0',.8);c.beginPath();c.ellipse(0,0,22,8,0,0,7);c.fill();c.strokeStyle='#ffffff';c.lineWidth=1.2;c.beginPath();c.moveTo(-10,-2);c.lineTo(-2,-4);c.moveTo(4,2);c.lineTo(12,0);c.stroke();};
PROPS.snowman=(c,R)=>{fillInk(c,P.circle(0,-7,8),'#ffffff',0,-7,8,1.4,{dark:-.12});fillInk(c,P.circle(0,-19,6),'#ffffff',0,-19,6,1.4,{dark:-.12});c.fillStyle=INK;c.beginPath();c.arc(-2,-20,.9,0,7);c.arc(2,-20,.9,0,7);c.fill();T2(c,[0,-18.5,5,-17.5,0,-17],'#ff8a2a');fillInk(c,P.rrect(-5,-30,10,6,1),'#2a2a35',0,-27,5,1);line(c,[-6,-14,6,-14],'#d83a3a',2.4);};
function T2(c,pts,col){c.fillStyle=col;c.fill(P.poly(pts));}
PROPS.drift=(c,R)=>{c.fillStyle='#ffffff';c.beginPath();c.ellipse(0,0,14,4,0,Math.PI,0);c.fill();};
PROPS.jtree=(c,R)=>{fillInk(c,P.poly([-5,0,-4,-26,4,-26,5,0]),'#5a3d22',0,-13,8,1.5);for(let i=0;i<6;i++){c.save();c.translate(0,-28);c.rotate(-2.8+i*0.9);fillInk(c,P.smooth([0,0,10,-6,24,-4,30,2,18,4,8,4]),i%2?'#2f8a3a':'#3fa04a',15,0,14,1.3);c.restore();}};
PROPS.fern=(c,R)=>{for(let i=0;i<5;i++){c.save();c.rotate(-1.6+i*.55);c.strokeStyle='#3c8a3c';c.lineWidth=1.6;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(4,-8,0,-16);c.stroke();c.restore();}};
PROPS.toxicpool=(c,R)=>{const p=P.smooth([-22,0,-18,-8,0,-11,18,-8,22,2,4,7,-14,6]);c.save();c.shadowColor='#b84dff';c.shadowBlur=14;fillInk(c,p,'#9b3dd8',0,-2,22,1.8,{dark:-.2});c.restore();[[-6,-3],[7,-1]].forEach(([x,y])=>{c.strokeStyle='#e7b8ff';c.lineWidth=1;c.beginPath();c.arc(x,y,2.2,0,7);c.stroke();});};
PROPS.vine=(c,R)=>{c.strokeStyle='#2d6b2d';c.lineWidth=2;c.beginPath();c.moveTo(-14,0);c.bezierCurveTo(-6,-10,4,8,14,-4);c.stroke();for(let i=0;i<5;i++){c.fillStyle='#4caf50';c.beginPath();c.ellipse(-12+i*6,-2+(i%2)*3,2.4,1.4,i,0,7);c.fill();}};
PROPS.obsidian=(c,R)=>{for(const [x,h] of[[-5,14],[2,22],[8,12]]){const p=P.poly([x-4,0,x,-h,x+4,0]);fillInk(c,p,'#2a1f33',x,-h/2,5,1.3);c.strokeStyle='rgba(180,140,255,.5)';c.lineWidth=1;c.beginPath();c.moveTo(x-1,-2);c.lineTo(x,-h+3);c.stroke();}};
PROPS.lavariver=(c,R)=>{const p=new Path2D();p.moveTo(-40,0);p.bezierCurveTo(-20,-10,0,10,40,-4);c.save();c.shadowColor='#ff4a00';c.shadowBlur=16;c.strokeStyle='#2a1a18';c.lineWidth=12;c.lineCap='round';c.stroke(p);c.strokeStyle='#ff6a1a';c.lineWidth=8;c.stroke(p);c.strokeStyle='#ffd166';c.lineWidth=2.5;c.stroke(p);c.restore();};
PROPS.star=(c,R)=>{const r=.5+R()*1.6;c.fillStyle=R()<.2?'#ffe9a8':'#ffffff';c.globalAlpha=.5+R()*.5;c.beginPath();c.arc(0,0,r,0,7);c.fill();c.globalAlpha=1;};
PROPS.starshard=(c,R)=>{glow(c,0,-8,18,'#a8b4ff',.4);const p=P.poly([0,-22,4,-8,0,0,-4,-8]);fillInk(c,p,'#c9d1ff',0,-11,6,1.3);};
PROPS.planet=(c,R)=>{const col=R()<.5?'#ff9ec7':'#7fd6ff';fillInk(c,P.circle(0,0,18),col,0,0,18,1.8);c.strokeStyle=rgba('#ffffff',.7);c.lineWidth=2;c.beginPath();c.ellipse(0,0,28,7,-.35,0,7);c.stroke();};
PROPS.moonrock=(c,R)=>{const p=P.smooth([-11,0,-12,-7,-5,-12,5,-12,12,-6,11,0]);fillInk(c,p,'#6e6aa8',0,-6,11,1.4);c.strokeStyle=rgba(INK,.5);c.lineWidth=1;c.beginPath();c.arc(-3,-6,2.4,0,7);c.stroke();};
PROPS.comet=(c,R)=>{const g=c.createLinearGradient(-40,10,0,0);g.addColorStop(0,'rgba(160,200,255,0)');g.addColorStop(1,'rgba(220,235,255,.8)');c.strokeStyle=g;c.lineWidth=3;c.beginPath();c.moveTo(-40,12);c.lineTo(0,0);c.stroke();glow(c,0,0,6,'#ffffff',.9);};
PROPS.column=(c,R)=>{const h=R()<.5?34:20;fillInk(c,P.rrect(-7,-h,14,h,1),'#cfc8ad',0,-h/2,10,1.5);c.strokeStyle=rgba('#857d62',.8);c.lineWidth=1;for(let x=-3;x<=3;x+=3){c.beginPath();c.moveTo(x,-h+3);c.lineTo(x,-2);c.stroke();}fillInk(c,P.rrect(-9,-h-4,18,5,1),'#d9d2b8',0,-h,10,1.3);fillInk(c,P.rrect(-9,-3,18,4,1),'#bfb79b',0,-1,10,1.3);if(h<30){c.fillStyle='#5f8a3a';c.beginPath();c.arc(-5,-h-4,3,0,7);c.arc(-1,-h-5,2.5,0,7);c.fill();}};
PROPS.brokenwall=(c,R)=>{for(let r=0;r<3;r++)for(let i=0;i<5-r;i++){fillInk(c,P.rrect(-26+i*11+r*5,-8-r*7,10,7,1),shade('#b8b29a',(R()-.5)*.2),0,0,10,1.1);}};
PROPS.statue=(c,R)=>{fillInk(c,P.rrect(-10,-8,20,8,1),'#a7a08a',0,-4,10,1.4);fillInk(c,P.rrect(-5,-26,10,18,3),'#c2bba3',0,-17,8,1.3);fillInk(c,P.circle(0,-30,5),'#c2bba3',0,-30,5,1.3);line(c,[5,-22,11,-34],'#c2bba3',2.4,.8);};
/* ---- 2026.10.11.11: Sunken Reef props (original designs) ---- */
PROPS.coral=(c,R)=>{const cols=['#ff6f91','#ff9f6b','#c47dff','#ffd166'],col=cols[Math.floor(R()*cols.length)];
  const br=(x,y,a,len,w,d)=>{if(d>3)return;const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;line(c,[x,y,x2,y2],col,w,.7);fillInk(c,P.circle(x2,y2,w*.55),shade(col,.15),x2,y2,w*.55,.6);br(x2,y2,a-.45-R()*.2,len*.72,w*.75,d+1);br(x2,y2,a+.45+R()*.2,len*.72,w*.75,d+1);};
  br(0,0,-Math.PI/2,9,4,0);for(let i=0;i<3;i++){c.strokeStyle='rgba(220,250,255,.7)';c.lineWidth=.8;c.beginPath();c.arc(-6+i*6,-28-i*5,1.5+i*.4,0,7);c.stroke();}};
PROPS.shell=(c,R)=>{const col=R()<.5?'#f7d9c4':'#ffe3ef';const p=new Path2D();p.moveTo(-7,0);p.quadraticCurveTo(-8,-9,0,-10);p.quadraticCurveTo(8,-9,7,0);p.closePath();fillInk(c,p,col,0,-5,8,1.2);
  c.strokeStyle='rgba(160,100,90,.6)';c.lineWidth=.8;for(const x of[-4,0,4]){c.beginPath();c.moveTo(0,0);c.lineTo(x*1.4,-8.5);c.stroke();}};
PROPS.kelp=(c,R)=>{for(let i=0;i<3;i++){const x=(i-1)*4,h=18+R()*12,p=new Path2D();p.moveTo(x,0);p.bezierCurveTo(x-5,-h*.3,x+5,-h*.6,x-1,-h);stroke(c,p,INK,4);stroke(c,p,i%2?'#2f9e6a':'#3fbf7f',2.6);
  for(let k=1;k<4;k++){fillInk(c,P.ellipse(x+(k%2?3:-3),-h*k/4,3,1.4,k%2?.5:-.5),'#5ad89a',x,-h*k/4,3,.6);}}};
PROPS.starfish=(c,R)=>{const col=R()<.5?'#ff8a5b':'#ffb347',pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5+R()*.1,r=i%2?2.6:6.5;pts.push(Math.cos(a)*r,Math.sin(a)*r*.7);}
  fillInk(c,P.poly(pts),col,0,0,6,1);c.fillStyle='rgba(255,240,200,.8)';for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;c.beginPath();c.arc(Math.cos(a)*3,Math.sin(a)*2.1,.6,0,7);c.fill();}};
PROPS.tidepool=(c,R)=>{const p=P.smooth([-26,0,-22,-9,-6,-13,12,-12,26,-5,22,6,4,9,-16,7]);fillInk(c,p,'#1f6f8b',0,-2,24,1.8,{dark:-.25});
  c.strokeStyle='rgba(190,245,255,.55)';c.lineWidth=1.1;c.beginPath();c.ellipse(-5,-3,9,2.2,0,0,7);c.stroke();c.beginPath();c.ellipse(8,1,5,1.4,0,0,7);c.stroke();};
PROPS.egg=(c,R)=>{glow(c,0,-8,16,'#7cff6b',.35);const p=P.smooth([-7,0,-8,-9,-4,-16,4,-16,8,-9,7,0]);fillInk(c,p,'#6b3d8a',0,-8,8,1.4);c.fillStyle='#9dff8a';c.beginPath();c.ellipse(0,-9,3,4.5,0,0,7);c.fill();};
PROPS.tendril=(c,R)=>{c.strokeStyle=INK;c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-6,-8,6,-14,0,-24);c.stroke();c.strokeStyle='#8a4fb8';c.lineWidth=3;c.stroke();c.fillStyle='#d58bff';c.beginPath();c.arc(0,-24,2.4,0,7);c.fill();};
PROPS.slime=(c,R)=>{c.save();c.shadowColor='#6bff5a';c.shadowBlur=12;fillInk(c,P.smooth([-18,0,-14,-6,0,-9,14,-6,18,1,0,6]),'#5ad84a',0,-2,18,1.4,{dark:-.15});c.restore();};
PROPS.spore=(c,R)=>{glow(c,0,0,4,'#c4ff9a',.6);};
PROPS.crystalHive=(c,R)=>{for(const [x,h,a] of[[-5,14,-.3],[1,20,0],[6,12,.35]]){c.save();c.translate(x,0);c.rotate(a);fillInk(c,P.poly([-3,0,-3,-h*.7,0,-h,3,-h*.7,3,0]),'#b06bff',0,-h/2,4,1.1);c.restore();}};
PROPS.grave=(c,R)=>{const p=new Path2D();p.moveTo(-7,0);p.lineTo(-7,-12);p.arc(0,-12,7,Math.PI,0);p.lineTo(7,0);p.closePath();fillInk(c,p,'#77727f',0,-9,8,1.4);c.strokeStyle=rgba(INK,.6);c.lineWidth=1;c.beginPath();c.moveTo(0,-15);c.lineTo(0,-7);c.moveTo(-3,-12);c.lineTo(3,-12);c.stroke();c.fillStyle='#3a3245';c.beginPath();c.ellipse(0,1,9,2.5,0,0,7);c.fill();};
PROPS.candle=(c,R)=>{glow(c,0,-9,12,'#ffb347',.5);fillInk(c,P.rrect(-1.8,-7,3.6,7,1),'#efe6d2',0,-3,2,.8);c.fillStyle='#ffcf5a';c.beginPath();c.ellipse(0,-9,1.4,2.6,0,0,7);c.fill();};
PROPS.bat=(c,R)=>{c.fillStyle='#120d18';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-6,-6,-12,-2);c.quadraticCurveTo(-8,-1,-6,2);c.quadraticCurveTo(-3,0,0,3);c.quadraticCurveTo(3,0,6,2);c.quadraticCurveTo(8,-1,12,-2);c.quadraticCurveTo(6,-6,0,0);c.fill();};
PROPS.wall=(c,R)=>{for(let r=0;r<4;r++)for(let i=0;i<6;i++)fillInk(c,P.rrect(-33+i*11+(r%2)*5,-8-r*8,10.5,7.5,1),shade('#5a5262',(R()-.5)*.25),0,0,10,1.1);for(let i=0;i<4;i++)fillInk(c,P.rrect(-33+i*18,-46,9,8,1),'#5a5262',0,0,8,1.1);};
PROPS.fog=(c,R)=>{c.fillStyle='rgba(200,190,230,.10)';c.beginPath();c.ellipse(0,0,40,10,0,0,7);c.fill();};

/* Entrance (enemy spawn) and player base. */
function drawEntrance(c,kind,x,y,T){
  c.save();c.translate(x,y);
  if(kind==='portal'||kind==='hive'){const col=kind==='hive'?'#7cff6b':'#b48cff';glow(c,0,-14,40,col,.6);
    fillInk(c,P.ellipse(0,-14,17,25),kind==='hive'?'#4a2b63':'#3b2f7a',0,-14,20,2.2);c.fillStyle=rgba(col,.75);c.beginPath();c.ellipse(0,-14,11,19,0,0,7);c.fill();c.fillStyle='#120a20';c.beginPath();c.ellipse(0,-14,6,13,0,0,7);c.fill();}
  else if(kind==='gate'){fillInk(c,P.rrect(-24,-46,48,48,2),'#4a4255',0,-22,24,2);const a=new Path2D();a.moveTo(-13,2);a.lineTo(-13,-24);a.arc(0,-24,13,Math.PI,0);a.lineTo(13,2);a.closePath();c.fillStyle='#0d0912';c.fill(a);c.strokeStyle=INK;c.lineWidth=2;c.stroke(a);
    c.strokeStyle='#6b6178';c.lineWidth=1.5;for(let i=-9;i<=9;i+=4.5){c.beginPath();c.moveTo(i,-30);c.lineTo(i,2);c.stroke();}glow(c,-20,-40,10,'#ff9a3a',.7);glow(c,20,-40,10,'#ff9a3a',.7);}
  else{const rock=T.key==='tundra'?'#8aa3b5':T.key==='desert'?'#b48a4b':T.key==='ember'||T.key==='volcanic'?'#4a3631':'#6f6878';
    fillInk(c,P.smooth([-34,4,-30,-22,-14,-40,8,-42,26,-30,34,4]),rock,0,-18,32,2.2);
    c.fillStyle='#0c0812';c.beginPath();c.moveTo(-16,4);c.quadraticCurveTo(-16,-26,0,-28);c.quadraticCurveTo(16,-26,16,4);c.closePath();c.fill();
    c.fillStyle='#ff3d3d';c.beginPath();c.arc(-5,-12,1.6,0,7);c.arc(5,-12,1.6,0,7);c.fill();
    if(T.key==='tundra'){c.fillStyle='#fbfdff';c.fill(P.smooth([-28,-22,-14,-38,8,-40,24,-30,10,-31,-6,-30]));}}
  c.restore();
}
function drawBase(c,x,y){
  c.save();c.translate(x,y);
  c.fillStyle='rgba(10,8,20,.35)';c.beginPath();c.ellipse(4,4,34,9,0,0,7);c.fill();
  for(const sx of[-1,1]){fillInk(c,P.rrect(sx*20-8,-46,16,48,2),'#c9c1d6',sx*20,-22,10,1.8);fillInk(c,P.poly([sx*20-11,-46,sx*20,-62,sx*20+11,-46]),'#5b6ee1',sx*20,-52,9,1.6);for(let i=0;i<3;i++)fillInk(c,P.rrect(sx*20-8+i*6,-50,4,5,.5),'#c9c1d6',0,0,4,1);}
  fillInk(c,P.rrect(-14,-36,28,38,2),'#b8afc6',0,-17,16,1.8);
  const a=new Path2D();a.moveTo(-8,2);a.lineTo(-8,-16);a.arc(0,-16,8,Math.PI,0);a.lineTo(8,2);a.closePath();fillInk(c,a,'#6b4a2e',0,-10,8,1.5);
  line(c,[0,-62,0,-80],'#6b4a2e',1.6);c.fillStyle='#e94c6f';c.beginPath();c.moveTo(0,-80);c.lineTo(14,-75);c.lineTo(0,-70);c.fill();c.strokeStyle=INK;c.lineWidth=1;c.stroke();
  glow(c,0,-28,14,'#7ef0ff',.7);fillInk(c,P.poly([0,-36,6,-29,0,-20,-6,-29]),'#5fe3ff',0,-28,6,1.3,{dark:-.2});
  c.restore();
}

/* Decorated background, cached per map. */
const bgCache=new Map();
function mapBackground(key,path,W=800,H=450){
  const ck=key+'|'+path.flat().join(',');if(bgCache.has(ck))return bgCache.get(ck);
  const T={...THEMES[key],key};const R=rng(key.length*7919+path.length*131+Math.round(path[1][0]));
  const k=canvas(W,H),c=k.getContext('2d');const info=pathInfo(path);
  paintGround(c,T,R,W,H);
  // flat decals first (pools, patches, dunes), then road, then standing props sorted by y
  const placed=[];
  const flat=new Set(['pond','lavapool','icePatch','dune','toxicpool','slime','lily','crack','ember','star','firefly','spore','drift','lavariver','fog','pebble','flower','tuft','planet','comet']);
  const big={tree:30,pine:22,jtree:30,palm:26,cliff:40,pyramid:52,pond:34,lavapool:30,dune:44,boulder:20,column:14,brokenwall:30,wall:38,statue:14,lavariver:46,planet:30,deadtree:16,crystal:18,toxicpool:26,slime:22,hay:16,fence:24,bush:16,egg:12,tendril:10};
  const list=[];const flatSmall=new Set(['star','tuft','flower','pebble','ember','spore','firefly']);
  for(const [name,count] of Object.entries(T.props)){for(let i=0;i<count;i++){
    for(let tries=0;tries<40;tries++){const x=20+R()*(W-40),y=24+R()*(H-36),r=big[name]||6;
      const air=name==='star'||name==='bat'||name==='comet'||name==='planet'||name==='firefly'||name==='spore'||name==='ember'||name==='fog';
      if(!air&&distToPath(info,x,y)<26+r)continue;
      if(air&&name!=='star'&&name!=='fog'&&distToPath(info,x,y)<22)continue;
      if(r>8&&placed.some(p=>Math.hypot(p.x-x,p.y-y)<p.r+r))continue;
      placed.push({x,y,r});list.push({name,x,y,s:(flatSmall.has(name)?.9:1.05)+R()*.35,flip:R()<.5});break;}}}
  const drawProp=(p)=>{c.save();c.translate(p.x,p.y);c.scale(p.flip?-p.s:p.s,p.s);PROPS[p.name](c,R,T);c.restore();};
  list.filter(p=>flat.has(p.name)&&p.name!=='firefly'&&p.name!=='spore'&&p.name!=='ember'&&p.name!=='fog'&&p.name!=='planet'&&p.name!=='comet').forEach(drawProp);
  paintRoad(c,T,R,path,info,W,H);
  // spawn + base
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const s=path[0],e=path[path.length-1];
  drawEntrance(c,T.entrance,clamp(s[0],26,W-26),clamp(s[1],52,H-6),T);
  const standing=list.filter(p=>!flat.has(p.name)).sort((a,b)=>a.y-b.y);standing.forEach(drawProp);
  drawBase(c,clamp(e[0],34,W-34),clamp(e[1],86,H-8));
  list.filter(p=>['firefly','spore','ember','fog','planet','comet'].includes(p.name)).forEach(drawProp);
  // light + vignette baked in
  const sun=c.createLinearGradient(0,0,W,H);sun.addColorStop(0,'rgba(255,250,220,.14)');sun.addColorStop(.5,'rgba(255,255,255,0)');sun.addColorStop(1,'rgba(10,6,30,.28)');c.fillStyle=sun;c.fillRect(0,0,W,H);
  const v=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.68);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(4,2,16,.5)');c.fillStyle=v;c.fillRect(0,0,W,H);
  bgCache.set(ck,k);return k;
}

/* Stone build pad under placed units, themed per map. */
const padCache=new Map();
function unitPad(key){
  if(padCache.has(key))return padCache.get(key);
  const T={...THEMES[key],key},S=3,k=canvas(48*S,30*S),c=k.getContext('2d');c.scale(S,S);c.translate(24,13);
  c.fillStyle='rgba(8,6,18,.4)';c.beginPath();c.ellipse(2,5,21,8,0,0,7);c.fill();
  fillInk(c,P.ellipse(0,3,19,8.5),shade(T.edge,-.1),0,3,19,1.6);
  fillInk(c,P.ellipse(0,0,19,8.5),T.roadCol,0,0,16,1.6,{dark:-.18});
  c.strokeStyle=rgba(T.edge,.9);c.lineWidth=1;for(let i=0;i<8;i++){const a=i*Math.PI/4;c.beginPath();c.moveTo(Math.cos(a)*9,Math.sin(a)*4);c.lineTo(Math.cos(a)*18,Math.sin(a)*8);c.stroke();}
  c.beginPath();c.ellipse(0,0,9,4,0,0,7);c.stroke();
  padCache.set(key,k);return k;
}

return {INK,rng,shade,rgba,canvas,P,fillInk,stroke,line,glow,pathInfo,pointAt,distToPath,THEMES,STAGE_THEME,mapBackground,unitPad};
})();
/* ===================================================================
   Gem Guardians Art Engine v2 — units, enemies, summons and effects
   Units are described by a "look" (body, outfit, hat, weapon, gear)
   and rendered once into a cached sprite. Feet sit at y=+15, head at
   y≈-12, matching the old art() footprint so layouts stay the same.
   =================================================================== */
(function(G){
const {INK,P,fillInk,stroke,line,glow,shade,rgba,canvas}=G;
const SKIN={light:'#f6cfaa',tan:'#dca57a',brown:'#a8714c',dark:'#7a4a2e',pale:'#e9e4f2',green:'#8fd17a',blue:'#9fd4ff'};

/* ---------------- humanoid parts ---------------- */
function legs(c,L){
  if(L.body==='robe'||L.body==='gown')return;
  fillInk(c,P.rrect(-5.5,4,4.4,8,1.5),L.pants,-3,8,4,1.2);fillInk(c,P.rrect(1.1,4,4.4,8,1.5),L.pants,3,8,4,1.2);
}
function boots(c,L){fillInk(c,P.rrect(-6.6,10.5,5.6,4.5,2),L.boots,-4,12.5,4,1.2);fillInk(c,P.rrect(1,10.5,5.6,4.5,2),L.boots,4,12.5,4,1.2);}
function back(c,L){
  const b=L.back||{};
  if(b.cape){const p=new Path2D();p.moveTo(-7,-5);p.quadraticCurveTo(-14,4,-13,14);p.lineTo(13,14);p.quadraticCurveTo(14,4,7,-5);p.closePath();fillInk(c,p,b.cape,0,4,13,1.4);}
  if(b.quiver){c.save();c.rotate(-.35);fillInk(c,P.rrect(-12,-12,5.5,15,2),'#8a5a32',-9,-5,5,1.2);for(let i=0;i<3;i++){line(c,[-11+i*1.8,-12,-11+i*1.8,-17],'#e8e0d0',1);c.fillStyle=['#e2453c','#ffffff','#e2453c'][i];c.fill(P.poly([-12+i*1.8,-17,-10+i*1.8,-17,-11+i*1.8,-20]));}c.restore();}
  if(b.pack){fillInk(c,P.rrect(-15,-9,11,15,3),'#8a5a32',-10,-2,8,1.3);fillInk(c,P.rrect(-17,-14,14,6,3),b.pack,-10,-11,8,1.2);line(c,[-14,-11,-6,-11],'#e9c46a',1);fillInk(c,P.circle(-9,2,2.4),'#e9c46a',-9,2,2,1);}
  if(b.wings){for(const s of[-1,1]){const p=P.smooth([s*4,-4,s*16,-20,s*26,-14,s*22,-4,s*25,2,s*14,4,s*8,6]);fillInk(c,p,b.wings,s*15,-6,14,1.4);}}
  if(b.batwings){for(const s of[-1,1]){const p=new Path2D();p.moveTo(s*5,-4);p.lineTo(s*22,-16);p.quadraticCurveTo(s*20,-8,s*24,-2);p.quadraticCurveTo(s*18,-3,s*18,2);p.quadraticCurveTo(s*13,0,s*10,5);p.closePath();fillInk(c,p,b.batwings,s*14,-5,12,1.3);}}
}
function torso(c,L){
  const col=L.outfit,trim=L.trim||shade(col,-.3);
  if(L.body==='robe'||L.body==='gown'){const p=new Path2D();p.moveTo(-7.5,-5);p.lineTo(7.5,-5);p.quadraticCurveTo(9,5,12,13);p.quadraticCurveTo(0,16,-12,13);p.quadraticCurveTo(-9,5,-7.5,-5);p.closePath();fillInk(c,p,col,0,4,12,1.5);
    line(c,[-11,12.2,11,12.2],trim,1.6);line(c,[0,-4,0,12],trim,1.4);}
  else{const p=P.smooth([-8,-5,8,-5,9.5,3,8.5,8,-8.5,8,-9.5,3]);fillInk(c,p,col,0,1,9,1.5);
    if(L.body==='armor'||L.body==='heavy'){c.strokeStyle=rgba('#ffffff',.45);c.lineWidth=1;c.beginPath();c.moveTo(-5,-3);c.quadraticCurveTo(0,1,5,-3);c.stroke();}
    if(L.tabard){fillInk(c,P.poly([-4.5,-4,4.5,-4,4,9.5,0,11.5,-4,9.5]),L.tabard,0,3,5,1.1);if(L.emblem)L.emblem(c,0,2);}
    else line(c,[-1,-4,0,7],trim,1.1);}
  if(L.belt!==false){fillInk(c,P.rrect(-9,4.5,18,3,1),L.belt||'#5a3a22',0,6,9,1.1);fillInk(c,P.rrect(-1.8,4.2,3.6,3.6,.8),'#e9c46a',0,6,2,.9);}
  if(L.body==='armor'||L.body==='heavy'){const s=L.body==='heavy'?5.4:4.4;for(const x of[-1,1])fillInk(c,P.ellipse(x*8.4,-3.5,s,s*.8),L.metal||'#b8c2d0',x*8,-4,s,1.3);}
  if(L.collar)fillInk(c,P.poly([-7,-5,-10,-15,-3,-7,0,-5,3,-7,10,-15,7,-5]),L.collar,0,-8,8,1.3);
}
function arm(c,L,side,hand){const sx=side*8,hx=hand[0],hy=hand[1];line(c,[sx,-3,hx,hy],L.sleeve||L.outfit,4.2,1.25);fillInk(c,P.circle(hx,hy,2.4),L.glove||L.skin,hx,hy,2.4,1.1);}
function head(c,L){
  const hx=0,hy=-12,r=8;
  if(L.hairStyle==='long'||L.hairStyle==='flow'){fillInk(c,P.smooth([-9,-14,-8,-21,0,-23,8,-21,9,-14,10,-2,6,-4,-6,-4,-10,-2]),L.hair,0,-12,10,1.4);}
  fillInk(c,P.circle(hx,hy,r),L.skin,hx,hy,r,1.5,{dark:-.18});
  // ears (pointed for elves)
  if(L.ears==='pointy'){for(const s of[-1,1])fillInk(c,P.poly([s*7,-13,s*13,-17,s*7.5,-9]),L.skin,s*9,-13,4,1.1);}
  if(L.face==='hidden')return;
  // eyes
  const eyeY=-11.6;
  if(L.face==='visor'){fillInk(c,P.rrect(-6.5,-14,13,4,1.2),'#1d1426',0,-12,6,1);if(L.eyeGlow)for(const s of[-1,1]){glow(c,s*2.8,-12,4,L.eyeGlow,.9);c.fillStyle=L.eyeGlow;c.beginPath();c.arc(s*2.8,-12,1.1,0,7);c.fill();}return;}
  for(const s of[-1,1]){
    if(L.eyeGlow){glow(c,s*2.9,eyeY,4.5,L.eyeGlow,.85);c.fillStyle=L.eyeGlow;c.beginPath();c.ellipse(s*2.9,eyeY,1.5,1.9,0,0,7);c.fill();continue;}
    if(L.eyepatch&&s===1){fillInk(c,P.ellipse(2.9,eyeY,2.2,2.2),'#1d1426',2.9,eyeY,2,.8);line(c,[-7,-15,7,-9],'#1d1426',.9);continue;}
    c.fillStyle='#fff';c.beginPath();c.ellipse(s*2.9,eyeY,1.75,2.15,0,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=.6;c.stroke();
    c.fillStyle=L.iris||'#2b1d3a';c.beginPath();c.arc(s*2.9+.3,eyeY+.3,1.15,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(s*2.9+.7,eyeY-.4,.45,0,7);c.fill();}
  // brows
  c.strokeStyle=L.brow||shade(L.hair||'#3a2a20',-.2);c.lineWidth=1.1;c.lineCap='round';
  const ang=L.mood==='fierce'?1:L.mood==='calm'?-.3:.3;
  for(const s of[-1,1]){c.beginPath();c.moveTo(s*1.4,-15+ang*.6);c.lineTo(s*4.6,-15.6-ang*.4);c.stroke();}
  // mouth
  if(L.mask){fillInk(c,P.poly([-7,-10,7,-10,6,-5,0,-3.5,-6,-5]),L.mask,0,-7,6,1.1);return;}
  c.strokeStyle='#6b2a2a';c.lineWidth=.9;c.beginPath();if(L.mood==='fierce'){c.moveTo(-2,-7);c.lineTo(2,-7.3);}else{c.arc(0,-8.2,1.9,.25,Math.PI-.25);}c.stroke();
  if(L.blush){c.fillStyle='rgba(255,120,120,.35)';c.beginPath();c.arc(-5,-8.6,1.4,0,7);c.arc(5,-8.6,1.4,0,7);c.fill();}
  if(L.beard){const b=L.beard==='full'?P.smooth([-7,-10,-6,-3,-3,1,0,2,3,1,6,-3,7,-10,4,-7.5,-4,-7.5]):P.smooth([-3,-7,-2,-1.5,0,0,2,-1.5,3,-7]);fillInk(c,b,L.beardCol||L.hair,0,-5,6,1.1);
    c.strokeStyle='#6b2a2a';c.lineWidth=.9;c.beginPath();c.moveTo(-1.5,-6.6);c.lineTo(1.5,-6.6);c.stroke();}
  if(L.mustache)fillInk(c,P.smooth([-4.5,-7.6,-2,-9,0,-8.2,2,-9,4.5,-7.6,0,-7]),L.beardCol||L.hair,0,-8,4,.9);
}
function hair(c,L){
  if(!L.hair||L.hairStyle==='bald'||L.hairStyle==='none')return;
  if(L.hairStyle==='spiky'){fillInk(c,P.poly([-8.5,-12,-9,-18,-6,-17,-5,-22,-1,-18,1,-23,4,-18,7,-21,7,-16,9,-17,8.5,-12,4,-15,-4,-15]),L.hair,0,-17,8,1.3);return;}
  if(L.hairStyle==='swept'){fillInk(c,P.smooth([-8.6,-11,-8,-18,-2,-21.5,6,-20,9,-15,8.6,-11,5,-16,-2,-15,-6,-14]),L.hair,0,-16,9,1.3);return;}
  fillInk(c,P.smooth([-8.6,-11,-8,-18,-2,-21,5,-20.5,8.6,-16,8.6,-11,4,-15.5,-3,-15.5]),L.hair,0,-16,9,1.3);
  if(L.hairStyle==='bun')fillInk(c,P.circle(0,-21.5,3.4),L.hair,0,-21,3,1.2);
}
const HATS={
  wizard:(c,h)=>{const p=new Path2D();p.moveTo(-8,-17);p.quadraticCurveTo(-3,-26,1,-33);p.quadraticCurveTo(4,-37,9,-36);p.quadraticCurveTo(5,-33,5,-26);p.quadraticCurveTo(6,-21,8,-17);p.closePath();fillInk(c,p,h.col,1,-25,10,1.4);fillInk(c,P.ellipse(0,-17.5,12,3.2),shade(h.col,-.12),0,-17,12,1.4);if(h.band)line(c,[-7.2,-19.8,7.4,-19.8],h.band,2);if(h.sym)h.sym(c);},
  hood:(c,h)=>{const p=new Path2D();p.moveTo(-10,-4);p.quadraticCurveTo(-12,-18,-3,-22);p.quadraticCurveTo(5,-24,10,-17);p.quadraticCurveTo(12,-10,10,-4);p.quadraticCurveTo(6,-3,6.6,-10);p.quadraticCurveTo(5,-17.5,0,-17.5);p.quadraticCurveTo(-5,-17.5,-6.6,-10);p.quadraticCurveTo(-6,-3,-10,-4);p.closePath();fillInk(c,p,h.col,0,-14,11,1.4);if(h.horns)for(const s of[-1,1])fillInk(c,P.poly([s*5,-20,s*13,-31,s*9,-19]),h.horns,s*9,-24,4,1.2);},
  helm:(c,h)=>{const p=new Path2D();p.moveTo(-9,-11);p.quadraticCurveTo(-9.5,-22,0,-22.5);p.quadraticCurveTo(9.5,-22,9,-11);p.lineTo(6,-11);p.lineTo(6,-15);p.lineTo(-6,-15);p.lineTo(-6,-11);p.closePath();fillInk(c,p,h.col,0,-17,10,1.4);line(c,[0,-15,0,-9.5],h.col,2.2,.6);
    if(h.plume){const q=P.smooth([0,-22,-3,-29,3,-33,10,-30,13,-24,7,-26,3,-24]);fillInk(c,q,h.plume,5,-28,7,1.2);}
    if(h.horns)for(const s of[-1,1]){const q=new Path2D();q.moveTo(s*7,-18);q.quadraticCurveTo(s*15,-20,s*14,-30);q.quadraticCurveTo(s*11,-23,s*5,-21);q.closePath();fillInk(c,q,h.horns,s*10,-23,5,1.2);}
    if(h.crest)h.crest(c);},
  crown:(c,h)=>{fillInk(c,P.poly([-7,-17,-8,-25,-4,-21,0,-27,4,-21,8,-25,7,-17]),h.col||'#f2c84b',0,-21,8,1.3);c.fillStyle=h.gem||'#e2453c';c.beginPath();c.arc(0,-19.5,1.5,0,7);c.fill();},
  tricorn:(c,h)=>{fillInk(c,P.smooth([-13,-16,-8,-20,-4,-25,4,-25,8,-20,13,-16,0,-18]),h.col,0,-20,12,1.4);line(c,[-11,-16.6,11,-16.6],h.trim||'#e9c46a',1.2);fillInk(c,P.circle(0,-21,2.4),'#f4f1ea',0,-21,2,.8);c.fillStyle=INK;c.fillRect(-1,-21.5,.8,.8);c.fillRect(.4,-21.5,.8,.8);},
  feather:(c,h)=>{const p=P.smooth([-9,-14,-8,-19,-2,-23,6,-22,12,-27,9,-18,9,-14]);fillInk(c,p,h.col,0,-19,10,1.3);line(c,[-8.6,-15.4,8.8,-15.4],shade(h.col,-.25),1.6);const f=P.smooth([3,-20,7,-30,10,-34,9,-27,6,-21]);fillInk(c,f,h.feather||'#e2453c',7,-27,5,1.1);},
  miner:(c,h)=>{fillInk(c,P.smooth([-9,-13,-8.5,-20,0,-23,8.5,-20,9,-13]),h.col||'#f2c84b',0,-18,9,1.4);fillInk(c,P.rrect(-10.5,-14,21,2.6,1),shade(h.col||'#f2c84b',-.15),0,-13,10,1.2);glow(c,0,-19,9,'#fff3a0',.8);fillInk(c,P.circle(0,-19,2.6),'#fff7c2',0,-19,2.6,1);},
  merchant:(c,h)=>{const p=P.smooth([-12,-15,-11,-21,-5,-25.5,4,-26,11,-22,13,-16,6,-17,-4,-17]);fillInk(c,p,h.col,0,-20,12,1.5);fillInk(c,P.rrect(-10,-17.5,20,3.4,1.5),h.band||'#e9c46a',0,-16,10,1.2);const f=P.smooth([7,-22,14,-31,18,-35,15,-28,10,-21]);fillInk(c,f,h.feather||'#f2c84b',13,-28,5,1.1);fillInk(c,P.circle(6,-16.2,1.8),'#e2453c',6,-16,1.8,.8);},
  kabuto:(c,h)=>{const p=new Path2D();p.moveTo(-11,-12);p.quadraticCurveTo(-10,-23,0,-23.5);p.quadraticCurveTo(10,-23,11,-12);p.lineTo(8,-14);p.lineTo(-8,-14);p.closePath();fillInk(c,p,h.col,0,-18,10,1.4);for(const s of[-1,1])fillInk(c,P.poly([s*9,-13,s*14,-10,s*12,-7,s*8,-11]),h.col,s*11,-11,3,1.1);
    if(h.moon){const m=new Path2D();m.arc(0,-28,6.5,Math.PI*.15,Math.PI*.85,true);m.arc(0,-25.8,5.2,Math.PI*.8,Math.PI*.2,false);m.closePath();fillInk(c,m,h.moon,0,-31,6,1.1);}},
  veil:(c,h)=>{fillInk(c,P.ellipse(0,-17,14,3.4),h.col||'#f4ead2',0,-17,14,1.3);fillInk(c,P.smooth([-7,-17,-6,-23,0,-25,6,-23,7,-17]),h.col||'#f4ead2',0,-21,7,1.3);c.fillStyle='rgba(40,40,40,.28)';c.fill(P.rrect(-10,-16,20,12,3));c.strokeStyle='rgba(30,30,30,.4)';c.lineWidth=.5;for(let x=-9;x<=9;x+=2){c.beginPath();c.moveTo(x,-16);c.lineTo(x,-4);c.stroke();}},
  goggles:(c,h)=>{line(c,[-8.5,-17,8.5,-17],'#5a3a22',2.2);for(const s of[-1,1]){fillInk(c,P.circle(s*3.6,-17.5,2.9),'#c9a227',s*3.6,-17.5,3,1.1);c.fillStyle=h.lens||'#8ff0d8';c.beginPath();c.arc(s*3.6,-17.5,1.8,0,7);c.fill();}},
  headband:(c,h)=>{line(c,[-8.4,-16,8.4,-16],h.col,2.4,.6);line(c,[-8,-15,-12,-11],h.col,1.6);},
  circlet:(c,h)=>{line(c,[-8.2,-16.5,8.2,-16.5],h.col||'#f2c84b',1.6,.5);fillInk(c,P.poly([0,-20,2,-17,0,-15,-2,-17]),h.gem||'#7ef0ff',0,-17,2,.8);},
  bandana:(c,h)=>{fillInk(c,P.smooth([-9,-12,-8.5,-19,0,-21.5,8.5,-19,9,-12,0,-15]),h.col,0,-17,9,1.3);fillInk(c,P.poly([-8,-14,-14,-11,-12,-16]),h.col,-11,-13,3,1);c.fillStyle='#fff';[[-4,-17],[1,-19],[5,-16]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,.8,0,7);c.fill();});},
  halo:(c,h)=>{glow(c,0,-25,10,h.col||'#fff3a0',.6);c.strokeStyle=h.col||'#ffe27a';c.lineWidth=2;c.beginPath();c.ellipse(0,-25,8,2.4,0,0,7);c.stroke();},
};
/* weapons, held around the right hand (≈10,3) */
const WEAPONS={
  sword:(c,w)=>{const p=P.poly([10.2,1,12.6,1,15.5,-17,13.8,-20,12,-17.2]);fillInk(c,p,w.col||'#dfe6ee',13,-9,5,1.2);line(c,[8,1.6,14.8,0.4],w.guard||'#e9c46a',2,.6);line(c,[11.2,1.4,10.6,5],'#6b4a2e',1.8,.5);if(w.flame){glow(c,13,-10,12,w.flame,.6);}},
  greatsword:(c,w)=>{const p=P.poly([10,2,13.2,2,18,-24,15.6,-28,13,-24]);fillInk(c,p,w.col||'#dfe6ee',14,-12,6,1.3);line(c,[7.4,2.4,16,1],w.guard||'#e9c46a',2.4,.6);if(w.flame){glow(c,15,-12,15,w.flame,.7);c.fillStyle=rgba(w.flame,.85);c.fill(P.smooth([13,-4,11,-14,15,-20,14,-27,18,-22,19,-12,17,-4]));}},
  katana:(c,w)=>{const p=new Path2D();p.moveTo(10,2);p.quadraticCurveTo(18,-10,15,-24);p.lineTo(16.8,-24);p.quadraticCurveTo(20,-10,12,2.5);p.closePath();fillInk(c,p,'#e9eef5',15,-10,6,1.1);line(c,[8.6,2.6,13.4,1.6],'#2b2b3a',2.2,.5);line(c,[10.8,2.4,9.6,7],'#7a2a3a',1.8,.5);},
  spear:(c,w)=>{line(c,[11,13,15,-26],w.shaft||'#8a5a32',2,.7);fillInk(c,P.poly([14.5,-26,17.4,-25,16.2,-33]),w.col||'#dfe6ee',16,-28,3,1);},
  bow:(c,w)=>{const p=new Path2D();p.moveTo(12,-14);p.quadraticCurveTo(20,-1,12,12);stroke(c,p,INK,3.4);stroke(c,p,w.col||'#9a6334',2.2);line(c,[12,-14,10.5,12],'#f4f1ea',.7);line(c,[4,-1,18,-1],'#e8e0d0',1.1);fillInk(c,P.poly([18,-2.6,21.5,-1,18,.6]),'#cfd6de',19,-1,2,.7);},
  staff:(c,w)=>{line(c,[11,13,12.5,-22],w.shaft||'#8a5a32',2.1,.7);glow(c,12.6,-25,11,w.orb||'#7ef0ff',.65);fillInk(c,P.circle(12.6,-25,3.6),w.orb||'#7ef0ff',12.6,-25,3.6,1.1,{dark:-.12});if(w.crystal)fillInk(c,P.poly([12.6,-33,15.4,-26,12.6,-21,9.8,-26]),w.crystal,12.6,-27,4,1.1);},
  wand:(c,w)=>{line(c,[10,4,14,-9],'#6b4a2e',1.6,.6);glow(c,14.4,-10,8,w.orb||'#ffe27a',.8);c.fillStyle=w.orb||'#ffe27a';c.fill(P.poly([14.4,-14,15.4,-11,18.4,-10,15.6,-8.6,16.2,-5.6,14.4,-7.4,12.4,-5.6,13.2,-8.6,10.4,-10,13.4,-11]));},
  pickaxe:(c,w)=>{line(c,[8,9,15,-14],'#8a5a32',2.2,.7);const p=new Path2D();p.moveTo(7,-11);p.quadraticCurveTo(15,-19,23,-12);p.lineTo(22,-10.6);p.quadraticCurveTo(15,-15,8,-9.4);p.closePath();fillInk(c,p,'#a9b2bf',15,-13,8,1.1);},
  flask:(c,w)=>{fillInk(c,P.smooth([-2.5,-6,-2.5,-2,-5,2,0,4,5,2,2.5,-2,2.5,-6]),'#dff3f0',0,-1,5,1.1);c.fillStyle=w.col||'#6bff8a';c.beginPath();c.ellipse(0,1.6,3.6,2,0,0,7);c.fill();fillInk(c,P.rrect(-2,-8,4,2.4,.6),'#8a5a32',0,-7,2,.8);glow(c,0,1,7,w.col||'#6bff8a',.5);},
  pistol:(c,w)=>{fillInk(c,P.poly([8,1,17,-1,17,1.6,11,3,10,7,7.6,6.4]),w.col||'#4a4a55',12,2,5,1.1);fillInk(c,P.rrect(15,-1.6,3,2.2,.6),w.metal||'#c9cdd6',16,-.5,2,.8);},
  rifle:(c,w)=>{c.save();c.rotate(-.12);fillInk(c,P.poly([-2,2,26,-1,26,1.4,6,5,3,8,-3,6]),'#5a4234',10,2,12,1.2);fillInk(c,P.rrect(6,-3.4,9,2.8,1),'#2b2b35',10,-2,5,1);glow(c,15.5,-2,3,'#7ef0ff',.8);c.restore();},
  scales:(c,w)=>{line(c,[10,4,10,-12],'#c9a227',1.6,.5);line(c,[3,-12,17,-12],'#c9a227',1.6,.5);for(const x of[3,17]){line(c,[x,-12,x-2.5,-6],'#c9a227',.7);line(c,[x,-12,x+2.5,-6],'#c9a227',.7);fillInk(c,P.ellipse(x,-6,3.6,1.4),'#e9c46a',x,-6,3,.9);}fillInk(c,P.circle(10,-13,1.8),'#f2c84b',10,-13,2,.8);c.fillStyle='#ffe27a';c.beginPath();c.arc(3,-7.6,1.1,0,7);c.arc(2,-8.2,1.1,0,7);c.fill();},
  smoker:(c,w)=>{fillInk(c,P.rrect(8,-3,6,8,1.5),'#b0b8c4',11,1,4,1.1);fillInk(c,P.poly([8.4,-3,13.6,-3,12,-7,10,-7]),'#8b939f',11,-5,3,1);for(let i=0;i<3;i++){c.fillStyle=`rgba(230,230,240,${.55-i*.15})`;c.beginPath();c.arc(12+i*3,-10-i*4,2+i*1.2,0,7);c.fill();}},
  scythe:(c,w)=>{line(c,[9,13,14,-24],'#2a2030',2.2,.7);const p=new Path2D();p.moveTo(14,-24);p.quadraticCurveTo(2,-30,-8,-20);p.quadraticCurveTo(2,-26,13.5,-21);p.closePath();fillInk(c,p,w.col||'#b6e6ff',4,-24,10,1.1);},
  hammer:(c,w)=>{line(c,[9,10,14,-14],'#8a5a32',2.4,.7);fillInk(c,P.rrect(8,-21,13,8,1.5),w.col||'#9aa3b0',14,-17,7,1.3);},
  blaster:(c,w)=>{fillInk(c,P.smooth([7,2,12,-1,19,-1,19,2,13,4,11,8,8,7]),'#4b5563',13,2,6,1.1);glow(c,19.5,0,6,w.col||'#7cff6b',.9);fillInk(c,P.circle(19,0.5,1.6),w.col||'#7cff6b',19,0,2,.7);},
  twinpistols:(c,w)=>{WEAPONS.pistol(c,w);c.save();c.scale(-1,1);WEAPONS.pistol(c,w);c.restore();},
  daggers:(c,w)=>{for(const s of[1,-1]){c.save();c.scale(s,1);fillInk(c,P.poly([10,2,12,2,15,-8,13.4,-9.4]),w.col||'#d9e2ec',12.5,-3,3,1);line(c,[9,2.4,13.4,1.6],'#3a2a4a',1.6,.5);c.restore();}},
  torch:(c,w)=>{line(c,[10,8,12,-10],'#6b4a2e',2,.6);glow(c,12,-14,12,'#ff9a3a',.8);c.fillStyle='#ff7a1a';c.fill(P.smooth([9.5,-10,9,-15,12,-21,15,-15,14.5,-10]));c.fillStyle='#ffe27a';c.fill(P.smooth([11,-11,11,-14,12,-17,13.4,-14,13,-11]));},
};
const OFFHAND={
  shield:(c,o)=>{const p=new Path2D();p.moveTo(-17,-6);p.quadraticCurveTo(-10,-9,-4,-6);p.quadraticCurveTo(-3,6,-10.5,11);p.quadraticCurveTo(-18,6,-17,-6);p.closePath();fillInk(c,p,o.col,-10,1,8,1.4);if(o.emblem)o.emblem(c,-10.5,1.5);else{line(c,[-10.5,-6,-10.5,9],o.trim||'#e9c46a',1.4);line(c,[-16,-1,-5,-1],o.trim||'#e9c46a',1.4);}},
  book:(c,o)=>{fillInk(c,P.rrect(-16,-1,9,11,1.2),o.col||'#7a2a3a',-11.5,4.5,6,1.2);line(c,[-15,1,-8,1],'#e9c46a',.8);fillInk(c,P.rrect(-15.4,0,8,1.6,.4),'#f4ead2',-11,1,4,.5);glow(c,-11.5,4,7,'#ffe27a',.35);},
  pouch:(c,o)=>{fillInk(c,P.smooth([-14,2,-15.5,8,-10,11,-4.5,8,-6,2,-10,1]),o.col||'#9a6a3a',-10,6,6,1.2);line(c,[-13,2,-7,2],'#e9c46a',1.2);c.fillStyle='#f2c84b';[[-12,0],[-9,-1.2],[-6.6,0.4]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,1.6,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=.6;c.stroke();});},
  flask:(c,o)=>{c.save();c.translate(-21,1);WEAPONS.flask(c,o);c.restore();},
  bomb:(c,o)=>{fillInk(c,P.circle(-11,2,4.4),'#2b2b35',-11,2,4.4,1.2);line(c,[-11,-2.4,-9,-6],'#c9a27a',1);glow(c,-8.6,-6.6,4,'#ffcf5a',.9);},
  falcon:(c,o)=>{fillInk(c,P.rrect(-13,-2,4,4,1.2),'#7a5130',-11,0,3,1);const b=P.smooth([-15,-3,-16,-10,-12,-14,-8,-11,-8,-4,-11,-2]);fillInk(c,b,'#8b5e3c',-12,-8,6,1.2);fillInk(c,P.circle(-11.6,-14,3),'#c99a6a',-11.6,-14,3,1);c.fillStyle='#f2c84b';c.fill(P.poly([-9,-14,-6.6,-13,-9,-12.2]));c.fillStyle=INK;c.beginPath();c.arc(-11,-14.6,.7,0,7);c.fill();fillInk(c,P.smooth([-16,-9,-21,-14,-22,-6,-17,-4]),'#6b4428',-18,-8,4,1);},
  scroll:(c,o)=>{fillInk(c,P.rrect(-16,-2,8,10,1),'#f4ead2',-12,3,5,1.1);c.strokeStyle='#7a4a9a';c.lineWidth=.7;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-14.6,1+i*2.4);c.lineTo(-9.4,1+i*2.4);c.stroke();}},
  lantern:(c,o)=>{line(c,[-11,-3,-11,1],'#2b2b35',1);glow(c,-11,5,9,'#ffcf5a',.7);fillInk(c,P.rrect(-13.5,1,5,7,1),'#ffd66b',-11,4.5,3,1.1);},
};

/* ---------------- non-humanoid builders ---------------- */
const BEASTS={
  bird:(c,L)=>{ // phoenix / falcon style
    const col=L.outfit,col2=L.trim;
    for(const s of[-1,1]){const w=P.smooth([s*3,-4,s*14,-22,s*24,-24,s*22,-14,s*26,-8,s*16,-2,s*20,3,s*9,4]);fillInk(c,w,s<0?col2:col,s*14,-10,13,1.4);}
    fillInk(c,P.smooth([-4,14,-9,18,0,16,9,19,4,13]),col2,0,15,6,1.2);
    fillInk(c,P.smooth([-7,-2,-6,-9,0,-12,6,-9,7,-2,4,9,0,11,-4,9]),col,0,0,8,1.5);
    fillInk(c,P.circle(0,-14,6.5),col,0,-14,6.5,1.4);
    fillInk(c,P.poly([3,-15,10,-13,3,-11]),'#f2c84b',5,-13,3,1);
    for(const s of[-1,1]){c.fillStyle='#fff';c.beginPath();c.arc(s*2.4-1,-15,1.5,0,7);c.fill();c.fillStyle=INK;c.beginPath();c.arc(s*2.4-.6,-15,.8,0,7);c.fill();}
    if(L.flame){glow(c,0,-4,26,L.flame,.45);c.fillStyle=rgba('#ffe27a',.9);c.fill(P.smooth([-3,-19,-2,-26,1,-30,2,-24,5,-27,4,-19]));}
  },
  treant:(c,L)=>{
    for(const s of[-1,1])line(c,[s*4,10,s*11,15],'#5a3d22',2.6,.8);
    fillInk(c,P.smooth([-9,12,-10,-2,-8,-14,0,-17,8,-14,10,-2,9,12]),'#7a5434',0,-2,10,1.6);
    c.strokeStyle=rgba('#3a2414',.7);c.lineWidth=1;for(const x of[-5,0,5]){c.beginPath();c.moveTo(x,-12);c.quadraticCurveTo(x+2,0,x-1,10);c.stroke();}
    for(const s of[-1,1]){line(c,[s*8,-6,s*16,-14,s*19,-12],'#6b4a2e',2.6,.8);line(c,[s*14,-12,s*16,-19],'#6b4a2e',1.6,.6);}
    const can=P.smooth([-22,-20,-20,-32,-10,-40,2,-42,14,-38,22,-30,21,-20,10,-16,-10,-16]);fillInk(c,can,'#3f9a3a',0,-29,20,1.7);
    for(let i=0;i<7;i++){c.fillStyle=rgba(i%2?'#9fe07a':'#ffe27a',.6);c.beginPath();c.arc(-15+i*5,-32+Math.sin(i*1.7)*5,i%2?2.6:1.4,0,7);c.fill();}
    for(const s of[-1,1]){glow(c,s*3.4,-8,5,'#c8ff7a',.9);c.fillStyle='#e8ffb0';c.beginPath();c.ellipse(s*3.4,-8,1.5,2,0,0,7);c.fill();}
    c.strokeStyle='#3a2414';c.lineWidth=1;c.beginPath();c.arc(0,-3,2.4,.3,Math.PI-.3);c.stroke();
  },
  alien:(c,L)=>{
    fillInk(c,P.rrect(-6,2,5,11,2),L.outfit,-3,7,4,1.2);fillInk(c,P.rrect(1,2,5,11,2),L.outfit,3,7,4,1.2);
    fillInk(c,P.smooth([-7,-3,7,-3,8,6,-8,6]),L.outfit,0,1,8,1.4);line(c,[-7,1.5,7,1.5],L.trim,1.4);
    arm(c,{...L,sleeve:L.outfit,skin:L.skin},-1,[-10,5]);if(L.weapon)WEAPONS[L.weapon.type](c,L.weapon);else WEAPONS.blaster(c,{col:L.glow});arm(c,{...L,sleeve:L.outfit,skin:L.skin},1,[10,4]);
    for(const s of[-1,1]){line(c,[s*4,-20,s*8,-29],L.skin,1.4,.6);glow(c,s*8,-29,5,L.glow,.9);fillInk(c,P.circle(s*8,-29,1.8),L.glow,s*8,-29,2,.7);}
    fillInk(c,P.smooth([-10,-14,-9,-22,0,-25,9,-22,10,-14,6,-6,0,-4,-6,-6]),L.skin,0,-14,10,1.5,{dark:-.15});
    for(const s of[-1,1]){const e=P.ellipse(s*4,-14,3,4.4,s*.35);fillInk(c,e,'#0f1020',s*4,-14,3,.8,{flat:true,dark:0});c.fillStyle='#fff';c.beginPath();c.arc(s*4-1,-16,.9,0,7);c.fill();}
    c.strokeStyle='#2a4a3a';c.lineWidth=.8;c.beginPath();c.arc(0,-8.6,1.4,.3,Math.PI-.3);c.stroke();
    if(L.crown)HATS.crown(c,{col:L.crown,gem:L.glow});
    if(L.extra)L.extra(c);
  },
  dragon:(c,L)=>{
    const col=L.outfit,belly=L.trim;
    fillInk(c,P.smooth([6,8,16,10,22,4,20,12,10,15]),col,14,10,8,1.3);
    for(const s of[-1,1]){const w=P.smooth([s*4,-6,s*14,-24,s*28,-26,s*22,-16,s*26,-10,s*16,-6,s*20,0,s*8,2]);fillInk(c,w,L.wing||shade(col,-.15),s*16,-12,14,1.4);}
    fillInk(c,P.smooth([-8,12,-9,0,-6,-6,6,-6,9,0,8,12]),col,0,3,9,1.5);fillInk(c,P.smooth([-4,10,-5,0,0,-4,5,0,4,10]),belly,0,4,5,1);
    for(const s of[-1,1])fillInk(c,P.rrect(s*5-2.5,9,5,6,2),shade(col,-.1),s*5,12,3,1.1);
    fillInk(c,P.smooth([-8,-10,-7,-19,0,-22,8,-19,9,-12,13,-9,11,-5,4,-6,-6,-5]),col,1,-13,10,1.5);
    for(const s of[-1,1]){const h=new Path2D();h.moveTo(s*4,-20);h.quadraticCurveTo(s*9,-26,s*7,-32);h.quadraticCurveTo(s*6,-26,s*1.5,-21);h.closePath();fillInk(c,h,'#f4e6c8',s*6,-25,4,1.1);}
    for(const s of[-1,1]){c.fillStyle='#ffe27a';c.beginPath();c.ellipse(s*3.2,-14,1.6,2,0,0,7);c.fill();c.fillStyle=INK;c.fillRect(s*3.2-.4,-15.4,.8,2.8);}
    c.fillStyle=INK;c.beginPath();c.arc(9,-9,.7,0,7);c.arc(11,-8.4,.7,0,7);c.fill();
    if(L.crown)HATS.crown(c,{col:'#f2c84b',gem:'#e2453c'});
    if(L.fire){glow(c,16,-8,12,'#ff8a2a',.8);c.fillStyle='#ff7a1a';c.fill(P.smooth([12,-9,18,-13,26,-10,22,-8,27,-5,18,-5]));}
    if(L.extra)L.extra(c);
  },
  serpent:(c,L)=>{ // leviathan sage
    const col=L.outfit;const p=new Path2D();p.moveTo(-14,13);p.bezierCurveTo(-20,2,-4,4,-6,-6);p.bezierCurveTo(-8,-14,6,-18,6,-10);p.lineTo(10,-10);p.bezierCurveTo(10,-22,-12,-20,-11,-6);p.bezierCurveTo(-10,2,-20,0,-18,13);p.closePath();
    fillInk(c,P.smooth([-16,14,-18,6,-8,4,4,6,14,10,8,15]),col,0,10,14,1.4);
    fillInk(c,P.smooth([-6,8,-8,-4,-4,-14,4,-14,8,-4,6,8]),col,0,-2,8,1.4);
    fillInk(c,P.smooth([-6,-12,-5,-21,3,-24,10,-20,12,-14,6,-10,-2,-10]),col,2,-16,9,1.4);
    for(const s of[-1,1])fillInk(c,P.poly([s*3-1,-22,s*9,-30,s*6,-20]),L.trim,s*5,-25,4,1);
    c.fillStyle='#fff';c.beginPath();c.arc(3,-17,1.6,0,7);c.arc(8,-16,1.4,0,7);c.fill();c.fillStyle=INK;c.beginPath();c.arc(3.4,-17,.8,0,7);c.arc(8.2,-16,.7,0,7);c.fill();
    WEAPONS.staff(c,{orb:'#6ee7ff',shaft:'#2c7a8a'});
  }
};

/* ---------------- unit looks (preview set; all others use the same system) ---------------- */
const crossEmblem=(col)=>(c,x,y)=>{line(c,[x,y-4,x,y+4],col,1.6);line(c,[x-3,y-1,x+3,y-1],col,1.6);};
const LOOKS={
  barter:{skin:SKIN.tan,hair:'#5a3a22',beard:'full',beardCol:'#6b4428',outfit:'#8b2b3a',trim:'#e9c46a',sleeve:'#a83c4c',pants:'#5a4030',boots:'#4a2e1e',belt:'#5a3a22',mood:'happy',blush:true,
    hat:{type:'merchant',col:'#7a2232',band:'#e9c46a',feather:'#f2c84b'},weapon:{type:'scales'},off:{type:'pouch'},back:{pack:'#b8864a'}},
  knight:{skin:SKIN.light,hair:'#8a5a32',outfit:'#9aa6b6',metal:'#c3ccd8',body:'armor',tabard:'#2f5fbf',emblem:crossEmblem('#f2c84b'),sleeve:'#8a96a8',pants:'#5a6678',boots:'#3a3f4a',mood:'fierce',
    hat:{type:'helm',col:'#b8c2d0',plume:'#3a6fe0'},weapon:{type:'sword'},off:{type:'shield',col:'#2f5fbf',emblem:crossEmblem('#f2c84b')}},
  archer:{skin:SKIN.light,hair:'#c9802f',outfit:'#3f8a3a',trim:'#2a5a26',sleeve:'#4f9a46',pants:'#6b4a2e',boots:'#4a2e1e',mood:'happy',ears:'pointy',
    hat:{type:'feather',col:'#3a7a34',feather:'#e2453c'},weapon:{type:'bow'},back:{quiver:true}},
  apprentice:{skin:SKIN.light,hair:'#3a2a20',hairStyle:'spiky',outfit:'#7a4ad8',trim:'#f2c84b',body:'robe',sleeve:'#8a5ae8',boots:'#3a2a4a',mood:'happy',blush:true,
    weapon:{type:'wand',orb:'#ffe27a'},off:{type:'book',col:'#3a2a6a'}},
  miner:{skin:SKIN.tan,hair:'#3a2a20',beard:'full',beardCol:'#8a5a32',outfit:'#c46a2a',trim:'#7a3a14',sleeve:'#9a5a2a',pants:'#3f5a8a',boots:'#3a2a20',mood:'fierce',
    hat:{type:'miner',col:'#f2c84b'},weapon:{type:'pickaxe'},back:{pack:'#6b4a2e'}},
  alchemist:{skin:SKIN.light,hair:'#e8e2d6',hairStyle:'swept',outfit:'#2f8a7a',trim:'#f4ead2',body:'robe',sleeve:'#3fa08e',boots:'#3a2a20',mood:'happy',mustache:true,beardCol:'#e8e2d6',
    hat:{type:'goggles',lens:'#8ff0d8'},weapon:{type:'flask',col:'#7cff6b'},off:{type:'flask',col:'#ff6bd8'}},
  falconer:{skin:SKIN.brown,hair:'#2a1a12',outfit:'#7a5a3a',trim:'#4a3220',sleeve:'#8a6a48',pants:'#4a5a3a',boots:'#3a2a1a',glove:'#5a3a22',mood:'calm',
    hat:{type:'feather',col:'#5a6a3a',feather:'#c99a6a'},weapon:{type:'bow',col:'#7a4a2a'},off:{type:'falcon'},back:{cape:'#3f5a34'}},
  pirate:{skin:SKIN.tan,hair:'#1a1210',beard:'goatee',outfit:'#b8323a',trim:'#e9c46a',sleeve:'#c8424a',pants:'#3a3048',boots:'#1d1426',mood:'fierce',eyepatch:true,
    hat:{type:'tricorn',col:'#1d1a24'},weapon:{type:'pistol'},off:{type:'bomb'}},
  mage:{skin:SKIN.light,hair:'#f4f9ff',beard:'full',beardCol:'#f4f9ff',outfit:'#3a7ad8',trim:'#bfe6ff',body:'robe',sleeve:'#4a8ae8',boots:'#2a3a6a',mood:'calm',
    hat:{type:'wizard',col:'#2f64c0',band:'#bfe6ff',sym:c=>{c.fillStyle='#e8f8ff';for(let i=0;i<6;i++){c.save();c.translate(1,-26);c.rotate(i*Math.PI/3);c.fillRect(-.4,0,.8,3.4);c.restore();}}},weapon:{type:'staff',orb:'#bfefff',crystal:'#9fe6ff'},back:{cape:'#2a5aa8'}},
  sniper:{skin:SKIN.light,hair:'#5a4a3a',outfit:'#5f6a52',trim:'#3a4232',sleeve:'#6b7660',pants:'#4a4a3a',boots:'#2a2a20',mood:'fierce',iris:'#3a6a8a',
    hat:{type:'hood',col:'#56604a'},weapon:{type:'rifle'},back:{cape:'#4a5240'}},
  samurai:{skin:SKIN.light,hair:'#1a1210',outfit:'#3a2f5a',metal:'#a8323a',body:'armor',trim:'#f2c84b',sleeve:'#4a3f6a',pants:'#2a2240',boots:'#1d1426',mood:'fierce',mask:'#a8323a',
    hat:{type:'kabuto',col:'#2a2240',moon:'#f2e6a0'},weapon:{type:'katana'}},
  dragon:{skin:SKIN.light,outfit:'#7a3ac8',metal:'#9a5ae0',body:'heavy',trim:'#f2c84b',sleeve:'#6a2ab8',pants:'#4a2a7a',boots:'#2a1a4a',face:'visor',eyeGlow:'#ffb347',
    hat:{type:'helm',col:'#8a4ad8',horns:'#f4e6c8',crest:c=>{fillInk(c,P.poly([0,-22,-3,-30,0,-27,3,-31,3,-23]),'#e2453c',0,-26,4,1);}},weapon:{type:'greatsword',flame:'#ff8a2a',col:'#ffd0a0'},back:{wings:'#5a2aa8'}},
  phoenix:{beast:'bird',outfit:'#ff7a2a',trim:'#e2453c',flame:'#ff9a3a'},
  worldtree:{beast:'treant'},
  moonling:{beast:'alien',skin:'#9fe8d0',outfit:'#3a3a6a',trim:'#8ddcff',glow:'#8ddcff'},
  abyss_summoner:{skin:'#2a1a24',hair:'#09070c',outfit:'#14101c',trim:'#e5142d',body:'robe',sleeve:'#1d1726',boots:'#09070c',eyeGlow:'#ff2445',mask:'#3a0a14',
    hat:{type:'hood',col:'#0f0b16',horns:'#3a0a14'},weapon:{type:'staff',orb:'#ff2445',shaft:'#2a1018'},aura:'#ff1d36'},
  alucard:{skin:SKIN.pale,hair:'#dfe3ee',hairStyle:'swept',outfit:'#2a1838',trim:'#c9a8ff',sleeve:'#3a2250',pants:'#1d1228',boots:'#120b1a',mood:'fierce',iris:'#b06bff',eyeGlow:'#c08bff',
    collar:'#4a2a6a',weapon:{type:'twinpistols',col:'#d9dee8',metal:'#b06bff'},back:{cape:'#3a1f55',batwings:null},aura:'#9b5bff'},
  beekeeper:{skin:SKIN.tan,hair:'#5a3a22',outfit:'#f4ead2',trim:'#c9a227',sleeve:'#efe2c2',pants:'#e8dcc0',boots:'#6b4a2e',glove:'#c9a227',mood:'happy',
    hat:{type:'veil',col:'#f4ead2'},weapon:{type:'smoker'},bees:true},
};
const DISPLAY_NAMES={alucard:'Count Vesper'};

function drawHumanoid(c,L){
  back(c,L);legs(c,L);boots(c,L);
  // rear arm first (left side), then torso, front arm last
  const off=L.off&&OFFHAND[L.off.type];
  if(!off)arm(c,L,-1,[-10,5]);
  torso(c,L);
  if(off){arm(c,L,-1,L.off.type==='falcon'?[-11,0]:[-10,3]);}
  if(L.weapon?.type==='twinpistols')arm(c,L,-1,[-10,3]);
  head(c,L);if(L.snout)reptileFace(c,L);if(L.stone)stoneSkin(c);hair(c,L);
  if(L.hat)HATS[L.hat.type](c,L.hat);
  if(off)OFFHAND[L.off.type](c,L.off);
  if(L.weapon)WEAPONS[L.weapon.type](c,L.weapon);
  arm(c,L,1,L.handR||[10,3]);
  if(L.extra)L.extra(c);
  if(L.bees)for(const [x,y] of[[-14,-20],[16,-22],[-18,-6]]){c.fillStyle='#f2c84b';c.beginPath();c.ellipse(x,y,2,1.4,0,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=.6;c.stroke();c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.ellipse(x-.4,y-1.6,1,1.4,0,0,7);c.fill();}
}

/* Sprite cache: draw once at high resolution, blit every frame. */
const SPR=3,SW=72,SH=84,OX=36,OY=56;
const spriteCache=new Map();
function unitSprite(id,variant){
  const key=id+'|'+(variant||'');
  if(spriteCache.has(key))return spriteCache.get(key);
  if(variant==='midas'){const base=unitSprite(id);if(!base)return null;const k=canvas(base.width,base.height),c=k.getContext('2d');c.drawImage(base,0,0);c.globalCompositeOperation='source-atop';c.fillStyle='rgba(255,199,34,.42)';c.fillRect(0,0,k.width,k.height);spriteCache.set(key,k);return k;}
  const L=LOOKS[id];if(!L)return null;
  const k=canvas(SW*SPR,SH*SPR),c=k.getContext('2d');c.scale(SPR,SPR);c.translate(OX,OY);
  c.fillStyle='rgba(10,6,20,.38)';c.beginPath();c.ellipse(0,15,13,4.2,0,0,7);c.fill();
  if(L.beast)BEASTS[L.beast](c,L);else drawHumanoid(c,L);
  spriteCache.set(key,k);return k;
}
/* art(): drop-in replacement signature for the game's art(c,id,x,y,sc,trait,time). */
function drawUnit(c,id,x,y,sc=1,time=performance.now()/1000,opt={}){
  const k=unitSprite(id,opt.midas?'midas':'');if(!k)return false;const L=LOOKS[id];
  const bob=opt.still?0:Math.sin(time*3+(x*0.05))*0.6;
  c.save();c.translate(x,y);c.scale(sc,sc);
  if(L.aura){const pulse=.5+.5*Math.sin(time*3);glow(c,0,-6,24+pulse*4,L.aura,.32+pulse*.12);}
  if(opt.flip)c.scale(-1,1);
  c.drawImage(k,-OX,-OY+bob,SW,SH);
  c.restore();return true;
}

/* ---------------- enemies (cached walk frames) ---------------- */
const ENEMY_LOOK={
  normal:{name:'Horned Imp',r:11},tank:{name:'Iron Beetle',r:14},runner:{name:'Goblin Runner',r:9},elite:{name:'Void Knight',r:13},boss:{name:'Demon Overlord',r:18},
  shield:{name:'Crystal Shellback',r:14},flyer:{name:'Gloomwing',r:10},healer:{name:'Moss Shaman',r:11},splitter:{name:'Gloop',r:13},gloopling:{name:'Gloopling',r:8},burrower:{name:'Tide Crab',r:13},dasher:{name:'Shadow Lynx',r:11},berserk:{name:'Ember Brute',r:15}};
function enemyBody(c,kind,f){ // f: walk phase 0..3
  const step=[0,1,0,-1][f];
  if(kind==='tank'){
    for(const s of[-1,1])for(let i=0;i<3;i++){const ph=(i%2?step:-step)*2;line(c,[s*7,-2+i*5,s*16,2+i*5+ph,s*17,6+i*5+ph],'#1d2a4a',1.8,.8);}
    fillInk(c,P.smooth([-14,6,-14,-6,-8,-14,8,-14,14,-6,14,6,8,12,-8,12]),'#4b7ad8',0,-1,14,1.8);
    line(c,[0,-13,0,11],'#2a4a9a',1.6);for(const s of[-1,1]){c.fillStyle='rgba(200,225,255,.6)';c.beginPath();c.ellipse(s*6,-6,3,5,s*.3,0,7);c.fill();}
    fillInk(c,P.smooth([-7,-12,-6,-18,0,-20,6,-18,7,-12]),'#2a3a6a',0,-15,7,1.4);
    for(const s of[-1,1])fillInk(c,P.poly([s*3,-19,s*7,-26,s*5,-18]),'#c9cdd6',s*5,-22,3,1);
    for(const s of[-1,1]){c.fillStyle='#ffd166';c.beginPath();c.arc(s*3,-15,1.3,0,7);c.fill();}
    return;}
  if(kind==='runner'){
    line(c,[-2,6,-5-step*3,13],'#2a5a2a',2.6,.8);line(c,[2,6,5+step*3,13],'#2a5a2a',2.6,.8);
    fillInk(c,P.smooth([-6,-2,6,-2,6,7,-6,7]),'#7a4a2a',0,2,6,1.3);
    line(c,[-5,0,-9,4+step*2],'#5ad86a',2.2,.7);line(c,[5,0,10,-2-step*2],'#5ad86a',2.2,.7);
    fillInk(c,P.poly([10,-1,16,-7,15,-2]),'#cfd6de',13,-4,3,1);
    fillInk(c,P.circle(0,-8,6.5),'#5ad86a',0,-8,6.5,1.4,{dark:-.22});
    for(const s of[-1,1])fillInk(c,P.poly([s*5,-10,s*14,-14,s*6,-6]),'#5ad86a',s*9,-10,4,1.1);
    for(const s of[-1,1]){c.fillStyle='#fff6a0';c.beginPath();c.ellipse(s*2.4,-9,1.4,1.7,0,0,7);c.fill();c.fillStyle=INK;c.beginPath();c.arc(s*2.4+.4,-8.8,.7,0,7);c.fill();}
    c.strokeStyle=INK;c.lineWidth=.8;c.beginPath();c.moveTo(-2.4,-5);c.lineTo(2.4,-5);c.stroke();c.fillStyle='#fff';c.fill(P.poly([-1.6,-5,-1,-3.6,-.4,-5]));
    return;}
  if(kind==='elite'){
    line(c,[-3,6,-4-step*2,14],'#2a1a3a',3,.8);line(c,[3,6,4+step*2,14],'#2a1a3a',3,.8);
    line(c,[10,12,14,-22],'#3a2a20',1.8,.6);fillInk(c,P.smooth([12,-22,20,-24,22,-16,15,-17]),'#c9cdd6',17,-20,5,1.1);
    fillInk(c,P.smooth([-9,-4,9,-4,8,8,-8,8]),'#6a2a9a',0,2,9,1.5);
    for(const s of[-1,1])fillInk(c,P.poly([s*6,-6,s*15,-9,s*12,-1,s*7,0]),'#4a1a7a',s*10,-4,5,1.2);
    fillInk(c,P.smooth([-7,-6,-7,-14,0,-18,7,-14,7,-6]),'#4a1a7a',0,-11,7,1.5);
    for(const s of[-1,1])fillInk(c,P.poly([s*4,-15,s*10,-25,s*7,-13]),'#c9a8ff',s*7,-18,3,1);
    fillInk(c,P.rrect(-5,-12,10,2.8,1),'#120a1a',0,-11,5,.8);glow(c,0,-11,7,'#e0b7ff',.8);
    arm(c,{outfit:'#4a1a7a',skin:'#2a1a3a'},1,[11,2]);
    return;}
  if(kind==='boss'){
    const cape=P.smooth([-12,-10,-20,8,-14,16,0,14,14,16,20,8,12,-10]);fillInk(c,cape,'#4a0e1e',0,4,18,1.6);
    line(c,[-4,8,-6-step*2,17],'#1d1426',4,.8);line(c,[4,8,6+step*2,17],'#1d1426',4,.8);
    fillInk(c,P.smooth([-12,-8,12,-8,13,4,9,10,-9,10,-13,4]),'#3a3348',0,1,12,1.8);
    glow(c,0,0,10,'#ff3e60',.8);fillInk(c,P.poly([0,-6,5,0,0,6,-5,0]),'#ff3e60',0,0,5,1.1,{dark:-.1});
    for(const s of[-1,1])fillInk(c,P.smooth([s*9,-10,s*19,-14,s*20,-4,s*12,-2]),'#2a2433',s*15,-8,6,1.4);
    line(c,[-15,-2,-20,14],'#5a4a3a',2.4,.8);fillInk(c,P.smooth([-24,6,-26,14,-20,18,-16,12]),'#b8c2d0',-21,12,5,1.2);
    fillInk(c,P.circle(0,-17,8.5),'#5a4a6a',0,-17,8.5,1.6,{dark:-.25});
    for(const s of[-1,1]){const h=new Path2D();h.moveTo(s*6,-22);h.quadraticCurveTo(s*18,-24,s*20,-38);h.quadraticCurveTo(s*13,-28,s*4,-25);h.closePath();fillInk(c,h,'#efe2c8',s*13,-28,7,1.3);}
    HATS.crown(c,{col:'#f2c84b',gem:'#ff3e60'});c.save();c.translate(0,-6);c.restore();
    for(const s of[-1,1]){glow(c,s*3.4,-17,5,'#ff3e60',.9);c.fillStyle='#ffd0d8';c.beginPath();c.ellipse(s*3.4,-17,1.5,1.2,0,0,7);c.fill();}
    c.strokeStyle=INK;c.lineWidth=1;c.beginPath();c.moveTo(-4,-12);c.lineTo(4,-12);c.stroke();c.fillStyle='#fff';c.fill(P.poly([-3,-12,-2.4,-10,-1.8,-12]));c.fill(P.poly([1.8,-12,2.4,-10,3,-12]));
    return;}
  // ---- 2026.10.11.8: new enemy classes (original designs) ----
  if(kind==='shield'){ // Crystal Shellback: stocky beast carrying a crystal shell and a round crystal shield
    for(const s of[-1,1])line(c,[s*6,6,s*(7+step*s*2),13],'#4a3a2a',3.4,.8);
    fillInk(c,P.smooth([-14,4,-15,-6,-8,-15,6,-16,13,-8,13,4,4,9,-8,9]),'#2f6f86',-1,-3,15,1.7);
    for(const [x,y,h] of[[-8,-10,7],[-2,-14,8],[5,-12,7],[-11,-3,5],[9,-4,5]])fillInk(c,P.poly([x-2.4,y+2,x,y-h,x+2.4,y+2]),'#9ff3ff',x,y-h/2,h/2,.9,{dark:-.35});
    fillInk(c,P.circle(-13,-2,5.5),'#8a6a4a',-13,-2,5.5,1.3,{dark:-.25});
    for(const s of[-1,1])fillInk(c,P.poly([-15+s*2,-6,-17+s*3,-11,-12+s*2,-7]),'#efe2c8',-15,-8,2,.8);
    c.fillStyle='#ffd166';c.beginPath();c.arc(-15,-3,1.2,0,7);c.fill();
    fillInk(c,P.circle(10,1,8),'#6fd6ef',10,1,8,1.6,{dark:-.32});
    fillInk(c,P.poly([10,-4,14,1,10,6,6,1]),'#e9fdff',10,1,4,1,{dark:-.2});glow(c,10,1,9,'#9ff3ff',.45);
    return;}
  if(kind==='healer'){ // Moss Shaman: small mossy robed shaman with a glowing leaf staff
    line(c,[-3,6,-4-step*2,13],'#3a2a1a',2.6,.8);line(c,[3,6,4+step*2,13],'#3a2a1a',2.6,.8);
    line(c,[9,13,11,-20],'#6b4a2e',2,.7);
    fillInk(c,P.smooth([-8,-3,8,-3,10,9,-10,9]),'#4f7a3a',0,3,10,1.4);
    for(const x of[-6,-1,4])fillInk(c,P.poly([x,7,x+2,11,x+4,7]),'#3b5f2a',x+2,9,2,.7);
    fillInk(c,P.circle(0,-8,6.2),'#9bbd6a',0,-8,6.2,1.4,{dark:-.25});
    fillInk(c,P.smooth([-8,-7,-6,-15,0,-19,6,-15,8,-7,4,-10,-4,-10]),'#3b6a2a',0,-12,8,1.3);
    for(const s of[-1,1])fillInk(c,P.smooth([s*4,-17,s*10,-21,s*8,-15]),'#6fbf4a',s*7,-18,3,.8);
    for(const s of[-1,1]){c.fillStyle='#fff6a0';c.beginPath();c.ellipse(s*2.3,-8,1.3,1.5,0,0,7);c.fill();c.fillStyle=INK;c.beginPath();c.arc(s*2.3,-7.8,.6,0,7);c.fill();}
    arm(c,{outfit:'#4f7a3a',skin:'#9bbd6a'},1,[10,-2]);
    glow(c,11,-22,9,'#7dff8a',.7);fillInk(c,P.circle(11,-22,3.2),'#8dff9a',11,-22,3.2,1,{dark:-.2});
    for(const s of[-1,1])fillInk(c,P.smooth([11,-24,11+s*5,-28,11+s*2,-23]),'#4fbf3a',11+s*3,-26,2,.7);
    return;}
  if(kind==='flyer'){ // Gloomwing: a purple bat that flies above the road (immune to slow and freeze)
    const up=[-1,0,1,0][f],wy=-12+up*5;
    c.save();c.translate(0,-9+up);
    for(const s of[-1,1]){const w=P.smooth([s*4,-3,s*12,wy-4,s*20,wy-1,s*22,wy+6,s*16,wy+3,s*13,wy+8,s*8,wy+4,s*5,3]);fillInk(c,w,'#5a3a8a',s*13,wy+1,10,1.3,{dark:-.35});
      line(c,[s*5,-1,s*12,wy-3,s*20,wy],'#2a1a4a',.9);}
    fillInk(c,P.ellipse(0,0,6,7.5),'#6b4a9a',0,0,7,1.4,{dark:-.28});
    for(const s of[-1,1])fillInk(c,P.poly([s*2,-6,s*6,-12,s*5,-4]),'#6b4a9a',s*4,-8,3,.9);
    for(const s of[-1,1]){c.fillStyle='#ffdf5a';c.beginPath();c.ellipse(s*2.3,-2,1.5,1.2,0,0,7);c.fill();glow(c,s*2.3,-2,3,'#ffdf5a',.5);}
    c.fillStyle='#fff';c.fill(P.poly([-1.6,2,-1,3.8,-.4,2]));c.fill(P.poly([.4,2,1,3.8,1.6,2]));
    c.restore();
    return;}
  if(kind==='splitter'||kind==='gloopling'){ // Gloop: a jelly slime that splits into two Glooplings
    const sq=[0,1,0,-1][f]*.08,sc=kind==='gloopling'?.62:1;
    c.save();c.scale(sc*(1+sq),sc*(1-sq));
    const body=P.smooth([-13,10,-14,0,-9,-10,0,-14,9,-10,14,0,13,10]);
    c.globalAlpha=.92;fillInk(c,body,'#3ed6a6',0,-1,14,1.6,{dark:-.3});c.globalAlpha=1;
    c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(-6,-7,3,2,-.5,0,7);c.fill();
    for(const [x,y,r] of[[5,4,2],[-4,5,1.4],[8,-3,1.1]]){c.strokeStyle='rgba(230,255,245,.8)';c.lineWidth=.8;c.beginPath();c.arc(x,y,r,0,7);c.stroke();}
    for(const s of[-1,1]){c.fillStyle='#fff';c.beginPath();c.ellipse(s*4,-3,2.6,3,0,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=.8;c.stroke();c.fillStyle=INK;c.beginPath();c.arc(s*4+.5,-2.5,1.2,0,7);c.fill();}
    c.strokeStyle=INK;c.lineWidth=.9;c.beginPath();c.arc(0,2,2.6,.25,Math.PI-.25);c.stroke();
    c.restore();
    return;}
  if(kind==='dasher'){ // Shadow Lynx: a dark cat that dashes forward every few seconds
    const lg=[[1,-1],[0,0],[-1,1],[0,0]][f];
    for(const [x,p] of[[-8,lg[0]],[-4,lg[1]],[5,lg[1]],[9,lg[0]]])line(c,[x,3,x+p*3,12],'#1c1430',2.6,.8);
    const tail=new Path2D();tail.moveTo(-11,-1);tail.quadraticCurveTo(-19,-4,-17,-12);stroke(c,tail,INK,3.6);stroke(c,tail,'#2c2148',2.2);
    fillInk(c,P.smooth([-12,-4,-6,-8,6,-8,12,-4,11,4,-11,4]),'#2c2148',0,-2,12,1.5,{dark:-.3});
    for(const x of[-6,-2,2])line(c,[x,-7,x+1.5,-2],'#8a5adf',1.2);
    fillInk(c,P.smooth([8,-6,9,-13,14,-15,19,-12,19,-6,14,-3]),'#2c2148',14,-9,6,1.4,{dark:-.25});
    for(const s of[0,1])fillInk(c,P.poly([10+s*5,-13,11+s*5,-19,14+s*5,-14]),'#2c2148',12+s*5,-15,3,.9);
    for(const s of[0,1]){c.fillStyle='#ffe14d';c.beginPath();c.ellipse(13+s*4,-10,1.4,1,0,0,7);c.fill();glow(c,13+s*4,-10,3,'#ffe14d',.6);}
    return;}
  if(kind==='berserk'){ // Ember Brute: a cracked lava ogre that speeds up as it is hurt
    line(c,[-5,7,-6-step*2,15],'#5a1e10',4,.8);line(c,[5,7,6+step*2,15],'#5a1e10',4,.8);
    fillInk(c,P.smooth([-13,-8,13,-8,14,4,9,10,-9,10,-14,4]),'#c2481e',0,1,14,1.8,{dark:-.32});
    for(const p of[[-8,-4,-3,2,-6,6],[4,-6,8,0,5,5],[-1,-7,1,-1]])line(c,p,'#ffd04a',1.1);glow(c,0,0,10,'#ff7a2a',.45);
    line(c,[11,-2,17,-10],'#c2481e',4.6,1.2);line(c,[16,-8,21,-24],'#4a2e1a',3,.8);fillInk(c,P.smooth([18,-22,24,-30,28,-24,23,-18]),'#5a3e2a',23,-24,6,1.3);
    line(c,[-11,-2,-16,6],'#c2481e',4.6,1.2);
    fillInk(c,P.circle(0,-14,7.5),'#d4582a',0,-14,7.5,1.6,{dark:-.28});
    for(const s of[-1,1])fillInk(c,P.poly([s*4,-19,s*7,-26,s*6,-18]),'#3a2a2a',s*6,-22,3,.9);
    for(const s of[-1,1]){c.fillStyle='#fff3a0';c.beginPath();c.ellipse(s*2.8,-15,1.6,1.1,0,0,7);c.fill();glow(c,s*2.8,-15,4,'#ffb02a',.7);}
    c.fillStyle='#fff';c.fill(P.poly([-3,-10,-2.4,-8,-1.8,-10]));c.fill(P.poly([1.8,-10,2.4,-8,3,-10]));
    return;}
  if(kind==='burrower'){ // Tide Crab: armored reef crab that dives under the sand (immune while submerged)
    const lg=[[1,-1],[0,0],[-1,1],[0,0]][f];
    for(const s of[-1,1])for(let i=0;i<3;i++){const p=(i%2?lg[0]:lg[1])*s;line(c,[s*7,2+i*2,s*14,6+i*3+p,s*16,11+i*2+p],'#a8402a',1.8,.7);}
    fillInk(c,P.smooth([-13,4,-13,-5,-6,-11,6,-11,13,-5,13,4,0,8]),'#e0593a',0,-2,13,1.7,{dark:-.3});
    for(const [x,y] of[[-6,-6],[0,-8],[6,-6],[-3,-2],[3,-2]]){c.fillStyle='rgba(255,210,180,.55)';c.beginPath();c.arc(x,y,1.3,0,7);c.fill();}
    for(const s of[-1,1]){line(c,[s*10,-6,s*15,-13],'#e0593a',3,1);const cl=new Path2D();cl.moveTo(s*13,-12);cl.quadraticCurveTo(s*22,-22,s*16,-24);cl.lineTo(s*17,-18);cl.quadraticCurveTo(s*13,-19,s*13,-12);cl.closePath();fillInk(c,cl,'#f06a48',s*17,-18,6,1.3);}
    for(const s of[-1,1]){line(c,[s*3,-10,s*4,-16],'#a8402a',1.2);fillInk(c,P.circle(s*4,-17,2),'#fff6e0',s*4,-17,2,.8);c.fillStyle=INK;c.beginPath();c.arc(s*4.3,-17,.9,0,7);c.fill();}
    return;}
  // normal: horned imp
  const tail=new Path2D();tail.moveTo(-5,4);tail.quadraticCurveTo(-15,6,-13,-4);stroke(c,tail,INK,3.2);stroke(c,tail,'#c8323a',1.8);fillInk(c,P.poly([-13,-4,-16,-7,-11,-7]),'#c8323a',-13,-6,2,.8);
  line(c,[-3,5,-4-step*2.4,13],'#8e1922',2.8,.8);line(c,[3,5,4+step*2.4,13],'#8e1922',2.8,.8);
  fillInk(c,P.smooth([-7,-3,7,-3,8,6,-8,6]),'#e2453c',0,1,8,1.4);
  line(c,[6,-1,10,3-step],'#e2453c',2.4,.7);line(c,[10,3-step,14,-6],'#6b4a2e',2.4,.7);fillInk(c,P.circle(14.5,-7,3),'#8a5a32',14.5,-7,3,1);
  fillInk(c,P.circle(0,-8,7),'#e2453c',0,-8,7,1.5,{dark:-.22});
  for(const s of[-1,1]){const h=new Path2D();h.moveTo(s*3,-13);h.quadraticCurveTo(s*9,-17,s*8,-22);h.quadraticCurveTo(s*6,-17,s*1,-14);h.closePath();fillInk(c,h,'#f4e6c8',s*5,-17,3,1);}
  for(const s of[-1,1]){c.fillStyle='#ffe27a';c.beginPath();c.ellipse(s*2.6,-8.6,1.6,1.4,0,0,7);c.fill();c.fillStyle=INK;c.beginPath();c.arc(s*2.6,-8.4,.7,0,7);c.fill();}
  c.strokeStyle=INK;c.lineWidth=.9;c.beginPath();c.arc(0,-5,2.2,.2,Math.PI-.2);c.stroke();c.fillStyle='#fff';c.fill(P.poly([-1.4,-3.4,-1,-2.2,-.4,-3.1]));
}
const enemyCache=new Map(),ESPR=3,EW=64,EH=72,EOX=32,EOY=44;
function enemyFrame(kind,f){const key=kind+f;if(enemyCache.has(key))return enemyCache.get(key);
  const k=canvas(EW*ESPR,EH*ESPR),c=k.getContext('2d');c.scale(ESPR,ESPR);c.translate(EOX,EOY);
  const r=ENEMY_LOOK[kind].r;c.fillStyle='rgba(8,6,18,.4)';c.beginPath();c.ellipse(0,r*.8+3,r*1.15,r*.4,0,0,7);c.fill();
  c.save();if(kind==='boss')c.scale(1.15,1.15);enemyBody(c,kind,f);c.restore();enemyCache.set(key,k);return k;}
function drawEnemy(c,kind,x,y,time,dirX=1,opt={}){
  const f=Math.floor(time*8+(x+y)*0.05)%4;const k=enemyFrame(kind,(f+4)%4);
  c.save();c.translate(x,y);if(dirX<0)c.scale(-1,1);
  c.drawImage(k,-EOX,-EOY,EW,EH);c.restore();
  if(opt.frozen){c.save();c.globalAlpha=.55;c.fillStyle='#bfefff';c.beginPath();c.ellipse(x,y-4,ENEMY_LOOK[kind].r+3,ENEMY_LOOK[kind].r+6,0,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle='#e8fbff';c.lineWidth=1.5;c.stroke();c.restore();}
  else if(opt.slow){c.save();c.globalAlpha=.8;c.strokeStyle='#7fd8ff';c.lineWidth=1.6;c.beginPath();c.ellipse(x,y+ENEMY_LOOK[kind].r*.8+3,ENEMY_LOOK[kind].r+2,4,0,0,Math.PI*2);c.stroke();c.restore();}
}

/* ---------------- summoned allies ---------------- */
function drawSpecter(c,x,y,elite,time){
  c.save();c.translate(x,y+Math.sin(time*4+x)*1.2);const r=elite?13:9;
  glow(c,0,-2,r*2.2,elite?'#ff3656':'#a855f7',.35);
  const p=new Path2D();if(elite){p.moveTo(-r-4,-r+2);p.lineTo(-r-8,-r-9);p.lineTo(-6,-r+1);p.lineTo(0,-r-6);p.lineTo(6,-r+1);p.lineTo(r+8,-r-9);p.lineTo(r+4,-r+2);p.lineTo(r,r);p.lineTo(-r,r);p.closePath();}
  else{p.moveTo(-r,-2);p.quadraticCurveTo(-r,-r-8,0,-r-8);p.quadraticCurveTo(r,-r-8,r,-2);p.lineTo(r+2,r);p.lineTo(r*.4,r-4);p.lineTo(0,r+2);p.lineTo(-r*.4,r-4);p.lineTo(-r-2,r);p.closePath();}
  fillInk(c,p,elite?'#3a1020':'#2a1a3a',0,0,r,1.5);
  for(const s of[-1,1]){glow(c,s*3.4,-3,4,elite?'#ff3656':'#e178ff',1);c.fillStyle=elite?'#ffb0be':'#f4c8ff';c.beginPath();c.ellipse(s*3.4,-3,1.4,1,0,0,7);c.fill();}
  c.restore();
}
function drawWolf(c,x,y,time,dirX=1){c.save();c.translate(x,y);if(dirX<0)c.scale(-1,1);const st=Math.sin(time*14)*2;
  glow(c,0,0,18,'#ff3333',.3);line(c,[-6,4,-8+st,10],'#2a1418',2.4,.7);line(c,[6,4,8-st,10],'#2a1418',2.4,.7);
  fillInk(c,P.smooth([-12,2,-10,-4,6,-5,10,0,8,5,-8,5]),'#4a2a30',0,0,10,1.4);fillInk(c,P.smooth([6,-6,10,-11,15,-8,17,-4,12,-2,7,-2]),'#4a2a30',11,-6,6,1.3);
  fillInk(c,P.poly([8,-9,9,-14,11,-10]),'#4a2a30',9,-11,2,1);fillInk(c,P.poly([-12,0,-18,-5,-15,2]),'#4a2a30',-15,-1,3,1);
  c.fillStyle='#ff4141';c.beginPath();c.arc(13,-7,1.1,0,7);c.fill();c.restore();}

/* ---------------- effects ---------------- */
// type → projectile visual: arrow (Ranged), bolt (Magic), slash (Physical), beam (True), plus extras
function drawProjectile(c,kind,x1,y1,x2,y2,t,col){ // t: 0..1 progress
  const x=x1+(x2-x1)*t,y=y1+(y2-y1)*t-Math.sin(t*Math.PI)*(kind==='arrow'?18:kind==='bomb'?30:0),a=Math.atan2(y2-y1-(kind==='arrow'?Math.cos(t*Math.PI)*-30:0),x2-x1);
  c.save();
  if(kind==='arrow'){c.translate(x,y);c.rotate(a);line(c,[-9,0,5,0],'#8a5a32',1.4,.5);fillInk(c,P.poly([5,-2.2,9,0,5,2.2]),'#dfe6ee',7,0,2,.7);fillInk(c,P.poly([-9,0,-12,-3,-10,0,-12,3]),'#e2453c',-10,0,2,.6);}
  else if(kind==='bolt'||kind==='fire'||kind==='frost'||kind==='poison'||kind==='void'){const col2=col||{bolt:'#8fb8ff',fire:'#ff8a2a',frost:'#bfefff',poison:'#7cff6b',void:'#b06bff'}[kind];
    for(let i=5;i>0;i--){const tt=Math.max(0,t-i*.04);glow(c,x1+(x2-x1)*tt,y1+(y2-y1)*tt,3+i,col2,.12);}
    glow(c,x,y,11,col2,.8);c.fillStyle='#ffffff';c.beginPath();c.arc(x,y,2.6,0,7);c.fill();
    if(kind==='frost'){c.translate(x,y);c.rotate(t*8);c.fillStyle='#e8f8ff';c.fill(P.poly([0,-5,1.4,0,0,5,-1.4,0]));}}
  else if(kind==='bullet'){if(t<.35)glow(c,x1,y1,9,'#ffd27a',.9*(1-t/.35));c.strokeStyle='rgba(255,230,150,.9)';c.lineWidth=2;c.beginPath();const tt=Math.max(0,t-.15);c.moveTo(x1+(x2-x1)*tt,y1+(y2-y1)*tt);c.lineTo(x,y);c.stroke();glow(c,x,y,4,'#fff3a0',1);}
  else if(kind==='beam'){c.globalAlpha=1-t;c.strokeStyle=col||'#fff7c2';c.lineWidth=6*(1-t)+1;c.shadowColor=col||'#fff7c2';c.shadowBlur=14;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.strokeStyle='#fff';c.lineWidth=1.5;c.stroke();}
  else if(kind==='bomb'){c.translate(x,y);fillInk(c,P.circle(0,0,3.4),'#2b2b35',0,0,3,1);glow(c,2,-3,3,'#ffcf5a',1);}
  c.restore();
}
function drawImpact(c,kind,x,y,t,col){ // t: 0..1 life progress
  c.save();const a=1-t;c.globalAlpha=a;
  if(kind==='slash'){c.translate(x,y);c.rotate(-.6);c.strokeStyle='#ffffff';c.lineWidth=3*a+1;c.shadowColor=col||'#ffd28a';c.shadowBlur=10;c.beginPath();c.arc(0,0,10+t*6,-1.2,1.2);c.stroke();}
  else if(kind==='explode'||kind==='fire'){for(let i=0;i<7;i++){const an=i*0.9,r=6+t*18;glow(c,x+Math.cos(an)*r*.5,y+Math.sin(an)*r*.4,8*(1-t)+3,i%2?'#ff7a1a':'#ffd166',.8);}
    c.fillStyle=`rgba(80,70,70,${.35*a})`;c.beginPath();c.arc(x,y-t*10,6+t*12,0,7);c.fill();}
  else if(kind==='frost'){c.strokeStyle='#dff7ff';c.lineWidth=2;for(let i=0;i<6;i++){const an=i*Math.PI/3,r=4+t*14;c.beginPath();c.moveTo(x+Math.cos(an)*r*.3,y+Math.sin(an)*r*.3);c.lineTo(x+Math.cos(an)*r,y+Math.sin(an)*r);c.stroke();}}
  else if(kind==='coin'){c.font='bold 11px system-ui,sans-serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle=INK;c.strokeText(col||'+10',x,y-t*22);c.fillStyle='#ffd84a';c.fillText(col||'+10',x,y-t*22);fillInk(c,P.circle(x-14,y-t*22-4,3.4),'#f2c84b',x-14,y-t*22-4,3,1);}
  else if(kind==='death'){for(let i=0;i<6;i++){const an=i*1.05;c.fillStyle=`rgba(220,215,235,${.6*a})`;c.beginPath();c.arc(x+Math.cos(an)*t*14,y+Math.sin(an)*t*10-t*6,4+t*4,0,7);c.fill();}}
  else{for(let i=0;i<8;i++){const an=i*Math.PI/4,r=3+t*12;c.strokeStyle=col||'#fff3a0';c.lineWidth=1.8;c.beginPath();c.moveTo(x+Math.cos(an)*r*.4,y+Math.sin(an)*r*.4);c.lineTo(x+Math.cos(an)*r,y+Math.sin(an)*r);c.stroke();}}
  c.restore();
}

/* ---------------- Art Update B: parts and looks for the remaining 44 units ---------------- */
function reptileFace(c,L){
  fillInk(c,P.smooth([-3,-9,-2,-6,4,-5,9,-7,8,-10,2,-11]),L.skin,3,-8,6,1.1,{dark:-.15});
  c.fillStyle=INK;c.beginPath();c.arc(6.8,-8.6,.55,0,7);c.arc(8.2,-8.2,.55,0,7);c.fill();
  for(let i=0;i<4;i++)fillInk(c,P.poly([-6+i*3.6,-18.6+Math.abs(i-1.5)*.6,-4.6+i*3.6,-24+Math.abs(i-1.5)*1.2,-3+i*3.6,-18.8]),L.frill||shade(L.skin,-.25),-4.6+i*3.6,-21,2,.9);
  c.fillStyle=rgba(shade(L.skin,-.3),.6);[[-4,-15],[-1,-17],[2,-15.4]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,.9,0,7);c.fill();});
}
function stoneSkin(c){c.strokeStyle=rgba('#3a3a44',.7);c.lineWidth=.8;c.beginPath();c.moveTo(-6,-16);c.lineTo(-3,-13);c.lineTo(-5,-9);c.moveTo(5,-17);c.lineTo(3,-14);c.stroke();}
const sparkle=(c,x,y,r,col)=>{c.fillStyle=col;c.fill(P.poly([x,y-r,x+r*.3,y-r*.3,x+r,y,x+r*.3,y+r*.3,x,y+r,x-r*.3,y+r*.3,x-r,y,x-r*.3,y-r*.3]));};

Object.assign(HATS,{
  bowl:(c,h)=>{fillInk(c,P.smooth([-9,-12,-9,-20,0,-23,9,-20,9,-12]),h.col||'#a9b2bf',0,-17,9,1.4);fillInk(c,P.rrect(-10.5,-13.4,21,2.4,1),shade(h.col||'#a9b2bf',-.12),0,-12,10,1.1);},
  jester:(c,h)=>{for(const s of[-1,1]){const p=new Path2D();p.moveTo(s*1,-17);p.quadraticCurveTo(s*10,-30,s*15,-24);p.quadraticCurveTo(s*9,-22,s*8,-16);p.closePath();fillInk(c,p,s<0?h.col:h.col2,s*8,-22,7,1.3);glow(c,s*15,-24,4,'#fff3a0',.7);fillInk(c,P.circle(s*15,-24,1.8),'#f2c84b',s*15,-24,2,.8);}
    fillInk(c,P.rrect(-9,-18.5,18,3.4,1.5),h.col2,0,-17,9,1.1);const m=new Path2D();m.arc(0,-25,3.6,Math.PI*.3,Math.PI*1.7);m.arc(1.4,-25,2.8,Math.PI*1.6,Math.PI*.4,true);m.closePath();fillInk(c,m,'#fff1a8',0,-25,3,.8);},
  antlers:(c,h)=>{for(const s of[-1,1]){line(c,[s*4,-19,s*9,-28,s*13,-31],'#8a6a48',1.8,.6);line(c,[s*7.5,-25,s*12,-24],'#8a6a48',1.4,.5);line(c,[s*10,-29.5,s*9,-34],'#8a6a48',1.4,.5);}
    fillInk(c,P.smooth([-9,-14,-8,-19,0,-21,8,-19,9,-14,0,-16]),h.col||'#4f9a3d',0,-17,9,1.2);for(let i=0;i<5;i++){c.fillStyle=i%2?'#7cc95a':'#3f8a33';c.beginPath();c.ellipse(-7+i*3.5,-17.5-(i%2),2.4,1.5,i,0,7);c.fill();}},
  tophat:(c,h)=>{fillInk(c,P.ellipse(0,-17.5,11,2.6),h.col||'#2b2b35',0,-17,11,1.3);fillInk(c,P.rrect(-6.5,-31,13,14,1.5),h.col||'#2b2b35',0,-24,8,1.3);line(c,[-6.3,-20,6.3,-20],h.band||'#b8864a',2);
    if(h.gears){fillInk(c,P.circle(5.5,-26,3.6),'#c9a227',5.5,-26,3.6,1);c.fillStyle=INK;c.beginPath();c.arc(5.5,-26,1.2,0,7);c.fill();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillStyle='#c9a227';c.fillRect(5.5+Math.cos(a)*4-0.8,-26+Math.sin(a)*4-0.8,1.6,1.6);}
      for(const s of[-1,1]){fillInk(c,P.circle(s*3.4,-17.6,2.4),'#c9a227',s*3.4,-17.6,2.4,.9);c.fillStyle='#8ff0d8';c.beginPath();c.arc(s*3.4,-17.6,1.4,0,7);c.fill();}}},
  cavalier:(c,h)=>{fillInk(c,P.smooth([-14,-15,-9,-19,-4,-24,5,-24,10,-19,14,-15,0,-17]),h.col,0,-19,13,1.4);line(c,[-11,-16.4,11,-16.4],h.band||'#e9c46a',1.4);fillInk(c,P.smooth([-4,-22,-12,-29,-17,-28,-11,-25,-6,-20]),h.feather||'#ffffff',-10,-25,6,1);},
  leafhood:(c,h)=>{HATS.hood(c,h);for(let i=0;i<4;i++){c.fillStyle=i%2?'#5aa846':'#3f8a33';c.beginPath();c.ellipse(-7+i*4.6,-21+Math.abs(i-1.5)*1.4,2.6,1.4,.6*i,0,7);c.fill();c.strokeStyle=INK;c.lineWidth=.5;c.stroke();}},
  starhood:(c,h)=>{HATS.hood(c,h);for(const [x,y,r] of[[-5,-19,2.2],[3,-21,1.6],[7,-15,1.4]])sparkle(c,x,y,r,'#fff3a0');},
  witch:(c,h)=>{const p=new Path2D();p.moveTo(-8,-17);p.lineTo(-1,-38);p.quadraticCurveTo(2,-40,5,-37);p.lineTo(8,-17);p.closePath();fillInk(c,p,h.col,0,-27,10,1.4);fillInk(c,P.ellipse(0,-17.5,14,3),shade(h.col,-.1),0,-17,14,1.4);fillInk(c,P.rrect(-7.5,-21.6,15,3,1),h.band||'#7a2a9a',0,-20,7,1);fillInk(c,P.rrect(-2.2,-22,4.4,3.8,.8),'#f2c84b',0,-20,2,.8);},
  turban:(c,h)=>{fillInk(c,P.smooth([-9.5,-12,-9.5,-20,-3,-24,4,-24,9.5,-20,9.5,-12,0,-15]),h.col,0,-18,10,1.4);c.strokeStyle=rgba(shade(h.col,-.3),.8);c.lineWidth=1;c.beginPath();c.moveTo(-8,-18);c.quadraticCurveTo(0,-14,8,-20);c.moveTo(-8,-21);c.quadraticCurveTo(0,-17,7,-23);c.stroke();fillInk(c,P.circle(0,-18,2),h.gem||'#7ef0ff',0,-18,2,.8);},
  laurel:(c,h)=>{for(const s of[-1,1])for(let i=0;i<4;i++){c.fillStyle=h.col||'#f2c84b';c.beginPath();c.ellipse(s*(3+i*1.8),-18.5+i*1.3,2.2,1.1,s*(.5+i*.3),0,7);c.fill();c.strokeStyle=INK;c.lineWidth=.5;c.stroke();}},
});
Object.assign(WEAPONS,{
  lance:(c,w)=>{line(c,[9,10,16,-30],w.shaft||'#c9cdd6',2.4,.8);fillInk(c,P.poly([15.6,-30,18.4,-29,17.4,-37]),'#e9eef5',17,-32,3,1);fillInk(c,P.poly([15.2,-26,9,-24,15.4,-21.6]),w.pennant||'#e2453c',13,-24,4,.9);fillInk(c,P.poly([8,4,13,4,12,-2,9,-2]),'#a9b2bf',10,1,3,1);},
  slingshot:(c,w)=>{line(c,[10,6,10,-3],'#8a5a32',2,.6);line(c,[10,-3,7,-9],'#8a5a32',1.8,.6);line(c,[10,-3,13,-9],'#8a5a32',1.8,.6);line(c,[7,-9,5,-4,13,-9],'#d9b38c',.8);fillInk(c,P.circle(5,-4,1.6),'#9aa3b0',5,-4,1.6,.7);},
  sickle:(c,w)=>{line(c,[10,6,12,-4],'#8a5a32',2,.6);const p=new Path2D();p.moveTo(12,-4);p.quadraticCurveTo(22,-8,18,-18);p.quadraticCurveTo(18,-10,11.6,-6.4);p.closePath();fillInk(c,p,'#cfd6de',16,-10,5,1);for(const [x,y] of[[-14,-6],[-17,-10],[-12,-11]]){c.fillStyle='#5aa846';c.beginPath();c.ellipse(x,y,2.2,1.2,.8,0,7);c.fill();}},
  crossbow:(c,w)=>{fillInk(c,P.rrect(4,-2,18,3,1),'#6b4a2e',13,0,9,1.1);const b=new Path2D();b.moveTo(18,-9);b.quadraticCurveTo(14,0,18,9);stroke(c,b,INK,3);stroke(c,b,'#9aa3b0',1.8);line(c,[18,-9,10,0,18,9],'#e8e0d0',.6);line(c,[10,-.5,25,-.5],'#c9a27a',1);fillInk(c,P.poly([24,-2,27,-.5,24,1]),'#dfe6ee',25,-.5,2,.6);},
  wrench:(c,w)=>{line(c,[10,6,16,-10],'#9aa3b0',2.6,.7);const p=new Path2D();p.arc(16.6,-12,3.4,Math.PI*.9,Math.PI*2.4);fillInk(c,p,'#9aa3b0',16,-12,3,1);},
  rapier:(c,w)=>{line(c,[10.6,1,20,-24],'#e9eef5',1.4,.6);const g=new Path2D();g.arc(10.4,1.6,3,Math.PI*1.1,Math.PI*2.1);stroke(c,g,INK,2.6);stroke(c,g,'#e9c46a',1.4);line(c,[10.4,1.8,9.6,5.6],'#6b4a2e',1.6,.5);},
  gauntlets:(c,w)=>{for(const x of[-10.5,10.5]){fillInk(c,P.rrect(x-4,0,8,7,2.4),w.col||'#8a8f9a',x,3.5,4,1.3);c.strokeStyle=rgba(INK,.6);c.lineWidth=.7;c.beginPath();c.moveTo(x-2,1);c.lineTo(x-2,6);c.moveTo(x+1,1);c.lineTo(x+1,6);c.stroke();}},
  axes:(c,w)=>{for(const s of[1,-1]){c.save();c.scale(s,1);line(c,[10,6,13,-12],'#6b4a2e',1.8,.6);const p=P.smooth([12,-14,19,-17,21,-10,18,-7,13,-8]);fillInk(c,p,'#cfd6de',17,-12,4,1);c.restore();}},
  cards:(c,w)=>{for(let i=0;i<3;i++){c.save();c.translate(13+i*1.2,-6-i*.6);c.rotate(-.4+i*.35);fillInk(c,P.rrect(-2.2,-3.2,4.4,6.4,.7),'#f8f4ea',0,0,3,.8);c.fillStyle=i===1?'#e2453c':'#2b1d3a';c.beginPath();c.arc(0,0,1,0,7);c.fill();c.restore();}},
  quill:(c,w)=>{line(c,[10,4,15,-8],'#f4ead2',1.2,.5);fillInk(c,P.smooth([14,-6,13,-14,17,-19,17.6,-12,15.4,-7]),'#f4ead2',15,-12,3,.9);glow(c,10,4,4,'#c9a8ff',.8);},
  hourglass:(c,w)=>{line(c,[11,13,12.5,-17],w.shaft||'#c9a227',2,.7);fillInk(c,P.rrect(8.5,-29,8,2,.6),'#c9a227',12.5,-28,4,.8);fillInk(c,P.rrect(8.5,-18,8,2,.6),'#c9a227',12.5,-17,4,.8);fillInk(c,P.poly([9.5,-27,15.5,-27,12.5,-22.5,15.5,-18,9.5,-18,12.5,-22.5]),'#bfefff',12.5,-22.5,3,.8);c.fillStyle='#f2c84b';c.fill(P.poly([10.8,-19,14.2,-19,12.5,-21.2]));glow(c,12.5,-22.5,8,w.glow||'#ffe27a',.5);},
  blowgun:(c,w)=>{line(c,[-2,-6,22,-10],'#6b8a3a',2.2,.7);c.fillStyle='#7cff6b';glow(c,23,-10,4,'#7cff6b',.8);},
  bigbow:(c,w)=>{const p=new Path2D();p.moveTo(12,-20);p.quadraticCurveTo(24,-1,12,18);stroke(c,p,INK,3.8);stroke(c,p,w.col||'#f2c84b',2.4);line(c,[12,-20,10.5,18],'#fff7c2',.7);line(c,[3,-1,20,-1],'#fff7c2',1.1);sparkle(c,21,-1,3,w.glow||'#fff3a0');glow(c,21,-1,7,w.glow||'#fff3a0',.7);},
  orbstaff:(c,w)=>{WEAPONS.staff(c,w);for(let i=0;i<3;i++){const a=i*2.1;sparkle(c,12.6+Math.cos(a)*7,-25+Math.sin(a)*7,1.6,w.spark||'#fff3a0');}},
  lightningstaff:(c,w)=>{WEAPONS.staff(c,{orb:'#fde047',shaft:w.shaft||'#5a4a7a'});line(c,[12.6,-25,18,-30,15,-31,21,-36],'#fff7a0',1.2);line(c,[12.6,-25,7,-31,9.6,-32,5,-37],'#fff7a0',1.2);},
  firewand:(c,w)=>{line(c,[10,4,14,-9],'#6b2a1a',1.8,.6);glow(c,14.6,-12,10,'#ff8a2a',.9);c.fillStyle='#ff6a1a';c.fill(P.smooth([12,-9,11.4,-13,14.6,-18,17.6,-13,17,-9]));c.fillStyle='#ffe27a';c.fill(P.smooth([13.4,-10,13.4,-12.6,14.6,-15,15.8,-12.6,15.6,-10]));},
  warhammer:(c,w)=>{line(c,[8,12,14,-16],'#6b4a2e',2.8,.8);fillInk(c,P.rrect(7,-25,16,10,2),w.col||'#9aa3b0',15,-20,8,1.4);if(w.glow){glow(c,15,-20,12,w.glow,.5);sparkle(c,15,-20,3,'#fff7c2');}},
  spearglow:(c,w)=>{WEAPONS.spear(c,{shaft:w.shaft,col:w.col});glow(c,16,-30,8,w.glow||'#fff3a0',.7);},
});
Object.assign(OFFHAND,{
  towershield:(c,o)=>{fillInk(c,P.rrect(-19,-9,12,22,3),o.col,-13,2,8,1.6);fillInk(c,P.circle(-13,2,2.8),o.trim||'#e9c46a',-13,2,2.8,1);for(const [x,y] of[[-17,-7],[-9,-7],[-17,11],[-9,11]]){c.fillStyle='#d9dee8';c.beginPath();c.arc(x,y,.9,0,7);c.fill();}},
  sunshield:(c,o)=>{OFFHAND.shield(c,{col:o.col||'#f2c84b',emblem:(c,x,y)=>{glow(c,x,y,5,'#fff3a0',.7);fillInk(c,P.circle(x,y,2.4),'#fff7c2',x,y,2.4,.8);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(c,[x+Math.cos(a)*3.4,y+Math.sin(a)*3.4,x+Math.cos(a)*5,y+Math.sin(a)*5],'#fff7c2',.9);}}});},
  clockshield:(c,o)=>{fillInk(c,P.circle(-11,2,7.4),o.col||'#2a5a6a',-11,2,7,1.5);fillInk(c,P.circle(-11,2,5),'#e8fbff',-11,2,5,1);line(c,[-11,2,-11,-1.6],INK,.9);line(c,[-11,2,-8.4,3],INK,.9);glow(c,-11,2,10,'#7defff',.35);},
  crystalball:(c,o)=>{fillInk(c,P.rrect(-14,6,7,2.4,1),'#c9a227',-10.5,7,4,.9);glow(c,-10.5,1,9,o.glow||'#a8b4ff',.7);fillInk(c,P.circle(-10.5,1,4.6),o.col||'#c9d1ff',-10.5,1,4.6,1.1,{dark:-.15});sparkle(c,-11.6,0,1.6,'#ffffff');},
  shieldbuckler:(c,o)=>{fillInk(c,P.circle(-10.5,3,5.4),o.col||'#8a5a32',-10.5,3,5,1.3);fillInk(c,P.circle(-10.5,3,1.8),'#c9cdd6',-10.5,3,2,.8);},
  satchel:(c,o)=>{fillInk(c,P.rrect(-15,2,8,7,2),o.col||'#8a6a3a',-11,5.5,4,1.1);line(c,[-13,-4,-9,4],'#5a3a22',1);for(const [x,y] of[[-13,1],[-10,0.4]]){c.fillStyle='#5aa846';c.beginPath();c.ellipse(x,y,1.8,1,.5,0,7);c.fill();}},
  scroll2:(c,o)=>{OFFHAND.scroll(c,o);glow(c,-12,3,8,'#c9a8ff',.4);},
  lantern2:(c,o)=>{OFFHAND.lantern(c,o);glow(c,-11,5,12,o.glow||'#7ef0ff',.5);},
});

const U2={pale:'#e9e4f2',stone:'#9aa3b0',lizard:'#6fcf6a',lizard2:'#9bd35a'};
Object.assign(LOOKS,{
  // Secret
  rift_blade:{skin:'#d9d6e6',hair:'#1a1626',hairStyle:'swept',outfit:'#1d1a2b',trim:'#e45cff',sleeve:'#262238',pants:'#15121f',boots:'#0d0b14',mood:'fierce',mask:'#2a1f3a',eyeGlow:'#f07aff',
    weapon:{type:'greatsword',col:'#f2d8ff',flame:'#d855fa'},back:{cape:'#2a1f3a'},aura:'#d855fa',extra:c=>{c.strokeStyle='rgba(240,122,255,.8)';c.lineWidth=1.6;c.beginPath();c.arc(14,-12,16,-1.9,-.6);c.stroke();}},
  chrono_warden:{skin:SKIN.light,outfit:'#203c59',metal:'#5fb6cc',body:'heavy',trim:'#7defff',sleeve:'#26506e',pants:'#1a2f45',boots:'#122236',face:'visor',eyeGlow:'#7defff',
    hat:{type:'helm',col:'#2a5a7a',crest:c=>{glow(c,0,-24,6,'#7defff',.8);fillInk(c,P.circle(0,-24,2.4),'#bff7ff',0,-24,2,.8);}},weapon:{type:'hourglass',shaft:'#5fb6cc',glow:'#7defff'},off:{type:'clockshield',col:'#2a5a7a'},aura:'#75e5ff'},
  // Epic / Legendary / Mythic humanoids
  blade:{skin:SKIN.light,hair:'#22313f',hairStyle:'bun',outfit:'#1f8a9e',trim:'#a5f3fc',sleeve:'#26a3b8',pants:'#155e6e',boots:'#0f3a44',mood:'fierce',
    weapon:{type:'daggers',col:'#bff4fc'},back:{cape:'#22d3ee'},extra:c=>{c.strokeStyle='rgba(165,243,252,.75)';c.lineWidth=1.2;c.beginPath();c.arc(0,-2,18,2.6,3.6);c.stroke();c.beginPath();c.arc(0,-2,18,-.4,.5);c.stroke();}},
  warden:{skin:SKIN.light,hair:'#f6e7b0',hairStyle:'long',outfit:'#f4ecd2',metal:'#f2d98a',body:'armor',trim:'#f2c84b',sleeve:'#efe2b8',pants:'#d9c99a',boots:'#8a6a32',mood:'calm',
    hat:{type:'halo',col:'#ffe27a'},weapon:{type:'orbstaff',orb:'#fff7c2',shaft:'#c9a227',spark:'#fff7c2'},back:{cape:'#f2d98a'},aura:'#fde68a'},
  storm:{skin:SKIN.light,hair:'#c9c4e6',beard:'full',beardCol:'#c9c4e6',outfit:'#4a3f8a',trim:'#fde047',body:'robe',sleeve:'#5a4f9a',boots:'#2a2450',mood:'fierce',
    hat:{type:'wizard',col:'#3a3078',band:'#fde047',sym:c=>{c.strokeStyle='#fde047';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-30);c.lineTo(3,-26);c.lineTo(0,-25);c.lineTo(3,-21);c.stroke();}},weapon:{type:'lightningstaff'}},
  assassin:{skin:SKIN.tan,hair:'#111',outfit:'#1f2a1f',trim:'#a3e635',sleeve:'#26332a',pants:'#181f18',boots:'#0d120d',mood:'fierce',mask:'#141a14',
    hat:{type:'hood',col:'#1a221a'},weapon:{type:'daggers',col:'#d9f99d'},back:{cape:'#141a14'}},
  ballista:{skin:SKIN.tan,hair:'#6b3a1a',beard:'goatee',outfit:'#9a5a2a',trim:'#e9c46a',sleeve:'#b06a32',pants:'#5a4030',boots:'#3a2a1a',mood:'happy',
    hat:{type:'goggles',lens:'#ffd27a'},weapon:{type:'crossbow'},back:{pack:'#6b4a2e'}},
  witch:{skin:'#c9f0e6',hair:'#2a1a3a',hairStyle:'long',outfit:'#3a2a5a',trim:'#67e8f9',body:'robe',sleeve:'#4a3a6a',boots:'#1d1426',mood:'fierce',iris:'#67e8f9',
    hat:{type:'witch',col:'#2a1f45',band:'#67e8f9'},weapon:{type:'staff',orb:'#67e8f9',shaft:'#3a2a20'},extra:c=>{for(const [x,y] of[[-16,-20],[18,-6]])sparkle(c,x,y,2,'#a5f3fc');}},
  berserker:{skin:SKIN.tan,hair:'#c8323a',beard:'full',beardCol:'#c8323a',outfit:'#7a3a2a',metal:'#9aa3b0',body:'armor',trim:'#e9c46a',sleeve:SKIN.tan,pants:'#4a2a1e',boots:'#2a1a12',mood:'fierce',
    hat:{type:'helm',col:'#9aa3b0',horns:'#f4e6c8'},weapon:{type:'axes'},back:{cape:'#8a2a2a'}},
  oracle:{skin:SKIN.brown,hair:'#e8e2d6',outfit:'#2a5a4a',trim:'#86efac',body:'robe',sleeve:'#346a58',boots:'#1d3a30',mood:'calm',iris:'#86efac',
    hat:{type:'starhood',col:'#24493d'},off:{type:'crystalball',col:'#c9ffe0',glow:'#86efac'},weapon:{type:'wand',orb:'#b7ffd0'}},
  ranger:{skin:SKIN.light,hair:'#a86a2a',outfit:'#5a6a2a',trim:'#fbbf24',sleeve:'#6a7a32',pants:'#4a3a22',boots:'#2a2014',mood:'fierce',ears:'pointy',
    hat:{type:'leafhood',col:'#3f6a2a'},weapon:{type:'bow',col:'#4f7a2a'},back:{quiver:true},extra:c=>{line(c,[12,-14,16,-18],'#4caf50',1);line(c,[12,12,16,15],'#4caf50',1);}},
  pyro:{skin:SKIN.light,hair:'#e2453c',hairStyle:'spiky',outfit:'#9a2a1a',trim:'#ffb347',body:'robe',sleeve:'#b0321f',boots:'#3a1a12',mood:'fierce',iris:'#ff8a2a',
    weapon:{type:'firewand'},off:{type:'flask',col:'#ff8a2a'},extra:c=>{glow(c,-16,-14,6,'#ff8a2a',.7);c.fillStyle='#ff9a3a';c.beginPath();c.arc(-16,-14,2,0,7);c.fill();}},
  tinker:{skin:SKIN.light,hair:'#8a5a32',mustache:true,beardCol:'#8a5a32',outfit:'#6a4a2a',trim:'#c9a227',sleeve:'#7a5a3a',pants:'#3a3048',boots:'#2a2014',mood:'happy',
    hat:{type:'tophat',col:'#3a2a20',band:'#c9a227',gears:true},weapon:{type:'pistol',col:'#8a6a3a',metal:'#c9a227'},off:{type:'satchel',col:'#5a4030'}},
  titan:{skin:SKIN.tan,outfit:'#5a6a3a',metal:'#8a9a6a',body:'heavy',trim:'#a3e635',sleeve:'#6a7a4a',pants:'#3a4428',boots:'#262c1a',face:'visor',eyeGlow:'#d9f99d',
    hat:{type:'helm',col:'#6a7a4a',horns:'#c9cdd6'},weapon:{type:'warhammer',col:'#8a8f9a'},extra:c=>{for(const x of[-9,9]){c.strokeStyle='rgba(60,40,20,.6)';c.lineWidth=1;c.beginPath();c.moveTo(x-3,15);c.lineTo(x,13);c.lineTo(x+3,15);c.stroke();}}},
  celestial:{skin:SKIN.light,hair:'#f6e7b0',hairStyle:'long',outfit:'#e9a23a',metal:'#f2d98a',body:'armor',trim:'#fff7c2',sleeve:'#f0b04a',pants:'#8a5a2a',boots:'#5a3a1a',mood:'calm',ears:'pointy',
    hat:{type:'circlet',col:'#f2c84b',gem:'#fff7c2'},weapon:{type:'bigbow',col:'#f2c84b',glow:'#fff3a0'},back:{cape:'#fb923c'},aura:'#ffd27a'},
  void:{skin:'#1a1426',outfit:'#0f1a24',trim:'#67e8f9',body:'robe',sleeve:'#14222e',boots:'#0a0f14',eyeGlow:'#67e8f9',mask:'#0a1218',
    hat:{type:'hood',col:'#0d1820'},weapon:{type:'scythe',col:'#a5f3fc'},aura:'#22d3ee'},
  paladin:{skin:SKIN.brown,hair:'#2a1a12',beard:'goatee',outfit:'#e8e2d6',metal:'#f2d98a',body:'heavy',tabard:'#3f9a5a',emblem:(c,x,y)=>sparkle(c,x,y,3,'#fff3a0'),sleeve:'#d8cdb8',pants:'#8a7a5a',boots:'#5a4a2a',mood:'calm',
    hat:{type:'helm',col:'#f2d98a',plume:'#86efac'},weapon:{type:'warhammer',col:'#f2d98a',glow:'#fff3a0'},off:{type:'sunshield'}},
  chronos:{skin:SKIN.light,hair:'#c9c4b0',beard:'full',beardCol:'#e8e2d6',outfit:'#8a6a1a',trim:'#fbbf24',body:'robe',sleeve:'#9a7a2a',boots:'#4a3a12',mood:'calm',
    hat:{type:'wizard',col:'#6a5014',band:'#fbbf24',sym:c=>{fillInk(c,P.circle(1,-26,3),'#fff7c2',1,-26,3,.8);line(c,[1,-26,1,-28],INK,.7);line(c,[1,-26,2.6,-26],INK,.7);}},weapon:{type:'hourglass'}},
  seraph:{skin:SKIN.light,hair:'#f6f2e6',hairStyle:'long',outfit:'#cfe6ff',metal:'#e8f4ff',body:'armor',trim:'#93c5fd',sleeve:'#bfdcff',pants:'#8aaedc',boots:'#4a6a9a',mood:'calm',
    hat:{type:'halo',col:'#cfe9ff'},weapon:{type:'spearglow',shaft:'#e8f4ff',col:'#ffffff',glow:'#cfe9ff'},back:{wings:'#f4f9ff'},aura:'#bfe0ff'},
  cosmos:{skin:SKIN.pale,hair:'#f0abfc',hairStyle:'long',outfit:'#2a1a5a',trim:'#f0abfc',body:'gown',sleeve:'#3a2a6a',boots:'#1a1238',mood:'calm',iris:'#f0abfc',
    hat:{type:'crown',col:'#f0c8ff',gem:'#ffffff'},weapon:{type:'orbstaff',orb:'#ffd6fb',shaft:'#c9a8ff',spark:'#ffffff'},back:{cape:'#1d1446'},aura:'#e879f9',extra:c=>{for(const [x,y,r] of[[-6,4,1.4],[4,8,1.2],[-2,11,1],[6,0,1]])sparkle(c,x,y,r,'#fff7c2');}},
  abyss:{skin:'#2a2033',outfit:'#1a1426',trim:'#fdba74',body:'heavy',metal:'#3a2f4a',sleeve:'#241c33',pants:'#141020',boots:'#0d0a14',eyeGlow:'#fdba74',mask:'#120d1a',
    hat:{type:'crown',col:'#3a2f4a',gem:'#fdba74'},weapon:{type:'staff',orb:'#1a0d24',shaft:'#3a2f4a',crystal:'#fdba74'},back:{cape:'#2a1033'},aura:'#fb923c'},
  starlord:{skin:SKIN.pale,hair:'#dfe3ee',hairStyle:'long',outfit:'#2a3a7a',trim:'#fb923c',sleeve:'#3a4a8a',pants:'#1d2a5a',boots:'#121a3a',mood:'fierce',ears:'pointy',iris:'#fb923c',
    hat:{type:'circlet',col:'#e9eef5',gem:'#fb923c'},weapon:{type:'bigbow',col:'#c9d1ff',glow:'#ffd27a'},back:{cape:'#1d2a5a',quiver:true},aura:'#fb923c'},
  eternity:{skin:SKIN.light,hair:'#e8f8ff',hairStyle:'long',outfit:'#155e75',trim:'#67e8f9',body:'gown',sleeve:'#1a6e88',boots:'#0d3a48',mood:'calm',iris:'#67e8f9',
    hat:{type:'halo',col:'#a5f3fc'},weapon:{type:'staff',orb:'#cffafe',shaft:'#67e8f9',crystal:'#67e8f9'},off:{type:'lantern2',glow:'#67e8f9'},aura:'#22d3ee',
    extra:c=>{c.strokeStyle='#a5f3fc';c.lineWidth=1.4;c.beginPath();c.ellipse(-4,-27,3,2,0,0,7);c.ellipse(2,-27,3,2,0,0,7);c.stroke();}},
  // Rare (stronger) units
  spearman:{skin:SKIN.tan,hair:'#3a2a20',mustache:true,outfit:'#a83a2a',metal:'#b8c2d0',body:'armor',trim:'#e9c46a',sleeve:'#8a96a8',pants:'#4a3a2a',boots:'#2a1f14',mood:'fierce',
    hat:{type:'helm',col:'#b8c2d0',plume:'#e2453c'},weapon:{type:'spear',col:'#e9eef5'},back:{cape:'#c8423a'}},
  druid:{skin:SKIN.light,hair:'#4a6a2a',hairStyle:'long',outfit:'#3f7a4a',trim:'#a7f3d0',body:'robe',sleeve:'#4a8a56',boots:'#2a3a20',mood:'calm',
    hat:{type:'antlers',col:'#4f9a3d'},weapon:{type:'staff',orb:'#86efac',shaft:'#6b4a2e'},extra:c=>{for(const [x,y] of[[-12,10],[12,12],[-3,12.6]]){c.fillStyle='#5aa846';c.beginPath();c.ellipse(x,y,2.4,1.2,.3,0,7);c.fill();}}},
  brawler:{skin:U2.stone,stone:true,hair:'#5a5a64',hairStyle:'bald',outfit:'#6a5a4a',trim:'#86efac',sleeve:U2.stone,pants:'#4a4038',boots:'#2a2620',belt:'#3a3028',mood:'fierce',
    hat:{type:'headband',col:'#4caf50'},weapon:{type:'gauntlets',col:'#7a808c'}},
  trickster:{skin:SKIN.pale,hair:'#2a1a3a',outfit:'#3a2a6a',trim:'#fbbf24',sleeve:'#fbbf24',pants:'#2a1f4a',boots:'#1d1426',mood:'happy',blush:true,
    hat:{type:'jester',col:'#3a2a6a',col2:'#fbbf24'},weapon:{type:'cards'},extra:c=>{fillInk(c,P.poly([-7,-5,7,-5,4,-1,0,1,-4,-1]),'#fbbf24',0,-3,6,1);}},
  rune:{skin:SKIN.light,hair:'#5a3a6a',outfit:'#6a3a8a',trim:'#f0abfc',body:'robe',sleeve:'#7a4a9a',boots:'#2a1a3a',mood:'calm',
    hat:{type:'turban',col:'#8a5aa8',gem:'#f0abfc'},weapon:{type:'quill'},off:{type:'scroll2'},extra:c=>{for(const [x,y] of[[-17,-16],[-20,-8],[17,-20]]){glow(c,x,y,4,'#f0abfc',.7);c.strokeStyle='#f0abfc';c.lineWidth=.9;c.beginPath();c.moveTo(x-1.5,y+2);c.lineTo(x,y-2);c.lineTo(x+1.5,y+2);c.moveTo(x-1,y);c.lineTo(x+1,y);c.stroke();}}},
  fencer:{skin:SKIN.light,hair:'#e8e2d6',hairStyle:'swept',mustache:true,beardCol:'#e8e2d6',outfit:'#3f5a8a',trim:'#fdba74',sleeve:'#e8e2d6',pants:'#2a3a5a',boots:'#1d1426',mood:'happy',
    hat:{type:'cavalier',col:'#2a3a5a',feather:'#fdba74'},weapon:{type:'rapier'},back:{cape:'#5a7ab0'}},
  // Common (weaker) units
  squire:{skin:SKIN.light,hair:'#b8864a',outfit:'#7a6aa8',trim:'#c4b5fd',sleeve:'#8a7ab8',pants:'#5a4a3a',boots:'#3a2a1a',mood:'happy',blush:true,
    hat:{type:'bowl',col:'#a9b2bf'},weapon:{type:'sword'},off:{type:'shieldbuckler',col:'#8a5a32'}},
  slingshot:{skin:SKIN.tan,hair:'#5a3a22',hairStyle:'spiky',outfit:'#6a8a2a',trim:'#a3e635',sleeve:'#7a9a3a',pants:'#5a4030',boots:'#3a2a1a',mood:'happy',blush:true,
    hat:{type:'bandana',col:'#a3e635'},weapon:{type:'slingshot'}},
  herbalist:{skin:SKIN.light,hair:'#8a4a2a',hairStyle:'bun',outfit:'#a86a3a',trim:'#fde68a',body:'robe',sleeve:'#b87a4a',boots:'#4a2e1e',mood:'happy',
    hat:{type:'laurel',col:'#5aa846'},weapon:{type:'sickle'},off:{type:'satchel',col:'#7a5a2a'}},
  lancer:{skin:SKIN.light,hair:'#3a2a20',outfit:'#2a7a8a',metal:'#b8c2d0',body:'armor',trim:'#67e8f9',sleeve:'#8a96a8',pants:'#3a4a5a',boots:'#22303a',mood:'fierce',
    hat:{type:'helm',col:'#b8c2d0',plume:'#67e8f9'},weapon:{type:'lance',pennant:'#67e8f9'}},
  torch:{skin:SKIN.tan,hair:'#3a2a20',outfit:'#a84a5a',trim:'#fda4af',sleeve:'#b85a6a',pants:'#4a3030',boots:'#2a1a1a',mood:'fierce',
    hat:{type:'hood',col:'#8a3a4a'},weapon:{type:'torch'}},
  hunter:{skin:SKIN.tan,hair:'#5a3a22',beard:'goatee',outfit:'#3f7a4a',trim:'#86efac',sleeve:'#4a8a56',pants:'#5a4030',boots:'#3a2a1a',mood:'fierce',
    hat:{type:'hood',col:'#2f5a36'},weapon:{type:'bow',col:'#6b4428'},back:{quiver:true,cape:'#6b4a2e'}},
  monk:{skin:SKIN.tan,hair:'#3a2a20',hairStyle:'bald',outfit:'#e0a23a',trim:'#93c5fd',body:'robe',sleeve:'#f0b24a',boots:'#6b4a2e',mood:'calm',
    hat:{type:'headband',col:'#3b82f6'},weapon:{type:'staff',orb:'#bfe0ff',shaft:'#8a5a32'},extra:c=>{for(let i=0;i<7;i++){c.fillStyle='#6b3a1a';c.beginPath();c.arc(-5+i*1.7,-3+Math.abs(i-3)*.7,.9,0,7);c.fill();}glow(c,0,-4,18,'#93c5fd',.18);}},
  scout:{skin:SKIN.light,hair:'#c9802f',hairStyle:'swept',outfit:'#b05ac0',trim:'#f0abfc',sleeve:'#c06ad0',pants:'#4a3a5a',boots:'#2a1f3a',mood:'happy',
    hat:{type:'feather',col:'#9a4aa8',feather:'#f0abfc'},weapon:{type:'bow',col:'#c9a27a'},back:{cape:'#f0abfc'},extra:c=>{c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1;for(const y of[-6,0,6]){c.beginPath();c.moveTo(-22,y);c.quadraticCurveTo(-17,y-3,-13,y);c.stroke();}}},
  guard:{skin:SKIN.light,hair:'#5a3a22',outfit:'#9a6a3a',metal:'#b8c2d0',body:'armor',trim:'#fdba74',sleeve:'#8a96a8',pants:'#5a4a3a',boots:'#3a2a1a',mood:'fierce',
    hat:{type:'helm',col:'#b8c2d0'},weapon:{type:'spear'},off:{type:'towershield',col:'#c8742a',trim:'#fdba74'}},
  lizardscout:{skin:U2.lizard,snout:true,frill:'#1f8a4a',outfit:'#3a6a2a',trim:'#a3e635',sleeve:U2.lizard,pants:'#4a3a22',boots:'#2a2014',iris:'#ffd166',mood:'fierce',
    weapon:{type:'blowgun'},back:{quiver:true}},
  // Reptile / beast builders
  drake:{beast:'dragon',outfit:'#ff6a3a',trim:'#ffd0a0',wing:'#d8462a',fire:true},
  dragonlord:{beast:'dragon',outfit:'#4f9a2a',trim:'#e9f5a0',wing:'#2f7a1a',fire:true,crown:true,extra:c=>{glow(c,0,-4,26,'#a3e635',.25);}},
  reptileking:{skin:U2.lizard2,snout:true,frill:'#5a8a1a',outfit:'#5a7a1a',metal:'#c9a227',body:'armor',trim:'#f2c84b',sleeve:U2.lizard2,pants:'#3a4a14',boots:'#2a3010',iris:'#ffd166',mood:'fierce',
    hat:{type:'crown',col:'#f2c84b',gem:'#7cff6b'},weapon:{type:'spear',col:'#b1e35e',shaft:'#5a3a1a'},back:{cape:'#3a6a1a'},extra:c=>glow(c,16,-30,6,'#7cff6b',.7)},
  leviathan:{beast:'serpent',outfit:'#e86a8a',trim:'#ffd0dc'},
  xenowarden:{beast:'alien',skin:'#c9b8ff',outfit:'#3a2a6a',trim:'#a78bfa',glow:'#d6a5ff',crown:'#a78bfa',weapon:{type:'staff',orb:'#d6a5ff',shaft:'#5a4a8a'},aura:'#a78bfa'},
});

/* ---------------- Fruit and item icons (2026.10.11.3) ---------------- */
// Local size ≈ ±20 units, matching the old itemArt footprint (drawn at 36,32 ×1.5 in 72×64 icons).
const leaf=(c,x,y,rot,len=9,col='#4caf50')=>{c.save();c.translate(x,y);c.rotate(rot);fillInk(c,P.smooth([0,0,len*.35,-len*.32,len,0,len*.35,len*.32]),col,len/2,0,len/2,1.1);line(c,[1,0,len*.8,0],shade(col,-.3),.7);c.restore();};
const shine=(c,x,y,rx,ry,a=.75)=>{c.fillStyle=`rgba(255,255,255,${a})`;c.beginPath();c.ellipse(x,y,rx,ry,-.5,0,Math.PI*2);c.fill();};
const ground=(c,w=14)=>{c.fillStyle='rgba(10,6,20,.3)';c.beginPath();c.ellipse(0,18,w,3.4,0,0,Math.PI*2);c.fill();};
const FRUITS={
  berry:c=>{ground(c);line(c,[0,-12,-2,-18],'#5a3a22',1.6,.6);leaf(c,-1,-16,-2.6,10,'#4caf50');leaf(c,0,-16,-.5,9,'#5cc45a');
    for(const [x,y,r,col] of[[-7,4,7.4,'#c81e4a'],[6,5,7.4,'#e2345e'],[0,-4,7.6,'#d9264f']]){fillInk(c,P.circle(x,y,r),col,x,y,r,1.4);shine(c,x-2.4,y-2.8,2.2,1.4);
      c.fillStyle='rgba(80,0,20,.35)';for(const [dx,dy] of[[2,2],[-1,3],[3,-1]]){c.beginPath();c.arc(x+dx,y+dy,.8,0,7);c.fill();}}},
  crystal:c=>{ground(c);glow(c,0,-1,22,'#5ee7f0',.45);const p=P.poly([0,-19,11,-6,8,13,-8,13,-11,-6]);fillInk(c,p,'#4fd0f5',0,-2,13,1.5,{dark:-.25});
    c.fillStyle='rgba(235,252,255,.85)';c.fill(P.poly([0,-19,11,-6,0,1]));c.fillStyle='rgba(20,110,170,.45)';c.fill(P.poly([0,1,8,13,-8,13]));stroke(c,P.poly([0,-19,0,1,-11,-6]),'rgba(255,255,255,.6)',.8);
    leaf(c,1,-18,-2.2,8,'#5cc45a');for(const [x,y] of[[-12,-12],[13,6]]){c.fillStyle='#ffffff';c.fill(P.poly([x,y-3,x+.8,y-.8,x+3,y,x+.8,y+.8,x,y+3,x-.8,y+.8,x-3,y,x-.8,y-.8]));}},
  pepper:c=>{ground(c,12);glow(c,6,-12,10,'#ff9a3a',.6);const p=new Path2D();p.moveTo(-3,-10);p.bezierCurveTo(-12,-6,-12,10,4,18);p.bezierCurveTo(1,8,6,-4,5,-10);p.closePath();fillInk(c,p,'#e8392a',-1,3,12,1.5);shine(c,-5,-2,1.6,5,.55);
    fillInk(c,P.smooth([-5,-11,0,-14,6,-12,3,-9,-2,-9]),'#3f9a3a',0,-11,5,1.1);line(c,[0,-13,3,-19],'#2f7a2a',1.8,.6);c.fillStyle='#ffd166';c.fill(P.smooth([3,-16,5,-21,8,-19,9,-23,10,-17,7,-14]));},
  lotus:c=>{ground(c);glow(c,0,-2,22,'#c8d8ff',.45);fillInk(c,P.ellipse(0,12,16,4.5),'#3f8a5a',0,12,16,1.2);
    for(const [a,col] of[[-1.15,'#f4b8f2'],[1.15,'#f4b8f2'],[-.6,'#fbd3f8'],[.6,'#fbd3f8'],[0,'#ffe8fd']]){c.save();c.translate(0,8);c.rotate(a);fillInk(c,P.smooth([0,0,-5,-8,0,-19,5,-8]),col,0,-9,6,1.2);c.restore();}
    fillInk(c,P.circle(0,2,3.4),'#ffe27a',0,2,3,1);const m=new Path2D();m.arc(10,-15,5,Math.PI*.4,Math.PI*1.6);m.arc(12,-15,4,Math.PI*1.5,Math.PI*.5,true);m.closePath();fillInk(c,m,'#fff4b0',10,-15,4,.9);},
  date:c=>{ground(c);glow(c,-10,-14,9,'#ffd84a',.6);line(c,[0,-16,0,-10],'#7a5a2a',2,.6);line(c,[0,-16,-6,-6],'#7a5a2a',1.4,.5);line(c,[0,-16,7,-5],'#7a5a2a',1.4,.5);
    for(const [x,y,r] of[[-7,2,.2],[7,3,-.2],[0,6,0]]){fillInk(c,P.ellipse(x,y,5.4,10,r),'#b8682a',x,y,8,1.3);shine(c,x-1.8,y-4,1.4,3.4,.55);}
    c.strokeStyle='#ffe27a';c.lineWidth=1.2;for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(-10+Math.cos(a)*4,-14+Math.sin(a)*4);c.lineTo(-10+Math.cos(a)*6.5,-14+Math.sin(a)*6.5);c.stroke();}fillInk(c,P.circle(-10,-14,3),'#ffd84a',-10,-14,3,.9);},
  icefruit:c=>{ground(c);glow(c,0,0,20,'#bfefff',.45);const p=P.smooth([0,-11,8,-14,14,-6,14,6,8,15,0,13,-8,15,-14,6,-14,-6,-8,-14]);fillInk(c,p,'#8fdcff',0,1,14,1.5,{dark:-.2});shine(c,-6,-5,3,4.6,.75);
    c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=1;c.beginPath();c.moveTo(4,4);c.lineTo(9,0);c.moveTo(6.5,2);c.lineTo(7,7);c.stroke();line(c,[0,-11,2,-18],'#6b8a9a',1.6,.6);leaf(c,2,-16,-.6,8,'#bfe8f0');
    for(const [x,y] of[[-14,-14],[15,-11]]){c.strokeStyle='#e8fbff';c.lineWidth=1;for(let i=0;i<3;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(x-Math.cos(a)*3,y-Math.sin(a)*3);c.lineTo(x+Math.cos(a)*3,y+Math.sin(a)*3);c.stroke();}}},
  spore:c=>{ground(c);for(const [x,y] of[[-12,-14],[12,-16],[14,-4]])glow(c,x,y,4,'#c4ff9a',.8);fillInk(c,P.rrect(-4,0,8,16,3),'#efe6c6',0,8,5,1.3);
    const cap=P.smooth([-16,2,-15,-8,-7,-15,7,-15,15,-8,16,2,0,4]);fillInk(c,cap,'#7fc23a',0,-5,16,1.6);c.fillStyle='#e9ffb0';for(const [x,y,r] of[[-7,-7,2.4],[3,-10,1.8],[8,-4,2.2],[-1,-3,1.4]]){c.beginPath();c.arc(x,y,r,0,7);c.fill();}},
  embercore:c=>{ground(c);glow(c,0,0,24,'#ff6a1a',.6);fillInk(c,P.smooth([0,-16,11,-10,15,2,9,13,-3,16,-13,9,-15,-3,-9,-13]),'#4a1f1f',0,0,15,1.6);
    c.save();c.strokeStyle='#ff8a2a';c.lineWidth=2;c.shadowColor='#ff5a00';c.shadowBlur=6;c.beginPath();c.moveTo(-9,-8);c.lineTo(-2,-2);c.lineTo(-6,6);c.moveTo(-2,-2);c.lineTo(6,-6);c.lineTo(10,2);c.moveTo(-6,6);c.lineTo(2,11);c.stroke();c.restore();
    glow(c,0,0,8,'#ffd166',.9);fillInk(c,P.circle(0,0,3),'#fff1b0',0,0,3,.8);},
  starfruit:c=>{ground(c);glow(c,0,0,22,'#fff3a0',.5);const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?8:18;pts.push(Math.cos(a)*r,Math.sin(a)*r+1);}
    fillInk(c,P.poly(pts),'#f7d23e',0,1,16,1.6);for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;line(c,[0,1,Math.cos(a)*13,Math.sin(a)*13+1],'rgba(200,140,20,.6)',1);}shine(c,-4,-5,2,3.4,.7);fillInk(c,P.circle(0,1,2.4),'#fff7c2',0,1,2,.8);},
  relicseed:c=>{ground(c);glow(c,0,1,18,'#ffe27a',.3);fillInk(c,P.smooth([0,-17,9,-10,12,4,6,15,-6,15,-12,4,-9,-10]),'#a8916a',0,0,13,1.6);
    c.strokeStyle='rgba(70,55,35,.6)';c.lineWidth=1;c.beginPath();c.moveTo(-7,-8);c.lineTo(-4,-2);c.moveTo(7,6);c.lineTo(4,10);c.stroke();
    glow(c,0,0,7,'#ffd84a',.8);c.strokeStyle='#ffe27a';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-8);c.lineTo(0,8);c.moveTo(-4,-4);c.lineTo(0,0);c.lineTo(4,-4);c.moveTo(-4,4);c.lineTo(4,4);c.stroke();leaf(c,2,-15,-1.1,8,'#6fae4a');},
  xenopod:c=>{ground(c);glow(c,0,0,22,'#7cff6b',.4);for(const s of[-1,1])line(c,[s*6,12,s*10,19],'#8a4fb8',2,.6);
    fillInk(c,P.smooth([0,-18,10,-11,13,2,8,14,-8,14,-13,2,-10,-11]),'#7a3fd0',0,-1,13,1.6);fillInk(c,P.ellipse(0,0,7,11),'#b48cff',0,0,8,1,{dark:-.15});
    for(const [x,y,r] of[[0,-5,2.6],[-2.5,3,2],[3,5,1.8]]){glow(c,x,y,r+3,'#7cff6b',.9);c.fillStyle='#d9ffd0';c.beginPath();c.arc(x,y,r,0,7);c.fill();}
    for(const s of[-1,1]){line(c,[s*4,-16,s*8,-23],'#7a3fd0',1.3,.5);glow(c,s*8,-23,3,'#7cff6b',1);}},
  seapearl:c=>{ground(c);glow(c,0,-2,24,'#bff4ff',.5);
    const lo=new Path2D();lo.moveTo(-16,4);lo.quadraticCurveTo(0,20,16,4);lo.closePath();fillInk(c,lo,'#f2c6d9',0,9,14,1.5);
    const up=new Path2D();up.moveTo(-16,2);up.quadraticCurveTo(-14,-17,0,-18);up.quadraticCurveTo(14,-17,16,2);up.closePath();fillInk(c,up,'#ffd9e8',0,-8,15,1.5);
    c.strokeStyle='rgba(190,110,140,.6)';c.lineWidth=.9;for(const x of[-10,-5,0,5,10]){c.beginPath();c.moveTo(0,1);c.lineTo(x,-15);c.stroke();}
    glow(c,0,4,9,'#ffffff',.9);fillInk(c,P.circle(0,4,5.2),'#f4fbff',0,4,5,1.1,{dark:-.12});shine(c,-1.8,2.2,1.6,1.6,.9);
    for(const [x,y] of[[-15,-15],[15,-13]]){c.fillStyle='#ffffff';c.fill(P.poly([x,y-3,x+.8,y-.8,x+3,y,x+.8,y+.8,x,y+3,x-.8,y+.8,x-3,y,x-.8,y-.8]));}},
  trait_reroll:c=>{ // prismatic reroll crystal with orbiting arrows
    ground(c,12);glow(c,0,-2,24,'#c084fc',.55);
    c.save();c.strokeStyle='#ffe27a';c.lineWidth=1.8;c.lineCap='round';c.beginPath();c.arc(0,-1,17,Math.PI*1.1,Math.PI*1.75);c.stroke();c.beginPath();c.arc(0,-1,17,Math.PI*.1,Math.PI*.75);c.stroke();
    c.fillStyle='#ffe27a';c.fill(P.poly([12.6,-13.8,16.2,-9.4,10.4,-9.4]));c.fill(P.poly([-12.6,11.8,-16.2,7.4,-10.4,7.4]));c.restore();
    const p=P.poly([0,-17,9,-6,6,12,-6,12,-9,-6]);const g=c.createLinearGradient(-9,-17,9,12);g.addColorStop(0,'#ffd6fb');g.addColorStop(.35,'#c084fc');g.addColorStop(.7,'#60a5fa');g.addColorStop(1,'#34d399');
    c.fillStyle=g;c.fill(p);c.lineWidth=1.5;c.strokeStyle=INK;c.lineJoin='round';c.stroke(p);
    c.fillStyle='rgba(255,255,255,.75)';c.fill(P.poly([0,-17,9,-6,0,-1]));c.fillStyle='rgba(40,20,90,.35)';c.fill(P.poly([0,-1,6,12,-6,12]));stroke(c,P.poly([0,-17,0,-1,-9,-6]),'rgba(255,255,255,.55)',.8);
    for(const [x,y,r] of[[-13,-15,2.6],[14,2,2],[-4,-21,1.6]]){c.fillStyle='#ffffff';c.fill(P.poly([x,y-r,x+r*.3,y-r*.3,x+r,y,x+r*.3,y+r*.3,x,y+r,x-r*.3,y+r*.3,x-r,y,x-r*.3,y-r*.3]));}},
};
function drawItem(c,id,x,y,s){const f=FRUITS[id];if(!f)return false;c.save();c.translate(x,y);c.scale(s,s);f(c);c.restore();return true;}

/* Prestige star aura under placed units: 1–2★ silver sparkle, 3–4★ golden ring, 5★ radiant gold. */
function drawStarAura(c,x,y,stars,time){
  if(!stars)return;
  c.save();
  if(stars>=3){const pulse=.5+.5*Math.sin(time*3);c.strokeStyle=stars>=5?'#ffe27a':'#f2c84b';c.lineWidth=stars>=5?2.6:1.8;c.shadowColor=stars>=5?'#ffcf33':'#f2c84b';c.shadowBlur=8+pulse*8;
    c.beginPath();c.ellipse(x,y+13,21,9.5,0,0,Math.PI*2);c.stroke();c.shadowBlur=0;}
  if(stars>=5){for(let i=0;i<6;i++){const a=time*1.4+i*Math.PI/3,r=19;const px=x+Math.cos(a)*r,py=y+13+Math.sin(a)*8.6-((time*14+i*7)%18);c.globalAlpha=.85;c.fillStyle=i%2?'#fff7c2':'#ffd84a';c.fill(P.poly([px,py-2.4,px+.7,py-.7,px+2.4,py,px+.7,py+.7,px,py+2.4,px-.7,py+.7,px-2.4,py,px-.7,py-.7]));}c.globalAlpha=1;}
  // star pips under the pad
  const w=stars*8.5;for(let i=0;i<stars;i++){const sx=x-w/2+4.25+i*8.5,sy=y+28;const pts=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?1.8:4.2;pts.push(sx+Math.cos(a)*r,sy+Math.sin(a)*r);}
    const p=P.poly(pts);c.fillStyle=stars>=5?'#ffe27a':stars>=3?'#f2c84b':'#e5e7eb';c.fill(p);c.lineWidth=.8;c.strokeStyle=INK;c.stroke(p);}
  c.restore();
}

Object.assign(G,{drawItem,FRUITS,drawStarAura,LOOKS,DISPLAY_NAMES,unitSprite,drawUnit,drawEnemy,ENEMY_LOOK,drawSpecter,drawWolf,drawProjectile,drawImpact,HATS,WEAPONS,BEASTS});
})(GGA);

