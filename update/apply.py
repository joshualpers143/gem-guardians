#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.29: Void Sovereign (Secret trait), Auto Reroll pass and owner gifts.
Works on the single-file source and on the deployed split files. Every edit is anchor-checked.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.28', '2026.10.11.29'
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
# The trait must be in the base list so saves that have it keep it when they load.
J = rep(J, "Placement and boost costs -25%.'}\n};\nconst TRAIT_RATES=[['Common',.40],['Rare',.30],['Epic',.20],['Legendary',.09],['Mythic',.01]];",
        "Placement and boost costs -25%.'},\n void:{n:'Void Sovereign',rarity:'Secret',d:6,rg:1.5,spd:1.3,desc:'+500% damage, +50% range, +30% attack speed. A unit with this trait can be placed only once per battle.'}\n};\nconst TRAIT_RATES=[['Common',.399],['Rare',.30],['Epic',.20],['Legendary',.09],['Mythic',.01],['Secret',.001]];", 'traits')
# Placement checks also respect the one-placement rule.
J = rep(J, "placedNameCount(inst.id)>=unitPlacementCap(inst.id)", "ggPlaceFull(inst)", 'place inst', 3)
J = rep(J, "placedNameCount(i.id)>=unitPlacementCap(i.id)", "ggPlaceFull(i)", 'place i')
J = rep(J, "placedNameCount(i.id)<unitPlacementCap(i.id)", "!ggPlaceFull(i)", 'place filter')
end = "try{renderAll()}catch(e){}\n"
J = rep(J, "document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#ggFeed').classList.contains('hide'))ggFeedClose();});\n" + end,
        "document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#ggFeed').classList.contains('hide'))ggFeedClose();});\n" + end + mod('voidtrait.js'), 'append js')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('voidtrait.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
H_ = rep(H_, 'Every 150th reroll without a Mythic trait guarantees a random Mythic trait.',
         'Every 150th reroll without a Mythic trait guarantees a random Mythic trait, and 1,000 rerolls without the Secret trait guarantee Void Sovereign (0.1% per reroll). Auto Reroll is a pass.', 'forge text')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="QoL"><span class="update-tag tag-qol">QoL</span><h3>Easier Scrolling &amp; Quick Feed</h3>'
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
pa = '<li>If your account has <strong>Game Passes</strong>'
out['privacy.html'] = rep(pv, pa, '<li>If the developer sends your account a <strong>gift</strong> (for example a trait for one of your units), the gift and when you received it are stored.</li>\n' + pa, 'privacy')
sw = rd('sw.js')
ed = 'creator' if "gem-guardians-creator-" in sw else 'public'
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-quick-feed-2026101128';", f"const CACHE='gem-guardians-{ed}-void-sovereign-2026101129';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
