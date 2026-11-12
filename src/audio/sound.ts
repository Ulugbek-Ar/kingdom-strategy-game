export type SoundName='hit'|'arrow'|'place'|'victory'|'tower';
export class Sound {
  enabled=false;private ctx?:AudioContext;private last=new Map<SoundName,number>();
  unlock():void {try{this.ctx??=new AudioContext();void this.ctx.resume();}catch{/* Optional audio may be blocked. */}}
  play(kind:SoundName):void {
    if(!this.enabled)return;this.unlock();const c=this.ctx;if(!c)return;
    const now=c.currentTime;if(now-(this.last.get(kind)??-100)<0.075)return;this.last.set(kind,now);
    const tones=kind==='victory'?[330,440,660]:kind==='place'?[220,330]:[kind==='hit'?100:kind==='tower'?65:700];
    tones.forEach((hz,i)=>{const o=c.createOscillator(),g=c.createGain(),start=now+i*0.085;o.type=kind==='arrow'?'triangle':'square';o.frequency.setValueAtTime(hz,start);o.frequency.exponentialRampToValueAtTime(kind==='arrow'?180:hz*0.65,start+0.11);g.gain.setValueAtTime(kind==='tower'?0.035:0.017,start);g.gain.exponentialRampToValueAtTime(0.0001,start+0.13);o.connect(g);g.connect(c.destination);o.start(start);o.stop(start+0.14);});
  }
}
