/* =========================================================
   MACROFORGE V18 — AI COACH + DYNAMIC BODY COMPOSITION +
   CARDIO RANKINGS + EXERCISE LIBRARY + FOOD/MEAL FIXES
   ========================================================= */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const today=()=>window.today?.()||new Date().toISOString().slice(0,10);
  const st=()=>window.state||{};
  const save=()=>window.save?.();
  const toast=m=>window.toast?.(m);

  /* ---------------------------------------------------------
     1) Remove the old manual Workouts tab. Training Lab and
        Workout Splits remain the actual planning tools.
     --------------------------------------------------------- */
  function removeWorkoutsTab(){
    document.querySelectorAll('[data-page="workouts"]').forEach(x=>x.remove());
    document.querySelectorAll('[data-page-link="workouts"]').forEach(x=>{
      x.dataset.pageLink='trainingLab';
      const b=x.querySelector('b'); if(b)b.textContent='Training Lab';
      const s=x.querySelector('small'); if(s)s.textContent="Build or record today's training";
    });
    const p=$('workouts'); if(p)p.remove();
  }

  /* ---------------------------------------------------------
     2) Much larger exercise library.
     type = free | machine | cable | smith | bodyweight | band
     --------------------------------------------------------- */
  const EX2=[
    // Chest — free weight / bodyweight
    ['Barbell Bench Press','Chest','free'],['Paused Barbell Bench Press','Chest','free'],['Spoto Press','Chest','free'],['Close-Grip Bench Press','Chest/Triceps','free'],['Wide-Grip Bench Press','Chest','free'],['Incline Barbell Bench Press','Upper Chest','free'],['Low-Incline Barbell Press','Upper Chest','free'],['Decline Barbell Bench Press','Chest','free'],['Dumbbell Bench Press','Chest','free'],['Incline Dumbbell Press','Upper Chest','free'],['Low-Incline Dumbbell Press','Upper Chest','free'],['Neutral-Grip Dumbbell Press','Chest','free'],['Dumbbell Floor Press','Chest/Triceps','free'],['Dumbbell Squeeze Press','Chest','free'],['Dumbbell Fly','Chest','free'],['Incline Dumbbell Fly','Upper Chest','free'],['Deficit Push-Up','Chest','bodyweight'],['Weighted Push-Up','Chest','bodyweight'],['Ring Push-Up','Chest','bodyweight'],['Archer Push-Up','Chest','bodyweight'],['Chest Dip','Chest/Triceps','bodyweight'],
    // Chest machines / cables
    ['Machine Chest Press','Chest','machine'],['Plate-Loaded Chest Press','Chest','machine'],['Hammer Strength Chest Press','Chest','machine'],['Incline Machine Press','Upper Chest','machine'],['Decline Machine Press','Chest','machine'],['Pec Deck','Chest','machine'],['Reverse-Grip Machine Press','Upper Chest','machine'],['Cable Chest Press','Chest','cable'],['Standing Cable Press','Chest','cable'],['Single-Arm Cable Press','Chest','cable'],['Cable Fly','Chest','cable'],['Low-to-High Cable Fly','Upper Chest','cable'],['High-to-Low Cable Fly','Chest','cable'],['Cable Crossover','Chest','cable'],['Single-Arm Cable Fly','Chest','cable'],
    // Back vertical
    ['Pull-Up','Back','bodyweight'],['Weighted Pull-Up','Back','bodyweight'],['Neutral-Grip Pull-Up','Back','bodyweight'],['Wide-Grip Pull-Up','Back','bodyweight'],['Chin-Up','Back/Biceps','bodyweight'],['Weighted Chin-Up','Back/Biceps','bodyweight'],['Commando Pull-Up','Back','bodyweight'],['Lat Pulldown','Lats','machine'],['Wide-Grip Lat Pulldown','Lats','machine'],['Close-Grip Lat Pulldown','Lats','machine'],['Neutral-Grip Lat Pulldown','Lats','machine'],['Single-Arm Lat Pulldown','Lats','cable'],['Kneeling Single-Arm Pulldown','Lats','cable'],['Straight-Arm Pulldown','Lats','cable'],['Rope Straight-Arm Pulldown','Lats','cable'],['Machine Pullover','Lats','machine'],['Dumbbell Pullover','Lats','free'],['Cable Pullover','Lats','cable'],
    // Back rows free
    ['Barbell Row','Back','free'],['Pendlay Row','Back','free'],['Yates Row','Back','free'],['Seal Row','Back','free'],['Meadows Row','Back','free'],['One-Arm Dumbbell Row','Back','free'],['Chest-Supported Dumbbell Row','Back','free'],['Kroc Row','Back','free'],['T-Bar Row','Back','free'],['Landmine Row','Back','free'],['Dead-Stop Row','Back','free'],['Helms Row','Back','free'],
    // Back machines/cables
    ['Chest-Supported Machine Row','Back','machine'],['Plate-Loaded Row','Back','machine'],['Hammer Strength Row','Back','machine'],['Iso-Lateral High Row','Upper Back','machine'],['Iso-Lateral Low Row','Back','machine'],['Seated Cable Row','Back','cable'],['Close-Grip Cable Row','Back','cable'],['Wide-Grip Cable Row','Back','cable'],['Single-Arm Cable Row','Back','cable'],['Cable Face Pull Row','Rear Delts/Back','cable'],['Machine High Row','Back','machine'],['Machine Low Row','Back','machine'],
    // Lower body squat
    ['Back Squat','Quads/Glutes','free'],['High-Bar Back Squat','Quads','free'],['Low-Bar Back Squat','Glutes/Quads','free'],['Front Squat','Quads','free'],['Zercher Squat','Quads/Glutes','free'],['Anderson Squat','Quads/Glutes','free'],['Pause Squat','Quads/Glutes','free'],['Box Squat','Quads/Glutes','free'],['Safety-Bar Squat','Quads/Glutes','free'],['Goblet Squat','Quads','free'],['Cyclist Squat','Quads','free'],['Bulgarian Split Squat','Quads/Glutes','free'],['Front-Foot Elevated Split Squat','Quads/Glutes','free'],['Reverse Lunge','Legs','free'],['Walking Lunge','Legs','free'],['Deficit Reverse Lunge','Legs','free'],['Forward Lunge','Legs','free'],['Step-Up','Legs','free'],['Lateral Step-Up','Glutes','free'],['Cossack Squat','Adductors/Quads','bodyweight'],
    // Lower machines
    ['Leg Press','Quads/Glutes','machine'],['45-Degree Leg Press','Quads/Glutes','machine'],['Horizontal Leg Press','Quads/Glutes','machine'],['Hack Squat','Quads','machine'],['Pendulum Squat','Quads','machine'],['Belt Squat','Quads/Glutes','machine'],['Smith Machine Squat','Quads/Glutes','smith'],['Smith Machine Split Squat','Quads/Glutes','smith'],['Smith Machine Reverse Lunge','Legs','smith'],['Leg Extension','Quads','machine'],['Single-Leg Extension','Quads','machine'],
    // Hamstrings/glutes
    ['Romanian Deadlift','Hamstrings/Glutes','free'],['Stiff-Leg Deadlift','Hamstrings','free'],['Conventional Deadlift','Posterior Chain','free'],['Sumo Deadlift','Posterior Chain','free'],['Trap-Bar Deadlift','Posterior Chain','free'],['Deficit Deadlift','Posterior Chain','free'],['Block Pull','Back/Glutes','free'],['Rack Pull','Back/Glutes','free'],['Good Morning','Hamstrings/Back','free'],['Barbell Hip Thrust','Glutes','free'],['Dumbbell Hip Thrust','Glutes','free'],['Barbell Glute Bridge','Glutes','free'],['Cable Pull-Through','Glutes','cable'],['Cable Kickback','Glutes','cable'],['Hip Abduction Machine','Glutes','machine'],['Hip Adduction Machine','Adductors','machine'],['Lying Leg Curl','Hamstrings','machine'],['Seated Leg Curl','Hamstrings','machine'],['Single-Leg Curl','Hamstrings','machine'],['Nordic Hamstring Curl','Hamstrings','bodyweight'],['Glute-Ham Raise','Hamstrings','bodyweight'],['Reverse Hyperextension','Posterior Chain','machine'],['45-Degree Back Extension','Glutes/Hamstrings','machine'],
    // Calves/tibialis
    ['Standing Calf Raise','Calves','machine'],['Seated Calf Raise','Calves','machine'],['Leg Press Calf Raise','Calves','machine'],['Donkey Calf Raise','Calves','machine'],['Single-Leg Calf Raise','Calves','bodyweight'],['Smith Machine Calf Raise','Calves','smith'],['Tibialis Raise','Tibialis','bodyweight'],['Cable Tibialis Raise','Tibialis','cable'],
    // Shoulders free
    ['Barbell Overhead Press','Shoulders','free'],['Seated Barbell Press','Shoulders','free'],['Push Press','Shoulders','free'],['Bradford Press','Shoulders','free'],['Seated Dumbbell Shoulder Press','Shoulders','free'],['Arnold Press','Shoulders','free'],['Z-Press','Shoulders','free'],['Single-Arm Dumbbell Press','Shoulders','free'],['Landmine Press','Shoulders','free'],['Single-Arm Landmine Press','Shoulders','free'],['Dumbbell Lateral Raise','Side Delts','free'],['Lean-Away Lateral Raise','Side Delts','free'],['Seated Lateral Raise','Side Delts','free'],['Dumbbell Y-Raise','Shoulders','free'],['Rear Delt Dumbbell Fly','Rear Delts','free'],['Chest-Supported Rear Delt Raise','Rear Delts','free'],
    // Shoulder machines/cables
    ['Machine Shoulder Press','Shoulders','machine'],['Plate-Loaded Shoulder Press','Shoulders','machine'],['Machine Lateral Raise','Side Delts','machine'],['Cable Lateral Raise','Side Delts','cable'],['Behind-the-Body Cable Lateral Raise','Side Delts','cable'],['Cable Y-Raise','Shoulders','cable'],['Cable Front Raise','Front Delts','cable'],['Cable Rear Delt Fly','Rear Delts','cable'],['Reverse Pec Deck','Rear Delts','machine'],['Face Pull','Rear Delts','cable'],['Cable Upright Row','Shoulders','cable'],
    // Biceps
    ['Barbell Curl','Biceps','free'],['EZ-Bar Curl','Biceps','free'],['Close-Grip EZ Curl','Biceps','free'],['Wide-Grip EZ Curl','Biceps','free'],['Incline Dumbbell Curl','Biceps','free'],['Alternating Dumbbell Curl','Biceps','free'],['Seated Dumbbell Curl','Biceps','free'],['Bayesian Cable Curl','Biceps','cable'],['Cable Curl','Biceps','cable'],['High Cable Curl','Biceps','cable'],['Preacher Curl','Biceps','free'],['Machine Preacher Curl','Biceps','machine'],['Spider Curl','Biceps','free'],['Concentration Curl','Biceps','free'],['Hammer Curl','Brachialis','free'],['Cross-Body Hammer Curl','Brachialis','free'],['Reverse Curl','Forearms/Biceps','free'],['Zottman Curl','Biceps/Forearms','free'],['Drag Curl','Biceps','free'],['Bayesian Curl','Biceps','cable'],
    // Triceps
    ['Close-Grip Bench Press','Triceps','free'],['JM Press','Triceps','free'],['Skull Crusher','Triceps','free'],['EZ-Bar Skull Crusher','Triceps','free'],['Rolling Dumbbell Triceps Extension','Triceps','free'],['Dumbbell Overhead Extension','Triceps','free'],['Single-Arm Overhead Extension','Triceps','cable'],['Cable Pushdown','Triceps','cable'],['Rope Pushdown','Triceps','cable'],['Straight-Bar Pushdown','Triceps','cable'],['Single-Arm Pushdown','Triceps','cable'],['Cross-Body Cable Extension','Triceps','cable'],['Machine Triceps Extension','Triceps','machine'],['Assisted Dip','Triceps/Chest','machine'],
    // Core
    ['Ab Wheel Rollout','Core','free'],['Hanging Leg Raise','Abs','bodyweight'],['Hanging Knee Raise','Abs','bodyweight'],['Captain Chair Knee Raise','Abs','machine'],['Cable Crunch','Abs','cable'],['Kneeling Cable Crunch','Abs','cable'],['Machine Crunch','Abs','machine'],['Weighted Crunch','Abs','free'],['Decline Sit-Up','Abs','bodyweight'],['Reverse Crunch','Abs','bodyweight'],['Pallof Press','Core','cable'],['Dead Bug','Core','bodyweight'],['Bird Dog','Core','bodyweight'],['Plank','Core','bodyweight'],['Side Plank','Core','bodyweight'],['Suitcase Carry','Core/Grip','free'],['Farmer Carry','Core/Grip','free'],['Front Rack Carry','Core/Grip','free'],
    // Bands / specialty
    ['Band Chest Press','Chest','band'],['Band Fly','Chest','band'],['Band Row','Back','band'],['Band Lat Pulldown','Back','band'],['Band Face Pull','Rear Delts','band'],['Band Lateral Raise','Side Delts','band'],['Band Curl','Biceps','band'],['Band Pushdown','Triceps','band'],['Band Leg Curl','Hamstrings','band'],['Band Hip Abduction','Glutes','band']
  ];
  EX2.push(
    ['Incline Hammer Strength Press','Upper Chest','machine'],['Iso-Lateral Decline Press','Chest','machine'],['Iso-Lateral Incline Press','Upper Chest','machine'],['Converging Chest Press','Chest','machine'],['Vertical Chest Press','Chest','machine'],
    ['Dual Cable Press','Chest','cable'],['Cable Press-Around','Chest','cable'],['Standing Cable Fly','Chest','cable'],['Cable Fly From Low Pulley','Upper Chest','cable'],['Cable Fly From High Pulley','Chest','cable'],
    ['Assisted Pull-Up','Back','machine'],['Assisted Chin-Up','Back/Biceps','machine'],['Pullover Machine','Lats','machine'],['Iso-Lateral Pulldown','Lats','machine'],['Converging Lat Pulldown','Lats','machine'],['Chest-Supported T-Bar Row','Back','machine'],['Iso-Lateral Row','Back','machine'],['Seated High Row','Upper Back','machine'],['Cable Meadows Row','Back','cable'],['Cable T-Bar Row','Back','cable'],
    ['Smith Machine Bench Press','Chest','smith'],['Smith Machine Incline Press','Upper Chest','smith'],['Smith Machine Decline Press','Chest','smith'],['Smith Machine Close-Grip Press','Triceps','smith'],['Smith Machine Calf Raise','Calves','smith'],['Smith Machine Romanian Deadlift','Hamstrings','smith'],['Smith Machine Hip Thrust','Glutes','smith'],
    ['Belt Squat March','Quads/Glutes','machine'],['Reverse Hack Squat','Quads','machine'],['V-Squat','Quads/Glutes','machine'],['Pendulum Hack Squat','Quads','machine'],['Sissy Squat Machine','Quads','machine'],['Glute Drive Machine','Glutes','machine'],['Hip Thrust Machine','Glutes','machine'],['Standing Leg Curl Machine','Hamstrings','machine'],['Prone Leg Curl','Hamstrings','machine'],['Seated Calf Press','Calves','machine'],['Calf Press Machine','Calves','machine'],
    ['Dumbbell Romanian Deadlift','Hamstrings','free'],['Single-Leg Romanian Deadlift','Hamstrings/Glutes','free'],['B-Stance Romanian Deadlift','Hamstrings/Glutes','free'],['Barbell Good Morning','Hamstrings/Back','free'],['Seated Good Morning','Hamstrings','free'],['Barbell Reverse Lunge','Legs','free'],['Deficit Bulgarian Split Squat','Quads/Glutes','free'],['Walking Dumbbell Lunge','Legs','free'],['Dumbbell Step-Up','Legs','free'],['Front Rack Walking Lunge','Legs','free'],
    ['Dumbbell Shrug','Traps','free'],['Barbell Shrug','Traps','free'],['Behind-the-Back Barbell Shrug','Traps','free'],['Cable Shrug','Traps','cable'],['Machine Shrug','Traps','machine'],['Trap-3 Raise','Upper Back','free'],['Prone Y-Raise','Lower Traps','free'],['Prone T-Raise','Rear Delts','free'],['Prone W-Raise','Rear Delts','free'],
    ['Cable Front Raise','Front Delts','cable'],['Plate Front Raise','Front Delts','free'],['Dumbbell Front Raise','Front Delts','free'],['Machine Rear Delt Fly','Rear Delts','machine'],['Single-Arm Reverse Pec Deck','Rear Delts','machine'],['Cable External Rotation','Rotator Cuff','cable'],['Cable Internal Rotation','Rotator Cuff','cable'],['Band External Rotation','Rotator Cuff','band'],
    ['Incline Cable Curl','Biceps','cable'],['Single-Arm Cable Curl','Biceps','cable'],['Cable Preacher Curl','Biceps','cable'],['Machine Bayesian Curl','Biceps','machine'],['Hammer Preacher Curl','Brachialis','machine'],['Reverse EZ Curl','Forearms','free'],['Wrist Curl','Forearms','free'],['Reverse Wrist Curl','Forearms','free'],['Behind-the-Back Wrist Curl','Forearms','free'],
    ['Overhead Rope Extension','Triceps','cable'],['Cross-Body Rope Extension','Triceps','cable'],['Single-Arm Reverse-Grip Pushdown','Triceps','cable'],['Cable Kickback','Triceps','cable'],['Dumbbell Kickback','Triceps','free'],['Machine Dip','Triceps/Chest','machine'],['Assisted Triceps Dip','Triceps','machine'],
    ['Cable Wood Chop','Obliques','cable'],['Cable Lift','Obliques','cable'],['Landmine Rotation','Core','free'],['Landmine Anti-Rotation Press','Core','free'],['Cable Anti-Rotation Hold','Core','cable'],['Weighted Plank','Core','free'],['RKC Plank','Core','bodyweight'],['Hollow Body Hold','Core','bodyweight'],['Dragon Flag','Abs','bodyweight'],['Toes-to-Bar','Abs','bodyweight'],['Cable Leg Raise','Abs','cable'],['Machine Torso Rotation','Obliques','machine'],
    ['Sled Push','Conditioning','machine'],['Sled Drag','Conditioning','machine'],['Prowler Push','Conditioning','machine'],['Yoke Carry','Core/Grip','free'],['Waiter Carry','Core/Grip','free'],['Overhead Carry','Core/Shoulders','free'],['Sandbag Carry','Conditioning','free'],['Sandbag Squat','Legs','free'],['Sandbag Clean','Full Body','free']
  );

  const uniqueExercises=[]; const exSeen=new Set();
  EX2.forEach(x=>{const k=x[0].toLowerCase();if(!exSeen.has(k)){exSeen.add(k);uniqueExercises.push(x);}});

  function exerciseOptions(){return uniqueExercises.map(x=>`<option value="${esc(x[0])}">${esc(x[0])} — ${esc(x[1])} · ${esc(x[2])}</option>`).join('');}
  function exMatch(q,x){return !q||`${x[0]} ${x[1]} ${x[2]}`.toLowerCase().includes(q.toLowerCase());}

  /* ---------------------------------------------------------
     3) Training Lab: large catalogue, machine filter, record
        fields stay intact, and video is actually shown in-app.
     --------------------------------------------------------- */
  async function fetchVideo(name){
    try{
      const r=await fetch('https://exercise-database.zenithfits.com/api/v1/search?q='+encodeURIComponent(name),{headers:{Accept:'application/json'},cache:'no-store'});
      if(!r.ok)throw new Error('video service '+r.status);
      const j=await r.json(); const arr=Array.isArray(j?.data)?j.data:[];
      if(!arr.length)return null;
      return arr.find(x=>String(x.name||'').toLowerCase()===name.toLowerCase())||arr[0];
    }catch(e){console.warn('V18 exercise video lookup',e);return null;}
  }
  async function showVideo(name){
    const body=$('mfFormVideoBody'),title=$('mfFormVideoTitle'),meta=$('mfFormVideoMeta');
    if(!body)return;
    name=String(name||'Exercise form').trim();
    title.textContent=name;
    meta.textContent='Loading exercise demonstration…';
    body.innerHTML='<div class="mf-video-loading">Finding an exercise demonstration…</div>';

    // Try the live exercise database first.
    let data=null;
    try{ data=await fetchVideo(name); }catch(e){ console.warn('Exercise video lookup failed',e); }

    const src=data?.videos?.male||data?.videos?.female;
    if(src){
      const poster=data?.thumbnails?.male||data?.thumbnails?.female||'';
      meta.textContent=`${data.target||'Exercise'} · ${data.equipment||'Gym'} · ${data.difficulty||'Technique'}`;
      body.innerHTML=`<div class="mf-video-wrap"><video controls playsinline preload="metadata" ${poster?`poster="${esc(poster)}"`:''} src="${esc(src)}"></video></div>
      <div class="mf-video-details">
        <div><b>How to perform</b><ol>${(data.steps||[]).slice(0,8).map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>
        <div><b>Form cues</b><ul>${(data.formCues||[]).slice(0,8).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><b>Common mistakes</b><ul>${(data.commonMistakes||[]).slice(0,6).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      </div>`;
      return;
    }

    // Reliable fallback: an in-app YouTube search player.
    // No API key is required. This avoids the previous dead button when the
    // exercise database blocks browser requests or returns no direct video.
    const q=encodeURIComponent(name+' exercise form');
    meta.textContent='Public exercise demonstration';
    body.innerHTML=`<div class="mf-video-wrap mf-youtube-fallback">
      <iframe
        title="${esc(name)} exercise form"
        src="https://www.youtube.com/embed?listType=search&list=${q}"
        style="width:100%;aspect-ratio:16/9;border:0;display:block"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"></iframe>
    </div>
    <div class="mf-video-fallback" style="margin-top:10px">
      <p><b>${esc(name)}</b> form video loaded in-app.</p>
      <a class="primary small" target="_blank" rel="noopener noreferrer"
         href="https://www.youtube.com/results?search_query=${q}">Open more demonstrations ↗</a>
    </div>`;
  }
  function generateSmartWorkoutV18(){
    const goal=$('mfTrainGoal')?.value||'hypertrophy';
    const exp=$('mfTrainExperience')?.value||'intermediate';
    const focus=$('mfTrainFocus')?.value||'Full Body';
    const time=Math.max(20,Math.min(180,n($('mfTrainTime')?.value)||60));
    const focusMap={
      'Chest':['Chest'],
      'Back':['Back','Lats'],
      'Legs':['Legs','Quads','Hamstrings','Glutes','Calves'],
      'Shoulders':['Shoulders','Side Delts','Rear Delts','Front Delts'],
      'Arms':['Biceps','Triceps','Forearms'],
      'Full Body':['Chest','Back','Legs','Quads','Hamstrings','Glutes','Shoulders','Biceps','Triceps']
    };
    let pool=uniqueExercises.filter(x=>focusMap[focus]?.some(k=>x[1].includes(k))||focus==='Full Body');
    const priority=pool.filter(x=>['free','machine','smith'].includes(x[2]));
    const accessories=pool.filter(x=>['cable','band','bodyweight'].includes(x[2]));
    const count=Math.max(4,Math.min(10,Math.floor(time/8)));
    const chosen=[];const used=new Set();
    const add=arr=>{for(const x of arr){if(chosen.length>=count)break;const key=x[0].toLowerCase();if(!used.has(key)){used.add(key);chosen.push(x);}}};
    add(priority.sort(()=>Math.random()-0.5));add(accessories.sort(()=>Math.random()-0.5));
    const sets=exp==='novice'?3:exp==='advanced'?4:3;
    const reps=goal==='strength'?'4–6':goal==='mixed'?'6–10':'8–15';
    const html=`<div class="mf-plan-list">${chosen.map((x,i)=>`<div class="mf-plan-row"><div><b>${esc(x[0])}</b><small>${esc(x[1])} · ${esc(x[2])} · ${i<2?'primary movement':'accessory'}</small></div><strong>${i<2?sets:Math.max(2,sets-1)} × ${reps}</strong><span>RIR ${goal==='strength'?'1–3':'1–2'}</span></div>`).join('')}</div><p class="muted">Generated from the expanded ${uniqueExercises.length}-exercise catalogue. Keep technique consistent, log the working sets, and progress reps before adding a modest load.</p>`;
    const out=$('mfGeneratedWorkout');if(out)out.innerHTML=html;
  }

  function openExerciseSearchModal(initial=''){
    let modal=$('mfV183ExerciseModal');
    if(!modal){
      modal=document.createElement('div');
      modal.id='mfV183ExerciseModal';
      modal.className='mf-ex-modal';
      modal.innerHTML=`<div class="mf-ex-modal-backdrop" data-mf-close-ex></div>
        <section class="mf-ex-modal-card" role="dialog" aria-modal="true" aria-labelledby="mfV183Title">
          <button type="button" class="mf-ex-modal-close" data-mf-close-ex aria-label="Close">×</button>
          <div class="mf-ex-modal-head">
            <span class="pill">TRAINING LAB</span>
            <h2 id="mfV183Title">Find an exercise</h2>
            <p>Search the exercise library, then watch the form video without leaving MacroForge.</p>
          </div>
          <div class="mf-ex-searchbar">
            <span>⌕</span><input id="mfV183Search" autocomplete="off" placeholder="Try “seated row”, “lat pulldown”, “incline press”…">
          </div>
          <div class="mf-ex-quick" id="mfV183Quick">
            ${['Seated Row','Lat Pulldown','Bench Press','Squat','Romanian Deadlift','Lateral Raise'].map(x=>`<button type="button" data-mf-quick="${esc(x)}">${esc(x)}</button>`).join('')}
          </div>
          <div class="mf-ex-modal-results" id="mfV183Results"></div>
        </section>`;
      document.body.appendChild(modal);
      const close=()=>modal.classList.remove('open');
      modal.querySelectorAll('[data-mf-close-ex]').forEach(x=>x.addEventListener('click',close));
      document.addEventListener('keydown',e=>{if(e.key==='Escape' && modal.classList.contains('open'))close();});
      modal.querySelector('#mfV183Search').addEventListener('input',()=>renderExerciseModalResults());
      modal.querySelectorAll('[data-mf-quick]').forEach(b=>b.addEventListener('click',()=>{
        modal.querySelector('#mfV183Search').value=b.dataset.mfQuick;
        renderExerciseModalResults();
        modal.querySelector('#mfV183Search').focus();
      }));
    }
    modal.classList.add('open');
    const input=$('mfV183Search'); input.value=initial||''; renderExerciseModalResults(); setTimeout(()=>input.focus(),30);
  }

  function renderExerciseModalResults(){
    const box=$('mfV183Results'); if(!box)return;
    const q=($('mfV183Search')?.value||'').trim().toLowerCase();
    const filter=$('mfTrainingEnhance')?.dataset.exFilter||'all';
    let arr=uniqueExercises.filter(x=>exMatch(q,x)&&(filter==='all'||x[2]===filter));
    if(!q)arr=arr.slice(0,18);
    else arr=arr.slice(0,40);
    if(!arr.length){
      box.innerHTML='<div class="mf-ex-empty"><b>No exact local match.</b><span>Try a broader term such as “row”, “press”, “curl”, or “hamstring”.</span></div>';
      return;
    }
    box.innerHTML=arr.map(x=>`<article class="mf-ex-search-result">
      <div class="mf-ex-result-main"><b>${esc(x[0])}</b><span>${esc(x[1])} · ${esc(x[2])}</span></div>
      <div class="mf-ex-result-actions">
        <button type="button" class="secondary-btn mf-v183-watch" data-v183-ex="${esc(x[0])}">▶ Watch Form</button>
        <button type="button" class="text-btn mf-v183-use" data-v183-ex="${esc(x[0])}">Use in Record</button>
      </div>
    </article>`).join('');
    box.querySelectorAll('.mf-v183-watch').forEach(b=>b.onclick=()=>{
      const s=$('mfRecordExercise'); if(s){s.value=b.dataset.v183Ex; s.dispatchEvent(new Event('change',{bubbles:true}));}
      showVideo(b.dataset.v183Ex);
      const panel=$('mfFormVideoPanel');
      panel?.scrollIntoView({behavior:'smooth',block:'center'});
    });
    box.querySelectorAll('.mf-v183-use').forEach(b=>b.onclick=()=>{
      const s=$('mfRecordExercise');
      if(s){s.value=b.dataset.v183Ex;s.dispatchEvent(new Event('change',{bubbles:true}));}
      modalCloseExerciseSearch();
    });
  }

  function modalCloseExerciseSearch(){ $('mfV183ExerciseModal')?.classList.remove('open'); }

  function trainingPanel(){
    const p=$('trainingLab'); if(!p)return;
    let select=$('mfRecordExercise');
    if(select){const current=select.value;select.innerHTML=exerciseOptions();if([...select.options].some(o=>o.value===current))select.value=current;}
    const wrap=$('mfTrainingEnhance');
    if(wrap){
      const browser=wrap.querySelector('#mfExerciseResults');
      const gen=wrap.querySelector('#mfGenerateWorkout');
      if(gen && gen.dataset.v18!=='1'){gen.dataset.v18='1';gen.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();generateSmartWorkoutV18();},true);}
      const search=wrap.querySelector('#mfExerciseSearch');
      if(search && search.dataset.v18!=='1'){
        search.dataset.v18='1';
        const controls=document.createElement('div');controls.className='mf-ex-filter-row';
        controls.innerHTML=['all','free','machine','cable','smith','bodyweight','band'].map(x=>`<button type="button" class="mf-ex-filter ${x==='all'?'active':''}" data-ex-filter="${x}">${x==='all'?'All':x[0].toUpperCase()+x.slice(1)}</button>`).join('');
        search.parentNode.insertBefore(controls,search);
        controls.addEventListener('click',e=>{const b=e.target.closest('[data-ex-filter]');if(!b)return;wrap.dataset.exFilter=b.dataset.exFilter;controls.querySelectorAll('[data-ex-filter]').forEach(x=>x.classList.toggle('active',x===b));renderExerciseBrowser();renderExerciseModalResults();});
        search.addEventListener('input',renderExerciseBrowser);
      }
      renderExerciseBrowser();
    if(search && search.dataset.v183modal!=='1'){search.dataset.v183modal='1';search.addEventListener('focus',()=>{if(window.innerWidth<900)openExerciseSearchModal(search.value);});}
    }
    if(select && select.dataset.v18!=='1'){select.dataset.v18='1';select.addEventListener('change',()=>showVideo(select.value));}
    if(!$('mfV18VideoHint')){
      const hint=document.createElement('div');hint.id='mfV18VideoHint';hint.className='mf-v18-video-hint';
      hint.innerHTML='<b>In-app form video</b><span>Select any exercise above or click <strong>Find Exercise</strong>. The video player appears here without leaving Training Lab.</span>';
      $('mfFormVideoPanel')?.prepend(hint);
    }
    if(!$('mfV183FindExercise')){
      const target=wrap||p;
      const btn=document.createElement('button');
      btn.id='mfV183FindExercise';btn.type='button';btn.className='mf-v183-find-btn';
      btn.innerHTML='<span>⌕</span><span><b>Find an exercise</b><small>Search the full Training Lab library</small></span><strong>→</strong>';
      btn.onclick=()=>openExerciseSearchModal('');
      if(wrap)wrap.prepend(btn); else p.prepend(btn);
    }
    if(select && select.value && (!wrap?.dataset.videoLoaded || wrap.dataset.videoLoaded!==select.value)){
      if(wrap)wrap.dataset.videoLoaded=select.value;showVideo(select.value);
    }
  }

  function renderExerciseBrowser(){
    const box=$('mfExerciseResults'); if(!box)return;
    const q=($('mfExerciseSearch')?.value||'').trim().toLowerCase();
    const filter=$('mfTrainingEnhance')?.dataset.exFilter||'all';
    let arr=uniqueExercises.filter(x=>exMatch(q,x)&&(filter==='all'||x[2]===filter)).slice(0,120);
    if(!arr.length){box.innerHTML='<div class="muted">No curated match. Type the exact movement name and MacroForge will try the live exercise-video database.</div>';return;}
    box.innerHTML=arr.map(x=>`<article class="mf-v18-ex"><b>${esc(x[0])}</b><span>${esc(x[1])} · ${esc(x[2])}</span><button type="button" class="secondary-btn mf-v18-watch" data-v18-ex="${esc(x[0])}">▶ Watch Form</button><button type="button" class="text-btn mf-v18-record" data-v18-ex="${esc(x[0])}">Use in Record</button></article>`).join('');
    box.querySelectorAll('.mf-v18-watch').forEach(b=>{b.onclick=(e)=>{e.preventDefault();e.stopPropagation();const name=b.getAttribute('data-v18-ex')||'';const s=$('mfRecordExercise');if(s){s.value=name;s.dispatchEvent(new Event('change',{bubbles:true}));}showVideo(name);$('mfFormVideoPanel')?.scrollIntoView({behavior:'smooth',block:'center'});};});
    box.querySelectorAll('.mf-v18-record').forEach(b=>b.onclick=()=>{const s=$('mfRecordExercise');if(s){s.value=b.dataset.v18Ex;showVideo(b.dataset.v18Ex);s.dispatchEvent(new Event('change',{bubbles:true}));}});
  }

  /* ---------------------------------------------------------
     4) Cardio details directly under timer + performance ranks.
     --------------------------------------------------------- */
  function cardioLogs(){const s=st();s.cardio=s.cardio||{logs:[]};s.cardio.logs=Array.isArray(s.cardio.logs)?s.cardio.logs:[];return s.cardio.logs;}
  function cardioRank(logs){
    const groups={};
    logs.forEach(x=>{const k=String(x.activity||'Unknown').toLowerCase();(groups[k]??=[]).push(x);});
    return Object.entries(groups).map(([k,arr])=>{
      const scored=arr.map(x=>{const pace=n(x.distance)>0?n(x.minutes)/n(x.distance):n(x.minutes);return {...x,_score:pace};}).sort((a,b)=>a._score-b._score);
      return {activity:arr[0].activity,fastest:scored[0],second:scored[1]||null,slowest:scored[scored.length-1],count:scored.length};
    });
  }
  function renderCardioV18(){
    const hist=$('mfCardioHistory'); if(!hist)return;
    const logs=cardioLogs().slice().reverse();
    const todayLogs=logs.filter(x=>x.date===today());
    let details=$('mfCardioTodayDetails');
    if(!details){
      details=document.createElement('section');details.className='panel';details.id='mfCardioTodayDetails';
      const timer=$('mfCardioTimer')?.closest('.mf-timer');
      if(timer?.parentNode) timer.parentNode.insertBefore(details,timer.nextSibling);
      else hist.closest('.panel')?.parentNode?.insertBefore(details,hist.closest('.panel').nextSibling||null);
    }
    const ranks=cardioRank(cardioLogs());
    details.innerHTML=`<div class="panel-head"><div><span class="pill">LIVE RECORD</span><h3>Today's cardio</h3></div><span class="muted">${todayLogs.length} session${todayLogs.length===1?'':'s'}</span></div><div class="mf-cardio-log-grid">${todayLogs.length?todayLogs.map(x=>`<article><b>${esc(x.activity)}</b><span>${x.minutes} min${n(x.distance)?` · ${n(x.distance).toFixed(2)} km`:''} · ~${Math.round(n(x.kcal))} kcal</span><small>${esc(x.category||'Cardio')} · ${n(x.met)} MET</small></article>`).join(''):'<div class="muted">Start and end a cardio session to see the live log here.</div>'}</div><div class="mf-cardio-rank-grid"><div><span>Fastest</span><b>${ranks.length?ranks.map(r=>`${esc(r.activity)}: ${n(r.fastest.minutes).toFixed(1)} min`).join('<br>'):'—'}</b></div><div><span>2nd fastest</span><b>${ranks.length?ranks.map(r=>`${esc(r.activity)}: ${r.second?n(r.second.minutes).toFixed(1)+' min':'—'}`).join('<br>'):'—'}</b></div><div><span>Slowest</span><b>${ranks.length?ranks.map(r=>`${esc(r.activity)}: ${n(r.slowest.minutes).toFixed(1)} min`).join('<br>'):'—'}</b></div></div><p class="muted" style="margin-top:10px">For sessions with distance, ranking uses minutes per kilometre; otherwise it uses session duration. That makes a 20-minute 1 km run and a 30-minute 5 km run comparable by pace rather than raw duration.</p>`;
  }

  /* ---------------------------------------------------------
     5) Dynamic suggested meal. Never repeats the meal just
        logged unless it is the only viable library match.
     --------------------------------------------------------- */
  const MEALS18=[
    ['Daal + Rice + Raita',[['Daal Makhni',1,'bowl'],['White Rice',1,'cup'],['Raita',1,'bowl']]],
    ['Chicken Tikka + Tandoori Roti',[['Chicken Tikka',2,'piece'],['Tandoori Roti — 1 piece',2,'piece']]],
    ['Chicken Karahi + Tandoori Roti',[['Chicken Karahi',1,'plate'],['Tandoori Roti — 1 piece',1,'piece']]],
    ['Chicken Biryani + Raita',[['Biryani',1,'plate'],['Raita',1,'bowl']]],
    ['Beef Qeema + Roti',[['Beef Qeema',1,'plate'],['Roti',2,'piece']]],
    ['Chana + Tandoori Roti + Dahi',[['Chickpea Curry',1,'bowl'],['Tandoori Roti — 1 piece',2,'piece'],['Dahi',1,'bowl']]],
    ['Eggs + Paratha + Dahi',[['Anda Paratha',1,'piece'],['Dahi',1,'bowl']]],
    ['Chicken Pulao + Raita',[['Chicken Pulao',1,'plate'],['Raita',1,'bowl']]],
    ['Aloo Qeema + Roti',[['Aloo Qeema',1,'plate'],['Roti',2,'piece']]],
    ['Chicken Jalfrezi + Rice',[['Chicken Jalfrezi',1,'plate'],['White Rice',1,'cup']]],
    ['Daal Chawal + Raita',[['Daal Chawal',1,'plate'],['Raita',1,'bowl']]]
  ];
  function libFood(name){const s=st();const all=[...(window.MF_LOCAL_RECORDS||[]),...(window.MF_EXTRA_GYM_FOODS||[]),...(s.customFoods||[])];return all.find(f=>String(f.name).toLowerCase()===name.toLowerCase())||all.find(f=>String(f.name).toLowerCase().includes(name.toLowerCase()));}
  function mealCalc(m){let missing=0,out={cal:0,p:0,c:0,f:0};m[1].forEach(c=>{const f=libFood(c[0]);if(!f||!window.mfCalculatePortion){missing++;return;}const x=window.mfCalculatePortion(f,c[1],c[2]);out.cal+=n(x.cal);out.p+=n(x.p);out.c+=n(x.c);out.f+=n(x.f);});return {...out,missing};}
  function renderMealV18(){
    const box=$('mfMealCoach');if(!box)return;const s=st(),g=s.goals||{};if(!s.onboardingComplete){box.innerHTML='<div class="muted">Complete your nutrition plan first.</div>';return;}
    const logs=(s.foodLog||[]).filter(x=>x.date===today());const t={cal:0,p:0,c:0,f:0};logs.forEach(x=>{t.cal+=n(x.cal);t.p+=n(x.p);t.c+=n(x.c);t.f+=n(x.f);});
    const rem={cal:Math.max(0,n(g.cal)-t.cal),p:Math.max(0,n(g.protein)-t.p),c:Math.max(0,n(g.carbs)-t.c),f:Math.max(0,n(g.fat)-t.f)};
    const last=s.lastSuggestedMealName||'';
    let ranked=MEALS18.map((m,i)=>{const x=mealCalc(m);return {...x,name:m[0],parts:m[1],i,score:x.missing*100000+(m[0]===last?50000:0)+Math.abs(x.p-rem.p)*1.8+Math.abs(x.c-rem.c)*.65+Math.abs(x.f-rem.f)*.5+Math.abs(x.cal-rem.cal)/100};}).filter(x=>x.missing===0).sort((a,b)=>a.score-b.score);
    if(!ranked.length){box.innerHTML='<div class="muted">No complete meal is currently available in the Food Log library.</div>';return;}
    if(ranked.length>1 && ranked[0].name===last)ranked.push(ranked.shift());
    const best=ranked[0];
    box.innerHTML=`<div class="mf-coach-main"><div><span class="pill">SUGGESTED NEXT MEAL · LIVE</span><h4>${esc(best.name)}</h4><p>~${Math.round(best.cal)} kcal · P ${best.p.toFixed(1)}g · C ${best.c.toFixed(1)}g · F ${best.f.toFixed(1)}g</p><small>Components: ${best.parts.map(c=>esc(c[0])).join(' + ')}</small></div><button class="secondary-btn" type="button" id="mfV18LogMeal">Log this meal</button></div><div class="mf-coach-remaining"><span>Remaining</span><b>${Math.round(rem.cal)} kcal</b><b>${Math.round(rem.p)}g P</b><b>${Math.round(rem.c)}g C</b><b>${Math.round(rem.f)}g F</b></div>`;
    $('mfV18LogMeal').onclick=()=>{let count=0;s.foodLog=s.foodLog||[];best.parts.forEach(c=>{const f=libFood(c[0]);if(!f)return;const x=window.mfCalculatePortion(f,c[1],c[2]);s.foodLog.push({id:`meal18_${Date.now()}_${Math.random().toString(36).slice(2)}`,name:f.name,amount:c[1],unit:c[2],cal:n(x.cal),p:n(x.p),c:n(x.c),f:n(x.f),fiber:n(x.fiber),date:today(),source:'MacroForge Meal Coach'});count++;});s.lastSuggestedMealName=best.name;save();window.updateDashboard?.();window.renderFoods?.();renderMealV18();toast(`${best.name} logged (${count} items)`);};
  }

  /* ---------------------------------------------------------
     6) Unlog food anywhere it appears.
     --------------------------------------------------------- */
  function unlogFood(id){const s=st();const i=(s.foodLog||[]).findIndex(x=>String(x.id)===String(id));if(i<0)return;s.foodLog.splice(i,1);save();window.updateDashboard?.();window.renderFoods?.();renderMealV18();toast('Food unlogged');}
  function addUnlogButtons(){
    const list=$('todayFood');if(list){const items=(st().foodLog||[]).filter(x=>x.date===today()).slice(-8).reverse();list.innerHTML=items.length?items.map(x=>`<div class="food-row mf-unlog-row"><div><b>${esc(x.name)}</b><small>${x.amount} ${esc(x.unit)}</small></div><div class="food-macros">${Math.round(n(x.cal))} kcal<br>P ${n(x.p).toFixed(1)} · C ${n(x.c).toFixed(1)} · F ${n(x.f).toFixed(1)}<button type="button" class="text-btn mf-unlog" data-unlog="${esc(x.id)}">Unlog</button></div></div>`).join(''):'Nothing logged yet. Forge your first meal.';list.querySelectorAll('.mf-unlog').forEach(b=>b.onclick=()=>unlogFood(b.dataset.unlog));}
    const box=$('foodLogEntries');if(box){box.querySelectorAll('[data-del-food]').forEach(b=>{b.textContent='Unlog';b.classList.add('mf-unlog');});}
  }

  /* ---------------------------------------------------------
     7) Separate streaks — macros, protein, carbs, fat, water,
        workout, cardio. Each is independently calculated.
     --------------------------------------------------------- */
  function dayComplete(date){const s=st(),g=s.goals||{},foods=(s.foodLog||[]).filter(x=>x.date===date);const t={cal:0,p:0,c:0,f:0};foods.forEach(x=>{t.cal+=n(x.cal);t.p+=n(x.p);t.c+=n(x.c);t.f+=n(x.f);});const w=(s.waterLog||[]).filter(x=>x.date===date).reduce((a,x)=>a+n(x.amount??x.ml),0);const workout=(s.workoutHistory||[]).some(x=>x.date===date)||(s.workouts||[]).some(x=>x.date===date);const cardio=!!s.cardio?.logs?.some(x=>x.date===date);return {cal:t.cal,p:t.p,c:t.c,f:t.f,w,calorie:t.cal>=.9*n(g.cal),protein:t.p>=.9*n(g.protein),carbs:t.c>=.9*n(g.carbs),fat:t.f>=.9*n(g.fat),water:w>=.9*n(g.water),workout,cardio};}
  function streak(type){let k=0;for(let i=0;i<365;i++){const d=new Date();d.setDate(d.getDate()-i);if(dayComplete(d.toISOString().slice(0,10))[type])k++;else break;}return k;}
  function renderStreaksV18(){const host=$('mfStreaks');if(!host)return;const items=[['Calories','calorie'],['Protein','protein'],['Carbs','carbs'],['Fat','fat'],['Water','water'],['Workouts','workout'],['Cardio','cardio']];host.innerHTML=items.map(x=>`<div><span>${x[0]}</span><b>${streak(x[1])} days</b></div>`).join('');host.parentElement?.querySelector('.panel-head .muted')?.replaceChildren(document.createTextNode('Live · each goal tracked separately'));}

  /* ---------------------------------------------------------
     8) BMI + optional body-fat estimate + immediate follow-up.
     --------------------------------------------------------- */
  function bmi(){const s=st(),p=s.profile||{},latest=(s.weights||[]).slice(-1)[0];const kg=n(latest?.kg)||n(p.weight||p.currentWeight),cm=n(p.height);if(!kg||!cm)return null;return kg/Math.pow(cm/100,2);}
  function bodyFatNavy(){const s=st(),b=s.bodyComp||{},p=s.profile||{},sex=b.sex||p.sex||'male',h=n(p.height),waist=n(b.waist),neck=n(b.neck),hip=n(b.hip);if(!h||!waist||!neck)return null;const H=h/2.54,W=waist/2.54,N=neck/2.54;let bf;if(sex==='female'){if(!hip)return null;bf=495/(1.29579-0.35004*Math.log10(W+hip/2.54-N)+0.22100*Math.log10(H))-450;}else{bf=495/(1.0324-0.19077*Math.log10(W-N)+0.15456*Math.log10(H))-450;}return Math.max(2,Math.min(60,bf));}
  function bodyProfile(){const s=st(),p=s.profile||{},b=s.bodyComp||{},B=bmi(),bf=bodyFatNavy();if(!B)return 'Add height and weight first.';if(n(p.age)&&n(p.age)<18)return 'For younger users, adult BMI categories and generic body-type labels are not appropriate. MacroForge uses measurements only as context and recommends professional growth-chart assessment when there is concern.';if(bf!=null)return bf<12?'Lean-leaning body-composition estimate':bf<20?'Average-to-lean body-composition estimate':bf<27?'Moderate adiposity estimate':'Higher adiposity estimate';return B<18.5?'Lower bodyweight-for-height screen':B<25?'Middle BMI screening range':B<30?'Higher BMI screening range':'High BMI screening range';}
  function renderBodyComp(){
    const b=$('mfBmiValue');if(b){const B=bmi();b.textContent=B?B.toFixed(1):'—';const wrap=b.closest('.mf-bmi-grid');const span=wrap?.querySelector('div:first-child span');if(span)span.textContent=bodyProfile();}
    const bf=$('mfV18BodyFat');if(bf){const x=bodyFatNavy();bf.textContent=x==null?'—':x.toFixed(1)+'%';}
    const prof=$('mfV18BodyProfile');if(prof)prof.textContent=bodyProfile();
  }
  function injectBodyComp(){
    const science=$('science');if(!science||$('mfV18BodyComp'))return;
    const sec=document.createElement('section');sec.className='panel';sec.id='mfV18BodyComp';sec.innerHTML=`<div class="panel-head"><div><span class="pill">BODY COMPOSITION</span><h3>Body-fat estimate</h3></div><span class="muted">Optional · estimation only</span></div><div class="mf-bf-grid"><div><span>Estimated body fat</span><b id="mfV18BodyFat">—</b><small>U.S. Navy circumference method; adult estimate only.</small></div><div><span>Composition profile</span><b id="mfV18BodyProfile">—</b><small>BMI does not directly measure body fat or muscle mass.</small></div></div><div class="form-grid"><label>Sex<select id="mfBCSex"><option value="male">Male</option><option value="female">Female</option></select></label><label>Waist (cm)<input id="mfBCWaist" type="number" min="30" max="250" step="0.1"></label><label>Neck (cm)<input id="mfBCNeck" type="number" min="15" max="100" step="0.1"></label><label id="mfBCHipWrap">Hip (cm)<input id="mfBCHip" type="number" min="30" max="250" step="0.1"></label></div><button class="primary" id="mfSaveBodyComp">Update estimate</button><p class="muted" style="margin-top:10px">Do not use this estimate to diagnose a medical condition. If you are under 18, this adult equation is not validated for body-fat assessment.</p>`;
    science.appendChild(sec);
    const b=st().bodyComp||{};$('mfBCSex').value=b.sex||st().profile?.sex||'male';$('mfBCWaist').value=b.waist||'';$('mfBCNeck').value=b.neck||'';$('mfBCHip').value=b.hip||'';
    $('mfSaveBodyComp').onclick=()=>{st().bodyComp={sex:$('mfBCSex').value,waist:n($('mfBCWaist').value),neck:n($('mfBCNeck').value),hip:n($('mfBCHip').value),updatedAt:new Date().toISOString()};save();renderBodyComp();toast('Body-composition estimate updated');};
  }
  function followUpModal(){
    if($('mfBodyFollowup'))return $('mfBodyFollowup').classList.add('open');
    const m=document.createElement('div');m.className='modal open';m.id='mfBodyFollowup';m.innerHTML=`<div class="modal-card"><button class="close" id="mfBClose">×</button><span class="pill">BODY CHECK-IN</span><h2>One quick follow-up</h2><p class="muted">Your weight was logged. Add a few measurements so MacroForge can give a better body-composition context. There is no scientifically reliable “ectomorph/mesomorph/endomorph detector”, so this uses measurable information instead.</p><div class="form-grid"><label>Sex<select id="mfFU_Sex"><option value="male">Male</option><option value="female">Female</option></select></label><label>Waist (cm)<input id="mfFU_Waist" type="number" min="30" max="250" step="0.1"></label><label>Neck (cm)<input id="mfFU_Neck" type="number" min="15" max="100" step="0.1"></label><label>Hip (cm, optional for male)<input id="mfFU_Hip" type="number" min="30" max="250" step="0.1"></label><label>Training age (years)<input id="mfFU_Training" type="number" min="0" max="80" step="0.5"></label><label>Main goal<select id="mfFU_Goal"><option value="bulk">Bulk</option><option value="moderate">Moderate</option><option value="cut">Cut</option></select></label></div><button class="primary full" id="mfFUSave">Save body check-in</button><button class="secondary-btn full" id="mfFUSkip">Skip for now</button></div>`;document.body.appendChild(m);const b=st().bodyComp||{};$('mfFU_Sex').value=b.sex||st().profile?.sex||'male';$('mfFU_Waist').value=b.waist||'';$('mfFU_Neck').value=b.neck||'';$('mfFU_Hip').value=b.hip||'';$('mfFU_Training').value=b.trainingAge||'';$('mfFU_Goal').value=st().profile?.goal||'moderate';const close=()=>m.classList.remove('open');$('mfBClose').onclick=close;$('mfFUSkip').onclick=close;$('mfFUSave').onclick=()=>{st().bodyComp={sex:$('mfFU_Sex').value,waist:n($('mfFU_Waist').value),neck:n($('mfFU_Neck').value),hip:n($('mfFU_Hip').value),trainingAge:n($('mfFU_Training').value),updatedAt:new Date().toISOString()};save();close();injectBodyComp();renderBodyComp();toast('Body check-in saved');};
  }

  /* ---------------------------------------------------------
     9) AI Coach — real backend first, local fallback second.
        Never puts an API key in the browser.
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     9) AI Coach — offline limited-question coach.
        V18.1 previously added a backend/custom-question system.
        This build deliberately removes that dependency and restores
        the original limited Coach prompt model from V17.
     --------------------------------------------------------- */
  const LIMITED_COACH=[
    ['Warm-up','How should I warm up before lifting?'],
    ['Progressive overload','How do I progressively overload?'],
    ['Pre-workout food','What should I eat before training?'],
    ['Protein','How much protein should I aim for?'],
    ['Beginner plan','What should a beginner do in the gym?']
  ];
  function limitedCoachAnswer(q){
    const s=st(),g=s.goals||{},p=s.profile||{};
    const text=String(q||'').toLowerCase();
    if(/protein/.test(text))return `Your current target is ${Math.round(n(g.protein))} g/day. A practical range for exercising people is often around 1.4–2.0 g/kg/day; MacroForge may use a higher planning target. Spread protein across several meals instead of trying to force it into one sitting.`;
    if(/carb|carbohydrate|rice|roti/.test(text))return 'Carbohydrate is useful training fuel, especially as training volume and intensity rise. Rice, roti, potatoes, oats, fruit and daal can all fit. Adjust the portion to your calorie target and digestion.';
    if(/warm|warmup/.test(text))return 'Use 5–10 minutes of easy general movement, then a few ramp-up sets for the first compound lift. Warm up for the movement you are about to perform; do not fatigue yourself before the working sets.';
    if(/overload|progress/.test(text))return 'Use a repeatable technique standard. Stay within your rep range; when you can reach the top of the range across your planned sets with good form, add a small load and rebuild reps. Track the load, reps, sets and RIR.';
    if(/beginner|new gym|start/.test(text))return 'Start with 2–4 resistance sessions/week, learn a small set of stable compound and isolation movements, keep 1–3 reps in reserve on most working sets, and increase work gradually. You do not need advanced intensity techniques to grow.';
    if(/pre.*work|before.*train|eat/.test(text))return 'A practical pre-training meal 1–3 hours before lifting can contain protein plus carbohydrate: chicken + rice, eggs + roti, yogurt + fruit, or daal + rice. Keep very large or high-fat meals away from training if they make you uncomfortable.';
    if(/cut|fat loss|lose weight/.test(text))return `Your plan currently says ${p.goalLabel||'your selected goal'}. For a cut, use a moderate deficit, keep resistance training, keep protein adequate, and judge progress from repeated weight trends—not one scale reading.`;
    if(/bulk|gain|mass/.test(text))return 'A bulk uses a calorie surplus. Keep the surplus controlled enough that training performance and weight trend rise without treating maximum fat gain as success. Protein, carbs, fats and progressive resistance training all matter.';
    if(/creatine/.test(text))return 'Creatine monohydrate is optional. A loading phase can saturate stores faster, but daily maintenance without loading also works. MacroForge tracks creatine separately.';
    if(/gyno|breast/.test(text))return 'I cannot diagnose gynecomastia. A persistent or new lump, significant pain, nipple discharge, one-sided change or rapid enlargement should be assessed by a clinician.';
    if(/bmi/.test(text)){const B=bmi();return B?`Your calculated BMI is ${B.toFixed(1)}. BMI is a screening measure and does not directly measure body fat or muscle mass.`:'Enter height and weight first.';}
    return `I can help with your current plan: ${Math.round(n(g.cal))} kcal, P ${Math.round(n(g.protein))} g, C ${Math.round(n(g.carbs))} g, F ${Math.round(n(g.fat))} g. Use one of the Coach questions below.`;
  }
  function coachAdd(who,msg){const c=$('mfCoachChat');if(!c)return;const d=document.createElement('div');d.className=`mf-chat-msg ${who}`;d.innerHTML=`<b>${who==='user'?'You':'Coach'}</b><span>${esc(msg).replace(/\n/g,'<br>')}</span>`;c.appendChild(d);c.scrollTop=c.scrollHeight;}
  function patchCoach(){
    const chat=$('mfCoachChat');
    const panel=$('coach')?.querySelector('.panel');
    if(!chat||!panel)return;
    /* Remove the free-form custom-question controls. */
    panel.querySelector('#mfCoachInput')?.closest('.mf-chat-row')?.remove();
    panel.querySelector('#mfCoachSend')?.remove();
    panel.querySelectorAll('.mf-chat-row').forEach(x=>x.remove());
    panel.querySelectorAll('.mf-coach-prompts').forEach(x=>x.remove());
    let prompts=panel.querySelector('#mfLimitedCoachPrompts');
    if(!prompts){
      prompts=document.createElement('div');
      prompts.id='mfLimitedCoachPrompts';
      prompts.className='mf-coach-prompts mf-limited-prompts';
      prompts.innerHTML=LIMITED_COACH.map(([label,q])=>`<button type="button" class="secondary-btn" data-mf-limited-q="${esc(q)}">${esc(label)}</button>`).join('');
      chat.after(prompts);
    }
    prompts.querySelectorAll('[data-mf-limited-q]').forEach(btn=>{
      btn.onclick=()=>{
        const q=btn.dataset.mfLimitedQ||'';
        if(!q)return;
        coachAdd('user',q);
        const answer=limitedCoachAnswer(q);
        coachAdd('coach',answer);
        st().coachHistory=Array.isArray(st().coachHistory)?st().coachHistory:[];
        st().coachHistory.push({role:'user',content:q},{role:'assistant',content:answer});
        st().coachHistory=st().coachHistory.slice(-20);save();
      };
    });
    if(!chat.children.length)coachAdd('coach','Choose one of the Coach questions below. MacroForge uses your current plan when the answer needs it.');
    if(!panel.querySelector('#mfLimitedCoachNote')){
      const note=document.createElement('p');note.id='mfLimitedCoachNote';note.className='muted';note.textContent='Coach uses a small set of built-in questions. Custom/free-form questions are disabled in this build.';prompts.after(note);
    }
  }
  /* ---------------------------------------------------------
     10) Weight logging follow-up hook.
     --------------------------------------------------------- */
  let lastWeightCount=0;
  function watchWeight(){const s=st();lastWeightCount=(s.weights||[]).length;document.addEventListener('click',e=>{if(e.target?.id!=='saveWeight')return;setTimeout(()=>{const now=(st().weights||[]).length;if(now>lastWeightCount){lastWeightCount=now;renderBodyComp();followUpModal();}},220);},true);}

  /* ---------------------------------------------------------
     11) Dynamic refresh + styles.
     --------------------------------------------------------- */
  function styles(){if($('mf18styles'))return;const s=document.createElement('style');s.id='mf18styles';s.textContent=`
    .mf-ex-filter-row{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}.mf-ex-filter{border:1px solid #29463a;background:#07100d;color:#b6c9c0;border-radius:999px;padding:7px 10px;cursor:pointer}.mf-ex-filter.active{background:#d9ff64;color:#07100d;border-color:#d9ff64}.mf-v18-ex{display:flex!important;flex-direction:column;gap:5px}.mf-v18-ex .secondary-btn{margin-top:4px}.mf-v18-ex .text-btn{align-self:flex-start}.mf-v18-video-hint{display:flex;gap:8px;align-items:center;padding:10px 12px;margin-bottom:10px;border:1px solid #315243;border-radius:12px;background:#10221b}.mf-v18-video-hint span{color:#9eb1a8;font-size:11px}.mf-cardio-log-grid,.mf-cardio-rank-grid,.mf-bf-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.mf-cardio-log-grid article,.mf-cardio-rank-grid>div,.mf-bf-grid>div{padding:14px;border:1px solid #1c332a;background:#07100d;border-radius:14px}.mf-cardio-log-grid span,.mf-cardio-log-grid small,.mf-cardio-rank-grid span,.mf-cardio-rank-grid b,.mf-bf-grid span,.mf-bf-grid b,.mf-bf-grid small{display:block}.mf-cardio-log-grid span,.mf-cardio-log-grid small,.mf-cardio-rank-grid span,.mf-bf-grid small{color:#91a59d;font-size:11px;line-height:1.5;margin-top:4px}.mf-cardio-rank-grid b{font-size:13px;line-height:1.7;margin-top:7px}.mf-bf-grid b{font-size:28px;margin-top:6px}.mf-unlog{margin-top:5px!important}.mf-video-wrap{width:100%;max-width:900px;margin:auto;background:#000;border-radius:14px;overflow:hidden}.mf-video-wrap video{width:100%;display:block;max-height:520px}.mf-youtube-fallback iframe{min-height:420px;background:#000}.mf-video-details{display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:12px;color:#c6d5ce}.mf-video-details li{margin:5px 0}.mf-video-credit{color:#789187}.mf-video-fallback{padding:20px;border:1px dashed #365548;border-radius:14px}.mf-video-loading{padding:30px;text-align:center;color:#91a59d}

    .mf-v183-find-btn{width:100%;display:flex;align-items:center;gap:12px;text-align:left;margin:12px 0 16px;padding:14px 16px;border:1px solid #315243;border-radius:16px;background:linear-gradient(135deg,#10221b,#07100d);color:#dcebe4;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.16)}
    .mf-v183-find-btn>span:first-child{width:36px;height:36px;display:grid;place-items:center;border-radius:12px;background:#d9ff64;color:#07100d;font-size:22px;font-weight:800}
    .mf-v183-find-btn>span:nth-child(2){display:flex;flex-direction:column;gap:2px;flex:1}.mf-v183-find-btn small{color:#91a59d;font-size:11px}.mf-v183-find-btn strong{font-size:20px;color:#d9ff64}
    .mf-ex-modal{position:fixed;inset:0;z-index:99999;display:none}.mf-ex-modal.open{display:block}
    .mf-ex-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(8px)}
    .mf-ex-modal-card{position:relative;width:min(760px,calc(100% - 28px));max-height:min(820px,calc(100vh - 40px));overflow:auto;margin:20px auto;background:#09130f;border:1px solid #315243;border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.55);padding:22px}
    .mf-ex-modal-close{position:absolute;right:16px;top:14px;border:0;background:transparent;color:#9eb1a8;font-size:28px;cursor:pointer}.mf-ex-modal-head{padding-right:35px}.mf-ex-modal-head h2{margin:5px 0}.mf-ex-modal-head p{margin:0;color:#91a59d;font-size:12px;line-height:1.5}
    .mf-ex-searchbar{display:flex;align-items:center;gap:9px;margin-top:18px;padding:0 14px;border:1px solid #315243;background:#07100d;border-radius:15px}.mf-ex-searchbar span{font-size:22px;color:#d9ff64}.mf-ex-searchbar input{width:100%;border:0;outline:0;background:transparent;color:#e8f3ee;padding:14px 0;font-size:14px}
    .mf-ex-quick{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 14px}.mf-ex-quick button{border:1px solid #29463a;background:#10221b;color:#b6c9c0;border-radius:999px;padding:7px 10px;cursor:pointer;font-size:11px}
    .mf-ex-modal-results{display:grid;gap:8px}.mf-ex-search-result{display:flex;align-items:center;gap:12px;padding:13px;border:1px solid #1c332a;background:#07100d;border-radius:15px}.mf-ex-result-main{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}.mf-ex-result-main b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mf-ex-result-main span{font-size:11px;color:#91a59d}.mf-ex-result-actions{display:flex;gap:7px;align-items:center}.mf-ex-result-actions button{white-space:nowrap}.mf-ex-empty{padding:25px;text-align:center;border:1px dashed #365548;border-radius:15px;color:#91a59d}.mf-ex-empty b,.mf-ex-empty span{display:block}.mf-ex-empty b{color:#dcebe4;margin-bottom:5px}
    @media(max-width:650px){.mf-ex-search-result{align-items:flex-start;flex-direction:column}.mf-ex-result-actions{width:100%}.mf-ex-result-actions button{flex:1}.mf-ex-modal-card{padding:18px}}

    @media(max-width:850px){.mf-cardio-log-grid,.mf-cardio-rank-grid,.mf-bf-grid{grid-template-columns:1fr}.mf-video-details{grid-template-columns:1fr}}
  `;document.head.appendChild(s);}

  function refresh(){removeWorkoutsTab();renderMealV18();addUnlogButtons();renderStreaksV18();injectBodyComp();renderBodyComp();renderCardioV18();patchCoach();}
  function install(){styles();watchWeight();setTimeout(refresh,500);setTimeout(()=>{trainingPanel();refresh();},1200);setInterval(()=>{if(document.visibilityState!=='hidden')refresh();},3000);document.addEventListener('click',e=>{const b=e.target.closest?.('[data-page="trainingLab"]');if(b)setTimeout(trainingPanel,150);},true);}
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.MacroForgeV18={refresh,showVideo,uniqueExercises};
})();
