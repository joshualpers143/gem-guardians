#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.26: Restart Map button, offline lock for online features, one Secret unit per
banner. Works on the single-file source and on the deployed split files. Every edit is anchor-checked.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.25', '2026.10.11.26'
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
# --- Banner: one featured Secret unit per refresh ---
J = rep(J, "  featured.Common=featuredCommons[0];\n}\n",
        "  featured.Common=featuredCommons[0];\n  featured.Secret=bannerSecret(slot);\n}\n"
        "// One featured Secret unit per banner, rotating every refresh (raid-only Secrets are never summonable).\n"
        "function bannerSecret(slot){\n  const ids=Object.keys(UNITS).filter(id=>UNITS[id].r==='Secret'&&!UNITS[id].raidOnly);\n"
        "  return ids.length?ids[(slot%ids.length+ids.length)%ids.length]:null;\n}\n", 'banner secret')
old_card = ("  $('#summonPool').insertAdjacentHTML('beforeend', S.playerLevel>=10 ? '<div class=\"card\" style=\"border:1px solid #a82035;background:#140e17\"><canvas class=\"ico\" width=\"72\" height=\"64\" data-id=\"abyss_summoner\"></canvas><b class=\"Secret\">Abyss Summoner</b><br><small>Secret • 0.5% chance • Guaranteed by 2,500 pulls • Unlocked</small></div>' : ")
new_card = ("  const sid=featured.Secret,su=sid&&UNITS[sid];\n"
            "  $('#summonPool').insertAdjacentHTML('beforeend', S.playerLevel>=10&&su ? '<div class=\"card\" style=\"border:1px solid #a82035;background:#140e17\"><canvas class=\"ico\" width=\"72\" height=\"64\" data-id=\"'+sid+'\"></canvas><b class=\"Secret\">'+su.n+'</b><br><span class=\"Secret\">Secret</span> · '+su.t+'<br><small>Featured Secret • 0.5% chance • Guaranteed by 2,500 pulls</small><br><small>'+(su.ability||'')+'</small></div>' : ")
J = rep(J, old_card, new_card, 'secret card')
i = J.find("  if(S.playerLevel>=10){for(const id of ['rift_blade','chrono_warden']){")
if i < 0 or J.count("  if(S.playerLevel>=10){for(const id of ['rift_blade','chrono_warden']){") != 1: raise SystemExit('ANCHOR FAIL [extra secret cards]')
j = J.find("\n", i)
if 'Shared 0.5% chance' not in J[i:j]: raise SystemExit('ANCHOR FAIL [extra secret cards body]')
J = J[:i] + "  // Only the featured Secret unit is shown (one per banner)." + J[j:]
J = rep(J, "const id=k==='Secret'?summonableSecrets[Math.floor(Math.random()*summonableSecrets.length)]:",
        "const id=k==='Secret'?(featured.Secret||summonableSecrets[Math.floor(Math.random()*summonableSecrets.length)]):", 'secret pull')
# --- Module code ---
end = "  try{if(typeof ggIconize==='function')ggIconize($('#bRanks'));}catch(e){}\n})();\n"
J = rep(J, end, end + mod('netlock.js'), 'append js')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('netlock.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
H_ = rep(H_, 'Three featured Common units and one featured Rare, Epic, Legendary and Mythic unit rotate every 5 minutes. Common pulls are split evenly between the three featured Commons. Secret units enter the shared pool at Player Level 10.',
         'Three featured Common units and one featured Rare, Epic, Legendary, Mythic and Secret unit rotate every 5 minutes. Common pulls are split evenly between the three featured Commons. The featured Secret unit unlocks at Player Level 10.', 'banner text')
H_ = rep(H_, 'Three Secret units unlock at Player Level 10 (Abyss Summoner, Rift Blade, Chrono Warden). Once unlocked, each pull has a 0.5% Secret chance,',
         'One Secret unit is featured per banner, rotating between Abyss Summoner, Rift Blade and Chrono Warden; Secrets unlock at Player Level 10. Once unlocked, each pull has a 0.5% chance of the featured Secret,', 'banner odds text')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="New Feature"><span class="update-tag tag-new-feature">New Feature</span><h3>Leaderboards</h3>'
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
pa = '<li>Sound, display and phone preferences are also stored only on your device.</li>'
out['privacy.html'] = rep(pv, pa, pa + '\n<li>To lock online features while you are offline, the game briefly checks whether its server can be reached. This check sends no personal or game data.</li>', 'privacy')
sw = rd('sw.js')
ed = 'creator' if "gem-guardians-creator-" in sw else 'public'
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-leaderboards-2026101125';", f"const CACHE='gem-guardians-{ed}-restart-offline-2026101126';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
