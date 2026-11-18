const WORKLET=`class P extends AudioWorkletProcessor{process(i){const c=i[0][0];if(c)this.port.postMessage(c.slice(0));return true}}registerProcessor('pcm',P)`;
const b64=(u:Uint8Array)=>{let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode(...u.subarray(i,i+0x8000));return btoa(s)};
export class AudioStreamer{
 private mic?:AudioContext;private out?:AudioContext;private stream?:MediaStream;private next=0;private srcs=new Set<AudioBufferSourceNode>();
 analyser?:AnalyserNode;micLevel=0;
 async start(onChunk:(b64:string)=>void){
  this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  this.mic=new AudioContext({sampleRate:16000});
  await this.mic.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET],{type:'application/javascript'})));
  const src=this.mic.createMediaStreamSource(this.stream),node=new AudioWorkletNode(this.mic,'pcm');
  node.port.onmessage=e=>{const f:Float32Array=e.data,p=new Int16Array(f.length);let s=0;
   for(let i=0;i<f.length;i++){const v=Math.max(-1,Math.min(1,f[i]));p[i]=v*32767;s+=v*v}
   this.micLevel=Math.sqrt(s/f.length);onChunk(b64(new Uint8Array(p.buffer)))};
  src.connect(node);
  this.out=new AudioContext({sampleRate:24000});this.analyser=this.out.createAnalyser();this.analyser.fftSize=128;this.analyser.connect(this.out.destination);
 }
 play(data:string,onEnd:()=>void){
  const o=this.out!;if(o.state==='suspended')o.resume();
  const r=atob(data),u=new Int16Array(r.length/2);for(let i=0;i<u.length;i++)u[i]=r.charCodeAt(2*i)|(r.charCodeAt(2*i+1)<<8);
  const buf=o.createBuffer(1,u.length,24000),ch=buf.getChannelData(0);for(let i=0;i<u.length;i++)ch[i]=u[i]/32768;
  const s=o.createBufferSource();s.buffer=buf;s.connect(this.analyser!);this.next=Math.max(this.next,o.currentTime);s.start(this.next);this.next+=buf.duration;
  this.srcs.add(s);s.onended=()=>{this.srcs.delete(s);if(!this.srcs.size)onEnd()};
 }
 interrupt(){this.srcs.forEach(s=>{try{s.stop()}catch{}});this.srcs.clear();this.next=0}
 outLevel(){if(!this.analyser)return 0;const d=new Uint8Array(this.analyser.frequencyBinCount);this.analyser.getByteFrequencyData(d);return d.reduce((a,b)=>a+b,0)/d.length/160}
 stop(){this.interrupt();this.stream?.getTracks().forEach(t=>t.stop());this.mic?.close();this.out?.close();this.mic=this.out=undefined}
}
