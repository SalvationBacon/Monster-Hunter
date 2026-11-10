// Headless test: node tools/check.js   (needs Playwright)
// Bots play whole hunts on a fake clock, then real touch input is checked.
const {chromium}=require('playwright'); const path=require('path');
const shots=process.argv[2]; // optional folder for screenshots
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:390,height:780},hasTouch:true,isMobile:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(200);
  let fail=0;const ok=(c,msg)=>{console.log((c?'ok   ':'FAIL ')+msg);if(!c)fail++;};
  if(shots)await p.screenshot({path:shots+'/title.png'});

  // skill: chance to dodge each incoming hit. heavy: uses charged attacks in openings
  const bot=(skill,counters)=>p.evaluate(({skill,counters})=>{
    MH.manual=true;MH.newHunt();const S=MH.S;let t=0,decided=-1,will=false,holdUntil=0,qdec=null;
    const tgt=part=>{S.h.state==='idle'&&MH.actTap(part);};
    while(S.mode==='hunt'&&t<600){
      const m=S.m,h=S.h;
      if(m.state==='attack'&&m.hi<m.hits.length){
        const key=m.hits[m.hi]+m.hi*100+t*0; const d=m.hits[m.hi]-m.t;
        if(decided!==m.hi+':'+m.atk+':'+m.hits[0]){decided=m.hi+':'+m.atk+':'+m.hits[0];will=Math.random()<skill;}
        if(will&&d<.15&&d>0&&h.state!=='dodge'&&h.state!=='counter')MH.actDodge(-1);
      }
      if(S.qte&&S.qte.t>.35&&qdec!==S.qte){qdec=S.qte;if(Math.random()<skill){const pp=MH.partPos(S.qte.part,MH.mPose());MH.qteTap(pp.x,pp.y);}}
      if(counters&&h.counter>0&&h.state!=='counter'){MH.actCounter();}
      if(h.hp<50&&h.potions>0&&h.state==='idle'&&m.state!=='attack')MH.actPotion();
      else if(h.state==='idle'){
        MH.actTap('head');
      }
      MH.update(1/60);t+=1/60;
    }
    return{mode:S.mode,time:150-S.timeLeft,hp:S.h.hp,mhp:S.m.hp,stats:S.stats,potions:S.h.potions,breaks:['head','wings','tail'].filter(k=>S.m.parts[k].broken),loot:S.loot&&S.loot.drops,fail:S.fail};
  },{skill,counters});

  for(const [name,skill] of [['skilled',.95],['average',.7],['casual',.45],['never dodges',0]]){
    const runs=[];for(let i=0;i<6;i++)runs.push(await bot(skill,skill>.5));
    const wins=runs.filter(r=>r.mode==='loot'),avg=a=>a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):0;
    console.log(`     ${name}: ${wins.length}/6 wins, avg win time ${avg(wins.map(r=>r.time))}s, avg damage taken ${avg(runs.map(r=>r.stats.taken))}, potions left ${avg(runs.map(r=>r.potions))}, counters ${avg(runs.map(r=>r.stats.counters))}, stuns ${avg(runs.map(r=>r.stats.stuns))}, monster dodges ${avg(runs.map(r=>r.stats.evaded))}, weak points hit ${avg(runs.map(r=>r.stats.qteHit))} missed ${avg(runs.map(r=>r.stats.qteMiss))}, parts broken ${(runs.reduce((s,r)=>s+r.breaks.length,0)/6).toFixed(1)}`);
    if(name==='skilled'){ok(wins.length===6,'a skilled bot always wins');const t=avg(wins.map(r=>r.time));ok(t>35&&t<60,'skilled hunt takes about a minute ('+t+'s)');
      ok(wins.every(r=>r.breaks.length>=1),'a skilled bot breaks at least one part');ok(wins.every(r=>r.stats.counters>0&&r.stats.stuns>0),'perfect dodges allow counters, and counters stun the monster');ok(wins.every(r=>r.stats.evaded>0),'the monster dodges some hits');ok(wins.every(r=>r.breaks.every(k=>r.loot.some(d=>d.id==={head:'horn',wings:'wing',tail:'spike'}[k]))),'broken parts drop their loot');}
    if(name==='never dodges')ok(wins.length<=1,'never dodging loses the hunt');
  }
  // time limit
  const tu=await p.evaluate(()=>{MH.manual=true;MH.newHunt();const S=MH.S;S.h.hp=1e9;let t=0;while(S.mode==='hunt'&&t<400){MH.update(1/30);t+=1/30;}return S.fail;});
  ok(tu==='TIME UP','the hunt ends when time runs out');

  // screenshots of the fight at interesting moments
  const until=(cond,max=40)=>p.evaluate(({c,max})=>{const f=new Function('S','MH','return '+c);const S=MH.S;let t=0;while(!f(S,MH)&&t<max){if(S.h.state==='idle'&&S.m.state!=='attack')MH.actTap('head');MH.update(1/60);t+=1/60;}return t<max;},{c:cond,max});
  await p.evaluate(()=>{MH.manual=true;MH.newHunt();MH.S.h.hp=1e6;});
  if(shots){
    await until("S.m.state==='attack'&&S.m.hits[0]-S.m.t<.3");await p.waitForTimeout(60);await p.screenshot({path:shots+'/telegraph.png'});
    await until("S.fx.length>0&&S.m.state!=='attack'");await p.waitForTimeout(60);await p.screenshot({path:shots+'/hit.png'});
    await p.evaluate(()=>{MH.S.m.hp=2300;});await until("S.m.state==='roar'&&S.m.t>.3");await p.waitForTimeout(60);await p.screenshot({path:shots+'/roar.png'});
    await until("S.m.state==='attack'&&S.m.atk==='fire'&&S.m.t>S.m.hits[0]+.2",120);await p.waitForTimeout(60);await p.screenshot({path:shots+'/fire.png'});
    await until("S.qte&&S.qte.t>.3",120);await p.waitForTimeout(60);await p.screenshot({path:shots+'/qte.png'});
    await until("S.m.state==='stagger'&&S.m.t>.3",120);await p.waitForTimeout(60);await p.screenshot({path:shots+'/stagger.png'});
    await p.evaluate(()=>{MH.S.m.hp=1100;MH.S.h.hp=60;});
    await until("S.m.state==='attack'&&S.m.atk==='dive'&&S.m.t>S.m.hits[0]-.5",200);await p.waitForTimeout(60);await p.screenshot({path:shots+'/dive.png'});
    await p.evaluate(()=>{MH.S.m.hp=10;});await until("S.mode==='loot'",60);await p.evaluate(()=>{MH.S.t=5;});await p.waitForTimeout(60);await p.screenshot({path:shots+'/loot.png'});
  }

  const ev=await p.evaluate(()=>{MH.manual=true;MH.newHunt();const S=MH.S,m=S.m;m.evadeCd=0;m.wait=10;for(let i=0;i<5;i++)MH.update(1/60);return 1;});
  await p.waitForTimeout(80);if(shots)await p.screenshot({path:shots+'/wary.png'});
  const ev2=await p.evaluate(()=>{const S=MH.S;MH.actTap('head');for(let i=0;i<10;i++)MH.update(1/60);const a={st:S.m.state,d:S.stats.dealt};for(let i=0;i<80;i++)MH.update(1/60);MH.actTap('head');for(let i=0;i<20;i++)MH.update(1/60);a.d2=S.stats.dealt;return a;});
  if(shots){await p.waitForTimeout(80);}
  ok(ev2.st==='evade'&&ev2.d===0,'a wary monster dodges the next hit');ok(ev2.d2>0,'and can be hit again straight after');
  // real touch input on a live clock
  await p.reload();await p.waitForTimeout(200);
  await p.touchscreen.tap(195,400);await p.waitForTimeout(100);
  ok(await p.evaluate(()=>MH.S.mode==='hunt'),'a tap on the title starts the hunt');
  const head=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect(),pp=MH.partPos('head',MH.mPose());return{x:r.left+pp.x/128*r.width,y:r.top+pp.y/MH.LH*r.height,r:{l:r.left,t:r.top,w:r.width,h:r.height}};});
  await p.evaluate(()=>{MH.S.m.evadeCd=9;});
  await p.touchscreen.tap(head.x,head.y);await p.waitForTimeout(250);
  ok(await p.evaluate(()=>MH.S.stats.dealt>0&&MH.S.m.stun>0),'a tap on the head damages the head');
  const cdp=await p.context().newCDPSession(p);
  const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  await p.waitForTimeout(500);
  await touch('touchStart',200,500);await touch('touchMove',150,500);await touch('touchMove',110,502);await p.waitForTimeout(50);
  ok(await p.evaluate(()=>MH.S.h.state==='dodge'),'a swipe dodges');await touch('touchEnd');
  await p.waitForTimeout(700);
  await p.evaluate(()=>{const m=MH.S.m;m.state='idle';m.wait=10;m.evadeCd=99;MH.S.h.state='idle';MH.S.h.inv=0;}); // keep the monster quiet for the hold
  const before=await p.evaluate(()=>MH.S.stats.dealt);
  await touch('touchStart',200,500);await p.waitForTimeout(1500);
  ok(await p.evaluate(()=>MH.S.h.state==='charge'&&MH.S.h.lvl>=1),'a held press charges');
  await touch('touchEnd');await p.waitForTimeout(400);
  const hv=await p.evaluate(()=>MH.S.stats.dealt);
  ok(hv-before>=40,'releasing lands a heavy hit ('+(hv-before)+')');
  // weak point with a real tap
  const qp=await p.evaluate(()=>{const S=MH.S,m=S.m;MH.manual=true;m.state='idle';m.wait=10;m.evadeCd=99;S.qte={part:'tail',t:0};
    const r=document.getElementById('c').getBoundingClientRect(),pp=MH.partPos('tail',MH.mPose());return{x:r.left+pp.x/128*r.width,y:r.top+pp.y/MH.LH*r.height};});
  await p.touchscreen.tap(qp.x,qp.y);
  ok(await p.evaluate(()=>MH.S.m.parts.tail.hits===1&&!MH.S.qte),'a tap on a red circle counts as a weak-point hit');
  ok(await p.evaluate(()=>{const S=MH.S;for(let k=0;k<2;k++){S.qte={part:'tail',t:0};const pp=MH.partPos('tail',MH.mPose());MH.qteTap(pp.x,pp.y);}return S.m.parts.tail.broken&&S.m.state==='stagger';}),'three hits break the part');
  ok(await p.evaluate(()=>{const S=MH.S;S.qte={part:'head',t:0};for(let i=0;i<60;i++)MH.update(1/60);const r=!S.qte&&S.m.parts.head.hits===0;MH.manual=false;S.m.state='idle';S.m.wait=10;return r;}),'an untouched circle times out');
  await p.evaluate(()=>{MH.S.h.hp=40;MH.S.h.state='idle';});
  await touch('touchStart',200,500);await touch('touchMove',202,460);await touch('touchMove',203,420);await touch('touchEnd');await p.waitForTimeout(900);
  ok(await p.evaluate(()=>MH.S.h.potions===1||MH.S.h.state==='hurt'),'a swipe up drinks a potion');
  const cb=await p.evaluate(()=>{const S=MH.S,m=S.m;m.state='idle';m.wait=10;m.evadeCd=99;S.h.state='idle';S.h.inv=0;S.h.counter=1.4;S.slow=0;MH.manual=true;
    const r=document.getElementById('c').getBoundingClientRect(),c=MH.L.counter;return{x:r.left+(c.x+c.w/2)/128*r.width,y:r.top+(c.y+c.h/2)/MH.LH*r.height,d:S.stats.dealt};});
  await p.waitForTimeout(80);if(shots)await p.screenshot({path:shots+'/counter.png'});
  await p.touchscreen.tap(cb.x,cb.y);
  ok(await p.evaluate(()=>MH.S.h.state==='counter'),'a tap on the COUNTER button starts a counter');
  await p.evaluate(()=>{for(let i=0;i<40;i++)MH.update(1/60);MH.manual=false;});
  ok(await p.evaluate(d=>MH.S.stats.dealt-d>=100&&MH.S.m.stun>=40,cb.d),'the counter lands a big hit and fills the stun meter');
  // landscape / desktop sizing
  await p.setViewportSize({width:1280,height:720});await p.waitForTimeout(150);
  const fit=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect();return r.height<=innerHeight+1&&r.width<=innerWidth&&r.height>innerHeight*.9;});
  ok(fit,'the canvas fits a desktop window');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  await b.close();process.exit(fail?1:0);
})();
