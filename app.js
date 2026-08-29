const foods = [
["Biryani","Biryani","Pakistani",200,7,24,8,2,"plate"],["Chicken Karahi","Chicken Karahi","Pakistani",185,16,5,11,1,"plate"],["Mutton Karahi","Mutton Karahi","Pakistani",240,16,5,17,1,"plate"],["Beef Karahi","Beef Karahi","Pakistani",225,18,4,15,1,"plate"],["Chicken Handi","Chicken Handi","Pakistani",190,15,7,11,1,"plate"],["Nihari","Nihari","Pakistani",210,13,7,14,1,"bowl"],["Haleem","Haleem","Pakistani",155,9,18,5,4,"bowl"],["Pulao","Pulao","Pakistani",170,4,30,4,1,"plate"],["Aloo Gosht","Aloo Gosht","Pakistani",160,10,10,9,2,"plate"],["Qeema","Qeema","Pakistani",205,17,4,14,1,"plate"],["Lentil Curry","Daal","Pakistani",120,7,18,2,6,"bowl"],["Chickpea Curry","Chana","Pakistani",150,7,22,4,6,"bowl"],["Kidney Bean Curry","Rajma","Pakistani",140,8,23,2,7,"bowl"],["Mustard Greens","Saag","Pakistani",95,4,7,5,4,"bowl"],["Meatball Curry","Kofta","Pakistani",220,13,7,15,1,"plate"],["Chicken Korma","Chicken Korma","Pakistani",210,14,6,14,1,"plate"],["Mutton Korma","Mutton Korma","Pakistani",255,15,6,18,1,"plate"],["Lentils with Rice","Daal Chawal","Pakistani",175,6,29,4,4,"plate"],["Rice & Lentil Porridge","Khichri","Pakistani",135,5,24,3,3,"bowl"],["Spiced Chickpeas","Cholay","Pakistani",150,7,22,4,7,"bowl"],
["Chicken Tikka","Chicken Tikka","BBQ",165,26,2,6,0,"piece"],["Seekh Kebab","Seekh Kebab","BBQ",250,19,5,17,0,"piece"],["Shami Kebab","Shami Kebab","BBQ",220,13,10,14,3,"piece"],["Chapli Kebab","Chapli Kebab","BBQ",270,17,6,20,1,"piece"],["Reshmi Kebab","Reshmi Kebab","BBQ",235,20,4,15,0,"piece"],["Malai Boti","Malai Boti","BBQ",225,21,4,14,0,"piece"],["Bihari Boti","Bihari Boti","BBQ",210,23,3,12,0,"piece"],["Chicken Boti","Chicken Boti","BBQ",170,25,2,7,0,"piece"],["Tandoori Chicken","Tandoori Chicken","BBQ",190,26,2,8,0,"piece"],["BBQ Wings","BBQ Wings","BBQ",250,22,7,16,0,"piece"],
["Roti","Roti","Bread",120,4,24,1.5,3,"piece"],["Naan","Naan","Bread",260,9,50,4,2,"piece"],["Garlic Naan","Lehsan Naan","Bread",290,9,48,7,2,"piece"],["Roghni Naan","Roghni Naan","Bread",300,9,49,8,2,"piece"],["Paratha","Paratha","Bread",320,7,36,16,2,"piece"],["Aloo Paratha","Aloo Paratha","Bread",260,6,35,10,3,"piece"],["Qeema Paratha","Qeema Paratha","Bread",330,14,34,16,2,"piece"],["Puri","Puri","Bread",270,5,31,14,2,"piece"],["Kulcha","Kulcha","Bread",240,8,42,4,2,"piece"],
["Samosa","Samosa","Snacks",260,5,25,15,2,"piece"],["Pakora","Pakora","Snacks",280,6,25,17,3,"piece"],["Spring Roll","Spring Roll","Snacks",210,5,22,11,2,"piece"],["Chaat","Chaat","Snacks",145,5,24,4,5,"plate"],["Yogurt Dumplings","Dahi Bhallay","Snacks",150,6,20,5,3,"plate"],["Gol Gappay","Gol Gappay","Snacks",180,4,28,6,2,"plate"],["Bun Kebab","Bun Kebab","Snacks",340,15,38,15,3,"piece"],["Potato Patty","Aloo Tikki","Snacks",180,4,28,6,3,"piece"],["Papri Chaat","Papri Chaat","Snacks",200,6,28,7,3,"plate"],["Chicken Shawarma","Chicken Shawarma","Snacks",450,27,45,18,4,"wrap"],["Fries","Fries","Snacks",312,3.4,41,15,3.8,"100g"],
["Kheer","Kheer","Desserts",170,4,25,6,0,"bowl"],["Gulab Jamun","Gulab Jamun","Desserts",320,4,50,12,0,"piece"],["Jalebi","Jalebi","Desserts",380,1,68,12,0,"piece"],["Carrot Halwa","Gajar ka Halwa","Desserts",180,4,27,7,2,"bowl"],["Semolina Halwa","Suji ka Halwa","Desserts",260,4,38,11,1,"bowl"],["Ras Malai","Ras Malai","Desserts",180,6,22,8,0,"piece"],["Barfi","Barfi","Desserts",360,8,48,16,1,"piece"],["Sweet Rice","Zarda","Desserts",190,3,36,4,1,"bowl"],["Rice Pudding","Firni","Desserts",155,4,23,5,0,"bowl"],["Kulfi","Kulfi","Desserts",220,6,25,10,0,"piece"],
["Milk Tea","Doodh Patti","Drinks",85,3,10,3,0,"cup"],["Kashmiri Tea","Kashmiri Chai","Drinks",95,3,11,4,0,"cup"],["Yogurt Drink","Lassi","Drinks",95,4,9,4,0,"250ml"],["Mango Yogurt Drink","Aam ki Lassi","Drinks",125,4,21,3,1,"250ml"],["Rose Drink","Rooh Afza","Drinks",80,0,20,0,0,"250ml"],["Sugarcane Juice","Gannay ka Ras","Drinks",110,0,27,0,0,"250ml"],["Lemonade","Shikanjabeen","Drinks",70,0,18,0,0,"250ml"],["Falooda","Falooda","Drinks",220,5,34,7,1,"glass"],["Milk Soda","Doodh Soda","Drinks",100,3,12,4,0,"250ml"],["Green Tea","Kehwa","Drinks",2,0,0,0,0,"cup"],
["Halwa Puri","Halwa Puri","Breakfast",420,9,58,17,3,"plate"],["Chana Puri","Chana Puri","Breakfast",360,12,50,13,7,"plate"],["Egg Paratha","Anda Paratha","Breakfast",380,14,35,20,2,"piece"],["Omelette","Omelette","Breakfast",155,11,2,11,0,"2 eggs"],["Fried Egg","Tala Hua Anda","Breakfast",196,13,1,15,0,"2 eggs"],["Boiled Egg","Ublay Huay Anday","Breakfast",155,13,1,11,0,"2 eggs"],["Chana","Chana","Breakfast",150,7,22,4,7,"bowl"],["Nihari","Nihari","Breakfast",210,13,7,14,0,"bowl"],["Aloo Paratha","Aloo Paratha","Breakfast",260,6,35,10,3,"piece"],["Qeema Paratha","Qeema Paratha","Breakfast",330,14,34,16,2,"piece"],
["White Rice","Safed Chawal","Staple",130,2.7,28,0.3,0.4,"100g"],["Chicken Breast","Chicken Breast","Staple",165,31,0,3.6,0,"100g"],["Whole Milk","Doodh","Staple",61,3.2,4.8,3.3,0,"100ml"],["Banana","Kela","Staple",89,1.1,23,0.3,2.6,"piece"],["Apple","Seb","Staple",52,0.3,14,0.2,2.4,"piece"],["Oats","Jai ke Daliya/Oats","Staple",389,16.9,66,6.9,10.6,"100g"],["Peanut Butter","Moongphali ka Makhan","Staple",588,25,20,50,6,"100g"]
];


/* V15 expanded Pakistani + English + gym food library.
   Values are reference estimates per stated basis; packaged supplements must be checked against the user's product label. */
const MF_V15_EXPANDED = [
["Raita","Raita","Pakistani",70,4,6,3,0,"bowl"],["Dahi","Plain Yogurt / Dahi","Pakistani",61,3.5,4.7,3.3,0,"100g"],
["Dahi + Fruit","Dahi Fruit Bowl","Breakfast",105,4.5,12,4,1.2,"bowl"],["Chana Chaat","Chana Chaat","Snacks",165,7,24,4,6,"plate"],
["Chicken Pulao","Chicken Pulao","Pakistani",185,11,27,5,1,"plate"],["Beef Pulao","Beef Pulao","Pakistani",205,12,26,7,1,"plate"],
["Daal Makhni","Daal Makhni","Pakistani",170,7,19,7,5,"bowl"],["Moong Daal","Moong Daal","Pakistani",105,7,16,1,5,"bowl"],
["Masoor Daal","Masoor Daal","Pakistani",116,8,20,1,7,"bowl"],["Chicken Jalfrezi","Chicken Jalfrezi","Pakistani",145,18,7,5,2,"plate"],
["Chicken Achari","Chicken Achari","Pakistani",190,19,4,10,1,"plate"],["Beef Qeema","Beef Qeema","Pakistani",220,18,4,15,1,"plate"],
["Mutton Qeema","Mutton Qeema","Pakistani",245,17,4,18,1,"plate"],["Dum Pukht","Dum Pukht","Pakistani",220,18,5,14,1,"plate"],
["Chicken Seekh Kebab","Chicken Seekh Kebab","BBQ",190,23,4,9,0,"piece"],["Beef Seekh Kebab","Beef Seekh Kebab","BBQ",245,20,4,16,0,"piece"],
["Beef Burger","Beef Burger","English / Fast Food",250,16,20,12,1,"100g"],["Chicken Burger","Chicken Burger","English / Fast Food",210,18,18,8,1,"100g"],
["Beef Patty","Beef Patty","English / Fast Food",250,26,0,15,0,"100g"],["Chicken Patty","Chicken Patty","English / Fast Food",190,18,8,9,0,"100g"],
["Scrambled Eggs","Scrambled Eggs","Breakfast",148,10,2,11,0,"2 eggs"],["Greek Yogurt","Greek Yogurt","Breakfast",73,10,3.9,2,0,"100g"],
["Whole Wheat Bread","Whole Wheat Bread","Bread",247,13,41,4.2,6.8,"100g"],["White Bread","White Bread","Bread",266,8.9,49,3.2,2.7,"100g"],
["Pasta, cooked","Pasta","English",157,5.8,30.9,0.9,1.8,"100g"],["Spaghetti Bolognese","Spaghetti Bolognese","English",155,8,20,5,2,"plate"],
["Chicken Sandwich","Chicken Sandwich","English",330,25,31,11,2,"sandwich"],["Tuna Sandwich","Tuna Sandwich","English",290,25,28,9,2,"sandwich"],
["Peanut Butter Sandwich","Peanut Butter Sandwich","English",390,15,40,19,4,"sandwich"],["French Toast","French Toast","Breakfast",220,10,28,8,2,"2 slices"],
["Pancakes","Pancakes","Breakfast",227,6,28,9,1,"3 pieces"],["Cereal with Milk","Cereal with Milk","Breakfast",220,9,35,5,3,"bowl"],
["Tuna","Tuna, canned in water","Staple",116,26,0,0.8,0,"100g"],["Salmon","Salmon, cooked","Staple",206,22,0,12,0,"100g"],
["Potato, boiled","Aloo Boiled","Staple",87,1.9,20.1,0.1,1.8,"100g"],["Sweet Potato","Shakarkandi","Staple",86,1.6,20.1,0.1,3,"100g"],
["Dates","Khajoor","Staple",282,2.5,75,0.4,8,"100g"],["Orange","Malta / Orange","Fruit",47,0.9,11.8,0.1,2.4,"piece"],
["Mango","Aam","Fruit",60,0.8,15,0.4,1.6,"piece"],["Guava","Amrood","Fruit",68,2.6,14.3,1,5.4,"piece"],
["Almonds","Badam","Nuts",579,21,22,50,12.5,"100g"],["Walnuts","Akhrot","Nuts",654,15,14,65,6.7,"100g"],
["Chickpeas, boiled","Cholay Boiled","Staple",164,8.9,27.4,2.6,7.6,"100g"],["Kidney Beans, boiled","Rajma Boiled","Staple",127,8.7,22.8,0.5,6.4,"100g"],
["Milk, low fat","Doodh Low Fat","Staple",42,3.4,5,1,0,"100ml"],["Lassi, unsweetened","Lassi Unsweetened","Drinks",55,3.5,4.5,2.5,0,"250ml"],
["Whey Protein — Chocolate","Whey Protein Chocolate","Gym Supplements",380,75,9,6,0,"100g"],["Whey Protein — Vanilla","Whey Protein Vanilla","Gym Supplements",380,75,9,6,0,"100g"],
["Whey Protein — Strawberry","Whey Protein Strawberry","Gym Supplements",380,75,9,6,0,"100g"],["Whey Protein — Cookies & Cream","Whey Protein Cookies & Cream","Gym Supplements",390,74,10,7,0,"100g"],
["Whey Protein — Unflavored","Whey Protein Unflavored","Gym Supplements",370,80,6,4,0,"100g"],
["Mass Gainer — Chocolate","Mass Gainer Chocolate","Gym Supplements",380,20,70,5,2,"100g"],["Mass Gainer — Vanilla","Mass Gainer Vanilla","Gym Supplements",380,20,70,5,2,"100g"],
["Mass Gainer — Strawberry","Mass Gainer Strawberry","Gym Supplements",380,20,70,5,2,"100g"],["Mass Gainer — Cookies & Cream","Mass Gainer Cookies & Cream","Gym Supplements",390,20,68,7,2,"100g"],
["Mass Gainer — Banana","Mass Gainer Banana","Gym Supplements",380,20,70,5,2,"100g"],["Casein Protein — Chocolate","Casein Chocolate","Gym Supplements",370,75,10,3,0,"100g"],
["Casein Protein — Vanilla","Casein Vanilla","Gym Supplements",370,75,10,3,0,"100g"]
];

const MF_DEFAULT_WEIGHTS = {plate:300,bowl:250,piece:50,slice:30,scoop:30,wrap:180,cup:240,glass:300,serving:100,tbsp:15,tsp:5,packet:50,bottle:500};
const MF_SPECIAL_WEIGHTS = {
  "Biryani":300,"Chicken Karahi":300,"Mutton Karahi":300,"Beef Karahi":300,"Chicken Handi":300,"Nihari":300,"Haleem":250,"Pulao":300,"Aloo Gosht":300,"Qeema":250,"Lentil Curry":250,"Chickpea Curry":250,"Kidney Bean Curry":250,"Mustard Greens":250,"Meatball Curry":300,"Chicken Korma":300,"Mutton Korma":300,"Lentils with Rice":300,"Rice & Lentil Porridge":250,"Spiced Chickpeas":250,"Halwa Puri":300,"Chana Puri":300,"Omelette":100,"Fried Egg":100,"Boiled Egg":100
};
function mfLocalRecord(t){
  const [name,roman,category,cal,p,c,f,fiber,rawUnit]=t;
  let nutritionUnit=rawUnit,nutritionAmount=1,portionGrams=MF_SPECIAL_WEIGHTS[name]||MF_DEFAULT_WEIGHTS[rawUnit]||100,portionMl=null;
  if(rawUnit==="100g"){nutritionUnit="g";nutritionAmount=100;portionGrams=1;}
  else if(rawUnit==="100ml"){nutritionUnit="ml";nutritionAmount=100;portionMl=100;portionGrams=100;}
  else if(rawUnit==="250ml"){nutritionUnit="ml";nutritionAmount=250;portionMl=250;portionGrams=250;}
  else if(rawUnit==="2 eggs"){nutritionUnit="piece";nutritionAmount=2;portionGrams=100;}
  return {name,roman,category,cal:+cal||0,p:+p||0,c:+c||0,f:+f||0,fiber:+fiber||0,baseUnit:nutritionUnit,nutritionUnit,nutritionAmount,portionGrams,portionMl,source:"MacroForge curated reference"};
}
const MF_CURATED_OVERRIDES={
  "Mutton Karahi":{cal:242.42,p:9.02,c:5.81,f:20.35,fiber:0,portionGrams:1, nutritionUnit:"g", nutritionAmount:100, baseUnit:"g", defaultUnit:"plate",source:"University of Agriculture Peshawar study (2019)"},
  "Aloo Gosht":{cal:199.34,p:4.76,c:10.80,f:15.23,fiber:0,portionGrams:1, nutritionUnit:"g", nutritionAmount:100, baseUnit:"g", defaultUnit:"plate",source:"University of Agriculture Peshawar study (2019)"},
  "Chicken Karahi":{cal:240.51,p:13.37,c:11.09,f:15.85,fiber:0,portionGrams:1, nutritionUnit:"g", nutritionAmount:100, baseUnit:"g", defaultUnit:"plate",source:"University of Agriculture Peshawar study (2019)"},
  "Biryani":{cal:160.22,p:6.43,c:21.85,f:5.23,fiber:0,portionGrams:1, nutritionUnit:"g", nutritionAmount:100, baseUnit:"g", defaultUnit:"plate",source:"University of Agriculture Peshawar study (2019)"},
  "Haleem":{cal:128.34,p:5.38,c:14.60,f:5.38,fiber:0,portionGrams:1, nutritionUnit:"g", nutritionAmount:100, baseUnit:"g", defaultUnit:"plate",source:"University of Agriculture Peshawar study (2019)"}
};
const MF_EXTRA_GYM_FOODS=[
{name:"Aloo (boiled)",roman:"Aloo",category:"Gym Staples",cal:87,p:1.87,c:20.13,f:.10,fiber:1.8,baseUnit:"g",nutritionUnit:"g",nutritionAmount:100,portionGrams:1, nutritionUnit:"g", nutritionAmount:100, baseUnit:"g", defaultUnit:"plate",source:"USDA reference"},
{name:"Gosht — Mutton, cooked",roman:"Gosht",category:"Gym Staples",cal:258,p:24,c:0,f:17.9,fiber:0,baseUnit:"g",nutritionUnit:"g",nutritionAmount:100,portionGrams:1,source:"USDA-style reference"},
{name:"Aloo Gosht — Mutton & Potato Curry",roman:"Aloo Gosht",category:"Pakistani",cal:199.34,p:4.76,c:10.8,f:15.23,fiber:0,baseUnit:"g",nutritionUnit:"g",nutritionAmount:100,portionGrams:1,source:"University of Agriculture Peshawar study (2019)"},
{name:"Whey Protein Isolate — generic reference",roman:"Whey Protein",category:"Gym Supplements",cal:359,p:58.14,c:29.07,f:1.16,fiber:0,baseUnit:"g",nutritionUnit:"g",nutritionAmount:100,portionGrams:1,source:"USDA FoodData Central reference"},
{name:"Whey Protein Powder — generic reference",roman:"Whey Protein",category:"Gym Supplements",cal:359,p:58.14,c:29.07,f:1.16,fiber:0,baseUnit:"g",nutritionUnit:"g",nutritionAmount:100,portionGrams:1,source:"USDA FoodData Central reference"},
{name:"Creatine Monohydrate",roman:"Creatine Monohydrate",category:"Gym Supplements",cal:0,p:0,c:0,f:0,fiber:0,baseUnit:"g",nutritionUnit:"g",nutritionAmount:5,portionGrams:1,source:"Myprotein Pakistan label — 5g serving"},
{name:"Creatine Hydrochloride (HCl)",roman:"Creatine HCl",category:"Gym Supplements",cal:0,p:0,c:0,f:0,fiber:0,baseUnit:"g",nutritionUnit:"g",nutritionAmount:5,portionGrams:1,source:"Pure creatine reference; verify product label"},
{name:"Protein Shake — whey isolate + water",roman:"Protein Shake",category:"Gym Supplements",cal:107.7,p:17.44,c:8.72,f:.35,fiber:0,baseUnit:"serving",nutritionUnit:"serving",nutritionAmount:1,portionGrams:30,source:"Calculated from USDA whey isolate reference; water adds 0 kcal"},
{name:"Mass Gainer — generic reference",roman:"Mass Gainer",category:"Gym Supplements",cal:380,p:20,c:70,f:5,fiber:2,baseUnit:"g",nutritionUnit:"g",nutritionAmount:100,portionGrams:1,source:"Generic reference — use product label for exact values"}
];
const MF_LOCAL_RECORDS=[...foods,...MF_V15_EXPANDED].map(mfLocalRecord).map(food=>MF_CURATED_OVERRIDES[food.name]?{...food,...MF_CURATED_OVERRIDES[food.name]}:food);

let state = JSON.parse(localStorage.getItem("macroforge_state") || "null") || {
  goals:{cal:2500,protein:150,carbs:300,fat:75,water:2500},
  foodLog:[], waterLog:[], customFoods:[], weights:[], workouts:[]
};
let selectedFood = null;
let currentFilter = "all";
window.MacroForgeFilter = "all";
window.state=state; window.selectedFood=selectedFood; window.save=save; window.today=today; window.updateDashboard=updateDashboard; window.renderFoods=renderFoods; window.openFood=openFood; window.confirmFood=confirmFood; window.modal=modal; window.mfCalculatePortion=mfCalculatePortion; window.toast=toast;

function save(){localStorage.setItem("macroforge_state",JSON.stringify(state));}
function today(){return new Date().toISOString().slice(0,10)}
function sumFood(){return state.foodLog.filter(x=>x.date===today()).reduce((a,x)=>({cal:a.cal+x.cal,p:a.p+x.p,c:a.c+x.c,f:a.f+x.f}),{cal:0,p:0,c:0,f:0})}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}
function go(page){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===page));document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===page));document.getElementById("pageTitle").textContent=page[0].toUpperCase()+page.slice(1);document.querySelector(".sidebar").classList.remove("open");if(page==="food")renderFoods();if(page==="workouts")renderWorkouts();if(page==="progress")renderProgress();window.scrollTo({top:0,behavior:"smooth"})}
function modal(id,open=true){document.getElementById(id).classList.toggle("open",open)}
function pct(x,g){return Math.min(100,Math.max(0,(x/g)*100))}
function updateDashboard(){
  const s=sumFood(), g=state.goals;
  [["dashCalories",Math.round(s.cal)+" kcal"],["dashProtein",Math.round(s.p)+"g"],["dashCarbs",Math.round(s.c)+"g"],["dashFat",Math.round(s.f)+"g"]].forEach(([id,v])=>document.getElementById(id).textContent=v);
  document.getElementById("heroCalories").textContent=Math.round(s.cal);document.getElementById("heroCalGoal").textContent=g.cal;
  const proteinGoal=document.getElementById("dashProteinGoal"); if(proteinGoal)proteinGoal.textContent=Math.round(g.protein)+"g";
  const carbsGoal=document.getElementById("dashCarbsGoal"); if(carbsGoal)carbsGoal.textContent=Math.round(g.carbs)+"g";
  const fatGoal=document.getElementById("dashFatGoal"); if(fatGoal)fatGoal.textContent=Math.round(g.fat)+"g";
  [["calBar",s.cal,g.cal],["proteinBar",s.p,g.protein],["carbBar",s.c,g.carbs],["fatBar",s.f,g.fat]].forEach(([id,v,t])=>document.getElementById(id).style.width=pct(v,t)+"%");
  const water=state.waterLog.filter(x=>x.date===today()).reduce((a,x)=>a+x.ml,0);
  document.getElementById("dashWater").textContent=water;document.getElementById("waterGoal").textContent=g.water;document.getElementById("waterBar").style.width=pct(water,g.water)+"%";
  const list=document.getElementById("todayFood");const items=state.foodLog.filter(x=>x.date===today()).slice(-8).reverse();
  list.classList.toggle("empty",!items.length);list.innerHTML=items.length?items.map(x=>`<div class="food-row"><div><b>${esc(x.name)}</b><small>${x.amount} ${x.unit}</small></div><div class="food-macros">${Math.round(x.cal)} kcal<br>P ${x.p.toFixed(1)} · C ${x.c.toFixed(1)} · F ${x.f.toFixed(1)}</div></div>`).join(""):"Nothing logged yet. Forge your first meal.";
  document.getElementById("hydrationTotal").textContent=water;document.getElementById("hydrationBar").style.width=pct(water,g.water)+"%";document.getElementById("hydrationPercent").textContent=Math.round(pct(water,g.water))+"%";document.getElementById("hydrationGoalText").textContent=g.water+" ml";
}
function renderFoods(){
  const q=document.getElementById("foodSearch").value.trim().toLowerCase();
  currentFilter = window.MacroForgeFilter || currentFilter || "all";
  let local=MF_LOCAL_RECORDS.filter(f=>(currentFilter==="all"||f.category===currentFilter)&&(!q||f.name.toLowerCase().includes(q)||f.roman.toLowerCase().includes(q)));
  let extras=MF_EXTRA_GYM_FOODS.filter(f=>(currentFilter==="all"||f.category===currentFilter)&&(!q||f.name.toLowerCase().includes(q)||f.roman.toLowerCase().includes(q)));
  let custom=state.customFoods.filter(f=>(currentFilter==="all"||f.category===currentFilter)&&(!q||f.name.toLowerCase().includes(q)||f.roman.toLowerCase().includes(q)));
  const all=[...local,...extras,...custom];
  document.getElementById("foodResults").innerHTML=all.map((f,i)=>card(f,`local-${i}`)).join("") || `<div class="panel" style="grid-column:1/-1;text-align:center;color:#71897f;padding:35px">No local match. Searching the global food database…</div>`;
}
function card(f,id){
  const payload=encodeURIComponent(JSON.stringify(f));
  return `<article class="food-card">
    <span class="category">${esc(f.category||"GLOBAL")}</span>
    <h3>${esc(f.name)}</h3>
    <div class="roman">${f.roman&&f.roman!==f.name?esc(f.roman):" "}</div>
    <div class="macro-line">
      <span>CAL<b>${Math.round(f.cal)}</b></span>
      <span>PROT<b>${Number(f.p).toFixed(1)}g</b></span>
      <span>CARB<b>${Number(f.c).toFixed(1)}g</b></span>
      <span>FAT<b>${Number(f.f).toFixed(1)}g</b></span>
    </div>
    <small style="color:#647c72">${f.nutritionUnit === "g" || f.nutritionUnit === "ml" ? `Per ${f.nutritionAmount}${f.nutritionUnit}` : `Per 1 ${esc(f.nutritionUnit)}`} · Fiber ${Number(f.fiber||0).toFixed(1)}g${f.quantity?` · ${esc(f.quantity)}`:""}</small>
    <button class="primary full" onclick="openFoodEncoded('${payload}')">Log food</button>
  </article>`
}
function openFoodEncoded(encoded){openFood(JSON.parse(decodeURIComponent(encoded)))}

let globalSearchTimer = null;
let globalSearchController = null;
let globalSearchSequence = 0;

function normalizeSearchText(value){
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g," ")
    .trim();
}

function isRelevantFood(product, query){
  const q = normalizeSearchText(query);
  if(!q) return false;
  const names = [
    product.product_name_en,
    product.product_name,
    product.generic_name_en,
    product.generic_name
  ].filter(Boolean).map(normalizeSearchText);

  const brands = String(product.brands || "")
    .split(",")
    .map(normalizeSearchText)
    .filter(Boolean);

  // STRICT matching: the searched term must occur in the product name or brand.
  // This prevents searches such as "oreo" from returning unrelated foods.
  return names.some(n => n === q || n.includes(q) || q.split(" ").every(t => n.includes(t)))
      || brands.some(b => b === q || b.includes(q));
}

function chooseEnglishName(product, query){
  const q = normalizeSearchText(query);
  const candidates = [
    product.product_name_en,
    product.product_name,
    product.generic_name_en,
    product.generic_name
  ].filter(Boolean);

  const exact = candidates.find(n => normalizeSearchText(n) === q);
  if(exact) return exact;

  const contains = candidates.find(n => normalizeSearchText(n).includes(q));
  if(contains) return contains;

  // Prefer an English field; don't display an unrelated French/German/etc. name.
  return product.product_name_en || product.generic_name_en || product.product_name || product.generic_name || "Unknown food";
}

async function legacySearchGlobal(q){
  const box=document.getElementById("foodResults");
  const query=String(q||"").trim();

  if(globalSearchController) globalSearchController.abort();
  clearTimeout(globalSearchTimer);

  // Every search gets a unique sequence so an older response can NEVER
  // overwrite/append to a newer search.
  const sequence=++globalSearchSequence;

  // Remove old global results immediately.
  box.querySelectorAll(".global-section,.global-message,#mfNoGlobalResults").forEach(el=>el.remove());

  if(query.length<2) return;

  box.insertAdjacentHTML("beforeend",
    `<div class="global-message" style="grid-column:1/-1;color:#71897f;font-size:12px;padding:10px 0">Searching exact global matches for “${esc(query)}”…</div>`
  );

  globalSearchTimer=setTimeout(async()=>{
    const controller=new AbortController();
    globalSearchController=controller;

    try{
      const url="https://world.openfoodfacts.org/api/v2/search?search_terms="+encodeURIComponent(query)+
        "&fields=product_name,product_name_en,generic_name,generic_name_en,brands,nutriments,quantity,code,languages_tags"+
        "&sort_by=unique_scans_n&page_size=100";

      const r=await fetch(url,{headers:{"Accept":"application/json"},signal:controller.signal});
      if(!r.ok) throw new Error("search failed");

      const data=await r.json();

      // If this isn't the latest search, discard it.
      if(sequence!==globalSearchSequence) return;

      const raw=(data.products||[]).filter(p=>p.product_name||p.product_name_en||p.generic_name_en);

      const relevant=raw
        .filter(p=>isRelevantFood(p,query))
        .map(p=>{
          const displayName=chooseEnglishName(p,query);
          const names=[
            p.product_name_en,p.product_name,p.generic_name_en,p.generic_name
          ].filter(Boolean).map(normalizeSearchText);

          const qn=normalizeSearchText(query);
          const exact=names.some(n=>n===qn);
          const starts=names.some(n=>n.startsWith(qn));
          const contains=names.some(n=>n.includes(qn));

          return {
            name:displayName,
            roman:p.brands?`Brand: ${p.brands}`:"Global food",
            category:"Global",
            cal:Number(p.nutriments?.["energy-kcal_100g"]||0),
            p:Number(p.nutriments?.proteins_100g||0),
            c:Number(p.nutriments?.carbohydrates_100g||0),
            f:Number(p.nutriments?.fat_100g||0),
            fiber:Number(p.nutriments?.fiber_100g||0),
            baseUnit:"g",
            quantity:p.quantity||"Per 100g",
            code:p.code||"",
            exact,
            starts,
            contains,
            language:(p.product_name_en||p.generic_name_en)?"English":"Database name"
          };
        })
        .filter(x=>x.cal||x.p||x.c||x.f)
        .sort((a,b)=>{
          // Exact name > starts with > contains > everything else.
          return (Number(b.exact)-Number(a.exact)) ||
                 (Number(b.starts)-Number(a.starts)) ||
                 (Number(b.contains)-Number(a.contains));
        });

      const unique=[];
      const seen=new Set();
      for(const x of relevant){
        const key=normalizeSearchText(x.name)+"|"+normalizeSearchText(x.roman);
        if(!seen.has(key)){seen.add(key);unique.push(x);}
      }

      box.querySelectorAll(".global-message").forEach(el=>el.remove());

      if(!unique.length){
        box.insertAdjacentHTML("beforeend",
          `<div class="global-message" style="grid-column:1/-1;color:#71897f;font-size:12px;padding:14px 0">
            No exact/relevant global food was found for “${esc(query)}”.
            Try the exact product name or brand. We won't show unrelated foods.
          </div>`
        );
        return;
      }

      const exactMatches=unique.filter(x=>x.exact);
      const otherMatches=unique.filter(x=>!x.exact);

      let html=`<div class="global-section" style="grid-column:1/-1;margin-top:8px"><span class="pill">GLOBAL RESULTS · ${unique.length}</span></div>`;

      if(exactMatches.length){
        html+=`<div class="global-section" style="grid-column:1/-1;margin-top:2px;color:#d9ff64;font-size:12px;font-weight:800">EXACT MATCHES</div>`;
        html+=exactMatches.slice(0,12).map(f=>card(f,"global")).join("");
      }

      if(otherMatches.length){
        html+=`<div class="global-section" style="grid-column:1/-1;margin-top:12px;color:#8ca49a;font-size:12px;font-weight:800">RELATED MATCHES</div>`;
        html+=otherMatches.slice(0,12).map(f=>card(f,"global")).join("");
      }

      box.insertAdjacentHTML("beforeend",html);

    }catch(e){
      if(e.name==="AbortError") return;
      if(sequence!==globalSearchSequence) return;
      box.querySelectorAll(".global-message").forEach(el=>el.remove());
      box.insertAdjacentHTML("beforeend",
        `<div class="global-message" style="grid-column:1/-1;color:#71897f;font-size:12px;padding:14px 0">
          Global food search needs an internet connection. Your local Pakistani database and custom foods still work.
        </div>`
      );
    }
  },250);
}

function mfPortionGrams(food,unit){
  if(unit==="g") return 1;
  if(unit==="ml") return Number(food.portionMl||1);
  if(food.unitWeights&&Number(food.unitWeights[unit])) return Number(food.unitWeights[unit]);
  if(unit===food.baseUnit&&Number(food.portionGrams)) return Number(food.portionGrams);
  return MF_DEFAULT_WEIGHTS[unit]||100;
}
function mfNutritionBasis(food){const unit=food.nutritionUnit||food.baseUnit||"g";const amount=Number(food.nutritionAmount||100);return {unit,amount:amount>0?amount:100};}
function mfCalculatePortion(food,amount,unit){
  const safeAmount=Math.max(0,Number(amount)||0),basis=mfNutritionBasis(food);
  if(basis.unit==="g"||basis.unit==="ml"){
    const multiplier=safeAmount/basis.amount;
    return {multiplier,cal:(+food.cal||0)*multiplier,p:(+food.p||0)*multiplier,c:(+food.c||0)*multiplier,f:(+food.f||0)*multiplier,fiber:(+food.fiber||0)*multiplier};
  }
  const baseWeight=Number(food.portionGrams||MF_DEFAULT_WEIGHTS[basis.unit]||100);
  const selectedWeight=safeAmount*mfPortionGrams(food,unit);
  const basisWeight=basis.amount*baseWeight;
  const multiplier=selectedWeight/Math.max(1,basisWeight);
  return {multiplier,cal:(+food.cal||0)*multiplier,p:(+food.p||0)*multiplier,c:(+food.c||0)*multiplier,f:(+food.f||0)*multiplier,fiber:(+food.fiber||0)*multiplier};
}

function mfUpdateFoodNutritionPreview() {
  if (!selectedFood) return;

  const amountInput = document.getElementById("servingAmount");
  const unitInput = document.getElementById("servingUnit");
  const note = document.getElementById("servingConversionNote");

  if (!amountInput || !unitInput) return;

  const amount = Number(amountInput.value);
  const unit = unitInput.value;
  const nutrition = mfCalculatePortion(
    selectedFood,
    amount,
    unit
  );

  const basis = mfNutritionBasis(selectedFood);

  document.getElementById("modalNutrition").innerHTML = `
    <div class="nutrition-grid">
      <div class="nutrition-box">
        <small>Calories</small>
        <b>${Math.round(nutrition.cal)} kcal</b>
      </div>
      <div class="nutrition-box">
        <small>Protein</small>
        <b>${nutrition.p.toFixed(1)}g</b>
      </div>
      <div class="nutrition-box">
        <small>Carbs</small>
        <b>${nutrition.c.toFixed(1)}g</b>
      </div>
      <div class="nutrition-box">
        <small>Fat</small>
        <b>${nutrition.f.toFixed(1)}g</b>
      </div>
      <div class="nutrition-box">
        <small>Fiber</small>
        <b>${nutrition.fiber.toFixed(1)}g</b>
      </div>
    </div>
    <p class="muted">
      Showing nutrition for <b>${amount || 0} ${unit}</b>.
      Base: ${basis.amount} ${basis.unit}.
    </p>
  `;

  const sourceNode=document.getElementById("foodSourceNote");
  if(sourceNode) sourceNode.textContent=selectedFood.source?`Source: ${selectedFood.source}`:"Source: nutrition reference";
  if (note) {
    const grams =
      unit === "g" || unit === "ml"
        ? amount
        : amount * mfPortionGrams(selectedFood, unit);

    note.textContent =
      `≈ ${Math.round(grams)}g equivalent · nutrition updates instantly`;
  }
}

function openFood(f){
  selectedFood = {
    ...f,
    nutritionUnit:
      f.nutritionUnit || f.baseUnit || "g",
    nutritionAmount:
      Number(f.nutritionAmount || 100)
  };
  window.selectedFood = selectedFood;

  document.getElementById("modalFoodName").textContent =
    selectedFood.name;

  const amountInput =
    document.getElementById("servingAmount");

  const unitInput =
    document.getElementById("servingUnit");

  const preferredUnit=selectedFood.defaultUnit||selectedFood.nutritionUnit;
  const localPortion=!['g','ml'].includes(preferredUnit);
  amountInput.value=localPortion?1:selectedFood.nutritionAmount;
  unitInput.value=preferredUnit;

  mfUpdateFoodNutritionPreview();
  modal("foodModal");

  setTimeout(() => {
    amountInput.focus();
    amountInput.select();
  }, 40);
}

function confirmFood(){
  const food = window.MacroForgeFinal?.selectedFood || window.selectedFood || selectedFood;
  const amountInput = document.getElementById("servingAmount");
  const unitInput = document.getElementById("servingUnit");
  if (!food) { toast("Select a food first."); return; }
  const amount = Number(amountInput?.value);
  const unit = unitInput?.value || food.defaultUnit || food.nutritionUnit || "g";
  if (!Number.isFinite(amount) || amount <= 0) { amountInput?.focus(); toast("Enter a valid amount"); return; }
  const nutrition = typeof window.mfCalculatePortion === "function" ? window.mfCalculatePortion(food, amount, unit) : null;
  if (!nutrition || !Number.isFinite(Number(nutrition.cal))) { toast("Nutrition calculation failed"); return; }
  state.foodLog = Array.isArray(state.foodLog) ? state.foodLog : [];
  state.foodLog.push({id:"food_"+Date.now(),name:food.name,amount,unit,cal:Number(nutrition.cal),p:Number(nutrition.p||0),c:Number(nutrition.c||0),f:Number(nutrition.f||0),fiber:Number(nutrition.fiber||0),date:today(),source:food.source||"MacroForge"});
  save(); modal("foodModal",false); updateDashboard(); toast(`${food.name} logged`);
}
function addWater(ml){state.waterLog.push({ml,amount:ml,date:today(),time:new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})});save();updateDashboard();renderWater();toast(`+${ml} ml water`)}
function renderWater(){const a=state.waterLog.filter(x=>x.date===today()).slice().reverse();document.getElementById("waterHistory").innerHTML=a.length?a.map(x=>`<div class="history-item"><span>${x.time}</span><b>+${x.ml} ml</b></div>`).join(""):"<div class='muted'>No water logged today.</div>"}
const templates=[
  ["Push Day","Chest · Shoulders · Triceps",["Bench Press","Incline Dumbbell Press","Shoulder Press","Lateral Raise","Triceps Pushdown"]],
  ["Pull Day","Back · Biceps",["Lat Pulldown","Barbell Row","Seated Cable Row","Face Pull","Dumbbell Curl"]],
  ["Leg Day","Quads · Hamstrings · Calves",["Squat","Leg Press","Romanian Deadlift","Leg Curl","Calf Raise"]]
];
function renderWorkouts(){
  document.getElementById("workoutTemplates").innerHTML=templates.map((w,i)=>
    `<article class="workout-card"><span class="pill">PROGRAM ${i+1}</span><h3>${esc(w[0])}</h3><p>${esc(w[1])}</p>
    <small style="color:#647c72">${w[2].length} exercises</small>
    <button class="primary full" onclick="startWorkout(${i})">Start workout</button></article>`
  ).join("");
}
function startWorkout(i){
  const w=templates[i];
  state.activeWorkout={
    name:w[0],
    exercises:w[2].map(n=>({name:n,sets:[{weight:"",reps:"",done:false},{weight:"",reps:"",done:false},{weight:"",reps:"",done:false}]}))
  };
  save();renderActiveWorkout();toast(`${w[0]} started`);
}
function addExercise(){
  if(!state.activeWorkout)return;
  const name=prompt("Exercise name");
  if(!name || !name.trim())return;
  state.activeWorkout.exercises.push({
    name:name.trim(),
    sets:[{weight:"",reps:"",done:false},{weight:"",reps:"",done:false},{weight:"",reps:"",done:false}]
  });
  save();renderActiveWorkout();toast("Exercise added");
}
function removeExercise(i){
  if(!state.activeWorkout)return;
  if(state.activeWorkout.exercises.length<=1)return toast("Keep at least one exercise");
  state.activeWorkout.exercises.splice(i,1);save();renderActiveWorkout();
}
function addSet(i){
  state.activeWorkout.exercises[i].sets.push({weight:"",reps:"",done:false});
  save();renderActiveWorkout();
}
function renderActiveWorkout(){
  const a=state.activeWorkout;
  if(!a){
    document.getElementById("activeWorkout").innerHTML="<div class='muted'>Choose a workout above to begin.</div>";
    return;
  }
  document.getElementById("workoutStatus").textContent=a.name;
  document.getElementById("activeWorkout").innerHTML=
    `<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px">
      <h3 style="margin:0">${esc(a.name)}</h3>
      <button class="text-btn" onclick="addExercise()">+ Add exercise</button>
    </div>`+
    a.exercises.map((e,ei)=>
      `<div class="exercise-block" style="border-bottom:1px solid #172a23;padding:14px 0">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px">
          <b>${esc(e.name)}</b>
          <div><button class="text-btn" onclick="addSet(${ei})">+ Set</button><button class="text-btn" onclick="removeExercise(${ei})">Remove</button></div>
        </div>
        <div class="exercise" style="border:0;padding:4px 0">
          <b class="exercise-name">Set</b><b>Weight</b><b>Reps</b><b>Done</b><span></span>
        </div>`+
        e.sets.map((s,si)=>
          `<div class="exercise" style="border:0;padding:4px 0">
            <span class="exercise-name">Set ${si+1}</span>
            <input placeholder="kg" value="${esc(s.weight)}" onchange="setExercise(${ei},${si},'weight',this.value)">
            <input placeholder="reps" value="${esc(s.reps)}" onchange="setExercise(${ei},${si},'reps',this.value)">
            <input class="check" type="checkbox" ${s.done?"checked":""} onchange="setExercise(${ei},${si},'done',this.checked)">
            <span></span>
          </div>`
        ).join("")+
      `</div>`
    ).join("")+
    `<button class="primary full" onclick="finishWorkout()">Finish workout</button>`;
}
function setExercise(e,s,k,v){state.activeWorkout.exercises[e].sets[s][k]=v;save()}
function finishWorkout(){
  state.workouts.push({date:today(),name:state.activeWorkout.name,exercises:state.activeWorkout.exercises});
  delete state.activeWorkout;save();renderActiveWorkout();toast("Workout saved");
}
function renderProgress(){const w=state.weights;if(w.length){document.getElementById("currentWeight").textContent=w[w.length-1].kg.toFixed(1);document.getElementById("startWeight").textContent=w[0].kg.toFixed(1);document.getElementById("weightChange").textContent=(w[w.length-1].kg-w[0].kg).toFixed(1)}document.getElementById("weightEntries").textContent=w.length;document.getElementById("weightHistory").innerHTML=w.slice().reverse().map(x=>`<div class="history-item"><span>${x.date}</span><b>${x.kg.toFixed(1)} kg</b></div>`).join("")||"<div class='muted'>No weight entries yet.</div>"}
function init(){
  document.getElementById("dateLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"});
  document.querySelectorAll(".nav-item").forEach(n=>n.onclick=()=>go(n.dataset.page));document.querySelectorAll("[data-page-link]").forEach(n=>n.onclick=()=>go(n.dataset.pageLink));
  document.getElementById("mobileMenu").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
  document.getElementById("profileBtn").onclick=()=>{document.getElementById("goalCal").value=state.goals.cal;document.getElementById("goalProtein").value=state.goals.protein;document.getElementById("goalCarbs").value=state.goals.carbs;document.getElementById("goalFat").value=state.goals.fat;document.getElementById("goalWater").value=state.goals.water;modal("profileModal")};
  document.getElementById("saveGoals").onclick=()=>{state.goals={cal:+goalCal.value||2500,protein:+goalProtein.value||150,carbs:+goalCarbs.value||300,fat:+goalFat.value||75,water:+goalWater.value||2500};save();modal("profileModal",false);updateDashboard();toast("Goals updated")};
  /* Search listeners are installed by mfInstallStrictSearch() after the
     original app bootstraps. Keeping one search pipeline prevents two
     handlers from cancelling each other or rendering stale results. */
  mfBindCategoryFilters();
  document.getElementById("confirmFood").onclick=confirmFood;document.getElementById("quickWater").onclick=()=>addWater(250);
  document.querySelectorAll("[data-water]").forEach(b=>b.onclick=()=>addWater(+b.dataset.water));
  document.getElementById("customWater").onclick=()=>{const x=prompt("How many ml?","500");if(x&&+x>0)addWater(+x)};
  document.getElementById("resetWater").onclick=()=>{state.waterLog=state.waterLog.filter(x=>x.date!==today());save();updateDashboard();renderWater();toast("Today's water reset")};
  document.getElementById("customFoodBtn").onclick=()=>modal("customModal");
  document.getElementById("saveCustom").onclick=()=>{const f={name:customName.value.trim(),roman:customName.value.trim(),category:"Custom",cal:+customCal.value||0,p:+customProtein.value||0,c:+customCarbs.value||0,f:+customFat.value||0,fiber:+customFiber.value||0,baseUnit:customUnit.value,nutritionUnit:customUnit.value,nutritionAmount:1,portionGrams:MF_DEFAULT_WEIGHTS[customUnit.value]||100,defaultUnit:customUnit.value};if(!f.name)return toast("Enter a food name");state.customFoods.push(f);save();modal("customModal",false);openFood(f);toast("Custom food created")};
  document.getElementById("newWorkout").onclick=()=>{const n=prompt("Workout name","Upper Body");if(n){templates.push([n,"Custom workout",["Exercise 1","Exercise 2","Exercise 3","Exercise 4"]]);renderWorkouts();toast("Workout created")}};
  document.getElementById("logWeight").onclick=()=>modal("weightModal");document.getElementById("saveWeight").onclick=()=>{const kg=+weightInput.value;if(!kg)return toast("Enter your weight");state.weights.push({kg,date:today()});save();modal("weightModal",false);renderProgress();toast("Weight logged")};
  document.querySelectorAll("[data-close]").forEach(x=>x.onclick=()=>x.closest(".modal").classList.remove("open"));
  document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.classList.remove("open")}));
  renderFoods();renderWorkouts();renderActiveWorkout();renderProgress();renderWater();updateDashboard();
}
init();

/* =========================================================
   MACROFORGE DYNAMIC ENGINE
   This layer adds:
   - strict global search relevance
   - request cancellation
   - language-aware product-name selection
   - unlimited workout exercises and sets
   - insights
   - profile persistence
   - JSON export/import
   - seven-day activity visualization
   ========================================================= */


const MF_SEARCH = {
  controller: null,
  requestId: 0,
  debounceTimer: null,
  pageSize: 40
};

function mfNormalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ")
    .trim();
}

function mfTokens(value) {
  return mfNormalize(value)
    .split(/\s+/)
    .filter(Boolean);
}

function mfHasNutrition(product) {
  const n = product?.nutriments || {};

  return [
    n["energy-kcal_100g"],
    n["energy_100g"],
    n["proteins_100g"],
    n["carbohydrates_100g"],
    n["fat_100g"]
  ].some(value => Number.isFinite(Number(value)));
}

function mfNutrition(product) {
  const n = product?.nutriments || {};

  let cal = Number(
    n["energy-kcal_100g"] ??
    n["energy-kcal"] ??
    0
  );

  if (!cal && Number.isFinite(Number(n["energy_100g"]))) {
    cal = Number(n["energy_100g"]) / 4.184;
  }

  return {
    cal,
    p: Number(n["proteins_100g"] ?? n["proteins"] ?? 0),
    c: Number(n["carbohydrates_100g"] ?? n["carbohydrates"] ?? 0),
    f: Number(n["fat_100g"] ?? n["fat"] ?? 0),
    fiber: Number(n["fiber_100g"] ?? n["fiber"] ?? 0),
    sugar: Number(n["sugars_100g"] ?? n["sugars"] ?? 0),
    sodium: Number(n["sodium_100g"] ?? n["sodium"] ?? 0)
  };
}

function mfEnglishName(product, query) {
  const q = mfNormalize(query);

  const englishCandidates = [
    product.product_name_en,
    product.generic_name_en,
    product.abbreviated_product_name_en
  ].filter(value => String(value || "").trim());

  const exactEnglish = englishCandidates.find(
    value => mfNormalize(value) === q
  );

  if (exactEnglish) {
    return String(exactEnglish).trim();
  }

  const containingEnglish = englishCandidates.find(
    value => mfNormalize(value).includes(q)
  );

  if (containingEnglish) {
    return String(containingEnglish).trim();
  }

  if (englishCandidates.length) {
    return String(englishCandidates[0]).trim();
  }

  /*
    Some foods are indexed with the wrong language tag. If the raw
    product name itself matches the user's English query, displaying
    the query is safer than showing a French/German/etc. label.
  */
  const raw = String(
    product.product_name ||
    product.generic_name ||
    ""
  ).trim();

  const rawTokens = mfTokens(raw);
  const queryTokens = mfTokens(query);

  if (
    raw &&
    queryTokens.length &&
    queryTokens.every(token => rawTokens.includes(token))
  ) {
    return query.trim();
  }

  const lang = String(product.lang || "").toLowerCase();

  if (lang === "en" || lang.startsWith("en-")) {
    return raw;
  }

  return "";
}

function mfScoreProduct(product, query) {
  const q = mfNormalize(query);
  const tokens = mfTokens(query);

  const name = mfNormalize(
    mfEnglishName(product, query)
  );

  const generic = mfNormalize(
    product.generic_name_en || ""
  );

  const brand = mfNormalize(
    product.brands || ""
  );

  const raw = mfNormalize(
    product.product_name || ""
  );

  if (!name && !raw) {
    return -1;
  }

  const searchable = `${name} ${generic} ${brand} ${raw}`;

  const matched = tokens.filter(
    token => searchable.includes(token)
  ).length;

  if (tokens.length && matched === 0) {
    return -1;
  }

  let score = 0;

  if (name === q || raw === q) {
    score += 2500;
  }

  if (name.startsWith(q) || raw.startsWith(q)) {
    score += 1200;
  }

  if (name.includes(q) || raw.includes(q)) {
    score += 900;
  }

  if (generic === q) {
    score += 700;
  }

  if (generic.includes(q)) {
    score += 400;
  }

  if (brand === q) {
    score += 650;
  }

  if (brand.includes(q)) {
    score += 300;
  }

  score += matched * 150;

  if (
    tokens.length > 1 &&
    matched === tokens.length
  ) {
    score += 600;
  }

  if (String(product.lang || "").toLowerCase().startsWith("en")) {
    score += 100;
  }

  return score;
}

function mfGlobalCard(food, exact) {
  const safe = JSON.stringify(food)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");

  return `
    <article class="food-card mf-global-result ${exact ? "global-exact" : "global-related"}">
      <span class="category">
        ${exact ? "EXACT MATCH" : "RELATED"} · GLOBAL
      </span>

      <h3>${esc(food.name)}</h3>

      <div class="roman">
        ${esc(food.roman)}
      </div>

      <div class="macro-line">
        <span>CAL<b>${Math.round(food.cal)} kcal</b></span>
        <span>PROT<b>${food.p.toFixed(1)}g</b></span>
        <span>CARB<b>${food.c.toFixed(1)}g</b></span>
        <span>FAT<b>${food.f.toFixed(1)}g</b></span>
      </div>

      <div class="global-nutrition-row">
        <span>Fiber ${food.fiber.toFixed(1)}g</span>
        ${food.sugar ? `<span>Sugar ${food.sugar.toFixed(1)}g</span>` : ""}
      </div>

      ${
        food.servingText
          ? `<div class="api-note">Serving: ${esc(food.servingText)}</div>`
          : ""
      }

      ${
        food.quantity
          ? `<div class="api-note">Pack: ${esc(food.quantity)}</div>`
          : ""
      }

      <button
        class="primary full"
        onclick='openFood(${safe})'
      >
        Log food
      </button>
    </article>
  `;
}

function mfRenderSearchStatus(text, loading = false) {
  const box = document.getElementById("foodResults");

  if (!box) {
    return;
  }

  const old = document.getElementById("mfSearchStatus");

  if (old) {
    old.remove();
  }

  const status = document.createElement("div");

  status.id = "mfSearchStatus";
  status.className = "search-status mf-global-message";
  status.innerHTML = loading
    ? `<span class="search-spinner"></span>${esc(text)}`
    : esc(text);

  box.before(status);
}

function mfClearSearchStatus() {
  document
    .getElementById("mfSearchStatus")
    ?.remove();
}

function mfClearGlobalResults() {
  const box = document.getElementById("foodResults");

  if (!box) {
    return;
  }

  box.querySelectorAll(
    ".mf-global-result, .mf-global-heading, .mf-global-message"
  ).forEach(node => node.remove());

  mfClearSearchStatus();
}

function mfExtractProducts(data) {
  if (!data) {
    return [];
  }

  if (Array.isArray(data.products)) {
    return data.products;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  if (Array.isArray(data.hits)) {
    return data.hits.map(hit =>
      hit?._source || hit
    );
  }

  if (Array.isArray(data.hits?.hits)) {
    return data.hits.hits.map(hit =>
      hit?._source || hit
    );
  }

  return [];
}

async function mfSearchGlobal(query) {
  const cleaned = String(query || "").trim();
  if (cleaned.length < 2) return;

  MF_SEARCH.requestId += 1;
  const requestId = MF_SEARCH.requestId;
  if (MF_SEARCH.controller) MF_SEARCH.controller.abort();
  MF_SEARCH.controller = new AbortController();

  const box = document.getElementById("foodResults");
  if (!box) return;

  mfClearGlobalResults();
  mfRenderSearchStatus(`Searching globally for “${cleaned}”…`, true);

  const signal = MF_SEARCH.controller.signal;
  const fields = [
    "code","product_name","product_name_en","generic_name","generic_name_en",
    "abbreviated_product_name","abbreviated_product_name_en","brands","lang",
    "languages_tags","serving_size","quantity","image_front_small_url","nutriments"
  ];

  const urls = [
    `https://search.openfoodfacts.org/search?q=${encodeURIComponent(cleaned)}&langs=en&page=1&page_size=${MF_SEARCH.pageSize}&boost_phrase=true`,
    `https://world.openfoodfacts.org/cgi/search.pl?action=process&json=1&search_simple=1&search_terms=${encodeURIComponent(cleaned)}&page=1&page_size=${MF_SEARCH.pageSize}&lc=en&fields=${encodeURIComponent(fields.join(","))}`,
    `https://us.openfoodfacts.org/cgi/search.pl?action=process&json=1&search_simple=1&search_terms=${encodeURIComponent(cleaned)}&page=1&page_size=${MF_SEARCH.pageSize}&lc=en&fields=${encodeURIComponent(fields.join(","))}`
  ];

  async function get(url) {
    const r = await fetch(url, {method:"GET", mode:"cors", cache:"no-store", signal,
      headers:{Accept:"application/json"}});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  function productsFrom(data) {
    if (!data) return [];
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.docs)) return data.docs;
    if (Array.isArray(data.hits)) return data.hits.map(x => x?._source || x?.document || x).filter(Boolean);
    if (Array.isArray(data.hits?.hits)) return data.hits.hits.map(x => x?._source || x?.document || x).filter(Boolean);
    return [];
  }

  function exactName(product) {
    const q = mfNormalize(cleaned);
    const candidates = [
      product.product_name_en,
      product.product_name,
      product.generic_name_en,
      product.generic_name,
      product.abbreviated_product_name_en,
      product.abbreviated_product_name
    ].filter(Boolean).map(v => String(v).trim());
    return candidates.find(v => mfNormalize(v) === q) || "";
  }

  async function hydrate(product) {
    if (mfHasNutrition(product)) return product;
    const code = product.code || product.id || product._id;
    if (!code) return product;
    try {
      const r = await get(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${encodeURIComponent(fields.join(","))}`);
      if (r && r.status === 1 && r.product) return {...product, ...r.product};
    } catch (_) {}
    return product;
  }

  try {
    let raw = [];
    let lastError = null;
    for (const url of urls) {
      try {
        const data = await get(url);
        const got = productsFrom(data);
        if (got.length) { raw = got; break; }
      } catch (e) {
        lastError = e;
        if (e.name === "AbortError") throw e;
      }
    }

    if (requestId !== MF_SEARCH.requestId) return;

    // STRICT MATCHING: never show Banana Chips, Banana Bread, etc. for "banana".
    const exact = raw.filter(p => exactName(p));
    const hydrated = [];
    for (const p of exact.slice(0, 20)) {
      const item = await hydrate(p);
      if (mfHasNutrition(item)) hydrated.push(item);
    }

    if (requestId !== MF_SEARCH.requestId) return;

    const unique = [];
    const seen = new Set();
    for (const product of hydrated) {
      const name = exactName(product);
      if (!name) continue;
      const n = mfNutrition(product);
      const key = `${product.code || ""}|${mfNormalize(name)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push({
        name,
        roman: product.brands ? `Brand: ${product.brands}` : "Global food",
        category:"Global",
        cal:n.cal, p:n.p, c:n.c, f:n.f, fiber:n.fiber, sugar:n.sugar, sodium:n.sodium,
        baseUnit:"g", nutritionUnit:"g", nutritionAmount:100,
        servingText:product.serving_size || "",
        quantity:product.quantity || "Per 100 g",
        barcode:product.code || "",
        image:product.image_front_small_url || "",
        source:"Open Food Facts"
      });
    }

    mfClearSearchStatus();
    if (!unique.length) {
      box.insertAdjacentHTML("beforeend", `<div class="empty-state mf-global-result"><h3>No exact food found</h3><p>No food named exactly “${esc(cleaned)}” with usable nutrition data was found. Try the standard food name, or use Custom Food.</p><button class="primary" onclick="modal('customModal')">Add as custom food</button></div>`);
      return;
    }

    box.insertAdjacentHTML("beforeend", `<div class="result-section-title mf-global-heading"><span class="pill">GLOBAL · EXACT MATCHES · ${unique.length}</span></div>`);
    unique.slice(0,20).forEach(food => box.insertAdjacentHTML("beforeend", mfGlobalCard(food, true)));
    mfRenderSearchStatus(`Found ${unique.length} exact global result${unique.length===1?"":"s"} for “${cleaned}”.`);
  } catch (error) {
    if (error.name === "AbortError" || requestId !== MF_SEARCH.requestId) return;
    mfClearSearchStatus();
    box.insertAdjacentHTML("beforeend", `<div class="empty-state mf-global-result"><h3>Global search could not connect</h3><p>MacroForge could not reach the global nutrition database. Your local foods and Custom Food are still available.</p><button class="secondary-btn" onclick="mfSearchGlobal(${JSON.stringify(cleaned)})">Try again</button></div>`);
  }
}

async function searchGlobal(query) {
  return mfSearchGlobal(query);
}

function mfSearchButton() {
  const input =
    document.getElementById(
      "foodSearch"
    );

  if (!input) {
    return;
  }

  clearTimeout(
    MF_SEARCH.debounceTimer
  );

  if (MF_SEARCH.controller) {
    MF_SEARCH.controller.abort();
  }

  renderFoods();

  const query =
    input.value.trim();

  if (query.length >= 2) {
    mfSearchGlobal(query);
  }
}

function mfInstallStrictSearch() {
  const input =
    document.getElementById(
      "foodSearch"
    );

  const button =
    document.getElementById(
      "searchFoodBtn"
    );

  if (!input || !button) {
    return;
  }

  input.oninput = () => {
    clearTimeout(
      MF_SEARCH.debounceTimer
    );

    if (MF_SEARCH.controller) {
      MF_SEARCH.controller.abort();
    }

    renderFoods();

    const query =
      input.value.trim();

    if (query.length < 2) {
      mfClearGlobalResults();
      return;
    }

    MF_SEARCH.debounceTimer =
      setTimeout(
        () =>
          mfSearchGlobal(
            query
          ),
        350
      );
  };

  input.onkeydown =
    event => {
      if (
        event.key ===
        "Enter"
      ) {
        event.preventDefault();

        clearTimeout(
          MF_SEARCH.debounceTimer
        );

        mfSearchGlobal(
          input.value.trim()
        );
      }
    };

  button.onclick =
    () => {
      clearTimeout(
        MF_SEARCH.debounceTimer
      );

      mfSearchGlobal(
        input.value.trim()
      );
    };
}

/* ---------------------------------------------------------
   Unlimited workout builder
   --------------------------------------------------------- */

function mfDefaultSet() {
  return {
    weight: "",
    reps: "",
    done: false
  };
}

function mfNewExercise(name = "New Exercise") {
  return {
    id: `ex_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name,
    sets: [
      mfDefaultSet(),
      mfDefaultSet(),
      mfDefaultSet()
    ]
  };
}

function mfEnsureWorkoutShape(workout) {
  if (!workout) {
    return null;
  }

  if (!Array.isArray(workout.exercises)) {
    workout.exercises = [];
  }

  workout.exercises = workout.exercises.map(
    exercise => ({
      id:
        exercise.id ||
        `ex_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: exercise.name || "Exercise",
      sets:
        Array.isArray(exercise.sets) && exercise.sets.length
          ? exercise.sets
          : [mfDefaultSet()]
    })
  );

  return workout;
}

function mfAddExercise() {
  if (!state.activeWorkout) {
    toast("Start a workout first");
    return;
  }

  state.activeWorkout.exercises.push(
    mfNewExercise("New Exercise")
  );

  save();
  renderActiveWorkout();
}

function mfRemoveExercise(index) {
  if (!state.activeWorkout) {
    return;
  }

  state.activeWorkout.exercises.splice(index, 1);

  save();
  renderActiveWorkout();
}

function mfAddSet(exerciseIndex) {
  if (!state.activeWorkout) {
    return;
  }

  const exercise =
    state.activeWorkout.exercises[exerciseIndex];

  if (!exercise) {
    return;
  }

  exercise.sets.push(
    mfDefaultSet()
  );

  save();
  renderActiveWorkout();
}

function mfRemoveSet(exerciseIndex, setIndex) {
  if (!state.activeWorkout) {
    return;
  }

  const exercise =
    state.activeWorkout.exercises[exerciseIndex];

  if (!exercise || exercise.sets.length <= 1) {
    return;
  }

  exercise.sets.splice(setIndex, 1);

  save();
  renderActiveWorkout();
}

function mfRenameExercise(index, value) {
  if (!state.activeWorkout) {
    return;
  }

  const exercise =
    state.activeWorkout.exercises[index];

  if (!exercise) {
    return;
  }

  exercise.name = value.trim() || "Exercise";

  save();
}

function mfRenderExercise(exercise, exerciseIndex) {
  const rows = exercise.sets
    .map(
      (set, setIndex) => `
        <div class="set-row">
          <span class="set-number">${setIndex + 1}</span>

          <input
            inputmode="decimal"
            placeholder="kg"
            value="${esc(set.weight)}"
            onchange="mfUpdateSet(${exerciseIndex},${setIndex},'weight',this.value)"
          >

          <input
            inputmode="numeric"
            placeholder="reps"
            value="${esc(set.reps)}"
            onchange="mfUpdateSet(${exerciseIndex},${setIndex},'reps',this.value)"
          >

          <label class="set-done">
            <input
              type="checkbox"
              ${set.done ? "checked" : ""}
              onchange="mfUpdateSet(${exerciseIndex},${setIndex},'done',this.checked)"
            >
            <span>Done</span>
          </label>

          <button
            class="icon-btn"
            onclick="mfRemoveSet(${exerciseIndex},${setIndex})"
            title="Remove set"
          >
            ×
          </button>
        </div>
      `
    )
    .join("");

  return `
    <article class="exercise-card">
      <div class="exercise-head">
        <div class="exercise-title-wrap">
          <span class="exercise-index">
            ${exerciseIndex + 1}
          </span>

          <input
            class="exercise-name-input"
            value="${esc(exercise.name)}"
            onchange="mfRenameExercise(${exerciseIndex},this.value)"
          >
        </div>

        <button
          class="danger-mini"
          onclick="mfRemoveExercise(${exerciseIndex})"
        >
          Remove
        </button>
      </div>

      <div class="set-header">
        <span>SET</span>
        <span>WEIGHT</span>
        <span>REPS</span>
        <span>STATUS</span>
        <span></span>
      </div>

      ${rows}

      <button
        class="add-set-btn"
        onclick="mfAddSet(${exerciseIndex})"
      >
        + Add set
      </button>
    </article>
  `;
}

function mfRenderWorkoutBuilder() {
  const container =
    document.getElementById("activeWorkout");

  if (!container) {
    return;
  }

  if (!state.activeWorkout) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No active workout</h3>
        <p>
          Pick a template above, then add as many exercises
          and sets as your session requires.
        </p>
      </div>
    `;

    return;
  }

  mfEnsureWorkoutShape(
    state.activeWorkout
  );

  const exercises =
    state.activeWorkout.exercises
      .map(mfRenderExercise)
      .join("");

  container.innerHTML = `
    <div class="workout-builder-top">
      <div>
        <span class="pill">ACTIVE SESSION</span>
        <h3>${esc(state.activeWorkout.name)}</h3>
      </div>

      <button
        class="primary"
        onclick="mfAddExercise()"
      >
        + Add exercise
      </button>
    </div>

    <div class="exercise-stack">
      ${exercises}
    </div>

    <div class="workout-footer-actions">
      <button
        class="secondary-btn"
        onclick="mfAddExercise()"
      >
        + Add another exercise
      </button>

      <button
        class="primary"
        onclick="finishWorkout()"
      >
        Finish workout
      </button>
    </div>
  `;
}

function mfUpdateSet(exerciseIndex, setIndex, key, value) {
  if (!state.activeWorkout) {
    return;
  }

  const exercise =
    state.activeWorkout.exercises[exerciseIndex];

  if (!exercise) {
    return;
  }

  const set =
    exercise.sets[setIndex];

  if (!set) {
    return;
  }

  set[key] = value;

  save();

  if (key === "done") {
    toast(
      value
        ? "Set completed"
        : "Set marked incomplete"
    );
  }
}

function mfPatchWorkoutStart() {
  window.startWorkout = function(index) {
    const template = templates[index];

    if (!template) {
      toast("Workout template not found");
      return;
    }

    state.activeWorkout = {
      name: template[0],
      startedAt: new Date().toISOString(),
      exercises: template[2].map(
        exerciseName =>
          mfNewExercise(exerciseName)
      )
    };

    save();
    mfRenderWorkoutBuilder();
    toast(`${template[0]} started`);
  };
}

function mfPatchWorkoutRendering() {
  window.renderActiveWorkout =
    mfRenderWorkoutBuilder;

  mfRenderWorkoutBuilder();
}

/* ---------------------------------------------------------
   Insights and weekly activity
   --------------------------------------------------------- */

function mfDateOffset(days) {
  const date = new Date();

  date.setDate(
    date.getDate() + days
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function mfFoodForDate(date) {
  return state.foodLog
    .filter(item => item.date === date);
}

function mfWaterForDate(date) {
  return state.waterLog
    .filter(item => item.date === date)
    .reduce(
      (total, item) => total + Number(item.ml || 0),
      0
    );
}

function mfWorkoutForDate(date) {
  return state.workouts
    .filter(item => item.date === date);
}

function mfDailyCalories(date) {
  return mfFoodForDate(date)
    .reduce(
      (total, item) =>
        total + Number(item.cal || 0),
      0
    );
}

function mfDailyProtein(date) {
  return mfFoodForDate(date)
    .reduce(
      (total, item) =>
        total + Number(item.p || 0),
      0
    );
}

function mfUpdateInsights() {
  const todayDate = today();

  const calories =
    mfDailyCalories(todayDate);

  const protein =
    mfDailyProtein(todayDate);

  const water =
    mfWaterForDate(todayDate);

  const workouts =
    mfWorkoutForDate(todayDate);

  const calorieDifference =
    state.goals.cal - calories;

  const proteinDifference =
    state.goals.protein - protein;

  const waterDifference =
    state.goals.water - water;

  document.getElementById(
    "insightCalories"
  ).textContent =
    `${Math.round(calories)} / ${state.goals.cal}`;

  document.getElementById(
    "insightCaloriesText"
  ).textContent =
    calorieDifference > 0
      ? `${Math.round(calorieDifference)} kcal remaining today.`
      : `${Math.round(Math.abs(calorieDifference))} kcal over target.`;

  document.getElementById(
    "insightProtein"
  ).textContent =
    `${Math.round(protein)}g`;

  document.getElementById(
    "insightProteinText"
  ).textContent =
    proteinDifference > 0
      ? `${Math.round(proteinDifference)}g protein remaining.`
      : "Protein target reached.";

  document.getElementById(
    "insightWater"
  ).textContent =
    `${Math.round(
      (water / state.goals.water) * 100
    )}%`;

  document.getElementById(
    "insightWaterText"
  ).textContent =
    waterDifference > 0
      ? `${Math.round(waterDifference)} ml remaining.`
      : "Hydration goal reached.";

  document.getElementById(
    "insightTraining"
  ).textContent =
    workouts.length
      ? `${workouts.length} session`
      : "Rest day";

  document.getElementById(
    "insightTrainingText"
  ).textContent =
    workouts.length
      ? "A workout was saved today."
      : "No completed workout has been saved today.";

  mfRenderWeeklyBars();
}

function mfRenderWeeklyBars() {
  const container =
    document.getElementById("weeklyBars");

  if (!container) {
    return;
  }

  const days = [];

  for (let offset = -6; offset <= 0; offset += 1) {
    days.push(
      mfDateOffset(offset)
    );
  }

  const values =
    days.map(
      date => mfDailyCalories(date)
    );

  const maximum =
    Math.max(
      state.goals.cal,
      ...values,
      1
    );

  container.innerHTML =
    days
      .map(
        (date, index) => {
          const value =
            values[index];

          const height =
            Math.max(
              4,
              Math.min(
                100,
                (value / maximum) * 100
              )
            );

          const day =
            new Date(`${date}T12:00:00`)
              .toLocaleDateString(
                undefined,
                { weekday: "short" }
              );

          return `
            <div class="week-day">
              <b>${Math.round(value)}</b>
              <div
                class="week-bar"
                style="--bar-height:${height}%"
                title="${Math.round(value)} kcal"
              ></div>
              <small>${day}</small>
            </div>
          `;
        }
      )
      .join("");
}

/* ---------------------------------------------------------
   Profile, export and import
   --------------------------------------------------------- */

function mfLoadProfile() {
  const profile =
    state.profile || {};

  const name =
    document.getElementById("profileName");

  const age =
    document.getElementById("profileAge");

  const height =
    document.getElementById("profileHeight");

  const weight =
    document.getElementById("profileWeight");

  if (name) {
    name.value =
      profile.name || "";
  }

  if (age) {
    age.value =
      profile.age || "";
  }

  if (height) {
    height.value =
      profile.height || "";
  }

  if (weight) {
    weight.value =
      profile.weight || "";
  }
}

function mfSaveProfile() {
  state.profile = {
    name:
      document.getElementById("profileName")
        .value
        .trim(),

    age:
      Number(
        document.getElementById("profileAge")
          .value
      ) || null,

    height:
      Number(
        document.getElementById("profileHeight")
          .value
      ) || null,

    weight:
      Number(
        document.getElementById("profileWeight")
          .value
      ) || null
  };

  save();

  toast("Profile saved");
}

function mfExportData() {
  const payload = {
    app: "MacroForge",
    version: 3,
    exportedAt:
      new Date().toISOString(),
    state
  };

  const blob =
    new Blob(
      [JSON.stringify(payload, null, 2)],
      {
        type: "application/json"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download =
    `macroforge-backup-${today()}.json`;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);

  toast("Backup exported");
}

function mfImportData(file) {
  if (!file) {
    return;
  }

  const reader =
    new FileReader();

  reader.onload = event => {
    try {
      const payload =
        JSON.parse(
          event.target.result
        );

      if (
        !payload ||
        typeof payload.state !== "object"
      ) {
        throw new Error(
          "Invalid MacroForge backup"
        );
      }

      state = payload.state;

      save();

      location.reload();
    } catch (error) {
      toast(
        "That backup file is not valid."
      );
    }
  };

  reader.readAsText(file);
}

function mfClearAllData() {
  const confirmed =
    window.confirm(
      "Clear all MacroForge data stored on this browser?"
    );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(
    "macroforge_state"
  );

  location.reload();
}

function mfInstallSettings() {
  const saveProfile =
    document.getElementById("saveProfile");

  const exportData =
    document.getElementById("exportData");

  const importButton =
    document.getElementById("importDataBtn");

  const importInput =
    document.getElementById("importData");

  const clearData =
    document.getElementById("clearData");

  if (saveProfile) {
    saveProfile.onclick =
      mfSaveProfile;
  }

  if (exportData) {
    exportData.onclick =
      mfExportData;
  }

  if (importButton) {
    importButton.onclick =
      () => importInput.click();
  }

  if (importInput) {
    importInput.onchange =
      event =>
        mfImportData(
          event.target.files[0]
        );
  }

  if (clearData) {
    clearData.onclick =
      mfClearAllData;
  }

  mfLoadProfile();
}

/* ---------------------------------------------------------
   Page refresh hook
   --------------------------------------------------------- */

function mfRefreshEverything() {
  mfBindCategoryFilters();
  updateDashboard();

  renderWater();

  renderProgress();

  renderWorkouts();

  mfRenderWorkoutBuilder();

  mfUpdateInsights();

  mfLoadProfile();
}

function mfInstallDynamicHooks() {
  mfInstallStrictSearch();

  mfPatchWorkoutStart();

  mfPatchWorkoutRendering();

  mfInstallSettings();

  mfUpdateInsights();

  document
    .querySelectorAll(".nav-item")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          setTimeout(
            mfUpdateInsights,
            50
          );

          setTimeout(
            mfLoadProfile,
            50
          );
        }
      );
    });
}

window.mfAddExercise =
  mfAddExercise;

window.mfRemoveExercise =
  mfRemoveExercise;

window.mfAddSet =
  mfAddSet;

window.mfRemoveSet =
  mfRemoveSet;

window.mfRenameExercise =
  mfRenameExercise;

window.mfUpdateSet =
  mfUpdateSet;

window.mfRefreshEverything =
  mfRefreshEverything;

setTimeout(
  mfInstallDynamicHooks,
  100
);


/*
=============================================================
MACROFORGE MAINTAINABILITY NOTES
=============================================================

DATA MODEL
-------------------------------------------------------------
state.goals
  cal
  protein
  carbs
  fat
  water

state.foodLog[]
  name
  amount
  unit
  cal
  p
  c
  f
  date

state.waterLog[]
  ml
  date
  time

state.customFoods[]
  name
  roman
  category
  cal
  p
  c
  f
  fiber
  baseUnit

state.weights[]
  kg
  date

state.workouts[]
  date
  name
  exercises[]

state.activeWorkout
  name
  startedAt
  exercises[]
    id
    name
    sets[]
      weight
      reps
      done

state.profile
  name
  age
  height
  weight

SEARCH ARCHITECTURE
-------------------------------------------------------------
1. Local Pakistani foods are rendered immediately.
2. The user query is normalized.
3. The old request is aborted.
4. Open Food Facts is queried with a limited field set.
5. Products without useful nutrition are rejected.
6. A relevance score is calculated.
7. A product must contain the requested tokens in its
   name, brand, generic name or categories.
8. Exact name matches are ranked first.
9. Duplicate product names are removed.
10. English names are preferred when available.
11. Results are split into exact and related sections.
12. Each result retains its own nutrition payload.
13. Logging uses the selected result rather than the query.
14. If no reliable result exists, the UI says so.

WHY THIS MATTERS
-------------------------------------------------------------
A generic search endpoint is not the same thing as a
nutrition search engine. Search engines can return products
that merely share a category, region, or ranking signal.
MacroForge therefore applies a second relevance layer in the
browser. This prevents a search such as "oreo" from displaying
an unrelated dairy product simply because the public database
ranked it highly.

HOMEMADE FOOD ACCURACY
-------------------------------------------------------------
Pakistani dishes such as biryani, karahi and nihari do not have
one universal nutritional value. Oil, meat ratio, rice amount,
cream, gravy and serving size can change the result materially.
The built-in values are therefore estimates. A production
version should let the user select recipe ingredients and
calculate the meal from those ingredients.

WORKOUT ARCHITECTURE
-------------------------------------------------------------
The workout builder is intentionally not limited to four
exercises. An exercise is a record with its own id and a sets
array. Sets can be appended or removed independently.

This makes the following sessions possible:

Push
  Bench Press
  Incline Press
  Shoulder Press
  Lateral Raise
  Cable Fly
  Triceps Pushdown
  Overhead Extension
  Any additional exercise

Legs
  Squat
  Leg Press
  Hack Squat
  Leg Extension
  RDL
  Leg Curl
  Calf Raise
  Any additional exercise

The user can add as many exercises as required.

RESPONSIVE DESIGN
-------------------------------------------------------------
Desktop:
  Fixed navigation
  Multi-column food cards
  Multi-column statistics
  Full workout table

Tablet:
  Reduced grid columns
  Collapsed sidebar
  Larger touch targets

Mobile:
  Slide-out navigation
  Single-column food cards
  Stacked workout controls
  Touch-friendly buttons
  Responsive modal widths

PERSISTENCE
-------------------------------------------------------------
This prototype uses localStorage because it allows the site to
work without a backend. It is not appropriate for multi-device
account synchronization.

For production:
  Auth -> Supabase Auth
  User data -> Supabase Postgres
  Files -> Supabase Storage
  Server functions -> Edge Functions
  Nutrition providers -> server-side API layer

SECURITY
-------------------------------------------------------------
Never expose a private API key in browser JavaScript.
If a nutrition provider requires a secret key, proxy the
request through a server-side function.

GLOBAL FOOD DATABASE
-------------------------------------------------------------
Open Food Facts is community-maintained. Coverage varies by
country and brand. Pakistani packaged-food coverage may be less
complete than European or North American coverage.

A Pakistan-first product should eventually maintain a curated
local database for:
  National brands
  Bakery items
  Restaurant meals
  Street foods
  Regional dishes
  Common household portions

PORTION SYSTEM
-------------------------------------------------------------
MacroForge supports:
  grams
  millilitres
  pieces
  plates
  bowls
  cups
  wraps
  servings

For production, each food should store:
  canonical grams
  canonical millilitres
  piece weight
  plate weight
  bowl weight
  restaurant serving weight

That permits accurate conversion between UI portions and
nutrition records.

FUTURE FEATURES
-------------------------------------------------------------
Barcode scanner
Recipe builder
Meal planner
Shopping list
Pakistan-specific restaurant database
Gym exercise library
Personal records
Volume/strength progression
Workout streaks
Sleep tracker
Step tracker
Notifications
Cloud sync
Account system
Premium subscription
Coach sharing
Export to CSV
Nutrition label scanner
AI meal recognition

=============================================================
END MAINTAINABILITY NOTES
=============================================================
*/

/* Category filter reliability fix — intentionally isolated from the rest of the app.
   Uses event delegation so the category buttons continue to work even if another
   dynamic layer re-renders the Food Log section after the initial app bootstrap. */
function MacroForgeSetFilter(value) {
  const allowed = ["all","Pakistani","Breakfast","BBQ","Snacks","Desserts","Drinks"];
  const filter = allowed.includes(value) ? value : "all";
  currentFilter = filter;
  window.MacroForgeFilter = filter;
  document.querySelectorAll(".filter[data-filter]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  const search = document.getElementById("foodSearch");
  if (search) search.value = "";
  renderFoods();
  return false;
}
window.MacroForgeSetFilter = MacroForgeSetFilter;

function mfBindCategoryFilters() {
  document.querySelectorAll(".filter[data-filter]").forEach(btn => {
    btn.onclick = function(event) {
      event.preventDefault();
      event.stopPropagation();
      MacroForgeSetFilter(this.dataset.filter);
      return false;
    };
  });
  const active = window.MacroForgeFilter || "all";
  document.querySelectorAll(".filter[data-filter]").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.filter === active)
  );
}

mfBindCategoryFilters();

/* Final bootstrap safety pass. */
setTimeout(() => {
  try {
    mfInstallDynamicHooks();
    mfRefreshEverything();
  } catch (error) {
    console.warn("MacroForge dynamic bootstrap:", error);
  }
}, 250);


function mfInstallFoodModalControls() {
  const amount = document.getElementById("servingAmount");
  const unit = document.getElementById("servingUnit");

  if (!amount || !unit || amount.dataset.mfBound === "1") return;

  amount.dataset.mfBound = "1";
  unit.dataset.mfBound = "1";

  amount.addEventListener("input", mfUpdateFoodNutritionPreview);
  amount.addEventListener("change", mfUpdateFoodNutritionPreview);
  unit.addEventListener("input", mfUpdateFoodNutritionPreview);
  unit.addEventListener("change", mfUpdateFoodNutritionPreview);
}

window.mfUpdateFoodNutritionPreview=mfUpdateFoodNutritionPreview;
setTimeout(mfInstallFoodModalControls, 100);

/* Account UI hook */
setTimeout(() => {
  const signOutButton =
    document.getElementById("signOutButton");

  if (
    signOutButton &&
    window.MacroForgeAuth?.configured
  ) {
    signOutButton.onclick =
      () => window.MacroForgeAuth.signOut();
  }
}, 150);


/* ============================================================
   FINAL CATEGORY FILTER ENGINE
   One source of truth for category selection.
   Also assigns a category automatically to newly created/custom foods.
   ============================================================ */
(function MacroForgeCategoryEngine(){
  const CATEGORIES = ["all","Pakistani","Breakfast","BBQ","Snacks","Desserts","Drinks"];
  const aliases = {
    all:"all", pakistani:"Pakistani", pakistan:"Pakistani", desi:"Pakistani",
    breakfast:"Breakfast", bbq:"BBQ", "barbecue":"BBQ", snacks:"Snacks",
    snack:"Snacks", desserts:"Desserts", dessert:"Desserts", drinks:"Drinks",
    drink:"Drinks", beverages:"Drinks", beverage:"Drinks"
  };

  function clean(v){ return String(v || "").trim().toLowerCase(); }
  function normalizeCategory(v){
    const k=clean(v);
    return aliases[k] || null;
  }

  // Infer a useful category for foods created outside the curated database.
  function inferCategory(food){
    const explicit=normalizeCategory(food && food.category);
    if(explicit && explicit !== "all") return explicit;
    const text=clean((food && food.name)||"");
    const rules=[
      ["Breakfast",/\b(omelette|egg|eggs|paratha|halwa puri|chana puri|pancake|waffle|cereal|toast|pancakes|french toast|breakfast)\b/],
      ["BBQ",/\b(tikka|seekh|kebab|kabob|chapli|malai boti|bihari boti|boti|tandoori|bbq|barbecue|grilled|wings)\b/],
      ["Desserts",/\b(kheer|gulab jamun|jalebi|halwa|ras malai|barfi|zarda|firni|kulfi|cake|cookie|biscuit|brownie|ice cream|chocolate|dessert|donut|doughnut)\b/],
      ["Drinks",/\b(lassi|chai|tea|coffee|juice|shake|smoothie|falooda|soda|cola|water|lemonade|drink|beverage|milk)\b/],
      ["Snacks",/\b(samosa|pakora|spring roll|chaat|dahi bhallay|gol gappay|bun kebab|tikki|papri|shawarma|fries|chips|snack|popcorn|pretzel)\b/],
      ["Pakistani",/\b(biryani|karahi|nihari|haleem|pulao|qeema|daal|dal|chana|rajma|saag|kofta|korma|gosht|aloo gosht|chicken handi|naan|roti|naan|kulcha|puri|qeema paratha|mutton|chapli)\b/]
    ];
    for(const [cat,re] of rules) if(re.test(text)) return cat;
    return "Pakistani";
  }

  function assignCategories(){
    if(Array.isArray(window.MF_LOCAL_RECORDS)) window.MF_LOCAL_RECORDS.forEach(f=>{f.category=normalizeCategory(f.category)||inferCategory(f);});
    if(Array.isArray(window.MF_EXTRA_GYM_FOODS)) window.MF_EXTRA_GYM_FOODS.forEach(f=>{f.category=normalizeCategory(f.category)||inferCategory(f);});
    if(window.state && Array.isArray(window.state.customFoods)) window.state.customFoods.forEach(f=>{f.category=normalizeCategory(f.category)||inferCategory(f);});
  }

  function selected(){ return CATEGORIES.includes(window.__mfCategoryFilter) ? window.__mfCategoryFilter : "all"; }

  // This renderer deliberately filters the rendered food cards by their data category.
  // It is independent of any previous currentFilter implementation.
  function applyCategoryToRenderedCards(){
    const active=selected();
    document.querySelectorAll('.filter[data-filter]').forEach(b=>{
      b.classList.toggle('active', b.getAttribute('data-filter')===active);
      b.setAttribute('aria-pressed', b.getAttribute('data-filter')===active ? 'true':'false');
    });
    document.querySelectorAll('#foodResults .food-card').forEach(card=>{
      const label=card.querySelector('.category');
      const cat=normalizeCategory(label ? label.textContent : card.dataset.category);
      card.hidden = active!=="all" && cat!==active;
    });
  }

  function setCategory(value){
    const cat=normalizeCategory(value)||"all";
    window.__mfCategoryFilter=cat;
    window.MacroForgeFilter=cat;
    window.currentFilter=cat;
    if(typeof currentFilter !== 'undefined') currentFilter=cat;
    assignCategories();
    const search=document.getElementById('foodSearch');
    if(search) search.value='';
    // Use the original renderer to rebuild the cards, then apply the definitive filter.
    if(typeof window.__mfOriginalRenderFoods==='function') window.__mfOriginalRenderFoods();
    else if(typeof renderFoods==='function') renderFoods();
    applyCategoryToRenderedCards();
    return false;
  }

  function bind(){
    document.querySelectorAll('.filter[data-filter]').forEach(btn=>{
      btn.type='button';
      btn.onclick=function(e){ e.preventDefault(); e.stopImmediatePropagation(); setCategory(this.dataset.filter); return false; };
    });
  }

  assignCategories();
  if(!window.__mfOriginalRenderFoods && typeof window.renderFoods==='function') window.__mfOriginalRenderFoods=window.renderFoods;
  window.MacroForgeSetFilter=setCategory;
  window.MacroForgeAssignFoodCategory=function(food){
    if(food){ food.category=normalizeCategory(food.category)||inferCategory(food); }
    return food;
  };
  window.MacroForgeCategoryEngine={setCategory,assignCategories,inferCategory,normalizeCategory};

  // Re-run after each normal render so filters remain correct after navigation/search.
  const original=window.__mfOriginalRenderFoods;
  window.renderFoods=function(){
    assignCategories();
    if(typeof original==='function') original();
    applyCategoryToRenderedCards();
  };

  bind();
  setTimeout(bind,50); setTimeout(bind,250); setTimeout(bind,750);
})();
