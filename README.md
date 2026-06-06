# 🌟 Turing's Light



---

## 🎮 Play the Game

Open `index.html` in any modern browser. No server needed. No install. No dependencies.

> **Arrow Keys / WASD · Click · Enter**

---

## 📖 About

**Turing's Light** is a narrative puzzle game honouring **Alan Mathison Turing** (1912–1954) — mathematician, codebreaker, computer scientist, and gay man persecuted by the government he helped save.

The game spans four acts of his life, with each puzzle mechanic tied directly to his real work and legacy.

---

## 🗂️ File Structure

```
Turing's Light/
├── index.html          ← Open this to play
├── css/
│   └── style.css       ← All visual design
└── js/
    ├── story.js        ← All 4 acts, narrative text
    ├── levels.js       ← All 5 puzzle mechanics
    └── engine.js       ← Screen manager + canvas animations
```

---

## 🧩 Levels & Mechanics

| Level | Title | Mechanic | Act |
|-------|-------|----------|-----|
| 1 | Logic Gates | Toggle AND/OR/NOT switches to unlock a door | Act I · Young Turing |
| 2A | Caesar Cipher | Slide a shift key to decode intercepted messages | Act II · Bletchley Park |
| 2B | Binary Decode | Convert 8-bit bytes to letters, spell the word | Act II · Bletchley Park |
| 3 | Light & Darkness | Illuminate dark cells to reveal a hidden sequence | Act III · Persecution |
| 4 | Enigma Machine | Dial 6 rotors to match the target output | Act III · The Enigma |
| 5 | The Turing Test | Identify human vs. machine responses — 4/5 to pass | Act IV · Legacy |

---

## 🎨 Visual Design

- **Retro terminal UI** — VT323 monospace font, amber/green phosphor palette, scanline overlay
- **WW2 codebreaking room aesthetic** — dark ambience, amber desk lamp glow, typewriter effects
- **Rainbow pride prism** — Pride colours as persistent motif throughout title, HUD, ending
- **Day ↔ Night canvas** — Animated solstice sky transitions in game background
- **Aurora ending** — Animated pride-coloured aurora on the final screen

---

## 📚 Story Structure

```
ACT I   — The Boy Who Dreamed in Numbers (Cambridge, 1926)
ACT II  — Bletchley Park, 1940–1941 (Enigma, Bombe, interception)
ACT III — Persecution (Arrest, chemical castration, death, 1952–1954)
ACT IV  — Legacy (The Turing Test, modern AI, posthumous pardon)
```

---

## 🏆 Prize Categories Targeted

### ✅ Main Prompt — June Solstice
- Light/darkness as a core gameplay mechanic (Level 3)
- Solstice day↔night canvas transition
- Pride, Juneteenth, and reflection themes woven through all story acts

### ✅ Best Ode to Alan Turing
- Every puzzle mechanic is drawn from Turing's *actual work*:
  - Boolean logic gates → his 1936 Turing Machine paper
  - Caesar/Enigma ciphers → Bletchley Park codebreaking
  - Binary decode → his foundational work on digital computers
  - The Turing Test → his 1950 paper "Computing Machinery and Intelligence"
- Story text is historically accurate
- Ending screen is a direct tribute with documented facts

---

## 🛠️ Technical

- **Pure HTML/CSS/JS** — zero frameworks, zero build tools, zero dependencies
- **Canvas API** — all background animations (stars, aurora, day/night, binary fragments)
- **CSS custom properties** — full design token system
- **Google Fonts** — Share Tech Mono, Cinzel, VT323 (loaded via CDN)
- **No localStorage**, no backend, no API calls

---

## 🏳️‍🌈 Ending Message

> *"The light of truth can be obscured, but never extinguished."*

Alan Turing was chemically castrated by the British government for being gay.  
He died on 7 June 1954, aged 41.  
He was pardoned — posthumously — in 2013.  
Every computer you have ever used exists because of him.

---



---

*Built with care. In his memory.*
