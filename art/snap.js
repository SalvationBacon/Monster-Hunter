// SNAPJAWS: the small pack hunters, one kind per biome. A lean little dromaeosaur: a long horizontal body held level
// over long legs, a stiff balancing tail, a long low head full of teeth, small grasping hands and a raised sickle claw
// on each foot. Each biome gives it its own skin (feathered or scaled), crest, back, markings and tail tip.
(()=>{
const {V,add,lerp2,chain,ik,kit,spike,bolt,ambient,glowDots,eyeAt,scale}=KIT,PI=Math.PI;
const GROUND=66;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={armF:{z:1,R:1.4,k:.8,dk:-1},legF:{z:2,R:2.4,k:1.4,dk:-.9},tailF:{z:3,R:1.2,k:.7},back:{z:3.4,R:1.2,k:.7},body:{z:4,R:4,k:2},
  jaw:{z:4.05,R:1,k:.8},head:{z:4.3,R:2.2,k:1.2},crest:{z:4.6,R:1.2,k:.7},legN:{z:6,R:2.6,k:1.4},armN:{z:7,R:1.4,k:.8}};
const rest={px:60,py:47,tilt:.04,n1:-.25,n2:-.35,hr:-.55,jaw:0,arm:0,fN:0,lN:0,fF:0,lF:0,tb:-.12,crouch:0,crest:0,breath:0,tw:1};
const clips={idle:{len:2,loop:1,keys:[[0,{}],[.5,{n1:-.35,hr:-.45,crest:.4,tb:-.08}],[1,{py:47.5,jaw:.12,tb:-.16}],[1.5,{n1:-.2,hr:-.65,arm:.2}],[2,{}]]},
  // the bite: rock back, then lunge, neck out and jaws wide, and snap shut
  peck:{len:1.0,keys:[[0,{}],[.32,{px:63,py:46,crouch:.4,tilt:-.08,n1:-.05,n2:-.1,hr:-.75,jaw:.25,crest:1,arm:.3,tb:.05}],
    [.44,{px:51,py:47,crouch:.1,tilt:.12,n1:-.7,n2:-.55,hr:-.1,jaw:1,arm:.8,fN:-6,lN:2,tb:-.35}],[.52,{px:50,tilt:.14,n1:-.75,n2:-.55,hr:-.05,jaw:0,arm:.9,fN:-6,tb:-.4}],
    [.62,{px:52,jaw:.35,n1:-.6,hr:-.2}],[1,{}]]},
  // a leap with both sickle claws forward
  pounce:{len:1.3,keys:[[0,{}],[.35,{px:63,py:49,crouch:1,tilt:.2,arm:.4,crest:1,jaw:.3,tb:-.3}],[.55,{px:46,py:30,crouch:0,tilt:-.25,arm:1,fN:-10,lN:24,fF:-9,lF:23,jaw:1,tb:.25}],
    [.75,{px:40,py:42,tilt:.15,arm:.6,fN:-6,lN:8,fF:-4,lF:8,jaw:.4}],[.9,{px:42,py:48,crouch:.7,tilt:.1}],[1.3,{}]]},
  sweep:{len:1.2,keys:[[0,{}],[.4,{px:62,tilt:.1,tb:-.7,crouch:.3}],[.55,{px:58,tilt:0,tb:.9,fF:3,crouch:.2}],[.68,{px:57,tb:1.5,fF:3}],[.85,{tb:.6}],[1.2,{}]]},
  // a hiss: head up, jaws open, hands spread, crest raised
  clap:{len:1.2,keys:[[0,{}],[.3,{tilt:.2,n1:.05,n2:0,hr:-.75,jaw:1,crest:1,arm:1,py:46}],[.8,{tilt:.22,n1:.08,n2:0,hr:-.8,jaw:.9,crest:1,arm:1.1,py:46}],[1.2,{}]]},
  flinch:{len:.6,keys:[[0,{}],[.08,{px:63,py:46,tilt:-.25,n1:.1,hr:-1,arm:.6,crest:1,jaw:.5,tb:.2}],[.6,{}]]}};

function make(id,name,look,D){D=Object.assign({skin:'feather',crest:'swept',back:null,marks:null,tail:'fan',fx:null,el:'nature',eye:'#ffe14d',glowCol:look.glow||'#ffe680'},D);
  const mats={sk:Object.assign(one(look.b),{tex:D.skin==='feather'?'fur':'scale'}),skU:one(look.u),skD:one(look.d),acc:one(look.h),lava:Object.assign(one(D.glowCol),{flat:.95}),bone:one('#ece4d0')};
  return MON[id]={id,name,rig:'raptor',el:D.el,style:'spit',D,W:96,H:72,look,mats,groups,rest,clips,build(p,brk,t){return build(p,brk,t,D);}};}

function build(p,brk,t,D){const K=kit(),{S,E,C,P}=K,glows=[],br=Math.sin(t*3)*.3;
  const Pv=[p.px,p.py+p.crouch*3],fwd=PI+p.tilt,fv=V(fwd,1),up=V(fwd+PI/2,1),Cv=add(Pv,fv,10);
  // body: a deep chest tapering to the hips, a pale underside
  E(Pv[0],Pv[1],5.4,4.6,'sk','body',{a:-p.tilt});C([[Pv[0],Pv[1],4.6],[Cv[0],Cv[1]+.4,5+br]],'sk','body');
  C([[Pv[0]-1,Pv[1]+2.4,2.6],[Cv[0]+.5,Cv[1]+2.6,3.4]],'skU','body',{pri:1.2});
  if(D.marks==='stripes')for(let i=0;i<4;i++){const q=add(add(Pv,fv,-1+i*3.3),up,3.6);E(q[0],q[1],.8,2.4,'skD','body',{a:-p.tilt+.35,pri:2.6,k:.4});}
  if(D.marks==='spots')for(let i=0;i<5;i++){const q=add(add(Pv,fv,-2+i*2.8),up,2.4+(i%2)*1.6);E(q[0],q[1],.9,.8,'skD','body',{pri:2.6,k:.4});}
  if(D.marks==='bolts')for(let i=0;i<2;i++)bolt(K,add(add(Pv,fv,1+i*5),up,3.8),PI/2+.4,4,.9,'lava','body',{pri:2.6});
  // down the back
  for(let i=0;i<4;i++){const q=add(add(Pv,fv,-1+i*3.4),up,4.4),ua=fwd+PI/2+.45;
    if(D.back==='spines')spike(K,q,ua,2.6+(i%2),.8,'bone','back');
    else if(D.back==='plumes')E(...add(q,V(ua,1.6)),2.4,.9,i%2?'skU':'skD','back',{a:ua});}
  // neck: up and forward from the chest
  const N0=add(add(Cv,fv,1.5),up,2.4),nk=chain(N0[0],N0[1],fwd+1.3,[[5.4,p.n1],[4.6,p.n2]]),Hn=nk[2];
  C([[Cv[0],Cv[1],4],[nk[1][0],nk[1][1],2.5],[Hn[0],Hn[1],2.2]],'sk','body');C([[Cv[0]-.4,Cv[1]+2,2.4],[nk[1][0]+.4,nk[1][1]+1.4,1.6]],'skU','body',{pri:.9});
  // head: a long low skull, the upper jaw lined with teeth, a lower jaw that drops open
  const na=Math.atan2(Hn[1]-nk[1][1],Hn[0]-nk[1][0]),ah=na+p.hr,f=V(ah,1),uH=V(ah+PI/2,1),dH=V(ah-PI/2,1),bk=V(ah+PI,1);
  const Hc=add(Hn,f,1.6);E(Hc[0],Hc[1],3.8,3,'sk','head',{a:ah});
  const s0=add(add(Hc,f,1.8),uH,.4),s1=add(add(Hc,f,8.4),dH,.1);C([s0.concat([2.3]),s1.concat([1.3])],'sk','head');
  const aj=ah-p.jaw*.75,J0=add(add(Hc,f,.8),dH,1.4),J1=add(J0,V(aj,6.2));C([J0.concat([1.5]),J1.concat([.9])],'sk','jaw');C([add(J0,dH,.7).concat([.8]),add(J1,V(aj-PI/2,.4)).concat([.5])],'skU','jaw',{pri:1});
  if(p.jaw>.08){P([add(s0,dH,1.2),add(s1,dH,.9),J1,J0],'mouth','jaw');{const b=add(add(J0,V(aj,4.6)),V(aj+PI/2,.5));P([add(b,V(aj,-.3)),add(b,V(aj,.3)),add(b,V(aj+PI/2,.8))],'tooth','jaw',{pri:2.6});}}
  if(p.jaw<=.08)C([add(s0,dH,1.5).concat([.35]),add(s1,dH,.7).concat([.3])],'mouth','head',{pri:2.6});   // the grin line
  {const open=p.jaw>.08;for(const k of open?[.55,.85]:[.35,.6,.85]){const q=add(lerp2(s0,s1,k),dH,open?1.5-k*.6:1.6-k*.7);P([add(q,f,-.35),add(q,f,.35),add(q,dH,open?.7:.8)],'tooth','head',{pri:2.7});}}
  E(...add(add(Hc,f,-.4),uH,1.4),1.4,.9,'skD','head',{a:ah,pri:1.5});   // brow ridge over the eye
  // crest
  const cb=add(add(Hc,bk,1),uH,2),cr=p.crest,hb=brk.head;
  if(D.crest==='swept')for(let i=0;i<3;i++){const b=add(cb,bk,i*1.1),a=ah+PI-.5-i*.15-cr*.35+Math.sin(t*3+i)*.04,l=(hb?2:6-i*1.2)+cr*1.5;
      P([b,add(add(b,V(a,l*.5)),V(a+PI/2,1)),add(b,V(a,l)),add(add(b,V(a,l*.5)),V(a-PI/2,.7))],['acc','skU','skD'][i],'crest',{k:.4});}
  else if(D.crest==='frill')for(let i=0;i<5;i++){const a=ah+PI*.6+i*.24,l=(hb?2:4.2)*(1+cr*.35),q=add(add(Hc,bk,1.6),V(a,1.6));P([add(q,V(a+PI/2,.9)),add(q,V(a,l)),add(q,V(a-PI/2,.9))],i%2?'acc':'skD','crest',{k:.4});}
  else if(D.crest==='bony'){P([add(cb,f,2.4),add(add(cb,uH,2.6+cr),f,.2),add(add(cb,uH,2.2+cr),bk,2.8),add(cb,bk,3.4)],'bone','crest',{k:.4});glows.push(add(add(cb,uH,1.4),bk,.6));}
  else if(D.crest==='bolt')for(let i=0;i<2;i++)bolt(K,add(cb,bk,i*1.2),ah+PI-.6-i*.3-cr*.3,(hb?2:5.5-i)+cr*1.5,1.1,i?'lava':'acc','crest');
  else if(D.crest==='fan')for(let i=0;i<4;i++){const a=ah+PI/2+.75-i*.32-cr*.2,l=(hb?2:5.2+(i===1?1.4:0))*(1+cr*.3),q=add(cb,V(a,l));C([cb.concat([.5]),q.concat([.4])],'skD','crest');E(q[0],q[1],1.3,.9,i%2?'acc':'skU','crest',{a,pri:1});}
  else if(D.crest==='horns')for(const s of[0,1]){const b=add(cb,bk,s*1.6);spike(K,b,ah+PI-.9-s*.2-cr*.2,3.6-s*.6,1,'bone','crest');}
  // tail: long and held stiffly out behind, with a tip that suits the biome
  const ts=[];for(let i=0;i<6;i++)ts.push([3.7,(i?-.02:0)+Math.sin(t*2.6-i*.7)*.05*p.tw]);const front=p.tb>1.1,tg=front?'armN':'body';
  const T0=add(add(Pv,fv,-3),up,1),tl=chain(T0[0],T0[1],p.tilt*-1+p.tb,ts);C(tl.map((q,i)=>[q[0],q[1],Math.max(.7,3.8-i*.55)]),'sk',tg);
  C(tl.slice(0,4).map((q,i)=>[q[0],q[1]+1.6-i*.3,Math.max(.6,2-i*.4)]),'skU',tg,{pri:.9});
  const te=tl[tl.length-1],ta=Math.atan2(te[1]-tl[tl.length-2][1],te[0]-tl[tl.length-2][0]),fg=front?'armN':'tailF';
  if(D.tail==='fan')[[-.35,6],[0,7],[.35,6]].forEach(([da,l],i)=>{const a=ta+da+Math.sin(t*3+i)*.05,c=add(te,V(a,l*.5));E(c[0],c[1],l*.5,1.2,['skD','acc','skD'][i],fg,{a,pri:i*.1});});
  else if(D.tail==='plumes')for(let i=0;i<3;i++){const a=ta-.3+i*.3+Math.sin(t*2+i)*.08,e=add(te,V(a,6+i*1.5));C([te.concat([.5]),e.concat([.3])],'skD',fg);E(e[0],e[1],1.3,1.3,i===1?'acc':'skU',fg,{});}
  else if(D.tail==='spike')P([add(te,V(ta+PI/2,1.2)),add(te,V(ta,4.4)),add(te,V(ta-PI/2,1.2))],'bone',fg,{k:.3});
  else if(D.tail==='club'){E(...add(te,V(ta,1.6)),2.2,1.8,'bone',fg,{a:ta});glows.push(add(te,V(ta,1.6)));}
  // legs: a muscled thigh, knee forward, a long shank to a high ankle, toes, and the sickle claw held up off the ground
  const leg=(hip,fx,lift,g)=>{const fy=GROUND-lift,an=[fx+2.6,fy-5],kn=ik(hip[0],hip[1],an[0],an[1],6.6,6.6,-1);
    E(hip[0],hip[1]+.6,3.6,4.4,'sk',g,{a:.3,bulge:1});C([[hip[0],hip[1]+.8,3.2],[kn[0],kn[1],1.9],[an[0],an[1],1.2]],'sk',g);
    C([[an[0],an[1],1],[fx,fy-.7,.7]],'sk',g);for(const d of[-2.4,-1])C([[fx,fy-.4,.55],[fx+d,fy+.2,.3]],'claw',g);
    const sc=[fx+.4,fy-1.3];C([sc.concat([.55]),add(sc,[-1.2,-1.8]).concat([.4]),add(sc,[-2.2,-1]).concat([.2])],'claw',g,{pri:2.6});};
  const hip=add(Pv,V(fwd+1.5,2));leg(add(hip,[2.4,-.4]),p.px+1+p.fF,Math.max(0,p.lF),'legF');leg(hip,p.px-5+p.fN,Math.max(0,p.lN),'legN');
  // hands: small arms with three curved claws, raised to grab in an attack
  const arm=(sh,g,sc)=>{const a1=fwd-.95+p.arm*.85,el=add(sh,V(a1,3*sc)),a2=a1+.85-p.arm*.3,wr=add(el,V(a2,2.8*sc));
    C([[sh[0],sh[1],1.3*sc],[el[0],el[1],.9*sc],[wr[0],wr[1],.7*sc]],'sk',g);
    if(D.skin==='feather')E(...lerp2(el,wr,.6),1.6*sc,.6*sc,'skD',g,{a:a2+.4,pri:.5});
    for(const d of[-.55,-.1,.35])C([[wr[0],wr[1],.5],add(wr,V(a2+d+.4,1.7)).concat([.25])],'claw',g,{pri:2.6});};
  const sh=add(add(Cv,fv,.5),up,-1.2);arm(add(sh,[2.4,-.6]),'armF',.9);arm(sh,'armN',1);
  for(const q of S)if(q.pri>=2.5)q.top=1;   // small details colour only themselves
  let eye=add(add(Hc,f,-.2),uH,.9),mouth=lerp2(s1,J1,.5),G2=glows;const blink=(t%2.7)<.09;
  if(D.s&&D.s!==1){scale(S,Pv[0],GROUND,D.s);const sc=q=>[Pv[0]+(q[0]-Pv[0])*D.s,GROUND+(q[1]-GROUND)*D.s];eye=sc(eye);mouth=sc(mouth);G2=glows.map(sc);}   // an alpha is drawn bigger
  return{S,mouth,extra:g=>{glowDots(g,G2,D.glowCol,t);if(D.fx)ambient(g,D.fx,t,[Pv[0]-20,20,Pv[0]+20,60],3);eyeAt(g,eye[0]-1,eye[1]-1,D.eye,blink,1,0);}};}

// each kind also has a rare ALPHA: a size bigger, darker, with a gold crest, back spines and red eyes
const R=(id,b,u,h,d,D)=>{make(id,'SNAPJAW',{b,u,h,d,glow:D.glowCol},D);make(id.replace('snap','snapA'),'ALPHA SNAPJAW',{b:ENG.mix(b,'#141018',.35),u,h:'#ffd34d',d:ENG.mix(d,'#000000',.3),glow:'#ffd34d'},
  Object.assign({},D,{s:1.22,back:'spines',crest:D.crest==='swept'||D.crest==='fan'?'horns':D.crest,eye:'#ff4030',glowCol:'#ffd34d'}));};
R('snap0','#7aa84a','#e0e8b0','#e0a03a','#3f6a34',{skin:'feather',crest:'swept',marks:'stripes',tail:'fan',el:'nature',eye:'#ffe14d'});          // forest
R('snap1','#a8503a','#e8b080','#ffb03a','#4a2420',{skin:'scale',crest:'bony',back:'spines',tail:'club',el:'fire',fx:'embers',eye:'#ffb03a',glowCol:'#ff9a3a'});   // volcano
R('snap2','#c9a05a','#f2dca0','#e05a3a','#7a5a2c',{skin:'scale',crest:'frill',marks:'stripes',tail:'spike',el:'earth',eye:'#ffd34d'});          // desert
R('snap3','#c8dcea','#f4fbff','#6cc4f0','#6a90b0',{skin:'feather',crest:'swept',back:'plumes',tail:'plumes',el:'ice',eye:'#6cc4f0'});            // tundra
R('snap4','#6a70b8','#e0e0f4','#ffe14d','#3a3f7a',{skin:'feather',crest:'bolt',marks:'bolts',tail:'fan',el:'thunder',eye:'#ffe14d',glowCol:'#ffe14d'});   // storm peaks
R('snap5','#6a7a4a','#c8d8a0','#c8f08a','#3a4a2a',{skin:'scale',crest:'frill',back:'spines',marks:'spots',tail:'spike',el:'nature',eye:'#c8f08a'});   // swamp
R('snap6','#c8a87a','#f0ead8','#3a9ac8','#7a5a3a',{skin:'feather',crest:'fan',marks:'spots',tail:'plumes',el:'water',eye:'#ffffff'});            // coast
R('snap7','#8a7a9a','#d8c8e0','#e0508a','#4a3a5a',{skin:'scale',crest:'horns',back:'spines',tail:'club',el:'dragon',eye:'#ff7ab0',glowCol:'#ff6ab0'});   // ruins
})();
