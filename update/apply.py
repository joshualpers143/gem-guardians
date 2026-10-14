#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.35: VIP perks (+25% gems, +25% unit EXP, +50% player EXP), Raids x3 Speed pass,
permanent passes. Works on the single-file source and on the deployed split files. Every edit is anchor-checked.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.34', '2026.10.11.35'
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
end = "  window.ggInboxFromLink=ggInboxFromLink;setTimeout(ggInboxFromLink,3000);window.addEventListener('hashchange',ggInboxFromLink);\n}\n"
J = rep(J, end, end + mod('vipraid.js'), 'append js')
J = rep(J, "const ranked=G.lbBoard&&!G.lbSkip&&ggHasPass('speed3');\n    toast(ranked?'\u23e9 Ranked runs use Speed \u00d73 only when your account owns the \u00d73 Speed pass.':'\u23e9 Speed \u00d73 needs the \u00d73 Speed pass. See \U0001f48e Passes in the \u2630 menu.');",
  "const pid=G.raidLevel?'raid3':'speed3',pn=G.raidLevel?'Raids \u00d73 Speed':'\u00d73 Speed',ranked=G.lbBoard&&!G.lbSkip&&ggHasPass(pid);\n    toast(ranked?'\u23e9 Ranked runs use Speed \u00d73 only when your account owns the '+pn+' pass.':'\u23e9 Speed \u00d73'+(G.raidLevel?' in raids':'')+' needs the '+pn+' pass. See \U0001f48e Passes in the \u2630 menu.');", 'speed toast')
J = rep(J, "One-time unlocks saved to your Cloud Save account, so they work on every device. Passes add convenience or looks, <b>never extra power</b>.",
  "<b>Every pass is permanent</b>: once your account has it, you keep it forever, on every device through Cloud Save. Most passes add convenience; <b>VIP</b> also boosts gems and EXP.", 'shop intro')
J = rep(J, "<div class=\"gg-pass-txt\"><b>'+p.n+'</b>", "<div class=\"gg-pass-txt\"><b>'+p.n+'</b><span class=\"gg-pass-perm\">Permanent</span>", 'pass card')
if split:
    J = rep(J, f'\u00b7 gg-game.js \u00b7 Version {OLD} \u00b7', f'\u00b7 gg-game.js \u00b7 Version {NEW} \u00b7', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('vipraid.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="QoL"><span class="update-tag tag-qol">QoL</span><h3>Faster Replies From the Creator</h3>'
H_ = rep(H_, anc, info + anc, 'update info')
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-support-inbox-2026101134';", f"const CACHE='gem-guardians-{ed}-vip-raid-2026101135';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
