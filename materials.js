const MATERIALS=[
{id:'red',name:'赤焰条纹',colors:['#fff5e9','#df3541','#ff9365']},
{id:'blue',name:'苍蓝斑点',colors:['#f4f6ec','#327bc4','#77c7df']},
{id:'gold',name:'雷光裂纹',colors:['#ffe391','#7352ad','#fff7ca']},
{id:'leaf',name:'翠叶新生',colors:['#eef0b6','#358b68','#9dcf76']},
{id:'violet',name:'幻紫菱晶',colors:['#eee3fa','#7953b7','#e2a4d8']},
{id:'pink',name:'星愿桃粉',colors:['#fff0e8','#e570a2','#f4bf4d']},
{id:'ice',name:'冰海波纹',colors:['#dff7f6','#269aa8','#6078cd']},
{id:'dark',name:'黑金数码',colors:['#273345','#e9ba58','#6fc9b0']}];
const fract=x=>x-Math.floor(x);
function materialColor(id,u,v){const m=MATERIALS.find(m=>m.id===id)||MATERIALS[0];u=fract(u);v=Math.max(0,Math.min(1,v));let tone=0;
if(id==='red'){const wave=fract(v*5+.10*Math.sin(u*Math.PI*8)+.04*Math.sin(u*Math.PI*22));tone=wave<.24?1:wave<.29?2:0}
if(id==='blue'){const row=Math.floor(v*5),x=fract(u*8+(row%2)*.5)-.5,y=fract(v*5)-.5,r=x*x+y*y;tone=r<.085?1:r<.115?2:0}
if(id==='gold'){const zig=Math.abs(fract(v*4)*2-1),x=fract(u*6+zig*.42);tone=x<.17?1:x<.23?2:0}
if(id==='leaf'){const row=Math.floor(v*5),x=fract(u*8+(row%2)*.5)-.5,y=fract(v*5)-.5;tone=Math.abs(x+y*.35)*1.4+Math.abs(y)*.65<.32?(Math.abs(x+y*.35)<.035?2:1):0}
if(id==='violet'){const x=Math.abs(fract(u*8)-.5),y=Math.abs(fract(v*5)-.5),r=x+y;tone=r<.28?1:r<.38?2:0}
if(id==='pink'){const row=Math.floor(v*4),x=(fract(u*7+row*.5)-.5),y=(fract(v*4)-.5),r=Math.hypot(x,y),theta=Math.atan2(y,x);tone=r<.23+.09*Math.cos(theta*5)?(row%2?1:2):0}
if(id==='ice'){const band=fract(v*6+.15*Math.sin(u*Math.PI*8));tone=band<.22?1:band<.32?2:0}
if(id==='dark'){const x=fract(u*10),y=fract(v*7),row=Math.floor(v*7),col=Math.floor(u*10);tone=(x<.08||(y<.09&&col%3!==0))?1:((x>.38&&x<.65&&y>.38&&y<.65&&(col+row)%3===0)?2:0)}
return m.colors[tone].match(/[a-f0-9]{2}/gi).map(n=>parseInt(n,16))}
