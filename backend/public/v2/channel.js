/* BSPORT LIVE 2.0: non-destructive presentation layer for existing /api/football & /api/basketball endpoints. */
(() => {
'use strict';
const $=id=>document.getElementById(id), photos=window.BSPORT_V2_PHOTOS||[];
const namePhoto=name=>photos.find(p=>p.name.toLowerCase()===name.toLowerCase());
const fmtDate = (d,opts={})=>new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',...opts}).format(d);
const ymd=(d)=>{const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const z=k=>parts.find(p=>p.type===k).value;return `${z('year')}-${z('month')}-${z('day')}`;};
const escapeHTML=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ISOok=t=>t&&Number.isFinite(Date.parse(t));
const scheduled=s=>/^(ns|scheduled|not started|not_started|upcoming|pre-game|pregame|tbd)$/i.test(String(s||'').trim());
const done=s=>/^(ft|final|finished|ended|completed|full.?time|aet|after penalties)$/i.test(String(s||'').trim());
function normalize(item,type){
 const foot=type==='football';const home=foot?item.home_team:item.home?.name,away=foot?item.away_team:item.away?.name;
 const time=foot?(item.datetime||item.kickoff_utc):(item.start||item.datetime);
 const status=String(item.status||'Scheduled');const live=foot?status.toUpperCase()==='LIVE'&&ISOok(time)&&Date.parse(time)<=Date.now():Boolean(item.live);
 const scoreA=foot?item.home_score:item.home?.score,scoreB=foot?item.away_score:item.away?.score;
 return {id:String(item.id||item.fixture_id||`${type}:${home}:${away}:${time}`),type,home:String(home||'').trim(),away:String(away||'').trim(),time:ISOok(time)?new Date(time):null,league:foot?(item.league_name||'Football'):(item.league?.name||'NBA'),status,live,scoreA,scoreB};
}
function getClassification(m){const z=String(m.league||'').toLowerCase();if(m.type==='basketball')return 'nba';if(/uefa|premier league|la liga|bundesliga|serie a|ligue 1|eredivisie|europa|champions|copa del rey/.test(z))return 'europe';if(/afc|saudi|j.league|k.league|qatar|asia/.test(z))return 'asia';if(/brazil|brasileir|argentin|libertadores|sudamericana|chile|colombia/.test(z))return 'south';return 'world';}
function chooseFixture(slot,fixtureList,kind){const filtered=fixtureList.filter(m=>m.type===kind);return filtered.length?filtered[slot%filtered.length]:null;}
let verifiedBuzz=[];
const headlines=[
 {label:'GREAT FOOTBALL DEBATE',title:'WHO IS THE GREATEST?',body:'Messi, Ronaldo, Pelé or Maradona? Every generation has its legend.',prompt:'NAME YOUR GOAT IN CHAT',image:8},
 {label:'TACTICS TALK',title:'WHAT MAKES A GREAT STRIKER?',body:'Movement, first touch, finishing, or the ability to create for teammates?',prompt:'WHAT MATTERS MOST? COMMENT BELOW',image:1},
 {label:'NBA FAN DEBATE',title:'WHO OWNS THE CLUTCH?',body:'Would you trust Curry or LeBron with the last shot? Your call.',prompt:'DROP YOUR PICK IN CHAT',image:2},
 {label:'THE BEAUTIFUL GAME',title:'YOUR DREAM FINAL?',body:'Choose any two clubs or national teams for your ultimate showdown.',prompt:'WHICH TEAMS WOULD YOU PICK?',image:9},
 {label:'BASKETBALL BUZZ',title:'BUILD YOUR ALL-TIME FIVE',body:'One point guard, two wings and two bigs. Who makes your lineup?',prompt:'POST YOUR STARTING FIVE',image:3}
];
const spotlight=[
 ['Erling Haaland','POWER & PRECISION',1,'A striker known for explosive movement and clinical finishing.'],['LeBron James','THE BASKETBALL ICON',2,'The all-around game: scoring, passing, leadership and longevity.'],['Kylian Mbappé','THE NEED FOR SPEED',0,'Pace, movement and the art of the finish.'],
 ['Stephen Curry','BEYOND THE ARC',3,'How three-point shooting changed the geometry of basketball.'],['Lionel Messi','THE ART OF FOOTBALL',8,'Playmaking, control and moments of football imagination.'],['Neymar','BRAZILIAN FLAIR',4,'Skill, creativity and expressive attacking football.'],
 ['Cristiano Ronaldo','THE GOAL MACHINE',6,'An enduring symbol of dedication and finishing.'],['Son Heung-min','ASIAN FOOTBALL STAR',7,'Speed, technique and goals on the world stage.'],['Vinícius Júnior','THE WINGER',5,'Explosive dribbling and one-on-one attacking football.'],
 ['Mohamed Salah','THE EGYPTIAN KING',9,'A modern icon of Egyptian and world football.'],['Pelé','THE FOOTBALL LEGEND',10,'Three World Cups and an unforgettable sporting legacy.'],['Diego Maradona','A FOOTBALL ORIGINAL',11,'One of football’s most influential creative talents.']
];
// 30 presentation slots, interleaved: 11 spotlights, 7 upcoming, 5 editorial, 4 prediction, 3 verified result.
const types=['spot','upcoming','buzz','prediction','spot','upcoming','spot','buzz','result','spot',
 'upcoming','spot','buzz','prediction','spot','upcoming','buzz','spot','upcoming','prediction',
 'spot','buzz','result','upcoming','spot','prediction','upcoming','spot','result','spot'];
const deck=types.map((type,i)=>({type,slot:i+1}));
const standbyQuestions=[
 ['FOOTBALL FAN CHALLENGE','YOUR DREAM DERBY?','Which two clubs should meet in the ultimate rivalry match?'],
 ['BASKETBALL FAN CHALLENGE','YOUR DREAM NBA FINAL?','Name the two teams you would love to see in the Finals.'],
 ['MATCHDAY QUESTION','WHO IS YOUR CAPTAIN?','Pick the player you trust to lead your side.'],
 ['SPORTS ATMOSPHERE','WHICH STADIUM IS BEST?','Tell us where you would watch your dream match.'],
 ['FOOTBALL TACTICS','ATTACK OR DEFENSE?','How should your team approach a must-win game?'],
 ['NBA TALK','WHO IS YOUR MVP?','Tell us your pick, and explain why.'],
 ['FAN DEBATE','YOUR DREAM FIVE-A-SIDE?','Build a football squad of five legends.']
];
let matches=[],index=0,paused=false,duration=12000,changed=performance.now(),layer=0,loading=false,lastRefresh=0,lastError='',timer=null;
let currentSlide=null;
function formatTime(d){return d?fmtDate(d,{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}):'Time not supplied';}
function attr(photo){if(!photo)return 'BSPORT original graphics';return `<a class="credit-link" href="${escapeHTML(photo.page)}" target="_blank" rel="noopener noreferrer">Photo source (when loaded): ${escapeHTML(photo.artist)} · ${escapeHTML(photo.license)}; otherwise BSPORT illustration</a>`;}
function placeholderData(label){
 const safe=String(label||'SPORTS').replace(/[&<>"']/g,'').slice(0,26);
 const basketball=/lebron|curry|basketball|nba/i.test(safe);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1400" viewBox="0 0 1200 1400"><defs><radialGradient id="sky"><stop stop-color="#245989"/><stop offset="1" stop-color="#040c21"/></radialGradient><linearGradient id="shirt"><stop stop-color="${basketball?'#ea385b':'#2c90ed'}"/><stop offset="1" stop-color="#092d63"/></linearGradient></defs><rect width="1200" height="1400" fill="url(#sky)"/><g opacity=".27" fill="none" stroke="#8ccafa" stroke-width="8"><circle cx="680" cy="620" r="410"/><circle cx="680" cy="620" r="310"/><path d="M0 1100h1200M0 1160h1200M0 1220h1200"/></g><path d="M180 1400Q165 950 440 895L515 865L660 1030L800 865L875 895Q1140 950 1130 1400Z" fill="url(#shirt)" stroke="#a5ddff" stroke-width="8"/><path d="M527 868V770H795V868Q660 970 527 868" fill="#b8d4e6"/><ellipse cx="665" cy="505" rx="235" ry="315" fill="#b8d4e6"/><path d="M445 480Q400 135 670 160Q930 155 900 505Q780 385 685 330Q550 450 445 480" fill="#0b1531"/><path d="M522 590q70 25 110 0M718 590q55 25 95 0" stroke="#273d5c" stroke-width="12" fill="none"/><path d="M590 707Q660 760 735 707" stroke="#6789a3" stroke-width="11" fill="none"/><circle cx="1030" cy="1010" r="115" fill="${basketball?'#db823b':'#f3faff'}" stroke="#102b49" stroke-width="10"/>${basketball?'<path d="M915 1010H1145M1030 895V1125M945 925Q1085 1010 945 1095M1115 925Q975 1010 1115 1095" stroke="#41220e" stroke-width="10" fill="none"/>':'<path d="M1030 960l55 42-18 63h-70l-25-63Z" fill="#182f4d"/><path d="M1030 895v65M915 1010h57M1145 1010h-60" stroke="#182f4d" stroke-width="12"/>'}<rect x="110" y="1170" width="970" height="125" rx="15" fill="#08152de8"/><text x="595" y="1250" fill="#fff" font-family="Arial,sans-serif" font-size="65" font-weight="900" text-anchor="middle">${safe}</text></svg>`;
 return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
function arenaGraphic(kind,seed=0){
 const basket=kind==='basketball';const accents=['#1e86c9','#a13d60','#3b66ac','#287981','#c89133'];const accent=accents[seed%accents.length];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><defs><radialGradient id="sky"><stop stop-color="#21456e"/><stop offset="1" stop-color="#040c1c"/></radialGradient><linearGradient id="field" x2="0" y2="1"><stop stop-color="${basket?'#d6a465':'#23734c'}"/><stop offset="1" stop-color="${basket?'#75482b':'#0a3a2a'}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#sky)"/><path d="M0 420Q800 190 1600 420V720H0Z" fill="${accent}" opacity=".45"/><path d="M0 500Q800 320 1600 500V690H0Z" fill="#050e20"/><g fill="#bce7ff" opacity=".46">${Array.from({length:80},(_,i)=>`<circle cx="${i*21}" cy="${465+22*Math.sin(i/4)}" r="3"/>`).join('')}</g><g fill="#fff" opacity=".84"><ellipse cx="280" cy="180" rx="130" ry="14"/><ellipse cx="1320" cy="180" rx="130" ry="14"/></g><path d="M80 690L370 530H1230L1520 690L1600 900H0Z" fill="url(#field)" stroke="#c9f0eb" stroke-width="8"/><g stroke="#ffffff" stroke-width="6" fill="none" opacity=".7"><path d="M360 535L80 890M1240 535L1520 890"/><path d="M800 533V900"/>${basket?'<ellipse cx="800" cy="780" rx="170" ry="92"/>':'<ellipse cx="800" cy="730" rx="130" ry="65"/>'}</g><g fill="#eef9ff" opacity=".13"><circle cx="800" cy="400" r="210"/><circle cx="800" cy="400" r="310"/></g></svg>`;
 return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
function setBackground(url,fallback){
 const target=$('slide'+(layer?'A':'B'));const other=$('slide'+(layer?'B':'A'));layer=1-layer;
 target.style.backgroundImage=`url("${fallback}")`;target.classList.add('active');other.classList.remove('active');
 if(url&&url!==fallback){const img=new Image();img.onload=()=>{if(target.classList.contains('active'))target.style.backgroundImage=`url("${url}")`;};img.src=url;}
}
function fixturePool(kind='football'){const unique=new Map();matches.filter(m=>m.type===kind&&!m.live&&m.time&&m.time.getTime()>Date.now()&&scheduled(m.status)&&m.home&&m.away).forEach(m=>unique.set(m.id,m));return [...unique.values()].sort((a,b)=>a.time-b.time);}
function resultsPool(){return matches.filter(m=>(m.live||done(m.status))&&m.home&&m.away).sort((a,b)=>Number(b.live)-Number(a.live));}
function section(type,category,headline,body,cta='',extra=''){return `<div class="card ${type}"><div class="eyebrow">${escapeHTML(category)}</div><div class="headline">${escapeHTML(headline)}</div>${body?`<div class="subline">${escapeHTML(body)}</div>`:''}${extra}${cta?`<div class="cta">${escapeHTML(cta)}</div>`:''}</div>`;}
function matchupHTML(m,heading,cta=''){const isBasket=m.type==='basketball';const safeTitle=escapeHTML(heading);const score=(m.live||done(m.status))&&m.scoreA!=null&&m.scoreB!=null?`${m.scoreA} : ${m.scoreB}`:'';
return `<div class="card fixture"><div class="eyebrow">${safeTitle}</div><div class="label-pill">${escapeHTML(m.league)}</div><div class="teams">${escapeHTML(m.home)} <span class="versus">VS</span> ${escapeHTML(m.away)}</div><div class="fmeta"><span class="meta-strong">${escapeHTML(m.live?'● LIVE':done(m.status)?'FINAL':formatTime(m.time))}</span>${score?` · ${escapeHTML(score)}`:''}</div>${cta?`<div class="cta">${escapeHTML(cta)}</div>`:''}</div>`;
}
function display(){const slide=deck[index];currentSlide=slide;changed=performance.now();$('slideCount').textContent=`${index+1} / 30`;
const sportOdd=index%2?'basketball':'football';let visual=null,art=null,markup='',tag='',ticker='';
if(slide.type==='spot'){
 const spot=spotlight[deck.slice(0,index+1).filter(x=>x.type==='spot').length-1];const [name,line,photoIndex,description]=spot;visual=photos[photoIndex];tag='STAR SPOTLIGHT';
 markup=section('spotlight',line,name,description,index%3===0?'WHO IS YOUR FAVORITE PLAYER?':'');ticker='STAR SPOTLIGHT · '+name+' · Follow BSPORT LIVE for more';
}else if(slide.type==='buzz'){
 const nth=deck.slice(0,index+1).filter(x=>x.type==='buzz').length-1;
 const entry=verifiedBuzz[nth%Math.max(verifiedBuzz.length,1)];
 const b=entry?{label:'BSPORT BUZZ · '+entry.status,title:entry.headline,body:entry.summary,prompt:entry.prompt||'WHAT DO YOU THINK? COMMENT BELOW',image:nth%photos.length}:headlines[nth%headlines.length];
 art=arenaGraphic(nth%2?'basketball':'football',index);tag=entry?'BSPORT BUZZ · '+entry.status:'BSPORT BUZZ · FAN DISCUSSION';markup=section('buzz',b.label,b.title,b.body,b.prompt,entry?`<div class="fmeta">Source: <a class="credit-link" href="${escapeHTML(entry.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(entry.source)}</a> · ${escapeHTML(entry.date)}</div>`:'');ticker=entry?`BSPORT BUZZ · ${entry.status} · ${entry.source}`:'BSPORT BUZZ · Fan discussion, not a current news report';
}else if(slide.type==='upcoming'||slide.type==='prediction'){
 const nth=deck.slice(0,index+1).filter(x=>x.type===slide.type).length-1;const kind=(nth%3===1)?'basketball':'football';const list=fixturePool(kind);let game=chooseFixture(nth,list,kind);if(!game){const other=kind==='basketball'?'football':'basketball';game=chooseFixture(nth,fixturePool(other),other);}
 art=arenaGraphic(game?.type||kind,index);tag=slide.type==='prediction'?'PREDICT THE SCORE':'UPCOMING MATCH';
 markup=game?matchupHTML(game,slide.type==='prediction'?'PREDICT THE SCORE':'COMING UP',slide.type==='prediction'?(game.type==='basketball'?'COMMENT YOUR WINNER & FINAL SCORE':'DROP YOUR EXACT SCORE IN CHAT'):''):
 section('fixture',tag,standbyQuestions[nth%standbyQuestions.length][1],standbyQuestions[nth%standbyQuestions.length][2], 'COMMENT YOUR ANSWER');
 ticker=game?`${game.league} · ${game.home} vs ${game.away} · ${formatTime(game.time)}`:'No verified upcoming fixtures in the current feed';
}else{
 const list=resultsPool(),nth=deck.slice(0,index+1).filter(x=>x.type==='result').length-1,game=list.length?list[nth%list.length]:null;art=arenaGraphic(game?.type||'football',index);
 tag='LIVE & RECENT RESULTS';markup=game?matchupHTML(game,'VERIFIED SPORTS UPDATE'):
 section('fixture','LIVE & RECENT RESULTS',['YOUR BEST COMEBACK?','GAME OF THE DECADE?','UNFORGETTABLE BUZZER-BEATER?'][nth%3],'No verified recent result was returned. Share a memorable sporting moment instead.','TELL US IN THE COMMENTS');ticker='Only verified provider scores are displayed';
}
 const fallback=placeholderData(visual?.name||tag);setBackground(art||visual?.url,fallback);$('story').innerHTML=markup;$('categoryTag').textContent=tag;$('tickerCopy').textContent=ticker;$('attribution').innerHTML=art?'Arena illustration: BSPORT original artwork':attr(visual);
}
async function loadEditorial(){try{const r=await fetch('/v2/editorial.json',{cache:'no-store'});if(!r.ok)return;const j=await r.json();
 verifiedBuzz=(Array.isArray(j.stories)?j.stories:[]).filter(x=>{
 const valid=typeof x.headline==='string'&&typeof x.summary==='string'&&typeof x.source==='string'&&typeof x.url==='string'&&/^https:\/\//.test(x.url)&&['CONFIRMED','REPORTED','RUMOR','OPINION'].includes(x.status);
 const ts=Date.parse(x.date);return valid&&Number.isFinite(ts)&&ts<=Date.now()+86400000&&Date.now()-ts<14*86400000;
 });}catch(_){verifiedBuzz=[];}}
async function load(){if(loading)return;loading=true;$('feedStatus').textContent='Refreshing verified SportAPI fixtures…';const days=3;const jobs=[];
 for(let offset=0;offset<days;offset++){const d=new Date();d.setDate(d.getDate()+offset);const day=ymd(d);for(const kind of ['football','basketball'])jobs.push({kind,day});}
 const out=await Promise.allSettled(jobs.map(async ({kind,day})=>{const r=await fetch(`/api/${kind}?date=${encodeURIComponent(day)}`,{cache:'no-store'});const x=await r.json();if(!r.ok)throw Error(x.error||'API unavailable');return {kind,day,items:Array.isArray(x.data)?x.data:[]};}));
 let success=0;const collection=[];out.forEach((r)=>{if(r.status==='fulfilled'){success++;for(const x of r.value.items){try{collection.push(normalize(x,r.value.kind));}catch(_){}}}});
 if(success){matches=collection;lastRefresh=Date.now();lastError='';$('feedStatus').textContent=`SportAPI responded: ${success}/${jobs.length} date feeds · ${matches.length} records · refreshed ${new Date().toLocaleTimeString()}`;}
 else {lastError='Feeds unavailable';$('feedStatus').textContent='SportAPI unavailable — showing non-fabricated placeholders';}
 await loadEditorial();loading=false;display();
}
function move(step){index=(index+step+deck.length)%deck.length;display();}
function updateTicker(){const elapsed=performance.now()-changed;$('progressBar').style.width=`${Math.min(100,100*elapsed/duration)}%`;if(!paused&&elapsed>=duration){move(1);}}
function setView(v){const portrait=v==='tiktok';document.body.classList.toggle('portrait',portrait);try{history.replaceState(null,'',`?view=${portrait?'tiktok':'laptop'}${document.body.classList.contains('nohud')?'&hud=false':''}`);}catch(_){}}
const params=new URLSearchParams(location.search);setView(params.get('view')==='tiktok'?'tiktok':'laptop');if(params.get('hud')==='false')document.body.classList.add('nohud');
$('dockToggle').onclick=()=>{const body=$('dockBody');body.hidden=!body.hidden;$('dockToggle').setAttribute('aria-expanded',String(!body.hidden));};
$('nextBtn').onclick=()=>move(1);$('prevBtn').onclick=()=>move(-1);$('pauseBtn').onclick=()=>{paused=!paused;$('pauseBtn').textContent=paused?'▶ Resume':'Ⅱ Pause';changed=performance.now();};
$('portraitBtn').onclick=()=>setView('tiktok');$('landscapeBtn').onclick=()=>setView('laptop');
$('duration').oninput=e=>{duration=Number(e.target.value)*1000;$('durationLabel').textContent=e.target.value+'s';changed=performance.now();};
$('safeBtn').onclick=()=>{$('safeOverlay').hidden=!$('safeOverlay').hidden;};$('reloadBtn').onclick=load;
$('fullscreenBtn').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else $('broadcast').requestFullscreen?.().catch(()=>{});};
$('musicBtn').onclick=async()=>{try{if(window.BSPORT_MUSIC.playing){await window.BSPORT_MUSIC.stop();$('musicBtn').textContent='♫ Start music';}else{await window.BSPORT_MUSIC.start();$('musicBtn').textContent='■ Stop music';}}catch(e){$('feedStatus').textContent='Audio could not start: '+e.message;}};
$('muteBtn').onclick=()=>{$('muteBtn').textContent=window.BSPORT_MUSIC.mute()?'Unmute':'Mute';};
$('volume').oninput=e=>window.BSPORT_MUSIC.volume(Number(e.target.value)/100);
window.BSPORT_V2={next:()=>move(1),prev:()=>move(-1),goTo:n=>{if(Number.isInteger(n)&&n>=1&&n<=30){index=n-1;display();}},state:()=>({slide:index+1,total:30,matches:matches.length,lastRefresh,lastError})};
display();load();timer=setInterval(()=>{if(!document.hidden)updateTicker();},100);setInterval(()=>{if(!document.hidden)load();},60*60*1000);
})();
