#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.27: Game Passes (x3 Speed, 2x AFK Rewards, Auto Summon+, VIP), redeem codes and
free x3 Speed for early players. Works on the single-file source and on the deployed split files.
Every edit is anchor-checked. Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.26', '2026.10.11.27'
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
# 2x AFK Rewards pass
J = rep(J, "    const gems=5+Math.floor(Math.random()*6);\n    const reroll=Math.random()<0.05?1:0;\n",
        "    const gems=(5+Math.floor(Math.random()*6))*ggAfkMult();\n    const reroll=Math.random()<0.05*ggAfkMult()?1:0;\n", 'afk rewards')
# Auto Summon+ keeps waiting for gems instead of stopping below 400
J = rep(J, "if(S.gems<400){autoSummonActive=false;", "if(S.gems<400&&!ggAutoSumPlus()){autoSummonActive=false;", 'auto summon stop')
end = "  toast('↻ Map restarted from wave 1');}\n"
J = rep(J, end, end + mod('passes.js'), 'append js')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('passes.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="New Feature"><span class="update-tag tag-new-feature">New Feature</span><h3>Restart Map Button</h3>'
H_ = rep(H_, anc, info + anc, 'update info')
out = {}
if split:
    H_ = rep(H_, f'.js?v={OLD}"', f'.js?v={NEW}"', 'script tags', 3)
    out['index.html'] = H_; out['gg-game.js'] = J
    for f in ('gg-sound.js', 'gg-art.js'):
        out[f] = rep(rd(f), f'· {f} · Version {OLD} ·', f'· {f} · Version {NEW} ·', f + ' header')
else:
    out['index.html'] = H_
pv = rd('privacy.html')
pa = '<li>We use this data only to provide Cloud Save.'
out['privacy.html'] = rep(pv, pa, '<li>If your account has <strong>Game Passes</strong>, which passes it owns and which codes it redeemed are stored, so your passes work on every device. VIP status is shown publicly on the leaderboards.</li>\n' + pa, 'privacy')
sw = rd('sw.js')
ed = 'creator' if "gem-guardians-creator-" in sw else 'public'
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-restart-offline-2026101126';", f"const CACHE='gem-guardians-{ed}-passes-2026101127';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
