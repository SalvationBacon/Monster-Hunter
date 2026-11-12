// DRAGONS v6: built from dragon myth and dragon anatomy. Every dragon is one scaled spine from tail tip to snout with
// spines down its back and banded plates down its belly, a long wedge head with brow ridges and cheek spikes, lizard
// legs that splay and grip, and big bat wings on finger bones. Each one takes its body from a legend:
//   wyvern (Fernwing)           two legs, two wings, a barbed tail: the heraldic wyvern
//   western (Emberwing, Star)   four legs, great wings, a long neck: Fafnir, Tiamat
//   frost wyrm (Rimewing)       tall, gaunt, crystal frills: the Norse frost dragon
//   amphiptere (Voltwing)       a legless serpent that flies on two wings
//   zmey (Obsidwing)            three heads on long necks: Zmey Gorynych
//   lung (Stormwing)            the long Chinese dragon riding the clouds, with antlers, whiskers and its pearl
//   coatl (Aurorawing)          the feathered serpent, Quetzalcoatl: coiled, plumed, feather-winged
//   king (Skyrender)            Bahamut: upright, four wings, a crown
(()=>{
const {V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,glowDots}=KIT,PI=Math.PI;
const GROUND=66;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={wingF2:{z:.4,R:2.4,k:1.2,dk:-1.2},wingF:{z:1,R:2.4,k:1.2,dk:-1},headF:{z:1.5,R:4,k:1.6,dk:-.6},legF:{z:2,R:3,k:1.5,dk:-.9},ridge:{z:3,R:1.4,k:.6},body:{z:4,R:5.2,k:1.8},
  belly:{z:4.05,R:2,k:.8},mouth:{z:4.1,R:1,k:1},jaw:{z:4.2,R:2.2,k:1.2},teeth:{z:4.3,R:.6,k:.5,soft:1},head:{z:4.4,R:4,k:1.6},mane:{z:4.6,R:1.6,k:.8},legN:{z:6,R:3.2,k:1.5},tailN:{z:6.5,R:3.6,k:1.6},
  wingN:{z:7,R:2.4,k:1.2},wpat:{z:7.1,R:1,k:.6,soft:1},horn:{z:8,R:1.5,k:.9},pearl:{z:8.5,R:2,k:1}};
const R0={px:56,py:41,tilt:.3,n1:-.2,n2:-.3,n3:-.3,hr:-.55,jaw:0,tb:.35,curl:-.05,wave:1,ws:0,wf:0,l1:0,l2:0,l3:0,l4:0,breath:0,rear:0,flap:0};
const REST={biped:R0,frost:Object.assign({},R0,{tilt:.45,hr:-.7}),king:Object.assign({},R0,{tilt:.55,hr:-.85}),
  western:Object.assign({},R0,{px:62,py:44,tilt:.05,n1:-.25,n2:-.3,n3:-.15,hr:-.4,tb:.2,curl:0,ws:.3}),zmey:Object.assign({},R0,{px:62,py:44,tilt:.05,n1:-.2,n2:-.2,n3:-.1,hr:-.35,tb:.2,curl:0,ws:.3}),
  amphi:Object.assign({},R0,{px:56,py:42,tilt:0,hr:0,tb:0}),lung:Object.assign({},R0,{px:56,py:38,tilt:0,hr:0,tb:0}),coatl:Object.assign({},R0,{px:58,py:40,tilt:0,hr:-.2,tb:0})};
const BI={idle:{len:2.4,loop:1,keys:[[0,{}],[1.2,{py:41.6,n1:-.2,hr:-.3,ws:.06}],[2.4,{}]]},
  bite:{len:1.25,keys:[[0,{}],[.42,{px:59,py:40,tilt:.55,n1:-.05,n2:-.05,n3:.05,hr:-.75,jaw:.15,ws:.2}],[.5,{px:58,tilt:.5,jaw:.55}],[.62,{px:49,py:43,tilt:.02,n1:-.55,n2:-.55,n3:-.25,hr:.05,jaw:.55,l2:4}],[.7,{px:48,py:43,tilt:0,n1:-.6,n2:-.55,n3:-.25,hr:.1,jaw:0,l2:4}],[1.25,{}]]},
  sweep:{len:1.5,keys:[[0,{}],[.45,{px:60,py:40,tilt:.5,tb:-.55,curl:-.1,wave:0,hr:-.3,l2:2}],[.56,{px:57,py:42,tilt:.18,tb:1.0,curl:.1,wave:0,hr:.1}],[.64,{px:54,py:43,tilt:.05,tb:2.35,curl:.12,wave:0,hr:.2,l1:3}],[.74,{px:54,py:43,tilt:.05,tb:2.75,wave:0,l1:3}],[.95,{px:56,py:42,tilt:.15,tb:1.6,wave:.5}],[1.15,{tb:.6,wave:1}],[1.5,{}]]},
  roar:{len:1.5,keys:[[0,{}],[.3,{tilt:.6,py:40,n1:-.05,n2:-.1,n3:-.05,hr:-.75,ws:.7,wf:-.6,jaw:.2}],[.5,{tilt:.7,py:39,n1:0,hr:-.85,jaw:.6,ws:1,wf:-.8}],[.75,{ws:.6,jaw:.6}],[1,{ws:1,wf:-.8,jaw:.5}],[1.5,{}]]},
  breath:{len:1.9,keys:[[0,{}],[.45,{px:60,py:39,tilt:.6,n1:.1,n2:.05,n3:0,hr:-.9,jaw:.1,ws:.4}],[.62,{px:52,py:42,tilt:.15,n1:-.45,n2:-.45,n3:-.2,hr:.15,jaw:.6,l2:3,breath:.15}],[1.3,{px:51,py:42,tilt:.12,n1:-.5,n2:-.5,n3:-.25,hr:.2,jaw:.6,l2:3,breath:1}],[1.45,{breath:0,jaw:.2}],[1.9,{}]]},
  flinch:{len:.6,keys:[[0,{}],[.08,{px:61,py:40,tilt:.55,hr:-.9,ws:.3,n1:-.05,jaw:.25}],[.6,{}]]}};
const WE={idle:{len:2.6,loop:1,keys:[[0,{}],[1.3,{py:44.6,hr:-.3,ws:.05,tb:.28}],[2.6,{}]]},
  bite:{len:1.3,keys:[[0,{}],[.45,{px:65,py:43,tilt:.1,n1:.05,n2:0,hr:-.6,jaw:.2,l1:3}],[.6,{px:56,py:45,tilt:-.02,n1:-.45,n2:-.45,n3:-.25,hr:.05,jaw:.6,l1:0,l2:2}],[.7,{px:55,py:45,n1:-.5,n2:-.45,hr:.1,jaw:0}],[1.3,{}]]},
  sweep:{len:1.5,keys:[[0,{}],[.45,{px:65,tilt:.1,tb:-.4,hr:-.2,l3:2}],[.58,{px:62,tb:1.2,l4:3}],[.68,{px:60,tb:2.4,l4:3}],[.8,{tb:2.6}],[1.0,{tb:1.4}],[1.5,{}]]},
  roar:{len:1.6,keys:[[0,{}],[.4,{px:68,py:41,tilt:.42,n1:.1,n2:0,hr:-.55,jaw:.3,ws:.6,l1:10,l2:8}],[.6,{tilt:.5,py:40,jaw:.7,ws:1,wf:-.8,l1:12,l2:10}],[.95,{tilt:.45,jaw:.6,ws:1,l1:11,l2:9}],[1.2,{tilt:.05,py:44,ws:.3,l1:0,l2:0,jaw:.1}],[1.6,{}]]},
  breath:{len:1.9,keys:[[0,{}],[.45,{px:65,py:42,tilt:.18,n1:.15,n2:.05,hr:-.75,jaw:.15,ws:.3}],[.62,{px:58,py:45,tilt:.02,n1:-.4,n2:-.4,n3:-.15,hr:.1,jaw:.65,breath:.15}],[1.3,{px:58,py:45,n1:-.42,n2:-.4,hr:.12,jaw:.65,breath:1}],[1.45,{breath:0,jaw:.2}],[1.9,{}]]},
  flinch:{len:.6,keys:[[0,{}],[.08,{px:66,py:43,tilt:.2,hr:-.8,ws:.3,jaw:.3}],[.6,{}]]}};
const SERP={idle:{len:3,loop:1,keys:[[0,{}],[1.5,{py:'+2',hr:.08}],[3,{}]]},
  bite:{len:1.2,keys:[[0,{}],[.42,{px:'+6',rear:.6,hr:-.4,jaw:.25}],[.56,{px:'-10',rear:-.3,hr:.2,jaw:.65}],[.66,{px:'-11',jaw:0}],[1.2,{}]]},
  sweep:{len:1.4,keys:[[0,{}],[.4,{px:'+4',tb:-.6}],[.55,{tb:1.2}],[.66,{px:'-2',tb:2}],[.85,{tb:1}],[1.4,{}]]},
  roar:{len:1.6,keys:[[0,{}],[.4,{py:'-6',rear:1,hr:-.6,jaw:.3,ws:1}],[.6,{py:'-8',rear:1.2,jaw:.7,ws:1}],[1,{rear:1,jaw:.6,ws:.8}],[1.6,{}]]},
  breath:{len:1.9,keys:[[0,{}],[.45,{px:'+4',py:'-4',rear:.8,hr:-.6,jaw:.2}],[.62,{px:'-4',rear:-.1,hr:.2,jaw:.65,breath:.15}],[1.3,{px:'-4',rear:-.1,hr:.22,jaw:.65,breath:1}],[1.45,{breath:0,jaw:.2}],[1.9,{}]]},
  flinch:{len:.6,keys:[[0,{}],[.08,{px:'+6',py:'-4',rear:.6,hr:-.6,jaw:.3}],[.6,{}]]}};
// serpent clips are written relative to the rest pose ('+6' = rest + 6)
const rel=(clips,rest)=>{const o={};for(const k in clips)o[k]=Object.assign({},clips[k],{keys:clips[k].keys.map(([t,v])=>[t,Object.fromEntries(Object.entries(v).map(([a,b])=>[a,typeof b==='string'?rest[a]+parseFloat(b):b]))])});return o;};
const CLIPS={biped:BI,frost:BI,king:BI,western:WE,zmey:WE,amphi:rel(SERP,REST.amphi),lung:rel(SERP,REST.lung),coatl:rel(SERP,REST.coatl)};

function make(id,name,look,B){
  B=Object.assign({plan:'biped',s:1,len:14,hipR:7.5,midR:6.8,chestR:8,neckN:4,neckL:16,neckA:.95,neckR:[6.4,5,4.2,3.6,3.2],skull:5,snout:8,jawL:9,tailN:8,tailL:38,tailR:6.5,tailCurl:1,
    legL:9.5,legR:4.4,armL:8,armR:3.4,wing:1.15,wingShape:'bat',wings4:0,heads:1,horns:'swept',frill:'none',spines:'spikes',tip:'spade',wpat:'plain',marks:null,fx:null,el:'nature',style:'spit',
    eye:'#f6e7a0',glowCol:look.glow||'#ffe680',mane:null,whiskers:0,elder:0,crest:null,pearl:0},B);
  const base=ENG.materials(look),mats={body:Object.assign({},base.body,{tex:'dscale'}),ice:Object.assign(one('#d8f4ff'),{dk:.2}),lava:Object.assign(one(B.glowCol),{flat:.95}),rock:one(ENG.mix(look.d,'#000000',.35)),
    bandA:one(look.u),bandB:one(look.h),fur:Object.assign(one(B.maneCol||look.u),{tex:'fur'}),feather:Object.assign(one(B.featherCol||look.m||look.u),{tex:'fur'}),feather2:one(B.feather2||look.h),
    cloud:Object.assign(one(B.cloudCol||'#e8ecff'),{dk:.3}),pearlM:Object.assign(one(B.pearlCol||'#f0f4ff'),{dk:.35}),plate:Object.assign(one(ENG.mix(look.u,look.b,.25)),{tex:'plate'})};
  return MON[id]={id,name,rig:'dragon',stance:B.plan,el:B.el,style:B.style,D:B,W:96,H:72,look,mats,groups,rest:REST[B.plan],clips:CLIPS[B.plan],build(p,brk,t){return BUILD[B.plan](p,brk,t,B);}};}

// ── spine helpers: normals point to the sky for a spine ordered tail tip to head (heading roughly left)
const nrm=(pts,i)=>{const a=Math.atan2(pts[Math.min(i+1,pts.length-1)][1]-pts[Math.max(i-1,0)][1],pts[Math.min(i+1,pts.length-1)][0]-pts[Math.max(i-1,0)][0]);return[a,V(a+PI/2,1),V(a-PI/2,1)];};
// spines down the back: a row of hooked spikes from the head down to the tail tip, longest over the shoulders
function dorsal(K,pts,rads,i0,i1,B,g,t,brk){const kind=B.spines;for(let i=i0;i<i1;i++){const[a,up]=nrm(pts,i),k=(i-i0)/Math.max(1,i1-i0),sz=(1.6+Math.sin(k*PI)*2.6)*(B.spineK||1)*(brk&&brk.wings&&k>.3&&k<.8?.45:1),b=add(pts[i],up,rads[i]*.75),
    sa=Math.atan2(up[1],up[0])-.55;
    if(kind==='spikes')K.P([add(b,V(a,1.3)),add(b,V(sa,sz*1.6)),add(b,V(a,-1.3))],'dark',g,{k:.3});
    else if(kind==='crystals')crystal(K,add(b,up,-.6),sa+.2,sz*1.9,1.2,'ice',g);
    else if(kind==='plates'){K.P([add(b,V(a,2)),add(add(b,V(sa,sz*1.4)),V(a,.6)),add(b,V(sa+.3,sz*1.3)),add(b,V(a,-2))],'rock',g,{k:.3});if(i%2)K.glows.push(add(b,up,sz*.4));}
    else if(kind==='bolts'){if(i%2===0)bolt(K,add(b,up,-.4),sa+.3,sz*2,1.2,'lava',g);else K.P([add(b,V(a,1.1)),add(b,V(sa,sz*1.3)),add(b,V(a,-1.1))],'dark',g,{k:.3});}
    else if(kind==='feathers'){const fa=sa-.2+Math.sin(t*2.4+i)*.12,c=add(b,V(fa,sz*1.2));K.E(c[0],c[1],sz*1.3,1.1,i%2?'feather':'feather2',g,{a:fa});}
    else if(kind==='flamemane'){const fa=sa-.3+Math.sin(t*3+i*.7)*.2,e=add(b,V(fa,sz*1.8));K.C([b.concat([1.2]),lerp2(b,e,.6).concat([.9]),e.concat([.3])],'fur',g);}
    else if(kind==='fins'){K.P([add(b,V(a,2.2)),add(b,V(sa,sz*1.5)),add(b,V(a,-2.4))],'memb',g,{k:.4});}}}
// banded belly plates
function scutes(K,pts,rads,i0,i1){for(let i=i0;i<i1;i++){const[a,up,dn]=nrm(pts,i),q=add(pts[i],dn,rads[i]*.62);K.E(q[0],q[1],Math.max(1.4,rads[i]*.42),Math.max(.9,rads[i]*.3),'plate','body',{a,pri:1.4});}}
// draw a spine as one body
const body=(K,pts,rads,g)=>K.C(pts.map((q,i)=>[q[0],q[1],rads[i]]),'body',g||'body');

// ── the dragon head: a long wedge. Skull, brow ridge, snout to a hooked nose, nostril, cheek spikes, a lower jaw that drops.
function head(K,Hn,ah,p,brk,B,t,G,stars,g){const {E,C,P}=K,f=V(ah,1),uH=V(ah+PI/2,1),dH=V(ah-PI/2,1),back=V(ah+PI,1),sk=B.skull,sn=B.snout,hg=g||'head',jg=g?g:'jaw';
  const at=(x,y)=>add(add(Hn,f,x),uH,y);
  E(...at(1.2,.6),sk*1.05,sk*.8,'body',hg,{a:ah-PI});
  P([at(2,sk*.75),at(3+sn*.55,sk*.42),at(3+sn,sk*.12),at(3.6+sn,-sk*.18),at(3+sn*.9,-sk*.42),at(2,-sk*.55),at(-.5,-sk*.3)],'body',hg,{k:.6});
  P([at(4.6,sk*.62),at(1.2,sk*1.1),at(-3.4,sk*1.15),at(-.6,sk*.55)],'dark',hg,{k:.4,pri:1});
  E(...at(2.4+sn,sk*.18),.6,.45,'dark',hg,{pri:2.6});
  if(B.frill==='leaf')P([at(-1,sk*.2),add(at(-1,sk*.2),add(V(ah+PI,8),uH,4.5)),add(at(-1,sk*.2),add(V(ah+PI,5),dH,3))],'dark',hg,{k:.5});
  else if(B.frill==='crystal')for(let i=0;i<4;i++)crystal(K,at(-1.2,sk*.4-i*1.4),ah+PI-.55+i*.38,7-i*.8,1.3,'ice','ridge');
  else if(B.frill==='fin')P([at(-1,sk*.6),add(add(at(-1,sk*.6),back,9),uH,5),add(add(at(-1,sk*.6),back,10),dH,2),add(add(at(-1,-sk*.3),back,5),dH,3)],'memb',hg,{k:.4});
  // cheek spikes back from the jaw hinge
  for(let i=0;i<2;i++)spike(K,at(-.6-i*.6,-sk*.35-i*1.1),ah+PI+.25+i*.32,4.4-i*.8,1,'horn',hg,{pri:1.5});
  const J=at(1.6,-sk*.45),jd=V(ah-p.jaw,1),jn=V(ah-p.jaw-PI/2,1);
  P([add(J,uH,1.2),add(add(J,jd,sn+2),uH,.6),add(J,jd,sn+2.6),add(add(J,jd,sn*.5),jn,1.6),add(J,jn,1.8)],'body',jg,{k:.5});
  if(p.jaw>.05){P([add(J,uH,1),at(2.8+sn,-sk*.3),add(J,jd,sn+2),J],'mouth','mouth');for(let i=0;i<4;i++){const a=at(3+i*sn/4,-sk*.42),b=add(J,jd,2.4+i*sn/4);
    P([add(a,f,-.6),add(a,f,.6),add(a,dH,1.6)],'tooth','teeth');P([add(b,f,-.6),add(b,f,.6),add(b,uH,1.5)],'tooth','teeth');}}
  else P([add(at(2.4+sn*.85,-sk*.38),f,-.6),add(at(2.4+sn*.85,-sk*.38),f,.6),add(at(2.4+sn*.85,-sk*.38),dH,2)],'tooth','teeth');
  if(B.whiskers)for(const k of[0,1]){const w0=at(1.6+sn-k*2,-sk*.2),a=ah+PI*.88+Math.sin(t*2+k)*.12,w1=add(w0,V(a,7)),w2=add(w1,V(a-.5+Math.sin(t*2.6+k)*.25,8));C([w0.concat([.55]),w1.concat([.4]),w2.concat([.25])],'horn','mane');}
  if(B.beard)for(let i=0;i<3;i++){const q=at(1.2-i*1.4,-sk*.7),a=ah-PI/2-.3+Math.sin(t*2+i)*.1;C([q.concat([.9]),add(q,V(a,4+i)).concat([.3])],'fur','mane');}
  // horns
  const hb=at(-.4,sk*.85),HG=g?g:'horn';
  const drawHorn=pts=>{if(!brk.head){C(pts,'horn',HG);if(B.elder)C(pts.slice(2),'glow',HG);}else stump(K,pts[0],pts[1],pts[0][2],HG);};
  const sweptPts=(o,len,r)=>{const b0=add(hb,o),pts=[[b0[0],b0[1],r]];let q=b0;for(let i=1;i<=3;i++){q=add(add(q,back,len*(.24+i*.05)),uH,len*(.22-i*.06));pts.push([q[0],q[1],r*(1-i*.28)]);}return pts;};
  if(B.horns==='swept')for(const[o,len,r]of[[[0,0],14,1.9],[add(f,[0,0],2.2),10,1.5]])drawHorn(sweptPts(o,len,r));
  else if(B.horns==='ram'){const b2=add(hb,back,1.5),pts=chain(b2[0],b2[1],ah+PI/2+.6,[[3,.3],[3.2,.95],[3,.95],[2.6,.95],[2.2,.9]]).map((q,i)=>[q[0],q[1],[2,1.9,1.7,1.4,1,.5][i]]);drawHorn(pts);
    drawHorn(sweptPts(add(f,[0,0],2),8,1.3));}
  else if(B.horns==='blade')for(const[o,len,r]of[[[0,0],16,1.8],[add(f,[0,0],2),12,1.3]]){const b0=add(hb,o),tip=add(add(b0,back,len),uH,len*.22);drawHorn([[b0[0],b0[1],r],lerp2(b0,tip,.5).concat([r*.7]),tip.concat([.3])]);}
  else if(B.horns==='crown')for(let i=0;i<5;i++){const b0=add(add(hb,back,i*2-1.5),uH,-Math.abs(i-1.5)*.5),a=ah+PI/2+.7-i*.38,tip=add(b0,V(a,6+(i===1||i===2?3:0)));drawHorn([[b0[0],b0[1],1.1],tip.concat([.3])]);}
  else if(B.horns==='antler'){for(const[o,s]of[[[0,0],1],[add(f,[0,0],2.4),.75]]){const b0=add(hb,o),main=[b0,add(add(b0,back,5*s),uH,3*s),add(add(b0,back,10*s),uH,6*s),add(add(b0,back,13*s),uH,10*s)];
      if(!brk.head){C(main.map((q,i)=>q.concat([[1.5,1.2,.9,.4][i]*s])),'horn',HG);for(const k of[1,2])C([main[k].concat([.8*s]),add(add(main[k],uH,4*s),f,1.2*s).concat([.3])],'horn',HG);}else stump(K,main[0],main[1],1.5*s,HG);}}
  else if(B.horns==='jagged'){for(const[o,len]of[[[0,0],9],[add(f,[0,0],2.4),6]]){const b0=add(hb,o),a=ah+PI/2+.65,u=V(a,1),n=V(a+PI/2,1);
      if(!brk.head){P([add(b0,n,1.8),add(add(b0,u,len*.4),n,2.2),add(add(b0,u,len*.55),n,.5),add(b0,u,len),add(add(b0,u,len*.5),n,-1.2),add(b0,n,-1.6)],'horn',HG,{k:.3});G.push(add(b0,u,len*.35));}else stump(K,b0,add(b0,u,len),1.8,HG);}}
  else if(B.horns==='bolt'){for(const[o,len]of[[[0,0],12],[add(f,[0,0],2.2),9]]){const b0=add(hb,o);if(!brk.head)bolt(K,b0,ah+PI-.5,len,1.7,'horn',HG);else stump(K,b0,add(b0,V(ah+PI-.5,len)),1.7,HG);}}
  if(B.elder&&!brk.head){const c=at(-2,sk+5);P([[c[0],c[1]-5],[c[0]+1.4,c[1]-1.4],[c[0]+5,c[1]],[c[0]+1.4,c[1]+1.4],[c[0],c[1]+5],[c[0]-1.4,c[1]+1.4],[c[0]-5,c[1]],[c[0]-1.4,c[1]-1.4]],'glow','horn',{k:.3});}
  if(B.crest==='flame'&&!brk.head)for(let i=0;i<3;i++)flame(K,add(add(hb,back,1+i*2.2),uH,-i*.6),ah+PI/2+.9+i*.18,5-i*.8,1.4,'lava','ridge',t,i*1.9);
  if(B.crest==='plumes'&&!brk.head)for(let i=0;i<5;i++){const b0=add(add(hb,back,i*1.3),uH,-i*.3),a=ah+PI/2+.5-i*.22+Math.sin(t*2.6+i)*.08,e=add(b0,V(a,8+(i%2)*3));C([b0.concat([.7]),e.concat([.5])],'feather2','mane');E(e[0],e[1],2.2,1.2,i%2?'feather':'lava','mane',{a});}
  if(B.mane)for(let i=0;i<5;i++){const q=add(at(-1-i*2,sk*.5-i*.6),uH,0),a=ah+PI-.35+Math.sin(t*2.2+i*.7)*.15,e=add(q,V(a+.4,6+(i%2)*2));C([q.concat([1.6]),lerp2(q,e,.55).concat([1.1]),e.concat([.4])],'fur','mane');}
  return{eye:at(3.2,sk*.42),mouth:at(3+sn,-sk*.5),nose:at(2.2+sn,sk*.22)};}

// ── wings
function batWing(K,sh,base,fwd,g,raise,fold,torn,sc,B,stars,glows){const {E,C,P}=K,sp=Math.max(0,raise-.3)*1.4,a1=fwd+(B.foldA||2.3)-Math.min(raise,.3)*1.3+sp*.6,el=add(sh,V(a1,9*sc)),
    a2=a1-.9-fold*.5+Math.min(raise,.3)*.2-sp*.2,wr=add(el,V(a2,11*sc*(1+sp*.12))),t1=add(wr,V(a2+.3+fold*.15,14*sc)),t2=add(wr,V(a2+.85,12.5*sc)),t3=add(wr,V(a2+1.4-fold*.2,10*sc)),t4=add(wr,V(a2+1.95-fold*.2,7.5*sc));
  const sc1=(a,b)=>lerp2(lerp2(a,b,.5),wr,.32),pg=g==='wingN'?'wpat':g,c4=lerp2(t4,base,.4);
  const tat=B.wpat==='tattered'?[[...lerp2(sc1(t1,t2),t1,.2),1.6],[...lerp2(sc1(t2,t3),t2,.25),1.5]]:null;
  const H=torn?[[...sc1(t1,t2),3.6],[...sc1(t2,t3),3.4],[...lerp2(wr,t3,.55),1.8],[...c4,2.2]]:tat;
  P([sh,el,wr,t1,sc1(t1,t2),t2,sc1(t2,t3),t3,sc1(t3,t4),t4,c4,base],B.elder?'void':'memb',g,{k:.35,holes:H});
  if(B.elder){const pts=[sh,el,wr,t1,t2,t3];for(let i=0;i<10;i++){const a=pts[i%6],b=pts[(i*2+1)%6];stars.push(lerp2(a,b,((i*37)%10)/10));}}
  if(!torn){if(B.wpat==='veins')for(const c of[t1,t2,t3])C([lerp2(wr,c,.15).concat([.4]),lerp2(wr,c,.9).concat([.25])],'dark',pg,{pri:2.6});
    if(B.wpat==='icicles')for(const[a,b]of[[t1,t2],[t2,t3],[t3,t4]])crystal(K,sc1(a,b),PI/2,4,1,'ice',g,{pri:2.6});
    if(B.wpat==='glowedge')for(const[a,b]of[[t1,t2],[t2,t3],[t3,t4]])for(let k=.15;k<1;k+=.28)glows.push(lerp2(lerp2(a,sc1(a,b),k*2>1?1:k*2),lerp2(sc1(a,b),b,k*2-1<0?0:k*2-1),k>.5?1:0));
    if(B.wpat==='bolts')bolt(K,lerp2(wr,t1,.2),Math.atan2(t2[1]-wr[1],t2[0]-wr[0]),Math.hypot(t2[0]-wr[0],t2[1]-wr[1])*.7,1.4,'lava',pg,{pri:2.6});}
  C([[sh[0],sh[1],2.4*sc],[el[0],el[1],2*sc],[wr[0],wr[1],1.7*sc]],'dark',g,{k:1});for(const tp of[t1,t2,t3,t4])C([[wr[0],wr[1],1.3*sc],[tp[0],tp[1],.45]],'dark',g,{k:.6});
  C([[wr[0],wr[1],1.2],add(wr,V(a2-.9,4)).concat([.4])],'claw',g,{k:.4});}
function featherWing(K,sh,fwd,g,raise,torn,sc){const {E,C,P}=K,sp=Math.max(0,raise-.2),a1=fwd+2.1+sp*.6,el=add(sh,V(a1,9*sc)),a2=a1-.7-sp*.4,wr=add(el,V(a2,10*sc));
  C([[sh[0],sh[1],2.4*sc],[el[0],el[1],2*sc],[wr[0],wr[1],1.6*sc]],'feather',g);const n=torn?5:8;
  for(let i=0;i<n;i++){const k=i/7,base=k<.5?lerp2(wr,el,k*2):lerp2(el,sh,(k-.5)*2),a=a2+.9+k*1.2-sp*.3,l=(torn&&i%2?6:17-k*7)*sc,c=add(base,V(a,l/2));E(c[0],c[1],l/2,2*sc,i%2?'feather2':'feather',g,{a,pri:(8-i)*.1});}
  for(let i=0;i<4;i++){const c=add(lerp2(sh,wr,.2+i*.22),V(a2+1.2,3*sc));E(c[0],c[1],3.4*sc,1.5*sc,'bandA',g,{a:a2+1.2,pri:1.5});}}
// ── a lizard leg: hip, knee forward, ankle back, three splayed clawed toes. Fore legs bend the other way at the elbow.
function leg(K,hip,foot,lift,g,L,r,fore){const fy=GROUND-lift,an=fore?[foot+1,fy-2.4]:[foot+2.4,fy-4.4],kn=ik(hip[0],hip[1],an[0],an[1],L,L*.92,fore?(lift>5?-1:1):-1);
  K.E(hip[0]+(fore?0:1),hip[1]+1,r+1.2,r+2.4,'body',g,{a:.4});K.C([[hip[0],hip[1],r],[kn[0],kn[1],r*.6],[an[0],an[1],r*.45]],'body',g);
  K.C([[an[0],an[1],r*.42],[foot-1.6,fy-.6,r*.34]],'body',g);for(const d of[-3.4,-1.6,.2])K.C([[foot-1.4,fy-.4,.9],[foot+d-1.6,fy+.6,.5],[foot+d-3,fy+.2,.25]],'claw',g);
  if(!fore)K.C([[an[0]+.6,an[1]+.4,.8],[an[0]+2.2,an[1]+2,.3]],'claw',g);}
// ── tail tip
function tip(K,te,ta,B,g,brk,G){const lf=V(ta,1),ln=V(ta+PI/2,1);if(brk.tail){wound(K,te,ta,.8,g);return;}const T=B.tip;
  if(T==='spade')K.P([add(te,ln,-1),add(add(te,lf,2),ln,-4.4),add(te,lf,8),add(add(te,lf,2),ln,4.4),add(te,ln,1)],'dark',g,{k:.35,pri:2});
  else if(T==='leaf'){K.P([add(te,ln,-.6),add(add(te,lf,4),ln,-4),add(te,lf,9.5),add(add(te,lf,4),ln,3.4),add(te,ln,.6)],'dark',g,{k:.45,pri:2});K.C([te.concat([.4]),add(te,lf,8).concat([.3])],'body',g,{pri:2.6});}
  else if(T==='crystal')for(let i=-1;i<=1;i++)crystal(K,te,ta+i*.5,9-Math.abs(i)*3,1.5,'ice',g,{pri:2.6});
  else if(T==='axe'){const c=add(te,lf,2.5);K.P([add(c,ln,-1),add(add(c,ln,-6),lf,-2),add(add(c,ln,-7),lf,4),add(add(c,lf,6),ln,-1),add(c,ln,1.4)],'horn',g,{k:.3,pri:2});G.push(add(add(c,ln,-4),lf,1));}
  else if(T==='star'){const c=add(te,lf,3);K.P([[c[0],c[1]-4.4],[c[0]+1.2,c[1]-1.2],[c[0]+4.4,c[1]],[c[0]+1.2,c[1]+1.2],[c[0],c[1]+4.4],[c[0]-1.2,c[1]+1.2],[c[0]-4.4,c[1]],[c[0]-1.2,c[1]-1.2]],'glow',g,{k:.3,pri:2.6});}
  else if(T==='flames'){for(let i=-1;i<=1;i++)flame(K,te,ta+i*.45,6-Math.abs(i)*1.5,1.5,'lava',g,0,i*1.7,{pri:2.6});}
  else if(T==='fan'){for(let i=0;i<5;i++){const a=ta-.8+i*.4,c=add(te,V(a,5.5));K.E(c[0],c[1],5.5,1.5,i%2?'feather2':'feather',g,{a,pri:2});}}
  else if(T==='cloud'){for(let i=-1;i<=1;i++){const a=ta+i*.5,c=add(te,V(a,4));K.E(c[0],c[1],4.5,1.6,'cloud',g,{a,pri:2});}}
  else if(T==='rockclub'){const c=add(te,lf,3.4);K.E(c[0],c[1],5,4.2,'rock',g,{a:ta,pri:2});for(let i=0;i<5;i++)spike(K,add(c,V(ta+i*1.25,3.6)),ta+i*1.25,3,1.1,'horn',g,{pri:2.6});G.push(c,add(c,lf,1.6));}}

// ── the four-limbed, winged builds: wyvern, frost wyrm, king (two legs) and western, zmey (four legs)
function buildLimbed(p,brk,t,B){const K=kit(),{S,E,C,P}=K,stars=[],G=[];K.glows=G;const four=B.plan==='western'||B.plan==='zmey';
  const H=[p.px,p.py],fwd=PI+p.tilt,up=V(fwd+PI/2,1),dn=V(fwd-PI/2,1),Cv=add(H,V(fwd,B.len)),br=Math.sin(t*2.6)*.5+.5;
  // tail from the hip, neck from the chest, all one spine
  const tsh=[.02,-.12,-.2,-.24,-.24,-.22,-.2,-.18,-.16,-.14],nt=brk.tail?Math.ceil(B.tailN*.45):B.tailN,segs=[];for(let i=0;i<nt;i++)segs.push([B.tailL/B.tailN,(tsh[i]??-.14)*B.tailCurl+p.curl*.5+Math.sin(t*2.2-i*.8)*.11*p.wave]);
  const front=p.tb>1.25,tl=ENG.chain(...add(H,V(fwd+PI,2)),p.tb,segs),tailPts=tl.slice().reverse(),tailR=tailPts.map((q,i)=>Math.max(.9,B.tailR*(.12+.88*i/(tailPts.length-1))));
  const necks=[];const nb=[p.n1,p.n2,p.n3];const mkNeck=(da,lk)=>{const N0=add(add(Cv,V(fwd,1.5)),up,B.chestR*.4),ns=[];for(let i=0;i<B.neckN;i++)ns.push([B.neckL*lk/B.neckN,nb[Math.min(2,Math.floor(i*3/B.neckN))]*(3/B.neckN)]);return ENG.chain(N0[0],N0[1],fwd+B.neckA+da,ns);};
  if(B.heads===3){necks.push(mkNeck(.55,.85),mkNeck(-.45,.95),mkNeck(.05,1.05));}else necks.push(mkNeck(0,1));
  const mainNeck=necks[necks.length-1];
  const spine=[...tailPts,H,lerp2(H,Cv,.5),Cv,...mainNeck.slice(1)],rads=[...tailR,B.hipR,B.midR,B.chestR+br*.3,...B.neckR.slice(1,mainNeck.length).concat(Array(Math.max(0,mainNeck.length-B.neckR.length)).fill(B.neckR[B.neckR.length-1]))];
  const tg=front?'tailN':'body';body(K,tailPts.concat([H]),tailR.concat([B.hipR]),tg);body(K,spine.slice(tailPts.length),rads.slice(tailPts.length),'body');
  for(let k=0;k<necks.length-1;k++)body(K,[Cv,...necks[k].slice(1)],[B.chestR*.7,...B.neckR.slice(1,necks[k].length)],'headF');
  scutes(K,spine,rads,Math.max(2,tailPts.length-4),spine.length-1);
  dorsal(K,spine,rads,Math.max(1,tailPts.length-(brk.tail?2:7)),spine.length-1,B,'ridge',t,brk);
  if(B.elder){const ch=add(add(H,V(fwd,B.len*.6)),up,1.2);E(ch[0],ch[1],5,3.8,'void','body',{pri:3,a:-p.tilt,k:.8});for(let i=0;i<6;i++)stars.push([ch[0]-4+((i*7)%9),ch[1]-2.5+((i*5)%6)]);}
  if(B.marks==='cracks')for(let i=0;i<10;i++)G.push(add(add(H,V(fwd,-6+i*(B.len+8)/10)),up,1+Math.sin(i*2.7)*B.midR*.35));
  if(B.marks==='stripes')for(let i=0;i<4;i++){const q=add(add(H,V(fwd,-2+i*B.len/3.3)),up,B.midR*.6);E(q[0],q[1],1.1,2.8,'dark','body',{a:-p.tilt+.3,pri:2.6,k:.5});}
  const te=tailPts[0],ta=Math.atan2(te[1]-tailPts[1][1],te[0]-tailPts[1][0]);tip(K,te,ta,B,tg,brk,G);
  // legs
  if(four){const hip=add(H,dn,1.5),sh=add(Cv,dn,2);
    leg(K,add(hip,[3,0]),H[0]+7+p.l4*.3,p.l4,'legF',B.legL,B.legR,0);leg(K,add(sh,[2.5,0]),Cv[0]+4-p.l2*.4,p.l2,'legF',B.armL,B.armR,1);
    leg(K,hip,H[0]-1+p.l3*.3,p.l3,'legN',B.legL,B.legR,0);leg(K,sh,Cv[0]-4-p.l1*.5,p.l1,'legN',B.armL,B.armR,1);}
  else{const hip=add(H,V(fwd+1.4,3));leg(K,add(hip,[4,0]),H[0]+2+p.l1*.5,Math.max(0,p.l1),'legF',B.legL,B.legR,0);leg(K,hip,H[0]-7+p.l2*.6,Math.max(0,p.l2),'legN',B.legL,B.legR,0);
    if(B.plan!=='frost'){const sh=add(Cv,dn,B.chestR*.3),hand=add(sh,V(fwd+PI/2+1.9-p.ws*.6,6));C([sh.concat([2.2]),lerp2(sh,hand,.5).concat([1.6]),hand.concat([1.2])],'body','legN');for(const d of[-.5,.4])C([hand.concat([.7]),add(hand,V(fwd-PI/2+.4+d,2.6)).concat([.3])],'claw','legN');}}
  // wings
  const shW=four?add(add(Cv,up,B.chestR*.7),V(fwd,-2)):add(Cv,V(fwd-PI/2+.5,B.chestR*.55)),base=four?add(add(H,up,B.hipR*.6),V(fwd,3)):add(H,V(fwd+2.6,3));
  if(B.wings4)batWing(K,add(shW,[8,-3]),base,fwd,'wingF2',p.ws+.7,p.wf-.2,brk.wings,1.0*B.wing,B,stars,G);
  batWing(K,add(shW,[5,-1]),base,fwd,'wingF',p.ws+.25,p.wf,brk.wings,.95*B.wing,B,stars,G);if(B.wings4)batWing(K,add(shW,[3,-2]),base,fwd,'wingN',p.ws+.55,p.wf+.1,brk.wings,.62*B.wing,B,stars,G);
  batWing(K,add(shW,[1,1]),base,fwd,'wingN',p.ws-.1,p.wf+.35,brk.wings,.75*B.wing,B,stars,G);
  // heads
  let hd;necks.forEach((nk,k)=>{const Hn=nk[nk.length-1],na=Math.atan2(Hn[1]-nk[nk.length-2][1],Hn[0]-nk[nk.length-2][0]),side=k<necks.length-1;
    const ph=side?Math.sin(t*2.3+k*2)*.15+p.jaw*.3:0,r=head(K,Hn,na+p.hr+ph,Object.assign({},p,{jaw:side?Math.max(0,Math.sin(t*1.7+k*2.4))*.3+p.jaw*.6:p.jaw}),brk,B,t,G,stars,side?'headF':null);if(!side)hd=r;else K.eyes=(K.eyes||[]).concat([r.eye]);});
  scale(S,H[0],GROUND,B.s);const sc=q=>[H[0]+(q[0]-H[0])*B.s,GROUND+(q[1]-GROUND)*B.s];
  return finish(S,t,p,B,sc(hd.eye),sc(hd.mouth),sc(hd.nose),G.map(sc),stars.map(sc),[H[0]-34,6,H[0]+34,60],0,(K.eyes||[]).map(sc));}

// ── serpent builds: the lung floats, the amphiptere flies on two wings, the coatl coils and rears
function serpentPts(p,t,B,brk){const N=B.N||14,pts=[];
  for(let i=0;i<N;i++){const k=i/(N-1);let x,y;
    if(B.plan==='coatl'){// a coil on the ground at the back, then the body rises in an S to the head
      if(k<.5){const a=-PI*.15+k/.5*PI*1.75;x=p.px+10+Math.cos(a)*15;y=58+Math.sin(a)*4.5-k*2;}
      else{const u=(k-.5)/.5;x=p.px-4-u*22+Math.sin(u*PI*1.2+t*1.6)*3;y=56-u*30-u*u*p.rear*10+Math.sin(t*1.6+u*4)*1.5;}}
    else{x=p.px+32-k*60;const amp=(B.plan==='amphi'?5:6.5)*(1-k*.35);y=p.py+Math.sin(t*(B.plan==='amphi'?3:2.4)-k*7)*amp*p.wave-Math.pow(Math.max(0,k-.45)/.55,1.5)*p.rear*22;}
    pts.push([x,y]);}
  if(p.tb){for(let i=0;i<4;i++){const k=(4-i)/4;pts[i]=[pts[i][0]-p.tb*k*k*14,pts[i][1]+p.tb*k*6];}}
  return pts;}
function buildSerp(p,brk,t,B){const K=kit(),{S,E,C,P}=K,stars=[],G=[];K.glows=G;
  const pts=serpentPts(p,t,B,brk),N=pts.length,rads=pts.map((q,i)=>{const k=i/(N-1);return(1.4+Math.sin(Math.min(1,k*1.2)*PI*.9)*(B.girth||6))*(k>.9?.85:1);});
  const cut=brk.tail?3:0,sp=pts.slice(cut),sr=rads.slice(cut);body(K,sp,sr);scutes(K,sp,sr,1,sp.length-1);dorsal(K,sp,sr,1,sp.length-1,B,'ridge',t,brk);
  const te=sp[0],ta=Math.atan2(te[1]-sp[1][1],te[0]-sp[1][0]);tip(K,te,ta,B,'body',brk,G);
  if(B.plan==='lung'){for(const[i,g]of[[3,'legF'],[3,'legN'],[9,'legF'],[9,'legN']]){if(i<cut)continue;const[a,up,dn]=nrm(pts,i),hip=add(pts[i],dn,rads[i]*.35),sw=Math.sin(t*3+i+(g==='legN'?1.6:0))*.45,
      kn=add(hip,V(PI/2+.6+sw,5.4)),ft=add(kn,V(PI/2-.7+sw,4.6));C([hip.concat([2.6]),kn.concat([1.9]),ft.concat([1.3])],'body',g);for(const d of[-.6,0,.6])C([ft.concat([.8]),add(ft,V(PI-.2+d,2.8)).concat([.3])],'claw',g);}
    // the pearl, held up in the front claw and glowing
    if(B.pearl){const[a,up,dn]=nrm(pts,N-4),q=add(add(pts[N-4],dn,rads[N-4]+5),V(PI,3+Math.sin(t*1.5)));E(q[0],q[1],3.2,3.2,'pearlM','pearl',{});E(q[0]-1,q[1]-1,1,1,'glow','pearl',{pri:3,flat:1});G.push([q[0]+1,q[1]]);}}
  if(B.plan==='amphi'){const i=N-5,[a,up]=nrm(pts,i),sh=add(pts[i],up,rads[i]*.4),base=add(pts[i-3],up,rads[i-3]*.3),flap=Math.sin(t*5)*.5+.5;
    batWing(K,add(sh,[4,-1]),base,PI,'wingF',.2+flap*.9+p.ws*.4,-.3,brk.wings,1.05*B.wing,B,stars,G);batWing(K,sh,base,PI,'wingN',.1+flap*.8+p.ws*.4,-.1,brk.wings,.85*B.wing,B,stars,G);}
  if(B.plan==='coatl'){const i=N-5,[a,up]=nrm(pts,i),sh=add(pts[i],up,rads[i]*.3);featherWing(K,add(sh,[4,-1]),PI+.3,'wingF',.4+p.ws*.8,brk.wings,1.1*B.wing);featherWing(K,sh,PI+.3,'wingN',.2+p.ws*.8,brk.wings,.95*B.wing);}
  const Hn=pts[N-1],na=Math.atan2(Hn[1]-pts[N-2][1],Hn[0]-pts[N-2][0]),hd=head(K,Hn,na+p.hr-.15,p,brk,B,t,G,stars);
  scale(S,p.px,GROUND,B.s);const sc=q=>[p.px+(q[0]-p.px)*B.s,GROUND+(q[1]-GROUND)*B.s];
  return finish(S,t,p,B,sc(hd.eye),sc(hd.mouth),sc(hd.nose),G.map(sc),stars.map(sc),[10,4,92,58],B.plan!=='coatl');}

function finish(S,t,p,B,eye,mouth,nose,glows,stars,box,float,more){const blink=(t%3.7)<.12;
  return{S,mouth,extra:g=>{stars.forEach(([sx,sy],i)=>{const xx=Math.round(sx),yy=Math.round(sy),d=g.getImageData(xx,yy,1,1).data;if(d[3]&&d[0]+d[1]+d[2]<150&&Math.sin(t*3+i*1.7)>-.5){g.fillStyle=i%3?'#c8b8ff':'#ffffff';g.fillRect(xx,yy,1,1);}});
    glowDots(g,glows,B.glowCol,t);ambient(g,B.fx,t,box,B.s>1?9:7);eyeAt(g,eye[0]-1,eye[1],B.eye,blink,1,0);(more||[]).forEach(e=>eyeAt(g,e[0]-1,e[1],B.eye,(t%4.3)<.12,1,0));
    breath(g,B.el,t,mouth,0,p.breath,B.style);if(float){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(Math.round(p.px)-26,65,52,2);}}};}
const BUILD={biped:buildLimbed,frost:buildLimbed,king:buildLimbed,western:buildLimbed,zmey:buildLimbed,amphi:buildSerp,lung:buildSerp,coatl:buildSerp};

const R=(id,name,b,u,h,d,m,B)=>make(id,name,{b,u,h,d,m,glow:B.glowCol},B);
// Fernwing: the heraldic wyvern of the deep forest. Two legs, leaf-veined wings, a leaf frill, a leaf-bladed tail.
R('fern','FERNWING','#3f9e8a','#d9c88e','#e8e2cc','#2c7366','#5ab89a',{plan:'biped',frill:'leaf',tip:'leaf',wpat:'veins',el:'nature'});
// Emberwing: the classic Western fire dragon, like Fafnir. Four legs, a long neck, great fire-edged wings, ram horns, a flame crest, magma in its cracks, a spade tail.
R('ember','EMBERWING','#b8402e','#f0b070','#4a3c48','#6a1f24','#8a2a24',{foldA:2.75,plan:'western',s:1.04,len:20,hipR:8,midR:8,chestR:9,neckN:4,neckL:18,neckA:1.0,neckR:[7.4,6,5,4.4,4],skull:5.4,snout:8,
  tailN:9,tailL:38,tailR:7,legL:9,legR:4.6,armL:8.5,armR:4,wing:1.15,horns:'ram',crest:'flame',wpat:'glowedge',marks:'cracks',fx:'embers',el:'fire',style:'breath',eye:'#ffd34d',glowCol:'#ffb03a'});
// Rimewing: the Norse frost wyrm. Tall and gaunt on two legs, a long neck, blade horns, frills and spines of ice, icicles under its wings.
R('rime','RIMEWING','#9fd0ea','#f4fbff','#e8f8ff','#5a98c0','#bfe4f4',{plan:'frost',len:12,hipR:6.5,midR:5.8,chestR:7,neckN:5,neckL:24,neckA:1.15,neckR:[5.6,4.4,3.7,3.3,3.1,3],skull:4.4,snout:8.5,
  tailN:10,tailL:42,tailR:5.4,tailCurl:.7,legL:11,legR:3.8,wing:1.25,horns:'blade',frill:'crystal',spines:'crystals',tip:'crystal',wpat:'icicles',fx:'snow',el:'ice',style:'breath',eye:'#e8fbff'});
// Voltwing: an amphiptere, the legless winged serpent. It never lands: two great bolt-striped wings beat to hold it up. Bolt horns, a crackling spine.
R('volt','VOLTWING','#d8c83a','#f8f4c0','#4a50a8','#8a7a1a','#5a5cb8',{plan:'amphi',N:13,girth:5,skull:4.8,snout:8.5,wing:1.1,horns:'bolt',spines:'bolts',tip:'spade',wpat:'bolts',fx:'sparks',el:'thunder',style:'spit',eye:'#ffffff',glowCol:'#fff6a0'});
// Obsidwing: Zmey Gorynych, the three-headed dragon. Three necks from one chest of obsidian plates, glowing seams, ragged wings, a rock club tail.
R('obsid','TRIMAW','#2e2a3a','#ff7a2e','#8a8aa0','#1a1826','#5a2a24',{core:'shard',foldA:2.75,plan:'zmey',heads:3,s:1.04,len:19,hipR:8,midR:8.5,chestR:9.5,neckN:4,neckL:16,neckA:1.0,neckR:[7,5.6,4.8,4.2,4],skull:4.8,snout:6.5,
  tailN:8,tailL:32,tailR:6.6,legL:9,legR:4.8,armL:8.5,armR:4.4,wing:1.0,horns:'jagged',spines:'plates',tip:'rockclub',wpat:'tattered',marks:'cracks',fx:'embers',el:'fire',style:'breath',eye:'#ff9a2e',glowCol:'#ff8a2e'});
// Stormwing: the lung, the Chinese thunder dragon. A long body riding the clouds, antlers, whiskers and a beard, a flame-like mane down its spine, four clawed legs, and its pearl.
R('storm','STORMPEARL','#4a50a8','#c8c8f0','#ffe14d','#262a66','#5a60b8',{core:'orb',plan:'lung',N:15,girth:5.6,skull:5.2,snout:8,horns:'antler',spines:'flamemane',maneCol:'#e8ecff',whiskers:1,beard:1,mane:1,tip:'cloud',pearl:1,pearlCol:'#fff6c8',
  cloudCol:'#dfe4ff',fx:'sparks',el:'thunder',style:'breath',eye:'#ffe14d',glowCol:'#ffe14d'});
// Aurorawing: the coatl, the feathered serpent. A coiled body that rears up on great feathered wings, a crest of plumes, feathers down its back, a fan of tail feathers.
R('aurora','AURORAWING','#6ad8c0','#f0f8ff','#b06ad8','#3a9a98','#e8f8ff',{core:'prism',plan:'coatl',N:16,girth:5,skull:4.8,snout:7.5,horns:'none',crest:'plumes',spines:'feathers',featherCol:'#f0f8ff',feather2:'#b06ad8',
  tip:'fan',wing:1,fx:'snow',el:'ice',style:'breath',eye:'#f0e0ff',glowCol:'#c88ae8'});
// Skyrender: Bahamut, the king of dragons. Standing tall, four great veined wings, a crown of horns, glowing lines and an axe-bladed tail.
R('render','SKYRENDER','#e8e8f8','#ffe14d','#4a50a8','#a8a8d8','#d8d8f0',{core:'crown',plan:'king',s:1.06,len:13,hipR:8,midR:7.5,chestR:9,neckN:4,neckL:17,neckA:1.2,neckR:[7,5.6,4.8,4.2,3.9],skull:5.2,snout:8,
  tailN:9,tailL:40,tailR:6.8,legL:11,legR:5,wing:1.15,wings4:1,horns:'crown',frill:'fin',spines:'bolts',tip:'axe',wpat:'veins',marks:'cracks',fx:'sparks',el:'thunder',style:'breath',eye:'#ffe14d',glowCol:'#ffe14d'});
// The Hollow Star: Tiamat, mother of dragons, made of the night sky. Four legs, a long neck, starfield wings, a hollow starlit chest, a star crown and a star at its tail.
R('star','THE HOLLOW STAR','#3b3470','#9a8ae8','#f0e8ff','#221c44','#141030',{foldA:2.75,plan:'western',elder:1,s:1.06,len:20,hipR:8,midR:8,chestR:9,neckN:5,neckL:22,neckA:1.1,neckR:[7,5.6,4.8,4.3,4,3.8],skull:5.2,snout:8.5,
  tailN:10,tailL:40,tailR:6.6,legL:10,legR:4.4,armL:9,armR:4,wing:1.15,horns:'swept',spines:'crystals',tip:'star',fx:'motes',el:'dragon',style:'breath',eye:'#e0d4ff',glowCol:'#c8b8ff'});
})();
