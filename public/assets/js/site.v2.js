(function(){
  var bar=document.getElementById('bar'), hero=document.getElementById('home');
  function onScroll(){ bar.classList.toggle('solid', window.scrollY > hero.offsetHeight - 100); }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  var menu=document.getElementById('menu'), openB=document.getElementById('menu-open'), closeB=document.getElementById('menu-close');
  function setMenu(o){ var was=menu.classList.contains('open'); menu.classList.toggle('open',o); menu.setAttribute('aria-hidden',o?'false':'true'); menu.inert=!o; openB.setAttribute('aria-expanded',o?'true':'false'); document.body.style.overflow=o?'hidden':''; if(o) closeB.focus(); else if(was) openB.focus(); }
  menu.inert=true;
  menu.addEventListener('keydown',function(e){ if(e.key!=='Tab'||!menu.classList.contains('open')) return; var f=[].slice.call(menu.querySelectorAll('a[href],button')); if(!f.length) return; var a=f[0], z=f[f.length-1]; if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();} else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();} });
  openB.addEventListener('click',function(){setMenu(true)}); closeB.addEventListener('click',function(){setMenu(false)});
  menu.querySelectorAll('nav a').forEach(function(a){a.addEventListener('click',function(){ menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); menu.inert=true; openB.setAttribute('aria-expanded','false'); document.body.style.overflow=''; })});
  addEventListener('keydown',function(e){ if(e.key==='Escape') setMenu(false); });


  // parallax: every moving element eases toward its scroll position, so motion stays smooth and never overshoots
  (function(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('js');
    var rv=[].slice.call(document.querySelectorAll('.rv'));
    [].slice.call(document.querySelectorAll('.index,.steps,.tests ol,.people')).forEach(function(list){
      [].slice.call(list.children).forEach(function(el,i){ el.style.setProperty('--d',(i*0.12)+'s'); });
    });
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px'});
      rv.forEach(function(el){ io.observe(el); });
    } else rv.forEach(function(el){ el.classList.add('in'); });

    var items=[];
    function add(el,fn){ items.push({el:el,fn:fn,cur:null}); }
    var hc=document.getElementById('hero-center'), hf=document.getElementById('hero-foot'), wt=document.getElementById('water'), hero=document.getElementById('home');
    add(hc,function(y,vh){ var h=hero.offsetHeight; return {y:y*0.12, o:Math.max(0,1-y/(h*0.75))}; });
    add(hf,function(y,vh){ var h=hero.offsetHeight; return {o:Math.max(0,1-y/(h*0.4))}; });
    add(wt,function(y){ return {y:y*0.22}; });
    function prog(el,vh){ var r=el.parentElement.getBoundingClientRect(); return ((r.top+r.height/2)-vh/2)/vh; }
    [].slice.call(document.querySelectorAll('[data-speed]')).forEach(function(el){ var k=+el.dataset.speed*0.4; add(el,function(y,vh){ return {y:-prog(el,vh)*k}; }); });
    [].slice.call(document.querySelectorAll('[data-film]')).forEach(function(el){ add(el,function(y,vh){ var r=el.parentElement.getBoundingClientRect(); return {y:((r.top+r.height/2)-vh/2)/vh*-r.height*0.16}; }); });
    [].slice.call(document.querySelectorAll('[data-bg]')).forEach(function(el){ add(el,function(y,vh){ var r=el.parentElement.getBoundingClientRect(); return {y:((r.top+r.height/2)-vh/2)/vh*-r.height*0.16}; }); });
    [].slice.call(document.querySelectorAll('[data-zoom]')).forEach(function(el){ add(el,function(y,vh){ var r=el.parentElement.getBoundingClientRect(); var p=Math.max(-1,Math.min(1,((r.top+r.height/2)-vh/2)/vh)); return {y:p*-56, s:1.2}; }); });

    var running=false, lastT=0;
    function frame(now){
      var dt=lastT?Math.min(64,now-lastT):16.7; lastT=now;
      var y=scrollY, vh=innerHeight, moving=false;
      items.forEach(function(it){
        var t=it.fn(y,vh); if(!it.cur){ it.cur={x:t.x||0,y:t.y||0,s:t.s||1,o:t.o==null?1:t.o}; }
        var c=it.cur, k=1-Math.pow(1-0.085,dt/16.7);
        ['x','y','s','o'].forEach(function(key){ var target=t[key]==null?(key==='s'||key==='o'?1:0):t[key]; var d=target-c[key]; if(Math.abs(d)>(key==='s'||key==='o'?0.0005:0.05)){ c[key]+=d*k; moving=true; } else c[key]=target; });
        it.el.style.transform='translate3d('+c.x.toFixed(2)+'px,'+c.y.toFixed(2)+'px,0)'+(c.s!==1?' scale('+c.s.toFixed(4)+')':'');
        if(t.o!=null) it.el.style.opacity=c.o.toFixed(3);
      });
      if(moving) requestAnimationFrame(frame); else { running=false; lastT=0; }
    }
    function kick(){ if(!running){ running=true; requestAnimationFrame(frame); } }
    addEventListener('scroll',kick,{passive:true}); addEventListener('resize',kick); kick();
  })();

  // film grain for the gradient bands: one crisp noise tile drawn at the screen's own pixel size,
  // shifted to a new random position about 16 times a second, as film grain changes frame to frame
  (function(){
    var els=[].slice.call(document.querySelectorAll('.grain')); if(!els.length) return;
    var dpr=Math.min(devicePixelRatio||1,2), N=320, c=document.createElement('canvas'); c.width=c.height=N;
    var x=c.getContext('2d'), d=x.createImageData(N,N), a=d.data;
    for(var i=0;i<a.length;i+=4){ var g=128+((Math.random()+Math.random()+Math.random()-1.5)*22); a[i]=a[i+1]=a[i+2]=g; a[i+3]=255; }
    x.putImageData(d,0,0); var url=c.toDataURL('image/png'), sz=(N/dpr)+'px '+(N/dpr)+'px';
    els.forEach(function(el){ el.style.backgroundImage='url('+url+')'; el.style.backgroundSize=sz; });
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var vis=new Set(), last=0;
    if('IntersectionObserver' in window){ var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?vis.add(e.target):vis.delete(e.target); }); }); els.forEach(function(el){ io.observe(el); }); }
    else els.forEach(function(el){ vis.add(el); });

  })();
  (function(){
    var bs=[].slice.call(document.querySelectorAll('footer .links button'));
    bs.forEach(function(b){ b.addEventListener('click',function(){
      var open=b.getAttribute('aria-expanded')!=='true';
      bs.forEach(function(o){ o.setAttribute('aria-expanded','false'); document.getElementById(o.getAttribute('aria-controls')).hidden=true; });
      if(open){ b.setAttribute('aria-expanded','true'); var n=document.getElementById(b.getAttribute('aria-controls')); n.hidden=false; n.scrollIntoView({block:'nearest',behavior:'smooth'}); }
    }); });
  })();
  (function(){
    var b=document.getElementById('mail-copy'), a=document.getElementById('mail-addr'); if(!b||!a) return;
    b.addEventListener('click',function(){
      var st=document.getElementById('mail-status'); function done(){ b.textContent='Copied'; if(st) st.textContent='Email address copied'; setTimeout(function(){ b.textContent='Copy'; if(st) st.textContent=''; },1800); }
      function pick(){ var r=document.createRange(); r.selectNodeContents(a); var s=getSelection(); s.removeAllRanges(); s.addRange(r); }
      try{ navigator.clipboard.writeText('team@vocisgroup.com').then(done,pick); }catch(e){ pick(); }
    });
  })();
  // light passing through water: the gradient is drawn in WebGL with a slow refraction and soft caustic light
  (function(){
    var cv=document.getElementById('water'), hero=document.getElementById('home');
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gl=cv.getContext('webgl',{premultipliedAlpha:false,antialias:false});
    if(!gl) return;
    var vs='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
    var fs=[
      'precision highp float;varying vec2 v;uniform sampler2D img;uniform vec2 res;uniform vec2 isz;uniform float t;',
      'float h(vec2 q){vec3 p3=fract(vec3(q.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
      'float n2(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);',
      ' return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}',
      'float beam(float a,float c,float wd,float ph,float t){c+=sin(t*.11+ph)*.022;float k=(a-c)/wd;return exp(-k*k)*(.55+.45*sin(t*.32+ph*1.7));}',
      'void main(){',
      ' float ra=res.x/res.y, ia=isz.x/isz.y; vec2 uv=v; vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);',
      ' vec3 col=texture2D(img,vec2(((uv-.5)*s+.5).x,1.-((uv-.5)*s+.5).y)).rgb;',
      /* soft swells rolling along the gradient from the deep water (lower left) toward the sand (upper right), like waves approaching a shore */
      ' vec2 p=vec2(uv.x*ra,uv.y);',
      ' vec2 dir=normalize(vec2(1.,.82)); vec2 per=vec2(-dir.y,dir.x);',
      ' float sN=dot(p,dir)/dot(vec2(ra,1.),dir);',
      ' float q=dot(p,per);',
      ' float ph=6.2832*(sN*2.0+sN*sN*1.1)-t*.5+.30*sin(q*1.6+t*.05)+.12*sin(q*3.7-t*.03);',
      ' float crest=pow(.5+.5*sin(ph),2.3);',
      ' float amp=(.55+.45*smoothstep(.0,.9,sN))*(1.-.4*smoothstep(.92,1.1,sN));',
      ' col*=1.+(crest-.35)*amp*.05;',
      ' col+=vec3(.96,.91,.80)*crest*amp*.05;',
      ' col*=1.-.16*pow(length((uv-.5)*vec2(1.,.9))*1.25,2.2);',
      ' vec2 fp=floor(gl_FragCoord.xy); float gt=t*.5; float gk=floor(gt);',
      ' vec2 f0=fp+gk*vec2(131.7,97.3), f1=fp+(gk+1.)*vec2(131.7,97.3);',
      ' float g0=h(f0)+h(f0+vec2(17.3,41.7))+h(f0+vec2(53.1,7.9))-1.5, g1=h(f1)+h(f1+vec2(17.3,41.7))+h(f1+vec2(53.1,7.9))-1.5;',
      ' col+=mix(g0,g1,smoothstep(0.,1.,fract(gt)))*.026;',
      ' gl_FragColor=vec4(col,1.);}'
    ].join('\n');
    function sh(type,src){var o=gl.createShader(type);gl.shaderSource(o,src);gl.compileShader(o);return gl.getShaderParameter(o,gl.COMPILE_STATUS)?o:null;}
    var a=sh(gl.VERTEX_SHADER,vs), b=sh(gl.FRAGMENT_SHADER,fs); if(!a||!b) return;
    var pr=gl.createProgram(); gl.attachShader(pr,a); gl.attachShader(pr,b); gl.linkProgram(pr);
    if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return; gl.useProgram(pr);
    var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    var lp=gl.getAttribLocation(pr,'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
    var U={res:gl.getUniformLocation(pr,'res'),isz:gl.getUniformLocation(pr,'isz'),t:gl.getUniformLocation(pr,'t')};
    var img=new Image(), ready=false, live=true, t0=performance.now();
    function size(){ var r=hero.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2);
      cv.width=Math.max(2,Math.round(r.width*d)); cv.height=Math.max(2,Math.round(r.height*d)); gl.viewport(0,0,cv.width,cv.height); }
    function draw(now){ gl.uniform2f(U.res,cv.width,cv.height); gl.uniform1f(U.t,(now-t0)/1000+40.); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); }
    var lastF=0; function loop(now){ if(!live) return; if(now-lastF>=32){ lastF=now; draw(now); } requestAnimationFrame(loop); }
    img.onload=function(){
      var tx=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tx);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      try{ gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img); }catch(e){ return; }
      gl.uniform2f(U.isz,img.naturalWidth,img.naturalHeight);
      size(); ready=true; draw(performance.now()); cv.classList.add('on');
      if(reduce) return;
      requestAnimationFrame(loop);
      if('IntersectionObserver' in window) new IntersectionObserver(function(es){ es.forEach(function(e){ var was=live; live=e.isIntersecting; if(live&&!was) requestAnimationFrame(loop); }); }).observe(hero);
    };
    img.src='/img/hero-texture.jpg';
    addEventListener('resize',function(){ if(ready){ size(); draw(performance.now()); } });
  })();
})();
