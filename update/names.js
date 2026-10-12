// ---------- Unique player names (2026.10.11.23) ----------
// Online players claim a unique, permanent name. The server checks every name: 3-16 letters,
// numbers or _, starting with a letter; names that look alike (case, 0/O, 1/l/I, _) count as the same;
// blocked words are refused. Offline players keep a local name that no one else sees.
const GG_NAME_RE=/^[A-Za-z][A-Za-z0-9_]{2,15}$/;
const GG_NAME_WHY={format:'Use 3–16 letters, numbers or _, starting with a letter.',blocked:'That name is not allowed. Please choose another.',taken:'That name is already taken (names that look the same count as taken).',permanent:'Your player name is permanent.',signin:'Sign in to Cloud Save first.'};
async function ggRpc(fn,body,auth){if(auth&&!await ggCloudToken())return {ok:false,status:0,data:null};return ggCloudFetch('/rest/v1/rpc/'+fn,{method:'POST',auth:!!auth,body:body||{}});}
// Load this account's name from the server and use it everywhere in the game.
async function ggNameSync(prompt){
  if(!ggCloud.session)return;
  const r=await ggRpc('my_profile',{},true);if(!r.ok)return;
  const p=r.data&&r.data.name?r.data:null;
  ggCloud.profile=p?{name:p.name,renames:p.renames||0}:null;ggCloudStore();
  if(p&&S.playerName!==p.name){S.playerName=p.name;save(false);}
  try{renderProfile()}catch(e){}ggCloudRender();
  // If the player still has to choose between two saves, ask for the name right after that choice.
  if(!p&&prompt){if(ggCloud.conflict)ggNamePending=true;else ggNameOpen();}
}
let ggNamePending=false;
(function(){const o=ggCloudUpload;ggCloudUpload=async function(){const r=await o.apply(this,arguments);if(r&&r.ok&&ggNamePending&&ggCloud.session&&!ggCloud.profile){ggNamePending=false;setTimeout(ggNameOpen,300);}return r;};})();
// Claim dialog with a live availability check.
document.body.insertAdjacentHTML('beforeend','<div id="ggNameModal" class="settings-panel hide" role="dialog" aria-modal="true" aria-labelledby="ggNameTitle"><div class="settings-box gg-name-box"><h2 id="ggNameTitle">Choose your player name</h2><p class="gg-name-rules">This is the name other players will see. It must be unique, and <b>it cannot be changed later</b>.</p><input id="ggNameInput" maxlength="16" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="3–16 letters, numbers or _" aria-describedby="ggNameStatus"><p id="ggNameStatus" class="gg-name-status" role="status"></p><small class="gg-name-hint">Letters, numbers and _ only, starting with a letter. Names that look alike (like Josh, JOSH and J0sh) count as the same name.</small><div class="row"><button id="ggNameClaim" disabled>Claim name</button><button class="alt" id="ggNameLater">Later</button></div></div></div>');
let ggNameTimer=0,ggNameSeq=0;
function ggNameSetStatus(txt,kind){const s=$('#ggNameStatus');s.textContent=txt||'';s.className='gg-name-status'+(kind?' '+kind:'');$('#ggNameClaim').disabled=kind!=='ok';}
function ggNameCheck(){const v=$('#ggNameInput').value.trim();clearTimeout(ggNameTimer);
  if(!v)return ggNameSetStatus('','');
  if(!GG_NAME_RE.test(v))return ggNameSetStatus(GG_NAME_WHY.format,'bad');
  ggNameSetStatus('Checking…','wait');const seq=++ggNameSeq;
  ggNameTimer=setTimeout(async()=>{const r=await ggRpc('name_problem',{n:v},false);if(seq!==ggNameSeq)return;
    if(!r.ok)return ggNameSetStatus(ggCloudErr(r),'bad');
    const why=r.data;if(why)ggNameSetStatus(GG_NAME_WHY[why]||'That name cannot be used.','bad');else ggNameSetStatus('✓ '+v+' is available!','ok');},400);}
function ggNameOpen(){if(!ggCloud.session){toast(GG_NAME_WHY.signin);return;}if(ggCloud.profile){toast(GG_NAME_WHY.permanent);return;}
  const i=$('#ggNameInput');i.value=GG_NAME_RE.test(S.playerName||'')&&S.playerName!=='Player'?S.playerName:'';$('#ggNameModal').classList.remove('hide');ggNameCheck();setTimeout(()=>i.focus(),50);}
$('#ggNameInput').addEventListener('input',ggNameCheck);
$('#ggNameInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!$('#ggNameClaim').disabled)$('#ggNameClaim').click();});
$('#ggNameLater').onclick=()=>{$('#ggNameModal').classList.add('hide');toast('You can choose your name later in Settings → Cloud Save or in your Profile.');};
$('#ggNameClaim').onclick=async()=>{const v=$('#ggNameInput').value.trim();if(!GG_NAME_RE.test(v))return ggNameCheck();
  if(!confirm('Your player name will be "'+v+'".\n\nNames are permanent and cannot be changed later. Continue?'))return;
  $('#ggNameClaim').disabled=true;ggNameSetStatus('Claiming…','wait');
  const r=await ggRpc('claim_player_name',{new_name:v},true);
  if(!r.ok)return ggNameSetStatus(ggCloudErr(r),'bad');
  const d=r.data||{};if(!d.ok){if(d.reason==='permanent'&&d.name){await ggNameSync(false);$('#ggNameModal').classList.add('hide');return toast(GG_NAME_WHY.permanent);}return ggNameSetStatus(GG_NAME_WHY[d.reason]||'That name cannot be used.','bad');}
  ggCloud.profile={name:d.name,renames:d.renames||0};ggCloudStore();S.playerName=d.name;save(false);
  $('#ggNameModal').classList.add('hide');try{renderProfile()}catch(e){}ggCloudRender();toast('Welcome, '+d.name+'! Your name is now yours.');};
// Cloud Save panel: show the claimed name, or a button to choose one.
(function(){const o=ggCloudRender;ggCloudRender=function(msg){const r=o.apply(this,arguments);try{
  const u=$('#ggCloudBody .gg-cloud-user');if(u&&ggCloud.session&&!$('#ggCloudBody .gg-name-line')){
    u.insertAdjacentHTML('afterend',ggCloud.profile?'<p class="gg-name-line">Player name: <b>'+ggEsc(ggCloud.profile.name)+'</b> <span class="gg-name-lock">🔒 permanent</span></p>':'<p class="gg-name-line gg-name-missing">No player name yet. <button class="gg-linkbtn" id="ggNamePick">Choose your unique name</button></p>');
    const b=$('#ggNamePick');if(b)b.onclick=ggNameOpen;}}catch(e){}return r;};})();
// Profile: the name box follows the online name when signed in.
(function(){const o=renderProfile;renderProfile=function(){const r=o.apply(this,arguments);try{
  const inp=$('#playerName'),btn=$('#savePlayerName');if(!inp||!btn)return r;
  let note=$('#ggNameNote');if(!note){inp.closest('.row').insertAdjacentHTML('afterend','<p id="ggNameNote" class="gg-name-note"></p>');note=$('#ggNameNote');}
  if(ggCloud.session&&ggCloud.profile){inp.value=ggCloud.profile.name;inp.disabled=true;btn.textContent='🔒 Permanent';btn.disabled=true;note.textContent='Your unique player name is reserved online. Names are permanent.';
    $('#headerPlayer').textContent=ggCloud.profile.name+' ✓ · Lv '+S.playerLevel;}
  else if(ggCloud.session){inp.disabled=false;inp.maxLength=16;btn.disabled=false;btn.textContent='Claim name';note.textContent='Claim a unique name so no one else can use it. Names are permanent.';}
  else{inp.disabled=false;inp.maxLength=24;btn.disabled=false;btn.textContent='Save name';note.textContent='Offline name, seen only on this device. Sign in to Cloud Save (Settings) to claim a unique name online.';}
}catch(e){}return r;};})();
(function(){const btn=$('#savePlayerName');if(!btn)return;const orig=btn.onclick;btn.onclick=function(e){
  if(ggCloud.session&&ggCloud.profile){toast(GG_NAME_WHY.permanent);return;}
  if(ggCloud.session){const v=$('#playerName').value.trim();ggNameOpen();$('#ggNameInput').value=v;ggNameCheck();return;}
  return orig&&orig.call(this,e);};})();
// Sign in, sign out and account deletion keep the name in step.
(function(){const o=ggCloudAfterLogin;ggCloudAfterLogin=async function(){const r=await o.apply(this,arguments);await ggNameSync(true);return r;};})();
(function(){const o=ggCloudSignOut;ggCloudSignOut=async function(){ggCloud.profile=null;ggCloudStore();const r=await o.apply(this,arguments);try{renderProfile()}catch(e){}return r;};})();
(function(){const o=ggCloudDelete;ggCloudDelete=async function(){const r=await o.apply(this,arguments);if(!ggCloud.session){ggCloud.profile=null;ggCloudStore();try{renderProfile()}catch(e){}}return r;};})();
// Buttons were bound to the old functions when the panel was drawn; redraw so they use the new ones.
ggCloudView='';ggCloudRender();
if(ggCloud.session)setTimeout(()=>ggNameSync(true),2500);
