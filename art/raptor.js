// RAPTORS: fast, feathered, two long bird legs with sickle claws, feathered wing-arms, a long balancing tail and a crest.
// The spec picks the crest, the beak or snout, what runs down the back, the tail fan and markings.
(()=>{
const {V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,glowDots}=KIT,PI=Math.PI;
const GROUND=66;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={armF:{z:1,R:2,k:1.2,dk:-1},legF:{z:2,R:3.4,k:1.8,dk:-.9},tailF:{z:3,R:1.4,k:.8},back:{z:3.4,R:1.4,k:.8},body:{z:4,R:6,k:2.4},mouth:{z:4.1,R:1,k:1},beak:{z:4.3,R:1.6,k:1},
  crest:{z:4.6,R:1.4,k:.8},legN:{z:6,R:3.6,k:1.8},armN:{z:7,R:2,k:1.2},armP:{z:7.1,R:1,k:.6,soft:1}};
const rest={px:58,py:39,tilt:.12,n1:-.15,n2:-.35,n3:.3,hr:-.8,beak:0,tb:-.12,arm:0,fl:0,fr:0,crouch:0,crest:0,breath:0,tw:1,lean:0};
const clips={idle:{len:2,loop:1,keys:[[0,{}],[.5,{n1:-.4,hr:-.4,crest:.3}],[1,{py:38.6,hr:-.15,tb:-.05}],[1.5,{n1:-.3,hr:-.35}],[2,{}]]},
  peck:{len:1.0,keys:[[0,{}],[.35,{px:60,py:37,tilt:-.05,n1:.05,n2:.05,n3:.2,hr:-.2,crest:1,arm:.3}],[.46,{px:50,py:40,tilt:.4,n1:-.55,n2:-.45,n3:-.1,hr:-1.15,beak:.8,fr:3}],
    [.56,{px:49,py:40,tilt:.42,n1:-.6,n2:-.45,n3:-.1,hr:-1.2,beak:.1,fr:3}],[1,{}]]},
  pounce:{len:1.3,keys:[[0,{}],[.35,{px:60,py:42,crouch:1,tilt:.3,arm:.4,crest:1}],[.55,{px:44,py:22,crouch:0,tilt:-.2,arm:1,fl:10,fr:12,beak:.6,tb:.2}],[.75,{px:36,py:34,tilt:.35,arm:.5,fl:2,fr:4,beak:.4}],[.9,{px:38,py:40,crouch:.6,tilt:.25}],[1.3,{}]]},
  sweep:{len:1.3,keys:[[0,{}],[.4,{px:60,tilt:.25,tb:-.6,crouch:.4}],[.55,{px:56,tilt:.05,tb:1.2,fl:3,crouch:.3}],[.68,{px:54,tilt:0,tb:2.3,fl:3}],[.85,{tb:1.2}],[1.3,{}]]},
  clap:{len:1.2,keys:[[0,{}],[.35,{arm:1.2,crest:1,tilt:-.1,py:36,hr:-.6,beak:.4}],[.5,{arm:-.2,tilt:.2,py:38,beak:.7}],[.65,{arm:1,beak:.5}],[.8,{arm:-.2}],[1.2,{}]]},
  breath:{len:1.7,keys:[[0,{}],[.45,{px:59,py:36,tilt:-.05,n1:.05,hr:-.2,crest:1,beak:.2}],[.6,{px:53,py:39,tilt:.3,n1:-.5,n2:-.4,n3:-.1,hr:-1.05,beak:.8,breath:.15}],[1.2,{px:53,py:39,tilt:.32,n1:-.52,n2:-.4,n3:-.1,hr:-1.08,beak:.8,breath:1}],[1.35,{breath:0,beak:.2}],[1.7,{}]]},
  flinch:{len:.6,keys:[[0,{}],[.08,{px:61,py:36,tilt:-.25,hr:-.9,arm:.6,crest:1,beak:.4}],[.6,{}]]}};

function make(id,name,look,D){D=Object.assign({s:1,crest:'quills',beak:'hook',back:null,tail:'fan',marks:null,fx:null,el:'nature',style:'spit',eye:'#f6e7a0',glowCol:look.glow||'#ffe680'},D);
  const mats={fthA:Object.assign(one(look.b),{tex:'fur'}),fthU:one(look.u),fthD:one(look.d),fthX:one(D.accent||look.h),lava:Object.assign(one(D.glowCol),{flat:.95}),bone:one('#ece4d0')};
  return MON[id]={id,name,rig:'raptor',el:D.el,style:D.style,D,W:96,H:72,look,mats,groups,rest,clips,build(p,brk,t){return build(p,brk,t,D);}};}

function build(p,brk,t,D){const K=kit(),{S,E,C,P}=K,glows=[],br=Math.sin(t*3)*.5+.5;
  const Pv=[p.px,p.py+p.crouch*4],fwd=PI+p.tilt,fv=V(fwd,1),up=V(fwd+PI/2,1),Cv=add(Pv,fv,9);
  // torso: a deep chest, a pale breast
  E(Pv[0],Pv[1],9,7.4,'hide','body',{a:-p.tilt});C([[Pv[0],Pv[1],7],[Cv[0],Cv[1],7.4+br*.3]],'hide','body');
  C([[Pv[0]-1,Pv[1]+3.6,4.2],[Cv[0]+.5,Cv[1]+3.4,5.4]],'belly','body',{pri:1.2});
  if(D.marks==='stripes')for(let i=0;i<4;i++){const q=add(add(Pv,fv,-4+i*4.4),up,5);E(q[0],q[1],1.1,3,'dark','body',{a:-p.tilt+.4,pri:2.6,k:.5});}
  if(D.marks==='bolts')for(let i=0;i<3;i++)bolt(K,add(add(Pv,fv,-3+i*5),up,5.5),PI/2+.4,5,1.1,'lava','body',{pri:2.6});
  // what runs down the back
  for(let i=0;i<5;i++){const q=add(add(Pv,fv,-6+i*4),up,6.4-Math.abs(i-2)*.3),ua=fwd+PI/2+.5;
    if(D.back==='quills')spike(K,q,ua+.15+Math.sin(t*2+i)*.04,7+(i%2)*2.5,.9,i%2?'horn':'fthD','back');
    else if(D.back==='plumes')E(...add(q,V(ua,2.4)),3.4,1.2,i%2?'fthU':'fthD','back',{a:ua});
    else if(D.back==='spines')spike(K,q,ua,4+(i%2)*1.5,1.2,'bone','back');}
  // neck: an S-curve up from the chest
  const N0=add(add(Cv,fv,2),up,3),nk=chain(N0[0],N0[1],fwd+1.4,[[6,p.n1],[6,p.n2],[5,p.n3]]),Hn=nk[3];
  C([[Cv[0],Cv[1],6.2],[nk[1][0],nk[1][1],3.8],[nk[2][0],nk[2][1],3.2],[Hn[0],Hn[1],3.2]],'hide','body');
  C([[Cv[0]-.5,Cv[1]+2.6,3.4],[nk[1][0]+.6,nk[1][1]+2,2.4],[nk[2][0]+.5,nk[2][1]+1.6,1.8]],'belly','body',{pri:.9});
  // head and beak
  const na=Math.atan2(Hn[1]-nk[2][1],Hn[0]-nk[2][0]),ah=na+p.hr,f=V(ah,1),uH=V(ah+PI/2,1),dH=V(ah-PI/2,1),bk=V(ah+PI,1);
  const sk=add(add(Hn,f,1.6),uH,1);E(sk[0],sk[1],5.2,4.6,'hide','body',{a:ah-PI});
  const bb=add(add(Hn,f,4.6),uH,.8),beakOpen=p.beak,lo=V(ah-beakOpen*.6,1);let mouth,tipBroken=brk.head;
  if(D.beak==='hook'||D.beak==='heavy'){const hv=D.beak==='heavy'?1.35:1,L=(tipBroken?5:8)*hv;
    P([add(bb,uH,2.4*hv),add(add(bb,f,L*.6),uH,1.8*hv),add(add(bb,f,L),dH,.4),add(add(bb,f,L*.85),dH,1.6),add(bb,dH,.6)],'horn','beak',{k:.5});
    const lb=add(bb,dH,1.2);P([add(lb,uH,.4),add(lb,lo,L*.72),add(add(lb,lo,L*.5),V(ah-beakOpen*.6-PI/2,1),1.2*hv),add(lb,dH,1.2)],'claw','beak',{k:.5});
    if(beakOpen>.05)P([add(bb,uH,.2),add(add(bb,f,L*.7),dH,.6),add(lb,lo,L*.6),lb],'mouth','mouth');
    if(tipBroken)P([add(add(bb,f,L),uH,.8),add(add(bb,f,L+1.2),dH,.2),add(add(bb,f,L),dH,1.4)],'core','beak',{k:.3,pri:2.6});
    mouth=add(bb,f,L*.8);}
  else{// a toothy snout
    const s1=add(add(Hn,f,11),dH,.6);C([bb.concat([2.6]),s1.concat([1.8])],'hide','beak');const J=add(bb,dH,2),j1=add(J,lo,8);C([J.concat([1.8]),j1.concat([1.2])],'hide','beak');
    if(beakOpen>.05){P([add(J,uH,.6),s1,j1,J],'mouth','mouth');for(let i=0;i<3;i++){const a=add(add(bb,f,2+i*2.2),dH,1.6),b=add(J,lo,2+i*2.2);P([add(a,f,-.6),add(a,f,.6),add(a,dH,1.4)],'tooth','beak',{pri:2.6});P([add(b,f,-.6),add(b,f,.6),add(b,uH,1.3)],'tooth','beak',{pri:2.6});}}
    for(const k of[0,1]){const b=add(add(bb,f,3+k*3),dH,1.4);P([add(b,f,-.6),add(b,f,.6),add(b,dH,2+p.beak)],'tooth','beak',{pri:2.6});}
    mouth=lerp2(s1,j1,.5);}
  // crest (breakable together with the beak tip: the "head" part)
  const cb=add(add(Hn,f,.5),uH,4),cr=p.crest,hb=brk.head;
  if(D.crest==='quills'){const n=hb?3:6;for(let i=0;i<n;i++){const a=ah+PI-.1-i*.3-cr*.25,l=(hb?3:9.5+Math.sin(i*1.7)*2)+cr*2;spike(K,add(cb,bk,i*.7),a,l,1.1,i%2?'fthD':'horn','crest');}}
  else if(D.crest==='frill'){const n=7;for(let i=0;i<n;i++){const a=ah+PI*.55+i*.22,l=(hb?3:6.5)*(1+cr*.3),q=add(add(Hn,bk,1),V(a,1),2);P([q,add(add(q,V(a,l)),V(a+PI/2,1.4)),add(q,V(a,l*1.05)),add(add(q,V(a,l)),V(a-PI/2,1.4))],i%2?'fthU':'fthX','crest',{k:.4});}
    for(let i=0;i<n;i+=2){const a=ah+PI*.55+i*.22,q=add(add(Hn,bk,1),V(a,1),2);C([q.concat([.4]),add(q,V(a,(hb?2.4:5.6)*(1+cr*.3))).concat([.3])],'dark','crest',{pri:2.6});}}
  else if(D.crest==='swept'){for(let i=0;i<4;i++){const b=add(cb,bk,i*1.2),a=ah+PI-.55-i*.12-cr*.3+Math.sin(t*3+i)*.04,l=(hb?3:9-i*1.2)+cr*2;P([b,add(add(b,V(a,l*.5)),V(a+PI/2,1.3)),add(b,V(a,l)),add(add(b,V(a,l*.5)),V(a-PI/2,.9))],['fthX','fthU','fthA','fthD'][i],'crest',{k:.4});}}
  else if(D.crest==='fan'){const n=hb?3:7;for(let i=0;i<n;i++){const a=ah+PI/2+.9-i*.3-cr*.2,l=(hb?3:8.5+(i===3?2:0))*(1+cr*.4),q=add(cb,V(a,l));C([cb.concat([.7]),q.concat([.5])],'fthD','crest');E(q[0],q[1],1.8,1.2,i%2?'fthX':'fthU','crest',{a,pri:1});}}
  else if(D.crest==='bony'){if(!hb){P([add(cb,f,2.6),add(add(cb,uH,4.5),f,.4),add(add(cb,uH,5),bk,4),add(add(cb,bk,7),uH,1.4),add(cb,bk,4)],'bone','crest',{k:.4});glows.push(add(add(cb,uH,2.6),bk,1));}
    else{P([add(cb,f,2.6),add(add(cb,uH,2),f,.4),add(add(cb,uH,2.4),bk,2),add(cb,bk,3)],'bone','crest',{k:.4});P([add(add(cb,uH,2),bk,.6),add(add(cb,uH,2.6),bk,1.4),add(add(cb,uH,2),bk,2)],'core','crest',{k:.3,pri:2.6});}
    for(let i=0;i<3;i++)spike(K,add(add(cb,bk,3+i*1.4),uH,-.5),ah+PI-.3+i*.25,4+i,.8,'fthD','crest');}
  else if(D.crest==='bolt'){const n=hb?2:4;for(let i=0;i<n;i++)bolt(K,add(cb,bk,i*1.3),ah+PI-.5-i*.25-cr*.3,(hb?3:8-i)+cr*2,1.4,i%2?'lava':'fthX','crest');}
  // tail: a long balancing tail and a fan of feathers (breakable: the feathers come off)
  const ts=[];for(let i=0;i<5;i++)ts.push([4.4,(i?-.09:0)+Math.sin(t*2.6-i*.7)*.08*p.tw]);const front=p.tb>1.25,tg=front?'armN':'body';
  const tl=chain(Pv[0]+6,Pv[1]-1,p.tb,brk.tail?ts.slice(0,3):ts);C(tl.map((q,i)=>[q[0],q[1],Math.max(1,5.6-i*.95)]),'hide',tg);
  const te=tl[tl.length-1],ta=Math.atan2(te[1]-tl[tl.length-2][1],te[0]-tl[tl.length-2][0]);
  if(brk.tail)wound(K,te,ta,.7,tg);
  else{const fg=front?'armN':'tailF',fan=D.tail==='long'?[[-.25,13],[0,15],[.25,13]]:D.tail==='plumes'?[[-.45,10],[-.15,14],[.15,16],[.45,12]]:[[-.4,9],[-.13,11],[.13,11],[.4,9]];
    fan.forEach(([da,l],i)=>{const a=ta+da+Math.sin(t*3+i)*.05,c=add(te,V(a,l*.5));E(c[0],c[1],l*.5,1.6,['fthA','fthD','fthU','fthX'][i%4],fg,{a,pri:i*.1});});
    if(D.tail==='plumes')for(let i=0;i<2;i++){const a=ta+.6+i*.25+Math.sin(t*2+i)*.1,e=add(te,V(a,15+i*3));C([te.concat([.6]),lerp2(te,e,.6).concat([.5]),e.concat([.3])],'fthX',fg);E(e[0],e[1],1.6,1.6,'fthU',fg,{});}}
  // legs: a big drumstick thigh, a forward knee, a long shank to a high ankle, three toes and a raised sickle claw
  const leg=(hip,fx,lift,g)=>{const fy=GROUND-lift,an=[fx+3,fy-6.5],kn=ik(hip[0],hip[1],an[0],an[1],8.5,8.5,-1);
    E(hip[0],hip[1]+1,5.6,6.6,'hide',g,{a:.3,bulge:1});C([[hip[0],hip[1]+1,4.8],[kn[0],kn[1],2.6],[an[0],an[1],1.6]],'hide',g);
    C([[an[0],an[1],1.5],[fx,fy-1,1.2]],'claw',g);for(const d of[-3.5,-1.5])C([[fx,fy-.6,1],[fx+d,fy+.3,.5]],'claw',g);
    const sc0=[fx+.6,fy-1.6];C([sc0.concat([.9]),add(sc0,[-1.8,-2.6]).concat([.6]),add(sc0,[-3.2,-1.6]).concat([.3])],'horn',g,{pri:2.6});};
  const hip=add(Pv,V(fwd+1.5,3));leg(add(hip,[3,0]),58+p.fl*.4,Math.max(0,p.fl),'legF');leg(hip,50+p.fr*.5,Math.max(0,p.fr),'legN');
  // wing-arms: a feathered forelimb that folds against the chest and opens into a fan (breakable: feathers torn)
  const arm=(sh,g,raise,sc)=>{const a1=1.25-raise*2.4+p.tilt,el=add(sh,V(a1,5.5*sc)),a2=a1+1.7*(1-Math.min(1,raise))-.5*raise,wr=add(el,V(a2,5*sc));
    C([[sh[0],sh[1],2.2*sc],[el[0],el[1],1.8*sc],[wr[0],wr[1],1.4*sc]],'hide',g);const torn=brk.wings,n=5,pg=g==='armN'?'armP':g;
    // one fan of flight feathers hanging from the forearm: a scalloped trailing edge, a pale band of coverts along the arm
    const tips=[],roots=[];for(let i=0;i<n;i++){const k=i/(n-1),base=lerp2(wr,lerp2(el,sh,.5),k),a=a2-PI+.75+k*.35-raise*.9,l=(torn&&i%2?4:11-k*3)*sc;roots.push(base);tips.push(add(base,V(a,l)));}
    tips.forEach((q,i)=>{const c=lerp2(roots[i],q,.5),a=Math.atan2(q[1]-roots[i][1],q[0]-roots[i][0]),l=Math.hypot(q[0]-roots[i][0],q[1]-roots[i][1]);E(c[0],c[1],l*.5,1.9*sc,i%2?'fthA':'fthD',g,{a,pri:(n-i)*.15});});
    C([[el[0],el[1],2.2*sc],[wr[0],wr[1],1.9*sc]],'fthU',g,{pri:1.2});
    for(let i=0;i<n;i+=2)C([lerp2(roots[i],tips[i],.42).concat([.35]),lerp2(roots[i],tips[i],.95).concat([.3])],'fthX',pg,{pri:2.6});
    if(torn)E(...lerp2(roots[1],tips[1],.4),1.2,1,'wound',g,{pri:2.6});
    for(const d of[-.4,.3])C([[wr[0],wr[1],.8],add(wr,V(a2+d,3)).concat([.3])],'claw',g,{pri:2.6});};
  const sh=add(add(Cv,fv,1),up,1.5);arm(add(sh,[4,-1]),'armF',p.arm*.9+.05,1);arm(sh,'armN',p.arm,1.25);
  const eye=add(add(Hn,f,2.6),uH,1.8),blink=(t%3.1)<.1;
  scale(S,Pv[0],GROUND,D.s);const scl=q=>[Pv[0]+(q[0]-Pv[0])*D.s,GROUND+(q[1]-GROUND)*D.s];const E2=scl(eye),M2=scl(mouth),G2=glows.map(scl);
  return{S,mouth:M2,extra:g=>{glowDots(g,G2,D.glowCol,t);ambient(g,D.fx,t,[Pv[0]-30,6,Pv[0]+30,60],6);eyeAt(g,E2[0]-1,E2[1]-1,D.eye,blink,0,D.big);breath(g,D.breathEl||D.el,t,M2,ah+p.beak*.3,p.breath,D.style);}};}

const R=(id,name,b,u,h,d,D)=>make(id,name,{b,u,h,d,glow:D.glowCol},D);
// Quillbeak: a forest raptor bristling with quills, crest and back, a hooked gold beak. Spits sleep pollen.
R('quill','QUILLBEAK','#6a9a4a','#e8dca0','#e0a03a','#3f6a34',{crest:'quills',back:'quills',beak:'hook',tail:'fan',el:'nature',breathEl:'sleep',style:'spit',fx:'spores',eye:'#ffe14d',accent:'#e0a03a'});
// Dustfang: a desert raptor. A toothy snout, a striped frill fanned around its neck, striped flanks. Spits sand.
R('dust','DUSTFANG','#c9a05a','#f2dca0','#6a4a2c','#8a6a34',{crest:'frill',beak:'snout',marks:'stripes',back:'spines',tail:'fan',el:'earth',style:'spit',fx:'dust',eye:'#ffd34d',accent:'#e05a3a'});
// Gustraptor: a storm-chaser with tall swept crest feathers and long tail plumes. Throws gusts and sparks.
R('gust','GUSTRAPTOR','#8a8ad0','#e8e8f8','#ffe14d','#4a4a90',{crest:'swept',back:'plumes',beak:'hook',tail:'plumes',el:'thunder',style:'spit',fx:'sparks',eye:'#ffe14d',accent:'#ffe14d',glowCol:'#ffe14d'});
// Plumecrest: an elegant shore bird-raptor with a great fan crest and trailing plumes. Spits water.
R('plume','PLUMECREST','#3a9ac8','#f0f0e0','#ff7aa8','#2a6a90',{crest:'fan',back:'plumes',beak:'hook',tail:'plumes',el:'water',style:'spit',fx:'bubbles',eye:'#ffffff',accent:'#ff7aa8'});
// Dreadbeak: a dragon-touched raptor with a heavy hooked beak, a bony casque that glows, a skull-pale face. Dragon breath.
R('dread','DREADBEAK','#4a2a4a','#c8a0b8','#e0508a','#2a1a2e',{crest:'bony',back:'spines',beak:'heavy',tail:'long',el:'dragon',style:'breath',fx:'motes',eye:'#ff7ab0',accent:'#e0508a',glowCol:'#ff6ab0',big:1});
// Tempestbeak: a thunder raptor with lightning-bolt crest feathers and bolts down its flanks. Breathes lightning.
R('temp','TEMPESTBEAK','#3a3f7a','#c8c8f0','#ffe14d','#23265a',{s:1.04,crest:'bolt',back:'plumes',marks:'bolts',beak:'hook',tail:'long',el:'thunder',style:'breath',fx:'sparks',eye:'#ffe14d',accent:'#ffe14d',glowCol:'#ffe14d'});
})();
