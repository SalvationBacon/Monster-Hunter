// Shared bits for every monster rig: a shape kit, a few helpers, and element effects drawn as loose pixels after the render.
const MON={};
const KIT=(()=>{
const {chain,ik}=ENG, V=(a,l)=>[Math.cos(a)*l,Math.sin(a)*l], add=(p,q,k)=>[p[0]+q[0]*(k??1),p[1]+q[1]*(k??1)], lerp2=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
const kit=()=>{const S=[];return{S,E:(x,y,rx,ry,m,g,o)=>S.push(Object.assign({t:'E',x,y,rx,ry,m,g},o||{})),C:(pts,m,g,o)=>S.push(Object.assign({t:'C',p:pts,m,g},o||{})),P:(pts,m,g,o)=>S.push(Object.assign({t:'P',p:pts,m,g},o||{}))};};
// a broken horn or spike: the stub ends in a jagged pale core
const stump=(K,a,b,r,g,m)=>{const mm=lerp2(a,b,.45),u=[b[0]-a[0],b[1]-a[1]],L=Math.hypot(...u)||1,ux=u[0]/L,uy=u[1]/L,nx=-uy,ny=ux;
  K.C([[a[0],a[1],r],[mm[0],mm[1],r*.9]],m||'horn',g);K.P([[mm[0]+nx*r,mm[1]+ny*r],[mm[0]+ux*1.4+nx*r*.3,mm[1]+uy*1.4+ny*r*.3],[mm[0]+ux*.4,mm[1]+uy*.4],[mm[0]+ux*1.6-nx*r*.4,mm[1]+uy*1.6-ny*r*.4],[mm[0]-nx*r,mm[1]-ny*r]],'core',g,{k:.3,pri:2});};
// a torn-off end: raw and ragged
const wound=(K,p,a,s,g)=>{const lf=V(a,1),ln=V(a+Math.PI/2,1);K.P([add(p,ln,-3.4*s),add(add(p,lf,2*s),ln,-2.4*s),add(add(p,lf,1*s),ln,-.8*s),add(add(p,lf,2.6*s),ln,.6*s),add(add(p,lf,1.4*s),ln,2.2*s),add(p,ln,3.4*s)],'wound',g,{k:.4,pri:2});};
const eyeAt=(g,x,y,col,blink,slit,big)=>{x=Math.round(x);y=Math.round(y);g.fillStyle='#10141a';if(blink){g.fillRect(x-1,y+1,4,1);return;}g.fillRect(x-1,y,4,3);g.fillStyle=col;g.fillRect(x,y,3,2);
  g.fillStyle='#1a1006';g.fillRect(x+(slit?1:0),y,1,2);g.fillStyle='#fff';g.fillRect(x+(slit?2:1),y,1,1);if(big){g.fillStyle=col;g.fillRect(x-1,y-1,1,1);}};
// scale a finished shape list about a point, so a "big" monster is the same design drawn larger
function scale(S,cx,cy,s){if(s===1)return;const f=([x,y,r])=>r==null?[cx+(x-cx)*s,cy+(y-cy)*s]:[cx+(x-cx)*s,cy+(y-cy)*s,r*s];
  for(const q of S){if(q.t==='E'){q.x=cx+(q.x-cx)*s;q.y=cy+(q.y-cy)*s;q.rx*=s;q.ry*=s;}else q.p=q.p.map(f);if(q.holes)q.holes=q.holes.map(f);}}
// a spike, a crystal, a flame, a bolt: small reusable forms
const spike=(K,b,a,len,w,m,g,o)=>K.P([add(b,V(a+Math.PI/2,w)),add(b,V(a,len)),add(b,V(a-Math.PI/2,w))],m,g,Object.assign({k:.5},o||{}));
const crystal=(K,b,a,len,w,m,g,o)=>{const u=V(a,1),n=V(a+Math.PI/2,1);K.P([add(b,n,w),add(add(b,u,len*.75),n,w*.9),add(b,u,len),add(add(b,u,len*.75),n,-w*.9),add(b,n,-w)],m,g,Object.assign({k:.25},o||{}));};
const bolt=(K,b,a,len,w,m,g,o)=>{const u=V(a,1),n=V(a+Math.PI/2,1),q=(k,s)=>add(add(b,u,len*k),n,w*s);K.P([q(0,1),q(.45,1.3),q(.4,.2),q(1,0),q(.55,-1.3),q(.6,-.2),q(0,-1)],m,g,Object.assign({k:.2},o||{}));};
const flame=(K,b,a,len,w,m,g,t,ph,o)=>{const f=Math.sin(t*12+ph)*.5,u=V(a+f*.2,1),n=V(a+Math.PI/2,1);K.P([add(b,n,w),add(add(b,u,len*.45),n,w*.8),add(b,u,len*(1+f*.2)),add(add(b,u,len*.5),n,-w*.6),add(b,n,-w)],m,g,Object.assign({k:.4},o||{}));};
// element colours for loose particles
const PAL={fire:['#fff2a0','#ffd34d','#ff9a2e','#e2483d'],ice:['#ffffff','#e8f8ff','#bfeaff','#7fc8f0'],thunder:['#ffffff','#fff6a0','#ffe14d','#a8b0ff'],water:['#ffffff','#bff0ff','#7fd6ff','#3a9ae0'],
  nature:['#f0ffc0','#c8f08a','#8ad86a','#4a9a4a'],earth:['#f2dca0','#d8b878','#c9a05a','#8a6a34'],dragon:['#ffd0e8','#ffb0d0','#e0508a','#8a3a8a'],poison:['#e8ffb0','#c8f08a','#b070d8','#7a3aa0'],
  blast:['#fff2a0','#ffd34d','#ff7a2e','#5a3a3a'],sleep:['#ffffff','#d8d0ff','#a8a0e8','#7a70c8'],para:['#ffffff','#fff6a0','#ffe14d','#c8a83a']};
const hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
// ambient particles around the body. kind: embers rise, snow drifts, sparks crackle, bubbles float, spores drift, dust settles, motes swirl
function ambient(g,kind,t,box,n){if(!kind)return;const[x0,y0,x1,y1]=box,cols=PAL[{embers:'fire',snow:'ice',sparks:'thunder',bubbles:'water',spores:'nature',dust:'earth',motes:'dragon',venom:'poison'}[kind]];
  for(let i=0;i<(n||7);i++){const r=hash(i),r2=hash(i+40),life=1.6+r2*1.2,k=((t+r*5)%life)/life;let x=x0+(x1-x0)*hash(i+7),y=y0+(y1-y0)*hash(i+13);
    if(kind==='embers'||kind==='bubbles'||kind==='spores'||kind==='venom'){y=y1-(y1-y0)*k;x+=Math.sin(t*2+i)*2;}else if(kind==='snow'||kind==='dust'){y=y0+(y1-y0)*k;x+=Math.sin(t*1.5+i)*3;}
    else if(kind==='sparks'){if(Math.sin(t*9+i*2.1)<.55)continue;}else if(kind==='motes'){const a=t*1.2+i*.9;x+=Math.cos(a)*4;y+=Math.sin(a)*3;}
    const c=cols[Math.min(3,Math.floor(k*4))];g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1);if(kind==='sparks'&&hash(i+3)>.5){g.fillRect(Math.round(x)+1,Math.round(y)-1,1,1);}}}
// a breath or spit: a stream of element particles from the mouth along a heading. k runs 0..1 over the attack
// ── streams: a breath or beam as a real volume. A cone that widens from the mouth, a hot bright core, a ragged
// flickering edge, sparks thrown off, a glow at the mouth and a splash where it lands. Thunder is a bundle of jagged bolts.
const PI=Math.PI;
function stream(g,o,to,k,el,t,w0,w1){if(!(k>0))return;const cols=PAL[el]||PAL.fire,dx=to[0]-o[0],dy=to[1]-o[1],D=Math.hypot(dx,dy)||1,ux=dx/D,uy=dy/D,nx=-uy,ny=ux,L=D*Math.min(1,k*1.6),GY=66;
  const P=(x,y,c)=>{if(y>GY)return;g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1);};
  if(el==='thunder'||el==='para'){for(let b=0;b<4;b++){let px_=o[0],py_=o[1];const seg=Math.ceil(L/5);for(let i=1;i<=seg;i++){const s=Math.min(L,i*5),sw=(hash(b*31+i+Math.floor(t*14))-.5)*(2+s*.18),x=o[0]+ux*s+nx*sw,y=o[1]+uy*s+ny*sw,n=Math.ceil(Math.hypot(x-px_,y-py_));
        for(let j=0;j<=n;j++){const xx=px_+(x-px_)*j/n,yy=py_+(y-py_)*j/n;P(xx,yy,b===0?'#ffffff':cols[1]);if(b===0){P(xx+nx,yy+ny,cols[2]);P(xx-nx,yy-ny,cols[2]);}}px_=x;py_=y;}}
    for(let i=0;i<10;i++){const s=hash(i+Math.floor(t*10))*L;P(o[0]+ux*s+nx*(hash(i+5)-.5)*12,o[1]+uy*s+ny*(hash(i+7)-.5)*12,cols[2]);}}
  else for(let s=0;s<L;s+=.6){const q=s/D,w=w0+(w1-w0)*q,wob=Math.sin(s*.45-t*22)*w*.18,cx=o[0]+ux*s+nx*wob,cy=o[1]+uy*s+ny*wob;
    for(let j=-w;j<=w;j+=.7){const e=Math.abs(j)/w,r=hash(Math.floor(s*3)*7+Math.floor(j*3)+Math.floor(t*18)*13);if(e>.75&&r<(e-.75)*3.4)continue;
      P(cx+nx*j,cy+ny*j,e<.3?cols[0]:e<.62?cols[1]:e<.88?cols[2]:cols[3]);}}
  // sparks off the edges, a glow at the mouth, a splash where it lands
  for(let i=0;i<12;i++){const s=((hash(i)*L+t*70)%L),q=s/D,w=w0+(w1-w0)*q,side=(hash(i+3)-.5)*2.6*w;P(o[0]+ux*s+nx*side,o[1]+uy*s+ny*side-hash(i+9)*3,cols[i%2]);}
  for(let r=3;r>=1;r--){g.fillStyle=cols[3-r];g.beginPath();g.arc(Math.round(o[0]),Math.round(o[1]),r+(r===3?Math.sin(t*30)*.6:0),0,PI*2);g.fill();}
  if(k>.62){const ex=o[0]+ux*L,ey=Math.min(GY-1,o[1]+uy*L);for(let i=0;i<14;i++){const a=PI+(hash(i)-.5)*PI*.95,r=2+hash(i+1)*w1*1.2+((t*30+i)%4);P(ex+Math.cos(a)*r,ey-Math.abs(Math.sin(a))*r*.7,cols[i%3]);}}}
// a spit: a few heavy globs that arc out one after another with trails, and splash where they land
function globs(g,o,to,k,el,t,n){const cols=PAL[el]||PAL.fire;for(let i=0;i<(n||3);i++){const q=k*1.6-i*.28;if(q<=0)continue;const GY=66;
    if(q<1){const x=o[0]+(to[0]-o[0])*q,y=o[1]+(to[1]-o[1])*q-Math.sin(q*PI)*10;for(let tr=3;tr>=0;tr--){const qq=Math.max(0,q-tr*.06),xx=o[0]+(to[0]-o[0])*qq,yy=o[1]+(to[1]-o[1])*qq-Math.sin(qq*PI)*10,r=tr?Math.max(0,2-tr*.5):2.4;
        g.fillStyle=cols[Math.min(3,tr)];g.beginPath();g.arc(Math.round(xx),Math.round(yy),r,0,PI*2);g.fill();}g.fillStyle='#ffffff';g.fillRect(Math.round(x-1),Math.round(y-1),1,1);}
    else if(q<1.5){const s=(q-1)/.5;for(let j=0;j<10;j++){const a=PI+(j/9)*PI,r=1+s*7;g.fillStyle=cols[j%3];g.fillRect(Math.round(to[0]+Math.cos(a)*r),Math.round(Math.min(GY-1,to[1]+Math.sin(a)*r*.6)),1,1);}}}}
// the monster's own breath or spit: aimed down at the ground ahead of it
function breath(g,el,t,o,a,k,style){if(!(k>0))return;const to=[o[0]-24,64];if(style==='spit')globs(g,o,to,k,el,t,3);else stream(g,o,to,k,el,t,1.4,7);}
// glowing cracks and spots read as light even in shadow: drawn as loose pixels over the finished body
function glowDots(g,pts,col,t){g.fillStyle=col;pts.forEach(([x,y],i)=>{if(Math.sin(t*2.5+i*1.3)>-.7)g.fillRect(Math.round(x),Math.round(y),1,1);});}
return{V,add,lerp2,chain,ik,kit,stump,wound,eyeAt,scale,spike,crystal,bolt,flame,ambient,breath,stream,globs,glowDots,PAL,hash};
})();
// the poseOf / frame helpers every page uses
const ELEM_WORD={fire:'FLAME',ice:'FROST',thunder:'THUNDER',water:'WATER',nature:'SPORE',earth:'SAND',dragon:'DRAGON',poison:'POISON'};
