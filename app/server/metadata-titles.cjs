'use strict';
const normalize=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[أإآٱ]/g,'ا').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/ى/g,'ي').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
// Verified against TMDB on 2026-10-02. Scoped to Turkish TV premieres in 2026.
const titles=[
 {id:322280,original:'Ömür Usta',year:'2026',aliases:['المعلمة اومور','المعلمة أومور']},
 {id:320296,original:'Başkalarının Hayatı',year:'2026',aliases:['حياة الاخرين','حياة الآخرين']},
 {id:317883,original:'Daha 17',year:'2026',aliases:['لاتزال في السابع عشر','لا تزال في السابع عشر','لا تزال في السابعة عشر','ما زلت في 17']}
];
module.exports={normalize,verified:(query,year,kind)=>kind==='tv'?titles.find(r=>(!year||r.year===year)&&r.aliases.some(a=>normalize(a)===normalize(query))):undefined};
