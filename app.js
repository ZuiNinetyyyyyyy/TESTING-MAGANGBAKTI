/* ═══════════════════════════════════════════════
   QuizMaster — App Logic
   ═══════════════════════════════════════════════ */

// ── Sample data ───────────────────────────────
const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: "Apa ibu kota negara Indonesia?",
    options: ["Surabaya", "Bandung", "Jakarta", "Yogyakarta"],
    answer: 2
  },
  {
    id: 2,
    question: "Berapakah hasil dari 15 × 8?",
    options: ["100", "120", "110", "130"],
    answer: 1
  },
  {
    id: 3,
    question: "Siapakah proklamator kemerdekaan Republik Indonesia?",
    options: [
      "Soekarno & Hatta",
      "Soeharto & Hamengkubuwono",
      "Kartini & Diponegoro",
      "Sultan Agung & Hasanuddin"
    ],
    answer: 0
  },
  {
    id: 4,
    question: "Planet apa yang paling dekat dengan Matahari?",
    options: ["Venus", "Bumi", "Mars", "Merkurius"],
    answer: 3
  },
  {
    id: 5,
    question: "Rumus kimia air adalah …",
    options: ["CO₂", "H₂O", "O₂", "NaCl"],
    answer: 1
  }
];

// ── State ─────────────────────────────────────
let questions   = [];
let current     = 0;
let answers     = [];   // index of chosen option per question (-1 = skip)
let timerId     = null;
let timeLeft    = 30;
let timePerQ    = 30;
let quizTitle   = "Kuis";

// ── Utility ───────────────────────────────────
const $ = id => document.getElementById(id);
const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
const CIRCUMFERENCE_SMALL = 2 * Math.PI * 18; // 113.1
const CIRCUMFERENCE_LARGE = 2 * Math.PI * 50; // 314.2

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
}

function toast(msg, duration = 2400) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._tid);
  el._tid = setTimeout(() => el.classList.remove('show'), duration);
}

// ── Home screen setup ─────────────────────────
const dropZone  = $('drop-zone');
const fileInput = $('file-input');
const fileLabel = $('file-label');
const btnStart  = $('btn-start');
const btnSample = $('btn-sample');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) loadJSONFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadJSONFile(fileInput.files[0]);
});

function loadJSONFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const qs = Array.isArray(data) ? data : data.questions;
      if (!qs || qs.length === 0) throw new Error('Soal kosong');
      validateQuestions(qs);
      questions = qs;
      fileLabel.textContent = `✓  ${file.name}  (${qs.length} soal)`;
      fileLabel.style.color = 'var(--green)';
      btnStart.disabled = false;
      toast(`✅ ${qs.length} soal berhasil dimuat`);
    } catch (err) {
      toast('❌ Format JSON tidak valid. Cek halaman Format.');
      console.error(err);
    }
  };
  reader.readAsText(file);
}

function validateQuestions(qs) {
  qs.forEach((q, i) => {
    if (!q.question) throw new Error(`Soal ${i + 1}: field "question" kosong`);
    if (!Array.isArray(q.options) || q.options.length < 2) throw new Error(`Soal ${i + 1}: "options" harus array min 2`);
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length)
      throw new Error(`Soal ${i + 1}: "answer" index tidak valid`);
  });
}

btnSample.addEventListener('click', () => {
  questions = [...SAMPLE_QUESTIONS];
  fileLabel.textContent = `✓  soal-contoh.json  (${questions.length} soal)`;
  fileLabel.style.color = 'var(--green)';
  btnStart.disabled = false;
  toast(`📋 ${questions.length} soal contoh dimuat`);
});

btnStart.addEventListener('click', startQuiz);

// ── Start Quiz ────────────────────────────────
function startQuiz() {
  quizTitle = $('cfg-title').value.trim() || 'Kuis';
  timePerQ  = parseInt($('cfg-time').value) || 30;
  const shuffle = $('cfg-shuffle').value === 'yes';

  if (shuffle) questions = [...questions].sort(() => Math.random() - .5);

  current  = 0;
  answers  = new Array(questions.length).fill(-1);

  $('quiz-title-bar').textContent = quizTitle;
  showScreen('quiz');
  renderQuestion();
}

// ── Render question ───────────────────────────
function renderQuestion() {
  const q = questions[current];
  const card = $('question-card');

  // animate
  card.style.animation = 'none';
  void card.offsetWidth;
  card.style.animation = '';

  $('q-label').textContent    = `Soal ${current + 1}`;
  $('q-text').textContent     = q.question;
  $('q-counter').textContent  = `${current + 1} / ${questions.length}`;

  const pct = (current / questions.length) * 100;
  $('progress-bar').style.width = pct + '%';

  // options
  const grid = $('options-grid');
  grid.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    if (answers[current] === i) btn.classList.add('selected');

    btn.innerHTML = `<span class="option-key">${KEYS[i]}</span><span>${opt}</span>`;
    btn.addEventListener('click', () => selectOption(i));
    grid.appendChild(btn);
  });

  // nav buttons
  $('btn-prev').disabled = current === 0;
  $('btn-next').textContent = current === questions.length - 1 ? 'Selesai ✓' : 'Selanjutnya →';

  // timer
  startTimer();
}

function selectOption(idx) {
  answers[current] = idx;
  document.querySelectorAll('.option-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', i === idx);
  });
}

// ── Timer ─────────────────────────────────────
function startTimer() {
  clearInterval(timerId);
  timeLeft = timePerQ;
  updateTimerUI();

  timerId = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      autoNext();
    }
  }, 1000);
}

function updateTimerUI() {
  $('timer-num').textContent = timeLeft;
  const ratio = timeLeft / timePerQ;
  const offset = CIRCUMFERENCE_SMALL * (1 - ratio);
  const ring = $('ring-fg');
  ring.style.strokeDashoffset = offset;

  // color warning
  if (ratio <= .25)       ring.style.stroke = 'var(--red)';
  else if (ratio <= .5)   ring.style.stroke = 'var(--yellow)';
  else                    ring.style.stroke = 'var(--accent)';
}

function autoNext() {
  // time ran out → move on without answer (stays -1 if not selected)
  goNext();
}

// ── Navigation ────────────────────────────────
$('btn-next').addEventListener('click', () => {
  clearInterval(timerId);
  if (current === questions.length - 1) {
    showResult();
  } else {
    goNext();
  }
});

$('btn-prev').addEventListener('click', () => {
  clearInterval(timerId);
  current--;
  renderQuestion();
});

function goNext() {
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    showResult();
  }
}

// ── Keyboard shortcuts ────────────────────────
document.addEventListener('keydown', e => {
  if (!$('screen-quiz').classList.contains('active')) return;
  const key = e.key.toUpperCase();
  const idx = KEYS.indexOf(key);
  if (idx !== -1 && idx < questions[current].options.length) selectOption(idx);
  if (e.key === 'ArrowRight' || e.key === 'Enter') $('btn-next').click();
  if (e.key === 'ArrowLeft')  $('btn-prev').click();
});

// ── Show Result ───────────────────────────────
function showResult() {
  clearInterval(timerId);
  $('progress-bar').style.width = '100%';

  let correct = 0, wrong = 0, skipped = 0;
  questions.forEach((q, i) => {
    if (answers[i] === -1)       skipped++;
    else if (answers[i] === q.answer) correct++;
    else                         wrong++;
  });

  const pct = Math.round((correct / questions.length) * 100);

  // trophy & subtitle
  let trophy, subtitle;
  if (pct >= 90)      { trophy = '🏆'; subtitle = 'Luar biasa! Kamu menguasai materi ini.'; }
  else if (pct >= 70) { trophy = '🎯'; subtitle = 'Bagus! Tinggal sedikit lagi sempurna.'; }
  else if (pct >= 50) { trophy = '📚'; subtitle = 'Lumayan! Yuk pelajari lagi bagian yang salah.'; }
  else                { trophy = '💪'; subtitle = 'Jangan menyerah! Coba lagi setelah belajar.'; }

  $('result-trophy').textContent   = trophy;
  $('result-subtitle').textContent = subtitle;
  $('result-title').textContent    = 'Kuis Selesai!';
  $('score-pct').textContent       = pct + '%';
  $('stat-correct').textContent    = correct;
  $('stat-wrong').textContent      = wrong;
  $('stat-skip').textContent       = skipped;

  // sr-fg color
  const fg = $('sr-fg');
  if (pct >= 70) fg.style.stroke = 'var(--green)';
  else if (pct >= 40) fg.style.stroke = 'var(--yellow)';
  else fg.style.stroke = 'var(--red)';

  showScreen('result');

  // animate ring
  setTimeout(() => {
    const offset = CIRCUMFERENCE_LARGE * (1 - pct / 100);
    fg.style.strokeDashoffset = offset;
  }, 100);
}

$('btn-restart').addEventListener('click', () => {
  showScreen('home');
  // reset file label
  fileLabel.textContent = 'Klik atau seret file .json ke sini';
  fileLabel.style.color = '';
  btnStart.disabled = true;
  questions = [];
  fileInput.value = '';
});

// ── Review ────────────────────────────────────
$('btn-review').addEventListener('click', buildReview);
$('btn-back-result').addEventListener('click', () => showScreen('result'));

function buildReview() {
  const list = $('review-list');
  list.innerHTML = '';

  questions.forEach((q, i) => {
    const userAns  = answers[i];
    const correct  = q.answer;
    const isCorrect = userAns === correct;
    const isSkip    = userAns === -1;

    const item = document.createElement('div');
    item.className = 'review-item ' + (isSkip ? 'ri-skip' : isCorrect ? 'ri-correct' : 'ri-wrong');

    const badge = isSkip ? 'Dilewati' : isCorrect ? '✓ Benar' : '✗ Salah';
    const badgeClass = isSkip ? '' : '';

    const optsHTML = q.options.map((opt, oi) => {
      let cls = '';
      if (oi === correct) cls = 'correct-ans';
      else if (oi === userAns && !isCorrect) cls = 'user-wrong';
      return `<div class="ri-opt ${cls}">${KEYS[oi]}. ${opt}</div>`;
    }).join('');

    item.innerHTML = `
      <div class="ri-header">
        <span class="ri-num">Soal ${i + 1}</span>
        <span class="ri-badge">${badge}</span>
      </div>
      <p class="ri-question">${q.question}</p>
      <div class="ri-options">${optsHTML}</div>
      ${q.explanation ? `<p style="font-size:.88rem;color:var(--muted);border-top:1px solid var(--border);padding-top:12px;margin-top:4px;line-height:1.55">💡 ${q.explanation}</p>` : ''}
    `;

    list.appendChild(item);
  });

  showScreen('review');
}
