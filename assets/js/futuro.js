// Efeitos de interface: títulos que se acendem com uma faixa de luz, o fundo de rede neural, a varredura
// que passa por cada seção, o antes e depois com scanner, o cursor de anel e os botões com ímã.
// Nada disso roda com "menos movimento" ligado, e nada esconde o conteúdo de quem não tem JS.
// fica tudo dentro de um bloco: os outros scripts do site já usam nomes como `quieto` no escopo global
{
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mouseFino = matchMedia('(pointer: fine)').matches;

// Títulos: uma faixa de luz dourada atravessa o título e ele se acende atrás dela
if (!quieto) {
  const acender = (el) => {
    const inicio = performance.now(), duracao = 900 + el.textContent.length * 9;
    const passo = (agora) => {
      const p = Math.min(1, (agora - inicio) / duracao), e = 1 - (1 - p) ** 3;
      el.style.setProperty('--luz', `${-10 + e * 125}%`);
      if (p < 1) requestAnimationFrame(passo);
      else { el.classList.remove('titulo-luz'); el.style.removeProperty('--luz'); el.style.removeProperty('--cor-titulo'); }
    };
    requestAnimationFrame(passo);
  };
  // só títulos de texto puro e fora da história (lá cada quadro já tem a própria entrada)
  const titulos = [...document.querySelectorAll('main h1, main h2')].filter((el) => !el.children.length && !el.closest('[data-trilho], .demo'));
  titulos.forEach((el) => { el.style.setProperty('--cor-titulo', getComputedStyle(el).color); el.classList.add('titulo-luz'); });
  const olho = new IntersectionObserver((vistos) => vistos.forEach((v) => {
    if (!v.isIntersecting) return;
    olho.unobserve(v.target);
    acender(v.target);
  }), { rootMargin: '0px 0px -10% 0px' });
  titulos.forEach((el) => olho.observe(el));
}

// Varredura: na primeira vez que cada seção aparece, uma linha de luz passa de cima para baixo
if (!quieto) {
  const secoes = document.querySelectorAll('main > section:not([data-trilho]):not([data-equipe]), .pag-dor, .pag-muda, .pag-entrega');
  const olho = new IntersectionObserver((vistos) => vistos.forEach((v) => {
    if (!v.isIntersecting) return;
    olho.unobserve(v.target);
    v.target.classList.add('varrendo');
  }), { threshold: 0.18 });
  secoes.forEach((s) => { s.classList.add('varre'); olho.observe(s); });
}

// Rede neural: pontos que andam devagar, ligados por fios; perto do mouse eles se juntam e acendem
document.querySelectorAll('[data-rede]').forEach((secao) => {
  const tela = document.createElement('canvas');
  tela.className = 'rede';
  tela.setAttribute('aria-hidden', 'true');
  secao.prepend(tela);
  const g = tela.getContext('2d');
  let pontos = [], w = 0, h = 0, visivel = false, pedido = 0, mx = -999, my = -999;
  const desenhar = () => {
    pedido = 0;
    g.clearRect(0, 0, w, h);
    for (const p of pontos) {
      if (!quieto) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dm = Math.hypot(p.x - mx, p.y - my);
        if (dm < 190) { p.x += (mx - p.x) * 0.006; p.y += (my - p.y) * 0.006; }
      }
    }
    for (let i = 0; i < pontos.length; i++) {
      const a = pontos[i];
      for (let j = i + 1; j < pontos.length; j++) {
        const b = pontos[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) { g.strokeStyle = `rgba(184, 194, 206, ${(1 - d / 130) * 0.16})`; g.lineWidth = 1; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
      }
      const dm = Math.hypot(a.x - mx, a.y - my);
      if (dm < 170) { g.strokeStyle = `rgba(212, 188, 128, ${(1 - dm / 170) * 0.55})`; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(mx, my); g.stroke(); }
      g.fillStyle = dm < 170 ? 'rgba(212, 188, 128, .9)' : 'rgba(184, 194, 206, .45)';
      g.beginPath(); g.arc(a.x, a.y, dm < 170 ? 1.8 : 1.3, 0, Math.PI * 2); g.fill();
    }
    if (visivel && !quieto) pedido = requestAnimationFrame(desenhar);
  };
  const dimensionar = () => {
    const dpr = Math.min(devicePixelRatio, 2);
    w = secao.clientWidth; h = secao.clientHeight;
    tela.width = w * dpr; tela.height = h * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(150, Math.round((w * h) / 15000));
    pontos = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 }));
    if (!pedido) desenhar();
  };
  new ResizeObserver(dimensionar).observe(secao);
  new IntersectionObserver(([v]) => { visivel = v.isIntersecting; if (visivel && !pedido) desenhar(); }).observe(secao);
  secao.addEventListener('pointermove', (e) => { const r = secao.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; if (quieto && !pedido) desenhar(); });
  secao.addEventListener('pointerleave', () => { mx = my = -999; });
});

// Antes e depois: a linha de laser corta os dois lados; na primeira vez que aparece, ela varre sozinha
const quadro = document.querySelector('[data-antes-quadro]');
if (quadro) {
  const controle = quadro.querySelector('[data-antes-controle]');
  const cortar = (v) => { quadro.style.setProperty('--corte', `${v}%`); };
  cortar(controle.value);
  controle.addEventListener('input', () => { quadro.dataset.mexeu = 'true'; cortar(controle.value); });
  if (!quieto) {
    new IntersectionObserver(([v], o) => {
      if (!v.isIntersecting) return;
      o.disconnect();
      const pontos = [[0, 50], [700, 88], [1700, 14], [2500, 50]], inicio = performance.now();
      const suave = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
      const passo = (agora) => {
        if (quadro.dataset.mexeu) return;
        const t = agora - inicio;
        const i = pontos.findIndex(([ms]) => ms > t);
        if (i === -1) { cortar(50); controle.value = 50; return; }
        const [t0, v0] = pontos[i - 1], [t1, v1] = pontos[i];
        const valor = v0 + (v1 - v0) * suave((t - t0) / (t1 - t0));
        cortar(valor); controle.value = valor;
        requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }, { threshold: 0.5 }).observe(quadro);
  }
}

// Cursor de anel e botões com ímã: só com mouse de verdade
if (mouseFino && !quieto) {
  const anel = document.createElement('div');
  anel.className = 'cursor-anel';
  anel.setAttribute('aria-hidden', 'true');
  document.body.append(anel);
  let x = -100, y = -100, ax = -100, ay = -100, pedido = 0;
  const seguir = () => {
    ax += (x - ax) * 0.22; ay += (y - ay) * 0.22;
    anel.style.transform = `translate(${ax}px, ${ay}px)`;
    pedido = Math.hypot(x - ax, y - ay) > 0.3 ? requestAnimationFrame(seguir) : 0;
  };
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    anel.dataset.ativo = 'true';
    const sobre = e.target.closest?.('a, button, summary, label, input[type=range], [data-equipe-palco]');
    anel.dataset.sobre = sobre ? (sobre.matches('[data-equipe-palco]') ? 'robo' : 'link') : '';
    if (!pedido) pedido = requestAnimationFrame(seguir);
  }, { passive: true });
  document.addEventListener('mouseleave', () => { anel.dataset.ativo = 'false'; });
  addEventListener('pointerdown', () => { anel.dataset.clique = 'true'; });
  addEventListener('pointerup', () => { anel.dataset.clique = 'false'; });

  // o botão chega um pouco mais perto do cursor quando ele se aproxima
  document.querySelectorAll('.botao').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width, dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      b.style.translate = `${dx * 10}px ${dy * 8}px`;
    });
    b.addEventListener('pointerleave', () => { b.style.translate = ''; });
  });
}
}
