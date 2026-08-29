/* =========================================================
   MACROFORGE V23 — MEAL FORGE
   Pakistani-first recipe planning inspired by modern meal-planner
   workflows, but implemented as an original MacroForge feature.
   ========================================================= */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const today=()=>window.today?.()||new Date().toISOString().slice(0,10);
const state=()=>window.state||{};
const save=()=>window.save?.();
const toast=m=>window.toast?.(m);

const RECIPES=[
 {id:'pk-chicken-karahi',name:'Chicken Karahi',region:'Pakistani',tags:['High Protein','Dinner','BBQ Night'],time:35,servings:2,
  macros:{cal:520,p:46,c:16,f:29},ingredients:[['Chicken breast',400,'g'],['Tomato',250,'g'],['Cooking oil',20,'g'],['Ginger',15,'g'],['Garlic',12,'g'],['Green chilli',15,'g'],['Spices',8,'g']],
  steps:['Heat the oil and sear the chicken until lightly browned.','Add ginger, garlic and spices; cook until fragrant.','Add tomatoes and simmer until thick.','Finish with green chilli and serve hot.']},
 {id:'pk-chicken-biryani',name:'Chicken Biryani',region:'Pakistani',tags:['High Protein','Rice','Meal Prep'],time:60,servings:4,
  macros:{cal:610,p:36,c:74,f:20},ingredients:[['Chicken',500,'g'],['Basmati rice',400,'g'],['Yogurt',150,'g'],['Cooking oil',25,'g'],['Onion',180,'g'],['Biryani spices',15,'g']],
  steps:['Marinate chicken with yogurt and spices.','Cook onions until golden and add chicken.','Parboil rice separately.','Layer rice and chicken, cover and steam until fully cooked.']},
 {id:'pk-daal-chawal',name:'Daal Chawal',region:'Pakistani',tags:['Budget','Vegetarian','Meal Prep'],time:40,servings:3,
  macros:{cal:480,p:18,c:76,f:11},ingredients:[['Lentils',180,'g'],['Basmati rice',240,'g'],['Tomato',120,'g'],['Cooking oil',15,'g'],['Onion',100,'g'],['Spices',8,'g']],
  steps:['Rinse and cook lentils until tender.','Cook rice separately.','Temper onion, tomato and spices in oil.','Combine the tempering with the daal and serve with rice.']},
 {id:'pk-chicken-tikka',name:'Chicken Tikka',region:'Pakistani',tags:['High Protein','Low Carb','BBQ'],time:35,servings:2,
  macros:{cal:390,p:57,c:9,f:14},ingredients:[['Chicken breast',400,'g'],['Yogurt',80,'g'],['Lemon',20,'g'],['Tikka spices',12,'g'],['Cooking oil',8,'g']],
  steps:['Mix chicken with yogurt, lemon and spices.','Marinate for at least 30 minutes.','Grill or air-fry until cooked through and charred at the edges.']},
 {id:'pk-beef-qeema',name:'Beef Qeema',region:'Pakistani',tags:['High Protein','Dinner','Meal Prep'],time:35,servings:3,
  macros:{cal:560,p:38,c:20,f:36},ingredients:[['Lean beef mince',450,'g'],['Peas',120,'g'],['Tomato',160,'g'],['Cooking oil',15,'g'],['Onion',120,'g'],['Spices',10,'g']],
  steps:['Brown the mince thoroughly.','Add onion, tomato and spices.','Stir in peas and simmer until tender.','Reduce until the desired consistency is reached.']},
 {id:'pk-chana',name:'Chana Masala',region:'Pakistani',tags:['Vegetarian','Budget','High Fiber'],time:35,servings:3,
  macros:{cal:360,p:16,c:52,f:10},ingredients:[['Chickpeas cooked',420,'g'],['Tomato',180,'g'],['Onion',100,'g'],['Cooking oil',12,'g'],['Spices',10,'g']],
  steps:['Sauté onion and spices.','Add tomato and cook into a masala.','Add chickpeas and simmer until thick.']},
 {id:'global-chicken-rice',name:'Garlic Chicken Rice Bowl',region:'Global',tags:['High Protein','Meal Prep','Quick'],time:25,servings:2,
  macros:{cal:540,p:48,c:58,f:14},ingredients:[['Chicken breast',300,'g'],['Cooked rice',300,'g'],['Mixed vegetables',200,'g'],['Olive oil',12,'g'],['Garlic',10,'g']],
  steps:['Season and sear chicken.','Stir-fry vegetables with garlic.','Add rice and toss until hot.','Slice chicken and assemble the bowl.']},
 {id:'global-beef-pasta',name:'High-Protein Beef Pasta',region:'Global',tags:['High Protein','Dinner','Meal Prep'],time:30,servings:3,
  macros:{cal:590,p:42,c:68,f:17},ingredients:[['Lean beef mince',360,'g'],['Pasta cooked',450,'g'],['Tomato sauce',240,'g'],['Parmesan',30,'g'],['Olive oil',10,'g']],
  steps:['Brown the beef.','Add tomato sauce and simmer.','Toss with cooked pasta.','Finish with parmesan.']},
 {id:'global-egg-wrap',name:'Protein Egg Wrap',region:'Global',tags:['Breakfast','High Protein','Quick'],time:12,servings:1,
  macros:{cal:410,p:31,c:31,f:18},ingredients:[['Eggs',3,'piece'],['Whole wheat wrap',1,'piece'],['Low-fat cheese',30,'g'],['Spinach',60,'g']],
  steps:['Whisk eggs and cook with spinach.','Add cheese.','Fold into the wrap and serve.']},
 {id:'global-yogurt-oats',name:'Greek Yogurt Oats Bowl',region:'Global',tags:['Breakfast','High Protein','Quick'],time:5,servings:1,
  macros:{cal:430,p:31,c:54,f:10},ingredients:[['Greek yogurt',250,'g'],['Oats',50,'g'],['Banana',100,'g'],['Honey',10,'g'],['Almonds',12,'g']],
  steps:['Add yogurt and oats to a bowl.','Top with banana and almonds.','Drizzle with honey.']},
 {id:'global-chicken-salad',name:'Chicken Crunch Salad',region:'Global',tags:['High Protein','Low Carb','Quick'],time:15,servings:1,
  macros:{cal:360,p:45,c:18,f:12},ingredients:[['Chicken breast',180,'g'],['Lettuce',100,'g'],['Cucumber',100,'g'],['Tomato',100,'g'],['Olive oil',10,'g']],
  steps:['Cook and slice the chicken.','Chop the vegetables.','Combine and dress with olive oil.']}
];

const store=()=>{const s=state();s.mealForge=s.mealForge||{favorites:[],planner:{},shopping:[],collections:{}};return s.mealForge;};
function recipe(id){return RECIPES.find(r=>r.id===id);}
function kcal(r,scale=1){return r.macros.cal*scale;}
function macroScore(r,rem){
 const e={cal:Math.max(0,rem.cal),p:Math.max(0,rem.p),c:Math.max(0,rem.c),f:Math.max(0,rem.f)};
 const vals={cal:kcal(r),p:r.macros.p,c:r.macros.c,f:r.macros.f};
 let overshoot=0,dist=0;
 for(const k of ['cal','p','c','f']){
   const d=vals[k]-e[k];
   if(d>0) overshoot += (k==='cal'?d/50:d);
   dist += Math.abs(d)/(k==='cal'?100:10);
 }
 // Strongly reject fat/carbs overshoot when already over target.
 if(e.f<=1 && vals.f>2) overshoot+=vals.f*4;
 if(e.c<=1 && vals.c>2) overshoot+=vals.c*3;
 return overshoot*20+dist-(Math.min(vals.p,e.p)/10);
}
function dailyTotals(){
 const s=state(),logs=(s.foodLog||[]).filter(x=>x.date===today());
 return logs.reduce((a,x)=>{a.cal+=num(x.cal);a.p+=num(x.p);a.c+=num(x.c);a.f+=num(x.f);return a},{cal:0,p:0,c:0,f:0});
}
function goals(){const g=state().goals||{};return {cal:num(g.cal),p:num(g.protein),c:num(g.carbs),f:num(g.fat)};}
function remaining(){const g=goals(),t=dailyTotals();return {cal:g.cal-t.cal,p:g.p-t.p,c:g.c-t.c,f:g.f-t.f};}

function inject(){
 if($('mealForge')) return;
 const nav=document.querySelector('.sidebar nav');
 if(nav){
  const b=document.createElement('button');b.className='nav-item';b.dataset.page='mealForge';b.innerHTML='🍽 <span>Meal Forge</span>';nav.insertBefore(b,nav.querySelector('[data-page="hydration"]'));
 }
 const main=document.querySelector('.main'); if(!main)return;
 const page=document.createElement('section');page.className='page';page.id='mealForge';
 page.innerHTML=`<div class="mf-meal-hero"><div><span class="pill">MEAL FORGE · NEW</span><h2>Plan food around <em>your actual macros.</em></h2><p>Pakistani-first recipes, global options, portion scaling, weekly planning and a live shopping list — all inside MacroForge.</p></div><div class="mf-meal-target"><span>Remaining today</span><b id="mfrCal">—</b><small id="mfrMacro">Set your plan to unlock precision matching.</small></div></div>
 <div class="mf-meal-tabs"><button class="mf-mtab active" data-mtab="discover">Discover</button><button class="mf-mtab" data-mtab="planner">Week Planner</button><button class="mf-mtab" data-mtab="shopping">Shopping List</button><button class="mf-mtab" data-mtab="saved">Saved</button></div>
 <div id="mfrDiscover" class="mfr-panel">
  <div class="mf-search-box"><input id="mfrSearch" placeholder="Search chicken, rice, karahi, breakfast…"><button id="mfrClear">Clear</button></div>
  <div class="mf-filter-row"><select id="mfrRegion"><option value="all">All cuisines</option><option>Pakistani</option><option>Global</option></select><select id="mfrTag"><option value="all">All styles</option><option>High Protein</option><option>Low Carb</option><option>Breakfast</option><option>Meal Prep</option><option>Vegetarian</option><option>Quick</option></select><label>Min protein <input id="mfrMinP" type="number" min="0" step="1" placeholder="g"></label><label>Max calories <input id="mfrMaxCal" type="number" min="0" step="10" placeholder="kcal"></label><button id="mfrMatch" class="primary">Match my remaining macros</button></div>
  <div id="mfrResults" class="mf-recipe-grid"></div>
 </div>
 <div id="mfrPlanner" class="mfr-panel hidden"><div class="mf-section-head"><div><span class="pill">PLAN</span><h3>Seven-day meal planner</h3></div><button class="secondary-btn" id="mfrClearPlan">Clear week</button></div><div id="mfrPlannerGrid" class="mf-planner-grid"></div></div>
 <div id="mfrShopping" class="mfr-panel hidden"><div class="mf-section-head"><div><span class="pill">SHOP</span><h3>Smart shopping list</h3><small>Ingredients are aggregated from your planned recipes.</small></div><button class="secondary-btn" id="mfrCopyShop">Copy list</button></div><div id="mfrShoppingList"></div></div>
 <div id="mfrSaved" class="mfr-panel hidden"><div class="mf-section-head"><div><span class="pill">YOUR LIBRARY</span><h3>Saved recipes</h3></div></div><div id="mfrSavedGrid" class="mf-recipe-grid"></div></div>
 <div class="mf-recipe-modal modal" id="mfrModal"><div class="modal-card mf-recipe-card-modal"><button class="close" id="mfrClose">×</button><div id="mfrModalBody"></div></div></div>
 <div class="mf-cook-modal modal" id="mfrCook"><div class="modal-card"><button class="close" id="mfrCookClose">×</button><span class="pill">COOK MODE</span><h2 id="mfrCookTitle"></h2><div id="mfrStep"></div><div class="mf-cook-actions"><button class="secondary-btn" id="mfrPrev">Back</button><b id="mfrStepNo"></b><button class="primary" id="mfrNext">Next</button></div></div></div>`;
 main.appendChild(page);
 bind();
 render();
}
function card(r,match=false){
 const fav=store().favorites.includes(r.id);
 return `<article class="mf-recipe"><div class="mf-recipe-top"><span class="mf-region">${esc(r.region)}</span><button class="mf-heart" data-fav="${r.id}" aria-label="Save">${fav?'♥':'♡'}</button></div><h3>${esc(r.name)}</h3><div class="mf-tags">${r.tags.slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="mf-macros"><b>${Math.round(r.macros.cal)}<small>kcal</small></b><b>${r.macros.p}<small>protein</small></b><b>${r.macros.c}<small>carbs</small></b><b>${r.macros.f}<small>fat</small></b></div><div class="mf-recipe-foot"><span>⏱ ${r.time} min · ${r.servings} servings</span>${match?'<strong>Best macro match</strong>':''}</div><div class="mf-recipe-actions"><button class="secondary-btn" data-view="${r.id}">View recipe</button><button class="primary" data-plan="${r.id}">Plan</button></div></article>`;
}
function render(){
 const rem=remaining(), g=goals();
 if($('mfrCal'))$('mfrCal').textContent=g.cal?`${Math.max(0,Math.round(rem.cal))} kcal`:'—';
 if($('mfrMacro'))$('mfrMacro').textContent=g.cal?`P ${Math.max(0,Math.round(rem.p))}g · C ${Math.max(0,Math.round(rem.c))}g · F ${Math.max(0,Math.round(rem.f))}g`:'Set your plan to unlock precision matching.';
 renderResults(); renderPlanner(); renderShopping(); renderSaved();
}
function renderResults(match=false){
 const q=($('mfrSearch')?.value||'').toLowerCase().trim(), reg=$('mfrRegion')?.value||'all', tag=$('mfrTag')?.value||'all', minp=num($('mfrMinP')?.value), maxcal=num($('mfrMaxCal')?.value);
 let arr=RECIPES.filter(r=>(!q||`${r.name} ${r.region} ${r.tags.join(' ')} ${r.ingredients.map(x=>x[0]).join(' ')}`.toLowerCase().includes(q))&&(reg==='all'||r.region===reg)&&(tag==='all'||r.tags.includes(tag))&&(!minp||r.macros.p>=minp)&&(!maxcal||r.macros.cal<=maxcal));
 if(match){const rem=remaining();arr.sort((a,b)=>macroScore(a,rem)-macroScore(b,rem));}
 $('mfrResults').innerHTML=arr.length?arr.map(r=>card(r,match&&r===arr[0])).join(''):'<div class="mf-empty">No recipe matches. Try a broader search or remove a filter.</div>';
}
function renderPlanner(){
 const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],p=store().planner;
 $('mfrPlannerGrid').innerHTML=days.map((d,i)=>{const id=p[i],r=id&&recipe(id);return `<article class="mf-day"><b>${d}</b>${r?`<div class="mf-day-recipe"><strong>${esc(r.name)}</strong><span>${r.macros.cal} kcal · P ${r.macros.p}g</span><button data-view="${r.id}">Open</button><button data-remove-day="${i}">Remove</button></div>`:'<span class="mf-day-empty">No meal planned</span>'}</article>`}).join('');
}
function renderShopping(){
 const totals={}; Object.values(store().planner).forEach(id=>{const r=recipe(id);if(!r)return;r.ingredients.forEach(x=>{const key=x[0]+'|'+x[2];totals[key]=(totals[key]||0)+x[1];});});
 const rows=Object.entries(totals).map(([k,v])=>{const [name,unit]=k.split('|');return `<label class="mf-shop-row"><input type="checkbox"><span>${esc(name)}</span><b>${Number.isInteger(v)?v:v.toFixed(1)} ${esc(unit)}</b></label>`;});
 $('mfrShoppingList').innerHTML=rows.length?rows.join(''):'<div class="mf-empty">Plan some recipes first and your combined shopping list will appear here.</div>';
}
function renderSaved(){
 const arr=RECIPES.filter(r=>store().favorites.includes(r.id));
 $('mfrSavedGrid').innerHTML=arr.length?arr.map(r=>card(r)).join(''):'<div class="mf-empty">Save a recipe with ♡ and it will live here.</div>';
}
function openRecipe(id){
 const r=recipe(id);if(!r)return;
 $('mfrModalBody').innerHTML=`<span class="mf-region">${esc(r.region)}</span><h2>${esc(r.name)}</h2><div class="mf-macros mf-modal-macros"><b>${r.macros.cal}<small>kcal</small></b><b>${r.macros.p}<small>protein</small></b><b>${r.macros.c}<small>carbs</small></b><b>${r.macros.f}<small>fat</small></b></div><p>${r.time} minutes · ${r.servings} servings</p><h3>Ingredients</h3><ul>${r.ingredients.map(x=>`<li>${esc(x[0])} — ${x[1]} ${esc(x[2])}</li>`).join('')}</ul><div class="mf-modal-actions"><button class="primary" data-cook="${r.id}">Start Cook Mode</button><button class="secondary-btn" data-plan="${r.id}">Plan this meal</button><button class="secondary-btn" data-log-recipe="${r.id}">Log 1 serving</button></div><h3>Method</h3><ol>${r.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`;
 $('mfrModal').classList.add('open');
}
function planRecipe(id){
 const p=store().planner,day=String((new Date().getDay()+6)%7);p[day]=id;save();render();toast(`${recipe(id).name} planned for ${['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][day]}`);
}
function logRecipe(id){
 const r=recipe(id),s=state();s.foodLog=s.foodLog||[];s.foodLog.push({id:`mfr_${Date.now()}`,name:r.name,amount:1,unit:'serving',cal:r.macros.cal,p:r.macros.p,c:r.macros.c,f:r.macros.f,date:today(),source:'MacroForge Meal Forge'});save();window.updateDashboard?.();window.renderFoods?.();render();toast(`${r.name} logged — 1 serving`);$('mfrModal').classList.remove('open');
}
let cookId=null,cookStep=0;
function cook(id){cookId=id;cookStep=0;$('mfrCookTitle').textContent=recipe(id).name;$('mfrCook').classList.add('open');renderCook();}
function renderCook(){const r=recipe(cookId);$('mfrStep').innerHTML=`<div class="mf-cook-step"><span>STEP ${cookStep+1}</span><p>${esc(r.steps[cookStep])}</p></div>`;$('mfrStepNo').textContent=`${cookStep+1} / ${r.steps.length}`;$('mfrPrev').disabled=cookStep===0;$('mfrNext').textContent=cookStep===r.steps.length-1?'Done':'Next';}
function bind(){
 document.addEventListener('click',e=>{
  const page=e.target.closest?.('[data-page]'); if(page&&page.dataset.page==='mealForge'){setTimeout(()=>{document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));$('mealForge').classList.add('active');document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x===page));const t=$('pageTitle');if(t)t.textContent='Meal Forge';},0);return;}
  const mt=e.target.closest?.('[data-mtab]');if(mt){const key=mt.dataset.mtab;document.querySelectorAll('.mf-mtab').forEach(x=>x.classList.toggle('active',x===mt));['discover','planner','shopping','saved'].forEach(k=>$('mfr'+k[0].toUpperCase()+k.slice(1)).classList.toggle('hidden',k!==key));return;}
  const fav=e.target.closest?.('[data-fav]');if(fav){const a=store().favorites,i=a.indexOf(fav.dataset.fav);i<0?a.push(fav.dataset.fav):a.splice(i,1);save();render();return;}
  const view=e.target.closest?.('[data-view]');if(view){openRecipe(view.dataset.view);return;}
  const plan=e.target.closest?.('[data-plan]');if(plan){planRecipe(plan.dataset.plan);return;}
  const log=e.target.closest?.('[data-log-recipe]');if(log){logRecipe(log.dataset.logRecipe);return;}
  const cookBtn=e.target.closest?.('[data-cook]');if(cookBtn){$('mfrModal').classList.remove('open');cook(cookBtn.dataset.cook);return;}
  const rm=e.target.closest?.('[data-remove-day]');if(rm){delete store().planner[rm.dataset.removeDay];save();render();return;}
 });
 $('mfrSearch').addEventListener('input',()=>renderResults());
 $('mfrRegion').addEventListener('change',()=>renderResults());$('mfrTag').addEventListener('change',()=>renderResults());$('mfrMinP').addEventListener('input',()=>renderResults());$('mfrMaxCal').addEventListener('input',()=>renderResults());
 $('mfrMatch').onclick=()=>renderResults(true);$('mfrClear').onclick=()=>{$('mfrSearch').value='';renderResults();};
 $('mfrClose').onclick=()=>$('mfrModal').classList.remove('open');$('mfrCookClose').onclick=()=>$('mfrCook').classList.remove('open');
 $('mfrPrev').onclick=()=>{if(cookStep>0){cookStep--;renderCook();}};$('mfrNext').onclick=()=>{if(cookStep<recipe(cookId).steps.length-1){cookStep++;renderCook();}else $('mfrCook').classList.remove('open');};
 $('mfrClearPlan').onclick=()=>{store().planner={};save();render();};
 $('mfrCopyShop').onclick=async()=>{const rows=[...document.querySelectorAll('.mf-shop-row')].map(x=>x.innerText.replace(/\n/g,' — '));try{await navigator.clipboard.writeText(rows.join('\n'));toast('Shopping list copied');}catch(e){toast('Copy unavailable in this browser');}};
}
const style=document.createElement('style');style.textContent=`
#mealForge{padding-bottom:50px}.mf-meal-hero{display:flex;justify-content:space-between;gap:20px;padding:26px;border:1px solid #29463a;background:linear-gradient(135deg,#0d2119,#07100d);border-radius:22px;margin-bottom:16px}.mf-meal-hero h2{font-size:clamp(28px,4vw,48px);margin:8px 0}.mf-meal-hero h2 em{color:#d9ff64;font-style:normal}.mf-meal-hero p{color:#91a59d;max-width:680px}.mf-meal-target{min-width:210px;padding:18px;border:1px solid #315243;border-radius:16px;background:#07100d}.mf-meal-target span,.mf-meal-target small{display:block;color:#91a59d}.mf-meal-target b{display:block;font-size:28px;margin:7px 0}.mf-meal-tabs{display:flex;gap:8px;overflow:auto;margin:12px 0}.mf-mtab{background:#07100d;color:#a9bbb3;border:1px solid #29463a;padding:10px 15px;border-radius:999px;white-space:nowrap}.mf-mtab.active{background:#d9ff64;color:#07100d;border-color:#d9ff64}.mf-search-box{display:flex;gap:8px}.mf-search-box input{flex:1}.mf-search-box button{background:#10221b;border:1px solid #315243;color:#cfe4d8;border-radius:10px;padding:0 14px}.mf-filter-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 16px}.mf-filter-row select,.mf-filter-row label{min-width:140px}.mf-filter-row label{display:flex;align-items:center;gap:6px}.mf-filter-row input{width:90px}.mf-recipe-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.mf-recipe{border:1px solid #1c332a;background:#07100d;border-radius:18px;padding:16px}.mf-recipe-top{display:flex;justify-content:space-between}.mf-region{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#d9ff64}.mf-heart{background:none;border:0;color:#d9ff64;font-size:23px}.mf-recipe h3{margin:9px 0}.mf-tags{display:flex;gap:5px;flex-wrap:wrap}.mf-tags span{font-size:10px;border:1px solid #29463a;border-radius:999px;padding:4px 7px;color:#9eb1a8}.mf-macros{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:14px 0}.mf-macros b{font-size:17px}.mf-macros small{display:block;color:#789187;font-size:9px;font-weight:400}.mf-recipe-foot{display:flex;justify-content:space-between;gap:6px;color:#91a59d;font-size:10px}.mf-recipe-foot strong{color:#d9ff64}.mf-recipe-actions{display:flex;gap:7px;margin-top:12px}.mf-recipe-actions button{flex:1}.mf-section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.mf-section-head h3{margin:5px 0}.mf-planner-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px}.mf-day{min-height:150px;padding:12px;border:1px solid #1c332a;background:#07100d;border-radius:14px}.mf-day>span{display:block}.mf-day-empty{color:#789187;font-size:11px;margin-top:30px}.mf-day-recipe{margin-top:16px}.mf-day-recipe>*{display:block;margin:6px 0}.mf-day-recipe span{font-size:10px;color:#91a59d}.mf-day-recipe button{background:none;border:0;color:#d9ff64;padding:0;text-align:left}.mf-shop-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;padding:12px;border-bottom:1px solid #183126}.mf-shop-row span{color:#cfe4d8}.mf-empty{padding:30px;text-align:center;color:#789187;border:1px dashed #29463a;border-radius:15px}.mf-recipe-card-modal{max-width:720px}.mf-modal-macros{max-width:420px}.mf-modal-actions{display:flex;gap:8px;flex-wrap:wrap}.mf-cook-step{min-height:220px;display:grid;place-items:center;text-align:center;padding:25px}.mf-cook-step span{color:#d9ff64;font-size:11px}.mf-cook-step p{font-size:24px;line-height:1.4}.mf-cook-actions{display:flex;align-items:center;justify-content:space-between;gap:10px}.mfr-panel.hidden{display:none}@media(max-width:950px){.mf-recipe-grid{grid-template-columns:1fr 1fr}.mf-planner-grid{grid-template-columns:1fr 1fr}.mf-meal-hero{flex-direction:column}}@media(max-width:600px){.mf-recipe-grid,.mf-planner-grid{grid-template-columns:1fr}.mf-filter-row>*{width:100%}.mf-meal-hero{padding:18px}.mf-recipe-actions{flex-direction:column}.mf-cook-step p{font-size:19px}}
`;document.head.appendChild(style);
document.addEventListener('DOMContentLoaded',inject,{once:true});
window.MacroForgeMealForge={recipes:RECIPES,render};
})();
