// ========================
//   OPÇÕES DO SORTEIO
// ========================
const opcoes = [
  { nome: "Hambúrguer",          emoji: "🍔" },
  { nome: "Nada (só agarração)", emoji: "🥰" },
  { nome: "Pizza",               emoji: "🍕" },
  { nome: "Comida Árabe",        emoji: "🧆" },
  { nome: "Nada (só agarração)", emoji: "🥰" },
  { nome: "Comida Japonesa",     emoji: "🍱" },
  { nome: "Salada",              emoji: "🥗" },
  { nome: "Nada (só agarração)", emoji: "🥰" },
  { nome: "Comida Italiana",     emoji: "🍝" },
];

// ========================
//   ÁUDIO — WEB AUDIO API
// ========================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function somClique() {
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(480, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(280, audioCtx.currentTime + 0.07);

  gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.08);
}

function somVitoria() {
  const notas = [523, 659, 784, 1047];
  notas.forEach((freq, i) => {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    const t = audioCtx.currentTime + i * 0.13;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.start(t);
    osc.stop(t + 0.4);
  });
}

function somAgarracao() {
  const notas = [392, 494, 587, 740];
  notas.forEach((freq, i) => {
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = 'sine';
    const t = audioCtx.currentTime + i * 0.18;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.start(t);
    osc.stop(t + 0.6);
  });
}

function somBotao() {
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.1);

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.15);
}

// ========================
//   ELEMENTOS DO DOM
// ========================
const telaEntrada   = document.getElementById('tela-entrada');
const telaRoleta    = document.getElementById('tela-roleta');
const telaResultado = document.getElementById('tela-resultado');

const btnComecar          = document.getElementById('btn-comecar');
const btnGirar            = document.getElementById('btn-girar');
const btnSortearNovamente = document.getElementById('btn-sortear-novamente');

const tambor         = document.getElementById('roleta-tambor');
const resultadoEmoji = document.getElementById('resultado-emoji');
const resultadoNome  = document.getElementById('resultado-nome');
const confetesDiv    = document.getElementById('confetes');

// ========================
//   ALTURA DE CADA ITEM
// ========================
const ALTURA_ITEM = 110;

// ========================
//   MONTAR O TAMBOR
// ========================
function montarTambor() {
  tambor.innerHTML = '';
  const repeticoes = 8;
  for (let r = 0; r < repeticoes; r++) {
    opcoes.forEach(op => {
      const item = document.createElement('div');
      item.classList.add('roleta-item');
      item.innerHTML = `
        <span class="item-emoji">${op.emoji}</span>
        <span class="item-nome">${op.nome}</span>
      `;
      tambor.appendChild(item);
    });
  }
}

// ========================
//   TROCA DE TELAS
// ========================
function irPara(tela) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  tela.classList.add('ativa');
}

// ========================
//   SOM DE CLIQUE DURANTE O GIRO
// ========================
let intervaloClique = null;

function iniciarSomRoleta(duracao) {
  if (intervaloClique) clearInterval(intervaloClique);

  const inicio      = Date.now();
  const intervalMin = 60;   // ms no pico (mais rápido)
  const intervalMax = 500;  // ms no final (bem devagar)

  let proximoClique = Date.now();

  function tick() {
    const agora     = Date.now();
    const elapsed   = agora - inicio;
    const progresso = elapsed / duracao; // 0 → 1

    if (progresso >= 0.98) {
      clearInterval(intervaloClique);
      intervaloClique = null;
      return;
    }

    if (agora >= proximoClique) {
      somClique();

      // Começa rápido (intervalMin) e desacelera progressivamente até intervalMax
      // progresso² faz a abertura do intervalo ser mais dramática no final
      const fator     = progresso * progresso;
      const intervalo = intervalMin + (intervalMax - intervalMin) * fator;
      proximoClique   = agora + intervalo;
    }
  }

  intervaloClique = setInterval(tick, 16);
}

// ========================
//   LÓGICA DO GIRO
// ========================
let girando = false;

function girar() {
  if (girando) return;
  girando = true;
  btnGirar.disabled = true;

  if (audioCtx.state === 'suspended') audioCtx.resume();

  const indexVencedor = Math.floor(Math.random() * opcoes.length);
  const voltaDeParada = 4;
  const posicaoFinal  = (voltaDeParada * opcoes.length + indexVencedor) * ALTURA_ITEM;

  tambor.style.transition = 'none';
  tambor.style.transform  = 'translateY(0)';

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {

      const duracao = 5500;
      iniciarSomRoleta(duracao);

      tambor.style.transition = `transform ${duracao}ms cubic-bezier(0.15, 1, 0.25, 1)`;
      tambor.style.transform  = `translateY(-${posicaoFinal}px)`;

      setTimeout(() => {
        mostrarResultado(indexVencedor);
      }, duracao + 300);

    });
  });
}

// ========================
//   MOSTRAR RESULTADO
// ========================
function mostrarResultado(index) {
  const vencedor = opcoes[index];

  resultadoEmoji.textContent = vencedor.emoji;
  resultadoNome.textContent  = vencedor.nome;

  reiniciarAnimacao(document.querySelector('.resultado-card'));
  reiniciarAnimacao(resultadoEmoji);
  reiniciarAnimacao(document.querySelector('.resultado-label'));

  irPara(telaResultado);

  if (vencedor.nome.includes('agarração')) {
    somAgarracao();
    lancarConfetesCoracao();
  } else {
    somVitoria();
    lancarConfetes();
  }
}

function reiniciarAnimacao(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = '';
}

// ========================
//   CONFETES NORMAIS 🎉
// ========================
const CORES_CONFETE = ['#E85D04','#2DC653','#AB47BC','#F9C74F','#4CC9F0','#FF6B6B','#FFD166','#06D6A0'];

function lancarConfetes() {
  confetesDiv.innerHTML = '';

  for (let i = 0; i < 120; i++) {
    const c = document.createElement('div');
    c.classList.add('confete');

    const cor      = CORES_CONFETE[Math.floor(Math.random() * CORES_CONFETE.length)];
    const esquerda = Math.random() * 100;
    const duracao  = 2 + Math.random() * 2.5;
    const delay    = Math.random() * 1.2;
    const tamanho  = 8 + Math.random() * 12;
    const forma    = Math.random();

    c.style.cssText = `
      left: ${esquerda}%;
      width: ${tamanho}px;
      height: ${tamanho * (forma > 0.6 ? 0.4 : 1)}px;
      background: ${cor};
      animation-duration: ${duracao}s;
      animation-delay: ${delay}s;
      border-radius: ${forma > 0.7 ? '50%' : forma > 0.4 ? '3px' : '0'};
    `;

    confetesDiv.appendChild(c);
  }

  setTimeout(() => { confetesDiv.innerHTML = ''; }, 6000);
}

// ========================
//   CONFETES DE CORAÇÃO 🥰
// ========================
function lancarConfetesCoracao() {
  confetesDiv.innerHTML = '';

  const emojis = ['❤️','🥰','💕','💖','💗','💓','😍','🩷'];

  for (let i = 0; i < 30; i++) {
    const c = document.createElement('div');
    c.style.cssText = `
      position: absolute;
      top: -30px;
      left: ${Math.random() * 100}%;
      font-size: ${1.2 + Math.random() * 1.8}rem;
      animation: cair ${2 + Math.random() * 2.5}s linear ${Math.random() * 1.2}s forwards;
      pointer-events: none;
    `;
    c.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    confetesDiv.appendChild(c);
  }

  setTimeout(() => { confetesDiv.innerHTML = ''; }, 6000);
}

// ========================
//   RESET
// ========================
function resetar() {
  somBotao();
  girando = false;
  btnGirar.disabled = false;

  tambor.style.transition = 'none';
  tambor.style.transform  = 'translateY(0)';

  irPara(telaRoleta);
}

// ========================
//   EVENTOS
// ========================
btnComecar.addEventListener('click', () => {
  somBotao();
  montarTambor();
  irPara(telaRoleta);
});

btnGirar.addEventListener('click', girar);

btnSortearNovamente.addEventListener('click', resetar);