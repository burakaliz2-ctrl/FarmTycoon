
const FarmModule={
renderFields(state,container){container.innerHTML="";
FIELDS_DATA.forEach(f=>{
const unlocked=state.unlockedFields.includes(f.id);
const card=document.createElement("div");card.className="farm-card";
if(!unlocked){card.innerHTML=`<h3>${f.name}</h3><button class="btn btn-warning" onclick="Game.buyField(${f.id},${f.baseCost})">Kilidi Aç</button>`;container.appendChild(card);return;}
const fs=state.fields[f.id]||{cropId:"wheat",progress:0};
const crop=CROPS_DATA.find(c=>c.id===fs.cropId)||CROPS_DATA[0];
card.innerHTML=`<h3>${f.name} ${crop.icon}</h3><div>${crop.name}</div><div>${Math.floor(fs.progress)}%</div><button class="btn btn-success" onclick="FarmModule.manualHarvest(${f.id})">Hasat</button>`;
container.appendChild(card);
});
},
manualHarvest(id){const f=Game.state.fields[id]; if(!f)return; const crop=CROPS_DATA.find(c=>c.id===f.cropId); const p=Math.floor(EconomyEngine.calculateCropPrice(crop,Game.state)); Game.state.gold+=p; Game.state.totals.goldEarned+=p; Game.state.totals.cropsHarvested++; f.progress=0; if(Game.progressQuest) Game.progressQuest("harvest",1); if(Game.progressQuest) Game.progressQuest("gold",p); Game.updateUI();},
changeCrop(id,crop){Game.state.fields[id].cropId=crop;}
};