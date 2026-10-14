// ---------- Tougher raids; saves only on the device and in Cloud Save (2026.10.11.36) ----------
// Raids used Green Meadow's enemy health (Map 1), so Raid Level 1 was as easy as Green Meadow on Hell.
// Raid enemies now start from Volcanic Rift on Hell (Map 8): +25% per raid level, and Level 5 (30 waves,
// growing every wave) at 60% of that. Tested with Auto Play: a level-60 team clears Levels 1-2, a level-100
// 3-star team clears Levels 1-4, and only a maxed 5-star team clears Level 5. Rewards are higher.
const GG_RAID_BASE_MAP=7,GG_RAID_L5=0.6,GG_RAID_GEMS=[250,400,550,700,1000];
function ggRaidHpm(lv){return STAGES[GG_RAID_BASE_MAP].hp*stageDifficulty(GG_RAID_BASE_MAP)*MODES.hell.hp*raidScale(lv)*(lv===5?GG_RAID_L5:1);}
(function(){const o=startBattle;startBattle=function(si,mode,raidLevel){const r=o.apply(this,arguments);try{if(G&&G.raidLevel)G.hpm=ggRaidHpm(G.raidLevel);}catch(e){}return r;};})();
// Public game: no save files. Progress lives in the game's own storage on this device and in Cloud Save,
// so nobody can hand-edit a save file and load it back in. (The Creator Edition keeps its backup tools.)
if(GG_EDITION==='public'){
  let ggCloudImport=false;
  (function(){const o=importSaveText;importSaveText=async function(){if(!ggCloudImport){toast('Save files can no longer be imported. Sign in to Cloud Save to move your progress.');return false;}return o.apply(this,arguments);};})();
  (function(){const o=ggCloudRestore;ggCloudRestore=async function(){ggCloudImport=true;try{return await o.apply(this,arguments);}finally{ggCloudImport=false;}};})();
  (function(){const blocked=()=>{throw Error('Save files are turned off. Your progress is kept on this device and in Cloud Save.')};buildSaveExport=blocked;downloadSaveExport=blocked;})();
  window.ggSaveSectionUpdate=function(){
    const ex=$('#exportSave');const box=ex&&ex.closest('div[style*="border-top"]');if(!box||box.dataset.secure)return;box.dataset.secure='1';
    const undo=$('#restorePreImport'),status=$('#storageStatus');
    box.innerHTML='<b>Saving &amp; Recovery</b><p class="gg-save-note">Your progress saves automatically in the game\'s own storage on this device. <b>Sign in to Cloud Save</b> to keep a safe copy online and to continue on a new phone.</p>'
      +'<p class="gg-save-note">To keep the game fair and protect players from cheating and scams, save files can\'t be downloaded, shared, copied or imported.</p><div class="row" id="ggUndoRow"></div>';
    if(undo){undo.textContent='↶ Undo Last Cloud Restore';undo.title='Go back to the progress you had before your last Cloud Save restore';$('#ggUndoRow').appendChild(undo);}
    if(status)box.appendChild(status);
    const has=(()=>{try{return !!localStorage.getItem(PRE_IMPORT_KEY)}catch(e){return false}})();$('#ggUndoRow').classList.toggle('hide',!has);};
  ggSaveSectionUpdate();
  (function(){const o=ggCloudRestore;ggCloudRestore=async function(){const r=await o.apply(this,arguments);try{const b=$('#ggUndoRow');if(b)b.classList.remove('hide');}catch(e){}return r;};})();
}
