// ---------- Void Sovereign look fix (2026.10.11.30) ----------
// The ground part (shadow pool and crimson sigil) is now drawn under the unit's feet, behind the unit,
// instead of across its legs. Smoke, embers and the red eyes still float around the unit.
// Ground: centered on the point under the feet.
function ggVoidGround(c,x,y,s,t){
  c.save();c.translate(x,y);c.scale(s,s);const pulse=.5+.5*Math.sin(t*2.2);
  const g=c.createRadialGradient(0,0,2,0,0,30);g.addColorStop(0,'rgba(8,0,14,.75)');g.addColorStop(.6,'rgba(70,0,28,.4)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.beginPath();c.ellipse(0,0,30,12,0,0,Math.PI*2);c.fill();
  c.shadowColor='#ff1744';c.shadowBlur=6+7*pulse;c.strokeStyle='rgba(214,18,58,'+(.5+.45*pulse).toFixed(2)+')';c.lineWidth=1.6;
  c.beginPath();c.ellipse(0,0,24,9.5,0,0,Math.PI*2);c.stroke();
  c.lineWidth=1.2;c.beginPath();c.ellipse(0,0,20,7.8,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<5;i++){const a=t*.7+i*Math.PI*2/5,b=a+Math.PI*4/5;c.beginPath();c.moveTo(Math.cos(a)*20,Math.sin(a)*7.8);c.lineTo(Math.cos(b)*20,Math.sin(b)*7.8);c.stroke();}
  c.restore();}
// Floating: smoke rising from the ground, embers circling the body, red eyes above the head.
// (x, y) is the same point the game uses for trait effects; the ground is about 19 units below it.
function ggVoidFloat(c,x,y,s,t){
  c.save();c.translate(x,y);c.scale(s,s);
  for(let i=0;i<8;i++){const ph=(t*.55+i/8)%1,side=i%2?1:-1,xx=side*(15+Math.sin(i*2.3+t*1.2)*4)*(1-ph*.35),yy=16-ph*46;
    c.fillStyle='rgba(40,0,52,'+(.4*(1-ph)).toFixed(2)+')';c.beginPath();c.arc(xx,yy,2.4+ph*4.2,0,Math.PI*2);c.fill();}
  for(let i=0;i<5;i++){const a=-t*1.3+i*Math.PI*2/5;c.fillStyle=i%2?'#ff1f4f':'#1a0024';c.beginPath();c.arc(Math.cos(a)*27,-8+Math.sin(a)*15,1.6,0,Math.PI*2);c.fill();}
  const open=Math.sin(t*1.3)>.96?.15:1;c.fillStyle='rgba(255,24,64,.92)';c.shadowColor='#ff0033';c.shadowBlur=9;
  c.beginPath();c.ellipse(-6,-37,2.6,1.3*open,-.25,0,Math.PI*2);c.ellipse(6,-37,2.6,1.3*open,.25,0,Math.PI*2);c.fill();
  c.restore();}
// Trait effects drawn after the unit only show the floating parts now; the big reveal shows both.
ggVoidAura=function(c,x,y,s,t){try{if(c.canvas&&c.canvas.id==='ggVoidCv')ggVoidGround(c,x,y+19*s,s,t);ggVoidFloat(c,x,y,s,t);}catch(e){}};
// The ground part is drawn first, under the feet, so the unit stands on it.
(function(){const o=art;art=function(c,id,x,y,sc,trait,time){
  if(trait===GG_VOID&&UNITS[id]){try{ggVoidGround(c,x,y+18*(sc||1),sc||1,time||Date.now()/1000);}catch(e){}}
  return o.apply(this,arguments);};})();
