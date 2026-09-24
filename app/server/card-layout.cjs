'use strict';
// Keep the legacy mobile layout; desktop grids reserve room for the entire cover.
module.exports = `<style id="zain-card-layout">
@media (min-width:601px){
 .items-count>.container{width:100%!important;max-width:1260px!important;box-sizing:border-box!important}
 .items-count>.container>.row{margin-left:0!important;margin-right:0!important}
 .items-count>.container>.row>[class*="col-"]{flex:0 0 228.6px!important;max-width:228.6px!important;width:228.6px!important;padding-left:9px!important;padding-right:9px!important;box-sizing:border-box!important}
 .movie-box{display:block!important;width:210.6px!important}
 .movie-box img,.movie-box .zain-poster-slot{width:210.6px!important;height:315.9px!important}
 .movie-box .over{width:179.6px!important;height:288.9px!important;margin-bottom:-319.9px!important}
 .movie-box .over i{top:125.45px!important;left:67.3px!important}
 .movie-box .image-loading{width:100%!important;height:100%!important}
 /* Horizontal home rows use the original, smaller desktop cover size. */
 .slider-kc .items{column-gap:0!important}
 .slider-kc .movie-box{flex:0 0 162px!important;width:162px!important;box-sizing:border-box!important;margin-left:18px!important}
 .slider-kc .movie-box img,.slider-kc .movie-box .zain-poster-slot{width:162px!important;height:243px!important}
 .slider-kc .movie-box .over{width:138px!important;height:222px!important;margin-bottom:-246px!important}
 .slider-kc .movie-box .over i{top:96.5px!important;left:52px!important}
}
@media (min-width:900px){
 .items-count .search-bar>.container{width:100%!important;max-width:1260px!important;box-sizing:border-box!important}
 .items-count .search-bar .row{flex-wrap:nowrap!important;margin-left:0!important;margin-right:0!important}
 .items-count .search-bar .row>.col-md-2{flex:0 0 17%!important;max-width:17%!important;width:17%!important;min-width:0;box-sizing:border-box}
 .items-count .search-bar .row>.col-md-6{flex:0 0 49%!important;max-width:49%!important;width:49%!important;min-width:0;box-sizing:border-box}
 .items-count .search-bar .select-count,.items-count .search-bar .input-count{width:100%!important}
 .items-count .search-bar .row>div{padding-left:8px!important;padding-right:8px!important;box-sizing:border-box!important}
}
.items-count .search-bar input,.items-count .search-bar select{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
</style>`;
