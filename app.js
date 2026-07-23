// The Water Promise — game logic + physics-based water pour
const COST_PER_CUP=1/4400, CUP_PER_DAY=60;
let cups=0, community=75161969, bestWpm=0, streak=0, runs=0, curMode='type';
const $=id=>document.getElementById(id);

// ---------- ads ----------
const ADS=[['Daybreak Coffee','Roasted for slow mornings'],['Nimbus Running','Shoes for every route'],['Terra Outfitters','Carry more, weigh less'],['Kindred Bank','Banking that gives back'],['Lumen Electric','Drive the sunrise'],['Otter & Oak','Bottles built to last'],['Meridian Air','Fly kinder'],['Verdant Grocers','Good food, close to home']];
function rotateAd(){const a=ADS[Math.floor(Math.random()*ADS.length)];const ad=$('ad');if(!ad)return;ad.classList.remove('flash');void ad.offsetWidth;ad.classList.add('flash');$('adHead').textContent=a[0];$('adSub').textContent=a[1];}

// ---------- physics water pour (canvas) ----------
const cv=$('waterfx'); const cx=cv?cv.getContext('2d'):null;
let drops=[], splash=[], raf=null;
const G=0.62; // gravity per frame^2
function fit(){ if(!cv)return; cv.width=innerWidth; cv.height=innerHeight; }
if(cv){ fit(); addEventListener('resize',fit); }
function emitPour(){
  if(!cv) return;
  const ad=$('ad'), fill=$('fill'); if(!ad||!fill) return;
  const a=ad.getBoundingClientRect(), b=fill.getBoundingClientRect();
  const tX=b.left+b.width/2, tY=b.top+3;              // aim at the water surface
  const n=16;
  for(let i=0;i<n;i++){
    const sx=a.left+a.width*(0.42+Math.random()*0.16); // stream from banner center
    const sy=a.bottom-4;
    const flight=46+Math.random()*10;                  // frames to target
    const vx=(tX-sx)/flight;                            // solve horizontal to land near bucket
    const vy=(tY-sy - 0.5*G*flight*flight)/flight;      // solve vertical arc under gravity
    drops.push({x:sx,y:sy,vx,vy,r:2.2+Math.random()*2.2,tY});
  }
  if(!raf) loop();
}
function loop(){
  cx.clearRect(0,0,cv.width,cv.height);
  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i]; d.vy+=G; d.x+=d.vx; d.y+=d.vy;
    const stretch=Math.min(2.6,1+Math.abs(d.vy)/9);
    cx.save();cx.translate(d.x,d.y);cx.rotate(Math.atan2(d.vy,d.vx)-Math.PI/2);cx.scale(1,stretch);
    cx.beginPath();cx.arc(0,0,d.r,0,Math.PI*2);cx.fillStyle='rgba(63,167,214,.92)';cx.fill();
    cx.beginPath();cx.arc(-d.r*0.3,-d.r*0.3,d.r*0.35,0,Math.PI*2);cx.fillStyle='rgba(255,255,255,.55)';cx.fill();
    cx.restore();
    if(d.y>=d.tY && Math.abs(d.x-d.tX)<46){
      for(let s=0;s<6;s++)splash.push({x:d.x,y:d.tY,vx:(Math.random()*3.4-1.7),vy:-(1.4+Math.random()*3),r:1.3+Math.random()*1.6,life:0});
      drops.splice(i,1);
    } else if(d.y>cv.height+30){ drops.splice(i,1); }
  }
  for(let i=splash.length-1;i>=0;i--){
    const s=splash[i]; s.vy+=G*0.8; s.x+=s.vx; s.y+=s.vy; s.life++;
    cx.beginPath();cx.arc(s.x,s.y,s.r,0,Math.PI*2);cx.fillStyle='rgba(63,167,214,'+Math.max(0,.85-s.life/26)+')';cx.fill();
    if(s.life>26)splash.splice(i,1);
  }
  if(drops.length||splash.length) raf=requestAnimationFrame(loop); else { raf=null; cx.clearRect(0,0,cv.width,cv.height); }
}

// ---------- cups / bucket ----------
function awardCup(){
  cups+=1; community+=1; runs++;
  if($('hudCups'))$('hudCups').textContent=cups;
  if($('railCups'))$('railCups').textContent=cups;
  if($('hudDon'))$('hudDon').textContent='$'+(cups*COST_PER_CUP).toFixed(2);
  if($('community'))$('community').textContent=community.toLocaleString();
  const filled=cups%CUP_PER_DAY, pct=Math.min(100,(filled/CUP_PER_DAY)*100);
  if($('fill'))$('fill').style.height=pct+'%';
  if($('mileBar'))$('mileBar').style.width=pct+'%';
  if($('mileTxt'))$('mileTxt').textContent=filled+' / '+CUP_PER_DAY+' cups — one person’s water for a day';
  if($('peopleDays'))$('peopleDays').textContent=Math.floor(cups/CUP_PER_DAY);
  rotateAd(); tipBanner();
  requestAnimationFrame(()=>emitPour());  // pour after fill target updates
}

// ---------- adaptive typing ----------
const COMMON=['the','and','you','that','was','for','are','with','his','they','this','have','from','one','had','word','but','not','what','all','were','when','your','can','said','there','use','each','which','she','how','their','will','other','about','out','many','then','them','these','some','her','would','make','like','into','time','look','two','more','write','see','number','way','could','people','than','first','water','been','call','who','now','find','long','down','day','did','get','come','made','may','part'];
let weak={}, target='', typed='', startT=0, errs=0, keys=0, active=false, level=1, targetWpm=28;
function weakKeys(){ return Object.entries(weak).map(([c,o])=>[c,o.n?o.err/o.n:0]).filter(x=>x[1]>0.06).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]); }
function focusWord(k){ const f='aeiourtns'; let w=''; for(let i=0;i<4;i++)w+=(i===1||i===3)?k:f[Math.floor(Math.random()*f.length)]; return w; }
function buildLine(){
  const wk=weakKeys(); let pool=[...COMMON]; if(level>=2)pool=pool.filter(w=>w.length>=4).concat(COMMON);
  let words=[]; for(let i=0;i<9;i++){ if(wk.length&&Math.random()<0.4)words.push(focusWord(wk[Math.floor(Math.random()*wk.length)])); else words.push(pool[Math.floor(Math.random()*pool.length)]); }
  if(level>=3)words=words.map((w,i)=>i%3===0?w.charAt(0).toUpperCase()+w.slice(1):w);
  let line=words.join(' '); if(level>=4)line=line.replace(/ ([a-z])/,', $1')+'.'; if(level>=5)line=line+' '+Math.floor(Math.random()*900+100);
  return line;
}
function renderTarget(){ let h=''; for(let i=0;i<target.length;i++){let c='ch';if(i<typed.length)c+=typed[i]===target[i]?' ok':' no';else if(i===typed.length)c+=' cur';h+='<span class="'+c+'">'+(target[i]===' '?'&nbsp;':target[i])+'</span>';} $('target').innerHTML=h; }
function showFocus(){ const wk=weakKeys(); $('focusChips').innerHTML=wk.length?'<span class="chip">focus keys</span>'+wk.map(k=>'<span class="chip k">'+k+'</span>').join(''):'<span class="chip">building your profile…</span>'; }
function newLine(){ target=buildLine();typed='';errs=0;keys=0;startT=0;active=true;renderTarget();showFocus();$('hidden').value='';$('hidden').focus();$('debrief').style.display='none';$('levelLabel').textContent='level '+level;$('targetWpm').textContent=targetWpm;$('typeHint').textContent='Go — type the line above.'; }
function pctl(w){const z=(w-40)/15;return Math.max(1,Math.min(99,Math.round(100/(1+Math.exp(-1.7*z)))));}
function initType(){
  $('hidden').addEventListener('input',e=>{
    if(!active||curMode!=='type')return; const v=e.target.value;
    if(startT===0&&v.length>0)startT=performance.now();
    if(v.length>typed.length){keys++;const i=v.length-1,exp=target[i];if(!weak[exp])weak[exp]={err:0,n:0};if(exp&&exp!==' ')weak[exp].n++;if(v[i]!==exp){errs++;if(exp&&exp!==' ')weak[exp].err++;}}
    typed=v.slice(0,target.length);renderTarget();
    if(startT){const m=(performance.now()-startT)/60000;$('mWpm').textContent=Math.round((typed.length/5)/m);$('mAcc').textContent=Math.round((keys?(keys-errs)/keys:1)*100)+'%';}
    if(typed===target)finish();
  });
  $('startBtn').onclick=newLine; $('target').onclick=()=>{if(active)$('hidden').focus();};
}
function finish(){
  active=false; const m=(performance.now()-startT)/60000;
  const wpm=Math.round((target.length/5)/m), acc=keys?Math.round(((keys-errs)/keys)*100):100;
  $('mWpm').textContent=wpm;$('mAcc').textContent=acc+'%'; if(wpm>bestWpm){bestWpm=wpm;$('mBest').textContent=bestWpm;}
  $('mPct').textContent=pctl(wpm)+'th'; streak++; $('mStreak').textContent=streak;
  let msg; if(acc>=97){if(level<5){level++;msg='Crisp — leveling up the difficulty.';}else{targetWpm=Math.round(targetWpm*1.05);msg='Nailed it — nudging your target speed up.';}}
  else if(acc<90){targetWpm=Math.max(20,Math.round(targetWpm*0.9));msg='Let’s lock in accuracy — easing the pace.';}
  else{targetWpm=Math.round(targetWpm*1.04);msg='Right in the sweet spot.';}
  const wk=weakKeys(); awardCup();
  $('debrief').style.display='block';
  $('debrief').innerHTML='<b>'+wpm+' WPM</b> · '+acc+'% accurate · '+pctl(wpm)+'th percentile. '+msg+(wk.length?' &nbsp;Watch: <b>'+wk.join(' ')+'</b> — drilling those next.':'')+' &nbsp;<b>+1 cup.</b>';
  $('typeHint').textContent='Press Enter or Start for another run.';
}

// ---------- 60s face-off ----------
let rActive=false,rWords=0,rLeft=60,rTimer=null,rTarget='',rTyped='';
const RACE=COMMON.concat(['river','clean','share','drink','carry','trail','learn','swift','giver','reach','flows','basin','rains','wells']);
function raceLine(){let a=[];for(let i=0;i<12;i++)a.push(RACE[Math.floor(Math.random()*RACE.length)]);return a.join(' ');}
function drawRace(){let h='';for(let i=0;i<rTarget.length;i++){let c='ch';if(i<rTyped.length)c+=rTyped[i]===rTarget[i]?' ok':' no';else if(i===rTyped.length)c+=' cur';h+='<span class="'+c+'">'+(rTarget[i]===' '?'&nbsp;':rTarget[i])+'</span>';}$('raceTarget').innerHTML=h;}
function initRace(){
  $('raceBtn').onclick=()=>{rActive=true;rWords=0;rLeft=60;rTyped='';rTarget=raceLine();drawRace();$('raceHidden').value='';$('raceHidden').focus();$('rWords').textContent=0;$('rCups').textContent=0;$('rWpm').textContent=0;$('shareBtn').style.display='none';clearInterval(rTimer);rTimer=setInterval(()=>{rLeft--;$('rTime').textContent=rLeft;if(rLeft<=0)endRace();},1000);$('raceHint').textContent='Go!';};
  $('raceHidden').addEventListener('input',e=>{
    if(!rActive||curMode!=='race')return; const v=e.target.value; rTyped=v.slice(0,rTarget.length); drawRace();
    if(rTyped===rTarget){const n=rTarget.split(' ').length;rWords+=n;for(let i=0;i<n;i++)awardCup();$('rWords').textContent=rWords;$('rCups').textContent=rWords;const el=(60-rLeft)||1;$('rWpm').textContent=Math.round(rWords/(el/60));rTarget=raceLine();rTyped='';$('raceHidden').value='';drawRace();}
  });
}
function endRace(){rActive=false;clearInterval(rTimer);const wpm=Math.round(rWords);$('rWpm').textContent=wpm;$('raceHint').textContent='Time! '+rWords+' words · '+wpm+' WPM · funded '+rWords+' cups.';const b=$('shareBtn');b.style.display='inline-block';b.onclick=()=>{const u=location.origin+location.pathname+'?challenge='+wpm;if(navigator.clipboard)navigator.clipboard.writeText(u);b.textContent='Link copied — send it!';setTimeout(()=>b.textContent='Challenge a friend',2500);};}

// ---------- word puzzle ----------
const DICT={water:'the clear liquid that sustains all life',river:'a large natural stream of flowing water',clean:'free from dirt or contamination',share:'to give a portion to others',drink:'to swallow liquid',reach:'to arrive at or stretch toward',carry:'to hold and move along',trail:'a path through rough country',learn:'to gain knowledge or skill',swift:'moving with great speed',giver:'one who gives generously',wells:'deep holes dug to reach groundwater',basin:'a bowl-shaped hollow that holds water',flows:'moves steadily and continuously',pumps:'devices that move water upward',drops:'small rounded portions of liquid'};
const WORDS=Object.keys(DICT).filter(w=>w.length===5);
let ans='',gs=[],cw='',wdone=false;
function newWord(){ans=WORDS[Math.floor(Math.random()*WORDS.length)];gs=[];cw='';wdone=false;$('def').style.display='none';drawGrid();drawKb();$('wordHint').textContent='Type or tap. 5 letters, 6 tries.';}
function drawGrid(){let h='';for(let r=0;r<6;r++){h+='<div class="wrow">';const g=gs[r];for(let c=0;c<5;c++){let cl='wc',ch='';if(g){ch=g.w[c];cl+=' '+g.m[c];}else if(r===gs.length)ch=cw[c]||'';h+='<div class="'+cl+'">'+(ch||'')+'</div>';}h+='</div>';}$('wgrid').innerHTML=h;}
function mark(w){const m=Array(5).fill('b'),p={};for(const c of ans)p[c]=(p[c]||0)+1;for(let i=0;i<5;i++)if(w[i]===ans[i]){m[i]='g';p[w[i]]--;}for(let i=0;i<5;i++)if(m[i]!=='g'&&p[w[i]]>0){m[i]='y';p[w[i]]--;}return m;}
function sub(){if(cw.length<5||wdone)return;const m=mark(cw);gs.push({w:cw,m});const won=cw===ans;cw='';drawGrid();drawKb();
  if(won){wdone=true;awardCup();$('def').style.display='block';$('def').innerHTML='<b>'+ans+'</b> — '+DICT[ans]+'. &nbsp;<b>+1 cup.</b>';$('wordHint').textContent='Solved! New word shortly…';setTimeout(newWord,2200);}
  else if(gs.length>=6){wdone=true;$('def').style.display='block';$('def').innerHTML='It was <b>'+ans+'</b> — '+DICT[ans]+'.';$('wordHint').textContent='New word shortly…';setTimeout(newWord,2400);}}
function kIn(k){if(wdone)return;if(k==='enter')sub();else if(k==='back'){cw=cw.slice(0,-1);drawGrid();}else if(/^[a-z]$/.test(k)&&cw.length<5){cw+=k;drawGrid();}}
function drawKb(){const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];let h='';rows.forEach((row,idx)=>{h+='<div class="krow">';if(idx===2)h+='<button class="key wide" data-k="enter">ENTER</button>';for(const ch of row){let best='';for(const g of gs)for(let i=0;i<5;i++)if(g.w[i]===ch){if(g.m[i]==='g')best='g';else if(g.m[i]==='y'&&best!=='g')best='y';else if(!best)best='b';}h+='<button class="key '+best+'" data-k="'+ch+'">'+ch+'</button>';}if(idx===2)h+='<button class="key wide" data-k="back">DEL</button>';h+='</div>';});$('kb').innerHTML=h;$('kb').querySelectorAll('.key').forEach(b=>b.onclick=()=>kIn(b.dataset.k));}

// ---------- wiring ----------
function initPlay(){
  if(!$('target'))return;   // only on play page
  initType(); initRace();
  document.addEventListener('keydown',e=>{
    if(curMode==='type'){if(e.key==='Enter'&&!active)newLine();}
    else if(curMode==='word'){if(e.key==='Enter')kIn('enter');else if(e.key==='Backspace')kIn('back');else if(/^[a-zA-Z]$/.test(e.key))kIn(e.key.toLowerCase());}
  });
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));t.classList.add('on');curMode=t.dataset.mode;
    $('typeCard').style.display=curMode==='type'?'block':'none';
    $('raceCard').style.display=curMode==='race'?'block':'none';
    $('wordCard').style.display=curMode==='word'?'block':'none';
    if(curMode==='word'&&!ans)newWord();
  });
  const c=new URLSearchParams(location.search).get('challenge'); if(c&&$('raceChallenge'))$('raceChallenge').innerHTML='<span class="chip">a friend hit '+parseInt(c)+' WPM — beat it</span>';
  wireSave();
  newLine();
}
document.addEventListener('DOMContentLoaded',initPlay);
// ---- tip-and-pour: banner literally tips over ----
function tipBanner(){const ad=$('ad');if(!ad)return;ad.classList.add('tip');setTimeout(()=>ad.classList.remove('tip'),700);}
// ---- Supabase live leaderboard ----
const SB_URL='https://kyqoqwqamambrgtkcoeu.supabase.co', SB_KEY='sb_publishable_6dZCsMCymIGrbhvmbYAZ6w_Y9uxsoKa';
let sb=null; function initSB(){if(!sb&&window.supabase)sb=window.supabase.createClient(SB_URL,SB_KEY);return sb;}
async function saveScore(){
  const el=$('lbName'); if(!el)return; const username=(el.value||'').trim().slice(0,20);
  if(username.length<1){$('saveMsg').textContent='Enter a name first.';return;}
  const c=initSB(); if(!c){$('saveMsg').textContent='Leaderboard offline.';return;}
  $('saveMsg').textContent='Saving…';
  const {error}=await c.from('wp_scores').upsert({username,best_wpm:bestWpm,cups,streak},{onConflict:'username'});
  $('saveMsg').textContent=error?('Could not save: '+error.message):('Saved — you’re on the board with '+bestWpm+' WPM and '+cups+' cups.');
}
function wireSave(){const b=$('saveBtn'); if(b)b.onclick=saveScore;}
// ---- real accounts (Supabase Auth) ----
let session=null;
async function initAuth(){const c=initSB(); if(!c)return; try{const {data}=await c.auth.getSession(); session=data.session||null; onAuth(); c.auth.onAuthStateChange((_e,s)=>{session=s;onAuth();});}catch(e){}}
function onAuth(){const signed=!!session; if($('authBox'))$('authBox').style.display=signed?'none':'block'; if($('acctBox'))$('acctBox').style.display=signed?'block':'none'; if(signed&&$('acctEmail'))$('acctEmail').textContent=session.user.email; if(signed&&$('lbName')&&!$('lbName').value)$('lbName').value=(session.user.email||'').split('@')[0].slice(0,20);}
async function doSignup(){const c=initSB();const e=($('authEmail').value||'').trim(),p=$('authPw').value||''; if(!e||p.length<6){$('authMsg').textContent='Enter an email and a 6+ character password.';return;} $('authMsg').textContent='Creating account...'; const {error}=await c.auth.signUp({email:e,password:p}); $('authMsg').textContent=error?('Error: '+error.message):'Account created. If prompted, confirm via the email we sent, then log in.';}
async function doLogin(){const c=initSB();const e=($('authEmail').value||'').trim(),p=$('authPw').value||''; $('authMsg').textContent='Signing in...'; const {error}=await c.auth.signInWithPassword({email:e,password:p}); if(error)$('authMsg').textContent='Error: '+error.message;}
async function doLogout(){const c=initSB(); if(c)await c.auth.signOut();}
async function saveScore(){const c=initSB(); if(!c){$('saveMsg').textContent='Offline.';return;} if(!session){$('saveMsg').textContent='Sign in above to save your run.';return;} const el=$('lbName'); let username=((el&&el.value)||session.user.email.split('@')[0]).trim().slice(0,20); if(!username){$('saveMsg').textContent='Pick a name first.';return;} $('saveMsg').textContent='Saving...'; const {error}=await c.from('wp_scores').upsert({user_id:session.user.id,username,best_wpm:bestWpm,cups,streak},{onConflict:'user_id'}); $('saveMsg').textContent=error?('Could not save: '+error.message):('Saved - '+username+' is on the board with '+bestWpm+' WPM.');}
function wireSave(){initAuth(); const s=$('saveBtn'); if(s)s.onclick=saveScore; const su=$('signupBtn'); if(su)su.onclick=doSignup; const li=$('loginBtn'); if(li)li.onclick=doLogin; const lo=$('logoutBtn'); if(lo)lo.onclick=doLogout;}
