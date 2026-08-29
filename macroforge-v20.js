/* =========================================================
   MACROFORGE V20 — TRAINING UI CLEANUP
   - Removes the Pakistan-first promo card/badge
   - Removes unreliable Watch Form/video UI completely
   - Replaces progressive overload + exercise history with app-native cards
   - Replaces generated/assigned workout rows with polished workout cards
   - Adds clear progression metrics and next-target guidance
   ========================================================= */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const st=()=>window.state||{};
  const save=()=>window.save?.();

  function removePakistanPromo(){
    const needles=['PAKISTAN-FIRST','Desi foods + global food search in one tracker.'];
    document.querySelectorAll('*').forEach(el=>{
      if(el.children.length>6)return;
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(needles.some(x=>t.includes(x))){
        let target=el;
        while(target.parentElement && target.parentElement!==document.body && target.parentElement.children.length<=5 && (target.parentElement.textContent||'').includes(t)) target=target.parentElement;
        target.remove();
      }
    });
  }

  function removeFormUI(){
    const ids=['mfFormVideoPanel','mfV18VideoHint','mfV183FindExercise'];
    ids.forEach(id=>$(id)?.remove());
    document.querySelectorAll('.mf-v18-watch,.mf-v183-watch,.mf-watch-form,.mf-v183-find-btn').forEach(x=>x.remove());
    document.querySelectorAll('#mfV19HistoryWatch').forEach(x=>x.remove());
    const titles=[...document.querySelectorAll('*')].filter(x=>x.children.length===0 && /FORM VIDEO|In-app form video/i.test(x.textContent||''));
    titles.forEach(x=>x.closest('.panel,.mf-form-video-panel')?.remove());
  }

  function recordsFor(ex){
    return (st().training?.records||[]).filter(r=>r.exercise===ex).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  }
  function oneRM(r){return n(r.e1rm)||n(r.weight)*(1+n(r.reps)/30);}
  function progression(ex){
    const rs=recordsFor(ex); if(!rs.length)return null;
    const latest=rs[rs.length-1], previous=rs.length>1?rs[rs.length-2]:null;
    const best=Math.max(...rs.map(oneRM));
    const delta=previous?oneRM(latest)-oneRM(previous):0;
    const recentTop=Math.max(...rs.slice(-3).map(r=>n(r.weight)));
    const latestWeight=n(latest.weight), latestReps=n(latest.reps);
    let recommendation='Keep the same load and add 1 rep when technique is stable.';
    if(latestReps>=12)recommendation=`Next target: ${Math.max(0,latestWeight+1.25).toFixed(2)} kg and rebuild reps.`;
    else if(latestReps>=10)recommendation=`Next target: ${Math.max(0,latestWeight+1.25).toFixed(2)} kg if all planned sets reached cleanly.`;
    else recommendation=`Next target: ${latestWeight} kg × ${latestReps+1} reps before adding load.`;
    return {rs,latest,previous,best,delta,recentTop,recommendation};
  }

  function renderProgression(){
    const lab=$('trainingLab'); if(!lab)return;
    const sel=$('mfHistoryExercise'); if(!sel)return;
    const ex=sel.value||sel.options[0]?.value; const p=progression(ex);
    let host=$('mfV20Progression');
    if(!host){
      host=document.createElement('section'); host.className='panel mf-v20-progression'; host.id='mfV20Progression';
      const hist=$('mfExerciseHistory')?.closest('.panel');
      hist?.parentNode?.insertBefore(host,hist);
    }
    if(!p){host.innerHTML=`<div class="mf-v20-prog-head"><div><span class="pill">PROGRESSIVE OVERLOAD</span><h3>Progression command center</h3></div><span class="mf-v20-live">LIVE</span></div><div class="mf-v20-empty">Select an exercise and save a record to start tracking load, reps, estimated 1RM and your next target.</div>`;return;}
    const change=p.delta>0?`+${p.delta.toFixed(1)} kg`:`${p.delta.toFixed(1)} kg`;
    host.innerHTML=`<div class="mf-v20-prog-head"><div><span class="pill">PROGRESSIVE OVERLOAD</span><h3>${esc(ex)}</h3><p>Use repeatable technique. Reps first, then a small load increase.</p></div><span class="mf-v20-live">LIVE</span></div><div class="mf-v20-metric-grid"><div><span>Latest</span><b>${p.latest.weight} kg × ${p.latest.reps}</b><small>${p.latest.sets||1} sets · RIR ${p.latest.rir ?? '—'}</small></div><div><span>Best estimated 1RM</span><b>${p.best.toFixed(1)} kg</b><small>Across ${p.rs.length} records</small></div><div><span>Last vs previous</span><b>${change}</b><small>Estimated 1RM change</small></div><div><span>Next target</span><b>${esc(p.recommendation)}</b><small>Only progress if technique and ROM stay consistent.</small></div></div>`;
  }

  function renderHistory(){
    const box=$('mfExerciseHistory'),sel=$('mfHistoryExercise'); if(!box||!sel)return;
    const ex=sel.value||sel.options[0]?.value; const rs=recordsFor(ex);
    if(!rs.length){box.innerHTML=`<div class="mf-v20-history-empty"><div class="mf-v20-empty-icon">+</div><div><b>No ${esc(ex||'exercise')} records yet</b><span>Save a working set above and your progression will appear here.</span></div></div>`;renderProgression();return;}
    const best=Math.max(...rs.map(oneRM));
    box.innerHTML=`<div class="mf-v20-history-top"><div><b>Recent performance</b><span>${rs.length} logged session${rs.length===1?'':'s'} · best estimated 1RM ${best.toFixed(1)} kg</span></div></div><div class="mf-v20-history-list">${rs.slice().reverse().map((r,i)=>{const e=oneRM(r),isBest=Math.abs(e-best)<0.001;return `<article class="mf-v20-history-card ${i===0?'latest':''}"><div class="mf-v20-date"><b>${esc(r.date)}</b><span>${i===0?'LATEST':''}</span></div><div class="mf-v20-load"><b>${n(r.weight)} kg</b><span>load</span></div><div class="mf-v20-reps"><b>${n(r.reps)}</b><span>reps</span></div><div class="mf-v20-sets"><b>${n(r.sets)}</b><span>sets</span></div><div class="mf-v20-e1rm"><b>${e.toFixed(1)} kg ${isBest?'★':''}</b><span>estimated 1RM</span></div><button type="button" class="secondary-btn mf-v20-view" data-v20-id="${esc(r.id)}">View details</button></article>`;}).join('')}</div>`;
    box.querySelectorAll('.mf-v20-view').forEach(btn=>btn.onclick=()=>openRecord(rs.find(r=>String(r.id)===String(btn.dataset.v20Id))));
    renderProgression();
  }

  function openRecord(r){
    if(!r)return;
    let m=$('mfV20RecordModal');
    if(!m){m=document.createElement('div');m.className='modal';m.id='mfV20RecordModal';m.innerHTML=`<div class="modal-card mf-v20-record-modal"><button class="close" data-v20-close>×</button><span class="pill">EXERCISE RECORD</span><div id="mfV20RecordBody"></div></div>`;document.body.appendChild(m);m.querySelector('[data-v20-close]').onclick=()=>m.classList.remove('open');}
    const p=progression(r.exercise),e=oneRM(r);
    $('mfV20RecordBody').innerHTML=`<div class="mf-v20-record-hero"><small>${esc(r.date)}</small><h2>${esc(r.exercise)}</h2><b>${n(r.weight)} kg × ${n(r.reps)}</b><span>${n(r.sets)} sets · RIR ${n(r.rir)} · estimated 1RM ${e.toFixed(1)} kg</span></div><div class="mf-v20-detail-grid"><div><span>Load</span><b>${n(r.weight)} kg</b></div><div><span>Reps</span><b>${n(r.reps)}</b></div><div><span>Sets</span><b>${n(r.sets)}</b></div><div><span>RIR</span><b>${n(r.rir)}</b></div></div><div class="mf-v20-coach-box"><span>PROGRESSION COACH</span><b>${esc(p?.recommendation||'Log another session to receive a next-target recommendation.')}</b><small>Progress only when the same exercise standard, range of motion and controlled technique are maintained.</small></div><button type="button" class="secondary-btn full" id="mfV20CloseRecord">Close</button>`;
    m.classList.add('open'); $('mfV20CloseRecord').onclick=()=>m.classList.remove('open');
  }

  function styleWorkoutContainer(container){
    if(!container)return;
    const rows=[...container.querySelectorAll('.mf-plan-row')];
    if(!rows.length)return;
    if(container.dataset.v20Styled==='1')return;
    container.dataset.v20Styled='1';
    rows.forEach((r,i)=>{
      const name=r.querySelector('b')?.textContent?.trim()||'Exercise';
      const meta=r.querySelector('small')?.textContent?.trim()||'';
      const prescription=r.querySelector('strong')?.textContent?.trim()||'';
      const rir=r.querySelector('span')?.textContent?.trim()||'';
      r.className='mf-v20-workout-card';
      r.innerHTML=`<div class="mf-v20-workout-num">${i+1}</div><div class="mf-v20-workout-main"><b>${esc(name)}</b><span>${esc(meta)}</span></div><div class="mf-v20-prescription"><b>${esc(prescription)}</b><span>${esc(rir)}</span></div><div class="mf-v20-workout-status"><span>READY</span></div>`;
    });
    const old=container.querySelector(':scope > .muted'); if(old)old.classList.add('mf-v20-workout-note');
  }

  function styleAssigned(){
    const list=$('mfAssignedWorkout');if(!list)return;
    list.querySelectorAll('.mf-assigned-list').forEach(x=>{
      x.classList.add('mf-v20-assigned-list');
      x.querySelectorAll(':scope > div').forEach((d,i)=>{
        if(d.dataset.v20Styled==='1')return;d.dataset.v20Styled='1';
        const txt=d.textContent.trim().split('\n').map(x=>x.trim()).filter(Boolean); const name=txt[0]||''; const meta=txt.slice(1).join(' · ');
        d.innerHTML=`<span class="mf-v20-assigned-num">${i+1}</span><div><b>${esc(name.replace(/^\d+\.\s*/,''))}</b><small>${esc(meta)}</small></div><span class="mf-v20-ready">READY</span>`;
      });
    });
  }

  function removeOldHistoryPanelHeading(){
    document.querySelectorAll('#mfExerciseHistory').forEach(box=>{const panel=box.closest('.panel');const head=panel?.querySelector('.panel-head');if(head){const pill=head.querySelector('.pill');if(pill&&/PROGRESSIVE OVERLOAD/i.test(pill.textContent||'')){pill.textContent='EXERCISE HISTORY';}}});
  }

  function injectCSS(){
    if($('mfV20Styles'))return;
    const s=document.createElement('style');s.id='mfV20Styles';s.textContent=`
      .mf-v20-progression{overflow:hidden}.mf-v20-prog-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.mf-v20-prog-head h3{margin:7px 0 4px}.mf-v20-prog-head p{margin:0;color:#91a59d;font-size:12px}.mf-v20-live{font-size:10px;font-weight:800;letter-spacing:.12em;padding:6px 9px;border-radius:999px;background:#10221b;color:#d9ff64;border:1px solid #315243}.mf-v20-metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}.mf-v20-metric-grid>div{padding:15px;border:1px solid #1c332a;background:#07100d;border-radius:15px;min-height:96px}.mf-v20-metric-grid span,.mf-v20-metric-grid b,.mf-v20-metric-grid small{display:block}.mf-v20-metric-grid span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#789187}.mf-v20-metric-grid b{font-size:18px;margin-top:8px;line-height:1.3}.mf-v20-metric-grid small{font-size:10px;color:#91a59d;margin-top:6px;line-height:1.45}.mf-v20-history-top{display:flex;justify-content:space-between;margin-bottom:12px}.mf-v20-history-top b,.mf-v20-history-top span{display:block}.mf-v20-history-top span{color:#91a59d;font-size:11px;margin-top:4px}.mf-v20-history-list{display:grid;gap:8px}.mf-v20-history-card{display:grid;grid-template-columns:1.25fr .8fr .55fr .55fr 1fr auto;align-items:center;gap:12px;padding:13px 14px;border:1px solid #1c332a;background:#07100d;border-radius:14px}.mf-v20-history-card.latest{border-color:#315243;background:#0b1712}.mf-v20-history-card b,.mf-v20-history-card span{display:block}.mf-v20-history-card span{font-size:10px;color:#91a59d;margin-top:3px}.mf-v20-date b{font-size:12px}.mf-v20-date span{color:#d9ff64;font-weight:800;letter-spacing:.08em}.mf-v20-e1rm b{font-size:13px}.mf-v20-view{white-space:nowrap}.mf-v20-history-empty{display:flex;gap:12px;align-items:center;padding:20px;border:1px dashed #365548;border-radius:14px}.mf-v20-empty-icon{width:36px;height:36px;border-radius:10px;background:#10221b;color:#d9ff64;display:grid;place-items:center;font-size:22px}.mf-v20-history-empty b,.mf-v20-history-empty span{display:block}.mf-v20-history-empty span{font-size:11px;color:#91a59d;margin-top:4px}.mf-v20-record-modal{max-width:620px}.mf-v20-record-hero{padding:18px;border-radius:16px;background:#07100d;border:1px solid #1c332a}.mf-v20-record-hero small,.mf-v20-record-hero span{display:block;color:#91a59d}.mf-v20-record-hero h2{margin:5px 0 10px}.mf-v20-record-hero>b{font-size:28px}.mf-v20-record-hero span{margin-top:6px;font-size:12px}.mf-v20-detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.mf-v20-detail-grid>div{padding:12px;border:1px solid #1c332a;border-radius:12px;background:#07100d}.mf-v20-detail-grid span,.mf-v20-detail-grid b{display:block}.mf-v20-detail-grid span{font-size:10px;color:#789187;text-transform:uppercase}.mf-v20-detail-grid b{margin-top:5px}.mf-v20-coach-box{padding:14px;border:1px solid #315243;background:#10221b;border-radius:14px;margin-bottom:12px}.mf-v20-coach-box span,.mf-v20-coach-box b,.mf-v20-coach-box small{display:block}.mf-v20-coach-box span{font-size:10px;color:#d9ff64;font-weight:800}.mf-v20-coach-box b{margin-top:6px;line-height:1.4}.mf-v20-coach-box small{color:#91a59d;margin-top:6px;line-height:1.45}.mf-v20-workout-card{display:grid!important;grid-template-columns:38px 1fr auto auto;align-items:center;gap:12px;padding:13px!important;border:1px solid #1c332a!important;background:#07100d!important;border-radius:14px!important;margin-bottom:8px}.mf-v20-workout-num{width:32px;height:32px;border-radius:10px;background:#10221b;color:#d9ff64;display:grid;place-items:center;font-weight:800}.mf-v20-workout-main b,.mf-v20-workout-main span,.mf-v20-prescription b,.mf-v20-prescription span{display:block}.mf-v20-workout-main b{font-size:13px}.mf-v20-workout-main span,.mf-v20-prescription span{font-size:10px;color:#91a59d;margin-top:3px}.mf-v20-prescription{text-align:right}.mf-v20-prescription b{font-size:13px}.mf-v20-workout-status span,.mf-v20-ready{font-size:9px;font-weight:800;letter-spacing:.08em;padding:6px 8px;border-radius:999px;background:#10221b;color:#d9ff64;border:1px solid #315243}.mf-v20-assigned-list{grid-template-columns:1fr!important;gap:7px!important}.mf-v20-assigned-list>div{display:flex;align-items:center;gap:11px}.mf-v20-assigned-num{width:28px;height:28px;border-radius:9px;background:#10221b;color:#d9ff64;display:grid;place-items:center;font-weight:800;flex:0 0 auto}.mf-v20-assigned-list>div>div{flex:1}.mf-v20-assigned-list>div b,.mf-v20-assigned-list>div small{display:block}.mf-v20-assigned-list>div small{font-size:10px;color:#91a59d;margin-top:3px}.mf-v20-workout-note{margin-top:10px!important}.mf-v20-hidden,.mf-v20-progression+ .mf-v19-hidden{display:none!important}
      @media(max-width:900px){.mf-v20-metric-grid{grid-template-columns:1fr 1fr}.mf-v20-history-card{grid-template-columns:1fr 1fr}.mf-v20-history-card .mf-v20-view{grid-column:1/-1}.mf-v20-detail-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:560px){.mf-v20-metric-grid{grid-template-columns:1fr}.mf-v20-workout-card{grid-template-columns:34px 1fr}.mf-v20-prescription,.mf-v20-workout-status{grid-column:2;text-align:left}}
    `;document.head.appendChild(s);
  }

  function refresh(){
    removePakistanPromo();
    removeFormUI();
    injectCSS();
    removeOldHistoryPanelHeading();
    renderHistory();
    styleWorkoutContainer($('mfGeneratedWorkout'));
    styleAssigned();
  }
  function install(){
    refresh();
    document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="trainingLab"]'))setTimeout(refresh,180);},true);
    document.addEventListener('change',e=>{if(e.target?.id==='mfHistoryExercise')setTimeout(refresh,20);},true);
    const observer=new MutationObserver(()=>{removePakistanPromo();removeFormUI();styleWorkoutContainer($('mfGeneratedWorkout'));styleAssigned();});
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(refresh,400);setTimeout(refresh,1200);setInterval(()=>{if(document.visibilityState!=='hidden')refresh();},2500);
  }
  document.addEventListener('DOMContentLoaded',install,{once:true});
  window.MacroForgeV20={refresh,renderHistory,progression};
})();
