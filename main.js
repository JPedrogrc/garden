(() => {
  "use strict";

  /* ---------- Customize here ---------- */
  const CONFIG = {
    nome: "My love",
    mensagem: "Every lily here bloomed thinking of you.",
    maxLirios: 90,
  };
  // You can also customize via the link: index.html?nome=Emma&msg=I%20love%20you

  const params = new URLSearchParams(window.location.search);
  const nome = (params.get("nome") || CONFIG.nome).slice(0, 40);
  const mensagem = (params.get("msg") || CONFIG.mensagem).slice(0, 140);

  document.getElementById("titulo").textContent = `For ${nome}`;
  document.getElementById("mensagem").textContent = mensagem;
  document.title = `For ${nome}`;

  /* ---------- Helpers ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
  const easeOutBack = (t) => {
    const c1 = 1.4;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  /* ---------- Canvas ---------- */
  const canvas = document.getElementById("jardim");
  const ctx = canvas.getContext("2d");
  const texto = document.getElementById("texto");
  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0;
  let H = 0;

  function redimensionar() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const colinaFrente = (x) => H * 0.9 + Math.sin((x / W) * Math.PI * 1.3 + 0.5) * H * 0.018;
  const colinaFundo = (x) => H * 0.85 + Math.sin((x / W) * Math.PI * 1.8 + 2) * H * 0.02;

  function desenharColina(fn, cor1, cor2, topo) {
    const g = ctx.createLinearGradient(0, topo, 0, H);
    g.addColorStop(0, cor1);
    g.addColorStop(1, cor2);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 8) ctx.lineTo(x, fn(x));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
  }

  /* ---------- Shapes ---------- */
  // Pointed blade shape (used for leaves and petals). Points up (-y).
  function lamina(comp, larg) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(larg, -comp * 0.3, larg * 0.75, -comp * 0.82, 0, -comp);
    ctx.bezierCurveTo(-larg * 0.75, -comp * 0.82, -larg, -comp * 0.3, 0, 0);
    ctx.closePath();
  }

  function folha(x, y, ang, comp, larg) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, 0, 0, -comp);
    g.addColorStop(0, "#4c9568");
    g.addColorStop(1, "#86cc98");
    ctx.fillStyle = g;
    lamina(comp, larg);
    ctx.fill();
    ctx.restore();
  }

  function coracao(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y - s * 0.2, x - s * 0.5, y - s * 0.9, x, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.5, y - s * 0.9, x + s, y - s * 0.2, x, y + s * 0.35);
    ctx.fill();
  }

  /* ---------- Lilies ---------- */
  const lirios = [];
  const coracoes = [];

  function plantar(fx, fTop, atraso = 0) {
    if (lirios.length >= CONFIG.maxLirios) {
      let maisAntigo = 0;
      lirios.forEach((l, i) => {
        if (l.nascido < lirios[maisAntigo].nascido) maisAntigo = i;
      });
      lirios.splice(maisAntigo, 1);
    }
    lirios.push({
      fx,
      fTop,
      atraso,
      nascido: performance.now(),
      dy: rand(0, 0.05),
      rel: rand(0.85, 1.15),
      curva: rand(-1, 1),
      inclina: rand(-0.25, 0.25),
      tom: Math.random(),
      fase: rand(0, Math.PI * 2),
      lado: Math.random() < 0.5 ? -1 : 1,
      desabrochou: false,
    });
    lirios.sort((a, b) => a.dy - b.dy);
  }

  function flor(x, y, rot, unit, s, o, l) {
    const L = unit * s;
    if (L < 1) return;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(1, 0.9);

    const ponta = `hsl(335, ${45 + l.tom * 40}%, ${91 - l.tom * 11}%)`;
    const meio = "hsl(340, 70%, 98%)";
    const garganta = "hsl(52, 85%, 80%)";

    // Two rings of three petals (outer sepals, inner petals)
    for (let anel = 0; anel < 2; anel++) {
      for (let k = 0; k < 3; k++) {
        let base = ((anel * 60 + k * 120) * Math.PI) / 180;
        if (base > Math.PI) base -= Math.PI * 2;
        const ang = lerp(base * 0.12, base, o);
        const comp = L * (anel ? 0.94 : 1);
        const larg = comp * lerp(0.2, 0.4, o) * (anel ? 1.12 : 1);

        ctx.save();
        ctx.rotate(ang);
        const g = ctx.createLinearGradient(0, 0, 0, -comp);
        g.addColorStop(0, garganta);
        g.addColorStop(0.3, meio);
        g.addColorStop(1, ponta);
        ctx.fillStyle = g;
        ctx.strokeStyle = "rgba(214, 120, 150, 0.35)";
        ctx.lineWidth = 1;
        lamina(comp, larg);
        ctx.fill();
        ctx.stroke();

        if (o > 0.5) {
          const a = clamp((o - 0.5) / 0.5, 0, 1);
          ctx.globalAlpha = a;
          ctx.strokeStyle = "rgba(233, 143, 176, 0.55)";
          ctx.beginPath();
          ctx.moveTo(0, -comp * 0.08);
          ctx.lineTo(0, -comp * 0.72);
          ctx.stroke();
          ctx.fillStyle = "rgba(214, 90, 134, 0.55)";
          for (let i = 0; i < 5; i++) {
            const px = ((i % 2) - 0.5) * larg * 0.5;
            const py = -comp * (0.2 + i * 0.07);
            ctx.beginPath();
            ctx.arc(px, py, Math.max(0.8, comp * 0.016), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }
    }

    // Stamens and anthers
    if (o > 0.35) {
      ctx.globalAlpha = clamp((o - 0.35) / 0.4, 0, 1);
      for (let i = 0; i < 6; i++) {
        const a = (i - 2.5) * 0.24 * o;
        const len = L * 0.62;
        const ex = Math.sin(a) * len;
        const ey = -Math.cos(a) * len;
        ctx.strokeStyle = "#e9d28a";
        ctx.lineWidth = Math.max(1, L * 0.025);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fillStyle = "#d9822b";
        ctx.beginPath();
        ctx.ellipse(ex, ey, L * 0.075, L * 0.035, a + Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      // Pistil
      ctx.strokeStyle = "#a9cf8a";
      ctx.lineWidth = Math.max(1.2, L * 0.03);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -L * 0.7);
      ctx.stroke();
      ctx.fillStyle = "#8fbf6f";
      ctx.beginPath();
      ctx.arc(0, -L * 0.7, L * 0.04, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function desenharLirio(l, agora) {
    const t = reduz ? 1 : (agora - l.nascido - l.atraso) / 3400;
    if (t <= 0) return;
    const tt = clamp(t, 0, 1);

    const caule = easeOutCubic(clamp(tt / 0.55, 0, 1));
    const botao = clamp((tt - 0.35) / 0.2, 0, 1);
    const aberta = clamp((tt - 0.55) / 0.45, 0, 1);

    const unit = clamp(Math.min(W, H) * 0.11 * l.rel, 28, 100);
    const baseX = l.fx * W;
    const baseY = colinaFrente(baseX) + l.dy * H;
    const topoY = Math.min(l.fTop * H, baseY - unit * 2.4);
    const topoX = baseX + l.curva * unit * 1.2;

    const balanco = reduz ? 0 : Math.sin(agora / 1400 + l.fase) * unit * 0.12 * caule;
    const pontaX = baseX + (topoX - baseX) * caule + balanco;
    const pontaY = baseY + (topoY - baseY) * caule;
    const cx = baseX - l.curva * unit * 0.6 + balanco * 0.3;
    const cy = (baseY + pontaY) / 2;

    // Stem
    ctx.strokeStyle = "#4f9a6a";
    ctx.lineWidth = Math.max(2, unit * 0.085);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(cx, cy, pontaX, pontaY);
    ctx.stroke();

    // Leaves
    const crescerFolha = clamp((caule - 0.3) / 0.5, 0, 1);
    if (crescerFolha > 0) {
      [0.28, 0.5].forEach((p, i) => {
        const lado = i % 2 === 0 ? l.lado : -l.lado;
        const px = (1 - p) * (1 - p) * baseX + 2 * (1 - p) * p * cx + p * p * pontaX;
        const py = (1 - p) * (1 - p) * baseY + 2 * (1 - p) * p * cy + p * p * pontaY;
        const comp = unit * (1.25 - i * 0.2) * easeOutCubic(crescerFolha);
        folha(px, py, lado * (0.95 + l.curva * 0.12) + balanco * 0.004, comp, comp * 0.14);
      });
    }

    // Bud and flower
    if (botao > 0) {
      const dx = pontaX - cx;
      const dy = pontaY - cy;
      const rot = Math.atan2(dx, -dy) + l.inclina;
      const s = 0.28 * botao + 0.72 * easeOutBack(aberta);
      flor(pontaX, pontaY, rot, unit, s, easeInOut(aberta), l);

      if (aberta >= 1 && !l.desabrochou) {
        l.desabrochou = true;
        if (!reduz) {
          for (let i = 0; i < 3; i++) {
            coracoes.push({
              x: pontaX + rand(-unit * 0.4, unit * 0.4),
              y: pontaY - unit * 0.3,
              vx: rand(-8, 8),
              vy: rand(-34, -20),
              vida: -i * 250,
              dur: rand(2200, 3200),
              s: rand(4, 7),
            });
          }
        }
      }
    }
  }

  function desenharCoracoes(dt) {
    ctx.fillStyle = "#ec7fa6";
    for (let i = coracoes.length - 1; i >= 0; i--) {
      const c = coracoes[i];
      c.vida += dt;
      if (c.vida < 0) continue;
      if (c.vida > c.dur) {
        coracoes.splice(i, 1);
        continue;
      }
      c.x += (c.vx * dt) / 1000;
      c.y += (c.vy * dt) / 1000;
      ctx.globalAlpha = Math.sin((Math.PI * c.vida) / c.dur) * 0.85;
      coracao(c.x, c.y, c.s);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- Loop ---------- */
  let ultimo = performance.now();

  function quadro(agora) {
    const dt = Math.min(agora - ultimo, 50);
    ultimo = agora;

    ctx.clearRect(0, 0, W, H);
    desenharColina(colinaFundo, "#d4ecd0", "#b4dbbb", H * 0.8);
    lirios.forEach((l) => desenharLirio(l, agora));
    desenharColina(colinaFrente, "#a3d4a8", "#7fbf94", H * 0.86);
    desenharCoracoes(dt);

    requestAnimationFrame(quadro);
  }

  /* ---------- Initial garden and interactions ---------- */
  let temporizador = null;

  function revelarTexto(ms) {
    clearTimeout(temporizador);
    texto.classList.remove("visivel");
    temporizador = setTimeout(() => texto.classList.add("visivel"), reduz ? 0 : ms);
  }

  function jardimInicial() {
    lirios.length = 0;
    coracoes.length = 0;
    const n = Math.round(clamp(W / 75, 7, 20));
    const ordem = [...Array(n).keys()].sort(() => Math.random() - 0.5);
    ordem.forEach((i, k) => {
      const fx = (i + 0.5) / n + rand(-0.25, 0.25) / n;
      plantar(fx, rand(0.34, 0.68), 300 + k * 200);
    });
    revelarTexto(2400);
  }

  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    plantar((e.clientX - r.left) / W, Math.max((e.clientY - r.top) / H, 0.18), 0);
  });

  document.getElementById("replantar").addEventListener("click", jardimInicial);
  window.addEventListener("resize", redimensionar);

  redimensionar();
  jardimInicial();
  requestAnimationFrame(quadro);
})();
