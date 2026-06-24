const CROPS_DATA = [
    { id: "wheat", name: "Buğday", levelRequired: 1, baseTime: 3, baseYield: 1, baseCost: 10, basePrice: 15, icon: "🌾" },
    { id: "barley", name: "Arpa", levelRequired: 2, baseTime: 5, baseYield: 2, baseCost: 40, basePrice: 55, icon: "🌾" },
    { id: "corn", name: "Mısır", levelRequired: 4, baseTime: 10, baseYield: 3, baseCost: 150, basePrice: 210, icon: "🌽" },
    { id: "potato", name: "Patates", levelRequired: 6, baseTime: 15, baseYield: 5, baseCost: 500, basePrice: 720, icon: "🥔" },
    { id: "carrot", name: "Havuç", levelRequired: 9, baseTime: 25, baseYield: 8, baseCost: 2000, basePrice: 2900, icon: "🥕" },
    { id: "onion", name: "Soğan", levelRequired: 12, baseTime: 40, baseYield: 12, baseCost: 8000, basePrice: 11800, icon: "🧅" },
    { id: "tomato", name: "Domates", levelRequired: 16, baseTime: 60, baseYield: 20, baseCost: 35000, basePrice: 53000, icon: "🍅" },
    { id: "coffee", name: "Kahve Çekirdeği", levelRequired: 25, baseTime: 180, baseYield: 50, baseCost: 500000, basePrice: 850000, icon: "🫘" },
    { id: "cotton", name: "Pamuk", levelRequired: 35, baseTime: 400, baseYield: 120, baseCost: 4500000, basePrice: 7800000, icon: "💮" },
    { id: "avocado", name: "Avokado", levelRequired: 50, baseTime: 1200, baseYield: 400, baseCost: 90000000, basePrice: 165000000, icon: "🥑" }
];

const FIELDS_DATA = [
    { id: 1, name: "Küçük Tarla", baseCost: 0, unlocked: true },
    { id: 2, name: "Orta Tarla", baseCost: 250, unlocked: false },
    { id: 3, name: "Büyük Tarla", baseCost: 2500, unlocked: false },
    { id: 4, name: "Dev Tarla", baseCost: 25000, unlocked: false },
    { id: 5, name: "Sera", baseCost: 250000, unlocked: false },
    { id: 6, name: "Meyve Bahçesi", baseCost: 5000000, unlocked: false },
    { id: 7, name: "Endüstriyel Alan", baseCost: 150000000, unlocked: false }
];