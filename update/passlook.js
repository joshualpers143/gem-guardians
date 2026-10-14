// ---------- New Passes window look (2026.10.11.39) ----------
// VIP is a featured card at the top, the other passes sit in a grid of colored cards with a short tagline
// and clear "what you get" points, and the header shows how many passes the account owns.
const GG_PASS_LOOK={
 vip:{c1:'#fde047',c2:'#d97706',tag:'The ultimate boost',pts:['+25% gems from battles, raids, AFK and quests','+25% unit EXP and +50% player EXP','Gold name with a crown and a golden glow under your units']},
 speed3:{c1:'#38bdf8',c2:'#4f46e5',tag:'Every battle at triple speed',pts:['Speed ×3 in maps, raids and Infinite Mode','Ranked runs are timed for ×3','Speed ×1 and ×2 stay free']},
 raidauto:{c1:'#fb7185',c2:'#7c3aed',tag:'Let the Tactician raid for you',pts:['Auto Play in Duskmoor Castle raids','Every raid level you have unlocked','Works with Auto Restart']},
 afk2:{c1:'#a5b4fc',c2:'#1e40af',tag:'Double rewards while you rest',pts:['10–20 AFK gems every minute (normally 5–10)','10% trait reroll chance each minute (normally 5%)']},
 autosum:{c1:'#6ee7b7',c2:'#0f766e',tag:'Summon sooner, never stop early',pts:['Auto Summon starts from 450 gems (normally over 1,000)','Waits for gems instead of stopping below 400']},
 autotrait:{c1:'#f9a8d4',c2:'#9333ea',tag:'Hands-free trait hunting',pts:['Auto Reroll in the Trait Forge','Stops on a great trait or your target','Rolls cost rerolls or gems as usual']}
};
function ggPassState(id){const cre=GG_EDITION!=='public',own=cre||ggServerPasses().includes(id),leg=!own&&ggLegacyPasses().includes(id);return {cre,own,leg};}
ggShopRender=function(){
  const ids=Object.keys(GG_PASSES),order=ids.includes('vip')?['vip'].concat(ids.filter(x=>x!=='vip')):ids;
  let owned=0;
  const cards=order.map(id=>{const p=GG_PASSES[id],L=GG_PASS_LOOK[id]||{c1:'#c4b5fd',c2:'#6d28d9',tag:'',pts:[p.d]},s=ggPassState(id);if(s.own||s.leg)owned++;
    const st=s.cre?'<span class="gg-pass-own">✓ Unlocked in Creator Edition</span>':s.own?'<span class="gg-pass-own">✓ Owned</span>':s.leg?'<span class="gg-pass-own">✓ Free for early players — thank you!</span>':'<button class="alt gg-pass-soon" disabled>Coming soon</button>';
    const extra=s.leg&&id==='speed3'?'<small class="gg-pass-sub">Ranked leaderboard runs need the pass on your account. Accounts that existed before this update already have it.</small>':'';
    return '<div class="gg-pass gg-pass2'+(id==='vip'?' gg-pass-hero':'')+(s.own||s.leg?' owned':'')+'" id="ggPass_'+id+'" style="--c1:'+L.c1+';--c2:'+L.c2+'" title="'+ggEsc(p.d)+'">'
      +(s.own||s.leg?'<span class="gg-pass-ribbon">OWNED</span>':'')
      +'<div class="gg-pass-top"><div class="gg-pass-ico"><span>'+p.i+'</span></div><div class="gg-pass-head"><b>'+ggEsc(p.n)+'</b><span class="gg-pass-perm">Permanent</span>'+(L.tag?'<em class="gg-pass-tag">'+ggEsc(L.tag)+'</em>':'')+'</div></div>'
      +'<ul class="gg-pass-pts">'+L.pts.map(t=>'<li>'+ggEsc(t)+'</li>').join('')+'</ul>'+extra
      +'<div class="gg-pass-act">'+st+'</div></div>';}).join('');
  const n=order.length,pct=Math.round(owned/n*100);
  $('#ggShopList').innerHTML='<div class="gg-shop-progress"><div><b>'+owned+' of '+n+'</b> passes on '+(GG_EDITION!=='public'?'this edition':'your account')+'</div><div class="gg-shop-bar"><i style="width:'+pct+'%"></i></div></div>'+cards;
  const body=$('#ggShopRedeemBody');
  if(GG_EDITION!=='public'){body.innerHTML='<small>Codes are redeemed in the Public Edition.</small>';return;}
  if(!ggCloud.session){body.innerHTML='<small>Sign in to Cloud Save so your passes are saved to your account.</small> <button class="gg-linkbtn" id="ggShopSignIn">Sign in</button>';$('#ggShopSignIn').onclick=()=>{$('#ggShop').classList.add('hide');ggGoToCloudSave();};return;}
  if(!$('#ggCodeIn')){body.innerHTML='<div class="row"><input id="ggCodeIn" maxlength="40" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Enter code" aria-label="Redeem code"><button id="ggCodeGo">Redeem</button></div>';
    ggNetTag('#ggCodeGo','Redeeming a code');$('#ggCodeGo').onclick=ggRedeem;$('#ggCodeIn').addEventListener('keydown',e=>{if(e.key==='Enter')ggRedeem();});}
  try{ggNetApply()}catch(e){}};
