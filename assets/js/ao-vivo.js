// Demonstração roteirizada do agente. p = passo do raciocínio, a = agente, h = pessoa
(() => {
  const cenas = {
    'Loja': { nome: 'Loja Exemplo', perguntas: [
      { q: 'Saio do serviço às 18h. Ainda dá tempo de passar aí hoje?', falas: [
        ['p', 'entende a pergunta', 'Ele não quer o horário. Quer saber se chega a tempo.'],
        ['p', 'consulta horários', 'Hoje a loja fecha às 19h.'],
        ['p', 'calcula', 'Saída às 18h, sobra 1 hora. Dá tempo.', 'ok'],
        ['a', 'Dá sim! Hoje a gente fecha às 19h. Quer que eu separe alguma peça para você?'],
      ] },
      { q: 'Tem aquela calça preta da foto no 42?', falas: [
        ['p', 'identifica o produto', 'Calça preta do último post.'],
        ['p', 'consulta estoque', 'Tamanho 42: 2 unidades.', 'ok'],
        ['a', 'Tem sim! Quer que eu separe uma no seu nome até o fim do dia?'],
      ] },
      { q: 'Comprei uma vez e deu problema na troca. Vocês resolvem?', falas: [
        ['p', 'percebe o contexto', 'Cliente relata problema antigo. Não é pergunta para robô.', 'alerta'],
        ['p', 'passa para uma pessoa', 'Chama a atendente com o resumo da conversa.', 'alerta'],
        ['h', 'Oi! Aqui é a Ana, da loja. Vi que deu problema da outra vez, me conta o que houve?'],
      ] },
    ] },
    'Clínica': { nome: 'Clínica Exemplo', perguntas: [
      { q: 'Minha mãe tem 78 anos e não consegue subir escada. Tem como atender?', falas: [
        ['p', 'entende a pergunta', 'Quer marcar, e a escada é uma restrição real.'],
        ['p', 'consulta a unidade', 'Consultório 2 fica no térreo.', 'ok'],
        ['p', 'consulta a agenda', 'Térreo: quinta às 9h e sexta às 14h.', 'ok'],
        ['a', 'Temos consultório no térreo, sem escada. Fica melhor quinta às 9h ou sexta às 14h?'],
      ] },
      { q: 'Quanto custa a consulta? Aceita convênio?', falas: [
        ['p', 'consulta a tabela', 'Valor e convênios aprovados pela clínica.', 'ok'],
        ['a', 'A consulta particular custa R$ 250, e atendemos dois convênios. Qual é o seu? Já confiro para você.'],
      ] },
      { q: 'Ela está com muita dor no peito desde ontem. Pode esperar até quinta?', falas: [
        ['p', 'identifica risco', 'Dor no peito: o agente não orienta sobre saúde.', 'alerta'],
        ['p', 'passa para uma pessoa', 'Avisa a recepção com urgência.', 'alerta'],
        ['a', 'Dor no peito precisa de avaliação logo. Em emergência, ligue 192. Já chamei a recepção.'],
        ['h', 'Aqui é a Carla, da recepção. Estou ligando agora para vocês.'],
      ] },
    ] },
    'Barbearia': { nome: 'Barbearia Exemplo', perguntas: [
      { q: 'Consegue me encaixar hoje? Só posso depois do almoço', falas: [
        ['p', 'entende a pergunta', '"Depois do almoço" quer dizer a partir das 13h.'],
        ['p', 'consulta a agenda', 'Livre hoje: 13h30 e 15h.', 'ok'],
        ['a', 'Consigo! Tenho 13h30 ou 15h. Qual fica melhor?'],
      ] },
      { q: 'Pode ser com o mesmo de sempre?', falas: [
        ['p', 'consulta o histórico', 'Últimos 3 cortes com o Beto.'],
        ['p', 'confere o profissional', 'Beto está livre às 13h30.', 'ok'],
        ['a', 'Fechado, 13h30 com o Beto. Te lembro 30 minutos antes. ✂️'],
      ] },
      { q: 'Vou me atrasar, acho que não chego. Perco o horário?', falas: [
        ['p', 'consulta as regras', 'Dá para remarcar sem custo até 1h antes.', 'ok'],
        ['p', 'consulta a agenda', 'Próximo horário livre: 17h.', 'ok'],
        ['a', 'Sem problema! Remarco para as 17h, sem custo. Pode ser?'],
      ] },
    ] },
    'Distribuidora': { nome: 'Distribuidora Exemplo', perguntas: [
      { q: 'Manda o mesmo pedido do mês passado, mas dobra o óleo', falas: [
        ['p', 'entende a pergunta', 'Repetir pedido anterior, com uma alteração.'],
        ['p', 'consulta pedidos', 'Último pedido: 12 itens, sendo 10 caixas de óleo.'],
        ['p', 'calcula', 'Óleo passa para 20 caixas. Estoque: 34.', 'ok'],
        ['a', 'Pedido montado: os mesmos 12 itens, com 20 caixas de óleo. Confirma para eu enviar ao financeiro?'],
      ] },
      { q: 'O boleto de ontem não chegou', falas: [
        ['p', 'consulta o financeiro', 'Boleto emitido ontem, e-mail devolvido.', 'alerta'],
        ['p', 'resolve', 'Reenvia pelo WhatsApp e avisa para corrigir o e-mail.', 'ok'],
        ['a', 'Achei! O e-mail voltou, por isso não chegou. Te mandei o boleto aqui. Qual é o e-mail certo?'],
      ] },
      { q: 'Tá caro esse óleo. Faz um desconto?', falas: [
        ['p', 'confere o limite', 'Desconto não está autorizado para o agente.', 'alerta'],
        ['p', 'passa para uma pessoa', 'Pedido salvo; desconto vai para o vendedor decidir.', 'alerta'],
        ['h', 'Opa, Marcos aqui. Vi seu pedido, deixa eu ver o que consigo no óleo.'],
      ] },
    ] },
  };

  const raiz = document.querySelector('[data-ao-vivo]');
  const negocios = raiz.querySelector('[data-negocios]');
  const perguntas = raiz.querySelector('[data-perguntas]');
  const conversa = raiz.querySelector('[data-conversa]');
  const mente = raiz.querySelector('[data-mente]');
  const nome = raiz.querySelector('[data-nome]');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const espera = (ms) => new Promise((ok) => setTimeout(ok, quieto ? 0 : ms));
  const CLASSE = { c: 'msg--cliente', a: 'msg--agente', h: 'msg--humano' };
  let rodada = 0;

  function fala(tipo, texto) {
    const m = document.createElement('div');
    m.className = `msg ${CLASSE[tipo]}`;
    m.textContent = texto;
    conversa.append(m);
    conversa.scrollTop = conversa.scrollHeight;
  }

  async function perguntar(item, botao) {
    const eu = ++rodada;
    botao.dataset.usada = 'true';
    conversa.querySelector('.digitando')?.remove();
    mente.textContent = '';
    fala('c', item.q);
    for (const [tipo, a, b, c] of item.falas) {
      if (tipo === 'p') {
        await espera(750);
        if (eu !== rodada) return;
        const li = document.createElement('li');
        li.className = c ? `passo passo--${c}` : 'passo';
        const code = document.createElement('code');
        code.textContent = a;
        li.append(code, b);
        mente.append(li);
        continue;
      }
      await espera(350);
      if (eu !== rodada) return;
      const d = document.createElement('div');
      d.className = 'digitando';
      d.textContent = 'digitando…';
      conversa.append(d);
      conversa.scrollTop = conversa.scrollHeight;
      await espera(800);
      d.remove();
      if (eu !== rodada) return;
      fala(tipo, a);
    }
  }

  function escolher(titulo) {
    rodada++;
    const cena = cenas[titulo];
    conversa.textContent = '';
    mente.textContent = '';
    nome.textContent = cena.nome;
    [...negocios.children].forEach((b) => b.setAttribute('aria-pressed', b.textContent === titulo));
    perguntas.textContent = '';
    cena.perguntas.forEach((item) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = item.q;
      b.addEventListener('click', () => perguntar(item, b));
      perguntas.append(b);
    });
    return perguntas.firstChild;
  }

  Object.keys(cenas).forEach((t) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = t;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      olho.disconnect();
      escolher(t).click();
    });
    negocios.append(b);
  });
  escolher('Loja');

  // A primeira pergunta só toca quando o visitante chega na seção
  const olho = new IntersectionObserver((vistas) => {
    if (vistas.some((v) => v.isIntersecting)) {
      olho.disconnect();
      perguntas.firstChild.click();
    }
  }, { threshold: .3 });
  olho.observe(raiz);
})();
