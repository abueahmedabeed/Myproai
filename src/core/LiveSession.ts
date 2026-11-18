import {GoogleGenAI,Modality,Type,type Session,type LiveServerMessage} from '@google/genai';
const o=(p:Record<string,any>)=>({type:Type.OBJECT,properties:Object.fromEntries(Object.keys(p).map(k=>[k,{type:Type.STRING}])),required:Object.keys(p)});
export const toolDecls=[{functionDeclarations:[
 {name:'openWebsite',description:'Open a website',parameters:o({url:1})},
 {name:'searchWeb',description:'Google search',parameters:o({query:1})},
 {name:'openYouTube',description:'Search or open YouTube',parameters:o({query:1})},
 {name:'launchApp',description:'Launch app: whatsapp, spotify, maps, gmail, instagram, telegram',parameters:o({app:1})},
 {name:'generateIdea',description:'Generate creative business/content idea',parameters:o({topic:1})},
 {name:'openApp',description:'Open any installed phone app by name',parameters:o({app:1})},
 {name:'callContact',description:'Call a contact name or phone number',parameters:o({who:1})},
 {name:'sendWhatsApp',description:'Send a WhatsApp message to a contact name or number',parameters:o({who:1,message:1})},
 {name:'sendEmail',description:'Send an email',parameters:o({to:1,subject:1,body:1})},
 {name:'takePhoto',description:'Open the camera and take a photo'},
 {name:'scrollScreen',description:'Scroll the current app: direction up or down',parameters:o({direction:1})},
 {name:'phoneNav',description:'Phone navigation: back, home, recents, closeApp, notifications',parameters:o({action:1})},
 {name:'tapOnScreen',description:'Tap a button on screen by its visible text',parameters:o({text:1})},
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
 sendText(t:string){this.s?.sendRealtimeInput({text:t})}
 close(){try{this.s?.close()}catch{}this.s=undefined}
}
