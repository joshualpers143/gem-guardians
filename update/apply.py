#!/usr/bin/env python3
"""Apply the 2026.10.11.15 visual overhaul to the deployed Public files in this repo.
Run by .github/workflows/apply-update.yml. Every edit is anchor-checked; nothing is
written unless all anchors match. Usage: python3 update/apply.py <repo_dir>"""
import os, sys
R = sys.argv[1]
OLD, NEW = '2026.10.11.14', '2026.10.11.15'
U = os.path.join(R, 'update')
def rd(p): return open(os.path.join(R, p), encoding='utf-8').read()
def rep(s, old, new, label, count=1):
    n = s.count(old)
    if n != count: raise SystemExit(f'ANCHOR FAIL [{label}]: expected {count}, found {n}')
    return s.replace(old, new)
if f"const GAME_VERSION='{NEW}';" in rd('index.html'):
    print('Already on', NEW); sys.exit(0)
css = open(os.path.join(U, 'visual.css'), encoding='utf-8').read()
js = open(os.path.join(U, 'visual.js'), encoding='utf-8').read()
info = open(os.path.join(U, 'update-info.html'), encoding='utf-8').read()
out = {}
s = rd('index.html')
s = rep(s, '</head>', '<style>\n' + css + '</style>\n</head>', 'css')
s = rep(s, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
s = rep(s, f'.js?v={OLD}"', f'.js?v={NEW}"', 'script tags', 3)
anc = '<section class="qol-section" data-category="Balance Update"><span class="update-tag tag-balance-update">Balance Update</span><h3>Common &amp; Rare Units Can Prestige Again'
s = rep(s, anc, info + anc, 'update info')
out['index.html'] = s
for f in ('gg-sound.js', 'gg-art.js'):
    out[f] = rep(rd(f), f'· {f} · Version {OLD} ·', f'· {f} · Version {NEW} ·', f + ' header')
s = rd('gg-game.js')
s = rep(s, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
s = rep(s, "return `<div class=\"card ${unlocked?'':'off'}\"><canvas class=\"ico\" width=\"72\" height=\"64\" data-id=\"${id}\"></canvas><b class=\"${u.r}\">${unlocked?u.n:'???'}</b><br>${u.r}<br>${unlocked?'Unlocked':'Not discovered'}<br><small>${unlocked?(u.ability||'Standard attack'):'🔒 Skills & effects hidden until obtained'}</small><br>${done?'✓ Reward claimed':unlocked?`<button data-claim=\"${id}\">Claim ${INDEX_REWARDS[u.r]} gems</button>`:`Reward: ${INDEX_REWARDS[u.r]} gems`}</div>`;",
        "return `<div class=\"card ${unlocked?'':'off'}\"${unlocked?` data-ix-id=\"${id}\" style=\"cursor:pointer\"`:''}><canvas class=\"ico\" width=\"72\" height=\"64\" data-id=\"${id}\"></canvas><b class=\"${u.r}\">${unlocked?u.n:'???'}</b><br>${u.r}<br>${unlocked?'Unlocked':'Not discovered'}<br><small class=\"ix-desc\">${unlocked?(u.ability||'Standard attack'):'🔒 Skills & effects hidden until obtained'}</small>${unlocked?'<small class=\"ix-more\">Tap for details</small>':''}${!INDEX_REWARDS[u.r]?'<small class=\"ix-noreward\">No gem reward</small>':done?'✓ Reward claimed':unlocked?`<button data-claim=\"${id}\">Claim ${INDEX_REWARDS[u.r]} gems</button>`:`Reward: ${INDEX_REWARDS[u.r]} gems`}</div>`;", 'index card')
s = rep(s, "<span class=\"dock-cost\">💰 '+u.c+'</span>", "<span class=\"dock-cost\">'+ggIcon('coin')+' '+u.c+'</span>", 'dock coin')
s = rep(s, "if(tabBtn)tabBtn.textContent='👹 Enemies '+known+'/'+ENEMY_INDEX.length;", "if(tabBtn)tabBtn.innerHTML=(typeof GGI!=='undefined'?'<span class=\"ggi-wrap\">'+GGI.demon+'</span>':'👹 ')+'Enemies '+known+'/'+ENEMY_INDEX.length;", 'enemy tab')
s = rep(s, 'renderVersionLabels();requestPersistentStorage();\n', 'renderVersionLabels();requestPersistentStorage();\n' + js, 'append js')
out['gg-game.js'] = s
s = rd('sw.js')
s = rep(s, "const CACHE='gem-guardians-public-prestige-limits-2026101114';", "const CACHE='gem-guardians-public-visual-overhaul-2026101115';", 'sw cache')
s = rep(s, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = s
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', ', '.join(out))
