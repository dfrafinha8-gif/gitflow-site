// Configuração do site
const CONFIG = {
  whatsapp: '5535998943008', // só dígitos, com DDI e DDD
  instagram: 'https://www.instagram.com/gitflow.ia/',
};

const reais = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;
const abrirWhatsApp = (texto) => window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');

// A navegação troca de cor conforme a seção que está atrás dela
const nav = document.querySelector('[data-nav]');
const secoes = [...document.querySelectorAll('[data-tema]')];
function marcarNav() {
  const atras = secoes.find((s) => s.getBoundingClientRect().bottom > 40);
  if (!atras) return;
  nav.dataset.sobre = atras.dataset.tema;
  nav.dataset.solta = !atras.matches('[data-trilho]');
}
marcarNav();
addEventListener('scroll', marcarNav, { passive: true });
document.addEventListener('tema', marcarNav);

// O botão fixo do celular some quando o formulário já está na tela
const fixo = document.querySelector('[data-fixo]');
new IntersectionObserver(([v]) => { fixo.dataset.fora = v.isIntersecting; }).observe(document.querySelector('#contato'));

// Blocos que entram ao rolar
const olhoSurge = new IntersectionObserver((vistas) => {
  vistas.filter((v) => v.isIntersecting).forEach((v) => {
    v.target.classList.add('visto');
    olhoSurge.unobserve(v.target);
  });
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-surge]').forEach((el) => olhoSurge.observe(el));

// Calculadora: a mesma conta do diagnóstico, recuperando 3 de cada 10
const calculo = document.querySelector('[data-calculo]');
const campo = (n) => calculo.querySelector(`[name=${n}]`);
const dinheiro = calculo.querySelector('[data-dinheiro]');
const tempo = calculo.querySelector('[data-tempo]');
const formato = { perdidos: (v) => v, valor: reais, horas: (v) => `${v}h` };
let mostrado = 2400;
let alvo = 2400;
let rolando = false;

function contar() {
  mostrado += (alvo - mostrado) * .22;
  if (Math.abs(alvo - mostrado) < 1) mostrado = alvo;
  dinheiro.textContent = reais(mostrado);
  rolando = mostrado !== alvo;
  if (rolando) requestAnimationFrame(contar);
}

function calcular() {
  ['perdidos', 'valor', 'horas'].forEach((n) => {
    calculo.querySelector(`[data-saida=${n}]`).textContent = formato[n](+campo(n).value);
  });
  alvo = Math.round(+campo('perdidos').value * .3) * +campo('valor').value;
  tempo.textContent = `${Math.round(+campo('horas').value * 4.33)} horas`;
  if (!rolando) {
    rolando = true;
    requestAnimationFrame(contar);
  }
}
calculo.querySelectorAll('input').forEach((i) => i.addEventListener('input', calcular));
calcular();

// Leva a conta feita para o formulário de contato
const form = document.querySelector('[data-contato]');
let conta = '';
calculo.querySelector('[data-levar]').addEventListener('click', () => {
  conta = ` Fiz a conta no site: perco cerca de ${campo('perdidos').value} contatos por mês, cada cliente vale ${reais(+campo('valor').value)} e são ${campo('horas').value}h por semana em tarefa repetida.`;
});

// O botão de cada serviço já deixa o interesse marcado no formulário
document.querySelectorAll('[data-interesse]').forEach((a) => {
  a.addEventListener('click', () => { form.querySelector('[data-interesse-campo]').value = a.dataset.interesse; });
});

// Formulário → mensagem pronta no WhatsApp
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const campos = [...form.querySelectorAll('[required]')];
  campos.forEach((c) => c.setAttribute('aria-invalid', !c.value.trim()));
  const invalido = campos.find((c) => !c.value.trim());
  if (invalido) return invalido.focus();

  const dados = Object.fromEntries(new FormData(form));
  abrirWhatsApp(`Olá! Sou ${dados.nome}${dados.empresa ? `, da ${dados.empresa}` : ''}. Quero o diagnóstico gratuito. Procuro: ${dados.interesse}. O que mais toma meu tempo hoje: ${dados.processo}.${conta}`);
});

document.querySelectorAll('[data-instagram]').forEach((a) => { a.href = CONFIG.instagram; });
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });
