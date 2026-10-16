/* ReelPlayer — animations verticales « plan technique » (style reel : trait fin néon sur fond bleu nuit,
   étiquettes mono, rail de consommateurs, journal à emplacements numérotés, marque-pages, compteurs,
   caméra qui zoome, sous-titres karaoké). Utilisé par le concept « Kafka vs RabbitMQ ».
   Une scène = un état (ce qui est affiché) + des actions déclaratives regroupées en temps forts. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const VW = 540, VH = 960;
  const COL = { rabbit: '#a78bfa', kafka: '#60a5fa', green: '#34d399', orange: '#fb923c', blue: '#60a5fa', pink: '#f472b6', amber: '#fbbf24', line: '#8b9bc0', dim: '#3a4767' };
  const col = c => COL[c] || c || COL.line;
  const synth = window.speechSynthesis || null;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const CAMS = {
    all: { x: 0, y: 0, w: VW },
    log: { x: 30, y: 380, w: 480 },
    top: { x: 20, y: 150, w: 500 },
    mid: { x: 10, y: 168, w: 520 }
  };
  // géométrie
  const slotX = i => 84 + (i - 1) * 46;     // emplacements #1..#9
  const SLOT_Y = 604;
  const consX = side => (side === 'left' ? 140 : 400);
  const RAIL_Y = 262;

  function initialState(D) {
    return {
      header: true, kicker: D.kicker || '', card: null, broker: 'rabbit',
      slots: Array.from({ length: 10 }, () => 'empty'),   // index 1..9 : empty | normal | done | taken | stuck | deleted | glow
      cons: {}, bookmarks: {}, counters: null, lease: null, cam: 'all', hold: {}
    };
  }

  // Applique une action à l'état (version instantanée, sans animation)
  function applyState(S, a) {
    if (a.header !== undefined) S.header = a.header;
    if (a.card !== undefined) S.card = a.card;
    if (a.cam !== undefined) S.cam = a.cam;
    if (a.broker) S.broker = a.broker;
    if (a.fill) a.fill.forEach(i => { if (S.slots[i] === 'empty') S.slots[i] = 'normal'; });
    if (a.slot) S.slots[a.slot[0]] = a.slot[1];
    if (a.slots) a.slots[0].forEach(i => { S.slots[i] = a.slots[1]; });
    if (a.cons) { if (a.cons[1]) S.cons[a.cons[0]] = Object.assign({}, S.cons[a.cons[0]] || {}, a.cons[1]); else delete S.cons[a.cons[0]]; }
    if (a.down) S.cons[a.down] && (S.cons[a.down].down = true);
    if (a.up) S.cons[a.up] && (S.cons[a.up].down = false);
    if (a.bookmark) { const [id, at, c] = a.bookmark; if (at == null) delete S.bookmarks[id]; else S.bookmarks[id] = { at, c: c || (S.bookmarks[id] && S.bookmarks[id].c) || 'green' }; }
    if (a.counters !== undefined) S.counters = a.counters;
    if (a.count) S.counters = Object.assign({}, S.counters || {}, { [a.count[0]]: a.count[1] });
    if (a.replay) { const r = a.replay; S.counters = Object.assign({}, S.counters || {}, { [r.counter]: r.to - r.from + 1 }); if (r.bookmark) S.bookmarks[r.bookmark].at = r.to + 1; }
    if (a.lease !== undefined) S.lease = a.lease ? Object.assign({ p: 0 }, a.lease) : null;
    if (a.leaseRun && S.lease) S.lease.p = 1;
    if (a.hold) S.hold[a.hold[0]] = a.hold[1];
    if (a.release) delete S.hold[a.release];
  }

  /* ---------- rendu statique (re-généré à chaque changement d'état) ---------- */
  function capsule(x, y, cls, color) {
    return `<path class="rl-cap ${cls || ''}" style="--c:${color || COL.line}" d="M${x - 12} ${y + 40} V${y + 12} a12 12 0 0 1 24 0 V${y + 40} Z"/>`;
  }
  function staticSVG(S, D) {
    const brokerC = S.broker === 'kafka' ? COL.kafka : COL.rabbit;
    let s = '';
    if (S.header) {
      s += `<g class="rl-headg">
        <text x="270" y="64" class="rl-handle">${esc(D.handle || '')}</text>
        <text x="270" y="96" class="rl-kicker">${esc(S.kicker)}</text>
        <text x="270" y="136" class="rl-title">Kafka <tspan class="rl-vs">vs</tspan> RabbitMQ</text>
        <text x="270" y="160" class="rl-subt">${esc(D.sub || '')}</text>
      </g>`;
    }
    // HUD du verrou Kafka
    if (S.lease) {
      const sec = Math.round(S.lease.p * 30);
      const lc = S.lease.p > 0.85 ? COL.pink : S.lease.p > 0.5 ? COL.amber : COL.green;
      s += `<g class="rl-hud"><text x="60" y="196" class="rl-mono">KAFKA · VERROU SUR #${S.lease.slot} · ${esc(S.lease.who || '')}</text>
        <text x="480" y="196" class="rl-mono" text-anchor="end">${sec} s / 30 s</text>
        <line x1="60" y1="210" x2="480" y2="210" class="rl-track"/>
        <line x1="60" y1="210" x2="${60 + 420 * S.lease.p}" y2="210" class="rl-prog" style="stroke:${lc}"/>
        <text x="60" y="226" class="rl-tiny">0 s</text><text x="480" y="226" class="rl-tiny" text-anchor="end">30 s</text></g>`;
    }
    // rail des consommateurs
    s += `<line x1="40" y1="${RAIL_Y}" x2="500" y2="${RAIL_Y}" class="rl-rail"/><rect x="34" y="${RAIL_Y - 6}" width="8" height="12" class="rl-railcap"/><rect x="498" y="${RAIL_Y - 6}" width="8" height="12" class="rl-railcap"/>`;
    ['left', 'right'].forEach(side => {
      const c = S.cons[side]; if (!c) return;
      const x = consX(side), cc = c.down ? COL.pink : col(c.color);
      const flip = side === 'left' ? -1 : 1;
      s += `<g class="rl-cons ${c.down ? 'down' : ''}" transform="translate(${x},${RAIL_Y})" style="--c:${cc}">
        <text y="-16" class="rl-clabel">${esc(c.label)}</text>
        <rect x="-8" y="-5" width="16" height="10" class="rl-mount"/>
        <path d="M-44 6 H44 L34 36 H-34 Z" class="rl-cbox"/>
        <circle cx="0" cy="21" r="6" class="rl-eye"/><circle cx="-22" cy="21" r="2.5" class="rl-dot"/><circle cx="22" cy="21" r="2.5" class="rl-dot"/>
        <path d="M0 36 C0 56 ${flip * 4} 66 ${flip * 16} 78" class="rl-arm"/>
        <path d="M${flip * 16} 78 l${flip * 10} 6 M${flip * 16} 78 l${flip * 2} 12" class="rl-arm"/>
        ${c.down ? '<path d="M-14 12 L14 30 M14 12 L-14 30" class="rl-x"/><text y="118" class="rl-downtxt">EN PANNE</text>' : ''}
        ${S.hold[side] ? `<g transform="translate(${flip * 22},84)">${capsule(0, 0, 'held', cc)}<text y="56" class="rl-tiny" text-anchor="middle">#${S.hold[side]}</text></g>` : ''}
      </g>`;
    });
    // broker (tête de lecture + convoyeur)
    s += `<g class="rl-broker" transform="translate(270,468)" style="--c:${brokerC}">
      <text x="-112" y="-4" class="rl-blabel">${S.broker === 'kafka' ? 'KAFKA' : 'RABBITMQ'}</text>
      <text x="-112" y="12" class="rl-bsub">${S.broker === 'kafka' ? 'SHARE GROUP' : 'STREAM'}</text>
      <rect x="-64" y="20" width="128" height="18" rx="9" class="rl-belt"/>
      ${[-48, -32, -16, 0, 16, 32, 48].map(x => `<circle cx="${x}" cy="29" r="2" class="rl-beltdot"/>`).join('')}
      <circle r="16" class="rl-headc"/><circle r="6" class="rl-headin"/>
      <line x1="9" y1="-9" x2="30" y2="-30" class="rl-lever"/><circle cx="30" cy="-30" r="3.5" class="rl-leverend"/>
    </g>`;
    // journal (emplacements)
    s += `<rect x="56" y="${SLOT_Y - 8}" width="436" height="56" rx="6" class="rl-log"/>`;
    for (let i = 1; i <= 9; i++) {
      const st = S.slots[i];
      if (st !== 'empty') s += capsule(slotX(i), SLOT_Y, 'st-' + st, st === 'stuck' ? COL.pink : st === 'taken' ? COL.kafka : st === 'glow' ? COL.green : COL.line);
      else s += `<path class="rl-cap st-empty" d="M${slotX(i) - 12} ${SLOT_Y + 40} V${SLOT_Y + 12} a12 12 0 0 1 24 0 V${SLOT_Y + 40} Z"/>`;
      s += `<text x="${slotX(i)}" y="${SLOT_Y + 64}" class="rl-num">#${i}</text>`;
      if (st === 'deleted') s += `<text x="${slotX(i)}" y="${SLOT_Y - 16}" class="rl-tiny pink" text-anchor="middle">supprimée</text>`;
    }
    // tuyau vers le service de commandes
    s += `<path d="M492 ${SLOT_Y + 20} H508 V742 H470" class="rl-pipe"/>
      <g transform="translate(430,742)" class="rl-svc"><rect x="-36" y="-16" width="72" height="32" rx="8" class="rl-cbox"/><rect x="-10" y="-7" width="20" height="14" rx="2" class="rl-env"/><path d="M-10 -7 L0 1 L10 -7" class="rl-env"/>
      <text y="34" class="rl-tiny" text-anchor="middle">SERVICE COMMANDES</text></g>`;
    // compteurs
    if (S.counters) {
      const items = Object.entries(S.counters);
      items.forEach(([k, v], j) => {
        const x = 140 + j * 170;
        const lab = k === 'replayed' ? 'RABBITMQ · REJOUÉES' : k === 'lost' ? 'KAFKA · PERDUES' : k.toUpperCase();
        s += `<g class="rl-counter"><line x1="${x - 60}" y1="770" x2="${x + 60}" y2="770" class="rl-track"/><text x="${x}" y="788" class="rl-tiny" text-anchor="middle">${lab}</text><text x="${x}" y="830" class="rl-big ${k}">${v}</text></g>`;
      });
    }
    return s;
  }

  class ReelPlayer {
    constructor(root, D, opts = {}) {
      this.root = root; this.D = D; this.o = opts;
      this.token = 0; this.timers = [];
      this.voice = !!opts.voice;
      this.rate = (window.Store && Store.setting('rate')) || 1;
      root.innerHTML = `<div class="rl"><svg class="rl-svg" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(D.title)}">
          <defs><radialGradient id="rlBg" cx="50%" cy="45%" r="75%"><stop offset="0%" stop-color="#16213a"/><stop offset="100%" stop-color="#0b1120"/></radialGradient></defs>
          <rect x="-600" y="-600" width="${VW + 1200}" height="${VH + 1200}" fill="url(#rlBg)"/>
          <g class="rl-static"></g><g class="rl-marks"></g><g class="rl-fly"></g><g class="rl-cardg"></g>
        </svg><div class="rl-subs" aria-live="polite"></div></div>`;
      this.svg = root.querySelector('svg');
      this.gStatic = root.querySelector('.rl-static');
      this.gMarks = root.querySelector('.rl-marks');
      this.gFly = root.querySelector('.rl-fly');
      this.gCard = root.querySelector('.rl-cardg');
      this.subs = root.querySelector('.rl-subs');
      this.vb = Object.assign({}, CAMS.all);
      this.vbT = Object.assign({}, CAMS.all);
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
      this.S = initialState(D);
      this.render();
    }

    /* ---------- rendu ---------- */
    render() {
      this.gStatic.innerHTML = staticSVG(this.S, this.D);
      // marque-pages : éléments persistants (ils glissent d'un emplacement à l'autre)
      const want = this.S.bookmarks;
      [...this.gMarks.children].forEach(g => { if (!want[g.dataset.id]) g.remove(); });
      Object.entries(want).forEach(([id, b], j) => {
        let g = this.gMarks.querySelector(`[data-id="${id}"]`);
        if (!g) {
          g = document.createElementNS(NS, 'g');
          g.setAttribute('class', 'rl-mark'); g.dataset.id = id;
          g.innerHTML = `<path d="M0 -7 L7 5 H-7 Z"/><text y="20">${esc(id.toUpperCase())}</text>`;
          g.style.transform = `translate(${slotX(b.at)}px, ${SLOT_Y + 82 + j * 26}px)`;
          this.gMarks.appendChild(g);
          void g.getBoundingClientRect();
        }
        g.style.setProperty('--c', col(b.c));
        g.style.transform = `translate(${Math.min(slotX(9) + 30, slotX(b.at))}px, ${SLOT_Y + 82 + j * 26}px)`;
      });
      // carte-titre (question / conclusion)
      this.gCard.innerHTML = this.S.card ? `<g class="rl-card"><rect x="-20" y="380" width="${VW + 40}" height="120"/><text x="270" y="448" class="rl-cardtxt">${esc(this.S.card)}</text><line x1="150" y1="468" x2="390" y2="468" class="rl-cardline"/></g>` : '';
      const cam = typeof this.S.cam === 'string' ? CAMS[this.S.cam] : this.S.cam;
      this.vbT = Object.assign({}, cam || CAMS.all);
    }
    loop(now) {
      if (this.dead) return;
      const v = this.vb, t = this.vbT, k = 0.06;
      if (Math.abs(v.x - t.x) + Math.abs(v.y - t.y) + Math.abs(v.w - t.w) > 0.3) {
        v.x += (t.x - v.x) * k; v.y += (t.y - v.y) * k; v.w += (t.w - v.w) * k;
        const h = v.w * VH / VW;
        this.svg.setAttribute('viewBox', `${v.x.toFixed(1)} ${v.y.toFixed(1)} ${v.w.toFixed(1)} ${h.toFixed(1)}`);
      }
      this.raf = requestAnimationFrame(this.loop);
    }

    /* ---------- animations ---------- */
    flight(points, color, dur, tok) {
      return new Promise(res => {
        const g = document.createElementNS(NS, 'g');
        g.innerHTML = capsule(0, -20, 'fly', color);
        this.gFly.appendChild(g);
        const segs = []; let L = 0;
        for (let i = 1; i < points.length; i++) { const d = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]); segs.push(d); L += d; }
        const t0 = performance.now();
        const step = now => {
          if (tok !== this.token || this.dead) { g.remove(); return res(); }
          let p = Math.min(1, (now - t0) / dur), d = ease(p) * L, i = 0;
          while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
          const f = segs[i] ? d / segs[i] : 1, A = points[i], B = points[i + 1];
          g.setAttribute('transform', `translate(${A[0] + (B[0] - A[0]) * f},${A[1] + (B[1] - A[1]) * f}) scale(.8)`);
          if (p < 1) requestAnimationFrame(step); else { g.remove(); res(); }
        };
        requestAnimationFrame(step);
      });
    }
    pathTo(slot, side) {
      const cx = consX(side) + (side === 'left' ? -22 : 22);
      return [[slotX(slot), SLOT_Y + 10], [slotX(slot), 540], [270, 490], [cx, 420], [cx, RAIL_Y + 96]];
    }
    popText(x, y, txt, color, tok) {
      const t = document.createElementNS(NS, 'g');
      t.setAttribute('class', 'rl-pop');
      t.style.setProperty('--c', color);
      t.innerHTML = `<rect x="-26" y="-13" width="52" height="24" rx="12"/><text y="4">${esc(txt)}</text>`;
      t.setAttribute('transform', `translate(${x},${y})`);
      this.gFly.appendChild(t);
      this.timers.push(setTimeout(() => t.remove(), 1600));
      void tok;
    }

    // exécute une action avec son animation ; renvoie une promesse (attendue seulement si a.wait)
    async animate(a, tok) {
      const S = this.S;
      if (a.travel) {
        const r = a.travel, c = col(r.color || (S.cons[r.to] && S.cons[r.to].color));
        await this.flight(this.pathTo(r.slot, r.to), c, (r.dur || 1300) / this.rate, tok);
        if (tok !== this.token) return;
      }
      if (a.fill) {
        for (const i of a.fill) {
          if (tok !== this.token) return;
          await this.flight([[430, 726], [508, 726], [508, SLOT_Y + 20], [slotX(i), SLOT_Y + 20]], COL.line, 520 / this.rate, tok);
          if (tok !== this.token) return;
          applyState(S, { fill: [i] }); this.render();
        }
        return;
      }
      if (a.replay) {
        const r = a.replay;
        for (let i = r.from; i <= r.to; i++) {
          if (tok !== this.token) return;
          this.flight(this.pathTo(i, r.cons), col(S.cons[r.cons] && S.cons[r.cons].color), 900 / this.rate, tok);
          await sleep(330 / this.rate);
          if (tok !== this.token) return;
          S.counters = Object.assign({}, S.counters || {}, { [r.counter]: i - r.from + 1 });
          if (r.bookmark && S.bookmarks[r.bookmark]) S.bookmarks[r.bookmark].at = i + 1;
          this.render();
        }
        return;
      }
      if (a.ack) {
        const x = consX(a.ack) + (a.ack === 'left' ? 60 : -60);
        this.popText(x, RAIL_Y + 60, 'ACK', col(S.cons[a.ack] && S.cons[a.ack].color), tok);
      }
      if (a.leaseRun && S.lease) {
        const p0 = S.lease.p, t0 = performance.now(), dur = a.leaseRun / this.rate;
        await new Promise(res => {
          const step = now => {
            if (tok !== this.token || this.dead) return res();
            const p = Math.min(1, (now - t0) / dur);
            S.lease.p = p0 + (1 - p0) * p; this.render();
            if (p < 1) requestAnimationFrame(step); else res();
          };
          requestAnimationFrame(step);
        });
        return;
      }
      applyState(S, a);
      this.render();
    }

    /* ---------- sous-titres karaoké ---------- */
    setSub(text) {
      const words = [];
      String(text).split(/(\*\*[^*]+\*\*)/).forEach(part => {
        const kw = /^\*\*/.test(part);
        part.replace(/\*\*/g, '').split(/\s+/).filter(Boolean).forEach(w => {
          // ponctuation collée au mot précédent (« e-mail. » et non « e-mail . »)
          if (/^[.,…)]+$/.test(w) && words.length) words[words.length - 1].p = (words[words.length - 1].p || '') + w;
          else words.push({ w, kw });
        });
      });
      this.words = words;
      this.subs.innerHTML = words.map((x, i) => `<span data-i="${i}" class="${x.kw ? 'kw' : ''}">${esc(x.w)}</span>${x.p ? esc(x.p) : ''}`).join(' ');
    }
    hiWord(i) { this.subs.querySelectorAll('span').forEach((s, j) => { s.classList.toggle('on', j === i); s.classList.toggle('past', j < i); }); }

    speak(text, tok) {
      const plain = String(text).replace(/\*\*/g, '');
      const n = (this.words || []).length || plain.split(/\s+/).filter(Boolean).length;
      const timed = () => new Promise(res => {
        const per = 330 / this.rate;
        for (let i = 0; i < n; i++) this.timers.push(setTimeout(() => tok === this.token && this.hiWord(i), i * per));
        this.timers.push(setTimeout(res, n * per + 250 / this.rate));
      });
      if (!this.voice || !synth || !synth.getVoices().length) return timed();
      return new Promise(res => {
        const say = window.ExplainerPlayer ? ExplainerPlayer.spoken(plain) : plain;
        const u = new SpeechSynthesisUtterance(say);
        u.lang = 'fr-FR'; u.rate = this.rate * 0.95;
        const v = window.LessonPlayer && LessonPlayer.pickVoice(Store.setting('voice')); if (v) u.voice = v;
        let done = false, wi = 0;
        const fin = () => { if (done) return; done = true; this.hiWord(n); res(); };
        u.onboundary = e => { if (tok !== this.token || e.name === 'sentence') return; const before = say.slice(0, e.charIndex).split(/\s+/).filter(Boolean).length; wi = Math.min(n - 1, before); this.hiWord(wi); };
        u.onend = fin;
        u.onerror = e => { if (e.error === 'interrupted' || e.error === 'canceled') return fin(); this.voice = false; done = true; timed().then(res); };
        this.timers.push(setTimeout(fin, (n * 0.9 / this.rate + 4) * 1000));
        synth.speak(u);
      });
    }

    /* ---------- lecture ---------- */
    stopAll() {
      this.token++;
      this.timers.forEach(clearTimeout); this.timers = [];
      if (synth) synth.cancel();
      this.gFly.textContent = '';
    }
    // état « juste avant la section k »
    stateBefore(k) {
      const S = initialState(this.D);
      for (let s = 0; s < k; s++) this.D.sections[s].beats.forEach(b => (b.do || []).forEach(a => applyState(S, a)));
      return S;
    }
    async playSection(k, voice) {
      this.stopAll();
      const tok = this.token;
      if (voice !== undefined) this.voice = voice;
      this.S = this.stateBefore(k);
      this.gMarks.textContent = '';
      this.render();
      const sec = this.D.sections[k];
      for (const b of sec.beats) {
        if (tok !== this.token) return false;
        this.setSub(b.say);
        const anims = (b.do || []).map(a => this.animate(a, tok));
        const sp = this.speak(b.say, tok);
        await Promise.all([sp, ...anims]);
        if (tok !== this.token) return false;
        await sleep((b.pause != null ? b.pause : 300) / this.rate);
      }
      if (this.o.onSectionEnd) this.o.onSectionEnd(k);
      return tok === this.token;
    }
    async playAll(from, voice) {
      this.playing = true;
      for (let k = from || 0; k < this.D.sections.length; k++) {
        if (this.o.onSection) this.o.onSection(k);
        const ok = await this.playSection(k, voice);
        if (!ok) return;
      }
      this.playing = false;
      if (this.o.onEnd) this.o.onEnd();
    }
    destroy() { this.stopAll(); this.dead = true; cancelAnimationFrame(this.raf); }
  }

  // Vignette statique : l'état après la section k
  ReelPlayer.thumbSVG = function (D, k) {
    const S = initialState(D);
    for (let s = 0; s < Math.min(k, D.sections.length); s++) D.sections[s].beats.forEach(b => (b.do || []).forEach(a => applyState(S, a)));
    S.card = null;
    const marks = Object.entries(S.bookmarks).map(([id, b], j) => `<g class="rl-mark" style="--c:${col(b.c)};transform:translate(${slotX(b.at)}px,${SLOT_Y + 82 + j * 26}px)"><path d="M0 -7 L7 5 H-7 Z"/><text y="20">${esc(id.toUpperCase())}</text></g>`).join('');
    return `<svg class="rl-svg" viewBox="0 150 ${VW} ${VW * 9 / 16 * 1.25}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect x="-600" y="-600" width="1800" height="2200" fill="#0f172a"/>${staticSVG(S, D)}${marks}</svg>`;
  };
  ReelPlayer.CAMS = CAMS;
  window.ReelPlayer = ReelPlayer;
})();
