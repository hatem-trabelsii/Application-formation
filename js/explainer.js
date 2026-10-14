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

  /* ---------- lecteur ---------- */
  class ExplainerPlayer {
    constructor(root, ex, opts = {}) {
      this.root = root; this.ex = ex; this.o = opts;
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
          <div class="xp-dots">${ex.steps.map((_, k) => `<button class="xp-dot" data-k="${k}" title="Étape ${k + 1}"></button>`).join('')}</div>
          <div class="xp-controls">
            <button data-a="prev" title="Étape précédente (←)">⏮</button>
            <button data-a="play" title="Lecture / pause (espace)">▶</button>
            <button data-a="next" title="Étape suivante (→)">⏭</button>
            <span class="xp-count"></span><span class="sp"></span>
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

    // remet la scène dans l'état « juste avant l'étape k »
    reset(k) {
      this.token++;
      this.timers.forEach(clearTimeout); this.timers = [];
      if (synth) synth.cancel();
      this.tokens.innerHTML = '';
      const end = this.el.querySelector('.xp-end'); if (end) end.remove();
      Object.entries(this.ex.nodes).forEach(([id, n]) => {
        const g = this.node(id);
        g.classList.toggle('xp-hidden', !!n.hidden);
        g.classList.remove('xp-active', 'xp-flash');
        const v = g.querySelector('.xp-value'); if (v) v.textContent = n.value || '';
        this.setBadge(id, null);
      });
      this.svg.querySelectorAll('.xp-link').forEach(l => l.classList.remove('xp-flow'));
      for (let s = 0; s < k; s++) (this.ex.steps[s].do || []).forEach(a => this.apply(a, false));
      this.i = Math.max(0, Math.min(k, this.ex.steps.length - 1));
      this.showStepInfo();
    }

    showStepInfo() {
      const st = this.ex.steps[this.i];
      this.cap.textContent = st.caption || st.say;
      this.el.querySelectorAll('.xp-dot').forEach((d, k) => { d.classList.toggle('on', k === this.i); d.classList.toggle('done', k < this.i); });
      this.el.querySelector('.xp-count').textContent = `Étape ${this.i + 1}/${this.ex.steps.length}`;
    }

    setBadge(id, text, kind) {
      const g = this.node(id); if (!g) return;
      const b = g.querySelector('.xp-badge');
      if (!text) { b.classList.add('hidden'); return; }
      const t = b.querySelector('text'); t.textContent = text;
      const w = Math.max(40, [...text].length * 7.4 + 20);
      const r = b.querySelector('rect'); r.setAttribute('width', w); r.setAttribute('x', -w / 2);
      b.setAttribute('class', 'xp-badge ' + (kind || 'info'));
    }

    // applique une action ; animate=false → seulement l'état final (pour sauter des étapes)
    apply(a, animate, tok) {
      if (a.value) {
        const [id, v] = a.value; const g = this.node(id); if (!g) return;
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

    runStep() {
      const tok = ++this.token;
      const st = this.ex.steps[this.i];
      this.showStepInfo();
      let animMs = 0;
      (st.do || []).forEach(a => { animMs = Math.max(animMs, this.apply(a, true, tok) || 0); });
      let animDone = false, speechDone = false;
      const maybeNext = () => {
        if (tok !== this.token || !animDone || !speechDone || !this.playing) return;
        this.timers.push(setTimeout(() => {
          if (tok !== this.token || !this.playing) return;
          if (this.i + 1 < this.ex.steps.length) { this.clearStepFx(); this.i++; this.runStep(); }
          else this.finish();
        }, 700 / this.rate));
      };
      this.timers.push(setTimeout(() => { animDone = true; maybeNext(); }, animMs));
      this.speak(st.say, tok, () => { speechDone = true; maybeNext(); });
    }
    clearStepFx() {
      this.svg.querySelectorAll('.xp-active').forEach(g => g.classList.remove('xp-active'));
      this.svg.querySelectorAll('.xp-flow').forEach(l => l.classList.remove('xp-flow'));
    }

    speak(text, tok, done) {
      const fallback = () => this.timers.push(setTimeout(() => tok === this.token && done(), (words(text) * 0.42 + 0.6) / this.rate * 1000));
      if (this.muted || !synth || this.ttsBroken || !synth.getVoices().length) return fallback();
      const u = new SpeechSynthesisUtterance(U.plain(text));
      u.lang = 'fr-FR';
      const v = LessonPlayer.pickVoice(Store.setting('voice')); if (v) u.voice = v;
      u.rate = this.rate;
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
      if (k < 0 || k >= this.ex.steps.length) return;
      this.el.querySelector('.xp-big').classList.add('hidden');
      this.ended = false;
      this.reset(k);
      if (this.playing) this.runStep();
      else { (this.ex.steps[k].do || []).forEach(a => this.apply(a, false)); this.showStepInfo(); }
    }
    cycleSpeed() { this.rate = SPEEDS[(SPEEDS.indexOf(this.rate) + 1) % SPEEDS.length] || 1; Store.setSetting('rate', this.rate); this.updateButtons(); if (this.playing) this.play(); }
    toggleMute() {
      if (!synth) return U.toast('Synthèse vocale indisponible : lecture avec sous-titres.');
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
      document.removeEventListener('keydown', this.onKey);
    }
  }

  ExplainerPlayer.sceneSVG = sceneSVG;
  ExplainerPlayer.minutes = ex => Math.max(1, Math.round(ex.steps.reduce((s, st) => s + words(st.say) * 0.42 + 2, 0) / 60));
  window.ExplainerPlayer = ExplainerPlayer;
})();
