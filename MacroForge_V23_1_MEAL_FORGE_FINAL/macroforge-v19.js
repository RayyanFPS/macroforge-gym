/* =========================================================
   MACROFORGE V19 — STABILITY + NUTRITION INTEGRITY + TRAINING UX
   Fixes:
   - Reliable exercise form media with a free ExerciseDB fallback
   - Exercise history redesign + View Exercise modal
   - Failure/RIR coaching note
   - Minor-safe BMI/body-fat presentation
   - Assigned workout persistence + visible assigned-plan card
   - Macro-aware next-meal selection that NEVER adds a macro already over goal
   - Food-log portion parser for natural phrases such as "half plate"
   - Historical food-log recalculation against the current canonical library
   - Nutrition integrity audit (calorie/macro consistency + portion-basis checks)
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

  /* ---------- Portion language ---------- */
  const FRACTIONS={half:.5,quarter:.25,third:1/3,threequarter:.75,'three quarters':.75,'one and a half':1.5,'one half':.5,'one quarter':.25};
  function parseNaturalPortion(text, fallbackUnit='plate'){
    let s=String(text||'').trim().toLowerCase().replace(/\s+/g,' ');
    if(!s) return {amount:1,unit:fallbackUnit,label:`1 ${fallbackUnit}`};
    let unit=fallbackUnit;
    const unitMap=[['plates','plate'],['plate','plate'],['bowls','bowl'],['bowl','bowl'],['pieces','piece'],['piece','piece'],['pcs','piece'],['servings','serving'],['serving','serving'],['cups','cup'],['cup','cup'],['wraps','wrap'],['wrap','wrap'],['grams','g'],['gram','g'],['g','g'],['ml','ml'],['millilitres','ml'],['milliliters','ml'],['litres','l'],['liters','l']];
    for(const [a,b] of unitMap){if(new RegExp(`\\b${a.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}\\b`).test(s)){unit=b;break;}}
    let amount=null;
    const wordMixed=/\bone\s+and\s+a\s+(half|quarter|third)\b/.exec(s);
    if(wordMixed) amount=1+(FRACTIONS[wordMixed[1]]||0);
    if(amount==null){for(const [k,v] of Object.entries(FRACTIONS)){if(s.includes(k)){amount=v;break;}}}
    const mixed=s.match(/(\d+(?:\.\d+)?)\s*(?:and\s+)?(?:a\s+)?(half|quarter|third)/);
    if(mixed) amount=Number(mixed[1])+(FRACTIONS[mixed[2]]||0);
    const num=s.match(/\b(\d+(?:\.\d+)?)\b/);
    if(num && amount==null) amount=Number(num[1]);
    if(amount==null){
      if(/\bhalf\b/.test(s)) amount=.5;
      else if(/\bquarter\b/.test(s)) amount=.25;
      else amount=1;
    }
    if(unit==='l') {amount*=1000;unit='ml';}
    return {amount:Math.max(.01,amount),unit,label:`${amount} ${unit}`};
  }
  window.MacroForgeParsePortion=parseNaturalPortion;

  function libraryFoods(){
    const s=state();
    return [...(window.MF_LOCAL_RECORDS||[]),...(window.MF_EXTRA_GYM_FOODS||[]),...(s.customFoods||[])];
  }
  function findFood(name){
    const q=String(name||'').trim().toLowerCase();
    const all=libraryFoods();
    return all.find(f=>String(f.name||'').toLowerCase()===q) || all.find(f=>String(f.name||'').toLowerCase().includes(q));
  }

  /* ---------- Repair existing food logs ---------- */
  function repairFoodLog(){
    const s=state(); if(!Array.isArray(s.foodLog))return {changed:0,skipped:0};
    let changed=0,skipped=0;
    s.foodLog=s.foodLog.map(entry=>{
      const f=findFood(entry.name);
      if(!f || typeof window.mfCalculatePortion!=='function'){skipped++;return entry;}
      let amount=n(entry.amount),unit=entry.unit||f.defaultUnit||f.nutritionUnit||'g';
      // Convert legacy natural-text quantities before numeric validation.
      if(typeof entry.amount==='string'){
        const p=parseNaturalPortion(entry.amount,unit);amount=p.amount;unit=p.unit;
      }
      if(amount<=0){skipped++;return entry;}
      const x=window.mfCalculatePortion(f,amount,unit);
      if(!x || !Number.isFinite(Number(x.cal))){skipped++;return entry;}
      const next={...entry,amount,unit,cal:Number(x.cal),p:Number(x.p||0),c:Number(x.c||0),f:Number(x.f||0),fiber:Number(x.fiber||0),equivalentGrams:Number(x.equivalentGrams||0),nutritionBasis:'canonical-v19'};
      const delta=Math.abs(n(entry.c)-next.c)+Math.abs(n(entry.p)-next.p)+Math.abs(n(entry.f)-next.f)+Math.abs(n(entry.cal)-next.cal)/10;
      if(delta>.01){changed++;return next;}
      return {...entry,amount,unit,nutritionBasis:entry.nutritionBasis||'canonical-v19'};
    });
    if(changed)save();
    return {changed,skipped};
  }

  /* ---------- Nutrition integrity audit ---------- */
  function auditNutrition(){
    const foods=libraryFoods();
    const seen=new Set(); const issues=[];
    for(const f of foods){
      const key=String(f.name||'').toLowerCase(); if(seen.has(key))continue; seen.add(key);
      const cal=n(f.cal),p=n(f.p),c=n(f.c),fat=n(f.f);
      const macroCal=4*p+4*c+9*fat;
      const tolerance=Math.max(25,cal*.35);
      if(cal>0 && Math.abs(macroCal-cal)>tolerance)issues.push(`${f.name}: calories do not roughly agree with P/C/F (${cal} vs ${macroCal.toFixed(1)})`);
      const basis=String(f.nutritionUnit||f.baseUnit||'');
      const amount=n(f.nutritionAmount||100);
      if(!amount)issues.push(`${f.name}: missing nutrition basis amount`);
      if(['g','ml'].includes(basis) && amount<=0)issues.push(`${f.name}: invalid mass/volume basis`);
    }
    return {count:seen.size,issues};
  }
  window.MacroForgeNutritionAudit=auditNutrition;

  function injectNutritionAudit(){
    const food=$('food'); if(!food || $('mfV19NutritionAudit'))return;
    const sec=document.createElement('section');sec.className='panel mf-v19-audit';sec.id='mfV19NutritionAudit';
    sec.innerHTML=`<div class="panel-head"><div><span class="pill">NUTRITION INTEGRITY</span><h3>Library calculation audit</h3></div><span class="muted">Canonical portion engine</span></div><div id="mfV19AuditBody" class="mf-v19-audit-body"></div><p class="muted">Packaged foods should be verified against the product label. Homemade Pakistani dishes are estimates because oil, meat ratio and serving size vary; the audit checks internal calculation consistency, not laboratory accuracy.</p>`;
    food.appendChild(sec);
    renderNutritionAudit();
  }
  function renderNutritionAudit(){
    const box=$('mfV19AuditBody');if(!box)return;const a=auditNutrition();
    box.innerHTML=`<div><b>${a.count}</b><span>unique library foods audited</span></div><div><b>${a.issues.length}</b><span>internal consistency flags</span></div><button type="button" class="secondary-btn" id="mfV19RepairLogs">Recalculate logged foods</button>`+(a.issues.length?`<details><summary>View ${a.issues.length} flags</summary><ul>${a.issues.slice(0,30).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:'<p class="mf-audit-ok">✓ No major calorie/P/C/F consistency mismatch detected in the curated library.</p>');
    $('mfV19RepairLogs')?.addEventListener('click',()=>{const r=repairFoodLog();toast(`Recalculated ${r.changed} logged food entries`);window.updateDashboard?.();window.renderFoods?.();renderNutritionAudit();});
  }

  /* ---------- Precision macro meal coach ----------
     Builds a variable-portion meal from the actual canonical food library.
     It solves for grams instead of choosing a fixed plate/bowl recipe, then
     shows the predicted delta against the user's remaining daily targets.
     USDA-style nutrient systems use a per-100g basis and scale portions from
     the food's gram weight, so this coach deliberately works in grams. */
  function foodPerGram(f){
    if(!f||typeof window.mfCalculatePortion!=='function')return null;
    const unit=String(f.nutritionUnit||f.baseUnit||'').toLowerCase();
    if(unit!=='g' && unit!=='piece')return null;
    const x=window.mfCalculatePortion(f,100,'g');
    if(!x || !Number.isFinite(Number(x.cal)))return null;
    return {cal:n(x.cal)/100,p:n(x.p)/100,c:n(x.c)/100,f:n(x.f)/100,fiber:n(x.fiber)/100};
  }
  function precisionFoods(){
    const banned=/creatine|mass gainer|whey|casein|protein powder|supplement/i;
    const seen=new Set();const out=[];
    for(const f of libraryFoods()){
      const name=String(f.name||'').trim();const key=name.toLowerCase();
      if(!name||seen.has(key)||banned.test(name))continue;
      const m=foodPerGram(f);if(!m||m.cal<=0)continue;
      if(m.p<0||m.c<0||m.f<0)continue;
      seen.add(key);out.push({...f,_m:m});
    }
    return out;
  }
  function solveLinear(A,b){
    const n=A.length, M=A.map((r,i)=>r.slice().concat([b[i]]));
    for(let col=0;col<n;col++){
      let pivot=col;for(let r=col+1;r<n;r++)if(Math.abs(M[r][col])>Math.abs(M[pivot][col]))pivot=r;
      if(Math.abs(M[pivot][col])<1e-10)return null;
      [M[col],M[pivot]]=[M[pivot],M[col]];
      const div=M[col][col];for(let j=col;j<=n;j++)M[col][j]/=div;
      for(let r=0;r<n;r++){if(r===col)continue;const q=M[r][col];for(let j=col;j<=n;j++)M[r][j]-=q*M[col][j];}
    }
    return M.map(r=>r[n]);
  }
  function fitAmounts(foods,target){
    const k=foods.length, rows=['p','c','f'];
    const A=rows.map(key=>foods.map(f=>f._m[key]));
    const ATA=Array.from({length:k},()=>Array(k).fill(0));const ATb=Array(k).fill(0);
    for(let i=0;i<k;i++)for(let j=0;j<k;j++)for(let r=0;r<3;r++)ATA[i][j]+=A[r][i]*A[r][j];
    for(let i=0;i<k;i++)for(let r=0;r<3;r++)ATb[i]+=A[r][i]*target[r];
    const x=solveLinear(ATA,ATb);if(!x)return null;
    // Clamp to practical meal portions. We allow small foods to be 5g and
    // larger whole-food servings to reach 800g, but never return absurd amounts.
    const amounts=x.map(v=>Math.max(5,Math.min(800,v)));
    return amounts;
  }
  function mealFrom(foods,amounts){
    const t={cal:0,p:0,c:0,f:0,fiber:0};
    foods.forEach((f,i)=>{const x=window.mfCalculatePortion(f,amounts[i],'g');t.cal+=n(x.cal);t.p+=n(x.p);t.c+=n(x.c);t.f+=n(x.f);t.fiber+=n(x.fiber);});
    return t;
  }
  function precisionScore(total,target,calTarget){
    const tp=Math.max(5,target.p),tc=Math.max(5,target.c),tf=Math.max(3,target.f);
    const macro=((total.p-target.p)/tp)**2+((total.c-target.c)/tc)**2+((total.f-target.f)/tf)**2;
    const calScale=Math.max(100,calTarget);const kcal=((total.cal-calTarget)/calScale)**2;
    const overs=Math.max(0,total.p-target.p)/tp+Math.max(0,total.c-target.c)/tc+Math.max(0,total.f-target.f)/tf;
    return macro*6+kcal*2+overs*8;
  }
  function renderSafeMealCoach(){
    const box=$('mfMealCoach');if(!box)return;const s=state(),g=s.goals||{};
    if(!s.onboardingComplete){box.innerHTML='<div class="muted">Complete your nutrition plan first.</div>';return;}
    const logs=(s.foodLog||[]).filter(x=>x.date===today());
    const t={cal:0,p:0,c:0,f:0};logs.forEach(x=>{t.cal+=n(x.cal);t.p+=n(x.p);t.c+=n(x.c);t.f+=n(x.f);});
    const raw={cal:n(g.cal)-t.cal,p:n(g.protein)-t.p,c:n(g.carbs)-t.c,f:n(g.fat)-t.f};
    const target={cal:Math.max(0,raw.cal),p:Math.max(0,raw.p),c:Math.max(0,raw.c),f:Math.max(0,raw.f)};
    const over=['p','c','f'].filter(k=>raw[k]<-1);
    if(target.cal<=20 || (target.p<=1&&target.c<=1&&target.f<=1)){
      box.innerHTML=`<div class="mf-coach-main"><div><span class="pill">DAILY TARGET REACHED</span><h4>No extra meal needed</h4><p>Today's logged intake is already at or above the planned macro targets. MacroForge will not invent another meal just to fill calories.</p></div></div><div class="mf-coach-remaining"><span>Remaining / over</span><b>${Math.round(raw.cal)} kcal</b><b>${Math.round(raw.p)}g P</b><b>${Math.round(raw.c)}g C</b><b>${Math.round(raw.f)}g F</b></div>`;return;
    }
    // If every macro is already materially over, there is no mathematically
    // sensible food recommendation. This also prevents the old chicken-karahi
    // problem when fat was already far above target.
    if(over.length===3){
      box.innerHTML=`<div class="mf-coach-main"><div><span class="pill">NO FOOD NEEDED</span><h4>All macro targets are already over</h4><p>Protein is ${Math.round(Math.abs(raw.p))}g over, carbs ${Math.round(Math.abs(raw.c))}g over and fat ${Math.round(Math.abs(raw.f))}g over. The precise recommendation is to stop adding food for this target window, not to force another meal.</p></div></div><div class="mf-coach-remaining"><span>Remaining / over</span><b>${Math.round(raw.cal)} kcal</b><b>${Math.round(raw.p)}g P</b><b>${Math.round(raw.c)}g C</b><b>${Math.round(raw.f)}g F</b></div>`;return;
    }
    const foods=precisionFoods();
    const proteins=foods.filter(f=>f._m.p>=0.12&&f._m.p>=f._m.c*0.7&&f._m.f<=0.16).sort((a,b)=>b._m.p-a._m.p).slice(0,16);
    const carbs=foods.filter(f=>f._m.c>=0.18&&f._m.c>=f._m.p*1.3&&f._m.f<=0.12).sort((a,b)=>b._m.c-a._m.c).slice(0,16);
    const fats=foods.filter(f=>f._m.f>=0.08).sort((a,b)=>b._m.f-a._m.f).slice(0,12);
    const best=[];const seen=new Set();
    const addCandidate=(arr)=>{const key=arr.map(f=>f.name).sort().join('|');if(seen.has(key))return;seen.add(key);const targetVec=[target.p,target.c,target.f];const amounts=fitAmounts(arr,targetVec);if(!amounts)return;const total=mealFrom(arr,amounts);if(amounts.some(x=>x<5||x>800))return;const score=precisionScore(total,target,target.cal);best.push({foods:arr,amounts,total,score});};
    // Two-food solutions are preferred when they can hit the remaining macros.
    for(const p of proteins)for(const c of carbs)addCandidate([p,c]);
    if(target.f>5){for(const p of proteins)for(const c of carbs)for(const f of fats){if(new Set([p.name,c.name,f.name]).size<3)continue;addCandidate([p,c,f]);}}
    best.sort((a,b)=>a.score-b.score);
    let chosen=best[0];
    if(!chosen){box.innerHTML='<div class="muted">No precise whole-food combination could safely fit the remaining macros. Try logging a smaller portion or add a custom food with verified nutrition data.</div>';return;}
    // Refine the winning amounts with coordinate search in 5g increments.
    const refine=(cand)=>{let amounts=cand.amounts.slice();let bestT=mealFrom(cand.foods,amounts);let bestS=precisionScore(bestT,target,target.cal);for(let pass=0;pass<4;pass++)for(let i=0;i<amounts.length;i++){let local=amounts[i];for(let d=-40;d<=40;d+=5){const a=amounts.slice();a[i]=Math.max(5,Math.min(800,local+d));const tt=mealFrom(cand.foods,a),ss=precisionScore(tt,target,target.cal);if(ss<bestS){bestS=ss;bestT=tt;amounts=a;}}}return {...cand,amounts,total:bestT,score:bestS};};
    chosen=refine(chosen);
    const del={cal:chosen.total.cal-target.cal,p:chosen.total.p-target.p,c:chosen.total.c-target.c,f:chosen.total.f-target.f};
    const name=chosen.foods.map(f=>f.name).join(' + ');
    const portionText=chosen.foods.map((f,i)=>`${esc(f.name)} ${Math.round(chosen.amounts[i])}g`).join(' · ');
    box.innerHTML=`<div class="mf-coach-main"><div><span class="pill">PRECISION NEXT MEAL</span><h4>${esc(name)}</h4><p>Suggested portions: ${portionText}</p><p>Meal total: ~${Math.round(chosen.total.cal)} kcal · P ${chosen.total.p.toFixed(1)}g · C ${chosen.total.c.toFixed(1)}g · F ${chosen.total.f.toFixed(1)}g</p><small>Target remainder: ${Math.round(target.cal)} kcal · P ${target.p.toFixed(1)}g · C ${target.c.toFixed(1)}g · F ${target.f.toFixed(1)}g</small></div><button class="secondary-btn" type="button" id="mfV19LogMeal">Log precise meal</button></div><div class="mf-coach-remaining"><span>Predicted difference</span><b>${del.cal>=0?'+':''}${Math.round(del.cal)} kcal</b><b>${del.p>=0?'+':''}${del.p.toFixed(1)}g P</b><b>${del.c>=0?'+':''}${del.c.toFixed(1)}g C</b><b>${del.f>=0?'+':''}${del.f.toFixed(1)}g F</b></div>`;
    $('mfV19LogMeal').onclick=()=>{s.foodLog=s.foodLog||[];chosen.foods.forEach((f,i)=>{const amount=Math.round(chosen.amounts[i]);const x=window.mfCalculatePortion(f,amount,'g');s.foodLog.push({id:`meal19_${Date.now()}_${Math.random().toString(36).slice(2)}`,name:f.name,amount,unit:'g',cal:n(x.cal),p:n(x.p),c:n(x.c),f:n(x.f),fiber:n(x.fiber),date:today(),source:'MacroForge Precision Meal Coach',nutritionBasis:'canonical-v19'});});save();window.updateDashboard?.();window.renderFoods?.();renderSafeMealCoach();toast('Precise meal logged');};
  }

  /* ---------- Assigned workout ---------- */
  function extractGeneratedWorkout(){
    const rows=[...document.querySelectorAll('#mfGeneratedWorkout .mf-plan-row')];
    return rows.map(r=>({name:r.querySelector('b')?.textContent?.trim()||'Exercise',prescription:r.querySelector('strong')?.textContent?.trim()||'3 × 8–12',rir:r.querySelector('span')?.textContent?.trim()||'RIR 1–2'})).filter(x=>x.name);
  }
  function renderAssignedWorkout(){
    const host=$('mfAssignedWorkout');if(!host)return;const a=state().assignedWorkout;
    if(!a){host.innerHTML='<div class="muted">No workout assigned yet. Generate a workout, then assign it to make it your active plan.</div>';return;}
    host.innerHTML=`<div class="mf-assigned-head"><div><span class="pill">ASSIGNED</span><h3>${esc(a.name||'Assigned workout')}</h3><small>Assigned ${esc(a.assignedAt||today())}</small></div><button type="button" class="secondary-btn" id="mfV19ClearAssigned">Clear assignment</button></div><div class="mf-assigned-list">${(a.exercises||[]).map((x,i)=>`<div><b>${i+1}. ${esc(x.name)}</b><span>${esc(x.prescription)} · ${esc(x.rir)}</span></div>`).join('')}</div><div class="mf-assigned-features"><span>✓ Visible active plan</span><span>✓ Saved in local storage</span><span>✓ Ready to record</span></div>`;
    $('mfV19ClearAssigned')?.addEventListener('click',()=>{delete state().assignedWorkout;save();renderAssignedWorkout();toast('Assigned workout cleared');});
  }
  function installWorkoutAssignment(){
    const lab=$('trainingLab');if(!lab)return;
    let host=$('mfAssignedWorkout');
    if(!host){host=document.createElement('section');host.className='panel';host.id='mfAssignedWorkout';const target=lab.querySelector('.mf-training-grid');target?.parentNode?.insertBefore(host,target.nextSibling);}
    renderAssignedWorkout();
    const gen=$('mfGenerateWorkout');
    if(gen && gen.dataset.v19assign!=='1'){
      gen.dataset.v19assign='1';gen.addEventListener('click',()=>setTimeout(()=>{
        const exercises=extractGeneratedWorkout();if(!exercises.length)return;
        const out=$('mfGeneratedWorkout');if(!$('mfV19AssignWorkout')){const b=document.createElement('button');b.id='mfV19AssignWorkout';b.type='button';b.className='primary full';b.textContent='Assign this workout';out?.appendChild(b);b.onclick=()=>{state().assignedWorkout={id:`assigned_${Date.now()}`,name:`${$('mfTrainFocus')?.value||'Custom'} · ${$('mfTrainGoal')?.value||'Hypertrophy'}`,assignedAt:today(),exercises:extractGeneratedWorkout()};save();renderAssignedWorkout();toast('Workout assigned — it is now visible below the generator');};}
      },80));
    }
  }

  /* ---------- Failure / RIR coaching note ---------- */
  function injectFailureNote(){
    const lab=$('trainingLab');if(!lab||$('mfV19FailureNote'))return;
    const sec=document.createElement('section');sec.className='panel mf-failure-note';sec.id='mfV19FailureNote';
    sec.innerHTML=`<div class="panel-head"><div><span class="pill">INTENSITY GUIDE</span><h3>Why failure matters — and when to use it</h3></div></div><div class="mf-failure-grid"><div><b>Failure is a tool, not the default.</b><p>Training to failure means you cannot complete another clean repetition with the intended technique. It can provide a strong stimulus, but taking every set to failure also increases fatigue and can make later sets or sessions worse.</p></div><div><b>Use it selectively.</b><p>For most working sets, stay around <strong>1–3 reps in reserve (RIR)</strong>. Reaching 0 RIR can be useful occasionally on safer isolation or machine movements, especially on the final set. Heavy compounds are usually better kept a little shy of failure so technique and fatigue stay controlled.</p></div><div><b>What failure should look like.</b><p>Stop when the next rep would require cheating, shortened range of motion, a major technique breakdown, or simply cannot be completed. Do not turn a failed rep into a dangerous grinder.</p></div></div>`;
    lab.appendChild(sec);
  }

  /* ---------- Exercise media ---------- */
  let exerciseDBPromise=null;
  async function getExerciseDB(){
    if(exerciseDBPromise)return exerciseDBPromise;
    exerciseDBPromise=fetch('https://oss.exercisedb.dev/api/v1/exercises',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('ExerciseDB '+r.status);return r.json();}).then(j=>Array.isArray(j.data)?j.data:[]).catch(e=>{console.warn('ExerciseDB unavailable',e);return [];});
    return exerciseDBPromise;
  }
  function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  async function showFormV19(name){
    const body=$('mfFormVideoBody'),title=$('mfFormVideoTitle'),meta=$('mfFormVideoMeta');if(!body)return;
    title.textContent=name||'Exercise form';meta.textContent='Finding form demonstration…';body.innerHTML='<div class="mf-video-loading">Loading the exercise demonstration…</div>';
    const arr=await getExerciseDB();
    const q=norm(name);let hit=arr.find(x=>norm(x.name)===q);
    if(!hit){const tokens=q.split(' ').filter(x=>x.length>2);hit=arr.map(x=>{const nrm=norm(x.name);return {...x,_score:tokens.reduce((s,t)=>s+(nrm.includes(t)?1:0),0)};}).sort((a,b)=>b._score-a._score)[0];}
    if(hit?.gifUrl){
      meta.textContent=`${(hit.targetMuscles||[]).join(', ')||'Exercise'} · ${(hit.equipments||[]).join(', ')||'Bodyweight'}`;
      body.innerHTML=`<div class="mf-video-wrap mf-gif-wrap"><img src="${esc(hit.gifUrl)}" alt="${esc(hit.name)} form demonstration" loading="eager"></div><div class="mf-video-details"><div><b>How to perform</b><ol>${(hit.instructions||[]).slice(0,8).map(x=>`<li>${esc(String(x).replace(/^Step:\s*\d+\s*/i,''))}</li>`).join('')}</ol></div><div><b>Target</b><p>${esc((hit.targetMuscles||[]).join(', ')||'—')}</p><b>Equipment</b><p>${esc((hit.equipments||[]).join(', ')||'—')}</p></div></div><small class="mf-video-credit">Form animation supplied by the free ExerciseDB API.</small>`;
      return;
    }
    body.innerHTML=`<div class="mf-video-fallback"><p>The live form database could not return a clip for <b>${esc(name)}</b>.</p><a class="primary small" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/results?search_query=${encodeURIComponent(name+' exercise form')}">Open form videos on YouTube ↗</a></div>`;
    meta.textContent='Fallback search';
  }

  function patchWatchButtons(){
    document.addEventListener('click',e=>{
      const b=e.target.closest?.('.mf-v18-watch,.mf-v183-watch,.mf-watch-form');if(!b)return;
      e.preventDefault();e.stopPropagation();const name=b.getAttribute('data-v18-ex')||b.getAttribute('data-v183-ex')||b.getAttribute('data-mf-exercise')||'';const s=$('mfRecordExercise');if(s){s.value=name;s.dispatchEvent(new Event('change',{bubbles:true}));}showFormV19(name);$('mfFormVideoPanel')?.scrollIntoView({behavior:'smooth',block:'center'});
    },true);
    document.addEventListener('change',e=>{if(e.target?.id==='mfRecordExercise' && e.target.value)showFormV19(e.target.value);},true);
  }

  /* ---------- Exercise history modal ---------- */
  function historyModal(){
    let m=$('mfV19HistoryModal');if(m)return m;
    m=document.createElement('div');m.className='modal';m.id='mfV19HistoryModal';m.innerHTML=`<div class="modal-card mf-v19-history-modal"><button class="close" data-v19-close>×</button><span class="pill">EXERCISE HISTORY</span><h2 id="mfV19HistoryTitle">Exercise</h2><div id="mfV19HistoryBody"></div></div>`;document.body.appendChild(m);m.querySelector('[data-v19-close]').onclick=()=>m.classList.remove('open');return m;
  }
  function renderHistoryV19(){
    const box=$('mfExerciseHistory'),sel=$('mfHistoryExercise');if(!box||!sel)return;
    const ex=sel.value||sel.options[0]?.value;const records=(state().training?.records||[]).filter(r=>r.exercise===ex).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    if(!records.length){box.innerHTML='<div class="muted">No records yet. Save your first working set above.</div>';return;}
    const best=Math.max(...records.map(r=>n(r.e1rm)));box.innerHTML=`<div class="mf-history-head"><span>Date</span><span>Load</span><span>Reps</span><span>Sets</span><span>Est. 1RM</span><span></span></div>`+records.slice().reverse().map(r=>`<div class="mf-history-row"><span>${esc(r.date)}</span><span>${n(r.weight)} kg</span><span>${n(r.reps)}</span><span>${n(r.sets)}</span><span>${n(r.e1rm).toFixed(1)}${n(r.e1rm)>=best?' ★':''}</span><button type="button" class="secondary-btn mf-view-exercise" data-v19-record="${esc(r.id)}">View Exercise</button></div>`).join('');
    box.querySelectorAll('.mf-view-exercise').forEach(b=>b.onclick=()=>{const r=records.find(x=>String(x.id)===String(b.dataset.v19Record));if(!r)return;const m=historyModal();$('mfV19HistoryTitle').textContent=r.exercise;$('mfV19HistoryBody').innerHTML=`<div class="mf-history-hero"><b>${n(r.weight)} kg × ${n(r.reps)}</b><span>${n(r.sets)} sets · RIR ${n(r.rir)} · estimated 1RM ${n(r.e1rm).toFixed(1)} kg</span><small>${esc(r.date)}</small></div><div class="mf-history-actions"><button type="button" class="primary" id="mfV19HistoryWatch">▶ Watch Form</button><button type="button" class="secondary-btn" id="mfV19HistoryClose">Close</button></div>`;m.classList.add('open');$('mfV19HistoryClose').onclick=()=>m.classList.remove('open');$('mfV19HistoryWatch').onclick=()=>{m.classList.remove('open');showFormV19(r.exercise);$('mfFormVideoPanel')?.scrollIntoView({behavior:'smooth',block:'center'});};});
  }

  /* ---------- Better food logger ---------- */
  function enhanceFoodModal(){
    const input=$('servingAmount');if(!input||input.dataset.v19==='1')return;
    input.dataset.v19='1';input.type='text';input.placeholder='e.g. 0.5, half, 1.5, half plate';
    const note=$('servingConversionNote');
    input.addEventListener('input',()=>{
      const unit=$('servingUnit')?.value||'plate';const p=parseNaturalPortion(input.value,unit);if(note)note.textContent=`Understood as ${p.amount} ${p.unit}. You can type “half plate”, “1.5 plates”, “2 pieces”, “200 g”, etc.`;
      const original=window.mfUpdateFoodNutritionPreview;if(typeof original==='function'){const old=input.value;input.value=String(p.amount);original();input.value=old;}
    });
    const btn=$('confirmFood');if(btn && btn.dataset.v19!=='1'){
      btn.dataset.v19='1';
      btn.addEventListener('click',(ev)=>{
        const raw=input.value.trim();
        if(raw && !Number.isFinite(Number(raw))){
          const p=parseNaturalPortion(raw,$('servingUnit')?.value||'plate');
          input.value=String(p.amount);
          if($('servingUnit'))$('servingUnit').value=p.unit;
        }
        setTimeout(repairFoodLog,160);
      },true);
    }
    const modal=$('foodModal');if(modal&&!modal.querySelector('.mf-portion-help')){const h=document.createElement('div');h.className='mf-portion-help';h.innerHTML='<b>Easy portions</b><span>Type natural amounts: “half plate”, “one and a half plates”, “2 pieces”, “200 g”. MacroForge converts the phrase before calculating.</span>';modal.querySelector('.modal-card')?.appendChild(h);}
  }

  /* ---------- Body composition ---------- */
  function renderSafeBodyComp(){
    const s=state(),p=s.profile||{},latest=(s.weights||[]).slice(-1)[0];const kg=n(latest?.kg)||n(p.weight),cm=n(p.height),age=n(p.age);
    const bmi=kg>0&&cm>0?kg/Math.pow(cm/100,2):null;
    const section=$('mfV19BodyComp');if(!section)return;
    $('mfV19BMI').textContent=bmi?bmi.toFixed(1):'—';
    $('mfV19BMIText').textContent=age&&age<18?'Numeric BMI only — adult BMI categories are not valid for under-18 users.':'BMI is a screening measure and does not directly measure muscle or body fat.';
    $('mfV19BF').textContent=age&&age<18?'Not estimated':'—';
    $('mfV19BFText').textContent=age&&age<18?'Adult circumference equations are not validated for adolescents. Do not label yourself 2% from this calculator.':'Enter waist and neck measurements to calculate an adult estimate.';
  }
  function injectSafeBodyComp(){
    const science=$('science');if(!science)return;document.querySelector('#mfV18BodyComp')?.classList.add('mf-v19-hidden');if($('mfV19BodyComp')){renderSafeBodyComp();return;}
    const sec=document.createElement('section');sec.className='panel';sec.id='mfV19BodyComp';sec.innerHTML=`<div class="panel-head"><div><span class="pill">BODY COMPOSITION</span><h3>BMI & body-fat calculator</h3></div><span class="muted">Measurement context only</span></div><div class="mf-v19-body-grid"><div><span>BMI</span><b id="mfV19BMI">—</b><small id="mfV19BMIText">Add height and weight in Profile.</small></div><div><span>Body-fat estimate</span><b id="mfV19BF">—</b><small id="mfV19BFText">Not a diagnosis.</small></div></div><p class="muted">BMI can be calculated numerically from height and weight, but adult BMI categories should not be applied to users under 18. The Navy body-fat equation is also an adult estimate and is intentionally disabled for minors.</p>`;science.appendChild(sec);renderSafeBodyComp();
  }

  /* ---------- Refresh ---------- */
  function refresh(){
    repairFoodLog();
    injectNutritionAudit();
    renderSafeBodyComp();
    renderSafeMealCoach();
    installWorkoutAssignment();
    injectFailureNote();
    enhanceFoodModal();
    const lab=$('trainingLab');if(lab){renderHistoryV19();if($('mfHistoryExercise'))$('mfHistoryExercise').onchange=renderHistoryV19;}
  }
  function install(){
    patchWatchButtons();
    document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="trainingLab"]'))setTimeout(refresh,220);},true);
    document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="food"]'))setTimeout(()=>{injectNutritionAudit();enhanceFoodModal();},220);},true);
    setTimeout(refresh,700);setTimeout(refresh,1600);
    setInterval(()=>{if(document.visibilityState!=='hidden')refresh();},3500);
  }
  window.MacroForgeV19={refresh,repairFoodLog,auditNutrition,showForm:showFormV19,parsePortion:parseNaturalPortion};
  document.addEventListener('DOMContentLoaded',install,{once:true});
})();
