/* SimLab — simulateur de trafic en direct, façon « system design » :
   des composants sur un canevas, des requêtes qui circulent, des métriques mesurées (pas inventées).
   Trois familles de scénarios : 'lb' (répartiteur de charge), 'cache', 'queue' (file de messages).
   Tout tourne au RALENTI ×10 pour voir chaque requête : les métriques affichées sont reconverties
   en temps réel équivalent (1 s d'animation = 100 ms simulées). */
(function () {
  'use strict';
  const SLOW = 10;          // facteur de ralenti
  const HOP = 240;          // durée (ms d'animation) d'un saut réseau = 24 ms simulées
  const TIMEOUT = 2500;     // expiration côté répartiteur = 250 ms simulées
  const HC_EVERY = 1200;    // période des health checks
  const HC_FAILS = 2;       // échecs consécutifs avant retrait du pool
  const HC_OKS = 2;         // succès consécutifs avant réintégration
  const WINDOW = 4000;      // fenêtre glissante des métriques
  const MAX_PARTS = 500;
  const NS = 'http://www.w3.org/2000/svg';
  const USERS = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#c084fc', '#f87171', '#22d3ee', '#fb923c'];
  const ALGOS = { rr: 'Round robin', least: 'Moins de connexions', random: 'Aléatoire', iphash: 'Hachage IP' };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const expRand = () => -Math.log(1 - Math.random());
  const pct = (arr, p) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };

  // Valeurs par défaut de chaque famille de scénario
  const DEFAULTS = {
    lb: { rps: 40, algo: 'rr', servers: 1, noLB: false, health: false, autoscale: false, minServers: 2, maxServers: 8, session: 'off', specs: null, boot: 3000 },
    cache: { rps: 30, cacheSize: 0, ttl: 2, writes: 0.1, invalidate: false, keys: 200 },
    queue: { rps: 10, mode: 'sync', workers: 3, poison: false, autoscale: false, maxWorkers: 8 }
  };
  const RANGES = {
    lb: { rps: [5, 300, 5] },
    cache: { rps: [5, 200, 5], cacheSize: [0, 100, 5] },
    queue: { rps: [2, 60, 1], workers: [1, 8, 1] }
  };

  class SimLab {
    constructor(root, lesson, opts = {}) {
      this.root = root;
      this.lesson = lesson;
      this.kind = lesson.kind;
      this.opts = opts;
      this.speed = 1;
      this.paused = false;
      this.alive = true;
      root.innerHTML = `
        <div class="sim">
          <div class="sim-ctrls"></div>
          <div class="sim-stage">
            <div class="sim-goal hidden" aria-live="polite"></div>
            <div class="sim-scroll"><svg class="sim-svg" viewBox="0 0 1000 520" role="img" aria-label="Simulation de trafic : ${esc(lesson.title)}"></svg></div>
            <div class="sim-legend small"></div>
            <div class="sim-slow small" title="Chaque requête est visible : 1 seconde d'animation = 100 ms réelles. Les métriques sont exprimées en temps réel équivalent.">🐢 ralenti ×10</div>
          </div>
          <div class="sim-metrics"></div>
          <div class="sim-bottom">
            <div class="sim-sparks"></div>
            <div class="sim-logbox"><div class="sim-logtitle small">Journal des événements</div><ol class="sim-log"></ol></div>
          </div>
        </div>`;
      this.svg = root.querySelector('.sim-svg');
      const defs = svgEl('defs', {}, this.svg);
      const pat = svgEl('pattern', { id: 'simGrid', width: 25, height: 25, patternUnits: 'userSpaceOnUse' }, defs);
      svgEl('circle', { cx: 1, cy: 1, r: 1, class: 'sim-dot' }, pat);
      svgEl('rect', { x: 0, y: 0, width: 1000, height: 520, fill: 'url(#simGrid)', class: 'sim-bg' }, this.svg);
      this.gEdges = svgEl('g', {}, this.svg);
      this.gParts = svgEl('g', {}, this.svg);
      this.gNodes = svgEl('g', {}, this.svg);
      this.gFx = svgEl('g', {}, this.svg);
      this.$ctrls = root.querySelector('.sim-ctrls');
      this.$metrics = root.querySelector('.sim-metrics');
      this.$sparks = root.querySelector('.sim-sparks');
      this.$log = root.querySelector('.sim-log');
      this.$goal = root.querySelector('.sim-goal');
      this.$legend = root.querySelector('.sim-legend');
      this.svg.addEventListener('click', e => {
        const g = e.target.closest('[data-node]');
        if (g) this.clickNode(g.dataset.node);
      });
      this.frame = this.frame.bind(this);
      this.onKey = e => {
        if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.code === 'Space' && this.root.isConnected) { e.preventDefault(); this.togglePause(); }
      };
      document.addEventListener('keydown', this.onKey);
      this.load(opts.setup || {}, opts.controls || null, opts.goal || null);
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
      SimLab.current = this;   // utile pour les tests automatisés et la console
    }

    /* ================= Chargement d'un scénario ================= */
    load(setup, controls, goal) {
      this.cfg = Object.assign({}, DEFAULTS[this.kind], setup);
      this.controls = controls || this.allControls();
      this.goal = goal;
      this.goalHold = 0;
      this.goalDone = false;
      this.now = 0;
      this.timers = [];
      this.parts = [];
      this.records = [];
      this.series = [];
      this.nextSnap = 500;
      this.mult = 1;
      this.spikes = 0;
      this.acc = 0;
      this.gap = expRand();
      this.seq = 0;
      this.rr = -1;
      this.nodes = {};
      this.edgeEls = {};
      this.lbConn = {};
      this.home = {};
      this.lostT = [];
      this.lowLoad = 0;
      this.counters = { hits: [], misses: [], stale: [], done: [], dlq: 0 };
      this.cache = new Map();
      this.ver = {};
      this.jobs = [];
      this.gEdges.textContent = ''; this.gParts.textContent = ''; this.gNodes.textContent = ''; this.gFx.textContent = '';
      this.$log.textContent = '';
      this.build();
      this.renderControls();
      this.renderLegend();
      this.renderGoal();
      this.snapshot();
      this.draw();
    }

    allControls() {
      return {
        lb: ['rps', 'spike', 'algo', 'servers', 'kill', 'health', 'autoscale', 'session'],
        cache: ['rps', 'cacheSize', 'ttl', 'writes', 'invalidate', 'kill'],
        queue: ['rps', 'spike', 'mode', 'workers', 'kill', 'poison', 'autoscale']
      }[this.kind];
    }

    /* ================= Topologies ================= */
    addNode(n) {
      const node = Object.assign({ up: true, busy: 0, cap: 1, svc: 1000, qmax: 0, q: [], active: new Set(), served: 0, dropped: 0, hidden: false, removed: false, sess: new Set(), dx: n.x, dy: n.y }, n);
      this.nodes[node.id] = node;
      return node;
    }
    servers() { return Object.values(this.nodes).filter(n => n.type === 'server' && !n.removed); }
    workers() { return Object.values(this.nodes).filter(n => n.type === 'worker' && !n.removed); }

    build() {
      const c = this.cfg;
      if (this.kind === 'lb') {
        this.addNode({ id: 'client', type: 'client', x: 100, y: 260, icon: '👥', label: 'Utilisateurs' });
        this.addNode({ id: 'lb', type: 'lb', x: 350, y: 260, icon: '⚖️', label: 'Load balancer', hidden: !!c.noLB });
        this.addNode({ id: 'redis', type: 'store', x: 890, y: 260, icon: '🧠', label: 'Redis', sublabel: 'sessions partagées', hidden: c.session !== 'shared' });
        for (let i = 0; i < c.servers; i++) this.addServer(false, (c.specs && c.specs[i]) || null);
        if (c.noLB) this.nodes.client.x = this.nodes.client.dx = 200;
        this.layoutServers(true);
      } else if (this.kind === 'cache') {
        this.addNode({ id: 'client', type: 'client', x: 100, y: 260, icon: '👥', label: 'Utilisateurs' });
        this.addNode({ id: 'app', type: 'app', x: 360, y: 260, icon: '🖥️', label: 'Application', cap: 60, svc: 150, qmax: 60 });
        this.addNode({ id: 'cache', type: 'cache', x: 660, y: 120, icon: '⚡', label: 'Cache Redis', cap: 200, svc: 60, qmax: 200 });
        this.addNode({ id: 'db', type: 'db', x: 660, y: 400, icon: '🗄️', label: 'Base de données', cap: 4, svc: 1500, qmax: 24 });
        // Popularité des clés : loi de Zipf (quelques produits très consultés, une longue traîne)
        this.zipf = []; let s = 0;
        for (let k = 1; k <= c.keys; k++) { s += 1 / Math.pow(k, 1.1); this.zipf.push(s); }
        this.zipfTotal = s;
      } else {
        this.addNode({ id: 'client', type: 'client', x: 100, y: 260, icon: '🛒', label: 'Clients', sublabel: 'commandes' });
        this.addNode({ id: 'api', type: 'app', x: 290, y: 260, icon: '🖥️', label: 'API', cap: 40, svc: 100, qmax: 40 });
        this.addNode({ id: 'queue', type: 'queue', x: 510, y: 260, icon: '📬', label: 'File (SQS)', qmax: 600, hidden: c.mode !== 'async' });
        this.addNode({ id: 'dlq', type: 'dlq', x: 900, y: 455, icon: '🪦', label: 'DLQ', sublabel: 'messages en échec', hidden: !c.poison });
        for (let i = 0; i < c.workers; i++) this.addWorker(false);
        this.layoutWorkers(true);
      }
      if (this.kind === 'lb') this.at(HC_EVERY, () => this.healthLoop());
      if (this.kind !== 'cache') this.at(2000, () => this.scaleLoop());
    }

    addServer(booting, spec) {
      const n = this.servers().length + Object.values(this.nodes).filter(x => x.type === 'server' && x.removed).length + 1;
      const s = this.addNode(Object.assign({ id: 's' + n, type: 'server', x: 640, y: 260, icon: '🖥️', label: 'Serveur ' + n, cap: 4, svc: 1500, qmax: 6, booting, inPool: !booting, hcFail: 0, hcOk: 0, draining: false }, spec || {}));
      this.lbConn[s.id] = 0;
      if (booting) {
        this.at(this.cfg.boot, () => {
          if (s.removed) return;
          s.booting = false;
          s.inPool = !this.cfg.health;   // avec health checks : il doit d'abord passer HC_OKS contrôles
          this.log(`🟢 ${s.label} a démarré${this.cfg.health ? ' : en attente des health checks' : ' et reçoit du trafic'}.`);
        });
      }
      return s;
    }
    layoutServers(instant) {
      const list = this.servers(), n = list.length;
      const gap = n > 1 ? Math.min(118, 400 / (n - 1)) : 0;
      list.forEach((s, i) => { s.x = this.cfg.noLB ? 560 : 640; s.y = 260 + (i - (n - 1) / 2) * gap; if (instant) { s.dx = s.x; s.dy = s.y; } });
    }
    addWorker(booting) {
      const n = Object.values(this.nodes).filter(x => x.type === 'worker').length + 1;
      const w = this.addNode({ id: 'w' + n, type: 'worker', x: 720, y: 260, icon: '⚙️', label: 'Worker ' + n, cap: 1, svc: 2500, qmax: 1, booting });
      if (booting) this.at(1500, () => { w.booting = false; this.log(`🟢 ${w.label} a démarré.`); this.dispatch(); });
      return w;
    }
    layoutWorkers(instant) {
      const list = this.workers(), n = list.length;
      const gap = n > 1 ? Math.min(118, 380 / (n - 1)) : 0;
      list.forEach((w, i) => { w.x = 720; w.y = 250 + (i - (n - 1) / 2) * gap; if (instant) { w.dx = w.x; w.dy = w.y; } });
    }

    /* ================= Horloge et minuteries ================= */
    at(delay, fn) { const t = { t: this.now + delay, fn, dead: false }; this.timers.push(t); return t; }

    frame(ts) {
      if (!this.alive) return;
      const dt = Math.min(50, ts - this.last) * this.speed;
      this.last = ts;
      if (!this.paused && dt > 0) {
        this.now += dt;
        this.generate(dt);
        const due = this.timers.filter(t => t.t <= this.now);
        if (due.length) {
          this.timers = this.timers.filter(t => t.t > this.now);
          due.sort((a, b) => a.t - b.t).forEach(t => { if (!t.dead) t.fn(); });
        }
        const ended = [];
        this.parts = this.parts.filter(p => {
          if (this.now - p.t0 < p.dur) return true;
          p.el.remove(); ended.push(p);
          return false;
        });
        ended.forEach(p => p.end && p.end());   // après le filtre : les rappels peuvent créer de nouvelles particules
        while (this.now >= this.nextSnap) { this.snapshot(); this.nextSnap += 500; }
      }
      this.draw();
      this.raf = requestAnimationFrame(this.frame);
    }

    generate(dt) {
      const rate = this.cfg.rps * this.mult / SLOW / 1000;   // requêtes par ms d'animation
      this.acc += dt * rate;
      while (this.acc >= this.gap) { this.acc -= this.gap; this.gap = expRand(); this.newRequest(); }
    }

    /* ================= Particules (requêtes visibles) ================= */
    // path : liste d'identifiants de nœuds ; chaque segment dure HOP (ou dur/segments)
    particle(path, cls, end, opts = {}) {
      if (this.parts.length >= MAX_PARTS) { if (end) this.at(HOP * (path.length - 1), end); return; }
      const el = svgEl('circle', { r: opts.r || (cls === 'hc' ? 3 : 5), class: 'sim-p ' + cls }, this.gParts);
      if (opts.color) el.style.fill = opts.color;
      const p = { path, t0: this.now, dur: opts.dur || HOP * Math.max(1, path.length - 1), el, end };
      this.parts.push(p);
      this.placeParticle(p);
    }
    hop(req, from, to, end) { this.particle([from, to], 'req', end, { color: this.reqColor(req) }); }
    reqColor(req) { return (this.kind === 'lb' && (this.cfg.session !== 'off' || this.cfg.algo === 'iphash')) ? USERS[req.user] : null; }
    placeParticle(p) {
      const k = Math.min(1, (this.now - p.t0) / p.dur) * (p.path.length - 1);
      const i = Math.min(p.path.length - 2, Math.floor(k)), f = k - i;
      const a = this.nodes[p.path[i]], b = this.nodes[p.path[i + 1]];
      if (!a || !b) return;
      const e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;   // easing par saut
      p.el.setAttribute('cx', (a.dx + (b.dx - a.dx) * e).toFixed(1));
      p.el.setAttribute('cy', (a.dy + (b.dy - a.dy) * e).toFixed(1));
    }

    /* ================= Réponses et métriques ================= */
    reply(req, ok, code, from) {
      if (req.closed) return;
      req.closed = true;
      const idx = req.route.lastIndexOf(from);
      const back = req.route.slice(0, idx + 1).reverse();
      const fin = () => this.records.push({ t: this.now, ok, code, lat: this.now - req.t0 });
      if (back.length < 2) return fin();
      this.particle(back, ok ? 'res' : 'err', fin, { r: ok ? 4 : 5 });
    }
    fail(req, code, from, why) {
      if (from) this.flash(from, String(code), 'bad');
      if (why && Math.random() < 0.25) this.log(why);
      this.reply(req, false, code, from || req.route[req.route.length - 1]);
    }

    snapshot() {
      const since = this.now - WINDOW;
      this.records = this.records.filter(r => r.t >= since);
      const rec = this.records, ok = rec.filter(r => r.ok);
      const m = {
        n: rec.length,
        rps: Math.round(ok.length / (WINDOW / 1000) * SLOW),
        err: rec.length ? (rec.length - ok.length) / rec.length : 0,
        p50: Math.round(pct(ok.map(r => r.lat), 0.5) / SLOW),
        p95: Math.round(pct(ok.map(r => r.lat), 0.95) / SLOW)
      };
      const cut = arr => arr.filter(t => t >= since);
      if (this.kind === 'lb') {
        this.lostT = cut(this.lostT);
        const pool = this.pool();
        m.lost = Math.round(this.lostT.length / (WINDOW / 1000) * SLOW);
        m.pool = pool.length;
        m.servers = this.servers().filter(s => !s.draining).length;
        const cap = pool.reduce((a, s) => a + s.cap, 0);
        m.load = cap ? pool.reduce((a, s) => a + s.busy + s.q.length, 0) / cap : 1;
      } else if (this.kind === 'cache') {
        ['hits', 'misses', 'stale'].forEach(k => (this.counters[k] = cut(this.counters[k])));
        const h = this.counters.hits.length, mi = this.counters.misses.length;
        m.hit = h + mi ? h / (h + mi) : 0;
        m.stale = h ? this.counters.stale.length / h : 0;
        const db = this.nodes.db;
        m.db = (db.busy + db.q.length) / db.cap;
      } else {
        this.counters.done = cut(this.counters.done);
        m.depth = this.jobs.length;
        m.age = this.jobs.length ? Math.round((this.now - this.jobs[0].t0) / SLOW) : 0;
        m.done = Math.round(this.counters.done.length / (WINDOW / 1000) * SLOW);
        m.dlq = this.counters.dlq;
        m.workers = this.workers().length;
      }
      this.m = m;
      this.series.push({ rps: m.rps, p95: m.p95, err: m.err * 100 });
      if (this.series.length > 60) this.series.shift();
      this.renderMetrics();
      this.renderSparks();
      this.checkGoal();
      if (this.opts.onSnapshot) this.opts.onSnapshot(m, this);
    }

    checkGoal() {
      if (!this.goal || this.goalDone || this.now < 1500) return;
      let ok = false;
      try { ok = !!this.goal.test(this.m, this.cfg, this); } catch (e) { ok = false; }
      this.goalHold = ok ? this.goalHold + 1 : 0;
      const need = this.goal.hold || 6;   // 6 mesures consécutives = 3 s d'animation
      if (this.goalHold >= need) {
        this.goalDone = true;
        this.log('🎯 Objectif atteint !');
        if (this.opts.onGoal) this.opts.onGoal(this);
      }
      this.renderGoal(Math.min(1, this.goalHold / need));
    }

    /* ================= Comportement : traitement générique ================= */
    // Un nœud traite au plus `cap` requêtes à la fois, en met `qmax` en attente, rejette le reste.
    process(node, job) {
      if (!node.up) return (job.lost || job.drop)();
      if (node.busy < node.cap) this.start(node, job);
      else if (node.q.length < node.qmax) node.q.push(job);
      else { node.dropped++; job.drop(); }
    }
    start(node, job) {
      node.busy++;
      node.active.add(job);
      const d = node.svc * (0.6 + Math.random() * 0.8);
      job.timer = this.at(d, () => {
        node.busy--; node.active.delete(job); node.served++;
        job.done();
        this.pull(node);
      });
    }
    pull(node) { while (node.up && node.busy < node.cap && node.q.length) this.start(node, node.q.shift()); }
    crash(node) {
      // Panne : le travail en cours et la file d'attente en mémoire sont perdus.
      const lost = [...node.active, ...node.q];
      node.active.forEach(j => { if (j.timer) j.timer.dead = true; });
      node.active.clear(); node.q = []; node.busy = 0;
      node.up = false;
      node.sess.clear();
      lost.forEach(j => (j.lost || j.drop)());
    }

    /* ================= Scénario : répartiteur de charge ================= */
    pool() {
      return this.servers().filter(s => !s.booting && !s.draining && (this.cfg.health ? s.inPool : true));
    }
    pick(pool, req) {
      const a = this.cfg.algo;
      if (a === 'random') return pool[Math.floor(Math.random() * pool.length)];
      if (a === 'iphash') return pool[(req.user * 7 + 3) % pool.length];
      if (a === 'least') {
        let best = null;
        pool.forEach(s => { if (!best || this.lbConn[s.id] < this.lbConn[best.id] || (this.lbConn[s.id] === this.lbConn[best.id] && Math.random() < 0.5)) best = s; });
        return best;
      }
      this.rr = (this.rr + 1) % pool.length;
      return pool[this.rr];
    }

    newRequest() {
      const req = { id: ++this.seq, t0: this.now, route: ['client'], user: Math.floor(Math.random() * USERS.length) };
      if (this.kind === 'lb') {
        if (this.cfg.noLB) { const s = this.servers()[0]; return this.hop(req, 'client', s.id, () => this.serverIn(s, req)); }
        return this.hop(req, 'client', 'lb', () => this.lbIn(req));
      }
      if (this.kind === 'cache') {
        const r = Math.random() * this.zipfTotal;
        req.key = this.zipf.findIndex(v => v >= r);
        req.write = Math.random() < this.cfg.writes;
        return this.hop(req, 'client', 'app', () => this.appIn(req));
      }
      req.poison = this.cfg.poison && Math.random() < 0.1;   // proportion volontairement exagérée pour être visible
      this.hop(req, 'client', 'api', () => this.apiIn(req));
    }

    lbIn(req) {
      req.route.push('lb');
      const pool = this.pool();
      if (!pool.length) return this.fail(req, 503, 'lb', '⛔ Aucun serveur sain dans le pool : le load balancer répond 503.');
      const s = this.pick(pool, req);
      this.lbConn[s.id]++;
      this.hop(req, 'lb', s.id, () => this.serverIn(s, req));
    }

    serverIn(s, req) {
      const viaLB = !this.cfg.noLB;
      const release = () => { if (viaLB) this.lbConn[s.id] = Math.max(0, this.lbConn[s.id] - 1); };
      const timeout = () => this.at(TIMEOUT, () => {
        release();
        if (viaLB) this.fail(req, 504, 'lb', `⌛ ${s.label} ne répond pas : expiration après 250 ms, erreur 504.`);
        else this.fail(req, 'ERR', 'client', `⌛ ${s.label} ne répond pas : la connexion échoue.`);
      });
      if (!s.up) return timeout();
      req.route.push(s.id);
      if (this.cfg.session === 'local') {
        if (!s.sess.has(req.user)) {
          if (this.home[req.user] && this.home[req.user] !== s.id) {
            this.lostT.push(this.now);
            this.flash(s.id, '🔒 session inconnue', 'warn');
          }
          s.sess.add(req.user);
        }
        this.home[req.user] = s.id;
      }
      this.process(s, {
        req,
        done: () => {
          release();
          if (this.cfg.session === 'shared') { req.route.push('redis'); this.hop(req, s.id, 'redis', () => this.reply(req, true, 200, 'redis')); }
          else this.reply(req, true, 200, s.id);
        },
        drop: () => { release(); this.fail(req, 503, s.id, `🔥 ${s.label} est saturé (file pleine) : requête rejetée en 503.`); },
        lost: () => timeout()
      });
    }

    healthLoop() {
      this.at(HC_EVERY, () => this.healthLoop());
      if (!this.cfg.health || this.cfg.noLB) return;
      this.servers().forEach(s => {
        if (s.booting) return;
        this.particle(['lb', s.id], 'hc', () => {
          if (s.up) {
            this.particle([s.id, 'lb'], 'hc', () => {
              s.hcFail = 0; s.hcOk++;
              if (!s.inPool && !s.draining && s.hcOk >= HC_OKS) { s.inPool = true; this.log(`✅ Health check : ${s.label} répond, il réintègre le pool.`); }
            });
          } else {
            this.at(HOP, () => {
              s.hcOk = 0; s.hcFail++;
              if (s.inPool && s.hcFail >= HC_FAILS) { s.inPool = false; this.log(`🩺 Health check : ${s.label} a échoué ${HC_FAILS} fois, il est retiré du pool.`); }
            });
          }
        });
      });
    }

    scaleLoop() {
      this.at(2000, () => this.scaleLoop());
      if (!this.cfg.autoscale) { this.lowLoad = 0; return; }
      if (this.kind === 'lb') {
        const pool = this.pool();
        const cap = pool.reduce((a, s) => a + s.cap, 0);
        const load = cap ? pool.reduce((a, s) => a + s.busy + s.q.length, 0) / cap : 1;
        const active = this.servers().filter(s => !s.draining);
        const booting = active.some(s => s.booting || (this.cfg.health && !s.inPool && s.up));
        if (load > 0.75 && active.length < this.cfg.maxServers && !booting) {
          const s = this.addServer(true);
          this.layoutServers();
          this.log(`📈 Auto-scaling : charge ${Math.round(load * 100)} % > 75 %, lancement de ${s.label}.`);
          this.lowLoad = 0;
        } else if (load < 0.3 && active.length > this.cfg.minServers) {
          if (++this.lowLoad >= 3) {
            const s = active[active.length - 1];
            s.draining = true;
            this.log(`📉 Auto-scaling : charge ${Math.round(load * 100)} % < 30 %, ${s.label} est vidé puis arrêté.`);
            this.lowLoad = 0;
            const check = () => { if (s.busy === 0 && !s.q.length && !this.lbConn[s.id]) { s.removed = true; this.layoutServers(); } else this.at(300, check); };
            check();
          }
        } else this.lowLoad = 0;
      } else {
        const ws = this.workers();
        if (this.cfg.mode === 'async' && this.jobs.length > 4 * ws.length && ws.length < this.cfg.maxWorkers && !ws.some(w => w.booting)) {
          const w = this.addWorker(true); this.layoutWorkers();
          this.log(`📈 Auto-scaling : ${this.jobs.length} messages en attente, lancement de ${w.label}.`);
        } else if (!this.jobs.length && ws.length > 1 && ws.every(w => !w.busy)) {
          if (++this.lowLoad >= 3) { const w = ws[ws.length - 1]; w.removed = true; this.layoutWorkers(); this.log(`📉 Auto-scaling : file vide, ${w.label} est arrêté.`); this.lowLoad = 0; }
        }
      }
    }

    /* ================= Scénario : cache ================= */
    cacheOn() { return this.cfg.cacheSize > 0; }
    appIn(req) {
      req.route.push('app');
      this.process(this.nodes.app, {
        req,
        done: () => this.afterApp(req),
        drop: () => this.fail(req, 503, 'app', '🔥 L\'application est saturée.')
      });
    }
    afterApp(req) {
      const c = this.nodes.cache;
      if (req.write) {
        return this.dbCall(req, () => {
          this.ver[req.key] = (this.ver[req.key] || 0) + 1;
          if (this.cfg.invalidate && this.cacheOn() && c.up) { this.cache.delete(req.key); this.particle(['app', 'cache'], 'inval'); }
        });
      }
      if (!this.cacheOn()) return this.dbCall(req);
      if (!c.up) return this.dbCall(req);   // cache en panne : tout retombe sur la base
      this.hop(req, 'app', 'cache', () => {
        req.route.push('cache');
        this.process(c, {
          req,
          done: () => {
            const e = this.cache.get(req.key);
            const ttl = this.cfg.ttl * 1000 * SLOW;   // TTL en secondes réelles, converti en temps d'animation
            if (e && this.now - e.t < ttl) {
              this.counters.hits.push(this.now);
              if (e.v !== (this.ver[req.key] || 0)) { this.counters.stale.push(this.now); this.flash('cache', 'périmé', 'warn'); }
              this.cache.delete(req.key); this.cache.set(req.key, e);   // LRU : remis en tête
              this.reply(req, true, 200, 'cache');
            } else {
              this.counters.misses.push(this.now);
              if (e) this.cache.delete(req.key);
              if (Math.random() < 0.15) this.flash('cache', 'miss', 'info');
              req.route.pop();
              this.particle(['cache', 'app'], 'miss', () => this.dbCall(req, null, true));
            }
          },
          drop: () => this.fail(req, 503, 'cache')
        });
      });
    }
    dbCall(req, after, fill) {
      this.hop(req, 'app', 'db', () => {
        req.route.push('db');
        this.process(this.nodes.db, {
          req,
          done: () => {
            if (after) after();
            if (fill && this.cacheOn() && this.nodes.cache.up) {
              this.cache.set(req.key, { t: this.now, v: this.ver[req.key] || 0 });
              while (this.cache.size > this.cfg.cacheSize) this.cache.delete(this.cache.keys().next().value);
            }
            this.reply(req, true, 200, 'db');
          },
          drop: () => this.fail(req, 503, 'db', '🔥 Base de données saturée : connexions épuisées, erreur 503.')
        });
      });
    }

    /* ================= Scénario : file de messages ================= */
    apiIn(req) {
      req.route.push('api');
      this.process(this.nodes.api, {
        req,
        done: () => (this.cfg.mode === 'async' ? this.enqueue(req) : this.syncCall(req)),
        drop: () => this.fail(req, 503, 'api', '🔥 L\'API est saturée : requête rejetée.')
      });
    }
    syncCall(req) {
      // Appel synchrone : le client attend la fin du traitement par un worker.
      const ws = this.workers().filter(w => w.up && !w.booting);
      if (!ws.length) return this.fail(req, 503, 'api', '⛔ Aucun worker disponible.');
      ws.sort((a, b) => (a.busy + a.q.length) - (b.busy + b.q.length));
      const w = ws[0];
      this.hop(req, 'api', w.id, () => {
        if (!w.up) return this.fail(req, 504, 'api');
        req.route.push(w.id);
        this.process(w, {
          req,
          done: () => { this.counters.done.push(this.now); this.reply(req, true, 200, w.id); },
          drop: () => this.fail(req, 503, w.id, `🔥 ${w.label} est déjà occupé : la commande est refusée (503).`),
          lost: () => this.fail(req, 504, 'api', `💥 ${w.label} est tombé pendant le traitement : commande perdue.`)
        });
      });
    }
    enqueue(req) {
      this.hop(req, 'api', 'queue', () => {
        req.route.push('queue');
        if (this.jobs.length >= this.nodes.queue.qmax) return this.fail(req, 503, 'queue', '⛔ File pleine : message refusé.');
        this.jobs.push({ id: req.id, t0: this.now, poison: req.poison, tries: 0 });
        this.reply(req, true, 202, 'queue');   // 202 Accepted : « reçu, traité bientôt »
        this.dispatch();
      });
    }
    dispatch() {
      if (this.cfg.mode !== 'async') return;
      this.workers().forEach(w => {
        while (w.up && !w.booting && w.busy < w.cap && this.jobs.length) {
          const job = this.jobs.shift();
          w.busy++;
          this.particle(['queue', w.id], 'job', () => this.work(w, job));
        }
      });
    }
    work(w, job) {
      if (!w.up) { w.busy = Math.max(0, w.busy - 1); return this.redeliver(job, w); }
      const entry = { job, lost: () => this.redeliver(job, w) };
      w.active.add(entry);
      entry.timer = this.at(w.svc * (0.6 + Math.random() * 0.8), () => {
        w.active.delete(entry); w.busy = Math.max(0, w.busy - 1);
        if (job.poison) {
          job.tries++;
          if (job.tries >= 3) {
            this.counters.dlq++;
            this.particle([w.id, 'dlq'], 'err');
            this.log(`🪦 Message #${job.id} en échec 3 fois : déplacé dans la DLQ pour analyse.`);
          } else {
            this.flash(w.id, 'échec ' + job.tries + '/3', 'bad');
            this.particle([w.id, 'queue'], 'err', () => { this.jobs.push(job); this.dispatch(); });
          }
        } else {
          w.served++;
          this.counters.done.push(this.now);
          this.particle([w.id, 'queue'], 'ack', null, { r: 3 });
        }
        this.dispatch();
      });
    }
    redeliver(job, w) {
      // Message non acquitté : il redevient visible dans la file après le délai de visibilité.
      this.at(1500, () => { this.jobs.unshift(job); this.log(`↩️ ${w.label} n'a pas acquitté le message #${job.id} : il revient dans la file.`); this.dispatch(); });
    }

    /* ================= Actions de l'utilisateur ================= */
    clickNode(id) {
      if (!this.controls.includes('kill')) return;
      const n = this.nodes[id];
      if (!n || !['server', 'cache', 'worker', 'db'].includes(n.type) || n.removed || n.booting) return;
      if (n.up) {
        this.crash(n);
        n.crashes = (n.crashes || 0) + 1;
        if (n.type === 'cache') this.cache.clear();
        this.log(`💥 ${n.label} est en panne${n.type === 'cache' ? ' : son contenu en mémoire est perdu' : ''}.`);
        this.flash(id, 'PANNE', 'bad');
      } else {
        n.up = true; n.hcFail = 0;
        this.log(`🔧 ${n.label} redémarre${n.type === 'cache' ? ' (à froid : cache vide)' : ''}.`);
        if (n.type === 'worker') this.dispatch();
      }
      this.renderLegend();
    }
    set(k, v) {
      const c = this.cfg;
      c[k] = v;
      if (k === 'session') {
        this.nodes.redis.hidden = v !== 'shared';
        if (v === 'local') this.log('🍪 Les sessions sont stockées dans la mémoire de chaque serveur.');
        if (v === 'shared') this.log('🧠 Les sessions sont stockées dans Redis, partagé par tous les serveurs.');
      }
      if (k === 'servers') {
        const act = this.servers().filter(s => !s.draining);
        if (v > act.length) { for (let i = act.length; i < v; i++) this.addServer(true); this.log('➕ Nouveau serveur en cours de démarrage.'); }
        else if (v < act.length) {
          act.slice(v).forEach(s => {
            s.draining = true;
            const check = () => { if (s.busy === 0 && !s.q.length && !this.lbConn[s.id]) { s.removed = true; this.layoutServers(); } else this.at(300, check); };
            check();
          });
          this.log('➖ Serveur retiré : il termine ses requêtes en cours (draining) puis s\'arrête.');
        }
        this.layoutServers();
      }
      if (k === 'health') { this.servers().forEach(s => { s.inPool = !s.booting && s.up; s.hcFail = 0; s.hcOk = 0; }); this.log(v ? '🩺 Health checks activés : le load balancer interroge /health toutes les 120 ms.' : '🩺 Health checks désactivés.'); }
      if (k === 'autoscale') this.log(v ? '📈 Auto-scaling activé (cible : charge entre 30 % et 75 %).' : '📈 Auto-scaling désactivé.');
      if (k === 'algo') this.log(`⚖️ Algorithme : ${ALGOS[v]}.`);
      if (k === 'cacheSize') { while (this.cache.size > v) this.cache.delete(this.cache.keys().next().value); }
      if (k === 'mode') {
        this.nodes.queue.hidden = v !== 'async';
        this.log(v === 'async' ? '📬 Mode asynchrone : l\'API dépose un message et répond 202 tout de suite.' : '🔗 Mode synchrone : le client attend que le worker ait fini.');
        this.dispatch();
      }
      if (k === 'workers') {
        const ws = this.workers();
        if (v > ws.length) for (let i = ws.length; i < v; i++) this.addWorker(true);
        else ws.slice(v).forEach(w => { this.crash(w); w.removed = true; });
        this.layoutWorkers();
      }
      if (k === 'poison') this.nodes.dlq.hidden = !v;
      this.renderLegend();
      if (this.opts.onChange) this.opts.onChange(k, v);
    }
    spike() {
      if (this.mult > 1) return;
      this.mult = 5;
      this.spikes = (this.spikes || 0) + 1;
      this.log('⚡ Pic de trafic : ×5 pendant quelques secondes !');
      this.at(9000, () => { this.mult = 1; this.log('⚡ Fin du pic de trafic.'); });
    }
    togglePause() {
      this.paused = !this.paused;
      const b = this.root.querySelector('[data-act="pause"]');
      if (b) b.textContent = this.paused ? '▶️ Reprendre' : '⏸ Pause';
      this.root.querySelector('.sim').classList.toggle('sim-is-paused', this.paused);
    }

    /* ================= Rendu : contrôles ================= */
    renderControls() {
      const c = this.cfg, has = k => this.controls.includes(k), R = RANGES[this.kind];
      const range = (k, label, fmt) => `<label class="sim-ctl"><span>${label} <b data-out="${k}">${fmt(c[k])}</b></span><input type="range" data-k="${k}" min="${R[k][0]}" max="${R[k][1]}" step="${R[k][2]}" value="${c[k]}"></label>`;
      const toggle = (k, label) => `<label class="sim-ctl sim-toggle"><input type="checkbox" data-k="${k}" ${(k === 'mode' ? c.mode === 'async' : c[k]) ? 'checked' : ''}><span>${label}</span></label>`;
      const parts = [];
      if (has('rps')) parts.push(range('rps', 'Trafic', v => v + ' req/s'));
      if (has('spike')) parts.push(`<button class="btn small ghost" data-act="spike">⚡ Pic ×5</button>`);
      if (has('algo') && !c.noLB) parts.push(`<label class="sim-ctl"><span>Algorithme</span><select data-k="algo">${Object.entries(ALGOS).map(([k, v]) => `<option value="${k}" ${c.algo === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`);
      if (has('servers') && !c.noLB) parts.push(`<div class="sim-ctl"><span>Serveurs</span><div class="sim-stepper"><button class="btn small ghost" data-act="srv-">−</button><b data-out="servers">${this.servers().filter(s => !s.draining).length}</b><button class="btn small ghost" data-act="srv+">+</button></div></div>`);
      if (has('health') && !c.noLB) parts.push(toggle('health', '🩺 Health checks'));
      if (has('autoscale')) parts.push(toggle('autoscale', '📈 Auto-scaling'));
      if (has('session')) parts.push(`<label class="sim-ctl"><span>Sessions</span><select data-k="session"><option value="off" ${c.session === 'off' ? 'selected' : ''}>Sans état</option><option value="local" ${c.session === 'local' ? 'selected' : ''}>En mémoire du serveur</option><option value="shared" ${c.session === 'shared' ? 'selected' : ''}>Partagées (Redis)</option></select></label>`);
      if (has('cacheSize')) parts.push(range('cacheSize', 'Taille du cache', v => v ? v + ' clés / ' + c.keys : 'désactivé'));
      if (has('ttl')) parts.push(`<label class="sim-ctl"><span>TTL</span><select data-k="ttl">${[0.2, 0.5, 2, 10].map(v => `<option value="${v}" ${+c.ttl === v ? 'selected' : ''}>${String(v).replace('.', ',')} s</option>`).join('')}</select></label>`);
      if (has('writes')) parts.push(`<label class="sim-ctl"><span>Écritures</span><select data-k="writes">${[0, 0.1, 0.3].map(v => `<option value="${v}" ${+c.writes === v ? 'selected' : ''}>${v * 100} %</option>`).join('')}</select></label>`);
      if (has('invalidate')) parts.push(toggle('invalidate', '🧹 Invalider à l\'écriture'));
      if (has('mode')) parts.push(toggle('mode', '📬 File de messages'));
      if (has('workers')) parts.push(range('workers', 'Workers', v => v));
      if (has('poison')) parts.push(toggle('poison', '☠️ Messages empoisonnés'));
      parts.push(`<div class="sim-ctl sim-run"><button class="btn small ghost" data-act="pause">⏸ Pause</button><select data-act="speed" aria-label="Vitesse"><option value="0.5">×0,5</option><option value="1" selected>×1</option><option value="2">×2</option></select><button class="btn small ghost" data-act="reset" title="Recommencer">↺</button></div>`);
      this.$ctrls.innerHTML = parts.join('');
      this.$ctrls.querySelectorAll('[data-k]').forEach(inp => {
        const k = inp.dataset.k;
        inp.addEventListener(inp.type === 'range' ? 'input' : 'change', () => {
          let v = inp.type === 'checkbox' ? inp.checked : inp.value;
          if (k === 'mode') v = inp.checked ? 'async' : 'sync';
          if (inp.type === 'range' || k === 'writes' || k === 'ttl') v = +v;
          this.set(k, v);
          const out = this.$ctrls.querySelector(`[data-out="${k}"]`);
          if (out) out.textContent = k === 'rps' ? v + ' req/s' : k === 'cacheSize' ? (v ? v + ' clés / ' + c.keys : 'désactivé') : v;
        });
      });
      this.$ctrls.querySelectorAll('[data-act]').forEach(b => {
        const a = b.dataset.act;
        if (a === 'speed') return b.addEventListener('change', () => (this.speed = +b.value));
        b.addEventListener('click', () => {
          if (a === 'pause') this.togglePause();
          else if (a === 'spike') this.spike();
          else if (a === 'reset') { this.load(this.opts.setup || {}, this.opts.controls || null, this.opts.goal || null); if (this.opts.onReset) this.opts.onReset(); }
          else if (a === 'srv+' || a === 'srv-') {
            const n = this.servers().filter(s => !s.draining).length + (a === 'srv+' ? 1 : -1);
            if (n >= 1 && n <= this.cfg.maxServers) this.set('servers', n);
            this.$ctrls.querySelector('[data-out="servers"]').textContent = this.servers().filter(s => !s.draining).length;
          }
        });
      });
    }
    // Recharge un chapitre (même lecteur, autre réglage)
    setScenario(setup, controls, goal) {
      this.opts.setup = setup; this.opts.controls = controls; this.opts.goal = goal;
      if (this.paused) this.togglePause();
      this.load(setup || {}, controls, goal);
    }

    renderLegend() {
      const items = [['req', 'requête'], ['res', 'réponse OK'], ['err', 'erreur']];
      if (this.kind === 'lb' && this.cfg.health) items.push(['hc', 'health check']);
      if (this.kind === 'cache') items.push(['miss', 'cache miss']);
      if (this.kind === 'queue' && this.cfg.mode === 'async') items.push(['job', 'message'], ['ack', 'acquittement']);
      const kill = this.controls.includes('kill') ? `<span>👆 clique sur ${this.kind === 'lb' ? 'un serveur' : this.kind === 'cache' ? 'le cache ou la base' : 'un worker'} pour le mettre en panne</span>` : '';
      this.$legend.innerHTML = items.map(([c, l]) => `<span><i class="sim-p ${c}"></i>${l}</span>`).join('') + kill;
    }

    renderGoal(progress) {
      if (!this.goal) { this.$goal.classList.add('hidden'); return; }
      this.$goal.classList.remove('hidden');
      this.$goal.classList.toggle('done', this.goalDone);
      const p = this.goalDone ? 1 : (progress || 0);
      this.$goal.innerHTML = `<span>${this.goalDone ? '✅' : '🎯'}</span><span>${esc(this.goal.text)}</span><i style="width:${Math.round(p * 100)}%"></i>`;
    }

    /* ================= Rendu : métriques ================= */
    renderMetrics() {
      const m = this.m, cards = [];
      const card = (label, val, state, tip) => cards.push(`<div class="sim-m ${state || ''}" title="${esc(tip || '')}"><div class="small">${label}</div><b>${val}</b></div>`);
      const errState = m.err > 0.05 ? 'bad' : m.err > 0.01 ? 'warn' : 'ok';
      card('Débit servi', m.rps + ' req/s', '', 'Réponses réussies par seconde (temps réel équivalent)');
      card('Latence p95', m.n ? m.p95 + ' ms' : '—', m.p95 > 600 ? 'bad' : m.p95 > 300 ? 'warn' : 'ok', '95 % des requêtes réussies sont plus rapides que cette valeur');
      card('Erreurs', m.n ? (m.err * 100).toFixed(1) + ' %' : '—', m.n ? errState : '', 'Part des requêtes en échec (503, 504…) sur les 4 dernières secondes d\'animation');
      if (this.kind === 'lb') {
        if (!this.cfg.noLB) card('Serveurs dans le pool', `${m.pool} / ${m.servers}`, m.pool < m.servers ? 'warn' : '');
        card('Charge du pool', Math.round(m.load * 100) + ' %', m.load > 0.9 ? 'bad' : m.load > 0.75 ? 'warn' : 'ok', 'Requêtes en cours ou en attente / capacité');
        if (this.cfg.session !== 'off') card('Sessions perdues', m.lost + ' /s', m.lost ? 'bad' : 'ok', 'Utilisateurs déconnectés parce que leur requête arrive sur un serveur qui ne connaît pas leur session');
      } else if (this.kind === 'cache') {
        card('Taux de hit', this.cacheOn() ? Math.round(m.hit * 100) + ' %' : '—', m.hit > 0.8 ? 'ok' : m.hit > 0.5 ? 'warn' : '');
        card('Charge de la base', Math.round(m.db * 100) + ' %', m.db > 1 ? 'bad' : m.db > 0.7 ? 'warn' : 'ok', 'Requêtes en cours + en attente / connexions disponibles (au-delà de 100 % : file d\'attente)');
        if (this.cfg.writes) card('Lectures périmées', Math.round(m.stale * 100) + ' %', m.stale > 0.02 ? 'bad' : 'ok', 'Lectures servies par le cache alors que la base contient une version plus récente');
      } else {
        if (this.cfg.mode === 'async') {
          card('Messages en attente', m.depth, m.depth > 100 ? 'bad' : m.depth > 20 ? 'warn' : 'ok');
          card('Âge du plus ancien', m.age + ' ms', m.age > 3000 ? 'warn' : '');
        }
        card('Traitements terminés', m.done + ' /s');
        if (this.cfg.poison) card('DLQ', m.dlq, m.dlq ? 'warn' : '');
      }
      this.$metrics.innerHTML = cards.join('');
    }
    renderSparks() {
      const S = this.series;
      const line = (key, max) => S.map((p, i) => `${(i * 100 / 59).toFixed(1)},${(30 - Math.min(1, p[key] / max) * 28).toFixed(1)}`).join(' ');
      const mx = k => Math.max(1, ...S.map(p => p[k]));
      const last = S[S.length - 1] || { rps: 0, p95: 0, err: 0 };
      const spark = (k, label, unit, cls) => `<div class="sim-spark ${cls}"><div class="small">${label} <b>${k === 'err' ? last[k].toFixed(1) : last[k]} ${unit}</b> <span class="muted">(max ${k === 'err' ? mx(k).toFixed(1) : mx(k)})</span></div><svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points="${line(k, mx(k))}"/></svg></div>`;
      this.$sparks.innerHTML = spark('rps', 'Débit', 'req/s', 'a') + spark('p95', 'Latence p95', 'ms', 'b') + spark('err', 'Erreurs', '%', 'c');
    }

    log(txt) {
      const li = document.createElement('li');
      li.textContent = txt;
      this.$log.prepend(li);
      while (this.$log.children.length > 30) this.$log.lastChild.remove();
    }
    flash(id, txt, cls) {
      const n = this.nodes[id];
      if (!n || this.gFx.childNodes.length > 24) return;
      const t = svgEl('text', { x: n.dx, y: n.dy - 40, class: 'sim-fx ' + (cls || ''), 'text-anchor': 'middle' }, this.gFx);
      t.textContent = txt;
      t.addEventListener('animationend', () => t.remove());
      setTimeout(() => t.remove(), 1600);
    }

    /* ================= Rendu : canevas ================= */
    edges() {
      const E = [], n = this.nodes, c = this.cfg;
      const add = (a, b, cls) => { if (n[a] && n[b] && !n[a].hidden && !n[b].hidden && !n[a].removed && !n[b].removed) E.push([a, b, cls || '']); };
      if (this.kind === 'lb') {
        if (c.noLB) this.servers().forEach(s => add('client', s.id));
        else {
          add('client', 'lb');
          this.servers().forEach(s => add('lb', s.id, !s.up ? 'down' : (s.booting || s.draining || (c.health && !s.inPool)) ? 'off' : ''));
        }
        if (c.session === 'shared') this.servers().forEach(s => add(s.id, 'redis', 'thin'));
      } else if (this.kind === 'cache') {
        add('client', 'app'); add('app', 'db', this.nodes.db.up ? '' : 'down');
        if (this.cacheOn()) add('app', 'cache', this.nodes.cache.up ? '' : 'down');
      } else {
        add('client', 'api');
        this.workers().forEach(w => {
          if (c.mode === 'async') add('queue', w.id, w.up ? (w.booting ? 'off' : '') : 'down');
          else add('api', w.id, w.up ? (w.booting ? 'off' : '') : 'down');
          if (c.poison) add(w.id, 'dlq', 'thin');
        });
        if (c.mode === 'async') add('api', 'queue');
      }
      return E;
    }

    nodeSub(nd) {
      const c = this.cfg;
      switch (nd.type) {
        case 'client': return Math.round(c.rps * this.mult) + ' req/s' + (this.mult > 1 ? ' ⚡' : '');
        case 'lb': return ALGOS[c.algo];
        case 'server':
        case 'worker':
          if (nd.removed) return '';
          if (!nd.up) return '💥 en panne';
          if (nd.booting) return '⏳ démarrage…';
          if (nd.draining) return '🚿 draining';
          if (nd.type === 'server' && c.health && !nd.inPool) return '🚫 hors pool';
          return `${nd.busy}/${nd.cap} actives${nd.q.length ? ' · file ' + nd.q.length : ''}`;
        case 'cache': return !this.cacheOn() ? 'désactivé' : !nd.up ? '💥 en panne' : `${this.cache.size}/${c.cacheSize} clés`;
        case 'db': return !nd.up ? '💥 en panne' : `${nd.busy}/${nd.cap} connexions${nd.q.length ? ' · file ' + nd.q.length : ''}`;
        case 'app': return `${nd.busy} en cours${nd.q.length ? ' · file ' + nd.q.length : ''}`;
        case 'queue': return `${this.jobs.length} message${this.jobs.length > 1 ? 's' : ''}`;
        case 'dlq': return `${this.counters.dlq} en échec`;
        default: return nd.sublabel || '';
      }
    }
    nodeLoad(nd) {
      if (nd.type === 'queue') return Math.min(1, this.jobs.length / 100);
      if (['server', 'worker', 'db', 'app', 'cache'].includes(nd.type)) return Math.min(1, (nd.busy + nd.q.length) / (nd.cap + nd.qmax || 1));
      return -1;
    }

    draw() {
      // positions lissées (les serveurs ajoutés/retirés glissent à leur place)
      Object.values(this.nodes).forEach(nd => { nd.dx += (nd.x - nd.dx) * 0.15; nd.dy += (nd.y - nd.dy) * 0.15; });
      // liens
      const E = this.edges(), seen = {};
      E.forEach(([a, b, cls]) => {
        const k = a + '>' + b; seen[k] = 1;
        let l = this.edgeEls[k];
        if (!l) l = this.edgeEls[k] = svgEl('line', {}, this.gEdges);
        const A = this.nodes[a], B = this.nodes[b];
        l.setAttribute('x1', A.dx.toFixed(1)); l.setAttribute('y1', A.dy.toFixed(1));
        l.setAttribute('x2', B.dx.toFixed(1)); l.setAttribute('y2', B.dy.toFixed(1));
        l.setAttribute('class', 'sim-edge ' + cls);
      });
      Object.keys(this.edgeEls).forEach(k => { if (!seen[k]) { this.edgeEls[k].remove(); delete this.edgeEls[k]; } });
      // nœuds
      Object.values(this.nodes).forEach(nd => {
        const show = !nd.hidden && !nd.removed;
        if (!nd.el) {
          if (!show) return;
          const g = nd.el = svgEl('g', { class: 'sim-node t-' + nd.type, 'data-node': nd.id }, this.gNodes);
          svgEl('rect', { x: -88, y: -30, width: 176, height: 60, rx: 12, class: 'sim-card' }, g);
          svgEl('text', { x: -66, y: 8, class: 'sim-icon', 'text-anchor': 'middle' }, g).textContent = nd.icon;
          svgEl('text', { x: -46, y: -5, class: 'sim-label' }, g).textContent = nd.label;
          nd.subEl = svgEl('text', { x: -46, y: 13, class: 'sim-sub' }, g);
          svgEl('rect', { x: -76, y: 20, width: 152, height: 4, rx: 2, class: 'sim-bar-bg' }, g);
          nd.barEl = svgEl('rect', { x: -76, y: 20, width: 0, height: 4, rx: 2, class: 'sim-bar' }, g);
          nd.dotEl = svgEl('circle', { cx: 76, cy: -18, r: 4, class: 'sim-status' }, g);
          if (this.controls.includes('kill') && ['server', 'cache', 'worker', 'db'].includes(nd.type)) g.classList.add('killable');
        }
        nd.el.style.display = show ? '' : 'none';
        if (!show) return;
        nd.el.setAttribute('transform', `translate(${nd.dx.toFixed(1)},${nd.dy.toFixed(1)})`);
        const sub = this.nodeSub(nd);
        if (nd._sub !== sub) { nd.subEl.textContent = sub; nd._sub = sub; }
        const ld = this.nodeLoad(nd);
        const state = !nd.up ? 'down' : nd.booting ? 'boot' : (nd.draining || (nd.type === 'server' && this.cfg.health && !nd.inPool)) ? 'off' : (nd.type === 'cache' && !this.cacheOn()) ? 'off' : ld > 0.85 ? 'hot' : ld > 0.5 ? 'warm' : 'ok';
        if (nd._state !== state) { nd.el.setAttribute('class', `sim-node t-${nd.type} s-${state}${nd.el.classList.contains('killable') ? ' killable' : ''}`); nd._state = state; }
        if (ld >= 0) { nd.barEl.setAttribute('width', (152 * ld).toFixed(1)); nd.barEl.style.display = ''; }
        else nd.barEl.style.display = 'none';
      });
      // particules
      this.parts.forEach(p => this.placeParticle(p));
    }

    destroy() {
      this.alive = false;
      cancelAnimationFrame(this.raf);
      document.removeEventListener('keydown', this.onKey);
      this.timers = []; this.parts = [];
    }
  }

  SimLab.ALGOS = ALGOS;
  SimLab.SLOW = SLOW;
  window.SimLab = SimLab;
})();
