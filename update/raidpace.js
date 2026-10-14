// ---------- Faster raids; skill tags for every unit (2026.10.11.38) ----------
// Raids felt too long (Level 5 took over 11 minutes at x3). In raids enemies now come every 0.4s (was 0.75s)
// and the next wave starts 3s after a wave's last enemy (was 5s): Level 5 takes about 5-6 minutes at x3,
// Levels 1-4 under 2 minutes. Regular maps are unchanged.
const GG_RAID_SPAWN=.4,GG_RAID_GAP=3;
// Denser waves are harder, so raid enemy health is set back to the same difficulty as before (checked with
// Auto Play: a level-60 team clears Levels 1-2, a level-100 3-star team Levels 1-4, a maxed team Level 5 with lives to spare).
const GG_RAID_PACE_HP=.6,GG_RAID_PACE_L5=.7;
ggRaidHpm=function(lv){return STAGES[GG_RAID_BASE_MAP].hp*stageDifficulty(GG_RAID_BASE_MAP)*MODES.hell.hp*raidScale(lv)*GG_RAID_PACE_HP*(lv===5?GG_RAID_PACE_L5:1);};
// Units that had no Single Target / Area tags get them (Count Vesper, Barter, Chrono Warden, Abyss Summoner),
// and any future unit without an entry still gets a tag from its damage.
GG_ROLES.sum=['Summoner','#d8b4fe'];
Object.assign(GG_ABIL_TEXT,{
 alucard:{n:'Twin Moon Pistols',r:['st','area','sup'],d:'Two silver pistols fire alternating empowered shots. Blood Regeneration: restores a life every 20 kills (up to starting lives). Shadow Hound: unleashes a shadow-hound strike every 12 seconds. Moonlit Fury: every fifth attack adds 200% damage and a shadow blast.'},
 barter:{n:"Merchant's Dividend",r:['eco','sup'],d:'Earns 10 coins every 5 seconds at boost 1/5. Each boost reduces the income cooldown by 1 second (minimum 1 second at boost 5/5) and increases the bonus by 5 coins, scaling that bonus by 1.1× per boost.'},
 chrono_warden:{n:'Time Stop',r:['ctrl','area'],d:'Freezes all enemies in its area for 1 second, gaining +0.5 seconds with each boost (3 seconds at 5/5). Activates every 10 seconds.'},
 abyss_summoner:{n:'Shadow Summons',r:['sum','area'],d:"Summons three shadow monsters every 5 seconds at your base; they walk the road toward the enemy entrance and ram enemies (55% damage per collision). Each has HP equal to 275% of this unit's damage and loses HP on every collision. At map boost 5/5 summons two Elite Ghouls instead (150% damage per collision)."}
});
(function(){const o=ggAbilInfo;ggAbilInfo=function(id){const a=o.apply(this,arguments);if(a)return a;const U=UNITS[id];if(!U)return null;
  const t=String(U.ability||'').trim(),m=t.match(/^([^:.]{2,40}):\s*([\s\S]+)$/);
  return {n:m?m[1]:'Ability',r:[(U.d||0)>0?'st':'sup'],d:m?m[2]:(t||'Standard attack.')};};})();
