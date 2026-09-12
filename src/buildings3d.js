/* =====================================================================================
 * 大富翁 · 富贵人生 —— buildings3d.js
 * -------------------------------------------------------------------------------------
 * 全程序化 Three.js 资产工厂（全局脚本，非 ES module；依赖全局 THREE r147）。
 *
 *   window.Building3D
 *     ├─ detention / station / ferry / airport / power / water / shop / gate / fountain
 *     │      9 栋特殊建筑，返回 THREE.Group（含地坪），动画挂 userData.anim=[fn(t,dt)]
 *     ├─ property(propIdx, level 1-4)
 *     │      22 块地产 × 4 进化阶段 的参数化工厂（8 地域风格：屋顶/颜色/装饰区分）
 *     ├─ props:    { police, jet, taxi, dice, roadblock, amulet, demolition, equalizer, remote }
 *     ├─ characters:{ boss, qian, tang, tu, ren, doudou }  Q 版小人 ~2.8 头身
 *     │      子部件命名：group.userData.parts = { head, torso, armL, armR, legL, legR }
 *     └─ pedestal / runAnims / MATERIALS   公共底座 · 动画驱动器 · 共享材质库
 *
 *   window.BuildingFactory = { create(propIdx, level) }  —— property 的别名入口
 *
 * 约定：1 格 = 3 世界单位；地坪 2.8×2.8×0.06；建筑本体宽 1.2~1.8、高 1.0~2.2；
 *       底座顶面 y=0；主朝向 +Z。
 * ==================================================================================== */
(function(){
'use strict';

if (typeof THREE === 'undefined'){
  if (typeof console!=='undefined') console.error('[buildings3d] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ---------- 1. 调色板 & 颜色工具（sRGB→Linear，配合 renderer.outputEncoding=sRGBEncoding） ---------- */
var PI=Math.PI, sin=Math.sin, cos=Math.cos;
function C(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }

function std(hex,o){
  o=o||{};
  var m=new THREE.MeshStandardMaterial({
    color:C(hex), roughness:(o.rough!==undefined?o.rough:0.85), metalness:(o.metal||0),
    flatShading:(o.flat!==undefined?o.flat:true)
  });
  if(o.emissive){ m.emissive=C(o.emissive); m.emissiveIntensity=(o.ei!==undefined?o.ei:0.6); }
  if(o.opacity!==undefined){ m.transparent=true; m.opacity=o.opacity; }
  if(o.envInt) m.envMapIntensity=o.envInt;
  if(o.side) m.side=o.side;
  return m;
}

/* ---------- 2. 共享材质库 ---------- */
var M={
  /* 石材 / 混凝土 */
  stoneL:std('#b9b3a4',{rough:.92}), stoneM:std('#9d978a',{rough:.92}), stoneD:std('#6f6a5e',{rough:.92}),
  concrete:std('#cdc7b8',{rough:.95}), asphalt:std('#565b63',{rough:.96}),
  /* 墙体 */
  plaster:std('#f2ead6',{rough:.9}), plaster2:std('#e6d9bf',{rough:.9}),
  /* 木材 */
  woodD:std('#6d4a2a',{rough:.8}), woodM:std('#936435',{rough:.8}), woodL:std('#bb8b52',{rough:.8}),
  hutWood:std('#8a7a5f',{rough:.85}),
  /* 中国红 / 漆柱 */
  redCol:std('#a83b2a',{rough:.6}), lacquer:std('#8a2f26',{rough:.6}), redLacquer:std('#b8432e',{rough:.55}),
  /* 琉璃瓦 / 屋面 */
  glazeY:std('#e3a428',{rough:.45,metal:.08,envInt:1.1}), glazeG:std('#4e7d5e',{rough:.45,metal:.08,envInt:1.1}),
  tileD:std('#4b5563',{rough:.7}), slate:std('#3e4550',{rough:.75}),
  /* 金属 */
  gold:std('#d8a63c',{rough:.35,metal:.75,envInt:1.2}),
  iron:std('#31363c',{rough:.5,metal:.55}), ironD:std('#23262b',{rough:.5,metal:.5}),
  steel:std('#98a4b0',{rough:.32,metal:.78,envInt:1.2}), steelD:std('#5d6873',{rough:.45,metal:.6}),
  bronze:std('#a3803f',{rough:.45,metal:.6,envInt:1.1}),
  ceramic:std('#ece5d2',{rough:.5}),
  pipe:std('#7e8ea0',{rough:.38,metal:.6,envInt:1.1}),
  /* 玻璃 / 水 */
  glass:std('#b9dfeb',{rough:.08,metal:.05,opacity:.32,envInt:1.6,side:THREE.DoubleSide}),
  glassWin:std('#a8ccd8',{rough:.25,metal:.15}),
  winD:std('#31404c',{rough:.4}),
  water:std('#3d95c7',{rough:.1,metal:.92,envInt:1.5,flat:false}),
  waterDeep:std('#2b6f9e',{rough:.15,metal:.9,envInt:1.3,flat:false}),
  jet:std('#cdeaf6',{rough:.2,opacity:.55,flat:false}),
  /* 自然物 */
  grass:std('#7ca25b',{rough:.95}), green:std('#6c9a52',{rough:.95}), greenD:std('#557b40',{rough:.95}),
  /* 中性 */
  white:std('#f4f2ec',{rough:.7}), cream:std('#f1e7cf',{rough:.85}), ink:std('#22262b',{rough:.7}),
  warn:std('#e8b93c',{rough:.6}), paintW:std('#f2f2ee',{rough:.55}),
  parchment:std('#e8d7ac',{rough:.85}), rope:std('#8a683f',{rough:.9}),
  /* 地坪（棋盘格底座 / 地产暖白地坪） */
  padL:std('#f5f0e0',{rough:.92}), padIn:std('#e8e0d0',{rough:.92}), path:std('#ddd2b4',{rough:.95})
};
M.tileTop=M.padIn; M.tileEdge=std('#c8b48e',{rough:.9}); M.tileIn=std('#dccdaa',{rough:.9});
/* 发光体基材质（lantern() 会 clone） */
M.lantern=std('#d6402e',{rough:.5,emissive:'#ff7a3c',ei:.6});
M.lens=std('#8a7a55',{rough:.4,emissive:'#ffd98a',ei:1.3});
M.bulb=std('#caa96a',{rough:.4,emissive:'#ffca7a',ei:1.2});

/* 半透明特效材质（Basic，不受光照） */
function fxMat(hex,opacity,additive){
  var m=new THREE.MeshBasicMaterial({color:C(hex),transparent:true,opacity:opacity,depthWrite:false,side:THREE.DoubleSide});
  if(additive) m.blending=THREE.AdditiveBlending;
  return m;
}
M.beam=fxMat('#ffe6ad',0.13,true);

/* 带缓存的材质工厂（地产建筑大量复用，key 含 rough/metal/emissive） */
var _matCache={};
function MAT(hex,o){
  o=o||{};
  var k=hex+'|'+o.rough+'|'+o.metal+'|'+o.emissive;
  if(_matCache[k]) return _matCache[k];
  var m=std(hex,o); _matCache[k]=m; return m;
}

/* ---------- 3. 图元 & 组合工具（Kit 层） ---------- */
function mesh(geo,mat){ var o=new THREE.Mesh(geo,mat); o.castShadow=true; o.receiveShadow=true; return o; }
function box(w,h,d,mat,x,y,z){ var o=mesh(new THREE.BoxGeometry(w,h,d),mat); o.position.set(x||0,y||0,z||0); return o; }
function cyl(rt,rb,h,seg,mat,x,y,z){ var o=mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat); o.position.set(x||0,y||0,z||0); return o; }
function sph(r,seg,mat,x,y,z){ var o=mesh(new THREE.SphereGeometry(r,seg||8,(seg||8)-2),mat); o.position.set(x||0,y||0,z||0); return o; }
function grp(){ return new THREE.Group(); }
function put(parent,o,x,y,z,ry){ o.position.set(x||0,y||0,z||0); if(ry)o.rotation.y=ry; parent.add(o); return o; }
function anim(g,fn){ (g.userData.anim||(g.userData.anim=[])).push(fn); }
/* 主循环统一驱动：root.traverse 调用所有 userData.anim */
function runAnims(root,t,dt){
  root.traverse(function(o){
    var a=o.userData.anim;
    if(a) for(var i=0;i<a.length;i++) a[i](t,dt);
  });
}

/* ---------- 4. 预制件（特殊建筑与地产建筑共用） ---------- */

/* 琉璃瓦攒尖顶：凹曲面四坡顶（屋角起翘 + 檐口板 + 宝顶/角兽） */
function hipRoofGeo(w,d,h,lift){
  var hw=w/2, hd=d/2, lc=lift, lm=lift*0.35;
  var ring=[[-hw,lc,-hd],[0,lm,-hd],[hw,lc,-hd],[hw,lm,0],[hw,lc,hd],[0,lm,hd],[-hw,lc,hd],[-hw,lm,0]];
  var pos=[0,h,0];
  for(var i=0;i<8;i++){
    var a=ring[i], b=ring[(i+1)%8];
    pos.push(0,h,0, b[0],b[1],b[2], a[0],a[1],a[2]);
  }
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.computeVertexNormals();
  return g;
}
function hipRoof(w,d,h,o){
  o=o||{};
  var g=grp(), lift=(o.lift!==undefined?o.lift:Math.min(w,d)*0.10);
  g.add(mesh(hipRoofGeo(w,d,h,lift), o.mat||M.glazeY));
  g.add(box(w*1.05,0.055,d*1.05, o.eaveMat||M.lacquer, 0, lift*0.35-0.045, 0));
  if(o.ornaments!==false){
    var hw=w/2, hd=d/2, orn=o.ornMat||M.gold, r=Math.min(w,d)*0.035;
    [[hw,-hd],[-hw,-hd],[hw,hd],[-hw,hd]].forEach(function(c){
      put(g, sph(r,6,orn), c[0], lift+0.005, c[1]);
    });
    put(g, sph(Math.min(w,d)*0.05,8,orn), 0, h+0.02, 0);
  }
  return g;
}

/* 人字双坡顶（含山墙封板 + 屋脊），原点在墙顶 */
function gableRoof(w,d,h,o){
  o=o||{};
  var g=grp();
  var mat=o.mat||M.tileD, ridgeMat=o.ridgeMat||M.ink;
  var slope=Math.sqrt(d*d*0.25+h*h)+0.05, ang=Math.atan2(h,d*0.5);
  var pF=box(w*1.04,0.045,slope,mat, 0,h*0.5, d*0.25); pF.rotation.x=ang;  g.add(pF);
  var pB=box(w*1.04,0.045,slope,mat, 0,h*0.5,-d*0.25); pB.rotation.x=-ang; g.add(pB);
  g.add(box(w*1.06,0.05,0.08, ridgeMat, 0,h,0));
  var sh=new THREE.Shape();
  sh.moveTo(-d*0.5,0); sh.lineTo(d*0.5,0); sh.lineTo(0,h); sh.closePath();
  var tg=new THREE.ExtrudeGeometry(sh,{depth:0.03,bevelEnabled:false});
  for(var s=-1;s<=1;s+=2){
    var tp=mesh(tg, o.gableMat||mat);
    tp.rotation.y=PI/2*s;
    tp.position.set(s*(w*0.5-0.03),0,0);
    g.add(tp);
  }
  return g;
}

/* 平屋顶（含四边女儿墙），原点在墙顶 */
function flatTop(w,d,mat){
  var g=grp();
  g.add(box(w,d,0.05,mat,0,0.025,0));
  g.add(box(w+0.05,0.07,0.05,mat,0,0.06, d/2));
  g.add(box(w+0.05,0.07,0.05,mat,0,0.06,-d/2));
  g.add(box(0.05,0.07,d-0.05,mat, w/2,0.06,0));
  g.add(box(0.05,0.07,d-0.05,mat,-w/2,0.06,0));
  return g;
}

/* 五角星（挤压成型），位于 XY 平面、朝 +Z */
function starMesh(R,r,depth,mat){
  var sh=new THREE.Shape();
  for(var i=0;i<10;i++){
    var rad=(i%2)?r:R, a=-PI/2+i*PI/5;
    var x=cos(a)*rad, y=sin(a)*rad;
    if(i===0) sh.moveTo(x,y); else sh.lineTo(x,y);
  }
  sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:false}),mat);
}

/* 国徽式徽章（红底金环金星，朝 +Z） */
function emblem(s,discMat){
  var g=grp(); s=s||1;
  var disc=mesh(new THREE.CylinderGeometry(0.17*s,0.17*s,0.05*s,24),discMat||M.redLacquer);
  disc.rotation.x=PI/2; g.add(disc);
  g.add(mesh(new THREE.TorusGeometry(0.17*s,0.02*s,8,32),M.gold));
  var st=starMesh(0.10*s,0.042*s,0.028*s,M.gold); st.position.z=0.036*s; g.add(st);
  return g;
}

/* 铁窗：暗色内衬 + 石/铁框 + 竖向铁条 + 横撑 */
function barredWindow(w,h,cols,o){
  o=o||{};
  var g=grp(), fm=o.frameMat||M.stoneD;
  g.add(box(w+0.05,h+0.05,0.035, o.backMat||M.ink));
  g.add(box(w+0.1,0.05,0.05, fm, 0, h/2+0.015, 0.012));
  g.add(box(w+0.1,0.05,0.05, fm, 0,-h/2-0.015, 0.012));
  g.add(box(0.05,h+0.1,0.05, fm,  w/2+0.015,0,0.012));
  g.add(box(0.05,h+0.1,0.05, fm, -w/2-0.015,0,0.012));
  for(var i=0;i<cols;i++){
    var x=-w/2+(i+0.5)*(w/cols);
    g.add(box(0.022,h+0.02,0.03, M.iron, x,0,0.032));
  }
  g.add(box(w+0.02,0.022,0.03, M.iron, 0,0,0.032));
  return g;
}

/* 红灯笼（金盖金底 + 红穗），灯体材质 clone 以便独立呼吸发光 */
function lantern(s,phase){
  var g=grp(); s=s||1;
  var bm=M.lantern.clone();
  g.add(cyl(0.035*s,0.05*s,0.035*s,8,M.gold,0, 0.115*s,0));
  var body=mesh(new THREE.SphereGeometry(0.085*s,10,8),bm);
  body.scale.y=0.82; g.add(body);
  g.add(cyl(0.05*s,0.035*s,0.035*s,8,M.gold,0,-0.105*s,0));
  g.add(cyl(0.008*s,0.008*s,0.07*s,5,M.redLacquer,0,-0.165*s,0));
  anim(g,function(t){ bm.emissiveIntensity=0.55+0.28*sin(t*2.4+(phase||0)); });
  return g;
}

/* 瞭望塔（拘留所 / 入口共用），含旋转探照灯锥形光束 */
function watchTower(s){
  var g=grp(); s=s||1;
  g.add(box(0.52*s,0.10*s,0.52*s, M.stoneD, 0,0.05*s,0));
  g.add(box(0.34*s,0.95*s,0.34*s, M.stoneM, 0,0.55*s,0));
  g.add(box(0.05*s,0.16*s,0.02*s, M.ink, 0,0.72*s,0.176*s));
  g.add(box(0.02*s,0.16*s,0.05*s, M.ink, 0.176*s,0.55*s,0));
  g.add(box(0.46*s,0.06*s,0.46*s, M.stoneD, 0,1.05*s,0));
  g.add(box(0.52*s,0.30*s,0.52*s, M.stoneL, 0,1.23*s,0));
  g.add(box(0.16*s,0.12*s,0.02*s, M.ink, 0,1.24*s,0.265*s));
  var rf=mesh(new THREE.ConeGeometry(0.42*s,0.26*s,4),M.slate);
  rf.rotation.y=PI/4; rf.position.y=1.51*s; g.add(rf);
  put(g, sph(0.035*s,8,M.gold), 0,1.66*s,0);
  var pivot=grp(); pivot.position.set(0,1.30*s,0.30*s); g.add(pivot);
  pivot.add(box(0.07*s,0.07*s,0.10*s, M.steelD, 0,0,0.03*s));
  var lamp=mesh(new THREE.CylinderGeometry(0.075*s,0.09*s,0.14*s,10),M.ink);
  lamp.rotation.x=PI/2; lamp.position.z=0.14*s; pivot.add(lamp);
  var lens=mesh(new THREE.CylinderGeometry(0.068*s,0.068*s,0.02*s,10),M.lens);
  lens.rotation.x=PI/2; lens.position.z=0.215*s; pivot.add(lens);
  var bh=0.9*s;
  var beam=new THREE.Mesh(new THREE.CylinderGeometry(0.03*s,0.26*s,bh,12,1,true),M.beam);
  beam.rotation.x=PI/2; beam.position.z=0.215*s+bh/2; beam.castShadow=false; pivot.add(beam);
  anim(g,function(t){ pivot.rotation.y=sin(t*0.55)*0.8; });
  return g;
}

/* 铁艺围栏段（沿 X 轴，居中）：石基 + 铁柱 + 双横杆 */
function fence(len){
  var g=grp();
  g.add(box(len,0.06,0.1, M.stoneD, 0,0.03,0));
  var n=Math.max(2,Math.round(len/0.42));
  for(var i=0;i<=n;i++){
    var x=-len/2+i*(len/n);
    g.add(box(0.045,0.5,0.045, M.iron, x,0.31,0));
  }
  g.add(box(len,0.03,0.025, M.iron, 0,0.44,0));
  g.add(box(len,0.03,0.025, M.iron, 0,0.24,0));
  return g;
}

/* 系船柱 / 短桩 */
function bollard(s){
  var g=grp(); s=s||1;
  g.add(cyl(0.05*s,0.06*s,0.05*s,8,M.ironD,0,0.025*s,0));
  g.add(cyl(0.032*s,0.04*s,0.12*s,8,M.redLacquer,0,0.11*s,0));
  put(g, sph(0.04*s,8,M.redLacquer), 0,0.18*s,0);
  var t=mesh(new THREE.TorusGeometry(0.04*s,0.012*s,6,14),M.ironD);
  t.rotation.x=PI/2; t.position.y=0.12*s; g.add(t);
  return g;
}

/* 壁灯 */
function wallLamp(){
  var g=grp();
  g.add(box(0.03,0.03,0.1, M.ink, 0,0,0.05));
  g.add(mesh(new THREE.ConeGeometry(0.055,0.06,8),M.ink));
  g.children[1].position.y=-0.045;
  put(g, sph(0.026,8,M.bulb), 0,-0.055,0);
  return g;
}

/* 圆角矩形 canvas 工具 */
function rr(g,x,y,w,h,r){
  g.beginPath(); g.moveTo(x+r,y);
  g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath();
}

/* 匾额 / 文字牌：Canvas 贴图（零外部资源），木质背板 + 字 */
function textPlate(text,w,h,o){
  o=o||{};
  var cw=256, ch=Math.max(64,Math.round(cw*h/w));
  var cv=document.createElement('canvas'); cv.width=cw; cv.height=ch;
  var g=cv.getContext('2d');
  var bg=o.bg||'#20242c', fg=o.fg||'#e7c56a', bd=o.border||'#8f6b1e';
  rr(g,4,4,cw-8,ch-8,12); g.fillStyle=bg; g.fill();
  g.lineWidth=8; g.strokeStyle=bd; rr(g,4,4,cw-8,ch-8,12); g.stroke();
  g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle';
  g.font='bold '+Math.round(ch*0.5)+'px "Microsoft YaHei","PingFang SC","Hiragino Sans GB",sans-serif';
  g.fillText(text,cw/2,ch/2+2);
  var tex=new THREE.CanvasTexture(cv); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=8;
  var p=new THREE.Mesh(new THREE.PlaneGeometry(w*0.97,h*0.88),
    new THREE.MeshStandardMaterial({map:tex,roughness:.55,metalness:.08,flatShading:true}));
  p.position.z=0.026;
  var back=box(w,h,0.03,o.backMat||M.woodD);
  var gr=grp(); gr.add(back); gr.add(p);
  return gr;
}

/* 展示底座：仿棋盘格地块（顶面 y=0） */
function pedestal(size){
  size=size||3.12;
  var g=grp();
  g.add(box(size+0.16,0.1,size+0.16, M.tileEdge, 0,-0.09,0));
  g.add(box(size,0.08,size, M.tileTop, 0,-0.04,0));
  g.add(box(size-0.2,0.012,size-0.2, M.tileIn, 0,0.006,0));
  return g;
}

/* 圆角立方体（挤压 + 倒角），中心在原点 */
function roundedBoxGeo(w,h,d,r){
  r=Math.min(r, w*0.4, h*0.4, d*0.4);
  var x=-w/2+r, y=-h/2+r, ww=w-2*r, hh=h-2*r;
  var sh=new THREE.Shape();
  sh.moveTo(x,y);
  sh.lineTo(x+ww,y);           sh.quadraticCurveTo(x+ww+r,y,x+ww+r,y+r);
  sh.lineTo(x+ww+r,y+hh);      sh.quadraticCurveTo(x+ww+r,y+h,x+ww,y+h);
  sh.lineTo(x,y+h);            sh.quadraticCurveTo(x,y+h,x,y+hh);
  sh.lineTo(x,y+r);            sh.quadraticCurveTo(x,y,x+r,y);
  var depth=Math.max(0.02,d-2*r);
  var geo=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelThickness:r,bevelSize:r*0.95,bevelSegments:2});
  geo.translate(0,0,-depth/2);
  return geo;
}

/* 月洞门院墙（带圆洞的挤出墙 + 压顶 + 门环） */
function moonWall(w,h,r,mat,capMat){
  var sh=new THREE.Shape();
  sh.moveTo(-w/2,0); sh.lineTo(w/2,0); sh.lineTo(w/2,h); sh.lineTo(-w/2,h); sh.closePath();
  var hole=new THREE.Path();
  hole.absarc(0, r+0.04, r, 0, PI*2, true);
  sh.holes.push(hole);
  var g=grp();
  g.add(mesh(new THREE.ExtrudeGeometry(sh,{depth:0.12,bevelEnabled:false}),mat));
  g.add(box(w+0.06,0.05,0.18, capMat, 0,h+0.015,0.06));
  var ring=mesh(new THREE.TorusGeometry(r+0.02,0.018,6,24),capMat);
  ring.position.set(0,r+0.04,0.06); g.add(ring);
  return g;
}

/* 地产窗户（按地域变体：拱窗/百叶/木格窗/普通框格窗） */
function regionWindow(R,acc,w,h){
  var g=grp();
  var frame=MAT(R.wood);
  if(R.deco==='arch'){
    g.add(box(w+0.06,h+0.06,0.03, frame));
    g.add(box(w,h,0.034, M.glassWin, 0,0,0.005));
    var ag=new THREE.CylinderGeometry(w/2,w/2,0.034,10,1,false,0,PI);
    ag.rotateX(PI/2); ag.rotateZ(PI/2);
    var am=mesh(ag,M.glassWin); am.position.set(0,h/2,0.005); g.add(am);
    var af2=new THREE.CylinderGeometry(w/2+0.03,w/2+0.03,0.03,10,1,false,0,PI);
    af2.rotateX(PI/2); af2.rotateZ(PI/2);
    var af=mesh(af2,frame); af.position.set(0,h/2+0.012,0); g.add(af);
    g.add(box(w+0.02,0.028,0.036, frame,0,0,0.008));
  } else if(R.louver){
    g.add(box(w+0.05,h+0.05,0.03, MAT(R.wallD)));
    for(var i=0;i<4;i++){
      g.add(box(w,0.035,0.034, MAT(R.louver[i%4]), 0, h/2-0.09+i*0.06, 0.006));
    }
  } else if(R.deco==='bamboo'){
    g.add(box(w+0.05,h+0.05,0.03, frame));
    g.add(box(w,h,0.032, M.glassWin,0,0,0.004));
    g.add(box(0.03,h,0.035, frame,0,0,0.007));
    g.add(box(w,0.03,0.035, frame,0,0,0.007));
    g.add(box(0.02,h,0.035, frame,-w/4,0,0.008));
    g.add(box(w,0.02,0.035, frame,0,h/4,0.008));
  } else {
    g.add(box(w+0.05,h+0.05,0.03, frame));
    g.add(box(w,h,0.032, M.glassWin,0,0,0.004));
    g.add(box(w+0.02,0.03,0.035, frame,0,0,0.007));
    g.add(box(0.03,h+0.02,0.035, frame,0,0,0.007));
  }
  return g;
}

/* 条纹遮阳篷（四分之一圆弧板条），挂点在墙面 */
function awning(w,r,c1,c2){
  var g=grp(), n=7;
  for(var i=0;i<n;i++){
    var tt=i/(n-1), a=(16+56*tt)*PI/180;
    var seg=box(w,0.016,0.13,(i%2)?c2:c1);
    seg.position.set(0,-cos(a)*r, sin(a)*r);
    seg.rotation.x=-a*0.55;
    g.add(seg);
  }
  var rod=cyl(0.01,0.01,w+0.06,6,M.woodD);
  rod.rotation.z=PI/2;
  rod.position.set(0,-cos(72*PI/180)*r, sin(72*PI/180)*r);
  g.add(rod);
  return g;
}

/* 阳台（板 + 栏杆），挂点在墙面 */
function balcony(w,mat){
  var g=grp();
  g.add(box(w,0.03,0.2,mat,0,0,0.1));
  var n=Math.max(3,Math.round(w/0.16));
  for(var i=0;i<=n;i++){
    g.add(cyl(0.009,0.009,0.16,5,mat,-w/2+i*(w/n),0.11,0.19));
  }
  g.add(box(w,0.025,0.025,mat,0,0.2,0.19));
  g.add(box(0.025,0.025,0.18,mat,-w/2,0.2,0.1));
  g.add(box(0.025,0.025,0.18,mat, w/2,0.2,0.1));
  return g;
}

/* 空调外机 */
function acUnit(){
  var g=grp();
  g.add(box(0.16,0.11,0.13,std('#cfd4d8',{rough:.6,metal:.2}),0,0.055,0));
  g.add(box(0.02,0.09,0.11,M.inkD,0.075,0.055,0));
  var fan=cyl(0.035,0.035,0.012,10,M.inkD,-0.03,0.055,0.066);
  fan.rotation.x=PI/2; g.add(fan);
  return g;
}

/* 屋顶水塔 */
function waterTank(){
  var g=grp();
  for(var i=0;i<3;i++){
    var a=i*PI*2/3;
    g.add(cyl(0.012,0.012,0.1,5,M.steelD,cos(a)*0.07,0.05,sin(a)*0.07));
  }
  g.add(cyl(0.085,0.085,0.16,10,M.white,0,0.18,0));
  g.add(cyl(0.088,0.088,0.03,10,std('#3181bd',{rough:.5}),0,0.2,0));
  var cap=mesh(new THREE.ConeGeometry(0.09,0.06,10),M.white); cap.position.y=0.29; g.add(cap);
  return g;
}

/* 霓虹招牌（闪烁），col 为霓虹色，ph 为闪烁相位 */
function neonSign(w,h,col,ph){
  var g=grp();
  g.add(box(w,h,0.035,M.inkD));
  var nm=std(col,{rough:.3,emissive:col,ei:1.1});
  g.add(box(w*0.66,h*0.42,0.02,nm,0,0,0.025));
  anim(g,function(t){
    var k=sin(t*8.7+(ph||0))*sin(t*13.1+(ph||0)*1.7);
    nm.emissiveIntensity=0.95+0.35*k-(k<-0.86?0.75:0);
  });
  return g;
}

/* 串灯（夜市彩灯，下垂弧线） */
function bulbString(w,n){
  var g=grp();
  var cols=['#ffd23c','#ff6b6b','#3fae6e','#3fa0ff'];
  g.add(box(w,0.008,0.008,M.inkD,0,0,0));
  for(var i=0;i<n;i++){
    var u=i/(n-1), x=-w/2+w*u;
    var sag=sin(u*PI)*0.07;
    g.add(sph(0.02,6, MAT(cols[i%4],{emissive:cols[i%4],ei:0.9}), x,-sag,0.02));
  }
  return g;
}

/* 竹丛（四川） */
function bambooClump(){
  var g=grp();
  var bm=MAT('#6aa84f',{rough:.85}), lm=MAT('#5a9844',{rough:.85});
  var H=[0.55,0.72,0.44], X=[-0.05,0.05,0], Z=[0.03,-0.02,-0.06];
  for(var i=0;i<3;i++){
    g.add(cyl(0.013,0.016,H[i],5,bm,X[i],H[i]*0.5,Z[i]));
    for(var k=0;k<3;k++){
      var leaf=box(0.14,0.006,0.028,lm, X[i],H[i]-k*0.06,Z[i]);
      leaf.rotation.y=k*1.1+i; leaf.rotation.z=-0.35;
      leaf.translateX(0.06);
      g.add(leaf);
    }
  }
  var rock=mesh(new THREE.DodecahedronGeometry(0.055,0),M.stoneM);
  rock.position.set(0.02,0.03,0.1); g.add(rock);
  return g;
}

/* 小桥流水（江南） */
function tinyBridge(){
  var g=grp();
  var R=0.24;
  g.add(box(1.15,0.018,0.34,M.water,0,0.005,0));
  for(var s=-1;s<=1;s+=2){
    var arc=mesh(new THREE.TorusGeometry(R,0.02,6,14,PI),M.stoneL);
    arc.position.set(0,0.02,s*0.15); g.add(arc);
  }
  for(var i=0;i<5;i++){
    var x=-0.16+i*0.08;
    var y=Math.sqrt(Math.max(0.001,R*R-x*x));
    g.add(box(0.075,0.016,0.32,M.woodM,x,y+0.005,0));
  }
  return g;
}

/* 红柱金饰柱（大唐） */
function redGoldColumn(h,r){
  var g=grp();
  g.add(cyl(r*1.5,r*1.7,0.05,8,M.gold,0,0.025,0));
  g.add(cyl(r,r,h,10,M.redCol,0,0.05+h*0.5,0));
  g.add(cyl(r*1.3,r*1.1,0.045,10,M.gold,0,0.05+h+0.022,0));
  return g;
}

/* 灌木丛 */
function bushAt(g,x,z){
  var b=mesh(new THREE.IcosahedronGeometry(0.10,0),M.green);
  b.position.set(x,0.14,z); b.scale.y=0.8; g.add(b);
  var b2=mesh(new THREE.IcosahedronGeometry(0.07,0),M.greenD);
  b2.position.set(x+0.12,0.10,z+0.08); g.add(b2);
}

/* =====================================================================================
 * 5. 特殊建筑 ×9（自预览器原样提取，函数体保持不变）
 * ===================================================================================== */

/* ---------- ① 拘留所 ---------- */
function createDetention(){
  var g=grp();
  g.add(box(2.85,0.06,2.45, M.concrete, 0,0.03,0.05));
  g.add(box(2.85,0.02,0.42, M.asphalt, 0,0.065,1.08));

  g.add(box(2.85,0.55,0.14, M.stoneM, 0,0.335,-1.11));
  g.add(box(2.95,0.07,0.2,  M.stoneD, 0,0.645,-1.11));
  var fl=fence(1.35); fl.rotation.y=PI/2; put(g,fl,-1.36,0.06,-0.28);
  var fr=fence(1.35); fr.rotation.y=PI/2; put(g,fr, 1.36,0.06,-0.28);
  var fsl=fence(1.05); put(g,fsl,-0.92,0.06,1.24);
  var fsr=fence(1.05); put(g,fsr, 0.92,0.06,1.24);
  var gate=grp(); gate.position.set(-0.28,0.06,1.24); gate.rotation.y=-0.55; g.add(gate);
  gate.add(box(0.55,0.5,0.03, M.stoneD, 0.275,0.03,0));
  var i;
  for(i=0;i<6;i++) gate.add(box(0.035,0.52,0.035, M.iron, 0.08+i*0.09,0.34,0));
  gate.add(box(0.5,0.03,0.03, M.iron, 0.275,0.55,0));
  gate.add(box(0.5,0.03,0.03, M.iron, 0.275,0.14,0));
  gate.add(sph(0.03,8,M.gold,0.5,0.36,0));

  g.add(box(1.7,1.02,1.05, M.stoneM, 0,0.57,-0.45));
  [[-0.83,-0.95],[0.83,-0.95],[-0.83,0.05],[0.83,0.05]].forEach(function(c){
    g.add(box(0.09,1.02,0.09, M.stoneL, c[0],0.57,c[1]));
  });
  g.add(box(1.82,0.08,1.16, M.stoneD, 0,1.10,-0.45));
  g.add(box(1.86,0.06,1.20, M.slate,  0,1.17,-0.45));

  var w1=barredWindow(0.22,0.26,3); put(g,w1,-0.5,0.62,0.075);
  var w2=barredWindow(0.22,0.26,3); put(g,w2, 0.5,0.62,0.075);
  var em=emblem(0.85); put(g,em,0,0.88,0.09);
  g.add(box(0.4,0.56,0.06, M.ironD, 0,0.34,0.085));
  for(i=0;i<4;i++) g.add(box(0.03,0.5,0.03, M.iron, -0.13+i*0.087,0.34,0.12));
  g.add(box(0.52,0.07,0.09, M.stoneD, 0,0.665,0.09));
  g.add(box(0.5,0.06,0.3,  M.stoneD, 0,0.03,0.22));

  var w3=barredWindow(0.2,0.24,3); w3.rotation.y= PI/2; put(g,w3, 0.855,0.62,-0.5);
  var w4=barredWindow(0.2,0.24,3); w4.rotation.y=-PI/2; put(g,w4,-0.855,0.62,-0.5);

  var tw=watchTower(0.95); put(g,tw,1.02,0.06,-0.82);

  var fg=grp(); fg.position.set(-1.15,0.06,0.92); g.add(fg);
  fg.add(cyl(0.012,0.014,1.3,6,M.white,0,0.65,0));
  put(fg,sph(0.025,8,M.gold),0,1.32,0);
  var flagPivot=grp(); flagPivot.position.set(0,1.22,0); fg.add(flagPivot);
  flagPivot.add(box(0.3,0.18,0.012, M.redLacquer, 0.155,0,0));
  anim(g,function(t){ flagPivot.rotation.y=sin(t*2.1)*0.22; });

  var l1=wallLamp(); put(g,l1,-0.72,0.86,0.085);
  var l2=wallLamp(); put(g,l2, 0.72,0.86,0.085);
  return g;
}

/* ---------- ② 中央车站 ---------- */
function createStation(){
  var g=grp();
  g.add(box(2.9,0.06,2.9, M.concrete, 0,0.03,0));

  g.add(box(2.9,0.16,0.75, M.stoneL, 0,0.11,0.55));
  g.add(box(2.9,0.02,0.08, M.warn, 0,0.2,0.22));
  var bench=grp(); put(g,bench,1.05,0.19,0.55);
  bench.add(box(0.42,0.04,0.16, M.woodM, 0,0.14,0));
  bench.add(box(0.04,0.14,0.14, M.stoneD, -0.16,0.07,0));
  bench.add(box(0.04,0.14,0.14, M.stoneD,  0.16,0.07,0));
  var sp=grp(); sp.position.set(-1.05,0.19,0.7); g.add(sp);
  sp.add(cyl(0.014,0.018,0.6,6,M.steelD,0,0.3,0));
  var sign=textPlate('出站口',0.3,0.11); put(sp,sign,0,0.62,0);

  var i;
  for(i=0;i<9;i++) g.add(box(0.78,0.03,0.09, M.woodD, -1.2+i*0.3,0.035,1.2));
  g.add(box(2.9,0.035,0.045, M.steel, 0,0.052,0.92));
  g.add(box(2.9,0.035,0.045, M.steel, 0,0.052,1.48));

  g.add(box(1.9,0.95,1.05, M.plaster, 0,0.535,-0.55));
  g.add(box(1.96,0.12,1.1,  M.stoneM, 0,0.12,-0.55));
  [[-0.5],[0.5]].forEach(function(x){
    g.add(box(0.34,0.5,0.05, M.woodD, x[0],0.31,-0.018));
    var arch=new THREE.CylinderGeometry(0.17,0.17,0.05,12,1,false,0,PI);
    arch.rotateX(PI/2); arch.rotateZ(PI/2);
    g.add(mesh(arch,M.woodD));
    g.children[g.children.length-1].position.set(x[0],0.56,-0.018);
    put(g,sph(0.02,6,M.gold),x[0]+0.11,0.32,0.012);
  });
  var plaque=textPlate('中央车站',0.62,0.17); put(g,plaque,0,0.78,-0.005);

  var clock=grp(); clock.position.set(0,0.99,0); g.add(clock);
  var face=mesh(new THREE.CylinderGeometry(0.11,0.11,0.03,20),M.white);
  face.rotation.x=PI/2; face.position.z=0.02; clock.add(face);
  var ring=mesh(new THREE.TorusGeometry(0.11,0.015,8,28),M.gold);
  ring.position.z=0.02; clock.add(ring);
  var minH=box(0.013,0.088,0.008, M.ink, 0,0.038,0.045); clock.add(minH);
  var hrH =box(0.016,0.06,0.008,  M.ink, 0,0.024,0.042); clock.add(hrH);
  put(clock,sph(0.012,8,M.gold),0,0,0.05);
  anim(g,function(t){ minH.rotation.z=-t*0.42; hrH.rotation.z=-t*0.035; });

  [-0.72,-0.24,0.24,0.72].forEach(function(x){
    g.add(cyl(0.05,0.06,0.72,10,M.redCol,x,0.44,0.06));
    g.add(cyl(0.07,0.07,0.05,10,M.gold, x,0.095,0.06));
    g.add(cyl(0.065,0.055,0.04,10,M.gold,x,0.82,0.06));
  });
  g.add(box(1.9,0.1,0.14, M.lacquer, 0,0.89,0.03));

  var rf=hipRoof(2.35,1.95,0.55,{mat:M.glazeY,eaveMat:M.lacquer});
  rf.position.set(0,1.02,-0.28); g.add(rf);

  var l1=wallLamp(); put(g,l1,-0.85,0.72,-0.005);
  var l2=wallLamp(); put(g,l2, 0.85,0.72,-0.005);
  return g;
}

/* ---------- ③ 轮渡码头 ---------- */
function createFerryDock(){
  var g=grp();
  var water=box(2.9,0.06,2.9, M.water, 0,0.0,0); water.castShadow=false; g.add(water);
  g.add(box(2.9,0.05,2.9, M.waterDeep, 0,-0.05,0));

  var i;
  for(i=0;i<8;i++){
    var mat=(i%2)?M.woodM:M.woodD;
    g.add(box(0.165,0.05,1.4, mat, -0.65+i*0.186,0.105,-0.75));
  }
  g.add(box(1.5,0.05,0.06, M.woodD, 0,0.075,-1.42));
  g.add(box(1.5,0.05,0.06, M.woodD, 0,0.075,-0.08));

  var b1=bollard(1); put(g,b1, 0.52,0.13,-0.16);
  var b2=bollard(1); put(g,b2,-0.52,0.13,-0.16);
  var ropePts=[new THREE.Vector3(0.52,0.24,-0.16), new THREE.Vector3(0.3,0.1,0.14), new THREE.Vector3(0.05,0.24,0.34)];
  var rope=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePts),12,0.011,5),M.rope);
  g.add(rope);

  var boat=grp(); boat.position.set(0.32,0,0.62); boat.rotation.y=-0.32; g.add(boat);
  var hullShape=new THREE.Shape();
  hullShape.moveTo(-0.4,0.19); hullShape.lineTo(0.28,0.09); hullShape.lineTo(0.45,0);
  hullShape.lineTo(0.28,-0.09); hullShape.lineTo(-0.4,-0.19); hullShape.closePath();
  var hullGeo=new THREE.ExtrudeGeometry(hullShape,{depth:0.24,bevelEnabled:true,bevelThickness:0.045,bevelSize:0.035,bevelSegments:1});
  hullGeo.rotateX(-PI/2);
  var hull=mesh(hullGeo,M.white); hull.position.y=-0.055; boat.add(hull);
  boat.add(box(0.55,0.045,0.012, M.redLacquer, -0.02,0.055, 0.185));
  boat.add(box(0.55,0.045,0.012, M.redLacquer, -0.02,0.055,-0.185));
  boat.add(box(0.72,0.02,0.34, M.woodM, -0.02,0.205,0));
  boat.add(box(0.34,0.2,0.3,  M.white, -0.12,0.315,0));
  boat.add(box(0.28,0.05,0.24, M.ink,   -0.12,0.39,0));
  boat.add(box(0.4,0.03,0.36, M.redCol, -0.12,0.435,0));
  boat.add(cyl(0.032,0.042,0.16,8,M.redLacquer,-0.36,0.44,0));
  put(boat,cyl(0.04,0.04,0.02,8,M.gold,-0.36,0.53,0));
  boat.add(cyl(0.012,0.012,0.34,6,M.steelD,0.3,0.38,0));
  boat.add(box(0.016,0.016,0.13, M.steelD, 0.3,0.545,0.06));
  var bl=lantern(0.75,0.6); put(boat,bl,0.3,0.45,0.125);
  anim(g,function(t){
    boat.position.y=sin(t*1.25)*0.014;
    boat.rotation.z=sin(t*1.05)*0.02;
    boat.rotation.x=sin(t*0.9+1)*0.012;
  });

  [[-0.68,-1.38],[0.68,-1.38],[-0.68,-0.12],[0.68,-0.12],[-0.68,-0.75],[0.68,-0.75]].forEach(function(p){
    g.add(cyl(0.045,0.05,0.55,7,M.woodD,p[0],0.12,p[1]));
    put(g,cyl(0.048,0.048,0.02,7,M.woodL,p[0],0.41,p[1]));
  });

  var ring=mesh(new THREE.TorusGeometry(0.085,0.028,8,18),M.warn);
  ring.position.set(-0.6,0.42,-0.12); g.add(ring);
  g.add(box(0.03,0.05,0.03, M.white, -0.6,0.5,-0.12));

  for(i=0;i<2;i++){
    (function(idx){
      var rm=new THREE.Mesh(new THREE.RingGeometry(0.9,1,24),fxMat('#dff2fb',0.4,false));
      rm.rotation.x=-PI/2; rm.position.set(0.32,0.033,0.62); rm.castShadow=false; g.add(rm);
      anim(g,function(t){
        var u=(t*0.5+idx*0.5)%1, s=0.55+u*0.55;
        rm.scale.set(s,s,1); rm.material.opacity=0.4*(1-u);
      });
    })(i);
  }

  g.add(cyl(0.016,0.02,0.7,6,M.woodD,0.6,0.48,-1.34));
  g.add(box(0.018,0.018,0.12, M.woodD, 0.6,0.82,-1.28));
  var dl=lantern(0.85,2.1); put(g,dl,0.6,0.72,-1.22);
  return g;
}

/* ---------- ④ 国际机场 ---------- */
function createAirport(){
  var g=grp();
  g.add(box(2.9,0.06,2.9, M.concrete, 0,0.03,0));
  g.add(box(2.9,0.012,0.06, M.warn, 0,0.062,0.42));
  g.add(box(0.06,0.012,1.0, M.warn, 0.62,0.062,0.9));

  g.add(box(2.3,0.95,0.6, M.plaster, 0,0.535,-0.95));
  g.add(box(2.36,0.1,0.66, M.stoneM, 0,0.1,-0.95));
  g.add(box(2.1,0.02,1.15, M.plaster2, 0,0.075,-0.6));
  g.add(box(0.34,0.36,0.12, M.white, -0.55,0.235,-0.75));
  g.add(box(0.34,0.36,0.12, M.white,  0.1,0.235,-0.75));

  var roofGeo=new THREE.CylinderGeometry(0.62,0.62,2.3,20,1,true,0,PI);
  roofGeo.rotateZ(PI/2);
  var roof=mesh(roofGeo,M.glass); roof.position.set(0,1.01,-0.75); roof.castShadow=false; g.add(roof);
  var i;
  for(i=0;i<5;i++){
    var rib=mesh(new THREE.TorusGeometry(0.625,0.018,6,20,PI),M.steel);
    rib.rotation.y=PI/2; rib.position.set(-0.92+i*0.46,1.01,-0.75); g.add(rib);
  }
  g.add(box(2.34,0.05,0.06, M.steel, 0,1.635,-0.75));

  for(i=0;i<6;i++){
    var x=-1.0+i*0.4;
    g.add(cyl(0.045,0.055,0.86,10,M.redCol,x,0.5,-0.28));
    g.add(cyl(0.06,0.06,0.04,8,M.gold,x,0.1,-0.28));
    g.add(cyl(0.055,0.045,0.035,8,M.gold,x,0.945,-0.28));
  }
  g.add(box(2.3,0.08,0.12, M.lacquer, 0,0.975,-0.28));
  var curtain=box(2.3,0.82,0.02, M.glass, 0,0.52,-0.28); curtain.castShadow=false; g.add(curtain);
  for(i=0;i<5;i++) g.add(box(0.03,0.82,0.03, M.steelD, -0.9+i*0.45,0.52,-0.28));
  g.add(box(0.56,0.6,0.035, M.steelD, 0,0.37,-0.28));
  g.add(box(0.02,0.6,0.045, M.gold, 0,0.37,-0.28));
  var plate=textPlate('国际机场',0.62,0.17); put(g,plate,0,1.13,-0.2);

  var tw=grp(); tw.position.set(-1.26,0.06,0.05); g.add(tw);
  tw.add(cyl(0.07,0.09,0.66,10,M.white,0,0.33,0));
  tw.add(cyl(0.075,0.075,0.03,10,M.redCol,0,0.42,0));
  tw.add(cyl(0.072,0.072,0.03,10,M.redCol,0,0.2,0));
  tw.add(cyl(0.13,0.105,0.13,8,M.glass,0,0.73,0));
  var cab=mesh(new THREE.ConeGeometry(0.15,0.09,8),M.redCol);
  cab.position.y=0.84; tw.add(cab);
  tw.add(cyl(0.008,0.008,0.2,5,M.steelD,0,0.97,0));
  var dish=mesh(new THREE.SphereGeometry(0.05,8,6,0,PI),M.white);
  dish.position.set(0.03,1.06,0); dish.rotation.z=PI/2; tw.add(dish);
  anim(g,function(t){ dish.rotation.y=t*2.6; });

  var plane=grp(); plane.position.set(0.55,0.06,0.88); plane.rotation.y=-0.55; g.add(plane);
  var fus=mesh(new THREE.CapsuleGeometry(0.105,0.62,4,10),M.white);
  fus.rotation.z=PI/2; fus.position.y=0.2; plane.add(fus);
  var cockpit=box(0.13,0.04,0.026, M.ink, 0.3,0.24,0); cockpit.rotation.z=-0.3; plane.add(cockpit);
  plane.add(box(0.62,0.02,0.006, M.redLacquer, -0.03,0.185, 0.098));
  plane.add(box(0.62,0.02,0.006, M.redLacquer, -0.03,0.185,-0.098));
  plane.add(box(0.5,0.03,0.005, M.ink, -0.06,0.225, 0.104));
  plane.add(box(0.5,0.03,0.005, M.ink, -0.06,0.225,-0.104));
  var fin=box(0.16,0.22,0.02, M.white, -0.36,0.36,0); fin.rotation.z=0.3; plane.add(fin);
  var finTop=box(0.16,0.09,0.024, M.redLacquer, -0.41,0.45,0); finTop.rotation.z=0.3; plane.add(finTop);
  plane.add(box(0.1,0.012,0.32, M.white, -0.34,0.24,0));
  var wingL=box(0.22,0.014,0.38, M.white, -0.02,0.17, 0.2); wingL.rotation.x=-0.07; plane.add(wingL);
  var wingR=box(0.22,0.014,0.38, M.white, -0.02,0.17,-0.2); wingR.rotation.x= 0.07; plane.add(wingR);
  [[0.26],[-0.26]].forEach(function(z){
    var en=mesh(new THREE.CapsuleGeometry(0.042,0.1,3,8),M.white);
    en.rotation.z=PI/2; en.position.set(0.05,0.135,z[0]); plane.add(en);
    var rg=mesh(new THREE.TorusGeometry(0.044,0.012,6,12),M.redLacquer);
    rg.rotation.y=PI/2; rg.position.set(0.11,0.135,z[0]); plane.add(rg);
  });
  [[0.22,0],[-0.14,0.05],[-0.14,-0.05]].forEach(function(p){
    plane.add(cyl(0.008,0.008,0.07,5,M.steelD,p[0],0.07,p[1]));
    var wl=mesh(new THREE.CylinderGeometry(0.032,0.032,0.02,10),M.ink);
    wl.rotation.x=PI/2; wl.position.set(p[0],0.035,p[1]); plane.add(wl);
  });
  return g;
}

/* ---------- ⑤ 电力公司 ---------- */
function createPowerPlant(){
  var g=grp();
  g.add(box(2.9,0.06,2.9, M.concrete, 0,0.03,0));

  var prof=[[0.47,0],[0.44,0.1],[0.32,0.4],[0.295,0.62],[0.33,0.88],[0.385,1.05],[0.39,1.1]]
    .map(function(p){ return new THREE.Vector2(p[0],p[1]); });
  var tower=mesh(new THREE.LatheGeometry(prof,16),std('#d8d3c6',{rough:.95}));
  tower.position.set(0.55,0.06,-0.55); g.add(tower);
  g.add(cyl(0.36,0.36,0.02,16,M.ink,0.55,1.15,-0.55));
  var i;
  for(i=0;i<6;i++){
    (function(idx){
      var pm=new THREE.Mesh(new THREE.SphereGeometry(1,7,6),
        new THREE.MeshStandardMaterial({color:C('#ffffff'),transparent:true,opacity:0.3,roughness:1,flatShading:true,depthWrite:false}));
      pm.castShadow=false; g.add(pm);
      var base=0.09+ (idx%3)*0.02;
      anim(g,function(t){
        var u=(t*0.16+idx/6)%1;
        pm.position.set(0.55+sin(u*6+idx)*0.06*u, 1.18+u*0.6, -0.55);
        var s=(0.5+u*1.5)*base;
        pm.scale.set(s,s*0.8,s);
        pm.material.opacity=0.32*(1-u)*Math.min(1,u*12);
      });
    })(i);
  }

  var py=grp(); py.position.set(-0.95,0.06,-0.3); g.add(py);
  [[0.26,0.26],[-0.26,0.26],[0.26,-0.26],[-0.26,-0.26]].forEach(function(c){
    var leg=cyl(0.016,0.026,1.5,6,M.steelD,c[0]*0.62,0.82,c[1]*0.62);
    leg.rotation.z=(c[0]>0?-1:1)*0.1; leg.rotation.x=(c[1]>0?1:-1)*0.1;
    py.add(leg);
  });
  [[0.22,0.3],[0.55,0.7],[0.9,1.1]].forEach(function(b){
    py.add(box(b[0]*2,0.02,0.02, M.steelD, 0,b[1], 0.24*(1-b[1]/1.6)));
    py.add(box(b[0]*2,0.02,0.02, M.steelD, 0,b[1],-0.24*(1-b[1]/1.6)));
    py.add(box(0.02,0.02,b[0]*2, M.steelD, 0.24*(1-b[1]/1.6),b[1],0));
    py.add(box(0.02,0.02,b[0]*2, M.steelD,-0.24*(1-b[1]/1.6),b[1],0));
  });
  for(i=0;i<4;i++){
    var dg=box(0.34,0.016,0.016, M.steelD, 0,0.5+i*0.28, (i%2?0.2:-0.2));
    dg.rotation.y= (i<2? PI/2:0); dg.rotation.z= (i%2?0.62:-0.62);
    py.add(dg);
  }
  py.add(box(0.92,0.03,0.03, M.steelD, 0,1.36,0));
  py.add(box(0.62,0.03,0.03, M.steelD, 0,1.08,0));
  [[0.42,1.4],[0.28,1.4],[-0.42,1.4],[-0.28,1.4],[0.27,1.12],[-0.27,1.12]].forEach(function(p){
    py.add(cyl(0.011,0.013,0.06,6,M.ceramic,p[0],p[1],0));
    py.add(cyl(0.03,0.03,0.012,8,M.ceramic,p[0],p[1]-0.045,0));
    py.add(cyl(0.024,0.024,0.012,8,M.ceramic,p[0],p[1]-0.062,0));
  });
  function wire(a,b){
    var mid=a.clone().lerp(b,0.5); mid.y=Math.min(a.y,b.y)-0.16;
    var curve=new THREE.QuadraticBezierCurve3(a,mid,b);
    var w=mesh(new THREE.TubeGeometry(curve,12,0.005,4),M.ink); w.castShadow=false; g.add(w);
  }
  wire(new THREE.Vector3(-0.53,1.42,-0.3), new THREE.Vector3(-1.45,0.5,-0.3));
  wire(new THREE.Vector3(-1.37,1.42,-0.3), new THREE.Vector3(-1.45,0.35,-0.85));
  wire(new THREE.Vector3(-1.23,1.14,-0.3), new THREE.Vector3(-1.45,0.42,0.25));
  var beacon=sph(0.022,8,std('#c0392b',{emissive:'#ff2d1a',ei:1})), bmat=beacon.material;
  put(py,beacon,0,1.62,0);
  anim(g,function(t){ bmat.emissiveIntensity=(sin(t*3.2)>0.2)?1.4:0.15; });

  var tr=grp(); tr.position.set(0.72,0.06,0.6); g.add(tr);
  tr.add(box(0.74,0.09,0.54, M.stoneD, 0,0.045,0));
  for(i=0;i<4;i++) tr.add(box(0.09,0.02,0.02,(i%2)?M.warn:M.ink,-0.28+i*0.19,0.045,0.272));
  tr.add(box(0.4,0.32,0.26, std('#647a6e',{rough:.5,metal:.4}), 0,0.25,0));
  [[-0.21,0.06],[-0.21,-0.06],[0.21,0.06],[0.21,-0.06]].forEach(function(p){
    tr.add(box(0.02,0.24,0.09, M.steelD, p[0],0.25,p[1]));
  });
  [[-0.12],[0],[0.12]].forEach(function(x){
    tr.add(cyl(0.014,0.018,0.09,6,M.ceramic,x[0],0.455,0));
    tr.add(cyl(0.033,0.033,0.012,8,M.ceramic,x[0],0.42,0));
    put(tr,sph(0.014,6,M.gold),x[0],0.505,0);
  });
  tr.add(box(0.16,0.24,0.12, M.steelD, 0.52,0.21,0.1));
  tr.add(sph(0.014,6,std('#39b06e',{emissive:'#2dff8d',ei:.9})));
  tr.children[tr.children.length-1].position.set(0.52,0.27,0.165);
  tr.add(sph(0.014,6,std('#c0392b',{emissive:'#ff2d1a',ei:.9})));
  tr.children[tr.children.length-1].position.set(0.485,0.27,0.165);
  var lead=new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0.72,0.62,0.6), new THREE.Vector3(0.1,1.05,0.2), new THREE.Vector3(-0.53,1.4,-0.3));
  var leadM=mesh(new THREE.TubeGeometry(lead,14,0.005,4),M.ink); leadM.castShadow=false; g.add(leadM);

  var fb=fence(2.7); put(g,fb,0,0.06,-1.32);
  var fll=fence(1.9); fll.rotation.y=PI/2; put(g,fll,-1.34,0.06,-0.37);
  var flr=fence(1.9); flr.rotation.y=PI/2; put(g,flr, 1.34,0.06,-0.37);
  return g;
}

/* ---------- ⑥ 自来水厂 ---------- */
function createWaterPlant(){
  var g=grp();
  g.add(box(2.9,0.06,2.9, M.grass, 0,0.03,0));
  g.add(box(0.45,0.02,1.2, M.concrete, -0.35,0.065,0.85));

  var tw=grp(); tw.position.set(0.55,0.06,-0.5); g.add(tw);
  var i;
  for(i=0;i<6;i++){
    var pv=grp(); pv.rotation.y=i*PI/3; tw.add(pv);
    var leg=cyl(0.02,0.028,1.0,6,M.steel,0.25,0.5,0);
    leg.rotation.z=0.1; pv.add(leg);
  }
  var r1=mesh(new THREE.TorusGeometry(0.27,0.013,6,24),M.steelD);
  r1.rotation.x=PI/2; r1.position.y=0.42; tw.add(r1);
  var r2=mesh(new THREE.TorusGeometry(0.225,0.013,6,24),M.steelD);
  r2.rotation.x=PI/2; r2.position.y=0.82; tw.add(r2);
  tw.add(cyl(0.15,0.335,0.18,14,M.pipe,0,1.09,0));
  tw.add(cyl(0.34,0.34,0.42,14,std('#3181bd',{rough:.45,metal:.1}),0,1.39,0));
  tw.add(cyl(0.345,0.345,0.1,14,M.white,0,1.46,0));
  tw.add(cyl(0.345,0.345,0.02,14,M.white,0,1.63,0));
  tw.add(cyl(0.3,0.34,0.05,14,M.white,0,1.635,0));
  var cap=mesh(new THREE.ConeGeometry(0.35,0.17,14),M.white); cap.position.y=1.75; tw.add(cap);
  put(tw,sph(0.032,8,M.gold),0,1.86,0);
  var wplate=textPlate('供水',0.26,0.11); put(tw,wplate,0,1.46,0.345);

  tw.add(box(0.014,1.15,0.014, M.steelD, -0.055,0.62,0.36));
  tw.add(box(0.014,1.15,0.014, M.steelD,  0.055,0.62,0.36));
  for(i=0;i<8;i++) tw.add(box(0.11,0.012,0.012, M.steelD, 0,0.12+i*0.14,0.36));

  tw.add(cyl(0.045,0.045,1.05,10,M.pipe,0,0.55,0));

  var ph=grp(); ph.position.set(-0.7,0.06,0.55); g.add(ph);
  ph.add(box(0.85,0.55,0.62, M.plaster, 0,0.275,0));
  ph.add(box(0.9,0.1,0.66, M.stoneM, 0,0.05,0));
  ph.add(box(0.3,0.34,0.03, M.ironD, 0.14,0.26,0.31));
  for(i=0;i<3;i++) ph.add(box(0.26,0.014,0.032, M.steelD, 0.14,0.16+i*0.1,0.315));
  var pw=barredWindow(0.16,0.14,2,{frameMat:M.steelD}); put(ph,pw,-0.22,0.33,0.315);
  var phr=hipRoof(1.02,0.8,0.26,{mat:M.tileD,eaveMat:M.lacquer,ornaments:false});
  phr.position.y=0.56; ph.add(phr);

  var pipeR=0.042;
  function pipeRun(from,to){
    var dir=to.clone().sub(from), len=dir.length();
    var p=mesh(new THREE.CylinderGeometry(pipeR,pipeR,len,10),M.pipe);
    p.position.copy(from).lerp(to,0.5);
    p.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
    g.add(p);
  }
  var V=THREE.Vector3;
  pipeRun(new V(-0.27,0.22,0.55), new V(0.55,0.22,0.55));
  pipeRun(new V(0.55,0.22,0.55),  new V(0.55,0.22,-0.4));
  put(g,sph(0.05,8,M.pipe),0.55,0.22,0.55);
  put(g,sph(0.05,8,M.pipe),0.55,0.22,-0.4);
  [[-0.1,0.55],[0.55,0.15]].forEach(function(p){
    var f=cyl(0.062,0.062,0.02,10,M.steelD,p[0],0.22,p[1]);
    if(p[1]!==0.55) f.rotation.x=PI/2;
    g.add(f);
  });
  g.add(cyl(0.014,0.014,0.1,6,M.steelD,0.55,0.27,0.1));
  var wheel=mesh(new THREE.TorusGeometry(0.055,0.012,6,16),M.redLacquer);
  wheel.position.set(0.55,0.33,0.1); g.add(wheel);
  for(i=0;i<3;i++){
    var spoke=box(0.1,0.008,0.008, M.redLacquer, 0.55,0.33,0.1);
    spoke.rotation.y=i*PI/3; g.add(spoke);
  }
  anim(g,function(t){ wheel.rotation.y=t*0.6; });

  var hy=grp(); hy.position.set(-0.1,0.06,1.1); g.add(hy);
  hy.add(cyl(0.032,0.042,0.13,8,M.redLacquer,0,0.065,0));
  hy.add(sph(0.034,8,M.redLacquer,0,0.14,0));
  hy.add(cyl(0.012,0.012,0.05,6,M.redLacquer,0,0.185,0));
  var nz1=cyl(0.014,0.014,0.05,6,M.redLacquer,0,0.09,0.045); nz1.rotation.x=PI/2; hy.add(nz1);
  var nz2=cyl(0.014,0.014,0.05,6,M.redLacquer,0,0.09,-0.045); nz2.rotation.x=PI/2; hy.add(nz2);
  [[-1.2,0.9,0.16],[-1.05,1.15,0.12]].forEach(function(p,idx){
    var b=mesh(new THREE.IcosahedronGeometry(p[2],0), idx?M.greenD:M.green);
    b.position.set(p[0],0.06+p[2]*0.7,p[1]); b.scale.y=0.85; g.add(b);
  });
  [[0.9,1.2],[1.15,1.0],[0.75,-1.25]].forEach(function(p,idx){
    var s=mesh(new THREE.DodecahedronGeometry(0.05+idx*0.015,0),M.stoneL);
    s.position.set(p[0],0.075,p[1]); g.add(s);
  });
  return g;
}

/* ---------- ⑦ 道具商店 ---------- */
function createPropShop(){
  var g=grp();
  g.add(box(2.9,0.06,2.9, std('#d8c7a4',{rough:.9}), 0,0.03,0));
  g.add(box(1.6,0.09,1.15, M.woodM, 0,0.105,-0.25));

  g.add(box(1.6,0.95,0.09, M.plaster, 0,0.63,-0.78));
  g.add(box(0.09,0.95,1.0, M.plaster, -0.755,0.63,-0.3));
  g.add(box(0.09,0.95,1.0, M.plaster,  0.755,0.63,-0.3));
  g.add(cyl(0.05,0.058,1.0,10,M.redCol,-0.7,0.62,0.2));
  g.add(cyl(0.05,0.058,1.0,10,M.redCol, 0.7,0.62,0.2));
  g.add(box(1.62,0.1,0.13, M.lacquer, 0,1.16,0.16));

  g.add(box(1.3,0.34,0.26, M.woodD, 0,0.32,-0.12));
  g.add(box(1.38,0.035,0.3, M.woodL, 0,0.505,-0.12));
  g.add(box(1.3,0.03,0.2, M.woodM, 0,0.62,-0.66));
  g.add(box(1.3,0.03,0.2, M.woodM, 0,0.85,-0.66));
  g.add(box(0.035,0.52,0.2, M.woodD, -0.63,0.62,-0.66));
  g.add(box(0.035,0.52,0.2, M.woodD,  0.63,0.62,-0.66));

  var i;
  for(i=0;i<4;i++){
    var sc=mesh(new THREE.CylinderGeometry(0.032,0.032,0.16,8),M.parchment);
    sc.rotation.z=PI/2; sc.position.set(-0.45+i*0.2,0.665,-0.66); g.add(sc);
    var cap1=cyl(0.034,0.034,0.014,8,M.redLacquer,-0.45+i*0.2-0.08,0.665,-0.66); cap1.rotation.z=PI/2; g.add(cap1);
    var cap2=cyl(0.034,0.034,0.014,8,M.redLacquer,-0.45+i*0.2+0.08,0.665,-0.66); cap2.rotation.z=PI/2; g.add(cap2);
  }
  var potCols=['#d84b3a','#3f7fd4','#3fae6e','#d8a63c'];
  for(i=0;i<4;i++){
    var bt=grp(); bt.position.set(-0.42+i*0.28,0.9,-0.66); g.add(bt);
    bt.add(cyl(0.026,0.032,0.06,8,std(potCols[i],{rough:.2,opacity:.85,emissive:potCols[i],ei:.25}),0,0.03,0));
    bt.add(cyl(0.011,0.011,0.03,6,M.parchment,0,0.075,0));
    bt.add(cyl(0.013,0.013,0.02,6,M.woodL,0,0.095,0));
  }
  for(i=0;i<3;i++){
    var yg=sph(0.035,8,M.gold,-0.25+i*0.25,0.532,-0.12);
    yg.scale.set(1,0.45,0.62); g.add(yg);
  }
  var chest=grp(); chest.position.set(0.95,0.06,0.45); chest.rotation.y=0.4; g.add(chest);
  chest.add(box(0.26,0.15,0.18, M.woodM, 0,0.075,0));
  chest.add(box(0.27,0.05,0.19, M.woodD, 0,0.17,0));
  chest.add(box(0.28,0.02,0.03, M.gold, 0,0.1,0));
  chest.add(box(0.03,0.16,0.03, M.gold, 0,0.11,0.09));
  var barrel=grp(); barrel.position.set(-0.95,0.06,0.42); g.add(barrel);
  barrel.add(cyl(0.11,0.09,0.2,10,M.woodM,0,0.1,0));
  [[0.05],[0.15]].forEach(function(y){
    var t=mesh(new THREE.TorusGeometry(0.105,0.012,6,14),M.ironD);
    t.rotation.x=PI/2; t.position.y=y[0]; barrel.add(t);
  });

  var arcN=9;
  for(i=0;i<arcN;i++){
    var tt=i/(arcN-1), a=(18+64*tt)*PI/180;
    var seg=box(1.46,0.018,0.15,(i%2)?M.paintW:M.redLacquer);
    seg.position.set(0, 0.9-cos(a)*0.42, 0.16+sin(a)*0.42);
    seg.rotation.x=-a*0.5;
    g.add(seg);
  }
  var rod=cyl(0.012,0.012,1.5,6,M.woodD,0,0.9,0.56); rod.rotation.z=PI/2; g.add(rod);

  var rf=hipRoof(1.95,1.5,0.45,{mat:M.glazeG,eaveMat:M.lacquer});
  rf.position.set(0,1.2,-0.3); g.add(rf);
  var fascia=box(0.86,0.24,0.05, M.woodD, 0,1.02,0.24); g.add(fascia);
  var plaque=textPlate('道具商店',0.74,0.2); put(g,plaque,0,1.02,0.26);

  var l1=lantern(0.9,0.3); put(g,l1,-0.66,1.06,0.28);
  var l2=lantern(0.9,2.4); put(g,l2, 0.66,1.06,0.28);
  var hang=grp(); hang.position.set(0.86,0.92,0.05); g.add(hang);
  hang.add(box(0.012,0.14,0.012, M.ironD, 0,0.13,0));
  var hs=textPlate('售',0.16,0.16,{bg:'#8a2f26',fg:'#f2e2b8',border:'#d8a63c'});
  put(hang,hs,0,0,0);
  anim(g,function(t){ hang.rotation.z=sin(t*1.7)*0.08; });
  return g;
}

/* ---------- ⑧ 拘留所入口 ---------- */
function createPoliceEntrance(){
  var g=grp();
  g.add(box(2.9,0.05,1.1, M.asphalt, 0,0.025,0.15));
  g.add(box(2.9,0.07,0.8,  M.concrete, 0,0.035,-0.95));
  g.add(box(2.9,0.07,0.5,  M.concrete, 0,0.035,1.2));
  g.add(box(0.9,0.012,0.08, M.paintW, -0.62,0.055,0.78));

  var gh=grp(); gh.position.set(1.0,0.07,-0.55); g.add(gh);
  gh.add(box(0.68,1.1,0.58, M.stoneM, 0,0.55,0));
  [[-0.32,-0.27],[0.32,-0.27],[-0.32,0.27],[0.32,0.27]].forEach(function(c){
    gh.add(box(0.07,1.1,0.07, M.stoneL, c[0],0.55,c[1]));
  });
  var ghr=hipRoof(0.88,0.76,0.3,{mat:M.slate,eaveMat:M.lacquer,ornaments:false});
  ghr.position.y=1.1; gh.add(ghr);
  var badge=grp(); badge.position.set(0,0.82,0.3); gh.add(badge);
  var wl=box(0.13,0.04,0.02, M.gold, -0.2,0.01,0); wl.rotation.z= 0.32; badge.add(wl);
  var wr=box(0.13,0.04,0.02, M.gold,  0.2,0.01,0); wr.rotation.z=-0.32; badge.add(wr);
  var bdisc=mesh(new THREE.CylinderGeometry(0.14,0.14,0.04,20),M.gold);
  bdisc.rotation.x=PI/2; badge.add(bdisc);
  var core=mesh(new THREE.CylinderGeometry(0.095,0.095,0.045,20),M.redLacquer);
  core.rotation.x=PI/2; core.position.z=0.008; badge.add(core);
  var bstar=starMesh(0.066,0.028,0.02,M.gold); bstar.position.z=0.035; badge.add(bstar);
  var gplate=textPlate('拘留所',0.42,0.13); put(gh,gplate,0,0.56,0.3);
  gh.add(box(0.24,0.46,0.05, M.ironD, 0,0.26,0.29));
  var i;
  for(i=0;i<4;i++) gh.add(box(0.024,0.4,0.024, M.iron, -0.08+i*0.055,0.26,0.32));
  var gw=barredWindow(0.14,0.14,2); put(gh,gw,-0.2,0.72,0.29);

  var bar=grp(); bar.position.set(-0.45,0.07,0.15); g.add(bar);
  bar.add(box(0.24,0.1,0.24, M.ironD, 0,0.05,0));
  bar.add(cyl(0.035,0.042,0.42,8,M.steelD,0,0.28,0));
  bar.add(box(0.11,0.07,0.11, M.ink, 0,0.52,0));
  bar.add(sph(0.014,6,std('#39b06e',{emissive:'#2dff8d',ei:.9})));
  bar.children[bar.children.length-1].position.set(0,0.52,0.06);
  bar.add(sph(0.014,6,std('#c0392b',{emissive:'#ff2d1a',ei:.9})));
  bar.children[bar.children.length-1].position.set(0.035,0.52,0.06);
  var armG=grp(); armG.position.set(0,0.5,0); bar.add(armG);
  armG.add(box(0.15,0.09,0.09, M.ironD, -0.17,0,0));
  for(i=0;i<6;i++) armG.add(box(0.28,0.045,0.045,(i%2)?M.redLacquer:M.paintW, 0.12+i*0.29,0,0));
  armG.add(sph(0.02,6,std('#c0392b',{emissive:'#ff2d1a',ei:1})));
  armG.children[armG.children.length-1].position.set(1.86,0,0);
  anim(g,function(t){ armG.rotation.z=0.38+0.36*sin(t*0.5); });

  var tw=watchTower(0.8); put(g,tw,-1.08,0.07,-0.98);
  var fb=fence(2.1); put(g,fb,0.1,0.07,-1.3);
  var fll=fence(0.9); fll.rotation.y=PI/2; put(g,fll,-1.4,0.07,-0.75);
  var flr=fence(0.55); flr.rotation.y=PI/2; put(g,flr, 1.38,0.07,0.12);
  put(g,bollard(0.9),-1.28,0.07,0.8);
  put(g,bollard(0.9), 1.3,0.07,0.8);
  return g;
}

/* ---------- ⑨ 中央公园喷泉 ---------- */
function createFountain(){
  var g=grp();
  g.add(box(2.9,0.06,2.9, M.grass, 0,0.03,0));
  g.add(cyl(1.32,1.4,0.08,28,M.stoneL,0,0.1,0));
  var ringIn=mesh(new THREE.RingGeometry(1.06,1.14,28),M.stoneD);
  ringIn.rotation.x=-PI/2; ringIn.position.y=0.145; ringIn.castShadow=false; g.add(ringIn);

  g.add(cyl(0.97,1.02,0.3,20,M.stoneM,0,0.29,0));
  var rim=mesh(new THREE.TorusGeometry(1.0,0.05,8,26),M.stoneL);
  rim.rotation.x=PI/2; rim.position.y=0.445; g.add(rim);
  g.add(cyl(0.94,0.94,0.04,20,M.stoneD,0,0.18,0));
  var w1=cyl(0.92,0.92,0.03,20,M.water,0,0.315,0); w1.castShadow=false; g.add(w1);
  g.add(cyl(0.19,0.23,0.12,10,M.stoneD,0,0.42,0));
  g.add(cyl(0.09,0.13,0.44,10,M.stoneL,0,0.66,0));
  var band=mesh(new THREE.TorusGeometry(0.12,0.02,6,14),M.stoneD);
  band.rotation.x=PI/2; band.position.y=0.58; g.add(band);
  g.add(cyl(0.16,0.1,0.08,10,M.stoneD,0,0.9,0));
  g.add(cyl(0.44,0.36,0.08,14,M.stoneL,0,0.97,0));
  var rim2=mesh(new THREE.TorusGeometry(0.43,0.03,8,20),M.stoneD);
  rim2.rotation.x=PI/2; rim2.position.y=1.015; g.add(rim2);
  var w2=cyl(0.4,0.4,0.025,14,M.water,0,1.0,0); w2.castShadow=false; g.add(w2);

  var jetGeo=new THREE.CylinderGeometry(0.02,0.05,0.5,8);
  jetGeo.translate(0,0.25,0);
  var jet=new THREE.Mesh(jetGeo,M.jet); jet.castShadow=false; jet.position.y=1.02; g.add(jet);
  var splash=sph(0.045,8,M.jet,0,1.5,0); splash.castShadow=false; g.add(splash);
  anim(g,function(t){
    var k=1+0.16*sin(t*3.1);
    jet.scale.y=k; splash.position.y=1.02+0.5*k;
    splash.scale.setScalar(0.8+0.35*sin(t*6.2));
  });

  var i;
  for(i=0;i<4;i++){
    var og=grp(); og.rotation.y=i*PI/2+PI/4; g.add(og);
    var curve=new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0.4,1.02,0), new THREE.Vector3(0.52,0.72,0), new THREE.Vector3(0.56,0.34,0));
    var st=new THREE.Mesh(new THREE.TubeGeometry(curve,10,0.009,5),M.jet);
    st.castShadow=false; og.add(st);
  }

  var drops=[];
  for(i=0;i<4;i++){
    (function(idx){
      var a=PI/4+idx*PI/2, dx=cos(a), dz=sin(a);
      var fish=grp(); fish.position.set(dx*0.82,0.47,dz*0.82);
      fish.rotation.y=PI/2-a; g.add(fish);
      var head=mesh(new THREE.ConeGeometry(0.05,0.15,8),M.bronze);
      head.rotation.x=PI/2-0.45; head.position.set(0,0.03,0.05); fish.add(head);
      fish.add(box(0.012,0.05,0.04, M.bronze, 0,0.01,-0.07));
      for(var d=0;d<4;d++){
        var dm=fxMat('#cfeefc',0.7,false);
        var drop=new THREE.Mesh(new THREE.SphereGeometry(0.018,6,5),dm);
        drop.castShadow=false; g.add(drop);
        drops.push({m:drop,mat:dm,dx:dx,dz:dz,ph:idx*0.13+d*0.25});
      }
    })(i);
  }
  anim(g,function(t){
    for(var k=0;k<drops.length;k++){
      var p=drops[k], u=(t*0.8+p.ph)%1, T=u*0.7;
      p.m.position.set(p.dx*0.86+p.dx*T*0.72, 0.5+0.72*T-1.8*T*T, p.dz*0.86+p.dz*T*0.72);
      p.mat.opacity=0.7*(1-u);
    }
  });

  for(i=0;i<3;i++){
    (function(idx){
      var rm=new THREE.Mesh(new THREE.RingGeometry(0.9,1,22),fxMat('#e8f6fd',0.4,false));
      rm.rotation.x=-PI/2; rm.position.y=0.335; rm.castShadow=false; g.add(rm);
      anim(g,function(t){
        var u=(t*0.4+idx/3)%1, s=0.22+u*0.62;
        rm.scale.set(s,s,1); rm.material.opacity=0.4*(1-u);
      });
    })(i);
  }
  [[0.55,0.12],[-0.5,0.3],[0.15,-0.55]].forEach(function(p){
    var lp=mesh(new THREE.CircleGeometry(0.05,8),M.green);
    lp.rotation.x=-PI/2; lp.position.set(p[0],0.335,p[1]); lp.castShadow=false; g.add(lp);
  });

  function bench(x,z,ry){
    var b=grp(); b.position.set(x,0.15,z); b.rotation.y=ry; g.add(b);
    b.add(box(0.5,0.04,0.16, M.woodM, 0,0.1,0));
    b.add(box(0.05,0.1,0.14, M.stoneD, -0.19,0.05,0));
    b.add(box(0.05,0.1,0.14, M.stoneD,  0.19,0.05,0));
  }
  bench(-1.02,-0.35,PI/2); bench(1.02,0.35,PI/2);
  [[0.78,0.78],[-0.78,-0.78]].forEach(function(p,idx){
    var lp2=grp(); lp2.position.set(p[0],0.15,p[1]); g.add(lp2);
    lp2.add(cyl(0.02,0.026,0.5,6,M.ink,0,0.25,0));
    lp2.add(box(0.08,0.1,0.08, M.ink, 0,0.55,0));
    lp2.add(box(0.05,0.06,0.05, M.bulb.clone(), 0,0.55,0));
    lp2.add(cyl(0.045,0.055,0.03,4,M.ink,0,0.62,0));
  });
  return g;
}

/* =====================================================================================
 * 6. 地产建筑系统 —— 22 块地产 × 4 进化阶段，8 地域风格参数化
 * ===================================================================================== */

/* 地板索引 → 地域（与 data.js 的 BOARD 对应）；也支持 0..21 的顺序索引 */
var PROP_TILES=[1,3,6,8,9,10,13,14,16,18,19,21,23,24,26,28,30,33,34,36,38,39];
var TILE_GROUP={1:'g1',3:'g1',6:'g2',8:'g2',9:'g2',10:'g3',13:'g3',14:'g3',16:'g4',18:'g4',19:'g4',
                21:'g5',23:'g5',24:'g5',26:'g6',28:'g6',30:'g6',33:'g7',34:'g7',36:'g7',38:'g8',39:'g8'};
var SEQ_GROUP=['g1','g1','g2','g2','g2','g3','g3','g3','g4','g4','g4','g5','g5','g5','g6','g6','g6','g7','g7','g7','g8','g8'];

/* 各地点点缀色（同一地域内区分不同地点） */
var ACCENTS=['#c85a3a','#4a7ba8','#4a8a5a','#d8a04a','#8a5aa0','#d4783a','#3a8a8a','#b8486a'];

/* 8 地域风格表：墙体 / 屋顶类型与颜色 / 装饰 */
var REGIONS={
  g1:{ sign:'福', wall:'#d9cdb0', wallD:'#b8a988', trim:'#a83b2a', wood:'#6d4a2a',
       roofType:'gable', roof:'#565666', ridge:'#3a3a46', deco:'moon',    lanterns:true  },
  g2:{ sign:'商', wall:'#e9ddc4', wallD:'#9c5644', trim:'#7a4636', wood:'#5d3a2a',
       roofType:'gable', roof:'#4e5560', ridge:'#363b44', deco:'arch',    lanterns:true  },
  g3:{ sign:'茶', wall:'#f0e2c6', wallD:'#d9c8a4', trim:'#3f7fd4', wood:'#8a6242',
       roofType:'flat',  roof:'#8a94a0', ridge:'#66707c', deco:'arcade',  lanterns:false,
       louver:['#d4483a','#3f7fd4','#3fae6e','#e8b93c'] },
  g4:{ sign:'辣', wall:'#efe4cc', wallD:'#c8b896', trim:'#a83b2a', wood:'#7a5b3a',
       roofType:'gable', roof:'#655846', ridge:'#4a4034', deco:'bamboo',  lanterns:true  },
  g5:{ sign:'桥', wall:'#f4f0e6', wallD:'#d8d2c2', trim:'#4e7d5e', wood:'#4a5a4c',
       roofType:'hip',   roof:'#3e4550', ridge:'#2c313a', deco:'bridge',  lanterns:true  },
  g6:{ sign:'唐', wall:'#f0e6d0', wallD:'#d2c2a0', trim:'#c85a3a', wood:'#a83b2a',
       roofType:'sweep', roof:'#565666', ridge:'#3a3a46', deco:'gold',    lanterns:true  },
  g7:{ sign:'夜', wall:'#c9cdd6', wallD:'#a6abb6', trim:'#e84a6a', wood:'#4a4e58',
       roofType:'flat',  roof:'#4a4e58', ridge:'#363a42', deco:'neon',    lanterns:false,
       neon:['#ff4a6a','#2dff8d','#3fa0ff','#ffd23c'] },
  g8:{ sign:'市', wall:'#f2e2be', wallD:'#d6c298', trim:'#f08c3d', wood:'#8a5a3a',
       roofType:'flat',  roof:'#8a5a3a', ridge:'#6a4428', deco:'bulbs',   lanterns:true  }
};

/* 地产地坪 2.8×2.8×0.06 */
function propPad(g){
  g.add(box(2.8,0.06,2.8, M.padL, 0,0.03,0));
  g.add(box(2.55,0.012,2.55, M.padIn, 0,0.066,0));
}

/* 按地域铺屋顶（原点 = 墙顶） */
function roofApply(parent,R,w,d,y,h,big){
  var g;
  if(R.roofType==='flat'){
    g=flatTop(w,d,MAT(R.roof));
  } else if(R.roofType==='hip'){
    g=hipRoof(w,d,h,{mat:MAT(R.roof),eaveMat:MAT(R.trim),ornaments:false});
  } else if(R.roofType==='sweep'){
    g=hipRoof(w,d,h,{lift:big?0.12:0.09,mat:MAT(R.roof),eaveMat:MAT(R.trim),ornMat:M.gold});
  } else {
    g=gableRoof(w,d,h,{mat:MAT(R.roof),ridgeMat:MAT(R.ridge),gableMat:MAT(R.wall)});
  }
  g.position.y=y; parent.add(g);
  return g;
}

/* 沿街店面：内嵌店口 + 柜台 + 遮阳篷 + 字招牌 */
function shopFront(g,R,acc,sign,w,fz){
  g.add(box(w*0.66,0.46,0.022, M.winD, 0,0.33,fz+0.012));
  g.add(box(w*0.6,0.06,0.14, MAT(R.wood), 0,0.21,fz+0.09));
  g.add(sph(0.045,8,MAT(acc),-w*0.18,0.27,fz+0.09));
  g.add(sph(0.045,8,MAT(acc), w*0.14,0.27,fz+0.09));
  var aw=awning(w*0.92, 0.26, M.paintW, MAT(acc));
  aw.position.set(0,0.66,fz); g.add(aw);
  var sp=textPlate(sign, w*0.44, 0.15, {bg:acc, fg:'#f6ead0', border:'#6a4a20'});
  sp.position.set(0,0.87,fz+0.02); g.add(sp);
}

/* 地域装饰（阶段 ≥2 追加在建筑前后） */
function decoApply(B,R,acc,stage,flip,fz){
  var side=flip?-1:1, i;
  if(R.deco==='moon'){
    var mw=moonWall(2.3,0.42,0.16,MAT('#c9bda0'),M.stoneD);
    mw.position.set(0,0.06,1.02); B.add(mw);
    [[-1.08,0.4],[1.08,2.1]].forEach(function(p){
      B.add(box(0.06,0.5,0.06,MAT(R.wood),p[0],0.31,1.02));
      var l=lantern(0.62,p[1]); l.position.set(p[0],0.62,1.02); B.add(l);
    });
  } else if(R.deco==='arch'){
    B.add(box(1.9,0.055,0.02,MAT('#9c5644'),0,0.98,fz+0.014));
    B.add(box(1.9,0.055,0.02,MAT('#9c5644'),0,1.3,fz+0.014));
    B.add(box(0.08,0.6,0.05,M.stoneM,-0.25,0.36,fz+0.02));
    B.add(box(0.08,0.6,0.05,M.stoneM, 0.25,0.36,fz+0.02));
    var ag=new THREE.CylinderGeometry(0.29,0.29,0.05,12,1,false,0,PI);
    ag.rotateX(PI/2); ag.rotateZ(PI/2);
    var arc=mesh(ag,M.stoneM); arc.position.set(0,0.66,fz+0.02); B.add(arc);
  } else if(R.deco==='arcade'){
    var xs=[-0.52,-0.18,0.18,0.52];
    for(i=0;i<4;i++){
      B.add(cyl(0.034,0.04,0.52,8,MAT(R.wall),xs[i],0.32,fz+0.09));
      B.add(box(0.1,0.03,0.1,MAT(R.trim),xs[i],0.6,fz+0.09));
    }
  } else if(R.deco==='bamboo'){
    var bc=bambooClump(); bc.position.set(side*0.95,0.06,side*0.55); B.add(bc);
    var bc2=bambooClump(); bc2.position.set(-side*1.05,0.06,-0.75); bc2.scale.setScalar(0.8); B.add(bc2);
  } else if(R.deco==='bridge'){
    var tb=tinyBridge(); tb.position.set(-0.62,0.07,1.0); B.add(tb);
    var lp=mesh(new THREE.CircleGeometry(0.05,8),M.green);
    lp.rotation.x=-PI/2; lp.position.set(-0.05,0.088,1.05); B.add(lp);
  } else if(R.deco==='gold'){
    var c1=redGoldColumn(0.5,0.045); c1.position.set( 0.62,0.06,fz+0.14); B.add(c1);
    var c2=redGoldColumn(0.5,0.045); c2.position.set(-0.62,0.06,fz+0.14); B.add(c2);
    B.add(box(1.5,0.045,0.02,M.gold,0,0.99,fz+0.014));
  } else if(R.deco==='neon'){
    var v1=neonSign(0.2,0.7,R.neon[0],0.3);  v1.position.set( 0.52,0.92,fz+0.03); B.add(v1);
    var v2=neonSign(0.2,0.7,R.neon[1],2.1);  v2.position.set(-0.52,0.92,fz+0.03); B.add(v2);
    if(stage>=3){
      var hz=neonSign(0.9,0.13,R.neon[2],4.2);
      hz.position.set(0,stage>=4?1.5:1.45,fz+0.03); B.add(hz);
    }
  } else if(R.deco==='bulbs'){
    var ys=(stage>=3)?1.32:1.12;
    var s1=bulbString(1.7,7); s1.position.set(0,ys,fz+0.05); B.add(s1);
    var s2=bulbString(1.5,7); s2.position.set(0,0.72,fz+0.07); B.add(s2);
  }
}

/* ---------- 阶段 1：小木屋 / 简陋棚屋 ---------- */
function stage1(g,R,acc,flip){
  var B=grp(); g.add(B);
  B.add(box(1.08,0.1,0.9,M.stoneM,0,0.05,0));
  B.add(box(0.95,0.56,0.78,M.hutWood,0,0.38,0));
  [[-0.44,-0.36],[0.44,-0.36],[-0.44,0.36],[0.44,0.36]].forEach(function(c){
    B.add(box(0.07,0.56,0.07,MAT('#6d5c44'),c[0],0.38,c[1]));
  });
  B.add(box(0.26,0.36,0.03,MAT('#5a4228'),0,0.33,0.395));
  B.add(box(0.2,0.28,0.032,MAT('#3e2e1c'),0,0.32,0.402));
  var w1=regionWindow(R,acc,0.18,0.16); w1.position.set(0.31,0.46,0.392); B.add(w1);
  var w2=regionWindow(R,acc,0.18,0.16); w2.position.set(-0.31,0.46,0.392); B.add(w2);
  if(R.roofType==='flat'){
    var shed=box(1.16,0.04,0.98,MAT(R.roof),0,0.7,0.02); shed.rotation.x=0.1; B.add(shed);
    B.add(box(1.16,0.03,0.05,MAT(R.ridge),0,0.655,0.48));
  } else {
    var rf=gableRoof(1.12,0.96,0.3,{mat:MAT(R.roof),ridgeMat:MAT(R.ridge),gableMat:MAT('#7a6a50')});
    rf.position.y=0.66; B.add(rf);
  }
  if(R.lanterns){
    B.add(cyl(0.012,0.015,0.34,5,M.woodD,0.62,0.23,0.42));
    var l=lantern(0.62,0.7); l.position.set(0.62,0.42,0.42); B.add(l);
  } else {
    B.add(box(0.16,0.14,0.16,MAT('#8a6b4a'),-0.62,0.13,0.36));
    B.add(cyl(0.07,0.085,0.16,8,M.woodM,-0.62,0.28,0.36));
  }
  bushAt(B,flip?-0.52:0.52,-0.34);
  B.add(box(0.4,0.012,0.6,M.path,0,0.072,0.85));
  return B;
}

/* ---------- 阶段 2：街边店铺 / 小楼 ---------- */
function stage2(g,R,acc,sign,flip){
  var B=grp(); g.add(B);
  B.add(box(1.55,0.1,1.1,M.stoneM,0,0.05,0));
  B.add(box(1.32,0.98,0.95,MAT(R.wall),0,0.55,0));
  B.add(box(1.38,0.08,1.0,MAT(R.wallD),0,0.12,0));
  B.add(box(1.38,0.06,1.0,MAT(R.trim),0,1.06,0));
  shopFront(B,R,acc,sign,1.2,0.478);
  var wA=regionWindow(R,acc,0.22,0.2); wA.position.set(0.33,0.82,0.478); B.add(wA);
  var wB=regionWindow(R,acc,0.22,0.2); wB.position.set(-0.33,0.82,0.478); B.add(wB);
  roofApply(B,R,1.5,1.08,1.1,0.32,false);
  if(R.roofType==='flat'){
    var tk=waterTank(); tk.position.set(flip?-0.42:0.42,1.15,-0.22); B.add(tk);
  }
  decoApply(B,R,acc,2,flip,0.478);
  if(R.lanterns){
    var l1=lantern(0.7,0.4), l2=lantern(0.7,1.9);
    l1.position.set(0.58,1.0,0.52); l2.position.set(-0.58,1.0,0.52);
    B.add(l1); B.add(l2);
  }
  B.add(box(0.4,0.012,0.72,M.path,0,0.072,0.9));
  bushAt(B,flip?0.62:-0.62,0.4);
  return B;
}

/* ---------- 阶段 3：中层建筑 ---------- */
function stage3(g,R,acc,sign,flip){
  var B=grp(); g.add(B);
  B.add(box(1.68,0.1,1.16,M.stoneM,0,0.05,0));
  B.add(box(1.45,1.6,1.0,MAT(R.wall),0,0.86,0));
  B.add(box(1.5,0.09,1.04,MAT(R.wallD),0,0.125,0));
  B.add(box(1.5,0.05,1.04,MAT(R.wallD),0,0.62,0));
  B.add(box(1.5,0.05,1.04,MAT(R.wallD),0,1.14,0));
  B.add(box(1.52,0.07,1.06,MAT(R.trim),0,1.665,0));
  shopFront(B,R,acc,sign,1.25,0.503);
  var ys=[0.88,1.38], i, k;
  for(i=0;i<2;i++) for(k=-1;k<=1;k++){
    var w=regionWindow(R,acc,0.2,0.22);
    w.position.set(k*0.46,ys[i],0.503); B.add(w);
  }
  var bc=balcony(1.1,MAT(R.trim)); bc.position.set(0,0.7,0.42); B.add(bc);
  if(R.roofType==='flat'){
    var ft=flatTop(1.5,1.05,MAT(R.roof)); ft.position.y=1.7; B.add(ft);
    var tk=waterTank(); tk.position.set(flip?-0.45:0.45,1.75,-0.25); B.add(tk);
    var ac=acUnit(); ac.position.set(flip?0.42:-0.42,1.725,0.2); ac.rotation.y=PI/2; B.add(ac);
  } else {
    roofApply(B,R,1.62,1.14,1.7,0.38,true);
  }
  decoApply(B,R,acc,3,flip,0.503);
  if(R.lanterns){
    var l1=lantern(0.72,0.6), l2=lantern(0.72,2.3);
    l1.position.set(0.66,1.56,0.54); l2.position.set(-0.66,1.56,0.54);
    B.add(l1); B.add(l2);
  }
  B.add(box(0.44,0.012,0.8,M.path,0,0.072,0.95));
  bushAt(B,flip?0.68:-0.68,0.42);
  return B;
}

/* ---------- 阶段 4：地标建筑 ---------- */
function stage4(g,R,acc,sign,flip){
  var B=grp(); g.add(B);
  B.add(box(1.8,0.1,1.3,M.stoneM,0,0.05,0));
  var i;
  if(R.roofType==='flat'){
    /* 平顶地标：高层塔楼 + 顶部王冠（骑楼钟楼 / 霓虹大厦 / 夜市招牌楼） */
    B.add(box(1.35,1.32,1.05,MAT(R.wall),0,0.72,0));
    B.add(box(1.4,0.07,1.1,MAT(R.wallD),0,0.5,0));
    B.add(box(1.4,0.07,1.1,MAT(R.wallD),0,0.95,0));
    shopFront(B,R,acc,sign,1.25,0.528);
    var ys=[0.62,0.89,1.16], c, r2;
    for(i=0;i<3;i++) for(c=-1;c<=1;c++){
      r2=regionWindow(R,acc,0.2,0.2);
      r2.position.set(c*0.42,ys[i],0.528); B.add(r2);
    }
    B.add(box(1.08,0.5,0.85,MAT(R.wall),0,1.63,0));
    var u1=regionWindow(R,acc,0.24,0.24); u1.position.set(0,1.63,0.428); B.add(u1);
    var pt=flatTop(1.12,0.88,MAT(R.roof)); pt.position.y=1.88; B.add(pt);
    if(R.deco==='arcade'){
      /* 骑楼钟楼：山花 + 大钟 + 旗杆 */
      var sh=new THREE.Shape();
      sh.moveTo(-0.475,0); sh.lineTo(0.475,0); sh.lineTo(0,0.26); sh.closePath();
      var ped=mesh(new THREE.ExtrudeGeometry(sh,{depth:0.06,bevelEnabled:false}),MAT(R.trim));
      ped.position.set(0,1.92,0.42); B.add(ped);
      var face=mesh(new THREE.CylinderGeometry(0.09,0.09,0.03,16),M.white);
      face.rotation.x=PI/2; face.position.set(0,2.02,0.47); B.add(face);
      var rg=mesh(new THREE.TorusGeometry(0.09,0.012,6,20),M.gold);
      rg.position.set(0,2.02,0.47); B.add(rg);
      B.add(box(0.012,0.06,0.006,M.ink,0,2.04,0.49));
      B.add(box(0.045,0.012,0.006,M.ink,0.02,2.02,0.49));
      B.add(cyl(0.008,0.01,0.4,5,M.steelD,0,2.2,-0.25));
      var flag=box(0.16,0.1,0.01,MAT(acc),0.085,2.34,-0.25); B.add(flag);
    } else if(R.deco==='neon'){
      /* 霓虹大厦：天线 + 航空障碍灯 + 霓虹环 */
      B.add(cyl(0.012,0.025,0.45,6,M.steelD,0,2.1,0));
      var bc=sph(0.025,8,std('#c0392b',{emissive:'#ff2d1a',ei:1.2})); bc.position.set(0,2.35,0); B.add(bc);
      anim(B,function(t){ bc.material.emissiveIntensity=(sin(t*3.4)>0?1.5:0.2); });
      var nr=mesh(new THREE.TorusGeometry(0.34,0.015,6,26),MAT(R.neon[3],{emissive:R.neon[3],ei:1.1}));
      nr.rotation.x=PI/2; nr.position.y=1.93; B.add(nr);
      var s1=neonSign(0.22,0.8,R.neon[0],0.7); s1.position.set( 0.42,0.92,0.56); B.add(s1);
      var s2=neonSign(0.22,0.8,R.neon[1],2.6); s2.position.set(-0.42,0.92,0.56); B.add(s2);
    } else {
      /* 夜市招牌楼：屋顶大字招牌 + 串灯 */
      B.add(box(0.05,0.28,0.05,MAT(R.wood), 0.38,2.02,0));
      B.add(box(0.05,0.28,0.05,MAT(R.wood),-0.38,2.02,0));
      B.add(box(0.98,0.32,0.05,MAT(R.trim),0,2.2,0));
      var sp1=textPlate(sign,0.82,0.24,{bg:acc,fg:'#fff2d0',border:'#5a3a18'});
      sp1.position.set(0,2.2,0.032); B.add(sp1);
      var sp2=textPlate(sign,0.82,0.24,{bg:acc,fg:'#fff2d0',border:'#5a3a18'});
      sp2.rotation.y=PI; sp2.position.set(0,2.2,-0.032); B.add(sp2);
    }
  } else {
    /* 坡顶地标：三重台基 + 两叠屋顶 + 金饰（胡同 / 石库门 / 四川 / 水乡 / 大唐） */
    B.add(box(1.75,0.38,1.25,MAT(R.wall),0,0.25,0));
    B.add(box(1.8,0.05,1.3,MAT(R.trim),0,0.455,0));
    B.add(box(1.4,0.46,0.95,MAT(R.wall),0,0.71,0));
    B.add(box(1.44,0.05,0.99,MAT(R.trim),0,0.955,0));
    B.add(box(1.05,0.4,0.7,MAT(R.wall),0,1.18,0));
    B.add(box(1.09,0.05,0.74,MAT(R.trim),0,1.405,0));
    /* 大门 + 拱额 */
    B.add(box(0.34,0.42,0.03,MAT('#4a3220'),0,0.27,0.632));
    var dg=new THREE.CylinderGeometry(0.2,0.2,0.035,12,1,false,0,PI);
    dg.rotateX(PI/2); dg.rotateZ(PI/2);
    var darc=mesh(dg,MAT(R.trim)); darc.position.set(0,0.48,0.632); B.add(darc);
    /* 楼层窗 */
    var t2a=regionWindow(R,acc,0.22,0.22); t2a.position.set( 0.3,0.72,0.478); B.add(t2a);
    var t2b=regionWindow(R,acc,0.22,0.22); t2b.position.set(-0.3,0.72,0.478); B.add(t2b);
    var t3=regionWindow(R,acc,0.22,0.2);   t3.position.set(0,1.2,0.352); B.add(t3);
    /* 红柱（大唐 / 檐廊通用） */
    var cA=redGoldColumn(0.38,0.04); cA.position.set( 0.55,0.06,0.7); B.add(cA);
    var cB=redGoldColumn(0.38,0.04); cB.position.set(-0.55,0.06,0.7); B.add(cB);
    /* 两叠屋顶 */
    var rA, rB;
    if(R.roofType==='sweep'){
      rA=hipRoof(1.6,1.14,0.3,{lift:0.12,mat:MAT(R.roof),eaveMat:MAT(R.trim),ornMat:M.gold});
      rB=hipRoof(0.95,0.66,0.26,{lift:0.09,mat:MAT(R.roof),eaveMat:MAT(R.trim),ornMat:M.gold});
    } else if(R.roofType==='hip'){
      rA=hipRoof(1.6,1.14,0.28,{mat:MAT(R.roof),eaveMat:MAT(R.trim),ornaments:false});
      rB=hipRoof(0.95,0.66,0.24,{mat:MAT(R.roof),eaveMat:MAT(R.trim),ornaments:false});
    } else {
      rA=gableRoof(1.6,1.14,0.3,{mat:MAT(R.roof),ridgeMat:MAT(R.ridge),gableMat:MAT(R.wall)});
      rB=gableRoof(0.95,0.66,0.26,{mat:MAT(R.roof),ridgeMat:MAT(R.ridge),gableMat:MAT(R.wall)});
    }
    rA.position.y=1.43; B.add(rA);
    B.add(box(0.72,0.24,0.5,MAT(R.wall),0,1.55,0));
    rB.position.y=1.67; B.add(rB);
    /* 金色宝顶 */
    put(B,sph(0.04,8,M.gold),0,1.98,0);
    var spike=mesh(new THREE.ConeGeometry(0.028,0.12,6),M.gold);
    spike.position.set(0,2.06,0); B.add(spike);
  }
  if(R.lanterns){
    var l1=lantern(0.75,0.5), l2=lantern(0.75,2.0);
    l1.position.set(0.68,1.02,0.5); l2.position.set(-0.68,1.02,0.5);
    B.add(l1); B.add(l2);
  }
  decoApply(B,R,acc,4,flip,R.roofType==='flat'?0.528:0.632);
  B.add(box(0.46,0.012,0.85,M.path,0,0.072,1.0));
  bushAt(B,flip?0.72:-0.72,0.5);
  bushAt(B,flip?-0.72:0.72,-0.55);
  return B;
}

/* 地产工厂入口：propIdx（棋盘格索引或 0..21 顺序索引） + level(1-4) */
function propertyBuilding(propIdx,level){
  level=Math.max(1,Math.min(4,level|0||1));
  var key=TILE_GROUP[propIdx];
  if(!key){
    var seq=PROP_TILES.indexOf(propIdx);
    if(seq<0) seq=((propIdx%22)+22)%22;
    key=SEQ_GROUP[seq];
  }
  var R=REGIONS[key]||REGIONS.g1;
  var acc=ACCENTS[((propIdx%ACCENTS.length)+ACCENTS.length)%ACCENTS.length];
  var flip=(propIdx%2)===1;
  var g=grp();
  g.name='prop_'+propIdx+'_lv'+level;
  g.userData.kind='property'; g.userData.propIdx=propIdx; g.userData.level=level; g.userData.region=key;
  propPad(g);
  if(level===1) stage1(g,R,acc,flip);
  else if(level===2) stage2(g,R,acc,R.sign,flip);
  else if(level===3) stage3(g,R,acc,R.sign,flip);
  else stage4(g,R,acc,R.sign,flip);
  return g;
}

/* =====================================================================================
 * 7. 道具模型 ×9（低模卡通，footprint ≈ 0.6~1.0，落地 y=0，朝 +X / +Z）
 * ===================================================================================== */

function wheelAt(parent,x,z,r,w){
  var t=mesh(new THREE.CylinderGeometry(r,r,w,10),M.ink);
  t.rotation.x=PI/2; t.position.set(x,r,z); parent.add(t);
  var hub=mesh(new THREE.CylinderGeometry(r*0.42,r*0.42,w+0.006,8),M.steelD);
  hub.rotation.x=PI/2; hub.position.set(x,r,z); parent.add(hub);
}

/* 警车：白车身 + 深色条纹 + 红蓝警灯 + 金徽 */
function createPoliceCar(){
  var g=grp(); g.name='prop_police';
  [[0.21,0.13],[0.21,-0.13],[-0.21,0.13],[-0.21,-0.13]].forEach(function(p){
    wheelAt(g,p[0],p[1],0.075,0.05);
  });
  g.add(box(0.62,0.1,0.3,M.paintW,0,0.16,0));
  g.add(box(0.63,0.05,0.305,M.ink,0,0.145,0));
  var cabin=box(0.34,0.11,0.27,M.paintW,-0.03,0.265,0); g.add(cabin);
  g.add(box(0.345,0.06,0.276,M.winD,-0.03,0.275,0));
  g.add(box(0.05,0.05,0.32,M.ironD, 0.325,0.12,0));
  g.add(box(0.05,0.05,0.32,M.ironD,-0.325,0.12,0));
  g.add(box(0.02,0.035,0.06,M.warn, 0.315,0.17, 0.09));
  g.add(box(0.02,0.035,0.06,M.warn, 0.315,0.17,-0.09));
  g.add(box(0.02,0.03,0.05,M.redLacquer,-0.315,0.17,0.1));
  g.add(box(0.02,0.03,0.05,M.redLacquer,-0.315,0.17,-0.1));
  /* 车顶警灯（红蓝交替） */
  g.add(box(0.02,0.018,0.24,M.ironD,-0.03,0.328,0));
  var rm=std('#e03226',{rough:.3,emissive:'#ff2d1a',ei:1.1});
  var bm=std('#2860d8',{rough:.3,emissive:'#2d6aff',ei:1.1});
  g.add(box(0.03,0.04,0.1,rm,-0.03,0.355,-0.062));
  g.add(box(0.03,0.04,0.1,bm,-0.03,0.355, 0.062));
  anim(g,function(t){
    var k=sin(t*7)>0;
    rm.emissiveIntensity=k?1.5:0.12;
    bm.emissiveIntensity=k?0.12:1.5;
  });
  /* 车门金徽 + 星 */
  [[1],[-1]].forEach(function(s){
    var disc=mesh(new THREE.CylinderGeometry(0.05,0.05,0.012,14),M.gold);
    disc.rotation.x=PI/2; disc.position.set(-0.02,0.2,0.156*s[0]); g.add(disc);
    var st=starMesh(0.032,0.014,0.01,M.gold);
    if(s[0]<0) st.rotation.y=PI;
    st.position.set(-0.02,0.2,0.163*s[0]); g.add(st);
  });
  g.add(box(0.03,0.03,0.02,M.inkD, 0.18,0.3, 0.145));
  g.add(box(0.03,0.03,0.02,M.inkD, 0.18,0.3,-0.145));
  return g;
}

/* 私人飞机：白金机身 + 蓝条纹 + 后掠翼 + 尾吊引擎 */
function createPrivateJet(){
  var g=grp(); g.name='prop_jet';
  var blue=std('#3a6ad8',{rough:.5}), cream=std('#f4efe2',{rough:.45,metal:.08});
  var fus=mesh(new THREE.CapsuleGeometry(0.09,0.55,4,10),cream);
  fus.rotation.z=PI/2; fus.position.y=0.3; g.add(fus);
  var nose=mesh(new THREE.ConeGeometry(0.085,0.16,10),M.gold);
  nose.rotation.z=-PI/2; nose.position.set(0.42,0.3,0); g.add(nose);
  var tailC=mesh(new THREE.ConeGeometry(0.085,0.18,10),cream);
  tailC.rotation.z=PI/2; tailC.position.set(-0.44,0.3,0); g.add(tailC);
  g.add(box(0.55,0.014,0.007,blue, 0,0.315, 0.086));
  g.add(box(0.55,0.014,0.007,blue, 0,0.315,-0.086));
  g.add(box(0.55,0.008,0.005,M.gold, 0,0.29, 0.089));
  g.add(box(0.55,0.008,0.005,M.gold, 0,0.29,-0.089));
  g.add(box(0.06,0.03,0.02,M.winD,0.33,0.35,0));
  /* 后掠主翼 */
  [[1],[-1]].forEach(function(s){
    var w=box(0.2,0.012,0.34,cream, -0.02,0.27,0.24*s[0]);
    w.rotation.y=-0.5*s[0]; w.rotation.z=0.06; g.add(w);
    var en=mesh(new THREE.CapsuleGeometry(0.035,0.09,3,8),cream);
    en.rotation.z=PI/2; en.position.set(-0.1,0.29,0.26*s[0]); g.add(en);
    var ir=mesh(new THREE.TorusGeometry(0.037,0.01,6,12),M.gold);
    ir.rotation.y=PI/2; ir.position.set(-0.045,0.29,0.26*s[0]); g.add(ir);
  });
  /* T 尾 */
  var fin=box(0.16,0.2,0.018,cream,-0.46,0.44,0); fin.rotation.z=0.35; g.add(fin);
  var finTip=box(0.1,0.07,0.02,blue,-0.52,0.54,0); finTip.rotation.z=0.35; g.add(finTip);
  g.add(box(0.08,0.012,0.26,cream,-0.5,0.56,0));
  /* 起落架 */
  [[0.18,0],[-0.2,0.09],[-0.2,-0.09]].forEach(function(p){
    g.add(cyl(0.007,0.007,0.12,5,M.steelD,p[0],0.12,p[1]));
    var wl=mesh(new THREE.CylinderGeometry(0.032,0.032,0.018,10),M.ink);
    wl.rotation.x=PI/2; wl.position.set(p[0],0.035,p[1]); g.add(wl);
  });
  anim(g,function(t){
    g.position.y=sin(t*1.6)*0.02;
    g.rotation.z=sin(t*1.1)*0.02;
  });
  return g;
}

/* 出租车：黄色车身 + 顶灯 + 格子条纹 */
function createTaxi(){
  var g=grp(); g.name='prop_taxi';
  var yell=std('#f2c230',{rough:.55});
  [[0.21,0.13],[0.21,-0.13],[-0.21,0.13],[-0.21,-0.13]].forEach(function(p){
    wheelAt(g,p[0],p[1],0.075,0.05);
  });
  g.add(box(0.62,0.1,0.3,yell,0,0.16,0));
  g.add(box(0.34,0.11,0.27,yell,-0.03,0.265,0));
  g.add(box(0.345,0.06,0.276,M.winD,-0.03,0.275,0));
  g.add(box(0.05,0.05,0.32,M.ironD, 0.325,0.12,0));
  g.add(box(0.05,0.05,0.32,M.ironD,-0.325,0.12,0));
  g.add(box(0.02,0.035,0.06,M.warn, 0.315,0.17, 0.09));
  g.add(box(0.02,0.035,0.06,M.warn, 0.315,0.17,-0.09));
  /* 格子条纹（两侧黑白相间） */
  for(var i=0;i<10;i++){
    var cb=box(0.055,0.04,0.008,(i%2)?M.ink:M.paintW,-0.28+i*0.062,0.2,0.153);
    g.add(cb);
    var cb2=box(0.055,0.04,0.008,(i%2)?M.paintW:M.ink,-0.28+i*0.062,0.2,-0.153);
    g.add(cb2);
  }
  /* 顶灯 TAXI */
  g.add(box(0.12,0.045,0.025,M.ink,-0.03,0.343,0));
  var ts=textPlate('TAXI',0.1,0.038,{bg:'#1c1c1c',fg:'#ffd23c',border:'#ffd23c'});
  ts.position.set(-0.03,0.343,0.015); g.add(ts);
  var ts2=textPlate('TAXI',0.1,0.038,{bg:'#1c1c1c',fg:'#ffd23c',border:'#ffd23c'});
  ts2.rotation.y=PI; ts2.position.set(-0.03,0.343,-0.015); g.add(ts2);
  g.add(box(0.03,0.03,0.02,M.inkD, 0.18,0.3, 0.145));
  g.add(box(0.03,0.03,0.02,M.inkD, 0.18,0.3,-0.145));
  anim(g,function(t){ g.position.y=sin(t*2.4)*0.006; });
  return g;
}

/* 六面骰子：圆角立方体 + 黑点（点数 1-6），落地摆放 */
function createDice3D(){
  var g=grp(); g.name='prop_dice';
  var inner=grp(); g.add(inner);
  var s=0.42, o=0.105;
  inner.add(mesh(roundedBoxGeo(s,s,s,0.06),M.paintW));
  function pip(x,y,z,nx,ny,nz){
    var p=sph(0.032,8,M.ink,x,y,z);
    p.scale.set(nx?0.4:1, ny?0.4:1, nz?0.4:1);
    inner.add(p);
  }
  var i2;
  for(i2=-1;i2<=1;i2++) for(var j=-1;j<=1;j++){
    pip(i2*o, j*o,  s/2+0.012, 0,0,1);
    pip(i2*o, j*o, -s/2-0.012, 0,0,-1);
    pip( s/2+0.012, i2*o, j*o, 1,0,0);
    pip(-s/2-0.012, i2*o, j*o,-1,0,0);
    pip(i2*o,  s/2+0.012, j*o, 0,1,0);
    pip(i2*o, -s/2-0.012, j*o, 0,-1,0);
  }
  inner.position.y=0.222;
  anim(g,function(t){ inner.rotation.y=t*0.6; inner.rotation.x=sin(t*0.5)*0.25; });
  return g;
}

/* 路障：橙白条纹挡板 + A 字腿 + 警示灯 */
function createRoadblock(){
  var g=grp(); g.name='prop_roadblock';
  [[-0.32],[0.32]].forEach(function(px){
    var x=px[0];
    var l1=box(0.05,0.36,0.03,M.ironD,x,0.17,0.05); l1.rotation.z= 0.3; g.add(l1);
    var l2=box(0.05,0.36,0.03,M.ironD,x,0.17,-0.05); l2.rotation.z=-0.3; g.add(l2);
    g.add(box(0.06,0.03,0.16,M.ironD,x,0.015,0));
  });
  g.add(box(0.95,0.15,0.03,M.redLacquer,0,0.3,0));
  for(var i=0;i<6;i++){
    g.add(box(0.148,0.152,0.034,(i%2)?M.redLacquer:M.paintW,-0.375+i*0.15,0.3,0));
  }
  g.add(cyl(0.03,0.035,0.025,8,M.ironD,0,0.388,0));
  var lm=std('#ffb020',{rough:.3,emissive:'#ff9a10',ei:1.2});
  var dome=mesh(new THREE.SphereGeometry(0.038,10,8),lm);
  dome.scale.y=0.75; dome.position.set(0,0.42,0); g.add(dome);
  anim(g,function(t){ lm.emissiveIntensity=0.5+0.9*(sin(t*6)>0?1:0.15); });
  return g;
}

/* 拆迁令：橙色卷轴 + 红蜡封 + 引火线火花 */
function createDemolitionOrder(){
  var g=grp(); g.name='prop_demolition';
  var paper=std('#e8a24a',{rough:.7});
  var paperD=std('#c07830',{rough:.75});
  /* 卷轴辊 */
  var roll=cyl(0.05,0.05,0.5,12,paperD,-0.15,0.06,0);
  roll.rotation.z=PI/2; g.add(roll);
  [[-0.15,0.245],[-0.15,-0.245]].forEach(function(px){
    var cap=cyl(0.052,0.052,0.02,12,M.woodD,px[1],0.06,px[0]);
    cap.rotation.x=PI/2; g.add(cap);
  });
  /* 半展卷筒（弧形纸面） */
  var shGeo=new THREE.CylinderGeometry(0.14,0.14,0.5,12,1,true,-0.9,1.5);
  shGeo.rotateZ(PI/2);
  var sheet=mesh(shGeo,paper);
  sheet.position.set(0.08,0.145,0.02); g.add(sheet);
  /* 展开纸面 */
  var flat=box(0.34,0.006,0.3,paper,0.33,0.05,0.02);
  flat.rotation.x=0.06; g.add(flat);
  for(var i=0;i<3;i++){
    g.add(box(0.2,0.004,0.02,MAT('#8a5a28'),0.33,0.085,0.0-i*0.07+0.06));
  }
  /* 红蜡封 + 金星 */
  var seal=sph(0.045,8,M.redLacquer,0.33,0.07,0.1);
  seal.scale.y=0.55; g.add(seal);
  var st=starMesh(0.03,0.013,0.008,M.gold);
  st.rotation.x=-PI/2; st.position.set(0.33,0.095,0.1); g.add(st);
  /* 引火线 + 火花 */
  var pts=[new THREE.Vector3(-0.15,0.11,-0.2),new THREE.Vector3(-0.28,0.2,-0.26),new THREE.Vector3(-0.38,0.16,-0.2)];
  var fuse=mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),10,0.009,5),M.rope);
  g.add(fuse);
  var sparkM=std('#ff8a20',{rough:.3,emissive:'#ff6a10',ei:1.5});
  var spark=sph(0.02,6,sparkM,-0.38,0.16,-0.2); g.add(spark);
  anim(g,function(t){
    sparkM.emissiveIntensity=1.1+0.8*sin(t*17)+0.4*sin(t*31);
    spark.scale.setScalar(0.8+0.3*sin(t*23));
  });
  return g;
}

/* 天平（公平秤）：金色底盘 + 双盘 + 蓝宝石 */
function createEqualizer(){
  var g=grp(); g.name='prop_equalizer';
  g.add(cyl(0.17,0.2,0.05,16,M.gold,0,0.025,0));
  g.add(cyl(0.02,0.03,0.34,10,M.gold,0,0.22,0));
  var gem=mesh(new THREE.OctahedronGeometry(0.055,0),std('#3a6ad8',{rough:.2,emissive:'#3a8aff',ei:.55,metal:.3}));
  gem.position.y=0.49; g.add(gem);
  var beamPivot=grp(); beamPivot.position.y=0.4; g.add(beamPivot);
  beamPivot.add(box(0.52,0.022,0.03,M.gold,0,0,0));
  beamPivot.add(sph(0.03,8,M.gold,-0.26,0,0));
  beamPivot.add(sph(0.03,8,M.gold, 0.26,0,0));
  var pans=[];
  [[-0.26],[0.26]].forEach(function(px,idx){
    var pg=grp(); pg.position.set(px[0],0,0); beamPivot.add(pg);
    pg.add(cyl(0.004,0.004,0.17,4,M.steelD,-0.045,-0.085,0));
    pg.add(cyl(0.004,0.004,0.17,4,M.steelD, 0.045,-0.085,0));
    var pan=cyl(0.09,0.065,0.02,14,M.gold,0,-0.18,0);
    pg.add(pan);
    pans.push(pg);
  });
  anim(g,function(t){
    beamPivot.rotation.z=sin(t*1.2)*0.14;
    pans[0].rotation.z=-beamPivot.rotation.z;
    pans[1].rotation.z=-beamPivot.rotation.z;
  });
  return g;
}

/* 护身符：蓝白同心圆 + 金边 + 流苏（悬浮吊坠式摆放） */
function createAmulet(){
  var g=grp(); g.name='prop_amulet';
  var inner=grp(); g.add(inner);
  var ring=mesh(new THREE.TorusGeometry(0.16,0.018,8,26),M.gold);
  inner.add(ring);
  var d1=cyl(0.145,0.145,0.02,20,MAT('#2a5aa8',{rough:.4}),0,0,0);
  d1.rotation.x=PI/2; inner.add(d1);
  var d2=cyl(0.10,0.10,0.022,20,M.paintW,0,0,0);
  d2.rotation.x=PI/2; inner.add(d2);
  var d3=cyl(0.05,0.05,0.026,16,MAT('#2a5aa8',{rough:.4}),0,0,0);
  d3.rotation.x=PI/2; inner.add(d3);
  var loop=mesh(new THREE.TorusGeometry(0.035,0.008,6,14),M.gold);
  loop.position.y=0.195; inner.add(loop);
  var cap=cyl(0.018,0.028,0.03,8,M.gold,0,-0.195,0);
  inner.add(cap);
  for(var i=-1;i<=1;i++){
    inner.add(cyl(0.005,0.005,0.13,5,M.redLacquer,i*0.014,-0.27,0));
    inner.add(sph(0.008,5,M.gold,i*0.014,-0.335,0));
  }
  inner.position.y=0.35;
  anim(g,function(t){
    inner.rotation.z=sin(t*1.4)*0.12;
    inner.position.y=0.35+sin(t*1.7)*0.02;
  });
  return g;
}

/* 遥控骰子器：圆角机身 + 骰子按钮 + 天线 + LED（落地摆放） */
function createRemoteDice(){
  var g=grp(); g.name='prop_remote';
  var inner=grp(); inner.position.y=0.078; g.add(inner);
  inner.add(mesh(roundedBoxGeo(0.36,0.15,0.24,0.045),std('#c8ccd4',{rough:.5,metal:.2})));
  var top=mesh(roundedBoxGeo(0.3,0.03,0.18,0.012),std('#3a4048',{rough:.5}));
  top.position.y=0.082; inner.add(top);
  /* 骰子按钮 */
  var dice=mesh(roundedBoxGeo(0.085,0.085,0.085,0.016),M.paintW);
  dice.position.set(-0.08,0.135,0); inner.add(dice);
  var pip=sph(0.014,6,M.ink,-0.08,0.179,0);
  inner.add(pip);
  /* 圆按钮（红 / 蓝） */
  var b1=cyl(0.022,0.022,0.02,10,std('#d84b3a',{rough:.4}),0.04,0.1,0.045); inner.add(b1);
  var b2=cyl(0.022,0.022,0.02,10,std('#3f7fd4',{rough:.4}),0.04,0.1,-0.045); inner.add(b2);
  /* 天线 + 信号灯 */
  inner.add(cyl(0.006,0.006,0.2,5,M.steelD,0.14,0.26,-0.07));
  var tipM=std('#2dff8d',{rough:.3,emissive:'#2dff8d',ei:1.2});
  var tip=sph(0.018,6,tipM,0.14,0.37,-0.07); inner.add(tip);
  anim(g,function(t){ tipM.emissiveIntensity=0.6+0.8*(sin(t*5)>0?1:0.2); });
  /* 前面板 LED */
  for(var i=0;i<3;i++){
    inner.add(box(0.03,0.014,0.008,MAT(['#ffd23c','#2dff8d','#ff4a6a'][i],{emissive:['#ffd23c','#2dff8d','#ff4a6a'][i],ei:.9}),
      -0.1+i*0.05,0.02,0.122));
  }
  anim(g,function(t){
    dice.position.y=0.135+Math.max(0,sin(t*2.4))*0.012;
  });
  return g;
}

/* =====================================================================================
 * 8. 六位角色 —— Q 版小人 ~2.8 头身（球体 + 圆角块 + 胶囊），子部件命名可驱动动画
 * ===================================================================================== */

/* 通用骨架：腿 / 躯干 / 双臂 / 头（含默认五官），返回部件引用 */
function charBase(o){
  o=o||{};
  var g=grp(); g.name=o.id||'char';
  var skin=std(o.skin||'#f2c9a0',{rough:.65});
  var pantsMat=std(o.pants||'#33383e',{rough:.85});
  var shoeMat=std(o.shoe||'#26221e',{rough:.6});
  var shirtMat=std(o.shirt||'#f2f2ee',{rough:.8});
  var sleeveMat=std(o.sleeve||o.shirt||'#f2f2ee',{rough:.8});
  var bodyR=o.bodyR||0.3;
  function leg(x){
    var pv=grp(); pv.position.set(x,0.5,0); pv.name=x>0?'legL':'legR'; g.add(pv);
    var th=mesh(new THREE.CapsuleGeometry(o.legR||0.085,0.24,3,8),pantsMat);
    th.position.y=-0.22; pv.add(th);
    pv.add(box(0.16,0.09,0.25,shoeMat,0,-0.455,0.045));
    return pv;
  }
  var lx=bodyR*0.5;
  var legL=leg(lx), legR=leg(-lx);
  var torso=grp(); torso.position.y=0.52; torso.name='torso'; g.add(torso);
  var body=mesh(new THREE.CapsuleGeometry(bodyR,0.3,4,10),shirtMat);
  body.position.y=0.32; body.scale.set(1,1,0.8); torso.add(body);
  function arm(x){
    var pv=grp(); pv.position.set(x,1.0,0); pv.name=x>0?'armL':'armR'; g.add(pv);
    var up=mesh(new THREE.CapsuleGeometry(0.062,0.2,3,8),sleeveMat);
    up.position.y=-0.15; pv.add(up);
    pv.add(sph(0.062,8,skin,0,-0.32,0));
    return pv;
  }
  var ax=bodyR+0.05;
  var armL=arm(ax), armR=arm(-ax);
  var headG=grp(); headG.position.y=1.1; headG.name='head'; g.add(headG);
  headG.add(sph(0.3,12,skin,0,0.28,0));
  if(o.glowEye){
    var gm=std(o.glowEye,{rough:.3,emissive:o.glowEye,ei:1.5});
    headG.add(sph(0.036,6,gm, 0.105,0.3,0.255));
    headG.add(sph(0.036,6,gm,-0.105,0.3,0.255));
  } else if(!o.noFace){
    var em=std('#ffffff',{rough:.4});
    headG.add(sph(0.048,6,em, 0.105,0.3,0.235));
    headG.add(sph(0.048,6,em,-0.105,0.3,0.235));
    headG.add(sph(0.022,6,M.ink, 0.108,0.3,0.278));
    headG.add(sph(0.022,6,M.ink,-0.108,0.3,0.278));
    headG.add(sph(0.03,6,std(o.skinDark||'#e2ab80',{rough:.65}),0,0.22,0.295));
  }
  if(o.blush){
    var bm2=std('#f2a88e',{rough:.8});
    var b1=sph(0.035,6,bm2, 0.2,0.22,0.235); b1.scale.set(1,0.6,0.5); headG.add(b1);
    var b3=sph(0.035,6,bm2,-0.2,0.22,0.235); b3.scale.set(1,0.6,0.5); headG.add(b3);
  }
  g.userData.parts={head:headG,torso:torso,armL:armL,armR:armR,legL:legL,legR:legR,body:body};
  return {g:g,head:headG,torso:torso,armL:armL,armR:armR,legL:legL,legR:legR,body:body,skin:skin};
}

/* 待机动画：躯干/头部起伏 + 手臂摆动（不占 group.position，方便棋盘摆放） */
function charIdle(r,o){
  o=o||{};
  var freq=o.freq||2.2, amp=o.arm!==undefined?o.arm:0.08;
  var baseL=o.baseL||0, baseR=o.baseR||0;
  anim(r.g,function(t){
    var b=Math.abs(sin(t*freq))*(o.bob!==undefined?o.bob:0.02);
    r.torso.position.y=0.52+b;
    r.head.position.y=1.1+b;
    r.armL.rotation.x=baseL+sin(t*freq)*amp;
    r.armR.rotation.x=baseR-sin(t*freq)*amp;
    r.legL.rotation.x=sin(t*freq)*0.03;
    r.legR.rotation.x=-sin(t*freq)*0.03;
    if(!o.noHead) r.head.rotation.y=sin(t*0.6)*0.07;
  });
}

/* boss 富老板：金马甲 + 白衬衫 + 黑裤 + 手杖 + 八字胡 + 蓬帕杜发型 */
function createBoss(){
  var r=charBase({id:'boss',shirt:'#f4f2ec',sleeve:'#f4f2ec',pants:'#26221e',shoe:'#1c1814',
                  bodyR:0.34,legR:0.095});
  r.body.scale.set(1.16,0.98,0.8);
  var vest=mesh(new THREE.CapsuleGeometry(0.352,0.28,4,10),M.gold);
  vest.position.y=0.33; vest.scale.set(1.16,0.9,0.82); r.torso.add(vest);
  r.torso.add(cyl(0.1,0.13,0.05,10,std('#ffffff',{rough:.7}),0,0.575,0));
  r.torso.add(box(0.055,0.16,0.02,std('#7a3a2a',{rough:.6}),0,0.47,0.26));
  r.torso.add(sph(0.028,6,M.gold,0,0.545,0.265));
  var i;
  for(i=0;i<3;i++) r.torso.add(sph(0.016,6,M.gold,0,0.42-i*0.09,0.272));
  var hairM=std('#4a3222',{rough:.75});
  var cap=sph(0.315,10,hairM,0,0.33,-0.05); cap.scale.set(1.02,0.85,1.0); r.head.add(cap);
  var pom=sph(0.17,8,hairM,0,0.52,0.02); pom.scale.set(1.35,0.72,1.0); r.head.add(pom);
  [[1],[-1]].forEach(function(s){
    var sb=sph(0.07,6,hairM,0.27*s[0],0.26,-0.02); sb.scale.set(0.5,1.1,0.9); r.head.add(sb);
    var brow=box(0.1,0.024,0.02,hairM,0.11*s[0],0.4,0.262); brow.rotation.z=-0.22*s[0]; r.head.add(brow);
    var mo=sph(0.055,6,hairM,0.075*s[0],0.145,0.26); mo.scale.set(1.6,0.55,0.7); mo.rotation.z=-0.28*s[0]; r.head.add(mo);
  });
  /* 手杖（右手前倾拄地） */
  r.armR.add(cyl(0.014,0.018,0.82,6,std('#3a2a1a',{rough:.5}),0,-0.72,0.05));
  r.armR.add(sph(0.035,8,M.gold,0,-0.325,0.055));
  charIdle(r,{baseL:0.35,baseR:-0.5,arm:0.05,bob:0.012});
  return r.g;
}

/* qian 钱掌柜：紫色套装 + 发髻 + 金项链 */
function createQian(){
  var r=charBase({id:'qian',shirt:'#8a4ab8',sleeve:'#8a4ab8',pants:'#5a3a78',shoe:'#3a2848',
                  bodyR:0.27,blush:true});
  r.body.scale.set(0.95,1,0.78);
  var wm=std('#f4f2ec',{rough:.7});
  [[1],[-1]].forEach(function(s){
    var lp=box(0.07,0.16,0.02,wm,0.1*s[0],0.47,0.235); lp.rotation.z=0.5*s[0]; r.torso.add(lp);
  });
  var nk=mesh(new THREE.TorusGeometry(0.085,0.011,6,18),M.gold);
  nk.position.set(0,0.52,0.14); nk.rotation.x=1.25; r.torso.add(nk);
  r.torso.add(sph(0.024,8,M.gold,0,0.44,0.235));
  var suitM=std('#8a4ab8',{rough:.8});
  r.torso.add(cyl(0.2,0.33,0.26,12,suitM,0,0.1,0));
  var hairM=std('#2a2020',{rough:.8});
  var cap=sph(0.315,10,hairM,0,0.34,-0.03); cap.scale.set(1,0.88,1); r.head.add(cap);
  r.head.add(sph(0.1,8,hairM,0,0.6,-0.06));
  [[1],[-1]].forEach(function(s){
    r.head.add(sph(0.02,5,M.gold,0.295*s[0],0.24,0.02));
  });
  charIdle(r,{arm:0.1});
  return r.g;
}

/* tang 糖糖：珊瑚红裙 + 橙色双马尾 + 运动鞋 */
function createTang(){
  var r=charBase({id:'tang',shirt:'#ff6b6b',sleeve:'#ff6b6b',pants:'#f2c9a0',shoe:'#f4f2ec',
                  bodyR:0.26,blush:true});
  var dressM=std('#ff6b6b',{rough:.8});
  r.torso.add(cyl(0.19,0.32,0.24,12,dressM,0,0.1,0));
  r.torso.add(cyl(0.09,0.12,0.04,10,std('#ffffff',{rough:.7}),0,0.565,0));
  r.torso.add(sph(0.016,6,std('#ffffff',{rough:.5}),0,0.42,0.222));
  r.torso.add(sph(0.016,6,std('#ffffff',{rough:.5}),0,0.33,0.226));
  var hairM=std('#e87a3a',{rough:.8});
  var cap=sph(0.315,10,hairM,0,0.33,-0.03); cap.scale.set(1,0.9,1); r.head.add(cap);
  r.head.add(box(0.3,0.1,0.08,hairM,0,0.44,0.22));
  [[1],[-1]].forEach(function(s){
    var tail=grp(); tail.position.set(0.26*s[0],0.32,-0.1); tail.rotation.z=-0.5*s[0]; r.head.add(tail);
    tail.add(sph(0.085,8,hairM,0,0,0));
    tail.add(sph(0.065,8,hairM,0,-0.13,0));
    tail.add(sph(0.03,6,std('#f4f2ec',{rough:.6}),0,-0.05,0));
  });
  var sockM=std('#f4f2ec',{rough:.7});
  [[r.legL],[r.legR]].forEach(function(L){
    var sock=cyl(0.07,0.075,0.1,8,sockM,0,-0.36,0); L[0].add(sock);
    var stripe=box(0.162,0.02,0.252,std('#ff6b6b',{rough:.7}),0,-0.47,0.045); L[0].add(stripe);
  });
  charIdle(r,{arm:0.12,bob:0.03});
  return r.g;
}

/* tu 土老财：绿色背带裤 + 草帽 + 白胡子 */
function createTu(){
  var r=charBase({id:'tu',shirt:'#e8d8b0',sleeve:'#e8d8b0',pants:'#4a9a5a',shoe:'#6a4a2a',
                  bodyR:0.32,blush:true});
  var denim=std('#4a9a5a',{rough:.85});
  r.torso.add(box(0.32,0.22,0.03,denim,0,0.3,0.255));
  [[1],[-1]].forEach(function(s){
    var st=box(0.06,0.3,0.02,denim,0.12*s[0],0.52,0.21); st.rotation.x=-0.12; r.torso.add(st);
    r.torso.add(sph(0.018,6,M.gold,0.1*s[0],0.36,0.27));
  });
  var strawM=std('#dfc06a',{rough:.9});
  var brim=cyl(0.34,0.36,0.025,12,strawM,0,0.5,0); r.head.add(brim);
  var crown=mesh(new THREE.ConeGeometry(0.2,0.15,12),strawM); crown.position.y=0.585; r.head.add(crown);
  r.head.add(cyl(0.21,0.22,0.045,12,std('#a83b2a',{rough:.7}),0,0.525,0));
  var beardM=std('#f2f2ec',{rough:.85});
  var beard=sph(0.115,8,beardM,0,0.115,0.2); beard.scale.set(1.25,0.95,0.7); r.head.add(beard);
  [[1],[-1]].forEach(function(s){
    var brow=box(0.09,0.024,0.02,beardM,0.11*s[0],0.4,0.262); brow.rotation.z=-0.18*s[0]; r.head.add(brow);
    var sh=sph(0.07,6,std('#cfc8ba',{rough:.9}),0.28*s[0],0.3,-0.02); sh.scale.set(0.5,1,0.8); r.head.add(sh);
  });
  charIdle(r,{arm:0.06,bob:0.014,freq:1.8});
  return r.g;
}

/* ren 丧彪：蓝色连帽衫 + 绿皮肤 + 发光眼 */
function createRen(){
  var r=charBase({id:'ren',skin:'#7aa86a',skinDark:'#6a985c',shirt:'#3d6ad8',sleeve:'#3d6ad8',
                  pants:'#2a2e34',shoe:'#1c1f24',glowEye:'#b8ffa0'});
  var hoodM=std('#3d6ad8',{rough:.85});
  var hood=mesh(new THREE.TorusGeometry(0.17,0.055,8,16),hoodM);
  hood.position.set(0,0.1,-0.2); hood.rotation.x=0.9; r.head.add(hood);
  var hcap=sph(0.32,10,hoodM,0,0.36,-0.08); hcap.scale.set(1.05,0.8,1.0); r.head.add(hcap);
  var hairM=std('#1c2420',{rough:.9});
  var spikes=[[0,0.56,0,0.16,0.12],[0.12,0.52,-0.06,0.15,-0.4],[-0.12,0.52,-0.06,0.15,0.4],[0.05,0.55,-0.14,0.13,0.9]];
  spikes.forEach(function(p){
    var sp=mesh(new THREE.ConeGeometry(0.05,p[3],5),hairM);
    sp.position.set(p[0],p[1],p[2]); sp.rotation.z=p[4]; r.head.add(sp);
  });
  r.torso.add(box(0.16,0.1,0.02,std('#2f55b0',{rough:.85}),0,0.22,0.26));
  [[0.06],[-0.06]].forEach(function(px){
    r.torso.add(cyl(0.006,0.006,0.1,4,std('#f4f2ec',{rough:.8}),px[0],0.44,0.25));
  });
  if(r.g.userData.glowEyes){
    var gm=r.g.userData.glowEyes[0];
    anim(r.g,function(t){ gm.emissiveIntensity=1.2+0.5*sin(t*2.6); });
  }
  charIdle(r,{arm:0.04,bob:0.01,freq:1.3,noHead:true});
  return r.g;
}

/* doudou 豆豆：蓝色机器人体 + LED 胸屏 + 天线 */
function createDoudou(){
  var r=charBase({id:'doudou',skin:'#9aa4ae',skinDark:'#8a949e',shirt:'#4a9ad8',sleeve:'#9aa4ae',
                  pants:'#7a848e',shoe:'#3a4048',bodyR:0.3,noFace:true});
  var shellM=std('#4a9ad8',{rough:.45,metal:.25});
  var shell=mesh(roundedBoxGeo(0.48,0.38,0.32,0.07),shellM);
  shell.position.y=0.3; r.torso.add(shell);
  var ledM=std('#35e0c8',{rough:.3,emissive:'#35e0c8',ei:1.1});
  r.torso.add(box(0.2,0.13,0.02,ledM,0,0.3,0.165));
  anim(r.g,function(t){ ledM.emissiveIntensity=0.8+0.5*sin(t*3.2); });
  var headM=std('#4a9ad8',{rough:.45,metal:.25});
  var h=mesh(roundedBoxGeo(0.44,0.32,0.36,0.08),headM);
  h.position.y=0.26; r.head.add(h);
  r.head.add(box(0.3,0.13,0.02,std('#101820',{rough:.3}),0,0.28,0.185));
  var eyeM=std('#5affd8',{rough:.3,emissive:'#5affd8',ei:1.4});
  r.head.add(box(0.06,0.05,0.012,eyeM, 0.08,0.28,0.2));
  r.head.add(box(0.06,0.05,0.012,eyeM,-0.08,0.28,0.2));
  for(var i=0;i<3;i++) r.head.add(box(0.02,0.015,0.012,std('#8a949e',{rough:.5}),-0.02+i*0.02,0.21,0.185));
  [[1],[-1]].forEach(function(s){
    var ear=cyl(0.045,0.045,0.03,8,std('#c8ccd0',{rough:.4,metal:.4}),0.23*s[0],0.26,0);
    ear.rotation.z=PI/2; r.head.add(ear);
  });
  r.head.add(cyl(0.008,0.008,0.16,5,M.steelD,0,0.52,0));
  var tipM=std('#ff5a4a',{rough:.3,emissive:'#ff5a4a',ei:1.2});
  var tip=sph(0.025,8,tipM,0,0.61,0); r.head.add(tip);
  anim(r.g,function(t){ tipM.emissiveIntensity=0.5+0.9*(sin(t*4.4)>0?1:0.2); });
  [[r.armL],[r.armR]].forEach(function(A){
    var jt=sph(0.07,8,std('#c8ccd0',{rough:.4,metal:.4}),0,0,0); A[0].add(jt);
  });
  charIdle(r,{arm:0.07,bob:0.016,freq:2.6,noHead:true});
  return r.g;
}

/* =====================================================================================
 * 9. 导出
 * ===================================================================================== */
window.Building3D={
  /* 特殊建筑 */
  detention:createDetention,
  station:createStation,
  ferry:createFerryDock,
  airport:createAirport,
  power:createPowerPlant,
  water:createWaterPlant,
  shop:createPropShop,
  gate:createPoliceEntrance,
  fountain:createFountain,
  /* 地产建筑（propIdx + level 1-4） */
  property:propertyBuilding,
  /* 道具 */
  props:{
    police:createPoliceCar,
    jet:createPrivateJet,
    taxi:createTaxi,
    dice:createDice3D,
    roadblock:createRoadblock,
    amulet:createAmulet,
    demolition:createDemolitionOrder,
    equalizer:createEqualizer,
    remote:createRemoteDice
  },
  /* 角色 */
  characters:{
    boss:createBoss,
    qian:createQian,
    tang:createTang,
    tu:createTu,
    ren:createRen,
    doudou:createDoudou
  },
  /* 公共件 */
  pedestal:pedestal,
  runAnims:runAnims,
  MATERIALS:M
};

/* 别名入口（规格备选命名） */
window.BuildingFactory={
  create:function(propIdx,level){ return propertyBuilding(propIdx,level); }
};

})();
