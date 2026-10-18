'use strict';
const normalize=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[أإآٱ]/g,'ا').replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/ى/g,'ي').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
// Explicit aliases verified against TMDB; identity, country and year are checked before saving.
const titles=[
 // Verified on 2026-10-18. These are aliases, not fuzzy automatic matches.
 {"id":331693,"original":"Sevdam Karadeniz","year":"2026","country":"TR","aliases":["حبي البحر الاسود","حبي البحر الأسود"]},
 {"id":313346,"original":"追放されたチート付与魔術師は気ままなセカンドライフを謳歌する。 ～俺は武器だけじゃなく、あらゆるものに『強化ポイント』を付与できるし、俺の意思でいつでも効果を解除できるけど、残った人たち大丈夫？～","year":"2026","country":"JP","aliases":["Tsuihou sareta Cheat Fuyo Majutsushi"]},
 {"id":303060,"original":"弱気MAX令嬢なのに、辣腕婚約者様の賭けに乗ってしまった","year":"2026","country":"JP","aliases":["Yowaki Max Reijou nanoni"]},
 {"id":336153,"original":"أحلى نصيب","year":"2026","country":"SA","aliases":["احلى نصيب","أحلى نصيب"]},
 {"id":313068,"original":"どうも、好きな人に惚れ薬を依頼された魔女です。","year":"2026","country":"JP","aliases":["Doumo, Suki na Hito ni Horegusuri wo"]},
 {"id":283692,"original":"目覚めたら最強装備と宇宙船持ちだったので、一戸建て目指して傭兵として自由に生きたい","year":"2026","country":"JP","aliases":["Mezametara Saikyou Soubi to Uchuusenmochi"]},
 {"id":333622,"original":"貸した魔力は【リボ払い】で強制徴収","year":"2026","country":"JP","aliases":["Kashita Maryoku wa “Revo Bara","Kashita Maryoku wa Ribo Barai"]},
 {id:322280,original:'Ömür Usta',year:'2026',aliases:['المعلمة اومور','المعلمة أومور']},
 {id:320296,original:'Başkalarının Hayatı',year:'2026',aliases:['حياة الاخرين','حياة الآخرين']},
 {id:317883,original:'Daha 17',year:'2026',aliases:['لاتزال في السابع عشر','لا تزال في السابع عشر','لا تزال في السابعة عشر','ما زلت في 17']}
];
module.exports={normalize,verified:(query,year,kind)=>kind==='tv'?titles.find(r=>(!year||r.year===year)&&r.aliases.some(a=>normalize(a)===normalize(query))):undefined};
