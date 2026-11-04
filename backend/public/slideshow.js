/* BSPORT LIVE — broadcast slideshow v3
 * Single owner of the featured-match hero card: category slides, licensed player
 * photography (Wikimedia Commons), auto rotation with manual controls.
 * Categories + data come from chromebook.html via window.BSPORT_SLIDESHOW.setFeeds().
 */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const ROTATE_MS = 14000;

/* ---------------- categories: exact order requested ---------------- */
const SLIDES = [
 {key:'europe', name:'EUROPEAN FOOTBALL', players:[
   {name:'Kylian Mbappé', photo:{
     url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Kylian_Mbapp%C3%A9_%28cropped%29.jpg/960px-Kylian_Mbapp%C3%A9_%28cropped%29.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Kylian_Mbapp%C3%A9_(cropped).jpg',
     artist:'Zo Yout', license:'CC BY-SA 4.0', file:'Kylian Mbappé (cropped).jpg'}},
   {name:'Erling Haaland', photo:{
     url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Erling_Haaland_2023.jpg/960px-Erling_Haaland_2023.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Erling_Haaland_2023.jpg',
     artist:'Jacek Stanislawek', license:'CC BY-SA 4.0', file:'Erling Haaland 2023.jpg'}}]},
 {key:'nba', name:'NBA BASKETBALL', players:[
   {name:'LeBron James', photo:{
     url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/LeBron_James%2C_Olympic_Games_2024.jpg/960px-LeBron_James%2C_Olympic_Games_2024.jpg',
     page:'https://commons.wikimedia.org/wiki/File:LeBron_James,_Olympic_Games_2024.jpg',
     artist:'Clément Bardot', license:'CC BY-SA 4.0', file:'LeBron James, Olympic Games 2024.jpg'}},
   {name:'Stephen Curry', photo:{
     url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Stephen_Curry_close_up.jpg/960px-Stephen_Curry_close_up.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Stephen_Curry_close_up.jpg',
     artist:'Noah Salzman', license:'CC BY-SA 3.0', file:'Stephen Curry close up.jpg'}}]},
 {key:'south', name:'SOUTH AMERICAN FOOTBALL', players:[
   {name:'Neymar', photo:{
     url:'https://upload.wikimedia.org/wikipedia/commons/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Neymar_Jr._with_Al_Hilal,_3_October_2023_-_03_(cropped).jpg',
     artist:'Miqdad Madadi', license:'CC BY 4.0', file:'Neymar Jr. with Al Hilal, 3 October 2023 - 03 (cropped).jpg'}},
   {name:'Vinícius Júnior', photo:{
     url:'https://upload.wikimedia.org/wikipedia/commons/f/f3/Vinicius_Jr_2021.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Vinicius_Jr_2021.jpg',
     artist:'Real Madrid CF', license:'CC BY 3.0', file:'Vinicius Jr 2021.jpg'}}]},
 {key:'asia', name:'ASIAN FOOTBALL', players:[
   {name:'Cristiano Ronaldo', photo:{
     url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Cristiano_Ronaldo_2275_%28cropped%29.jpg/960px-Cristiano_Ronaldo_2275_%28cropped%29.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_2275_(cropped).jpg',
     artist:'YantsImages', license:'CC BY-SA 4.0', file:'Cristiano Ronaldo 2275 (cropped).jpg'}},
   {name:'Son Heung-min', photo:{
     url:'https://upload.wikimedia.org/wikipedia/commons/d/d9/Son_Heung-min_-_2022_%2852552243725%29_%28cropped%29.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Son_Heung-min_-_2022_(52552243725)_(cropped).jpg',
     artist:'Republic of Korea', license:'CC BY-SA 2.0', file:'Son Heung-min - 2022 (52552243725) (cropped).jpg'}}]},
 {key:'world', name:'WORLD FOOTBALL', players:[
   {name:'Lionel Messi', photo:{
     url:'https://upload.wikimedia.org/wikipedia/commons/6/6c/Lionel_Messi_in_2018.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Lionel_Messi_in_2018.jpg',
     artist:'Kirill Venediktov', license:'CC BY-SA 3.0', file:'Lionel Messi in 2018.jpg'}},
   {name:'Mohamed Salah', photo:{
     url:'https://upload.wikimedia.org/wikipedia/commons/4/4a/Mohamed_Salah_2018.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Mohamed_Salah_2018.jpg',
     artist:'Anna Nessi', license:'CC BY-SA 3.0', file:'Mohamed Salah 2018.jpg'}}]},
 {key:'history', name:'SPORTS HISTORY', players:[
   {name:'Pelé', photo:{
     url:'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Pel%C3%A9_jump_1958.jpg/960px-Pel%C3%A9_jump_1958.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Pel%C3%A9_jump_1958.jpg',
     artist:'Scanpix', license:'Public domain', file:'Pelé jump 1958.jpg'}},
   {name:'Diego Maradona', photo:{
     url:'https://upload.wikimedia.org/wikipedia/commons/8/88/Maradona_1986_vs_italy.jpg',
     page:'https://commons.wikimedia.org/wiki/File:Maradona_1986_vs_italy.jpg',
     artist:'Unknown author', license:'Public domain', file:'Maradona 1986 vs italy.jpg'}}]}
];

/* ---------------- category routing for live fixtures ---------------- */
const SOUTH_GEO=/^(ar|bo|br|cl|co|ec|gf|gy|pe|py|sr|uy|ve)$/;
const ASIA_GEO=/^(ae|af|au|bh|bn|cn|ge|id|il|in|iq|ir|jo|jp|kg|kh|kp|kr|kw|kz|la|lb|lk|mm|mn|my|np|nz|om|ph|pk|qa|sa|sg|sy|th|tj|tl|tm|uz|vn)$/;
const EURO_GEO=/^(ad|al|at|ax|ba|be|bg|by|ch|cy|cz|de|dk|ee|es|eu|fi|fo|fr|gb|gb-eng|gb-nir|gb-sct|gb-wls|gg|gr|hr|hu|ie|im|is|it|je|li|lt|lu|lv|mc|md|me|mk|mt|nl|no|pl|pt|ro|rs|ru|se|si|sk|sm|ua|xk)$/;
function categoryOf(g){
 if(g.type==='basketball')return 'nba';
 const zone=String(g.zone||'').toLowerCase(), geo=String(g.geo||'').toLowerCase();
 const n=String(g.league||'').toLowerCase(), text=zone+' '+geo+' '+n;
 const noGeoSignal=!zone&&!geo;
 if(/libertadores|sudamericana|recopa/.test(n)||SOUTH_GEO.test(geo)||/brazil|brasileir|argentin|uruguay|paraguay|venezuela|peru|colombia|chile|ecuador|bolivia/.test(text))return 'south';
 if(zone==='asia'||ASIA_GEO.test(geo)||(noGeoSignal&&/afc|j\.?league|k\.?league|saudi|qatar|uae/.test(n)))return 'asia';
 if(zone==='europe'||EURO_GEO.test(geo)||/^uefa/.test(n)||(noGeoSignal&&/premier league|la liga|laliga|bundesliga|serie a|ligue 1|eredivisie|primeira liga|championship|league one|champions league|europa league|conference league|copa del rey|coupe de france/.test(n)))return 'europe';
 return 'world';
}
function pickMatch(list){
 if(!list.length)return null;
 const live=list.filter(m=>m.live);
 if(live.length)return live[0];
 const done=list.find(m=>/ft|final|finished|ended|aet|pens|full.?time/i.test(String(m.status)));
 if(done)return done;
 return list.find(m=>!/postpon|cancel|abandon|suspend/i.test(String(m.status)))||list[0];
}

/* ---------------- state ---------------- */
let games=[],index=0,paused=false,feedsLoaded=false,acc=0,lastTs=performance.now();
const imgState=new Map(); // player name -> 'pending' | 'ok' | 'failed'
const hero=document.querySelector('.hero-card');
if(!hero)return;
const photos=[document.querySelector('.hero-nba'),document.querySelector('.hero-football')];
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const value=v=>(v===null||v===undefined||v===''?'–':String(v));
const badge=s=>{const v=String(s||'Scheduled');return v.length>24?v.slice(0,24):v;};
const escXml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------------- controls (same visual language as v2) ---------------- */
const controls=document.createElement('div');
controls.className='slide-controls';
controls.setAttribute('role','group');
controls.setAttribute('aria-label','Slideshow controls');
controls.innerHTML='<strong id="slideName">BSPORT ROTATION</strong>'
 +'<div><button id="slidePrev" aria-label="Previous slide" title="Previous">◀</button>'
 +'<button id="slidePause" aria-label="Pause or resume rotation" title="Pause / resume">Ⅱ</button>'
 +'<button id="slideNext" aria-label="Next slide" title="Next">▶</button></div>'
 +'<small id="slideCredit">Player photos: Wikimedia Commons</small>'
 +'<div class="slide-track"><div id="slideProgress"></div></div>';
hero.append(controls);
const css=document.createElement('style');
css.textContent=`
.hero-nba,.hero-football{transition:opacity .55s ease}
.slide-controls{position:absolute;inset:0;z-index:6;pointer-events:none}
.slide-controls>strong{position:absolute;top:8px;left:10px;background:#07162be8;color:#8bd8ff;border-radius:8px;padding:6px 10px;font-size:10px;letter-spacing:1px}
.slide-controls>div:not(.slide-track){position:absolute;top:8px;right:10px;display:flex;gap:4px;pointer-events:auto}
.slide-controls button{background:#091b36;color:white;border:1px solid #3678b3;border-radius:7px;padding:5px 9px}
.slide-controls button:hover{background:#12305c}
.slide-controls>small{position:absolute;bottom:8px;right:9px;background:#071426dc;color:#cde5ff;font-size:9px;max-width:280px;text-align:right}
.slide-controls a{color:#9bddff;pointer-events:auto}
.slide-track{position:absolute;bottom:0;width:100%;height:4px;background:#142c4c}
#slideProgress{height:100%;width:0;background:linear-gradient(90deg,#22c6ff,#ff3155)}
body.portrait .slide-controls>small{max-width:150px;font-size:8px}
`;
document.head.append(css);

/* ---------------- imagery: preload, retry once, guaranteed fallback ---------------- */
function placeholder(p,side){
 const bg=side?'#6d1f3c':'#123c74',ring=side?'#ff5d7d':'#37b6ff';
 const initials=p.name.split(/\s+/).map(w=>w[0]).join('').slice(0,3).toUpperCase();
 const svg='<svg xmlns="http://www.w3.org/2000/svg" width="400" height="640" viewBox="0 0 400 640">'
  +`<rect width="400" height="640" fill="${bg}"/>`
  +`<circle cx="200" cy="205" r="86" fill="none" stroke="${ring}" stroke-width="6" opacity="0.85"/>`
  +'<path d="M40 640 C60 430 340 430 360 640 Z" fill="#ffffff22"/>'
  +`<text x="200" y="222" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="bold" fill="#eaf3ff" text-anchor="middle">${escXml(initials)}</text>`
  +`<text x="200" y="560" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="bold" fill="#ffffff" text-anchor="middle">${escXml(p.name)}</text>`
  +'<text x="200" y="594" font-family="Arial,Helvetica,sans-serif" font-size="15" fill="#b9d4f2" text-anchor="middle">image unavailable · retrying</text>'
  +'</svg>';
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function probe(player,attempt){
 const img=new Image();
 img.onload=()=>{imgState.set(player.name,'ok');refreshIfVisible(player.name);};
 img.onerror=()=>{
  imgState.set(player.name,'failed');
  refreshIfVisible(player.name);
  /* keep re-probing so a throttled or flaky network self-heals mid-broadcast */
  setTimeout(()=>probe(player,attempt+1),attempt===1?8000:Math.min(60000*(attempt-1),300000));
 };
 img.src=player.photo.url;
}
function preload(){
 for(const s of SLIDES)for(const p of s.players){
  if(imgState.has(p.name))continue;
  imgState.set(p.name,'pending');
  probe(p,1);
 }
}
function refreshIfVisible(name){
 photos.forEach((img,i)=>{
  if(!img||img.dataset.p!==name)return;
  showPhoto(img,SLIDES[index].players[i],i===0?0:1,true);
 });
}
function showPhoto(img,player,side,force){
 const st=imgState.get(player.name)||'pending';
 const failed=st==='failed';
 const kind=failed?'fallback':'photo';
 if(!force&&img.dataset.p===player.name&&img.dataset.k===kind)return;
 const src=failed?placeholder(player,side):player.photo.url;
 img.onload=()=>{img.style.opacity='1';};
 img.onerror=()=>{
  if(kind==='photo'){imgState.set(player.name,'failed');showPhoto(img,player,side,true);}
 };
 const swap=()=>{
  img.src=src;img.dataset.p=player.name;img.dataset.k=kind;
  img.alt=player.name+' — '+player.photo.file+' (Wikimedia Commons, '+player.photo.license+')';
  if(reducedMotion||img.complete&&img.naturalWidth>0)img.style.opacity='1';
 };
 if(reducedMotion){swap();return;}
 img.style.opacity='0';
 clearTimeout(img._fadeT);
 img._fadeT=setTimeout(swap,280);
}

/* ---------------- render one slide ---------------- */
function slideMatches(s){return games.filter(g=>categoryOf(g)===s.key);}
function display(){
 const s=SLIDES[index];
 const matches=slideMatches(s);
 $('slideName').textContent=`${index+1}/6 · ${s.name}`;
 $('slideCredit').innerHTML=s.players.map(p=>
  `<a href="${p.photo.page}" target="_blank" rel="noopener" title="${escXml(p.photo.file)}">${escXml(p.name)}</a>: ${escXml(p.photo.artist)} (${p.photo.license})`
 ).join(' · ')+' · Wikimedia Commons';
 photos.forEach((img,i)=>{if(img)showPhoto(img,s.players[i],i===0?0:1,false);});

 if(s.key==='history'){
  $('heroLeague').textContent='SPORTS HISTORY';
  $('heroHome').textContent='LEGENDS';
  $('heroAway').textContent='IMMORTALS';
  $('heroHs').textContent='–';$('heroAs').textContent='–';
  $('heroStatus').textContent='HISTORY & TRIVIA';
  $('heroStatus').className='match-status';
  $('heroMeta').textContent='Pelé & Maradona · Historical coverage · No live data on this slide';
 }else if(!feedsLoaded){
  /* leave the initial "CHECKING SPORTAPI FEED" hero text until the first feed arrives */
 }else{
  const g=pickMatch(matches);
  if(!g){
   $('heroLeague').textContent=s.name;
   $('heroHome').textContent='NO VERIFIED MATCH';
   $('heroAway').textContent='BSPORT LIVE';
   $('heroHs').textContent='–';$('heroAs').textContent='–';
   $('heroStatus').textContent='NO VERIFIED FIXTURES';
   $('heroStatus').className='match-status';
   $('heroMeta').textContent='Nothing fabricated: no fixtures returned by SportAPI for this category.';
  }else{
   $('heroLeague').textContent=g.league||s.name;
   $('heroHome').textContent=g.home;
   $('heroAway').textContent=g.away;
   $('heroHs').textContent=value(g.hs);
   $('heroAs').textContent=value(g.as);
   $('heroStatus').textContent=g.live?'● LIVE MATCH':badge(g.status).toUpperCase();
   $('heroStatus').className='match-status'+(g.live?' live':'');
   $('heroMeta').textContent=(g.live?'Live now via SportAPI':'Verified SportAPI data')
    +(g.time?' · '+g.time:'');
  }
 }
 /* category-specific ticker, animation restarted so new text always scrolls from the start */
 const tk=$('tickerText');
 tk.textContent=(matches.length?matches.slice(0,6).map(m=>
  `${m.league} · ${m.home} ${value(m.hs)}–${value(m.as)} ${m.away} · ${m.live?'● LIVE':badge(m.status)}`
 ).join(' ✦ '):`${s.name} · No verified fixtures right now`)+' ✦ BSPORT LIVE';
 const moving=tk.parentElement;
 if(moving&&moving.classList.contains('ticker-moving')){
  moving.style.animation='none';void moving.offsetWidth;moving.style.animation='';
 }
}
function move(n){index=(index+n+SLIDES.length)%SLIDES.length;acc=0;display();}
function setPaused(p){
 paused=p;
 $('slidePause').textContent=paused?'▶':'Ⅱ';
 $('slidePause').setAttribute('aria-label',paused?'Resume rotation':'Pause rotation');
 acc=0;
}
function goTo(key){
 if(key==null){setPaused(false);acc=0;return;}
 const i=SLIDES.findIndex(s=>s.key===key);
 if(i<0)return;
 index=i;setPaused(false);display();
}

/* ---------------- wiring ---------------- */
$('slidePrev').addEventListener('click',()=>move(-1));
$('slideNext').addEventListener('click',()=>move(1));
$('slidePause').addEventListener('click',()=>setPaused(!paused));
document.addEventListener('visibilitychange',()=>{if(!document.hidden){acc=0;lastTs=performance.now();}});
setInterval(()=>{
 const now=performance.now(),dt=now-lastTs;lastTs=now;
 if(!paused&&!document.hidden){
  acc+=dt;
  if(acc>=ROTATE_MS){acc-=ROTATE_MS;index=(index+1)%SLIDES.length;display();}
 }
 $('slideProgress').style.width=Math.min(100,acc/ROTATE_MS*100)+'%';
},200);

window.BSPORT_SLIDESHOW={
 setFeeds(nba,football){games=[...(nba||[]),...(football||[])];feedsLoaded=true;display();},
 goTo,
 next:()=>move(1),
 prev:()=>move(-1),
 togglePause:()=>setPaused(!paused),
 categoryOf,
 state:()=>({index,paused,category:SLIDES[index].key,total:SLIDES.length})
};
/* legacy bridge kept so an older dashboard build can still drive the slideshow */
window.bsportRotate=(b,f)=>window.BSPORT_SLIDESHOW.setFeeds(b,f);

preload();
if(window.bsportFeeds)window.BSPORT_SLIDESHOW.setFeeds(window.bsportFeeds.nba,window.bsportFeeds.football);
else display();
})();
