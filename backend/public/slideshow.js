
(() => {
'use strict';
const $ = id => document.getElementById(id);
const slides = [
 {name:'EUROPEAN FOOTBALL',person:'Kylian Mbappé',key:'europe'},
 {name:'NBA BASKETBALL',person:'LeBron James',key:'nba'},
 {name:'SOUTH AMERICAN FOOTBALL',person:'Neymar',key:'south'},
 {name:'ASIAN FOOTBALL',person:'Cristiano Ronaldo',key:'asia'},
 {name:'WORLD FOOTBALL',person:'Global football',key:'world'},
 {name:'SPORTS HISTORY',person:'Pelé',key:'history'}
];
const south=/brazil|brasileir|argentin|libertadores|sudamericana|colomb|chile|uruguay/i;
const asia=/afc|asia|japan|j.?league|k.?league|saudi|qatar|uae|australia/i;
const europe=/uefa|premier league|la liga|bundesliga|serie a|ligue 1|eredivisie|primeira liga|champions league|europa league|conference league/i;
function category(g) {
 if(g.type==='basketball')return 'nba';
 const n=String(g.league||'');
 if(south.test(n))return 'south';
 if(asia.test(n))return 'asia';
 if(europe.test(n))return 'europe';
 return 'world';
}
let games=[],index=0,paused=false,changed=Date.now();
const hero=document.querySelector('.hero-card');
if(!hero)return;
const photos=[document.querySelector('.hero-nba'),document.querySelector('.hero-football')];
const originals=photos.map(x=>x?.src);
const controls=document.createElement('div');
controls.className='slide-controls';
controls.innerHTML='<strong id="slideName">BSPORT ROTATION</strong><div><button id="slidePrev">◀</button><button id="slidePause">Ⅱ</button><button id="slideNext">▶</button></div><small id="slideCredit">Illustrative imagery</small><div class="slide-track"><div id="slideProgress"></div></div>';
hero.append(controls);
const css=document.createElement('style');
css.textContent=`
.slide-controls{position:absolute;inset:0;z-index:6;pointer-events:none}
.slide-controls>strong{position:absolute;top:8px;left:10px;background:#07162be8;color:#8bd8ff;border-radius:8px;padding:6px 10px;font-size:10px;letter-spacing:1px}
.slide-controls>div:not(.slide-track){position:absolute;top:8px;right:10px;display:flex;gap:4px;pointer-events:auto}
.slide-controls button{background:#091b36;color:white;border:1px solid #3678b3;border-radius:7px;padding:5px 9px}
.slide-controls>small{position:absolute;bottom:8px;right:9px;background:#071426dc;color:#cde5ff;font-size:9px;max-width:180px;text-align:right}
.slide-controls a{color:#9bddff}
.slide-track{position:absolute;bottom:0;width:100%;height:4px;background:#142c4c}
#slideProgress{height:100%;width:0;background:linear-gradient(90deg,#22c6ff,#ff3155)}
`;
document.head.append(css);
const cache=new Map();
async function portrait(name){
 if(cache.has(name))return cache.get(name);
 try{
  const q=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'pageimages',piprop:'name',titles:name});
  const j=await(await fetch('https://en.wikipedia.org/w/api.php?'+q)).json();
  const file=Object.values(j.query.pages)[0]?.pageimage;
  if(!file)throw Error('No photo');
  const x=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'550',titles:file});
  const k=await(await fetch('https://commons.wikimedia.org/w/api.php?'+x)).json();
  const info=Object.values(k.query.pages)[0]?.imageinfo?.[0];
  const license=info?.extmetadata?.LicenseShortName?.value||'';
  if(!/^(CC BY|CC0|Public domain|PD)/i.test(license))throw Error('License not verified');
  const photo={url:info.thumburl,source:info.descriptionurl,license};
  cache.set(name,photo);
  return photo;
 }catch(e){cache.set(name,null);return null;}
}
function value(v){return v===null||v===undefined||v===''?'–':String(v)}
function display(){
 const s=slides[index];
 changed=Date.now();
 $('slideName').textContent=`${index+1}/6 · ${s.name}`;
 const matches=games.filter(g=>category(g)===s.key);
 const g=matches.find(x=>x.live)||matches.find(x=>/FT|FINAL|FINISHED/i.test(x.status))||matches[0];
 $('heroLeague').textContent=g?.league||s.name;
 $('heroHome').textContent=g?.home||'BSPORT';
 $('heroAway').textContent=g?.away||'NETWORK';
 $('heroHs').textContent=g&&g.status!=='NS'?value(g.hs):'–';
 $('heroAs').textContent=g&&g.status!=='NS'?value(g.as):'–';
 $('heroStatus').textContent=g?(g.live?'● LIVE MATCH':g.status):'NO VERIFIED FIXTURES';
 $('heroStatus').className='match-status'+(g?.live?' live':'');
 $('heroMeta').textContent=g?'SportAPI match data · Player imagery is thematic':'No fixtures returned for this category';
 if(s.key==='history'){
  $('heroLeague').textContent='SPORTS HISTORY';
  $('heroHome').textContent='LEGENDS';
  $('heroAway').textContent='MOMENTS';
  $('heroHs').textContent='–';$('heroAs').textContent='–';
  $('heroStatus').textContent='HISTORY & TRIVIA';
  $('heroStatus').className='match-status';
  $('heroMeta').textContent=$('storyTitle')?.textContent||'Sports history';
 }
 const nba=s.key==='nba';
 photos.forEach((p,i)=>{
  if(!p)return;
  p.src=originals[i];
  p.style.display=(nba?i===0:i===1)?'':'none';
 });
 const credit=$('slideCredit');
 credit.textContent='Illustrative athlete image';
 if(s.key!=='world'){
  const current=index;
  portrait(s.person).then(p=>{
   if(current!==index||!p)return;
   const img=photos[nba?0:1];
   if(img){img.src=p.url;img.alt=s.person+' · thematic photograph';}
   credit.replaceChildren();
   const a=document.createElement('a');
   a.href=p.source;a.target='_blank';a.rel='noopener';
   a.textContent=s.person+' · '+p.license;
   credit.append(a);
  });
 }
 $('tickerText').textContent=(matches.length?matches.slice(0,5).map(m=>m.league+' · '+m.home+' '+value(m.hs)+'–'+value(m.as)+' '+m.away+' · '+m.status).join(' ✦ '):s.name+' · No fixtures available')+' ✦ BSPORT LIVE';
}
function move(n){index=(index+n+slides.length)%slides.length;display();}
$('slidePrev').onclick=()=>move(-1);
$('slideNext').onclick=()=>move(1);
$('slidePause').onclick=()=>{
 paused=!paused;
 $('slidePause').textContent=paused?'▶':'Ⅱ';
};
window.bsportRotate=(b,f)=>{games=[...b,...f];display();};
if(window.bsportFeeds)window.bsportRotate(window.bsportFeeds.nba,window.bsportFeeds.football);
else display();
setInterval(()=>{
 const elapsed=Date.now()-changed;
 $('slideProgress').style.width=Math.min(100,elapsed/140)+'%';
 if(!paused&&!document.hidden&&elapsed>=14000)move(1);
},500);
})();
