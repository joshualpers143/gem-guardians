#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.33: Contact Support (numbered tickets, AI support helper, Creator Support Inbox).
Works on the single-file source and on the deployed split files. Every edit is anchor-checked.
Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.32', '2026.10.11.33'
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
end = "if(typeof GG_ABIL_TEXT!=='undefined'&&GG_ABIL_TEXT.abyss)GG_ABIL_TEXT.abyss.d='Every 15s releases 2 Hell Wolves at your base"
i = J.find(end)
if i < 0 or J.count(end) != 1: raise SystemExit('ANCHOR FAIL [append js]')
j = J.index('\n', i) + 1
J = J[:j] + mod('support.js') + J[j:]
if split:
    J = rep(J, f'\u00b7 gg-game.js \u00b7 Version {OLD} \u00b7', f'\u00b7 gg-game.js \u00b7 Version {NEW} \u00b7', 'game header')
    H_ = H
else:
    H_ = J
H_ = rep(H_, '</head>', '<style>\n' + mod('support.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="Bug Fix"><span class="update-tag tag-bug-fix">Bug Fix</span><h3>Summoned Creatures Fight by Collision</h3>'
H_ = rep(H_, anc, info + anc, 'update info')
out = {}
if split:
    H_ = rep(H_, f'.js?v={OLD}"', f'.js?v={NEW}"', 'script tags', 3)
    out['index.html'] = H_; out['gg-game.js'] = J
    for f in ('gg-sound.js', 'gg-art.js'):
        out[f] = rep(rd(f), f'\u00b7 {f} \u00b7 Version {OLD} \u00b7', f'\u00b7 {f} \u00b7 Version {NEW} \u00b7', f + ' header')
else:
    out['index.html'] = H_
pv = rd('privacy.html')
pv = rep(pv, 'Last updated: October 12, 2026', 'Last updated: October 13, 2026', 'privacy date')
pv = rep(pv, '<h2>Backups you make</h2>', '<h2>Contact Support</h2>\n<p>Contact Support is used only if you open a support ticket (it needs a Cloud Save sign-in). If you do:</p>\n<ul>\n'
  '<li>Your <strong>messages</strong>, the ticket number and times, your player name, and, only if you leave the box ticked, basic <strong>game info</strong> (player level, gems, number of units, maps and raid levels cleared, passes, game version, device type, whether the game is installed) are stored with Supabase so we can answer you.</li>\n'
  '<li>To write the instant replies, your ticket\'s messages and that game info are sent to our AI provider, <a href="https://www.anthropic.com/legal/privacy">Anthropic</a> (Claude). They are not used for advertising.</li>\n'
  '<li>The game\'s Creator can read your tickets and reply to them. Please never put passwords, payment details or other personal information in a support message.</li>\n'
  '<li>You can close a ticket at any time. Deleting your cloud account also deletes your tickets.</li>\n</ul>\n<h2>Backups you make</h2>', 'privacy support')
pv = rep(pv, 'and, only if you signed in to Cloud Save, it backs up and restores your save.', 'and, only if you signed in to Cloud Save, it backs up and restores your save and, if you contact support, sends and loads your support messages.', 'privacy internet')
out['privacy.html'] = pv
sw = rd('sw.js')
ed = 'creator' if "gem-guardians-creator-" in sw else 'public'
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-summon-collide-2026101132';", f"const CACHE='gem-guardians-{ed}-support-2026101133';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
