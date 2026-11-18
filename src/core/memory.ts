const K='mpro.mem',S='mpro.set';
export type Settings={apiKey:string;name:string;model:string;voice:string;wake:string};
export const defaults:Settings={apiKey:'',name:'Sachin',model:'gemini-3.1-flash-live-preview',voice:'Aoede',wake:'hey mpro'};
export const loadSettings=():Settings=>({...defaults,...JSON.parse(localStorage.getItem(S)||'{}')});
export const saveSettings=(s:Settings)=>localStorage.setItem(S,JSON.stringify(s));
export const loadMem=():string[]=>JSON.parse(localStorage.getItem(K)||'[]');
export const addMem=(f:string)=>localStorage.setItem(K,JSON.stringify([...loadMem(),f].slice(-40)));
export const streak=()=>{const t=new Date().toDateString(),d=JSON.parse(localStorage.getItem('mpro.st')||'{"n":0,"d":""}');
 if(d.d!==t){d.n=(d.n||0)+1;d.d=t;localStorage.setItem('mpro.st',JSON.stringify(d))}return d.n as number};
