// SERPENTS from myth, for the three that change shape:
//   basilisk  Bogmaw: the basilisk, king of serpents. A coil on the ground, a neck reared high with a flared hood,
//             a crown of horns, a glare that glows, a flicking forked tongue.
//   worm      Sandeel: the Mongolian death worm. A thick ringed worm bursting from a sand mound, no eyes,
//             a round mouth ringed with teeth that opens wide.
//   hydra     Mirefang: the Hydra of the marsh. A squat body on four legs and five swaying necks, each with its own fanged head.
// (Tidecoil stays the sea serpent, Abysscoil the angler serpent; Tidereaver grows into Leviathan.)
(()=>{
const {V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,glowDots}=KIT,PI=Math.PI;
const GROUND=66;
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
const groups={h0:{z:1.6,R:2.6,k:1.2,dk:-.6},h1:{z:1.8,R:2.6,k:1.2,dk:-.5},h4:{z:2.1,R:2.6,k:1.2,dk:-.4},h2:{z:5.4,R:2.8,k:1.2},h3:{z:5.6,R:2.8,k:1.2},legF:{z:1,R:3,k:1.4,dk:-.9},neckF:{z:2,R:3,k:1.4,dk:-.5},hood:{z:4.4,R:2,k:1},hoodB:{z:3.6,R:2.2,k:1,dk:-.2},fin:{z:3.2,R:1.4,k:.8},body:{z:4,R:6,k:2.2},mound:{z:4.5,R:3,k:2},mouth:{z:4.6,R:1,k:1},jaw:{z:4.7,R:2,k:1},
  teeth:{z:4.8,R:.6,k:.5,soft:1},head:{z:5,R:3.4,k:1.4},crest:{z:5.2,R:1.4,k:.8},legN:{z:6,R:3.4,k:1.4}};
const REST=MON.tide.rest,CLIPS=MON.tide.clips;
function make(id,name,look,B){B=Object.assign({plan:'basilisk',s:1,el:'water',style:'spit',eye:'#bff0ff',glowCol:look.glow||'#ffe680',fx:null},B);
  const base=ENG.materials(look),mats={body:Object.assign({},base.body,{tex:'dscale'}),ring:Object.assign(one(ENG.mix(look.b,look.d,.65)),{tex:'plate'}),sand:Object.assign(one(B.sandCol||'#d8b878'),{tex:'spot'}),
    hoodIn:one(B.hoodCol||look.u),lava:Object.assign(one(B.glowCol),{flat:.95}),leaf:one(ENG.mix(look.b,'#7ac85a',.4)),tongue:one('#e2483d'),pit:Object.assign(one('#1a0e10'),{flat:-.4})};
  return MON[id]={id,name,rig:'serpent',stance:B.plan,el:B.el,style:B.style,D:B,W:96,H:72,look,mats,groups,rest:REST,clips:CLIPS,build(p,brk,t){return build(p,brk,t,B);}};}

// a small serpent head at Hn facing ah, returns eye and mouth
function snake(K,Hn,ah,jaw,brk,g,B,t,G,fang){const {E,C,P}=K,f=V(ah,1),uH=V(ah+PI/2,1),dH=V(ah-PI/2,1),at=(x,y)=>add(add(Hn,f,x),uH,y);
  E(...at(1,.6),4.4,3.6,'body',g,{a:ah-PI});P([at(2,3),at(8,1.2),at(9,-.6),at(2,-2.4)],'body',g,{k:.6});const J=at(1.5,-2),jd=V(ah-jaw,1);C([J.concat([1.8]),add(J,jd,7).concat([1.1])],'body',g);
  if(jaw>.05){P([add(J,uH,.6),at(8.4,-.6),add(J,jd,7),J],'mouth',g,{pri:2.6});}
  if(fang)for(const k of[0,1])P([add(at(5.5+k*2,-1.4),f,-.5),add(at(5.5+k*2,-1.4),f,.5),add(at(5.6+k*2,-1.4),dH,2.6+jaw*3)],'tooth',g,{k:.2,pri:2.6});
  return{eye:at(3,1.4),mouth:at(8,-1)};}

function build(p,brk,t,B){const K=kit(),{S,E,C,P}=K,G=[],pl=B.plan;let eyes=[],mouth=[10,40];
  if(pl==='basilisk'){
    // the coil: a spiral on the ground, tail tucked in the middle, the front loop over the back one
    const N=22,cp=[];for(let i=0;i<N;i++){const k=i/(N-1),a=-1.45*PI+k*2.2*PI,r=7+k*8-p.coil*.8;cp.push([62+Math.cos(a)*r,60.5+Math.sin(a)*(2.2+k*2.6)-(1-k)*3.2,1.6+k*4,Math.sin(a)]);}
    const cut=brk.tail?4:0;for(let i=Math.max(cut,1);i<N;i++){const A=cp[i-1],Bq=cp[i],g=(A[3]+Bq[3])/2>0?'body':'neckF';C([[A[0],A[1],A[2]],[Bq[0],Bq[1],Bq[2]]],'body',g);}
    if(brk.tail)wound(K,cp[cut],0,.7,'neckF');else P([add(cp[0],[-.8,-1]),add(cp[0],[-3.6,-3.4]),add(cp[0],[.8,-.6])],'horn','neckF',{k:.2});   // a horn-tipped tail
    // the neck rises from the front of the coil in an S, and reaches forward to strike
    const E0=[cp[N-1][0],cp[N-1][1]],L=p.lean,R=p.rise,sw=Math.sin(t*1.6)*1.2*p.sway,bz=(u,a0,a1,a2,a3)=>(1-u)**3*a0+3*(1-u)**2*u*a1+3*(1-u)*u*u*a2+u**3*a3;
    const P1=[E0[0]-17-L*4,E0[1]-12],P2=[E0[0]+13-L*8,E0[1]-26-R],P3=[E0[0]-4-L*16+sw,E0[1]-38-R*1.3+L*12];
    const M=10,nk=[];for(let i=0;i<=M;i++){const u=i/M;nk.push([bz(u,E0[0],P1[0],P2[0],P3[0]),bz(u,E0[1],P1[1],P2[1],P3[1]),5.4-u*2.2]);}
    C(nk.map(q=>q.slice()),'body','body');
    for(let i=1;i<M;i++){const q=nk[i],a=Math.atan2(nk[i+1][1]-nk[i-1][1],nk[i+1][0]-nk[i-1][0]),f=add(q,V(a-PI/2,q[2]*.62));E(f[0],f[1],1.5,1,'scute','body',{a,pri:1.4});}   // belly scutes up the front
    // the hood: a broad ribbed shield flaring behind the upper neck, with eye spots
    const hu=7,hc=nk[hu],nv0=Math.atan2(nk[hu+1][1]-nk[hu-1][1],nk[hu+1][0]-nk[hu-1][0]),nv=V(nv0,1),pv=V(nv0+PI/2,1),hw=(brk.wings?6:12.5)+Math.sin(t*1.4)*.4+p.coil*.6,at=(a,b)=>add(add(hc,nv,a),pv,b);
    P([at(7,0),at(5,hw*.8),at(-2,hw),at(-8,hw*.6),at(-12,0),at(-8,-hw*.6),at(-2,-hw),at(5,-hw*.8)],'memb','hoodB',{k:.7});
    P([at(4,0),at(2.6,hw*.55),at(-2,hw*.7),at(-6,hw*.4),at(-8,0),at(-6,-hw*.4),at(-2,-hw*.7),at(2.6,-hw*.55)],'hoodIn','hoodB',{k:.6,pri:1.2});   // the pale inner hood
    for(const sd of[-1,1]){for(let i=0;i<3;i++)C([at(-2,0).concat([.35]),at(4-i*4.5,sd*hw*.85).concat([.3])],'dark','hoodB',{pri:2.6});E(...at(-1,sd*hw*.55),1.8,1.4,'hoodIn','hoodB',{pri:2.7});E(...at(-1,sd*hw*.55),.7,.6,'dark','hoodB',{pri:2.8});}
    // the head: a broad royal skull, heavy brows, a lower jaw that drops to show two fangs
    const ah=Math.atan2(nk[M][1]-nk[M-2][1],nk[M][0]-nk[M-2][0])+p.hr-.5,f=V(ah,1),uH=V(ah+PI/2,1),dH=V(ah-PI/2,1),H0=nk[M],hp=(x,y)=>add(add(H0,f,x),uH,y);
    E(...hp(1.4,.4),5,3.9,'body','head',{a:ah});P([hp(3,2.8),hp(9.6,1.4),hp(10.4,-.6),hp(3,-2.4)],'body','head',{k:.6});
    E(...hp(2.4,2.6),2.4,1.1,'dark','head',{a:ah,pri:1.6});   // brow ridge
    const J=hp(2,-2),jd=V(ah-p.jaw*.9,1);C([J.concat([1.9]),add(J,jd,7.6).concat([1.1])],'body','jaw');
    if(p.jaw>.05){P([add(J,uH,.6),hp(9.6,-.6),add(J,jd,7.6),J],'mouth','mouth',{pri:2.6});for(const k of[0,1])P([add(hp(6+k*2.4,-1.3),f,-.45),add(hp(6+k*2.4,-1.3),f,.45),add(hp(6.1+k*2.4,-1.3),dH,1.6+p.jaw*2.6)],'tooth','teeth',{k:.2,pri:2.6});}
    eyes=[hp(3.4,1.2)];mouth=hp(9,-1);G.push(eyes[0]);
    // the crown: a gold band with five spikes in a fan and a glowing gem
    const cb=hp(.2,3.4);if(!brk.head){C([hp(-2.4,2.6).concat([.9]),hp(3.4,3.6).concat([.8])],'horn','crest');[[3,-1.8],[4.6,-.9],[6.6,0],[4.6,.9],[3,1.8]].forEach(([l,o],i)=>spike(K,add(cb,f,o*1.4-.4),ah+PI/2+.15-o*.32,l,1.1,'horn','crest'));
      E(...add(cb,uH,1.2),1.1,1.1,'lava','crest',{pri:2.7});G.push(add(cb,uH,1.2));}else stump(K,cb,add(cb,uH,3),1.2,'crest');
    // the forked tongue flicks out
    if(Math.sin(t*3)>.4&&p.jaw<.1){const m=add(mouth,f,1),e=add(m,f,4);C([m.concat([.35]),e.concat([.3])],'tongue','teeth');for(const sd of[-1,1])C([e.concat([.3]),add(add(e,f,1.6),uH,sd).concat([.2])],'tongue','teeth');}}
  else if(pl==='worm'){
    // bursting from a sand mound: only the front of the worm is above ground
    const N=11,pts=[];for(let i=0;i<N;i++){const k=i/(N-1),x=70-k*44-p.lean*k*k*10,y=GROUND-2-Math.sin(Math.min(1,k*1.3)*PI*.62)*(30+p.rise*1.5)+k*k*12+Math.sin(t*1.8+k*4)*1.2*p.sway;pts.push([x,y]);}
    const rads=pts.map((q,i)=>7.4-i*.15);C(pts.map((q,i)=>[q[0],q[1],rads[i]]),'body','body');
    for(let i=1;i<N-1;i++){const a=Math.atan2(pts[i+1][1]-pts[i-1][1],pts[i+1][0]-pts[i-1][0]),n=V(a+PI/2,1);C([add(pts[i],n,rads[i]*.95).concat([.8]),add(pts[i],n,-rads[i]*.95).concat([.8])],'ring','body',{pri:1.5});
      if(!brk.wings&&i%2)spike(K,add(pts[i],n,rads[i]*.8),a+PI/2-.3,3,1.1,'horn','fin');}
    E(72,GROUND-1,15,5,'sand','mound',{});E(62,GROUND,7,3,'sand','mound',{});
    // the mouth: the worm's end seen nearly head-on, a dark pit ringed with teeth
    const hn=pts[N-1],ha=Math.atan2(hn[1]-pts[N-2][1],hn[0]-pts[N-2][0]),r=rads[N-1],open=.6+p.jaw*.8;
    E(...add(hn,V(ha,1.5)),3.4,r*.95,'body','head',{a:ha});E(...add(hn,V(ha,2.6)),1.6,r*.6*open,'pit','head',{a:ha,pri:2.6});
    if(!brk.head)for(let i=0;i<8;i++){const aa=i/8*PI*2,q=add(add(hn,V(ha,2.8)),V(ha+PI/2,Math.sin(aa)*r*.62*open));P([add(q,V(ha+PI/2,.6)),add(q,V(ha,2.4)),add(q,V(ha+PI/2,-.6))],'tooth','teeth',{k:.2,pri:2.6});}
    mouth=add(hn,V(ha,3));if(brk.tail)E(72,GROUND-3,3,2,'wound','mound',{pri:2.6});}
  else if(pl==='hydra'){
    // a squat marsh body on four legs, a tail, and five necks
    const Bc=[64,48],sw=p.sway;E(Bc[0],Bc[1],15,10,'body','body',{bulge:1.6});C([[Bc[0]-2,Bc[1]+6,6],[Bc[0]+6,Bc[1]+6,6]],'belly','body',{pri:1.4});
    for(let i=0;i<9;i++)G.push([Bc[0]-9+i*2.4,Bc[1]-3+Math.sin(i*2)*3]);
    const tl=chain(Bc[0]+13,Bc[1]+1,.2,brk.tail?[[5,.1]]:[[6,.15+Math.sin(t*2)*.1],[6,.15],[5,.2],[4,.2]]);C(tl.map((q,i)=>[q[0],q[1],[5,4,3,2,1.2][i]]),'body','body');if(brk.tail)wound(K,tl[1],.3,.6,'body');
    for(const[dx,g]of[[-8,'legF'],[8,'legF'],[-11,'legN'],[5,'legN']]){const hip=[Bc[0]+dx,Bc[1]+5],ft=[hip[0]-1,GROUND];C([hip.concat([3.4]),[hip[0]+1,hip[1]+6,2.6],ft.concat([2.2])],'body',g);for(let i=0;i<3;i++)C([[ft[0]-1+i*1.2,ft[1]-.5,.6],[ft[0]-2+i*1.2,ft[1]+.4,.3]],'claw',g,{pri:2.6});}
    if(!brk.wings)for(let i=0;i<4;i++){const b=[Bc[0]-6+i*5,Bc[1]-9+Math.abs(i-1.5)],la=-PI/2+.4-i*.25+Math.sin(t*1.6+i)*.1;P([b,add(add(b,V(la,4)),V(la+PI/2,2.4)),add(b,V(la,8)),add(add(b,V(la,4)),V(la-PI/2,2))],'leaf','fin',{k:.4});}
    const necks=[[.25,30,'h0'],[-.55,27,'h1'],[-.15,31,'h2'],[-1.0,24,'h3'],[.65,25,'h4']];
    necks.forEach(([da,len,g],k)=>{const sev=brk.head&&k===2,base=[Bc[0]-9+k*1.2,Bc[1]-5+[0,3,1,5,-2][k]],a0=PI+.9+da+Math.sin(t*1.7+k*1.3)*.12*sw-p.lean*.4,segs=[];const n=sev?2:5;
      for(let i=0;i<n;i++)segs.push([len/5,(-.12+Math.sin(t*1.9+k*2+i*.6)*.12*sw)-p.rise*.02+p.coil*.08]);const nk=chain(base[0],base[1],a0,segs);
      C(nk.map((q,i)=>[q[0],q[1],4-i*.5]),'body',g);if(sev){const e=nk[nk.length-1];wound(K,e,Math.atan2(e[1]-nk[nk.length-2][1],e[0]-nk[nk.length-2][0]),.6,g);return;}
      const Hn=nk[nk.length-1],ha=Math.atan2(Hn[1]-nk[nk.length-2][1],Hn[0]-nk[nk.length-2][0])+p.hr-.5+Math.sin(t*2+k)*.1,jw=k===2?p.jaw:Math.max(0,Math.sin(t*1.5+k*1.7))*.35+p.jaw*.5;
      const r=snake(K,Hn,ha,jw,brk,g,B,t,G,1);eyes.push(r.eye);if(k===2)mouth=r.mouth;
      const cb=add(Hn,V(ha+PI/2,3));P([cb,add(add(cb,V(ha+PI,5)),V(ha+PI/2,3)),add(cb,V(ha+PI,3))],'leaf',g,{k:.4});});}
  const blink=(t%3.9)<.12;scale(S,60,GROUND,B.s);const sc=q=>[60+(q[0]-60)*B.s,GROUND+(q[1]-GROUND)*B.s];const EY=eyes.map(sc),G2=G.map(sc),M2=sc(mouth);
  return{S,mouth:M2,extra:g=>{glowDots(g,G2,B.glowCol,t);ambient(g,B.fx,t,[16,8,92,62],7);EY.forEach((e,i)=>eyeAt(g,e[0]-1,e[1]-1,B.eye,(t%(3.9+i*.4))<.12,1,0));
    breath(g,B.el==='nature'?'poison':B.el,t,M2,PI,p.breath,B.style);}};}

const R=(id,name,b,u,h,d,m,B)=>make(id,name,{b,u,h,d,m,glow:B.glowCol},B);
R('bog','BOGCROWN','#4a7a5a','#c8d8a0','#e8c84a','#2c4a3a','#6a8a4a',{plan:'basilisk',hoodCol:'#e8e0a0',el:'poison',style:'spit',fx:'venom',eye:'#ffe14d',glowCol:'#ffe14d'});
R('eel','SANDMAW','#c9a05a','#f2e2b0','#f2dca0','#6a4a24','#d8b070',{plan:'worm',sandCol:'#e8cc8a',el:'earth',style:'spit',fx:'dust',eye:'#2a1a0a'});
R('mire','MIREFANG','#5a5a3a','#b8c890','#c8f08a','#3a3a22','#7a8a4a',{plan:'hydra',el:'nature',style:'spit',fx:'spores',eye:'#c8f08a',glowCol:'#c8f08a'});
})();
