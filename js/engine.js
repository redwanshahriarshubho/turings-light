/* ═══════════════════════════════════════════════════════════
   TURING'S LIGHT  ·  js/engine.js
   Screen manager · Canvas animations · Game flow
═══════════════════════════════════════════════════════════ */

const Engine = (() => {

  const $ = id => document.getElementById(id);
  let storyIdx     = 0;
  let modalCallback = null;

  /* ─── SCREENS ──────────────────────────────────────────── */
  const SCREENS = ["title","story","game","ending"];

  function showScreen(name) {
    SCREENS.forEach(s => {
      const el = $("screen-" + s);
      el.style.display = "none";
      el.style.opacity = "0";
      el.classList.remove("active");
    });
    const target = $("screen-" + name);
    target.style.display = "flex";
    requestAnimationFrame(() => {
      target.style.opacity = "1";
      target.classList.add("active");
    });
    if (name === "title")  startTitleCanvas();
    if (name === "story")  startStoryCanvas();
    if (name === "game")   startBgCanvas();
    if (name === "ending") startEndingCanvas();
  }

  /* ─── TITLE ────────────────────────────────────────────── */
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

  /* ─── STORY ────────────────────────────────────────────── */
  function showStory(idx) {
    storyIdx = idx; /* CRITICAL: always sync storyIdx */
    const s = STORY[idx];
    if (!s) { showEnding(); return; }

    showScreen("story");
    $("story-act-badge").textContent = s.act;
    $("story-headline").textContent  = s.headline;

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
      if (lineIdx < s.lines.length) setTimeout(nextLine, 70);
    }
    nextLine();

    $("story-continue-btn").onclick = () => {
      document.removeEventListener("keydown", onStoryKey);
      loadLevel(s);
    };
    document.addEventListener("keydown", onStoryKey);
  }

  function onStoryKey(e) {
    if (e.key === "Enter") {
      document.removeEventListener("keydown", onStoryKey);
      loadLevel(STORY[storyIdx]);
    }
  }

  /* ─── LEVEL LOADER ─────────────────────────────────────── */
  const PUZZLE_IDS = ["puzzle-1","puzzle-2a","puzzle-2b","puzzle-3","puzzle-4","puzzle-5"];

  function loadLevel(s) {
    if (!s) { showEnding(); return; }
    showScreen("game");
    PUZZLE_IDS.forEach(id => {
      const el = $(id);
      if (el) el.classList.add("hidden");
    });
    $("hud-act").textContent         = s.hudAct;
    $("hud-puzzle-name").textContent  = s.hudName;
    $("hud-level").textContent        = String(s.level).replace("a","").replace("b","");
    setLightBar(100);

    if (s.level === 1)    { $("puzzle-1").classList.remove("hidden");  Levels.initGates(); }
    if (s.level === "2a") { $("puzzle-2a").classList.remove("hidden"); Levels.initCipher(); }
    if (s.level === "2b") { $("puzzle-2b").classList.remove("hidden"); Levels.initBinary(); }
    if (s.level === 3)    { $("puzzle-3").classList.remove("hidden");  Levels.initLight(); }
    if (s.level === 4)    { $("puzzle-4").classList.remove("hidden");  Levels.initEnigma(); }
    if (s.level === 5)    { $("puzzle-5").classList.remove("hidden");  Levels.initTuringTest(); }
  }

  /* ─── LEVEL COMPLETE ───────────────────────────────────── */
  function levelComplete({ icon, title, body, isFinal = false }) {
    showModal({ icon, title, body, success: true });
    modalCallback = () => {
      if (isFinal) {
        showEnding();
      } else {
        const nextIdx = storyIdx + 1;
        if (nextIdx >= STORY.length) {
          showEnding();
        } else {
          showStory(nextIdx);
        }
      }
    };
  }

  /* ─── MODAL ────────────────────────────────────────────── */
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

  /* ─── LIGHT BAR ────────────────────────────────────────── */
  function setLightBar(pct) {
    const bar = $("light-bar");
    if (!bar) return;
    bar.style.width = pct + "%";
    $("hud-light").textContent = pct + "%";
    bar.style.background = pct < 30
      ? "linear-gradient(90deg,var(--red),var(--amber))"
      : "linear-gradient(90deg,var(--green),var(--cyan))";
  }

  /* ─── ENDING ───────────────────────────────────────────── */
  function showEnding() {
    showScreen("ending");
    const dotWrap = $("pride-dots");
    dotWrap.innerHTML = "";
    ["#ff4444","#ff9200","#ffe600","#00e676","#2979ff","#cc44ff"].forEach(c => {
      const d = document.createElement("div");
      d.className = "pdot";
      d.style.background = c;
      dotWrap.appendChild(d);
    });
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
    function nextLine() {
      if (i >= lines.length) return;
      const span = document.createElement("span");
      span.className = "tl";
      span.textContent = lines[i] || "\u00a0";
      logEl.appendChild(span);
      i++;
      setTimeout(nextLine, 55);
    }
    nextLine();
    $("restart-btn").onclick = () => location.reload();
  }

  /* ═══════════════════════════════════════════════════════
     CANVAS ANIMATIONS
  ═══════════════════════════════════════════════════════ */

  /* ── Title: stars + pride prism ── */
  function startTitleCanvas() {
    const canvas = $("title-canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
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
      { c: "rgba(255,68,68,",  y: 0.72, h: 0.05 },
      { c: "rgba(255,146,0,",  y: 0.77, h: 0.04 },
      { c: "rgba(255,230,0,",  y: 0.81, h: 0.04 },
      { c: "rgba(0,230,118,",  y: 0.85, h: 0.04 },
      { c: "rgba(41,121,255,", y: 0.89, h: 0.04 },
      { c: "rgba(204,68,255,", y: 0.93, h: 0.04 },
    ];
    let t = 0;
    let running = true;
    function draw() {
      if (!running) return;
      t += 0.012;
      const W = canvas.width, H = canvas.height;
      const bg = ctx.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,"#04060e"); bg.addColorStop(1,"#060c1c");
      ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
      stars.forEach(s => {
        s.phase += s.spd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${s.a*(0.5+0.5*Math.sin(s.phase))})`;
        ctx.fill();
      });
      prismBands.forEach(b => {
        const wave = Math.sin(t + b.y*10)*0.008;
        const g = ctx.createLinearGradient(0,0,W,0);
        g.addColorStop(0, b.c+"0)");
        g.addColorStop(0.3, b.c+"0.18)");
        g.addColorStop(0.5, b.c+(0.28+0.08*Math.sin(t)).toFixed(2)+")");
        g.addColorStop(0.7, b.c+"0.18)");
        g.addColorStop(1, b.c+"0)");
        ctx.fillStyle = g;
        ctx.fillRect(0,(b.y+wave)*H,W,b.h*H);
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Story: WW2 room ambience ── */
  function startStoryCanvas() {
    const canvas = $("story-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let t = 0;
    function draw() {
      t += 0.008;
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "#04060e"; ctx.fillRect(0,0,W,H);
      const lamp = ctx.createRadialGradient(W*0.12,H*0.18,0,W*0.12,H*0.18,H*0.4);
      lamp.addColorStop(0,`rgba(255,190,60,${0.12+0.03*Math.sin(t)})`);
      lamp.addColorStop(0.4,"rgba(255,150,0,0.04)");
      lamp.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = lamp; ctx.fillRect(0,0,W,H);
      const vig = ctx.createRadialGradient(W/2,H/2,H*0.15,W/2,H/2,H*0.8);
      vig.addColorStop(0,"rgba(0,0,0,0)");
      vig.addColorStop(1,"rgba(0,0,0,0.7)");
      ctx.fillStyle = vig; ctx.fillRect(0,0,W,H);
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Game BG: day/night solstice ── */
  function startBgCanvas() {
    const canvas = $("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let t = 0;
    const bits = Array.from({ length: 30 }, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      vx: (Math.random()-0.5)*0.4, vy: -Math.random()*0.5-0.1,
      char: Math.random()<0.5?"0":"1", alpha: Math.random()*0.3,
      size: 10+Math.random()*8,
    }));
    function draw() {
      t += 0.005;
      const W = canvas.width, H = canvas.height;
      const day = 0.5+0.5*Math.sin(t*0.4);
      const r=Math.round(4+day*14), g=Math.round(6+day*18), b=Math.round(14+day*30);
      const sky = ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,`rgb(${r},${g},${b})`);
      sky.addColorStop(1,`rgb(${r+4},${g+6},${b+8})`);
      ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);
      const sunX=W*0.85, sunY=H*0.12;
      const sunG = ctx.createRadialGradient(sunX,sunY,0,sunX,sunY,180);
      sunG.addColorStop(0,`rgba(255,240,180,${0.15+day*0.35})`);
      sunG.addColorStop(0.3,`rgba(255,200,80,${0.06+day*0.12})`);
      sunG.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = sunG; ctx.beginPath(); ctx.arc(sunX,sunY,180,0,Math.PI*2); ctx.fill();
      bits.forEach(bit => {
        bit.x+=bit.vx; bit.y+=bit.vy;
        if(bit.y<-20){bit.y=H+10;bit.x=Math.random()*W;}
        if(bit.x<-20)bit.x=W+10;
        if(bit.x>W+20)bit.x=-10;
        ctx.font=`${bit.size}px 'VT323',monospace`;
        ctx.fillStyle=`rgba(0,255,153,${bit.alpha*(0.4+0.6*day)})`;
        ctx.fillText(bit.char,bit.x,bit.y);
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ── Ending: aurora ── */
  function startEndingCanvas() {
    const canvas = $("ending-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const prideC = [[255,68,68],[255,146,0],[255,230,0],[0,230,118],[41,121,255],[204,68,255]];
    let t = 0;
    function draw() {
      t += 0.008;
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = "#030508"; ctx.fillRect(0,0,W,H);
      prideC.forEach(([r,g,b],i) => {
        const yBase = H*(0.25+i*0.09);
        const wave = Math.sin(t+i*0.9)*H*0.04;
        const grd = ctx.createLinearGradient(0,yBase+wave,W,yBase+wave+H*0.07);
        grd.addColorStop(0,`rgba(${r},${g},${b},0)`);
        grd.addColorStop(0.5,`rgba(${r},${g},${b},${0.08+0.04*Math.sin(t*0.6+i)})`);
        grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd; ctx.fillRect(0,yBase+wave,W,H*0.1);
      });
      const burst = ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,H*0.5);
      burst.addColorStop(0,`rgba(255,255,255,${0.04+0.02*Math.sin(t)})`);
      burst.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = burst; ctx.fillRect(0,0,W,H);
      requestAnimationFrame(draw);
    }
    draw();
  }

  window.addEventListener("resize", () => {
    ["title-canvas","story-canvas","bg-canvas","ending-canvas"].forEach(id => {
      const c = $(id);
      if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
    });
  });

  window.addEventListener("DOMContentLoaded", () => { initTitle(); });

  return { levelComplete, setLightBar };

})();