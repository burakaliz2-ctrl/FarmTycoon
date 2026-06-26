const Game = {
    state: {},
    lastTick: Date.now(),
    tickRate: 1000,

async init() {
    // 1. Verilerin yüklenmesini bekle
    this.state = await SaveSystem.load(); 
    
    // 2. Eğer Supabase kullanıyorsan yükleme süresini bekle
    // (Eğer SaveSystem içinde await kullanıyorsan buraya await ekle)

    // 3. Güvenlik Kontrolü: State boşsa veya görevler yoksa
    if (!this.state.activeQuests || this.state.activeQuests.length === 0) {
        this.state.activeQuests = [];
        for(let i = 0; i < 3; i++) {
            this.state.activeQuests.push(this.generateRandomQuest());
        }
        await SaveSystem.save(this.state);
    }

    EconomyEngine.init();
    UIModule.initTabs();
    this.setupEventListeners();
    
    this.calculateOfflineProgress();
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
triggerPrestige() {
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
    
    for(let i = 0; i < 3; i++) {
        state.activeQuests.push(Game.generateRandomQuest());
    }

    SaveSystem.save(state);
    
    state.totals.prestigeCount = (state.totals.prestigeCount || 0) + 1;
    this.updateUI();
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

window.onload = () => Game.init();