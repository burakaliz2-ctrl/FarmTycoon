const EconomyEngine = {
    seasons: ["İlkbahar", "Yaz", "Sonbahar", "Kış"],
    weatherConditions: ["Güneşli", "Yağmurlu", "Fırtınalı", "Kuraklık"],
    
    currentSeasonIdx: 0,
    currentWeatherIdx: 0,
    marketFluctuations: {},

    init() {
        CROPS_DATA.forEach(c => {
            this.marketFluctuations[c.id] = 1.0;
        });
    },

    updateMarketAndEnvironment() {
        // Rastgele hava durumu ve mevsim geçişi simülasyonu
        if (Math.random() < 0.25) {
            this.currentWeatherIdx = Math.floor(Math.random() * this.weatherConditions.length);
        }
        if (Math.random() < 0.05) {
            this.currentSeasonIdx = (this.currentSeasonIdx + 1) % this.seasons.length;
        }

        // Borsa fiyat dalgalanması
        CROPS_DATA.forEach(c => {
            const change = (Math.random() * 0.4) - 0.2; // -%20 ile +%20 arası dalgalanma
            this.marketFluctuations[c.id] = Math.max(0.5, Math.min(2.0, (this.marketFluctuations[c.id] || 1.0) + change));
        });
    },

    calculateCropPrice(crop, state) {
        let price = crop.basePrice;
        
        // İşçi & Satıcı bonusları
        const sellerBonus = 1 + (state.workers.seller * 0.04);
        price *= sellerBonus;

        // Piyasa dalgalanması katsayısı
        const marketCoeff = this.marketFluctuations[crop.id] || 1.0;
        price *= marketCoeff;

        // Prestij bonusu
        if (state.tokens > 0) {
            price *= (1 + (state.tokens * 0.02));
        }

        return Math.round(price);
    },

    getEnvironmentString() {
        return `${this.seasons[this.currentSeasonIdx]} / ${this.weatherConditions[this.currentWeatherIdx]}`;
    }
};