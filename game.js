// Equation: I/M = B/A + C/K  — digits 1-6, all unique
// Answer: A=4, C=1, K=3, I=5, B=2, M=6
// Check: 5/6 = 2/4 + 1/3 = 0.5 + 0.333... = 0.833... ✓

function findSolutions() {
  const solutions = [];
  const d = [1,2,3,4,5,6];
  for (let I of d) for (let M of d)
  for (let B of d) for (let A of d)
  for (let C of d) for (let K of d) {
    if (new Set([I,M,B,A,C,K]).size !== 6) continue;
    if (Math.abs(I/M - (B/A + C/K)) < 1e-9)
      solutions.push({A,C,K,I,B,M});
  }
  return solutions;
}

const SOLUTIONS = findSolutions();

const HINTS = [
  "ฝั่งซ้าย I/M ต้องน้อยกว่า 1 — ลองให้ I น้อยกว่า M",
  "ลองให้ A และ K เป็นตัวเลขที่ B/A + C/K รวมกันได้ลงตัว",
  `มีคำตอบที่ถูกต้องทั้งหมด ${SOLUTIONS.length} ชุด`,
  "ตัวอย่าง: ลองให้ I=5, M=6 แล้วหาค่าที่เหลือ",
];

let hintStep = 0;
const KEYS = ['A','C','K','I','B','M'];

function gcd(a,b) { return b===0 ? a : gcd(b, a%b); }

function simplify(n,d) {
  const g = gcd(Math.abs(n), Math.abs(d));
  return [n/g, d/g];
}

function fracStr(n,d) {
  const [sn,sd] = simplify(n,d);
  return sd===1 ? `${sn}` : `${sn}/${sd}`;
}

function getValues() {
  return KEYS.reduce((acc,k) => {
    acc[k] = parseInt(document.getElementById(`inp-${k}`).value);
    return acc;
  }, {});
}

function onInput() {
  const v = getValues();
  const preview = document.getElementById('preview');
  if (KEYS.some(k => isNaN(v[k]))) { preview.textContent = ''; return; }
  const lhs = v.I / v.M;
  const rhs = v.B / v.A + v.C / v.K;
  preview.textContent = `${v.I}/${v.M} = ${lhs.toFixed(4)}   |   ${v.B}/${v.A} + ${v.C}/${v.K} = ${rhs.toFixed(4)}`;
}

function checkAnswer() {
  const v = getValues();
  const inputs = KEYS.map(k => document.getElementById(`inp-${k}`));
  inputs.forEach(i => i.classList.remove('correct','wrong'));

  if (KEYS.some(k => isNaN(v[k])))        { showModal('error','กรุณากรอกตัวเลขให้ครบทุกช่อง',''); return; }
  if (KEYS.some(k => v[k]<1 || v[k]>6))  { showModal('error','ตัวเลขต้องอยู่ระหว่าง 1–6 เท่านั้น',''); return; }
  if (new Set(KEYS.map(k=>v[k])).size!==6){ showModal('error','ตัวเลขทั้ง 6 ตัวต้องไม่ซ้ำกัน',''); return; }

  const lhs = v.I / v.M;
  const rhs = v.B / v.A + v.C / v.K;
  const correct = Math.abs(lhs - rhs) < 1e-9;

  if (correct) {
    inputs.forEach(i => i.classList.add('correct'));
    const detail =
      `${v.I}/${v.M}  =  ${v.B}/${v.A}  +  ${v.C}/${v.K}\n` +
      `${fracStr(v.I,v.M)}  =  ${fracStr(v.B*v.K + v.C*v.A, v.A*v.K)}\n\n` +
      `คำตอบ ACK.IBM = ${v.A}${v.C}${v.K}.${v.I}${v.B}${v.M}`;
    showModal('success', 'ถูกต้อง', detail);
    launchConfetti();
    hintStep = 0;
  } else {
    inputs.forEach(i => i.classList.add('wrong'));

    // LHS
    const [ln,ld] = simplify(v.I, v.M);
    // RHS: B/A + C/K = (B*K + C*A)/(A*K)
    const rhsN = v.B*v.K + v.C*v.A;
    const rhsD = v.A*v.K;
    const [rn,rd] = simplify(rhsN, rhsD);

    // Common denominator
    const lcd = (ld*rd) / gcd(ld,rd);
    const lCommon = `${ln*(lcd/ld)}/${lcd}`;
    const rCommon = `${rn*(lcd/rd)}/${lcd}`;

    const detail =
      `ฝั่งซ้าย:   ${v.I}/${v.M} = ${fracStr(v.I,v.M)} = ${lCommon}\n` +
      `ฝั่งขวา:   ${v.B}/${v.A} + ${v.C}/${v.K} = ${fracStr(rhsN,rhsD)} = ${rCommon}\n\n` +
      `${lCommon}  ≠  ${rCommon}`;
    showModal('error', 'ยังไม่ถูกต้อง', detail);
  }
}

function showModal(type, title, body) {
  const overlay = document.getElementById('modal');
  const box     = document.getElementById('modal-box');
  const iconEl  = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const bodyEl  = document.getElementById('modal-body');

  iconEl.textContent  = type === 'success' ? '✓' : '✕';
  titleEl.textContent = title;
  titleEl.className   = `modal-title ${type}`;
  bodyEl.textContent  = body;
  bodyEl.style.display = body ? 'block' : 'none';

  box.className = type === 'success' ? 'modal-box success-ring' : 'modal-box';
  iconEl.style.color = type === 'success' ? '#16a34a' : '#dc2626';

  overlay.classList.add('show');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal') && !e.target.classList.contains('modal-close')) return;
  document.getElementById('modal').classList.remove('show');
}

function giveHint() {
  showModal('hint', 'คำใบ้', HINTS[Math.min(hintStep, HINTS.length-1)]);
  hintStep = Math.min(hintStep+1, HINTS.length-1);
}

function resetGame() {
  KEYS.forEach(k => {
    const el = document.getElementById(`inp-${k}`);
    el.value = '';
    el.classList.remove('correct','wrong');
  });
  document.getElementById('preview').textContent = '';
  hintStep = 0;
}

// Confetti
function launchConfetti() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const pieces = Array.from({length:160}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 7 + 3,
    color: ['#ff7800','#ff9933','#16a34a','#4ecdc4','#f5a623','#e94560'][Math.floor(Math.random()*6)],
    speed: Math.random() * 5 + 2,
    drift: (Math.random()-0.5) * 3,
    rot: Math.random() * Math.PI * 2,
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*1.6);
      ctx.restore();
      p.y += p.speed; p.x += p.drift; p.rot += 0.05;
    });
    if (++frame < 220) requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();
}
