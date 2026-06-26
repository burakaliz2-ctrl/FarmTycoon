const SaveSystem = {
    SAVE_KEY: "CiftlikImparatorluguTycoon_Save",

    getInitialState() {
        return {
            gold: 10,
            gems: 0,
            tokens: 0,
            totals: { goldEarned: 0, cropsHarvested: 0, prestigeCount: 0 },
            fields: { 1: { cropId: "wheat", lastHarvest: Date.now(), progress: 0 } },
            unlockedFields: [1],
            workers: { farmer: 0, harvester: 0, seller: 0 },
            machines: { tractor: 0, irrigation: 0, drone: 0 },
            research: [],
            completedQuests: [],
            unlockedAchievements: [],
            lastSaveTime: Date.now(),
            activeQuests: [],
            unlockedFactories: [],
            factoryStatus: {},
            marketFluctuations: {},
            prestigeUpgrades: []
        };
    },

    save(state) {
        state.lastSaveTime = Date.now();
        localStorage.setItem(this.SAVE_KEY, JSON.stringify(state));
    },

    load() {
        const raw = localStorage.getItem(this.SAVE_KEY);
        if (!raw) return this.getInitialState();
        try {
            const parsed = JSON.parse(raw);
            const state = this.getInitialState(); Object.assign(state, parsed); return state;
        } catch (e) {
            console.error("Kayıt dosyası bozuk, sıfırdan başlanıyor.", e);
            return this.getInitialState();
        }
    },

    reset() {
        localStorage.removeItem(this.SAVE_KEY);
        window.location.reload();
    }
};