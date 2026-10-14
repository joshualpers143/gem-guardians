#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.37: the Raids x3 Speed pass becomes the Raids Auto Play pass (owner correction).
Auto Play works in raids with the pass; Speed x3 in raids follows the normal x3 Speed pass again.
Works on the single-file source and on the deployed split files. Every edit is anchor-checked.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.36', '2026.10.11.37'
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
anc = "  (function(){const o=ggCloudRestore;ggCloudRestore=async function(){const r=await o.apply(this,arguments);try{const b=$('#ggUndoRow');if(b)b.classList.remove('hide');}catch(e){}return r;};})();\n}\n"
J = rep(J, anc, anc + mod('raidauto.js'), 'module')
J = rep(J, "(raidLevel?'\U0001f512 Auto Play (regular maps only)'", "(raidLevel?'\U0001f512 Auto Play (Raids Auto Play pass)'", 'raid button')
J = rep(J, "if(!autoPlayEligible(G.si,G.mode,G.raidLevel))return toast('Auto Play requires Player Level 5 and a 3-star clear of this exact map and mode.');",
  "if(!autoPlayEligible(G.si,G.mode,G.raidLevel))return toast(G.raidLevel?'Auto Play in raids needs the Raids Auto Play pass. See \U0001f48e Passes in the \u2630 menu.':'Auto Play requires Player Level 5 and a 3-star clear of this exact map and mode.');", 'raid toast')
J = rep(J, "const pid=G.raidLevel?'raid3':'speed3',pn=G.raidLevel?'Raids \u00d73 Speed':'\u00d73 Speed'", "const pid='speed3',pn='\u00d73 Speed'", 'speed hint')
if split:
    J = rep(J, f'\u00b7 gg-game.js \u00b7 Version {OLD} \u00b7', f'\u00b7 gg-game.js \u00b7 Version {NEW} \u00b7', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="Balance Update"><span class="update-tag tag-balance-update">Balance Update</span><h3>Tougher Raids, Bigger Rewards</h3>'
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-raids-saves-2026101136';", f"const CACHE='gem-guardians-{ed}-raid-autoplay-2026101137';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
