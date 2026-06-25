const FarmModule = {
    renderFields(state, container) {
        container.innerHTML = ;
        
        FIELDS_DATA.forEach(f = {
            const isUnlocked = state.unlockedFields.includes(f.id);
            
            if (!isUnlocked) {
                const cost = f.baseCost;
                const card = document.createElement(div);
                card.className = farm-card locked;
                card.innerHTML = `
                    h3${f.name}h3
                    button class=btn btn-warning onclick=Game.buyField(${f.id}, ${cost})Kilidi Aç ${Game.formatNumber(cost)} Altınbutton
                `;
                container.appendChild(card);
                return;
            }

            const fieldState = state.fields[f.id]  { cropId wheat, progress 0 };
            const crop = CROPS_DATA.find(c = c.id === fieldState.cropId)  CROPS_DATA[0];

            const card = document.createElement(div);
            card.className = farm-card;
            card.innerHTML = `
                div class=card-header
                    h3${f.name} span class=crop-icon${crop.icon}spanh3
                    smallMevcut Mahsul ${crop.name}small
                div
                div class=progress-bar-container
                    div class=progress-bar id=progress-bar-${f.id} style=width ${fieldState.progress}%div
                div
                div class=card-actions
                    button class=btn btn-success onclick=FarmModule.manualHarvest(${f.id})Hasat Et & Satbutton
                    select onchange=FarmModule.changeCrop(${f.id}, this.value)
                        ${CROPS_DATA.map(c = `option value=${c.id} ${c.id === crop.id  'selected'  ''}${c.name}option`).join('')}
                    select
                div
            `;
            container.appendChild(card);
        });
    },

    changeCrop(fieldId, cropId) {
        if (Game.state.fields[fieldId]) {
            Game.state.fields[fieldId].cropId = cropId;
            Game.state.fields[fieldId].progress = 0;
            Game.updateUI();
        }
    },

    manualHarvest(fieldId) {
        const field = Game.state.fields[fieldId];
        if (!field) return;

        const crop = CROPS_DATA.find(c = c.id === field.cropId);
        const price = EconomyEngine.calculateCropPrice(crop, Game.state);

        Game.state.gold += price;
        Game.state.totals.goldEarned += price;
        Game.state.totals.cropsHarvested += 1;

        field.progress = 0;
        Game.createToast(`Başarıyla ${crop.name} hasat edildi! +${price} Altın.`);
        Game.updateUI();
    }
};