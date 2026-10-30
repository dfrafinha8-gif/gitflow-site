// Configuração do site: é aqui que se troca o WhatsApp de todas as páginas (o checklist tem o seu próprio)
const CONFIG = {
  whatsapp: '5535998943008', // só dígitos, com DDI e DDD
  instagram: 'https://www.instagram.com/gitflow.ia/',
  medicao: '11155323-34d2-4bf7-992c-25a5d8aaff16', // id do site no Umami (sem cookies); vazio deixa a medição desligada
  dominio: 'dfrafinha8-gif.github.io', // só este endereço é medido; trocar quando houver domínio próprio
};

// Medição: só eventos anônimos, nunca nome, empresa ou o que a pessoa escreveu
const medir = (evento, dados) => window.umami?.track(evento, dados);
if (CONFIG.medicao) {
  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cloud.umami.is/script.js';
  script.dataset.websiteId = CONFIG.medicao;
  script.dataset.domains = CONFIG.dominio;
  document.head.append(script);
  document.querySelector('[data-medicao]').hidden = false;
}

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

// Cliques que levam ao contato, e de onde eles vêm
document.querySelectorAll('a[href="#contato"]').forEach((a) => {
  a.addEventListener('click', () => medir('botao-contato', { origem: a.closest('section, header')?.id || a.dataset.fixo !== undefined && 'fixo' || 'menu', servico: a.dataset.interesse || 'nenhum' }));
});

// Blocos que entram ao rolar
const olhoSurge = new IntersectionObserver((vistas) => {
  vistas.filter((v) => v.isIntersecting).forEach((v) => {
    v.target.classList.add('visto');
    olhoSurge.unobserve(v.target);
  });
}, { rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('[data-surge]').forEach((el) => olhoSurge.observe(el));

// O botão de cada serviço já deixa o interesse marcado no formulário
const form = document.querySelector('[data-contato]');
document.querySelectorAll('[data-interesse]').forEach((a) => {
  a.addEventListener('click', () => { form.querySelector('[data-interesse-campo]').value = a.dataset.interesse; });
});

// Formulário → mensagem pronta no WhatsApp. A calculadora da página principal preenche a conta.
let conta = '';
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const campos = [...form.querySelectorAll('[required]')];
  campos.forEach((c) => c.setAttribute('aria-invalid', !c.value.trim()));
  const invalido = campos.find((c) => !c.value.trim());
  if (invalido) return invalido.focus();

  const dados = Object.fromEntries(new FormData(form));
  medir('formulario-enviado', { interesse: dados.interesse, com_calculadora: !!conta });
  abrirWhatsApp(`Olá! Sou ${dados.nome}${dados.empresa ? `, da ${dados.empresa}` : ''}. Quero o diagnóstico gratuito. Procuro: ${dados.interesse}. O que mais toma meu tempo hoje: ${dados.processo}.${conta}`);
});

document.querySelectorAll('[data-instagram]').forEach((a) => { a.href = CONFIG.instagram; });
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });
