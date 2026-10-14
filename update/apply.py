#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.41: 3D detail pass (cinematic perspective camera with sky, horizon and fog, bigger
models on rune platforms, lamp posts, motes, richer castle and graveyard props, Settings -> 3D camera).
Replaces the 3D graphics block added in .40. Works on the single-file source and on the deployed split files.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.40', '2026.10.11.41'
def rd(p): return open(os.path.join(R, p), encoding='utf-8').read()
def mod(p): return open(os.path.join(U, p), encoding='utf-8').read()
def rep(s, old, new, label, count=1):
    n = s.count(old)
    if n != count: raise SystemExit(f'ANCHOR FAIL [{label}]: expected {count}, found {n}')
    return s.replace(old, new)
BAD = 'Settings \u00e2\u0086\u0092 Enemy HP'
GOOD = 'Settings \u2192 Enemy HP'
def fixarrow(s): return s.replace(BAD, GOOD)
split = os.path.exists(os.path.join(R, 'gg-game.js'))
H = rd('index.html')
if f"const GAME_VERSION='{NEW}';" in H:
    print('Already on', NEW); sys.exit(0)
J = rd('gg-game.js') if split else H
start = '// ---------- 3D graphics (2026.10.11.40) ----------\n'
end = 'window.__gg3dReady=true;\n'
if J.count(start) != 1 or J.count(end) != 1: raise SystemExit('ANCHOR FAIL [3d block]')
a = J.index(start); b = J.index(end)
if b < a: raise SystemExit('ANCHOR FAIL [3d block order]')
J = J[:a] + mod('gg3d.js') + J[b:]
J = fixarrow(J)
if split:
    J = rep(J, f'\u00b7 gg-game.js \u00b7 Version {OLD} \u00b7', f'\u00b7 gg-game.js \u00b7 Version {NEW} \u00b7', 'game header')
    H_ = fixarrow(H)
else:
    H_ = J
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="New Feature"><span class="update-tag tag-new-feature">New Feature</span><h3>Battles in Full 3D</h3>'
H_ = rep(H_, anc, info + anc, 'update info')
H_ = rep(H_, '</head>', '<style>\n' + mod('gg3d.css') + '</style>\n</head>', 'css')
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-full-3d-2026101140';", f"const CACHE='gem-guardians-{ed}-3d-detail-2026101141';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
