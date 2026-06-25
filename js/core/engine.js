const Game = {
    state: {},
    lastTick: Date.now(),
    tickRate: 1000,

async init() {
    this.state = await SaveSystem.load(); 
    
    // Güvenlik: State'in içinde activeQuests anahtarı yoksa oluştur
    if (!this.state.activeQuests) {
        this.state.activeQuests = [];
    }

    // Eğer dizi hala boşsa görevleri üret
    if (this.state.activeQuests.length === 0) {
        // QuestModule varsa onu kullan, yoksa kendi generator'ını
        if (typeof QuestModule !== 'undefined') {
            // QuestModule'ün döndürdüğü değerleri state'e ata
            // Dikkat: QuestModule fonksiyonların 'return' değerlerini burada almalısın
            // Örnek: this.state.activeQuests = QuestModule.generateContracts();
        } 
        
        // Eğer QuestModule'den veri gelmediyse veya üretilmediyse
        if (this.state.activeQuests.length === 0) {
            for(let i = 0; i < 3; i++) {
                this.state.activeQuests.push(this.generateRandomQuest());
            }
        }
        await SaveSystem.save(this.state);
    }

    EconomyEngine.init();
    UIModule.initTabs();
    this.setupEventListeners();
    
    // calculateOfflineProgress asenkron bir işlemse 'await' ekle!
    await this.calculateOfflineProgress(); 
    this.gameLoop();

    setInterval(() => SaveSystem.save(this.state), 30000);
    window.addEventListener('beforeunload', () => SaveSystem.save(this.state));

    this.updateUI();
},

    generateRandomQuest() {
        const templates = [
            { type: "harvest", text: "20 Buğday hasat et", target: 20, rewardGold: 400, rewardGem: 2 },
            { type: "gold", text: "5000 Altın kazan", target: 5000, rewardGold: 800, rewardGem: 3 }
        ];
        const t = templates[Math.floor(Math.random() * templates.length)];
        return { id: Math.random(), type: t.type, text: t.text, target: t.target, current: 0, rewardGold: t.rewardGold, rewardGem: t.rewardGem };
    },

// Game objesinin içindeki triggerPrestige fonksiyonunu böyle değiştir:
triggerPrestige: () => {
    // Game.state'e doğrudan erişmek için Game.state kullan (this yerine)
    const state = Game.state;
    const gain = Math.floor(1000 * Math.sqrt(state.totals.goldEarned / 1e9));
    
    if (gain < 1) {
        Game.createToast("Prestij için yeterli kazanç yok!");
        return;
    }

    state.tokens += gain;
    state.gold = 150;
    state.unlockedFields = [1];
    state.unlockedFactories = [];
    state.research = [];
    state.fields = { 1: { cropId: "wheat", progress: 0 } };
    state.factoryStatus = {};
    state.activeQuests = [];
if(typeof QuestModule!=='undefined'){
if(QuestModule.generateContracts) QuestModule.generateContracts();
if(QuestModule.generateDailyContracts) QuestModule.generateDailyContracts();
if(QuestModule.refreshContracts) QuestModule.refreshContracts();
}
    
    for(let i = 0; i < 3; i++) {
        state.activeQuests.push(Game.generateRandomQuest());
    }

    SaveSystem.save(state);
    window.location.reload();
},

    claimQuest(index) {
        const quest = this.state.activeQuests[index];
        if (quest.current >= quest.target) {
            this.state.gold += quest.rewardGold;
            this.state.gems += quest.rewardGem;
            this.state.activeQuests.splice(index, 1);
            this.state.activeQuests.push(this.generateRandomQuest());
            this.createToast("Görev tamamlandı! Ödül: " + quest.rewardGold + " Altın");
            this.updateUI();
            SaveSystem.save(this.state);
        } else {
            this.createToast("Görev henüz tamamlanmadı!");
        }
    },

    gameLoop() {
        const now = Date.now();
        const deltaTime = now - this.lastTick;
        if (deltaTime >= this.tickRate) {
            this.gameTick();
            this.lastTick = now;
        }
        requestAnimationFrame(() => this.gameLoop());
    },

    gameTick() {
        EconomyEngine.update(this.state);
        this.state.unlockedFields.forEach(id => {
            if (!this.state.fields[id]) this.state.fields[id] = { cropId: "wheat", progress: 0 };
            const speedBonus = 1 + (this.state.workers.farmer * 0.05);
            this.state.fields[id].progress = Math.min(100, this.state.fields[id].progress + (5 * speedBonus));
            if (this.state.fields[id].progress >= 100 && this.state.workers.harvester > 0) FarmModule.manualHarvest(id);
        });
        EconomyEngine.updateMarketAndEnvironment();
        this.checkAchievements();
        this.updateUI();
    },

    updateUI() {
        UIModule.render(this.state);
        this.renderQuests(); 
        document.getElementById("stat-gold").innerText = this.formatNumber(this.state.gold);
        document.getElementById("stat-gems").innerText = this.formatNumber(this.state.gems);
        document.getElementById("stat-tokens").innerText = this.formatNumber(this.state.tokens);
        FarmModule.renderFields(this.state, document.getElementById("farm-fields-container"));
    },

    renderQuests() {
        const qContainer = document.getElementById("quests-container");
        if (!qContainer) return;
        qContainer.innerHTML = "";
        if (this.state.activeQuests) {
            this.state.activeQuests.forEach((q, index) => {
                qContainer.innerHTML += `
                    <div class="farm-card">
                        <h3>📜 ${q.text}</h3>
                        <p>İlerleme: ${q.current} / ${q.target}</p>
                        <button class="btn btn-info" onclick="Game.claimQuest(${index})">Ödülü Al</button>
                    </div>`;
            });
        }
    },

    createToast(msg) {
        const container = document.getElementById("toast-container");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
};


,
formatNumber(n){return new Intl.NumberFormat('tr-TR').format(Math.floor(n||0));},
buyField(id,cost){if(this.state.gold>=cost){this.state.gold-=cost;this.state.unlockedFields.push(id);this.state.fields[id]={cropId:'wheat',progress:0};this.updateUI();}},
calculateOfflineProgress(){return true;},
checkAchievements(){(ACHIEVEMENTS_DATA||[]).forEach(a=>{if(this.state.unlockedAchievements.includes(a.id)) return; let ok=false; if(a.category==='gold') ok=this.state.totals.goldEarned>=a.target; if(a.category==='harvest') ok=this.state.totals.cropsHarvested>=a.target; if(a.category==='prestige') ok=this.state.totals.prestigeCount>=a.target; if(ok){this.state.unlockedAchievements.push(a.id); this.state.gems+=a.rewardGem||0;}});},
progressQuest(type,val){(this.state.activeQuests||[]).forEach(q=>{if(q.type===type) q.current=Math.min(q.target,q.current+val);});}
};
window.onload=()=>Game.init();
