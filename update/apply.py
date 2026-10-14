#!/usr/bin/env python3
"""Gem Guardians 2026.10.11.36: tougher raids with bigger rewards; the public game keeps saves only on the device
and in Cloud Save (no save files). Works on the single-file source and on the deployed split files.
Every edit is anchor-checked. Usage: python3 apply.py <dir> [update_dir] [stamp]"""
import os, sys
R = sys.argv[1]
U = sys.argv[2] if len(sys.argv) > 2 else os.path.join(R, 'update')
STAMP = sys.argv[3] if len(sys.argv) > 3 else None
OLD, NEW = '2026.10.11.35', '2026.10.11.36'
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
i = J.find("(function(){const o=finish;finish=function(){const pre=S.gems;const r=o.apply(this,arguments);")
if i < 0 or J.count("(function(){const o=finish;finish=function(){const pre=S.gems;const r=o.apply(this,arguments);") != 1: raise SystemExit('ANCHOR FAIL [vip finish]')
k = J.index("  return r;};})();\n", i) + len("  return r;};})();\n")
J = J[:k] + mod('secure.js') + J[k:]
J = rep(J, "const gems=100*lv;", "const gems=GG_RAID_GEMS[lv-1]||100*lv;", 'raid gems')
J = rep(J, "\\n\\nA backup file will be downloaded first.\\n\\nType RESET to confirm:'", "'+(GG_EDITION==='public'?'\\n\\nThis cannot be undone.':'\\n\\nA backup file will be downloaded first.')+'\\n\\nType RESET to confirm:'", 'reset prompt')
J = rep(J, "try{downloadSaveExport('pre-reset')}", "if(GG_EDITION!=='public')try{downloadSaveExport('pre-reset')}", 'reset backup')
J = rep(J, "No pre-import recovery save exists yet. Import a backup first.", "There is nothing to undo yet.", 'undo empty')
J = rep(J, "Restore your progress from before the last successful import? Your current progress will be replaced. Export your current save first if you want to keep it.",
  "Go back to the progress you had before your last restore? Your current progress will be replaced.", 'undo confirm')
J = rep(J, "Progress saves automatically. Use Export, Share or Copy Save in Settings for a backup before clearing browser data or changing devices.",
  "Progress saves automatically on this device. Sign in to Cloud Save in Settings to keep a safe copy online and to play on another phone.", 'overview text')
J = rep(J, "Export backups regularly.", "Sign in to Cloud Save to keep a copy online.", 'storage status', 3)
J = rep(J, "+'<small>Not sure? Use Export Save below first to keep a copy of this device&#39;s progress.</small>'",
  "+(GG_EDITION==='public'?'':'<small>Not sure? Use Export Save below first to keep a copy of this device&#39;s progress.</small>')", 'cloud choice')
if split:
    J = rep(J, f'\u00b7 gg-game.js \u00b7 Version {OLD} \u00b7', f'\u00b7 gg-game.js \u00b7 Version {NEW} \u00b7', 'game header')
    H_ = H
else:
    H_ = J
if 'gem-guardians-creator-' not in rd('sw.js'):
    H_ = rep(H_, 'Reset erases all progress for this edition, including its local backup and pre-import recovery save. You must type RESET to confirm, and a backup file is downloaded first.',
      'Reset erases all progress for this edition on this device, including its local backup. You must type RESET to confirm. This cannot be undone.', 'danger zone')
H_ = rep(H_, "'Export your save from Settings to keep a backup of your progress.'", "'Sign in to Cloud Save in Settings to keep your progress safe online.'", 'loading tip')
H_ = rep(H_, '</head>', '<style>\n' + mod('secure.css') + '</style>\n</head>', 'css')
H_ = rep(H_, f"const GAME_VERSION='{OLD}';", f"const GAME_VERSION='{NEW}';", 'version')
info = mod('update-info.html')
if STAMP: info = info.replace('{STAMP}', STAMP)
anc = '<section class="qol-section" data-category="New Feature"><span class="update-tag tag-new-feature">New Feature</span><h3>VIP Perks: More Gems and EXP</h3>'
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
sw = rep(sw, f"const CACHE='gem-guardians-{ed}-vip-raid-2026101135';", f"const CACHE='gem-guardians-{ed}-raids-saves-2026101136';", 'sw cache')
if split: sw = rep(sw, f'.js?v={OLD}', f'.js?v={NEW}', 'sw assets', 3)
out['sw.js'] = sw
for f, t in out.items():
    open(os.path.join(R, f), 'w', encoding='utf-8').write(t)
print('Applied', NEW, 'to', R, ':', ', '.join(out))
