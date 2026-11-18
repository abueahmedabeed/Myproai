import {useEffect,useMemo,useState} from 'react';
import {AssistantCore,type State} from './core/AssistantCore';
import {loadSettings,saveSettings,streak,type Settings} from './core/memory';
import VoiceVisualizer from './components/VoiceVisualizer';import Avatar from './components/Avatar';
const label:Record<State,string>={disconnected:'Tap to wake me',connecting:'Booting up…',listening:'MPro is listening…',speaking:'Speaking…',interrupted:'Oh, go on!',thinking:'Thinking…'};
const BOOT=['Initializing neural core','Calibrating voice engine','Linking Gemini Live','MPro online'];
export default function App(){
 const [s,setS]=useState<Settings>(loadSettings);const [state,setState]=useState<State>('disconnected');
 const [mood,setMood]=useState('calm');const [err,setErr]=useState('');const [open,setOpen]=useState(!loadSettings().apiKey);
 const [boot,setBoot]=useState(0);const [st]=useState(streak);
 const core=useMemo(()=>new AssistantCore(()=>loadSettings(),setState,setMood,setErr),[]);
 useEffect(()=>{if(boot<BOOT.length){const t=setTimeout(()=>setBoot(boot+1),550);return()=>clearTimeout(t)}},[boot]);
 const hr=new Date().getHours(),greet=hr<12?'morning':hr<17?'afternoon':'evening';
 const toggle=()=>{setErr('');state==='disconnected'?core.start():core.stop()};
 const wake=(()=>{const R=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;return R})();
 useEffect(()=>{if(!wake||state!=='disconnected')return;const r=new wake();r.continuous=true;r.lang='en-IN';
  r.onresult=(e:any)=>{const t=Array.from(e.results).map((x:any)=>x[0].transcript).join(' ').toLowerCase();
   if(t.includes(s.wake)||t.includes('lodi bhai')){r.stop();core.start()}};
  r.onend=()=>{};try{r.start()}catch{}return()=>{try{r.abort()}catch{}}},[state,s.wake]);
 if(boot<BOOT.length)return <div className="h-full grid place-items-center bg-[#05060f] font-mono text-sky-300 text-sm"><div>{BOOT.slice(0,boot+1).map((b,i)=><div key={i} className="opacity-80">&gt; {b}</div>)}</div></div>;
 return <div className="h-full flex flex-col px-5 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] bg-[radial-gradient(ellipse_at_50%_30%,#1b1f5e_0%,#080a1e_60%,#03040a_100%)]">
  <header className="flex items-center justify-between pt-4"><div><div className="font-extrabold tracking-[.3em] text-sky-300">MPRO <span className="text-[10px] text-slate-400">PERSONAL AI</span></div>
   <h1 className="text-xl font-bold mt-1">Good {greet}, {s.name} 😍</h1><p className="text-xs text-sky-300">● {label[state]}</p></div>
   <div className="flex gap-2 items-center"><div className="glass px-3 py-1 text-sm">🔥 {st}</div><button onClick={()=>setOpen(true)} className="glass w-10 h-10">⚙️</button></div></header>
  <main className="flex-1 grid content-center gap-2"><Avatar state={state} mood={mood}/>
   <div className="glass mx-auto px-4 py-1 text-xs capitalize">✨ {mood}</div><VoiceVisualizer core={core} state={state}/></main>
  <div className="grid grid-cols-4 gap-2 mb-3 text-xs">{['🎵 Music','📖 Study','💬 Vent','📷 Photo'].map(c=><div key={c} className="glass py-2 text-center">{c}</div>)}</div>
  {err&&<p className="text-center text-rose-400 text-xs mb-2">{err}</p>}
  <div className="flex justify-center pb-4"><button onClick={toggle} className="relative w-20 h-20 rounded-full text-3xl transition-all active:scale-90"
   style={{background:state==='disconnected'?'linear-gradient(135deg,#38bdf8,#8b5cf6)':'linear-gradient(135deg,#f97316,#ef4444)',boxShadow:'0 0 40px #8b5cf6aa'}}>{state==='disconnected'?'🎙️':'■'}</button></div>
  {open&&<div className="fixed inset-0 bg-black/70 grid place-items-center p-5 z-10"><div className="glass p-5 w-full max-w-sm space-y-3 bg-[#0b0e25]">
   <h2 className="font-bold">Settings</h2>
   {(['apiKey','name','model','voice','wake'] as const).map(k=><label key={k} className="block text-xs text-slate-400">{k==='apiKey'?'Gemini API key':k}
    <input type={k==='apiKey'?'password':'text'} value={s[k]} onChange={e=>setS({...s,[k]:e.target.value})} className="w-full mt-1 p-2 rounded-lg bg-black/40 border border-slate-600 text-white"/></label>)}
   <button onClick={()=>{saveSettings(s);setOpen(false)}} className="w-full py-2 rounded-xl font-bold bg-gradient-to-r from-sky-400 to-violet-500">Save</button></div></div>}
 </div>}
