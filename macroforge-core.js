/*
=====================================================================
MACROFORGE FINAL CORE ENGINE
=====================================================================
This file is intentionally independent from the older prototype logic.
It owns the parts that must be deterministic:

  1. Food data normalization
  2. Unit/portion conversion
  3. Live nutrition calculation
  4. Global search orchestration
  5. Search relevance scoring
  6. Open Food Facts parsing
  7. Recipe/ingredient composition
  8. Gym supplement records
  9. Validation and anomaly detection
 10. Hydration helpers
 11. Workout data helpers
 12. Local account helpers

The UI can change without changing the nutrition engine.

IMPORTANT ACCURACY RULE
-----------------------
Every food is represented internally by a nutrition BASIS.
The basis is either:

  PER_100G
  PER_100ML
  PER_SERVING
  PER_PIECE

A user-selected portion is converted into the same basis before
multiplication. No function is allowed to multiply a plate directly
against a per-100g number. This is the class of bug that previously
turned a normal plate into thousands of calories.
=====================================================================
*/

(function MacroForgeFinalCore(global) {
  "use strict";

  const MF = global.MacroForgeFinal = {};

  /* ================================================================
     SECTION 01 — NUMERIC SAFETY
     ================================================================ */

  MF.number = function(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  MF.positive = function(value, fallback = 0) {
    const n = MF.number(value, fallback);
    return n > 0 ? n : fallback;
  };

  MF.clamp = function(value, min, max) {
    return Math.min(max, Math.max(min, MF.number(value, min)));
  };

  MF.round = function(value, digits = 2) {
    const n = MF.number(value);
    const p = Math.pow(10, digits);
    return Math.round(n * p) / p;
  };

  MF.isFiniteNutrition = function(n) {
    if (!n || typeof n !== "object") return false;
    return [n.cal, n.p, n.c, n.f, n.fiber]
      .every(v => Number.isFinite(Number(v)));
  };

  MF.zeroNutrition = function() {
    return {
      cal: 0,
      p: 0,
      c: 0,
      f: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };
  };

  MF.addNutrition = function(a, b) {
    a = a || MF.zeroNutrition();
    b = b || MF.zeroNutrition();
    return {
      cal: MF.number(a.cal) + MF.number(b.cal),
      p: MF.number(a.p) + MF.number(b.p),
      c: MF.number(a.c) + MF.number(b.c),
      f: MF.number(a.f) + MF.number(b.f),
      fiber: MF.number(a.fiber) + MF.number(b.fiber),
      sugar: MF.number(a.sugar) + MF.number(b.sugar),
      sodium: MF.number(a.sodium) + MF.number(b.sodium),
      calcium: MF.number(a.calcium) + MF.number(b.calcium),
      iron: MF.number(a.iron) + MF.number(b.iron),
      potassium: MF.number(a.potassium) + MF.number(b.potassium),
      vitaminA: MF.number(a.vitaminA) + MF.number(b.vitaminA),
      vitaminC: MF.number(a.vitaminC) + MF.number(b.vitaminC),
      vitaminD: MF.number(a.vitaminD) + MF.number(b.vitaminD)
    };
  };

  MF.scaleNutrition = function(n, multiplier) {
    multiplier = MF.number(multiplier);
    return {
      cal: MF.number(n?.cal) * multiplier,
      p: MF.number(n?.p) * multiplier,
      c: MF.number(n?.c) * multiplier,
      f: MF.number(n?.f) * multiplier,
      fiber: MF.number(n?.fiber) * multiplier,
      sugar: MF.number(n?.sugar) * multiplier,
      sodium: MF.number(n?.sodium) * multiplier,
      calcium: MF.number(n?.calcium) * multiplier,
      iron: MF.number(n?.iron) * multiplier,
      potassium: MF.number(n?.potassium) * multiplier,
      vitaminA: MF.number(n?.vitaminA) * multiplier,
      vitaminC: MF.number(n?.vitaminC) * multiplier,
      vitaminD: MF.number(n?.vitaminD) * multiplier
    };
  };

  /* ================================================================
     SECTION 02 — FOOD SCHEMA
     ================================================================ */

  MF.BASIS = Object.freeze({
    PER_100G: "per_100g",
    PER_100ML: "per_100ml",
    PER_SERVING: "per_serving",
    PER_PIECE: "per_piece"
  });

  MF.UNITS = Object.freeze([
    "g",
    "ml",
    "plate",
    "bowl",
    "piece",
    "cup",
    "tbsp",
    "tsp",
    "wrap",
    "serving"
  ]);

  MF.DEFAULT_UNIT_WEIGHTS = Object.freeze({
    plate: 300,
    bowl: 250,
    piece: 50,
    cup: 240,
    tbsp: 15,
    tsp: 5,
    wrap: 180,
    serving: 100
  });

  MF.cloneNutrition = function(food) {
    return {
      cal: MF.number(food?.cal),
      p: MF.number(food?.p),
      c: MF.number(food?.c),
      f: MF.number(food?.f),
      fiber: MF.number(food?.fiber),
      sugar: MF.number(food?.sugar),
      sodium: MF.number(food?.sodium),
      calcium: MF.number(food?.calcium),
      iron: MF.number(food?.iron),
      potassium: MF.number(food?.potassium),
      vitaminA: MF.number(food?.vitaminA),
      vitaminC: MF.number(food?.vitaminC),
      vitaminD: MF.number(food?.vitaminD)
    };
  };

  MF.normalizeFood = function(raw) {
    const f = { ...(raw || {}) };

    f.name = String(f.name || "Unnamed food").trim();
    f.roman = String(f.roman || f.name).trim();
    f.category = String(f.category || "Food").trim();

    f.cal = MF.number(f.cal);
    f.p = MF.number(f.p);
    f.c = MF.number(f.c);
    f.f = MF.number(f.f);
    f.fiber = MF.number(f.fiber);
    f.sugar = MF.number(f.sugar);
    f.sodium = MF.number(f.sodium);

    f.basis = f.basis || MF.BASIS.PER_100G;
    f.nutritionAmount = MF.positive(f.nutritionAmount, 100);
    f.nutritionUnit = f.nutritionUnit ||
      (f.basis === MF.BASIS.PER_100ML ? "ml" : "g");

    f.defaultUnit = f.defaultUnit ||
      (f.basis === MF.BASIS.PER_100ML ? "ml" : "g");

    f.unitWeights = {
      ...(f.unitWeights || {})
    };

    f.source = String(
      f.source || "Nutrition reference"
    );

    f.sourceType = String(
      f.sourceType || "reference"
    );

    f.verified = Boolean(f.verified);
    f.global = Boolean(f.global);

    return f;
  };

  /* ================================================================
     SECTION 03 — CURATED PAKISTANI FOOD REFERENCES
     ================================================================ */

  /*
     Values are deliberately stored per 100g wherever a standardized
     recipe reference exists. Plate/bowl weights are UI defaults only;
     they are never confused with the nutrition basis.
  */

  MF.CURATED = [
    {
      name: "Mutton Karahi",
      roman: "Mutton Karahi",
      category: "Pakistani",
      cal: 242.42,
      p: 9.02,
      c: 5.81,
      f: 20.35,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "plate",
      unitWeights: { plate: 300, bowl: 250, serving: 300 },
      source: "Standardized Pakistani recipe analysis — University of Agriculture Peshawar",
      sourceType: "published-study",
      verified: true
    },
    {
      name: "Aloo Gosht",
      roman: "Aloo Gosht",
      category: "Pakistani",
      cal: 199.34,
      p: 4.76,
      c: 10.80,
      f: 15.23,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "plate",
      unitWeights: { plate: 300, bowl: 250, serving: 300 },
      source: "Standardized Pakistani recipe analysis — University of Agriculture Peshawar",
      sourceType: "published-study",
      verified: true
    },
    {
      name: "Chicken Karahi",
      roman: "Chicken Karahi",
      category: "Pakistani",
      cal: 240.51,
      p: 13.37,
      c: 11.09,
      f: 15.85,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "plate",
      unitWeights: { plate: 300, bowl: 250, serving: 300 },
      source: "Standardized Pakistani recipe analysis — University of Agriculture Peshawar",
      sourceType: "published-study",
      verified: true
    },
    {
      name: "Biryani",
      roman: "Biryani",
      category: "Pakistani",
      cal: 160.22,
      p: 6.43,
      c: 21.85,
      f: 5.23,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "plate",
      unitWeights: { plate: 300, bowl: 250, serving: 300 },
      source: "Standardized Pakistani recipe analysis — University of Agriculture Peshawar",
      sourceType: "published-study",
      verified: true
    },
    {
      name: "Haleem",
      roman: "Haleem",
      category: "Pakistani",
      cal: 128.34,
      p: 5.38,
      c: 14.60,
      f: 5.38,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "bowl",
      unitWeights: { bowl: 250, plate: 250, serving: 250 },
      source: "Standardized Pakistani recipe analysis — University of Agriculture Peshawar",
      sourceType: "published-study",
      verified: true
    },
    {
      name: "Aloo",
      roman: "Aloo",
      category: "Pakistani Ingredients",
      cal: 87,
      p: 1.87,
      c: 20.13,
      f: 0.10,
      fiber: 1.8,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "g",
      unitWeights: { piece: 150, bowl: 200 },
      source: "USDA FoodData Central reference for potato",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Gosht — Mutton, cooked",
      roman: "Gosht",
      category: "Pakistani Ingredients",
      cal: 258,
      p: 24.0,
      c: 0,
      f: 17.9,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "g",
      unitWeights: { piece: 50 },
      source: "USDA FoodData Central-style cooked mutton reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "White Rice, cooked",
      roman: "Safed Chawal",
      category: "Staples",
      cal: 130,
      p: 2.69,
      c: 28.17,
      f: 0.28,
      fiber: 0.4,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "g",
      unitWeights: { cup: 158, bowl: 200, plate: 250 },
      source: "USDA FoodData Central reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Chicken Breast, cooked",
      roman: "Chicken Breast",
      category: "Staples",
      cal: 165,
      p: 31.02,
      c: 0,
      f: 3.57,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "g",
      unitWeights: { piece: 120 },
      source: "USDA FoodData Central reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Whole Milk",
      roman: "Doodh",
      category: "Staples",
      cal: 61,
      p: 3.15,
      c: 4.80,
      f: 3.25,
      fiber: 0,
      basis: MF.BASIS.PER_100ML,
      nutritionAmount: 100,
      nutritionUnit: "ml",
      defaultUnit: "ml",
      unitWeights: { cup: 240 },
      source: "USDA FoodData Central reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Banana",
      roman: "Kela",
      category: "Staples",
      cal: 89,
      p: 1.09,
      c: 22.84,
      f: 0.33,
      fiber: 2.6,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "piece",
      unitWeights: { piece: 118 },
      source: "USDA FoodData Central reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Apple",
      roman: "Seb",
      category: "Staples",
      cal: 52,
      p: 0.26,
      c: 13.81,
      f: 0.17,
      fiber: 2.4,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "piece",
      unitWeights: { piece: 182 },
      source: "USDA FoodData Central reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Oats",
      roman: "Jai ke Daliya / Oats",
      category: "Staples",
      cal: 389,
      p: 16.89,
      c: 66.27,
      f: 6.90,
      fiber: 10.6,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "g",
      unitWeights: { cup: 81, tbsp: 5 },
      source: "USDA FoodData Central reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Peanut Butter",
      roman: "Moongphali ka Makhan",
      category: "Staples",
      cal: 588,
      p: 25.09,
      c: 20.02,
      f: 49.94,
      fiber: 6.0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "tbsp",
      unitWeights: { tbsp: 16, tsp: 5 },
      source: "USDA FoodData Central reference",
      sourceType: "USDA-reference",
      verified: true
    }
  ].map(MF.normalizeFood);



  /* ================================================================
     SECTION 03B — FULL PAKISTANI / COMMON FOOD CATALOG
     ================================================================
     These entries preserve the requested food list. Their nutrition is
     marked as a curated estimate unless a published/USDA reference is
     explicitly attached elsewhere. Portion nutrition is stored as a
     serving basis when the original catalog defines a plate/bowl/piece.
     This keeps the math correct without falsely claiming a universal
     homemade recipe is exact.
     ================================================================ */

  MF.LEGACY_SOURCE = "MacroForge curated estimate — verify recipe/label";

  MF.LEGACY_CATALOG = [
["Biryani","Biryani","Pakistani",200,7,24,8,2,"plate"],["Chicken Karahi","Chicken Karahi","Pakistani",185,16,5,11,1,"plate"],["Mutton Karahi","Mutton Karahi","Pakistani",240,16,5,17,1,"plate"],["Beef Karahi","Beef Karahi","Pakistani",225,18,4,15,1,"plate"],["Chicken Handi","Chicken Handi","Pakistani",190,15,7,11,1,"plate"],["Nihari","Nihari","Pakistani",210,13,7,14,1,"bowl"],["Haleem","Haleem","Pakistani",155,9,18,5,4,"bowl"],["Pulao","Pulao","Pakistani",170,4,30,4,1,"plate"],["Aloo Gosht","Aloo Gosht","Pakistani",160,10,10,9,2,"plate"],["Qeema","Qeema","Pakistani",205,17,4,14,1,"plate"],["Lentil Curry","Daal","Pakistani",120,7,18,2,6,"bowl"],["Chickpea Curry","Chana","Pakistani",150,7,22,4,6,"bowl"],["Kidney Bean Curry","Rajma","Pakistani",140,8,23,2,7,"bowl"],["Mustard Greens","Saag","Pakistani",95,4,7,5,4,"bowl"],["Meatball Curry","Kofta","Pakistani",220,13,7,15,1,"plate"],["Chicken Korma","Chicken Korma","Pakistani",210,14,6,14,1,"plate"],["Mutton Korma","Mutton Korma","Pakistani",255,15,6,18,1,"plate"],["Lentils with Rice","Daal Chawal","Pakistani",175,6,29,4,4,"plate"],["Rice & Lentil Porridge","Khichri","Pakistani",135,5,24,3,3,"bowl"],["Spiced Chickpeas","Cholay","Pakistani",150,7,22,4,7,"bowl"],
["Chicken Tikka","Chicken Tikka","BBQ",165,26,2,6,0,"piece"],["Seekh Kebab","Seekh Kebab","BBQ",250,19,5,17,0,"piece"],["Shami Kebab","Shami Kebab","BBQ",220,13,10,14,3,"piece"],["Chapli Kebab","Chapli Kebab","BBQ",270,17,6,20,1,"piece"],["Reshmi Kebab","Reshmi Kebab","BBQ",235,20,4,15,0,"piece"],["Malai Boti","Malai Boti","BBQ",225,21,4,14,0,"piece"],["Bihari Boti","Bihari Boti","BBQ",210,23,3,12,0,"piece"],["Chicken Boti","Chicken Boti","BBQ",170,25,2,7,0,"piece"],["Tandoori Chicken","Tandoori Chicken","BBQ",190,26,2,8,0,"piece"],["BBQ Wings","BBQ Wings","BBQ",250,22,7,16,0,"piece"],
["Roti","Roti","Bread",120,4,24,1.5,3,"piece"],["Naan","Naan","Bread",260,9,50,4,2,"piece"],["Garlic Naan","Lehsan Naan","Bread",290,9,48,7,2,"piece"],["Roghni Naan","Roghni Naan","Bread",300,9,49,8,2,"piece"],["Paratha","Paratha","Bread",320,7,36,16,2,"piece"],["Aloo Paratha","Aloo Paratha","Bread",260,6,35,10,3,"piece"],["Qeema Paratha","Qeema Paratha","Bread",330,14,34,16,2,"piece"],["Puri","Puri","Bread",270,5,31,14,2,"piece"],["Kulcha","Kulcha","Bread",240,8,42,4,2,"piece"],
["Samosa","Samosa","Snacks",260,5,25,15,2,"piece"],["Pakora","Pakora","Snacks",280,6,25,17,3,"piece"],["Spring Roll","Spring Roll","Snacks",210,5,22,11,2,"piece"],["Chaat","Chaat","Snacks",145,5,24,4,5,"plate"],["Yogurt Dumplings","Dahi Bhallay","Snacks",150,6,20,5,3,"plate"],["Gol Gappay","Gol Gappay","Snacks",180,4,28,6,2,"plate"],["Bun Kebab","Bun Kebab","Snacks",340,15,38,15,3,"piece"],["Potato Patty","Aloo Tikki","Snacks",180,4,28,6,3,"piece"],["Papri Chaat","Papri Chaat","Snacks",200,6,28,7,3,"plate"],["Chicken Shawarma","Chicken Shawarma","Snacks",450,27,45,18,4,"wrap"],["Fries","Fries","Snacks",312,3.4,41,15,3.8,"100g"],
["Kheer","Kheer","Desserts",170,4,25,6,0,"bowl"],["Gulab Jamun","Gulab Jamun","Desserts",320,4,50,12,0,"piece"],["Jalebi","Jalebi","Desserts",380,1,68,12,0,"piece"],["Carrot Halwa","Gajar ka Halwa","Desserts",180,4,27,7,2,"bowl"],["Semolina Halwa","Suji ka Halwa","Desserts",260,4,38,11,1,"bowl"],["Ras Malai","Ras Malai","Desserts",180,6,22,8,0,"piece"],["Barfi","Barfi","Desserts",360,8,48,16,1,"piece"],["Sweet Rice","Zarda","Desserts",190,3,36,4,1,"bowl"],["Rice Pudding","Firni","Desserts",155,4,23,5,0,"bowl"],["Kulfi","Kulfi","Desserts",220,6,25,10,0,"piece"],
["Milk Tea","Doodh Patti","Drinks",85,3,10,3,0,"cup"],["Kashmiri Tea","Kashmiri Chai","Drinks",95,3,11,4,0,"cup"],["Yogurt Drink","Lassi","Drinks",95,4,9,4,0,"250ml"],["Mango Yogurt Drink","Aam ki Lassi","Drinks",125,4,21,3,1,"250ml"],["Rose Drink","Rooh Afza","Drinks",80,0,20,0,0,"250ml"],["Sugarcane Juice","Gannay ka Ras","Drinks",110,0,27,0,0,"250ml"],["Lemonade","Shikanjabeen","Drinks",70,0,18,0,0,"250ml"],["Falooda","Falooda","Drinks",220,5,34,7,1,"glass"],["Milk Soda","Doodh Soda","Drinks",100,3,12,4,0,"250ml"],["Green Tea","Kehwa","Drinks",2,0,0,0,0,"cup"],
["Halwa Puri","Halwa Puri","Breakfast",420,9,58,17,3,"plate"],["Chana Puri","Chana Puri","Breakfast",360,12,50,13,7,"plate"],["Egg Paratha","Anda Paratha","Breakfast",380,14,35,20,2,"piece"],["Omelette","Omelette","Breakfast",155,11,2,11,0,"2 eggs"],["Fried Egg","Tala Hua Anda","Breakfast",196,13,1,15,0,"2 eggs"],["Boiled Egg","Ublay Huay Anday","Breakfast",155,13,1,11,0,"2 eggs"],["Chana","Chana","Breakfast",150,7,22,4,7,"bowl"],["Nihari","Nihari","Breakfast",210,13,7,14,0,"bowl"],["Aloo Paratha","Aloo Paratha","Breakfast",260,6,35,10,3,"piece"],["Qeema Paratha","Qeema Paratha","Breakfast",330,14,34,16,2,"piece"],
["White Rice","Safed Chawal","Staple",130,2.7,28,0.3,0.4,"100g"],["Chicken Breast","Chicken Breast","Staple",165,31,0,3.6,0,"100g"],["Whole Milk","Doodh","Staple",61,3.2,4.8,3.3,0,"100ml"],["Banana","Kela","Staple",89,1.1,23,0.3,2.6,"piece"],["Apple","Seb","Staple",52,0.3,14,0.2,2.4,"piece"],["Oats","Jai ke Daliya/Oats","Staple",389,16.9,66,6.9,10.6,"100g"],["Peanut Butter","Moongphali ka Makhan","Staple",588,25,20,50,6,"100g"]
];

  MF.legacyToFood = function(row) {
    const [name, roman, category, cal, p, c, f, fiber, rawUnit] = row;

    const unit = String(rawUnit || "serving");
    let basis = MF.BASIS.PER_SERVING;
    let nutritionAmount = 1;
    let nutritionUnit = "serving";
    let defaultUnit = unit;
    let unitWeights = {};

    if (unit === "100g") {
      basis = MF.BASIS.PER_100G;
      nutritionAmount = 100;
      nutritionUnit = "g";
      defaultUnit = "g";
    } else if (unit === "100ml") {
      basis = MF.BASIS.PER_100ML;
      nutritionAmount = 100;
      nutritionUnit = "ml";
      defaultUnit = "ml";
    } else if (unit === "250ml") {
      basis = MF.BASIS.PER_SERVING;
      nutritionAmount = 1;
      nutritionUnit = "serving";
      defaultUnit = "ml";
      unitWeights = { serving: 250, ml: 1 };
    } else if (unit === "2 eggs") {
      basis = MF.BASIS.PER_SERVING;
      nutritionAmount = 1;
      nutritionUnit = "serving";
      defaultUnit = "piece";
      unitWeights = { serving: 2, piece: 1 };
    } else {
      basis = MF.BASIS.PER_SERVING;
      nutritionAmount = 1;
      nutritionUnit = "serving";
      defaultUnit = unit;
      unitWeights = {
        serving: MF.DEFAULT_UNIT_WEIGHTS[unit] || 100,
        [unit]: MF.DEFAULT_UNIT_WEIGHTS[unit] || 100
      };
    }

    return MF.normalizeFood({
      name,
      roman,
      category,
      cal,
      p,
      c,
      f,
      fiber,
      basis,
      nutritionAmount,
      nutritionUnit,
      defaultUnit,
      unitWeights,
      source: MF.LEGACY_SOURCE,
      sourceType: "curated-estimate",
      verified: false
    });
  };

  MF.LEGACY_FOODS = MF.LEGACY_CATALOG.map(
    MF.legacyToFood
  );


  /* ================================================================
     SECTION 04 — SUPPLEMENT REFERENCES
     ================================================================ */

  MF.SUPPLEMENTS = [
    {
      name: "Whey Protein Powder — Generic",
      roman: "Whey Protein",
      category: "Gym Supplements",
      cal: 359,
      p: 58.14,
      c: 29.07,
      f: 1.16,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "serving",
      unitWeights: { serving: 30, scoop: 30 },
      source: "USDA FoodData Central generic whey reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Whey Protein Isolate — Generic",
      roman: "Whey Isolate",
      category: "Gym Supplements",
      cal: 359,
      p: 58.14,
      c: 29.07,
      f: 1.16,
      fiber: 0,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "serving",
      unitWeights: { serving: 30, scoop: 30 },
      source: "USDA FoodData Central generic whey reference",
      sourceType: "USDA-reference",
      verified: true
    },
    {
      name: "Creatine Monohydrate",
      roman: "Creatine Monohydrate",
      category: "Gym Supplements",
      cal: 0,
      p: 0,
      c: 0,
      f: 0,
      fiber: 0,
      basis: MF.BASIS.PER_SERVING,
      nutritionAmount: 5,
      nutritionUnit: "g",
      defaultUnit: "g",
      unitWeights: { serving: 5, scoop: 5 },
      source: "Product-label reference; pure creatine contains no protein, carbohydrate or fat",
      sourceType: "label-reference",
      verified: true
    },
    {
      name: "Creatine Hydrochloride (HCl)",
      roman: "Creatine HCl",
      category: "Gym Supplements",
      cal: 0,
      p: 0,
      c: 0,
      f: 0,
      fiber: 0,
      basis: MF.BASIS.PER_SERVING,
      nutritionAmount: 5,
      nutritionUnit: "g",
      defaultUnit: "g",
      unitWeights: { serving: 5, scoop: 5 },
      source: "Pure creatine reference; verify the exact product label",
      sourceType: "label-reference",
      verified: false
    },
    {
      name: "Protein Shake — Whey + Water",
      roman: "Protein Shake",
      category: "Gym Supplements",
      cal: 107.7,
      p: 17.44,
      c: 8.72,
      f: 0.35,
      fiber: 0,
      basis: MF.BASIS.PER_SERVING,
      nutritionAmount: 1,
      nutritionUnit: "serving",
      defaultUnit: "serving",
      unitWeights: { serving: 1 },
      source: "Calculated from generic whey reference; water contributes zero kcal",
      sourceType: "calculated",
      verified: false
    },
    {
      name: "Mass Gainer — Generic",
      roman: "Mass Gainer",
      category: "Gym Supplements",
      cal: 380,
      p: 20,
      c: 70,
      f: 5,
      fiber: 2,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "serving",
      unitWeights: { serving: 100 },
      source: "Generic placeholder; exact mass-gainer nutrition must come from the product label",
      sourceType: "generic-reference",
      verified: false
    }
  ].map(MF.normalizeFood);

  /* ================================================================
     SECTION 05 — RECIPE COMPONENTS
     ================================================================ */

  MF.INGREDIENTS = {
    "Aloo": MF.CURATED.find(f => f.name === "Aloo"),
    "Gosht": MF.CURATED.find(f => f.name.startsWith("Gosht")),
    "White Rice": MF.CURATED.find(f => f.name.startsWith("White Rice")),
    "Chicken Breast": MF.CURATED.find(f => f.name.startsWith("Chicken Breast")),
    "Whole Milk": MF.CURATED.find(f => f.name === "Whole Milk"),
    "Oats": MF.CURATED.find(f => f.name === "Oats"),
    "Peanut Butter": MF.CURATED.find(f => f.name === "Peanut Butter")
  };

  MF.recipeNutrition = function(ingredients) {
    let total = MF.zeroNutrition();
    let grams = 0;

    for (const item of ingredients || []) {
      const food = item.food || item;
      const amount = MF.positive(item.amount, 0);
      if (!food || !amount) continue;
      const result = MF.calculate(food, amount, "g");
      total = MF.addNutrition(total, result);
      grams += amount;
    }

    return {
      nutrition: total,
      grams
    };
  };

  MF.RECIPES = [
    {
      id: "aloo-gosht",
      name: "Aloo Gosht",
      category: "Pakistani Salan",
      description: "Combined potato + cooked mutton curry reference.",
      source: "Standardized Pakistani recipe analysis",
      components: [
        { foodName: "Aloo", grams: 35 },
        { foodName: "Gosht", grams: 45 },
        { customNutrition: { cal: 73.5, p: 1.4, c: 4.2, f: 5.1, fiber: 0 }, grams: 20 }
      ]
    },
    {
      id: "aloo-only",
      name: "Aloo — cooked",
      category: "Pakistani Ingredients",
      description: "Potato component logged separately.",
      components: [
        { foodName: "Aloo", grams: 100 }
      ]
    },
    {
      id: "gosht-only",
      name: "Gosht — mutton",
      category: "Pakistani Ingredients",
      description: "Mutton component logged separately.",
      components: [
        { foodName: "Gosht", grams: 100 }
      ]
    }
  ];

  MF.recipeToFood = function(recipe) {
    let total = MF.zeroNutrition();
    let grams = 0;

    for (const item of recipe.components || []) {
      const amount = MF.positive(item.grams, 0);
      if (!amount) continue;

      if (item.foodName) {
        const food = MF.INGREDIENTS[item.foodName];
        if (food) {
          total = MF.addNutrition(
            total,
            MF.calculate(food, amount, "g")
          );
          grams += amount;
        }
      } else if (item.customNutrition) {
        total = MF.addNutrition(
          total,
          MF.scaleNutrition(
            item.customNutrition,
            amount / 100
          )
        );
        grams += amount;
      }
    }

    const per100 = grams > 0
      ? MF.scaleNutrition(total, 100 / grams)
      : MF.zeroNutrition();

    return MF.normalizeFood({
      name: recipe.name,
      roman: recipe.name,
      category: recipe.category,
      ...per100,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "plate",
      unitWeights: { plate: 300, bowl: 250, serving: 300 },
      source: recipe.source,
      sourceType: "recipe",
      verified: false
    });
  };

  MF.RECIPE_FOODS = [];

  /* ================================================================
     SECTION 06 — PORTION CONVERSION ENGINE
     ================================================================ */

  MF.weightForUnit = function(food, unit) {
    const f = MF.normalizeFood(food);

    if (unit === "g") return 1;
    if (unit === "ml") return 1;

    if (
      f.unitWeights &&
      Number.isFinite(Number(f.unitWeights[unit]))
    ) {
      return Number(f.unitWeights[unit]);
    }

    if (unit === "serving") {
      if (f.basis === MF.BASIS.PER_SERVING) {
        return 1;
      }
      return MF.DEFAULT_UNIT_WEIGHTS.serving;
    }

    return MF.DEFAULT_UNIT_WEIGHTS[unit] || 100;
  };

  MF.basisAmount = function(food) {
    const f = MF.normalizeFood(food);
    return MF.positive(f.nutritionAmount, 100);
  };

  MF.basisUnit = function(food) {
    const f = MF.normalizeFood(food);

    if (f.basis === MF.BASIS.PER_100ML) return "ml";
    if (f.basis === MF.BASIS.PER_100G) return "g";
    if (f.basis === MF.BASIS.PER_SERVING) return "serving";
    if (f.basis === MF.BASIS.PER_PIECE) return "piece";

    return f.nutritionUnit || "g";
  };

  MF.toBasisUnits = function(food, amount, unit) {
    const f = MF.normalizeFood(food);
    amount = Math.max(0, MF.number(amount));
    unit = unit || f.defaultUnit || "g";

    if (amount === 0) return 0;

    const basis = MF.basisUnit(f);

    if (basis === unit) {
      return amount;
    }

    /* Mass basis: every UI unit is converted to grams. */
    if (basis === "g") {
      if (unit === "g") return amount;
      if (unit === "ml") {
        return amount * MF.number(f.mlToGram, 1);
      }
      return amount * MF.weightForUnit(f, unit);
    }

    /* Volume basis: every UI unit is converted to millilitres. */
    if (basis === "ml") {
      if (unit === "ml") return amount;
      if (unit === "g") {
        return amount * MF.number(f.gramToMl, 1);
      }
      return amount * MF.weightForUnit(f, unit);
    }

    /* Per-serving or per-piece data must scale in units, not grams. */
    if (basis === "serving") {
      if (unit === "serving") return amount;
      const servingWeight = MF.weightForUnit(f, "serving");
      const selectedWeight =
        unit === "g" || unit === "ml"
          ? amount
          : amount * MF.weightForUnit(f, unit);
      return selectedWeight / Math.max(1, servingWeight);
    }

    if (basis === "piece") {
      if (unit === "piece") return amount;
      const pieceWeight = MF.weightForUnit(f, "piece");
      const selectedWeight =
        unit === "g" || unit === "ml"
          ? amount
          : amount * MF.weightForUnit(f, unit);
      return selectedWeight / Math.max(1, pieceWeight);
    }

    return amount;
  };

  MF.calculate = function(food, amount, unit) {
    const f = MF.normalizeFood(food);
    const safeAmount = Math.max(0, MF.number(amount));
    const basisUnits = MF.toBasisUnits(
      f,
      safeAmount,
      unit || f.defaultUnit
    );

    const multiplier =
      basisUnits / MF.basisAmount(f);

    const result = MF.scaleNutrition(
      MF.cloneNutrition(f),
      multiplier
    );

    result.multiplier = multiplier;
    result.inputAmount = safeAmount;
    result.inputUnit = unit || f.defaultUnit;
    result.basisUnit = MF.basisUnit(f);
    result.basisAmount = MF.basisAmount(f);
    result.equivalentGrams = MF.equivalentGrams(
      f,
      safeAmount,
      unit || f.defaultUnit
    );

    return result;
  };

  MF.equivalentGrams = function(food, amount, unit) {
    const f = MF.normalizeFood(food);
    amount = Math.max(0, MF.number(amount));
    unit = unit || f.defaultUnit;

    if (unit === "g") return amount;
    if (unit === "ml") {
      return amount * MF.number(f.mlToGram, 1);
    }

    if (f.unitWeights?.[unit]) {
      return amount * Number(f.unitWeights[unit]);
    }

    if (f.basis === MF.BASIS.PER_SERVING) {
      return amount * MF.weightForUnit(f, "serving");
    }

    return amount * MF.weightForUnit(f, unit);
  };

  /* Recipe foods are materialized only after the canonical portion
     calculation engine has been declared. */
  MF.RECIPE_FOODS = MF.RECIPES.map(
    MF.recipeToFood
  );

  MF.validateCalculation = function(food, amount, unit, result) {
    const problems = [];
    const f = MF.normalizeFood(food);

    if (amount <= 0) {
      problems.push("Amount must be greater than zero.");
    }

    if (!MF.isFiniteNutrition(result)) {
      problems.push("Nutrition result contains an invalid number.");
    }

    if (result.cal > 10000 && amount <= 10) {
      problems.push("Unusually high calories for this portion.");
    }

    if (result.p > 500 && amount <= 10) {
      problems.push("Unusually high protein for this portion.");
    }

    if (
      f.basis === MF.BASIS.PER_100G &&
      (unit === "plate" || unit === "bowl") &&
      result.cal > 3000
    ) {
      problems.push("Plate/bowl conversion looks suspicious.");
    }

    return {
      valid: problems.length === 0,
      problems
    };
  };

  /* ================================================================
     SECTION 07 — GLOBAL SEARCH NORMALIZATION
     ================================================================ */

  MF.normalizeSearch = function(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  MF.searchTokens = function(value) {
    return MF.normalizeSearch(value)
      .split(" ")
      .filter(Boolean);
  };

  MF.removeBrandNoise = function(value) {
    return MF.normalizeSearch(value)
      .replace(/\b(original|classic|new|flavour|flavor|pack|family|size)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  MF.searchFields = function(product) {
    return {
      nameEn: MF.normalizeSearch(product.product_name_en),
      name: MF.normalizeSearch(product.product_name),
      genericEn: MF.normalizeSearch(product.generic_name_en),
      generic: MF.normalizeSearch(product.generic_name),
      brand: MF.normalizeSearch(product.brands),
      categories: MF.normalizeSearch(
        Array.isArray(product.categories_tags)
          ? product.categories_tags.join(" ")
          : product.categories_tags
      )
    };
  };

  MF.scoreSearchResult = function(product, query) {
    const q = MF.normalizeSearch(query);
    const qTokens = MF.searchTokens(query);
    const fields = MF.searchFields(product);

    if (!q || !qTokens.length) return -1;

    const exactFields = [
      fields.nameEn,
      fields.name,
      fields.genericEn,
      fields.generic,
      fields.brand
    ];

    let score = 0;
    let tokenMatches = 0;

    if (fields.nameEn === q) score += 5000;
    if (fields.name === q) score += 4800;
    if (fields.genericEn === q) score += 4300;
    if (fields.generic === q) score += 4200;
    if (fields.brand === q) score += 3800;

    for (const field of exactFields) {
      if (!field) continue;
      if (field.startsWith(q)) score += 1800;
      if (field.includes(q)) score += 900;
    }

    for (const token of qTokens) {
      const found = exactFields.some(
        field => field.split(" ").includes(token) || field.includes(token)
      );
      if (found) {
        tokenMatches += 1;
        score += 250;
      }
    }

    if (tokenMatches === qTokens.length) {
      score += 900;
    } else if (tokenMatches === 0) {
      return -1;
    }

    if (fields.nameEn) score += 150;
    if (fields.genericEn) score += 80;

    /* Penalize results where the query only appears in a category. */
    if (
      fields.categories.includes(q) &&
      !exactFields.some(field => field.includes(q))
    ) {
      score -= 1500;
    }

    return score;
  };

  MF.chooseEnglishName = function(product, query) {
    const q = MF.normalizeSearch(query);
    const candidates = [
      product.product_name_en,
      product.generic_name_en,
      product.product_name,
      product.generic_name
    ]
      .map(v => String(v || "").trim())
      .filter(Boolean);

    const exact = candidates.find(
      v => MF.normalizeSearch(v) === q
    );

    if (exact) return exact;

    const contains = candidates.find(
      v => MF.normalizeSearch(v).includes(q)
    );

    if (contains) return contains;

    return candidates[0] || "Unnamed food";
  };

  /* ================================================================
     SECTION 08 — OPEN FOOD FACTS NUTRITION PARSER
     ================================================================ */

  MF.nutriments = function(product) {
    const n = product?.nutriments || {};

    let cal = MF.number(
      n["energy-kcal_100g"] ??
      n["energy-kcal"]
    );

    if (!cal) {
      const kj = MF.number(
        n["energy_100g"] ??
        n["energy-kj_100g"]
      );
      if (kj) cal = kj / 4.184;
    }

    return {
      cal,
      p: MF.number(n["proteins_100g"]),
      c: MF.number(n["carbohydrates_100g"]),
      f: MF.number(n["fat_100g"]),
      fiber: MF.number(n["fiber_100g"]),
      sugar: MF.number(n["sugars_100g"]),
      sodium: MF.number(n["sodium_100g"]),
      calcium: MF.number(n["calcium_100g"]),
      iron: MF.number(n["iron_100g"]),
      potassium: MF.number(n["potassium_100g"]),
      vitaminA: MF.number(n["vitamin-a_100g"]),
      vitaminC: MF.number(n["vitamin-c_100g"]),
      vitaminD: MF.number(n["vitamin-d_100g"])
    };
  };

  MF.hasUsefulNutrition = function(product) {
    const n = MF.nutriments(product);
    return (
      n.cal > 0 ||
      n.p > 0 ||
      n.c > 0 ||
      n.f > 0
    );
  };

  MF.globalToFood = function(product, query) {
    const nutrition = MF.nutriments(product);
    const name = MF.chooseEnglishName(product, query);

    return MF.normalizeFood({
      name,
      roman: product.brands
        ? `Brand: ${product.brands}`
        : "Global food",
      category: "Global Foods",
      ...nutrition,
      basis: MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit: "g",
      unitWeights: {
        serving: MF.parseServingGrams(
          product.serving_size
        ) || 100
      },
      quantity: product.quantity || "",
      servingText: product.serving_size || "",
      barcode: product.code || "",
      image: product.image_front_small_url || "",
      source: "Open Food Facts",
      sourceType: "global-database",
      verified: false,
      global: true,
      apiProduct: product
    });
  };

  MF.parseServingGrams = function(value) {
    const text = String(value || "").toLowerCase();
    const match = text.match(/([0-9]+(?:\.[0-9]+)?)\s*g\b/);
    return match ? Number(match[1]) : 0;
  };

  /* ================================================================
     SECTION 09 — GLOBAL SEARCH SERVICE
     ================================================================ */

  MF.Search = {
    sequence: 0,
    controller: null,
    timer: null,
    cache: new Map(),
    pageSize: 40
  };

  MF.Search.abort = function() {
    if (MF.Search.controller) {
      MF.Search.controller.abort();
      MF.Search.controller = null;
    }
    clearTimeout(MF.Search.timer);
  };

  MF.Search.makeFields = function() {
    return [
      "code",
      "product_name",
      "product_name_en",
      "generic_name",
      "generic_name_en",
      "brands",
      "categories_tags",
      "serving_size",
      "quantity",
      "languages_tags",
      "nutriments",
      "image_front_small_url"
    ].join(",");
  };

  MF.Search.legacyUrl = function(query) {
    return "https://world.openfoodfacts.org/cgi/search.pl" +
      "?action=process" +
      "&json=1" +
      "&search_simple=1" +
      "&search_terms=" + encodeURIComponent(query) +
      "&page_size=" + MF.Search.pageSize +
      "&lc=en" +
      "&fields=" + encodeURIComponent(
        MF.Search.makeFields()
      );
  };

  MF.Search.searchAliciousUrl = function() {
    return "https://search.openfoodfacts.org/search";
  };

  MF.Search.postSearchAlicious = async function(query, signal) {
    const response = await fetch(
      MF.Search.searchAliciousUrl(),
      {
        method: "POST",
        mode: "cors",
        signal,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          q: query,
          page: 1,
          page_size: MF.Search.pageSize,
          langs: ["en"],
          fields: MF.Search.makeFields().split(",")
        })
      }
    );

    if (!response.ok) {
      throw new Error(
        `Search-a-licious HTTP ${response.status}`
      );
    }

    return response.json();
  };

  MF.Search.legacy = async function(query, signal) {
    const response = await fetch(
      MF.Search.legacyUrl(query),
      {
        method: "GET",
        mode: "cors",
        signal,
        headers: {
          "Accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `Open Food Facts HTTP ${response.status}`
      );
    }

    return response.json();
  };

  MF.Search.extractProducts = function(data) {
    if (!data) return [];

    if (Array.isArray(data.products)) {
      return data.products;
    }

    if (Array.isArray(data.hits)) {
      return data.hits.map(
        h => h?._source || h
      );
    }

    if (Array.isArray(data.results)) {
      return data.results;
    }

    return [];
  };

  MF.Search.rank = function(products, query) {
    const seen = new Set();
    const ranked = [];

    for (const product of products || []) {
      if (!product || !MF.hasUsefulNutrition(product)) {
        continue;
      }

      const score =
        MF.scoreSearchResult(
          product,
          query
        );

      if (score < 0) continue;

      const food = MF.globalToFood(
        product,
        query
      );

      const key =
        `${MF.normalizeSearch(food.name)}|${product.code || ""}`;

      if (seen.has(key)) continue;
      seen.add(key);

      ranked.push({
        ...food,
        searchScore: score,
        exact: score >= 5000,
        starts: score >= 1800
      });
    }

    ranked.sort(
      (a, b) =>
        b.searchScore - a.searchScore
    );

    return ranked;
  };

  MF.Search.run = async function(query) {
    const cleaned = String(query || "").trim();
    const normalized = MF.normalizeSearch(cleaned);

    if (normalized.length < 2) {
      return {
        query: cleaned,
        foods: [],
        exact: [],
        related: [],
        source: null
      };
    }

    if (MF.Search.cache.has(normalized)) {
      return MF.Search.cache.get(normalized);
    }

    MF.Search.abort();

    const sequence = ++MF.Search.sequence;
    const controller = new AbortController();
    MF.Search.controller = controller;

    let data = null;
    let source = null;
    let firstError = null;

    try {
      data = await MF.Search.postSearchAlicious(
        cleaned,
        controller.signal
      );
      source = "Open Food Facts Search-a-licious";
    } catch (error) {
      if (error?.name === "AbortError") {
        throw error;
      }
      firstError = error;
    }

    if (!data) {
      try {
        data = await MF.Search.legacy(
          cleaned,
          controller.signal
        );
        source = "Open Food Facts legacy full-text search";
      } catch (error) {
        if (error?.name === "AbortError") {
          throw error;
        }
        error.first = firstError;
        throw error;
      }
    }

    if (sequence !== MF.Search.sequence) {
      return {
        stale: true,
        query: cleaned,
        foods: [],
        exact: [],
        related: [],
        source
      };
    }

    const products =
      MF.Search.extractProducts(data);

    const foods =
      MF.Search.rank(
        products,
        cleaned
      );

    const result = {
      query: cleaned,
      foods,
      exact: foods.filter(f => f.exact),
      related: foods.filter(f => !f.exact),
      source
    };

    MF.Search.cache.set(
      normalized,
      result
    );

    /* Keep the browser cache bounded. */
    if (MF.Search.cache.size > 50) {
      const firstKey =
        MF.Search.cache.keys().next().value;
      MF.Search.cache.delete(firstKey);
    }

    return result;
  };

  /* ================================================================
     SECTION 10 — FOOD UI BRIDGE
     ================================================================ */

  MF.escape = function(value) {
    if (typeof global.esc === "function") {
      return global.esc(value);
    }

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  MF.foodPayload = function(food) {
    return encodeURIComponent(
      JSON.stringify(food)
    );
  };

  MF.card = function(food, label = "") {
    const f = MF.normalizeFood(food);
    const payload = MF.foodPayload(f);
    const basis = MF.basisAmount(f);
    const unit = MF.basisUnit(f);

    return `
      <article class="food-card mf-final-food-card">
        <span class="category">${MF.escape(label || f.category)}</span>
        <h3>${MF.escape(f.name)}</h3>
        <div class="roman">${
          f.roman !== f.name
            ? MF.escape(f.roman)
            : ""
        }</div>
        <div class="macro-line">
          <span>CAL<b>${MF.round(f.cal, 1)}</b></span>
          <span>PROT<b>${MF.round(f.p, 1)}g</b></span>
          <span>CARB<b>${MF.round(f.c, 1)}g</b></span>
          <span>FAT<b>${MF.round(f.f, 1)}g</b></span>
        </div>
        <small class="mf-basis-line">
          Per ${basis}${MF.escape(unit)} ·
          Fiber ${MF.round(f.fiber, 1)}g
        </small>
        ${
          f.servingText
            ? `<small class="mf-source-line">Serving: ${MF.escape(f.servingText)}</small>`
            : ""
        }
        <button
          class="primary full"
          onclick="MacroForgeFinal.openEncoded('${payload}')"
        >
          Log food
        </button>
      </article>
    `;
  };

  MF.openEncoded = function(encoded) {
    try {
      const food =
        JSON.parse(
          decodeURIComponent(encoded)
        );
      MF.openFood(food);
    } catch (error) {
      console.error(error);
      if (typeof global.toast === "function") {
        global.toast("Could not open this food.");
      }
    }
  };

  MF.localFoods = function() {
    const foods = [
      ...MF.CURATED,
      ...MF.LEGACY_FOODS,
      ...MF.SUPPLEMENTS,
      ...MF.RECIPE_FOODS
    ];

    const custom =
      global.state?.customFoods || [];

    const merged = foods.concat(
      custom.map(MF.normalizeFood)
    );

    /* Prefer the curated/source-backed record when names collide. */
    const seen = new Set();
    return merged.filter(food => {
      const key = MF.normalizeSearch(food.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  MF.filterLocal = function(query, category) {
    const q = MF.normalizeSearch(query);
    return MF.localFoods().filter(food => {
      if (
        category &&
        category !== "all" &&
        food.category !== category
      ) {
        return false;
      }

      if (!q) return true;

      const haystack = MF.normalizeSearch(
        `${food.name} ${food.roman} ${food.category}`
      );

      return q
        .split(" ")
        .every(token =>
          haystack.includes(token)
        );
    });
  };

  MF.renderFoods = function() {
    const box =
      document.getElementById(
        "foodResults"
      );

    if (!box) return;

    const input =
      document.getElementById(
        "foodSearch"
      );

    const query =
      String(input?.value || "").trim();

    const category =
      global.currentFilter || "all";

    const local =
      MF.filterLocal(
        query,
        category
      );

    box.innerHTML = local.length
      ? local.map(
          f => MF.card(f, f.category)
        ).join("")
      : `
        <div class="empty-state mf-local-empty">
          <h3>No local food matched</h3>
          <p>
            MacroForge will search the global database for
            “${MF.escape(query)}”.
          </p>
        </div>
      `;

    MF.scheduleGlobalSearch(query);
  };

  MF.scheduleGlobalSearch = function(query) {
    MF.Search.abort();
    clearTimeout(MF.Search.timer);

    if (MF.Search.sequence === undefined) {
      MF.Search.sequence = 0;
    }

    if (
      MF.normalizeSearch(query).length < 2
    ) {
      return;
    }

    const box =
      document.getElementById(
        "foodResults"
      );

    if (!box) return;

    const message =
      document.createElement("div");

    message.className =
      "global-message mf-search-status";
    message.style.gridColumn =
      "1/-1";
    message.style.padding =
      "14px 0";
    message.style.color =
      "#71897f";
    message.textContent =
      `Searching the global database for “${query}”…`;

    box.appendChild(message);

    MF.Search.timer = setTimeout(
      async () => {
        try {
          const result =
            await MF.Search.run(query);

          if (result.stale) return;

          message.remove();
          MF.renderGlobalResults(
            result
          );
        } catch (error) {
          if (
            error?.name ===
            "AbortError"
          ) return;

          message.textContent =
            "Global search could not connect. Local foods and Custom Food are still available.";
          message.classList.add(
            "mf-search-error"
          );
        }
      },
      350
    );
  };

  MF.renderGlobalResults = function(result) {
    const box =
      document.getElementById(
        "foodResults"
      );

    if (!box) return;

    if (!result.foods.length) {
      box.insertAdjacentHTML(
        "beforeend",
        `
          <div class="global-message mf-no-global">
            No reliable global result for
            “${MF.escape(result.query)}”.
            Try a brand + product name, or use Custom Food.
          </div>
        `
      );
      return;
    }

    const heading = `
      <div class="global-section mf-global-heading">
        GLOBAL RESULTS · ${result.foods.length}
      </div>
    `;

    const exact = result.exact.length
      ? `
        <div class="global-section mf-global-subheading">
          EXACT / HIGH-CONFIDENCE MATCHES
        </div>
        ${result.exact.slice(0, 15).map(
          f => MF.card(f, "GLOBAL · EXACT")
        ).join("")}
      `
      : "";

    const related = result.related.length
      ? `
        <div class="global-section mf-global-subheading">
          RELATED MATCHES
        </div>
        ${result.related.slice(0, 15).map(
          f => MF.card(f, "GLOBAL · RELATED")
        ).join("")}
      `
      : "";

    box.insertAdjacentHTML(
      "beforeend",
      heading + exact + related
    );
  };

  MF.bindSearch = function() {
    const input =
      document.getElementById(
        "foodSearch"
      );

    const button =
      document.getElementById(
        "searchFoodBtn"
      );

    if (!input) return;

    /* Clone to guarantee that prototype handlers do not survive. */
    const cleanInput =
      input.cloneNode(true);
    input.replaceWith(cleanInput);

    const cleanButton =
      button?.cloneNode(true);

    if (button && cleanButton) {
      button.replaceWith(cleanButton);
    }

    let timer = null;

    cleanInput.addEventListener(
      "input",
      () => {
        clearTimeout(timer);
        timer = setTimeout(
          () => MF.renderFoods(),
          250
        );
      }
    );

    cleanInput.addEventListener(
      "keydown",
      event => {
        if (
          event.key ===
          "Enter"
        ) {
          event.preventDefault();
          clearTimeout(timer);
          MF.renderFoods();
        }
      }
    );

    cleanButton?.addEventListener(
      "click",
      () => {
        clearTimeout(timer);
        MF.renderFoods();
      }
    );
  };

  /* ================================================================
     SECTION 11 — FOOD MODAL / LIVE PORTION CALCULATION
     ================================================================ */

  MF.selectedFood = null;

  MF.unitsForFood = function(food) {
    const f = MF.normalizeFood(food);
    const units = [
      "g",
      "ml",
      "plate",
      "bowl",
      "piece",
      "cup",
      "tbsp",
      "tsp",
      "wrap",
      "serving"
    ];

    if (f.basis === MF.BASIS.PER_SERVING) {
      return ["serving", "g", "plate", "bowl", "piece"];
    }

    if (f.basis === MF.BASIS.PER_100ML) {
      return ["ml", "cup", "serving"];
    }

    return units;
  };

  MF.renderModalUnits = function(food) {
    const select =
      document.getElementById(
        "servingUnit"
      );

    if (!select) return;

    const units =
      MF.unitsForFood(food);

    select.innerHTML = units.map(
      unit =>
        `<option value="${unit}">${unit}</option>`
    ).join("");
  };

  MF.updateModal = function() {
    const food =
      MF.selectedFood;

    if (!food) return;

    const amountInput =
      document.getElementById(
        "servingAmount"
      );

    const unitInput =
      document.getElementById(
        "servingUnit"
      );

    const nutritionBox =
      document.getElementById(
        "modalNutrition"
      );

    const note =
      document.getElementById(
        "servingConversionNote"
      );

    if (
      !amountInput ||
      !unitInput ||
      !nutritionBox
    ) return;

    const amount =
      Math.max(
        0,
        MF.number(
          amountInput.value
        )
      );

    const unit =
      unitInput.value;

    const result =
      MF.calculate(
        food,
        amount,
        unit
      );

    const validation =
      MF.validateCalculation(
        food,
        amount,
        unit,
        result
      );

    nutritionBox.innerHTML = `
      <div class="nutrition-grid">
        <div class="nutrition-box">
          <small>Calories</small>
          <b>${MF.round(result.cal, 1)} kcal</b>
        </div>
        <div class="nutrition-box">
          <small>Protein</small>
          <b>${MF.round(result.p, 1)}g</b>
        </div>
        <div class="nutrition-box">
          <small>Carbs</small>
          <b>${MF.round(result.c, 1)}g</b>
        </div>
        <div class="nutrition-box">
          <small>Fat</small>
          <b>${MF.round(result.f, 1)}g</b>
        </div>
        <div class="nutrition-box">
          <small>Fiber</small>
          <b>${MF.round(result.fiber, 1)}g</b>
        </div>
        <div class="nutrition-box">
          <small>Sugar</small>
          <b>${MF.round(result.sugar, 1)}g</b>
        </div>
        <div class="nutrition-box">
          <small>Calcium</small>
          <b>${MF.round(result.calcium, 1)}mg</b>
        </div>
        <div class="nutrition-box">
          <small>Iron</small>
          <b>${MF.round(result.iron, 1)}mg</b>
        </div>
        <div class="nutrition-box">
          <small>Potassium</small>
          <b>${MF.round(result.potassium, 1)}mg</b>
        </div>
      </div>
      <p class="muted">
        ${MF.escape(String(amount))}
        ${MF.escape(unit)} ·
        base: ${MF.escape(String(MF.basisAmount(food)))}
        ${MF.escape(MF.basisUnit(food))}
      </p>
    `;

    if (note) {
      const grams =
        result.equivalentGrams;

      note.textContent =
        `${MF.round(grams, 0)}g equivalent · updates instantly`;

      if (!validation.valid) {
        note.textContent +=
          ` · ${validation.problems[0]}`;
      }
    }

    const source =
      document.getElementById(
        "foodSourceNote"
      );

    if (source) {
      source.textContent =
        `Source: ${food.source}` +
        (food.verified
          ? " · reference marked verified"
          : " · verify against the product/recipe label when applicable");
    }
  };

  MF.openFood = function(food) {
    MF.selectedFood =
      MF.normalizeFood(
        food
      );

    const title =
      document.getElementById(
        "modalFoodName"
      );

    if (title) {
      title.textContent =
        MF.selectedFood.name;
    }

    MF.renderModalUnits(
      MF.selectedFood
    );

    const amount =
      document.getElementById(
        "servingAmount"
      );

    const unit =
      document.getElementById(
        "servingUnit"
      );

    const defaultUnit =
      MF.selectedFood.defaultUnit ||
      MF.basisUnit(
        MF.selectedFood
      );

    if (unit) {
      unit.value =
        defaultUnit;
    }

    if (amount) {
      if (
        defaultUnit === "g" ||
        defaultUnit === "ml"
      ) {
        if (MF.basisUnit(MF.selectedFood) === defaultUnit) {
          amount.value =
            MF.basisAmount(MF.selectedFood);
        } else if (MF.selectedFood.basis === MF.BASIS.PER_SERVING) {
          amount.value =
            MF.weightForUnit(
              MF.selectedFood,
              "serving"
            );
        } else if (MF.selectedFood.basis === MF.BASIS.PER_PIECE) {
          amount.value =
            MF.weightForUnit(
              MF.selectedFood,
              "piece"
            );
        } else {
          amount.value = 1;
        }
      } else {
        amount.value = 1;
      }

      amount.min = "0";
      amount.step = "0.1";
      amount.inputMode = "decimal";
    }

    MF.updateModal();

    if (typeof global.modal === "function") {
      global.modal(
        "foodModal",
        true
      );
    }

    setTimeout(() => {
      amount?.focus();
      amount?.select();
    }, 50);
  };

  MF.confirmFood = function() {
    const food =
      MF.selectedFood;

    if (!food) return;

    const amountInput =
      document.getElementById(
        "servingAmount"
      );

    const unitInput =
      document.getElementById(
        "servingUnit"
      );

    const amount =
      MF.number(
        amountInput?.value
      );

    const unit =
      unitInput?.value ||
      food.defaultUnit;

    if (amount <= 0) {
      amountInput?.focus();
      if (typeof global.toast === "function") {
        global.toast(
          "Enter an amount greater than zero."
        );
      }
      return;
    }

    const result =
      MF.calculate(
        food,
        amount,
        unit
      );

    const validation =
      MF.validateCalculation(
        food,
        amount,
        unit,
        result
      );

    if (!validation.valid) {
      if (typeof global.toast === "function") {
        global.toast(
          validation.problems[0]
        );
      }
      return;
    }

    if (!global.state) {
      return;
    }

    if (!Array.isArray(global.state.foodLog)) {
      global.state.foodLog = [];
    }

    global.state.foodLog.push({
      id:
        `food-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: food.name,
      amount,
      unit,
      cal: result.cal,
      p: result.p,
      c: result.c,
      f: result.f,
      fiber: result.fiber,
      date:
        typeof global.today === "function"
          ? global.today()
          : new Date().toISOString().slice(0, 10),
      source: food.source,
      basis: food.basis,
      equivalentGrams:
        result.equivalentGrams
    });

    if (typeof global.save === "function") {
      global.save();
    }

    if (typeof global.modal === "function") {
      global.modal(
        "foodModal",
        false
      );
    }

    if (typeof global.updateDashboard === "function") {
      global.updateDashboard();
    }

    if (typeof global.renderFoods === "function") {
      /* No-op here; avoid re-rendering search during logging. */
    }

    if (typeof global.toast === "function") {
      global.toast(
        `${food.name} logged · ${MF.round(result.cal, 0)} kcal`
      );
    }
  };

  /* ================================================================
     SECTION 12 — FOOD LOG VALIDATION / REPAIR
     ================================================================ */

  MF.validateLogEntry = function(entry) {
    const problems = [];

    for (const key of [
      "cal",
      "p",
      "c",
      "f",
      "fiber"
    ]) {
      if (!Number.isFinite(Number(entry?.[key]))) {
        problems.push(
          `${key} is invalid`
        );
      }
    }

    if (Number(entry?.amount) <= 0) {
      problems.push(
        "amount is not positive"
      );
    }

    if (Number(entry?.cal) > 10000) {
      problems.push(
        "calories are implausibly high"
      );
    }

    if (Number(entry?.p) > 500) {
      problems.push(
        "protein is implausibly high"
      );
    }

    return {
      valid: problems.length === 0,
      problems
    };
  };

  MF.scanFoodLog = function() {
    const log =
      global.state?.foodLog || [];

    return log.map(
      entry => ({
        entry,
        ...MF.validateLogEntry(entry)
      })
    );
  };

  MF.removeInvalidLogEntries = function() {
    if (!global.state) return 0;

    const before =
      global.state.foodLog.length;

    global.state.foodLog =
      global.state.foodLog.filter(
        entry =>
          MF.validateLogEntry(
            entry
          ).valid
      );

    const removed =
      before -
      global.state.foodLog.length;

    if (removed &&
        typeof global.save === "function") {
      global.save();
    }

    return removed;
  };

  /* ================================================================
     SECTION 13 — HYDRATION ENGINE
     ================================================================ */

  MF.hydration = {};

  MF.hydration.validUnits = [
    "ml",
    "L",
    "cup",
    "glass"
  ];

  MF.hydration.toMl = function(
    amount,
    unit
  ) {
    const n =
      Math.max(
        0,
        MF.number(amount)
      );

    const multipliers = {
      ml: 1,
      L: 1000,
      cup: 240,
      glass: 250
    };

    return n *
      (multipliers[unit] || 1);
  };

  MF.hydration.add = function(
    amount,
    unit = "ml"
  ) {
    if (!global.state) return;

    if (!Array.isArray(
      global.state.waterLog
    )) {
      global.state.waterLog = [];
    }

    const ml =
      MF.hydration.toMl(
        amount,
        unit
      );

    if (ml <= 0) return;

    global.state.waterLog.push({
      id:
        `water-${Date.now()}`,
      ml,
      amount,
      unit,
      date:
        typeof global.today === "function"
          ? global.today()
          : new Date().toISOString().slice(0, 10)
    });

    if (typeof global.save === "function") {
      global.save();
    }
  };

  /* ================================================================
     SECTION 14 — WORKOUT DATA ENGINE
     ================================================================ */

  MF.workouts = {};

  MF.workouts.newExercise = function(
    name = "New Exercise"
  ) {
    return {
      id:
        `exercise-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      notes: "",
      sets: [
        {
          id:
            `set-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          reps: 10,
          weight: 0,
          completed: false
        }
      ]
    };
  };

  MF.workouts.addExercise = function(
    workout,
    name
  ) {
    if (!workout) return null;

    if (!Array.isArray(
      workout.exercises
    )) {
      workout.exercises = [];
    }

    const exercise =
      MF.workouts.newExercise(
        name
      );

    workout.exercises.push(
      exercise
    );

    return exercise;
  };

  MF.workouts.addSet = function(
    exercise
  ) {
    if (!exercise) return null;

    if (!Array.isArray(
      exercise.sets
    )) {
      exercise.sets = [];
    }

    const last =
      exercise.sets[
        exercise.sets.length - 1
      ];

    const next = {
      id:
        `set-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      reps:
        MF.number(last?.reps, 10),
      weight:
        MF.number(last?.weight, 0),
      completed: false
    };

    exercise.sets.push(
      next
    );

    return next;
  };

  MF.workouts.removeExercise = function(
    workout,
    exerciseId
  ) {
    if (!workout) return;

    workout.exercises =
      (workout.exercises || [])
        .filter(
          exercise =>
            exercise.id !== exerciseId
        );
  };

  MF.workouts.removeSet = function(
    exercise,
    setId
  ) {
    if (!exercise) return;

    exercise.sets =
      (exercise.sets || [])
        .filter(
          set =>
            set.id !== setId
        );
  };

  MF.workouts.volume = function(
    workout
  ) {
    let total = 0;

    for (const exercise of
      workout?.exercises || []) {
      for (const set of
        exercise.sets || []) {
        total +=
          MF.number(set.weight) *
          MF.number(set.reps);
      }
    }

    return total;
  };

  MF.workouts.completedSets = function(
    workout
  ) {
    return (workout?.exercises || [])
      .reduce(
        (total, exercise) =>
          total +
          (exercise.sets || [])
            .filter(set =>
              Boolean(set.completed)
            ).length,
        0
      );
  };

  /* ================================================================
     SECTION 15 — LOCAL ACCOUNT HELPERS
     ================================================================ */

  MF.accounts = {};

  MF.accounts.hash = async function(
    value
  ) {
    if (
      global.crypto?.subtle
    ) {
      const data =
        new TextEncoder().encode(
          String(value)
        );
      const buffer =
        await crypto.subtle.digest(
          "SHA-256",
          data
        );
      return Array.from(
        new Uint8Array(buffer)
      )
        .map(x =>
          x.toString(16).padStart(2, "0")
        )
        .join("");
    }

    /* Non-cryptographic fallback is only for local demo compatibility. */
    let hash = 2166136261;
    for (const char of String(value)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (`00000000${
      (hash >>> 0).toString(16)
    }`).slice(-8);
  };

  MF.accounts.key =
    "macroforge_accounts_v2";

  MF.accounts.sessionKey =
    "macroforge_session_v2";

  MF.accounts.read = function() {
    try {
      return JSON.parse(
        localStorage.getItem(
          MF.accounts.key
        ) || "{}"
      );
    } catch {
      return {};
    }
  };

  MF.accounts.write = function(accounts) {
    localStorage.setItem(
      MF.accounts.key,
      JSON.stringify(accounts)
    );
  };

  MF.accounts.current = function() {
    return localStorage.getItem(
      MF.accounts.sessionKey
    );
  };

  MF.accounts.signOut = function() {
    localStorage.removeItem(
      MF.accounts.sessionKey
    );
  };

  /* ================================================================
     SECTION 16 — FINAL HOOKS
     ================================================================ */

  MF.install = function() {
    /* Replace the legacy global functions with deterministic versions. */
    global.renderFoods = MF.renderFoods;
    global.openFood = MF.openFood;
    global.confirmFood = MF.confirmFood;
    global.mfUpdateFoodNutritionPreview =
      MF.updateModal;
    global.mfCalculatePortion =
      MF.calculate;
    global.searchGlobal = async query =>
      MF.Search.run(query);

    MF.bindSearch();

    const amount =
      document.getElementById(
        "servingAmount"
      );

    const unit =
      document.getElementById(
        "servingUnit"
      );

    if (amount) {
      const cleanAmount =
        amount.cloneNode(true);
      amount.replaceWith(
        cleanAmount
      );
      cleanAmount.addEventListener(
        "input",
        MF.updateModal
      );
      cleanAmount.addEventListener(
        "change",
        MF.updateModal
      );
    }

    if (unit) {
      const cleanUnit =
        unit.cloneNode(true);
      unit.replaceWith(
        cleanUnit
      );
      cleanUnit.addEventListener(
        "change",
        MF.updateModal
      );
    }

    const closeButtons =
      document.querySelectorAll(
        "[data-close-food-modal]"
      );

    closeButtons.forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            if (
              typeof global.modal ===
              "function"
            ) {
              global.modal(
                "foodModal",
                false
              );
            }
          }
        );
      }
    );

    if (typeof global.renderFoods === "function") {
      /* Delay until the original app has finished its bootstrap. */
      setTimeout(
        () => MF.renderFoods(),
        20
      );
    }
  };

  /* ================================================================
     SECTION 17 — DEBUG / DIAGNOSTICS
     ================================================================ */

  MF.diagnostics = function() {
    const foodLog =
      global.state?.foodLog || [];

    const invalid =
      foodLog.filter(
        entry =>
          !MF.validateLogEntry(
            entry
          ).valid
      );

    return {
      localFoods:
        MF.localFoods().length,
      recipes:
        MF.RECIPE_FOODS.length,
      supplements:
        MF.SUPPLEMENTS.length,
      foodLogEntries:
        foodLog.length,
      invalidFoodLogEntries:
        invalid.length,
      searchCacheEntries:
        MF.Search.cache.size,
      searchService:
        "Open Food Facts Search-a-licious + legacy full-text fallback",
      portionEngine:
        "canonical-basis conversion"
    };
  };

  /* ================================================================
     SECTION 18 — TEST CASES FOR THE BUG THAT STARTED THIS
     ================================================================ */

  MF.selfTest = function() {
    const mutton =
      MF.CURATED.find(
        f => f.name === "Mutton Karahi"
      );

    const plate =
      MF.calculate(
        mutton,
        1,
        "plate"
      );

    const hundred =
      MF.calculate(
        mutton,
        100,
        "g"
      );

    const twoPlates =
      MF.calculate(
        mutton,
        2,
        "plate"
      );

    const expectedPlateCalories =
      mutton.cal *
      (mutton.unitWeights.plate / 100);

    const expectedTwoPlateCalories =
      expectedPlateCalories * 2;

    const tests = [
      {
        name: "100g basis",
        pass:
          Math.abs(
            hundred.cal - mutton.cal
          ) < 0.01
      },
      {
        name: "1 plate",
        pass:
          Math.abs(
            plate.cal - expectedPlateCalories
          ) < 0.01
      },
      {
        name: "2 plates",
        pass:
          Math.abs(
            twoPlates.cal - expectedTwoPlateCalories
          ) < 0.01
      },
      {
        name: "plate not 100x error",
        pass:
          plate.cal < 5000
      },
      {
        name: "protein proportional",
        pass:
          plate.p > 0 &&
          plate.p < 100
      }
    ];

    return {
      pass:
        tests.every(t => t.pass),
      tests,
      example: {
        onePlate: plate,
        twoPlates,
        hundredGrams: hundred
      }
    };
  };

  /* ================================================================
     SECTION 19 — HUMAN-READABLE NUTRITION DETAILS
     ================================================================ */

  MF.formatNutrition = function(
    result
  ) {
    return {
      calories:
        `${MF.round(result.cal, 1)} kcal`,
      protein:
        `${MF.round(result.p, 1)} g`,
      carbs:
        `${MF.round(result.c, 1)} g`,
      fat:
        `${MF.round(result.f, 1)} g`,
      fiber:
        `${MF.round(result.fiber, 1)} g`,
      sugar:
        `${MF.round(result.sugar, 1)} g`,
      sodium:
        `${MF.round(result.sodium, 1)} mg`
    };
  };

  MF.foodDetails = function(
    food,
    amount,
    unit
  ) {
    const f =
      MF.normalizeFood(food);
    const result =
      MF.calculate(
        f,
        amount,
        unit
      );

    return {
      food: f,
      input: {
        amount,
        unit
      },
      result,
      formatted:
        MF.formatNutrition(
          result
        ),
      source: f.source,
      basis: {
        amount:
          MF.basisAmount(f),
        unit:
          MF.basisUnit(f)
      },
      equivalentGrams:
        result.equivalentGrams
    };
  };

  /* ================================================================
     SECTION 20 — SEARCH QUERY CLEANING
     ================================================================ */

  MF.cleanQuery = function(value) {
    return String(value || "")
      .replace(/[\u0000-\u001F]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  };

  MF.queryVariants = function(query) {
    const clean =
      MF.cleanQuery(query);
    const normalized =
      MF.normalizeSearch(clean);
    const variants = [clean];

    if (
      normalized !== clean.toLowerCase()
    ) {
      variants.push(
        normalized
      );
    }

    /* Common Pakistani/English spelling normalization. */
    const substitutions = {
      aloo: "potato",
      gosht: "mutton",
      dahi: "yogurt",
      doodh: "milk",
      anda: "egg",
      anday: "eggs",
      chana: "chickpea",
      cholay: "chickpeas",
      daal: "lentil",
      roti: "flatbread",
      lassi: "yogurt drink"
    };

    const translated =
      normalized
        .split(" ")
        .map(
          word =>
            substitutions[word] ||
            word
        )
        .join(" ");

    if (
      translated &&
      translated !== normalized
    ) {
      variants.push(
        translated
      );
    }

    return [
      ...new Set(
        variants.filter(Boolean)
      )
    ];
  };

  /* ================================================================
     SECTION 21 — SEARCH RESULT QUALITY GATES
     ================================================================ */

  MF.qualityGate = function(
    food,
    query
  ) {
    const fields =
      MF.searchFields(
        food.apiProduct || {}
      );

    const q =
      MF.normalizeSearch(
        query
      );

    const names = [
      fields.nameEn,
      fields.name,
      fields.genericEn,
      fields.generic,
      fields.brand
    ].filter(Boolean);

    const nameMatch =
      names.some(
        name =>
          name === q ||
          name.includes(q) ||
          MF.searchTokens(q).every(
            token =>
              name.includes(token)
          )
      );

    if (!nameMatch) {
      return false;
    }

    if (!MF.isFiniteNutrition(food)) {
      return false;
    }

    if (
      food.cal === 0 &&
      food.p === 0 &&
      food.c === 0 &&
      food.f === 0
    ) {
      return false;
    }

    return true;
  };

  /* ================================================================
     SECTION 22 — SEARCH ERROR CLASSIFICATION
     ================================================================ */

  MF.searchErrorMessage = function(error) {
    if (!navigator.onLine) {
      return "You appear to be offline. Local foods still work.";
    }

    if (
      error?.name ===
      "AbortError"
    ) {
      return "Search cancelled for a newer query.";
    }

    return "Global search service is unavailable right now. Try again or use Custom Food.";
  };

  /* ================================================================
     SECTION 23 — API HEALTH SNAPSHOT
     ================================================================ */

  MF.searchHealth = {
    lastRun: null,
    lastSource: null,
    lastError: null,
    lastCount: 0
  };

  const originalRun =
    MF.Search.run.bind(
      MF.Search
    );

  MF.Search.run = async function(query) {
    MF.searchHealth.lastRun =
      new Date().toISOString();
    MF.searchHealth.lastError =
      null;

    try {
      const result =
        await originalRun(
          query
        );

      MF.searchHealth.lastSource =
        result.source;
      MF.searchHealth.lastCount =
        result.foods.length;

      return result;
    } catch (error) {
      MF.searchHealth.lastError =
        error?.message ||
        String(error);
      throw error;
    }
  };

  /* ================================================================
     SECTION 24 — PORTION PRESETS
     ================================================================ */

  MF.portionPresets = {
    gram: amount => ({
      amount,
      unit: "g"
    }),
    halfPlate: () => ({
      amount: 0.5,
      unit: "plate"
    }),
    plate: () => ({
      amount: 1,
      unit: "plate"
    }),
    twoPlates: () => ({
      amount: 2,
      unit: "plate"
    }),
    bowl: () => ({
      amount: 1,
      unit: "bowl"
    }),
    piece: () => ({
      amount: 1,
      unit: "piece"
    }),
    cup: () => ({
      amount: 1,
      unit: "cup"
    }),
    serving: () => ({
      amount: 1,
      unit: "serving"
    })
  };

  /* ================================================================
     SECTION 25 — FOOD LABEL IMPORT
     ================================================================ */

  MF.fromLabel = function(input) {
    const label = input || {};

    return MF.normalizeFood({
      name:
        label.name ||
        "Custom label food",
      roman:
        label.name ||
        "Custom label food",
      category:
        "Custom",
      cal:
        label.calories ??
        label.cal ?? 0,
      p:
        label.protein ??
        label.p ?? 0,
      c:
        label.carbs ??
        label.c ?? 0,
      f:
        label.fat ??
        label.f ?? 0,
      fiber:
        label.fiber ?? 0,
      sugar:
        label.sugar ?? 0,
      sodium:
        label.sodium ?? 0,
      basis:
        MF.BASIS.PER_100G,
      nutritionAmount: 100,
      nutritionUnit: "g",
      defaultUnit:
        label.defaultUnit || "g",
      unitWeights:
        label.unitWeights || {},
      source:
        "User-entered nutrition label",
      sourceType:
        "user-label",
      verified: false
    });
  };

  /* ================================================================
     SECTION 26 — EXPORTABLE DATA MODEL
     ================================================================ */

  MF.exportSnapshot = function() {
    return {
      exportedAt:
        new Date().toISOString(),
      version:
        "MacroForge Final Core 1.0",
      diagnostics:
        MF.diagnostics(),
      state:
        global.state || null
    };
  };

  MF.downloadSnapshot = function() {
    const data =
      JSON.stringify(
        MF.exportSnapshot(),
        null,
        2
      );

    const blob =
      new Blob(
        [data],
        {
          type: "application/json"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");
    a.href = url;
    a.download =
      `macroforge-${
        new Date().toISOString().slice(0, 10)
      }.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  /* ================================================================
     SECTION 27 — DEVELOPMENT ASSERTIONS
     ================================================================ */

  MF.assertions = function() {
    const report =
      MF.selfTest();

    if (!report.pass) {
      console.error(
        "MacroForge portion self-test FAILED",
        report
      );
    }

    return report;
  };

  /* ================================================================
     SECTION 28 — STARTUP
     ================================================================ */

  function start() {
    try {
      MF.install();
      const test =
        MF.assertions();
      console.info(
        "MacroForge Final Core ready",
        {
          linesOfEngine: "modular",
          portionSelfTest: test.pass,
          diagnostics:
            MF.diagnostics()
        }
      );
    } catch (error) {
      console.error(
        "MacroForge Final Core startup failed",
        error
      );
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      { once: true }
    );
  } else {
    start();
  }

})(window);

/*
=====================================================================
REFERENCE NOTES
=====================================================================

The global search layer intentionally does not use Open Food Facts v2
structured search as a plain text search endpoint. The current OFF docs
state that v2 search is filter-based and does not support full-text
search. MacroForge therefore tries Search-a-licious first and retains the
legacy full-text endpoint as a compatibility fallback.

Nutrition data are always labelled with a source. A branded product's
nutrition is not replaced by a generic estimate when the product already
contains its own label data.

For homemade Pakistani dishes, "exact" has a strict meaning: exact for
the cited standardized recipe reference. It does not mean every home
recipe has identical nutrition. The app therefore exposes the source and
portion basis to the user.

The unit engine deliberately separates:

  INPUT UNIT
      plate / bowl / piece / gram / ml / serving

from:

  NUTRITION BASIS
      per 100 g / per 100 ml / per serving / per piece

and converts between them before scaling nutrients.

Example:

  Mutton Karahi = 242.42 kcal / 100 g
  Plate weight  = 300 g

  1 plate = 300 / 100 = 3 nutrition bases
  calories = 242.42 * 3 = 727.26 kcal

  2 plates = 1454.52 kcal

The engine never multiplies 242.42 by 100 simply because the word
"plate" appears in the UI.

For a product that says:

  240 kcal / serving
  serving size = 30 g

one serving is 240 kcal, not 72 kcal and not 24,000 kcal.

For a product that says:

  400 kcal / 100 g

and the user logs 30 g:

  400 * 30 / 100 = 120 kcal.

These are the invariant calculations the rest of MacroForge relies on.
=====================================================================
END FINAL CORE
=====================================================================
*/
