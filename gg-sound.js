/* Gem Guardians public edition · gg-sound.js · Version 2026.10.11.34 · built from source/public/index.html by tools/split.py */
/* ===================================================================
   Gem Guardians Sound (GGS) — original procedural music & sound effects
   Everything is synthesized live with the Web Audio API: no recordings,
   no samples, no third-party audio, so it is fully original and legal,
   adds almost nothing to the download and works offline.
   =================================================================== */
const GGS=(function(){
let ctx=null,master,musicBus,sfxBus,musicGain,sfxGain,comp,noiseBuf=null;
const prefs={music:.5,sfx:.7,muted:false};
let prefKey='gemGuardiansAudio';
function loadPrefs(key){prefKey=key||prefKey;try{Object.assign(prefs,JSON.parse(localStorage.getItem(prefKey)||'{}'))}catch(e){}}
function savePrefs(){try{localStorage.setItem(prefKey,JSON.stringify(prefs))}catch(e){}}
function ensure(){
  if(ctx)return ctx;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  ctx=new AC();
  comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;
  master=ctx.createGain();master.gain.value=prefs.muted?0:1;master.connect(comp);comp.connect(ctx.destination);
  musicGain=ctx.createGain();musicGain.gain.value=prefs.music*.55;musicGain.connect(master);
  sfxGain=ctx.createGain();sfxGain.gain.value=prefs.sfx*.8;sfxGain.connect(master);
  musicBus=ctx.createGain();musicBus.connect(musicGain);sfxBus=sfxGain;
  // soft shared reverb for music (generated impulse response: original, no recordings)
  const rev=ctx.createConvolver(),len=ctx.sampleRate*2.2,ir=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2);}
  rev.buffer=ir;const revSend=ctx.createGain();revSend.gain.value=.28;musicBus.connect(revSend);revSend.connect(rev);rev.connect(musicGain);
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const nd=noiseBuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  return ctx;
}
function unlock(){if(!ensure())return;if(ctx.state==='suspended')ctx.resume().catch(()=>{});}
function applyVolumes(){if(!ctx)return;const t=ctx.currentTime;master.gain.setTargetAtTime(prefs.muted?0:1,t,.05);musicGain.gain.setTargetAtTime(prefs.music*.55,t,.05);sfxGain.gain.setTargetAtTime(prefs.sfx*.8,t,.05);}
const mtof=m=>440*Math.pow(2,(m-69)/12);

/* ---------- instruments ---------- */
function env(g,t,a,peak,d,sus,r,end){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.linearRampToValueAtTime(peak*sus,t+a+d);g.gain.setValueAtTime(peak*sus,end);g.gain.linearRampToValueAtTime(0,end+r);}
function osc(type,freq,t,dur,out,{a=.01,peak=.2,d=.1,sus=.6,r=.15,detune=0,filter=null,q=.7,vib=0}={}){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.detune.value=detune;
  let node=o;if(filter){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=filter;f.Q.value=q;o.connect(f);node=f;}
  if(vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=5.2;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(freq*vib,t+.25);l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+r+.05);}
  node.connect(g);g.connect(out);env(g,t,a,peak,d,sus,r,t+dur);o.start(t);o.stop(t+dur+r+.05);return o;
}
function noise(t,dur,out,{peak=.2,a=.002,r=.08,type='highpass',freq=6000,q=.7,sweepTo=null}={}){
  const s=ctx.createBufferSource();s.buffer=noiseBuf;const f=ctx.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(freq,t);if(sweepTo)f.frequency.exponentialRampToValueAtTime(sweepTo,t+dur);f.Q.value=q;
  const g=ctx.createGain();s.connect(f);f.connect(g);g.connect(out);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+dur+r);s.start(t,Math.random()*.5);s.stop(t+dur+r+.05);
}
const INST={
  pad:(m,t,dur,out,v=1)=>{for(const dt of[-7,7])osc('sawtooth',mtof(m),t,dur,out,{a:.35,peak:.035*v,d:.3,sus:.8,r:.6,detune:dt,filter:1100,q:.5});},
  warmpad:(m,t,dur,out,v=1)=>{for(const dt of[-5,5])osc('triangle',mtof(m),t,dur,out,{a:.5,peak:.05*v,d:.3,sus:.85,r:.8,detune:dt});},
  organ:(m,t,dur,out,v=1)=>{for(const [h,p] of[[1,.05],[2,.03],[4,.012]])osc('sine',mtof(m)*h,t,dur,out,{a:.04,peak:p*v,d:.1,sus:.9,r:.25});},
  pluck:(m,t,dur,out,v=1)=>osc('triangle',mtof(m),t,.05,out,{a:.004,peak:.12*v,d:.18,sus:.15,r:.25}),
  harp:(m,t,dur,out,v=1)=>{osc('triangle',mtof(m),t,.04,out,{a:.003,peak:.1*v,d:.5,sus:.1,r:.6});osc('sine',mtof(m)*2,t,.03,out,{a:.003,peak:.03*v,d:.3,sus:.05,r:.4});},
  bell:(m,t,dur,out,v=1)=>{osc('sine',mtof(m),t,.05,out,{a:.002,peak:.09*v,d:.9,sus:.08,r:1});osc('sine',mtof(m)*2.76,t,.05,out,{a:.002,peak:.035*v,d:.4,sus:.02,r:.5});},
  flute:(m,t,dur,out,v=1)=>{osc('sine',mtof(m),t,dur,out,{a:.06,peak:.09*v,d:.1,sus:.8,r:.15,vib:.006});noise(t,Math.min(.12,dur),out,{peak:.012*v,type:'bandpass',freq:mtof(m)*2,q:2});},
  chip:(m,t,dur,out,v=1)=>osc('square',mtof(m),t,dur*.8,out,{a:.005,peak:.045*v,d:.08,sus:.5,r:.06,filter:2600}),
  brass:(m,t,dur,out,v=1)=>{const o=osc('sawtooth',mtof(m),t,dur,out,{a:.05,peak:.07*v,d:.15,sus:.7,r:.15,filter:1500,q:1.2});},
  synth:(m,t,dur,out,v=1)=>{osc('square',mtof(m),t,dur,out,{a:.02,peak:.04*v,d:.1,sus:.6,r:.2,filter:1800,detune:-6});osc('sawtooth',mtof(m)*1.003,t,dur,out,{a:.02,peak:.03*v,d:.1,sus:.6,r:.2,filter:1400});},
  bass:(m,t,dur,out,v=1)=>osc('triangle',mtof(m),t,dur*.9,out,{a:.01,peak:.16*v,d:.1,sus:.7,r:.08}),
  subbass:(m,t,dur,out,v=1)=>{osc('sine',mtof(m),t,dur*.9,out,{a:.01,peak:.2*v,d:.1,sus:.8,r:.1});osc('sawtooth',mtof(m),t,dur*.6,out,{a:.01,peak:.03*v,d:.1,sus:.3,r:.08,filter:500});},
  kick:(t,out,v=1)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.32*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g);g.connect(out);o.start(t);o.stop(t+.3);},
  snare:(t,out,v=1)=>{noise(t,.08,out,{peak:.09*v,type:'bandpass',freq:1800,q:.8,r:.06});osc('triangle',190,t,.02,out,{a:.002,peak:.06*v,d:.06,sus:0,r:.04});},
  hat:(t,out,v=1)=>noise(t,.02,out,{peak:.04*v,freq:7500,r:.03}),
  tom:(t,out,v=1,f=110)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f,t+.12);g.gain.setValueAtTime(.18*v,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.connect(g);g.connect(out);o.start(t);o.stop(t+.35);},
  shaker:(t,out,v=1)=>noise(t,.04,out,{peak:.03*v,type:'bandpass',freq:5200,q:1.5,r:.03}),
};

/* ---------- music themes (all original, generated from seeds) ---------- */
const SCALES={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],penta:[0,2,4,7,9],mixo:[0,2,4,5,7,9,10],harm:[0,2,3,5,7,8,11],lydian:[0,2,4,6,7,9,11]};
const THEMES={
  menu:{bpm:92,root:62,scale:'major',prog:[0,5,3,4],lead:'flute',pad:'warmpad',arp:'harp',bass:'bass',drums:'soft',seed:11},
  meadow:{bpm:104,root:65,scale:'major',prog:[0,3,4,0,5,3,1,4],lead:'flute',pad:'warmpad',arp:'pluck',bass:'bass',drums:'light',seed:21},
  crystal:{bpm:84,root:64,scale:'lydian',prog:[0,1,0,4],lead:'bell',pad:'pad',arp:'bell',bass:'bass',drums:'soft',seed:31},
  ember:{bpm:116,root:57,scale:'phrygian',prog:[0,1,0,6],lead:'brass',pad:'pad',arp:'pluck',bass:'subbass',drums:'tribal',seed:41},
  marsh:{bpm:76,root:60,scale:'dorian',prog:[0,3,0,6],lead:'flute',pad:'pad',arp:'harp',bass:'bass',drums:'soft',seed:51,amb:'crickets'},
  desert:{bpm:100,root:62,scale:'harm',prog:[0,1,0,4],lead:'flute',pad:'warmpad',arp:'pluck',bass:'bass',drums:'hand',seed:61},
  tundra:{bpm:80,root:67,scale:'minor',prog:[0,5,2,6],lead:'bell',pad:'pad',arp:'bell',bass:'bass',drums:'soft',seed:71,amb:'wind'},
  jungle:{bpm:112,root:57,scale:'dorian',prog:[0,6,3,4],lead:'flute',pad:'pad',arp:'pluck',bass:'bass',drums:'tribal',seed:81},
  volcanic:{bpm:124,root:52,scale:'phrygian',prog:[0,1,6,0],lead:'brass',pad:'pad',arp:'chip',bass:'subbass',drums:'heavy',seed:91},
  nebula:{bpm:72,root:63,scale:'lydian',prog:[0,1,5,4],lead:'synth',pad:'pad',arp:'bell',bass:'subbass',drums:'soft',seed:101},
  ruins:{bpm:88,root:60,scale:'harm',prog:[0,3,4,0],lead:'harp',pad:'warmpad',arp:'harp',bass:'bass',drums:'hand',seed:111},
  hive:{bpm:108,root:55,scale:'phrygian',prog:[0,1,0,5],lead:'synth',pad:'pad',arp:'chip',bass:'subbass',drums:'heavy',seed:121},
  reef:{bpm:86,root:63,scale:'penta',prog:[0,5,3,4],lead:'flute',pad:'warmpad',arp:'harp',bass:'bass',drums:'hand',seed:131,amb:'waves'},
  castle:{bpm:96,root:57,scale:'harm',prog:[0,5,3,4],lead:'organ',pad:'organ',arp:'harp',bass:'subbass',drums:'heavy',seed:131},
  boss:{bpm:138,root:52,scale:'harm',prog:[0,0,5,4],lead:'brass',pad:'pad',arp:'chip',bass:'subbass',drums:'boss',seed:141},
  afk:{bpm:66,root:60,scale:'penta',prog:[0,3,4,3],lead:'bell',pad:'warmpad',arp:'harp',bass:'bass',drums:'none',seed:151},
};
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}
function degreeNote(th,deg,oct=0){const sc=SCALES[th.scale],n=sc.length;const o=Math.floor(deg/n);return th.root+sc[((deg%n)+n)%n]+12*(o+oct);}
// A melody is generated once per theme: 2 phrases × 4 bars (A A' B A″), each bar a rhythm of 8 eighth-note slots.
function buildMelody(th){
  const R=rng(th.seed),bars=[],rhythms=[[1,0,1,0,1,0,1,1],[1,0,0,1,1,0,1,0],[1,1,1,0,1,0,0,0],[1,0,1,1,0,1,1,0],[1,0,0,0,1,0,1,0],[1,1,0,1,1,0,0,0]];
  const motif=[];let deg=4+Math.floor(R()*3);
  for(let b=0;b<4;b++){const rh=rhythms[Math.floor(R()*rhythms.length)],bar=[];
    for(let s=0;s<8;s++){if(!rh[s]){bar.push(null);continue;}const step=[-2,-1,-1,0,1,1,2,3,-3][Math.floor(R()*9)];deg=Math.max(0,Math.min(11,deg+step));bar.push(deg);}motif.push(bar);}
  const vary=(bar,amt)=>bar.map(d=>d==null?null:(R()<amt?Math.max(0,Math.min(12,d+[-1,1,2][Math.floor(R()*3)])):d));
  const B=motif.map(bar=>vary(bar.map(d=>d==null?null:d+2),.5));
  return [...motif,...motif.map(b=>vary(b,.3)),...B,...motif.map((b,i)=>i===3?[0,null,null,null,2,null,null,null].map(x=>x==null?null:x+ (th.scale==='penta'?0:0)):vary(b,.2))];
}
const DRUMS={
  none:{},soft:{kick:[0],hat:[2,6]},light:{kick:[0,4],snare:[],hat:[1,2,3,5,6,7],shaker:[]},
  tribal:{kick:[0,3,4],tom:[2,6,7],shaker:[1,3,5,7]},hand:{tom:[0,3,4,6],shaker:[1,2,5,7]},
  heavy:{kick:[0,3,4],snare:[2,6],hat:[0,1,2,3,4,5,6,7]},boss:{kick:[0,1,3,4,5],snare:[2,6],hat:[0,1,2,3,4,5,6,7],tom:[7]},
};
let current=null,nextTheme=null,schedTimer=null,step=0,nextTime=0,intensity=.4,trackGain=null;
function startTrack(name){
  if(!ensure())return;
  if(current&&current.name===name)return;
  const old=trackGain;if(old){old.gain.setTargetAtTime(0,ctx.currentTime,.4);setTimeout(()=>old.disconnect(),2500);}
  if(!name||!THEMES[name]){current=null;trackGain=null;return;}
  const th=THEMES[name];trackGain=ctx.createGain();trackGain.gain.value=0;trackGain.gain.setTargetAtTime(1,ctx.currentTime+.1,.6);trackGain.connect(musicBus);
  current={name,th,mel:th.mel||(th.mel=buildMelody(th)),out:trackGain};step=0;nextTime=ctx.currentTime+.15;
  if(!schedTimer)schedTimer=setInterval(schedule,60);
}
function schedule(){
  if(!ctx||!current||ctx.state!=='running')return;
  const {th,mel,out}=current,eighth=60/th.bpm/2;
  while(nextTime<ctx.currentTime+.35){
    const bar=Math.floor(step/8),s=step%8,chord=th.prog[bar%th.prog.length],t=nextTime;
    const hi=intensity>.66,mid=intensity>.33;
    if(s===0){for(const k of[0,2,4])INST[th.pad](degreeNote(th,chord+k,-1),t,eighth*8,out,.9);}
    if(th.drums!=='none'){const D=DRUMS[th.drums]||{};
      if((D.kick||[]).includes(s))INST.kick(t,out,mid?1:.7);
      if((D.snare||[]).includes(s)&&mid)INST.snare(t,out);
      if((D.hat||[]).includes(s)&&(mid||s%2===0))INST.hat(t,out,hi?1:.6);
      if((D.tom||[]).includes(s))INST.tom(t,out,1,th.root>58?130:100);
      if((D.shaker||[]).includes(s))INST.shaker(t,out);}
    if(s===0||s===4||(hi&&(s===3||s===7)))INST[th.bass](degreeNote(th,chord,-2),t,eighth*(s===0||s===4?3.5:1),out);
    if(mid||th.drums==='none'){if(s%2===1||hi)INST[th.arp](degreeNote(th,chord+[0,2,4,7][(s>>1)%4],0),t,eighth,out,.6);}
    const md=mel[bar%mel.length][s];
    if(md!=null){let len=1;while(s+len<8&&mel[bar%mel.length][s+len]==null&&len<3)len++;INST[th.lead](degreeNote(th,md,0),t,eighth*len*.95,out,1);}
    if(th.amb==='crickets'&&s%4===2&&Math.random()<.5)osc('sine',4200+Math.random()*400,t,.03,out,{a:.002,peak:.008,d:.02,sus:0,r:.02});
    if(th.amb==='waves'&&s===0&&bar%2===0)noise(t,eighth*10,out,{peak:.014,type:'lowpass',freq:380,q:.5,a:1.6,r:1.6,sweepTo:950});
    if(th.amb==='wind'&&s===0&&bar%2===0)noise(t,eighth*8,out,{peak:.012,type:'bandpass',freq:500,q:.6,a:1,r:1,sweepTo:900});
    nextTime+=eighth;step++;
  }
}
function setIntensity(v){intensity=Math.max(0,Math.min(1,v));}
function stopMusic(){startTrack(null);}

/* ---------- jingles ---------- */
function seq(notes,inst,{bpm=140,out=sfxBus,v=1,start=0}={}){if(!ensure())return;const e=60/bpm/2;let t=ctx.currentTime+.02+start;for(const n of notes){if(n!=null){const [m,len=1]=Array.isArray(n)?n:[n,1];INST[inst](m,t,e*len,out,v);t+=e*len;}else t+=e;}}
const JINGLES={
  victory:()=>{seq([72,76,79,[84,3]],'brass',{bpm:150});seq([60,64,67,[72,3]],'bell',{bpm:150,v:.9});seq([[48,6]],'subbass',{bpm:150,v:.8});},
  defeat:()=>{seq([67,[63,2],[60,4]],'brass',{bpm:90,v:.8});seq([[43,7]],'subbass',{bpm:90,v:.8});},
  levelup:()=>seq([72,76,79,84],'bell',{bpm:300}),
  prestige:()=>{seq([60,64,67,72,76,79,84,[88,4]],'harp',{bpm:360});for(const m of[72,76,79,84])INST.warmpad(m,ctx.currentTime+.6,1.4,sfxBus,2.2);},
  summon_Common:()=>seq([72,79],'pluck',{bpm:360}),
  summon_Rare:()=>seq([72,76,79],'bell',{bpm:360}),
  summon_Epic:()=>seq([72,76,79,84],'bell',{bpm:340,v:1.1}),
  summon_Legendary:()=>{seq([72,76,79,84,[88,3]],'bell',{bpm:320,v:1.2});seq([[60,6]],'warmpad',{bpm:320,v:2});},
  summon_Mythic:()=>{seq([67,72,76,79,84,88,[91,4]],'harp',{bpm:380,v:1.2});seq([[55,4],[60,6]],'brass',{bpm:200,v:.9,start:.3});},
  summon_Secret:()=>{seq([[57,2],[60,2],[63,2],[69,4]],'organ',{bpm:160,v:1.4});seq([81,84,87,[93,4]],'bell',{bpm:260,v:1,start:.9});noise(ctx.currentTime,.9,sfxBus,{peak:.05,type:'bandpass',freq:300,q:.7,a:.4,r:.6,sweepTo:2400});},
  trait_Mythic:()=>{seq([76,79,83,88,[91,3]],'bell',{bpm:340,v:1.1});},
  boss:()=>{seq([[45,3],[44,5]],'brass',{bpm:110,v:1});INST.kick(ctx.currentTime+.05,sfxBus,1.2);INST.tom(ctx.currentTime+.3,sfxBus,1,80);},
};

/* ---------- sound effects with throttling ---------- */
const last={};let active=0;
const LIMIT={attack:55,ui:40,death:45,coin:120,default:30};
function canPlay(name,group){if(!ensure()||prefs.muted||ctx.state!=='running')return false;const now=performance.now(),gap=LIMIT[group]||LIMIT.default;if(last[name]&&now-last[name]<gap)return false;if(active>14)return false;last[name]=now;active++;setTimeout(()=>active--,250);return true;}
const SFX={
  click:()=>osc('triangle',880,ctx.currentTime,.01,sfxBus,{a:.001,peak:.05,d:.04,sus:0,r:.03}),
  tab:()=>{osc('triangle',660,ctx.currentTime,.01,sfxBus,{a:.001,peak:.045,d:.04,sus:0,r:.03});osc('triangle',990,ctx.currentTime+.035,.01,sfxBus,{a:.001,peak:.035,d:.04,sus:0,r:.03});},
  place:()=>{INST.tom(ctx.currentTime,sfxBus,.9,95);noise(ctx.currentTime,.06,sfxBus,{peak:.05,type:'lowpass',freq:900,r:.08});},
  upgrade:()=>seq([76,81,88],'bell',{bpm:520,v:.8}),
  sell:()=>seq([84,79],'bell',{bpm:420,v:.7}),
  coin:()=>{const t=ctx.currentTime;osc('square',1568,t,.03,sfxBus,{a:.001,peak:.03,d:.05,sus:0,r:.04,filter:5000});osc('square',2093,t+.05,.05,sfxBus,{a:.001,peak:.03,d:.08,sus:0,r:.08,filter:5000});},
  wave:()=>{INST.tom(ctx.currentTime,sfxBus,1.1,90);INST.tom(ctx.currentTime+.14,sfxBus,1,110);},
  life:()=>{const t=ctx.currentTime;osc('square',440,t,.08,sfxBus,{a:.002,peak:.06,d:.05,sus:.7,r:.04,filter:2000});osc('square',330,t+.12,.12,sfxBus,{a:.002,peak:.06,d:.05,sus:.7,r:.06,filter:2000});},
  death:()=>noise(ctx.currentTime,.08,sfxBus,{peak:.11,type:'bandpass',freq:700+Math.random()*500,q:1.2,r:.06,sweepTo:250}),
  feed:()=>{const t=ctx.currentTime;for(let i=0;i<3;i++)noise(t+i*.07,.03,sfxBus,{peak:.06,type:'bandpass',freq:1500+i*300,q:3,r:.02});osc('sine',600,t+.22,.05,sfxBus,{a:.005,peak:.05,d:.08,sus:0,r:.05});},
  reroll:()=>{const t=ctx.currentTime;for(let i=0;i<5;i++)osc('triangle',700+i*180,t+i*.035,.01,sfxBus,{a:.001,peak:.04,d:.03,sus:0,r:.02});},
  claim:()=>seq([79,84,88],'bell',{bpm:440,v:.8}),
  error:()=>osc('square',180,ctx.currentTime,.08,sfxBus,{a:.002,peak:.05,d:.05,sus:.5,r:.05,filter:900}),
  // attacks
  arrow:()=>{noise(ctx.currentTime,.05,sfxBus,{peak:.035,type:'bandpass',freq:2500,q:2,r:.03,sweepTo:1200});osc('triangle',220,ctx.currentTime,.01,sfxBus,{a:.001,peak:.03,d:.04,sus:0,r:.02});},
  bullet:()=>{noise(ctx.currentTime,.03,sfxBus,{peak:.07,type:'lowpass',freq:3000,r:.05});osc('square',120,ctx.currentTime,.01,sfxBus,{a:.001,peak:.04,d:.03,sus:0,r:.02,filter:800});},
  bolt:()=>{const o=osc('sine',900,ctx.currentTime,.06,sfxBus,{a:.002,peak:.04,d:.05,sus:.3,r:.05});o.frequency.exponentialRampToValueAtTime(1600,ctx.currentTime+.08);},
  fire:()=>noise(ctx.currentTime,.12,sfxBus,{peak:.05,type:'lowpass',freq:600,q:1,a:.02,r:.1,sweepTo:2200}),
  frost:()=>{const t=ctx.currentTime;osc('sine',2400,t,.02,sfxBus,{a:.001,peak:.03,d:.08,sus:0,r:.06});osc('sine',3150,t+.03,.02,sfxBus,{a:.001,peak:.025,d:.08,sus:0,r:.06});},
  poison:()=>{const t=ctx.currentTime;osc('sine',300,t,.03,sfxBus,{a:.005,peak:.04,d:.05,sus:0,r:.03});osc('sine',420,t+.06,.03,sfxBus,{a:.005,peak:.03,d:.05,sus:0,r:.03});},
  void:()=>{const o=osc('sawtooth',110,ctx.currentTime,.12,sfxBus,{a:.01,peak:.035,d:.05,sus:.6,r:.08,filter:700});o.frequency.exponentialRampToValueAtTime(60,ctx.currentTime+.18);},
  beam:()=>osc('sine',1320,ctx.currentTime,.1,sfxBus,{a:.005,peak:.03,d:.05,sus:.5,r:.1,vib:.01}),
  slash:()=>noise(ctx.currentTime,.06,sfxBus,{peak:.05,type:'bandpass',freq:3200,q:1.2,r:.04,sweepTo:900}),
  explode:()=>{noise(ctx.currentTime,.25,sfxBus,{peak:.09,type:'lowpass',freq:1200,r:.2,sweepTo:180});INST.kick(ctx.currentTime,sfxBus,.6);},
};
const GROUP={arrow:'attack',bullet:'attack',bolt:'attack',fire:'attack',frost:'attack',poison:'attack',void:'attack',beam:'attack',slash:'attack',explode:'attack',click:'ui',tab:'ui',death:'death',coin:'coin'};
function sfx(name){if(!SFX[name])return;if(!canPlay(name,GROUP[name]))return;try{SFX[name]()}catch(e){}}
function jingle(name){if(!JINGLES[name])return;if(!ensure()||prefs.muted||ctx.state!=='running')return;if(last['j_'+name]&&performance.now()-last['j_'+name]<350)return;last['j_'+name]=performance.now();try{JINGLES[name]()}catch(e){}}
function duck(sec=2.5){if(!ctx||!musicBus)return;const t=ctx.currentTime;musicBus.gain.cancelScheduledValues(t);musicBus.gain.setTargetAtTime(.25,t,.08);musicBus.gain.setTargetAtTime(1,t+sec,.5);}
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend().catch(()=>{});else if(!prefs.muted)ctx.resume().catch(()=>{});});
return {loadPrefs,savePrefs,prefs,unlock,applyVolumes,startTrack,stopMusic,setIntensity,sfx,jingle,duck,THEMES,get ctx(){return ctx},get current(){return current&&current.name}};
})();
