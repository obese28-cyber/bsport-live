/* Original procedural broadcast theme: no external recordings or samples. */
(() => {
'use strict';
let ctx=null, master=null, timer=null, beat=0, muted=false, level=.30;
const notes=[174.61,207.65,261.63,349.23,261.63,207.65,196,233.08];
function tone(hz,when,len,vol,type='triangle'){
 if(!ctx||!master)return;
 const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(hz,when);
 g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),when+.014);
 g.gain.exponentialRampToValueAtTime(.0001,when+len);o.connect(g);g.connect(master);o.start(when);o.stop(when+len+.02);
}
function sequence(){if(!ctx||ctx.state!=='running')return;const t=ctx.currentTime+.03;const n=notes[beat%notes.length];
 tone(n,t,.32,.09,'triangle');if(beat%4===0){tone(87.31,t,.54,.115,'sine');tone(174.61,t,.46,.04,'sine');}
 if(beat%2===0)tone(440,t,.045,.009,'square');beat++;
}
async function start(){if(timer)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio unsupported');ctx=new AC();master=ctx.createGain();master.gain.value=muted?0:level;master.connect(ctx.destination);await ctx.resume();sequence();timer=setInterval(sequence,390);return true;}
async function stop(){if(timer){clearInterval(timer);timer=null;}if(ctx){await ctx.close();ctx=null;master=null;}beat=0;return false;}
function volume(v){level=Math.max(0,Math.min(1,Number(v)||0));if(master)master.gain.value=muted?0:level;}
function mute(){muted=!muted;if(master)master.gain.value=muted?0:level;return muted;}
window.BSPORT_MUSIC={start,stop,mute,volume,get playing(){return !!timer},get muted(){return muted}};
})();
