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
    const n = product?.nutriments || {};
    let kcal = Number(n["energy-kcal_100g"] ?? n["energy-kcal"]);
    if (!Number.isFinite(kcal)) {
      const kj = Number(n["energy_100g"] ?? n["energy"]);
      kcal = Number.isFinite(kj) ? kj / 4.184 : 0;
    }
    const value = key => Math.max(0, Number(n[`${key}_100g`] ?? n[key] ?? 0) || 0);
    return {
      cal: Math.max(0, kcal || 0), p:value("proteins"), c:value("carbohydrates"),
      f:value("fat"), fiber:value("fiber"), sugar:value("sugars"), sodium:value("sodium")
    };
  }

  function extract(data) {
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.hits)) return data.hits.map(x => x?._source || x?.document || x).filter(Boolean);
    if (Array.isArray(data?.results)) return data.results.map(x => x?._source || x?.document || x).filter(Boolean);
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

  async function searchProducts(query, signal, limit = 30) {
    const q = String(query || "").trim();
    if (!q) return [];
    const targets = [
      async () => fetchJSON("https://search.openfoodfacts.org/search", {
        method:"POST", signal, headers:{"Content-Type":"application/json"},
        body:JSON.stringify({q, langs:["en"], page:1, page_size:limit, boost_phrase:true})
      }),
      async () => fetchJSON("https://search.openfoodfacts.org/search?q=" + encodeURIComponent(q) +
        "&langs=en&page=1&page_size=" + limit + "&boost_phrase=true", {signal}),
      async () => fetchJSON("https://world.openfoodfacts.org/cgi/search.pl?action=process&json=1&search_simple=1&search_terms=" +
        encodeURIComponent(q) + "&page=1&page_size=" + limit + "&lc=en&fields=" + encodeURIComponent(OFF_FIELDS), {signal}),
      async () => fetchJSON("https://us.openfoodfacts.org/cgi/search.pl?action=process&json=1&search_simple=1&search_terms=" +
        encodeURIComponent(q) + "&page=1&page_size=" + limit + "&lc=en&fields=" + encodeURIComponent(OFF_FIELDS), {signal})
    ];
    let last = null;
    for (const target of targets) {
      try {
        const data = await target();
        const products = extract(data);
        if (products.length) return products;
      } catch (e) {
        last = e;
        if (e.name === "AbortError") throw e;
      }
    }
    throw last || new Error("No global search endpoint returned results");
  }

  function score(product, query) {
    const q = norm(query), tokens = q.split(/\s+/).filter(Boolean);
    const names = [product.product_name_en, product.product_name, product.generic_name_en, product.generic_name]
      .filter(Boolean).map(norm);
    const brands = String(product.brands || "").split(",").map(norm).filter(Boolean);
    const all = [...names, ...brands].join(" ");
    if (!tokens.every(t => all.includes(t))) return -1;
    let s = 0;
    for (const name of names) {
      if (name === q) s += 10000;
      else if (name.startsWith(q)) s += 5000;
      else if (name.includes(q)) s += 2000;
    }
    for (const brand of brands) {
      if (brand === q) s += 1200;
      else if (brand.includes(q)) s += 500;
    }
    const n = nutrition(product);
    if (n.cal || n.p || n.c || n.f) s += 500;
    return s;
  }

  function toFood(product, query) {
    const names = [product.product_name_en, product.product_name, product.generic_name_en, product.generic_name].filter(Boolean);
    const q = norm(query);
    const name = names.find(x => norm(x) === q) || names.find(x => norm(x).includes(q)) || names[0] || query;
    const n = nutrition(product);
    return {
      id: product.code ? `global_${product.code}` : `global_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name, roman: product.brands ? `Brand: ${product.brands}` : "Global food", category:"Global",
      cal:n.cal,p:n.p,c:n.c,f:n.f,fiber:n.fiber,sugar:n.sugar,sodium:n.sodium,
      baseUnit:"g", nutritionUnit:"g", nutritionAmount:100, portionGrams:1, defaultUnit:"g",
      quantity:product.quantity || product.serving_size || "Per 100 g", source:"Open Food Facts",
      barcode:product.code || "", image:product.image_front_small_url || ""
    };
  }

  function ranked(products, query, max = 20) {
    const seen = new Set();
    return products.map(p => ({p,s:score(p,query)})).filter(x => x.s >= 500)
      .sort((a,b) => b.s-a.s).map(x => toFood(x.p,query)).filter(f => {
        const k = `${f.barcode}|${norm(f.name)}`;
        if (seen.has(k)) return false; seen.add(k); return true;
      }).slice(0,max);
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
      const foods = ranked(await searchProducts(q, SEARCH.controller.signal, 40), q, 20);
      if (request !== SEARCH.request) return;
      loading.remove();
      if (!foods.length) {
        const e = document.createElement("div"); e.className="empty-state mf-global-error"; e.style.gridColumn="1/-1";
        e.innerHTML=`<h3>No reliable match</h3><p>Try the exact product or brand name.</p>`; box.prepend(e); return;
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
      setTimeout(()=>{
        const add=window.confirm(`Add “${food.name}” to your Food Log list?\n\nOK = add to Food Log list\nCancel = keep in Recent Foods only`);
        if(!Array.isArray(state.customFoods))state.customFoods=[];
        if(!Array.isArray(state.recentFoods))state.recentFoods=[];
        if(add){
          const clean={...food};
          delete clean.__macroforgeCustomCandidate;
          const existing=state.customFoods.findIndex(x=>x.id===clean.id || String(x.name).toLowerCase()===String(clean.name).toLowerCase());
          if(existing>=0)state.customFoods[existing]=clean; else state.customFoods.push(clean);
        }
        const recent={...food}; delete recent.__macroforgeCustomCandidate;
        state.recentFoods=[recent,...state.recentFoods.filter(x=>String(x.name).toLowerCase()!==String(recent.name).toLowerCase())].slice(0,30);
        window.save?.();
        window.renderFoods?.();
        window.toast?.(add ? `${food.name} added to your Food Log list` : `${food.name} kept in Recent Foods`);
      },120);
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

  function installSettings(){
    const p=window.state?.profile||{};const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v??""};
    set("profileName",p.name);set("profileAge",p.age);set("profileHeight",p.height);set("profileWeight",p.weight);set("profileActivity",p.activity||"moderate");set("unitSystem",p.unitSystem||"metric");
    document.getElementById("saveProfile")?.addEventListener("click",()=>{window.state.profile={name:document.getElementById("profileName")?.value.trim()||"",age:Number(document.getElementById("profileAge")?.value)||0,height:Number(document.getElementById("profileHeight")?.value)||0,weight:Number(document.getElementById("profileWeight")?.value)||0,activity:document.getElementById("profileActivity")?.value||"moderate",unitSystem:document.getElementById("unitSystem")?.value||"metric"};window.save?.();window.toast?.("Profile saved");},{once:true});
    document.getElementById("exportData")?.addEventListener("click",()=>window.mfExportData?.(),{once:true});
    document.getElementById("importDataBtn")?.addEventListener("click",()=>document.getElementById("importData")?.click(),{once:true});
    document.getElementById("importData")?.addEventListener("change",e=>window.mfImportData?.(e.target.files?.[0]),{once:true});
    document.getElementById("clearData")?.addEventListener("click",()=>window.mfClearAllData?.(),{once:true});
    const user=window.MacroForgeAuth?.user;const label=document.getElementById("settingsUsername");if(label)label.textContent=user?.username?`@${user.username}`:"Local account";
    const account=document.getElementById("settingsAccount"),details=document.getElementById("settingsAccountDetails");if(account&&details)account.onclick=()=>{details.hidden=!details.hidden;account.textContent=details.hidden?"Account details":"Hide account details";};
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
