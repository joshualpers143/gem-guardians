const GG_INTRO_STEPS=[
 {title:'💎 Welcome, Guardian!',text:'Enemies march down the road toward your castle, and your units stop them. Follow the glowing highlights and you will win your first battle in a few minutes. You start with 500 gems and Barter, a merchant who earns extra coins in battle.',info:true},
 {title:'🎰 Summon your team',text:'Open the Summon tab and tap “Summon ×10”. Ten units for 450 gems, with at least one Epic or better guaranteed.',
  enter:b=>{b.units=S.units.length},target:()=>!tabOpen('summon')?tabBtn('summon'):(S.gems>=450?$('#p10'):$('#p1')),done:b=>S.units.length>b.units},
 {title:'🛡️ Equip your best units',text:'Only equipped units go into battle. Open the Units tab and tap “＋ Equip” until your team slots are full. Colored names show rarity: rarer units are stronger.',
  target:()=>tabOpen('units')?(firstEquipBtn()||$('#loadoutSlots')):tabBtn('units'),done:()=>(S.equipped||[]).length>=Math.min(unlockedLoadoutSlots(),S.units.length)},
 {title:'🗺️ Pick your first map',text:'Open the Battle tab. Keep the Easy difficulty and tap Green Meadow.',
  enter:()=>{if(typeof curMode!=='undefined'&&curMode!=='easy'&&S.cleared===0){curMode='easy';renderAll();}},target:()=>tabOpen('battle')?document.querySelector('#stages [data-s="0"]'):tabBtn('battle'),done:()=>!!(G&&!G.over)},
 {title:'📍 Place two units',text:'Tap a unit card on the left, then tap the grass next to the road (not the road itself). Place two units where enemies will walk past both of them. Each one costs coins.',
  target:()=>(G&&G.pl)?$('#cv'):document.querySelector('#bar .card'),done:()=>!!(G&&(G.us.length>=2||G.wave>0))},
 {title:'▶ Start the battle',text:'Tap “Start wave”. Waves then keep coming on their own, and every defeated enemy gives coins.',target:()=>$('#bWave'),done:()=>!!(G&&G.wave>=1)},
 {title:'⬆ Upgrade a unit',text:'Tap one of your placed units on the map, then tap Boost when you have the coins. Boosts raise damage, range and speed. Spend extra coins on more units or boosts.',
  target:()=>$('#cv'),done:()=>!!(G&&G.us.some(u=>u.bl>=2)),skippable:true},
 {title:'🏰 Win the battle',text:'Survive all 15 waves. Each enemy that reaches the castle costs a life; keep more lives for more stars (up to 3). Tip: “Speed” makes battles faster.',
  target:()=>$('#hud'),done:()=>!!(G&&G.over),skippable:true},
 {title:'🏆 You’re ready!',text:'Wins give gems, fruit, unit EXP and Player EXP, and unlock the next map. As your Player Level rises, new systems unlock (Index, Traits, AFK and more), and each one comes with its own short tutorial. Replay any tutorial from ☰ → Help & Tutorials.',info:true,last:true}
];
let GUIDE_STEPS=GG_INTRO_STEPS;
