// Monster art v3: forms that flow. Shapes are signed distance fields blended together (smooth union) into
// groups, so a neck grows out of the shoulders instead of sitting on them. Each group is lit as one rounded form.
// A skeleton with two-bone IK poses everything; animation clips blend keyframes with easing.
const ENG=(()=>{
const Lv=(()=>{const v=[-.5,-.75,.6],m=Math.hypot(...v);return v.map(x=>x/m);})();
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(x=>x/16-.47);
const hex=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];};
function rgb2hsl([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return[h,s,l];}
function hsl2hex(h,s,l){h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
  let r,g,b;[r,g,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return'#'+[r,g,b].map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');}
const toward=(h,t,k)=>{const d=((t-h+540)%360)-180;return h+d*k;};
function ramp(base){const [h,s,l]=rgb2hsl(hex(base));const T=[[-.29,.24,.07],[-.18,.15,.05],[-.085,.07,.02],[0,0,0],[.09,-.09,-.03],[.19,-.17,-.09]];
  const ks=Math.min(1,s*1.6),[sT,lT]=h<70||h>320?[12,55]:h<165?[185,70]:[248,195];
  return T.map(([dl,k,ds],i)=>hsl2hex(i<3?toward(h,sT,k*ks):toward(h,lT,-k*ks),s+ds*ks+(i<3?.05*ks:0),l+dl));}
function mix(a,b,t){const A=hex(a),B=hex(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
const rot=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
// ── distance functions (negative inside)
function dE(s,x,y){const[dx,dy]=rot(x-s.x,y-s.y,-(s.a||0)),u=dx/s.rx,v=dy/s.ry,k=Math.hypot(u,v);return (k-1)*Math.min(s.rx,s.ry)*(k>1?1:1);}
function dC(s,x,y){let best=1e9;const P=s.p;for(let i=0;i<P.length-1;i++){const[ax,ay,ar]=P[i],[bx,by,br]=P[i+1],vx=bx-ax,vy=by-ay,L2=vx*vx+vy*vy||1;
    let t=((x-ax)*vx+(y-ay)*vy)/L2;t=Math.max(0,Math.min(1,t));const d=Math.hypot(x-ax-vx*t,y-ay-vy*t)-(ar+(br-ar)*t);if(d<best)best=d;}return best;}
function dP(s,x,y){const P=s.p;let md=1e9,inside=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[ax,ay]=P[j],[bx,by]=P[i];
    if(((by>y)!==(ay>y))&&(x<(ax-bx)*(y-by)/(ay-by)+bx))inside=!inside;const vx=bx-ax,vy=by-ay,L2=vx*vx+vy*vy||1;let t=((x-ax)*vx+(y-ay)*vy)/L2;t=Math.max(0,Math.min(1,t));md=Math.min(md,Math.hypot(x-ax-vx*t,y-ay-vy*t));}
  return inside?-md:md;}
const DF={E:dE,C:dC,P:dP};
const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
// ── render. shapes: {t,…,m(material),g(group)}; groups: {name:{z,R(bevel radius),k(blend),dk}}
function render(shapes,groups,matsObj,W,H,extra){
  const KEYS=Object.keys(matsObj),mats=KEYS.map(k=>matsObj[k]);mats.body=matsObj.body;shapes=shapes.map(s=>Object.assign({},s,{m:Math.max(0,KEYS.indexOf(s.m))}));
  const G=Object.entries(groups).sort((a,b)=>a[1].z-b[1].z),N=W*H;
  const layers=G.map(([name,gp])=>{const S=shapes.filter(s=>s.g===name);
    const bb=S.map(s=>{if(s.t==='E'){const r=Math.max(s.rx,s.ry)+3;return[s.x-r,s.y-r,s.x+r,s.y+r];}let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of s.p){const r=(p[2]||0)+3;x0=Math.min(x0,p[0]-r);y0=Math.min(y0,p[1]-r);x1=Math.max(x1,p[0]+r);y1=Math.max(y1,p[1]+r);}return[x0,y0,x1,y1];});
    const D=new Float32Array(N).fill(99),M=new Int16Array(N).fill(-1),CR=new Float32Array(N),BU=new Float32Array(N);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const px=x+.5,py=y+.5;let d=99,best=99,m=-1,second=99,m2=-1,bulge=0,raw=99;
      for(let i=0;i<S.length;i++){const b=bb[i];if(px<b[0]||px>b[2]||py<b[1]||py>b[3])continue;const s=S[i];let di=DF[s.t](s,px,py);
        if(s.holes)for(const[hx,hy,hr]of s.holes)di=Math.max(di,hr-Math.hypot(px-hx,py-hy));
        if(s.cut){d=Math.max(d,-di);continue;}
        raw=Math.min(raw,di);d=d===99?di:smin(d,di,s.k??gp.k??2.4);
        const pr=s.top?(di<0?di-100-(s.pri||0):di):di-(s.pri||0);   // top: a small detail owns only its own pixels
        if(pr<best){second=best;m2=m;best=pr;m=s.m;}else if(pr<second){second=pr;m2=s.m;}
        if(s.bulge&&di<0)bulge+=s.bulge*Math.min(1,-di/(s.bw||3));}
      const k=y*W+x;D[k]=d;if(d<0){M[k]=(m2>=0&&second-best<.7&&BAYER[(y&3)*4+(x&3)]>(second-best)/.7-.5)?m2:m;CR[k]=Math.max(0,raw-d);BU[k]=bulge;}}
    return{name,gp,D,M,CR,BU};});
  const T=new Int16Array(N).fill(-1),MAT=new Int16Array(N).fill(-1),OWN=new Int16Array(N).fill(-1);
  const height=(L,k)=>{const d=L.D[k];if(d>=0)return 0;const R=L.gp.R,u=Math.min(1,-d/R);return R*Math.sqrt(1-(1-u)*(1-u))+L.BU[k];};
  layers.forEach((L,li)=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x;if(L.D[k]>=0)continue;
      const hL=x>0?height(L,k-1):0,hR=x<W-1?height(L,k+1):0,hU=y>0?height(L,k-W):0,hD=y<H-1?height(L,k+W):0;
      let n=[(hL-hR)*.5,(hU-hD)*.5,1];const m=Math.hypot(...n);n=n.map(v=>v/m);
      let lum=n[0]*Lv[0]+n[1]*Lv[1]+n[2]*Lv[2];const M=mats[L.M[k]]||mats.body;if(M.flat!=null)lum=M.flat;
      let tv=1.35+lum*3.4+(L.gp.dk||0)+(M.dk||0)-Math.min(1.2,L.CR[k]*.55);              // creases darken where forms meet
      // cast shadow from groups in front, toward the bottom right
      for(let j=li+1;j<layers.length;j++){const F=layers[j];for(const[dx,dy,a]of[[-1,-1,.9],[-2,-2,.5],[-3,-2,.3]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0)continue;if(F.D[yy*W+xx]<0){tv-=a;break;}}}
      if(M.tex==='dscale'){const r=(y>>1)&1,cx=(x+r*2)%4,cy=y%2;if(cy===0&&cx===0&&tv>1.6)tv-=.75;else if(cy===1&&cx===2&&tv<4.2)tv+=.35;}
      if(M.tex==='scale'&&((x+((y>>1)&1)*3)%6===0)&&(y%3)===0&&tv>2.3&&tv<4.3)tv+=.7;
      if(M.tex==='plate'&&(y%3===0))tv-=.6;if(M.tex==='fur'&&((x*7+y*3)%7===0)&&tv<3.6)tv-=.6;if(M.tex==='spot'&&((x*13+y*7)%23<2))tv-=.9;
      tv+=BAYER[(y&3)*4+(x&3)]*.3;T[k]=Math.max(0,Math.min(M.max??5,Math.round(tv)));MAT[k]=L.M[k];OWN[k]=li;}});
  // stray single pixels take their neighbours' tone
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const k=y*W+x;if(T[k]<0)continue;const a=T[k-1];if(a>=0&&a===T[k+1]&&a===T[k-W]&&a===T[k+W]&&a!==T[k]&&MAT[k-1]===MAT[k])T[k]=a;}
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),img=g.createImageData(W,H),Dd=img.data;
  const put=(k,h)=>{const[r,gg,b]=hex(h);Dd[k*4]=r;Dd[k*4+1]=gg;Dd[k*4+2]=b;Dd[k*4+3]=255;};
  for(let k=0;k<N;k++)if(T[k]>=0)put(k,(mats[MAT[k]]||mats.body).r[T[k]]);
  // outlines only around a group's silhouette: dark outside, a thin line where a front group sits over one behind
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x;let nb=-1,lit=false;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const j=yy*W+xx;
      if(T[j]>=0&&(T[k]<0||OWN[j]>OWN[k]&&!layers[OWN[j]].gp.soft)){nb=j;lit=dx>0||dy>0;break;}}
    if(nb<0)continue;const M=mats[MAT[nb]]||mats.body;if(T[k]<0)put(k,lit?M.line1:M.line0);else put(k,(mats[MAT[k]]||mats.body).r[Math.max(0,T[k]-2)]);}
  g.putImageData(img,0,0);if(extra)extra(g);return c;}
function materials(look,more){const mk=(base,o)=>{const r=ramp(base);const[h,s,l]=rgb2hsl(hex(r[0]));return Object.assign({r,line0:hsl2hex(h,Math.min(1,s+.05),l*.48),line1:hsl2hex(h,s,l*.78)},o||{});};
  const M={body:mk(look.b,{tex:'scale'}),hide:mk(look.b,{tex:'fur'}),shell:mk(look.b,{tex:'spot'}),belly:mk(look.u,{tex:'plate'}),horn:mk(look.h),dark:mk(look.d),
    memb:mk(look.m||mix(mix(look.b,look.d,.25),look.u,.42),{dk:.1}),claw:mk(mix(look.h,'#3a3020',.45)),mouth:mk('#5a1a2a',{max:3}),tooth:mk('#f4f0e0',{flat:.85}),
    wound:mk('#c83040'),core:mk('#f0d8b0',{flat:.55}),glow:mk(look.glow||'#ffe680',{flat:.95}),void:mk('#0c0a20',{flat:-.6,max:2}),scute:mk(mix(look.u,look.b,.45),{dk:-.3})};
  return Object.assign(M,more||{});}
// ── skeleton helpers
const lerp=(a,b,t)=>a+(b-a)*t, ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function ik(hx,hy,fx,fy,l1,l2,bend){const dx=fx-hx,dy=fy-hy,d=Math.min(Math.hypot(dx,dy),l1+l2-.01),a=Math.atan2(dy,dx),c=(l1*l1+d*d-l2*l2)/(2*l1*d),b=Math.acos(Math.max(-1,Math.min(1,c)))*bend;
  return[hx+Math.cos(a+b)*l1,hy+Math.sin(a+b)*l1];}
// a chain of joints from a start point, each turned by its own angle on top of the last
function chain(x,y,a0,segs){const out=[[x,y]];let a=a0;for(const[len,da]of segs){a+=da;x+=Math.cos(a)*len;y+=Math.sin(a)*len;out.push([x,y]);}return out;}
// sample a clip: keys [[t,{param:value}],…] eased between, missing params hold
function sample(keys,t){if(t<=keys[0][0])return Object.assign({},keys[0][1]);for(let i=0;i<keys.length-1;i++){const[t0,a]=keys[i],[t1,b]=keys[i+1];if(t<=t1){const u=ease((t-t0)/(t1-t0)),o={};
      for(const k of new Set([...Object.keys(a),...Object.keys(b)]))o[k]=lerp(a[k]??0,b[k]??0,u);return o;}}return Object.assign({},keys[keys.length-1][1]);}
return{render,materials,ramp,mix,rot,ik,chain,sample,lerp,ease};
})();
