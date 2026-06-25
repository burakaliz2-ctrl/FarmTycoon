const UIModule = {
    initTabs() {
        document.querySelectorAll(".nav-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
                document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
                
                btn.classList.add("active");
                const targetTab = document.getElementById(`tab-${btn.dataset.tab}`);
                if (targetTab) targetTab.classList.add("active");
            });
        });
    },

    renderMarket(state, container) {
        container.innerHTML = "";
        CROPS_DATA.forEach(c => {
            const currentPrice = EconomyEngine.calculateCropPrice(c, state);
            const div = document.createElement("div");
            div.className = "farm-card";
            div.innerHTML = `
                <h4>${c.icon} ${c.name}</h4>
                <p>Güncel Borsa Fiyatı: <span class="text-gold">${Game.formatNumber(currentPrice)} Altın</span></p>
                <small>Dalgalanma Endeksi: x${(EconomyEngine.marketFluctuations[c.id] || 1.0).toFixed(2)}</small>
            `;
            container.appendChild(div);
        });
    },

    renderAchievements(state, container) {
        container.innerHTML = "";
        ACHIEVEMENTS_DATA.forEach(a => {
            const isUnlocked = state.unlockedAchievements.includes(a.id);
            const div = document.createElement("div");
            div.className = `farm-card ${isUnlocked ? 'unlocked-achievement' : ''}`;
            div.innerHTML = `
                <h4>${a.title}</h4>
                <p>${a.desc}</p>
                <small>Ödül: ${a.rewardGem} Elmas</small>
                <div class="status">${isUnlocked ? "🏆 Tamamlandı" : "🔒 Kilitli"}</div>
            `;
            container.appendChild(div);
        });
    }
};