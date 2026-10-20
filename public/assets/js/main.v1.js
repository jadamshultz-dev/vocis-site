/* VOCIS — hero light field, load sequence, reveals, nav state. No dependencies. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Hero light field ---------- */

  var canvas = document.getElementById("field");
  var ctx = canvas && canvas.getContext("2d", { alpha: false });

  var GLOW = ["#1C2735", "#2D3E52", "#8D7B62", "#D8C5A4"];

  /* Haze: no single source. Slow navy drift with a faint warm edge in the far corner.
     x, y: base centre (0–1). ax, ay: drift amplitude. p: period in seconds.
     r: radius as a share of the longer side. sy: vertical squash. a: strength.
     warm: laid over the field rather than added, so it reads as sand, not grey. */
  var BLOOMS = [
    { c: GLOW[1], x: 0.28, y: 0.34, ax: 0.16, ay: 0.10, p: 47, ph: 0.0, r: 0.60, sy: 0.70, a: 0.62 },
    { c: GLOW[1], x: 0.72, y: 0.56, ax: 0.14, ay: 0.12, p: 39, ph: 2.1, r: 0.52, sy: 0.75, a: 0.48 },
    { c: GLOW[1], x: 0.52, y: 0.88, ax: 0.18, ay: 0.06, p: 58, ph: 4.0, r: 0.48, sy: 0.55, a: 0.40 },
    { c: GLOW[2], x: 0.94, y: 0.96, ax: 0.04, ay: 0.03, p: 44, ph: 1.2, r: 0.70, sy: 0.55, a: 0.30, warm: true }
  ];

  var W = 0, H = 0, running = false, visible = true, raf = 0, t0 = 0;

  function hexToRgb(h) {
    var n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  BLOOMS.forEach(function (b) { b.rgb = hexToRgb(b.c); });

  function size() {
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    /* Low internal resolution, scaled up and blurred by CSS. */
    var scale = Math.min(1, 220 / Math.max(rect.width, 1));
    W = Math.max(64, Math.round(rect.width * scale));
    H = Math.max(48, Math.round(rect.height * scale));
    canvas.width = W;
    canvas.height = H;
  }

  function ease(x) { return x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3); }

  function draw(sec, rise) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = GLOW[0];
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "screen";

    var L = Math.max(W, H);
    for (var i = 0; i < BLOOMS.length; i++) {
      var b = BLOOMS[i];
      var w = (sec / b.p) * Math.PI * 2 + b.ph;
      /* Lissajous drift: sine paths are eased by nature. */
      var cx = (b.x + Math.sin(w) * b.ax) * W;
      var cy = (b.y + Math.sin(w * 0.73 + 1.1) * b.ay) * H;
      var breath = 0.88 + 0.12 * Math.sin(w * 1.31 + 0.4);
      var a = b.a * breath * rise;
      var r = b.r * L;

      ctx.globalCompositeOperation = b.warm ? "source-over" : "screen";
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, b.sy);
      var g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      var c = b.rgb;
      g.addColorStop(0, "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a.toFixed(3) + ")");
      g.addColorStop(0.45, "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + (a * 0.42).toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + c[0] + "," + c[1] + "," + c[2] + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    }
  }

  function frame(now) {
    if (!running) return;
    var sec = (now - t0) / 1000;
    /* The light rises over the first ~2s, once. */
    var rise = ease((sec - 0.1) / 2.0);
    draw(sec + 12, rise);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!ctx || running || reduce.matches || !visible || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function still() {
    if (!ctx) return;
    draw(24, 1);
  }

  if (ctx) {
    size();
    t0 = performance.now();

    if (reduce.matches) still();
    else { draw(12, 0); start(); }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        size();
        if (!running) still();
      }, 120);
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        visible ? start() : stop();
      }).observe(canvas);
    }

    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    var onMotionChange = function () {
      if (reduce.matches) { stop(); still(); } else start();
    };
    reduce.addEventListener ? reduce.addEventListener("change", onMotionChange) : reduce.addListener(onMotionChange);

  }

  /* ---------- Load sequence (runs once) ---------- */

  var began = false;
  function begin() {
    if (began) return;
    began = true;
    requestAnimationFrame(function () {
      doc.classList.add("is-ready");
      setTimeout(function () { doc.classList.add("is-settled"); }, 4200);
    });
  }
  /* Wait briefly for fonts so the wordmark doesn't swap mid-reveal. */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(begin);
    setTimeout(begin, 700);
  } else {
    begin();
  }

  /* ---------- Navigation state ---------- */

  var nav = document.getElementById("nav");
  var hero = document.querySelector(".hero");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      nav.classList.toggle("is-scrolled", y > 24);
      nav.classList.toggle("is-past", y > hero.offsetHeight * 0.55);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  if ("IntersectionObserver" in window) {
    var current = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + e.target.id;
          a.classList.toggle("is-current", on);
          on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".chapter").forEach(function (s) { current.observe(s); });

    /* Clear the highlight while the hero is in view. */
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && entries[0].intersectionRatio > 0.5) {
        links.forEach(function (a) { a.classList.remove("is-current"); a.removeAttribute("aria-current"); });
      }
    }, { threshold: [0.5] }).observe(hero);
  }

  /* ---------- Reveal on scroll ---------- */

  var items = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduce.matches) {
    items.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty("--i", batch++);
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }
})();
