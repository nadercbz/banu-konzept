/* Bānu Gäste Website. Technik wie bei den anderen Konzepten (GSAP ScrollSmoother, ScrollTrigger, Scroll Video als Blob), Optik neu.
   Zeichen der Marke: der Strich über dem a. Er zeichnet sich im Hero, wird beim Scrollen zur Horizontlinie und führt in die Seite. */
(function(){
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var mobil = window.matchMedia("(max-width:700px)").matches;
  var v = document.getElementById("v-build"), num = document.querySelector(".ld-num span"), bar = document.querySelector(".ld-bar i");

  function zeige(p){ num.textContent = p; bar.style.width = p + "%"; }
  function loadVideo(){
    var url = v.getAttribute(mobil ? "data-src-m" : "data-src");
    return fetch(url).then(function(r){
      if(!r.ok || !r.body) throw 0;
      var total = +r.headers.get("content-length") || 4e6, got = 0, reader = r.body.getReader(), ch = [];
      function pump(){ return reader.read().then(function(x){ if(x.done) return new Blob(ch, {type:"video/mp4"}); ch.push(x.value); got += x.value.length; zeige(Math.min(99, Math.round(got / total * 100))); return pump(); }); }
      return pump();
    }).then(function(b){
      v.preload = "auto"; v.src = URL.createObjectURL(b); v.load();
      return new Promise(function(res){ function ok(){ try{ v.currentTime = .001 }catch(e){} res() } if(v.readyState >= 1) return ok(); v.addEventListener("loadedmetadata", ok, {once:true}); setTimeout(res, 2500); });
    }).catch(function(){ v.src = v.getAttribute(mobil ? "data-src-m" : "data-src"); });
  }
  var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(function(){}) : Promise.resolve();
  var imgs = [].slice.call(document.querySelectorAll(".cd img,.bw img,.par img,.tx-img img,.tx-thumb")).map(function(im){ var d = (im.decode ? im.decode() : Promise.resolve()).catch(function(){}); return Promise.race([d, new Promise(function(r){ setTimeout(r, 3000) })]); });
  Promise.race([Promise.all([loadVideo(), fonts].concat(imgs)), new Promise(function(r){ setTimeout(r, 20000) })]).then(start);

  function scrubber(el){ var target = 0, cur = 0; gsap.ticker.add(function(){ if(!el.duration) return; cur += (target - cur) * .3; if(Math.abs(el.currentTime - cur) > .012){ try{ el.currentTime = cur }catch(e){} } }); return function(p){ if(el.duration) target = Math.max(0, Math.min(el.duration - .05, p * el.duration)); }; }

  function start(){
    zeige(100);
    document.getElementById("loader").classList.add("done"); document.body.classList.remove("loading");
    if(!reduce) ScrollSmoother.create({wrapper:"#smooth-wrapper", content:"#smooth-content", smooth:1.1, smoothTouch:.1, effects:true, normalizeScroll:false, ignoreMobileResize:true});

    /* Hero: erst der Strich, dann die Buchstaben, dann der Claim */
    var mk = document.querySelector(".hero-logo .makron"), paths = document.querySelectorAll(".hero-logo path");
    gsap.set(mk, {scaleX:0});
    gsap.timeline({delay:.15})
      .to(mk, {scaleX:1, duration:1.1, ease:"power3.inOut"})
      .from(paths, {yPercent:30, opacity:0, stagger:.08, duration:.8, ease:"power3.out"}, "-=.45")
      .from(".claim span", {yPercent:110, duration:.9, ease:"power3.out"}, "-=.35")
      .from(".hero-kicker,.hero-sub", {opacity:0, y:12, stagger:.1, duration:.6}, "-=.4");

    /* Beim Scrollen: Logo zieht sich zurück, der Strich wird zur Horizontlinie über die ganze Breite */
    gsap.timeline({scrollTrigger:{trigger:".hero", start:"top top", end:"+=" + (mobil ? 700 : 1000), pin:true, scrub:true}})
      .to(".hero-logo path", {opacity:0, yPercent:-12, stagger:.02, ease:"none", duration:.5}, 0)
      .to(".claim,.hero-kicker,.hero-sub,.scroll-hint", {opacity:0, ease:"none", duration:.35}, 0)
      .to(".horizont", {scaleX:1, ease:"power2.inOut", duration:.6}, .25)
      .to(mk, {opacity:0, duration:.2}, .3)
      .to(".hero-bg", {scale:1.08, ease:"none", duration:1}, 0)
      .to(".horizont", {yPercent:-50, scaleY:.25, opacity:.0, ease:"none", duration:.25}, .8);

    /* Text Wort für Wort */
    document.querySelectorAll(".reveal").forEach(function(el){
      el.innerHTML = el.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w">' + w + ' </span>' }).join("");
      gsap.to(el.querySelectorAll(".w"), {opacity:1, stagger:.1, ease:"none", scrollTrigger:{trigger:el, start:"top 82%", end:"bottom 52%", scrub:true}});
    });
    gsap.from(".facts li", {y:60, opacity:0, stagger:.12, scrollTrigger:{trigger:".facts", start:"top 92%", end:"top 62%", scrub:true}});

    /* Herzstück: Zutaten fliegen in den Becher, Video wird vor und zurück gespult */
    var setV = scrubber(v), labels = gsap.utils.toArray(".labels li"), VS = .12, VE = .88;
    var tl = gsap.timeline({scrollTrigger:{trigger:".bd-pin", start:"top top", end:"+=" + (mobil ? 2200 : 2800), pin:true, scrub:true, onUpdate:function(s){ setV(Math.max(0, Math.min(1, (s.progress - VS) / (VE - VS)))) }}});
    tl.to({}, {duration:1}, 0);
    labels.forEach(function(l, i){
      tl.fromTo(l, {opacity:0, x:-24}, {opacity:1, x:0, duration:.05, ease:"power2.out"}, .04 + i * .06);
      var out = parseFloat(l.getAttribute("data-out"));
      tl.to(l, {opacity:.35, duration:.04}, VS + out * (VE - VS));
    });
    tl.fromTo(".bd-done", {opacity:0, y:30, rotate:4}, {opacity:1, y:0, rotate:-3, duration:.06}, VE - .02);

    /* Smoothies 01 bis 07 horizontal */
    var tr = document.querySelector(".cd-track");
    function dist(){ return Math.max(0, tr.scrollWidth - window.innerWidth) }
    gsap.to(tr, {x:function(){ return -dist() }, ease:"none", scrollTrigger:{trigger:".cd-pin", start:"top top", end:function(){ return "+=" + (dist() + 200) }, pin:true, scrub:true, invalidateOnRefresh:true}});
    gsap.utils.toArray(".cd").forEach(function(c){
      gsap.fromTo(c.querySelector(".st"), {yPercent:30, rotate:0}, {yPercent:0, rotate:-2, ease:"none", scrollTrigger:{trigger:".cd-pin", start:"top top", end:"+=1600", scrub:true}});
    });
    gsap.from(".cd-head > *", {y:50, opacity:0, stagger:.1, scrollTrigger:{trigger:".smoothies", start:"top 80%", end:"top 30%", scrub:true}});

    /* Bowls mit Parallax */
    gsap.utils.toArray(".bw").forEach(function(b, i){
      gsap.from(b, {y:80 + (i % 2) * 40, opacity:0, scrollTrigger:{trigger:b, start:"top 95%", end:"top 60%", scrub:true}});
      var im = b.querySelector("img"); gsap.fromTo(im, {scale:1.15}, {scale:1, ease:"none", scrollTrigger:{trigger:b, start:"top bottom", end:"bottom top", scrub:true}});
    });
    gsap.from(".bw-head > *", {y:50, opacity:0, stagger:.1, scrollTrigger:{trigger:".bowls", start:"top 75%", end:"top 35%", scrub:true}});

    /* Toasts: das Bild wechselt mit der Zeile in der Mitte */
    var tImgs = {}; document.querySelectorAll(".tx-img").forEach(function(d){ tImgs[d.getAttribute("data-id")] = d });
    function setT(id, li){ for(var k in tImgs) tImgs[k].classList.toggle("on", k === id); document.querySelectorAll(".tx-list li").forEach(function(x){ x.classList.toggle("akt", x === li) }); }
    document.querySelectorAll(".tx-list li").forEach(function(li){
      ScrollTrigger.create({trigger:li, start:"top 62%", end:"bottom 62%", onToggle:function(s){ if(s.isActive) setT(li.getAttribute("data-img"), li) }});
      li.addEventListener("mouseenter", function(){ setT(li.getAttribute("data-img"), li) });
    });
    /* Desktop: Bild bleibt stehen, während die Liste läuft (sticky geht mit ScrollSmoother nicht, darum Pin). Handy: Bild je Zeile */
    ScrollTrigger.matchMedia({"(min-width:901px)":function(){
      ScrollTrigger.create({trigger:".tx-in", start:"top 12%", end:function(){ var l = document.querySelector(".tx-list"), b = document.querySelector(".tx-bild"); return "+=" + Math.max(0, l.offsetHeight - b.offsetHeight) }, pin:".tx-bild", pinSpacing:false, invalidateOnRefresh:true});
    }});

    /* Run Club, Laden, Saison */
    gsap.fromTo(".rc-img picture", {yPercent:-6}, {yPercent:6, ease:"none", scrollTrigger:{trigger:".runclub", start:"top bottom", end:"bottom top", scrub:true}});
    gsap.from(".rc-txt > *", {y:50, opacity:0, stagger:.1, scrollTrigger:{trigger:".runclub", start:"top 40%", end:"center 40%", scrub:true}});
    gsap.utils.toArray(".par img").forEach(function(img){ gsap.fromTo(img, {yPercent:-6, scale:1.1}, {yPercent:0, scale:1, ease:"none", scrollTrigger:{trigger:img.closest(".par"), start:"top bottom", end:"bottom top", scrub:true}}) });
    gsap.from(".ld-head > *", {y:50, opacity:0, stagger:.1, scrollTrigger:{trigger:".laden", start:"top 80%", end:"top 40%", scrub:true}});
    gsap.from(".ss", {y:60, opacity:0, stagger:.12, scrollTrigger:{trigger:".ss-grid", start:"top 90%", end:"top 55%", scrub:true}});
    gsap.to(".bs-stempel", {rotate:180, ease:"none", scrollTrigger:{trigger:".besuch", start:"top bottom", end:"bottom top", scrub:true}});
    gsap.from(".end-logo", {scale:.8, opacity:0, scrollTrigger:{trigger:".end", start:"top 85%", end:"top 40%", scrub:true}});

    /* Menüleiste: leichter Verlauf, sobald gescrollt */
    var hb = document.querySelector(".bar");
    ScrollTrigger.create({start:80, end:"max", onToggle:function(s){ hb.classList.toggle("scrolled", s.isActive) }});

    /* Handy Menü */
    var mb = document.querySelector(".bar-menu"), mn = document.querySelector(".mnav");
    mb.addEventListener("click", function(){ var auf = mb.getAttribute("aria-expanded") !== "true"; mb.setAttribute("aria-expanded", auf); mn.hidden = !auf; });
    document.querySelectorAll('.bar a[href^="#"],.mnav a').forEach(function(a){ a.addEventListener("click", function(e){ var t = document.querySelector(a.getAttribute("href")); if(!t) return; e.preventDefault(); mn.hidden = true; mb.setAttribute("aria-expanded", "false"); var sm = ScrollSmoother.get(); if(sm) sm.scrollTo(t, true, "top top"); else t.scrollIntoView({behavior:"smooth"}); }) });

    ScrollTrigger.refresh(); window.addEventListener("load", function(){ ScrollTrigger.refresh() });
  }
})();
