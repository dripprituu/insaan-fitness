'use strict';
const K='insaan_v1',$=s=>document.querySelector(s);
const dk=(d=new Date())=>new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TASKS=[['10:00','Wake + Water','habit'],['10:10','Brush + Washroom','habit'],['10:20','Morning Skincare','skin'],['10:40','Pre-workout Meal','meal'],['11:15','Home Workout','workout'],['12:15','Post-workout Meal','meal'],['13:30','Bath','habit'],['14:00','Lunch','meal'],['15:30','Rest / Personal Work','personal'],['17:00','High-energy Snack','meal'],['19:30','Dinner','meal'],['21:30','Bedtime Snack','meal'],['22:00','Night Skincare','skin'],['22:15','Relax / Chat','habit'],['23:00','Sleep','sleep']].map((x,i)=>({id:'t'+i,t:x[0],n:x[1],c:x[2]}));
const THEMES={yellow:'#ffd43b',green:'#51cf66',blue:'#4dabf7',pink:'#f783ac',forest:'#2f9e44',ocean:'#1c7ed6',midnight:'#9775fa'};
const EX={Chest:['Push-ups','Incline push-ups','Diamond push-ups'],Triceps:['Chair dips','Close-grip push-ups'],Back:['Superman','Towel rows','Reverse snow angels'],Biceps:['Towel curls','Backpack curls'],Legs:['Squats','Lunges','Glute bridges','Wall sit'],Abs:['Crunches','Plank','Leg raises'],Shoulders:['Pike push-ups','Arm circles','Backpack press'],'Full Body':['Squats','Push-ups','Plank','Mountain climbers','Glute bridges']};
const SCHED=[['Complete Rest',[]],['Chest + Triceps',['Chest','Triceps']],['Back + Biceps',['Back','Biceps']],['Legs + Abs',['Legs','Abs']],['Rest / Light Walking',[]],['Shoulders + Chest',['Shoulders','Chest']],['Full Body',['Full Body']]];
const SKIN={am:['Cleanser','HOCl','Vitamin C serum','Moisturizer','Sunscreen','Lip balm'],pm:['Cleanser','HOCl','Barrier cream','Optional eye product','Lip balm']};
const QUOTES=['Consistency beats intensity.','Small steps, done daily, add up.','Rest is part of training.','Strong body, steady mind.','Energy comes from healthy habits.'];
const LIB=['Chicken breast','Eggs','Paneer','Dal','Greek yogurt / curd','Chana','Soya chunks','Milk','Fish','Peanuts'];
let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}
S=Object.assign({p:null,theme:'yellow',dark:false,tasks:TASKS,days:{},xp:0,hist:[],last:{},notes:[],rem:[],goals:[],ntf:{all:true,lead:0},fz:0,fzd:{},pr:{},sl:{},sp:0,own:0,bk:0,fired:{},snz:{},rh:[]},S||{});
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){toast('Storage full or blocked')}};
const day=(d=dk())=>S.days[d]||(S.days[d]={st:{},water:0,sk:{},nt:{},food:[]});
const pct=d=>{const x=S.days[d];if(!x||!S.tasks.length)return 0;return Object.values(x.st).filter(v=>v==='done').length/S.tasks.length};
const streak=()=>{let n=0;for(let i=0;i<400;i++){const d=dk(new Date(Date.now()-i*864e5));if(pct(d)>=.5||S.fzd[d])n++;else if(i>0)break}return n};
const lvl=()=>Math.floor(S.xp/100)+1;
const col=p=>p>=.8?'var(--g)':p>=.5?'var(--b)':p>=.2?'var(--y)':'var(--r)';
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2500)}
function notify(m,id){toast(m);S.rh.push({t:new Date().toLocaleString(),m});S.rh=S.rh.slice(-50);save();
 if(!('Notification' in window)||Notification.permission!=='granted')return;
 const o={body:m,tag:id||m,data:{id},actions:id?[{action:'done',title:'Complete'},{action:'snooze',title:'Snooze 10m'}]:[]};
 const f=()=>{try{new Notification('INSAAN FITNESS',{body:m})}catch(e){}};
 if(navigator.serviceWorker)navigator.serviceWorker.ready.then(r=>r.showNotification('INSAAN FITNESS',o)).catch(f);else f()}
function snz(id){S.snz[id]=Date.now()+6e5;save();toast('Snoozed 10 minutes')}
function apply(){document.documentElement.toggleAttribute('data-dark',S.dark);document.documentElement.style.setProperty('--ac',THEMES[S.theme]||THEMES.yellow)}
const VIEWS={home:'Home',today:'Today',workout:'Workout',nutrition:'Nutrition',habits:'Habits',recovery:'Recovery',progress:'Progress',calendar:'Calendar',goals:'Goals',awards:'Awards',reminders:'Reminders',search:'Search',settings:'Settings'};
let view='home';
function go(v){view=v;render();$('#main').focus();scrollTo(0,0)}
function setTask(id,v){const d=day();d.st[id]=d.st[id]===v?undefined:v;if(d.st[id]==='done'){S.xp+=10}if(!d.st[id])delete d.st[id];save();render()}
const nowStr=()=>new Date().toTimeString().slice(0,5);
function plan(){const d=day(),p=S.tasks.filter(t=>!d.st[t.id]),c=nowStr();let now=[...p].reverse().find(t=>t.t<=c)||p[0];const next=p.find(t=>t!==now&&t.t>c);return{now,next,later:p.filter(t=>t!==now&&t!==next&&t.t>c)}}
const bar=p=>`<div class="bar" role="progressbar" aria-valuenow="${Math.round(p*100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100,p*100)}%"></i></div>`;
function taskHtml(t,hl){const d=day(),s=d.st[t.id];return`<div class="task ${s||''} ${hl?'now':''}"><b>${t.t}</b> — ${esc(t.n)} ${s?'<span class="tag">'+s+'</span>':''}${d.nt[t.id]?'<br><small>📝 '+esc(d.nt[t.id])+'</small>':''}<div class="row"><button class="btn g" data-a="done" data-id="${t.id}">Complete</button><button class="btn w" data-a="skip" data-id="${t.id}">Skip</button><button class="btn b" data-a="snooze" data-id="${t.id}">Snooze 10m</button><button class="btn w" data-a="rm" data-id="${t.id}">${t.rm?'🔔 On':'🔔 Remind'}</button><button class="btn w" data-a="note" data-id="${t.id}">Note</button></div></div>`}
function render(){
 apply();$('#nav').innerHTML=Object.entries(VIEWS).map(([k,v])=>`<button data-go="${k}" ${k===view?'aria-current="page"':''}>${v}</button>`).join('');
 const d=day(),w=SCHED[new Date().getDay()],h=new Date().getHours(),P=pct(dk()),m=S.tasks.filter(t=>t.c==='meal'),md=m.filter(t=>d.st[t.id]==='done').length;
 let o='';
 if(!S.p){o=`<div class="card"><h1 class="big">INSAAN FITNESS</h1><h2>Build consistency. Build yourself.</h2><p>No account needed. Your data stays on this device.</p>
 <label>Name<input id="on" autocomplete="name"></label><label>Primary goal<select id="og"><option>Build strength</option><option>More energy</option><option>Consistent routine</option><option>Better recovery</option></select></label>
 <label>Preferred workout (min)<select id="od"><option>10</option><option>20</option><option selected>30</option><option>45</option><option>60</option></select></label>
 <label>Theme<select id="ot">${Object.keys(THEMES).map(t=>`<option>${t}</option>`).join('')}</select></label><button class="btn" data-a="onboard">Start</button></div>`}
 else if(view==='home'){const q=plan();o=`<div class="card"><span class="tag">${new Date().toLocaleDateString(undefined,{day:'2-digit',month:'short',weekday:'short'})}</span><h1>INSAAN FITNESS</h1><p>${h<12?'Good morning':h<17?'Good afternoon':'Good evening'}, ${esc(S.p.name)}.</p>
 <div class="big">${Math.round(P*100)}%</div><b>COMPLETE</b>${bar(P)}<p><span class="tag">🔥 ${streak()} day streak</span><span class="tag">LVL ${lvl()} — ${S.xp} XP</span><span class="tag">${w[0]}</span></p><p><i>${QUOTES[new Date().getDate()%QUOTES.length]}</i></p></div>
 <div class="grid"><div class="card"><h3>Now</h3>${q.now?taskHtml(q.now,1):'<p>All tasks handled. 🎉</p>'}<h3>Next</h3>${q.next?taskHtml(q.next):'<p>Nothing else scheduled.</p>'}<h3>Later</h3>${q.later.map(t=>`<div>${t.t} ${esc(t.n)}</div>`).join('')||'—'}</div>
 <div class="card"><h3>Workout</h3><p>${w[0]} — ${d.st.t4==='done'?'✅ Done':'Pending'}</p><button class="btn" data-go="workout">Open workout</button><h3 style="margin-top:16px">Water</h3><p>${d.water} / 2500 ml</p>${bar(d.water/2500)}<button class="btn b" data-a="water" data-n="250">+250 ml</button>
 <h3 style="margin-top:16px">Meals</h3><p>${md} / ${m.length}</p>${bar(md/m.length)}</div></div>
 <div class="card"><h3>Challenge of the day</h3><p>${['Complete planned workout','Hit your water goal','Complete morning routine','Complete cooldown stretch','Finish all scheduled tasks'][new Date().getDay()%5]}</p></div>`}
 else if(view==='today'){o=`<div class="card"><h2>Today's Timeline</h2>${S.tasks.map(t=>taskHtml(t,plan().now===t)).join('')}</div>${vRoutine()}<div class="card"><h3>Notes</h3>${S.notes.map(n=>`<p>📝 ${esc(n)}</p>`).join('')||'<p>No notes yet.</p>'}<h3>Reminders</h3>${S.rem.map(r=>`<p>⏰ ${esc(r.t)} — ${esc(r.n)}</p>`).join('')||'<p>None.</p>'}</div>`}
 else if(view==='workout'){const list=planFor(w[1]);o=`<div class="card"><h2>${w[0]}</h2>${list.length?list.map(e=>`<div class="chk"><b>${esc(e.n)}</b> ${e.s}×${e.r}</div>`).join('')+'<button class="btn" data-a="start">Start Focus Mode</button>':'<p>Rest day. Light walking or stretching is great for recovery.</p>'}</div>
 <div class="card"><h3>Workout generator</h3><div class="row">${[10,20,30,45,60].map(n=>`<button class="btn b" data-a="gen" data-n="${n}">${n} min</button>`).join('')}</div></div>
 <div class="card"><h3>History</h3>${S.hist.slice(-8).reverse().map(x=>`<p>${x.d} — ${x.n} exercises, ${Math.round(x.s/60)} min</p>`).join('')||'<p>No workouts logged yet.</p>'}</div>
 <div class="card"><h3>Warm-up (5 min)</h3><p>Arm circles, leg swings, bodyweight squats, light jumping jacks. Keep it easy.</p><h3>Cooldown</h3><p>Walk 2 minutes, then stretch worked muscles 30s each.</p></div><div class="card"><h3>Exercise library</h3><input id="exq" placeholder="Search exercises" aria-label="Search exercises"><div id="exl"></div></div>`}
 else if(view==='nutrition'){o=`<div class="grid"><div class="card"><h2>Meals</h2>${m.map(t=>`<label class="chk"><input type="checkbox" data-a="done" data-id="${t.id}" ${d.st[t.id]==='done'?'checked':''}>${t.t} ${esc(t.n)}</label>`).join('')}<p>Eat enough, eat balanced. No extreme dieting.</p></div>
 <div class="card"><h2>Water</h2><p>${d.water} / 2500 ml</p>${bar(d.water/2500)}<div class="row"><button class="btn b" data-a="water" data-n="250">+250</button><button class="btn w" data-a="water" data-n="custom">Custom</button></div></div></div>
 <div class="card"><h3>Food diary</h3><div class="row"><input id="fd" placeholder="What did you eat?" aria-label="Food entry" style="flex:1"><button class="btn" data-a="food">Add</button></div>${d.food.map(f=>`<p>🍽️ ${esc(f)}</p>`).join('')}<h3>Protein-rich foods</h3><p>${LIB.map(f=>`<span class="tag">${f}</span>`).join('')}</p></div>
 <div class="grid">${['am','pm'].map(k=>`<div class="card"><h3>${k==='am'?'Morning':'Night'} skincare</h3>${SKIN[k].map(s=>`<label class="chk"><input type="checkbox" data-a="skin" data-k="${k}-${s}" ${d.sk[k+'-'+s]?'checked':''}>${s}</label>`).join('')}</div>`).join('')}</div>`}
 else if(view==='habits'){const days=[...Array(35)].map((_,i)=>dk(new Date(Date.now()-(34-i)*864e5)));const wk=days.slice(-7);
 o=`<div class="card"><h2>Today</h2>${[['Workout',d.st.t4==='done'],['Water',d.water>=2000],['Meals',md>=m.length/2],['Skincare',S.tasks.filter(t=>t.c==='skin').every(t=>d.st[t.id]==='done')],['Personal work',d.st.t8==='done'],['Sleep routine',d.st.t14==='done']].map(x=>`<p>${x[1]?'✅':'⬜'} ${x[0]}</p>`).join('')}</div>
 <div class="card"><h3>Weekly consistency: ${Math.round(wk.reduce((a,x)=>a+pct(x),0)/7*100)}%</h3>${bar(wk.reduce((a,x)=>a+pct(x),0)/7)}</div>
 <div class="card"><h3>Heatmap (35 days)</h3><div class="heat">${days.map(x=>`<div title="${x}" style="background:${S.days[x]?col(pct(x)):''}">${+x.slice(8)}</div>`).join('')}</div><p><span class="tag" style="background:var(--g)">80%+</span><span class="tag" style="background:var(--b)">50%+</span><span class="tag">20%+</span><span class="tag" style="background:var(--r)">missed</span></p></div>`}

 else if(view==='calendar')o=vCal();else if(view==='progress')o=vProg();else if(view==='awards')o=vAwards();else if(view==='goals')o=vGoals();else if(view==='recovery')o=vRec();else if(view==='search')o=`<div class="card"><h2>Search</h2><input id="gs" placeholder="Search exercises, meals, tasks, notes, goals, settings" aria-label="Search"><div id="gsr"></div></div>`;
 else if(view==='reminders'){const pm='Notification' in window?Notification.permission:'unsupported';
 o=`<div class="card"><h2>Reminders</h2><p>Notification status: <span class="tag">${pm}</span></p><div class="row"><button class="btn" data-a="perm">Enable notifications</button><button class="btn b" data-a="rtest">Test</button></div></div>
 <div class="card"><h3>Task reminders</h3><div class="row"><button class="btn ${S.ntf.all?'g':'w'}" data-a="rall">All tasks: ${S.ntf.all?'ON':'OFF'}</button><button class="btn w" data-a="rlead">Remind ${S.ntf.lead} min before</button></div><p>Turn on 🔔 for single tasks in Today. Notification buttons: Complete / Snooze 10m.</p></div>
 <div class="card"><h3>Custom reminders</h3>${S.rem.map((r,i)=>`<p>⏰ ${esc(r.t)} — ${esc(r.n)} (${r.rep?'daily':'once'}) <button class="btn r" data-a="rdel" data-id="${i}">Delete</button></p>`).join('')||'<p>None yet.</p>'}<button class="btn" data-a="q-reminder">+ Add reminder</button></div>
 <div class="card"><h3>History</h3>${S.rh.slice(-15).reverse().map(x=>`<p>${esc(x.t)} — ${esc(x.m)}</p>`).join('')||'<p>No reminders yet.</p>'}</div>
 <div class="card"><p>Limit: reminders fire while the app is open or running in the background. A static site cannot guarantee alarms when the browser is fully closed.</p></div>`}
 else if(view==='settings'){o=`<div class="card"><h2>Settings</h2><label>Theme<select id="st">${Object.keys(THEMES).map(t=>`<option ${t===S.theme?'selected':''}>${t}</option>`).join('')}</select></label><label class="chk"><input type="checkbox" id="sd" ${S.dark?'checked':''}>Dark mode</label>
 <div class="row"><button class="btn" data-a="perm">Enable notifications</button><button class="btn b" data-a="export">Export JSON</button><label class="btn g">Import JSON<input type="file" id="imp" accept=".json" hidden></label><button class="btn r" data-a="clear">Clear data</button></div></div>
 <div class="card"><h3>Privacy & limits</h3><p>All data stays in this browser (localStorage). Nothing is sent to a server. Export a backup regularly.</p><p>Reminders only fire while the app is open or running in the background. A static site cannot guarantee alarms when the browser is fully closed.</p></div>`}
 $('#main').innerHTML=o;$('#fab').hidden=!S.p;
 const gs=$('#gs');if(gs){gs.oninput=()=>gsearch(gs.value);gs.focus()}
 const q=$('#exq');if(q){const f=()=>{const t=q.value.toLowerCase();$('#exl').innerHTML=Object.entries(EX).flatMap(([g,l])=>l.filter(e=>(e+g).toLowerCase().includes(t)).map(e=>`<p><b>${e}</b> — ${g}. Slow, controlled reps; stop if you feel pain.</p>`)).join('')};q.oninput=f;f()}
 const st=$('#st');if(st)st.onchange=()=>{if(['forest','ocean','midnight'].includes(st.value)&&!S.own){toast('Unlock these themes in Awards > XP shop');st.value=S.theme;return}S.theme=st.value;save();apply()};const sd=$('#sd');if(sd)sd.onchange=()=>{S.dark=sd.checked;save();apply()};
 const im=$('#imp');if(im)im.onchange=()=>{const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result);if(typeof j!=='object'||!j.tasks)throw 0;S=Object.assign(S,j);save();toast('Imported');render()}catch(e){toast('Invalid file')}};r.readAsText(im.files[0])}}
function planFor(groups,min){let l=groups.flatMap(g=>EX[g]);if(min){const pool=Object.values(EX).flat();l=[...new Set(pool)].sort(()=>Math.random()-.5).slice(0,Math.max(2,Math.round(min/6)))}return l.map(n=>({n,s:3,r:/Plank|Wall/.test(n)?'30s':12}))}
let F=null;
function startFocus(list){F={l:list,i:0,s:1,rest:0,p:0,el:0};$('#focus').hidden=false;clearInterval(F.h);F.h=setInterval(()=>{if(F.p)return;F.el++;if(F.rest>0)F.rest--;drawF()},1000);drawF()}
function drawF(){if(!F)return;const e=F.l[F.i],nx=F.l[F.i+1];$('#focus').innerHTML=`<h3>Exercise ${F.i+1}/${F.l.length}</h3><div class="big">${esc(e.n)}</div><div class="big">SET ${F.s}/${e.s}</div><h2>${e.r} ${typeof e.r==='number'?'reps':''}</h2><p>Previous: ${esc(S.last[e.n]||'—')}</p><h2>${F.rest>0?'REST '+F.rest+'s':'GO'}</h2><p>Next: ${nx?esc(nx.n):'Finish!'}</p><p>⏱ ${Math.floor(F.el/60)}:${String(F.el%60).padStart(2,'0')}</p>
 <div class="row"><button class="btn g" data-a="setdone">SET DONE</button><button class="btn" data-a="fpause">${F.p?'RESUME':'PAUSE'}</button><button class="btn w" data-a="fskip">SKIP</button><button class="btn r" data-a="ffinish">FINISH</button></div>`}
function endFocus(log){clearInterval(F.h);if(log){S.hist.push({d:dk(),n:F.i+1,s:F.el});S.xp+=50;day().st.t4='done';toast('Workout logged +50 XP')}F=null;$('#focus').hidden=true;save();render()}
function modal(h){const m=$('#modal');m.innerHTML=`<div class="card" role="dialog" aria-modal="true">${h}<button class="btn w" data-a="close">Close</button></div>`;m.hidden=false;const f=m.querySelector('button,input');f&&f.focus()}
document.addEventListener('click',e=>{
 if(e.target.id==='fab')return modal(`<h2>Quick add</h2><div class="row">${[['workout','+ Workout'],['water','+ Water'],['meal','+ Meal'],['habit','+ Habit'],['note','+ Note'],['reminder','+ Reminder']].map(x=>`<button class="btn" data-a="q-${x[0]}">${x[1]}</button>`).join('')}</div>`);
 const g=e.target.closest('[data-go]');if(g){$('#modal').hidden=true;return go(g.dataset.go)}
 const b=e.target.closest('[data-a]');if(!b||b.type==='checkbox')return;const a=b.dataset.a,id=b.dataset.id;
 const A={close:()=>$('#modal').hidden=true,done:()=>setTask(id,'done'),skip:()=>setTask(id,'skip'),
 snooze:()=>snz(id),
 note:()=>{const n=prompt('Note for this task');if(n){day().nt[id]=n;save();render()}},
 onboard:()=>{S.p={name:$('#on').value.trim()||'Friend',goal:$('#og').value,dur:+$('#od').value};S.theme=$('#ot').value;save();render()},
 water:()=>{let n=b.dataset.n;if(n==='custom')n=parseInt(prompt('Amount in ml','200'));if(n>0&&n<=2000){day().water+=+n;save();render()}},
 food:()=>{const v=$('#fd').value.trim();if(v){day().food.push(v);save();render()}},
 skin:()=>{const d=day(),k=b.dataset.k;d.sk[k]=!d.sk[k];save()},
 start:()=>startFocus(planFor(SCHED[new Date().getDay()][1])),gen:()=>startFocus(planFor([],+b.dataset.n)),
 setdone:()=>{const x=F.l[F.i];S.last[x.n]=x.s+'×'+x.r;if(F.s<x.s){F.s++;F.rest=45}else if(F.i<F.l.length-1){F.i++;F.s=1;F.rest=60}else return endFocus(1);drawF()},
 fpause:()=>{F.p=!F.p;drawF()},fskip:()=>{if(F.i<F.l.length-1){F.i++;F.s=1;F.rest=0;drawF()}else endFocus(1)},ffinish:()=>endFocus(F.el>30),
 perm:()=>{if(!('Notification' in window))return toast('Notifications not supported');Notification.requestPermission().then(r=>toast('Notifications: '+r))},
 export:()=>{S.bk=Date.now();save();const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:'application/json'}));l.download='insaan-fitness-backup.json';l.click()},
 clear:()=>{if(confirm('Delete all local data?')){localStorage.removeItem(K);location.reload()}},
 cprev:()=>{calO--;render()},cnext:()=>{calO++;render()},prr:()=>{pr=+id;render()},
 cday:()=>{const x=S.days[id],nm=v=>S.tasks.filter(t=>x.st[t.id]===v).map(t=>esc(t.n)).join(', ')||'—';modal(`<h2>${id}</h2>${x?`<p>${Math.round(pct(id)*100)}% complete</p><p>Workout: ${x.st.t4==='done'?'✅ done':'—'}</p><p>Water: ${x.water} ml</p><p>Done: ${nm('done')}</p><p>Skipped: ${nm('skip')}</p>`:'<p>No data for this day.</p>'}`)},
 prsave:()=>{const k=$('#prk').value,v=+$('#prv').value;if(v>0){if(v>(S.pr[k]||0)){S.pr[k]=v;S.xp+=20;toast('New record! +20 XP')}else toast('Saved — not above your record yet');save();render()}},
 gadd:()=>{const n=$('#gn').value.trim();if(!n)return toast('Enter a goal name');S.goals.push({n,c:$('#gc').value,t:Math.max(1,+$('#gt').value||1),p:0,s:dk(),e:$('#ge').value});save();render()},
 gp:()=>{const g=S.goals[+id];if(g.p<g.t){g.p++;if(g.p===g.t){S.xp+=100;toast('Goal complete! +100 XP')}save();render()}},gd:()=>{S.goals.splice(+id,1);save();render()},
 slsave:()=>{S.sl[dk()]={b:$('#sb').value,w:$('#sw').value,e:+$('#se').value};save();toast('Saved');render()},
 buyfz:()=>{if(S.xp-S.sp>=100){S.sp+=100;S.fz++;save();render()}else toast('Need 100 XP')},
 buyth:()=>{if(S.xp-S.sp>=150){S.sp+=150;S.own=1;save();render()}else toast('Need 150 XP')},
 usefz:()=>{const y=dk(new Date(Date.now()-864e5));if(S.fz>0&&pct(y)<.5&&!S.fzd[y]){S.fz--;S.fzd[y]=1;save();render();toast('Freeze used')}else toast('No freeze needed or none left')},
 redit:()=>{const t=S.tasks[+id],n=prompt('Task name',t.n);if(!n)return;const tm=prompt('Time (HH:MM)',t.t);if(!/^\d\d:\d\d$/.test(tm||''))return toast('Use HH:MM');t.n=n.trim();t.t=tm;save();render()},
 radd:()=>{const n=prompt('New task name');if(!n)return;const tm=prompt('Time (HH:MM)','12:00');if(!/^\d\d:\d\d$/.test(tm||''))return toast('Use HH:MM');S.tasks.push({id:'c'+Date.now(),t:tm,n:n.trim(),c:'habit'});S.tasks.sort((a,b)=>a.t<b.t?-1:1);save();render()},
 rrem:()=>{const t=S.tasks[+id];if(t.id==='t4')return toast('Workout task is needed for tracking');if(confirm('Delete '+t.n+'?')){S.tasks.splice(+id,1);save();render()}},
 rup:()=>{const i=+id;if(i>0){[S.tasks[i-1],S.tasks[i]]=[S.tasks[i],S.tasks[i-1]];save();render()}},
 rdn:()=>{const i=+id;if(i<S.tasks.length-1){[S.tasks[i+1],S.tasks[i]]=[S.tasks[i],S.tasks[i+1]];save();render()}},
 rm:()=>{const t=S.tasks.find(x=>x.id===id);t.rm=!t.rm;save();render();toast(t.rm?'Reminder ON':'Reminder OFF')},
 rall:()=>{S.ntf.all=!S.ntf.all;save();render()},rlead:()=>{S.ntf.lead=S.ntf.lead>=10?0:S.ntf.lead+5;save();render()},
 rdel:()=>{S.rem.splice(+id,1);save();render()},
 rtest:()=>{if(!('Notification' in window)||Notification.permission!=='granted')toast('First tap Enable notifications');notify('Test reminder works!','test')},
 'q-workout':()=>go('workout'),'q-meal':()=>go('nutrition'),'q-habit':()=>go('habits'),
 'q-water':()=>{day().water+=250;save();render();toast('+250 ml')},
 'q-note':()=>{const n=prompt('Note');if(n){S.notes.push(n);save();go('today')}},
 'q-reminder':()=>{const t=prompt('Time (HH:MM, 24h)','18:00'),n=t&&prompt('Reminder text');if(n&&/^\d\d:\d\d$/.test(t)){S.rem.push({t,n,rep:confirm('Repeat daily? OK = daily, Cancel = only once')});save();go('reminders');toast('Reminder set')}}};
 if(A[a]){A[a]();if(a.startsWith('q-')||a==='start'||a==='gen')$('#modal').hidden=true}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.a==='skin'){const d=day();d.sk[t.dataset.k]=t.checked;save()}else if(t.dataset&&t.dataset.a==='done')setTask(t.dataset.id,'done')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#modal').hidden=true});
function tick(){const now=new Date(),c=now.toTimeString().slice(0,5),d=dk(),dd=S.days[d]||{st:{}};
 const lead=new Date(now.getTime()+S.ntf.lead*6e4).toTimeString().slice(0,5);
 Object.keys(S.fired).forEach(k=>{if(!k.startsWith(d))delete S.fired[k]});
 S.tasks.forEach(t=>{if(!(S.ntf.all||t.rm)||dd.st[t.id])return;const k=d+t.id;if(t.t===lead&&!S.fired[k]){S.fired[k]=1;notify(t.n+(S.ntf.lead?' in '+S.ntf.lead+' min':' — now'),t.id)}});
 Object.entries(S.snz).forEach(([id,ts])=>{if(Date.now()>=ts){delete S.snz[id];const t=S.tasks.find(x=>x.id===id);if(t&&!dd.st[id])notify('Snoozed: '+t.n,id);else save()}});
 S.rem=S.rem.filter(r=>{if(r.t===c&&r.last!==d){r.last=d;notify(r.n);return !!r.rep}return true})}
setInterval(tick,2e4);document.addEventListener('visibilitychange',tick);tick();
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',e=>{const m=e.data||{};if(!m.id)return;if(m.a==='done'){if(day().st[m.id]!=='done')setTask(m.id,'done')}else if(m.a==='snooze')snz(m.id)});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
let calO=0,pr=7;
const BADGES=[['FIRST WORKOUT',()=>S.hist.length>=1],['10 WORKOUTS',()=>S.hist.length>=10],['7 DAY STREAK',()=>bestStreak()>=7],['HYDRATION HERO',()=>Object.values(S.days).filter(x=>x.water>=2000).length>=7],['CONSISTENCY MASTER',()=>bestStreak()>=30]];
const TITLES=['Beginner','Starter','Mover','Fighter','Warrior','Beast'];
function bestStreak(){let b=0,n=0,prev=null;Object.keys(S.days).sort().forEach(k=>{const ok=pct(k)>=.5||S.fzd[k];if(ok&&prev&&new Date(k)-new Date(prev)===864e5)n++;else n=ok?1:0;prev=ok?k:null;b=Math.max(b,n)});return b}
function vCal(){const n=new Date();n.setDate(1);n.setMonth(n.getMonth()+calO);const y=n.getFullYear(),m=n.getMonth(),dim=new Date(y,m+1,0).getDate();let c='';
 for(let i=0;i<n.getDay();i++)c+='<div></div>';
 for(let i=1;i<=dim;i++){const d=dk(new Date(y,m,i)),h=S.days[d];c+=`<button class="cell" data-a="cday" data-id="${d}" style="${h?'background:'+col(pct(d))+';color:#000':''}">${i}${h&&h.st.t4==='done'?'🏋️':''}</button>`}
 return `<div class="card"><div class="row"><button class="btn" data-a="cprev" aria-label="Previous month">◀</button><h2>${n.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</h2><button class="btn" data-a="cnext" aria-label="Next month">▶</button></div><div class="heat" style="margin-top:12px">${c}</div><p>Tap a day for details. Green 80%+, blue 50%+, yellow 20%+, red below 20%.</p></div>`}
function vProg(){const days=[...Array(pr)].map((_,i)=>dk(new Date(Date.now()-(pr-1-i)*864e5))),cnt=(x,v)=>Object.values((S.days[x]||{st:{}}).st).filter(s=>s===v).length;
 const avg=days.reduce((a,x)=>a+pct(x),0)/pr,wo=S.hist.filter(h=>days.includes(h.d)).length,wat=days.filter(x=>S.days[x]&&S.days[x].water>=2000).length,dn=days.reduce((a,x)=>a+cnt(x,'done'),0),sk=days.reduce((a,x)=>a+cnt(x,'skip'),0);
 return `<div class="card"><h2>Progress</h2><div class="row">${[7,30,90].map(n=>`<button class="btn ${n===pr?'':'w'}" data-a="prr" data-id="${n}">${n} days</button>`).join('')}</div><div style="display:flex;align-items:flex-end;gap:2px;height:140px;border-bottom:4px solid var(--ink);margin-top:14px">${days.map(x=>`<div title="${x}" style="flex:1;height:${Math.max(3,pct(x)*100)}%;background:${col(pct(x))};border:1px solid var(--ink)"></div>`).join('')}</div></div>
 <div class="card"><h3>Report — last ${pr} days</h3><p>Routine: ${Math.round(avg*100)}%</p><p>Workouts: ${wo}</p><p>Water goal days: ${wat}</p><p>Completed tasks: ${dn} · Skipped: ${sk}</p><p>Best streak: ${bestStreak()}</p><p>Next goal: ${wo<3?'Aim for 3 workouts this week':'Keep your rhythm and protect a rest day'}</p></div>
 <div class="card"><h3>Personal records</h3>${['Push-ups','Squats','Plank (sec)'].map(k=>`<p><b>${k}:</b> ${S.pr[k]||'—'}</p>`).join('')}<p><b>Longest workout:</b> ${S.hist.length?Math.round(Math.max(...S.hist.map(h=>h.s))/60)+' min':'—'}</p><div class="row"><select id="prk" aria-label="Record type" style="width:auto"><option>Push-ups</option><option>Squats</option><option>Plank (sec)</option></select><input id="prv" type="number" min="1" aria-label="Value" style="width:100px"><button class="btn" data-a="prsave">Save</button></div></div>`}
function vAwards(){const bal=S.xp-S.sp,L=lvl(),d=day(),wk=S.hist.filter(h=>h.d>=dk(new Date(Date.now()-6*864e5))).length,M=[['Complete your workout',d.st.t4==='done'],['Drink 2000 ml water',d.water>=2000],['Finish 80% of tasks',pct(dk())>=.8]];
 return `<div class="card"><h2>Level ${L} — ${TITLES[Math.min(5,Math.floor(L/3))]}</h2><p>${S.xp} XP earned · ${bal} XP to spend</p>${bar((S.xp%100)/100)}<p><span class="tag">🔥 ${streak()} streak</span><span class="tag">Best ${bestStreak()}</span><span class="tag">❄️ ${S.fz} freeze</span></p></div>
 <div class="grid"><div class="card"><h3>Daily missions</h3>${M.map(m=>`<p>${m[1]?'✅':'⬜'} ${m[0]}</p>`).join('')}<h3>Weekly mission</h3><p>${wk>=3?'✅':'⬜'} 3 workouts (${wk}/3)</p></div><div class="card"><h3>Badges</h3>${BADGES.map(b=>`<span class="tag" style="${b[1]()?'':'opacity:.4;background:var(--card);color:var(--ink)'}">${b[0]}</span>`).join('')}</div></div>
 <div class="card"><h3>XP shop (virtual rewards)</h3><div class="row"><button class="btn b" data-a="buyfz">Streak freeze — 100 XP</button><button class="btn" data-a="buyth" ${S.own?'disabled':''}>${S.own?'Themes unlocked ✓':'Unlock Forest / Ocean / Midnight — 150 XP'}</button><button class="btn w" data-a="usefz">Use freeze on yesterday</button></div></div>`}
function vGoals(){return `<div class="card"><h2>Goals</h2>${S.goals.map((g,i)=>`<div class="task"><b>${esc(g.n)}</b> <span class="tag">${g.c}</span><br>${g.p}/${g.t} · ${g.s} → ${g.e||'no date'}${bar(g.p/g.t)}<div class="row"><button class="btn g" data-a="gp" data-id="${i}">+1</button><button class="btn r" data-a="gd" data-id="${i}">Delete</button></div></div>`).join('')||'<p>No goals yet.</p>'}</div>
 <div class="card"><h3>New goal</h3><label>Name<input id="gn"></label><label>Category<select id="gc">${['Workout','Habit','Water','Sleep','Nutrition','Personal'].map(c=>`<option>${c}</option>`).join('')}</select></label><label>Target (number)<input id="gt" type="number" min="1" value="10"></label><label>Target date<input id="ge" type="date"></label><button class="btn" data-a="gadd">Add goal</button></div>`}
function vRec(){const s=S.sl[dk()]||{},rest=!SCHED[new Date().getDay()][1].length,m=x=>+x.slice(0,2)*60+ +x.slice(3),h=s.b&&s.w?(((m(s.w)-m(s.b))+1440)%1440)/60:0,rec=!s.e?'Log sleep to see recovery':h>=7&&s.e>=3?'Recovered — good to go':'Take it easy today';
 return `<div class="card"><h2>Sleep & recovery</h2><p><span class="tag" style="background:${rest?'var(--b)':'var(--g)'}">${rest?'Rest day':'Training day'}</span><span class="tag">${rec}</span></p><label>Bedtime<input id="sb" type="time" value="${s.b||'23:00'}"></label><label>Wake time<input id="sw" type="time" value="${s.w||'07:00'}"></label><label>Energy (1 low – 5 high)<select id="se">${[1,2,3,4,5].map(n=>`<option ${n===(s.e||3)?'selected':''}>${n}</option>`).join('')}</select></label><button class="btn" data-a="slsave">Save</button><p>Sleep: ${h?h.toFixed(1)+' h':'—'}</p></div>
 <div class="card"><h3>Stretching / cooldown (5 min)</h3>${['Neck rolls — 30s','Shoulder stretch — 30s each side','Hamstring stretch — 30s each side','Hip flexor stretch — 30s each side','Deep breathing — 1 min'].map(x=>`<p>• ${x}</p>`).join('')}</div>`}
function vRoutine(){return `<div class="card"><h3>Edit routine</h3>${S.tasks.map((t,i)=>`<div class="chk"><span style="flex:1">${t.t} ${esc(t.n)}</span><button class="btn w" data-a="rup" data-id="${i}" aria-label="Move up">↑</button><button class="btn w" data-a="rdn" data-id="${i}" aria-label="Move down">↓</button><button class="btn b" data-a="redit" data-id="${i}" aria-label="Edit">✎</button><button class="btn r" data-a="rrem" data-id="${i}" aria-label="Delete">✕</button></div>`).join('')}<button class="btn g" data-a="radd">+ Add task</button></div>`}
function gsearch(t){t=t.toLowerCase().trim();const r=[];if(t){Object.entries(EX).forEach(([g,l])=>l.forEach(e=>(e+g).toLowerCase().includes(t)&&r.push(['workout','Exercise',e+' — '+g])));
 S.tasks.forEach(x=>x.n.toLowerCase().includes(t)&&r.push(['today','Task',x.t+' '+x.n]));S.notes.forEach(n=>n.toLowerCase().includes(t)&&r.push(['today','Note',n]));
 S.goals.forEach(g=>g.n.toLowerCase().includes(t)&&r.push(['goals','Goal',g.n]));Object.values(S.days).forEach(d=>d.food.forEach(f=>f.toLowerCase().includes(t)&&r.push(['nutrition','Meal',f])));
 LIB.forEach(f=>f.toLowerCase().includes(t)&&r.push(['nutrition','Food',f]));['theme','dark mode','export','import','privacy','notifications','clear data'].forEach(x=>x.includes(t)&&r.push(['settings','Setting',x]))}
 $('#gsr').innerHTML=r.slice(0,40).map(x=>`<p><button class="btn w" data-go="${x[0]}">${x[1]}</button> ${esc(x[2])}</p>`).join('')||(t?'<p>No results.</p>':'')}
if(!S.bk){S.bk=Date.now();save()}else if(Date.now()-S.bk>6048e5)setTimeout(()=>toast('Backup reminder: export your data in Settings'),1500);

render();
