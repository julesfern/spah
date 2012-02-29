var hljs=new function(){function l(o){return o.replace(/&/gm,"&amp;").replace(/</gm,"&lt;")}function c(q,p,o){return RegExp(p,"m"+(q.cI?"i":"")+(o?"g":""))}function i(q){for(var o=0;o<q.childNodes.length;o++){var p=q.childNodes[o];if(p.nodeName=="CODE"){return p}if(!(p.nodeType==3&&p.nodeValue.match(/\s+/))){break}}}function g(s,r){var q="";for(var p=0;p<s.childNodes.length;p++){if(s.childNodes[p].nodeType==3){var o=s.childNodes[p].nodeValue;if(r){o=o.replace(/\n/g,"")}q+=o}else{if(s.childNodes[p].nodeName=="BR"){q+="\n"}else{q+=g(s.childNodes[p])}}}if(/MSIE [678]/.test(navigator.userAgent)){q=q.replace(/\r/g,"\n")}return q}function a(r){var p=r.className.split(/\s+/);p=p.concat(r.parentNode.className.split(/\s+/));for(var o=0;o<p.length;o++){var q=p[o].replace(/^language-/,"");if(d[q]||q=="no-highlight"){return q}}}function b(o){var p=[];(function(r,s){for(var q=0;q<r.childNodes.length;q++){if(r.childNodes[q].nodeType==3){s+=r.childNodes[q].nodeValue.length}else{if(r.childNodes[q].nodeName=="BR"){s+=1}else{p.push({event:"start",offset:s,node:r.childNodes[q]});s=arguments.callee(r.childNodes[q],s);p.push({event:"stop",offset:s,node:r.childNodes[q]})}}}return s})(o,0);return p}function k(x,y,w){var q=0;var v="";var s=[];function t(){if(x.length&&y.length){if(x[0].offset!=y[0].offset){return(x[0].offset<y[0].offset)?x:y}else{return y[0].event=="start"?x:y}}else{return x.length?x:y}}function r(B){var C="<"+B.nodeName.toLowerCase();for(var z=0;z<B.attributes.length;z++){var A=B.attributes[z];C+=" "+A.nodeName.toLowerCase();if(A.nodeValue!=undefined){C+='="'+l(A.nodeValue)+'"'}}return C+">"}while(x.length||y.length){var u=t().splice(0,1)[0];v+=l(w.substr(q,u.offset-q));q=u.offset;if(u.event=="start"){v+=r(u.node);s.push(u.node)}else{if(u.event=="stop"){var p=s.length;do{p--;var o=s[p];v+=("</"+o.nodeName.toLowerCase()+">")}while(o!=u.node);s.splice(p,1);while(p<s.length){v+=r(s[p]);p++}}}}v+=w.substr(q);return v}function f(I,C){function y(r,L){for(var K=0;K<L.c.length;K++){if(L.c[K].bR.test(r)){return L.c[K]}}}function v(K,r){if(B[K].e&&B[K].eR.test(r)){return 1}if(B[K].eW){var L=v(K-1,r);return L?L+1:0}return 0}function w(r,K){return K.iR&&K.iR.test(r)}function z(N,M){var L=[];for(var K=0;K<N.c.length;K++){L.push(N.c[K].b)}var r=B.length-1;do{if(B[r].e){L.push(B[r].e)}r--}while(B[r+1].eW);if(N.i){L.push(N.i)}return c(M,"("+L.join("|")+")",true)}function q(L,K){var M=B[B.length-1];if(!M.t){M.t=z(M,G)}M.t.lastIndex=K;var r=M.t.exec(L);if(r){return[L.substr(K,r.index-K),r[0],false]}else{return[L.substr(K),"",true]}}function o(N,r){var K=G.cI?r[0].toLowerCase():r[0];for(var M in N.kG){if(!N.kG.hasOwnProperty(M)){continue}var L=N.kG[M].hasOwnProperty(K);if(L){return[M,L]}}return false}function E(L,N){if(!N.k){return l(L)}var M="";var O=0;N.lR.lastIndex=0;var K=N.lR.exec(L);while(K){M+=l(L.substr(O,K.index-O));var r=o(N,K);if(r){s+=r[1];M+='<span class="'+r[0]+'">'+l(K[0])+"</span>"}else{M+=l(K[0])}O=N.lR.lastIndex;K=N.lR.exec(L)}M+=l(L.substr(O,L.length-O));return M}function J(r,L){if(L.sL&&d[L.sL]){var K=f(L.sL,r);s+=K.keyword_count;return K.value}else{return E(r,L)}}function H(L,r){var K=L.cN?'<span class="'+L.cN+'">':"";if(L.rB){p+=K;L.buffer=""}else{if(L.eB){p+=l(r)+K;L.buffer=""}else{p+=K;L.buffer=r}}B.push(L);A+=L.r}function D(N,K,P){var Q=B[B.length-1];if(P){p+=J(Q.buffer+N,Q);return false}var L=y(K,Q);if(L){p+=J(Q.buffer+N,Q);H(L,K);return L.rB}var r=v(B.length-1,K);if(r){var M=Q.cN?"</span>":"";if(Q.rE){p+=J(Q.buffer+N,Q)+M}else{if(Q.eE){p+=J(Q.buffer+N,Q)+M+l(K)}else{p+=J(Q.buffer+N+K,Q)+M}}while(r>1){M=B[B.length-2].cN?"</span>":"";p+=M;r--;B.length--}var O=B[B.length-1];B.length--;B[B.length-1].buffer="";if(O.starts){H(O.starts,"")}return Q.rE}if(w(K,Q)){throw"Illegal"}}var G=d[I];var B=[G.dM];var A=0;var s=0;var p="";try{var u=0;G.dM.buffer="";do{var x=q(C,u);var t=D(x[0],x[1],x[2]);u+=x[0].length;if(!t){u+=x[1].length}}while(!x[2]);if(B.length>1){throw"Illegal"}return{language:I,r:A,keyword_count:s,value:p}}catch(F){if(F=="Illegal"){return{language:null,r:0,keyword_count:0,value:l(C)}}else{throw F}}}function h(){function o(t,s,u){if(t.compiled){return}if(!u){t.bR=c(s,t.b?t.b:"\\B|\\b");if(!t.e&&!t.eW){t.e="\\B|\\b"}if(t.e){t.eR=c(s,t.e)}}if(t.i){t.iR=c(s,t.i)}if(t.r==undefined){t.r=1}if(t.k){t.lR=c(s,t.l||hljs.IR,true)}for(var r in t.k){if(!t.k.hasOwnProperty(r)){continue}if(t.k[r] instanceof Object){t.kG=t.k}else{t.kG={keyword:t.k}}break}if(!t.c){t.c=[]}t.compiled=true;for(var q=0;q<t.c.length;q++){o(t.c[q],s,false)}if(t.starts){o(t.starts,s,false)}}for(var p in d){if(!d.hasOwnProperty(p)){continue}o(d[p].dM,d[p],true)}}function e(){if(e.called){return}e.called=true;h()}function n(t,y,p){e();var A=g(t,p);var r=a(t);if(r=="no-highlight"){return}if(r){var w=f(r,A)}else{var w={language:"",keyword_count:0,r:0,value:l(A)};var x=w;for(var z in d){if(!d.hasOwnProperty(z)){continue}var u=f(z,A);if(u.keyword_count+u.r>x.keyword_count+x.r){x=u}if(u.keyword_count+u.r>w.keyword_count+w.r){x=w;w=u}}}var s=t.className;if(!s.match(w.language)){s=s?(s+" "+w.language):w.language}var o=b(t);if(o.length){var q=document.createElement("pre");q.innerHTML=w.value;w.value=k(o,b(q),A)}if(y){w.value=w.value.replace(/^((<[^>]+>|\t)+)/gm,function(B,E,D,C){return E.replace(/\t/g,y)})}if(p){w.value=w.value.replace(/\n/g,"<br>")}if(/MSIE [678]/.test(navigator.userAgent)&&t.tagName=="CODE"&&t.parentNode.tagName=="PRE"){var q=t.parentNode;var v=document.createElement("div");v.innerHTML="<pre><code>"+w.value+"</code></pre>";t=v.firstChild.firstChild;v.firstChild.cN=q.cN;q.parentNode.replaceChild(v.firstChild,q)}else{t.innerHTML=w.value}t.className=s;t.dataset={};t.dataset.result={language:w.language,kw:w.keyword_count,re:w.r};if(x&&x.language){t.dataset.second_best={language:x.language,kw:x.keyword_count,re:x.r}}}function j(){if(j.called){return}j.called=true;e();var q=document.getElementsByTagName("pre");for(var o=0;o<q.length;o++){var p=i(q[o]);if(p){n(p,hljs.tabReplace)}}}function m(){var o=arguments;var p=function(){j.apply(null,o)};if(window.addEventListener){window.addEventListener("DOMContentLoaded",p,false);window.addEventListener("load",p,false)}else{if(window.attachEvent){window.attachEvent("onload",p)}else{window.onload=p}}}var d={};this.LANGUAGES=d;this.initHighlightingOnLoad=m;this.highlightBlock=n;this.initHighlighting=j;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="\\b(0x[A-Za-z0-9]+|\\d+(\\.\\d+)?)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";this.BE={b:"\\\\.",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE],r:0};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE],r:0};this.CLCM={cN:"comment",b:"//",e:"$"};this.CBLCLM={cN:"comment",b:"/\\*",e:"\\*/"};this.HCM={cN:"comment",b:"#",e:"$"};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.inherit=function(o,r){var q={};for(var p in o){q[p]=o[p]}if(r){for(var p in r){q[p]=r[p]}}return q}}();hljs.LANGUAGES.ruby=function(){var g="[a-zA-Z_][a-zA-Z0-9_]*(\\!|\\?)?";var a="[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?";var n={keyword:{and:1,"false":1,then:1,defined:1,module:1,"in":1,"return":1,redo:1,"if":1,BEGIN:1,retry:1,end:1,"for":1,"true":1,self:1,when:1,next:1,until:1,"do":1,begin:1,unless:1,END:1,rescue:1,nil:1,"else":1,"break":1,undef:1,not:1,"super":1,"class":1,"case":1,require:1,yield:1,alias:1,"while":1,ensure:1,elsif:1,or:1,def:1},keymethods:{__id__:1,__send__:1,abort:1,abs:1,"all?":1,allocate:1,ancestors:1,"any?":1,arity:1,assoc:1,at:1,at_exit:1,autoload:1,"autoload?":1,"between?":1,binding:1,binmode:1,"block_given?":1,call:1,callcc:1,caller:1,capitalize:1,"capitalize!":1,casecmp:1,"catch":1,ceil:1,center:1,chomp:1,"chomp!":1,chop:1,"chop!":1,chr:1,"class":1,class_eval:1,"class_variable_defined?":1,class_variables:1,clear:1,clone:1,close:1,close_read:1,close_write:1,"closed?":1,coerce:1,collect:1,"collect!":1,compact:1,"compact!":1,concat:1,"const_defined?":1,const_get:1,const_missing:1,const_set:1,constants:1,count:1,crypt:1,"default":1,default_proc:1,"delete":1,"delete!":1,delete_at:1,delete_if:1,detect:1,display:1,div:1,divmod:1,downcase:1,"downcase!":1,downto:1,dump:1,dup:1,each:1,each_byte:1,each_index:1,each_key:1,each_line:1,each_pair:1,each_value:1,each_with_index:1,"empty?":1,entries:1,eof:1,"eof?":1,"eql?":1,"equal?":1,"eval":1,exec:1,exit:1,"exit!":1,extend:1,fail:1,fcntl:1,fetch:1,fileno:1,fill:1,find:1,find_all:1,first:1,flatten:1,"flatten!":1,floor:1,flush:1,for_fd:1,foreach:1,fork:1,format:1,freeze:1,"frozen?":1,fsync:1,getc:1,gets:1,global_variables:1,grep:1,gsub:1,"gsub!":1,"has_key?":1,"has_value?":1,hash:1,hex:1,id:1,include:1,"include?":1,included_modules:1,index:1,indexes:1,indices:1,induced_from:1,inject:1,insert:1,inspect:1,instance_eval:1,instance_method:1,instance_methods:1,"instance_of?":1,"instance_variable_defined?":1,instance_variable_get:1,instance_variable_set:1,instance_variables:1,"integer?":1,intern:1,invert:1,ioctl:1,"is_a?":1,isatty:1,"iterator?":1,join:1,"key?":1,keys:1,"kind_of?":1,lambda:1,last:1,length:1,lineno:1,ljust:1,load:1,local_variables:1,loop:1,lstrip:1,"lstrip!":1,map:1,"map!":1,match:1,max:1,"member?":1,merge:1,"merge!":1,method:1,"method_defined?":1,method_missing:1,methods:1,min:1,module_eval:1,modulo:1,name:1,nesting:1,"new":1,next:1,"next!":1,"nil?":1,nitems:1,"nonzero?":1,object_id:1,oct:1,open:1,pack:1,partition:1,pid:1,pipe:1,pop:1,popen:1,pos:1,prec:1,prec_f:1,prec_i:1,print:1,printf:1,private_class_method:1,private_instance_methods:1,"private_method_defined?":1,private_methods:1,proc:1,protected_instance_methods:1,"protected_method_defined?":1,protected_methods:1,public_class_method:1,public_instance_methods:1,"public_method_defined?":1,public_methods:1,push:1,putc:1,puts:1,quo:1,raise:1,rand:1,rassoc:1,read:1,read_nonblock:1,readchar:1,readline:1,readlines:1,readpartial:1,rehash:1,reject:1,"reject!":1,remainder:1,reopen:1,replace:1,require:1,"respond_to?":1,reverse:1,"reverse!":1,reverse_each:1,rewind:1,rindex:1,rjust:1,round:1,rstrip:1,"rstrip!":1,scan:1,seek:1,select:1,send:1,set_trace_func:1,shift:1,singleton_method_added:1,singleton_methods:1,size:1,sleep:1,slice:1,"slice!":1,sort:1,"sort!":1,sort_by:1,split:1,sprintf:1,squeeze:1,"squeeze!":1,srand:1,stat:1,step:1,store:1,strip:1,"strip!":1,sub:1,"sub!":1,succ:1,"succ!":1,sum:1,superclass:1,swapcase:1,"swapcase!":1,sync:1,syscall:1,sysopen:1,sysread:1,sysseek:1,system:1,syswrite:1,taint:1,"tainted?":1,tell:1,test:1,"throw":1,times:1,to_a:1,to_ary:1,to_f:1,to_hash:1,to_i:1,to_int:1,to_io:1,to_proc:1,to_s:1,to_str:1,to_sym:1,tr:1,"tr!":1,tr_s:1,"tr_s!":1,trace_var:1,transpose:1,trap:1,truncate:1,"tty?":1,type:1,ungetc:1,uniq:1,"uniq!":1,unpack:1,unshift:1,untaint:1,untrace_var:1,upcase:1,"upcase!":1,update:1,upto:1,"value?":1,values:1,values_at:1,warn:1,write:1,write_nonblock:1,"zero?":1,zip:1}};var h={cN:"yardoctag",b:"@[A-Za-z]+"};var d={cN:"comment",b:"#",e:"$",c:[h]};var c={cN:"comment",b:"^\\=begin",e:"^\\=end",c:[h],r:10};var b={cN:"comment",b:"^__END__",e:"\\n$"};var u={cN:"subst",b:"#\\{",e:"}",l:g,k:n};var p=[hljs.BE,u];var s={cN:"string",b:"'",e:"'",c:p,r:0};var r={cN:"string",b:'"',e:'"',c:p,r:0};var q={cN:"string",b:"%[qw]?\\(",e:"\\)",c:p,r:10};var o={cN:"string",b:"%[qw]?\\[",e:"\\]",c:p,r:10};var m={cN:"string",b:"%[qw]?{",e:"}",c:p,r:10};var l={cN:"string",b:"%[qw]?<",e:">",c:p,r:10};var k={cN:"string",b:"%[qw]?/",e:"/",c:p,r:10};var j={cN:"string",b:"%[qw]?%",e:"%",c:p,r:10};var i={cN:"string",b:"%[qw]?-",e:"-",c:p,r:10};var t={cN:"string",b:"%[qw]?\\|",e:"\\|",c:p,r:10};var e={cN:"function",b:"\\bdef\\s+",e:" |$|;",l:g,k:n,c:[{cN:"title",b:a,l:g,k:n},{cN:"params",b:"\\(",e:"\\)",l:g,k:n},d,c,b]};var f={cN:"identifier",b:g,l:g,k:n,r:0};var v=[d,c,b,s,r,q,o,m,l,k,j,i,t,{cN:"class",b:"\\b(class|module)\\b",e:"$|;",k:{"class":1,module:1},c:[{cN:"title",b:"[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?",r:0},{cN:"inheritance",b:"<\\s*",c:[{cN:"parent",b:"("+hljs.IR+"::)?"+hljs.IR}]},d,c,b]},e,{cN:"constant",b:"(::)?([A-Z]\\w*(::)?)+",r:0},{cN:"symbol",b:":",c:[s,r,q,o,m,l,k,j,i,t,f],r:0},{cN:"number",b:"(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b",r:0},{cN:"number",b:"\\?\\w"},{cN:"variable",b:"(\\$\\W)|((\\$|\\@\\@?)(\\w+))"},f,{b:"("+hljs.RSR+")\\s*",c:[d,c,b,{cN:"regexp",b:"/",e:"/[a-z]*",i:"\\n",c:[hljs.BE]}],r:0}];u.c=v;e.c[1].c=v;return{dM:{l:g,k:n,c:v}}}();hljs.LANGUAGES.diff={cI:true,dM:{c:[{cN:"chunk",b:"^\\@\\@ +\\-\\d+,\\d+ +\\+\\d+,\\d+ +\\@\\@$",r:10},{cN:"chunk",b:"^\\*\\*\\* +\\d+,\\d+ +\\*\\*\\*\\*$",r:10},{cN:"chunk",b:"^\\-\\-\\- +\\d+,\\d+ +\\-\\-\\-\\-$",r:10},{cN:"header",b:"Index: ",e:"$"},{cN:"header",b:"=====",e:"=====$"},{cN:"header",b:"^\\-\\-\\-",e:"$"},{cN:"header",b:"^\\*{3} ",e:"$"},{cN:"header",b:"^\\+\\+\\+",e:"$"},{cN:"header",b:"\\*{5}",e:"\\*{5}$"},{cN:"addition",b:"^\\+",e:"$"},{cN:"deletion",b:"^\\-",e:"$"},{cN:"change",b:"^\\!",e:"$"}]}};hljs.LANGUAGES.javascript={dM:{k:{keyword:{"in":1,"if":1,"for":1,"while":1,"finally":1,"var":1,"new":1,"function":1,"do":1,"return":1,"void":1,"else":1,"break":1,"catch":1,"instanceof":1,"with":1,"throw":1,"case":1,"default":1,"try":1,"this":1,"switch":1,"continue":1,"typeof":1,"delete":1},literal:{"true":1,"false":1,"null":1}},c:[hljs.ASM,hljs.QSM,hljs.CLCM,hljs.CBLCLM,hljs.CNM,{b:"("+hljs.RSR+"|case|return|throw)\\s*",k:{"return":1,"throw":1,"case":1},c:[hljs.CLCM,hljs.CBLCLM,{cN:"regexp",b:"/.*?[^\\\\/]/[gim]*"}],r:0},{cN:"function",b:"\\bfunction\\b",e:"{",k:{"function":1},c:[{cN:"title",b:"[A-Za-z$_][0-9A-Za-z$_]*"},{cN:"params",b:"\\(",e:"\\)",c:[hljs.ASM,hljs.QSM,hljs.CLCM,hljs.CBLCLM]}]}]}};hljs.LANGUAGES.css=function(){var a={cN:"function",b:hljs.IR+"\\(",e:"\\)",c:[{eW:true,eE:true,c:[hljs.NM,hljs.ASM,hljs.QSM]}]};return{cI:true,dM:{i:"[=/|']",c:[hljs.CBLCLM,{cN:"id",b:"\\#[A-Za-z0-9_-]+"},{cN:"class",b:"\\.[A-Za-z0-9_-]+",r:0},{cN:"attr_selector",b:"\\[",e:"\\]",i:"$"},{cN:"pseudo",b:":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+"},{cN:"at_rule",b:"@font-face",l:"[a-z-]+",k:{"font-face":1}},{cN:"at_rule",b:"@",e:"[{;]",eE:true,k:{"import":1,page:1,media:1,charset:1},c:[a,hljs.ASM,hljs.QSM,hljs.NM]},{cN:"tag",b:hljs.IR,r:0},{cN:"rules",b:"{",e:"}",i:"[^\\s]",r:0,c:[hljs.CBLCLM,{cN:"rule",b:"[^\\s]",rB:true,e:";",eW:true,c:[{cN:"attribute",b:"[A-Z\\_\\.\\-]+",e:":",eE:true,i:"[^\\s]",starts:{cN:"value",eW:true,eE:true,c:[a,hljs.NM,hljs.QSM,hljs.ASM,hljs.CBLCLM,{cN:"hexcolor",b:"\\#[0-9A-F]+"},{cN:"important",b:"!important"}]}}]}]}]}}}();hljs.LANGUAGES.python=function(){var c={cN:"string",b:"u?r?'''",e:"'''",r:10};var b={cN:"string",b:'u?r?"""',e:'"""',r:10};var a={cN:"string",b:"(u|r|ur)'",e:"'",c:[hljs.BE],r:10};var f={cN:"string",b:'(u|r|ur)"',e:'"',c:[hljs.BE],r:10};var d={cN:"title",b:hljs.UIR};var e={cN:"params",b:"\\(",e:"\\)",c:[c,b,a,f,hljs.ASM,hljs.QSM]};return{dM:{k:{keyword:{and:1,elif:1,is:1,global:1,as:1,"in":1,"if":1,from:1,raise:1,"for":1,except:1,"finally":1,print:1,"import":1,pass:1,"return":1,exec:1,"else":1,"break":1,not:1,"with":1,"class":1,assert:1,yield:1,"try":1,"while":1,"continue":1,del:1,or:1,def:1,lambda:1,nonlocal:10},built_in:{None:1,True:1,False:1,Ellipsis:1,NotImplemented:1}},i:"(</|->|\\?)",c:[hljs.HCM,c,b,a,f,hljs.ASM,hljs.QSM,{cN:"function",b:"\\bdef ",e:":",i:"$",k:{def:1},c:[d,e],r:10},{cN:"class",b:"\\bclass ",e:":",i:"[${]",k:{"class":1},c:[d,e],r:10},hljs.CNM,{cN:"decorator",b:"@",e:"$"}]}}}();