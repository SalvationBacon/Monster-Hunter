// PART ICONS: each monster's materials drawn from its own body. Its horn icon is its horn style, its tail icon is its
// tail tip, its wing icon its own membrane or feathers, its scale its own plate, its core shaped by its element.
const ICON=(()=>{
const {V,add,lerp2,chain,kit,spike,crystal,bolt,flame}=KIT,PI=Math.PI,G={a:{z:1,R:2.2,k:1.2},b:{z:2,R:1.3,k:.7},c:{z:3,R:1,k:.5}};
const PARTS=[['scale','SCALE'],['claw','CLAW'],['horn','HORN'],['wing','WING'],['tail','TAIL'],['core','CORE']];
const ELC={nature:'#8ad86a',poison:'#b070d8',fire:'#ffb03a',ice:'#bfeaff',thunder:'#ffe14d',water:'#7fd6ff',earth:'#d8b070',dragon:'#ff6ab0'};
const one=c=>ENG.materials({b:c,u:c,h:c,d:c}).horn;
// shapes in a 16x16 box
function shapes(id,part,t){const M=MON[id],B=M.D;if(M.rig!=='dragon')return other(id,part,t);const K=kit(),{S,E,C,P}=K,glow=[];
  if(part==='scale'){
    if(B.plan==='coatl'){P([[3,13],[7,2],[11,3],[13,8],[8,14]],'feather','a',{k:.5});C([[4,13,.6],[11,4,.4]],'bandB','c',{pri:3});}
    else if(B.plan==='lung'){P([[2,9],[8,3],[14,9],[8,14]],'body','a',{k:.6});E(8,9,3.4,2.4,'cloud','b',{});E(6,7.5,2,1.8,'cloud','b',{});}
    else if(B.elder){P([[2,8],[8,2],[14,8],[8,14]],'void','a',{k:.6});glow.push([6,7],[9,9],[8,5],[10,6]);}
    else if(B.spines==='plates'){P([[2,10],[4,3],[11,2],[14,7],[12,13],[5,14]],'rock','a',{k:.3});C([[4,10,.5],[8,7,.45],[12,5,.4]],'lava','c',{pri:3});}
    else if(B.spines==='crystals'){P([[3,13],[2,6],[8,1],[14,6],[13,13]],'ice','a',{k:.2});P([[5,11],[6,5],[8,3],[10,6]],'belly','b',{k:.2});}
    else{P([[2,7],[8,2],[14,7],[12,13],[8,15],[4,13]],'body','a',{k:.7});C([[8,3,.6],[8,13,.5]],'dark','c',{pri:3});P([[5,7],[8,4],[11,7],[8,9]],'belly','b',{k:.5});
      if(B.marks==='cracks')C([[4,11,.4],[7,9,.4],[6,6,.35]],'lava','c',{pri:3});}}
  else if(part==='claw'){const big=B.plan==='western'||B.plan==='zmey'?1.15:1;C([[4,13,2.6*big],[6,8,2.1*big],[9,4,1.4*big],[13,3,.5]],'claw','a');E(4,13,3*big,2.4*big,'body','b',{});C([[3,14,.5],[6,11,.4]],'dark','c',{pri:3});}
  else if(part==='horn'){const H=B.horns;
    if(H==='swept')C([[3,14,2.4],[6,9,1.9],[10,5,1.3],[14,3,.4]],'horn','a');
    else if(H==='ram'){const pts=chain(5,14,-PI/2+.15,[[3.4,.0],[3,.9],[2.8,.95],[2.6,.95],[2.2,.95],[1.8,.9]]).map((q,i)=>[q[0],q[1],[2.6,2.4,2.2,1.9,1.5,1.1,.6][i]]);C(pts,'horn','a');}
    else if(H==='blade')P([[1,12],[4,15],[15,1],[9,4]],'horn','a',{k:.3});
    else if(H==='crown')for(let i=0;i<3;i++)P([[3+i*4,14],[5+i*4,2+Math.abs(i-1)*3],[7+i*4,14]],'horn','a',{k:.3});
    else if(H==='bolt')bolt(K,[2,14],-PI/4,16,2.4,'horn','a');
    else if(H==='jagged'){P([[2,14],[3,9],[6,8],[7,4],[11,2],[10,7],[13,9],[8,14]],'horn','a',{k:.25});glow.push([6,10],[8,7]);}
    else if(H==='antler'){C([[3,14,1.6],[6,9,1.2],[9,5,.9],[11,2,.4]],'horn','a');C([[6,9,.8],[11,8,.3]],'horn','a');C([[8,6,.7],[13,5,.3]],'horn','a');}
    else if(H==='stag'){C([[4,14,1.6],[8,7,1.1],[9,2,.4]],'horn','a');C([[7,9,.8],[13,7,.3]],'horn','a');}
    else C([[3,14,2.2],[7,8,1.6],[12,6,.9],[14,8,.3]],'horn','a');
    if(B.elder)C([[10,5,.8],[14,3,.4]],'glow','c',{pri:3});}
  else if(part==='wing'){
    if(B.plan==='coatl')for(let i=0;i<3;i++){E(7+i*2,8-i,6-i,1.8,i%2?'bandB':'feather','a',{a:-.9+i*.25,pri:i*.2});}
    else if(B.plan==='lung'){E(8,9,5,3.6,'cloud','a',{});E(5,7,3,2.6,'cloud','a',{});E(11,6.5,2.8,2.4,'cloud','a',{});bolt(K,[7,9],.3,6,1.2,'lava','c',{pri:3});}
    else{P([[2,3],[14,2],[11,6],[13,9],[9,10],[10,14],[3,10]],B.elder?'void':'memb','a',{k:.4,holes:B.wpat==='tattered'?[[9,7,1.3]]:null});C([[2,3,1.4],[14,2,.5]],'dark','b');C([[2,3,1],[13,9,.4]],'dark','b');C([[2,3,.9],[10,14,.4]],'dark','b');
      if(B.wpat==='icicles')for(const x of[5,9])crystal(K,[x,10.5],PI/2,3.4,.9,'ice','c',{pri:3});if(B.wpat==='glowedge')glow.push([12,6],[11,10],[6,11]);if(B.wpat==='bolts')bolt(K,[4,5],.5,8,1.1,'lava','c',{pri:3});
      if(B.elder)glow.push([7,6],[10,4],[5,8]);}}
  else if(part==='tail'){const T=B.tip;C([[1,14,3],[5,11,2.4]],'body','a');const te=[6,10];
    if(T==='leaf')P([[5,11],[8,5],[14,3],[12,9],[6,12]],'dark','b',{k:.5});
    else if(T==='club'||T==='rockclub'){E(10,6,4,3.6,T==='rockclub'?'rock':'dark','b',{bulge:1});for(let i=0;i<5;i++)spike(K,add([10,6],V(-PI/4+i*1.25,3)),-PI/4+i*1.25,2.6,1,'horn','b',{pri:3});if(T==='rockclub')glow.push([9,6],[11,5]);}
    else if(T==='crystal'){for(let i=-1;i<=1;i++)crystal(K,te,-PI/4+i*.5,8-Math.abs(i)*2.5,1.5,'ice','b');}
    else if(T==='fan'){P([te,[6,1],[11,1],[15,5],[15,10]],'feather','b',{k:.4});for(let i=0;i<3;i++)C([te.concat([.5]),[8+i*3,2+i*2.6,.3]],'bandB','c',{pri:3});}
    else if(T==='axe'){P([[6,10],[6,3],[12,1],[15,7],[9,10]],'horn','b',{k:.3});glow.push([10,5]);}
    else if(T==='star'){P([[11,1],[12,5],[15,6],[12,7],[11,11],[10,7],[7,6],[10,5]],'glow','b',{k:.2});}
    else if(T==='spade'){P([[5,11],[7,4],[9,1],[11,4],[15,5],[11,7],[10,11]],'dark','b',{k:.35});}
    else if(B.plan==='lung'){E(10,6,4,2,'cloud','b',{a:-.6});E(9,4,3.4,1.6,'cloud','b',{a:-1.1});E(11,9,3.4,1.6,'cloud','b',{a:-.2});}
    else P([[5,11],[9,4],[14,4],[11,10]],'dark','b',{k:.4});}
  else if(part==='core'){const gm='gem',cs=B.core||B.el;
    if(cs==='fire')flame(K,[8,14],-PI/2,13,4.2,gm,'a',t||0,0);
    else if(cs==='shard'){P([[4,14],[3,8],[7,2],[12,4],[13,10],[9,15]],'rock','a',{k:.25});C([[5,12,.6],[8,8,.5],[10,4,.4]],gm,'c',{pri:3});}
    else if(cs==='ice')crystal(K,[8,15],-PI/2,14,4,gm,'a');else if(cs==='thunder')bolt(K,[3,2],PI/3,15,3,gm,'a');
    else if(cs==='orb'){E(8,8,5.5,5.5,'pearlM','a',{});E(6,6,1.8,1.8,'gloss','c',{pri:3});bolt(K,[9,6],PI/3,6,1.2,gm,'c',{pri:3});}
    else if(cs==='crown'){P([[3,8],[8,4],[13,8],[8,15]],gm,'a',{k:.4});for(const x of[4,8,12])P([[x-1.4,6],[x,1],[x+1.4,6]],'horn','b',{k:.2});}
    else if(cs==='prism'){P([[8,1],[14,5],[14,11],[8,15],[2,11],[2,5]],gm,'a',{k:.3});P([[2,7],[14,7],[14,9],[2,9]],'bandB','b',{pri:2.6,k:.2});}
    else if(cs==='nature')P([[8,1],[13,6],[11,13],[8,15],[5,13],[3,6]],gm,'a',{k:.6});else if(cs==='dragon')P([[8,1],[10,6],[15,8],[10,10],[8,15],[6,10],[1,8],[6,6]],gm,'a',{k:.3});
    else E(8,8,5.5,5.5,gm,'a',{});E(7,6,1.6,1.6,'gloss','c',{pri:3});}
  for(const q of S)if(q.pri>=2.5)q.top=1;return{S,glow};}
// ── the other monsters: each icon follows that monster's own body
const LABELS={dragon:['SCALE','CLAW','HORN','WING','TAIL','CORE'],brute:['HIDE','CLAW','HORN','SPINE','TAIL','CORE'],crab:['SHELL','PINCER','FEELER','PLATE','STING','CORE'],
  serpent:['SCALE','FANG','CREST','FIN','TAIL','CORE'],raptor:['PLUME','TALON','BEAK','CREST','TAIL','CORE']};
function other(id,part,t){const M=MON[id],B=M.D,pl=M.stance,rig=M.rig,K=kit(),{S,E,C,P}=K,glow=[],has=m=>M.mats&&M.mats[m]?m:null;
  const fur=has('fur')||'hide',body=rig==='raptor'?(pl==='stymph'?'metal':'plumA'):rig==='crab'?'shell':rig==='serpent'?'body':'hide';
  const coreShape=()=>{const el=B.el==='poison'?'nature':B.el,gm='gem';if(el==='fire')flame(K,[8,14],-PI/2,13,4.2,gm,'a',t||0,0);else if(el==='ice')crystal(K,[8,15],-PI/2,14,4,gm,'a');else if(el==='thunder')bolt(K,[3,2],PI/3,15,3,gm,'a');
    else if(el==='nature')P([[8,1],[13,6],[11,13],[8,15],[5,13],[3,6]],gm,'a',{k:.6});else if(el==='dragon')P([[8,1],[10,6],[15,8],[10,10],[8,15],[6,10],[1,8],[6,6]],gm,'a',{k:.3});
    else if(el==='earth')P([[4,13],[2,7],[6,2],[12,3],[14,9],[10,14]],gm,'a',{k:.3});else E(8,8,5.6,5.6,gm,'a',{});E(7,6,1.6,1.6,'gloss','c',{pri:3});};
  if(part==='core')coreShape();
  else if(rig==='brute'){
    if(part==='scale'){if(pl==='tarasque'){E(8,9,6.5,5.5,'shellM','a',{bulge:1});C([[8,5,1.4],[10,1,.4]],'horn','b');}else if(pl==='bull'||pl==='rhino'){P([[3,3],[13,2],[14,12],[3,13]],pl==='bull'?'bronze':'stone','a',{k:.4});C([[4,8,.5],[13,7,.5]],'lava','c',{pri:3});}
      else{E(8,9,6,5,fur==='fur'&&pl!=='mammoth'?'hide':fur,'a',{});for(let i=0;i<4;i++)C([[4+i*2.6,7,.8],[3+i*2.6,2,.3]],pl==='wolf'?'mane':fur,'b');}}
    else if(part==='claw'){if(pl==='boar'||pl==='bull'){P([[3,13],[4,6],[7,5],[8,13]],'dark','a',{k:.4});P([[9,13],[9,5],[12,6],[13,13]],'dark','a',{k:.4});}
      else if(pl==='mammoth'){E(8,10,6,4,'hide','a',{});for(let i=0;i<3;i++)E(4+i*4,13,1.4,1.2,'ivory','b',{});}
      else C([[4,14,2.4],[6,8,1.8],[10,4,1],[13,4,.4]],'claw','a');}
    else if(part==='horn'){if(pl==='boar'||pl==='mammoth')C([[3,14,2.4],[4,8,2],[8,3,1.4],[13,2,.5]],pl==='mammoth'?'ice':'ivory','a');
      else if(pl==='bull')C([[2,13,2],[5,7,1.6],[11,4,1],[14,6,.35]],'ivory','a');else if(pl==='rhino')C([[4,14,3],[7,8,2.2],[10,3,1.1],[9,1,.4]],'horn','a');
      else if(pl==='wolf'){P([[6,2],[10,2],[8,15]],'lava','a',{k:.3});}else if(pl==='yeti'){const pts=chain(5,14,-PI/2,[[3,.2],[3,.9],[2.6,.9],[2,.9]]).map((q,i)=>[q[0],q[1],[2,1.8,1.4,1,.5][i]]);C(pts,'horn','a');}
      else C([[4,14,1.6],[8,6,1],[11,2,.35]],'horn','a');}
    else if(part==='wing'){if(pl==='boar')for(let i=0;i<3;i++)C([[5+i*3,14,1.2],[6+i*2,2,.3]],'horn','a');else if(pl==='tarasque')C([[4,14,2],[8,7,1.2],[13,4,.3]],'horn','a');
      else if(pl==='bull'||pl==='rhino'){P([[2,4],[14,3],[13,13],[3,13]],pl==='bull'?'bronze':'stone','a',{k:.4});for(const[x,y]of[[5,6],[9,9],[11,5]])glow.push([x,y]);}
      else for(let i=0;i<4;i++)C([[3+i*3,14,1.6],[5+i*2.4,2+i,.5]],pl==='wolf'?'mane':fur,'a');}
    else if(part==='tail'){C([[2,14,1.6],[7,8,1.3]],pl==='wolf'?'mane':'hide','a');if(pl==='tarasque'){P([[7,8],[14,3],[10,9]],'horn','b',{k:.3});}else if(pl==='wolf')E(10,6,5,3,'mane','b',{a:-.7});else P([[7,8],[13,6],[12,12],[8,12]],pl==='mammoth'?'fur':'dark','b',{k:.6});}}
  else if(rig==='crab'){const top=B.top;
    if(part==='scale'){if(pl==='horseshoe')E(8,10,7,5,'shell','a',{bulge:1.4});else if(pl==='scorpion')for(let i=0;i<3;i++)E(5+i*3,8+i,3.4,4,'seg','a',{pri:i*.1});else E(8,9,6.4,5.4,'shell','a',{bulge:1.2});
      if(pl==='spider'||top==='vents')glow.push([6,7],[10,9]);}
    else if(part==='claw'){if(pl==='horseshoe'||pl==='ushioni')C([[3,14,1.4],[8,6,1.1],[13,2,.3]],'dark','a');
      else{E(6,10,4.4,3.4,'shell','a',{a:-.6,bulge:1});P([[8,7],[14,2],[15,4],[10,9]],'horn','b',{k:.4});P([[9,10],[14,8],[14,10],[10,12]],'claw','b',{k:.4});}}
    else if(part==='horn'){if(pl==='ushioni')C([[4,14,2.2],[9,10,1.7],[9,4,1.1],[5,1,.35]],'horn','a');else{C([[4,14,.7],[7,7,.5],[12,2,.3]],'dark','a');C([[6,14,.6],[10,8,.4],[14,5,.25]],'dark','a');}}
    else if(part==='wing'){if(top==='conch'){E(8,9,6.4,5.6,'conch','a',{bulge:1});const sp=[];for(let i=0;i<8;i++){const a=i*.8,r=5-i*.5;sp.push([8+Math.cos(a)*r,9+Math.sin(a)*r*.8,.5]);}C(sp,'dark','c',{pri:3});}
      else if(top==='crystals'||pl==='horseshoe'){crystal(K,[6,15],-PI/2-.2,12,2.6,'gem','a');crystal(K,[11,15],-PI/2+.3,9,2,'gem','a');}
      else if(top==='vents'||pl==='spider'){P([[3,14],[6,4],[10,4],[13,14]],'rock','a',{k:.4});E(8,4,2,1,'lava','c',{pri:3});}
      else if(top==='flames'){flame(K,[8,15],-PI/2,13,4,'fire','a',t||0,0);}else if(top==='spikes'||pl==='ushioni'){for(let i=0;i<3;i++)spike(K,[4+i*4,14],-PI/2+(i-1)*.3,11-Math.abs(i-1)*3,1.6,'horn','a');}
      else if(pl==='scorpion'){P([[2,12],[8,3],[14,12]],'seg','a',{k:.4});}else P([[3,13],[8,2],[13,13]],'dark','a',{k:.5});}
    else if(part==='tail'){if(pl==='scorpion'){E(8,9,4.4,3.6,'lava','a',{});P([[10,7],[15,2],[11,10]],'claw','b',{k:.3});}
      else if(pl==='horseshoe')C([[2,14,2],[8,8,1.4],[14,2,.4]],'horn','a');else if(pl==='ushioni'){P([[3,14],[6,5],[13,2],[9,6],[6,14]],'horn','a',{k:.3});}
      else{E(6,10,5,3.8,'shell','a',{a:-.6,bulge:1});P([[8,7],[15,1],[15,4],[11,9]],'horn','b',{k:.4});P([[9,11],[15,8],[15,11],[11,13]],'claw','b',{k:.4});}}}
  else if(rig==='serpent'){
    if(part==='scale'){if(pl==='worm'){for(let i=0;i<3;i++)E(8,4+i*4,6,2,i%2?'ring':'body','a',{pri:i*.1});}else{P([[2,8],[8,2],[14,8],[8,14]],'body','a',{k:.6});P([[5,8],[8,5],[11,8],[8,11]],'scute','b',{k:.4});}}
    else if(part==='claw'){if(pl==='worm'){for(let i=0;i<3;i++)P([[3+i*4,13],[5+i*4,2+i],[7+i*4,13]],'tooth','a',{k:.3});}else{P([[5,2],[11,2],[9,14]],'tooth','a',{k:.4});if(pl==='hydra')glow.push([8,8]);}}
    else if(part==='horn'){if(pl==='basilisk')for(let i=0;i<5;i++)P([[1+i*3,14],[2.5+i*3,3+Math.abs(i-2)*2.4],[4+i*3,14]],'horn','a',{k:.3});
      else if(pl==='worm'){E(8,8,6.6,6.6,'body','a',{});E(8,8,3.8,3.8,'pit','b',{pri:2.6});for(let i=0;i<6;i++){const a=i/6*PI*2;P([[8+Math.cos(a)*5,8+Math.sin(a)*5],[8+Math.cos(a+.35)*5,8+Math.sin(a+.35)*5],[8+Math.cos(a+.17)*2.4,8+Math.sin(a+.17)*2.4]],'tooth','c',{k:.2,pri:3});}}else if(pl==='hydra'||B.head==='fangs')P([[2,13],[6,3],[9,7],[13,2],[14,13]],'leaf','a',{k:.4});
      else if(B.head==='lure'){C([[3,14,.8],[6,7,.6],[11,4,.4]],'dark','a');E(12,4,3,3,'lava','b',{});}else if(B.head==='horns')C([[2,14,1.8],[8,8,1.2],[14,4,.3]],'horn','a');
      else{P([[2,14],[4,4],[8,9],[10,2],[14,14]],'memb','a',{k:.4});}}
    else if(part==='wing'){if(pl==='basilisk'){E(8,9,6,6.6,'memb','a',{});for(let i=0;i<3;i++)E(8,4+i*4,1.6,1,'hoodIn','b',{pri:2.6});}else if(pl==='worm'){spike(K,[4,14],-PI/2,10,2.6,'horn','a');spike(K,[11,14],-PI/2+.3,8,2,'horn','a');}
      else if(pl==='hydra'||B.back==='leaves')P([[3,14],[7,3],[13,8],[9,14]],'leaf','a',{k:.4});else if(B.back==='weeds')for(let i=0;i<3;i++)C([[4+i*4,14,1.2],[5+i*3,3,.4]],'weed','a');
      else if(B.back==='plates')P([[2,13],[4,5],[12,4],[14,13]],'plate','a',{k:.35});else{P([[2,14],[6,3],[14,12]],'memb','a',{k:.4});for(let i=0;i<3;i++)C([[3+i*2,14,.4],[6+i*3,5+i*2,.3]],'dark','b',{pri:3});if(B.back==='bigfins'||B.back==='blades')glow.push([8,8]);}}
    else if(part==='tail'){C([[2,14,2.4],[8,9,1.8]],'body','a');if(pl==='worm')E(10,10,5,3,'sand','b',{});else if(pl==='hydra'||B.tip==='spike')P([[8,9],[15,3],[11,11]],'horn','b',{k:.3});
      else if(B.tip==='lure'){E(13,4,2.4,2.4,'lava','b',{});C([[8,9,.6],[13,4,.4]],'dark','b');}else P([[8,9],[11,2],[15,6],[13,13]],'memb','b',{k:.4});}}
  else if(rig==='raptor'){
    if(part==='scale'){E(8,8,6.6,2.4,pl==='stymph'?'metal':'plumA','a',{a:-.8});C([[3,13,.5],[13,3,.4]],'plumD','c',{pri:3});}
    else if(part==='claw'){if(pl==='griffin'){C([[5,2,1.6],[6,9,1.4]],'leg','a');}else C([[5,2,1.6],[6,9,1.3]],'leg','a');for(const d of[-3,0,3])C([[7,10,.9],[7+d,14,.5],[5+d,15,.3]],'claw','b');}
    else if(part==='horn'){const hk=pl==='griffin'||pl==='roc'||pl==='thunderbird';if(pl==='stymph')P([[2,9],[15,4],[2,6]],'beakM','a',{k:.3});
      else if(pl==='cockatrice'){P([[2,10],[11,7],[12,11],[2,13]],'beakM','a',{k:.4});for(let i=0;i<3;i++)E(3+i*2.6,5-Math.abs(i-1),1.4,1.8,'comb','b',{});}
      else P([[2,12],[2,3],[9,4],[14,8],[12,12],[9,10]],'beakM','a',{k:.5});if(hk)P([[12,8],[14,8],[13,13]],'beakM','b',{k:.3});}
    else if(part==='wing'){if(pl==='stymph')for(let i=0;i<4;i++)spike(K,[3+i*3,14],-PI/2+.5-i*.2,11-i,1,'metal','a');else if(pl==='cockatrice')for(let i=0;i<4;i++)E(4+i*2.6,8-Math.abs(i-1.5),1.6,2.4,'comb','a',{});
      else if(pl==='fenghuang')for(let i=0;i<3;i++){C([[4+i*3,15,.5],[6+i*3,4,.4]],'plumD','a');E(6+i*3,4,1.8,1.2,i%2?'plumX':'lava','b',{});}
      else for(let i=0;i<3;i++)P([[3+i*3,14],[6+i*2,2],[9+i*2,14]],i%2?'plumD':'plumA','a',{k:.3});}
    else if(part==='tail'){if(pl==='cockatrice'){C([[2,14,2.2],[7,9,1.6],[12,5,1]],'scaleM','a');P([[11,6],[15,1],[14,6]],'scaleM','b',{k:.3});}
      else if(pl==='griffin'){C([[2,14,1.2],[9,6,1.2]],'lion','a');E(11,5,3,2.4,'plumD','b',{});}else if(pl==='fenghuang'){for(let i=0;i<2;i++){C([[2,14,1],[8+i*3,5+i*2,.8]],i?'plumX':'plumA','a');E(10+i*3,4+i*2,2.4,1.8,'plumD','b',{});E(10+i*3,4+i*2,1,.8,'eyeSpot','c',{pri:3});}}
      else for(let i=0;i<3;i++)E(8+(i-1)*2,7,2,6.4,i%2?'plumD':body,'a',{a:(i-1)*.3,pri:i*.1});}}
  for(const q of S)if(q.pri>=2.5)q.top=1;return{S,glow};}
function frame(id,part,sz,t){const M=MON[id],{S,glow}=shapes(id,part,t),s=(sz||16)/16;if(s!==1)KIT.scale(S,0,0,s);
  const el=M.D.el,mats=Object.assign({},ENG.materials(Object.assign({},M.look),M.mats),{gem:Object.assign(one(M.D.elder?'#c8b8ff':ELC[el]||'#ffffff'),{dk:.2}),gloss:Object.assign(one('#ffffff'),{flat:.95})});
  return ENG.render(S,G,mats,sz||16,sz||16,g=>{g.fillStyle=M.D.glowCol||'#ffe680';glow.forEach(([x,y])=>g.fillRect(Math.round(x*s),Math.round(y*s),1,1));});}
return{PARTS,LABELS,frame};
})();
