/* ═══════════════════════════════════════════════════════════
   TURING'S LIGHT  ·  js/engine.js
   Screen manager · Canvas animations · Game flow
═══════════════════════════════════════════════════════════ */

const Engine = (() => {

  /* ─── state ──────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  let storyIdx     = 0;    // which STORY entry we're showing
  let currentLevel = 0;    // 0 = not started
  let modalCallback = null;

  /* ─── SCREEN MANAGER ─────────────────────────────────────── */
  const SCREENS = ["title","story","game","ending"];

  function showScreen(name) {
    SCREENS.forEach(s => {
      const el = $("screen-" + s);
      el.style.display  = "none";
      el.style.opacity  = "0";
      el.classList.remove("active");
    });
    const target = $("screen-" + name);
    target.style.display = "flex";
    requestAnimationFrame(() => {
      target.style.opacity = "1";
      target.classList.add("active");
    });

    // start relevant canvas
    if (name === "title")   startTitleCanvas();
    if (name === "story")   startStoryCanvas();
    if (name === "game")    startBgCanvas();
    if (name === "ending")  startEndingCanvas();
  }

  /* ─── TITLE SCREEN INIT ──────────────────────────────────── */
  function initTitle() {
    showScreen("title");
    $("start-btn").onclick = () => {
      storyIdx = 0;
      showStory(0);
    };
    document.addEventListener("keydown", onTitleKey);
  }
  function onTitleKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      document.removeEventListener("keydown", onTitleKey);
      storyIdx = 0;
      showStory(0);
    }
  }

  /* ─── STORY SCREEN ───────────────────────────────────────── */
  function showStory(idx) {
    storyIdx = idx;   // ← always keep storyIdx in sync
    const s = STORY[idx];
    if (!s) { showEnding(); return; }

    showScreen("story");
    $("story-act-badge").textContent = s.act;
    $("story-headline").textContent  = s.headline;

    // typewriter effect
    const body = $("story-body");
    body.innerHTML = "";
    let lineIdx = 0;

    function nextLine() {
      if (lineIdx >= s.lines.length) return;
      const span = document.createElement("span");
      span.className = "tl";
      span.innerHTML = s.lines[lineIdx] || "&nbsp;";
      body.appendChild(span);
      lineIdx++;
      if (lineIdx < s.lines.length) {
        setTimeout(nextLine, 70);
      }
    }
    nextLine();

    // continue button
    const btn = $("story-continue-btn");
    btn.onclick = () => continueFromStory(s);
    document.addEventListener("keydown", onStoryKey);
  }

  function onStoryKey(e) {
    if (e.key === "Enter") {
      document.removeEventListener("keydown", onStoryKey);
      const s = STORY[storyIdx];
      if (s) continueFromStory(s);
    }
  }

  function continueFromStory(s) {
    document.removeEventListener("keydown", onStoryKey);
    loadLevel(s);
  }

  /* ─── LEVEL LOADER ───────────────────────────────────────── */
  const PUZZLE_IDS = ["puzzle-1","puzzle-2a","puzzle-2b","puzzle-3","puzzle-4","puzzle-5"];

  function loadLevel(storyEntry) {
    showScreen("game");
    // hide all puzzles
    PUZZLE_IDS.forEach(id => {
      const el = $(id);
      if (el) el.classList.add("hidden");
    });

    $("hud-act").textContent        = storyEntry.hudAct;
    $("hud-puzzle-name").textContent = storyEntry.hudName;

    const lv = storyEntry.level;
    $("hud-level").textContent = String(lv).replace("a","").replace("b","");

    setLightBar(100);

    if (lv === 1)    { $("puzzle-1").classList.remove("hidden");  Levels.initGates(); }
    if (lv === "2a") { $("puzzle-2a").classList.remove("hidden"); Levels.initCipher(); }
    if (lv === "2b") { $("puzzle-2b").classList.remove("hidden"); Levels.initBinary(); }
    if (lv === 3)    { $("puzzle-3").classList.remove("hidden");  Levels.initLight(); }
    if (lv === 4)    { $("puzzle-4").classList.remove("hidden");  Levels.initEnigma(); }
    if (lv === 5)    { $("puzzle-5").classList.remove("hidden");  Levels.initTuringTest(); }
  }

  /* ─── LEVEL COMPLETE ─────────────────────────────────────── */
  function levelComplete({ icon, title, body, isFinal = false }) {
    showModal({ icon, title, body, success: true });
    modalCallback = () => {
      if (isFinal) {
        showEnding();
      } else {
        storyIdx++;
        if (storyIdx >= STORY.length) {
          showEnding();
        } else {
          showStory(storyIdx);
        }
      }
    };
  }

  /* ─── MODAL ──────────────────────────────────────────────── */
  function showModal({ icon, title, body, success }) {
    $("modal-icon").textContent  = icon;
    $("modal-title").textContent = title;
    $("modal-title").className   = "modal-title" + (success ? "" : " fail");
    $("modal-body").textContent  = body;
    $("modal").classList.remove("hidden");
    $("modal-next-btn").onclick  = closeModal;
  }

  function closeModal() {
    $("modal").classList.add("hidden");
    if (modalCallback) { modalCallback(); modalCallback = null; }
  }

  /* ─── LIGHT BAR ──────────────────────────────────────────── */
  function setLightBar(pct) {
    const bar = $("light-bar");
    if (!bar) return;
    bar.style.width = pct + "%";
    $("hud-light").textContent = pct + "%";
    if (pct < 30) {
      bar.style.background = "linear-gradient(90deg,var(--red),var(--amber))";
    } else {
      bar.style.background = "linear-gradient(90deg,var(--green),var(--cyan))";
    }
  }

  /* ─── ENDING SCREEN ──────────────────────────────────────── */
  function showEnding() {
    showScreen("ending");

    // pride dots
    const dotWrap = $("pride-dots");
    dotWrap.innerHTML = "";
    ["#ff4444","#ff9200","#ffe600","#00e676","#2979ff","#cc44ff"].forEach(c => {
      const d = document.createElement("div");
      d.className = "pdot";
      d.style.background = c;
      dotWrap.appendChild(d);
    });

    // ending log typewriter
    const logEl = $("ending-log");
    logEl.innerHTML = "";
    const lines = [
      "ARCHIVE_STATUS: COMPLETE",
      "",
      "Alan Turing's work underpins every computer, every phone,",
      "every AI system — every digital word you have ever read.",
      "",
      "He was gay. He was brilliant. He was destroyed by the state",
      "he had saved.",
      "",
      "In 2013, a royal pardon was issued — 59 years too late.",
      "In 2021, the £50 note was redesigned with his portrait.",
      "",
      "Over 65,000 men convicted under the same law were never pardoned.",
      "Their names are not on any note.",
      "",
      "> PRIDE is remembering what the world tried to forget.",
      "> JUNETEENTH is remembering what power tried to erase.",
      "> TURING'S LIGHT is what remains when they fail.",
    ];
    let i = 0;
    function nextLogLine() {
      if (i >= lines.length) return;
      const span = document.createElement("span");
      span.className = "tl";
      span.textContent = lines[i] || "\u00a0";
      logEl.appendChild(span);
      i++;
      setTimeout(nextLogLine, 55);
    }
    nextLogLine();

    $("restart-btn").onclick = () => { location.reload(); };
  }

  /* ══════════════════════════════════════════════════════════
     CANVAS ANIMATIONS
  ══════════════════════════════════════════════════════════ */

  let animStop = false;

  function stopAllCanvases() { animStop = true; }

  /* ── Title Canvas: stars + pride prism ────────────────────── */
  function startTitleCanvas() {
    animStop = false;
    const canvas = $("title-canvas");
    const ctx    = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 260 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random(),
      phase: Math.random() * Math.PI * 2,
      spd: Math.random() * 0.02 + 0.006,
    }));

    const prismBands = [
      { c: "rgba(255,68,68,",   y: 0.72, h: 0.05 },
      { c: "rgba(255,146,0,",   y: 0.77, h: 0.04 },
      { c: "rgba(255,230,0,",   y: 0.81, h: 0.04 },
      { c: "rgba(0,230,118,",   y: 0.85, h: 0.04 },
      { c: "rgba(41,121,255,",  y: 0.89, h: 0.04 },
      { c: "rgba(204,68,255,",  y: 0.93, h: 0.04 },
    ];

    let t = 0;

    function draw() {
      if (animStop) return;
      t += 0.012;
      const W = canvas.width, H = canvas.height;

      // deep space background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#04060e");
      bg.addColorStop(1, "#060c1c");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // stars
      stars.forEach(s => {
        s.phase += s.spd;
        const alpha = s.a * (0.5 + 0.5 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });

      // pride prism bands at bottom
      prismBands.forEach(b => {
        const wave = Math.sin(t + b.y * 10) * 0.008;
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0,   b.c + "0)");
        grad.addColorStop(0.3, b.c + "0.18)");
        grad.addColorStop(0.5, b.c + (0.28 + 0.08 * Math.sin(t)).toFixed(2) + ")");
        grad.addColorStop(0.7, b.c + "0.18)");
        grad.addColorStop(1,   b.c + "0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, (b.y + wave) * H, W, b.h * H);
      });

      // subtle vignette
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.75);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Story Canvas: dark WW2 room ambience ─────────────────── */
  function startStoryCanvas() {
    animStop = false;
    const canvas = $("story-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    let t = 0;
    function draw() {
      if (animStop) return;
      t += 0.008;
      const W = canvas.width, H = canvas.height;

      ctx.fillStyle = "#04060e";
      ctx.fillRect(0, 0, W, H);

      // amber lamp glow top-left (lamp on a desk)
      const lamp = ctx.createRadialGradient(W*0.12, H*0.18, 0, W*0.12, H*0.18, H*0.4);
      lamp.addColorStop(0, `rgba(255,190,60,${0.12 + 0.03*Math.sin(t)})`);
      lamp.addColorStop(0.4, "rgba(255,150,0,0.04)");
      lamp.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = lamp;
      ctx.fillRect(0, 0, W, H);

      // typewriter glow (right side)
      const tw = ctx.createRadialGradient(W*0.88, H*0.55, 0, W*0.88, H*0.55, H*0.35);
      tw.addColorStop(0, `rgba(0,200,100,${0.06 + 0.02*Math.sin(t*0.7)})`);
      tw.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = tw;
      ctx.fillRect(0, 0, W, H);

      // vignette
      const vig = ctx.createRadialGradient(W/2, H/2, H*0.15, W/2, H/2, H*0.8);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.7)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Game BG Canvas: day↔night solstice transition ──────────── */
  function startBgCanvas() {
    animStop = false;
    const canvas = $("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    let t = 0;
    // particles: floating code fragments
    const bits = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.1,
      char: Math.random() < 0.5 ? "0" : "1",
      alpha: Math.random() * 0.3,
      size: 10 + Math.random() * 8,
    }));

    function draw() {
      if (animStop) return;
      t += 0.005;
      const W = canvas.width, H = canvas.height;

      // sky: cycle day/night based on sine (solstice metaphor)
      const day = 0.5 + 0.5 * Math.sin(t * 0.4);
      const r = Math.round(4 + day * 14);
      const g = Math.round(6 + day * 18);
      const b = Math.round(14 + day * 30);

      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, `rgb(${r},${g},${b})`);
      sky.addColorStop(1, `rgb(${r+4},${g+6},${b+8})`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // sun / moon glow
      const sunX = W * 0.85, sunY = H * 0.12;
      const sunR = 60 + day * 20;
      const sunG = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 3);
      sunG.addColorStop(0, `rgba(255,240,180,${0.15 + day * 0.35})`);
      sunG.addColorStop(0.3, `rgba(255,200,80,${0.06 + day * 0.12})`);
      sunG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sunG;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR * 3, 0, Math.PI * 2);
      ctx.fill();

      // floating binary fragments
      bits.forEach(bit => {
        bit.x += bit.vx;
        bit.y += bit.vy;
        if (bit.y < -20) { bit.y = H + 10; bit.x = Math.random() * W; }
        if (bit.x < -20) bit.x = W + 10;
        if (bit.x > W + 20) bit.x = -10;

        ctx.font = `${bit.size}px 'VT323', monospace`;
        ctx.fillStyle = `rgba(0,255,153,${bit.alpha * (0.4 + 0.6 * day)})`;
        ctx.fillText(bit.char, bit.x, bit.y);
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Ending Canvas: aurora + rainbow ─────────────────────── */
  function startEndingCanvas() {
    animStop = false;
    const canvas = $("ending-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const prideC = [
      [255,68,68], [255,146,0], [255,230,0],
      [0,230,118], [41,121,255], [204,68,255]
    ];

    let t = 0;
    function draw() {
      if (animStop) return;
      t += 0.008;
      const W = canvas.width, H = canvas.height;

      ctx.fillStyle = "#030508";
      ctx.fillRect(0, 0, W, H);

      // aurora bands
      prideC.forEach(([r,g,b], i) => {
        const yBase = H * (0.25 + i * 0.09);
        const wave  = Math.sin(t + i * 0.9) * H * 0.04;
        const grd   = ctx.createLinearGradient(0, yBase + wave, W, yBase + wave + H * 0.07);
        grd.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grd.addColorStop(0.5, `rgba(${r},${g},${b},${0.08 + 0.04*Math.sin(t*0.6+i)})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, yBase + wave, W, H * 0.1);
      });

      // centre light burst
      const cx = W / 2, cy = H / 2;
      const burst = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.5);
      burst.addColorStop(0, `rgba(255,255,255,${0.04 + 0.02*Math.sin(t)})`);
      burst.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = burst;
      ctx.fillRect(0, 0, W, H);

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ─── window resize ──────────────────────────────────────── */
  window.addEventListener("resize", () => {
    ["title-canvas","story-canvas","bg-canvas","ending-canvas"].forEach(id => {
      const c = $(id);
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    });
  });

  /* ─── boot ───────────────────────────────────────────────── */
  window.addEventListener("DOMContentLoaded", () => {
    initTitle();
  });

  /* ─── public ─────────────────────────────────────────────── */
  return {
    levelComplete,
    setLightBar,
  };

})();