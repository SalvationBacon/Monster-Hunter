// Headless test: node tools/check.js [screenshot folder]   (needs Playwright)
// Bots play whole hunts on a fake clock, then the camp screens and real touch input are checked.
const {chromium}=require('playwright'); const path=require('path');
const shots=process.argv[2];
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:390,height:780},hasTouch:true,isMobile:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(200);
  let fail=0;const ok=(c,msg)=>{console.log((c?'ok   ':'FAIL ')+msg);if(!c)fail++;};
  const shot=async n=>{if(shots){await p.waitForTimeout(80);await p.screenshot({path:shots+'/'+n+'.png'});}};
  await shot('title');

  // skill: chance to dodge each incoming hit and to tap each weak point. counters: taps the COUNTER button
  const bot=(monster,eq,skill,counters)=>p.evaluate(({monster,eq,skill,counters})=>{
    MH.manual=true;Object.assign(MH.SAVE.eq,eq);MH.newHunt(monster);const S=MH.S;let t=0,decided='',will=false,qdec=null;
    while(S.mode==='hunt'&&t<600){
      const m=S.m,h=S.h;
      if(m.state==='attack'&&m.hi<m.hits.length){
        const d=m.hits[m.hi]-m.t,key=m.hi+':'+m.atk+':'+m.hits[0];
        if(decided!==key){decided=key;will=Math.random()<skill;}
        if(will&&d<.15&&d>0&&h.state!=='dodge'&&h.state!=='counter')MH.actDodge(-1);
      }
      if(S.qte&&S.qte.t>S.qteTime*.55&&qdec!==S.qte){qdec=S.qte;if(Math.random()<skill){const pp=MH.partPos(S.qte.part,MH.mPose());MH.qteTap(pp.x,pp.y);}}
      if(counters&&h.counter>0&&h.state!=='counter')MH.actCounter();
      if(h.hp<h.max*.5&&h.potions>0&&h.state==='idle'&&m.state!=='attack')MH.actPotion();
      else if(h.state==='idle')MH.actTap('head');
      MH.update(1/60);t+=1/60;
    }
    return{mode:S.mode,time:150-S.timeLeft,stats:S.stats,potions:S.h.potions,breaks:['head','wings','tail'].filter(k=>S.m.parts[k].broken),loot:S.loot&&S.loot.drops,fail:S.fail,mhp:Math.round(S.m.hp/S.m.max*100)};
  },{monster,eq,skill,counters});
  const avg=a=>a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):0;
  const trial=async(label,monster,eq,skill)=>{
    const runs=[];for(let i=0;i<6;i++)runs.push(await bot(monster,eq,skill,skill>.5));
    const wins=runs.filter(r=>r.mode==='loot');
    console.log(`     ${label}: ${wins.length}/6 wins, win time ${avg(wins.map(r=>r.time))}s, damage taken ${avg(runs.map(r=>r.stats.taken))}, counters ${avg(runs.map(r=>r.stats.counters))}, stuns ${avg(runs.map(r=>r.stats.stuns))}, monster dodges ${avg(runs.map(r=>r.stats.evaded))}, circles hit ${avg(runs.map(r=>r.stats.qteHit))} missed ${avg(runs.map(r=>r.stats.qteMiss))}, parts broken ${(runs.reduce((s,r)=>s+r.breaks.length,0)/6).toFixed(1)}, monster hp left on a loss ${avg(runs.filter(r=>r.mode!=='loot').map(r=>r.mhp))}%`);
    return{runs,wins,time:avg(wins.map(r=>r.time))};
  };
  const START={weapon:'iron',armor:'leather',charm:null}, FERN={weapon:'fblade',armor:'fmail',charm:'keen'}, EMBER={weapon:'eblade',armor:'eplate',charm:'breaker'};
  await p.evaluate(()=>{for(const k in MH.GEAR)MH.SAVE.own[k]=true;});
  console.log('  Fernwing, starter gear');
  let r=await trial('skilled','fern',START,.95);
  ok(r.wins.length===6,'a skilled bot always beats the Fernwing');ok(r.time>30&&r.time<60,'that hunt takes under a minute ('+r.time+'s)');
  ok(r.wins.every(x=>x.breaks.length>=1),'it breaks at least one part');ok(r.wins.every(x=>x.stats.counters>0&&x.stats.stuns>0),'perfect dodges allow counters, and counters stun');
  ok(r.wins.every(x=>x.stats.evaded>0),'the monster dodges some hits');
  ok(r.wins.every(x=>x.breaks.every(k=>x.loot.some(d=>d.id==={head:'horn',wings:'wing',tail:'spike'}[k]))),'broken parts drop their loot');
  await trial('average','fern',START,.7);await trial('casual','fern',START,.45);
  r=await trial('never dodges','fern',START,0);ok(r.wins.length<=1,'never dodging loses the hunt');
  console.log('  Emberwing');
  const es=await trial('average, starter gear','ember',START,.7);
  const ef=await trial('average, Fernwing gear','ember',FERN,.7);
  r=await trial('skilled, Fernwing gear','ember',FERN,.95);ok(r.wins.length>=5,'a skilled bot in Fernwing gear beats the Emberwing');
  ok(r.wins.every(x=>x.loot.some(d=>d.id==='e_scale')),'the Emberwing drops its own materials');
  ok(ef.wins.length>es.wins.length||(ef.wins.length===6&&ef.time<es.time),'Fernwing gear makes the Emberwing easier');
  await trial('casual, Fernwing gear','ember',FERN,.45);
  const ee=await trial('average, Emberwing gear','ember',EMBER,.7);ok(ee.wins.length>=5&&ee.time<ef.time+1,'Emberwing gear makes it easier still');
  const tu=await p.evaluate(()=>{MH.manual=true;MH.newHunt('fern');const S=MH.S;S.h.hp=S.h.max=1e9;let t=0;while(S.mode==='hunt'&&t<400){MH.update(1/30);t+=1/30;}return S.fail;});
  ok(tu==='TIME UP','the hunt ends when time runs out');

  // screenshots of the fights
  const until=(cond,max=40)=>p.evaluate(({c,max})=>{const f=new Function('S','MH','return '+c);const S=MH.S;let t=0;while(!f(S,MH)&&t<max){if(S.h.state==='idle'&&S.m.state!=='attack')MH.actTap('head');MH.update(1/60);t+=1/60;}return t<max;},{c:cond,max});
  if(shots){
    await p.evaluate(()=>{MH.manual=true;Object.assign(MH.SAVE.eq,{weapon:'iron',armor:'leather',charm:null});MH.newHunt('fern');MH.S.h.hp=MH.S.h.max=1e6;});
    await until("S.qte&&S.qte.t>.2",120);await shot('fern-circle');
    await p.evaluate(()=>{MH.manual=true;Object.assign(MH.SAVE.eq,{weapon:'fblade',armor:'fmail',charm:'keen'});MH.newHunt('ember');MH.S.h.hp=MH.S.h.max=1e6;});
    await until("S.m.state==='attack'&&S.m.hits[0]-S.m.t<.3");await shot('ember-telegraph');
    await p.evaluate(()=>{MH.S.m.hp=MH.S.m.max*.6;});await until("S.m.state==='attack'&&S.m.atk==='fire'&&S.m.t>S.m.hits[0]+.2",200);await shot('ember-fire');
    await p.evaluate(()=>{MH.S.m.hp=10;});await until("S.mode==='loot'",60);await p.evaluate(()=>{MH.S.t=5;});await shot('ember-loot');
  }

  // ── camp, on a fresh save, with real taps ──
  await p.evaluate(()=>{localStorage.clear();});await p.reload();await p.waitForTimeout(200);
  const tapBtn=async id=>{const q=await p.evaluate(id=>{const b=MH.S.btns.find(b=>b.id===id);if(!b)return null;const r=document.getElementById('c').getBoundingClientRect();return{x:r.left+(b.x+b.w/2)/128*r.width,y:r.top+(b.y+b.h/2)/MH.LH*r.height};},id);
    if(!q)return false;await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(120);return true;};
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  ok(await p.evaluate(()=>MH.S.mode==='camp'&&MH.S.tab==='hunt'),'a tap on the title opens the camp');
  await shot('camp-hunt-locked');
  await tapBtn('hunt:ember');ok(await p.evaluate(()=>MH.S.mode==='camp'),'the Emberwing is locked on a fresh save');
  await tapBtn('tab:forge');ok(await p.evaluate(()=>MH.S.tab==='forge'),'the FORGE tab opens');
  await tapBtn('forge:fblade');ok(await p.evaluate(()=>!MH.SAVE.own.fblade&&MH.SAVE.eq.weapon==='iron'),'gear cannot be crafted without materials');
  await p.evaluate(()=>{Object.assign(MH.SAVE.bag,{scale:9,claw:4,horn:2,wing:1,spike:1});});await shot('camp-forge');
  await tapBtn('forge:fblade');
  ok(await p.evaluate(()=>MH.SAVE.own.fblade&&MH.SAVE.eq.weapon==='fblade'&&MH.SAVE.bag.scale===3&&MH.SAVE.bag.claw===1&&MH.SAVE.bag.horn===1),'crafting spends the materials and equips the gear');
  ok(await p.evaluate(()=>MH.gearStats().atk===1.3),'the Fern Blade raises attack');
  await tapBtn('forge:keen');ok(await p.evaluate(()=>MH.SAVE.eq.charm==='keen'&&MH.gearStats().qteSlow===1.4),'the Keen Eye Charm slows the circles');
  await tapBtn('forge:keen');ok(await p.evaluate(()=>MH.SAVE.eq.charm===null),'a worn charm can be taken off');await tapBtn('forge:keen');
  await shot('camp-forge-crafted');
  await p.reload();await p.waitForTimeout(200);
  ok(await p.evaluate(()=>MH.SAVE.own.fblade&&MH.SAVE.eq.weapon==='fblade'&&MH.SAVE.eq.charm==='keen'&&MH.SAVE.bag.scale===3),'gear and materials survive a reload');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  await tapBtn('hunt:fern');
  ok(await p.evaluate(()=>MH.S.mode==='hunt'&&MH.S.def.id==='fern'&&MH.S.h.atk===1.3&&Math.abs(MH.S.qteTime-.7)<1e-9),'a tap on the Fernwing card starts the hunt with the worn gear');

  // ── real touch input in a hunt ──
  const head=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect(),pp=MH.partPos('head',MH.mPose());return{x:r.left+pp.x/128*r.width,y:r.top+pp.y/MH.LH*r.height};});
  await p.evaluate(()=>{MH.S.m.evadeCd=9;});
  await p.touchscreen.tap(head.x,head.y);await p.waitForTimeout(250);
  ok(await p.evaluate(()=>MH.S.stats.dealt>0&&MH.S.m.stun>0),'a tap on the head damages the head');
  const cdp=await p.context().newCDPSession(p);
  const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  await p.waitForTimeout(500);
  await touch('touchStart',200,600);await touch('touchMove',150,600);await touch('touchMove',110,602);await p.waitForTimeout(50);
  ok(await p.evaluate(()=>MH.S.h.state==='dodge'),'a swipe dodges');await touch('touchEnd');
  await p.waitForTimeout(700);
  const quiet=()=>p.evaluate(()=>{const S=MH.S,m=S.m;m.state='idle';m.wait=10;m.evadeCd=99;m.qteT=99;S.qte=null;S.h.state='idle';S.h.inv=0;});
  await quiet();
  const before=await p.evaluate(()=>MH.S.stats.dealt);
  await touch('touchStart',200,600);await p.waitForTimeout(1500);
  ok(await p.evaluate(()=>MH.S.h.state==='charge'&&MH.S.h.lvl>=1),'a held press charges');
  await touch('touchEnd');await p.waitForTimeout(400);
  const hv=await p.evaluate(()=>MH.S.stats.dealt);ok(hv-before>=40,'releasing lands a heavy hit ('+(hv-before)+')');
  const qp=await p.evaluate(()=>{const S=MH.S;MH.manual=true;S.qte={part:'tail',t:0};
    const r=document.getElementById('c').getBoundingClientRect(),pp=MH.partPos('tail',MH.mPose());return{x:r.left+pp.x/128*r.width,y:r.top+pp.y/MH.LH*r.height};});
  await p.touchscreen.tap(qp.x,qp.y);
  ok(await p.evaluate(()=>MH.S.m.parts.tail.hits===1&&!MH.S.qte),'a tap on a red circle counts as a weak-point hit');
  ok(await p.evaluate(()=>{const S=MH.S;for(let k=0;k<2;k++){S.qte={part:'tail',t:0};const pp=MH.partPos('tail',MH.mPose());MH.qteTap(pp.x,pp.y);}return S.m.parts.tail.broken&&S.m.state==='stagger';}),'three hits break the part');
  ok(await p.evaluate(()=>{const S=MH.S;S.qte={part:'head',t:0};for(let i=0;i<60;i++)MH.update(1/60);const r=!S.qte&&S.m.parts.head.hits===0;MH.manual=false;return r;}),'an untouched circle times out');
  ok(await p.evaluate(()=>{MH.manual=true;MH.SAVE.eq.charm='breaker';MH.SAVE.own.breaker=true;MH.newHunt('fern');const S=MH.S;for(let k=0;k<2;k++){S.qte={part:'head',t:0};const pp=MH.partPos('head',MH.mPose());MH.qteTap(pp.x,pp.y);}
    const r=S.m.parts.head.broken;MH.SAVE.eq.charm='keen';delete MH.SAVE.own.breaker;MH.newHunt('fern');MH.manual=false;return r;}),'the Breaker Charm breaks a part in two hits');
  await quiet();
  await p.evaluate(()=>{MH.S.h.hp=40;});
  await touch('touchStart',200,600);await touch('touchMove',202,560);await touch('touchMove',203,520);await touch('touchEnd');await p.waitForTimeout(900);
  ok(await p.evaluate(()=>MH.S.h.potions===1&&MH.S.h.hp===40+Math.round(MH.S.h.max*.4)),'a swipe up drinks a potion');
  await quiet();
  const cb=await p.evaluate(()=>{const S=MH.S;S.h.counter=1.4;S.slow=0;MH.manual=true;
    const r=document.getElementById('c').getBoundingClientRect(),c=MH.L.counter;return{x:r.left+(c.x+c.w/2)/128*r.width,y:r.top+(c.y+c.h/2)/MH.LH*r.height,d:S.stats.dealt};});
  await p.touchscreen.tap(cb.x,cb.y);
  ok(await p.evaluate(()=>MH.S.h.state==='counter'),'a tap on the COUNTER button starts a counter');
  await p.evaluate(()=>{for(let i=0;i<40;i++)MH.update(1/60);});
  ok(await p.evaluate(d=>MH.S.stats.dealt-d>=100&&MH.S.m.stun>=40,cb.d),'the counter lands a big hit and fills the stun meter');
  // win → loot → camp, with the Emberwing unlocked
  await p.evaluate(()=>{const S=MH.S;S.m.hp=1;S.m.state='idle';S.h.state='idle';MH.actTap('head');for(let i=0;i<400&&S.mode==='hunt';i++)MH.update(1/60);S.t=5;MH.manual=false;});
  ok(await p.evaluate(()=>MH.S.mode==='loot'&&MH.S.loot.unlock==='EMBERWING'&&MH.SAVE.wins.fern===1),'the first Fernwing win unlocks the Emberwing');
  await shot('loot-unlock');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  ok(await p.evaluate(()=>MH.S.mode==='camp'),'a tap on the loot screen returns to camp');await shot('camp-hunt');
  await tapBtn('hunt:ember');ok(await p.evaluate(()=>MH.S.mode==='hunt'&&MH.S.def.id==='ember'&&MH.S.m.max===MH.MONSTERS.ember.hp),'the Emberwing hunt now starts');
  await p.setViewportSize({width:1280,height:720});await p.waitForTimeout(150);
  ok(await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect();return r.height<=innerHeight+1&&r.width<=innerWidth&&r.height>innerHeight*.9;}),'the canvas fits a desktop window');
  await p.evaluate(()=>MH.toCamp('forge'));await p.waitForTimeout(150);await shot('camp-forge-short');
  ok(await p.evaluate(()=>MH.S.btns.every(b=>b.y+b.h<=MH.LH)&&MH.S.btns.filter(b=>b.id.startsWith('forge:')).every(b=>b.y+b.h<=MH.LH-20)),'the forge list fits the shortest screen');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  await b.close();process.exit(fail?1:0);
})();
