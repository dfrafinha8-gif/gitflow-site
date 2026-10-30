// A história do site: um dia na empresa, conduzido pela rolagem.
// As mesmas partículas formam o logo, os fios, o grafo e o nome dos sócios.
// WebGL puro, sem biblioteca. Os textos funcionam mesmo se a placa de vídeo não ajudar.
(async () => {
  const trilho = document.querySelector('[data-trilho]');
  const palco = document.querySelector('[data-palco]');
  const tela = document.querySelector('[data-tela]');
  const logo = document.querySelector('[data-logo]');
  const sol = document.querySelector('[data-sol]');
  const ouro = document.querySelector('[data-ouro]');
  const abre = document.querySelector('[data-abre]');
  const aviso = document.querySelector('[data-aviso]');
  const espera = document.querySelector('[data-espera]');
  const relogio = document.querySelector('[data-relogio]');
  const horas = [...document.querySelectorAll('[data-hora]')];
  const fecho = document.querySelector('[data-fecho]');
  const pular = document.querySelector('[data-pular]');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pequeno = innerWidth < 760;
  const fraco = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const N = pequeno ? (fraco ? 14000 : 26000) : (fraco ? 40000 : 80000);
  const CAM = 3.4;
  const TAN = Math.tan(20 * Math.PI / 180);

  // Estações da rolagem: 0 abertura, 1 a 6 as horas do dia, 7 o fecho
  const FORMA = [0, 1, 2, 2, 2, 2, 2, 3];
  const MINUTOS = [22 * 60 + 7, 22 * 60 + 7, 31 * 60 + 30, 33 * 60, 36 * 60 + 20, 38 * 60 + 15, 42 * 60 + 40, 42 * 60 + 40];
  const SOL = [0, .1, .55, .8, 1, .9, .45, 0];
  const mapa = (lista, s) => {
    const i = Math.min(Math.floor(s), lista.length - 2);
    return lista[i] + (lista[i + 1] - lista[i]) * (s - i);
  };

  const gl = tela.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });

  // Lê os pixels de um desenho e devolve N pontos em -1..1
  function amostrar(desenhar) {
    const L = pequeno ? 600 : 900;
    const c = document.createElement('canvas');
    c.width = c.height = L;
    const x = c.getContext('2d', { willReadFrequently: true });
    desenhar(x, L);
    const d = x.getImageData(0, 0, L, L).data;
    const cheios = [];
    for (let j = 0; j < L; j++) for (let i = 0; i < L; i++) if (d[(j * L + i) * 4 + 3] > 128) cheios.push(i, j);
    const s = new Float32Array(N * 3);
    for (let k = 0; k < N; k++) {
      const r = Math.floor(Math.random() * cheios.length / 2) * 2;
      s[k * 3] = (cheios[r] + Math.random()) / L * 2 - 1;
      s[k * 3 + 1] = 1 - (cheios[r + 1] + Math.random()) / L * 2;
      s[k * 3 + 2] = (Math.random() - .5) * .03;
    }
    return s;
  }

  // Fios que saem do centro: o trabalho repetido, sem forma
  function fios() {
    const s = new Float32Array(N * 3);
    const F = 520;
    const fio = [];
    for (let i = 0; i < F; i++) fio.push([Math.random() * Math.PI * 2, Math.random() * 6.28, .55 + Math.random() * .75, .25 + Math.random() * .6]);
    for (let k = 0; k < N; k++) {
      const [a, f, comp, curva] = fio[k % F];
      const t = Math.pow(Math.random(), .75);
      const r = .03 + t * comp * .86;
      const ang = a + Math.sin(t * 3.1 + f) * curva;
      s[k * 3] = Math.cos(ang) * r * 1.2 + (Math.random() - .5) * .005;
      s[k * 3 + 1] = Math.sin(ang) * r * .95 + (Math.random() - .5) * .005;
      s[k * 3 + 2] = (t - .5) * .7 * Math.sin(a * 3);
    }
    return s;
  }

  // O grafo de branches: o mesmo trabalho, agora organizado
  function grafo() {
    const s = new Float32Array(N * 3);
    const ramos = [[.92, .34, .72], [.3, -.28, -.72], [-.2, -.82, .58]];
    const nos = [[0, 1.02], [.72, .63], [0, .3], [-.72, .01], [0, -.28], [.58, -.51], [0, -.92]];
    const suave = (v) => v * v * (3 - 2 * v);
    for (let k = 0; k < N; k++) {
      const q = Math.random();
      let x;
      let y;
      if (q < .3) {
        x = 0;
        y = 1.02 - Math.random() * 1.94;
      } else if (q < .68) {
        const [a, b, X] = ramos[k % 3];
        const t = Math.random();
        x = X * suave(Math.min(1, Math.min(t, 1 - t) / .28));
        y = a + (b - a) * t;
      } else {
        const [cx, cy] = nos[k % nos.length];
        const ang = Math.random() * 6.283;
        const r = k % 3 ? .062 + Math.random() * .012 : Math.sqrt(Math.random()) * .034;
        x = cx + Math.cos(ang) * r;
        y = cy + Math.sin(ang) * r;
      }
      s[k * 3] = x + (Math.random() - .5) * .012;
      s[k * 3 + 1] = y + (Math.random() - .5) * .012;
      s[k * 3 + 2] = (Math.random() - .5) * .02;
    }
    return s;
  }

  const VERT = `
    attribute vec3 a0,a1,a2,a3,rnd;
    uniform float uP,uT,uTam,uEsc,uAsp,uEntrada; uniform vec2 uPos,uM,uRot; varying vec3 vCor;
    void main(){
      float s=min(floor(uP),2.); float f=uP-s;
      float ff=clamp(f*1.7-rnd.x*.7,0.,1.); ff=ff*ff*(3.-2.*ff);
      vec3 de=s<.5?a0:(s<1.5?a1:a2), para=s<.5?a1:(s<1.5?a2:a3);
      vec3 p=mix(de,para,ff);
      float b=sin(ff*3.14159);
      p+=vec3(sin(p.y*4.+rnd.y*6.+uT*.6),cos(p.x*4.+rnd.z*6.+uT*.5),sin(p.x*3.+p.y*3.+uT*.4))*(b*.28+.0035);
      vec2 d=p.xy-uM; float m=exp(-dot(d,d)*22.);
      p.xy+=normalize(d+.0001)*m*.2;
      p=mix((rnd-.5)*vec3(5.,3.,1.),p,uEntrada);
      float cy=cos(uRot.x),sy=sin(uRot.x),cx=cos(uRot.y),sx=sin(uRot.y);
      p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
      p=vec3(p.x,cx*p.y-sx*p.z,sx*p.y+cx*p.z);
      vec3 w=p*uEsc+vec3(uPos,0.);
      float dist=${CAM.toFixed(1)}-w.z;
      vec3 ouro=vec3(.83,.74,.5), prata=vec3(.72,.76,.81), bronze=vec3(.79,.55,.31);
      vCor=(rnd.y<.72?ouro:(rnd.y<.9?prata:bronze))+m*.25;
      gl_Position=vec4(w.x/(${TAN.toFixed(5)}*uAsp),w.y/${TAN.toFixed(5)},0.,dist);
      gl_PointSize=uTam*(.8+rnd.z*.9)*(${CAM.toFixed(1)}/dist);
    }`;
  const FRAG = `
    precision mediump float; varying vec3 vCor; uniform float uTinta,uLuz;
    void main(){
      vec2 c=gl_PointCoord-.5; if(dot(c,c)>.25) discard;
      gl_FragColor=vec4(mix(vCor*uLuz,vec3(.047,.063,.086),uTinta),1.);
    }`;

  let u = null;
  let desenhar = 0;
  let emEsc = 1;
  let emPos = [0, 0];

  function compilar(tipo, fonte) {
    const s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    return s;
  }

  async function preparar() {
    await document.fonts.load('700 200px Saira');
    const img = await new Promise((ok, erro) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = erro;
      i.src = logo.getAttribute('src');
    });
    // Para trocar os nomes pelas fotos dos sócios, basta desenhar a foto recortada neste último amostrar.
    const formas = [
      amostrar((x, L) => x.drawImage(img, 0, 0, L, L)),
      fios(),
      grafo(),
      amostrar((x, L) => {
        x.font = `700 ${L * .235}px Saira`;
        x.fontStretch = 'expanded';
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillStyle = '#000';
        x.fillText('RAFA', L / 2, L * .37);
        x.fillText('LUCAS', L / 2, L * .63);
      }),
    ];
    const prog = gl.createProgram();
    gl.attachShader(prog, compilar(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compilar(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const atributo = (nome, dados) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, dados, gl.STATIC_DRAW);
      const l = gl.getAttribLocation(prog, nome);
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, 3, gl.FLOAT, false, 0, 0);
    };
    formas.forEach((f, i) => atributo(`a${i}`, f));
    const rnd = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) rnd[i] = Math.random();
    atributo('rnd', rnd);
    u = {};
    ['uP', 'uT', 'uTam', 'uEsc', 'uAsp', 'uEntrada', 'uPos', 'uM', 'uRot', 'uTinta', 'uLuz'].forEach((n) => { u[n] = gl.getUniformLocation(prog, n); });
    desenhar = N;
  }

  let larg = 0;
  let alt = 0;
  function medir() {
    const w = tela.clientWidth;
    const h = tela.clientHeight;
    // A barra de endereço do celular muda a altura ao rolar: isso não pode refazer a tela
    if (w === larg && Math.abs(h - alt) < 120) return;
    larg = w;
    alt = h;
    const dpr = Math.min(devicePixelRatio, 2);
    tela.width = w * dpr;
    tela.height = h * dpr;
    gl.viewport(0, 0, tela.width, tela.height);
    const asp = w / h;
    const meiaL = TAN * CAM * asp;
    if (asp < 1) {
      emEsc = Math.min(.6, asp * 1.15);
      emPos = [.1, .28];
    } else {
      emEsc = Math.min(1.08, meiaL * .68);
      emPos = [Math.min(.98, meiaL - 1.02 * emEsc), .02];
    }
    gl.uniform1f(u.uTam, (pequeno ? 1.5 : 1.75) * dpr * Math.max(.8, h / 900));
    gl.uniform1f(u.uAsp, asp);
    gl.uniform1f(u.uEsc, emEsc);
    gl.uniform2f(u.uPos, emPos[0], emPos[1]);
  }

  let pronto = false;
  if (gl) {
    try {
      await preparar();
      gl.clearColor(0, 0, 0, 0);
      medir();
      addEventListener('resize', medir);
      pronto = true;
    } catch (e) {
      pronto = false;
    }
  }
  if (!pronto) {
    tela.hidden = true;
    if (!pequeno) logo.hidden = false;
  }

  let mx = 9;
  let my = 9;
  let cmx = 9;
  let cmy = 9;
  let px = 0;
  let py = 0;
  let rx = 0;
  let ry = 0;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const a = TAN * CAM;
    const nx = e.clientX / innerWidth * 2 - 1;
    const ny = 1 - e.clientY / innerHeight * 2;
    px = nx;
    py = ny;
    mx = (nx * a * (larg / alt) - emPos[0]) / emEsc;
    my = (ny * a - emPos[1]) / emEsc;
  }, { passive: true });

  const plato = (v) => {
    const b = Math.floor(v);
    const g = Math.min(1, Math.max(0, (v - b - .25) / .5));
    return b + g * g * (3 - 2 * g);
  };
  const mostrar = (el, o, y) => {
    el.style.opacity = o;
    el.style.visibility = o > .01 ? 'visible' : 'hidden';
    el.style.pointerEvents = o > .6 ? 'auto' : 'none';
    if (y !== undefined) el.style.transform = `translateY(${y}px)`;
  };
  const formatar = (min) => {
    const m = Math.round(min) % 1440;
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  };

  let atual = 0;
  let tema = 'escuro';
  let inicio = 0;
  let antes = 0;
  let lentos = 0;
  let quadros = 0;
  let visivel = true;
  const aberto = performance.now();
  let ultimaEspera = -1;
  new IntersectionObserver((v) => {
    const era = visivel;
    visivel = v[0].isIntersecting;
    if (visivel && !era) requestAnimationFrame(quadro);
  }).observe(palco);

  function quadro(t) {
    if (!visivel) return;
    const fim = trilho.offsetHeight - innerHeight;
    const prog = Math.min(1, Math.max(0, scrollY / fim));
    const alvo = plato(Math.min(prog * 7.2, 7));
    atual += (alvo - atual) * (quieto ? 1 : .08);
    const s = atual;

    // Abertura: sai subindo quando a rolagem começa
    const a = Math.max(0, 1 - s * 2.6);
    mostrar(abre, a, -s * 70);
    mostrar(aviso, a);
    const seg = Math.floor((performance.now() - aberto) / 1000);
    if (seg !== ultimaEspera) {
      ultimaEspera = seg;
      espera.textContent = `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`;
    }

    // As horas do dia
    horas.forEach((el, i) => {
      const d = s - (i + 1);
      mostrar(el, Math.max(0, Math.min(1, 1.5 - Math.abs(d) * 3)), d * -40);
    });
    const r = Math.max(0, Math.min(1, (s - .55) * 3.2)) * Math.max(0, Math.min(1, (6.45 - s) * 3.2));
    relogio.style.opacity = r;
    relogio.textContent = formatar(mapa(MINUTOS, s));
    sol.style.opacity = mapa(SOL, s);
    sol.style.transform = `translateY(${-mapa(SOL, s) * 34}vh)`;

    // O fecho vira ouro
    const virada = Math.min(1, Math.max(0, (s - 6.35) / .5));
    ouro.style.opacity = virada;
    mostrar(fecho, Math.max(0, (s - 6.55) * 3), (7 - s) * 40);
    pular.hidden = s > 6.2;
    const novo = virada > .5 ? 'ouro' : 'escuro';
    if (novo !== tema) {
      tema = novo;
      trilho.dataset.tema = tema;
      document.dispatchEvent(new Event('tema'));
    }

    if (pronto) {
      if (!inicio) inicio = t;
      const e = quieto ? 1 : Math.min(1, (t - inicio) / 1500);
      cmx += (mx - cmx) * .12;
      cmy += (my - cmy) * .12;
      rx += (px * .13 - rx) * .05;
      ry += (-py * .09 - ry) * .05;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(u.uP, mapa(FORMA, s));
      gl.uniform1f(u.uT, quieto ? 0 : t / 1000);
      gl.uniform1f(u.uTinta, virada);
      // Enquanto há um cartão na frente, as partículas ficam ao fundo
      const fundoCartao = Math.max(0, Math.min(1, s * 1.6)) * Math.max(0, Math.min(1, (7 - s) * 1.6));
      gl.uniform1f(u.uLuz, (pequeno ? 1 - fundoCartao * .72 : 1 - fundoCartao * .55));
      gl.uniform1f(u.uEntrada, 1 - Math.pow(1 - e, 3));
      gl.uniform2f(u.uM, cmx, cmy);
      gl.uniform2f(u.uRot, rx + Math.sin(Math.max(0, s - 2) / 5 * Math.PI) * .55, ry);
      // Na abertura o logo fica menor e mais à direita, para não brigar com o título
      const naAbertura = Math.max(0, 1 - s * 1.5);
      const emPe = larg < alt;
      gl.uniform1f(u.uEsc, emEsc * (1 - (emPe ? .34 : .2) * naAbertura));
      gl.uniform2f(u.uPos, emPos[0] + (emPe ? .14 : .24) * naAbertura, emPos[1] + (emPe ? .36 : .06) * naAbertura);
      gl.drawArrays(gl.POINTS, 0, desenhar);

      // Em aparelho lento, desenha menos partículas em vez de travar a rolagem
      if (antes && ++quadros > 20) {
        if (t - antes > 40) lentos++;
        if (quadros > 80) {
          if (lentos > 40 && desenhar > 8000) desenhar = Math.floor(desenhar * .6);
          quadros = 0;
          lentos = 0;
        }
      }
      antes = t;
    } else {
      logo.style.opacity = a;
    }
    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
})();
