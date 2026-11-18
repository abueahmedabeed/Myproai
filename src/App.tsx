import {useEffect,useMemo,useState} from 'react';
import {AssistantCore,type State} from './core/AssistantCore';
import {loadSettings,saveSettings,streak,type Settings} from './core/memory';
import {phone} from './core/phone';
import VoiceVisualizer from './components/VoiceVisualizer';import Avatar from './components/Avatar';
const label:Record<State,string>={disconnected:'Tap the mic to wake me',connecting:'Booting up…',listening:'MPro is listening…',speaking:'MPro is speaking…',interrupted:'Oh, go on!',thinking:'Thinking…'};
const BOOT=['Initializing neural core','Calibrating voice engine','Linking Gemini Live','MPro online'];
const CHIPS=[{i:'🎵',t:'Music',p:'Play some music that matches my mood.'},{i:'📖',t:'Study',p:'Help me study. Ask me which subject.'},{i:'💬',t:'Vent',p:'I want to vent. Just listen first.'},{i:'📷',t:'Photo',p:''}];
const MOODS:Record<string,string>={happy:'#f472b6',excited:'#fb923c',concerned:'#60a5fa',thinking:'#a78bfa',calm:'#34d399'};
const fit=(f:File):Promise<string>=>new Promise(res=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas'),k=Math.min(1,512/Math.max(i.width,i.height));c.width=i.width*k;c.height=i.height*k;c.getContext('2d')!.drawImage(i,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',0.85))};i.src=r.result as string};r.readAsDataURL(f)});
export default function App(){
 const [s,setS]=useState<Settings>(loadSettings);const [state,setState]=useState<State>('disconnected');
 const [mood,setMood]=useState('calm');const [err,setErr]=useState('');const [open,setOpen]=useState(!loadSettings().apiKey);
 const [boot,setBoot]=useState(0);const [st]=useState(streak);const [img,setImg]=useState(localStorage.getItem('mpro.avatar')||'');
 const core=useMemo(()=>new AssistantCore(()=>loadSettings(),setState,setMood,setErr),[]);
 useEffect(()=>{if(boot<BOOT.length){const t=setTimeout(()=>setBoot(boot+1),550);return()=>clearTimeout(t)}},[boot]);
 const d=new Date(),hr=d.getHours(),greet=hr<12?'morning':hr<17?'afternoon':'evening';
 const mc=MOODS[mood]||'#a78bfa';
 const toggle=()=>{setErr('');state==='disconnected'?core.start():core.stop()};
 const say=(t:string)=>{setErr('');core.say(t).catch(e=>setErr(String(e.message||e)))};
 const R=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
 useEffect(()=>{if(!R||state!=='disconnected')return;const r=new R();r.continuous=true;r.lang='en-IN';
  r.onresult=(e:any)=>{const t=Array.from(e.results).map((x:any)=>x[0].transcript).join(' ').toLowerCase();
   if(t.includes(s.wake)||t.includes('lodi bhai')){r.stop();core.start()}};
  try{r.start()}catch{}return()=>{try{r.abort()}catch{}}},[state,s.wake]);
 if(boot<BOOT.length)return <div className="h-full grid place-items-center bg-[#05060f] font-mono text-sky-300 text-sm"><div>{BOOT.slice(0,boot+1).map((b,i)=><div key={i} className="opacity-80">&gt; {b}</div>)}</div></div>;
 const on=state!=='disconnected';
 return <div className="h-full flex flex-col px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-[radial-gradient(ellipse_at_50%_25%,#1c2268_0%,#0a0c26_55%,#03040a_100%)]">
  <header className="flex items-center justify-between pt-3">
   <button onClick={()=>setOpen(true)} className="text-2xl w-10">☰</button>
   <div className="text-center leading-none"><div className="font-black tracking-[.3em] text-xl bg-gradient-to-r from-sky-300 to-violet-400 bg-clip-text text-transparent">MPRO</div><div className="text-[9px] tracking-[.35em] text-slate-400 mt-1">PERSONAL AI</div></div>
   <div className="w-10 h-10 rounded-full overflow-hidden border border-violet-400/60 bg-[#10153a] grid place-items-center">{img?<img src={img} className="w-full h-full object-cover"/>:'🙂'}</div>
  </header>
  <div className="flex items-start justify-between mt-3">
   <div><h1 className="text-xl font-extrabold">Good {greet}, {s.name} 😍 ✨</h1><p className="text-xs text-sky-300 mt-1">● {label[state]}</p></div>
   <div className="glass px-3 py-1.5 text-sm font-bold text-orange-300">🔥 {st}</div></div>
  <main className="flex-1 min-h-0 flex flex-col items-center justify-center gap-1">
   <div className="relative w-full"><Avatar state={state} mood={mood} img={img}/>
    <div className="absolute right-[10%] bottom-4 chip px-3 py-1 text-xs capitalize" style={{color:mc,borderColor:mc}}>✨ {mood}</div></div>
   <div className="chip px-3 py-1 text-xs"><b className="text-sky-300">MPRO</b> &nbsp;{on?(state==='speaking'?'bol raha hu…':'sun raha hu…'):'hai?'}</div>
   <div className="w-full opacity-80"><VoiceVisualizer core={core} state={state}/></div>
  </main>
  <div className="grid grid-cols-4 gap-2 mb-2 text-xs">{CHIPS.map(c=><button key={c.t} onClick={()=>c.p?say(c.p):phone({action:'photo'})} className="chip py-2 active:scale-95 transition">{c.i} {c.t}</button>)}</div>
  <div className="grid grid-cols-3 gap-2 mb-2">
   <button onClick={()=>say('What is the weather today?')} className="glass p-3 text-left"><div className="text-[10px] tracking-widest text-slate-400">WEATHER</div><div className="text-lg">⛅</div><div className="text-[11px] text-sky-300">On Request</div></button>
   <div className="glass p-3"><div className="text-[10px] tracking-widest text-slate-400">TODAY</div><div className="text-2xl font-bold leading-none">{d.getDate()}</div><div className="text-[11px] text-sky-300">{d.toLocaleString('en',{month:'short'})} {d.toLocaleString('en',{weekday:'short'})}</div></div>
   <div className="glass p-3"><div className="text-[10px] tracking-widest text-slate-400">MOOD</div><div className="text-xl" style={{color:mc}}>♥</div><div className="text-[11px] capitalize" style={{color:mc}}>{mood}</div></div></div>
  <div className="glass px-4 py-2 mb-2 flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-xl">🔊</span><div><div className="text-sm font-semibold">Voice-only mode {on?'active':'ready'}</div><div className="text-[11px] text-slate-400">Natural Hindi + English</div></div></div>
   <button onClick={toggle} className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/50">🎙️</button></div>
  {err&&<p className="text-center text-rose-400 text-xs mb-1">{err}</p>}
  <nav className="flex items-center justify-around pb-2 text-2xl">
   <button onClick={()=>window.scrollTo(0,0)}>🏠</button><button onClick={()=>phone({action:'photo'})}>📷</button>
   <button onClick={toggle} className="w-16 h-16 -mt-4 rounded-full text-2xl transition active:scale-90 relative" style={{background:on?'radial-gradient(circle,#ff7a1a,#e02a1a)':'linear-gradient(135deg,#38bdf8,#8b5cf6)',boxShadow:on?'0 0 36px #ff5a1fcc':'0 0 36px #8b5cf6aa'}}>{on?'■':'🎙️'}</button>
   <button onClick={()=>phone({action:'accessibility'})}>🖐️</button><button onClick={()=>setOpen(true)}>⚙️</button></nav>
  {open&&<div className="fixed inset-0 bg-black/70 grid place-items-center p-5 z-10"><div className="glass p-5 w-full max-w-sm space-y-3 bg-[#0b0e25] max-h-full overflow-y-auto">
   <h2 className="font-bold">Settings</h2>
   {(['apiKey','name','model','voice','wake'] as const).map(k=><label key={k} className="block text-xs text-slate-400">{k==='apiKey'?'Gemini API key':k}
    <input type={k==='apiKey'?'password':'text'} value={s[k]} onChange={e=>setS({...s,[k]:e.target.value})} className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-slate-600 text-white"/></label>)}
   <label className="block text-xs text-slate-400">Avatar image (your own anime/photo)
    <input type="file" accept="image/*" onChange={async e=>{const f=e.target.files?.[0];if(f){const u=await fit(f);localStorage.setItem('mpro.avatar',u);setImg(u)}}} className="w-full mt-1 text-slate-300"/></label>
   <button onClick={()=>phone({action:'accessibility'})} className="w-full py-2 rounded-xl glass">Enable phone control</button>
   <button onClick={()=>{saveSettings(s);setOpen(false)}} className="w-full py-2 rounded-xl font-bold bg-gradient-to-r from-sky-400 to-violet-500">Save</button></div></div>}
 </div>}
