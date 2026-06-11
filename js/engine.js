const Engine = (() => {
  const $ = id => document.getElementById(id);
  let currentStoryIdx = 0;
  let modalCallback = null;
  let storyKeyHandler = null;

  const SCREENS = ["title","story","game","ending"];
  function showScreen(name) {
    SCREENS.forEach(s => {
      const el = $("screen-"+s);
      el.style.display="none"; el.style.opacity="0";
      el.classList.remove("active");
    });
    const t = $("screen-"+name);
    t.style.display="flex";
    requestAnimationFrame(()=>{ t.style.opacity="1"; t.classList.add("active"); });
    if(name==="title")  startTitleCanvas();
    if(name==="story")  startStoryCanvas();
    if(name==="game")   startBgCanvas();
    if(name==="ending") startEndingCanvas();
  }

  function initTitle() {
    showScreen("title");
    $("start-btn").onclick = ()=> goToStory(0);
  }

  function goToStory(idx) {
    currentStoryIdx = idx;
    const s = STORY[idx];
    if(!s){ showEnding(); return; }

    showScreen("story");
    $("story-act-badge").textContent = s.act;
    $("story-headline").textContent  = s.headline;

    const body = $("story-body");
    body.innerHTML = "";
    let li = 0;
    function nextLine() {
      if(li >= s.lines.length) return;
      const sp = document.createElement("span");
      sp.className = "tl";
      sp.innerHTML = s.lines[li] || "&nbsp;";
      body.appendChild(sp);
      li++;
      if(li < s.lines.length) setTimeout(nextLine, 70);
    }
    nextLine();

    /* ── CRITICAL: remove old key listener before adding new one ── */
    if(storyKeyHandler) {
      document.removeEventListener("keydown", storyKeyHandler);
      storyKeyHandler = null;
    }

    /* ── Replace button to wipe old onclick ── */
    const oldBtn = $("story-continue-btn");
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);

    function proceed() {
      if(storyKeyHandler) {
        document.removeEventListener("keydown", storyKeyHandler);
        storyKeyHandler = null;
      }
      goToLevel(s);
    }

    newBtn.onclick = proceed;

    storyKeyHandler = function(e) {
      if(e.key === "Enter") proceed();
    };
    document.addEventListener("keydown", storyKeyHandler);
  }

  const PUZZLE_IDS = ["puzzle-1","puzzle-2a","puzzle-2b","puzzle-3","puzzle-4","puzzle-5"];

  function goToLevel(s) {
    showScreen("game");
    PUZZLE_IDS.forEach(id => { const el=$(id); if(el) el.classList.add("hidden"); });
    $("hud-act").textContent         = s.hudAct;
    $("hud-puzzle-name").textContent  = s.hudName;
    $("hud-level").textContent        = String(s.level).replace("a","").replace("b","");
    setLightBar(100);
    if(s.level===1)    { $("puzzle-1").classList.remove("hidden");  Levels.initGates(); }
    if(s.level==="2a") { $("puzzle-2a").classList.remove("hidden"); Levels.initCipher(); }
    if(s.level==="2b") { $("puzzle-2b").classList.remove("hidden"); Levels.initBinary(); }
    if(s.level===3)    { $("puzzle-3").classList.remove("hidden");  Levels.initLight(); }
    if(s.level===4)    { $("puzzle-4").classList.remove("hidden");  Levels.initEnigma(); }
    if(s.level===5)    { $("puzzle-5").classList.remove("hidden");  Levels.initTuringTest(); }
  }

  function levelComplete({ icon, title, body, isFinal=false }) {
    const oldBtn = $("modal-next-btn");
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    $("modal-icon").textContent  = icon;
    $("modal-title").textContent = title;
    $("modal-title").className   = "modal-title";
    $("modal-body").textContent  = body;
    $("modal").classList.remove("hidden");
    newBtn.onclick = () => {
      $("modal").classList.add("hidden");
      if(isFinal) { showEnding(); return; }
      const next = currentStoryIdx + 1;
      if(next >= STORY.length) showEnding();
      else goToStory(next);
    };
  }

  function setLightBar(pct) {
    const bar = $("light-bar"); if(!bar) return;
    bar.style.width = pct+"%";
    $("hud-light").textContent = pct+"%";
    bar.style.background = pct<30
      ? "linear-gradient(90deg,var(--red),var(--amber))"
      : "linear-gradient(90deg,var(--green),var(--cyan))";
  }

  function showEnding() {
    showScreen("ending");
    const dw = $("pride-dots"); dw.innerHTML="";
    ["#ff4444","#ff9200","#ffe600","#00e676","#2979ff","#cc44ff"].forEach(c=>{
      const d=document.createElement("div"); d.className="pdot"; d.style.background=c; dw.appendChild(d);
    });
    const logEl=$("ending-log"); logEl.innerHTML="";
    const lines=[
      "ARCHIVE_STATUS: COMPLETE","",
      "Alan Turing's work underpins every computer, every phone,",
      "every AI system — every digital word you have ever read.","",
      "He was gay. He was brilliant. He was destroyed by the state","he had saved.","",
      "In 2013, a royal pardon was issued — 59 years too late.",
      "In 2021, the £50 note was redesigned with his portrait.","",
      "Over 65,000 men convicted under the same law were never pardoned.",
      "Their names are not on any note.","",
      "> PRIDE is remembering what the world tried to forget.",
      "> JUNETEENTH is remembering what power tried to erase.",
      "> TURING'S LIGHT is what remains when they fail.",
    ];
    let i=0;
    function nl(){
      if(i>=lines.length)return;
      const sp=document.createElement("span"); sp.className="tl";
      sp.textContent=lines[i]||"\u00a0"; logEl.appendChild(sp); i++;
      setTimeout(nl,55);
    }
    nl();
    $("restart-btn").onclick=()=>location.reload();
  }

  /* ── CANVAS ── */
  function startTitleCanvas(){
    const cv=$("title-canvas"),ctx=cv.getContext("2d");
    cv.width=innerWidth; cv.height=innerHeight;
    const stars=Array.from({length:260},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*1.6+0.3,a:Math.random(),ph:Math.random()*Math.PI*2,sp:Math.random()*0.02+0.006}));
    const bands=[{c:"rgba(255,68,68,",y:.72,h:.05},{c:"rgba(255,146,0,",y:.77,h:.04},{c:"rgba(255,230,0,",y:.81,h:.04},{c:"rgba(0,230,118,",y:.85,h:.04},{c:"rgba(41,121,255,",y:.89,h:.04},{c:"rgba(204,68,255,",y:.93,h:.04}];
    let t=0;
    (function draw(){
      t+=.012; const W=cv.width,H=cv.height;
      const bg=ctx.createLinearGradient(0,0,0,H); bg.addColorStop(0,"#04060e"); bg.addColorStop(1,"#060c1c");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{s.ph+=s.sp;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${s.a*(0.5+0.5*Math.sin(s.ph))})`;ctx.fill();});
      bands.forEach(b=>{const w=Math.sin(t+b.y*10)*.008,g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,b.c+"0)");g.addColorStop(.3,b.c+".18)");g.addColorStop(.5,b.c+(0.28+0.08*Math.sin(t)).toFixed(2)+")");g.addColorStop(.7,b.c+".18)");g.addColorStop(1,b.c+"0)");ctx.fillStyle=g;ctx.fillRect(0,(b.y+w)*H,W,b.h*H);});
      requestAnimationFrame(draw);
    })();
  }
  function startStoryCanvas(){
    const cv=$("story-canvas"); if(!cv)return;
    const ctx=cv.getContext("2d"); cv.width=innerWidth; cv.height=innerHeight;
    let t=0;
    (function draw(){
      t+=.008; const W=cv.width,H=cv.height;
      ctx.fillStyle="#04060e"; ctx.fillRect(0,0,W,H);
      const l=ctx.createRadialGradient(W*.12,H*.18,0,W*.12,H*.18,H*.4);
      l.addColorStop(0,`rgba(255,190,60,${0.12+0.03*Math.sin(t)})`); l.addColorStop(.4,"rgba(255,150,0,.04)"); l.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=l; ctx.fillRect(0,0,W,H);
      const v=ctx.createRadialGradient(W/2,H/2,H*.15,W/2,H/2,H*.8);
      v.addColorStop(0,"rgba(0,0,0,0)"); v.addColorStop(1,"rgba(0,0,0,.7)");
      ctx.fillStyle=v; ctx.fillRect(0,0,W,H);
      requestAnimationFrame(draw);
    })();
  }
  function startBgCanvas(){
    const cv=$("bg-canvas"); if(!cv)return;
    const ctx=cv.getContext("2d"); cv.width=innerWidth; cv.height=innerHeight;
    let t=0;
    const bits=Array.from({length:30},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,vx:(Math.random()-.5)*.4,vy:-Math.random()*.5-.1,ch:Math.random()<.5?"0":"1",a:Math.random()*.3,sz:10+Math.random()*8}));
    (function draw(){
      t+=.005; const W=cv.width,H=cv.height,day=0.5+0.5*Math.sin(t*.4);
      const r=Math.round(4+day*14),g=Math.round(6+day*18),b=Math.round(14+day*30);
      const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,`rgb(${r},${g},${b})`); sky.addColorStop(1,`rgb(${r+4},${g+6},${b+8})`);
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
      const sg=ctx.createRadialGradient(W*.85,H*.12,0,W*.85,H*.12,180);
      sg.addColorStop(0,`rgba(255,240,180,${0.15+day*.35})`); sg.addColorStop(.3,`rgba(255,200,80,${0.06+day*.12})`); sg.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(W*.85,H*.12,180,0,Math.PI*2); ctx.fill();
      bits.forEach(bit=>{bit.x+=bit.vx;bit.y+=bit.vy;if(bit.y<-20){bit.y=H+10;bit.x=Math.random()*W;}if(bit.x<-20)bit.x=W+10;if(bit.x>W+20)bit.x=-10;ctx.font=`${bit.sz}px 'VT323',monospace`;ctx.fillStyle=`rgba(0,255,153,${bit.a*(0.4+0.6*day)})`;ctx.fillText(bit.ch,bit.x,bit.y);});
      requestAnimationFrame(draw);
    })();
  }
  function startEndingCanvas(){
    const cv=$("ending-canvas"); if(!cv)return;
    const ctx=cv.getContext("2d"); cv.width=innerWidth; cv.height=innerHeight;
    const pc=[[255,68,68],[255,146,0],[255,230,0],[0,230,118],[41,121,255],[204,68,255]];
    let t=0;
    (function draw(){
      t+=.008; const W=cv.width,H=cv.height;
      ctx.fillStyle="#030508"; ctx.fillRect(0,0,W,H);
      pc.forEach(([r,g,b],i)=>{const yb=H*(.25+i*.09),w=Math.sin(t+i*.9)*H*.04,gd=ctx.createLinearGradient(0,yb+w,W,yb+w+H*.07);gd.addColorStop(0,`rgba(${r},${g},${b},0)`);gd.addColorStop(.5,`rgba(${r},${g},${b},${0.08+0.04*Math.sin(t*.6+i)})`);gd.addColorStop(1,`rgba(${r},${g},${b},0)`);ctx.fillStyle=gd;ctx.fillRect(0,yb+w,W,H*.1);});
      const bu=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,H*.5);
      bu.addColorStop(0,`rgba(255,255,255,${0.04+0.02*Math.sin(t)})`); bu.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=bu; ctx.fillRect(0,0,W,H);
      requestAnimationFrame(draw);
    })();
  }

  window.addEventListener("resize",()=>{
    ["title-canvas","story-canvas","bg-canvas","ending-canvas"].forEach(id=>{const c=$(id);if(c){c.width=innerWidth;c.height=innerHeight;}});
  });
  window.addEventListener("DOMContentLoaded",()=>{ initTitle(); });

  return { levelComplete, setLightBar };
})();