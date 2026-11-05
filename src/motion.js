import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const clamp = (n, a=0, b=1) => Math.max(a, Math.min(b,n));
const ease = n => { n=clamp(n); return n*n*(3-2*n); };

export async function initMotion(reduced) {
  const hero = document.querySelector('.hero');
  const art = document.querySelector('#hero-art');
  const loader = document.querySelector('#loader');
  const loaderArt = document.querySelector('#loader-art');
  const ink = document.querySelector('.ink');
  const inkPath = ink.querySelector('path');
  document.body.classList.add('loading');
  const introLength = reduced ? 150 : 6800;
  let renderer, scene, camera, letters, loaderModels, chrome, pink, dotted;
  let heroWidth=innerWidth,heroHeight=innerHeight, worldWidth=10, scroll=0, px=0,py=0;
  let start=performance.now(), heroStart=0, hasEntered=false, visible=true, lastFrame=0;
  let introTimer;

  function enter() {
    if(hasEntered) return;
    hasEntered=true; heroStart=performance.now();
    document.querySelector('#load-count').textContent='000';
    loader.classList.add('done'); document.body.classList.remove('loading');
    if(renderer){art.append(renderer.domElement); loaderModels.visible=false; letters.visible=true;}
    hero.classList.add('hero-entered');
    setTimeout(()=>loader.remove(),1200);
  }

  function size() {
    const box=hero.getBoundingClientRect(); heroWidth=box.width;heroHeight=box.height;
    worldWidth=6*heroWidth/heroHeight;
    if(renderer) renderer.setSize(heroWidth,heroHeight);
    if(camera){camera.left=-worldWidth/2;camera.right=worldWidth/2;camera.top=3;camera.bottom=-3;camera.updateProjectionMatrix();}
    if(letters){const width=letters.userData.width;const scale=worldWidth*.79/width;letters.scale.setScalar(scale);letters.userData.baseScale=scale;}
  }

  const onScroll=()=>{scroll=window.scrollY;};
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('pointermove',e=>{px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5;},{passive:true});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(hero);

  try {
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    renderer.setClearColor(0x000000,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    loaderArt.append(renderer.domElement);
    scene=new THREE.Scene();camera=new THREE.OrthographicCamera(-5,5,3,-3,.1,100);camera.position.z=12;
    const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();
    scene.environment=pmrem.fromScene(room,.035).texture;room.dispose();pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xffffff,0x181421,2));
    const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(-3,5,7);scene.add(key);
    chrome=new THREE.MeshPhysicalMaterial({color:0xd7d8d9,metalness:1,roughness:.18,clearcoat:1});
    pink=new THREE.MeshPhysicalMaterial({color:0xc81268,metalness:.82,roughness:.2,clearcoat:1});
    dotted=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:.22,roughness:.34,clearcoat:.7,map:speckledTexture()});
    const blue=new THREE.MeshPhysicalMaterial({color:0x4c40ee,metalness:.8,roughness:.25,clearcoat:1});
    letters=new THREE.Group();letters.visible=false;scene.add(letters);
    let x=0;
    for(const [index,char] of [...'endy.j'].entries()){
      const geometry=inflatedLetter(char);
      geometry.computeBoundingBox();const box=geometry.boundingBox;const width=box.max.x-box.min.x;
      geometry.translate(-box.min.x,-.5,-.08);
      const mesh=new THREE.Mesh(geometry,chrome);mesh.position.x=x;mesh.userData={home:x,index};
      letters.add(mesh);x+=width+.10;
    }
    for(const mesh of letters.children){mesh.position.x-=x/2;mesh.userData.home=mesh.position.x;}
    letters.userData.width=x;
    const geometries=[heartGeometry(),crumpleGeometry(),softCube(),new THREE.TorusKnotGeometry(.34,.10,64,10,2,3),new THREE.TorusGeometry(.36,.16,16,48),starGeometry()];
    loaderModels=new THREE.Group();scene.add(loaderModels);
    geometries.forEach((geometry,index)=>{const mesh=new THREE.Mesh(geometry,index===2?blue:index===3||index===4?pink:chrome);mesh.visible=false;loaderModels.add(mesh);});
    new ResizeObserver(size).observe(hero);size();
    start=performance.now();introTimer=setTimeout(enter,introLength+1500);
    requestAnimationFrame(frame);
  } catch(error) {
    console.warn('Using the non-WebGL lettering fallback:',error.message); loader.classList.add('no-webgl');
    art.innerHTML='<div class="lettering-fallback" aria-hidden="true">endy.j</div>';
    start=performance.now(); requestAnimationFrame(fallbackIntro);
  }

  function fallbackIntro(now){
    const progress=clamp((now-start)/introLength);
    document.querySelector('#load-count').textContent=String(Math.round(100*(1-progress))).padStart(3,'0');
    loader.dataset.object=String(Math.floor(progress*5));
    if(progress<1) requestAnimationFrame(fallbackIntro);else enter();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if(document.hidden)return;
    // Cap rendering at 30fps on software renderers and mobile displays.
    if(now-lastFrame<32)return;lastFrame=now;
    const t=(now-start)/1000;
    if(!hasEntered){
      const progress=clamp((now-start)/introLength);
      document.querySelector('#load-count').textContent=String(Math.round(100*(1-ease((progress-.12)/.88)))).padStart(3,'0');
      const index=Math.min(5,Math.floor(progress*6));
      loaderModels.children.forEach((mesh,i)=>{mesh.visible=i===index;mesh.rotation.set(t*.4,t*.5,Math.sin(t)*.15);});
      const ending=1-ease((progress-.88)/.12);loaderModels.scale.setScalar(ending*.85);
      renderer.render(scene,camera);
      if(progress>=1){clearTimeout(introTimer);enter();}
      return;
    }
    if(!visible)return;
    const elapsed=(now-heroStart)/1000;
    const cycle=reduced?2:elapsed%12;
    const enterAmount=reduced?1:ease(cycle/.9);
    const exitAmount=reduced?0:ease((cycle-7.1)/1.5);
    const show=enterAmount*(1-exitAmount);
    const progress=clamp(scroll/heroHeight);
    const useDotted=cycle>=3.2&&cycle<6.2;
    const material=cycle<3.2?chrome:useDotted?dotted:pink;
    letters.visible=show>.001&&progress<1.1;
    const homeScale=letters.userData.baseScale;
    letters.scale.setScalar(homeScale*(.96+.04*show));
    letters.position.y=-progress*1.6;
    letters.rotation.y=reduced?0:px*.065;
    letters.children.forEach((mesh,index)=>{
      mesh.material=material;
      const stagger=exitAmount*(index%2?1:-1);
      const wander=reduced?0:Math.sin(elapsed*.9+index*1.4)*.035;
      mesh.position.x=mesh.userData.home+(1-show)*(index-2.5)*.25;
      mesh.position.y=wander+(1-enterAmount)*(index%2?.9:-.9)+stagger*2;
      mesh.position.z=reduced?0:Math.cos(elapsed*.6+index)*.06;
      mesh.rotation.set(reduced?0:Math.sin(elapsed*.7+index)*.09+py*.05, (1-enterAmount)*1.8+stagger*1.7, wander*.9+stagger*.5);
    });
    const splash=show*ease((cycle-1.5)/.9)*(1-progress);
    ink.style.opacity=String(splash);
    if(!reduced && splash>.01) morphInk(elapsed,inkPath,px,py);
    const heroBottom=document.querySelector('.hero-bottom');
    heroBottom.style.opacity=String(1-clamp(progress*2));
    document.querySelector('.wordmark').style.transform=`translate(-50%, -50%) translateY(${-scroll*.16}px)`;
    renderer.render(scene,camera);
  }

  // Scroll choreography is tied to position and reversible, rather than a generic fade-in.
  const projects=[...document.querySelectorAll('.project')];
  const studio=document.querySelector('.studio-sequence');
  const sticky=studio.querySelector('.sequence-sticky');
  const footer=document.querySelector('footer');
  let ticking=false;
  function positionElements(){
    ticking=false;const height=innerHeight;
    projects.forEach((project,index)=>{
      const rect=project.getBoundingClientRect();const travel=clamp((height-rect.top)/(height+rect.height));
      project.style.setProperty('--image-shift',`${reduced?0:(.5-travel)*55}px`);
      project.style.setProperty('--image-scale',String(reduced?1:1.12-travel*.08));
    });
    const r=studio.getBoundingClientRect();const p=clamp(-r.top/(studio.offsetHeight-height));
    sticky.style.setProperty('--sequence',p);
    sticky.querySelector('.sequence-objects').style.transform=reduced?'none':`translateY(${(p-.5)*-100}px) rotate(${(p-.5)*35}deg) scale(${.75+p*.5})`;
    sticky.querySelector('p').style.opacity=String(reduced?1:ease((p-.3)*2));
    const footerRect=footer.getBoundingClientRect();const fp=clamp((height-footerRect.top)/height);
    footer.querySelector('.footer-wordmark').style.transform=reduced?'none':`translateY(${(1-fp)*100}px)`;
  }
  window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(positionElements);}},{passive:true});
  window.addEventListener('resize',positionElements);positionElements();
}

function speckledTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#ecabb7';ctx.fillRect(0,0,512,512);
  let seed=194;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<2500;i++){const x=random()*512,y=random()*512,r=.4+random()*3.8;ctx.fillStyle=i%3?'#813046':'#f9c5d0';ctx.beginPath();ctx.ellipse(x,y,r,r*.55,random()*Math.PI,0,Math.PI*2);ctx.fill();}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function crumpleGeometry(){
  const g=new THREE.IcosahedronGeometry(.48,3);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const r=1+Math.sin(x*31+y*17)*Math.cos(z*23+y*13)*.12;p.setXYZ(i,x*r,y*r,z*r);}
  g.computeVertexNormals();return g;
}
function heartGeometry(){
  const s=new THREE.Shape();s.moveTo(0,-.45);s.bezierCurveTo(-.95,.12,-.5,.9,0,.42);s.bezierCurveTo(.5,.9,.95,.12,0,-.45);
  const g=new THREE.ExtrudeGeometry(s,{depth:.14,bevelEnabled:true,bevelThickness:.14,bevelSize:.1,bevelSegments:5,curveSegments:24});g.center();return g;
}
function starGeometry(){
  const s=new THREE.Shape();
  for(let i=0;i<80;i++){const a=i/80*Math.PI*2;const r=.35+Math.cos(a*6)*.14;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?s.lineTo(x,y):s.moveTo(x,y);}
  s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.08,bevelEnabled:true,bevelThickness:.09,bevelSize:.06,bevelSegments:5});g.center();return g;
}
function morphInk(t,path,px,py){
  const pts=[];
  for(let i=0;i<40;i++){const a=i/40*Math.PI*2;const waves=Math.sin(a*5+t*.8)*.16+Math.cos(a*9-t*.7)*.09+Math.sin(a*13+t*.4)*.04;
    pts.push([600+Math.cos(a)*(480+waves*450)+px*40,325+Math.sin(a)*(185+waves*270)+py*30]);}
  let d='';
  for(let i=0;i<pts.length;i++){const current=pts[i],next=pts[(i+1)%pts.length];const mid=[(current[0]+next[0])/2,(current[1]+next[1])/2];if(!i)d=`M${mid[0]},${mid[1]}`;else d+=`Q${current[0]},${current[1]} ${mid[0]},${mid[1]}`;}
  const p=pts[0],n=pts[1];d+=`Q${p[0]},${p[1]} ${(p[0]+n[0])/2},${(p[1]+n[1])/2}Z`;path.setAttribute('d',d);
}

function inflatedLetter(char){
  // Rounded centreline strokes produce genuinely inflated surfaces, without flat text caps.
  const paths={
    e:[[[.75,.16],[.48,.04],[.16,.18],[.07,.48],[.17,.77],[.45,.87],[.7,.75],[.77,.48],[.43,.46],[.1,.46]]],
    n:[[[.06,.02],[.06,.42],[.06,.85]],[[.07,.52],[.28,.81],[.55,.83],[.73,.61],[.73,.02]]],
    d:[[[.69,.42],[.58,.76],[.3,.85],[.06,.63],[.05,.26],[.29,.04],[.57,.11],[.69,.42]],[[.7,.02],[.7,.64],[.7,1.25]]],
    y:[[[.02,.85],[.17,.47],[.35,.08]],[[.72,.85],[.52,.38],[.31,-.1],[.15,-.37],[-.04,-.4]]],
    j:[[[.28,.8],[.28,.36],[.28,-.12],[.17,-.38],[-.06,-.4]]]
  };
  const pieces=[];
  const radius=.115;
  for(const [index,points] of (paths[char]||[]).entries()){
    const positions=points.map(([x,y],i)=>new THREE.Vector3(x,y,Math.sin(i*.8+index)*.025));
    const curve=new THREE.CatmullRomCurve3(positions,false,'centripetal');
    pieces.push(new THREE.TubeGeometry(curve,Math.max(32,points.length*8),radius,18,false));
    for(const point of [positions[0],positions.at(-1)]){const cap=new THREE.SphereGeometry(radius,18,12);cap.translate(point.x,point.y,point.z);pieces.push(cap);}
  }
  if(char==='.'||char==='j'){
    const dot=new THREE.SphereGeometry(char==='.'?.13:.125,24,16);dot.translate(char==='.'?.13:.28,char==='.'?.03:1.18,0);pieces.push(dot);
  }
  return mergeGeometries(pieces);
}
function softCube(){
  const g=new THREE.BoxGeometry(.6,.6,.6,8,8,8);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const v=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i));const core=v.clone().clampScalar(-.2,.2);v.sub(core).normalize().multiplyScalar(.14).add(core);p.setXYZ(i,v.x,v.y,v.z);}
  g.deleteAttribute('normal');g.deleteAttribute('uv');const smooth=mergeVertices(g);smooth.computeVertexNormals();g.dispose();return smooth;
}
