#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.25: leaderboards. Works on the single-file source and on the
deployed split files. Every edit is anchor-checked. Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.24', '2026.10.11.25'
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
end = "ggCloudView='';ggCloudRender();try{renderProfile()}catch(e){}\n"
J = rep(J, end, end + mod('lb.js'), 'append js')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('lb.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="QoL"><span class="update-tag tag-qol">QoL</span><h3>Name Changes Are Checked Online'
H_ = rep(H_, anc, info + anc, 'update info')
out = {}
if split:
    H_ = rep(H_, f'.js?v={OLD}"', f'.js?v={NEW}"', 'script tags', 3)
    out['index.html'] = H_; out['gg-game.js'] = J
    for f in ('gg-sound.js', 'gg-art.js'):
        out[f] = rep(rd(f), f'· {f} · Version {OLD} ·', f'· {f} · Version {NEW} ·', f + ' header')
else:
    out['index.html'] = H_
# Privacy policy: Cloud Save, public player names and leaderboard scores.
pv = rd('privacy.html')
i, j = pv.find('<main>'), pv.find('</main>')
if i < 0 or j < 0: raise SystemExit('ANCHOR FAIL [privacy main]')
out['privacy.html'] = pv[:i] + mod('privacy-main.html').rstrip('\n') + pv[j + len('</main>'):]
sw = rd('sw.js')
ed = 'creator' if "gem-guardians-creator-" in sw else 'public'
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-name-rules-2026101124';", f"const CACHE='gem-guardians-{ed}-leaderboards-2026101125';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
