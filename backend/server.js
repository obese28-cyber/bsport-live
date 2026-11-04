import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {join,extname,normalize} from 'node:path';
const PORT=Number(process.env.PORT||3000), KEY=process.env.SPORTAPI_KEY;
const ROOT=join(process.cwd(),'public');
const cache=new Map();
const ttl={football:60000,basketball:60000,standings:900000};
const isoDay=(d)=>d.toISOString().slice(0,10);
const json=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(obj));};
async function proxy(res,kind,date){
 if(!KEY)return json(res,503,{error:'SPORTAPI_KEY is not configured on the server.'});
 const target=kind==='football'?`/fixtures/date/${date}`:kind==='basketball'?`/basketball/games/date/${date}?tz=America/Los_Angeles&league=nba`:'/standings/24';
 const id=`${kind}:${date}`;const hit=cache.get(id);if(hit&&Date.now()-hit.at<(ttl[kind]||60000))return json(res,200,{...hit.value,cached:true});
 try{const upstream=await fetch('https://sportapi.ai/api'+target,{headers:{'X-Api-Key':KEY},signal:AbortSignal.timeout(12000)});
 const body=await upstream.json();if(!upstream.ok||body.success===false)return json(res,upstream.status,{error:body.error||`SportAPI returned ${upstream.status}`,scope:body.scope||null});
 const val={...body,fetched_at:new Date().toISOString()};cache.set(id,{at:Date.now(),value:val});return json(res,200,val);
 }catch(e){if(hit)return json(res,200,{...hit.value,cached:true,stale:true});return json(res,502,{error:'Unable to reach SportAPI right now.'});}
}
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/health')return json(res,200,{ok:true,configured:!!KEY});
 if(url.pathname.startsWith('/api/')){
 const kind=url.pathname.slice(5);if(!['football','basketball','standings'].includes(kind))return json(res,404,{error:'Unknown endpoint'});
 const date=url.searchParams.get('date')||isoDay(new Date());if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return json(res,400,{error:'Invalid date'});
 return proxy(res,kind,date);
 }
 const p=url.pathname==='/'?'/index.html':url.pathname;
 const file=normalize(join(ROOT,p));if(!file.startsWith(ROOT+'/'))return json(res,403,{error:'Forbidden'});
 try{const bytes=await readFile(file);const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.ico':'image/x-icon','.woff2':'font/woff2','.json':'application/json; charset=utf-8'}[extname(file)]||'application/octet-stream';res.writeHead(200,{'Content-Type':mime,'X-Content-Type-Options':'nosniff'});res.end(bytes);}catch{json(res,404,{error:'Not found'});}
}).listen(PORT,'0.0.0.0',()=>console.log(`BSPORT listening on ${PORT}`));
