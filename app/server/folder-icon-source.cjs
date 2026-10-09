'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {normalize,verified}=require('./metadata-titles.cjs');
const {cleanTitle}=require('./metadata.cjs');
const {publicType}=require('./public-catalog.cjs');
const MAX_IMAGE_BYTES=8*1024*1024,MAX_API_BYTES=2*1024*1024,CACHE_AGE=7*24*3600000;
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const imagePath=value=>typeof value==='string'&&/^\/[a-zA-Z0-9_-]+\.(?:jpg|png)$/i.test(value);
const digits=value=>String(value||'').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0));
function seasonNumber(name){
 const value=normalize(digits(name)),numeric=/(?:^|\s)(?:season\s*|s\s*|الموسم\s*)(\d{1,3})(?=$|\s)/i.exec(value);
 if(numeric)return Number(numeric[1]);
 const names=['الاول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر'];
 for(let index=names.length-1;index>=0;index--)if(new RegExp('(?:^|\\s)الموسم\\s+'+names[index]+'(?=$|\\s)').test(value))return index+1;
 return null;
}
function withoutSeason(name){return String(name||'').replace(/(?:\bseason\s*\d{1,3}\b|\bS\d{1,3}\b|الموسم\s*(?:[0-9٠-٩۰-۹]{1,3}|الحادي\s+عشر|الثاني\s+عشر|الأول|الاول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر))/gi,' ');}
function content(item){try{const data=JSON.parse(item?.content?.contentJSON||'{}');return data&&typeof data==='object'&&!Array.isArray(data)?data:{};}catch{return {};}}
function validImage(bytes){return bytes.length>=8&&(bytes[0]===255&&bytes[1]===216&&bytes[2]===255||bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));}
async function readBounded(response,maximum){
 if(Number(response.headers.get('content-length'))>maximum)throw Error('image-too-large');
 const chunks=[];let size=0;
 for await(const chunk of response.body){size+=chunk.length;if(size>maximum)throw Error('image-too-large');chunks.push(chunk);}
 return Buffer.concat(chunks);
}

// dir is the server data directory. This resolver never changes catalog records or media folders.
// request(route, params, {signal}) and download(url, {signal,maxBytes}) are injectable for offline tests.
// download returns image bytes. A parent series supplies the identity of a season folder.
module.exports=function({dir,getKey=()=>'',getLookupName,request,download}){
 const root=path.join(dir,'folder-icon-sources'),controller=new AbortController(),pending=new Map(),assets=new Map();
 let nextRequest=0,gate=Promise.resolve();
 function check(){if(controller.signal.aborted)throw Object.assign(Error('أوقفت خدمة صور الأيقونات'),{code:'CANCELLED'});}
 async function api(route,params={}){
  check();
  const admitted=gate.then(async()=>{const wait=nextRequest-Date.now();if(wait>0)await new Promise(resolve=>setTimeout(resolve,wait));check();nextRequest=Date.now()+100;});gate=admitted.catch(()=>{});await admitted;
  const signal=AbortSignal.any([controller.signal,AbortSignal.timeout(15000)]);
  try{
   if(request)return await request(route,params,{signal});
   const key=getKey();if(!key)throw Object.assign(Error('مفتاح TMDB غير موجود'),{code:'MISSING_KEY'});
   const url=new URL('https://api.themoviedb.org/3/'+route);url.searchParams.set('api_key',key);for(const [key,value]of Object.entries(params))url.searchParams.set(key,value);
   const response=await fetch(url,{signal,redirect:'error'});
   if(!response.ok)throw Object.assign(Error(response.status===401?'مفتاح TMDB غير صالح':'تعذر جلب صورة المحتوى من TMDB'),{status:response.status});
   return JSON.parse((await readBounded(response,MAX_API_BYTES)).toString('utf8'));
  }catch(error){check();if(error.code==='MISSING_KEY'||error.status)throw error;throw Error('تعذر الاتصال بخدمة صور المحتوى');}
 }
 async function saveImage(remote,size='w500'){
  if(!imagePath(remote))return null;check();
  const name=hash(size+remote)+path.extname(remote).toLowerCase(),destination=path.join(root,name);
  try{const stat=await fs.promises.stat(destination);if(stat.isFile()&&stat.size>=8&&stat.size<=MAX_IMAGE_BYTES){const handle=await fs.promises.open(destination,'r');try{const head=Buffer.alloc(8);await handle.read(head,0,8,0);if(validImage(head))return destination;}finally{await handle.close();}}}catch{}
  if(assets.has(name))return assets.get(name);
  const work=(async()=>{
   let temp;
   try{
    const url='https://image.tmdb.org/t/p/'+size+remote,signal=AbortSignal.any([controller.signal,AbortSignal.timeout(20000)]);
    let bytes;
    if(download)bytes=Buffer.from(await download(url,{signal,maxBytes:MAX_IMAGE_BYTES}));
    else{const response=await fetch(url,{signal,redirect:'error'});if(!response.ok)throw Error('image-unavailable');bytes=await readBounded(response,MAX_IMAGE_BYTES);}
    check();if(bytes.length>MAX_IMAGE_BYTES||!validImage(bytes))throw Error('invalid-image');
    await fs.promises.mkdir(root,{recursive:true});temp=destination+'.'+crypto.randomUUID()+'.tmp';await fs.promises.writeFile(temp,bytes,{flag:'wx'});await fs.promises.rename(temp,destination);return destination;
   }catch{check();throw Error('تعذر تنزيل صورة سليمة لأيقونة المجلد');}
   finally{if(temp)await fs.promises.unlink(temp).catch(()=>{});}
  })();assets.set(name,work);try{return await work;}finally{assets.delete(name);}
 }
 async function identify(query,year,kind,existing){
  if(existing.tmdbType===kind&&/^[1-9]\d*$/.test(String(existing.content_id)))return {id:Number(existing.content_id),known:true};
  const trusted=verified(query,year,kind);if(trusted)return {id:trusted.id,verified:trusted};
  if(!query)return {};
  const params={query,language:'en-US',include_adult:'false',...(year&&kind==='movie'?{year}:{})};
  const found=await api('search/'+kind,params),candidates=new Map((found.results||[]).map(row=>[row.id,row]));
  const dateMatches=row=>!year||String(row.first_air_date||row.release_date||'').startsWith(year);
  const match=row=>[row.title,row.original_title,row.name,row.original_name].some(name=>normalize(name)===normalize(query))&&dateMatches(row);
  let exact=[...candidates.values()].filter(match);
  if(!exact.length&&/\p{Script=Arabic}/u.test(query)){
   const arabic=await api('search/'+kind,{...params,language:'ar-SA'});for(const row of arabic.results||[])candidates.set(row.id,row);exact=[...candidates.values()].filter(match);
   if(!exact.length)for(const row of [...candidates.values()].filter(dateMatches).slice(0,5)){
    const aliases=await api(kind+'/'+row.id+'/alternative_titles');if((aliases.results||aliases.titles||[]).some(alias=>normalize(alias.title)===normalize(query)))exact.push(row);
   }
  }
  exact=[...new Map(exact.map(row=>[row.id,row])).values()];
  return exact.length===1?{id:exact[0].id}:{reason:exact.length?'ambiguous-match':'no-match'};
 }
 async function getManifest(key){try{const value=JSON.parse(await fs.promises.readFile(path.join(root,key+'.json'),'utf8'));return value.version===1&&Number.isFinite(value.checkedAt)&&Date.now()-value.checkedAt<CACHE_AGE&&value.checkedAt<=Date.now()?value:null;}catch{return null;}}
 async function writeManifest(key,value){await fs.promises.mkdir(root,{recursive:true});const destination=path.join(root,key+'.json'),temp=destination+'.'+crypto.randomUUID()+'.tmp';try{await fs.promises.writeFile(temp,JSON.stringify({...value,version:1,checkedAt:Date.now()}),{flag:'wx'});await fs.promises.rename(temp,destination);}finally{await fs.promises.unlink(temp).catch(()=>{});}}
 async function resolve(item,{parent,posterNeeded=true,logoNeeded=true}={}){
  check();if(!item)return {reason:'unsupported'};
  const itemType=publicType(item.type),isSeason=itemType==='season',identity=isSeason&&parent?parent:item;
  const type=publicType(identity.type),kind=isSeason||type==='series'||/^series\./.test(type||'')?'tv':type==='movie'?'movie':null;
  if(!kind)return {reason:'unsupported'};
  const ownName=getLookupName?.(item)||item.name||'',name=getLookupName?.(identity)||identity.name||'',season=isSeason?seasonNumber(ownName):null;
  const lookup=isSeason&&!parent?withoutSeason(name):name,year=/\b(19\d{2}|20\d{2})\b/.exec(lookup)?.[0],query=cleanTitle(lookup),existing=content(identity);
  const key=hash(JSON.stringify([kind,query,year||'',existing.tmdbType,existing.content_id,season,logoNeeded]));
  // One manifest lookup covers the poster and logo, including a season's own poster.
  const metadata=async()=>{
   const cached=await getManifest(key);if(cached)return cached;
   if(!request&&!getKey())return {reason:'missing-key'};
   const match=await identify(query,year,kind,existing);if(!match.id)return match;
   const detail=await api(kind+'/'+match.id,{language:'en-US'});
   if(match.verified&&(normalize(detail.original_name)!==normalize(match.verified.original)||!(detail.origin_country||[]).includes('TR')||!String(detail.first_air_date||'').startsWith(match.verified.year)))return {reason:'identity-mismatch'};
   let poster=imagePath(detail.poster_path)?detail.poster_path:null;
   if(isSeason&&season!==null)try{const seasonInfo=await api('tv/'+match.id+'/season/'+season,{language:'en-US'});if(seasonInfo.season_number===season&&imagePath(seasonInfo.poster_path))poster=seasonInfo.poster_path;}catch(error){if(error.status!==404)throw error;}
   let images={};try{if(logoNeeded)images=await api(kind+'/'+match.id+'/images');}catch(error){if(error.code==='CANCELLED')throw error;}
   const rank=row=>row.iso_639_1==='ar'?4:row.iso_639_1===detail.original_language?3:row.iso_639_1==='en'?2:!row.iso_639_1?1:0;
   const logo=(images.logos||[]).filter(row=>imagePath(row.file_path)&&/\.png$/i.test(row.file_path)).sort((a,b)=>rank(b)-rank(a)||(b.vote_average||0)-(a.vote_average||0)||(b.width||0)-(a.width||0))[0]?.file_path||null;
   const result={poster,logo,tmdbId:match.id,tmdbType:kind};await writeManifest(key,result);return result;
  };
  let work=pending.get(key);if(!work){work=metadata();pending.set(key,work);work.finally(()=>{if(pending.get(key)===work)pending.delete(key);}).catch(()=>{});}
  const result=await work;check();if(result.reason)return result;
  let posterPath=null,logoPath=null;
  if(posterNeeded&&imagePath(result.poster))posterPath=await saveImage(result.poster);
  // Logos are optional: an unavailable logo must not prevent the text-based icon.
  if(logoNeeded&&imagePath(result.logo))try{logoPath=await saveImage(result.logo);}catch(error){if(error.code==='CANCELLED')throw error;}
  return {posterPath,logoPath,tmdbId:result.tmdbId,tmdbType:result.tmdbType,...(posterNeeded&&!posterPath?{reason:'no-poster'}:{})};
 }
 return {resolve,close(){controller.abort();}};
};
module.exports.seasonNumber=seasonNumber;

