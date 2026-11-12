// ARTHROPODS from myth and life, for the crabs that are not crabs:
//   scorpion  Venomsting: a giant scorpion. Long pincers, a segmented body, a tail arched high with a glowing venom bulb.
//   spider    Magmaclaw: a volcanic spider crab. A small round smoking shell high on eight very long legs, long thin claws.
//   horseshoe Crystalback: a horseshoe crab of the deep caves. A great dome shell grown over with crystals, a long tail spike.
//   ushioni   Dusksting: the Ushi-oni of Japanese legend. An ox-horned demon head on a spider's body, six long legs, a scythe tail.
// (Mudclaw stays Karkinos, the giant crab; Shellsnap the hermit; Pyreclaw the flame-crowned crab.)
(()=>{
const {V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,glowDots}=KIT,PI=Math.PI;
const GROUND=66;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={legF:{z:1,R:1.8,k:1,dk:-.9},clawF:{z:2,R:2.6,k:1.2,dk:-.7},abd:{z:3,R:5,k:1.8},body:{z:4,R:6,k:2},top:{z:4.3,R:2.4,k:1},tail:{z:4.6,R:2.6,k:1.2},head:{z:4.8,R:3.6,k:1.6},
  teeth:{z:4.9,R:.6,k:.5,soft:1},horn:{z:5,R:1.6,k:.9},legN:{z:6,R:2,k:1},clawN:{z:7,R:3,k:1.2}};
const REST=MON.mud.rest,CLIPS=MON.mud.clips;
function make(id,name,look,B){B=Object.assign({plan:'scorpion',s:1,el:'water',style:'spit',eye:'#101418',glowCol:look.glow||'#ffe680',fx:null},B);
  const base=ENG.materials(look),mats={shell:Object.assign({},base.shell),seg:Object.assign(one(ENG.mix(look.b,look.d,.35)),{tex:'plate'}),lava:Object.assign(one(B.glowCol),{flat:.95}),
    rock:one(ENG.mix(look.d,'#000000',.3)),gem:Object.assign(one(look.h),{dk:.3}),ox:one(B.oxCol||look.b),fur:Object.assign(one(look.d),{tex:'fur'})};
  return MON[id]={id,name,rig:'crab',stance:B.plan,el:B.el,style:B.style,D:Object.assign({sting:B.plan==='scorpion'||B.plan==='ushioni'||B.plan==='horseshoe'?'yes':null},B),W:96,H:72,look,mats,groups,rest:REST,clips:CLIPS,build(p,brk,t){return build(p,brk,t,B);}};}

function build(p,brk,t,B){const K=kit(),{S,E,C,P}=K,G=[],pl=B.plan,br=Math.sin(t*2)*.5+.5,cx=p.px+p.shift,cy=p.py+({scorpion:9,horseshoe:9,ushioni:4,spider:0})[pl];let eyes=[],mouth=[cx-18,cy-2];
  // a jointed walking leg: hip, knee up high, foot planted
  const walk=(hip,kneeUp,foot,g,r)=>{const kn=[(hip[0]+foot[0])/2+(foot[0]-hip[0])*.1,Math.min(hip[1],foot[1])-kneeUp];C([[hip[0],hip[1],r],[kn[0],kn[1],r*.85]],'shell',g);C([[kn[0],kn[1],r*.8],[foot[0],foot[1]-1,r*.4],[foot[0],foot[1],.3]],'dark',g);};
  const pincer=(sh,g,size,open,reach,raise,broken,long)=>{const a=PI+.1+raise*1.1,el=add(sh,V(a,(long?9:6)*size+reach*.4)),wr=add(el,V(a-.5-raise*.4,(long?9:5)*size+reach*.6));
    C([[sh[0],sh[1],2*size],[el[0],el[1],1.8*size],[wr[0],wr[1],2*size]],'shell',g);const pa=Math.atan2(wr[1]-el[1],wr[0]-el[0]),hand=add(wr,V(pa,3*size));E(hand[0],hand[1],4*size,2.8*size,'shell',g,{a:pa,bulge:1});
    const b=add(hand,V(pa,3*size)),fu=V(pa-.25-open*.5,1),fl=V(pa+.3+open*.35,1),nu=V(pa-PI/2,1),nl=V(pa+PI/2,1);
    if(!broken)P([add(b,nu,1.8*size),add(add(b,fu,6.5*size),nu,.4),add(b,fu,7.5*size),add(b,nl,.3)],'horn',g,{k:.5});else{P([add(b,nu,1.8*size),add(b,fu,2.4*size),add(b,nl,.3)],'horn',g,{k:.4});P([add(b,fu,1.6),add(b,fu,2.6),add(add(b,fu,2),nl,.8)],'core',g,{k:.3,pri:2.6});}
    P([add(b,nl,1.4*size),add(add(b,fl,5*size),nl,.3),add(b,fl,6*size),add(b,nu,.4)],'claw',g,{k:.5});return add(b,fu,4);};
  if(pl==='scorpion'){
    // body: a carapace and a run of abdomen plates
    E(cx-6,cy,10,6,'shell','body',{a:p.tilt*.5,bulge:1});for(let i=0;i<5;i++)E(cx+4+i*3.8,cy-i*.6,5.4-i*.35,5-i*.3,'seg','abd',{pri:i*.1});
    for(let s of[0,1])for(let i=0;i<4;i++){const o=i-1.5,hip=[cx-4+i*4+(s?2:-1),cy+3],lw=(i%2?1:-1)*p.lw,ft=[hip[0]+o*8+6+lw*2,GROUND-Math.max(0,lw*2.5)];walk(hip,4-Math.abs(o)*.5,ft,s?'legF':'legN',1.5);}
    mouth=pincer([cx-12,cy+1],'clawF',.85,p.cF,p.reachF,p.raiseN*.4,false,1);pincer([cx-13,cy+2.5],'clawN',1.05,p.cN,0,p.raiseN,false,1);
    // the tail: five segments arching up and over, a bulb and a stinger
    const st=brk.tail,ang=-PI*.42-p.stab*.35,k=1-p.stab*.15,L=1+p.stab*.25,segs=st?[[5,-.4],[5,-.45]]:[[6*L,-.35*k],[6*L,-.42*k],[5.6*L,-.5*k],[5.2*L,-.55*k],[4.6*L,-.55*k]];
    const sp=chain(cx+19,cy-2,ang,segs);C(sp.map((q,i)=>[q[0],q[1],3.2-i*.3]),'shell','tail');for(let i=1;i<sp.length;i++)E(sp[i][0],sp[i][1],2.6-i*.2,2.2-i*.2,'seg','tail',{pri:2.6,k:.6});
    const e=sp[sp.length-1],ea=Math.atan2(e[1]-sp[sp.length-2][1],e[0]-sp[sp.length-2][0]);if(!st){E(e[0],e[1],3.4,2.8,'lava','tail',{a:ea,pri:2.6});P([add(e,V(ea+PI/2,1.3)),add(e,V(ea+.4,7)),add(e,V(ea-PI/2,1.3))],'claw','tail',{k:.3,pri:2.6});G.push(add(e,V(ea,1)));}else wound(K,e,ea,.6,'tail');
    eyes=[[cx-12,cy-3],[cx-10,cy-3.6]];if(!brk.head)for(let i=0;i<2;i++)C([[cx-13+i*2,cy-3,.6],[cx-16+i*2,cy-8,.3]],'dark','head');
    if(!brk.wings)for(let i=0;i<5;i++)spike(K,[cx-2+i*4,cy-4-i*.4],-PI/2+.3,2.6,1,'dark','top');}
  else if(pl==='spider'){
    const by=cy-10;E(cx,by,10,7,'shell','body',{bulge:1.6});E(cx,by+4,8,3,'belly','body',{pri:1.4});
    for(let i=0;i<3;i++){const b=[cx-5+i*5,by-6+Math.abs(i-1)];if(!brk.wings){P([[b[0]-2.6,b[1]+2],[b[0]-1,b[1]-3.4],[b[0]+1,b[1]-3.4],[b[0]+2.6,b[1]+2]],'rock','top',{k:.4});E(b[0],b[1]-3.4,1,.6,'lava','top',{pri:2.6});G.push([b[0],b[1]-4.4]);}}
    for(let i=0;i<10;i++)G.push([cx-8+i*1.7,by-1+Math.sin(i*2.2)*2.6]);
    for(const s of[0,1])for(let i=0;i<4;i++){const o=i-1.5,hip=[cx-4+i*2.8,by+3],lw=(i%2?1:-1)*p.lw,ft=[cx+o*15+(s?4:-2)+lw*2,GROUND-Math.max(0,lw*3)];const kn=[(hip[0]+ft[0])/2+o*3,by-12-Math.abs(o)*2+(s?2:0)];
      C([[hip[0],hip[1],1.6],[kn[0],kn[1],1.4]],'shell',s?'legF':'legN');C([[kn[0],kn[1],1.3],[ft[0],ft[1]-1,.7],[ft[0],ft[1],.3]],'dark',s?'legF':'legN');}
    mouth=pincer([cx-8,by+3],'clawF',.6,p.cF,p.reachF,p.raiseN*.4-.4,false,1);const cl=pincer([cx-9,by+4],'clawN',.75,p.cN,0,p.raiseN-.5,brk.tail,1);
    for(const x of[cx-6,cx-3]){if(!brk.head)C([[x,by-5,1],[x-1,by-9,.8]],'shell','head');eyes.push([x-1,by-10]);}}
  else if(pl==='horseshoe'){
    // the dome: a broad horseshoe of shell, a hinged rear plate with edge spines, a long tail spike
    const dy=cy+2;E(cx-5,dy,17,10,'shell','body',{bulge:2.4,bw:6});E(cx+12,dy+1,9,7,'seg','abd',{});for(let i=0;i<4;i++)spike(K,[cx+8+i*3,dy+6],PI/2-.2,2.4,1,'dark','abd');
    C([[cx-21,dy+2,1.2],[cx-5,dy+9,1.5],[cx+11,dy+5,1.2]],'dark','body',{pri:2.6});
    const tl=brk.tail?[[cx+19,dy],[cx+22,dy-2]]:chain(cx+19,dy,-.35-p.stab*.8,[[6,-.1],[6,-.15],[6,-.2],[5,-.2]]);C(tl.map((q,i)=>[q[0],q[1],[2,1.6,1.2,.8,.4][i]||.4]),'horn','tail');if(brk.tail)wound(K,tl[1],-.4,.5,'tail');
    for(let i=0;i<5;i++)C([[cx-14+i*5,dy+7,.9],[cx-15+i*5,GROUND,.4]],'dark','legN');
    // crystals grow from the dome (breakable)
    const shards=[[-10,-6,.4],[-5,-12,-.1],[0,-9,.25],[5,-6,.6],[-14,-3,-.5]];shards.forEach(([dx,h,a],i)=>{const b=[cx+dx,dy-8+Math.abs(dx)*.12],len=brk.wings?3:8-h*.5;crystal(K,b,-PI/2+a,len,2.4-(i%2)*.6,'gem','top');});
    eyes=[[cx-14,dy-4],[cx-6,dy-7]];mouth=[cx-20,dy+2];if(!brk.head)for(const x of[cx-18,cx-16])C([[x,dy+1,.6],[x-4,dy-3,.3]],'dark','head');}
  else if(pl==='ushioni'){
    // a spider's body: a great spiked abdomen behind, a cephalothorax, six long legs
    const ay=cy-6;E(cx+10,ay,12,9,'shell','abd',{bulge:2,bw:5});E(cx-4,ay+2,8,6,'shell','body',{});
    if(!brk.wings)for(let i=0;i<6;i++){const a=-PI*.9+i*.32,b=[cx+10+Math.cos(a)*11,ay+Math.sin(a)*8.4];spike(K,b,a,4+(i%2)*2,1.4,'horn','top');}
    for(let i=0;i<5;i++)G.push([cx+5+i*2.6,ay-2+Math.sin(i*1.9)*2]);
    for(const s of[0,1])for(let i=0;i<3;i++){const o=i-1,hip=[cx-4+i*4,ay+5],lw=(i%2?1:-1)*p.lw,ft=[cx+o*15+(s?5:-3)+lw*2,GROUND-Math.max(0,lw*3)],kn=[(hip[0]+ft[0])/2+o*3,ay-9-Math.abs(o)*2+(s?3:0)];
      C([[hip[0],hip[1],2],[kn[0],kn[1],1.6]],'fur',s?'legF':'legN');C([[kn[0],kn[1],1.5],[ft[0],ft[1]-1.5,.8],[ft[0],ft[1],.3]],'dark',s?'legF':'legN');}
    // the ox-demon head with great horns and fangs
    const hd=[cx-14+p.reachF*.4,ay+1+p.raiseN*-3];E(hd[0],hd[1],7.6,6.6,'ox','head',{bulge:1});C([[hd[0]-3,hd[1]+1.5,5],[hd[0]-9,hd[1]+3,3.8]],'ox','head');E(hd[0]-10,hd[1]+3,1.4,1.2,'dark','head',{pri:2.6});
    for(const k of[0,1])P([[hd[0]-6+k*2.4,hd[1]+4],[hd[0]-4.6+k*2.4,hd[1]+4],[hd[0]-5.4+k*2.4,hd[1]+8+p.cN*3]],'tooth','teeth',{k:.3});
    if(!brk.head)for(const[s,g]of[[1,'horn'],[-1,'clawF']]){const b=[hd[0]+1,hd[1]-5],pts=[b.concat([2.4]),[b[0]+5,b[1]-3,2],[b[0]+4.4,b[1]-9,1.4],[b[0]-1.5,b[1]-12.5,.4]];C(s>0?pts:pts.map(q=>[q[0]+3,q[1]+1,q[2]*.85]),'horn',g);}
    else stump(K,[hd[0]+1,hd[1]-4],[hd[0]+4,hd[1]-8],2,'horn');
    eyes=[[hd[0]-4,hd[1]-1],[hd[0]-1,hd[1]-1.4]];mouth=[hd[0]-9,hd[1]+5];
    // the scythe at the abdomen's tip
    const tb=[cx+21,ay+1],sa=-PI*.35-p.stab*.9;if(!brk.tail){const m=add(tb,V(sa,6)),e=add(m,V(sa-.9,7));C([tb.concat([1.6]),m.concat([1.2])],'shell','tail');P([add(m,V(sa-PI/2,1.2)),add(add(m,V(sa-.9,4)),V(sa-.9-PI/2,2.4)),e,add(m,V(sa+PI/2,1))],'horn','tail',{k:.3});G.push(add(m,V(sa-.9,3)));}else wound(K,tb,sa,.6,'tail');}
  const blink=(t%3.3)<.1;scale(S,cx,GROUND,B.s);const sc=q=>[cx+(q[0]-cx)*B.s,GROUND+(q[1]-GROUND)*B.s];const EY=eyes.map(sc),G2=G.map(sc),M2=sc(mouth);
  return{S,mouth:M2,extra:g=>{glowDots(g,G2,B.glowCol,t);ambient(g,B.fx,t,[cx-30,4,cx+30,58],7);for(const e of EY){const x=Math.round(e[0]),y=Math.round(e[1]);g.fillStyle=blink?'#2a2018':B.eye;g.fillRect(x-1,y,2,2);if(!blink){g.fillStyle='#fff';g.fillRect(x-1,y,1,1);}}
    breath(g,B.el==='nature'?'poison':B.el,t,M2,PI,p.breath,B.style);}};}

const R=(id,name,b,u,h,d,B)=>make(id,name,{b,u,h,d,glow:B.glowCol},B);
R('sting','VENOMSTING','#7a4a8a','#d8c0e0','#c8f08a','#4a2c5a',{plan:'scorpion',el:'nature',fx:'venom',glowCol:'#c8f08a',eye:'#c8f08a'});
R('magma','MAGMASTRIDER','#3a2a2e','#ff7a2e','#ffd34d','#221a1e',{plan:'spider',el:'fire',fx:'embers',glowCol:'#ff8a2e',eye:'#ffb03a',style:'breath'});
R('cryst','CRYSTALBACK','#8a7ab8','#e0d8f0','#bfeaff','#5a4a88',{plan:'horseshoe',el:'earth',fx:'dust',eye:'#bfeaff'});
R('dusk','DUSKHORN','#3a2a4a','#b890c8','#e0508a','#221a2e',{plan:'ushioni',oxCol:'#8a5a7a',el:'dragon',fx:'motes',glowCol:'#ff6ab0',eye:'#ff7ab0',style:'breath'});
})();
