// ---------- Cleaner screens (2026.10.11.18) ----------
// Long rule paragraphs move behind small ⓘ buttons that open an info card, so each screen
// shows only what the player needs right now. All text is kept; nothing about the rules changes.
document.body.insertAdjacentHTML('beforeend','<div id="ggInfo" class="settings-panel hide" role="dialog" aria-modal="true" aria-labelledby="ggInfoTitle"><div class="settings-box gg-info-box"><div class="row" style="justify-content:space-between;align-items:center"><h2 id="ggInfoTitle"></h2><button class="alt" id="closeInfo">Close ✕</button></div><div id="ggInfoBody"></div></div></div>');
$('#closeInfo').onclick=()=>$('#ggInfo').classList.add('hide');
$('#ggInfo').addEventListener('click',e=>{if(e.target.id==='ggInfo')$('#ggInfo').classList.add('hide');});
function ggOpenInfo(title,parts){$('#ggInfoTitle').textContent=title;$('#ggInfoBody').innerHTML=parts.filter(Boolean).map(n=>'<div class="gg-info-part">'+(typeof n==='string'?n:n.innerHTML)+'</div>').join('');$('#ggInfo').classList.remove('hide');}
function ggInfoButton(host,title,getParts){if(!host||host.querySelector('.gg-info-btn'))return;const b=document.createElement('button');b.type='button';b.className='gg-info-btn';b.setAttribute('aria-label','More about '+title);b.title='More info';b.textContent='i';
  b.onclick=e=>{e.stopPropagation();ggOpenInfo(title,getParts());};host.appendChild(b);}
function ggTuck(...nodes){nodes.forEach(n=>n&&n.classList.add('gg-tucked'));return nodes.filter(Boolean);}
(function ggTidy(){
  // Summon banner: description and odds go into the info card.
  const pool=$('#summonPool'),bp=pool&&pool.closest('.panel');
  if(bp){const p=bp.querySelector(':scope > p:not([id])'),sm=bp.querySelector(':scope > small');ggTuck(p,sm);
    ggInfoButton(bp.querySelector('h2'),'Summon banner & odds',()=>[p,sm,'Ten pulls always include at least one Epic or better. Exclusive units can never be summoned.']);}
  const res=$('#res');if(res&&/^Rarity odds:/.test(res.textContent.trim()))res.textContent='Odds: Common 65% · Rare 20% · Epic 7.5% · Legendary 5% · Mythic 2% · Secret 0.5% (Lv 10+)';
  // Units: loadout rules and the prestige note.
  const slots=$('#loadoutSlots'),lp=slots&&slots.closest('.panel');
  if(lp){const p=lp.querySelector(':scope > p');const pn=[...document.querySelectorAll('#units > .panel')].find(x=>/^Prestige a unit/.test(x.textContent.trim()));ggTuck(p,pn);
    ggInfoButton(lp.querySelector('h2'),'Team & prestige rules',()=>[p,pn]);}
  // Traits: forge rules.
  const tp=$('#traits .panel');if(tp){const p=tp.querySelector(':scope > p:not([id])');ggTuck(p);const st=$('#autoTraitStatus');
    ggInfoButton(tp.querySelector('h2'),'Trait Forge rules',()=>[p,st&&('<b>Auto Reroll:</b> '+st.innerHTML)]);}
  // AFK: reward rules.
  const ap=$('#afk .panel');if(ap){const p=ap.querySelector(':scope > p:not([id])'),s=$('#afkSummary');ggTuck(p,s);
    const sh=document.createElement('p');sh.className='gg-short';sh.textContent='Earn 5–10 gems every minute while AFK mode stays open.';ap.querySelector('h2').after(sh);
    ggInfoButton(ap.querySelector('h2'),'AFK rewards',()=>[p,s]);}
  // Raids: rules line.
  const rp=$('#raidPanel');if(rp){const p=rp.querySelector(':scope > p:not([id])');ggTuck(p);ggInfoButton(rp.querySelector('h2'),'Raid rules',()=>[p]);}
  // Battle: enemy scaling note becomes one short line.
  const en=$('.enemy-note > span');if(en&&!en.dataset.full){en.dataset.full=en.innerHTML;const full=en.innerHTML;en.innerHTML='<span class="ggi-wrap">'+GGI.demon+'</span>Enemies get tougher when your team is very strong.';
    ggInfoButton(en,'Enemy strength',()=>[full]);}
})();
