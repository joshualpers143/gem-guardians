// ---------- Visual overhaul (2026.10.11.15) ----------
// Hand-drawn SVG icon set (replaces emoji, which look different on every phone),
// richer summon altar, summon reveal animation and polished headers. Game logic is unchanged.
const GGI=(()=>{
  const d=(body,vb='0 0 24 24')=>`<svg class="ggi" viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
  const I={
    gem:d('<defs><linearGradient id="ggiGem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6fdff"/><stop offset=".5" stop-color="#5fe3f5"/><stop offset="1" stop-color="#2c74ff"/></linearGradient></defs><path d="M6.5 3.5h11L22 9l-10 12L2 9z" fill="url(#ggiGem)" stroke="#0b2a55" stroke-width="1.2" stroke-linejoin="round"/><path d="M2 9h20M6.5 3.5 9 9l3 12 3-12 2.5-5.5" fill="none" stroke="#0b2a55" stroke-width=".9" stroke-linejoin="round" opacity=".55"/><path d="M8 5.2 9.4 8" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>'),
    map:d('<path d="M3 6.2 8.5 4l7 2.4L21 4.2v13.6L15.5 20l-7-2.4L3 19.8z" fill="#e9cf8f" stroke="#5a3d12" stroke-width="1.2" stroke-linejoin="round"/><path d="M8.5 4v13.6M15.5 6.4V20" stroke="#5a3d12" stroke-width=".9" opacity=".5"/><path d="M5.5 15.5c2-1 3-3.5 5.5-3.5s3 2 5-1" fill="none" stroke="#c0392b" stroke-width="1.4" stroke-dasharray="1.6 1.4" stroke-linecap="round"/><path d="M17.6 6.6a2 2 0 1 1-.01 0zM17.6 11.2l-1.5-2.6h3z" fill="#2fbf71" stroke="#145a34" stroke-width=".8"/>'),
    swords:d('<path d="M4 3.5 14.6 14.1l1.8-1.8L5.8 1.7 3.3 1.2z" fill="#dfe8f5" stroke="#3b4a63" stroke-width="1" stroke-linejoin="round"/><path d="M20 3.5 9.4 14.1l-1.8-1.8L18.2 1.7l2.5-.5z" fill="#dfe8f5" stroke="#3b4a63" stroke-width="1" stroke-linejoin="round"/><path d="m6.2 13.2 4.6 4.6M13.2 17.8l4.6-4.6" stroke="#e0a526" stroke-width="2.2" stroke-linecap="round"/><path d="m8.4 16.6-3.6 3.6M15.6 16.6l3.6 3.6" stroke="#7a4a18" stroke-width="2.4" stroke-linecap="round"/><circle cx="4.3" cy="20.6" r="1.3" fill="#e0a526"/><circle cx="19.7" cy="20.6" r="1.3" fill="#e0a526"/>'),
    shield:d('<path d="M12 2.2 20 5v6.4c0 5-3.4 8.6-8 10.4-4.6-1.8-8-5.4-8-10.4V5z" fill="#3d7bf5" stroke="#10275a" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 4.3 18 6.4v5c0 3.8-2.4 6.6-6 8.2z" fill="#255bd0"/><path d="M12 7.2l1.4 2.9 3.1.4-2.3 2.1.6 3.1-2.8-1.6-2.8 1.6.6-3.1-2.3-2.1 3.1-.4z" fill="#ffd34d" stroke="#8a5a00" stroke-width=".6" stroke-linejoin="round"/>'),
    moon:d('<path d="M15.5 3.2A8.8 8.8 0 1 0 20.8 16 7.2 7.2 0 0 1 15.5 3.2z" fill="#b9a3ff" stroke="#3d2b8a" stroke-width="1.2" stroke-linejoin="round"/><path d="M13.6 5.6a7 7 0 0 0 5.3 11.6" fill="none" stroke="#fff" stroke-width=".9" opacity=".45"/><path d="m19 3.3.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5zM21.6 9.2l.35.9.9.35-.9.35-.35.9-.35-.9-.9-.35.9-.35z" fill="#ffe27a"/>'),
    sparkle:d('<path d="m10 2 1.9 5.6L17.5 9.5l-5.6 1.9L10 17l-1.9-5.6L2.5 9.5l5.6-1.9z" fill="#ffd34d" stroke="#8a5a00" stroke-width="1" stroke-linejoin="round"/><path d="m18.5 13 1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill="#ff9be8" stroke="#7a1f63" stroke-width=".8" stroke-linejoin="round"/><circle cx="19" cy="5" r="1.4" fill="#7ff3ff"/>'),
    book:d('<path d="M2.5 5.5C5.5 4 9 4.2 12 6c3-1.8 6.5-2 9.5-.5v13c-3-1.5-6.5-1.3-9.5.5-3-1.8-6.5-2-9.5-.5z" fill="#f4e6c4" stroke="#5a3d12" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 6v13" stroke="#5a3d12" stroke-width="1"/><path d="M4.5 8.6c1.8-.6 3.8-.5 5.5.3M4.5 11.4c1.8-.6 3.8-.5 5.5.3M14 8.9c1.7-.8 3.7-.9 5.5-.3M14 11.7c1.7-.8 3.7-.9 5.5-.3" stroke="#b08a4a" stroke-width=".9" stroke-linecap="round"/><path d="M16.5 4.4v6l1.3-1 1.3 1V4.5z" fill="#e84b5f"/>'),
    bag:d('<path d="M8.5 6.5V5a3.5 3.5 0 0 1 7 0v1.5" fill="none" stroke="#5a3415" stroke-width="1.6"/><path d="M4.5 8.2c0-1 .8-1.7 1.8-1.7h11.4c1 0 1.8.7 1.8 1.7l.8 10.6c.1 1.3-.9 2.2-2.1 2.2H5.8c-1.2 0-2.2-.9-2.1-2.2z" fill="#b8733a" stroke="#4a2a10" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.4 10.5h15.2" stroke="#4a2a10" stroke-width="1"/><rect x="10" y="9" width="4" height="3.6" rx=".8" fill="#ffd34d" stroke="#8a5a00" stroke-width=".8"/>'),
    scroll:d('<path d="M6 3.5h11.5a2 2 0 0 1 2 2V17" fill="none" stroke="#5a3d12" stroke-width="1.2"/><path d="M5 5.5a2 2 0 0 1 2-2h10.5v14.2a2.8 2.8 0 0 1-2.8 2.8H6.5A2.5 2.5 0 0 1 4 18V6.5" fill="#f4e6c4" stroke="#5a3d12" stroke-width="1.2" stroke-linejoin="round"/><path d="m7.5 9 1.2 1.2 2.3-2.4M7.5 13.5l1.2 1.2 2.3-2.4" fill="none" stroke="#1f9d55" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 9.2h3.2M12.5 13.7h3.2" stroke="#8a6a3a" stroke-width="1.2" stroke-linecap="round"/>'),
    soundOn:d('<path d="M3.5 9.2h3.6L12 5v14l-4.9-4.2H3.5z" fill="#f3f0ff" stroke="#f3f0ff" stroke-width="1" stroke-linejoin="round"/><path d="M15.2 8.8a4.6 4.6 0 0 1 0 6.4M17.8 6.3a8.2 8.2 0 0 1 0 11.4" fill="none" stroke="#7ff3ff" stroke-width="1.8" stroke-linecap="round"/>'),
    soundOff:d('<path d="M3.5 9.2h3.6L12 5v14l-4.9-4.2H3.5z" fill="#c9c2ea" stroke="#c9c2ea" stroke-width="1" stroke-linejoin="round"/><path d="m15.5 9.3 5.4 5.4M20.9 9.3l-5.4 5.4" stroke="#ff6b81" stroke-width="2" stroke-linecap="round"/>'),
    gear:d('<path d="M10.3 2.5h3.4l.5 2.6 1.7.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.7 2.6.5v3.4l-2.6.5-.8 1.7 1.5 2.2-2.4 2.4-2.2-1.5-1.7.8-.5 2.6h-3.4l-.5-2.6-1.7-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.7-2.6-.5v-3.4l2.6-.5.8-1.7-1.5-2.2 2.4-2.4 2.2 1.5 1.7-.8z" fill="#dcd6f7" stroke="#3a3366" stroke-width="1" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.3" fill="#3a3366"/>'),
    menu:d('<path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="#f3f0ff" stroke-width="2.4" stroke-linecap="round"/>'),
    coin:d('<circle cx="12" cy="12" r="9" fill="#ffc533" stroke="#8a5a00" stroke-width="1.3"/><circle cx="12" cy="12" r="6.4" fill="none" stroke="#c98a1b" stroke-width="1.1"/><path d="M12 7.6v8.8M9.8 9.6c.4-1 1.3-1.4 2.4-1.4 1.6 0 2.4.8 2.4 1.7 0 2.2-4.8 1.3-4.8 3.9 0 1 .9 1.8 2.5 1.8 1.2 0 2.1-.5 2.5-1.5" fill="none" stroke="#8a5a00" stroke-width="1.3" stroke-linecap="round"/>'),
    heart:d('<path d="M12 20.5S3 15 3 9a4.6 4.6 0 0 1 9-1.6A4.6 4.6 0 0 1 21 9c0 6-9 11.5-9 11.5z" fill="#ff4d6d" stroke="#7a1028" stroke-width="1.2" stroke-linejoin="round"/><path d="M6.5 7.6a2.4 2.4 0 0 1 2.6-1.2" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>'),
    wave:d('<path d="M2.5 15c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2v5H2.5z" fill="#2f86ff" stroke="#0c2f6b" stroke-width="1.1" stroke-linejoin="round"/><path d="M2.5 11.5c2.2 0 2.2-6.5 7-6.5 3.3 0 4 2.8 2 4-1.2.7-2.6-.4-1.8-1.4" fill="none" stroke="#7ff3ff" stroke-width="1.8" stroke-linecap="round"/>'),
    hourglass:d('<path d="M6 2.5h12M6 21.5h12" stroke="#c98a1b" stroke-width="2" stroke-linecap="round"/><path d="M7.5 3c0 4.5 4 6 4.5 9-.5 3-4.5 4.5-4.5 9h9c0-4.5-4-6-4.5-9 .5-3 4.5-4.5 4.5-9z" fill="#d6f3ff" stroke="#3b4a63" stroke-width="1.1" stroke-linejoin="round"/><path d="M9.3 6.5h5.4L12 10.5zM9 20c.3-2 2-3 3-3.6 1 .6 2.7 1.6 3 3.6z" fill="#ffc533"/>'),
    demon:d('<path d="M4 4.5 7.4 8M20 4.5 16.6 8" stroke="#ffd0d0" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="13" r="8" fill="#e53950" stroke="#5e0a18" stroke-width="1.2"/><path d="m7.6 11.2 3 1.1M16.4 11.2l-3 1.1" stroke="#2a0008" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.3" cy="13.4" r="1" fill="#ffe27a"/><circle cx="14.7" cy="13.4" r="1" fill="#ffe27a"/><path d="M8.8 17c1.9-1.2 4.5-1.2 6.4 0" fill="none" stroke="#2a0008" stroke-width="1.4" stroke-linecap="round"/>'),
    star:d('<path d="m12 2.6 2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8l-5.8 3.3 1.4-6.4-4.9-4.4 6.5-.7z" fill="#ffd34d" stroke="#8a5a00" stroke-width="1.1" stroke-linejoin="round"/><path d="m9.6 9.2 1.6-3" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>'),
    trophy:d('<path d="M7 3.5h10v5a5 5 0 0 1-10 0z" fill="#ffc533" stroke="#8a5a00" stroke-width="1.1"/><path d="M7 5H4.2c0 3 1.2 4.6 3.3 4.9M17 5h2.8c0 3-1.2 4.6-3.3 4.9" fill="none" stroke="#8a5a00" stroke-width="1.3"/><path d="M10.5 13.2h3l.6 4h-4.2zM8 17.2h8v3.3H8z" fill="#c98a1b" stroke="#8a5a00" stroke-width="1"/>'),
    save:d('<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3h11L20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" fill="#5b8cff" stroke="#14286b" stroke-width="1.1"/><path d="M7.5 3h8v5h-8z" fill="#dfe8f5"/><path d="M7 13h10v7H7z" fill="#f3f0ff"/>'),
    news:d('<rect x="3" y="4.5" width="18" height="15" rx="2" fill="#f3f0ff" stroke="#3a3366" stroke-width="1.1"/><rect x="5.5" y="7" width="6" height="5" rx=".8" fill="#7b5cff"/><path d="M13.5 7.8h5M13.5 10.6h5M5.5 14.6h13M5.5 17h9" stroke="#8a84b0" stroke-width="1.2" stroke-linecap="round"/>'),
    phone:d('<rect x="6.5" y="2.5" width="11" height="19" rx="2.4" fill="#2b2650" stroke="#dcd6f7" stroke-width="1.3"/><rect x="8.2" y="5" width="7.6" height="12.5" rx=".8" fill="#5fe3f5"/><circle cx="12" cy="19.4" r=".9" fill="#dcd6f7"/>'),
    cap:d('<path d="M12 4 2 9l10 5 10-5z" fill="#3d2b8a" stroke="#dcd6f7" stroke-width="1.1" stroke-linejoin="round"/><path d="M6 11.2v4.3c1.7 1.6 3.8 2.3 6 2.3s4.3-.7 6-2.3v-4.3L12 14z" fill="#574a9e" stroke="#dcd6f7" stroke-width="1.1" stroke-linejoin="round"/><path d="M20.5 9.8v5" stroke="#ffd34d" stroke-width="1.4" stroke-linecap="round"/><circle cx="20.5" cy="15.5" r="1.1" fill="#ffd34d"/>'),
    lock:d('<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#c9c2ea" stroke-width="1.8"/><rect x="5.5" y="10.5" width="13" height="10" rx="2" fill="#ffc533" stroke="#8a5a00" stroke-width="1.1"/><circle cx="12" cy="15" r="1.4" fill="#8a5a00"/><path d="M12 15.5v2.2" stroke="#8a5a00" stroke-width="1.3" stroke-linecap="round"/>'),
    user:d('<circle cx="12" cy="8.2" r="4.2" fill="#dcd6f7" stroke="#3a3366" stroke-width="1.1"/><path d="M4 20.5c.8-4.2 4-6.3 8-6.3s7.2 2.1 8 6.3z" fill="#7b5cff" stroke="#3a3366" stroke-width="1.1" stroke-linejoin="round"/>'),
    sprout:d('<path d="M12 21v-8" stroke="#2f7a3a" stroke-width="1.8" stroke-linecap="round"/><path d="M12 13C12 8 8.5 5.5 3.8 6c0 4.6 3 7.4 8.2 7z" fill="#5fd36b" stroke="#1f5a2a" stroke-width="1.1"/><path d="M12 11.5c0-4.5 3.2-6.8 8.2-6.6 0 4.4-3 7.2-8.2 6.6z" fill="#8be37a" stroke="#1f5a2a" stroke-width="1.1"/>'),
  };
  return I;
})();
function ggIcon(name){return GGI[name]||'';}
// Leading emoji -> icon, used on headings and buttons.
const GG_EMOJI_ICON={'💎':'gem','🗺️':'map','🗺':'map','⚔️':'swords','⚔':'swords','🛡️':'shield','🛡':'shield','🌙':'moon','✨':'sparkle','📖':'book','🎒':'bag','🎯':'scroll','⚙':'gear','⚙️':'gear','💰':'coin','❤️':'heart','🌊':'wave','⏳':'hourglass','👹':'demon','⭐':'star','🏆':'trophy','💾':'save','📰':'news','📲':'phone','🎓':'cap','🔒':'lock','👤':'user','🌱':'sprout','☰':'menu'};
const GG_EMOJI_RE=new RegExp('^\\s*('+Object.keys(GG_EMOJI_ICON).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\uFE0F?\\s*');
// Swap a leading emoji in an element's first text node for an SVG icon (idempotent).
function ggIconize(el){
  if(!el||el.dataset.ggi)return;
  const t=[...el.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  if(!t||t!==[...el.childNodes].find(n=>!(n.nodeType===3&&!n.textContent.trim())))return;
  const m=t.textContent.match(GG_EMOJI_RE);if(!m)return;
  el.dataset.ggi='1';t.textContent=t.textContent.slice(m[0].length);
  const s=document.createElement('span');s.className='ggi-wrap';s.innerHTML=GGI[GG_EMOJI_ICON[m[1]]];el.insertBefore(s,t);
}
function ggIconizeAll(root=document){
  root.querySelectorAll('main h2,main h3,.settings-box h2,.profile-card h2,header .hdr-more,#openEnemyIndex,#indexTabs button,#ggStartGuide').forEach(ggIconize);
}
(function ggVisualInit(){
  // Main tabs: icon tile + label.
  document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
    const m=b.textContent.match(GG_EMOJI_RE);if(!m)return;
    const label=b.textContent.slice(m[0].length).trim();
    b.innerHTML='<span class="tab-ico">'+GGI[GG_EMOJI_ICON[m[1]]]+'</span><span class="tab-lbl">'+label+'</span>';
  });
  // Header buttons.
  const q=$('#bQuests');if(q){const t=[...q.childNodes].find(n=>n.nodeType===3);if(t)t.remove();q.insertAdjacentHTML('afterbegin',GGI.scroll);}
  const st=$('#bSettings');if(st){const t=[...st.childNodes].find(n=>n.nodeType===3);if(t)t.remove();st.insertAdjacentHTML('afterbegin',GGI.gear);}
  const mo=$('#bMore');if(mo)mo.innerHTML=GGI.menu;
  // Battle stat badges.
  const swap=(sel,icon)=>{const el=$(sel);if(!el)return;const t=[...el.childNodes].find(n=>n.nodeType===3);if(t)t.remove();el.insertAdjacentHTML('afterbegin',GGI[icon]);};
  swap('.bs-coins','coin');swap('.bs-lives','heart');swap('.bs-wave','wave');
  ggIconizeAll();
  // Summon altar: animated crystal above the summon buttons.
  const p1=$('#p1'),p10=$('#p10');
  if(p1&&p10){
    const panel=p1.parentElement;panel.classList.add('summon-altar');
    panel.insertAdjacentHTML('afterbegin','<div class="altar-art" aria-hidden="true"><div class="altar-rays"></div><svg class="altar-crystal" viewBox="0 0 120 150"><defs><linearGradient id="altA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2feff"/><stop offset=".45" stop-color="#7fe3ff"/><stop offset="1" stop-color="#3a5cff"/></linearGradient><linearGradient id="altB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b59bff"/><stop offset="1" stop-color="#3b1f9e"/></linearGradient></defs><ellipse cx="60" cy="138" rx="40" ry="8" fill="#000" opacity=".35"/><path d="M60 8 92 52 60 128 28 52z" fill="url(#altB)"/><path d="M60 8 74 52H46z" fill="#e6fbff"/><path d="M60 8 28 52h18z" fill="#9fdcff"/><path d="M60 8 92 52H74z" fill="#5aa8ff"/><path d="M28 52h18l14 76z" fill="url(#altA)"/><path d="M46 52h28l-14 76z" fill="#6fc8ff"/><path d="M74 52h18L60 128z" fill="#4560e8"/><path d="M60 8 92 52 60 128 28 52z" fill="none" stroke="#f4fbff" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 22 56 34" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg><span class="altar-spark s1"></span><span class="altar-spark s2"></span><span class="altar-spark s3"></span><div class="altar-title">Crystal Summon</div><div class="altar-sub">Featured units rotate every 5 minutes</div></div>');
    p1.innerHTML='<span class="sb-main">Summon ×1</span><span class="sb-cost">'+GGI.gem+'50</span>';
    p10.innerHTML='<span class="sb-main">Summon ×10</span><span class="sb-cost">'+GGI.gem+'450</span>';
    p1.classList.add('summon-btn');p10.classList.add('summon-btn','summon-btn-10');
    const wrapBtns=document.createElement('div');wrapBtns.className='summon-btns';p1.before(wrapBtns);wrapBtns.append(p1,p10);
  }
})();
// Gem counter with icon and thousands separators.
gemUI=function(){const g=$('#gems');if(g){g.innerHTML=GGI.gem+'<b>'+Math.floor(S.gems).toLocaleString()+'</b><span class="gems-lbl"> gems</span>';g.title=S.gems.toLocaleString()+' gems';}};
gemUI();
// Sound button icon follows the mute state.
(function(){const b=$('#bSound');if(!b)return;const sync=()=>{const m=b.getAttribute('aria-pressed')==='false';const want=m?'off':'on';if(b.dataset.icon!==want){b.dataset.icon=want;b.innerHTML=m?GGI.soundOff:GGI.soundOn;}};
  new MutationObserver(()=>{if(!b.querySelector('svg')||b.dataset.icon!==(b.getAttribute('aria-pressed')==='false'?'off':'on')){b.dataset.icon='';sync();}}).observe(b,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['aria-pressed']});sync();})();
// ---- Summon reveal: cards flip in after a manual summon ----
const ggReveal=(()=>{let p={};try{p=JSON.parse(localStorage.getItem('gemGuardiansRevealPrefs')||'{}')||{}}catch(e){}return Object.assign({on:true},p);})();
function ggRevealSave(){try{localStorage.setItem('gemGuardiansRevealPrefs',JSON.stringify(ggReveal))}catch(e){}}
document.body.insertAdjacentHTML('beforeend','<div id="summonReveal" class="summon-reveal hide" role="dialog" aria-modal="true" aria-label="Summon results"><div class="sr-burst"></div><div class="sr-box"><h2 class="sr-title">Summon Results</h2><div id="summonRevealGrid" class="sr-grid"></div><div id="summonRevealNote" class="sr-note"></div><div class="sr-actions"><button type="button" id="summonAgain" class="alt">Summon again</button><button type="button" id="closeSummonReveal">Continue</button></div></div></div>');
let ggRevealLast=1;
function showSummonReveal(n){
  const res=$('#res');if(!res)return;
  const byName={};Object.keys(UNITS).forEach(id=>{byName[UNITS[id].n]=id;});
  const got=[...res.querySelectorAll('b[class]')].map(b=>{const sold=/\(auto-sold\)$/.test(b.textContent);const name=b.textContent.replace(/ \(auto-sold\)$/,'');return {id:byName[name],r:b.className,sold};}).filter(x=>x.id);
  if(!got.length)return;
  const order=GG_RARITY_ORDER;const best=got.reduce((m,g)=>Math.max(m,order.indexOf(g.r)),0);
  const ov=$('#summonReveal');ov.dataset.best=order[best]||'Common';ggRevealLast=n;
  $('#summonRevealGrid').innerHTML=got.map((g,i)=>{const u=UNITS[g.id];return `<div class="sr-card r-${g.r}${g.sold?' sold':''}" style="--i:${i}"><div class="sr-inner"><div class="sr-back">${GGI.gem}</div><div class="sr-front"><canvas class="ico" width="72" height="64" data-id="${g.id}"></canvas><b class="${g.r}">${u.n}</b><small class="${g.r}">${g.r}${g.sold?' · auto-sold':''}</small></div></div></div>`;}).join('');
  $('#summonRevealNote').innerHTML=[...res.querySelectorAll('div')].map(d=>d.textContent).join('<br>');
  $('#summonRevealGrid').style.gridTemplateColumns=got.length===1?'minmax(0,150px)':'';
  try{paintIcons()}catch(e){}
  ov.classList.remove('hide');ov.classList.remove('sr-in');void ov.offsetWidth;ov.classList.add('sr-in');
  $('#summonAgain').textContent='Summon ×'+n+' again';$('#summonAgain').disabled=S.gems<(n===1?50:450);
}
$('#closeSummonReveal').onclick=()=>$('#summonReveal').classList.add('hide');
$('#summonAgain').onclick=()=>{$('#summonReveal').classList.add('hide');ggRevealArm=true;pull(ggRevealLast);};
$('#summonReveal').addEventListener('click',e=>{if(e.target.id==='summonReveal'||e.target.classList.contains('sr-burst'))$('#summonReveal').classList.add('hide');});
// Only summons the player taps (Summon ×1 / ×10 / Summon again) show the reveal.
let ggRevealArm=false;
$('#p1').onclick=()=>{ggRevealArm=true;pull(1);};$('#p10').onclick=()=>{ggRevealArm=true;pull(10);};
(function(){const orig=pull;pull=function(n){const pre=S.gems;const armed=ggRevealArm;ggRevealArm=false;const r=orig.apply(this,arguments);
  try{if(armed&&S.gems<pre&&ggReveal.on&&!(typeof autoSummonActive!=='undefined'&&autoSummonActive)&&!document.getElementById('ggGuide')?.matches(':not(.hide)'))showSummonReveal(n);}catch(e){}
  return r;};})();
// Settings toggle for the reveal animation (next to Performance mode).
(function(){const perf=$('#ggPerf');const row=perf&&perf.closest('label.setting');if(!row)return;
  row.insertAdjacentHTML('afterend','<label class="setting"><span><b>✨ Summon reveal animation</b><small>Show summoned units as cards that flip in. Auto Summon never shows it. Saved on this device only.</small></span><input type="checkbox" id="ggRevealToggle"></label>');
  const t=$('#ggRevealToggle');t.checked=ggReveal.on;t.onchange=()=>{ggReveal.on=t.checked;ggRevealSave();};})();
// Re-apply heading icons after views that rebuild their markup.
(function(){const orig=renderAll;renderAll=function(){const r=orig.apply(this,arguments);try{ggIconizeAll()}catch(e){}return r;};})();
// Battle HUD as icon chips (same information as before).
(function(){const orig=hud;hud=function(){const r=orig.apply(this,arguments);try{if(G){const h=$('#hud');const max=G.mode==='infinite'?'':'/'+(G.raidLevel?raidMaxWave(G.raidLevel):15);
  const chip=(ic,t,c)=>'<span class="hud-chip'+(c?' '+c:'')+'">'+(ic?GGI[ic]:'')+'<span>'+t+'</span></span> ';
  h.innerHTML=(G.raidLevel?chip('swords','Raid Level '+G.raidLevel,'hud-raid'):'')+chip('wave','Wave '+G.wave+max)+chip('',MODES[G.mode].n,'hud-mode')+chip('heart','Lives '+G.lives)+chip('coin','Coins '+G.coins.toLocaleString())+chip('shield','Units '+G.us.length)+((G.teamScale||1)>1.05?chip('demon','Enemy ×'+enemyWaveScale().toFixed(1)):'');}}catch(e){}return r;};})();
// Unit Index: tap a discovered unit for its full skills.
function ggShowUnitById(id){const u=UNITS[id];if(!u)return;const m=$('#unitInfoModal');$('#unitInfoName').textContent=u.n+' — '+u.r+' '+u.t;
  const lines=['Damage '+u.d+(u.rg?' · Range '+u.rg:'')+' · Cost '+u.c+' coins',(typeof u.ability==='string'&&u.ability.trim())||'Standard attack'];
  $('#unitInfoBody').textContent=lines.join('\n\n');$('#unitInfoBody').classList.remove('hide');m.classList.remove('hide');}
(function(){const orig=renderIndex;renderIndex=function(){const r=orig.apply(this,arguments);try{$('#indexGrid').querySelectorAll('.card[data-ix-id]').forEach(c=>{c.onclick=e=>{if(e.target.closest('button'))return;ggShowUnitById(c.dataset.ixId);};});}catch(e){}return r;};})();
