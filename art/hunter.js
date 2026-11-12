// The hunter v3: same engine as the monsters. One flowing body, IK legs, a plume that trails the motion.
const HUN=(()=>{
const {ik}=ENG, V=(a,l)=>[Math.cos(a)*l,Math.sin(a)*l], add=(p,q,k)=>[p[0]+q[0]*(k??1),p[1]+q[1]*(k??1)];
const W=56,H=54,GROUND=51;
const groups={cape:{z:.6,R:1.6,k:1,dk:-.3},mane:{z:4.6,R:2.6,k:1.4},crest:{z:5.7,R:1.4,k:.8},paul:{z:7.7,R:2,k:1},armB:{z:1,R:1.8,k:1.2,dk:-.8},wpnB:{z:1.5,R:1.2,k:.6},legB:{z:2,R:2.4,k:1.4,dk:-.7},body:{z:4,R:3.6,k:1.8},head:{z:5,R:3.6,k:1.6},helm:{z:5.5,R:2,k:1},
  legN:{z:6,R:2.6,k:1.4},shield:{z:7,R:1.8,k:1},armN:{z:7.5,R:1.9,k:1.2},wpn:{z:8,R:1.2,k:.6},pot:{z:7.4,R:2.6,k:1},potL:{z:7.45,R:1.6,k:.8,soft:1}};
const REST={gs:-2.25,db:.5,hm:-2.0,ln:-.15};
// p: {hx,hy,lean,crouch,fB,fF,wa,reach,hT,guard,drink,sharpen,glow,roll,wb}
function build(p,wt,gear,t){const S=[],E=(x,y,rx,ry,m,g,o)=>S.push(Object.assign({t:'E',x,y,rx,ry,m,g},o||{})),C=(pts,m,g,o)=>S.push(Object.assign({t:'C',p:pts,m,g},o||{})),P=(pts,m,g,o)=>S.push(Object.assign({t:'P',p:pts,m,g},o||{}));
  if(p.roll!=null)return rollBuild(p,wt,gear,t);
  const br=Math.sin(t*3)*.35,hip=[p.hx,p.hy+p.crouch*2],up=V(-Math.PI/2+p.lean*.12,1),chest=add(hip,up,9-p.crouch),neck=add(chest,up,3.2+br*.2),head=add(neck,V(-Math.PI/2+p.lean*.16+p.hT*.2,1),4.6);
  // ── armor. Four pieces, each from its own monster: he (helm), ch (chest), ar (gauntlets), lg (boots).
  // A piece's look = {rig,el,b,u,h,d,f}: the monster's body type sets the shape language, its element adds an accent, its colours paint it.
  const lag=Math.sin(t*5)*.18+(p.lean||0)*.15+(p.wb||0),ha=(p.lean||0)*.16+(p.hT||0)*.2,hd=(x,y)=>{const[a,b]=ENG.rot(x,y,ha);return add(head,[a,b]);},ID=q=>gear[q].id,
    // a fern-like leaf: a curling spine with a serrated outline
    leaf=(b,a,len,w,m,g,curl,o)=>{const n=6,sp=ENG.chain(b[0],b[1],a,Array.from({length:n},()=>[len/n,curl||0])),L=[],R=[];
      sp.forEach((q,i)=>{const j=Math.min(i,n-1),d=Math.atan2(sp[j+1][1]-sp[j][1],sp[j+1][0]-sp[j][0])+Math.PI/2,k=Math.sin(Math.PI*Math.min(1,(i+.6)/(n+.2)))*w*(i%2?1:.62);L.push(add(q,V(d,k)));R.unshift(add(q,V(d,-k)));});
      P(L.concat(R),m,g,Object.assign({k:.4},o||{}));return sp;},
    flame=(b,a,len,w,m,g,ph)=>{const f=Math.sin(t*13+ph)*.5,u=V(a+f*.25,1),n=V(a+Math.PI/2,1),tip=add(b,u,len*(1+f*.25));P([add(b,n,w),add(add(b,u,len*.45),n,w*.8),tip,add(add(b,u,len*.5),n,-w*.6),add(b,n,-w)],m,g,{k:.4,pri:4});},RG=q=>gear[q].rig,FL=q=>gear[q].f||{};
  const accent=(q,at,a,g,s)=>{const el=gear[q].el;if(q==='ch'&&(el==='water'||el==='earth'))return;const X=q+'X',G=q+'G',u=V(a,1),n=V(a+Math.PI/2,1),P2=(pts,m,o)=>P(pts.map(([x,y])=>add(add(at,u,x*s),n,y*s)),m,g,o);
    if(el==='nature'){P2([[0,0],[2,-1.4],[4.6,-.4],[2.2,.9]],X,{pri:3,k:.4});P2([[0,0],[1.6,1.4],[4,2.4],[2.6,.4]],X,{pri:3,k:.4});}
    else if(el==='fire'){P2([[0,-1.4],[2.6,-1],[5,0],[2.2,.4],[3.6,1.6],[0,1.3]],G,{pri:3,k:.4});}
    else if(el==='ice'){P2([[0,-.9],[4.4,-.3],[0,.6]],X,{pri:3,k:.2});P2([[0,.4],[2.8,1.8],[-.2,1.4]],X,{pri:3,k:.2});}
    else if(el==='thunder'){P2([[0,-.7],[2.2,-1.2],[1.8,0],[4.8,-.6],[2.2,1.2],[2.4,.2],[0,.8]],G,{pri:3,k:.2});}
    else if(el==='water'){P2([[0,-1.2],[3.8,-1.6],[2.4,0],[3.2,1],[0,1]],X,{pri:3,k:.4});}
    else if(el==='earth'){const c=add(at,u,1.6*s);E(c[0],c[1],1.5*s,1.2*s,X,g,{pri:3});const c2=add(add(at,u,3.2*s),n,.8*s);E(c2[0],c2[1],1*s,.9*s,X,g,{pri:3});}
    else if(el==='dragon'){const b=add(at,u,0),m=add(add(at,u,2.6*s),n,-.6*s),e=add(add(at,u,4.6*s),n,.4*s);C([b.concat([1*s]),m.concat([.7*s]),e.concat([.3*s])],q+'H',g,{pri:3});E(b[0],b[1],.7,.7,G,g,{pri:4});}};
  // boots
  const leg=(fx,g,lift)=>{const q='lg',r=RG(q),f=[fx,GROUND-(lift||0)],kn=ik(hip[0],hip[1]+1,f[0],f[1]-1.5,6.4,6.4,-1),an=[f[0],f[1]-1.5];
    C([[hip[0],hip[1]+1,2.9],[kn[0],kn[1],2.4]],'cloth',g);C([[kn[0],kn[1],2.5],[an[0],an[1],r==='brute'?2.5:2.1]],'lgA',g,{pri:1});
    C([[f[0]-.5,f[1]-1.5,r==='brute'?2.8:2.4],[f[0]+2.6,f[1],r==='brute'?2.1:1.8]],'lgD',g,{k:1,pri:1.5});
    if(ID(q)==='fern'){leaf(add(kn,[-.6,-.8]),1.25,5.6,1.7,'lgX',g,-.08,{pri:2});E(kn[0]+.6,kn[1],1.6,1.4,'lgU',g,{pri:2.5});}
    else if(ID(q)==='ember'){P([add(kn,[-.4,-1.8]),add(kn,[4.2,-1]),add(kn,[.8,1.6])],'lgH',g,{pri:2,k:.5});C([add(kn,[.8,1.6]).concat([.35]),add(an,[1,-1]).concat([.3])],'lgG',g,{pri:3});
      C([add(f,[2.6,-.6]).concat([.7]),add(f,[4.6,-1.6]).concat([.25])],'lgH',g,{pri:3});}
    else if(r==='wyvern'){P([add(kn,[-.6,-1.6]),add(kn,[3.8,-.4]),add(kn,[.6,1.6])],'lgH',g,{pri:2,k:.5});}
    else if(r==='brute'){E(kn[0]+.4,kn[1]+3,3.3,2.2,'lgF',g,{pri:2,bulge:.6});E(kn[0]+.6,kn[1],1.8,1.6,'lgH',g,{pri:2.5});}
    else if(r==='serpent'){P([add(an,[-1,-.5]),add(an,[-5,-4.2]),add(an,[-3.6,-.2]),add(an,[-1,1.2])],'lgM',g,{pri:2,k:.5});E(kn[0]+.5,kn[1],1.8,1.6,'lgU',g,{pri:2});}
    else if(r==='raptor'){C([add(f,[2.2,-.4]).concat([.8]),add(f,[4.8,.3]).concat([.45])],'lgH',g,{pri:3,k:.5});E(kn[0]-1.4,kn[1]-.6,3,1.1,'lgU',g,{pri:2,a:-2.6});}
    else if(r==='crab'){E(kn[0]+.7,kn[1],2.9,2.7,'lgA',g,{pri:2.5,bulge:1});C([add(an,[-2.2,-2]).concat([.6]),add(an,[2.2,-2]).concat([.6])],'lgD',g,{pri:3});}
    else E(kn[0]+.5,kn[1],2,1.7,'lgU',g,{k:.8,pri:1.5});};
  leg(p.fB,'legB',p.liftB);leg(p.fF,'legN',p.liftF);
  // chest: body, front plate, skirt, belt
  { const r=RG('ch');
    C([[hip[0],hip[1],3.6],[chest[0],chest[1],(r==='brute'?5:4.6)+br*.15]],'chA','body');E(chest[0]+.5,chest[1]+1.5,3.4,2.6,'chU','body',{pri:1.2,bulge:.8});
    if(r==='raptor')for(let i=0;i<4;i++)E(hip[0]-3.6+i*2.5,hip[1]+3.6,1.3,3.2,i%2?'chU':'chA','body',{pri:1+i*.1,a:-.25+i*.15});
    else if(r==='crab'){for(let i=0;i<2;i++)C([add(hip,[-4.4,1.2+i*2.4]).concat([1.3]),add(hip,[4.6,1.2+i*2.4]).concat([1.3])],i?'chD':'chA','body',{pri:1+i*.2});}
    else if(r==='serpent')P([add(hip,[-4.4,-1]),add(hip,[4.4,-1]),add(hip,[3.6,6.4]),add(hip,[1,7.6]),add(hip,[-1.6,5])],'chU','body',{k:.6,pri:1});
    else P([add(hip,[-4.4,-1]),add(hip,[4.4,-1]),add(hip,[5,4.2]),add(hip,[1,5.4]),add(hip,[-2,4.4]),add(hip,[-5,3.6])],'chD','body',{k:.6,pri:1});
    C([add(hip,[-4,-1.6]).concat([1.3]),add(hip,[4.4,-1.6]).concat([1.3])],'leather','body',{k:.6,pri:2});E(hip[0]+1,hip[1]-1.6,1.2,1.2,'chH','body',{pri:3,k:.5});
    if(r==='serpent')for(let i=0;i<3;i++)C([add(chest,[-3.6,-1+i*2.6]).concat([.5]),add(chest,[3.8,-.4+i*2.6]).concat([.5])],'chD','body',{pri:1.5});
    // what trails behind: membrane coattails, a fin sash, tail feathers, a starry cape
    if(ID('ch')==='fern'){E(chest[0]-.6,chest[1]-.6,1,1,'chU','body',{pri:3});
      [[-3,-1.4,Math.PI*.58,10,2.2,'chA'],[-1.6,-.6,Math.PI*.52,9,2,'chX'],[-4,0,Math.PI*.66,8.4,1.9,'chD']].forEach(([x,y,a,l,w,m],i)=>leaf(add(chest,[x,y]),a+lag*(.8+i*.3),l,w,m,'cape',.05+i*.02,{pri:i*.1}));}
    else if(ID('ch')==='ember'){E(chest[0]+.8,chest[1]+1,1.9,1.9,'chD','body',{pri:2.5});E(chest[0]+.8,chest[1]+1,1.1+Math.sin(t*6)*.15,1.1,'chG','body',{pri:3.5});
      const sw=lag*2.6;P([add(chest,[-2.4,-2.4]),add(chest,[-4.6,-1]),add(hip,[-9.4+sw,8]),add(hip,[-7.4+sw*.8,10]),add(hip,[-5.8+sw*.7,8.6]),add(hip,[-4+sw*.5,10.4]),add(hip,[-1.6,7])],'chM','cape',{k:.5});
      for(let i=0;i<4;i++){const q=add(hip,[-8.6+i*1.6+sw*(.9-i*.12),9.4-(i%2)*1.4]);E(q[0],q[1],.6+Math.sin(t*9+i)*.2,.6,'chG','cape',{pri:4});}}
    else if(FL('ch').elder){const sw=lag*2;P([add(chest,[-2,-2.4]),add(chest,[-4.6,-1.6]),add(hip,[-9+sw,9]),add(hip,[-4+sw*.6,10.5]),add(hip,[0,6])],'void','cape',{k:.6});
      for(let i=0;i<5;i++){const s=add(hip,[-6+i*1.4+sw*.6+Math.sin(i*2.3),1+((i*3.7)%8)]);E(s[0],s[1],.45,.45,'chG','cape',{pri:4});}}
    else if(r==='wyvern'){const sw=lag*2.4;P([add(hip,[-2.6,-1.6]),add(hip,[-.4,1]),add(hip,[-3+sw*.4,9]),add(hip,[-5+sw*.7,7.4]),add(hip,[-7.4+sw,9.2]),add(hip,[-8.4+sw,4])],'chM','cape',{k:.5});
      C([add(hip,[-2.4,-1]).concat([.6]),add(hip,[-8.2+sw,4]).concat([.4])],'chH','cape',{pri:2});}
    else if(r==='serpent'){const a0=Math.PI*.62+lag*.8;const pts=ENG.chain(hip[0]-3,hip[1]+1,a0,[[3.6,0],[3.6,.25+lag*.6],[3.2,.3+lag]]);C(pts.map((q,i)=>q.concat([[1.8,1.6,1.2,.5][i]])),'chM','cape',{k:1});}
    else if(r==='raptor'){for(let i=0;i<3;i++){const a=Math.PI-.5-i*.28+lag*(1+i*.3),c=add(add(hip,[-3,1+i*.6]),V(a,3.6));E(c[0],c[1],4,1.2,['chA','chU','chD'][i],'cape',{a,pri:i*.1});}}
    else if(r==='brute'){P([add(hip,[-4.6,0]),add(hip,[-1,0]),add(hip,[-1.6,5.6]),add(hip,[-3.8,6.4]),add(hip,[-5.6,4.6])],'chF','cape',{k:.6});}
    C([[chest[0],chest[1],3.4],[neck[0],neck[1],2.2]],'skin','body',{pri:-.5});}
  // helm: face, hair, then the helm itself
  {const f0=hd(.6,.6),h0=hd(-1.6,0);E(f0[0],f0[1],4.4,4.6,'skin','head');E(h0[0],h0[1],3.4,4.3,'hair','head',{pri:.6});}
  { const r=RG('he'),f=FL('he'),dome=[[-4.8,-1],[-3,-5.2],[2,-5.7],[5.2,-2.5],[5,-.4],[2,.2],[-4.8,.8]];
    const domeP=(pts,m)=>P(pts.map(([x,y])=>hd(x,y)),m,'helm',{k:.6});
    if(ID('he')==='fern'){domeP(dome,'heA');C([hd(-4.4,-1.4).concat([.8]),hd(5,-2.4).concat([.8])],'heU','helm',{pri:1});
      // three fern fronds sweep back from the crown and sway
      [[-1,-5.2,Math.PI+.55,8,1.7,'heX'],[-2.6,-4.4,Math.PI+.25,7,1.5,'heA'],[-3.6,-2.6,Math.PI-.1,5.6,1.3,'heU']].forEach(([x,y,a,l,w,m],i)=>leaf(hd(x,y),a+ha+lag*(1+i*.4),l,w,m,'crest',-.12-i*.03,{pri:i*.1}));
      leaf(hd(1.6,-5.4),-Math.PI/2-.35+ha,3.4,1,'heX','crest',-.15,{pri:1});}
    else if(ID('he')==='ember'){domeP([[-4.8,-1],[-3,-5.4],[2,-6],[5.6,-2.8],[5.4,-.6],[2,-.4],[-4.8,1]],'heA');C([hd(-3,-2.4).concat([.9]),hd(5.6,-1.8).concat([.9])],'heD','helm',{pri:1});
      C([hd(1.4,-2.4).concat([.5]),hd(5,-1.7).concat([.45])],'heG','helm',{pri:4});
      // great horns curl up and forward, a crest of live flame behind
      C([hd(-.6,-5.4).concat([1.7]),hd(-1.4,-8.6).concat([1.25]),hd(.8,-11).concat([.75]),hd(3.4,-11.2).concat([.3])],'heH','crest');
      C([hd(-3,-4.2).concat([1.3]),hd(-4.6,-7).concat([.9]),hd(-3.6,-9).concat([.35])],'heH','crest',{pri:-.2});
      for(let i=0;i<3;i++)flame(hd(-4.4+i*.5,-1.6+i*1.5),Math.PI+.15+i*.3+ha+lag,4.6-i*.7,1.25,'heG','crest',i*1.7);}
    else if(r==='leather'){domeP(dome,'heA');C([hd(4.6,-1.4).concat([1]),hd(5,1.4).concat([.8])],'heA','helm');
      const pl0=hd(-3.2,-4.6),pl1=add(pl0,V(Math.PI+.35+lag,3.5)),pl2=add(pl1,V(Math.PI+.7+lag*1.6,3.2));C([[pl0[0],pl0[1],1.5],[pl1[0],pl1[1],1.2],[pl2[0],pl2[1],.6]],'heU','helm');}
    else if(r==='wyvern'){domeP(dome,'heA');C([hd(-2,-3.8).concat([1.1]),hd(5.6,-2.3).concat([.9])],'heD','helm',{pri:1});
      C([hd(-1.4,-4.6).concat([1.5]),hd(-4.6,-6.6).concat([1.1]),hd(-7.8,-6.4).concat([.5])],'heH','crest');C([hd(-3.6,-3).concat([1]),hd(-6.6,-3.6).concat([.4])],'heH','crest');
      if(f.elder)for(let i=0;i<5;i++){const b=hd(-2.6+i*1.7,-5.2-Math.sin(i/4*Math.PI)*.8),e=add(b,V(-Math.PI/2+(i-2)*.28,2.4+(i===2?1.4:0)));C([b.concat([.8]),e.concat([.25])],'heG','crest',{pri:3});}
      else accent('he',hd(0,-5.4),-Math.PI/2-.5,'crest',.9);}
    else if(r==='brute'){E(head[0]-3.4,head[1]+1,3.8,5,'heF','mane',{bulge:.8});domeP([[-5,-.6],[-3.4,-5.6],[2,-6.2],[5.4,-3.2],[5.6,-1.6],[2,-2],[-4.6,1.4]],'heD');
      if(f.tusk){C([hd(4.4,4.2).concat([1.1]),hd(6.8,3.6).concat([.8]),hd(7.8,1.2).concat([.35])],'heH','crest');}
      else C([hd(2.8,-5).concat([1.5]),hd(5.2,-7.6).concat([.4])],'heH','crest');
      accent('he',hd(-1.6,-5.8),-Math.PI/2-.9,'crest',.9);}
    else if(r==='serpent'){domeP([[-7.6,-1.4],[-3,-5.2],[2,-5.7],[5.2,-2.5],[5,-.4],[2,.2],[-4.8,.8]],'heA');
      P([hd(-.6,-5.4),hd(.8,-8),hd(-2,-6.8),hd(-3.4,-8.8),hd(-5,-6.4),hd(-7,-7.4),hd(-7.6,-2)],'heM','crest',{k:.4});P([hd(-2,.4),hd(-5.4,3.6),hd(-1,2.4)],'heM','crest',{k:.4});}
    else if(r==='raptor'){domeP(dome,'heA');P([hd(.6,-5.4),hd(5.4,-3.8),hd(8.6,-1.2),hd(5.2,-.8),hd(1.6,-2.4)],'heH','crest',{k:.4});
      for(let i=0;i<3;i++){const b=hd(-2-i*.6,-4.8+i*.8),m=add(b,V(Math.PI+.5+i*.2+lag*(1+i*.4),3)),e=add(m,V(Math.PI+.75+i*.25+lag*(1.6+i*.5),3));C([b.concat([1.2]),m.concat([1]),e.concat([.45])],['heU','heX','heA'][i],'crest',{pri:i*.1});}}
    else if(r==='crab'){domeP([[-5.6,-.4],[-4,-5.6],[1.6,-6.6],[5.6,-3.2],[6,-.6],[2,-1],[-5.6,1.6]],'heA');C([hd(-5.6,-.6).concat([1]),hd(6,-1.9).concat([.9])],'heD','helm',{pri:1});
      for(const s of[-1,1]){const b=hd(1.6+s*1.1,-5.6),m=add(b,V(-1.15+s*.2+lag*.6,3.6)),e=add(m,V(-.6+s*.15+lag*1.3,3.6));C([b.concat([.7]),m.concat([.45]),e.concat([.25])],'heH','crest');}
      E(head[0]+1.6,head[1]-5.8,1.3,1.2,'heD','crest',{pri:2});}
    if(r!=='leather'&&(f.hot||f.glow)&&!f.elder&&ID('he')!=='ember')C([hd(1.4,-2.6).concat([.45]),hd(4.6,-1.8).concat([.4])],'heG','helm',{pri:4});
    {const fc=hd(1.6,1.6);S.push({t:'E',x:fc[0],y:fc[1],rx:3.8,ry:3.6,a:ha,cut:1,g:'crest'});}}
  // pauldron: the shoulder says the most about a set
  { const r=RG('ch'),c=add(chest,[-.4,-1.6]);
    if(ID('ch')==='fern'){const sp=leaf(add(c,[-3,-1.8]),-.15,6,2,'chX','paul',.22);C(sp.slice(0,5).map((q,i)=>q.concat([.45-i*.05])),'chU','paul',{pri:2});E(c[0]-2.6,c[1]-1,1.6,1.4,'chA','paul',{pri:1});}
    else if(ID('ch')==='ember'){E(c[0]-.2,c[1]-.6,4,3,'chD','paul',{a:-.2,bulge:.8});for(let i=0;i<3;i++){const b=add(c,[-2.6+i*1.9,-2.2+Math.abs(i-1)*.4]);C([b.concat([1]),add(b,V(-Math.PI/2-.6+i*.15,3.4-Math.abs(i-1)*.8)).concat([.25])],'chH','paul',{pri:2});}
      C([add(c,[-2.6,.6]).concat([.4]),add(c,[0,-.2]).concat([.35]),add(c,[2.2,.8]).concat([.3])],'chG','paul',{pri:4});}
    else if(r==='leather')E(c[0],c[1],3.5,2.5,'chU','paul',{a:-.2});
    else if(r==='wyvern'){P([add(c,[-3.8,-1.2]),add(c,[.6,-3.2]),add(c,[3.8,-1.4]),add(c,[1.6,1.8]),add(c,[-2.6,2])],'chA','paul',{k:.6});C([add(c,[-2.2,-2]).concat([.9]),add(c,[-4.8,-4.4]).concat([.35])],'chH','paul',{pri:2});
      accent('ch',add(c,[-2.6,-1.4]),Math.PI+.7,'paul',.7);}
    else if(r==='brute'){C([add(chest,[-4.2,0]).concat([3.2]),add(chest,[1.4,-.8]).concat([2.6])],'chF','paul',{bulge:.8});E(c[0]+1.4,c[1]+.2,1.3,1.3,'chH','paul',{pri:3});
      accent('ch',add(c,[-3.4,-1.8]),-Math.PI/2-1,'paul',.7);}
    else if(r==='serpent'){E(c[0],c[1]-.4,3.6,2.3,'chA','paul',{a:-.25});E(c[0]+.4,c[1]+1.8,3,1.6,'chD','paul',{a:-.2,pri:1});accent('ch',add(c,[-2.6,-.6]),Math.PI+.4,'paul',.7);}
    else if(r==='raptor'){for(let i=0;i<3;i++)E(c[0]-1.2+i*1.5,c[1]+.6+i*.5,1.4,3.2,i%2?'chU':'chA','paul',{a:.45,pri:i*.2});accent('ch',add(c,[-2,-1.4]),Math.PI+.6,'paul',.7);}
    else if(r==='crab'){E(c[0]-.2,c[1]-.8,4.4,3.4,'chA','paul',{a:-.2,bulge:1});C([add(c,[-4,1.6]).concat([.8]),add(c,[3.6,1]).concat([.8])],'chD','paul',{pri:2});
      C([add(c,[-1,-3.6]).concat([.9]),add(c,[-2.6,-6]).concat([.3])],'chH','paul',{pri:2});accent('ch',add(c,[-3,-.6]),Math.PI+.5,'paul',.7);}
    if(FL('ch').elder||FL('ch').glow)E(c[0],c[1]-.6,.9,.9,'chG','paul',{pri:5});
    const fc=hd(1.4,1.2);S.push({t:'E',x:fc[0],y:fc[1],rx:4.8,ry:5.4,a:ha,cut:1,g:'paul'});}
  // arms reach for the weapon: the front hand holds it, the back hand helps or holds the shield
  const shF=add(chest,[1,-1.5]),shB=add(chest,[-2,-1.2]);
  // potion: the weapon swings onto the back (sheath), then the hand takes a bottle from the belt to the mouth (bottle). Both move, nothing pops.
  const sh=p.sheath||0,bt=p.bottle||0,d2=p.drink2||0,lp=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k],held=add(shF,V(p.wa+(wt==='ln'?0:1.0)*(wt==='db'?.3:1),wt==='ln'?6:4.6+(p.reach||0)));
  const backAt=add(chest,wt==='db'?[-3,0]:[-3,-4]),backA=wt==='ln'?-4.3:wt==='db'?-4.1:-3.95,wpnAt=lp(held,backAt,sh),bottleAt=lp(add(hip,[4,-1]),add(head,[7.4,3.2-d2*1.4]),bt);   // held out in front of the chin so the arm never crosses the face
  const wa=p.wa+(backA-p.wa)*sh,grip=bt>0?bottleAt:p.sharpen?null:wpnAt;
  const arm=(sh,hand,g)=>{const r=RG('ar'),el=ik(sh[0],sh[1],hand[0],hand[1],4.2,4.2,1),fa=Math.atan2(hand[1]-el[1],hand[0]-el[0]),mid=[(el[0]+hand[0])/2,(el[1]+hand[1])/2];
    C([[sh[0],sh[1],2],[el[0],el[1],1.8]],'cloth',g);C([[el[0],el[1],1.9],[hand[0],hand[1],1.7]],'arA',g,{pri:1});E(hand[0],hand[1],r==='brute'?2.2:1.8,r==='brute'?2.2:1.8,'arD',g,{pri:2});
    if(ID('ar')==='fern'){leaf(add(hand,V(fa,-1)),fa+Math.PI+.35,5.4,1.5,'arX',g,-.1,{pri:2.5});C([add(el,V(fa,.8)).concat([.45]),add(hand,V(fa,-1.6)).concat([.45])],'arU',g,{pri:3});}
    else if(ID('ar')==='ember'){E(hand[0],hand[1],2.4,2.4,'arH',g,{pri:3});for(const s of[-1,0,1])C([add(hand,V(fa+s*.8,1.6)).concat([.6]),add(hand,V(fa+s*.8,3.4)).concat([.2])],'arH',g,{pri:3.5});
      C([add(el,V(fa,1)).concat([.35]),add(hand,V(fa,-1.8)).concat([.3])],'arG',g,{pri:4});}
    else if(r==='wyvern')for(const s of[-1,1])P([add(hand,V(fa+s*.7,1.2)),add(hand,V(fa+s*.25,3.2)),add(hand,V(fa,1.2))],'arH',g,{pri:3,k:.3});
    else if(r==='brute')E(mid[0]-(hand[0]-el[0])*.15,mid[1]-(hand[1]-el[1])*.15,2.7,2.7,'arF',g,{pri:2.5,bulge:.6});
    else if(r==='serpent')P([add(el,V(fa,.6)),add(add(el,V(fa,1.5)),V(fa-Math.PI/2,3.4)),add(hand,V(fa,-1.4))],'arM',g,{pri:2,k:.4});
    else if(r==='raptor'){E(el[0]-Math.cos(fa)*1.6,el[1]-Math.sin(fa)*1.6,2.8,1,'arU',g,{a:fa,pri:2.5});C([add(hand,V(fa,1)).concat([.6]),add(hand,V(fa+.5,2.8)).concat([.3])],'arH',g,{pri:3});}
    else if(r==='crab'){E(mid[0],mid[1],3,2.3,'arA',g,{a:fa,pri:2.5,bulge:1});C([add(el,V(fa,.4)).concat([.5]),add(hand,V(fa,-1)).concat([.5])],'arD',g,{pri:3});}};
  const gripF=grip||(p.sharpen?add(add(hip,[-7,2.5]),V(-.08,wt==='gs'?6+p.stroke*12:wt==='hm'?10+p.stroke*4:3+p.stroke*7),1).map((v,i)=>v+(i?-3:0)):wpnAt);
  const handB=bt>0||sh>.3?add(shB,[0,6]):wt==='ln'?add(shB,p.guard?[6,2]:[-1,6]):wt==='db'?add(shB,V(wa+.9,5.5)):wt==='gs'||wt==='hm'?add(gripF,V(wa,-2.4)):add(shB,[0,6]);
  arm(shB,handB,'armB');
  const behind=sh>.35||(wa<-1.35&&wa>-3.2),wg=behind?'wpnB':'wpn';
  if(bt>0){weapon(S,wt,wpnAt,wa,'wpnB',gear,0);const tilt=-d2*1.85,u=V(tilt-Math.PI/2,1),b0=add(bottleAt,u,-2.4),neckP=add(b0,u,4.2),top=add(neckP,u,1.6);
    S.push({t:'E',x:b0[0],y:b0[1],rx:3.2,ry:3.6,m:'glass',g:'pot',a:tilt});S.push({t:'E',x:b0[0]-u[0]*.9,y:b0[1]-u[1]*.9,rx:2.3,ry:2.3,m:'potion',g:'potL',a:tilt});
    S.push({t:'C',p:[b0.concat([1.3]),neckP.concat([1.1])],m:'glass',g:'pot'});S.push({t:'C',p:[neckP.concat([1.4]),top.concat([1.3])],m:'cork',g:'potL'});
    if(d2>.6)for(let i=0;i<2;i++){const q=add(add(head,[3,2.4]),[i*.8,1+i*1.2]);E(q[0],q[1],.5,.5,'potion','wpn',{pri:3});}}
  else if(p.sharpen){const bl=add(hip,[-7,2.5]);weapon(S,wt,bl,-.08,'wpn',gear,0);const along=wt==='gs'?6+p.stroke*12:wt==='hm'?10+p.stroke*4:3+p.stroke*7,st=add(bl,V(-.08,along));
    S.push({t:'P',p:[add(st,[-2.6,-2.6]),add(st,[2.6,-2.6]),add(st,[2.6,-.6]),add(st,[-2.6,-.6])],m:'stone',g:'wpn',pri:4,k:.4});
    if(Math.abs(p.stroke-.5)>.35)for(let i=0;i<3;i++)E(st[0]+2+i*1.5,st[1]-2-i*1.2,.6,.6,'spark','wpn',{pri:5});}
  else weapon(S,wt,wpnAt,wa,wg,gear,p.glow||0);
  if(wt==='db'&&!p.sharpen)weapon(S,'db',sh>.3?add(backAt,[2,1]):handB,sh>.3?backA-.3:wa+.9,sh>.3?'wpnB':'armB',gear,0);
  if(wt==='ln')shield(S,handB,p.guard?'shield':'armB',gear);
  arm(shF,gripF,'armN');
  {const fc=hd(1.2,.8);S.push({t:'E',x:fc[0],y:fc[1],rx:4.2,ry:4.4,a:ha,cut:1,g:'armN'});}
  for(const q of S)if(q.pri>=2.5&&!q.cut)q.top=1;   // small details colour only themselves
  const eP=hd(2.5,.8),ex=Math.round(eP[0]),ey=Math.round(eP[1]),blink=(t%3.4)<.1;
  return{S,extra:g=>{g.fillStyle='#1a1006';g.fillRect(ex,ey+(blink?1:0),1,blink?1:2);}};}
function weapon(S,wt,at,a,g,gear,glow){if(gear.wpn&&typeof WPN!=='undefined'&&WPN.SPEC[gear.wpn]){WPN.draw(S,wt,at,a,g,gear.wpn,glow,0);return;}const C=(pts,m,o)=>S.push(Object.assign({t:'C',p:pts,m,g},o||{})),P=(pts,m,o)=>S.push(Object.assign({t:'P',p:pts,m,g},o||{})),E=(x,y,rx,ry,m,o)=>S.push(Object.assign({t:'E',x,y,rx,ry,m,g},o||{}));
  const u=V(a,1),n=V(a+Math.PI/2,1),at2=add(at,u,-2);
  const blade=(len,w0,w1)=>{const b0=add(at,u,2.4),tip=add(at,u,len+2.4);C([at2.concat([1]),b0.concat([1])],'wood');C([add(b0,n,w0+1.6).concat([.9]),add(b0,n,-w0-1.6).concat([.9])],'trim');
    P([add(b0,n,w0),add(add(tip,u,-3),n,w1*.55),tip,add(add(tip,u,-3),n,-w1*.45),add(b0,n,-w0*.8)],'metal',{k:.4});C([add(add(b0,u,1),n,.2).concat([.5]),add(add(tip,u,-3),n,.2).concat([.4])],'edge');};
  if(wt==='gs')blade(21,2.6,4.6);else if(wt==='db')blade(9.5,1.9,2.8);
  else if(wt==='hm'){C([at2.concat([1.1]),add(at,u,15).concat([1.1])],'wood');const hd=add(at,u,16.5);P([add(add(hd,n,5),u,-3),add(add(hd,n,5),u,3),add(add(hd,n,-6),u,3),add(add(hd,n,-6),u,-3)],'metal',{k:.6});C([add(add(hd,n,5.4),u,0).concat([.9]),add(add(hd,n,-6.4),u,0).concat([.9])],'trim');C([add(add(hd,n,4.6),u,3.2).concat([.6]),add(add(hd,n,-5.6),u,3.2).concat([.6])],'edge');}
  else if(wt==='ln'){C([add(at,u,-6).concat([1.2]),add(at,u,20).concat([1])],'wood');P([add(add(at,u,19),n,2.4),add(at,u,29),add(add(at,u,19),n,-2.4)],'metal',{k:.4});C([add(at,u,20).concat([.5]),add(at,u,27.5).concat([.4])],'edge');E(at[0]+u[0]*19,at[1]+u[1]*19,1.6,1.6,'trim');}
  if(glow){const tp=add(at,u,wt==='gs'?20:wt==='hm'?16:9);for(let i=0;i<glow;i++)E(tp[0]+Math.cos(i*2.1)*3,tp[1]+Math.sin(i*2.1)*3,1.1,1.1,'spark');}}
function shield(S,at,g,gear){if(gear&&gear.wpn&&typeof WPN!=='undefined'&&WPN.SPEC[gear.wpn]){WPN.shield(S,at,g,gear.wpn);return;}const P=(pts,m,o)=>S.push(Object.assign({t:'P',p:pts,m,g},o||{})),E=(x,y,rx,ry,m,o)=>S.push(Object.assign({t:'E',x,y,rx,ry,m,g},o||{}));const[x,y]=at;
  P([[x-4,y-6],[x+4,y-6],[x+5,y+1],[x,y+7],[x-5,y+1]],'trim',{k:.6});P([[x-2.6,y-4],[x+2.6,y-4],[x+3.2,y+.6],[x,y+4.6],[x-3.2,y+.6]],'armor',{k:.5,pri:1});E(x,y,1.3,1.3,'metal',{pri:2});}
function rollBuild(p,wt,gear,t){const S=[],c=[p.hx+2,45],R=(x,y)=>{const[a,b]=ENG.rot(x,y,p.roll);return[c[0]+a,c[1]+b];};
  const E=(x,y,rx,ry,m,g)=>{const[a,b]=R(x,y);S.push({t:'E',x:a,y:b,rx,ry,m,g,a:p.roll});},C=(pts,m,g)=>S.push({t:'C',p:pts.map(([x,y,r])=>R(x,y).concat([r])),m,g});
  E(0,0,6.6,6,'armor','body');E(-4,-3,4,4,'helm','helm');E(-2.6,-1.4,2.4,2.4,'skin','head');C([[2,3,2.8],[5,-1,2.3],[3,-4,2]],'cloth','legN');C([[3,-4,2.2],[0,-6,1.7]],'leather','legN');C([[-6,-6,1.2],[-9,-7.5,.7]],'plume','helm');C([[-7,4,1],[8,-5,1]],'metal','wpnB');
  return{S,extra:null};}
// element accent colours
const ELC={nature:'#8ad86a',fire:'#ff9a2e',ice:'#bfeaff',thunder:'#ffe14d',water:'#7fd6ff',earth:'#d8b070',dragon:'#e0508a'};
function mats(gear){const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn,out={};
  for(const q of['he','ch','ar','lg']){const L=gear[q],M=ENG.materials({b:L.b,u:L.u,h:L.h,d:L.d}),plain=Object.assign({},M.body,{tex:0}),ec=ELC[L.el]||L.u;
    out[q+'A']=L.rig==='wyvern'||L.rig==='serpent'?M.body:L.rig==='crab'?M.shell:plain;out[q+'U']=L.rig==='leather'?one(L.u):M.belly;out[q+'H']=M.horn;out[q+'D']=M.dark;out[q+'M']=M.memb;
    out[q+'F']=ENG.materials({b:ENG.mix(L.b,L.u,.25),u:L.u,h:L.h,d:L.d}).hide;out[q+'X']=one(ec);out[q+'G']=Object.assign(one(L.f&&L.f.elder?'#f0e8ff':ec),{flat:.95});
    if(L.rig==='leather'&&q==='he'){out.heA=one(L.helm);out.heU=one(L.plume);}
    if(gear.wpn&&typeof WPN!=='undefined'&&LOOKS[gear.wpn])Object.assign(out,WPN.mats(LOOKS[gear.wpn]));
    // signature sets: Fernwing is soft leaf and hide, Emberwing is charcoal plate with red horns and glowing seams
    if(L.id==='fern'){out[q+'A']=plain;out[q+'X']=one('#5fae4e');out[q+'U']=one(L.u);}
    if(L.id==='ember'){out[q+'A']=one('#3e3440');out[q+'H']=one(L.b);out[q+'U']=M.dark;out[q+'D']=one('#2a2230');out[q+'G']=Object.assign(one('#ffab3a'),{flat:.95});}}
  const cl=ENG.mix(gear.ch.d,'#3a3448',.55);
  return Object.assign(out,{body:out.chA,armor:out.chA,trim:out.chU,helm:out.heA,plume:out.heU,cloth:one(cl),leather:one('#6b4a2e'),skin:Object.assign(one('#f0c098'),{r:['#6a4a40','#b08068','#dcae8e','#f2cfae','#f9e0c6','#fff3e6'],line0:'#3a2622',line1:'#8a6050'}),hair:one(gear.hair||'#5a3a24'),
    glass:Object.assign(one('#cfe8f0'),{dk:.4}),cork:one('#9a6a3a'),metal:one('#d4dcea'),edge:Object.assign(one(gear.edge||'#ffffff'),{flat:.9}),wood:one('#7a5232'),potion:one('#e2483d'),stone:one('#8a93b0'),
    spark:Object.assign(one(gear.edge||'#ffe14d'),{flat:.95}),void:Object.assign(one('#14102e'),{flat:-.4})});}
// every monster's set, from the game's roster: id|name|short|rig|biome|elem|…|cols|flags
const ROSTER=`
fern|FERNWING|FERN|wyvern|0|nature|nature|fire|sleep|poison||bite,sweep,dbl,spit,spit2,dive|3f9e8a,d9c88e,e8e2cc,2c7366|
quill|QUILLBEAK|QUILL|raptor|0|nature|sleep|fire|poison|bleed||peck,bite,sweep,spit,spit2,pounce|6a9a4a,e8dca0,e0a03a,3f6a34|
mud|MUDCLAW|MUD|crab|5|water|water|thunder|para|mud|shell|dbl,gore,sweep,spit,stomp,rush|7a6a4a,c8b890,e8e2cc,4a3f2c|
dust|DUSTSPUR|DUST|raptor|2|earth|para|water|sleep|numb||peck,bite,sweep,spit,clap,pounce|c9a05a,f2dca0,6a4a2c,8a6a34|
tusk|TUSKHIDE|TUSK|brute|2|earth|earth|nature|poison||armor|gore,gore2,rush,stomp,rock,leap|a8794a,e0c89a,f0ead8,7a5434|tusk
bog|BOGCROWN|BOG|serpent|5|water|poison|thunder|blast|poison|burrow|bite,slam,sweep,breath,spit2,erupt|4a7a5a,c8d8a0,e8e2cc,2c4a3a|
ember|EMBERWING|EMBER|wyvern|1|fire|fire|water|para|burn||bite,slam,breath,volley,dbl,blastdive|b8402e,f0b070,4a3c48,6a1f24|big,club,hot
thorn|THORNBACK|THORN|brute|0|nature|nature|fire|blast|bleed|regen|gore,rush,stomp,spit,gore2,leap|5a8a4a,d9c88e,e8e2cc,34582c|
shell|SHELLSNAP|SHELL|crab|6|water|sleep|thunder|poison|wet|shell|dbl,sweep,gore,volley,spin,rush|4a8ab8,e8dcc0,f0ead8,2a5a80|
gust|GUSTHAWK|GUST|raptor|4|thunder|thunder|ice|sleep||frenzy|peck,bite,clap,sky,sweep,pounce|8a8ad0,e8e8f8,ffe14d,4a4a90|
eel|SANDMAW|SAND|serpent|2|earth|earth|water|para|mud|burrow|bite,sweep,slam,spit,rock,erupt|c9a05a,f2e2b0,8a6a34,8a6a34|
cinder|CINDERHOOF|CINDER|brute|1|fire|blast|water|sleep|burn|armor|gore,gore2,rush,breath,rock,leap|5a3a3a,ff9a4d,2a1a1e,3a2426|hot
rime|RIMEWING|RIME|wyvern|3|ice|ice|fire|blast|freeze||bite,sweep,dbl,breath,sky,dive|9fd0ea,f4fbff,e8f8ff,5a98c0|big
sting|VENOMSTING|STING|crab|5|nature|poison|fire|para|poison|frenzy|dbl,slam,gore,spit2,sweep,rush|7a4a8a,d8c0e0,c8f08a,4a2c5a|
plume|PLUMECREST|PLUME|raptor|6|water|water|thunder|blast|wet||peck,sweep,bite,volley,clap,pounce|3a9ac8,f0f0e0,ff7aa8,2a6a90|
frost|FROSTMAW|FROST|brute|3|ice|ice|fire|blast|freeze||dbl,tri,rush,breath,sky,leap|d2e6f2,f4fbff,6cc4f0,9fbcd0|coldeye
tide|TIDECOIL|TIDE|serpent|6|water|water|thunder|poison|wet|burrow|bite,slam,spin,breath,volley,erupt|3a7ac8,bfe0ff,f0ead8,2a4a90|
volt|VOLTWING|VOLT|wyvern|4|thunder|para|ice|sleep|numb|frenzy|bite,dbl,sweep,spit2,sky,hover|d8c83a,f8f4c0,4a50a8,8a7a1a|club
magma|MAGMASTRIDER|MAGMA|crab|1|fire|fire|water|sleep|burn|shell|gore,dbl,stomp,volley,spin,rush|3a2a2e,ff7a2e,ffd34d,221a1e|hot
dread|DREADBEAK|DREAD|raptor|7|dragon|dragon|thunder|blast|blight||peck,tri,sweep,breath,clap,pounce|4a2a4a,c8a0b8,e0508a,2a1a2e|
icehide|ICETUSK|ICE|brute|3|ice|sleep|fire|para|freeze|armor|gore2,rush,stomp,breath,sky,leap|8ab8d8,e8f4fa,ffffff,5a88a8|tusk
mire|MIREFANG|MIRE|serpent|5|nature|nature|fire|blast|stench|regen|bite,sweep,slam,spit2,breath,rush|5a5a3a,b8c890,c8f08a,3a3a22|
obsid|TRIMAW|OBSID|wyvern|1|fire|blast|dragon|poison|burn|frenzy|tri,slam,spin,volley,breath,blastdive|2e2a3a,ff7a2e,8a8aa0,1a1826|big,club,hot
cryst|CRYSTALBACK|CRYST|crab|7|earth|earth|ice|blast|bleed|shell|dbl,gore,spin,spit,stomp,rush|8a7ab8,e0d8f0,bfeaff,5a4a88|
temp|TEMPESTBEAK|TEMP|raptor|4|thunder|thunder|earth|sleep|numb|frenzy|peck,tri,spit,sky,clap,pounce|3a3f7a,c8c8f0,ffe14d,23265a|
abyss|ABYSSCOIL|ABYSS|serpent|6|water|water|thunder|para|wet|burrow|dbl,spin,slam,breath,spit2,erupt|1e2a5a,7fd6ff,bfeaff,12183a|
ruin|RUINHORN|RUIN|brute|7|dragon|dragon|ice|poison|blight|armor|gore,gore2,rush,breath,sky,leap|4a3a4a,c8a0b8,e0508a,2e222e|
storm|STORMPEARL|STORM|wyvern|4|thunder|thunder|ice|sleep||charge|bite,sweep,clap,sky,hover,skydive,dbl|4a50a8,c8c8f0,ffe14d,262a66|big,club
dusk|DUSKHORN|DUSK|crab|7|dragon|para|fire|blast|stench|shell|dbl,slam,spin,spit2,volley,rush|3a2a4a,b890c8,e0508a,221a2e|
aurora|AURORAWING|AURORA|wyvern|3|ice|ice|fire|para|freeze|regen|bite,sweep,dbl,breath,sky,hover|6ad8c0,f0f8ff,b06ad8,3a9a98|big
gloom|GLOOMFANG|GLOOM|brute|7|dragon|dragon|ice|blast|blight|armor|gore2,rush,stomp,breath,sky,leap,rock|2a2230,e0508a,ffb0d0,18141c|tusk,glow
reaver|TIDEREAVER|REAVER|serpent|6|water|water|dragon|sleep|wet|burrow|bite,spin,slam,breath,volley,erupt,rush|123a5a,4cc9ff,e8f8ff,0a2238|glow
pyre|PYRECLAW|PYRE|crab|1|fire|blast|water|para|burn|shell|dbl,gore,spin,volley,stomp,rush,blastdive|5a1a14,ffd34d,ff9a2e,2e0e0c|glow,hot
render|SKYRENDER|RENDER|wyvern|4|thunder|thunder|ice|poison|numb|charge|dbl,tri,clap,sky,hover,skydive,spit2|e8e8f8,ffe14d,4a50a8,a8a8d8|big,club,glow
star|THE HOLLOW STAR|STAR|wyvern|8|dragon|dragon|ice|blast|blight|charge|dbl,slam,starfall,beam,comet,nova,eclipse|1a1630,8a7ad8,f0e8ff,0e0c1e|big,elder,glow
`.trim().split('\n').map(r=>r.split('|'));
const LOOKS={leather:{id:'leather',rig:'leather',el:null,b:'#8a5a3a',u:'#c8b07a',h:'#e8e2cc',d:'#5a3a24',helm:'#a8b0c0',plume:'#e2483d',f:{}}},NAMES={leather:'LEATHER'};
ROSTER.forEach(r=>{const c=r[12].split(',').map(x=>'#'+x),f={};(r[13]||'').split(',').forEach(k=>{if(k)f[k]=1;});LOOKS[r[0]]={id:r[0],rig:r[3],el:r[5],b:c[0],u:c[1],h:c[2],d:c[3],f};NAMES[r[0]]=r[2];});
// a gear: one look per piece; mix pieces freely
const gearOf=(he,ch,ar,lg,wp)=>({wpn:wp||null,name:he===ch&&ch===ar&&ar===lg?NAMES[he]+' SET':'MIXED',he:LOOKS[he],ch:LOOKS[ch||he],ar:LOOKS[ar||he],lg:LOOKS[lg||he],edge:ELC[LOOKS[ch||he].el]||'#ffffff'});
const GEARS={};for(const id in LOOKS)GEARS[id]=gearOf(id,id,id,id,typeof WPN!=='undefined'&&WPN.SPEC[id]?id:null);
// clips: keyframes eased between; feet stay put unless a step moves them
function clips(wt){const r=REST[wt],base={hx:29.0,hy:39,lean:0,crouch:0,fB:21,fF:33,wa:r,reach:0,hT:0,glow:0,wb:0};
  const k=(t,o)=>[t,Object.assign({},base,o)];
  const combo=wt==='ln'?[k(0,{}),k(.18,{lean:-1,hx:24.0,wa:-.25,reach:-2}),k(.28,{lean:2,hx:28.0,fF:32,wa:-.08,reach:4}),k(.42,{lean:1,hx:27.0,fF:32,wa:-.15}),k(.55,{lean:-1,hx:25.0,wa:-.35,reach:-2,fF:30}),k(.65,{lean:2.6,hx:29.0,fF:34,wa:-.02,reach:5}),k(1,{})]
    :wt==='db'?[k(0,{}),k(.08,{wa:-1.8,lean:.5}),k(.16,{wa:.7,lean:2,hx:27.0,fF:31}),k(.24,{wa:-1.9,lean:1.8,hx:27.0,fF:31}),k(.32,{wa:.8,lean:2.2,hx:28.0,fF:32}),k(.42,{wa:-2.4,lean:-.5,hx:26.0,crouch:.4}),k(.52,{wa:1,lean:2.8,hx:29.0,fF:33}),k(.8,{})]
    :[k(0,{}),k(.25,{wa:-2.75,lean:-1.2,crouch:.4,hx:24.0,wb:.4}),k(.34,{wa:-.4,lean:2.2,hx:28.0,fF:32,wb:-.2}),k(.42,{wa:.6,lean:2.6,hx:28.5,fF:32,crouch:.2}),k(.6,{wa:.5,lean:1.4,hx:27.5,fF:32}),k(.72,{wa:-2.2,lean:1.2,hx:27.0,fF:31,wb:.3}),k(.82,{wa:-2.9,lean:-1,crouch:.5,hx:25.0,fF:30}),k(.92,{wa:.5,lean:3,hx:29.0,fF:34,crouch:.3,wb:-.4}),k(1.25,{})];
  const skill=wt==='gs'||wt==='hm'?[k(0,{}),k(.25,{wa:-2.7,lean:-1.3,crouch:.5,glow:1}),k(.55,{wa:-2.72,lean:-1.3,crouch:.55,glow:2}),k(.85,{wa:-2.74,lean:-1.35,crouch:.6,glow:3}),k(.95,{wa:.7,lean:3,hx:29.0,fF:34,glow:3}),k(1.3,{})]
    :wt==='ln'?[k(0,{}),k(.2,{guard:1,lean:-.5,wa:-.12}),k(.9,{guard:1,lean:-.6,wa:-.12}),k(1.1,{})]:[k(0,{}),k(.06,{wa:-1.8,lean:2,hx:27.0}),k(.12,{wa:.7,lean:2.4,hx:27.0}),k(.18,{wa:-2,lean:2.2,hx:28.0}),k(.24,{wa:.8,lean:2.6,hx:28.0}),k(.3,{wa:-1.6,lean:2,hx:29.0}),k(.36,{wa:.6,lean:2.2,hx:29.0}),k(.6,{})];
  return{IDLE:{len:2.4,loop:1,keys:[k(0,{}),k(1.2,{hy:39.4,wa:r+.04}),k(2.4,{})]},COMBO:{len:combo[combo.length-1][0],keys:combo},SKILL:{len:skill[skill.length-1][0],keys:skill},
    ROLL:{len:.45,keys:[k(0,{roll:0,hx:25.0}),k(.45,{roll:Math.PI*2,hx:17.0})]},HURT:{len:.5,keys:[k(0,{}),k(.06,{lean:-2.4,hx:22.0,hT:-1,wa:r+.3,wb:.6}),k(.5,{})]},
    POTION:{len:1.9,keys:[k(0,{}),k(.28,{sheath:1,lean:-.2}),k(.42,{sheath:1,bottle:.02}),k(.66,{sheath:1,bottle:1,hT:-.4,lean:-.3}),k(.82,{sheath:1,bottle:1,drink2:1,hT:-1.6,lean:-.8}),k(1.2,{sheath:1,bottle:1,drink2:1,hT:-1.7,lean:-.9}),k(1.36,{sheath:1,bottle:1,drink2:0,hT:-.3}),k(1.56,{sheath:1,bottle:.02}),k(1.6,{sheath:1}),k(1.9,{})]},
    SHARPEN:{len:.6,loop:1,keys:[k(0,{sharpen:1,crouch:1,lean:1.4,stroke:0}),k(.3,{sharpen:1,crouch:1,lean:1.7,stroke:1}),k(.6,{sharpen:1,crouch:1,lean:1.4,stroke:0})]},
    WIN:{len:1.2,loop:1,keys:[k(0,{wa:-1.57,lean:-.4}),k(.6,{wa:-1.6,lean:-.5,hy:38.5}),k(1.2,{wa:-1.57,lean:-.4})]}};}
return{build,mats,GEARS,LOOKS,NAMES,ROSTER,gearOf,clips,W,H,groups};
})();
