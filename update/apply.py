#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.34: the Support Inbox also opens in the public game for Creator accounts
(hidden for everyone else; the server checks support_admins), and tapping a phone alert opens it (#support-inbox).
Works on the single-file source and on the deployed split files. Every edit is anchor-checked.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.33', '2026.10.11.34'
def rd(p): return open(os.path.join(R, p), encoding='utf-8').read()
def mod(p): return open(os.path.join(U, p), encoding='utf-8').read()
def rep(s, old, new, label, count=1):
    n = s.count(old)
    if n != count: raise SystemExit(f'ANCHOR FAIL [{label}]: expected {count}, found {n}')
    return s.replace(old, new)
split = os.path.exists(os.path.join(R, 'gg-game.js'))
H = rd('index.html')
if f"const GAME_VERSION='{NEW}';" in H:
    print('Already on', NEW); sys.exit(0)
J = rd('gg-game.js') if split else H
J = rep(J, "// ----- Creator Edition: Support Inbox -----\nif(GG_EDITION==='creator'){\n",
  "// ----- Support Inbox: Creator Edition, and the public game for Creator accounts (2026.10.11.34) -----\n{\n", 'inbox block')
J = rep(J, "    if(a.data!==true)return '<div class=\"gg-sup-gate\">This account ('",
  "    if(a.data!==true&&GG_EDITION!=='creator')return '<div class=\"gg-sup-gate\">Only the Creator\\'s account can open the Support Inbox.</div>';\n    if(a.data!==true)return '<div class=\"gg-sup-gate\">This account ('", 'gate')
J = rep(J, "'<button class=\"alt hdr-more\" id=\"bInbox\">", "'<button class=\"alt hdr-more'+(GG_EDITION==='creator'?'':' hide')+'\" id=\"bInbox\">", 'inbox button')
J = rep(J, "window.ggInboxCount=async function(){if(!ggCloud.session||!ggIsOnline())return null;const a=await ggRpc('support_is_admin',{},true);if(!a.ok||a.data!==true)return null;",
  "window.ggInboxCount=async function(){if(!ggCloud.session){ggInboxShow(false);return null;}if(!ggIsOnline())return null;const a=await ggRpc('support_is_admin',{},true);if(a.ok)ggInboxShow(a.data===true);if(!a.ok||a.data!==true)return null;", 'count')
tail = "  setTimeout(ggInboxCount,7000);setInterval(()=>{if(document.visibilityState==='visible')ggInboxCount();},180000);\n}\n"
J = rep(J, tail, "  setTimeout(ggInboxCount,7000);setInterval(()=>{if(document.visibilityState==='visible')ggInboxCount();},180000);\n"
  "  // Public game: the inbox button appears only for Creator accounts.\n"
  "  function ggInboxShow(on){const b=$('#bInbox');if(b&&GG_EDITION!=='creator')b.classList.toggle('hide',!on);}\n"
  "  (function(){const o=ggCloudAfterLogin;ggCloudAfterLogin=async function(){const r=await o.apply(this,arguments);ggInboxCount();return r;};})();\n"
  "  (function(){const o=ggCloudSignOut;ggCloudSignOut=async function(){const r=await o.apply(this,arguments);ggInboxShow(false);close();return r;};})();\n"
  "  // Tapping a phone alert opens the game at #support-inbox.\n"
  "  async function ggInboxFromLink(){if(location.hash!=='#support-inbox')return;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}\n"
  "    if(GG_EDITION==='creator'||await ggInboxCount()!==null)ggInboxOpen();else if(!ggCloud.session)toast('Sign in to Cloud Save with the Creator account to open the Support Inbox.');}\n"
  "  window.ggInboxFromLink=ggInboxFromLink;setTimeout(ggInboxFromLink,3000);window.addEventListener('hashchange',ggInboxFromLink);\n}\n", 'inbox tail')
if split:
    J = rep(J, f'\u00b7 gg-game.js \u00b7 Version {OLD} \u00b7', f'\u00b7 gg-game.js \u00b7 Version {NEW} \u00b7', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('inbox2.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="New Feature"><span class="update-tag tag-new-feature">New Feature</span><h3>Contact Support</h3>'
H_ = rep(H_, anc, info + anc, 'update info')
out = {}
if split:
    H_ = rep(H_, f'.js?v={OLD}"', f'.js?v={NEW}"', 'script tags', 3)
    out['index.html'] = H_; out['gg-game.js'] = J
    for f in ('gg-sound.js', 'gg-art.js'):
        out[f] = rep(rd(f), f'\u00b7 {f} \u00b7 Version {OLD} \u00b7', f'\u00b7 {f} \u00b7 Version {NEW} \u00b7', f + ' header')
else:
    out['index.html'] = H_
sw = rd('sw.js')
ed = 'creator' if "gem-guardians-creator-" in sw else 'public'
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-support-2026101133';", f"const CACHE='gem-guardians-{ed}-support-inbox-2026101134';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
