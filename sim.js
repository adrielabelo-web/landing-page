/* SkyLab · Simulador de vendas
   calc() é uma função pura; o resto liga a interface. Script clássico (funciona em file:// e em qualquer host). */
(function (root) {
  "use strict";

  var LIMITS = {
    views: { min: 50000, max: 10000000, step: 50000, def: 1000000 },
    ctr: { min: 0.05, max: 1, step: 0.05, def: 0.2 },      // % de quem assiste e chega ao checkout
    conv: { min: 1, max: 8, step: 0.5, def: 2.5 },         // % de quem chega ao checkout e compra
    price: { min: 9.9, max: 49.9, step: 0.01, def: 19.9 }  // R$
  };

  /** Função pura. ctr e conv em porcentagem. Vendas e cliques arredondados para baixo; dinheiro em 2 casas. */
  function calc(o) {
    var EPS = 1e-6;
    var clicks = Math.floor(o.views * o.ctr / 100 + EPS);
    var sales = Math.floor(clicks * o.conv / 100 + EPS);
    var perDay = sales / 30;
    var revenue = Math.round(sales * o.price * 100) / 100;
    return { clicks: clicks, sales: sales, perDay: perDay, revenue: revenue };
  }

  var api = { calc: calc, LIMITS: LIMITS };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SkySim = api;
  if (typeof document === "undefined") return;

  /* ── Interface ───────────────────────────────────────────── */
  var el = document.querySelector("[data-sim]");
  if (!el) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  var money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  var dec = function (d) { return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }); };

  var state = { views: LIMITS.views.def, ctr: LIMITS.ctr.def, conv: LIMITS.conv.def, price: LIMITS.price.def };

  function clamp(v, k) { return Math.min(LIMITS[k].max, Math.max(LIMITS[k].min, v)); }
  function parseNum(s) {
    s = String(s).trim().replace(/\s/g, "").replace(/[^\d.,]/g, "");
    if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");          // 1.000,50 ou 0,2
    else if ((s.match(/\./g) || []).length > 1 || /\.\d{3}$/.test(s)) s = s.replace(/\./g, ""); // 1.000.000
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }
  function short(v) { return v >= 1e6 ? dec(v % 1e6 ? 2 : 0).format(v / 1e6).replace(/,?0+$/, "") + " mi" : nf0.format(v / 1000) + " mil"; }
  var fmtField = {
    views: function (v) { return nf0.format(v); },
    ctr: function (v) { return dec(2).format(v).replace(/0$/, ""); },
    conv: function (v) { return nf1.format(v); },
    price: function (v) { return dec(2).format(v); }
  };

  var fields = {};
  ["views", "ctr", "conv", "price"].forEach(function (k) {
    fields[k] = {
      range: el.querySelector('[data-sim-range="' + k + '"]'),
      text: el.querySelector('[data-sim-text="' + k + '"]'),
      show: el.querySelector('[data-sim-show="' + k + '"]')
    };
  });
  var priceMsg = el.querySelector("[data-sim-price-msg]");
  var chips = el.querySelectorAll("[data-sim-chip]");

  function paintRange(k) {
    var r = fields[k].range;
    if (!r) return;
    r.value = state[k];
    var pct = (state[k] - LIMITS[k].min) / (LIMITS[k].max - LIMITS[k].min) * 100;
    r.style.setProperty("--fill", pct + "%");
  }
  function sync(k, from) {
    if (from !== "text" && fields[k].text) fields[k].text.value = fmtField[k](state[k]);
    if (from !== "range") paintRange(k); else paintRange(k);
    if (fields[k].show) fields[k].show.textContent = k === "views" ? short(state.views) : k === "price" ? money.format(state.price) : fmtField[k](state[k]) + "%";
    if (k === "price") chips.forEach(function (c) { c.setAttribute("aria-pressed", String(Math.abs(parseFloat(c.getAttribute("data-sim-chip")) - state.price) < 0.001)); });
    render();
  }

  ["views", "ctr", "conv", "price"].forEach(function (k) {
    var f = fields[k];
    if (f.range) f.range.addEventListener("input", function () { state[k] = parseFloat(f.range.value); if (k === "price" && priceMsg) priceMsg.textContent = ""; sync(k, "range"); });
    if (f.text) {
      f.text.addEventListener("input", function () {
        var n = parseNum(f.text.value);
        if (n === null) return;
        if (k === "price" && priceMsg) priceMsg.textContent = n > LIMITS.price.max ? "Até R$ 49,90 para manter o produto de entrada." : n < LIMITS.price.min ? "O mínimo é R$ 9,90." : "";
        state[k] = clamp(n, k);
        sync(k, "text");
      });
      f.text.addEventListener("change", function () { f.text.value = fmtField[k](state[k]); });
      f.text.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); f.text.value = fmtField[k](state[k]); } });
    }
  });
  chips.forEach(function (c) {
    c.addEventListener("click", function () { state.price = parseFloat(c.getAttribute("data-sim-chip")); if (priceMsg) priceMsg.textContent = ""; sync("price"); });
  });

  /* Saídas animadas */
  var outs = {
    clicks: { el: el.querySelector('[data-sim-out="clicks"]'), fmt: function (v) { return nf0.format(Math.round(v)); }, cur: 0 },
    sales: { el: el.querySelector('[data-sim-out="sales"]'), fmt: function (v) { return nf0.format(Math.round(v)); }, cur: 0 },
    perDay: { el: el.querySelector('[data-sim-out="perDay"]'), fmt: function (v) { return nf1.format(v); }, cur: 0 },
    revenue: { el: el.querySelector('[data-sim-out="revenue"]'), fmt: function (v) { return money.format(v); }, cur: 0 }
  };
  var anim = null;
  function animateTo(target) {
    var from = {}; Object.keys(outs).forEach(function (k) { from[k] = outs[k].cur; });
    if (anim) cancelAnimationFrame(anim);
    if (reduce) { Object.keys(outs).forEach(function (k) { outs[k].cur = target[k]; outs[k].el.textContent = outs[k].fmt(target[k]); }); return; }
    var t0 = performance.now(), dur = 300;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      Object.keys(outs).forEach(function (k) {
        outs[k].cur = from[k] + (target[k] - from[k]) * e;
        outs[k].el.textContent = outs[k].fmt(p === 1 ? target[k] : outs[k].cur);
      });
      if (p < 1) anim = requestAnimationFrame(step); else Object.keys(outs).forEach(function (k) { outs[k].cur = target[k]; });
    })(t0);
  }

  /* Gráfico de 30 dias: faturamento acumulado, dia de hoje destacado */
  var svg = el.querySelector("[data-sim-chart]");
  var chartCap = el.querySelector("[data-sim-chart-cap]");
  var today = Math.min(30, new Date().getDate());
  function draw(revenue) {
    if (!svg) return;
    var W = 300, H = 110, gap = 2, bw = (W - gap * 29) / 30, ns = "http://www.w3.org/2000/svg";
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    for (var d = 1; d <= 30; d++) {
      var v = revenue * d / 30, h = revenue > 0 ? Math.max(2, (v / revenue) * (H - 4)) : 2;
      var r = document.createElementNS(ns, "rect");
      r.setAttribute("x", ((d - 1) * (bw + gap)).toFixed(2));
      r.setAttribute("y", (H - h).toFixed(2));
      r.setAttribute("width", bw.toFixed(2));
      r.setAttribute("height", h.toFixed(2));
      r.setAttribute("rx", "1.5");
      r.setAttribute("class", d === today ? "bar bar--today" : d < today ? "bar bar--past" : "bar");
      svg.appendChild(r);
    }
    svg.setAttribute("aria-label", "Faturamento acumulado em 30 dias, chegando a " + money.format(revenue));
    if (chartCap) chartCap.textContent = "Dia " + today + ": " + money.format(Math.round(revenue * today / 30 * 100) / 100) + " acumulados";
  }

  var live = el.querySelector("[data-sim-live]");
  var liveT = null;
  function render() {
    var r = calc(state);
    animateTo(r);
    draw(r.revenue);
    if (live) {
      clearTimeout(liveT);
      liveT = setTimeout(function () {
        live.textContent = nf0.format(r.clicks) + " cliques, " + nf0.format(r.sales) + " vendas por mês, faturamento estimado de " + money.format(r.revenue) + " por mês.";
      }, 700);
    }
  }

  ["views", "ctr", "conv", "price"].forEach(function (k) { sync(k); });
})(typeof window !== "undefined" ? window : globalThis);
