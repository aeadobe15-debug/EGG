const defaults={h:100,d:68,dz:68,p:43,top:48,bottom:76};let state={...defaults};try{const s=JSON.parse(localStorage.getItem('eggform'));if(s){if(s.positionUnit!=='mm'&&s.positionUnit!=='m')s.p=s.h*s.p/100;s.dz=s.dz||s.dy||s.d;delete s.dy;Object.assign(state,s)}}catch{}if(!MATERIALS.some(m=>m.id===state.material))state.material='red';state.showMaterial=state.showMaterial!==false;const fields=[['h','整体高度（Y 轴）',20,300,'m'],['d','最宽截面 X 轴直径',20,300,'m'],['dz','最宽截面 Z 轴直径',20,300,'m'],['p','最宽位置（距底部）',1,299,'m'],['top','顶部圆润度',10,100,'%'],['bottom','底部圆润度',10,100,'%']];let rx=-.3,ry=.4,zoom=1,wire=false,transparent=false,faces=[],shadowHull=[];const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const meters=v=>Math.round(v);
for(const [key,label,min,baseMax,unit] of fields){const max=key==='p'?state.h-1:baseMax,factor=1,show=v=>Math.round(v);state[key]=Math.max(min,Math.min(max,Math.round(Number(state[key]))||defaults[key]));const el=document.createElement('div');el.className='control';el.innerHTML=`<div class="row"><label for="n-${key}">${label}</label><div class="value"><input id="n-${key}" type="number" min="${show(min)}" max="${show(max)}" step="${1/factor}" value="${show(state[key])}"><small>${unit}</small></div></div><input aria-label="${label}" id="r-${key}" type="range" min="${show(min)}" max="${show(max)}" step="${1/factor}" value="${show(state[key])}"><div class="ends"><span>${show(min)}</span><span>${show(max)}</span></div>`;document.querySelector('#controls').append(el);const n=el.querySelector('input[type=number]'),r=el.querySelector('input[type=range]');function change(v){if(!Number.isFinite(v))return;state[key]=Math.max(min,Math.min(key==='p'?state.h-1:max,Math.round(v*factor)));n.value=r.value=show(state[key]);update()}r.oninput=()=>change(+r.value);n.onchange=()=>change(n.valueAsNumber)}
function profile(t,upper){const R=state.d/2,L=state.h*(upper?1-state.p/state.h:state.p/state.h),c=.18+.0068*state[upper?'top':'bottom'],u=1-t;return [3*u*u*t*c*R+3*u*t*t*R+t*t*t*R,(upper?1:-1)*L*(u*u*u+3*u*u*t+3*u*t*t*.45)+state.h*(state.p/state.h-.5)]}
function mesh(){const rings=[],N=80,M=48;for(let i=0;i<=M*2;i++){let upper=i<=M,t=upper?i/M:(2*M-i)/M;const [r,y]=profile(t,upper);rings.push(Array.from({length:N},(_,j)=>[r*Math.cos(j/N*2*Math.PI),y,r*state.dz/state.d*Math.sin(j/N*2*Math.PI)]))}faces=[];for(let i=0;i<2*M;i++)for(let j=0;j<N;j++){let a=rings[i][j],b=rings[i][(j+1)%N],c=rings[i+1][j],d=rings[i+1][(j+1)%N];const add=(vertices,u,v)=>{vertices.uv=[u,v];vertices.color=materialColor(state.material,u,v);faces.push(vertices)};if(i>0)add([a,b,c],(j+1/3)/N,(i+1/3)/(2*M));if(i<2*M-1)add([b,d,c],(j+2/3)/N,(i+2/3)/(2*M))}}
function normal(f){const a=f[1].map((x,i)=>x-f[0][i]),b=f[2].map((x,i)=>x-f[0][i]);let n=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],l=Math.hypot(...n)||1;return n.map(x=>x/l)}
function rot(p){let x=p[0]*Math.cos(ry)+p[2]*Math.sin(ry),z=-p[0]*Math.sin(ry)+p[2]*Math.cos(ry);return[x,p[1]*Math.cos(rx)-z*Math.sin(rx),p[1]*Math.sin(rx)+z*Math.cos(rx)]}
function project(p,scale,cx,cy){const k=1;return[cx+p[0]*scale*k,cy-p[1]*scale*k]}
function sectionFrame(){const x=state.d/2,z=state.dz/2,y=state.p-state.h/2;return[[-x,y,-z],[x,y,-z],[x,y,z],[-x,y,z]]}
function drawFrame(scale,cx,cy,w,h){
 const corners=sectionFrame().map(rot),points=corners.map(p=>project(p,scale,cx,cy));
 ctx.save();ctx.lineWidth=1.5;
 for(let i=0;i<4;i++){const j=(i+1)%4;ctx.strokeStyle=i%2?'#d64545':'#276fd4';ctx.setLineDash((corners[i][2]+corners[j][2])/2<rot([0,state.p-state.h/2,0])[2]?[4,3]:[]);ctx.beginPath();ctx.moveTo(...points[i]);ctx.lineTo(...points[j]);ctx.stroke()}
 ctx.setLineDash([]);
 const center=project(rot([0,state.p-state.h/2,0]),scale,cx,cy);
 function label(edge,text,color,offset){const a=points[edge],b=points[(edge+1)%4],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];let dx=m[0]-center[0],dy=m[1]-center[1],len=Math.hypot(dx,dy);if(len<1){dx=0;dy=offset;len=1}ctx.font='600 12px system-ui';const tw=ctx.measureText(text).width+12;const x=Math.max(tw/2+3,Math.min(w-tw/2-3,m[0]+dx/len*20)),y=Math.max(15,Math.min(h-15,m[1]+dy/len*20));ctx.fillStyle='#fffffff0';ctx.fillRect(x-tw/2,y-11,tw,22);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x,y)}
 const depth=i=>corners[i][2]+corners[(i+1)%4][2];label(depth(0)>depth(2)?0:2,'X '+meters(state.d)+' m','#276fd4',-1);label(depth(1)>depth(3)?1:3,'Z '+meters(state.dz)+' m','#d64545',1);ctx.restore();
}
function heightDistances(){return{bottom:state.p,top:state.h-state.p}}
function drawHeight(scale,cx,cy,w,h){
 const ends=[-state.h/2,state.p-state.h/2,state.h/2].map(y=>project(rot([0,y,0]),scale,cx,cy));
 const frame=sectionFrame().map(p=>project(rot(p),scale,cx,cy));const x=Math.min(w-12,Math.max(...frame.map(p=>p[0]))+18);
 ctx.save();ctx.strokeStyle='#8b4bc1';ctx.fillStyle='#8b4bc1';ctx.lineWidth=1.5;ctx.font='600 11px system-ui';ctx.textBaseline='middle';ctx.textAlign='center';
 ctx.beginPath();ctx.moveTo(x,ends[0][1]);ctx.lineTo(x,ends[2][1]);ctx.stroke();
 for(const p of ends){ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(x,p[1]);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(x-4,p[1]);ctx.lineTo(x+4,p[1]);ctx.stroke()}
 const distances=heightDistances();for(const [i,text]of [[0,'距底 '+meters(distances.bottom)+' m'],[1,'距顶 '+meters(distances.top)+' m']]){const tw=ctx.measureText(text).width+8,lx=Math.max(tw/2+3,Math.min(w-tw/2-3,x-tw/2-7)),ly=Math.max(14,Math.min(h-14,(ends[i][1]+ends[i+1][1])/2));ctx.fillStyle='#fffffff0';ctx.fillRect(lx-tw/2,ly-10,tw,20);ctx.fillStyle='#8b4bc1';ctx.fillText(text,lx,ly)}ctx.restore();
}
function groundY(){return-state.h/2}
function drawGround(scale,cx,cy){
 const y=groundY(),extent=175,toScreen=(x,z)=>project(rot([x,y,z]),scale,cx,cy);
 ctx.save();ctx.fillStyle='#dce3d58c';ctx.strokeStyle='#9cae9660';ctx.lineWidth=.7;ctx.beginPath();[[-extent,-extent],[extent,-extent],[extent,extent],[-extent,extent]].forEach(([x,z],i)=>{const p=toScreen(x,z);i?ctx.lineTo(...p):ctx.moveTo(...p)});ctx.closePath();ctx.fill();ctx.stroke();
 for(let t=-extent;t<=extent;t+=25){ctx.beginPath();ctx.moveTo(...toScreen(t,-extent));ctx.lineTo(...toScreen(t,extent));ctx.moveTo(...toScreen(-extent,t));ctx.lineTo(...toScreen(extent,t));ctx.stroke()}
 ctx.fillStyle='#68805d';ctx.beginPath();ctx.arc(...toScreen(0,0),2.5,0,Math.PI*2);ctx.fill();ctx.restore();
}
function oneThirdPlane(){
 const y=-state.h/6,upper=y>=state.p-state.h/2;let low=0,high=1;
 for(let i=0;i<45;i++){const t=(low+high)/2,py=profile(t,upper)[1];if(upper?py>y:py<y)low=t;else high=t}
 const r=profile((low+high)/2,upper)[0],half=Math.max(r,r*state.dz/state.d);
 return{y,half,corners:[[-half,y,-half],[half,y,-half],[half,y,half],[-half,y,half]]};
}
function drawOneThird(scale,cx,cy,w,h,fillOnly=false){
 const plane=oneThirdPlane(),points=plane.corners.map(p=>project(rot(p),scale,cx,cy));ctx.save();ctx.fillStyle='#21b8bf22';ctx.strokeStyle='#168e99';ctx.lineWidth=1.5;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(fillOnly){ctx.fill();ctx.restore();return}ctx.setLineDash([6,3]);ctx.stroke();ctx.setLineDash([]);
 const anchor=points.reduce((a,b)=>a[1]<b[1]?a:b),label='1/3 高度参考面';ctx.font='600 11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';const tw=ctx.measureText(label).width+10,x=Math.max(tw/2+3,Math.min(w-tw/2-3,anchor[0])),y=Math.max(14,Math.min(h-14,anchor[1]-14));ctx.fillStyle='#ffffffed';ctx.fillRect(x-tw/2,y-10,tw,20);ctx.fillStyle='#168e99';ctx.fillText(label,x,y);ctx.restore();
}
const unit=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l)};
const KEY_LIGHT=unit([-.65,1,.5]),FILL_LIGHT=unit([.9,.35,.35]),RIM_LIGHT=unit([.15,.75,-1]);
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
function studioColor(n,color){
 const key=rot(KEY_LIGHT),fill=rot(FILL_LIGHT),rim=rot(RIM_LIGHT),diffuse=Math.max(0,dot(n,key)),softFill=Math.max(0,dot(n,fill)),edge=Math.max(0,dot(n,rim));
 const half=unit([key[0],key[1],key[2]+1]),spec=Math.pow(Math.max(0,dot(n,half)),28)*.26;
 const ambient=.27+.08*(n[1]+1)/2,shade=ambient+.65*diffuse+.2*softFill+.28*edge;
 return color.map((c,i)=>Math.round(Math.min(255,Math.max(0,c*shade+spec*[255,245,230][i]+edge*[10,16,26][i]))));
}
function buildShadowHull(){
 const points=faces.flatMap(f=>f.map(p=>{const t=(p[1]-groundY())/KEY_LIGHT[1];return[p[0]-KEY_LIGHT[0]*t,p[2]-KEY_LIGHT[2]*t]})).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lower=[],upper=[];
 for(const p of points){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p)}
 for(let i=points.length-1;i>=0;i--){const p=points[i];while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p)}return lower.slice(0,-1).concat(upper.slice(0,-1));
}
function drawStudioShadow(scale,cx,cy){
 ctx.save();ctx.globalAlpha=transparent?.35:1;ctx.fillStyle='#26304038';ctx.filter='blur('+Math.min(14,Math.max(2,scale*4))+'px)';ctx.beginPath();shadowHull.forEach((p,i)=>{const q=project(rot([p[0],groundY(),p[1]]),scale,cx,cy);i?ctx.lineTo(...q):ctx.moveTo(...q)});ctx.closePath();ctx.fill();
 ctx.filter='blur(2px)';ctx.fillStyle='#26304065';ctx.beginPath();const r=Math.min(state.d,state.dz)*.09;for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,q=project(rot([Math.cos(a)*r,groundY(),Math.sin(a)*r]),scale,cx,cy);i?ctx.lineTo(...q):ctx.moveTo(...q)}ctx.closePath();ctx.fill();ctx.restore();
}
function draw(){let w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);let scale=Math.min(w*.57/68,h*.62/100)*zoom,cx=w/2,cy=h*.54;drawGround(scale,cx,cy);drawStudioShadow(scale,cx,cy);drawOneThird(scale,cx,cy,w,h,true);let fs=faces.map(f=>{const r=f.map(rot);r.color=state.showMaterial?f.color:[190,194,201];return r});fs.sort((a,b)=>a.reduce((s,p)=>s+p[2],0)-b.reduce((s,p)=>s+p[2],0));for(const f of fs){const n=normal(f);if(!transparent&&n[2]<=0)continue;ctx.fillStyle='rgb('+studioColor(n,f.color).join(',')+')';ctx.beginPath();f.forEach((p,i)=>{let [x,y]=project(p,scale,cx,cy);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.globalAlpha=transparent?.16:1;ctx.fill();ctx.strokeStyle=wire?'#34554055':ctx.fillStyle;ctx.lineWidth=wire?.5:.6;if(wire||!transparent)ctx.stroke();ctx.globalAlpha=1}drawOneThird(scale,cx,cy,w,h);drawFrame(scale,cx,cy,w,h);drawHeight(scale,cx,cy,w,h)}
function update(){state.p=Math.max(1,Math.min(state.h-1,state.p));const pn=document.querySelector('#n-p'),pr=document.querySelector('#r-p');pn.max=pr.max=meters(state.h-1);pn.value=pr.value=meters(state.p);pr.parentElement.querySelector('.ends span:last-child').textContent=meters(state.h-1);mesh();shadowHull=buildShadowHull();draw();document.querySelector('#dims').textContent=`Y ${meters(state.h)} / X ${meters(state.d)} / Z ${meters(state.dz)} m`;try{localStorage.setItem('eggform',JSON.stringify({...state,positionUnit:'m'}))}catch{}}
function preset(s){state={...s,dz:s.dz||s.d,material:state.material,showMaterial:state.showMaterial};for(const [k]of fields){document.querySelector('#n-'+k).value=document.querySelector('#r-'+k).value=['h','d','dz','p'].includes(k)?meters(state[k]):state[k]}update()}
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>preset(b.dataset.p==='egg'?defaults:b.dataset.p==='oval'?{h:100,d:68,p:50,top:55,bottom:55}:{h:80,d:80,p:40,top:65,bottom:65}));document.querySelector('#reset').onclick=()=>{rx=-.3;ry=.4;zoom=1;preset(defaults)};document.querySelector('#wire').onclick=e=>{wire=!wire;e.target.classList.toggle('active',wire);e.target.setAttribute('aria-pressed',wire);draw()};document.querySelector('#front').onclick=()=>{rx=ry=0;zoom=1;draw()};
document.querySelector('#projection').onclick=e=>{transparent=!transparent;e.target.classList.toggle('active',transparent);e.target.setAttribute('aria-pressed',transparent);e.target.textContent=transparent?'实体':'透明';draw()};
const pointers=new Map();canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,[e.clientX,e.clientY])};canvas.onpointermove=e=>{if(!pointers.has(e.pointerId))return;let old=pointers.get(e.pointerId),p=[e.clientX,e.clientY];if(pointers.size===2){let other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1],a=Math.hypot(old[0]-other[0],old[1]-other[1]),b=Math.hypot(p[0]-other[0],p[1]-other[1]);if(a>0)zoom=Math.max(.15,Math.min(2.5,zoom*b/a))}else{ry+=(p[0]-old[0])*.01;rx=Math.max(-Math.PI/2,Math.min(Math.PI/2,rx+(p[1]-old[1])*.01))}pointers.set(e.pointerId,p);draw()};canvas.onpointerup=canvas.onpointercancel=e=>pointers.delete(e.pointerId);canvas.onwheel=e=>{e.preventDefault();zoom=Math.max(.4,Math.min(2.5,zoom*Math.exp(-e.deltaY*.001)));draw()};new ResizeObserver(draw).observe(canvas);
function chooseMaterial(id){if(!MATERIALS.some(m=>m.id===id))return;state.material=id;document.querySelectorAll('[data-material]').forEach(b=>{const active=b.dataset.material===id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active)});document.querySelector('#material-name').textContent=MATERIALS.find(m=>m.id===id).name;update()}
for(const m of MATERIALS){const tile=document.createElement('button');tile.type='button';tile.className='material-tile';tile.dataset.material=m.id;tile.setAttribute('aria-label','使用'+m.name+'材质');const preview=document.createElement('canvas');preview.width=96;preview.height=64;const pc=preview.getContext('2d'),data=pc.createImageData(96,64);for(let y=0;y<64;y++)for(let x=0;x<96;x++){const rgb=materialColor(m.id,x/96,y/64),i=(y*96+x)*4;data.data.set([...rgb,255],i)}pc.putImageData(data,0,0);const img=document.createElement('img');img.src=preview.toDataURL();img.alt='';tile.append(img);const name=document.createElement('span');name.textContent=m.name;tile.append(name);tile.onclick=()=>chooseMaterial(m.id);document.querySelector('#materials').append(tile)}
const materialToggle=document.querySelector('#show-material');materialToggle.checked=state.showMaterial;materialToggle.onchange=()=>{state.showMaterial=materialToggle.checked;update()};
chooseMaterial(state.material);
document.querySelector('#export').onclick=()=>{let text='solid egg\n';for(const f of faces){text+=`facet normal ${normal(f).join(' ')}\nouter loop\n`+f.map(p=>'vertex '+p.join(' ')).join('\n')+'\nendloop\nendfacet\n'}text+='endsolid egg';const url=URL.createObjectURL(new Blob([text],{type:'model/stl'})),a=document.createElement('a');a.href=url;a.download='egg-model-m.stl';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);document.querySelector('#status').textContent='模型已导出 · 坐标单位 m'};update();
