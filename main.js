/* SkyLab IA Community · LP Personagem que Vende
   Vanilla, sem dependências. */
(function () {
  "use strict";

  /* ── Configuração: troque aqui, num lugar só ───────────────── */
  var COMMUNITY_URL = "https://pay.kiwify.com.br/1VOMmqt"; // SkyLab IA Community + ebook · R$ 97 (fundador)
  var EBOOK_URL = "https://pay.kiwify.com.br/6oCzApc";     // só o ebook Personagem que Vende · R$ 19,90
  var DEADLINE = new Date("2026-11-30T23:59:59-03:00"); // fim da edição de fundação (Brasília)
  var PASS_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "sck"];

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Checkout: dois links, UTMs repassadas ─────────────────── */
  // data-cta="<posição>-community" usa COMMUNITY_URL; "<posição>-ebook" usa EBOOK_URL
  var OFFERS = {
    community: { url: COMMUNITY_URL, value: 97, name: "SkyLab IA Community + Ebook" },
    ebook: { url: EBOOK_URL, value: 19.9, name: "Ebook Personagem que Vende" }
  };
  function withParams(base) {
    var url;
    try { url = new URL(base); } catch (e) { return base; }
    var here = new URLSearchParams(window.location.search);
    PASS_PARAMS.forEach(function (k) {
      var v = here.get(k);
      if (v && !url.searchParams.has(k)) url.searchParams.set(k, v);
    });
    return url.toString();
  }
  document.querySelectorAll("[data-cta]").forEach(function (a) {
    var cta = a.getAttribute("data-cta");
    var offer = OFFERS[cta.split("-").pop()];
    if (!offer) return;
    a.setAttribute("href", withParams(offer.url));
    a.addEventListener("click", function () {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "begin_checkout", cta_position: cta, value: offer.value, currency: "BRL", item_name: offer.name });
      if (typeof window.fbq === "function") {
        window.fbq("track", "InitiateCheckout", { value: offer.value, currency: "BRL", content_name: offer.name, cta_position: cta });
      }
    });
  });

  /* ── Contador do prazo real ────────────────────────────────── */
  var countShort = document.querySelector("[data-countdown]");
  var countLong = document.querySelector("[data-countdown-long]");
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function closeFounding() {
    document.querySelectorAll("[data-closed-text]").forEach(function (el) {
      el.textContent = el.getAttribute("data-closed-text");
    });
    document.querySelectorAll("[data-closed-hide]").forEach(function (el) { el.hidden = true; });
    if (countShort) countShort.hidden = true;
    if (countLong) countLong.textContent = "EDIÇÃO DE FUNDAÇÃO ENCERRADA";
    doc.classList.add("is-closed");
  }
  function tick() {
    var ms = DEADLINE.getTime() - Date.now();
    if (ms <= 0) { closeFounding(); return false; }
    var m = Math.floor(ms / 60000);
    var d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mi = m % 60;
    var shortTxt = "FECHA EM " + d + "D " + pad(h) + "H " + pad(mi) + "M";
    if (countShort) { countShort.textContent = shortTxt; countShort.hidden = false; }
    if (countLong) countLong.textContent = shortTxt + " · 30/11 ÀS 23:59";
    return true;
  }
  if (tick()) {
    var timer = setInterval(function () { if (!tick()) clearInterval(timer); }, 30000);
  }

  /* ── Timecode do quadro 9:16: 00:00 → 00:08 ───────────────── */
  var tc = document.querySelector("[data-timecode]");
  if (tc && !reduceMotion) {
    var s = 0;
    tc.textContent = "00:00";
    setInterval(function () {
      s = s >= 8 ? 0 : s + 1;
      tc.textContent = "00:0" + s;
    }, 1000);
  }

  /* ── Linha do tempo dos capítulos ─────────────────────────── */
  var clips = document.querySelectorAll(".chapters-tl .clip");
  var chapters = document.querySelectorAll(".chapters li");
  function setChapter(i) {
    clips.forEach(function (c, j) { c.classList.toggle("on", j === i); });
    chapters.forEach(function (c, j) { c.classList.toggle("is-on", j === i); });
  }
  chapters.forEach(function (li) {
    var i = parseInt(li.getAttribute("data-ch"), 10);
    li.addEventListener("mouseenter", function () { setChapter(i); });
    li.addEventListener("click", function () { setChapter(i); });
  });

  /* ── Lightbox (dialog nativo: Esc fecha, foco preso no modal, setas navegam) ─ */
  var box = document.getElementById("lightbox");
  if (box && typeof box.showModal === "function") {
    var boxImg = document.getElementById("lightbox-img");
    var boxCap = document.getElementById("lightbox-cap");
    var boxCount = document.getElementById("lightbox-count");
    var lbPrev = box.querySelector("[data-lb-prev]");
    var lbNext = box.querySelector("[data-lb-next]");
    var group = [], at = 0, opener = null;
    var show = function (i) {
      at = (i + group.length) % group.length;
      var btn = group[at], img = btn.querySelector("img"), cap = btn.closest("figure").querySelector("figcaption");
      boxImg.hidden = false;
      boxImg.src = img.currentSrc || img.src;
      boxImg.width = img.naturalWidth || img.width;
      boxImg.height = img.naturalHeight || img.height;
      boxImg.alt = img.alt;
      boxCap.textContent = cap ? cap.textContent : "";
      boxCount.textContent = group.length > 1 ? (at + 1) + " / " + group.length : "";
      lbPrev.hidden = lbNext.hidden = group.length < 2;
    };
    document.querySelectorAll("[data-gallery]").forEach(function (gal) {
      var shots = Array.prototype.slice.call(gal.querySelectorAll(".shot"));
      shots.forEach(function (btn, i) {
        btn.addEventListener("click", function () {
          group = shots; opener = btn; show(i);
          box.showModal();
          box.querySelector("[data-close]").focus();
        });
      });
    });
    lbPrev.addEventListener("click", function () { show(at - 1); });
    lbNext.addEventListener("click", function () { show(at + 1); });
    box.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); show(at - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); show(at + 1); }
    });
    box.querySelector("[data-close]").addEventListener("click", function () { box.close(); });
    box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
    box.addEventListener("close", function () {
      boxImg.hidden = true; boxImg.removeAttribute("src");
      var target = group[at] || opener;
      if (target) { target.scrollIntoView({ block: "nearest", inline: "nearest" }); target.focus({ preventScroll: true }); }
    });
  }

  /* ── Carrossel de prints: scroll-snap nativo + setas, contador, arrastar com o mouse ─ */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var track = car.querySelector("[data-car-track]");
    var slides = track.querySelectorAll(".carousel__slide");
    var prev = car.querySelector("[data-car-prev]"), next = car.querySelector("[data-car-next]");
    var idx = car.querySelector("[data-car-index]"), total = car.querySelector("[data-car-total]");
    total.textContent = slides.length;
    var step = function () { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; };
    var current = function () { return Math.round(track.scrollLeft / step()); };
    var maxScroll = function () { return track.scrollWidth - track.clientWidth - 2; };
    var go = function (i) { track.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, i)) * step(), behavior: reduceMotion ? "auto" : "smooth" }); };
    var refresh = function () {
      idx.textContent = Math.min(slides.length, current() + 1);
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= maxScroll();
    };
    prev.addEventListener("click", function () { go(current() - 1); });
    next.addEventListener("click", function () { go(current() + 1); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(refresh); }, { passive: true });
    window.addEventListener("resize", refresh);
    track.addEventListener("keydown", function (e) {
      if (e.target !== track) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(current() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(current() - 1); }
    });
    // arrastar com o mouse (toque e trackpad já rolam nativamente)
    var down = false, moved = false, startX = 0, startLeft = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add("is-dragging"); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      if (moved) {
        var target = Math.round(track.scrollLeft / step());
        track.classList.remove("is-dragging");
        go(target);
      }
    });
    // um arraste não deve abrir o lightbox
    track.addEventListener("click", function (e) { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });
    refresh();
  });

  /* ── Contagem dos números do placar (valores finais já estão no HTML) ─ */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    var fmt = function (v, d) { return v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); };
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var el = en.target, end = parseFloat(el.getAttribute("data-count")), d = parseInt(el.getAttribute("data-decimals"), 10) || 0;
        // passou direto (rolagem rápida ou link de âncora): mostra o valor final, sem animar
        if (!en.isIntersecting && en.boundingClientRect.bottom < 0) { co.unobserve(el); el.textContent = fmt(end, d); return; }
        if (!en.isIntersecting) return;
        co.unobserve(el);
        var t0 = performance.now(), dur = 1200;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(p === 1 ? end : end * e, d);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0 });
    counters.forEach(function (el) {
      // só anima o que ainda não está na tela; o resto fica com o valor final
      if (el.getBoundingClientRect().top > window.innerHeight) { el.textContent = fmt(0, parseInt(el.getAttribute("data-decimals"), 10) || 0); co.observe(el); }
    });
  }

  /* ── Inclinação 3D que segue o ponteiro (só desktop com mouse, sem reduced motion) ─ */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt")) || 5;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", (x * 2 * max).toFixed(2) + "deg");
        el.style.setProperty("--rx", (-y * 2 * max).toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });
  }

  /* ── Barra fixa: aparece quando o hero sai da tela ────────── */
  var sticky = document.querySelector("[data-sticky]");
  var hero = document.querySelector(".hero");
  var final = document.getElementById("final");
  var offer = document.getElementById("oferta");
  var simSec = document.getElementById("simulador");
  if (sticky && hero && "IntersectionObserver" in window) {
    var state = { hero: true, final: false, offer: false, sim: false };
    var update = function () {
      var on = !state.hero && !state.final && !state.offer && !state.sim;
      sticky.classList.toggle("is-on", on);
      sticky.setAttribute("aria-hidden", on ? "false" : "true");
      sticky.querySelectorAll("a").forEach(function (link) {
        if (on) link.removeAttribute("tabindex"); else link.setAttribute("tabindex", "-1");
      });
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target === hero) state.hero = e.isIntersecting;
        if (e.target === final) state.final = e.isIntersecting;
        if (e.target === offer) state.offer = e.isIntersecting;
        if (e.target === simSec) state.sim = e.isIntersecting;
      });
      update();
    });
    if (simSec) io.observe(simSec);
    io.observe(hero);
    if (final) io.observe(final);
    if (offer) io.observe(offer);
  }

  /* ── Desenhos que se traçam ao entrar na tela ([data-draw]) ── */
  // Sem JS ou com reduced motion o desenho já aparece completo: a classe que esconde os traços só entra aqui.
  var draws = document.querySelectorAll("[data-draw]");
  if (draws.length && !reduceMotion && "IntersectionObserver" in window) {
    var dio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-drawn"); dio.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    draws.forEach(function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add("draw-wait"); dio.observe(el); }
    });
  }

  /* ── Fade sutil das seções abaixo da dobra ─────────────────── */
  // Só depois que a página carregou e só nos blocos que ainda estão fora da tela,
  // para não custar nada no carregamento nem esconder o que já está visível.
  if (!reduceMotion && "IntersectionObserver" in window) {
    var startReveal = function () {
      var seen = new IntersectionObserver(function (entries) {
        seen.disconnect();
        var below = entries.filter(function (e) { return !e.isIntersecting && e.boundingClientRect.top > 0; });
        if (!below.length) return;
        doc.classList.add("js-motion");
        var ro = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add("is-in"); ro.unobserve(e.target); }
          });
        }, { rootMargin: "0px 0px -10% 0px" });
        below.forEach(function (e) { e.target.classList.add("reveal"); ro.observe(e.target); });
      });
      document.querySelectorAll("main > .section > .wrap, .final__in").forEach(function (el) { seen.observe(el); });
    };
    if (document.readyState === "complete") startReveal();
    else window.addEventListener("load", startReveal);
  }
})();
