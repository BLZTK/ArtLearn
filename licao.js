var licao = document.body.dataset.licao;
var tipo = document.body.dataset.tipo;
var anterior = document.body.dataset.anterior;
var minimo = 70;

var canvas = document.getElementById('tela');
var ctx = canvas.getContext('2d');
var guia = [];
var tracos = [];
var tracoAtual = null;
var larguraAntiga = 0;
var todas = [];
var salvos = lerTracos()[licao] || [];
var refazendo = salvos.length >= 3;
var etapa = refazendo ? 0 : salvos.length;
var notas = refazendo ? [] : salvos.slice();

var dicas = {
  retos: [
    'Faça a linha horizontal de uma vez só, sem parar no meio.',
    'Agora a vertical. Mantenha a mão firme de cima até embaixo.',
    'Uma linha com canto! Faça a curva do canto sem levantar a caneta.'
  ],
  ondulados: [
    'Deixe a mão fluir e siga a onda com calma.',
    'Mais ondas agora. Mantenha o mesmo ritmo.',
    'Ondas bem altas! Use o braço todo para acompanhar.'
  ],
  diagonais: [
    'Comece pelo ponto laranja e desça em diagonal.',
    'Agora a diagonal para o outro lado, subindo.',
    'Duas diagonais seguidas: suba e desça sem parar.'
  ]
};

if (anterior && (lerProgresso()[anterior] || 0) < minimo) {
  document.getElementById('area').classList.add('oculto');
  document.getElementById('bloqueio').classList.remove('oculto');
}

function ajustarTela() {
  var w = canvas.parentElement.clientWidth;
  if (w === larguraAntiga) {
    return;
  }
  larguraAntiga = w;
  canvas.width = w;
  if (w < 600) {
    canvas.height = w;
  } else {
    canvas.height = w * 0.6;
  }
  tracos = [];
  criarGuia();
  desenhar();
}

function onda(ciclos, altura) {
  var w = canvas.width;
  var h = canvas.height;
  var linha = [];
  var n = 30 * ciclos;
  for (var j = 0; j <= n; j++) {
    var x = w * 0.1 + w * 0.8 * j / n;
    var y = h * 0.5 + Math.sin(j / n * Math.PI * 2 * ciclos) * h * altura;
    linha.push([x, y]);
  }
  return linha;
}

function criarGuia() {
  var w = canvas.width;
  var h = canvas.height;

  if (tipo === 'retos') {
    todas = [
      [[w * 0.1, h * 0.5], [w * 0.9, h * 0.5]],
      [[w * 0.5, h * 0.12], [w * 0.5, h * 0.88]],
      [[w * 0.2, h * 0.2], [w * 0.2, h * 0.8], [w * 0.8, h * 0.8]]
    ];
  } else if (tipo === 'diagonais') {
    todas = [
      [[w * 0.3, h * 0.12], [w * 0.7, h * 0.88]],
      [[w * 0.3, h * 0.88], [w * 0.7, h * 0.12]],
      [[w * 0.2, h * 0.85], [w * 0.5, h * 0.15], [w * 0.8, h * 0.85]]
    ];
  } else {
    todas = [onda(2, 0.12), onda(3, 0.15), onda(2, 0.28)];
  }
  guia = [todas[etapa]];
}

function desenhar() {
  var i, j, p;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = '#c4b0ff';
  ctx.lineWidth = 3;
  for (i = 0; i < guia.length; i++) {
    ctx.beginPath();
    ctx.moveTo(guia[i][0][0], guia[i][0][1]);
    for (j = 1; j < guia[i].length; j++) {
      ctx.lineTo(guia[i][j][0], guia[i][j][1]);
    }
    ctx.stroke();
    ctx.fillStyle = '#ff9a2e';
    ctx.beginPath();
    ctx.arc(guia[i][0][0], guia[i][0][1], 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.setLineDash([]);
  ctx.strokeStyle = '#6d3df0';
  for (i = 0; i < tracos.length; i++) {
    for (j = 1; j < tracos[i].length; j++) {
      p = tracos[i][j];
      ctx.lineWidth = p[2];
      ctx.beginPath();
      ctx.moveTo(tracos[i][j - 1][0], tracos[i][j - 1][1]);
      ctx.lineTo(p[0], p[1]);
      ctx.stroke();
    }
  }
}

var verificado = false;
var novaTentativa = false;

canvas.addEventListener('pointerdown', function (e) {
  canvas.setPointerCapture(e.pointerId);
  tracoAtual = [[e.offsetX, e.offsetY, espessura(e)]];
  if (verificado) {
    novaTentativa = true;
  } else {
    tracos.push(tracoAtual);
  }
});

canvas.addEventListener('pointermove', function (e) {
  if (!tracoAtual) {
    return;
  }
  if (novaTentativa) {
    tracos = [tracoAtual];
    novaTentativa = false;
    verificado = false;
    document.getElementById('barra').style.width = '0';
    document.getElementById('barra').classList.remove('ok');
  }
  tracoAtual.push([e.offsetX, e.offsetY, espessura(e)]);
  desenhar();
});

canvas.addEventListener('pointerup', function () {
  tracoAtual = null;
  novaTentativa = false;
});

canvas.addEventListener('pointercancel', function () {
  tracoAtual = null;
  novaTentativa = false;
});

function espessura(e) {
  if (e.pointerType === 'pen') {
    return 2 + e.pressure * 6;
  }
  return 5;
}

function pontosDensos(lista) {
  var saida = [];
  var i, j, a, b, d, n, k;
  for (i = 0; i < lista.length; i++) {
    if (lista[i].length === 1) {
      saida.push([lista[i][0][0], lista[i][0][1]]);
    }
    for (j = 1; j < lista[i].length; j++) {
      a = lista[i][j - 1];
      b = lista[i][j];
      d = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
      n = Math.max(1, Math.round(d / 5));
      for (k = 0; k < n; k++) {
        saida.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
      }
    }
  }
  return saida;
}

var tolerancia = 4;

function distanciaSegmento(px, py, a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var tamanho = dx * dx + dy * dy;
  var t = 0;
  if (tamanho > 0) {
    t = ((px - a[0]) * dx + (py - a[1]) * dy) / tamanho;
  }
  t = Math.max(0, Math.min(1, t));
  var x = a[0] + t * dx;
  var y = a[1] + t * dy;
  return Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
}

function distanciaAteLinhas(px, py, linhas) {
  var menor = 99999;
  var i, j, d;
  for (i = 0; i < linhas.length; i++) {
    if (linhas[i].length === 1) {
      d = distanciaSegmento(px, py, linhas[i][0], linhas[i][0]);
      menor = Math.min(menor, d);
    }
    for (j = 1; j < linhas[i].length; j++) {
      d = distanciaSegmento(px, py, linhas[i][j - 1], linhas[i][j]);
      menor = Math.min(menor, d);
    }
  }
  return menor;
}

function contarPerto(origem, linhas) {
  var total = 0;
  var i;
  for (i = 0; i < origem.length; i++) {
    if (distanciaAteLinhas(origem[i][0], origem[i][1], linhas) <= tolerancia) {
      total++;
    }
  }
  return total;
}

function calcularNota() {
  var meus = pontosDensos(tracos);
  var modelo = pontosDensos(guia);
  var precisao = contarPerto(meus, guia) / meus.length * 100;
  var cobertura = contarPerto(modelo, tracos) / modelo.length * 100;
  return Math.round((precisao + cobertura) / 2);
}

function verificar() {
  var resultado = document.getElementById('resultado');
  var barra = document.getElementById('barra');
  var proxima = document.getElementById('proxima');
  var seguinte = document.getElementById('seguinte');
  var botaoVerificar = document.getElementById('verificar');

  if (tracos.length === 0) {
    resultado.textContent = 'Faça um desenho primeiro.';
    return;
  }

  var nota = calcularNota();
  barra.style.width = nota + '%';
  verificado = true;

  if (nota >= minimo) {
    barra.classList.add('ok');
    var anterior = notas[etapa];
    var aviso = 'Você passou!';
    if (anterior && nota > anterior) {
      aviso = 'Nova melhor nota!';
    } else if (anterior) {
      aviso = 'Sua melhor nota continua em ' + anterior + '%.';
    }
    if (!anterior || nota > anterior) {
      notas[etapa] = nota;
    }
    marcarFeito();
    if (!refazendo) {
      salvarTracos(licao, notas);
    }
    if (etapa < todas.length - 1) {
      resultado.textContent = 'Precisão de ' + nota + '%. ' + aviso + ' Pode tentar de novo para melhorar ou ir para o próximo traço.';
      seguinte.classList.remove('oculto');
    } else {
      var soma = 0;
      for (var i = 0; i < notas.length; i++) {
        soma = soma + notas[i];
      }
      var media = Math.round(soma / notas.length);
      var p = lerProgresso();
      if (!p[licao] || media > p[licao]) {
        p[licao] = media;
        localStorage.setItem('artlearn', JSON.stringify(p));
      }
      resultado.textContent = 'Lição concluída! Sua média foi de ' + media + '%. Pode tentar melhorar o último traço.';
      proxima.classList.remove('oculto');
    }
  } else {
    barra.classList.remove('ok');
    if (notas[etapa] >= minimo) {
      resultado.textContent = 'Precisão de ' + nota + '%. Sua melhor nota neste traço continua em ' + notas[etapa] + '%.';
    } else {
      resultado.textContent = 'Precisão de ' + nota + '%. Precisa de ' + minimo + '% para passar. Tente de novo.';
    }
  }
  mostrarMelhor();
}

function marcarFeito() {
  var pontos = document.querySelectorAll('#pontos span');
  pontos[etapa].className = 'feito';
}

function mostrarEtapa() {
  document.getElementById('etapa').textContent = 'Traço ' + (etapa + 1) + ' de ' + todas.length;
  var pontos = document.querySelectorAll('#pontos span');
  for (var i = 0; i < pontos.length; i++) {
    if (i < etapa) {
      pontos[i].className = 'feito';
    } else if (i === etapa) {
      pontos[i].className = 'atual';
    } else {
      pontos[i].className = '';
    }
  }
  document.querySelector('.balao').textContent = dicas[tipo][etapa];
}

document.getElementById('seguinte').addEventListener('click', function () {
  etapa++;
  tracos = [];
  criarGuia();
  desenhar();
  mostrarEtapa();
  document.getElementById('barra').style.width = '0';
  document.getElementById('barra').classList.remove('ok');
  document.getElementById('resultado').textContent = 'Desenhe por cima do guia e clique em Verificar.';
  document.getElementById('seguinte').classList.add('oculto');
  mostrarMelhor();
});

function mostrarMelhor() {
  var texto = document.getElementById('melhor');
  var p = lerProgresso()[licao];
  var lista = [];
  for (var i = 0; i < notas.length; i++) {
    if (notas[i]) {
      lista.push(notas[i] + '%');
    }
  }
  if (lista.length > 0) {
    texto.textContent = 'Notas dos traços: ' + lista.join(' · ');
    if (p) {
      texto.textContent = texto.textContent + ' · Melhor média da lição: ' + p + '%';
    }
  } else if (p) {
    texto.textContent = 'Sua melhor média na lição: ' + p + '%';
  } else {
    texto.textContent = '';
  }
}

document.getElementById('verificar').addEventListener('click', verificar);

document.getElementById('limpar').addEventListener('click', function () {
  tracos = [];
  verificado = false;
  desenhar();
  document.getElementById('barra').style.width = '0';
  document.getElementById('barra').classList.remove('ok');
  document.getElementById('resultado').textContent = 'Desenhe por cima do guia e clique em Verificar.';
});

window.addEventListener('resize', ajustarTela);

ajustarTela();
mostrarEtapa();
mostrarMelhor();
if ((lerProgresso()[licao] || 0) >= minimo) {
  document.getElementById('proxima').classList.remove('oculto');
}
