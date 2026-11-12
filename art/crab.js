// CRABS: a wide low shell on eight jointed legs, a crusher claw and a small pincer, eyes on stalks. The spec picks what
// rides on the shell (a crest, a hermit's conch, volcanic vents, a crystal cluster, spikes, flames) and adds a stinger tail.
(()=>{
const {V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,glowDots}=KIT,PI=Math.PI;
const GROUND=66;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={legF:{z:1,R:2,k:1.2,dk:-.9},clawF:{z:2,R:3.5,k:1.6,dk:-.7},sting:{z:4.6,R:2,k:1.2},stalk:{z:3,R:1.6,k:1},body:{z:4,R:8,k:2.4},top:{z:4.3,R:3,k:1.2},crest:{z:4.5,R:1.6,k:.8},
  legN:{z:6,R:2.2,k:1.2},clawN:{z:7,R:4,k:1.6}};
const rest={px:52,py:46,tilt:0,cN:.15,cF:.1,raiseN:.35,reachF:0,eye:0,lift:0,shift:0,lw:0,stab:0,breath:0};
const clips={idle:{len:2.2,loop:1,keys:[[0,{}],[.55,{cN:.25,eye:.6}],[1.1,{cN:0,cF:.3,py:46.6}],[1.65,{cF:0,eye:-.4}],[2.2,{}]]},
  pinch:{len:1.0,keys:[[0,{}],[.35,{px:52,reachF:-2,cF:.6}],[.5,{px:47,reachF:10,cF:.7}],[.58,{reachF:10,cF:0}],[1,{}]]},
  smash:{len:1.4,keys:[[0,{}],[.55,{px:53,py:44,tilt:-.12,raiseN:1,cN:.5}],[.7,{px:47,py:48,tilt:.05,raiseN:-.25,cN:0}],[.85,{py:47,raiseN:-.2}],[1.4,{}]]},
  scuttle:{len:.8,loop:1,keys:[[0,{shift:0,lw:0}],[.2,{shift:-3,lw:1,py:45}],[.4,{shift:-5,lw:0,py:46}],[.6,{shift:-3,lw:-1,py:45}],[.8,{shift:0,lw:0}]]},
  sting:{len:1.2,keys:[[0,{}],[.45,{px:54,py:45,tilt:-.06,stab:-.4,raiseN:.6,cN:.4}],[.58,{px:49,py:47,tilt:.06,stab:1}],[.72,{stab:1,px:49}],[1.2,{}]]},
  breath:{len:1.8,keys:[[0,{}],[.45,{px:54,py:44,tilt:-.1,eye:.8,raiseN:.7,cN:.5}],[.6,{px:51,py:46,tilt:.04,breath:.15}],[1.3,{px:51,py:46,breath:1}],[1.45,{breath:0}],[1.8,{}]]},
  flinch:{len:.6,keys:[[0,{}],[.08,{px:54,py:44,tilt:-.1,cN:.5,cF:.5,eye:-1}],[.6,{}]]}};

function make(id,name,look,D){D=Object.assign({s:1,top:'crest',sting:null,marks:null,fx:null,el:'water',style:'spit',eye:'#101418',glowCol:look.glow||'#ffe680',clawGlow:0,big:1.25},D);
  const mats={ice:Object.assign(one('#d8f4ff'),{dk:.2}),lava:Object.assign(one(D.glowCol),{flat:.95}),conch:Object.assign(one(D.conch||look.u),{tex:'plate'}),conch2:one(ENG.mix(D.conch||look.u,look.d,.4)),
    gem:Object.assign(one(look.h),{dk:.3}),fire:Object.assign(one('#ff7a2e'),{flat:.9}),rock:one(ENG.mix(look.d,'#000000',.3))};
  return MON[id]={id,name,rig:'crab',el:D.el,style:D.style,D,W:96,H:72,look,mats,groups,rest,clips,build(p,brk,t){return build(p,brk,t,D);}};}

function build(p,brk,t,D){const K=kit(),{S,E,C,P}=K,glows=[],br=Math.sin(t*2)*.5+.5,cx=p.px+p.shift,cy=p.py;
  // shell: wide, low, a domed top and a pale underside
  E(cx,cy-1,20,12.5+br*.3,'shell','body',{a:p.tilt});E(cx,cy-5,16,9,'shell','body',{a:p.tilt,bulge:2.5,bw:6});
  C([[cx-19,cy+4.5,2.6],[cx,cy+7.5,4],[cx+19,cy+4.5,2.6]],'belly','body',{pri:1.4});
  for(let i=0;i<5;i++){const x=cx-21+i*2.2,y=cy-1+i*.4;P([[x,y-2],[x-3.2,y],[x,y+1.2]],'shell','body',{k:.5});}            // a serrated front edge
  if(D.marks==='cracks')for(let i=0;i<10;i++)glows.push([cx-14+i*3.1,cy-5+Math.sin(i*2.1)*3.4]);
  if(D.marks==='spots')for(let i=0;i<6;i++)E(cx-12+i*4.6,cy-6+(i%2)*3,1.4,1.1,'dark','body',{pri:2.6});
  // what rides on the shell (breakable: the "wings" part)
  const top=D.top,bk=brk.wings;
  if(top==='crest'){for(let i=0;i<4;i++){const b=[cx-7+i*6,cy-13+Math.abs(i-1.5)*1.4],h=4+(i%2)*1.5;if(!bk)P([[b[0]-3,b[1]+2],[b[0]-.5,b[1]-h],[b[0]+3,b[1]+2]],'dark','crest',{k:.5});
      else P([[b[0]-3,b[1]+2],[b[0]-2,b[1]-1],[b[0]-.5,b[1]],[b[0]+1,b[1]-1.4],[b[0]+3,b[1]+2]],'dark','crest',{k:.4});}if(bk)P([[cx-2,cy-9.5],[cx+.5,cy-11],[cx+2,cy-9.3]],'core','crest',{k:.3});}
  else if(top==='conch'){const c=[cx+3,cy-14];if(!bk){E(c[0],c[1],13,10,'conch','top',{a:-.2,bulge:2,bw:5});for(let i=0;i<3;i++){const r=9-i*3;E(c[0]+4-i*2.5,c[1]-2-i*2.2,r,r*.75,i%2?'conch2':'conch','top',{a:-.2,pri:1+i,bulge:1});}
      P([[c[0]+8,c[1]-4],[c[0]+15,c[1]-11],[c[0]+12,c[1]-3]],'conch2','top',{k:.4});{const sp=[];for(let i=0;i<14;i++){const a=i*.62,r=9.5-i*.6;sp.push([c[0]+3+Math.cos(a)*r*1.15,c[1]-2+Math.sin(a)*r*.8,.6]);}C(sp,'dark','top',{pri:2.6,k:.4});}for(let i=0;i<4;i++)spike(K,[c[0]-8+i*5,c[1]-8+Math.abs(i-1.5)*1.5],-PI/2-.3+i*.2,4,1.2,'dark','top',{pri:2.6});}
    else{E(c[0],c[1]+2,12,7,'conch','top',{a:-.2});P([[c[0]-6,c[1]-3],[c[0]-2,c[1]-6],[c[0]+1,c[1]-3],[c[0]+5,c[1]-7],[c[0]+9,c[1]-2]],'conch2','top',{k:.3});P([[c[0]-2,c[1]-3],[c[0]+1,c[1]-5],[c[0]+3,c[1]-2]],'core','top',{k:.3,pri:2.6});}}
  else if(top==='vents'){for(let i=0;i<3;i++){const b=[cx-8+i*8,cy-12+Math.abs(i-1)*1.5],h=bk?2:5+(i===1?2:0);P([[b[0]-4,b[1]+3],[b[0]-1.4,b[1]-h],[b[0]+1.4,b[1]-h],[b[0]+4,b[1]+3]],'rock','crest',{k:.4});
      if(!bk){E(b[0],b[1]-h,1.4,.8,'lava','crest',{pri:2.6});glows.push([b[0],b[1]-h-1],[b[0]-.5,b[1]-h+2]);}}}
  else if(top==='crystals'){const shards=[[-6,-4,.5],[-1,-10,-.15],[4,-7,.25],[9,-3,.7],[-11,-1,-.6]];shards.forEach(([dx,h,a],i)=>{const b=[cx+dx*1.1,cy-11+Math.abs(dx)*.15],len=bk?3:7-h*.6;crystal(K,b,-PI/2+a,len,2.4-(i%2)*.6,'gem','top');});
    if(bk)P([[cx-3,cy-12],[cx,cy-14],[cx+3,cy-12]],'core','top',{k:.3,pri:2.6});}
  else if(top==='spikes'){for(let i=0;i<7;i++){const a=-PI+.35+i*.4,b=[cx+Math.cos(a)*15,cy-3+Math.sin(a)*9.5];if(!bk)spike(K,b,a,5+(i%2)*2.5,1.6,'horn','crest');else spike(K,b,a,1.6,1.4,'horn','crest');}}
  else if(top==='flames'){for(let i=0;i<3;i++){const b=[cx-7+i*7,cy-12+Math.abs(i-1)*1.2];P([[b[0]-3,b[1]+2],[b[0],b[1]-2.5],[b[0]+3,b[1]+2]],'rock','crest',{k:.4});if(!bk){flame(K,[b[0],b[1]-1.5],-PI/2+(i-1)*.25,7+(i===1?3:0),2.2,'fire','crest',t,i*2.1,{pri:2.6});flame(K,[b[0],b[1]-1.5],-PI/2+(i-1)*.25,4+(i===1?2:0),1.2,'lava','crest',t,i*2.1+.4,{pri:2.8});}}}
  // a stinger tail arched over the back (breakable: the "tail" part when present)
  let stTip=null;if(D.sting){const st=brk.tail,ang=-PI*.28-p.stab*.3,k=1-p.stab*.12,L=1+p.stab*.3,sp=chain(cx+15,cy-5,ang,st?[[5,-.45],[4.5,-.5]]:[[5.4*L,-.42*k],[5.2*L,-.5*k],[5*L,-.55*k],[4.6*L,-.6*k],[4*L,-.55*k]]);
    C(sp.map((q,i)=>[q[0],q[1],3-i*.32]),'shell','sting');for(let i=1;i<sp.length;i++)E(sp[i][0],sp[i][1],2.6-i*.25,2.2-i*.2,'dark','sting',{pri:2.6,k:.8,a:i});
    const e=sp[sp.length-1],pv=sp[sp.length-2],ea=Math.atan2(e[1]-pv[1],e[0]-pv[0]);
    if(!st){if(D.sting==='scythe'){P([add(e,V(ea+PI/2,1.6)),add(add(e,V(ea,4)),V(ea-PI/2,2)),add(add(e,V(ea,8)),V(ea+PI/2,1.5)),add(e,V(ea-PI/2,1.6))],'horn','sting',{k:.3});glows.push(add(e,V(ea,3)));}
      else{E(e[0],e[1],2.6,2.2,'lava','sting',{a:ea,pri:2.6});P([add(e,V(ea+PI/2,1.2)),add(e,V(ea,5.4)),add(e,V(ea-PI/2,1.2))],'claw','sting',{k:.3,pri:2.6});stTip=add(e,V(ea,5));}}
    else wound(K,e,ea,.6,'sting');}
  // eyes on stalks, with feelers (breakable: the "head" part)
  const stalk=(x,len,g,ph)=>{const b=[x,cy-11],tp=add(b,V(-PI/2-.25+ph*.2+Math.sin(t*1.7+x)*.06,len),1);C([[b[0],b[1],1.7],[tp[0],tp[1],1.3]],'shell',g);E(tp[0],tp[1]-1.2,2.4,2.4,'dark',g,{pri:2});return[tp[0],tp[1]-1.4];};
  const e1=stalk(cx-13,brk.head?3.5:6.5,'stalk',p.eye),e2=stalk(cx-8,brk.head?3:6,'stalk',p.eye);
  if(!brk.head){for(const [e,ph] of [[e1,0],[e2,1.3]]){const f1=add(e,[-2,0]),f2=add(f1,V(-2.5+Math.sin(t*2.3+ph)*.2,8)),f3=add(f2,V(-3.0+Math.sin(t*2.3+ph)*.25,7));C([[f1[0],f1[1],.7],[f2[0],f2[1],.55],[f3[0],f3[1],.35]],'dark','stalk',{k:.4});}}
  else P([[e1[0]-1,e1[1]+3],[e1[0]-2.5,e1[1]+1.6],[e1[0]-1,e1[1]+1]],'core','stalk',{k:.3});
  // legs: four a side, jointed, pointed, splayed
  const legs=(g,side)=>{for(let i=0;i<4;i++){const o=i-1.5,hip=[cx-2+i*4+side,cy+5],lw=(i%2?1:-1)*p.lw,kn=[hip[0]+o*6+side*2+4,cy-1-Math.abs(o)+side],ft=[hip[0]+o*8.5+side*2+5+lw*2,GROUND-Math.max(0,lw*2.5)];
    C([[hip[0],hip[1],3.2],[kn[0],kn[1],2.8]],'shell',g);C([[kn[0],kn[1],2.7],[(kn[0]+ft[0])/2+o,(kn[1]+ft[1])/2,2],[ft[0],ft[1]-1.5,1.1],[ft[0],ft[1],.4]],'dark',g);}};
  legs('legF',3);legs('legN',-1);
  // claws: the small one behind, the crusher in front (without a stinger, the crusher is the breakable "tail" part)
  const claw=(sh,g,size,open,raise,reach,broken)=>{const a=PI+.15+raise*1.3,el=add(sh,V(a,7*size+reach*.4)),wr=add(el,V(a-.7-raise*.5,5.5*size+reach*.6));
    C([[sh[0],sh[1],2.8*size],[el[0],el[1],2.6*size]],'shell',g);C([[el[0],el[1],2.6*size],[wr[0],wr[1],3*size]],'shell',g);
    const pa=Math.atan2(wr[1]-el[1],wr[0]-el[0]),hand=add(wr,V(pa,4*size));E(hand[0],hand[1],5.5*size,4*size,'shell',g,{a:pa,bulge:1.4,bw:2});
    const base=add(hand,V(pa,4*size)),fu=V(pa-.25-open*.5,1),fl=V(pa+.3+open*.35,1),nu=V(pa-PI/2,1),nl=V(pa+PI/2,1);
    if(!broken)P([add(base,nu,2.6*size),add(add(base,fu,9*size),nu,.6),add(base,fu,10.5*size),add(base,nl,.4)],'horn',g,{k:.6});
    else{const m=add(base,fu,4*size);P([add(base,nu,2.6*size),add(m,nu,1.4*size),add(m,fu,1),add(add(m,fu,1.5),nl,.8),add(base,nl,.4)],'horn',g,{k:.5});P([add(m,nu,1),add(m,fu,1.2),add(add(m,fu,1.2),nl,.8)],'core',g,{k:.3,pri:2});}
    P([add(base,nl,2*size),add(add(base,fl,7*size),nl,.5),add(base,fl,8*size),add(base,nu,.6)],'claw',g,{k:.6});
    if(D.clawGlow)for(let i=0;i<4;i++)glows.push(add(add(hand,V(pa,-2+i*1.6),1),V(pa-PI/2,1),1.4*size*(i%2?1:-.5)));
    if(D.clawFlame&&!broken&&g==='clawN')flame(K,add(hand,nu,3.6*size),pa-PI/2+.3,6,1.6,'fire',g,t,1.3,{pri:2.6});
    return lerp2(base,add(base,fu,10*size),.5);};
  claw([cx-11,cy],'clawF',.75,p.cF,p.raiseN*.5,p.reachF,false);const mouthAt=claw([cx-14,cy+3],'clawN',D.big,p.cN,p.raiseN,0,!D.sting&&brk.tail);
  const blink=(t%3.3)<.1,MO=mouthAt;
  scale(S,cx,GROUND,D.s);const sc=q=>[cx+(q[0]-cx)*D.s,GROUND+(q[1]-GROUND)*D.s];const E1=sc(e1),E2=sc(e2),G2=glows.map(sc),M2=sc(MO),ST=stTip&&sc(stTip);
  return{S,mouth:M2,extra:g=>{glowDots(g,G2,D.glowCol,t);ambient(g,D.fx,t,[cx-30,4,cx+30,58],7);
    for(const e of[E1,E2]){const x=Math.round(e[0]),y=Math.round(e[1]);g.fillStyle=blink?'#2a2018':D.eye;g.fillRect(x-1,y,2,2);if(!blink){g.fillStyle=D.eye==='#101418'?'#fff':'#ffffff';g.fillRect(x-1,y,1,1);}}
    if(ST&&D.sting!=='scythe'&&Math.sin(t*4)>.3){g.fillStyle=D.glowCol;g.fillRect(Math.round(ST[0]),Math.round(ST[1])+1,1,1);}
    breath(g,D.el==='nature'?'poison':D.el,t,M2,PI+.15,p.breath,D.style);}};}

const R=(id,name,b,u,h,d,D)=>make(id,name,{b,u,h,d,glow:D.glowCol,m:D.m},D);
// Mudclaw: a mud crab. A crest of shell plates, a huge crusher, eyes on stalks.
R('mud','MUDCLAW','#8a6a44','#d8c49a','#e8dcc0','#4a3a28',{m:'#6a7a3a',el:'water',fx:null});
// Shellsnap: a hermit crab that lives in a great spiral conch, spiked along its rim. Spits water.
R('shell','SHELLSNAP','#4a8ab8','#e8dcc0','#f0ead8','#2a5a80',{top:'conch',conch:'#e8c8a8',el:'water',fx:'bubbles',style:'spit'});
// Venomsting: a scorpion-crab. A segmented stinger arched over its back with a glowing venom bulb. Spits poison.
R('sting','VENOMSTING','#7a4a8a','#d8c0e0','#c8f08a','#4a2c5a',{sting:'venom',top:'none',marks:'spots',el:'nature',fx:'venom',glowCol:'#c8f08a',eye:'#c8f08a'});
// Magmaclaw: a volcanic crab. Smoking vents on its shell, glowing cracks, claws hot to the touch. Spits fire.
R('magma','MAGMACLAW','#3a2a2e','#ff7a2e','#ffd34d','#221a1e',{top:'vents',marks:'cracks',clawGlow:1,el:'fire',fx:'embers',glowCol:'#ff8a2e',eye:'#ffb03a',style:'breath'});
// Crystalback: a cave crab with a cluster of crystals growing out of its shell.
R('cryst','CRYSTALBACK','#8a7ab8','#e0d8f0','#bfeaff','#5a4a88',{top:'crystals',el:'earth',fx:'dust',eye:'#bfeaff'});
// Dusksting: a twilight crab ringed with spikes, its stinger a scythe blade. Glowing eyes.
R('dusk','DUSKSTING','#3a2a4a','#b890c8','#e0508a','#221a2e',{sting:'scythe',top:'spikes',el:'dragon',fx:'motes',glowCol:'#ff6ab0',eye:'#ff7ab0',style:'breath'});
// Pyreclaw: a crab crowned in fire. Flames roar from its shell and its crusher, cracks glowing gold.
R('pyre','PYRECLAW','#5a1a14','#ffd34d','#ff9a2e','#2e0e0c',{top:'flames',marks:'cracks',clawGlow:1,clawFlame:1,el:'fire',fx:'embers',glowCol:'#ffd34d',eye:'#ffd34d',style:'breath',big:1.28});
})();
