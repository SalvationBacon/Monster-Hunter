// BIRDS of legend (the raptors), on real bird anatomy: a deep body, folded wings with long primary feathers that open
// into a spread, a beak, feathered thighs, scaled legs and talons.
//   stymph       Quillbeak: the Stymphalian bird. Bronze feathers it can shoot like darts, a long spear beak.
//   cockatrice   Dustfang: the cockatrice. A rooster's head with comb and wattles, small wings, a long scaled serpent's tail.
//   thunderbird  Gustraptor: the Thunderbird. A great eagle that holds its wings raised, lightning across the feathers.
//   fenghuang    Plumecrest: the Chinese phoenix. Slender and long-necked, a crest of plumes, long flowing tail streamers with eyes.
//   griffin      Dreadbeak: the griffin. An eagle's head, wings and taloned forelegs on a lion's hindquarters and tufted tail.
//   roc          Tempestbeak: the roc. A colossal eagle, wings folded, huge talons, a storm about it.
(()=>{
const {V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,glowDots}=KIT,PI=Math.PI;
const GROUND=66;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={wingF:{z:1,R:2,k:1,dk:-1},legF:{z:2,R:2.6,k:1.4,dk:-.9},tailF:{z:2.6,R:1.4,k:.7},tail:{z:3,R:2.4,k:1.2},body:{z:4,R:5.4,k:2.2},neck:{z:4.2,R:3.2,k:1.6},head:{z:4.4,R:3,k:1.4},
  beak:{z:4.6,R:1.4,k:.8},mouth:{z:4.65,R:1,k:1},crest:{z:4.8,R:1.2,k:.7},legN:{z:6,R:2.8,k:1.4},wingN:{z:7,R:2,k:1},wpat:{z:7.1,R:1,k:.6,soft:1}};
const REST=Object.assign({},MON.quill.rest,{n1:-.1,n2:-.2,n3:.25,hr:-.7}),CLIPS=MON.quill.clips;
function make(id,name,look,B){B=Object.assign({plan:'stymph',s:1,el:'nature',style:'spit',eye:'#f6e7a0',glowCol:look.glow||'#ffe680',fx:null,neckL:9,beakL:7},B);
  const base=ENG.materials(look),mats={plumA:Object.assign(one(B.plumA||(B.plan==='stymph'?B.metal:look.b)),{tex:'fur'}),plumU:one(look.u),plumD:one(look.d),plumX:one(B.accent||look.h),beakM:one(B.beakCol||look.h),
    metal:Object.assign(one(B.metal||look.b),{dk:-.2}),comb:one(B.combCol||'#e2483d'),scaleM:Object.assign(one(B.scaleCol||look.d),{tex:'dscale'}),lion:Object.assign(one(B.lionCol||look.u),{tex:'fur'}),
    lava:Object.assign(one(B.glowCol),{flat:.95}),leg:one(B.legCol||'#c8a050'),eyeSpot:one(B.spotCol||look.h)};
  return MON[id]={id,name,rig:'raptor',stance:B.plan,el:B.el,style:B.style,D:B,W:96,H:72,look,mats,groups,rest:REST,clips:CLIPS,build(p,brk,t){return build(p,brk,t,B);}};}

function build(p,brk,t,B){const K=kit(),{S,E,C,P}=K,G=[],pl=B.plan,br=Math.sin(t*3)*.5+.5,big=pl==='roc'?1.15:pl==='thunderbird'?1.08:1;
  const quad=pl==='griffin',Pv=[p.px+(quad?4:0),p.py+p.crouch*4+(quad?6:pl==='fenghuang'?0:4)],fwd=PI+p.tilt+(quad?-.12:0),fv=V(fwd,1),up=V(fwd+PI/2,1),dn=V(fwd-PI/2,1);
  const bodyM=pl==='stymph'?'metal':'plumA';
  // body: deep breast in front, tapering back
  E(Pv[0],Pv[1],(quad?13:10)*big,(quad?7:7.4)*big,bodyM,'body',{a:-p.tilt});E(...add(add(Pv,fv,6*big),dn,1),6.4*big,6.6*big,bodyM,'body',{bulge:1});
  E(...add(add(Pv,fv,6*big),dn,3.4),4.4*big,4.4*big,'plumU','body',{pri:1.3});
  if(quad){E(...add(Pv,fv,-7),7.5,6.5,'lion','body',{bulge:1});}
  // neck and head
  const N0=add(add(Pv,fv,8*big),up,3.4*big),nk=chain(N0[0],N0[1],fwd+1.3,[[B.neckL/3,p.n1],[B.neckL/3,p.n2],[B.neckL/3,p.n3]]),Hn=nk[3],hs=B.headS||1.2;
  C([[N0[0],N0[1],5*big],[nk[1][0],nk[1][1],4.2*big],[nk[2][0],nk[2][1],3.8*big],[Hn[0],Hn[1],3.6*big]],pl==='cockatrice'?'plumA':bodyM,'neck');
  const ah=Math.atan2(Hn[1]-nk[2][1],Hn[0]-nk[2][0])+p.hr,f=V(ah,1),uH=V(ah+PI/2,1),dH=V(ah-PI/2,1),at=(x,y)=>add(add(Hn,f,x*big*hs),uH,y*big*hs);
  E(...at(1.4,.8),4.6*big,4.2*big,pl==='thunderbird'?'plumX':pl==='stymph'?'metal':'plumA','head',{a:ah-PI});
  // beak
  const bk=brk.head,L=B.beakL*(bk?.6:1),open=p.beak,lo=V(ah-open*.55,1);let mouth;
  if(pl==='stymph'){P([at(3.6,1.6),at(3.6+L*1.4,-.2),at(3.6,-1.2)],'beakM','beak',{k:.3});P([at(3.6,-1),add(at(3.6,-1),lo,L*1.25*big),at(3.6,-1.8)],'beakM','beak',{k:.3});mouth=at(3.6+L,-.6);}
  else if(pl==='cockatrice'){P([at(3.4,1.4),at(3.4+L*.6,.2),at(3.4+L*.7,-1.4),at(3.4,-1)],'beakM','beak',{k:.4});P([at(3.4,-1),add(at(3.4,-1),lo,L*.5*big),at(3.4,-1.8)],'beakM','beak',{k:.3});mouth=at(3.4+L*.6,-.8);
    if(!bk)for(let i=0;i<4;i++)E(...at(-1+i*1.4,4.2-Math.abs(i-1.5)*.4),1.3,1.7,'comb','crest',{});E(...at(3,-3.4),1.2,2,'comb','crest',{});}
  else{const hv=pl==='griffin'||pl==='roc'?1.25:1;P([at(3,2.4*hv),at(3+L*.7,1.6*hv),at(3.2+L,-.6),at(3+L*.85,-1.8),at(3,-1.2)],'beakM','beak',{k:.4});
    P([at(3,-1.2),add(at(3,-1.2),lo,L*.7*big),add(add(at(3,-1.2),lo,L*.4*big),V(ah-open*.55-PI/2,1),1.2),at(3,-2)],'beakM','beak',{k:.4});mouth=at(3+L*.8,-1);}
  if(open>.05)P([at(3.2,-.6),at(3+L*.7,-1.2),add(at(3,-1.2),lo,L*.6*big),at(3,-1.6)],'mouth','mouth');
  if(bk&&pl!=='cockatrice')P([at(3+L,0),at(3.8+L,-.6),at(3+L,-1.4)],'core','beak',{k:.3,pri:2.6});
  // crests
  if(!bk){if(pl==='stymph')for(let i=0;i<5;i++)spike(K,at(-1-i*.6,2.6),ah+PI-.2-i*.24-p.crest*.2,6+i%2*2,.8,'metal','crest');
    if(pl==='fenghuang')for(let i=0;i<4;i++){const b=at(-.5-i*.8,3),a=ah+PI/2+.4-i*.28+Math.sin(t*2.4+i)*.1,e=add(b,V(a,7+i));C([b.concat([.5]),e.concat([.35])],'plumD','crest');E(e[0],e[1],1.6,1.1,i%2?'plumX':'lava','crest',{a});}
    if(pl==='thunderbird')for(let i=0;i<3;i++)P([at(-1-i*1.2,3),at(-6-i*1.4,4.4-i),at(-3-i*1.2,1.6)],'plumD','crest',{k:.3});
    if(pl==='griffin')for(const s of[0,1.4])P([at(-1.4-s,3),at(-.8-s,8),at(.6-s,3.2)],'plumD','crest',{k:.3});}
  // wings: folded with long primaries, or spread
  // folded: the arm lies along the side and the primaries sweep back past the tail. Spread: up and back, feathers fanned.
  const lerpA=(x,y,k)=>x+(y-x)*k;
  const wing=(sh,g,raise,sc)=>{const r=Math.max(0,Math.min(1.2,raise)),k=Math.min(1,r),a1=lerpA(fwd+PI+.35,fwd+PI/2+.55,k),el=add(sh,V(a1,6*sc)),a2=lerpA(a1+PI-.3,a1-.35,k),wr=add(el,V(a2,lerpA(5,8,k)*sc)),pg=g==='wingN'?'wpat':g;
    const n=brk.wings?5:8;for(let i=0;i<n;i++){const q=i/7,root=q<.45?lerpA(0,1,0)||lerp2(wr,el,q/.45):lerp2(el,sh,(q-.45)/.55),fa=lerpA(fwd+PI-.12+q*.22,a2+.1+q*1.5,k),l=(brk.wings&&i%2?5:(lerpA(15,12,k)-q*lerpA(8,5,k)))*sc*(1+r*.15);
      E(...add(root,V(fa,l/2)),l/2,lerpA(1.5,1.9,k)*sc,i%2?'plumD':'plumA',g,{a:fa,pri:(8-i)*.1});}
    C([sh.concat([2.6*sc]),el.concat([2.2*sc]),wr.concat([1.7*sc])],pl==='stymph'?'metal':'plumA',g);
    for(let i=0;i<3;i++){const c=lerp2(sh,lerp2(el,wr,.5),.25+i*.28),fa=lerpA(fwd+PI,a2+1.2,k);E(...add(c,V(fa,2.4*sc)),3.4*sc,1.6*sc,'plumU',g,{a:fa,pri:1.2});}
    if(B.wbolts&&!brk.wings)bolt(K,lerp2(el,wr,.3),lerpA(fwd+PI,a2+.6,k),11*sc,1.4,'lava',pg,{pri:2.6});};
  const sh=add(add(Pv,fv,(quad?7:5)*big),up,3*big),raise=pl==='thunderbird'?.95+p.arm*.3:p.arm;
  // tail
  const tb=add(add(Pv,fv,-(quad?14:9)*big),up,1);
  if(pl==='cockatrice'){const sp=chain(tb[0],tb[1],.25+p.tb,brk.tail?[[5,.1],[5,.1]]:[[5,.15+Math.sin(t*2.2)*.12],[5,.15],[5,.12+Math.sin(t*2.2-1)*.15],[4.6,.1],[4,.1],[3.6,.05]]);C(sp.map((q,i)=>[q[0],q[1],Math.max(.8,4-i*.55)]),'scaleM','tail');
    const e=sp[sp.length-1],ea=Math.atan2(e[1]-sp[sp.length-2][1],e[0]-sp[sp.length-2][0]);if(brk.tail)wound(K,e,ea,.5,'tail');else P([add(e,V(ea+PI/2,1.4)),add(e,V(ea,5)),add(e,V(ea-PI/2,1.4))],'scaleM','tail',{k:.3});}
  else if(pl==='griffin'){const sp=chain(tb[0],tb[1],.4+p.tb,brk.tail?[[5,.2]]:[[5,.3+Math.sin(t*2.6)*.15],[5,.3],[4.4,.3],[4,.2]]);C(sp.map((q,i)=>[q[0],q[1],1.4]),'lion','tail');const e=sp[sp.length-1];if(!brk.tail)E(e[0],e[1],2.4,2,'plumD','tail',{});else wound(K,e,.6,.4,'tail');}
  else if(pl==='fenghuang'){const n=brk.tail?2:4;for(let i=0;i<n;i++){const segs=[];for(let j=0;j<6;j++)segs.push([5.4,.06+i*.03+Math.sin(t*1.8-j*.7+i)*.09]);const sp=chain(tb[0],tb[1],.3+i*.18+p.tb,segs);
      C(sp.map((q,j)=>[q[0],q[1],1.2-j*.12]),i%2?'plumX':'plumA','tailF');const e=sp[sp.length-1];E(e[0],e[1],2.6,1.8,'plumD','tailF',{});E(e[0],e[1],1.2,1,'eyeSpot','tailF',{pri:2.6});}}
  else{const n=brk.tail?3:5,len=pl==='roc'?12:pl==='thunderbird'?13:11;for(let i=0;i<n;i++){const a=.1+p.tb+(i-2)*.16+Math.sin(t*2.6+i)*.03,c=add(tb,V(a,len*big/2));E(c[0],c[1],len*big/2,1.8*big,i%2?'plumD':bodyM,'tail',{a,pri:i*.1});}
    if(pl==='stymph'&&!brk.tail)for(let i=0;i<3;i++){const a=.1+p.tb+(i-1)*.2,b=add(tb,V(a,len*big*.9));spike(K,b,a,3,.8,'metal','tail');}}
  wing(add(sh,[4,-1]),'wingF',raise*.95+(pl==='thunderbird'?.05:0),(quad?1.05:.95)*big);
  // legs: feathered thighs, scaled shanks, talons. The griffin walks on eagle forelegs and lion hind legs.
  const birdLeg=(hip,fx,lf,g,sc)=>{const fy=GROUND-lf,an=[fx+2,fy-6],kn=ik(hip[0],hip[1],an[0],an[1],7*sc,6.6*sc,-1);E(hip[0],hip[1]+1,4.6*sc,5.6*sc,bodyM,g,{a:.3,bulge:1});
    C([[hip[0],hip[1]+1,3.6*sc],[kn[0],kn[1],2.2*sc]],bodyM,g);C([[kn[0],kn[1],1.5*sc],[an[0],an[1],1.3*sc],[fx,fy-.6,1.2*sc]],'leg',g);
    for(const d of[-4.4,-2.6,-.8])C([[fx,fy-.4,1*sc],[fx+d*sc,fy+.3,.6],[fx+d*sc-1.4,fy-.4,.3]],'claw',g,{pri:2.6});C([[fx,fy-.4,.9],[fx+2.6*sc,fy-.2,.35]],'claw',g,{pri:2.6});};
  const lionLeg=(hip,fx,lf,g)=>{const fy=GROUND-lf,an=[fx,fy-3],kn=ik(hip[0],hip[1],an[0],an[1],8,7,1);E(hip[0],hip[1]+1,5,6.4,'lion',g,{bulge:1});C([[hip[0],hip[1]+1,4],[kn[0],kn[1],2.6],[an[0],an[1],2.2]],'lion',g);E(fx-1,fy-1.4,2.8,1.6,'lion',g,{});};
  if(quad){const hip=add(Pv,fv,-9),fsh=add(Pv,fv,7);lionLeg(add(hip,[3,2]),hip[0]+6+p.fl*.3,p.fl,'legF');lionLeg(add(hip,[-1,3]),hip[0]-1+p.fr*.3,p.fr,'legN');
    birdLeg(add(fsh,[3,2]),fsh[0]+1-p.fl*.4,p.fl,'legF',.85);birdLeg(add(fsh,[-1,3]),fsh[0]-6-p.fr*.5,p.fr,'legN',.85);}
  else{const hip=add(add(Pv,fv,-1),dn,3*big),sc=big*(pl==='fenghuang'?1.15:pl==='cockatrice'?.9:1);birdLeg(add(hip,[3,0]),Pv[0]+2+p.fl*.4,Math.max(0,p.fl),'legF',sc);birdLeg(hip,Pv[0]-5+p.fr*.5,Math.max(0,p.fr),'legN',sc);
    if(pl==='cockatrice')C([[Pv[0]-5,GROUND-4,.8],[Pv[0]-2,GROUND-6,.3]],'claw','legN',{pri:2.6});}
  wing(sh,'wingN',raise,(quad?1.15:1.05)*big);
  if(pl==='roc'||pl==='thunderbird')for(let i=0;i<4;i++)G.push(add(add(Pv,fv,-4+i*3),up,2+Math.sin(i*2)*3));
  const eye=at(2.2,1.6),blink=(t%3.1)<.1;
  scale(S,Pv[0],GROUND,B.s);const scl=q=>[Pv[0]+(q[0]-Pv[0])*B.s,GROUND+(q[1]-GROUND)*B.s];const E2=scl(eye),M2=scl(mouth),G2=G.map(scl);
  return{S,mouth:M2,extra:g=>{glowDots(g,G2,B.glowCol,t);ambient(g,B.fx,t,[Pv[0]-34,6,Pv[0]+30,60],7);eyeAt(g,E2[0]-1,E2[1]-1,B.eye,blink,0,0);breath(g,B.breathEl||B.el,t,M2,0,p.breath,B.style);}};}

const R=(id,name,b,u,h,d,B)=>make(id,name,{b,u,h,d,glow:B.glowCol},B);
R('quill','QUILLBEAK','#6a9a4a','#e8dca0','#e0a03a','#3f6a34',{plan:'stymph',metal:'#b08a4a',beakCol:'#e0a03a',beakL:8,el:'nature',breathEl:'sleep',style:'spit',fx:'spores',eye:'#ffe14d',neckL:8});
R('dust','DUSTSPUR','#c9a05a','#f2dca0','#6a4a2c','#8a6a34',{plan:'cockatrice',beakCol:'#e8c060',combCol:'#d83a2a',scaleCol:'#7a5a2c',beakL:6,el:'earth',style:'spit',fx:'dust',eye:'#ffd34d',neckL:8});
R('gust','GUSTHAWK','#8a8ad0','#e8e8f8','#ffe14d','#4a4a90',{plan:'thunderbird',neckL:7,accent:'#e8e8f8',beakCol:'#ffd34d',wbolts:1,beakL:7,el:'thunder',style:'spit',fx:'sparks',eye:'#ffe14d',glowCol:'#ffe14d'});
R('plume','PLUMECREST','#3a9ac8','#f0f0e0','#ff7aa8','#2a6a90',{plan:'fenghuang',accent:'#ff7aa8',beakCol:'#ffd34d',spotCol:'#ffd34d',glowCol:'#ffb0d0',beakL:5,el:'water',style:'spit',fx:'bubbles',eye:'#ffffff',neckL:14,legCol:'#e8a050'});
R('dread','DREADBEAK','#4a2a4a','#c8a0b8','#e0508a','#2a1a2e',{plan:'griffin',lionCol:'#8a6a7a',beakCol:'#e8d8c8',beakL:7.5,el:'dragon',style:'breath',fx:'motes',eye:'#ff7ab0',glowCol:'#ff6ab0',neckL:8});
R('temp','TEMPESTBEAK','#3a3f7a','#c8c8f0','#ffe14d','#23265a',{plan:'roc',beakCol:'#ffd34d',beakL:8,el:'thunder',style:'breath',fx:'sparks',eye:'#ffe14d',glowCol:'#ffe14d',neckL:7});
})();
