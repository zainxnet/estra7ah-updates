'use strict';
// Keep the legacy mobile layout; desktop grids reserve room for the entire cover.
module.exports = `<style id="zain-card-layout">
@media (min-width:601px){
 .items-count>.container{width:100%!important;max-width:1260px!important;box-sizing:border-box!important}
 .items-count>.container>.row{margin-left:0!important;margin-right:0!important}
 .items-count>.container>.row>[class*="col-"]{flex:0 0 252px!important;max-width:252px!important;width:252px!important;padding-left:9px!important;padding-right:9px!important;box-sizing:border-box!important}
 .movie-box{display:block!important;width:234px!important}
 .movie-box img,.movie-box .zain-poster-slot{width:234px!important;height:351px!important}
 .movie-box .over{width:203px!important;height:324px!important;margin-bottom:-355px!important}
 .movie-box .over i{top:143px!important;left:79px!important}
 .movie-box .image-loading{width:100%!important;height:100%!important}
 /* Horizontal home rows use the original, smaller desktop cover size. */
 .slider-kc .items{column-gap:0!important}
 .slider-kc .movie-box{flex:0 0 180px!important;width:180px!important;box-sizing:border-box!important;margin-left:18px!important}
 .slider-kc .movie-box img,.slider-kc .movie-box .zain-poster-slot{width:180px!important;height:270px!important}
 .slider-kc .movie-box .over{width:156px!important;height:249px!important;margin-bottom:-273px!important}
 .slider-kc .movie-box .over i{top:110px!important;left:61px!important}
}
@media (min-width:900px){
 .items-count .search-bar>.container{width:100%!important;max-width:1260px!important;box-sizing:border-box!important}
 .items-count .search-bar .row{flex-wrap:nowrap!important;margin-left:0!important;margin-right:0!important}
 .items-count .search-bar .row>.col-md-2{flex:0 0 17%!important;max-width:17%!important;width:17%!important;min-width:0;box-sizing:border-box}
 .items-count .search-bar .row>.col-md-6{flex:0 0 49%!important;max-width:49%!important;width:49%!important;min-width:0;box-sizing:border-box}
 .items-count .search-bar .select-count,.items-count .search-bar .input-count{width:100%!important}
}
</style>`;
