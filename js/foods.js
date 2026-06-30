// German food database with pre-calculated points
// Points formula: max(0, round((kcal/50) + (sugar/5) + (satFat/4) - (protein/7)))

const FOODS_DB = [
  // ── FLEISCH & FISCH ──────────────────────────────────────
  { id:1,  name:'Hähnchenbrust (ohne Haut, gegart)', cat:'Fleisch & Fisch', emoji:'🍗', kcal:165, prot:31,  fat:3.6,  satFat:1.0,  sugar:0,   pts:0, zero:true  },
  { id:2,  name:'Putenbrust (ohne Haut, gegart)',    cat:'Fleisch & Fisch', emoji:'🦃', kcal:147, prot:29,  fat:1.0,  satFat:0.3,  sugar:0,   pts:0, zero:true  },
  { id:3,  name:'Kabeljau / Seelachs (natur)',       cat:'Fleisch & Fisch', emoji:'🐟', kcal:82,  prot:18,  fat:0.7,  satFat:0.1,  sugar:0,   pts:0, zero:true  },
  { id:4,  name:'Thunfisch Dose (in Wasser)',        cat:'Fleisch & Fisch', emoji:'🐟', kcal:116, prot:26,  fat:1.0,  satFat:0.3,  sugar:0,   pts:0, zero:true  },
  { id:5,  name:'Garnelen / Meeresfrüchte (natur)',  cat:'Fleisch & Fisch', emoji:'🦐', kcal:85,  prot:18,  fat:1.0,  satFat:0.2,  sugar:0,   pts:0, zero:true  },
  { id:6,  name:'Tilapia / Zander / Forelle',        cat:'Fleisch & Fisch', emoji:'🐠', kcal:96,  prot:20,  fat:2.0,  satFat:0.7,  sugar:0,   pts:0, zero:true  },
  { id:7,  name:'Ei (gekocht)',                       cat:'Fleisch & Fisch', emoji:'🥚', kcal:155, prot:13,  fat:11,   satFat:3.3,  sugar:1.1, pts:0, zero:true  },
  { id:8,  name:'Kochschinken (max. 2% Fett)',       cat:'Fleisch & Fisch', emoji:'🍖', kcal:107, prot:17,  fat:3.5,  satFat:1.2,  sugar:0.5, pts:1, zero:false },
  { id:9,  name:'Lachs (frisch/TK, natur)',          cat:'Fleisch & Fisch', emoji:'🐟', kcal:208, prot:20,  fat:13,   satFat:3.1,  sugar:0,   pts:3, zero:false },
  { id:10, name:'Rindersteak mager',                  cat:'Fleisch & Fisch', emoji:'🥩', kcal:158, prot:26,  fat:5.5,  satFat:2.3,  sugar:0,   pts:2, zero:false },
  { id:11, name:'Putenhackfleisch (mager)',           cat:'Fleisch & Fisch', emoji:'🍖', kcal:149, prot:20,  fat:7.5,  satFat:2.5,  sugar:0,   pts:2, zero:false },
  { id:12, name:'Rinderhackfleisch (20% Fett)',      cat:'Fleisch & Fisch', emoji:'🍖', kcal:254, prot:17,  fat:20,   satFat:8.5,  sugar:0,   pts:4, zero:false },
  { id:13, name:'Wiener Würstchen',                  cat:'Fleisch & Fisch', emoji:'🌭', kcal:290, prot:11,  fat:26,   satFat:9.5,  sugar:1.0, pts:6, zero:false },
  { id:14, name:'Bratwurst',                         cat:'Fleisch & Fisch', emoji:'🌭', kcal:319, prot:13,  fat:29,   satFat:11,   sugar:0.5, pts:7, zero:false },

  // ── MILCHPRODUKTE ────────────────────────────────────────
  { id:20, name:'Magerquark 0,2% Fett',             cat:'Milchprodukte', emoji:'🥛', kcal:66,  prot:12,  fat:0.2,  satFat:0.1,  sugar:3.4, pts:0, zero:true  },
  { id:21, name:'Joghurt natur 0,1% / 0,3%',        cat:'Milchprodukte', emoji:'🥛', kcal:36,  prot:3.8, fat:0.1,  satFat:0.07, sugar:4.7, pts:0, zero:true  },
  { id:22, name:'Skyr natur 0% Fett',               cat:'Milchprodukte', emoji:'🥛', kcal:57,  prot:11,  fat:0.2,  satFat:0.1,  sugar:4.0, pts:0, zero:true  },
  { id:23, name:'Hüttenkäse (Cottage Cheese)',      cat:'Milchprodukte', emoji:'🧀', kcal:98,  prot:11,  fat:4.3,  satFat:2.7,  sugar:3.4, pts:1, zero:false },
  { id:24, name:'Milch 1,5% Fett',                  cat:'Milchprodukte', emoji:'🥛', kcal:46,  prot:3.3, fat:1.5,  satFat:1.0,  sugar:4.8, pts:1, zero:false },
  { id:25, name:'Joghurt griechisch 2%',            cat:'Milchprodukte', emoji:'🥛', kcal:72,  prot:8.8, fat:1.9,  satFat:1.2,  sugar:4.0, pts:1, zero:false },
  { id:26, name:'Frischkäse light (16% Fett)',      cat:'Milchprodukte', emoji:'🧀', kcal:156, prot:9.0, fat:13,   satFat:8.5,  sugar:3.5, pts:2, zero:false },
  { id:27, name:'Mozzarella light (15% Fett)',      cat:'Milchprodukte', emoji:'🧀', kcal:164, prot:17,  fat:10,   satFat:6.5,  sugar:0.5, pts:2, zero:false },
  { id:28, name:'Joghurt griechisch 10% Fett',      cat:'Milchprodukte', emoji:'🥛', kcal:133, prot:8.9, fat:10,   satFat:6.4,  sugar:3.9, pts:4, zero:false },
  { id:29, name:'Feta (45% Fett)',                  cat:'Milchprodukte', emoji:'🧀', kcal:264, prot:14,  fat:22,   satFat:15,   sugar:0.5, pts:4, zero:false },
  { id:30, name:'Gouda / Edamer 45%',               cat:'Milchprodukte', emoji:'🧀', kcal:356, prot:25,  fat:28,   satFat:18,   sugar:0,   pts:5, zero:false },
  { id:31, name:'Milch 3,5% Fett',                  cat:'Milchprodukte', emoji:'🥛', kcal:64,  prot:3.3, fat:3.5,  satFat:2.2,  sugar:4.8, pts:2, zero:false },
  { id:32, name:'Joghurt mit Früchten 0,1%',        cat:'Milchprodukte', emoji:'🥛', kcal:74,  prot:3.8, fat:0.1,  satFat:0.05, sugar:13,  pts:3, zero:false },
  { id:33, name:'Sahne 30% Fett',                   cat:'Milchprodukte', emoji:'🥛', kcal:292, prot:2.0, fat:30,   satFat:19,   sugar:3.0, pts:8, zero:false },

  // ── GEMÜSE ────────────────────────────────────────────────
  { id:40, name:'Salat (alle Sorten)',               cat:'Gemüse', emoji:'🥗', kcal:15,  prot:1.4, fat:0.2,  satFat:0,    sugar:1.5, pts:0, zero:true  },
  { id:41, name:'Gurke',                             cat:'Gemüse', emoji:'🥒', kcal:12,  prot:0.7, fat:0.1,  satFat:0,    sugar:1.7, pts:0, zero:true  },
  { id:42, name:'Tomate',                            cat:'Gemüse', emoji:'🍅', kcal:18,  prot:0.9, fat:0.2,  satFat:0,    sugar:2.6, pts:0, zero:true  },
  { id:43, name:'Paprika (rot/gelb/grün)',           cat:'Gemüse', emoji:'🫑', kcal:27,  prot:1.0, fat:0.3,  satFat:0,    sugar:4.2, pts:0, zero:true  },
  { id:44, name:'Brokkoli',                          cat:'Gemüse', emoji:'🥦', kcal:34,  prot:2.8, fat:0.4,  satFat:0.1,  sugar:1.7, pts:0, zero:true  },
  { id:45, name:'Blumenkohl',                        cat:'Gemüse', emoji:'🥦', kcal:25,  prot:1.9, fat:0.3,  satFat:0,    sugar:2.3, pts:0, zero:true  },
  { id:46, name:'Zucchini',                          cat:'Gemüse', emoji:'🥒', kcal:17,  prot:1.2, fat:0.3,  satFat:0.1,  sugar:2.5, pts:0, zero:true  },
  { id:47, name:'Aubergine',                         cat:'Gemüse', emoji:'🍆', kcal:25,  prot:1.0, fat:0.2,  satFat:0,    sugar:3.5, pts:0, zero:true  },
  { id:48, name:'Pilze / Champignons',               cat:'Gemüse', emoji:'🍄', kcal:22,  prot:3.1, fat:0.3,  satFat:0.1,  sugar:1.4, pts:0, zero:true  },
  { id:49, name:'Spinat',                            cat:'Gemüse', emoji:'🥬', kcal:23,  prot:2.9, fat:0.4,  satFat:0.1,  sugar:0.4, pts:0, zero:true  },
  { id:50, name:'Möhren',                            cat:'Gemüse', emoji:'🥕', kcal:41,  prot:0.9, fat:0.2,  satFat:0,    sugar:4.7, pts:0, zero:true  },
  { id:51, name:'Spargel (grün & weiß)',             cat:'Gemüse', emoji:'🌿', kcal:20,  prot:2.2, fat:0.1,  satFat:0,    sugar:1.8, pts:0, zero:true  },
  { id:52, name:'Sellerie',                          cat:'Gemüse', emoji:'🥬', kcal:16,  prot:0.7, fat:0.2,  satFat:0,    sugar:1.8, pts:0, zero:true  },
  { id:53, name:'Zwiebeln',                          cat:'Gemüse', emoji:'🧅', kcal:40,  prot:1.1, fat:0.1,  satFat:0,    sugar:4.2, pts:0, zero:true  },
  { id:54, name:'Erbsen (gegart)',                   cat:'Gemüse', emoji:'🟢', kcal:81,  prot:5.4, fat:0.4,  satFat:0.1,  sugar:5.7, pts:1, zero:false },
  { id:55, name:'Mais (Dose)',                       cat:'Gemüse', emoji:'🌽', kcal:86,  prot:3.2, fat:1.3,  satFat:0.2,  sugar:4.0, pts:2, zero:false },
  { id:56, name:'Kartoffeln (gegart)',               cat:'Gemüse', emoji:'🥔', kcal:86,  prot:1.9, fat:0.1,  satFat:0,    sugar:0.8, pts:2, zero:false },
  { id:57, name:'Süßkartoffel (gegart)',             cat:'Gemüse', emoji:'🍠', kcal:90,  prot:2.0, fat:0.1,  satFat:0,    sugar:4.2, pts:2, zero:false },

  // ── OBST ─────────────────────────────────────────────────
  { id:60, name:'Erdbeeren',                         cat:'Obst', emoji:'🍓', kcal:32,  prot:0.7, fat:0.3,  satFat:0,    sugar:4.9, pts:1, zero:false },
  { id:61, name:'Blaubeeren / Heidelbeeren',         cat:'Obst', emoji:'🫐', kcal:57,  prot:0.7, fat:0.3,  satFat:0,    sugar:10,  pts:2, zero:false },
  { id:62, name:'Himbeeren',                         cat:'Obst', emoji:'🍓', kcal:52,  prot:1.2, fat:0.7,  satFat:0,    sugar:4.4, pts:1, zero:false },
  { id:63, name:'Wassermelone',                      cat:'Obst', emoji:'🍉', kcal:30,  prot:0.6, fat:0.2,  satFat:0,    sugar:6.2, pts:1, zero:false },
  { id:64, name:'Apfel',                             cat:'Obst', emoji:'🍎', kcal:52,  prot:0.3, fat:0.2,  satFat:0,    sugar:10,  pts:2, zero:false },
  { id:65, name:'Birne',                             cat:'Obst', emoji:'🍐', kcal:57,  prot:0.4, fat:0.1,  satFat:0,    sugar:9.8, pts:2, zero:false },
  { id:66, name:'Orange / Mandarine',               cat:'Obst', emoji:'🍊', kcal:47,  prot:0.9, fat:0.1,  satFat:0,    sugar:9.4, pts:2, zero:false },
  { id:67, name:'Banane',                            cat:'Obst', emoji:'🍌', kcal:89,  prot:1.1, fat:0.3,  satFat:0.1,  sugar:12,  pts:3, zero:false },
  { id:68, name:'Weintrauben',                       cat:'Obst', emoji:'🍇', kcal:69,  prot:0.7, fat:0.2,  satFat:0,    sugar:15,  pts:3, zero:false },
  { id:69, name:'Mango',                             cat:'Obst', emoji:'🥭', kcal:60,  prot:0.8, fat:0.4,  satFat:0.1,  sugar:13,  pts:2, zero:false },
  { id:70, name:'Trockenfrüchte (Datteln etc.)',    cat:'Obst', emoji:'🍑', kcal:282, prot:2.5, fat:0.4,  satFat:0,    sugar:65,  pts:7, zero:false },

  // ── KOHLENHYDRATE ─────────────────────────────────────────
  { id:80, name:'Haferflocken',                      cat:'Getreide & KH', emoji:'🌾', kcal:370, prot:13,  fat:7.0,  satFat:1.3,  sugar:1.1, pts:6, zero:false },
  { id:81, name:'Vollkornbrot (1 Scheibe ~40g)',    cat:'Getreide & KH', emoji:'🍞', kcal:200, prot:7.0, fat:2.0,  satFat:0.4,  sugar:2.5, pts:3, zero:false },
  { id:82, name:'Weißbrot / Toastbrot (1 Scheibe)', cat:'Getreide & KH', emoji:'🍞', kcal:265, prot:8.9, fat:3.2,  satFat:0.7,  sugar:3.3, pts:4, zero:false },
  { id:83, name:'Brötchen',                          cat:'Getreide & KH', emoji:'🥖', kcal:267, prot:9.1, fat:3.0,  satFat:0.7,  sugar:3.0, pts:4, zero:false },
  { id:84, name:'Vollkornnudeln (gegart)',           cat:'Getreide & KH', emoji:'🍝', kcal:140, prot:5.3, fat:1.1,  satFat:0.2,  sugar:0.5, pts:2, zero:false },
  { id:85, name:'Pasta / Nudeln weiß (gegart)',     cat:'Getreide & KH', emoji:'🍝', kcal:158, prot:5.8, fat:0.9,  satFat:0.2,  sugar:0.6, pts:3, zero:false },
  { id:86, name:'Basmati-Reis / Reis (gegart)',     cat:'Getreide & KH', emoji:'🍚', kcal:130, prot:2.7, fat:0.3,  satFat:0.1,  sugar:0,   pts:3, zero:false },
  { id:87, name:'Quinoa (gegart)',                   cat:'Getreide & KH', emoji:'🌾', kcal:120, prot:4.4, fat:1.9,  satFat:0.2,  sugar:0.9, pts:2, zero:false },
  { id:88, name:'Linsen / Kichererbsen (gegart)',   cat:'Getreide & KH', emoji:'🟤', kcal:116, prot:9.0, fat:0.4,  satFat:0.1,  sugar:1.5, pts:1, zero:false },
  { id:89, name:'Croissant',                         cat:'Getreide & KH', emoji:'🥐', kcal:406, prot:8.2, fat:21,   satFat:12,   sugar:8.0, pts:9, zero:false },
  { id:90, name:'Müsli ohne Zucker',                cat:'Getreide & KH', emoji:'🥣', kcal:350, prot:11,  fat:7.0,  satFat:1.5,  sugar:12,  pts:7, zero:false },

  // ── FETTE & ÖLE ───────────────────────────────────────────
  { id:100, name:'Olivenöl',                         cat:'Fette & Öle', emoji:'🫙', kcal:884, prot:0,   fat:100,  satFat:14,   sugar:0,   pts:14, zero:false },
  { id:101, name:'Butter',                           cat:'Fette & Öle', emoji:'🧈', kcal:717, prot:0.7, fat:81,   satFat:51,   sugar:0.7, pts:22, zero:false },
  { id:102, name:'Avocado',                          cat:'Fette & Öle', emoji:'🥑', kcal:160, prot:2.0, fat:15,   satFat:2.1,  sugar:0.7, pts:3, zero:false },
  { id:103, name:'Nüsse gemischt',                  cat:'Fette & Öle', emoji:'🥜', kcal:607, prot:18,  fat:54,   satFat:7.2,  sugar:4.4, pts:10, zero:false },
  { id:104, name:'Erdnussbutter (natur)',            cat:'Fette & Öle', emoji:'🥜', kcal:588, prot:25,  fat:50,   satFat:8.5,  sugar:4.0, pts:9,  zero:false },

  // ── SAUCEN & DIPS ──────────────────────────────────────────
  { id:110, name:'Senf (alle Sorten)',               cat:'Saucen & Dips', emoji:'🟡', kcal:70,  prot:4.4, fat:3.3,  satFat:0.2,  sugar:3.0, pts:0, zero:true  },
  { id:111, name:'Tabasco / Chilisauce',             cat:'Saucen & Dips', emoji:'🌶️', kcal:12,  prot:0.7, fat:0.2,  satFat:0,    sugar:0.7, pts:0, zero:true  },
  { id:112, name:'Joghurt-Dressing (0,1% Basis)',   cat:'Saucen & Dips', emoji:'🫙', kcal:30,  prot:2.5, fat:0.2,  satFat:0.1,  sugar:3.0, pts:0, zero:true  },
  { id:113, name:'Ketchup',                          cat:'Saucen & Dips', emoji:'🍅', kcal:112, prot:1.6, fat:0.1,  satFat:0,    sugar:22,  pts:5, zero:false },
  { id:114, name:'Mayonnaise',                       cat:'Saucen & Dips', emoji:'🫙', kcal:680, prot:1.3, fat:75,   satFat:6.0,  sugar:1.0, pts:14, zero:false },
  { id:115, name:'Tzatziki',                         cat:'Saucen & Dips', emoji:'🥒', kcal:79,  prot:4.5, fat:5.5,  satFat:3.5,  sugar:2.0, pts:2, zero:false },
  { id:116, name:'Hummus',                           cat:'Saucen & Dips', emoji:'🫙', kcal:177, prot:8.0, fat:10,   satFat:1.0,  sugar:1.6, pts:3, zero:false },

  // ── SÜSSES & SNACKS ────────────────────────────────────────
  { id:120, name:'Schokolade dunkel 85%+',          cat:'Süßes & Snacks', emoji:'🍫', kcal:600, prot:9.0, fat:50,   satFat:30,   sugar:14,  pts:10, zero:false },
  { id:121, name:'Schokolade Milch',                 cat:'Süßes & Snacks', emoji:'🍫', kcal:535, prot:7.7, fat:30,   satFat:18,   sugar:57,  pts:14, zero:false },
  { id:122, name:'Chips',                            cat:'Süßes & Snacks', emoji:'🥔', kcal:536, prot:6.6, fat:34,   satFat:3.5,  sugar:0.5, pts:10, zero:false },
  { id:123, name:'Gummibärchen',                     cat:'Süßes & Snacks', emoji:'🍬', kcal:343, prot:6.9, fat:0.5,  satFat:0.1,  sugar:46,  pts:15, zero:false },
  { id:124, name:'Protein-Riegel (>15g Protein)',   cat:'Süßes & Snacks', emoji:'💪', kcal:380, prot:30,  fat:10,   satFat:3.0,  sugar:18,  pts:5,  zero:false },
  { id:125, name:'Eis am Stiel / Sorbet',           cat:'Süßes & Snacks', emoji:'🍦', kcal:120, prot:0.5, fat:0.1,  satFat:0.1,  sugar:28,  pts:6,  zero:false },
  { id:126, name:'Kekse / Gebäck',                  cat:'Süßes & Snacks', emoji:'🍪', kcal:480, prot:6.0, fat:20,   satFat:10,   sugar:38,  pts:12, zero:false },

  // ── GETRÄNKE ──────────────────────────────────────────────
  { id:130, name:'Wasser / Mineralwasser',           cat:'Getränke', emoji:'💧', kcal:0,   prot:0,   fat:0,    satFat:0,    sugar:0,   pts:0, zero:true  },
  { id:131, name:'Kaffee schwarz (ohne Zucker)',     cat:'Getränke', emoji:'☕', kcal:2,   prot:0.2, fat:0,    satFat:0,    sugar:0,   pts:0, zero:true  },
  { id:132, name:'Tee ungesüßt',                     cat:'Getränke', emoji:'🍵', kcal:1,   prot:0,   fat:0,    satFat:0,    sugar:0,   pts:0, zero:true  },
  { id:133, name:'Cola Zero / Light',                cat:'Getränke', emoji:'🥤', kcal:0,   prot:0,   fat:0,    satFat:0,    sugar:0,   pts:0, zero:true  },
  { id:134, name:'Orangensaft (frisch)',             cat:'Getränke', emoji:'🍊', kcal:45,  prot:0.7, fat:0.2,  satFat:0,    sugar:8.4, pts:2, zero:false },
  { id:135, name:'Cola / Limonade',                  cat:'Getränke', emoji:'🥤', kcal:42,  prot:0,   fat:0,    satFat:0,    sugar:11,  pts:2, zero:false },
  { id:136, name:'Wein (trocken)',                   cat:'Getränke', emoji:'🍷', kcal:85,  prot:0.1, fat:0,    satFat:0,    sugar:2.6, pts:3, zero:false },
  { id:137, name:'Bier',                             cat:'Getränke', emoji:'🍺', kcal:43,  prot:0.5, fat:0,    satFat:0,    sugar:3.6, pts:2, zero:false },
  { id:138, name:'Milchkaffee / Latte (mit 150ml Milch 1,5%)', cat:'Getränke', emoji:'☕', kcal:46, prot:3.3, fat:1.5, satFat:1.0, sugar:4.8, pts:1, zero:false },

  // ── FAST FOOD ─────────────────────────────────────────────
  { id:140, name:'Pizza Margherita',                 cat:'Fast Food', emoji:'🍕', kcal:266, prot:11,  fat:8.0,  satFat:3.8,  sugar:2.6, pts:5,  zero:false },
  { id:141, name:'Döner (ohne viel Soße)',           cat:'Fast Food', emoji:'🥙', kcal:330, prot:22,  fat:17,   satFat:6.5,  sugar:2.5, pts:5,  zero:false },
  { id:142, name:'Burger / Cheeseburger',           cat:'Fast Food', emoji:'🍔', kcal:300, prot:16,  fat:15,   satFat:6.0,  sugar:6.0, pts:6,  zero:false },
  { id:143, name:'Pommes frites',                    cat:'Fast Food', emoji:'🍟', kcal:312, prot:3.4, fat:15,   satFat:2.6,  sugar:0.3, pts:7,  zero:false },
  { id:144, name:'Sushi (Maki-Rolle, pro Stück)',   cat:'Fast Food', emoji:'🍣', kcal:40,  prot:1.8, fat:0.5,  satFat:0.1,  sugar:1.5, pts:1,  zero:false },
  { id:145, name:'Sashimi (pro Stück)',              cat:'Fast Food', emoji:'🐟', kcal:35,  prot:5.0, fat:1.0,  satFat:0.3,  sugar:0,   pts:0,  zero:true  },
];

function calcPoints(kcal, prot, satFat, sugar) {
  const raw = (kcal / 50) + (sugar / 5) + (satFat / 4) - (prot / 7);
  return Math.max(0, Math.round(raw));
}

function calcPointsForAmount(food, grams) {
  const factor = grams / 100;
  return Math.max(0, Math.round(
    ((food.kcal * factor) / 50) +
    ((food.sugar * factor) / 5) +
    ((food.satFat * factor) / 4) -
    ((food.prot * factor) / 7)
  ));
}

function searchFoods(query) {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();
  return FOODS_DB.filter(f =>
    f.name.toLowerCase().includes(q) || f.cat.toLowerCase().includes(q)
  ).slice(0, 12);
}

const ACTIVITIES = [
  { id:'walk',      name:'Spaziergang',          emoji:'🚶', kcalPerMin: 3.5 },
  { id:'jog',       name:'Joggen (leicht)',       emoji:'🏃', kcalPerMin: 7.0 },
  { id:'gym',       name:'Gym / Krafttraining',  emoji:'💪', kcalPerMin: 6.0 },
  { id:'bike',      name:'Radfahren',             emoji:'🚴', kcalPerMin: 5.5 },
  { id:'swim',      name:'Schwimmen',             emoji:'🏊', kcalPerMin: 8.0 },
  { id:'yoga',      name:'Yoga / Stretching',    emoji:'🧘', kcalPerMin: 2.5 },
  { id:'nordic',    name:'Nordic Walking',        emoji:'🌲', kcalPerMin: 5.0 },
  { id:'dance',     name:'Tanzen',                emoji:'💃', kcalPerMin: 5.5 },
  { id:'housework', name:'Hausarbeit',            emoji:'🏠', kcalPerMin: 2.8 },
  { id:'stairs',    name:'Treppensteigen',        emoji:'🪜', kcalPerMin: 8.0 },
];
