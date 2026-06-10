/* ═══════════════════════════════════════════════════════════
   TURING'S LIGHT  ·  js/levels.js
   All 5 puzzle levels: Logic Gates, Caesar, Binary,
   Light/Dark, Enigma Machine, Turing Test
═══════════════════════════════════════════════════════════ */

const Levels = (() => {

  /* ─── shared helpers ─────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const toast = (msg, good = true) => {
    const t = $("feedback-toast");
    t.textContent = msg;
    t.className = "feedback-toast " + (good ? "show-good" : "show-bad");
    clearTimeout(t._to);
    t._to = setTimeout(() => t.className = "feedback-toast", 2200);
  };

  /* ══════════════════════════════════════════════════════════
     LEVEL 1 — LOGIC GATES
     Player toggles A/B/C switches; AND/OR/NOT wired together.
     Target: final output == 1
  ══════════════════════════════════════════════════════════ */
  const GATE_PUZZLES = [
    {
      // (A AND B) OR (NOT C)  — easy intro
      inputs: { A: 0, B: 0, C: 1 },
      rows: [
        { label: "ROW 1", ins: ["A","B"], gate: "AND", out: "R1" },
        { label: "ROW 2", ins: ["C"],     gate: "NOT", out: "R2" },
        { label: "FINAL", ins: ["R1","R2"],gate: "OR", out: "DOOR" },
      ],
      hint: "Hint: AND needs both TRUE. NOT flips the bit. OR needs at least one TRUE.",
      target: 1,
    },
    {
      // A OR B  AND  NOT C  — second attempt
      inputs: { A: 0, B: 0, C: 1 },
      rows: [
        { label: "ROW 1", ins: ["A","B"], gate: "OR",  out: "R1" },
        { label: "ROW 2", ins: ["C"],     gate: "NOT", out: "R2" },
        { label: "FINAL", ins: ["R1","R2"],gate: "AND",out: "DOOR" },
      ],
      hint: "Hint: Make both R1 and R2 equal 1 simultaneously.",
      target: 1,
    },
  ];

  let gatePuzzleIdx = 0;
  let gateInputs = {};
  let gateAttempts = 0;

  function applyGate(gate, vals) {
    if (gate === "AND") return vals.every(v => v === 1) ? 1 : 0;
    if (gate === "OR")  return vals.some(v => v === 1)  ? 1 : 0;
    if (gate === "NOT") return vals[0] === 1 ? 0 : 1;
    if (gate === "XOR") return vals.reduce((a,b) => a ^ b, 0);
    return 0;
  }

  function initGates() {
    const puzzle = GATE_PUZZLES[gatePuzzleIdx % GATE_PUZZLES.length];
    gateInputs = { ...puzzle.inputs };
    $("gate-hint").textContent = "";
    renderGates();
  }

  function renderGates() {
    const puzzle = GATE_PUZZLES[gatePuzzleIdx % GATE_PUZZLES.length];
    const sec = $("gate-section");
    sec.innerHTML = "";

    // resolve intermediate values
    const vals = { ...gateInputs };
    puzzle.rows.forEach(row => {
      const inVals = row.ins.map(k => vals[k] ?? 0);
      vals[row.out] = applyGate(row.gate, inVals);
    });

    // render each row
    puzzle.rows.forEach(row => {
      const div = document.createElement("div");
      div.className = "gate-row";

      const lbl = document.createElement("span");
      lbl.className = "gate-row-label";
      lbl.textContent = row.label;
      div.appendChild(lbl);

      // input buttons or result labels
      row.ins.forEach(key => {
        if (key in gateInputs) {
          const btn = document.createElement("button");
          btn.className = "input-btn " + (gateInputs[key] ? "s1" : "s0");
          btn.textContent = gateInputs[key];
          btn.setAttribute("data-label", key);
          btn.title = "Click to toggle " + key;
          btn.onclick = () => {
            gateInputs[key] ^= 1;
            renderGates();
          };
          div.appendChild(btn);
        } else {
          const v = vals[key] ?? 0;
          const sp = document.createElement("span");
          sp.className = "gate-result-val " + (v ? "r1" : "r0");
          sp.textContent = v;
          sp.title = key;
          div.appendChild(sp);
        }
        const wire = document.createElement("span");
        wire.className = "gate-wire";
        wire.textContent = "──";
        div.appendChild(wire);
      });

      // gate chip
      const chip = document.createElement("span");
      chip.className = "gate-chip";
      chip.textContent = row.gate;
      div.appendChild(chip);

      // arrow + result
      const arr = document.createElement("span");
      arr.className = "gate-wire";
      arr.textContent = "──▶";
      div.appendChild(arr);

      const res = vals[row.out] ?? 0;
      const resEl = document.createElement("span");
      resEl.className = "gate-result-val " + (res ? "r1" : "r0");
      resEl.textContent = res;
      div.appendChild(resEl);

      sec.appendChild(div);
    });

    // door output
    const door = vals["DOOR"] ?? 0;
    const outEl = $("gate-out-val");
    outEl.textContent = door;
    outEl.style.color = door ? "var(--green)" : "var(--red)";

    const doorEl = $("gate-door");
    if (door === puzzle.target) {
      doorEl.textContent = "🔓 UNLOCKED";
      doorEl.className = "gate-door-status open";
      $("gate-hint").textContent = "";
      setTimeout(() => {
        Engine.levelComplete({
          icon:  "🔓",
          title: "DOOR UNLOCKED",
          body:  "You mastered boolean logic — the language every computer speaks. Turing proved any calculation could be reduced to AND, OR, NOT.",
        });
      }, 800);
    } else {
      doorEl.textContent = "🔒 LOCKED";
      doorEl.className = "gate-door-status";
      gateAttempts++;
      if (gateAttempts > 4) {
        $("gate-hint").textContent = puzzle.hint;
      }
    }
  }

  /* ══════════════════════════════════════════════════════════
     LEVEL 2A — CAESAR CIPHER
  ══════════════════════════════════════════════════════════ */
  const CIPHER_PUZZLES = [
    {
      clue: "Intelligence report: The shift key is the number of letters in TURING's first name.",
      answer: "ENIGMAFALLS",
      shift: 4, // ALAN = 4 letters
      encoded: caesarEncode("ENIGMAFALLS", 4),
    },
    {
      clue: "Field note: Use the number of years between Turing's birth and the start of WW2 — subtract 1912 from 1939.",
      answer: "BOMBECRACKED",
      shift: 1, // (1939-1912) mod 26 = 27 mod 26 = 1
      encoded: caesarEncode("BOMBECRACKED", 1),
    },
  ];
  let cipherIdx = 0;

  function caesarEncode(text, shift) {
    return text.toUpperCase().split("").map(c => {
      if (c < "A" || c > "Z") return c;
      return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
    }).join("");
  }
  function caesarDecode(text, shift) {
    return caesarEncode(text, 26 - shift);
  }

  function initCipher() {
    const p = CIPHER_PUZZLES[cipherIdx % CIPHER_PUZZLES.length];
    $("cipher-clue").innerHTML    = "📋 " + p.clue;
    $("cipher-encoded").textContent = p.encoded;
    $("shift-slider").value       = 0;
    $("shift-display").textContent = 0;
    $("cipher-decoded").textContent = "—";

    $("shift-slider").oninput = () => {
      const s = +$("shift-slider").value;
      $("shift-display").textContent = s;
      $("cipher-decoded").textContent = caesarDecode(p.encoded, s);
    };

    $("cipher-submit-btn").onclick = checkCipher;
  }

  function checkCipher() {
    const p = CIPHER_PUZZLES[cipherIdx % CIPHER_PUZZLES.length];
    const s = +$("shift-slider").value;
    const decoded = caesarDecode(p.encoded, s);
    if (decoded === p.answer) {
      Engine.levelComplete({
        icon:  "📡",
        title: "MESSAGE DECODED",
        body:  `Shift key ${s} was correct. Decoded: "${p.answer}". Turing's Bombe tested thousands of Enigma settings per minute — this is how Bletchley cracked Nazi communications.`,
      });
    } else {
      toast("Wrong shift. Read the clue carefully — the answer is a number.", false);
    }
  }

  /* ══════════════════════════════════════════════════════════
     LEVEL 2B — BINARY DECODE
  ══════════════════════════════════════════════════════════ */
  const BINARY_PUZZLES = [
    {
      word: "BOMBE",
      bytes: ["01000010","01001111","01001101","01000010","01000101"],
    },
    {
      word: "LOGIC",
      bytes: ["01001100","01001111","01000111","01001001","01000011"],
    },
  ];
  let binaryIdx = 0;

  function initBinary() {
    const p = BINARY_PUZZLES[binaryIdx % BINARY_PUZZLES.length];
    const grid = $("binary-grid");
    grid.innerHTML = "";
    p.bytes.forEach((b, i) => {
      const card = document.createElement("div");
      card.className = "binary-card";
      card.innerHTML = `
        <div class="binary-bits">${b}</div>
        <div class="binary-hint">Letter ${i + 1}</div>
      `;
      grid.appendChild(card);
    });
    $("binary-input").value = "";
    $("binary-submit-btn").onclick = checkBinary;
    $("binary-input").onkeydown = e => { if (e.key === "Enter") checkBinary(); };
  }

  function checkBinary() {
    const p = BINARY_PUZZLES[binaryIdx % BINARY_PUZZLES.length];
    const ans = $("binary-input").value.trim().toUpperCase();
    if (ans === p.word) {
      Engine.levelComplete({
        icon:  "💡",
        title: "SIGNAL DECODED",
        body:  `"${p.word}" — the hidden word in the binary. Every letter you have ever read on a screen is stored as binary beneath the surface. Turing formalised this idea in 1936.`,
      });
    } else {
      toast("Incorrect. Convert each 8-bit byte to its ASCII letter.", false);
    }
  }

  /* ══════════════════════════════════════════════════════════
     LEVEL 3 — LIGHT / DARK
     A 6×4 grid. Some cells have symbols, most empty.
     Player clicks to "illuminate" — lit cells reveal symbols.
     They must enter the revealed sequence.
  ══════════════════════════════════════════════════════════ */
  const LIGHT_PUZZLES = [
    {
      answer: "TRUTH",
      // grid is 6 cols × 4 rows = 24 cells
      // symbols placed at specific indices, others blank
      cells: [
        "","","T","","","",
        "","R","","","U","",
        "","","","T","","",
        "H","","","","","",
      ],
    },
    {
      answer: "PRIDE",
      cells: [
        "","P","","","","",
        "","","R","","","",
        "I","","","D","","",
        "","","","","E","",
      ],
    },
  ];
  let lightIdx = 0;
  let litCells = new Set();

  function initLight() {
    const p = LIGHT_PUZZLES[lightIdx % LIGHT_PUZZLES.length];
    litCells = new Set();
    const grid = $("light-grid");
    grid.innerHTML = "";
    p.cells.forEach((sym, i) => {
      const cell = document.createElement("div");
      cell.className = "lcell" + (sym === "" ? " empty" : "");
      cell.dataset.sym = sym;
      cell.dataset.i   = i;
      if (sym !== "") {
        cell.onclick = () => {
          cell.classList.toggle("lit");
          if (cell.classList.contains("lit")) {
            litCells.add(i);
          } else {
            litCells.delete(i);
          }
          updateLightRevealed();
        };
      }
      grid.appendChild(cell);
    });
    $("light-input").value = "";
    updateLightRevealed();
    $("light-submit-btn").onclick = checkLight;
    $("light-input").onkeydown = e => { if (e.key === "Enter") checkLight(); };
  }

  function updateLightRevealed() {
    const p = LIGHT_PUZZLES[lightIdx % LIGHT_PUZZLES.length];
    const revDiv = $("light-revealed");
    revDiv.innerHTML = "";
    // show symbols in reading order (by cell index)
    const orderedLit = [...litCells].sort((a,b) => a - b);
    orderedLit.forEach(i => {
      const sym = p.cells[i];
      if (sym) {
        const span = document.createElement("span");
        span.className = "rev-char";
        span.textContent = sym;
        revDiv.appendChild(span);
      }
    });
  }

  function checkLight() {
    const p = LIGHT_PUZZLES[lightIdx % LIGHT_PUZZLES.length];
    const ans = $("light-input").value.trim().toUpperCase();
    if (ans === p.answer) {
      Engine.levelComplete({
        icon:  "☀",
        title: "LIGHT REVEALS ALL",
        body:  `"${p.answer}" — hidden in the dark. In 1952, the British government tried to suppress who Turing was. They could not erase what he had built.`,
      });
    } else {
      toast("Wrong sequence. Illuminate the cells — read left→right, top→bottom.", false);
    }
  }

  /* ══════════════════════════════════════════════════════════
     LEVEL 4 — ENIGMA MACHINE
     6 rotors, each with A–Z. Player adjusts each rotor.
     The rotors produce a Caesar-like chain shift.
     Target word shown; player must dial to make output = target.
  ══════════════════════════════════════════════════════════ */
  const ENIGMA_PUZZLES = [
    { target: "TURING", rotorCount: 6 },
    { target: "BLETCHLEY", rotorCount: 6 },
  ];
  let enigmaIdx = 0;
  let rotorValues = []; // 0–25

  function initEnigma() {
    const p = ENIGMA_PUZZLES[enigmaIdx % ENIGMA_PUZZLES.length];
    // start rotors at random positions
    rotorValues = Array.from({ length: p.rotorCount }, () => Math.floor(Math.random() * 26));
    $("enigma-target").textContent = p.target;
    renderEnigma();
    $("enigma-submit-btn").onclick = checkEnigma;
  }

  function enigmaEncode(target, rotors) {
    // simple chain shift: each char shifted by its rotor value
    return target.split("").map((ch, i) => {
      const r = rotors[i % rotors.length];
      const code = ch.charCodeAt(0) - 65;
      return String.fromCharCode(((code + r) % 26) + 65);
    }).join("");
  }

  function renderEnigma() {
    const p = ENIGMA_PUZZLES[enigmaIdx % ENIGMA_PUZZLES.length];
    const rotorsEl = $("enigma-rotors");
    rotorsEl.innerHTML = "";

    rotorValues.forEach((val, i) => {
      const unit = document.createElement("div");
      unit.className = "rotor-unit";

      const lbl = document.createElement("div");
      lbl.className = "rotor-lbl";
      lbl.textContent = "ROTOR " + (i + 1);

      const wheel = document.createElement("div");
      wheel.className = "rotor-wheel";
      wheel.textContent = String.fromCharCode(65 + val);

      const btns = document.createElement("div");
      btns.className = "rotor-btns";

      const up = document.createElement("button");
      up.className = "rotor-btn";
      up.textContent = "▲";
      up.onclick = () => {
        rotorValues[i] = (rotorValues[i] + 1) % 26;
        renderEnigma();
      };

      const dn = document.createElement("button");
      dn.className = "rotor-btn";
      dn.textContent = "▼";
      dn.onclick = () => {
        rotorValues[i] = (rotorValues[i] + 25) % 26;
        renderEnigma();
      };

      btns.append(up, dn);
      unit.append(lbl, wheel, btns);
      rotorsEl.appendChild(unit);
    });

    // compute output: we need to find what rotors produce target
    // display: current output if all rotors were applied to target
    const out = enigmaEncode(p.target, rotorValues);
    const outEl = $("enigma-output");
    outEl.textContent = out;

    if (out === p.target) {
      outEl.classList.add("match");
    } else {
      outEl.classList.remove("match");
    }
  }

  function checkEnigma() {
    const p = ENIGMA_PUZZLES[enigmaIdx % ENIGMA_PUZZLES.length];
    // Win condition: every rotor is at 0 (no shift = identity = output equals target)
    const allZero = rotorValues.every(v => v === 0);
    if (allZero) {
      Engine.levelComplete({
        icon:  "⚙",
        title: "ENIGMA DECODED",
        body:  "All rotors at zero — the machine reveals its plaintext. Turing's Bombe found the daily Enigma settings by testing every rotor combination mechanically. It was the world's first programmable computing device.",
      });
    } else {
      toast("Not yet. Set all rotors to position A (zero shift) so output matches target.", false);
    }
  }

  /* ══════════════════════════════════════════════════════════
     LEVEL 5 — TURING TEST
     Player sees a QUESTION + two RESPONSES (one human, one AI).
     Must identify which is human and which is machine.
     Need 4/5 correct.
  ══════════════════════════════════════════════════════════ */
  const TURING_QUESTIONS = [
    {
      question: "What does it feel like to be afraid?",
      human: {
        text: "There's this hollow sensation in my chest, like my heart has relocated slightly. Everything gets very loud and very quiet at the same time. I once hid under my bed during a thunderstorm until I was sixteen — I still don't tell people that.",
        isHuman: true,
      },
      machine: {
        text: "Fear is characterised by physiological responses including elevated heart rate, cortisol release, and heightened sensory alertness. It serves an adaptive function, preparing organisms to respond to perceived threats via fight-or-flight mechanisms.",
        isHuman: false,
      },
    },
    {
      question: "Describe the colour red to someone who has never seen it.",
      human: {
        text: "Imagine embarrassment. The heat when everyone looks at you at once. Or the urgency of a fire alarm — that feeling that something important is happening right now. Red is the colour that sounds like a trumpet.",
        isHuman: true,
      },
      machine: {
        text: "Red is a colour with a wavelength of approximately 620–750 nanometres at the long end of the visible light spectrum. It is one of the primary colours in the RGB model and is commonly associated with danger, passion, and stopping in traffic signage.",
        isHuman: false,
      },
    },
    {
      question: "Do you ever feel lonely?",
      human: {
        text: "Yes. Even in a room full of people. Sometimes especially then. There are thoughts I've had for years that I've never said aloud to anyone, not because I'm secretive, but because I don't think there's a person who would fully understand them.",
        isHuman: true,
      },
      machine: {
        text: "As an AI, I do not experience emotions such as loneliness. I process inputs and generate outputs based on training data. The concept of loneliness implies subjective conscious experience, which I do not possess.",
        isHuman: false,
      },
    },
    {
      question: "What would you do if you found out you had one year to live?",
      human: {
        text: "Honestly? I'd probably spend the first month convinced I'd be the exception. Then I'd go back to Portugal — I had a week there in 2019 that I still dream about sometimes. I'd call people I haven't called in years. I'd stop apologising for taking up space.",
        isHuman: true,
      },
      machine: {
        text: "Given one year to live, a rational actor would prioritise high-value experiences, resolve outstanding interpersonal conflicts, complete a will and advance directives, and focus on legacy activities that maximise positive impact within the remaining timeframe.",
        isHuman: false,
      },
    },
    {
      question: "Is mathematics invented or discovered?",
      human: {
        text: "I've gone back and forth on this. Some days it feels discovered — like we're finding something that was always there waiting. Other days a proof feels like a choice, an aesthetic preference. The fact that I genuinely don't know bothers me, which I think means it's the right question.",
        isHuman: true,
      },
      machine: {
        text: "This is a longstanding philosophical debate between mathematical Platonism, which holds that mathematical entities exist independently of human minds, and formalism or constructivism, which view mathematics as a human invention or mental construction. Both positions have significant defenders.",
        isHuman: false,
      },
    },
  ];

  let turingScore = 0;
  let turingTotal = 0;
  let turingQIdx  = 0;

  function initTuringTest() {
    turingScore = 0;
    turingTotal = 0;
    turingQIdx  = 0;
    renderTuringQuestion();
  }

  function renderTuringQuestion() {
    const q = TURING_QUESTIONS[turingQIdx];
    if (!q) return;

    $("turing-q-text").textContent = q.question;
    $("turing-score").textContent = `${turingScore} / ${turingTotal}`;
    $("turing-remaining").textContent = TURING_QUESTIONS.length - turingQIdx;

    const cards = $("turing-cards");
    cards.innerHTML = "";

    // track how many cards answered THIS question
    let answeredThisQuestion = 0;

    // shuffle responses
    const responses = Math.random() < 0.5
      ? [q.human, q.machine]
      : [q.machine, q.human];

    responses.forEach(resp => {
      const card = document.createElement("div");
      card.className = "turing-card";

      const text = document.createElement("div");
      text.className = "turing-card-text";
      text.textContent = resp.text;

      const btnRow = document.createElement("div");
      btnRow.className = "turing-btns";

      const hBtn = document.createElement("button");
      hBtn.className = "t-btn human";
      hBtn.textContent = "🧠 HUMAN";

      const mBtn = document.createElement("button");
      mBtn.className = "t-btn machine";
      mBtn.textContent = "🤖 MACHINE";

      let answered = false;

      const markAnswer = (guessedHuman) => {
        if (answered) return;
        answered = true;

        const correct = guessedHuman === resp.isHuman;
        turingTotal++;
        if (correct) turingScore++;

        // disable only THIS card's buttons
        hBtn.disabled = true;
        mBtn.disabled = true;

        hBtn.classList.add(resp.isHuman  ? "correct" : "wrong");
        mBtn.classList.add(!resp.isHuman ? "correct" : "wrong");

        toast(correct ? "✓ Correct!" : "✗ Wrong — check the language patterns.", correct);
        $("turing-score").textContent = `${turingScore} / ${turingTotal}`;

        // advance only when BOTH cards in this question are answered
        answeredThisQuestion++;
        if (answeredThisQuestion === 2) {
          turingQIdx++;
          if (turingQIdx >= TURING_QUESTIONS.length) {
            setTimeout(finishTuringTest, 1400);
          } else {
            setTimeout(renderTuringQuestion, 1600);
          }
        }
      };

      hBtn.onclick = () => markAnswer(true);
      mBtn.onclick = () => markAnswer(false);

      btnRow.append(hBtn, mBtn);
      card.append(text, btnRow);
      cards.appendChild(card);
    });
  }

  function finishTuringTest() {
    const passed = turingScore >= 4;
    Engine.levelComplete({
      icon:  passed ? "🎓" : "🤔",
      title: passed ? "TEST PASSED" : "TEST FAILED",
      body:  `You scored ${turingScore}/${turingTotal * 2} on the Turing Test. ${
        passed
          ? "You can distinguish human thought from machine output. Turing would say: so can the machine, given enough time."
          : "Machines are getting harder to detect. Turing predicted this in 1950."
      }`,
      isFinal: true,
    });
  }

  /* ─── public API ─────────────────────────────────────────── */
  return {
    initGates,
    initCipher,
    checkCipher,
    initBinary,
    checkBinary,
    initLight,
    checkLight,
    initEnigma,
    checkEnigma,
    initTuringTest,
  };

})();