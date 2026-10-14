// ---------- 3D graphics (2026.10.11.40) ----------
// Battles are drawn by a small built-in WebGL2 3D renderer (no libraries, works offline): every map is a
// lit 3D scene (terrain, road, props, entrance and gem castle) with shadows, glow and bloom; every unit,
// enemy and summon is a 3D model built from its look; shots and hits are glowing 3D effects. The camera
// keeps the ground exactly where the 2D map was, so taps, ranges, health bars and numbers line up.
// Settings -> 3D graphics switches back to the classic 2D art at any time (saved on this device).
const GG3D_KEY='gemGuardians3D';
const G3={on:true,ok:false,failed:false,gl:null,cv:null,maps:{},units:{},enemies:{},w:0,h:0,last:0,fpsN:0,fpsT:0,slow:0,hinted:false};
try{if(localStorage.getItem(GG3D_KEY)==='0')G3.on=false;}catch(e){}
function gg3dActive(){return G3.on&&!G3.failed&&!!G&&gg3dInit();}
// ---- math ----
const M3={
  id:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  mul(a,b){const o=new Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
  T:(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],
  S:(x,y,z)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],
  RX(a){const c=Math.cos(a),s=Math.sin(a);return [1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1];},
  RY(a){const c=Math.cos(a),s=Math.sin(a);return [c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1];},
  RZ(a){const c=Math.cos(a),s=Math.sin(a);return [c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1];},
  ortho(l,r,b,t,n,f){return [2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1];},
  look(e,c,u){const z=n3(s3(e,c)),x=n3(x3(u,z)),y=x3(z,x);return [x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-d3(x,e),-d3(y,e),-d3(z,e),1];},
  ch(...m){return m.reduce((a,b)=>M3.mul(a,b));},
  nrm(m){const a=m[0],b=m[1],c=m[2],d=m[4],e=m[5],f=m[6],g=m[8],h=m[9],i=m[10];const A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g,det=a*A+b*B+c*C||1;
    return [A/det,B/det,C/det,-(b*i-c*h)/det,(a*i-c*g)/det,-(a*h-b*g)/det,(b*f-c*e)/det,-(a*f-c*d)/det,(a*e-b*d)/det];}
};
function s3(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}function x3(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function d3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}function n3(a){const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}
function hex3(h,m){if(Array.isArray(h))return h;h=String(h||'#888').replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h.slice(0,6),16)||0;const k=m==null?1:m;
  return [Math.pow(((n>>16)&255)/255,2.2)*k,Math.pow(((n>>8)&255)/255,2.2)*k,Math.pow((n&255)/255,2.2)*k];}
function rng3(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>{s=s*16807%2147483647;return (s-1)/2147483646;};}
// ---- geometry (positions, normals, colors, emissive) ----
function g3(){return {p:[],n:[],c:[],e:[],i:[]};}
function v3(g,p,n,c,e){g.p.push(p[0],p[1],p[2]);g.n.push(n[0],n[1],n[2]);const cc=c||[1,1,1],ee=e||[0,0,0];g.c.push(cc[0],cc[1],cc[2]);g.e.push(ee[0],ee[1],ee[2]);return g.p.length/3-1;}
function gBox(w,h,d){const g=g3(),x=w/2,z=d/2;const F=[[[0,0,1],[[-x,0,z],[x,0,z],[x,h,z],[-x,h,z]]],[[0,0,-1],[[x,0,-z],[-x,0,-z],[-x,h,-z],[x,h,-z]]],[[1,0,0],[[x,0,z],[x,0,-z],[x,h,-z],[x,h,z]]],[[-1,0,0],[[-x,0,-z],[-x,0,z],[-x,h,z],[-x,h,-z]]],[[0,1,0],[[-x,h,z],[x,h,z],[x,h,-z],[-x,h,-z]]],[[0,-1,0],[[-x,0,-z],[x,0,-z],[x,0,z],[-x,0,z]]]];
  for(const [n,q] of F){const b=g.p.length/3;for(const v of q)v3(g,v,n);g.i.push(b,b+1,b+2,b,b+2,b+3);}return g;}
function gLathe(prof,seg,jit){const g=g3(),rows=prof.length;
  for(let j=0;j<rows;j++){const [r,y]=prof[j],a=prof[Math.max(0,j-1)],b=prof[Math.min(rows-1,j+1)],dr=b[0]-a[0],dy=b[1]-a[1];
    for(let s=0;s<=seg;s++){const t=s/seg*Math.PI*2,rr=r*(1+(jit?jit(t,j):0)),l=Math.hypot(dy,dr)||1;v3(g,[Math.cos(t)*rr,y,Math.sin(t)*rr],[Math.cos(t)*dy/l,-dr/l,Math.sin(t)*dy/l]);}}
  for(let j=0;j<rows-1;j++)for(let s=0;s<seg;s++){const a=j*(seg+1)+s,b=a+seg+1;g.i.push(a,b,a+1,a+1,b,b+1);}return g;}
function gCyl(rt,rb,h,seg,caps){seg=seg||12;const g=gLathe([[rb,0],[rt,h]],seg);
  if(caps!==false)for(const [y,r,ny] of [[h,rt,1],[0,rb,-1]]){if(r<=0)continue;const c=v3(g,[0,y,0],[0,ny,0]),b=g.p.length/3;
    for(let s=0;s<=seg;s++){const t=s/seg*Math.PI*2;v3(g,[Math.cos(t)*r,y,Math.sin(t)*r],[0,ny,0]);}for(let s=0;s<seg;s++)ny>0?g.i.push(c,b+s+1,b+s):g.i.push(c,b+s,b+s+1);}
  return g;}
function gSph(r,ws,hs){ws=ws||14;hs=hs||10;const g=g3();for(let j=0;j<=hs;j++){const a=-Math.PI/2+j/hs*Math.PI;for(let s=0;s<=ws;s++){const t=s/ws*Math.PI*2,n=[Math.cos(a)*Math.cos(t),Math.sin(a),Math.cos(a)*Math.sin(t)];v3(g,[n[0]*r,n[1]*r,n[2]*r],n);}}
  for(let j=0;j<hs;j++)for(let s=0;s<ws;s++){const a=j*(ws+1)+s,b=a+ws+1;g.i.push(a,b,a+1,a+1,b,b+1);}return g;}
function gRing(ri,ro,seg){seg=seg||32;const g=g3();for(let s=0;s<=seg;s++){const t=s/seg*Math.PI*2;v3(g,[Math.cos(t)*ri,0,Math.sin(t)*ri],[0,1,0]);v3(g,[Math.cos(t)*ro,0,Math.sin(t)*ro],[0,1,0]);}
  for(let s=0;s<seg;s++){const a=s*2;g.i.push(a,a+1,a+2,a+2,a+1,a+3);}return g;}
function gDisc(r,seg){return gRing(0,r,seg);}
function gTri(pts){const g=g3();const n=n3(x3(s3(pts[1],pts[0]),s3(pts[2],pts[0])));const a=v3(g,pts[0],n),b=v3(g,pts[1],n),c=v3(g,pts[2],n);g.i.push(a,b,c,a,c,b);return g;}
// part: [geometry, matrix, color, emissive]
function gMerge(parts){const g=g3();for(const [h,m,col,em] of parts){if(!h)continue;const b=g.p.length/3,nm=M3.nrm(m);
  for(let k=0;k<h.p.length;k+=3){const x=h.p[k],y=h.p[k+1],z=h.p[k+2];g.p.push(m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]);
    const nx=h.n[k],ny=h.n[k+1],nz=h.n[k+2],n=n3([nm[0]*nx+nm[1]*ny+nm[2]*nz,nm[3]*nx+nm[4]*ny+nm[5]*nz,nm[6]*nx+nm[7]*ny+nm[8]*nz]);g.n.push(n[0],n[1],n[2]);
    const c=col||[h.c[k],h.c[k+1],h.c[k+2]],e=em||[h.e[k],h.e[k+1],h.e[k+2]];g.c.push(c[0],c[1],c[2]);g.e.push(e[0],e[1],e[2]);}
  for(const i of h.i)g.i.push(i+b);}return g;}
// ---- GL setup ----
const G3VS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec3 aC;layout(location=3) in vec3 aE;
uniform mat4 uM,uVP,uLVP;uniform mat3 uNM;out vec3 vW,vN,vC,vE;out vec4 vL;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=normalize(uNM*aN);vC=aC;vE=aE;vL=uLVP*w;gl_Position=uVP*w;}`;
const G3FS=`#version 300 es
precision highp float;precision highp sampler2DShadow;
in vec3 vW,vN,vC,vE;in vec4 vL;out vec4 o;
uniform vec3 uV,uLDir,uLCol,uSky,uGnd,uRim,uTint,uCol,uEmAdd;uniform float uSpec,uShin,uEmMul,uTintK,uColK,uAlpha,uAdd,uShOn;
uniform sampler2DShadow uSh;uniform int uNP;uniform vec3 uPP[16],uPC[16];uniform float uPR[16];
float sh(){if(uShOn<.5)return 1.;vec3 c=vL.xyz/vL.w*.5+.5;if(c.x<0.||c.x>1.||c.y<0.||c.y>1.||c.z>1.)return 1.;vec2 t=1./vec2(textureSize(uSh,0));float s=0.;
  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)s+=texture(uSh,vec3(c.xy+vec2(x,y)*t*1.2,c.z-.0012));return s/9.;}
void main(){
  vec3 base=mix(vC,uCol,uColK);
  if(uAdd>.5){o=vec4((base+vE)*uEmMul*uAlpha,1.);return;}
  vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;base=mix(base,uTint,uTintK);
  vec3 col=base*mix(uGnd,uSky,N.y*.5+.5);float nd=max(dot(N,uLDir),0.);float s=sh();vec3 H=normalize(uLDir+uV);
  col+=base*uLCol*nd*s+uLCol*pow(max(dot(N,H),0.),uShin)*uSpec*s;
  for(int i=0;i<16;i++){if(i>=uNP)break;vec3 d=uPP[i]-vW;float l=length(d);vec3 L=d/l;float a=pow(clamp(1.-pow(l/uPR[i],4.),0.,1.),2.)/(1.+l*l*.0009);
    col+=uPC[i]*a*base*max(dot(N,L),0.);}
  col+=uRim*pow(1.-max(dot(N,uV),0.),3.)*base*1.6;col+=vE*uEmMul+uEmAdd+uTint*uTintK*.15;o=vec4(col,uAlpha);}`;
const G3DVS=`#version 300 es
layout(location=0) in vec3 aP;uniform mat4 uM,uLVP;void main(){gl_Position=uLVP*uM*vec4(aP,1.);}`;
const G3DFS=`#version 300 es
precision highp float;out vec4 o;void main(){o=vec4(1.);}`;
const G3QVS=`#version 300 es
layout(location=0) in vec3 aP;out vec2 vUV;void main(){vUV=aP.xy*.5+.5;gl_Position=vec4(aP.xy,0.,1.);}`;
const G3BR=`#version 300 es
precision highp float;in vec2 vUV;out vec4 o;uniform sampler2D uT;uniform float uTh;void main(){vec3 c=texture(uT,vUV).rgb;float l=max(max(c.r,c.g),c.b);o=vec4(c*smoothstep(uTh,uTh*1.8,l),1.);}`;
const G3BL=`#version 300 es
precision highp float;in vec2 vUV;out vec4 o;uniform sampler2D uT;uniform vec2 uD;void main(){float w[4]=float[](.3,.24,.1,.04);vec3 c=texture(uT,vUV).rgb*w[0];
  for(int i=1;i<4;i++){c+=texture(uT,vUV+uD*float(i)).rgb*w[i];c+=texture(uT,vUV-uD*float(i)).rgb*w[i];}o=vec4(c,1.);}`;
const G3CP=`#version 300 es
precision highp float;in vec2 vUV;out vec4 o;uniform sampler2D uT,uB1,uB2;uniform float uExp,uBloom;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){vec3 c=texture(uT,vUV).rgb+(texture(uB1,vUV).rgb*.6+texture(uB2,vUV).rgb)*uBloom;c=pow(aces(c*uExp),vec3(1./2.2));vec2 q=vUV-.5;c*=1.-dot(q,q)*.55;o=vec4(c,1.);}`;
function gg3dProg(vs,fs){const gl=G3.gl;const mk=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(x));return x;};
  const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,vs));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const u={};const n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name.replace('[0]','')]=gl.getUniformLocation(p,a.name);}return {p,u};}
function gg3dUpload(g){const gl=G3.gl;const vao=gl.createVertexArray();gl.bindVertexArray(vao);const bufs=[];
  for(const [loc,arr] of [[0,g.p],[1,g.n],[2,g.c],[3,g.e]]){const b=gl.createBuffer();bufs.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(arr),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}
  const ib=gl.createBuffer();bufs.push(ib);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.i),gl.STATIC_DRAW);gl.bindVertexArray(null);return {vao,n:g.i.length,bufs};}
function gg3dFree(m){if(!m)return;const gl=G3.gl;gl.deleteVertexArray(m.vao);for(const b of m.bufs)gl.deleteBuffer(b);}
function gg3dTex(w,h,depth){const gl=G3.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  if(depth){gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,w,h);}else gl.texImage2D(gl.TEXTURE_2D,0,G3.hdr?gl.RGBA16F:gl.RGBA8,w,h,0,gl.RGBA,G3.hdr?gl.HALF_FLOAT:gl.UNSIGNED_BYTE,null);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function gg3dFbo(c,d){const gl=G3.gl,f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);if(c)gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,c,0);if(d)gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,d,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return f;}
function gg3dInit(){
  if(G3.ok)return true;if(G3.failed)return false;
  try{const wrap=cv.parentElement;const c=document.createElement('canvas');c.id='cv3d';c.setAttribute('aria-hidden','true');wrap.insertBefore(c,cv);
    const gl=c.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});if(!gl)throw new Error('no webgl2');
    G3.cv=c;G3.gl=gl;G3.hdr=!!gl.getExtension('EXT_color_buffer_float');
    c.addEventListener('webglcontextlost',e=>{e.preventDefault();G3.failed=true;G3.ok=false;document.body.classList.remove('gg3d-on');try{toast('3D graphics stopped on this device, so the classic 2D art is back.');}catch(x){}});
    G3.P=gg3dProg(G3VS,G3FS);G3.DP=gg3dProg(G3DVS,G3DFS);G3.BR=gg3dProg(G3QVS,G3BR);G3.BL=gg3dProg(G3QVS,G3BL);G3.CP=gg3dProg(G3QVS,G3CP);
    G3.quad=gg3dUpload({p:[-1,-1,0,1,-1,0,1,1,0,-1,1,0],n:new Array(12).fill(0),c:new Array(12).fill(1),e:new Array(12).fill(0),i:[0,1,2,0,2,3]});
    G3.SMS=2048;G3.smT=gg3dTex(G3.SMS,G3.SMS,true);gl.bindTexture(gl.TEXTURE_2D,G3.smT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
    G3.smF=gg3dFbo(null,G3.smT);
    // shared effect meshes
    G3.fxSph=gg3dUpload(gSph(1,12,8));G3.fxRing=gg3dUpload(gRing(.82,1,40));G3.fxDisc=gg3dUpload(gDisc(1,32));G3.fxBox=gg3dUpload(gBox(1,1,1));
    G3.ok=true;return true;
  }catch(e){G3.failed=true;try{console.warn('3D graphics unavailable:',e.message)}catch(x){}return false;}}
// ---- camera: the ground keeps the 2D map's exact positions (x right, y down); heights rise up the screen ----
const G3K=.7,G3S=.819,G3C=.574;
G3.VP=[1/400,0,0,0, 0,G3K/225,-2*G3S/1500,0, 0,-1/225,-2*G3C/1500,0, -1,1,1-2*300/1500,1];
G3.V=n3([0,G3S,G3C]);
// ---- themes: light and mood per map ----
const G3THEME={
 meadow:{sun:[1.15,1.02,.85],sky:[.3,.36,.46],gnd:[.1,.09,.06],dir:[-.45,.8,.4],bg:'#2a4a28',exp:1,rim:[.15,.15,.12]},
 crystal:{sun:[.95,.85,1.15],sky:[.42,.36,.6],gnd:[.12,.08,.16],dir:[-.4,.82,.4],bg:'#3d3550',exp:1.1,rim:[.25,.18,.4]},
 ember:{sun:[1.2,.75,.5],sky:[.4,.2,.18],gnd:[.16,.06,.04],dir:[-.5,.75,.4],bg:'#2e1a17',exp:1.1,rim:[.4,.12,.05]},
 marsh:{sun:[.6,.75,.95],sky:[.2,.3,.38],gnd:[.06,.08,.08],dir:[-.4,.8,.45],bg:'#16302d',exp:1.25,rim:[.1,.25,.25]},
 desert:{sun:[1.4,1.2,.9],sky:[.55,.5,.5],gnd:[.25,.18,.1],dir:[-.5,.78,.35],bg:'#8a6a38',exp:1,rim:[.15,.12,.08]},
 tundra:{sun:[1.1,1.15,1.3],sky:[.55,.62,.75],gnd:[.25,.28,.32],dir:[-.45,.8,.4],bg:'#a9c3d4',exp:.95,rim:[.15,.2,.28]},
 jungle:{sun:[1,1.05,.75],sky:[.3,.42,.3],gnd:[.08,.12,.06],dir:[-.4,.8,.45],bg:'#1d3d20',exp:1.1,rim:[.12,.25,.1]},
 volcanic:{sun:[1.05,.6,.45],sky:[.32,.16,.16],gnd:[.12,.04,.03],dir:[-.45,.78,.4],bg:'#2a1a1b',exp:1.15,rim:[.4,.1,.05]},
 nebula:{sun:[.75,.7,1.2],sky:[.25,.22,.5],gnd:[.06,.04,.12],dir:[-.4,.8,.45],bg:'#15153a',exp:1.25,rim:[.3,.25,.6]},
 ruins:{sun:[1.25,1.1,.85],sky:[.45,.44,.42],gnd:[.16,.14,.1],dir:[-.5,.78,.38],bg:'#4e4c3c',exp:1.05,rim:[.15,.14,.1]},
 hive:{sun:[.85,.65,1.1],sky:[.3,.2,.42],gnd:[.08,.04,.1],dir:[-.4,.8,.45],bg:'#24163a',exp:1.2,rim:[.35,.15,.5]},
 reef:{sun:[.9,1.1,1.2],sky:[.35,.55,.65],gnd:[.1,.18,.22],dir:[-.4,.82,.4],bg:'#1e5a62',exp:1.05,rim:[.1,.3,.35]},
 castle:{sun:[.42,.46,.8],sky:[.15,.12,.26],gnd:[.04,.03,.06],dir:[-.45,.8,.4],bg:'#1c1726',exp:1.05,rim:[.45,.3,.7]}
};
// ---- props (built in map pixels; y up) ----
function g3c(h,k){return hex3(h,k);}
const G3PROP={
 tree:(r,P)=>{const s=.8+r()*.5;P.push([gCyl(2.2*s,3.2*s,14*s,8),M3.T(0,0,0),g3c('#6b4a2e')]);for(let k=0;k<3;k++)P.push([gSph(10*s-k*2,12,8),M3.ch(M3.T((r()-.5)*6,14*s+k*7*s,(r()-.5)*6),M3.S(1,.85,1)),g3c(['#3f8a3a','#4f9a46','#2f7a34'][k])]);},
 bush:(r,P)=>{const s=.6+r()*.5;for(let k=0;k<3;k++)P.push([gSph(6*s,10,7),M3.T((k-1)*5*s,4*s,(r()-.5)*4),g3c(['#4f9a43','#3f8a3a','#5ba84f'][k])]);},
 flower:(r,P)=>{const c=['#f2c84b','#e2453c','#f0abfc','#ffffff','#93c5fd'][Math.floor(r()*5)];P.push([gCyl(.4,.4,4,4),M3.T(0,0,0),g3c('#2f7a34')]);P.push([gSph(1.6,6,4),M3.T(0,4.5,0),g3c(c),g3c(c,.15)]);},
 rock:(r,P)=>{const s=.6+r()*.8;P.push([gSph(6*s,8,5),M3.ch(M3.RY(r()*6),M3.S(1.2,.7,1)),g3c('#8a8a8e')]);},
 boulder:(r,P)=>{const s=.8+r()*.8;P.push([gSph(9*s,9,6),M3.ch(M3.RY(r()*6),M3.S(1.15,.75,1)),g3c('#6f6680')]);},
 pebble:(r,P)=>{P.push([gSph(1.8+r()*1.4,6,4),M3.S(1.2,.6,1),g3c('#8a8496')]);},
 fence:(r,P)=>{for(let k=0;k<4;k++)P.push([gBox(1.6,9,1.6),M3.T(k*8-12,0,0),g3c('#7a5a3a')]);P.push([gBox(30,1.4,1),M3.T(0,6,0),g3c('#8a6a48')]);P.push([gBox(30,1.4,1),M3.T(0,3,0),g3c('#8a6a48')]);},
 hay:(r,P)=>{P.push([gCyl(6,6,8,12),M3.ch(M3.T(0,6,0),M3.RX(Math.PI/2),M3.T(0,-4,0)),g3c('#e2c06a')]);},
 tuft:(r,P)=>{for(let k=0;k<3;k++)P.push([gCyl(0,1,4+r()*3,4),M3.ch(M3.T((k-1)*1.5,0,0),M3.RZ((k-1)*.35)),g3c('#3f7a2f')]);},
 mushroom:(r,P)=>{P.push([gCyl(.8,1,3,6),M3.id(),g3c('#efe6d6')]);P.push([gSph(3,8,5),M3.ch(M3.T(0,3,0),M3.S(1,.55,1)),g3c('#d43c3c')]);},
 crystal:(r,P)=>{const c=['#c9a8ff','#8fe9ff','#f0abfc'][Math.floor(r()*3)];for(let k=0;k<3;k++)P.push([gCyl(0,2.6+r()*1.5,10+r()*10,5),M3.ch(M3.T((k-1)*3,0,(r()-.5)*3),M3.RZ((k-1)*.3)),g3c(c),g3c(c,.35)]);},
 cliff:(r,P)=>{for(let k=0;k<4;k++)P.push([gBox(14+r()*10,14+r()*16,12),M3.ch(M3.T(k*10-15,0,r()*6),M3.RY((r()-.5)*.6)),g3c('#5d5470')]);},
 lavapool:(r,P)=>{P.push([gDisc(13+r()*8,20),M3.ch(M3.T(0,.6,0),M3.S(1.3,1,.8)),g3c('#ff6a1a'),g3c('#ff5a10',2.2)]);},
 charred:(r,P)=>{P.push([gCyl(1.6,2.6,8+r()*6,6),M3.RZ((r()-.5)*.4),g3c('#2a201e')]);},
 vent:(r,P)=>{P.push([gCyl(3,7,5,8),M3.id(),g3c('#3a2a28')]);P.push([gDisc(2.6,10),M3.T(0,5.1,0),g3c('#ff7a2a'),g3c('#ff5a10',2.5)]);},
 ember:(r,P)=>{P.push([gSph(.7,4,3),M3.T(0,1+r()*12,0),g3c('#ff8a3a'),g3c('#ff6a20',3)]);},
 crack:(r,P)=>{P.push([gBox(10+r()*10,.4,1),M3.RY(r()*3),g3c('#ff5a10'),g3c('#ff4a10',2.2)]);},
 pond:(r,P)=>{P.push([gDisc(12+r()*6,20),M3.ch(M3.T(0,.4,0),M3.S(1.3,1,.8)),g3c('#2f6b7a'),g3c('#1a4a5a',.2)]);},
 reed:(r,P)=>{for(let k=0;k<3;k++)P.push([gCyl(.3,.6,9+r()*5,4),M3.ch(M3.T((k-1)*1.6,0,0),M3.RZ((k-1)*.2)),g3c('#6a8a3a')]);},
 lily:(r,P)=>{P.push([gDisc(3,10),M3.T(0,.6,0),g3c('#3f8a3a')]);P.push([gSph(1.2,6,4),M3.T(0,1.2,0),g3c('#f0abfc'),g3c('#f0abfc',.2)]);},
 glowshroom:(r,P)=>{const c=['#7dffcf','#8fe9ff','#d6a5ff'][Math.floor(r()*3)];P.push([gCyl(.7,.9,3,6),M3.id(),g3c('#d6e6e0')]);P.push([gSph(2.6,8,5),M3.ch(M3.T(0,3,0),M3.S(1,.55,1)),g3c(c),g3c(c,1.4)]);},
 deadtree:(r,P)=>{const s=.8+r()*.4;P.push([gCyl(1.4*s,2.6*s,18*s,6),M3.id(),g3c('#3a2e2a')]);for(let k=0;k<3;k++)P.push([gCyl(.4,1.1,9*s,5),M3.ch(M3.T(0,8*s+k*4*s,0),M3.RY(k*2.1+r()),M3.RZ(.9)),g3c('#3a2e2a')]);},
 firefly:(r,P)=>{P.push([gSph(.8,4,3),M3.T(0,6+r()*14,0),g3c('#e9ff8a'),g3c('#d9ff6a',3)]);},
 dune:(r,P)=>{P.push([gSph(20+r()*10,12,6),M3.ch(M3.T(0,-8,0),M3.S(1.6,.45,1)),g3c('#e2bd78')]);},
 cactus:(r,P)=>{const s=.8+r()*.5;P.push([gCyl(2.6*s,2.8*s,14*s,8),M3.id(),g3c('#3f8a4a')]);P.push([gSph(2.6*s,8,5),M3.T(0,14*s,0),g3c('#3f8a4a')]);P.push([gCyl(1.6*s,1.6*s,6*s,6),M3.ch(M3.T(2.6*s,7*s,0),M3.RZ(-1.2)),g3c('#3f8a4a')]);P.push([gCyl(1.6*s,1.6*s,5*s,6),M3.T(7*s,8*s,0),g3c('#3f8a4a')]);},
 palm:(r,P)=>{P.push([gCyl(1.4,2.2,22,7),M3.RZ(.12),g3c('#8a6a3e')]);for(let k=0;k<6;k++)P.push([gBox(14,.6,3.4),M3.ch(M3.T(2.6,22,0),M3.RY(k*1.05),M3.RZ(-.35),M3.T(7,0,0)),g3c('#3f8a3a')]);},
 bones:(r,P)=>{for(let k=0;k<3;k++)P.push([gCyl(.6,.6,7,5),M3.ch(M3.T((k-1)*2,.6,0),M3.RY(k),M3.RZ(Math.PI/2)),g3c('#efe6d6')]);P.push([gSph(2.2,8,6),M3.T(4,1.6,1),g3c('#efe6d6')]);},
 pyramid:(r,P)=>{P.push([gCyl(0,40,34,4),M3.RY(.78),g3c('#d9b56a')]);},
 pine:(r,P)=>{const s=.8+r()*.5;P.push([gCyl(1.6*s,2*s,6*s,6),M3.id(),g3c('#6b4a2e')]);for(let k=0;k<3;k++)P.push([gCyl(0,(10-k*2.6)*s,10*s,9),M3.T(0,(5+k*6)*s,0),g3c(['#2f6b4f','#3a7a5a','#e8f1f7'][k===2?2:k])]);},
 iceRock:(r,P)=>{P.push([gCyl(0,6+r()*4,9+r()*8,5),M3.RY(r()*3),g3c('#bfe9ff'),g3c('#8fdcff',.25)]);},
 icePatch:(r,P)=>{P.push([gDisc(10+r()*6,16),M3.ch(M3.T(0,.4,0),M3.S(1.3,1,.8)),g3c('#d6f3ff'),g3c('#bfe9ff',.15)]);},
 snowman:(r,P)=>{P.push([gSph(7,10,8),M3.T(0,6,0),g3c('#f5fbff')]);P.push([gSph(5,10,8),M3.T(0,15,0),g3c('#f5fbff')]);P.push([gSph(3.6,10,8),M3.T(0,22,0),g3c('#f5fbff')]);P.push([gCyl(0,.8,4,5),M3.ch(M3.T(0,22,3),M3.RX(Math.PI/2)),g3c('#ff7a2a')]);},
 drift:(r,P)=>{P.push([gSph(9+r()*6,10,6),M3.ch(M3.T(0,-3,0),M3.S(1.5,.45,1)),g3c('#f5fbff')]);},
 jtree:(r,P)=>{const s=.9+r()*.5;P.push([gCyl(2.4*s,3.6*s,18*s,8),M3.id(),g3c('#5a4a2e')]);for(let k=0;k<4;k++)P.push([gSph(9*s,10,7),M3.ch(M3.T(Math.cos(k*1.6)*6*s,18*s+(k%2)*4,Math.sin(k*1.6)*6*s),M3.S(1,.7,1)),g3c(['#2f6a35','#3f8a3a','#245a2e','#4f9a43'][k])]);},
 fern:(r,P)=>{for(let k=0;k<5;k++)P.push([gBox(8,.5,2.4),M3.ch(M3.RY(k*1.25),M3.RZ(-.5),M3.T(4,0,0)),g3c('#3f8a3a')]);},
 toxicpool:(r,P)=>{P.push([gDisc(11+r()*6,20),M3.ch(M3.T(0,.5,0),M3.S(1.3,1,.8)),g3c('#7cff6b'),g3c('#5aff4a',.9)]);},
 vine:(r,P)=>{for(let k=0;k<4;k++)P.push([gSph(2.2,6,4),M3.T(k*3-4,1.6+Math.sin(k)*1,0),g3c('#3f7a2f')]);},
 lavariver:(r,P)=>{P.push([gBox(70+r()*40,.6,9),M3.RY((r()-.5)*.8),g3c('#ff6a1a'),g3c('#ff5a10',2.2)]);},
 obsidian:(r,P)=>{P.push([gCyl(0,4+r()*3,10+r()*10,5),M3.RZ((r()-.5)*.4),g3c('#1a1420'),g3c('#3a0a2a',.1)]);},
 star:(r,P)=>{if(r()<.6)return;P.push([gSph(.6,4,3),M3.T(0,.6,0),g3c('#ffffff'),g3c('#e9e4ff',1.6)]);},
 starshard:(r,P)=>{P.push([gCyl(0,2.6,9,4),M3.RZ((r()-.5)*.6),g3c('#c9c2ff'),g3c('#a9a2ff',1.2)]);},
 planet:(r,P)=>{P.push([gSph(16+r()*8,16,12),M3.T(0,40,0),g3c(['#c084fc','#60a5fa'][Math.floor(r()*2)]),g3c('#6a5ac0',.15)]);P.push([gRing(22,30,40),M3.ch(M3.T(0,40,0),M3.RZ(.35)),g3c('#e9d5ff'),g3c('#c9a8ff',.4)]);},
 moonrock:(r,P)=>{P.push([gSph(6+r()*4,9,6),M3.S(1.2,.7,1),g3c('#8a86a8')]);},
 comet:(r,P)=>{P.push([gSph(3,8,6),M3.T(0,36,0),g3c('#ffffff'),g3c('#c9e4ff',2.5)]);P.push([gCyl(0,2.6,26,6),M3.ch(M3.T(0,36,0),M3.RZ(1.9)),g3c('#a9c9ff'),g3c('#7aa9ff',1.2)]);},
 column:(r,P)=>{const h=18+r()*14;P.push([gCyl(4,4.4,h,10),M3.id(),g3c('#cfc6a8')]);P.push([gBox(11,2.6,11),M3.T(0,h,0),g3c('#bdb496')]);P.push([gBox(11,2.6,11),M3.id(),g3c('#bdb496')]);},
 brokenwall:(r,P)=>{for(let k=0;k<5;k++)P.push([gBox(7,5+r()*9,5),M3.T(k*7-14,0,0),g3c('#a9a088')]);},
 statue:(r,P)=>{P.push([gBox(12,6,12),M3.id(),g3c('#bdb496')]);P.push([gCyl(3,4.6,14,8),M3.T(0,6,0),g3c('#cfc6a8')]);P.push([gSph(4,8,6),M3.T(0,23,0),g3c('#cfc6a8')]);},
 egg:(r,P)=>{P.push([gSph(4,10,8),M3.ch(M3.T(0,4,0),M3.S(.85,1.2,.85)),g3c('#9a74c4'),g3c('#c084fc',.25)]);},
 tendril:(r,P)=>{P.push([gCyl(.6,2,14+r()*8,6),M3.RZ((r()-.5)*.6),g3c('#6a3a8a')]);},
 slime:(r,P)=>{P.push([gDisc(8+r()*4,16),M3.ch(M3.T(0,.5,0),M3.S(1.3,1,.8)),g3c('#a3e635'),g3c('#7ccf20',.6)]);},
 spore:(r,P)=>{P.push([gSph(.8,4,3),M3.T(0,4+r()*12,0),g3c('#f0abfc'),g3c('#e879f9',1.6)]);},
 crystalHive:(r,P)=>{for(let k=0;k<3;k++)P.push([gCyl(0,3,12+r()*8,6),M3.ch(M3.T((k-1)*3,0,0),M3.RZ((k-1)*.35)),g3c('#d6a5ff'),g3c('#b06bff',.8)]);},
 coral:(r,P)=>{const c=['#ff7a9a','#ffb26b','#c084fc'][Math.floor(r()*3)];for(let k=0;k<4;k++)P.push([gCyl(.7,1.6,7+r()*7,6),M3.ch(M3.RY(k*1.6),M3.RZ(.4)),g3c(c)]);},
 kelp:(r,P)=>{for(let k=0;k<3;k++)P.push([gBox(1.4,14+r()*10,.6),M3.ch(M3.T((k-1)*2.4,0,0),M3.RZ((k-1)*.15)),g3c('#3f8a5a')]);},
 shell:(r,P)=>{P.push([gSph(2.6,8,5),M3.S(1,.5,1.2),g3c('#ffe6d6')]);},
 starfish:(r,P)=>{for(let k=0;k<5;k++)P.push([gBox(5,.8,1.6),M3.ch(M3.T(0,.5,0),M3.RY(k*1.256),M3.T(2.5,0,0)),g3c('#ff8a5a')]);},
 tidepool:(r,P)=>{P.push([gDisc(11+r()*5,20),M3.ch(M3.T(0,.4,0),M3.S(1.3,1,.8)),g3c('#4fc3d0'),g3c('#2aa3b0',.2)]);},
 grave:(r,P)=>{P.push([gBox(9,11,2.6),M3.RZ((r()-.5)*.2),g3c('#77707f')]);P.push([gCyl(4.5,4.5,2.6,12),M3.ch(M3.T(0,11,-1.3),M3.RX(Math.PI/2)),g3c('#77707f')]);},
 candle:(r,P)=>{P.push([gCyl(1,1,4+r()*3,6),M3.id(),g3c('#efe6d6')]);P.push([gSph(1,6,4),M3.T(0,7.5,0),g3c('#ffb24a'),g3c('#ff9a2a',3)]);},
 bat:(r,P)=>{P.push([gSph(1.6,6,4),M3.T(0,28+r()*10,0),g3c('#1a1426')]);},
 wall:(r,P)=>{P.push([gBox(60,22,8),M3.id(),g3c('#4a4258')]);for(let k=0;k<6;k++)P.push([gBox(6,5,8),M3.T(k*11-27,22,0),g3c('#4a4258')]);},
 fog:()=>{}
};
const G3OUT={lavariver:1,cliff:1,pyramid:1,planet:1,comet:1,wall:1,dune:1};
const G3BIG={tree:1,cliff:1,palm:1,pyramid:1,pine:1,jtree:1,column:1,brokenwall:1,statue:1,wall:1,planet:1,comet:1,deadtree:1,lavariver:1,dune:1,boulder:1,cactus:1};
function g3PathDist(path,x,y){let b=1e9;for(let i=1;i<path.length;i++)b=Math.min(b,dSeg(x,y,path[i-1],path[i]));return b;}
function gg3dBuildMap(key,theme,path){
  const T=(typeof GGA!=='undefined'&&GGA.THEMES[theme])||{ground:['#6aa84f','#5b9a43','#7bb85a','#4f8a3b'],roadCol:'#cfa66a',edge:'#8a6a3e',props:{},road:'dirt',entrance:'cave'};
  const r=rng3(key.split('').reduce((a,c)=>a*31+c.charCodeAt(0),7)%100000+11);const P=[],gc=T.ground.map(c=>hex3(c));
  // ground: tiles with color variation (flat inside the battlefield, gentle hills beyond it)
  const grd=g3(),X0=-260,X1=1060,Z0=-180,Z1=640,NX=66,NZ=41;
  const hf=(x,z)=>{const out=Math.max(0,Math.max(-x,x-800,-z,z-450))/120;return out>0?(Math.sin(x*.021)*Math.cos(z*.017)*.5+.5)*28*Math.min(1,out):0;};
  for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const x=X0+(X1-X0)*i/NX,z=Z0+(Z1-Z0)*j/NZ,y=hf(x,z),e=2,n=n3([hf(x-e,z)-hf(x+e,z),2*e,hf(x,z-e)-hf(x,z+e)]);
    const k=Math.floor(r()*4),m=.85+r()*.3;v3(grd,[x,y,z],n,[gc[k][0]*m,gc[k][1]*m,gc[k][2]*m]);}
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+NX+1;grd.i.push(a,b,a+1,a+1,b,b+1);}
  P.push([grd,M3.id()]);
  // road: raised ribbon with darker edges, cobbles or planks for stone/wood roads
  const rc=hex3(T.roadCol),ec=hex3(T.edge);
  for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),ang=Math.atan2(dz,dx);
    P.push([gBox(l+44,1.6,44),M3.ch(M3.T((a[0]+b[0])/2,0,(a[1]+b[1])/2),M3.RY(-ang)),rc]);
    for(const sd of [-1,1])P.push([gBox(l+40,1.2,5),M3.ch(M3.T((a[0]+b[0])/2,0,(a[1]+b[1])/2),M3.RY(-ang),M3.T(0,0,sd*22)),ec]);
    if(['cobble','stone','flagstone','basalt','chitin'].includes(T.road)){const n=Math.floor(l/9);for(let k=0;k<=n;k++)for(let s=-2;s<=2;s++){if(r()<.25)continue;const t=k/Math.max(1,n),px=a[0]+dx*t,pz=a[1]+dz*t,m=.8+r()*.35;
      P.push([gBox(7+r()*3,1.2+r(),6+r()*3),M3.ch(M3.T(px-Math.sin(ang)*s*8,1.2,pz+Math.cos(ang)*s*8),M3.RY(-ang+(r()-.5)*.5)),[rc[0]*m,rc[1]*m,rc[2]*m]]);}}
    if(T.road==='planks'){const n=Math.floor(l/6);for(let k=0;k<=n;k++){const t=k/Math.max(1,n),m=.75+r()*.4;P.push([gBox(4.6,1,40),M3.ch(M3.T(a[0]+dx*t,1.4,a[1]+dz*t),M3.RY(-ang)),[rc[0]*m,rc[1]*m,rc[2]*m]]);}}
    if(T.road==='starlight'&&r()<.9)P.push([gBox(l,.4,3),M3.ch(M3.T((a[0]+b[0])/2,1.7,(a[1]+b[1])/2),M3.RY(-ang)),hex3('#c9c2ff'),hex3('#a9a2ff',.9)]);}
  for(const q of path)P.push([gCyl(22,22,1.6,16),M3.T(q[0],0,q[1]),rc]);
  // props
  for(const [name,cnt] of Object.entries(T.props||{})){const fn=G3PROP[name];if(!fn)continue;const n=Math.min(70,Math.round(cnt*(cnt>40?.45:1)));
    for(let k=0;k<n;k++){let x,z,ok=false;for(let tr=0;tr<30&&!ok;tr++){x=-140+r()*1080;z=-90+r()*600;const d=g3PathDist(path,x,z);
        const inside=x>-10&&x<810&&z>-10&&z<460;ok=d>(G3BIG[name]?60:34)&&!(G3OUT[name]&&inside)&&(!G3BIG[name]||!inside||r()<.25);}
      if(!ok)continue;const parts=[];fn(r,parts);const m0=M3.ch(M3.T(x,hf(x,z),z),M3.RY(r()*6.28));for(const pt of parts)P.push([pt[0],M3.mul(m0,pt[1]),pt[2],pt[3]]);}}
  // enemy entrance and the gem castle (the base)
  const s0=path[0],s1=path[1],e0=path[path.length-1],e1=path[path.length-2],ea=Math.atan2(s1[1]-s0[1],s1[0]-s0[0]),ba=Math.atan2(e0[1]-e1[1],e0[0]-e1[0]);
  const ent=T.entrance||'cave',E=M3.ch(M3.T(s0[0]+Math.cos(ea)*14,0,s0[1]+Math.sin(ea)*14),M3.RY(-ea));const ep=[];
  if(ent==='gate'){for(const sd of [-1,1]){ep.push([gCyl(12,13,46,10),M3.T(0,0,sd*34),hex3('#4a4258')]);ep.push([gCyl(0,15,18,10),M3.T(0,46,sd*34),hex3('#3a1f3a')]);}ep.push([gBox(14,12,72),M3.T(0,36,0),hex3('#4a4258')]);ep.push([gBox(4,34,44),M3.T(-2,0,0),hex3('#120d18'),hex3('#3a0a1a',.6)]);}
  else if(ent==='portal'){ep.push([gRing(26,32,40),M3.ch(M3.T(0,30,0),M3.RZ(Math.PI/2)),hex3('#c9a8ff'),hex3('#a87aff',2.2)]);ep.push([gDisc(26,30),M3.ch(M3.T(0,30,0),M3.RZ(Math.PI/2)),hex3('#2a1a5a'),hex3('#6a3aff',.8)]);}
  else if(ent==='hive'){ep.push([gSph(36,14,10),M3.ch(M3.T(-10,0,0),M3.S(1,.8,1.2)),hex3('#4a2a6a')]);ep.push([gDisc(18,20),M3.ch(M3.T(14,18,0),M3.RZ(Math.PI/2)),hex3('#1a0d24'),hex3('#c084fc',.5)]);}
  else{ep.push([gSph(38,12,9),M3.ch(M3.T(-14,0,0),M3.S(1,.85,1.25)),hex3(T.edge||'#5d5470',.9)]);ep.push([gDisc(20,20),M3.ch(M3.T(18,20,0),M3.RZ(Math.PI/2),M3.S(1,1,1.2)),hex3('#05040a')]);}
  for(const pt of ep)P.push([pt[0],M3.mul(E,pt[1]),pt[2],pt[3]]);
  const B=M3.ch(M3.T(e0[0]-Math.cos(ba)*10,0,e0[1]-Math.sin(ba)*10),M3.RY(-ba));const bp=[],st=hex3('#c9c2d6'),rf=hex3('#3b5bd6');
  bp.push([gBox(46,30,58),M3.T(18,0,0),st]);for(const [tx,tz] of [[0,-30],[0,30],[36,-30],[36,30]]){bp.push([gCyl(9,10,46,12),M3.T(tx,0,tz),st]);bp.push([gCyl(0,12,20,12),M3.T(tx,46,tz),rf]);}
  bp.push([gBox(4,22,22),M3.T(-5,0,0),hex3('#2a1a12')]);bp.push([gCyl(0,9,22,6),M3.T(18,30,0),hex3('#7defff'),hex3('#5fd8ff',2.4)]);bp.push([gCyl(9,0,14,6),M3.ch(M3.T(18,30,0),M3.RX(Math.PI)),hex3('#7defff'),hex3('#5fd8ff',2.4)]);
  for(const pt of bp)P.push([pt[0],M3.mul(B,pt[1]),pt[2],pt[3]]);
  const gem=[e0[0]-Math.cos(ba)*10+Math.cos(ba)*18,40,e0[1]-Math.sin(ba)*10+Math.sin(ba)*18];
  return {mesh:gg3dUpload(gMerge(P)),lights:[[gem,[1.2,3,4],220],[[s0[0]+Math.cos(ea)*30,20,s0[1]+Math.sin(ea)*30],ent==='portal'?[3,1.5,5]:[1.2,.4,1.6],140]],gem,emitters:[]};
}
// ---- unit models (built from each unit's 2D look) ----
function gg3dUnitModel(id){
  const L=(typeof GGA!=='undefined'&&GGA.LOOKS&&GGA.LOOKS[id])||{},U=UNITS[id]||{},P=[],c=(h,k)=>hex3(h,k),col=U.col||'#94a3b8';
  if(L.beast)return gg3dBeast(L,id);
  const skin=c(L.skin||'#f6cfaa'),out=c(L.outfit||col),trim=c(L.trim||'#e9c46a'),slv=c(L.sleeve||L.outfit||col),pants=c(L.pants||'#4a4a5a'),boots=c(L.boots||'#2a2a30'),hair=c(L.hair||'#3a2a20');
  const body=L.body||'',robe=body==='robe'||body==='gown',heavy=body==='heavy'||body==='armor',w=heavy?1.18:1;
  if(!robe)for(const sx of [-1,1]){P.push([gCyl(2.8,3,9,8),M3.T(sx*3.6,2,0),pants]);P.push([gBox(5,3,7),M3.T(sx*3.6,0,1),boots]);}
  if(robe)P.push([gLathe([[11,0],[10,4],[8,12],[7*w,20],[6.5*w,23]],16),M3.id(),out]);
  else P.push([gLathe([[7.5*w,10],[8*w,13],[7.6*w,19],[6.6*w,23]],14),M3.id(),out]);
  P.push([gCyl(7.6*w,7.8*w,1.6,14),M3.T(0,robe?11:12,0),c(L.belt||L.trim||'#5a3a22')]);
  P.push([gLathe([[robe?10.8:8.2*w,robe?0:10],[robe?11.2:8.4*w,robe?1.6:11.4]],16),M3.id(),trim]);
  if(heavy){const mt=c(L.metal||'#c3ccd8');for(const sx of [-1,1])P.push([gSph(4.6,10,7),M3.ch(M3.T(sx*7.6,22,0),M3.S(1,.8,1)),mt]);if(L.tabard)P.push([gBox(6,10,.8),M3.T(0,11,7.4),c(L.tabard)]);}
  // arms: weapon hand forward-right, off hand forward-left
  for(const sx of [-1,1]){const a=M3.ch(M3.T(sx*7.4*w,21,0),M3.RZ(sx*2.6),M3.RX(-.5));P.push([gCyl(2.2,2.6,10,8),a,slv]);P.push([gSph(2.4,8,6),M3.mul(a,M3.T(0,10.5,0)),c(L.glove||L.skin||'#f6cfaa')]);}
  // head
  const H=M3.T(0,31,0);P.push([gSph(8.4,16,12),H,skin]);
  if(L.ears==='pointy')for(const sx of [-1,1])P.push([gCyl(0,1.8,5,5),M3.ch(H,M3.T(sx*8,1,0),M3.RZ(-sx*1.2)),skin]);
  const hs=L.hairStyle||'';if(hs!=='bald'&&!(L.hat&&['hood','helm','kabuto','leafhood','starhood'].includes(L.hat.type))){
    P.push([gLathe([[8.8,0],[8.6,3],[7,6.5],[4,8.4],[0,9]],14),M3.ch(H,M3.T(0,.6,-.6)),hair]);
    if(hs==='long')P.push([gBox(14,12,3),M3.ch(H,M3.T(0,-10,-6)),hair]);if(hs==='bun')P.push([gSph(3.2,8,6),M3.ch(H,M3.T(0,8,-5)),hair]);
    if(hs==='spiky')for(let k=0;k<5;k++)P.push([gCyl(0,2.4,5,5),M3.ch(H,M3.T((k-2)*3,6.5,-1),M3.RZ((k-2)*.35)),hair]);}
  const eg=L.eyeGlow?c(L.eyeGlow):null,ir=c(L.iris||'#1a1420');
  if(L.face==='visor')P.push([gBox(12,3,2),M3.ch(H,M3.T(0,0,7.6)),c('#1a1a24'),eg?c(L.eyeGlow,2.5):null]);
  else{const hood=L.hat&&['hood','leafhood'].includes(L.hat.type);for(const sx of [-1,1])P.push([gSph(hood?1.6:1.3,8,6),M3.ch(H,M3.T(sx*3,.4,hood?9.4:7.9),M3.S(1,1.25,.5)),eg||ir,eg?c(L.eyeGlow,3):null]);}
  if(L.mask)P.push([gBox(13,4.6,2),M3.ch(H,M3.T(0,-4.6,7)),c(L.mask)]);
  if(L.beard)P.push([gSph(5.6,10,8),M3.ch(H,M3.T(0,-5.6,4.6),M3.S(1,L.beard==='goatee'?.6:1,.7)),c(L.beardCol||L.hair||'#5a3a22')]);
  if(L.snout)P.push([gSph(4.6,10,8),M3.ch(H,M3.T(0,-1.6,7),M3.S(1,.7,1)),skin]);
  if(L.frill)for(const sx of [-1,1])P.push([gBox(.8,8,6),M3.ch(H,M3.T(sx*8.6,2,-2),M3.RY(sx*.4)),c(L.frill)]);
  gg3dHat(L.hat,P,H);gg3dWeapon(L.weapon,P,w,col);gg3dOff(L.off,P,w);gg3dBack(L.back,P,w);
  const aura=L.aura?c(L.aura):null;return {g:gMerge(P),h:42,aura};}
function gg3dHat(h,P,H){if(!h)return;const c=x=>hex3(x),hc=c(h.col||'#5a3a8a'),t=h.type;const at=(g,m,cc,e)=>P.push([g,M3.mul(H,m),cc,e]);
  if(t==='wizard'||t==='witch'||t==='starhood'){at(gCyl(10.5,10.5,1.2,18),M3.T(0,6,0),hc);at(gCyl(0,7,16,14),M3.ch(M3.T(0,6.5,0),M3.RX(-.18)),hc);if(t==='starhood')at(gSph(1.6,6,4),M3.T(0,12,1),c('#fff7c2'),c('#ffe27a',2));}
  else if(t==='hood'||t==='leafhood'){at(gSph(10,14,10),M3.ch(M3.T(0,1.4,-1.2),M3.S(1,1.05,1)),hc);at(gSph(8.2,12,8),M3.T(0,0,3.2),c('#050308'));if(h.horns)for(const sx of [-1,1])at(gCyl(0,2.2,8,6),M3.ch(M3.T(sx*6,7,0),M3.RZ(-sx*.6)),c(h.horns));}
  else if(t==='helm'||t==='kabuto'){at(gLathe([[9.4,-2],[9.6,2],[8,6.6],[4.6,9.2],[0,10]],14),M3.id(),hc);if(h.plume)at(gBox(2,8,10),M3.T(0,9,-2),c(h.plume));if(h.horns||t==='kabuto')for(const sx of [-1,1])at(gCyl(0,1.8,9,6),M3.ch(M3.T(sx*7,6,1),M3.RZ(-sx*.8)),c(h.horns||'#f2c84b'));}
  else if(t==='crown'||t==='circlet'||t==='laurel'){at(gCyl(7,7.6,t==='crown'?4:1.6,14),M3.T(0,6.4,0),hc,t==='crown'?null:null);if(t==='crown')for(let k=0;k<6;k++)at(gCyl(0,1.4,3.4,4),M3.T(Math.cos(k*1.05)*7,10.2,Math.sin(k*1.05)*7),hc);if(h.gem)at(gSph(1.4,6,4),M3.T(0,8,7.4),c(h.gem),c(h.gem,1.5));}
  else if(t==='halo'){at(gRing(6,8,24),M3.T(0,13,0),hc,c(h.col||'#fff7c2',2.2));}
  else if(['merchant','tophat','cavalier','tricorn','miner','bowl','feather','jester','turban'].includes(t)){at(gCyl(t==='tricorn'||t==='cavalier'?12:10.5,t==='tricorn'?12:10.5,1.2,t==='tricorn'?3:18),M3.T(0,5.6,0),hc);
    at(gCyl(t==='tophat'?6.6:7,7.6,t==='tophat'?11:t==='turban'?5:6,14),M3.T(0,6,0),hc);if(h.band)at(gCyl(7.7,7.7,1.4,14),M3.T(0,6.8,0),c(h.band));if(h.feather)at(gBox(1,9,3),M3.ch(M3.T(5,8,-2),M3.RZ(-.4)),c(h.feather));
    if(t==='miner')at(gSph(1.8,8,6),M3.T(0,9,7.4),c('#fff7c2'),c('#ffe27a',2.5));}
  else if(t==='headband'||t==='bandana'){at(gCyl(8.8,8.8,2,14),M3.T(0,3.4,0),hc);}
  else if(t==='antlers'){for(const sx of [-1,1]){at(gCyl(.6,1.2,10,5),M3.ch(M3.T(sx*4,7,0),M3.RZ(-sx*.5)),c('#8a6a48'));at(gCyl(.4,.8,5,5),M3.ch(M3.T(sx*7,12,0),M3.RZ(sx*.4)),c('#8a6a48'));}}
  else if(t==='goggles'){at(gCyl(8.9,8.9,1.6,14),M3.T(0,2.4,0),c('#3a2a20'));for(const sx of [-1,1])at(gCyl(2.4,2.4,1.6,10),M3.ch(M3.T(sx*3.2,2.6,8.2),M3.RX(Math.PI/2)),hc,c('#8fe9ff',.4));}
  else if(t==='veil'){at(gLathe([[10,-6],[9.6,0],[8,6],[0,9.4]],14),M3.T(0,0,-.6),hc);}
  else at(gCyl(8.6,8.6,2.4,14),M3.T(0,5,0),hc);}
function gg3dWeapon(wp,P,w,col){if(!wp)return;const t=wp.type,c=x=>hex3(x),R=M3.T(10.5*w,15,6);const at=(g,m,cc,e)=>P.push([g,M3.mul(R,m),cc,e]);
  const blade=c(wp.col||'#dfe6f0'),shaft=c(wp.shaft||'#6b4a2e'),glow=wp.orb||wp.glow||wp.flame||wp.crystal||wp.spark;
  if(['sword','greatsword','katana','rapier','sickle','scythe','axes','daggers','twinpistols'].includes(t)){const L=t==='greatsword'?24:t==='daggers'?8:t==='rapier'?18:15;
    at(gBox(1.6,4,1.6),M3.id(),shaft);at(gBox(5,1.2,1.6),M3.T(0,4,0),c('#c9a227'));at(gBox(t==='greatsword'?3.6:2.2,L,.8),M3.T(0,5,0),blade,wp.flame?c(wp.flame,.9):null);
    if(t==='scythe')at(gBox(12,2,.8),M3.T(-5,4+L,0),blade);if(t==='axes')at(gBox(7,6,.8),M3.T(3,L,0),blade);if(t==='daggers'||t==='twinpistols')P.push([gBox(2,8,.8),M3.T(-10.5*w,20,6),blade]);}
  else if(['spear','lance','spearglow','warhammer','pickaxe'].includes(t)){at(gCyl(.8,.8,30,6),M3.T(0,-8,0),shaft);
    if(t==='warhammer')at(gBox(9,6,6),M3.T(0,20,0),blade);else if(t==='pickaxe')at(gBox(14,2,2),M3.T(0,20,0),blade);else at(gCyl(0,2.2,7,6),M3.T(0,22,0),blade,t==='spearglow'?c(wp.col||'#a5f3fc',1.5):null);}
  else if(['staff','orbstaff','lightningstaff','wand','firewand','hourglass','quill','smoker'].includes(t)){const L=t==='wand'||t==='firewand'||t==='quill'?12:26;at(gCyl(.8,1,L,6),M3.T(0,L>20?-8:0,0),shaft);
    const g=glow?c(glow):c(col);if(t==='hourglass'){at(gCyl(0,3.6,4,8),M3.T(0,L-8,0),c('#e9eef5'),c(glow||'#7defff',.6));at(gCyl(3.6,0,4,8),M3.T(0,L-12,0),c('#e9eef5'),c(glow||'#7defff',.6));}
    else at(gSph(t==='wand'||t==='firewand'?2.2:3.4,10,8),M3.T(0,(L>20?L-8:L)+2,0),g,hex3(glow||col,2.4));}
  else if(['bow','bigbow','crossbow','slingshot'].includes(t)){const s=t==='bigbow'?1.35:1;for(let k=-3;k<=3;k++)at(gBox(1.4,4.2*s,1.4),M3.ch(M3.T(-Math.cos(k*.38)*6*s+6*s,k*3.8*s+4,0),M3.RZ(k*.38)),c(wp.col||'#7a4a2a'),wp.glow?c(wp.glow,.8):null);at(gBox(.4,26*s,.4),M3.T(-.4,4-13*s+4,0),c('#efe6d6'));}
  else if(['pistol','rifle','blowgun'].includes(t)){at(gBox(2.4,3.6,2),M3.id(),shaft);at(gBox(2,2,t==='rifle'?18:t==='blowgun'?20:8),M3.T(0,2.4,3),c(wp.col||'#5a5a66'));}
  else if(t==='flask'){at(gSph(3,10,8),M3.T(0,3,0),c('#7cff6b'),c('#5aff4a',.8));at(gCyl(1,1,3,6),M3.T(0,5.6,0),c('#e9eef5'));}
  else if(t==='scales'){at(gCyl(.6,.6,12,6),M3.id(),c('#c9a227'));at(gBox(12,.8,.8),M3.T(0,12,0),c('#c9a227'));for(const sx of [-1,1])at(gCyl(2.6,2.6,.8,10),M3.T(sx*6,8,0),c('#e9c46a'));}
  else if(t==='cards'){for(let k=0;k<3;k++)at(gBox(4,6,.4),M3.ch(M3.T(k*1.6,2,0),M3.RZ(.3*k-.3)),c(['#f8fafc','#e2453c','#f8fafc'][k]));}
  else if(t==='gauntlets'){at(gSph(3.4,10,8),M3.id(),c(wp.col||'#c3ccd8'));P.push([gSph(3.4,10,8),M3.T(-10.5*w,15,6),c(wp.col||'#c3ccd8')]);}
  else at(gBox(2,14,2),M3.id(),blade);}
function gg3dOff(o,P,w){if(!o)return;const t=o.type,c=x=>hex3(x),R=M3.T(-10.5*w,15,6);const at=(g,m,cc,e)=>P.push([g,M3.mul(R,m),cc,e]);
  if(['shield','shieldbuckler','towershield','sunshield','clockshield'].includes(t)){const r=t==='towershield'?0:1;if(r)at(gCyl(7,7,1.6,16),M3.ch(M3.T(-1,4,2),M3.RZ(Math.PI/2),M3.RY(.3)),c(o.col||'#2f5fbf'),t==='sunshield'?c('#ffd27a',.6):t==='clockshield'?c('#7defff',.5):null);
    else at(gBox(2,18,12),M3.T(-1,-3,2),c(o.col||'#5a6678'));at(gSph(2,8,6),M3.T(-2,4,2),c('#e9c46a'));}
  else if(t==='book'||t==='scroll2')at(gBox(7,8,2.6),M3.ch(M3.T(0,0,2),M3.RY(.4)),c(o.col||'#3a2a6a'));
  else if(t==='crystalball'||t==='lantern2')at(gSph(3.6,10,8),M3.T(0,3,2),c(o.glow||'#a5f3fc'),c(o.glow||'#a5f3fc',1.8));
  else if(t==='falcon'){at(gSph(3,10,8),M3.ch(M3.T(0,8,0),M3.S(1,.9,1.3)),c('#8a5a32'));for(const sx of [-1,1])at(gBox(8,.6,4),M3.ch(M3.T(sx*4,9,0),M3.RZ(sx*.4)),c('#6b4428'));}
  else if(t==='bomb'){at(gSph(3.4,10,8),M3.T(0,2,0),c('#1a1a24'));at(gSph(.8,6,4),M3.T(0,6,0),c('#ffb24a'),c('#ff9a2a',3));}
  else at(gBox(5,6,3),M3.T(0,0,1),c(o.col||'#8a6a48'));}
function gg3dBack(b,P,w){if(!b)return;const c=x=>hex3(x);
  if(b.cape)P.push([gLathe([[10*w,2],[9*w,10],[7.8*w,22]],14,(t)=>0),M3.ch(M3.T(0,0,-1.6),M3.S(1,1,.55)),c(b.cape)]);
  if(b.quiver){P.push([gCyl(2.4,2.4,12,8),M3.ch(M3.T(4,14,-7),M3.RZ(.4)),c('#6b4428')]);for(let k=0;k<3;k++)P.push([gCyl(.3,.3,5,4),M3.ch(M3.T(4+k,24,-8),M3.RZ(.4)),c('#e2453c')]);}
  if(b.pack)P.push([gBox(12,12,6),M3.T(0,11,-8),c(b.pack)]);
  if('wings' in b||'batwings' in b){const wc=c(b.wings||b.batwings||b.cape||'#3a1f55');for(const sx of [-1,1])P.push([gTri([[0,0,0],[sx*20,8,-2],[sx*14,-8,-1]]),M3.T(sx*3,20,-6),wc]);}}
function gg3dBeast(L,id){const P=[],c=(h,k)=>hex3(h,k),U=UNITS[id]||{},o=c(L.outfit||U.col||'#6a8a3a'),tr=c(L.trim||'#e9f5a0');
  if(L.beast==='treant'){P.push([gCyl(7,10,26,10),M3.id(),c('#6b4a2e')]);for(let k=0;k<5;k++)P.push([gSph(10,12,8),M3.ch(M3.T(Math.cos(k*1.3)*9,30+(k%2)*6,Math.sin(k*1.3)*9),M3.S(1,.8,1)),c(['#3f8a3a','#4f9a46','#2f7a34','#5ba84f','#3f8a3a'][k]),c('#7dff8a',.06)]);
    for(const sx of [-1,1])P.push([gSph(1.6,8,6),M3.T(sx*3,18,8),c('#e9ff8a'),c('#d9ff6a',2.6)]);for(const sx of [-1,1])P.push([gCyl(1.6,3,14,6),M3.ch(M3.T(sx*8,16,0),M3.RZ(-sx*1.1)),c('#6b4a2e')]);return {g:gMerge(P),h:48,aura:c('#7dff8a')};}
  if(L.beast==='dragon'){const wc=c(L.wing||'#2f7a1a');P.push([gSph(10,14,10),M3.ch(M3.T(0,12,0),M3.S(1,.85,1.25)),o]);P.push([gCyl(4,6,12,10),M3.ch(M3.T(0,16,6),M3.RX(.7)),o]);P.push([gSph(6,12,8),M3.ch(M3.T(0,26,14),M3.S(1,.85,1.25)),o]);
    for(const sx of [-1,1]){P.push([gCyl(0,1.6,7,5),M3.ch(M3.T(sx*3,31,11),M3.RX(-.6)),tr]);P.push([gSph(1.2,6,4),M3.T(sx*2.6,28,18.6),c('#ffd166'),c('#ffb020',2.4)]);P.push([gTri([[0,0,0],[sx*24,14,-6],[sx*18,-4,-8]]),M3.T(sx*6,18,-2),wc]);
      for(const fz of [-1,1])P.push([gCyl(2.4,2.8,8,6),M3.T(sx*6,0,fz*6),o]);}
    P.push([gCyl(1,4,18,8),M3.ch(M3.T(0,8,-10),M3.RX(-1.9)),o]);if(L.crown)P.push([gCyl(4,4.4,3,10),M3.T(0,31,13),c('#f2c84b'),c('#f2c84b',.3)]);
    if(L.fire)P.push([gSph(2.6,8,6),M3.T(0,25,22),c('#ff9a3a'),c('#ff7a20',3)]);return {g:gMerge(P),h:38,aura:L.crown?c('#fde68a'):null};}
  if(L.beast==='bird'){const f=c(L.flame||'#ff9a3a');P.push([gSph(8,14,10),M3.ch(M3.T(0,16,0),M3.S(1,1.1,1.2)),o,c(L.outfit||'#ff7a2a',.5)]);P.push([gSph(5.6,12,8),M3.T(0,28,4),o,c(L.outfit||'#ff7a2a',.5)]);
    P.push([gCyl(0,2,6,6),M3.ch(M3.T(0,28,9),M3.RX(Math.PI/2)),c('#f2c84b')]);for(const sx of [-1,1]){P.push([gTri([[0,0,0],[sx*26,16,-4],[sx*18,-6,-6]]),M3.T(sx*5,18,0),f,c(L.flame||'#ff9a3a',1.6)]);P.push([gSph(1.2,6,4),M3.T(sx*2.4,29.5,8.6),c('#1a1420')]);}
    for(let k=-1;k<=1;k++)P.push([gBox(2,14,1),M3.ch(M3.T(k*3,10,-8),M3.RX(-.9)),f,c(L.flame||'#ff9a3a',1.4)]);return {g:gMerge(P),h:40,aura:c(L.flame||'#ff9a3a')};}
  if(L.beast==='alien'){const s=c(L.skin||'#9fe8d0'),g=L.glow||'#8ddcff';P.push([gLathe([[7,0],[7.5,6],[6,16],[4,20]],12),M3.id(),o]);P.push([gSph(10,16,12),M3.ch(M3.T(0,29,0),M3.S(1.1,1,1)),s]);
    for(const sx of [-1,1]){P.push([gSph(2.6,10,8),M3.ch(M3.T(sx*4,29,8.4),M3.S(1,1.3,.5)),c('#05040a'),c(g,.6)]);P.push([gCyl(.5,.5,9,5),M3.ch(M3.T(sx*4,37,0),M3.RZ(-sx*.35)),s]);P.push([gSph(1.6,8,6),M3.T(sx*7,45,0),c(g),c(g,2.4)]);
      P.push([gCyl(1.6,2,10,6),M3.ch(M3.T(sx*7,18,0),M3.RZ(sx*2.5)),o]);}
    if(L.weapon)gg3dWeapon(L.weapon,P,1,U.col);if(L.crown)P.push([gCyl(5,5.6,3,10),M3.T(0,38,0),c(L.crown),c(L.crown,.4)]);return {g:gMerge(P),h:46,aura:L.aura?c(L.aura):null};}
  // serpent
  for(let k=0;k<6;k++)P.push([gSph(5-k*.4,10,8),M3.T(Math.sin(k)*6,4+k*4,-k*2),o]);P.push([gSph(5.6,12,8),M3.ch(M3.T(0,28,2),M3.S(1,.8,1.3)),o]);for(const sx of [-1,1])P.push([gSph(1.2,6,4),M3.T(sx*2.6,30,8),c('#ffd166'),c('#ffb020',2)]);
  return {g:gMerge(P),h:34,aura:null};}
// ---- enemy models ----
function gg3dEnemyModel(kind){const P=[],c=(h,k)=>hex3(h,k);const R=(typeof GGA!=='undefined'&&GGA.ENEMY_LOOK[kind]&&GGA.ENEMY_LOOK[kind].r)||11,s=R/11;
  const eyes=(y,z,col,sp)=>{for(const sx of [-1,1])P.push([gSph(1.5*s,8,6),M3.T(sx*(sp||3.4)*s,y,z),c(col||'#ff3b3b'),c(col||'#ff3b3b',2.6)]);};
  const horns=(y,cc,sp)=>{for(const sx of [-1,1])P.push([gCyl(0,1.8*s,7*s,6),M3.ch(M3.T(sx*(sp||5)*s,y,0),M3.RZ(-sx*.55)),c(cc||'#2a1a1a')]);};
  const legs=(cc)=>{for(const sx of [-1,1])P.push([gCyl(1.8*s,2*s,6*s,6),M3.T(sx*4*s,0,0),c(cc)]);};
  if(kind==='tank'){P.push([gSph(13,16,10),M3.ch(M3.T(0,6,0),M3.S(1,.7,1.25)),c('#4b9aff')]);P.push([gBox(2,4,30),M3.T(0,14,0),c('#9cceff')]);for(const sx of [-1,1])for(let k=-1;k<=1;k++)P.push([gCyl(.8,1,9,5),M3.ch(M3.T(sx*10,3,k*7),M3.RZ(-sx*1.1)),c('#173a8e')]);
    P.push([gSph(6,12,8),M3.T(0,8,13),c('#2a5abf')]);for(const sx of [-1,1])P.push([gCyl(0,1.4,7,5),M3.ch(M3.T(sx*3,7,18),M3.RX(1.3),M3.RZ(sx*.4)),c('#11192a')]);eyes(10,17,'#9cceff',2.6);return {g:gMerge(P),h:22};}
  if(kind==='runner'){legs('#12672b');P.push([gSph(7,12,9),M3.ch(M3.T(0,11,0),M3.S(1,1.1,1)),c('#65f58a')]);for(const sx of [-1,1])P.push([gCyl(0,2.2,9,5),M3.ch(M3.T(sx*6,15,0),M3.RZ(-sx*1.2)),c('#65f58a')]);P.push([gCyl(0,2,7,5),M3.ch(M3.T(0,17,-2),M3.RX(-.6)),c('#b9ff9d')]);eyes(13,6,'#0c1421',2.6);return {g:gMerge(P),h:20};}
  if(kind==='elite'){legs('#351050');P.push([gLathe([[8,4],[10,10],[9,18],[6,22]],12),M3.id(),c('#7a3ac0')]);P.push([gSph(6.6,12,8),M3.T(0,26,0),c('#552288')]);horns(29,'#e0b7ff',4);for(const sx of [-1,1])P.push([gSph(4,10,7),M3.T(sx*9,19,0),c('#ca86ff')]);P.push([gBox(9,2,2),M3.T(0,26,6),c('#351050'),c('#e0b7ff',1.2)]);return {g:gMerge(P),h:32};}
  if(kind==='boss'){legs('#05030b');P.push([gLathe([[14,4],[17,14],[15,26],[9,32]],14),M3.id(),c('#595367')]);P.push([gSph(10,14,10),M3.T(0,38,0),c('#3a3448')]);for(const sx of [-1,1]){P.push([gCyl(0,3,16,6),M3.ch(M3.T(sx*8,44,0),M3.RZ(-sx*.8)),c('#aeb0c5')]);P.push([gSph(6,10,8),M3.T(sx*16,26,0),c('#3a3448')]);}
    P.push([gCyl(0,4,7,4),M3.ch(M3.T(0,20,15),M3.RX(Math.PI/2)),c('#e34261'),c('#ff2a4a',2.4)]);eyes(39,9,'#ff3e60',4);for(let k=0;k<5;k++)P.push([gCyl(0,1.6,6,4),M3.T((k-2)*4,46,4),c('#c9a227'),c('#c9a227',.4)]);return {g:gMerge(P),h:50};}
  if(kind==='shield'){P.push([gSph(11,14,10),M3.ch(M3.T(0,6,0),M3.S(1.2,.7,1)),c('#3a6a8a')]);for(let k=0;k<5;k++)P.push([gCyl(0,3,10,5),M3.ch(M3.T(Math.cos(k*1.25)*5,10,Math.sin(k*1.25)*5),M3.RZ((Math.cos(k*1.25))*.4)),c('#8fe9ff'),c('#8fe9ff',.6)]);
    for(const sx of [-1,1])P.push([gSph(3.6,8,6),M3.T(sx*13,5,8),c('#2a4a6a')]);eyes(8,10,'#c9f6ff',3);return {g:gMerge(P),h:22};}
  if(kind==='flyer'){P.push([gSph(6,12,8),M3.T(0,0,0),c('#2a1a3a')]);for(const sx of [-1,1])P.push([gTri([[0,0,0],[sx*20,6,-4],[sx*14,-6,2]]),M3.T(sx*4,0,0),c('#3a2250')]);P.push([gCyl(0,1.6,4,4),M3.ch(M3.T(-3,5,0),M3.RZ(.3)),c('#2a1a3a')]);P.push([gCyl(0,1.6,4,4),M3.ch(M3.T(3,5,0),M3.RZ(-.3)),c('#2a1a3a')]);eyes(1,5,'#ffd166',2.4);return {g:gMerge(P),h:10,fly:true};}
  if(kind==='healer'){P.push([gLathe([[9,0],[8,8],[6,16],[4,20]],12),M3.id(),c('#3f7a3a')]);P.push([gSph(6,12,8),M3.T(0,24,0),c('#6aa84f')]);P.push([gCyl(.8,.8,26,6),M3.T(9,0,3),c('#6b4a2e')]);P.push([gSph(3,8,6),M3.T(9,27,3),c('#7dff8a'),c('#5aff6a',2.4)]);eyes(24,5.4,'#e9ff8a',2.6);return {g:gMerge(P),h:30};}
  if(kind==='splitter'||kind==='gloopling'){P.push([gSph(11*s,14,10),M3.ch(M3.T(0,9*s,0),M3.S(1.15,.9,1.15)),c('#7cff6b'),c('#3aff4a',.35)]);P.push([gSph(3.6*s,8,6),M3.T(-4*s,13*s,3*s),c('#c9ffc0'),c('#a9ff9a',.4)]);eyes(12*s,9*s,'#0a2a10',3.4);return {g:gMerge(P),h:20*s};}
  if(kind==='burrower'){P.push([gSph(11,14,10),M3.ch(M3.T(0,6,0),M3.S(1.3,.6,1)),c('#e2603a')]);for(const sx of [-1,1]){P.push([gSph(4.4,10,7),M3.ch(M3.T(sx*15,8,8),M3.S(1.3,.7,1)),c('#ff7a4a')]);for(let k=-1;k<=1;k++)P.push([gCyl(.6,.8,8,5),M3.ch(M3.T(sx*10,3,k*5),M3.RZ(-sx*1.2)),c('#b0402a')]);}
    for(const sx of [-1,1])P.push([gCyl(.5,.5,6,5),M3.T(sx*3,8,8),c('#b0402a')]);eyes(14,8,'#111',3);return {g:gMerge(P),h:18};}
  if(kind==='dasher'){P.push([gSph(8,12,9),M3.ch(M3.T(0,11,0),M3.S(.85,.75,1.5)),c('#3a2a5a')]);for(const sx of [-1,1])for(const fz of [-1,1])P.push([gCyl(1.4,1.6,8,6),M3.T(sx*4.6,0,fz*7),c('#2a1a40')]);P.push([gSph(5.6,10,8),M3.T(0,16,12),c('#3a2a5a')]);
    for(const sx of [-1,1])P.push([gCyl(0,2,4,4),M3.T(sx*3.2,20,12),c('#2a1a40')]);P.push([gCyl(.6,1.4,14,5),M3.ch(M3.T(0,12,-11),M3.RX(-1.2)),c('#3a2a5a')]);eyes(17,17,'#a678ff',2.4);return {g:gMerge(P),h:22};}
  if(kind==='berserk'){legs('#5a1a0a');P.push([gSph(12,14,10),M3.ch(M3.T(0,16,0),M3.S(1.1,1,.9)),c('#c2410c')]);P.push([gSph(6,10,8),M3.T(0,30,4),c('#9a3412')]);for(const sx of [-1,1]){P.push([gCyl(3,4,13,8),M3.ch(M3.T(sx*13,22,0),M3.RZ(sx*2.7)),c('#c2410c')]);P.push([gSph(5,10,8),M3.T(sx*17,9,3),c('#7c2d12')]);}
    horns(34,'#fdba74',4);eyes(31,9,'#ffd166',2.6);return {g:gMerge(P),h:38};}
  // normal: red horned imp
  legs('#8e1922');P.push([gSph(9,14,10),M3.ch(M3.T(0,13,0),M3.S(1,1.05,.95)),c('#e2453c')]);horns(21,'#3a0a10',5);eyes(15,8,'#fff1c2',3.2);
  for(const sx of [-1,1])P.push([gCyl(1.4,2,9,6),M3.ch(M3.T(sx*8,13,2),M3.RZ(sx*2.4)),c('#c2322c')]);P.push([gCyl(.6,1.6,14,5),M3.ch(M3.T(0,8,-7),M3.RX(-1.9)),c('#8e1922')]);P.push([gCyl(0,1.6,3,4),M3.ch(M3.T(0,8,-19),M3.RX(-1.9)),c('#8e1922')]);
  return {g:gMerge(P),h:24};}
function gg3dAllyModel(kind,elite){const P=[],c=(h,k)=>hex3(h,k);
  if(kind==='wolf'){P.push([gSph(7,12,9),M3.ch(M3.T(0,9,0),M3.S(.8,.7,1.5)),c('#371a20')]);for(const sx of [-1,1])for(const fz of [-1,1])P.push([gCyl(1.2,1.4,7,5),M3.T(sx*3.4,0,fz*6),c('#22101a')]);P.push([gSph(4.6,10,8),M3.T(0,13,11),c('#371a20')]);
    for(const sx of [-1,1]){P.push([gCyl(0,1.6,4,4),M3.T(sx*2.6,17,10),c('#22101a')]);P.push([gSph(1,6,4),M3.T(sx*1.8,14,15),c('#f43f5e'),c('#f43f5e',2.6)]);}return {g:gMerge(P),h:18};}
  if(elite){P.push([gLathe([[10,0],[11,8],[9,16],[6,20]],12),M3.id(),c('#32101d')]);P.push([gSph(6,10,8),M3.T(0,24,0),c('#4a1426')]);for(const sx of [-1,1]){P.push([gCyl(0,1.8,9,5),M3.ch(M3.T(sx*4,28,0),M3.RZ(-sx*.6)),c('#ff879e')]);P.push([gSph(1.3,6,4),M3.T(sx*2.4,25,5.4),c('#ff3656'),c('#ff3656',3)]);}
    return {g:gMerge(P),h:30,glow:c('#ff3656')};}
  P.push([gLathe([[8,0],[8.6,6],[7,14],[0,22]],12,(t,j)=>j===0?Math.sin(t*6)*.15:0),M3.id(),c('#21152d')]);for(const sx of [-1,1])P.push([gSph(1.2,6,4),M3.T(sx*2.6,14,6.6),c('#e178ff'),c('#e178ff',3)]);return {g:gMerge(P),h:22,glow:c('#8b36bd')};}
// ---- per-frame rendering ----
function gg3dSize(){const c=G3.cv,gl=G3.gl;const st=getComputedStyle(cv);
  c.style.left=cv.offsetLeft+'px';c.style.top=cv.offsetTop+'px';c.style.width=cv.offsetWidth+'px';c.style.height=cv.offsetHeight+'px';c.style.objectFit=st.objectFit;c.style.transform=cv.style.transform||'';
  const dpr=Math.min(2,window.devicePixelRatio||1),q=ggFx&&ggFx.perf?.6:1;let W=Math.round(Math.min(1600*q,Math.max(480,cv.offsetWidth*dpr*q)));let H=Math.round(W*450/800);
  if(W!==G3.w||H!==G3.h){G3.w=W;G3.h=H;c.width=W;c.height=H;for(const k of ['hdrT','dT','b1a','b1b','b2a','b2b'])if(G3[k])gl.deleteTexture(G3[k]);for(const k of ['hdrF','b1aF','b1bF','b2aF','b2bF'])if(G3[k])gl.deleteFramebuffer(G3[k]);
    G3.hdrT=gg3dTex(W,H);G3.dT=gg3dTex(W,H,true);G3.hdrF=gg3dFbo(G3.hdrT,G3.dT);const w2=W>>1,h2=H>>1,w4=W>>2,h4=H>>2;
    G3.b1a=gg3dTex(w2,h2);G3.b1b=gg3dTex(w2,h2);G3.b2a=gg3dTex(w4,h4);G3.b2b=gg3dTex(w4,h4);G3.b1aF=gg3dFbo(G3.b1a);G3.b1bF=gg3dFbo(G3.b1b);G3.b2aF=gg3dFbo(G3.b2a);G3.b2bF=gg3dFbo(G3.b2b);}}
function gg3dMapFor(){const key=G.raidLevel?'raid':('m'+G.si);const theme=artThemeKey();let m=G3.maps[key];
  if(!m){for(const k in G3.maps){gg3dFree(G3.maps[k].mesh);delete G3.maps[k];}m=G3.maps[key]=gg3dBuildMap(key,theme,battleStage().path);m.theme=theme;}return m;}
function gg3dUnit(id){let m=G3.units[id];if(!m){const b=gg3dUnitModel(id);m=G3.units[id]={mesh:gg3dUpload(b.g),h:b.h,aura:b.aura};}return m;}
function gg3dEnemy(kind){let m=G3.enemies[kind];if(!m){const b=gg3dEnemyModel(kind);m=G3.enemies[kind]={mesh:gg3dUpload(b.g),h:b.h,fly:b.fly};}return m;}
function gg3dAlly(a){const k=(a.kind==='wolf'?'wolf':a.elite?'elite':'spec');let m=G3.enemies['ally_'+k];if(!m){const b=gg3dAllyModel(a.kind,a.elite);m=G3.enemies['ally_'+k]={mesh:gg3dUpload(b.g),h:b.h};}return m;}
const G3SHOT={rift:['#e45cff',3],fireball:['#ff7a20',3.2],wind:['#77e0d3',2],dragonfire:['#ff4a10',3.6],flame:['#ff8a2a',3],arrow:['#e8d6a3',.9],magic:['#b06bff',2.6],plasma:['#3fc3ff',3],ice:['#7fdcff',2.4],lightning:['#fff27a',3.2]};
function gg3dDraw(){
  const gl=G3.gl,t=performance.now()/1000;gg3dSize();const map=gg3dMapFor(),TH=G3THEME[map.theme]||G3THEME.meadow;
  const L=n3(TH.dir),LP=[400+L[0]*900,L[1]*900,225+L[2]*900];const LV=M3.look(LP,[400,0,225],[0,1,0]);const LVP=M3.mul(M3.ortho(-700,700,-560,560,100,2000),LV);
  // collect drawables: [mesh, matrix, opts]
  const D=[],lights=map.lights.slice(),sel=G.sel;
  for(const u of G.us){const m=gg3dUnit(u.id),age=u.atkT?performance.now()-u.atkT:999,lunge=age<160?(u.face||1)*4*(1-age/160):0,face=(u.face||1)>0?.55:-.55;
    const bob=1+Math.sin(t*2.2+u.uid)*.015,base=M3.T(u.x+lunge,0,u.y+12);
    D.push([G3.fxDisc,M3.ch(M3.T(u.x,1.8,u.y+12),M3.S(17,1,12)),{col:hex3('#3a3550'),em:hex3(TYPES[UNITS[u.id].t]||'#cbd5e1',.08)}]);
    D.push([G3.fxRing,M3.ch(M3.T(u.x,2,u.y+12),M3.S(18,1,13)),{col:hex3(TYPES[UNITS[u.id].t]||'#cbd5e1'),em:hex3(TYPES[UNITS[u.id].t]||'#cbd5e1',.6),noShadow:1}]);
    D.push([m.mesh,M3.ch(base,M3.T(0,2,0),M3.RY(face),M3.S(.95,.95*bob,.95)),{}]);
    const st=prestigeStars(u);if(m.aura||st>=3){const ac=st>=3?hex3('#facc15'):m.aura;D.push([G3.fxRing,M3.ch(M3.T(u.x,2.4,u.y+12),M3.S(21,1,15)),{add:1,col:ac,em:ac,a:.55+.2*Math.sin(t*3)}]);}
    if(st>=5)for(let k=0;k<3;k++){const a=t*1.6+k*2.09;D.push([G3.fxSph,M3.ch(M3.T(u.x+Math.cos(a)*16,14+Math.sin(t*3+k)*4,u.y+12+Math.sin(a)*11),M3.S(1.6,1.6,1.6)),{add:1,col:hex3('#fff1a8'),em:hex3('#fff1a8',2),a:1}]);}}
  for(const e of G.en){if(e.hp<=0)continue;const kind=e.boss?'boss':(e.kind||'normal');const m=gg3dEnemy(kind);
    if(e._p3x==null){e._p3x=e.x;e._p3y=e.y;e._yaw=Math.PI/2;}const dx=e.x-e._p3x,dy=e.y-e._p3y;if(Math.abs(dx)+Math.abs(dy)>.05)e._yaw=Math.atan2(dx,dy);e._p3x=e.x;e._p3y=e.y;
    const sc=e.kind==='gloopling'?.7:1,ph=(e.d||0)*.25,fz=(e.frozen>0||e.stunned>0),h=m.fly?20+Math.sin(t*4+ph)*3:Math.abs(Math.sin(ph))*2,sub=e.submerged>0?-12:0;
    D.push([m.mesh,M3.ch(M3.T(e.x,h+sub,e.y+6),M3.RY(e._yaw),M3.RZ(m.fly?0:Math.sin(ph*2)*.06),M3.S(sc,sc,sc)),{tint:fz?hex3('#bfefff'):e.sl>0?hex3('#9fd8ff'):null,tk:fz?.6:e.sl>0?.25:0,hitT:e.lastHitT}]);
    if(e.boss)lights.push([[e.x,30,e.y+6],[2.4,.3,.5],90]);}
  for(const a of (G.allies||[])){const m=gg3dAlly(a);if(a._p3x==null){a._p3x=a.x;a._p3y=a.y;a._yaw=-Math.PI/2;}{const dx=a.x-a._p3x,dy=a.y-a._p3y;if(Math.abs(dx)+Math.abs(dy)>.05)a._yaw=Math.atan2(dx,dy);a._p3x=a.x;a._p3y=a.y;}const yaw=a._yaw;D.push([m.mesh,M3.ch(M3.T(a.x,Math.abs(Math.sin(t*9+a.x))*2,a.y+6),M3.RY(yaw)),{}]);}
  for(const w of (G.wolves||[])){const [x,y]=posAt(w.d),[nx]=posAt(Math.min(G.tot,w.d+4));const m=gg3dAlly({kind:'wolf'});D.push([m.mesh,M3.ch(M3.T(x,Math.abs(Math.sin(t*10+x))*2,y+6),M3.RY(nx<x?-Math.PI/2:Math.PI/2)),{}]);}
  // effects (additive)
  const FX=[];const add=(mesh,m,col,a,em)=>FX.push([mesh,m,{add:1,col,em:em||col,a}]);
  for(const f of G.fx){const k=f.l/f.max;
    if(f.kind==='shot'){const tt=1-k,ax=f.a[0],ay=f.a[1],bx=f.b[0],by=f.b[1],x=ax+(bx-ax)*tt,y=ay+(by-ay)*tt,h=22-12*tt+Math.sin(tt*Math.PI)*10;const st=G3SHOT[f.style]||G3SHOT[f.fxk]||[f.c||'#ffffff',2.4];const cc=hex3(st[0]);
      add(G3.fxSph,M3.ch(M3.T(x,h,y),M3.S(st[1],st[1],st[1])),cc,1,hex3(st[0],2.2));const ang=Math.atan2(by-ay,bx-ax);add(G3.fxSph,M3.ch(M3.T(x-Math.cos(ang)*6,h,y-Math.sin(ang)*6),M3.RY(-ang),M3.S(8,st[1]*.6,st[1]*.6)),cc,.5);
      if(lights.length<14)lights.push([[x,h,y],hex3(st[0],1.6),70]);}
    else if(f.kind==='impact2'){const age=f.max-f.l;if(age<f.delay)continue;const p=Math.min(1,(age-f.delay)/(f.max-f.delay));const cc=hex3(f.col||'#ffd27a');add(G3.fxSph,M3.ch(M3.T(f.x,12,f.y+6),M3.S(4+10*p,4+10*p,4+10*p)),cc,1-p);add(G3.fxRing,M3.ch(M3.T(f.x,1.5,f.y+6),M3.S(6+16*p,1,6+16*p)),cc,1-p);}
    else if(f.kind==='death'){const p=1-k;add(G3.fxRing,M3.ch(M3.T(f.x,1.5,f.y+6),M3.S(6+22*p,1,6+22*p)),hex3('#c9a8ff'),1-p);add(G3.fxSph,M3.ch(M3.T(f.x,8+p*12,f.y+6),M3.S(6*(1-p)+1,6*(1-p)+1,6*(1-p)+1)),hex3('#e9d5ff'),1-p);}
    else if(f.kind==='coin'){const p=1-k;D.push([G3.fxSph,M3.ch(M3.T(f.x,14+p*22,f.y+4),M3.RY(t*8),M3.S(4,4,1.2)),{col:hex3('#facc15'),em:hex3('#facc15',.8),noShadow:1}]);}
    else if(f.kind==='timefreeze'||f.kind==='riftburst'||f.kind==='summon'||f.kind==='wolfhit'){const p=1-k,r=f.kind==='timefreeze'?f.rg:f.kind==='summon'?8+36*p:f.kind==='wolfhit'?5+22*p:80*p;const cc=hex3(f.kind==='timefreeze'?'#80f0ff':f.kind==='riftburst'?'#f07aff':'#ff1939');add(G3.fxRing,M3.ch(M3.T(f.x,2,f.y),M3.S(r,1,r)),cc,Math.max(0,k)*.9);}
    else if(f.kind==='mythic'){const p=1-k;const v=(typeof MYTHIC_VISUALS!=='undefined'&&MYTHIC_VISUALS[f.trait])||{color:'#fde68a'};for(let i=0;i<6;i++){const a=i*1.05+t*4;add(G3.fxSph,M3.ch(M3.T(f.x+Math.cos(a)*(10+20*p),12+i*2,f.y+Math.sin(a)*(10+20*p)),M3.S(2,2,2)),hex3(v.color),k);}}
    else if(f.a&&f.b){const ax=f.a[0],ay=f.a[1],bx=f.b[0],by=f.b[1],l=Math.hypot(bx-ax,by-ay);add(G3.fxBox,M3.ch(M3.T((ax+bx)/2,16,(ay+by)/2),M3.RY(-Math.atan2(by-ay,bx-ax)),M3.S(l,1.6,1.6),M3.T(0,-.5,0)),hex3(f.c||'#ffffff'),Math.min(1,k*2));}}
  for(const g of (G.ground||[])){const [x,y]=posAt(g.d);const fire=g.kind!=='mud';add(G3.fxDisc,M3.ch(M3.T(x,2.2,y),M3.S(g.radius,1,15)),hex3(fire?'#ff5a16':'#704629',fire?1:.5),Math.min(.85,g.ttl/2));if(fire&&lights.length<15)lights.push([[x,10,y],[2.4,.8,.2],80]);}
  for(const w of (G.xenoWards||[])){const [x,y]=posAt(w.d);const cc=hex3({slow:'#ffd166',stun:'#d6a5ff',freeze:'#65e9ff'}[w.effect]||'#ffffff');add(G3.fxRing,M3.ch(M3.T(x,2.4,y),M3.S(12,1,12)),cc,Math.min(1,w.ttl));add(G3.fxRing,M3.ch(M3.T(x,2.3,y),M3.S(w.radius,1,w.radius)),cc,.3*Math.min(1,w.ttl));}
  if(sel){add(G3.fxRing,M3.ch(M3.T(sel.x,4.5,sel.y),M3.S(sel.rg,1,sel.rg)),hex3('#ffc94d'),.35);add(G3.fxDisc,M3.ch(M3.T(sel.x,4.4,sel.y),M3.S(sel.rg,1,sel.rg)),hex3('#ffc94d'),.025);}
  // shadow pass
  gl.bindFramebuffer(gl.FRAMEBUFFER,G3.smF);gl.viewport(0,0,G3.SMS,G3.SMS);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.useProgram(G3.DP.p);gl.uniformMatrix4fv(G3.DP.u.uLVP,false,LVP);
  const dm=(mesh,m)=>{gl.uniformMatrix4fv(G3.DP.u.uM,false,m);gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.n,gl.UNSIGNED_INT,0);};
  dm(map.mesh,M3.id());for(const d of D)if(!d[2].noShadow&&!d[2].add&&d[0]!==G3.fxDisc)dm(d[0],d[1]);
  // color pass (HDR)
  gl.bindFramebuffer(gl.FRAMEBUFFER,G3.hdrF);gl.viewport(0,0,G3.w,G3.h);const bg=hex3(TH.bg,.35);gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const P=G3.P,u=P.u;gl.useProgram(P.p);gl.uniformMatrix4fv(u.uVP,false,G3.VP);gl.uniformMatrix4fv(u.uLVP,false,LVP);gl.uniform3fv(u.uV,G3.V);gl.uniform3fv(u.uLDir,L);gl.uniform3fv(u.uLCol,TH.sun);gl.uniform3fv(u.uSky,TH.sky);gl.uniform3fv(u.uGnd,TH.gnd);gl.uniform3fv(u.uRim,TH.rim);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G3.smT);gl.uniform1i(u.uSh,0);gl.uniform1f(u.uShOn,1);
  const lp=[],lc=[],lr=[];for(const [p,c,r] of lights.slice(0,16)){lp.push(...p);lc.push(...c);lr.push(r);}gl.uniform1i(u.uNP,Math.min(16,lights.length));if(lp.length){gl.uniform3fv(u.uPP,lp);gl.uniform3fv(u.uPC,lc);gl.uniform1fv(u.uPR,lr);}
  const draw=(mesh,m,o)=>{gl.uniformMatrix4fv(u.uM,false,m);gl.uniformMatrix3fv(u.uNM,false,M3.nrm(m));gl.uniform1f(u.uSpec,o.spec!=null?o.spec:.25);gl.uniform1f(u.uShin,o.shin||24);
    const add=!!o.add;gl.uniform1f(u.uAdd,add?1:0);gl.uniform1f(u.uEmMul,1);gl.uniform1f(u.uAlpha,o.a!=null?Math.max(0,o.a):1);
    const cc=add?(o.em||o.col):o.col;gl.uniform3fv(u.uCol,cc||[1,1,1]);gl.uniform1f(u.uColK,cc?1:0);gl.uniform3fv(u.uEmAdd,(!add&&o.em)||[0,0,0]);
    gl.uniform3fv(u.uTint,o.tint||[0,0,0]);gl.uniform1f(u.uTintK,o.tk||0);gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.n,gl.UNSIGNED_INT,0);};
  draw(map.mesh,M3.id(),{spec:.12,shin:16});
  for(const d of D)if(!d[2].add)draw(d[0],d[1],d[2]);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);
  for(const d of D)if(d[2].add)draw(d[0],d[1],d[2]);
  for(const d of FX)draw(d[0],d[1],d[2]);
  gl.depthMask(true);gl.disable(gl.BLEND);
  // bloom + tone map to the screen
  gl.disable(gl.DEPTH_TEST);gl.bindVertexArray(G3.quad.vao);const q=()=>gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_INT,0);
  const pass=(prog,fbo,w,h,tex,set)=>{gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.viewport(0,0,w,h);gl.useProgram(prog.p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(prog.u.uT,0);if(set)set(prog.u);q();};
  const w2=G3.w>>1,h2=G3.h>>1,w4=G3.w>>2,h4=G3.h>>2;
  pass(G3.BR,G3.b1aF,w2,h2,G3.hdrT,u2=>gl.uniform1f(u2.uTh,1.1));pass(G3.BL,G3.b1bF,w2,h2,G3.b1a,u2=>gl.uniform2f(u2.uD,1.5/w2,0));pass(G3.BL,G3.b1aF,w2,h2,G3.b1b,u2=>gl.uniform2f(u2.uD,0,1.5/h2));
  pass(G3.BR,G3.b2aF,w4,h4,G3.b1a,u2=>gl.uniform1f(u2.uTh,0));pass(G3.BL,G3.b2bF,w4,h4,G3.b2a,u2=>gl.uniform2f(u2.uD,2/w4,0));pass(G3.BL,G3.b2aF,w4,h4,G3.b2b,u2=>gl.uniform2f(u2.uD,0,2/h4));
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,G3.w,G3.h);gl.useProgram(G3.CP.p);const cu=G3.CP.u;
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,G3.hdrT);gl.uniform1i(cu.uT,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,G3.b1a);gl.uniform1i(cu.uB1,1);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,G3.b2a);gl.uniform1i(cu.uB2,2);
  gl.uniform1f(cu.uExp,TH.exp);gl.uniform1f(cu.uBloom,ggFx&&ggFx.perf?.25:.55);q();gl.activeTexture(gl.TEXTURE0);
}
// ---- the 2D canvas keeps only labels on top: health bars, levels, numbers ----
function gg3dOverlay(){
  cx.setTransform(1,0,0,1,0,0);
  for(const e of G.en){if(e.hp<=0||e.leak)continue;const kind=e.boss?'boss':(e.kind||'normal'),m=G3.enemies[kind];const top=e.y+6-((m?m.h:22)+(m&&m.fly?22:2))*G3K-7;
    const pct=Math.max(0,Math.min(1,e.hp/e.mx));cx.fillStyle='#0b0f1c';cx.fillRect(e.x-13,top,26,4);cx.fillStyle=pct>.5?'#4ade80':pct>.25?'#facc15':'#f43f5e';cx.fillRect(e.x-13,top,26*pct,4);cx.strokeStyle='#0b0f1c';cx.lineWidth=1;cx.strokeRect(e.x-13,top,26,4);
    if(e.shield>0&&e.shMax){const p=Math.max(0,Math.min(1,e.shield/e.shMax));cx.fillStyle='#0b0f1c';cx.fillRect(e.x-13,top-5,26,3);cx.fillStyle='#67e8f9';cx.fillRect(e.x-13,top-5,26*p,3);}}
  for(const a of (G.allies||[])){const w=a.kind==='ghoul'?30:24,top=a.y-(a.kind==='ghoul'?30:22),p=Math.max(0,Math.min(1,a.life/a.maxLife));cx.fillStyle='#0b0f1c';cx.fillRect(a.x-w/2,top,w,4);cx.fillStyle=p>.35?'#2dd4bf':'#f59e0b';cx.fillRect(a.x-w/2,top,w*p,4);}
  for(const u of G.us){cx.fillStyle='#000c';cx.beginPath();cx.arc(u.x+15,u.y+16,8,0,7);cx.fill();cx.fillStyle='#fff';cx.font='bold 9px sans-serif';cx.textAlign='center';cx.fillText(u.pl,u.x+15,u.y+19);}
  if(S.settings.hpNumbers!==false){cx.save();cx.font='bold 9px system-ui,-apple-system,Segoe UI,sans-serif';cx.textAlign='center';cx.lineJoin='round';cx.lineWidth=2.6;cx.strokeStyle='rgba(5,8,18,.92)';
    for(const e of G.en){if(e.hp<=0||e.leak)continue;const kind=e.boss?'boss':(e.kind||'normal'),m=G3.enemies[kind];const y=e.y+6-((m?m.h:22)+(m&&m.fly?22:2))*G3K-(e.shield>0&&e.shMax?13:9);const txt=ggHpNum(e.hp)+'/'+ggHpNum(e.mx);
      cx.strokeText(txt,e.x,y);cx.fillStyle=e.boss?'#ffd6de':'#ffffff';cx.fillText(txt,e.x,y);}cx.restore();}
}
// Called at the start of the battle's draw(): draws the 3D scene and returns true, or false for the 2D art.
function gg3dDrawBase(){
  const on=gg3dActive();document.body.classList.toggle('gg3d-on',!!on&&!!G);if(!on)return false;
  cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,800,450);
  try{gg3dDraw();}catch(e){G3.failed=true;document.body.classList.remove('gg3d-on');try{console.warn('3D draw failed',e)}catch(x){}return false;}
  gg3dOverlay();
  // speed check: suggest 2D once if 3D is slow on this device
  const now=performance.now();G3.fpsN++;if(!G3.fpsT)G3.fpsT=now;if(now-G3.fpsT>6000){const fps=G3.fpsN*1000/(now-G3.fpsT);G3.fpsN=0;G3.fpsT=now;
    if(fps<24&&!G.paused&&document.visibilityState==='visible'){if(++G3.slow>=2&&!G3.hinted){G3.hinted=true;try{toast('🧊 3D graphics are running slowly on this device. You can switch to 2D in Settings → 3D graphics.');}catch(x){}}}else G3.slow=0;}
  return true;}
// Settings toggle (saved on this device)
(function(){const ref=$('#ggShakeToggle')?.closest('label.setting')||$('#ggPerf')?.closest('label.setting');if(!ref)return;
  ref.insertAdjacentHTML('beforebegin','<label class="setting"><span><b>🧊 3D graphics</b><small>Battles in full 3D: lit maps with shadows, 3D units, enemies and effects. Turn off for the classic 2D art or on slower phones. Saved on this device only.</small></span><input type="checkbox" id="gg3dToggle"></label>');
  const t=$('#gg3dToggle');t.checked=G3.on;t.onchange=()=>{G3.on=t.checked;try{localStorage.setItem(GG3D_KEY,t.checked?'1':'0')}catch(e){}if(t.checked&&G3.failed)toast('This device cannot show 3D graphics, so the 2D art stays on.');document.body.classList.toggle('gg3d-on',G3.on&&G3.ok&&!!G);try{paintIcons()}catch(e){}};})();
// ---- 3D outside battles: unit portraits on every card and the 3D summon crystal ----
function gg3dMini(canvas){try{const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:true,preserveDrawingBuffer:true});if(!gl)return null;
  const save=G3.gl;G3.gl=gl;const R={gl,P:gg3dProg(G3VS,G3FS),cache:new Map()};const dt=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,dt);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,1,1);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);R.dt=dt;R.up=g=>{const s=G3.gl;G3.gl=gl;const m=gg3dUpload(g);G3.gl=s;return m;};G3.gl=save;return R;}catch(e){return null;}}
function gg3dMiniDraw(R,items,VP,opt){const gl=R.gl,u=R.P.u;gl.viewport(0,0,gl.canvas.width,gl.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);
  gl.useProgram(R.P.p);gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uLVP,false,M3.id());gl.uniform3fv(u.uV,opt.v);gl.uniform3fv(u.uLDir,n3([-.5,.7,.6]));gl.uniform3fv(u.uLCol,[1.25,1.15,1.05]);
  gl.uniform3fv(u.uSky,opt.sky||[.45,.42,.6]);gl.uniform3fv(u.uGnd,[.08,.06,.12]);gl.uniform3fv(u.uRim,opt.rim||[.45,.35,.8]);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,R.dt);gl.uniform1i(u.uSh,0);gl.uniform1f(u.uShOn,0);gl.uniform1i(u.uNP,0);
  for(const [mesh,m,o] of items){const add=!!(o&&o.add);if(add){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);}
    gl.uniformMatrix4fv(u.uM,false,m);gl.uniformMatrix3fv(u.uNM,false,M3.nrm(m));gl.uniform1f(u.uSpec,.35);gl.uniform1f(u.uShin,30);gl.uniform1f(u.uAdd,add?1:0);gl.uniform1f(u.uEmMul,1);gl.uniform1f(u.uAlpha,o&&o.a!=null?o.a:1);
    const cc=o&&o.col;gl.uniform3fv(u.uCol,cc||[1,1,1]);gl.uniform1f(u.uColK,cc?1:0);gl.uniform3fv(u.uEmAdd,[0,0,0]);gl.uniform3fv(u.uTint,[0,0,0]);gl.uniform1f(u.uTintK,0);
    gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.n,gl.UNSIGNED_INT,0);if(add){gl.depthMask(true);gl.disable(gl.BLEND);}}}
// Portraits: a 3/4 view of the unit's 3D model, drawn once and kept.
const G3PORT={R:null,c:null,img:{}};
function gg3dPortrait(id){if(G3PORT.img[id])return G3PORT.img[id];if(!G3PORT.R){G3PORT.c=document.createElement('canvas');G3PORT.c.width=288;G3PORT.c.height=256;G3PORT.R=gg3dMini(G3PORT.c);if(!G3PORT.R)return null;}
  const R=G3PORT.R;let b;try{b=gg3dUnitModel(id);}catch(e){return null;}const mesh=R.up(b.g);const h=b.h;
  const V=M3.look([16,24,70],[0,h*.55,0],[0,1,0]),half=Math.max(28,h*.8);const VP=M3.mul(M3.ortho(-half*1.125,half*1.125,-half,half,1,400),V);
  const items=[[mesh,M3.RY(-.12),{}]];if(b.aura){const ring=R.up(gRing(.82,1,40));items.push([ring,M3.S(15,1,15),{add:1,col:b.aura,a:.8}]);}
  gg3dMiniDraw(R,items,VP,{v:n3([16,24,70]),sky:[.75,.7,.9],rim:[.9,.7,1.3]});const out=document.createElement('canvas');out.width=288;out.height=256;out.getContext('2d').drawImage(G3PORT.c,0,0);
  const gl=R.gl;gl.deleteVertexArray(mesh.vao);G3PORT.img[id]=out;return out;}
(function(){const o=paintIcons;paintIcons=function(){const r=o.apply(this,arguments);if(!(G3.on&&!G3.failed))return r;
  try{document.querySelectorAll('canvas.ico').forEach(k=>{if(k.dataset.item||!k.dataset.id||!UNITS[k.dataset.id])return;const im=gg3dPortrait(k.dataset.id);if(!im)return;
    if(k.width===72&&k.height===64){k.width=288;k.height=256;}const c=k.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,k.width,k.height);c.drawImage(im,0,0,k.width,k.height);});}catch(e){}return r;};})();
// The summon altar crystal in 3D: a faceted gem that turns and floats, with orbiting sparks.
(function(){if(!document.querySelector('.altar-art'))return;const c=document.createElement('canvas');c.className='gg3d-altar';c.width=360;c.height=380;c.setAttribute('aria-hidden','true');
  let R=null,gem=null,ring=null,spark=null,t0=performance.now(),last=0;
  function frame(now){requestAnimationFrame(frame);const host=document.querySelector('.altar-art');if(host&&c.parentElement!==host)host.appendChild(c);const on=!!host&&G3.on&&!G3.failed&&host.offsetParent!==null&&document.visibilityState==='visible';document.body.classList.toggle('gg3d-altar-on',on&&!!R);if(!on)return;if(now-last<33)return;last=now;
    if(!R){R=gg3dMini(c);if(!R){G3.failed=true;return;}
      const g=gMerge([[gCyl(0,13,26,6,false),M3.T(0,0,0),hex3('#bff4ff'),hex3('#5fd8ff',.35)],[gCyl(13,0,12,6,false),M3.T(0,-12,0),hex3('#7fdcff'),hex3('#3fb8ff',.35)],[gCyl(0,6,12,6,false),M3.ch(M3.T(0,2,0),M3.RY(.52)),hex3('#ffffff'),hex3('#bff4ff',.6)]]);
      gem=R.up(g);ring=R.up(gRing(.9,1,48));spark=R.up(gSph(1,8,6));}
    const t=(now-t0)/1000,V=M3.look([0,22,90],[0,4,0],[0,1,0]),VP=M3.mul(M3.ortho(-30,30,-31.7,31.7,1,300),V);
    const items=[[gem,M3.ch(M3.T(0,4+Math.sin(t*1.6)*2.2,0),M3.RY(t*.9),M3.S(1.15,1.15,1.15)),{}],[ring,M3.ch(M3.T(0,-14,0),M3.RX(.08),M3.S(17+Math.sin(t*2)*1.5,1,17+Math.sin(t*2)*1.5)),{add:1,col:hex3('#7fe3ff',1.4),a:.7}]];
    for(let k=0;k<5;k++){const a=t*1.3+k*1.257;items.push([spark,M3.ch(M3.T(Math.cos(a)*20,4+Math.sin(t*2+k)*6,Math.sin(a)*20),M3.S(.9,.9,.9)),{add:1,col:hex3(k%2?'#ffffff':'#9ff0ff',2),a:1}]);}
    gg3dMiniDraw(R,items,VP,{v:n3([0,22,90]),rim:[.3,.6,.9]});}
  requestAnimationFrame(frame);})();
try{setTimeout(()=>{try{paintIcons()}catch(e){}},0)}catch(e){}
