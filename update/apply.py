#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.20: trait fixes and rebalance. Works on the single-file source and on the
deployed split files. Every edit is anchor-checked. Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.19', '2026.10.11.20'
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
# Trait rarities now match unit rarities; Mythic power trimmed to about 2x DPS, Legendary slightly up.
T = [
 ("nimble:{n:'Quickstep',rarity:'Uncommon',", "nimble:{n:'Quickstep',rarity:'Rare',"),
 ("fierce:{n:'Ferocious',rarity:'Uncommon',", "fierce:{n:'Ferocious',rarity:'Rare',"),
 ("hunter:{n:'Eagle Eye',rarity:'Rare',", "hunter:{n:'Eagle Eye',rarity:'Epic',"),
 ("tempest:{n:'Tempest',rarity:'Rare',", "tempest:{n:'Tempest',rarity:'Epic',"),
 ("monarch:{n:'War Monarch',rarity:'Legendary',d:1.45,rg:1,spd:1.1,desc:'+45% damage, +10% attack speed'}", "monarch:{n:'War Monarch',rarity:'Legendary',d:1.5,rg:1,spd:1.12,desc:'+50% damage, +12% attack speed'}"),
 ("horizon:{n:'Far Horizon',rarity:'Legendary',d:1.2,rg:1.4,spd:1.15,desc:'+20% damage, +40% range, +15% attack speed'}", "horizon:{n:'Far Horizon',rarity:'Legendary',d:1.25,rg:1.4,spd:1.18,desc:'+25% damage, +40% range, +18% attack speed'}"),
 ("astral:{n:'Astral Overlord',rarity:'Mythic',d:2.1,rg:1.25,spd:1.25,desc:'+110% damage, +25% range, +25% attack speed'}", "astral:{n:'Astral Overlord',rarity:'Mythic',d:1.6,rg:1.2,spd:1.25,desc:'+60% damage, +20% range, +25% attack speed'}"),
 ("singularity:{n:'Singularity',rarity:'Mythic',d:1.7,rg:1.6,spd:1.55,desc:'+70% damage, +60% range, +55% attack speed'}", "singularity:{n:'Singularity',rarity:'Mythic',d:1.35,rg:1.5,spd:1.45,desc:'+35% damage, +50% range, +45% attack speed'}"),
 ("cosmic:{n:'Cosmic Ascendant',rarity:'Mythic',d:2.5,rg:1.1,spd:1.1,desc:'+150% damage, +10% range, +10% attack speed'}", "cosmic:{n:'Cosmic Ascendant',rarity:'Mythic',d:1.8,rg:1.1,spd:1.1,desc:'+80% damage, +10% range, +10% attack speed'}"),
 ("const TRAIT_RATES=[['Common',.40],['Uncommon',.30],['Rare',.20],['Legendary',.09],['Mythic',.01]];", "const TRAIT_RATES=[['Common',.40],['Rare',.30],['Epic',.20],['Legendary',.09],['Mythic',.01]];"),
]
for i, (a, b) in enumerate(T): J = rep(J, a, b, 'trait %d' % i)
end = "    ggInfoButton(en,'Enemy strength',()=>[full]);}\n})();\n"
J = rep(J, end, end + mod('traitfix.js'), 'append js')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('traitfix.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="Balance Update"><span class="update-tag tag-balance-update">Balance Update</span><h3>Player EXP Rebalance'
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-player-exp-2026101119';", f"const CACHE='gem-guardians-{ed}-trait-fixes-2026101120';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
