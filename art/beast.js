// BEASTS (the brutes), each from a legend and its real animal:
//   boar      Tuskhide: the Calydonian boar. A hump of spear-like bristles, great tusks.
//   tarasque  Thornback: the Tarasque. A lion's head, a turtle shell of thorns, six legs, a scaly tail with a sting.
//   bull      Cinderhide: the bronze fire-breathing bulls of Colchis. Bronze plates with glowing seams, forward horns, smoking nostrils.
//   yeti      Frostmaw: the yeti. A hunched ape on short legs and long knuckled arms, shaggy fur, frost fangs.
//   mammoth   Icehide: a mammoth. Pillar legs, a domed head, a swaying trunk, huge curving tusks, a fur skirt.
//   rhino     Ruinhorn: the Karkadann. A rhino of ruined stone with one great horn and glowing runes in its armour folds.
//   wolf      Gloomtusk: Fenrir. A lean shadow wolf with a dark mane, a bushy tail, glowing fangs and eyes.
(()=>{
const {V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,glowDots}=KIT,PI=Math.PI;
const GROUND=66;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={legF:{z:1,R:3.6,k:1.8,dk:-.9},hornF:{z:1.5,R:1.8,k:1,dk:-.7},spine:{z:3,R:1.6,k:.8},tail:{z:3.5,R:2.4,k:1.2},body:{z:4,R:7,k:2.4},shell:{z:4.3,R:5,k:1.6},thorn:{z:4.35,R:1.2,k:.6},
  mouth:{z:4.5,R:1,k:1},jaw:{z:4.6,R:2.4,k:1.2},teeth:{z:4.7,R:.6,k:.5,soft:1},head:{z:4.8,R:4.4,k:1.8},mane:{z:4.9,R:2.4,k:1.2},trunk:{z:6.6,R:2.6,k:1.2},legN:{z:6,R:4,k:2},horn:{z:8,R:1.8,k:1}};
const REST={px:50,py:40,tilt:0,hr:.1,jaw:0,tb:0,fl1:0,fl2:0,bl1:0,bl2:0,bri:0,breath:0,trunk:0};
const CL={idle:{len:2.6,loop:1,keys:[[0,{}],[1.3,{py:40.6,hr:.16,tb:.25,trunk:.3}],[2.6,{}]]},
  gore:{len:1.3,keys:[[0,{}],[.45,{px:54,py:41,tilt:-.06,hr:.5,bri:.6,fl1:1,trunk:-.5}],[.6,{px:44,py:41,tilt:-.02,hr:.45,jaw:.15,bri:.6,trunk:.4}],[.72,{px:42,py:39,tilt:.08,hr:-.55,jaw:.3,bri:.4,trunk:1}],[1.3,{}]]},
  stomp:{len:1.5,keys:[[0,{}],[.5,{px:54,py:36,tilt:.42,hr:-.35,fl1:12,fl2:10,jaw:.3,tb:.5,trunk:1.2}],[.66,{px:49,py:41,tilt:-.06,hr:.3,fl1:0,fl2:0,jaw:.1,trunk:-.3}],[.8,{py:40,tilt:0}],[1.5,{}]]},
  charge:{len:.9,loop:1,keys:[[0,{px:48,py:41,tilt:-.06,hr:.45,fl1:4,bl2:4,bri:.5}],[.225,{py:39,fl1:0,bl2:0,fl2:2,bl1:2}],[.45,{py:41,fl2:4,bl1:4,fl1:0,bl2:0}],[.675,{py:39,fl2:0,bl1:0,fl1:2,bl2:2}],[.9,{px:48,py:41,tilt:-.06,hr:.45,fl1:4,bl2:4,bri:.5}]]},
  breath:{len:1.9,keys:[[0,{}],[.5,{px:54,py:38,tilt:.18,hr:-.45,jaw:.25,bri:.5,trunk:1}],[.66,{px:47,py:41,tilt:-.05,hr:.2,jaw:.7,breath:.15}],[1.35,{px:47,py:41,tilt:-.05,hr:.24,jaw:.7,breath:1}],[1.5,{breath:0,jaw:.2}],[1.9,{}]]},
  flinch:{len:.6,keys:[[0,{}],[.08,{px:55,py:39,tilt:.12,hr:-.35,jaw:.3,bri:.4}],[.6,{}]]}};

function make(id,name,look,B){B=Object.assign({plan:'boar',s:1,el:'earth',style:'breath',eye:'#f0c040',glowCol:look.glow||'#ffe680',fx:null},B);
  const base=ENG.materials(look),mats={hide:Object.assign({},base.hide),fur:Object.assign(one(B.furCol||ENG.mix(look.b,look.u,.35)),{tex:'fur'}),mane:Object.assign(one(B.maneCol||look.d),{tex:'fur'}),
    bronze:Object.assign(one(B.bronze||look.b),{dk:-.1}),plate:Object.assign(one(ENG.mix(look.b,look.u,.3)),{tex:'plate'}),shellM:Object.assign(one(B.shellCol||look.d),{tex:'spot'}),
    moss:Object.assign(one(ENG.mix(look.b,'#7ac85a',.45)),{tex:'fur'}),stone:one(ENG.mix(look.b,'#9a90a0',.4)),lava:Object.assign(one(B.glowCol),{flat:.95}),ice:Object.assign(one('#d8f4ff'),{dk:.2}),
    smoke:Object.assign(one('#8a8a90'),{flat:.4}),ivory:one(B.ivory||look.h),nose:one('#3a2a2a')};
  return MON[id]={id,name,rig:'brute',stance:B.plan,el:B.el,style:B.style,D:B,W:96,H:72,look,mats,groups,rest:REST,clips:CL,build(p,brk,t){return build(p,brk,t,B);}};}

function build(p,brk,t,B){const K=kit(),{S,E,C,P}=K,G=[],pl=B.plan,br=Math.sin(t*2.4)*.5+.5,a=p.tilt,f=V(PI+a,1),up=V(PI+a+PI/2,1),dn=V(a+PI/2,1);
  const D={boar:{hip:11,sh:12.5,len:23,legL:9,neck:10,drop:1.5},tarasque:{hip:10,sh:10,len:22,legL:6.5,neck:9,drop:3},bull:{hip:9.5,sh:11.5,len:24,legL:10.5,neck:10,drop:2},
    yeti:{hip:9,sh:12.5,len:16,legL:8,neck:6,drop:-2},mammoth:{hip:11,sh:12.5,len:22,legL:12.5,neck:8,drop:-1},rhino:{hip:11.5,sh:12,len:24,legL:8.5,neck:11,drop:4},wolf:{hip:6.5,sh:8,len:22,legL:11,neck:12,drop:-3}}[pl];
  if(pl==='tarasque'&&p.tuck>.5){// tucked in: a ball of shell and thorns that rolls
    const R=D.sh*1.25,c=[p.px+12,GROUND-R],rl=p.roll||0;E(c[0],c[1],R,R,'shellM','shell',{bulge:2.4,bw:6});E(c[0]-1,c[1]+1,R*.8,R*.8,'plate','shell',{pri:-.4});
    for(let i=0;i<12;i++){const a=rl+i/12*PI*2,bb=add(c,V(a,R-.6)),m=add(bb,V(a,3.6)),e=add(add(bb,V(a,6.5)),V(a+PI/2,1.6));if(!brk.wings){C([bb.concat([1.7]),m.concat([1]),e.concat([.3])],'horn','thorn');if(i%3===0)E(...add(bb,V(a,-1.2)),2.4,1.6,'moss','thorn',{});}else spike(K,bb,a,2,1.4,'horn','thorn');}
    for(let i=0;i<4;i++){const a=rl*1.0+i*PI/2+.4;E(...add(c,V(a,R*.5)),2.2,2.2,'plate','thorn',{pri:1});}
    scale(S,p.px,GROUND,B.s);return{S,mouth:[c[0]-R,c[1]],extra:g=>{ambient(g,B.fx,t,[p.px-40,6,p.px+36,60],7);for(let i=0;i<4;i++){g.fillStyle='#8a7a5a';g.fillRect(Math.round(c[0]+R*.4+i*3+Math.sin(t*20+i)*2),GROUND-1-((t*9+i)%3|0),1,1);}}};}
  const tk=pl==='tarasque'?(p.tuck||0)*2:0;
  const lift=pl==='mammoth'?5:pl==='wolf'?4:pl==='tarasque'?-3-tk*4:pl==='yeti'?-1:0,H=add([p.px+12,p.py-lift],up,0),Sh=add(H,f,D.len),Sh2=pl==='yeti'?add(Sh,up,11):Sh;
  const hc=pl==='mammoth'?'fur':'hide';
  // body
  C([[H[0],H[1],D.hip],[Sh2[0],Sh2[1],D.sh+br*.4]],hc,'body');
  if(pl==='boar'||pl==='bull'||pl==='mammoth'){const hu=add(add(Sh2,up,D.sh*.55),f,-2);E(hu[0],hu[1],D.sh*.85,D.sh*.6,hc,'body',{a:-a,bulge:1.4,bw:4});}
  if(false)C([[H[0]-2,H[1]+D.hip*.5,D.hip*.45],[Sh2[0]+2,Sh2[1]+D.sh*.55,D.sh*.45]],'belly','body',{pri:1.5});
  if(pl==='mammoth')for(let i=0;i<9;i++){const q=lerp2(add(H,dn,D.hip*.6),add(Sh2,dn,D.sh*.6),i/8),sw=Math.sin(t*2+i)*.6;C([q.concat([2]),add(q,[sw,7+(i%3)]).concat([.8])],'fur','body');}
  if(pl==='yeti'){const hu=add(Sh2,up,D.sh*.4);E(hu[0],hu[1],D.sh*.9,D.sh*.7,'fur','body',{bulge:1.5});for(let i=0;i<7;i++){const q=add(lerp2(H,Sh2,i/6),V(PI*.5+a,D.hip*.6));C([q.concat([2]),add(q,[Math.sin(t*2+i),5]).concat([.6])],'fur','mane');}}
  if(pl==='bull'||pl==='rhino')for(let i=0;i<4;i++){const q=lerp2(H,Sh2,.15+i*.24),pa=add(q,up,D.sh*.35);P([add(add(pa,f,-2.2),up,3.4),add(add(pa,f,2.2),up,3.6),add(add(pa,f,1.8),dn,5),add(add(pa,f,-1.8),dn,5)],pl==='bull'?'bronze':'stone','thorn',{k:.1});
    G.push(add(add(pa,f,3.3),dn,1),add(add(pa,f,3.3),up,1.6));}
  if(pl==='wolf'){for(let i=0;i<7;i++){const q=add(lerp2(Sh2,H,i/6*.6),up,D.sh*.6),sa=-PI/2-.7+a+Math.sin(t*2.4+i)*.15;C([q.concat([2.2]),add(q,V(sa,5+(i<3?2:0))).concat([.5])],'mane','mane');}}
  // the back: bristles, thorned shell, or nothing
  if(pl==='boar')for(let i=0;i<6;i++){const b=add(add(Sh2,f,-1-i*3.8),up,D.sh*.95-Math.abs(i-1.5)*1.1),h=(7+(2-Math.abs(i-1.8))*1.6)*(1+p.bri*.3),tip=add(add(b,up,h),f,-2+p.bri);
    if(!brk.wings)C([[b[0],b[1],2.2],[tip[0],tip[1],.35]],'horn','spine');else stump(K,b,tip,2,'spine');}
  if(pl==='tarasque'){const c=add(lerp2(H,Sh2,.5),up,D.sh*.55);E(c[0],c[1],D.len*.72,D.sh*1.05,'shellM','shell',{a:-a,bulge:2.4,bw:6});
    for(let i=0;i<6;i++)E(...add(add(c,f,-D.len*.55+i*D.len*.22),up,-1+Math.abs(i-2.5)*-.3),3.4,2.6,'plate','shell',{pri:1.4});
    for(let i=0;i<9;i++){const ang=PI*.12+i*PI*.095,b=add(c,V(PI+a+ang+PI*(i>4?0:0),1),1),bb=add(add(c,f,Math.cos(ang)*D.len*.62),up,Math.sin(ang)*D.sh*.95),ta=Math.atan2(bb[1]-c[1],bb[0]-c[0]);
      if(!brk.wings){const m=add(bb,V(ta,4)),e=add(add(bb,V(ta,7+(i%2)*2)),V(ta+PI/2,-2));C([bb.concat([1.8]),m.concat([1]),e.concat([.3])],'horn','thorn');if(i%3===0)E(...add(bb,V(ta,-1)),2.6,1.8,'moss','thorn',{});}
      else spike(K,bb,ta,2,1.4,'horn','thorn');}}
  // head
  const ha=PI+a+p.hr,hf=V(ha,1),hu=V(ha+PI/2,1),hd=V(ha-PI/2,1),Hd=add(add(Sh2,f,D.neck),hd,D.drop),at=(x,y)=>add(add(Hd,hf,x),hu,y);
  C([[Sh2[0],Sh2[1],D.sh*.75],[Hd[0],Hd[1],pl==='wolf'?4.6:7.5]],pl==='wolf'?'hide':hc,'body');
  let eye,mouth,horned=true;
  if(pl==='boar'){E(...at(0,0),9,7.4,'hide','head',{a:ha-PI});C([at(6,-1).concat([6]),at(13,-3).concat([4.4])],'hide','head');E(...at(13.4,-3),2.2,3.4,'nose','head',{a:ha-PI,pri:2});
    P([at(-4,5.5),add(at(-4,5.5),add(hf,[0,0],-5),1),at(-9,9),at(-7,3)],'dark','head',{k:.6});eye=at(4.5,2.4);
    const J=at(4,-5),j1=add(J,V(ha-p.jaw,1),8);C([J.concat([3.2]),j1.concat([2.4])],'hide','jaw');mouth=lerp2(at(12,-4),j1,.5);
    for(const[o,g,s]of[[[0,0],'horn',1],[add(hf,[0,0],-3),'hornF',.85]]){const b=add(at(11,-6),o),pts=[[b[0],b[1],2.4*s]];let q=b;for(const[x,y]of[[2.5,1],[1,-4],[-1.5,-4],[-3,-2.5]]){q=add(add(q,hf,x*s),hu,-y*s);pts.push([q[0],q[1],pts[pts.length-1][2]*.78]);}
      if(!brk.head)C(pts,'ivory',g);else stump(K,pts[0],pts[2],pts[0][2],g,'ivory');}}
  else if(pl==='tarasque'){for(let i=0;i<10;i++){const aa=i/10*PI*2,q=add(at(-.5,.5),V(aa,7));C([at(-.5,.5).concat([4]),q.concat([2.2])],'moss','mane');}
    E(...at(0,0),6.4,6,'hide','head',{a:ha-PI});C([at(4,-1.5).concat([4.4]),at(8,-2.4).concat([3.4])],'hide','head');E(...at(8.6,-1.6),1.6,1.2,'nose','head',{pri:2});eye=at(3,2);
    const J=at(2,-4),j1=add(J,V(ha-p.jaw,1),7);C([J.concat([2.6]),j1.concat([2])],'hide','jaw');if(p.jaw>.05)for(let i=0;i<2;i++)P([add(at(6+i*2,-3.8),hf,-.6),add(at(6+i*2,-3.8),hf,.6),add(at(6+i*2,-3.8),hd,2)],'tooth','teeth');mouth=lerp2(at(8,-3),j1,.5);
    if(!brk.head)for(const s of[1,-.6])C([at(-1,5).concat([1.4]),at(-3,9+s).concat([.4])],'horn','horn');horned=!brk.head;}
  else if(pl==='bull'){E(...at(0,1),6.4,6,'bronze','head',{a:ha-PI});P([at(3,4),at(10,1.4),at(11.6,-2.4),at(10.4,-5),at(3,-5)],'bronze','head',{k:.8});E(...at(10.6,-2),.9,.7,'nose','head',{pri:2.6});eye=at(3.2,2.2);
    G.push(at(0,3),at(5,2.6),at(8,0));const J=at(4,-4),j1=add(J,V(ha-p.jaw,1),7);C([J.concat([2.8]),j1.concat([2.1])],'bronze','jaw');mouth=lerp2(at(11,-4),j1,.5);
    for(const[o,g,s]of[[[0,0],'horn',1],[add(hf,[0,0],-2.5),'hornF',.85]]){const b=add(at(-.5,5.5),o),pts=[b.concat([2.4*s]),add(add(b,hu,1.5),hf,-5*s).concat([2*s]),add(add(b,hu,6*s),hf,-7*s).concat([1.5*s]),add(add(b,hu,10*s),hf,-3*s).concat([1*s]),add(add(b,hu,11*s),hf,2*s).concat([.4])];
      if(!brk.head)C(pts,'ivory',g);else stump(K,pts[0],pts[1],2.2*s,g,'ivory');}
    // smoke from the nostrils
    for(let i=0;i<2;i++){const k=((t*.8+i*.5)%1),q=add(at(11,0),[-2-k*3,-2-k*7]);E(q[0],q[1],.6+k*1.4,.6+k*1.4,'smoke','mane',{});}}
  else if(pl==='yeti'){E(...at(0,1),7,7.4,'fur','head',{a:ha-PI});E(...at(3.4,-.6),4.4,4,'skin2','head',{a:ha-PI,pri:1.5});C([at(1,3.2).concat([2.6]),at(6,3).concat([2])],'fur','head',{pri:2});eye=at(4,1.2);
    const J=at(3,-3),j1=add(J,V(ha-p.jaw*1.2,1),6.5);C([J.concat([2.8]),j1.concat([2.2])],'skin2','jaw');mouth=lerp2(at(7,-2),j1,.5);
    for(const k of[0,1])P([add(at(5+k*2,-2.6),hf,-.7),add(at(5+k*2,-2.6),hf,.7),add(at(5.2+k*2,-6-p.jaw*2),hf,0)],'ice','teeth',{k:.2});
    if(!brk.head)for(const s of[1,-1]){const b=at(-2,5.6+s*.4),pts=chain(b[0],b[1],ha+PI*.8,[[3,0],[3,-.9],[2.6,-.9],[2,-.9]]).map((q,i)=>[q[0],q[1],[2,1.8,1.4,1,.5][i]]);C(pts,'horn',s>0?'horn':'hornF');}}
  else if(pl==='mammoth'){E(...at(0,2),8,8.6,'fur','head',{a:ha-PI});E(...at(-1,7),5,3.6,'fur','head',{bulge:1});eye=at(3,2.6);
    const tr=chain(...at(7,-2),ha-PI*.12+p.trunk*.9-Math.sin(t*1.8)*.12,[[4.4,-.3+p.trunk*.25],[4.2,-.3+p.trunk*.3],[3.8,-.32+p.trunk*.3],[3.2,-.3],[2.8,-.25]]);C(tr.map((q,i)=>[q[0],q[1],[3.6,3,2.4,1.9,1.5,1.2][i]]),'hide','trunk');
    mouth=add(tr[tr.length-1],[0,0]);E(...at(-5,1),3.4,4.4,'fur','head',{});
    for(const[o,g,s]of[[[0,0],'horn',1],[add(hf,[0,0],-3),'hornF',.85]]){const b=add(at(5,-5),o),pts=chain(b[0],b[1],ha-PI*.35,[[5*s,.35],[5*s,.55],[4.6*s,.6],[3.6*s,.6]]).map((q,i)=>[q[0],q[1],[2.6,2.3,1.9,1.4,.7][i]*s]);
      if(!brk.head)C(pts,'ice',g);else stump(K,pts[0],pts[1],2.6*s,g,'ice');}}
  else if(pl==='rhino'){E(...at(0,0),8,6.6,'stone','head',{a:ha-PI});C([at(6,-1).concat([5.6]),at(13,-2.4).concat([4])],'stone','head');eye=at(4,2);G.push(at(-1,2),at(3,4));
    const J=at(4,-4),j1=add(J,V(ha-p.jaw,1),8);C([J.concat([2.8]),j1.concat([2.2])],'stone','jaw');mouth=lerp2(at(12,-3),j1,.5);
    P([at(-4,4),at(-7,8),at(-8,3)],'dark','head',{k:.5});
    const hb=at(11,2.4);if(!brk.head){C([hb.concat([3.6]),add(add(hb,hu,5),hf,2.6).concat([2.4]),add(add(hb,hu,10),hf,3.4).concat([1.2]),add(add(hb,hu,14),hf,1.4).concat([.35])],'horn','horn');C([at(6,4).concat([1.8]),at(6,7.4).concat([.4])],'horn','horn');}
    else stump(K,hb,add(hb,hu,6),3.4,'horn');}
  else if(pl==='wolf'){E(...at(0,.5),5.4,4.8,'hide','head',{a:ha-PI});C([at(3,-.6).concat([3.4]),at(10,-1.6).concat([1.9])],'hide','head');E(...at(10.4,-1),1,.8,'nose','head',{pri:2});eye=at(3,1.4);
    for(const[s,g]of[[0,'head'],[-1.6,'mane']])P([at(-1.4+s,3),at(-.4+s,9.5),at(1.6+s,3.4)],'mane',g,{k:.4});
    const J=at(2.4,-2.2),j1=add(J,V(ha-p.jaw*1.3,1),7.4);C([J.concat([2]),j1.concat([1.4])],'hide','jaw');if(p.jaw>.05)P([at(3,-1.6),at(10,-2.2),j1,J],'mouth','mouth');mouth=lerp2(at(10,-2),j1,.5);
    if(!brk.head)for(const k of[0,1]){const b=at(6.5+k*2.4,-2);C([b.concat([.8]),add(b,hd,3+p.jaw*1.4).concat([.3])],'lava','teeth');G.push(add(b,hd,1.6));}horned=!brk.head;}
  // tail
  const tl=chain(H[0]+D.hip*.75,H[1]-D.hip*.4,(pl==='wolf'?-.25:pl==='tarasque'?.15:-.5)+p.tb,pl==='wolf'?[[5,.15+Math.sin(t*2.4)*.15],[5,.2],[4.5,.25],[4,.3]]:pl==='tarasque'?[[5,.1+Math.sin(t*2)*.1],[5,.1],[4.6,.15],[4,.2],[3.6,.2]]:[[4,.4+Math.sin(t*3)*.25],[4,.4],[3,.35]]);
  if(brk.tail){C(tl.slice(0,2).map((q,i)=>[q[0],q[1],3-i*.4]),'hide','tail');wound(K,tl[1],.4,.7,'tail');}
  else if(pl==='wolf'){C(tl.map((q,i)=>[q[0],q[1],[2.4,3.4,4,3.6,2][i]]),'mane','tail');}
  else if(pl==='tarasque'){C(tl.map((q,i)=>[q[0],q[1],[4,3.4,2.8,2.2,1.6,1.1][i]]),'hide','tail');for(let i=1;i<tl.length;i++)spike(K,tl[i],-PI/2+.4,3-i*.3,1,'horn','tail');const e=tl[tl.length-1];P([e,add(e,V(.2,5)),add(e,V(-.9,3))],'horn','tail',{k:.3,pri:2});}
  else{C(tl.map((q,i)=>[q[0],q[1],3-i*.5]),'hide','tail');const e=tl[3];P([add(e,[-1,-1]),add(e,[4,1]),add(e,[3,6]),add(e,[-1,4])],pl==='mammoth'?'fur':'dark','tail',{k:.6});}
  // legs
  const legKind=pl==='wolf'?'paw':pl==='tarasque'?'claw':pl==='mammoth'?'pillar':pl==='yeti'?'ape':'hoof';
  const leg=(hip,fx,lf,g,fore)=>{const fy=GROUND-lf,L=D.legL,an=[fx,fy-(legKind==='pillar'?2:3.5)],bend=legKind==='paw'?(fore?1:-1):fore?-1:1,kn=ik(hip[0],hip[1],an[0],an[1],L,L,bend),r=legKind==='pillar'?5.6:legKind==='paw'?2.6:legKind==='claw'?3.6:4.4;
    E(hip[0],hip[1]+1,r+1.4,r+2.6,legKind==='pillar'?'fur':'hide',g,{bulge:1});C([[hip[0],hip[1]+1,r],[kn[0],kn[1],r*.78],[an[0],an[1],r*.68]],legKind==='pillar'?'fur':'hide',g);
    if(legKind==='hoof')E(fx,fy-1.4,r*.9,2.1,'dark',g,{k:.8,pri:2});else if(legKind==='pillar'){E(fx,fy-1.6,r*.95,2.2,'hide',g,{pri:2});for(let i=0;i<3;i++)E(fx-3+i*2.4,fy-1,.9,.8,'ivory',g,{pri:2.6});}
    else if(legKind==='paw'){E(fx-1.2,fy-1.2,2.6,1.4,'hide',g,{});for(let i=0;i<2;i++)C([[fx-2.4-i*1.2,fy-.8,.6],[fx-3.6-i*1.2,fy+.2,.3]],'claw',g,{pri:2.6});}
    else{E(fx-1,fy-1.4,r*.9,1.8,'hide',g,{});for(let i=0;i<3;i++)C([[fx-2.6+i*1.6,fy-.8,.8],[fx-3.6+i*1.6,fy+.4,.35]],'claw',g,{pri:2.6});}};
  if(pl==='yeti'){// long arms down to the knuckles, short legs at the back
    for(const[g,dx,lf]of[['legF',3,p.fl2],['legN',-2,p.fl1]]){const shp=add(Sh2,[dx,4]),fist=[Sh2[0]-6+dx-lf*.5,GROUND-2.6-lf],el=ik(shp[0],shp[1],fist[0],fist[1],13,12,1);
      C([shp.concat([5]),el.concat([4]),fist.concat([3.6])],'fur',g);E(fist[0],fist[1],3.8,3,'skin2',g,{pri:2});}
    leg(add(H,[3,4]),H[0]+7+p.bl2*.4,p.bl2,'legF',0);leg(add(H,[-2,5]),H[0]-1+p.bl1*.4,p.bl1,'legN',0);}
  else{const off=pl==='wolf'?2:4,fx0=pl==='wolf'?[H[0]+8,Sh2[0]+3,H[0]+1,Sh2[0]-4]:[H[0]+9,Sh2[0]+4,H[0]+2,Sh2[0]-4];
    leg(add(H,[off,4]),fx0[0]+p.bl2*.4,p.bl2,'legF',0);leg(add(Sh2,[off,5]),fx0[1]+p.fl2*.3,p.fl2,'legF',1);leg(add(H,[-1,5]),fx0[2]+p.bl1*.4,p.bl1,'legN',0);leg(add(Sh2,[-1,6]),fx0[3]+p.fl1*.3,p.fl1,'legN',1);
    if(pl==='tarasque'){leg(add(lerp2(H,Sh2,.5),[2,6]),lerp2(H,Sh2,.5)[0]+3,0,'legF',0);leg(add(lerp2(H,Sh2,.5),[-2,6]),lerp2(H,Sh2,.5)[0]-2,0,'legN',0);}}
  const blink=(t%4.1)<.12;
  scale(S,p.px,GROUND,B.s);const sc=q=>[p.px+(q[0]-p.px)*B.s,GROUND+(q[1]-GROUND)*B.s];const E2=sc(eye),MO=sc(mouth),G2=G.map(sc);
  return{S,mouth:MO,extra:g=>{glowDots(g,G2,B.glowCol,t);ambient(g,B.fx,t,[p.px-40,6,p.px+36,60],7);eyeAt(g,E2[0]-1,E2[1],B.eye,blink,pl==='wolf',B.glowEye);breath(g,B.el,t,MO,0,p.breath,B.style);}};}

const R=(id,name,b,u,h,d,B)=>make(id,name,{b,u,h,d,glow:B.glowCol},B);
R('tusk','TUSKHIDE','#a8794a','#e0c89a','#f0ead8','#7a5434',{plan:'boar',el:'earth',style:'spit',fx:'dust'});
R('thorn','THORNBACK','#5a8a4a','#d9c88e','#e8e2cc','#34582c',{plan:'tarasque',shellCol:'#4a6a34',el:'nature',style:'spit',fx:'spores',eye:'#e8f070'});
R('cinder','CINDERHOOF','#5a3a3a','#ff9a4d','#2a1a1e','#3a2426',{plan:'bull',bronze:'#b07a3a',ivory:'#e8d8b0',el:'fire',fx:'embers',eye:'#ffb03a',glowCol:'#ff9a3a'});
R('frost','FROSTMAW','#d2e6f2','#f4fbff','#6cc4f0','#9fbcd0',{plan:'yeti',s:1.04,furCol:'#e8f2fa',el:'ice',fx:'snow',eye:'#7fe0ff',glowEye:1});
R('icehide','ICETUSK','#8ab8d8','#e8f4fa','#ffffff','#5a88a8',{plan:'mammoth',furCol:'#7aa8c8',el:'ice',fx:'snow',eye:'#e8fbff'});
R('ruin','RUINHORN','#4a3a4a','#c8a0b8','#e0508a','#2e222e',{plan:'rhino',s:1.04,el:'dragon',fx:'motes',eye:'#ff7ab0',glowCol:'#ff5aa0'});
R('gloom','GLOOMFANG','#2a2230','#e0508a','#ffb0d0','#18141c',{plan:'wolf',maneCol:'#3e3248',el:'dragon',fx:'motes',eye:'#ff7ab0',glowCol:'#ff6ab0',glowEye:1});
// skin for faces and fists (yeti)
for(const id of['frost'])MON[id].mats.skin2=one('#6a8aa8');
})();
