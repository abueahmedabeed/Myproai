import type {State} from '../core/AssistantCore';
const hue:Record<string,string>={happy:'#f472b6',excited:'#fb923c',concerned:'#60a5fa',thinking:'#a78bfa',calm:'#34d399'};
export default function Avatar({state,mood,img}:{state:State;mood:string;img?:string}){
 const c=hue[mood]||'#a78bfa',talk=state==='speaking',sad=mood==='concerned';
 return <div className="relative w-64 h-64 mx-auto" style={{animation:'float 5s ease-in-out infinite'}}>
  {state!=='disconnected'&&[0,1].map(i=><div key={i} className="absolute inset-0 rounded-full border-2" style={{borderColor:c,animation:`ring 2.4s ${i*1.2}s infinite`}}/>)}
  <div className="absolute inset-4 rounded-full blur-2xl opacity-50 transition-colors duration-700" style={{background:c}}/>
  {img?<img src={img} className="relative w-full h-full rounded-full object-cover border-2" style={{borderColor:c,animation:talk?'speak .5s infinite':undefined}}/>:<svg viewBox="0 0 200 200" className="relative w-full h-full">
   <path d="M40 190C20 110 35 30 100 22c65 8 80 88 60 168z" fill="#0b0e1f" stroke={c} strokeWidth="1.5"/>
   <path d="M60 195c0-25 15-35 40-35s40 10 40 35z" fill="#f4a08f"/>
   <ellipse cx="100" cy="100" rx="42" ry="50" fill="#fde5d8"/>
   <path d="M58 90c5-45 80-45 84 0-20-18-64-18-84 0z" fill="#0b0e1f"/>
   <g style={{transformOrigin:'100px 100px',animation:'blink 4s infinite'}}>
    <ellipse cx="82" cy="102" rx="8" ry="10" fill="#4b5878"/><ellipse cx="118" cy="102" rx="8" ry="10" fill="#4b5878"/>
    <circle cx="84" cy="99" r="3" fill="#fff"/><circle cx="120" cy="99" r="3" fill="#fff"/></g>
   <path d={sad?'M76 88q6-5 12-2M112 86q6-3 12 2':'M76 86q6-6 12-1M112 85q6-5 12 1'} stroke="#0b0e1f" strokeWidth="2" fill="none"/>
   <ellipse cx="100" cy={talk?130:128} rx={talk?7:6} ry={talk?6:sad?1.5:2.5} fill="#d9576b"/>
   <circle cx="72" cy="120" r="7" fill={c} opacity=".25"/><circle cx="128" cy="120" r="7" fill={c} opacity=".25"/>
  </svg>}</div>}
