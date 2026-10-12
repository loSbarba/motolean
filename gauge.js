// Indicatore di piega animato nella pagina principale: simula una sequenza di curve
// a destra e a sinistra, come lo strumento della schermata Registra.
(function () {
  var root = document.querySelector("[data-gauge]");
  if (!root) return;
  var NS = "http://www.w3.org/2000/svg";
  var svg = root.querySelector("svg");
  var deg = root.querySelector(".deg");
  var side = root.querySelector(".side");
  var maxL = root.querySelector("[data-max-l]");
  var maxR = root.querySelector("[data-max-r]");
  var labels = { l: root.dataset.left || "SX", r: root.dataset.right || "DX" };
  var cx = 200, cy = 200, R = 160, RANGE = 60;

  function pt(lean, r) {
    var a = (lean / RANGE) * 90 * Math.PI / 180; // 0 = in alto
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  }
  function arc(from, to, r) {
    var p1 = pt(from, r), p2 = pt(to, r);
    var sweep = to > from ? 1 : 0;
    return "M" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " A" + r + " " + r + " 0 0 " + sweep + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1);
  }
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    svg.appendChild(e);
    return e;
  }

  el("path", { d: arc(-RANGE, RANGE, R), fill: "none", stroke: "#262a33", "stroke-width": 18, "stroke-linecap": "round" });
  [-60, -45, -30, -15, 0, 15, 30, 45, 60].forEach(function (t) {
    var big = t % 30 === 0;
    var a = pt(t, R + 16), b = pt(t, R + (big ? 30 : 23));
    el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: big ? "#a3a9b5" : "#4a505c", "stroke-width": big ? 2.5 : 1.5, "stroke-linecap": "round" });
    if (big && t !== 0) {
      var c = pt(t, R + 50);
      var tx = el("text", { x: c[0], y: c[1] + 5, "text-anchor": "middle", fill: "#6d7380", "font-size": 15, "font-family": "Saira Condensed, sans-serif" });
      tx.textContent = Math.abs(t) + "°";
    }
  });
  var fill = el("path", { d: "", fill: "none", stroke: "url(#lg)", "stroke-width": 18, "stroke-linecap": "round" });
  var dot = el("circle", { r: 9, fill: "#eef0f3" });

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seq = [0, 34, 41, 8, -2, -38, -46, -10, 3, 27, 49, 52, 12, 0, -29, -44, -6, 0];
  var hi = { l: 0, r: 0 };

  function draw(v) {
    var c = Math.max(-RANGE, Math.min(RANGE, v));
    fill.setAttribute("d", Math.abs(c) < .3 ? "" : arc(0, c, R));
    var p = pt(c, R);
    dot.setAttribute("cx", p[0]); dot.setAttribute("cy", p[1]);
    deg.textContent = Math.round(Math.abs(v)) + "°";
    side.textContent = Math.abs(v) < 1 ? " " : (v < 0 ? labels.l : labels.r);
    if (v < 0 && -v > hi.l) hi.l = -v;
    if (v > 0 && v > hi.r) hi.r = v;
    maxL.textContent = Math.round(hi.l) + "°";
    maxR.textContent = Math.round(hi.r) + "°";
  }

  if (reduce) { hi = { l: 46, r: 52 }; draw(41); return; }

  var i = 0, from = 0, start = null, DUR = 1500;
  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function frame(ts) {
    if (start === null) start = ts;
    var t = Math.min(1, (ts - start) / DUR);
    var to = seq[(i + 1) % seq.length];
    draw(from + (to - from) * ease(t));
    if (t >= 1) { from = to; i = (i + 1) % seq.length; start = ts; }
    requestAnimationFrame(frame);
  }
  draw(0);
  requestAnimationFrame(frame);
})();
