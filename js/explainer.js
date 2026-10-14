/* Animations explicatives : schémas SVG animés + narration, dans l'esprit des reels « comment ça marche ».
   Une animation = des nœuds (composants), des liens, et des étapes. Chaque étape contient une phrase narrée
   et des actions : move (un jeton circule d'un nœud à l'autre), value (un compteur change), badge, show/hide, glow. */
(function () {
  const synth = window.speechSynthesis || null;
  const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
  const W = 1000, H = 560;
  const COLORS = { blue: '#60a5fa', orange: '#f5a524', green: '#34d399', pink: '#f472b6', purple: '#a78bfa', red: '#f87171', cyan: '#22d3ee', grey: '#9ca3af' };
  const col = c => COLORS[c] || c || COLORS.blue;
  const esc = s => U.esc(s);
  const words = s => String(s).split(/\s+/).filter(Boolean).length;
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- rendu SVG (partagé avec les vignettes de la galerie) ---------- */
  const pt = (n, portrait) => (portrait ? { x: n.y, y: n.x } : { x: n.x, y: n.y });

  function nodeSVG(id, n, portrait) {
    const c = col(n.c);
    const { x, y } = pt(n, portrait);
    if (n.kind === 'panel') {
      return `<g class="xp-node xp-panel" data-id="${id}" transform="translate(${x},${y})" style="--c:${c}">
        <rect class="xp-box" x="-82" y="-38" width="164" height="76" rx="8"/>
        <text class="xp-plabel" y="-14">${esc(n.label)}</text>
        <text class="xp-value" y="20">${esc(n.value || '')}</text>
        <g class="xp-badge hidden"><rect rx="10" height="22" y="-71"/><text y="-55"></text></g>
      </g>`;
    }
    return `<g class="xp-node" data-id="${id}" transform="translate(${x},${y})" style="--c:${c}">
      <rect class="xp-box" x="-82" y="-44" width="164" height="88" rx="14"/>
      <text class="xp-icon" y="${n.sub ? -8 : -4}">${n.icon || '⬚'}</text>
      <text class="xp-label" y="${n.sub ? 19 : 26}">${esc(n.label)}</text>
      ${n.sub ? `<text class="xp-sub" y="35">${esc(n.sub)}</text>` : ''}
      <g class="xp-badge hidden"><rect rx="10" height="22" y="-71"/><text y="-55"></text></g>
    </g>`;
  }
  // portrait : on transpose le schéma (x ↔ y) pour les écrans de téléphone
  function sceneSVG(ex, cls, portrait) {
    const links = (ex.links || []).map(l => {
      const [a, b] = l.split('-');
      if (!ex.nodes[a] || !ex.nodes[b]) return '';
      const A = pt(ex.nodes[a], portrait), B = pt(ex.nodes[b], portrait);
      return `<line class="xp-link" data-l="${a}-${b}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>`;
    }).join('');
    const nodes = Object.entries(ex.nodes).map(([id, n]) => nodeSVG(id, n, portrait)).join('');
    return `<svg class="${cls || 'xp-svg'}" viewBox="0 0 ${portrait ? H : W} ${portrait ? W : H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(ex.title)}">
      <defs><pattern id="xpdots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#ffffff10"/></pattern></defs>
      <rect width="100%" height="100%" fill="url(#xpdots)"/>
      <g class="xp-links">${links}</g><g class="xp-nodes">${nodes}</g><g class="xp-tokens"></g>
    </svg>`;
  }

  /* ---------- texte : temps forts, sous-titres, prononciation ---------- */
  // Une étape peut être écrite en « temps forts » (beats) : [{ say, do, pause }].
  // Ancien format { say, do } : découpé automatiquement en phrases, actions sur la 1re phrase.
  function splitSentences(text) {
    const parts = String(text).split(/(?<=[.!?…])\s+/).map(s => s.trim()).filter(Boolean);
    const out = [];
    parts.forEach(p => { if (out.length && out[out.length - 1].length < 25) out[out.length - 1] += ' ' + p; else out.push(p); });
    return out;
  }
  function normStep(st) {
    if (st.beats) return { beats: st.beats.map(b => ({ say: b.say, do: b.do || [], pause: b.pause })) };
    const ss = splitSentences(st.say);
    return { beats: ss.map((s, i) => ({ say: s, do: i === 0 ? (st.do || []) : [] })) };
  }
  const stepText = st => normStep(st).beats.map(b => b.say).join(' ');

  // Prononciation : uniquement pour la voix (les sous-titres gardent l'orthographe exacte)
  const SAY_AS = [
    [/\bNode\.js\b/g, 'Node J S'], [/\blibuv\b/g, 'lib U V'], [/\bkubectl\b/g, 'kube control'],
    [/\betcd\b/g, 'E T C D'], [/\bPKCE\b/g, 'pixie'], [/\bJSON\b/g, 'jason'], [/\bJWT\b/g, 'J W T'],
    [/\bOAuth\b/g, 'O auth'], [/\bCI\/CD\b/g, 'C I, C D'], [/\bwww\./g, 'trois W point '],
    [/\.fr\b/g, ' point F R'], [/\bSQS\b/g, 'S Q S'], [/\bDLQ\b/g, 'D L Q'], [/\bLLM\b/g, 'L L M'],
    [/\bRAG\b/g, 'rague'], [/\bDNS\b/g, 'D N S'], [/\bTLS\b/g, 'T L S'], [/\bHTTPS\b/g, 'H T T P S'],
    [/\bTTL\b/g, 'T T L'], [/\bCDN\b/g, 'C D N'], [/\bCPU\b/g, 'C P U'], [/\bMFA\b/g, 'M F A'],
    [/\bSHA\b/g, 'S H A'], [/\bDockerfile\b/g, 'Docker file'], [/\bcgroups\b/g, 'C groups']
  ];
  const spoken = t => SAY_AS.reduce((s, [re, r]) => s.replace(re, r), U.plain(t));

  /* ---------- lecteur ---------- */
  class ExplainerPlayer {
    constructor(root, ex, opts = {}) {
      this.root = root; this.ex = ex; this.o = opts;
      this.steps = ex.steps.map(normStep);
      this.portrait = root.clientWidth > 0 && root.clientWidth < 640;
      this.i = 0; this.playing = false; this.token = 0; this.timers = [];
      this.rate = Store.setting('rate') || 1;
      this.muted = !synth || Store.setting('muted');
      this.render();
      this.onKey = this.onKey.bind(this);
      document.addEventListener('keydown', this.onKey);
      this.reset(0);
    }

    render() {
      const ex = this.ex;
      this.root.innerHTML = `
        <div class="xp" tabindex="0">
          <div class="xp-head"><div class="xp-q">${esc(ex.question || '')}</div><div class="xp-title">${ex.icon || ''} ${esc(ex.title)}</div></div>
          <div class="xp-stage">${sceneSVG(ex, 'xp-svg', this.portrait)}</div>
          <div class="xp-caption"></div>
          <div class="xp-dots">${this.steps.map((_, k) => `<button class="xp-dot" data-k="${k}" title="Étape ${k + 1}"></button>`).join('')}</div>
          <div class="xp-controls">
            <button data-a="prev" title="Étape précédente (←)">⏮</button>
            <button data-a="play" title="Lecture / pause (espace)">▶</button>
            <button data-a="next" title="Étape suivante (→)">⏭</button>
            <span class="xp-count"></span><span class="sp"></span>
            <span class="xp-voice"></span>
            <button data-a="speed" class="xp-speed" title="Vitesse"></button>
            <button data-a="mute" title="Voix on/off (M)"></button>
            <button data-a="fs" title="Plein écran (F)">⛶</button>
          </div>
          <div class="xp-big"><span>▶</span></div>
        </div>`;
      this.el = this.root.querySelector('.xp');
      this.svg = this.el.querySelector('svg');
      this.tokens = this.svg.querySelector('.xp-tokens');
      this.cap = this.el.querySelector('.xp-caption');
      this.el.querySelector('.xp-controls').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        ({ prev: () => this.go(this.i - 1), next: () => this.go(this.i + 1), play: () => this.toggle(),
           speed: () => this.cycleSpeed(), mute: () => this.toggleMute(), fs: () => this.fullscreen() })[b.dataset.a]();
      });
      this.el.querySelector('.xp-dots').addEventListener('click', e => { const b = e.target.closest('.xp-dot'); if (b) this.go(+b.dataset.k); });
      this.el.querySelector('.xp-big').addEventListener('click', () => this.play());
      this.el.querySelector('.xp-stage').addEventListener('click', () => this.toggle());
      this.updateButtons();
    }

    node(id) { return this.svg.querySelector(`.xp-node[data-id="${id}"]`); }
    stepActions(k) { return this.steps[k].beats.flatMap(b => b.do); }

    // remet la scène dans l'état « juste avant l'étape k »
    reset(k) {
      this.token++;
      this.timers.forEach(clearTimeout); this.timers = [];
      if (synth) synth.cancel();
      if (this.audio) { this.audio.pause(); this.audio = null; }
      this.tokens.innerHTML = '';
      const end = this.el.querySelector('.xp-end'); if (end) end.remove();
      Object.entries(this.ex.nodes).forEach(([id, n]) => {
        const g = this.node(id);
        g.classList.toggle('xp-hidden', !!n.hidden);
        g.classList.remove('xp-active', 'xp-flash');
        const v = g.querySelector('.xp-value'); if (v) v.textContent = n.value || '';
        this.setBadge(id, null);
      });
      this.clearStepFx();
      for (let s = 0; s < k; s++) this.stepActions(s).forEach(a => this.apply(a, false));
      this.i = Math.max(0, Math.min(k, this.steps.length - 1));
      this.showStepInfo(-1);
    }

    // sous-titres « karaoké » : la phrase prononcée est en blanc, les autres atténuées
    showStepInfo(beat) {
      const st = this.steps[this.i];
      this.cap.innerHTML = st.beats.map((b, j) => `<span class="${j === beat ? 'on' : j < beat ? 'past' : ''}">${esc(b.say)}</span>`).join(' ');
      this.el.querySelectorAll('.xp-dot').forEach((d, k) => { d.classList.toggle('on', k === this.i); d.classList.toggle('done', k < this.i); });
      this.el.querySelector('.xp-count').textContent = `Étape ${this.i + 1}/${this.steps.length}`;
    }

    setBadge(id, text, kind) {
      const g = this.node(id); if (!g) return;
      const b = g.querySelector('.xp-badge');
      if (!text) { b.classList.add('hidden'); return; }
      const t = b.querySelector('text'); t.textContent = text;
      const w = Math.max(40, [...text].length * 7.4 + 20);
      const r = b.querySelector('rect'); r.setAttribute('width', w); r.setAttribute('x', -w / 2);
      b.setAttribute('class', 'xp-badge ' + (kind || 'info'));
      void b.getBBox(); b.classList.add('xp-pop');      // apparition douce
    }

    // applique une action ; animate=false → seulement l'état final (pour sauter des étapes)
    apply(a, animate, tok) {
      if (a.value) {
        const [id, v] = a.value; const g = this.node(id); if (!g) return 0;
        g.querySelector('.xp-value').textContent = v;
        if (animate) { g.classList.remove('xp-flash'); void g.getBBox(); g.classList.add('xp-flash'); }
      } else if (a.badge) {
        this.setBadge(a.badge[0], a.badge[1], a.badge[2]);
      } else if (a.show) {
        [].concat(a.show).forEach(id => this.node(id).classList.remove('xp-hidden'));
      } else if (a.hide) {
        [].concat(a.hide).forEach(id => this.node(id).classList.add('xp-hidden'));
      } else if (a.glow && animate) {
        [].concat(a.glow).forEach(id => this.node(id).classList.add('xp-active'));
      } else if (a.move && animate) {
        return this.move(a, tok);
      }
      return 0;
    }

    // focus : on assombrit tout ce qui ne participe pas à la phrase en cours
    focus(actions) {
      const ids = new Set();
      actions.forEach(a => {
        if (a.move) a.move.split('>').forEach(id => ids.add(id));
        ['glow', 'show'].forEach(k => a[k] && [].concat(a[k]).forEach(id => ids.add(id)));
        ['value', 'badge'].forEach(k => a[k] && a[k][1] && ids.add(a[k][0]));
      });
      if (!ids.size) return;
      this.svg.classList.add('xp-focus-mode');
      Object.keys(this.ex.nodes).forEach(id => this.node(id).classList.toggle('xp-focus', ids.has(id)));
    }

    move(a, tok) {
      const [from, to] = a.move.split('>');
      if (!this.ex.nodes[from] || !this.ex.nodes[to]) return 0;
      const A = pt(this.ex.nodes[from], this.portrait), B = pt(this.ex.nodes[to], this.portrait);
      const link = this.svg.querySelector(`.xp-link[data-l="${from}-${to}"], .xp-link[data-l="${to}-${from}"]`);
      const label = a.token || '●';
      const w = Math.max(30, [...label].length * 7.6 + 22);
      const c = col(a.c || 'orange');
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'xp-token');
      g.innerHTML = `<rect x="${-w / 2}" y="-14" width="${w}" height="28" rx="14" style="stroke:${c};fill:${c}26"/><text y="5" style="fill:${c}">${esc(label)}</text>`;
      const dur = (a.dur || 1500) / this.rate, delay = (a.delay || 0) / this.rate;
      const off = a.offset || 0; // décalage perpendiculaire pour les allers-retours
      const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
      const ox = -dy / len * off, oy = dx / len * off;
      const place = p => g.setAttribute('transform', `translate(${A.x + dx * p + ox},${A.y + dy * p + oy})`);
      place(0);
      this.timers.push(setTimeout(() => {
        if (tok !== this.token) return;
        this.tokens.appendChild(g);
        if (link) link.classList.add('xp-flow');
        const t0 = performance.now();
        const frame = now => {
          if (tok !== this.token) return;
          const p = Math.min(1, (now - t0) / dur);
          place(ease(p));
          if (p < 1) requestAnimationFrame(frame);
          else {
            this.node(to).classList.add('xp-hit');
            setTimeout(() => this.node(to) && this.node(to).classList.remove('xp-hit'), 400);
            if (!a.keep) setTimeout(() => { g.classList.add('xp-fade'); setTimeout(() => g.remove(), 400); }, 500 / this.rate);
          }
        };
        requestAnimationFrame(frame);
      }, delay));
      return delay + dur + 500 / this.rate;
    }

    // Une étape = une suite de temps forts. Chaque temps fort déclenche ses actions
    // au moment où sa phrase commence à être prononcée, puis marque une courte pause.
    runStep() {
      const tok = ++this.token;
      const st = this.steps[this.i];
      let animUntil = performance.now();
      const fire = b => {
        if (tok !== this.token) return;
        const beat = st.beats[b];
        this.showStepInfo(b);
        this.focus(beat.do);
        beat.do.forEach(a => { animUntil = Math.max(animUntil, performance.now() + (this.apply(a, true, tok) || 0)); });
      };
      const endStep = () => {
        if (tok !== this.token) return;
        const wait = Math.max(0, animUntil - performance.now()) + 650 / this.rate;
        this.timers.push(setTimeout(() => {
          if (tok !== this.token || !this.playing) return;
          if (this.i + 1 < this.steps.length) { this.clearStepFx(); this.i++; this.runStep(); }
          else this.finish();
        }, wait));
      };
      // 1) voix enregistrée (ex.audio = true) : audio/<id>/<n° d'étape>.mp3, actions réparties au prorata des mots
      if (this.ex.audio && this.audioOk !== false) {
        const au = new Audio(`audio/${this.ex.id}/${this.i + 1}.mp3`);
        this.audio = au; au.playbackRate = this.rate;
        au.onerror = () => { if (tok !== this.token) return; this.audioOk = false; this.audio = null; this.runStep(); };
        au.onloadedmetadata = () => {
          if (tok !== this.token) return;
          const total = st.beats.reduce((s, b) => s + words(b.say), 0) || 1;
          let acc = 0;
          st.beats.forEach((b, k) => { const at = acc / total * au.duration * 1000 / this.rate; acc += words(b.say); this.timers.push(setTimeout(() => fire(k), at)); });
          au.play().catch(() => { this.audioOk = false; this.runStep(); });
        };
        au.onended = endStep;
        this.updateVoiceLabel('voix enregistrée');
        return;
      }
      // 2) synthèse vocale du navigateur, phrase par phrase
      let b = 0;
      const next = () => {
        if (tok !== this.token) return;
        fire(b);
        this.speak(st.beats[b].say, tok, () => {
          const pause = st.beats[b].pause != null ? st.beats[b].pause : 320;
          b++;
          if (b < st.beats.length) this.timers.push(setTimeout(next, pause / this.rate));
          else endStep();
        });
      };
      next();
    }
    clearStepFx() {
      this.svg.classList.remove('xp-focus-mode');
      this.svg.querySelectorAll('.xp-focus').forEach(g => g.classList.remove('xp-focus'));
      this.svg.querySelectorAll('.xp-active').forEach(g => g.classList.remove('xp-active'));
      this.svg.querySelectorAll('.xp-flow').forEach(l => l.classList.remove('xp-flow'));
    }

    speak(text, tok, done) {
      const fallback = () => this.timers.push(setTimeout(() => tok === this.token && done(), (words(text) * 0.42 + 0.4) / this.rate * 1000));
      if (this.muted || !synth || this.ttsBroken || !synth.getVoices().length) { this.updateVoiceLabel(this.muted ? 'sous-titres' : ''); return fallback(); }
      const u = new SpeechSynthesisUtterance(spoken(text));
      u.lang = 'fr-FR';
      const v = LessonPlayer.pickVoice(Store.setting('voice')); if (v) u.voice = v;
      this.updateVoiceLabel(v ? v.name.replace(/^Microsoft |\s*-.*$/g, '') : '');
      u.rate = this.rate * 0.95;   // un peu plus posé que la vitesse « robot »
      u.pitch = 1;
      let finished = false;
      const end = () => { if (finished || tok !== this.token) return; finished = true; done(); };
      u.onend = end;
      u.onerror = e => {
        if (tok !== this.token) return;
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        this.ttsBroken = true; finished = true; fallback();
      };
      this.timers.push(setTimeout(end, (words(text) * 0.9 / this.rate + 4) * 1000)); // filet de sécurité
      synth.speak(u);
    }
    updateVoiceLabel(t) { const e = this.el.querySelector('.xp-voice'); if (e && e.textContent !== t) e.textContent = t; }

    play() {
      this.el.querySelector('.xp-big').classList.add('hidden');
      if (this.ended) { this.ended = false; this.reset(0); }
      else this.reset(this.i);
      this.playing = true; this.updateButtons();
      this.runStep();
    }
    pause() { this.playing = false; this.reset(this.i); this.updateButtons(); }
    toggle() { this.playing ? this.pause() : this.play(); }
    go(k) {
      if (k < 0 || k >= this.steps.length) return;
      this.el.querySelector('.xp-big').classList.add('hidden');
      this.ended = false;
      this.reset(k);
      if (this.playing) this.runStep();
      else { this.stepActions(k).forEach(a => this.apply(a, false)); this.showStepInfo(-1); }
    }
    cycleSpeed() { this.rate = SPEEDS[(SPEEDS.indexOf(this.rate) + 1) % SPEEDS.length] || 1; Store.setSetting('rate', this.rate); this.updateButtons(); if (this.playing) this.play(); }
    toggleMute() {
      if (!synth && !this.ex.audio) return U.toast('Synthèse vocale indisponible : lecture avec sous-titres.');
      this.muted = !this.muted; Store.setSetting('muted', this.muted); this.updateButtons(); if (this.playing) this.play();
    }
    fullscreen() { if (document.fullscreenElement) document.exitFullscreen(); else if (this.el.requestFullscreen) this.el.requestFullscreen(); }
    updateButtons() {
      this.el.querySelector('[data-a="play"]').textContent = this.playing ? '⏸' : '▶';
      this.el.querySelector('[data-a="speed"]').textContent = this.rate + '×';
      this.el.querySelector('[data-a="mute"]').textContent = this.muted ? '🔇' : '🔊';
    }

    finish() {
      this.playing = false; this.ended = true; this.updateButtons();
      this.clearStepFx();
      this.el.querySelectorAll('.xp-dot').forEach(d => d.classList.add('done'));
      Store.setExplainerSeen(this.ex.id);
      const end = U.h(`<div class="xp-end">
        <div class="xp-end-title">${this.ex.icon || ''} ${esc(this.ex.title)}<small>Fiche mémo</small></div>
        <ol class="xp-recap">${(this.ex.recap || []).map(r => `<li>${U.md(r)}</li>`).join('')}</ol>
        <div class="btn-row" style="justify-content:center"><button class="btn secondary xp-replay">↺ Revoir</button>${this.o.next ? `<a class="btn" href="#/animation/${this.o.next.id}">Animation suivante ▶</a>` : ''}</div>
      </div>`);
      end.querySelector('.xp-replay').addEventListener('click', e => { e.stopPropagation(); this.play(); });
      this.el.appendChild(end);
      this.o.onEnd && this.o.onEnd();
    }

    onKey(e) {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); this.toggle(); }
      else if (e.key === 'ArrowRight') this.go(this.i + 1);
      else if (e.key === 'ArrowLeft') this.go(this.i - 1);
      else if (e.key === 'f' || e.key === 'F') this.fullscreen();
      else if (e.key === 'm' || e.key === 'M') this.toggleMute();
    }
    destroy() {
      this.token++; this.playing = false;
      this.timers.forEach(clearTimeout);
      if (synth) synth.cancel();
      if (this.audio) { this.audio.pause(); this.audio = null; }
      document.removeEventListener('keydown', this.onKey);
    }
  }

  ExplainerPlayer.sceneSVG = sceneSVG;
  ExplainerPlayer.stepText = stepText;
  ExplainerPlayer.spoken = spoken;
  ExplainerPlayer.normStep = normStep;
  ExplainerPlayer.minutes = ex => Math.max(1, Math.round(ex.steps.reduce((s, st) => s + normStep(st).beats.reduce((a, b) => a + words(b.say) * 0.45 + 0.35, 0) + 1.5, 0) / 60));
  window.ExplainerPlayer = ExplainerPlayer;
})();
