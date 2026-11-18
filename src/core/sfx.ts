export function beep(up:boolean){const c=new AudioContext(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);
 o.frequency.setValueAtTime(up?440:660,c.currentTime);o.frequency.exponentialRampToValueAtTime(up?880:330,c.currentTime+.25);
 g.gain.setValueAtTime(.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.3);o.start();o.stop(c.currentTime+.3);setTimeout(()=>c.close(),500)}
