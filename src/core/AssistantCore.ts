import {AudioStreamer} from './AudioStreamer';import {LiveSession} from './LiveSession';
import {buildPrompt} from './persona';import {addMem,loadMem,type Settings} from './memory';import {beep} from './sfx';import {phone,native} from './phone';
export type State='disconnected'|'connecting'|'listening'|'speaking'|'interrupted'|'thinking';
const APPS:Record<string,string>={whatsapp:'whatsapp://send',spotify:'spotify:',maps:'geo:0,0?q=',gmail:'mailto:',instagram:'instagram://app',telegram:'tg://'};
const open=(u:string)=>{window.open(u,'_blank')||(location.href=u)};
export class AssistantCore{
 audio=new AudioStreamer();private live=new LiveSession();private tries=0;private on=false;
 constructor(private set:()=>Settings,public onState:(s:State)=>void,public onMood:(m:string)=>void,public onErr:(e:string)=>void){}
 async start(){const s=this.set();if(!s.apiKey)return this.onErr('Add your Gemini API key in Settings');
  this.on=true;this.onState('connecting');
  try{await this.audio.start(b=>this.live.sendAudio(b));await this.connect()}catch(e:any){this.onErr(e.message);this.stop()}}
 private async connect(){const s=this.set();
  await this.live.connect({apiKey:s.apiKey,model:s.model,voice:s.voice,prompt:buildPrompt(s.name,loadMem())},{
   onOpen:()=>{this.tries=0;beep(true);this.onState('listening')},
   onAudio:b=>{this.onState('speaking');this.audio.play(b,()=>this.on&&this.onState('listening'))},
   onInterrupted:()=>{this.audio.interrupt();this.onState('interrupted');setTimeout(()=>this.on&&this.onState('listening'),400)},
   onTurnComplete:()=>{},
   onTool:(n,a)=>this.tool(n,a),
   onClose:()=>{if(this.on&&this.tries++<3){this.onState('connecting');setTimeout(()=>this.connect().catch(e=>this.onErr(e.message)),800)}else this.stop()},
   onError:e=>this.onErr(e)})}
 private async tool(n:string,a:any){this.onState('thinking');
  switch(n){
   case'openWebsite':open(/^https?:/.test(a.url)?a.url:'https://'+a.url);break;
   case'searchWeb':open('https://www.google.com/search?q='+encodeURIComponent(a.query));break;
   case'openYouTube':if(native())return phone({action:'youtube',target:a.query});open('https://www.youtube.com/results?search_query='+encodeURIComponent(a.query));break;
   case'openApp':return phone({action:'openApp',target:a.app});
   case'callContact':return phone({action:'call',target:a.who});
   case'sendWhatsApp':return phone({action:'whatsapp',target:a.who,text:a.message});
   case'sendEmail':return phone({action:'email',target:a.to,subject:a.subject,text:a.body});
   case'takePhoto':return phone({action:'photo'});
   case'scrollScreen':return phone({action:a.direction==='up'?'scrollUp':'scrollDown'});
   case'phoneNav':return phone({action:a.action});
   case'tapOnScreen':return phone({action:'tap',target:a.text});
   case'launchApp':if(native())return phone({action:'openApp',target:a.app});open(APPS[String(a.app).toLowerCase()]||'https://www.google.com/search?q='+a.app);break;
   case'setMood':this.onMood(a.mood);break;
   case'rememberFact':addMem(a.fact);break;
   case'generateIdea':return{ok:true,instruction:`Pitch 3 unique, cinematic, high-impact ideas about ${a.topic} aloud, then recommend one.`};}
  return{ok:true}}
 async say(t:string){if(!this.on){await this.start();await new Promise(r=>setTimeout(r,1800))}this.live.sendText(t)}
 stop(){this.on=false;this.live.close();this.audio.stop();this.onState('disconnected');beep(false)}
}
