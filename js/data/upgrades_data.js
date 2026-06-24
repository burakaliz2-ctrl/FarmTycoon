const WORKERS_DATA = [
    { id: "farmer", name: "Çiftçi", baseCost: 100, costMultiplier: 1.15, desc: "Otomatik ekim ve sulama hızını artırır.", multiplier: 0.05 },
    { id: "harvester", name: "Hasatçı", baseCost: 500, costMultiplier: 1.14, desc: "Otomatik hasat süresini kısaltır.", multiplier: 0.07 },
    { id: "seller", name: "Satıcı", baseCost: 2000, costMultiplier: 1.16, desc: "Ürünlerin taban satış fiyatını yükseltir.", multiplier: 0.04 }
];

const MACHINES_DATA = [
    { id: "tractor", name: "Modüler Traktör", baseCost: 5000, costMultiplier: 1.25, desc: "Tüm tarlaların verimini %20 artırır." },
    { id: "irrigation", name: "Akıllı Sulama Sistemi", baseCost: 25000, costMultiplier: 1.28, desc: "Büyüme hızını %15 hızlandırır." },
    { id: "drone", name: "Tarım Dronu", baseCost: 750000, costMultiplier: 1.35, desc: "Kritik hasat şansını %5 artırır." }
];