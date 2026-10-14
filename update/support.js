// ---------- Contact Support (2026.10.11.33) ----------
// Signed-in players open a support ticket (numbered, e.g. #1001) and chat in it. The support helper
// (Claude, through the Supabase Edge Function "support-ai") answers each new message. When it can't help,
// it tells the player the Creator will help when they are not busy, and the ticket shows up in the
// Creator Edition's Support Inbox, where the Creator replies. Replies show a badge on ☰ and 🛟 Support.
// Nothing is sent unless the player writes a message. Needs internet and a Cloud Save sign-in.
const GG_SUP_STATUS={open:['Waiting for a reply','wait'],answered:['Answered','ok'],creator:['With the Creator','creator'],closed:['Closed','closed']};
const ggSup={view:'list',ticket:null,thread:null,tickets:[],seq:0,poll:0,waitUntil:0,unread:0,notified:{},kicked:{}};
try{ggSup.notified=JSON.parse(localStorage.getItem('gemGuardiansSupSeen_'+GG_EDITION)||'{}')||{};}catch(e){}
function ggSupSeenStore(){try{localStorage.setItem('gemGuardiansSupSeen_'+GG_EDITION,JSON.stringify(ggSup.notified))}catch(e){}}
function ggSupWhen(t){const d=new Date(t);if(!isFinite(d))return '';const s=(Date.now()-d)/1000;
  if(s<60)return 'just now';if(s<3600)return Math.floor(s/60)+' min ago';if(s<86400)return Math.floor(s/3600)+' h ago';
  return d.toLocaleDateString(undefined,{month:'short',day:'numeric'})+' '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});}
function ggSupText(s){return ggEsc(s).replace(/\n/g,'<br>');}
function ggSupChip(st){const x=GG_SUP_STATUS[st]||GG_SUP_STATUS.open;return '<span class="gg-sup-chip '+x[1]+'">'+x[0]+'</span>';}
function ggSupReason(r){return ({signin:'Please sign in to Cloud Save first.',empty:'Please write a message first.',long:'That message is too long (1,000 characters at most).',
  too_many_open:'You already have 3 open tickets. Please continue in one of them, or close one first.',daily:'You opened a lot of tickets today. Please continue in an open ticket or try again tomorrow.',
  slow:'Please wait a moment before sending another message.',closed:'This ticket is closed. Open a new ticket if you still need help.',full:'This ticket is full. Please open a new ticket.',ticket:'That ticket could not be found.'})[r]||'Something went wrong. Please try again.';}
// Basic game info sent with a new ticket (only if the player leaves the box ticked).
function ggSupContext(){const ua=navigator.userAgent||'';
  return {level:Number(S.playerLevel)||1,gems:Number(S.gems)||0,units:Array.isArray(S.units)?S.units.length:0,maps_cleared:Number(S.cleared)||0,raids:Number(S.raidCleared)||0,
    passes:(()=>{try{return Object.keys(GG_PASSES).filter(ggHasPass).join(', ')||'none'}catch(e){return ''}})(),
    device:/Android/i.test(ua)?'Android':/iPhone|iPad/i.test(ua)?'iPhone/iPad':/Mac/i.test(ua)?'Mac':/Windows/i.test(ua)?'Windows':'Other',
    installed:(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)?'yes':'no',cloud_save:ggCloud.session?'signed in':'no',online:ggIsOnline()?'yes':'no'};}
// ----- Window -----
document.body.insertAdjacentHTML('beforeend','<div id="ggSupport" class="settings-panel hide" role="dialog" aria-modal="true" aria-labelledby="ggSupTitle"><div class="settings-box gg-sup-box">'
 +'<div class="row gg-sup-head"><button class="alt gg-sup-back hide" id="ggSupBack" aria-label="Back to your tickets">←</button><h2 id="ggSupTitle">🛟 Contact Support</h2><button class="alt" id="closeSupport">Close ✕</button></div>'
 +'<div id="ggSupBody"></div></div></div>');
function ggSupOpen(){$('#ggSupport').classList.remove('hide');const h=$('header');if(h)h.classList.remove('more-open');const m=$('#bMore');if(m)m.setAttribute('aria-expanded','false');
  if(ggSup.view==='thread'&&ggSup.ticket)ggSupShowThread(ggSup.ticket);else ggSupShowList();}
function ggSupClose(){$('#ggSupport').classList.add('hide');clearTimeout(ggSup.poll);ggSup.seq++;}
$('#closeSupport').onclick=ggSupClose;
$('#ggSupport').addEventListener('click',e=>{if(e.target.id==='ggSupport')ggSupClose();});
$('#ggSupBack').onclick=()=>ggSupShowList();
function ggSupGate(){
  if(!ggIsOnline())return '<div class="gg-sup-gate">📡 You are offline. Connect to the internet to contact support. Your game keeps working offline.</div>';
  if(!ggCloud.session)return '<div class="gg-sup-gate">🔐 To contact support, sign in to <b>Cloud Save</b> first (Settings → Cloud Save). That way we can send our reply to you.<button id="ggSupSignIn">Sign in</button></div>';
  return '';}
function ggSupIntro(){return '<p class="gg-sup-intro">Ask anything about Gem Guardians. Our <b>support helper</b> (an AI) answers right away. If it can\'t help, the <b>Creator</b> will help you when they\'re not busy, and their reply shows up in your ticket.</p>';}
function ggSupWire(){const b=$('#ggSupSignIn');if(b)b.onclick=()=>{ggSupClose();ggGoToCloudSave();};}
async function ggSupShowList(){ggSup.view='list';ggSup.ticket=null;clearTimeout(ggSup.poll);$('#ggSupBack').classList.add('hide');$('#ggSupTitle').textContent='🛟 Contact Support';
  const body=$('#ggSupBody'),gate=ggSupGate();const seq=++ggSup.seq;
  body.innerHTML=ggSupIntro()+(gate||'<button id="ggSupNew" class="gg-sup-newbtn">✉️ New ticket</button><h3 class="gg-sup-h3">Your tickets</h3><ul id="ggSupList" class="gg-sup-list"><li class="gg-sup-empty">Loading…</li></ul>')
   +'<small class="gg-sup-note">Please don\'t share passwords or personal details. Messages and the game info you choose to include are stored so we can help you, and are sent to our AI provider to write the helper\'s replies. See the privacy policy.</small>';
  ggSupWire();if(gate)return;$('#ggSupNew').onclick=ggSupShowNew;
  const r=await ggRpc('support_my_tickets',{},true);if(seq!==ggSup.seq)return;
  const list=$('#ggSupList');if(!list)return;
  if(!r.ok||!Array.isArray(r.data)){list.innerHTML='<li class="gg-sup-empty">'+ggEsc(ggCloudErr(r))+'</li>';return;}
  ggSup.tickets=r.data;ggSupBadge();
  list.innerHTML=r.data.length?r.data.map(t=>'<li><button class="gg-sup-ticket'+(t.player_unread>0?' unread':'')+'" data-tk="'+t.id+'"><span class="gg-sup-tnum">#'+t.id+'</span><span class="gg-sup-tmain"><b>'+ggEsc(t.subject||'Ticket')+'</b><small>'+(t.last?(t.last.sender==='player'?'You: ':t.last.sender==='creator'?'Creator: ':t.last.sender==='ai'?'Helper: ':'')+ggEsc(t.last.body):'')+'</small></span><span class="gg-sup-tside">'+ggSupChip(t.status)+'<small>'+ggSupWhen(t.updated_at)+'</small>'+(t.player_unread>0?'<i class="gg-sup-dot">'+t.player_unread+'</i>':'')+'</span></button></li>').join('')
   :'<li class="gg-sup-empty">No tickets yet. Tap <b>New ticket</b> to ask a question or report a problem.</li>';
  list.querySelectorAll('[data-tk]').forEach(b=>b.onclick=()=>ggSupShowThread(+b.dataset.tk));}
function ggSupShowNew(){ggSup.view='new';$('#ggSupBack').classList.remove('hide');$('#ggSupTitle').textContent='✉️ New ticket';ggSup.seq++;
  const gate=ggSupGate();if(gate){$('#ggSupBody').innerHTML=gate;ggSupWire();return;}
  $('#ggSupBody').innerHTML='<label for="ggSupMsg" class="gg-sup-label">How can we help? Describe the problem or question, with what you tried.</label>'
   +'<textarea id="ggSupMsg" class="gg-sup-text" maxlength="1000" rows="6" placeholder="Example: My units disappeared after I imported a save on my new phone."></textarea>'
   +'<div class="gg-sup-row"><label class="gg-sup-check"><input type="checkbox" id="ggSupCtx" checked> Include basic game info (level, gems, units, version, device)</label><small id="ggSupCount">0/1000</small></div>'
   +'<div id="ggSupErr" class="gg-sup-err hide"></div><button id="ggSupSend" class="gg-sup-send">Send</button>';
  const ta=$('#ggSupMsg');ta.oninput=()=>{$('#ggSupCount').textContent=ta.value.length+'/1000';};ta.focus();
  $('#ggSupSend').onclick=async()=>{const txt=ta.value.trim(),err=$('#ggSupErr');err.classList.add('hide');
    if(txt.length<2){err.textContent=ggSupReason('empty');err.classList.remove('hide');return;}
    const btn=$('#ggSupSend');btn.disabled=true;btn.textContent='Sending…';
    const r=await ggRpc('support_open',{p_body:txt,p_context:$('#ggSupCtx').checked?ggSupContext():null,p_version:GAME_VERSION,p_edition:GG_EDITION},true);
    btn.disabled=false;btn.textContent='Send';
    if(!r.ok){err.textContent=ggCloudErr(r);err.classList.remove('hide');return;}
    if(!r.data||!r.data.ok){err.textContent=ggSupReason(r.data&&r.data.reason);err.classList.remove('hide');return;}
    toast('📨 Ticket #'+r.data.ticket+' sent');ggSup.waitUntil=Date.now()+75000;ggSupAsk(r.data.ticket);ggSupShowThread(r.data.ticket);};}
// Ask the support helper to answer the newest message (the server makes sure it answers only once).
function ggSupAsk(id){ggSup.kicked[id]=Date.now();return ggCloudFetch('/functions/v1/support-ai',{method:'POST',auth:true,body:{ticket:id}}).catch(()=>null);}
function ggSupMsgHtml(m){const who=m.sender==='player'?'You':m.sender==='ai'?'🤖 Support helper':m.sender==='creator'?'👑 Creator':'';
  if(m.sender==='system')return '<div class="gg-sup-msg system">'+ggSupText(m.body)+'</div>';
  return '<div class="gg-sup-msg '+m.sender+'"><div class="gg-sup-who">'+who+' · <time>'+ggSupWhen(m.at)+'</time></div><div class="gg-sup-bubble">'+ggSupText(m.body)+'</div></div>';}
async function ggSupShowThread(id,quiet){ggSup.view='thread';ggSup.ticket=id;$('#ggSupBack').classList.remove('hide');$('#ggSupTitle').textContent='🎫 Ticket #'+id;clearTimeout(ggSup.poll);
  const body=$('#ggSupBody'),gate=ggSupGate();const seq=++ggSup.seq;
  if(gate){body.innerHTML=gate;ggSupWire();return;}
  if(!quiet||!$('#ggSupThread'))body.innerHTML='<div id="ggSupThread" class="gg-sup-thread"><div class="gg-sup-empty">Loading…</div></div><div id="ggSupCompose"></div>';
  const r=await ggRpc('support_thread',{p_ticket:id},true);if(seq!==ggSup.seq||ggSup.ticket!==id)return;
  if(!r.ok||!r.data){$('#ggSupThread').innerHTML='<div class="gg-sup-empty">'+ggEsc(r.ok?ggSupReason('ticket'):ggCloudErr(r))+'</div>';return;}
  const t=ggSup.thread=r.data,msgs=t.messages||[],last=msgs[msgs.length-1];
  const waiting=t.status!=='closed'&&last&&last.sender==='player';
  // A message the helper never got to (app closed, network drop): ask again once.
  if(waiting&&!t.ai_busy&&t.status!=='creator'&&Date.now()-(ggSup.kicked[id]||0)>60000&&Date.now()-new Date(last.at)>8000){ggSup.waitUntil=Date.now()+75000;ggSupAsk(id);}
  const typing=waiting&&(t.ai_busy||Date.now()<ggSup.waitUntil);
  const th=$('#ggSupThread'),atBottom=!quiet||th.scrollHeight-th.scrollTop-th.clientHeight<40;
  th.innerHTML='<div class="gg-sup-meta">'+ggSupChip(t.status)+' <small>Opened '+ggSupWhen(t.created_at)+'</small></div>'+msgs.map(ggSupMsgHtml).join('')
   +(typing?'<div class="gg-sup-msg ai typing"><div class="gg-sup-bubble"><span></span><span></span><span></span></div></div>':'')
   +(waiting&&!typing&&t.status==='creator'?'<div class="gg-sup-msg system">The Creator will help you when they\'re not busy. Their reply will show up here.</div>':'');
  if(atBottom)th.scrollTop=th.scrollHeight;
  ggSup.notified[id]=msgs.length;ggSupSeenStore();ggSupBadgeLocal(id);
  const comp=$('#ggSupCompose');
  if(t.status==='closed')comp.innerHTML='<p class="gg-sup-closed">This ticket is closed. <button id="ggSupNew2" class="alt">Open a new ticket</button></p>';
  else if(!quiet||!$('#ggSupReply'))comp.innerHTML='<div class="gg-sup-composer"><textarea id="ggSupReply" class="gg-sup-text" maxlength="1000" rows="2" placeholder="Write a reply…" aria-label="Your reply"></textarea><button id="ggSupReplySend">Send</button></div><div id="ggSupErr" class="gg-sup-err hide"></div><button id="ggSupCloseTk" class="gg-linkbtn">Close this ticket (my problem is solved)</button>';
  const n2=$('#ggSupNew2');if(n2)n2.onclick=ggSupShowNew;
  const send=$('#ggSupReplySend');if(send&&!send.dataset.wired){send.dataset.wired=1;send.onclick=async()=>{const ta=$('#ggSupReply'),txt=ta.value.trim(),err=$('#ggSupErr');err.classList.add('hide');if(!txt)return;
    send.disabled=true;const r=await ggRpc('support_send',{p_ticket:id,p_body:txt},true);send.disabled=false;
    if(!r.ok){err.textContent=ggCloudErr(r);err.classList.remove('hide');return;}
    if(!r.data||!r.data.ok){err.textContent=ggSupReason(r.data&&r.data.reason);err.classList.remove('hide');return;}
    ta.value='';ggSup.waitUntil=Date.now()+75000;ggSupAsk(id);ggSupShowThread(id,true);};
    $('#ggSupReply').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!/Android|iPhone|iPad/i.test(navigator.userAgent)){e.preventDefault();send.click();}});}
  const cl=$('#ggSupCloseTk');if(cl&&!cl.dataset.wired){cl.dataset.wired=1;cl.onclick=async()=>{if(!confirm('Close ticket #'+id+'? You can always open a new one.'))return;
    const r=await ggRpc('support_close',{p_ticket:id},true);if(r.ok&&r.data&&r.data.ok){toast('Ticket #'+id+' closed. Glad we could help!');}ggSupShowThread(id);};}
  // Keep the chat fresh while it is open: every 2.5 s while a reply is coming, otherwise every 20 s.
  if(t.status!=='closed')ggSup.poll=setTimeout(()=>{if(!$('#ggSupport').classList.contains('hide')&&ggSup.view==='thread'&&ggSup.ticket===id)ggSupShowThread(id,true);},typing?2500:20000);}
// ----- Header button and unread badge -----
(function(){const q=$('#bQol');if(q&&!$('#bSupport')){q.insertAdjacentHTML('beforebegin','<button class="alt hdr-more" id="bSupport">🛟 Support<i id="supBadge" class="gg-sup-badge hide">0</i></button>');$('#bSupport').addEventListener('click',ggSupOpen);
    try{if(typeof ggIconize==='function')ggIconize($('#bSupport'));}catch(e){}}
  const m=$('#bMore');if(m)m.addEventListener('click',()=>setTimeout(ggSupBadge,0));})();
// The ☰ button redraws its icon when the menu opens and closes, so the badge is added back each time.
function ggSupMoreBadge(){const m=$('#bMore');if(!m)return null;let b=$('#supMoreBadge');if(!b){m.insertAdjacentHTML('beforeend','<i id="supMoreBadge" class="gg-sup-badge hide">0</i>');b=$('#supMoreBadge');}return b;}
function ggSupBadge(){const n=(ggSup.tickets||[]).filter(t=>t.player_unread>0).length;ggSup.unread=n;
  ggSupMoreBadge();for(const id of ['supBadge','supMoreBadge']){const b=$('#'+id);if(b){b.textContent=n;b.classList.toggle('hide',!n);}}}
function ggSupBadgeLocal(id){const t=(ggSup.tickets||[]).find(x=>x.id===id);if(t){t.player_unread=0;ggSupBadge();}}
// Check for replies: after sign-in, when the game comes back on screen, and every 2 minutes while open.
async function ggSupCheck(){if(!ggCloud.session||!ggIsOnline()||document.visibilityState==='hidden')return null;
  const r=await ggRpc('support_my_tickets',{},true);if(!r.ok||!Array.isArray(r.data))return null;ggSup.tickets=r.data;ggSupBadge();
  const open=!$('#ggSupport').classList.contains('hide');
  for(const t of r.data)if(t.player_unread>0&&!(open&&ggSup.view==='thread'&&ggSup.ticket===t.id)){const key=t.id+':'+(t.last&&t.last.at);
    if(ggSup.notified['n'+t.id]!==key){ggSup.notified['n'+t.id]=key;ggSupSeenStore();toast((t.last&&t.last.sender==='creator'?'👑 The Creator':'🛟 Support')+' replied to ticket #'+t.id);}}
  return r.data;}
setInterval(ggSupCheck,120000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')ggSupCheck();});
(function(){const o=ggCloudAfterLogin;ggCloudAfterLogin=async function(){const r=await o.apply(this,arguments);ggSupCheck();return r;};})();
(function(){const o=ggCloudSignOut;ggCloudSignOut=async function(){const r=await o.apply(this,arguments);ggSup.tickets=[];ggSupBadge();ggSup.view='list';ggSup.ticket=null;return r;};})();
setTimeout(ggSupCheck,6000);
// Help & Tutorials: a Contact Support row at the bottom.
(function(){const o=openHelp;openHelp=function(){const r=o.apply(this,arguments);const list=$('#ggHelpList');
  if(list&&!list.querySelector('[data-sup]')){list.insertAdjacentHTML('beforeend','<div class="gg-help-row"><span class="gg-help-ico gg-sup-ico">🛟</span><span class="gg-help-txt"><b>Contact Support</b><small>Ask a question or report a problem. The support helper answers right away; the Creator helps with the rest.</small></span><button type="button" data-sup="1">Contact</button></div>');
    list.querySelector('[data-sup]').onclick=()=>{closeHelp();ggSupOpen();};}return r;};})();
// ----- Creator Edition: Support Inbox -----
if(GG_EDITION==='creator'){
  const ggInbox={filter:'waiting',ticket:null,seq:0,poll:0};
  document.body.insertAdjacentHTML('beforeend','<div id="ggSupInbox" class="settings-panel hide" role="dialog" aria-modal="true" aria-labelledby="ggInboxTitle"><div class="settings-box gg-sup-box gg-inbox-box">'
   +'<div class="row gg-sup-head"><button class="alt gg-sup-back hide" id="ggInboxBack" aria-label="Back to the inbox">←</button><h2 id="ggInboxTitle">📥 Support Inbox</h2><button class="alt" id="closeInbox">Close ✕</button></div><div id="ggInboxBody"></div></div></div>');
  const close=()=>{$('#ggSupInbox').classList.add('hide');clearTimeout(ggInbox.poll);ggInbox.seq++;};
  $('#closeInbox').onclick=close;$('#ggSupInbox').addEventListener('click',e=>{if(e.target.id==='ggSupInbox')close();});
  $('#ggInboxBack').onclick=()=>ggInboxList();
  window.ggInboxOpen=function(){$('#ggSupInbox').classList.remove('hide');const h=$('header');if(h)h.classList.remove('more-open');if(ggInbox.ticket)ggInboxThread(ggInbox.ticket);else ggInboxList();};
  async function ggInboxGate(){const g=ggSupGate();if(g)return g;const a=await ggRpc('support_is_admin',{},true);
    if(!a.ok)return '<div class="gg-sup-gate">'+ggEsc(ggCloudErr(a))+'</div>';
    if(a.data!==true)return '<div class="gg-sup-gate">This account ('+ggEsc(ggCloud.session.user.email||'')+') is not set as the Creator. Add it in Supabase → SQL editor:<code>insert into public.support_admins (user_id) select id from auth.users where email = \''+ggEsc(ggCloud.session.user.email||'you@example.com')+'\';</code></div>';
    return '';}
  async function ggInboxList(){ggInbox.ticket=null;clearTimeout(ggInbox.poll);$('#ggInboxBack').classList.add('hide');$('#ggInboxTitle').textContent='📥 Support Inbox';const seq=++ggInbox.seq,body=$('#ggInboxBody');
    body.innerHTML='<div class="gg-sup-empty">Loading…</div>';const gate=await ggInboxGate();if(seq!==ggInbox.seq)return;
    if(gate){body.innerHTML=gate;ggSupWire();return;}
    body.innerHTML='<div class="gg-lb-tabs gg-inbox-tabs" role="tablist">'+[['waiting','🙋 Needs you'],['open','💬 Open'],['closed','✅ Closed'],['all','All']].map(([k,n])=>'<button role="tab" data-inf="'+k+'" class="'+(ggInbox.filter===k?'on':'')+'">'+n+'</button>').join('')+'</div><ul id="ggInboxList" class="gg-sup-list"><li class="gg-sup-empty">Loading…</li></ul>';
    body.querySelectorAll('[data-inf]').forEach(b=>b.onclick=()=>{ggInbox.filter=b.dataset.inf;ggInboxList();});
    const r=await ggRpc('support_inbox',{p_filter:ggInbox.filter},true);if(seq!==ggInbox.seq)return;const list=$('#ggInboxList');
    if(!r.ok||!r.data||!r.data.ok){list.innerHTML='<li class="gg-sup-empty">'+ggEsc(r.ok?'Not allowed.':ggCloudErr(r))+'</li>';return;}
    const ts=r.data.tickets||[];ggInboxBadge(ggInbox.filter==='waiting'?ts.length:null);
    list.innerHTML=ts.length?ts.map(t=>'<li><button class="gg-sup-ticket'+(t.creator_unread?' unread':'')+'" data-itk="'+t.id+'"><span class="gg-sup-tnum">#'+t.id+'</span><span class="gg-sup-tmain"><b>'+ggEsc(t.player)+' · '+ggEsc(t.subject||'')+'</b><small>'+(t.last?(t.last.sender==='player'?'Player: ':t.last.sender==='creator'?'You: ':t.last.sender==='ai'?'Helper: ':'')+ggEsc(t.last.body):'')+'</small></span><span class="gg-sup-tside">'+ggSupChip(t.status)+'<small>'+ggSupWhen(t.updated_at)+'</small></span></button></li>').join('')
      :'<li class="gg-sup-empty">'+(ggInbox.filter==='waiting'?'Nothing needs you right now. 🎉':'No tickets here.')+'</li>';
    list.querySelectorAll('[data-itk]').forEach(b=>b.onclick=()=>ggInboxThread(+b.dataset.itk));}
  async function ggInboxThread(id,quiet){ggInbox.ticket=id;clearTimeout(ggInbox.poll);$('#ggInboxBack').classList.remove('hide');$('#ggInboxTitle').textContent='🎫 Ticket #'+id;const seq=++ggInbox.seq,body=$('#ggInboxBody');
    if(!quiet)body.innerHTML='<div class="gg-sup-empty">Loading…</div>';
    const r=await ggRpc('support_admin_thread',{p_ticket:id},true);if(seq!==ggInbox.seq)return;
    if(!r.ok||!r.data){body.innerHTML='<div class="gg-sup-empty">'+ggEsc(r.ok?'Ticket not found or not allowed.':ggCloudErr(r))+'</div>';return;}
    const t=r.data,c=t.context||{};const draft=quiet&&$('#ggInboxReply')?$('#ggInboxReply').value:'';
    body.innerHTML='<div class="gg-sup-meta">'+ggSupChip(t.status)+' <b>'+ggEsc(t.player)+'</b> <small>· '+ggEsc(t.edition)+' · v'+ggEsc(t.game_version||'?')+' · '+t.player_tickets+' ticket(s) · opened '+ggSupWhen(t.created_at)+'</small></div>'
     +(Object.keys(c).length?'<div class="gg-inbox-ctx">'+Object.entries(c).map(([k,v])=>'<span><b>'+ggEsc(k.replace('_',' '))+'</b> '+ggEsc(v)+'</span>').join('')+'</div>':'')
     +'<div id="ggInboxThread" class="gg-sup-thread">'+(t.messages||[]).map(m=>ggSupMsgHtml(Object.assign({},m,{sender:m.sender})).replace('>You · <','>Player · <')).join('')+'</div>'
     +'<textarea id="ggInboxReply" class="gg-sup-text" maxlength="4000" rows="3" placeholder="Write your reply to the player…"></textarea><div id="ggInboxErr" class="gg-sup-err hide"></div>'
     +'<div class="gg-inbox-actions"><button id="ggInboxSend">Send reply</button><button id="ggInboxSendClose" class="alt">Send &amp; close</button>'+(t.status==='closed'?'<button id="ggInboxReopen" class="alt">Reopen</button>':'<button id="ggInboxCloseTk" class="alt">Close ticket</button>')+'</div>';
    const th=$('#ggInboxThread');th.scrollTop=th.scrollHeight;if(draft)$('#ggInboxReply').value=draft;
    const reply=async closeIt=>{const txt=$('#ggInboxReply').value.trim(),err=$('#ggInboxErr');err.classList.add('hide');if(!txt){err.textContent='Write a reply first.';err.classList.remove('hide');return;}
      const r2=await ggRpc('support_reply',{p_ticket:id,p_body:txt,p_close:!!closeIt},true);
      if(!r2.ok||!r2.data||!r2.data.ok){err.textContent=r2.ok?'Could not send.':ggCloudErr(r2);err.classList.remove('hide');return;}
      toast('Reply sent to ticket #'+id);ggInboxThread(id);};
    $('#ggInboxSend').onclick=()=>reply(false);$('#ggInboxSendClose').onclick=()=>reply(true);
    const st=async s=>{await ggRpc('support_set_status',{p_ticket:id,p_status:s},true);ggInboxThread(id);};
    const cb=$('#ggInboxCloseTk');if(cb)cb.onclick=()=>st('closed');const ro=$('#ggInboxReopen');if(ro)ro.onclick=()=>st('creator');
    ggInbox.poll=setTimeout(()=>{if(!$('#ggSupInbox').classList.contains('hide')&&ggInbox.ticket===id&&!$('#ggInboxReply').value)ggInboxThread(id,true);},30000);}
  function ggInboxBadge(n){const b=$('#inboxBadge');if(b&&n!=null){b.textContent=n;b.classList.toggle('hide',!n);}}
  (function(){const s=$('#bSupport');if(s&&!$('#bInbox')){s.insertAdjacentHTML('afterend','<button class="alt hdr-more" id="bInbox">📥 Support Inbox<i id="inboxBadge" class="gg-sup-badge hide">0</i></button>');$('#bInbox').addEventListener('click',ggInboxOpen);}})();
  window.ggInboxCount=async function(){if(!ggCloud.session||!ggIsOnline())return null;const a=await ggRpc('support_is_admin',{},true);if(!a.ok||a.data!==true)return null;
    const r=await ggRpc('support_inbox',{p_filter:'waiting'},true);if(r.ok&&r.data&&r.data.ok){ggInboxBadge(r.data.tickets.length);return r.data.tickets.length;}return null;};
  setTimeout(ggInboxCount,7000);setInterval(()=>{if(document.visibilityState==='visible')ggInboxCount();},180000);
}
