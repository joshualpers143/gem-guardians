#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.32: summoned creatures start at your base and fight by collision (with HP bars);
enemy health bars show HP numbers. Works on the single-file source and on the deployed split files.
Every edit is anchor-checked. Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.31', '2026.10.11.32'
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
end = "    else{me.textContent=board==='time'?'Your time starts counting while the game is open and you are signed in.':'Your summons start counting from your next summon while signed in.';me.classList.remove('hide');}}};})();\n"
J = rep(J, end, end + mod('summonfix.js'), 'append js')
J = rep(J, "  // Allied summons march from the player base to the enemy entrance, fighting along the path.\n  G.allies=G.allies||[];\n  for(const a of G.allies){\n    a.ttl-=dt;a.cooldown-=dt;\n    // Advance against the enemy flow, from the path exit to its entrance.\n    if(Number.isFinite(a.d)){\n      a.d=Math.max(0,a.d-(a.speed||135)*dt);\n      [a.x,a.y]=posAt(a.d);\n      if(a.d<=0)a.ttl=0;\n    }\n    if(a.ttl<=0)continue;\n    if(a.cooldown<=0){\n      const target=G.en.filter(e=>e.hp>0).sort((x,y)=>Math.hypot(x.x-a.x,x.y-a.y)-Math.hypot(y.x-a.x,y.y-a.y))[0];\n      if(target&&Math.hypot(target.x-a.x,target.y-a.y)<110){\n        target.hp-=a.damage;a.cooldown=a.elite?.7:1.05;\n        if(S.settings.attackFx)G.fx.push({a:[a.x,a.y],b:[target.x,target.y],l:.12,c:a.elite?'#ff173d':'#a52a40'});\n      }\n    }\n  }\n  G.allies=G.allies.filter(a=>a.ttl>0);\n", '  // 2026.10.11.32: summoned creatures walk from the base and fight by collision (summonfix).\n  ggAlliesStep(dt);\n', 'ally step')
J = rep(J, '        // Summoner HP is a unit-specific stat for its minions, not a tower life bar.\n        const summonerHp=100+u.pl*12+u.bl*35;\n        for(let i=0;i<count;i++)summonPathAlly(u.uid,elite,elite?summonerHp*1.25:summonerHp*.75,u.d*(elite?1.5:.55),i*18);\n', "        // 2026.10.11.32: creature HP = 275% of the unit's damage (grows with every boost).\n        for(let i=0;i<count;i++)summonPathAlly(u.uid,elite,ggAllyHp(u),u.d*(elite?1.5:.55),i*18,elite?'ghoul':'shadow');\n", 'summoner spawn')
J = rep(J, 'for(let i=0;i<2;i++)G.wolves.push({owner:u.uid,d:Math.max(0,G.tot*.04),damage:u.d*1.25,offset:i*12,ttl:15});', "for(let i=0;i<2;i++)summonPathAlly(u.uid,false,ggAllyHp(u),u.d*1.25,i*16,'wolf');", 'wolf spawn')
J = rep(J, '  for(const a of (G.allies||[]))drawSummonedCreature(a);\n', '  ggDrawAllies();\n', 'ally draw')
J = rep(J, '  enemyFxRender();\n  // Lighting', '  enemyFxRender();\n  ggEnemyHpLabels();\n  // Lighting', 'hp labels')
J = rep(J, 'const DEFAULT_SETTINGS={autoRestart:false,attackFx:true,autoSell:false};', 'const DEFAULT_SETTINGS={autoRestart:false,attackFx:true,autoSell:false,hpNumbers:true};', 'settings default')
J = rep(J, '\'<div class="quick-meta">2 Hell Wolves every 15s · 125% damage each</div>\'', '\'<div class="quick-meta">2 Hell Wolves every 15s from your base · 125% damage per collision · \'+ggHpNum(ggAllyHp(u))+\' HP each</div>\'', 'wolf info')
J = rep(J, "(u.bl>=5?'2 Elite Ghouls every 5s · each 150% DMG / 125% HP':'3 shadow monsters every 5s')", "(u.bl>=5?'2 Elite Ghouls every 5s · 150% damage per collision':'3 shadow monsters every 5s · 55% damage per collision')+' · '+ggHpNum(ggAllyHp(u))+' HP each'", 'summoner info')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
fx = 'data-setting="attackFx"></label>'
H_ = rep(H_, fx, fx + '\n <label class="setting"><span><b>Enemy HP numbers</b><small>Show how much HP each enemy has left above its health bar, for example 1000/1000</small></span><input type="checkbox" data-setting="hpNumbers"></label>', 'settings toggle')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="New Feature"><span class="update-tag tag-new-feature">New Feature</span><h3>Leaderboards: Most Time Played &amp; Most Summons</h3>'
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-more-boards-2026101131';", f"const CACHE='gem-guardians-{ed}-summon-collide-2026101132';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
