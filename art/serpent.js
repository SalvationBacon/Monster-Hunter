// SERPENTS: one long spine of joints from the tail on the ground up to the head. The spec picks the head (finned crest,
// a frog-wide maw, a shovel snout, long fangs, an angler's lure, twin horns), what runs down the back, and markings.
(()=>{
const {V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,glowDots}=KIT,PI=Math.PI;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={fin:{z:3,R:1.6,k:1},mouth:{z:3.5,R:1,k:1},body:{z:4,R:6.5,k:2.4},jaw:{z:4.2,R:2.4,k:1.4},teeth:{z:4.3,R:.6,k:.5,soft:1},crest:{z:5,R:1.6,k:1}};
const rest={rise:0,lean:0,coil:0,hr:0,jaw:0,sway:1,whip:0,breath:0};
const clips={idle:{len:3,loop:1,keys:[[0,{}],[1.5,{rise:1,hr:.06}],[3,{}]]},
  strike:{len:1.2,keys:[[0,{}],[.45,{rise:4,lean:-.5,coil:1,hr:-.35,jaw:.2,sway:0}],[.58,{rise:0,lean:.7,coil:-.4,hr:.2,jaw:.6,sway:0}],[.68,{rise:0,lean:.7,coil:-.4,hr:.25,jaw:0,sway:0}],[1.2,{}]]},
  slam:{len:1.4,keys:[[0,{}],[.55,{rise:7,lean:-.5,hr:-.5,jaw:.4,sway:0}],[.72,{rise:-6,lean:.8,hr:.4,jaw:.1,sway:0,whip:1}],[.9,{rise:-4,lean:.6,whip:.5}],[1.4,{}]]},
  breath:{len:1.9,keys:[[0,{}],[.5,{rise:6,lean:-.5,hr:-.5,jaw:.3,sway:0}],[.66,{rise:2,lean:.1,hr:.25,jaw:.7,sway:0,breath:.15}],[1.35,{rise:2,lean:.12,hr:.28,jaw:.7,sway:0,breath:1}],[1.5,{breath:0,jaw:.2}],[1.9,{}]]},
  flinch:{len:.6,keys:[[0,{}],[.08,{rise:2,lean:-.6,hr:-.5,jaw:.3,sway:0}],[.6,{}]]}};

function make(id,name,look,D){D=Object.assign({s:1,head:'crest',back:'fins',marks:null,tip:'fin',fx:null,el:'water',style:'breath',eye:'#bff0ff',glowCol:look.glow||'#ffe680',girth:1},D);
  const mats={lava:Object.assign(one(D.glowCol),{flat:.95}),weed:Object.assign(one(ENG.mix(look.d,'#6a8a3a',.5)),{tex:'fur'}),leaf:one(ENG.mix(look.b,'#7ac85a',.4)),plate:Object.assign(one(ENG.mix(look.b,look.d,.35)),{tex:'plate'}),wart:one(ENG.mix(look.u,look.b,.3))};
  return MON[id]={id,name,rig:'serpent',el:D.el,style:D.style,D,W:96,H:72,look,mats,groups,rest,clips,build(p,brk,t){return build(p,brk,t,D);}};}

function build(p,brk,t,D){const K=kit(),{S,E,C,P}=K,glows=[];
  // the spine: along the ground from the tail, then rising into the neck. Absolute headings, nudged by the pose.
  const Dg=PI/180,heads=[169,175,185,197,229,249,263,256,236],lens=[10,12,12,10,9,8,8,8,7],sw=i=>Math.sin(t*1.6-i*.7)*3*p.sway;
  let x=84,y=62;const pts=[[x,y]];heads.forEach((h,i)=>{const neck=i>=4,a=(h+sw(i)+(neck?(i-3)*(-p.lean*9+p.coil*7):0)-(i>=6?p.rise*1.2:0))*Dg,l=lens[i]+(neck?p.rise*.35-p.coil*1.2:0);x+=Math.cos(a)*l;y+=Math.sin(a)*l;pts.push([x,y]);});
  const rads=[3,4.6,5.8,6.6,6.8,6.4,6,5.6,5.2,4.8].map(r=>r*D.girth);const sp=pts.map((q,i)=>[q[0],q[1],rads[i]||4.4]);
  const nrm=i=>{const a=Math.atan2(sp[Math.min(i+1,sp.length-1)][1]-sp[Math.max(i-1,0)][1],sp[Math.min(i+1,sp.length-1)][0]-sp[Math.max(i-1,0)][0]);return[a,V(a+PI/2,1),V(a-PI/2,1)];};
  // the tail end
  const t0=sp[0],t1=sp[1],ta=Math.atan2(t0[1]-t1[1],t0[0]-t1[0]),wa=ta+.5+Math.sin(t*2)*.2+p.whip*.6;
  const tail=brk.tail?[t1]:[add(t0,V(ta,4)).concat([2.4]),add(t0,V(wa,9)).concat([1.4])];
  C([...tail.reverse().map(q=>[q[0],q[1],q[2]||3]),...sp.slice(brk.tail?1:0)],'body','body');
  if(brk.tail)wound(K,t1,ta,.9,'body');
  else{const tp=tail[0];if(D.tip==='fin')P([tp,add(tp,V(wa-1.4,9)),add(tp,V(wa,4)),add(tp,V(wa+1.2,8))],'memb','fin',{k:.5});
    else if(D.tip==='spike')spike(K,tp,wa,7,1.6,'horn','body',{pri:2.6});
    else if(D.tip==='paddle')E(tp[0]+Math.cos(wa)*3,tp[1]+Math.sin(wa)*3,4.5,2.4,'memb','fin',{a:wa});
    else if(D.tip==='lure'){const q=add(tp,V(wa-.4,5));C([tp.concat([.6]),q.concat([.4])],'dark','fin');E(q[0],q[1],1.6,1.6,'lava','fin',{pri:2.6});glows.push(q);}
    else if(D.tip==='blade'){P([add(tp,V(wa+PI/2,1.4)),add(tp,V(wa-.5,10)),add(tp,V(wa,7)),add(tp,V(wa-PI/2,1.4))],'memb','fin',{k:.3});}}
  // belly scutes along the underside
  for(let i=1;i<sp.length-1;i++){const[a,n,dn]=nrm(i),q=add(sp[i],dn,sp[i][2]*.72);E(q[0],q[1],1.9,1.2,'scute','body',{a,pri:2.5,k:.6});}
  // markings
  for(let i=1;i<sp.length-1;i++){const[a,n]=nrm(i);
    if(D.marks==='spots'&&i%2)E(...add(sp[i],n,sp[i][2]*.35),1.4,1.2,'wart','body',{pri:2.6});
    if(D.marks==='bands')C([add(sp[i],n,sp[i][2]*.95).concat([.7]),add(sp[i],n,-sp[i][2]*.5).concat([.6])],'dark','body',{pri:2.7});
    if(D.marks==='glowspots'&&i%2)glows.push(add(sp[i],n,sp[i][2]*.4),add(add(sp[i],n,sp[i][2]*.1),V(a,2),1));
    if(D.marks==='stripes')for(const k of[-.2,.5])glows.push(add(sp[i],n,sp[i][2]*k));}
  // what runs down the back (breakable: the "wings" part)
  const finAt=[[2,8.5],[4,9.5],[6,8.5]];
  for(const [i,h] of finAt){const[a,n]=nrm(i),b=add(sp[i],n,sp[i][2]*.4),d=V(a,1),hh=h*(1+Math.sin(t*2+i)*.06),bk=brk.wings;
    if(D.back==='fins'){if(!bk)P([add(b,d,-5),add(add(b,n,hh),d,-1),add(add(b,n,hh*.6),d,3),add(b,d,5)],'memb','fin',{k:.5});
      else P([add(b,d,-5),add(add(b,n,hh*.4),d,-3),add(add(b,n,hh*.2),d,-1),add(add(b,n,hh*.45),d,1),add(b,d,5)],'memb','fin',{k:.4});}
    else if(D.back==='weeds'){for(let j=0;j<2;j++){const q=add(b,d,-3+j*4),sw2=Math.sin(t*2+i+j)*.3;C([q.concat([1.3]),add(add(q,n,hh*.4),V(a+PI*.15+sw2,1),2).concat([.9]),add(add(q,n,(bk?.3:.6)*hh),V(a+PI*.3+sw2,1),4).concat([.4])],'weed','fin');}}
    else if(D.back==='plates'){P([add(b,d,-5.5),add(add(b,n,bk?2:7),d,-3.4),add(add(b,n,bk?2:7.4),d,2.6),add(b,d,5.5)],'plate','fin',{k:.35});}
    else if(D.back==='leaves'){for(let j=0;j<2;j++){const q=add(b,d,-2+j*4),la=a+PI/2+.6-j*.5+Math.sin(t*1.8+i)*.1,ln=bk?3:hh*1.1;P([q,add(add(q,V(la,ln*.5)),V(la+PI/2,2.6)),add(q,V(la,ln)),add(add(q,V(la,ln*.5)),V(la-PI/2,2))],'leaf','fin',{k:.4});C([q.concat([.4]),add(q,V(la,ln*.85)).concat([.3])],'dark','fin',{pri:2.6});}}
    else if(D.back==='bigfins'){if(!bk)P([add(b,d,-6),add(add(b,n,hh*1.3),d,-2),add(add(b,n,hh*1.1),d,2),add(add(b,n,hh*.5),d,5),add(b,d,6)],'memb','fin',{k:.5});else P([add(b,d,-5),add(add(b,n,hh*.4),d,-2),add(b,d,5)],'memb','fin',{k:.4});
      if(!bk)glows.push(add(add(b,n,hh*.8),d,-1));}
    else if(D.back==='blades'){if(!bk)P([add(b,d,-4),add(add(b,n,hh*1.2),d,-6),add(add(b,n,hh*.4),d,1),add(b,d,4)],'memb','fin',{k:.25});else P([add(b,d,-4),add(add(b,n,hh*.35),d,-2),add(b,d,4)],'memb','fin',{k:.3});
      if(!bk)for(let k=.3;k<1;k+=.3)glows.push(lerp2(add(b,d,-4),add(add(b,n,hh*1.2),d,-6),k));}}
  // head
  const hn=sp[sp.length-1],pa=Math.atan2(hn[1]-sp[sp.length-2][1],hn[0]-sp[sp.length-2][0]),ha=pa+p.hr-.2,hf=V(ha,1),hu=V(ha+PI/2,1),hd=V(ha-PI/2,1),bk=V(ha+PI,1);
  const wide=D.head==='maw',shovel=D.head==='shovel';
  const sk=add(add(hn,hf,2.5),hu,1);E(sk[0],sk[1],wide?7.6:6.6,wide?6.4:5.4,'body','body',{a:ha-PI});
  const s0=add(add(hn,hf,6),hd,.6),s1=add(add(hn,hf,shovel?13.5:12.5),hd,shovel?2.2:1.4);C([[s0[0],s0[1],wide?5.4:4.2],[s1[0],s1[1],wide?4:shovel?2.2:2.6]],'body','body');
  if(shovel)P([add(add(hn,hf,4),hu,3.4),add(add(s1,hf,2.4),hu,.4),add(s1,hd,1.4),add(add(hn,hf,6),hd,1)],'plate','body',{k:.4,pri:1.5});
  const J=add(add(hn,hf,3),hd,wide?4.6:3.4),jd=V(ha-p.jaw,1),j1=add(J,jd,wide?10:9);C([[J[0],J[1],wide?3.8:2.8],[j1[0],j1[1],wide?3:1.8]],'body','jaw');
  if(p.jaw>.05){P([add(J,hu,1),add(s1,hd,.5),j1,J],'mouth','mouth');for(let i=0;i<3;i++){const a=add(add(hn,hf,7.5+i*2.4),hd,3.8),b=add(J,jd,4+i*2.4);P([add(a,hf,-.7),add(a,hf,.7),add(a,hd,1.8)],'tooth','teeth');P([add(b,hf,-.7),add(b,hf,.7),add(b,hu,1.6)],'tooth','teeth');}}
  if(D.head==='fangs'){for(const k of[0,1]){const b=add(add(hn,hf,8.5+k*2.6),hd,2.4);P([add(b,hf,-.8),add(b,hf,.8),add(add(b,hd,5.4+p.jaw*3),hf,.3)],'tooth','teeth',{k:.3});}}
  // crest (breakable: the "head" part)
  const cb=add(add(hn,hf,1),hu,4.4),hb=brk.head;
  if(D.head==='crest'||D.head==='fangs'){const mat=D.head==='fangs'?'leaf':'memb';
    if(!hb){P([add(cb,hf,2),add(add(cb,bk,4),hu,8),add(add(cb,bk,7),hu,4),add(add(cb,bk,11),hu,6.5),add(add(cb,bk,10),hd,2)],mat,'crest',{k:.5});C([[cb[0],cb[1],1],[cb[0]+bk[0]*4+hu[0]*7.5,cb[1]+bk[1]*4+hu[1]*7.5,.4]],'horn','crest',{k:.4});}
    else{P([add(cb,hf,2),add(add(cb,bk,3),hu,3),add(add(cb,bk,5),hu,1.6),add(add(cb,bk,7),hu,2.6),add(add(cb,bk,8),hd,2)],mat,'crest',{k:.4});P([add(add(cb,bk,3),hu,3),add(add(cb,bk,4),hu,4),add(add(cb,bk,5),hu,1.6)],'core','crest',{k:.3});}}
  else if(D.head==='maw'){const ey=add(add(hn,hf,5),hu,6);E(ey[0],ey[1],3,2.8,'body','crest',{});if(!hb)for(let i=0;i<3;i++){const q=add(add(cb,bk,2+i*3),hu,-.5);C([q.concat([1]),add(add(q,bk,2+i),hd,6+i*1.5).concat([.4])],'weed','crest');}
    else P([add(cb,bk,1),add(add(cb,bk,3),hd,2),add(cb,bk,4)],'core','crest',{k:.3});}
  else if(D.head==='shovel'){if(!hb)for(let i=0;i<3;i++)spike(K,add(add(cb,bk,i*2.6),hd,i*.6),ha+PI-.4-i*.2,5-i,1.3,'horn','crest');else stump(K,cb,add(cb,bk,4),1.3,'crest');}
  else if(D.head==='lure'){if(!hb){const s=Math.sin(t*1.6)*.25,l0=add(add(hn,hf,5),hu,4.6),l1=add(l0,V(ha+PI/2+.6+s,6)),l2=add(l1,V(ha+.1+s,7));C([l0.concat([.8]),l1.concat([.6]),l2.concat([.4])],'dark','crest');E(l2[0],l2[1],2,2,'lava','crest',{pri:2.6});glows.push(l2,add(l2,[1,0]));}
    else stump(K,add(add(hn,hf,5),hu,4.6),add(add(hn,hf,5),hu,9),.9,'crest','dark');
    P([add(cb,hf,1),add(add(cb,bk,6),hu,4),add(add(cb,bk,9),hd,1)],'memb','crest',{k:.5});}
  else if(D.head==='horns'){for(const[o,s]of[[[0,0],1],[add(hf,[0,0],2),.75]]){const b=add(cb,o),pts=[b.concat([1.6*s]),add(add(b,bk,6*s),hu,2*s).concat([1.1*s]),add(add(b,bk,13*s),hu,1*s).concat([.3])];if(!hb)C(pts,'horn','crest');else stump(K,pts[0],pts[1],1.6*s,'crest');}
    P([add(cb,hd,1),add(add(cb,bk,8),hd,3),add(add(cb,bk,3),hd,4.4)],'memb','crest',{k:.3});}
  // fins at the jaw hinge for most serpents
  if(D.head!=='maw'&&D.head!=='shovel'){const fb=add(add(hn,hf,-1),hd,1);P([fb,add(add(fb,bk,6),hd,3+Math.sin(t*2.4)*.6),add(add(fb,bk,3),hd,.2)],'memb','crest',{k:.4});}
  const eye=wide?add(add(hn,hf,5),hu,6.2):add(add(hn,hf,4.5),hu,1.8),blink=(t%3.9)<.12,mouth=lerp2(s1,j1,.5);
  scale(S,60,62,D.s);const sc=q=>[60+(q[0]-60)*D.s,62+(q[1]-62)*D.s];const E2=sc(eye),M2=sc(mouth),G2=glows.map(sc);
  return{S,mouth:M2,extra:g=>{glowDots(g,G2,D.glowCol,t);ambient(g,D.fx,t,[16,8,92,62],7);eyeAt(g,E2[0]-(wide?1:0),E2[1]-(wide?1:0),D.eye,blink,!wide,0);breath(g,D.el==='nature'?'poison':D.el,t,M2,ha+p.jaw*.4,p.breath,D.style);}};}

const R=(id,name,b,u,h,d,m,D)=>make(id,name,{b,u,h,d,m,glow:D.glowCol},D);
// Tidecoil: a sea serpent with a finned crest and dorsal fins.
R('tide','TIDECOIL','#3a7ac8','#bfe0ff','#f0ead8','#2a4a90','#5aa0e0',{el:'water',fx:'bubbles'});
// Bogmaw: a swamp serpent with a wide frog-like maw, eyes up top, warts, and weed hanging off its back. Spits poison.
R('bog','BOGMAW','#4a7a5a','#c8d8a0','#e8e2cc','#2c4a3a','#6a8a5a',{head:'maw',back:'weeds',marks:'spots',tip:'paddle',el:'poison',style:'spit',fx:'venom',eye:'#e8f070',girth:1.1});
// Sandeel: a burrowing eel in armour plates, with a shovel snout and horned brow. Spits sand.
R('eel','SANDEEL','#c9a05a','#f2e2b0','#f2dca0','#6a4a24','#d8b070',{head:'shovel',back:'plates',marks:'bands',tip:'spike',el:'earth',style:'spit',fx:'dust',eye:'#2a1a0a'});
// Mirefang: a marsh serpent grown over with leaves, long fangs hanging from its jaw, glowing spots. Spits poison.
R('mire','MIREFANG','#5a5a3a','#b8c890','#c8f08a','#3a3a22','#7a8a4a',{head:'fangs',back:'leaves',marks:'glowspots',tip:'fin',el:'nature',style:'spit',fx:'spores',eye:'#c8f08a',glowCol:'#c8f08a'});
// Abysscoil: a deep-sea serpent with a glowing angler's lure, big fins and lights along its body.
R('abyss','ABYSSCOIL','#1e2a5a','#7fd6ff','#bfeaff','#12183a','#2a4a8a',{head:'lure',back:'bigfins',marks:'glowspots',tip:'lure',el:'water',fx:'bubbles',eye:'#7fd6ff',glowCol:'#7fd6ff'});
// Tidereaver: the abyss's hunter. Twin swept horns, blade fins with glowing edges, glowing stripes.
R('reaver','TIDEREAVER','#123a5a','#4cc9ff','#e8f8ff','#0a2238','#1e5a8a',{s:1.06,girth:1.3,head:'horns',back:'blades',marks:'stripes',tip:'blade',el:'water',fx:'bubbles',eye:'#4cc9ff',glowCol:'#4cc9ff'});
})();
