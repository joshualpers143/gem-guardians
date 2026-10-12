#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.21: unit abilities. Works on the single-file source and on the
deployed split files. Every edit is anchor-checked. Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.20', '2026.10.11.21'
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
# Ability hooks in the combat loop (each anchor is checked).
T = [
 ("if(spec){", "if(spec&&!(typeof GG_ABIL!=='undefined'&&GG_ABIL[u.id])){"),
 ("applyRankedAttackSkill(u,b,hits);", "applyRankedAttackSkill(u,b,hits);if(typeof ggAbilOnHit==='function')ggAbilOnHit(u,b,hits);"),
 ("u.t=u.cd*(speedBlessed?.8:1);", "u.t=u.cd*(speedBlessed?.8:1)*(typeof ggAbilCd==='function'?ggAbilCd(u):1);"),
 ("const blessingDamage=damageBlessed?1.2:1;", "const blessingDamage=(damageBlessed?1.2:1)*(typeof ggAbilDmg==='function'?ggAbilDmg(u,b):1);"),
 ("if(extra>0){e.hp-=extra;dmg+=extra;}", "if(e.ggVulnT>0)extra+=dmg*(e.ggVuln||0);if(extra>0){e.hp-=extra;dmg+=extra;}"),
 ("const pierce=att.some(u=>u.path==='pierce')?3:1", "const pierce=Math.max(att.some(u=>u.path==='pierce')?3:1,e.ggShieldX||1)"),
 ("o.hp=Math.min(o.mx,o.hp+o.mx*(o.boss?.03:.1))", "o.hp=Math.min(o.mx,o.hp+o.mx*(o.boss?.03:.1)*(o.ggBurnT>0?.5:1))"),
 ("a=(UNITS[id].ability||'').toLowerCase()", "a=(UNITS[id].abilityFx||UNITS[id].ability||'').toLowerCase()"),
]
for i, (a, b) in enumerate(T): J = rep(J, a, b, 'trait %d' % i)
end = "  return orig.call(this,e);};})();\n"
J = rep(J, end, end + mod('abil.js'), 'append js')
if split:
    J = rep(J, f'· gg-game.js · Version {OLD} ·', f'· gg-game.js · Version {NEW} ·', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('abil.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="Bug Fix"><span class="update-tag tag-bug-fix">Bug Fix</span><h3>Trait Fixes &amp; Rebalance'
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-trait-fixes-2026101120';", f"const CACHE='gem-guardians-{ed}-unit-abilities-2026101121';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
