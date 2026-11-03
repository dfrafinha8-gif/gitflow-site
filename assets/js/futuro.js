// Efeitos de interface: títulos que se decodificam, o antes e depois com scanner, o cursor de anel
// e os botões com ímã. Nada disso roda com "menos movimento" ligado, e nada esconde o conteúdo de quem não tem JS.
// fica tudo dentro de um bloco: os outros scripts do site já usam nomes como `quieto` no escopo global
{
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mouseFino = matchMedia('(pointer: fine)').matches;

// Títulos: as letras giram por caracteres aleatórios e se formam da esquerda para a direita
if (!quieto) {
  const SINAIS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/';
  const decodificar = (el) => {
    const final = el.textContent;
    const inicio = performance.now(), duracao = 500 + final.length * 14;
    el.setAttribute('aria-label', final);
    el.style.minHeight = `${el.offsetHeight}px`;
    const passo = (agora) => {
      const p = Math.min(1, (agora - inicio) / duracao), prontas = Math.floor(p * final.length);
      el.textContent = [...final].map((c, i) => (i < prontas || c === ' ' ? c : SINAIS[(Math.random() * SINAIS.length) | 0])).join('');
      if (p < 1) requestAnimationFrame(passo);
      else { el.textContent = final; el.removeAttribute('aria-label'); el.style.minHeight = ''; }
    };
    requestAnimationFrame(passo);
  };
  // só títulos de texto puro e fora da história (lá cada quadro já tem a própria entrada)
  const titulos = [...document.querySelectorAll('main h1, main h2')].filter((el) => !el.children.length && !el.closest('[data-trilho], .demo'));
  const olho = new IntersectionObserver((vistos) => vistos.forEach((v) => {
    if (!v.isIntersecting) return;
    olho.unobserve(v.target);
    decodificar(v.target);
  }), { rootMargin: '0px 0px -12% 0px' });
  titulos.forEach((el) => olho.observe(el));
}

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
