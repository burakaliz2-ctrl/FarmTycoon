const FactoryModule = {
    recipes: [
        { id: "flour", name: "Un Fabrikası", inputId: "wheat", outputName: "Premium Un", baseCost: 1500, valueMultiplier: 2.5 },
        { id: "coffee_roaster", name: "Kahve Kavurma Tesisi", inputId: "coffee", outputName: "Espresso Çekirdeği", baseCost: 1200000, valueMultiplier: 3.2 }
    ],

    render(state, container) {
        container.innerHTML = "";
        this.recipes.forEach(r => {
            const hasMachine = state.machines.tractor > 0; // Basit kilit mekanizması entegrasyonu
            const card = document.createElement("div");
            card.className = "farm-card";
            card.innerHTML = `
                <h3>${r.name}</h3>
                <p>Girdi: ${r.inputId} ➡️ Çıktı: ${r.outputName}</p>
                <small>Değer Çarpanı: x${r.valueMultiplier}</small>
                <button class="btn btn-info mt-10" onclick="Game.createToast('Tesis otomasyonu aktifleştirildi!')">Fabrikayı Optimize Et</button>
            `;
            container.appendChild(card);
        });
    }
};