#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.42: detailed 3D characters (faces, hair, armour, capes, rarity crystals, depth shading,
new portraits), a redesigned summon banner, and Mythic / Secret pull celebrations (also during Auto Summon).
Replaces the 3D graphics block and adds the celebration module after it.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.41', '2026.10.11.42'
DOT = chr(0xb7)
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
start = '// ---------- 3D graphics (2026.10.11.40, detail pass 2026.10.11.41) ----------\n'
end = 'window.__gg3dReady=true;\n'
if J.count(start) != 1 or J.count(end) != 1: raise SystemExit('ANCHOR FAIL [3d block]')
a = J.index(start); b = J.index(end)
if b < a: raise SystemExit('ANCHOR FAIL [3d block order]')
J = J[:a] + mod('gg3d.js') + end + mod('charfx.js') + J[b + len(end):]
if split:
    J = rep(J, f'{DOT} gg-game.js {DOT} Version {OLD} {DOT}', f'{DOT} gg-game.js {DOT} Version {NEW} {DOT}', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="New Feature"><span class="update-tag tag-new-feature">New Feature</span><h3>3D Detail Pass: Real 3D Camera</h3>'
H_ = rep(H_, anc, info + anc, 'update info')
H_ = rep(H_, '</head>', '<style>\n' + mod('charfx.css') + '</style>\n</head>', 'css')
out = {}
if split:
    H_ = rep(H_, f'.js?v={OLD}"', f'.js?v={NEW}"', 'script tags', 3)
    out['index.html'] = H_; out['gg-game.js'] = J
    for f in ('gg-sound.js', 'gg-art.js'):
        out[f] = rep(rd(f), f'{DOT} {f} {DOT} Version {OLD} {DOT}', f'{DOT} {f} {DOT} Version {NEW} {DOT}', f + ' header')
else:
    out['index.html'] = H_
sw = rd('sw.js')
ed = 'creator' if "gem-guardians-creator-" in sw else 'public'
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-3d-detail-2026101141';", f"const CACHE='gem-guardians-{ed}-characters-2026101142';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
