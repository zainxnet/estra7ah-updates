'use strict';
const {normalize}=require('./metadata-titles.cjs');
const labels={elcinema:'السينما',shahid:'شاهد'};
const references=[{title:'أحلى نصيب',year:'2026',kind:'tv',url:'https://shahid.mbc.net/ar/series/أحلى-نصيب/series-49924113312641'}];
const unique=values=>[...new Set(values.filter(Boolean))];
function text(value){return String(value||'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&#(x[0-9a-f]+|\d+);/gi,(_all,n)=>{const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return code>0&&code<=0x10ffff?String.fromCodePoint(code):'';}).replace(/&(amp|quot|apos|lt|gt|nbsp);/gi,(_all,n)=>({amp:'&',quot:'"',apos:"'",lt:'<',gt:'>',nbsp:' '}[n.toLowerCase()])).replace(/<[^>]*>/g,' ').replace(/[<>]/g,'').replace(/[\x00-\x1f\x7f]/g,' ').replace(/\s+/g,' ').normalize('NFKC').trim();}
function safeURL(value){const url=new URL(value);if(url.protocol!=='https:'||url.username||url.password||url.port||url.hash)throw Error('رابط مصدر غير مسموح');if(url.hostname==='elcinema.com'&&(/^\/work\/\d+\/$/.test(url.pathname)&&!url.search||url.pathname==='/search/'&&[...url.searchParams.keys()].every(k=>k==='q')))return url;if(url.hostname==='shahid.mbc.net'&&/^\/(ar|en)\/(series|movies)\/[^/]+\/(series|movie)-\d+$/.test(url.pathname)&&!url.search)return url;throw Error('رابط مصدر غير مسموح');}
function identity(record,{query,year,kind}){return !!record&&record.kind===kind&&record.year===String(year)&&normalize(record.title)===normalize(query);}
function parseElcinema(html,url){
 const page=safeURL(url),header=text(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]);
 const heading=/^(مسلسل|فيلم)\s*-\s*(.*?)\s*-\s*((?:19|20)\d{2})(?:\s|$)/.exec(header);if(!heading||!/^\/work\/\d+\/$/.test(page.pathname))return null;
 const introStart=html.indexOf('class="intro-box"');if(introStart<0)return null;
 const intro=html.slice(introStart,introStart+20000);
 const groups=[...intro.matchAll(/<ul\b[^>]*class="list-separator list-title"[^>]*>([\s\S]*?)<\/ul>/g)].map(m=>m[1]);
 const people=label=>{const group=groups.find(g=>normalize(text(/<li[^>]*>([\s\S]*?)<\/li>/i.exec(g)?.[1]))===normalize(label));return unique([...String(group||'').matchAll(/<a\b[^>]*href="\/person\/\d+\/"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>text(m[1]))).slice(0,20);};
 const summary=(/<p[^>]*>([\s\S]*?)<\/p>/i.exec(intro)?.[1]||'').replace(/<a\b[^>]*id=['"]read-more['"][^>]*>[\s\S]*?<\/a>/gi,'');
 const year=heading[3],day=/\/index\/work\/release_day\/(\d{2}-\d{2})\//.exec(intro)?.[1];
 return {provider:'elcinema',providerId:/\/work\/(\d+)\//.exec(page.pathname)[1],sourceURL:page.href,title:text(heading[2]),year,kind:heading[1]==='مسلسل'?'tv':'movie',description:text(summary).slice(0,1500),releaseDate:day?year+'-'+day:year,runtime:/(\d+)\s*دقيقة/.exec(text(intro))?.[1]||'',cast:people('طاقم العمل'),directors:people('إخراج'),genres:unique([...intro.matchAll(/<a\b[^>]*href="\/index\/work\/genre\/\d+"[^>]*>([\s\S]*?)<\/a>/g)].map(m=>text(m[1])))};
}
function parseShahid(html,url,expected){
 const page=safeURL(url),records=[];
 function visit(value){if(!value||typeof value!=='object')return;if(Array.isArray(value)){value.forEach(visit);return;}if(['TVSeries','TVSeason','Movie'].includes(value['@type']))records.push(value);if(value['@graph'])visit(value['@graph']);}
 for(const script of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))try{visit(JSON.parse(script[1]));}catch{}
 for(const row of records){const series=row.partOfSeries||row,date=String(series.datePublished||row.datePublished||''),kind=row['@type']==='Movie'?'movie':'tv';const record={provider:'shahid',providerId:/(?:series|movie)-(\d+)$/.exec(page.pathname)[1],sourceURL:page.href,title:text(series.name||row.name),year:date.slice(0,4),kind,description:text(series.description||row.description).slice(0,1500),releaseDate:date.slice(0,10),runtime:'',cast:unique([].concat(row.actor||series.actor||[]).map(a=>text(a.name))).slice(0,20),directors:unique([].concat(row.director||series.director||[]).map(a=>text(a.name))),genres:unique([].concat(series.genre||row.genre||[]).map(text))};if(identity(record,expected))return record;}
 return null;
}
module.exports=function createFallback({fetcher=fetch,clock=Date.now}={}){
 const cache=new Map(),inflight=new Map();let nextRequest=0,gate=Promise.resolve();
 async function page(value,signal){const url=safeURL(value);const turn=gate.then(async()=>{const delay=nextRequest-clock();if(delay>0)await new Promise(r=>setTimeout(r,delay));signal?.throwIfAborted();nextRequest=clock()+250;});gate=turn.catch(()=>{});await turn;
  const response=await fetcher(url,{headers:{Accept:'text/html','User-Agent':'Estra7ah-Metadata/1.0'},redirect:'error',signal:signal?AbortSignal.any([signal,AbortSignal.timeout(15000)]):AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('تعذر قراءة صفحة '+url.hostname+' ('+response.status+')');
  let size=0;const chunks=[];for await(const chunk of response.body){size+=chunk.length;if(size>2*1024*1024)throw Error('صفحة المصدر أكبر من الحد المسموح');chunks.push(Buffer.from(chunk));}return Buffer.concat(chunks).toString('utf8');
 }
 async function lookup({query,year,kind,signal}){
  // A provider page must confirm the full title, year and media type.
  if(!/\p{Script=Arabic}/u.test(query)||!/^\d{4}$/.test(String(year)))return null;
  const key=kind+'|'+year+'|'+normalize(query),cached=cache.get(key);if(cached&&cached.until>clock())return structuredClone(cached.value);
  if(inflight.has(key))return structuredClone(await inflight.get(key));
  const work=(async()=>{const expected={query,year,kind};
   for(const ref of references.filter(r=>identity({...r,year:r.year},expected))){try{const result=parseShahid(await page(ref.url,signal),ref.url,expected);if(result)return result;}catch(error){if(signal?.aborted)throw error;}}
   const search=new URL('https://elcinema.com/search/');search.searchParams.set('q',query);const html=await page(search.href,signal);
   const links=unique([...html.matchAll(/<a\b[^>]*href=["'](\/work\/\d+\/)["'][^>]*>([\s\S]*?)<\/a>/gi)].filter(m=>normalize(text(m[2]))===normalize(query)).map(m=>'https://elcinema.com'+m[1]));
   if(links.length>3)throw Object.assign(Error('توجد عدة نتائج في السينما؛ تعذر تأكيد العمل تلقائيًا'),{status:409});
   const matches=[];for(const link of links){const record=parseElcinema(await page(link,signal),link);if(identity(record,expected))matches.push(record);}
   if(matches.length>1)throw Object.assign(Error('توجد عدة أعمال بالاسم والسنة نفسيهما في السينما؛ لم تحفظ بيانات غير مؤكدة'),{status:409});
   return matches[0]||null;
  })();inflight.set(key,work);
  try{const result=await work;cache.set(key,{until:clock()+(result?3600000:600000),value:result});if(cache.size>200)cache.delete(cache.keys().next().value);return structuredClone(result);}finally{inflight.delete(key);}
 }
 return {lookup};
};
module.exports.parseElcinema=parseElcinema;module.exports.parseShahid=parseShahid;module.exports.safeURL=safeURL;module.exports.identity=identity;module.exports.labels=labels;