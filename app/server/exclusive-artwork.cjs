'use strict';
const {cleanTitle}=require('./metadata.cjs');
module.exports=function({dir,getKey,getLookupName,request,cache,logoCache,onEvent=()=>{}}){
 const images=cache||require('./poster-cache.cjs')({dir,folder:'backdrop-cache',size:'w1280'}),pending=new Map();
 const logos=logoCache||(dir?require('./exclusive-logo.cjs')({dir}):null),checked=new Map();let hydrating=false;
 const normal=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\p{M}\u0640]/gu,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 async function prepare(item){
  if(images.file(item.id)&&(!logos||logos.file(item.id)))return {imageKind:'backdrop'};
  if(pending.has(item.id))return pending.get(item.id);
  const work=(async()=>{
   try{
    const key=getKey();if(!key&&!request)throw Error('missing-key');
    async function api(route,params={}){
     if(request)return request(route,params);
     const url=new URL('https://api.themoviedb.org/3/'+route);url.searchParams.set('api_key',key);
     for(const [k,v]of Object.entries(params))url.searchParams.set(k,v);
     for(let attempt=0;attempt<2;attempt++)try{
      const response=await fetch(url,{signal:AbortSignal.timeout(30000),redirect:'error'});
      if(!response.ok)throw Object.assign(Error(response.status===401?'invalid-key':'api-unavailable'),{transient:[408,429].includes(response.status)||response.status>=500});
      return await response.json();
     }catch(error){if(attempt===1||error.transient===false)throw error;}
    }
    let data={};try{data=JSON.parse(item.content?.contentJSON||'{}')}catch{}
    const name=getLookupName?.(item)||item.name,kind=['series','tv'].includes(item.type)||/\bS\d{1,3}(?:E\d{1,3})?\b/i.test(name)?'tv':'movie';
    let id=data.tmdbType===kind&&/^\d+$/.test(String(data.content_id))?data.content_id:null;
    if(!id){
     const query=cleanTitle(name),year=/\b(19\d{2}|20\d{2})\b/.exec(name)?.[0];
     const params={query,language:'en-US',include_adult:'false',...(year&&kind==='movie'?{year}:{})};
     const match=found=>(found.results||[]).find(r=>[r.title,r.original_title,r.name,r.original_name].some(t=>normal(t)===normal(query))&&(kind!=='movie'||!year||!r.release_date||r.release_date.startsWith(year)))?.id;
     id=match(await api('search/'+kind,params));
     if(!id&&/[\u0600-\u06ff]/.test(query))id=match(await api('search/'+kind,{...params,language:'ar-SA'}));
    }
    if(!id)throw Error('no-match');
    const result=await api(kind+'/'+id+'/images');
    if(logos&&!logos.file(item.id)){
     const rank=x=>x.iso_639_1==='ar'?3:x.iso_639_1==='en'?2:!x.iso_639_1?1:0;
     const logo=(result.logos||[]).filter(x=>/^\/[\w-]+\.png$/.test(x.file_path)).sort((a,b)=>rank(b)-rank(a)||(b.vote_average||0)-(a.vote_average||0))[0];
     if(logo)try{await logos.save(item.id,logo.file_path)}catch{}
    }
    if(images.file(item.id))return {imageKind:'backdrop'};
    const backdrop=(result.backdrops||[]).filter(x=>x.width>0&&x.height>0&&x.width/x.height>=1.5&&/^\/[a-zA-Z0-9_-]+\.jpg$/.test(x.file_path)).sort((a,b)=>(b.vote_average||0)-(a.vote_average||0)||b.width-a.width)[0];
    if(!backdrop)throw Error('no-backdrop');
    await images.save(item.id,backdrop.file_path);
    onEvent('إضافة إلى الحصريات بصورة عريضة: '+item.name,'success');return {imageKind:'backdrop'};
   }catch(error){
    if(images.file(item.id))return {imageKind:'backdrop'};
    const reason=error.message==='no-match'?'no-match':error.message==='no-backdrop'?'no-backdrop':['missing-key','invalid-key'].includes(error.message)?error.message:'download-failed';
    const message={'no-match':'لم توجد مطابقة مؤكدة للاسم','no-backdrop':'العنصر مطابق لكن لا توجد له خلفية عريضة','missing-key':'مفتاح خدمة الصور غير موجود','invalid-key':'مفتاح خدمة الصور غير صالح','download-failed':'تعذر الاتصال أو حفظ الصورة بعد إعادة المحاولة'}[reason];
    onEvent('الحصريات: '+item.name+' — '+message+'؛ تُعرض صورة العنصر مؤقتًا','warning');return {imageKind:'poster',reason};
   }
  })();pending.set(item.id,work);try{const result=await work;checked.set(item.id,Date.now()+(result.reason==='download-failed'?30000:6*3600000));return result;}finally{pending.delete(item.id);}
 }
 return {prepare,file:id=>images.file(id),logoFile:id=>logos?.file(id)||null,hydrate(rows){if(hydrating)return;hydrating=true;setImmediate(async()=>{try{for(const item of rows){if(Date.now()<(checked.get(item.id)||0))continue;await prepare(item)}}finally{hydrating=false}})}};
};
