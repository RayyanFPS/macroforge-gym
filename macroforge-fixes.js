/* MacroForge V7 functional bridge.
   One event handler per control. No duplicate food logging handlers.
*/
(function () {
  "use strict";

  const SEARCH = { timer: null, controller: null, request: 0 };
  const WEIGHTS = {
    g: 1, ml: 1, piece: 50, slice: 30, scoop: 30, serving: 100,
    plate: 300, bowl: 250, cup: 240, glass: 300, wrap: 180,
    tablespoon: 15, teaspoon: 5, tbsp: 15, tsp: 5,
    packet: 50, bottle: 500
  };
  const OFF_FIELDS = [
    "code","product_name","product_name_en","generic_name","generic_name_en",
    "brands","lang","languages_tags","quantity","serving_size","nutriments",
    "image_front_small_url"
  ].join(",");

  const esc = v => String(v ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));
  const norm = v => String(v || "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, " ").trim();

  function selectedFood() {
    return window.MacroForgeFinal?.selectedFood || window.selectedFood || null;
  }

  function setSelectedFood(food) {
    if (window.MacroForgeFinal) window.MacroForgeFinal.selectedFood = food;
    window.selectedFood = food;
    return food;
  }

  function nutrition(product) {
    let n = product?.nutriments || {};

    // USDA FoodData Central returns foodNutrients rather than the
    // Open Food Facts `nutriments` object. Normalize it into the same
    // internal shape so generic foods such as bananas, apples and rice
    // work exactly like packaged foods.
    if (!Object.keys(n).length && Array.isArray(product?.foodNutrients)) {
      const map = {};
      for (const item of product.foodNutrients) {
        const key = String(item.nutrientName || '').toLowerCase();
        const id = Number(item.nutrientId);
        const value = Number(item.value);
        if (!Number.isFinite(value)) continue;
        if (id === 1008 || (key.includes('energy') && key.includes('kcal'))) map['energy-kcal_100g'] = value;
        else if (id === 1003 || key.includes('protein')) map.proteins_100g = value;
        else if (id === 1005 || key.includes('carbohydrate')) map.carbohydrates_100g = value;
        else if (id === 1004 || key.includes('total lipid') || key === 'fat') map.fat_100g = value;
        else if (id === 1079 || key.includes('fiber')) map.fiber_100g = value;
        else if (id === 2000 || key.includes('sugars')) map.sugars_100g = value;
        else if (id === 1093 || key === 'sodium, na' || key === 'sodium') map.sodium_100g = value / 1000;
      }
      n = map;
    }

    let kcal = Number(n['energy-kcal_100g'] ?? n['energy-kcal']);
    if (!Number.isFinite(kcal)) {
      const kj = Number(n['energy_100g'] ?? n['energy']);
      kcal = Number.isFinite(kj) ? kj / 4.184 : 0;
    }
    const value = key => Math.max(0, Number(n[`${key}_100g`] ?? n[key] ?? 0) || 0);
    return {
      cal: Math.max(0, kcal || 0),
      p: value('proteins'),
      c: value('carbohydrates'),
      f: value('fat'),
      fiber: value('fiber'),
      sugar: value('sugars'),
      sodium: value('sodium')
    };
  }

  function extract(data) {
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.foods)) return data.foods;
    if (Array.isArray(data?.hits)) return data.hits.map(x => x?._source || x?.document || x).filter(Boolean);
    if (Array.isArray(data?.hits?.hits)) return data.hits.hits.map(x => x?._source || x?.document || x).filter(Boolean);
    if (Array.isArray(data?.results)) return data.results.map(x => x?._source || x?.document || x).filter(Boolean);
    if (Array.isArray(data?.docs)) return data.docs;
    if (Array.isArray(data?.data)) return data.data.map(x => x?._source || x?.document || x).filter(Boolean);
    return [];
  }

  async function fetchJSON(url, options = {}) {
    const r = await fetch(url, {
      mode: "cors", cache: "no-store", signal: options.signal,
      method: options.method || "GET",
      headers: { Accept: "application/json", ...(options.headers || {}) },
      body: options.body
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }


  const GLOBAL_FALLBACKS = [
    {id:"fallback_beef_burger",product_name:"Beef Burger",generic_name:"Beef burger",quantity:"per 100 g",nutriments:{"energy-kcal_100g":250,"proteins_100g":16,"carbohydrates_100g":20,"fat_100g":12}},
    {id:"fallback_beef_patty",product_name:"Beef Burger Patty",generic_name:"Ground beef patty, cooked",quantity:"per 100 g",nutriments:{"energy-kcal_100g":250,"proteins_100g":26,"carbohydrates_100g":0,"fat_100g":15}},
    {id:"fallback_chicken_burger",product_name:"Chicken Burger",generic_name:"Chicken burger",quantity:"per 100 g",nutriments:{"energy-kcal_100g":210,"proteins_100g":18,"carbohydrates_100g":18,"fat_100g":8}},
    {id:"fallback_banana",product_name:"Banana",generic_name:"Banana, raw",quantity:"per 100 g",nutriments:{"energy-kcal_100g":89,"proteins_100g":1.1,"carbohydrates_100g":22.8,"fat_100g":0.3}},
    {id:"fallback_white_rice",product_name:"White Rice, Cooked",generic_name:"Rice, white, cooked",quantity:"per 100 g",nutriments:{"energy-kcal_100g":130,"proteins_100g":2.7,"carbohydrates_100g":28.2,"fat_100g":0.3}},
    {id:"fallback_egg",product_name:"Egg, Whole, Cooked",generic_name:"Egg",quantity:"per 100 g",nutriments:{"energy-kcal_100g":155,"proteins_100g":13,"carbohydrates_100g":1.1,"fat_100g":10.6}}
  ];

  async function searchProducts(query, signal, limit = 30) {
    const q = String(query || '').trim();
    if (!q) return [];

    // Query independent sources instead of stopping after the first source.
    // This is important for generic foods: Open Food Facts may return only
    // packaged derivatives (e.g. banana chips) while USDA contains the
    // underlying raw food (e.g. banana, raw).
    const targets = [
      async () => fetchJSON('https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=' + encodeURIComponent(q) +
        '&pageSize=' + Math.min(limit,25) + '&dataType=Foundation,SR%20Legacy,Branded', {signal}),
      async () => fetchJSON('https://search.openfoodfacts.org/search', {
        method:'POST', signal, headers:{'Content-Type':'application/json'},
        body:JSON.stringify({q, langs:['en'], page:1, page_size:limit, boost_phrase:true,
          fields:['code','product_name','product_name_en','generic_name','generic_name_en','brands','quantity','serving_size','nutriments']})
      }),
      async () => fetchJSON('https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q) +
        '&langs=en&page=1&page_size=' + limit + '&boost_phrase=true', {signal}),
      async () => fetchJSON('https://world.openfoodfacts.org/cgi/search.pl?action=process&json=1&search_simple=1&search_terms=' +
        encodeURIComponent(q) + '&page=1&page_size=' + limit + '&lc=en&fields=' + encodeURIComponent(OFF_FIELDS), {signal}),
      async () => fetchJSON('https://us.openfoodfacts.org/cgi/search.pl?action=process&json=1&search_simple=1&search_terms=' +
        encodeURIComponent(q) + '&page=1&page_size=' + limit + '&lc=en&fields=' + encodeURIComponent(OFF_FIELDS), {signal})
    ];

    let merged = [];
    let last = null;
    for (const target of targets) {
      try {
        const data = await target();
        const products = extract(data);
        if (products.length) merged = merged.concat(products);
      } catch (e) {
        last = e;
        if (e.name === 'AbortError') throw e;
      }
    }

    if (!merged.length) {
      const nq=norm(q);
      const fallback=GLOBAL_FALLBACKS.filter(p=>{
        const names=[p.product_name,p.generic_name].map(norm);
        return names.some(n=>n===nq || n.includes(nq) || nq.includes(n));
      });
      if(fallback.length)return fallback;
      throw last || new Error('No global search endpoint returned results');
    }
    return merged;
  }

  function directMatch(product, query) {
    const q = norm(query);
    if (!q) return false;
    const qTokens = q.split(/\s+/).filter(Boolean);
    const names = [
      product.product_name_en, product.product_name,
      product.generic_name_en, product.generic_name,
      product.description
    ].filter(Boolean).map(norm);

    // Global search is intentionally tolerant: "beef burger" should find
    // "Beef Burger", "Beef Hamburger", "Burger, beef patty", etc.
    return names.some(name => {
      const tokens = name.split(/\s+/).filter(Boolean);
      if (!tokens.length) return false;
      if (name === q) return true;
      const matched = qTokens.filter(qt =>
        tokens.some(nt => nt===qt || nt===qt+"s" || qt===nt+"s" || nt.includes(qt) || qt.includes(nt))
      ).length;
      const coverage = matched / qTokens.length;
      if (coverage >= 0.75) return true;
      return qTokens.length === 1 && tokens.some(t => t===q || t.startsWith(q));
    });
  }

  function score(product, query) {
    const q = norm(query);
    const names = [
      product.product_name_en, product.product_name,
      product.generic_name_en, product.generic_name,
      product.description
    ].filter(Boolean).map(norm);
    const brands = String(product.brands || '').split(',').map(norm).filter(Boolean);

    let best=-1;
    for(const name of names){
      if(name===q) best=Math.max(best,10000);
      else if(name.startsWith(q)) best=Math.max(best,8000);
      else if(directMatch(product,query)){
        const qt=q.split(/\s+/).filter(Boolean);
        const nt=name.split(/\s+/).filter(Boolean);
        const matched=qt.filter(x=>nt.some(y=>y===x||y.startsWith(x)||x.startsWith(y))).length;
        best=Math.max(best,5000+Math.round((matched/Math.max(1,qt.length))*1000)-Math.min(500,nt.length));
      }
    }
    if(brands.some(brand=>brand===q)) best=Math.max(best,9000);
    return best;
  }

  function toFood(product, query) {
    const names = [
      product.product_name_en,
      product.product_name,
      product.generic_name_en,
      product.generic_name,
      product.description
    ].filter(Boolean).map(String);
    const q = norm(query);
    const name = names.find(x => norm(x) === q)
      || names.find(x => directMatch(product, x) && norm(x).includes(q))
      || names[0]
      || query;
    const n = nutrition(product);
    const brand = product.brandOwner || product.brands || product.brand || '';
    return {
      id: product.code ? `global_${product.code}` : (product.fdcId ? `usda_${product.fdcId}` : `global_${Date.now()}_${Math.random().toString(36).slice(2)}`),
      name,
      roman: brand ? `Brand: ${brand}` : 'Global food',
      category:'Global',
      cal:n.cal,p:n.p,c:n.c,f:n.f,fiber:n.fiber,sugar:n.sugar,sodium:n.sodium,
      baseUnit:'g', nutritionUnit:'g', nutritionAmount:100, portionGrams:1, defaultUnit:'g',
      quantity:product.quantity || product.servingSize || product.serving_size || 'Per 100 g',
      barcode:product.code || '', fdcId:product.fdcId || '', image:product.image_front_small_url || '',
      source:product.fdcId ? 'USDA FoodData Central' : 'Open Food Facts'
    };
  }

  function ranked(products, query, max = 20) {
    const seen = new Set();
    return products
      .map(p => ({p, s:score(p,query)}))
      .filter(x => x.s > 0 && directMatch(x.p, query))
      .sort((a,b) => b.s-a.s)
      .map(x => toFood(x.p,query))
      .filter(f => {
        const k = `${f.barcode || f.fdcId}|${norm(f.name)}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return (f.cal || f.p || f.c || f.f) > 0;
      })
      .slice(0,max);
  }

  async function globalSearch(query) {
    const q = String(query || "").trim();
    const box = document.getElementById("foodResults");
    if (!box || q.length < 2) return;
    SEARCH.request++;
    const request = SEARCH.request;
    if (SEARCH.timer) clearTimeout(SEARCH.timer);
    SEARCH.controller?.abort();
    SEARCH.controller = new AbortController();
    box.querySelectorAll(".mf-global-heading,.mf-global-result,.mf-global-error").forEach(e => e.remove());
    const loading = document.createElement("div");
    loading.className = "mf-global-heading"; loading.style.gridColumn = "1/-1";
    loading.innerHTML = '<span class="pill">SEARCHING GLOBAL DATABASE…</span>';
    box.prepend(loading);
    try {
      let external=[];
      try { external=ranked(await searchProducts(q, SEARCH.controller.signal, 40), q, 20); }
      catch(apiError){ if(apiError.name === "AbortError") throw apiError; }
      const localPool=[...(window.MF_LOCAL_RECORDS||[]),...(window.MF_EXTRA_GYM_FOODS||[]),...(window.state?.customFoods||[])];
      const nq=norm(q);
      const local=localPool.filter(f=>{
        const text=norm(`${f.name||""} ${f.roman||""} ${f.category||""}`);
        const toks=nq.split(/\s+/).filter(Boolean);
        return toks.length && toks.every(t=>text.includes(t));
      }).map(f=>({...f,source:f.source||"MacroForge curated reference"}));
      const foods=[...local,...external].filter((f,i,a)=>a.findIndex(x=>norm(x.name)===norm(f.name))===i).slice(0,30);
      if (request !== SEARCH.request) return;
      loading.remove();
      if (!foods.length) {
        const e = document.createElement("div"); e.className="empty-state mf-global-error"; e.style.gridColumn="1/-1";
        e.innerHTML=`<h3>No food found</h3><p>Try a broader food name, brand, or ingredient. MacroForge searches multiple global nutrition sources.</p>`; box.prepend(e); return;
      }
      const heading=document.createElement("div");heading.className="mf-global-heading";heading.style.gridColumn="1/-1";
      heading.innerHTML=`<span class="pill">GLOBAL RESULTS · ${foods.length}</span>`;box.prepend(heading);
      foods.forEach(food => {
        const card=document.createElement("article"); card.className="food-card mf-global-result";
        card.innerHTML=`<span class="category">GLOBAL DATABASE</span><h3>${esc(food.name)}</h3><div class="roman">${esc(food.roman)}</div><div class="macro-line"><span>CAL<b>${Math.round(food.cal)} kcal</b></span><span>PROT<b>${food.p.toFixed(1)}g</b></span><span>CARB<b>${food.c.toFixed(1)}g</b></span><span>FAT<b>${food.f.toFixed(1)}g</b></span></div><small class="muted">${esc(food.quantity)}</small><button class="primary full" type="button">View nutrition & log</button>`;
        card.querySelector("button").onclick=()=>{setSelectedFood(food);window.openFood?.(food);};
        box.appendChild(card);
      });
    } catch (e) {
      if (e.name === "AbortError" || request !== SEARCH.request) return;
      loading.remove();
      const err=document.createElement("div");err.className="empty-state mf-global-error";err.style.gridColumn="1/-1";
      err.innerHTML=`<h3>Global search unavailable</h3><p>MacroForge could not reach the global nutrition service. Check your internet connection and retry.</p><button class="secondary-btn" type="button">Retry</button>`;
      err.querySelector("button").onclick=()=>globalSearch(q);box.prepend(err);
    }
  }

  function installFoodSearch() {
    const input=document.getElementById("foodSearch"), button=document.getElementById("searchFoodBtn");
    if(!input)return;
    input.oninput=()=>{if(SEARCH.timer)clearTimeout(SEARCH.timer);window.renderFoods?.();const q=input.value.trim();if(q.length>=2)SEARCH.timer=setTimeout(()=>globalSearch(q),650);};
    input.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();globalSearch(input.value.trim());}};
    if(button)button.onclick=()=>globalSearch(input.value.trim());
  }

  function calculate(food, amount, unit) {
    const engine = window.MacroForgeFinal?.calculate;
    if (typeof engine === "function") return engine(food, amount, unit);
    const basis = food.nutritionUnit || food.baseUnit || "g";
    const base = Number(food.nutritionAmount) || 100;
    const a = Number(amount);
    const physical = unit === basis ? a : a * (food.unitWeights?.[unit] || WEIGHTS[unit] || 100);
    const mult = physical / base;
    const v = k => Math.max(0, Number(food[k]) || 0) * mult;
    return {cal:v("cal"),p:v("p"),c:v("c"),f:v("f"),fiber:v("fiber"),sugar:v("sugar"),sodium:v("sodium"),equivalentGrams:physical};
  }

  function showFoodLibraryChoice(food, state){
    let modalEl=document.getElementById("foodLibraryChoiceModal");
    if(!modalEl){
      modalEl=document.createElement("div");
      modalEl.id="foodLibraryChoiceModal";
      modalEl.className="modal mf-library-choice-modal";
      modalEl.innerHTML=`<div class="modal-card mf-library-choice-card" role="dialog" aria-modal="true" aria-labelledby="mfLibraryChoiceTitle">
        <button class="close" type="button" id="mfLibraryChoiceClose" aria-label="Close">×</button>
        <span class="pill">FOOD LIBRARY</span>
        <h2 id="mfLibraryChoiceTitle">Add this food to your Food Log?</h2>
        <p class="muted" id="mfLibraryChoiceText"></p>
        <div class="mf-choice-actions">
          <button class="secondary-btn" type="button" id="mfLibraryChoiceNo">No, Recent Foods only</button>
          <button class="primary" type="button" id="mfLibraryChoiceYes">Yes, add to Food Log</button>
        </div>
      </div>`;
      document.body.appendChild(modalEl);
    }
    const text=document.getElementById("mfLibraryChoiceText");
    if(text)text.textContent=`“${food.name}” has been logged successfully. Save it to your reusable Food Log list so you can find it again later?`;
    const close=()=>modalEl.classList.remove("open");
    const finish=(add)=>{
      if(!Array.isArray(state.customFoods))state.customFoods=[];
      if(!Array.isArray(state.recentFoods))state.recentFoods=[];
      const clean={...food}; delete clean.__macroforgeCustomCandidate;
      const existing=state.customFoods.findIndex(x=>x.id===clean.id || String(x.name).trim().toLowerCase()===String(clean.name).trim().toLowerCase());
      if(add){
        if(existing>=0)state.customFoods[existing]=clean; else state.customFoods.push(clean);
      }
      const recent={...clean};
      state.recentFoods=[recent,...state.recentFoods.filter(x=>String(x.name).trim().toLowerCase()!==String(recent.name).trim().toLowerCase())].slice(0,30);
      window.save?.(); window.renderFoods?.(); close();
      window.toast?.(add ? `${food.name} added to your Food Log list` : `${food.name} kept in Recent Foods`);
    };
    document.getElementById("mfLibraryChoiceYes").onclick=()=>finish(true);
    document.getElementById("mfLibraryChoiceNo").onclick=()=>finish(false);
    document.getElementById("mfLibraryChoiceClose").onclick=()=>finish(false);
    modalEl.onclick=e=>{if(e.target===modalEl)finish(false);};
    modalEl.classList.add("open");
  }

  function logFood() {
    const food=selectedFood();
    const amountInput=document.getElementById("servingAmount"), unitInput=document.getElementById("servingUnit");
    const amount=Number(amountInput?.value), unit=unitInput?.value || food?.defaultUnit || food?.nutritionUnit || "g";
    if(!food){window.toast?.("Select a food first.");return;}
    if(!Number.isFinite(amount)||amount<=0){amountInput?.focus();window.toast?.("Enter a valid amount");return;}
    const calc=calculate(food,amount,unit);
    if(!calc || !Number.isFinite(Number(calc.cal))){window.toast?.("Nutrition calculation failed");return;}
    const state=window.state;
    if(!state)return;
    if(!Array.isArray(state.foodLog))state.foodLog=[];
    const isCustomCandidate = food.__macroforgeCustomCandidate === true || food.source === "User-created custom food";
    state.foodLog.push({id:`food_${Date.now()}_${Math.random().toString(36).slice(2)}`,name:food.name,amount,unit,cal:Number(calc.cal),p:Number(calc.p||0),c:Number(calc.c||0),f:Number(calc.f||0),fiber:Number(calc.fiber||0),sugar:Number(calc.sugar||0),sodium:Number(calc.sodium||0),date:window.today?.() || new Date().toISOString().slice(0,10),source:food.source||"MacroForge",barcode:food.barcode||"",equivalentGrams:Number(calc.equivalentGrams||0)});
    window.save?.(); window.modal?.("foodModal",false); window.updateDashboard?.(); renderLoggedFoods(); window.toast?.(`${food.name} logged`);

    // Custom-created foods are offered to the user AFTER they have actually been logged.
    // YES = save to the reusable Food Log list; NO = keep it only in Recent Foods.
    if(isCustomCandidate){
      setTimeout(()=>showFoodLibraryChoice(food,state),180);
    }
  }

  function renderLoggedFoods(){
    const box=document.getElementById("foodLogEntries"); if(!box)return;
    const today=window.today?.()||new Date().toISOString().slice(0,10);
    const items=(window.state?.foodLog||[]).filter(x=>x.date===today).slice().reverse();
    box.innerHTML=items.length?items.map((x,i)=>`<div class="history-item"><div><b>${esc(x.name)}</b><small>${x.amount} ${esc(x.unit)} · ${Math.round(Number(x.cal)||0)} kcal · P ${Number(x.p||0).toFixed(1)}g · C ${Number(x.c||0).toFixed(1)}g · F ${Number(x.f||0).toFixed(1)}g</small></div><button class="text-btn" type="button" data-del-food="${i}">Delete</button></div>`).join(""):"<div class='muted'>Nothing logged today.</div>";
    box.querySelectorAll("[data-del-food]").forEach(btn=>btn.onclick=()=>{const arr=(window.state.foodLog||[]).filter(x=>x.date===today).slice().reverse();const item=arr[Number(btn.dataset.delFood)];const idx=window.state.foodLog.indexOf(item);if(idx>-1){window.state.foodLog.splice(idx,1);window.save?.();window.updateDashboard?.();renderLoggedFoods();}});
  }

  function fillCustomFromGlobal(food){
    const servingMatch=String(food.quantity||"").match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|l)\b/i);
    const basis=servingMatch && /ml|l/i.test(servingMatch[2]) ? "ml" : "g";
    let size=100;
    if(servingMatch){size=Number(servingMatch[1]);if(/kg/i.test(servingMatch[2]))size*=1000;if(/l$/i.test(servingMatch[2]))size*=1000;}
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};
    set("customName",food.name);set("customBasis",basis);set("customServingSize",size);set("customUnit",basis);set("customCal",food.cal.toFixed(2));set("customProtein",food.p.toFixed(2));set("customCarbs",food.c.toFixed(2));set("customFat",food.f.toFixed(2));set("customFiber",food.fiber.toFixed(2));
    const box=document.getElementById("customGlobalResults");if(box)box.innerHTML=`<div class="lookup-selected"><b>Filled from ${esc(food.name)}</b><small>${esc(food.quantity||"Per 100 g")} · ${Math.round(food.cal)} kcal · P ${food.p.toFixed(1)}g · C ${food.c.toFixed(1)}g · F ${food.f.toFixed(1)}g</small></div>`;
    window.toast?.("Custom food fields filled from global result");
  }

  function installCustomGlobal(){
    const input=document.getElementById("customGlobalSearch"),button=document.getElementById("customGlobalSearchBtn"),box=document.getElementById("customGlobalResults");
    if(!input||!button||!box)return;
    let timer=null;
    const run=async()=>{const q=input.value.trim();if(q.length<2){box.innerHTML="<div class='muted'>Type at least 2 characters.</div>";return;}box.innerHTML="<div class='muted'>Searching global food database…</div>";try{const foods=ranked(await searchProducts(q,null,20),q,10);if(!foods.length){box.innerHTML="<div class='muted'>No reliable match.</div>";return;}box.innerHTML=foods.map((f,i)=>`<button type="button" class="lookup-result" data-index="${i}"><b>${esc(f.name)}</b><small>${esc(f.quantity||"Per 100 g")} · ${Math.round(f.cal)} kcal · P ${f.p.toFixed(1)}g · C ${f.c.toFixed(1)}g · F ${f.f.toFixed(1)}g</small></button>`).join("");box.querySelectorAll("[data-index]").forEach(b=>b.onclick=()=>fillCustomFromGlobal(foods[Number(b.dataset.index)]));}catch(e){box.innerHTML="<div class='muted'>Global lookup unavailable. Check your internet connection and retry.</div>";}};
    button.onclick=run;input.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();run();}};input.oninput=()=>{clearTimeout(timer);if(input.value.trim().length>=3)timer=setTimeout(run,700);};
  }

  function customCreate(){
    const get=id=>document.getElementById(id);
    const name=get("customName")?.value.trim();const basis=get("customBasis")?.value||"g";const unit=get("customUnit")?.value||basis;const size=Number(get("customServingSize")?.value);
    const cal=Number(get("customCal")?.value)||0,p=Number(get("customProtein")?.value)||0,c=Number(get("customCarbs")?.value)||0,f=Number(get("customFat")?.value)||0,fiber=Number(get("customFiber")?.value)||0;
    if(!name)return window.toast?.("Enter a food name");
    if(!Number.isFinite(size)||size<=0)return window.toast?.("Enter a valid serving size");
    if([cal,p,c,f,fiber].some(v=>v<0))return window.toast?.("Nutrition cannot be negative");
    const food={id:`custom_${Date.now()}`,name,roman:name,category:"Custom",cal,p,c,f,fiber,baseUnit:basis,nutritionUnit:basis,nutritionAmount:100,portionGrams:basis==="g"?size:(WEIGHTS[unit]||100),portionMl:basis==="ml"?size:null,defaultUnit:unit,unitWeights:{...WEIGHTS},servingSize:size,servingUnit:unit,source:"User-created custom food",__macroforgeCustomCandidate:true};
    window.state.customFoods=Array.isArray(window.state.customFoods)?window.state.customFoods:[];window.state.recentFoods=Array.isArray(window.state.recentFoods)?window.state.recentFoods:[];
    window.modal?.("customModal",false);setSelectedFood(food);window.openFood?.(food);window.renderFoods?.();window.toast?.(`${name} ready to log`);
  }

  function signOut(){
    localStorage.removeItem("macroforge_session_v1");
    localStorage.removeItem("macroforge_session");
    window.location.href="auth.html";
  }

  async function hashPassword(value){
    if(globalThis.crypto?.subtle){
      const bytes=new TextEncoder().encode(value);const d=await crypto.subtle.digest('SHA-256',bytes);
      return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
    }
    let h=2166136261;for(let i=0;i<value.length;i++)h=Math.imul(h^value.charCodeAt(i),16777619);return 'fallback_'+(h>>>0).toString(16);
  }

  function readAccounts(){
    const keys=['macroforge_accounts_v2','macroforge_accounts_v1'];const out=[];const seen=new Set();
    for(const key of keys){try{const arr=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(arr))arr.forEach(a=>{const n=String(a.usernameLower||a.username||'').toLowerCase();if(n&&!seen.has(n)){seen.add(n);out.push(a);}});}catch(e){}}
    return out;
  }
  function saveAccounts(accounts){localStorage.setItem('macroforge_accounts_v2',JSON.stringify(accounts));}

  function openAccountPage(){
    const existing=document.getElementById('mfAccountPage');
    if(existing){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));existing.classList.add('active');document.getElementById('pageTitle').textContent='Account';loadAccountPage();return;}
    const page=document.createElement('section');page.className='page active';page.id='mfAccountPage';
    page.innerHTML=`<div class="section-intro"><div><span class="pill">ACCOUNT</span><h2>Personal account</h2><p>Manage your local MacroForge account on this device.</p></div><button class="secondary-btn" type="button" id="mfAccountBack">← Back to Settings</button></div>
      <div class="account-page-grid">
        <section class="panel"><h3>Account details</h3><div class="account-detail-row"><span>Username</span><strong id="mfAccountCurrentUsername">—</strong></div><div class="account-detail-row"><span>Password</span><strong id="mfAccountPassword">••••••••</strong></div><div class="account-detail-row"><span>Email</span><strong id="mfAccountEmail">Not set</strong></div><p class="muted">Email is optional and is not used for verification in this local-account version. Passwords are stored as a one-way hash, so the existing password cannot be displayed; you can change it below.</p></section>
        <section class="panel"><h3>Email</h3><label>Email address<input id="mfNewEmail" type="email" autocomplete="email" placeholder="you@example.com"></label><button class="secondary-btn full" type="button" id="mfSaveEmail">Save email</button></section>
        <section class="panel"><h3>Change username</h3><label>New username<input id="mfNewUsername" maxlength="30" autocomplete="username"></label><button class="primary full" type="button" id="mfSaveUsername">Save username</button></section>
        <section class="panel"><h3>Change password</h3><label>Current password<input id="mfCurrentPassword" type="password" autocomplete="current-password"></label><label>New password<input id="mfNewPassword" type="password" minlength="6" autocomplete="new-password"></label><label>Confirm new password<input id="mfConfirmPassword" type="password" minlength="6" autocomplete="new-password"></label><button class="primary full" type="button" id="mfSavePassword">Change password</button></section>
        <section class="panel"><h3>Session</h3><p class="muted">You are signed in locally on this browser.</p><button class="danger-btn full" type="button" id="mfAccountSignOut">Sign out</button></section></div>`;
    document.querySelector('main')?.appendChild(page);
    document.getElementById('mfAccountBack').onclick=()=>{page.classList.remove('active');document.getElementById('settings')?.classList.add('active');document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page==='settings'));document.getElementById('pageTitle').textContent='Settings';};
    document.getElementById('mfSaveUsername').onclick=async()=>{const input=document.getElementById('mfNewUsername');const next=input.value.trim();if(!/^[A-Za-z0-9_.-]{3,30}$/.test(next))return window.toast?.('Username must be 3–30 characters.');const session=window.MacroForgeAuth?.user;if(!session)return window.toast?.('No active account.');const accounts=readAccounts();const idx=accounts.findIndex(a=>a.id===session.id || String(a.username).toLowerCase()===String(session.username).toLowerCase());if(idx<0)return window.toast?.('Account record not found.');const duplicate=accounts.some((a,i)=>i!==idx&&String(a.username||'').toLowerCase()===next.toLowerCase());if(duplicate)return window.toast?.('That username is already in use.');accounts[idx].username=next;accounts[idx].usernameLower=next.toLowerCase();saveAccounts(accounts);localStorage.setItem('macroforge_session_v1',JSON.stringify({...session,username:next}));loadAccountPage();window.toast?.('Username updated');};
    document.getElementById('mfSaveEmail').onclick=()=>{const input=document.getElementById('mfNewEmail');const email=String(input?.value||'').trim().toLowerCase();if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return window.toast?.('Enter a valid email address.');const session=window.MacroForgeAuth?.user;const accounts=readAccounts();const idx=accounts.findIndex(a=>a.id===session?.id || String(a.username).toLowerCase()===String(session?.username||'').toLowerCase());if(idx<0)return window.toast?.('Account record not found.');accounts[idx].email=email;saveAccounts(accounts);loadAccountPage();window.toast?.(email?'Email updated':'Email removed');};
    document.getElementById('mfSavePassword').onclick=async()=>{const cur=document.getElementById('mfCurrentPassword').value,next=document.getElementById('mfNewPassword').value,conf=document.getElementById('mfConfirmPassword').value;if(next.length<6)return window.toast?.('New password must be at least 6 characters.');if(next!==conf)return window.toast?.('New passwords do not match.');const session=window.MacroForgeAuth?.user;const accounts=readAccounts();const idx=accounts.findIndex(a=>a.id===session?.id || String(a.username).toLowerCase()===String(session?.username||'').toLowerCase());if(idx<0)return window.toast?.('Account record not found.');const oldHash=await hashPassword(cur);if(accounts[idx].passwordHash && accounts[idx].passwordHash!==oldHash && accounts[idx].password!==cur)return window.toast?.('Current password is incorrect.');accounts[idx].passwordHash=await hashPassword(next);delete accounts[idx].password;saveAccounts(accounts);document.getElementById('mfCurrentPassword').value='';document.getElementById('mfNewPassword').value='';document.getElementById('mfConfirmPassword').value='';window.toast?.('Password changed successfully');};
    document.getElementById('mfAccountSignOut').onclick=signOut;loadAccountPage();
  }
  function loadAccountPage(){const u=window.MacroForgeAuth?.user;const label=document.getElementById('mfAccountCurrentUsername');if(label)label.textContent=u?.username?`@${u.username}`:'Not signed in';const accounts=readAccounts();const a=accounts.find(x=>x.id===u?.id || String(x.username||'').toLowerCase()===String(u?.username||'').toLowerCase());const email=a?.email||'';const emailLabel=document.getElementById('mfAccountEmail');if(emailLabel)emailLabel.textContent=email||'Not set';const emailInput=document.getElementById('mfNewEmail');if(emailInput)emailInput.value=email;const nameInput=document.getElementById('mfNewUsername');if(nameInput)nameInput.value=u?.username||'';}

  function installSettings(){
    const p=window.state?.profile||{};const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??''};
    set('profileName',p.name);set('profileAge',p.age);set('profileSex',p.sex||'male');set('profileHeight',p.height);set('profileWeight',p.weight);set('profileActivity',p.activity||'moderate');set('unitSystem',p.unitSystem||'metric');
    document.getElementById('saveProfile')?.addEventListener('click',()=>{window.state.profile={name:document.getElementById('profileName')?.value.trim()||'',age:Number(document.getElementById('profileAge')?.value)||0,sex:document.getElementById('profileSex')?.value||'male',height:Number(document.getElementById('profileHeight')?.value)||0,weight:Number(document.getElementById('profileWeight')?.value)||0,activity:document.getElementById('profileActivity')?.value||'moderate',unitSystem:document.getElementById('unitSystem')?.value||'metric'};window.save?.();window.toast?.('Profile saved');},{once:true});
    document.getElementById('exportData')?.addEventListener('click',()=>window.mfExportData?.(),{once:true});
    document.getElementById('importDataBtn')?.addEventListener('click',()=>document.getElementById('importData')?.click(),{once:true});
    document.getElementById('importData')?.addEventListener('change',e=>window.mfImportData?.(e.target.files?.[0]),{once:true});
    document.getElementById('clearData')?.addEventListener('click',()=>window.mfClearAllData?.(),{once:true});
    const user=window.MacroForgeAuth?.user;const label=document.getElementById('settingsUsername');if(label)label.textContent=user?.username?`@${user.username}`:'Local account';
    const account=document.getElementById('settingsAccount');if(account)account.onclick=openAccountPage;
  }

  function bind(){
    installFoodSearch();installCustomGlobal();installSettings();
    const logButton=document.getElementById("confirmFood");if(logButton)logButton.onclick=logFood;
    const customButton=document.getElementById("saveCustom");if(customButton)customButton.onclick=customCreate;
    ["topSignOutButton","signOutButton"].forEach(id=>{const el=document.getElementById(id);if(el)el.onclick=signOut;});
    document.getElementById("servingAmount")?.addEventListener("input",()=>window.mfUpdateFoodNutritionPreview?.());
    document.getElementById("servingUnit")?.addEventListener("change",()=>window.mfUpdateFoodNutritionPreview?.());
    renderLoggedFoods();
  }

  window.mfSearchGlobal=globalSearch;window.searchGlobal=globalSearch;window.mfLogSelectedFood=logFood;
  window.mfRenderLoggedFoods=renderLoggedFoods;
  window.mfCustomCreate=customCreate;
  document.addEventListener("DOMContentLoaded",()=>setTimeout(bind,150),{once:true});
})();

/* =========================================================
   MACROFORGE V11 — SMART GOAL ONBOARDING + QUICK RE-LOG
   ========================================================= */
(function installSmartPlanAndQuickLog(){
  "use strict";

  const GOAL_COPY = {
    bulk: { label:"Bulk", adjustment:500 },
    moderate: { label:"Moderate", adjustment:0 },
    cut: { label:"Cut", adjustment:-500 }
  };

  const ACTIVITY = {
    sedentary:1.20,
    light:1.375,
    moderate:1.55,
    high:1.725,
    athlete:1.90
  };

  let selectedGoal = "moderate";

  function getState(){ return window.state || null; }
  function save(){ window.save?.(); }
  function today(){ return window.today?.() || new Date().toISOString().slice(0,10); }
  function num(v,d=0){ const n=Number(v); return Number.isFinite(n)?n:d; }
  function esc(v){ return String(v ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m])); }

  function ensureState(){
    const s=getState();
    if(!s)return null;
    s.profile=s.profile||{};
    s.goals=s.goals||{cal:2500,protein:150,carbs:300,fat:75,water:2500};
    s.recentFoods=Array.isArray(s.recentFoods)?s.recentFoods:[];
    s.recentWater=Array.isArray(s.recentWater)?s.recentWater:[];
    if(typeof s.onboardingComplete!=="boolean")s.onboardingComplete=false;
    return s;
  }

  function calculatePlan(data){
    const age=num(data.age), weight=num(data.weight), height=num(data.height);
    const targetWeight=num(data.targetWeight,weight);
    const weeks=Math.max(1,num(data.targetWeeks,12));
    const sex=data.sex==="female"?"female":"male";
    const activity=ACTIVITY[data.activity]||ACTIVITY.moderate;

    // Mifflin-St Jeor is a starting estimate only. MacroForge deliberately does NOT
    // convert an aggressive target-weight deadline into a huge calorie prescription.
    const bmr=10*weight+6.25*height-5*age+(sex==="male"?5:-161);
    const maintenance=Math.round(bmr*activity);
    const kgChange=targetWeight-weight;
    const weeklyTarget=kgChange/weeks;
    const pctWeekly=weight>0?(kgChange/weight)/weeks:0;

    // For adults, a conservative 5–15% surplus is a practical starting range.
    // For adolescents, the app must be more conservative: the AAP recommends gradual
    // weight gain and commonly cites ~300–500 kcal/day above baseline rather than
    // attempting to force a rapid target.
    const adolescent=age<18;
    const maxSurplus=adolescent?500:Math.round(maintenance*0.15);
    const minSurplus=adolescent?300:Math.round(maintenance*0.05);
    const requestedSurplus=Math.round(Math.abs(weeklyTarget)*7700/7);
    const adjustment=Math.min(maxSurplus,Math.max(minSurplus,requestedSurplus||minSurplus));
    const calories=Math.max(1400,maintenance+adjustment);

    // Protein is kept within a sensible training range rather than being used to
    // justify an extreme bulk.  1.6–1.8 g/kg is sufficient for the planning target.
    const protein=Math.round((1.7*weight)*10)/10;
    const fat=Math.round(Math.max(0.9*weight,(calories*0.25)/9)*10)/10;
    const carbs=Math.round(Math.max(0,(calories-protein*4-fat*9)/4)*10)/10;
    const safeWeeklyMin=adolescent?0.23:weight*0.0025;
    const safeWeeklyMax=adolescent?0.45:weight*0.005;
    const targetTooFast=weeklyTarget>safeWeeklyMax;
    const targetTooSlow=weeklyTarget>0 && weeklyTarget<safeWeeklyMin;
    const recommendedGain=Math.min(Math.max(safeWeeklyMin,weeklyTarget),safeWeeklyMax);
    const recommendedWeeks=kgChange>0?Math.ceil(kgChange/Math.max(safeWeeklyMax,0.01)):weeks;

    return {
      bmr:Math.round(bmr), maintenance, adjustment, calories:Math.round(calories),
      protein, fat, carbs, water:Math.max(2000,Math.round(weight*35)),
      goal:data.goal, goalLabel:GOAL_COPY[data.goal]?.label||"Moderate",
      targetWeight, weeks, kgChange:Math.round(kgChange*10)/10,
      projectedWeeklyRate:Math.round(weeklyTarget*100)/100,
      safeWeeklyMin:Math.round(safeWeeklyMin*100)/100,
      safeWeeklyMax:Math.round(safeWeeklyMax*100)/100,
      targetTooFast, targetTooSlow, recommendedGain:Math.round(recommendedGain*100)/100,
      recommendedWeeks, adolescent,
      proteinBasis:"1.7 g/kg bodyweight", fatBasis:"25% of calories, minimum 0.9 g/kg"
    };
  }

  function populateForm(){
    const s=ensureState(); if(!s)return;
    const p=s.profile||{};
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??"";};
    set("mfPlanAge",p.age||"");
    set("mfPlanSex",p.sex||"male");
    set("mfPlanHeight",p.height||"");
    set("mfPlanWeight",p.weight||"");
    set("mfPlanTargetWeight",p.targetWeight||p.weight||"");
    set("mfPlanWeeks",p.targetWeeks||"");
    set("mfPlanActivity",p.activity||"moderate");
    selectedGoal=p.goal||"moderate";
    document.querySelectorAll(".mf-goal-card").forEach(b=>b.classList.toggle("active",b.dataset.goal===selectedGoal));
    updatePreview();
  }

  function updatePreview(){
    const age=num(document.getElementById("mfPlanAge")?.value);
    const height=num(document.getElementById("mfPlanHeight")?.value);
    const weight=num(document.getElementById("mfPlanWeight")?.value);
    const targetWeight=num(document.getElementById("mfPlanTargetWeight")?.value,weight);
    const targetWeeks=num(document.getElementById("mfPlanWeeks")?.value,12);
    const sex=document.getElementById("mfPlanSex")?.value||"male";
    const activity=document.getElementById("mfPlanActivity")?.value||"moderate";
    const box=document.getElementById("mfPlanPreview");
    if(!box)return;
    if(age<13||height<=0||weight<=0){
      box.textContent="Choose your goal and enter your details to see the estimate.";
      return;
    }
    const plan=calculatePlan({age,height,weight,targetWeight,targetWeeks,sex,activity,goal:selectedGoal});
    const delta=plan.calories-plan.maintenance;
    const deltaText=delta>0?`+${delta}`:String(delta);
    const paceWarning = plan.targetTooFast
      ? `<div class="mf-plan-warning"><strong>Target deadline is too aggressive.</strong> ${plan.kgChange > 0 ? `${plan.kgChange} kg in ${plan.weeks} weeks is ${plan.projectedWeeklyRate} kg/week.` : ''} MacroForge will not turn that deadline into a dangerous calorie target. A safer planning range here is about ${plan.safeWeeklyMin}–${plan.safeWeeklyMax} kg/week, so the target would take roughly ${plan.recommendedWeeks}+ weeks.</div>`
      : '';
    box.innerHTML=`<strong>${esc(plan.goalLabel)} target: ${plan.calories} kcal/day</strong><br>Maintenance estimate: ${plan.maintenance} kcal · ${deltaText} kcal adjustment<br>Target: ${plan.targetWeight} kg in ${plan.weeks} weeks · ${plan.projectedWeeklyRate > 0 ? '+' : ''}${plan.projectedWeeklyRate} kg/week<br><b>Protein ${plan.protein}g</b> · Carbs ${plan.carbs}g · Fat ${plan.fat}g · Water ${plan.water} ml${paceWarning}<br><small>MacroForge uses a capped surplus instead of forcing calories from an unrealistic deadline. Targets should be recalibrated from your actual weight trend.</small>`;
  }

  function openOnboarding(force=false){
    const modal=document.getElementById("mfOnboarding"); if(!modal)return;
    populateForm();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
    const close=document.getElementById("mfOnboardingClose");
    if(close)close.style.display=force?"none":"block";
  }

  function closeOnboarding(){
    const s=ensureState();
    if(!s?.onboardingComplete)return;
    const modal=document.getElementById("mfOnboarding");
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden","true");
  }

  function renderPlanSummary(){
    const box=document.getElementById("planSummary");
    const dash=document.getElementById("dashboardPlanMeta");
    const s=ensureState();
    if(!s)return;
    const g=s.goals||{};
    const p=s.profile||{};
    if(!s.onboardingComplete){
      if(box)box.innerHTML=`<div class="muted">No personal plan yet. Complete the setup to calculate your targets automatically.</div>`;
      if(dash)dash.innerHTML=`<span class="pill">YOUR PLAN</span><strong>Complete your nutrition setup</strong><small>MacroForge will calculate maintenance and your calorie/macro targets.</small>`;
      return;
    }
    const delta=num(g.cal)-num(p.maintenance);
    const deltaText=delta>0?`+${delta}`:String(delta);
    if(box)box.innerHTML=`<div class="plan-stat"><span>Goal</span><b>${esc(p.goalLabel||"Moderate")}</b></div><div class="plan-stat"><span>Calories</span><b>${Math.round(g.cal)}</b></div><div class="plan-stat"><span>Protein</span><b>${Math.round(g.protein)}g</b></div><div class="plan-stat"><span>Carbs</span><b>${Math.round(g.carbs)}g</b></div><div class="plan-stat"><span>Fat</span><b>${Math.round(g.fat)}g</b></div><div class="plan-stat"><span>Target</span><b>${Math.round(p.targetWeight||0)} kg</b></div>`;
    if(dash)dash.innerHTML=`<span class="pill">${esc(String(p.goalLabel||"Moderate").toUpperCase())}</span><strong>${Math.round(g.cal)} kcal target</strong><small>Maintenance ${Math.round(p.maintenance||0)} kcal · ${deltaText} kcal adjustment · P ${Math.round(g.protein)}g · C ${Math.round(g.carbs)}g · F ${Math.round(g.fat)}g</small>`;
  }

  function savePlan(e){
    e.preventDefault();
    const s=ensureState(); if(!s)return;
    const data={
      age:num(document.getElementById("mfPlanAge")?.value),
      sex:document.getElementById("mfPlanSex")?.value||"male",
      height:num(document.getElementById("mfPlanHeight")?.value),
      weight:num(document.getElementById("mfPlanWeight")?.value),
      targetWeight:num(document.getElementById("mfPlanTargetWeight")?.value),
      targetWeeks:num(document.getElementById("mfPlanWeeks")?.value),
      activity:document.getElementById("mfPlanActivity")?.value||"moderate",
      goal:selectedGoal
    };
    if(data.age<13||data.age>100)return window.toast?.("Enter an age between 13 and 100.");
    if(data.height<100||data.height>250)return window.toast?.("Enter a valid height.");
    if(data.weight<25||data.weight>300)return window.toast?.("Enter a valid current weight.");
    if(data.targetWeight<25||data.targetWeight>300)return window.toast?.("Enter a valid target weight.");
    if(data.targetWeeks<1||data.targetWeeks>520)return window.toast?.("Enter a timeframe between 1 and 520 weeks.");
    if(selectedGoal==="bulk" && data.targetWeight<=data.weight)return window.toast?.("For a bulk, target weight should be above current weight.");
    if(selectedGoal==="cut" && data.targetWeight>=data.weight)return window.toast?.("For a cut, target weight should be below current weight.");
    const plan=calculatePlan(data);
    s.profile={...(s.profile||{}),...data,maintenance:plan.maintenance,bmr:plan.bmr,goalLabel:plan.goalLabel,targetWeight:plan.targetWeight,targetWeeks:plan.weeks};
    s.goals={...(s.goals||{}),cal:plan.calories,protein:plan.protein,carbs:plan.carbs,fat:plan.fat,water:plan.water};
    s.onboardingComplete=true;
    save();
    closeOnboarding();
    renderPlanSummary();
    window.updateDashboard?.();
    window.renderProgress?.();
    window.toast?.(`${plan.goalLabel} plan created: ${plan.calories} kcal/day`);
  }

  function pushRecentFood(food,amount,unit){
    const s=ensureState(); if(!s||!food)return;
    const cleaned={...food};
    delete cleaned.__macroforgeCustomCandidate;
    const key=String(food.id||food.name).toLowerCase();
    s.recentFoods=s.recentFoods.filter(x=>String(x.key||x.food?.id||x.food?.name).toLowerCase()!==key);
    s.recentFoods.unshift({key,food:cleaned,amount:Number(amount),unit:String(unit)});
    s.recentFoods=s.recentFoods.slice(0,12);
    save();
  }

  function nutritionFor(food,amount,unit){
    try{return window.mfCalculatePortion?.(food,amount,unit);}catch(e){return null;}
  }

  function quickLogRecent(index){
    const s=ensureState(); const item=s?.recentFoods?.[index];
    if(!item)return;
    const calc=nutritionFor(item.food,item.amount,item.unit);
    if(!calc||!Number.isFinite(Number(calc.cal)))return window.toast?.("Could not calculate that food.");
    s.foodLog=Array.isArray(s.foodLog)?s.foodLog:[];
    s.foodLog.push({id:`food_${Date.now()}_${Math.random().toString(36).slice(2)}`,name:item.food.name,amount:item.amount,unit:item.unit,cal:Number(calc.cal),p:Number(calc.p||0),c:Number(calc.c||0),f:Number(calc.f||0),fiber:Number(calc.fiber||0),sugar:Number(calc.sugar||0),sodium:Number(calc.sodium||0),date:today(),source:item.food.source||"MacroForge",barcode:item.food.barcode||"",equivalentGrams:Number(calc.equivalentGrams||0)});
    // Move the item to the front so the most-used foods remain one click away.
    s.recentFoods.splice(index,1);s.recentFoods.unshift(item);
    save();
    renderRecentFoods();
    window.updateDashboard?.();
    window.mfRenderLoggedFoods?.();
    window.toast?.(`${item.food.name} logged again`);
  }

  function renderRecentFoods(){
    const box=document.getElementById("recentFoodEntries"); if(!box)return;
    const s=ensureState(); const items=s?.recentFoods||[];
    if(!items.length){box.innerHTML=`<div class="muted">Your recently logged foods and drinks will appear here after your first log.</div>`;return;}
    box.innerHTML=items.map((item,i)=>`<div class="recent-food-card"><div><b>${esc(item.food?.name||"Food")}</b><small>${esc(item.amount)} ${esc(item.unit)} · repeat same portion</small></div><button class="primary small" type="button" data-relog-recent="${i}">Log again</button></div>`).join("");
    box.querySelectorAll("[data-relog-recent]").forEach(b=>b.onclick=()=>quickLogRecent(Number(b.dataset.relogRecent)));
  }

  function patchFoodLogger(){
    // The existing strict logger remains responsible for nutrition correctness.
    // We only observe the saved food log and attach a reusable recent-food entry.
    const originalPush=Array.prototype.push;
    if(window.__mfRecentFoodPatched)return;
    window.__mfRecentFoodPatched=true;
    let lastSeen=0;
    const watch=()=>{
      const s=ensureState(); if(!s)return;
      const logs=s.foodLog||[];
      const newest=logs[logs.length-1];
      if(newest && newest.id!==lastSeen){
        lastSeen=newest.id;
        // Find the matching food in the app's current sources.
        const candidates=[...(window.MF_LOCAL_RECORDS||[]),...(window.MF_EXTRA_GYM_FOODS||[]),...(s.customFoods||[]),...(window.MacroForgeFinal?.CURATED||[])];
        let food=candidates.find(f=>String(f.name).toLowerCase()===String(newest.name).toLowerCase());
        if(!food && window.selectedFood && String(window.selectedFood.name).toLowerCase()===String(newest.name).toLowerCase())food=window.selectedFood;
        if(food)pushRecentFood(food,newest.amount,newest.unit);
        renderRecentFoods();
      }
    };
    // Polling is deliberately lightweight and catches logs from both app.js and macroforge-fixes.js.
    setInterval(watch,500);
  }

  function renderDynamicDashboard(){
    const s=ensureState();
    if(!s)return;
    const g=s.goals||{};
    const p=s.profile||{};
    const foods=(s.foodLog||[]).filter(x=>x.date===today());
    const cal=foods.reduce((a,x)=>a+num(x.cal),0);
    const protein=foods.reduce((a,x)=>a+num(x.p),0);
    const carbs=foods.reduce((a,x)=>a+num(x.c),0);
    const fat=foods.reduce((a,x)=>a+num(x.f),0);
    const water=(s.waterLog||[]).filter(x=>x.date===today()).reduce((a,x)=>a+num(x.amount||x.ml),0);
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    const pct=(v,t)=>t?Math.min(100,Math.round(v/t*100)):0;
    const remaining=Math.max(0,num(g.cal)-cal);
    set('mfDashGreeting',new Date().getHours()<12?'Good morning.':new Date().getHours()<18?'Good afternoon.':'Good evening.');
    set('mfDashGoalLabel',p.goalLabel||'Your plan');
    set('mfDashRemaining',`${Math.round(remaining)} kcal`);
    set('mfDashMealCount',String(foods.length));
    set('mfDashWater',`${Math.round(water)} / ${Math.round(g.water||2500)} ml`);
    set('mfDashTarget',p.targetWeight?`${p.targetWeight} kg`:'—');
    set('mfDashPace',p.targetWeeks?`${p.projectedWeeklyRate>0?'+':''}${num(p.projectedWeeklyRate).toFixed(2)} kg/week`:'—');
    const vals=[['mfDashCalFill',cal,g.cal],['mfDashProteinFill',protein,g.protein],['mfDashCarbFill',carbs,g.carbs],['mfDashFatFill',fat,g.fat],['mfDashWaterFill',water,g.water]];
    vals.forEach(([id,v,t])=>{const e=document.getElementById(id);if(e)e.style.width=pct(v,t)+'%';});
    set('mfDashCalPct',`${pct(cal,g.cal)}%`);
    set('mfDashProteinPct',`${pct(protein,g.protein)}%`);
    set('mfDashCarbPct',`${pct(carbs,g.carbs)}%`);
    set('mfDashFatPct',`${pct(fat,g.fat)}%`);
    const focus=document.getElementById('mfDashFocus');
    if(focus){
      const proteinLeft=Math.max(0,num(g.protein)-protein);
      const waterLeft=Math.max(0,num(g.water)-water);
      focus.innerHTML= proteinLeft>0
        ? `<b>${Math.round(proteinLeft)}g protein left</b><span>Prioritize a protein-rich meal next.</span>`
        : waterLeft>0
          ? `<b>Protein target reached</b><span>${Math.round(waterLeft)} ml water left for today's hydration goal.</span>`
          : `<b>Targets looking strong</b><span>Keep logging meals, water and training to complete the day.</span>`;
    }
  }

  function install(){
    const s=ensureState(); if(!s)return;
    document.querySelectorAll(".mf-goal-card").forEach(btn=>btn.addEventListener("click",()=>{selectedGoal=btn.dataset.goal||"moderate";document.querySelectorAll(".mf-goal-card").forEach(b=>b.classList.toggle("active",b===btn));updatePreview();}));
    ["mfPlanAge","mfPlanHeight","mfPlanWeight","mfPlanTargetWeight","mfPlanWeeks","mfPlanSex","mfPlanActivity"].forEach(id=>document.getElementById(id)?.addEventListener("input",updatePreview));
    document.getElementById("mfPlanSex")?.addEventListener("change",updatePreview);
    document.getElementById("mfPlanActivity")?.addEventListener("change",updatePreview);
    document.getElementById("mfOnboardingForm")?.addEventListener("submit",savePlan);
    document.getElementById("mfOnboardingClose")?.addEventListener("click",closeOnboarding);
    document.getElementById("editPlanButton")?.addEventListener("click",()=>openOnboarding(false));
    renderPlanSummary();
    renderRecentFoods();
    renderDynamicDashboard();
    patchFoodLogger();
    setInterval(renderDynamicDashboard,800);
    if(!s.onboardingComplete)setTimeout(()=>openOnboarding(true),300);
  }

  window.MacroForgePlan={calculate:calculatePlan,open:()=>openOnboarding(false)};
  window.mfRenderRecentFoods=renderRecentFoods;
  window.mfQuickLogRecent=quickLogRecent;
  document.addEventListener("DOMContentLoaded",()=>setTimeout(install,250),{once:true});
})();

/* =========================================================
   MACROFORGE V13 — DYNAMIC PAKISTANI FUEL COACH + SCIENCE PULSE
   ========================================================= */
(function installDynamicForgeLayer(){
  "use strict";
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const todayKey=()=>window.today?.()||new Date().toISOString().slice(0,10);
  const getState=()=>window.state||null;
  const foods=[
    {name:"Chicken Tikka + Roti",components:[["Chicken Tikka",2,"piece"],["Roti",2,"piece"]],tag:"high protein + carbohydrate"},
    {name:"Chicken Karahi + Roti",components:[["Chicken Karahi",1,"plate"],["Roti",1,"piece"]],tag:"balanced Pakistani meal"},
    {name:"Daal + Rice + Raita",components:[["Lentil Curry",1,"bowl"],["White Rice",200,"g"],["Raita",1,"bowl"]],tag:"carbohydrate + fiber + protein"},
    {name:"Chicken Biryani + Raita",components:[["Biryani",1,"plate"],["Raita",1,"bowl"]],tag:"higher-carbohydrate meal"},
    {name:"Qeema + Roti",components:[["Qeema",1,"plate"],["Roti",2,"piece"]],tag:"protein + energy"},
    {name:"Chana + Roti",components:[["Chickpea Curry",1,"bowl"],["Roti",2,"piece"]],tag:"fiber + carbohydrate"},
    {name:"Eggs + Paratha",components:[["Boiled Egg",2,"piece"],["Paratha",1,"piece"]],tag:"breakfast protein + carbohydrate"},
    {name:"Chicken Shawarma",components:[["Chicken Shawarma",1,"wrap"]],tag:"convenient protein-rich meal"}
  ];
  function totals(){
    const s=getState(); if(!s)return {cal:0,p:0,c:0,f:0,water:0,meals:0};
    const d=todayKey(); const log=Array.isArray(s.foodLog)?s.foodLog.filter(x=>x.date===d):[];
    const water=Array.isArray(s.waterLog)?s.waterLog.filter(x=>x.date===d).reduce((a,x)=>a+n(x.amount??x.ml),0):0;
    return {cal:log.reduce((a,x)=>a+n(x.cal),0),p:log.reduce((a,x)=>a+n(x.p),0),c:log.reduce((a,x)=>a+n(x.c),0),f:log.reduce((a,x)=>a+n(x.f),0),water,meals:log.length};
  }
  function libraryFood(name){
    const s=getState();
    const all=[...(window.MF_LOCAL_RECORDS||[]),...(window.MF_EXTRA_GYM_FOODS||[]),...(s?.customFoods||[])];
    return all.find(f=>String(f.name).toLowerCase()===name.toLowerCase()) || all.find(f=>String(f.name).toLowerCase().includes(name.toLowerCase()));
  }
  function mealNutrition(meal){
    return meal.components.reduce((a,[name,amount,unit])=>{
      const f=libraryFood(name); if(!f || typeof window.mfCalculatePortion!=="function") return a;
      const x=window.mfCalculatePortion(f,amount,unit); return {cal:a.cal+x.cal,p:a.p+x.p,c:a.c+x.c,f:a.f+x.f};
    },{cal:0,p:0,c:0,f:0});
  }
  function logSuggestedMeal(index){
    const meal=foods[index], s=getState(); if(!meal||!s)return;
    meal.components.forEach(([name,amount,unit])=>{
      const f=libraryFood(name); if(!f||typeof window.mfCalculatePortion!=="function")return;
      const x=window.mfCalculatePortion(f,amount,unit);
      s.foodLog=s.foodLog||[]; s.foodLog.push({id:`meal_${Date.now()}_${Math.random()}`,name:f.name,amount,unit,cal:Number(x.cal),p:Number(x.p),c:Number(x.c),f:Number(x.f),fiber:Number(x.fiber||0),date:todayKey(),source:"Pakistani Fuel Coach"});
    });
    window.save?.(); window.updateDashboard?.(); window.renderFoods?.(); window.toast?.(`${meal.name} logged from the Food Log library`);
  }
  function renderCoach(){
    const box=document.getElementById("mfMealCoach"), title=document.getElementById("mfMealCoachTitle"); if(!box)return;
    const s=getState(); const g=s?.goals||{}; const t=totals();
    if(!s?.onboardingComplete){box.innerHTML='<div class="mf-coach-empty"><b>Build your plan first.</b><span>MacroForge needs your goal, bodyweight and activity before it can match Pakistani meals to your targets.</span></div>';return;}
    const rp=Math.max(0,n(g.protein)-t.p), rc=Math.max(0,n(g.carbs)-t.c), rf=Math.max(0,n(g.fat)-t.f), rk=Math.max(0,n(g.cal)-t.cal);
    const ranked=foods.map((m,i)=>{const x=mealNutrition(m);return {...m,index:i,...x,score:Math.abs(x.p-rp)*1.7+Math.abs(x.c-rc)*.7+Math.abs(x.f-rf)*.5+Math.abs(x.cal-rk)/80};}).sort((a,b)=>a.score-b.score);
    const best=ranked[0]; if(!best){box.innerHTML='<div class="muted">No meal could be matched to your current plan.</div>';return;}
    title.textContent=rp>20?"Protein is your next priority":rk<300?"You're close to today's calorie target":"Keep the day balanced";
    box.innerHTML=`<div class="mf-coach-main"><div><span class="pill">SUGGESTED NEXT MEAL</span><h4>${best.name}</h4><p>${best.tag} · approx ${Math.round(best.cal)} kcal · P ${best.p.toFixed(1)}g · C ${best.c.toFixed(1)}g · F ${best.f.toFixed(1)}g</p><small>Every component is already available in Food Log.</small></div><button class="secondary-btn" type="button" id="mfCoachLogMeal">Log this meal</button></div><div class="mf-coach-remaining"><span>Remaining</span><b>${Math.round(rk)} kcal</b><b>${Math.round(rp)}g P</b><b>${Math.round(rc)}g C</b><b>${Math.round(rf)}g F</b></div>`;
    document.getElementById("mfCoachLogMeal")?.addEventListener("click",()=>logSuggestedMeal(best.index));
  }
  function renderSciencePulse(){
    const box=document.getElementById("mfSciencePulse"), title=document.getElementById("mfSciencePulseTitle"); if(!box)return;
    const s=getState(); const t=totals(); const g=s?.goals||{}; const p=s?.profile||{};
    let headline="Protein distribution matters."; let text="Spread protein across several meals rather than trying to cram the entire target into one sitting.";
    if(t.water<n(g.water)*0.4){headline="Hydration is lagging.";text=`You've logged about ${Math.round(t.water)} ml of your ${Math.round(n(g.water))} ml target. Fluid needs vary with heat, training duration and sweat rate; bring intake up gradually rather than forcing a large amount at once.`;}
    else if(t.p<n(g.protein)*0.45 && t.cal>0.25*n(g.cal)){headline="Protein is lagging.";text=`You're at about ${Math.round(t.p)} g of your ${Math.round(n(g.protein))} g target. A protein-rich Pakistani meal such as chicken tikka, eggs, daal plus yogurt, or lean qeema can help close the gap.`;}
    else if(t.c<0.45*n(g.carbs) && t.cal>0.35*n(g.cal)){headline="Carbohydrate is lagging.";text="For hard resistance training, carbohydrate is useful training fuel. Rice, roti, potatoes, fruit and daal can raise carbohydrate intake without requiring a large amount of added fat.";}
    else if(t.p>=n(g.protein)){headline="Protein target reached.";text=`You've reached about ${Math.round(t.p)} g today. Keep the rest of the day focused on total energy, carbohydrate, fat and overall food quality.`;}
    if(title)title.textContent=headline;
    box.innerHTML=`<b>${headline}</b><span>${text}</span><small>${p.goalLabel||"Your plan"} · P ${Math.round(n(g.protein))}g · C ${Math.round(n(g.carbs))}g · F ${Math.round(n(g.fat))}g</small>`;
  }
  function renderScienceTrend(){
    const s=getState(); const out=document.getElementById("scienceTrend"), text=document.getElementById("scienceTrendText"); if(!out||!text||!s)return;
    const entries=Array.isArray(s.weights)?s.weights.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))):[];
    if(!entries.length){out.textContent="No weigh-ins yet";text.textContent="Log your bodyweight today. One measurement is useful as a baseline; repeated measurements are more informative for trend tracking.";return;}
    if(entries.length===1){out.textContent=`Baseline ${n(entries[0].kg).toFixed(1)} kg`;text.textContent=`Baseline recorded on ${entries[0].date}. Add another weigh-in on a different day to calculate a trend.`;return;}
    const first=n(entries[0].kg), last=n(entries[entries.length-1].kg), change=last-first;
    out.textContent=`${change>0?"+":""}${change.toFixed(1)} kg trend`;
    text.textContent=`${entries.length} weigh-ins from ${entries[0].date} to ${entries[entries.length-1].date}. MacroForge uses the trend as context rather than treating a single weigh-in as proof of progress.`;
  }
  function renderScienceLab(){
    const s=getState(); if(!s)return;
    const g=s.goals||{}, p=s.profile||{}, t=totals();
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('scienceLiveCalories',`${Math.round(t.cal)} / ${Math.round(n(g.cal))} kcal`);
    set('scienceLiveProtein',`${Math.round(t.p)} / ${Math.round(n(g.protein))} g`);
    set('scienceLiveWater',`${Math.round(t.water)} / ${Math.round(n(g.water))} ml`);
    set('scienceLiveTarget',p.targetWeight?`${p.targetWeight} kg`:'—');
    const hour=new Date().getHours();
    const workout=s.activeWorkout;
    let title='Daily timing guide', body='Spread protein-containing meals across the day and place carbohydrate around demanding training when useful.';
    if(workout){title='You are in a training session';body='During resistance training, focus on fluids and training quality. Your next substantial meal can include protein plus carbohydrate to support recovery and replenish energy.';}
    else if(hour<11){title='Morning fuel';body='Build your first substantial meal around protein, then add carbohydrate and fruit or vegetables according to your calorie and training needs.';}
    else if(hour<16){title='Midday strategy';body='If you train later, a familiar meal with protein and carbohydrate can fit well before training. Keep fat and very large portions lower if they make you uncomfortable during training.';}
    else if(hour<21){title='Post-training / evening';body='If you trained today, a normal protein-containing meal is sufficient; you do not need to chase a mythical minute-long anabolic window. Total daily intake matters most.';}
    else {title='Late evening';body='If your protein target is still short, a convenient protein-rich food can close the gap. A normal balanced meal is fine; avoid forcing food simply because the clock says so.';}
    set('scienceTimingTitle',title);set('scienceTimingText',body);
    const pulse=document.getElementById('scienceDynamicFact');
    if(pulse){
      const facts=[
        ['Protein distribution','ISSN recommends distributing protein doses across the day, commonly every 3–4 hours, rather than concentrating everything into one meal.'],
        ['Pre/post workout','Protein consumed before or after resistance training can support muscle protein synthesis; the overall daily target remains more important than obsessing over a tiny timing window.'],
        ['Carbohydrate + training','Carbohydrate is a major fuel source for high-intensity training. When training volume is high, matching carbohydrate intake to workload can help support performance and glycogen restoration.'],
        ['Hydration','Hydration should respond to fluid losses, environment and sweat rate. Avoid treating a fixed water number as a universal physiological requirement.'],
        ['Pakistani food accuracy','Karahi, biryani, nihari and similar dishes can vary substantially with oil and portion size. Weighing the finished portion gives a better estimate than assuming every recipe is identical.']
      ];
      const idx=(new Date().getDate()+t.meals+Math.round(t.water/500))%facts.length;
      pulse.innerHTML=`<span class="pill">EVIDENCE NOTE</span><h3>${facts[idx][0]}</h3><p>${facts[idx][1]}</p><small>MacroForge distinguishes evidence-based principles from recipe estimates.</small>`;
    }
  }
  function refresh(){renderCoach();renderSciencePulse();renderScienceTrend();renderScienceLab();}
  window.MacroForgeDynamic= {refresh};
  const old=window.updateDashboard;
  window.updateDashboard=function(){ if(typeof old==='function')old(); refresh(); };
  document.addEventListener("DOMContentLoaded",()=>setTimeout(refresh,400));
  setInterval(()=>{if(document.visibilityState!=="hidden")refresh();},5000);
})();

/* =========================================================
   MACROFORGE V15 — OPTIONAL CREATINE TRACKER
   ========================================================= */
(function installCreatineTracker(){
  "use strict";
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const key=()=>window.today?.()||new Date().toISOString().slice(0,10);
  function st(){return window.state||null;}
  function ensure(){
    const s=st(); if(!s)return null;
    s.creatine=s.creatine||{enabled:false,protocol:"maintenance",maintenanceDose:5,loadingDose:20,loadingDays:7,startDate:key(),logs:[]};
    s.creatine.logs=Array.isArray(s.creatine.logs)?s.creatine.logs:[];
    return s.creatine;
  }
  function dateOffset(base,days){const d=new Date(base+"T12:00:00");d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}
  function targetForDate(date,c){
    if(!c.enabled||c.protocol==="none")return 0;
    if(c.protocol==="loading"&&c.startDate){
      const diff=Math.floor((new Date(date+"T12:00:00")-new Date(c.startDate+"T12:00:00"))/86400000);
      if(diff>=0&&diff<c.loadingDays)return n(c.loadingDose);
    }
    return n(c.maintenanceDose);
  }
  function doseForDate(date,c){return c.logs.filter(x=>x.date===date).reduce((a,x)=>a+n(x.grams),0);}
  function save(){window.save?.();}
  function render(){
    const c=ensure(); if(!c)return;
    const enabled=document.getElementById('creatineEnabled');
    if(enabled)enabled.checked=!!c.enabled;
    document.getElementById('creatineSetupBody')?.toggleAttribute('hidden',!c.enabled);
    document.getElementById('creatineDisabled')?.toggleAttribute('hidden',c.enabled);
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    const today=key(), target=targetForDate(today,c), dose=doseForDate(today,c);
    set('creatineTodayDose',`${dose.toFixed(1)} g`);set('creatineTodayTarget',target?`Target ${target.toFixed(1)} g`:'Tracking only');
    set('creatineTodayStatus',target&&dose>=target?'Completed':dose>0?'Partial':'Not logged');
    const date=new Date(today+"T12:00:00"), y=date.getFullYear(), m=date.getMonth();
    const monthDays=new Date(y,m+1,0).getDate();let monthTotal=0,monthLogged=0;
    for(let d=1;d<=monthDays;d++){const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,v=doseForDate(ds,c);monthTotal+=v;if(v>0)monthLogged++;}
    set('creatineMonthTitle',date.toLocaleDateString(undefined,{month:'long',year:'numeric'}));set('creatineMonthDays',monthLogged);set('creatineMonthGrams',`${monthTotal.toFixed(1)} g`);set('creatineMonthAvg',`${(monthTotal/monthDays).toFixed(1)} g/day`);
    const grid=document.getElementById('creatineMonthGrid');
    if(grid){grid.innerHTML='';for(let d=1;d<=monthDays;d++){const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,v=doseForDate(ds,c),el=document.createElement('div');el.className='mf-creatine-day'+(v>0?' done':'');el.title=`${ds}: ${v.toFixed(1)} g`;el.textContent=d;grid.appendChild(el);}}
    const yearStart=new Date(y,0,1),yearEnd=new Date(y+1,0,1), totalDays=Math.round((yearEnd-yearStart)/86400000);let yd=0,yg=0;
    for(let i=0;i<totalDays;i++){const ds=dateOffset(`${y}-01-01`,i),v=doseForDate(ds,c);if(v>0)yd++;yg+=v;}
    set('creatineYearDays',yd);set('creatineYearGrams',`${yg.toFixed(1)} g`);set('creatineYearConsistency',`${Math.round(yd/totalDays*100)}%`);
    const bars=document.getElementById('creatineYearBars');if(bars){bars.innerHTML='';for(let mm=0;mm<12;mm++){let grams=0;const days=new Date(y,mm+1,0).getDate();for(let d=1;d<=days;d++)grams+=doseForDate(`${y}-${String(mm+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,c);const el=document.createElement('div');el.className='mf-creatine-month-bar';el.style.setProperty('--h',`${Math.max(4,Math.min(100,grams/Math.max(1,days*n(c.maintenanceDose))*100))}%`);el.title=`${date.toLocaleString(undefined,{month:'short'})}: ${grams.toFixed(0)} g`;bars.appendChild(el);}}
  }
  function install(){
    const c=ensure();if(!c)return;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??'';};
    set('creatineProtocol',c.protocol);set('creatineMaintenanceDose',c.maintenanceDose);set('creatineLoadingDose',c.loadingDose);set('creatineLoadingDays',c.loadingDays);set('creatineStartDate',c.startDate||key());
    document.getElementById('creatineEnabled')?.addEventListener('change',e=>{c.enabled=e.target.checked;save();render();});
    document.getElementById('saveCreatinePlan')?.addEventListener('click',()=>{c.protocol=document.getElementById('creatineProtocol').value;c.maintenanceDose=n(document.getElementById('creatineMaintenanceDose').value)||5;c.loadingDose=n(document.getElementById('creatineLoadingDose').value)||20;c.loadingDays=Math.max(1,Math.round(n(document.getElementById('creatineLoadingDays').value)||7));c.startDate=document.getElementById('creatineStartDate').value||key();c.enabled=true;save();render();window.toast?.('Creatine plan saved');});
    document.getElementById('logCreatine')?.addEventListener('click',()=>{if(!c.enabled){window.toast?.('Enable creatine tracking first');return;}const grams=n(document.getElementById('creatineLogAmount').value);if(grams<=0)return;const d=key();c.logs.push({date:d,grams,time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})});save();render();window.updateDashboard?.();window.toast?.(`${grams} g creatine logged`);});
    render();
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(install,500),{once:true});
  setInterval(()=>{if(document.visibilityState!=='hidden')render();},5000);
})();
