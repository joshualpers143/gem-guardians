#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.16: level unlocks, a shorter beginner tutorial and a tutorial for each system.
Works on the single-file source (index.html holds everything) and on the deployed split files
(index.html + gg-game.js). Every edit is anchor-checked; nothing is written unless all match.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.15', '2026.10.11.16'
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
# --- game code ---
a = J.find('const GUIDE_STEPS=['); b = J.find('];\nfunction guideSave', a)
if J.count('const GUIDE_STEPS=[') != 1 or a < 0 or b < 0: raise SystemExit('ANCHOR FAIL [guide steps]')
J = J[:a] + mod('intro_steps.js') + J[b + 3:]
J = rep(J, 'function guideSave(){try{', "function guideSave(){if(guide.kind&&guide.kind!=='intro')return;try{", 'guide save')
J = rep(J, "'Tutorial '+(guide.step+1)+' / '+GUIDE_STEPS.length", "(guide.label||'Tutorial')+' · '+(guide.step+1)+' / '+GUIDE_STEPS.length", 'guide label')
J = rep(J, 'function guideStart(fromStep=0){guide.active=true;', "function guideStart(fromStep=0){GUIDE_STEPS=GG_INTRO_STEPS;guide.kind='intro';guide.label='Tutorial';guide.active=true;", 'guide start')
J = rep(J, "toast('Tutorial complete! Replay it any time from 📖 Tutorial.');", "toast(guide.kind==='feature'?'Got it! Replay this any time from ☰ → Help & Tutorials.':'Tutorial complete! Replay any tutorial from ☰ → Help & Tutorials.');", 'guide finish')
J = rep(J, 'if(saved&&Number.isInteger(saved.step)){guideStart(saved.step);return;}', 'if(saved&&Number.isInteger(saved.step)){if(saved.step<GG_INTRO_STEPS.length)guideStart(saved.step);return;}', 'guide resume')
end = "ggShowUnitById(c.dataset.ixId);};});}catch(e){}return r;};})();\n"
J = rep(J, end, end + mod('unlocks.js'), 'append js')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
# --- page ---
H_ = rep(H_, '</head>', '<style>\n' + mod('unlocks.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="New Feature"><span class="update-tag tag-new-feature">New Feature</span><h3>Visual Overhaul'
H_ = rep(H_, anc, info + anc, 'update info')
out = {}
if split:
    H_ = rep(H_, f'.js?v={OLD}"', f'.js?v={NEW}"', 'script tags', 3)
    out['index.html'] = H_; out['gg-game.js'] = J
    for f in ('gg-sound.js', 'gg-art.js'):
        out[f] = rep(rd(f), f'· {f} · Version {OLD} ·', f'· {f} · Version {NEW} ·', f + ' header')
else:
    out['index.html'] = H_
sw = rd('sw.js')
ed = 'creator' if "gem-guardians-creator-" in sw else 'public'
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-visual-overhaul-2026101115';", f"const CACHE='gem-guardians-{ed}-unlocks-tutorials-2026101116';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
