import {useEffect,useRef} from 'react';import type {AssistantCore,State} from '../core/AssistantCore';
export default function VoiceVisualizer({core,state}:{core:AssistantCore;state:State}){
 const r=useRef<HTMLCanvasElement>(null);const st=useRef(state);st.current=state;
 useEffect(()=>{const c=r.current!,x=c.getContext('2d')!;let id=0,t=0;
  const loop=()=>{t+=.05;const w=c.width,h=c.height;x.clearRect(0,0,w,h);
   const lvl=st.current==='speaking'?core.audio.outLevel():st.current==='listening'?core.audio.micLevel*6:.03;
   const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#38bdf8');g.addColorStop(.5,'#a78bfa');g.addColorStop(1,'#f472b6');
   for(let k=0;k<3;k++){x.beginPath();x.strokeStyle=g;x.globalAlpha=1-k*.3;x.lineWidth=2;
    for(let i=0;i<=w;i+=4){const e=Math.sin(i/w*Math.PI);x.lineTo(i,h/2+Math.sin(i*.03+t*(1+k*.5))*e*(6+Math.min(lvl,1)*40)/(k+1))}x.stroke()}
   id=requestAnimationFrame(loop)};loop();return()=>cancelAnimationFrame(id)},[core]);
 return <canvas ref={r} width={600} height={90} className="w-full h-16"/>}
