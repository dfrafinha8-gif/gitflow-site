// A equipe de robôs: cada serviço vira um robô em 3D. A ficha e os nomes funcionam sem WebGL;
// o Three.js (vendor/) só é baixado quando a seção chega perto da tela.
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
  let escolhido = null, fixado = false, aoEscolher = () => {};

  function escolher(i) {
    escolhido = i;
    [...nomesEl.children].forEach((b, j) => b.setAttribute('aria-pressed', j === i));
    if (i === null) { fichaEl.dataset.aberta = 'false'; aoEscolher(); return; }
    const d = EQUIPE[i];
    fichaEl.innerHTML = `<p class="equipe__codigo"><span>${d.codigo}</span><b>${d.servico}</b></p><h3>${d.nome}</h3><p>${d.faz}</p><ul>${d.itens.map((t) => `<li>${t}</li>`).join('')}</ul><dl>${d.ficha.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl><div class="equipe__acoes"><a class="botao" href="#contato" data-contratar>Contratar o ${d.nome}</a><a href="servicos/${d.slug}/">Ver como funciona</a></div>`;
    fichaEl.querySelector('[data-contratar]').addEventListener('click', () => {
      const campo = document.querySelector('[data-interesse-campo]');
      if (campo) campo.value = d.interesse;
      window.umami?.track('botao-contato', { origem: 'equipe', servico: d.interesse });
    });
    fichaEl.dataset.aberta = 'true';
    aoEscolher();
  }

  EQUIPE.forEach((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<small>${d.codigo}</small>${d.nome}<span class="so-leitor">, ${d.servico}</span>`;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('mouseenter', () => { if (!fixado) escolher(i); });
    b.addEventListener('focus', () => escolher(i));
    b.addEventListener('click', () => { fixado = true; escolher(i); });
    nomesEl.append(b);
  });
  secao.addEventListener('mouseleave', () => { if (!fixado && !celular()) escolher(null); });
  // no celular sempre tem um robô escolhido, para a ficha não aparecer e sumir embaixo do dedo
  if (celular()) escolher(0);

  new IntersectionObserver(([v], olho) => {
    if (!v.isIntersecting) return;
    olho.disconnect();
    iniciar3D().catch(() => secao.classList.add('equipe--sem-3d'));
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
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cena.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    cena.add(new THREE.HemisphereLight(0xE8ECF2, 0x07090D, 0.35));
    const chave = new THREE.DirectionalLight(0xFFE9C4, 1.6); chave.position.set(4, 7, 6); cena.add(chave);
    const contra = new THREE.DirectionalLight(0x9FB4D0, 1.1); contra.position.set(-5, 4, -6); cena.add(contra);

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

    function montar(def) {
      const g = new THREE.Group(), corpoMat = M[def.corpo], extra = {};
      const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, depthWrite: false }));
      sombra.rotation.x = -Math.PI / 2; sombra.position.y = 0.01; g.add(sombra);
      [-0.24, 0.24].forEach((x) => {
        const pe = caixa(0.32, 0.16, 0.44, 0.07, M.grafite); pe.position.set(x, 0.08, 0.04); g.add(pe);
        const perna = capsula(0.1, 0.32, M.grafite); perna.position.set(x, 0.42, 0); g.add(perna);
      });
      const tronco = new THREE.Group(); tronco.position.y = 1.15; g.add(tronco);
      tronco.add(caixa(1.1, 1.05, 0.78, 0.24, corpoMat));
      const peito = caixa(0.62, 0.42, 0.06, 0.05, M.visor); peito.position.set(0, 0.06, 0.4); tronco.add(peito);
      const bracos = [-1, 1].map((lado) => {
        const ombro = new THREE.Group(); ombro.position.set(lado * 0.67, 0.32, 0); ombro.rotation.z = lado * 0.12; tronco.add(ombro);
        const b = capsula(0.11, 0.5, M.grafite); b.position.y = -0.34; ombro.add(b);
        const mao = esfera(0.14, corpoMat); mao.position.y = -0.7; ombro.add(mao);
        return ombro;
      });
      const cabeca = new THREE.Group(); cabeca.position.y = 2.06; g.add(cabeca);
      let olhos;
      if (def.tipo === 'site') {
        cabeca.add(caixa(1.2, 0.86, 0.14, 0.08, M.grafite));
        const tela = caixa(1.08, 0.62, 0.04, 0.03, M.papel); tela.position.set(0, -0.06, 0.07); cabeca.add(tela);
        [-0.44, -0.36, -0.28].forEach((x) => { const d = esfera(0.025, M.luzBronze); d.position.set(x, 0.33, 0.08); cabeca.add(d); });
        const olhoMat = new THREE.MeshStandardMaterial({ color: 0x0C1016, roughness: 0.4 });
        olhos = [-0.2, 0.2].map((x) => { const o = capsula(0.05, 0.08, olhoMat); o.position.set(x, 0, 0.1); cabeca.add(o); return o; });
        extra.botao = caixa(0.36, 0.1, 0.03, 0.02, luz(0xF3DFA2, 1.2)); extra.botao.position.set(0, -0.24, 0.1); cabeca.add(extra.botao);
        extra.cursor = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 3), M.grafite); extra.cursor.rotation.z = 0.5; extra.cursor.position.set(0.3, 2.05, 0.2); g.add(extra.cursor);
      } else {
        cabeca.add(caixa(0.98, 0.74, 0.78, 0.26, corpoMat));
        const rosto = caixa(0.8, 0.46, 0.06, 0.12, M.visor); rosto.position.set(0, -0.02, 0.38); cabeca.add(rosto);
        const olhoMat = luz(0xF3DFA2, 2.2);
        olhos = [-0.19, 0.19].map((x) => { const o = capsula(0.055, 0.09, olhoMat); o.position.set(x, 0, 0.42); cabeca.add(o); return o; });
        const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 8), M.grafite); haste.position.y = 0.5; cabeca.add(haste);
        extra.ponta = esfera(0.06, luz(0xF3DFA2, 2)); extra.ponta.position.y = 0.67; cabeca.add(extra.ponta);
      }
      if (def.tipo === 'agente') {
        const arco = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.035, 8, 28, Math.PI), M.grafite); arco.position.y = 0.06; cabeca.add(arco);
        [-1, 1].forEach((l) => { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.1, 20), M.ouro); f.rotation.z = Math.PI / 2; f.position.set(l * 0.53, 0.02, 0); cabeca.add(f); });
        const microfone = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.42, 6), M.grafite); microfone.rotation.z = Math.PI / 2.6; microfone.position.set(0.38, -0.2, 0.3); cabeca.add(microfone);
        const mic = esfera(0.045, luz(0xF3DFA2, 2)); mic.position.set(0.2, -0.27, 0.43); cabeca.add(mic);
        extra.balao = new THREE.Group(); extra.balao.position.set(0.75, 2.85, 0.2); extra.balao.scale.setScalar(0.001);
        extra.balao.add(caixa(0.62, 0.34, 0.08, 0.12, M.papel));
        extra.pontos = [-0.15, 0, 0.15].map((x) => { const d = esfera(0.04, M.grafite); d.position.set(x, 0, 0.05); extra.balao.add(d); return d; });
        g.add(extra.balao);
      }
      if (def.tipo === 'automacao') {
        extra.e1 = engrenagem(0.17, 10, M.ouro); extra.e1.position.set(-0.1, 0.06, 0.42); tronco.add(extra.e1);
        extra.e2 = engrenagem(0.11, 8, M.bronze); extra.e2.position.set(0.15, 0.12, 0.42); tronco.add(extra.e2);
      }
      if (def.tipo === 'cobranca') {
        extra.moeda = new THREE.Group();
        const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 40), M.ouro); disco.rotation.x = Math.PI / 2; extra.moeda.add(disco);
        const aro = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 6, 32), M.bronze); aro.position.z = 0.03; extra.moeda.add(aro);
        extra.moeda.position.set(0, -0.95, 0.15); bracos[1].add(extra.moeda);
      }
      if (def.tipo === 'painel') {
        extra.barras = [0.5, 0.8, 0.6, 1].map((h, i) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.02), i === 3 ? luz(0xF3DFA2, 2.2) : M.luzBronze); b.position.set(-0.18 + i * 0.12, -0.08, 0.44); b.userData.h = h; tronco.add(b); return b; });
      }
      if (def.tipo === 'software') {
        extra.blocos = [M.ouro, M.prata, M.bronze].map((m, i) => {
          const c = caixa(0.26, 0.26, 0.26, 0.04, m);
          c.userData.solto = new THREE.Vector3(0.95 + (i - 1) * 0.3, 0.13, 0.35 + (i % 2) * 0.15);
          c.userData.pilha = new THREE.Vector3(0.95, 0.13 + i * 0.27, 0.3);
          c.position.copy(c.userData.solto); c.rotation.y = i * 0.6; g.add(c); return c;
        });
      }
      const alvo = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1.2), new THREE.MeshBasicMaterial({ visible: false })); alvo.position.y = 1.4; g.add(alvo);
      cena.add(g);
      return { def, g, cabeca, bracos, olhos, extra, alvo, k: 0, fase: Math.random() * 6, piscar: 2 + Math.random() * 4, base: new THREE.Vector3() };
    }
    const robos = EQUIPE.map(montar);

    let largura = 1, altura = 1, emCelular = false;
    function dispor() {
      largura = palco.clientWidth; altura = palco.clientHeight;
      renderer.setSize(largura, altura, false);
      camera.aspect = largura / altura;
      emCelular = camera.aspect < 0.9;
      const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), tanH = tanV * camera.aspect;
      if (!emCelular) {
        const passo = 2.15;
        robos.forEach((r, i) => { const x = (i - 2.5) * passo; r.base.set(x, 0, -Math.abs(x) * 0.18); });
        camera.position.set(0, 2.2, Math.max((2.5 * passo + 1.1) / tanH, 3.2 / tanV));
        camera.lookAt(0, 1.45, 0);
      } else {
        robos.forEach((r, i) => { const col = i % 3, lin = Math.floor(i / 3); r.base.set((col - 1) * 1.75, lin ? 0 : 3.25, lin ? 0.4 : -0.4); });
        camera.position.set(0, 3.3, Math.max(2.85 / tanH, 3.6 / tanV));
        camera.lookAt(0, 2.75, 0);
      }
      robos.forEach((r) => r.g.position.copy(r.base));
      camera.updateProjectionMatrix();
    }
    new ResizeObserver(dispor).observe(palco);
    dispor();

    const mouse = new THREE.Vector2(0, 0.2), raio = new THREE.Raycaster();
    function apontar(e) {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raio.setFromCamera(mouse, camera);
      const acerto = raio.intersectObjects(robos.map((x) => x.alvo))[0];
      const i = acerto ? robos.findIndex((x) => x.alvo === acerto.object) : null;
      if (e.type === 'pointerdown') { if (i !== null) { fixado = true; escolher(i); } return; }
      if (fixado || e.pointerType !== 'mouse') return;
      if (i !== escolhido) escolher(i);
    }
    renderer.domElement.addEventListener('pointermove', apontar);
    renderer.domElement.addEventListener('pointerdown', apontar);

    // no computador a ficha acompanha o robô escolhido; no celular ela fica embaixo dos nomes
    const v = new THREE.Vector3();
    aoEscolher = () => { if (emCelular || escolhido === null) fichaEl.style.removeProperty('left'); };
    function posicionarFicha() {
      if (escolhido === null || emCelular || celular()) return;
      const r = robos[escolhido];
      v.set(r.g.position.x, 2.3, r.g.position.z).project(camera);
      const x = (v.x + 1) / 2 * largura, y = (1 - v.y) / 2 * altura, w = fichaEl.offsetWidth;
      // a ficha fica na seção, fora do palco: soma onde o palco começa
      fichaEl.style.left = `${palco.offsetLeft + (x + 90 + w < largura ? x + 90 : x - 90 - w)}px`;
      fichaEl.style.top = `${palco.offsetTop + Math.max(0, Math.min(altura - fichaEl.offsetHeight, y - 80))}px`;
    }

    const relogio = new THREE.Clock();
    let visivel = true, pedido = 0;
    const pedir = () => { if (!pedido && visivel && !document.hidden) pedido = requestAnimationFrame(laco); };
    new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) { relogio.getDelta(); pedir(); } }).observe(palco);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { relogio.getDelta(); pedir(); } });

    function laco() {
      pedido = 0;
      const dt = Math.min(relogio.getDelta(), 0.05), t = relogio.elapsedTime, mov = quieto ? 0 : 1;
      const olharX = mouse.x * (emCelular ? 2.5 : 6.5), suave = (f) => Math.min(1, dt * f);
      robos.forEach((r, i) => {
        r.k += ((escolhido === i ? 1 : 0) - r.k) * suave(7);
        const k = r.k, E = r.extra;
        r.g.position.y = r.base.y + Math.sin(t * 1.6 + r.fase) * 0.04 * mov + k * 0.08;
        r.g.position.z = r.base.z + k * 0.7;
        const esc = 1 + k * 0.1 - (escolhido !== null && escolhido !== i ? 0.04 : 0);
        r.g.scale.setScalar(r.g.scale.x + (esc - r.g.scale.x) * suave(8));
        r.cabeca.rotation.y += (THREE.MathUtils.clamp((olharX - r.base.x) * 0.09, -0.55, 0.55) * mov - r.cabeca.rotation.y) * suave(5);
        r.cabeca.rotation.x += (-mouse.y * 0.22 * mov - r.cabeca.rotation.x) * suave(5);
        r.piscar -= dt;
        const fechado = r.piscar < 0.12 && !quieto;
        if (r.piscar < 0) r.piscar = 2.5 + Math.random() * 4;
        r.olhos.forEach((o) => { o.scale.y = fechado ? 0.15 : 1; });
        if (E.ponta) E.ponta.material.emissiveIntensity = 1.6 + Math.sin(t * 3 + r.fase) * 0.6 * mov + k;
        if (r.def.tipo === 'agente') {
          r.bracos[1].rotation.z = 0.12 + k * (2.2 + Math.sin(t * 9) * 0.35 * mov);
          E.balao.scale.setScalar(Math.max(0.001, k));
          E.pontos.forEach((p, j) => { p.position.y = Math.max(0, Math.sin(t * 6 - j * 0.8)) * 0.05 * mov; });
        }
        if (r.def.tipo === 'automacao') { const vel = (0.4 + k * 3.5) * mov; E.e1.rotation.z += dt * vel; E.e2.rotation.z -= dt * vel * 1.5; }
        if (r.def.tipo === 'cobranca') { r.bracos[1].rotation.x = -k * 1.1; E.moeda.rotation.y += dt * (1 + k * 6) * mov; E.moeda.position.y = -0.95 + Math.abs(Math.sin(t * 4)) * k * 0.12 * mov; }
        if (r.def.tipo === 'painel') E.barras.forEach((b, j) => { b.scale.y = Math.max(0.15, b.userData.h * (0.35 + 0.65 * k * (0.75 + 0.25 * Math.sin(t * 3 + j) * mov))); b.position.y = -0.2 + 0.15 * b.scale.y; });
        if (r.def.tipo === 'software') E.blocos.forEach((c, j) => { c.position.lerp(k > 0.5 ? c.userData.pilha : c.userData.solto, suave(4 - j)); c.rotation.y += ((k > 0.5 ? 0 : j * 0.6) - c.rotation.y) * suave(5); });
        if (r.def.tipo === 'site') { E.cursor.position.x = 0.3 - k * 0.3; E.cursor.position.y = 2.05 - k * 0.26; E.botao.material.emissiveIntensity = 1.2 + k * (1.5 + Math.sin(t * 6) * 0.8 * mov); }
      });
      posicionarFicha();
      renderer.render(cena, camera);
      secao.classList.add('equipe--3d');
      // parado e sem ninguém escolhido, com menos movimento pedido, não precisa redesenhar sem parar
      if (!quieto || robos.some((r) => Math.abs(r.k - (escolhido === robos.indexOf(r) ? 1 : 0)) > 0.002)) pedir();
    }
    renderer.domElement.addEventListener('pointermove', pedir);
    nomesEl.addEventListener('focusin', pedir);
    nomesEl.addEventListener('mouseover', pedir);
    pedir();
  }
}
