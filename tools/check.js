// Headless test: node tools/check.js [screenshot folder]   (needs Playwright)
// Bots play whole hunts on a fake clock, the rules are checked one by one, then the camp is driven with real taps.
const {chromium}=require('playwright'); const path=require('path');
const shots=process.argv[2];
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:390,height:780},hasTouch:true,isMobile:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n').slice(1,3).join(' ')));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
  await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(200);
  let fail=0;const ok=(c,msg)=>{console.log((c===true?'ok   ':'FAIL ')+msg+(c===true||c===false?'':' -> '+c));if(c!==true)fail++;};
  const shot=async n=>{if(shots){await p.waitForTimeout(80);await p.screenshot({path:shots+'/'+n+'.png'});}};
  const ev=(f,a)=>p.evaluate(f,a);
  await shot('title');
  await ev(()=>{MH.manual=true;for(const k in MH.GEAR)MH.SAVE.own[k]=true;window.EQ=(w,ar,ch)=>{ar=ar||'leather';const t=ar==='leather'?null:ar.slice(0,-3);Object.assign(MH.SAVE.eq,{weapon:w||'iron_gs',armor:ar,helm:t?t+'_he':'leather_helm',arms:t?t+'_ga':'leather_arms',legs:t?t+'_bo':'leather_legs',charm:ch||null});MH.SAVE.lv={};MH.SAVE.potions=99;};
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
    for(const id of MH.HUNTS){const D=MH.MONSTERS[id];for(const t of [D.tip,D.tip2])if(w(t)>119)long.push(t);if(w(D.name)>74)long.push(D.name);for(const k of ['gs','db','hm','ln','ar','he','ga','bo','ch','pw','pa'])if(w(MH.GEAR[id+'_'+k].name)>76)long.push(MH.GEAR[id+'_'+k].name);
      for(const k in D.matName)if(w(D.matName[k])>70)long.push(D.matName[k]);}
    for(const t of [...MH.STORY.map(s=>[s.t,...s.d,MH.goalText(s.goal)]).flat(),...MH.SIDES.map(s=>MH.goalText(s.goal)),...MH.DAILIES.map(s=>MH.goalText(s.goal)),...Object.values(MH.MEALS).map(m=>m.desc)])if(w(t)>117)long.push(t);
    for(const r of Object.values(MH.ROLES))if(w(r[1])>90)long.push(r[1]);
    for(const id in MH.GEAR){const G=MH.GEAR[id];if(!G.sk)continue;let x=19+(G.hp?w('HP '+Math.round(G.hp*1.4))+4:0);for(const [k,n] of Object.entries(G.sk))x+=w(MH.PERKS[k].tag+'+'+n)+3;if(x>124)long.push(id);}
    for(const k of MH.SK){const K=MH.PERKS[k];if(w(K.name)>80)long.push(K.name);for(let L=1;L<=K.max;L++)if(w(K.d(L))>116)long.push(K.d(L));}
    return long.length?[...new Set(long)].join(' | '):true;}),'every name, tip, story line and quest line fits the screen');
  ok(await ev(()=>{EQ();for(const id of MH.HUNTS)for(const a of new Set(MH.MONSTERS[id].moves)){MH.newHunt(id);const S=MH.S,m=S.m,D=MH.MONSTERS[id];S.h.hp=S.h.max=1e7;m.evadeCd=1e9;m.qteT=1e9;S.timeLeft=1e9;
      const pool=D.pools,tr=D.trait;D.pools=[[a],[a],[a]];D.trait=null;m.wait=0;let t=0,moved=false;const p0=JSON.stringify(MH.mPose());
      while(t<8&&m.state!=='recover'){MH.update(1/60);t+=1/60;if(m.state==='attack'&&JSON.stringify(MH.mPose())!==p0)moved=true;}D.pools=pool;D.trait=tr;
      if(m.state!=='recover'||!moved||S.stats.taken<=0)return id+':'+a;}return true;}),'every move of every monster animates, lands its hits and ends');

  // ── music ──
  ok(await ev(()=>{const sig=MH.HUNTS.map(id=>{const t=MH.monsterTrack(MH.MONSTERS[id]);return JSON.stringify([t.scale,t.root,t.prog,t.rhy,t.lead,t.drums,t.bpm,t.bassPat]);});
    const bpm=r=>{const ids=MH.HUNTS.filter(id=>MH.MONSTERS[id].rank===r);return ids.reduce((s,id)=>s+MH.monsterTrack(MH.MONSTERS[id]).bpm,0)/ids.length;};
    return new Set(sig).size===35&&bpm(1)<bpm(3)&&bpm(3)<bpm(6)&&bpm(6)<bpm(7)&&MH.monsterTrack(MH.MONSTERS.star)===MH.MTRACKS.star;}),'every monster has its own track, and tracks speed up with rank');
  ok(await ev(()=>{for(const k of ['title','camp','gather','pack','star'])if(!MH.compileSong(MH.MTRACKS[k],1).ev.length)return k;
    const t=MH.monsterTrack(MH.MONSTERS.fern),a=MH.compileSong(t,1),b=MH.compileSong(t,2),lead=s=>JSON.stringify(s.ev.filter(e=>e.i===t.lead).slice(0,6).map(e=>[+e.f.toFixed(1),+e.d.toFixed(3)]));
    const ok1=a.len>40&&a.len<100&&b.len<a.len;const a2=MH.compileSong(t,1);return ok1&&lead(a)===lead(a2)||[a.len,b.len].join(',');}),'every track compiles; a hunt loop runs about a minute, skips its intro when it repeats, and keeps its hook');
  ok(await ev(()=>{const S=MH.S,save=S.mode,out=[];S.mode='title';S.show=null;out.push(MH.musicCtx());S.show='ember';out.push(MH.musicCtx());S.mode='camp';out.push(MH.musicCtx());S.mode='prep';out.push(MH.musicCtx());
    S.mode='gather';out.push(MH.musicCtx());MH.newHunt('tusk');out.push(MH.musicCtx());MH.newHunt(null,{small:'fern'});out.push(MH.musicCtx());S.mode='loot';out.push(MH.musicCtx());S.mode=save;S.show=null;
    return out.join(',')==='title,mon:ember,camp,camp,gather,mon:tusk,pack,camp'||out.join(',');}),'the music follows the screen: title, camp and menus, gather runs, pack hunts, and each monster');
  // ── pause ──
  ok(await ev(()=>{EQ();MH.newHunt('fern');const S=MH.S;S.m.wait=0;RUN(30);const c0=S.clock,t0=S.timeLeft,m0=JSON.stringify([S.m.t,S.m.state]);MH.pauseHunt(true);RUN(300);
    const still=S.clock===c0&&S.timeLeft===t0&&JSON.stringify([S.m.t,S.m.state])===m0;MH.actTap('head');MH.update(1/60);const noAct=S.clock===c0;MH.pauseHunt(false);RUN(10);return S.paused===false&&still&&noAct&&S.clock>c0;}),
    'pausing freezes the hunt: the clock, the timer and the monster all stop until it resumes');

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
  // dual blades: fury and the Blade Dance
  ok(await ev(()=>{EQ('iron_db');const S=QUIET('storm'),h=S.h;S.m.hp=S.m.max=1e7;for(let i=0;i<6;i++){h.state='idle';h.comboT=0;MH.actTap('body');RUN(14);}const six=h.fury;
    for(let i=0;i<60;i++){MH.actTap('body');RUN(10);}const cap=h.fury;RUN(60*2);const kept=h.fury;RUN(60*3);const drained=h.fury;
    EQ('iron_gs');const T=QUIET('storm');for(let i=0;i<10;i++){MH.actTap('body');RUN(20);}return six===24&&cap===100&&kept===100&&drained<90&&T.h.fury===0||[six,cap,kept,drained,T.h.fury].join(',');}),
    'dual blade hits build fury, 4 a hit up to 100; it holds for 3 seconds then drains, and other weapons build none');
  ok(await ev(()=>{EQ('iron_db');const run=f=>{const S=QUIET('storm'),h=S.h;S.m.hp=S.m.max=1e7;h.fury=f;Object.assign(MH.IN,{down:true,swiped:false,downAt:S.clock-1,part:'body'});const d0=S.stats.dealt;let hits=0,last=d0,t=0;
      MH.update(1/60);const st=h.state;while(t<2){MH.IN.down=t<.05;MH.update(1/60);t+=1/60;if(S.stats.dealt!==last){hits++;last=S.stats.dealt;}}MH.IN.down=false;return{st,hits,fury:h.fury,dealt:S.stats.dealt-d0};};
    const none=run(20),l1=run(40),l2=run(70),l3=run(100);return none.st!=='dance'&&none.hits===0&&l1.st==='dance'&&l1.hits===4&&l2.hits===7&&l3.hits===10&&l3.fury===0&&l3.dealt>l1.dealt*2||JSON.stringify([none,l1,l2,l3]);}),
    'holding spends all fury on a Blade Dance: 4, 7 or 10 hits by level, and nothing below a third');
  ok(await ev(()=>{EQ('iron_db');const S=QUIET('storm'),h=S.h;h.fury=100;h.state='dance';h.t=0;h.lvl=3;h.dn=0;RUN(10);const mid=h.dn;MH.actDodge(-1);const dodged=h.state==='dodge';RUN(40);
    const U=QUIET('fern'),m=U.m;m.evadeCd=1e9;m.qteT=1e9;m.wait=0;MH.update(1/60);let t=0;while(m.state==='attack'&&m.hits[0]-m.t>.1&&t<5){MH.update(1/60);t+=1/60;}MH.actDodge(-1);t=0;while(m.state==='attack'&&m.hi===0&&t<2){MH.update(1/60);t+=1/60;}
    return mid>0&&mid<10&&dodged&&h.dn===mid&&U.h.fury===15||[mid,dodged,h.dn,U.h.fury].join(',');}),'a dodge cancels the dance, and a perfect dodge gives 15 fury');
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
    const r=c1==='{"scale":3,"claw":1}'&&Math.abs(a1-1.404)<1e-6&&sc===96&&MH.lvOf('fern_gs')===5&&Math.abs(g.atk-1.82)<1e-6&&g.hp===162&&MH.upCost('fern_gs')===null&&S0.bag.quill_scale===99-12&&S0.bag.rare===0;
    S0.lv={fern_gs:4};S0.bag={scale:99,claw:99,horn:9,wing:9,quill_scale:99};MH.upgradeTap('fern_gs');const noRare=MH.lvOf('fern_gs')===4;S0.lv={};S0.bag={};MH.upgradeTap('fern_gs');return r&&noRare&&MH.lvOf('fern_gs')===0&&MH.upCost('fern_ch')===null;}),
    'upgrades cost materials, add 8% a level and stop at +5; the last levels need the next monster\'s scales and the rare drop; charms have no levels');
  ok(await ev(()=>{const taken=ar=>{let n=0;for(let k=0;k<12;k++){EQ('iron_gs',ar);MH.newHunt('ember');const S=MH.S,m=S.m;m.wait=0;m.qteT=99;let t=0;while(S.stats.taken===0&&t<6){MH.update(1/60);t+=1/60;}n+=S.stats.taken/Math.round(MH.ATTACKS[m.atk].dmg*MH.MONSTERS.ember.dmg);}return n/12;};
    const a=taken('obsid_ar'),c=taken('frost_ar');return Math.abs(a-.75)<.06&&Math.abs(c-1)<.02||a+','+c;}),'armor takes 25% less from its own monster\'s element');
  ok(await ev(()=>{EQ('ember_gs','frost_ar','relic_weak');const g=MH.gearStats();return g.elem==='fire'&&g.perks.might===3&&Math.abs(g.atk-1.66*1.12)<.001&&g.perks.weakspot===2&&g.perks.keenedge===1&&g.hp===Math.round((140+8*MH.MONSTERS.frost.L)*(1+.04*(g.perks.vigor||0)))||JSON.stringify([g.perks,g.atk,g.hp]);}),'gear adds up: element, attack with three levels of Might, health, and the charm\'s skills');
  // equip pieces until a skill reaches a level, starting from a charm; returns the slots used
  await ev(()=>{window.BUILD=(skill,lvl,charm)=>{EQ('iron_gs','leather',charm||null);const E=MH.SAVE.eq;for(const sl of ['armor','helm','arms','legs']){if((MH.skillLevels()[skill]||0)>=lvl)break;
      const id=Object.keys(MH.GEAR).find(k=>MH.GEAR[k].slot===sl&&MH.GEAR[k].sk&&MH.GEAR[k].sk[skill]);if(id)E[sl]=id;}return MH.skillLevels()[skill]||0;};});
  ok(await ev(()=>{const a=BUILD('herbal',2);MH.newHunt('fern');const p2=MH.S.h.potions;const b=BUILD('herbal',3,Object.keys(MH.GEAR).find(k=>MH.GEAR[k].slot==='charm'&&MH.GEAR[k].sk.herbal));MH.newHunt('fern');const p3=MH.S.h.potions;EQ();MH.SAVE.potions=2;MH.newHunt('fern');
    return a>=2&&p2===3&&b===3&&p3===4&&MH.S.h.potions===2||[a,p2,b,p3].join(',');}),'three potions come on a hunt, four with Herbalist at level 3, and never more than are in stock');
  ok(await ev(()=>{const bch=Object.keys(MH.GEAR).find(k=>MH.GEAR[k].slot==='charm'&&MH.GEAR[k].sk.breaker);EQ('iron_gs','leather',bch);const two=MH.gearStats().qteHits;const L=BUILD('breaker',3,bch);MH.newHunt('fern');const S=MH.S;for(let k=0;k<2;k++){S.qte={part:'head',t:0};const pp=MH.partPos('head',MH.mPose());MH.qteTap(pp.x,pp.y);}
    return two===3&&L===3&&S.m.parts.head.broken;}),'Breaker at level 3 breaks a part in two hits; the charm alone is not enough');
  ok(await ev(()=>{EQ();const base=MH.skillLevels();BUILD('might',3);const lv3=MH.skillLevels().might,raw=MH.skillRaw().might;const E=MH.SAVE.eq;
    const extra=Object.keys(MH.GEAR).filter(k=>MH.GEAR[k].slot==='charm'&&MH.GEAR[k].sk&&MH.GEAR[k].sk.might);if(extra.length)E.charm=extra[0];const capped=MH.skillLevels().might;
    return Object.keys(base).length===0&&lv3===3&&capped===3&&MH.skillRaw().might>=raw;}),'skill points stack from pieces and charms, and stop at the skill\'s max');
  ok(await ev(()=>{const t=id=>MH.GEAR[id].sk,bad=[];for(const id of MH.HUNTS){const a=t(id+'_ar'),h=t(id+'_he'),g=t(id+'_ga'),b=t(id+'_bo');
      const all={};for(const s of [a,h,g,b])for(const [k,n] of Object.entries(s))all[k]=(all[k]||0)+n;const lv=Object.values(all).sort().join(',');if(lv!=='2,2,2,3'||Object.keys(a).length!==2||Object.keys(b).length!==1)bad.push(id+':'+lv);}
    const sets=new Set(MH.HUNTS.map(id=>JSON.stringify(['ar','he','ga','bo'].map(k=>t(id+'_'+k)))));return bad.length?bad.join(' '):sets.size===35;}),'each monster\'s armor carries a theme of four skills: a full set gives levels 3, 2, 2 and 2, and no two sets match');
  ok(await ev(()=>{EQ();const h0=MH.gearStats().hp;const a=MH.gearStats().atk;BUILD('vigor',2);const h1=MH.gearStats().hp,lvv=MH.skillLevels().vigor;EQ();
    const k0=MH.HUNTS[0];const d=(()=>{EQ();const S=QUIET('ember');MH.applyStatus('burn');const t0=S.h.burn;BUILD('hardy',3);const T=QUIET('ember');MH.applyStatus('burn');return [t0,T.h.burn,MH.skillLevels().hardy];})();EQ();
    return lvv>=1&&h1>=Math.round(h0*(1+.04*lvv))-1&&Math.abs(d[1]/d[0]-(1-.2*d[2]))<.01||[h0,h1,lvv,d].join(',');}),'new skills work: Vigor adds health, Hardy shortens ailments');
  ok(await ev(()=>{EQ('iron_ln');MH.newHunt('fern');const S=MH.S,m=S.m;m.evadeCd=99;m.wait=0;m.qteT=99;MH.update(1/60);Object.assign(MH.IN,{down:true,swiped:false,downAt:-9});let t=0;while(m.state==='attack'&&m.hi===0&&t<3){S.h.state='guard';S.h.t=1;MH.update(1/60);t+=1/60;}
    const chip=S.stats.guards===1&&S.stats.taken>0&&S.stats.taken<=4&&S.h.st<100&&S.h.state!=='hurt';
    MH.IN.down=false;MH.newHunt('fern');const T=MH.S.m;T.evadeCd=99;T.wait=0;T.qteT=99;MH.update(1/60);t=0;while(T.state==='attack'&&T.hi===0&&t<3){if(T.hits[0]-T.t<.1&&MH.S.h.state!=='guard'){Object.assign(MH.IN,{down:true,swiped:false,downAt:MH.S.clock-1});MH.S.h.state='guard';MH.S.h.t=0;}MH.update(1/60);t+=1/60;}MH.IN.down=false;
    return chip&&MH.S.h.counter>0&&MH.S.stats.taken===0;}),'a lance guard blocks for chip damage and stamina, and one raised just in time is perfect and opens a counter');
  ok(await ev(()=>{EQ();const roll=(breaks,dry)=>{let n=0;for(let i=0;i<4000;i++){MH.SAVE.dry.fern=dry;MH.newHunt('fern');for(const k of ['head','wings','tail'].slice(0,breaks))MH.S.m.parts[k].broken=true;if(MH.rollLoot().drops.some(d=>d.id==='rare'))n++;}return n/4000;};
    const a=roll(0,0),c=roll(3,0),d=roll(0,20);MH.SAVE.bag={};MH.SAVE.wins={};MH.SAVE.dry={};MH.SAVE.side={};return a>.015&&a<.05&&c>.09&&c<.15&&d>.1&&d<.16;}),'the rare drop is about 3%, 12% with every part broken, and creeps up over a dry streak');

  // ── armor in four pieces ──
  ok(await ev(()=>{const G=MH.GEAR,bad=[];for(const id of MH.HUNTS){const parts=['ar','he','ga','bo'].map(k=>G[id+'_'+k]);if(parts.some(x=>!x))bad.push(id);else{const sum=parts.reduce((t,x)=>t+x.hp,0);if(Math.abs(sum-(140+8*MH.MONSTERS[id].L))>.01)bad.push(id+' '+sum);
      if(parts.some(x=>!x.sk||!Object.keys(x.sk).length))bad.push(id+' skills');}}return bad.length?bad.join(','):true;}),'every monster makes a chest, helm, gauntlets and boots; together they are worth the old armor, and every piece carries skills');
  ok(await ev(()=>{EQ('iron_gs','magma_ar');const full=MH.gearStats();Object.assign(MH.SAVE.eq,{helm:'frost_he',arms:'frost_ga',legs:'frost_bo'});const mix=MH.gearStats();
    Object.assign(MH.SAVE.eq,{armor:'leather'});const two=MH.gearStats();EQ();
    const pk=Object.keys(MH.GEAR.magma_ar.sk).find(k=>!MH.GEAR.frost_he.sk[k]&&!MH.GEAR.frost_ga.sk[k]&&!MH.GEAR.frost_bo.sk[k]);return full.res.fire===.25&&Math.abs(mix.res.fire-.1)<1e-9&&Math.abs(mix.res.ice-.15)<1e-9&&!two.res.fire&&Math.abs(two.res.ice-.15)<1e-9&&!!mix.perks[pk]&&!two.perks[pk]&&full.hp===Math.round((140+8*MH.MONSTERS.magma.L)*(1+.04*(full.perks.vigor||0)))||JSON.stringify([full.res,mix.res,two.res,full.hp,pk]);}),
    'mixing pieces splits the resistance by share, and each piece brings its own skills');
  ok(await ev(()=>{const S=MH.SAVE;S.lv={};S.bag={scale:99,claw:99,horn:9,wing:9,spike:9};EQ('iron_gs','fern_ar');const ch=JSON.stringify(MH.upCost('fern_ar')),he=JSON.stringify(MH.upCost('fern_he'));
    const h0=MH.gearStats().hp;MH.upgradeTap('fern_he');const h1=MH.gearStats().hp;S.lv={};S.bag={};return ch==='{"scale":3,"claw":1}'&&he==='{"scale":2,"claw":1}'&&h1-h0===Math.round(140*.2*.08)||[ch,he,h0,h1].join(' ');}),
    'helm, gauntlets and boots upgrade too, for about half the materials');

  // ── hand-made armor themes ──
  ok(await ev(()=>{const T=MH.THEMES,ids=MH.HUNTS,bad=[];if(Object.keys(T).length!==35)return 'count';
    const mains=new Set(ids.map(id=>T[id][0]));for(const k of MH.SK)if(!mains.has(k))bad.push('nobody leads '+k);
    for(const id of ids){const t=T[id];if(new Set(t.slice(0,4)).size!==4)bad.push(id+' repeats');if(!MH.SETB[t[4]])bad.push(id+' set');
      const D=MH.MONSTERS[id];if(D.wStatus&&!t.slice(0,4).includes('statusup'))bad.push(id+' status weapon without Afflictor');
      if(D.trait==='armor'&&!t.some(k=>k==='guardian'||k==='bludgeon'))bad.push(id+' armored without Guardian or Bludgeoner');
      if(D.trait==='shell'&&!t.some(k=>k==='razor'||k==='guardian'))bad.push(id+' shelled without Razor or Guardian');
      if(D.trait==='regen'&&!t.some(k=>k==='vigor'||k==='herbal'))bad.push(id+' regenerating without Vigor or Herbalist');
      if(MH.GEAR[id+'_ch'].sk[t[2]]!==2)bad.push(id+' charm');}
    const n={};for(const id of ids)n[T[id][4]]=(n[T[id][4]]||0)+1;if(Object.values(n).some(v=>v<5||v>7))bad.push(JSON.stringify(n));
    return bad.length?bad.join(' | '):true;}),'every skill leads a set, each theme fits its monster, set bonuses are spread 5 to 7 each, and each charm gives its set\'s third skill');

  // ── set bonuses ──
  ok(await ev(()=>{const n={};for(const id of MH.HUNTS){const b=MH.MONSTERS[id].setb;if(!MH.SETB[b])return id;n[b]=(n[b]||0)+1;}return Object.keys(n).length===6&&Object.values(n).every(v=>v>=5)||JSON.stringify(n);}),'every monster has one of six set bonuses, and each bonus turns up on several sets');
  ok(await ev(()=>{EQ('iron_gs','fern_ar');const a=MH.setBonus();MH.SAVE.eq.legs='leather_legs';const b=MH.setBonus();MH.SAVE.eq.legs='quill_bo';const c=MH.setBonus();EQ();return a===MH.MONSTERS.fern.setb&&b===null&&c===null&&MH.fullSet()===null;}),'a set bonus needs all four pieces from the same monster');
  const byB=b=>`MH.HUNTS.find(id=>MH.MONSTERS[id].setb==='${b}')`;
  ok(await ev(new Function(`const id=${byB('kinship')};EQ('iron_gs',id+'_ar');const r=MH.armorRes()[MH.MONSTERS[id].elem];EQ();return r===.4||r;`)),'Kinship raises resistance to the set\'s own element to 40%');
  ok(await ev(new Function(`const id=${byB('ascend')};EQ('iron_gs',id+'_ar');const k=MH.MONSTERS[id].mainSkill,ch=Object.keys(MH.GEAR).find(x=>MH.GEAR[x].slot==='charm'&&MH.GEAR[x].sk&&MH.GEAR[x].sk[k]);MH.SAVE.eq.charm=ch;
    const l4=MH.skillLevels()[k],mx=MH.skillMax(k);MH.SAVE.eq.legs='leather_legs';const l3=MH.skillLevels()[k];EQ();return l4===4&&mx===4&&l3===3||[k,l4,mx,l3].join(',');`)),'Ascendant lets the set\'s main skill reach level 4');
  ok(await ev(new Function(`const id=${byB('secondwind')};EQ('iron_gs',id+'_ar');MH.newHunt('fern');const S=MH.S,m=S.m;m.evadeCd=1e9;m.qteT=1e9;S.h.hp=1;m.wait=0;let t=0;while(S.stats.taken===0&&t<6){MH.update(1/60);t+=1/60;}
    const lived=S.h.hp===1&&S.h.state!=='dead';S.h.inv=0;S.h.state='idle';m.state='idle';m.wait=0;t=0;const tk=S.stats.taken;while(S.stats.taken===tk&&t<6){MH.update(1/60);t+=1/60;}EQ();return lived&&S.h.state==='dead';`)),'Second Wind survives one killing blow, but only one');
  ok(await ev(new Function(`const id='obsid';EQ('iron_gs',id+'_ar');const a=HIT('storm',{n:30}),b=HIT('storm',{n:30,pre:S=>{S.h.bl=5;}});MH.newHunt('fern');const S=MH.S,m=S.m;m.evadeCd=1e9;m.qteT=1e9;m.wait=0;MH.update(1/60);
    let t=0;while(m.state==='attack'&&m.hits[0]-m.t>.1&&t<5){MH.update(1/60);t+=1/60;}MH.actDodge(-1);t=0;while(m.state==='attack'&&m.hi===0&&t<2){MH.update(1/60);t+=1/60;}const on=S.h.bl>4;EQ();return Math.abs(b/a-1.15)<.03&&on||[a,b,S.h.bl].join(',');`)),'Bloodlust: a perfect dodge gives 15% more damage for a while');
  ok(await ev(new Function(`const id=${byB('insight')};const gap=()=>{let n=0;for(let k=0;k<200;k++){MH.newHunt('fern');const S=MH.S;S.qte={part:'head',t:9};MH.update(1/60);n+=S.m.qteT;}return n/200;};EQ();const a=gap();EQ('iron_gs',id+'_ar');const b=gap();EQ();return Math.abs(b/a-.8)<.05||[a,b].join(',');`)),'Insight brings the weak-point circles 20% more often');
  ok(await ev(new Function(`const id=${byB('bounty')};EQ('iron_gs',id+'_ar');MH.newHunt('fern');const l=MH.S.h.luck;EQ();MH.newHunt('fern');return l===1.5&&MH.S.h.luck===1;`)),'Bounty raises rare drop odds by half');
  ok(await ev(()=>{const w=t=>{let n=-1;for(const ch of t)n+=(ch==='M'||ch==='W'?5:3)+1;return n;};const long=[];for(const b of Object.values(MH.SETB)){if(w(b.d)>116)long.push(b.d);if(19+w('HP 400')+4+w('SET: '+b.name)>124)long.push(b.name);}return long.length?long.join(' | '):true;}),'set bonus names and descriptions fit the screen');

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

  // ── expeditions in every biome but the elder's ──
  ok(await ev(()=>{const E=MH.EXPED,bi=E.map(id=>MH.MONSTERS[id].biome).sort().join(',');return E.length===8&&bi==='0,1,2,3,4,5,6,7'&&E.every(id=>MH.BIOME_ING[MH.MONSTERS[id].biome].length===2)&&MH.CREATURES.length===32&&
    [0,1,2,3,4,5,6,7].every(b=>MH.CREATURES.filter(c=>c.biome===b).length===4&&MH.CREATURES.filter(c=>c.biome===b&&c.rare).length===1)&&new Set(MH.CREATURES.map(c=>c.name)).size===32;}),'eight biomes have expeditions, each with two ingredients and four creatures, one rare');
  ok(await ev(()=>{const S=MH.SAVE;S.wins={};const a=!MH.unlocked('mud')&&!MH.unlocked('shell')&&!MH.unlocked('dread');S.wins.fern=1;const c=MH.unlocked('mud')&&!MH.unlocked('shell');S.wins={};return a&&c;}),'the swamp opens with rank 1, before the coast and the ruins');
  ok(await ev(()=>{const run=bi=>{MH.startGather(bi);const G=MH.S.g;const got=new Set(),bugs=new Set();for(let i=0;i<60*24;i++){MH.gatherUpdate(1/60);for(const n of [...G.nodes])if(n.t>.1){MH.gatherTap(n.x,n.y);got.add(n.id);}if(G.bug&&G.bug.t>.3){bugs.add(MH.CREATURES[G.bug.i].biome);MH.gatherTap(G.bug.x,G.bug.y);}}
      return[[...got].sort().join(','),[...bugs].join(',')];};
    const sw=run(5),co=run(6),ru=run(7);MH.toCamp('hunt');return sw[0].split(',').every(k=>['bogbean','lily'].includes(k))&&sw[0].includes('bogbean')&&sw[1]==='5'&&co[0].includes('kelp')&&co[1]==='6'&&ru[0].includes('fig')&&ru[1]==='7'||JSON.stringify([sw,co,ru]);}),
    'a gather run in the swamp, coast or ruins turns up that biome\'s ingredients and creatures');
  ok(await ev(()=>{const runs=[];for(let k=0;k<30;k++){MH.startGather(0);const G=MH.S.g;let seen=0;for(let i=0;i<60*21;i++){MH.gatherUpdate(1/60);for(const n of [...G.nodes])if(n.t>.1)MH.gatherTap(n.x,n.y);
      if(G.bug&&G.bug.t>.3){seen++;MH.gatherTap(G.bug.x,G.bug.y);}}runs.push({items:Object.values(G.got).reduce((a,b)=>a+b,0),herb:G.got.herb||0,bugs:G.caught.length,seen});}MH.toCamp('hunt');
    const avg=runs.reduce((a,r)=>a+r.items,0)/runs.length,max=Math.max(...runs.map(r=>r.items)),herbs=runs.reduce((a,r)=>a+r.herb,0)/runs.length;
    return avg>=8&&avg<=12&&max<=14&&herbs<=11&&runs.every(r=>r.bugs===1&&r.seen===1)||JSON.stringify({avg,max,herbs,b:runs.map(r=>r.bugs).join('')});}),
    'a perfect gather run collects about ten things, three or so potions\' worth of herbs, and exactly one creature');
  ok(await ev(()=>{EQ();const pr=(mon,st,meal)=>{const S=QUIET(mon,{meal});MH.applyStatus(st);return !(S.h[st]>0||S.h.state==='numb');};
    return pr('mud','mud','beanbroth')&&pr('mire','stench','beanbroth')&&pr('quill','bleed','lilytea')&&pr('shell','wet','kelpwrap')&&pr('dust','numb','chowder')&&pr('dread','blight','figpie')&&!pr('dread','blight','kelpwrap');}),
    'the new meals guard against mud, stench, bleeding, soaking, numbing and blight');
  ok(await ev(()=>{MH.SAVE.potions=9;MH.newHunt(null,{small:'dread'});const S=MH.S;return S.def.small&&S.def.biome===7&&S.pack===3&&S.def.loot.common[0][0]===MH.MONSTERS.dread.mat.scale;}),'a pack hunt in the ruins is three Snapjaws that drop Dreadbeak materials');

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
  await shot('c-title-new');
  ok(await ev(()=>MH.S.mode==='title'&&MH.S.btns.some(b=>b.id==='title:howto')&&MH.S.btns.some(b=>b.id==='title:options')&&!MH.S.show),'the title screen has HOW TO PLAY and OPTIONS buttons, and shows the Fernwing on a fresh save');
  await tapBtn('title:howto');ok(await ev(()=>MH.S.howto&&MH.S.mode==='title'),'HOW TO PLAY opens the controls');await shot('c-title-howto');
  await p.touchscreen.tap(195,300);await p.waitForTimeout(120);ok(await ev(()=>!MH.S.howto&&MH.S.mode==='title'),'and a tap closes them without starting');
  ok(await ev(()=>MH.AC&&MH.AC.state==='running'&&MH.music.running&&MH.PREFS.music),'the first tap starts the sound and the music');
  await p.waitForTimeout(400);ok(await ev(()=>MH.music.key==='title'&&MH.music.song&&MH.music.idx>0),'the title theme is playing');
  await tapBtn('title:options');ok(await ev(()=>MH.S.opts&&['opt:music','opt:sfx','opt:dev','opt:delete','opt:back'].every(k=>MH.S.btns.some(b=>b.id===k))),'OPTIONS opens music, sound, dev mode and delete save');await shot('c-options');
  await p.touchscreen.tap(195,30);await p.waitForTimeout(100);ok(await ev(()=>MH.S.mode==='title'&&MH.S.opts),'a tap outside the buttons does not start the game');
  await tapBtn('opt:music');ok(await ev(()=>!MH.PREFS.music&&!MH.music.running&&JSON.parse(localStorage.getItem('mh_prefs')).music===false),'MUSIC turns it off, and the choice is saved');
  await tapBtn('opt:music');ok(await ev(()=>MH.PREFS.music&&MH.music.running),'and back on');
  await tapBtn('opt:sfx');ok(await ev(()=>!MH.PREFS.sfx),'SOUND turns the effects off');await tapBtn('opt:sfx');
  // dev mode, on its own save
  await ev(()=>{MH.SAVE.bag.scale=5;MH.SAVE.potions=4;localStorage.setItem('mh_save_v1',JSON.stringify(MH.SAVE));});
  await tapBtn('opt:dev');ok(await ev(()=>MH.PREFS.dev&&MH.HUNTS.every(id=>MH.unlocked(id))&&Object.keys(MH.GEAR).every(k=>MH.SAVE.own[k])&&MH.SAVE.pal&&MH.SAVE.potions===99&&MH.SAVE.bag.scale===99),'DEV MODE unlocks every monster and every piece of gear, with Pip and plenty of materials');
  ok(await ev(()=>JSON.parse(localStorage.getItem('mh_save_v1')).bag.scale===5&&!!localStorage.getItem('mh_dev_v1')),'and plays on its own save, leaving the real one alone');await shot('c-options-dev');
  await tapBtn('opt:back');ok(await ev(()=>!MH.S.opts&&MH.S.btns.some(b=>b.id==='title:howto')),'BACK closes the options');await shot('c-title-dev');
  await p.reload();await p.waitForTimeout(200);ok(await ev(()=>MH.PREFS.dev&&MH.SAVE.wins.storm===1),'dev mode is remembered after a reload');
  await p.touchscreen.tap(195,300);await p.waitForTimeout(100);await ev(()=>{MH.toCamp('hunt');});await p.waitForTimeout(100);await shot('c-dev-camp');
  ok(await ev(()=>MH.S.btns.some(b=>b.id==='hunt:fern')),'the camp works in dev mode');await ev(()=>{MH.S.mode='title';MH.S.opts=true;});await p.waitForTimeout(100);
  await tapBtn('opt:dev');ok(await ev(()=>!MH.PREFS.dev&&MH.SAVE.bag.scale===5&&MH.SAVE.potions===4&&!MH.SAVE.wins.storm),'switching dev mode off brings the real save back');
  // deleting a save takes two taps
  await tapBtn('opt:delete');ok(await ev(()=>MH.SAVE.bag.scale===5&&MH.S.armDel>0),'the first tap on DELETE SAVE only asks for confirmation');await shot('c-options-delete');
  await tapBtn('opt:delete');ok(await ev(()=>!MH.SAVE.bag.scale&&MH.SAVE.potions===6&&JSON.parse(localStorage.getItem('mh_save_v1')).potions===6&&!!localStorage.getItem('mh_dev_v1')&&MH.PREFS.music),'the second deletes the save, keeping the settings and the dev save');
  await tapBtn('opt:back');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  ok(await ev(()=>MH.S.mode==='camp'&&MH.S.tab==='quest'&&MH.SAVE.potions===6&&!MH.SAVE.pal),'a tap on the title opens the camp on the story, with six potions and no companion yet');await shot('c-quest-new');
  await tapBtn('tab:hunt');await shot('c-hunt-new');
  ok(await ev(()=>MH.S.btns.some(b=>b.id==='hunt:fern')&&!MH.S.btns.some(b=>b.id==='hunt:star')&&MH.S.scrMax.hunt>800),'the hunt list shows the first monsters and is long enough to scroll');
  await touch('touchStart',200,600);await touch('touchMove',200,520);await touch('touchMove',200,300);await touch('touchMove',200,200);await touch('touchEnd');await p.waitForTimeout(100);
  ok(await ev(()=>MH.S.scr.hunt>100&&MH.S.mode==='camp'&&!MH.S.btns.some(b=>b.id==='hunt:fern')),'dragging scrolls the list without tapping anything');await shot('c-hunt-scrolled');
  await tapBtn('hunt:tusk');ok(await ev(()=>MH.S.mode==='camp'),'the Tuskhide is locked on a fresh save');
  await ev(()=>MH.scrollSet(1e6));await p.waitForTimeout(80);await shot('c-hunt-end');ok(await ev(()=>MH.S.btns.some(b=>b.id==='hunt:star')),'the elder is at the end of the list');
  await tapBtn('exp:toggle');ok(await ev(()=>!MH.S.exp),'expeditions are locked before the first Fernwing');
  // ── the GEAR tab and the forge ──
  await tapBtn('tab:gear');ok(await ev(()=>MH.S.tab==='gear'&&['weapon','charm','helm','armor','arms','legs','pweapon','parmor'].every(k=>MH.S.btns.some(b=>b.id==='slot:'+k))),'the GEAR tab shows the hunter and eight gear slots');await shot('c-gear');
  await tapBtn('slot:weapon');ok(await ev(()=>MH.S.gpick==='weapon'&&['iron_gs','iron_db','iron_hm','iron_ln'].every(k=>MH.S.btns.some(b=>b.id==='wear:'+k))&&!MH.S.btns.some(b=>b.id==='wear:fern_gs')),'a slot lists only the gear you own for it');await shot('c-gear-pick');
  await tapBtn('wear:iron_ln');ok(await ev(()=>MH.SAVE.eq.weapon==='iron_ln'&&!MH.S.gpick&&MH.gearStats().wt==='ln'),'picking one wears it and goes back to the gear screen');
  await tapBtn('slot:weapon');await tapBtn('gear:back');ok(await ev(()=>!MH.S.gpick),'BACK leaves the list without changing anything');await tapBtn('slot:weapon');await tapBtn('wear:iron_gs');
  await ev(()=>{MH.SAVE.own.fern_he=true;});await tapBtn('slot:helm');ok(await ev(()=>MH.S.btns.some(b=>b.id==='wear:fern_he')&&!MH.S.btns.some(b=>b.id==='wear:fern_ar')),'the helm slot lists only helms');
  await tapBtn('wear:fern_he');ok(await ev(()=>MH.SAVE.eq.helm==='fern_he'&&MH.armorRes().nature===.05&&MH.gearStats().hp===Math.round(80+28)),'wearing a Fernwing helm adds its health and a little nature resistance');await shot('c-gear-helm');
  await tapBtn('slot:helm');await tapBtn('wear:leather_helm');await ev(()=>{delete MH.SAVE.own.fern_he;});
  await tapBtn('tab:forge');ok(await ev(()=>MH.S.tab==='forge'&&['fcat:weapon','fcat:armor','fcat:pip'].every(k=>MH.S.btns.some(b=>b.id===k))&&MH.S.fcat==='weapon'),'the forge has three categories: weapons, armor and Pip');
  ok(await ev(()=>{const ids=MH.S.btns.filter(b=>b.id.startsWith('forge:')).map(b=>b.id.slice(6));return ids[0]==='iron_gs'&&ids.includes('fern_gs')&&ids.every(k=>MH.GEAR[k].wt==='gs')&&!ids.includes('bog_gs');}),'weapons open on greatswords: the starter, then one per monster you can hunt');await shot('c-forge-weapons');
  await tapBtn('fsub:1');ok(await ev(()=>MH.S.btns.filter(b=>b.id.startsWith('forge:')).every(b=>MH.GEAR[b.id.slice(6)].wt==='db')),'the sub-filter switches weapon type');
  await tapBtn('fcat:armor');const subs=[];for(let i=0;i<5;i++){await tapBtn('fsub:'+i);subs.push(await ev(()=>{const ids=MH.S.btns.filter(b=>b.id.startsWith('forge:')).map(b=>MH.GEAR[b.id.slice(6)].slot);return ids.length&&ids.every(s=>s===ids[0])?ids[0]:'mixed';}));if(i===1)await shot('c-forge-helms');}
  ok(subs.join(',')==='armor,helm,arms,legs,charm'||subs.join(','),'armor has chest, helm, arms, legs and charm filters');await shot('c-forge-charms');
  await tapBtn('fcat:pip');ok(await ev(()=>{const ids=MH.S.btns.filter(b=>b.id.startsWith('forge:')).map(b=>b.id.slice(6));return ids[0]==='pip_fang'&&ids.every(k=>MH.GEAR[k].slot==='pweapon');}),'Pip has its own category, fangs first');await shot('c-forge-pip');
  await tapBtn('fcat:weapon');await tapBtn('fsub:0');
  await tapBtn('craft:fern_gs');ok(await ev(()=>!MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='iron_gs'),'gear cannot be crafted without materials');
  await ev(()=>{Object.assign(MH.SAVE.bag,{scale:9,claw:4,horn:2,wing:1,spike:1});});await p.waitForTimeout(80);
  await tapBtn('craft:fern_gs');ok(await ev(()=>MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='fern_gs'&&MH.SAVE.bag.scale===4&&MH.SAVE.bag.claw===2&&MH.SAVE.bag.horn===1&&MH.gearStats().atk===1.3&&MH.gearStats().elem==='nature'),'crafting spends the materials, wears the gear and gives its element');
  await tapBtn('forge:fern_gs');ok(await ev(()=>MH.SAVE.eq.weapon==='fern_gs'&&MH.S.toast&&/GEAR/.test(MH.S.toast.txt)),'tapping owned gear in the forge points to the GEAR tab');
  await tapBtn('fcat:armor');await tapBtn('fsub:4');await tapBtn('craft:fern_ch');ok(await ev(()=>MH.SAVE.eq.charm==='fern_ch'&&MH.gearStats().perks.keeneye===2&&Math.abs(MH.gearStats().qteSlow-1.26)<1e-9),'the Fernwing charm gives Keen Eye 2, slowing the circles');
  await tapBtn('tab:gear');await tapBtn('slot:charm');await tapBtn('wear:none');ok(await ev(()=>MH.SAVE.eq.charm===null),'a charm can be taken off in the GEAR tab');await tapBtn('slot:charm');await tapBtn('wear:fern_ch');
  await tapBtn('gear:skills');ok(await ev(()=>MH.S.gpick==='skills'),'tapping the stats opens the skills page');await shot('c-gear-skills');await tapBtn('gear:back');
  await tapBtn('tab:forge');await tapBtn('fcat:weapon');await tapBtn('fsub:0');
  ok(await tapBtn('up:fern_gs')&&await ev(()=>MH.lvOf('fern_gs')===1&&MH.SAVE.bag.scale===1&&MH.SAVE.bag.claw===1&&MH.SAVE.eq.weapon==='fern_gs'),'a tap on UP upgrades the weapon and spends materials');await shot('c-forge-crafted');
  await p.reload();await p.waitForTimeout(200);
  ok(await ev(()=>MH.SAVE.own.fern_gs&&MH.SAVE.eq.weapon==='fern_gs'&&MH.SAVE.eq.charm==='fern_ch'&&MH.SAVE.bag.scale===1&&MH.lvOf('fern_gs')===1),'gear, upgrade levels and materials survive a reload');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);await tapBtn('tab:hunt');await tapBtn('hunt:fern');
  ok(await ev(()=>MH.S.mode==='prep'&&MH.S.prep.id==='fern'&&!MH.S.btns.some(b=>b.id==='prep:rnext')),'a tap on the Fernwing card opens the prep screen, with no companion yet');await shot('c-prep');
  await tapBtn('prep:mnext');ok(await ev(()=>MH.S.prep.meal===0),'the arrows pick a meal');await tapBtn('prep:start');ok(await ev(()=>MH.S.mode==='prep'),'a meal cannot be eaten without its ingredients');await tapBtn('prep:mprev');await tapBtn('prep:start');
  ok(await ev(()=>MH.S.mode==='hunt'&&MH.S.def.id==='fern'&&MH.S.h.atk===1.404&&Math.abs(MH.S.qteTime-.5*1.26)<1e-9),'START HUNT begins the hunt with the worn gear');
  await p.waitForTimeout(1300);ok(await ev(()=>MH.music.key==='mon:fern'),'the music crosses over to the Fernwing\'s own track');
  const pz=await ev(()=>{const r=document.getElementById('c').getBoundingClientRect();return{x:r.left+(128-8)/128*r.width,y:r.top+5/MH.LH*r.height};});
  await p.touchscreen.tap(pz.x,pz.y);await p.waitForTimeout(100);
  ok(await ev(()=>MH.S.paused&&['pause:resume','pause:music','pause:sfx','pause:quit'].every(k=>MH.S.btns.some(b=>b.id===k))),'the pause button in the corner pauses the hunt and shows the menu');await shot('c-paused');
  const ck=await ev(()=>MH.S.clock);await p.waitForTimeout(500);ok(await ev(c0=>MH.S.clock===c0,ck),'the hunt stays frozen while paused');
  await tapBtn('pause:sfx');ok(await ev(()=>!MH.PREFS.sfx),'SOUND switches the sound effects off');await tapBtn('pause:sfx');
  await tapBtn('pause:resume');await p.waitForTimeout(150);ok(await ev(c0=>!MH.S.paused&&MH.S.clock>c0,ck),'RESUME carries on');
  await p.keyboard.press('p');ok(await ev(()=>MH.S.paused),'P pauses from the keyboard');await p.keyboard.press('Escape');ok(await ev(()=>!MH.S.paused),'and Escape resumes');
  await ev(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  ok(await ev(()=>MH.S.paused),'leaving the app mid-hunt pauses it');
  await ev(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await tapBtn('pause:resume');

  // ── real touch input in a hunt ──
  const head=await ev(()=>{const r=document.getElementById('c').getBoundingClientRect(),pp=MH.partPos('head',MH.mPose());return{x:r.left+pp.x/128*r.width,y:r.top+pp.y/MH.LH*r.height};});
  await ev(()=>{MH.S.m.evadeCd=9;});await p.touchscreen.tap(head.x,head.y);await p.waitForTimeout(250);
  ok(await ev(()=>MH.S.stats.dealt>0&&MH.S.m.stun>0),'a tap on the head damages the head');
  await p.waitForTimeout(500);await ev(()=>{const S=MH.S,m=S.m;m.state='idle';m.wait=10;m.evadeCd=99;m.qteT=99;S.qte=null;S.h.state='idle';S.h.inv=0;S.h.st=100;});
  await touch('touchStart',200,600);await touch('touchMove',150,600);await touch('touchMove',110,602);await p.waitForTimeout(50);
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
  // dual blades with a real held press
  await ev(()=>{MH.manual=false;MH.SAVE.eq.weapon='iron_db';MH.newHunt('fern');const S=MH.S,m=S.m;m.state='idle';m.wait=99;m.evadeCd=99;m.qteT=99;S.h.fury=100;});
  await touch('touchStart',200,600);await p.waitForTimeout(450);ok(await ev(()=>MH.S.h.state==='dance'||MH.S.stats.dances===1),'a held press with dual blades and full fury starts a Blade Dance');await shot('c-dance');
  await touch('touchEnd');await p.waitForTimeout(1200);ok(await ev(()=>MH.S.h.fury<10&&MH.S.h.state!=='dance'),'and it plays out and spends the fury');
  await ev(()=>{MH.SAVE.eq.weapon='fern_gs';MH.newHunt('fern');MH.S.m.evadeCd=9;});
  // quitting from the pause menu goes back to camp
  ok(await ev(()=>{const id=MH.S.def.id;MH.pauseHunt(true);MH.S.btns.find(b=>b.id==='pause:quit')||1;MH.quitHunt();const r=MH.S.mode==='camp'&&!MH.SAVE.wins[id];return r;}),'QUIT HUNT goes back to camp with no win');
  await ev(()=>{MH.toPrep('fern');});await p.waitForTimeout(80);await tapBtn('prep:start');await ev(()=>{MH.S.m.evadeCd=9;});
  // win → loot → story → the rest of the camp
  await ev(()=>{const S=MH.S;S.m.hp=1;S.m.state='idle';S.h.state='idle';MH.actTap('head');for(let i=0;i<400&&S.mode==='hunt';i++)MH.update(1/60);S.t=5;MH.manual=false;});
  ok(await ev(()=>MH.S.mode==='loot'&&MH.S.loot.unlock==='RANK 1 IS OPEN'&&MH.SAVE.wins.fern===1),'the first Fernwing win opens the rest of rank 1');await shot('c-loot');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);
  ok(await ev(()=>MH.S.mode==='camp'&&MH.S.tab==='quest'),'a tap on the loot screen returns to camp, on the quests when the story has a reward waiting');await shot('c-quest-claim');
  const pot0=await ev(()=>MH.SAVE.potions);await tapBtn('claim:story');ok(await ev(p0=>MH.SAVE.story.i===1&&MH.SAVE.potions===p0+2,pot0),'claiming the first chapter pays its reward and opens the next');
  await tapBtn('tab:hunt');await tapBtn('exp:toggle');ok(await ev(()=>MH.S.exp&&MH.S.btns.some(b=>b.id==='gather:fern')&&MH.S.btns.some(b=>b.id==='gather:tusk')&&!MH.S.btns.some(b=>b.id==='gather:ember')),'expeditions open with the monsters that guard their biomes');await shot('c-expeditions');
  ok(await ev(()=>MH.S.scrMax.exp>0&&MH.S.btns.some(b=>b.id==='gather:mud')),'the swamp opens with the rest of rank 1');
  await tapBtn('gather:fern');ok(await ev(()=>MH.S.mode==='gather'),'GATHER starts a gather run');
  await ev(()=>{MH.manual=true;const G=MH.S.g;G.nodes=[{x:40,y:MH.L.ground+30,id:'herb',rare:false,t:0,life:9},{x:90,y:MH.L.ground+50,id:'honey',rare:true,t:0,life:9}];G.bug={i:3,dir:1,x:64,y:60,t:.5};});await shot('c-gather');
  const gp=await ev(()=>{const r=document.getElementById('c').getBoundingClientRect(),G=MH.S.g,f=(x,y)=>({x:r.left+x/128*r.width,y:r.top+y/MH.LH*r.height});return[f(G.nodes[0].x,G.nodes[0].y),f(G.nodes[1].x,G.nodes[1].y),f(G.bug.x,G.bug.y),f(10,30)];});
  for(const q of gp)await p.touchscreen.tap(q.x,q.y);
  ok(await ev(()=>{const G=MH.S.g;return G.got.herb===1&&G.got.honey===1&&G.caught.length===1&&G.nodes.length===0&&!G.bug;}),'tapping collects what popped up and catches the creature, and a miss does nothing');
  const bag0=await ev(()=>MH.SAVE.bag.herb||0);
  await ev(()=>{const G=MH.S.g;G.spawn=1e9;G.bugT=1e9;for(let i=0;i<60*26&&MH.S.mode==='gather';i++)MH.update(1/60);MH.S.t=5;MH.manual=false;});
  ok(await ev(b0=>MH.S.mode==='gres'&&MH.SAVE.bag.herb===b0+1&&MH.SAVE.bag.honey>=1&&MH.SAVE.bugs.c03===1&&MH.S.g.fresh.length===1&&MH.SAVE.story.p===1,bag0),'the run ends on its timer, banks the haul and the catch, and moves the story on');
  await p.touchscreen.tap(195,400);await p.waitForTimeout(150);await tapBtn('claim:story');
  await tapBtn('tab:bugs');ok(await ev(()=>MH.bugBonus().hp===.003&&MH.bugBonus().atk===.003&&Math.abs(MH.gearStats().atk/(MH.lvOf(MH.SAVE.eq.weapon)*.08+1)/MH.GEAR[MH.SAVE.eq.weapon].atk-1.003)<1e-3),'a rare creature in the terrarium adds a little health and attack');await shot('c-terrarium');
  await tapBtn('tab:cook');await ev(()=>{MH.SAVE.bag.herb=7;MH.SAVE.bag.meat=2;});await p.waitForTimeout(80);await shot('c-kitchen');const pk=await ev(()=>MH.SAVE.potions);await tapBtn('cook:brew');
  ok(await ev(k=>MH.SAVE.potions===k+1&&MH.SAVE.bag.herb===4,pk),'three herbs brew a potion');
  await tapBtn('tab:hunt');await tapBtn('hunt:fern');await tapBtn('prep:mnext');await p.waitForTimeout(80);await shot('c-prep-meal');await tapBtn('prep:start');
  ok(await ev(()=>MH.S.mode==='hunt'&&MH.S.h.max===Math.round(100*1.25*1.003)&&MH.SAVE.bag.meat===0&&MH.SAVE.bag.herb===2),'Hearty Stew costs its ingredients and adds a quarter more health for the hunt');
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
    return s.eq.weapon==='fern_gs'&&s.eq.charm==='fern_ch'&&s.eq.helm==='leather_helm'&&s.eq.legs==='leather_legs'&&s.own.leather_arms&&s.eq.pweapon==='pip_fang'&&s.eq.parmor==='pip_vest'&&s.own.pip_fang&&s.own.fern_gs&&s.own.iron_hm&&!s.own.fblade&&s.bag.scale===2&&!('coat' in s.eq)&&s.potions===6;}),'an older save keeps its gear under the new names and drops its coating');
  await p.setViewportSize({width:1280,height:720});await p.waitForTimeout(150);
  ok(await ev(()=>{const r=document.getElementById('c').getBoundingClientRect();return r.height<=innerHeight+1&&r.width<=innerWidth&&r.height>innerHeight*.9;}),'the canvas fits a desktop window');
  await ev(()=>{MH.SAVE.wins={};for(const id of MH.HUNTS)MH.SAVE.wins[id]=1;MH.toCamp('forge');MH.S.fcat='weapon';MH.S.fsub=0;});await p.waitForTimeout(150);await shot('s-forge');
  ok(await ev(()=>{const top=MH.S.btns.filter(b=>/^(forge|craft|up):/.test(b.id)).every(b=>b.y>=38&&b.y+b.h<=MH.LH-20);MH.scrollSet(1e6);return top&&MH.S.scrMax.forgeweapon0>0;})&&await ev(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(MH.S.btns.some(b=>b.id==='forge:star_gs')))))),'the forge list scrolls on the shortest screen, down to the elder\'s gear');await shot('s-forge-end');
  await ev(()=>{MH.SAVE.pal=true;MH.toCamp('gear');});await p.waitForTimeout(150);await shot('s-gear');
  ok(await ev(()=>MH.S.btns.filter(b=>b.id.startsWith('slot:')).length===8&&MH.S.btns.every(b=>b.y>=0&&b.y+b.h<=MH.LH)),'the GEAR tab fits the shortest screen');
  await ev(()=>{MH.toCamp('hunt');MH.S.exp=true;MH.SAVE.wins={fern:1,quill:1,mud:1,dust:1,tusk:1,bog:1,ember:1,thorn:1};});await p.waitForTimeout(150);await shot('s-expeditions');
  ok(await ev(()=>{const g=MH.S.btns.filter(b=>/^(gather|pack):/.test(b.id));const fit=g.every(b=>b.y>=12&&b.y+b.h<=MH.LH-19);MH.scrollSet(1e6);return fit&&MH.S.scrMax.exp>0;})&&await ev(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(MH.S.btns.some(b=>b.id==='gather:shell')&&!MH.S.btns.some(b=>b.id==='gather:storm')))))),'the expedition list scrolls on the shortest screen, and only open biomes can be started');await shot('s-expeditions-end');
  for(const tab of ['hunt','cook','quest','bugs']){await ev(t=>{MH.SAVE.story={i:0,p:0};MH.toCamp(t);},tab);await p.waitForTimeout(120);await shot('s-'+tab);}
  ok(await ev(()=>{MH.SAVE.bugs={};for(const c of MH.CREATURES)MH.SAVE.bugs[c.id]=1;MH.toCamp('bugs');return 1;})&&await ev(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(MH.S.btns.filter(b=>b.id.startsWith('bug:')).length===32&&MH.S.btns.filter(b=>b.id.startsWith('bug:')).every(b=>b.y+b.h<=MH.LH-20)))))),'all 32 terrarium slots fit the shortest screen');await shot('s-bugs-full');
  await ev(()=>{MH.SAVE.bag={};for(const k in MH.ING)MH.SAVE.bag[k]=5;MH.toCamp('cook');});await p.waitForTimeout(120);await shot('s-cook-full');
  ok(await ev(()=>{MH.toCamp('hunt');return 1;})&&await ev(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(MH.S.btns.filter(b=>b.id.startsWith('hunt:')).every(b=>b.y>=12&&b.y+b.h<=MH.LH-19)))))),'hunt cards are only tappable inside the list on the shortest screen');
  await ev(()=>{MH.SAVE.pal=true;MH.toPrep('star');});await p.waitForTimeout(120);await shot('s-prep');
  ok(await ev(()=>MH.S.btns.every(b=>b.y>=-2&&b.y+b.h<=MH.LH+2)&&MH.S.btns.some(b=>b.id==='prep:rnext')),'the prep screen, companion included, fits the shortest screen');
  await p.setViewportSize({width:390,height:780});await p.waitForTimeout(150);await ev(()=>{MH.SAVE.role='fighter';});
  const seen=[];for(let i=0;i<6;i++){seen.push(await ev(()=>MH.SAVE.role));if(i===3)await shot('c-prep-scout');await tapBtn('prep:rnext');}
  ok(seen.join(',')==='fighter,healer,trapper,scout,gatherer,rest'&&await ev(()=>MH.SAVE.role==='fighter')||seen.join(','),'the prep screen cycles Pip through all six roles');
  ok(errs.length===0||errs.slice(0,3).join(' | '),'no page errors');
  await b.close();process.exit(fail?1:0);
})();
