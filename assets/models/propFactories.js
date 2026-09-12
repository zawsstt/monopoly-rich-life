// Procedural prop factories — generated from AI reference images
// Each function returns a THREE.Group ready to add to scene
// Palette sampled from AI-generated reference images
window.PropFactories = {};

// police factory
(function() {
  const P = {"body": "#f0f0f0", "accent": "#27415e", "light1": "#ff2d3c", "light2": "#3c78ff", "wheel": "#222828"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  g.add(bx(1.4,.32,.68, M(P.body,.35), 0,.36,0));
  g.add(bx(.72,.26,.56, M(P.accent||P.window||'#39536b',.4), -.06,.62,0));
  const stripe = bx(1.42,.12,.7, M(P.accent||'#27415e',.5), 0,.44,0); g.add(stripe);
  [[-.46,.34],[.46,.34],[-.46,-.34],[.46,-.34]].forEach(([wx,wz]) => {
    const w = cyl(.14,.14,.1, M(P.wheel||'#222828',.4), wx,.14,wz,12); w.rotation.x=Math.PI/2; g.add(w); });
  const lbR = bx(.16,.1,.22, M('#ff2d3c',.2,.8), -.1,.78,0); g.add(lbR); g.userData.lbR = lbR;
  const lbB = bx(.16,.1,.22, M('#3c78ff',.2,.8), .1,.78,0); g.add(lbB); g.userData.lbB = lbB;
  g.add(bx(.5,.02,.5, M('#d8a04a',.3,.5), 0,.57,0));
  window.PropFactories.police = function() { return g.clone(); };
})();

// jet factory
(function() {
  const P = {"body": "#f5f5f5", "accent": "#3d7bff", "window": "#bfe4ff", "trim": "#d8a04a"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  const fus = cyl(.18,.12,1.5, M(P.body||'#f5f5f5',.3), 0,.5,.2,14); fus.rotation.x=Math.PI/2; g.add(fus);
  const wing = bx(1.4,.05,.35, M(P.accent||'#3d7bff',.35), 0,.5,.1); g.add(wing);
  const tail = bx(.5,.04,.24, M(P.accent||'#3d7bff',.35), 0,.68,-.55); g.add(tail);
  const fin = bx(.04,.3,.24, M(P.accent||'#3d7bff',.35), 0,.72,-.55); g.add(fin);
  window.PropFactories.jet = function() { return g.clone(); };
})();

// taxi factory
(function() {
  const P = {"body": "#ffd23c", "accent": "#222828", "sign": "#ff8800", "wheel": "#222828"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  g.add(bx(1.4,.32,.68, M(P.body,.35), 0,.36,0));
  g.add(bx(.72,.26,.56, M(P.accent||P.window||'#39536b',.4), -.06,.62,0));
  const stripe = bx(1.42,.12,.7, M(P.accent||'#27415e',.5), 0,.44,0); g.add(stripe);
  [[-.46,.34],[.46,.34],[-.46,-.34],[.46,-.34]].forEach(([wx,wz]) => {
    const w = cyl(.14,.14,.1, M(P.wheel||'#222828',.4), wx,.14,wz,12); w.rotation.x=Math.PI/2; g.add(w); });
  g.add(bx(.24,.12,.3, M(P.sign||'#ff8800',.4), 0,.7,0));
  window.PropFactories.taxi = function() { return g.clone(); };
})();

// dice factory
(function() {
  const P = {"body": "#f8f5ec", "pip": "#2b2f36"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(.42,.42,.42);
  const m = M(P.body||'#f8f5ec',.3);
  const mesh = new THREE.Mesh(geo, m); mesh.castShadow = true; g.add(mesh);
  window.PropFactories.dice = function() { return g.clone(); };
})();

// roadblock factory
(function() {
  const P = {"body": "#ff8800", "stripe": "#ffffff", "light": "#ff2d3c", "base": "#555"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  g.add(bx(.8,.4,.06, M(P.body||'#ff8800',.4), 0,.4,0));
  g.add(bx(.82,.08,.08, M(P.stripe||'#fff',.5), 0,.42,0));
  g.add(bx(.08,.28,.08, M(P.base||'#555',.5), -.3,.14,0));
  g.add(bx(.08,.28,.08, M(P.base||'#555',.5), .3,.14,0));
  window.PropFactories.roadblock = function() { return g.clone(); };
})();

// fountain factory
(function() {
  const P = {"basin": "#9fb6c4", "water": "#54b8e8", "stone": "#8fa3ad"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  g.add(cyl(.5,.6,.2, M(P.basin||'#9fb6c4',.4), 0,.1,0,20));
  g.add(cyl(.4,.4,.08, M(P.water||'#54b8e8',.15), 0,.22,0,20));
  g.add(cyl(.08,.12,.35, M(P.stone||'#8fa3ad',.5), 0,.4,0,10));
  g.add(sp(.1, M(P.water||'#54b8e8',.15), 0,.6,0));
  window.PropFactories.fountain = function() { return g.clone(); };
})();

// amulet factory
(function() {
  const P = {"rim": "#d8a04a", "blue1": "#3d7bff", "blue2": "#1a3a8f", "tassel": "#c9a54b"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  g.add(bx(.3,.3,.15, M(P.body||P.rim||'#888',.4), 0,.2,0));
  window.PropFactories.amulet = function() { return g.clone(); };
})();

// demolition factory
(function() {
  const P = {"paper": "#ff8800", "seal": "#d9534f", "stick": "#8a2222"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  g.add(bx(.3,.3,.15, M(P.body||P.rim||'#888',.4), 0,.2,0));
  window.PropFactories.demolition = function() { return g.clone(); };
})();

// equalizer factory
(function() {
  const P = {"base": "#d8a04a", "pan": "#c9b464", "gem": "#4fa8e8", "chain": "#b8a86a"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  g.add(bx(.3,.3,.15, M(P.body||P.rim||'#888',.4), 0,.2,0));
  window.PropFactories.equalizer = function() { return g.clone(); };
})();

// remote factory
(function() {
  const P = {"body": "#4a4a58", "button": "#ffd76a", "led": "#ff4444", "antenna": "#888"};
  function M(c,r,m) { return new THREE.MeshStandardMaterial({color:c,roughness:r||.6,metalness:m||0}); }
  function bx(sx,sy,sz,m,x,y,z,rx,ry,rz) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), m);
    g.position.set(x||0,y||0,z||0);
    if(rx)g.rotation.x=rx; if(ry)g.rotation.y=ry; if(rz)g.rotation.z=rz;
    g.castShadow = true; return g; }
  function cyl(rt,rb,h,m,x,y,z,seg) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  function sp(r,m,x,y,z) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(r,16,12), m);
    g.position.set(x||0,y||0,z||0); g.castShadow = true; return g; }
  const g = new THREE.Group();
  g.add(bx(.3,.3,.15, M(P.body||P.rim||'#888',.4), 0,.2,0));
  window.PropFactories.remote = function() { return g.clone(); };
})();
