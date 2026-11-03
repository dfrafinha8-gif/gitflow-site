// A equipe de robôs: cada serviço vira um robô em 3D. Passar o mouse num robô faz ele andar até o centro
// do palco, "ligar" e mostrar o que faz; os outros recuam para o fundo e olham para ele.
// A ficha e os nomes funcionam sem WebGL; o Three.js (vendor/) só é baixado quando a seção chega perto da tela.
const EQUIPE = [
  { codigo: 'GF-01', nome: 'Atendente', servico: 'Agente de IA', interesse: 'Agente de IA', slug: 'agentes-de-ia', tipo: 'agente', corpo: 'prata', faz: 'Responde seus clientes no WhatsApp, no Instagram e no site, a qualquer hora.', itens: ['Tira dúvida, passa preço e agenda', 'Ninguém fica esperando à noite nem no fim de semana', 'Chama sua equipe quando o assunto pede gente'], ficha: [['Trabalha', '24 horas'], ['Onde', 'WhatsApp, Instagram e site'], ['Chama você', 'reclamação, desconto e assunto delicado']] },
  { codigo: 'GF-02', nome: 'Operário', servico: 'Automações', interesse: 'Automação', slug: 'automacoes', tipo: 'automacao', corpo: 'bronze', faz: 'Faz a tarefa repetida que hoje toma o dia da sua equipe.', itens: ['Passa dado de um sistema para outro sem erro de digitação', 'Dá retorno ao cliente no dia certo', 'Avisa uma pessoa quando algo sai do normal'], ficha: [['Trabalha', 'sem parar, no fundo'], ['Onde', 'WhatsApp, CRM, ERP, planilha e e-mail'], ['Chama você', 'quando algo foge do padrão']] },
  { codigo: 'GF-03', nome: 'Cobrador', servico: 'Cobrança automática', interesse: 'Cobrança automática', slug: 'cobranca-automatica', tipo: 'cobranca', corpo: 'ouro', faz: 'Lembra cada cliente do vencimento, com educação e no dia certo.', itens: ['Manda boleto ou Pix pelo WhatsApp', 'Dá baixa quando o pagamento entra', 'Mostra quem pagou e quem está devendo'], ficha: [['Trabalha', 'nos dias e horários que você definir'], ['Onde', 'WhatsApp'], ['Chama você', 'quando o atraso passa do seu limite']] },
  { codigo: 'GF-04', nome: 'Analista', servico: 'Painéis de gestão', interesse: 'Painel de gestão', slug: 'paineis-de-gestao', tipo: 'painel', corpo: 'prata', faz: 'Junta os números da empresa numa tela só.', itens: ['Vendas, caixa, estoque e contas a pagar', 'Mostra o problema quando ele começa', 'O resumo do dia chega sem ninguém montar planilha'], ficha: [['Trabalha', 'atualizando o dia todo'], ['Onde', 'computador e celular'], ['Chama você', 'quando um número sai do esperado']] },
  { codigo: 'GF-05', nome: 'Construtor', servico: 'Software sob medida', interesse: 'Software sob medida', slug: 'software-sob-medida', tipo: 'software', corpo: 'bronze', faz: 'Monta o sistema do jeito que a sua empresa trabalha.', itens: ['Pedidos, estoque, agenda e financeiro num lugar só', 'O código fica em nome da sua empresa', 'Cresce junto com o negócio'], ficha: [['Trabalha', 'com escopo, prazo e valor fechados'], ['Onde', 'navegador, computador e celular'], ['Chama você', 'para testar antes de entrar no ar']] },
  { codigo: 'GF-06', nome: 'Vitrine', servico: 'Sites sob medida', interesse: 'Site sob medida', slug: 'sites-sob-medida', tipo: 'site', corpo: 'ouro', faz: 'Recebe quem procura você no Google e transforma visita em contato.', itens: ['Rápido no celular', 'Preparado para aparecer no Google', 'Cada visita pode virar orçamento no WhatsApp'], ficha: [['Trabalha', '24 horas'], ['Onde', 'Google, Instagram e WhatsApp'], ['Chama você', 'quando chega um pedido de orçamento']] },
];

const secao = document.querySelector('[data-equipe]');
if (secao) {
  const palco = secao.querySelector('[data-equipe-palco]');
  const fichaEl = secao.querySelector('[data-equipe-ficha]');
  const nomesEl = secao.querySelector('[data-equipe-nomes]');
  const celular = () => matchMedia('(max-width: 760px)').matches;
  // o 3D liga isto quando carrega: com ele, a ficha só abre quando o robô chega ao centro
  const estado = { escolhido: null, fixado: false, tem3D: false, aoEscolher: () => {} };

  function escolher(i) {
    if (i === estado.escolhido) return;
    estado.escolhido = i;
    [...nomesEl.children].forEach((b, j) => b.setAttribute('aria-pressed', j === i));
    if (i === null) { fichaEl.dataset.aberta = 'false'; estado.aoEscolher(); return; }
    const d = EQUIPE[i];
    fichaEl.innerHTML = `<p class="equipe__codigo"><span>${d.codigo}</span><b>${d.servico}</b></p><h3>${d.nome}</h3><p>${d.faz}</p><ul>${d.itens.map((t) => `<li>${t}</li>`).join('')}</ul><dl>${d.ficha.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><div class="equipe__acoes"><a class="botao" href="#contato" data-contratar>Contratar o ${d.nome}</a><a href="servicos/${d.slug}/">Ver como funciona</a></div>`;
    fichaEl.querySelector('[data-contratar]').addEventListener('click', () => {
      const campo = document.querySelector('[data-interesse-campo]');
      if (campo) campo.value = d.interesse;
      window.umami?.track('botao-contato', { origem: 'equipe', servico: d.interesse });
    });
    fichaEl.dataset.aberta = String(!estado.tem3D || celular());
    estado.aoEscolher();
  }

  EQUIPE.forEach((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<small>${d.codigo}</small>${d.nome}<span class="so-leitor">, ${d.servico}</span>`;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('mouseenter', () => { if (!estado.fixado) escolher(i); });
    b.addEventListener('focus', () => escolher(i));
    b.addEventListener('click', () => { estado.fixado = true; escolher(i); });
    nomesEl.append(b);
  });
  // sair da seção devolve todo mundo ao lugar (no computador); no celular sempre fica um escolhido
  let saida = 0;
  secao.addEventListener('mouseleave', () => { saida = setTimeout(() => { if (!estado.fixado && !celular()) escolher(null); }, 500); });
  secao.addEventListener('mouseenter', () => clearTimeout(saida));
  if (celular()) escolher(0);

  new IntersectionObserver(([v], olho) => {
    if (!v.isIntersecting) return;
    olho.disconnect();
    iniciar3D().catch((erro) => { secao.classList.add('equipe--sem-3d'); console.error('equipe 3D:', erro); });
  }, { rootMargin: '400px 0px' }).observe(secao);

  async function iniciar3D() {
    const [THREE, { RoundedBoxGeometry }, { RoomEnvironment }] = await Promise.all([
      import('./vendor/three.module.min.js'), import('./vendor/RoundedBoxGeometry.js'), import('./vendor/RoomEnvironment.js'),
    ]);
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    palco.prepend(renderer.domElement);

    const cena = new THREE.Scene();
    // a neblina escurece quem está no fundo: o robô do centro fica em destaque sem precisar de outro efeito
    cena.fog = new THREE.Fog(0x07090D, 12, 26);
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cena.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    cena.add(new THREE.HemisphereLight(0xE8ECF2, 0x07090D, 0.35));
    const chave = new THREE.DirectionalLight(0xFFE9C4, 1.6); chave.position.set(4, 7, 6); cena.add(chave);
    const contra = new THREE.DirectionalLight(0x9FB4D0, 1.1); contra.position.set(-5, 4, -6); cena.add(contra);
    // luz de palco que acende sobre o centro quando alguém chega lá
    const foco = new THREE.SpotLight(0xFFE2B0, 0, 14, 0.42, 0.6, 1.2); foco.position.set(0, 8, 4); cena.add(foco, foco.target);
    // anéis de luz no chão, embaixo de quem está no centro: um inteiro e um tracejado girando ao contrário
    const anel = new THREE.Group(); anel.rotation.x = -Math.PI / 2; anel.position.y = 0.02; cena.add(anel);
    const anelMat = new THREE.MeshBasicMaterial({ color: 0xD4BC80, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    anel.add(new THREE.Mesh(new THREE.RingGeometry(1.02, 1.07, 72), anelMat));
    const tracos = new THREE.Group(); anel.add(tracos);
    for (let i = 0; i < 12; i++) tracos.add(new THREE.Mesh(new THREE.RingGeometry(1.22, 1.26, 8, 1, (i / 12) * Math.PI * 2, Math.PI / 14), anelMat));

    const metal = (cor, rug) => new THREE.MeshStandardMaterial({ color: cor, metalness: 1, roughness: rug });
    const luz = (cor, i) => new THREE.MeshStandardMaterial({ color: 0x111111, emissive: cor, emissiveIntensity: i });
    const M = {
      ouro: metal(0xD4BC80, 0.28), prata: metal(0xB8C2CE, 0.22), bronze: metal(0xC98B4E, 0.3),
      grafite: new THREE.MeshStandardMaterial({ color: 0x1D232B, metalness: 0.7, roughness: 0.38 }),
      visor: new THREE.MeshStandardMaterial({ color: 0x06080B, metalness: 0.3, roughness: 0.12 }),
      papel: new THREE.MeshStandardMaterial({ color: 0xE8ECF2, metalness: 0, roughness: 0.6 }),
      luzBronze: luz(0xE09A5A, 1.8),
    };
    const caixa = (l, a, p, r, mat) => new THREE.Mesh(new RoundedBoxGeometry(l, a, p, 5, r), mat);
    const capsula = (r, c, mat) => new THREE.Mesh(new THREE.CapsuleGeometry(r, c, 6, 14), mat);
    const esfera = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat);
    const sombraTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 4, 64, 64, 62); r.addColorStop(0, 'rgba(0,0,0,.65)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();

    function engrenagem(raio, dentes, mat) {
      const s = new THREE.Shape();
      for (let i = 0; i < dentes * 2; i++) {
        const a = (i / (dentes * 2)) * Math.PI * 2, r = i % 2 ? raio * 0.78 : raio, a2 = a + Math.PI / (dentes * 2);
        if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        s.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
      }
      const furo = new THREE.Path(); furo.absarc(0, 0, raio * 0.3, 0, Math.PI * 2, true); s.holes.push(furo);
      return new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 2 }), mat);
    }

    // Cada robô tem silhueta e jeito de andar próprios (referência: "silhueta primeiro"):
    // Atendente flutua, Operário anda de esteira, Cobrador tem pernas invertidas, Analista é um drone,
    // Construtor anda em quatro patas e a Vitrine se equilibra numa bola.
    const cilindro = (rt, rb, h, mat, seg = 28) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    const toro = (r, tubo, mat, arco = Math.PI * 2) => new THREE.Mesh(new THREE.TorusGeometry(r, tubo, 10, 48, arco), mat);
    const brilho = (cor, opacidade) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: opacidade, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const em = (pai, filho, x = 0, y = 0, z = 0) => { filho.position.set(x, y, z); pai.add(filho); return filho; };

    function montar(def, destino = cena) {
      const g = new THREE.Group(), corpoMat = M[def.corpo], extra = {};
      const sombra = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.1), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false }));
      sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.01; g.add(sombra);
      // o corpo inteiro fica num grupo próprio para subir e descer sem levar a sombra junto
      const boneco = new THREE.Group(); g.add(boneco);
      const cabeca = new THREE.Group(), tronco = new THREE.Group();
      boneco.add(cabeca, tronco);
      const olhoMat = luz(0xF3DFA2, 2.4);
      let olhos = [], pernas = [], rodas = [], bracos = [], locomocao = 'pernas';
      // braço genérico: um pivô no ombro (os gestos giram o pivô) com o que for pendurado nele
      const braco = (x, y, z, pendurar) => { const ombro = new THREE.Group(); ombro.position.set(x, y, z); ombro.rotation.z = Math.sign(x) * 0.12; boneco.add(ombro); pendurar(ombro); return ombro; };

      if (def.tipo === 'agente') {
        // androide que flutua: corpo de ovo, faixa de luz no rosto, auréola girando e mãos soltas no ar
        locomocao = 'flutua';
        const corpo = em(boneco, new THREE.Mesh(new THREE.SphereGeometry(0.62, 40, 28), corpoMat), 0, 1.4, 0); corpo.scale.set(1, 1.25, 0.9);
        em(boneco, caixa(0.46, 0.26, 0.05, 0.05, M.visor), 0, 1.55, 0.53);
        [-0.12, 0, 0.12].forEach((x) => em(boneco, esfera(0.035, olhoMat), x, 1.55, 0.57));
        em(boneco, cilindro(0.34, 0.12, 0.34, M.grafite), 0, 0.66, 0);
        em(boneco, toro(0.3, 0.035, luz(0xF3DFA2, 2)), 0, 0.5, 0).rotation.x = Math.PI / 2;
        extra.jato = em(boneco, new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.36, 28, 1, true), brilho(0xF3DFA2, 0.16)), 0, 0.3, 0);
        extra.jato.rotation.x = Math.PI;
        cabeca.position.set(0, 2.42, 0);
        const cupula = em(cabeca, new THREE.Mesh(new THREE.SphereGeometry(0.46, 40, 28), corpoMat)); cupula.scale.set(1, 0.88, 0.95);
        const faixa = em(cabeca, new THREE.Mesh(new THREE.CylinderGeometry(0.455, 0.455, 0.12, 40, 1, true, -1.25, 2.5), olhoMat), 0, -0.02, 0);
        faixa.scale.z = 0.95; olhos = [faixa];
        extra.halo = em(cabeca, toro(0.64, 0.022, M.ouro), 0, 0.3, 0); extra.halo.rotation.x = Math.PI / 2 - 0.25;
        [-1, 1].forEach((l) => em(cabeca, cilindro(0.09, 0.09, 0.08, M.ouro), l * 0.47, 0, 0).rotation.z = Math.PI / 2);
        bracos = [-1, 1].map((l) => braco(l * 0.78, 1.65, 0, (o) => { em(o, esfera(0.13, corpoMat), 0, -0.55, 0); em(o, toro(0.1, 0.018, olhoMat), 0, -0.55, 0).rotation.x = Math.PI / 2; }));
        extra.balao = new THREE.Group(); extra.balao.position.set(0.9, 3.15, 0.2); extra.balao.scale.setScalar(0.001);
        extra.balao.add(caixa(0.62, 0.34, 0.08, 0.12, M.papel));
        extra.pontos = [-0.15, 0, 0.15].map((x) => em(extra.balao, esfera(0.04, M.grafite), x, 0, 0.05));
        boneco.add(extra.balao);
      }

      if (def.tipo === 'automacao') {
        // mecha de esteira: baixo e largo, um olho só e um braço de garra
        locomocao = 'esteira';
        [-1, 1].forEach((l) => {
          em(boneco, caixa(0.34, 0.44, 1.18, 0.17, M.grafite), l * 0.5, 0.24, 0);
          [-0.38, 0, 0.38].forEach((z) => {
            const roda = em(boneco, new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 20).rotateZ(Math.PI / 2), M.bronze), l * 0.69, 0.24, z);
            em(roda, new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.26, 0.04), M.grafite));
            rodas.push(roda);
          });
        });
        em(boneco, caixa(1.2, 0.3, 0.95, 0.08, M.grafite), 0, 0.58, 0);
        tronco.position.y = 1.12;
        em(tronco, caixa(1.38, 0.78, 0.92, 0.18, corpoMat));
        em(tronco, caixa(1.4, 0.07, 0.94, 0.02, M.ouro), 0, -0.3, 0);
        em(tronco, caixa(0.66, 0.38, 0.05, 0.05, M.visor), 0.18, 0.06, 0.46);
        extra.e1 = engrenagem(0.15, 10, M.ouro); extra.e1.position.set(0.06, 0.06, 0.47); tronco.add(extra.e1);
        extra.e2 = engrenagem(0.1, 8, M.bronze); extra.e2.position.set(0.3, 0.12, 0.47); tronco.add(extra.e2);
        [-1, 1].forEach((l) => em(boneco, cilindro(0.07, 0.07, 0.5, M.grafite, 16), l * 0.48, 1.8, -0.36));
        cabeca.position.set(0, 1.78, 0.05);
        em(cabeca, caixa(0.78, 0.4, 0.62, 0.16, corpoMat));
        em(cabeca, cilindro(0.2, 0.2, 0.1, M.grafite), 0, 0, 0.31).rotation.x = Math.PI / 2;
        olhos = [em(cabeca, esfera(0.12, olhoMat), 0, 0, 0.35)];
        extra.ponta = em(cabeca, esfera(0.05, luz(0xE09A5A, 2)), 0.28, 0.24, 0);
        bracos = [
          braco(-0.86, 1.36, 0.05, (o) => {
            em(o, capsula(0.15, 0.42, M.grafite), 0, -0.32, 0);
            em(o, cilindro(0.17, 0.17, 0.12, corpoMat), 0, -0.68, 0);
            extra.garra = [-1, 1].map((d) => { const dedo = new THREE.Group(); dedo.position.set(d * 0.08, -0.74, 0); o.add(dedo); em(dedo, caixa(0.07, 0.3, 0.12, 0.03, M.ouro), 0, -0.14, 0); return dedo; });
          }),
          braco(0.86, 1.36, 0.05, (o) => { em(o, capsula(0.09, 0.4, M.grafite), 0, -0.3, 0); em(o, esfera(0.12, corpoMat), 0, -0.6, 0); }),
        ];
      }

      if (def.tipo === 'cobranca') {
        // alto e esguio, pernas invertidas, uma fenda de luz no peito e moedas em órbita
        locomocao = 'pernas';
        pernas = [-1, 1].map((l) => {
          const quadril = new THREE.Group(); quadril.position.set(l * 0.22, 1.26, 0); boneco.add(quadril);
          em(quadril, capsula(0.085, 0.46, M.grafite), 0, -0.28, -0.12).rotation.x = 0.41;
          em(quadril, esfera(0.1, corpoMat), 0, -0.55, -0.24);
          em(quadril, capsula(0.07, 0.42, M.grafite), 0, -0.8, -0.12).rotation.x = -0.45;
          em(quadril, caixa(0.2, 0.07, 0.34, 0.03, corpoMat), 0, -1.17, 0.06);
          return quadril;
        });
        em(boneco, esfera(0.2, M.grafite), 0, 1.28, 0);
        tronco.position.y = 1.78;
        em(tronco, caixa(0.72, 0.92, 0.48, 0.2, corpoMat));
        extra.fenda = em(tronco, caixa(0.34, 0.05, 0.05, 0.02, luz(0xF3DFA2, 2)), 0, 0.16, 0.25);
        em(tronco, caixa(0.42, 0.22, 0.04, 0.04, M.visor), 0, -0.12, 0.24);
        extra.orbita = new THREE.Group(); tronco.add(extra.orbita);
        [0, 1, 2].forEach((i) => {
          const a = (i / 3) * Math.PI * 2;
          const m = em(extra.orbita, cilindro(0.11, 0.11, 0.03, M.ouro), Math.cos(a) * 0.78, Math.sin(a * 2) * 0.12, Math.sin(a) * 0.78);
          m.rotation.x = Math.PI / 2;
        });
        em(boneco, cilindro(0.05, 0.05, 0.26, M.grafite, 12), 0, 2.32, 0);
        cabeca.position.set(0, 2.55, 0);
        em(cabeca, caixa(0.86, 0.3, 0.46, 0.13, corpoMat));
        em(cabeca, caixa(0.7, 0.13, 0.04, 0.04, M.visor), 0, 0, 0.23);
        olhos = [-0.17, 0.17].map((x) => em(cabeca, caixa(0.15, 0.045, 0.02, 0.01, olhoMat), x, 0, 0.255));
        bracos = [-1, 1].map((l) => braco(l * 0.44, 2.1, 0, (o) => { em(o, capsula(0.055, 0.6, M.grafite), 0, -0.38, 0); em(o, esfera(0.08, corpoMat), 0, -0.76, 0); }));
        extra.moeda = new THREE.Group();
        em(extra.moeda, cilindro(0.17, 0.17, 0.04, M.ouro, 36)).rotation.x = Math.PI / 2;
        em(extra.moeda, toro(0.13, 0.01, M.bronze), 0, 0, 0.025);
        extra.moeda.position.set(0, -0.92, 0.12); bracos[1].add(extra.moeda);
      }

      if (def.tipo === 'painel') {
        // drone sentinela: esfera que flutua, um olho grande que se mexe e painéis de holograma em volta
        locomocao = 'flutua';
        const centro = 1.75;
        em(boneco, new THREE.Mesh(new THREE.SphereGeometry(0.6, 44, 30), corpoMat), 0, centro, 0);
        em(boneco, toro(0.62, 0.04, M.grafite), 0, centro, 0).rotation.x = Math.PI / 2;
        extra.rotores = [0, 1, 2, 3].map((i) => {
          const a = Math.PI / 4 + (i * Math.PI) / 2, x = Math.cos(a) * 0.95, z = Math.sin(a) * 0.95;
          const haste = em(boneco, new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.05), M.grafite), Math.cos(a) * 0.72, centro - 0.05, Math.sin(a) * 0.72); haste.rotation.y = -a;
          em(boneco, cilindro(0.05, 0.05, 0.08, M.grafite, 12), x, centro - 0.02, z);
          const helice = em(boneco, new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.012, 0.05), M.prata), x, centro + 0.03, z);
          return helice;
        });
        extra.jato = em(boneco, new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 24, 1, true), brilho(0xB8C2CE, 0.12)), 0, centro - 0.78, 0); extra.jato.rotation.x = Math.PI;
        cabeca.position.set(0, centro, 0);
        em(cabeca, toro(0.29, 0.035, M.ouro), 0, 0, 0.55);
        em(cabeca, cilindro(0.27, 0.27, 0.06, M.visor), 0, 0, 0.53).rotation.x = Math.PI / 2;
        olhos = [em(cabeca, esfera(0.15, olhoMat), 0, 0, 0.54)];
        extra.holos = new THREE.Group(); extra.holos.position.y = centro + 0.15; boneco.add(extra.holos);
        extra.holoMat = brilho(0xD4BC80, 0.14);
        extra.barras = [];
        [-0.9, 0.9].forEach((a, i) => {
          const painel = new THREE.Group(); painel.position.set(Math.sin(a) * 1.15, i ? 0.35 : 0.1, Math.cos(a) * 0.55); painel.rotation.y = a * 0.7; extra.holos.add(painel);
          em(painel, new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.44), extra.holoMat));
          em(painel, new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.012), brilho(0xF3DFA2, 0.7)), 0, 0.22, 0.001);
          [0.5, 0.8, 0.6, 1].forEach((h, j) => { const b = em(painel, new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.01), brilho(j === 3 ? 0xF3DFA2 : 0xE09A5A, 0.85)), -0.2 + j * 0.13, -0.08, 0.01); b.userData.h = h; b.userData.base = -0.2; extra.barras.push(b); });
        });
        bracos = [-1, 1].map((l) => braco(l * 0.5, centro - 0.35, 0.1, (o) => { em(o, capsula(0.04, 0.22, M.grafite), 0, -0.16, 0); em(o, esfera(0.06, corpoMat), 0, -0.32, 0); }));
      }

      if (def.tipo === 'software') {
        // quatro patas de aranha, cabine de seis lados, três olhos e dois braços que montam os blocos
        locomocao = 'patas';
        tronco.position.y = 1.15;
        em(tronco, cilindro(0.6, 0.66, 0.46, corpoMat, 6));
        em(tronco, cilindro(0.5, 0.6, 0.12, M.grafite, 6), 0, 0.29, 0);
        pernas = [45, 135, 225, 315].map((graus, i) => {
          const a = THREE.MathUtils.degToRad(graus);
          const raiz = new THREE.Group(); raiz.position.set(Math.cos(a) * 0.5, 1.1, Math.sin(a) * 0.5); raiz.rotation.y = -a; boneco.add(raiz);
          em(raiz, esfera(0.09, M.grafite));
          em(raiz, capsula(0.06, 0.5, M.grafite), 0.26, 0.2, 0).rotation.z = -1.0;
          em(raiz, esfera(0.08, corpoMat), 0.52, 0.42, 0);
          em(raiz, capsula(0.05, 0.9, M.grafite), 0.68, -0.28, 0).rotation.z = 0.25;
          em(raiz, cilindro(0.04, 0.09, 0.1, corpoMat, 12), 0.79, -1.05, 0);
          raiz.userData.y = 1.1; raiz.userData.fase = i % 2 ? Math.PI : 0;
          return raiz;
        });
        cabeca.position.set(0, 1.42, 0.42);
        const cupula = em(cabeca, new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), M.visor)); cupula.rotation.x = Math.PI / 2; cupula.scale.set(1, 1, 0.8);
        olhos = [[-0.11, 0.05], [0.11, 0.05], [0, -0.08]].map(([x, y]) => em(cabeca, esfera(0.05, olhoMat), x, y, 0.24));
        em(boneco, cilindro(0.025, 0.025, 0.9, M.grafite, 8), -0.25, 1.85, -0.3).rotation.z = 0.2;
        extra.ponta = em(boneco, esfera(0.06, luz(0xF3DFA2, 2)), -0.34, 2.3, -0.3);
        bracos = [-1, 1].map((l) => braco(l * 0.3, 1.1, 0.5, (o) => { o.rotation.x = -0.5; em(o, capsula(0.045, 0.4, M.grafite), 0, -0.26, 0.05); [-1, 1].forEach((d) => em(o, caixa(0.03, 0.14, 0.05, 0.01, M.ouro), d * 0.04, -0.55, 0.05)); }));
        extra.blocos = [M.ouro, M.prata, M.bronze].map((m, i) => {
          const c = caixa(0.26, 0.26, 0.26, 0.04, m);
          c.userData.solto = new THREE.Vector3((i - 1) * 0.36, 0.13, 1.25 + (i % 2) * 0.12);
          c.userData.pilha = new THREE.Vector3(0, 0.13 + i * 0.27, 1.2);
          c.position.copy(c.userData.solto); c.rotation.y = i * 0.6; g.add(c); return c;
        });
      }

      if (def.tipo === 'site') {
        // equilibrista numa bola, pescoço comprido e a cabeça é uma tela de navegador
        locomocao = 'roda';
        const bola = em(boneco, new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 22), M.grafite), 0, 0.34, 0);
        em(bola, toro(0.345, 0.025, M.ouro)).rotation.y = Math.PI / 2;
        rodas = [bola];
        em(boneco, cilindro(0.34, 0.24, 0.16, M.grafite), 0, 0.72, 0);
        tronco.position.y = 1.2;
        em(tronco, cilindro(0.3, 0.44, 0.8, corpoMat));
        em(tronco, toro(0.33, 0.03, olhoMat), 0, 0.22, 0).rotation.x = Math.PI / 2;
        em(boneco, cilindro(0.05, 0.05, 0.62, M.grafite, 12), 0, 1.9, 0);
        cabeca.position.set(0, 2.38, 0);
        em(cabeca, caixa(1.2, 0.86, 0.14, 0.08, M.grafite));
        em(cabeca, caixa(1.08, 0.62, 0.04, 0.03, M.papel), 0, -0.06, 0.07);
        [-0.44, -0.36, -0.28].forEach((x) => em(cabeca, esfera(0.025, M.luzBronze), x, 0.33, 0.08));
        const olhoEscuro = new THREE.MeshStandardMaterial({ color: 0x0C1016, roughness: 0.4 });
        olhos = [-0.2, 0.2].map((x) => em(cabeca, capsula(0.05, 0.08, olhoEscuro), x, 0, 0.1));
        extra.botao = em(cabeca, caixa(0.36, 0.1, 0.03, 0.02, luz(0xF3DFA2, 1.2)), 0, -0.24, 0.1);
        extra.cursor = em(boneco, new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 3), M.grafite), 0.3, 2.37, 0.2); extra.cursor.rotation.z = 0.5;
        bracos = [-1, 1].map((l) => braco(l * 0.42, 1.48, 0, (o) => { em(o, capsula(0.05, 0.5, M.grafite), 0, -0.32, 0); em(o, esfera(0.08, corpoMat), 0, -0.64, 0); }));
      }

      const alvo = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3, 1.3), new THREE.MeshBasicMaterial({ visible: false })); alvo.position.y = 1.4; g.add(alvo);
      destino.add(g);
      return {
        def, g, boneco, cabeca, bracos, pernas, rodas, locomocao, olhos, olhoMat, brilho: olhoMat.emissiveIntensity, extra, alvo,
        base: new THREE.Vector3(), pos: new THREE.Vector3(), destino: new THREE.Vector3(),
        rot: 0, passo: 0, andar: 0, k: 0, ativa: 0, fase: Math.random() * 6, piscar: 2 + Math.random() * 4,
      };
    }
    const robos = EQUIPE.map((d) => montar(d));

    let largura = 1, altura = 1, emCelular = false, camZ = 10, camY = 2.2, olharY = 1.45, olharX = 0;
    const centro = new THREE.Vector3();
    let recuo = 3.6;
    function dispor() {
      largura = palco.clientWidth; altura = palco.clientHeight;
      renderer.setSize(largura, altura, false);
      camera.aspect = largura / altura;
      emCelular = camera.aspect < 0.9;
      const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), tanH = tanV * camera.aspect;
      if (!emCelular) {
        const passo = 2.15;
        robos.forEach((r, i) => { const x = (i - 2.5) * passo; r.base.set(x, 0, -Math.abs(x) * 0.18); });
        centro.set(-1.3, 0, 2.2); recuo = 3.6;
        camZ = Math.max((2.5 * passo + 1.1) / tanH, 2.8 / tanV); camY = 2.2; olharY = 1.45;
      } else {
        robos.forEach((r, i) => { const col = i % 3, lin = Math.floor(i / 3); r.base.set((col - 1) * 1.75, lin ? 0 : 3.25, lin ? 0.4 : -0.4); });
        centro.set(0, 0, 1.2); recuo = 2.6;
        camZ = Math.max(2.85 / tanH, 3.6 / tanV); camY = 3.3; olharY = 2.75;
      }
      robos.forEach((r) => { if (!r.iniciado) { r.pos.copy(r.base); r.iniciado = true; } });
      camera.position.set(0, camY, camZ); camera.lookAt(0, olharY, 0);
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(dispor).observe(palco);
    dispor();

    // quem vai para onde: sem ninguém escolhido, a fila; com alguém, ele vem para a frente e os outros dão
    // um passo para trás no próprio lugar (assim ninguém atravessa ninguém no caminho)
    let chegou = false, chegouEm = 0;
    estado.tem3D = true;
    const hud = secao.querySelector('[data-equipe-hud]');
    estado.aoEscolher = () => {
      chegou = false;
      if (hud) hud.dataset.ligado = 'false';
      if (!celular()) fichaEl.dataset.aberta = 'false';
      pedir();
    };
    if (estado.escolhido !== null && !celular()) fichaEl.dataset.aberta = 'false';
    function destinos() {
      robos.forEach((r, i) => {
        if (estado.escolhido === null) r.destino.copy(r.base);
        else if (i === estado.escolhido) r.destino.copy(centro);
        else r.destino.set(r.base.x * 1.1, r.base.y, r.base.z - recuo);
      });
    }

    // passar o mouse: espera um instante no mesmo robô antes de chamar, para ele não ir e voltar à toa
    const mouse = new THREE.Vector2(0, 0.2), raio = new THREE.Raycaster();
    let candidato = null, candidatoDesde = 0;
    function acertar(e) {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raio.setFromCamera(mouse, camera);
      const a = raio.intersectObjects(robos.map((x) => x.alvo))[0];
      return a ? robos.findIndex((x) => x.alvo === a.object) : null;
    }
    palco.addEventListener('pointermove', (e) => {
      pedir();
      if (estado.fixado || e.pointerType !== 'mouse') return;
      const i = acertar(e);
      if (i !== candidato) { candidato = i; candidatoDesde = performance.now(); }
    });
    palco.addEventListener('pointerleave', () => { candidato = null; });
    palco.addEventListener('pointerdown', (e) => {
      const i = acertar(e);
      if (i !== null) { estado.fixado = e.pointerType !== 'mouse'; escolher(i); }
    });

    const v = new THREE.Vector3(), d = new THREE.Vector3();
    let hudLado = 120;
    function posicionarFicha() {
      if (estado.escolhido === null || emCelular || celular()) return;
      v.set(centro.x, 2.4, centro.z).project(camera);
      const x = (v.x + 1) / 2 * largura, y = (1 - v.y) / 2 * altura, w = fichaEl.offsetWidth;
      // a ficha fica do lado de fora da mira do HUD
      fichaEl.style.left = `${palco.offsetLeft + Math.min(largura - w, x + hudLado + 36)}px`;
      fichaEl.style.top = `${palco.offsetTop + Math.max(0, Math.min(altura - fichaEl.offsetHeight, y - 60))}px`;
    }
    const angulo = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

    const relogio = new THREE.Clock();
    let visivel = true, pedido = 0;
    function pedir() { if (!pedido && visivel && !document.hidden) pedido = requestAnimationFrame(laco); }
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) { relogio.getDelta(); pedir(); } }).observe(palco);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { relogio.getDelta(); pedir(); } });

    // o gesto de cada serviço; k vai de 0 (parado) a 1 (gesto inteiro), a é o quanto ele está andando
    function gesto(r, k, a, t, dt, mov, suave) {
      const E = r.extra;
      if (r.def.tipo === 'agente') {
        r.bracos[1].rotation.z = 0.12 + k * (2.3 + Math.sin(t * 9) * 0.35 * mov);
        E.balao.scale.setScalar(Math.max(0.001, k));
        E.pontos.forEach((p, j) => { p.position.y = Math.max(0, Math.sin(t * 6 - j * 0.8)) * 0.05 * mov; });
        E.halo.rotation.z += dt * (0.6 + k * 4) * mov;
        E.jato.material.opacity = 0.12 + 0.06 * Math.sin(t * 9) * mov + a * 0.12;
      }
      if (r.def.tipo === 'automacao') {
        const vel = (0.4 + a * 2 + k * 4) * mov; E.e1.rotation.z += dt * vel; E.e2.rotation.z -= dt * vel * 1.5;
        r.bracos[0].rotation.x += -k * (0.9 + Math.sin(t * 7) * 0.4 * mov);
        const abre = 0.25 + Math.sin(t * 8) * 0.25 * k * mov;
        E.garra[0].rotation.z = abre; E.garra[1].rotation.z = -abre;
      }
      if (r.def.tipo === 'cobranca') {
        r.bracos[1].rotation.x += -k * 1.3;
        E.moeda.rotation.y += dt * (1 + k * 7) * mov;
        E.moeda.position.y = -0.92 + Math.abs(Math.sin(t * 4)) * k * 0.14 * mov;
        E.orbita.rotation.y += dt * (0.7 + k * 3) * mov;
        E.fenda.material.emissiveIntensity = 1.6 + k * 2.2 * (0.5 + 0.5 * Math.sin(t * 6));
      }
      if (r.def.tipo === 'painel') {
        E.rotores.forEach((h, j) => { h.rotation.y += dt * (22 + j) * mov; });
        E.holos.rotation.y = Math.sin(t * 0.6) * 0.25 * mov;
        E.holos.scale.setScalar(0.75 + 0.3 * k);
        E.holoMat.opacity = 0.08 + 0.16 * k;
        E.barras.forEach((b, j) => { b.scale.y = Math.max(0.15, b.userData.h * (0.35 + 0.65 * k * (0.75 + 0.25 * Math.sin(t * 3 + j) * mov))); b.position.y = b.userData.base + 0.15 * b.scale.y; });
        r.bracos[0].rotation.x += -k * 0.8; r.bracos[1].rotation.x += -k * 0.5 * (1 + Math.sin(t * 5) * 0.3 * mov);
      }
      if (r.def.tipo === 'software') {
        E.blocos.forEach((c, j) => { c.position.lerp(k > 0.5 ? c.userData.pilha : c.userData.solto, suave(4 - j)); c.rotation.y += ((k > 0.5 ? 0 : j * 0.6) - c.rotation.y) * suave(5); });
        r.bracos[0].rotation.x += -k * 0.5 * (0.6 + 0.4 * Math.sin(t * 6) * mov);
        r.bracos[1].rotation.x += -k * 0.5 * (0.6 + 0.4 * Math.sin(t * 6 + 1.5) * mov);
      }
      if (r.def.tipo === 'site') {
        E.cursor.position.x = 0.3 - k * 0.3; E.cursor.position.y = 2.37 - k * 0.27;
        E.botao.material.emissiveIntensity = 1.2 + k * (1.5 + Math.sin(t * 6) * 0.8 * mov) + r.ativa * 3;
        r.bracos[1].rotation.z = 0.12 + k * (0.9 + Math.sin(t * 4) * 0.2 * mov);
      }
    }

    // o jeito de cada um se mexer: passos, patas, esteira, bola ou flutuar
    function andarDoTipo(r, a, t, mov, extraY) {
      const s = Math.sin(r.passo), L = r.locomocao;
      r.boneco.rotation.set(0, 0, 0);
      if (L === 'pernas') {
        r.pernas[0].rotation.x = s * 0.6 * a; r.pernas[1].rotation.x = -s * 0.6 * a;
        r.boneco.position.y = Math.abs(Math.cos(r.passo)) * 0.08 * a + Math.sin(t * 1.6 + r.fase) * 0.03 * mov * (1 - a) + extraY;
        r.boneco.rotation.z = s * 0.05 * a;
      } else if (L === 'patas') {
        r.pernas.forEach((p) => { p.position.y = p.userData.y + Math.max(0, Math.sin(r.passo + p.userData.fase)) * 0.14 * a; });
        r.boneco.position.y = Math.abs(Math.sin(r.passo * 2)) * 0.03 * a + Math.sin(t * 1.4 + r.fase) * 0.025 * mov * (1 - a) + extraY;
      } else if (L === 'esteira') {
        r.rodas.forEach((w) => { w.rotation.x = r.passo * 0.7; });
        r.boneco.position.y = Math.sin(t * 40) * 0.008 * a + Math.sin(t * 1.2 + r.fase) * 0.015 * mov * (1 - a) + extraY;
        r.boneco.rotation.x = 0.05 * a;
      } else if (L === 'roda') {
        r.rodas.forEach((w) => { w.rotation.x = r.passo * 0.9; });
        r.boneco.position.y = Math.sin(t * 1.6 + r.fase) * 0.02 * mov + extraY;
        r.boneco.rotation.x = 0.16 * a + Math.sin(t * 2.2 + r.fase) * 0.025 * mov * (1 - a);
      } else {
        r.boneco.position.y = Math.sin(t * 1.8 + r.fase) * 0.09 * mov + extraY;
        r.boneco.rotation.x = 0.2 * a;
      }
    }

    function laco() {
      pedido = 0;
      const dt = Math.min(relogio.getDelta(), 0.1), t = relogio.elapsedTime, mov = quieto ? 0 : 1;
      const suave = (f) => Math.min(1, dt * f);
      // o candidato é usado uma vez só: depois de sair da seção, ninguém volta sozinho para o centro
      if (candidato !== null && performance.now() - candidatoDesde > 140) { if (candidato !== estado.escolhido) escolher(candidato); candidato = null; }
      destinos();
      const lider = estado.escolhido === null ? null : robos[estado.escolhido];
      let parado = true;

      robos.forEach((r, i) => {
        const E = r.extra, escolhidoAgora = i === estado.escolhido;
        // andar até o destino, virando o corpo para onde vai
        d.subVectors(r.destino, r.pos);
        const dist = d.length();
        if (quieto) r.pos.copy(r.destino);
        else if (dist > 0.001) r.pos.addScaledVector(d.normalize(), Math.min(dist, dt * (emCelular ? 2.6 : 3.6)));
        const andando = !quieto && dist > 0.05;
        if (andando) { r.passo += dt * 11; parado = false; }
        r.andar += ((andando ? 1 : 0) - r.andar) * suave(9);
        const rumo = andando ? Math.atan2(d.x, d.z) : 0;
        r.rot += angulo(rumo, r.rot) * suave(andando ? 9 : 5);
        r.g.rotation.y = r.rot;
        r.g.position.copy(r.pos);
        // quem está no centro cresce à medida que chega; os do fundo encolhem um pouco
        const perto = escolhidoAgora ? 1 - Math.min(1, r.pos.distanceTo(centro) / 3) : 0;
        const escala = escolhidoAgora ? 1 + 0.12 * perto : (lider ? 0.92 : 1);
        r.g.scale.setScalar(r.g.scale.x + (escala - r.g.scale.x) * suave(6));

        // chegada ao centro: pulinho, olhos acendem, a cabeça escaneia
        if (escolhidoAgora && !andando && !chegou) { chegou = true; chegouEm = t; r.ativa = 1; }
        const desdeChegada = escolhidoAgora && chegou ? t - chegouEm : 0;
        r.ativa = Math.max(0, r.ativa - dt * 1.1);
        const pulo = escolhidoAgora && chegou && desdeChegada < 0.45 ? Math.sin(desdeChegada / 0.45 * Math.PI) * 0.28 * mov : 0;

        const s = Math.sin(r.passo), a = r.andar;
        andarDoTipo(r, a, t, mov, pulo);

        // gesto do serviço: só depois de chegar e "ligar"
        const querGesto = escolhidoAgora && chegou && desdeChegada > 0.5 ? 1 : 0;
        r.k += (querGesto - r.k) * suave(quieto ? 30 : 5);
        if (Math.abs(r.k - querGesto) > 0.002 || r.ativa > 0) parado = false;
        const k = r.k;

        // braços balançam ao andar; o gesto toma conta quando ele chega
        const balanco = -s * (r.locomocao === 'pernas' ? 0.6 : 0.2) * a;
        r.bracos[0].rotation.x = balanco; r.bracos[1].rotation.x = -balanco;
        r.bracos[0].rotation.z = -0.12 - a * 0.08; r.bracos[1].rotation.z = 0.12 + a * 0.08;

        // para onde olha: o escolhido segue o cursor; os do fundo viram a cabeça para o escolhido
        let yaw;
        if (lider && !escolhidoAgora) yaw = THREE.MathUtils.clamp(angulo(Math.atan2(lider.pos.x - r.pos.x, lider.pos.z - r.pos.z + 0.01), r.rot), -0.9, 0.9) * 0.8;
        else yaw = THREE.MathUtils.clamp((mouse.x * (emCelular ? 2.5 : 6.5) - r.pos.x) * 0.09, -0.55, 0.55);
        if (escolhidoAgora && r.ativa > 0.2) yaw = Math.sin(desdeChegada * 11) * 0.5 * r.ativa;
        r.cabeca.rotation.y += (yaw * mov - r.cabeca.rotation.y) * suave(6);
        r.cabeca.rotation.x += ((escolhidoAgora ? -mouse.y * 0.22 : 0.05) * mov - r.cabeca.rotation.x) * suave(5);

        r.piscar -= dt;
        if (r.piscar < 0) r.piscar = 2.5 + Math.random() * 4;
        r.olhos.forEach((o) => { o.scale.y = r.piscar < 0.12 && !quieto ? 0.15 : 1; });
        r.olhoMat.emissiveIntensity = r.brilho * (lider && !escolhidoAgora ? 0.55 : 1) + r.ativa * 4;
        if (E.ponta) E.ponta.material.emissiveIntensity = 1.6 + Math.sin(t * 3 + r.fase) * 0.6 * mov + k + r.ativa * 3;

        gesto(r, k, a, t, dt, mov, suave);
      });

      // luz de palco e câmera chegando um pouco mais perto quando alguém está no centro
      const temLider = lider ? 1 : 0;
      foco.intensity += ((temLider ? 60 : 0) - foco.intensity) * suave(4);
      foco.target.position.copy(centro);
      foco.position.set(centro.x, 8, centro.z + 3);
      const zAlvo = camZ * (temLider ? 0.88 : 1);
      camera.position.z += (zAlvo - camera.position.z) * suave(3);
      olharX += ((temLider && !emCelular ? centro.x * 0.35 : 0) - olharX) * suave(3);
      camera.lookAt(olharX, olharY - (temLider ? 0.15 : 0), 0);

      // anéis e mira (HUD) em volta de quem chegou ao centro
      anelMat.opacity += ((lider && chegou ? 0.85 : 0) - anelMat.opacity) * suave(5);
      if (lider) { anel.position.x = lider.pos.x; anel.position.z = lider.pos.z; anel.scale.setScalar(lider.g.scale.x); }
      tracos.rotation.z -= dt * 0.6 * mov;
      if (hud) {
        if (lider && chegou) {
          const esc = lider.g.scale.x;
          v.set(lider.pos.x, 2.95 * esc, lider.pos.z).project(camera); const topo = (1 - v.y) / 2 * altura;
          v.set(lider.pos.x, -0.05, lider.pos.z).project(camera); const base = (1 - v.y) / 2 * altura, meio = (v.x + 1) / 2 * largura;
          const lado = (base - topo) * 0.42; hudLado = lado;
          Object.assign(hud.style, { left: `${meio - lado}px`, top: `${topo}px`, width: `${lado * 2}px`, height: `${base - topo}px` });
          if (hud.dataset.ligado !== 'true') {
            const def = lider.def;
            hud.querySelector('[data-hud-topo]').innerHTML = `<span>${def.codigo} ${def.nome}</span><span>sistema ligado</span>`;
            hud.querySelector('[data-hud-base]').innerHTML = `<span>${def.servico}</span><span>pronto</span>`;
            hud.dataset.ligado = 'true';
          }
        } else hud.dataset.ligado = 'false';
      }

      // a ficha abre quando ele termina de chegar
      if (lider && chegou && t - chegouEm > 0.35 && fichaEl.dataset.aberta !== 'true') fichaEl.dataset.aberta = 'true';
      posicionarFicha();
      renderer.render(cena, camera);
      secao.classList.add('equipe--3d');
      if (!quieto || !parado || Math.abs(camera.position.z - zAlvo) > 0.01 || Math.abs(anelMat.opacity - (lider && chegou ? 0.85 : 0)) > 0.01) pedir();
    }
    pedir();
    iniciarAcompanha();

    // Robô que acompanha a rolagem em "O que fazemos": fica no vão entre o texto e a demonstração de cada
    // serviço e troca de robô, num feixe de luz, quando a pessoa chega ao próximo serviço. Só em tela larga.
    function iniciarAcompanha() {
      const oferta = document.querySelector('#o-que-fazemos');
      const linhas = oferta ? [...oferta.querySelectorAll('.servico')] : [];
      if (linhas.length !== EQUIPE.length || !matchMedia('(min-width: 1250px)').matches) return;
      oferta.classList.add('oferta--acompanha');
      const trilha = document.createElement('div');
      trilha.className = 'acompanha';
      trilha.setAttribute('aria-hidden', 'true');
      trilha.innerHTML = '<div class="acompanha__palco"><p class="acompanha__nome"></p></div>';
      oferta.append(trilha);
      const palcoA = trilha.firstElementChild, nomeEl = palcoA.firstElementChild;
      const r2 = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      r2.setPixelRatio(Math.min(devicePixelRatio, 2));
      r2.toneMapping = THREE.ACESFilmicToneMapping;
      r2.setSize(210, 280, false);
      palcoA.prepend(r2.domElement);
      const c2 = new THREE.Scene();
      c2.environment = new THREE.PMREMGenerator(r2).fromScene(new RoomEnvironment(), 0.04).texture;
      c2.add(new THREE.HemisphereLight(0xE8ECF2, 0x07090D, 0.5));
      const luz2 = new THREE.DirectionalLight(0xFFE9C4, 1.6); luz2.position.set(3, 6, 5); c2.add(luz2);
      const cam2 = new THREE.PerspectiveCamera(30, 210 / 280, 0.1, 50);
      cam2.position.set(0, 1.9, 8.6); cam2.lookAt(0, 1.5, 0);
      const bots = EQUIPE.map((d) => { const b = montar(d, c2); b.g.visible = false; b.g.rotation.y = 0.35; return b; });
      // o feixe do teletransporte
      const feixeMat = new THREE.MeshBasicMaterial({ color: 0xF3DFA2, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const feixe = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 4.4, 40, 1, true), feixeMat);
      feixe.position.y = 2; c2.add(feixe);

      // a trilha ocupa só a altura da lista de serviços, no meio do vão entre as duas colunas
      const ajustar = () => {
        const primeira = linhas[0], ultima = linhas.at(-1), demo = primeira.querySelector('.demo');
        const vao = parseFloat(getComputedStyle(primeira).columnGap) || 200;
        trilha.style.top = `${primeira.offsetTop}px`;
        trilha.style.height = `${ultima.offsetTop + ultima.offsetHeight - primeira.offsetTop}px`;
        trilha.style.left = `${demo.offsetLeft - vao / 2 - 105}px`;
      };
      new ResizeObserver(ajustar).observe(oferta);
      ajustar();

      let atual = -1, proximo = -1, fase = 0, desde = 0, rodando2 = false, pedido2 = 0;
      const dur = quieto ? 0.0001 : 0.38;
      const olho = new IntersectionObserver((vistos) => vistos.forEach((v) => { if (v.isIntersecting) { proximo = linhas.indexOf(v.target); pedir2(); } }), { rootMargin: '-45% 0px -45% 0px' });
      linhas.forEach((l) => olho.observe(l));
      new IntersectionObserver(([v]) => { rodando2 = v.isIntersecting; if (rodando2) { relogio2.getDelta(); pedir2(); } }).observe(trilha);
      const relogio2 = new THREE.Clock();
      function pedir2() { if (!pedido2 && rodando2 && !document.hidden) pedido2 = requestAnimationFrame(quadro2); }
      const nomear = (i) => { nomeEl.textContent = `${EQUIPE[i].codigo} ${EQUIPE[i].nome}`; };

      function quadro2() {
        pedido2 = 0;
        const dt = Math.min(relogio2.getDelta(), 0.1), t = relogio2.elapsedTime, mov = quieto ? 0 : 1, suave = (f) => Math.min(1, dt * f);
        if (proximo >= 0 && proximo !== atual && fase === 0) {
          desde = t;
          if (atual < 0) { atual = proximo; bots[atual].g.visible = true; nomear(atual); fase = 2; } else fase = 1;
        }
        const p = (t - desde) / dur;
        if (fase === 1) {
          // o atual some para cima dentro do feixe
          const b = bots[atual], e = Math.min(1, p);
          b.g.scale.set(1 - e * 0.6, Math.max(0.01, 1 - e), 1 - e * 0.6);
          feixeMat.opacity = e * 0.45;
          if (p >= 1) { b.g.visible = false; b.g.scale.setScalar(1); b.k = 0; atual = proximo; bots[atual].g.visible = true; nomear(atual); fase = 2; desde = t; }
        } else if (fase === 2) {
          // o novo aparece de baixo para cima e acende
          const b = bots[atual], e = Math.min(1, p);
          b.g.scale.set(0.4 + 0.6 * e, Math.max(0.01, e), 0.4 + 0.6 * e);
          feixeMat.opacity = (1 - e) * 0.45;
          if (p >= 1) { fase = 0; b.g.scale.setScalar(1); feixeMat.opacity = 0; b.ativa = 1; }
        }
        trilha.dataset.ligado = String(atual >= 0);
        const b = bots[atual];
        if (b) {
          andarDoTipo(b, 0, t, mov, 0);
          b.cabeca.rotation.y = (0.2 + Math.sin(t * 0.8) * 0.15) * mov;
          b.piscar -= dt;
          if (b.piscar < 0) b.piscar = 2.5 + Math.random() * 4;
          b.olhos.forEach((o) => { o.scale.y = b.piscar < 0.12 && !quieto ? 0.15 : 1; });
          b.ativa = Math.max(0, b.ativa - dt * 1.1);
          b.olhoMat.emissiveIntensity = b.brilho + b.ativa * 4;
          b.k += ((fase === 0 ? 1 : 0) - b.k) * suave(4);
          // os gestos somam em cima da posição de descanso dos braços, então ela volta a cada quadro
          b.bracos[0].rotation.set(0, 0, -0.12); b.bracos[1].rotation.set(0, 0, 0.12);
          gesto(b, b.k, 0, t, dt, mov, suave);
        }
        r2.render(c2, cam2);
        if (!quieto || fase !== 0 || (b && Math.abs(b.k - 1) > 0.002)) pedir2();
      }
    }
  }
}
