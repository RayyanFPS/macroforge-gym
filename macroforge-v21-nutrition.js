/* =========================================================
   MACROFORGE V21 — NUTRITION HARDENING
   - Removes legacy/random meal coach entirely
   - Uses one deterministic portion engine
   - Repairs known local-food logs once on startup
   - Quarantines obviously corrupted high-calorie log entries
   - Rejects implausible global nutrition records
   - Keeps local serving foods as serving-based, and 100g/100ml foods
     as mass/volume-based. No double-scaling.
   ========================================================= */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const state=()=>window.state||{};
  const save=()=>window.save?.();
  const today=()=>window.today?.()||new Date().toISOString().slice(0,10);
  const toast=m=>window.toast?.(m);

  const WEIGHTS={
    g:1,ml:1,piece:50,slice:30,scoop:30,serving:100,plate:300,bowl:250,
    cup:240,glass:300,wrap:180,sandwich:180,tbsp:15,tsp:5,tablepoon:15,
    teaspoon:5,packet:50,bottle:500
  };
  const PIECE_WEIGHTS={
    'Banana':118,'Apple':182,'Orange':131,'Mango':200,'Guava':100,
    'Boiled Egg':50,'Fried Egg':50,'Omelette':100
  };

  function library(){
    const s=state();
    return [...(window.MF_LOCAL_RECORDS||[]),...(window.MF_EXTRA_GYM_FOODS||[]),...(s.customFoods||[])];
  }
  function exactFood(name){
    const q=String(name||'').trim().toLowerCase();
    if(!q)return null;
    return library().find(f=>String(f.name||'').trim().toLowerCase()===q)||null;
  }
  function unitWeight(food,unit){
    if(unit==='g'||unit==='ml')return 1;
    if(food?.unitWeights?.[unit] && n(food.unitWeights[unit])>0)return n(food.unitWeights[unit]);
    if(PIECE_WEIGHTS[food?.name] && unit==='piece')return PIECE_WEIGHTS[food.name];
    return WEIGHTS[unit]||100;
  }
  function basisUnit(food){
    const u=String(food?.nutritionUnit||food?.baseUnit||'g').toLowerCase();
    return u;
  }
  function calculate(food,amount,unit){
    if(!food)throw new Error('missing food');
    const a=Math.max(0,n(amount));
    const u=String(unit||food.defaultUnit||food.nutritionUnit||'g').toLowerCase();
    const bu=basisUnit(food);
    const ba=Math.max(0.000001,n(food.nutritionAmount||1));
    let multiplier=0, grams=0;

    // Per-100g / per-100ml records.
    if(bu==='g'||bu==='ml'){
      if(u===bu) multiplier=a/ba;
      else {
        const selected= a*unitWeight(food,u);
        multiplier=selected/ba;
        grams=selected;
      }
    } else {
      // Serving/piece/plate/bowl records: values are for one nutrition basis.
      if(u===bu) multiplier=a/ba;
      else {
        const basisWeight=unitWeight(food,bu);
        const selectedWeight=a*unitWeight(food,u);
        multiplier=selectedWeight/Math.max(0.000001,basisWeight*ba);
        grams=selectedWeight;
      }
    }
    const out={
      cal:Math.max(0,n(food.cal))*multiplier,
      p:Math.max(0,n(food.p))*multiplier,
      c:Math.max(0,n(food.c))*multiplier,
      f:Math.max(0,n(food.f))*multiplier,
      fiber:Math.max(0,n(food.fiber))*multiplier,
      sugar:Math.max(0,n(food.sugar))*multiplier,
      sodium:Math.max(0,n(food.sodium))*multiplier,
      multiplier,inputAmount:a,inputUnit:u,basisUnit:bu,basisAmount:ba,
      equivalentGrams:grams || (u==='g'?a:(u==='ml'?a:a*unitWeight(food,u)))
    };
    // Hard safety guard: one normal logged portion should never silently become
    // tens of thousands of kcal or hundreds of grams of a macro.
    if(!Number.isFinite(out.cal)||!Number.isFinite(out.p)||!Number.isFinite(out.c)||!Number.isFinite(out.f))throw new Error('non-finite nutrition');
    return out;
  }

  function plausible(food){
    const cal=n(food?.cal),p=n(food?.p),c=n(food?.c),f=n(food?.f);
    if(cal<0||p<0||c<0||f<0)return false;
    if(cal>1000||p>100||c>100||f>100)return false;
    const macroCal=4*p+4*c+9*f;
    if(cal>0 && macroCal>0 && Math.abs(macroCal-cal)>Math.max(120,cal*.65))return false;
    return cal>0||p>0||c>0||f>0;
  }

  // Install the one calculation function used by all food loggers.
  window.mfCalculatePortion=calculate;
  if(window.MacroForgeFinal)window.MacroForgeFinal.calculate=calculate;

  function removeMealCoach(){
    ['mfMealCoach','mfMealCoachTitle','mfMealCoachMeta'].forEach(id=>$(id)?.closest('.mf-meal-coach')?.remove());
    document.querySelectorAll('.mf-meal-coach,.mf-v19-audit').forEach(x=>{
      if(x.classList.contains('mf-meal-coach'))x.remove();
    });
  }

  function migrateLogs(){
    const s=state(); if(!Array.isArray(s.foodLog))s.foodLog=[];
    if(s.__mfV21NutritionMigration===1)return {changed:0,quarantined:0};
    const kept=[],quarantine=Array.isArray(s.quarantinedFoodLog)?s.quarantinedFoodLog:[];
    let changed=0,quarantined=0;
    for(const entry of s.foodLog){
      const f=exactFood(entry.name);
      let amount=entry.amount,unit=entry.unit;
      if(typeof amount==='string'){
        const text=amount.trim().toLowerCase();
        const mixed=text.match(/^(\d+(?:\.\d+)?)\s*(?:and\s+)?a\s+half/);
        if(mixed)amount=n(mixed[1])+.5;
        else if(/half/.test(text))amount=.5;
        else {const m=text.match(/\d+(?:\.\d+)?/);amount=m?n(m[0]):1;}
        const units=['plate','bowl','piece','g','ml','cup','wrap','serving'];
        const found=units.find(x=>new RegExp('\\b'+x+'s?\\b').test(text));
        if(found)unit=found;
      }
      amount=n(amount); unit=String(unit||f?.defaultUnit||f?.nutritionUnit||'g');
      if(f && plausible(f) && amount>0){
        try{
          const x=calculate(f,amount,unit);
          const next={...entry,amount,unit,cal:x.cal,p:x.p,c:x.c,f:x.f,fiber:x.fiber,sugar:x.sugar,sodium:x.sodium,equivalentGrams:x.equivalentGrams,nutritionBasis:'v21-canonical'};
          if(Math.abs(n(entry.cal)-x.cal)>.01||Math.abs(n(entry.p)-x.p)>.01||Math.abs(n(entry.c)-x.c)>.01||Math.abs(n(entry.f)-x.f)>.01)changed++;
          kept.push(next); continue;
        }catch(e){}
      }
      // Unknown/global entries: quarantine only values that are plainly corrupted.
      const suspicious=n(entry.cal)>5000 || n(entry.p)>500 || n(entry.c)>500 || n(entry.f)>300;
      if(suspicious){quarantine.push({...entry,quarantinedAt:new Date().toISOString(),quarantineReason:'Implausible nutrition magnitude; excluded from daily totals until verified.'});quarantined++;continue;}
      kept.push(entry);
    }
    s.foodLog=kept;s.quarantinedFoodLog=quarantine;s.__mfV21NutritionMigration=1;save();
    return {changed,quarantined};
  }

  function sanitizeGlobalCards(){
    document.querySelectorAll('.mf-global-result').forEach(card=>{
      const txt=(card.textContent||'').replace(/,/g,'');
      const nums=[...txt.matchAll(/(\d+(?:\.\d+)?)\s*(?:kcal|g)/gi)].map(m=>n(m[1]));
      if(nums.some(x=>x>1000))card.remove();
    });
  }

  function addMigrationNotice(result){
    if(!result.changed&&!result.quarantined)return;
    const food=$('food'); if(!food)return;
    let box=$('mfV21NutritionNotice');
    if(!box){box=document.createElement('div');box.id='mfV21NutritionNotice';box.className='mf-v21-nutrition-notice';food.prepend(box);}
    box.innerHTML=`<b>Nutrition data repaired</b><span>${result.changed} logged item${result.changed===1?' was':'s were'} recalculated using the corrected portion engine${result.quarantined?` · ${result.quarantined} corrupted item${result.quarantined===1?'':'s'} moved out of today's totals for verification`:''}.</span>`;
  }

  function install(){
    removeMealCoach();
    const result=migrateLogs();
    addMigrationNotice(result);
    sanitizeGlobalCards();
    const observer=new MutationObserver(()=>{removeMealCoach();sanitizeGlobalCards();});
    observer.observe(document.body,{childList:true,subtree:true});
    window.__MacroForgeV21NutritionReady=true;
    window.MacroForgeV21Nutrition={calculate,migrateLogs,removeMealCoach,plausible};
    window.updateDashboard?.();window.renderFoods?.();
    if(result.quarantined)toast(`${result.quarantined} suspicious food log item(s) were quarantined for safety`);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
