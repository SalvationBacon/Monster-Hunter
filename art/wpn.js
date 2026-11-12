// WEAPONS: every monster's greatsword, dual blades, hammer and lance are made from that monster. The blade, guard,
// hammer head and lance tip each take a form from its body (a leaf, a ram horn, cut ice, a bolt, an obsidian shard,
// a cloud, an antler, an axe blade, the void), painted in its colours, with its element glowing in the seams.
const WPN=(()=>{
const V=(a,l)=>[Math.cos(a)*l,Math.sin(a)*l],add=(p,q,k)=>[p[0]+q[0]*(k??1),p[1]+q[1]*(k??1)],lerp2=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k],PI=Math.PI;
const ELC={nature:'#8ad86a',fire:'#ffb03a',ice:'#bfeaff',thunder:'#ffe14d',water:'#7fd6ff',earth:'#d8b070',dragon:'#ff6ab0'};
// per monster: blade form, guard, hammer head, lance tip
const SPEC={fern:{blade:'leaf',guard:'wing',head:'leaf',tip:'leaf'},ember:{blade:'horn',guard:'horn',head:'club',tip:'ram'},rime:{blade:'crystal',guard:'crystal',head:'crystal',tip:'crystal'},
  volt:{blade:'bolt',guard:'wing',head:'bolt',tip:'bolt'},obsid:{blade:'jagged',guard:'heads',head:'rock',tip:'jagged'},storm:{blade:'cloud',guard:'cloud',head:'pearl',tip:'stag'},
  aurora:{blade:'feather',guard:'feather',head:'plume',tip:'feather'},render:{blade:'axe',guard:'crown',head:'axe',tip:'crown'},
  tusk:{blade:'tusk',guard:'tusks',head:'hoof',tip:'tusk'},thorn:{blade:'leaf',guard:'shell',head:'club',tip:'sting'},cinder:{blade:'horn',guard:'horn',head:'hoof',tip:'tusk'},
  frost:{blade:'fang',guard:'fur',head:'crystal',tip:'fang'},icehide:{blade:'tusk',guard:'fur',head:'hoof',tip:'tusk'},ruin:{blade:'jagged',guard:'rock',head:'rock',tip:'horn1'},gloom:{blade:'fang',guard:'fur',head:'club',tip:'fang'},
  mud:{blade:'pincer',guard:'shell',head:'pincer',tip:'pincer'},shell:{blade:'pincer',guard:'shell',head:'shell',tip:'sting'},sting:{blade:'stinger',guard:'shell',head:'pincer',tip:'sting'},
  magma:{blade:'pincer',guard:'rock',head:'rock',tip:'sting'},cryst:{blade:'crystal',guard:'shell',head:'crystal',tip:'crystal'},dusk:{blade:'horn',guard:'horn',head:'club',tip:'sting'},pyre:{blade:'horn',guard:'crown',head:'pincer',tip:'jagged'},
  tide:{blade:'fin',guard:'wing',head:'shell',tip:'fang'},bog:{blade:'fang',guard:'crown',head:'club',tip:'fang'},eel:{blade:'jagged',guard:'shell',head:'rock',tip:'fang'},mire:{blade:'leaf',guard:'heads',head:'leaf',tip:'fang'},
  abyss:{blade:'fin',guard:'wing',head:'pearl',tip:'fang'},reaver:{blade:'fin',guard:'horn',head:'axe',tip:'horn1'},
  quill:{blade:'quill',guard:'feather',head:'plume',tip:'feather'},dust:{blade:'feather',guard:'comb',head:'club',tip:'beak'},gust:{blade:'bolt',guard:'feather',head:'bolt',tip:'feather'},
  plume:{blade:'feather',guard:'feather',head:'plume',tip:'feather'},dread:{blade:'horn',guard:'wing',head:'club',tip:'beak'},temp:{blade:'bolt',guard:'wing',head:'bolt',tip:'beak'},star:{blade:'void',guard:'star',head:'star',tip:'void'}};
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
function mats(L){const g=ELC[L.el]||'#ffffff',void_=L.f&&L.f.elder;
  return{wA:void_?Object.assign(one('#1a1638'),{flat:-.3}):one(L.h),wB:one(L.b),wD:one(L.d),wU:one(L.u),wG:Object.assign(one(void_?'#e0d4ff':g),{flat:.95}),wE:Object.assign(one(ENG.mix(L.h,'#ffffff',.55)),{flat:.85}),
    wM:Object.assign(one(L.m||ENG.mix(L.b,L.d,.4)),{dk:.1})};}
// draw a weapon: S shape list, wt weapon type, at the grip point, a its heading, g the group, id the monster
function draw(S,wt,at,a,g,id,glow,t,glows){const sp=SPEC[id]||SPEC.fern,C=(pts,m,o)=>S.push(Object.assign({t:'C',p:pts,m,g},o||{})),P=(pts,m,o)=>S.push(Object.assign({t:'P',p:pts,m,g},o||{})),
    E=(x,y,rx,ry,m,o)=>S.push(Object.assign({t:'E',x,y,rx,ry,m,g},o||{})),u=V(a,1),n=V(a+PI/2,1),q=(o,k,s)=>add(add(o,u,k),n,s),G=glows||[];
  const grip=(b0)=>{C([add(at,u,-2.4).concat([1.1]),b0.concat([1])],'wD');E(...add(at,u,-2.8),1.3,1.3,'wU',{pri:2});};
  // a blade from b0 forward: len, width
  const blade=(b0,len,w)=>{const T=sp.blade;
    if(T==='leaf'){P([q(b0,0,w*.5),q(b0,len*.3,w*1.1),q(b0,len*.6,w*.95),q(b0,len,0),q(b0,len*.6,-w*.8),q(b0,len*.3,-w),q(b0,0,-w*.5)],'wB',{k:.4});C([q(b0,0,0).concat([.5]),q(b0,len*.9,0).concat([.3])],'wD',{pri:2.6});
      for(const k of[.25,.45,.65])for(const s of[1,-1])C([q(b0,len*k,0).concat([.3]),q(b0,len*(k+.1),w*.8*s).concat([.25])],'wD',{pri:2.6});}
    else if(T==='horn'){const pts=[];for(let i=0;i<=6;i++){const k=i/6;pts.push(q(b0,len*k,Math.sin(k*PI*.9)*w*.9));}const top=pts.map((p,i)=>add(p,n,w*(1-i/7)*.75)),bot=pts.map((p,i)=>add(p,n,-w*(1-i/7)*.75)).reverse();
      P([...top,...bot],'wA',{k:.4});for(let i=1;i<6;i++)G.push(lerp2(pts[i],pts[i+1],.5));C(pts.slice(1,6).map(p=>p.concat([.35])),'wG',{pri:2.6});}
    else if(T==='crystal'){P([q(b0,0,w*.6),q(b0,len*.15,w),q(b0,len*.7,w*.8),q(b0,len,0),q(b0,len*.75,-w*.9),q(b0,len*.2,-w),q(b0,0,-w*.6)],'wA',{k:.2});P([q(b0,len*.1,w*.3),q(b0,len*.7,w*.35),q(b0,len*.95,0),q(b0,len*.15,-w*.1)],'wE',{pri:2.6,k:.2});}
    else if(T==='bolt'){P([q(b0,0,w*.7),q(b0,len*.4,w*1.1),q(b0,len*.35,w*.1),q(b0,len,w*.2),q(b0,len*.6,-w*1.1),q(b0,len*.65,-w*.1),q(b0,0,-w*.7)],'wB',{k:.25});C([q(b0,len*.05,0).concat([.4]),q(b0,len*.38,w*.5).concat([.35]),q(b0,len*.62,-w*.5).concat([.35]),q(b0,len*.95,w*.15).concat([.3])],'wG',{pri:2.6});}
    else if(T==='jagged'){P([q(b0,0,w*.8),q(b0,len*.25,w*1.2),q(b0,len*.32,w*.5),q(b0,len*.6,w*1.0),q(b0,len,w*.2),q(b0,len*.7,-w*.6),q(b0,len*.45,-w*1.1),q(b0,len*.2,-w*.7),q(b0,0,-w*.8)],'wD',{k:.25});
      C([q(b0,len*.1,0).concat([.4]),q(b0,len*.4,w*.3).concat([.35]),q(b0,len*.7,-w*.1).concat([.3])],'wG',{pri:2.6});for(const k of[.2,.5,.75])G.push(q(b0,len*k,w*.1));}
    else if(T==='cloud'){const top=[],bot=[];for(let i=0;i<=8;i++){const k=i/8,wk=w*(1-k*.7)*(1+Math.sin(k*PI*4)*.18);top.push(q(b0,len*k,wk));bot.unshift(q(b0,len*k,-w*(1-k*.85)));}
      P([...top,q(b0,len*1.02,0),...bot],'wA',{k:.4});C([q(b0,len*.05,-w*.6).concat([.35]),q(b0,len*.5,-w*.35).concat([.3]),q(b0,len*.95,0).concat([.25])],'wG',{pri:2.6});}
    else if(T==='feather'){P([q(b0,0,w*.5),q(b0,len*.3,w*1.05),q(b0,len*.75,w*.8),q(b0,len,0),q(b0,len*.7,-w*.55),q(b0,0,-w*.5)],'wA',{k:.4});C([q(b0,0,0).concat([.45]),q(b0,len*.95,0).concat([.3])],'wM',{pri:2.6});
      for(let i=1;i<6;i++){const k=i/6;C([q(b0,len*k,0).concat([.25]),q(b0,len*(k+.08),w*.9).concat([.2])],'wB',{pri:2.6});}}
    else if(T==='tusk'){const pts=[];for(let i=0;i<=6;i++){const k=i/6;pts.push(q(b0,len*k,-Math.sin(k*PI*.8)*w*1.1));}P([...pts.map((p,i)=>add(p,n,w*(1-i/7)*.8)),...pts.map((p,i)=>add(p,n,-w*(1-i/7)*.8)).reverse()],'wA',{k:.5});
      for(let i=0;i<3;i++)C([q(b0,len*.08+i*1.2,w*.9).concat([.5]),q(b0,len*.08+i*1.2,-w*.9).concat([.5])],'wD',{pri:2.6});}
    else if(T==='fang'){P([q(b0,0,w*.8),q(b0,len*.4,w*.9),q(b0,len*.85,w*.2),q(b0,len,-w*.5),q(b0,len*.5,-w*.7),q(b0,0,-w*.8)],'wA',{k:.4});C([q(b0,len*.1,-w*.5).concat([.35]),q(b0,len*.9,-w*.35).concat([.25])],'wG',{pri:2.6});}
    else if(T==='pincer'){P([q(b0,0,w*.9),q(b0,len*.5,w*1.3),q(b0,len,w*.2),q(b0,len*.55,w*.1),q(b0,len*.75,-w*.9),q(b0,len*.3,-w*1.1),q(b0,0,-w*.9)],'wB',{k:.4});P([q(b0,len*.55,w*.1),q(b0,len,w*.2),q(b0,len*.75,-w*.9)],'wA',{k:.3,pri:1});}
    else if(T==='stinger'){for(let i=0;i<4;i++)S.push({t:'E',x:q(b0,len*(.08+i*.17),0)[0],y:q(b0,len*(.08+i*.17),0)[1],rx:len*.1,ry:w*(1-i*.12),a,m:i%2?'wD':'wB',g,pri:i*.1});
      E(...q(b0,len*.78,0),len*.12,w*.9,'wG',{a,pri:2.6});P([q(b0,len*.85,w*.5),q(b0,len*1.08,0),q(b0,len*.85,-w*.5)],'wA',{k:.3,pri:2.6});}
    else if(T==='quill'){for(let i=0;i<3;i++)P([q(b0,0,(i-1)*w*.6+w*.3),q(b0,len*(1-Math.abs(i-1)*.15),(i-1)*w*.5),q(b0,0,(i-1)*w*.6-w*.3)],i===1?'wB':'wD',{k:.3,pri:i===1?1:0});C([q(b0,len*.05,0).concat([.35]),q(b0,len*.95,0).concat([.25])],'wE',{pri:2.6});}
    else if(T==='fin'){P([q(b0,0,w*.7),q(b0,len*.35,w*1.4),q(b0,len*.8,w*.6),q(b0,len,0),q(b0,len*.6,-w*.7),q(b0,0,-w*.7)],'wM',{k:.4});for(let i=1;i<5;i++)C([q(b0,len*i*.18,-w*.4).concat([.3]),q(b0,len*(i*.18+.12),w*.9).concat([.25])],'wA',{pri:2.6});}
    else if(T==='antler'){P([q(b0,0,w*.6),q(b0,len*.85,w*.5),q(b0,len,0),q(b0,len*.85,-w*.6),q(b0,0,-w*.7)],'wA',{k:.4});
      for(const k of[.3,.55,.78]){const r=q(b0,len*k,w*.4);C([r.concat([.7]),add(add(r,u,len*.12),n,w*1.4).concat([.3])],'wA');}C([q(b0,len*.05,-w*.5).concat([.3]),q(b0,len*.85,-w*.4).concat([.25])],'wE',{pri:2.6});}
    else if(T==='axe'){P([q(b0,0,w*.6),q(b0,len*.6,w*.7),q(b0,len*.75,w*1.8),q(b0,len,w*1.2),q(b0,len*.95,-w*.4),q(b0,0,-w*.6)],'wA',{k:.3});C([q(b0,len*.1,w*.1).concat([.4]),q(b0,len*.7,w*.3).concat([.4]),q(b0,len*.85,w*1.2).concat([.3])],'wU',{pri:2.6});
      G.push(q(b0,len*.85,w*1.1));}
    else if(T==='void'){P([q(b0,0,w*.6),q(b0,len*.5,w*.9),q(b0,len,0),q(b0,len*.5,-w*.9),q(b0,0,-w*.6)],'wA',{k:.4});C([q(b0,len*.05,w*.75).concat([.35]),q(b0,len*.5,w*.85).concat([.3]),q(b0,len*.98,0).concat([.25])],'wE',{pri:2.6});
      for(let i=0;i<5;i++)G.push(q(b0,len*(.15+i*.16),w*((i*37%10)/10-.5)));}
    if(T!=='jagged'&&T!=='void'&&T!=='crystal')C([q(b0,len*.08,-w*.62).concat([.3]),q(b0,len*.85,-w*.18).concat([.25])],'wE',{pri:2.7});};
  // the guard, across the blade at b0
  const guard=(b0,w)=>{const T=sp.guard;
    if(T==='wing')for(const s of[1,-1])P([q(b0,0,s*.6),q(b0,-1.6,s*(w+3.4)),q(b0,1.4,s*(w+2.6)),q(b0,1.4,s*.6)],'wM',{k:.3});
    else if(T==='horn')for(const s of[1,-1])C([q(b0,0,s*.8).concat([1]),q(b0,-1.2,s*(w+2)).concat([.8]),q(b0,1,s*(w+3.4)).concat([.3])],'wA');
    else if(T==='crystal')for(const s of[1,-1])P([q(b0,-.6,s*.5),q(b0,-1.4,s*(w+3)),q(b0,.6,s*(w+1.6)),q(b0,.8,s*.5)],'wA',{k:.2});
    else if(T==='rock'){P([q(b0,-1,w+2.2),q(b0,1.4,w+1.6),q(b0,1.2,-w-2),q(b0,-1.2,-w-1.6)],'wD',{k:.3});G.push(q(b0,0,0));}
    else if(T==='cloud')for(const s of[1,-1]){const c=q(b0,0,s*(w+1.6));E(c[0],c[1],2,1.6,'wU');E(...add(c,n,s*1.6),1.3,1.2,'wU');}
    else if(T==='feather')for(const s of[1,-1])for(let i=0;i<2;i++){const c=q(b0,-1-i*1.2,s*(w+2+i));E(c[0],c[1],2.4,.9,i?'wU':'wM',{a:a+s*(1.2+i*.3),pri:i*.1});}
    else if(T==='tusks')for(const s of[1,-1])C([q(b0,-.6,s*.8).concat([1.1]),q(b0,-2,s*(w+2)).concat([.9]),q(b0,.8,s*(w+3.6)).concat([.35])],'wA');
    else if(T==='fur')for(let i=0;i<6;i++){const s=i<3?1:-1,k=i%3,c=q(b0,-1+k*.6,s*(w*.5+k*1.2));E(c[0],c[1],2,1.5,'wU',{a:a+s,pri:k*.1});}
    else if(T==='shell'){E(...q(b0,0,0),2.4,w+2.4,'wB',{a,bulge:1});C([q(b0,-1.4,w+1.6).concat([.4]),q(b0,-1.4,-w-1.6).concat([.4])],'wD',{pri:2.6});}
    else if(T==='comb')for(let i=0;i<3;i++)E(...q(b0,-.4-i*.2,w*.8+i*1.2),1.2,1,'wG',{pri:i*.1});
    else if(T==='crown')for(const s of[1,-1])for(let i=0;i<3;i++)P([q(b0,-.5,s*(w*.6+i*1.2)),q(b0,2.6-i*.4,s*(w*.6+i*1.2+.5)),q(b0,.5,s*(w*.6+i*1.2+1))],'wU',{k:.2});
    else if(T==='heads')for(const s of[-1,0,1]){const c=q(b0,s?-.5:1.4,s*(w+2.4));C([b0.concat([.8]),c.concat([1.1])],'wD');P([add(c,u,-1.2),add(add(c,u,2.6),n,s*.8),add(c,u,1.2)],'wD',{k:.3});S.push({t:'E',x:c[0]+u[0]*1.4,y:c[1]+u[1]*1.4,rx:.5,ry:.5,m:'wG',g,pri:3});}
    else if(T==='star'){const c=b0;P([q(c,0,-3.4),q(c,.9,-.9),q(c,3.2,0),q(c,.9,.9),q(c,0,3.4),q(c,-.9,.9),q(c,-3.2,0),q(c,-.9,-.9)],'wG',{k:.2});}
    C([q(b0,0,w+.8).concat([.8]),q(b0,0,-w-.8).concat([.8])],'wD',{pri:1});};
  if(wt==='gs'||wt==='db'){const len=wt==='gs'?21:9.5,w=wt==='gs'?3:2,b0=add(at,u,2.4);grip(b0);blade(b0,len,w);guard(b0,w*.7);}
  else if(wt==='hm'){C([add(at,u,-2).concat([1.1]),add(at,u,15).concat([1.1])],'wD');const hd=add(at,u,16.5),T=sp.head;
    if(T==='leaf'){E(hd[0],hd[1],4.6,3.6,'wB',{a:a+PI/2});for(const s of[1,-1])P([q(hd,-2,s*3),q(hd,0,s*8),q(hd,2,s*3)],'wM',{k:.4});C([q(hd,0,-4).concat([.5]),q(hd,0,4).concat([.5])],'wD',{pri:2.6});}
    else if(T==='club'){E(hd[0],hd[1],5,4.6,'wB',{bulge:1});for(let i=0;i<6;i++){const d=V(a+i*1.05,1);P([add(hd,V(a+i*1.05+.5,2.6)),add(hd,d,7.4),add(hd,V(a+i*1.05-.5,2.6))],'wA',{k:.3,pri:2});}G.push(hd,add(hd,u,1.6));}
    else if(T==='crystal'){for(const[da,l]of[[0,7],[.7,5.4],[-.7,5.4],[1.6,4],[-1.6,4]]){const d=V(a+PI/2+da,1),m=V(a+da,1);P([add(hd,m,-1.4),add(add(hd,d,l*.6),m,-1.4),add(hd,d,l),add(add(hd,d,l*.6),m,1.4),add(hd,m,1.4)],'wA',{k:.2});
      P([add(hd,d,-1.2),add(add(hd,d,-l*.6),m,-1.2),add(hd,d,-l*.9),add(add(hd,d,-l*.6),m,1.2)],'wA',{k:.2});}E(hd[0],hd[1],2.4,2.4,'wE',{pri:2.6});}
    else if(T==='bolt'){P([q(hd,-3,5),q(hd,3,5),q(hd,3,-6),q(hd,-3,-6)],'wB',{k:.6});C([q(hd,-.5,4).concat([.5]),q(hd,1,1).concat([.45]),q(hd,-1,-1.5).concat([.45]),q(hd,.6,-4.6).concat([.4])],'wG',{pri:2.6});}
    else if(T==='rock'){P([q(hd,-3.4,5.4),q(hd,3,6),q(hd,3.6,-5.6),q(hd,-3,-6.4),q(hd,-4,0)],'wD',{k:.3});for(const s of[-3,0,3])G.push(q(hd,0,s));C([q(hd,-2,4).concat([.4]),q(hd,1,0).concat([.35]),q(hd,-1,-4).concat([.35])],'wG',{pri:2.6});}
    else if(T==='cloud'){for(const[dx,dy,r]of[[0,0,4.2],[0,4.4,3],[0,-4.4,3],[-1.6,2,3],[1.6,-2,3]])E(...q(hd,dx,dy),r,r*.9,'wU');P([q(hd,0,-1),q(hd,4,-2),q(hd,2.4,0),q(hd,6,.4)],'wG',{k:.2,pri:2.6});}
    else if(T==='antler'){E(hd[0],hd[1],4.2,3.6,'wB',{a:a+PI/2,bulge:1});for(const s of[1,-1]){const b=q(hd,0,s*3);C([b.concat([1.1]),add(add(b,n,s*4),u,2).concat([.8]),add(add(b,n,s*6),u,-1).concat([.35])],'wA');C([add(add(b,n,s*3),u,1.4).concat([.6]),add(add(b,n,s*3.4),u,4.4).concat([.3])],'wA');}}
    else if(T==='axe'){P([q(hd,-3,3),q(hd,3,3),q(hd,3,-3),q(hd,-3,-3)],'wB',{k:.6});P([q(hd,-2.6,-3),q(hd,-5,-8.6),q(hd,5,-8.6),q(hd,2.6,-3)],'wA',{k:.3});C([q(hd,-4.4,-8).concat([.4]),q(hd,4.4,-8).concat([.4])],'wE',{pri:2.6});G.push(q(hd,0,0));}
    else if(T==='pearl'){E(hd[0],hd[1],4.6,4.6,'wU',{});E(...q(hd,1.2,-1.4),1.4,1.4,'wE',{pri:2.6});for(const s of[-1,1])for(let i=0;i<3;i++)C([q(hd,-4+i*3,s*3.6).concat([.9]),q(hd,-4.6+i*3,s*6).concat([.3])],'wA',{pri:2});}
    else if(T==='plume'){for(let i=0;i<5;i++){const da=-.9+i*.45,c=add(hd,V(a+PI/2+da,4.4));E(c[0],c[1],4.4,1.5,i%2?'wB':'wA',{a:a+PI/2+da,pri:i*.1});}E(hd[0],hd[1],2,2,'wU',{pri:1});}
    else if(T==='hoof'){P([q(hd,-3,4.6),q(hd,3.4,3.6),q(hd,3.4,-3.6),q(hd,-3,-4.6)],'wD',{k:.6});C([q(hd,3.6,4).concat([1]),q(hd,3.6,-4).concat([1])],'wA',{pri:1.5});C([q(hd,3.6,0).concat([.6]),q(hd,4.6,0).concat([.4])],'wD',{pri:2.6});}
    else if(T==='shell'){E(hd[0],hd[1],4.6,5.6,'wB',{a,bulge:1.4});for(let i=0;i<3;i++)C([q(hd,-3+i*3,-5).concat([.5]),q(hd,-3+i*3,5).concat([.5])],'wD',{pri:2.6});}
    else if(T==='pincer'){E(hd[0],hd[1],4,3.4,'wB',{a,bulge:1});P([q(hd,2,-2),q(hd,9,-1),q(hd,10,-3),q(hd,3,-4)],'wA',{k:.3});P([q(hd,2,2),q(hd,8,1.4),q(hd,9,3),q(hd,3,3.6)],'wA',{k:.3});}
    else if(T==='star'){P([q(hd,0,-6.4),q(hd,1.6,-1.6),q(hd,6.4,0),q(hd,1.6,1.6),q(hd,0,6.4),q(hd,-1.6,1.6),q(hd,-6.4,0),q(hd,-1.6,-1.6)],'wA',{k:.3});E(hd[0],hd[1],1.8,1.8,'wG',{pri:2.6});}}
  else if(wt==='ln'){C([add(at,u,-6).concat([1.2]),add(at,u,19.5).concat([1])],'wD');const b0=add(at,u,19),T=sp.tip;
    if(T==='leaf')P([q(b0,0,1.6),q(b0,4,3),q(b0,11,0),q(b0,4,-3),q(b0,0,-1.6)],'wB',{k:.4});
    else if(T==='ram'){const pts=[];for(let i=0;i<=5;i++){const k=i/5;pts.push(q(b0,k*10,Math.sin(k*PI)*2.4).concat([2.2*(1-k*.85)]));}C(pts,'wA');C(pts.slice(1,5).map(p=>[p[0],p[1],.35]),'wG',{pri:2.6});}
    else if(T==='crystal'){P([q(b0,0,2),q(b0,8,1.6),q(b0,11.5,0),q(b0,8,-1.6),q(b0,0,-2)],'wA',{k:.2});P([q(b0,1,.6),q(b0,9,.4),q(b0,10.5,0)],'wE',{pri:2.6,k:.2});}
    else if(T==='bolt')P([q(b0,0,2),q(b0,5,2.6),q(b0,4.4,.4),q(b0,11,0),q(b0,6,-2.6),q(b0,6.6,-.4),q(b0,0,-2)],'wB',{k:.2});
    else if(T==='jagged'){P([q(b0,0,2.2),q(b0,4,3),q(b0,5,1),q(b0,11,0),q(b0,6,-2.4),q(b0,0,-2.2)],'wD',{k:.25});G.push(q(b0,4,0),q(b0,7,0));}
    else if(T==='stag'){C([b0.concat([1.6]),q(b0,6,.4).concat([1.1]),q(b0,11,0).concat([.35])],'wA');C([q(b0,3,0).concat([.8]),q(b0,6,2.6).concat([.3])],'wA');C([q(b0,5,0).concat([.7]),q(b0,7.4,-2.4).concat([.3])],'wA');}
    else if(T==='feather'){P([q(b0,0,1.4),q(b0,4,2.6),q(b0,12,0),q(b0,4,-1.8),q(b0,0,-1.4)],'wA',{k:.4});C([q(b0,0,0).concat([.4]),q(b0,11,0).concat([.25])],'wM',{pri:2.6});}
    else if(T==='tusk'){const pts=[];for(let i=0;i<=5;i++){const k=i/5;pts.push(q(b0,k*11,-Math.sin(k*PI*.8)*2.6).concat([2.2*(1-k*.85)]));}C(pts,'wA');}
    else if(T==='fang'){P([q(b0,0,2),q(b0,6,1.6),q(b0,11.5,-1),q(b0,5,-2),q(b0,0,-2)],'wA',{k:.4});C([q(b0,1,-1).concat([.35]),q(b0,10,-.8).concat([.25])],'wG',{pri:2.6});}
    else if(T==='sting'){S.push({t:'E',x:q(b0,3,0)[0],y:q(b0,3,0)[1],rx:3.4,ry:2.6,a,m:'wG',g,pri:1});P([q(b0,5,1.2),q(b0,12,0),q(b0,5,-1.2)],'wA',{k:.3});}
    else if(T==='beak'){P([q(b0,0,2.4),q(b0,7,2),q(b0,11.5,-.6),q(b0,9,-1.6),q(b0,0,-2)],'wA',{k:.4});}
    else if(T==='horn1'){C([b0.concat([2.6]),q(b0,5,.6).concat([1.8]),q(b0,9,.6).concat([1]),q(b0,12,-.4).concat([.35])],'wA');}
    else if(T==='pincer'){P([q(b0,0,2.4),q(b0,7,2.6),q(b0,11,.4),q(b0,6,.4),q(b0,9,-2),q(b0,0,-2.4)],'wA',{k:.3});}
    else if(T==='antler'){C([b0.concat([1.6]),q(b0,10,0).concat([.4])],'wA');for(const[k,s]of[[3,1],[5.5,-1],[7.5,1]])C([q(b0,k,0).concat([.7]),q(b0,k+2,s*2.6).concat([.3])],'wA');}
    else if(T==='crown'){P([q(b0,0,1.8),q(b0,9,1.2),q(b0,12,0),q(b0,9,-1.2),q(b0,0,-1.8)],'wA',{k:.3});for(const s of[1,-1])P([q(b0,0,s*1.4),q(b0,4.6,s*3.6),q(b0,2,s*1.4)],'wU',{k:.2});}
    else if(T==='void'){P([q(b0,0,1.8),q(b0,6,2.4),q(b0,12,0),q(b0,6,-2.4),q(b0,0,-1.8)],'wA',{k:.3});for(let i=0;i<3;i++)G.push(q(b0,3+i*3,(i-1)*.8));}
    C([q(b0,1,0).concat([.4]),q(b0,9,0).concat([.3])],'wE',{pri:2.7});E(...q(b0,0,0),1.7,1.7,'wU',{pri:2});}
  if(glow){const tp=add(at,u,wt==='gs'?20:wt==='hm'?16:9);for(let i=0;i<glow;i++)E(tp[0]+Math.cos(i*2.1)*3,tp[1]+Math.sin(i*2.1)*3,1.1,1.1,'wG');}
  return G;}
// a lance shield in the monster's colours, with its element as an emblem
function shield(S,at,g,id){const P=(pts,m,o)=>S.push(Object.assign({t:'P',p:pts,m,g},o||{})),E=(x,y,rx,ry,m,o)=>S.push(Object.assign({t:'E',x,y,rx,ry,m,g},o||{})),[x,y]=at;
  P([[x-4,y-6],[x+4,y-6],[x+5,y+1],[x,y+7],[x-5,y+1]],'wD',{k:.6});P([[x-2.6,y-4],[x+2.6,y-4],[x+3.2,y+.6],[x,y+4.6],[x-3.2,y+.6]],'wB',{k:.5,pri:1});E(x,y,1.5,1.5,'wG',{pri:2});}
return{draw,shield,mats,SPEC,ELC};
})();
