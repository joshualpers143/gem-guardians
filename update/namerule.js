// ---------- Online-only name changes & leaderboard requirement (2026.10.11.24) ----------
// Every name change is checked online, so no two players can end up with the same name.
// Players who are signed out or offline cannot change their name; they are told why.
// Leaderboards (coming later) only accept players who are signed in with a claimed name.
const GG_NAME_OFFLINE='You are offline. Connect to the internet to check whether a name is available.';
function ggIsOnline(){return navigator.onLine!==false;}
// One place that decides who may join leaderboards. The server will enforce the same rule.
function ggCanJoinLeaderboards(){return !!(ggCloud.session&&ggCloud.profile&&ggCloud.profile.name);}
function ggLeaderboardBlockReason(){if(!ggCloud.session)return 'Sign in to Cloud Save and claim your unique player name to join leaderboards.';if(!ggCloud.profile)return 'Claim your unique player name to join leaderboards.';return '';}
// Availability check: show a clear message when offline and keep Claim disabled.
(function(){const oldCheck=ggNameCheck;ggNameCheck=function(){
  const v=$('#ggNameInput').value.trim();
  if(v&&!ggIsOnline()){clearTimeout(ggNameTimer);ggNameSeq++;return ggNameSetStatus(GG_NAME_OFFLINE,'bad');}
  return oldCheck.apply(this,arguments);};
  const i=$('#ggNameInput');i.removeEventListener('input',oldCheck);i.addEventListener('input',()=>ggNameCheck());
  window.addEventListener('online',()=>{if(!$('#ggNameModal').classList.contains('hide'))ggNameCheck();});
  window.addEventListener('offline',()=>{if(!$('#ggNameModal').classList.contains('hide'))ggNameCheck();});})();
// Opening the name picker needs a connection.
(function(){const o=ggNameOpen;ggNameOpen=function(){if(ggCloud.session&&!ggCloud.profile&&!ggIsOnline()){toast(GG_NAME_OFFLINE);return;}return o.apply(this,arguments);};})();
// Claiming re-checks the connection first.
(function(){const b=$('#ggNameClaim'),o=b.onclick;b.onclick=function(e){if(!ggIsOnline()){ggNameSetStatus(GG_NAME_OFFLINE,'bad');return;}return o.call(this,e);};})();
// Open Settings at the Cloud Save panel so the player can sign in.
function ggGoToCloudSave(){try{$('#profileModal').classList.add('hide');}catch(e){}$('#bSettings').click();
  setTimeout(()=>{const c=$('#ggCloud');if(c){c.scrollIntoView({behavior:'smooth',block:'start'});c.classList.add('gg-cloud-flash');setTimeout(()=>c.classList.remove('gg-cloud-flash'),1600);}const em=$('#ggCloudEmail');if(em)em.focus();},150);}
// Profile: signed-out players can no longer edit the name offline.
(function(){const o=renderProfile;renderProfile=function(){const r=o.apply(this,arguments);try{
  const inp=$('#playerName'),btn=$('#savePlayerName'),note=$('#ggNameNote');if(!inp||!btn||!note)return r;
  if(!ggCloud.session){inp.disabled=true;btn.disabled=false;btn.textContent='Sign in to change';
    note.textContent='Names are checked online so every player\'s name is unique. To choose your name, sign in to Cloud Save while connected to the internet. A claimed name is required to join leaderboards.';}
  else if(!ggCloud.profile){note.textContent='Claim a unique name so no one else can use it. Names are permanent, need an internet connection to check, and are required to join leaderboards.';}
}catch(e){}return r;};})();
(function(){const btn=$('#savePlayerName');if(!btn)return;const o=btn.onclick;btn.onclick=function(e){
  if(!ggCloud.session){toast('Sign in to Cloud Save to choose your player name.');ggGoToCloudSave();return;}
  if(!ggCloud.profile&&!ggIsOnline()){toast(GG_NAME_OFFLINE);return;}
  return o&&o.call(this,e);};})();
// Cloud panel: explain why a name matters.
(function(){const o=ggCloudRender;ggCloudRender=function(){const r=o.apply(this,arguments);try{
  const m=$('#ggCloudBody .gg-name-missing');if(m&&!m.querySelector('.gg-name-why'))m.insertAdjacentHTML('beforeend','<small class="gg-name-why">A claimed name is required to join leaderboards.</small>');
  const pick=$('#ggNamePick');if(pick)pick.onclick=()=>ggNameOpen();}catch(e){}return r;};})();
ggCloudView='';ggCloudRender();try{renderProfile()}catch(e){}
