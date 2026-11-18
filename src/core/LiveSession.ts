import {GoogleGenAI,Modality,Type,type Session,type LiveServerMessage} from '@google/genai';
const o=(p:Record<string,any>)=>({type:Type.OBJECT,properties:Object.fromEntries(Object.keys(p).map(k=>[k,{type:Type.STRING}])),required:Object.keys(p)});
export const toolDecls=[{functionDeclarations:[
 {name:'openWebsite',description:'Open a website',parameters:o({url:1})},
 {name:'searchWeb',description:'Google search',parameters:o({query:1})},
 {name:'openYouTube',description:'Search or open YouTube',parameters:o({query:1})},
 {name:'launchApp',description:'Launch app: whatsapp, spotify, maps, gmail, instagram, telegram',parameters:o({app:1})},
 {name:'generateIdea',description:'Generate creative business/content idea',parameters:o({topic:1})},
 {name:'setMood',description:'Set UI mood',parameters:o({mood:1})},
 {name:'rememberFact',description:'Save a lasting fact about the user',parameters:o({fact:1})}]}];
export type Handlers={onOpen():void;onAudio(b64:string):void;onInterrupted():void;onTurnComplete():void;
 onTool(name:string,args:any):Promise<any>;onClose(reason:string):void;onError(e:string):void};
export class LiveSession{
 private s?:Session;
 async connect(c:{apiKey:string;model:string;voice:string;prompt:string},h:Handlers){
  const ai=new GoogleGenAI({apiKey:c.apiKey});
  this.s=await ai.live.connect({model:c.model,
   config:{responseModalities:[Modality.AUDIO],systemInstruction:c.prompt,tools:toolDecls,
    speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:c.voice}}}},
   callbacks:{onopen:h.onOpen,onerror:e=>h.onError(e.message||'error'),onclose:e=>h.onClose(e.reason||''),
    onmessage:async(m:LiveServerMessage)=>{
     m.serverContent?.modelTurn?.parts?.forEach(p=>p.inlineData?.data&&h.onAudio(p.inlineData.data));
     if(m.serverContent?.interrupted)h.onInterrupted();
     if(m.serverContent?.turnComplete)h.onTurnComplete();
     if(m.toolCall?.functionCalls){const rs=await Promise.all(m.toolCall.functionCalls.map(async f=>({id:f.id,name:f.name,response:await h.onTool(f.name!,f.args)})));
      this.s?.sendToolResponse({functionResponses:rs})}}}});
 }
 sendAudio(b64:string){this.s?.sendRealtimeInput({audio:{data:b64,mimeType:'audio/pcm;rate=16000'}})}
 close(){try{this.s?.close()}catch{}this.s=undefined}
}
