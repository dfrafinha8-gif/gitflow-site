// Só da página principal; o que vale para todas as páginas está em comum.js
const reais = (v) => `R$ ${Math.round(v).toLocaleString('pt-BR')}`;

// Até onde as pessoas chegam na página
const olhoSecao = new IntersectionObserver((vistas) => {
  vistas.filter((v) => v.isIntersecting).forEach((v) => {
    medir('chegou-secao', { secao: v.target.id });
    olhoSecao.unobserve(v.target);
  });
}, { threshold: .2 });
['o-que-fazemos', 'custo', 'ao-vivo', 'projetos', 'contato'].forEach((id) => olhoSecao.observe(document.getElementById(id)));

document.querySelector('[data-pular]').addEventListener('click', () => medir('pulou-historia'));

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
let calculou = false;
calculo.querySelectorAll('input').forEach((i) => i.addEventListener('input', () => {
  calcular();
  if (!calculou) medir('calculadora-usada');
  calculou = true;
}));
calcular();

// Leva a conta feita para o formulário de contato
calculo.querySelector('[data-levar]').addEventListener('click', () => {
  conta = ` Fiz a conta no site: perco cerca de ${campo('perdidos').value} contatos por mês, cada cliente vale ${reais(+campo('valor').value)} e são ${campo('horas').value}h por semana em tarefa repetida.`;
});
