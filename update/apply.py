#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.19: Player EXP rebalance. Works on the single-file source and on the
deployed split files. Every edit is anchor-checked. Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.18', '2026.10.11.19'
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
J = rep(J, "  const bonus={easy:1,medium:1.025,hard:1.05,hell:1.10};", "  // 2026.10.11.19: difficulty matters as much as it does for gems, and later maps are worth more.\n  const bonus={easy:1,medium:1.5,hard:2.5,hell:4};", 'exp bonus')
J = rep(J, "  return Math.round(50*Math.pow(1.015,index)*(bonus[mode]||1));", "  return Math.round(50*Math.pow(1.06,index)*(bonus[mode]||1));", 'exp growth')
J = rep(J, "const stars=stageStars(G.lives),key=stageStarKey(G.si,G.mode);\n    if(!inf)S.stageStars[key]=Math.max(S.stageStars[key]||0,stars);\n    const playerXp=regularMapPlayerExp(G.si,G.mode);gainPlayerExp(playerXp);",
        "const stars=stageStars(G.lives),key=stageStarKey(G.si,G.mode);const firstMode=!inf&&!S.stageStars[key];\n    if(!inf)S.stageStars[key]=Math.max(S.stageStars[key]||0,stars);\n    // First clear of a map on a difficulty: +60%. Each star: +10%.\n    const playerXp=Math.round(regularMapPlayerExp(G.si,G.mode)*(firstMode?1.6:1)*(inf?1:1+.1*stars));gainPlayerExp(playerXp);", 'win exp')
J = rep(J, "and '+playerXp+' player EXP.';R.gems=g;", "and '+playerXp+' player EXP'+(firstMode?' (first-clear bonus)':'')+'.';R.gems=g;", 'win msg')
J = rep(J, "gainPlayerExp(50);R.gems=gems;R.pxp=50;", "const raidXp=100+20*lv;gainPlayerExp(raidXp);R.gems=gems;R.pxp=raidXp;", 'raid exp')
J = rep(J, "else{S.gems+=10;R.gems=10;R.sub=", "else{S.gems+=10;R.gems=10;const lossXp=Math.round((G.raidLevel?100+20*G.raidLevel:regularMapPlayerExp(G.si,G.mode))*.25);gainPlayerExp(lossXp);R.pxp=lossXp;R.sub=", 'loss exp')
J = rep(J, "m='Your base fell. You earned 10 gems for trying.'}", "m='Your base fell. You earned 10 gems and '+lossXp+' player EXP for trying.'}", 'loss msg')
J = rep(J, "Regular maps: 50 base EXP, +1.5% per map; Medium +2.5%, Hard +5%, Hell +10%; Infinite: +1 EXP per wave, increasing every 10 waves'",
        "Wins: 50 EXP on Map 1 Easy, +6% per map; Medium ×1.5, Hard ×2.5, Hell ×4; +60% for a first clear on a difficulty; +10% per star. Losses: 25%. Raids: 120–200. Infinite: +1 EXP per wave, increasing every 10 waves'", 'profile text')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="QoL"><span class="update-tag tag-qol">QoL</span><h3>Cleaner Screens'
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-cleaner-screens-2026101118';", f"const CACHE='gem-guardians-{ed}-player-exp-2026101119';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
