// ── Shared helpers ──────────────────────────────────────────────
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function simplify(n, d) { const g = gcd(Math.abs(n), Math.abs(d)); return [n/g, d/g]; }
function fracStr(n, d) { const [sn,sd] = simplify(n,d); return sd===1 ? `${sn}` : `${sn}/${sd}`; }

function getVals(prefix, keys) {
  return keys.reduce((acc,k) => { acc[k] = parseInt(document.getElementById(`${prefix}-${k}`).value); return acc; }, {});
}
function clearInputs(prefix, keys) {
  keys.forEach(k => { const el = document.getElementById(`${prefix}-${k}`); el.value=''; el.classList.remove('correct','wrong'); });
}
function markInputs(prefix, keys, cls) {
  keys.forEach(k => document.getElementById(`${prefix}-${k}`).classList.add(cls));
}

function showModal(type, title, body) {
  const icons = { success:'✓', error:'✕', hint:'?', answer:'!' };
  const colors = { success:'#16a34a', error:'#dc2626', hint:'#ff7800', answer:'#7c3aed' };
  document.getElementById('modal-icon').textContent = icons[type] || '?';
  document.getElementById('modal-icon').style.color = colors[type] || '#333';
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-title').className = `modal-title ${type}`;
  const bodyEl = document.getElementById('modal-body');
  bodyEl.textContent = body;
  bodyEl.style.display = body ? 'block' : 'none';
  document.getElementById('modal-box').className = type==='success' ? 'modal-box success-ring' : 'modal-box';
  document.getElementById('modal').classList.add('show');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal') && !e.target.classList.contains('modal-close')) return;
  document.getElementById('modal').classList.remove('show');
}

function launchConfetti() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const pieces = Array.from({length:160}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*-canvas.height,
    r: Math.random()*7+3,
    color: ['#ff7800','#ff9933','#16a34a','#4ecdc4','#f5a623','#e94560'][Math.floor(Math.random()*6)],
    speed: Math.random()*5+2, drift: (Math.random()-.5)*3, rot: Math.random()*Math.PI*2,
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p => {
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.color; ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6); ctx.restore();
      p.y+=p.speed; p.x+=p.drift; p.rot+=0.05;
    });
    if (++frame < 220) requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();
}

// ── Q1: B/E = A/T, digits 1-6, answer: B=2,E=3,A=4,T=6 ─────────
// 2/3 = 4/6 ✓  — word: BE.AT
const Q1 = (() => {
  const prefix = 'q1', keys = ['B','E','A','T'];
  const hints = [
    "B/E = A/T หมายความว่าเศษส่วนทั้งสองต้องเท่ากัน",
    "ลองคิดว่าเศษส่วนคู่ไหนเท่ากันได้ เช่น 1/2 = 2/4 หรือ 2/3 = 4/6",
    "ตัวเลขที่ใช้ต้องอยู่ใน 1–6 และห้ามซ้ำกัน",
    "เฉลย: B=2, E=3, A=4, T=6 → 2/3 = 4/6",
  ];
  let step = 0;

  function preview() {
    const v = getVals(prefix, keys);
    const el = document.getElementById('prev1');
    if (keys.some(k=>isNaN(v[k]))) { el.textContent=''; return; }
    el.textContent = `${v.B}/${v.E} = ${(v.B/v.E).toFixed(4)}   |   ${v.A}/${v.T} = ${(v.A/v.T).toFixed(4)}`;
  }

  function check() {
    const v = getVals(prefix, keys);
    clearInputs(prefix, keys);
    if (keys.some(k=>isNaN(v[k]))) { showModal('error','กรอกให้ครบ',''); return; }
    if (keys.some(k=>v[k]<1||v[k]>6)) { showModal('error','ใช้ตัวเลข 1–6 เท่านั้น',''); return; }
    if (new Set(keys.map(k=>v[k])).size!==4) { showModal('error','ตัวเลขห้ามซ้ำกัน',''); return; }
    const ok = Math.abs(v.B/v.E - v.A/v.T) < 1e-9;
    if (ok) {
      markInputs(prefix,keys,'correct');
      showModal('success','ถูกต้อง',`${v.B}/${v.E} = ${v.A}/${v.T} = ${fracStr(v.B,v.E)}`);
      launchConfetti(); step=0;
    } else {
      markInputs(prefix,keys,'wrong');
      showModal('error','ยังไม่ถูก',`${v.B}/${v.E} = ${fracStr(v.B,v.E)}\n${v.A}/${v.T} = ${fracStr(v.A,v.T)}\n${fracStr(v.B,v.E)} ≠ ${fracStr(v.A,v.T)}`);
    }
  }

  function hint() { showModal('hint','คำใบ้',hints[Math.min(step,hints.length-1)]); step=Math.min(step+1,hints.length-1); }
  function reveal() { showModal('answer','เฉลยข้อที่ 1','B=2, E=3, A=4, T=6\n\n2/3 = 4/6\n\nทั้งสองเศษส่วนเท่ากับ 2/3'); }
  function reset() { clearInputs(prefix,keys); document.getElementById('prev1').textContent=''; step=0; }

  return { preview, check, hint, reveal, reset };
})();

// ── Q2: S/U + N/R = A/Y, digits 1-6, answer: S=1,U=2,N=5,R=6,A=4,Y=3 ──
// 1/2 + 5/6 = 4/3 ✓  — word: SUN.RAY
const Q2 = (() => {
  const prefix = 'q2', keys = ['S','U','N','R','A','Y'];
  const hints = [
    "ผลรวม S/U + N/R ต้องมากกว่า 1 เพราะ A/Y > 1",
    "ลองให้ U=2 และ R=6 แล้วหาค่า S, N ที่เหมาะสม",
    "ถ้า S=1, U=2 จะได้ S/U = 1/2 แล้วหา N/R ที่เหลือ",
    "เฉลย: S=1, U=2, N=5, R=6, A=4, Y=3 → 1/2 + 5/6 = 4/3",
  ];
  let step = 0;

  function preview() {
    const v = getVals(prefix, keys);
    const el = document.getElementById('prev2');
    if (keys.some(k=>isNaN(v[k]))) { el.textContent=''; return; }
    const lhs = v.S/v.U + v.N/v.R;
    el.textContent = `${v.S}/${v.U} + ${v.N}/${v.R} = ${lhs.toFixed(4)}   |   ${v.A}/${v.Y} = ${(v.A/v.Y).toFixed(4)}`;
  }

  function check() {
    const v = getVals(prefix, keys);
    clearInputs(prefix, keys);
    if (keys.some(k=>isNaN(v[k]))) { showModal('error','กรอกให้ครบ',''); return; }
    if (keys.some(k=>v[k]<1||v[k]>6)) { showModal('error','ใช้ตัวเลข 1–6 เท่านั้น',''); return; }
    if (new Set(keys.map(k=>v[k])).size!==6) { showModal('error','ตัวเลขห้ามซ้ำกัน',''); return; }
    const lhs = v.S/v.U + v.N/v.R, rhs = v.A/v.Y;
    const ok = Math.abs(lhs - rhs) < 1e-9;
    if (ok) {
      markInputs(prefix,keys,'correct');
      showModal('success','ถูกต้อง',`${v.S}/${v.U} + ${v.N}/${v.R} = ${v.A}/${v.Y}\n${lhs.toFixed(4)} = ${rhs.toFixed(4)}`);
      launchConfetti(); step=0;
    } else {
      markInputs(prefix,keys,'wrong');
      const rhsN=v.S*v.R+v.N*v.U, rhsD=v.U*v.R;
      showModal('error','ยังไม่ถูก',
        `ฝั่งซ้าย: ${v.S}/${v.U} + ${v.N}/${v.R} = ${fracStr(rhsN,rhsD)}\nฝั่งขวา: ${v.A}/${v.Y} = ${fracStr(v.A,v.Y)}\n${fracStr(rhsN,rhsD)} ≠ ${fracStr(v.A,v.Y)}`);
    }
  }

  function hint() { showModal('hint','คำใบ้',hints[Math.min(step,hints.length-1)]); step=Math.min(step+1,hints.length-1); }
  function reveal() { showModal('answer','เฉลยข้อที่ 2','S=1, U=2, N=5, R=6, A=4, Y=3\n\n1/2 + 5/6 = 4/3\n\n0.5 + 0.8333... = 1.3333...'); }
  function reset() { clearInputs(prefix,keys); document.getElementById('prev2').textContent=''; step=0; }

  return { preview, check, hint, reveal, reset };
})();

// ── Q3: I/M = B/A + C/K, digits 1-6, answer: A=4,C=1,K=3,I=5,B=2,M=6 ──
// 5/6 = 2/4 + 1/3 ✓
const Q3 = (() => {
  const prefix = 'q3', keys = ['A','C','K','I','B','M'];
  const hints = [
    "ฝั่งซ้าย I/M ต้องน้อยกว่า 1 — ให้ I < M",
    "ลองให้ M=6 แล้วหาค่า I ที่เหมาะสม",
    "ถ้า I=5, M=6 แล้ว B/A + C/K ต้องเท่ากับ 5/6",
    "เฉลย: A=4, C=1, K=3, I=5, B=2, M=6 → 5/6 = 2/4 + 1/3",
  ];
  let step = 0;

  function preview() {
    const v = getVals(prefix, keys);
    const el = document.getElementById('prev3');
    if (keys.some(k=>isNaN(v[k]))) { el.textContent=''; return; }
    const lhs = v.I/v.M, rhs = v.B/v.A + v.C/v.K;
    el.textContent = `${v.I}/${v.M} = ${lhs.toFixed(4)}   |   ${v.B}/${v.A} + ${v.C}/${v.K} = ${rhs.toFixed(4)}`;
  }

  function check() {
    const v = getVals(prefix, keys);
    clearInputs(prefix, keys);
    if (keys.some(k=>isNaN(v[k]))) { showModal('error','กรอกให้ครบ',''); return; }
    if (keys.some(k=>v[k]<1||v[k]>6)) { showModal('error','ใช้ตัวเลข 1–6 เท่านั้น',''); return; }
    if (new Set(keys.map(k=>v[k])).size!==6) { showModal('error','ตัวเลขห้ามซ้ำกัน',''); return; }
    const lhs = v.I/v.M, rhs = v.B/v.A + v.C/v.K;
    const ok = Math.abs(lhs-rhs) < 1e-9;
    if (ok) {
      markInputs(prefix,keys,'correct');
      showModal('success','ถูกต้อง',`${v.I}/${v.M} = ${v.B}/${v.A} + ${v.C}/${v.K}\n${fracStr(v.I,v.M)} = ${fracStr(v.B*v.K+v.C*v.A,v.A*v.K)}`);
      launchConfetti(); step=0;
    } else {
      markInputs(prefix,keys,'wrong');
      const [ln,ld]=simplify(v.I,v.M), rhsN=v.B*v.K+v.C*v.A, rhsD=v.A*v.K, [rn,rd]=simplify(rhsN,rhsD);
      const lcd=(ld*rd)/gcd(ld,rd);
      showModal('error','ยังไม่ถูก',
        `ฝั่งซ้าย: ${v.I}/${v.M} = ${ln*(lcd/ld)}/${lcd}\nฝั่งขวา: ${v.B}/${v.A} + ${v.C}/${v.K} = ${rn*(lcd/rd)}/${lcd}\n${ln*(lcd/ld)}/${lcd} ≠ ${rn*(lcd/rd)}/${lcd}`);
    }
  }

  function hint() { showModal('hint','คำใบ้',hints[Math.min(step,hints.length-1)]); step=Math.min(step+1,hints.length-1); }
  function reveal() { showModal('answer','เฉลยข้อที่ 3','A=4, C=1, K=3, I=5, B=2, M=6\n\n5/6 = 2/4 + 1/3\n\n0.8333... = 0.5 + 0.3333...'); }
  function reset() { clearInputs(prefix,keys); document.getElementById('prev3').textContent=''; step=0; }

  return { preview, check, hint, reveal, reset };
})();

// ── Q4: D/O + N/T = P/E + R/I + S/H, digits 0-9 ─────────────────
// Answer: D=5,O=6,N=0,T=7,P=1,E=4,R=2,I=8,S=3,H=9
const Q4 = (() => {
  const prefix = 'q4', keys = ['D','O','N','T','P','E','R','I','S','H'];
  const hints = [
    "ลองให้ N=0 เพื่อให้ N/T = 0 ตัดออกไปได้เลย",
    "ถ้า N=0 แล้ว D/O ต้องเท่ากับ P/E + R/I + S/H",
    "ลองให้ D=5, O=6 จะได้ D/O = 5/6 ≈ 0.8333",
    "เฉลย: D=5,O=6,N=0,T=7,P=1,E=4,R=2,I=8,S=3,H=9",
  ];
  let step = 0;

  function preview() {
    const v = getVals(prefix, keys);
    const el = document.getElementById('prev4');
    if (keys.some(k=>isNaN(v[k]))) { el.textContent=''; return; }
    const lhs = v.D/v.O + v.N/v.T, rhs = v.P/v.E + v.R/v.I + v.S/v.H;
    el.textContent = `${v.D}/${v.O}+${v.N}/${v.T} = ${lhs.toFixed(4)}   |   ${v.P}/${v.E}+${v.R}/${v.I}+${v.S}/${v.H} = ${rhs.toFixed(4)}`;
  }

  function check() {
    const v = getVals(prefix, keys);
    clearInputs(prefix, keys);
    if (keys.some(k=>isNaN(v[k]))) { showModal('error','กรอกให้ครบ',''); return; }
    if (keys.some(k=>v[k]<0||v[k]>9)) { showModal('error','ใช้ตัวเลข 0–9 เท่านั้น',''); return; }
    if (new Set(keys.map(k=>v[k])).size!==10) { showModal('error','ตัวเลขห้ามซ้ำกัน',''); return; }
    if ([v.O,v.T,v.E,v.I,v.H].some(x=>x===0)) { showModal('error','ตัวหาร O,T,E,I,H ห้ามเป็น 0',''); return; }
    const lhs = v.D/v.O + v.N/v.T, rhs = v.P/v.E + v.R/v.I + v.S/v.H;
    const ok = Math.abs(lhs-rhs) < 1e-9;
    if (ok) {
      markInputs(prefix,keys,'correct');
      showModal('success','ถูกต้อง',`${v.D}/${v.O} + ${v.N}/${v.T} = ${v.P}/${v.E} + ${v.R}/${v.I} + ${v.S}/${v.H}\n${lhs.toFixed(6)} = ${rhs.toFixed(6)}`);
      launchConfetti(); step=0;
    } else {
      markInputs(prefix,keys,'wrong');
      showModal('error','ยังไม่ถูก',
        `ฝั่งซ้าย: ${v.D}/${v.O} + ${v.N}/${v.T} = ${lhs.toFixed(6)}\nฝั่งขวา: ${v.P}/${v.E} + ${v.R}/${v.I} + ${v.S}/${v.H} = ${rhs.toFixed(6)}\n${lhs.toFixed(6)} ≠ ${rhs.toFixed(6)}`);
    }
  }

  function hint() { showModal('hint','คำใบ้',hints[Math.min(step,hints.length-1)]); step=Math.min(step+1,hints.length-1); }
  function reveal() { showModal('answer','เฉลยข้อที่ 4','D=5, O=6, N=0, T=7\nP=1, E=4, R=2, I=8, S=3, H=9\n\n5/6 + 0/7 = 1/4 + 2/8 + 3/9\n0.8333... = 0.25 + 0.25 + 0.3333...'); }
  function reset() { clearInputs(prefix,keys); document.getElementById('prev4').textContent=''; step=0; }

  return { preview, check, hint, reveal, reset };
})();
