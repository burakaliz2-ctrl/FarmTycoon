const Game = {
    state: {},
    lastTick: Date.now(),
    tickRate: 1000, // 1 Saniye hedefi

init() {
    this.state = SaveSystem.load();
    
    // GÜVENLİK: Eğer state'te activeQuests yoksa veya boşsa, hemen üret
    if (!this.state.activeQuests || this.state.activeQuests.length === 0) {
        this.state.activeQuests = [];
        for(let i = 0; i < 3; i++) {
            this.state.activeQuests.push(this.generateRandomQuest());
        }
        SaveSystem.save(this.state); // Hemen kaydet ki prestijden sonra boş kalmasın
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
    // requestAnimationFrame ile daha akıcı ve performanslı döngü
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
        // EconomyEngine içinde saniyelik üretimi hesapla
        EconomyEngine.update(this.state);
        
        // UI güncellemesini tüm her şey için değil, sadece değişenler için tetikle
        this.updateUI();
    },

    updateUI() {
        // UIModule içinde DOM manipülasyonlarını optimize et
        UIModule.render(this.state);
    },

    setupEventListeners() {
        // Tıklama eventlerini burada yönetebilirsin
    },

    calculateOfflineProgress() {
        const lastSave = localStorage.getItem('lastSaveTimestamp');
        if (!lastSave) return;

        const secondsPassed = (Date.now() - parseInt(lastSave)) / 1000;
        
        // EconomyEngine'e gecen süreyi göndererek birikimi hesapla
        if (secondsPassed > 0) {
            EconomyEngine.applyOfflineProgress(this.state, secondsPassed);
        }
    }
},

    setupEventListeners() {
        document.getElementById("btn-save-game").addEventListener("click", () => {
            SaveSystem.save(this.state);
            this.createToast("Oyun başarıyla kaydedildi.");
        });
        document.getElementById("btn-hard-reset").addEventListener("click", () => {
            if(confirm("Tüm imparatorluk verilerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
                SaveSystem.reset();
            }
        });
        document.getElementById("btn-trigger-prestige").addEventListener("click", () => this.triggerPrestige());
    },

    gameTick() {
        // Çiftlik tarlalarının ilerlemesini güncelleme
        this.state.unlockedFields.forEach(id => {
            if (!this.state.fields[id]) {
                this.state.fields[id] = { cropId: "wheat", progress: 0 };
            }
            
            // İşçi otomasyon hızı hesaplama katsayıları
            const speedBonus = 1 + (this.state.workers.farmer * 0.05);
            this.state.fields[id].progress = Math.min(100, this.state.fields[id].progress + (5 * speedBonus));
            
            // Eğer otomatik hasatçı varsa ve %100'e ulaştıysa otomatik hasat et
            if (this.state.fields[id].progress >= 100 && this.state.workers.harvester > 0) {
                FarmModule.manualHarvest(id);
            }
        });

        // Ekonomik verileri periyodik güncelleme
        EconomyEngine.updateMarketAndEnvironment();
        
        // Başarımları Kontrol Et
        this.checkAchievements();

        this.updateUI();
    },

    updateUI() {
        // Temel İstatistik Göstergeleri
        document.getElementById("stat-gold").innerText = this.formatNumber(this.state.gold);
        document.getElementById("stat-gems").innerText = this.formatNumber(this.state.gems);
        document.getElementById("stat-tokens").innerText = this.formatNumber(this.state.tokens);
        document.getElementById("stat-environment").innerText = EconomyEngine.getEnvironmentString();
        
        // Prestij Hesaplama Göstergesi
        const prestigeGain = Math.floor(1000 * Math.sqrt(this.state.totals.goldEarned / 1e9));
        document.getElementById("prestige-gain-amount").innerText = this.formatNumber(prestigeGain);

        // Modül Ekranlarını Yenileme
        FarmModule.renderFields(this.state, document.getElementById("farm-fields-container"));
        UIModule.renderMarket(this.state, document.getElementById("market-prices-container"));
        ResearchModule.render(this.state, document.getElementById("research-container"));
        UIModule.renderAchievements(this.state, document.getElementById("achievements-container"));
        FactoryModule.render(this.state, document.getElementById("factory-container"));
    },

    buyField(id, cost) {
        if (this.state.gold >= cost) {
            this.state.gold -= cost;
            this.state.unlockedFields.push(id);
            this.state.fields[id] = { cropId: "wheat", progress: 0 };
            this.createToast("Yeni tarla arazisi satın alındı!");
            this.updateUI();
        } else {
            this.createToast("Yetersiz Altın!");
        }
    },

triggerPrestige() {
    const gain = Math.floor(1000 * Math.sqrt(this.state.totals.goldEarned / 1e9));
    if (gain < 1) return;

    this.state.tokens += gain;
    this.state.gold = 150;
    this.state.unlockedFields = [1];
    this.state.unlockedFactories = [];
    this.state.research = [];
    this.state.fields = { 1: { cropId: "wheat", progress: 0 } };
    this.state.factoryStatus = {};
    
    // Prestij sonrası görevleri hemen burada üret
    this.state.activeQuests = [];
    for(let i = 0; i < 3; i++) {
        this.state.activeQuests.push(this.generateRandomQuest());
    }

    SaveSystem.save(this.state);
    window.location.reload();
},

    checkAchievements() {
        ACHIEVEMENTS_DATA.forEach(a => {
            if (this.state.unlockedAchievements.includes(a.id)) return;
            
            let conditionMet = false;
            if (a.category === "gold" && this.state.totals.goldEarned >= a.target) conditionMet = true;
            if (a.category === "harvest" && this.state.totals.cropsHarvested >= a.target) conditionMet = true;
            if (a.category === "prestige" && this.state.totals.prestigeCount >= a.target) conditionMet = true;

            if (conditionMet) {
                this.state.unlockedAchievements.push(a.id);
                this.state.gems += a.rewardGem;
                this.createToast(`🏆 BAŞARIM KAZANILDI: ${a.title}`);
            }
        });
    },

    calculateOfflineProgress() {
        const diffMs = Date.now() - this.state.lastSaveTime;
        const diffSec = Math.floor(diffMs / 1000);
        
        if (diffSec > 60) { // En az 1 dakika dışarıda kaldıysa
            // Çevrimdışı üretim çarpanı formülü
            const autoIncomePerSec = this.state.workers.harvester * 5; 
            const offlineEarnings = autoIncomePerSec * diffSec;

            if (offlineEarnings > 0) {
                this.state.gold += offlineEarnings;
                this.state.totals.goldEarned += offlineEarnings;

                const modalBody = document.getElementById("offline-report-body");
                modalBody.innerHTML = `
                    <p>Dışarıda geçirilen süre: <b>${diffSec} saniye</b></p>
                    <p>İşçilerinizin kazandırdığı toplam gelir: <b class="text-gold">${this.formatNumber(offlineEarnings)} Altın</b></p>
                `;
                document.getElementById("offline-modal").classList.remove("hidden");
            }
        }
    },

    formatNumber(num) {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + " T";
        if (num >= 1e9) return (num / 1e9).toFixed(2) + " B";
        if (num >= 1e6) return (num / 1e6).toFixed(2) + " M";
        if (num >= 1e3) return (num / 1e3).toFixed(2) + " K";
        return num.toString();
    },

    createToast(msg) {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }
};

// Sayfa yüklendiğinde motoru tetikle
window.onload = () => Game.init();
