// Headless test: node tools/check.js [screenshot folder]   (needs Playwright)
// Bots play whole hunts on a fake clock, the rules are checked one by one, then the camp is driven with real taps.
const {chromium}=require('playwright'); const path=require('path');
const shots=process.argv[2];
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:390,height:780},hasTouch:true,isMobile:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(200);
  let fail=0;const ok=(c,msg)=>{console.log((c===true?'ok   ':'FAIL ')+msg+(c===true||c===false?'':' -> '+c));if(c!==true)fail++;};
  const shot=async n=>{if(shots){await p.waitForTimeout(80);await p.screenshot({path:shots+'/'+n+'.png'});}};
  const ev=(f,a)=>p.evaluate(f,a);
  await shot('title');
  await ev(()=>{MH.manual=true;for(const k in MH.GEAR)MH.SAVE.own[k]=true;window.EQ=(w,ar,ch)=>{Object.assign(MH.SAVE.eq,{weapon:w||'iron_gs',armor:ar||'leather',charm:ch||null});MH.SAVE.lv={};MH.SAVE.potions=99;};
    // a quiet hunt for measuring: the monster does nothing and cannot dodge
    window.QUIET=(mon,o)=>{MH.newHunt(mon,o);const S=MH.S,m=S.m;m.evadeCd=1e9;m.wait=1e9;m.qteT=1e9;S.h.inv=1e9;return S;};
    window.RUN=n=>{for(let i=0;i<n;i++)MH.update(1/60);};});

  // ── the roster ──
  ok(await ev(()=>{const M=MH.MONSTERS,H=MH.HUNTS,by=r=>H.filter(id=>M[id].rank===r).length;
    return H.length===35&&[1,2,3,4,5,6].every(r=>by(r)===5)&&by(7)===4&&by(8)===1&&M.star.rank===8;}),'35 monsters: six ranks of five, four apex monsters and the elder');
  ok(await ev(()=>{const M=MH.MONSTERS,bad=[];for(const id of MH.HUNTS){const D=M[id];if(!!D.wElem===!!D.wStatus)bad.push(id+' weapon');if(D.weakSt===D.resSt)bad.push(id+' status');if(D.weak===D.elem)bad.push(id+' weak');
      for(const a of D.moves)if(!MH.ATTACKS[a])bad.push(id+' move '+a);if(D.inflict&&!D.moves.some(a=>MH.ATTACKS[a].st))bad.push(id+' inflict');for(const wt of ['gs','db','hm','ln']){const G=MH.GEAR[id+'_'+wt];if(!!G.elem===!!G.status)bad.push(id+' gear');}}
    return bad.length?bad.join(', '):true;}),'every monster has valid moves, a weakness that is not its own element, and weapons that carry an element or a status, never both');
  ok(await ev(()=>{const M=MH.MONSTERS,H=MH.HUNTS,el=new Set(H.map(id=>M[id].wElem).filter(Boolean)),st=new Set(H.map(id=>M[id].wStatus).filter(Boolean)),wk=new Set(H.map(id=>M[id].weak)),ws=new Set(H.map(id=>M[id].weakSt));
    return el.size===7&&st.size===4&&wk.size===7&&ws.size===4;}),'all seven elements and four statuses can be forged, and each is some monster\'s weakness');
  ok(await ev(()=>{const sets=MH.HUNTS.map(id=>[...new Set(MH.MONSTERS[id].moves)].sort().join(',')),looks=MH.HUNTS.map(id=>{const D=MH.MONSTERS[id];return D.rig+D.look.b+D.look.u;});
    return new Set(sets).size===35&&new Set(looks).size===35&&new Set(MH.HUNTS.map(id=>MH.MONSTERS[id].rig)).size===5;}),'no two monsters share a move set or a look, across five body types');
  ok(await ev(()=>{const M=MH.MONSTERS,H=MH.HUNTS;for(let i=1;i<30;i++){const a=M[H[i-1]],c=M[H[i]];if(c.dmg<a.dmg||c.qteTime>a.qteTime||MH.GEAR[H[i]+'_gs'].atk<=MH.GEAR[H[i-1]+'_gs'].atk)return H[i];}
    const top=M[H[29]],ap=H.slice(30,34).map(id=>M[id]),el=M.star;return ap.every(a=>a.hp>top.hp*1.3&&a.hp<el.hp&&a.dmg>top.dmg&&a.dmg<el.dmg)||'apex';}),'monsters and their gear get stronger down the order; apex monsters sit well above rank 6 and below the elder');
  ok(await ev(()=>{const w=t=>{let n=-1;for(const ch of t)n+=(ch==='M'||ch==='W'?5:3)+1;return n;};const long=[];
    for(const id of MH.HUNTS){const D=MH.MONSTERS[id];for(const t of [D.tip,D.tip2])if(w(t)>119)long.push(t);if(w(D.name)>74)long.push(D.name);for(const k of ['gs','db','hm','ln','ar','ch','pw','pa'])if(w(MH.GEAR[id+'_'+k].name)>76)long.push(MH.GEAR[id+'_'+k].name);
      for(const k in D.matName)if(w(D.matName[k])>70)long.push(D.matName[k]);}
    for(const t of [...MH.STORY.map(s=>[s.t,...s.d,MH.goalText(s.goal)]).flat(),...MH.SIDES.map(s=>MH.goalText(s.goal)),...MH.DAILIES.map(s=>MH.goalText(s.goal)),...Object.values(MH.MEALS).map(m=>m.desc)])if(w(t)>117)long.push(t);
    for(const r of Object.values(MH.ROLES))if(w(r[1])>90)long.push(r[1]);
    for(const id in MH.GEAR){const G=MH.GEAR[id];if(G.slot==='armor'&&G.perk){const t='HP '+Math.round(G.hp*1.4)+'  ';if(19+w(t)+4+w(MH.PERKS[G.perk].desc)>125)long.push(MH.PERKS[G.perk].desc);}if(G.slot==='charm'&&19+w(MH.PERKS[G.perk].desc)>96)long.push(MH.PERKS[G.perk].desc);}
    return long.length?[...new Set(long)].join(' | '):true;}),'every name, tip, story line and quest line fits the screen');
  ok(await ev(()=>{EQ();for(const id of MH.HUNTS)for(const a of new Set(MH.MONSTERS[id].moves)){MH.newHunt(id);const S=MH.S,m=S.m,D=MH.MONSTERS[id];S.h.hp=S.h.max=1e7;m.evadeCd=1e9;m.qteT=1e9;S.timeLeft=1e9;
      const pool=D.pools,tr=D.trait;D.pools=[[a],[a],[a]];D.trait=null;m.wait=0;let t=0,moved=false;const p0=JSON.stringify(MH.mPose());
      while(t<8&&m.state!=='recover'){MH.update(1/60);t+=1/60;if(m.state==='attack'&&JSON.stringify(MH.mPose())!==p0)moved=true;}D.pools=pool;D.trait=tr;
      if(m.state!=='recover'||!moved||S.stats.taken<=0)return id+':'+a;}return true;}),'every move of every monster animates, lands its hits and ends');

  // ── bots ──
  // skill: chance to dodge each incoming hit and to tap each weak point. It counters, sharpens, drinks, rolls out fire and taps out of ice.
  const bot=(monster,eq,skill)=>ev(({monster,eq,skill})=>{
    EQ(eq.weapon,eq.armor,eq.charm);MH.newHunt(monster);const S=MH.S;let t=0,decided='',will=false,qdec=null;
    while(S.mode==='hunt'&&t<600){
      const m=S.m,h=S.h;
      if(m.state==='attack'&&m.hi<m.hits.length){const d=m.hits[m.hi]-m.t,key=m.hi+':'+m.atk+':'+m.hits[0];if(decided!==key){decided=key;will=Math.random()<skill;}
        if(will&&d<.15&&d>0&&h.state!=='dodge'&&h.state!=='counter')MH.actDodge(-1);}
      if(S.qte&&S.qte.t>S.qteTime*.55&&qdec!==S.qte){qdec=S.qte;if(Math.random()<skill){const pp=MH.partPos(S.qte.part,MH.mPose());MH.qteTap(pp.x,pp.y);}}
      if(skill>.5&&h.counter>0&&h.state!=='counter')MH.actCounter();
      if(h.state==='frozen')MH.actTap('head');
      const calm=m.state!=='attack'&&m.state!=='idle';
      if((h.burn>0||h.mud>0||h.stench>0)&&skill>.5&&h.st>70&&h.state==='idle'&&m.state!=='attack')MH.actDodge(-1);
      if(h.sharp<25&&h.state==='idle'&&calm)MH.actSharpen();
      if(h.hp<h.max*.5&&h.potions>0&&h.stench<=0&&h.state==='idle'&&m.state!=='attack')MH.actPotion();
      else if(h.state==='idle'&&m.state!=='shell'&&!(h.bleed>0&&h.hp<h.max*.3))MH.actTap('head');
      MH.update(1/60);t+=1/60;
    }
    return{win:S.mode==='loot',time:MH.MONSTERS[monster].time-S.timeLeft,stats:S.stats,breaks:['head','wings','tail'].filter(k=>S.m.parts[k].broken),loot:S.loot&&S.loot.drops,fail:S.fail,mhp:Math.round(S.m.hp/S.m.max*100)};
  },{monster,eq,skill});
  const avg=a=>a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):0;
  const trial=async(label,monster,eq,skill,n)=>{const runs=[];for(let i=0;i<(n||6);i++)runs.push(await bot(monster,eq,skill));const wins=runs.filter(r=>r.win);
    console.log(`     ${label}: ${wins.length}/${runs.length} wins, ${avg(wins.map(r=>r.time))}s, damage taken ${avg(runs.map(r=>r.stats.taken))}, counters ${avg(runs.map(r=>r.stats.counters))}, stuns ${avg(runs.map(r=>r.stats.stuns))}, parts ${(runs.reduce((s,r)=>s+r.breaks.length,0)/runs.length).toFixed(1)}${wins.length<runs.length?', monster left at '+avg(runs.filter(r=>!r.win).map(r=>r.mhp))+'%':''}`);
    return{runs,wins,time:avg(wins.map(r=>r.time))};};
  const set=(t,wt)=>({weapon:t+'_'+(wt||'gs'),armor:t==='iron'?'leather':t+'_ar',charm:null});
  console.log('  Fernwing, starter greatsword');
  let r=await trial('skilled','fern',set('iron'),.95);
  ok(r.wins.length===6,'a skilled bot always beats the Fernwing');ok(r.time>30&&r.time<60,'that hunt takes under a minute ('+r.time+'s)');
  ok(r.wins.every(x=>x.breaks.length>=1)&&r.wins.every(x=>x.stats.counters>0&&x.stats.stuns>0)&&r.wins.every(x=>x.stats.evaded>0),'it breaks parts, counters, stuns, and the monster dodges some hits');
  ok(r.wins.every(x=>x.breaks.every(k=>x.loot.some(d=>d.id==={head:'horn',wings:'wing',tail:'spike'}[k]))),'broken parts drop their loot');
  await trial('average','fern',set('iron'),.7);await trial('casual','fern',set('iron'),.45);
  r=await trial('never dodges','fern',set('iron'),0);ok(r.wins.length<=1,'never dodging loses the hunt');
  console.log('  Each weapon type against the Fernwing (average bot)');
  for(const wt of ['gs','db','hm','ln']){r=await trial(wt,'fern',set('iron',wt),.7);ok(r.wins.length>=5&&r.time>30&&r.time<75,'the iron '+wt+' wins in about a minute ('+r.time+'s)');}
  console.log('  The ladder: each monster in the gear of the one before it (average bot, 3 hunts each)');
  const order=await ev(()=>MH.HUNTS.map(id=>({id,rank:MH.MONSTERS[id].rank,time:MH.MONSTERS[id].time})));const weak=[],slow=[];
  for(let i=1;i<order.length;i++){const o=order[i],n=o.rank===8?8:3,res=await trial(o.id+' (rank '+o.rank+') in '+order[i-1].id+' gear',o.id,set(order[i-1].id),.7,n);
    if(res.wins.length<Math.ceil(n*2/3))weak.push(o.id);if(res.wins.length&&res.time>o.time*.75)slow.push(o.id+' '+res.time+'s');}
  ok(weak.length===0||weak.join(', '),'every monster can be beaten in the gear of the one before it');
  ok(slow.length===0||slow.join(', '),'and none of those hunts runs close to its time limit');
  r=await trial('the elder in its own gear, skilled','star',set('star'),.95,3);ok(r.wins.length>=2,'the Hollow Star falls to a skilled hunter in the best gear');
  r=await trial('the elder in rank 3 gear, no element or status edge','star',set('plume'),.7,8);ok(r.wins.length<=2,'and not to one in rank 3 gear');

  // ── weapons ──
  const dps=await ev(()=>{const out={};for(const wt of ['gs','db','hm','ln']){EQ('iron_'+wt);const S=QUIET('fern'),m=S.m;m.hp=m.max=1e9;m.stunMax=1e9;S.timeLeft=1e9;let hits=0,last=0;for(let i=0;i<60*30;i++){MH.actTap('body');MH.update(1/60);if(S.stats.dealt!==last){hits++;last=S.stats.dealt;}}
    out[wt]={dps:S.stats.dealt/30,rate:hits/30};}return out;});
  console.log('     tap damage per second: '+Object.entries(dps).map(([k,v])=>k+' '+v.dps.toFixed(1)+' ('+v.rate.toFixed(1)+' hits/s)').join(', '));
  const dv=Object.values(dps).map(v=>v.dps);ok(Math.max(...dv)/Math.min(...dv)<1.06,'all four weapon types deal the same tap damage per second, within 6%');
  ok(dps.db.rate>dps.ln.rate&&dps.ln.rate>dps.gs.rate&&dps.gs.rate>dps.hm.rate&&dps.db.rate/dps.hm.rate>2.5,'dual blades hit fastest, then lance, greatsword, hammer');
  // average damage of one tap, for comparing rules. sharp and state can be forced.
  await ev(()=>{window.HIT=(mon,o)=>{o=o||{};let n=0;const N=o.n||40;for(let k=0;k<N;k++){const S=QUIET(mon,o.hunt),m=S.m;S.h.sharp=o.sharp==null?50:o.sharp;if(o.state){m.state=o.state;m.t=0;m.rec=99;m.staggerDur=99;m.atk=m.atk||'bite';}if(o.pre)o.pre(S);
    MH.actTap(o.part||'body');RUN(16);n+=S.stats.dealt;}return n/N;};});
  ok(await ev(()=>{EQ('tusk_gs');const a=HIT('temp'),b=HIT('fern');return Math.abs(a/b-1.25)<.05;}),'an element weapon does 25% more to a monster weak to it');
  ok(await ev(()=>{EQ();const k=HIT('storm',{sharp:100}),m=HIT('storm',{sharp:50}),d=HIT('storm',{sharp:10});return Math.abs(k/m-1.1)<.03&&Math.abs(d/m-.75)<.03;}),'a keen edge hits 10% harder and a dull one 25% softer');
  ok(await ev(()=>{EQ();const S=QUIET('storm'),h=S.h;let t=0;while(h.sharp>=MH.SHARP.lo&&t<60){MH.actTap('body');MH.update(1/60);t+=1/60;}
    const wore=t>15&&t<35;h.state='idle';MH.actSharpen();const busy=h.state==='sharpen';RUN(90);const done=h.sharp===100&&h.state==='idle';
    h.sharp=40;MH.actSharpen();h.inv=0;S.m.wait=0;let u=0;while(h.state==='sharpen'&&u<4){MH.update(1/60);u+=1/60;}return wore&&busy&&done&&h.sharp===40&&h.state!=='sharpen';}),'the edge dulls in about 25 seconds of hitting, sharpening restores it, and a hit interrupts it');
  ok(await ev(()=>{const run=(w,mon)=>{EQ(w);const S=QUIET(mon||'gust'),m=S.m;m.hp=m.max=1e7;let st=0,pz=0,sl=0;for(let i=0;i<60*25;i++){S.h.sharp=50;if(m.state!=='sleep')MH.actTap('body');MH.update(1/60);if(m.state==='stagger')st++;if(m.mpoison>0)pz++;if(m.state==='sleep')sl++;}
      return{procs:S.stats.procs||0,sd:S.stats.statusDmg||0,st,pz,sl};};
    const po=run('bog_gs'),bl=run('cinder_gs'),pa=run('dust_gs'),sp=run('quill_gs','ember'),no=run('fern_gs'),g=MH.GEAR;
    return po.procs>=2&&po.sd>0&&po.pz>0&&bl.procs>=2&&bl.sd>=2*150&&pa.procs>=1&&pa.st>100&&sp.procs>=1&&sp.sl>10&&no.procs===0&&g.bog_gs.status==='poison'&&!g.bog_gs.elem&&g.fern_gs.elem==='nature'&&!g.fern_gs.status;}),
    'poison, blast, paralysis and sleep weapons each trigger their effect, and element weapons build no status');
  ok(await ev(()=>{const first=(w,mon)=>{EQ(w);const S=QUIET(mon),m=S.m;m.hp=m.max=1e7;let i=0;while(!S.stats.procs&&i<60*90){S.h.sharp=50;MH.actTap('body');MH.update(1/60);i++;}return i/60;};
    const wk=first('bog_gs','tusk'),plain=first('bog_gs','ember'),res=first('bog_gs','fern');return Math.abs(plain/wk-1.5)<.15&&Math.abs(res/plain-2)<.2||[wk,plain,res].join(',');}),'a status builds 50% faster on a monster weak to it and half as fast on one that resists it');
  ok(await ev(()=>{EQ();const a=HIT('ember',{n:30,pre:S=>{S.m.state='sleep';S.m.t=0;}}),b=HIT('ember',{n:30});const S=QUIET('ember');S.m.state='sleep';MH.actTap('body');RUN(16);return S.m.state!=='sleep'&&Math.abs(a/b-2.5)<.2;}),'the hit that wakes a sleeping monster does 2.5 times the damage');
  ok(await ev(()=>{const S0=MH.SAVE;EQ('fern_gs','fern_ar');S0.bag={scale:99,claw:99,horn:9,wing:9,spike:9,quill_scale:99,rare:2};
    const c1=JSON.stringify(MH.upCost('fern_gs'));MH.upgradeTap('fern_gs');const a1=MH.gearStats().atk,sc=S0.bag.scale;for(let i=0;i<9;i++)MH.upgradeTap('fern_gs');for(let i=0;i<9;i++)MH.upgradeTap('fern_ar');const g=MH.gearStats();
    const r=c1==='{"scale":3,"claw":1}'&&Math.abs(a1-1.404)<1e-6&&sc===96&&MH.lvOf('fern_gs')===5&&Math.abs(g.atk-1.82)<1e-6&&g.hp===196&&MH.upCost('fern_gs')===null&&S0.bag.quill_scale===99-12&&S0.bag.rare===0;
    S0.lv={fern_gs:4};S0.bag={scale:99,claw:99,horn:9,wing:9,quill_scale:99};MH.upgradeTap('fern_gs');const noRare=MH.lvOf('fern_gs')===4;S0.lv={};S0.bag={};MH.upgradeTap('fern_gs');return r&&noRare&&MH.lvOf('fern_gs')===0&&MH.upCost('fern_ch')===null;}),
    'upgrades cost materials, add 8% a level and stop at +5; the last levels need the next monster\'s scales and the rare drop; charms have no levels');
  ok(await ev(()=>{const taken=ar=>{let n=0;for(let k=0;k<12;k++){EQ('iron_gs',ar);MH.newHunt('ember');const S=MH.S,m=S.m;m.wait=0;m.qteT=99;let t=0;while(S.stats.taken===0&&t<6){MH.update(1/60);t+=1/60;}n+=S.stats.taken/Math.round(MH.ATTACKS[m.atk].dmg*MH.MONSTERS.ember.dmg);}return n/12;};
    const a=taken('ember_ar'),c=taken('frost_ar');return Math.abs(a-.75)<.06&&Math.abs(c-1)<.02||a+','+c;}),'armor takes 25% less from its own monster\'s element');
  ok(await ev(()=>{EQ('ember_gs','mud_ar','relic_weak');const g=MH.gearStats();return g.elem==='fire'&&Math.abs(g.atk-1.66*1.1)<1e-6&&g.perks.might&&g.perks.weakspot&&g.hp===156;}),'gear adds up: element, attack with Might, health, perks');
  ok(await ev(()=>{EQ('iron_gs','leather','dust_ch');MH.newHunt('fern');const a=MH.S.h.potions;EQ();MH.SAVE.potions=2;MH.newHunt('fern');return a===4&&MH.S.h.potions===2;}),'three potions come on a hunt, four with Herbalist, and never more than are in stock');
  ok(await ev(()=>{EQ('iron_gs','leather','mud_ch');MH.newHunt('fern');const S=MH.S;for(let k=0;k<2;k++){S.qte={part:'head',t:0};const pp=MH.partPos('head',MH.mPose());MH.qteTap(pp.x,pp.y);}return S.m.parts.head.broken;}),'the Breaker Charm breaks a part in two hits');
  ok(await ev(()=>{EQ('iron_ln');MH.newHunt('fern');const S=MH.S,m=S.m;m.evadeCd=99;m.wait=0;m.qteT=99;MH.update(1/60);Object.assign(MH.IN,{down:true,swiped:false,downAt:-9});let t=0;while(m.state==='attack'&&m.hi===0&&t<3){S.h.state='guard';S.h.t=1;MH.update(1/60);t+=1/60;}
    const chip=S.stats.guards===1&&S.stats.taken>0&&S.stats.taken<=4&&S.h.st<100&&S.h.state!=='hurt';
    MH.IN.down=false;MH.newHunt('fern');const T=MH.S.m;T.evadeCd=99;T.wait=0;T.qteT=99;MH.update(1/60);t=0;while(T.state==='attack'&&T.hi===0&&t<3){if(T.hits[0]-T.t<.1&&MH.S.h.state!=='guard'){Object.assign(MH.IN,{down:true,swiped:false,downAt:MH.S.clock-1});MH.S.h.state='guard';MH.S.h.t=0;}MH.update(1/60);t+=1/60;}MH.IN.down=false;
    return chip&&MH.S.h.counter>0&&MH.S.stats.taken===0;}),'a lance guard blocks for chip damage and stamina, and one raised just in time is perfect and opens a counter');
  ok(await ev(()=>{EQ();const roll=(breaks,dry)=>{let n=0;for(let i=0;i<4000;i++){MH.SAVE.dry.fern=dry;MH.newHunt('fern');for(const k of ['head','wings','tail'].slice(0,breaks))MH.S.m.parts[k].broken=true;if(MH.rollLoot().drops.some(d=>d.id==='rare'))n++;}return n/4000;};
    const a=roll(0,0),c=roll(3,0),d=roll(0,20);MH.SAVE.bag={};MH.SAVE.wins={};MH.SAVE.dry={};MH.SAVE.side={};return a>.015&&a<.05&&c>.09&&c<.15&&d>.1&&d<.16;}),'the rare drop is about 3%, 12% with every part broken, and creeps up over a dry streak');

  // ── what monsters do to the hunter ──
  ok(await ev(()=>{EQ();const S=QUIET('fern'),h=S.h;h.inv=0;MH.applyStatus('poison');const hp0=h.hp;RUN(120);const lost=hp0-h.hp;h.state='idle';MH.actPotion();RUN(60);const cured=h.poison===0;h.hp=3;MH.applyStatus('poison');RUN(600);
    return lost>=4&&lost<=8&&cured&&h.hp===1&&h.state!=='dead';}),'poison drains health, a potion cures it, and it cannot land the killing blow');
  ok(await ev(()=>{const S=QUIET('ember'),h=S.h;MH.applyStatus('burn');const hp0=h.hp;RUN(60);const lost=hp0-h.hp;MH.actDodge(-1);RUN(40);const half=h.burn>0;MH.actDodge(-1);RUN(40);return lost>=2&&half&&h.burn===0;}),'burning drains health and two rolls put it out');
  ok(await ev(()=>{const S=QUIET('frost'),h=S.h;MH.applyStatus('freeze');const fr=h.state==='frozen';MH.actDodge(-1);const still=h.state==='frozen';let taps=1;while(h.state==='frozen'&&taps<20){MH.actTap('head');MH.update(1/60);taps++;}MH.applyStatus('freeze');
    return fr&&still&&taps>=5&&taps<=8&&h.state!=='frozen';}),'being frozen locks the hunter until enough taps break the ice, then gives a breather');
  ok(await ev(()=>{const S=QUIET('tide'),h=S.h;h.st=0;RUN(60);const dry=h.st;h.st=0;MH.applyStatus('wet');RUN(60);return Math.abs(h.st/dry-.4)<.05&&h.wet>0;}),'soaked: stamina returns at 40% speed');
  ok(await ev(()=>{EQ('tusk_gs');const a=HIT('temp'),c=HIT('temp',{pre:S=>MH.applyStatus('blight')});EQ('bog_gs');const S=QUIET('gust');S.m.hp=S.m.max=1e7;MH.applyStatus('blight');for(let i=0;i<60*6;i++){S.h.sharp=50;MH.actTap('body');MH.update(1/60);}
    return Math.abs(a/c-1.25)<.05&&!S.stats.procs&&S.m.sb===0;}),'blight switches off the weapon\'s element bonus and its status build-up');
  ok(await ev(()=>{EQ();const S=QUIET('quill'),h=S.h;h.inv=0;MH.applyStatus('bleed');const hp0=h.hp;for(let i=0;i<120;i++){MH.actTap('body');MH.update(1/60);}const lost=hp0-h.hp,on=h.bleed>0;h.state='idle';h.buf=0;const hp1=h.hp;RUN(100);
    return lost>=4&&on&&h.bleed===0&&hp1-h.hp<=2;}),'bleeding hurts only while acting, and standing still for a moment stops it');
  ok(await ev(()=>{const S=QUIET('mire'),h=S.h;h.hp=40;MH.applyStatus('stench');MH.actPotion();const blocked=h.state!=='drink'&&h.potions===3;MH.actDodge(-1);RUN(40);const half=h.stench>0;MH.actDodge(-1);RUN(40);h.state='idle';MH.actPotion();
    return blocked&&half&&h.stench===0&&h.state==='drink';}),'stench blocks potions until two rolls air it out');
  ok(await ev(()=>{const S=QUIET('dust'),h=S.h;MH.applyStatus('numb');const st=h.state==='numb';MH.actTap('body');MH.actDodge(-1);MH.actPotion();MH.actSharpen();const stuck=h.state==='numb';RUN(100);MH.applyStatus('numb');return st&&stuck&&h.state==='idle';}),'numbed: the hunter cannot act for a moment, then is safe from it for a while');
  ok(await ev(()=>{const S=QUIET('mud'),h=S.h;MH.applyStatus('mud');MH.actDodge(-1);const cost=100-h.st;RUN(40);return Math.abs(cost-45)<.01&&h.mud===0;}),'mud makes the next roll cost 80% more, and that roll shakes it off');
  ok(await ev(()=>{const S=QUIET('ember',{meal:'tonic'});MH.applyStatus('burn');const a=S.h.burn===0;MH.applyStatus('poison');const c=S.h.poison>0;EQ();const T=QUIET('fern',{meal:'fish'});let t=0;while(T.h.sharp>=MH.SHARP.lo&&t<120){MH.actTap('body');MH.update(1/60);t+=1/60;}
    return a&&c&&t>35&&t<70;}),'Cool Tonic stops burning only, and Grilled Icefish makes the edge last twice as long');

  // ── traits ──
  ok(await ev(()=>{EQ();const up=HIT('tusk',{n:30}),open=HIT('tusk',{n:30,state:'recover'});return Math.abs(open/up-1.4/.6)<.15;}),'armored monsters take glancing blows until they are winded, then far more');
  ok(await ev(()=>{EQ();const S=QUIET('storm'),m=S.m;RUN(300);const half=m.charge>30&&m.charge<50&&!m.over;S.h.counter=1;MH.actCounter();RUN(30);const drained=m.charge<20;m.wait=1e9;RUN(60*14);const over=m.over;S.h.state='idle';S.h.counter=1;MH.actCounter();RUN(30);
    return half&&drained&&over&&!m.over&&m.charge<5&&m.state==='stagger';}),'charging monsters build charge, a counter drains it, and overcharge is knocked out by a counter');
  ok(await ev(()=>{EQ();const open=HIT('mud',{n:30}),shut=HIT('mud',{n:30,state:'shell'});const S=QUIET('mud');S.m.state='shell';S.m.t=0;const s0=S.h.sharp;MH.actTap('body');RUN(16);const w1=s0-S.h.sharp;const T=QUIET('mud');const t0=T.h.sharp;MH.actTap('body');RUN(16);
    RUN(60*3);return Math.abs(shut/open-.25)<.04&&Math.abs(w1/(t0-T.h.sharp)-2)<.1&&S.m.state!=='shell';}),'a shelled monster takes a quarter of the damage and dulls the blade twice as fast, then comes out');
  ok(await ev(()=>{EQ();const D=MH.MONSTERS.bog,pool=D.pools;D.pools=[['erupt'],['erupt'],['erupt']];MH.newHunt('bog');const S=MH.S,m=S.m;S.h.inv=1e9;m.evadeCd=1e9;m.qteT=1e9;m.wait=0;let under=0,miss=false,t=0;
    while(t<5&&m.state!=='recover'){MH.update(1/60);t+=1/60;if(m.state==='attack'&&m.t>m.hits[0]*.4&&m.t<m.hits[0]-.2){under++;if(!miss){const d0=S.stats.dealt;S.h.state='idle';MH.actTap('body');RUN(12);t+=.2;miss=S.stats.dealt===d0;}}}D.pools=pool;
    return under>5&&miss;}),'a burrowing monster cannot be hit while it is under the ground');
  ok(await ev(()=>{EQ();const S=QUIET('thorn'),m=S.m;m.hp=m.max*.5;RUN(60*2);const wait=m.hp===m.max*.5;RUN(60*4);const healed=m.hp>m.max*.52;const h0=m.hp;MH.actTap('body');RUN(16);const h1=m.hp;RUN(60*2);return wait&&healed&&h1<h0&&m.hp===h1;}),'a regenerating monster heals when left alone for three seconds, and a hit stops it');
  ok(await ev(()=>{const w=frac=>{let v=0;for(let k=0;k<60&&!v;k++){MH.newHunt('gust');const m=MH.S.m;m.hp=m.max*frac;m.wait=0;m.qteT=1e9;MH.update(1/60);if(m.atk==='peck')v=m.hits[0];}return v;};const full=w(1),low=w(.0001);return Math.abs(low/full-.75)<.02;}),'a frenzied monster winds up a quarter faster when nearly dead');

  // ── ranks ──
  ok(await ev(()=>{const S=MH.SAVE;S.wins={};const a=MH.unlocked('fern')&&!MH.unlocked('quill')&&!MH.unlocked('bog');S.wins.fern=1;const c=MH.unlocked('quill')&&MH.unlocked('tusk')&&!MH.unlocked('bog');S.wins.quill=1;const d=!MH.rankOpen(2);S.wins.mud=1;const e=MH.rankOpen(2)&&MH.unlocked('ember')&&!MH.unlocked('eel');
    for(const id of MH.HUNTS)if(MH.MONSTERS[id].rank<=6)S.wins[id]=1;const f=MH.rankOpen(7)&&MH.unlocked('gloom')&&!MH.unlocked('star');S.wins.gloom=S.wins.reaver=S.wins.pyre=1;const gg=!MH.unlocked('star');S.wins.render=1;const h=MH.unlocked('star');S.wins={};return a&&c&&d&&e&&f&&gg&&h;}),
    'the Fernwing opens rank 1, three wins in a rank open the next, and the elder needs all four apex monsters');

  // ── companion and quests ──
  ok(await ev(()=>{const S=MH.SAVE;S.story={i:5,p:0};S.pal=false;S.wins={fern:1,quill:1,mud:1};EQ();MH.newHunt('ember',{role:'fighter'});const noPal=!MH.S.pal;MH.S.m.hp=1;MH.S.m.evadeCd=1e9;MH.actTap('head');for(let i=0;i<400&&MH.S.mode==='hunt';i++)MH.update(1/60);
    const q=MH.quests()[0];const ready=q.kind==='story'&&q.st.p===1;MH.claim(q);return noPal&&ready&&S.pal===true&&S.story.i===6;}),'beating the Emberwing in the story is what brings the companion');
  ok(await ev(()=>{EQ();const S=QUIET('fern',{role:'fighter'});RUN(600);const f=S.stats.pal;const T=QUIET('fern',{role:'healer'});T.h.hp=30;RUN(30);const healed=T.h.hp===60;T.h.hp=20;RUN(30);const once=T.h.hp===20;MH.newHunt('fern',{role:'rest'});return f===60&&healed&&once&&!MH.S.pal;}),
    'Pip the fighter chips in every three seconds, the healer heals once, and a resting Pip stays home');
  ok(await ev(()=>{const S=MH.SAVE;S.pal=true;EQ();const base=QUIET('tusk',{role:'fighter'});RUN(60*10);const f0=base.stats.pal;
    Object.assign(S.eq,{pweapon:'storm_pw',parmor:'storm_pa'});const T=QUIET('tusk',{role:'fighter'});RUN(60*10);const f1=T.stats.pal;
    Object.assign(S.eq,{pweapon:'fern_pw'});const U=QUIET('ember',{role:'fighter'});RUN(60*10);const fw=U.stats.pal;Object.assign(S.eq,{pweapon:'pip_fang',parmor:'pip_vest'});const V=QUIET('ember',{role:'fighter'});RUN(60*10);
    return f0===60&&Math.abs(f1/f0-MH.GEAR.storm_pw.patk)<.05&&Math.abs(fw/V.stats.pal-MH.GEAR.fern_pw.patk)<.05||[f0,f1,fw,V.stats.pal].join(',');}),'Pip\'s weapon raises its attack like the hunter\'s');
  ok(await ev(()=>{const S=MH.SAVE;const wk=MH.HUNTS.find(id=>MH.MONSTERS[id].wElem===MH.MONSTERS.ember.weak&&MH.MONSTERS[id].rank<3);Object.assign(S.eq,{pweapon:wk+'_pw',parmor:'pip_vest'});const T=QUIET('ember',{role:'fighter'});RUN(60*10);const ice=T.stats.pal;Object.assign(S.eq,{pweapon:'pip_fang'});const U=QUIET('ember',{role:'fighter'});RUN(60*10);const plain=U.stats.pal;
    Object.assign(S.eq,{pweapon:'bog_pw'});const V=QUIET('tusk',{role:'fighter'});V.m.hp=V.m.max=1e7;RUN(60*60);Object.assign(S.eq,{pweapon:'pip_fang'});
    return Math.abs(ice/plain/MH.GEAR[wk+'_pw'].patk-1.25)<.05&&(V.stats.procs||0)>=1||[wk,ice,plain,V.stats.procs].join(',');}),'a Pip weapon of a weak element hits 25% harder, and a status weapon builds its status');
  ok(await ev(()=>{const S=MH.SAVE;Object.assign(S.eq,{parmor:'storm_pa'});const T=QUIET('fern',{role:'healer'});T.h.hp=30;RUN(30);const healed=T.h.hp-30;Object.assign(S.eq,{parmor:'pip_vest'});return healed===Math.round(T.h.max*.3*MH.GEAR.storm_pa.care);}),'Pip\'s vest makes its healing stronger');
  ok(await ev(()=>{const S=MH.SAVE;Object.assign(S.eq,{parmor:'pip_vest'});const T=QUIET('fern',{role:'trapper'}),m=T.m;m.wait=1e9;let first=0,second=0,len=0;for(let i=0;i<60*35;i++){const st=m.state;MH.update(1/60);if(m.state==='stagger'&&st!=='stagger'){if(!first)first=T.clock;else if(!second)second=T.clock;}if(m.state==='stagger')len++;}const traps=T.stats.traps;
    Object.assign(S.eq,{parmor:'storm_pa'});const U=QUIET('fern',{role:'trapper'});U.m.wait=1e9;let l2=0;for(let i=0;i<60*15;i++){MH.update(1/60);if(U.m.state==='stagger')l2++;}Object.assign(S.eq,{parmor:'pip_vest'});
    return Math.abs(first-8)<.1&&Math.abs(second-28)<.1&&traps===2&&Math.abs(len/60-5)<.1&&Math.abs(l2/60-2.5*MH.GEAR.storm_pa.care)<.1||[first,second,len/60,l2/60,traps].join(',');}),'Pip the trapper pins the monster at 8 seconds and every 20 after, longer in a better vest');
  ok(await ev(()=>{const S=MH.SAVE;EQ();const win=role=>{let n=0;for(let k=0;k<40;k++){MH.newHunt('fern',{role});const H=MH.S,m=H.m;m.evadeCd=1e9;m.qteT=1e9;m.wait=0;MH.update(1/60);const late=(m.hits[0]-m.t)-.3;
      for(let t=0;t<late&&m.state==='attack';t+=1/60)MH.update(1/60);MH.actDodge(-1);let u=0;while(m.state==='attack'&&m.hi===0&&u<2){MH.update(1/60);u+=1/60;}if(H.h.counter>0)n++;}return n/40;};
    const a=win('rest'),b=win('scout');return a===0&&b===1||a+','+b;}),'Pip the scout turns a dodge 0.3 seconds early into a perfect, which it would not be alone');
  ok(await ev(()=>{const loot=role=>{let n=0;for(let k=0;k<200;k++){MH.newHunt('fern',{role});const d=MH.rollLoot().drops;n+=d.find(x=>x.id==='scale').n+(d.find(x=>x.id==='herb')||{n:0}).n;}return n/200;};Object.assign(MH.SAVE.eq,{parmor:'pip_vest'});const v=loot('gatherer')-loot('rest');MH.SAVE.bag={};MH.SAVE.wins={fern:1};MH.SAVE.dry={};return Math.abs(v-3)<.3;}),'Pip the gatherer brings back one more of each common drop and two herbs');
  ok(await ev(()=>{const S=MH.SAVE;S.side={};S.wins.fern=1;MH.fakeNow=Date.UTC(2027,0,4,12);MH.ensureQuests();const d1=JSON.stringify(S.daily.q.map(q=>q.k)),w1=S.weekly.key,n=S.daily.q.length,uniq=new Set(S.daily.q.map(q=>q.k)).size;
    MH.qEvent('hunt','fern');MH.qEvent('gather');MH.qEvent('break',null,2);MH.qEvent('perfect',null,3);MH.qEvent('catch',null,1);MH.qEvent('small');MH.qEvent('meal');MH.qEvent('fast');const moved=S.daily.q.some(q=>q.p>0);MH.ensureQuests();const same=JSON.stringify(S.daily.q.map(q=>q.k))===d1&&S.daily.q.some(q=>q.p>0);
    MH.fakeNow=Date.UTC(2027,0,5,12);MH.ensureQuests();const reset=S.daily.q.every(q=>q.p===0)&&S.weekly.key===w1;MH.fakeNow=Date.UTC(2027,0,12,12);MH.ensureQuests();const wk=S.weekly.key!==w1;MH.fakeNow=0;return n===3&&uniq===3&&moved&&same&&reset&&wk&&S.weekly.q.length===1;}),
    'three different dailies are set each day and one weekly each week, and progress resets with them');
  ok(await ev(()=>{const S=MH.SAVE;S.side={};const q=()=>MH.quests().find(x=>x.kind==='side'&&x.def.id==='hammer');MH.qEvent('weapon','gs');const no=q().st.p===0;for(let i=0;i<3;i++)MH.qEvent('weapon','hm');const full=q().st.p===2,h0=S.bag.herb||0;MH.claim(q());MH.claim(q());return no&&full&&S.bag.herb===h0+5&&q().st.c;}),'a side quest counts only what it asks for, stops at its goal and pays out once');
  ok(await ev(()=>{const S=MH.SAVE;S.wins={fern:1};S.story={i:3,p:0};const q=()=>MH.quests()[0];const a=q().st.p===0;S.wins.quill=S.wins.mud=1;const c=q().st.p===1;S.story={i:12,p:0};const d=q().st.p===0;S.wins.gloom=S.wins.pyre=1;const e=q().st.p===2;S.story={i:14,p:0};const f=!MH.quests()[0].st.c&&q().st.p===0;S.wins={};S.story={i:0,p:0};return a&&c&&d&&e&&f;}),
    'the story\'s rank chapters follow the ranks, the apex chapter counts apex wins, and the last chapter is the end');

  // ── screenshots of fights ──
  const until=(cond,max=40)=>ev(({c,max})=>{const f=new Function('S','MH','return '+c);const S=MH.S;let t=0;while(!f(S,MH)&&t<max){if(S.h.state==='idle'&&S.m.state!=='attack')MH.actTap('head');MH.update(1/60);t+=1/60;}return t<max;},{c:cond,max});
  if(shots){
    const scene=async(mon,eq,cond,name,max)=>{await ev(({mon,eq})=>{EQ(eq.weapon,eq.armor);MH.newHunt(mon);MH.S.h.hp=MH.S.h.max=1e6;MH.S.m.hp=MH.S.m.max*.6;},{mon,eq});await until(cond,max||300);await shot(name);};
    const mid=id=>"S.m.state==='attack'&&S.m.atk==='"+id+"'&&S.m.hits[0]-S.m.t<.2&&S.m.hits[0]-S.m.t>.05";
    await scene('fern',set('iron','db'),"S.qte&&S.qte.t>.2",'f-fern-circle');
    await scene('quill',set('iron'),mid('spit'),'f-quill-spit');
    await scene('mud',set('fern','hm'),"S.m.state==='shell'&&S.m.t>.3",'f-mud-shell',600);
    await scene('bog',set('tusk','ln'),"S.m.state==='attack'&&S.m.atk==='erupt'&&S.m.t>S.m.hits[0]+.05",'f-bog-erupt',600);
    await scene('tide',set('frost'),mid('breath'),'f-tide-breath');
    await scene('dread',set('magma'),mid('clap'),'f-dread-clap');
    await scene('cryst',set('obsid'),mid('spin'),'f-cryst-spin');
    await scene('gloom',set('aurora'),mid('stomp'),'f-apex-gloom');
    await scene('pyre',set('aurora'),mid('volley'),'f-apex-pyre');
    await scene('star',set('render'),"S.m.state==='attack'&&S.m.atk==='starfall'&&S.m.t>S.m.hits[1]+.02",'f-elder-starfall',900);
    await scene('star',set('render'),mid('nova'),'f-elder-nova',900);
    await ev(()=>{MH.newHunt('star');RUN(50);});await shot('f-elder-intro');
  }

  // ── the camp, on a fresh save, with real taps ──
  await ev(()=>{localStorage.clear();});await p.reload();await p.waitForTimeout(200);
  const tapBtn=async id=>{const q=await ev(id=>{if(MH.S.itemY&&id.startsWith('hunt:')&&MH.S.tab==='hunt'&&!MH.S.exp){MH.scrollSet(MH.S.itemY[id.slice(5)]-30);}return 1;},id);await p.waitForTimeout(60);
    const pos=await ev(id=>{const b=MH.S.btns.find(b=>b.id===id);if(!b)return null;const r=document.getElementById('c').getBoundingClientRect();return{x:r.left+(b.x+b.w/2)/128*r.width,y:r.top+(b.y+b.h/2)/MH.LH*r.height};},id);
    if(!pos)return false;await p.touchscreen.tap(pos.x,pos.y);await p.waitForTimeout(120);return true;};
  const cdp=await p.context().newCDPSession(p);
  const touch=(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  ok(await ev(()=>MH.S.mode==='camp'&&MH.S.tab==='quest'&&MH.SAVE.potions===6&&!MH.SAVE.pal),'a tap on the title opens the camp on the story, with six potions and no companion yet');await shot('c-quest-new');
  await tapBtn('tab:hunt');await shot('c-hunt-new');
  ok(await ev(()=>MH.S.btns.some(b=>b.id==='hunt:fern')&&!MH.S.btns.some(b=>b.id==='hunt:star')&&MH.S.scrMax.hunt>800),'the hunt list shows the first monsters and is long enough to scroll');
  await touch('touchStart',200,600);await touch('touchMove',200,520);await touch('touchMove',200,300);await touch('touchMove',200,200);await touch('touchEnd');await p.waitForTimeout(100);
  ok(await ev(()=>MH.S.scr.hunt>100&&MH.S.mode==='camp'&&!MH.S.btns.some(b=>b.id==='hunt:fern')),'dragging scrolls the list without tapping anything');await shot('c-hunt-scrolled');
  await tapBtn('hunt:tusk');ok(await ev(()=>MH.S.mode==='camp'),'the Tuskhide is locked on a fresh save');
  await ev(()=>MH.scrollSet(1e6));await p.waitForTimeout(80);await shot('c-hunt-end');ok(await ev(()=>MH.S.btns.some(b=>b.id==='hunt:star')),'the elder is at the end of the list');
  await tapBtn('exp:toggle');ok(await ev(()=>!MH.S.exp),'expeditions are locked before the first Fernwing');
  await tapBtn('tab:forge');ok(await ev(()=>MH.S.tab==='forge'&&MH.S.btns.some(b=>b.id==='forge:iron_ln')),'the forge opens on the starter gear');
  await tapBtn('forge:iron_ln');ok(await ev(()=>MH.SAVE.eq.weapon==='iron_ln'),'a starter weapon of another type can be equipped');await tapBtn('forge:iron_gs');await shot('c-forge-starter');
  await tapBtn('page:pick');ok(await ev(()=>MH.S.fpick&&MH.S.btns.some(b=>b.id==='pick:1')),'a tap on the page title opens the list of every monster\'s gear');await shot('c-forge-pick');
  await ev(()=>MH.scrollSet(1e6));await p.waitForTimeout(80);await tapBtn('pick:'+36);ok(await ev(()=>!MH.S.fpick&&MH.S.btns.some(b=>b.id==='forge:relic_quick')),'and picking from it jumps to that page');
  await ev(()=>{MH.S.fpage=0;MH.S.scr.page=0;});await tapBtn('page:next');ok(await ev(()=>MH.S.btns.some(b=>b.id==='forge:fern_gs')),'the next page is the Fernwing\'s gear');
  await tapBtn('forge:fern_gs');ok(await ev(()=>!MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='iron_gs'),'gear cannot be crafted without materials');
  await ev(()=>{Object.assign(MH.SAVE.bag,{scale:9,claw:4,horn:2,wing:1,spike:1});});await shot('c-forge-fern');
  await tapBtn('forge:fern_gs');ok(await ev(()=>MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='fern_gs'&&MH.SAVE.bag.scale===4&&MH.SAVE.bag.claw===2&&MH.SAVE.bag.horn===1&&MH.gearStats().atk===1.3&&MH.gearStats().elem==='nature'),'crafting spends the materials, equips the gear and gives its element');
  await tapBtn('forge:fern_ch');ok(await ev(()=>MH.SAVE.eq.charm==='fern_ch'&&MH.gearStats().qteSlow===1.4),'the Keen Eye Charm slows the circles');
  await tapBtn('forge:fern_ch');ok(await ev(()=>MH.SAVE.eq.charm===null),'a worn charm can be taken off');await tapBtn('forge:fern_ch');
  ok(await tapBtn('up:fern_gs')&&await ev(()=>MH.lvOf('fern_gs')===1&&MH.SAVE.bag.scale===1&&MH.SAVE.bag.claw===1&&MH.SAVE.eq.weapon==='fern_gs'),'a tap on UP upgrades the weapon and spends materials');await shot('c-forge-crafted');
  await p.reload();await p.waitForTimeout(200);
  ok(await ev(()=>MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='fern_gs'&&MH.SAVE.eq.charm==='fern_ch'&&MH.SAVE.bag.scale===1&&MH.lvOf('fern_gs')===1),'gear, upgrade levels and materials survive a reload');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);await tapBtn('tab:hunt');await tapBtn('hunt:fern');
  ok(await ev(()=>MH.S.mode==='prep'&&MH.S.prep.id==='fern'&&!MH.S.btns.some(b=>b.id==='prep:rnext')),'a tap on the Fernwing card opens the prep screen, with no companion yet');await shot('c-prep');
  await tapBtn('prep:mnext');ok(await ev(()=>MH.S.prep.meal===0),'the arrows pick a meal');await tapBtn('prep:start');ok(await ev(()=>MH.S.mode==='prep'),'a meal cannot be eaten without its ingredients');await tapBtn('prep:mprev');await tapBtn('prep:start');
  ok(await ev(()=>MH.S.mode==='hunt'&&MH.S.def.id==='fern'&&MH.S.h.atk===1.404&&Math.abs(MH.S.qteTime-.7)<1e-9),'START HUNT begins the hunt with the worn gear');

  // ── real touch input in a hunt ──
  const head=await ev(()=>{const r=document.getElementById('c').getBoundingClientRect(),pp=MH.partPos('head',MH.mPose());return{x:r.left+pp.x/128*r.width,y:r.top+pp.y/MH.LH*r.height};});
  await ev(()=>{MH.S.m.evadeCd=9;});await p.touchscreen.tap(head.x,head.y);await p.waitForTimeout(250);
  ok(await ev(()=>MH.S.stats.dealt>0&&MH.S.m.stun>0),'a tap on the head damages the head');
  await p.waitForTimeout(500);await touch('touchStart',200,600);await touch('touchMove',150,600);await touch('touchMove',110,602);await p.waitForTimeout(50);
  ok(await ev(()=>MH.S.h.state==='dodge'),'a swipe dodges');await touch('touchEnd');await p.waitForTimeout(700);
  const quiet=()=>ev(()=>{const S=MH.S,m=S.m;m.state='idle';m.wait=10;m.evadeCd=99;m.qteT=99;S.qte=null;S.h.state='idle';S.h.inv=0;S.h.poison=0;});
  await quiet();const before=await ev(()=>MH.S.stats.dealt);
  await touch('touchStart',200,600);await p.waitForTimeout(1500);ok(await ev(()=>MH.S.h.state==='charge'&&MH.S.h.lvl>=1),'a held press charges');
  await touch('touchEnd');await p.waitForTimeout(400);const hv=await ev(()=>MH.S.stats.dealt);ok(hv-before>=40,'releasing lands a heavy hit ('+(hv-before)+')');
  const qp=await ev(()=>{const S=MH.S;MH.manual=true;S.qte={part:'tail',t:0};const r=document.getElementById('c').getBoundingClientRect(),pp=MH.partPos('tail',MH.mPose());return{x:r.left+pp.x/128*r.width,y:r.top+pp.y/MH.LH*r.height};});
  await p.touchscreen.tap(qp.x,qp.y);
  ok(await ev(()=>MH.S.m.parts.tail.hits===1&&!MH.S.qte),'a tap on a red circle counts as a weak-point hit');
  ok(await ev(()=>{const S=MH.S;for(let k=0;k<2;k++){S.qte={part:'tail',t:0};const pp=MH.partPos('tail',MH.mPose());MH.qteTap(pp.x,pp.y);}return S.m.parts.tail.broken&&S.m.state==='stagger';}),'three hits break the part');
  ok(await ev(()=>{const S=MH.S;S.qte={part:'head',t:0};for(let i=0;i<60;i++)MH.update(1/60);const r=!S.qte&&S.m.parts.head.hits===0;MH.manual=false;return r;}),'an untouched circle times out');
  await quiet();
  const sbtn=await ev(()=>{MH.S.h.sharp=30;const r=document.getElementById('c').getBoundingClientRect(),q=MH.L.sharp;return{x:r.left+(q.x+q.w/2)/128*r.width,y:r.top+(q.y+q.h/2)/MH.LH*r.height};});
  await p.touchscreen.tap(sbtn.x,sbtn.y);await p.waitForTimeout(80);ok(await ev(()=>MH.S.h.state==='sharpen'),'a tap on the whetstone button starts sharpening');await p.waitForTimeout(1500);ok(await ev(()=>MH.S.h.sharp===100),'and the edge comes back');
  await quiet();await ev(()=>{MH.S.h.sharp=30;});await touch('touchStart',200,560);await touch('touchMove',202,600);await touch('touchMove',203,640);await touch('touchEnd');await p.waitForTimeout(80);
  ok(await ev(()=>MH.S.h.state==='sharpen'),'a swipe down sharpens too');await p.waitForTimeout(1500);await quiet();await ev(()=>{MH.S.h.hp=40;});
  await touch('touchStart',200,600);await touch('touchMove',202,560);await touch('touchMove',203,520);await touch('touchEnd');await p.waitForTimeout(900);
  ok(await ev(()=>MH.S.h.potions===2&&MH.SAVE.potions===5&&MH.S.h.hp===40+Math.round(MH.S.h.max*.4)),'a swipe up drinks a potion, from the three brought and the stock');
  await quiet();
  const cb=await ev(()=>{const S=MH.S;S.h.counter=1.4;S.slow=0;MH.manual=true;const r=document.getElementById('c').getBoundingClientRect(),c=MH.L.counter;return{x:r.left+(c.x+c.w/2)/128*r.width,y:r.top+(c.y+c.h/2)/MH.LH*r.height,d:S.stats.dealt};});
  await p.touchscreen.tap(cb.x,cb.y);ok(await ev(()=>MH.S.h.state==='counter'),'a tap on the COUNTER button starts a counter');
  await ev(()=>{for(let i=0;i<40;i++)MH.update(1/60);});ok(await ev(d=>MH.S.stats.dealt-d>=100&&MH.S.m.stun>=40,cb.d),'the counter lands a big hit and fills the stun meter');
  // win → loot → story → the rest of the camp
  await ev(()=>{const S=MH.S;S.m.hp=1;S.m.state='idle';S.h.state='idle';MH.actTap('head');for(let i=0;i<400&&S.mode==='hunt';i++)MH.update(1/60);S.t=5;MH.manual=false;});
  ok(await ev(()=>MH.S.mode==='loot'&&MH.S.loot.unlock==='RANK 1 IS OPEN'&&MH.SAVE.wins.fern===1),'the first Fernwing win opens the rest of rank 1');await shot('c-loot');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  ok(await ev(()=>MH.S.mode==='camp'&&MH.S.tab==='quest'),'a tap on the loot screen returns to camp, on the quests when the story has a reward waiting');await shot('c-quest-claim');
  const pot0=await ev(()=>MH.SAVE.potions);await tapBtn('claim:story');ok(await ev(p0=>MH.SAVE.story.i===1&&MH.SAVE.potions===p0+2,pot0),'claiming the first chapter pays its reward and opens the next');
  await tapBtn('tab:hunt');await tapBtn('exp:toggle');ok(await ev(()=>MH.S.exp&&MH.S.btns.some(b=>b.id==='gather:fern')&&MH.S.btns.some(b=>b.id==='gather:tusk')&&!MH.S.btns.some(b=>b.id==='gather:ember')),'expeditions open with the monsters that guard their biomes');await shot('c-expeditions');
  await tapBtn('gather:fern');ok(await ev(()=>MH.S.mode==='gather'),'GATHER starts a gather run');
  await ev(()=>{MH.manual=true;const G=MH.S.g;G.nodes=[{x:40,y:MH.L.ground+30,id:'herb',rare:false,t:0,life:9},{x:90,y:MH.L.ground+50,id:'honey',rare:true,t:0,life:9}];G.bug={i:3,dir:1,x:64,y:60,t:.5};});await shot('c-gather');
  const gp=await ev(()=>{const r=document.getElementById('c').getBoundingClientRect(),G=MH.S.g,f=(x,y)=>({x:r.left+x/128*r.width,y:r.top+y/MH.LH*r.height});return[f(G.nodes[0].x,G.nodes[0].y),f(G.nodes[1].x,G.nodes[1].y),f(G.bug.x,G.bug.y),f(10,30)];});
  for(const q of gp)await p.touchscreen.tap(q.x,q.y);
  ok(await ev(()=>{const G=MH.S.g;return G.got.herb===1&&G.got.honey===1&&G.caught.length===1&&G.nodes.length===0&&!G.bug;}),'tapping collects what popped up and catches the creature, and a miss does nothing');
  const bag0=await ev(()=>MH.SAVE.bag.herb||0);
  await ev(()=>{const G=MH.S.g;G.spawn=1e9;G.bugT=1e9;for(let i=0;i<60*26&&MH.S.mode==='gather';i++)MH.update(1/60);MH.S.t=5;MH.manual=false;});
  ok(await ev(b0=>MH.S.mode==='gres'&&MH.SAVE.bag.herb===b0+1&&MH.SAVE.bag.honey>=1&&MH.SAVE.bugs.c03===1&&MH.S.g.fresh.length===1&&MH.SAVE.story.p===1,bag0),'the run ends on its timer, banks the haul and the catch, and moves the story on');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);await tapBtn('claim:story');
  await tapBtn('tab:bugs');ok(await ev(()=>MH.bugBonus().hp===.006&&MH.bugBonus().atk===.006&&MH.gearStats().hp>100*1.005),'a rare creature in the terrarium adds a little health and attack');await shot('c-terrarium');
  await tapBtn('tab:cook');await ev(()=>{MH.SAVE.bag.herb=7;MH.SAVE.bag.meat=2;});await p.waitForTimeout(80);await shot('c-kitchen');const pk=await ev(()=>MH.SAVE.potions);await tapBtn('cook:brew');
  ok(await ev(k=>MH.SAVE.potions===k+1&&MH.SAVE.bag.herb===4,pk),'three herbs brew a potion');
  await tapBtn('tab:hunt');await tapBtn('hunt:fern');await tapBtn('prep:mnext');await p.waitForTimeout(80);await shot('c-prep-meal');await tapBtn('prep:start');
  ok(await ev(()=>MH.S.mode==='hunt'&&MH.S.h.max===Math.round(100*1.25*1.006)&&MH.SAVE.bag.meat===0&&MH.SAVE.bag.herb===2),'Hearty Stew costs its ingredients and adds a quarter more health for the hunt');
  await ev(()=>{MH.toCamp('hunt');});await p.waitForTimeout(100);
  await tapBtn('exp:toggle');await tapBtn('pack:fern');ok(await ev(()=>MH.S.mode==='prep'&&MH.S.prep.small==='fern'),'PACK HUNT opens prep for a pack');await tapBtn('prep:start');
  ok(await ev(()=>MH.S.mode==='hunt'&&MH.S.def.small&&MH.S.pack===3),'and starts a hunt against three Snapjaws');await ev(()=>{MH.manual=true;for(let i=0;i<40;i++)MH.update(1/60);});await shot('c-pack-hunt');
  ok(await ev(()=>{const S=MH.S;S.h.inv=1e9;let t=0,seen=new Set();while(S.mode==='hunt'&&t<120){seen.add(S.pack);if(S.h.state==='idle')MH.actTap('head');MH.update(1/60);t+=1/60;}
    return S.mode==='loot'&&seen.size===3&&!S.qte&&S.loot.drops.some(d=>d.id==='meat')&&S.loot.drops.every(d=>d.id)&&MH.SAVE.packs===1&&(MH.SAVE.wins.fern||0)===1&&t<60;}),'the pack falls one after another and pays in meat and common materials');
  await ev(()=>{MH.S.t=5;MH.manual=false;});await p.touchscreen.tap(195,400);await p.waitForTimeout(150);await tapBtn('tab:hunt');await shot('c-hunt');
  await tapBtn('hunt:tusk');await tapBtn('prep:start');ok(await ev(()=>MH.S.mode==='hunt'&&MH.S.def.id==='tusk'&&MH.S.m.max===MH.MONSTERS.tusk.hp),'the Tuskhide, in rank 1, can now be hunted');
  await tapBtn('nothing');await ev(()=>{MH.toCamp('hunt');});await p.waitForTimeout(80);await tapBtn('hunt:bog');ok(await ev(()=>MH.S.mode==='camp'),'rank 2 stays locked until three rank 1 monsters are beaten');
  // ── saves and screen sizes ──
  ok(await ev(()=>{const v={bag:{scale:2},own:{iron:true,fblade:true,keen:true,coat_poison:true},eq:{weapon:'fblade',armor:'leather',charm:'keen',coat:'coat_poison'},wins:{fern:2,ember:1}};localStorage.setItem('mh_save_v1',JSON.stringify(v));const s=MH.loadSave();
    return s.eq.weapon==='fern_gs'&&s.eq.charm==='fern_ch'&&s.eq.pweapon==='pip_fang'&&s.eq.parmor==='pip_vest'&&s.own.pip_fang&&s.own.fern_gs&&s.own.iron_hm&&!s.own.fblade&&s.bag.scale===2&&!('coat' in s.eq)&&s.potions===6;}),'an older save keeps its gear under the new names and drops its coating');
  await p.setViewportSize({width:1280,height:720});await p.waitForTimeout(150);
  ok(await ev(()=>{const r=document.getElementById('c').getBoundingClientRect();return r.height<=innerHeight+1&&r.width<=innerWidth&&r.height>innerHeight*.9;}),'the canvas fits a desktop window');
  await ev(()=>{MH.toCamp('forge');MH.S.fpage=2;});await p.waitForTimeout(150);await shot('s-forge');
  ok(await ev(()=>{const top=MH.S.btns.filter(b=>b.id.startsWith('forge:')).every(b=>b.y>=26&&b.y+b.h<=MH.LH-20);MH.scrollSet(1e6);return top&&MH.S.scrMax.page>0;})&&await ev(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(MH.S.btns.some(b=>b.id==='forge:quill_pa')))))),'a full forge page scrolls on the shortest screen, down to Pip\'s gear');await shot('s-forge-end');
  for(const tab of ['hunt','cook','quest','bugs']){await ev(t=>{MH.SAVE.story={i:0,p:0};MH.toCamp(t);},tab);await p.waitForTimeout(120);await shot('s-'+tab);}
  ok(await ev(()=>{MH.toCamp('hunt');return 1;})&&await ev(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(MH.S.btns.filter(b=>b.id.startsWith('hunt:')).every(b=>b.y>=12&&b.y+b.h<=MH.LH-19)))))),'hunt cards are only tappable inside the list on the shortest screen');
  await ev(()=>{MH.SAVE.pal=true;MH.toPrep('star');});await p.waitForTimeout(120);await shot('s-prep');
  ok(await ev(()=>MH.S.btns.every(b=>b.y>=-2&&b.y+b.h<=MH.LH+2)&&MH.S.btns.some(b=>b.id==='prep:rnext')),'the prep screen, companion included, fits the shortest screen');
  await p.setViewportSize({width:390,height:780});await p.waitForTimeout(150);await ev(()=>{MH.SAVE.role='fighter';});
  const seen=[];for(let i=0;i<6;i++){seen.push(await ev(()=>MH.SAVE.role));if(i===3)await shot('c-prep-scout');await tapBtn('prep:rnext');}
  ok(seen.join(',')==='fighter,healer,trapper,scout,gatherer,rest'&&await ev(()=>MH.SAVE.role==='fighter')||seen.join(','),'the prep screen cycles Pip through all six roles');
  ok(errs.length===0||errs.slice(0,3).join(' | '),'no page errors');
  await b.close();process.exit(fail?1:0);
})();
