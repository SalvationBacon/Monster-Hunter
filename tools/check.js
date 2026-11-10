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
  const bot=(skill,heavy)=>p.evaluate(({skill,heavy})=>{
    MH.manual=true;MH.newHunt();const S=MH.S;let t=0,decided=-1,will=false,holdUntil=0;
    const tgt=part=>{S.h.state==='idle'&&MH.actTap(part);};
    while(S.mode==='hunt'&&t<600){
      const m=S.m,h=S.h;
      if(m.state==='attack'&&m.hi<m.hits.length){
        const key=m.hits[m.hi]+m.hi*100+t*0; const d=m.hits[m.hi]-m.t;
        if(decided!==m.hi+':'+m.atk+':'+m.hits[0]){decided=m.hi+':'+m.atk+':'+m.hits[0];will=Math.random()<skill;}
        if(will&&d<.15&&d>0&&h.state!=='dodge')MH.actDodge(-1);
      }
      if(h.hp<50&&h.potions>0&&h.state==='idle'&&m.state!=='attack')MH.actPotion();
      else if(h.state==='idle'){
        const part=!m.parts.head.broken?'head':!m.parts.tail.broken?'tail':'head';
        MH.actTap(part);
      }
      MH.update(1/60);t+=1/60;
    }
    return{mode:S.mode,time:150-S.timeLeft,hp:S.h.hp,mhp:S.m.hp,stats:S.stats,potions:S.h.potions,head:S.m.parts.head.broken,tail:S.m.parts.tail.broken,loot:S.loot&&S.loot.drops,fail:S.fail};
  },{skill,heavy});

  for(const [name,skill] of [['skilled',.95],['average',.7],['casual',.45],['never dodges',0]]){
    const runs=[];for(let i=0;i<6;i++)runs.push(await bot(skill));
    const wins=runs.filter(r=>r.mode==='loot'),avg=a=>a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):0;
    console.log(`     ${name}: ${wins.length}/6 wins, avg win time ${avg(wins.map(r=>r.time))}s, avg damage taken ${avg(runs.map(r=>r.stats.taken))}, potions left ${avg(runs.map(r=>r.potions))}`);
    if(name==='skilled'){ok(wins.length===6,'a skilled bot always wins');const t=avg(wins.map(r=>r.time));ok(t>35&&t<60,'skilled hunt takes about a minute ('+t+'s)');
      ok(wins.every(r=>r.head&&r.tail),'both parts break when targeted');ok(wins.every(r=>r.loot.some(d=>d.id==='horn')&&r.loot.some(d=>d.id==='spike')),'broken parts drop their loot');}
    if(name==='never dodges')ok(wins.length===0&&runs.every(r=>r.fail==='YOU FAINTED'),'never dodging loses the hunt');
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
    await p.evaluate(()=>{MH.S.m.hp=2030;});await until("S.m.state==='roar'&&S.m.t>.3");await p.waitForTimeout(60);await p.screenshot({path:shots+'/roar.png'});
    await until("S.m.state==='attack'&&S.m.atk==='fire'&&S.m.t>S.m.hits[0]+.2",120);await p.waitForTimeout(60);await p.screenshot({path:shots+'/fire.png'});
    await until("S.m.state==='stagger'&&S.m.t>.3",120);await p.waitForTimeout(60);await p.screenshot({path:shots+'/stagger.png'});
    await p.evaluate(()=>{MH.S.m.hp=980;MH.S.h.hp=60;});
    await until("S.m.state==='attack'&&S.m.atk==='dive'&&S.m.t>S.m.hits[0]-.5",200);await p.waitForTimeout(60);await p.screenshot({path:shots+'/dive.png'});
    await p.evaluate(()=>{MH.S.m.hp=10;});await until("S.mode==='loot'",60);await p.evaluate(()=>{MH.S.t=5;});await p.waitForTimeout(60);await p.screenshot({path:shots+'/loot.png'});
  }

  // real touch input on a live clock
  await p.reload();await p.waitForTimeout(200);
  await p.touchscreen.tap(195,400);await p.waitForTimeout(100);
  ok(await p.evaluate(()=>MH.S.mode==='hunt'),'a tap on the title starts the hunt');
  const head=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect(),pp=MH.partPos('head',MH.mPose());return{x:r.left+pp.x/128*r.width,y:r.top+pp.y/MH.LH*r.height,r:{l:r.left,t:r.top,w:r.width,h:r.height}};});
  await p.touchscreen.tap(head.x,head.y);await p.waitForTimeout(250);
  ok(await p.evaluate(()=>MH.S.stats.dealt>0&&MH.S.m.parts.head.hp<450),'a tap on the head damages the head');
  const cdp=await p.context().newCDPSession(p);
  const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  await p.waitForTimeout(500);
  await touch('touchStart',200,500);await touch('touchMove',150,500);await touch('touchMove',110,502);await p.waitForTimeout(50);
  ok(await p.evaluate(()=>MH.S.h.state==='dodge'),'a swipe dodges');await touch('touchEnd');
  await p.waitForTimeout(700);
  await p.evaluate(()=>{const m=MH.S.m;m.state='idle';m.wait=10;MH.S.h.state='idle';MH.S.h.inv=0;}); // keep the monster quiet for the hold
  const before=await p.evaluate(()=>MH.S.stats.dealt);
  await touch('touchStart',200,500);await p.waitForTimeout(1500);
  ok(await p.evaluate(()=>MH.S.h.state==='charge'&&MH.S.h.lvl>=1),'a held press charges');
  await touch('touchEnd');await p.waitForTimeout(400);
  const hv=await p.evaluate(()=>MH.S.stats.dealt);
  ok(hv-before>=40,'releasing lands a heavy hit ('+(hv-before)+')');
  await p.evaluate(()=>{MH.S.h.hp=40;MH.S.h.state='idle';});
  await touch('touchStart',200,500);await touch('touchMove',202,460);await touch('touchMove',203,420);await touch('touchEnd');await p.waitForTimeout(900);
  ok(await p.evaluate(()=>MH.S.h.potions===1||MH.S.h.state==='hurt'),'a swipe up drinks a potion');
  // landscape / desktop sizing
  await p.setViewportSize({width:1280,height:720});await p.waitForTimeout(150);
  const fit=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect();return r.height<=innerHeight+1&&r.width<=innerWidth&&r.height>innerHeight*.9;});
  ok(fit,'the canvas fits a desktop window');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  await b.close();process.exit(fail?1:0);
})();
