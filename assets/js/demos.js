// Demonstrações dos serviços: cada uma roda quando aparece na tela, se repete e para quando sai.
// Os tempos ficam no próprio HTML (data-em, data-troca, data-conta); veja scripts/demos-servicos.mjs.
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const formata = (el, n) => (el.hasAttribute('data-moeda') ? 'R$ ' : '') + Math.round(n).toLocaleString('pt-BR');
const trocas = (el) => (el.dataset.troca || '').split(',').filter(Boolean).map(Number);

function contar(el) {
  const alvo = Number(el.dataset.conta);
  const inicio = performance.now();
  const passo = (agora) => {
    const p = Math.min((agora - inicio) / 1100, 1);
    el.textContent = formata(el, alvo * (1 - (1 - p) ** 3));
    if (p < 1 && el.isConnected) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

document.querySelectorAll('[data-demo]').forEach((demo) => {
  const itens = [...demo.querySelectorAll('[data-em], [data-troca]')];
  const contadores = (el) => [el, ...el.querySelectorAll('[data-conta]')].filter((c) => c.dataset.conta);
  const acender = (el) => { el.classList.add('aceso'); contadores(el).forEach(contar); };

  if (quieto) {
    itens.forEach((el) => { el.classList.add('aceso'); trocas(el).forEach((_, i) => el.classList.add(`t${i + 1}`)); });
    return;
  }

  let relogios = [];
  let rodando = false;
  const depois = (ms, fn) => relogios.push(setTimeout(fn, ms));
  const zerar = () => {
    relogios.forEach(clearTimeout);
    relogios = [];
    // volta ao começo sem animar a volta; só o conteúdo inteiro reaparece suave
    demo.classList.add('seco');
    requestAnimationFrame(() => requestAnimationFrame(() => demo.classList.remove('seco')));
    demo.classList.remove('sai');
    itens.forEach((el) => el.classList.remove('aceso', 't1', 't2', 't3'));
    demo.querySelectorAll('[data-conta]').forEach((c) => { c.textContent = formata(c, 0); });
  };
  const rodar = () => {
    zerar();
    let fim = 0;
    itens.forEach((el) => {
      if (el.dataset.em) { fim = Math.max(fim, +el.dataset.em); depois(+el.dataset.em, () => acender(el)); }
      trocas(el).forEach((ms, i) => { fim = Math.max(fim, ms); depois(ms, () => el.classList.add(`t${i + 1}`)); });
    });
    // fica um tempo no estado final, apaga e começa de novo
    depois(fim + 3600, () => demo.classList.add('sai'));
    depois(fim + 4100, rodar);
  };

  new IntersectionObserver(([v]) => {
    if (v.isIntersecting && !rodando) { rodando = true; rodar(); }
    if (!v.isIntersecting && rodando) { rodando = false; zerar(); }
  }, { threshold: 0.35 }).observe(demo);
});
