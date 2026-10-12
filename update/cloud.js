// ---------- Cloud Save (2026.10.11.22) ----------
// Optional sign-in that backs up this edition's save online and restores it on another device.
// The game never needs the internet: if a player never signs in, nothing is sent anywhere.
// Only the public (publishable) project key is in the game. Each player can read and change only
// their own row (enforced by the database's row-level security), one row per edition.
const GG_CLOUD={url:'https://sqlnbscqdvepsavfzyil.supabase.co',key:'sb_publishable_LLDV6UojBIv5sJV921Xsbw_G3lMKRDs',every:60000};
const GG_CLOUD_KEY='gemGuardiansCloud_'+GG_EDITION;
const ggCloud=(()=>{let p={};try{p=JSON.parse(localStorage.getItem(GG_CLOUD_KEY)||'{}')||{}}catch(e){}return Object.assign({session:null,rev:null,lastAt:0,lastHash:'',auto:true,conflict:false},p);})();
function ggCloudStore(){try{localStorage.setItem(GG_CLOUD_KEY,JSON.stringify(ggCloud))}catch(e){}}
function ggCloudHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36)+':'+s.length;}
function ggCloudSummary(d){d=d||S;return {level:Number(d.playerLevel)||1,gems:Number(d.gems)||0,units:Array.isArray(d.units)?d.units.length:0};}
function ggCloudSummaryText(m){return m?('Level '+m.level+' · '+Number(m.gems).toLocaleString()+' gems · '+m.units+(m.units===1?' unit':' units')):'';}
function ggCloudErr(res){const d=res&&res.data||{},code=d.error_code||d.code||'',msg=d.msg||d.message||d.error_description||d.error||'';
  if(!res||res.status===0)return navigator.onLine===false?'You are offline. Your game is still saved on this device.':'Could not reach the cloud. Check your internet and try again.';
  if(res.status===429||/rate/i.test(code))return 'Too many tries. Please wait a minute and try again.';
  if(code==='invalid_credentials'||/invalid login/i.test(msg))return 'Wrong email or password.';
  if(code==='user_already_exists'||/already registered/i.test(msg))return 'That email already has an account. Use Sign in instead.';
  if(code==='weak_password'||/password/i.test(msg)&&/least|weak|short/i.test(msg))return 'Password is too short. Use at least 6 characters.';
  if(code==='email_address_invalid'||/invalid.*email|email.*invalid/i.test(msg))return 'That email address does not look right.';
  return msg?('Cloud error: '+msg):('Cloud error ('+res.status+').');}
// Signed-in requests renew the sign-in once and retry if the server says it has expired.
async function ggCloudFetch(path,opt){const r=await ggCloudFetch1(path,opt);if(r.status===401&&opt&&opt.auth&&!opt._retried&&ggCloud.session&&await ggCloudToken(true))return ggCloudFetch1(path,Object.assign({},opt,{_retried:true}));return r;}
async function ggCloudFetch1(path,opt){opt=opt||{};const ctl=typeof AbortController!=='undefined'?new AbortController():null;const tm=ctl?setTimeout(()=>ctl.abort(),15000):0;
  const headers=Object.assign({apikey:GG_CLOUD.key,'Content-Type':'application/json'},opt.headers||{});
  if(opt.auth&&ggCloud.session&&ggCloud.session.access_token)headers.Authorization='Bearer '+ggCloud.session.access_token;
  try{const r=await fetch(GG_CLOUD.url+path,{method:opt.method||'GET',headers,body:opt.body==null?undefined:JSON.stringify(opt.body),signal:ctl?ctl.signal:undefined,cache:'no-store'});
    let data=null;const t=await r.text();try{data=t?JSON.parse(t):null}catch(e){data={message:t}}return {ok:r.ok,status:r.status,data};}
  catch(e){return {ok:false,status:0,data:null};}finally{if(tm)clearTimeout(tm);}}
function ggCloudSetSession(d){if(!d||!d.access_token)return false;ggCloud.session={access_token:d.access_token,refresh_token:d.refresh_token,expires_at:d.expires_at||(Math.floor(Date.now()/1000)+(d.expires_in||3600)),user:{id:d.user&&d.user.id,email:d.user&&d.user.email}};ggCloudStore();return true;}
async function ggCloudToken(force){const s=ggCloud.session;if(!s)return false;if(!force&&(s.expires_at||0)-90>Date.now()/1000)return true;
  const r=await ggCloudFetch('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:s.refresh_token}});
  if(r.ok&&ggCloudSetSession(r.data))return true;
  if(r.status>=400&&r.status<500){ggCloud.session=null;ggCloud.rev=null;ggCloudStore();ggCloudRender('Your cloud sign-in expired. Sign in again to keep backing up.');}
  return false;}
async function ggCloudGetRow(){if(!await ggCloudToken())return {ok:false,status:0};const u=ggCloud.session.user.id;
  const r=await ggCloudFetch('/rest/v1/saves?select=data,rev,updated_at,game_version,summary&user_id=eq.'+encodeURIComponent(u)+'&edition=eq.'+GG_EDITION,{auth:true});
  return {ok:r.ok,status:r.status,data:r.data,row:r.ok&&Array.isArray(r.data)?r.data[0]||null:null};}
// Upload this device's save. Normal backups only replace the cloud copy this device last saw
// (rev check), so a newer save from another device is never overwritten by accident.
async function ggCloudUpload(force){
  if(!ggCloud.session)return {ok:false,msg:'Not signed in.'};
  if(!force&&ggCloud.conflict)return {ok:false,msg:'Choose which save to keep first.'};
  if(!save(false))return {ok:false,msg:'This device could not save, so nothing was uploaded.'};
  if(!await ggCloudToken())return {ok:false,msg:ggCloudErr({status:0})};
  const data=clean(JSON.parse(JSON.stringify(S))),raw=JSON.stringify(data),hash=ggCloudHash(raw);
  if(raw.length>1800000)return {ok:false,msg:'Save is too large for the cloud.'};
  const uid=ggCloud.session.user.id,body={data,game_version:GAME_VERSION,summary:ggCloudSummary(data)};let r;
  if(force){const cur=await ggCloudGetRow();if(!cur.ok)return {ok:false,msg:ggCloudErr(cur)};
    if(cur.row){r=await ggCloudFetch('/rest/v1/saves?user_id=eq.'+uid+'&edition=eq.'+GG_EDITION,{method:'PATCH',auth:true,headers:{Prefer:'return=representation'},body:Object.assign({rev:cur.row.rev+1},body)});}
    else r=await ggCloudFetch('/rest/v1/saves',{method:'POST',auth:true,headers:{Prefer:'return=representation'},body:Object.assign({user_id:uid,edition:GG_EDITION,rev:1},body)});}
  else if(ggCloud.rev==null){r=await ggCloudFetch('/rest/v1/saves',{method:'POST',auth:true,headers:{Prefer:'return=representation'},body:Object.assign({user_id:uid,edition:GG_EDITION,rev:1},body)});
    if(r.status===409){ggCloud.conflict=true;ggCloudStore();return {ok:false,conflict:true,msg:'A cloud save already exists for this account.'};}}
  else{r=await ggCloudFetch('/rest/v1/saves?user_id=eq.'+uid+'&edition=eq.'+GG_EDITION+'&rev=eq.'+ggCloud.rev,{method:'PATCH',auth:true,headers:{Prefer:'return=representation'},body:Object.assign({rev:ggCloud.rev+1},body)});
    if(r.ok&&Array.isArray(r.data)&&!r.data.length){ggCloud.conflict=true;ggCloudStore();return {ok:false,conflict:true,msg:'Your cloud save was changed on another device.'};}}
  if(!r.ok)return {ok:false,msg:ggCloudErr(r)};
  const row=Array.isArray(r.data)?r.data[0]:r.data;ggCloud.rev=row&&row.rev!=null?row.rev:(ggCloud.rev||0)+1;ggCloud.lastAt=Date.now();ggCloud.lastHash=hash;ggCloud.conflict=false;ggCloudStore();
  return {ok:true};}
// Replace this device's progress with the cloud copy, through the same checked import used for backups.
async function ggCloudRestore(row){
  if(!row){const g=await ggCloudGetRow();if(!g.ok)return alert(ggCloudErr(g));row=g.row;}
  if(!row)return alert('There is no cloud save for this account yet.');
  const payload={game:'Gem Guardians',edition:GG_EDITION,saveVersion:SAVE_VERSION,gameVersion:row.game_version||GAME_VERSION,exportedAt:row.updated_at,data:row.data};
  const prev={rev:ggCloud.rev,conflict:ggCloud.conflict,lastHash:ggCloud.lastHash};
  ggCloud.rev=row.rev;ggCloud.conflict=false;ggCloud.lastHash=ggCloudHash(JSON.stringify(row.data));ggCloud.lastAt=Date.now();ggCloudStore();
  const ok=await importSaveText(JSON.stringify(payload));
  if(!ok){Object.assign(ggCloud,prev);ggCloudStore();ggCloudRender();}
  return ok;}
// After signing in: start backing up, or ask which save to keep when both this device and the cloud have progress.
async function ggCloudAfterLogin(isNew){
  const g=await ggCloudGetRow();if(!g.ok){ggCloudRender(ggCloudErr(g));return;}
  if(!g.row){ggCloud.rev=null;ggCloud.conflict=false;ggCloudStore();const u=await ggCloudUpload(false);ggCloudRender(u.ok?'Signed in. Your progress is now backed up.':u.msg);if(u.ok)toast('Cloud Save is on');return;}
  const local=JSON.stringify(clean(JSON.parse(JSON.stringify(S))));
  if(ggCloudHash(local)===ggCloudHash(JSON.stringify(row_data(g.row)))){ggCloud.rev=g.row.rev;ggCloud.conflict=false;ggCloud.lastHash=ggCloudHash(local);ggCloud.lastAt=Date.now();ggCloudStore();ggCloudRender('Signed in. This device already matches your cloud save.');return;}
  ggCloud.conflict=true;ggCloud.rev=g.row.rev;ggCloudStore();ggCloudRender();ggCloudChoose(g.row);}
function row_data(row){try{return clean(JSON.parse(JSON.stringify(row.data)))}catch(e){return row.data}}
function ggCloudChoose(row){
  const box=$('#ggCloudChoice');if(!box)return;const cs=row.summary||ggCloudSummary(row.data),ls=ggCloudSummary(S);
  box.innerHTML='<p><b>Two different saves found.</b> Choose which one to keep. The other one will be replaced.</p>'
   +'<div class="gg-cloud-opt"><b>Cloud save</b><span>'+ggEsc(ggCloudSummaryText(cs))+'</span><small>Saved '+ggEsc(new Date(row.updated_at).toLocaleString())+'</small><button id="ggCloudUseCloud">Use cloud save</button></div>'
   +'<div class="gg-cloud-opt"><b>This device</b><span>'+ggEsc(ggCloudSummaryText(ls))+'</span><small>Playing now</small><button class="alt" id="ggCloudUseLocal">Keep this device&#39;s save</button></div>'
   +'<small>Not sure? Use Export Save below first to keep a copy of this device&#39;s progress.</small>';
  box.classList.remove('hide');
  $('#ggCloudUseCloud').onclick=async()=>{await ggCloudRestore(row);};
  $('#ggCloudUseLocal').onclick=async()=>{if(!confirm('Replace your cloud save ('+ggCloudSummaryText(cs)+') with this device\'s progress ('+ggCloudSummaryText(ls)+')?'))return;
    const u=await ggCloudUpload(true);box.classList.add('hide');ggCloudRender(u.ok?'Cloud save replaced with this device\'s progress.':u.msg);};}
async function ggCloudAuth(mode){
  const email=($('#ggCloudEmail').value||'').trim(),pw=$('#ggCloudPw').value||'';
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return ggCloudRender('Enter your email address.');
  if(pw.length<6)return ggCloudRender('Password must be at least 6 characters.');
  ggCloudBusy(true);
  const r=mode==='up'?await ggCloudFetch('/auth/v1/signup',{method:'POST',body:{email,password:pw}}):await ggCloudFetch('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password:pw}});
  ggCloudBusy(false);
  if(!r.ok){ggCloudRender(ggCloudErr(r));return;}
  if(!ggCloudSetSession(r.data)){ggCloudRender(mode==='up'?'Account created. Check your email to confirm it, then sign in.':'Could not sign in. Please try again.');return;}
  $('#ggCloudPw').value='';ggCloud.rev=null;ggCloud.conflict=false;ggCloud.lastHash='';ggCloudStore();ggCloudRender('Signed in. Checking your cloud save…');
  await ggCloudAfterLogin(mode==='up');}
async function ggCloudSignOut(){if(ggCloud.session){ggCloudFetch('/auth/v1/logout',{method:'POST',auth:true});}
  ggCloud.session=null;ggCloud.rev=null;ggCloud.conflict=false;ggCloud.lastHash='';ggCloudStore();ggCloudRender('Signed out. Your progress stays on this device.');}
async function ggCloudDelete(){
  const t=prompt('This deletes your cloud account and every cloud save for it. Progress on this device is kept. Type DELETE to confirm.');
  if(t!=='DELETE')return;if(!await ggCloudToken())return ggCloudRender(ggCloudErr({status:0}));
  const r=await ggCloudFetch('/rest/v1/rpc/delete_my_account',{method:'POST',auth:true,body:{}});
  if(!r.ok)return ggCloudRender(ggCloudErr(r));
  ggCloud.session=null;ggCloud.rev=null;ggCloud.conflict=false;ggCloud.lastHash='';ggCloudStore();ggCloudRender('Cloud account deleted. Your progress is still on this device.');}
async function ggCloudForgot(){const email=($('#ggCloudEmail').value||'').trim();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return ggCloudRender('Type your email above first, then tap Forgot password.');
  const r=await ggCloudFetch('/auth/v1/recover',{method:'POST',body:{email}});ggCloudRender(r.ok?'If that email has an account, a reset link is on its way. It can take a few minutes.':ggCloudErr(r));}
// Automatic backup: about once a minute while signed in and online, and when the app goes to the background.
let ggCloudRunning=false;
async function ggCloudAuto(){if(ggCloudRunning||!ggCloud.session||!ggCloud.auto||ggCloud.conflict||navigator.onLine===false)return;
  let raw;try{raw=JSON.stringify(clean(JSON.parse(JSON.stringify(S))))}catch(e){return}
  if(ggCloudHash(raw)===ggCloud.lastHash)return;
  ggCloudRunning=true;try{const u=await ggCloudUpload(false);if(u.conflict){ggCloudRender();toast('Your cloud save changed on another device. Open Settings → Cloud Save to choose which to keep.');}else ggCloudRender();}finally{ggCloudRunning=false;}}
setInterval(()=>{ggCloudAuto()},GG_CLOUD.every);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')ggCloudAuto();});
window.addEventListener('online',()=>ggCloudAuto());
// ----- Settings panel -----
function ggCloudBusy(on){document.querySelectorAll('#ggCloud button').forEach(b=>b.disabled=!!on);}
let ggCloudView='';
function ggCloudRender(msg){
  const el=$('#ggCloudBody');if(!el)return;const s=ggCloud.session;
  // Keep what the player typed: only rebuild the sign-in form when switching from signed in to signed out.
  if(!s&&ggCloudView==='out'&&$('#ggCloudEmail')){const m=$('#ggCloudMsg');if(m){m.textContent=msg||'';m.classList.toggle('hide',!msg);}return;}
  ggCloudView=s?'in':'out';
  if(!s){el.innerHTML='<div class="gg-cloud-form"><input id="ggCloudEmail" type="email" inputmode="email" autocomplete="email" placeholder="Email" aria-label="Email"><input id="ggCloudPw" type="password" autocomplete="current-password" placeholder="Password (6+ characters)" aria-label="Password"><div class="row"><button id="ggCloudIn">Sign in</button><button class="alt" id="ggCloudUp">Create account</button></div><button class="gg-linkbtn" id="ggCloudForgot">Forgot password?</button></div>';
    $('#ggCloudIn').onclick=()=>ggCloudAuth('in');$('#ggCloudUp').onclick=()=>ggCloudAuth('up');$('#ggCloudForgot').onclick=ggCloudForgot;$('#ggCloudChoice').classList.add('hide');}
  else{const when=ggCloud.lastAt?new Date(ggCloud.lastAt).toLocaleString():'not yet';
    el.innerHTML='<p class="gg-cloud-user">Signed in as <b>'+ggEsc(s.user.email||'player')+'</b></p>'
     +'<p class="gg-cloud-status">'+(ggCloud.conflict?'<span class="gg-cloud-warn">Backups paused: your cloud save and this device are different. Choose below which one to keep.</span>':'Last cloud backup: '+ggEsc(when))+'</p>'
     +'<label class="setting" style="border:0;padding:4px 0"><span><b>Back up automatically</b><small>About once a minute while you play and are online.</small></span><input type="checkbox" id="ggCloudAutoT"'+(ggCloud.auto?' checked':'')+'></label>'
     +'<div class="row"><button id="ggCloudNow">Back up now</button><button class="alt" id="ggCloudLoad">Load cloud save</button><button class="alt" id="ggCloudOut">Sign out</button></div>'
     +'<button class="gg-linkbtn gg-cloud-del" id="ggCloudDel">Delete cloud account</button>';
    $('#ggCloudAutoT').onchange=e=>{ggCloud.auto=e.target.checked;ggCloudStore();};
    $('#ggCloudNow').onclick=async()=>{ggCloudBusy(true);let u;if(ggCloud.conflict){const g=await ggCloudGetRow();ggCloudBusy(false);if(g.ok&&g.row){ggCloudChoose(g.row);return;}u=await ggCloudUpload(true);}else{u=await ggCloudUpload(false);ggCloudBusy(false);}
      if(u&&u.conflict){const g=await ggCloudGetRow();ggCloudRender(u.msg);if(g.row)ggCloudChoose(g.row);return;}ggCloudRender(u&&u.ok?'Backed up just now.':u&&u.msg);if(u&&u.ok)toast('Backed up to the cloud');};
    $('#ggCloudLoad').onclick=async()=>{ggCloudBusy(true);const g=await ggCloudGetRow();ggCloudBusy(false);if(!g.ok)return ggCloudRender(ggCloudErr(g));if(!g.row)return ggCloudRender('There is no cloud save for this account yet. Tap Back up now first.');await ggCloudRestore(g.row);};
    $('#ggCloudOut').onclick=ggCloudSignOut;$('#ggCloudDel').onclick=ggCloudDelete;}
  const m=$('#ggCloudMsg');if(m){m.textContent=msg||'';m.classList.toggle('hide',!msg);}
}
(function(){
  // Shown near the top of Settings so players can find it easily.
  const box=document.querySelector('#settingsModal .settings-box'),head=box&&box.querySelector(':scope > .row'),dz=document.querySelector('#settingsModal .danger-zone');
  const at=head||dz;if(!at||$('#ggCloud'))return;
  at.insertAdjacentHTML(head?'afterend':'beforebegin','<div id="ggCloud" class="gg-cloud"><b>☁️ Cloud Save <span class="gg-cloud-tag">optional</span></b><small>Sign in to back up your progress online and continue on another phone or on the website. The game still works fully offline. Each edition has its own cloud save.</small><div id="ggCloudBody"></div><p id="ggCloudMsg" class="gg-cloud-msg hide" role="status"></p><div id="ggCloudChoice" class="gg-cloud-choice hide"></div></div>');
  ggCloudRender();
  // Privacy line next to the policy link.
  const pl=[...document.querySelectorAll('#settingsModal p')].find(p=>/collects no personal data/.test(p.textContent));
  if(pl)pl.innerHTML='<a href="privacy.html" target="_blank" rel="noopener" style="color:#c4b5fd">Privacy policy</a> · Nothing leaves your device unless you sign in to Cloud Save.';
  // If the save changed on another device while this one was away, show the choice when Settings opens.
  const sb=$('#bSettings');if(sb){const o=sb.onclick;sb.onclick=function(e){const r=o&&o.call(this,e);if(ggCloud.session&&ggCloud.conflict){ggCloudGetRow().then(g=>{if(g.row)ggCloudChoose(g.row);else{ggCloud.conflict=false;ggCloud.rev=null;ggCloudStore();ggCloudRender();}});}else ggCloudRender();return r;};}
  if(ggCloud.session)setTimeout(()=>ggCloudAuto(),8000);
})();
