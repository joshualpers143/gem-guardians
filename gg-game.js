/* Gem Guardians public edition · gg-game.js · Version 2026.10.11.15 · built from source/public/index.html by tools/split.py */
const $=s=>document.querySelector(s);
const TYPES={Physical:'#f59e0b',Ranged:'#84cc16',Magic:'#60a5fa',True:'#f8fafc'};
const MIG={scout:'knight',slinger:'apprentice',cannon:'sniper'};
const UNITS={
 alucard:{n:'Count Vesper',t:'True',r:'Secret',raidOnly:true,c:650,d:350,rg:190,cd:.55,col:'#7b3fc8',g:[.08,.005,.02],ability:'Twin Moon Pistols: two silver pistols fire alternating empowered shots. Blood Regeneration: restores a life every 20 kills (up to starting lives). Shadow Hound: unleashes a shadow-hound strike every 12 seconds. Moonlit Fury: every fifth attack adds 200% damage and a shadow blast.',special:0},
 barter:{n:'Barter',t:'Support',r:'Exclusive',c:100,d:0,rg:80,cd:1.5,col:'#d5a548',g:[.04,.003,.01],ability:"Merchant's Dividend: earns 10 coins every 5 seconds at boost 1/5. Each boost reduces the income cooldown by 1 second (minimum 1 second at boost 5/5) and increases the bonus by 5 coins, scaling that bonus by 1.1× per boost.",special:0},
 rift_blade:{n:'Rift Blade',t:'Physical',r:'Secret',c:340,d:115,rg:145,cd:.85,col:'#181625',g:[.07,.004,.012],ability:'Releases sweeping crescent energy slashes; every fourth strike unleashes a piercing shockwave',special:0},
 chrono_warden:{n:'Chrono Warden',t:'Magic',r:'Secret',c:360,d:65,rg:130,cd:1.15,col:'#172a39',g:[.045,.004,.012],ability:'Freezes all enemies in its area for 1 second, gaining +0.5 seconds with each boost (3 seconds at 5/5). Activates every 10 seconds',special:0},
 abyss_summoner:{n:'Abyss Summoner',t:'Magic',r:'Secret',c:320,d:95,rg:135,cd:1.1,col:'#08080c',g:[.065,.004,.014],ability:'Summons three shadow monsters every 5 seconds at your base; they march toward the enemy entrance. At map boost 5/5 summons two Elite Ghouls instead',special:0},
 knight:{n:'Knight',t:'Physical',r:'Common',c:55,d:15,rg:55,cd:.5,col:'#94a3b8',g:[.06,0,.01]},
 archer:{n:'Archer',t:'Ranged',r:'Common',c:50,d:9,rg:95,cd:.55,col:'#4d9a3a',g:[.04,.006,.012]},
 apprentice:{n:'Apprentice',t:'Magic',r:'Common',c:60,d:13,rg:85,cd:.8,col:'#8b5cf6',splash:30,g:[.045,.003,.015]},
 blade:{n:'Blade Dancer',t:'Physical',r:'Epic',c:120,d:22,rg:62,cd:.3,col:'#22d3ee',g:[.05,0,.025],ability:'Whirling Blades: every 4th hit splashes 30% damage nearby'},
 sniper:{n:'Sniper',t:'Ranged',r:'Epic',c:140,d:60,rg:180,cd:2,col:'#78716c',g:[.05,.008,.004],ability:'Precision Shot: every 3rd hit deals 35% bonus damage'},
 mage:{n:'Frost Mage',t:'Magic',r:'Epic',c:115,d:16,rg:105,cd:.8,col:'#3b82f6',slow:1,g:[.04,.004,.01],ability:'Frostbite: every 4th hit slows enemies for 1.5s'},
 dragon:{n:'Dragon Knight',t:'Physical',r:'Legendary',c:260,d:80,rg:70,cd:.9,col:'#a855f7',splash:38,g:[.07,.002,.005],ability:'Dragon Cleave: every 3rd hit deals 55% splash damage'},
 warden:{n:'Light Warden',t:'True',r:'Legendary',c:240,d:42,rg:115,cd:.8,col:'#fde68a',g:[.055,.004,.008],ability:'Radiant Verdict: every 4th attack strikes for 65% extra damage'},
 squire:{n:"Squire",t:'Physical',r:'Common',c:55,d:12,rg:65,cd:0.75,col:'#c4b5fd',g:[.05,.004,.012],ability:"armor breaker",special:1},
 slingshot:{n:"Pebble Scout",t:'Ranged',r:'Common',c:64,d:15,rg:77,cd:0.88,col:'#a3e635',g:[.05,.004,.012],ability:"ricochet",special:2},
 herbalist:{n:"Herbalist",t:'Magic',r:'Common',c:73,d:18,rg:89,cd:1.01,col:'#fb923c',g:[.05,.004,.012],ability:"poison",special:3},
 lancer:{n:"Lancer",t:'Physical',r:'Common',c:82,d:21,rg:101,cd:1.14,col:'#67e8f9',g:[.05,.004,.012],ability:"piercing strike",special:4},
 torch:{n:"Torch Bearer",t:'Magic',r:'Common',c:91,d:24,rg:65,cd:0.75,col:'#fda4af',g:[.05,.004,.012],ability:"burn",special:5},
 hunter:{n:"Forest Hunter",t:'Ranged',r:'Common',c:55,d:27,rg:77,cd:0.88,col:'#86efac',g:[.05,.004,.012],ability:"execute",special:6},
 miner:{n:"Iron Miner",t:'Physical',r:'Common',c:64,d:30,rg:89,cd:1.01,col:'#fbbf24',g:[.05,.004,.012],ability:"coin finder",special:7},
 monk:{n:"Wandering Monk",t:'True',r:'Common',c:73,d:12,rg:101,cd:1.14,col:'#93c5fd',g:[.05,.004,.012],ability:"healing aura",special:8},
 scout:{n:"Wind Scout",t:'Ranged',r:'Common',c:82,d:15,rg:65,cd:0.75,col:'#f0abfc',g:[.05,.004,.012],ability:"quick shot",special:9},
 guard:{n:"Shield Guard",t:'Physical',r:'Common',c:91,d:18,rg:77,cd:0.88,col:'#fdba74',g:[.05,.004,.012],ability:"stagger",special:10},
 alchemist:{n:"Alchemist",t:'Magic',r:'Rare',c:85,d:28,rg:109,cd:0.94,col:'#c4b5fd',g:[.05,.004,.012],ability:"acid",special:11},
 falconer:{n:"Falconer",t:'Ranged',r:'Rare',c:94,d:31,rg:121,cd:1.07,col:'#a3e635',g:[.05,.004,.012],ability:"falcon double hit",special:12},
 spearman:{n:"Spear Captain",t:'Physical',r:'Rare',c:103,d:34,rg:85,cd:0.68,col:'#fb923c',g:[.05,.004,.012],ability:"long thrust",special:13},
 druid:{n:"Moss Druid",t:'Magic',r:'Rare',c:112,d:37,rg:97,cd:0.81,col:'#67e8f9',g:[.05,.004,.012],ability:"root",special:14},
 pirate:{n:"Powder Pirate",t:'Ranged',r:'Rare',c:121,d:19,rg:109,cd:0.94,col:'#fda4af',g:[.05,.004,.012],ability:"explosive shot",special:15},
 brawler:{n:"Stone Brawler",t:'Physical',r:'Rare',c:85,d:22,rg:121,cd:1.07,col:'#86efac',g:[.05,.004,.012],ability:"heavy blow",special:16},
 trickster:{n:"Moon Trickster",t:'True',r:'Rare',c:94,d:25,rg:85,cd:0.68,col:'#fbbf24',g:[.05,.004,.012],ability:"critical trick",special:17},
 beekeeper:{n:"Bee Keeper",t:'Ranged',r:'Rare',c:103,d:28,rg:97,cd:0.81,col:'#93c5fd',g:[.05,.004,.012],ability:"swarm",special:18},
 rune:{n:"Rune Scribe",t:'Magic',r:'Rare',c:112,d:31,rg:109,cd:0.94,col:'#f0abfc',g:[.05,.004,.012],ability:"arcane echo",special:19},
 fencer:{n:"Silver Fencer",t:'Physical',r:'Rare',c:121,d:34,rg:121,cd:1.07,col:'#fdba74',g:[.05,.004,.012],ability:"rapid combo",special:20},
 storm:{n:"Storm Caller",t:'Magic',r:'Epic',c:135,d:50,rg:105,cd:0.65,col:'#c4b5fd',g:[.05,.004,.012],ability:'Chain Spark: every 4th hit arcs for 30% damage to a nearby enemy',special:21},
 assassin:{n:"Night Assassin",t:'Physical',r:'Epic',c:144,d:32,rg:117,cd:0.78,col:'#a3e635',g:[.05,.004,.012],ability:'Shadow Strike: every 3rd hit deals 40% bonus damage',special:22},
 ballista:{n:"Ballista Engineer",t:'Ranged',r:'Epic',c:153,d:35,rg:129,cd:0.91,col:'#fb923c',g:[.05,.004,.012],ability:'Piercing Bolt: every 4th shot hits another enemy for 30% damage',special:23},
 witch:{n:"Hex Witch",t:'Magic',r:'Epic',c:162,d:38,rg:141,cd:1.04,col:'#67e8f9',g:[.05,.004,.012],ability:'Hex: every 4th hit weakens an enemy with a 1.5s slow',special:24},
 berserker:{n:"Red Berserker",t:'Physical',r:'Epic',c:171,d:41,rg:105,cd:0.65,col:'#fda4af',g:[.05,.004,.012],ability:'Blood Fury: every 3rd hit deals 30% extra damage',special:25},
 oracle:{n:"Star Oracle",t:'True',r:'Epic',c:135,d:44,rg:117,cd:0.78,col:'#86efac',g:[.05,.004,.012],ability:'Fated Spark: every 4th hit deals 35% bonus damage',special:26},
 ranger:{n:"Thorn Ranger",t:'Ranged',r:'Epic',c:144,d:47,rg:129,cd:0.91,col:'#fbbf24',g:[.05,.004,.012],ability:'Thorn Volley: every 4th attack hits nearby enemies for 25% damage',special:27},
 pyro:{n:"Pyromancer",t:'Magic',r:'Epic',c:153,d:50,rg:141,cd:1.04,col:'#93c5fd',g:[.05,.004,.012],ability:'Ember Burst: every 4th hit burns nearby enemies for 30% damage',special:28},
 samurai:{n:"Moon Samurai",t:'Physical',r:'Epic',c:162,d:32,rg:105,cd:0.65,col:'#f0abfc',g:[.05,.004,.012],ability:'Moon Slash: every 3rd attack cleaves for 25% damage',special:29},
 tinker:{n:"Clockwork Tinker",t:'Ranged',r:'Epic',c:171,d:35,rg:117,cd:0.78,col:'#fdba74',g:[.05,.004,.012],ability:'Gear Burst: every 4th attack hits a second target for 30% damage',special:30},
 phoenix:{n:"Phoenix Herald",t:'Magic',r:'Legendary',c:235,d:71,rg:149,cd:1.06,col:'#c4b5fd',g:[.05,.004,.012],ability:'Rebirth Flames: every 4th hit ignites nearby enemies for 50% damage',special:31},
 titan:{n:"Titan Breaker",t:'Physical',r:'Legendary',c:244,d:74,rg:161,cd:1.19,col:'#a3e635',g:[.05,.004,.012],ability:'Earthquake: every 4th attack shakes nearby enemies for 45% damage and a 0.5s stun',special:32},
 celestial:{n:"Celestial Archer",t:'Ranged',r:'Legendary',c:253,d:77,rg:125,cd:0.8,col:'#fb923c',g:[.05,.004,.012],ability:'Meteor Arrows: every 3rd attack splashes 45% damage',special:33},
 void:{n:"Void Reaper",t:'True',r:'Legendary',c:262,d:80,rg:137,cd:0.93,col:'#67e8f9',g:[.05,.004,.012],ability:'Void Siphon: every 4th attack deals 60% bonus damage',special:34},
 leviathan:{n:"Leviathan Sage",t:'Magic',r:'Legendary',c:271,d:83,rg:149,cd:1.06,col:'#fda4af',g:[.05,.004,.012],ability:'Tidal Wave: every 4th attack damages nearby enemies for 45% and slows them for 1.5s',special:35},
 paladin:{n:"Dawn Paladin",t:'Physical',r:'Legendary',c:235,d:65,rg:161,cd:1.19,col:'#86efac',g:[.05,.004,.012],ability:'Holy Judgment: every 4th hit deals 65% extra damage',special:36},
 chronos:{n:"Time Weaver",t:'Magic',r:'Legendary',c:244,d:68,rg:125,cd:0.8,col:'#fbbf24',g:[.05,.004,.012],ability:'Time Lock: every 4th hit briefly freezes its target for 0.75s',special:37},
 seraph:{n:"Seraph Sentinel",t:'True',r:'Legendary',c:253,d:71,rg:137,cd:0.93,col:'#93c5fd',g:[.05,.004,.012],ability:'Radiant Chain: every 3rd attack chains 45% damage to another enemy',special:38},
 cosmos:{n:"Cosmos Sovereign",t:'Magic',r:'Mythic',c:407,d:114,rg:169,cd:1.16,col:'#f0abfc',g:[.05,.004,.012],ability:"supernova",special:39},
 abyss:{n:"Abyss Monarch",t:'True',r:'Mythic',c:416,d:117,rg:181,cd:1.29,col:'#fdba74',g:[.05,.004,.012],ability:"abyss collapse",special:40},
 worldtree:{n:"Worldtree Avatar",t:'Magic',r:'Mythic',c:380,d:120,rg:145,cd:0.9,col:'#c4b5fd',g:[.05,.004,.012],ability:"ancient roots",special:41},
 dragonlord:{n:"Dragon Emperor",t:'Physical',r:'Mythic',c:389,d:123,rg:157,cd:1.03,col:'#a3e635',g:[.05,.004,.012],ability:"dragonfire",special:42},
 starlord:{n:"Astral Huntress",t:'Ranged',r:'Mythic',c:398,d:105,rg:169,cd:1.16,col:'#fb923c',g:[.05,.004,.012],ability:"Astral ricochet: 4 extra targets (-10% original damage per bounce)",special:43},
 eternity:{n:"Eternity Keeper",t:'True',r:'Mythic',c:407,d:108,rg:181,cd:1.29,col:'#67e8f9',g:[.05,.004,.012],ability:"Eternal Blessing: alternating damage / attack speed aura",special:44},
 lizardscout:{n:'Emerald Lizard Scout',t:'Ranged',r:'Common',c:65,d:13,rg:100,cd:.65,col:'#39d97b',g:[.05,.004,.012],ability:'venom dart',special:45},
 moonling:{n:'Moonling Alien',t:'Magic',r:'Rare',c:98,d:24,rg:112,cd:.85,col:'#8ddcff',g:[.05,.004,.012],ability:'plasma pulse',special:46},
 drake:{n:'Cinder Drake',t:'Physical',r:'Epic',c:170,d:50,rg:115,cd:.9,col:'#ff7849',g:[.05,.004,.012],ability:'Ember Breath: every 4th attack splashes 30% damage',special:47},
 reptileking:{n:'Reptile King',t:'Physical',r:'Legendary',c:255,d:85,rg:140,cd:.95,col:'#b1e35e',g:[.05,.004,.012],ability:'Ancient Venom: every 4th attack splashes 40% damage and slows for 1.5s',special:48},
 xenowarden:{n:'Xeno Warden',t:'True',r:'Mythic',c:400,d:120,rg:170,cd:1.1,col:'#a78bfa',g:[.05,.004,.012],ability:'Triune Wards: places a ward every 2s (max 3). Each lasts 3s and inflicts 5s slow (50% movement speed), or 0.5s stun or freeze.',special:49},
};
const STAGES=[
 {n:'Green Meadow',hp:1,food:'berry',path:[[-20,90],[620,90],[620,230],[180,230],[180,370],[820,370]]},
 {n:'Crystal Canyon',hp:1.6,food:'crystal',path:[[-20,60],[700,60],[700,200],[100,200],[100,340],[700,340],[700,470]]},
 {n:'Ember Peak',hp:2.4,food:'pepper',path:[[-20,225],[150,225],[150,60],[400,60],[400,390],[650,390],[650,225],[820,225]]},
 {n:'Moonlit Marsh',hp:3.1,food:'lotus',bg:'#233e47',road:'#719da2',path:[[-20,70],[190,70],[190,310],[440,310],[440,110],[710,110],[710,470]]},
 {n:'Golden Desert',hp:4,food:'date',bg:'#9a6b35',road:'#e9c78b',path:[[-20,360],[250,360],[250,100],[540,100],[540,340],[820,340]]},
 {n:'Frozen Tundra',hp:5,food:'icefruit',bg:'#426e88',road:'#c3e7f1',path:[[-20,210],[160,210],[160,55],[640,55],[640,390],[320,390],[320,230],[820,230]]},
 {n:'Poison Jungle',hp:6.5,food:'spore',bg:'#24593e',road:'#91b85e',path:[[-20,55],[350,55],[350,170],[100,170],[100,370],[680,370],[680,150],[820,150]]},
 {n:'Volcanic Rift',hp:8,food:'embercore',bg:'#622b30',road:'#e07b48',path:[[-20,390],[130,390],[130,95],[310,95],[310,310],[500,310],[500,65],[700,65],[700,390],[820,390]]},
 {n:'Starlight Nebula',hp:10,food:'starfruit',bg:'#252958',road:'#8880d9',path:[[-20,225],[180,225],[180,65],[610,65],[610,365],[250,365],[250,215],[820,215]]},
 {n:'Ancient Ruins',hp:13,food:'relicseed',bg:'#5b5845',road:'#c5b78d',path:[[-20,80],[600,80],[600,175],[160,175],[160,290],[690,290],[690,395],[820,395]]},
 {n:'Alien Hive',hp:17,food:'xenopod',bg:'#37234f',road:'#a575d4',path:[[-20,365],[200,365],[200,90],[410,90],[410,365],[620,365],[620,90],[820,90]]},
 {n:'Sunken Reef',hp:22,food:'seapearl',bg:'#2c7480',road:'#f1dfae',path:[[-20,60],[300,60],[300,220],[110,220],[110,385],[560,385],[560,170],[700,170],[700,320],[820,320]]}
];

/* ---------- Saving ---------- */
const ITEMS={
 berry:{n:'Meadow Berry',exp:40,map:0},
 crystal:{n:'Crystal Fruit',exp:120,map:1},
 pepper:{n:'Ember Pepper',exp:250,map:2},
 lotus:{n:'Moon Lotus',exp:400,map:3},date:{n:'Sun Date',exp:550,map:4},
 icefruit:{n:'Frost Apple',exp:725,map:5},spore:{n:'Jungle Spore',exp:900,map:6},
 embercore:{n:'Ember Core',exp:1100,map:7},starfruit:{n:'Starfruit',exp:1300,map:8},
 relicseed:{n:'Relic Seed',exp:1500,map:9},xenopod:{n:'Xeno Pod',exp:1750,map:10},seapearl:{n:'Sea Pearl',exp:2000,map:11}
};
const MODES={
 easy:{n:'Easy',hp:.6,mult:1,xp:1},
 medium:{n:'Medium',hp:1,mult:2,xp:1.5},
 hard:{n:'Hard',hp:1.8,mult:4,xp:2.2},
 hell:{n:'Hell',hp:3.2,mult:8,xp:3.5},
 infinite:{n:'Infinite',hp:1,mult:0,xp:1}
};
let curMode='easy';
let raidSelection=0;
const RAID_LEVELS=5;
function raidMaxWave(level){return level===5?30:15;}
function raidScale(level){return Math.pow(1.25,level-1);}
// Dedicated winding raid battlefield. All raid levels share this Duskmoor Castle route;
// future raid maps can provide their own path using the same raidPath hook.
const RAID_MAPS={duskmoor:{n:'Duskmoor Castle',bg:'#251a2e',road:'#75617c',path:[[-20,65],[735,65],[735,140],[95,140],[95,215],[690,215],[690,290],[150,290],[150,365],[810,365]]}};
function battleStage(){return G?.raidLevel?RAID_MAPS.duskmoor:STAGES[G.si];}

// Keep this storage key unchanged across releases so older progress is found.
const KEY='gemGuardiansSave';
const BACKUP_KEY='gemGuardiansSave_backup';
const PRE_IMPORT_KEY=KEY+'_pre_import_recovery';
const SAVE_VERSION=5;
const STARTING_LIVES=10;
function stageStars(lives){return lives>=STARTING_LIVES?3:lives>=Math.ceil(STARTING_LIVES/2)?2:1;}
function stageStarKey(si,mode){return si+':'+mode;}
function stageDifficulty(si){return Math.pow(1.12,si);}
const INDEX_REWARDS={Common:15,Rare:25,Epic:45,Legendary:100,Mythic:250,Secret:500,Exclusive:0};
const TRAITS={
 steady:{n:'Steady',rarity:'Common',d:1.08,rg:1,spd:1,desc:'+8% damage'},
 keen:{n:'Keen Sight',rarity:'Common',d:1,rg:1.12,spd:1,desc:'+12% range'},
 nimble:{n:'Quickstep',rarity:'Uncommon',d:1,rg:1,spd:1.12,desc:'+12% attack speed'},
 fierce:{n:'Ferocious',rarity:'Uncommon',d:1.18,rg:1,spd:1,desc:'+18% damage'},
 hunter:{n:'Eagle Eye',rarity:'Rare',d:1.15,rg:1.18,spd:1,desc:'+15% damage, +18% range'},
 tempest:{n:'Tempest',rarity:'Rare',d:1.1,rg:1,spd:1.28,desc:'+10% damage, +28% attack speed'},
 monarch:{n:'War Monarch',rarity:'Legendary',d:1.45,rg:1,spd:1.1,desc:'+45% damage, +10% attack speed'},
 horizon:{n:'Far Horizon',rarity:'Legendary',d:1.2,rg:1.4,spd:1.15,desc:'+20% damage, +40% range, +15% attack speed'},
 astral:{n:'Astral Overlord',rarity:'Mythic',d:2.1,rg:1.25,spd:1.25,desc:'+110% damage, +25% range, +25% attack speed'},
 singularity:{n:'Singularity',rarity:'Mythic',d:1.7,rg:1.6,spd:1.55,desc:'+70% damage, +60% range, +55% attack speed'},
 cosmic:{n:'Cosmic Ascendant',rarity:'Mythic',d:2.5,rg:1.1,spd:1.1,desc:'+150% damage, +10% range, +10% attack speed'},
 midas:{n:'Midas',rarity:'Mythic',d:1,rg:1,spd:1,desc:'Golden shimmering aura. +50% coins from kills and money production, plus +25% per boost after the first. Placement and boost costs -25%.'}
};
const TRAIT_RATES=[['Common',.40],['Uncommon',.30],['Rare',.20],['Legendary',.09],['Mythic',.01]];
function pickTrait(forceMythic=false){let rarity='Mythic';if(!forceMythic){let r=Math.random();for(const [name,rate] of TRAIT_RATES){r-=rate;if(r<0){rarity=name;break}}}const pool=Object.keys(TRAITS).filter(k=>TRAITS[k].rarity===rarity);return pool[Math.floor(Math.random()*pool.length)];}
function unitLabel(u){return (u.nickname?u.nickname+' · ':'')+UNITS[u.id].n+' #'+u.uid;}
const UNIT_SORT_OPTIONS=[['rarityDesc','Highest rank → lowest'],['rarityAsc','Lowest rank → highest'],['damageDesc','Highest damage → lowest'],['damageAsc','Lowest damage → highest'],['costAsc','Cheapest → most expensive'],['costDesc','Most expensive → cheapest']];
const UNIT_RANKS={Common:0,Rare:1,Epic:2,Legendary:3,Mythic:4,Secret:5,Exclusive:6};
const unitSortSettings={collection:'rarityDesc',traitUnitPicker:'rarityDesc',feedPicker:'rarityDesc'};
function sortedOwnedUnits(units,mode){return [...units].sort((a,b)=>{const f=Number(!!b.favorite)-Number(!!a.favorite);if(f)return f;const A=UNITS[a.id],B=UNITS[b.id];let n=0;switch(mode){case 'rarityAsc':n=(UNIT_RANKS[A.r]??0)-(UNIT_RANKS[B.r]??0);break;case 'damageDesc':n=stats(b).d-stats(a).d;break;case 'damageAsc':n=stats(a).d-stats(b).d;break;case 'costAsc':n=A.c-B.c;break;case 'costDesc':n=B.c-A.c;break;default:n=(UNIT_RANKS[B.r]??0)-(UNIT_RANKS[A.r]??0);}return n||A.n.localeCompare(B.n)||a.uid-b.uid;});}
function setupUnitSort(id,mode,onUpdate){const el=document.getElementById(id);if(!el)return;const chosen=unitSortSettings[mode]||'rarityDesc';if(!el.options.length)el.innerHTML=UNIT_SORT_OPTIONS.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('');el.value=chosen;el.onchange=()=>{unitSortSettings[mode]=el.value;onUpdate();};}
function toggleUnitFavorite(uid){const u=S.units.find(x=>x.uid===uid);if(!u)return;u.favorite=!u.favorite;save(false);renderAll();}
function renderUnitPicker(id,units,selected,onSelect){const root=document.getElementById(id);if(!root)return;const ordered=sortedOwnedUnits(units,unitSortSettings[id]||'rarityDesc');root.innerHTML=ordered.map(u=>'<div class="unit-choice'+(String(u.uid)===String(selected)?' selected':'')+'" data-uid="'+u.uid+'"><button type="button" class="unit-fav'+(u.favorite?' active':'')+'" data-fav="'+u.uid+'" title="'+(u.favorite?'Remove favorite':'Add to favorites')+'" aria-label="Toggle favorite">'+(u.favorite?'♥':'♡')+'</button><canvas class="ico" width="72" height="64" data-id="'+u.id+'" data-trait="'+(u.trait||'')+'"></canvas><b class="'+UNITS[u.id].r+'"></b><small>Lv '+u.lv+(u.locked?' 🔒':'')+'</small></div>').join('');root.querySelectorAll('.unit-choice').forEach(b=>{const u=ordered.find(u=>u.uid===+b.dataset.uid);b.querySelector('b').textContent=unitLabel(u);b.onclick=()=>onSelect(String(u.uid));b.querySelector('[data-fav]').onclick=e=>{e.stopPropagation();toggleUnitFavorite(u.uid);};});paintIcons();}
function renderTraits(){setupUnitSort('traitUnitPickerSort','traitUnitPicker',renderTraits);const sel=$('#traitUnit');if(!sel)return;const old=sel.value;sel.innerHTML=S.units.map(u=>`<option value="${u.uid}">${unitLabel(u)} (Lv ${u.lv})</option>`).join('');if(S.units.some(u=>String(u.uid)===old))sel.value=old;renderUnitPicker("traitUnitPicker",S.units,sel.value,uid=>{sel.value=uid;renderTraits();});const u=S.units.find(u=>String(u.uid)===sel.value);const t=u&&TRAITS[u.trait];$('#traitCurrent').textContent=u?(t?`${t.n} (${t.rarity}): ${t.desc}${MYTHIC_VISUALS[u.trait]?' • Unique visual: '+MYTHIC_VISUALS[u.trait].name:''}`:'No trait yet — reroll to obtain one'):'Summon a unit first.';$('#traitPity').textContent=`Mythic trait pity: ${S.traitPity}/150 rerolls (guaranteed at 150)`;updateTraitRerollButton();$('#traitList').innerHTML=Object.values(TRAITS).map(t=>`<div class="card"><b class="${t.rarity}">${t.n}</b><br><small>${t.rarity}</small><br>${t.desc}${MYTHIC_VISUALS[Object.keys(TRAITS).find(k=>TRAITS[k]===t)]?'<br>✦ Unique animated effect':''}</div>`).join('');}
// A high-rarity trait locks further rerolls for three seconds, even after changing units.
const HIGH_TRAIT_REROLL_DELAY_MS=3000;
function traitRerollSecondsLeft(){return Math.max(0,Math.ceil(((S.traitRollLockUntil||0)-Date.now())/1000));}
function updateTraitRerollButton(){
  const btn=document.getElementById('traitRoll');if(!btn)return;
  const left=traitRerollSecondsLeft();
  const selected=S.units.some(u=>String(u.uid)===document.getElementById('traitUnit').value);
  btn.disabled=left>0||!selected||(S.traitRerolls<=0&&S.gems<30);
  btn.textContent=left>0?'Protected trait — wait '+left+'s':(S.traitRerolls>0?'Reroll trait (free: '+S.traitRerolls+' left)':'Reroll trait (30 gems)');
}
setInterval(updateTraitRerollButton,200);
const DEFAULT_SETTINGS={autoRestart:false,attackFx:true,autoSell:false};
let S={gems:500,units:[],cleared:0,nid:1,bag:{},settings:{...DEFAULT_SETTINGS},discovered:[],indexClaimed:[],pityLegendary:0,pityMythic:0,pitySecret:0,traitPity:0,traitRerolls:25,autoTraitEnabled:false,autoTraitTarget:"",autoTraitUnitUid:null,autoSellRarities:[],unitRarityVersion:2,playerLevel:1,playerExp:0,playerName:"Player",playerAvatar:"",playerRewards:[],stageStars:{},equipped:[],afkPendingGems:0,afkPendingRerolls:0,raidCleared:0};
let lastSaved='';
let saveTransitionPending=false; // Prevent pagehide/autosave from overwriting an imported or restored save.

function clean(d){
  if(!d||typeof d!=='object'||Array.isArray(d)) throw Error('Invalid save');
  // Accept both legacy unversioned saves and versioned save envelopes.
  if(d.saveVersion&&d.saveVersion>SAVE_VERSION) throw Error('Save from a newer game version');
  if(d.data&&typeof d.data==='object') d=d.data;
  const o={...d,gems:Math.max(0,Math.floor(+d.gems||0)),units:[],cleared:Math.min(STAGES.length,Math.max(0,Math.floor(+d.cleared||0))),nid:1,bag:{...(d.bag||{})},settings:Object.fromEntries(Object.keys(DEFAULT_SETTINGS).map(k=>[k,typeof d.settings?.[k]==='boolean'?d.settings[k]:DEFAULT_SETTINGS[k]]))};
  o.stageStars={};
  if(d.stageStars&&typeof d.stageStars==='object'&&!Array.isArray(d.stageStars)){
    for(const [k,v] of Object.entries(d.stageStars)){
      const [idx,mode]=k.split(':');
      if(/^\d+$/.test(idx)&&+idx<STAGES.length&&Object.hasOwn(MODES,mode)&&mode!=='infinite'&&Number.isInteger(+v)&&+v>=1&&+v<=3)o.stageStars[k]=+v;
    }
  }
  // Units keep their saved uid when it is a valid, unique positive integer. Only missing,
  // invalid or duplicate uids receive new numbers, so references stay stable across reloads.
  const uidMap=new Map(),pendingUid=[];
  const normUnit=(u,uid)=>({...u,uid,id:u.id,lv:Math.min(100,Math.max(1,Math.floor(+u.lv||1))),xp:Math.max(0,Math.floor(+u.xp||0)),st:Math.min(5,Math.max(0,Math.floor(+u.st||0)))});
  const add=(u)=>{if(!u||!UNITS[u.id])return;const old=Number(u.uid);if(Number.isSafeInteger(old)&&old>0&&old<1e9&&!uidMap.has(old)){uidMap.set(old,old);o.units.push(normUnit(u,old));}else{pendingUid.push([o.units.length,u]);o.units.push(null);}};
  if(Array.isArray(d.units)) d.units.forEach(u=>add(u));
  else if(d.units) for(const k0 in d.units){const k=MIG[k0]||k0;for(let i=0;i<Math.min(500,Math.floor(d.units[k0])||0);i++)add({id:k,lv:1,xp:0,st:0})}
  {const savedNid=Number(d.nid);o.nid=Math.max(o.units.reduce((m,u)=>u?Math.max(m,u.uid):m,0)+1,Number.isSafeInteger(savedNid)&&savedNid>0&&savedNid<1e9?savedNid:1);}
  for(const [slot,u] of pendingUid)o.units[slot]=normUnit(u,o.nid++);
  for(const k in ITEMS) if(o.bag[k]!=null) o.bag[k]=Math.max(0,Math.floor(+o.bag[k]||0));
  // Older saves did not track discoveries; owned units count as discovered.
  const valid=ids=>Array.isArray(ids)?ids.filter(id=>Object.prototype.hasOwnProperty.call(UNITS,id)):[];
  o.discovered=[...new Set([...valid(d.discovered),...o.units.map(u=>u.id)])];
  o.discoveredItems=[...new Set([...(Array.isArray(d.discoveredItems)?d.discoveredItems:[]),...Object.keys(o.bag).filter(k=>o.bag[k]>0)].filter(k=>ITEMS[k]))];
  o.indexClaimed=[...new Set(valid(d.indexClaimed))].filter(id=>o.discovered.includes(id));
  o.pityLegendary=Math.min(99,Math.max(0,Math.floor(+d.pityLegendary||0)));
  o.pityMythic=Math.min(499,Math.max(0,Math.floor(+d.pityMythic||0)));
  o.pitySecret=Math.min(2499,Math.max(0,Math.floor(+d.pitySecret||0)));
  o.traitPity=Math.min(149,Math.max(0,Math.floor(+d.traitPity||0)));
  o.traitRerolls=Math.max(0,Math.floor(Number.isFinite(+d.traitRerolls)?+d.traitRerolls:25));
  o.autoTraitEnabled=d.autoTraitEnabled===true;
  o.autoTraitTarget=typeof d.autoTraitTarget==='string'&&Object.hasOwn(TRAITS,d.autoTraitTarget)?d.autoTraitTarget:'';
  o.autoTraitUnitUid=d.autoTraitUnitUid==null?null:(uidMap.get(Number(d.autoTraitUnitUid))??null);
  o.traitRollLockUntil=Math.max(0,Math.min(Date.now()+HIGH_TRAIT_REROLL_DELAY_MS,Number(d.traitRollLockUntil)||0));
  o.afkPendingGems=Math.max(0,Math.floor(+d.afkPendingGems||0));
  o.afkPendingRerolls=Math.max(0,Math.floor(+d.afkPendingRerolls||0));
  o.raidCleared=Math.max(0,Math.min(5,Math.floor(+d.raidCleared||0)));
  // Enemy Index log: per-enemy encounter/defeat counts. Enemies from maps cleared before tracking existed are marked as known.
  {const keys=['normal','tank','runner','elite','shield','flyer','healer','splitter','gloopling','dasher','berserk','burrower','boss'],src=d.enemyLog&&typeof d.enemyLog==='object'?d.enemyLog:null;o.enemyLog={};
   for(const k of keys){const r=src&&src[k];if(r&&typeof r==='object'){const e={s:Math.max(0,Math.floor(+r.s||0)),d:Math.max(0,Math.floor(+r.d||0))};if(r.k)e.k=1;if(e.s||e.d||e.k)o.enemyLog[k]=e;}}
   if(!src){const c=Math.floor(+d.cleared||0),raid=Math.floor(+d.raidCleared||0)>0;const back=[[1,'normal'],[1,'boss'],[2,'tank'],[3,'runner'],[4,'elite']];for(const [m,k] of back)if(c>=m||raid)o.enemyLog[k]={s:0,d:0,k:1};}}
  {const num=v=>Math.max(0,Math.floor(+v||0)),keys=['kills','bossKills','wins','winsHard','summons','rerolls','feeds','placed','waves','questsDone'];
   const st=d.stats&&typeof d.stats==='object'?d.stats:{};o.stats={};for(const k of keys)o.stats[k]=num(st[k]);
   const dl=d.daily&&typeof d.daily==='object'?d.daily:null;
   o.daily=dl&&typeof dl.day==='string'?{day:dl.day.slice(0,10),base:Object.fromEntries(keys.map(k=>[k,num(dl.base&&dl.base[k])])),claimed:Array.isArray(dl.claimed)?dl.claimed.filter(x=>typeof x==='string').slice(0,6):[],bonus:!!dl.bonus}:null;
   const lg=d.login&&typeof d.login==='object'?d.login:{};o.login={last:typeof lg.last==='string'?lg.last.slice(0,10):'',day:Math.min(7,num(lg.day))};
   const ac=d.ach&&typeof d.ach==='object'?d.ach:{};o.ach={};for(const [k,v] of Object.entries(ac))if(/^[a-z]+$/.test(k))o.ach[k]=Math.min(10,num(v));}
  o.unitRarityVersion=2;
  o.autoSellRarities=Array.isArray(d.autoSellRarities)?[...new Set(d.autoSellRarities.map(r=>d.unitRarityVersion===2?r:({Common:'Rare',Uncommon:'Common',Rare:'Epic'}[r]||r)).filter(r=>['Common','Rare','Epic','Legendary','Mythic','Secret','Exclusive'].includes(r)))]:[];
  o.playerLevel=Math.max(1,Math.min(100,Math.floor(+d.playerLevel||1)));
  o.playerExp=o.playerLevel>=100?0:Math.min(playerExpNeeded(o.playerLevel)-1,Math.max(0,Math.floor(+d.playerExp||0)));
  o.playerName=typeof d.playerName==='string'?(d.playerName.trim().slice(0,24)||'Player'):'Player';
  o.playerAvatar=typeof d.playerAvatar==='string'&&o.discovered.includes(d.playerAvatar)?d.playerAvatar:'';
  o.playerRewards=[...new Set((Array.isArray(d.playerRewards)?d.playerRewards:[]).map(Number).filter(n=>Number.isInteger(n)&&n>=5&&n%5===0&&n<=o.playerLevel))];
  const ownedIds=new Set(o.units.map(u=>u.uid));
  o.equipped=Array.isArray(d.equipped)?[...new Set(d.equipped.map(uid=>uidMap.get(Number(uid))).filter(uid=>ownedIds.has(uid)))].slice(0,o.playerLevel>=10?6:o.playerLevel>=5?5:4):o.units.slice(0,o.playerLevel>=10?6:o.playerLevel>=5?5:4).map(u=>u.uid);
  o.units.forEach(u=>{if(!TRAITS[u.trait])u.trait='';u.nickname=typeof u.nickname==='string'?u.nickname.trim().slice(0,24):'';u.locked=u.locked===true;u.favorite=u.favorite===true;});
  return o;
}
function grantStarterBarter(){
  // Only brand-new progress receives this free Exclusive unit.
  const starter={uid:S.nid++,id:'barter',lv:1,xp:0,st:0,trait:'',nickname:'',locked:false};
  S.units.push(starter);
  S.discovered.push('barter');
  S.equipped.push(starter.uid);
}
function load(){
  try{
    const current=localStorage.getItem(KEY);
    const backup=localStorage.getItem(BACKUP_KEY);
    for(const [index,raw] of [current,backup].entries()){
      if(!raw)continue;
      try{
        const recovered=clean(JSON.parse(raw));
        const normalized=JSON.stringify(recovered);
        if(index===1){
          // A valid fallback must replace the broken primary; otherwise the
          // next reload will keep encountering the corrupted primary save.
          localStorage.setItem(KEY,normalized);
        }
        S=recovered;
        lastSaved=normalized;
        return;
      }catch(e){console.warn('Cannot read saved progress:',e)}
    }
    if(current||backup) alert('Saved progress could not be loaded. The browser save and local backup could not be read.');
    else grantStarterBarter();
  }catch(e){console.warn('Browser storage unavailable:',e);if(!S.units.length)grantStarterBarter()}
}
function save(manual){
  if(saveTransitionPending)return true;
  try{
    const raw=JSON.stringify(S);
    if(raw!==lastSaved){
      const old=localStorage.getItem(KEY);
      // Preserve the last valid save before replacing it, including old versions.
      if(old&&old!==raw){
        try{clean(JSON.parse(old));localStorage.setItem(BACKUP_KEY,old)}catch(e){}
      }
      localStorage.setItem(KEY,raw);
      lastSaved=raw;
    }
    $('#st').textContent='Saved at '+new Date().toLocaleTimeString();
    if(manual) toast('Game saved');
    return true;
  }catch(e){toast('Unable to save: browser storage is blocked or full. Check browser storage settings.');return false}
}
function syncSettings(){document.querySelectorAll('[data-setting]').forEach(el=>el.checked=S.settings[el.dataset.setting]);}
const GG_EDITION='public';
// GAME_VERSION is defined in index.html (the update check reads it there).
// Save portability: never change the existing localStorage keys. Import validates before replacement.
function buildSaveExport(){
  if(!save(false))throw Error('Browser storage is unavailable or full; export cancelled to avoid an unreliable backup');
  const payload={game:'Gem Guardians',edition:GG_EDITION,saveVersion:SAVE_VERSION,gameVersion:GAME_VERSION,exportedAt:new Date().toISOString(),data:S};
  return {text:JSON.stringify(payload,null,2),name:'gem-guardians-'+GG_EDITION+'-backup-'+new Date().toISOString().slice(0,10)+'.json'};
}
function downloadSaveExport(label){
  const {text,name}=buildSaveExport();
  const blob=new Blob([text],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=label?name.replace('-backup-','-'+label+'-backup-'):name;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
$('#exportSave').onclick=()=>{
  try{downloadSaveExport();toast('Save backup downloaded')}
  catch(e){console.error('Export failed',e);toast('Export failed: '+e.message)}
};
// Share sheet fallback for installed apps where blob downloads are ignored (notably iOS).
$('#shareSave').onclick=async()=>{
  let exp;try{exp=buildSaveExport()}catch(e){console.error('Export failed',e);return toast('Export failed: '+e.message)}
  try{
    const file=new File([exp.text],exp.name,{type:'application/json'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Gem Guardians save backup'});toast('Save backup shared');return}
    if(navigator.share){await navigator.share({title:'Gem Guardians save backup',text:exp.text});toast('Save text shared');return}
    toast('Sharing is not supported in this browser. Use Copy Save Text instead.');
  }catch(e){if(e&&e.name==='AbortError')return;console.warn('Share failed',e);toast('Share failed. Use Copy Save Text instead.')}
};
async function copyTextToClipboard(text){
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}}catch(e){console.warn('Clipboard API failed',e)}
  const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
  let ok=false;try{ok=document.execCommand('copy')}catch(e){}
  ta.remove();return ok;
}
$('#copySave').onclick=async()=>{
  let exp;try{exp=buildSaveExport()}catch(e){console.error('Export failed',e);return toast('Export failed: '+e.message)}
  if(await copyTextToClipboard(exp.text))toast('Save text copied. Paste it into Notes or a message to keep it safe.');
  else{$('#pasteSaveBox').classList.remove('hide');const ta=$('#pasteSaveText');ta.value=exp.text;ta.focus();ta.select();toast('Copy was blocked. The save text is selected below; copy it manually.');}
};
// One validated import path for files and pasted text.
async function importSaveText(rawText){
  try{
    const text=String(rawText||'').trim();
    if(text.length>5*1024*1024)throw Error('Backup is larger than 5 MB');
    let parsed;
    try{parsed=JSON.parse(text)}catch(e){throw Error('The backup text is not valid. Make sure the whole save was copied.')}
    if(!parsed||typeof parsed!=='object'||parsed.game!=='Gem Guardians'||parsed.edition!==GG_EDITION)throw Error('This is not a '+GG_EDITION+' Edition backup');
    if(!parsed.data||typeof parsed.data!=='object'||Array.isArray(parsed.data))throw Error('Missing save data');
    if(!Array.isArray(parsed.data.units)||!Array.isArray(parsed.data.discovered))throw Error('Incomplete save data');
    if(!Number.isFinite(Number(parsed.data.gems))||!Number.isFinite(Number(parsed.data.playerLevel)))throw Error('Invalid player progress fields');
    if(parsed.data.units.some(u=>!u||typeof u!=='object'||!UNITS[u.id]))throw Error('Backup contains invalid units');
    if(Number(parsed.saveVersion)>SAVE_VERSION)throw Error('Backup was created by a newer game version');
    const restored=clean(parsed.data);
    if(!confirm('Replace your current '+GG_EDITION+' Edition progress with this backup? This cannot be undone unless you exported your current save.'))return false;
    // Keep a dedicated recovery snapshot that routine autosaves never touch.
    // Preserve the current in-memory state too, including unsaved changes.
    const previous=JSON.stringify(clean(S));
    const imported=JSON.stringify(restored);
    localStorage.setItem(PRE_IMPORT_KEY,previous);
    try{localStorage.setItem(KEY,imported)}catch(writeError){
      // If writing the imported save fails, keep the original save intact.
      try{localStorage.setItem(KEY,previous)}catch(rollbackError){console.error('Save rollback failed',rollbackError)}
      throw writeError;
    }
    S=restored;
    lastSaved=imported;
    saveTransitionPending=true;
    alert('Save imported successfully. The game will reload to apply it.');location.reload();
    return true;
  }catch(err){console.error('Import failed',err);alert('Could not import backup: '+err.message);return false}
}
$('#importSave').onclick=()=>$('#importSaveFile').click();
$('#importSaveFile').onchange=async e=>{
  const input=e.currentTarget,file=input.files?.[0];if(!file)return;
  try{
    if(file.size>5*1024*1024)throw Error('Backup is larger than 5 MB');
    await importSaveText(await file.text());
  }catch(err){console.error('Import failed',err);alert('Could not import backup: '+err.message)}
  finally{input.value=''}
};
$('#togglePasteSave').onclick=()=>{const box=$('#pasteSaveBox');box.classList.toggle('hide');if(!box.classList.contains('hide'))$('#pasteSaveText').focus();};
$('#importPasteSave').onclick=()=>{const t=$('#pasteSaveText').value;if(!t.trim())return toast('Paste your save text first');importSaveText(t);};
$('#restorePreImport').onclick=()=>{
  try{
    const raw=localStorage.getItem(PRE_IMPORT_KEY);
    if(!raw){alert('No pre-import recovery save exists yet. Import a backup first.');return}
    const recovered=clean(JSON.parse(raw));
    if(!confirm('Restore your progress from before the last successful import? Your current progress will be replaced. Export your current save first if you want to keep it.'))return;
    // Save the current state as a downloadable backup before restoring.
    // Do not replace the protected snapshot until the restore succeeds.
    const current=JSON.stringify(clean(S));
    const restored=JSON.stringify(recovered);
    localStorage.setItem(KEY,restored);
    S=recovered;
    lastSaved=restored;
    saveTransitionPending=true;
    // Keep the prior current state available through the standard fallback slot.
    try{localStorage.setItem(BACKUP_KEY,current)}catch(e){console.warn('Unable to store fallback backup',e)}
    alert('Pre-import progress restored. The game will reload now.');location.reload();
  }catch(err){console.error('Pre-import recovery failed',err);alert('Could not restore recovery save: '+err.message)}
};
$('#bSettings').onclick=()=>{syncSettings();$('#settingsModal').classList.remove('hide')};
$('#bQol').onclick=()=>$('#qolModal').classList.remove('hide');
$('#bInstallGuide').onclick=()=>$('#installGuideModal').classList.remove('hide');
$('#closeInstallGuide').onclick=()=>$('#installGuideModal').classList.add('hide');
$('#installGuideModal').onclick=e=>{if(e.target.id==='installGuideModal')e.currentTarget.classList.add('hide')};

$('#closeQol').onclick=()=>$('#qolModal').classList.add('hide');
$('#qolModal').onclick=e=>{if(e.target.id==='qolModal')e.currentTarget.classList.add('hide')};

$('#closeSettings').onclick=()=>$('#settingsModal').classList.add('hide');
$('#settingsModal').onclick=e=>{if(e.target.id==='settingsModal')e.currentTarget.classList.add('hide')};
document.querySelectorAll('[data-setting]').forEach(el=>el.onchange=()=>{S.settings[el.dataset.setting]=el.checked;save(false);});
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2200)}
setInterval(()=>save(false),5000);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save(false)});
addEventListener('beforeunload',()=>save(false));

$('#bSave').onclick=()=>save(true);
$('#bRes').onclick=()=>{
  // Typed confirmation plus an automatic backup download: one tap can no longer erase progress.
  const typed=prompt('This erases ALL '+GG_EDITION+' Edition progress, including the local backup and the pre-import recovery save.\n\nA backup file will be downloaded first.\n\nType RESET to confirm:');
  if(typed===null)return;
  if(typed.trim().toUpperCase()!=='RESET')return toast('Reset cancelled. You must type RESET to confirm.');
  try{downloadSaveExport('pre-reset')}
  catch(e){if(!confirm('The automatic backup could not be created ('+e.message+'). Reset anyway? Your progress cannot be recovered.'))return;}
  resetGameProgress();
};
function resetGameProgress(){leaveAfk();
  // A confirmed reset starts a completely new game, including settings and pity.
  S={gems:500,units:[],cleared:0,nid:1,bag:{},settings:{...DEFAULT_SETTINGS},discovered:[],discoveredItems:[],indexClaimed:[],pityLegendary:0,pityMythic:0,pitySecret:0,traitPity:0,traitRerolls:25,autoTraitEnabled:false,autoTraitTarget:"",autoTraitUnitUid:null,autoSellRarities:[],unitRarityVersion:2,playerLevel:1,playerExp:0,playerName:"Player",playerAvatar:"",playerRewards:[],stageStars:{},equipped:[],afkPendingGems:0,afkPendingRerolls:0,raidCleared:0};
  grantStarterBarter();afkPendingUI();
  G=null;
  lastSaved='';
  try{
    localStorage.removeItem(KEY);
    localStorage.removeItem(BACKUP_KEY);
    localStorage.removeItem(PRE_IMPORT_KEY);
  }catch(e){}
  save(false);
  // Do not retain a pre-reset backup, which could restore erased progress.
  try{localStorage.removeItem(BACKUP_KEY)}catch(e){}
  showArena(false);
  $('#settingsModal').classList.add('hide');
  gemUI();renderAll();syncSettings();
  toast('New game: Barter (Exclusive) equipped, 500 gems and 25 trait rerolls!');
}

/* Clear distinction between earned (gold) and unearned (gray) prestige stars. */

/* ---------- Levels, stats, prestige ---------- */
// 2026.10.11.12: exact EXP per level; each prestige star adds +50% to every level's requirement.
// 2026.10.11.13: rarer units need more EXP per level (stacks with the prestige-star factor).
const RARITY_XP={Common:1,Rare:1.15,Epic:1.35,Exclusive:1.35,Legendary:1.6,Mythic:1.9,Secret:2.3};
const need=(lv,st=0,id)=>Math.round((60+12*lv+.4*lv*lv)*(1+.5*(st||0))*(id&&UNITS[id]?RARITY_XP[UNITS[id].r]||1:1));
function stats(i){
  const U=UNITS[i.id],g=U.g,l=i.lv-1,s=i.st,tr=TRAITS[i.trait]||{d:1,rg:1,spd:1};
  return {d:U.d*(1+l*g[0])*(1+.5*s)*tr.d,rg:U.rg*(1+l*g[1])*(1+.04*s)*tr.rg,cd:Math.max(.1,U.cd/(1+l*g[2])/(1+.06*s)/tr.spd)};
}
function addXp(i,x){
  if(i.lv>=100) return;
  i.xp+=x;
  i.xp=Math.floor(i.xp);while(i.lv<100&&i.xp>=need(i.lv,i.st,i.id)){i.xp-=need(i.lv,i.st,i.id);i.lv++}
  if(i.lv>=100){i.lv=100;i.xp=0}
}
// 2026.10.11.12: Common and Rare units are starter units and cannot prestige.
// 2026.10.11.14: Common units can prestige to 1 star and Rare units to 2 stars; Epic and rarer to 5.
function maxPrestigeStars(id){const r=UNITS[id]&&UNITS[id].r;return r==='Common'?1:r==='Rare'?2:5;}
function canPrestigeRarity(id){return maxPrestigeStars(id)>0;}
function prestige(uid){
  const i=S.units.find(x=>x.uid===uid);
  if(!i)return toast('Unit not found');
  if(i.st>=maxPrestigeStars(i.id))return toast(UNITS[i.id].n+' is '+(/^[AEIOU]/.test(UNITS[i.id].r)?'an ':'a ')+UNITS[i.id].r+' unit and already has its maximum of '+maxPrestigeStars(i.id)+' prestige star'+(maxPrestigeStars(i.id)>1?'s':'')+'.');
  if(i.st>=5)return toast('This unit already has the maximum 5 prestige stars');
  if(i.lv<100)return toast('Reach unit level 100 before prestiging');
  if(!confirm('Prestige '+UNITS[i.id].n+'? It returns to level 1 and gains a star ('+(i.st+1)+'/'+maxPrestigeStars(i.id)+'), which makes it stronger at every level.\n\nEvery star: +50% damage, +4% range, +6% attack speed.\nLeveling up again needs 50% more EXP for each star.\n3★ perk: Awakened Strike (every 5th attack +50% damage).\n5★ perk: Ascended Strike (every 5th attack +100% damage and a shockwave).'+(i.id==='barter'?' Each star permanently increases this Barter’s coin generation by 10%.':''))) return;
  i.st++;i.lv=1;i.xp=0;save(false);renderAll();toast(UNITS[i.id].n+' now has '+i.st+' star'+(i.st>1?'s':''));
}

/* ---------- Modes, bag, selling ---------- */
function renderRaids(){
 const el=$('#raidLevels');if(!el)return;
 const access=S.playerLevel>=25;
 $('#raidLevelRequirement').textContent=access?'🔓 Raids unlocked — Player Level '+S.playerLevel:'🔒 Raids unlock at Player Level 25 · Current Level '+S.playerLevel;
 el.innerHTML=Array.from({length:RAID_LEVELS},(_,i)=>{
   const lv=i+1,cleared=Number(S.raidCleared)||0,locked=S.playerLevel<25||lv>cleared+1,complete=lv<=cleared;
   return `<button class="alt" data-raid="${lv}" ${locked?'disabled':''}>${complete?'✓ ':locked?'🔒 ':''}Level ${lv} · ${raidMaxWave(lv)} waves · ×${raidScale(lv).toFixed(2)}</button>`;
 }).join('');
 el.querySelectorAll('button[data-raid]').forEach(btn=>btn.onclick=()=>{
   const lv=Number(btn.dataset.raid);
   if(S.playerLevel<25)return toast('Raids unlock at Player Level 25.');
   if(lv>S.raidCleared+1)return toast('Clear the previous raid level first.');
   document.querySelector('button[data-tab="battle"]')?.click();
   startBattle(0,'hell',lv);
 });
}
function renderModes(){
 renderRaids();
  $('#modes').innerHTML=Object.keys(MODES).map(k=>'<button class="alt'+(k===curMode?' on':'')+'" data-m="'+k+'">'+MODES[k].n+' mode</button>').join('');
  $('#modes').querySelectorAll('button').forEach(b=>b.onclick=()=>{curMode=b.dataset.m;renderAll()});
  const M=MODES[curMode];
  $('#modeInfo').textContent=curMode==='infinite'
    ?'Endless waves that keep getting stronger. Every wave you clear pays 6 gems (31 on each 10th wave) plus food from that map as you go. Player EXP per wave: 1 on waves 1–10, 2 on waves 11–20, 3 on waves 21–30, and +1 for every further 10 waves.'
    :'Clear all 15 waves to earn '+25*M.mult+' gems and '+Math.ceil(2*M.mult)+' of that map\u2019s food. Enemy health x'+M.hp+', unit EXP x'+M.xp+'.';
}
function infReward(w){
  const fd=STAGES[G.si].food,g=6+(w%10===0?25:0),f=(w%2===0?1:0)+(w%10===0?3:0);
  const playerXp=Math.floor((w-1)/10)+1;
  S.gems+=g;if(f){S.bag[fd]=(S.bag[fd]||0)+f;discoverItem(fd);}G.ig+=g;G.fg+=f;G.infinitePlayerXp=(G.infinitePlayerXp||0)+playerXp;gainPlayerExp(playerXp);save(false);gemUI();
  toast('Wave '+w+' cleared: +'+g+' gems, +'+playerXp+' player EXP'+(f?' and +'+f+' '+ITEMS[fd].n:''));
}
// Centralized fixed gem resale values; levels and prestige have no effect.
const UNIT_SELL_BASE={Common:5,Rare:10,Epic:15,Legendary:20,Mythic:25,Secret:35,Exclusive:40};
const UNIT_SELL_NEXT={Common:'Rare',Rare:'Epic',Epic:'Legendary',Legendary:'Mythic',Mythic:'Secret',Secret:'Exclusive'};
function sellVal(i){
  // Fixed resale value determined only by rarity; leveling and prestige never change it.
  const rarity=UNITS[i.id].r,base=UNIT_SELL_BASE[rarity];
  if(!Number.isFinite(base))throw new Error('Unknown unit rarity: '+rarity);
  return base;
}
function sell(uid){
  const i=S.units.find(x=>x.uid===uid);if(!i)return;
  if(G&&G.us.some(x=>x.uid===uid)) return toast('That unit is on the map. Leave the stage first.');
  if(i.locked)return toast("Unlock this unit before selling it.");
  const v=sellVal(i);
  if(!confirm('Sell '+UNITS[i.id].n+' (level '+i.lv+', '+i.st+' stars) for '+v+' gems? This cannot be undone.')) return;
  S.gems+=v;S.units=S.units.filter(x=>x!==i);S.equipped=(S.equipped||[]).filter(id=>id!==uid);save(false);gemUI();renderAll();toast('Sold for '+v+' gems');
}
let bagSel=null;
function renderBag(){setupUnitSort('feedPickerSort','feedPicker',renderBag);
  const ks=Object.keys(ITEMS).filter(k=>S.bag[k]>0);
  const rerollCount=Math.max(0,Number(S.traitRerolls)||0);
  $('#bagGrid').innerHTML='<div class="card'+(bagSel==='trait_reroll'?' sel':'')+'" data-k="trait_reroll" style="cursor:pointer"><canvas class="ico reroll-ico" width="72" height="64" data-item="trait_reroll"></canvas><b>Trait Reroll</b><br>Owned: x'+rerollCount+'</div>'+ks.map(k=>'<div class="card'+(k===bagSel?' sel':'')+'" data-k="'+k+'" style="cursor:pointer"><canvas class="ico" width="72" height="64" data-item="'+k+'"></canvas><b>'+ITEMS[k].n+'</b><br>Owned: x'+S.bag[k]+'</div>').join('');
  $('#bagGrid').querySelectorAll('.card').forEach(c=>c.onclick=()=>{bagSel=c.dataset.k;renderBag()});
  paintIcons();
  if(bagSel==='trait_reroll'){
    const box=$('#bagInfo');
    box.innerHTML='<h3><canvas class="ico inline-ico" width="72" height="64" data-item="trait_reroll"></canvas>Trait Reroll</h3><p>Owned: <b>'+rerollCount+'</b></p><p>Use in Trait Forge to reroll a unit’s trait. One item is spent per reroll; if you have none, a reroll costs 30 gems.</p><p>How to obtain: 25 starting rerolls, AFK rewards (5% chance per completed minute), player-level milestone rewards, and Hard/Hell boss drops.</p><button id="bagUseTraitReroll">Use Item?</button>';
    $('#bagUseTraitReroll').onclick=()=>{const tab=document.querySelector('.tabs button[data-tab="traits"]');if(tab)tab.click();};
    paintIcons();
    return;
  }
  renderBagPrestigeTools();
  const k=bagSel&&S.bag[bagSel]>0?bagSel:null,box=$('#bagInfo');
  if(!k){bagSel=null;box.innerHTML='<b>Feed fruits to level up your units</b><p>Select a fruit above, then choose a unit and tap Feed 1 or Feed up to 10. Prestige becomes available in the Units tab at level 100.</p>'+'';return}
  const it=ITEMS[k],eligible=S.units.filter(u=>u.lv<100),opts=eligible.map(u=>'<option value="'+u.uid+'">'+unitLabel(u)+'</option>').join('');
  box.innerHTML='<b>'+it.n+'</b> x'+S.bag[k]+'<br>Food from '+STAGES[it.map].n+'. Each one gives a unit '+it.exp+' EXP. Earn more by clearing that map or playing its Infinite mode.<br><br>'
    +(opts?'<select id="feedPickerSort" class="unit-sort" aria-label="Sort feed units"></select><div id="feedPicker" class="unit-picker"></div><select id="feedTo" class="hide">'+opts+'</select> <button id="f1">Feed 1</button> <button class="alt" id="f10">Feed up to 10</button>':'You have no units below level 100 to feed.');
  if(opts){const select=$('#feedTo');const old=renderBag.selectedUid;if(eligible.some(u=>String(u.uid)===old))select.value=old;renderUnitPicker('feedPicker',eligible,select.value,uid=>{select.value=uid;renderBag.selectedUid=uid;renderUnitPicker('feedPicker',eligible,uid,v=>{select.value=v;renderBag.selectedUid=v;});});$('#f1').onclick=()=>feed(1);$('#f10').onclick=()=>feed(10)}
}

function renderBagPrestigeTools(){
  let panel=$('#bagPrestigeTools');
  if(!panel){panel=document.createElement('div');panel.id='bagPrestigeTools';panel.className='panel';$('#bagInfo').insertAdjacentElement('afterend',panel)}
  const units=S.units.filter(u=>u.st<maxPrestigeStars(u.id));
  const selected=Number(panel.querySelector('select')?.value)||Number(renderBagPrestigeTools.selectedUid)||units[0]?.uid;
  const target=units.find(u=>u.uid===selected)||units[0];
  panel.innerHTML='<h3>⭐ Unit Prestige</h3><p style="color:var(--mut)">At level 100, prestige resets that unit to level 1 and adds one permanent star. Star limits: Common 1★, Rare 2★, Epic and rarer 5★.</p>'
    +(units.length?'<label for="bagPrestigeUnit">Choose unit</label><select id="bagPrestigeUnit" style="width:100%;margin:6px 0">'+units.map(u=>'<option value="'+u.uid+'"'+(u.uid===target.uid?' selected':'')+'>'+unitLabel(u)+' · Lv '+u.lv+' · '+'★'.repeat(u.st)+'☆'.repeat(Math.max(0,maxPrestigeStars(u.id)-u.st))+' ('+u.st+'/'+maxPrestigeStars(u.id)+')</option>').join('')+'</select><p id="bagPrestigeHint"></p><button id="bagPrestigeButton">⭐ Prestige selected unit</button>':'<p>All owned units have five stars, or you have no units yet.</p>');
  const sel=$('#bagPrestigeUnit');if(!sel)return;
  const update=()=>{const u=S.units.find(x=>x.uid===Number(sel.value));if(!u)return;renderBagPrestigeTools.selectedUid=u.uid;$('#bagPrestigeHint').textContent=u.lv>=100?'Ready to prestige!':'Level '+u.lv+'/100 — feed fruits to reach level 100';$('#bagPrestigeButton').disabled=u.lv<100||u.st>=maxPrestigeStars(u.id)};
  sel.onchange=update;
  $('#bagPrestigeButton').onclick=()=>prestige(Number(sel.value));
  update();
}

function feed(n){
  const k=bagSel,i=S.units.find(x=>x.uid===+$('#feedTo').value);
  if(!k||!i) return toast('Pick a unit first');
  const b=i.lv;let used=0;
  while(used<n&&S.bag[k]>0&&i.lv<100){addXp(i,Math.min(2000,ITEMS[k].exp));S.bag[k]--;used++}
  if(!S.bag[k]) delete S.bag[k];
  save(false);renderAll();
  toast(UNITS[i.id].n+' ate '+used+(i.lv>b?' and went from level '+b+' to '+i.lv:' and gained EXP'));
}
function itemArt(c,id,x,y,s){
  if(typeof GGA!=='undefined'&&GGA.drawItem(c,id,x,y,s))return;
  c.save();c.translate(x,y);c.scale(s,s);
  const ellipse=(x,y,rx,ry,col,rot=0)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);c.fill()};
  const poly=(pts,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fill()};
  const line=(a,b,d,e,col,w=2)=>{c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.stroke()};
  switch(id){
    case 'berry': ellipse(-6,4,8,9,'#ed2452');ellipse(5,5,8,9,'#ff4970');ellipse(0,-3,7,8,'#db174b');poly([-5,-9,0,-16,5,-9,13,-11,5,-5,0,-8,-6,-4,-12,-9],'#4ade80');break;
    case 'crystal': poly([0,-22,12,-5,7,15,-7,15,-12,-5],'#35c4fa');poly([0,-22,12,-5,0,5],'#d8f6ff');poly([0,5,7,15,-7,15],'#1486ce');break;
    case 'pepper': ellipse(2,4,7,15,'#f43f28',-.3);ellipse(-4,5,5,12,'#fb8a22',-.3);line(0,-10,4,-17,'#448d34',3);poly([4,-15,13,-13,7,-9],'#76bd43');break;
    case 'lotus': for(let j=0;j<6;j++){let a=j*Math.PI/3;ellipse(Math.sin(a)*7,Math.cos(a)*7,5,11,j%2?'#a9d5f6':'#f4b8f2',-a)}ellipse(0,0,5,5,'#ffe3a0');break;
    case 'date': ellipse(0,2,9,16,'#c97630',-.15);ellipse(-3,-1,3,10,'#f4c46c',-.15);line(0,-13,3,-20,'#826337',3);break;
    case 'icefruit': ellipse(0,2,13,14,'#9de7fc');ellipse(-4,-2,6,8,'#e1faff');poly([-8,0,-2,-14,4,-2,11,2,2,16],'#5dc2ee');line(0,-12,4,-19,'#84b9c6',2);break;
    case 'spore': ellipse(0,9,5,12,'#e8e5ba');ellipse(0,-4,17,10,'#9fcb43');ellipse(-5,-8,5,3,'#dcf78c');ellipse(8,-3,3,3,'#527b31');break;
    case 'embercore': poly([0,-21,11,-8,15,8,0,19,-15,8,-11,-8],'#8c2338');poly([0,-15,7,-5,4,11,-4,12,-8,-3],'#ff8c21');poly([0,-10,3,1,-1,9,-5,1],'#ffe39c');break;
    case 'starfruit': poly([0,-21,6,-7,20,-5,9,4,12,18,0,10,-12,18,-9,4,-20,-5,-6,-7],'#e5c4ff');poly([0,-16,5,-3,0,9,-5,-3],'#a777f2');ellipse(0,0,3,3,'#fff7c7');break;
    case 'relicseed': ellipse(0,2,12,17,'#b99c63');ellipse(0,2,7,12,'#f2e3ae');poly([0,-14,5,-4,0,0,-5,-4],'#8b7446');line(-5,10,5,10,'#9b8052');break;
    case 'xenopod': ellipse(0,1,12,17,'#743dd0');ellipse(0,1,8,12,'#bc8bff');for(let j=-1;j<=1;j++){ellipse(j*7,-4,3,4,'#79f6e2');line(j*7,12,j*9,19,'#9b63ed',2)}break;
  }
  c.restore();
}

/* ---------- Character art ---------- */
function L(c,x1,y1,x2,y2,w,col){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function C(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,7);c.fill()}
function T(c,p,col){c.fillStyle=col;c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();c.fill()}
const ART={
 knight:c=>{C(c,0,-10,6.6,'#cbd5e1');T(c,[-6,-9,6,-9,6,-6,-6,-6],'#475569');L(c,9,3,9,-17,3,'#e2e8f0');L(c,5,2,13,2,3,'#fbbf24');C(c,-10,4,6,'#1e3a8a');C(c,-10,4,2.5,'#fbbf24')},
 blade:c=>{L(c,-6,-14,6,-14,2,'#ef4444');L(c,8,6,17,-12,2.5,'#a5f3fc');L(c,-8,6,-17,-12,2.5,'#a5f3fc');L(c,6,6,10,6,2,'#fbbf24');L(c,-6,6,-10,6,2,'#fbbf24')},
 archer:c=>{T(c,[-7,-8,0,-21,7,-8],'#2f6b25');c.strokeStyle='#92400e';c.lineWidth=2.5;c.beginPath();c.arc(8,0,13,-1.15,1.15);c.stroke();L(c,13.3,-11.8,13.3,11.8,1,'#e5e7eb');L(c,-2,0,18,0,1.5,'#d6d3d1');T(c,[18,-2.5,23,0,18,2.5],'#e5e7eb')},
 sniper:c=>{T(c,[-6,-9,6,-9,5,-14,-5,-14],'#57534e');L(c,-8,5,24,-1,3.5,'#27272a');L(c,2,2,2,-3,2.5,'#71717a');C(c,2,-4.5,2.2,'#7dd3fc');L(c,24,-1,27,-1,2,'#a1a1aa');L(c,-8,5,-11,9,3,'#78350f')},
 apprentice:c=>{T(c,[-7,-9,0,-23,7,-9],'#6d28d9');L(c,-8,-9,8,-9,2.5,'#4c1d95');L(c,9,14,12,-8,2,'#92400e');C(c,12.5,-10,3.2,'#fde047')},
 mage:c=>{T(c,[-6,-10,-1,-27,6,-10],'#1d4ed8');L(c,-9,-10,9,-10,3,'#1e3a8a');L(c,11,15,11,-12,2,'#a16207');C(c,11,-16,4.2,'#bae6fd');L(c,6,-16,16,-16,1.2,'#e0f2fe');L(c,11,-21,11,-11,1.2,'#e0f2fe')},
 dragon:c=>{T(c,[-7,0,-24,-12,-14,6],'#7e22ce');T(c,[7,0,24,-12,14,6],'#7e22ce');T(c,[-6,-13,-9,-21,-3,-14],'#fde68a');T(c,[6,-13,9,-21,3,-14],'#fde68a');L(c,9,4,9,-17,3.5,'#fb923c');L(c,9,-17,9,-21,2,'#fef08a');L(c,5,3,13,3,3,'#fbbf24')},
 warden:c=>{c.strokeStyle='#fde68a';c.lineWidth=2;c.beginPath();c.ellipse(0,-18,6,2.2,0,0,7);c.stroke();for(let a=0;a<8;a++){const r=a*Math.PI/4;L(c,Math.cos(r)*17,Math.sin(r)*17+2,Math.cos(r)*21,Math.sin(r)*21+2,1.5,'#fef9c3')}T(c,[0,-1,4,4,0,9,-4,4],'#fff');L(c,9,2,9,-15,2.5,'#fff');C(c,9,-17,3,'#fde047')}
};
// Character-specific silhouettes, equipment and symbols drawn at any scale.
function characterDesign(c,id){
 const u=UNITS[id],name=u.n.toLowerCase(),color=u.col;
 const has=(...words)=>words.some(w=>name.includes(w));
 const line=(x,y,X,Y,w=2,col='#e2e8f0')=>L(c,x,y,X,Y,w,col);
 const poly=(points,col)=>T(c,points,col);
 const circle=(x,y,r,col)=>C(c,x,y,r,col);
 const wing=(side,col)=>poly([side*5,-5,side*23,-19,side*18,4,side*7,8],col);
 const crown=(col)=>poly([-9,-18,-7,-26,-2,-21,0,-29,5,-21,10,-26,9,-17],col);
 const star=(x,y,r,col)=>{for(let i=0;i<8;i++){let a=i*Math.PI/4;line(x,y,x+Math.cos(a)*r,y+Math.sin(a)*r,1.5,col)}};
 const staff=(col)=>{line(13,13,13,-20,3,'#875b39');circle(13,-21,5,col)};
 const bow=()=>{c.strokeStyle='#b78a56';c.lineWidth=2.5;c.beginPath();c.arc(13,-1,13,-1.4,1.4);c.stroke();line(15,-14,15,12,1,'#f8fafc');line(-3,0,23,0,2,'#d4d4d8');poly([23,-3,28,0,23,3],'#f8fafc')};
 const sword=()=>{line(12,11,17,-20,3,'#cbd5e1');line(8,0,21,2,3,'#fbbf24')};
 const gun=()=>{line(-5,1,24,-5,5,'#4b5563');line(3,-2,3,-8,2,'#d1d5db');circle(4,-9,3,'#67e8f9')};
 const reptile=has('lizard','reptile','drake','dragon','leviathan');
 const alien=has('alien','xeno','moonling');
 const beast=has('phoenix','falcon','bee','worldtree');
 if(reptile){
   poly([-8,4,-24,13,-12,11,-4,8],color);
   wing(-1,has('dragon','drake')?'#a855f7':'#38a169');wing(1,has('dragon','drake')?'#7e22ce':'#16a34a');
   poly([-10,-11,-6,-22,0,-18,6,-22,11,-10,9,0,-9,0],color);
   circle(-5,-12,2,'#fef08a');circle(5,-12,2,'#fef08a');
   poly([-8,-21,-13,-27,-3,-23], '#fbbf24');poly([8,-21,13,-27,3,-23],'#fbbf24');
   if(has('emperor','king'))crown('#ffd166');
   if(has('scout'))bow();if(has('knight'))sword();
   if(has('cinder','fire')){poly([11,-3,25,-10,21,0,30,3,15,7],'#fb923c')}
   if(has('sage'))staff('#38bdf8');
   return;
 }
 if(alien){
   circle(0,-11,12,'#94e7c8');poly([-12,-13,-6,-19,-1,-12,-5,-7],'#111827');poly([12,-13,6,-19,1,-12,5,-7],'#111827');
   line(-7,-23,-11,-29,2,color);line(7,-23,11,-29,2,color);circle(-11,-29,2,'#7dd3fc');circle(11,-29,2,'#7dd3fc');
   if(has('warden')){staff('#f0abfc');crown('#f0abfc')}else circle(13,0,6,'#22d3ee');return;
 }
 if(has('worldtree','druid')){
   poly([-11,14,-15,-8,-4,-18,5,-8,14,14],'#8b5a2b');
   for(let j=0;j<5;j++)circle((j-2)*7,-18-(j%2)*5,8,['#166534','#22c55e','#4ade80'][j%3]);
   if(has('druid'))staff('#86efac');return;
 }
 if(has('phoenix','falcon','bee')){
   wing(-1,has('phoenix')?'#f97316':'#eab308');wing(1,has('phoenix')?'#ef4444':'#facc15');
   circle(0,-11,8,has('phoenix')?'#fb923c':'#fde047');poly([3,-12,17,-9,3,-5],'#f8fafc');
   if(has('bee')){line(-7,0,7,0,3,'#111827');line(-7,7,7,7,3,'#111827')};return;
 }
 // Humanoid units have recognizable class gear rather than a generic pointed hat.
 if(has('knight','guard','paladin','sentinel','squire','captain','titan')){
   poly([-11,-15,-9,-24,9,-24,11,-15],'#94a3b8');line(-9,-13,9,-13,3,'#334155');
   circle(-12,4,8,has('paladin','celestial')?'#fbbf24':'#475569');circle(-12,4,3,color);
   if(has('spear','captain'))line(14,14,14,-26,3,'#d1d5db');else sword();
   if(has('titan')){poly([-15,-12,-20,-24,-8,-18],color);poly([15,-12,20,-24,8,-18],color)}
 }else if(has('archer','ranger','hunter','scout','falconer','slingshot')){
   poly([-11,-9,0,-25,11,-9],has('celestial')?'#fbbf24':'#166534');bow();
   if(has('thorn')){line(-10,-6,-17,-15,3,'#4ade80');line(-8,5,-17,11,3,'#4ade80')}
   if(has('celestial'))star(0,-25,7,'#fef08a');
 }else if(has('sniper','pirate','engineer','tinker')){
   gun();if(has('pirate')){poly([-12,-16,0,-26,12,-16],'#1f2937');circle(0,-19,3,'#f8fafc')}
   if(has('tinker','engineer')){circle(-9,-11,6,'#fbbf24');circle(-9,-11,3,'#64748b')}
 }else if(has('mage','witch','apprentice','oracle','alchemist','pyro','storm','caller','weaver','scribe','herbalist','monk','sage')){
   poly([-12,-13,-1,-29,12,-13],has('witch')?'#312e81':color);line(-12,-13,12,-13,3,'#312e81');
   staff(has('frost')?'#7dd3fc':has('pyro')?'#fb923c':has('storm')?'#fde047':color);
   if(has('witch'))circle(-2,-15,3,'#c084fc');
   if(has('storm'))star(13,-21,9,'#fde047');
   if(has('time')){circle(13,-21,7,'#fbbf24');line(13,-21,13,-25,1,'#111827');line(13,-21,17,-21,1,'#111827')}
 }else if(has('samurai','fencer','assassin','blade','reaper','berserker','brawler','lancer')){
   if(has('assassin','reaper'))poly([-12,-10,0,-26,12,-10],'#111827');
   if(has('samurai'))poly([-11,-17,0,-26,11,-17],'#b91c1c');
   sword();if(has('blade','fencer')){line(-12,10,-17,-20,2,'#67e8f9')}
   if(has('berserker')){poly([-11,-16,-17,-24,-4,-20], '#ef4444')}
 }else if(has('king','emperor','monarch','sovereign','lord','eternity')){
   crown('#fbbf24');staff(color);
 }else if(has('miner')){
   poly([-10,-15,0,-23,10,-15],'#fbbf24');circle(0,-19,3,'#fef08a');line(10,12,18,-16,4,'#78716c');
 }else if(has('keeper')){
   poly([-12,-13,0,-25,12,-13],color);circle(13,-20,7,'#fde047');
 }else{staff(color);circle(0,-23,5,color)}
 if(has('star','astral','cosmos','celestial')){star(-14,-23,7,'#fef08a');star(15,-28,5,'#a5f3fc')}
 if(has('void','abyss','night','hex')){circle(-13,-21,5,'#312e81');circle(-13,-21,2,'#c084fc')}
 if(has('light','dawn','seraph')){c.strokeStyle='#fde68a';c.lineWidth=2;c.beginPath();c.ellipse(0,-27,11,3,0,0,7);c.stroke()}
 if(has('torch','fire','ember')){poly([14,-18,8,-28,16,-25,18,-34,24,-20,18,-14],'#fb923c')}
}
// Distinct animated auras for the three Mythic traits.
const MYTHIC_VISUALS={
 astral:{color:'#ffe66d',secondary:'#60f7ff',symbol:'✦',name:'Solar constellation'},
 singularity:{color:'#a855f7',secondary:'#45e5ff',symbol:'◈',name:'Gravity vortex'},
 cosmic:{color:'#ff6fd8',secondary:'#b4fffb',symbol:'✧',name:'Celestial flame'},
 midas:{color:'#ffdf58',secondary:'#fff8c0',symbol:'✦',name:'Golden shimmer'}
};
function traitAura(c,trait,x,y,scale=1,time=Date.now()/1000){
 const v=MYTHIC_VISUALS[trait];if(!v)return;
 c.save();c.translate(x,y);c.scale(scale,scale);
 const phase=time*(trait==='singularity'?-2:1.6);
 c.globalAlpha=.75;
 if(trait==='midas'){
   const shine=.55+.45*Math.sin(time*5);c.shadowColor='#ffd54d';c.shadowBlur=13+8*shine;
   c.strokeStyle='#ffce32';c.lineWidth=2.5;c.beginPath();c.ellipse(0,-7,19+shine*3,27+shine*2,0,0,Math.PI*2);c.stroke();
   for(let i=0;i<8;i++){const a=phase*1.6+i*Math.PI/4,r=18+5*Math.sin(time*3+i);C(c,Math.cos(a)*r,Math.sin(a)*r-8,1.6+shine*1.2,i%2?'#fff9b0':'#ffc526')}
 }else if(trait==='astral'){
   for(let i=0;i<7;i++){const a=phase+i*Math.PI*2/7,r=22+3*Math.sin(time*3+i);C(c,Math.cos(a)*r,Math.sin(a)*r-8,i%2?2:3,i%2?v.secondary:v.color)}
   c.strokeStyle=v.color;c.lineWidth=1.6;c.beginPath();c.arc(0,-8,22,0,Math.PI*2);c.stroke();
 }else if(trait==='singularity'){
   for(let i=0;i<3;i++){c.strokeStyle=i%2?v.secondary:v.color;c.lineWidth=2.5;c.beginPath();c.ellipse(0,-8,18+i*5,8+i*4,phase+i*.65,0,Math.PI*1.65);c.stroke()}
   C(c,0,-8,5,'#17092e');C(c,0,-8,2,v.secondary);
 }else{
   for(let i=0;i<9;i++){const a=i*2.4+phase,r=12+8*Math.abs(Math.sin(time*1.8+i));C(c,Math.cos(a)*r,8-Math.abs(Math.sin(a))*r,2.5,i%2?v.color:v.secondary)}
   c.strokeStyle=v.color;c.lineWidth=2;c.beginPath();c.arc(0,-5,20,Math.PI*.15,Math.PI*1.85);c.stroke();
 }
 c.restore();
}
function unitTrait(uid){return S.units.find(u=>u.uid===uid)?.trait||''}
// Extra facial expressions and role-specific finishing details for every unit.
function unitFinishingDetails(c,id,time){
 const u=UNITS[id],n=u.n.toLowerCase(),has=(...w)=>w.some(t=>n.includes(t));
 const beast=has('dragon','drake','lizard','reptile','leviathan','phoenix','falcon','bee','worldtree','druid');
 const alien=has('alien','xeno','moonling');
 const secret=id==='abyss_summoner';
 c.save();c.lineCap='round';c.lineJoin='round';
 // Silhouette ink, seams, arm guards, belt buckle, boots and engraved chest crest.
 c.strokeStyle='#080d1bbb';c.lineWidth=1.25;
 // Keep contour strokes on the torso, below the face.
 L(c,-9,14,-8,2,1.25,'#080d1bbb');L(c,9,14,8,2,1.25,'#080d1bbb');
 if(!beast&&!alien){
  L(c,-7,7,7,7,1.6,'#172033');C(c,0,7,2.1,'#e2c179');
  L(c,-6,12,-6,15,2,'#1c2330');L(c,6,12,6,15,2,'#1c2330');
  L(c,-9,-1,-12,8,2.5,u.col);L(c,9,-1,12,8,2.5,u.col);
  C(c,-3,-11.2,1.1,secret?'#ff2445':'#1e293b');C(c,3,-11.2,1.1,secret?'#ff2445':'#1e293b');
  L(c,-2.2,-6.6,2.2,-6.6,.8,secret?'#c41d38':'#7c4a3d');
  L(c,-5,-14,-1,-14,.9,'#3a2831');L(c,1,-14,5,-14,.9,'#3a2831');
  if(has('knight','guard','paladin','sentinel','squire','captain','titan')){
   L(c,-5,-8,5,-8,1.6,'#475569');L(c,0,-17,0,-9,1,'#e2e8f0');
   C(c,-12,4,1.5,'#f8fafc');L(c,-6,1,0,4,1,'#e2e8f0');
  }else if(has('mage','witch','oracle','sage','alchemist','pyro','storm','caller','weaver','scribe','herbalist','monk','apprentice')){
   C(c,0,1,2.8,'#fde68a');C(c,0,1,1.3,u.col);L(c,-7,9,-3,10,1,'#fef3c7');
  }else if(has('assassin','reaper','samurai','fencer','blade','berserker')){
   L(c,-4,-7,4,-7,2,'#1f2937');L(c,-5,3,5,3,1,'#f87171');
  }else if(has('archer','ranger','hunter','scout','sniper')){
   L(c,-5,-15,5,-15,2,'#365e42');C(c,0,2,2,'#a3e635');
  }else if(has('pirate','engineer','tinker','miner')){
   C(c,4,-11,2.6,'#a5f3fc');C(c,4,-11,1.3,'#0f172a');
  }else if(has('king','emperor','monarch','sovereign','lord')){
   C(c,0,1,3,'#fbbf24');C(c,0,1,1.4,'#f43f5e');
  }else{C(c,0,1,2,'#cbd5e1')}
 }else if(alien){
  C(c,-4,-11,3,'#091a25');C(c,4,-11,3,'#091a25');
  C(c,-3.4,-12,1,'#67e8f9');C(c,4.6,-12,1,'#67e8f9');
  L(c,-2,-5,2,-5,1,'#165e61');
 }else if(has('phoenix','falcon','bee')){
  C(c,-3,-13,1.5,'#111827');C(c,3,-13,1.5,'#111827');
  L(c,-2,-6,2,-6,1,'#92400e');
 }else if(has('dragon','drake','lizard','reptile','leviathan')){
  C(c,-5,-12,1.2,'#0f172a');C(c,5,-12,1.2,'#0f172a');
  C(c,-5,-11.6,.5,'#fff');C(c,5,-11.6,.5,'#fff');
  L(c,-4,-5,4,-5,1.2,'#422006');C(c,-5,-4,1,'#334155');C(c,5,-4,1,'#334155');
  for(let i=0;i<3;i++){T(c,[-6+i*6,-4,-4+i*6,-1,-2+i*6,-4],'#fff7ed')}
 }else if(has('worldtree','druid')){
  C(c,-4,-10,1.8,'#fef08a');C(c,4,-10,1.8,'#fef08a');
  L(c,-3,-5,3,-5,1.3,'#3f6212');
 }
 if(secret){
  C(c,-4,-13,2,'#ff1d36');C(c,4,-13,2,'#ff1d36');
  for(let i=0;i<4;i++){const a=time*1.7+i*Math.PI/2;C(c,Math.cos(a)*18,Math.sin(a)*12-4,1.4,'#fb2949')}
 }
 c.restore();
}
function art(c,id,x,y,sc,trait="",time=Date.now()/1000,opt={}){
 if(!UNITS[id])return;
 // New art style (2026.10.11.1): redesigned units are cached sprites; others keep the classic drawing below.
 if(typeof GGA!=='undefined'&&GGA.LOOKS[id]){
   const battle=!!(c.canvas&&c.canvas.id==='cv');
   GGA.drawUnit(c,id,x,y,sc,time,{flip:!!opt.flip,still:!battle,midas:trait==='midas'});
   if(trait)traitAura(c,trait,x,y-sc,sc,time);
   return;
 }
 c.save();c.translate(x,y);c.scale(opt.flip?-sc:sc,sc);
 c.fillStyle='#0005';c.beginPath();c.ellipse(0,15,12,4,0,0,7);c.fill();
 if(id==='chrono_warden'){c.save();c.strokeStyle='#8cecff';c.shadowColor='#75e5ff';c.shadowBlur=14;c.lineWidth=2;c.beginPath();c.arc(0,-5,23,0,7);c.stroke();c.restore();}
 if(id==='rift_blade'){c.save();c.strokeStyle='#ffedf8';c.shadowColor='#d855fa';c.shadowBlur=12;c.lineWidth=3;c.beginPath();c.arc(0,-5,22,-1.8,1.6);c.stroke();c.restore();}
 if(id==='abyss_summoner'){
   const pulse=.5+.5*Math.sin(time*3);
   c.save();c.shadowColor='#ff172d';c.shadowBlur=13+8*pulse;c.strokeStyle='#e5142d';c.lineWidth=2.5;
   c.beginPath();c.ellipse(0,-3,20+pulse*3,27+pulse*2,0,0,Math.PI*2);c.stroke();c.restore();
 }
 c.shadowColor='#050816';c.shadowBlur=2.5;c.fillStyle=UNITS[id].col;c.beginPath();c.moveTo(-9,14);c.lineTo(-7,-3);c.quadraticCurveTo(0,-8,7,-3);c.lineTo(9,14);c.closePath();c.fill();
 C(c,0,-10,7,'#eac5a7');
 if(id==='abyss_summoner'){
   // Black hood, crimson mask, horned crown, dark staff, glowing summoning sigil.
   c.fillStyle='#09070c';c.beginPath();c.moveTo(-12,-7);c.lineTo(-8,-27);c.lineTo(0,-34);c.lineTo(8,-27);c.lineTo(12,-7);c.closePath();c.fill();
   T(c,[-11,-24,-17,-35,-4,-29],'#25060d');T(c,[11,-24,17,-35,4,-29],'#25060d');
   C(c,-4,-13,2.1,'#ff273c');C(c,4,-13,2.1,'#ff273c');
   L(c,15,14,16,-29,3,'#240e16');C(c,16,-31,5,'#fa1837');
   c.strokeStyle='#ff2445';c.lineWidth=1.7;c.beginPath();c.arc(0,4,10,0,7);c.stroke();
   for(let i=0;i<5;i++){const a=i*2*Math.PI/5;C(c,Math.cos(a)*10,4+Math.sin(a)*10,1.5,'#ff4961')}
 }else if(id==='rift_blade'){c.fillStyle='#dedbe9';c.fillRect(-9,-26,18,12);C(c,-4,-17,2,'#d82a64');C(c,4,-17,2,'#d82a64');L(c,12,12,22,-30,5,'#bcb6e9');L(c,22,-30,28,-39,3,'#fff0f7');}else if(id==='chrono_warden'){c.fillStyle='#203c59';c.fillRect(-12,-28,24,12);C(c,-4,-17,2,'#7defff');C(c,4,-17,2,'#7defff');c.strokeStyle='#a2f7ff';c.lineWidth=2;c.beginPath();c.arc(0,3,9,0,7);c.stroke();L(c,14,14,14,-27,3,'#6fd4ec');}else characterDesign(c,id);
 c.shadowBlur=0;
 // Restore a clean facial plane above costume and silhouette outlines so the eyes,
 // mouth and expression stay readable, even on small unit icons.
 const faceName=UNITS[id].n.toLowerCase();
 const creatureFace=/dragon|drake|lizard|reptile|leviathan|phoenix|falcon|bee|worldtree|druid|alien|xeno|moonling/.test(faceName);
 if(id!=='abyss_summoner'&&!creatureFace){
   c.save();c.shadowBlur=0;
   c.fillStyle='#eac5a7';c.beginPath();c.ellipse(0,-11,6.4,6.1,0,0,Math.PI*2);c.fill();
   // Hair/helm rim stays above the brow rather than crossing the eyes.
   c.strokeStyle='#302637';c.lineWidth=1.2;c.beginPath();c.arc(0,-11,6.3,Math.PI*1.12,Math.PI*1.88);c.stroke();
   c.restore();
 }
 unitFinishingDetails(c,id,time);
 if(trait==='midas'){c.save();c.globalCompositeOperation='source-atop';c.fillStyle='rgba(255,199,34,.47)';c.fillRect(-38,-52,76,83);c.restore();}
 if(trait)traitAura(c,trait,0,-1,1,time);
 c.restore();
}
function paintIcons(){document.querySelectorAll('canvas.ico').forEach(k=>{
  // Draw icons at 4x resolution so the new art stays sharp when cards display them larger.
  if(k.width===72&&k.height===64){k.width=288;k.height=256;}
  const c=k.getContext('2d'),s=k.width/72;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,k.width,k.height);c.setTransform(s,0,0,s,0,0);
  if(k.dataset.item)itemArt(c,k.dataset.item,36,32,1.5);else art(c,k.dataset.id,36,38,1.35,k.dataset.trait||"");c.setTransform(1,0,0,1,0,0);})}

/* ---------- Summon ---------- */
function gemUI(){$('#gems').textContent='◆ '+S.gems+' gems'}
function discoverItem(id){if(!ITEMS[id])return;if(!Array.isArray(S.discoveredItems))S.discoveredItems=[];if(!S.discoveredItems.includes(id))S.discoveredItems.push(id)}
function renderItemIndex(){
 const found=new Set(S.discoveredItems||[]),ids=Object.keys(ITEMS);
 $('#itemIndexProgress').textContent=`Obtained ${ids.filter(id=>found.has(id)).length} / ${ids.length} items`;
 const rerollIndex='<div class="card"><canvas class="ico reroll-ico" width="72" height="64" data-item="trait_reroll"></canvas><b>Trait Reroll</b><br><small>Use: Reroll a unit’s trait in Trait Forge. One item per roll; otherwise 30 gems.</small><br><small>How to obtain: 25 starting rerolls, AFK rewards (5% chance each completed minute), player-level milestone rewards, Hard/Hell boss drops.</small><br><small>Owned: '+Math.max(0,Number(S.traitRerolls)||0)+'</small></div>';
 $('#itemIndexGrid').innerHTML=ids.map(id=>{const it=ITEMS[id],got=found.has(id),map=STAGES[it.map];return `<div class="card ${got?'':'off'}">${got?'<canvas class="ico" width="72" height="64" data-item="'+id+'"></canvas>':'<div style="font-size:29px">?</div>'}<b>${got?it.n:'Undiscovered Item'}</b><br>${got?'✓ Obtained':'Not yet obtained'}<br><small>How to obtain: Clear ${map.n} or earn drops in its Infinite mode.</small><br><small>Gives ${it.exp} unit EXP when fed. Owned: ${S.bag[id]||0}</small></div>`}).join('');
 $('#itemIndexGrid').insertAdjacentHTML('afterbegin',rerollIndex);
}
// Show Trait Reroll first, before the food item cards.
document.addEventListener('change',e=>{if(e.target.id==='indexSort')renderIndex()});
function renderIndex(){
  const ids=Object.keys(UNITS),found=new Set(S.discovered||[]),claimed=new Set(S.indexClaimed||[]);
  const order={Common:0,Rare:1,Epic:2,Legendary:3,Mythic:4,Secret:5,Exclusive:6};
  const sort=$('#indexSort')?.value||'rarityDesc';
  ids.sort((a,b)=>{
    const A=UNITS[a],B=UNITS[b];
    let delta=0;
    if(sort==='rarityDesc')delta=(order[B.r]??0)-(order[A.r]??0);
    else if(sort==='rarityAsc')delta=(order[A.r]??0)-(order[B.r]??0);
    else if(sort==='damageDesc')delta=B.d-A.d;
    else if(sort==='damageAsc')delta=A.d-B.d;
    else if(sort==='discoveredFirst')delta=Number(found.has(b))-Number(found.has(a));
    else if(sort==='undiscoveredFirst')delta=Number(found.has(a))-Number(found.has(b));
    return delta||A.n.localeCompare(B.n);
  });
  $('#indexProgress').textContent=`Discovered ${ids.filter(id=>found.has(id)).length} / ${ids.length} units. Claim a one-time gem reward for each new unit!`;
  $('#indexGrid').innerHTML=ids.map(id=>{const u=UNITS[id],unlocked=found.has(id),done=claimed.has(id);
    return `<div class="card ${unlocked?'':'off'}"${unlocked?` data-ix-id="${id}" style="cursor:pointer"`:''}><canvas class="ico" width="72" height="64" data-id="${id}"></canvas><b class="${u.r}">${unlocked?u.n:'???'}</b><br>${u.r}<br>${unlocked?'Unlocked':'Not discovered'}<br><small class="ix-desc">${unlocked?(u.ability||'Standard attack'):'🔒 Skills & effects hidden until obtained'}</small>${unlocked?'<small class="ix-more">Tap for details</small>':''}${!INDEX_REWARDS[u.r]?'<small class="ix-noreward">No gem reward</small>':done?'✓ Reward claimed':unlocked?`<button data-claim="${id}">Claim ${INDEX_REWARDS[u.r]} gems</button>`:`Reward: ${INDEX_REWARDS[u.r]} gems`}</div>`;
  }).join('');
  $('#indexGrid').querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.claim;if(!S.discovered.includes(id)||S.indexClaimed.includes(id))return;
    S.indexClaimed.push(id);S.gems+=INDEX_REWARDS[UNITS[id].r];save(false);gemUI();renderIndex();toast('Index reward: +'+INDEX_REWARDS[UNITS[id].r]+' gems');
  });
  paintIcons();
}
// Stable five-minute banner: the same five featured units appear on every browser
// for the same time slot. No server or manual refresh is required.
const BANNER_MS=5*60*1000;
const RARITIES=['Common','Rare','Epic','Legendary','Mythic']; // Secret is a separate 0.5% off-banner pull
let bannerSlot=-1, featured={}, featuredCommons=[];
// Three featured Commons share the 65% Common slice equally; other rarities feature one unit.
const FEATURED_COMMON_COUNT=3;
function buildFeatured(slot){
  featured=Object.fromEntries(RARITIES.map(r=>[r,bannerUnit(r,slot)]));
  featuredCommons=[...new Set(Array.from({length:FEATURED_COMMON_COUNT},(_,k)=>bannerUnit('Common',slot+k*5)))];
  featured.Common=featuredCommons[0];
}
function bannerUnit(rarity,slot){
  const ids=Object.keys(UNITS).filter(id=>UNITS[id].r===rarity && UNITS[id].r!=='Exclusive');
  // Deterministic rotation through every unit of a rarity.
  const offset=RARITIES.indexOf(rarity)*7;
  return ids[((slot+offset)%ids.length+ids.length)%ids.length];
}
function ensureBanner(){
  const slot=Math.floor(Date.now()/BANNER_MS);
  if(slot!==bannerSlot){
    bannerSlot=slot;
    buildFeatured(slot);
    renderSummonPool();
  }
}
function updateBannerClock(){
  ensureBanner();
  const remaining=BANNER_MS-Date.now()%BANNER_MS;
  const mm=Math.floor(remaining/60000),ss=Math.floor(remaining%60000/1000);
  $('#bannerTimer').textContent=`Refresh in ${mm}:${String(ss).padStart(2,'0')}`;
}
function updatePity(){
  $('#pityInfo').textContent=`Legendary pity: ${S.pityLegendary||0}/100 · Mythic pity: ${S.pityMythic||0}/500 · Secret pity: ${S.playerLevel>=10?(S.pitySecret||0)+"/2500":"🔒 Unlocks at Lv 10"}`;
}
function renderSummonPool(){
  if(bannerSlot<0)return;
  $('#summonPool').innerHTML=[...featuredCommons,...RARITIES.filter(r=>r!=='Common').map(r=>featured[r])].map(id=>{const u=UNITS[id];return `<div class="card"><canvas class="ico" width="72" height="64" data-id="${id}"></canvas><b class="${u.r}">${u.n}</b><br><span class="${u.r}">${u.r}</span> · ${u.t}<br><small>${u.ability||'Standard attack'}</small></div>`}).join('');
  $('#summonPool').insertAdjacentHTML('beforeend', S.playerLevel>=10 ? '<div class="card" style="border:1px solid #a82035;background:#140e17"><canvas class="ico" width="72" height="64" data-id="abyss_summoner"></canvas><b class="Secret">Abyss Summoner</b><br><small>Secret • 0.5% chance • Guaranteed by 2,500 pulls • Unlocked</small></div>' : '<div class="card" style="border:1px solid #555;background:#17171e;opacity:.75"><div style="font-size:38px;padding:12px">🔒</div><b class="Secret">Secret Unit</b><br><small>Unlocks at Player Level 10 · Current Level '+S.playerLevel+'</small></div>');
  if(S.playerLevel>=10){for(const id of ['rift_blade','chrono_warden']){const u=UNITS[id];$('#summonPool').insertAdjacentHTML('beforeend',`<div class="card" style="border:1px solid #a82035;background:#140e17"><canvas class="ico" width="72" height="64" data-id="${id}"></canvas><b class="Secret">${u.n}</b><br><small>Secret • Shared 0.5% chance • Shared 2,500 pity</small><br><small>${u.ability}</small></div>`);}}
  paintIcons();updatePity();
}
function pull(n){
  ensureBanner();
  const cost=n===1?50:450;
  if(S.gems<cost)return toast('You need '+cost+' gems for that');
  S.gems-=cost;const got=[];const sold=[];const soldFlags=[];let autoSellRefund=0;let autoSellProtected=0;const autoSellRefundLimit=Math.floor(cost*.8);
  for(let i=0;i<n;i++){
    let k;
    if(S.playerLevel>=10&&(S.pitySecret||0)>=2499)k='Secret';
    else if((S.pityMythic||0)>=499)k='Mythic';
    else if((S.pityLegendary||0)>=99)k='Legendary';
    else{
      // One rarity roll: 65% Common, 20% Rare, 7.5% Epic, 5% Legendary, 2% Mythic, 0.5% Secret.
      // Before level 10, the locked Secret slice becomes Common instead.
      const r=Math.random();k=r<.65?'Common':r<.85?'Rare':r<.925?'Epic':r<.975?'Legendary':r<.995?'Mythic':(S.playerLevel>=10?'Secret':'Common');
      if(n===10&&i===9&&!got.some(g=>['Epic','Legendary','Mythic','Secret'].includes(UNITS[g].r)))k='Epic';
    }
    const summonableSecrets=Object.keys(UNITS).filter(id=>UNITS[id].r==='Secret'&&!UNITS[id].raidOnly);
    const id=k==='Secret'?summonableSecrets[Math.floor(Math.random()*summonableSecrets.length)]:(k==='Common'?featuredCommons[Math.floor(Math.random()*featuredCommons.length)]:featured[k]);
    // Never award an Exclusive unit from any summon, even if a future banner is misconfigured.
    if(!id || UNITS[id]?.r==='Exclusive' || UNITS[id]?.raidOnly)throw new Error('Invalid summon pool: Exclusive and raid-only units cannot be summoned');
    S.pityLegendary=k==='Legendary'?0:(S.pityLegendary||0)+1;
    S.pityMythic=k==='Mythic'?0:(S.pityMythic||0)+1;
    if(S.playerLevel>=10)S.pitySecret=k==='Secret'?0:Math.min(2499,(S.pitySecret||0)+1);
    if(S.settings.autoSell&&S.autoSellRarities.includes(k)&&autoSellRefund+Math.floor(sellVal({id,lv:1,st:0})*.75)<=autoSellRefundLimit){const refund=Math.floor(sellVal({id,lv:1,st:0})*.75);S.gems+=refund;autoSellRefund+=refund;sold.push(id);soldFlags.push(true);}else{if(S.settings.autoSell&&S.autoSellRarities.includes(k))autoSellProtected++;soldFlags.push(false);S.units.push({uid:S.nid++,id,lv:1,xp:0,st:0,trait:''});}
    if(!S.discovered.includes(id))S.discovered.push(id);
    got.push(id);
  }
  $('#res').innerHTML='You got: '+got.map((id,i)=>'<b class="'+UNITS[id].r+'">'+UNITS[id].n+(soldFlags[i]?' (auto-sold)':'')+'</b>').join(', ')+(sold.length?'<div style="margin-top:8px;color:#a5f3bd">Auto-sold '+sold.length+' unit(s) (25% tax) for +'+autoSellRefund+' gems.</div>':'')+(autoSellProtected?'<div style="margin-top:6px;color:#f6d18b">Kept '+autoSellProtected+' unit(s): auto-sell refunds after 25% tax are limited to 80% of summon cost per batch. These units retain their full manual resale value.</div>':'');
  save(false);gemUI();renderAll();updatePity();
}
$('#p1').onclick=()=>pull(1);$('#p10').onclick=()=>pull(10);
// Auto Summon is a session-only toggle. Only ten-pulls (450 gems) are used.
let autoSummonActive=false;
function refreshAutoSummonUI(){
 const btn=$('#autoSummonToggle'),status=$('#autoSummonStatus');
 btn.textContent=autoSummonActive?'■ Stop Auto Summon':'▶ Auto Summon ×10';
 btn.disabled=!autoSummonActive&&S.gems<=1000;
 status.textContent=autoSummonActive?(S.gems<450?'Waiting for 450 gems to summon ×10…':'Auto summoning ×10 for 450 gems'):(S.gems>1000?'Ready — summon ×10 automatically':'Requires more than 1,000 gems to start; stops below 400 gems');
}
$('#autoSummonToggle').onclick=()=>{
 if(autoSummonActive){autoSummonActive=false;toast('Auto Summon stopped');}
 else if(S.gems>1000){autoSummonActive=true;toast('Auto Summon started: ×10 pulls');}
 else toast('More than 1,000 gems required to start Auto Summon');
 refreshAutoSummonUI();
};
setInterval(()=>{
 if(autoSummonActive){
  if(S.gems<400){autoSummonActive=false;toast('Auto Summon stopped: fewer than 400 gems');}
  else if(S.gems>=450)pull(10);
 }
 refreshAutoSummonUI();
},1100);

$('#traitUnit').onchange=()=>{if(S.autoTraitEnabled){S.autoTraitEnabled=false;S.autoTraitUnitUid=null;save(false);}renderTraits();refreshAutoTraitUI();};
$('#autoTraitTarget').innerHTML='<option value=>Any trait (normal cooldown)</option>'+Object.entries(TRAITS).map(([id,t])=>`<option value="${id}">${t.n} (${t.rarity})</option>`).join('');
$('#autoTraitTarget').value=S.autoTraitTarget||'';
$('#autoTraitTarget').onchange=()=>{S.autoTraitTarget=$('#autoTraitTarget').value;S.autoTraitEnabled=false;S.autoTraitUnitUid=null;save(false);refreshAutoTraitUI();};
function rollSelectedTrait(auto=false){
 const targeted=auto&&Boolean(S.autoTraitTarget);
 if(!targeted&&traitRerollSecondsLeft()>0){updateTraitRerollButton();if(!auto)toast('Wait for the 3-second high-rarity trait protection to finish');return false;}
 const u=S.units.find(u=>String(u.uid)===$('#traitUnit').value);
 if(!u){if(!auto)toast('Summon a unit first');return false;}
 if(S.traitRerolls>0)S.traitRerolls--;
 else if(S.gems>=30)S.gems-=30;
 else {if(!auto)toast('Need 30 gems or a free trait reroll');return false;}
 const mythic=S.traitPity>=149;u.trait=pickTrait(mythic);
 const rarity=TRAITS[u.trait].rarity;
 S.traitPity=rarity==='Mythic'?0:S.traitPity+1;
 if((rarity==='Legendary'||rarity==='Mythic')&&!targeted)S.traitRollLockUntil=Date.now()+HIGH_TRAIT_REROLL_DELAY_MS;
 if(targeted&&u.trait===S.autoTraitTarget){S.autoTraitEnabled=false;S.autoTraitUnitUid=null;toast('Target trait found: '+TRAITS[u.trait].n+'! Auto Reroll stopped.');}
 save(false);gemUI();renderAll();
 if(!auto)toast('Trait: '+TRAITS[u.trait].n+(rarity==='Legendary'||rarity==='Mythic'?' — rerolls locked for 3 seconds':''));
 return true;
}
$('#traitRoll').onclick=()=>rollSelectedTrait(false);
function refreshAutoTraitUI(){
 const target=S.autoTraitTarget&&TRAITS[S.autoTraitTarget];
 $('#autoTraitTarget').value=S.autoTraitTarget||'';
 $('#autoTraitToggle').textContent=S.autoTraitEnabled?'■ Auto Reroll: ON':'▶ Auto Reroll: OFF';
 const u=S.units.find(u=>String(u.uid)===$('#traitUnit').value);
 $('#autoTraitStatus').textContent=S.autoTraitEnabled?(target?('Searching for '+target.n+' on '+(u?UNITS[u.id].n:'selected unit')+' — no high-rarity cooldown'+(S.traitRerolls<=0&&S.gems<30?' (waiting for currency)':'')):(traitRerollSecondsLeft()>0?'High-rarity trait protection: '+traitRerollSecondsLeft()+'s remaining':(S.traitRerolls<=0&&S.gems<30?'Paused — need rerolls or 30 gems':'Auto rerolling selected unit'))):(target?'Target: '+target.n+'. Start to reroll until found.':'Normal auto reroll uses the 3-second high-rarity protection.');
}
$('#autoTraitToggle').onclick=()=>{
 if(S.autoTraitEnabled){S.autoTraitEnabled=false;S.autoTraitUnitUid=null;}
 else{
  const u=S.units.find(u=>String(u.uid)===$('#traitUnit').value);
  if(!u)return toast('Select a unit first');
  if(S.autoTraitTarget&&u.trait===S.autoTraitTarget)return toast('This unit already has the target trait!');
  S.autoTraitEnabled=true;S.autoTraitUnitUid=u.uid;
 }
 save(false);refreshAutoTraitUI();toast('Auto Reroll '+(S.autoTraitEnabled?'enabled':'disabled'));
};
setInterval(()=>{
 if(S.autoTraitEnabled){
  const u=S.units.find(u=>u.uid===S.autoTraitUnitUid);
  if(!u||String(u.uid)!==$('#traitUnit').value){S.autoTraitEnabled=false;S.autoTraitUnitUid=null;save(false);}
  else if(S.autoTraitTarget&&u.trait===S.autoTraitTarget){S.autoTraitEnabled=false;S.autoTraitUnitUid=null;save(false);}
  else if((S.autoTraitTarget||traitRerollSecondsLeft()===0)&&(S.traitRerolls>0||S.gems>=30))rollSelectedTrait(true);
 }
 refreshAutoTraitUI();
},350);
refreshAutoTraitUI();refreshAutoSummonUI();
const SELL_RARITIES=['Common','Rare','Epic','Legendary','Mythic','Secret'];
$('#autoSellOptions').innerHTML='<label><input type="checkbox" data-setting="autoSell"> Enable auto-sell</label>'+SELL_RARITIES.map(r=>`<label class="${r}"><input type="checkbox" data-sell-rarity="${r}"> ${r}</label>`).join('')+'<small id="autoSellHint" style="display:block;width:100%;color:var(--mut)"></small>';
// These controls are inserted dynamically, after the global Settings listeners are bound.
const autoSellToggle=$('#autoSellOptions [data-setting="autoSell"]');
autoSellToggle.onchange=()=>{S.settings.autoSell=autoSellToggle.checked;save(false);updateAutoSellHint();};
function updateAutoSellHint(){const hint=$('#autoSellHint');if(!hint)return;hint.textContent=!S.settings.autoSell?'Auto-sell is off.':!S.autoSellRarities.length?'Choose at least one rarity above to sell newly summoned units.':'Active: new summons of '+S.autoSellRarities.join(', ')+' will be sold automatically for gems. Existing units are safe.';}
$('#autoSellOptions').querySelectorAll('[data-sell-rarity]').forEach(el=>el.onchange=()=>{S.autoSellRarities=SELL_RARITIES.filter(r=>$('#autoSellOptions [data-sell-rarity="'+r+'"]').checked);save(false);updateAutoSellHint();});
const originalSyncSettings=syncSettings;syncSettings=()=>{originalSyncSettings();$('#autoSellOptions').querySelectorAll('[data-sell-rarity]').forEach(el=>el.checked=S.autoSellRarities.includes(el.dataset.sellRarity));updateAutoSellHint();};
syncSettings();

// Player progression: EXP requirement increases by 75 per level; regular maps award 50 EXP.
// Map EXP increases by 1.5% per map; difficulty bonuses compare to Easy on the same map.
// Round only the final reward to an integer so small percentage increases accumulate fairly.
function regularMapPlayerExp(stageIndex,mode){
  const bonus={easy:1,medium:1.025,hard:1.05,hell:1.10};
  const index=Math.max(0,Math.min(STAGES.length-1,Math.floor(Number(stageIndex)||0)));
  return Math.round(50*Math.pow(1.015,index)*(bonus[mode]||1));
}
function playerExpNeeded(level){return 100+75*(level-1);}
function gainPlayerExp(amount){
  if(S.playerLevel>=100)return;
  S.playerExp+=amount;
  while(S.playerLevel<100&&S.playerExp>=playerExpNeeded(S.playerLevel)){S.playerExp-=playerExpNeeded(S.playerLevel);S.playerLevel++;if(S.playerLevel%5===0)toast('Level '+S.playerLevel+'! Open Profile to choose your reward.');}
  if(S.playerLevel>=100)S.playerExp=0;
  renderSummonPool();
  renderRaids();
}
function milestoneRewards(level){const tier=Math.max(1,Math.min(20,Math.floor(level/5)));return {gems:Math.min(1000,5*2**(tier-1)),rerolls:Math.min(50,2**(tier-1))};}
function renderProfile(){
  $('#headerPlayer').textContent=S.playerName+' · Lv '+S.playerLevel;
  $('#profileLevel').textContent='Level '+S.playerLevel;
  $('#profileFill').style.width=Math.min(100,100*S.playerExp/playerExpNeeded(S.playerLevel))+'%';
  $('#profileExp').textContent=S.playerLevel>=100?'MAX LEVEL · 100':S.playerExp+'/'+playerExpNeeded(S.playerLevel)+' EXP · Regular maps: 50 base EXP, +1.5% per map; Medium +2.5%, Hard +5%, Hell +10%; Infinite: +1 EXP per wave, increasing every 10 waves';
  $('#playerName').value=S.playerName;
  const avatar=$('#headerAvatar'),c=avatar.getContext('2d');c.clearRect(0,0,48,48);
  if(S.playerAvatar&&UNITS[S.playerAvatar])art(c,S.playerAvatar,24,30,.8);else{c.fillStyle='#8e83c7';c.font='bold 27px sans-serif';c.textAlign='center';c.fillText('★',24,33)}
  const ids=[...new Set(S.discovered||[])].filter(id=>UNITS[id]);
  $('#profileAvatars').innerHTML=ids.length?ids.map(id=>'<button class="avatar-option '+(S.playerAvatar===id?'selected':'')+'" data-avatar="'+id+'" title="'+UNITS[id].n+'"><canvas width="66" height="60" data-avatar-art="'+id+'"></canvas><small>'+UNITS[id].n+'</small></button>').join(''):'<p style="color:var(--mut)">Summon a new unit to unlock its avatar.</p>';
  $('#profileAvatars').querySelectorAll('[data-avatar]').forEach(b=>b.onclick=()=>{S.playerAvatar=b.dataset.avatar;save(false);renderProfile()});
  $('#profileAvatars').querySelectorAll('canvas').forEach(cv=>{const ctx=cv.getContext('2d');art(ctx,cv.dataset.avatarArt,33,38,1.05)});
  const pending=[];for(let lv=5;lv<=S.playerLevel;lv+=5)if(!S.playerRewards.includes(lv))pending.push(lv);
  $('#profileRewards').innerHTML=pending.length?pending.map(lv=>{const r=milestoneRewards(lv);return '<div class="reward-row"><b>Level '+lv+'</b><button data-reward="'+lv+'" data-kind="gems">+'+r.gems+' gems</button><span>or</span><button data-reward="'+lv+'" data-kind="rerolls">+'+r.rerolls+' Trait Reroll'+(r.rerolls===1?'':'s')+'</button></div>'}).join(''):'<p style="color:var(--mut)">No unclaimed rewards. Next milestone: Level '+(Math.floor(S.playerLevel/5)+1)*5+'</p>';
  $('#profileRewards').querySelectorAll('[data-reward]').forEach(b=>b.onclick=()=>{const lv=+b.dataset.reward;if(lv>S.playerLevel||S.playerRewards.includes(lv))return;const r=milestoneRewards(lv);if(b.dataset.kind==='gems')S.gems+=r.gems;else S.traitRerolls+=r.rerolls;S.playerRewards.push(lv);save(false);gemUI();renderProfile();renderTraits();toast('Level '+lv+' reward claimed!')});
}
$('#bProfile').onclick=()=>{$('#profileModal').classList.remove('hide');renderProfile()};
$('#closeProfile').onclick=()=>$('#profileModal').classList.add('hide');
$('#profileModal').onclick=e=>{if(e.target.id==='profileModal')$('#profileModal').classList.add('hide')};
$('#savePlayerName').onclick=()=>{S.playerName=$('#playerName').value.trim().slice(0,24)||'Player';save(false);renderProfile();toast('Player name saved')};
function unlockedLoadoutSlots(){return S.playerLevel>=10?6:S.playerLevel>=5?5:4;}
function toggleEquip(uid){
  if(G&&!G.over)return toast("Change your loadout between matches.");
  if(!S.units.some(u=>u.uid===uid))return;
  S.equipped=Array.isArray(S.equipped)?S.equipped:[];
  if(S.equipped.includes(uid))S.equipped=S.equipped.filter(id=>id!==uid);
  else if(S.equipped.length>=unlockedLoadoutSlots())return toast("Only "+unlockedLoadoutSlots()+" slots unlocked. Slot 5 unlocks at Level 5; slot 6 at Level 10.");
  else S.equipped.push(uid);
  save(false);renderAll();
}
function renderLoadout(){
  const slots=document.getElementById("loadoutSlots");if(!slots)return;
  const equipped=(S.equipped||[]).map(uid=>S.units.find(u=>u.uid===uid)).filter(Boolean);
  const available=unlockedLoadoutSlots();
  document.getElementById("loadoutCount").textContent=equipped.length+"/"+available+" unlocked";
  slots.innerHTML=Array.from({length:6},(_,j)=>{const u=equipped[j];return j>=available?`<div class="card" style="opacity:.65;border:1px solid #776a43"><div style="font-size:30px">🔒</div><b>Slot ${j+1} Locked</b><p>Unlock at Player Level ${j===4?5:10}</p></div>`:u?`<div class="card"><canvas class="ico" width="72" height="64" data-id="${u.id}" data-trait="${u.trait||''}"></canvas><b class="${UNITS[u.id].r}"></b><br><small>Slot ${j+1} · Lv ${u.lv}</small><br><button class="alt" data-remove="${u.uid}">Remove</button></div>`:`<div class="card" style="opacity:.65"><b>Slot ${j+1}</b><p>Empty</p></div>`}).join("");
  slots.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>toggleEquip(+b.dataset.remove));
  equipped.forEach((u,j)=>{slots.querySelectorAll(".card b")[j].textContent=u.nickname||UNITS[u.id].n});
}
function showUnitInfo(uid){
  const inst=S.units.find(i=>i.uid===uid);if(!inst)return;
  const unit=UNITS[inst.id],desc=typeof unit.ability==='string'?unit.ability.trim():'';
  const modal=$('#unitInfoModal');
  $('#unitInfoName').textContent=unit.n+' — Skills & Passives';
  $('#unitInfoBody').textContent=desc;
  $('#unitInfoBody').classList.toggle('hide',!desc);
  modal.classList.remove('hide');
}
$('#closeUnitInfo').onclick=()=>$('#unitInfoModal').classList.add('hide');
$('#unitInfoModal').addEventListener('click',e=>{if(e.target.id==='unitInfoModal')e.currentTarget.classList.add('hide')});
function renderAll(){
  const order=Object.keys(UNITS);
  setupUnitSort('collectionSort','collection',renderAll);const list=sortedOwnedUnits(S.units,unitSortSettings.collection);
  $('#coll').innerHTML=list.length?list.map(i=>{
    const u=UNITS[i.id],t=stats(i),can=i.lv>=100&&i.st<maxPrestigeStars(i.id);
    return '<div class="card unit-card"><button class="unit-fav'+(i.favorite?' active':'')+'" data-fav="'+i.uid+'" title="Toggle favorite">'+(i.favorite?'♥':'♡')+'</button><canvas class="ico" width="72" height="64" data-id="'+i.id+'" data-trait="'+(i.trait||'')+'"></canvas><b class="'+u.r+'">'+u.n+'</b>'+(i.nickname?'<br><span class="unit-nickname"></span>':'')+'<br><span style="color:#ffc94d">'+'★'.repeat(i.st)+'☆'.repeat(Math.max(0,maxPrestigeStars(i.id)-i.st))+'</span><br><span style="color:'+TYPES[u.t]+'">'+u.t+'</span>, level '+i.lv+(i.lv<100?'<br>EXP '+Math.floor(i.xp).toLocaleString()+' / '+need(i.lv,i.st,i.id).toLocaleString():'<br>Max level')+'<br>Damage '+t.d.toFixed(0)+', range '+t.rg.toFixed(0)+'<br>Attacks per second '+(1/t.cd).toFixed(1)+'<br>Trait: '+(TRAITS[i.trait]?.n||'None')+(can?'<br><button data-p="'+i.uid+'">Prestige</button>':'')+'<div class="unit-actions"><button class="alt" data-info="'+i.uid+'" title="Unit skills and passives" aria-label="Information about '+u.n+'">ⓘ Info</button><button class="alt" data-equip="'+i.uid+'">'+((S.equipped||[]).includes(i.uid)?'✓ Equipped · Remove':'＋ Equip')+'</button><button class="alt" data-lock="'+i.uid+'">'+(i.locked?'🔒 Unlock':'🔓 Lock')+'</button><button class="alt" data-sell="'+i.uid+'"'+(i.locked?' disabled title="Unlock before selling"':'')+'>Sell for '+sellVal(i)+' gems</button></div></div>';
  }).join(''):'<span style="color:var(--mut)">No units yet. Summon some to get started.</span>';
  $('#coll').querySelectorAll('.card').forEach((card,j)=>{const i=list[j];if(i.locked)card.classList.add('unit-locked');const nick=card.querySelector('.unit-nickname');if(nick)nick.textContent=i.nickname;});
  $('#coll').querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>showUnitInfo(+b.dataset.info));
  $('#coll').querySelectorAll('[data-fav]').forEach(b=>b.onclick=()=>toggleUnitFavorite(+b.dataset.fav));
  $('#coll').querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>toggleEquip(+b.dataset.equip));
  renderLoadout();
  $('#coll').querySelectorAll('[data-lock]').forEach(b=>b.onclick=()=>{const u=S.units.find(u=>u.uid===+b.dataset.lock);if(!u)return;u.locked=!u.locked;save(false);renderAll();toast(u.locked?'Unit locked':'Unit unlocked');});
  $('#coll').querySelectorAll('button[data-p]').forEach(b=>b.onclick=()=>prestige(+b.dataset.p));
  $('#coll').querySelectorAll('button[data-sell]').forEach(b=>b.onclick=()=>sell(+b.dataset.sell));
  renderProfile();renderModes();renderBag();renderIndex();renderItemIndex();renderSummonPool();renderTraits();paintIcons();renderStageCards();
}

/* ---------- Map selection cards (2026.10.11.4) ---------- */
const stageThumbs=[];let stageThumbBusy=false;
function renderStageCards(){
  const el=$('#stages');if(!el)return;
  el.innerHTML=STAGES.map((s,i)=>{
    const locked=i>S.cleared,cleared=i<S.cleared;
    const starRow=n=>[0,1,2].map(k=>'<span class="ms-star'+(k<n?' on':'')+'">★</span>').join('');
    const ratings=['easy','medium','hard','hell'].map(mode=>{const stars=S.stageStars?.[stageStarKey(i,mode)]||0;return '<span class="mode-stars'+(curMode===mode?' active':'')+(stars===3?' perfect':'')+'" title="'+MODES[mode].n+': '+stars+' of 3 stars"><span class="ms-label">'+MODES[mode].n+'</span><span class="ms-stars">'+starRow(stars)+'</span></span>';}).join('');
    const curStars=curMode==='infinite'?-1:(S.stageStars?.[stageStarKey(i,curMode)]||0);
    return '<button type="button" class="stage-card'+(locked?' locked':'')+(cleared?' cleared':'')+'" data-s="'+i+'"'+(locked?' disabled':'')+' aria-label="'+s.n+(locked?' (locked)':'')+'">'
      +'<span class="stage-thumb"><img alt="" data-thumb="'+i+'"'+(stageThumbs[i]?' src="'+stageThumbs[i]+'"':'')+'><span class="stage-num">'+(i+1)+'</span>'+(curStars>=0&&!locked?'<span class="stage-stars-big" aria-label="'+curStars+' of 3 stars on '+MODES[curMode].n+'"><span class="sb-mode">'+MODES[curMode].n+'</span>'+starRow(curStars)+'</span>':'')+(cleared?'<span class="stage-badge">✓ Cleared</span>':'')+(locked?'<span class="stage-lock">🔒</span>':'')+'</span>'
      +'<span class="stage-body"><strong>'+s.n+'</strong><span class="stage-food"><canvas class="ico stage-fruit" width="72" height="64" data-item="'+s.food+'"></canvas>Drops '+ITEMS[s.food].n+'</span><span class="mode-star-grid">'+ratings+'</span>'
      +(autoPlayEligible(i,curMode)?'<small style="color:#86efac">▶ Auto Play unlocked</small>':'')+(curMode==='infinite'?'<small>∞ Infinite mode selected</small>':'')+(locked?'<small style="color:#fca5a5">Clear '+STAGES[i-1].n+' to unlock</small>':'')+'</span></button>';
  }).join('');
  el.querySelectorAll('button[data-s]').forEach(b=>b.onclick=()=>startBattle(+b.dataset.s,curMode));
  const hint=$('#stageModeHint');if(hint)hint.textContent='Difficulty: '+(MODE_STYLE[curMode]?MODE_STYLE[curMode].i+' ':'')+MODES[curMode].n+' (change it with the cards above). Tap a map to start.';
  el.querySelectorAll('canvas.stage-fruit').forEach(k=>{if(k.width===72){k.width=288;k.height=256;}const c=k.getContext('2d');c.setTransform(4,0,0,4,0,0);c.clearRect(0,0,72,64);itemArt(c,k.dataset.item,36,32,1.5);c.setTransform(1,0,0,1,0,0);});
  paintEnemyLegend();queueStageThumbs();
}
function queueStageThumbs(){
  if(stageThumbBusy||typeof GGA==='undefined')return;stageThumbBusy=true;let i=0;
  const next=()=>{while(i<STAGES.length&&stageThumbs[i]!=null)i++;if(i>=STAGES.length){stageThumbBusy=false;return;}
    try{const bg=GGA.mapBackground(GGA.STAGE_THEME[i]||'meadow',STAGES[i].path);const k=document.createElement('canvas');k.width=320;k.height=180;k.getContext('2d').drawImage(bg,0,0,320,180);stageThumbs[i]=k.toDataURL('image/jpeg',.82);}catch(e){stageThumbs[i]='';}
    document.querySelectorAll('img[data-thumb="'+i+'"]').forEach(img=>{if(stageThumbs[i])img.src=stageThumbs[i];});i++;setTimeout(next,40);};
  setTimeout(next,80);
}
let enemyLegendPainted=false;
function paintEnemyLegend(){
  if(enemyLegendPainted||typeof GGA==='undefined')return;enemyLegendPainted=true;
  document.querySelectorAll('canvas[data-enemy]').forEach(k=>{const c=k.getContext('2d'),kind=k.dataset.enemy;c.clearRect(0,0,k.width,k.height);c.save();const s=kind==='boss'?1.25:1.7;c.translate(40,kind==='boss'?52:46);c.scale(s,s);GGA.drawEnemy(c,kind,0,0,0,1);c.restore();});
}
/* ---------- Team-matched enemy strength (2026.10.11.4) ----------
   Average equipped damage-per-second (incl. level, prestige stars and traits) is compared with
   a "fair" power for the map and difficulty. Only teams far stronger than the content face
   tougher enemies; beginner teams (power below 2.5) are never scaled. The extra health ramps
   up over the waves so early placement is always possible. */
// Every map (and every harder difficulty) must stay at least as hard as the previous one, even after
// team scaling: the effective enemy health on this map/mode is capped by the effective health of
// every later map and harder mode.
function teamPowerScale(si,mode,raidLevel){
  if(raidLevel||mode==='infinite')return teamPowerScaleRaw(si,mode,raidLevel);
  const order=['easy','medium','hard','hell'],r=order.indexOf(mode);if(r<0)return teamPowerScaleRaw(si,mode,raidLevel);
  const base=(i,m)=>STAGES[i].hp*stageDifficulty(i)*MODES[m].hp;
  let eff=base(si,mode)*teamPowerScaleRaw(si,mode,0);
  for(let j=si;j<STAGES.length;j++)for(let k=r;k<order.length;k++){if(j===si&&k===r)continue;eff=Math.min(eff,base(j,order[k])*teamPowerScaleRaw(j,order[k],0));}
  return Math.max(1,eff/base(si,mode));
}
function teamPowerScaleRaw(si,mode,raidLevel){
  const ps=(S.equipped||[]).map(uid=>S.units.find(u=>u.uid===uid)).filter(i=>i&&UNITS[i.id]&&UNITS[i.id].d>0).map(i=>{const s=stats(i);return (s.d/s.cd)/25;});
  if(!ps.length)return 1;
  const power=ps.reduce((a,b)=>a+b,0)/ps.length;
  const modeF={easy:1,medium:1.8,hard:3,hell:5,infinite:1.4}[mode]||1;
  const fair=raidLevel?0.8*Math.pow(1.446,10)*5*raidScale(raidLevel):0.8*Math.pow(1.446,si)*modeF;
  const threshold=Math.max(2.5,fair*1.5);
  return Math.min(25,Math.pow(Math.max(1,power/threshold),1.25));
}
// ---------- Enemy abilities (2026.10.11.8) ----------
// New enemy classes and boss phases. Damage from every unit is applied first, then
// enemyAbilitiesPost() lets shields absorb it, so every attack in the game works with shields.
const ENEMY_INFO={
  shield:{n:'Crystal Shellback',from:4,hp:1.15,v:34,desc:'Crystal shield absorbs damage first; when it breaks the Shellback is stunned'},
  flyer:{n:'Gloomwing',from:5,hp:.7,v:74,desc:'Flies: immune to slow, freeze and stun'},
  healer:{n:'Moss Shaman',from:6,hp:.85,v:40,desc:'Heals nearby enemies every 3 seconds'},
  splitter:{n:'Gloop',from:7,hp:1.25,v:36,desc:'Splits into two fast Glooplings when defeated'},
  dasher:{n:'Shadow Lynx',from:8,hp:.95,v:46,desc:'Dashes forward along the road every 4 seconds'},
  berserk:{n:'Ember Brute',from:9,hp:1.5,v:36,desc:'Gets faster as it loses health (up to +90%)'},
  gloopling:{n:'Gloopling',from:99,hp:.3,v:70,desc:'Small, fast piece of a Gloop'},
  burrower:{n:'Tide Crab',from:11,hp:1.3,v:40,desc:'Dives under the sand every 5 seconds and takes no damage while submerged'}
};
const ENEMY_ORDER=['shield','flyer','healer','splitter','dasher','berserk','burrower'];
function enemyClassesFor(si,raid){return ENEMY_ORDER.filter(k=>raid||si>=ENEMY_INFO[k].from);}
function efx(kind,x,y,extra){(G.efx=G.efx||[]).push(Object.assign({kind,x,y,l:.6,max:.6},extra||{}));if(G.efx.length>60)G.efx.shift();}
function spawnExtraEnemy(kind,hp,d,wave){
  const [x,y]=posAt(Math.max(0,d));const info=ENEMY_INFO[kind];
  const e={wave,d:Math.max(0,d),hp,mx:hp,kind,boss:false,v:(info?info.v:({elite:57,tank:27,runner:105}[kind]||44))*(.95+Math.random()*.1),sl:0,x,y,_hp0:hp};
  G.en.push(e);
  if(G.mode==='infinite'&&G.waveRemaining&&wave!=null&&G.waveRemaining[wave]!=null)G.waveRemaining[wave]++;
  return e;
}
function enemyAbilitiesPre(dt){
  for(const fx of (G.efx||[]))fx.l-=dt;if(G.efx)G.efx=G.efx.filter(f=>f.l>0);
  for(const e of G.en){
    if(e.hp<=0)continue;
    if(e._init!==1){e._init=1;e.v0=e.v;
      if(e.kind==='shield'){e.shield=e.shMax=e.mx*.6;}
      if(e.kind==='healer')e.healT=1.5+Math.random();
      if(e.kind==='dasher')e.dashT=2+Math.random()*2;
      if(e.kind==='burrower')e.subT=2+Math.random()*2;
      if(e.boss){e.phase=0;}
      logEnemy(e.kind,'s');
    }
    if(e.kind==='flyer'){e.sl=0;e.frozen=0;e.stunned=0;}
    if(e.kind==='burrower'){e.submerged=Math.max(0,(e.submerged||0)-dt);if(!(e.frozen>0||e.stunned>0)){e.subT-=dt;if(e.subT<=0){e.subT=5;e.submerged=1.5;efx('dive',e.x,e.y,{l:.5,max:.5});}}}
    if(e.kind==='berserk'){const lost=1-Math.max(0,e.hp/e.mx);e.v=e.v0*(1+.9*lost);e.rage=lost;}
    if(e.kind==='dasher'&&!(e.frozen>0||e.stunned>0)){e.dashT-=dt;if(e.dashT<=0){e.dashT=4;const from=[e.x,e.y];e.d=Math.min(G.tot-1,e.d+70);[e.x,e.y]=posAt(e.d);efx('dash',e.x,e.y,{fx:from[0],fy:from[1],l:.35,max:.35});}}
    if(e.kind==='healer'&&!(e.frozen>0||e.stunned>0)){e.healT-=dt;if(e.healT<=0){e.healT=3;let healed=false;
      for(const o of G.en)if(o.hp>0&&o!==e&&o.hp<o.mx&&Math.hypot(o.x-e.x,o.y-e.y)<=85){o.hp=Math.min(o.mx,o.hp+o.mx*(o.boss?.03:.1));healed=true;}
      if(healed)efx('heal',e.x,e.y,{l:.7,max:.7});}}
    if(e.boss){
      const pct=e.hp/e.mx;
      // Boss phases: summon guards and raise a dark ward at 66% and 33% health; enrage below 25%.
      const marks=e.kind==='miniboss'?[.5]:[.66,.33];
      while(e.phase<marks.length&&pct<=marks[e.phase]){
        e.phase++;const n=e.kind==='miniboss'?2:3,kind=e.kind==='miniboss'?'elite':'normal';
        for(let i=0;i<n;i++)spawnExtraEnemy(kind,e.mx*(e.kind==='miniboss'?.12:.06),e.d-14-i*14,e.wave);
        e.shield=(e.shield||0)+e.mx*.12;e.shMax=Math.max(e.shMax||0,e.shield);
        efx('summon',e.x,e.y,{l:.9,max:.9});if(typeof ggSfx==='function')ggSfx('wave');
      }
      if(!e.enraged&&pct<=.25&&e.kind==='boss'){e.enraged=true;e.v*=1.35;efx('rage',e.x,e.y,{l:.9,max:.9});}
    }
  }
  for(const e of G.en)e._hp0=e.hp;
}
function enemyAbilitiesPost(){
  // 2026.10.11.11: submerged Tide Crabs ignore damage; upgrade-path effects (Executioner, auras,
  // Arcane slow, Shieldbreaker); shields absorb damage; floating damage numbers.
  const born=[],auras=G.us.filter(u=>u.path==='warchest'||u.path==='empower');
  for(const e of G.en){
    if(e.leak||e._hp0==null)continue;
    let dmg=e._hp0-e.hp;
    if(dmg>0){
      if(e.submerged>0){e.hp=e._hp0;if(!e._immT||G.time-e._immT>.7){e._immT=G.time;ggDamagePopup(e,'IMMUNE','text','#9be7ff');}continue;}
      const att=e.lastHitUid!=null?G.us.filter(u=>u.uid===e.lastHitUid):[];
      let extra=0;
      if(att.length){
        if(att.some(u=>u.path==='exec')&&e._hp0<=e.mx*.3)extra+=dmg*.6;
        if(auras.length){let bonus=0;for(const a of auras)if(att.some(u=>u!==a&&Math.hypot(u.x-a.x,u.y-a.y)<=a.rg))bonus=Math.max(bonus,a.path==='warchest'?.1:.08);extra+=dmg*bonus;}
        if(att.some(u=>u.path==='arcane'))e.sl=Math.max(e.sl||0,.8);
      }
      if(extra>0){e.hp-=extra;dmg+=extra;}
      let shieldHit=0;
      if(e.shield>0){
        const pierce=att.some(u=>u.path==='pierce')?3:1,take=Math.min(e.shield,dmg*pierce),restore=take/pierce;
        e.shield-=take;e.hp+=restore;dmg-=restore;shieldHit=take;
        if(e.shield<=0.001){e.shield=0;if(e.kind==='shield'){e.stunned=Math.max(e.stunned||0,1);}efx('shatter',e.x,e.y);ggDamagePopup(e,'SHIELD BROKEN!','text','#7dd3fc');}
      }
      ggCollectDamage(e,Math.max(0,dmg),shieldHit);
    }
    e._hp0=e.hp;
    if(e.hp<=0&&e.kind==='splitter'&&!e.split){e.split=true;born.push(e);}
  }
  for(const e of born){for(const off of[6,-8])spawnExtraEnemy('gloopling',e.mx*ENEMY_INFO.gloopling.hp,e.d+off,e.wave);efx('split',e.x,e.y);}
}
function enemyFxRender(){
  for(const e of G.en){
    if(e.hp<=0)continue;
    const r=(typeof GGA!=='undefined'&&GGA.ENEMY_LOOK[e.boss?'boss':e.kind]?GGA.ENEMY_LOOK[e.boss?'boss':e.kind].r:11);
    if(e.shield>0&&e.shMax){
      cx.save();cx.globalAlpha=.28+.1*Math.sin(performance.now()/200);cx.fillStyle='#8fe9ff';cx.beginPath();cx.ellipse(e.x,e.y-4,r+5,r+8,0,0,7);cx.fill();
      cx.globalAlpha=.9;cx.strokeStyle='#c9f6ff';cx.lineWidth=1.4;cx.stroke();cx.restore();
      const p=Math.max(0,Math.min(1,e.shield/e.shMax));cx.fillStyle='#0b0f1c';cx.fillRect(e.x-13,e.y-r-22,26,3);cx.fillStyle='#67e8f9';cx.fillRect(e.x-13,e.y-r-22,26*p,3);
    }
    if(e.kind==='berserk'&&e.rage>.2){cx.save();cx.globalAlpha=Math.min(.6,e.rage*.7);const g=cx.createRadialGradient(e.x,e.y-4,2,e.x,e.y-4,r+10);g.addColorStop(0,'rgba(255,120,40,.8)');g.addColorStop(1,'rgba(255,60,20,0)');cx.fillStyle=g;cx.beginPath();cx.arc(e.x,e.y-4,r+10,0,7);cx.fill();cx.restore();}
    if(e.submerged>0){cx.save();cx.globalAlpha=.85;cx.fillStyle='#3a9fb0';cx.beginPath();cx.ellipse(e.x,e.y+2,r+6,r*.75,0,0,7);cx.fill();cx.globalAlpha=1;cx.strokeStyle='#bff4ff';cx.lineWidth=1.6;cx.beginPath();cx.ellipse(e.x,e.y+2,r+6+2*Math.sin(performance.now()/150),r*.75,0,0,7);cx.stroke();cx.fillStyle='#e6fbff';for(let i=0;i<3;i++){const t=(performance.now()/400+i/3)%1;cx.globalAlpha=1-t;cx.beginPath();cx.arc(e.x-6+i*6,e.y-4-t*14,1.6,0,7);cx.fill();}cx.restore();}
    if(e.enraged){cx.save();cx.globalAlpha=.35+.2*Math.sin(performance.now()/120);cx.strokeStyle='#ff2a4a';cx.lineWidth=3;cx.beginPath();cx.ellipse(e.x,e.y+r*.8,r+8,6,0,0,7);cx.stroke();cx.restore();}
  }
  for(const f of (G.efx||[])){
    const t=1-f.l/f.max;cx.save();cx.globalAlpha=Math.max(0,1-t);
    if(f.kind==='heal'){cx.strokeStyle='#7dff8a';cx.lineWidth=3;cx.beginPath();cx.arc(f.x,f.y-4,10+75*t,0,7);cx.stroke();
      cx.fillStyle='#b8ffbf';cx.font='bold 12px sans-serif';cx.textAlign='center';cx.fillText('+',f.x-8,f.y-18-14*t);cx.fillText('+',f.x+9,f.y-24-14*t);}
    else if(f.kind==='shatter'){for(let i=0;i<8;i++){const a=i*.785;cx.fillStyle=i%2?'#c9f6ff':'#67e8f9';cx.beginPath();cx.arc(f.x+Math.cos(a)*20*t,f.y-6+Math.sin(a)*20*t,3*(1-t)+1,0,7);cx.fill();}}
    else if(f.kind==='dash'){cx.strokeStyle='#a678ff';cx.lineWidth=5*(1-t)+1;cx.setLineDash([6,5]);cx.beginPath();cx.moveTo(f.fx,f.fy);cx.lineTo(f.x,f.y);cx.stroke();}
    else if(f.kind==='dive'){cx.strokeStyle='#bff4ff';cx.lineWidth=3*(1-t)+.5;cx.beginPath();cx.ellipse(f.x,f.y+2,8+26*t,4+10*t,0,0,7);cx.stroke();}
    else if(f.kind==='split'){cx.fillStyle='#3ed6a6';for(let i=0;i<6;i++){const a=i*1.05;cx.beginPath();cx.arc(f.x+Math.cos(a)*16*t,f.y+Math.sin(a)*10*t,3,0,7);cx.fill();}}
    else if(f.kind==='summon'||f.kind==='rage'){cx.strokeStyle=f.kind==='rage'?'#ff2a4a':'#b06bff';cx.lineWidth=4;cx.beginPath();cx.arc(f.x,f.y-6,12+50*t,0,7);cx.stroke();
      cx.fillStyle='#fff';cx.font='bold 13px sans-serif';cx.textAlign='center';cx.strokeStyle='#000';cx.lineWidth=3;const txt=f.kind==='rage'?'ENRAGED!':'GUARDS!';cx.strokeText(txt,f.x,f.y-34-10*t);cx.fillText(txt,f.x,f.y-34-10*t);}
    cx.restore();
  }
}
function enemyWaveScale(){const sc=G&&G.teamScale||1;if(sc<=1)return 1;const full=G.raidLevel?raidMaxWave(G.raidLevel):15;return 1+(sc-1)*Math.min(1,G.wave/full);}

/* ---------- AFK rewards ---------- */
// AFK rewards accrue only while this screen is open. No offline earnings.
// performance.now() avoids rewards from manually changing the system clock.
const AFK_INTERVAL=60000;
let afkActive=false,afkStart=0,afkPaid=0,afkGems=0,afkRerolls=0;
function afkPendingUI(){
  const label='Unclaimed: '+S.afkPendingGems+' gems · '+S.afkPendingRerolls+' trait rerolls';
  $('#afkPending').textContent=label;
  $('#afkStoredSummary').textContent=label;
  $('#claimAfk').disabled=$('#claimAfkOutside').disabled=S.afkPendingGems===0&&S.afkPendingRerolls===0;
}
function claimAfkRewards(silent=false){
  if(!S.afkPendingGems&&!S.afkPendingRerolls)return;
  const gems=S.afkPendingGems,rerolls=S.afkPendingRerolls;
  S.gems+=gems;S.traitRerolls+=rerolls;
  S.afkPendingGems=0;S.afkPendingRerolls=0;afkPendingUI();gemUI();save(false);
  if(!silent)toast('Claimed '+gems+' gems and '+rerolls+' trait rerolls!');
}
$('#claimAfk').onclick=()=>{afkUpdate();claimAfkRewards();};
$('#claimAfkOutside').onclick=()=>claimAfkRewards();
// Keep the screen awake while the AFK overlay is visible. Browsers may revoke
// the lock on visibility changes, low battery, or system power restrictions.
let afkWakeLock=null,afkWakeRequesting=false,afkWakeRetry=null;
// One shared screen wake lock covers AFK mode and fullscreen battles.
function battleWakeWanted(){return !!($('#arena').classList.contains('map-fullscreen') && G && !G.over);}
function screenWakeWanted(){return afkActive || battleWakeWanted();}
function updateBattleWakeStatus(message){
  const el=$('#battleWakeStatus');if(!el)return;
  el.textContent=message;
  el.title='Android/browser battery restrictions can still turn the screen off.';
}
function ensureScreenWakeRetry(){
  if(afkWakeRetry!==null)return;
  afkWakeRetry=setInterval(()=>{if(screenWakeWanted() && document.visibilityState==='visible' && !afkWakeLock)requestAfkWakeLock();},15000);
}
function syncScreenWake(){
  if(!screenWakeWanted()){releaseAfkWakeLock();updateBattleWakeStatus('');return;}
  ensureScreenWakeRetry();requestAfkWakeLock();
}
function afkWakeStatus(message){
  const status=$('#afkWakeStatus');
  if(!status)return;
  status.textContent='Screen-awake status: '+message;
  status.dataset.state=/active ✓/.test(message)?'active':/unavailable/i.test(message)?'unavailable':/Could not|released/i.test(message)?'error':'checking';
}
function stopAfkWakeRetry(){if(afkWakeRetry!==null){clearInterval(afkWakeRetry);afkWakeRetry=null;}}
async function requestAfkWakeLock(){
  if(!screenWakeWanted() || document.visibilityState!=='visible')return;
  if(afkWakeLock){if(afkActive)afkWakeStatus('Screen-awake protection active ✓');updateBattleWakeStatus('☀ Screen awake: Active ✓');return;}
  if(afkWakeRequesting)return;
  if(!window.isSecureContext || !('wakeLock' in navigator)){
    if(afkActive)afkWakeStatus('Unavailable here. Open the installed HTTPS game in Brave or Chrome and tap Retry.');updateBattleWakeStatus('☀ Screen awake: Unavailable');return;
  }
  afkWakeRequesting=true;
  try{
    const lock=await navigator.wakeLock.request('screen');
    if(!screenWakeWanted() || document.visibilityState!=='visible'){await lock.release();return;}
    afkWakeLock=lock;
    lock.addEventListener('release',()=>{
      if(afkWakeLock!==lock)return;
      afkWakeLock=null;
      if(screenWakeWanted()){
        if(afkActive)afkWakeStatus('Screen-awake protection was released. Tap Retry if your screen dims.');
        updateBattleWakeStatus('☀ Screen awake: Reconnecting…');
        // Some Android browsers release the lock on focus changes; try to reacquire.
        if(document.visibilityState==='visible')setTimeout(requestAfkWakeLock,700);
      }
    });
    if(afkActive)afkWakeStatus('Screen-awake protection active ✓');
    updateBattleWakeStatus('☀ Screen awake: Active ✓');
  }catch(err){
    if(afkActive)afkWakeStatus('Could not keep screen awake (battery saver/browser restriction). Tap Retry.');
    updateBattleWakeStatus('☀ Screen awake: Blocked (check battery saver)');
  }finally{afkWakeRequesting=false;}
}
function releaseAfkWakeLock(){
  stopAfkWakeRetry();
  const lock=afkWakeLock;afkWakeLock=null;
  if(lock)lock.release().catch(()=>{});
}
$('#retryAfkWake').onclick=()=>requestAfkWakeLock();

function afkUpdate(){
  if(!afkActive)return;
  const elapsed=Math.max(0,performance.now()-afkStart);
  const due=Math.floor(elapsed/AFK_INTERVAL);
  // Process elapsed minutes even if browser timers were throttled in background.
  while(afkPaid<due){
    afkPaid++;
    const gems=5+Math.floor(Math.random()*6);
    const reroll=Math.random()<0.05?1:0;
    S.afkPendingGems+=gems;S.afkPendingRerolls+=reroll;
    save(false);
    afkGems+=gems;afkRerolls+=reroll;
    $('#afkLatest').textContent='+'+gems+' gems'+(reroll?' · +1 trait reroll!':'');
  }
  afkPendingUI();
  const remaining=Math.max(0,Math.ceil((AFK_INTERVAL-(elapsed%AFK_INTERVAL))/1000));
  $('#afkCountdown').textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');
  $('#afkSession').textContent='Session: '+afkGems+' gems · '+afkRerolls+' trait rerolls · '+afkPaid+' rewards';
}
function leaveAfk(){
  if(!afkActive)return;
  afkUpdate();afkActive=false;syncScreenWake();
  // Leaving AFK forfeits any incomplete 60-second cycle.
  const completed=afkPaid;afkStart=0;afkPaid=0;
  $('#afkCountdown').textContent='01:00';
  $('#afkOverlay').classList.add('hide');
  $('#afkSummary').textContent='Last AFK session: '+afkGems+' gems, '+afkRerolls+' trait rerolls in '+completed+' reward cycles. Rewards remain unclaimed until you press Claim Rewards.';
  afkPendingUI();
  save(false);renderAll();
}
$('#enterAfk').onclick=()=>{
  if(afkActive)return;
  afkActive=true;afkStart=performance.now();afkPaid=0;afkGems=0;afkRerolls=0;afkPendingUI();
  $('#afkLatest').textContent='';$('#afkOverlay').classList.remove('hide');afkWakeStatus('Requesting screen-awake protection…');afkUpdate();syncScreenWake();
};
$('#exitAfk').onclick=leaveAfk;
setInterval(afkUpdate,1000);
document.addEventListener('visibilitychange',()=>{if(afkActive)afkUpdate();if(document.visibilityState==='visible')syncScreenWake();else if(afkActive)afkWakeStatus('Screen-awake protection paused while app is in background');});
window.addEventListener('focus',()=>{if(screenWakeWanted())syncScreenWake();});

/* ---------- Tabs ---------- */
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{
  // Switching to any other tab ends AFK and resets its reward countdown.
  if(b.dataset.tab!=='afk' && afkActive)leaveAfk();
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));
  if(b.dataset.tab==='raids')renderRaids();
  ['summon','battle','raids','units','afk','traits','index','bag'].forEach(t=>$('#'+t).classList.toggle('hide',b.dataset.tab!==t));
});

/* ---------- Battle ---------- */
const cv=$('#cv'),cx=cv.getContext('2d');
let G=null;
function showArena(v){$('#arena').classList.toggle('hide',!v)}
function dSeg(px,py,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1];let t=((px-a[0])*dx+(py-a[1])*dy)/(dx*dx+dy*dy);t=Math.max(0,Math.min(1,t));
  return Math.hypot(px-a[0]-t*dx,py-a[1]-t*dy);
}
// Per-unit-name battlefield limits; duplicates share the same rarity cap.
const PLACEMENT_CAPS={Common:5,Rare:4,Epic:3,Legendary:2,Mythic:2,Secret:1,Exclusive:3};
function unitPlacementCap(id){return PLACEMENT_CAPS[UNITS[id]?.r]??1}
function placedNameCount(id){return G?G.us.filter(u=>u.id===id).length:0}
function isMidas(uid){return S.units.find(i=>i.uid===uid)?.trait==='midas'}
function placementCost(inst){return Math.round(UNITS[inst.id].c*(isMidas(inst.uid)?.75:1))}
function boostCost(u){return Math.round(UNITS[u.id].c*.8*u.bl*(isMidas(u.uid)?.75:1))}
function midasIncomeMultiplier(uid,boost){return isMidas(uid)?1.5+.25*(boost-1):1}
// Prestige stars of a placed unit (cached on the placed copy; stars cannot change mid-battle).
function prestigeStars(u){if(u._st==null){const inst=S.units.find(i=>i.uid===u.uid);u._st=Math.max(0,Math.min(5,Number(inst?.st)||0));}return u._st;}
// Barter's 3★/5★ perk: a flat bonus on every payout.
function barterStarBonus(u){const s=prestigeStars(u);return s>=5?15:s>=3?5:0;}
function barterPrestigeMultiplier(uid){const inst=S.units.find(i=>i.uid===uid);return 1+Math.max(0,Math.min(5,Number(inst?.st)||0))*.10}

function refreshPlacementBar(){
  if(!G)return;
  document.querySelectorAll('#bar .card[data-uid]').forEach(card=>{
    const inst=S.units.find(u=>u.uid===Number(card.dataset.uid));if(!inst)return;
    const count=placedNameCount(inst.id),max=unitPlacementCap(inst.id);
    card.classList.toggle('off',count>=max);
    let badge=card.querySelector('.placement-count');
    if(!badge){badge=document.createElement('small');badge.className='placement-count';card.appendChild(badge)}
    badge.textContent='Placed '+count+'/'+max;badge.title='Placed '+count+' of '+max+' (the limit counts every copy of the same unit)';
  });
}
function autoPlayEligible(si,mode,raidLevel=0){
  return !raidLevel&&mode!=='infinite'&&S.playerLevel>=5&&(S.stageStars?.[stageStarKey(si,mode)]||0)>=3;
}
function startBattle(si,mode,raidLevel=0){
  if(raidLevel&&S.playerLevel<25)return toast('Raids unlock at Player Level 25.');
  if(raidLevel&&(raidLevel<1||raidLevel>5||raidLevel>S.raidCleared+1))return toast('This raid level is locked.');
  if(!(S.equipped||[]).some(uid=>S.units.some(u=>u.uid===uid)))return toast('Equip at least one unit in Units before starting a match');
  const p=(raidLevel?RAID_MAPS.duskmoor:STAGES[si]).path,L=[];let tot=0;
  for(let i=1;i<p.length;i++){const l=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);L.push(l);tot+=l}
  G={si,L,tot,raidLevel,raidKills:0,lives:STARTING_LIVES,coins:500,wave:0,q:[],sp:0,run:false,over:false,en:[],us:[],fx:[],sel:null,pl:null,speed:1,boss:false,mode,hpm:STAGES[si].hp*stageDifficulty(si)*MODES[mode].hp*(raidLevel?raidScale(raidLevel):1),ig:0,fg:0,paused:false,autoUpgrade:false,autoUpgradeTimer:0,autoPlay:false,autoPlayTimer:0,waveSpawnCountdown:null,restartTimer:0};
  G.teamScale=teamPowerScale(si,mode,raidLevel);
  $('#bAutoPlay').textContent=autoPlayEligible(si,mode,raidLevel)?'Auto Play: OFF':(raidLevel?'🔒 Auto Play (regular maps only)':S.playerLevel<5?'🔒 Auto Play (Player Lv 5)':'🔒 Auto Play (3★ required)');
  $('#bAutoPlay').disabled=!autoPlayEligible(si,mode,raidLevel);
  $('#bAutoPlay').setAttribute('aria-pressed','false');
  $('#bAutoUpgrade').textContent='Auto Upgrade: OFF';$('#bAutoUpgrade').setAttribute('aria-pressed','false');
  $('#bWave').classList.remove('hide');$('#bWave').disabled=false;$('#bWave').textContent='Start wave';
  hideQuick();$('#msg').classList.add('hide');$('#battleOutcome').className='hide';$('#battleOutcomeTitle').textContent='';['#battleOutcomeStars','#battleOutcomeSub','#battleOutcomeRewards','#battleOutcomeNote'].forEach(q=>{const el=$(q);if(el)el.innerHTML='';});$('#bNextMap').classList.add('hide');$('#bSpd').textContent='Speed x1';$('#bPause').textContent='Pause';
  $('#bar').innerHTML=(S.equipped||[]).map(uid=>S.units.find(u=>u.uid===uid)).filter(Boolean).map(i=>{const u=UNITS[i.id];
    return '<div class="card" data-uid="'+i.uid+'" style="cursor:pointer"><canvas class="ico" width="72" height="64" data-id="'+i.id+'" data-trait="'+(i.trait||'')+'"></canvas><b class="'+u.r+'">'+u.n+'</b><span class="dock-cost">'+ggIcon('coin')+' '+u.c+'</span><span class="dock-det"><br><span style="color:#ffc94d">'+'★'.repeat(i.st)+'</span> level '+i.lv+'<br><span style="color:'+TYPES[u.t]+'">'+u.t+'</span>, '+u.c+' coins</span></div>'}).join('');paintIcons();
  $('#bar').querySelectorAll('.card').forEach(c=>c.onclick=()=>{
    const uid=+c.dataset.uid,i=S.units.find(x=>x.uid===uid);
    if(placedNameCount(i.id)>=unitPlacementCap(i.id)) return toast('Placement limit reached for '+UNITS[i.id].n+' ('+unitPlacementCap(i.id)+')');
    G.pl=uid;G.sel=null;hideQuick();
    $('#bar').querySelectorAll('.card').forEach(x=>x.classList.toggle('sel',x===c));
    $('#selp').textContent='Placing '+UNITS[i.id].n+' (level '+i.lv+'). Click the map to build it (not on the path).';
  });
  $('#selp').textContent='Pick a unit above to place it. Tap a placed unit for its nearby upgrade menu.';
  showArena(true);hud();refreshPlacementBar();
  if(typeof GGA!=='undefined'){try{GGA.mapBackground(artThemeKey(),battleStage().path);GGA.unitPad(artThemeKey());}catch(e){console.warn('Map art unavailable',e)}}
}
// All allied summoners use the same route: player base (end of enemy path)
// toward the enemy entrance (start of enemy path), including winding raid maps.
function summonPathAlly(owner,elite,hp,damage,offset=0){
  if(!G)return;
  G.allies=G.allies||[];
  const d=Math.max(0,G.tot-8-Math.max(0,offset));
  const [x,y]=posAt(d);
  G.allies.push({owner,elite,d,x,y,life:hp,maxLife:hp,damage,cooldown:0,ttl:Math.max(35,G.tot/105+8),speed:elite?125:145});
}
function posAt(d){
  const p=battleStage().path;let i=0;
  while(i<G.L.length-1&&d>G.L[i]){d-=G.L[i];i++}
  const a=p[i],b=p[i+1],t=Math.min(1,d/G.L[i]);
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
}
function hud(){if(G)$('#hud').textContent=(G.raidLevel?'Duskmoor Castle · Raid Level '+G.raidLevel+' · ':'')+'Wave '+G.wave+(G.mode==='infinite'?'':'/'+(G.raidLevel?raidMaxWave(G.raidLevel):15))+'   '+MODES[G.mode].n+'   Lives '+G.lives+'   Coins '+G.coins+'   Units '+G.us.length+((G.teamScale||1)>1.05?'   Enemy ×'+enemyWaveScale().toFixed(1):'')}
function nextWave(force=false){
  if(!G||G.over||(G.run&&!force)) return;
  G.wave++;G.run=true;
  if(G.wave>=2)$('#bWave').classList.add('hide');
  else {$('#bWave').disabled=true;$('#bWave').textContent='Wave started';}G.boss=G.raidLevel?G.wave===raidMaxWave(G.raidLevel):G.mode==='infinite'?G.wave%10===0:G.wave===15;
  const n=Math.min(110,5+3*G.wave+Math.floor(G.wave*G.wave/14)),hp=24*G.hpm*Math.pow(1.24,G.wave)*enemyWaveScale(); // 2026.10.11.11: +9% to balance upgrade paths
  // Each map introduces enemy classes progressively: Map 1 normal, Map 2 tanks,
  // Map 3 runners, Map 4 elites; later maps use the classes introduced so far.
  // Boss waves always end with one elite, then the boss exactly 3 seconds later.
  const available=['normal'];
  if(G.si>=1||G.raidLevel)available.push('tank');
  if(G.si>=2||G.raidLevel)available.push('runner');
  if(G.si>=3||G.raidLevel)available.push('elite');
  // 2026.10.11.8: one new enemy class per map from Map 5 (raids use all of them).
  available.push(...enemyClassesFor(G.si,!!G.raidLevel));
  const miniBoss=!!G.raidLevel&&G.wave%10===0&&!G.boss;
  const ordinaryCount=G.boss?Math.max(0,n-2):miniBoss?Math.max(0,n-1):n;
  G.q=Array.from({length:ordinaryCount},(_,i)=>{
    const kind=available[(i+G.wave)%available.length];
    const hpMult={tank:3,runner:.65,elite:1.8,normal:1}[kind]??(ENEMY_INFO[kind]?ENEMY_INFO[kind].hp:1);
    return {hp:hp*hpMult,kind};
  });
  if(G.boss){
    G.q.push({hp:hp*1.8,kind:'elite'});
    G.q.push({hp:hp*7,kind:'boss',delayBefore:3});
  }
  if(miniBoss)G.q.push({hp:hp*5.5,kind:'miniboss'});
  // Count all enemies belonging to this wave, including enemies not yet spawned.
  if(G.mode==='infinite'){G.waveRemaining=G.waveRemaining||{};G.waveRewarded=G.waveRewarded||{};G.waveRemaining[G.wave]=G.q.length;}
  G.sp=0;G.waveSpawnCountdown=null;hud();
}
$('#bWave').onclick=()=>{
  // A manual click can only start the first wave once per battle.
  if(!G||G.over||G.wave!==0)return;
  nextWave();
};
$('#bNextMap').onclick=()=>{
  if(!G||!G.over||!G.victory||G.raidLevel||G.mode==='infinite'||G.si+1>=STAGES.length)return;
  const next=G.si+1,mode=G.mode;
  if(next>S.cleared)return toast('Complete the previous map to unlock the next map.');
  startBattle(next,mode);
  toast('Next map: '+STAGES[next].n+' · '+MODES[mode].n);
};
$('#bSpd').onclick=()=>{if(!G)return;G.speed=G.speed%3+1;G.manualSpeed=true;G.autoSpeed=false;$('#bSpd').textContent='Speed x'+G.speed;if(G.autoPlay)toast('Speed set manually: Auto Play will keep Speed x'+G.speed+' for this battle.')};
$('#bPause').onclick=()=>{if(!G||G.over)return;G.paused=!G.paused;$('#bPause').textContent=G.paused?'Resume':'Pause'};
function upgradePlacedUnit(u){
  if(!G||G.over||u.bl>=5)return false;
  const cost=boostCost(u);
  if(G.coins<cost)return false;
  G.coins-=cost;u.spent+=cost;u.bl++;u.d*=1.35;u.rg+=4;
  hud();if(G.sel===u)selUI();return true;
}

// Smart Auto Play: deterministic tactical planner using actual battle resources.
function autoPlaySupport(inst){return UNITS[inst.id].d<=0||inst.id==='eternity';}
function autoPlayCoverage(x,y,r){
  const path=battleStage().path;let coverage=0;
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let j=0;j<=10;j++){
      const t=j/10,px=a[0]+(b[0]-a[0])*t,py=a[1]+(b[1]-a[1])*t;
      if(Math.hypot(x-px,y-py)<=r)coverage+=length/11*(1.12-t*.12);
    }
  }
  return coverage;
}
function autoPlayPosition(inst){
  const U=UNITS[inst.id],range=stats(inst).rg,support=autoPlaySupport(inst);
  const isEconomy=inst.id==='barter';
  let best=null,bestScore=-Infinity;
  for(let y=35;y<=415;y+=20)for(let x=35;x<=765;x+=20){
    if(G.us.some(u=>Math.hypot(u.x-x,u.y-y)<36))continue;
    if(battleStage().path.some((p,i)=>i>0&&dSeg(x,y,battleStage().path[i-1],p)<35))continue;
    const coverage=autoPlayCoverage(x,y,range);
    let score=coverage;
    if(isEconomy){
      // Keep money generators away from prime firing positions and enemy path.
      score=90-coverage*.55+Math.min(...battleStage().path.slice(1).map((p,i)=>dSeg(x,y,STAGES[G.si].path[i],p)))*.09;
      score-=G.us.filter(u=>u.id==='barter'&&Math.hypot(u.x-x,u.y-y)<95).length*30;
    }else if(support){
      // Cluster buff/heal supports close to several damage towers, not alone.
      const allies=G.us.filter(u=>UNITS[u.id].d>0);
      const boosted=allies.reduce((sum,u)=>sum+(Math.hypot(u.x-x,u.y-y)<=range?u.d/Math.max(.1,u.cd):0),0);
      score=boosted*1.8+coverage*.18;
      if(!allies.length)score=-1000;
    }else{
      // Favor high-coverage chokepoints; spread damage coverage across the path.
      const covered=G.us.filter(u=>UNITS[u.id].d>0).reduce((n,u)=>n+(Math.hypot(u.x-x,u.y-y)<Math.min(range,u.rg)*.85?1:0),0);
      score=coverage-covered*24;
      if(G.en.length){
        const pressure=G.en.reduce((sum,e)=>sum+(Math.hypot(x-e.x,y-e.y)<range?Math.min(e.hp,stats(inst).d*5):0),0);
        score+=Math.min(80,pressure/Math.max(1,stats(inst).d)*6);
      }
    }
    score-=Math.abs(x-400)*.0001;
    if(score>bestScore){bestScore=score;best={x,y};}
  }
  return bestScore>0?best:null;
}
// ---------- Tactician Auto Play AI (2026.10.11.5) ----------
// Plans with a cached map analysis: every candidate build spot knows how much of the road
// (and which part of it) each attack range would cover. Each tick it compares placing a new
// unit against upgrading an existing one by expected damage gained per coin, reacts to danger
// by defending the end of the road, saves up briefly for clearly better options, and manages
// game speed (×3 calm, ×2 pressure, ×1 danger/boss) unless the player sets the speed manually.
function aiMap(){
  if(G.ai&&G.ai.map)return G.ai.map;
  const path=battleStage().path,samples=[];let tot=0;
  for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let s=0;s<l;s+=10){const t=s/l;samples.push({x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,d:tot+s});}tot+=l;}
  const visible=samples.filter(p=>p.x>=-5&&p.x<=805&&p.y>=-5&&p.y<=455);
  for(const p of visible)p.f=Math.max(0,Math.min(1,p.d/G.tot));
  const spots=[];
  for(let y=34;y<=416;y+=16)for(let x=34;x<=766;x+=16){
    if(path.some((p,i)=>i>0&&dSeg(x,y,path[i-1],p)<35))continue;
    const dist=new Float32Array(visible.length);let near=1e9;
    for(let k=0;k<visible.length;k++){const dd=Math.hypot(x-visible[k].x,y-visible[k].y);dist[k]=dd;if(dd<near)near=dd;}
    spots.push({x,y,dist,near});
  }
  G.ai.map={samples:visible,spots};return G.ai.map;
}
function aiThreat(){let lead=0;for(const e of G.en)if(e.hp>0)lead=Math.max(lead,e.d/G.tot);return lead;}
// Weight of a road sample: normal play values the whole road with a bias toward the castle end;
// in danger the last stretch matters most; slow/freeze units prefer the first half.
function aiWeight(f,role,danger){
  if(danger)return .25+1.9*f*f;
  if(role==='slow')return 1.35-.7*f;
  return .8+.45*f;
}
function aiRole(id){const U=UNITS[id];if(id==='barter')return 'economy';if(U.d<=0||id==='eternity')return 'support';if(U.slow||['chrono_warden','chronos','witch','xenowarden','mage','leviathan','druid'].includes(id))return 'slow';return 'damage';}
function aiCoverage(spot,range,role,danger,coverCount){
  const S2=G.ai.map.samples;let v=0;
  for(let k=0;k<S2.length;k++)if(spot.dist[k]<=range){const w=aiWeight(S2[k].f,role,danger);v+=coverCount?w/(1+.18*coverCount[k]):w;}
  return v*10; // ≈ weighted road length in pixels
}
function aiCoverCounts(){
  const S2=G.ai.map.samples,cnt=new Float32Array(S2.length);
  for(const u of G.us){if(u.d<=0)continue;for(let k=0;k<S2.length;k++){if(Math.hypot(u.x-S2[k].x,u.y-S2[k].y)<=u.rg)cnt[k]++;}}
  return cnt;
}
function aiUnitDps(id,d,cd){const U=UNITS[id];let m=1;if(U.splash)m*=1.35;if(['cosmos','abyss','dragonlord','worldtree','starlord','rift_blade','abyss_summoner','alucard'].includes(id))m*=1.4;return d/Math.max(.1,cd)*m;}
function aiBestSpot(inst,role,danger,cnt){
  const key=inst.uid+'|'+danger+'|'+G.us.length+'|'+G.us.reduce((a,u)=>a+u.x*3+u.y,0);
  G.ai.spotCache=G.ai.spotCache||{};if(G.ai.spotCache[key]!==undefined)return G.ai.spotCache[key];
  const r=aiBestSpotCompute(inst,role,danger,cnt);G.ai.spotCache[key]=r;
  if(Object.keys(G.ai.spotCache).length>200)G.ai.spotCache={};return r;
}
function aiBestSpotCompute(inst,role,danger,cnt){
  const st=stats(inst),spots=G.ai.map.spots;let best=null,bestV=-1;
  for(const sp of spots){
    if(G.us.some(u=>Math.hypot(u.x-sp.x,u.y-sp.y)<36))continue;
    let v;
    if(role==='economy'){ // keep prime firing spots free: prefer spots that cover little road
      v=1000-aiCoverage(sp,140,'damage',false)-sp.near*.2;if(sp.near<45)v-=200;
    }else if(role==='support'){
      const allies=G.us.filter(u=>u.d>0);v=allies.reduce((s,u)=>s+(Math.hypot(u.x-sp.x,u.y-sp.y)<=st.rg?aiUnitDps(u.id,u.d,u.cd):0),0);
    }else v=aiCoverage(sp,st.rg,role,danger,cnt);
    if(v>bestV){bestV=v;best=sp;}
  }
  return best?{x:best.x,y:best.y,v:bestV}:null;
}
function aiRemainingWaves(){return G.mode==='infinite'?12:Math.max(0,(G.raidLevel?raidMaxWave(G.raidLevel):15)-G.wave);}
function aiOptions(danger){
  const cnt=aiCoverCounts(),opts=[];
  const equipped=(S.equipped||[]).map(uid=>S.units.find(u=>u.uid===uid)).filter(Boolean);
  const dmgPlaced=G.us.filter(u=>u.d>0).length,barters=G.us.filter(u=>u.id==='barter');
  const remaining=aiRemainingWaves();
  for(const inst of equipped){
    if(placedNameCount(inst.id)>=unitPlacementCap(inst.id))continue;
    const role=aiRole(inst.id),cost=placementCost(inst);
    if(role==='economy')continue; // handled by aiEconomy() (return on investment)
    if(role==='support'&&dmgPlaced<2)continue;
    const pos=aiBestSpot(inst,role,danger,cnt);if(!pos)continue;
    const st=stats(inst);
    let value=role==='support'?pos.v*.25:aiUnitDps(inst.id,st.d,st.cd)*pos.v/100;
    if(!dmgPlaced&&role!=='support')value*=4;
    opts.push({type:'place',inst,pos,cost,score:value/Math.pow(cost,.9)});
  }
  for(const u of G.us){
    if(u.bl>=5)continue;const cost=boostCost(u),role=aiRole(u.id);
    let score;
    if(role==='economy')continue;
    else if(role==='support'){const near=G.us.filter(v=>v.d>0&&Math.hypot(v.x-u.x,v.y-u.y)<=u.rg);score=near.reduce((s,v)=>s+aiUnitDps(v.id,v.d,v.cd),0)*.05/Math.pow(cost,.9);if(!near.length)continue;}
    else{const sp={dist:G.ai.map.samples.map(p=>Math.hypot(u.x-p.x,u.y-p.y))};const cov=aiCoverage(sp,u.rg+4,role,danger,null);score=aiUnitDps(u.id,u.d,u.cd)*.35*cov/100/Math.pow(cost,.9);}
    opts.push({type:'upgrade',u,cost,score});
  }
  return opts.sort((a,b)=>b.score-a.score);
}
// Barter economics: coins per second at a boost level, and return on investment for the
// remaining battle time. Income is taken first whenever it pays back at least twice.
function aiBarterRate(bl){const bonus=bl<=1?0:5*(Math.pow(1.1,bl-2)-1)/.1;return Math.round(10+bonus)/Math.max(1,6-bl);}
function aiEconomy(danger){
  if(danger||G.mode==='infinite'&&G.wave>40)return null;
  const secsLeft=aiRemainingWaves()*28;if(secsLeft<40)return null;
  const dmgPlaced=G.us.filter(u=>u.d>0).length;if(!dmgPlaced)return null;
  const opts=[];
  for(const u of G.us)if(u.id==='barter'&&u.bl<5){const cost=boostCost(u),gain=(aiBarterRate(u.bl+1)-aiBarterRate(u.bl))*secsLeft;opts.push({type:'upgrade',u,cost,roi:gain/cost});}
  const inst=(S.equipped||[]).map(uid=>S.units.find(x=>x.uid===uid)).find(i=>i&&i.id==='barter');
  if(inst&&placedNameCount('barter')<unitPlacementCap('barter')&&dmgPlaced>=Math.min(2,1+G.us.filter(u=>u.id==='barter').length)){
    const cost=placementCost(inst),pos=aiBestSpot(inst,'economy',false,null);
    if(pos)opts.push({type:'place',inst,pos,cost,roi:aiBarterRate(1)*secsLeft/cost});}
  opts.sort((a,b)=>b.roi-a.roi);const best=opts[0];
  return best&&best.roi>=2?best:null;
}
function aiDo(o){
  if(o.type==='upgrade')return upgradePlacedUnit(o.u);
  const inst=o.inst,U=UNITS[inst.id],st=stats(inst);
  if(G.coins<o.cost)return false;
  G.coins-=o.cost;
  G.us.push({summonTimer:5,chronoTimer:10,uid:inst.uid,id:inst.id,x:o.pos.x,y:o.pos.y,bl:1,pl:inst.lv,d:st.d,rg:st.rg,cd:st.cd,t:0,col:U.col,slow:U.slow,splash:U.splash,spent:o.cost});
  refreshPlacementBar();hud();return true;
}
function aiSpeed(danger,lead){
  if(!G.autoSpeed||G.manualSpeed)return;
  const bossOut=G.en.some(e=>e.boss);
  const want=(danger||bossOut&&lead>.35)?1:(lead>.45||G.lifeLostAt&&G.time-G.lifeLostAt<6)?2:3;
  if(want!==G.speed){G.speed=want;const b=$('#bSpd');if(b)b.textContent='Speed x'+want+' (Auto)';}
}
function tacticianTick(){
  if(!G||G.over||!G.autoPlay)return;
  G.ai=G.ai||{};aiMap();
  G.time=(G.time||0);
  if(G.ai.lastLives!=null&&G.lives<G.ai.lastLives)G.lifeLostAt=G.time;G.ai.lastLives=G.lives;
  const lead=aiThreat(),danger=lead>.8||(G.lifeLostAt!=null&&G.time-G.lifeLostAt<4);
  aiSpeed(danger,lead);
  // income estimate for "save up" decisions
  const now=G.time,c=G.coins+(G.ai.spentSince||0);
  if(G.ai.lastT!=null&&now>G.ai.lastT){const rate=(c-G.ai.lastC)/(now-G.ai.lastT);G.ai.rate=G.ai.rate==null?Math.max(0,rate):G.ai.rate*.8+Math.max(0,rate)*.2;}
  G.ai.lastT=now;G.ai.lastC=G.coins;G.ai.spentSince=0;
  for(let n=0;n<4;n++){
    const eco=aiEconomy(danger);
    if(eco){if(eco.cost<=G.coins){const spent=eco.cost;if(aiDo(eco)){G.ai.spentSince=(G.ai.spentSince||0)+spent;continue;}}
      else if(G.wave>0&&G.us.filter(u=>u.d>0).length>=2&&(eco.cost-G.coins)<=(G.ai.rate||0)*5)break;}
    const opts=aiOptions(danger);if(!opts.length)break;
    const best=opts[0],affordable=opts.find(o=>o.cost<=G.coins);if(!affordable)break;
    // Save for a clearly better option that will be affordable within ~6 s (never while in danger).
    if(best!==affordable&&!danger&&best.score>affordable.score*1.6&&(best.cost-G.coins)<=(G.ai.rate||0)*6)break;
    const spent=affordable.cost;if(!aiDo(affordable))break;G.ai.spentSince=(G.ai.spentSince||0)+spent;
  }
}

// Previous Smart Auto Play (kept for reference; no longer called by the battle loop).
function autoPlayBuild(){
  if(!G||G.over||!G.autoPlay)return false;
  const equipped=(S.equipped||[]).map(uid=>S.units.find(u=>u.uid===uid)).filter(Boolean);
  const candidates=equipped.filter(i=>placedNameCount(i.id)<unitPlacementCap(i.id)&&placementCost(i)<=G.coins);
  const damagePlaced=G.us.filter(u=>UNITS[u.id].d>0),barters=G.us.filter(u=>u.id==='barter');
  const incoming=G.en.length+G.q.length;
  const late=G.wave>=7;
  const options=[];
  for(const inst of candidates){
    const U=UNITS[inst.id],st=stats(inst),cost=placementCost(inst),support=autoPlaySupport(inst);
    if(inst.id==='barter'&&(late||barters.length>=3))continue;
    if(support&&inst.id!=='barter'&&damagePlaced.length===0)continue;
    const pos=autoPlayPosition(inst);if(!pos)continue;
    const dps=st.d/Math.max(.1,st.cd);
    let priority=dps*(1+Math.min(220,st.rg)/280)/Math.max(65,cost);
    if(inst.id==='barter'){
      priority=(!damagePlaced.length?0:barters.length===0?2.7:barters.length===1?1.6:.8);
      if(G.wave>=5)priority*=.35;
    }else if(support){
      const near=damagePlaced.filter(u=>Math.hypot(pos.x-u.x,pos.y-u.y)<=st.rg);
      priority=near.reduce((v,u)=>v+u.d/Math.max(.1,u.cd),0)/Math.max(90,cost)*.6;
      if(inst.id==='eternity')priority*=1.5;
    }
    if(!damagePlaced.length&&U.d>0)priority+=100;
    if(incoming>10&&U.d>0)priority*=1.5;
    options.push({inst,pos,priority,cost,st});
  }
  options.sort((a,b)=>b.priority-a.priority);
  const pick=options[0];if(!pick)return false;
  const {inst,pos,cost,st}=pick,U=UNITS[inst.id];
  G.coins-=cost;
  G.us.push({summonTimer:5,chronoTimer:10,uid:inst.uid,id:inst.id,x:pos.x,y:pos.y,bl:1,pl:inst.lv,d:st.d,rg:st.rg,cd:st.cd,t:0,col:U.col,slow:U.slow,splash:U.splash,spent:cost});
  refreshPlacementBar();hud();return true;
}
// Upgrade priorities consider actual damage, path coverage, special roles, and affordability.
function smartUpgradePriority(u){
  const cost=boostCost(u),coverage=autoPlayCoverage(u.x,u.y,u.rg);
  const pathLength=battleStage().path.reduce((sum,p,i,arr)=>i?sum+Math.hypot(p[0]-arr[i-1][0],p[1]-arr[i-1][1]):sum,0);
  const coverageRatio=Math.min(1,coverage/Math.max(1,pathLength));
  const damage=u.d/Math.max(.12,u.cd);
  const attacking=G.us.filter(v=>v.d>0);
  const near=attacking.filter(v=>Math.hypot(v.x-u.x,v.y-u.y)<=u.rg);
  const surroundingDps=near.reduce((sum,v)=>sum+v.d/Math.max(.12,v.cd),0);
  let value;
  if(u.id==='barter'){
    // Early economy upgrades compound over the remaining waves.
    const remaining=G.mode==='infinite'?Math.max(8,22-G.wave):Math.max(0,(G.raidLevel?raidMaxWave(G.raidLevel):15)-G.wave);
    value=remaining>4?(remaining*9+20):2;
  }else if(u.d>0){
    // Approximate the next upgrade's 35% damage gain across covered path.
    value=damage*.35*(.35+coverageRatio*1.4);
    if(u.splash)value*=1.22;
    if(u.slow)value*=1.12;
    if(G.en.length>8)value*=1.2;
    if(G.en.some(e=>e.boss))value*=1.15;
  }else{
    // Support units benefit only when they can influence nearby damage dealers.
    value=surroundingDps*(u.id==='eternity'?.16:.095);
    if(!near.length)value=0;
  }
  // Prioritize impactful upgrades per coin without ignoring powerful units.
  return value/Math.pow(Math.max(1,cost),.82);
}
function smartUpgradeChoice(){
  if(!G||G.over)return null;
  const affordable=G.us.filter(u=>u.bl<5&&boostCost(u)<=G.coins);
  // Absolute priority: upgrade every affordable income-generating Barter first.
  // Only once no affordable Barter upgrades remain do we consider damage/support.
  const income=affordable.filter(u=>u.id==='barter');
  const pool=income.length?income:affordable;
  return pool.sort((a,b)=>smartUpgradePriority(b)-smartUpgradePriority(a)||boostCost(a)-boostCost(b))[0]||null;
}
function autoPlayUpgrade(){
  if(!G||!G.autoPlay||G.over)return;
  const pick=smartUpgradeChoice();if(!pick)return;
  // Reserve money for early offensive placements when the board is underdeveloped.
  if(pick.id!=='barter'&&G.wave<=3&&G.us.filter(u=>u.d>0).length<2&&G.coins<boostCost(pick)+110)return;
  upgradePlacedUnit(pick);
}
$('#bAutoPlay').onclick=()=>{
  if(!G||G.over)return;
  if(!autoPlayEligible(G.si,G.mode,G.raidLevel))return toast('Auto Play requires Player Level 5 and a 3-star clear of this exact map and mode.');
  G.autoPlay=!G.autoPlay;G.autoPlayTimer=0;G.autoPlayStartDelay=0;
  if(!G.autoPlay){$('#bAutoUpgrade').textContent='Auto Upgrade: OFF';$('#bAutoUpgrade').setAttribute('aria-pressed','false');}
  if(G.autoPlay){G.pl=null;G.sel=null;hideQuick();G.autoUpgrade=false;G.autoUpgradeTimer=0;
    $('#bAutoUpgrade').textContent='Smart Upgrades: ON';$('#bAutoUpgrade').setAttribute('aria-pressed','true');
    G.autoSpeed=!G.manualSpeed;tacticianTick();if(G.wave===0)nextWave();
  }else{G.autoSpeed=false;$('#bSpd').textContent='Speed x'+G.speed;}
  $('#bAutoPlay').textContent='Auto Play: '+(G.autoPlay?'ON':'OFF');
  $('#bAutoPlay').setAttribute('aria-pressed',String(G.autoPlay));
  toast(G.autoPlay?'Tactician Auto Play enabled: placing, upgrading and choosing the speed automatically.':'Auto Play disabled.');
};

$('#bAutoUpgrade').onclick=()=>{
  if(!G||G.over)return;
  if(G.autoPlay)return toast('Smart Auto Play manages upgrades automatically.');
  G.autoUpgrade=!G.autoUpgrade;G.autoUpgradeTimer=0;
  $('#bAutoUpgrade').textContent='Auto Upgrade: '+(G.autoUpgrade?'ON':'OFF');
  $('#bAutoUpgrade').setAttribute('aria-pressed',String(G.autoUpgrade));
};
function setMapFullscreen(on){
  $('#arena').classList.toggle('map-fullscreen',on);
  $('#bFullMap').textContent=on?'⛶ Exit Fullscreen':'⛶ Fullscreen Map';
  if(!on&&document.fullscreenElement=== $('#arena'))document.exitFullscreen().catch(()=>{});
  if(on&&$('#arena').requestFullscreen)$('#arena').requestFullscreen().catch(()=>{});
  syncScreenWake();
  if(G&&G.sel)requestAnimationFrame(positionQuick);
}
$('#bFullMap').onclick=()=>setMapFullscreen(!$('#arena').classList.contains('map-fullscreen'));
// A single accessible edge tab can hide and restore the entire left loadout dock.
$('#battleDockToggle').onclick=()=>{
  const wrap=$('#battleDockToggle').parentElement;
  const closed=wrap.classList.toggle('dock-collapsed');
  const b=$('#battleDockToggle');
  b.textContent=closed?'▶':'◀';
  b.title=closed?'Show unit slots':'Hide unit slots';
  b.setAttribute('aria-label',b.title);
  b.setAttribute('aria-expanded',String(!closed));
};

document.addEventListener('fullscreenchange',()=>{
  if(!document.fullscreenElement&&$('#arena').classList.contains('map-fullscreen'))setMapFullscreen(false);
  else syncScreenWake();
});

$('#bQuit').onclick=()=>{
  if(G&&G.mode==='infinite'&&!G.over&&G.wave>0){finish(false);return}
  setMapFullscreen(false);G=null;hideQuick();showArena(false);
};

function hideQuick(){const q=$('#unitQuick');q.classList.add('hide');q.innerHTML=''}
function positionQuick(){
  if(!G||!G.sel){hideQuick();return}
  const q=$('#unitQuick'),u=G.sel,wrap=q.parentElement;
  const sx=wrap.clientWidth/800,sy=wrap.clientHeight/450;
  // Keep the panel alongside the tower, switching sides near the map edge.
  const panelW=q.offsetWidth||160,panelH=q.offsetHeight||120;
  const [screenX,screenY]=[u.x,u.y];
  let left=screenX*sx+23*sx;
  if(left+panelW>wrap.clientWidth-5)left=screenX*sx-23*sx-panelW;
  left=Math.max(4,Math.min(wrap.clientWidth-panelW-4,left));
  const centerY=Math.max(panelH/2+4,Math.min(wrap.clientHeight-panelH/2-4,screenY*sy));
  q.style.left=left+'px';q.style.top=centerY+'px';
}
function selUI(){
  const u=G&&G.sel;
  $('#selp').textContent='Tap a placed unit to inspect its live stats and boost it beside the unit.';
  if(!u){hideQuick();return}
  const cost=boostCost(u);
  const q=$('#unitQuick');q.classList.remove('hide');
  const owned=S.units.find(i=>i.uid===u.uid),base=UNITS[u.id];
  const fmt=n=>Number(n).toLocaleString(undefined,{maximumFractionDigits:1});
  const stat=(name,val)=>'<div class="quick-stat"><small>'+name+'</small><b>'+val+'</b></div>';
  const dps=u.d/Math.max(.1,u.cd);
  const nextD=u.d*1.35,nextRg=u.rg+4;
  q.innerHTML='<strong id="quickName"></strong>'
    +'<div class="quick-meta">'+base.r+' · '+base.t+' · Unit Lv '+(owned?owned.lv:u.pl)+'<br>Boost '+u.bl+'/5</div>'
    +'<div class="quick-stats">'
    +stat('Damage',fmt(u.id==='worldtree'?u.d*Math.max(0,1-.03*(G.us.length-1)):u.d))+stat('Range',u.id==='worldtree'?'∞':fmt(u.rg))
    +stat('Attack interval',fmt(u.cd)+'s')+stat('Damage / sec',fmt(dps))
    +'</div>'
    +(u.bl>=5?'<div class="quick-max">★ MAX BOOST 5/5 — Final upgrade stats</div>'
      :'<div class="quick-next">Next boost: '+fmt(nextD)+' DMG · '+fmt(nextRg)+' range</div>')
    +(u.id==='barter'?'<div class="quick-meta">Merchant income: +'+Math.round((10+(u.bl<=1?0:5*(Math.pow(1.1,u.bl-2)-1)/.1))*midasIncomeMultiplier(u.uid,u.bl)*barterPrestigeMultiplier(u.uid))+' coins every '+Math.max(1,6-u.bl)+' second(s) · +10% per Barter prestige star (permanent)</div>':'')
    +(u.id==='starlord'?'<div class="quick-meta">Astral Ricochet: hits 4 additional enemies · each bounce loses 10% of original damage</div>':'')
    +(u.id==='eternity'?'<div class="quick-meta">Eternal Blessing: alternates +20% damage and +25% attack speed for nearby units · lasts 7.5s · recasts every '+(15-1.5*(u.bl-1))+'s</div>':'')
    +(u.id==='xenowarden'?'<div class="quick-meta">Triune Wards: every 2s · max 3 active · 3s duration · Slow 5s (50% speed) · Stun / Freeze 0.5s</div>':'')
    +(isMidas(u.uid)?'<div class="quick-meta">✦ Midas: +'+Math.round((midasIncomeMultiplier(u.uid,u.bl)-1)*100)+'% kill/production coins · 25% cheaper placement and boosts</div>':'')
    +(u.id==='cosmos'?'<div class="quick-meta">3 mud piles · 30% damage · 5s duration · cooldown '+Math.max(1,5-(u.bl-1))+'s</div>':'')
    +(u.id==='abyss'?'<div class="quick-meta">2 Hell Wolves every 15s · 125% damage each</div>':'')
    +(u.id==='worldtree'?'<div class="quick-meta">Infinite range · -3% damage per other placed unit (minimum 0%)</div>':'')
    +(u.id==='dragonlord'?'<div class="quick-meta">AOE on every hit'+(u.bl===5?' · Burns path 5s every 8s':' · MAX unlocks burning path')+'</div>':'')
    +(u.id==='abyss_summoner'?'<div class="quick-meta">'+(u.bl>=5?'2 Elite Ghouls every 5s · each 150% DMG / 125% HP':'3 shadow monsters every 5s')+'</div>':'')
    +'<button id="bUp"'+(u.bl>=5?' disabled':'')+'>'+(u.bl>=5?'✓ Max boost':'⬆ Boost · '+cost+' coins')+'</button>'
    +'<button class="alt" id="bSell">Sell · '+Math.floor(u.spent/2)+' coins</button>';
  $('#quickName').textContent=(owned&&owned.nickname)||base.n;
  $('#bUp').onclick=()=>{
    if(!upgradePlacedUnit(u))toast('Not enough coins or already max boosted');
  };
  $('#bSell').onclick=()=>{G.coins+=Math.floor(u.spent/2);G.us=G.us.filter(x=>x!==u);G.sel=null;hud();selUI();refreshPlacementBar()};
  positionQuick();
}
window.addEventListener('resize',()=>{if(G&&G.sel)positionQuick()});
cv.onclick=e=>{
  if(!G||G.over||G.autoPlay) return;
  const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;
  const hit=G.us.find(u=>Math.hypot(u.x-x,u.y-y)<18);
  if(hit){G.sel=hit;G.pl=null;$('#bar').querySelectorAll('.card').forEach(c=>c.classList.remove('sel'));selUI();return}
  if(!G.pl){G.sel=null;selUI();return}
  const inst=S.units.find(x=>x.uid===G.pl),U=UNITS[inst.id],t=stats(inst);
  if(placedNameCount(inst.id)>=unitPlacementCap(inst.id)) return toast(UNITS[inst.id].n+' has reached its '+unitPlacementCap(inst.id)+' placement limit');
  if(G.coins<placementCost(inst)) return toast('Not enough coins');
  const p=battleStage().path;
  for(let i=1;i<p.length;i++) if(dSeg(x,y,p[i-1],p[i])<30) return toast("You can't build on the path");
  G.coins-=placementCost(inst);
  hideQuick();G.us.push({summonTimer:5,chronoTimer:10,uid:inst.uid,id:inst.id,x,y,bl:1,pl:inst.lv,d:t.d,rg:t.rg,cd:t.cd,t:0,col:U.col,slow:U.slow,splash:U.splash,spent:placementCost(inst)});G.pl=null;
  $('#bar').querySelectorAll('.card').forEach(x=>x.classList.remove('sel'));refreshPlacementBar();hud();
};
function finish(win){
  const M=MODES[G.mode],inf=G.mode==='infinite',fd=STAGES[G.si].food;
  G.over=true;syncScreenWake();G.victory=!!win;$('#bNextMap').classList.add('hide');const outcome=$('#battleOutcome');outcome.className=win?'victory':'defeat';$('#battleOutcomeTitle').textContent=win?'VICTORY':'DEFEAT';let m,first=false;
  const R={gems:0,food:0,foodId:fd,pxp:0,stars:0,best:0,drop:'',sub:'',unitXp:0,ups:[]};
  if(win&&G.raidLevel){
    const lv=G.raidLevel;
    S.raidCleared=Math.max(S.raidCleared,lv);
    const gems=100*lv;
    S.gems+=gems;
    let drop='';
    if(lv===5&&Math.random()<.05){
      const u={uid:S.nid++,id:'alucard',lv:1,xp:0,st:0,trait:'',nickname:'',locked:false};
      S.units.push(u);
      S.discovered=S.discovered||[];
      if(!S.discovered.includes('alucard'))S.discovered.push('alucard');
      drop=' SECRET DROP: Count Vesper obtained!';
    }
    gainPlayerExp(50);R.gems=gems;R.pxp=50;R.drop=drop.trim()||(lv===5?'Count Vesper drop roll: not obtained (5% chance)':'');R.sub='Duskmoor Castle · Raid Level '+lv+(lv<5?' · next level unlocked':'');
    m='Duskmoor Castle Raid Level '+lv+' cleared! +'+gems+' gems. '+(lv<5?'Next raid level unlocked. ':'')+(lv===5&&!drop?'Count Vesper drop roll: not obtained (5% chance).':'')+drop;
  }else if(win){
    first=S.cleared<=G.si;const g=25*M.mult,f=Math.ceil(2*M.mult);
    S.gems+=g;S.bag[fd]=(S.bag[fd]||0)+f;discoverItem(fd);S.cleared=Math.max(S.cleared,G.si+1);
    const stars=stageStars(G.lives),key=stageStarKey(G.si,G.mode);
    if(!inf)S.stageStars[key]=Math.max(S.stageStars[key]||0,stars);
    const playerXp=regularMapPlayerExp(G.si,G.mode);gainPlayerExp(playerXp);m='Stage cleared on '+M.n+'! '+(inf?'':('Rating: '+ '★'.repeat(stars)+'☆'.repeat(3-stars)+' (best: '+'★'.repeat(S.stageStars[key])+'☆'.repeat(3-S.stageStars[key])+'). '))+'You earned '+g+' gems, '+f+' '+ITEMS[fd].n+' and '+playerXp+' player EXP.';R.gems=g;R.food=f;R.pxp=playerXp;if(!inf){R.stars=stars;R.best=S.stageStars[key];}R.sub=STAGES[G.si].n+' · '+M.n+' · '+G.lives+'/'+STARTING_LIVES+' lives left';
  }else if(inf){R.gems=G.ig;R.food=G.fg;R.pxp=G.infinitePlayerXp||0;R.sub=STAGES[G.si].n+' · Infinite · reached wave '+G.wave;m='Run over at wave '+G.wave+'. This run earned '+G.ig+' gems, '+(G.infinitePlayerXp||0)+' player EXP and '+G.fg+' '+ITEMS[fd].n+'.';}
  else{S.gems+=10;R.gems=10;R.sub=(G.raidLevel?'Duskmoor Castle · Raid Level '+G.raidLevel:STAGES[G.si].n+' · '+M.n)+' · your base fell on wave '+G.wave;m='Your base fell. You earned 10 gems for trying.'}
  const bx=150+G.si*190;
  const xp=Math.round((inf?bx*G.wave/10:bx*M.xp*(win?1:.3*G.wave/10))*(first?1.5:1)),ups=[];
  G.us.forEach(u=>{const i=S.units.find(x=>x.uid===u.uid);if(!i)return;const b=i.lv;addXp(i,xp);if(i.lv>b)ups.push(UNITS[i.id].n+' '+b+' to '+i.lv)});
  m+=' Placed units earned '+xp+' EXP.'+(ups.length?' Level ups: '+ups.slice(0,4).join(', ')+(ups.length>4?' and more':'')+'.':'');
  R.unitXp=G.us.length?xp:0;R.ups=ups;
  $('#msg').textContent=m;
  // Rewards are shown on the Victory/Defeat card, directly under the header.
  if(document.getElementById('battleOutcomeRewards'))renderOutcomeCard(win,R,m);else $('#msg').classList.remove('hide');
  // Normal-map victories only: the next unlocked map keeps the same difficulty.
  // No next-map action for losses, raids, Infinite Mode, or the final map.
  if(win&&!G.raidLevel&&!inf&&G.si+1<STAGES.length&&G.si+1<=S.cleared){
    $('#bNextMap').classList.remove('hide');
  }

  save(false);gemUI();renderAll();
  if(S.settings.autoRestart){
    G.replayAutoPlay=!!G.autoPlay;
    G.restartTimer=3;
    G.restartSnapshot=G.us.map(u=>({uid:u.uid,x:u.x,y:u.y,bl:u.bl,path:u.path||''}));
    toast('Map restarting in 3 seconds');
    const note=$('#battleOutcomeNote');if(note)note.textContent='Auto restart: replaying this map in 3 seconds…';
  }
}
function renderOutcomeCard(win,R,m){
  const box=$('#battleOutcomeRewards'),st=$('#battleOutcomeStars'),sub=$('#battleOutcomeSub');
  sub.textContent=R.sub||'';
  st.innerHTML=win&&R.stars?[0,1,2].map(i=>'<span class="'+(i<R.stars?'on':'')+'" style="animation-delay:'+(.25+i*.18)+'s" aria-hidden="true">★</span>').join(''):'';
  const chip=(icon,label,i)=>'<div class="reward-chip" style="animation-delay:'+(.35+i*.08)+'s">'+icon+'<span>'+label+'</span></div>';
  const parts=[];let n=0;
  if(R.gems)parts.push(chip('<b class="ri gem">◆</b>','+'+R.gems+' gems',n++));
  if(R.food&&ITEMS[R.foodId])parts.push(chip('<canvas class="ico ri-can" width="72" height="64" data-item="'+R.foodId+'"></canvas>','+'+R.food+' '+ITEMS[R.foodId].n,n++));
  if(R.pxp)parts.push(chip('<b class="ri">▲</b>','+'+R.pxp+' player EXP',n++));
  if(R.unitXp)parts.push(chip('<b class="ri">⚔</b>','+'+R.unitXp+' unit EXP',n++));
  box.innerHTML=parts.join('')+(R.drop?'<div class="reward-drop">'+R.drop+'</div>':'')+(R.ups&&R.ups.length?'<div class="reward-ups">Level up: '+R.ups.slice(0,4).join(', ')+(R.ups.length>4?' and more':'')+'</div>':'')+(win&&R.stars?'<div class="reward-best">Best rating on '+MODES[G.mode].n+': '+'★'.repeat(R.best)+'☆'.repeat(3-R.best)+'</div>':'');
  box.setAttribute('aria-label',m);
  paintIcons();
}
function restartMap(){
  if(!G||!G.over)return;
  const {si,mode,raidLevel=0,restartSnapshot=[],replayAutoPlay=false}=G;
  const keepSpeed=G.speed||1,keepManual=!!G.manualSpeed;
  startBattle(si,mode,raidLevel);
  // Auto Restart keeps the battle speed that was active before the restart.
  G.speed=keepSpeed;G.manualSpeed=keepManual;$('#bSpd').textContent='Speed x'+G.speed;
  // Restore affordable placed units in original order; any unaffordable units remain available to place.
  for(const old of restartSnapshot){
    const inst=S.units.find(i=>i.uid===old.uid);if(!inst)continue;
    const U=UNITS[inst.id],t=stats(inst);
    if(G.coins<placementCost(inst)||placedNameCount(inst.id)>=unitPlacementCap(inst.id))continue;
    G.coins-=placementCost(inst);
    const u={summonTimer:5,chronoTimer:10,uid:inst.uid,id:inst.id,x:old.x,y:old.y,bl:1,pl:inst.lv,d:t.d,rg:t.rg,cd:t.cd,t:0,col:U.col,slow:U.slow,splash:U.splash,spent:placementCost(inst)};
    for(let j=1;j<old.bl;j++){
      const cost=boostCost(u);
      if(G.coins<cost)break;
      G.coins-=cost;u.spent+=cost;u.bl++;u.d*=1.35;u.rg+=4;
    }
    G.us.push(u);
    refreshPlacementBar();
  }
  if(replayAutoPlay&&S.settings.autoRestart&&autoPlayEligible(si,mode,raidLevel)){
    G.autoPlay=true;G.autoPlayTimer=0;G.autoPlayStartDelay=3;G.autoSpeed=!G.manualSpeed;
    G.autoUpgrade=false;
    $('#bAutoPlay').textContent='Auto Play: ON';
    $('#bAutoPlay').setAttribute('aria-pressed','true');
    toast('Auto Replay + Auto Play: next match begins in 3 seconds');
  }
  hud();

}
function grantTraitReroll(source, quantity=1){
  S.traitRerolls=(S.traitRerolls||0)+quantity;
  save(false);renderTraits();
  toast('+'+quantity+' Trait Reroll'+(quantity===1?'':'s')+'! '+source);
}
// Visual-only projectiles: damage is still resolved by the existing combat engine.
function shotStyle(u){
 const id=u.id,n=UNITS[id].n.toLowerCase(),a=(UNITS[id].ability||'').toLowerCase();
 if(id==='rift_blade')return 'rift';
 if(id==='chrono_warden')return 'ice';
 if(id==='pyro'||n.includes('pyromancer')||a.includes('firestorm'))return 'fireball';
 if(id==='monk'||n.includes('wandering monk'))return 'wind';
 if(id==='dragonlord'||n.includes('dragon emperor'))return 'dragonfire';
 if(n.includes('dragon')||a.includes('flame')||a.includes('fire'))return 'flame';
 if(n.includes('archer')||n.includes('ranger')||n.includes('sniper')||n.includes('hunter'))return 'arrow';
 if(n.includes('wizard')||n.includes('mage')||n.includes('witch')||n.includes('sorcer')||n.includes('oracle'))return 'magic';
 if(n.includes('alien')||n.includes('robot')||n.includes('cyber')||n.includes('laser'))return 'plasma';
 if(n.includes('ice')||n.includes('frost')||n.includes('snow'))return 'ice';
 if(n.includes('lightning')||n.includes('storm')||n.includes('thunder'))return 'lightning';
 if(n.includes('poison')||n.includes('venom')||n.includes('lizard'))return 'venom';
 if(n.includes('shadow')||n.includes('abyss')||n.includes('dark'))return 'shadow';
 if(n.includes('bird')||n.includes('phoenix'))return 'feather';
 if(UNITS[id].t==='Physical')return 'arrow';
 if(UNITS[id].t==='Magic')return 'magic';
 return 'pulse';
}
// Projectile family per unit: arrows, bullets, magic bolts, fire, frost, poison, void, light beams or melee slashes.
function attackFxKind(u){
 if(typeof GGA==='undefined')return null;
 const U=UNITS[u.id],n=U.n.toLowerCase(),st=shotStyle(u);
 if(['sniper','pirate','alucard','tinker'].includes(u.id))return 'bullet';
 if(st==='arrow'||st==='feather'){if(U.t==='Physical'&&!/archer|ranger|hunter|sniper|scout|falconer/.test(n))return 'slash';return 'arrow';}
 if(st==='pulse'&&U.t==='Ranged')return 'arrow';
 return {magic:'bolt',plasma:'bolt',ice:'frost',fireball:'fire',flame:'fire',dragonfire:'fire',venom:'poison',shadow:'void',pulse:'beam'}[st]||null;
}
function attackFxColor(u,fk){
 if(fk==='bolt')return shotStyle(u)==='plasma'?'#7cff6b':GGA.shade(UNITS[u.id].col||'#8fb8ff',.25);
 if(u.id==='alucard')return '#c08bff';if(u.id==='abyss_summoner')return '#ff2445';
 return {arrow:'#f4e6c8',bullet:'#ffd27a',poison:'#7cff6b',void:'#c084fc',beam:'#fff7c2'}[fk]||null;
}
function renderShot(f){
 if(f.fxk&&typeof GGA!=='undefined'){if(f.fxk!=='slash')GGA.drawProjectile(cx,f.fxk,f.a[0],f.a[1],f.b[0],f.b[1],Math.max(0,Math.min(1,1-f.l/f.max)),f.c2);return;}
 const t=1-f.l/f.max, x=f.a[0]+(f.b[0]-f.a[0])*t,y=f.a[1]+(f.b[1]-f.a[1])*t;
 const dx=f.b[0]-f.a[0],dy=f.b[1]-f.a[1],angle=Math.atan2(dy,dx);
 const palette={rift:['#fff0ff','#e45cff'],fireball:['#ffcf49','#f04417'],wind:['#d7fff5','#77e0d3'],dragonfire:['#fff16a','#fa2c0a'],flame:['#ffbd4c','#fa5424'],arrow:['#e8d6a3','#735039'],magic:['#e0b3ff','#934eff'],plasma:['#86faff','#1f91fc'],ice:['#f0ffff','#4dc8ff'],lightning:['#ffff8a','#b5a0ff'],venom:['#caff65','#52b829'],shadow:['#f368ab','#722154'],feather:['#fbe7a3','#f38a41'],pulse:['#ffffff',f.c||'#83baff']}[f.style]||['#fff','#99f'];
 cx.save();cx.globalAlpha=Math.min(1,f.l*12);cx.translate(x,y);cx.rotate(angle);
 cx.shadowBlur=f.style==='dragonfire'?19:10;cx.shadowColor=palette[1];
 if(f.style==='rift'){cx.strokeStyle=palette[0];cx.lineWidth=4;cx.beginPath();cx.arc(0,0,14,-1.25,1.25);cx.stroke();cx.strokeStyle=palette[1];cx.lineWidth=2;cx.beginPath();cx.arc(-3,0,11,-1.4,1.4);cx.stroke();}else if(f.style==='wind'){
   cx.strokeStyle=palette[0];cx.lineWidth=2.5;
   for(let k=-1;k<=1;k++){cx.beginPath();cx.moveTo(-15,k*5);cx.quadraticCurveTo(-4,k*5-8,9,k*5);cx.stroke()}
 }else if(f.style==='dragonfire'){
   for(let k=0;k<5;k++){const r=7+k*3;cx.fillStyle=k%2?palette[1]:palette[0];cx.beginPath();cx.ellipse(-k*8,Math.sin(k*2+t*12)*4,r,5+k,0,0,Math.PI*2);cx.fill()}
 }else if(f.style==='arrow'||f.style==='feather'){
   cx.strokeStyle=palette[0];cx.lineWidth=2.5;cx.beginPath();cx.moveTo(-13,0);cx.lineTo(12,0);cx.stroke();cx.fillStyle=palette[1];cx.beginPath();cx.moveTo(13,0);cx.lineTo(4,-5);cx.lineTo(4,5);cx.fill();
 }else if(f.style==='lightning'){
   cx.strokeStyle=palette[0];cx.lineWidth=3;cx.beginPath();cx.moveTo(-15,-5);cx.lineTo(-5,3);cx.lineTo(0,-5);cx.lineTo(12,3);cx.stroke();
 }else{
   const r=f.style==='fireball'?8:6;
   cx.fillStyle=palette[1];cx.beginPath();cx.arc(-4,0,r+3,0,7);cx.fill();
   cx.fillStyle=palette[0];cx.beginPath();cx.arc(3,0,r,0,7);cx.fill();
   if(f.style==='fireball'||f.style==='flame'){cx.fillStyle='#ff8b25';cx.beginPath();cx.moveTo(-5,-6);cx.lineTo(-20,0);cx.lineTo(-5,6);cx.fill()}
 }
 cx.restore();
}
// Mythic battlefield abilities. Ground effects use path distance so bends are supported.
function mythicGround(u,kind,count,duration,damage,spacing){
  G.ground=G.ground||[];
  for(let i=0;i<count;i++){
    const center=Math.max(0,Math.min(G.tot,(G.tot*(i+1)/(count+1))));
    G.ground.push({kind,owner:u.uid,d:center,radius:spacing,ttl:duration,tick:0,damage});
  }
}
function mythicAbilities(dt){
  G.ground=G.ground||[];G.wolves=G.wolves||[];G.xenoWards=G.xenoWards||[];
  for(const ward of G.xenoWards){
    ward.ttl-=dt;ward.pulse=(ward.pulse||0)-dt;
    if(ward.pulse<=0){
      ward.pulse=.25;
      for(const e of G.en){
        if(e.hp<=0||Math.abs(e.d-ward.d)>ward.radius)continue;
        if(ward.effect==='slow')e.sl=Math.max(e.sl||0,5);
        else if(ward.effect==='stun')e.stunned=Math.max(e.stunned||0,0.5);
        else e.frozen=Math.max(e.frozen||0,0.5);
      }
    }
  }
  G.xenoWards=G.xenoWards.filter(w=>w.ttl>0);
  for(const u of G.us){
    if(u.id==='xenowarden'){
      u.wardTimer=(u.wardTimer??0)-dt;
      if(u.wardTimer<=0){
        u.wardTimer+=2;
        const ownedWards=G.xenoWards.filter(w=>w.owner===u.uid);
        if(ownedWards.length<3){
          const target=G.en.filter(e=>e.hp>0&&Math.hypot(e.x-u.x,e.y-u.y)<=u.rg).sort((a,b)=>b.d-a.d)[0];
          const d=target?target.d:Math.max(0,Math.min(G.tot,G.tot*.25));
          const effect=['slow','stun','freeze'][(u.wardIndex||0)%3];u.wardIndex=(u.wardIndex||0)+1;
          G.xenoWards.push({owner:u.uid,d,radius:55,effect,ttl:3,pulse:0});
        }
      }
    }
    if(u.id==='cosmos'){
      u.mudTimer=(u.mudTimer??0)-dt;
      if(u.mudTimer<=0){u.mudTimer+=Math.max(1,5-(u.bl-1));mythicGround(u,'mud',3,5,u.d*.30,32);}
    }
    if(u.id==='abyss'){
      u.wolfTimer=(u.wolfTimer??0)-dt;
      if(u.wolfTimer<=0){u.wolfTimer+=15;
        for(let i=0;i<2;i++)G.wolves.push({owner:u.uid,d:Math.max(0,G.tot*.04),damage:u.d*1.25,offset:i*12,ttl:15});
      }
    }
    if(u.id==='dragonlord'&&u.bl===5){
      u.burnTimer=(u.burnTimer??0)-dt;
      if(u.burnTimer<=0){u.burnTimer+=8;
        const target=G.en.filter(e=>e.hp>0).sort((a,b)=>b.d-a.d)[0];
        if(target)G.ground.push({kind:'fire',owner:u.uid,d:target.d,radius:65,ttl:5,tick:0,damage:u.d*.35});
      }
    }
  }
  for(const g of G.ground){
    g.ttl-=dt;g.tick+=dt;
    while(g.tick>=.5){g.tick-=.5;
      for(const e of G.en)if(e.hp>0&&Math.abs(e.d-g.d)<=g.radius)e.hp-=g.damage*.5;
    }
  }
  G.ground=G.ground.filter(g=>g.ttl>0);
  for(const w of G.wolves){
    w.ttl-=dt;w.d+=175*dt;
    const victim=G.en.filter(e=>e.hp>0&&Math.abs(e.d-w.d)<19).sort((a,b)=>Math.abs(a.d-w.d)-Math.abs(b.d-w.d))[0];
    if(victim){victim.hp-=w.damage;w.ttl=0;if(S.settings.attackFx)G.fx.push({kind:'wolfhit',x:victim.x,y:victim.y,l:.35,max:.35});}
  }
  G.wolves=G.wolves.filter(w=>w.ttl>0&&w.d<G.tot);
}

// Character-specific Epic and Legendary auto-skills: limited periodic procs,
// intentionally weaker than Mythic battlefield abilities.
const RANKED_ATTACK_SKILLS = {"blade": [4, "splash", 0.3, 42], "sniper": [3, "burst", 0.35, 0], "mage": [4, "slow", 1.5, 0], "storm": [4, "chain", 0.3, 80], "assassin": [3, "burst", 0.4, 0], "ballista": [4, "chain", 0.3, 95], "witch": [4, "slow", 1.5, 0], "berserker": [3, "burst", 0.3, 0], "oracle": [4, "burst", 0.35, 0], "ranger": [4, "splash", 0.25, 55], "pyro": [4, "splash", 0.3, 50], "samurai": [3, "splash", 0.25, 42], "tinker": [4, "chain", 0.3, 80], "drake": [4, "splash", 0.3, 55], "dragon": [3, "splash", 0.55, 65], "warden": [4, "burst", 0.65, 0], "phoenix": [4, "splash", 0.5, 70], "titan": [4, "quake", 0.45, 75], "celestial": [3, "splash", 0.45, 65], "void": [4, "burst", 0.6, 0], "leviathan": [4, "tidal", 0.45, 80], "paladin": [4, "burst", 0.65, 0], "chronos": [4, "freeze", 0.75, 0], "seraph": [3, "chain", 0.45, 100], "reptileking": [4, "tidal", 0.4, 65]};
function applyRankedAttackSkill(u, target, hits){
  const skill=RANKED_ATTACK_SKILLS[u.id];
  if(!skill || hits%skill[0]!==0)return;
  const [,kind,power,radius]=skill;
  const others=G.en.filter(e=>e!==target&&e.hp>0);
  function strike(e,amount){e.hp-=amount;e.lastHitUid=u.uid;e.lastHitBoost=u.bl;}
  if(kind==='burst')strike(target,u.d*power);
  else if(kind==='slow')target.sl=Math.max(target.sl||0,power);
  else if(kind==='freeze')target.frozen=Math.max(target.frozen||0,power);
  else if(kind==='chain'){
    const e=others.filter(e=>Math.hypot(e.x-target.x,e.y-target.y)<=radius).sort((a,b)=>Math.hypot(a.x-target.x,a.y-target.y)-Math.hypot(b.x-target.x,b.y-target.y))[0];
    if(e)strike(e,u.d*power);
  }else{
    for(const e of others){
      if(Math.hypot(e.x-target.x,e.y-target.y)>radius)continue;
      strike(e,u.d*power);
      if(kind==='quake')e.stunned=Math.max(e.stunned||0,.5);
      if(kind==='tidal')e.sl=Math.max(e.sl||0,1.5);
    }
  }
  if(S.settings.attackFx)G.fx.push({kind:'riftburst',x:target.x,y:target.y,l:.22,max:.22});
}

function step(dt){
  G.time=(G.time||0)+dt;
  if(G.autoPlay){
    if(G.autoPlayStartDelay>0){G.autoPlayStartDelay=Math.max(0,G.autoPlayStartDelay-dt);}
    else {G.autoPlayTimer-=dt;if(G.autoPlayTimer<=0){G.autoPlayTimer=.4;tacticianTick();if(G.wave===0)nextWave();}}
  }
  // Choose the most valuable affordable upgrade using combat, support, and economy priorities.
  if(G.autoUpgrade){
    G.autoUpgradeTimer=(G.autoUpgradeTimer||0)-dt;
    if(G.autoUpgradeTimer<=0){
      G.autoUpgradeTimer=.3;
      const pick=smartUpgradeChoice();
      if(pick)upgradePlacedUnit(pick);
    }
  }
  if(G.q.length){G.sp-=dt;if(G.sp<=0){const spawn=G.q.shift();const kind=typeof spawn==='number'?'normal':spawn.kind,hp=typeof spawn==='number'?spawn:spawn.hp;G.en.push({wave:G.wave,d:0,hp,mx:hp,kind,boss:kind==='boss'||kind==='miniboss',v:kind==='boss'?32:kind==='miniboss'?37:kind==='tank'?27:kind==='runner'?105:kind==='elite'?57:ENEMY_INFO[kind]?ENEMY_INFO[kind].v*(.95+Math.random()*.1):44+Math.random()*18,sl:0,x:-30,y:-30});G.sp=G.q[0]?.delayBefore??.75;if(!G.q.length)G.waveSpawnCountdown=5;}}
  // Start the next wave 5 game-seconds after the final enemy of this wave is spawned.
  // The countdown is independent of whether earlier enemies are still alive.
  if(G.run&&G.waveSpawnCountdown!==null){
    G.waveSpawnCountdown-=dt;
    if(G.waveSpawnCountdown<=0){
      G.waveSpawnCountdown=null;
      if(G.mode==='infinite'){nextWave(true)}else if(G.wave<(G.raidLevel?raidMaxWave(G.raidLevel):15))nextWave(true);
    }
  }
  enemyAbilitiesPre(dt);
  for(const e of G.en){
    e.sl-=dt;e.frozen=Math.max(0,(e.frozen||0)-dt);e.stunned=Math.max(0,(e.stunned||0)-dt);e.d+=e.v*(e.frozen>0||e.stunned>0?0:(e.sl>0?.5:1))*dt;
    if(e.d>=G.tot){e.hp=0;e.leak=1;G.lives--}else{[e.x,e.y]=posAt(e.d)}
  }
  mythicAbilities(dt);
  // Eternity Keeper alternates between a damage blessing and an attack-speed blessing.
  // Each aura lasts 7.5s, recasts every (15 - 1.5 per boost) seconds.
  for(const keeper of G.us){
    if(keeper.id!=='eternity')continue;
    keeper.auraTimer=(keeper.auraTimer??0)-dt;
    if(keeper.auraTimer<=0){
      keeper.auraTimer=15-1.5*(keeper.bl-1);
      keeper.auraType=keeper.auraType==='damage'?'speed':'damage';
      keeper.auraRemaining=7.5;
      if(S.settings.attackFx)G.fx.push({kind:'timefreeze',x:keeper.x,y:keeper.y,rg:keeper.rg,l:.65,max:.65});
    }
    keeper.auraRemaining=Math.max(0,(keeper.auraRemaining||0)-dt);
  }
  for(const u of G.us){
    if(u.id==='barter' && G.wave>0){
      // Economy timers begin only after the first wave has been started.
      const barterCD=Math.max(1,6-u.bl);
      u.barterTimer=Math.min(u.barterTimer??barterCD,barterCD)-dt;
      while(u.barterTimer<=0){
        u.barterTimer+=barterCD;
        const bonus=u.bl<=1?0:5*(Math.pow(1.1,u.bl-2)-1)/.1;
        const payout=Math.round(10+bonus);
        let earned=Math.round(payout*midasIncomeMultiplier(u.uid,u.bl)*barterPrestigeMultiplier(u.uid))+barterStarBonus(u);if(u.path==='banker')earned=Math.round(earned*1.3);G.coins+=earned;ggSfx('coin');
        if(S.settings.attackFx)G.fx.push(typeof GGA!=='undefined'?{kind:'coin',txt:'+'+earned,x:u.x,y:u.y-30,l:1,max:1}:{kind:'summon',x:u.x,y:u.y,l:.45,max:.45});
      }
    }
    if(u.id==='chrono_warden'){
      u.chronoTimer=(u.chronoTimer??10)-dt;
      if(u.chronoTimer<=0){u.chronoTimer+=10;const duration=1+.5*(u.bl-1);let hit=0;for(const e of G.en){if(e.hp>0&&Math.hypot(e.x-u.x,e.y-u.y)<=u.rg){e.frozen=Math.max(e.frozen||0,duration);hit++;}}if(hit&&S.settings.attackFx)G.fx.push({kind:'timefreeze',x:u.x,y:u.y,rg:u.rg,l:.65,max:.65});}
    }
    if(u.id==='alucard'){
      // Shadow hound familiar: a periodic shadow-hound attack on the leading enemy.
      u.baskervilleTimer=(u.baskervilleTimer??12)-dt;
      if(u.baskervilleTimer<=0){
        u.baskervilleTimer+=12;
        const prey=G.en.filter(e=>e.hp>0).sort((a,b)=>b.d-a.d)[0];
        if(prey){
          prey.hp-=u.d*2.5;prey.lastHitUid=u.uid;prey.lastHitBoost=u.bl;
          if(S.settings.attackFx)G.fx.push({kind:'riftburst',x:prey.x,y:prey.y,l:.5,max:.5});
        }
      }
    }
    if(u.id==='abyss_summoner'){
      u.summonTimer=(u.summonTimer??5)-dt;
      if(u.summonTimer<=0){
        u.summonTimer+=5;
        G.allies=G.allies||[];
        const elite=u.bl>=5,count=elite?2:3;
        // Summoner HP is a unit-specific stat for its minions, not a tower life bar.
        const summonerHp=100+u.pl*12+u.bl*35;
        for(let i=0;i<count;i++)summonPathAlly(u.uid,elite,elite?summonerHp*1.25:summonerHp*.75,u.d*(elite?1.5:.55),i*18);
        if(S.settings.attackFx)G.fx.push({kind:'summon',x:u.x,y:u.y,l:.65,max:.65});
      }
    }
    // Barter is a non-combat Exclusive economy unit; never attacks enemies.
    if(u.id==='barter')continue;
    u.t-=dt;if(u.t>0)continue;
    let b=null;
    for(const e of G.en) if(e.hp>0&&(u.id==='worldtree'||Math.hypot(e.x-u.x,e.y-u.y)<=u.rg)&&(!b||e.d>b.d)) b=e;
    if(!b)continue;
    const activeAuras=G.us.filter(k=>k.id==='eternity'&&k.auraRemaining>0&&Math.hypot(k.x-u.x,k.y-u.y)<=k.rg);
    const damageBlessed=activeAuras.some(k=>k.auraType==='damage');
    const speedBlessed=activeAuras.some(k=>k.auraType==='speed');
    u.t=u.cd*(speedBlessed?.8:1);
    const blessingDamage=damageBlessed?1.2:1;
    // Every additional unit has a distinct attack modifier determined by its unique special ID.
    const spec=UNITS[u.id].special||0;
    const hits=(u.hits=(u.hits||0)+1);
    const multiplier=spec ? 1+(spec%9)*.035 : 1;
    const primaryDamage=u.d*multiplier*blessingDamage*(u.id==='worldtree'?Math.max(0,1-.03*(G.us.length-1)):1);
    b.hp-=primaryDamage;b.lastHitUid=u.uid;b.lastHitBoost=u.bl;
    // Prestige perks: 3★ Awakened Strike (every 5th attack +50% damage);
    // 5★ Ascended Strike (every 5th attack +100% damage and a shockwave hitting nearby enemies for 30%).
    const pst=prestigeStars(u);
    if(pst>=3&&hits%5===0){
      b.hp-=primaryDamage*(pst>=5?1:.5);
      if(pst>=5)for(const e of G.en)if(e!==b&&e.hp>0&&Math.hypot(e.x-b.x,e.y-b.y)<45){e.hp-=primaryDamage*.3;e.lastHitUid=u.uid;e.lastHitBoost=u.bl;}
      if(S.settings.attackFx)G.fx.push({kind:'impact2',imp:pst>=5?'explode':'burst',x:b.x,y:b.y-6,col:'#ffd84a',delay:.18,l:.6,max:.6});
    }
    if(u.id==='alucard'){
      // twin moon pistol alternating rounds, with a restraint-release finisher.
      if(hits%2===0)b.hp-=primaryDamage*.4;
      if(hits%5===0){
        b.hp-=primaryDamage*2;
        for(const e of G.en)if(e!==b&&e.hp>0&&Math.hypot(e.x-b.x,e.y-b.y)<65){
          e.hp-=primaryDamage*.8;e.lastHitUid=u.uid;e.lastHitBoost=u.bl;
        }
        if(S.settings.attackFx)G.fx.push({kind:'riftburst',x:b.x,y:b.y,l:.5,max:.5});
      }
    }
    applyRankedAttackSkill(u,b,hits);
    // Astral Huntress ricochets to four DISTINCT additional enemies.
    // Bounces deal 90%, 80%, 70%, then 60% of the original hit.
    if(u.id==='starlord'){
      const hitEnemies=new Set([b]);let last=b;
      for(let bounce=1;bounce<=4;bounce++){
        const next=G.en.filter(e=>e.hp>0&&!hitEnemies.has(e))
          .sort((a,c)=>Math.hypot(a.x-last.x,a.y-last.y)-Math.hypot(c.x-last.x,c.y-last.y))[0];
        if(!next)break;
        next.hp-=primaryDamage*(1-.1*bounce);next.lastHitUid=u.uid;next.lastHitBoost=u.bl;
        if(S.settings.attackFx)G.fx.push({kind:'shot',style:'magic',a:[last.x,last.y],b:[next.x,next.y],l:.28,max:.28,c:'#c6a2ff'});
        hitEnemies.add(next);last=next;
      }
    }
    if(u.id==='dragonlord')for(const e of G.en)if(e!==b&&e.hp>0&&Math.hypot(e.x-b.x,e.y-b.y)<=75)e.hp-=u.d*.65;
    if(u.id==='rift_blade'&&hits%4===0){for(const e of G.en){if(e!==b&&e.hp>0&&Math.hypot(e.x-b.x,e.y-b.y)<100)e.hp-=u.d*1.4;}b.hp-=u.d*1.4;if(S.settings.attackFx)G.fx.push({kind:'riftburst',x:b.x,y:b.y,l:.45,max:.45});}
    if(u.slow)b.sl=1.5;
    if(spec){
      if(spec%4===0) b.sl=Math.max(b.sl, .5+(spec%5)*.25);
      if(spec%5===0 && hits%3===0) b.hp-=u.d*(.35+(spec%7)*.12);
      if(spec%6===0 && hits%4===0) G.coins+=1+(spec%5);
      if(spec%3===0) for(const e of G.en) if(e!==b&&e.hp>0&&Math.hypot(e.x-b.x,e.y-b.y)<25+(spec%7)*8) e.hp-=u.d*(.08+(spec%5)*.06);
      if(spec%7===0 && hits%5===0) for(const e of G.en) if(e!==b&&e.hp>0&&Math.hypot(e.x-b.x,e.y-b.y)<90) e.sl=Math.max(e.sl,1.2);
    }
    if(u.splash) for(const e of G.en) if(e!==b&&e.hp>0&&Math.hypot(e.x-b.x,e.y-b.y)<=u.splash) e.hp-=u.d*(u.splashMult||.6);
    u.face=b.x<u.x?-1:1;u.atkT=performance.now();ggAttackSound(u);
    if(S.settings.attackFx){
      const fk=attackFxKind(u),fcol=attackFxColor(u,fk);
      G.fx.push({kind:'shot',style:shotStyle(u),fxk:fk,c2:fcol,a:fk?[u.x+u.face*10,u.y-20]:[u.x,u.y],b:fk?[b.x,b.y-6]:[b.x,b.y],l:.24,max:.24,c:u.col});
      if(fk)G.fx.push({kind:'impact2',imp:{slash:'slash',fire:'explode',frost:'frost'}[fk]||'burst',x:b.x,y:b.y-6,col:fcol,delay:fk==='slash'?0:.2,l:fk==='slash'?.3:.55,max:fk==='slash'?.3:.55});
      const trait=unitTrait(u.uid);
      if(MYTHIC_VISUALS[trait])G.fx.push({kind:'mythic',trait,x:b.x,y:b.y,l:.5,max:.5});
    }
  }
  // Allied summons march from the player base to the enemy entrance, fighting along the path.
  G.allies=G.allies||[];
  for(const a of G.allies){
    a.ttl-=dt;a.cooldown-=dt;
    // Advance against the enemy flow, from the path exit to its entrance.
    if(Number.isFinite(a.d)){
      a.d=Math.max(0,a.d-(a.speed||135)*dt);
      [a.x,a.y]=posAt(a.d);
      if(a.d<=0)a.ttl=0;
    }
    if(a.ttl<=0)continue;
    if(a.cooldown<=0){
      const target=G.en.filter(e=>e.hp>0).sort((x,y)=>Math.hypot(x.x-a.x,x.y-a.y)-Math.hypot(y.x-a.x,y.y-a.y))[0];
      if(target&&Math.hypot(target.x-a.x,target.y-a.y)<110){
        target.hp-=a.damage;a.cooldown=a.elite?.7:1.05;
        if(S.settings.attackFx)G.fx.push({a:[a.x,a.y],b:[target.x,target.y],l:.12,c:a.elite?'#ff173d':'#a52a40'});
      }
    }
  }
  G.allies=G.allies.filter(a=>a.ttl>0);
  enemyAbilitiesPost();
  for(const e of G.en) if(e.hp<=0&&!e.leak){
    logEnemy(e.kind,'d');ggStat('kills');if(e.boss)ggStat('bossKills');
    if(G.us.some(u=>u.id==='alucard')){G.raidKills=(G.raidKills||0)+1;if(G.raidKills%20===0)G.lives=Math.min(STARTING_LIVES,G.lives+1);}
    G.coins+=Math.round((4+G.wave)*midasIncomeMultiplier(e.lastHitUid,e.lastHitBoost||1));
    // Every defeated enemy in Infinite mode has an independent 1% chance.
    if(G.mode==='infinite'){
      if(Math.random()<.01)grantTraitReroll('Infinite enemy drop');
    }else if(!G.raidLevel&&e.kind==='boss'&&G.wave===15&&G.mode==='hell'){
      // Hell mode: the final-wave boss awards 1–10 trait rerolls.
      grantTraitReroll('Hell final-wave boss defeated',1+Math.floor(Math.random()*10));
    }else if(e.kind==='boss'&&G.mode==='hard'){
      // Hard mode: a defeated boss awards 1–3 trait rerolls.
      grantTraitReroll('Hard boss defeated',1+Math.floor(Math.random()*3));
    }
  }
  // Credit an Infinite wave only after every enemy in that wave has been
  // defeated or escaped. Overlapping waves are tracked independently.
  if(G.mode==='infinite'){
    for(const e of G.en){
      if(e.hp<=0&&e.wave!=null&&G.waveRemaining&&G.waveRemaining[e.wave]!=null)
        G.waveRemaining[e.wave]=Math.max(0,G.waveRemaining[e.wave]-1);
    }
  }
  ggDeathSounds();
  if(S.settings.attackFx)for(const e of G.en)if(e.hp<=0&&!e.leak)G.fx.push({kind:'death',x:e.x,y:e.y,l:.5,max:.5});
  G.en=G.en.filter(e=>e.hp>0);
  if(G.lives>0&&G.mode==='infinite'&&G.waveRemaining){
    for(const w of Object.keys(G.waveRemaining).map(Number).sort((a,b)=>a-b)){
      if(G.waveRemaining[w]===0&&!G.waveRewarded[w]){
        G.waveRewarded[w]=true;infReward(w);
        delete G.waveRemaining[w];
      }
    }
  }
  G.fx.forEach(f=>f.l-=dt);G.fx=G.fx.filter(f=>f.l>0);
  hud();
  if(G.lives<=0) return finish(false);
  if(G.run&&!G.q.length&&!G.en.length){if(G.mode!=='infinite'&&G.wave>=(G.raidLevel?raidMaxWave(G.raidLevel):15))finish(true);}
}
// Lightweight pseudo-3D shading, keeping the original 2D battle rules and hitboxes.
function raisedDisc(x,y,r,top,edge,height=7){
  cx.save();cx.fillStyle='#080b16aa';cx.beginPath();cx.ellipse(x+4,y+height+4,r*1.15,r*.48,0,0,Math.PI*2);cx.fill();
  const side=cx.createLinearGradient(x-r,y,x+r,y+height);side.addColorStop(0,edge);side.addColorStop(.65,top);side.addColorStop(1,edge);
  cx.fillStyle=side;cx.beginPath();cx.ellipse(x,y+height,r,r*.62,0,0,7);cx.fill();
  const grad=cx.createRadialGradient(x-r*.35,y-r*.25,1,x,y,r*1.6);grad.addColorStop(0,'#ffffff99');grad.addColorStop(.3,top);grad.addColorStop(1,edge);
  cx.fillStyle=grad;cx.beginPath();cx.ellipse(x,y,r,r*.62,0,0,7);cx.fill();cx.strokeStyle='#ffffff66';cx.lineWidth=1.4;cx.stroke();cx.restore();
}
// Distinct enemy silhouettes; existing enemy colors, hitboxes and mechanics stay unchanged.
function shadedEnemy(e){
  if(typeof GGA!=='undefined'){
    // Animated enemy art: walk cycle, faces its direction of travel, frost/slow markers.
    const kind=e.boss?'boss':(GGA.ENEMY_LOOK[e.kind]?e.kind:'normal'),r=kind==='boss'?18:(GGA.ENEMY_LOOK[kind].r||11);
    if(e._px!=null&&Math.abs(e.x-e._px)>.05)e._dir=e.x<e._px?-1:1;e._px=e.x;
    GGA.drawEnemy(cx,kind,e.x,e.y,performance.now()/1000,e._dir||1,{frozen:(e.frozen>0||e.stunned>0),slow:e.sl>0});
    const pct=Math.max(0,Math.min(1,e.hp/e.mx));
    cx.fillStyle='#0b0f1c';cx.fillRect(e.x-13,e.y-r-17,26,4);cx.fillStyle=pct>.5?'#4ade80':pct>.25?'#facc15':'#f43f5e';cx.fillRect(e.x-13,e.y-r-17,26*pct,4);
    cx.strokeStyle='#0b0f1c';cx.lineWidth=1;cx.strokeRect(e.x-13,e.y-r-17,26,4);
    return;
  }
  const kind=e.boss?'boss':e.kind;
  const r=kind==='boss'?18:kind==='tank'?14:kind==='runner'?9:kind==='elite'?13:11;
  const palette={tank:['#4b9aff','#173a8e'],runner:['#65f58a','#12672b'],boss:['#595367','#05030b'],elite:['#ca86ff','#552288'],normal:['#ff8a83','#8e1922']}[kind]||['#ff8a83','#8e1922'];
  const x=e.x,y=e.y;
  cx.save();cx.fillStyle='#06091488';cx.beginPath();cx.ellipse(x+3,y+r*.8+3,r*1.2,r*.43,0,0,7);cx.fill();
  cx.translate(x,y);cx.strokeStyle='#121727';cx.lineWidth=1.8;cx.lineJoin='round';
  const body=cx.createLinearGradient(-r,-r,r,r);body.addColorStop(0,palette[0]);body.addColorStop(1,palette[1]);cx.fillStyle=body;
  const poly=(pts)=>{cx.beginPath();pts.forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));cx.closePath();cx.fill();cx.stroke();};
  if(kind==='tank'){
    // Armored beetle: massive plated shell, mandibles, and six legs.
    cx.lineWidth=3;for(const s of [-1,1])for(let i=0;i<3;i++){cx.beginPath();cx.moveTo(s*8,-5+i*5);cx.lineTo(s*(r+7),-10+i*9);cx.stroke();}
    cx.lineWidth=1.8;poly([[-r,-7],[-7,-r],[7,-r],[r,-7],[r,r*.55],[6,r],[-6,r],[-r,r*.55]]);
    cx.strokeStyle='#9cceff';cx.beginPath();cx.moveTo(0,-r+2);cx.lineTo(0,r-2);cx.moveTo(-r+3,0);cx.lineTo(r-3,0);cx.stroke();
    cx.strokeStyle='#11192a';cx.beginPath();cx.moveTo(-5,r-4);cx.lineTo(-9,r+6);cx.moveTo(5,r-4);cx.lineTo(9,r+6);cx.stroke();
  }else if(kind==='runner'){
    // Agile goblin: sharp ears, pointed chin, small limbs and swept-back crest.
    poly([[-r-6,-5],[-7,-r+2],[0,-r-5],[7,-r+2],[r+6,-5],[r-2,6],[0,r+6],[-r+2,6]]);
    cx.fillStyle='#b9ff9d';poly([[-4,-r+1],[0,-r-8],[5,-r+1]]);
    cx.strokeStyle=palette[1];cx.lineWidth=2.5;cx.beginPath();cx.moveTo(-5,r+4);cx.lineTo(-10,r+10);cx.moveTo(5,r+4);cx.lineTo(10,r+10);cx.stroke();
  }else if(kind==='elite'){
    // Spiked void knight: angular helm, horns, shoulder plates.
    poly([[-r-7,-r+1],[-r+2,-r+5],[-r-3,-r-10],[0,-r+1],[r+3,-r-10],[r-2,-r+5],[r+7,-r+1],[r,r],[0,r+5],[-r,r]]);
    cx.fillStyle='#e0b7ff';poly([[-5,-5],[0,-10],[5,-5],[3,4],[-3,4]]);
    cx.fillStyle='#351050';cx.fillRect(-5,-2,10,3);
  }else if(kind==='boss'){
    // Large crowned demon: wide horns, angular armor and glowing core.
    poly([[-r-8,-r+3],[-r-13,-r-13],[-r+1,-r+5],[-8,-r-5],[0,-r-13],[8,-r-5],[r-1,-r+5],[r+13,-r-13],[r+8,-r+3],[r+3,r],[0,r+9],[-r-3,r]]);
    cx.fillStyle='#e34261';poly([[0,-9],[7,0],[0,9],[-7,0]]);
    cx.strokeStyle='#aeb0c5';cx.lineWidth=2;cx.beginPath();cx.moveTo(-r+3,4);cx.lineTo(-7,r+2);cx.moveTo(r-3,4);cx.lineTo(7,r+2);cx.stroke();
  }else{
    // Red horned imp: pointed ears, tail and clawed hands.
    cx.strokeStyle=palette[1];cx.lineWidth=3;cx.beginPath();cx.moveTo(r-3,5);cx.quadraticCurveTo(r+12,10,r+9,-5);cx.stroke();
    poly([[-r-5,-r-8],[-r+2,-r+1],[0,-r-4],[r-2,-r+1],[r+5,-r-8],[r,r*.6],[0,r+6],[-r,r*.6]]);
    cx.strokeStyle=palette[0];cx.lineWidth=2;cx.beginPath();cx.moveTo(-r+2,4);cx.lineTo(-r-6,10);cx.moveTo(r-2,4);cx.lineTo(r+6,10);cx.stroke();
  }
  cx.fillStyle=kind==='boss'?'#ff3e60':'#0c1421';
  if(kind!=='elite'){cx.beginPath();cx.ellipse(-r*.32,-2,Math.max(1.5,r*.13),2.5,0,0,7);cx.ellipse(r*.32,-2,Math.max(1.5,r*.13),2.5,0,0,7);cx.fill();}
  cx.restore();
  cx.fillStyle='#070b17';cx.fillRect(x-13,y-r-15,26,4);cx.fillStyle='#4ade80';cx.fillRect(x-13,y-r-15,26*Math.max(0,Math.min(1,e.hp/e.mx)),4);
}
function drawSummonedCreature(a){
  if(typeof GGA!=='undefined'){GGA.drawSpecter(cx,a.x,a.y,a.elite,performance.now()/1000);return;}
  // Shadow monster: hooded specter; Elite Ghoul: larger armored horned ghoul.
  const x=a.x,y=a.y,r=a.elite?13:9;
  cx.save();cx.translate(x,y);cx.fillStyle='#07051088';cx.beginPath();cx.ellipse(3,r*.8+3,r,4,0,0,7);cx.fill();
  cx.shadowColor=a.elite?'#ff3656':'#8b36bd';cx.shadowBlur=a.elite?14:7;
  cx.lineJoin='round';cx.lineWidth=1.5;cx.strokeStyle=a.elite?'#ff6484':'#bd77ee';
  cx.fillStyle=a.elite?'#32101d':'#21152d';cx.beginPath();
  if(a.elite){cx.moveTo(-r-5,-r+2);cx.lineTo(-r-8,-r-8);cx.lineTo(-6,-r+1);cx.lineTo(0,-r-6);cx.lineTo(6,-r+1);cx.lineTo(r+8,-r-8);cx.lineTo(r+5,-r+2);cx.lineTo(r,r);cx.lineTo(-r,r);}
  else{cx.moveTo(-r,-2);cx.quadraticCurveTo(-r,-r-7,0,-r-7);cx.quadraticCurveTo(r,-r-7,r,-2);cx.lineTo(r+2,r);cx.lineTo(r*.4,r-3);cx.lineTo(0,r+2);cx.lineTo(-r*.4,r-3);cx.lineTo(-r-2,r);}
  cx.closePath();cx.fill();cx.stroke();
  cx.shadowBlur=0;cx.fillStyle=a.elite?'#ff3656':'#e178ff';
  cx.beginPath();cx.moveTo(-6,-2);cx.lineTo(-2,0);cx.lineTo(-5,2);cx.moveTo(6,-2);cx.lineTo(2,0);cx.lineTo(5,2);cx.fill();
  cx.strokeStyle=a.elite?'#ff879e':'#8b57bc';cx.lineWidth=2;
  if(a.elite){cx.beginPath();cx.moveTo(-r,3);cx.lineTo(-r-6,10);cx.moveTo(r,3);cx.lineTo(r+6,10);cx.moveTo(-5,r);cx.lineTo(-7,r+5);cx.moveTo(5,r);cx.lineTo(7,r+5);cx.stroke();}
  else{cx.beginPath();cx.moveTo(-r+2,5);cx.lineTo(-r-4,10);cx.moveTo(r-2,5);cx.lineTo(r+4,10);cx.stroke();}
  cx.restore();
}
function draw(){
  cx.setTransform(1,0,0,1,0,0);
  cx.clearRect(0,0,800,450);
  cx.fillStyle='#0b1020';cx.fillRect(0,0,800,450);
  if(!G) return;
  if(typeof GGA!=='undefined'){
    // Decorated, themed map (ground, props, textured road, enemy entrance, gem castle), cached per map.
    cx.drawImage(GGA.mapBackground(artThemeKey(),battleStage().path),0,0);
  }else{
    const stage=battleStage();cx.fillStyle=stage.bg||'#2f4a30';cx.fillRect(0,0,800,450);
    cx.lineCap='round';cx.lineJoin='round';cx.strokeStyle=stage.road||'#cdb98a';cx.lineWidth=40;
    cx.beginPath();stage.path.forEach((q,i)=>i?cx.lineTo(q[0],q[1]):cx.moveTo(q[0],q[1]));cx.stroke();
  }
  if(G.sel){cx.strokeStyle='#ffc94d88';cx.lineWidth=2;cx.beginPath();cx.arc(G.sel.x,G.sel.y,G.sel.rg,0,7);cx.stroke()}
  for(const g of (G.ground||[])){
    const [x,y]=posAt(g.d);cx.save();cx.globalAlpha=Math.min(.75,g.ttl/2);
    cx.fillStyle=g.kind==='mud'?'#704629':'#ff5a16';cx.shadowColor=g.kind==='mud'?'#4b2b18':'#ff2700';cx.shadowBlur=13;
    cx.beginPath();cx.ellipse(x,y,g.radius,15,0,0,Math.PI*2);cx.fill();cx.restore();
  }
  for(const ward of (G.xenoWards||[])){
    const [x,y]=posAt(ward.d);cx.save();cx.globalAlpha=Math.min(1,ward.ttl);
    const color={slow:'#ffd166',stun:'#d6a5ff',freeze:'#65e9ff'}[ward.effect];
    cx.strokeStyle=color;cx.fillStyle=color;cx.shadowColor=color;cx.shadowBlur=12;cx.lineWidth=2;
    cx.beginPath();cx.arc(x,y,12,0,Math.PI*2);cx.stroke();
    cx.beginPath();cx.arc(x,y,4,0,Math.PI*2);cx.fill();
    cx.globalAlpha*=.35;cx.beginPath();cx.arc(x,y,ward.radius,0,Math.PI*2);cx.stroke();cx.restore();
  }
  for(const w of (G.wolves||[])){
    const [x,y]=posAt(w.d),[nx]=posAt(Math.min(G.tot,w.d+4));
    if(typeof GGA!=='undefined'){GGA.drawWolf(cx,x,y,performance.now()/1000,nx<x?-1:1);continue;}
    cx.save();cx.translate(x,y);cx.fillStyle='#371a20';cx.beginPath();cx.ellipse(0,0,11,7,0,0,7);cx.fill();cx.restore();
  }
  for(const a of (G.allies||[]))drawSummonedCreature(a);
  for(const u of G.us){
    if(typeof GGA!=='undefined')cx.drawImage(GGA.unitPad(artThemeKey()),u.x-24,u.y,48,30);
    else raisedDisc(u.x,u.y+13,18,'#48516b','#181e32',8);
    cx.strokeStyle=TYPES[UNITS[u.id].t]||'#cbd5e1';cx.globalAlpha=.75;cx.lineWidth=1.6;cx.beginPath();cx.ellipse(u.x,u.y+13,18,8.5,0,0,7);cx.stroke();cx.globalAlpha=1;
    // Prestige stars: pips under the pad, golden ring at 3★, radiant sparkles at 5★.
    if(typeof GGA!=='undefined')GGA.drawStarAura(cx,u.x,u.y,prestigeStars(u),performance.now()/1000);
    // Small lunge toward the target on each attack; units face the enemy they shoot.
    const atkAge=u.atkT?performance.now()-u.atkT:999,lunge=atkAge<160?(u.face||1)*3*(1-atkAge/160):0;
    art(cx,u.id,u.x+lunge,u.y-5,1,unitTrait(u.uid),performance.now()/1000,{flip:(u.face||1)<0});
    cx.fillStyle='#000c';cx.beginPath();cx.arc(u.x+13,u.y+14,8,0,7);cx.fill();
    cx.fillStyle='#fff';cx.font='bold 9px sans-serif';cx.textAlign='center';cx.fillText(u.pl,u.x+13,u.y+17);
  }
  for(const f of G.fx){
    if(typeof GGA!=='undefined'){
      if(f.kind==='impact2'){const age=f.max-f.l;if(age>=f.delay)GGA.drawImpact(cx,f.imp,f.x,f.y,Math.min(1,(age-f.delay)/(f.max-f.delay)),f.col);continue;}
      if(f.kind==='coin'||f.kind==='death'){GGA.drawImpact(cx,f.kind,f.x,f.y,1-f.l/f.max,f.kind==='coin'?f.txt:null);continue;}
    }else if(f.kind==='impact2'||f.kind==='coin'||f.kind==='death')continue;
    if(f.kind==='wolfhit'){cx.save();cx.globalAlpha=f.l/f.max;C(cx,f.x,f.y,22*(1-f.l/f.max)+5,'#f43f5e');cx.restore();continue;}
    if(f.kind==='timefreeze'||f.kind==='riftburst'){cx.save();cx.globalAlpha=Math.max(0,f.l/f.max)*.8;cx.strokeStyle=f.kind==='timefreeze'?'#80f0ff':'#f07aff';cx.lineWidth=4;cx.shadowBlur=15;cx.shadowColor=cx.strokeStyle;cx.beginPath();cx.arc(f.x,f.y,f.kind==='timefreeze'?f.rg:80*(1-f.l/f.max),0,7);cx.stroke();cx.restore();continue;}
    if(f.kind==='summon'){cx.save();cx.globalAlpha=f.l/f.max;cx.strokeStyle='#ff1939';cx.lineWidth=3;cx.beginPath();cx.arc(f.x,f.y,36*(1-f.l/f.max)+8,0,7);cx.stroke();cx.restore();continue;}
    if(f.kind==='mythic'){
      cx.save();cx.globalAlpha=Math.max(0,f.l/f.max);
      const v=MYTHIC_VISUALS[f.trait],r=13+(1-f.l/f.max)*24;
      if(f.trait==='astral'){
        cx.strokeStyle=v.color;cx.lineWidth=3;for(let i=0;i<8;i++){const a=i*Math.PI/4;cx.beginPath();cx.moveTo(f.x+Math.cos(a)*r*.4,f.y+Math.sin(a)*r*.4);cx.lineTo(f.x+Math.cos(a)*r,f.y+Math.sin(a)*r);cx.stroke()}
      }else if(f.trait==='singularity'){
        cx.strokeStyle=v.color;cx.lineWidth=3;for(let i=0;i<3;i++){cx.beginPath();cx.ellipse(f.x,f.y,r,r*.45,i*1.05+f.l*8,0,Math.PI*1.7);cx.stroke()}
      }else{
        for(let i=0;i<10;i++){const a=i*2.4+f.l*6;C(cx,f.x+Math.cos(a)*r*.65,f.y+Math.sin(a)*r*.65,3+i%3,i%2?v.color:v.secondary)}
      }
      cx.restore();continue;
    }
    if(f.kind==='shot'){renderShot(f);continue;}
    cx.strokeStyle=f.c;cx.lineWidth=3;cx.beginPath();cx.moveTo(...f.a);cx.lineTo(...f.b);cx.stroke()
  }
  for(const e of G.en){shadedEnemy(e);
  }
  enemyFxRender();
  // Lighting and vignette are baked into the cached map background.
  cx.setTransform(1,0,0,1,0,0);
}
function artThemeKey(){return G&&G.raidLevel?'castle':(typeof GGA!=='undefined'?GGA.STAGE_THEME[G.si]:'meadow')||'meadow';}
let last=0;
function loop(ts){
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  if(G&&!G.paused){
    if(G.over&&G.restartTimer>0){G.restartTimer-=dt;if(G.restartTimer<=0)restartMap()}
    else if(!G.over){
      for(let k=0;k<G.speed&&G&&!G.over;k++)step(dt);
    }
  }
  draw();if(G&&G.sel)positionQuick();requestAnimationFrame(loop);
}


/* Beginner tutorial: independent from game save; no rewards or gameplay modifications. */
const GG_TUTORIAL_KEY='gemGuardiansTutorialSeen-'+(typeof KEY==='string'?KEY:'edition');
const GG_TUTORIAL_STEPS=[
 {title:'💎 Welcome to Gem Guardians!',text:'Defend your castle from waves of enemies. Summon units, equip a team, place them beside the road and upgrade them. New players are taught step by step by the guided tutorial. Tap “Guided tutorial” below to replay it any time.'},
 {title:'🎰 1. Summon units',text:'Summon 1 costs 50 gems and Summon 10 costs 450 gems (a ten-pull always includes an Epic or better). Base odds: Common 65%, Rare 20%, Epic 7.5%, Legendary 5%, Mythic 2%, and Secret 0.5% from Player Level 10. Pity guarantees a Legendary by 100 pulls and a Mythic by 500. Auto-Sell in Settings can sell chosen rarities for gems.'},
 {title:'🛡️ 2. Equip and place',text:'Equip units in the Units tab: 4 slots, with a 5th at Player Level 5 and a 6th at Level 10. In battle, tap a unit card and then the grass beside the road. Tap a placed unit to upgrade or sell it. Barter earns extra coins; every other unit attacks.'},
 {title:'⚔️ 3. Battles and difficulty',text:'Choose a difficulty with the colored cards (Easy, Medium, Hard, Hell or Infinite), then tap a map. Survive 15 waves and keep lives for up to 3 stars. Enemy strength adapts to your team, so very strong teams face tougher enemies on easier maps.'},
 {title:'🍓 4. Fruits, traits and stars',text:'Feed fruits in the Bag to level units. Trait Rerolls (crystals) give random permanent bonuses in the Trait Forge. You earn them from AFK mode, Player Level milestones and Hard/Hell bosses, or pay 30 gems per reroll. At level 100, prestige for a star: +50% damage, +4% range and +6% speed per star, plus perks at 3★ and 5★.'},
 {title:'🏆 5. Progress and save',text:'Claim Index rewards for every new unit, use AFK mode for idle gems, and unlock Raids at Player Level 25. Progress saves automatically. Use Export, Share or Copy Save in Settings for a backup before clearing browser data or changing devices.'}
];
let ggTutorialStep=0;
function ggTutorialRender(){
 const step=GG_TUTORIAL_STEPS[ggTutorialStep];
 document.getElementById('ggTutorialProgress').textContent='STEP '+(ggTutorialStep+1)+' OF '+GG_TUTORIAL_STEPS.length;
 document.getElementById('ggTutorialTitle').textContent=step.title;
 document.getElementById('ggTutorialText').textContent=step.text;
 document.getElementById('ggTutorialBack').disabled=ggTutorialStep===0;
 document.getElementById('ggTutorialNext').textContent=ggTutorialStep===GG_TUTORIAL_STEPS.length-1?'Start playing ✓':'Next →';
}
function ggTutorialOpen(){ggTutorialStep=0;ggTutorialRender();document.getElementById('ggTutorial').classList.remove('hide')}
function ggTutorialClose(){document.getElementById('ggTutorial').classList.add('hide');try{localStorage.setItem(GG_TUTORIAL_KEY,'1')}catch(e){console.warn('Tutorial completion could not be stored',e)}}
document.getElementById('ggTutorialBack').addEventListener('click',()=>{if(ggTutorialStep>0){ggTutorialStep--;ggTutorialRender()}});
document.getElementById('ggTutorialNext').addEventListener('click',()=>{if(ggTutorialStep<GG_TUTORIAL_STEPS.length-1){ggTutorialStep++;ggTutorialRender()}else ggTutorialClose()});
document.getElementById('ggTutorialSkip').addEventListener('click',ggTutorialClose);
document.getElementById('bTutorial').addEventListener('click',ggTutorialOpen);
// The quick tutorial no longer opens automatically; the guided tutorial teaches new players.
document.getElementById('ggStartGuide').addEventListener('click',()=>{ggTutorialClose();guideStart(0);});

/* ---------- Guided tutorial (2026.10.11.4) ----------
   A non-blocking coach panel that teaches new players by asking them to use the real
   controls. Each step highlights its target and advances when the action is detected.
   Progress is stored per edition in localStorage (not in the save file). */
const GG_GUIDE_KEY='gemGuardiansGuide-'+(typeof KEY==='string'?KEY:'edition');
const tabOpen=id=>{const el=document.getElementById(id);return !!el&&!el.classList.contains('hide');};
const tabBtn=id=>document.querySelector('.tabs button[data-tab="'+id+'"]');
const firstEquipBtn=()=>[...document.querySelectorAll('#coll [data-equip]')].find(b=>!/Equipped/.test(b.textContent));
const totalUnitXp=()=>S.units.reduce((a,u)=>a+u.lv*100000+u.xp,0);
let guide={active:false,step:0,base:{},hidden:false};
const GUIDE_STEPS=[
 {title:'💎 Welcome, Guardian!',text:'I’ll teach you how to play by guiding you through the real game. Follow the glowing highlight. You start with 500 gems, 25 free trait rerolls and Barter, a merchant who earns coins in battle.',info:true},
 {title:'🎰 Open the Summon tab',text:'Units are your towers. Tap the glowing Summon tab.',tab:'summon',target:()=>tabBtn('summon'),done:()=>tabOpen('summon')},
 {title:'🎰 Summon 10 units',text:'Tap “Summon 10” to spend 450 gems on ten units. A ten-pull always includes at least one Epic or better. (If you have fewer than 450 gems, use Summon 1.)',
  enter:b=>{b.units=S.units.length},target:()=>S.gems>=450?$('#p10'):$('#p1'),done:b=>S.units.length>b.units},
 {title:'🛡️ Open the Units tab',text:'Your new units are in the Units tab. Tap it.',target:()=>tabBtn('units'),done:()=>tabOpen('units')},
 {title:'🛡️ Equip your team',text:'Only equipped units can be used in battle. Tap “＋ Equip” on your strongest units until your 4 loadout slots are full. Barter is already equipped. Rarer units, shown by their colored names, are stronger.',
  target:()=>tabOpen('units')?(firstEquipBtn()||$('#loadoutSlots')):tabBtn('units'),done:()=>(S.equipped||[]).length>=Math.min(unlockedLoadoutSlots(),S.units.length)},
 {title:'⚔️ Open the Battle tab',text:'Time to defend! Tap the Battle tab.',target:()=>tabBtn('battle'),done:()=>tabOpen('battle')},
 {title:'🗺️ Choose Green Meadow',text:'First pick a difficulty with the colored cards at the top: they change enemy health and rewards. Keep Easy for now. Then pick a map: maps unlock one by one, so tap Green Meadow.',
  enter:()=>{if(typeof curMode!=='undefined'&&curMode!=='easy'&&S.cleared===0){curMode='easy';renderAll();}},target:()=>tabOpen('battle')?document.querySelector('#stages [data-s="0"]'):tabBtn('battle'),done:()=>!!(G&&!G.over)},
 {title:'📍 Place your first unit',text:'Tap a unit card in the panel on the left of the map, then tap the grass beside the road. You can’t place units on the road. Each placement costs coins; you start every battle with 500.',
  target:()=>(G&&G.pl)?$('#cv'):document.querySelector('#bar .card'),done:()=>!!(G&&G.us.length>=1)},
 {title:'📍 Place more units',text:'Place another unit along the road. Spread them out so enemies pass through every unit’s range. Barter attacks nothing, but earns extra coins every few seconds.',
  target:()=>(G&&G.pl)?$('#cv'):document.querySelector('#bar .card'),done:()=>!!(G&&(G.us.length>=2||G.wave>0))},
 {title:'▶ Start the first wave',text:'Tap “Start wave”. After that, waves keep coming automatically. Defeated enemies give coins.',target:()=>$('#bWave'),done:()=>!!(G&&G.wave>=1)},
 {title:'⬆ Upgrade a unit',text:'Tap one of your placed units on the map to open its menu, then press Upgrade when you have enough coins. Upgrades raise damage, range and speed. You can also sell a placed unit from the same menu.',
  target:()=>$('#cv'),done:()=>!!(G&&G.us.some(u=>u.bl>=2)),skippable:true},
 {title:'⏩ Speed and helpers',text:'“Speed” makes the battle faster and “Pause” stops it. “Auto Upgrade” spends coins on upgrades for you. Auto Play unlocks at Player Level 5 on maps where you earned 3 stars.',target:()=>$('#bSpd'),info:true},
 {title:'🏰 Survive all 15 waves',text:'Keep enemies from reaching your castle. Each enemy that gets through costs a life, and you have 10. The more lives you keep, the more stars you earn (up to 3).',
  target:()=>$('#hud'),done:()=>!!(G&&G.over),skippable:true},
 {title:'🎁 Rewards',text:'The results card shows your rewards: gems, the map’s fruit, Player EXP and EXP for every unit you placed. Winning unlocks the next map. Losing still pays a few gems and EXP.',info:true},
 {title:'🍓 Open your Bag',text:'Fruits level up your units. Tap the Bag tab.',target:()=>tabBtn('bag'),done:()=>tabOpen('bag'),
  enter:()=>{if(!Object.keys(ITEMS).some(k=>(S.bag[k]||0)>0)){S.bag.berry=(S.bag.berry||0)+3;discoverItem('berry');save(false);renderAll();toast('Tutorial gift: 3 Meadow Berries');}}},
 {title:'🍓 Feed a unit',text:'Tap a fruit, choose a unit below, then tap “Feed 1” or “Feed up to 10”. Better fruits from later maps give much more EXP. At level 100, a unit can be prestiged for a permanent star.',
  enter:b=>{b.xp=totalUnitXp()},target:()=>{if(!tabOpen('bag'))return tabBtn('bag');if(!bagSel||!ITEMS[bagSel])return document.querySelector('#bagGrid .card[data-k]:not([data-k="trait_reroll"])');return $('#f1');},done:b=>totalUnitXp()>b.xp,skippable:true},
 {title:'✨ Open the Trait Forge',text:'Traits give a unit permanent bonuses such as extra damage, range or attack speed. Tap the Traits tab.',target:()=>tabBtn('traits'),done:()=>tabOpen('traits')},
 {title:'✨ Reroll a trait',text:'Pick a unit, then tap “Reroll trait”. Each reroll uses one Trait Reroll crystal (you have '+'{rerolls}'+'). With none left, a reroll costs 30 gems. Rare traits are rarer, and every 150th reroll without a Mythic guarantees one.',
  enter:b=>{b.rr=S.traitRerolls;b.gems=S.gems},target:()=>tabOpen('traits')?$('#traitRoll'):tabBtn('traits'),done:b=>S.traitRerolls<b.rr||S.gems<b.gems,skippable:true},
 {title:'💎 Earning more Trait Rerolls',text:'Trait Rerolls come from: AFK mode (5% chance each minute), Player Level milestone rewards every 5 levels, and Hard or Hell boss waves. You can see your crystals in the Bag. Auto Reroll can keep rolling until it finds the trait you choose.',info:true,target:()=>$('#autoTraitToggle')},
 {title:'📖 Collect Index rewards',text:'Every new unit you discover pays a one-time gem reward in the Index. Open the Index tab and claim your rewards.',target:()=>tabBtn('index'),info:true},
 {title:'🌙 AFK rewards',text:'The AFK tab earns gems and sometimes Trait Rerolls every minute while it stays open. It’s great when you’re away from the game.',target:()=>tabBtn('afk'),info:true},
 {title:'⭐ Prestige stars',text:'At level 100 a unit can prestige: it returns to level 1 and gains a star (up to 5). Every star gives +50% damage, +4% range and +6% attack speed. 3★ and 5★ unlock bonus strike perks.',info:true},
 {title:'💾 Keep your progress safe',text:'The game saves automatically. Open Settings to Export, Share or Copy your save as a backup before clearing browser data or switching devices.',target:()=>$('#bSettings'),info:true},
 {title:'🏆 You’re ready!',text:'Win maps to unlock new ones and harder difficulties. Raids unlock at Player Level 25. You can replay this guide any time from the 📖 Tutorial button. Good luck, Guardian!',info:true,last:true},
];
function guideSave(){try{localStorage.setItem(GG_GUIDE_KEY,JSON.stringify({step:guide.step,done:!guide.active,ts:Date.now()}))}catch(e){}}
function guideClearGlow(){document.querySelectorAll('.guide-glow').forEach(el=>el.classList.remove('guide-glow'));}
function guideEnter(i){
  guide.step=Math.max(0,Math.min(GUIDE_STEPS.length-1,i));guide.base={};
  const st=GUIDE_STEPS[guide.step];try{st.enter&&st.enter(guide.base)}catch(e){console.warn('Guide step setup failed',e)}
  guide.lastTarget=null;guideSave();guideRender();
}
function guideRender(){
  const box=$('#ggGuide');if(!box)return;
  if(!guide.active){box.classList.add('hide');guideClearGlow();return;}
  const st=GUIDE_STEPS[guide.step];box.classList.remove('hide');box.classList.toggle('mini',guide.hidden);
  $('#ggGuideStep').textContent='Tutorial '+(guide.step+1)+' / '+GUIDE_STEPS.length;
  $('#ggGuideTitle').textContent=st.title;
  $('#ggGuideText').textContent=st.text.replace('{rerolls}',String(S.traitRerolls));
  $('#ggGuideNext').classList.toggle('hide',!(st.info||st.skippable));
  $('#ggGuideNext').textContent=st.last?'Finish ✓':st.info?'Next →':'Skip this step';
  $('#ggGuideBack').disabled=guide.step===0;
}
function guideTick(){
  if(!guide.active)return;
  const st=GUIDE_STEPS[guide.step];
  let done=false;try{done=!st.info&&!!(st.done&&st.done(guide.base))}catch(e){}
  if(done){guideClearGlow();if(guide.step>=GUIDE_STEPS.length-1)return guideFinish();guideEnter(guide.step+1);return;}
  let t=null;try{t=st.target?st.target():null}catch(e){}
  if(t!==guide.lastTarget){guideClearGlow();guide.lastTarget=t;
    if(t&&!guide.hidden){t.classList.add('guide-glow');if(t.getBoundingClientRect().height&&(t.getBoundingClientRect().top<0||t.getBoundingClientRect().bottom>innerHeight))t.scrollIntoView({block:'center',behavior:'smooth'});}}
  else if(t&&!guide.hidden&&!t.classList.contains('guide-glow'))t.classList.add('guide-glow');
  $('#ggGuideText').textContent=st.text.replace('{rerolls}',String(S.traitRerolls));
}
function guideStart(fromStep=0){guide.active=true;guide.hidden=false;guideEnter(fromStep);}
function guideFinish(){guide.active=false;guideClearGlow();guideSave();guideRender();toast('Tutorial complete! Replay it any time from 📖 Tutorial.');}
function guideSkip(){if(!confirm('Skip the tutorial? You can restart it any time from the 📖 Tutorial button.'))return;guide.active=false;guideClearGlow();guideSave();guideRender();}
$('#ggGuideNext').onclick=()=>{const st=GUIDE_STEPS[guide.step];guideClearGlow();if(st.last||guide.step>=GUIDE_STEPS.length-1)return guideFinish();guideEnter(guide.step+1);};
$('#ggGuideBack').onclick=()=>{guideClearGlow();guideEnter(guide.step-1);};
$('#ggGuideSkip').onclick=guideSkip;
$('#ggGuideMin').onclick=()=>{guide.hidden=!guide.hidden;$('#ggGuideMin').textContent=guide.hidden?'▲ Show':'▼ Hide';guideClearGlow();guide.lastTarget=null;guideRender();};
setInterval(guideTick,400);
function guideAutoStart(){
  let saved=null;try{saved=JSON.parse(localStorage.getItem(GG_GUIDE_KEY)||'null')}catch(e){}
  if(saved&&saved.done)return;
  if(saved&&Number.isInteger(saved.step)){guideStart(saved.step);return;}
  // Only brand-new players are guided automatically; existing players can start it from 📖 Tutorial.
  const isNew=S.playerLevel<=1&&(S.cleared||0)===0&&S.units.length<=1;
  if(isNew)guideStart(0);
}



/* ---------- Storage protection, version label and update notice ---------- */
async function requestPersistentStorage(){
  const el=$('#storageStatus');
  try{
    if(!navigator.storage||!navigator.storage.persist){if(el)el.textContent='Storage protection: not supported by this browser. Export backups regularly.';return}
    let ok=await navigator.storage.persisted();
    if(!ok)ok=await navigator.storage.persist();
    if(el)el.textContent=ok?'Storage protection: ✓ The browser will keep this save unless you clear site data.':'Storage protection: not granted yet (installing the app usually helps). Export backups regularly.';
  }catch(e){console.warn('Persistent storage request failed',e);if(el)el.textContent='Storage protection: unavailable. Export backups regularly.'}
}
let updateReadyShown=false;
const GAME_VERSION_PATTERN=new RegExp("const GAME_"+"VERSION='([0-9A-Za-z._-]+)'");
async function checkForGameUpdate(){
  if(updateReadyShown||!navigator.onLine||!/^https?:$/.test(location.protocol))return;
  try{
    // The query string bypasses the service worker's cached copy.
    const r=await fetch('./index.html?versionCheck='+Date.now(),{cache:'no-store'});
    if(!r.ok)return;
    const m=(await r.text()).match(GAME_VERSION_PATTERN);
    if(m&&m[1]!==GAME_VERSION)showUpdateReady(m[1]);
  }catch(e){/* Offline or blocked: try again later. */}
}
function showUpdateReady(v){updateReadyShown=true;$('#updateReadyText').textContent='A new Gem Guardians version ('+v+') is available.';$('#updateReady').classList.remove('hide');}
$('#updateReload').onclick=()=>{
  if(G&&!G.over&&!confirm('Reloading now ends the current battle; rewards not yet earned in it are lost. Your saved progress is kept. Reload now?'))return;
  save(false);location.reload();
};
$('#updateLater').onclick=()=>$('#updateReady').classList.add('hide');
setTimeout(checkForGameUpdate,8000);setInterval(checkForGameUpdate,30*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkForGameUpdate()});
function renderVersionLabels(){
  const label='Version '+GAME_VERSION+' · '+(GG_EDITION==='creator'?'Creator':'Public')+' Edition';
  $('#gameVersionLabel').textContent=label;$('#qolVersion').textContent=label;
}

document.querySelectorAll('#qolFilter [data-filter]').forEach(btn=>btn.onclick=()=>{
  const f=btn.dataset.filter;
  document.querySelectorAll('#qolFilter [data-filter]').forEach(b=>b.classList.toggle('on',b===btn));
  document.querySelectorAll('#qolModal .qol-section').forEach(sec=>sec.classList.toggle('filtered',f!=='All'&&sec.dataset.category!==f));
});
const GG_AWAKE_MP4="data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAMrbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAB9AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAlV0cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAB9AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAAfQAAAAAAABAAAAAAHNbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAABAAAAAgABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABeG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAThzdGJsAAAAuHN0c2QAAAAAAAAAAQAAAKhhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAABAAEABIAAAASAAAAAAAAAABFUxhdmM2MC4zMS4xMDIgbGlieDI2NAAAAAAAAAAAAAAAGP//AAAALmF2Y0MBQsAK/+EAFmdCwArZHsBEAAADAAQAAAMACDxImSABAAVoy4PLIAAAABBwYXNwAAAAAQAAAAEAAAAUYnRydAAAAAAAAApAAAAKQAAAABhzdHRzAAAAAAAAAAEAAAACAABAAAAAABRzdHNzAAAAAAAAAAEAAAABAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAACAAAAAQAAABxzdHN6AAAAAAAAAAAAAAACAAAChgAAAAoAAAAUc3RjbwAAAAAAAAABAAADWwAAAGJ1ZHRhAAAAWm1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAALWlsc3QAAAAlqXRvbwAAAB1kYXRhAAAAAQAAAABMYXZmNjAuMTYuMTAwAAAACGZyZWUAAAKYbWRhdAAAAnAGBf//bNxF6b3m2Ui3lizYINkj7u94MjY0IC0gY29yZSAxNjQgcjMxMDggMzFlMTlmOSAtIEguMjY0L01QRUctNCBBVkMgY29kZWMgLSBDb3B5bGVmdCAyMDAzLTIwMjMgLSBodHRwOi8vd3d3LnZpZGVvbGFuLm9yZy94MjY0Lmh0bWwgLSBvcHRpb25zOiBjYWJhYz0wIHJlZj0zIGRlYmxvY2s9MTowOjAgYW5hbHlzZT0weDE6MHgxMTEgbWU9aGV4IHN1Ym1lPTcgcHN5PTEgcHN5X3JkPTEuMDA6MC4wMCBtaXhlZF9yZWY9MSBtZV9yYW5nZT0xNiBjaHJvbWFfbWU9MSB0cmVsbGlzPTEgOHg4ZGN0PTAgY3FtPTAgZGVhZHpvbmU9MjEsMTEgZmFzdF9wc2tpcD0xIGNocm9tYV9xcF9vZmZzZXQ9LTIgdGhyZWFkcz0xIGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEgaW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9MCB3ZWlnaHRwPTAga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAAOZYiEBb///w9FAAFPf4AAAAAGQZo4CvqA";
const GG_AWAKE_WEBM="data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAH9EU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHYTbuMU6uEElTDZ1OsggEeTbuMU6uEHFO7a1OsggHn7AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmsirXsYMPQkBNgI1MYXZmNjAuMTYuMTAwV0GNTGF2ZjYwLjE2LjEwMESJiECfQAAAAAAAFlSua8GuAQAAAAAAADjXgQFzxYjnirKGA+xUkJyBACK1nIN1bmSIgQCGhVZfVlA4g4EBI+ODhDuaygDgibCBELqBEJqBAhJUw2f8c3OgY8CAZ8iaRaOHRU5DT0RFUkSHjUxhdmY2MC4xNi4xMDBzc9ZjwItjxYjnirKGA+xUkGfIoUWjh0VOQ09ERVJEh5RMYXZjNjAuMzEuMTAyIGxpYnZweGfIoUWjiERVUkFUSU9ORIeTMDA6MDA6MDIuMDAwMDAwMDAwAB9DtnXD54EAo6OBAACAEAIAnQEqEAAQAABHCIWFiJmEiAICAAwNYAD+/6tQgKOZgQPoALEBAAEQEAAYADA/9AwAAAD+/6tQgBxTu2uRu4+zgQC3iveBAfGCAZ/wgQM=";
// ---------- Battle & Index QoL (2026.10.11.9) ----------
// 1) Difficulty cards above the maps (pick difficulty first, then tap a map).
// 2) Enemy Index: every enemy has its own info box once you have met it in battle.
// 3) Screen stays awake for the whole time the battle screen is open.
const MODE_STYLE={easy:{i:'🌱',c:'#4ade80',d:'Relaxed enemies for learning a map'},medium:{i:'⚔️',c:'#60a5fa',d:'A fair fight with double rewards'},hard:{i:'🔥',c:'#fb923c',d:'Tough enemies, 4× rewards, boss rerolls'},hell:{i:'💀',c:'#f43f5e',d:'Brutal enemies, 8× rewards, big boss rerolls'},infinite:{i:'♾️',c:'#c084fc',d:'Endless waves with rewards every wave'}};
const GG_MODE_KEY='gemGuardiansMode-'+KEY;
try{const m=localStorage.getItem(GG_MODE_KEY);if(m&&MODES[m])curMode=m;}catch(e){}
function modeStars(mode){let n=0;for(let i=0;i<STAGES.length;i++)n+=S.stageStars?.[stageStarKey(i,mode)]||0;return n;}
renderModes=function(){
  renderRaids();
  const el=$('#modes');if(!el)return;
  el.innerHTML=Object.keys(MODES).map(k=>{const M=MODES[k],st=MODE_STYLE[k]||{i:'⚔️',c:'#a78bfa',d:''},inf=k==='infinite';
    return '<button type="button" class="mode-card'+(k===curMode?' on':'')+'" data-m="'+k+'" style="--mc:'+st.c+'" aria-pressed="'+(k===curMode)+'">'
      +'<span class="mc-top"><span class="mc-ico">'+st.i+'</span><b>'+M.n+'</b>'+(k===curMode?'<span class="mc-check">✓</span>':'')+'</span>'
      +'<span class="mc-stats">'+(inf?'<span>Endless waves</span><span>💎 every wave</span>':'<span>Enemy HP ×'+M.hp+'</span><span>💎 '+25*M.mult+' · 🍎 '+Math.ceil(2*M.mult)+'</span>')+'<span>Unit EXP ×'+M.xp+'</span></span>'
      +(inf?'':'<span class="mc-stars">★ '+modeStars(k)+'/'+STAGES.length*3+'</span>')
      +'</button>';}).join('');
  el.querySelectorAll('button[data-m]').forEach(b=>b.onclick=()=>{curMode=b.dataset.m;try{localStorage.setItem(GG_MODE_KEY,curMode)}catch(e){};renderAll();});
  const M=MODES[curMode],st=MODE_STYLE[curMode]||{};
  $('#modeInfo').innerHTML='<b style="color:'+(st.c||'#fff')+'">'+(st.i||'')+' '+M.n+':</b> '+(st.d?st.d+'. ':'')+(curMode==='infinite'
    ?'Endless waves that keep getting stronger. Every wave you clear pays 6 gems (31 on each 10th wave) plus food from that map as you go. Player EXP per wave: 1 on waves 1–10, 2 on waves 11–20, 3 on waves 21–30, and +1 for every further 10 waves.'
    :'Clear all 15 waves to earn '+25*M.mult+' gems and '+Math.ceil(2*M.mult)+' of that map’s food. Enemy health ×'+M.hp+', unit EXP ×'+M.xp+'.');
};
// ---- Enemy Index ----
const ENEMY_INDEX=[
  {k:'normal',cls:'Normal',from:1,hp:1,spd:'Normal',ab:'No special ability. The most common enemy.',col:'#ef4444'},
  {k:'tank',cls:'Tank',from:2,hp:3,spd:'Slow',ab:'Very high health. Splash and high-damage units handle it best.',col:'#60a5fa'},
  {k:'runner',cls:'Fast',from:3,hp:.65,spd:'Very fast',ab:'Low health but rushes past slow attackers. Freeze and slow units help.',col:'#4ade80'},
  {k:'elite',cls:'Elite',from:4,hp:1.8,spd:'Normal',ab:'Strong armored knight. Appears on every boss wave just before the boss.',col:'#c084fc'},
  {k:'shield',cls:'Shield',from:5,hp:1.15,spd:'Slow',ab:'Crystal shield (60% of its health) absorbs damage first. When the shield shatters, it is stunned for 1 second.',col:'#67e8f9'},
  {k:'flyer',cls:'Flying',from:6,hp:.7,spd:'Fast',ab:'Flies above the road: slow, freeze and stun do not affect it. Use damage units.',col:'#c4a1ff'},
  {k:'healer',cls:'Healer',from:7,hp:.85,spd:'Normal',ab:'Every 3 seconds heals nearby enemies by 10% of their health. Defeat it first!',col:'#86efac'},
  {k:'splitter',cls:'Splitter',from:8,hp:1.25,spd:'Slow',ab:'Splits into two fast Glooplings when defeated. Splash damage cleans them up.',col:'#5eead4'},
  {k:'gloopling',cls:'Minion',from:8,hp:.3,spd:'Fast',ab:'A small piece of a Gloop. Weak, but quick.',col:'#5eead4'},
  {k:'dasher',cls:'Dasher',from:9,hp:.95,spd:'Normal + dash',ab:'Dashes 70 steps forward along the road every 4 seconds. Cover the whole road.',col:'#a78bfa'},
  {k:'berserk',cls:'Berserker',from:10,hp:1.5,spd:'Slow → very fast',ab:'Gets faster as it loses health (up to +90% speed). Finish it quickly.',col:'#fb923c'},
  {k:'burrower',cls:'Diver',from:12,hp:1.3,spd:'Slow',ab:'Dives under the sand every 5 seconds and takes no damage for 1.5 seconds. Freeze or stun it to stop it diving.',col:'#f97352'},
  {k:'boss',cls:'Boss',from:1,hp:7,spd:'Slow',ab:'Final-wave boss. Calls 3 guards and raises a dark ward at 66% and 33% health, then becomes Enraged (faster) below 25%.',col:'#e4e4e7'}
];
function enemyName(k){return (typeof GGA!=='undefined'&&GGA.ENEMY_LOOK[k]&&GGA.ENEMY_LOOK[k].name)||k;}
function logEnemy(kind,what){
  if(!ENEMY_INDEX.some(x=>x.k===kind))return;
  S.enemyLog=S.enemyLog||{};const r=S.enemyLog[kind]||(S.enemyLog[kind]={s:0,d:0});
  const isNew=!r.s&&!r.k;r[what]=(r[what]||0)+1;
  if(what==='s'&&isNew)toast('👹 New enemy discovered: '+enemyName(kind)+'! See the Index → Enemies.');
}
let ggIndexTab='units';
function setIndexTab(t){ggIndexTab=t;document.querySelectorAll('#indexTabs [data-ix]').forEach(b=>{b.classList.toggle('on',b.dataset.ix===t);b.setAttribute('aria-selected',String(b.dataset.ix===t));});
  const show={units:'#unitIndexPanel',enemies:'#enemyIndexPanel',items:'#itemIndexPanel'};for(const [k,q] of Object.entries(show)){const p=$(q);if(p)p.classList.toggle('hide',k!==t);}
  if(t==='enemies')renderEnemyIndex();}
function renderEnemyIndex(){
  const grid=$('#enemyIndexGrid');if(!grid)return;
  const log=S.enemyLog||{};let known=0;
  grid.innerHTML=ENEMY_INDEX.map(x=>{const r=log[x.k]||{},met=!!(r.s||r.k);if(met)known++;
    if(!met)return '<div class="enemy-card locked"><canvas class="enemy-art" width="160" height="160" data-enemy="'+x.k+'"></canvas><div class="ec-body"><b>???</b><span class="ec-cls">Unknown enemy</span><p>Meet it in battle to unlock its information.</p><small class="ec-hint">'+(x.k==='boss'?'Appears on the final wave of every map':x.k==='gloopling'?'Appears from Map 8':'First appears on Map '+x.from)+'</small></div></div>';
    const seen=r.s?r.s.toLocaleString():'—',def=r.d?r.d.toLocaleString():'—';
    return '<div class="enemy-card" style="--ec:'+x.col+'"><canvas class="enemy-art" width="160" height="160" data-enemy="'+x.k+'"></canvas><div class="ec-body"><b style="color:'+x.col+'">'+enemyName(x.k)+'</b><span class="ec-cls">'+x.cls+'</span>'
      +'<div class="ec-stats"><span>❤️ Health ×'+x.hp+'</span><span>👟 '+x.spd+'</span><span>🗺️ '+(x.k==='boss'?'Final wave':'Map '+x.from+'+')+'</span></div>'
      +'<p>'+x.ab+'</p><small class="ec-log">Encountered '+seen+' · Defeated '+def+(r.k&&!r.s?' · met before records began':'')+'</small></div></div>';}).join('');
  $('#enemyIndexProgress').textContent='Enemies discovered: '+known+'/'+ENEMY_INDEX.length+'. Each enemy’s information box unlocks the first time you meet it in battle.';
  grid.querySelectorAll('canvas[data-enemy]').forEach(k=>{if(typeof GGA==='undefined')return;const c=k.getContext('2d'),kind=k.dataset.enemy;c.clearRect(0,0,160,160);c.save();const s=kind==='boss'?2.3:kind==='gloopling'?3.6:3;c.translate(80,kind==='boss'?100:94);c.scale(s,s);GGA.drawEnemy(c,kind,0,0,0,1);c.restore();});
  const tabBtn=document.querySelector('#indexTabs [data-ix="enemies"]');if(tabBtn)tabBtn.innerHTML=(typeof GGI!=='undefined'?'<span class="ggi-wrap">'+GGI.demon+'</span>':'👹 ')+'Enemies '+known+'/'+ENEMY_INDEX.length;
}
(function(){
  document.querySelectorAll('#indexTabs [data-ix]').forEach(b=>b.onclick=()=>setIndexTab(b.dataset.ix));
  const go=$('#openEnemyIndex');if(go)go.onclick=()=>{document.querySelector('.tabs [data-tab="index"]')?.click();setIndexTab('enemies');$('#indexTabs')?.scrollIntoView({block:'start',behavior:'smooth'});};
  const origRI=renderIndex;renderIndex=function(){const r=origRI.apply(this,arguments);try{renderEnemyIndex()}catch(e){}return r;};
  setIndexTab('units');
})();
// ---- Keep the screen awake for the whole battle (not only in full screen) ----
battleWakeWanted=function(){return !!(G&&$('#arena')&&!$('#arena').classList.contains('hide'));};
(function(){
  const origShow=showArena;showArena=function(v){const r=origShow.apply(this,arguments);try{syncScreenWake();ggAwakeVideo(screenWakeWanted()&&!afkWakeLock);}catch(e){}return r;};
  // Fallback for browsers without the Wake Lock API, or when it is blocked: a tiny silent looping video.
  let vid=null;
  window.ggAwakeVideo=function(on){
    if(on&&!vid){vid=document.createElement('video');vid.setAttribute('playsinline','');vid.setAttribute('aria-hidden','true');vid.muted=true;vid.loop=true;vid.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;bottom:0';
      const s1=document.createElement('source');s1.src=GG_AWAKE_WEBM;s1.type='video/webm';const s2=document.createElement('source');s2.src=GG_AWAKE_MP4;s2.type='video/mp4';vid.append(s1,s2);document.body.appendChild(vid);}
    if(!vid)return;
    if(on){const p=vid.play();if(p&&p.catch)p.catch(()=>{});}else vid.pause();
  };
  // After every tap during a battle: re-check the lock (some browsers need a tap) and run the fallback if the lock is missing.
  addEventListener('pointerdown',()=>{if(!screenWakeWanted())return;if(!afkWakeLock)requestAfkWakeLock();setTimeout(()=>ggAwakeVideo(screenWakeWanted()&&!afkWakeLock),400);},{capture:true,passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&screenWakeWanted()){syncScreenWake();setTimeout(()=>ggAwakeVideo(screenWakeWanted()&&!afkWakeLock),600);}else if(document.visibilityState!=='visible')ggAwakeVideo(false);});
  setInterval(()=>{if(!screenWakeWanted()){ggAwakeVideo(false);return;}if(document.visibilityState==='visible'&&!afkWakeLock)requestAfkWakeLock();},10000);
})();
// ---------- Battle stats on the map (2026.10.11.10) ----------
// Coins, lives and wave are drawn as a badge row on the map itself, so they stay visible
// while scrolled to the map, in full screen and on phones.
(function(){
  const orig=hud;let lastCoins=null,lastG=null;
  hud=function(){
    const r=orig.apply(this,arguments);
    const el=$('#battleStats');if(!el)return r;
    if(!G){el.classList.add('hide');lastCoins=null;return r;}
    el.classList.remove('hide');if(G!==lastG){lastG=G;lastCoins=null;}
    const c=Math.floor(G.coins),cEl=$('#bsCoins'),lEl=$('#bsLives'),wEl=$('#bsWave');
    if(c!==lastCoins){cEl.textContent=c.toLocaleString();const pill=cEl.parentElement;if(lastCoins!=null){pill.classList.remove('up','down');void pill.offsetWidth;pill.classList.add(c>lastCoins?'up':'down');}lastCoins=c;}
    lEl.textContent=G.lives;lEl.parentElement.classList.toggle('low',G.lives<=3);
    wEl.textContent=G.wave+(G.mode==='infinite'?'':'/'+battleMaxWaveSafe());
    return r;
  };
  function battleMaxWaveSafe(){return typeof battleMaxWave==='function'?battleMaxWave():(G.raidLevel?raidMaxWave(G.raidLevel):15);}
})();
// ---------- Battle feel (2026.10.11.11): next-wave preview, damage numbers, performance mode ----------
const GG_FX_KEY='gemGuardiansFx-'+KEY;
const ggFx=(()=>{let p={};try{p=JSON.parse(localStorage.getItem(GG_FX_KEY)||'{}')||{}}catch(e){}return Object.assign({dmg:true,perf:false},p);})();
function ggFxSave(){try{localStorage.setItem(GG_FX_KEY,JSON.stringify(ggFx))}catch(e){}}
function ggMaxWave(){return G&&G.raidLevel?raidMaxWave(G.raidLevel):15;}
// Mirrors nextWave(): which enemies wave w will contain.
function wavePlanFor(w){
  if(!G)return null;
  const n=Math.min(110,5+3*w+Math.floor(w*w/14));
  const available=['normal'];
  if(G.si>=1||G.raidLevel)available.push('tank');
  if(G.si>=2||G.raidLevel)available.push('runner');
  if(G.si>=3||G.raidLevel)available.push('elite');
  available.push(...enemyClassesFor(G.si,!!G.raidLevel));
  const boss=G.raidLevel?w===raidMaxWave(G.raidLevel):G.mode==='infinite'?w%10===0:w===15;
  const mini=!!G.raidLevel&&w%10===0&&!boss;
  const ord=boss?Math.max(0,n-2):mini?Math.max(0,n-1):n,counts={};
  for(let i=0;i<ord;i++){const k=available[(i+w)%available.length];counts[k]=(counts[k]||0)+1;}
  if(boss){counts.elite=(counts.elite||0)+1;counts.boss=1;}
  if(mini)counts.miniboss=1;
  return {w,boss,mini,counts,total:Object.values(counts).reduce((a,b)=>a+b,0)};
}
const ggEnemyIcons={};
function ggEnemyIcon(kind){
  const k=kind==='miniboss'?'boss':kind;
  if(ggEnemyIcons[k])return ggEnemyIcons[k];
  if(typeof GGA==='undefined'||!GGA.ENEMY_LOOK[k])return '';
  const c=document.createElement('canvas');c.width=64;c.height=64;const x=c.getContext('2d');x.translate(32,k==='boss'?42:38);const s=k==='boss'?1.05:1.3;x.scale(s,s);GGA.drawEnemy(x,k,0,0,0,1);
  return ggEnemyIcons[k]=c.toDataURL();
}
let ggPreviewKey='';
function renderWavePreview(){
  const el=$('#wavePreview');if(!el)return;
  if(!G||G.over){el.classList.add('hide');ggPreviewKey='';return;}
  const max=ggMaxWave(),inf=G.mode==='infinite';
  const w=G.wave===0?1:G.wave+1;
  if(!inf&&w>max){const key='last'+G.wave;if(key!==ggPreviewKey){ggPreviewKey=key;el.innerHTML='<span class="wp-lbl">🏁 Final wave — hold the line!</span>';}el.classList.remove('hide');return;}
  const plan=wavePlanFor(w);const key=w+'|'+G.si+'|'+G.mode+'|'+G.raidLevel+'|'+Object.keys((S.enemyLog||{})).length;
  el.classList.remove('hide');if(key===ggPreviewKey)return;ggPreviewKey=key;
  const order=Object.entries(plan.counts).sort((a,b)=>(a[0]==='boss'||a[0]==='miniboss')?1:(b[0]==='boss'||b[0]==='miniboss')?-1:b[1]-a[1]);
  const log=S.enemyLog||{};
  el.innerHTML='<span class="wp-lbl">'+(G.wave===0?'First wave':'Next')+' '+w+(inf?'':'/'+max)+(plan.boss?' · 👑 BOSS':'')+'</span>'
    +order.map(([k,n])=>{const name=k==='miniboss'?'Raid mini-boss':enemyName(k),isNew=k!=='miniboss'&&!(log[k]&&(log[k].s||log[k].k));
      return '<span class="wp-e'+(k==='boss'||k==='miniboss'?' boss':'')+'" title="'+name+' ×'+n+'"><img alt="'+name+'" src="'+ggEnemyIcon(k)+'">×'+n+(isNew?'<em>NEW</em>':'')+'</span>';}).join('');
}
// ---- Damage numbers ----
function ggFmtNum(v){return v>=1e9?(v/1e9).toFixed(1)+'B':v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e4?(v/1e3).toFixed(0)+'K':v>=1e3?(v/1e3).toFixed(1)+'K':Math.round(v)+'';}
function ggDamagePopup(e,amount,kind,col){
  if(!ggFx.dmg||ggFx.perf||!G)return;
  G.dn=G.dn||[];
  if(G.dn.length>45)G.dn.shift();
  G.dn.push({x:e.x+(Math.random()*12-6),y:e.y-18,t:performance.now(),txt:kind==='text'?amount:ggFmtNum(amount),kind,col});
}
function ggCollectDamage(e,dealt,shieldHit){
  if(!ggFx.dmg||ggFx.perf)return;
  e._dnAcc=(e._dnAcc||0)+dealt;e._dnSh=(e._dnSh||0)+shieldHit;
  const now=G.time||0;
  if(e._dnNext==null)e._dnNext=now+.25;
  if(now>=e._dnNext||e.hp<=0){
    if(e._dnSh>0.5)ggDamagePopup(e,e._dnSh,'shield');
    if(e._dnAcc>0.5)ggDamagePopup(e,e._dnAcc,e._dnAcc>=e.mx*.25?'big':'hit');
    e._dnAcc=0;e._dnSh=0;e._dnNext=now+.3;
  }
}
function renderDamageNumbers(){
  if(!G||!G.dn||!G.dn.length)return;
  const now=performance.now();G.dn=G.dn.filter(d=>now-d.t<850);
  cx.save();cx.textAlign='center';cx.lineJoin='round';
  for(const d of G.dn){const a=(now-d.t)/850,y=d.y-26*a,big=d.kind==='big'||d.kind==='text';
    cx.globalAlpha=a<.7?1:1-(a-.7)/.3;
    cx.font=(big?'900 17px':'800 13px')+' "Trebuchet MS",Verdana,sans-serif';
    const sc=big&&a<.15?1+(.15-a)*3:1;cx.save();cx.translate(d.x,y);cx.scale(sc,sc);
    cx.lineWidth=3.5;cx.strokeStyle='rgba(10,6,24,.9)';cx.strokeText(d.txt,0,0);
    cx.fillStyle=d.kind==='shield'?'#7dd3fc':d.kind==='big'?'#ffd84a':d.kind==='text'?(d.col||'#ffffff'):'#ffffff';cx.fillText(d.txt,0,0);cx.restore();}
  cx.restore();
}
// ---- Performance mode: draw at 30 fps and skip decorative effects ----
let ggSkipFrame=false,ggFpsFrames=0,ggFpsT=0,ggFpsLowCount=0,ggFpsHinted=false;
(function(){
  const origDraw=draw;
  draw=function(){
    if(G&&ggFx.perf){ggSkipFrame=!ggSkipFrame;if(ggSkipFrame)return;}
    const r=origDraw.apply(this,arguments);
    if(G){try{drawPathBadges();renderDamageNumbers();}catch(e){}}
    // Suggest performance mode once if the battle runs slowly.
    if(G&&!G.over&&!ggFx.perf&&!ggFpsHinted){ggFpsFrames++;const now=performance.now();if(!ggFpsT)ggFpsT=now;if(now-ggFpsT>5000){const fps=ggFpsFrames*1000/(now-ggFpsT);ggFpsFrames=0;ggFpsT=now;if(fps<32&&document.visibilityState==='visible'){if(++ggFpsLowCount>=2){ggFpsHinted=true;toast('🐢 The battle is running slowly on this device. Turn on Performance mode in Settings for smoother play.');}}else ggFpsLowCount=0;}}
    return r;
  };
  const origHud=hud;
  hud=function(){const r=origHud.apply(this,arguments);try{renderWavePreview()}catch(e){}return r;};
  const d=$('#ggDmgNums'),p=$('#ggPerf');
  if(d){d.checked=ggFx.dmg;d.onchange=()=>{ggFx.dmg=d.checked;ggFxSave();}}
  if(p){p.checked=ggFx.perf;p.onchange=()=>{ggFx.perf=p.checked;ggFxSave();document.body.classList.toggle('gg-perf',ggFx.perf);toast(ggFx.perf?'Performance mode on: 30 fps and fewer effects':'Performance mode off');}}
  document.body.classList.toggle('gg-perf',ggFx.perf);
})();
// ---------- Upgrade paths (2026.10.11.11) ----------
// When a placed unit goes from boost 2 to boost 3, the player picks one of two specializations.
// Stat bonuses are applied to the placed unit; special effects are resolved in enemyAbilitiesPost().
const UNIT_PATHS={
  Ranged:[{k:'sharp',n:'Sharpshooter',i:'🎯',d:'+30% range and +10% damage'},{k:'rapid',n:'Rapid Fire',i:'⚡',d:'+20% attack speed'}],
  Magic:[{k:'arcane',n:'Arcane Focus',i:'🔮',d:'+15% damage, and hits slow enemies'},{k:'burst',n:'Spell Burst',i:'💥',d:'Hits also deal 30% damage to nearby enemies'}],
  Physical:[{k:'brute',n:'Brute Force',i:'💪',d:'+25% damage'},{k:'whirl',n:'Whirlwind',i:'🌀',d:'Hits also deal 30% damage to nearby enemies'}],
  True:[{k:'exec',n:'Executioner',i:'🗡️',d:'+60% damage to enemies below 30% health'},{k:'pierce',n:'Shieldbreaker',i:'🔨',d:'Triple damage to shields, +10% damage'}],
  economy:[{k:'banker',n:'Banker',i:'🏦',d:'+30% coin income'},{k:'warchest',n:'War Chest',i:'💰',d:'Units in its range deal +10% damage'}],
  support:[{k:'wide',n:'Wide Aura',i:'📡',d:'+40% range'},{k:'empower',n:'Empower',i:'✨',d:'Units in its range deal +8% damage'}]
};
const PATH_BY_KEY={};for(const list of Object.values(UNIT_PATHS))for(const p of list)PATH_BY_KEY[p.k]=p;
function unitPathGroup(u){if(u.id==='barter')return 'economy';const U=UNITS[u.id];if(!U||U.d<=0||u.id==='eternity')return 'support';return UNIT_PATHS[U.t]?U.t:'Physical';}
function unitPathOptions(u){return UNIT_PATHS[unitPathGroup(u)];}
function defaultPath(u){const g=unitPathGroup(u);return {Ranged:'rapid',Magic:u.splash?'arcane':'burst',Physical:u.splash?'brute':'whirl',True:'exec',economy:'banker',support:'empower'}[g];}
function applyPath(u,k){
  if(u.path)return;const opts=unitPathOptions(u);if(!opts.some(p=>p.k===k))k=opts[0].k;u.path=k;
  if(k==='sharp'){u.rg*=1.3;u.d*=1.1;}
  else if(k==='rapid'){u.cd/=1.2;}
  else if(k==='arcane'){u.d*=1.15;}
  else if(k==='burst'){if(!u.splash){u.splash=40;u.splashMult=.3;}else u.d*=1.1;}
  else if(k==='brute'){u.d*=1.25;}
  else if(k==='whirl'){if(!u.splash){u.splash=45;u.splashMult=.3;}else u.d*=1.1;}
  else if(k==='pierce'){u.d*=1.1;}
  else if(k==='wide'){u.rg*=1.4;}
  if(S.settings.attackFx&&G)G.fx.push({kind:'summon',x:u.x,y:u.y,l:.6,max:.6});
}
(function(){
  const origUp=upgradePlacedUnit;
  upgradePlacedUnit=function(u,choice){
    const before=u&&u.bl;const r=origUp.call(this,u);
    if(r&&before===2&&u.bl===3&&!u.path){applyPath(u,choice||defaultPath(u));if(G&&G.sel===u)selUI();
      if(choice)toast(PATH_BY_KEY[u.path].i+' '+PATH_BY_KEY[u.path].n+' chosen for '+UNITS[u.id].n);}
    return r;
  };
  const origSel=selUI;
  selUI=function(){
    const r=origSel.apply(this,arguments);
    const u=G&&G.sel;const q=$('#unitQuick');if(!u||!q||q.classList.contains('hide'))return r;
    if(u.path){const p=PATH_BY_KEY[u.path];const m=document.createElement('div');m.className='quick-path-chosen';m.textContent=p.i+' '+p.n+': '+p.d;const up=$('#bUp');if(up)q.insertBefore(m,up);}
    else if(u.bl===2){
      const up=$('#bUp');if(!up)return r;const cost=boostCost(u);
      const box=document.createElement('div');box.className='quick-paths';
      box.innerHTML='<div class="qp-title">⬆ Boost 3 · '+cost+' coins — choose a path:</div>'+unitPathOptions(u).map(p=>'<button type="button" class="qp-btn" data-path="'+p.k+'"><b>'+p.i+' '+p.n+'</b><small>'+p.d+'</small></button>').join('');
      up.replaceWith(box);
      box.querySelectorAll('[data-path]').forEach(b=>b.onclick=()=>{if(!upgradePlacedUnit(u,b.dataset.path))toast('Not enough coins ('+cost+' needed)');});
      positionQuick();
    }
    return r;
  };
  const origRestart=restartMap;
  restartMap=function(){
    const snap=G&&G.restartSnapshot?G.restartSnapshot.slice():[];
    const r=origRestart.apply(this,arguments);
    try{if(G)for(const u of G.us){if(u.bl>=3&&!u.path){const s=snap.find(x=>x.uid===u.uid&&x.x===u.x&&x.y===u.y);applyPath(u,(s&&s.path)||defaultPath(u));}}}catch(e){}
    return r;
  };
})();
function drawPathBadges(){
  if(!G||ggFx.perf)return;
  cx.save();cx.textAlign='center';cx.textBaseline='middle';cx.font='11px sans-serif';
  for(const u of G.us){if(!u.path)continue;const p=PATH_BY_KEY[u.path];const x=u.x+14,y=u.y-30;
    cx.fillStyle='rgba(18,12,38,.85)';cx.beginPath();cx.arc(x,y,8,0,7);cx.fill();cx.strokeStyle='#facc15';cx.lineWidth=1.2;cx.stroke();cx.fillText(p.i,x,y+.5);}
  cx.restore();
}
// ---------- Daily quests, login rewards and achievements (2026.10.11.11) ----------
const GG_STAT_KEYS=['kills','bossKills','wins','winsHard','summons','rerolls','feeds','placed','waves'];
function ggStat(k,n=1){S.stats=S.stats||{};S.stats[k]=(S.stats[k]||0)+n;}
function ggToday(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
const QUEST_POOL=[
  {id:'kills',stat:'kills',goal:150,n:'Defeat 150 enemies',gems:50,i:'⚔️'},
  {id:'kills2',stat:'kills',goal:400,n:'Defeat 400 enemies',gems:90,i:'⚔️'},
  {id:'wins',stat:'wins',goal:2,n:'Win 2 battles',gems:60,i:'🏆'},
  {id:'hard',stat:'winsHard',goal:1,n:'Win on Hard, Hell or a Raid',gems:90,i:'🔥'},
  {id:'summon',stat:'summons',goal:10,n:'Summon 10 units',gems:60,i:'💎'},
  {id:'reroll',stat:'rerolls',goal:5,n:'Reroll 5 traits',gems:50,i:'✨'},
  {id:'feed',stat:'feeds',goal:5,n:'Feed 5 fruits to your units',gems:50,i:'🍎'},
  {id:'place',stat:'placed',goal:20,n:'Place 20 units in battles',gems:50,i:'🛡️'},
  {id:'waves',stat:'waves',goal:30,n:'Survive 30 waves',gems:70,i:'🌊'},
  {id:'boss',stat:'bossKills',goal:1,n:'Defeat a boss',gems:70,i:'👑'}
];
function questsForDay(day){
  let s=0;for(const ch of day)s=(s*31+ch.charCodeAt(0))%1000003;const rnd=()=>{s=(s*9301+49297)%233280;return s/233280;};
  const pool=QUEST_POOL.slice(),out=[];while(out.length<3&&pool.length){const q=pool.splice(Math.floor(rnd()*pool.length),1)[0];if(!out.some(o=>o.stat===q.stat))out.push(q);}
  return out;
}
function ensureDaily(){
  const today=ggToday();S.stats=S.stats||{};for(const k of GG_STAT_KEYS)S.stats[k]=S.stats[k]||0;
  if(!S.daily||S.daily.day!==today){S.daily={day:today,base:{...S.stats},claimed:[],bonus:false};}
  S.login=S.login||{last:'',day:0};
}
function questProgress(q){const b=(S.daily.base||{})[q.stat]||0;return Math.max(0,Math.min(q.goal,(S.stats[q.stat]||0)-b));}
const LOGIN_REWARDS=[{gems:50},{rerolls:1},{gems:100},{fruit:3},{gems:150},{rerolls:2},{gems:300,rerolls:3}];
function bestFruit(){return STAGES[Math.max(0,Math.min(STAGES.length,S.cleared||0)-1)].food;}
function rewardText(r){const p=[];if(r.gems)p.push('💎 '+r.gems);if(r.rerolls)p.push('🔮 '+r.rerolls+' reroll'+(r.rerolls>1?'s':''));if(r.fruit)p.push('🍎 '+r.fruit+' '+ITEMS[bestFruit()].n);return p.join(' + ');}
function giveReward(r,source){
  if(r.gems){S.gems+=r.gems;}
  if(r.rerolls){S.traitRerolls=(S.traitRerolls||0)+r.rerolls;}
  if(r.fruit){const f=bestFruit();S.bag[f]=(S.bag[f]||0)+r.fruit;discoverItem(f);}
  save(false);gemUI();try{renderAll()}catch(e){}
  toast('🎁 '+source+': '+rewardText(r));
  if(typeof ggJingle==='function')ggJingle(r.rerolls?'levelup':'summon_Rare');
}
const ACHIEVEMENTS=[
  {id:'slayer',n:'Monster Slayer',i:'⚔️',d:'Defeat enemies',get:()=>S.stats.kills||0,tiers:[100,1000,10000,50000]},
  {id:'bosshunter',n:'Boss Hunter',i:'👑',d:'Defeat bosses',get:()=>S.stats.bossKills||0,tiers:[5,25,100]},
  {id:'victor',n:'Victor',i:'🏆',d:'Win battles',get:()=>S.stats.wins||0,tiers:[5,25,100,250]},
  {id:'hardened',n:'Hardened',i:'🔥',d:'Win on Hard, Hell or in Raids',get:()=>S.stats.winsHard||0,tiers:[1,10,50]},
  {id:'summoner',n:'Summoner',i:'💎',d:'Summon units',get:()=>S.stats.summons||0,tiers:[50,250,1000]},
  {id:'collector',n:'Collector',i:'📖',d:'Discover units in the Index',get:()=>(S.discovered||[]).length,tiers:[10,25,45,Object.keys(UNITS).length]},
  {id:'explorer',n:'Explorer',i:'🗺️',d:'Clear maps',get:()=>S.cleared||0,tiers:[3,7,STAGES.length]},
  {id:'stargazer',n:'Stargazer',i:'⭐',d:'Earn map stars',get:()=>Object.values(S.stageStars||{}).reduce((a,b)=>a+(+b||0),0),tiers:[10,30,60,STAGES.length*12]},
  {id:'scholar',n:'Monster Scholar',i:'👹',d:'Discover enemies in the Index',get:()=>Object.values(S.enemyLog||{}).filter(r=>r.s||r.k).length,tiers:[6,10,ENEMY_INDEX.length]},
  {id:'veteran',n:'Veteran',i:'🎖️',d:'Reach player levels',get:()=>S.playerLevel||1,tiers:[10,25,50,100]},
  {id:'ascended',n:'Ascended',i:'🌟',d:'Earn prestige stars (all units)',get:()=>(S.units||[]).reduce((a,u)=>a+(u.st||0),0),tiers:[1,10,30]},
  {id:'raider',n:'Castle Raider',i:'🏰',d:'Clear raid levels',get:()=>S.raidCleared||0,tiers:[1,3,5]},
  {id:'gardener',n:'Gardener',i:'🍎',d:'Feed fruits',get:()=>S.stats.feeds||0,tiers:[50,250,1000]},
  {id:'tinkerer',n:'Trait Tinkerer',i:'✨',d:'Reroll traits',get:()=>S.stats.rerolls||0,tiers:[25,100,500]}
];
const ACH_GEMS=[50,120,250,500];
function achReward(a,t){const r={gems:ACH_GEMS[Math.min(t,ACH_GEMS.length-1)]};if(t===a.tiers.length-1)r.rerolls=2;return r;}
function achClaimable(a){S.ach=S.ach||{};const done=S.ach[a.id]||0;return done<a.tiers.length&&a.get()>=a.tiers[done];}
function questClaimables(){
  ensureDaily();let n=S.login.last!==ggToday()?1:0;
  const qs=questsForDay(S.daily.day);for(const q of qs)if(questProgress(q)>=q.goal&&!S.daily.claimed.includes(q.id))n++;
  if(!S.daily.bonus&&qs.every(q=>S.daily.claimed.includes(q.id)))n++;
  for(const a of ACHIEVEMENTS)if(achClaimable(a))n++;
  return n;
}
function refreshQuestBadge(){try{const n=questClaimables(),b=$('#questBadge');if(b){b.textContent=n;b.classList.toggle('hide',!n);}}catch(e){}}
function msUntilMidnight(){const d=new Date(),m=new Date(d);m.setHours(24,0,0,0);return m-d;}
function renderQuests(){
  ensureDaily();const body=$('#questsBody');if(!body)return;
  const today=ggToday(),loginReady=S.login.last!==today,nextDay=loginReady?(S.login.day%7)+1:S.login.day;
  const left=msUntilMidnight(),hh=Math.floor(left/36e5),mm=Math.floor(left%36e5/6e4);
  const qs=questsForDay(S.daily.day),allDone=qs.every(q=>S.daily.claimed.includes(q.id));
  body.innerHTML=
   '<section class="qs-sec"><h3>🎁 Daily Login <small>Day '+(loginReady?nextDay:S.login.day)+' of 7</small></h3><div class="login-track">'+LOGIN_REWARDS.map((r,i)=>{const d=i+1,got=loginReady?d<nextDay:d<=S.login.day,now=loginReady&&d===nextDay;
      return '<div class="login-day'+(got?' got':'')+(now?' now':'')+(d===7?' big':'')+'"><b>Day '+d+'</b><span>'+rewardText(r)+'</span>'+(got?'<i>✓</i>':'')+'</div>';}).join('')+'</div>'
   +(loginReady?'<button id="claimLogin" class="qs-claim">Claim Day '+nextDay+' reward</button>':'<p class="qs-note">✓ Claimed today. Come back tomorrow for Day '+((S.login.day%7)+1)+' (in '+hh+'h '+mm+'m).</p>')+'</section>'
   +'<section class="qs-sec"><h3>📅 Daily Quests <small>New quests in '+hh+'h '+mm+'m</small></h3>'+qs.map(q=>{const p=questProgress(q),done=p>=q.goal,cl=S.daily.claimed.includes(q.id);
      return '<div class="quest'+(cl?' claimed':done?' done':'')+'"><span class="q-ico">'+q.i+'</span><div class="q-main"><b>'+q.n+'</b><div class="q-bar"><i style="width:'+(100*p/q.goal)+'%"></i></div><small>'+p+' / '+q.goal+' · 💎 '+q.gems+'</small></div>'+(cl?'<span class="q-done">✓</span>':'<button class="qs-claim small" data-quest="'+q.id+'"'+(done?'':' disabled')+'>'+(done?'Claim':'…')+'</button>')+'</div>';}).join('')
   +'<div class="quest bonus'+(S.daily.bonus?' claimed':allDone?' done':'')+'"><span class="q-ico">🧰</span><div class="q-main"><b>Daily bonus chest</b><small>Finish all 3 quests · 💎 50 + 🔮 1 reroll</small></div>'+(S.daily.bonus?'<span class="q-done">✓</span>':'<button class="qs-claim small" id="claimBonus"'+(allDone?'':' disabled')+'>'+(allDone?'Open':'🔒')+'</button>')+'</div></section>'
   +'<section class="qs-sec"><h3>🏅 Achievements <small>'+ACHIEVEMENTS.reduce((a,x)=>a+((S.ach||{})[x.id]||0),0)+' / '+ACHIEVEMENTS.reduce((a,x)=>a+x.tiers.length,0)+' tiers</small></h3><div class="ach-grid">'+ACHIEVEMENTS.map(a=>{const done=(S.ach||{})[a.id]||0,maxed=done>=a.tiers.length,goal=a.tiers[Math.min(done,a.tiers.length-1)],v=a.get(),can=achClaimable(a);
      return '<div class="ach'+(maxed?' maxed':can?' done':'')+'"><span class="a-ico">'+a.i+'</span><div class="q-main"><b>'+a.n+' <span class="a-tier">'+'★'.repeat(done)+'<i>'+'★'.repeat(a.tiers.length-done)+'</i></span></b><small>'+a.d+(maxed?' · complete!':': '+Math.min(v,goal).toLocaleString()+' / '+goal.toLocaleString()+' · '+rewardText(achReward(a,done)))+'</small>'+(maxed?'':'<div class="q-bar"><i style="width:'+Math.min(100,100*v/goal)+'%"></i></div>')+'</div>'+(can?'<button class="qs-claim small" data-ach="'+a.id+'">Claim</button>':maxed?'<span class="q-done">🏅</span>':'')+'</div>';}).join('')+'</div></section>';
  const cl=$('#claimLogin');if(cl)cl.onclick=()=>{ensureDaily();if(S.login.last===ggToday())return;S.login.day=(S.login.day%7)+1;S.login.last=ggToday();giveReward(LOGIN_REWARDS[S.login.day-1],'Daily login Day '+S.login.day);renderQuests();refreshQuestBadge();};
  body.querySelectorAll('[data-quest]').forEach(b=>b.onclick=()=>{const q=QUEST_POOL.find(x=>x.id===b.dataset.quest);if(!q||questProgress(q)<q.goal||S.daily.claimed.includes(q.id))return;S.daily.claimed.push(q.id);ggStat('questsDone');giveReward({gems:q.gems},'Quest complete');renderQuests();refreshQuestBadge();});
  const bo=$('#claimBonus');if(bo)bo.onclick=()=>{if(S.daily.bonus||!qs.every(q=>S.daily.claimed.includes(q.id)))return;S.daily.bonus=true;giveReward({gems:50,rerolls:1},'Daily bonus chest');renderQuests();refreshQuestBadge();};
  body.querySelectorAll('[data-ach]').forEach(b=>b.onclick=()=>{const a=ACHIEVEMENTS.find(x=>x.id===b.dataset.ach);if(!a||!achClaimable(a))return;const t=S.ach[a.id]||0;S.ach[a.id]=t+1;giveReward(achReward(a,t),a.n+' '+'★'.repeat(t+1));renderQuests();refreshQuestBadge();});
}
(function(){
  const open=()=>{renderQuests();$('#questsModal').classList.remove('hide');};
  const b=$('#bQuests');if(b)b.onclick=open;
  const c=$('#closeQuests');if(c)c.onclick=()=>$('#questsModal').classList.add('hide');
  // ---- stat tracking ----
  const wrap=(name,fn)=>{const orig=window[name];if(typeof orig!=='function')return;window[name]=function(...a){const pre=fn.pre?fn.pre(...a):null;const r=orig.apply(this,a);try{fn(r,pre,...a)}catch(e){}return r;};};
  const pullH=(r,pre,n)=>{if(S.gems<pre)ggStat('summons',n===10?10:1);};pullH.pre=()=>S.gems;wrap('pull',pullH);
  wrap('rollSelectedTrait',r=>{if(r)ggStat('rerolls');});
  const bagCount=()=>Object.values(S.bag||{}).reduce((a,b)=>a+(+b||0),0);
  const feedH=(r,pre)=>{const used=pre-bagCount();if(used>0)ggStat('feeds',used);};feedH.pre=bagCount;wrap('feed',feedH);
  const finH=(r,pre,win)=>{if(win){ggStat('wins');if(G&&(G.mode==='hard'||G.mode==='hell'||G.raidLevel))ggStat('winsHard');}save(false);refreshQuestBadge();};wrap('finish',finH);
  let trackG=null,lastLen=0,lastWave=0;
  const origHud=hud;hud=function(){const r=origHud.apply(this,arguments);
    if(G){if(G!==trackG){trackG=G;lastLen=G.us.length;lastWave=G.wave;}else{if(G.us.length>lastLen)ggStat('placed',G.us.length-lastLen);lastLen=G.us.length;if(G.wave>lastWave){if(lastWave>0)ggStat('waves',G.wave-lastWave);lastWave=G.wave;}}}
    return r;};
  setInterval(refreshQuestBadge,4000);
  setTimeout(()=>{ensureDaily();refreshQuestBadge();},1500); // the pulsing red badge on 🎯 shows when rewards are ready
})();
load();afkPendingUI();syncSettings();ensureBanner();updateBannerClock();setInterval(updateBannerClock,1000);gemUI();renderAll();save(false);requestAnimationFrame(loop);
// ---------- Sound director (2026.10.11.6) ----------
// Connects the original synthesized music & sound effects (GGS) to the game. Audio settings are
// stored separately from the save file (they never change progress, export or import).
const GG_AUDIO=typeof GGS!=='undefined'?GGS:null;
function ggSfx(n){if(GG_AUDIO)try{GG_AUDIO.sfx(n)}catch(e){}}
function ggJingle(n){if(GG_AUDIO)try{GG_AUDIO.jingle(n)}catch(e){}}
const GG_RARITY_ORDER=['Common','Rare','Epic','Legendary','Exclusive','Mythic','Secret'];
function ggAttackSound(u){
  if(!GG_AUDIO)return;
  if(u._snd===undefined){let k=null;try{k=attackFxKind(u)}catch(e){}
    if(!k){const t=UNITS[u.id]&&UNITS[u.id].t;k=t==='Ranged'?'arrow':t==='Magic'?'bolt':t==='Physical'?'slash':t==='True'?'beam':'arrow';}
    u._snd=k;}
  ggSfx(u.splash&&Math.random()<.35?'explode':u._snd);
}
function ggDeathSounds(){if(!GG_AUDIO||!G)return;let n=0;for(const e of G.en)if(e.hp<=0&&!e.leak)n++;if(n)ggSfx('death');}
function ggAudioSyncUI(){
  if(!GG_AUDIO)return;const p=GG_AUDIO.prefs,b=$('#bSound');
  if(b){b.textContent=p.muted?'🔇':'🔊';b.title=p.muted?'Sound is off — tap to turn on':'Sound is on — tap to mute';b.setAttribute('aria-pressed',String(!p.muted));}
  const m=$('#ggMusicVol'),s=$('#ggSfxVol'),mu=$('#ggMute');
  if(m){m.value=Math.round(p.music*100);$('#ggMusicVal').textContent=m.value+'%';}
  if(s){s.value=Math.round(p.sfx*100);$('#ggSfxVal').textContent=s.value+'%';}
  if(mu)mu.checked=!p.muted;
}
(function(){
  if(!GG_AUDIO){const b=$('#bSound');if(b)b.classList.add('hide');return;}
  GG_AUDIO.loadPrefs('gemGuardiansAudio-'+KEY);
  const unlock=()=>{GG_AUDIO.unlock();GG_AUDIO.applyVolumes();};
  ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));
  // UI clicks: every button gives soft feedback; tabs get their own two-note chime.
  document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('button');if(!b||b.disabled)return;
    if(b.closest('.tabs'))ggSfx('tab');else if(b.id!=='bSound')ggSfx('click');},true);
  // Controls
  $('#bSound').onclick=()=>{GG_AUDIO.unlock();GG_AUDIO.prefs.muted=!GG_AUDIO.prefs.muted;GG_AUDIO.savePrefs();GG_AUDIO.applyVolumes();ggAudioSyncUI();if(!GG_AUDIO.prefs.muted)ggSfx('claim');};
  $('#ggMusicVol').oninput=e=>{GG_AUDIO.prefs.music=e.target.value/100;GG_AUDIO.applyVolumes();ggAudioSyncUI();};
  $('#ggSfxVol').oninput=e=>{GG_AUDIO.prefs.sfx=e.target.value/100;GG_AUDIO.applyVolumes();ggAudioSyncUI();};
  $('#ggSfxVol').onchange=()=>{GG_AUDIO.savePrefs();ggSfx('coin');};
  $('#ggMusicVol').onchange=()=>GG_AUDIO.savePrefs();
  $('#ggMute').onchange=e=>{GG_AUDIO.prefs.muted=!e.target.checked;GG_AUDIO.savePrefs();GG_AUDIO.applyVolumes();ggAudioSyncUI();};
  ggAudioSyncUI();
  // Wrap player actions (original functions keep doing all of the work).
  const wrap=(name,after)=>{const orig=window[name];if(typeof orig!=='function')return;window[name]=function(...a){const pre=after.pre?after.pre(...a):null;const r=orig.apply(this,a);try{after(r,pre,...a)}catch(e){}return r;};};
  const pullHook=(r,pre)=>{if(S.gems>=pre)return;const html=($('#res')&&$('#res').innerHTML)||'';let best=0;
    GG_RARITY_ORDER.forEach((k,i)=>{if(html.includes('class="'+k+'"'))best=Math.max(best,i);});
    const k=GG_RARITY_ORDER[best];if(typeof autoSummonActive!=='undefined'&&autoSummonActive&&best<3)ggSfx('claim');else ggJingle('summon_'+(k==='Exclusive'?'Legendary':k));};
  pullHook.pre=()=>S.gems;wrap('pull',pullHook);
  const traitHook=(r,pre,auto)=>{if(!r)return;const u=S.units.find(u=>String(u.uid)===$('#traitUnit').value);const rar=u&&TRAITS[u.trait]?TRAITS[u.trait].rarity:'';
    if(rar==='Mythic')ggJingle('trait_Mythic');else if(rar==='Legendary')ggJingle('levelup');else if(!auto)ggSfx('reroll');};
  wrap('rollSelectedTrait',traitHook);
  const feedHook=(r,pre)=>{const i=S.units.find(x=>x.uid===+$('#feedTo').value);if(!i)return;if(i.lv>pre)ggJingle('levelup');else ggSfx('feed');};
  feedHook.pre=()=>{const i=S.units.find(x=>x.uid===+$('#feedTo').value);return i?i.lv:0;};wrap('feed',feedHook);
  const prestigeHook=(r,pre,uid)=>{const i=S.units.find(x=>x.uid===uid);if(i&&i.st>pre)ggJingle('prestige');};
  prestigeHook.pre=uid=>{const i=S.units.find(x=>x.uid===uid);return i?i.st:0;};wrap('prestige',prestigeHook);
  const sellHook=(r,pre)=>{if(S.gems>pre)ggSfx('sell');};sellHook.pre=()=>S.gems;wrap('sell',sellHook);
  const claimHook=(r,pre,silent)=>{if(!silent&&S.gems>pre)ggSfx('claim');};claimHook.pre=()=>S.gems;wrap('claimAfkRewards',claimHook);
  // Director: watches the game state and picks music, plus battle events.
  let last={lv:null,lives:null,wave:null,over:null,us:0,bl:0,g:null};
  function battleShown(){return !!(G&&$('#arena')&&!$('#arena').classList.contains('hide'));}
  function tick(){
    if(!GG_AUDIO.ctx)return;
    if(last.lv!=null&&S.playerLevel>last.lv)ggJingle('levelup');last.lv=S.playerLevel;
    let theme='menu',inten=.35;
    if(typeof afkActive!=='undefined'&&afkActive){theme='afk';}
    else if(battleShown()){
      if(last.g!==G){last.g=G;last.lives=G.lives;last.wave=G.wave;last.over=G.over;last.us=G.us.length;last.bl=G.us.reduce((a,u)=>a+u.bl,0);}
      const bl=G.us.reduce((a,u)=>a+u.bl,0);
      if(G.us.length>last.us)ggSfx('place');else if(G.us.length<last.us)ggSfx('sell');else if(bl>last.bl)ggSfx('upgrade');
      last.us=G.us.length;last.bl=bl;
      if(G.lives<last.lives&&!G.over)ggSfx('life');last.lives=G.lives;
      if(G.wave>last.wave){if(G.boss){ggJingle('boss');GG_AUDIO.duck(2);}else ggSfx('wave');}last.wave=G.wave;
      if(G.over&&!last.over){GG_AUDIO.stopMusic();ggJingle(G.victory?'victory':'defeat');}last.over=G.over;
      if(G.over)theme=null;
      else{
        const max=G.mode==='infinite'?30:(G.raidLevel?raidMaxWave(G.raidLevel):15);
        theme=G.en.some(e=>e.boss)?'boss':artThemeKey();inten=Math.min(1,.25+.75*(G.wave/Math.max(1,max)));
      }
    }else last.g=null;
    if(theme){if(GG_AUDIO.current!==theme)GG_AUDIO.startTrack(theme);GG_AUDIO.setIntensity(inten);}
    else if(GG_AUDIO.current)GG_AUDIO.stopMusic();
  }
  setInterval(tick,250);
})();
// ---------- Android / phone support (2026.10.11.7) ----------
// Phone layout helpers, landscape full-screen battles and the Android back button.
// Device preferences are stored on this device only (not in the save).
const GG_DEVICE_KEY='gemGuardiansDevice-'+KEY;
const ggDevice=(()=>{let p={};try{p=JSON.parse(localStorage.getItem(GG_DEVICE_KEY)||'{}')||{}}catch(e){}return p;})();
function ggSaveDevice(){try{localStorage.setItem(GG_DEVICE_KEY,JSON.stringify(ggDevice))}catch(e){}}
function ggIsPhone(){return !!(window.matchMedia&&matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<=600);}
function ggAutoFullscreen(){return ggDevice.autoFull!==undefined?!!ggDevice.autoFull:ggIsPhone();}
// Keep the battle map at its true 16:9 shape in full screen (no stretching) and keep taps accurate.
function ggFitArena(){
  const a=$('#arena'),w=a&&a.querySelector('.battle-canvas-wrap');if(!w)return;
  if(!a.classList.contains('map-fullscreen')){w.style.width='';w.style.height='';return;}
  const hud=a.querySelector('.panel.row'),side=getComputedStyle(a).flexDirection==='row';
  const cs=getComputedStyle(a),padX=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),padY=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
  let aw=a.clientWidth-padX,ah=a.clientHeight-padY;
  if(hud){if(side)aw-=hud.offsetWidth+6;else ah-=hud.offsetHeight+5;}
  let ww=Math.max(160,Math.min(aw,ah*16/9)),hh=ww*9/16;
  w.style.width=Math.floor(ww)+'px';w.style.height=Math.floor(hh)+'px';
  if(G&&G.sel)requestAnimationFrame(positionQuick);
}
addEventListener('resize',()=>requestAnimationFrame(ggFitArena));
if(screen.orientation&&screen.orientation.addEventListener)screen.orientation.addEventListener('change',()=>setTimeout(ggFitArena,250));
function ggRotateHint(){
  const a=$('#arena'),w=a&&a.querySelector('.battle-canvas-wrap');if(!w)return;
  let h=w.querySelector('.gg-rotate-hint');
  const want=a.classList.contains('map-fullscreen')&&ggIsPhone()&&innerHeight>innerWidth;
  if(want&&!h){h=document.createElement('div');h.className='gg-rotate-hint';h.innerHTML='<span class="ph">📱</span><br>Turn your phone sideways<br><small style="font-weight:400;color:#c8bce9">for a bigger battle map</small>';w.appendChild(h);setTimeout(()=>h&&h.remove(),3500);}
  else if(!want&&h)h.remove();
}
// Wrap the original full-screen switch: also lock landscape on Android and size the map.
(function(){
  const orig=setMapFullscreen;
  setMapFullscreen=function(on){
    orig(on);
    if(on){const lock=()=>{try{const p=screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape');if(p&&p.catch)p.catch(()=>{});}catch(e){}};
      if(document.fullscreenElement)lock();else document.addEventListener('fullscreenchange',lock,{once:true});
      ggBackArm();}
    else{try{screen.orientation&&screen.orientation.unlock&&screen.orientation.unlock()}catch(e){}}
    requestAnimationFrame(()=>{ggFitArena();ggRotateHint();});setTimeout(ggFitArena,350);
  };
  const b=$('#bFullMap');if(b)b.onclick=()=>setMapFullscreen(!$('#arena').classList.contains('map-fullscreen'));
  document.addEventListener('fullscreenchange',()=>setTimeout(ggFitArena,120));
})();
// Phones: open battles full screen in landscape when the player starts one (needs a tap, so Auto Restart is unaffected).
(function(){
  const orig=startBattle;
  startBattle=function(...a){
    const r=orig.apply(this,a);
    try{const tapped=!navigator.userActivation||navigator.userActivation.isActive;
      const guiding=$('#ggGuide')&&!$('#ggGuide').classList.contains('hide');
      if(ggAutoFullscreen()&&tapped&&!guiding&&!$('#arena').classList.contains('map-fullscreen')&&!$('#arena').classList.contains('hide'))setMapFullscreen(true);}catch(e){}
    return r;
  };
})();
// Header "More" menu on phones
(function(){
  const h=document.querySelector('header'),m=$('#bMore');if(!h||!m)return;
  const close=()=>{h.classList.remove('more-open');m.textContent='☰';m.setAttribute('aria-expanded','false');};
  m.onclick=e=>{e.stopPropagation();const open=!h.classList.contains('more-open');h.classList.toggle('more-open',open);m.textContent=open?'✕':'☰';m.setAttribute('aria-expanded',String(open));if(open)ggBackArm();};
  h.querySelectorAll('.hdr-more').forEach(b=>b.addEventListener('click',()=>setTimeout(close,0)));
  document.addEventListener('click',e=>{if(h.classList.contains('more-open')&&!h.contains(e.target))close();});
  window.ggCloseMore=()=>{if(h.classList.contains('more-open')){close();return true}return false;};
})();
// Settings: phone battle preference
(function(){
  const el=$('#ggAutoFull');if(!el)return;
  el.checked=ggAutoFullscreen();
  el.onchange=()=>{ggDevice.autoFull=el.checked;ggSaveDevice();toast(el.checked?'Battles will open full screen in landscape':'Battles will open in the normal page view');};
})();
// Android back button: close the top-most panel first instead of leaving the game.
let ggBackArmed=false,ggBackExitAt=0;
function ggBackArm(){if(ggBackArmed)return;try{history.pushState({gg:1},'');ggBackArmed=true;}catch(e){}}
function ggToast(t){let el=document.querySelector('.gg-back-toast');if(!el){el=document.createElement('div');el.className='gg-back-toast';document.body.appendChild(el);}el.textContent=t;el.style.display='block';clearTimeout(el._t);el._t=setTimeout(()=>el.style.display='none',1900);}
function ggVisible(el){return !!(el&&!el.classList.contains('hide')&&getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden');}
function ggCloseTop(){
  if(window.ggCloseMore&&ggCloseMore())return true;
  const q=$('#unitQuick');if(ggVisible(q)&&q.innerHTML){hideQuick();if(G)G.sel=null;return true;}
  if(G&&G.pl){G.pl=null;if(typeof refreshPlacementBar==='function')refreshPlacementBar();return true;}
  const dialogs=[...document.querySelectorAll('[role=dialog]')].filter(ggVisible);
  const d=dialogs.sort((a,b)=>(parseInt(getComputedStyle(b).zIndex)||0)-(parseInt(getComputedStyle(a).zIndex)||0))[0];
  if(d){
    if(d.id==='afkOverlay'){const x=$('#exitAfk');if(x)x.click();return true;}
    const btn=d.querySelector('button[id^=close],.gg-tutorial-skip,[data-close]')||[...d.querySelectorAll('button')].find(b=>/✕|×|^close$|close/i.test(b.textContent.trim()));
    if(btn)btn.click();else d.classList.add('hide');return true;
  }
  if($('#arena')&&$('#arena').classList.contains('map-fullscreen')){setMapFullscreen(false);return true;}
  if(G&&ggVisible($('#arena'))&&!G.over){ggToast('Use “Leave stage” to exit the battle');return true;}
  const cur=document.querySelector('.tabs button.on');
  if(cur&&cur.dataset.tab!=='summon'){const s=document.querySelector('.tabs [data-tab=summon]');if(s){s.click();scrollTo({top:0,behavior:'smooth'});return true;}}
  return false;
}
addEventListener('popstate',()=>{
  ggBackArmed=false;
  if(ggCloseTop()){ggBackArm();return;}
  const now=Date.now();
  if(now-ggBackExitAt<2000){try{save(false)}catch(e){}history.back();return;}
  ggBackExitAt=now;ggToast('Press back again to exit');ggBackArm();
});
// Arm on the first interaction (browsers ignore history entries added without a user gesture).
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>ggBackArm(),{capture:true,passive:true}));
setTimeout(guideAutoStart,1200);
renderVersionLabels();requestPersistentStorage();
// ---------- Visual overhaul (2026.10.11.15) ----------
// Hand-drawn SVG icon set (replaces emoji, which look different on every phone),
// richer summon altar, summon reveal animation and polished headers. Game logic is unchanged.
const GGI=(()=>{
  const d=(body,vb='0 0 24 24')=>`<svg class="ggi" viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
  const I={
    gem:d('<defs><linearGradient id="ggiGem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6fdff"/><stop offset=".5" stop-color="#5fe3f5"/><stop offset="1" stop-color="#2c74ff"/></linearGradient></defs><path d="M6.5 3.5h11L22 9l-10 12L2 9z" fill="url(#ggiGem)" stroke="#0b2a55" stroke-width="1.2" stroke-linejoin="round"/><path d="M2 9h20M6.5 3.5 9 9l3 12 3-12 2.5-5.5" fill="none" stroke="#0b2a55" stroke-width=".9" stroke-linejoin="round" opacity=".55"/><path d="M8 5.2 9.4 8" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>'),
    map:d('<path d="M3 6.2 8.5 4l7 2.4L21 4.2v13.6L15.5 20l-7-2.4L3 19.8z" fill="#e9cf8f" stroke="#5a3d12" stroke-width="1.2" stroke-linejoin="round"/><path d="M8.5 4v13.6M15.5 6.4V20" stroke="#5a3d12" stroke-width=".9" opacity=".5"/><path d="M5.5 15.5c2-1 3-3.5 5.5-3.5s3 2 5-1" fill="none" stroke="#c0392b" stroke-width="1.4" stroke-dasharray="1.6 1.4" stroke-linecap="round"/><path d="M17.6 6.6a2 2 0 1 1-.01 0zM17.6 11.2l-1.5-2.6h3z" fill="#2fbf71" stroke="#145a34" stroke-width=".8"/>'),
    swords:d('<path d="M4 3.5 14.6 14.1l1.8-1.8L5.8 1.7 3.3 1.2z" fill="#dfe8f5" stroke="#3b4a63" stroke-width="1" stroke-linejoin="round"/><path d="M20 3.5 9.4 14.1l-1.8-1.8L18.2 1.7l2.5-.5z" fill="#dfe8f5" stroke="#3b4a63" stroke-width="1" stroke-linejoin="round"/><path d="m6.2 13.2 4.6 4.6M13.2 17.8l4.6-4.6" stroke="#e0a526" stroke-width="2.2" stroke-linecap="round"/><path d="m8.4 16.6-3.6 3.6M15.6 16.6l3.6 3.6" stroke="#7a4a18" stroke-width="2.4" stroke-linecap="round"/><circle cx="4.3" cy="20.6" r="1.3" fill="#e0a526"/><circle cx="19.7" cy="20.6" r="1.3" fill="#e0a526"/>'),
    shield:d('<path d="M12 2.2 20 5v6.4c0 5-3.4 8.6-8 10.4-4.6-1.8-8-5.4-8-10.4V5z" fill="#3d7bf5" stroke="#10275a" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 4.3 18 6.4v5c0 3.8-2.4 6.6-6 8.2z" fill="#255bd0"/><path d="M12 7.2l1.4 2.9 3.1.4-2.3 2.1.6 3.1-2.8-1.6-2.8 1.6.6-3.1-2.3-2.1 3.1-.4z" fill="#ffd34d" stroke="#8a5a00" stroke-width=".6" stroke-linejoin="round"/>'),
    moon:d('<path d="M15.5 3.2A8.8 8.8 0 1 0 20.8 16 7.2 7.2 0 0 1 15.5 3.2z" fill="#b9a3ff" stroke="#3d2b8a" stroke-width="1.2" stroke-linejoin="round"/><path d="M13.6 5.6a7 7 0 0 0 5.3 11.6" fill="none" stroke="#fff" stroke-width=".9" opacity=".45"/><path d="m19 3.3.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5zM21.6 9.2l.35.9.9.35-.9.35-.35.9-.35-.9-.9-.35.9-.35z" fill="#ffe27a"/>'),
    sparkle:d('<path d="m10 2 1.9 5.6L17.5 9.5l-5.6 1.9L10 17l-1.9-5.6L2.5 9.5l5.6-1.9z" fill="#ffd34d" stroke="#8a5a00" stroke-width="1" stroke-linejoin="round"/><path d="m18.5 13 1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill="#ff9be8" stroke="#7a1f63" stroke-width=".8" stroke-linejoin="round"/><circle cx="19" cy="5" r="1.4" fill="#7ff3ff"/>'),
    book:d('<path d="M2.5 5.5C5.5 4 9 4.2 12 6c3-1.8 6.5-2 9.5-.5v13c-3-1.5-6.5-1.3-9.5.5-3-1.8-6.5-2-9.5-.5z" fill="#f4e6c4" stroke="#5a3d12" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 6v13" stroke="#5a3d12" stroke-width="1"/><path d="M4.5 8.6c1.8-.6 3.8-.5 5.5.3M4.5 11.4c1.8-.6 3.8-.5 5.5.3M14 8.9c1.7-.8 3.7-.9 5.5-.3M14 11.7c1.7-.8 3.7-.9 5.5-.3" stroke="#b08a4a" stroke-width=".9" stroke-linecap="round"/><path d="M16.5 4.4v6l1.3-1 1.3 1V4.5z" fill="#e84b5f"/>'),
    bag:d('<path d="M8.5 6.5V5a3.5 3.5 0 0 1 7 0v1.5" fill="none" stroke="#5a3415" stroke-width="1.6"/><path d="M4.5 8.2c0-1 .8-1.7 1.8-1.7h11.4c1 0 1.8.7 1.8 1.7l.8 10.6c.1 1.3-.9 2.2-2.1 2.2H5.8c-1.2 0-2.2-.9-2.1-2.2z" fill="#b8733a" stroke="#4a2a10" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.4 10.5h15.2" stroke="#4a2a10" stroke-width="1"/><rect x="10" y="9" width="4" height="3.6" rx=".8" fill="#ffd34d" stroke="#8a5a00" stroke-width=".8"/>'),
    scroll:d('<path d="M6 3.5h11.5a2 2 0 0 1 2 2V17" fill="none" stroke="#5a3d12" stroke-width="1.2"/><path d="M5 5.5a2 2 0 0 1 2-2h10.5v14.2a2.8 2.8 0 0 1-2.8 2.8H6.5A2.5 2.5 0 0 1 4 18V6.5" fill="#f4e6c4" stroke="#5a3d12" stroke-width="1.2" stroke-linejoin="round"/><path d="m7.5 9 1.2 1.2 2.3-2.4M7.5 13.5l1.2 1.2 2.3-2.4" fill="none" stroke="#1f9d55" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 9.2h3.2M12.5 13.7h3.2" stroke="#8a6a3a" stroke-width="1.2" stroke-linecap="round"/>'),
    soundOn:d('<path d="M3.5 9.2h3.6L12 5v14l-4.9-4.2H3.5z" fill="#f3f0ff" stroke="#f3f0ff" stroke-width="1" stroke-linejoin="round"/><path d="M15.2 8.8a4.6 4.6 0 0 1 0 6.4M17.8 6.3a8.2 8.2 0 0 1 0 11.4" fill="none" stroke="#7ff3ff" stroke-width="1.8" stroke-linecap="round"/>'),
    soundOff:d('<path d="M3.5 9.2h3.6L12 5v14l-4.9-4.2H3.5z" fill="#c9c2ea" stroke="#c9c2ea" stroke-width="1" stroke-linejoin="round"/><path d="m15.5 9.3 5.4 5.4M20.9 9.3l-5.4 5.4" stroke="#ff6b81" stroke-width="2" stroke-linecap="round"/>'),
    gear:d('<path d="M10.3 2.5h3.4l.5 2.6 1.7.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.7 2.6.5v3.4l-2.6.5-.8 1.7 1.5 2.2-2.4 2.4-2.2-1.5-1.7.8-.5 2.6h-3.4l-.5-2.6-1.7-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.7-2.6-.5v-3.4l2.6-.5.8-1.7-1.5-2.2 2.4-2.4 2.2 1.5 1.7-.8z" fill="#dcd6f7" stroke="#3a3366" stroke-width="1" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.3" fill="#3a3366"/>'),
    menu:d('<path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="#f3f0ff" stroke-width="2.4" stroke-linecap="round"/>'),
    coin:d('<circle cx="12" cy="12" r="9" fill="#ffc533" stroke="#8a5a00" stroke-width="1.3"/><circle cx="12" cy="12" r="6.4" fill="none" stroke="#c98a1b" stroke-width="1.1"/><path d="M12 7.6v8.8M9.8 9.6c.4-1 1.3-1.4 2.4-1.4 1.6 0 2.4.8 2.4 1.7 0 2.2-4.8 1.3-4.8 3.9 0 1 .9 1.8 2.5 1.8 1.2 0 2.1-.5 2.5-1.5" fill="none" stroke="#8a5a00" stroke-width="1.3" stroke-linecap="round"/>'),
    heart:d('<path d="M12 20.5S3 15 3 9a4.6 4.6 0 0 1 9-1.6A4.6 4.6 0 0 1 21 9c0 6-9 11.5-9 11.5z" fill="#ff4d6d" stroke="#7a1028" stroke-width="1.2" stroke-linejoin="round"/><path d="M6.5 7.6a2.4 2.4 0 0 1 2.6-1.2" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>'),
    wave:d('<path d="M2.5 15c2.2 0 2.2-2 4.4-2s2.2 2 4.4 2 2.2-2 4.4-2 2.2 2 4.4 2v5H2.5z" fill="#2f86ff" stroke="#0c2f6b" stroke-width="1.1" stroke-linejoin="round"/><path d="M2.5 11.5c2.2 0 2.2-6.5 7-6.5 3.3 0 4 2.8 2 4-1.2.7-2.6-.4-1.8-1.4" fill="none" stroke="#7ff3ff" stroke-width="1.8" stroke-linecap="round"/>'),
    hourglass:d('<path d="M6 2.5h12M6 21.5h12" stroke="#c98a1b" stroke-width="2" stroke-linecap="round"/><path d="M7.5 3c0 4.5 4 6 4.5 9-.5 3-4.5 4.5-4.5 9h9c0-4.5-4-6-4.5-9 .5-3 4.5-4.5 4.5-9z" fill="#d6f3ff" stroke="#3b4a63" stroke-width="1.1" stroke-linejoin="round"/><path d="M9.3 6.5h5.4L12 10.5zM9 20c.3-2 2-3 3-3.6 1 .6 2.7 1.6 3 3.6z" fill="#ffc533"/>'),
    demon:d('<path d="M4 4.5 7.4 8M20 4.5 16.6 8" stroke="#ffd0d0" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="13" r="8" fill="#e53950" stroke="#5e0a18" stroke-width="1.2"/><path d="m7.6 11.2 3 1.1M16.4 11.2l-3 1.1" stroke="#2a0008" stroke-width="1.5" stroke-linecap="round"/><circle cx="9.3" cy="13.4" r="1" fill="#ffe27a"/><circle cx="14.7" cy="13.4" r="1" fill="#ffe27a"/><path d="M8.8 17c1.9-1.2 4.5-1.2 6.4 0" fill="none" stroke="#2a0008" stroke-width="1.4" stroke-linecap="round"/>'),
    star:d('<path d="m12 2.6 2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8l-5.8 3.3 1.4-6.4-4.9-4.4 6.5-.7z" fill="#ffd34d" stroke="#8a5a00" stroke-width="1.1" stroke-linejoin="round"/><path d="m9.6 9.2 1.6-3" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>'),
    trophy:d('<path d="M7 3.5h10v5a5 5 0 0 1-10 0z" fill="#ffc533" stroke="#8a5a00" stroke-width="1.1"/><path d="M7 5H4.2c0 3 1.2 4.6 3.3 4.9M17 5h2.8c0 3-1.2 4.6-3.3 4.9" fill="none" stroke="#8a5a00" stroke-width="1.3"/><path d="M10.5 13.2h3l.6 4h-4.2zM8 17.2h8v3.3H8z" fill="#c98a1b" stroke="#8a5a00" stroke-width="1"/>'),
    save:d('<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3h11L20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" fill="#5b8cff" stroke="#14286b" stroke-width="1.1"/><path d="M7.5 3h8v5h-8z" fill="#dfe8f5"/><path d="M7 13h10v7H7z" fill="#f3f0ff"/>'),
    news:d('<rect x="3" y="4.5" width="18" height="15" rx="2" fill="#f3f0ff" stroke="#3a3366" stroke-width="1.1"/><rect x="5.5" y="7" width="6" height="5" rx=".8" fill="#7b5cff"/><path d="M13.5 7.8h5M13.5 10.6h5M5.5 14.6h13M5.5 17h9" stroke="#8a84b0" stroke-width="1.2" stroke-linecap="round"/>'),
    phone:d('<rect x="6.5" y="2.5" width="11" height="19" rx="2.4" fill="#2b2650" stroke="#dcd6f7" stroke-width="1.3"/><rect x="8.2" y="5" width="7.6" height="12.5" rx=".8" fill="#5fe3f5"/><circle cx="12" cy="19.4" r=".9" fill="#dcd6f7"/>'),
    cap:d('<path d="M12 4 2 9l10 5 10-5z" fill="#3d2b8a" stroke="#dcd6f7" stroke-width="1.1" stroke-linejoin="round"/><path d="M6 11.2v4.3c1.7 1.6 3.8 2.3 6 2.3s4.3-.7 6-2.3v-4.3L12 14z" fill="#574a9e" stroke="#dcd6f7" stroke-width="1.1" stroke-linejoin="round"/><path d="M20.5 9.8v5" stroke="#ffd34d" stroke-width="1.4" stroke-linecap="round"/><circle cx="20.5" cy="15.5" r="1.1" fill="#ffd34d"/>'),
    lock:d('<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="#c9c2ea" stroke-width="1.8"/><rect x="5.5" y="10.5" width="13" height="10" rx="2" fill="#ffc533" stroke="#8a5a00" stroke-width="1.1"/><circle cx="12" cy="15" r="1.4" fill="#8a5a00"/><path d="M12 15.5v2.2" stroke="#8a5a00" stroke-width="1.3" stroke-linecap="round"/>'),
    user:d('<circle cx="12" cy="8.2" r="4.2" fill="#dcd6f7" stroke="#3a3366" stroke-width="1.1"/><path d="M4 20.5c.8-4.2 4-6.3 8-6.3s7.2 2.1 8 6.3z" fill="#7b5cff" stroke="#3a3366" stroke-width="1.1" stroke-linejoin="round"/>'),
    sprout:d('<path d="M12 21v-8" stroke="#2f7a3a" stroke-width="1.8" stroke-linecap="round"/><path d="M12 13C12 8 8.5 5.5 3.8 6c0 4.6 3 7.4 8.2 7z" fill="#5fd36b" stroke="#1f5a2a" stroke-width="1.1"/><path d="M12 11.5c0-4.5 3.2-6.8 8.2-6.6 0 4.4-3 7.2-8.2 6.6z" fill="#8be37a" stroke="#1f5a2a" stroke-width="1.1"/>'),
  };
  return I;
})();
function ggIcon(name){return GGI[name]||'';}
// Leading emoji -> icon, used on headings and buttons.
const GG_EMOJI_ICON={'💎':'gem','🗺️':'map','🗺':'map','⚔️':'swords','⚔':'swords','🛡️':'shield','🛡':'shield','🌙':'moon','✨':'sparkle','📖':'book','🎒':'bag','🎯':'scroll','⚙':'gear','⚙️':'gear','💰':'coin','❤️':'heart','🌊':'wave','⏳':'hourglass','👹':'demon','⭐':'star','🏆':'trophy','💾':'save','📰':'news','📲':'phone','🎓':'cap','🔒':'lock','👤':'user','🌱':'sprout','☰':'menu'};
const GG_EMOJI_RE=new RegExp('^\\s*('+Object.keys(GG_EMOJI_ICON).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\uFE0F?\\s*');
// Swap a leading emoji in an element's first text node for an SVG icon (idempotent).
function ggIconize(el){
  if(!el||el.dataset.ggi)return;
  const t=[...el.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
  if(!t||t!==[...el.childNodes].find(n=>!(n.nodeType===3&&!n.textContent.trim())))return;
  const m=t.textContent.match(GG_EMOJI_RE);if(!m)return;
  el.dataset.ggi='1';t.textContent=t.textContent.slice(m[0].length);
  const s=document.createElement('span');s.className='ggi-wrap';s.innerHTML=GGI[GG_EMOJI_ICON[m[1]]];el.insertBefore(s,t);
}
function ggIconizeAll(root=document){
  root.querySelectorAll('main h2,main h3,.settings-box h2,.profile-card h2,header .hdr-more,#openEnemyIndex,#indexTabs button,#ggStartGuide').forEach(ggIconize);
}
(function ggVisualInit(){
  // Main tabs: icon tile + label.
  document.querySelectorAll('.tabs button[data-tab]').forEach(b=>{
    const m=b.textContent.match(GG_EMOJI_RE);if(!m)return;
    const label=b.textContent.slice(m[0].length).trim();
    b.innerHTML='<span class="tab-ico">'+GGI[GG_EMOJI_ICON[m[1]]]+'</span><span class="tab-lbl">'+label+'</span>';
  });
  // Header buttons.
  const q=$('#bQuests');if(q){const t=[...q.childNodes].find(n=>n.nodeType===3);if(t)t.remove();q.insertAdjacentHTML('afterbegin',GGI.scroll);}
  const st=$('#bSettings');if(st){const t=[...st.childNodes].find(n=>n.nodeType===3);if(t)t.remove();st.insertAdjacentHTML('afterbegin',GGI.gear);}
  const mo=$('#bMore');if(mo)mo.innerHTML=GGI.menu;
  // Battle stat badges.
  const swap=(sel,icon)=>{const el=$(sel);if(!el)return;const t=[...el.childNodes].find(n=>n.nodeType===3);if(t)t.remove();el.insertAdjacentHTML('afterbegin',GGI[icon]);};
  swap('.bs-coins','coin');swap('.bs-lives','heart');swap('.bs-wave','wave');
  ggIconizeAll();
  // Summon altar: animated crystal above the summon buttons.
  const p1=$('#p1'),p10=$('#p10');
  if(p1&&p10){
    const panel=p1.parentElement;panel.classList.add('summon-altar');
    panel.insertAdjacentHTML('afterbegin','<div class="altar-art" aria-hidden="true"><div class="altar-rays"></div><svg class="altar-crystal" viewBox="0 0 120 150"><defs><linearGradient id="altA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2feff"/><stop offset=".45" stop-color="#7fe3ff"/><stop offset="1" stop-color="#3a5cff"/></linearGradient><linearGradient id="altB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b59bff"/><stop offset="1" stop-color="#3b1f9e"/></linearGradient></defs><ellipse cx="60" cy="138" rx="40" ry="8" fill="#000" opacity=".35"/><path d="M60 8 92 52 60 128 28 52z" fill="url(#altB)"/><path d="M60 8 74 52H46z" fill="#e6fbff"/><path d="M60 8 28 52h18z" fill="#9fdcff"/><path d="M60 8 92 52H74z" fill="#5aa8ff"/><path d="M28 52h18l14 76z" fill="url(#altA)"/><path d="M46 52h28l-14 76z" fill="#6fc8ff"/><path d="M74 52h18L60 128z" fill="#4560e8"/><path d="M60 8 92 52 60 128 28 52z" fill="none" stroke="#f4fbff" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 22 56 34" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg><span class="altar-spark s1"></span><span class="altar-spark s2"></span><span class="altar-spark s3"></span><div class="altar-title">Crystal Summon</div><div class="altar-sub">Featured units rotate every 5 minutes</div></div>');
    p1.innerHTML='<span class="sb-main">Summon ×1</span><span class="sb-cost">'+GGI.gem+'50</span>';
    p10.innerHTML='<span class="sb-main">Summon ×10</span><span class="sb-cost">'+GGI.gem+'450</span>';
    p1.classList.add('summon-btn');p10.classList.add('summon-btn','summon-btn-10');
    const wrapBtns=document.createElement('div');wrapBtns.className='summon-btns';p1.before(wrapBtns);wrapBtns.append(p1,p10);
  }
})();
// Gem counter with icon and thousands separators.
gemUI=function(){const g=$('#gems');if(g){g.innerHTML=GGI.gem+'<b>'+Math.floor(S.gems).toLocaleString()+'</b><span class="gems-lbl"> gems</span>';g.title=S.gems.toLocaleString()+' gems';}};
gemUI();
// Sound button icon follows the mute state.
(function(){const b=$('#bSound');if(!b)return;const sync=()=>{const m=b.getAttribute('aria-pressed')==='false';const want=m?'off':'on';if(b.dataset.icon!==want){b.dataset.icon=want;b.innerHTML=m?GGI.soundOff:GGI.soundOn;}};
  new MutationObserver(()=>{if(!b.querySelector('svg')||b.dataset.icon!==(b.getAttribute('aria-pressed')==='false'?'off':'on')){b.dataset.icon='';sync();}}).observe(b,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['aria-pressed']});sync();})();
// ---- Summon reveal: cards flip in after a manual summon ----
const ggReveal=(()=>{let p={};try{p=JSON.parse(localStorage.getItem('gemGuardiansRevealPrefs')||'{}')||{}}catch(e){}return Object.assign({on:true},p);})();
function ggRevealSave(){try{localStorage.setItem('gemGuardiansRevealPrefs',JSON.stringify(ggReveal))}catch(e){}}
document.body.insertAdjacentHTML('beforeend','<div id="summonReveal" class="summon-reveal hide" role="dialog" aria-modal="true" aria-label="Summon results"><div class="sr-burst"></div><div class="sr-box"><h2 class="sr-title">Summon Results</h2><div id="summonRevealGrid" class="sr-grid"></div><div id="summonRevealNote" class="sr-note"></div><div class="sr-actions"><button type="button" id="summonAgain" class="alt">Summon again</button><button type="button" id="closeSummonReveal">Continue</button></div></div></div>');
let ggRevealLast=1;
function showSummonReveal(n){
  const res=$('#res');if(!res)return;
  const byName={};Object.keys(UNITS).forEach(id=>{byName[UNITS[id].n]=id;});
  const got=[...res.querySelectorAll('b[class]')].map(b=>{const sold=/\(auto-sold\)$/.test(b.textContent);const name=b.textContent.replace(/ \(auto-sold\)$/,'');return {id:byName[name],r:b.className,sold};}).filter(x=>x.id);
  if(!got.length)return;
  const order=GG_RARITY_ORDER;const best=got.reduce((m,g)=>Math.max(m,order.indexOf(g.r)),0);
  const ov=$('#summonReveal');ov.dataset.best=order[best]||'Common';ggRevealLast=n;
  $('#summonRevealGrid').innerHTML=got.map((g,i)=>{const u=UNITS[g.id];return `<div class="sr-card r-${g.r}${g.sold?' sold':''}" style="--i:${i}"><div class="sr-inner"><div class="sr-back">${GGI.gem}</div><div class="sr-front"><canvas class="ico" width="72" height="64" data-id="${g.id}"></canvas><b class="${g.r}">${u.n}</b><small class="${g.r}">${g.r}${g.sold?' · auto-sold':''}</small></div></div></div>`;}).join('');
  $('#summonRevealNote').innerHTML=[...res.querySelectorAll('div')].map(d=>d.textContent).join('<br>');
  $('#summonRevealGrid').style.gridTemplateColumns=got.length===1?'minmax(0,150px)':'';
  try{paintIcons()}catch(e){}
  ov.classList.remove('hide');ov.classList.remove('sr-in');void ov.offsetWidth;ov.classList.add('sr-in');
  $('#summonAgain').textContent='Summon ×'+n+' again';$('#summonAgain').disabled=S.gems<(n===1?50:450);
}
$('#closeSummonReveal').onclick=()=>$('#summonReveal').classList.add('hide');
$('#summonAgain').onclick=()=>{$('#summonReveal').classList.add('hide');ggRevealArm=true;pull(ggRevealLast);};
$('#summonReveal').addEventListener('click',e=>{if(e.target.id==='summonReveal'||e.target.classList.contains('sr-burst'))$('#summonReveal').classList.add('hide');});
// Only summons the player taps (Summon ×1 / ×10 / Summon again) show the reveal.
let ggRevealArm=false;
$('#p1').onclick=()=>{ggRevealArm=true;pull(1);};$('#p10').onclick=()=>{ggRevealArm=true;pull(10);};
(function(){const orig=pull;pull=function(n){const pre=S.gems;const armed=ggRevealArm;ggRevealArm=false;const r=orig.apply(this,arguments);
  try{if(armed&&S.gems<pre&&ggReveal.on&&!(typeof autoSummonActive!=='undefined'&&autoSummonActive)&&!document.getElementById('ggGuide')?.matches(':not(.hide)'))showSummonReveal(n);}catch(e){}
  return r;};})();
// Settings toggle for the reveal animation (next to Performance mode).
(function(){const perf=$('#ggPerf');const row=perf&&perf.closest('label.setting');if(!row)return;
  row.insertAdjacentHTML('afterend','<label class="setting"><span><b>✨ Summon reveal animation</b><small>Show summoned units as cards that flip in. Auto Summon never shows it. Saved on this device only.</small></span><input type="checkbox" id="ggRevealToggle"></label>');
  const t=$('#ggRevealToggle');t.checked=ggReveal.on;t.onchange=()=>{ggReveal.on=t.checked;ggRevealSave();};})();
// Re-apply heading icons after views that rebuild their markup.
(function(){const orig=renderAll;renderAll=function(){const r=orig.apply(this,arguments);try{ggIconizeAll()}catch(e){}return r;};})();
// Battle HUD as icon chips (same information as before).
(function(){const orig=hud;hud=function(){const r=orig.apply(this,arguments);try{if(G){const h=$('#hud');const max=G.mode==='infinite'?'':'/'+(G.raidLevel?raidMaxWave(G.raidLevel):15);
  const chip=(ic,t,c)=>'<span class="hud-chip'+(c?' '+c:'')+'">'+(ic?GGI[ic]:'')+'<span>'+t+'</span></span> ';
  h.innerHTML=(G.raidLevel?chip('swords','Raid Level '+G.raidLevel,'hud-raid'):'')+chip('wave','Wave '+G.wave+max)+chip('',MODES[G.mode].n,'hud-mode')+chip('heart','Lives '+G.lives)+chip('coin','Coins '+G.coins.toLocaleString())+chip('shield','Units '+G.us.length)+((G.teamScale||1)>1.05?chip('demon','Enemy ×'+enemyWaveScale().toFixed(1)):'');}}catch(e){}return r;};})();
// Unit Index: tap a discovered unit for its full skills.
function ggShowUnitById(id){const u=UNITS[id];if(!u)return;const m=$('#unitInfoModal');$('#unitInfoName').textContent=u.n+' — '+u.r+' '+u.t;
  const lines=['Damage '+u.d+(u.rg?' · Range '+u.rg:'')+' · Cost '+u.c+' coins',(typeof u.ability==='string'&&u.ability.trim())||'Standard attack'];
  $('#unitInfoBody').textContent=lines.join('\n\n');$('#unitInfoBody').classList.remove('hide');m.classList.remove('hide');}
(function(){const orig=renderIndex;renderIndex=function(){const r=orig.apply(this,arguments);try{$('#indexGrid').querySelectorAll('.card[data-ix-id]').forEach(c=>{c.onclick=e=>{if(e.target.closest('button'))return;ggShowUnitById(c.dataset.ixId);};});}catch(e){}return r;};})();
