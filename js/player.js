/* Lecteur « vidéo » : diaporama animé + narration par synthèse vocale (Web Speech API), 100 % hors-ligne.
   Chaque leçon devient une suite de diapositives ; chaque phrase narrée est un « segment » de la timeline. */
(function () {
  const synth = window.speechSynthesis || null;
  const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

  function splitSentences(text) {
    const t = U.plain(text);
    if (!t) return [];
    // découpe sur . ! ? : suivis d'un espace ; garde les phrases trop courtes attachées
    const parts = t.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) || [t];
    const out = [];
    for (let p of parts) {
      p = p.trim();
      if (!p) continue;
      if (out.length && (p.length < 12 || out[out.length - 1].length < 12)) out[out.length - 1] += ' ' + p;
      else out.push(p);
    }
    return out;
  }
  const words = s => s.split(/\s+/).filter(Boolean).length;
  const dot = s => /[.!?:…]$/.test(s.trim()) ? s.trim() : s.trim() + '.';

  function pickVoice(pref) {
    if (!synth) return null;
    const voices = synth.getVoices();
    if (pref) { const v = voices.find(v => v.name === pref); if (v) return v; }
    const fr = voices.filter(v => /^fr/i.test(v.lang));
    return fr.find(v => /natural|online|google/i.test(v.name)) || fr[0] || null;
  }

  class LessonPlayer {
    constructor(root, opts) {
      this.root = root;
      this.o = opts; // { course, lesson, module, phaseColor, onEnd, onNext }
      this.rate = Store.setting('rate') || 1;
      this.muted = !synth || Store.setting('muted');
      this.playing = false;
      this.token = 0;
      this.idx = 0;
      this.timer = null;
      this.build();
      this.render();
      this.onKey = this.onKey.bind(this);
      document.addEventListener('keydown', this.onKey);
      if (synth && synth.getVoices().length === 0) synth.onvoiceschanged = () => {};
    }

    build() {
      const { lesson, course, module } = this.o;
      this.slides = [];
      this.segments = [];
      const add = (slide, narr) => {
        const si = this.slides.push(slide) - 1;
        narr.forEach(n => splitSentences(n.text).forEach(s => this.segments.push({ slide: si, text: s, bullet: n.bullet })));
      };
      add({ type: 'title', kicker: module, title: lesson.title, icon: course.icon },
        [{ text: dot(lesson.title) }, { text: lesson.intro || `Dans cette leçon du cours ${course.title}, nous allons voir l'essentiel à retenir, avec des exemples concrets.` }]);
      lesson.sections.forEach(sec => {
        const narr = [{ text: dot(sec.h) }];
        if (sec.p) narr.push({ text: sec.p });
        (sec.bullets || []).forEach((b, i) => narr.push({ text: dot(b.replace(/[;:]$/, '')), bullet: i }));
        if (sec.code) narr.push({ text: sec.say || "Observez l'exemple affiché à l'écran : vous le retrouverez dans l'onglet Théorie pour le copier." });
        add({ type: 'section', sec }, narr);
      });
      const kp = lesson.keypoints || [];
      if (kp.length) {
        const narr = [{ text: 'Récapitulons les points clés à retenir.' }];
        kp.forEach((k, i) => narr.push({ text: dot(k.replace(/[;:]$/, '')), bullet: i }));
        add({ type: 'recap', points: kp }, narr);
      }
      let acc = 0;
      this.segments.forEach(s => { s.start = acc; s.dur = Math.max(1.6, words(s.text) * 0.42 + 0.4); acc += s.dur; });
      this.total = acc;
    }

    render() {
      const r = this.root;
      r.innerHTML = '';
      r.style.setProperty('--phase', this.o.phaseColor);
      this.el = U.h(`
        <div class="vp" tabindex="0">
          <div class="vp-deco"></div>
          <div class="vp-stage"></div>
          <div class="vp-caption"></div>
          <div class="vp-big-play" title="Lecture"><span>▶</span></div>
          <div class="vp-controls">
            <div class="vp-bar"><div class="fill"></div></div>
            <div class="vp-row">
              <button data-a="prev" title="Diapositive précédente (←)">⏮</button>
              <button data-a="play" title="Lecture / pause (espace)">▶</button>
              <button data-a="next" title="Diapositive suivante (→)">⏭</button>
              <span class="vp-time">0:00 / 0:00</span>
              <span class="sp"></span>
              <span class="vp-slidecount"></span>
              <button data-a="speed" class="vp-speed" title="Vitesse">1×</button>
              <button data-a="cc" title="Sous-titres">CC</button>
              <button data-a="mute" title="Voix on/off">🔊</button>
              <button data-a="fs" title="Plein écran (F)">⛶</button>
            </div>
          </div>
        </div>`);
      r.appendChild(this.el);
      this.stage = this.el.querySelector('.vp-stage');
      this.caption = this.el.querySelector('.vp-caption');
      this.fill = this.el.querySelector('.fill');
      this.bar = this.el.querySelector('.vp-bar');
      // repères de diapositives
      this.slides.forEach((_, i) => {
        if (i === 0) return;
        const seg = this.segments.find(s => s.slide === i);
        if (seg) { const m = document.createElement('span'); m.className = 'mark'; m.style.left = (100 * seg.start / this.total) + '%'; this.bar.appendChild(m); }
      });
      this.el.querySelector('.vp-controls').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        ({ prev: () => this.slideJump(-1), next: () => this.slideJump(1), play: () => this.toggle(), speed: () => this.cycleSpeed(),
           cc: () => this.toggleCC(), mute: () => this.toggleMute(), fs: () => this.fullscreen() })[b.dataset.a]();
      });
      this.el.querySelector('.vp-big-play').addEventListener('click', () => this.play());
      this.stage.addEventListener('click', () => this.toggle());
      this.bar.addEventListener('click', e => {
        const rect = this.bar.getBoundingClientRect();
        const t = (e.clientX - rect.left) / rect.width * this.total;
        let i = this.segments.findIndex(s => s.start + s.dur > t);
        if (i < 0) i = this.segments.length - 1;
        this.seek(i, this.playing);
      });
      if (!Store.setting('captions')) this.el.classList.add('no-cc');
      this.updateButtons();
      this.showSegment(0);
    }

    drawSlide(si) {
      if (this.curSlide === si) return;
      this.curSlide = si;
      const s = this.slides[si];
      let html;
      if (s.type === 'title') {
        html = `<div class="vp-slide title-slide"><div class="big-icon">${s.icon}</div><div class="kicker">${U.esc(s.kicker)}</div><h2>${U.esc(s.title)}</h2><div class="vp-text">${U.esc(this.o.course.title)}</div></div>`;
      } else if (s.type === 'recap') {
        html = `<div class="vp-slide"><div class="kicker">Récapitulatif</div><h2>À retenir</h2><ul class="vp-bullets">${s.points.map(p => `<li>${U.md(p)}</li>`).join('')}</ul></div>`;
      } else {
        const sec = s.sec;
        const bullets = sec.bullets && sec.bullets.length ? `<ul class="vp-bullets">${sec.bullets.map(b => `<li>${U.md(b)}</li>`).join('')}</ul>` : '';
        const text = !bullets ? `<div class="vp-text">${U.md(sec.p || '')}</div>` : '';
        const code = sec.code ? `<pre class="vp-code">${U.highlight(sec.code.src.split('\n').slice(0, 18).join('\n'), sec.code.lang)}</pre>` : '';
        const kicker = `${U.esc(this.o.lesson.title)} · ${si}/${this.slides.length - 1}`;
        html = `<div class="vp-slide"><div class="kicker">${kicker}</div><h2>${U.md(sec.h)}</h2><div class="cols">${bullets || text ? `<div>${bullets}${text}</div>` : ''}${code ? `<div>${code}</div>` : ''}</div></div>`;
      }
      this.stage.innerHTML = html;
      this.el.querySelector('.vp-slidecount').textContent = `Diapo ${si + 1}/${this.slides.length}`;
    }

    showSegment(i) {
      const seg = this.segments[i];
      if (!seg) return;
      this.idx = i;
      this.drawSlide(seg.slide);
      // révèle les puces jusqu'à la puce courante
      const lis = this.stage.querySelectorAll('.vp-bullets li');
      let upto = -1;
      for (let k = 0; k <= i; k++) {
        const s = this.segments[k];
        if (s.slide === seg.slide && s.bullet != null) upto = Math.max(upto, s.bullet);
      }
      lis.forEach((li, k) => li.classList.toggle('on', k <= upto));
      this.caption.textContent = seg.text;
      this.fill.style.width = (100 * seg.start / this.total) + '%';
      this.el.querySelector('.vp-time').textContent = `${this.fmt(seg.start / this.rate)} / ${this.fmt(this.total / this.rate)}`;
    }
    fmt(s) { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

    speak(i) {
      const tok = ++this.token;
      clearTimeout(this.timer);
      if (synth) synth.cancel();
      const seg = this.segments[i];
      if (!seg) return this.finish();
      this.showSegment(i);
      const done = () => {
        if (tok !== this.token || !this.playing) return;
        clearTimeout(this.timer);
        if (i + 1 < this.segments.length) this.speak(i + 1); else this.finish();
      };
      const timed = () => { clearTimeout(this.timer); this.timer = setTimeout(done, seg.dur / this.rate * 1000); };
      if (!this.muted && synth && !this.ttsBroken && synth.getVoices().length) {
        const u = new SpeechSynthesisUtterance(seg.text);
        u.lang = 'fr-FR';
        const v = pickVoice(Store.setting('voice'));
        if (v) u.voice = v;
        u.rate = this.rate;
        u.onend = done;
        u.onerror = e => {
          if (tok !== this.token) return;
          if (e.error === 'interrupted' || e.error === 'canceled') return done();
          // la synthèse ne fonctionne pas ici : on continue en mode sous-titres minutés
          this.ttsBroken = true;
          timed();
        };
        // filet de sécurité si onend ne se déclenche jamais (bug de certains navigateurs)
        this.timer = setTimeout(done, (seg.dur * 2.2 / this.rate + 3) * 1000);
        synth.speak(u);
      } else {
        timed();
      }
    }

    play() {
      this.el.querySelector('.vp-big-play').classList.add('hidden');
      const end = this.el.querySelector('.vp-end'); if (end) end.remove();
      if (this.ended) { this.ended = false; this.idx = 0; }
      this.playing = true;
      this.updateButtons();
      this.speak(this.idx);
    }
    pause() {
      this.playing = false;
      this.token++;
      clearTimeout(this.timer);
      if (synth) synth.cancel();
      this.updateButtons();
    }
    toggle() { this.playing ? this.pause() : this.play(); }
    seek(i, keepPlaying) {
      i = Math.max(0, Math.min(this.segments.length - 1, i));
      this.ended = false;
      if (keepPlaying) { this.playing = true; this.speak(i); }
      else { this.pause(); this.showSegment(i); }
    }
    slideJump(d) {
      const cur = this.segments[this.idx].slide;
      let target = cur + d;
      // « précédent » en milieu de diapo = retour au début de la diapo
      if (d < 0 && this.segments.findIndex(s => s.slide === cur) < this.idx) target = cur;
      target = Math.max(0, Math.min(this.slides.length - 1, target));
      const i = this.segments.findIndex(s => s.slide === target);
      this.el.querySelector('.vp-big-play').classList.add('hidden');
      this.seek(i, this.playing);
    }
    cycleSpeed() {
      const i = SPEEDS.indexOf(this.rate);
      this.rate = SPEEDS[(i + 1) % SPEEDS.length];
      Store.setSetting('rate', this.rate);
      this.updateButtons();
      if (this.playing) this.speak(this.idx); else this.showSegment(this.idx);
    }
    toggleCC() {
      const on = this.el.classList.toggle('no-cc');
      Store.setSetting('captions', !on);
    }
    toggleMute() {
      if (!synth) { U.toast('Synthèse vocale non disponible dans ce navigateur : lecture silencieuse avec sous-titres.'); return; }
      this.muted = !this.muted;
      Store.setSetting('muted', this.muted);
      this.updateButtons();
      if (this.playing) this.speak(this.idx);
    }
    fullscreen() {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (this.el.requestFullscreen) this.el.requestFullscreen();
    }
    updateButtons() {
      if (!this.el) return;
      this.el.querySelector('[data-a="play"]').textContent = this.playing ? '⏸' : '▶';
      this.el.querySelector('[data-a="speed"]').textContent = this.rate + '×';
      this.el.querySelector('[data-a="mute"]').textContent = this.muted ? '🔇' : '🔊';
    }
    finish() {
      this.playing = false;
      this.ended = true;
      this.updateButtons();
      this.fill.style.width = '100%';
      const next = this.o.nextLesson;
      const end = U.h(`<div class="vp-end"><div style="font-size:46px">🎉</div><h3>Leçon terminée !</h3>
        <div class="btn-row">
          <button class="btn secondary" data-e="replay" style="background:transparent;color:#fff;border-color:#fff">↺ Revoir</button>
          ${next ? `<button class="btn" data-e="next">Leçon suivante ▶</button>` : `<button class="btn" data-e="quiz">Passer le quiz du cours ▶</button>`}
        </div><div class="small" style="opacity:.7">${next ? U.esc(next.title) : 'Vous avez terminé toutes les leçons de ce cours.'}</div></div>`);
      end.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.e === 'replay') { end.remove(); this.idx = 0; this.ended = false; this.play(); }
        else if (b.dataset.e === 'next') this.o.onNext && this.o.onNext();
        else location.hash = '#/quiz/' + this.o.course.id;
      });
      this.el.appendChild(end);
      this.o.onEnd && this.o.onEnd();
    }
    onKey(e) {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.target.isContentEditable) return;
      if (e.code === 'Space') { e.preventDefault(); this.toggle(); }
      else if (e.key === 'ArrowRight') this.slideJump(1);
      else if (e.key === 'ArrowLeft') this.slideJump(-1);
      else if (e.key === 'f' || e.key === 'F') this.fullscreen();
      else if (e.key === 'm' || e.key === 'M') this.toggleMute();
    }
    get minutes() { return Math.max(1, Math.round(this.total / 60)); }
    destroy() {
      this.token++;
      this.playing = false;
      clearTimeout(this.timer);
      if (synth) synth.cancel();
      document.removeEventListener('keydown', this.onKey);
    }
  }

  // Durée estimée d'une leçon sans instancier le lecteur
  LessonPlayer.estimateMinutes = function (lesson) {
    let w = words(U.plain(lesson.title + ' ' + (lesson.intro || '')));
    lesson.sections.forEach(s => { w += words(U.plain([s.h, s.p, ...(s.bullets || [])].join(' '))) + (s.code ? 15 : 0); });
    (lesson.keypoints || []).forEach(k => { w += words(k); });
    return Math.max(2, Math.round(w * 0.45 / 60) + 1);
  };
  LessonPlayer.ttsAvailable = !!synth;
  LessonPlayer.pickVoice = pickVoice;

  window.LessonPlayer = LessonPlayer;
})();
