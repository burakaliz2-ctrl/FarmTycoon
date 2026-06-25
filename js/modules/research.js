const ResearchModule = {
    techTree: [
        { id: "bio_1", name: "Gelişmiş Biyoloji v1", cost: 500, desc: "Tüm ekinlerin temel büyüme hızını %10 artırır." },
        { id: "log_1", name: "Drone Lojistiği", cost: 15000, desc: "Piyasa fiyat dalgalanmalarını lehinize stabilize eder." }
    ],

    render(state, container) {
        container.innerHTML = "";
        this.techTree.forEach(t => {
            const isResearched = state.research.includes(t.id);
            const card = document.createElement("div");
            card.className = "farm-card";
            card.innerHTML = `
                <h3>${t.name}</h3>
                <p>${t.desc}</p>
                <button class="btn ${isResearched ? 'btn-success' : 'btn-warning'}" ${isResearched ? 'disabled' : ''} onclick="ResearchModule.buyTech('${t.id}', ${t.cost})">
                    ${isResearched ? 'Araştırıldı' : `Maliyet: ${t.cost} Altın`}
                </button>
            `;
            container.appendChild(card);
        });
    },

    buyTech(techId, cost) {
        if (Game.state.gold >= cost) {
            Game.state.gold -= cost;
            Game.state.research.push(techId);
            Game.createToast("Teknoloji araştırıldı! Kalıcı etkiler uygulandı.");
            Game.updateUI();
        } else {
            Game.createToast("Yetersiz altın kaynağı!");
        }
    }
};