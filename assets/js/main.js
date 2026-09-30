// Configuração do site — preencha antes de publicar.
const CONFIG = {
  whatsapp: '5535998943008', // só dígitos, com DDI e DDD
  email: '',    // usado se o WhatsApp estiver vazio
  instagram: 'https://www.instagram.com/gitflow.ia/',
};

// Borda da navegação ao rolar
const nav = document.querySelector('[data-nav]');
const marcarNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
marcarNav();
window.addEventListener('scroll', marcarNav, { passive: true });

// Duplica o log para o marquee rodar sem emenda
const lista = document.querySelector('.log__list');
if (lista) {
  lista.append(...[...lista.children].map((li) => {
    const copia = li.cloneNode(true);
    copia.setAttribute('aria-hidden', 'true');
    return copia;
  }));
}

// Abas acessíveis (setas do teclado navegam entre elas)
document.querySelectorAll('[data-tabs]').forEach((tabs) => {
  const botoes = [...tabs.querySelectorAll('[role="tab"]')];
  const ativar = (botao) => {
    botoes.forEach((b) => {
      const ativo = b === botao;
      b.setAttribute('aria-selected', ativo);
      b.tabIndex = ativo ? 0 : -1;
      document.getElementById(b.getAttribute('aria-controls')).hidden = !ativo;
    });
    botao.focus();
  };
  botoes.forEach((b, i) => {
    b.addEventListener('click', () => ativar(b));
    b.addEventListener('keydown', (e) => {
      const passo = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (passo) ativar(botoes[(i + passo + botoes.length) % botoes.length]);
    });
  });
});

// Elementos surgem ao entrar na tela
const revelar = document.querySelectorAll('.section__head, .card, .step, .diff__grid > div, .tabs, .form');
revelar.forEach((el) => el.classList.add('reveal'));
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-in');
      observador.unobserve(e.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px' });
revelar.forEach((el) => observador.observe(el));

// Formulário → mensagem pronta no WhatsApp (ou e-mail)
const form = document.querySelector('[data-contato]');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const campos = [...form.querySelectorAll('[required]')];
  campos.forEach((c) => c.setAttribute('aria-invalid', !c.value.trim()));
  const invalido = campos.find((c) => !c.value.trim());
  if (invalido) return invalido.focus();

  const dados = Object.fromEntries(new FormData(form));
  const texto = `Olá! Sou ${dados.nome}${dados.empresa ? `, da ${dados.empresa}` : ''}. Quero automatizar: ${dados.processo}`;
  const destino = CONFIG.whatsapp
    ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`
    : `mailto:${CONFIG.email}?subject=${encodeURIComponent('Diagnóstico de automação')}&body=${encodeURIComponent(texto)}`;
  window.open(destino, '_blank', 'noopener');
});

document.querySelectorAll('[data-instagram]').forEach((a) => { a.href = CONFIG.instagram; });
document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = new Date().getFullYear(); });
