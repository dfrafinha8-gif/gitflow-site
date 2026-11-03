// Monte sua equipe: a pessoa escolhe os robôs (tocando ou arrastando), vê o que eles fazem juntos
// e manda a lista pronta pelo WhatsApp. Usa abrirWhatsApp e medir de comum.js.
{
const secao = document.querySelector('[data-monte]');
if (secao) {
  const ROBOS = {
    atendente: { nome: 'Atendente', servico: 'agente de IA', faz: 'responde seus clientes no WhatsApp, no Instagram e no site, a qualquer hora' },
    operario: { nome: 'Operário', servico: 'automações', faz: 'faz a tarefa repetida que hoje toma o dia da sua equipe' },
    cobrador: { nome: 'Cobrador', servico: 'cobrança automática', faz: 'lembra cada cliente do vencimento, com educação e no dia certo' },
    analista: { nome: 'Analista', servico: 'painel de gestão', faz: 'junta os números da empresa numa tela só' },
    construtor: { nome: 'Construtor', servico: 'software sob medida', faz: 'monta o sistema do jeito que a sua empresa trabalha' },
    vitrine: { nome: 'Vitrine', servico: 'site sob medida', faz: 'recebe quem procura você no Google e transforma visita em contato' },
  };
  // o que dois robôs fazem melhor juntos (só aparece quando os dois estão na equipe)
  const JUNTOS = [
    ['atendente', 'cobrador', 'O Atendente responde e já manda o Pix; o Cobrador lembra quem esqueceu.'],
    ['atendente', 'analista', 'Cada conversa do Atendente vira número no painel do Analista.'],
    ['atendente', 'vitrine', 'Quem chega pelo site é atendido na hora pelo Atendente.'],
    ['operario', 'construtor', 'O Construtor monta o sistema e o Operário faz ele rodar sozinho.'],
    ['operario', 'cobrador', 'O pagamento que entra dá baixa no seu sistema sem ninguém digitar.'],
    ['operario', 'analista', 'O Operário junta os dados e o Analista entrega o resumo do dia.'],
    ['cobrador', 'analista', 'O painel mostra na hora quem pagou e quem está devendo.'],
    ['vitrine', 'analista', 'O painel mostra de onde vêm as visitas que viram contato.'],
  ];
  const cartoes = [...secao.querySelectorAll('[data-robo]')];
  const empresa = secao.querySelector('[data-monte-empresa]');
  const fila = secao.querySelector('[data-monte-fila]');
  const faz = secao.querySelector('[data-monte-faz]');
  const contagem = secao.querySelector('[data-monte-contagem]');
  const pedir = secao.querySelector('[data-monte-pedir]');
  const equipe = [];

  function desenhar(novo) {
    cartoes.forEach((c) => {
      const dentro = equipe.includes(c.dataset.robo);
      c.setAttribute('aria-pressed', dentro);
      c.querySelector('.monte__mais').textContent = dentro ? 'Na equipe' : 'Contratar';
    });
    contagem.textContent = equipe.length === 1 ? '1 robô' : `${equipe.length} robôs`;
    fila.innerHTML = equipe.length
      ? equipe.map((r) => `<button type="button" class="monte__membro${r === novo ? ' monte__membro--novo' : ''}" data-tirar="${r}" aria-label="Tirar o ${ROBOS[r].nome} da equipe"><img src="${secao.querySelector(`[data-robo="${r}"] img`).getAttribute('src')}" alt=""><span>${ROBOS[r].nome}</span></button>`).join('')
      : '<p class="monte__vazio">Arraste os robôs para cá ou toque em "Contratar".</p>';
    const linhas = equipe.map((r) => `<li>O <b>${ROBOS[r].nome}</b> ${ROBOS[r].faz}.</li>`);
    JUNTOS.filter(([a, b]) => equipe.includes(a) && equipe.includes(b)).forEach(([, , frase]) => linhas.push(`<li class="monte__junto">${frase}</li>`));
    faz.innerHTML = linhas.join('');
    pedir.disabled = !equipe.length;
  }
  function alternar(r) {
    const i = equipe.indexOf(r);
    if (i >= 0) equipe.splice(i, 1); else equipe.push(r);
    desenhar(i >= 0 ? null : r);
  }

  cartoes.forEach((c) => {
    c.addEventListener('click', () => alternar(c.dataset.robo));
    c.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', c.dataset.robo); e.dataTransfer.effectAllowed = 'copy'; });
  });
  fila.addEventListener('click', (e) => { const b = e.target.closest('[data-tirar]'); if (b) alternar(b.dataset.tirar); });
  empresa.addEventListener('dragover', (e) => { e.preventDefault(); empresa.dataset.recebendo = 'true'; });
  empresa.addEventListener('dragleave', () => { empresa.dataset.recebendo = 'false'; });
  empresa.addEventListener('drop', (e) => {
    e.preventDefault();
    empresa.dataset.recebendo = 'false';
    const r = e.dataTransfer.getData('text/plain');
    if (ROBOS[r] && !equipe.includes(r)) alternar(r);
  });
  pedir.addEventListener('click', () => {
    if (!equipe.length) return;
    const lista = equipe.map((r) => `${ROBOS[r].nome} (${ROBOS[r].servico})`).join(', ');
    medir('monte-equipe', { robos: equipe.length, equipe: equipe.join('+') });
    abrirWhatsApp(`Olá! Montei uma equipe no site da GitFlow e quero o diagnóstico gratuito. A equipe: ${lista}.`);
  });
  desenhar();
}
}
