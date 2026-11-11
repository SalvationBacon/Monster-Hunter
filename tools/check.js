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
    MH.manual=true;Object.assign(MH.SAVE.eq,{coat:null},eq);MH.SAVE.potions=99;MH.newHunt(monster);const S=MH.S;let t=0,decided='',will=false,qdec=null;
    while(S.mode==='hunt'&&t<600){
      const m=S.m,h=S.h;
      if(m.state==='attack'&&m.hi<m.hits.length){
        const d=m.hits[m.hi]-m.t,key=m.hi+':'+m.atk+':'+m.hits[0];
        if(decided!==key){decided=key;will=Math.random()<skill;}
        if(will&&d<.15&&d>0&&h.state!=='dodge'&&h.state!=='counter')MH.actDodge(-1);
      }
      if(S.qte&&S.qte.t>S.qteTime*.55&&qdec!==S.qte){qdec=S.qte;if(Math.random()<skill){const pp=MH.partPos(S.qte.part,MH.mPose());MH.qteTap(pp.x,pp.y);}}
      if(counters&&h.counter>0&&h.state!=='counter')MH.actCounter();
      if(h.state==='frozen')MH.actTap('head');
      if(h.sharp<25&&h.state==='idle'&&m.state!=='attack'&&m.state!=='idle')MH.actSharpen();
      if(h.burn>0&&skill>.5&&h.st>70&&h.state==='idle'&&m.state!=='attack')MH.actDodge(-1);
      if(h.hp<h.max*.5&&h.potions>0&&h.state==='idle'&&m.state!=='attack')MH.actPotion();
      else if(h.state==='idle')MH.actTap('head');
      MH.update(1/60);t+=1/60;
    }
    return{mode:S.mode,time:150-S.timeLeft,stats:S.stats,potions:S.h.potions,breaks:['head','wings','tail'].filter(k=>S.m.parts[k].broken),loot:S.loot&&S.loot.drops,fail:S.fail,mhp:Math.round(S.m.hp/S.m.max*100)};
  },{monster,eq,skill,counters});
  const MH_PRE={fern:'',tusk:'t_',ember:'e_',frost:'f_',storm:'s_'};
  const avg=a=>a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):0;
  const trial=async(label,monster,eq,skill)=>{
    const runs=[];for(let i=0;i<6;i++)runs.push(await bot(monster,eq,skill,skill>.5));
    const wins=runs.filter(r=>r.mode==='loot');
    console.log(`     ${label}: ${wins.length}/6 wins, win time ${avg(wins.map(r=>r.time))}s, damage taken ${avg(runs.map(r=>r.stats.taken))}, counters ${avg(runs.map(r=>r.stats.counters))}, stuns ${avg(runs.map(r=>r.stats.stuns))}, monster dodges ${avg(runs.map(r=>r.stats.evaded))}, circles hit ${avg(runs.map(r=>r.stats.qteHit))} missed ${avg(runs.map(r=>r.stats.qteMiss))}, parts broken ${(runs.reduce((s,r)=>s+r.breaks.length,0)/6).toFixed(1)}, monster hp left on a loss ${avg(runs.filter(r=>r.mode!=='loot').map(r=>r.mhp))}%`);
    return{runs,wins,time:avg(wins.map(r=>r.time))};
  };
  const set=(t,wt,charm)=>({weapon:t+'_'+(wt||'gs'),armor:t==='iron'?'leather':t+'_ar',charm:charm===undefined?(t==='iron'?null:t+'_ch'):charm});
  await p.evaluate(()=>{for(const k in MH.GEAR)MH.SAVE.own[k]=true;});
  console.log('  Fernwing, starter greatsword');
  let r=await trial('skilled','fern',set('iron'),.95);
  ok(r.wins.length===6,'a skilled bot always beats the Fernwing');ok(r.time>30&&r.time<60,'that hunt takes under a minute ('+r.time+'s)');
  ok(r.wins.every(x=>x.breaks.length>=1),'it breaks at least one part');ok(r.wins.every(x=>x.stats.counters>0&&x.stats.stuns>0),'perfect dodges allow counters, and counters stun');
  ok(r.wins.every(x=>x.stats.evaded>0),'the monster dodges some hits');
  ok(r.wins.every(x=>x.breaks.every(k=>x.loot.some(d=>d.id==={head:'horn',wings:'wing',tail:'spike'}[k]))),'broken parts drop their loot');
  await trial('average','fern',set('iron'),.7);await trial('casual','fern',set('iron'),.45);
  r=await trial('never dodges','fern',set('iron'),0);ok(r.wins.length<=1,'never dodging loses the hunt');
  console.log('  Each weapon type against the Fernwing (average bot)');
  for(const wt of ['gs','db','hm','ln']){r=await trial(await p.evaluate(w=>MH.WTYPES[w].name,wt),'fern',set('iron',wt),.7);ok(r.wins.length>=5&&r.time>30&&r.time<75,'the iron '+wt+' wins in about a minute ('+r.time+'s)');}
  console.log('  The ladder: each monster in the gear of the one before (average bot), then in its own gear');
  const order=await p.evaluate(()=>MH.HUNTS);
  for(let i=1;i<order.length;i++){
    const prev=await trial(order[i]+' in '+order[i-1]+' gear',order[i],set(order[i-1]),.7);
    ok(prev.wins.length>=4&&prev.time<110,order[i]+' is beatable in '+order[i-1]+' gear ('+prev.wins.length+'/6, '+prev.time+'s)');
    ok(prev.wins.every(x=>x.loot.some(d=>d.id===MH_PRE[order[i]]+'scale')),order[i]+' drops its own materials');
    if(i>=2){const old=await trial(order[i]+' in '+order[i-2]+' gear',order[i],set(order[i-2]),.7);ok(old.wins.length<prev.wins.length||old.time>prev.time,'older gear makes '+order[i]+' harder');}
  }
  r=await trial('storm in storm gear','storm',set('storm'),.7);ok(r.wins.length>=5,'the Stormwing falls to its own gear');
  // every weapon type deals about the same damage per second with taps alone, at very different speeds
  const dps=await p.evaluate(()=>{MH.manual=true;const out={};for(const wt of ['gs','db','hm','ln']){Object.assign(MH.SAVE.eq,{weapon:'iron_'+wt,armor:'leather',charm:null});MH.newHunt('fern');const S=MH.S,m=S.m;
    m.hp=m.max=1e9;m.evadeCd=1e9;m.wait=1e9;m.qteT=1e9;S.timeLeft=1e9;let hits=0,last=0;for(let i=0;i<60*30;i++){MH.actTap('body');MH.update(1/60);if(S.stats.dealt!==last){hits++;last=S.stats.dealt;}}
    out[wt]={dps:S.stats.dealt/30,rate:hits/30};}return out;});
  console.log('     tap damage per second: '+Object.entries(dps).map(([k,v])=>k+' '+v.dps.toFixed(1)+' ('+v.rate.toFixed(1)+' hits/s)').join(', '));
  const dv=Object.values(dps).map(v=>v.dps);ok(Math.max(...dv)/Math.min(...dv)<1.06,'all four weapon types deal the same tap damage per second, within 6%');
  ok(dps.db.rate>dps.ln.rate&&dps.ln.rate>dps.gs.rate&&dps.gs.rate>dps.hm.rate&&dps.db.rate/dps.hm.rate>2.5,'dual blades hit fastest, then lance, greatsword, hammer');
  // upgrades
  ok(await p.evaluate(()=>{const S=MH.SAVE;S.lv={};S.bag={scale:99,claw:99,horn:9,wing:9,spike:9,t_scale:99,rare:2};Object.assign(S.eq,{weapon:'fern_gs',armor:'fern_ar',charm:null});
    const c1=JSON.stringify(MH.upCost('fern_gs'));MH.upgradeTap('fern_gs');const a1=MH.gearStats().atk,sc=S.bag.scale;
    for(let i=0;i<9;i++)MH.upgradeTap('fern_gs');for(let i=0;i<9;i++)MH.upgradeTap('fern_ar');const g=MH.gearStats();
    return c1==='{"scale":3,"claw":1}'&&Math.abs(a1-1.404)<1e-6&&sc===96&&MH.lvOf('fern_gs')===5&&Math.abs(g.atk-1.82)<1e-6&&g.hp===196&&MH.upCost('fern_gs')===null&&S.bag.t_scale===99-6-6&&S.bag.rare===0;}),
    'upgrades cost materials, add 8% a level, stop at +5, and the last levels need the next monster\'s scales and the rare drop');
  ok(await p.evaluate(()=>{const S=MH.SAVE;S.lv={fern_gs:4};S.bag={scale:99,claw:99,horn:9,wing:9,t_scale:99};MH.upgradeTap('fern_gs');const no=MH.lvOf('fern_gs')===4;S.lv={};S.bag={};return no;}),'+5 cannot be reached without the rare drop');
  ok(await p.evaluate(()=>{MH.SAVE.bag={};MH.SAVE.lv={};const b=MH.lvOf('fern_gs');MH.upgradeTap('fern_gs');return MH.lvOf('fern_gs')===0&&MH.upCost('fern_ch')===null;}),'no upgrade without materials, and charms have no levels');
  ok(await p.evaluate(()=>{const taken=ar=>{Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:ar,charm:null});let n=0;for(let k=0;k<12;k++){MH.newHunt('ember');const S=MH.S,m=S.m;m.wait=0;m.qteT=99;let t=0;while(S.stats.taken===0&&t<6){MH.update(1/60);t+=1/60;}
      const A=MH.ATTACKS[m.atk];n+=S.stats.taken/Math.round(A.dmg*1.5);}return n/12;};const a=taken('ember_ar'),b=taken('frost_ar');return Math.abs(a-.75)<.06&&Math.abs(b-1)<.01;}),'armor takes 25% less from its own monster\'s element');
  // every monster has its own moves, and the signature mechanics work
  ok(await p.evaluate(()=>{const seen={};for(const id of MH.HUNTS)for(const pool of MH.MONSTERS[id].pools)for(const a of pool){if(!MH.ATTACKS[a])return false;(seen[a]=seen[a]||new Set()).add(id);}
    const own=id=>new Set(MH.MONSTERS[id].pools.flat().filter(a=>seen[a].size===1));return MH.HUNTS.every(id=>own(id).size>=3)&&MH.HUNTS.every(id=>MH.MONSTERS[id].sig&&MH.MONSTERS[id].tip);}),'every monster has at least three moves no other monster uses, and a signature');
  ok(await p.evaluate(()=>{for(const id of MH.HUNTS)for(const a of new Set(MH.MONSTERS[id].pools.flat())){MH.manual=true;Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:'leather',charm:null});MH.newHunt(id);const S=MH.S,m=S.m;S.h.hp=S.h.max=1e6;m.evadeCd=1e9;m.qteT=1e9;
      const pool=MH.MONSTERS[id].pools;MH.MONSTERS[id].pools=[[a],[a],[a]];m.wait=0;let t=0,hit=false,moved=false;const p0=JSON.stringify(MH.mPose());
      while(t<6&&!(m.state==='recover')){MH.update(1/60);t+=1/60;if(m.state==='attack'&&JSON.stringify(MH.mPose())!==p0)moved=true;}MH.MONSTERS[id].pools=pool;
      if(m.state!=='recover'||!moved||S.stats.taken<=0)return id+':'+a;}return true;}),'every move of every monster animates, lands its hits and ends');
  ok(await p.evaluate(()=>{MH.newHunt('fern');const S=MH.S,h=S.h;S.m.wait=99;MH.applyStatus('poison');const hp0=h.hp;for(let i=0;i<120;i++)MH.update(1/60);const lost=hp0-h.hp;
    h.state='idle';MH.actPotion();for(let i=0;i<60;i++)MH.update(1/60);const cured=h.poison===0;h.hp=3;MH.applyStatus('poison');for(let i=0;i<600;i++)MH.update(1/60);return lost>=4&&lost<=8&&cured&&h.hp===1&&h.state!=='dead';}),'poison drains health, a potion cures it, and it cannot land the killing blow');
  ok(await p.evaluate(()=>{MH.newHunt('ember');const S=MH.S,h=S.h;S.m.wait=99;MH.applyStatus('burn');const hp0=h.hp;for(let i=0;i<60;i++)MH.update(1/60);const lost=hp0-h.hp;
    MH.actDodge(-1);for(let i=0;i<40;i++)MH.update(1/60);const half=h.burn>0;MH.actDodge(-1);for(let i=0;i<40;i++)MH.update(1/60);return lost>=2&&half&&h.burn===0;}),'burning drains health and two rolls put it out');
  ok(await p.evaluate(()=>{MH.newHunt('frost');const S=MH.S,h=S.h;S.m.wait=99;MH.applyStatus('freeze');const fr=h.state==='frozen';MH.actDodge(-1);const still=h.state==='frozen';let taps=1;
    while(h.state==='frozen'&&taps<20){MH.actTap('head');MH.update(1/60);taps++;}MH.applyStatus('freeze');return fr&&still&&taps>=5&&taps<=8&&h.state!=='frozen';}),'being frozen locks the hunter until enough taps break the ice, then gives a breather');
  ok(await p.evaluate(()=>{const hit=st=>{MH.newHunt('tusk');const S=MH.S,m=S.m;m.evadeCd=1e9;m.wait=1e9;m.qteT=1e9;m.state=st;m.rec=99;m.atk='gore';m.staggerDur=99;let n=0;for(let k=0;k<30;k++){S.stats.dealt=0;S.h.state='idle';S.h.comboT=0;MH.actTap('body');for(let i=0;i<10;i++)MH.update(1/60);n+=S.stats.dealt;}return n/30;};
    const up=hit('idle'),open=hit('recover');return Math.abs(open/up-1.4/.6)<.15;}),'the Tuskhide takes glancing blows until it is winded, then far more');
  ok(await p.evaluate(()=>{MH.newHunt('storm');const S=MH.S,m=S.m;m.wait=1e9;m.qteT=1e9;m.evadeCd=1e9;S.h.inv=1e9;for(let i=0;i<60*5;i++)MH.update(1/60);const half=m.charge>30&&m.charge<50&&!m.over;
    S.h.counter=1;MH.actCounter();for(let i=0;i<30;i++)MH.update(1/60);const drained=m.charge<20;m.wait=1e9;for(let i=0;i<60*14;i++)MH.update(1/60);const over=m.over;
    S.h.state='idle';S.h.counter=1;MH.actCounter();for(let i=0;i<30;i++)MH.update(1/60);return half&&drained&&over&&!m.over&&m.charge<5&&m.state==='stagger';}),'the Stormwing builds charge, a counter drains it, and overcharge is knocked out by a counter');
  ok(await p.evaluate(()=>{MH.newHunt('storm');const m=MH.S.m;m.over=true;m.wait=0;m.qteT=1e9;MH.update(1/60);const fast=m.hits[0];MH.newHunt('storm');const n=MH.S.m;n.wait=0;n.qteT=1e9;let slow=0;for(let k=0;k<40&&!slow;k++){MH.newHunt('storm');MH.S.m.wait=0;MH.update(1/60);if(MH.S.m.atk===m.atk)slow=MH.S.m.hits[0];}
    return slow&&Math.abs(fast/slow-.8)<.01;}),'an overcharged Stormwing attacks faster');
  // sharpness, weapon statuses, rare drops
  ok(await p.evaluate(()=>{Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:'leather',charm:null});const dmg=sh=>{MH.newHunt('storm');const S=MH.S,m=S.m;m.evadeCd=1e9;m.wait=1e9;m.qteT=1e9;S.h.inv=1e9;let n=0;
      for(let k=0;k<30;k++){S.h.sharp=sh;S.stats.dealt=0;S.h.state='idle';S.h.comboT=0;MH.actTap('body');for(let i=0;i<16;i++)MH.update(1/60);n+=S.stats.dealt;}return n/30;};
    const keen=dmg(100),mid=dmg(50),dull=dmg(10);return Math.abs(keen/mid-1.1)<.03&&Math.abs(dull/mid-.75)<.03;}),'a keen edge hits 10% harder and a dull one 25% softer');
  ok(await p.evaluate(()=>{MH.newHunt('storm');const S=MH.S,m=S.m,h=S.h;m.evadeCd=1e9;m.wait=1e9;m.qteT=1e9;h.inv=1e9;let t=0;while(h.sharp>=MH.SHARP.lo&&t<60){MH.actTap('body');MH.update(1/60);t+=1/60;}
    const wore=t>15&&t<35;h.state='idle';MH.actSharpen();const busy=h.state==='sharpen';for(let i=0;i<90;i++)MH.update(1/60);const done=h.sharp===100&&h.state==='idle';
    h.sharp=40;MH.actSharpen();h.inv=0;m.wait=0;let u=0;while(h.state==='sharpen'&&u<4){MH.update(1/60);u+=1/60;}return wore&&busy&&done&&h.sharp===40&&h.state!=='sharpen';}),'the edge dulls in about 25 seconds of hitting, sharpening restores it, and a hit interrupts it');
  ok(await p.evaluate(()=>{const run=(coat,mon)=>{Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:'leather',charm:null,coat});MH.newHunt(mon||'tusk');const S=MH.S,m=S.m;m.hp=m.max=1e7;m.evadeCd=1e9;m.wait=1e9;m.qteT=1e9;S.h.inv=1e9;let st=0,pz=0,sl=0,first=0;
      for(let i=0;i<60*25;i++){S.h.sharp=50;if(m.state!=='sleep')MH.actTap('body');MH.update(1/60);if(m.state==='stagger')st++;if(m.mpoison>0)pz++;if(m.state==='sleep')sl++;if(!first&&S.stats.procs)first=i/60;}return{procs:S.stats.procs||0,sd:S.stats.statusDmg||0,st,pz,sl,first};};
    const po=run('coat_poison'),bl=run('coat_blast'),pa=run('coat_para'),sp=run('coat_sleep'),no=run(null);MH.SAVE.eq.coat=null;
    return po.procs>=2&&po.sd>0&&po.pz>0&&bl.procs>=2&&bl.sd>=2*150&&pa.procs>=1&&pa.st>100&&sp.procs>=1&&sp.sl>10&&no.procs===0&&MH.GEAR.tusk_gs.atk===1.5&&!MH.GEAR.fern_gs.status;}),'poison, blast, paralysis and sleep coatings each trigger their effect, and weapons carry no status of their own');
  ok(await p.evaluate(()=>{const first=(coat,mon)=>{Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:'leather',charm:null,coat});MH.newHunt(mon);const S=MH.S,m=S.m;m.hp=m.max=1e7;m.evadeCd=1e9;m.wait=1e9;m.qteT=1e9;S.h.inv=1e9;let i=0;
      while(!S.stats.procs&&i<60*60){S.h.sharp=50;MH.actTap('body');MH.update(1/60);i++;}return i/60;};
    const weak=first('coat_poison','tusk'),plain=first('coat_poison','ember'),res=first('coat_poison','fern');MH.SAVE.eq.coat=null;return Math.abs(plain/weak-1.5)<.15&&Math.abs(res/plain-2)<.2;}),'a status builds 50% faster on a monster weak to it and half as fast on one that resists it');
  ok(await p.evaluate(()=>{Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:'leather',charm:null,coat:null});const hit=sleep=>{MH.newHunt('ember');const S=MH.S,m=S.m;m.evadeCd=1e9;m.wait=1e9;m.qteT=1e9;S.h.inv=1e9;S.h.sharp=50;if(sleep){m.state='sleep';m.t=0;}MH.actTap('body');for(let i=0;i<16;i++)MH.update(1/60);return{d:S.stats.dealt,st:m.state};};
    let a=0,b=0,woke=true;for(let k=0;k<30;k++){const x=hit(true),y=hit(false);a+=x.d;b+=y.d;if(x.st==='sleep')woke=false;}return woke&&Math.abs(a/b-2.5)<.2;}),'the hit that wakes a sleeping monster does 2.5 times the damage');
  ok(await p.evaluate(()=>{Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:'leather',charm:null});const roll=(breaks,dry)=>{let n=0;for(let i=0;i<4000;i++){MH.SAVE.dry.fern=dry;MH.newHunt('fern');for(const k of ['head','wings','tail'].slice(0,breaks))MH.S.m.parts[k].broken=true;
      if(MH.rollLoot().drops.some(d=>d.id==='rare'))n++;}return n/4000;};const a=roll(0,0),b=roll(3,0),c=roll(0,20);MH.SAVE.bag={};MH.SAVE.wins={};MH.SAVE.dry={};
    return a>.015&&a<.05&&b>.09&&b<.15&&c>.1&&c<.16;}),'the rare drop is about 3%, 12% with every part broken, and creeps up over a dry streak');
  // perks and weapon rules, checked directly
  ok(await p.evaluate(()=>{MH.manual=true;Object.assign(MH.SAVE.eq,{weapon:'ember_gs',armor:'ember_ar',charm:'relic_weak'});const g=MH.gearStats();return g.elem==='fire'&&Math.abs(g.atk-1.925)<1e-6&&g.perks.might&&g.perks.weakspot&&g.hp===200;}),'gear adds up: element, attack with Might, health, perks');
  ok(await p.evaluate(()=>{const hit=(w,mon)=>{MH.SAVE.eq.weapon=w;MH.SAVE.eq.armor='leather';MH.SAVE.eq.charm=null;MH.newHunt(mon);const S=MH.S;S.m.evadeCd=99;let n=0;for(let k=0;k<40;k++){S.stats.dealt=0;S.h.state='idle';S.h.comboT=0;MH.actTap('body');for(let i=0;i<16;i++)MH.update(1/60);n+=S.stats.dealt;S.m.hp=S.m.max;S.m.phase=0;S.m.roarDue=false;S.m.wait=1e9;S.m.state='idle';S.h.inv=1e9;}return n/40;};
    MH.SAVE.lv={};const a=hit('tusk_gs','ember'),b=hit('tusk_gs','storm');return a/b>1.2&&a/b<1.3;}),'a weapon does 25% more to a monster weak to its element');
  ok(await p.evaluate(()=>{Object.assign(MH.SAVE.eq,{weapon:'iron_ln',armor:'leather',charm:null});MH.newHunt('fern');const S=MH.S,m=S.m;m.evadeCd=99;m.wait=0;m.qteT=99;MH.update(1/60);
    Object.assign(MH.IN,{down:true,swiped:false,downAt:-9});let t=0;while(m.state==='attack'&&m.hi===0&&t<3){S.h.state='guard';S.h.t=1;MH.update(1/60);t+=1/60;}MH.IN.down=false;
    return S.stats.guards===1&&S.stats.taken>0&&S.stats.taken<=4&&S.h.st<100&&S.h.state!=='hurt';}),'a lance guard blocks a hit for chip damage and stamina');
  ok(await p.evaluate(()=>{MH.newHunt('fern');const S=MH.S,m=S.m;m.evadeCd=99;m.wait=0;m.qteT=99;MH.update(1/60);let t=0;
    while(m.state==='attack'&&m.hi===0&&t<3){if(m.hits[0]-m.t<.1&&S.h.state!=='guard'){Object.assign(MH.IN,{down:true,swiped:false,downAt:-9});S.h.state='guard';S.h.t=0;}MH.update(1/60);t+=1/60;}MH.IN.down=false;
    return S.h.counter>0&&S.stats.taken===0;}),'a guard raised just in time is perfect and opens a counter');
  ok(await p.evaluate(()=>{Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:'leather',charm:'frost_ch'});MH.SAVE.potions=99;MH.newHunt('fern');const a=MH.S.h.potions;MH.SAVE.eq.charm=null;MH.SAVE.potions=2;MH.newHunt('fern');return a===4&&MH.S.h.potions===2;}),'three potions come on a hunt, four with Herbalist, and never more than are in stock');
  await p.evaluate(()=>{Object.assign(MH.SAVE.eq,{weapon:'iron_gs',armor:'leather',charm:null});});
  const tu=await p.evaluate(()=>{MH.manual=true;MH.newHunt('fern');const S=MH.S;S.h.inv=1e9;S.m.hp=S.m.max=1e9;let t=0;while(S.mode==='hunt'&&t<400){MH.update(1/30);t+=1/30;}return S.fail;});
  ok(tu==='TIME UP','the hunt ends when time runs out');

  // screenshots of the fights
  const until=(cond,max=40)=>p.evaluate(({c,max})=>{const f=new Function('S','MH','return '+c);const S=MH.S;let t=0;while(!f(S,MH)&&t<max){if(S.h.state==='idle'&&S.m.state!=='attack')MH.actTap('head');MH.update(1/60);t+=1/60;}return t<max;},{c:cond,max});
  if(shots){
    const scene=async(mon,eq,cond,name,max)=>{await p.evaluate(({mon,eq})=>{MH.manual=true;Object.assign(MH.SAVE.eq,{coat:null},eq);MH.SAVE.potions=9;MH.newHunt(mon);MH.S.h.hp=MH.S.h.max=1e6;MH.S.m.hp=MH.S.m.max*.6;},{mon,eq});await until(cond,max||200);await shot(name);};
    await scene('fern',set('iron','db'),"S.qte&&S.qte.t>.2",'fern-circle');
    const mid=id=>"S.m.state==='attack'&&S.m.atk==='"+id+"'&&S.m.hits[0]-S.m.t<.2&&S.m.hits[0]-S.m.t>.05";
    await scene('fern',set('iron','gs'),mid('spit'),'fern-spit');
    await scene('tusk',set('fern','hm'),mid('stomp'),'tusk-stomp');
    await scene('tusk',set('fern','hm'),mid('gore'),'tusk-gore');
    await scene('tusk',set('fern','hm'),mid('rock'),'tusk-rock');
    await scene('tusk',set('fern','hm'),"S.m.state==='recover'&&S.m.t>.2",'tusk-open');
    await scene('ember',set('tusk','gs'),mid('slam'),'ember-slam');
    await scene('ember',set('tusk','gs'),mid('volley'),'ember-volley');
    await p.evaluate(()=>{MH.S.h.hp=MH.S.h.max=300;MH.S.m.wait=99;MH.applyStatus('burn');for(let i=0;i<30;i++)MH.update(1/60);});await shot('ember-burning');
    await scene('frost',set('ember','ln'),"S.m.state==='attack'&&S.m.atk==='frost'&&S.m.t>S.m.hits[0]-.05",'frost-breath');
    await p.evaluate(()=>{MH.S.h.state='idle';MH.S.h.freezeImm=0;MH.applyStatus('freeze');for(let i=0;i<6;i++)MH.update(1/60);});await shot('frost-frozen');
    await scene('frost',set('ember','ln'),mid('icicle'),'frost-icicle');
    await scene('storm',set('frost','db'),mid('clap'),'storm-clap');
    await scene('storm',set('frost','db'),"S.m.state==='attack'&&S.m.atk==='hover'&&S.m.t>S.m.hits[1]+.02",'storm-hover',400);
    await p.evaluate(()=>{MH.newHunt('storm');MH.S.m.charge=99.5;MH.S.m.wait=99;for(let i=0;i<40;i++)MH.update(1/60);});await shot('storm-overcharged');
    await p.evaluate(()=>{MH.newHunt('storm');for(let i=0;i<50;i++)MH.update(1/60);});await shot('storm-intro');
    await scene('tusk',set('fern','gs'),"S.m.mpoison>0&&S.h.sharp<25",'status-poison',900);
    await p.evaluate(()=>{MH.S.h.state='idle';MH.S.m.wait=99;MH.actSharpen();for(let i=0;i<30;i++)MH.update(1/60);});await shot('sharpening');
    await p.evaluate(()=>{MH.SAVE.dry.fern=1e4;MH.newHunt('fern');MH.S.m.hp=1;MH.S.m.evadeCd=99;MH.actTap('head');for(let i=0;i<400&&MH.S.mode==='hunt';i++)MH.update(1/60);MH.S.t=5.1;MH.SAVE.dry={};});await shot('rare-drop');
  }

  // ── camp, on a fresh save, with real taps ──
  await p.evaluate(()=>{localStorage.clear();});await p.reload();await p.waitForTimeout(200);
  const tapBtn=async id=>{const q=await p.evaluate(id=>{const b=MH.S.btns.find(b=>b.id===id);if(!b)return null;const r=document.getElementById('c').getBoundingClientRect();return{x:r.left+(b.x+b.w/2)/128*r.width,y:r.top+(b.y+b.h/2)/MH.LH*r.height};},id);
    if(!q)return false;await p.touchscreen.tap(q.x,q.y);await p.waitForTimeout(120);return true;};
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  ok(await p.evaluate(()=>MH.S.mode==='camp'&&MH.S.tab==='quest'&&MH.SAVE.potions===6&&!MH.SAVE.pal),'a tap on the title opens the camp on the story, with six potions and no companion yet');
  await shot('camp-quest-new');
  await tapBtn('tab:hunt');await shot('camp-hunt-locked');
  await tapBtn('exp:toggle');ok(await p.evaluate(()=>!MH.S.exp),'expeditions are locked before the first Fernwing');
  await tapBtn('hunt:tusk');ok(await p.evaluate(()=>MH.S.mode==='camp'),'the Tuskhide is locked on a fresh save');
  await tapBtn('tab:forge');ok(await p.evaluate(()=>MH.S.tab==='forge'),'the FORGE tab opens');
  ok(await p.evaluate(()=>MH.S.btns.some(b=>b.id==='forge:iron_ln')),'the forge opens on the starter gear');
  await tapBtn('forge:iron_ln');ok(await p.evaluate(()=>MH.SAVE.eq.weapon==='iron_ln'),'a starter weapon of another type can be equipped');await tapBtn('forge:iron_gs');
  await shot('camp-forge-starter');
  await tapBtn('page:next');ok(await p.evaluate(()=>MH.S.btns.some(b=>b.id==='forge:fern_gs')),'the next page shows the Fernwing gear');
  await tapBtn('forge:fern_gs');ok(await p.evaluate(()=>!MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='iron_gs'),'gear cannot be crafted without materials');
  await p.evaluate(()=>{Object.assign(MH.SAVE.bag,{scale:9,claw:4,horn:2,wing:1,spike:1});});await shot('camp-forge');
  await tapBtn('forge:fern_gs');
  ok(await p.evaluate(()=>MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='fern_gs'&&MH.SAVE.bag.scale===4&&MH.SAVE.bag.claw===2&&MH.SAVE.bag.horn===1),'crafting spends the materials and equips the gear');
  ok(await p.evaluate(()=>MH.gearStats().atk===1.3&&MH.gearStats().elem==='nature'),'the Fern Greatsword raises attack and carries its element');
  await tapBtn('forge:fern_ch');ok(await p.evaluate(()=>MH.SAVE.eq.charm==='fern_ch'&&MH.gearStats().qteSlow===1.4),'the Keen Eye Charm slows the circles');
  await p.evaluate(()=>{MH.S.fpage=MH.FORGE_PAGES.findIndex(g=>g.title==='COATINGS');MH.SAVE.bag.horn=1;MH.SAVE.bag.claw=4;});await p.waitForTimeout(80);await shot('camp-coatings');
  await tapBtn('forge:coat_poison');ok(await p.evaluate(()=>MH.SAVE.eq.coat==='coat_poison'&&MH.gearStats().status==='poison'&&MH.SAVE.bag.horn===0),'a coating can be crafted and worn');
  await tapBtn('forge:coat_poison');ok(await p.evaluate(()=>MH.SAVE.eq.coat===null),'and wiped off again');
  await p.evaluate(()=>{MH.S.fpage=1;MH.SAVE.bag.claw=2;MH.SAVE.bag.horn=0;});await p.waitForTimeout(80);
  await tapBtn('forge:fern_ch');ok(await p.evaluate(()=>MH.SAVE.eq.charm===null),'a worn charm can be taken off');await tapBtn('forge:fern_ch');
  ok(await tapBtn('up:fern_gs')&&await p.evaluate(()=>MH.lvOf('fern_gs')===1&&MH.SAVE.bag.scale===1&&MH.SAVE.bag.claw===1&&MH.SAVE.eq.weapon==='fern_gs'),'a tap on UP upgrades the weapon and spends materials');
  await shot('camp-forge-crafted');
  await p.reload();await p.waitForTimeout(200);
  ok(await p.evaluate(()=>MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='fern_gs'&&MH.SAVE.eq.charm==='fern_ch'&&MH.SAVE.bag.scale===1&&MH.lvOf('fern_gs')===1),'gear, upgrade levels and materials survive a reload');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  await tapBtn('tab:hunt');await tapBtn('hunt:fern');
  ok(await p.evaluate(()=>MH.S.mode==='prep'&&MH.S.prep.id==='fern'&&!MH.S.btns.some(b=>b.id==='prep:rnext')),'a tap on the Fernwing card opens the prep screen, with no companion yet');await shot('prep');
  await tapBtn('prep:mnext');ok(await p.evaluate(()=>MH.S.prep.meal===0),'the arrows pick a meal');await tapBtn('prep:start');
  ok(await p.evaluate(()=>MH.S.mode==='prep'),'a meal cannot be eaten without its ingredients');await tapBtn('prep:mprev');await tapBtn('prep:start');
  ok(await p.evaluate(()=>MH.S.mode==='hunt'&&MH.S.def.id==='fern'&&MH.S.h.atk===1.404&&Math.abs(MH.S.qteTime-.7)<1e-9),'START HUNT begins the hunt with the worn gear');

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
  ok(await p.evaluate(()=>{MH.manual=true;MH.SAVE.eq.charm='ember_ch';MH.SAVE.own.ember_ch=true;MH.newHunt('fern');const S=MH.S;for(let k=0;k<2;k++){S.qte={part:'head',t:0};const pp=MH.partPos('head',MH.mPose());MH.qteTap(pp.x,pp.y);}
    const r=S.m.parts.head.broken;MH.SAVE.eq.charm='fern_ch';delete MH.SAVE.own.ember_ch;MH.newHunt('fern');MH.manual=false;return r;}),'the Breaker Charm breaks a part in two hits');
  await quiet();
  const sbtn=await p.evaluate(()=>{MH.S.h.sharp=30;const r=document.getElementById('c').getBoundingClientRect(),q=MH.L.sharp;return{x:r.left+(q.x+q.w/2)/128*r.width,y:r.top+(q.y+q.h/2)/MH.LH*r.height};});
  await p.touchscreen.tap(sbtn.x,sbtn.y);await p.waitForTimeout(80);
  ok(await p.evaluate(()=>MH.S.h.state==='sharpen'),'a tap on the whetstone button starts sharpening');await p.waitForTimeout(1500);
  ok(await p.evaluate(()=>MH.S.h.sharp===100),'and the edge comes back');
  await quiet();await p.evaluate(()=>{MH.S.h.sharp=30;});
  await touch('touchStart',200,560);await touch('touchMove',202,600);await touch('touchMove',203,640);await touch('touchEnd');await p.waitForTimeout(80);
  ok(await p.evaluate(()=>MH.S.h.state==='sharpen'),'a swipe down sharpens too');await p.waitForTimeout(1500);
  await quiet();
  await p.evaluate(()=>{MH.S.h.hp=40;});
  await touch('touchStart',200,600);await touch('touchMove',202,560);await touch('touchMove',203,520);await touch('touchEnd');await p.waitForTimeout(900);
  ok(await p.evaluate(()=>MH.S.h.potions===2&&MH.SAVE.potions===5&&MH.S.h.hp===40+Math.round(MH.S.h.max*.4)),'a swipe up drinks a potion, from the three brought and the stock');
  await quiet();
  const cb=await p.evaluate(()=>{const S=MH.S;S.h.counter=1.4;S.slow=0;MH.manual=true;
    const r=document.getElementById('c').getBoundingClientRect(),c=MH.L.counter;return{x:r.left+(c.x+c.w/2)/128*r.width,y:r.top+(c.y+c.h/2)/MH.LH*r.height,d:S.stats.dealt};});
  await p.touchscreen.tap(cb.x,cb.y);
  ok(await p.evaluate(()=>MH.S.h.state==='counter'),'a tap on the COUNTER button starts a counter');
  await p.evaluate(()=>{for(let i=0;i<40;i++)MH.update(1/60);});
  ok(await p.evaluate(d=>MH.S.stats.dealt-d>=100&&MH.S.m.stun>=40,cb.d),'the counter lands a big hit and fills the stun meter');
  // win → loot → camp, with the Emberwing unlocked
  await p.evaluate(()=>{const S=MH.S;S.m.hp=1;S.m.state='idle';S.h.state='idle';MH.actTap('head');for(let i=0;i<400&&S.mode==='hunt';i++)MH.update(1/60);S.t=5;MH.manual=false;});
  ok(await p.evaluate(()=>MH.S.mode==='loot'&&MH.S.loot.unlock==='TUSKHIDE'&&MH.SAVE.wins.fern===1),'the first Fernwing win unlocks the Tuskhide');
  await shot('loot-unlock');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  ok(await p.evaluate(()=>MH.S.mode==='camp'&&MH.S.tab==='quest'),'a tap on the loot screen returns to camp, on the quests when the story has a reward waiting');await shot('camp-quest-claim');
  const pot0=await p.evaluate(()=>MH.SAVE.potions);await tapBtn('claim:story');
  ok(await p.evaluate(p0=>MH.SAVE.story.i===1&&MH.SAVE.potions===p0+2,pot0),'claiming the first chapter pays its reward and opens the next');
  // gather run with real taps
  await tapBtn('tab:hunt');await tapBtn('exp:toggle');ok(await p.evaluate(()=>MH.S.exp&&MH.S.btns.some(b=>b.id==='gather:fern')&&!MH.S.btns.some(b=>b.id==='gather:ember')),'expeditions open after the Fernwing, one biome per unlocked monster');await shot('camp-expeditions');
  await tapBtn('gather:fern');ok(await p.evaluate(()=>MH.S.mode==='gather'),'GATHER starts a gather run');
  await p.evaluate(()=>{MH.manual=true;const G=MH.S.g;G.nodes=[{x:40,y:MH.L.ground+30,id:'herb',rare:false,t:0,life:9},{x:90,y:MH.L.ground+50,id:'honey',rare:true,t:0,life:9}];G.bug={i:3,dir:1,x:64,y:60,t:.5};});await shot('gather');
  const gp=await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect(),G=MH.S.g,f=(x,y)=>({x:r.left+x/128*r.width,y:r.top+y/MH.LH*r.height});return[f(G.nodes[0].x,G.nodes[0].y),f(G.nodes[1].x,G.nodes[1].y),f(G.bug.x,G.bug.y),f(10,30)];});
  for(const q of gp)await p.touchscreen.tap(q.x,q.y);
  ok(await p.evaluate(()=>{const G=MH.S.g;return G.got.herb===1&&G.got.honey===1&&G.caught.length===1&&G.nodes.length===0&&!G.bug;}),'tapping collects what popped up and catches the creature, and a miss does nothing');
  const bag0=await p.evaluate(()=>MH.SAVE.bag.herb||0);
  await p.evaluate(()=>{const G=MH.S.g;G.spawn=1e9;G.bugT=1e9;for(let i=0;i<60*26&&MH.S.mode==='gather';i++)MH.update(1/60);MH.S.t=5;MH.manual=false;});
  ok(await p.evaluate(b=>MH.S.mode==='gres'&&MH.SAVE.bag.herb===b+1&&MH.SAVE.bag.honey>=1&&MH.SAVE.bugs.c03===1&&MH.S.g.fresh.length===1&&MH.SAVE.story.p===1,bag0),'the run ends on its timer, banks the haul and the catch, and moves the story on');await shot('gather-result');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);await tapBtn('claim:story');
  await tapBtn('tab:bugs');ok(await p.evaluate(()=>MH.bugBonus().hp===.006&&MH.bugBonus().atk===.006&&MH.gearStats().hp>100*1.005),'a rare creature in the terrarium adds a little health and attack');await shot('camp-terrarium');
  await tapBtn('tab:cook');await p.evaluate(()=>{MH.SAVE.bag.herb=7;MH.SAVE.bag.meat=2;});await p.waitForTimeout(80);await shot('camp-kitchen');const pk=await p.evaluate(()=>MH.SAVE.potions);await tapBtn('cook:brew');
  ok(await p.evaluate(k=>MH.SAVE.potions===k+1&&MH.SAVE.bag.herb===4,pk),'three herbs brew a potion');
  // a meal, eaten from the prep screen
  await tapBtn('tab:hunt');await tapBtn('hunt:fern');await tapBtn('prep:mnext');await p.waitForTimeout(80);await shot('prep-meal');await tapBtn('prep:start');
  ok(await p.evaluate(()=>MH.S.mode==='hunt'&&MH.S.h.max===Math.round(100*1.25*1.006)&&MH.SAVE.bag.meat===0&&MH.SAVE.bag.herb===2),'Hearty Stew costs its ingredients and adds a quarter more health for the hunt');
  await p.evaluate(()=>{MH.toCamp('hunt');});await p.waitForTimeout(100);
  await tapBtn('exp:toggle');await tapBtn('pack:fern');ok(await p.evaluate(()=>MH.S.mode==='prep'&&MH.S.prep.small===0),'PACK HUNT opens prep for a pack');await tapBtn('prep:start');
  ok(await p.evaluate(()=>MH.S.mode==='hunt'&&MH.S.def.small&&MH.S.pack===3),'and starts a hunt against three Snapjaws');
  await p.evaluate(()=>{MH.manual=true;for(let i=0;i<40;i++)MH.update(1/60);});await shot('pack-hunt');
  ok(await p.evaluate(()=>{const S=MH.S;S.h.inv=1e9;let t=0,seen=new Set();while(S.mode==='hunt'&&t<120){seen.add(S.pack);if(S.h.state==='idle')MH.actTap('head');MH.update(1/60);t+=1/60;}
    return S.mode==='loot'&&seen.size===3&&!S.qte&&S.loot.drops.some(d=>d.id==='meat')&&S.loot.drops.every(d=>d.id)&&MH.SAVE.packs===1&&(MH.SAVE.wins.fern||0)===1&&t<60;}),'the pack falls one after another and pays in meat and common materials');
  await p.evaluate(()=>{MH.S.t=5;MH.manual=false;});await p.touchscreen.tap(195,400);await p.waitForTimeout(150);await tapBtn('tab:hunt');await shot('camp-hunt');
  await tapBtn('hunt:tusk');await tapBtn('prep:start');ok(await p.evaluate(()=>MH.S.mode==='hunt'&&MH.S.def.id==='tusk'&&MH.S.m.max===MH.MONSTERS.tusk.hp),'the Tuskhide hunt now starts');
  await p.setViewportSize({width:1280,height:720});await p.waitForTimeout(150);
  ok(await p.evaluate(()=>{const r=document.getElementById('c').getBoundingClientRect();return r.height<=innerHeight+1&&r.width<=innerWidth&&r.height>innerHeight*.9;}),'the canvas fits a desktop window');
  await p.evaluate(()=>{MH.toCamp('forge');MH.S.fpage=2;});await p.waitForTimeout(150);await shot('camp-forge-short');
  ok(await p.evaluate(()=>MH.S.btns.filter(b=>b.id.startsWith('forge:')).length===6&&MH.S.btns.filter(b=>b.id.startsWith('forge:')).every(b=>b.y+b.h<=MH.LH-20)),'a full forge page fits the shortest screen');
  await p.evaluate(()=>{MH.toCamp('hunt');});await p.waitForTimeout(150);await shot('camp-hunt-short');
  ok(await p.evaluate(()=>MH.S.btns.filter(b=>b.id.startsWith('hunt:')).length===5&&MH.S.btns.filter(b=>b.id.startsWith('hunt:')).every(b=>b.y+b.h<=MH.LH-20)),'all five hunts fit the shortest screen');
  ok(await p.evaluate(()=>{const v={bag:{scale:2},own:{iron:true,fblade:true,keen:true},eq:{weapon:'fblade',armor:'leather',charm:'keen'},wins:{fern:2,ember:1}};localStorage.setItem('mh_save_v1',JSON.stringify(v));const s=MH.loadSave();
    return s.eq.weapon==='fern_gs'&&s.eq.charm==='fern_ch'&&s.own.fern_gs&&s.own.iron_hm&&!s.own.fblade&&s.bag.scale===2;}),'a save from the last version keeps its gear under the new names');
  ok(await p.evaluate(()=>{MH.manual=true;const S=MH.SAVE;S.story={i:5,p:0};S.pal=false;S.wins.tusk=1;Object.assign(S.eq,{weapon:'iron_gs',armor:'leather',charm:null,coat:null});
    MH.newHunt('ember',{role:'fighter'});const noPal=!MH.S.pal;MH.S.m.hp=1;MH.S.m.evadeCd=1e9;MH.actTap('head');for(let i=0;i<400&&MH.S.mode==='hunt';i++)MH.update(1/60);
    const q=MH.quests()[0];const ready=q.kind==='story'&&q.st.p===1;MH.claim(q);return noPal&&ready&&S.pal===true&&S.story.i===6;}),'beating the Emberwing in the story is what brings the companion');
  ok(await p.evaluate(()=>{MH.SAVE.potions=9;MH.newHunt('fern',{role:'fighter'});const S=MH.S,m=S.m;m.wait=1e9;m.evadeCd=1e9;m.qteT=1e9;for(let i=0;i<60*10;i++)MH.update(1/60);const f=S.stats.pal;
    MH.newHunt('fern',{role:'healer'});const T=MH.S;T.m.wait=1e9;T.h.hp=30;for(let i=0;i<30;i++)MH.update(1/60);const healed=T.h.hp===60;T.h.hp=20;for(let i=0;i<30;i++)MH.update(1/60);const once=T.h.hp===20;
    MH.newHunt('fern',{role:'rest'});return f===60&&healed&&once&&!MH.S.pal;}),'Pip the fighter chips in every three seconds, the healer heals once, and a resting Pip stays home');
  ok(await p.evaluate(()=>{const loot=role=>{let n=0;for(let k=0;k<200;k++){MH.newHunt('fern',{role});const d=MH.rollLoot().drops;n+=d.find(x=>x.id==='scale').n+(d.find(x=>x.id==='herb')||{n:0}).n;}return n/200;};return Math.abs(loot('gatherer')-loot('rest')-3)<.3;}),'Pip the gatherer brings back one more of each common drop and two herbs');
  ok(await p.evaluate(()=>{const S=MH.SAVE;S.side={};S.wins.fern=1;MH.fakeNow=Date.UTC(2027,0,4,12);MH.ensureQuests();const d1=JSON.stringify(S.daily.q.map(q=>q.k)),w1=S.weekly.key;
    const n=S.daily.q.length,uniq=new Set(S.daily.q.map(q=>q.k)).size;MH.qEvent('hunt','fern');MH.qEvent('gather');MH.qEvent('break',null,2);MH.qEvent('perfect',null,3);MH.qEvent('catch',null,1);MH.qEvent('small');MH.qEvent('meal');MH.qEvent('fast');
    const moved=S.daily.q.some(q=>q.p>0);MH.ensureQuests();const same=JSON.stringify(S.daily.q.map(q=>q.k))===d1&&S.daily.q.some(q=>q.p>0);
    MH.fakeNow=Date.UTC(2027,0,5,12);MH.ensureQuests();const reset=S.daily.q.every(q=>q.p===0)&&S.weekly.key===w1;MH.fakeNow=Date.UTC(2027,0,12,12);MH.ensureQuests();const wk=S.weekly.key!==w1;MH.fakeNow=0;
    return n===3&&uniq===3&&moved&&same&&reset&&wk&&S.weekly.q.length===1;}),'three different dailies are set each day and one weekly each week, and progress resets with them');
  ok(await p.evaluate(()=>{const S=MH.SAVE;S.side={};const q=()=>MH.quests().find(x=>x.kind==='side'&&x.def.id==='hammer');MH.qEvent('weapon','gs');const no=q().st.p===0;MH.qEvent('weapon','hm');MH.qEvent('weapon','hm');MH.qEvent('weapon','hm');
    const full=q().st.p===2,h0=S.bag.herb||0;MH.claim(q());MH.claim(q());return no&&full&&S.bag.herb===h0+5&&q().st.c;}),'a side quest counts only what it asks for, stops at its goal and pays out once');
  ok(await p.evaluate(()=>{const txt=[...MH.STORY.map(s=>[s.t,...s.d,MH.goalText(s.goal)]).flat(),...MH.SIDES.map(s=>MH.goalText(s.goal)),...MH.DAILIES.map(s=>MH.goalText(s.goal)),...Object.values(MH.MEALS).map(m=>m.desc),...Object.values(MH.MONSTERS).map(m=>m.tip)];
    const w=t=>{let n=-1;for(const ch of t)n+=(ch==='M'||ch==='W'?5:3)+1;return n;};const long=txt.filter(t=>w(t)>117);return long.length?long.join(' | '):true;}),'every line of story, quest, meal and tip text fits the screen');
  ok(await p.evaluate(()=>{MH.newHunt('ember',{meal:'tonic'});MH.S.m.wait=1e9;MH.applyStatus('burn');const a=MH.S.h.burn===0;MH.applyStatus('poison');const b=MH.S.h.poison>0;
    MH.newHunt('fern',{meal:'fish'});const S=MH.S;S.m.evadeCd=1e9;S.m.wait=1e9;S.m.qteT=1e9;S.h.inv=1e9;let t=0;while(S.h.sharp>=MH.SHARP.lo&&t<120){MH.actTap('body');MH.update(1/60);t+=1/60;}return a&&b&&t>35&&t<70;}),'Cool Tonic stops burning only, and Grilled Icefish makes the edge last twice as long');
  await p.setViewportSize({width:1280,height:720});await p.waitForTimeout(150);
  for(const tab of ['cook','quest','bugs']){await p.evaluate(t=>{MH.SAVE.story={i:0,p:0};MH.toCamp(t);},tab);await p.waitForTimeout(120);await shot('short-'+tab);}
  await p.evaluate(()=>{MH.SAVE.pal=true;MH.toPrep('storm');});await p.waitForTimeout(120);await shot('short-prep');
  ok(await p.evaluate(()=>MH.S.btns.every(b=>b.y>=-2&&b.y+b.h<=MH.LH+2)&&MH.S.btns.some(b=>b.id==='prep:rnext')),'the prep screen, companion included, fits the shortest screen');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  await b.close();process.exit(fail?1:0);
})();
