var botaoMenu = document.getElementById('botaoMenu');
var menu = document.getElementById('menu');

botaoMenu.addEventListener('click', function () {
  menu.classList.toggle('aberto');
});

function lerProgresso() {
  var dados = localStorage.getItem('artlearn');
  if (dados) {
    return JSON.parse(dados);
  }
  return {};
}

function lerTracos() {
  var dados = localStorage.getItem('artlearn_tracos');
  if (dados) {
    return JSON.parse(dados);
  }
  return {};
}

function salvarTracos(nome, lista) {
  var t = lerTracos();
  t[nome] = lista;
  localStorage.setItem('artlearn_tracos', JSON.stringify(t));
}

var cards = document.querySelectorAll('.card');
var progresso = lerProgresso();

for (var i = 0; i < cards.length; i++) {
  var card = cards[i];
  var nome = card.dataset.licao;
  var anterior = card.dataset.anterior;
  var nota = progresso[nome] || 0;
  var feitos = (lerTracos()[nome] || []).length;
  var barra = card.querySelector('.barra div');
  var status = card.querySelector('.status');


  if (nota >= 70) {
    barra.style.width = '100%';
    barra.classList.add('ok');
  } else {
    barra.style.width = (feitos / 3 * 100) + '%';
  }

  if (anterior && (progresso[anterior] || 0) < 70) {
    card.classList.add('bloqueado');
    status.textContent = 'Bloqueada';
  } else if (nota >= 70) {
    status.textContent = 'Concluída com ' + nota + '%';
  } else if (feitos > 0) {
    status.textContent = feitos + ' de 3 traços feitos';
  } else {
    status.textContent = 'Ainda não começou';
  }
}
