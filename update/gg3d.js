// ---------- 3D graphics (2026.10.11.40, detail pass 2026.10.11.41, characters 2026.10.11.42) ----------
// Battles are drawn by a small built-in WebGL2 3D renderer (no libraries, works offline): every map is a
// lit 3D scene (terrain, road, props, entrance and gem castle) with shadows, glow and bloom; every unit,
// enemy and summon is a 3D model built from its look; shots and hits are glowing 3D effects. The camera
// keeps the ground exactly where the 2D map was, so taps, ranges, health bars and numbers line up.
// Settings -> 3D graphics switches back to the classic 2D art at any time (saved on this device).
const GG3D_KEY='gemGuardians3D';
const GG3D_CAM_KEY='gemGuardians3DCam';
const G3={cam:'close',on:true,ok:false,failed:false,gl:null,cv:null,maps:{},units:{},enemies:{},w:0,h:0,last:0,fpsN:0,fpsT:0,slow:0,hinted:false};
try{if(localStorage.getItem(GG3D_KEY)==='0')G3.on=false;const c=localStorage.getItem(GG3D_CAM_KEY);if(c==='cine'||c==='close'||c==='top')G3.cam=c;}catch(e){}
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
  persp(f,a,n,fa){const t=1/Math.tan(f/2);return [t/a,0,0,0,0,t,0,0,0,0,(fa+n)/(n-fa),-1,0,0,2*fa*n/(n-fa),0];},
  inv(m){const i=new Array(16);
    i[0]=m[5]*m[10]*m[15]-m[5]*m[11]*m[14]-m[9]*m[6]*m[15]+m[9]*m[7]*m[14]+m[13]*m[6]*m[11]-m[13]*m[7]*m[10];i[4]=-m[4]*m[10]*m[15]+m[4]*m[11]*m[14]+m[8]*m[6]*m[15]-m[8]*m[7]*m[14]-m[12]*m[6]*m[11]+m[12]*m[7]*m[10];
    i[8]=m[4]*m[9]*m[15]-m[4]*m[11]*m[13]-m[8]*m[5]*m[15]+m[8]*m[7]*m[13]+m[12]*m[5]*m[11]-m[12]*m[7]*m[9];i[12]=-m[4]*m[9]*m[14]+m[4]*m[10]*m[13]+m[8]*m[5]*m[14]-m[8]*m[6]*m[13]-m[12]*m[5]*m[10]+m[12]*m[6]*m[9];
    i[1]=-m[1]*m[10]*m[15]+m[1]*m[11]*m[14]+m[9]*m[2]*m[15]-m[9]*m[3]*m[14]-m[13]*m[2]*m[11]+m[13]*m[3]*m[10];i[5]=m[0]*m[10]*m[15]-m[0]*m[11]*m[14]-m[8]*m[2]*m[15]+m[8]*m[3]*m[14]+m[12]*m[2]*m[11]-m[12]*m[3]*m[10];
    i[9]=-m[0]*m[9]*m[15]+m[0]*m[11]*m[13]+m[8]*m[1]*m[15]-m[8]*m[3]*m[13]-m[12]*m[1]*m[11]+m[12]*m[3]*m[9];i[13]=m[0]*m[9]*m[14]-m[0]*m[10]*m[13]-m[8]*m[1]*m[14]+m[8]*m[2]*m[13]+m[12]*m[1]*m[10]-m[12]*m[2]*m[9];
    i[2]=m[1]*m[6]*m[15]-m[1]*m[7]*m[14]-m[5]*m[2]*m[15]+m[5]*m[3]*m[14]+m[13]*m[2]*m[7]-m[13]*m[3]*m[6];i[6]=-m[0]*m[6]*m[15]+m[0]*m[7]*m[14]+m[4]*m[2]*m[15]-m[4]*m[3]*m[14]-m[12]*m[2]*m[7]+m[12]*m[3]*m[6];
    i[10]=m[0]*m[5]*m[15]-m[0]*m[7]*m[13]-m[4]*m[1]*m[15]+m[4]*m[3]*m[13]+m[12]*m[1]*m[7]-m[12]*m[3]*m[5];i[14]=-m[0]*m[5]*m[14]+m[0]*m[6]*m[13]+m[4]*m[1]*m[14]-m[4]*m[2]*m[13]-m[12]*m[1]*m[6]+m[12]*m[2]*m[5];
    i[3]=-m[1]*m[6]*m[11]+m[1]*m[7]*m[10]+m[5]*m[2]*m[11]-m[5]*m[3]*m[10]-m[9]*m[2]*m[7]+m[9]*m[3]*m[6];i[7]=m[0]*m[6]*m[11]-m[0]*m[7]*m[10]-m[4]*m[2]*m[11]+m[4]*m[3]*m[10]+m[8]*m[2]*m[7]-m[8]*m[3]*m[6];
    i[11]=-m[0]*m[5]*m[11]+m[0]*m[7]*m[9]+m[4]*m[1]*m[11]-m[4]*m[3]*m[9]-m[8]*m[1]*m[7]+m[8]*m[3]*m[5];i[15]=m[0]*m[5]*m[10]-m[0]*m[6]*m[9]-m[4]*m[1]*m[10]+m[4]*m[2]*m[9]+m[8]*m[1]*m[6]-m[8]*m[2]*m[5];
    const d=m[0]*i[0]+m[1]*i[4]+m[2]*i[8]+m[3]*i[12]||1;return i.map(v=>v/d);},
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
uniform vec3 uEye,uFog;uniform float uPersp,uFogD;
uniform vec3 uV,uLDir,uLCol,uSky,uGnd,uRim,uTint,uCol,uEmAdd;uniform float uSpec,uShin,uEmMul,uTintK,uColK,uAlpha,uAdd,uShOn;
uniform sampler2DShadow uSh;uniform int uNP;uniform vec3 uPP[16],uPC[16];uniform float uPR[16];
float sh(){if(uShOn<.5)return 1.;vec3 c=vL.xyz/vL.w*.5+.5;if(c.x<0.||c.x>1.||c.y<0.||c.y>1.||c.z>1.)return 1.;vec2 t=1./vec2(textureSize(uSh,0));float s=0.;
  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)s+=texture(uSh,vec3(c.xy+vec2(x,y)*t*1.2,c.z-.0012));return s/9.;}
void main(){
  vec3 base=mix(vC,uCol,uColK);
  float fg=0.;if(uFogD>0.){float fd=length(uEye-vW);fg=clamp(1.-exp(-pow(fd*uFogD,1.6)),0.,1.);}
  if(uAdd>.5){o=vec4((base+vE)*uEmMul*uAlpha*(1.-fg),1.);return;}
  vec3 VV=uPersp>.5?normalize(uEye-vW):uV;
  vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;base=mix(base,uTint,uTintK);
  vec3 col=base*mix(uGnd,uSky,N.y*.5+.5);float nd=max(dot(N,uLDir),0.);float s=sh();vec3 H=normalize(uLDir+VV);
  col+=base*uLCol*nd*s+uLCol*pow(max(dot(N,H),0.),uShin)*uSpec*s;
  for(int i=0;i<16;i++){if(i>=uNP)break;vec3 d=uPP[i]-vW;float l=length(d);vec3 L=d/l;float a=pow(clamp(1.-pow(l/uPR[i],4.),0.,1.),2.)/(1.+l*l*.0009);
    col+=uPC[i]*a*base*max(dot(N,L),0.);}
  col+=uRim*pow(1.-max(dot(N,VV),0.),3.)*(base*1.6+.07);col+=vE*uEmMul+uEmAdd+uTint*uTintK*.15;col=mix(col,uFog,fg);o=vec4(col,uAlpha);}`;
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
const G3SKY=`#version 300 es
precision highp float;in vec2 vUV;out vec4 o;uniform mat4 uIVP;uniform vec3 uTop,uBot,uGlow;
void main(){vec4 a=uIVP*vec4(vUV*2.-1.,1.,1.);vec4 b=uIVP*vec4(vUV*2.-1.,-1.,1.);vec3 d=normalize(a.xyz/a.w-b.xyz/b.w);float t=clamp(d.y*2.2+.08,0.,1.);
  vec3 c=mix(uBot,uTop,sqrt(t))+uGlow*pow(1.-abs(d.y),18.)*.6;float st=fract(sin(dot(floor(d.xz/(d.y+.25)*260.),vec2(12.9898,78.233)))*43758.5453);c+=vec3(1.,.95,1.)*step(.9982,st)*smoothstep(.04,.3,d.y)*1.4;o=vec4(c,1.);}`;
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
    G3.P=gg3dProg(G3VS,G3FS);G3.DP=gg3dProg(G3DVS,G3DFS);G3.BR=gg3dProg(G3QVS,G3BR);G3.BL=gg3dProg(G3QVS,G3BL);G3.CP=gg3dProg(G3QVS,G3CP);G3.SKY=gg3dProg(G3QVS,G3SKY);
    G3.quad=gg3dUpload({p:[-1,-1,0,1,-1,0,1,1,0,-1,1,0],n:new Array(12).fill(0),c:new Array(12).fill(1),e:new Array(12).fill(0),i:[0,1,2,0,2,3]});
    G3.SMS=2048;G3.smT=gg3dTex(G3.SMS,G3.SMS,true);gl.bindTexture(gl.TEXTURE_2D,G3.smT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL);
    G3.smF=gg3dFbo(null,G3.smT);
    // shared effect meshes
    G3.fxSph=gg3dUpload(gSph(1,12,8));G3.fxRing=gg3dUpload(gRing(.82,1,40));G3.fxDisc=gg3dUpload(gDisc(1,32));G3.fxBox=gg3dUpload(gBox(1,1,1));
    G3.ok=true;return true;
  }catch(e){G3.failed=true;try{console.warn('3D graphics unavailable:',e.message)}catch(x){}return false;}}
// ---- camera ----
// 'top' keeps the classic view (ground exactly where the 2D map was). 'cine' and 'close' are real perspective
// cameras placed so the whole battlefield always fits on screen; taps, labels and menus are mapped through them.
const G3K=.7,G3S=.819,G3C=.574;
G3.VPtop=[1/400,0,0,0, 0,G3K/225,-2*G3S/1500,0, 0,-1/225,-2*G3C/1500,0, -1,1,1-2*300/1500,1];
G3.VP=G3.VPtop;G3.V=n3([0,G3S,G3C]);
const G3CAMS={cine:{pitch:28,fov:62,tz:-30,d:805,uscale:1.75,escale:1.6},close:{pitch:52,fov:46,tz:165,d:715,uscale:1.6,escale:1.45}};
function gg3dCamera(){const k=G3.cam in G3CAMS?G3.cam:'top';if(G3.camK===k&&G3.camVP)return G3.camVP;
  if(k==='top'){G3.camVP={k,persp:false,VP:G3.VPtop,IVP:M3.inv(G3.VPtop),eye:[400,1500*G3S,225+1500*G3C],uscale:1,escale:1};}
  else{const c=G3CAMS[k],p=c.pitch*Math.PI/180,eye=[400,c.d*Math.sin(p),c.tz+c.d*Math.cos(p)];const VP=M3.mul(M3.persp(c.fov*Math.PI/180,16/9,8,7000),M3.look(eye,[400,0,c.tz],[0,1,0]));
    G3.camVP={k,persp:true,VP,IVP:M3.inv(VP),eye,uscale:c.uscale,escale:c.escale};}
  G3.camK=k;return G3.camVP;}
function gg3dPersp(){return G3.on&&G3.ok&&!G3.failed&&G3.cam!=='top'&&document.body.classList.contains('gg3d-on');}
// world (x on the map, height, y on the map) -> battle canvas pixels (800x450)
function gg3dProj(x,h,y){const m=gg3dCamera().VP;const X=m[0]*x+m[4]*h+m[8]*y+m[12],Y=m[1]*x+m[5]*h+m[9]*y+m[13],W=m[3]*x+m[7]*h+m[11]*y+m[15];return [(X/W+1)*400,(1-Y/W)*225,W];}
// battle canvas pixels -> point on the ground of the map
function gg3dUnproj(cx_,cy_){const I=gg3dCamera().IVP,nx=cx_/400-1,ny=1-cy_/225;const un=(z)=>{const x=I[0]*nx+I[4]*ny+I[8]*z+I[12],y=I[1]*nx+I[5]*ny+I[9]*z+I[13],zz=I[2]*nx+I[6]*ny+I[10]*z+I[14],w=I[3]*nx+I[7]*ny+I[11]*z+I[15];return [x/w,y/w,zz/w];};
  const a=un(-1),b=un(1),dy=b[1]-a[1];if(Math.abs(dy)<1e-6)return [cx_,cy_];const t=-a[1]/dy;return [a[0]+(b[0]-a[0])*t,a[2]+(b[2]-a[2])*t];}
// ---- themes: light and mood per map ----
const G3THEME={
 meadow:{sun:[1.15,1.02,.85],sky:[.3,.36,.46],gnd:[.1,.09,.06],dir:[-.45,.8,.4],bg:'#2a4a28',exp:1,rim:[.15,.15,.12],skyTop:'#3a6fb0',skyBot:'#bcd6e8',fog:'#9fb9c9',glow:'#ffe9b0'},
 crystal:{sun:[.95,.85,1.15],sky:[.42,.36,.6],gnd:[.12,.08,.16],dir:[-.4,.82,.4],bg:'#3d3550',exp:1.1,rim:[.25,.18,.4],skyTop:'#2a1f55',skyBot:'#8f7ac9',fog:'#6e5f99',glow:'#d9b8ff'},
 ember:{sun:[1.2,.75,.5],sky:[.4,.2,.18],gnd:[.16,.06,.04],dir:[-.5,.75,.4],bg:'#2e1a17',exp:1.1,rim:[.4,.12,.05],skyTop:'#1f0b0a',skyBot:'#a8452a',fog:'#6b2a1d',glow:'#ff8a40'},
 marsh:{sun:[.6,.75,.95],sky:[.2,.3,.38],gnd:[.06,.08,.08],dir:[-.4,.8,.45],bg:'#16302d',exp:1.25,rim:[.1,.25,.25],skyTop:'#0c1c22',skyBot:'#3f6b6a',fog:'#2f4f50',glow:'#9fe0c0'},
 desert:{sun:[1.4,1.2,.9],sky:[.55,.5,.5],gnd:[.25,.18,.1],dir:[-.5,.78,.35],bg:'#8a6a38',exp:1,rim:[.15,.12,.08],skyTop:'#4f86c6',skyBot:'#f2d49b',fog:'#d9bd8a',glow:'#fff1c0'},
 tundra:{sun:[1.1,1.15,1.3],sky:[.55,.62,.75],gnd:[.25,.28,.32],dir:[-.45,.8,.4],bg:'#a9c3d4',exp:.95,rim:[.15,.2,.28],skyTop:'#6f8fb5',skyBot:'#e6eef6',fog:'#c9d6e2',glow:'#ffffff'},
 jungle:{sun:[1,1.05,.75],sky:[.3,.42,.3],gnd:[.08,.12,.06],dir:[-.4,.8,.45],bg:'#1d3d20',exp:1.1,rim:[.12,.25,.1],skyTop:'#1c3a2a',skyBot:'#7fae7a',fog:'#4f7a55',glow:'#e9ffb0'},
 volcanic:{sun:[1.05,.6,.45],sky:[.32,.16,.16],gnd:[.12,.04,.03],dir:[-.45,.78,.4],bg:'#2a1a1b',exp:1.15,rim:[.4,.1,.05],skyTop:'#140808',skyBot:'#7a2418',fog:'#4a1a14',glow:'#ff6a20'},
 nebula:{sun:[.75,.7,1.2],sky:[.25,.22,.5],gnd:[.06,.04,.12],dir:[-.4,.8,.45],bg:'#15153a',exp:1.25,rim:[.3,.25,.6],skyTop:'#070720',skyBot:'#3a2a7a',fog:'#221a4a',glow:'#c9a8ff'},
 ruins:{sun:[1.25,1.1,.85],sky:[.45,.44,.42],gnd:[.16,.14,.1],dir:[-.5,.78,.38],bg:'#4e4c3c',exp:1.05,rim:[.15,.14,.1],skyTop:'#5a7aa0',skyBot:'#e2d6b0',fog:'#bdb08a',glow:'#fff0c0'},
 hive:{sun:[.85,.65,1.1],sky:[.3,.2,.42],gnd:[.08,.04,.1],dir:[-.4,.8,.45],bg:'#24163a',exp:1.2,rim:[.35,.15,.5],skyTop:'#10061e',skyBot:'#52306e',fog:'#2f1a44',glow:'#e879f9'},
 reef:{sun:[.9,1.1,1.2],sky:[.35,.55,.65],gnd:[.1,.18,.22],dir:[-.4,.82,.4],bg:'#1e5a62',exp:1.05,rim:[.1,.3,.35],skyTop:'#1d5f85',skyBot:'#9fe3e8',fog:'#5fb0bb',glow:'#e0ffff'},
 castle:{sun:[.62,.62,.98],sky:[.34,.28,.48],gnd:[.1,.07,.13],dir:[-.45,.8,.4],bg:'#1c1726',exp:1.2,rim:[.55,.35,.85],skyTop:'#0a0614',skyBot:'#3a1d40',fog:'#1f1226',glow:'#c06bd6'}
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
 deadtree:(r,P)=>{const s=.9+r()*.5,c=hex3('#3a2e2a');const br=(m,len,rad,d)=>{P.push([gCyl(rad*.6,rad,len,6),m,c]);if(d>2)return;const n=2+Math.floor(r()*2);
   for(let k=0;k<n;k++)br(M3.ch(m,M3.T(0,len*(.55+r()*.4),0),M3.RY(r()*6.28),M3.RZ(.45+r()*.5)),len*.64,rad*.6,d+1);};br(M3.RZ((r()-.5)*.2),26*s,3*s,0);},
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
 grave:(r,P)=>{const g=.85+r()*.3,c=[.36*g,.35*g,.43*g],tl=(r()-.5)*.22;if(r()<.62){P.push([gBox(13,16,3.4),M3.RZ(tl),c]);P.push([gCyl(6.5,6.5,3.4,16),M3.ch(M3.RZ(tl),M3.T(0,16,-1.7),M3.RX(Math.PI/2)),c]);P.push([gBox(8,1,.6),M3.ch(M3.RZ(tl),M3.T(0,12,1.8)),[.2,.19,.24]]);}
   else{P.push([gBox(3,22,3),M3.RZ(tl),c]);P.push([gBox(13,3,3),M3.ch(M3.RZ(tl),M3.T(0,14,0)),c]);}P.push([gBox(15,1.6,22),M3.T(0,0,11),[.2,.17,.16]]);},
 ironfence:(r,P)=>{const c=hex3('#1c1a26');for(let k=0;k<12;k++){P.push([gBox(1.4,18,1.4),M3.T(k*7-38,0,0),c]);P.push([gCyl(0,1.4,4,4),M3.T(k*7-38,18,0),c]);}P.push([gBox(80,1.2,1),M3.T(0,13,0),c]);P.push([gBox(80,1.2,1),M3.T(0,5,0),c]);},
 candle:(r,P)=>{P.push([gCyl(1,1,4+r()*3,6),M3.id(),g3c('#efe6d6')]);P.push([gSph(1,6,4),M3.T(0,7.5,0),g3c('#ffb24a'),g3c('#ff9a2a',3)]);},
 bat:(r,P)=>{P.push([gSph(1.6,6,4),M3.T(0,28+r()*10,0),g3c('#1a1426')]);},
 wall:(r,P)=>{P.push([gBox(60,22,8),M3.id(),g3c('#4a4258')]);for(let k=0;k<6;k++)P.push([gBox(6,5,8),M3.T(k*11-27,22,0),g3c('#4a4258')]);},
 fog:()=>{}
};
const G3OUT={lavariver:1,cliff:1,pyramid:1,planet:1,comet:1,wall:1,dune:1};
const G3BIG={ironfence:1,tree:1,cliff:1,palm:1,pyramid:1,pine:1,jtree:1,column:1,brokenwall:1,statue:1,wall:1,planet:1,comet:1,deadtree:1,lavariver:1,dune:1,boulder:1,cactus:1};
const G3EXTRA={castle:{ironfence:3,grave:12,deadtree:3},ruins:{grave:3},marsh:{deadtree:3}};
function g3PathDist(path,x,y){let b=1e9;for(let i=1;i<path.length;i++)b=Math.min(b,dSeg(x,y,path[i-1],path[i]));return b;}
function gg3dBuildMap(key,theme,path){
  const T=(typeof GGA!=='undefined'&&GGA.THEMES[theme])||{ground:['#6aa84f','#5b9a43','#7bb85a','#4f8a3b'],roadCol:'#cfa66a',edge:'#8a6a3e',props:{},road:'dirt',entrance:'cave'};
  const r=rng3(key.split('').reduce((a,c)=>a*31+c.charCodeAt(0),7)%100000+11);const P=[],gc=T.ground.map(c=>hex3(c));
  // ground: tiles with color variation (flat inside the battlefield, gentle hills beyond it)
  const grd=g3();
  const axis=(lo,hi,a,b)=>{const o=[];let v=lo;while(v<hi){o.push(v);const out=Math.max(0,a-v,v-b);v+=Math.min(160,18+out*.09);}o.push(hi);return o;};
  const XS=axis(-2200,3000,-60,860),ZS=axis(-3200,900,-60,510),NX=XS.length-1,NZ=ZS.length-1;
  const nz=(x,z)=>Math.sin(x*.011+1.3)*Math.cos(z*.009)+Math.sin(x*.023+z*.017)*.5+Math.sin(x*.047-z*.031)*.25;
  const sm=(x,z)=>Math.sin(x*.004+1.3)*Math.cos(z*.0035)+Math.sin(x*.0021+z*.0017)*.6;
  const hf=(x,z)=>{const out=Math.max(0,-x-20,x-820,-z-20,z-470);if(out<=0)return 0;const near=Math.min(1,out/260)*(sm(x,z)*.35+.65)*16;
    const far=Math.max(0,-z-900)/1600;return near+Math.min(1,far)*(nz(x*.25,z*.25)*.35+.8)*240+Math.min(1,Math.max(0,Math.abs(x-400)-1100)/1200)*110;};
  for(let j=0;j<=NZ;j++)for(let i=0;i<=NX;i++){const x=XS[i],z=ZS[j],y=hf(x,z),e=3,n=n3([hf(x-e,z)-hf(x+e,z),2*e,hf(x,z-e)-hf(x,z+e)]);
    const w1=Math.sin(x*.013+z*.007)*.5+.5,w2=Math.sin(x*.006-z*.011+2)*.5+.5,m=(.94+r()*.08)*(y>60?.8:1);
    const c0=gc[0],c1=gc[1%gc.length],c2=gc[2%gc.length],cc=[0,1,2].map(i=>(c0[i]*(1-w1)+c1[i]*w1)*(1-w2*.5)+c2[i]*w2*.5);v3(grd,[x,y,z],n,[cc[0]*m,cc[1]*m,cc[2]*m]);}
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
  for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),ang=Math.atan2(dz,dx),n=Math.floor(l/11);
    for(let k=0;k<=n;k++)for(const sd of [-1,1]){if(r()<.12)continue;const t=k/Math.max(1,n),px=a[0]+dx*t-Math.sin(ang)*sd*23,pz=a[1]+dz*t+Math.cos(ang)*sd*23,g=.8+r()*.3;
      P.push([gBox(8+r()*3,2.6+r()*1.6,6+r()*2),M3.ch(M3.T(px,0,pz),M3.RY(-ang+(r()-.5)*.6)),[ec[0]*g,ec[1]*g,ec[2]*g]]);}}
  const lamps=[];{let acc=0;for(let i=1;i<path.length&&lamps.length<5;i++){const a=path[i-1],b=path[i],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),ang=Math.atan2(dz,dx);
    for(let d0=60-acc;d0<l&&lamps.length<5;d0+=210){const sd=lamps.length%2?1:-1,px=a[0]+dx*d0/l-Math.sin(ang)*sd*36,pz=a[1]+dz*d0/l+Math.cos(ang)*sd*36;
      if(px<12||px>788||pz<12||pz>440)continue;lamps.push([px,pz]);const post=hex3('#1d1a24');
      P.push([gBox(2.6,36,2.6),M3.T(px,0,pz),post]);P.push([gBox(4.6,2,4.6),M3.T(px,0,pz),post]);P.push([gBox(9,1.6,1.6),M3.T(px+3.4,35,pz),post]);
      P.push([gBox(5.6,7,5.6),M3.T(px+7,26,pz),hex3('#ffe2a8'),hex3((G3THEME[theme]||{}).lamp||'#ffcf7a',3.2)]);P.push([gCyl(0,4.4,3,4),M3.ch(M3.T(px+7,33,pz),M3.RY(.78)),post]);}
    acc=(acc+l)%210;}}
  // props
  const PR=Object.assign({},T.props||{});for(const [k,v] of Object.entries(G3EXTRA[theme]||{}))PR[k]=(PR[k]||0)+v;
  for(const [name,cnt] of Object.entries(PR)){const fn=G3PROP[name];if(!fn)continue;const n=Math.min(80,Math.round(cnt*(cnt>40?.45:G3BIG[name]?1.2:1.8)));
    for(let k=0;k<n;k++){let x,z,ok=false;for(let tr=0;tr<30&&!ok;tr++){x=-140+r()*1080;z=-90+r()*600;const d=g3PathDist(path,x,z);
        const inside=x>-10&&x<810&&z>-10&&z<460;ok=d>(G3BIG[name]?60:34)&&!(G3OUT[name]&&inside)&&(!G3BIG[name]||!inside||r()<.25);}
      if(!ok)continue;const parts=[];fn(r,parts);const m0=M3.ch(M3.T(x,hf(x,z),z),M3.RY(name==='grave'||name==='ironfence'?(r()-.5)*.5:r()*6.28));for(const pt of parts)P.push([pt[0],M3.mul(m0,pt[1]),pt[2],pt[3]]);}}
  // enemy entrance and the gem castle (the base)
  const s0=path[0],s1=path[1],e0=path[path.length-1],e1=path[path.length-2],ea=Math.atan2(s1[1]-s0[1],s1[0]-s0[0]),ba=Math.atan2(e0[1]-e1[1],e0[0]-e1[0]);
  const ent=T.entrance||'cave',E=M3.ch(M3.T(s0[0]+Math.cos(ea)*14,0,s0[1]+Math.sin(ea)*14),M3.RY(-ea));const ep=[];
  if(ent==='gate'){for(const sd of [-1,1]){ep.push([gCyl(12,13,46,10),M3.T(0,0,sd*34),hex3('#4a4258')]);ep.push([gCyl(0,15,18,10),M3.T(0,46,sd*34),hex3('#3a1f3a')]);}ep.push([gBox(14,12,72),M3.T(0,36,0),hex3('#4a4258')]);ep.push([gBox(4,34,44),M3.T(-2,0,0),hex3('#120d18'),hex3('#3a0a1a',.6)]);}
  else if(ent==='portal'){ep.push([gRing(26,32,40),M3.ch(M3.T(0,30,0),M3.RZ(Math.PI/2)),hex3('#c9a8ff'),hex3('#a87aff',2.2)]);ep.push([gDisc(26,30),M3.ch(M3.T(0,30,0),M3.RZ(Math.PI/2)),hex3('#2a1a5a'),hex3('#6a3aff',.8)]);}
  else if(ent==='hive'){ep.push([gSph(36,14,10),M3.ch(M3.T(-10,0,0),M3.S(1,.8,1.2)),hex3('#4a2a6a')]);ep.push([gDisc(18,20),M3.ch(M3.T(14,18,0),M3.RZ(Math.PI/2)),hex3('#1a0d24'),hex3('#c084fc',.5)]);}
  else{ep.push([gSph(38,12,9),M3.ch(M3.T(-14,0,0),M3.S(1,.85,1.25)),hex3(T.edge||'#5d5470',.9)]);ep.push([gDisc(20,20),M3.ch(M3.T(18,20,0),M3.RZ(Math.PI/2),M3.S(1,1,1.2)),hex3('#05040a')]);}
  for(const pt of ep)P.push([pt[0],M3.mul(E,pt[1]),pt[2],pt[3]]);
  const B=M3.ch(M3.T(e0[0]-Math.cos(ba)*10,0,e0[1]-Math.sin(ba)*10),M3.RY(-ba));const bp=[],st=hex3('#9a93ad'),rf=hex3('#3b5bd6');
  bp.push([gBox(46,30,58),M3.T(18,0,0),st]);for(let k=0;k<6;k++)for(const sd of [-1,1])bp.push([gBox(5,5,4),M3.T(2+k*6.4,30,sd*27),st]);
  for(const [tx,tz,h] of [[0,-30,46],[0,30,46],[36,-30,52],[36,30,52]]){bp.push([gCyl(9,10,h,16),M3.T(tx,0,tz),st]);bp.push([gCyl(9.6,9.6,3,16),M3.T(tx,h-3,tz),hex3('#a9a2bd')]);
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;bp.push([gBox(3,4,3),M3.T(tx+Math.cos(a)*9,h,tz+Math.sin(a)*9),st]);}bp.push([gCyl(0,12,24,16),M3.T(tx,h+3,tz),rf]);
    bp.push([gBox(3,6,1),M3.T(tx-9.6,h*.62,tz),hex3('#ffd27a'),hex3('#ffb24a',2.6)]);}
  bp.push([gCyl(0,.6,10,4),M3.T(36,79,30),hex3('#2a1a12')]);bp.push([gBox(.6,6,9),M3.T(36,82,34.5),hex3('#e2453c')]);
  bp.push([gBox(4,22,22),M3.T(-5,0,0),hex3('#2a1a12')]);bp.push([gCyl(0,9,22,6),M3.T(18,30,0),hex3('#7defff'),hex3('#5fd8ff',2.4)]);bp.push([gCyl(9,0,14,6),M3.ch(M3.T(18,30,0),M3.RX(Math.PI)),hex3('#7defff'),hex3('#5fd8ff',2.4)]);
  for(const pt of bp)P.push([pt[0],M3.mul(B,pt[1]),pt[2],pt[3]]);
  const gem=[e0[0]-Math.cos(ba)*10+Math.cos(ba)*18,40,e0[1]-Math.sin(ba)*10+Math.sin(ba)*18];
  const LCOL=hex3((G3THEME[theme]||{}).lamp||'#ffcf7a',2.4);const lampLights=lamps.map(([x,z])=>[[x+7,26,z],LCOL,95]);
  // floating motes over the field
  const mote=[];const MC=hex3((G3THEME[theme]||{}).glow||'#fff1c2');for(let k=0;k<45;k++){const x=r()*820-10,z=r()*470-10,y=6+r()*70;mote.push([gSph(.8+r()*.9,4,3),M3.T(x,y,z),MC,MC]);}
  // the lamps, gem and entrance never move, so their light is baked into the map once (cheap on phones)
  const SL=[[gem,[.7,1.8,2.4],170],[[s0[0]+Math.cos(ea)*30,20,s0[1]+Math.sin(ea)*30],ent==='portal'?[3,1.5,5]:[1.2,.4,1.6],140],...lampLights];const G_=gMerge(P);
  for(let v=0;v<G_.p.length;v+=3){const px=G_.p[v],py=G_.p[v+1],pz=G_.p[v+2];if(px<-200||px>1000||pz<-200||pz>650)continue;
    for(const [lp,lc,lr] of SL){const dx=lp[0]-px,dy=lp[1]-py,dz=lp[2]-pz,d=Math.hypot(dx,dy,dz);if(d>=lr)continue;const q=1-Math.pow(d/lr,4),a=q*q/(1+d*d*.0009),nl=Math.max(0,(G_.n[v]*dx+G_.n[v+1]*dy+G_.n[v+2]*dz)/(d||1));
      for(let i=0;i<3;i++)G_.e[v+i]+=lc[i]*a*nl*G_.c[v+i]*.9;}}
  return {mesh:gg3dUpload(G_),motes:gg3dUpload(gMerge(mote)),moteCol:MC,lights:[],staticLights:SL,gem,emitters:[]};
}
// ---- unit models (built from each unit's 2D look) ----
// ---- character detail (2026.10.11.42): limbs between two points, partial lathes for capes, soft depth shading ----
function gLimb(a,b,ra,rb,seg){const d=s3(b,a),l=Math.hypot(d[0],d[1],d[2])||1,y=[d[0]/l,d[1]/l,d[2]/l];let x=n3(x3(Math.abs(y[1])>.9?[1,0,0]:[0,1,0],y));const z=x3(x,y);
  return gMerge([[gCyl(rb,ra,l,seg||10),[x[0],x[1],x[2],0,y[0],y[1],y[2],0,z[0],z[1],z[2],0,a[0],a[1],a[2],1]]]);}
function gLatheArc(prof,seg,a0,a1,jit){const g=g3(),rows=prof.length;
  for(let j=0;j<rows;j++){const [r,y]=prof[j],a=prof[Math.max(0,j-1)],b=prof[Math.min(rows-1,j+1)],dr=b[0]-a[0],dy=b[1]-a[1];
    for(let s=0;s<=seg;s++){const t=a0+(a1-a0)*s/seg,rr=r*(1+(jit?jit(t,j):0)),l=Math.hypot(dy,dr)||1;v3(g,[Math.cos(t)*rr,y,Math.sin(t)*rr],[Math.cos(t)*dy/l,-dr/l,Math.sin(t)*dy/l]);}}
  for(let j=0;j<rows-1;j++)for(let s=0;s<seg;s++){const a=j*(seg+1)+s,b=a+seg+1;g.i.push(a,b,a+1,a+1,b,b+1);}return g;}
// darker toward the feet and in the lower body: reads as depth (ambient occlusion)
function gShade(g,y0,y1,k){for(let v=0;v<g.p.length;v+=3){const y=g.p[v+1],t=Math.max(0,Math.min(1,(y-y0)/(y1-y0))),f=(1-k)+k*(t*t*(3-2*t));g.c[v]*=f;g.c[v+1]*=f;g.c[v+2]*=f;}return g;}
const G3HI={Legendary:1,Mythic:2,Secret:3,Exclusive:2};
function gg3dUnitModel(id){
  if(id==='abyss_summoner')return gg3dAbyss();
  const L=(typeof GGA!=='undefined'&&GGA.LOOKS&&GGA.LOOKS[id])||{},U=UNITS[id]||{},P=[],c=(h,k)=>hex3(h,k),col=U.col||'#94a3b8';
  if(L.beast)return gg3dBeast(L,id);
  const tier=G3HI[U.r]||0,skin=c(L.skin||'#f6cfaa'),out=c(L.outfit||col),trim=c(L.trim||'#e9c46a'),slv=c(L.sleeve||L.outfit||col),pants=c(L.pants||'#4a4a5a'),boots=c(L.boots||'#2a2a30'),hair=c(L.hair||'#3a2a20'),metal=c(L.metal||'#c3ccd8');
  const body=L.body||'',robe=body==='robe'||body==='gown',heavy=body==='heavy',armor=heavy||body==='armor',w=heavy?1.18:armor?1.06:1;
  const tg=tier?c(L.trim||'#f2c84b',.12+tier*.1):null,auraC=L.aura||L.trim||'#ffffff';
  // legs and boots
  if(!robe)for(const sx of [-1,1]){const X=sx*3.4;
    P.push([gLathe([[3.3,0],[3.5,1.2],[3.1,3.6],[3.2,5.4]],14),M3.T(X,0,0),boots]);P.push([gSph(3,12,8),M3.ch(M3.T(X,1.4,2.3),M3.S(1,.55,1.5)),boots]);
    P.push([gCyl(3.55,3.55,1,14),M3.T(X,4.7,0),trim,tg]);
    P.push([gLimb([X,5,0],[X,9.6,.3],2.5,2.9,12),M3.id(),pants]);P.push([gLimb([X*1.02,9.2,.3],[X*1.06,13.4,0],2.9,3.4,12),M3.id(),pants]);
    if(armor)P.push([gSph(2.1,10,8),M3.ch(M3.T(X,9.5,2.5),M3.S(1,1,.6)),metal]);}
  // torso, robe or gown
  if(robe){P.push([gLathe([[11.6,0],[11.2,2.5],[9.8,8],[8.2,13],[7.2*w,17],[7.5*w,20],[7.9*w,22],[7*w,23.6],[3.4,24.6]],32,(t,j)=>j<3?Math.sin(t*8)*.05*(3-j)/3:0),M3.id(),out]);
    P.push([gCyl(11.8,11.9,1.4,32),M3.T(0,.2,0),trim,tg]);P.push([gLathe([[8.6,8.2],[8.9,9.2]],32),M3.id(),trim,tg]);
    if(body==='gown')P.push([gLathe([[9.2,6],[8.6,9],[7.6,13]],28,(t,j)=>j<1?Math.sin(t*6)*.06:0),M3.T(0,.01,0),slv]);}
  else{P.push([gLathe([[6.9*w,12],[7.4*w,13.6],[7.1*w,16],[7.7*w,19],[8.1*w,21.6],[7.3*w,23.5],[3.4,24.6]],24),M3.id(),out]);
    P.push([gLathe([[7.2*w,13],[7.9*w,11.2],[8*w,9.8]],24,(t,j)=>j===2?Math.sin(t*6)*.04:0),M3.id(),out]);P.push([gCyl(8.15*w,8.15*w,.9,24),M3.T(0,9.5,0),trim,tg]);}
  if(L.tabard)P.push([gBox(6.2,12,.7),M3.T(0,9.8,7.6*w),c(L.tabard)]),P.push([gBox(6.6,.8,.8),M3.T(0,21.4,7.7*w),trim,tg]);
  // belt, buckle, chest emblem, collar, neck
  const by=robe?12.6:12.4;P.push([gCyl(7.6*w,7.6*w,1.8,24),M3.T(0,by,0),c(L.belt||'#4a3020')]);P.push([gBox(2.8,2.4,.9),M3.T(0,by-.3,7.6*w),c('#e9c46a'),tier?c('#ffd27a',.3):null]);
  if(tier)P.push([gCyl(0,1.5,1.8,4),M3.ch(M3.T(0,19.4,8*w),M3.RX(Math.PI/2),M3.RY(.78)),c(auraC),c(auraC,1.4+tier*.4)]);
  else if(L.emblem)P.push([gSph(1.3,8,6),M3.ch(M3.T(0,19.4,7.9*w),M3.S(1,1,.4)),c(L.emblem)]);
  P.push([gLathe([[4.6,23.2],[5.5,24.5],[4.4,25.7]],20),M3.id(),c(L.collar||L.trim||'#e9c46a'),tg]);
  P.push([gCyl(2.4,2.7,3,12),M3.T(0,23.6,0),skin]);
  // shoulders: armour plates or a mantle
  if(armor)for(const sx of [-1,1]){P.push([gSph(4.6,16,10),M3.ch(M3.T(sx*7.9*w,22.2,0),M3.S(1,.72,1.08)),metal]);P.push([gSph(4.9,16,8),M3.ch(M3.T(sx*7.9*w,20.9,0),M3.S(1,.26,1.1)),trim,tg]);}
  else if(robe||tier)P.push([gLathe([[9*w,20.6],[8.6*w,22.4],[5.2,24.4]],24),M3.id(),slv]),P.push([gCyl(9.1*w,9.1*w,.8,24),M3.T(0,20.4,0),trim,tg]);
  // arms: shoulder -> elbow -> wrist, cuff and hand (weapon hand on the right, off hand on the left)
  for(const sx of [-1,1]){const S=[sx*7.8*w,21.6,0],E=[sx*9.7*w,16,1.4],Wr=[sx*10.4*w,14.9,5.6],Hd=[sx*10.5*w,14.9,6.7];
    P.push([gSph(2.6,10,8),M3.T(S[0],S[1],S[2]),slv]);P.push([gLimb(S,E,2.6,2.3,12),M3.id(),slv]);P.push([gSph(2.3,10,8),M3.T(E[0],E[1],E[2]),slv]);P.push([gLimb(E,Wr,2.3,2.1,12),M3.id(),slv]);
    P.push([gLimb([Wr[0]-(Wr[0]-E[0])*.25,Wr[1]-(Wr[1]-E[1])*.25,Wr[2]-(Wr[2]-E[2])*.25],Wr,2.6,2.6,12),M3.id(),armor?metal:trim,tg]);
    P.push([gSph(1.8,10,8),M3.T(Hd[0],Hd[1],Hd[2]),c(L.glove||L.skin||'#f6cfaa')]);P.push([gSph(.75,6,4),M3.T(Hd[0]-sx*1.4,Hd[1]+1,Hd[2]+1.2),c(L.glove||L.skin||'#f6cfaa')]);}
  // head and face
  const H=M3.T(0,31.5,0),hf=(g,m,cc,e)=>P.push([g,M3.mul(H,m),cc,e]);const hatT=L.hat&&L.hat.type,hood=hatT==='hood'||hatT==='leafhood',helm=hatT==='helm'||hatT==='kabuto';
  hf(gSph(7.8,20,16),M3.S(1,1.04,1),skin);hf(gSph(5.2,14,10),M3.ch(M3.T(0,-3.4,2.2),M3.S(1,.8,1)),skin);
  if(!hood&&!helm&&L.ears!=='pointy')for(const sx of [-1,1])hf(gSph(1.7,8,6),M3.ch(M3.T(sx*7.5,-.4,0),M3.S(.5,1,.8)),skin);
  if(L.ears==='pointy')for(const sx of [-1,1])hf(gCyl(0,1.8,6,6),M3.ch(M3.T(sx*7.2,.6,0),M3.RZ(-sx*1.15)),skin);
  const eg=L.eyeGlow,ir=c(L.iris||'#3a2a20'),mood=L.mood||'';
  if(L.face==='visor'){hf(gBox(12.4,3.4,2),M3.T(0,-.6,7),c('#14141c'));hf(gBox(10,.9,.4),M3.T(0,.4,8),c(eg||'#ff4040'),c(eg||'#ff4040',3));}
  else if(hood){for(const sx of [-1,1])hf(gSph(1.6,8,6),M3.ch(M3.T(sx*3,.4,9.4),M3.S(1,1.25,.5)),c(eg||'#ffd27a'),c(eg||'#ffd27a',3));}
  else for(const sx of [-1,1]){const ex=sx*2.75;
    if(eg){hf(gSph(1.5,10,8),M3.ch(M3.T(ex,.3,6.9),M3.S(1,1.15,.5)),c('#14101c'));hf(gSph(1.05,10,8),M3.ch(M3.T(ex,.3,7.45),M3.S(1,1.2,.45)),c(eg),c(eg,2.6));}
    else{hf(gSph(1.6,12,8),M3.ch(M3.T(ex,.3,6.85),M3.S(1,1.18,.5)),c('#f8f6ff'));hf(gSph(1.08,10,8),M3.ch(M3.T(ex,.15,7.45),M3.S(1,1.2,.45)),ir);
      hf(gSph(.52,8,6),M3.T(ex,.15,7.86),c('#120c10'));hf(gSph(.33,6,4),M3.T(ex+.42,.85,7.98),c('#ffffff'),c('#ffffff',.9));}
    if(!L.eyepatch||sx<0)hf(gBox(2.9,.75,.8),M3.ch(M3.T(ex,2.7,7.1),M3.RZ(mood==='fierce'?sx*.32:mood==='calm'?-sx*.08:sx*.05)),L.hair?hair:c('#3a2a20'));}
  if(L.eyepatch)hf(gBox(3.6,3.2,.6),M3.T(2.75,.3,7.5),c('#1a1414'));
  if(!L.mask&&!L.snout&&L.face!=='visor'&&!hood){hf(gSph(.95,8,6),M3.ch(M3.T(0,-1.5,7.55),M3.S(1,1.1,1)),skin);
    const mc=c('#8a3446');if(mood==='happy'){for(const sx of [-1,1])hf(gBox(1.6,.5,.4),M3.ch(M3.T(sx*.75,-3.7,7.05),M3.RZ(sx*.35)),mc);}else hf(gBox(mood==='fierce'?2.2:2.6,.5,.4),M3.T(0,-3.6,7.1),mc);}
  if(L.blush)for(const sx of [-1,1])hf(gSph(1.3,8,6),M3.ch(M3.T(sx*4.3,-1.8,6.2),M3.S(1,.6,.3)),c('#f4a3b4'));
  if(L.mustache)for(const sx of [-1,1])hf(gSph(1.4,8,6),M3.ch(M3.T(sx*1.3,-2.6,7.3),M3.S(1.3,.55,.6)),c(L.beardCol||L.hair||'#5a3a22'));
  if(L.mask)hf(gBox(13,4.8,2),M3.T(0,-4.4,6.6),c(L.mask));
  if(L.beard)hf(gSph(5.6,12,8),M3.ch(M3.T(0,-5.4,4.4),M3.S(1,L.beard==='goatee'?.62:1,.7)),c(L.beardCol||L.hair||'#5a3a22'));
  if(L.snout)hf(gSph(4.6,10,8),M3.ch(M3.T(0,-1.6,6.8),M3.S(1,.7,1)),skin);
  if(L.frill)for(const sx of [-1,1])hf(gBox(.8,8,6),M3.ch(M3.T(sx*8.4,2,-2),M3.RY(sx*.4)),c(L.frill));
  // hair: cap, fringe, side locks and the style
  const hs=L.hairStyle||'';if(hs!=='bald'&&!(L.hat&&['hood','helm','kabuto','leafhood','starhood'].includes(hatT))){
    hf(gLathe([[8.25,-.6],[8.2,2.6],[6.9,5.8],[4.2,7.8],[0,8.6]],18),M3.T(0,.4,-.6),hair);
    for(let k=-2;k<=2;k++)hf(gSph(2,10,6),M3.ch(M3.T(k*2.3,4.9-Math.abs(k)*.55,6.1-Math.abs(k)*1),M3.RZ(k*.18),M3.S(1,1.5,.75)),hair);
    for(const sx of [-1,1])hf(gSph(2.1,10,6),M3.ch(M3.T(sx*7,-1.4,1.2),M3.S(.75,2.2,1)),hair);
    if(hs==='long'){hf(gLatheArc([[8.6,2],[9,-6],[8.4,-14],[7.6,-19]],16,Math.PI*1.08,Math.PI*1.92,(t,j)=>Math.sin(t*9)*.03),M3.T(0,0,.4),hair);for(const sx of [-1,1])hf(gLimb([sx*6.6,-3,2],[sx*7.4,-15,2.6],2.1,1.4,8),M3.id(),hair);}
    if(hs==='swept')for(let k=0;k<5;k++)hf(gCyl(0,2.4,7.5,6),M3.ch(M3.T((k-2)*2.6,5.6,-1.6),M3.RX(-1.15),M3.RZ((k-2)*.12)),hair);
    if(hs==='bun')hf(gSph(3.4,10,8),M3.T(0,7.8,-5),hair);
    if(hs==='spiky')for(let k=0;k<6;k++)hf(gCyl(0,2.5,6,5),M3.ch(M3.T((k-2.5)*2.6,6.4,-1),M3.RZ((k-2.5)*.38)),hair);}
  gg3dHat(L.hat,P,H);gg3dWeapon(L.weapon,P,w,col);gg3dOff(L.off,P,w);gg3dBack(L.back,P,w,trim,tg);
  // Mythic and Secret units: floating crystals that orbit them
  if(tier>=2)for(let k=0;k<3;k++){const a=k*2.09+.4,ac=c(auraC),ae=c(auraC,2.4);const m=M3.ch(M3.T(Math.cos(a)*15,18+k*7,Math.sin(a)*15-2),M3.RY(a));
    P.push([gCyl(0,1.5,2.6,4),m,ac,ae]);P.push([gCyl(1.5,0,2.2,4),M3.mul(m,M3.T(0,-2.2,0)),ac,ae]);}
  const aura=L.aura?c(L.aura):null;return {g:gShade(gMerge(P),0,18,.4),h:42,aura};}
function gg3dAbyss(){const P=[],S10=M3.S(10,10,10),A=(g,m,c,e)=>P.push([g,M3.mul(S10,m),c,e]);const robe=[.12,.07,.22],dark=[.08,.05,.13],trim=[.55,.06,.14],skin=[.75,.68,.9];
  A(gLathe([[1.05,0],[1,.25],[.86,1],[.68,1.8],[.52,2.4],[.44,2.75],[.3,2.95]],32,(t,j)=>j<4?Math.sin(t*9)*.045*(4-j)/4:0),M3.id(),robe);
  A(gRing(.98,1.07,48),M3.T(0,.06,0),trim,[2.5,.12,.35]);A(gCyl(.62,.66,.16,24),M3.T(0,1.55,0),[.18,.04,.08]);A(gBox(.18,.18,.06),M3.ch(M3.T(0,1.56,.64),M3.RZ(Math.PI/4)),[1,.2,.35],[4,.4,.8]);
  A(gLathe([[.82,2.35],[.75,2.6],[.5,2.85],[.3,2.95]],32),M3.id(),[.17,.09,.3]);for(let k=0;k<10;k++){const a=k/10*Math.PI*2;A(gCyl(0,.1,.32,6),M3.ch(M3.T(Math.cos(a)*.78,2.36,Math.sin(a)*.78),M3.RX(Math.PI)),dark);}
  A(gSph(.55,24,16),M3.ch(M3.T(0,3.25,0),M3.S(1,1.15,1)),[.16,.09,.3]);A(gSph(.42,20,12),M3.ch(M3.T(0,3.16,.3),M3.S(1,1.08,.62)),[.003,.002,.006]);A(gCyl(0,.32,.8,16),M3.ch(M3.T(0,3.7,-.12),M3.RX(-.55)),[.16,.09,.3]);
  for(const ex of [-.14,.14])A(gSph(.07,10,8),M3.ch(M3.T(ex,3.24,.56),M3.S(1.4,.6,.5)),[1,.2,.3],[6,.5,1]);for(const sx of [-1,1])A(gCyl(0,.12,.6,8),M3.ch(M3.T(sx*.38,3.6,0),M3.RZ(-sx*.55)),dark);
  for(const sx of [-1,1]){const sh=M3.ch(M3.T(sx*.62,2.6,.1),M3.RZ(-sx*.62),M3.RX(-.2));A(gCyl(.17,.24,1.25,12),sh,[.22,.12,.4]);const hand=M3.mul(sh,M3.T(0,1.3,0));A(gSph(.16,10,8),hand,skin);
    for(let f=-1;f<=1;f++)A(gCyl(0,.05,.32,6),M3.ch(hand,M3.RZ(f*.4),M3.T(0,.12,0)),skin);const oc=sx<0?[1,.15,.3]:[.6,.25,1];A(gSph(.3,16,12),M3.T(sx*1.55,4.15,.2),oc,sx<0?[4.5,.5,1]:[2,.8,5]);}
  return {g:gMerge(P),h:44,aura:hex3('#ff2a6a')};}
function gg3dHat(h,P,H){if(!h)return;const c=(x,k)=>hex3(x,k),hc=c(h.col||'#5a3a8a'),t=h.type;const at=(g,m,cc,e)=>P.push([g,M3.mul(H,m),cc,e]);
  if(t==='wizard'||t==='witch'||t==='starhood'){at(gCyl(11,11,1.2,24),M3.T(0,5.4,0),hc);at(gCyl(5.4,7.6,9,20),M3.ch(M3.T(0,6,0),M3.RX(-.1)),hc);at(gCyl(0,5.4,9,16),M3.ch(M3.T(0,14.6,-1),M3.RX(-.42)),hc);
    at(gCyl(7.7,7.7,1.6,20),M3.T(0,6.2,0),c(h.band||'#e9c46a'));if(t==='starhood'||t==='wizard')at(gSph(1.4,8,6),M3.T(0,8.6,-7.3+.2),c('#fff7c2'),c('#ffe27a',2));}
  else if(t==='hood'||t==='leafhood'){at(gSph(10,18,12),M3.ch(M3.T(0,1.4,-1.2),M3.S(1,1.05,1)),hc);at(gSph(8.2,14,10),M3.T(0,0,3.2),c('#050308'));
    at(gLathe([[8.9,-6],[9.3,-4]],24),M3.ch(M3.T(0,0,3.4),M3.RX(Math.PI/2.2)),c(h.col||'#5a3a8a',1.4));
    if(h.horns)for(const sx of [-1,1]){at(gLimb([sx*5.5,6,0],[sx*8.6,11,-1],2.2,1.2,8),M3.id(),c(h.horns));at(gLimb([sx*8.6,11,-1],[sx*8.4,15,-3],1.2,0.1,8),M3.id(),c(h.horns));}
    if(t==='leafhood')for(let k=0;k<5;k++)at(gBox(3,.4,6),M3.ch(M3.T((k-2)*3.4,8.2,-1),M3.RX(-.5),M3.RZ((k-2)*.3)),c('#4f9a43'));}
  else if(t==='helm'||t==='kabuto'){at(gLathe([[9.4,-2.4],[9.7,2],[8.2,6.6],[4.8,9.2],[0,10]],20),M3.id(),hc);at(gCyl(9.9,9.9,1.2,24),M3.T(0,-2.2,0),c(h.col||'#888',1.25));
    at(gBox(1.4,3,12),M3.T(0,8.6,-.5),c(h.col||'#888',1.2));for(const sx of [-1,1])at(gBox(1.4,6,5.6),M3.ch(M3.T(sx*8.6,-4,3.4),M3.RY(sx*.35)),hc);
    if(h.plume)for(let k=0;k<4;k++)at(gBox(1.8,7-k,4),M3.ch(M3.T(0,10+k*.6,-2-k*2.6),M3.RX(-.5-k*.25)),c(h.plume));
    if(h.horns||t==='kabuto')for(const sx of [-1,1]){at(gLimb([sx*6.6,5,1],[sx*10.4,9.6,1.6],1.9,1.1,8),M3.id(),c(h.horns||'#f2c84b'));at(gLimb([sx*10.4,9.6,1.6],[sx*10.6,14,1],1.1,0.1,8),M3.id(),c(h.horns||'#f2c84b'));}}
  else if(t==='crown'||t==='circlet'||t==='laurel'){const gem=c(h.gem||'#ff5c7a'),ge=c(h.gem||'#ff5c7a',1.8);
    if(t==='crown'){at(gCyl(7.2,7.8,3.4,24),M3.T(0,6,0),hc);at(gCyl(7.9,7.9,.8,24),M3.T(0,6,0),c(h.col||'#f2c84b',1.3));for(let k=0;k<6;k++){const a=k*1.047;at(gCyl(0,1.6,4.6,4),M3.T(Math.cos(a)*7.2,9.4,Math.sin(a)*7.2),hc);at(gSph(.75,6,4),M3.T(Math.cos(a)*7.2,14.2,Math.sin(a)*7.2),gem,ge);}at(gSph(1.5,8,6),M3.ch(M3.T(0,7.6,7.6),M3.S(1,1,.5)),gem,ge);}
    else if(t==='laurel'){for(let k=0;k<12;k++){const a=k*.52;at(gBox(2.4,.4,1.2),M3.ch(M3.T(Math.cos(a)*8.1,5+Math.sin(k)*.4,Math.sin(a)*8.1),M3.RY(-a),M3.RZ(.5)),c('#6aa84f'));}}
    else{at(gCyl(8,8,1.4,24),M3.T(0,4.4,0),hc);at(gCyl(0,1.5,2.4,4),M3.ch(M3.T(0,6.4,7.8),M3.RY(.78)),gem,ge);at(gCyl(1.5,0,1.8,4),M3.ch(M3.T(0,4.6,7.8),M3.RY(.78)),gem,ge);}}
  else if(t==='halo'){at(gRing(6,8,40),M3.T(0,13,0),hc,c(h.col||'#fff7c2',2.6));at(gRing(8.6,9.2,40),M3.T(0,13.2,0),hc,c(h.col||'#fff7c2',1.2));}
  else if(['merchant','tophat','cavalier','tricorn','miner','bowl','feather','jester','turban'].includes(t)){at(gCyl(t==='tricorn'||t==='cavalier'?12:10.5,t==='tricorn'?12:10.5,1.2,t==='tricorn'?3:24),M3.T(0,5.6,0),hc);
    at(gCyl(t==='tophat'?6.6:7,7.6,t==='tophat'?11:t==='turban'?5:6,20),M3.T(0,6,0),hc);if(h.band)at(gCyl(7.7,7.7,1.4,20),M3.T(0,6.8,0),c(h.band));if(h.feather)for(let k=0;k<3;k++)at(gBox(1,9-k*2,3),M3.ch(M3.T(5+k*.6,8,-2-k),M3.RZ(-.4-k*.15)),c(h.feather));
    if(t==='miner')at(gSph(1.8,8,6),M3.T(0,9,7.4),c('#fff7c2'),c('#ffe27a',2.5));}
  else if(t==='headband'||t==='bandana'){at(gCyl(8.4,8.4,2,20),M3.T(0,3.4,0),hc);for(const k of [-1,1])at(gBox(1.4,5,.6),M3.ch(M3.T(k*1.4,1.2,-8.2),M3.RZ(k*.35)),hc);}
  else if(t==='antlers'){for(const sx of [-1,1]){at(gLimb([sx*4,6,0],[sx*8,15,-1],1.2,.7,6),M3.id(),c('#8a6a48'));at(gLimb([sx*6.4,11,-.5],[sx*10.5,13,0],.7,.3,6),M3.id(),c('#8a6a48'));at(gLimb([sx*7.3,13,-.8],[sx*7.4,18,-2],.6,.2,6),M3.id(),c('#8a6a48'));}}
  else if(t==='goggles'){at(gCyl(8.5,8.5,1.6,20),M3.T(0,2.4,0),c('#3a2a20'));for(const sx of [-1,1])at(gCyl(2.4,2.4,1.6,14),M3.ch(M3.T(sx*3.2,2.6,7.8),M3.RX(Math.PI/2)),hc,c('#8fe9ff',.4));}
  else if(t==='veil'){at(gLatheArc([[10,-6],[9.6,0],[8,6],[0,9.4]],20,Math.PI*.95,Math.PI*2.05),M3.T(0,0,-.6),hc);}
  else at(gCyl(8.6,8.6,2.4,20),M3.T(0,5,0),hc);}
function gg3dWeapon(wp,P,w,col){if(!wp)return;const t=wp.type,c=(x,k)=>hex3(x,k),R=M3.T(10.5*w,15,6.7);const at=(g,m,cc,e)=>P.push([g,M3.mul(R,m),cc,e]);
  const blade=c(wp.col||'#dfe6f0'),shaft=c(wp.shaft||'#6b4a2e'),glow=wp.orb||wp.glow||wp.flame||wp.crystal||wp.spark,gold=c('#c9a227');
  if(['sword','greatsword','katana','rapier','sickle','scythe','axes','daggers','twinpistols'].includes(t)){const L=t==='greatsword'?26:t==='daggers'?9:t==='rapier'?19:16,bw=t==='greatsword'?3.8:t==='rapier'?1.2:2.4;
    at(gSph(1.2,8,6),M3.T(0,-3,0),gold);at(gCyl(.9,.9,4.4,8),M3.T(0,-2.6,0),shaft);at(gBox(t==='katana'?3:6.4,1.3,1.8),M3.T(0,1.8,0),gold);at(gSph(.8,6,4),M3.T(0,2.4,1),c(glow||'#ff5c7a'),c(glow||'#ff5c7a',1.4));
    at(gBox(bw,L,.9),M3.T(0,3,0),blade,wp.flame?c(wp.flame,.9):null);at(gBox(bw*.35,L*.92,1),M3.T(0,3.4,0),c(wp.col||'#dfe6f0',.75));at(gCyl(0,bw*.5,3,4),M3.ch(M3.T(0,3+L,0),M3.RY(.78),M3.S(1,1,.3)),blade);
    if(t==='scythe')at(gBox(13,2.2,.8),M3.ch(M3.T(-5,3+L,0),M3.RZ(.15)),blade);if(t==='axes')at(gCyl(5,5,.8,12,true),M3.ch(M3.T(2.6,L,0),M3.RX(Math.PI/2),M3.S(1,1,1)),blade);
    if(t==='daggers'||t==='twinpistols')P.push([gBox(2,9,.8),M3.T(-10.5*w,21,6.7),blade]);}
  else if(['spear','lance','spearglow','warhammer','pickaxe','torch'].includes(t)){at(gCyl(.8,.9,32,8),M3.T(0,-9,0),shaft);for(let k=0;k<3;k++)at(gCyl(1.05,1.05,1,8),M3.T(0,-1+k*1.6,0),c('#3a2a1e'));
    if(t==='warhammer'){at(gBox(10,6.4,6.4),M3.T(0,20,0),blade);at(gBox(10.6,1.2,6.8),M3.T(0,22.6,0),gold);if(wp.glow)at(gSph(1.4,8,6),M3.T(0,23.2,3.4),c(wp.glow),c(wp.glow,2));}
    else if(t==='pickaxe')at(gBox(15,2,2),M3.ch(M3.T(0,21,0),M3.RZ(.12)),blade);else if(t==='torch'){at(gCyl(1.6,1.2,3,8),M3.T(0,21,0),c('#3a2a1e'));at(gSph(2.4,8,6),M3.T(0,25,0),c('#ffb24a'),c('#ff9a2a',3));}
    else{at(gCyl(1.6,1.6,1.2,8),M3.T(0,22,0),gold);at(gCyl(0,2.4,8,6),M3.T(0,23,0),blade,t==='spearglow'?c(wp.col||'#a5f3fc',1.6):null);}}
  else if(['staff','orbstaff','lightningstaff','wand','firewand','hourglass','quill','smoker'].includes(t)){const L=t==='wand'||t==='firewand'||t==='quill'?13:28,y0=L>20?-9:0;at(gCyl(.8,1,L,8),M3.T(0,y0,0),shaft);
    const g=glow?c(glow):c(col),top=y0+L;at(gCyl(1.6,1.1,1.4,8),M3.T(0,top-1,0),gold);
    if(t==='hourglass'){at(gCyl(0,3.8,4.4,10),M3.T(0,top+4.4,0),c('#e9eef5'),c(glow||'#7defff',.7));at(gCyl(3.8,0,4.4,10),M3.T(0,top,0),c('#e9eef5'),c(glow||'#7defff',.7));at(gCyl(4.2,4.2,.8,10),M3.T(0,top+8.6,0),gold);at(gCyl(4.2,4.2,.8,10),M3.T(0,top-.4,0),gold);}
    else{const r0=t==='wand'||t==='firewand'?2.2:3.4;at(gSph(r0,14,10),M3.T(0,top+r0,0),g,hex3(glow||col,2.6));if(r0>3)for(let k=0;k<3;k++){const a=k*2.09;at(gLimb([Math.cos(a)*1,top,Math.sin(a)*1],[Math.cos(a)*4,top+r0*1.6,Math.sin(a)*4],.5,.25,5),M3.id(),gold);}
      if(wp.crystal||wp.spark)at(gSph(r0*1.5,12,8),M3.T(0,top+r0,0),g,hex3(glow||col,.35));}}
  else if(['bow','bigbow','crossbow','slingshot'].includes(t)){const s=t==='bigbow'?1.35:1;let prev=null;for(let k=-5;k<=5;k++){const a=k*.24,p=[-Math.cos(a)*7*s+7*s,Math.sin(a)*15*s+4,0];if(prev)at(gLimb(prev,p,1.1,1.1,6),M3.id(),c(wp.col||'#7a4a2a'),wp.glow?c(wp.glow,.9):null);prev=p;}
    at(gCyl(1.4,1.4,3.6,8),M3.T(.2,2.2,0),c('#3a2a1e'));at(gBox(.35,30*s,.35),M3.T(-.4,4-15*s,0),c('#efe6d6'));}
  else if(['pistol','rifle','blowgun'].includes(t)){at(gBox(2.4,4,2),M3.ch(M3.RX(.3)),shaft);at(gBox(2.2,2.4,t==='rifle'?18:t==='blowgun'?20:9),M3.T(0,2.4,3.4),c(wp.col||'#5a5a66'));at(gCyl(.9,.9,2,8),M3.ch(M3.T(0,3.6,t==='rifle'?12.6:8),M3.RX(Math.PI/2)),gold);}
  else if(t==='flask'){at(gSph(3.2,12,8),M3.T(0,3,0),c('#7cff6b'),c('#5aff4a',.9));at(gCyl(1.1,1.1,3,8),M3.T(0,5.6,0),c('#e9eef5'));at(gCyl(1.3,1.3,1,8),M3.T(0,8.4,0),c('#8a5a32'));}
  else if(t==='scales'){at(gCyl(.6,.6,12,6),M3.id(),gold);at(gBox(12,.8,.8),M3.T(0,12,0),gold);for(const sx of [-1,1]){at(gCyl(2.8,2.8,.8,12),M3.T(sx*6,7,0),c('#e9c46a'));at(gBox(.2,5,.2),M3.T(sx*6,7.6,0),gold);}}
  else if(t==='cards'){for(let k=0;k<3;k++)at(gBox(4,6,.4),M3.ch(M3.T(k*1.6,2,0),M3.RZ(.3*k-.3)),c(['#f8fafc','#e2453c','#f8fafc'][k]));}
  else if(t==='gauntlets'){for(const sx of [1,-1])P.push([gSph(3.6,12,8),M3.T(sx*10.5*w,15,6.7),c(wp.col||'#c3ccd8')]),P.push([gCyl(3.2,3.2,2,10),M3.T(sx*10.5*w,11.6,6.2),gold]);}
  else at(gBox(2,14,2),M3.id(),blade);}
function gg3dOff(o,P,w){if(!o)return;const t=o.type,c=(x,k)=>hex3(x,k),R=M3.T(-10.5*w,15,6.7);const at=(g,m,cc,e)=>P.push([g,M3.mul(R,m),cc,e]);
  if(['shield','shieldbuckler','towershield','sunshield','clockshield'].includes(t)){const sc=c(o.col||'#2f5fbf');
    if(t!=='towershield'){const m=M3.ch(M3.T(-1.6,4,2),M3.RY(-.35),M3.RX(Math.PI/2));at(gCyl(7.4,7.4,1.6,24),m,sc,t==='sunshield'?c('#ffd27a',.7):t==='clockshield'?c('#7defff',.6):null);at(gCyl(7.9,7.9,1.2,24),M3.mul(m,M3.T(0,.2,0)),c('#e9c46a'));
      at(gSph(2.2,10,8),M3.mul(m,M3.T(0,1.6,0)),c('#e9c46a'),t==='sunshield'?c('#ffd27a',1.5):null);}
    else{at(gBox(2,19,13),M3.T(-1,-3.4,2),c(o.col||'#5a6678'));at(gBox(2.4,19.6,1.2),M3.T(-1,-3.6,2),c('#e9c46a'));at(gBox(2.4,1.2,13.4),M3.T(-1,5,2),c('#e9c46a'));}}
  else if(t==='book'||t==='scroll2'){at(gBox(7,8.4,2.8),M3.ch(M3.T(0,0,2),M3.RY(.4)),c(o.col||'#3a2a6a'));at(gBox(6.4,7.8,3),M3.ch(M3.T(.4,.3,2),M3.RY(.4)),c('#efe6d6'));}
  else if(t==='crystalball'||t==='lantern2'){at(gSph(3.6,12,8),M3.T(0,3,2),c(o.glow||'#a5f3fc'),c(o.glow||'#a5f3fc',2));at(gCyl(3,3.4,1.2,10),M3.T(0,-.6,2),c('#3a2a20'));if(t==='lantern2')at(gCyl(0,3.4,2.6,8),M3.T(0,6.4,2),c('#3a2a20'));}
  else if(t==='falcon'){at(gSph(3,10,8),M3.ch(M3.T(0,8,0),M3.S(1,.9,1.3)),c('#8a5a32'));at(gSph(1.9,8,6),M3.T(0,11,1.6),c('#8a5a32'));at(gCyl(0,.8,1.6,5),M3.ch(M3.T(0,11,3.4),M3.RX(Math.PI/2)),c('#f2c84b'));for(const sx of [-1,1])at(gBox(8,.6,4),M3.ch(M3.T(sx*4,9,0),M3.RZ(sx*.4)),c('#6b4428'));}
  else if(t==='bomb'){at(gSph(3.4,12,8),M3.T(0,2,0),c('#1a1a24'));at(gCyl(.4,.4,2,6),M3.T(0,5.2,0),c('#8a6a48'));at(gSph(.9,6,4),M3.T(0,7.4,0),c('#ffb24a'),c('#ff9a2a',3));}
  else if(t==='pouch'){at(gSph(3,10,8),M3.ch(M3.T(0,1,1),M3.S(1,1.2,.9)),c('#8a5a32'));at(gCyl(1.4,1.8,1.4,8),M3.T(0,4,1),c('#e9c46a'));}
  else at(gBox(5,6,3),M3.T(0,0,1),c(o.col||'#8a6a48'));}
function gg3dBack(b,P,w,trim,tg){if(!b)return;const c=x=>hex3(x);
  if(b.cape){const cc=c(b.cape);P.push([gLatheArc([[8.6*w,23.4],[10*w,17],[11.6*w,8],[12.6*w,1.4]],20,Math.PI*1.12,Math.PI*1.88,(t,j)=>j>0?Math.sin(t*9)*.035*j:0),M3.T(0,0,-.6),cc]);
    P.push([gLatheArc([[12.7*w,1.4],[12.8*w,.4]],20,Math.PI*1.12,Math.PI*1.88),M3.T(0,0,-.6),trim||cc,tg]);for(const sx of [-1,1])P.push([gSph(1.5,8,6),M3.T(sx*5.4,23.2,4.4),c('#e9c46a'),tg]);}
  if(b.quiver){P.push([gLimb([2,11,-8],[6,25,-7],2.6,2.4,10),M3.id(),c('#6b4428')]);for(let k=0;k<3;k++){P.push([gLimb([4.4+k*.8,22,-7.4],[6.4+k*.8,29,-7],.3,.3,4),M3.id(),c('#d9c99a')]);P.push([gBox(1.6,2,.3),M3.T(6.4+k*.8,29,-7),c('#e2453c')]);}}
  if(b.pack){P.push([gBox(12,13,6.4),M3.T(0,10.4,-8.6),c(b.pack)]);P.push([gBox(12.4,2.2,6.8),M3.T(0,19.6,-8.6),c('#5a3a22')]);}
  if('wings' in b||'batwings' in b){const wc=c(b.wings||b.batwings||b.cape||'#3a1f55');for(const sx of [-1,1]){const root=[sx*3,21,-6],tip=[sx*24,32,-9],mid=[sx*16,26,-8];
    P.push([gLimb(root,mid,1.2,.9,6),M3.id(),wc]);P.push([gLimb(mid,tip,.9,.3,6),M3.id(),wc]);for(let k=0;k<3;k++){const e=[sx*(10+k*6),8+k*2,-8-k*.5];P.push([gTri([root,k?[sx*(10+(k-1)*6),8+(k-1)*2,-8]:root,e]),M3.id(),wc]);P.push([gTri([root,e,k<2?[sx*(14+k*5),26+k*3,-8.5]:tip]),M3.id(),wc]);}}}}
function gg3dBeast(L,id){const P=[],c=(h,k)=>hex3(h,k),U=UNITS[id]||{},o=c(L.outfit||U.col||'#6a8a3a'),tr=c(L.trim||'#e9f5a0'),dk=c(L.outfit||U.col||'#6a8a3a',.55);
  if(L.beast==='treant'){P.push([gLathe([[11,0],[8.6,3],[7.4,10],[7.8,20],[7,27]],16,(t,j)=>Math.sin(t*7)*.08),M3.id(),c('#6b4a2e')]);for(let k=0;k<8;k++){const a=k*.785;P.push([gBox(1.2,24,1.6),M3.ch(M3.T(Math.cos(a)*7.6,1,Math.sin(a)*7.6),M3.RY(-a)),c('#4a321e')]);}
    for(let k=0;k<5;k++){const a=k*1.257+.3;P.push([gLimb([Math.cos(a)*6,2,Math.sin(a)*6],[Math.cos(a)*14,0,Math.sin(a)*14],2.4,.6,6),M3.id(),c('#5a3e24')]);}
    for(const sx of [-1,1]){P.push([gLimb([sx*7,18,0],[sx*15,26,3],2.8,1.6,8),M3.id(),c('#6b4a2e')]);P.push([gLimb([sx*15,26,3],[sx*18,33,1],1.6,.7,6),M3.id(),c('#6b4a2e')]);P.push([gSph(5,10,8),M3.ch(M3.T(sx*18,34,1),M3.S(1,.8,1)),c('#4f9a46'),c('#7dff8a',.05)]);}
    for(let k=0;k<6;k++)P.push([gSph(9.6-k*.5,14,10),M3.ch(M3.T(Math.cos(k*1.1)*8.4,31+(k%3)*4,Math.sin(k*1.1)*8.4),M3.S(1,.8,1)),c(['#3f8a3a','#4f9a46','#2f7a34','#5ba84f','#3f8a3a','#6aa84f'][k]),c('#7dff8a',.04)]);
    for(const sx of [-1,1]){P.push([gSph(2.2,10,8),M3.ch(M3.T(sx*3,18,6.6),M3.S(1,1,.5)),c('#1a120a')]);P.push([gSph(1.4,8,6),M3.T(sx*3,18,7.6),c('#e9ff8a'),c('#d9ff6a',3)]);}
    P.push([gBox(5,1,1),M3.T(0,13.6,7.2),c('#1a120a')]);return {g:gShade(gMerge(P),0,14,.35),h:50,aura:c('#7dff8a')};}
  if(L.beast==='dragon'){const wc=c(L.wing||'#2f7a1a'),belly=c(L.trim||'#e9f5a0',.9);P.push([gSph(10,18,12),M3.ch(M3.T(0,12,0),M3.S(1,.85,1.25)),o]);P.push([gSph(7.6,14,10),M3.ch(M3.T(0,10.4,4),M3.S(1,.8,1.1)),belly]);
    P.push([gLimb([0,15,7],[0,24,13],5.4,3.8,14),M3.id(),o]);P.push([gSph(6,16,12),M3.ch(M3.T(0,26,14),M3.S(1,.85,1.2)),o]);P.push([gSph(3.6,12,8),M3.ch(M3.T(0,24.6,20),M3.S(1.1,.7,1.3)),o]);
    for(let k=0;k<4;k++)P.push([gCyl(0,.6,1.6,4),M3.ch(M3.T(-1.8+k*1.2,23,23.6),M3.RX(Math.PI)),c('#fffbe8')]);
    for(const sx of [-1,1]){P.push([gLimb([sx*3,30,11],[sx*4.6,35,6],1.4,.8,6),M3.id(),tr]);P.push([gLimb([sx*4.6,35,6],[sx*4,37,1],.8,.1,6),M3.id(),tr]);P.push([gSph(1.3,8,6),M3.T(sx*2.8,27.6,18.8),c('#ffd166'),c('#ffb020',2.6)]);
      const root=[sx*6,19,-1],el=[sx*17,30,-4],tip=[sx*30,22,-6];P.push([gLimb(root,el,1.6,1,6),M3.id(),dk]);P.push([gLimb(el,tip,1,.3,6),M3.id(),dk]);
      for(let k=0;k<3;k++){const e=[sx*(10+k*8),8+k*3,-4-k];P.push([gTri([root,el,e]),M3.id(),wc]);P.push([gTri([el,k<2?[sx*(18+k*7),14+k*3,-5]:tip,e]),M3.id(),wc]);}
      for(const fz of [-1,1]){P.push([gLimb([sx*6,8,fz*6],[sx*7,0,fz*6.6],2.8,2.4,8),M3.id(),o]);for(let k=-1;k<=1;k++)P.push([gCyl(0,.6,1.8,4),M3.ch(M3.T(sx*7+k*1.2,.6,fz*6.6+2.2),M3.RX(Math.PI/2)),c('#f4e6c8')]);}}
    let prev=[0,9,-11];for(let k=1;k<=5;k++){const p=[Math.sin(k*.7)*3,9-k*1.4,-11-k*4.6];P.push([gLimb(prev,p,4.2-k*.6,3.6-k*.6,10),M3.id(),o]);prev=p;}P.push([gCyl(0,2.6,4,4),M3.ch(M3.T(prev[0],prev[1],prev[2]),M3.RX(-Math.PI/2)),tr]);
    for(let k=0;k<6;k++)P.push([gCyl(0,1.6,3.2,4),M3.T(0,20-k*1.4+(k<3?6:0),12-k*4.4),tr]);
    if(L.crown){P.push([gCyl(4,4.4,2.6,12),M3.T(0,30.4,13),c('#f2c84b'),c('#f2c84b',.35)]);for(let k=0;k<5;k++){const a=k*1.257;P.push([gCyl(0,.9,2.6,4),M3.T(Math.cos(a)*4,33,13+Math.sin(a)*4),c('#f2c84b'),c('#f2c84b',.35)]);}}
    if(L.fire)for(let k=0;k<3;k++)P.push([gSph(2.6-k*.6,10,8),M3.T(0,24.4-k*.6,24+k*3),c('#ff9a3a'),c('#ff7a20',3-k*.6)]);return {g:gShade(gMerge(P),0,12,.35),h:40,aura:L.crown?c('#fde68a'):null};}
  if(L.beast==='bird'){const f=c(L.flame||'#ff9a3a'),fe=c(L.flame||'#ff9a3a',1.7);P.push([gSph(8,16,12),M3.ch(M3.T(0,16,0),M3.S(1,1.1,1.2)),o,c(L.outfit||'#ff7a2a',.5)]);P.push([gSph(5.6,14,10),M3.T(0,28,4),o,c(L.outfit||'#ff7a2a',.5)]);
    P.push([gCyl(0,2,6,6),M3.ch(M3.T(0,28,9),M3.RX(Math.PI/2)),c('#f2c84b')]);P.push([gCyl(0,1.2,3,6),M3.ch(M3.T(0,26.6,10.6),M3.RX(Math.PI/1.6)),c('#d9a227')]);
    for(let k=0;k<3;k++)P.push([gLimb([0,32,3-k*1.6],[0,38+k,-2-k*3],1,.2,6),M3.id(),f,fe]);
    for(const sx of [-1,1]){P.push([gSph(1.3,8,6),M3.T(sx*2.4,29.5,8.6),c('#1a1420')]);P.push([gSph(.45,6,4),M3.T(sx*2.4+.3,30,9.4),c('#ffffff'),c('#ffffff',.8)]);
      for(let k=0;k<4;k++)P.push([gTri([[sx*4,22,0],[sx*(16+k*4),26+k*4-k*k*1.4,-2-k],[sx*(10+k*4),10+k*2,-3]]),M3.id(),k%2?f:o,k%2?fe:c(L.outfit||'#ff7a2a',.6)]);
      P.push([gLimb([sx*3,10,1],[sx*3,0,2],1,.8,6),M3.id(),c('#d9a227')]);}
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2;P.push([gCyl(0,1.6,4.4,5),M3.ch(M3.T(Math.cos(a)*4.6,24,4+Math.sin(a)*4.6),M3.RY(-a),M3.RZ(1.1)),k%2?f:o,k%2?fe:null]);}
    for(let k=0;k<10;k++){const a=k/10*Math.PI*2;P.push([gCyl(0,2,4.6,5),M3.ch(M3.T(Math.cos(a)*7.4,13,Math.sin(a)*8.6),M3.RY(-a),M3.RZ(1.25)),o]);}
    for(const sx of [-1,1])for(let k=-1;k<=1;k++)P.push([gLimb([sx*3,.6,2],[sx*3+k*1.6,0,4.4],.5,.2,5),M3.id(),c('#3a2a1e')]);
    for(let k=-3;k<=3;k++){P.push([gBox(2.4,22-Math.abs(k)*2.6,.8),M3.ch(M3.T(k*2.4,10,-9),M3.RX(-1.05),M3.RZ(k*.16)),f,fe]);P.push([gSph(1.3,8,6),M3.ch(M3.T(k*2.4,10,-9),M3.RX(-1.05),M3.RZ(k*.16),M3.T(0,22-Math.abs(k)*2.6,0)),c('#fff2c2'),c(L.flame||'#ff9a3a',2.2)]);}
    return {g:gShade(gMerge(P),0,12,.3),h:40,aura:c(L.flame||'#ff9a3a')};}
  if(L.beast==='alien'){const s=c(L.skin||'#9fe8d0'),g=L.glow||'#8ddcff';P.push([gLathe([[7,0],[7.6,5],[6.4,14],[5,19],[3,21]],16),M3.id(),o]);P.push([gCyl(7.9,7.9,1.2,16),M3.T(0,4.4,0),c(L.trim||'#a78bfa'),c(L.trim||'#a78bfa',.4)]);
    P.push([gLathe([[5.2,17.4],[7.6,19],[4.4,21.6]],16),M3.id(),c(L.trim||'#a78bfa')]);P.push([gCyl(0,1.4,2,4),M3.ch(M3.T(0,14,6.6),M3.RX(Math.PI/2)),c(g),c(g,2.4)]);
    P.push([gSph(10,18,14),M3.ch(M3.T(0,30,0),M3.S(1.1,1,1)),s]);P.push([gSph(6,12,8),M3.ch(M3.T(0,25,3.6),M3.S(1,.8,.9)),s]);
    for(const sx of [-1,1]){P.push([gSph(2.8,12,8),M3.ch(M3.T(sx*4.2,30,8.3),M3.S(1,1.35,.5)),c('#05040a'),c(g,.6)]);P.push([gSph(.7,6,4),M3.T(sx*4.6,31.4,9.6),c('#ffffff'),c('#ffffff',1)]);
      P.push([gLimb([sx*4,38,0],[sx*7,46,-1],.6,.4,6),M3.id(),s]);P.push([gSph(1.8,10,8),M3.T(sx*7,46.6,-1),c(g),c(g,2.6)]);
      P.push([gLimb([sx*6.2,18,0],[sx*9.4,12,3],1.8,1.4,8),M3.id(),o]);P.push([gSph(1.6,8,6),M3.T(sx*9.6,11.4,3.6),s]);
      P.push([gSph(3.4,14,10),M3.ch(M3.T(sx*6.4,18.6,0),M3.S(1,.7,1.1)),c(L.trim||'#a78bfa')]);for(let k=-1;k<=1;k++)P.push([gLimb([sx*9.6,11,3.8],[sx*(9.8+k*.8),8.6,5],.45,.2,5),M3.id(),s]);
      P.push([gLimb([sx*2.4,13,-6.6],[sx*2.4,24,-6.6],.9,.9,8),M3.id(),c(g),c(g,1.8)]);}
    P.push([gBox(8,11,4),M3.T(0,11,-7.6),c(L.outfit||'#3a3a6a',.7)]);for(let k=0;k<3;k++)P.push([gBox(9,.6,.6),M3.T(0,6+k*3.6,6.9),c(L.trim||'#a78bfa'),c(L.trim||'#a78bfa',.6)]);
    if(L.weapon)gg3dWeapon(L.weapon,P,1,U.col);if(L.crown)P.push([gCyl(5,5.6,2.6,12),M3.T(0,38.6,0),c(L.crown),c(L.crown,.5)]);return {g:gShade(gMerge(P),0,12,.3),h:48,aura:L.aura?c(L.aura):null};}
  // serpent
  let prev=[0,2,-10];for(let k=0;k<7;k++){const p=[Math.sin(k*.9)*6,4+k*3.6,-10+k*2];P.push([gLimb(prev,p,5.4-k*.35,5-k*.35,12),M3.id(),o]);P.push([gSph(5-k*.35,10,8),M3.T(p[0],p[1],p[2]),o]);
    P.push([gCyl(0,1.4,3,4),M3.ch(M3.T(p[0],p[1]+4.4-k*.3,p[2]-1),M3.RX(-.4)),tr]);prev=p;}
  P.push([gSph(5.8,14,10),M3.ch(M3.T(0,30,3),M3.S(1,.8,1.4)),o]);P.push([gSph(4,10,8),M3.ch(M3.T(0,28.6,7.4),M3.S(1,.6,1)),tr]);
  for(const sx of [-1,1]){P.push([gSph(1.3,8,6),M3.T(sx*2.8,31.6,8),c('#ffd166'),c('#ffb020',2.2)]);P.push([gTri([[sx*4,32,0],[sx*10,36,-4],[sx*6,28,-3]]),M3.id(),tr]);P.push([gLimb([sx*2,34,2],[sx*3,39,-2],.9,.2,6),M3.id(),tr]);}
  return {g:gShade(gMerge(P),0,10,.3),h:38,aura:null};}
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
  const CAM=gg3dCamera(),oz=CAM.persp?0:12,eoz=CAM.persp?0:6,US=CAM.uscale,ES=CAM.escale;
  if(!G3.padStone){const ps=[[gCyl(17,18,4,32),M3.id(),hex3('#7a7490')],[gCyl(18.4,18.6,1.4,32),M3.id(),hex3('#4a4558')]];for(let k=0;k<16;k++){const a=k/16*Math.PI*2;ps.push([gBox(1,4.6,4.4),M3.ch(M3.T(Math.cos(a)*18,0,Math.sin(a)*18),M3.RY(-a)),hex3('#2e2a38')]);}
    G3.padStone=gg3dUpload(gMerge(ps));const rn=[[gRing(14.2,15.4,64),M3.id()],[gRing(12,12.5,64),M3.id()],[gRing(7.4,8,48),M3.id()]];
    for(let k=0;k<7;k++){const a=-Math.PI/2+k*2*Math.PI*3/7,b=-Math.PI/2+(k+1)*2*Math.PI*3/7,x1=Math.cos(a)*7.7,z1=Math.sin(a)*7.7,x2=Math.cos(b)*7.7,z2=Math.sin(b)*7.7;rn.push([gBox(Math.hypot(x2-x1,z2-z1),.2,.5),M3.ch(M3.T((x1+x2)/2,0,(z1+z2)/2),M3.RY(-Math.atan2(z2-z1,x2-x1)))]);}
    for(let k=0;k<24;k++){const a=k/24*Math.PI*2;rn.push([gBox(.5,.2,2),M3.ch(M3.T(Math.cos(a)*13.3,0,Math.sin(a)*13.3),M3.RY(-a+(k%2?.6:-.6)))]);}
    G3.padRune=gg3dUpload(gMerge(rn));}
  const L=n3(TH.dir),LP=[400+L[0]*900,L[1]*900,225+L[2]*900];const LV=M3.look(LP,[400,0,225],[0,1,0]);const LVP=M3.mul(M3.ortho(-700,700,-560,560,100,2000),LV);
  // collect drawables: [mesh, matrix, opts]
  const D=[],lights=map.lights.slice(),sel=G.sel;for(const L0 of (map.staticLights||[]).slice(0,2))lights.push(L0);
  for(const u of G.us){const m=gg3dUnit(u.id),age=u.atkT?performance.now()-u.atkT:999,lunge=age<160?(u.face||1)*4*(1-age/160):0,face=(u.face||1)>0?.55:-.55;
    const bob=1+Math.sin(t*2.2+u.uid)*.015,base=M3.T(u.x+lunge,0,u.y+oz),tc=TYPES[UNITS[u.id].t]||'#cbd5e1';
    D.push([G3.padStone,M3.ch(M3.T(u.x,0,u.y+oz),M3.S(US*.92,1,US*.92)),{spec:.3,shin:24}]);
    D.push([G3.padRune,M3.ch(M3.T(u.x,4.3,u.y+oz),M3.RY(t*.35+u.uid),M3.S(US*.92,1,US*.92)),{add:1,col:hex3(tc,2.6),a:.85+.15*Math.sin(t*2.4+u.uid)}]);
    D.push([m.mesh,M3.ch(base,M3.T(0,4,0),M3.RY(face),M3.S(.95*US,.95*US*bob,.95*US)),{}]);
    const st=prestigeStars(u);if(m.aura||st>=3){const ac=st>=3?hex3('#facc15'):m.aura;D.push([G3.fxRing,M3.ch(M3.T(u.x,4.6,u.y+oz),M3.S(21*US,1,21*US)),{add:1,col:ac,em:ac,a:.55+.2*Math.sin(t*3)}]);}
    if(st>=5)for(let k=0;k<3;k++){const a=t*1.6+k*2.09;D.push([G3.fxSph,M3.ch(M3.T(u.x+Math.cos(a)*16*US,(14+Math.sin(t*3+k)*4)*US,u.y+oz+Math.sin(a)*16*US),M3.S(1.6,1.6,1.6)),{add:1,col:hex3('#fff1a8'),em:hex3('#fff1a8',2),a:1}]);}}
  for(const e of G.en){if(e.hp<=0)continue;const kind=e.boss?'boss':(e.kind||'normal');const m=gg3dEnemy(kind);
    if(e._p3x==null){e._p3x=e.x;e._p3y=e.y;e._yaw=Math.PI/2;}const dx=e.x-e._p3x,dy=e.y-e._p3y;if(Math.abs(dx)+Math.abs(dy)>.05)e._yaw=Math.atan2(dx,dy);e._p3x=e.x;e._p3y=e.y;
    const sc=e.kind==='gloopling'?.7:1,ph=(e.d||0)*.25,fz=(e.frozen>0||e.stunned>0),h=m.fly?20+Math.sin(t*4+ph)*3:Math.abs(Math.sin(ph))*2,sub=e.submerged>0?-12:0;
    D.push([m.mesh,M3.ch(M3.T(e.x,h*ES+sub,e.y+eoz),M3.RY(e._yaw),M3.RZ(m.fly?0:Math.sin(ph*2)*.06),M3.S(sc*ES,sc*ES,sc*ES)),{tint:fz?hex3('#bfefff'):e.sl>0?hex3('#9fd8ff'):null,tk:fz?.6:e.sl>0?.25:0,hitT:e.lastHitT}]);
    if(e.boss)lights.push([[e.x,30,e.y+eoz],[2.4,.3,.5],90]);}
  for(const a of (G.allies||[])){const m=gg3dAlly(a);if(a._p3x==null){a._p3x=a.x;a._p3y=a.y;a._yaw=-Math.PI/2;}{const dx=a.x-a._p3x,dy=a.y-a._p3y;if(Math.abs(dx)+Math.abs(dy)>.05)a._yaw=Math.atan2(dx,dy);a._p3x=a.x;a._p3y=a.y;}const yaw=a._yaw;D.push([m.mesh,M3.ch(M3.T(a.x,Math.abs(Math.sin(t*9+a.x))*2,a.y+eoz),M3.RY(yaw),M3.S(ES,ES,ES)),{}]);}
  for(const w of (G.wolves||[])){const [x,y]=posAt(w.d),[nx]=posAt(Math.min(G.tot,w.d+4));const m=gg3dAlly({kind:'wolf'});D.push([m.mesh,M3.ch(M3.T(x,Math.abs(Math.sin(t*10+x))*2,y+eoz),M3.RY(nx<x?-Math.PI/2:Math.PI/2),M3.S(ES,ES,ES)),{}]);}
  // effects (additive)
  const FX=[];const add=(mesh,m,col,a,em)=>FX.push([mesh,m,{add:1,col,em:em||col,a}]);
  for(const f of G.fx){const k=f.l/f.max;
    if(f.kind==='shot'){const tt=1-k,ax=f.a[0],ay=f.a[1],bx=f.b[0],by=f.b[1],x=ax+(bx-ax)*tt,y=ay+(by-ay)*tt,h=(22-12*tt)*(CAM.persp?US:1)+Math.sin(tt*Math.PI)*10;const st=G3SHOT[f.style]||G3SHOT[f.fxk]||[f.c||'#ffffff',2.4];const cc=hex3(st[0]);
      add(G3.fxSph,M3.ch(M3.T(x,h,y),M3.S(st[1],st[1],st[1])),cc,1,hex3(st[0],2.2));const ang=Math.atan2(by-ay,bx-ax);add(G3.fxSph,M3.ch(M3.T(x-Math.cos(ang)*6,h,y-Math.sin(ang)*6),M3.RY(-ang),M3.S(8,st[1]*.6,st[1]*.6)),cc,.5);
      if(lights.length<11)lights.push([[x,h,y],hex3(st[0],1.6),70]);}
    else if(f.kind==='impact2'){const age=f.max-f.l;if(age<f.delay)continue;const p=Math.min(1,(age-f.delay)/(f.max-f.delay));const cc=hex3(f.col||'#ffd27a');add(G3.fxSph,M3.ch(M3.T(f.x,12,f.y+eoz),M3.S(4+10*p,4+10*p,4+10*p)),cc,1-p);add(G3.fxRing,M3.ch(M3.T(f.x,1.5,f.y+eoz),M3.S(6+16*p,1,6+16*p)),cc,1-p);}
    else if(f.kind==='death'){const p=1-k;add(G3.fxRing,M3.ch(M3.T(f.x,1.5,f.y+eoz),M3.S(6+22*p,1,6+22*p)),hex3('#c9a8ff'),1-p);add(G3.fxSph,M3.ch(M3.T(f.x,8+p*12,f.y+eoz),M3.S(6*(1-p)+1,6*(1-p)+1,6*(1-p)+1)),hex3('#e9d5ff'),1-p);}
    else if(f.kind==='coin'){const p=1-k;D.push([G3.fxSph,M3.ch(M3.T(f.x,14+p*22,f.y+eoz),M3.RY(t*8),M3.S(4,4,1.2)),{col:hex3('#facc15'),em:hex3('#facc15',.8),noShadow:1}]);}
    else if(f.kind==='timefreeze'||f.kind==='riftburst'||f.kind==='summon'||f.kind==='wolfhit'){const p=1-k,r=f.kind==='timefreeze'?f.rg:f.kind==='summon'?8+36*p:f.kind==='wolfhit'?5+22*p:80*p;const cc=hex3(f.kind==='timefreeze'?'#80f0ff':f.kind==='riftburst'?'#f07aff':'#ff1939');add(G3.fxRing,M3.ch(M3.T(f.x,2,f.y),M3.S(r,1,r)),cc,Math.max(0,k)*.9);}
    else if(f.kind==='mythic'){const p=1-k;const v=(typeof MYTHIC_VISUALS!=='undefined'&&MYTHIC_VISUALS[f.trait])||{color:'#fde68a'};for(let i=0;i<6;i++){const a=i*1.05+t*4;add(G3.fxSph,M3.ch(M3.T(f.x+Math.cos(a)*(10+20*p),12+i*2,f.y+Math.sin(a)*(10+20*p)),M3.S(2,2,2)),hex3(v.color),k);}}
    else if(f.a&&f.b){const ax=f.a[0],ay=f.a[1],bx=f.b[0],by=f.b[1],l=Math.hypot(bx-ax,by-ay);add(G3.fxBox,M3.ch(M3.T((ax+bx)/2,16,(ay+by)/2),M3.RY(-Math.atan2(by-ay,bx-ax)),M3.S(l,1.6,1.6),M3.T(0,-.5,0)),hex3(f.c||'#ffffff'),Math.min(1,k*2));}}
  for(const g of (G.ground||[])){const [x,y]=posAt(g.d);const fire=g.kind!=='mud';add(G3.fxDisc,M3.ch(M3.T(x,2.2,y),M3.S(g.radius,1,15)),hex3(fire?'#ff5a16':'#704629',fire?1:.5),Math.min(.85,g.ttl/2));if(fire&&lights.length<12)lights.push([[x,10,y],[2.4,.8,.2],80]);}
  for(const w of (G.xenoWards||[])){const [x,y]=posAt(w.d);const cc=hex3({slow:'#ffd166',stun:'#d6a5ff',freeze:'#65e9ff'}[w.effect]||'#ffffff');add(G3.fxRing,M3.ch(M3.T(x,2.4,y),M3.S(12,1,12)),cc,Math.min(1,w.ttl));add(G3.fxRing,M3.ch(M3.T(x,2.3,y),M3.S(w.radius,1,w.radius)),cc,.3*Math.min(1,w.ttl));}
  if(sel){add(G3.fxRing,M3.ch(M3.T(sel.x,4.5,sel.y),M3.S(sel.rg,1,sel.rg)),hex3('#ffc94d'),.35);add(G3.fxDisc,M3.ch(M3.T(sel.x,4.4,sel.y),M3.S(sel.rg,1,sel.rg)),hex3('#ffc94d'),.025);}
  // shadow pass
  const dm=(mesh,m)=>{gl.uniformMatrix4fv(G3.DP.u.uM,false,m);gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.n,gl.UNSIGNED_INT,0);};
  gl.enable(gl.DEPTH_TEST);gl.useProgram(G3.DP.p);gl.uniformMatrix4fv(G3.DP.u.uLVP,false,LVP);
  if(!G3.smS){G3.smS=gg3dTex(G3.SMS,G3.SMS,true);G3.smSF=gg3dFbo(null,G3.smS);}
  if(G3.smFor!==map){G3.smFor=map;gl.bindFramebuffer(gl.FRAMEBUFFER,G3.smSF);gl.viewport(0,0,G3.SMS,G3.SMS);gl.clear(gl.DEPTH_BUFFER_BIT);dm(map.mesh,M3.id());}
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER,G3.smSF);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,G3.smF);gl.blitFramebuffer(0,0,G3.SMS,G3.SMS,0,0,G3.SMS,G3.SMS,gl.DEPTH_BUFFER_BIT,gl.NEAREST);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER,null);gl.bindFramebuffer(gl.FRAMEBUFFER,G3.smF);gl.viewport(0,0,G3.SMS,G3.SMS);
  for(const d of D)if(!d[2].noShadow&&!d[2].add&&d[0]!==G3.fxDisc)dm(d[0],d[1]);
  // color pass (HDR)
  gl.bindFramebuffer(gl.FRAMEBUFFER,G3.hdrF);gl.viewport(0,0,G3.w,G3.h);const bg=hex3(TH.bg,.35);gl.clearColor(bg[0],bg[1],bg[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  if(CAM.persp){gl.disable(gl.DEPTH_TEST);gl.useProgram(G3.SKY.p);gl.uniformMatrix4fv(G3.SKY.u.uIVP,false,CAM.IVP);gl.uniform3fv(G3.SKY.u.uTop,hex3(TH.skyTop||'#203050'));gl.uniform3fv(G3.SKY.u.uBot,hex3(TH.skyBot||'#8090a0'));gl.uniform3fv(G3.SKY.u.uGlow,hex3(TH.glow||'#ffffff',.5));
    gl.bindVertexArray(G3.quad.vao);gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_INT,0);gl.enable(gl.DEPTH_TEST);}
  const P=G3.P,u=P.u;gl.useProgram(P.p);gl.uniformMatrix4fv(u.uVP,false,CAM.VP);gl.uniform3fv(u.uEye,CAM.eye);gl.uniform1f(u.uPersp,CAM.persp?1:0);gl.uniform3fv(u.uFog,hex3(TH.fog||'#808080'));gl.uniform1f(u.uFogD,CAM.persp?.00035:0);gl.uniformMatrix4fv(u.uLVP,false,LVP);gl.uniform3fv(u.uV,G3.V);gl.uniform3fv(u.uLDir,L);gl.uniform3fv(u.uLCol,TH.sun);gl.uniform3fv(u.uSky,TH.sky);gl.uniform3fv(u.uGnd,TH.gnd);gl.uniform3fv(u.uRim,TH.rim);
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
  if(map.motes&&!(ggFx&&ggFx.perf))draw(map.motes,M3.T(Math.sin(t*.3)*6,Math.sin(t*.7)*4,Math.cos(t*.25)*5),{add:1,col:map.moteCol,a:.55+.25*Math.sin(t*1.3)});
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
  cx.setTransform(1,0,0,1,0,0);const CAM=gg3dCamera(),oz=CAM.persp?0:12,eoz=CAM.persp?0:6,ES=CAM.escale;
  const head=e=>{const kind=e.boss?'boss':(e.kind||'normal'),m=G3.enemies[kind];const h=((m?m.h:22)+(m&&m.fly?22:2))*ES;return gg3dProj(e.x,h,e.y+eoz);};
  for(const e of G.en){if(e.hp<=0||e.leak)continue;const [hx,hy]=head(e),top=hy-7;
    const pct=Math.max(0,Math.min(1,e.hp/e.mx));cx.fillStyle='#0b0f1c';cx.fillRect(hx-13,top,26,4);cx.fillStyle=pct>.5?'#4ade80':pct>.25?'#facc15':'#f43f5e';cx.fillRect(hx-13,top,26*pct,4);cx.strokeStyle='#0b0f1c';cx.lineWidth=1;cx.strokeRect(hx-13,top,26,4);
    if(e.shield>0&&e.shMax){const p=Math.max(0,Math.min(1,e.shield/e.shMax));cx.fillStyle='#0b0f1c';cx.fillRect(hx-13,top-5,26,3);cx.fillStyle='#67e8f9';cx.fillRect(hx-13,top-5,26*p,3);}}
  for(const a of (G.allies||[])){const w=a.kind==='ghoul'?30:24,[ax,ay]=gg3dProj(a.x,(a.kind==='ghoul'?34:26)*ES,a.y+eoz),p=Math.max(0,Math.min(1,a.life/a.maxLife));cx.fillStyle='#0b0f1c';cx.fillRect(ax-w/2,ay,w,4);cx.fillStyle=p>.35?'#2dd4bf':'#f59e0b';cx.fillRect(ax-w/2,ay,w*p,4);}
  for(const u of G.us){const [bx,by]=gg3dProj(u.x+15*(CAM.persp?CAM.uscale:1),0,u.y+oz+(CAM.persp?6:4));cx.fillStyle='#000c';cx.beginPath();cx.arc(bx,by,8,0,7);cx.fill();cx.fillStyle='#fff';cx.font='bold 9px sans-serif';cx.textAlign='center';cx.fillText(u.pl,bx,by+3);}
  if(S.settings.hpNumbers!==false){cx.save();cx.font='bold 9px system-ui,-apple-system,Segoe UI,sans-serif';cx.textAlign='center';cx.lineJoin='round';cx.lineWidth=2.6;cx.strokeStyle='rgba(5,8,18,.92)';
    for(const e of G.en){if(e.hp<=0||e.leak)continue;const [hx,hy]=head(e),y=hy-(e.shield>0&&e.shMax?13:9);const txt=ggHpNum(e.hp)+'/'+ggHpNum(e.mx);
      cx.strokeText(txt,hx,y);cx.fillStyle=e.boss?'#ffd6de':'#ffffff';cx.fillText(txt,hx,y);}cx.restore();}
}
// Called at the start of the battle's draw(): draws the 3D scene and returns true, or false for the 2D art.
function gg3dDrawBase(){
  const on=gg3dActive();document.body.classList.toggle('gg3d-on',!!on&&!!G);if(!on)return false;
  cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,800,450);
  // nothing to draw while the battlefield is off screen (another tab or menu): saves battery
  if(cv.getClientRects().length){try{gg3dDraw();}catch(e){G3.failed=true;document.body.classList.remove('gg3d-on');try{console.warn('3D draw failed',e)}catch(x){}return false;}}
  gg3dOverlay();
  // speed check: suggest 2D once if 3D is slow on this device
  const now=performance.now();G3.fpsN++;if(!G3.fpsT)G3.fpsT=now;if(now-G3.fpsT>6000){const fps=G3.fpsN*1000/(now-G3.fpsT);G3.fpsN=0;G3.fpsT=now;
    if(fps<24&&!G.paused&&document.visibilityState==='visible'){if(++G3.slow>=2&&!G3.hinted){G3.hinted=true;try{toast('🧊 3D graphics are running slowly on this device. You can switch to 2D in Settings → 3D graphics.');}catch(x){}}}else G3.slow=0;}
  return true;}
// Settings toggle (saved on this device)
(function(){const ref=$('#ggShakeToggle')?.closest('label.setting')||$('#ggPerf')?.closest('label.setting');if(!ref)return;
  ref.insertAdjacentHTML('beforebegin','<label class="setting"><span><b>🧊 3D graphics</b><small>Battles in full 3D: lit maps with shadows, 3D units, enemies and effects. Turn off for the classic 2D art or on slower phones. Saved on this device only.</small></span><input type="checkbox" id="gg3dToggle"></label>');
  const t=$('#gg3dToggle');t.checked=G3.on;t.onchange=()=>{G3.on=t.checked;try{localStorage.setItem(GG3D_KEY,t.checked?'1':'0')}catch(e){}if(t.checked&&G3.failed)toast('This device cannot show 3D graphics, so the 2D art stays on.');document.body.classList.toggle('gg3d-on',G3.on&&G3.ok&&!!G);try{paintIcons()}catch(e){}};})();
// Camera choice (saved on this device)
(function(){const t=$('#gg3dToggle');if(!t)return;t.closest('label.setting').insertAdjacentHTML('afterend','<label class="setting" id="gg3dCamRow"><span><b>🎥 3D camera</b><small>Close: angled 3D with a big battlefield. Cinematic: a low angle with sky and horizon (smaller battlefield). Top-down: the classic view. Saved on this device only.</small></span><select id="gg3dCam" aria-label="3D camera"><option value="close">Close</option><option value="cine">Cinematic</option><option value="top">Top-down</option></select></label>');
  const sel=$('#gg3dCam');sel.value=G3.cam;sel.onchange=()=>{G3.cam=sel.value;try{localStorage.setItem(GG3D_CAM_KEY,G3.cam)}catch(e){}try{if(G&&G.sel)positionQuick()}catch(e){}};})();
// Taps on the 3D battlefield: a tap on a unit's body selects it, anywhere else lands on the ground under the finger.
addEventListener('click',function(e){try{if(e.target!==cv||!G||!gg3dPersp()||typeof cv.onclick!=='function')return;const r=cv.getBoundingClientRect();if(!r.width)return;
  const px=(e.clientX-r.left)*800/r.width,py=(e.clientY-r.top)*450/r.height,CAM=gg3dCamera();let best=null,bd=1e9;
  for(const u of G.us){const [ux,uy]=gg3dProj(u.x,20*CAM.uscale,u.y),[,fy]=gg3dProj(u.x,0,u.y),rad=Math.max(14,Math.abs(fy-uy)*.95),d=Math.hypot(px-ux,py-uy);if(d<rad&&d<bd){bd=d;best=u;}}
  const [gx,gy]=best?[best.x,best.y]:gg3dUnproj(px,py);e.stopImmediatePropagation();e.preventDefault();
  cv.onclick.call(cv,{clientX:r.left+gx*r.width/800,clientY:r.top+gy*r.height/450,target:cv,currentTarget:cv,preventDefault(){},stopPropagation(){}});}catch(err){}},true);
// The boost panel opens beside the unit where it stands on screen.
(function(){if(typeof positionQuick!=='function')return;const o=positionQuick;positionQuick=function(){if(!(G&&G.sel&&gg3dPersp()))return o.apply(this,arguments);
  const u=G.sel,[x,y]=gg3dProj(u.x,18*gg3dCamera().uscale,u.y),f=Object.create(u);f.x=x;f.y=y;G.sel=f;try{return o.apply(this,arguments);}finally{G.sel=u;}};})();
// Hit flashes, damage numbers and bursts follow the 3D camera.
(function(){if(typeof ggjDraw!=='function')return;const o=ggjDraw;ggjDraw=function(){if(!(G&&gg3dPersp()))return o.apply(this,arguments);const sv=[];
  const mv=(q,h)=>{sv.push([q,q.x,q.y]);const [x,y]=gg3dProj(q.x,h,q.y);q.x=x;q.y=y;};
  try{for(const e of G.en)if(e._jf>0&&e.hp>0)mv(e,10*gg3dCamera().escale);for(const r of GGJ.rings)mv(r,2);
    for(const p of GGJ.parts){if(p.coin&&p.sx!=null){const k=Math.max(0,Math.min(1,p.l/p.max)),[x,y]=gg3dProj(p.sx,12,p.sy);sv.push([p,p.x,p.y]);p.x+=(x-p.sx)*k;p.y+=(y-p.sy)*k;}else mv(p,8);}
    return o.apply(this,arguments);}finally{for(let i=sv.length-1;i>=0;i--){const [q,x,y]=sv[i];q.x=x;q.y=y;}}};})();
// ---- 3D outside battles: unit portraits on every card and the 3D summon crystal ----
function gg3dMini(canvas){try{const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:true,preserveDrawingBuffer:true});if(!gl)return null;
  const save=G3.gl;G3.gl=gl;const R={gl,P:gg3dProg(G3VS,G3FS),cache:new Map()};const dt=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,dt);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,1,1);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE);R.dt=dt;R.up=g=>{const s=G3.gl;G3.gl=gl;const m=gg3dUpload(g);G3.gl=s;return m;};G3.gl=save;return R;}catch(e){return null;}}
function gg3dMiniDraw(R,items,VP,opt){const gl=R.gl,u=R.P.u;gl.viewport(0,0,gl.canvas.width,gl.canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);
  gl.useProgram(R.P.p);gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniformMatrix4fv(u.uLVP,false,M3.id());gl.uniform3fv(u.uV,opt.v);gl.uniform3fv(u.uLDir,n3([-.5,.7,.6]));gl.uniform3fv(u.uLCol,[1.25,1.15,1.05]);
  gl.uniform3fv(u.uSky,opt.sky||[.45,.42,.6]);gl.uniform3fv(u.uGnd,[.08,.06,.12]);gl.uniform3fv(u.uRim,opt.rim||[.45,.35,.8]);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,R.dt);gl.uniform1i(u.uSh,0);gl.uniform1f(u.uShOn,0);const PL=opt.lights||[];gl.uniform1i(u.uNP,PL.length);if(PL.length){gl.uniform3fv(u.uPP,PL.flatMap(l=>l[0]));gl.uniform3fv(u.uPC,PL.flatMap(l=>l[1]));gl.uniform1fv(u.uPR,PL.map(l=>l[2]));}
  for(const [mesh,m,o] of items){const add=!!(o&&o.add);if(add){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);}
    gl.uniformMatrix4fv(u.uM,false,m);gl.uniformMatrix3fv(u.uNM,false,M3.nrm(m));gl.uniform1f(u.uSpec,.35);gl.uniform1f(u.uShin,30);gl.uniform1f(u.uAdd,add?1:0);gl.uniform1f(u.uEmMul,1);gl.uniform1f(u.uAlpha,o&&o.a!=null?o.a:1);
    const cc=o&&o.col;gl.uniform3fv(u.uCol,cc||[1,1,1]);gl.uniform1f(u.uColK,cc?1:0);gl.uniform3fv(u.uEmAdd,[0,0,0]);gl.uniform3fv(u.uTint,[0,0,0]);gl.uniform1f(u.uTintK,0);
    gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.n,gl.UNSIGNED_INT,0);if(add){gl.depthMask(true);gl.disable(gl.BLEND);}}}
// Portraits: a 3/4 view of the unit's 3D model, drawn once and kept.
const G3PORT={R:null,c:null,img:{}};
const G3RCOL={Common:'#7a8a8f',Rare:'#3b82f6',Epic:'#a78bfa',Legendary:'#ffbf47',Mythic:'#ff68e9',Secret:'#ff314d',Exclusive:'#34d399'};
function gg3dPortrait(id){if(G3PORT.img[id])return G3PORT.img[id];if(!G3PORT.R){G3PORT.c=document.createElement('canvas');G3PORT.c.width=288;G3PORT.c.height=256;G3PORT.R=gg3dMini(G3PORT.c);if(!G3PORT.R)return null;}
  const R=G3PORT.R;let b;try{b=gg3dUnitModel(id);}catch(e){return null;}const mesh=R.up(b.g);const h=b.h,rc=G3RCOL[(UNITS[id]||{}).r]||'#7a8a8f';
  if(!G3PORT.ped)G3PORT.ped=R.up(gMerge([[gCyl(17,18.4,3,40),M3.T(0,-3,0),hex3('#3a3448')],[gCyl(18.6,18.6,.8,40),M3.T(0,-.6,0),hex3('#5a5270')]]));
  const E=[18,24,74],V=M3.look(E,[0,h*.47,0],[0,1,0]),half=Math.max(25,h*.64);const VP=M3.mul(M3.ortho(-half*1.125,half*1.125,-half,half,1,400),V);
  const items=[[G3PORT.ped,M3.id(),{}],[mesh,M3.RY(-.14),{}]];if(b.aura){if(!G3PORT.ring)G3PORT.ring=R.up(gRing(.82,1,48));items.push([G3PORT.ring,M3.ch(M3.T(0,.4,0),M3.S(15,1,15)),{add:1,col:b.aura,a:.85}]);}
  gg3dMiniDraw(R,items,VP,{v:n3(E),sky:[.8,.76,.95],rim:hex3(rc,1.4),lights:[[[-26,h*.9,40],[1.1,1,.95],140],[[16,h*.7,-36],hex3(rc,2.6),120]]});
  const out=document.createElement('canvas');out.width=288;out.height=256;const x=out.getContext('2d');
  const g=x.createRadialGradient(144,150,10,144,140,190);g.addColorStop(0,rc+'cc');g.addColorStop(.45,rc+'44');g.addColorStop(1,'#0b0a18');x.fillStyle=g;x.fillRect(0,0,288,256);
  const tier=G3HI[(UNITS[id]||{}).r]||0;if(tier){x.save();x.translate(144,128);x.globalAlpha=.10+tier*.04;x.fillStyle='#ffffff';for(let k=0;k<12;k++){x.rotate(Math.PI/6);x.beginPath();x.moveTo(0,0);x.lineTo(-14,-220);x.lineTo(14,-220);x.closePath();x.fill();}x.restore();}
  const fl=x.createRadialGradient(144,226,4,144,226,96);fl.addColorStop(0,'rgba(0,0,0,.55)');fl.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=fl;x.fillRect(0,170,288,86);
  x.drawImage(G3PORT.c,0,0);const gl=R.gl;gl.deleteVertexArray(mesh.vao);G3PORT.img[id]=out;return out;}
// Portraits already made are drawn at once; new ones are built a few per frame so screens never freeze.
const G3PQ={list:[],tm:0};
function gg3dPaintPortrait(k){const im=G3PORT.img[k.dataset.id];if(!im)return false;if(k.width===72&&k.height===64){k.width=288;k.height=256;}const c=k.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,k.width,k.height);c.drawImage(im,0,0,k.width,k.height);return true;}
function gg3dPortraitPump(dl){G3PQ.tm=0;if(document.getElementById('ggSplash')){G3PQ.tm=setTimeout(gg3dPortraitPump,400);return;}const t0=performance.now(),budget=dl&&dl.timeRemaining?Math.max(4,Math.min(10,dl.timeRemaining())):6;while(G3PQ.list.length&&performance.now()-t0<budget){const k=G3PQ.list.shift();if(!k.isConnected||!(G3.on&&!G3.failed))continue;if(!G3PORT.img[k.dataset.id]&&!gg3dPortrait(k.dataset.id))continue;gg3dPaintPortrait(k);}
  if(G3PQ.list.length)G3PQ.tm=window.requestIdleCallback?requestIdleCallback(gg3dPortraitPump,{timeout:300}):setTimeout(gg3dPortraitPump,24);}
(function(){const o=paintIcons;paintIcons=function(){const r=o.apply(this,arguments);if(!(G3.on&&!G3.failed))return r;
  try{document.querySelectorAll('canvas.ico').forEach(k=>{if(k.dataset.item||!k.dataset.id||!UNITS[k.dataset.id])return;if(gg3dPaintPortrait(k))return;if(!G3PQ.list.includes(k))G3PQ.list.push(k);});
    if(G3PQ.list.length&&!G3PQ.tm)G3PQ.tm=setTimeout(gg3dPortraitPump,0);}catch(e){}return r;};})();
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
