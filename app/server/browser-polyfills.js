(function(){'use strict';
 if(!Promise.prototype.finally)Promise.prototype.finally=function(fn){var C=this.constructor;return this.then(function(v){return C.resolve(fn()).then(function(){return v})},function(e){return C.resolve(fn()).then(function(){throw e})})};
 if(!Object.entries)Object.entries=function(o){return Object.keys(o).map(function(k){return[k,o[k]]})};
 if(!Object.values)Object.values=function(o){return Object.keys(o).map(function(k){return o[k]})};
 if(!Object.fromEntries)Object.fromEntries=function(rows){var o={};Array.from(rows).forEach(function(r){Object.defineProperty(o,r[0],{value:r[1],enumerable:true,writable:true,configurable:true})});return o};
 if(!Array.prototype.includes)Object.defineProperty(Array.prototype,'includes',{value:function(x,at){return this.indexOf(x,at||0)!==-1}});
 if(!Array.prototype.flatMap)Object.defineProperty(Array.prototype,'flatMap',{value:function(fn){return [].concat.apply([],this.map(fn))}});
 if(!NodeList.prototype.forEach)NodeList.prototype.forEach=Array.prototype.forEach;
 if(window.Symbol&&Symbol.iterator){if(!NodeList.prototype[Symbol.iterator])NodeList.prototype[Symbol.iterator]=Array.prototype[Symbol.iterator];if(!HTMLCollection.prototype[Symbol.iterator])HTMLCollection.prototype[Symbol.iterator]=Array.prototype[Symbol.iterator]}
 if(!Element.prototype.matches)Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector;
 if(!Element.prototype.closest)Element.prototype.closest=function(selector){var p=this;while(p){if(p.matches(selector))return p;p=p.parentElement}return null};
 function nodes(args){var f=document.createDocumentFragment();Array.prototype.forEach.call(args,function(n){f.appendChild(n instanceof Node?n:document.createTextNode(String(n)))});return f}
 [Element.prototype,DocumentFragment.prototype].forEach(function(p){if(!p.append)p.append=function(){this.appendChild(nodes(arguments))};if(!p.prepend)p.prepend=function(){this.insertBefore(nodes(arguments),this.firstChild)};if(!p.replaceChildren)p.replaceChildren=function(){while(this.firstChild)this.removeChild(this.firstChild);this.appendChild(nodes(arguments))}});
 if(!Element.prototype.after)Element.prototype.after=function(){if(this.parentNode)this.parentNode.insertBefore(nodes(arguments),this.nextSibling)};
 if(!Element.prototype.before)Element.prototype.before=function(){if(this.parentNode)this.parentNode.insertBefore(nodes(arguments),this)};
 if(!Element.prototype.remove)Element.prototype.remove=function(){if(this.parentNode)this.parentNode.removeChild(this)};
 if(!window.AbortController){
  window.AbortController=function(){this.signal={aborted:false,_zainListeners:[]}};
  window.AbortController.prototype.abort=function(){if(this.signal.aborted)return;this.signal.aborted=true;var listeners=this.signal._zainListeners.slice();this.signal._zainListeners.length=0;listeners.forEach(function(fn){fn()})};
  window.AbortSignal={};var nativeFetch=window.fetch.bind(window);
  // The compatibility transport must cancel the network request, not only its Promise.
  window.fetch=function(input,options){var signal=options&&options.signal;if(!signal||!signal._zainListeners)return nativeFetch(input,options);var copy=Object.assign({},options);delete copy.signal;return new Promise(function(resolve,reject){
   var xhr,finished=false,request;
   function abortError(){var error=Error('The request was aborted');error.name='AbortError';return error}
   function finish(error,response){if(finished)return;finished=true;var at=signal._zainListeners.indexOf(stop);if(at!==-1)signal._zainListeners.splice(at,1);if(xhr)xhr.onload=xhr.onerror=xhr.onabort=xhr.ontimeout=null;if(error)reject(error);else resolve(response)}
   function stop(){if(xhr)xhr.abort();finish(abortError())}
   if(signal.aborted){stop();return}signal._zainListeners.push(stop);
   try{request=new Request(input,copy);xhr=new XMLHttpRequest();xhr.open(request.method,request.url,true);xhr.withCredentials=request.credentials==='include';xhr.responseType='arraybuffer';request.headers.forEach(function(value,name){xhr.setRequestHeader(name,value)});
    xhr.onload=function(){try{var headers=new Headers();xhr.getAllResponseHeaders().trim().split(/[\r\n]+/).forEach(function(line){var at=line.indexOf(':');if(at>0)headers.append(line.slice(0,at),line.slice(at+1).trim())});var status=xhr.status,response=new Response(status===204||status===205||status===304?null:xhr.response,{status:status,statusText:xhr.statusText,headers:headers});Object.defineProperty(response,'url',{value:xhr.responseURL||request.url});finish(null,response)}catch(error){finish(error)}};
    xhr.onerror=function(){finish(new TypeError('Network request failed'))};xhr.ontimeout=xhr.onabort=function(){finish(abortError())};
    if(request.method==='GET'||request.method==='HEAD')xhr.send(null);else request.blob().then(function(body){if(!finished)xhr.send(body)},function(error){finish(error)});
   }catch(error){finish(error)}
  })};
 }
 if(!window.AbortSignal)window.AbortSignal={};
 if(!window.AbortSignal.timeout)window.AbortSignal.timeout=function(ms){var c=new AbortController();setTimeout(function(){c.abort()},ms);return c.signal};
})();
