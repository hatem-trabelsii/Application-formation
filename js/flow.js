/* FlowCanvas — canevas d'architecture vivant, dans l'esprit de freesystemdesign.com :
   des composants (client, load balancer, serveurs, cache, base, file, workers…) reliés par des flèches,
   du trafic qui circule (points), des compteurs « charge / capacité », une croix ✕ pour tuer un composant.
   Modèle de flux : à chaque image, les débits (requêtes/s) sont propagés depuis les clients ; chaque
   composant sert au plus sa capacité et rejette le reste. Les métriques sont calculées, pas scriptées.
   Mode éditable (« Construire ») : glisser-déposer, connexions, suppression, Play / Pause. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1000, H = 560, NW = 156, NH = 48;
  const HOP_MS = 2;                 // latence réseau intra-région par saut (ms)
  const DOT_SPEED = 230;            // px/s
  const MAX_DOTS = 900;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const ICONS = {
    client: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    lb: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 10.9l7.4-3.8M8.3 13.1l7.4 3.8"/>',
    app: '<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    db: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    cache: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    cdn: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    queue: '<path d="M3 12h4l2 3h6l2-3h4"/><path d="M5.5 5h13L21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/>',
    worker: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    store: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    dlq: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>'
  };
  // capacité en requêtes/s, temps de service de base en ms
  const TYPES = {
    client: { label: 'Client', color: '#60a5fa', sub: '', cap: 0, svc: 0, desc: 'Les utilisateurs' },
    lb: { label: 'Load balancer', color: '#a78bfa', sub: 'Répartit le trafic', cap: 1e6, svc: 1, desc: 'Répartit entre ses cibles saines' },
    app: { label: 'Serveur d\'app', color: '#4ade80', sub: 'Application', cap: 40, svc: 20, desc: 'Logique métier' },
    db: { label: 'Base de données', color: '#f472b6', sub: 'Persistante', cap: 30, svc: 15, desc: 'Persistante' },
    cache: { label: 'Cache', color: '#fbbf24', sub: 'En mémoire', cap: 5000, svc: 1, desc: 'En mémoire (Redis)' },
    cdn: { label: 'CDN', color: '#2dd4bf', sub: 'Près de l\'utilisateur', cap: 1e6, svc: 5, desc: 'Copie près des utilisateurs' },
    queue: { label: 'File', color: '#fb923c', sub: 'Tampon', cap: 1e6, svc: 2, desc: 'File de messages (SQS)' },
    worker: { label: 'Worker', color: '#a3e635', sub: 'Consommateur', cap: 10, svc: 100, desc: 'Traite les messages' },
    store: { label: 'Sessions', color: '#f97316', sub: 'Sessions (Redis)', cap: 5000, svc: 1, desc: 'Sessions partagées' },
    dlq: { label: 'DLQ', color: '#f87171', sub: 'Messages en échec', cap: 1e9, svc: 0, desc: 'Messages en échec' }
  };
  const KILLABLE = new Set(['lb', 'app', 'db', 'cache', 'cdn', 'queue', 'worker', 'store']);

  // Popularité des clés (loi de Zipf, 200 produits) : part des lectures pour la clé k
  const ZIPF = (() => { const p = []; let s = 0; for (let k = 1; k <= 200; k++) { p.push(1 / Math.pow(k, 1.1)); s += p[k - 1]; } return p.map(v => v / s); })();

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  class FlowCanvas {
    constructor(root, opts = {}) {
      this.root = root;
      this.o = opts;
      this.editable = !!opts.editable;
      this.running = !this.editable;          // mode Apprendre : toujours en marche ; Construire : Play
      this.nodes = new Map();
      this.edges = [];
      this.t = 0;
      this.totals = { ok: 0, drop: 0 };
      this.m = {};
      this.seq = 0;
      this.dots = [];
      root.innerHTML = '';
      this.svg = el('svg', { class: 'fc-svg', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': opts.label || 'Schéma d\'architecture' }, root);
      const defs = el('defs', {}, this.svg);
      const mk = el('marker', { id: 'fcArrow' + (FlowCanvas.n = (FlowCanvas.n || 0) + 1), viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M0 1 L9 5 L0 9 z', class: 'fc-arrow' }, mk);
      this.arrowId = mk.id;
      const rg = el('radialGradient', { id: 'fcGlow' + FlowCanvas.n, cx: '50%', cy: '45%', r: '65%' }, defs);
      el('stop', { offset: '0%', 'stop-color': '#16203a', 'stop-opacity': 0.55 }, rg);
      el('stop', { offset: '100%', 'stop-color': '#07080b', 'stop-opacity': 0 }, rg);
      el('rect', { x: -2000, y: -2000, width: 5000, height: 5000, fill: `url(#${rg.id})`, class: 'fc-bg' }, this.svg);
      this.gEdges = el('g', {}, this.svg);
      this.gDots = el('g', {}, this.svg);
      this.gNodes = el('g', {}, this.svg);
      this.gFx = el('g', {}, this.svg);
      this.tmpLine = el('line', { class: 'fc-tmp hidden', 'marker-end': `url(#${this.arrowId})` }, this.svg);
      this.bindPointer();
      if (opts.graph) this.setGraph(opts.graph, { instant: true });
      this.refit(true);
      this.onResize = () => this.refit();
      window.addEventListener('resize', this.onResize);
      this.last = performance.now();
      this.frame = this.frame.bind(this);
      this.raf = requestAnimationFrame(this.frame);
    }

    /* ================= Graphe ================= */
    makeNode(spec) {
      const T = TYPES[spec.type];
      const n = Object.assign({ label: T.label, sub: T.sub, cap: T.cap, svc: T.svc }, spec);
      n.id = n.id || spec.type + '-' + (++this.seq);
      n.alive = n.alive !== false;
      n.boot = n.boot || 0;          // secondes restantes de démarrage
      n.dx = n.x; n.dy = n.y; n.op = 0;
      n.in = 0; n.served = 0; n.drop = 0; n.depth = n.depth || 0; n.warm = n.type === 'cache' ? 1 : 1;
      n.killedAt = -1e9; n.revivedAt = -1e9;
      return n;
    }
    // Remplace le graphe. Les nœuds de même id glissent vers leur nouvelle place, les autres apparaissent en fondu.
    setGraph(g, opts = {}) {
      const keep = new Map(this.nodes);
      this.nodes = new Map();
      (g.nodes || []).forEach(spec => {
        const old = keep.get(spec.id);
        const n = this.makeNode(spec);
        if (old && old.type === n.type && !opts.instant) {
          n.dx = old.dx; n.dy = old.dy; n.op = old.op; n.depth = old.depth;
          if (old.g) old.g.remove();          // nouveau DOM, même place : la carte glisse sans clignoter
          keep.delete(spec.id);
        }
        else if (opts.instant) n.op = 1;
        this.nodes.set(n.id, n);
      });
      keep.forEach(n => { if (n.g) { n.g.classList.add('fc-gone'); const gg = n.g; setTimeout(() => gg.remove(), 400); } });
      this.geo = !!g.geo;
      this.edges = (g.edges || []).filter(([a, b]) => this.nodes.has(a) && this.nodes.has(b)).map(([a, b, o]) => Object.assign({ a, b }, o || {}));
      this.gEdges.textContent = '';
      this.edges.forEach(e => this.drawEdge(e));
      this.dots.forEach(d => d.el.remove()); this.dots = [];
      this.lastT = {};
      this.compute(0);
      this.changed();
    }
    getGraph() {
      return {
        nodes: [...this.nodes.values()].filter(n => !n.auto).map(n => {
          const o = { id: n.id, type: n.type, x: Math.round(n.x), y: Math.round(n.y) };
          ['label', 'sub', 'cap', 'rps', 'algo', 'health', 'autoscale', 'sessions', 'size', 'ttl', 'writes', 'invalidate', 'hit', 'poison', 'wave', 'locked'].forEach(k => { if (n[k] !== undefined && n[k] !== TYPES[n.type][k]) o[k] = n[k]; });
          return o;
        }),
        edges: this.edges.map(e => (e.lat != null ? [e.a, e.b, { lat: e.lat }] : [e.a, e.b])),
        geo: this.geo
      };
    }
    node(id) { return this.nodes.get(id); }
    client() { return [...this.nodes.values()].find(n => n.type === 'client'); }
    byType(t) { return [...this.nodes.values()].filter(n => n.type === t); }
    // latence aller-retour d'un saut (ms) ; en mode « géographique », la distance sur le canevas = la distance réelle
    hopLat(a, b) {
      const e = this.edges.find(x => x.a === a.id && x.b === b.id);
      if (e && e.lat != null) return e.lat;
      if (this.geo) return Math.max(2, Math.round((Math.hypot(a.x - b.x, a.y - b.y) - 160) * 0.42));
      return HOP_MS;
    }
    // Ajuste le nombre d'enfants d'un type sous un parent (ex. serveurs derrière le LB) ;
    // les nouveaux héritent des liens sortants des existants.
    setKids(parentId, type, count, spec) {
      const p = this.nodes.get(parentId); if (!p) return;
      let kids = this.outs(p).filter(k => k.type === type);
      while (kids.length < count) {
        const tpl = kids[0] || Object.assign({ x: p.x + 300, y: p.y }, spec);
        const n = this.addNode(Object.assign({ type, x: tpl.x, y: tpl.y, cap: tpl.cap }, spec || {}));
        n.dx = tpl.x; n.dy = tpl.y;
        const ne = { a: p.id, b: n.id }; this.edges.push(ne); this.drawEdge(ne);
        if (kids[0]) this.edges.filter(e => e.a === kids[0].id).forEach(e => { const x = { a: n.id, b: e.b }; this.edges.push(x); this.drawEdge(x); });
        kids = this.outs(p).filter(k => k.type === type);
      }
      while (kids.length > count) { this.removeNode(kids[kids.length - 1].id); kids = this.outs(p).filter(k => k.type === type); }
      this.layoutColumn(p, type);
      this.changed();
    }
    outs(n) { return this.edges.filter(e => e.a === n.id).map(e => this.nodes.get(e.b)).filter(Boolean); }
    ins(n) { return this.edges.filter(e => e.b === n.id).map(e => this.nodes.get(e.a)).filter(Boolean); }
    addEdge(a, b) {
      if (a === b || !this.nodes.has(a) || !this.nodes.has(b)) return false;
      if (this.nodes.get(b).type === 'client') return false;
      if (this.edges.some(e => (e.a === a && e.b === b) || (e.a === b && e.b === a))) return false;
      const e = { a, b }; this.edges.push(e); this.drawEdge(e); this.changed(); return true;
    }
    removeEdge(e) { this.edges = this.edges.filter(x => x !== e); if (e.el) e.el.remove(); if (e.hit) e.hit.remove(); this.changed(); }
    addNode(spec) {
      const n = this.makeNode(spec);
      this.nodes.set(n.id, n);
      this.changed();
      return n;
    }
    removeNode(id) {
      const n = this.nodes.get(id); if (!n) return;
      this.edges.filter(e => e.a === id || e.b === id).forEach(e => this.removeEdge(e));
      this.nodes.delete(id);
      if (n.g) { n.g.classList.add('fc-gone'); setTimeout(() => n.g.remove(), 300); }
      this.changed();
    }
    set(id, k, v) { const n = this.nodes.get(id); if (n) { n[k] = v; if (n.g) this.refreshNodeDom(n); } }
    kill(id, on) {
      const n = this.nodes.get(id); if (!n || !KILLABLE.has(n.type)) return;
      const alive = on === undefined ? !n.alive : !on;
      if (alive === n.alive) return;
      n.alive = alive;
      if (alive) { n.revivedAt = this.t; if (n.type === 'cache' || n.type === 'cdn') n.warm = 0; }
      else { n.killedAt = this.t; n.kills = (n.kills || 0) + 1; if (n.type === 'queue') n.depth = 0; }
      this.fx(n, alive ? 'redémarré' : 'EN PANNE', alive ? 'ok' : 'bad');
      if (this.o.onKill) this.o.onKill(n, alive);
    }
    changed() { this.refit(); if (this.o.onChange) this.o.onChange(this); }
    // Cadrage : la vue se resserre sur les composants (changements de structure seulement, pas pendant un glisser)
    refit(instant) {
      if (!this.o.fit) return;
      const r = this.svg.getBoundingClientRect();
      const aspect = r.width > 10 && r.height > 10 ? r.width / r.height : W / H;
      const ns = [...this.nodes.values()];
      const t = FlowCanvas.fitRect(ns.length ? ns : [{ x: W / 2, y: H / 2 }], NW, NH, aspect, this.editable ? 960 : 900, this.editable ? 60 : 70);
      this.vbT = t;
      if (instant || !this.vb) this.applyVB(this.vb = Object.assign({}, t));
    }
    applyVB(b) { this.svg.setAttribute('viewBox', `${b.x.toFixed(1)} ${b.y.toFixed(1)} ${b.w.toFixed(1)} ${b.h.toFixed(1)}`); }

    /* ================= Modèle de flux ================= */
    clientRate(n) {
      let r = n.rps || 0;
      if (n.wave) {   // vagues automatiques : base, pic, période (s), durée du pic (s)
        const ph = this.t % n.wave.period;
        r = ph < n.wave.dur ? n.wave.peak : n.wave.base;
      }
      if (n.spikeUntil && this.t < n.spikeUntil) r *= n.spikeMult || 5;
      return r;
    }
    spike(id, mult, secs) {
      const n = id ? this.nodes.get(id) : [...this.nodes.values()].find(x => x.type === 'client');
      if (!n) return;
      n.spikeMult = mult || 5; n.spikeUntil = this.t + (secs || 6);
      n.spikes = (n.spikes || 0) + 1;
    }
    hitRatio(n, reads) {
      if (n.type === 'cdn') return n.hit != null ? n.hit : 0.85;
      if (n.hit != null) return n.hit;
      const size = Math.min(200, n.size != null ? n.size : 60), T = n.ttl != null ? n.ttl : 60, w = n.writesFrac || 0;
      let h = 0;
      for (let k = 0; k < size; k++) {
        const rk = reads * ZIPF[k], wk = reads / Math.max(1e-9, 1 - w) * w * ZIPF[k];
        const Te = n.invalidate ? T / (1 + wk * T) : T;   // invalidation : chaque écriture vide l'entrée
        h += ZIPF[k] * (rk * Te / (1 + rk * Te));
      }
      return h;
    }
    staleRatio(n, reads) {
      const w = n.writesFrac || 0;
      if (!w || n.invalidate) return 0;
      const size = Math.min(200, n.size != null ? n.size : 60), T = n.ttl != null ? n.ttl : 60;
      let s = 0, tot = 0;
      for (let k = 0; k < size; k++) {
        const wk = reads / (1 - w) * w * ZIPF[k];
        const x = wk * T;
        const p = x < 1e-6 ? x / 2 : 1 - (1 - Math.exp(-x)) / x;    // part du temps où la copie est dépassée
        s += ZIPF[k] * p; tot += ZIPF[k];
      }
      return tot ? s / tot : 0;
    }
    // Un composant cible reçoit-il du trafic de ce load balancer ? (health checks : détection en ~2 s)
    lbTargets(lb, kids) {
      const health = lb.health !== false;
      return kids.filter(k => {
        if (k.boot > 0) return false;
        if (!health) return true;
        if (!k.alive) return this.t - k.killedAt < 2;           // pas encore détecté
        return this.t - k.revivedAt >= 2 || k.revivedAt < 0;     // doit repasser 2 contrôles
      });
    }

    compute(dt) {
      const N = [...this.nodes.values()];
      N.forEach(n => { n.in = 0; n.served = 0; n.drop = 0; n.lost = 0; n.stale = 0; n.hitNow = null; });
      const flow = {};                       // 'a>b' → requêtes/s
      const send = (a, b, r) => { if (r <= 0 || !b) return; flow[a.id + '>' + b.id] = (flow[a.id + '>' + b.id] || 0) + r; b.in += r; };
      // ordre topologique (Kahn) ; les cycles éventuels sont ignorés
      const indeg = new Map(N.map(n => [n.id, 0]));
      this.edges.forEach(e => indeg.set(e.b, indeg.get(e.b) + 1));
      const order = [], q = N.filter(n => indeg.get(n.id) === 0);
      while (q.length) { const n = q.shift(); order.push(n); this.outs(n).forEach(c => { indeg.set(c.id, indeg.get(c.id) - 1); if (indeg.get(c.id) === 0) q.push(c); }); }
      let unrouted = 0, lost = 0, totalIn = 0;
      order.forEach(n => {
        const kids = this.outs(n);
        const byType = t => kids.filter(k => k.type === t);
        switch (n.type) {
          case 'client': {
            const r = this.clientRate(n); n.served = r; totalIn += r;
            if (!kids.length) { unrouted += r; break; }
            kids.forEach(k => send(n, k, r / kids.length));
            break;
          }
          case 'lb': {
            if (!n.alive) { n.drop = n.in; break; }
            n.served = n.in;
            const tg = this.lbTargets(n, kids);
            if (!tg.length) { n.drop = n.in; break; }
            let w;
            if (n.algo === 'least') w = tg.map(k => (k.alive ? k.cap : k.cap * 0.05));
            else w = tg.map(() => 1);
            const sw = w.reduce((a, b) => a + b, 0);
            const shares = w.map(x => x / sw);
            tg.forEach((k, i) => send(n, k, n.in * shares[i]));
            // sessions stockées dans la mémoire de chaque serveur : perdues si l'utilisateur change de serveur
            // (probabilité que deux requêtes successives d'un même utilisateur tombent sur des serveurs différents)
            const ai = tg.map((k, i) => (k.type === 'app' ? i : -1)).filter(i => i >= 0);
            const S = ai.reduce((a, i) => a + shares[i], 0);
            if (n.sessions && ai.length > 1 && n.algo !== 'iphash' && ai.some(i => !this.outs(tg[i]).some(c => c.type === 'store'))) {
              n.lost = n.in * S * (1 - ai.reduce((a, i) => a + Math.pow(shares[i] / S, 2), 0));
              lost += n.lost;
            }
            break;
          }
          case 'cache': case 'cdn': {
            if (!n.alive) { const dbs = kids; n.hitNow = 0; dbs.forEach(k => send(n, k, n.in / dbs.length)); break; }
            n.served = n.in;
            const h = this.hitRatio(n, n.in) * (n.warm != null ? n.warm : 1);
            n.hitNow = h;
            n.stale = this.staleRatio(n, n.in);
            kids.forEach(k => send(n, k, n.in * (1 - h) / kids.length));
            break;
          }
          case 'queue': {
            if (!n.alive) { n.drop = n.in; break; }
            const ws = byType('worker').filter(w => w.alive && w.boot <= 0);
            const poison = n.poison ? 0.1 : 0;
            const capW = ws.reduce((a, w) => a + w.cap, 0) / (1 + 2 * poison);   // un message empoisonné coûte 3 tentatives
            const out = Math.min(capW, n.in + n.depth / Math.max(dt, 0.05));
            n.served = n.in;
            n.drain = out;
            if (dt) n.depth = Math.max(0, Math.min(1e6, n.depth + (n.in - out) * dt));
            ws.forEach(w => send(n, w, capW ? out * w.cap / ws.reduce((a, x) => a + x.cap, 0) : 0));
            byType('dlq').forEach(d => send(n, d, n.in * poison));
            break;
          }
          case 'dlq': n.served = n.in; break;
          default: {      // app, db, worker, store : capacité limitée
            if (!n.alive) { n.drop = n.in; break; }
            n.served = Math.min(n.in, n.cap);
            n.drop = n.in - n.served;
            if (n.type !== 'app') break;
            const s = n.served, w = n.writes || 0;
            const caches = byType('cache'), dbs = byType('db'), queues = byType('queue'), stores = byType('store');
            const chain = kids.filter(k => ['app', 'lb', 'worker', 'cdn'].includes(k.type));
            caches.forEach(c => { c.writesFrac = w; if (c.alive) send(n, c, s * (1 - w) / caches.length); });
            let toDb = s;
            if (caches.length) {
              const readThrough = caches.every(c => this.outs(c).some(x => x.type === 'db'));
              const c0 = caches[0];
              const miss = c0.alive ? 1 - this.hitRatio(c0, s * (1 - w)) * (c0.warm != null ? c0.warm : 1) : 1;
              toDb = readThrough ? s * w : s * w + s * (1 - w) * miss;
            }
            dbs.forEach(d => send(n, d, toDb / dbs.length));
            queues.forEach(qn => send(n, qn, s / queues.length));
            stores.forEach(st => send(n, st, s));
            chain.forEach(k => send(n, k, s / chain.length));
          }
        }
      });
      // nœuds dans un cycle : pas de calcul (rare, signalé par le feedback)
      this.cyclic = order.length < N.length;
      this.flow = flow;
      // latence estimée (ms) : service × 1/(1 - ρ) (file d'attente M/M/1, plafonnée), pondérée par les débits
      const memo = new Map();
      const lat = (n, depth) => {
        if (memo.has(n.id)) return memo.get(n.id);
        if (depth > 30) return 0;
        const rho = n.cap ? Math.min(0.95, n.in / n.cap) : 0;
        let L = n.type === 'queue' ? 2 : n.svc / (1 - rho);
        if (n.type !== 'queue' && n.type !== 'client') {
          const base = n.served || n.in;
          this.outs(n).forEach(k => { const f = flow[n.id + '>' + k.id] || 0; if (base > 0 && f > 0) L += (f / base) * (this.hopLat(n, k) + lat(k, depth + 1)); });
        }
        memo.set(n.id, L); return L;
      };
      let latSum = 0, latW = 0;
      N.filter(n => n.type === 'client').forEach(c => this.outs(c).forEach(k => { const f = flow[c.id + '>' + k.id] || 0; latSum += f * (this.hopLat(c, k) + lat(k, 0)); latW += f; }));
      const drop = Math.min(totalIn, N.reduce((a, n) => a + n.drop, 0) + unrouted);
      const ok = Math.max(0, totalIn - drop);
      const caches = N.filter(n => n.type === 'cache' && n.in > 0);
      const queues = N.filter(n => n.type === 'queue');
      const qDepth = queues.reduce((a, x) => a + x.depth, 0), qDrain = queues.reduce((a, x) => a + (x.drain || 0), 0);
      if (dt && this.running) { this.totals.ok += ok * dt; this.totals.drop += drop * dt; this.totals.dlq = (this.totals.dlq || 0) + N.filter(n => n.type === 'dlq').reduce((a, n) => a + n.in, 0) * dt; }
      this.m = {
        in: totalIn, ok, drop, err: totalIn ? drop / totalIn : 0, unrouted,
        lat: latW ? Math.round(latSum / latW) : 0,
        overloaded: N.filter(n => n.alive && n.cap && n.in > n.cap * 1.001 && n.type !== 'client').length,
        lost,
        hit: caches.length ? caches.reduce((a, c) => a + (c.hitNow || 0) * c.in, 0) / caches.reduce((a, c) => a + c.in, 0) : null,
        stale: caches.length ? caches.reduce((a, c) => a + c.stale * c.in, 0) / caches.reduce((a, c) => a + c.in, 0) : 0,
        depth: qDepth, age: qDrain > 0 ? qDepth / qDrain : (qDepth > 0 ? Infinity : 0),
        dlq: this.totals.dlq || 0,
        nodes: N.length, edges: this.edges.length,
        processed: this.totals.ok, dropped: this.totals.drop,
        dbLoad: Math.max(0, ...N.filter(n => n.type === 'db').map(n => n.in / n.cap))
      };
    }

    // auto-scaling : serveurs derrière un LB (charge) et workers derrière une file (profondeur)
    autoscale(dt) {
      this.scaleT = (this.scaleT || 0) + dt;
      if (this.scaleT < 1) return;
      this.scaleT = 0;
      this.nodes.forEach(lb => {
        if (lb.type === 'lb' && lb.autoscale) {
          const kids = this.outs(lb).filter(k => k.type === 'app');
          if (!kids.length) return;
          const up = kids.filter(k => k.alive && k.boot <= 0);
          const util = up.length ? up.reduce((a, k) => a + k.in, 0) / up.reduce((a, k) => a + k.cap, 0) : 1;
          const booting = kids.some(k => k.boot > 0);
          const max = lb.autoscale.max || 8, min = lb.autoscale.min || 2;
          lb.hi = util > 0.75 ? (lb.hi || 0) + 1 : 0;
          lb.lo = util < 0.3 ? (lb.lo || 0) + 1 : 0;
          if (lb.hi >= 2 && !booting && kids.length < max) {
            const tpl = kids[0];
            const n = this.addNode({ type: 'app', x: tpl.x, y: tpl.y, cap: tpl.cap, boot: lb.autoscale.boot || 3, auto: true });
            this.edges.push({ a: lb.id, b: n.id }); this.drawEdge(this.edges[this.edges.length - 1]);
            kids.forEach(k => this.edges.filter(e => e.a === k.id).forEach(e => { if (!this.edges.some(x => x.a === n.id && x.b === e.b)) { const ne = { a: n.id, b: e.b }; this.edges.push(ne); this.drawEdge(ne); } }));
            this.layoutColumn(lb, 'app');
            this.log(`📈 Auto-scaling : charge ${Math.round(util * 100)} % > 75 %, démarrage d'un serveur.`);
            lb.hi = 0;
          } else if (lb.lo >= 5 && kids.length > min) {
            const victim = [...kids].reverse().find(k => k.auto) || kids[kids.length - 1];
            this.removeNode(victim.id); this.layoutColumn(lb, 'app');
            this.log(`📉 Auto-scaling : charge ${Math.round(util * 100)} % < 30 %, un serveur est retiré.`);
            lb.lo = 0;
          }
        }
        if (lb.type === 'queue' && lb.autoscale) {
          const ws = this.outs(lb).filter(k => k.type === 'worker');
          if (!ws.length) return;
          const max = lb.autoscale.max || 8, min = lb.autoscale.min || 1;
          if (lb.depth > 4 * ws.length * ws[0].cap && ws.length < max && !ws.some(w => w.boot > 0)) {
            const n = this.addNode({ type: 'worker', x: ws[0].x, y: ws[0].y, cap: ws[0].cap, boot: 1.5, auto: true });
            const ne = { a: lb.id, b: n.id }; this.edges.push(ne); this.drawEdge(ne);
            this.layoutColumn(lb, 'worker');
            this.log(`📈 Auto-scaling : ${Math.round(lb.depth)} messages en attente, démarrage d'un worker.`);
          } else if (lb.depth < 1 && ws.length > min) {
            lb.lo = (lb.lo || 0) + 1;
            if (lb.lo >= 5) { const v = [...ws].reverse().find(k => k.auto) || ws[ws.length - 1]; this.removeNode(v.id); this.layoutColumn(lb, 'worker'); this.log('📉 Auto-scaling : file vide, un worker est arrêté.'); lb.lo = 0; }
          } else lb.lo = 0;
        }
      });
    }
    layoutColumn(parent, type) {
      const kids = this.outs(parent).filter(k => k.type === type);
      const n = kids.length; if (!n) return;
      const x = kids[0].x;
      const gap = n > 1 ? Math.min(110, 440 / (n - 1)) : 0;
      kids.forEach((k, i) => { k.x = x; k.y = parent.y + (i - (n - 1) / 2) * gap; k.y = Math.max(40, Math.min(H - 40, k.y)); });
    }
    log(t) { if (this.o.onLog) this.o.onLog(t); }

    /* ================= Boucle ================= */
    frame(now) {
      if (this.dead) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      if (this.running && !this.paused) {
        this.t += dt;
        this.nodes.forEach(n => {
          if (n.boot > 0) { n.boot -= dt; if (n.boot <= 0) { n.boot = 0; n.revivedAt = this.t; this.log(`🟢 ${n.label} a démarré et passe ses health checks.`); } }
          if (n.warm != null && n.warm < 1) n.warm = Math.min(1, n.warm + dt / 5);
        });
        this.compute(dt);
        this.autoscale(dt);
        this.spawnDots(dt);
        this.tick = (this.tick || 0) + dt;
        if (this.tick >= 0.25) { this.tick = 0; if (this.o.onMetrics) this.o.onMetrics(this.m, this); }
      } else if (!this.running) {
        this.compute(0);
      }
      this.draw(dt);
      this.raf = requestAnimationFrame(this.frame);
    }
    play() { this.running = true; this.paused = false; this.totals = { ok: 0, drop: 0 }; this.t = 0; this.nodes.forEach(n => { n.depth = 0; }); this.changed(); }
    stop() {
      this.running = false;
      this.dots.forEach(d => d.el.remove()); this.dots = [];
      this.nodes.forEach(n => { if (!n.alive) { n.alive = true; } n.depth = 0; });
      [...this.nodes.values()].filter(n => n.auto).forEach(n => this.removeNode(n.id));
      this.changed();
    }

    spawnDots(dt) {
      if (document.hidden) return;
      this.edges.forEach(e => {
        const f = (this.flow && this.flow[e.a + '>' + e.b]) || 0;
        if (f <= 0) return;
        const rate = Math.max(1.2, Math.min(26, f * 0.22));      // points par seconde (1 point ≠ 1 requête)
        e.acc = (e.acc || 0) + rate * dt;
        while (e.acc >= 1 && this.dots.length < MAX_DOTS) {
          e.acc -= 1;
          const a = this.nodes.get(e.a);
          const c = el('circle', { r: 2.6, class: 'fc-dot', fill: TYPES[a.type].color }, this.gDots);
          this.dots.push({ e, el: c, p: Math.random() * 0.04 });
        }
        if (e.acc > 3) e.acc = 0;
      });
      // trafic rejeté : petites particules rouges qui s'échappent du composant
      this.nodes.forEach(n => {
        if (n.drop <= 0.01 || !n.g) return;
        n.dacc = (n.dacc || 0) + Math.min(12, 1.5 + n.drop * 0.15) * dt;
        while (n.dacc >= 1) {
          n.dacc -= 1;
          const a = Math.random() * Math.PI * 2;
          const c = el('circle', { r: 2.4, class: 'fc-drop', cx: n.dx, cy: n.dy, style: `--dx:${Math.cos(a) * 46}px;--dy:${Math.sin(a) * 30 + 12}px` }, this.gFx);
          setTimeout(() => c.remove(), 900);
        }
      });
    }

    /* ================= Rendu ================= */
    drawEdge(e) {
      e.hit = el('line', { class: 'fc-ehit' }, this.gEdges);
      e.el = el('line', { class: 'fc-edge', 'marker-end': `url(#${this.arrowId})` }, this.gEdges);
      if (this.editable) {
        const del = ev => { ev.preventDefault(); ev.stopPropagation(); if (!this.running || this.o.editWhileRunning) this.removeEdge(e); };
        e.hit.addEventListener('contextmenu', del);
        e.hit.addEventListener('dblclick', del);
        this.longPress(e.hit, del);
      }
    }
    edgeEnds(A, B) {
      // la flèche s'arrête au bord de la carte cible
      const dx = B.dx - A.dx, dy = B.dy - A.dy, len = Math.hypot(dx, dy) || 1;
      const clip = (n, sgn) => {
        const tx = (NW / 2 + 4) / Math.abs(dx / len || 1e-9), ty = (NH / 2 + 4) / Math.abs(dy / len || 1e-9);
        const t = Math.min(tx, ty);
        return [n.dx + sgn * dx / len * t, n.dy + sgn * dy / len * t];
      };
      const [x1, y1] = clip(A, 1), [x2, y2] = clip(B, -1);
      return { x1, y1, x2, y2, len: Math.hypot(x2 - x1, y2 - y1) };
    }
    nodeDom(n) {
      const T = TYPES[n.type];
      const g = n.g = el('g', { class: 'fc-node t-' + n.type, 'data-id': n.id, style: `--c:${T.color}` }, this.gNodes);
      el('rect', { class: 'fc-card', x: -NW / 2, y: -NH / 2, width: NW, height: NH, rx: 9 }, g);
      el('rect', { class: 'fc-tile', x: -NW / 2 + 9, y: -14, width: 28, height: 28, rx: 7 }, g);
      const ic = el('g', { class: 'fc-ic', transform: `translate(${-NW / 2 + 13},-10) scale(0.84)` }, g);
      ic.innerHTML = ICONS[n.type] || '';
      n.tLabel = el('text', { class: 'fc-label', x: -NW / 2 + 45, y: -3 }, g);
      n.tSub = el('text', { class: 'fc-sub', x: -NW / 2 + 45, y: 12 }, g);
      n.barBg = el('rect', { class: 'fc-barbg', x: -NW / 2 + 45, y: 8, width: 52, height: 3, rx: 1.5 }, g);
      n.bar = el('rect', { class: 'fc-bar', x: -NW / 2 + 45, y: 8, width: 0, height: 3, rx: 1.5 }, g);
      n.tCount = el('text', { class: 'fc-count', x: NW / 2 - 9, y: 12, 'text-anchor': 'end' }, g);
      if (KILLABLE.has(n.type)) {
        const k = n.kx = el('g', { class: 'fc-kill', transform: `translate(${NW / 2 - 2},${-NH / 2 + 2})` }, g);
        el('circle', { r: 8 }, k);
        el('path', { d: 'M-3 -3 L3 3 M3 -3 L-3 3' }, k);
        el('title', {}, k).textContent = 'Mettre en panne / redémarrer';
        k.addEventListener('pointerdown', ev => ev.stopPropagation());
        k.addEventListener('click', ev => { ev.stopPropagation(); if (this.running) this.kill(n.id); });
      }
      if (this.editable) {
        const h = el('g', { class: 'fc-handle', transform: `translate(${NW / 2 + 10},0)` }, g);
        el('circle', { r: 9 }, h); el('path', { d: 'M-4 0 H4 M0 -4 V4' }, h);
        h.addEventListener('pointerdown', ev => this.startConnect(ev, n));
      }
      this.refreshNodeDom(n);
    }
    refreshNodeDom(n) {
      n.tLabel.textContent = n.label.length > 16 ? n.label.slice(0, 15) + '…' : n.label;
      n._sub = null;
    }
    nodeText(n) {
      if (n.type === 'client') return [`${Math.round(this.running ? this.clientRate(n) : (n.wave ? n.wave.base : n.rps || 0))} r/s${n.spikeUntil > this.t || (n.wave && this.t % n.wave.period < n.wave.dur && this.running) ? ' ⚡' : ''}`, '', -1];
      if (!n.alive) return ['En panne', '', -1];
      if (n.boot > 0) return ['Démarrage…', '', -1];
      if (n.type === 'queue') return [this.running ? `${Math.round(n.depth)} en attente` : n.sub, '', -1];
      if (n.type === 'cache' || n.type === 'cdn') {
        if (!this.running || n.hitNow == null || !n.in) return [n.sub, '', -1];
        return [`hit ${Math.round(n.hitNow * 100)} %${n.warm < 1 ? ' (à froid)' : ''}`, '', -1];
      }
      if (n.type === 'lb') return [n.sub, '', -1];
      if (n.type === 'dlq') return [`${Math.round(this.totals.dlq || 0)} message(s)`, '', -1];
      if (!this.running) return ['', `${n.cap} r/s`, 0];
      return ['', `${Math.round(n.in)}/${n.cap}`, Math.min(1, n.in / n.cap)];
    }
    draw(dt) {
      // positions lissées et fondu d'apparition
      const k = dt ? Math.min(1, dt * 9) : 1;
      if (this.vbT && this.vb) {
        const v = this.vb, t = this.vbT, kk = dt ? Math.min(1, dt * 5) : 1;
        if (Math.abs(v.x - t.x) + Math.abs(v.y - t.y) + Math.abs(v.w - t.w) + Math.abs(v.h - t.h) > 0.5) {
          v.x += (t.x - v.x) * kk; v.y += (t.y - v.y) * kk; v.w += (t.w - v.w) * kk; v.h += (t.h - v.h) * kk;
          this.applyVB(v);
        }
      }
      this.nodes.forEach(n => {
        n.dx += (n.x - n.dx) * k; n.dy += (n.y - n.dy) * k;
        if (n.op < 1) n.op = Math.min(1, n.op + (dt || 1) * 3);
        if (!n.g || !n.g.isConnected) this.nodeDom(n);
        n.g.setAttribute('transform', `translate(${n.dx.toFixed(1)},${n.dy.toFixed(1)})`);
        n.g.style.opacity = n.op < 1 ? n.op : '';
        const [sub, count, ld] = this.nodeText(n);
        const key = sub + '|' + count + '|' + (ld >= 0 ? Math.round(ld * 50) : -1);
        if (n._sub !== key) {
          n._sub = key;
          n.tSub.textContent = sub;
          n.tCount.textContent = count;
          const showBar = ld >= 0;
          n.bar.style.display = n.barBg.style.display = showBar ? '' : 'none';
          n.tSub.style.display = sub ? '' : 'none';
          if (showBar) n.bar.setAttribute('width', (52 * ld).toFixed(1));
        }
        const over = this.running && n.alive && n.cap && n.type !== 'client' && n.in > n.cap * 1.001;
        const state = !n.alive ? 'dead' : n.boot > 0 ? 'boot' : over ? 'over' : (this.running && n.cap && n.in > n.cap * 0.75 && n.type !== 'client') ? 'warm' : 'ok';
        if (n._state !== state) { n._state = state; n.g.setAttribute('class', `fc-node t-${n.type} s-${state}${n.sel ? ' sel' : ''}`); }
        if (n.type === 'client') n.tSub.setAttribute('class', 'fc-sub fc-rate');
      });
      this.edges.forEach(e => {
        const A = this.nodes.get(e.a), B = this.nodes.get(e.b);
        if (!A || !B) return;
        const p = this.edgeEnds(A, B);
        e.geo = p;
        [e.el, e.hit].forEach(l => { l.setAttribute('x1', p.x1.toFixed(1)); l.setAttribute('y1', p.y1.toFixed(1)); l.setAttribute('x2', p.x2.toFixed(1)); l.setAttribute('y2', p.y2.toFixed(1)); });
        const f = (this.flow && this.flow[e.a + '>' + e.b]) || 0;
        const cls = 'fc-edge' + (this.running && f > 0 ? ' live' : '') + (!B.alive ? ' dead' : '');
        if (e._cls !== cls) { e._cls = cls; e.el.setAttribute('class', cls); }
      });
      // points en mouvement
      if (dt) {
        this.dots = this.dots.filter(d => {
          const g = d.e.geo;
          if (!g || !this.edges.includes(d.e)) { d.el.remove(); return false; }
          d.p += DOT_SPEED * dt / Math.max(40, g.len);
          if (d.p >= 1) { d.el.remove(); return false; }
          d.el.setAttribute('cx', (g.x1 + (g.x2 - g.x1) * d.p).toFixed(1));
          d.el.setAttribute('cy', (g.y1 + (g.y2 - g.y1) * d.p).toFixed(1));
          return true;
        });
      }
    }
    fx(n, txt, cls) {
      const t = el('text', { x: n.dx, y: n.dy - NH / 2 - 10, class: 'fc-fx ' + (cls || ''), 'text-anchor': 'middle' }, this.gFx);
      t.textContent = txt;
      setTimeout(() => t.remove(), 1500);
    }

    /* ================= Édition (mode Construire) ================= */
    toSvg(ev) {
      const p = this.svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY;
      const m = this.svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
      const r = p.matrixTransform(m.inverse());
      return { x: r.x, y: r.y };
    }
    nodeAt(pt) {
      return [...this.nodes.values()].find(n => Math.abs(pt.x - n.dx) <= NW / 2 && Math.abs(pt.y - n.dy) <= NH / 2);
    }
    clampPos(p) {
      const v = this.vb || { x: 0, y: 0, w: W, h: H };
      return { x: Math.max(v.x + NW / 2 + 4, Math.min(v.x + v.w - NW / 2 - 14, p.x)), y: Math.max(v.y + NH / 2 + 6, Math.min(v.y + v.h - NH / 2 - 6, p.y)) };
    }
    addNodeAtClient(type, clientX, clientY) {
      const r = this.svg.getBoundingClientRect();
      let p;
      if (clientX == null || clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) p = this.freeSpot();
      else p = this.clampPos(this.toSvg({ clientX, clientY }));
      const n = this.addNode({ type, x: p.x, y: p.y });
      n.op = 0;
      return n;
    }
    freeSpot() {
      for (let i = 0; i < 60; i++) {
        const p = { x: 560 + ((i * 97) % 380) - 190, y: 280 + ((i * 61) % 400) - 200 };
        if (![...this.nodes.values()].some(n => Math.abs(n.x - p.x) < NW + 10 && Math.abs(n.y - p.y) < NH + 20)) return this.clampPos(p);
      }
      return { x: 500, y: 280 };
    }
    bindPointer() {
      this.svg.addEventListener('pointerdown', ev => {
        if (!this.editable || ev.button > 0) return;
        const pt = this.toSvg(ev), n = this.nodeAt(pt);
        this.nodes.forEach(x => { if (x.sel && x !== n) { x.sel = false; x._state = null; } });
        if (!n) return;
        n.sel = true; n._state = null;
        const off = { x: pt.x - n.x, y: pt.y - n.y };
        let moved = false;
        const t0 = Date.now();
        const lp = setTimeout(() => { if (!moved && ev.pointerType !== 'mouse') this.deleteNode(n); }, 650);
        const mv = e => {
          const p = this.toSvg(e);
          if (Math.hypot(p.x - pt.x, p.y - pt.y) > 3) moved = true;
          if (!moved) return;
          clearTimeout(lp);
          const c = this.clampPos({ x: p.x - off.x, y: p.y - off.y });
          n.x = n.dx = c.x; n.y = n.dy = c.y;
        };
        const up = () => { clearTimeout(lp); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); if (moved) this.changed(); void t0; };
        window.addEventListener('pointermove', mv);
        window.addEventListener('pointerup', up);
        ev.preventDefault();
      });
      this.svg.addEventListener('contextmenu', ev => {
        if (!this.editable) return;
        const n = this.nodeAt(this.toSvg(ev));
        if (n) { ev.preventDefault(); this.deleteNode(n); }
      });
      this.svg.addEventListener('dblclick', ev => {
        if (!this.editable) return;
        const n = this.nodeAt(this.toSvg(ev));
        if (n) { ev.preventDefault(); this.deleteNode(n); }
      });
    }
    deleteNode(n) {
      if (n.type === 'client' || n.locked) { this.fx(n, 'composant imposé', 'warn'); return; }
      if (this.running) { this.fx(n, 'Pause d\'abord', 'warn'); return; }
      this.removeNode(n.id);
    }
    startConnect(ev, from) {
      ev.stopPropagation(); ev.preventDefault();
      if (this.running && !this.o.editWhileRunning) { this.fx(from, 'Pause d\'abord', 'warn'); return; }
      const line = this.tmpLine;
      line.classList.remove('hidden');
      const mv = e => {
        const p = this.toSvg(e);
        line.setAttribute('x1', from.dx + NW / 2); line.setAttribute('y1', from.dy);
        line.setAttribute('x2', p.x); line.setAttribute('y2', p.y);
        this.nodes.forEach(n => n.g && n.g.classList.toggle('fc-target', n !== from && this.nodeAt(p) === n));
      };
      const up = e => {
        window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
        line.classList.add('hidden');
        this.nodes.forEach(n => n.g && n.g.classList.remove('fc-target'));
        const to = this.nodeAt(this.toSvg(e));
        if (to && to !== from) {
          if (!this.addEdge(from.id, to.id)) this.fx(to, to.type === 'client' ? 'le client ne reçoit rien' : 'déjà relié', 'warn');
        }
      };
      mv(ev);
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
    }
    longPress(target, fn) {
      let t;
      target.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; t = setTimeout(() => fn(e), 650); });
      ['pointerup', 'pointerleave', 'pointermove'].forEach(k => target.addEventListener(k, () => clearTimeout(t)));
    }

    destroy() {
      this.dead = true;
      cancelAnimationFrame(this.raf);
      window.removeEventListener('resize', this.onResize);
    }
  }

  // Vignette statique (catalogue) : le graphe d'une section, sans animation
  FlowCanvas.thumbSVG = function (g) {
    const nodes = g.nodes || [];
    const by = Object.fromEntries(nodes.map(n => [n.id, n]));
    const lines = (g.edges || []).filter(([a, b]) => by[a] && by[b]).map(([a, b]) => `<line x1="${by[a].x}" y1="${by[a].y}" x2="${by[b].x}" y2="${by[b].y}" class="fc-edge live"/>`).join('');
    const cards = nodes.map(n => { const T = TYPES[n.type]; return `<g transform="translate(${n.x},${n.y})" style="--c:${T.color}" class="fc-node t-${n.type}"><rect class="fc-card" x="${-NW / 2}" y="${-NH / 2}" width="${NW}" height="${NH}" rx="9"/><rect class="fc-tile" x="${-NW / 2 + 9}" y="-14" width="28" height="28" rx="7"/><g class="fc-ic" transform="translate(${-NW / 2 + 13},-10) scale(0.84)">${ICONS[n.type]}</g><text class="fc-label" x="${-NW / 2 + 45}" y="4">${esc(n.label || T.label)}</text></g>`; }).join('');
    return `<svg class="fc-svg fc-thumb" viewBox="${FlowCanvas.fitBox(nodes, NW, NH)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${lines}${cards}</svg>`;
  };
  // cadrage serré sur les composants (vignettes), au format 16:9
  FlowCanvas.fitBox = function (nodes, nw, nh, aspect, minW, pad) {
    const b = FlowCanvas.fitRect(nodes, nw, nh, aspect || 16 / 9, minW || 0, pad);
    return `${Math.round(b.x)} ${Math.round(b.y)} ${Math.round(b.w)} ${Math.round(b.h)}`;
  };
  FlowCanvas.fitRect = function (nodes, nw, nh, aspect, minW, pad) {
    if (!nodes.length) return { x: 0, y: 0, w: W, h: H };
    const px = pad != null ? pad : 30;
    let x0 = Math.min(...nodes.map(n => n.x)) - nw / 2 - px, x1 = Math.max(...nodes.map(n => n.x)) + nw / 2 + px;
    let y0 = Math.min(...nodes.map(n => n.y)) - nh / 2 - px - 20, y1 = Math.max(...nodes.map(n => n.y)) + nh / 2 + px + 10;
    let w = x1 - x0, h = y1 - y0;
    if (w < minW) { x0 -= (minW - w) / 2; w = minW; }
    if (w / h > aspect) { const h2 = w / aspect; y0 -= (h2 - h) / 2; h = h2; } else { const w2 = h * aspect; x0 -= (w2 - w) / 2; w = w2; }
    return { x: x0, y: y0, w, h };
  };
  FlowCanvas.TYPES = TYPES;
  FlowCanvas.ICONS = ICONS;
  FlowCanvas.iconSVG = (type, size) => `<svg viewBox="0 0 24 24" width="${size || 22}" height="${size || 22}" class="fc-ic">${ICONS[type] || ''}</svg>`;
  window.FlowCanvas = FlowCanvas;
})();
