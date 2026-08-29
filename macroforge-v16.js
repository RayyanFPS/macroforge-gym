/* =========================================================
   MACROFORGE V16 — FOOD EXPANSION + LIVE SEARCH + TRAINING LAB
   ========================================================= */
(function(){
  'use strict';
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const todayKey=()=>window.today?.()||new Date().toISOString().slice(0,10);
  const st=()=>window.state||null;
  const escV=v=>window.esc?window.esc(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* ---------------------------------------------------------
     1) LARGE CURATED FOOD LIBRARY
     Reference values are per 100 g/ml unless noted. Homemade
     dishes vary with recipe, oil and portion size.
     --------------------------------------------------------- */
  const extra = [
    // Pakistani breads / staples
    ['Tandoori Roti','Tandoori Roti','Bread',290,9.0,55,3.5,3.5,'100g'],
    ['Tandoori Roti — 1 piece','Tandoori Roti','Bread',150,4.5,28,1.8,2,'piece'],
    ['Chapati','Chapati','Bread',297,11.0,56,3.5,7.0,'100g'],
    ['Missi Roti','Missi Roti','Bread',320,11,52,7,8,'100g'],
    ['Bajra Roti','Bajray ki Roti','Bread',361,11.6,67,5.0,8.0,'100g'],
    ['Makki di Roti','Makki di Roti','Bread',218,5.0,44,3.0,5.0,'100g'],
    ['Jowar Roti','Jowar ki Roti','Bread',329,10.4,72,3.1,6.6,'100g'],
    ['Tandoori Naan','Tandoori Naan','Bread',275,9.0,50,5.0,2.5,'100g'],
    ['Peshawari Naan','Peshawari Naan','Bread',330,9.0,52,10,2,'piece'],
    ['Keema Naan','Keema Naan','Bread',295,13,35,11,2,'piece'],
    ['Cheese Naan','Cheese Naan','Bread',320,12,38,13,1,'piece'],
    ['Sheermal','Sheermal','Bread',310,8,50,8,1,'piece'],
    ['Taftan','Taftan','Bread',285,8,49,7,2,'piece'],
    ['Bakarkhani','Bakarkhani','Bread',390,8,55,16,2,'piece'],
    ['Puri — 1 piece','Puri','Bread',105,2,12,5,1,'piece'],
    ['Chawal — cooked','Pakistani Chawal','Staple',130,2.7,28,0.3,0.4,'100g'],
    ['Brown Rice — cooked','Brown Rice','Staple',123,2.7,25.6,1,1.6,'100g'],
    ['Basmati Rice — cooked','Basmati Chawal','Staple',130,2.7,28,0.3,0.4,'100g'],
    ['Daliya — cooked','Daliya','Breakfast',83,3.1,14,1.1,1.7,'100g'],
    ['Suji — dry','Suji','Staple',360,13,73,1,3.9,'100g'],

    // Pakistani mains / curries
    ['Chicken Peshawari','Chicken Peshawari','Pakistani',185,20,5,9,1,'100g'],
    ['Chicken Masala','Chicken Masala','Pakistani',175,18,6,8,1,'100g'],
    ['Chicken Achari Handi','Chicken Achari Handi','Pakistani',190,18,6,10,1,'100g'],
    ['Chicken Makhni','Chicken Makhni','Pakistani',215,17,7,14,1,'100g'],
    ['Chicken White Karahi','Chicken White Karahi','Pakistani',225,17,5,15,0.5,'100g'],
    ['Chicken Ginger','Chicken Adrak','Pakistani',180,19,5,9,1,'100g'],
    ['Chicken Shorba','Chicken Shorba','Pakistani',75,7,4,3,0.5,'bowl'],
    ['Chicken Yakhni','Chicken Yakhni','Pakistani',55,7,1,2,0,'bowl'],
    ['Chicken Stew','Chicken Stew','Pakistani',110,10,8,4,1,'bowl'],
    ['Mutton Shorba','Mutton Shorba','Pakistani',90,7,3,5,0.5,'bowl'],
    ['Mutton Yakhni','Mutton Yakhni','Pakistani',70,8,1,4,0,'bowl'],
    ['Mutton Peshawari','Mutton Peshawari','Pakistani',235,19,4,16,1,'100g'],
    ['Mutton Handi','Mutton Handi','Pakistani',230,17,6,15,1,'100g'],
    ['Mutton Raan','Mutton Raan','Pakistani',220,25,0,13,0,'100g'],
    ['Beef Nihari','Beef Nihari','Pakistani',220,16,7,14,1,'bowl'],
    ['Chicken Nihari','Chicken Nihari','Pakistani',175,16,7,9,1,'bowl'],
    ['Beef Handi','Beef Handi','Pakistani',210,18,6,13,1,'100g'],
    ['Beef Masala','Beef Masala','Pakistani',205,20,5,12,1,'100g'],
    ['Beef Stew','Beef Stew','Pakistani',150,15,9,6,1.5,'bowl'],
    ['Aloo Qeema','Aloo Qeema','Pakistani',190,11,11,11,2,'plate'],
    ['Matar Qeema','Matar Qeema','Pakistani',205,15,9,12,3,'plate'],
    ['Palak Gosht','Palak Gosht','Pakistani',160,13,5,10,3,'plate'],
    ['Bhindi Gosht','Bhindi Gosht','Pakistani',155,11,8,9,3,'plate'],
    ['Lauki Gosht','Lauki Gosht','Pakistani',125,10,6,7,2,'plate'],
    ['Karela Gosht','Karela Gosht','Pakistani',145,11,7,8,3,'plate'],
    ['Daal Chana','Chana Daal','Pakistani',120,7,19,2,7,'bowl'],
    ['Daal Masoor','Masoor Daal','Pakistani',116,8,20,1,7,'bowl'],
    ['Daal Moong','Moong Daal','Pakistani',105,7,16,1,5,'bowl'],
    ['Daal Arhar','Arhar Daal','Pakistani',118,7,20,1,6,'bowl'],
    ['Daal Tarka','Daal Tarka','Pakistani',145,7,18,5,6,'bowl'],
    ['Daal Fry','Daal Fry','Pakistani',155,7,18,6,5,'bowl'],
    ['Rajma Masala','Rajma Masala','Pakistani',145,8,23,3,7,'bowl'],
    ['Lobia','Lobia','Pakistani',130,8,23,1,7,'bowl'],
    ['Lobia Masala','Lobia Masala','Pakistani',150,8,22,4,7,'bowl'],
    ['Aloo Matar','Aloo Matar','Pakistani',120,4,20,3,4,'bowl'],
    ['Aloo Palak','Aloo Palak','Pakistani',105,3,17,3,4,'bowl'],
    ['Palak Paneer','Palak Paneer','Pakistani',145,8,6,10,2,'bowl'],
    ['Bhindi Masala','Bhindi Masala','Pakistani',105,3,10,6,4,'bowl'],
    ['Baingan Bharta','Baingan Bharta','Pakistani',105,2,10,6,4,'bowl'],
    ['Mixed Sabzi','Mix Sabzi','Pakistani',90,3,12,4,4,'bowl'],
    ['Tori Sabzi','Tori Sabzi','Pakistani',80,2,10,3,3,'bowl'],
    ['Karela Sabzi','Karela Sabzi','Pakistani',95,2,8,6,4,'bowl'],
    ['Kaddu Sabzi','Kaddu Sabzi','Pakistani',90,2,12,4,3,'bowl'],
    ['Gobi Aloo','Gobi Aloo','Pakistani',105,3,15,4,4,'bowl'],
    ['Gobi Masala','Gobi Masala','Pakistani',95,3,9,5,3,'bowl'],
    ['Matar Paneer','Matar Paneer','Pakistani',170,8,10,11,3,'bowl'],
    ['Cholay Masala','Cholay Masala','Pakistani',155,8,23,4,7,'bowl'],
    ['Daal Chawal','Daal Chawal','Pakistani',175,6,29,4,4,'plate'],
    ['Chicken Rice','Chicken Rice','Pakistani',165,10,25,4,1,'plate'],
    ['Chicken Biryani — homemade','Ghar ki Chicken Biryani','Pakistani',175,9,23,5,1,'100g'],
    ['Beef Biryani','Beef Biryani','Pakistani',195,8,23,7,1,'100g'],
    ['Mutton Biryani','Mutton Biryani','Pakistani',205,9,22,8,1,'100g'],
    ['Sindhi Biryani','Sindhi Biryani','Pakistani',180,8,23,6,1,'100g'],
    ['Yakhni Pulao','Yakhni Pulao','Pakistani',165,7,27,3,1,'100g'],
    ['Kabuli Pulao','Kabuli Pulao','Pakistani',180,6,28,5,2,'100g'],

    // Pakistani BBQ / street foods
    ['Tandoori Fish','Tandoori Fish','BBQ',150,25,3,5,0,'100g'],
    ['Fish Tikka','Fish Tikka','BBQ',145,26,2,4,0,'100g'],
    ['Chicken Seekh Kebab — grilled','Grilled Chicken Seekh','BBQ',190,23,4,9,0,'piece'],
    ['Beef Chapli Kebab','Beef Chapli Kebab','BBQ',270,17,6,20,1,'piece'],
    ['Mutton Seekh Kebab','Mutton Seekh Kebab','BBQ',260,19,3,19,0,'piece'],
    ['Chicken Malai Tikka','Chicken Malai Tikka','BBQ',205,22,4,11,0,'piece'],
    ['Chicken Bihari Boti','Chicken Bihari Boti','BBQ',185,23,3,9,0,'piece'],
    ['Tandoori Fish Tikka','Tandoori Fish Tikka','BBQ',145,26,2,4,0,'piece'],
    ['Chicken Wings — grilled','Grilled Chicken Wings','BBQ',203,25,0,11,0,'100g'],
    ['Beef Boti','Beef Boti','BBQ',220,27,1,12,0,'100g'],
    ['Mutton Boti','Mutton Boti','BBQ',240,25,1,16,0,'100g'],
    ['Chicken Shashlik','Chicken Shashlik','BBQ',140,19,6,4,1,'piece'],
    ['Seekh Kebab Roll','Seekh Kebab Roll','Snacks',310,18,32,12,3,'wrap'],
    ['Chicken Tikka Roll','Chicken Tikka Roll','Snacks',295,24,31,9,2,'wrap'],
    ['Dahi Puri','Dahi Puri','Snacks',185,5,27,7,2,'plate'],
    ['Aloo Chaat','Aloo Chaat','Snacks',135,3,23,4,3,'plate'],
    ['Samosa Chaat','Samosa Chaat','Snacks',245,7,32,10,5,'plate'],
    ['Dahi Puri — 4 pieces','Dahi Puri','Snacks',220,6,31,9,2,'plate'],
    ['Pakistani Fries Masala','Masala Fries','Snacks',330,4,43,16,4,'100g'],

    // Breakfast / dairy
    ['Anda Bhurji','Anda Bhurji','Breakfast',170,11,4,12,1,'plate'],
    ['Anda Shami','Anda Shami','Breakfast',210,12,8,15,2,'piece'],
    ['Egg Sandwich','Anda Sandwich','Breakfast',270,13,28,12,2,'sandwich'],
    ['Egg Toast','Egg Toast','Breakfast',220,11,24,9,2,'2 slices'],
    ['Oats with Milk','Oats with Milk','Breakfast',140,6,20,4,2,'100g'],
    ['Oats Banana Bowl','Oats Banana Bowl','Breakfast',150,5,25,4,3,'bowl'],
    ['Dahi with Honey','Dahi Shehad','Breakfast',105,3.5,16,3,0,'bowl'],
    ['Dahi with Banana','Dahi Kela','Breakfast',105,4,17,2,1.5,'bowl'],
    ['Lassi Sweet','Meethi Lassi','Drinks',105,3.5,16,3,0,'250ml'],
    ['Lassi Salted','Namkeen Lassi','Drinks',60,3.5,5,2.5,0,'250ml'],
    ['Doodh','Whole Milk','Drinks',61,3.2,4.8,3.3,0,'100ml'],
    ['Doodh Low Fat','Low Fat Milk','Drinks',42,3.4,5,1,0,'100ml'],
    ['Chai with Milk','Chai Doodh Patti','Drinks',55,2,7,2,0,'cup'],
    ['Kahwa','Kahwa','Drinks',2,0,0,0,0,'cup'],

    // Fruits / vegetables
    ['Papaya','Papita','Fruit',43,0.5,11,0.3,1.7,'100g'],
    ['Pomegranate','Anaar','Fruit',83,1.7,18.7,1.2,4,'100g'],
    ['Watermelon','Tarbooz','Fruit',30,0.6,7.6,0.2,0.4,'100g'],
    ['Melon','Kharboza','Fruit',34,0.8,8.2,0.2,0.9,'100g'],
    ['Peach','Aaroo','Fruit',39,0.9,9.5,0.3,1.5,'100g'],
    ['Pear','Nashpati','Fruit',57,0.4,15,0.1,3.1,'100g'],
    ['Pineapple','Ananas','Fruit',50,0.5,13.1,0.1,1.4,'100g'],
    ['Strawberries','Strawberry','Fruit',32,0.7,7.7,0.3,2,'100g'],
    ['Carrot','Gajar','Vegetables',41,0.9,9.6,0.2,2.8,'100g'],
    ['Cucumber','Kheera','Vegetables',15,0.7,3.6,0.1,0.5,'100g'],
    ['Tomato','Tamatar','Vegetables',18,0.9,3.9,0.2,1.2,'100g'],
    ['Onion','Pyaaz','Vegetables',40,1.1,9.3,0.1,1.7,'100g'],
    ['Spinach','Palak','Vegetables',23,2.9,3.6,0.4,2.2,'100g'],
    ['Capsicum','Shimla Mirch','Vegetables',31,1,6,0.3,2.1,'100g'],
    ['Cauliflower','Phool Gobi','Vegetables',25,1.9,5,0.3,2,'100g'],
    ['Okra','Bhindi','Vegetables',33,1.9,7.5,0.2,3.2,'100g'],
    ['Peas','Matar','Vegetables',81,5.4,14.5,0.4,5.7,'100g'],

    // Nuts / seeds / pantry
    ['Cashews','Kaju','Nuts',553,18,30,44,3.3,'100g'],
    ['Pistachios','Pista','Nuts',562,20,28,45,10,'100g'],
    ['Peanuts','Moongphali','Nuts',567,25.8,16.1,49.2,8.5,'100g'],
    ['Sesame Seeds','Til','Nuts',573,17.7,23.4,49.7,11.8,'100g'],
    ['Flax Seeds','Alsi','Nuts',534,18.3,28.9,42.2,27.3,'100g'],
    ['Chia Seeds','Chia','Nuts',486,16.5,42.1,30.7,34.4,'100g'],
    ['Tahini','Tahini','Staple',595,17,21,54,9,'100g'],
    ['Honey','Shehad','Staple',304,0.3,82.4,0,0.2,'100g'],
    ['Olive Oil','Zaitoon Oil','Staple',884,0,0,100,0,'100g'],
    ['Ghee','Desi Ghee','Staple',876,0,0,99.5,0,'100g'],
    ['Butter','Makhan','Staple',717,0.9,0.1,81,0,'100g'],

    // English / global foods
    ['Beef Burger with Bun','Beef Burger with Bun','English / Fast Food',295,16,25,15,1.5,'100g'],
    ['Chicken Burger with Bun','Chicken Burger with Bun','English / Fast Food',250,17,24,10,1.2,'100g'],
    ['Cheeseburger','Cheeseburger','English / Fast Food',303,16,25,17,1,'100g'],
    ['Chicken Nuggets','Chicken Nuggets','English / Fast Food',296,15.6,16,19,1,'100g'],
    ['Chicken Wrap','Chicken Wrap','English / Fast Food',250,17,27,9,2,'100g'],
    ['Grilled Chicken Sandwich','Grilled Chicken Sandwich','English',220,20,23,6,2,'100g'],
    ['Eggs, whole cooked','Whole Eggs','Breakfast',155,13,1.1,11,0,'100g'],
    ['Egg White','Egg Whites','Staple',52,10.9,0.7,0.2,0,'100g'],
    ['Greek Yogurt 0%','Greek Yogurt 0%','Breakfast',59,10.2,3.6,0.4,0,'100g'],
    ['Cottage Cheese','Cottage Cheese','Staple',98,11.1,3.4,4.3,0,'100g'],
    ['Mozzarella','Mozzarella','Staple',280,28,3.1,17,0,'100g'],
    ['Cheddar Cheese','Cheddar','Staple',403,25,1.3,33,0,'100g'],
    ['Peanut Butter','Peanut Butter','Staple',588,25,20,50,6,'100g'],
    ['Jam','Fruit Jam','Staple',250,0.4,65,0.1,0.8,'100g'],
    ['Avocado','Avocado','Fruit',160,2,8.5,14.7,6.7,'100g'],
    ['Tortilla','Tortilla','English',312,8,52,8,4,'100g'],
    ['Pizza Margherita','Pizza Margherita','English / Fast Food',266,11,33,10,2,'100g'],
    ['Pizza Chicken','Chicken Pizza','English / Fast Food',270,13,31,11,2,'100g'],
    ['Lasagna','Lasagna','English',135,7,15,5,1.5,'100g'],
    ['Macaroni and Cheese','Mac and Cheese','English',164,7,20,6,1,'100g'],
    ['French Fries','French Fries','English / Fast Food',312,3.4,41,15,3.8,'100g'],
    ['Mashed Potato','Mashed Potato','English',113,2,16,4,1.5,'100g'],
    ['Chicken Breast Grilled','Grilled Chicken Breast','Staple',165,31,0,3.6,0,'100g'],
    ['Chicken Thigh Cooked','Chicken Thigh','Staple',209,26,0,11,0,'100g'],
    ['Beef Steak','Beef Steak','Staple',271,26,0,18,0,'100g'],
    ['Lean Beef Mince','Lean Beef Mince','Staple',176,26,0,8,0,'100g'],
    ['Salmon Cooked','Salmon','Staple',206,22,0,12,0,'100g'],
    ['Tuna Canned Water','Tuna','Staple',116,26,0,0.8,0,'100g'],
    ['White Bread','White Bread','Bread',266,8.9,49,3.2,2.7,'100g'],
    ['Whole Wheat Bread','Whole Wheat Bread','Bread',247,13,41,4.2,6.8,'100g'],
    ['Bagel','Bagel','Bread',257,10,50,1.5,2.5,'100g'],
    ['Oatmeal Cooked','Oatmeal','Breakfast',71,2.5,12,1.5,1.7,'100g'],
    ['Corn Flakes','Corn Flakes','Breakfast',357,7.5,84,0.4,3,'100g'],
    ['Granola','Granola','Breakfast',471,10,64,20,7,'100g'],
    ['Protein Bar — generic','Protein Bar','Gym Supplements',380,30,35,12,7,'100g'],
    ['Whey Protein — Chocolate Generic','Whey Chocolate','Gym Supplements',390,75,10,6,1,'100g'],
    ['Whey Protein — Vanilla Generic','Whey Vanilla','Gym Supplements',390,75,10,6,1,'100g'],
    ['Whey Protein — Strawberry Generic','Whey Strawberry','Gym Supplements',390,75,10,6,1,'100g'],
    ['Whey Protein — Cookies & Cream Generic','Whey Cookies & Cream','Gym Supplements',400,74,11,7,1,'100g'],
    ['Mass Gainer — Chocolate Generic','Mass Gainer Chocolate','Gym Supplements',380,20,70,5,2,'100g'],
    ['Mass Gainer — Vanilla Generic','Mass Gainer Vanilla','Gym Supplements',380,20,70,5,2,'100g'],
    ['Mass Gainer — Strawberry Generic','Mass Gainer Strawberry','Gym Supplements',380,20,70,5,2,'100g'],
    ['Mass Gainer — Cookies & Cream Generic','Mass Gainer Cookies & Cream','Gym Supplements',390,20,68,7,2,'100g'],
    ['Mass Gainer — Banana Generic','Mass Gainer Banana','Gym Supplements',380,20,70,5,2,'100g'],
    ['Creatine Monohydrate — 5g','Creatine Monohydrate','Gym Supplements',0,0,0,0,0,'5g']
  ];

  function tupleToObject(t){
    const [name,roman,category,cal,p,c,f,fiber,unit]=t;
    let nu='g',na=100,pg=100,pm=null,du='g';
    if(unit==='100g'){nu='g';na=100;pg=100;du='g';}
    else if(unit==='100ml'){nu='ml';na=100;pg=100;pm=100;du='ml';}
    else if(unit==='250ml'){nu='ml';na=250;pg=250;pm=250;du='ml';}
    else if(unit==='piece'){nu='g';na=100;pg=50;du='piece';}
    else if(unit==='bowl'){nu='g';na=100;pg=250;du='bowl';}
    else if(unit==='plate'){nu='g';na=100;pg=300;du='plate';}
    else if(unit==='cup'){nu='g';na=100;pg=240;du='cup';}
    else if(unit==='sandwich'){nu='g';na=100;pg=180;du='sandwich';}
    else if(unit==='wrap'){nu='g';na=100;pg=180;du='wrap';}
    else if(unit==='2 slices'){nu='g';na=100;pg=60;du='slice';}
    else if(unit==='5g'){nu='g';na=5;pg=1;du='g';}
    return {name,roman,category,cal,p,c,f,fiber,baseUnit:nu,nutritionUnit:nu,nutritionAmount:na,portionGrams:pg,portionMl:pm,defaultUnit:du,source:'MacroForge curated reference — verify recipe/label'};
  }
  try{
    if(typeof MF_LOCAL_RECORDS !== 'undefined') window.MF_LOCAL_RECORDS = MF_LOCAL_RECORDS;
    if(typeof MF_EXTRA_GYM_FOODS !== 'undefined') window.MF_EXTRA_GYM_FOODS = MF_EXTRA_GYM_FOODS;
    if(Array.isArray(window.MF_LOCAL_RECORDS)){
      const names=new Set(window.MF_LOCAL_RECORDS.map(x=>String(x.name).toLowerCase()));
      extra.map(tupleToObject).forEach(f=>{if(!names.has(f.name.toLowerCase()))window.MF_LOCAL_RECORDS.push(f);});
    }
  }catch(e){console.warn('Food expansion:',e);}

  /* ---------------------------------------------------------
     2) GLOBAL SEARCH — broad relevance, local-first fallback,
        USDA + Open Food Facts when online.
     --------------------------------------------------------- */
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\u0600-\u06ff]+/g,' ').trim();}
  function score(name,query){
    const nt=norm(name), qt=norm(query); const toks=qt.split(/\s+/).filter(Boolean);
    if(!toks.length)return 0; let s=0;
    if(nt===qt)s+=1000; if(nt.includes(qt))s+=500;
    for(const t of toks){if(nt.includes(t))s+=100;} if(toks.every(t=>nt.includes(t)))s+=300;
    return s;
  }
  function foodCard(food, source){
    const payload=encodeURIComponent(JSON.stringify(food));
    return `<article class="food-card mf-v16-search-card"><span class="category">${escV(food.category||source||'Global')}</span><h3>${escV(food.name)}</h3><div class="roman">${escV(food.roman||source||'')}</div><div class="macro-line"><span>CAL<b>${Math.round(n(food.cal))}</b></span><span>PROT<b>${n(food.p).toFixed(1)}g</b></span><span>CARB<b>${n(food.c).toFixed(1)}g</b></span><span>FAT<b>${n(food.f).toFixed(1)}g</b></span></div><small style="color:#647c72">Per ${food.nutritionAmount||100}${food.nutritionUnit||'g'} · ${escV(food.source||source||'Reference')}</small><button class="primary full" onclick="openFoodEncoded('${payload}')">Log food</button></article>`;
  }
  function renderLocalSearch(q){
    const box=document.getElementById('foodResults'); if(!box)return 0;
    const arr=(window.MF_LOCAL_RECORDS||[]).filter(f=>score(`${f.name} ${f.roman||''}`,q)>0).sort((a,b)=>score(b.name,q)-score(a.name,q)).slice(0,24);
    if(arr.length)box.innerHTML=`<div class="result-section-title mf-global-heading" style="grid-column:1/-1"><span class="pill">MACROFORGE LIBRARY · ${arr.length}</span></div>`+arr.map(f=>foodCard(f,'MacroForge')).join('');
    else box.innerHTML='';
    return arr.length;
  }
  async function globalV16(q){
    q=String(q||'').trim(); if(q.length<2)return;
    const box=document.getElementById('foodResults'); if(!box)return;
    let localCount=renderLocalSearch(q);
    box.insertAdjacentHTML('beforeend',`<div id="mfV16SearchStatus" class="global-message" style="grid-column:1/-1;padding:12px 0">Searching external databases for “${escV(q)}”…</div>`);
    const results=[];
    try{
      const off=`https://world.openfoodfacts.org/cgi/search.pl?action=process&json=1&search_simple=1&search_terms=${encodeURIComponent(q)}&page=1&page_size=24&lc=en&fields=code,product_name,product_name_en,generic_name,generic_name_en,brands,serving_size,quantity,nutriments`;
      const r=await fetch(off,{cache:'no-store'}); if(r.ok){const d=await r.json();for(const p of (d.products||[])){const name=p.product_name_en||p.product_name||p.generic_name_en||p.generic_name;if(!name)continue;const nut=p.nutriments||{};const cal=n(nut['energy-kcal_100g'])||n(nut.energy_100g)/4.184;const obj={name,roman:p.brands?`Brand: ${p.brands}`:'Open Food Facts',category:'Global',cal,p:n(nut.proteins_100g),c:n(nut.carbohydrates_100g),f:n(nut.fat_100g),fiber:n(nut.fiber_100g),nutritionUnit:'g',nutritionAmount:100,portionGrams:100,source:'Open Food Facts',servingText:p.serving_size||'',quantity:p.quantity||''};if(cal||obj.p||obj.c||obj.f)results.push({...obj,_score:score(name+' '+(p.generic_name_en||'')+' '+(p.brands||''),q)});}}
    }catch(e){console.warn('OFF search',e);}
    try{
      const usda=`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(q)}&pageSize=24&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)`;
      const r=await fetch(usda,{cache:'no-store'}); if(r.ok){const d=await r.json();for(const p of (d.foods||[])){const name=p.description;if(!name)continue;const nutrients={};for(const x of (p.foodNutrients||[]))nutrients[x.nutrientName]=x.value;const obj={name,roman:'USDA FoodData Central',category:'Global',cal:n(nutrients['Energy']),p:n(nutrients['Protein']),c:n(nutrients['Carbohydrate, by difference']),f:n(nutrients['Total lipid (fat)']),fiber:n(nutrients['Fiber, total dietary']),nutritionUnit:'g',nutritionAmount:100,portionGrams:100,source:'USDA FoodData Central',_score:score(name,q)};if(obj.cal||obj.p||obj.c||obj.f)results.push(obj);}}
    }catch(e){console.warn('USDA search',e);}
    const unique=[];const seen=new Set();for(const f of results.sort((a,b)=>b._score-a._score)){const k=norm(f.name);if(seen.has(k))continue;seen.add(k);unique.push(f);if(unique.length>=24)break;}
    document.getElementById('mfV16SearchStatus')?.remove();
    if(unique.length){box.insertAdjacentHTML('beforeend',`<div class="result-section-title mf-global-heading" style="grid-column:1/-1;margin-top:12px"><span class="pill">GLOBAL DATABASE · ${unique.length}</span></div>`+unique.map(f=>foodCard(f,'Global')).join(''));}
    else if(!localCount)box.insertAdjacentHTML('beforeend',`<div class="empty-state mf-global-result"><h3>No relevant result found</h3><p>Try a broader name such as “beef burger”, “chicken”, “rice”, or add the exact product as a Custom Food.</p></div>`);
  }
  function installSearch(){
    const input=document.getElementById('foodSearch'), btn=document.getElementById('searchFoodBtn'); if(!input||!btn)return;
    const ni=input.cloneNode(true), nb=btn.cloneNode(true); input.replaceWith(ni); btn.replaceWith(nb);
    let timer=null; const run=()=>{clearTimeout(timer);timer=setTimeout(()=>globalV16(ni.value),180);};
    ni.addEventListener('input',run); ni.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();globalV16(ni.value);}}); nb.addEventListener('click',e=>{e.preventDefault();globalV16(ni.value);});
    window.MacroForgeV16Search=globalV16;
  }

  /* ---------------------------------------------------------
     3) MEAL COACH — robust component logger.
     --------------------------------------------------------- */
  const mealCatalog=[
    {name:'Daal + Rice + Raita',parts:[['Lentil Curry',1,'bowl'],['White Rice',200,'g'],['Raita',1,'bowl']]},
    {name:'Chicken Tikka + Tandoori Roti',parts:[['Chicken Tikka',2,'piece'],['Tandoori Roti — 1 piece',2,'piece']]},
    {name:'Chicken Karahi + Tandoori Roti',parts:[['Chicken Karahi',1,'plate'],['Tandoori Roti — 1 piece',1,'piece']]},
    {name:'Chicken Biryani + Raita',parts:[['Biryani',1,'plate'],['Raita',1,'bowl']]},
    {name:'Qeema + Roti',parts:[['Qeema',1,'plate'],['Roti',2,'piece']]},
    {name:'Chana + Tandoori Roti',parts:[['Chickpea Curry',1,'bowl'],['Tandoori Roti — 1 piece',2,'piece']]},
    {name:'Eggs + Paratha + Dahi',parts:[['Boiled Egg',2,'piece'],['Paratha',1,'piece'],['Dahi',150,'g']]},
    {name:'Chicken Pulao + Raita',parts:[['Chicken Pulao',1,'plate'],['Raita',1,'bowl']]},
    {name:'Aloo Qeema + Roti',parts:[['Aloo Qeema',1,'plate'],['Roti',2,'piece']]},
    {name:'Cholay + Tandoori Roti',parts:[['Cholay Masala',1,'bowl'],['Tandoori Roti — 1 piece',2,'piece']]}
  ];
  function findFood(name){return (window.MF_LOCAL_RECORDS||[]).find(f=>String(f.name).toLowerCase()===name.toLowerCase()) || (window.MF_LOCAL_RECORDS||[]).find(f=>String(f.name).toLowerCase().includes(name.toLowerCase()));}
  function logMeal(meal){
    const s=st(); if(!s)return;
    let count=0; s.foodLog=Array.isArray(s.foodLog)?s.foodLog:[];
    for(const [name,amount,unit] of meal.parts){const f=findFood(name);if(!f||typeof window.mfCalculatePortion!=='function')continue;const x=window.mfCalculatePortion(f,amount,unit);s.foodLog.push({id:`mealv16_${Date.now()}_${Math.random()}`,name:f.name,amount,unit,cal:n(x.cal),p:n(x.p),c:n(x.c),f:n(x.f),fiber:n(x.fiber),date:todayKey(),source:'Pakistani Fuel Coach'});count++;}
    window.save?.();window.updateDashboard?.();window.renderFoods?.();window.toast?.(count?`${meal.name} logged — ${count} foods added`:'Meal could not be logged');
  }
  document.addEventListener('click',e=>{
    const btn=e.target.closest?.('#mfCoachLogMeal'); if(!btn)return;
    e.preventDefault();e.stopImmediatePropagation();
    const title=document.querySelector('#mfMealCoach h4')?.textContent?.trim(); const meal=mealCatalog.find(m=>m.name===title) || mealCatalog.find(m=>title&&m.name.toLowerCase().includes(title.toLowerCase()));
    if(meal)logMeal(meal);
  },true);

  /* ---------------------------------------------------------
     4) >10 g MACRO OVER-GOAL WARNING — warning only, never blocks.
     --------------------------------------------------------- */
  function overGoalWarning(){
    const s=st();if(!s)return;const g=s.goals||{};const d=todayKey();const log=(s.foodLog||[]).filter(x=>x.date===d);
    const totals=['protein','carbs','fat'].reduce((a,k)=>{const key=k==='protein'?'p':k==='carbs'?'c':'f';a[k]=log.reduce((z,x)=>z+n(x[key]),0);return a;},{ });
    const over=Object.entries({protein:g.protein,carbs:g.carbs,fat:g.fat}).filter(([k,target])=>n(target)>0&&totals[k]>n(target)+10).map(([k,target])=>`${k} is ${Math.round(totals[k]-n(target))} g over goal`);
    let el=document.getElementById('mfMacroOverWarning');
    if(!over.length){el?.remove();return;}
    if(!el){el=document.createElement('div');el.id='mfMacroOverWarning';el.className='mf-v16-warning';document.querySelector('.main')?.prepend(el);}
    el.innerHTML=`<b>Macro target warning</b><span>${over.join(' · ')}. This is a warning only — MacroForge will not block logging. Daily targets are estimates, and a single high day does not determine progress.</span>`;
  }

  /* ---------------------------------------------------------
     5) TRAINING LAB — less manual planner + exercise records.
     --------------------------------------------------------- */
  const exercises=[
    ['Barbell Bench Press','Chest','Horizontal push','3','6–10'],['Incline Dumbbell Press','Chest','Upper chest','3','8–12'],['Cable Fly','Chest','Chest isolation','3','10–15'],
    ['Lat Pulldown','Back','Vertical pull','3','8–12'],['Barbell Row','Back','Horizontal pull','3','6–10'],['Seated Cable Row','Back','Horizontal pull','3','8–12'],['One-Arm Dumbbell Row','Back','Horizontal pull','3','8–12'],
    ['Back Squat','Legs','Squat','3','6–10'],['Leg Press','Legs','Squat pattern','3','8–12'],['Romanian Deadlift','Legs','Hip hinge','3','6–10'],['Leg Curl','Legs','Knee flexion','3','10–15'],['Leg Extension','Legs','Knee extension','3','10–15'],
    ['Overhead Press','Shoulders','Vertical push','3','6–10'],['Lateral Raise','Shoulders','Delt isolation','3','10–15'],['Rear Delt Fly','Shoulders','Rear delt','3','12–20'],
    ['Barbell Curl','Biceps','Elbow flexion','3','8–12'],['Incline Dumbbell Curl','Biceps','Elbow flexion','3','8–12'],['Triceps Pushdown','Triceps','Elbow extension','3','8–15'],['Overhead Triceps Extension','Triceps','Elbow extension','3','8–15'],
    ['Calf Raise','Calves','Plantar flexion','3','10–15'],['Cable Crunch','Core','Trunk flexion','3','10–15']
  ];
  function ensureTraining(){const s=st();if(!s)return null;s.training=s.training||{records:[],plans:[]};s.training.records=Array.isArray(s.training.records)?s.training.records:[];s.training.plans=Array.isArray(s.training.plans)?s.training.plans:[];return s.training;}
  function oneRM(w,r){w=n(w);r=n(r);return w>0&&r>0?w*(1+r/30):0;}
  function renderTrainingLab(){
    const page=document.getElementById('trainingLab');if(!page)return;const t=ensureTraining();
    const exerciseOptions=exercises.map(x=>`<option value="${escV(x[0])}">${escV(x[0])} — ${escV(x[1])}</option>`).join('');
    page.innerHTML=`<div class="section-intro"><div><span class="pill">TRAINING SCIENCE</span><h2>Training Lab</h2><p>A less-manual lifting planner with evidence-based progression and a long-term exercise record.</p></div></div>
    <div class="mf-training-grid"><section class="panel"><div class="panel-head"><div><span class="pill">SMART SESSION</span><h3>Build a session</h3></div></div><div class="form-grid"><label>Goal<select id="mfTrainGoal"><option value="hypertrophy">Hypertrophy</option><option value="strength">Strength</option><option value="mixed">Mixed</option></select></label><label>Experience<select id="mfTrainExperience"><option value="novice">Novice</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label>Time available (min)<input id="mfTrainTime" type="number" value="60" min="20" max="180"></label><label>Focus<select id="mfTrainFocus"><option>Full Body</option><option>Chest</option><option>Back</option><option>Legs</option><option>Shoulders</option><option>Arms</option></select></label></div><button class="primary full" id="mfGenerateWorkout">Generate workout</button><div id="mfGeneratedWorkout" class="mf-generated-workout"><div class="muted">Generate a session and MacroForge will choose exercises, sets and rep ranges.</div></div></section>
    <section class="panel"><div class="panel-head"><div><span class="pill">EXERCISE RECORD</span><h3>Track an exercise</h3></div></div><div class="form-grid"><label>Exercise<select id="mfRecordExercise">${exerciseOptions}</select></label><label>Date<input id="mfRecordDate" type="date" value="${todayKey()}"></label><label>Weight (kg)<input id="mfRecordWeight" type="number" step="0.5" min="0"></label><label>Reps<input id="mfRecordReps" type="number" min="1" step="1"></label><label>Sets<input id="mfRecordSets" type="number" min="1" step="1" value="3"></label><label>RIR<select id="mfRecordRir"><option value="0">0</option><option value="1" selected>1</option><option value="2">2</option><option value="3">3+</option></select></label></div><button class="primary full" id="mfSaveExerciseRecord">Save record</button><div id="mfRecordSummary" class="mf-record-summary"></div></section></div>
    <section class="panel"><div class="panel-head"><div><span class="pill">PROGRESSIVE OVERLOAD</span><h3>Exercise history</h3></div><span class="muted">${t.records.length} records</span></div><label style="max-width:360px">View exercise<select id="mfHistoryExercise">${exerciseOptions}</select></label><div id="mfExerciseHistory" class="mf-history-table"></div></section>
    <section class="panel"><div class="panel-head"><div><span class="pill">SCIENCE NOTES</span><h3>How to progress</h3></div></div><div class="science-grid"><article class="science-card"><span>DOUBLE PROGRESSION</span><b>Reps → load</b><p>Stay inside the chosen rep range. When you can exceed the top of the range with controlled technique, add a small load increase and build reps again.</p></article><article class="science-card"><span>HYPERTROPHY</span><b>Volume matters</b><p>The 2026 ACSM overview found higher weekly resistance-training volume was associated with better hypertrophy outcomes. It also emphasizes progressive resistance training.</p></article><article class="science-card"><span>REST</span><b>Don't rush heavy sets</b><p>For demanding strength work, longer rests can preserve performance. Older ACSM guidance recommends 3–5 minutes for heavy strength work and 1–2 minutes for typical hypertrophy work.</p></article><article class="science-card"><span>TECHNIQUE</span><b>Progress quality first</b><p>Only count a progression when range of motion, control and the intended exercise are reasonably consistent. A heavier number with degraded technique is not automatically a better record.</p></article></div></section>`;
    document.getElementById('mfGenerateWorkout').onclick=generateWorkout;document.getElementById('mfSaveExerciseRecord').onclick=saveRecord;document.getElementById('mfHistoryExercise').onchange=renderHistory;renderHistory();
  }
  function generateWorkout(){
    const goal=document.getElementById('mfTrainGoal')?.value||'hypertrophy';
    const experience=document.getElementById('mfTrainExperience')?.value||'intermediate';
    const focus=document.getElementById('mfTrainFocus')?.value||'Full Body';
    const time=Math.max(20,Math.min(180,n(document.getElementById('mfTrainTime')?.value)||60));
    let pool=exercises.filter(x=>focus==='Full Body'||x[1]===focus||(focus==='Arms'&&(x[1]==='Biceps'||x[1]==='Triceps')));if(!pool.length)pool=exercises;
    const count=Math.max(4,Math.min(8,Math.floor(time/10)));
    const chosen=pool.slice(0,count);
    const rep=goal==='strength'?'4–6':goal==='hypertrophy'?'8–12':'6–10';
    const sets=experience==='novice'?3:experience==='advanced'?4:3;
    const html=`<div class="mf-plan-list">${chosen.map((x,i)=>`<div class="mf-plan-row"><div><b>${escV(x[0])}</b><small>${escV(x[1])} · ${i<2?'priority compound':'accessory'}</small></div><strong>${i<2?sets:Math.max(2,sets-1)} × ${rep}</strong><span>RIR 1–3</span></div>`).join('')}</div><p class="muted">Start around the low end of the rep range. Add reps while technique stays solid; once you can consistently exceed the range, increase load modestly.</p>`;
    document.getElementById('mfGeneratedWorkout').innerHTML=html;
  }
  function saveRecord(){const t=ensureTraining();const exercise=document.getElementById('mfRecordExercise').value,date=document.getElementById('mfRecordDate').value||todayKey(),weight=n(document.getElementById('mfRecordWeight').value),reps=n(document.getElementById('mfRecordReps').value),sets=Math.max(1,n(document.getElementById('mfRecordSets').value)||1),rir=n(document.getElementById('mfRecordRir').value);if(!weight||!reps){window.toast?.('Enter weight and reps');return;}const e1=oneRM(weight,reps);t.records.push({id:`rec_${Date.now()}`,exercise,date,weight,reps,sets,rir,e1rm:e1});window.save?.();renderHistory();document.getElementById('mfRecordSummary').innerHTML=`<b>${escV(exercise)}</b><span>${weight} kg × ${reps} · ${sets} sets · estimated 1RM ${e1m(e1)} kg</span>`;window.toast?.('Exercise record saved');}
  function e1m(v){return v?Number(v).toFixed(1):'—';}
  function renderHistory(){const t=ensureTraining(),sel=document.getElementById('mfHistoryExercise')?.value||exercises[0][0],arr=t.records.filter(r=>r.exercise===sel).sort((a,b)=>String(a.date).localeCompare(String(b.date)));const box=document.getElementById('mfExerciseHistory');if(!box)return;if(!arr.length){box.innerHTML='<div class="muted">No records yet. Save your first working set above.</div>';return;}const best=Math.max(...arr.map(r=>n(r.e1rm)));box.innerHTML=`<div class="mf-history-head"><span>Date</span><span>Load</span><span>Reps</span><span>Sets</span><span>Est. 1RM</span></div>`+arr.slice().reverse().map(r=>`<div class="mf-history-row"><span>${r.date}</span><span>${r.weight} kg</span><span>${r.reps}</span><span>${r.sets}</span><span>${e1m(r.e1rm)}${n(r.e1rm)>=best?' ★':''}</span></div>`).join('');}
  function installTrainingNav(){
    const nav=document.querySelector('nav');
    if(!document.getElementById('trainingLab')){
      const main=document.querySelector('main.main');
      const settings=document.getElementById('settings');
      if(main&&settings){const sec=document.createElement('section');sec.className='page';sec.id='trainingLab';main.insertBefore(sec,settings);}
    }
    if(nav&&!document.querySelector('[data-page="trainingLab"]')){
      const b=document.createElement('button');
      b.className='nav-item';
      b.type='button';
      b.dataset.page='trainingLab';
      b.innerHTML='🏋 <span>Training Lab</span>';
      nav.insertBefore(b,nav.querySelector('[data-page="settings"]'));
      b.onclick=(ev)=>{
        ev.preventDefault();
        ev.stopPropagation();
        document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='trainingLab'));
        document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x===b));
        const title=document.getElementById('pageTitle');if(title)title.textContent='Training Lab';
        renderTrainingLab();
        window.scrollTo({top:0,behavior:'smooth'});
      };
    }
    // app.js binds nav buttons before this file creates Training Lab. Re-assert the
    // Training Lab handler so navigation always renders the form instead of an empty page.
    const trainNav=document.querySelector('[data-page="trainingLab"]');
    if(trainNav){
      trainNav.onclick=(ev)=>{
        ev.preventDefault();ev.stopPropagation();
        document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='trainingLab'));
        document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x===trainNav));
        const title=document.getElementById('pageTitle');if(title)title.textContent='Training Lab';
        renderTrainingLab();
        window.scrollTo({top:0,behavior:'smooth'});
      };
    }
  }

  /* ---------------------------------------------------------
     6) DYNAMIC SCIENCE FACTS — conservative, source-linked.
     --------------------------------------------------------- */
  const facts=[
    ['Protein target','For most exercising adults, ISSN describes 1.4–2.0 g/kg/day as sufficient; MacroForge may use 2.2 g/kg as a deliberately high planning target rather than claiming everyone needs exactly that amount.','https://pubmed.ncbi.nlm.nih.gov/28642676/'],
    ['Resistance training','The 2026 ACSM overview synthesised 137 systematic reviews and found progressive resistance training improves strength, size and physical performance; higher weekly volume was associated with hypertrophy.','https://pubmed.ncbi.nlm.nih.gov/41843416/'],
    ['Progression','Older ACSM guidance recommends a modest load increase when a trainee can exceed the prescribed repetition target with the current load. MacroForge therefore treats controlled rep progress as a trigger for load progression.','https://pubmed.ncbi.nlm.nih.gov/19204579/'],
    ['Protein distribution','ISSN guidance suggests spreading protein doses across the day rather than concentrating the whole daily target in one meal.','https://pubmed.ncbi.nlm.nih.gov/28642676/'],
    ['Pre/post workout','Protein intake before or after resistance exercise can support muscle protein synthesis, but the overall daily intake matters more than obsessing over a tiny post-workout clock window.','https://pubmed.ncbi.nlm.nih.gov/28642676/'],
    ['Creatine loading','A common creatine monohydrate loading protocol is about 0.3 g/kg/day for 5–7 days, followed by about 3–5 g/day. Loading is optional.','https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8'],
    ['Hydration','Fluid needs depend on sweat losses, exercise duration and environmental conditions. A fixed number is a planning target, not a universal physiological requirement.','https://pubmed.ncbi.nlm.nih.gov/17277604/']
  ];
  function renderScienceEnhancement(){
    const card=document.getElementById('scienceDynamicFact');if(!card)return;const s=st();const day=new Date().getDate(), meals=(s?.foodLog||[]).filter(x=>x.date===todayKey()).length, idx=(day+meals)%facts.length,f=facts[idx];card.innerHTML=`<span class="pill">EVIDENCE NOTE</span><h3>${escV(f[0])}</h3><p>${escV(f[1])}</p><a href="${f[2]}" target="_blank" rel="noopener">Open primary reference ↗</a><small>Science notes are educational, not medical advice.</small>`;
  }

  function injectStyles(){
    if(document.getElementById('mfV16Styles'))return;const s=document.createElement('style');s.id='mfV16Styles';s.textContent=`
      .mf-v16-warning{margin:12px 0;padding:13px 16px;border:1px solid #705b27;background:#251f0e;color:#f3df9c;border-radius:14px;display:flex;gap:12px;align-items:flex-start;font-size:12px}.mf-v16-warning b{white-space:nowrap}.mf-v16-warning span{color:#d9c98e;line-height:1.5}
      .mf-training-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px}.mf-generated-workout{margin-top:16px}.mf-plan-row{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid #1b3027}.mf-plan-row small{display:block;color:#71897f;margin-top:3px}.mf-plan-row strong{white-space:nowrap}.mf-plan-row>span{color:#9eb1a8;font-size:11px}.mf-record-summary{margin-top:14px;padding:12px;border-radius:12px;background:#07100d;border:1px solid #1c332a}.mf-record-summary span{display:block;color:#91a59d;margin-top:4px}.mf-history-table{margin-top:16px}.mf-history-head,.mf-history-row{display:grid;grid-template-columns:1.2fr 1fr .7fr .7fr 1fr;gap:10px;padding:10px;border-bottom:1px solid #1b3027;font-size:12px}.mf-history-head{color:#789187;font-weight:700}.mf-history-row span:last-child{font-weight:800}.mf-v16-search-card{min-width:0}.science-card a{display:inline-block;margin-top:8px;color:#d9ff64;font-size:11px}.mf-training-grid+.panel{margin-top:0}
      @media(max-width:850px){.mf-training-grid{grid-template-columns:1fr}.mf-history-head,.mf-history-row{grid-template-columns:1fr 1fr 1fr}.mf-history-head span:nth-child(4),.mf-history-head span:nth-child(5),.mf-history-row span:nth-child(4),.mf-history-row span:nth-child(5){display:none}}
    `;document.head.appendChild(s);
  }

  function refresh(){
    // IMPORTANT: do not rebuild the Training Lab DOM during background refreshes.
    // Reassigning page.innerHTML destroys focused inputs/selects and makes the
    // controls appear to disappear a moment after the user clicks them.
    // The Lab is rendered when the user opens it and after an explicit save.
    overGoalWarning();
    renderScienceEnhancement();
  }
  function install(){
    injectStyles();installSearch();installTrainingNav();
    // Re-run after the base app has finished its dynamic hooks.
    setTimeout(()=>{installSearch();installTrainingNav();refresh();},300);
    setTimeout(()=>{installSearch();installTrainingNav();},1000);
    document.addEventListener('click',e=>{const b=e.target.closest?.('[data-page="trainingLab"]');if(b){setTimeout(renderTrainingLab,80);}},true);
    setInterval(()=>{if(document.visibilityState!=='hidden')refresh();},1200);
  }
  window.MacroForgeV16={refresh,renderTrainingLab,search:globalV16};
  document.addEventListener('DOMContentLoaded',install,{once:true});
})();
