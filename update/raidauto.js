// ---------- Raids Auto Play pass (2026.10.11.37) ----------
// Owner correction: the raid pass unlocks Auto Play in raids, not Speed x3. The Raids x3 Speed pass (raid3)
// becomes Raids Auto Play (raidauto); everyone who owned it keeps it. Speed x3 in raids follows the normal
// x3 Speed pass again (and the free early-player x3). Auto Play on regular maps is unchanged (free).
(function(){const raidauto={n:'Raids Auto Play',i:'🏰',d:'Unlocks Auto Play in Duskmoor Castle raids: the Tactician places, upgrades and picks the speed for you on every raid level you have unlocked. Auto Play on regular maps stays free (Player Level 5 and a 3-star clear).'};
  GG_PASSES.speed3.d='Unlocks Speed ×3 in every battle, including raids and Infinite Mode. Speed ×1 and ×2 stay free for everyone.';
  const all=Object.assign({},GG_PASSES,{raidauto});delete all.raid3;
  const order=['speed3','raidauto','afk2','autosum','autotrait','vip'];
  for(const k of Object.keys(GG_PASSES))delete GG_PASSES[k];
  for(const k of order.concat(Object.keys(all)))if(all[k]&&!GG_PASSES[k])GG_PASSES[k]=all[k];
  // Passes saved on this device before the change: Raids x3 Speed became Raids Auto Play.
  try{const p=JSON.parse(localStorage.getItem(GG_PASS_KEY)||'{}');
    if(p&&p.uid===ggPass.uid&&Array.isArray(p.list)){ggPass.list=[...new Set(p.list.map(x=>x==='raid3'?'raidauto':x))].filter(x=>GG_PASSES[x]);ggPassStore();}}catch(e){}})();
ggMaxSpeed=function(){if(!G)return 3;const ranked=G.lbBoard&&!G.lbSkip;return (ranked?ggServerHasPass('speed3'):ggHasPass('speed3'))?3:2;};
autoPlayEligible=function(si,mode,raidLevel=0){
  if(raidLevel)return S.playerLevel>=5&&ggHasPass('raidauto');
  return mode!=='infinite'&&S.playerLevel>=5&&(S.stageStars?.[stageStarKey(si,mode)]||0)>=3;};
