/* Bānu One Pager. GSAP 3.13.0 ScrollSmoother + ScrollTrigger: Parallax über data-speed (Hero, Becher, Karten Spalten) und Bild Parallax
   im Rahmen (Laden, Run Club), Wort für Wort, Zähler, horizontale Paket Karten mit Pin.
   Alle Bilder sind normale img (nicht lazy), damit die Pin Berechnung stimmt. Nach decode() aller Bilder und den Schriften: ScrollTrigger.refresh().
   Handy und reduzierte Bewegung ("calm"): kein Smoother, kein Pin, Karten per Wischen. Bei reduzierter Bewegung keine Animation. */
(function(){
  if (!window.gsap || !window.ScrollTrigger){ document.documentElement.classList.add("calm"); return; }
  if (window.ScrollSmoother) gsap.registerPlugin(ScrollTrigger, ScrollSmoother); else gsap.registerPlugin(ScrollTrigger);
  var mqM = window.matchMedia("(max-width:900px)");
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var calm = mqM.matches || reduce || !window.ScrollSmoother;
  var bp = mqM.matches;
  if (mqM.addEventListener) mqM.addEventListener("change", function(e){ if (e.matches !== bp) location.reload(); });

  var decodes = [].slice.call(document.images).map(function(im){
    var d = (im.decode ? im.decode() : Promise.resolve()).catch(function(){});
    return Promise.race([d, new Promise(function(r){ setTimeout(r, 4000); })]);
  });
  var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(function(){}) : Promise.resolve();
  Promise.race([Promise.all(decodes.concat([fonts])), new Promise(function(r){ setTimeout(r, 7000); })]).then(start);

  function nav(){
    document.querySelectorAll('.bar a[href^="#"]').forEach(function(a){
      a.addEventListener("click", function(e){
        var t = document.querySelector(a.getAttribute("href")); if (!t) return;
        e.preventDefault(); var sm = window.ScrollSmoother && ScrollSmoother.get();
        if (sm) sm.scrollTo(t, true, "top top"); else t.scrollIntoView({behavior: reduce ? "auto" : "smooth"});
      });
    });
  }

  function start(){
    nav();
    if (reduce){ document.querySelectorAll(".reveal .w").forEach(function(w){ w.style.opacity = 1; }); return; }
    if (!calm) ScrollSmoother.create({ wrapper:"#smooth-wrapper", content:"#smooth-content", smooth:1.1, smoothTouch:0.1, effects:true });

    /* Hero */
    gsap.from(".hero-in .lab, .hero-logo", { y:40, opacity:0, stagger:.12, duration:1.1, ease:"power3.out", delay:.1 });
    gsap.from(".claim span", { yPercent:110, stagger:.16, duration:1, ease:"power3.out", delay:.45 });
    gsap.from(".hero-sub, .pills", { y:24, opacity:0, stagger:.1, duration:.9, delay:.9 });
    gsap.from(".hero-art", { scale:.92, opacity:0, duration:1.3, ease:"power3.out", delay:.3 });
    gsap.from(".float", { y:120, rotate:20, opacity:0, stagger:.15, duration:1.2, ease:"back.out(1.4)", delay:.8 });
    if (calm) gsap.to(".float.f1", { y:-80, rotate:-16, ease:"none", scrollTrigger:{ trigger:".hero", start:"top top", end:"bottom top", scrub:true } });

    /* Wort für Wort */
    document.querySelectorAll(".reveal").forEach(function(el){
      el.innerHTML = el.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w">' + w + ' </span>'; }).join("");
      gsap.to(el.querySelectorAll(".w"), { opacity:1, stagger:.1, ease:"none", scrollTrigger:{ trigger:el, start:"top 82%", end:"bottom 55%", scrub:true } });
    });

    /* Zähler (nur Zählungen, keine Kennzahlen) */
    document.querySelectorAll("[data-n]").forEach(function(el){
      var to = +el.getAttribute("data-n"), o = { v:0 }; if (!to) return;
      el.textContent = "0";
      gsap.to(o, { v:to, duration:1.4, ease:"power2.out", scrollTrigger:{ trigger:el, start:"top 92%", once:true }, onUpdate:function(){ el.textContent = Math.round(o.v); } });
    });

    /* Paket: horizontale Karten mit Pin (Desktop) */
    var tr = document.querySelector(".hz-track");
    if (!calm && tr){
      var dist = function(){ return Math.max(0, tr.scrollWidth - window.innerWidth); };
      gsap.to(tr, { x:function(){ return -dist(); }, ease:"none", scrollTrigger:{ trigger:".hz-pin", start:"top top", end:function(){ return "+=" + (dist() + 200); }, pin:true, scrub:.6, invalidateOnRefresh:true,
        onUpdate:function(s){ gsap.set(".hz-prog span", { scaleX:s.progress }); } } });
    }

    /* Köpfe, Sticker, Gerichte */
    gsap.utils.toArray(".kt-head > *, .ld-head > *, .ln-head > *, .zh-head > *, .eh-head > *, .wt-head > *, .rc-in > *").forEach(function(el){
      gsap.from(el, { y:50, opacity:0, duration:1, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 90%", once:true } });
    });
    gsap.from(".stk", { y:80, opacity:0, stagger:.07, duration:.9, ease:"power3.out", scrollTrigger:{ trigger:".stk-row", start:"top 88%", once:true } });
    gsap.utils.toArray(".dc-img img").forEach(function(im){
      gsap.fromTo(im, { scale:1.14 }, { scale:1, ease:"none", scrollTrigger:{ trigger:im.parentNode, start:"top bottom", end:"bottom 30%", scrub:true } });
    });

    /* Bild Parallax im Rahmen */
    gsap.utils.toArray(".fr img, .rc-img img").forEach(function(im){
      gsap.fromTo(im, { yPercent:-7 }, { yPercent:7, ease:"none", scrollTrigger:{ trigger:im.parentNode, start:"top bottom", end:"bottom top", scrub:true } });
    });

    gsap.utils.toArray(".eh, .sp, .sz, .pt, .notes p").forEach(function(el, i){
      gsap.from(el, { y:44, opacity:0, duration:.85, delay:(i % 3) * .07, ease:"power3.out", scrollTrigger:{ trigger:el, start:"top 94%", once:true } });
    });
    gsap.from(".end-logo", { rotate:-90, scale:.7, opacity:0, scrollTrigger:{ trigger:".kontakt", start:"top 85%", end:"top 35%", scrub:true } });

    ScrollTrigger.refresh();
    window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
    setTimeout(function(){ ScrollTrigger.refresh(); }, 1200);
  }
})();
