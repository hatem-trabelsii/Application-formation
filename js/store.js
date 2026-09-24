/* Persistance locale : tout est dans localStorage (progression) + IndexedDB (vidéos perso). */
(function () {
  const KEY = 'archipath:v1';
  const DAY = 86400000;
  const INTERVALS = [0, 1, 2, 4, 8, 16, 32]; // jours par boîte de Leitner

  const defaults = () => ({
    lessons: {},   // { courseId: { lessonId: timestamp } }
    labs: {},      // { courseId: { labId: { steps: {i: true}, done: ts } } }
    quiz: {},      // { courseId: [ { date, score, total, mode } ] }
    cards: {},     // { "courseId#i": { box, due, seen } }
    notes: {},     // { courseId: { lessonId: "texte" } }
    status: {},    // { courseId: { done: true, date } }  certification obtenue / techno maîtrisée
    videos: {},    // { "courseId/lessonId": "https://..." }
    last: null,    // { courseId, lessonId, t }
    settings: { theme: 'auto', voice: '', rate: 1, muted: false, captions: true, autoplay: true, newPerSession: 10 }
  });

  let state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? Object.assign(defaults(), JSON.parse(raw)) : defaults();
    state.settings = Object.assign(defaults().settings, state.settings || {});
  } catch (e) {
    state = defaults();
  }

  let timer = null;
  function save() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Sauvegarde impossible', e); }
    }, 150);
  }
  window.addEventListener('beforeunload', () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* rien */ }
  });

  const Store = {
    get state() { return state; },
    save,

    // ---- leçons
    isLessonDone(c, l) { return !!(state.lessons[c] && state.lessons[c][l]); },
    setLessonDone(c, l, done) {
      state.lessons[c] = state.lessons[c] || {};
      if (done) state.lessons[c][l] = Date.now(); else delete state.lessons[c][l];
      save();
    },
    doneCount(c) { return Object.keys(state.lessons[c] || {}).length; },
    setLast(c, l) { state.last = { courseId: c, lessonId: l, t: Date.now() }; save(); },

    // ---- statut certification / techno
    isAcquired(c) { return !!(state.status[c] && state.status[c].done); },
    setAcquired(c, done) {
      if (done) state.status[c] = { done: true, date: Date.now() }; else delete state.status[c];
      save();
    },

    // ---- labs
    labState(c, id) {
      state.labs[c] = state.labs[c] || {};
      state.labs[c][id] = state.labs[c][id] || { steps: {} };
      return state.labs[c][id];
    },
    isLabDone(c, id) { return !!(state.labs[c] && state.labs[c][id] && state.labs[c][id].done); },

    // ---- quiz
    addQuizResult(c, r) { (state.quiz[c] = state.quiz[c] || []).push(r); save(); },
    quizResults(c) { return state.quiz[c] || []; },
    bestQuiz(c) {
      const r = state.quiz[c] || [];
      return r.length ? Math.max(...r.map(x => Math.round(100 * x.score / x.total))) : null;
    },

    // ---- flashcards (Leitner)
    card(key) { return state.cards[key]; },
    rateCard(key, rating) {
      const now = Date.now();
      const c = state.cards[key] || { box: 0, due: now, seen: 0 };
      c.seen++;
      if (rating === 1) { c.box = 1; c.due = now; }                       // à revoir tout de suite
      else if (rating === 2) { c.box = Math.max(1, c.box); c.due = now + DAY; }
      else { c.box = Math.min(6, c.box + 1); c.due = now + INTERVALS[c.box] * DAY; }
      state.cards[key] = c;
      save();
      return c;
    },
    isDue(key) { const c = state.cards[key]; return !!c && c.due <= Date.now(); },

    // ---- notes
    note(c, l) { return (state.notes[c] && state.notes[c][l]) || ''; },
    setNote(c, l, txt) {
      state.notes[c] = state.notes[c] || {};
      if (txt.trim()) state.notes[c][l] = txt; else delete state.notes[c][l];
      save();
    },

    // ---- vidéo perso (URL)
    videoUrl(c, l) { return state.videos[c + '/' + l] || ''; },
    setVideoUrl(c, l, url) { if (url) state.videos[c + '/' + l] = url; else delete state.videos[c + '/' + l]; save(); },

    // ---- réglages
    setting(k) { return state.settings[k]; },
    setSetting(k, v) { state.settings[k] = v; save(); },

    // ---- export / import
    exportJSON() { return JSON.stringify({ app: 'archipath', version: 1, exported: new Date().toISOString(), state }, null, 2); },
    importJSON(txt) {
      const data = JSON.parse(txt);
      const s = data.state || data;
      if (typeof s !== 'object' || !s.lessons) throw new Error('Fichier non reconnu');
      state = Object.assign(defaults(), s);
      state.settings = Object.assign(defaults().settings, s.settings || {});
      localStorage.setItem(KEY, JSON.stringify(state));
    },
    reset() { state = defaults(); localStorage.removeItem(KEY); }
  };

  /* ---- IndexedDB : fichiers vidéo locaux ajoutés par l'utilisateur ---- */
  const DB_NAME = 'archipath-videos';
  function db() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) return reject(new Error('IndexedDB indisponible'));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore('files');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  const VideoDB = {
    async put(key, file) {
      const d = await db();
      return new Promise((res, rej) => {
        const tx = d.transaction('files', 'readwrite');
        tx.objectStore('files').put(file, key);
        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
      });
    },
    async get(key) {
      const d = await db();
      return new Promise((res, rej) => {
        const r = d.transaction('files').objectStore('files').get(key);
        r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error);
      });
    },
    async del(key) {
      const d = await db();
      return new Promise((res, rej) => {
        const tx = d.transaction('files', 'readwrite');
        tx.objectStore('files').delete(key);
        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
      });
    }
  };

  window.Store = Store;
  window.VideoDB = VideoDB;
})();
