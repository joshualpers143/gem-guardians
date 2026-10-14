#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.40: battles in full 3D (built-in WebGL2 renderer: 3D maps, units, enemies and
effects; Settings -> 3D graphics switches back to 2D).
Works on the single-file source and on the deployed split files. Every edit is anchor-checked.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.39', '2026.10.11.40'
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
anc = "  try{ggNetApply()}catch(e){}};\n"
J = rep(J, anc, anc + mod('gg3d.js') + "window.__gg3dReady=true;\n", 'module')
anc = "function draw(){\n  cx.setTransform(1,0,0,1,0,0);\n  cx.clearRect(0,0,800,450);\n  cx.fillStyle='#0b1020';cx.fillRect(0,0,800,450);"
J = rep(J, anc, "function draw(){\n  if(window.__gg3dReady&&typeof gg3dDrawBase==='function'&&gg3dDrawBase())return;" + anc[len("function draw(){"):], 'draw hook')
if split:
    J = rep(J, f'\u00b7 gg-game.js \u00b7 Version {OLD} \u00b7', f'\u00b7 gg-game.js \u00b7 Version {NEW} \u00b7', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="QoL"><span class="update-tag tag-qol">QoL</span><h3>New Look for Game Passes</h3>'
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-pass-look-2026101139';", f"const CACHE='gem-guardians-{ed}-full-3d-2026101140';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
