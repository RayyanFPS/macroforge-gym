/* =========================================================
   MACROFORGE V22.1 — PUBLISH / TRAINING STABILITY LAYER
   Non-destructive compatibility layer.
   - Keeps existing app features intact.
   - Removes only the obsolete promo / broken video / meal-coach remnants.
   - Restores a mobile-first in-app exercise + workout search.
   - Makes split assignment visibly persistent on Training Lab + Workouts.
   - Adds assigned-day exercises when the app has them available.
   - Keeps exercise history / progressive overload fully app-native.
   - Adds failure / RIR guidance.
   ========================================================= */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const st=()=>window.state||{};
  const save=()=>window.save?.();
  const toast=m=>window.toast?.(m);
  const localToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  const today=()=>window.today?.()||localToday();

  const EXERCISES=[
    ['Barbell Bench Press','Chest','Barbell'],['Incline Barbell Bench Press','Upper Chest','Barbell'],['Dumbbell Bench Press','Chest','Dumbbell'],['Incline Dumbbell Press','Upper Chest','Dumbbell'],['Machine Chest Press','Chest','Machine'],['Pec Deck','Chest','Machine'],['Cable Fly','Chest','Cable'],['Chest Dip','Chest/Triceps','Bodyweight'],
    ['Lat Pulldown','Back/Lats','Machine'],['Wide-Grip Lat Pulldown','Back/Lats','Machine'],['Close-Grip Lat Pulldown','Back/Lats','Machine'],['Seated Cable Row','Back','Cable'],['Seated Row','Back','Machine'],['Chest-Supported Row','Back','Machine'],['Chest-Supported T-Bar Row','Back','Machine'],['T-Bar Row','Back','Machine'],['Barbell Row','Back','Barbell'],['One-Arm Dumbbell Row','Back','Dumbbell'],['Cable Row','Back','Cable'],['Single-Arm Cable Row','Back','Cable'],['Pull-Up','Back','Bodyweight'],['Chin-Up','Back/Biceps','Bodyweight'],['Straight-Arm Pulldown','Lats','Cable'],
    ['Back Squat','Quads/Glutes','Barbell'],['High-Bar Squat','Quads','Barbell'],['Low-Bar Squat','Quads/Glutes','Barbell'],['Front Squat','Quads','Barbell'],['Hack Squat','Quads','Machine'],['Leg Press','Quads/Glutes','Machine'],['45-Degree Leg Press','Quads/Glutes','Machine'],['Leg Extension','Quads','Machine'],['Bulgarian Split Squat','Quads/Glutes','Dumbbell'],['Walking Lunge','Legs','Dumbbell'],['Reverse Lunge','Legs','Dumbbell'],['Step-Up','Legs','Dumbbell'],
    ['Romanian Deadlift','Hamstrings/Glutes','Barbell'],['Stiff-Leg Deadlift','Hamstrings','Barbell'],['Conventional Deadlift','Posterior Chain','Barbell'],['Sumo Deadlift','Posterior Chain','Barbell'],['Lying Leg Curl','Hamstrings','Machine'],['Seated Leg Curl','Hamstrings','Machine'],['Nordic Hamstring Curl','Hamstrings','Bodyweight'],['Hip Thrust','Glutes','Barbell'],['Cable Pull-Through','Glutes','Cable'],['Hip Abduction','Glutes','Machine'],['Hip Adduction','Adductors','Machine'],['Standing Calf Raise','Calves','Machine'],['Seated Calf Raise','Calves','Machine'],
    ['Overhead Press','Shoulders','Barbell'],['Seated Dumbbell Shoulder Press','Shoulders','Dumbbell'],['Arnold Press','Shoulders','Dumbbell'],['Dumbbell Lateral Raise','Side Delts','Dumbbell'],['Cable Lateral Raise','Side Delts','Cable'],['Machine Lateral Raise','Side Delts','Machine'],['Rear Delt Fly','Rear Delts','Dumbbell'],['Reverse Pec Deck','Rear Delts','Machine'],['Face Pull','Rear Delts','Cable'],
    ['Barbell Curl','Biceps','Barbell'],['EZ-Bar Curl','Biceps','EZ Bar'],['Incline Dumbbell Curl','Biceps','Dumbbell'],['Preacher Curl','Biceps','Dumbbell'],['Hammer Curl','Brachialis','Dumbbell'],['Cable Curl','Biceps','Cable'],['Bayesian Cable Curl','Biceps','Cable'],['Rope Pushdown','Triceps','Cable'],['Cable Pushdown','Triceps','Cable'],['Skull Crusher','Triceps','EZ Bar'],['Overhead Triceps Extension','Triceps','Cable'],['Dumbbell Overhead Extension','Triceps','Dumbbell'],
    ['Cable Crunch','Abs','Cable'],['Hanging Leg Raise','Abs','Bodyweight'],['Hanging Knee Raise','Abs','Bodyweight'],['Ab Wheel Rollout','Core','Wheel'],['Plank','Core','Bodyweight'],['Pallof Press','Core','Cable']
  ];

  const aliases={
    'seated row':['seated cable row','seated row','cable row','chest-supported row','chest-supported t-bar row'],
    'row':['seated cable row','seated row','cable row','chest-supported row','chest-supported t-bar row','t-bar row','barbell row','single-arm cable row'],
    'lat pull':['lat pulldown','wide-grip lat pulldown','close-grip lat pulldown'],
    'lat pulldown':['lat pulldown','wide-grip lat pulldown','close-grip lat pulldown'],
    'shoulder press':['overhead press','seated dumbbell shoulder press','arnold press'],
    'leg curl':['lying leg curl','seated leg curl'],
    'tricep':['rope pushdown','cable pushdown','skull crusher','overhead triceps extension'],
    'triceps':['rope pushdown','cable pushdown','skull crusher','overhead triceps extension'],
    'bicep':['barbell curl','ez-bar curl','incline dumbbell curl','cable curl','bayesian cable curl'],
    'biceps':['barbell curl','ez-bar curl','incline dumbbell curl','cable curl','bayesian cable curl'],
    'chest':['barbell bench press','incline barbell bench press','dumbbell bench press','incline dumbbell press','machine chest press','pec deck','cable fly','chest dip'],
    'back':['lat pulldown','seated cable row','seated row','barbell row','pull-up','chin-up'],
    'legs':['back squat','front squat','hack squat','leg press','leg extension','romanian deadlift','lying leg curl']
  };

  function removePromo(){
    const bad=['PAKISTAN-FIRST','Desi foods + global food search in one tracker.'];
    document.querySelectorAll('*').forEach(el=>{
      if(el.children.length)return;
      const t=(el.textContent||'').trim();
      if(!bad.includes(t))return;
      const parent=el.closest('.promo-card,.feature-card,.mf-promo,.card,article,div');
      if(parent&&parent!==document.body)parent.remove(); else el.remove();
    });
  }

  // The old video service was not reliable in a static browser build.
  // Remove its UI rather than leaving dead controls behind.
  function removeVideoUI(){
    ['mfFormVideoPanel','mfV18VideoHint','mfFormVideoBody','mfFormVideoTitle','mfFormVideoMeta'].forEach(id=>$(id)?.closest('.mf-form-video-panel')?.remove());
    document.querySelectorAll('.mf-watch-form,.mf-v18-watch,.mf-v183-watch,.mf-v18-video-hint,.mf-video-fallback,.mf-video-wrap').forEach(x=>x.remove());
    document.querySelectorAll('[data-mf-exercise]').forEach(b=>{if(/watch form/i.test(b.textContent||''))b.remove();});
  }

  // Meal suggestions were intentionally retired until the nutrition library is authoritative.
  function removeMealUI(){document.querySelectorAll('#mfMealCoach,.mf-meal-coach,[id*="MealCoach"]').forEach(x=>x.remove());}

  function trainingRecords(){
    const s=st();
    s.training=s.training||{};
    s.training.records=Array.isArray(s.training.records)?s.training.records:[];
    return s.training.records;
  }
  function oneRM(r){const w=n(r.weight),reps=n(r.reps);return w>0&&reps>0?w*(1+reps/30):0;}
  function progression(ex){
    const rs=trainingRecords().filter(r=>String(r.exercise||'').toLowerCase()===String(ex||'').toLowerCase()).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
    if(!rs.length)return null;
    const latest=rs[rs.length-1],prev=rs[rs.length-2],best=Math.max(...rs.map(oneRM));
    let recommendation='Repeat the current load and beat reps with clean technique.';
    if(prev&&oneRM(latest)>oneRM(prev)*1.015)recommendation='Progress achieved — keep the load until you can repeat the performance consistently.';
    if(n(latest.reps)>=12)recommendation=`Consider +${Math.max(.5,Math.round(n(latest.weight)*.025))}–${Math.max(1,Math.round(n(latest.weight)*.05))} kg next session, then rebuild reps.`;
    return {rs,latest,prev,best,recommendation};
  }

  function renderProgression(){
    const host=$('mfV22Progression'),sel=$('mfHistoryExercise');if(!host||!sel)return;
    const p=progression(sel.value);
    if(!p){host.innerHTML=`<div class="mf22-empty"><span class="pill">PROGRESSIVE OVERLOAD</span><h3>Ready for your first record</h3><p>Save a working set above. MacroForge will compare your performance against previous sessions and recommend the next small progression.</p></div>`;return;}
    const delta=p.prev?oneRM(p.latest)-oneRM(p.prev):0;
    host.innerHTML=`<div class="mf22-prog-head"><div><span class="pill">PROGRESSIVE OVERLOAD</span><h3>${esc(sel.value)}</h3><p>Double progression: improve reps first, then increase load modestly.</p></div><span class="mf22-live">TRACKING</span></div><div class="mf22-stat-grid"><div><span>Latest</span><b>${n(p.latest.weight)} kg × ${n(p.latest.reps)}</b><small>${n(p.latest.sets)||1} sets · RIR ${p.latest.rir??'—'}</small></div><div><span>Best estimated 1RM</span><b>${p.best.toFixed(1)} kg</b><small>${p.rs.length} recorded performance${p.rs.length===1?'':'s'}</small></div><div><span>Change vs previous</span><b>${p.prev?(delta>=0?'+':'')+delta.toFixed(1)+' kg':'—'}</b><small>estimated 1RM</small></div><div><span>Next target</span><b>${esc(p.recommendation)}</b><small>Only progress with consistent ROM and technique.</small></div></div>`;
  }

  function renderHistory(){
    const box=$('mfExerciseHistory'),sel=$('mfHistoryExercise');if(!box||!sel)return;
    let prog=$('mfV22Progression');
    if(!prog){prog=document.createElement('div');prog.id='mfV22Progression';prog.className='mf22-progression-panel';box.parentNode?.insertBefore(prog,box);}

    const ex=sel.value||'';
    const rs=trainingRecords().filter(r=>String(r.exercise||'').toLowerCase()===ex.toLowerCase()).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')));
    if(!rs.length){box.innerHTML=`<div class="mf22-empty"><div class="mf22-empty-icon">＋</div><div><b>No records for ${esc(ex||'this exercise')}</b><span>Save your first working set above to start your performance history.</span></div></div>`;renderProgression();return;}
    const best=Math.max(...rs.map(oneRM));
    box.innerHTML=`<div class="mf22-history-stack">${rs.slice().reverse().map((r,i)=>{const e=oneRM(r);return `<article class="mf22-history-card ${i===0?'latest':''}"><div class="mf22-history-main"><div class="mf22-date"><b>${esc(r.date)}</b>${i===0?'<span>LATEST</span>':''}</div><h4>${n(r.weight)} kg × ${n(r.reps)}</h4><p>${n(r.sets)||1} sets · RIR ${r.rir??'—'} · Est. 1RM ${e.toFixed(1)} kg ${Math.abs(e-best)<.001?'★ BEST':''}</p></div><button type="button" class="secondary-btn mf22-view-record" data-record-id="${esc(r.id)}">View details</button></article>`;}).join('')}</div>`;
    box.querySelectorAll('.mf22-view-record').forEach(b=>b.onclick=()=>openRecord(b.dataset.recordId));
    renderProgression();
  }

  function openRecord(id){
    const r=trainingRecords().find(x=>String(x.id)===String(id));if(!r)return;
    let m=$('mfV22RecordModal');if(!m){m=document.createElement('div');m.className='modal';m.id='mfV22RecordModal';document.body.appendChild(m);}
    const p=progression(r.exercise),e=oneRM(r);
    m.innerHTML=`<div class="modal-card mf22-modal"><button class="close" type="button" data-close>×</button><span class="pill">EXERCISE RECORD</span><div class="mf22-record-hero"><small>${esc(r.date)}</small><h2>${esc(r.exercise)}</h2><b>${n(r.weight)} kg × ${n(r.reps)}</b><span>${n(r.sets)||1} sets · RIR ${r.rir??'—'} · estimated 1RM ${e.toFixed(1)} kg</span></div><div class="mf22-detail-grid"><div><span>Load</span><b>${n(r.weight)} kg</b></div><div><span>Reps</span><b>${n(r.reps)}</b></div><div><span>Sets</span><b>${n(r.sets)||1}</b></div><div><span>RIR</span><b>${r.rir??'—'}</b></div></div><div class="mf22-coach"><span>PROGRESSION COACH</span><b>${esc(p?.recommendation||'Log another session to receive a target.')}</b></div><button type="button" class="secondary-btn full" data-close>Close</button></div>`;
    m.classList.add('open');m.querySelectorAll('[data-close]').forEach(x=>x.onclick=()=>m.classList.remove('open'));
  }

  function normalize(q){return String(q||'').toLowerCase().replace(/[–—]/g,'-').replace(/[^a-z0-9]+/g,' ').trim();}
  function exerciseMatches(q,x){
    if(!q)return true;
    const nq=normalize(q),hay=normalize(`${x[0]} ${x[1]} ${x[2]}`),expanded=(aliases[nq]||[]).map(normalize);
    return hay.includes(nq)||expanded.includes(normalize(x[0]))||nq.split(/\s+/).every(t=>hay.includes(t));
  }

  function workoutCards(){
    return [...document.querySelectorAll('#mfSplitCards .mf-split-card,#workoutTemplates .workout-card')].map(card=>{
      const title=card.querySelector('h3')?.textContent?.trim()||'';
      const desc=card.querySelector('p')?.textContent?.trim()||'';
      const assign=card.querySelector('[data-assign-split]')?.dataset.assignSplit||'';
      return {title,desc,assign,card};
    }).filter(x=>x.title);
  }

  function installSearchModal(){
    if($('mfV22SearchModal'))return;
    const m=document.createElement('div');m.className='modal';m.id='mfV22SearchModal';
    m.innerHTML=`<div class="modal-card mf22-search-modal" role="dialog" aria-modal="true" aria-labelledby="mfV22SearchTitle"><button class="close" type="button" data-close aria-label="Close search">×</button><span class="pill">TRAINING LIBRARY</span><h2 id="mfV22SearchTitle">Search workouts & exercises</h2><p class="muted">Search once. Find exercises, workout splits, and your assigned plan without leaving the app.</p><div class="mf22-search-field"><span>⌕</span><input id="mfV22SearchInput" placeholder="Try “seated row”, “lat pulldown”, “Push / Pull / Legs”…" autocomplete="off"></div><div class="mf22-filter-row"><button type="button" class="active" data-filter="all">All</button><button type="button" data-filter="exercise">Exercises</button><button type="button" data-filter="workout">Workouts</button></div><div id="mfV22AssignedSearch" class="mf22-search-assigned"></div><div id="mfV22SearchResults" class="mf22-search-results"></div></div>`;
    document.body.appendChild(m);
    let filter='all';

    const render=()=>{
      const q=($('mfV22SearchInput').value||'').trim();
      const results=$('mfV22SearchResults');
      const assigned=$('mfV22AssignedSearch');
      const ex=EXERCISES.filter(x=>exerciseMatches(q,x));
      const workouts=workoutCards().filter(w=>!q||normalize(`${w.title} ${w.desc}`).includes(normalize(q))||normalize(q).split(/\s+/).every(t=>normalize(`${w.title} ${w.desc}`).includes(t)));
      const tp=st().trainingPlan;
      assigned.innerHTML=tp?.schedule?.length?`<div class="mf22-search-assigned-card"><div><span class="pill">ASSIGNED NOW</span><b>${esc(currentAssignedLabel())}</b><small>Open Training Lab to record today's plan.</small></div><button type="button" class="secondary-btn" data-open-assigned>View plan</button></div>`:'';
      let html='';
      if(filter!=='workout'){
        const list=ex.slice(0,50);
        if(list.length)html+=`<div class="mf22-results-label">EXERCISES · ${list.length}${ex.length>50?'+':''}</div>${list.map(x=>`<button type="button" class="mf22-ex-result" data-ex="${esc(x[0])}"><span class="mf22-result-icon">↗</span><span><b>${esc(x[0])}</b><small>${esc(x[1])} · ${esc(x[2])}</small></span><strong>Use →</strong></button>`).join('')}`;
      }
      if(filter!=='exercise'){
        if(workouts.length)html+=`<div class="mf22-results-label">WORKOUTS · ${workouts.length}</div>${workouts.slice(0,30).map(w=>`<div class="mf22-workout-result"><span class="mf22-result-icon">▦</span><span><b>${esc(w.title)}</b><small>${esc(w.desc||'Workout split')}</small></span>${w.assign?`<button type="button" class="secondary-btn" data-assign-modal="${esc(w.assign)}">Assign</button>`:''}</div>`).join('')}`;
      }
      results.innerHTML=html||`<div class="mf22-empty"><b>No matching training item</b><span>Try “row”, “press”, “curl”, “squat”, or the name of a workout split.</span></div>`;
    };
    $('mfV22SearchInput').oninput=render;
    m.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;m.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render();});
    m.addEventListener('click',e=>{
      const ex=e.target.closest('.mf22-ex-result');
      if(ex){
        const name=ex.dataset.ex,sel=$('mfRecordExercise');
        if(sel){let opt=[...sel.options].find(o=>o.value.toLowerCase()===name.toLowerCase());if(!opt){opt=document.createElement('option');opt.value=name;opt.textContent=name;sel.appendChild(opt);}sel.value=name;sel.dispatchEvent(new Event('change',{bubbles:true}));}
        m.classList.remove('open');
        $('mfRecordExercise')?.scrollIntoView({behavior:'smooth',block:'center'});
        return;
      }
      const ab=e.target.closest('[data-assign-modal]');
      if(ab){
        const target=document.querySelector(`[data-assign-split="${CSS.escape(ab.dataset.assignModal)}"]`);
        if(target){target.click();setTimeout(()=>{m.classList.remove('open');refresh();},120);}else{m.classList.remove('open');toast('Open Workout Splits to assign this plan');}
        return;
      }
      const va=e.target.closest('[data-open-assigned]');
      if(va){m.classList.remove('open');goTrainingLab();}
    });
    m.querySelector('[data-close]').onclick=()=>m.classList.remove('open');
    m.addEventListener('keydown',e=>{if(e.key==='Escape')m.classList.remove('open');});
    m._render=render; m._setFilter=(x)=>{filter=x||'all';};
  }

  function goTrainingLab(){
    const nav=document.querySelector('[data-page="trainingLab"]');
    if(nav){nav.click();setTimeout(()=>refresh(),180);}
  }


  function ensureTrainingSearchButtons(){
    const lab=$('trainingLab');
    if(lab&&!$('mfV22OpenSearchLab')){
      const intro=lab.querySelector('.section-intro');
      const b=document.createElement('button'); b.type='button'; b.id='mfV22OpenSearchLab'; b.className='primary mf22-search-launch'; b.innerHTML='⌕ Search training';
      b.onclick=()=>openSearch();
      if(intro)intro.appendChild(b); else lab.prepend(b);
    }
    const workouts=$('workouts');
    if(workouts&&!$('mfV22OpenSearchWorkouts')){
      const intro=workouts.querySelector('.section-intro');
      const b=document.createElement('button'); b.type='button'; b.id='mfV22OpenSearchWorkouts'; b.className='secondary-btn mf22-search-launch'; b.innerHTML='⌕ Search workouts';
      b.onclick=()=>openSearch('workout');
      if(intro)intro.appendChild(b);
    }
  }

  function openSearch(filter='all'){
    installSearchModal();
    const m=$('mfV22SearchModal'); if(!m)return;
    m.classList.add('open');
    const input=$('mfV22SearchInput'); if(input){input.value='';input.focus();}
    m.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter===filter));
    m._setFilter?.(filter); m._render?.();
  }

  function currentAssignedIndex(){
    const tp=st().trainingPlan;
    if(!Array.isArray(tp?.schedule)||!tp.schedule.length)return -1;
    return (new Date().getDay()+6)%7;
  }
  function currentAssignedLabel(){
    const tp=st().trainingPlan,idx=currentAssignedIndex();
    return idx>=0?(tp.schedule[idx]||tp.schedule.find(Boolean)||'Assigned workout'):'Assigned workout';
  }

  function assignedExercisesForToday(){
    const s=st(),tp=s.trainingPlan,idx=currentAssignedIndex(),label=currentAssignedLabel();
    const pools={
      'Push':['Barbell Bench Press','Incline Dumbbell Press','Overhead Press','Dumbbell Lateral Raise','Rope Pushdown'],
      'Pull':['Lat Pulldown','Seated Cable Row','Barbell Row','Face Pull','Barbell Curl'],
      'Legs':['Back Squat','Leg Press','Romanian Deadlift','Lying Leg Curl','Standing Calf Raise'],
      'Chest':['Barbell Bench Press','Incline Dumbbell Press','Machine Chest Press','Pec Deck'],
      'Back':['Lat Pulldown','Seated Cable Row','Barbell Row','Face Pull'],
      'Quads':['Back Squat','Leg Press','Leg Extension','Bulgarian Split Squat'],
      'Hamstrings':['Romanian Deadlift','Lying Leg Curl','Seated Leg Curl','Hip Thrust'],
      'Shoulders':['Overhead Press','Dumbbell Lateral Raise','Rear Delt Fly','Face Pull'],
      'Arms':['Barbell Curl','Incline Dumbbell Curl','Rope Pushdown','Skull Crusher'],
      'Upper A':['Barbell Bench Press','Barbell Row','Overhead Press','Lat Pulldown','Barbell Curl'],
      'Upper B':['Incline Dumbbell Press','Seated Cable Row','Seated Dumbbell Shoulder Press','Cable Row','Rope Pushdown'],
      'Lower A':['Back Squat','Romanian Deadlift','Leg Press','Lying Leg Curl','Standing Calf Raise'],
      'Lower B':['Front Squat','Hip Thrust','Leg Extension','Seated Leg Curl','Seated Calf Raise'],
      'Full Body A':['Back Squat','Barbell Bench Press','Lat Pulldown','Romanian Deadlift'],
      'Full Body B':['Leg Press','Incline Dumbbell Press','Seated Cable Row','Hip Thrust'],
      'Full Body C':['Front Squat','Overhead Press','Lat Pulldown','Romanian Deadlift']
    };
    if(!tp?.schedule?.length)return [];
    if(label==='Rest')return [];
    const direct=pools[label]||[];
    if(direct.length)return direct;
    // For a custom assigned name, don't invent a workout. Only display exercises if the app's
    // stored plan explicitly carries them.
    const explicit=tp.exercisesByDay?.[idx]||tp.exercises?.[idx]||tp.exercises;
    return Array.isArray(explicit)?explicit.map(x=>typeof x==='string'?x:x?.name).filter(Boolean).slice(0,12):[];
  }

  function assignedWorkout(){
    const s=st(),tp=s.trainingPlan,lab=$('trainingLab');if(!lab)return;
    let box=$('mfV22Assigned');
    if(!box){box=document.createElement('section');box.className='panel mf22-assigned';box.id='mfV22Assigned';lab.prepend(box);}
    if(!tp?.schedule?.length){
      box.innerHTML=`<div class="mf22-unassigned"><div><span class="pill">NO WORKOUT ASSIGNED</span><h3>Choose a workout split</h3><p>Your existing Workout Splits tool controls assignment. Once assigned, today's session becomes interactive here.</p></div><button type="button" class="secondary-btn" data-open-splits>Open Workout Splits</button></div>`;
      box.querySelector('[data-open-splits]')?.addEventListener('click',()=>{document.querySelector('[data-page="programs"]')?.click();});
      return;
    }
    const idx=currentAssignedIndex(),day=currentAssignedLabel(),splitId=tp.splitId||'';
    const exercises=assignedExercisesForToday(); const todayRest=day==='Rest';
    const key=`${today()}::${day}`;
    const done=Array.isArray(s.assignedWorkoutProgress?.[key])?s.assignedWorkoutProgress[key]:[];
    box.innerHTML=`<div class="mf22-assigned-head"><div><span class="pill">ASSIGNED WORKOUT</span><h3>${esc(day)}</h3><p>${esc(splitId?formatSplitName(splitId):'Your assigned weekly plan')} · Day ${idx+1} of 7</p></div><span class="mf22-assigned-status">${todayRest?'REST':'ACTIVE'}</span></div><div class="mf22-assigned-grid"><div class="mf22-assigned-summary"><span>Today's status</span><b>${todayRest?'Recovery / Rest day':`${done.length}/${exercises.length||0} movements complete`}</b><small>${todayRest?'No workout is scheduled today.':'Tick movements as you complete them. Progress is saved locally and survives reload.'}</small></div><div class="mf22-assigned-summary"><span>Session control</span><b>${todayRest?'Recover':'Start / continue session'}</b><small>${todayRest?'Your next training day remains assigned.':'Use Search training to add an exercise to the record form or save working sets below.'}</small></div></div>${exercises.length&&!todayRest?`<div class="mf22-assigned-exercises"><div class="mf22-results-label">TODAY'S MOVEMENTS · TAP TO COMPLETE</div>${exercises.map((x,i)=>{const checked=done.includes(x);return `<label class="mf22-assigned-movement ${checked?'done':''}"><input type="checkbox" data-assigned-check="${esc(x)}" ${checked?'checked':''}><span>${i+1}</span><div><b>${esc(x)}</b><small>${checked?'Completed · keep the record':'Ready to train · tap when finished'}</small></div><strong>${checked?'✓':''}</strong></label>`;}).join('')}</div><div class="mf22-session-actions"><button type="button" class="primary" data-start-assigned>Start recording</button><button type="button" class="secondary-btn" data-search-assigned>Search exercise</button></div>`:''}`;
    box.querySelectorAll('[data-assigned-check]').forEach(input=>input.addEventListener('change',()=>{
      s.assignedWorkoutProgress=s.assignedWorkoutProgress||{}; const arr=new Set(Array.isArray(s.assignedWorkoutProgress[key])?s.assignedWorkoutProgress[key]:[]);
      input.checked?arr.add(input.dataset.assignedCheck):arr.delete(input.dataset.assignedCheck); s.assignedWorkoutProgress[key]=[...arr]; save(); assignedWorkout();
    }));
    box.querySelector('[data-start-assigned]')?.addEventListener('click',()=>{const first=exercises.find(x=>!done.includes(x))||exercises[0];const sel=$('mfRecordExercise');if(first&&sel){let o=[...sel.options].find(o=>o.value.toLowerCase()===first.toLowerCase());if(!o){o=document.createElement('option');o.value=first;o.textContent=first;sel.appendChild(o);}sel.value=first;}$('mfRecordWeight')?.focus();$('mfRecordExercise')?.scrollIntoView({behavior:'smooth',block:'center'});});
    box.querySelector('[data-search-assigned]')?.addEventListener('click',()=>openSearch('exercise'));
  }

  function formatSplitName(id){
    const names={fullbody:'Full Body 3×/week',upperlower:'Upper / Lower 4×',ppl:'Push / Pull / Legs',bro:'Bro Split 5×',single:'Single-Muscule Focus 6×',phul:'PHUL 4×',phat:'PHAT 5×'};
    return names[id]||String(id).replace(/[-_]/g,' ');
  }

  function styleWorkoutList(){
    const assigned=st().trainingPlan?.splitId||'';
    document.querySelectorAll('#workoutTemplates .workout-card,#mfSplitCards .mf-split-card').forEach((c,i)=>{
      c.classList.add('mf22-workout-card');
      const b=c.querySelector('button');
      if(b)b.classList.add('mf22-workout-action');
      const splitBtn=c.querySelector('[data-assign-split]');
      if(splitBtn){
        const active=assigned && splitBtn.dataset.assignSplit===assigned;
        splitBtn.textContent=active?'✓ Assigned':'Assign';
        splitBtn.classList.toggle('mf22-assigned-button',active);
        c.classList.toggle('mf22-active-workout',active);
        if(active && !c.querySelector('.mf22-active-badge')){
          const badge=document.createElement('span');badge.className='mf22-active-badge';badge.textContent='ACTIVE THIS WEEK';c.prepend(badge);
        }
      }
    });
  }


  function renderAssignedOnWorkoutsPage(){
    const host=$('workouts');if(!host)return;
    let box=$('mfV22AssignedWorkouts');
    if(!box){box=document.createElement('section');box.className='panel mf22-assigned mf22-assigned-workouts';box.id='mfV22AssignedWorkouts';host.insertBefore(box,host.querySelector('#workoutTemplates')||host.firstChild);}
    const tp=st().trainingPlan;
    if(!tp?.schedule?.length){box.innerHTML=`<div class="mf22-unassigned"><div><span class="pill">WORKOUT STATUS</span><h3>No weekly split assigned</h3><p>Assign a split in Workout Splits. The active day will then appear in both Workouts and Training Lab.</p></div></div>`;return;}
    const idx=currentAssignedIndex(),day=currentAssignedLabel(),ex=assignedExercisesForToday();
    box.innerHTML=`<div class="mf22-assigned-head"><div><span class="pill">ASSIGNED WEEKLY PLAN</span><h3>${esc(day)}</h3><p>${esc(tp.splitId?formatSplitName(tp.splitId):'Assigned split')} · Day ${idx+1}/7</p></div><span class="mf22-assigned-status">ASSIGNED</span></div><div class="mf22-assigned-strip"><b>Today's workout is active.</b><span>${ex.length?`${ex.length} movements ready in Training Lab.`:day==='Rest'?'Recovery day — no workout scheduled.':'Open Training Lab to record your session.'}</span><button type="button" class="secondary-btn" data-open-lab>Open Training Lab</button></div>${ex.length?`<div class="mf22-mini-exercises">${ex.map((x,i)=>`<div><span>${i+1}</span><b>${esc(x)}</b></div>`).join('')}</div>`:''}`;
    box.querySelector('[data-open-lab]')?.addEventListener('click',goTrainingLab);
  }

  function failureNote(){
    const lab=$('trainingLab');if(!lab||$('mfV22FailureNote'))return;
    const sec=document.createElement('section');sec.className='panel mf22-failure';sec.id='mfV22FailureNote';
    sec.innerHTML=`<div class="panel-head"><div><span class="pill">INTENSITY GUIDE</span><h3>Why failure matters — and when to use it</h3></div></div><div class="mf22-failure-grid"><div><b>What failure means</b><p>Technical failure is the point where another rep cannot be completed with the intended range of motion and controlled technique. Failure is an intensity tool, not a requirement for every set.</p></div><div><b>Most working sets</b><p>Keep about <strong>1–3 reps in reserve (RIR)</strong> on most sets. You still train hard while reducing unnecessary fatigue and technique breakdown.</p></div><div><b>When to reach failure</b><p>Use failure selectively on safer isolation or machine movements, often on the final set. Heavy free-weight compounds usually benefit from stopping short when fatigue would compromise technique.</p></div></div>`;
    lab.appendChild(sec);
  }

  function bindAssignmentRefresh(){
    if(document.documentElement.dataset.mfV22AssignBound==='1')return;
    document.documentElement.dataset.mfV22AssignBound='1';
    document.addEventListener('click',e=>{
      const assign=e.target.closest?.('[data-assign-split],#mfAssignSplit');
      if(assign)setTimeout(()=>{refresh();toast('Workout assigned — the active plan is now shown in Workouts and Training Lab.');},120);
      const page=e.target.closest?.('[data-page="trainingLab"],[data-page="workouts"]');
      if(page)setTimeout(refresh,180);
    },true);
  }

  function refresh(){
    removePromo();removeVideoUI();removeMealUI();installSearchModal();ensureTrainingSearchButtons();
    assignedWorkout();renderAssignedOnWorkoutsPage();failureNote();renderHistory();styleWorkoutList();
    const search=$('mfV22SearchInput');if(search&&$('mfV22SearchModal')?.classList.contains('open'))$('mfV22SearchModal')._render?.();
  }

  function install(){
    bindAssignmentRefresh();
    refresh();
    setTimeout(refresh,300);setTimeout(refresh,900);setTimeout(refresh,1800);
    setInterval(()=>{if(document.visibilityState!=='hidden')refresh();},5000);
    const obs=new MutationObserver(()=>{
      if(window.__mfV22Busy)return;
      window.__mfV22Busy=true;
      requestAnimationFrame(()=>{window.__mfV22Busy=false;removePromo();removeVideoUI();removeMealUI();});
    });
    obs.observe(document.body,{childList:true,subtree:true});
  }

  // Inject only this layer's styles. Existing styles remain untouched.
  function styles(){
    if($('mf22styles'))return;
    const s=document.createElement('style');s.id='mf22styles';s.textContent=`
      .mf22-search-modal{width:min(760px,calc(100vw - 24px));max-height:min(86vh,820px);overflow:auto}
      .mf22-search-field{display:flex;align-items:center;gap:10px;border:1px solid #29463a;background:#07100d;border-radius:14px;padding:0 13px;margin:14px 0 10px}
      .mf22-search-field>span{font-size:20px;color:#d9ff64}.mf22-search-field input{border:0!important;outline:0!important;background:transparent!important;padding:14px 0!important;color:#eef8f3!important;width:100%;font-size:15px}
      .mf22-filter-row{display:flex;flex-wrap:wrap;gap:7px;margin:8px 0 12px}.mf22-filter-row button{border:1px solid #29463a;background:#07100d;color:#b6c9c0;border-radius:999px;padding:8px 12px;cursor:pointer}.mf22-filter-row button.active{background:#d9ff64;color:#07100d;border-color:#d9ff64}
      .mf22-results-label{font-size:10px;letter-spacing:.12em;color:#789187;font-weight:800;margin:14px 0 7px}.mf22-search-results{display:grid;gap:7px}.mf22-ex-result,.mf22-workout-result{width:100%;box-sizing:border-box;display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:10px;text-align:left;border:1px solid #1c332a;background:#07100d;color:#eef8f3;border-radius:13px;padding:11px;cursor:pointer}.mf22-ex-result:hover,.mf22-workout-result:hover{border-color:#315243;background:#0b1712}.mf22-ex-result>b,.mf22-workout-result>b{font-size:11px}.mf22-ex-result span:nth-child(2),.mf22-workout-result span:nth-child(2){min-width:0}.mf22-ex-result b,.mf22-ex-result small,.mf22-workout-result b,.mf22-workout-result small{display:block}.mf22-ex-result small,.mf22-workout-result small{color:#91a59d;font-size:10px;margin-top:3px;white-space:normal}.mf22-result-icon{width:30px;height:30px;border-radius:9px;background:#10221b;color:#d9ff64;display:grid;place-items:center;font-weight:800}.mf22-search-assigned{margin-bottom:8px}.mf22-search-assigned-card{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid #315243;background:#10221b;border-radius:14px}.mf22-search-assigned-card b,.mf22-search-assigned-card small{display:block}.mf22-search-assigned-card small{font-size:10px;color:#9eb1a8;margin-top:3px}.mf22-workout-result{cursor:default}.mf22-workout-result .secondary-btn{white-space:nowrap}
      .mf22-assigned{border-color:#315243!important;background:linear-gradient(180deg,#0c1a15,#07100d)!important}.mf22-assigned-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}.mf22-assigned-head h3{margin:7px 0 3px}.mf22-assigned-head p{margin:0;color:#91a59d;font-size:11px}.mf22-assigned-status{font-size:9px;font-weight:900;letter-spacing:.1em;padding:7px 9px;border-radius:999px;background:#d9ff64;color:#07100d;white-space:nowrap}.mf22-assigned-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}.mf22-assigned-summary{padding:13px;border:1px solid #1c332a;background:#07100d;border-radius:13px}.mf22-assigned-summary span,.mf22-assigned-summary b,.mf22-assigned-summary small{display:block}.mf22-assigned-summary span{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#789187}.mf22-assigned-summary b{font-size:14px;margin-top:5px}.mf22-assigned-summary small{font-size:10px;color:#91a59d;line-height:1.45;margin-top:4px}.mf22-assigned-exercises{margin-top:13px}.mf22-assigned-exercises>div:not(.mf22-results-label){display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:9px;padding:9px 0;border-top:1px solid #183126}.mf22-assigned-exercises>div span{width:25px;height:25px;border-radius:8px;background:#10221b;color:#d9ff64;display:grid;place-items:center;font-size:10px;font-weight:800}.mf22-assigned-exercises b{font-size:11px}.mf22-assigned-exercises small{font-size:9px;color:#789187}.mf22-unassigned{display:flex;align-items:center;justify-content:space-between;gap:16px}.mf22-unassigned h3{margin:7px 0 4px}.mf22-unassigned p{margin:0;color:#91a59d;font-size:11px;line-height:1.5;max-width:650px}.mf22-assigned-strip{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:13px;padding:11px 12px;border:1px solid #1c332a;background:#07100d;border-radius:12px}.mf22-assigned-strip span{color:#91a59d;font-size:10px;flex:1}.mf22-mini-exercises{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:10px}.mf22-mini-exercises>div{display:flex;align-items:center;gap:8px;padding:9px;border:1px solid #1c332a;background:#07100d;border-radius:11px}.mf22-mini-exercises span{width:23px;height:23px;border-radius:7px;background:#10221b;color:#d9ff64;display:grid;place-items:center;font-size:9px;font-weight:800}.mf22-mini-exercises b{font-size:10px}
      .mf22-search-launch{margin-left:auto;white-space:nowrap}.mf22-assigned-movement{display:grid;grid-template-columns:20px 28px 1fr 20px;align-items:center;gap:9px;padding:10px 0;border-top:1px solid #183126;cursor:pointer}.mf22-assigned-movement input{accent-color:#d9ff64}.mf22-assigned-movement>span{width:25px;height:25px;border-radius:8px;background:#10221b;color:#d9ff64;display:grid;place-items:center;font-size:10px;font-weight:800}.mf22-assigned-movement b,.mf22-assigned-movement small{display:block}.mf22-assigned-movement small{font-size:9px;color:#789187;margin-top:3px}.mf22-assigned-movement strong{color:#d9ff64}.mf22-assigned-movement.done{opacity:.72}.mf22-session-actions{display:flex;gap:8px;margin-top:12px}.mf22-progression-panel{margin:12px 0;padding:14px;border:1px solid #315243;background:linear-gradient(180deg,#10221b,#07100d);border-radius:14px}.mf22-progression-panel .mf22-stat-grid{margin-top:10px}.mf22-progression-panel:before{content:'LIVE PROGRESSIVE OVERLOAD';display:block;font-size:9px;letter-spacing:.12em;font-weight:900;color:#d9ff64;margin-bottom:4px}
      .mf22-workout-card{transition:transform .16s ease,border-color .16s ease,background .16s ease}.mf22-workout-card:hover{transform:translateY(-1px);border-color:#315243!important;background:#0b1712!important}.mf22-workout-action{min-width:110px}.mf22-active-workout{border-color:#315243!important;background:#0b1712!important;box-shadow:0 0 0 1px rgba(217,255,100,.08)}.mf22-assigned-button{background:#d9ff64!important;color:#07100d!important;border-color:#d9ff64!important}.mf22-active-badge{display:inline-flex;align-items:center;width:max-content;margin-bottom:7px;font-size:8px;font-weight:900;letter-spacing:.1em;color:#07100d;background:#d9ff64;border-radius:999px;padding:5px 8px}
      .mf22-prog-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.mf22-prog-head h3{margin:7px 0 4px}.mf22-prog-head p{margin:0;color:#91a59d;font-size:11px}.mf22-live{font-size:9px;font-weight:900;letter-spacing:.1em;padding:6px 8px;border-radius:999px;background:#10221b;color:#d9ff64;border:1px solid #315243}.mf22-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:13px}.mf22-stat-grid>div{padding:13px;border:1px solid #1c332a;background:#07100d;border-radius:13px}.mf22-stat-grid span,.mf22-stat-grid b,.mf22-stat-grid small{display:block}.mf22-stat-grid span{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#789187}.mf22-stat-grid b{font-size:13px;margin-top:6px;line-height:1.35}.mf22-stat-grid small{font-size:9px;color:#91a59d;line-height:1.45;margin-top:4px}.mf22-history-stack{display:grid;gap:8px}.mf22-history-card{display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;padding:12px 13px;border:1px solid #1c332a;background:#07100d;border-radius:13px}.mf22-history-card.latest{border-color:#315243;background:#0b1712}.mf22-date{display:flex;align-items:center;gap:7px}.mf22-date b{font-size:10px}.mf22-date span{font-size:8px;color:#d9ff64;font-weight:900}.mf22-history-main h4{margin:6px 0 2px;font-size:15px}.mf22-history-main p{margin:0;color:#91a59d;font-size:10px}.mf22-empty{padding:18px;border:1px dashed #365548;border-radius:13px;background:#07100d}.mf22-empty b,.mf22-empty span{display:block}.mf22-empty span{font-size:10px;color:#91a59d;margin-top:4px;line-height:1.5}.mf22-empty-icon{width:34px;height:34px;border-radius:9px;background:#10221b;color:#d9ff64;display:grid;place-items:center;margin-bottom:9px}.mf22-modal{max-width:650px}.mf22-record-hero{padding:17px;border:1px solid #1c332a;background:#07100d;border-radius:14px;margin-top:9px}.mf22-record-hero small,.mf22-record-hero span{display:block;color:#91a59d}.mf22-record-hero h2{margin:5px 0 8px}.mf22-record-hero>b{font-size:27px}.mf22-record-hero span{font-size:10px;margin-top:5px}.mf22-detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:10px 0}.mf22-detail-grid>div{padding:11px;border:1px solid #1c332a;background:#07100d;border-radius:11px}.mf22-detail-grid span,.mf22-detail-grid b{display:block}.mf22-detail-grid span{font-size:9px;color:#789187;text-transform:uppercase}.mf22-detail-grid b{margin-top:4px;font-size:12px}.mf22-coach{padding:12px;border:1px solid #315243;background:#10221b;border-radius:12px;margin-bottom:10px}.mf22-coach span,.mf22-coach b{display:block}.mf22-coach span{font-size:9px;color:#d9ff64;font-weight:900}.mf22-coach b{font-size:11px;line-height:1.45;margin-top:5px}.mf22-failure-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.mf22-failure-grid>div{padding:13px;border:1px solid #1c332a;background:#07100d;border-radius:13px}.mf22-failure-grid b{font-size:11px}.mf22-failure-grid p{margin:6px 0 0;color:#91a59d;font-size:10px;line-height:1.55}
      @media(max-width:850px){.mf22-assigned-grid,.mf22-failure-grid,.mf22-stat-grid{grid-template-columns:1fr 1fr}.mf22-mini-exercises{grid-template-columns:1fr}.mf22-unassigned{align-items:flex-start;flex-direction:column}.mf22-workout-result{grid-template-columns:30px 1fr}.mf22-workout-result .secondary-btn{grid-column:2;justify-self:start}}
      @media(max-width:560px){.mf22-search-launch{margin-left:0;width:100%}.mf22-session-actions{flex-direction:column}.mf22-search-modal{width:calc(100vw - 16px);max-height:92vh;padding:14px}.mf22-assigned-head,.mf22-search-assigned-card{align-items:flex-start;flex-direction:column}.mf22-assigned-status{align-self:flex-start}.mf22-assigned-grid,.mf22-failure-grid,.mf22-stat-grid{grid-template-columns:1fr}.mf22-history-card{grid-template-columns:1fr}.mf22-history-card .mf22-view-record{width:100%}.mf22-detail-grid{grid-template-columns:1fr 1fr}.mf22-ex-result{grid-template-columns:30px 1fr}.mf22-ex-result strong{grid-column:2;justify-self:start}.mf22-assigned-strip{align-items:flex-start}.mf22-assigned-strip .secondary-btn{width:100%}}
    `;document.head.appendChild(s);
  }

  function finalInstall(){styles();install();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',finalInstall,{once:true});else finalInstall();
  window.MacroForgeV22={refresh,openRecord,assignedWorkout};
})();
