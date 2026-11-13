// SIGNATURE MOVES: one or two per monster, from its legend. Each is its own keyframed body motion plus its own effect,
// drawn over a small target hunter at the left so you can see what it does and how it lands.
// Frame-level pose params any move can use: sink (into the ground), fade (vanish), spin (whole-body turn), shk (shake), lift.
const SIG=(()=>{
const PI=Math.PI,TAU=PI*2,GY=66,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,hash=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const sm=k=>k<0?0:k>1?1:k*k*(3-2*k);
const px=(g,x,y,c,s)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),s||1,s||1);};
const disc=(g,x,y,r,c)=>{g.fillStyle=c;for(let dy=-r;dy<=r;dy++){const w=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy)));g.fillRect(Math.round(x-w),Math.round(y+dy),w*2+1,1);}};
const line=(g,x0,y0,x1,y1,c,w)=>{const n=Math.ceil(Math.hypot(x1-x0,y1-y0));for(let i=0;i<=n;i++)px(g,lerp(x0,x1,i/n),lerp(y0,y1,i/n),c,w||1);};
const T={x:8,y:GY};   // the target hunter
// ── effects
const FX={
  proj(g,a,b,k,cols,s,trail){if(k<0||k>1)return;const x=lerp(a[0],b[0],k),y=lerp(a[1],b[1],k)-Math.sin(k*PI)*(a[2]||0);for(let i=0;i<(trail||3);i++){const kk=k-i*.05;if(kk<0)break;px(g,lerp(a[0],b[0],kk),lerp(a[1],b[1],kk)-Math.sin(kk*PI)*(a[2]||0),cols[Math.min(cols.length-1,i+1)],Math.max(1,(s||2)-i));}disc(g,x,y,s||2,cols[0]);},
  volley(g,from,u,n,start,gap,travel,cols,s,arc,spread){for(let i=0;i<n;i++){const k=(u-start-i*gap)/travel;this.proj(g,[from[0],from[1],arc||0],[T.x+3+(spread?hash(i)*spread-spread/2:0),GY-6+hash(i+3)*4],k,cols,s);if(k>=1&&k<1.25)this.burst(g,T.x+3,GY-5,(k-1)*4,cols);}},
  burst(g,x,y,k,cols,n){if(k<0||k>1)return;for(let i=0;i<(n||8);i++){const a=i/(n||8)*TAU+hash(i)*.4,r=2+k*8;px(g,x+Math.cos(a)*r,y+Math.sin(a)*r*.7,cols[Math.min(cols.length-1,Math.floor(k*cols.length))],k<.5?2:1);}},
  beam(g,a,b,k,el,t,w0,w1){KIT.stream(g,a,b,k,el,t,w0||1.6,w1||7);},
  ring(g,x,y,r,c,flat){for(let i=0;i<36;i++){const a=i/36*TAU;px(g,x+Math.cos(a)*r,y+Math.sin(a)*r*(flat||.3),c);}},
  pillar(g,x,k,cols,w,top){if(k<=0||k>1.4)return;const h=(GY-(top||0))*Math.min(1,k*2.5),f=k>1?1-(k-1)/.4:1;for(let i=-w;i<=w;i++){g.globalAlpha=f;g.fillStyle=cols[Math.min(cols.length-1,Math.abs(i))];g.fillRect(Math.round(x+i),GY-h,1,h);}g.globalAlpha=1;},
  bolt(g,x,y0,y1,c,seed,w){let cx=x;const n=9,pts=[[x,y0]];for(let i=0;i<n;i++){const yb=lerp(y0,y1,(i+1)/n),nx=x+(hash(seed+i)-.5)*8;pts.push([nx,yb]);}
    g.globalAlpha=.35;for(let i=0;i<n;i++)line(g,pts[i][0]-1,pts[i][1],pts[i+1][0]-1,pts[i+1][1],c,3);g.globalAlpha=1;for(let i=0;i<n;i++)line(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],c,2);for(let i=0;i<n;i++)line(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],'#ffffff',1);
    if(hash(seed)>.4){const b=pts[4+(seed%3)];line(g,b[0],b[1],b[0]+(hash(seed+9)-.5)*10,b[1]+6,c,1);}},
  flash(g,a,c){if(a<=0)return;g.globalAlpha=Math.min(1,a);g.fillStyle=c||'#ffffff';g.fillRect(-24,0,120,72);g.globalAlpha=1;},
  dark(g,a,keep){if(a<=0)return;g.globalAlpha=Math.min(.85,a);g.fillStyle='#04060c';g.fillRect(-24,0,120,72);g.globalAlpha=1;if(keep)keep();},
  wave(g,x,h,cols){for(let i=0;i<34;i++){const xx=x+i,top=GY-h*Math.sin(clamp(i/34,0,1)*PI)*(1+.12*Math.sin(i))+(i<8?Math.max(0,8-i)*.6:0);for(let y=Math.round(top);y<GY;y++)px(g,xx,y,cols[y<top+2?0:y<top+5?1:2]);}},
  smoke(g,x,y,u,n,col){for(let i=0;i<(n||6);i++){const k=((u*.8+i/(n||6))%1);disc(g,x-k*10+Math.sin(i)*2,y-k*12,1+k*3,col||'#7a7a84');}},
  heal(g,x,y,u){for(let i=0;i<8;i++){const k=((u*.9+i/8)%1),xx=x+(hash(i)-.5)*30,yy=y-k*22;px(g,xx,yy,'#9af07a');px(g,xx-1,yy,'#9af07a');px(g,xx+1,yy,'#9af07a');px(g,xx,yy-1,'#9af07a');px(g,xx,yy+1,'#9af07a');}},
  rays(g,from,u,col){const to=[T.x+3,GY-6],len=Math.hypot(to[0]-from[0],to[1]-from[1])*Math.min(1,u*1.6),a=Math.atan2(to[1]-from[1],to[0]-from[0]);for(let s=0;s<len;s+=.6){const w=.6+s*.18;for(let j=-w;j<=w;j+=.7){g.globalAlpha=.25+.5*(1-Math.abs(j)/w);px(g,from[0]+Math.cos(a)*s-Math.sin(a)*j,from[1]+Math.sin(a)*s+Math.cos(a)*j,col);}}g.globalAlpha=1;
    disc(g,from[0],from[1],2+Math.sin(u*30),col);px(g,from[0],from[1],'#ffffff');for(let i=0;i<4;i++){const ang=i/4*TAU+u*4;line(g,from[0],from[1],from[0]+Math.cos(ang)*4,from[1]+Math.sin(ang)*4,'#ffffff');}},
  web(g,x,y,r,c){for(let i=0;i<6;i++){const a=i/6*TAU;line(g,x,y,x+Math.cos(a)*r,y+Math.sin(a)*r,c);}for(const rr of[r*.4,r*.8])this.ring(g,x,y,rr,c,1);},
  bubbles(g,from,u,n,col){for(let i=0;i<n;i++){const k=clamp((u-i*.15)/1.1,0,1);if(k<=0||k>=1)continue;const x=lerp(from[0],T.x+4,k),y=lerp(from[1],GY-6,k)-Math.sin(k*PI)*8;this.ring(g,x,y,2+hash(i)*1.5,col,1);px(g,x-1,y-1,'#ffffff');}},
  whirl(g,x,y,u,cols){for(let r=3;r<16;r+=3)for(let i=0;i<12;i++){const a=i/12*TAU+u*6/(r*.2);px(g,x+Math.cos(a)*r,y+Math.sin(a)*r*.32,cols[(r/3)%cols.length|0]);}},
  leaves(g,from,u,n,cols){for(let i=0;i<n*2;i++){const k=clamp((u-i*.03)/.9,0,1);if(k<=0||k>=1)continue;const x=lerp(from[0],T.x+2,k)+Math.sin(k*9+i)*4,y=lerp(from[1]+hash(i)*14-7,GY-6+hash(i+2)*6,k),a=k*12+i;
    for(let j=-2;j<=2;j++)px(g,x+Math.cos(a)*j,y+Math.sin(a)*j*.6,cols[(i+Math.abs(j))%cols.length],Math.abs(j)<2?2:1);}},
  rocks(g,from,u,n,col){for(let i=0;i<n;i++){const k=clamp((u-i*.1)/.8,0,1);if(k<=0||k>=1)continue;const x=lerp(from[0],T.x+3+hash(i)*6,k),y=lerp(from[1],GY-3,k)-Math.sin(k*PI)*14;disc(g,x,y,1+(i%2),col);}},
  shards(g,x,y,u,col){for(let i=0;i<6;i++){const a=PI+(-.6+i*.24),k=clamp(u,0,1),r=k*28;const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.5;line(g,xx,yy,xx-2,yy-4,col);line(g,xx,yy,xx+1,yy-3,col);}},
  ghost(g,img,x,y,s,a,tint){if(!img)return;const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const q=c.getContext('2d');q.drawImage(img,0,0);q.globalCompositeOperation='source-in';q.fillStyle=tint;q.fillRect(0,0,c.width,c.height);
    g.globalAlpha=a;g.imageSmoothingEnabled=false;g.drawImage(c,x,y,img.width*s,img.height*s);g.globalAlpha=1;},
  mound(g,x,u){for(let i=-9;i<=9;i++){const h=Math.round(6*Math.cos(i/9*PI/2)+Math.sin(u*20+i)*.6);for(let y=0;y<=h;y++)px(g,x+i,GY-y,y===h?'#5a3a1a':y===h-1?'#f2dca0':'#a8804a');}
    for(let i=0;i<8;i++){const k=(u*3+hash(i))%1;px(g,x+(hash(i+3)-.5)*20+k*6,GY-6-k*10,i%2?'#e8cc8a':'#a8804a',k<.5?2:1);}},
  snowball(g,a,b,k,r){if(k<0||k>1)return;const x=lerp(a[0],b[0],k),y=lerp(a[1],b[1],k)-Math.sin(k*PI)*16;disc(g,x,y,r,'#f4fbff');disc(g,x-1,y-1,r-2,'#ffffff');px(g,x+r-2,y+1,'#bfd8ea',2);},
};
// the target hunter: grabbed, stuck, slowed, knocked
function hunter(g,st){let x=T.x,y=GY;if(st.at){x=st.at[0]-2;y=st.at[1]+7;}if(st.knock)x-=st.knock*4,y-=Math.sin(st.knock*PI)*6;
  const c=st.hit?'#ffffff':st.slow?'#8a8aa0':st.stuck?'#c8c0e0':'#c8a26a';g.fillStyle='rgba(0,0,0,.3)';if(!st.at)g.fillRect(T.x-2,GY,9,1);
  g.fillStyle=c;g.fillRect(x+1,y-10,3,3);g.fillStyle=st.hit?'#ffffff':st.slow?'#6a6a80':'#8a5a3a';g.fillRect(x,y-7,5,4);g.fillStyle=st.hit?'#ffffff':'#4a4258';g.fillRect(x,y-3,2,3);g.fillRect(x+3,y-3,2,3);g.fillStyle=st.hit?'#fff':'#d4dcea';g.fillRect(x+5,y-12,1,7);}
const hitAt=(u,ts,w)=>ts.some(t=>u>=t&&u<t+(w||.12));
// ── the moves. keys: [time,{pose}] merged on the rest pose ('+n' is relative to rest). fx(g,u,F): F = {mouth, P, img, cx}
const K=(t,o)=>[t,o||{}];
const M={
fern:[{n:'LEAFSTORM',hits:[1.35,1.75,2.1],d:'Beats its leaf wings: three gusts of razor leaves. Dodge each.',len:2,keys:[K(0),K(.4,{tilt:.6,ws:1,wf:-.8,hr:-.6}),K(.6,{ws:.2,tilt:.35}),K(.9,{ws:1}),K(1.1,{ws:.2}),K(1.4,{ws:1}),K(1.6,{ws:.2}),K(2)],
    fx(g,u,F){FX.leaves(g,[F.mouth[0]+20,30],u-.5,8,['#5ab89a','#8ad86a','#2c7366']);FX.leaves(g,[F.mouth[0]+20,26],u-.9,8,['#8ad86a','#5ab89a']);FX.leaves(g,[F.mouth[0]+20,34],u-1.3,8,['#5ab89a','#d9c88e']);return{hit:hitAt(u,[1.35,1.75,2.1])};}},
  {n:'TAPROOT',hits:[1],d:'Plants its feet and draws strength from the earth. Hit it hard to break the heal.',len:2.6,keys:[K(0),K(.5,{py:44,tilt:.1,ws:.3,hr:-.2,l1:0,l2:0}),K(2.1,{py:44.5,tilt:.1,ws:.35}),K(2.6)],
    fx(g,u,F){if(u>.4&&u<2.2){for(let i=0;i<5;i++){const x=F.cx-14+i*6,h=4+Math.sin(u*3+i)*2;for(let y=0;y<h;y++)px(g,x+Math.sin(y*.8+i)*1.2,GY+1-y,'#6a4a2c');}FX.heal(g,F.cx,50,u);}return{};}}],
ember:[{n:'DRAGONFIRE',hits:[.9,1.2,1.5,1.8],d:'A long flame breath swept across the ground. Four hits, burns.',len:2.4,keys:[K(0),K(.5,{px:66,py:42,tilt:.25,n1:.15,hr:-.8,jaw:.2,ws:.4}),K(.7,{px:60,tilt:.05,n1:-.2,n2:-.3,hr:.0,jaw:.7,breath:.3}),K(1.3,{px:58,n1:-.45,n2:-.45,hr:.3,jaw:.7,breath:1}),K(1.9,{px:60,n1:-.1,n2:-.2,hr:-.2,jaw:.7,breath:1}),K(2.1,{breath:0,jaw:.2}),K(2.4)],
    fx(g,u,F){if(u>.7&&u<2){const sw=Math.sin((u-.7)*2.4)*14;FX.beam(g,F.mouth,[T.x+sw+4,GY-1],(u-.7)*2,'fire',u,2,9);}return{hit:hitAt(u,[.9,1.2,1.5,1.8])};}},
  {n:'HOARD RAGE',hits:[.5],d:'When low, it guards its hoard: a roar, and its next three attacks come faster.',len:1.8,keys:[K(0),K(.4,{px:68,tilt:.5,py:41,ws:1,wf:-.8,jaw:.8,hr:-.8,l1:10,l2:8}),K(1.2,{tilt:.5,ws:1,jaw:.8,l1:10,l2:8,shk:1}),K(1.8)],
    fx(g,u,F){if(u>.4&&u<1.3){for(let i=0;i<3;i++)FX.ring(g,F.mouth[0],F.mouth[1],(u-.4)*40-i*7,i?'#ff9a2e':'#ffd34d',1);g.globalAlpha=.25;g.fillStyle='#ff3a1a';g.fillRect(-24,0,120,72);g.globalAlpha=1;}return{knock:u>.5&&u<.9?(u-.5)/.4:0};}}],
rime:[{n:'RIME GALE',hits:[1],d:'One great wing beat of freezing wind.',len:1.6,keys:[K(0),K(.5,{tilt:.7,ws:1,wf:-.8,hr:-.7,py:39}),K(.7,{tilt:.2,ws:-.2,hr:0,py:42}),K(1.6)],
    fx(g,u,F){if(u>.6&&u<1.4){const k=(u-.6)/.7;for(let i=0;i<46;i++){const y=14+hash(i)*50,x=lerp(80,-30,k)+hash(i+5)*34,l=5+hash(i+2)*9;g.globalAlpha=.5+hash(i+8)*.5;line(g,x,y,x+l,y-l*.15,i%3?'#e8f8ff':'#bfeaff',hash(i+4)>.6?2:1);g.globalAlpha=1;if(i%4===0)disc(g,x-2,y+2,1,'#ffffff');}}return{hit:hitAt(u,[1]),stuck:u>1.05};}},
  {n:'ICICLE RAIN',hits:[.85,1.05,1.25,1.45,1.65],d:'Shakes the icicles from its wings: five quick falling hits.',len:2,keys:[K(0),K(.3,{ws:.9,wf:-.6,tilt:.55,shk:1}),K(1,{ws:.2,shk:1}),K(1.3,{ws:.9,shk:1}),K(2)],
    fx(g,u,F){for(let i=0;i<5;i++){const k=clamp((u-.5-i*.2)/.35,0,1);if(k<=0||k>=1)continue;const x=T.x+2+(i%3-1)*5,y=lerp(-6,GY-4,k);line(g,x,y-8,x,y,'#bfeaff',2);line(g,x,y-7,x,y-1,'#ffffff');px(g,x,y+1,'#e8f8ff');}return{hit:hitAt(u,[.85,1.05,1.25,1.45,1.65],.08)};}}],
volt:[{n:'COIL LIGHTNING',hits:[1.35,1.55],d:'Wraps itself in its wings and discharges: two paralysing hits.',len:1.8,keys:[K(0),K(.5,{ws:-.5,rear:.4,py:'-4'}),K(1.2,{ws:-.6,rear:.5,py:'-4',shk:1}),K(1.4,{ws:1}),K(1.8)],
    fx(g,u,F){if(u>.4&&u<1.3)for(let i=0;i<3;i++)FX.bolt(g,F.cx+hash(i+Math.floor(u*12))*30-15,20,46,'#fff6a0',i+Math.floor(u*9));if(u>1.3&&u<1.7){FX.bolt(g,T.x+3,0,GY,'#ffe14d',7,2);FX.flash(g,(1.7-u)*.8,'#fff6a0');}return{hit:hitAt(u,[1.35,1.55]),slow:u>1.5};}},
  {n:'SKY STRAFE',hits:[1.85],d:'Rises out of sight and strafes across the field. One heavy hit, a long warning.',len:2.4,keys:[K(0),K(.6,{py:'-50',fade:.3}),K(1.5,{py:'-50',px:'+60',fade:1}),K(1.8,{py:'0',px:'-70',fade:0}),K(2.1,{px:'-90',py:'0',fade:0}),K(2.4,{fade:0})],
    fx(g,u,F){if(u>.8&&u<1.7){const a=Math.sin(u*14)>0?1:0;if(a)line(g,0,GY-8,96,GY-8,'#ffe14d');}return{hit:hitAt(u,[1.85])};}}],
obsid:[{n:'THREE FIRES',hits:[1,1.4,1.8],d:'All three heads breathe in turn: left, middle, right. Three hits.',len:2.4,keys:[K(0),K(.5,{px:66,tilt:.2,n1:.1,hr:-.7,jaw:.2}),K(.7,{px:60,tilt:.02,n1:-.4,n2:-.4,hr:.1,jaw:.7,breath:.4}),K(1.9,{px:60,jaw:.7,breath:.4}),K(2.1,{jaw:.1,breath:0}),K(2.4)],
    fx(g,u,F){[[.8,-8],[1.2,0],[1.6,8]].forEach(([s,dy],i)=>{const k=(u-s)/.4;if(k>0&&k<1.1)FX.beam(g,[F.mouth[0]+[6,0,4][i],F.mouth[1]+dy-4],[T.x+4,GY-1],k,'fire',u,1.4,6);});return{hit:hitAt(u,[1,1.4,1.8])};}},
  {n:'HEAD SNAP',hits:[.62,.97],d:'The two side heads snap in turn. Break a head to lose a hit.',len:1.6,keys:[K(0),K(.4,{px:64,hr:-.5,jaw:.4}),K(.6,{px:54,hr:.2,jaw:.7,n1:-.5}),K(.75,{px:56,jaw:.1}),K(.95,{px:54,hr:.25,jaw:.7,n1:-.5}),K(1.1,{px:57,jaw:.1}),K(1.6)],
    fx(g,u,F){return{hit:hitAt(u,[.62,.97])};}}],
storm:[{n:'PEARL STORM',hits:[.9,1.2,1.5,1.8],d:'Spins its pearl and calls four bolts down on you. Paralyses.',len:2.4,keys:[K(0),K(.5,{rear:.9,py:'-6',hr:-.5,jaw:.3}),K(2,{rear:.9,py:'-8',jaw:.4}),K(2.4)],
    fx(g,u,F){if(u>.4&&u<2.1){const a=u*8;disc(g,F.mouth[0]+Math.cos(a)*5,F.mouth[1]-6+Math.sin(a)*3,3,'#fff6c8');}g.globalAlpha=clamp((u-.3)*2,0,.35)*(u<2.1?1:0);g.fillStyle='#1a1e3a';g.fillRect(-24,0,120,72);g.globalAlpha=1;
      for(let i=0;i<4;i++){const s=.9+i*.3;if(u>s-.25&&u<s){px(g,T.x+3+(i%2?4:-3),GY-1,'#ffe14d',2);}if(u>s&&u<s+.12)FX.bolt(g,T.x+3+(i%2?4:-3),0,GY,'#fff6a0',i*5,2);}return{hit:hitAt(u,[.9,1.2,1.5,1.8]),slow:u>1.9};}},
  {n:'CLOUD RIDE',hits:[1.55],d:'Fades into its clouds and reappears right beside you with a bite.',len:2.2,keys:[K(0),K(.6,{fade:1,py:'-10'}),K(1.3,{fade:1,px:'-40',py:'0'}),K(1.5,{fade:0,px:'-44',jaw:.7,hr:.2}),K(1.7,{px:'-46',jaw:0}),K(2.2,{fade:0})],
    fx(g,u,F){for(let i=0;i<6;i++){const k=clamp((u-.2)*1.4,0,1)*(u<1.6?1:0);if(k>0)disc(g,F.cx+hash(i)*40-20-(u>1?30:0),30+hash(i+2)*20,3+k*2,'#dfe4ff');}return{hit:hitAt(u,[1.55])};}}],
aurora:[{n:'PLUME VEIL',hits:[.9],d:'Spreads its feathered wings and blinds you with light: the next warning is shorter.',len:1.8,keys:[K(0),K(.5,{rear:.8,ws:1,py:'-4'}),K(1.3,{rear:.8,ws:1,py:'-4'}),K(1.8)],
    fx(g,u,F){if(u>.6&&u<1.4){FX.flash(g,Math.sin((u-.6)/.8*PI)*.8,'#f0e0ff');for(let i=0;i<8;i++){const a=i/8*TAU+u;line(g,F.cx,30,F.cx+Math.cos(a)*40,30+Math.sin(a)*30,'#e8f8ff');}}return{slow:u>.9};}},
  {n:'COIL CRUSH',hits:[.88],d:'Rears its whole body high and slams its coils down. One heavy hit.',len:1.8,keys:[K(0),K(.6,{rear:1.4,py:'-8',hr:-.6}),K(.85,{rear:-.4,py:'+4',hr:.3,jaw:.4}),K(1.2,{rear:-.3,shk:1}),K(1.8)],
    fx(g,u,F){if(u>.85&&u<1.3)FX.ring(g,T.x+10,GY,(u-.85)*50,'#bfeaff');return{hit:hitAt(u,[.88])};}}],
render:[{n:'JUDGEMENT',hits:[1.95],d:'Opens all four wings and calls a pillar of thunder. One huge hit, a very long warning.',len:2.8,keys:[K(0),K(.6,{tilt:.75,ws:1,wf:-.8,py:38,hr:-.9,jaw:.6}),K(2.2,{tilt:.75,ws:1,py:38,jaw:.7,shk:.6}),K(2.8)],
    fx(g,u,F){if(u>.6&&u<1.9){const k=(u-.6)/1.3;FX.ring(g,T.x+3,GY,8-k*5,Math.sin(u*20)>0?'#ffe14d':'#fff6a0');}if(u>1.9)FX.pillar(g,T.x+3,(u-1.9)/.6,['#ffffff','#fff6a0','#ffe14d','#a8b0ff'],3);if(u>1.9&&u<2.1)FX.flash(g,.7,'#fff6a0');return{hit:hitAt(u,[1.95],.3)};}},
  {n:'CROWN BOLTS',hits:[.62,.92,1.22],d:'Its crown crackles and fires three bolts at you.',len:1.8,keys:[K(0),K(.4,{tilt:.65,hr:-.7,ws:.4}),K(1.5,{tilt:.65,hr:-.7}),K(1.8)],
    fx(g,u,F){const c=[F.mouth[0]+4,F.mouth[1]-8];for(let i=0;i<3;i++){const s=.6+i*.3;if(u>s&&u<s+.14)KIT.stream(g,c,[T.x+3,GY-5],1,'thunder',u*7+i,1,4);if(u>s-.2&&u<s){disc(g,c[0],c[1],2+(u-s+.2)*8,'#fff6a0');FX.burst(g,c[0],c[1],(u-s+.2)*5,['#ffe14d','#ffffff']);}}return{hit:hitAt(u,[.62,.92,1.22])};}}],
star:[{n:'STARFALL',hits:[1.1,1.35,1.6,1.85,2.1],d:'The elder\'s own: stars rain down across the field.',len:2.4,keys:[K(0),K(.5,{tilt:.45,ws:1,wf:-.8,hr:-.8,jaw:.5,l1:10,l2:8}),K(2,{tilt:.45,ws:1,l1:10,l2:8}),K(2.4)],
    fx(g,u,F){for(let i=0;i<5;i++){const k=clamp((u-.7-i*.25)/.4,0,1);if(k>0&&k<1){const x=T.x+i*4-6+k*10,y=lerp(-4,GY-3,k);g.globalAlpha=.45;line(g,x-12,y-12,x,y,'#8a7ad8',3);g.globalAlpha=1;line(g,x-8,y-8,x,y,'#c8b8ff',2);disc(g,x,y,2,'#e0d4ff');px(g,x,y,'#ffffff');}else if(k>=1&&k<1.4)FX.burst(g,T.x+i*4+4,GY-2,(k-1)/.4,['#ffffff','#c8b8ff','#8a7ad8'],10);}return{hit:hitAt(u,[1.1,1.35,1.6,1.85,2.1],.08)};}},
  {n:'ECLIPSE',hits:[2.15],d:'The sky goes dark and it crashes down. One huge hit.',len:2.8,keys:[K(0),K(.8,{tilt:.5,ws:1,lift:30,fade:.2}),K(1.9,{lift:36,fade:.6}),K(2.15,{lift:0,fade:0,shk:1}),K(2.8)],
    fx(g,u,F){FX.dark(g,u<2.2?clamp(u-.3,0,.8):clamp(2.6-u,0,.8));if(u>2.15&&u<2.6)FX.ring(g,F.cx,GY,(u-2.15)*90,'#c8b8ff');return{hit:hitAt(u,[2.15])};}}],
tusk:[{n:'BRISTLE RUSH',hits:[.75,1.95],d:'Charges, skids, backs off and charges again. Two heavy hits.',len:2.4,keys:[K(0),K(.4,{px:56,tilt:-.08,hr:.5,bri:1,bl2:3}),K(.78,{px:10,bri:1,fl1:4,bl2:4}),K(1,{px:6,tilt:.12,hr:-.3,bri:1}),K(1.35,{px:66,tilt:-.1,fl1:3,bri:.6}),K(1.6,{px:60,tilt:-.08,hr:.5,bri:1,bl2:3}),K(1.95,{px:10,bri:1,fl1:4,bl2:4}),K(2.15,{px:12,tilt:.1,hr:-.2}),K(2.4,{px:50})],
    fx(g,u,F){if(u>.4&&u<2.2)FX.smoke(g,F.cx+20,GY-2,u,4,'#c8a878');return{hit:hitAt(u,[.75,1.95]),knock:u>.75&&u<1.1?(u-.75)/.35:0};}},
  {n:'ROOT OUT',hits:[1.3,1.4],d:'Rips up the ground with its tusks and flings the rocks.',len:1.8,keys:[K(0),K(.5,{px:46,tilt:-.15,hr:.7,bri:.5}),K(.75,{px:48,tilt:.12,hr:-.6,jaw:.3,fl1:4}),K(1.8)],
    fx(g,u,F){FX.rocks(g,[F.mouth[0],GY-4],u-.75,4,'#8a6a48');return{hit:hitAt(u,[1.3,1.4])};}}],
thorn:[{n:'SHELL SPIN',hits:[1.25,1.45,1.65],d:'Tucks into a ball of thorns and rolls through you. Three hits.',keys:[K(0),K(.3,{tuck:.45,hr:-.4}),K(.42,{tuck:1,roll:0}),K(.7,{tuck:1,roll:-2}),K(1.7,{tuck:1,roll:-TAU*3,px:6}),K(2,{tuck:1,roll:-TAU*3-1,px:24}),K(2.15,{tuck:.45,px:30}),K(2.4,{tuck:0,px:50})],len:2.4,
    fx(g,u,F){return{hit:hitAt(u,[1.25,1.45,1.65]),knock:u>1.65&&u<2?(u-1.65)/.35:0};}},
  {n:'STING TAIL',hits:[.62],d:'Its scaly tail whips over its shell and stings. Poisons.',len:1.4,keys:[K(0),K(.4,{tb:.9,px:53}),K(.6,{tb:2.6,px:46}),K(1.4)],
    fx(g,u,F){if(u>.6&&u<.9)FX.burst(g,T.x+3,GY-6,(u-.6)*3,['#c8f08a','#7ac85a']);return{hit:hitAt(u,[.62])};}}],
cinder:[{n:'BRONZE CHARGE',hits:[.95],d:'Lowers its bronze horns and charges. One heavy hit, burns.',len:1.8,keys:[K(0),K(.6,{px:56,tilt:-.1,hr:.5,fl1:3,shk:.5}),K(1,{px:16,tilt:-.08,hr:.5,fl2:4,bl1:3}),K(1.8,{px:50})],
    fx(g,u,F){if(u>.2&&u<.6)for(let i=0;i<3;i++)px(g,F.cx+20+i*3,GY-1-hash(i+u*9)*3,'#c8a878');if(u>.6&&u<1.1)for(let i=0;i<8;i++)px(g,F.cx+10+i*4,GY-3-hash(i)*8,i%2?'#ff9a3a':'#ffd34d');return{hit:hitAt(u,[.95])};}},
  {n:'SMOKE SNORT',hits:[.8],d:'Snorts a cloud of smoke: its next attack has sound but no warning flash.',len:1.6,keys:[K(0),K(.5,{hr:-.3,jaw:.2,tilt:.1}),K(.7,{hr:.25,jaw:0}),K(1.6)],
    fx(g,u,F){if(u>.6){for(let i=0;i<10;i++){const k=clamp(u-.6,0,1),x=lerp(F.mouth[0],T.x+hash(i)*20,k),y=GY-14+hash(i+4)*12;disc(g,x,y,2+k*3,i%2?'#6a6a74':'#8a8a90');}}return{slow:u>1};}}],
frost:[{n:'AVALANCHE SLAM',hits:[.75,1.25],d:'Raises both fists and slams. Two heavy hits, freezes.',len:2,keys:[K(0),K(.5,{fl1:10,fl2:12,py:36,tilt:.1}),K(.7,{fl1:0,fl2:0,py:41,shk:1}),K(1,{fl1:10,fl2:12,py:37}),K(1.2,{fl1:0,fl2:0,py:41,shk:1}),K(2)],
    fx(g,u,F){for(const s of[.7,1.2])if(u>s&&u<s+.5){FX.ring(g,F.cx-14,GY,(u-s)*50,'#bfeaff');for(let i=0;i<6;i++)px(g,F.cx-14-(u-s)*40+i*3,GY-1-hash(i)*3,'#e8f8ff',2);}return{hit:hitAt(u,[.75,1.25]),stuck:u>1.4};}},
  {n:'SNOWBALL',hits:[1.4],d:'Packs and hurls a huge snowball.',len:1.8,keys:[K(0),K(.6,{fl2:14,tilt:.2,py:37}),K(.8,{fl2:4,tilt:-.05,py:41}),K(1.8)],
    fx(g,u,F){if(u<.8)disc(g,F.cx-4,30,3+u*4,'#f4fbff');FX.snowball(g,[F.cx-8,30],[T.x+3,GY-5],(u-.8)/.6,5);if(u>1.4&&u<1.7)FX.burst(g,T.x+3,GY-5,(u-1.4)*3,['#ffffff','#bfeaff']);return{hit:hitAt(u,[1.4])};}}],
icehide:[{n:'TRUNK TOSS',hits:[.6],d:'Grabs you with its trunk and throws you. Mash to break free.',len:2.4,keys:[K(0),K(.4,{px:44,trunk:-.4,hr:.25}),K(.6,{px:38,trunk:-.5,hr:.3}),K(1.4,{px:42,trunk:1.6,hr:-.5,tilt:.15}),K(1.7,{trunk:-.2,hr:.2}),K(2.4)],
    fx(g,u,F){if(u>.6&&u<1.6)return{at:F.mouth};return{knock:u>1.6&&u<2.1?(u-1.6)/.5:0,hit:hitAt(u,[2])};}},
  {n:'TUSK SWEEP',hits:[.6,1.05],d:'Swings its great ice tusks side to side. Two hits.',len:1.6,keys:[K(0),K(.4,{hr:.6,px:46}),K(.6,{hr:-.5,px:42}),K(.85,{hr:.6}),K(1.05,{hr:-.5}),K(1.6)],
    fx(g,u,F){if(u>.5&&u<1.1)for(let i=0;i<4;i++)px(g,F.mouth[0]-4+i*2,F.mouth[1]+Math.sin(u*20+i)*4,'#e8f8ff');return{hit:hitAt(u,[.6,1.05])};}}],
ruin:[{n:'RUNE CHARGE',hits:[1.55],d:'Its runes flare one by one, then it charges through. One huge hit.',len:2.4,keys:[K(0),K(1.2,{px:56,tilt:-.08,hr:.5,shk:.6}),K(1.6,{px:10,hr:.6,fl1:4,bl2:4}),K(2.4,{px:50})],
    fx(g,u,F){for(let i=0;i<6;i++)if(u>.2+i*.15&&u<1.6)disc(g,F.cx-8+i*5,F.cy-6,1,'#ff5aa0');if(u>1.2&&u<1.7)for(let i=0;i<10;i++)px(g,F.cx+i*3,F.cy-10+hash(i)*14,'#ff7ab0');return{hit:hitAt(u,[1.55]),knock:u>1.55&&u<1.95?(u-1.55)/.4:0};}},
  {n:'STONE QUAKE',hits:[.9,1.2],d:'Rears and stamps: a ring of rubble bursts out. Two hits.',len:1.8,keys:[K(0),K(.5,{tilt:.4,py:36,fl1:12,fl2:10}),K(.7,{tilt:-.05,py:41,fl1:0,fl2:0,shk:1}),K(1.8)],
    fx(g,u,F){if(u>.7){FX.ring(g,F.cx-10,GY,(u-.7)*40,'#9a90a0');FX.rocks(g,[F.cx-10,GY-2],u-.7,5,'#6a6070');}return{hit:hitAt(u,[.9,1.2])};}}],
gloom:[{n:'SHADOW HOWL',hits:[1.5,1.95],d:'Howls, and two shadow wolves rush you one after another.',len:2.4,keys:[K(0),K(.4,{tilt:.25,hr:-1.1,jaw:.6}),K(1.2,{tilt:.25,hr:-1.1,jaw:.6}),K(1.5,{jaw:0}),K(2.4)],
    fx(g,u,F){if(u>.4&&u<1.3)for(let i=0;i<3;i++)FX.ring(g,F.mouth[0],F.mouth[1],(u-.4)*30-i*6,'#e0508a',1);for(let i=0;i<2;i++){const k=(u-1-i*.45)/.6;if(k>0&&k<1){const x=lerp(70,-40,k);for(let tr=2;tr>=0;tr--)FX.ghost(g,F.img,x+tr*7,28,.55,tr?.25:.9,'#22102e');px(g,x+10,36,'#ff6ab0',2);}}return{hit:hitAt(u,[1.5,1.95])};}},
  {n:'BIND BREAKER',hits:[.6],d:'When low, it breaks loose of its bonds: twice the speed for a while.',len:1.8,keys:[K(0),K(.5,{tilt:.2,hr:-.8,jaw:.5,shk:1}),K(1,{tilt:.2,shk:1}),K(1.8)],
    fx(g,u,F){if(u>.5&&u<1.1)for(let i=0;i<6;i++){const a=i/6*TAU,r=8+(u-.5)*30;line(g,F.cx+Math.cos(a)*r,F.cy+Math.sin(a)*r*.6,F.cx+Math.cos(a)*(r+3),F.cy+Math.sin(a)*(r+3)*.6,'#d8d0c8');}if(u>1)FX.ghost(g,F.img,F.ox+6,F.oy,1,.35,'#ff6ab0');return{};}}],
mud:[{n:'CRUSHER GRIP',hits:[.75],d:'Grabs you in its crusher. Mash to escape or take a heavy squeeze.',len:2.4,keys:[K(0),K(.4,{reachF:-2,raiseN:.6,cN:.7}),K(.6,{px:44,raiseN:-.1,cN:.6}),K(.75,{cN:0}),K(1.8,{px:46,raiseN:.5,cN:0,shk:.5}),K(2,{cN:.8}),K(2.4)],
    fx(g,u,F){if(u>.7&&u<2)return{at:[F.claw?F.claw[0]:20,40+Math.sin(u*6)*2]};return{knock:u>2&&u<2.4?(u-2)/.4:0};}},
  {n:'MUD BUBBLES',hits:[1.3,1.45,1.6],d:'Blows three bubbles of mud that slow you.',len:2,keys:[K(0),K(.4,{eye:1,py:44}),K(1.6,{py:44}),K(2)],
    fx(g,u,F){FX.bubbles(g,[F.cx-18,42],u-.3,3,'#8a6a44');return{hit:hitAt(u,[1.3,1.45,1.6]),slow:u>1.4};}}],
shell:[{n:'SHELL BUNKER',hits:[.4],d:'Hides in its conch: nearly no damage for three seconds, then it bursts out.',len:3,keys:[K(0),K(.4,{sink:14,cN:.6,cF:.6,raiseN:-.4}),K(2.4,{sink:14,shk:.3}),K(2.6,{sink:0,py:40,raiseN:1,cN:.8}),K(3)],
    fx(g,u,F){if(u>.5&&u<2.4&&Math.sin(u*8)>0)for(let i=0;i<5;i++)px(g,F.cx+(i-2)*6,26,'#ffffff');if(u>2.4&&u<2.8)FX.burst(g,F.cx,40,(u-2.4)*2.5,['#7fd6ff','#ffffff'],12);return{};}},
  {n:'CONCH CANNON',hits:[1.05,1.3],d:'Turns its spiral conch toward you and blasts a jet of water through it. Soaks.',len:2,keys:[K(0),K(.5,{tilt:.25,py:44,shk:.4}),K(1.5,{tilt:.25,py:44}),K(2)],
    fx(g,u,F){const o=[F.cx+4,F.cy-14];if(u>.3&&u<.8)FX.whirl(g,o[0],o[1],u,['#7fd6ff','#ffffff']);if(u>.8&&u<1.6)FX.beam(g,o,[T.x+4,GY-4],(u-.8)*3,'water',u,2,6);return{hit:hitAt(u,[1.05,1.3]),slow:u>1.2};}}],
sting:[{n:'PIN AND STING',hits:[.62,1.32],d:'Pins you with its pincers, then stings. Poisons.',len:2.2,keys:[K(0),K(.4,{reachF:-2,cF:.7,cN:.7}),K(.6,{px:46,reachF:10,cF:0,cN:0}),K(1.1,{stab:-.3}),K(1.3,{stab:1.2}),K(1.6,{stab:1}),K(2.2)],
    fx(g,u,F){if(u>1.3&&u<1.6)FX.burst(g,T.x+3,GY-6,(u-1.3)*3,['#c8f08a','#7a4a8a']);return{stuck:u>.6&&u<1.6,hit:hitAt(u,[1.32]),slow:u>1.4};}},
  {n:'TAIL BARRAGE',hits:[.45,.75,1.05,1.35],d:'Four stings in a blur.',len:1.8,keys:[K(0),K(.3,{stab:-.4}),K(.45,{stab:1}),K(.6,{stab:-.2}),K(.75,{stab:1}),K(.9,{stab:-.2}),K(1.05,{stab:1}),K(1.2,{stab:-.2}),K(1.35,{stab:1}),K(1.8)],
    fx(g,u,F){return{hit:hitAt(u,[.45,.75,1.05,1.35],.08)};}}],
magma:[{n:'STILT STOMP',hits:[1.1],d:'Its long legs stamp in a line toward you. Four hits.',len:2,keys:[K(0),K(.3,{lw:1,py:44}),K(.5,{lw:-1}),K(.7,{lw:1}),K(.9,{lw:-1}),K(1.1,{lw:1}),K(2)],
    fx(g,u,F){for(let i=0;i<4;i++){const s=.5+i*.2;if(u>s&&u<s+.4){const x=F.cx-12-i*10;FX.ring(g,x,GY,(u-s)*20,'#ff8a2e');px(g,x,GY-2,'#ffd34d',2);}}return{hit:hitAt(u,[1.1])};}},
  {n:'VENT BURST',hits:[1.5],d:'The vents on its shell erupt in a shower of magma. Burns.',len:2,keys:[K(0),K(.5,{py:48,shk:1}),K(.8,{py:44}),K(2)],
    fx(g,u,F){if(u>.7){for(let i=0;i<10;i++){const k=clamp((u-.7-i*.03)/.9,0,1);if(k<=0||k>=1)continue;const x=lerp(F.cx,T.x+hash(i)*30,k),y=lerp(30,GY-2,k)-Math.sin(k*PI)*24;px(g,x,y,i%2?'#ff8a2e':'#ffd34d',2);}}return{hit:hitAt(u,[1.5])};}}],
cryst:[{n:'CRYSTAL SHARDS',hits:[1.4,1.55,1.7],d:'Shakes crystals off its shell: a ring of shards, three hits.',len:2,keys:[K(0),K(.4,{shk:1,py:47}),K(1,{shk:1}),K(1.2,{py:46}),K(2)],
    fx(g,u,F){if(u>1)FX.shards(g,F.cx-6,GY-4,(u-1)/.8,'#bfeaff');return{hit:hitAt(u,[1.4,1.55,1.7],.06)};}},
  {n:'TELSON FLIP',hits:[.62],d:'Flips its long tail spike over its back at you.',len:1.4,keys:[K(0),K(.4,{stab:-.6}),K(.6,{stab:2.4}),K(1.4)],
    fx(g,u,F){return{hit:hitAt(u,[.62])};}}],
dusk:[{n:'WEB SNARE',hits:[1.2],d:'Spits a web. If it lands you are stuck for a moment.',len:2.2,keys:[K(0),K(.5,{raiseN:-.4,reachF:-2}),K(.7,{raiseN:.3,reachF:4}),K(2.2)],
    fx(g,u,F){const k=(u-.7)/.5;if(k>0&&k<1)FX.proj(g,[F.mouth[0],F.mouth[1],4],[T.x+3,GY-6],k,['#e8e0f0','#c8c0e0'],2);if(u>1.2)FX.web(g,T.x+3,GY-6,7,'#e8e0f0');return{stuck:u>1.2,hit:hitAt(u,[1.2])};}},
  {n:'ONI GORE',hits:[.62,1.12],d:'Charges horns first, then its scythe. Two hits.',len:1.8,keys:[K(0),K(.4,{px:56,reachF:-3}),K(.6,{px:44,reachF:6,raiseN:.2}),K(.9,{stab:-.4}),K(1.1,{stab:1.2}),K(1.8)],
    fx(g,u,F){return{hit:hitAt(u,[.62,1.12])};}}],
pyre:[{n:'PYRE CROWN',hits:[1.1,1.4],d:'Its crown of flame flares into a pillar. Two heavy hits, burns.',len:2,keys:[K(0),K(.5,{py:48,shk:.6}),K(.8,{py:44}),K(1.6,{py:44}),K(2)],
    fx(g,u,F){if(u>.8){FX.pillar(g,F.cx,(u-.8)/.8,['#fff2a0','#ffd34d','#ff9a2e','#e2483d'],4,0);FX.ring(g,F.cx,GY,(u-.8)*40,'#ff9a2e');}return{hit:hitAt(u,[1.1,1.4])};}},
  {n:'EMBER CLAW',hits:[.6],d:'A burning swing of its crusher.',len:1.4,keys:[K(0),K(.4,{raiseN:1.1,cN:.6}),K(.6,{raiseN:-.3,px:47,cN:0}),K(1.4)],
    fx(g,u,F){if(u>.55&&u<.9)for(let i=0;i<8;i++)px(g,F.cx-26+i*2,GY-8-Math.sin(i*.6)*8,i%2?'#ff9a2e':'#ffd34d',2);return{hit:hitAt(u,[.6])};}}],
tide:[{n:'WHIRLPOOL',hits:[1,1.3,1.6],d:'Coils and spins the sea into a whirlpool. Three hits, soaks.',len:2.2,keys:[K(0),K(.5,{coil:1,rise:2}),K(1.8,{coil:1,rise:2,sway:2}),K(2.2)],
    fx(g,u,F){if(u>.5&&u<2)FX.whirl(g,T.x+8,GY-2,u,['#7fd6ff','#3a9ae0','#bff0ff']);return{hit:hitAt(u,[1,1.3,1.6]),slow:u>1.1};}},
  {n:'BREACH',hits:[1.55],d:'Dives under and bursts up beneath you.',len:2.4,keys:[K(0),K(.6,{sink:40,lean:.5}),K(1.4,{sink:40,dx:-24}),K(1.6,{sink:6,dx:-24,rise:6,lean:-.6,jaw:.8}),K(2,{sink:40,dx:-24}),K(2.05,{sink:40,dx:0}),K(2.4,{sink:0})],
    fx(g,u,F){if(u>.8&&u<1.5){const x=T.x+3+(1.5-u)*20;for(let i=0;i<5;i++)px(g,x+i*2,GY-1,'#bff0ff');}if(u>1.5&&u<1.9)FX.burst(g,T.x+4,GY-4,(u-1.5)*2.5,['#ffffff','#7fd6ff'],14);return{hit:hitAt(u,[1.55]),knock:u>1.55&&u<1.95?(u-1.55)/.4:0};}}],
bog:[{n:'PETRIFYING GLARE',hits:[1.9],d:'A long stare. Dodge before it ends or you are slowed.',len:2.4,keys:[K(0),K(.5,{rise:6,lean:-.3,hr:-.2}),K(2,{rise:6,lean:-.3,hr:-.2,shk:.3}),K(2.4)],
    fx(g,u,F){if(u>.6&&u<2){FX.rays(g,[F.eye?F.eye[0]:F.mouth[0],F.eye?F.eye[1]:F.mouth[1]-4],(u-.6)/1.4,Math.sin(u*16)>0?'#ffe14d':'#fff6a0');}return{slow:u>1.9};}},
  {n:'CROWNED STRIKE',hits:[.46],d:'A lightning-fast fang strike. Poisons.',len:1.2,keys:[K(0),K(.35,{rise:5,lean:-.5,jaw:.3}),K(.45,{rise:-2,lean:1,jaw:.8}),K(.6,{jaw:0}),K(1.2)],
    fx(g,u,F){return{hit:hitAt(u,[.46]),slow:u>.5};}}],
eel:[{n:'BURROW',hits:[2],d:'Sinks into the sand. A moving mound shows where it is, then it bursts up under you.',len:3.2,keys:[K(0),K(.6,{sink:50}),K(1.8,{sink:50,dx:-26}),K(2,{sink:2,dx:-26,rise:6,jaw:1}),K(2.6,{sink:2,dx:-26,rise:5,jaw:.6}),K(2.9,{sink:50,dx:-26}),K(2.95,{sink:50,dx:0}),K(3.2,{sink:0})],
    fx(g,u,F){if(u>.6&&u<2)FX.mound(g,lerp(70,T.x+3,clamp((u-.7)/1.1,0,1)),u);if(u>1.95&&u<2.3)FX.rocks(g,[T.x+3,GY-2],(u-1.95)*1.5,5,'#c9a05a');return{hit:hitAt(u,[2]),knock:u>2&&u<2.4?(u-2)/.4:0};}},
  {n:'ACID SPRAY',hits:[1,1.3],d:'Sprays acid from its round mouth. Two hits.',len:1.8,keys:[K(0),K(.4,{rise:4,jaw:.4}),K(.6,{rise:1,lean:.5,jaw:1}),K(1.4,{jaw:1}),K(1.8)],
    fx(g,u,F){if(u>.6&&u<1.5)KIT.stream(g,F.mouth,[T.x+4,GY-2],(u-.6)*2.5,'poison',u,1.2,5);return{hit:hitAt(u,[1,1.3])};}}],
mire:[{n:'MANY HEADS',hits:[.6,.75,.9,1.05,1.4],d:'The heads bite in a chain: one hit for every head still attached.',len:2.2,keys:[K(0),K(.4,{rise:2,lean:-.4}),K(.6,{lean:1,jaw:.7}),K(.8,{lean:.2,jaw:0}),K(1,{lean:1,jaw:.7}),K(1.2,{lean:.2}),K(1.4,{lean:1,jaw:.7}),K(2.2)],
    fx(g,u,F){return{hit:hitAt(u,[.6,.75,.9,1.05,1.4],.07)};}},
  {n:'REGROWTH',hits:[1.2],d:'A severed head regrows unless you keep hitting the stump.',len:2.4,keys:[K(0),K(.4,{shk:.6,sway:2}),K(2,{sway:2}),K(2.4)],brk:{head:1},regrow:1.2,
    fx(g,u,F){if(u>.3&&u<1.6)FX.heal(g,F.cx-16,40,u);return{};}}],
abyss:[{n:'LURE',hits:[1.88],d:'Dims everything but its lure, then strikes from the dark with a short warning.',len:2.4,keys:[K(0),K(.5,{rise:2,sway:0}),K(1.7,{rise:2}),K(1.85,{rise:-1,lean:1,jaw:.8}),K(2,{jaw:0}),K(2.4)],
    fx(g,u,F){FX.dark(g,u<1.9?clamp(u-.3,0,.85):clamp(2.3-u,0,.85),()=>{if(F.lure)disc(g,F.lure[0],F.lure[1],2+Math.sin(u*6),'#7fd6ff');});return{hit:hitAt(u,[1.88])};}},
  {n:'ABYSS PULL',hits:[1.8],d:'A deep current drags you closer to its jaws.',len:2.2,keys:[K(0),K(.4,{jaw:.6,rise:2}),K(1.8,{jaw:.6,rise:2}),K(2.2)],
    fx(g,u,F){if(u>.4&&u<1.9)for(let i=0;i<8;i++){const x=((u*40+i*12)%60)+4;line(g,F.mouth[0]-x,GY-6-hash(i)*20,F.mouth[0]-x+5,GY-6-hash(i)*20,'#3a6ab0');}return{at:u>.6&&u<1.9?[lerp(T.x+2,30,clamp((u-.6)/1.2,0,1)),GY-7]:null};}}],
reaver:[{n:'TIDAL WAVE',hits:[2],d:'Rears and brings a huge wave down. One heavy hit, long warning.',len:2.6,keys:[K(0),K(.8,{rise:9,lean:-.6,hr:-.5}),K(1.6,{rise:-4,lean:.7,whip:1}),K(2.6)],
    fx(g,u,F){if(u>1.3&&u<2.5){const x=lerp(80,-50,(u-1.3)/1.2);FX.wave(g,x,26,['#ffffff','#4cc9ff','#1e5a8a']);FX.wave(g,x+16,18,['#e8f8ff','#7fd6ff','#2a6aa0']);for(let i=0;i<10;i++)px(g,x+hash(i)*30,GY-26-hash(i+2)*8,'#ffffff',2);}return{hit:hitAt(u,[2])};}},
  {n:'BLADE FINS',hits:[.62,1.12],d:'Spins so its glowing blade fins slash. Two hits.',len:1.8,keys:[K(0),K(.4,{coil:1,sway:0}),K(.6,{coil:-.6,whip:1}),K(.9,{coil:1}),K(1.1,{coil:-.6,whip:1}),K(1.8)],
    fx(g,u,F){for(const s of[.6,1.1])if(u>s&&u<s+.2)for(let i=0;i<10;i++)px(g,10+i*5,GY-10-Math.sin(i*.6)*10,'#4cc9ff');return{hit:hitAt(u,[.62,1.12])};}}],
quill:[{n:'BRONZE VOLLEY',hits:[.95,1.1,1.25,1.4,1.55],d:'Shakes its bronze feathers loose and fires them. Five quick hits.',len:2.2,keys:[K(0),K(.4,{arm:1,crest:1,tilt:.1}),K(.6,{arm:.3,shk:.5}),K(1.6,{arm:.4}),K(2.2)],
    fx(g,u,F){for(let i=0;i<5;i++){const k=(u-.6-i*.15)/.35;if(k>0&&k<1){const x=lerp(F.cx,T.x+3,k),y=lerp(30,GY-6,k),a=Math.atan2(GY-36,T.x+3-F.cx);g.globalAlpha=.4;line(g,x,y,x-Math.cos(a)*10,y-Math.sin(a)*10,'#ffd34d',3);g.globalAlpha=1;line(g,x,y,x-Math.cos(a)*7,y-Math.sin(a)*7,'#b08a4a',2);px(g,x,y,'#fff2c0',2);}}return{hit:hitAt(u,[.95,1.1,1.25,1.4,1.55],.06)};}},
  {n:'SPEAR BEAK',hits:[.46],d:'One lightning-fast stab of its spear beak.',len:1.2,keys:[K(0),K(.35,{px:62,n1:.1,hr:-.2,crest:1}),K(.45,{px:46,n1:-.7,n2:-.5,hr:-1.2,tilt:.4}),K(1.2)],
    fx(g,u,F){if(u>.44&&u<.5)line(g,F.mouth[0],F.mouth[1],T.x+5,GY-6,'#ffe0a0');return{hit:hitAt(u,[.46])};}}],
dust:[{n:'STONE GAZE',hits:[1.2],d:'Locks eyes with you. A short glare that slows you.',len:1.8,keys:[K(0),K(.4,{crest:1,hr:-.4,n1:-.3}),K(1.3,{crest:1,hr:-.4}),K(1.8)],
    fx(g,u,F){if(u>.5&&u<1.3)FX.rays(g,[F.mouth[0]+2,F.mouth[1]-2],(u-.5)/.8,'#e8c060');return{slow:u>1.2};}},
  {n:'SPUR KICK',hits:[.7,.9],d:'Leaps and kicks twice with its spurs.',len:1.6,keys:[K(0),K(.3,{crouch:1}),K(.5,{px:40,lift:9,fl:10,fr:6,crouch:0,arm:1}),K(.7,{lift:9,fr:12,fl:4}),K(.9,{lift:9,fl:12,fr:4}),K(1.1,{px:44,lift:0}),K(1.6)],
    fx(g,u,F){return{hit:hitAt(u,[.7,.9])};}}],
gust:[{n:'THUNDERCLAP',hits:[.85],d:'Claps its great wings together: a ring of lightning. Paralyses.',len:1.8,keys:[K(0),K(.5,{arm:1.3,crest:1,py:35}),K(.7,{arm:-.2,py:39}),K(1.8)],
    fx(g,u,F){if(u>.7&&u<1.3){FX.ring(g,F.cx,40,(u-.7)*70,'#ffe14d',.8);FX.flash(g,(1-(u-.7)*3)*.4,'#fff6a0');}return{hit:hitAt(u,[.85]),slow:u>.9};}},
  {n:'STORM WING',hits:[1.5],d:'Three bolts follow you across the ground.',len:2.2,keys:[K(0),K(.4,{arm:1.2,beak:.4}),K(1.8,{arm:1.2}),K(2.2)],
    fx(g,u,F){for(let i=0;i<3;i++){const s=.8+i*.35,x=T.x+3+(2-i)*8;if(u>s-.3&&u<s)px(g,x,GY-1,'#ffe14d',2);if(u>s&&u<s+.1)FX.bolt(g,x,0,GY,'#fff6a0',i*3,2);}return{hit:hitAt(u,[1.5])};}}],
plume:[{n:'REBIRTH',hits:[1.4],d:'Once a hunt, when low, it bursts into light and heals.',len:2.6,keys:[K(0),K(.6,{arm:1.2,crest:1,py:36}),K(2,{arm:1.2,py:34}),K(2.6)],
    fx(g,u,F){if(u>.6&&u<2.2){FX.flash(g,Math.sin((u-.6)/1.6*PI)*.6,'#ffd0a0');for(let i=0;i<10;i++){const a=i/10*TAU+u*2;flameDot(g,F.cx+Math.cos(a)*18,36+Math.sin(a)*14);}FX.heal(g,F.cx,50,u);}return{};}},
  {n:'STREAMER LASH',hits:[.6,1,1.4],d:'Its long tail streamers whip around. Three hits.',len:1.8,keys:[K(0),K(.4,{tb:-.6}),K(.6,{tb:1.6}),K(.8,{tb:-.4}),K(1,{tb:1.8}),K(1.2,{tb:-.2}),K(1.4,{tb:1.6}),K(1.8)],
    fx(g,u,F){return{hit:hitAt(u,[.6,1,1.4],.08)};}}],
dread:[{n:'GRIFFIN DIVE',hits:[1.8],d:'Soars up out of sight, then dives on you with its talons.',len:2.4,keys:[K(0),K(.6,{lift:50,arm:1.2,fade:.2}),K(1.5,{lift:50,fade:.6}),K(1.8,{lift:8,px:30,arm:.4,fade:0,fl:6,fr:6}),K(2,{lift:0,px:36}),K(2.4)],
    fx(g,u,F){if(u>.8&&u<1.7){const r=4+Math.sin(u*10);g.globalAlpha=.4;disc(g,T.x+3,GY,r,'#000');g.globalAlpha=1;}return{hit:hitAt(u,[1.8])};}},
  {n:'LION POUNCE',hits:[.7,1],d:'Springs on its lion legs and rakes twice.',len:1.6,keys:[K(0),K(.35,{crouch:1,px:62}),K(.6,{px:38,lift:8,crouch:0,fl:8,fr:8}),K(.8,{px:36,lift:0}),K(1,{px:38,beak:.6}),K(1.6)],
    fx(g,u,F){return{hit:hitAt(u,[.7,1])};}}],
temp:[{n:'ROC GRAB',hits:[.75],d:'Snatches you up and drops you from a height. Mash to break free.',len:2.6,keys:[K(0),K(.4,{crouch:1,arm:1}),K(.7,{px:30,lift:10,arm:1.2,fl:10,fr:10}),K(1.7,{px:40,lift:34,arm:1.2,fl:10,fr:10}),K(2,{lift:0,px:58,arm:.3,fl:0,fr:0}),K(2.6)],
    fx(g,u,F){if(u>.75&&u<1.75)return{at:[F.talon?F.talon[0]:F.cx-4,(F.talon?F.talon[1]:GY-20)]};if(u>1.75&&u<2.1)return{at:[T.x+2,lerp(20,GY-7,(u-1.75)/.35)]};return{hit:hitAt(u,[2.1])};}},
  {n:'TEMPEST',hits:[.6,.95,1.3,1.65],d:'Beats up a storm. Four hits of wind and rain.',len:2.2,keys:[K(0),K(.3,{arm:1.2}),K(.5,{arm:0}),K(.7,{arm:1.2}),K(.9,{arm:0}),K(1.1,{arm:1.2}),K(1.3,{arm:0}),K(2.2)],
    fx(g,u,F){if(u>.3&&u<2){for(let i=0;i<24;i++){const x=((i*13+u*90)%110)-10,y=(i*7+u*60)%70;line(g,x,y,x-3,y+4,'#a8b0ff');}}return{hit:hitAt(u,[.6,.95,1.3,1.65]),knock:Math.min(.5,clamp(u-.3,0,1)*.4)};}}],
};
function flameDot(g,x,y){px(g,x,y,'#ffd34d',2);px(g,x,y-1,'#fff2a0');}
return{M,FX,hunter,T};
})();
// play a signature move: frame at time u, drawn on a transparent 96x72 canvas
function sigPose(M,S,u){const ks=S.keys.map(([t,v])=>[t,Object.assign({},M.rest,Object.fromEntries(Object.entries(v).map(([a,b])=>[a,typeof b==='string'?(M.rest[a]||0)+parseFloat(b):b])))]);
  return Object.assign({},M.rest,ENG.sample(ks,Math.min(u,S.len)));}
function bbox(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return[x0,y0,x1,y1];}
const OX=24,REACH={};
function reach(id,M,mats){if(REACH[id]!=null)return REACH[id];const r=M.build(Object.assign({},M.rest),{},0);return REACH[id]=Math.max(-20,Math.min(18,(r.mouth?r.mouth[0]:30)-16));}
function sigFrame(id,mi,u,mats,opt){opt=opt||{};const M=MON[id],S=SIG.M[id][mi],p=sigPose(M,S,u),brk=S.brk&&!(S.regrow&&u>S.regrow)?S.brk:{};
  const r=M.build(p,brk,u),img=ENG.render(r.S,M.groups,mats||ENG.materials(Object.assign({},M.look),M.mats),M.W,M.H,r.extra),bb=bbox(img);
  SIG.T.x=opt.tx!=null?opt.tx:reach(id,M);const o=document.createElement('canvas');o.width=96+OX;o.height=72;const g=o.getContext('2d');g.imageSmoothingEnabled=false;g.translate(OX,0);const wash=[];if(opt.noHunter){const fr=g.fillRect.bind(g);g.fillRect=(x,y,w,h)=>{if(x===-24&&y===0&&w===120&&h===72){wash.push([g.fillStyle,g.globalAlpha]);return;}fr(x,y,w,h);};}
  const sink=(p.sink||0)-(p.lift||0),fade=p.fade||0,spin=p.spin||0,sh=(p.shk?(Math.sin(u*90)*p.shk):0)+(p.dx||0),cx=(bb[0]+bb[2])/2,cy=(bb[1]+bb[3])/2;
  g.save();g.globalAlpha=1-fade;if(sink>0){g.beginPath();g.rect(0,0,96,66);g.clip();}
  if(spin){g.translate(cx,cy);g.rotate(spin);g.translate(-cx,-cy);}g.drawImage(img,Math.round(sh),Math.round(sink));g.restore();
  const mouth=r.mouth?[r.mouth[0]+sh,r.mouth[1]+sink]:[cx-20,cy];
  const F={mouth,cx:cx+sh,cy:cy+sink,img,ox:Math.round(sh),oy:Math.round(sink),eye:[mouth[0]-3,mouth[1]-4],lure:[mouth[0]+2,mouth[1]-13],claw:mouth,talon:[cx-3,bb[3]-2+sink],P:p};
  const st=S.fx(g,u,F)||{};if(!opt.noHunter)SIG.hunter(g,st);g.setTransform(1,0,0,1,0,0);if(wash.length)st.wash=wash;st.mouth=[F.mouth[0],F.mouth[1]];o.st=st;return o;}
SIG.OX=OX;
SIG.reach=id=>reach(id,MON[id]);
SIG.frame=sigFrame;
