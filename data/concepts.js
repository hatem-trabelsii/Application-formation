/* Concepts interactifs (mode « Apprendre » + défi « Construire »), dans l'esprit de freesystemdesign.com.
   Chaque section : un texte, un graphe (rendu en direct par js/flow.js) et, parfois, un encart « À toi »
   avec des réglages et un objectif mesuré. Les capacités sont en requêtes par seconde (r/s).
   Métriques disponibles dans les tests (m) : in, ok, drop, err (0..1), lat (ms), overloaded, lost, hit,
   stale, depth, age (s), dlq, dbLoad. */
(function () {
  const N = (id, type, x, y, o) => Object.assign({ id, type, x, y }, o || {});
  const client = fc => fc.client();
  const rps = (min, max, step) => ({ k: 'range', label: 'Trafic', min, max, step: step || 5, get: fc => client(fc).rps, set: (fc, v) => { client(fc).rps = v; }, fmt: v => v + ' r/s' });
  const spike = (mult, secs) => ({ k: 'button', label: `⚡ Pic ×${mult || 4}`, act: fc => fc.spike(null, mult || 4, secs || 6) });
  const apps = fc => fc.byType('app');

  /* ---------------- Load balancer ---------------- */
  const lbBase = (n, o) => ({
    nodes: [N('c', 'client', 110, 280, { rps: o.rps }), N('lb', 'lb', 380, 280, o.lb || {})]
      .concat(Array.from({ length: n }, (_, i) => N('s' + (i + 1), 'app', 690, 280 + (i - (n - 1) / 2) * Math.min(110, 400 / Math.max(1, n - 1)), (o.specs && o.specs[i]) || {})))
      .concat(o.extra || []),
    edges: [['c', 'lb']].concat(Array.from({ length: n }, (_, i) => ['lb', 's' + (i + 1)])).concat(o.extraEdges || [])
  });

  const LB = {
    id: 'lb', icon: 'lb', cat: 'Scalabilité', title: 'Load balancer',
    tagline: 'Un serveur ne suffit plus ? On en met plusieurs, et quelqu\'un répartit le trafic.',
    courses: ['aws-saa', 'aws-sysops', 'az-204', 'az-305', 'kubernetes', 'aws-sap'],
    sections: [
      {
        t: 'Un seul serveur a une limite',
        body: [
          'Tout commence avec **un seul serveur**. Il a une capacité finie : ici, **40 requêtes par seconde** (r/s). En dessous, tout va bien. Au-dessus, il ne peut pas aller plus vite.',
          'Les requêtes en trop attendent, puis sont **rejetées** : l\'utilisateur voit une erreur **503**. Sur le schéma, le compteur passe au rouge et des points rouges s\'échappent du serveur.',
          'Acheter un serveur plus gros (**scaling vertical**) repousse le problème, mais coûte cher et finit par atteindre un plafond. Et si ce serveur tombe, tout tombe.'
        ],
        graph: { nodes: [N('c', 'client', 170, 280, { rps: 30 }), N('s1', 'app', 640, 280)], edges: [['c', 's1']] },
        try: { controls: [rps(10, 120)], goal: { text: 'Monte le trafic jusqu\'à ce que plus de 10 % des requêtes soient rejetées.', test: m => m.in >= 45 && m.err > 0.1 } }
      },
      {
        t: 'Plusieurs serveurs derrière un load balancer',
        body: [
          'Plutôt qu\'un gros serveur, on en met **plusieurs identiques** : c\'est le **scaling horizontal**.',
          'Le **load balancer** devient l\'unique porte d\'entrée. Les clients ne connaissent que lui, et il répartit les requêtes entre les serveurs.',
          'Sur AWS, c\'est un **ALB** (HTTP, couche 7) ou un **NLB** (TCP, couche 4). Sur Azure, **Application Gateway** ou **Load Balancer**. Dans Kubernetes, un **Service** ou un **Ingress**.'
        ],
        graph: lbBase(2, { rps: 100 }),
        try: {
          controls: [{ k: 'stepper', label: 'Serveurs', min: 1, max: 6, get: fc => apps(fc).length, set: (fc, v) => fc.setKids('lb', 'app', v) }],
          goal: { text: 'Sers 100 r/s sans aucun rejet. Chaque serveur tient 40 r/s.', test: m => m.in >= 100 && m.drop === 0 }
        }
      },
      {
        t: 'Round robin ou moins de connexions ?',
        body: [
          '**Round robin** envoie les requêtes à tour de rôle : 1, 2, 3, 1, 2, 3… C\'est simple et équitable, à condition que **tous les serveurs soient identiques**.',
          'Ici, le troisième est un **ancien modèle** qui ne tient que 15 r/s. Il reçoit pourtant un tiers du trafic, et il déborde.',
          '**Moins de connexions** (*least outstanding requests* sur un ALB) envoie chaque requête au serveur le moins occupé. Un serveur lent garde ses requêtes plus longtemps, donc il en reçoit naturellement moins. Le **hachage IP**, lui, envoie toujours un même client vers le même serveur.'
        ],
        graph: lbBase(3, { rps: 85, lb: { algo: 'rr' }, specs: [null, null, { cap: 15, label: 'Serveur (ancien)' }] }),
        try: {
          controls: [{ k: 'select', label: 'Algorithme', options: [['rr', 'Round robin'], ['least', 'Moins de connexions'], ['iphash', 'Hachage IP']], get: fc => fc.node('lb').algo || 'rr', set: (fc, v) => fc.set('lb', 'algo', v) }],
          goal: { text: 'À 85 r/s, trouve l\'algorithme qui supprime tous les rejets.', test: m => m.in >= 85 && m.drop === 0 }
        }
      },
      {
        t: 'Health checks : oublier les serveurs morts',
        body: [
          'Un serveur peut tomber à tout moment. **Clique sur la croix rouge ✕ d\'un serveur** pour le mettre en panne.',
          'Sans contrôle, le load balancer continue de lui envoyer sa part : un tiers des requêtes **expire** (erreur 504).',
          'Avec les **health checks**, le load balancer appelle régulièrement une URL comme `/health`. Après **2 échecs**, il retire le serveur du pool, en 2 secondes environ ici. Après **2 succès**, il le réintègre. Ce sont l\'*unhealthy threshold* et le *healthy threshold* d\'un ALB.'
        ],
        graph: lbBase(3, { rps: 70, lb: { health: false } }),
        try: {
          controls: [{ k: 'toggle', label: '🩺 Health checks', get: fc => fc.node('lb').health !== false, set: (fc, v) => fc.set('lb', 'health', v) }],
          goal: { text: 'Avec un serveur en panne, ramène les rejets à zéro.', test: (m, fc) => apps(fc).some(s => !s.alive) && fc.node('lb').health !== false && m.drop === 0 }
        }
      },
      {
        t: 'Auto-scaling : suivre la demande',
        body: [
          'Le trafic varie : creux la nuit, pic au lancement d\'une promotion. Payer en permanence pour le pic coûte cher. Se calibrer sur le creux fait tomber le site.',
          'L\'**auto-scaling** surveille la charge. Au-dessus de **75 %**, il démarre un serveur. Sous **30 %** pendant un moment, il en retire un.',
          'Un nouveau serveur n\'est **pas instantané** : il démarre (3 s ici, plusieurs minutes en vrai), puis doit passer ses health checks. Monte le trafic progressivement et regarde le groupe grandir. Sur AWS, c\'est un **Auto Scaling Group** ; dans Kubernetes, le **HorizontalPodAutoscaler**.'
        ],
        graph: lbBase(2, { rps: 40, lb: { autoscale: null } }),
        try: {
          controls: [rps(20, 300, 10), { k: 'toggle', label: '📈 Auto-scaling', get: fc => !!fc.node('lb').autoscale, set: (fc, v) => fc.set('lb', 'autoscale', v ? { min: 2, max: 8, boot: 3 } : null) }, spike(3, 6)],
          goal: { text: 'Active l\'auto-scaling et sers 200 r/s avec moins de 2 % de rejets.', test: (m, fc) => !!fc.node('lb').autoscale && m.in >= 200 && m.err < 0.02 }
        }
      },
      {
        t: 'Sessions : rester connecté d\'un serveur à l\'autre',
        body: [
          'L\'utilisateur se connecte, et sa **session** (identité, panier) est gardée **dans la mémoire du serveur** qui l\'a reçu.',
          'Avec le round robin, sa requête suivante arrive sur **un autre serveur**, qui ne le connaît pas : il est **déconnecté**. La métrique « Sessions perdues » le mesure.',
          'Première solution : les **sessions collantes** (*sticky sessions*, hachage IP). Elles fonctionnent, mais une panne ou un scale-in déconnecte quand même, et la charge peut se déséquilibrer.',
          'Bonne pratique : des serveurs **sans état** (*stateless*), avec les sessions dans un **magasin partagé** comme Redis (ElastiCache, Azure Cache for Redis).'
        ],
        graph: lbBase(3, { rps: 60, lb: { sessions: true } }),
        try: {
          controls: [
            { k: 'select', label: 'Algorithme', options: [['rr', 'Round robin'], ['iphash', 'Hachage IP (collant)']], get: fc => fc.node('lb').algo || 'rr', set: (fc, v) => fc.set('lb', 'algo', v) },
            { k: 'toggle', label: '🔒 Sessions dans Redis', get: fc => !!fc.node('redis'), set: (fc, v) => {
              if (v && !fc.node('redis')) { fc.addNode({ id: 'redis', type: 'store', x: 920, y: 280 }); apps(fc).forEach(s => fc.addEdge(s.id, 'redis')); }
              if (!v) fc.removeNode('redis');
            } }
          ],
          goal: { text: 'Plus aucune session perdue, avec 3 serveurs qui se partagent le trafic.', test: (m, fc) => m.lost === 0 && m.drop === 0 && apps(fc).length >= 3 && fc.node('lb').algo !== 'iphash' }
        }
      }
    ],
    build: {
      goal: 'Ton site reçoit **150 r/s**. Un serveur d\'app tient **40 r/s**. Sers tout le trafic, puis **survis à la panne d\'un serveur** : pendant Play, clique sur sa croix ✕.',
      palette: ['lb', 'app'],
      start: { nodes: [N('c', 'client', 120, 280, { rps: 150 })], edges: [] },
      reference: lbBase(5, { rps: 150 }),
      check(m, fc, ctx) {
        const c = fc.client();
        if (!fc.outs(c).length) return { msg: 'Relie le **Client** à un composant : glisse depuis la poignée **+** de sa carte jusqu\'à la cible.' };
        if (!fc.byType('lb').length) return { msg: 'Le client ne peut appeler qu\'une seule adresse. Place un **Load balancer** devant tes serveurs.', tone: 'warn' };
        if (m.overloaded) return { msg: `Des serveurs débordent : ${Math.round(m.drop)} r/s rejetées. Ajoute des serveurs derrière le load balancer (150 r/s ÷ 40 r/s = 4 au minimum).`, tone: 'bad' };
        if (m.drop > 0) return { msg: `${Math.round(m.drop)} r/s sont perdues. ${ctx.kills ? 'Le load balancer retire le serveur mort en ~2 s ; s\'il reste trop peu de capacité, ajoute une marge (N+1).' : 'Vérifie que chaque serveur est relié au load balancer.'}`, tone: 'bad' };
        if (!ctx.kills) return { msg: 'Tout le trafic passe. Maintenant, **tue un serveur** avec sa croix ✕ : ton architecture doit encaisser.', tone: 'info', partial: true };
        if (ctx.sinceKill < 3) return { msg: 'Panne en cours… le load balancer détecte le serveur mort.', tone: 'info', partial: true };
        return { ok: true, msg: 'Bravo : 150 r/s servies, même avec un serveur en panne. C\'est la redondance **N+1**.' };
      }
    },
    quiz: [
      { q: 'Tes serveurs n\'ont pas tous la même puissance. Quel algorithme répartit le mieux la charge ?', options: ['Round robin', 'Moins de connexions (least outstanding requests)', 'Aléatoire', 'Hachage IP'], answer: 1, why: 'Un serveur lent garde ses requêtes plus longtemps et en reçoit donc moins. Round robin et aléatoire ignorent la puissance.' },
      { q: 'Sans health checks, que se passe-t-il quand un serveur sur trois tombe ?', options: ['Le load balancer le détecte immédiatement', 'Environ un tiers des requêtes expire (504)', 'Toutes les requêtes échouent', 'Rien'], answer: 1, why: 'Le load balancer continue à lui envoyer sa part du trafic.' },
      { q: 'Pourquoi prévoir un serveur de plus que le strict nécessaire (N+1) ?', options: ['Pour aller plus vite', 'Pour encaisser la perte d\'un serveur sans rejeter de requêtes', 'Parce que AWS l\'impose', 'Pour les logs'], answer: 1, why: 'Une panne ne doit pas faire passer la capacité restante sous la demande.' },
      { q: 'Quelle est la meilleure solution pour que les utilisateurs restent connectés quel que soit le serveur ?', options: ['Sessions collantes', 'Un plus gros serveur', 'Des sessions dans un magasin partagé (Redis)', 'Désactiver le load balancer'], answer: 2, why: 'Des serveurs sans état sont interchangeables : une panne ou un scale-in ne déconnecte personne.' },
      { q: 'Pourquoi un pic soudain peut-il provoquer des erreurs malgré l\'auto-scaling ?', options: ['L\'auto-scaling ne marche que la nuit', 'Les nouveaux serveurs mettent du temps à démarrer et à passer les health checks', 'Le LB limite à 2 serveurs', 'À cause du round robin'], answer: 1, why: 'Le scaling réagit avec retard : il faut garder de la marge, ou anticiper avec un scaling planifié ou prédictif.' }
    ]
  };

  /* ---------------- Cache ---------------- */
  const cacheG = (o) => ({
    nodes: [N('c', 'client', 110, 280, { rps: 150 }), N('app', 'app', 380, 280, { cap: 400, label: 'Serveur d\'app' })]
      .concat(o.cache === false ? [] : [N('cache', 'cache', 680, 140, Object.assign({ size: 60, ttl: 60 }, o.cache || {}))])
      .concat([N('db', 'db', 760, 400, { cap: 30 })]),
    edges: [['c', 'app'], ['app', 'db']].concat(o.cache === false ? [] : [['app', 'cache']])
  });
  const sizeCtl = { k: 'range', label: 'Taille du cache', min: 5, max: 200, step: 5, get: fc => fc.node('cache').size, set: (fc, v) => fc.set('cache', 'size', v), fmt: v => v + ' clés / 200' };

  const CACHE = {
    id: 'cache', icon: 'cache', cat: 'Cache & données', title: 'Cache',
    tagline: 'La base de données n\'a pas besoin d\'entendre chaque question : la plupart ont la même réponse.',
    courses: ['aws-saa', 'aws-dva', 'az-204', 'spring-boot', 'aws-sap', 'az-305'],
    sections: [
      {
        t: 'La base de données est le goulot',
        body: [
          'Les bases de données sont fiables, mais lentes : parcourir des pages disque, poser des verrous, faire des jointures. La nôtre tient **30 lectures par seconde**.',
          'Le site en reçoit **150**. Chacune descend jusqu\'à la base, qui se noie : les requêtes en trop sont rejetées.',
          'Un serveur de base plus gros coûte vite très cher, et le trafic finira par rattraper ce nouveau plafond. Il y a plus malin.'
        ],
        graph: cacheG({ cache: false }),
        try: { controls: [rps(10, 200)] }
      },
      {
        t: 'Placer un cache devant la base',
        body: [
          'On place un **cache en mémoire** (Redis, Memcached) entre l\'application et la base. Chaque lecture se fait alors en deux temps.',
          '**1. On demande au cache.** Si la réponse y est, c\'est un **hit** : réponse en moins d\'une milliseconde, la base n\'en sait rien.',
          '**2. Sinon, c\'est un miss** : on lit la base, puis on **range la réponse dans le cache** avant de répondre. La prochaine demande sera un hit.',
          'Ce motif s\'appelle **cache-aside** (*lazy loading*). C\'est de loin le plus courant.'
        ],
        graph: cacheG({ cache: { size: 10 } }),
        try: { controls: [sizeCtl], goal: { text: 'Agrandis le cache jusqu\'à ce que la base ne soit plus surchargée et que plus rien ne soit rejeté.', test: m => m.drop === 0 && m.dbLoad <= 1 } }
      },
      {
        t: 'Pas besoin de tout cacher : la loi de Pareto',
        body: [
          'Les 200 produits ne sont pas consultés autant les uns que les autres. Quelques-uns sont **très demandés**, et la majorité forme une **longue traîne** (loi de Zipf).',
          'Résultat : **10 % des clés** suffisent pour plus de la moitié des lectures. Chaque clé ajoutée rapporte un peu moins que la précédente.',
          'Quand le cache est plein, il **évince** la clé utilisée le moins récemment (**LRU**). Fais varier la taille et observe le **taux de hit** sur la carte du cache.'
        ],
        graph: cacheG({ cache: { size: 20 } }),
        try: { controls: [sizeCtl], goal: { text: 'Atteins un taux de hit d\'au moins 80 %.', test: m => m.hit >= 0.8 } }
      },
      {
        t: 'Le compromis : un cache peut mentir',
        body: [
          'Quand une donnée change en base, le cache garde l\'**ancienne version** jusqu\'à ce qu\'on agisse. Ici, **10 % des requêtes sont des écritures**.',
          '**TTL** (*time to live*) : chaque entrée expire au bout d\'un délai. C\'est simple, mais une donnée périmée peut rester jusqu\'à la fin du TTL.',
          '**Invalider à l\'écriture** : on supprime l\'entrée du cache à chaque modification, et la lecture suivante relit la base. **Write-through** : on écrit dans le cache et dans la base en même temps.',
          'Un TTL court limite la péremption mais fait chuter le taux de hit, et la base reprend de la charge. Observe les **lectures périmées** (le trafic est ici de 100 r/s).'
        ],
        graph: cacheG({ cache: { size: 80, ttl: 60 } }),
        setup: fc => { fc.set('app', 'writes', 0.1); fc.client().rps = 100; },
        try: {
          controls: [
            { k: 'select', label: 'TTL', options: [[1, '1 s'], [10, '10 s'], [60, '1 min'], [300, '5 min']], get: fc => fc.node('cache').ttl, set: (fc, v) => fc.set('cache', 'ttl', +v) },
            { k: 'toggle', label: '🧹 Invalider à l\'écriture', get: fc => !!fc.node('cache').invalidate, set: (fc, v) => fc.set('cache', 'invalidate', v) }
          ],
          goal: { text: 'Moins de 1 % de lectures périmées, un taux de hit supérieur à 60 %, et aucun rejet.', test: m => m.stale < 0.01 && m.hit > 0.6 && m.drop === 0 }
        }
      },
      {
        t: 'Quand le cache tombe',
        body: [
          'Tout tient grâce au cache. **Clique sur sa croix ✕.** Toutes les lectures retombent d\'un coup sur la base, qui n\'a jamais été dimensionnée pour ça : c\'est l\'effet **thundering herd** (troupeau).',
          'Relance-le avec la même croix : il redémarre **à froid**, vide, et son taux de hit remonte progressivement.',
          'Pour s\'en protéger : un cache **répliqué** (Multi-AZ), le **regroupement** des requêtes identiques, de la **limitation de débit**, et un **préchauffage** au démarrage.'
        ],
        graph: cacheG({ cache: { size: 80 } }),
        try: { goal: { text: 'Fais tomber le cache, relance-le, puis attends le retour à la normale.', test: (m, fc) => (fc.node('cache').kills || 0) > 0 && fc.node('cache').alive && fc.node('cache').warm >= 0.99 && m.drop === 0 } }
      }
    ],
    build: {
      goal: 'Tes serveurs reçoivent **150 r/s** de lectures. La base ne tient que **30 r/s**. Ajoute une couche entre eux pour que la base ne fonde pas.',
      palette: ['cache', 'db'],
      start: { nodes: [N('c', 'client', 130, 280, { rps: 150 })].concat([0, 1, 2, 3].map(i => N('s' + (i + 1), 'app', 430, 100 + i * 120, { locked: true }))), edges: [0, 1, 2, 3].map(i => ['c', 's' + (i + 1)]) },
      reference: {
        nodes: [N('c', 'client', 130, 280, { rps: 150 })].concat([0, 1, 2, 3].map(i => N('s' + (i + 1), 'app', 430, 100 + i * 120))).concat([N('cache', 'cache', 680, 280), N('db', 'db', 880, 280)]),
        edges: [0, 1, 2, 3].map(i => ['c', 's' + (i + 1)]).concat([0, 1, 2, 3].map(i => ['s' + (i + 1), 'cache'])).concat([['cache', 'db']])
      },
      check(m, fc) {
        const dbs = fc.byType('db');
        if (!dbs.length) return { msg: 'Les serveurs ont besoin de lire leurs données : place une **Base de données**.' };
        const reach = (n, seen = new Set()) => { if (seen.has(n.id)) return false; seen.add(n.id); return n.type === 'db' || fc.outs(n).some(k => reach(k, seen)); };
        const orphan = fc.byType('app').filter(a => !fc.outs(a).some(k => reach(k)));
        if (orphan.length) return { msg: `${orphan.length} serveur(s) n'atteignent pas la base. Relie chaque serveur (directement ou via un cache).`, tone: 'warn' };
        if (m.dbLoad > 1) return { msg: `La base reçoit ${Math.round(m.dbLoad * 30)} r/s pour 30 r/s de capacité : elle fond. ${fc.byType('cache').length ? 'Relie tous les serveurs au cache.' : 'Ajoute un **Cache** entre les serveurs et la base.'}`, tone: 'bad' };
        if (m.drop > 0) return { msg: `${Math.round(m.drop)} r/s rejetées. Regarde quel composant est rouge.`, tone: 'bad' };
        return { ok: true, msg: `Parfait : le cache absorbe ${Math.round((m.hit || 0) * 100)} % des lectures, la base respire.` };
      }
    },
    quiz: [
      { q: 'Dans le motif cache-aside, que fait l\'application après un cache miss ?', options: ['Elle renvoie une erreur', 'Elle lit la base, écrit la valeur dans le cache puis répond', 'Elle attend', 'Elle vide le cache'], answer: 1, why: 'L\'application remplit le cache à la demande (lazy loading).' },
      { q: 'Pourquoi un petit cache absorbe-t-il souvent l\'essentiel des lectures ?', options: ['Redis compresse', 'La popularité des données est très inégale (Pareto, Zipf)', 'La base est lente', 'Le TTL est long'], answer: 1, why: 'Quelques clés très demandées font la majorité des accès.' },
      { q: 'Un produit change de prix et des clients voient encore l\'ancien prix. Cause probable ?', options: ['Cache trop petit', 'Valeur périmée : pas d\'invalidation et un TTL trop long', 'Base en panne', 'Le load balancer'], answer: 1, why: 'Invalider à l\'écriture, ou un TTL plus court, corrige ce problème.' },
      { q: 'Risque principal quand un cache très sollicité tombe ?', options: ['Aucun', 'La base reçoit d\'un coup toutes les lectures (thundering herd)', 'Corruption de données', 'Déconnexions'], answer: 1, why: 'La base n\'est dimensionnée que pour la part de lectures que le cache laisse passer.' }
    ]
  };

  /* ---------------- Files de messages ---------------- */
  const mqG = (o) => {
    const n = o.workers || 3;
    const ws = Array.from({ length: n }, (_, i) => N('w' + (i + 1), 'worker', 790, 280 + (i - (n - 1) / 2) * Math.min(105, 400 / Math.max(1, n - 1))));
    const nodes = [N('c', 'client', 100, 280, { rps: o.rps || 20, label: 'Commandes' }), N('api', 'app', 330, 280, { cap: 1000, label: 'API' })];
    const edges = [['c', 'api']];
    if (o.queue) {
      nodes.push(N('q', 'queue', 560, 280, o.q || {}));
      edges.push(['api', 'q']);
      ws.forEach(w => edges.push(['q', w.id]));
      if (o.dlq) { nodes.push(N('dlq', 'dlq', 560, 470)); edges.push(['q', 'dlq']); }
    } else ws.forEach(w => edges.push(['api', w.id]));
    return { nodes: nodes.concat(ws), edges };
  };
  const workersCtl = { k: 'stepper', label: 'Workers', min: 1, max: 8, get: fc => fc.byType('worker').length, set: (fc, v) => fc.setKids(fc.node('q') ? 'q' : 'api', 'worker', v) };

  const MQ = {
    id: 'mq', icon: 'queue', cat: 'Messages & événements', title: 'Files de messages',
    tagline: 'Déposer le travail dans une file, et le traiter à son rythme.',
    courses: ['aws-saa', 'aws-dva', 'az-204', 'aws-sap', 'az-305', 'nodejs'],
    explainer: 'queue',
    sections: [
      {
        t: 'Le traitement synchrone',
        body: [
          'Chaque commande déclenche un travail lourd : facture PDF, e-mail, mise à jour du stock. **3 workers** traitent chacun **10 commandes par seconde**.',
          'En **synchrone**, l\'API attend que le worker ait fini avant de répondre. Le système n\'absorbe donc que ce que les workers traitent **à l\'instant même**.',
          'Déclenche un **pic ×4**, comme une campagne promotionnelle, et observe.'
        ],
        graph: mqG({ rps: 20 }),
        try: { controls: [spike(4, 6)], goal: { text: 'Déclenche un pic et observe plus de 10 % de commandes perdues.', test: m => m.err > 0.1, hold: 1 } }
      },
      {
        t: 'Découpler avec une file',
        body: [
          'Avec une **file de messages**, l\'API se contente de **déposer** la commande et répond aussitôt **202 Accepted** (« reçu, ce sera traité »). Les workers **consomment** à leur rythme.',
          'Pendant le pic, la file **grossit** au lieu de rejeter, puis se **résorbe**. Producteur et consommateurs sont **découplés** : chacun peut ralentir, tomber ou être mis à l\'échelle sans bloquer l\'autre.',
          'Sur AWS : **SQS**. Sur Azure : **Service Bus** ou **Storage Queues**. En open source : **RabbitMQ**.'
        ],
        graph: mqG({ rps: 20 }),
        try: {
          controls: [{ k: 'toggle', label: '📬 File de messages', get: fc => !!fc.node('q'), set: (fc, v) => { const r = fc.client().rps; fc.setGraph(mqG({ rps: r, queue: v })); } }, spike(4, 6)],
          goal: { text: 'Active la file, déclenche un pic, et ne perds aucune commande.', test: (m, fc) => !!fc.node('q') && fc.client().spikeUntil > fc.t && m.drop === 0 }
        }
      },
      {
        t: 'Rattraper le retard',
        body: [
          'Une file absorbe un pic **temporaire**. Mais si le trafic **dépasse durablement** la capacité des workers, elle grandit sans fin.',
          'L\'indicateur à surveiller est l\'**âge du plus ancien message** : c\'est le retard pris par le système. Ici, 50 commandes par seconde arrivent pour 3 workers à 10/s.',
          'Sur AWS : `ApproximateAgeOfOldestMessage` et `ApproximateNumberOfMessagesVisible` dans CloudWatch.'
        ],
        graph: mqG({ rps: 50, queue: true }),
        try: { controls: [workersCtl], goal: { text: 'Garde moins de 10 messages en attente à 50 commandes par seconde.', test: m => m.in >= 50 && m.depth < 10 } }
      },
      {
        t: 'Scaler sur la profondeur de file',
        body: [
          'Plutôt que de dimensionner à la main, on ajuste le nombre de workers selon la **profondeur de la file** (le *backlog*) : des messages qui s\'accumulent, on ajoute des workers ; une file vide, on en retire.',
          'Sur AWS, c\'est une politique *target tracking* « messages par instance ». Dans Kubernetes, **KEDA** scale des pods directement sur SQS, Service Bus, RabbitMQ ou Kafka.'
        ],
        graph: mqG({ rps: 15, queue: true, workers: 2 }),
        try: {
          controls: [{ k: 'toggle', label: '📈 Auto-scaling', get: fc => !!fc.node('q').autoscale, set: (fc, v) => fc.set('q', 'autoscale', v ? { min: 1, max: 8 } : null) }, spike(5, 8)],
          goal: { text: 'Active l\'auto-scaling, déclenche un pic, puis ramène la file sous 5 messages.', test: (m, fc) => !!fc.node('q').autoscale && (fc.client().spikes || 0) > 0 && !(fc.client().spikeUntil > fc.t) && m.depth < 5 }
        }
      },
      {
        t: 'Messages empoisonnés et DLQ',
        body: [
          'Certains messages font **échouer le traitement à chaque fois**, à cause d\'une donnée invalide ou d\'un bug. Sans protection, ils reviennent indéfiniment.',
          'Après **3 tentatives** (*maxReceiveCount* sur SQS), le message part dans une **DLQ** (*dead-letter queue*), où on l\'analyse avant de le rejouer.',
          'Tue aussi **un worker** : ses messages ne sont pas perdus. Faute d\'**acquittement**, ils redeviennent visibles et un autre worker les reprend. La livraison est **au moins une fois** (*at-least-once*), d\'où l\'importance de traitements **idempotents**.'
        ],
        graph: mqG({ rps: 20, queue: true, workers: 4, dlq: true, q: { poison: true } }),
        try: { controls: [{ k: 'toggle', label: '☠️ 10 % de messages empoisonnés', get: fc => !!fc.node('q').poison, set: (fc, v) => fc.set('q', 'poison', v) }], goal: { text: 'Observe au moins 20 messages isolés dans la DLQ.', test: m => m.dlq >= 20, hold: 0.5 } }
      }
    ],
    build: {
      goal: 'Les commandes arrivent **par vagues** : 20 r/s, avec des pics à **80 r/s pendant 3 s toutes les 10 s**. Un worker traite **10 r/s**. Aucune commande ne doit être perdue, et le retard doit se résorber entre deux vagues.',
      palette: ['queue', 'worker'],
      start: { nodes: [N('c', 'client', 110, 280, { wave: { base: 20, peak: 80, period: 10, dur: 3 }, label: 'Commandes' }), N('api', 'app', 340, 280, { cap: 1000, label: 'API', locked: true })], edges: [['c', 'api']] },
      reference: mqG({ queue: true, workers: 4 }),
      prepRef: g => { g.nodes[0].wave = { base: 20, peak: 80, period: 10, dur: 3 }; delete g.nodes[0].rps; return g; },
      check(m, fc, ctx) {
        if (!fc.byType('worker').length) return { msg: 'Il faut des **Workers** pour traiter les commandes. Glisse-les sur le canevas et relie-les.' };
        if (m.drop > 0) return { msg: `Des commandes sont perdues (${Math.round(m.drop)} r/s). ${fc.byType('queue').length ? 'Vérifie que l\'API dépose dans la file et que la file alimente les workers.' : 'En direct, l\'API n\'absorbe pas les pics : place une **File** entre l\'API et les workers.'}`, tone: 'bad' };
        if (ctx.t < 12) return { msg: `Observation d'une vague complète… (${Math.ceil(12 - ctx.t)} s)`, tone: 'info', partial: true };
        if (ctx.sinceDrop < 12) return { msg: 'Plus de perte… on attend une vague complète sans perte.', tone: 'info', partial: true };
        if (ctx.minDepth > 5) return { msg: `Aucune perte, mais la file ne se vide jamais entre deux vagues (au mieux ${Math.round(ctx.minDepth)} messages) : en moyenne, il arrive 38 commandes/s. Ajoute des workers.`, tone: 'warn' };
        return { ok: true, msg: 'Bravo : la file absorbe les vagues et les workers rattrapent le retard entre deux pics.' };
      }
    },
    quiz: [
      { q: 'Avec une file de messages, que répond typiquement l\'API au client ?', options: ['200 une fois le traitement fini', '202 Accepted dès que le message est déposé', '503 si un worker est occupé', '301'], answer: 1, why: 'Le traitement est asynchrone : l\'API confirme seulement la prise en charge.' },
      { q: 'Quel indicateur montre le mieux le retard des consommateurs ?', options: ['Le CPU de l\'API', 'L\'âge du plus ancien message', 'Le nombre de clients', 'La taille des messages'], answer: 1, why: 'Il dit combien de temps une commande attend avant d\'être traitée.' },
      { q: 'À quoi sert une dead-letter queue ?', options: ['Stocker les messages traités', 'Isoler les messages qui échouent de façon répétée', 'Accélérer la file', 'Chiffrer'], answer: 1, why: 'Un message empoisonné ne doit pas bloquer les workers indéfiniment.' },
      { q: 'Pourquoi les traitements doivent-ils être idempotents ?', options: ['Pour aller plus vite', 'Parce qu\'un message peut être livré plus d\'une fois', 'SQS l\'exige', 'Pour la facture'], answer: 1, why: 'Avec une livraison au moins une fois, traiter deux fois ne doit pas, par exemple, débiter deux fois un client.' }
    ]
  };

  /* ---------------- CDN ---------------- */
  const regions = [['paris', 'Paris', 90], ['mumbai', 'Mumbai', 280], ['sp', 'São Paulo', 470]];
  const cdnG = (o) => {
    const nodes = regions.map(([id, l, y]) => N(id, 'client', 110, y, { rps: 100, label: 'Clients ' + l }));
    nodes.push(N('origin', 'app', 880, 280, { cap: o.originCap || 120, label: 'Serveur d\'origine' }));
    const edges = [];
    if (o.cdn) regions.forEach(([id, l, y]) => { nodes.push(N('e-' + id, 'cdn', 320, y, { label: 'Edge ' + l, hit: o.hit != null ? o.hit : 0.85 })); edges.push([id, 'e-' + id], ['e-' + id, 'origin']); });
    else regions.forEach(([id]) => edges.push([id, 'origin']));
    return { nodes, edges, geo: true };
  };
  const CDN = {
    id: 'cdn', icon: 'cdn', cat: 'Réseau & Web', title: 'CDN',
    tagline: 'Des serveurs partout dans le monde, chacun avec une copie de votre site.',
    courses: ['aws-saa', 'aws-clf', 'az-900', 'az-204', 'react'],
    sections: [
      {
        t: 'La distance est le problème',
        body: [
          'Votre seul serveur est en Virginie. Un utilisateur à Mumbai ouvre la page : sa requête traverse la moitié du globe, aller et retour. **Environ 250 ms**, juste à cause de la physique : on ne va pas plus vite que la lumière dans la fibre.',
          'Et ce délai se paie à **chaque** fichier : chaque image, chaque script, chaque appel d\'API. Sur ce schéma, **la distance sur l\'écran représente la distance réelle**.',
          'On ne battra pas la vitesse de la lumière. Mais on peut **rapprocher des copies** du contenu des utilisateurs.'
        ],
        graph: cdnG({ originCap: 400 })
      },
      {
        t: 'Un CDN met des serveurs partout',
        body: [
          'Un **CDN** (*Content Delivery Network*) est un réseau de serveurs répartis dans des centaines de villes : les **edges**, ou points de présence.',
          'Si l\'edge a déjà le contenu en cache, il répond directement, à 5–20 ms de l\'utilisateur. Sinon, il le récupère **une fois** à l\'origine, le garde, et sert tous les suivants.',
          'Les principaux : **Cloudflare**, **Akamai**, **AWS CloudFront**, **Fastly**, **Azure Front Door**. Compare la **latence moyenne** avec la section précédente.'
        ],
        graph: cdnG({ cdn: true, originCap: 400 })
      },
      {
        t: 'Ce qui se cache, et ce qui ne se cache pas',
        body: [
          'Le CDN sert très bien le contenu **statique** : images, CSS, JavaScript, vidéos. C\'est souvent l\'essentiel des octets d\'une page.',
          'Les réponses **personnalisées** (panier, compte) ou très fraîches traversent l\'edge jusqu\'à l\'origine. L\'en-tête `Cache-Control` décide de ce qui peut être mis en cache, et combien de temps.',
          'Joue avec la part de requêtes servies par l\'edge et regarde la charge de l\'origine.'
        ],
        graph: cdnG({ cdn: true, originCap: 120, hit: 0.5 }),
        try: {
          controls: [{ k: 'range', label: 'Part servie par l\'edge', min: 0, max: 98, step: 2, get: fc => Math.round(fc.byType('cdn')[0].hit * 100), set: (fc, v) => fc.byType('cdn').forEach(n => { n.hit = v / 100; }), fmt: v => v + ' %' }],
          goal: { text: 'Évite toute surcharge de l\'origine (120 r/s) et descends sous 60 ms de latence moyenne.', test: m => m.drop === 0 && m.lat < 60 }
        }
      },
      {
        t: 'Comment trouver l\'edge le plus proche',
        body: [
          '**Routage DNS** : le DNS du CDN répond une adresse différente selon d\'où vient la question. Un utilisateur à Tokyo obtient l\'edge de Tokyo, un autre à Paris celui de Paris. CloudFront fonctionne ainsi.',
          '**Anycast** : tous les edges annoncent **la même adresse IP**, et les routeurs d\'Internet livrent naturellement au plus proche. C\'est la technique de Cloudflare.',
          'Vous ne gérez rien de tout cela : vous pointez le DNS de votre domaine vers le CDN, et il s\'occupe du routage. Coupe un edge avec sa croix ✕ : ses clients se rabattent sur l\'origine, plus loin.'
        ],
        graph: cdnG({ cdn: true, originCap: 400 })
      }
    ],
    build: {
      goal: '300 r/s arrivent de **Paris, Mumbai et São Paulo**. L\'origine ne tient que **120 r/s**, et elle est loin. Sers tout le monde avec une **latence moyenne inférieure à 80 ms**.',
      palette: ['cdn'],
      start: cdnG({ originCap: 120 }),
      reference: cdnG({ cdn: true, originCap: 120 }),
      check(m, fc) {
        const direct = fc.byType('client').filter(c => fc.outs(c).some(k => k.type === 'app'));
        if (fc.byType('cdn').length && direct.length) return { msg: `${direct.length} groupe(s) de clients parlent encore directement à l'origine. Supprime ces liens : **double-clic** ou **clic droit** sur la flèche (appui long sur mobile).`, tone: 'warn' };
        if (m.drop > 0) return { msg: `L'origine déborde (${Math.round(m.drop)} r/s rejetées). Place des **CDN** près des clients pour qu'elle ne voie que les misses.`, tone: 'bad' };
        if (m.lat >= 80) return { msg: `Latence moyenne : ${m.lat} ms (objectif < 80 ms). Rapproche des edges de chaque groupe de clients (la distance sur le schéma compte).`, tone: 'warn' };
        return { ok: true, msg: `Latence moyenne ${m.lat} ms, origine soulagée : c'est exactement le rôle d'un CDN.` };
      }
    },
    quiz: [
      { q: 'Pourquoi un CDN réduit-il la latence ?', options: ['Il compresse mieux', 'Il sert le contenu depuis un serveur proche de l\'utilisateur', 'Il a des serveurs plus rapides', 'Il utilise HTTP/3'], answer: 1, why: 'La distance physique domine la latence : une copie proche évite l\'aller-retour vers l\'origine.' },
      { q: 'Quel contenu un CDN met-il facilement en cache ?', options: ['Le panier de l\'utilisateur', 'Les images, CSS et JavaScript', 'Les paiements', 'Les mots de passe'], answer: 1, why: 'Le contenu statique est le même pour tous ; le personnalisé traverse jusqu\'à l\'origine.' },
      { q: 'Avec l\'anycast…', options: ['Chaque edge a une IP différente', 'Tous les edges annoncent la même IP et le réseau livre au plus proche', 'Le client choisit son edge', 'Le DNS est désactivé'], answer: 1, why: 'Le routage Internet (BGP) dirige naturellement vers le point de présence le plus proche.' }
    ]
  };

  window.CONCEPTS_FLOW = [CDN, LB, CACHE, MQ];
})();
