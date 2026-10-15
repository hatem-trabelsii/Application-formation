/* Simulateurs « Apprendre en manipulant » : chaque leçon = des chapitres courts (théorie + scénario
   préréglé + objectif mesuré dans la simulation), un bac à sable libre et un quiz.
   Les objectifs (goal.test) lisent les métriques mesurées par js/sim.js : m.rps, m.err (0..1), m.p95 (ms),
   m.lost, m.pool, m.load, m.hit, m.stale, m.db, m.depth, m.age, m.done, m.dlq. */
window.SIMS = [
  {
    id: 'lb', icon: '⚖️', kind: 'lb',
    title: 'Load balancer : répartir la charge',
    summary: 'Saturer un serveur, ajouter un répartiteur, comparer les algorithmes, survivre à une panne grâce aux health checks, absorber un pic avec l\'auto-scaling et garder les utilisateurs connectés.',
    courses: ['aws-saa', 'aws-sysops', 'az-204', 'az-305', 'kubernetes', 'aws-sap'],
    explainer: 'autoscaling',
    chapters: [
      {
        title: 'Un seul serveur a une limite',
        body: [
          'Tout commence avec **un seul serveur**. Il traite au plus **4 requêtes en même temps**, et chacune lui prend environ **150 ms**. Il ne peut donc pas servir beaucoup plus de **26 requêtes par seconde**.',
          'Au-delà, les requêtes **attendent dans sa file** : la latence grimpe. Quand la file est pleine, il **rejette** les nouvelles avec une erreur **503 Service Unavailable**.',
          'Les points bleus sont les requêtes, les verts les réponses, les rouges les erreurs. La barre sous chaque composant montre sa charge.'
        ],
        setup: { noLB: true, servers: 1, rps: 15 },
        controls: ['rps'],
        goal: { text: 'Monte le trafic jusqu\'à dépasser 10 % d\'erreurs.', test: (m, c) => c.rps >= 30 && m.err > 0.1 && m.n > 6, hold: 3 },
        hint: 'Pousse le curseur « Trafic » au-delà de 30 req/s, puis observe la file et les points rouges.'
      },
      {
        title: 'Ajouter des serveurs derrière un load balancer',
        body: [
          'Plutôt qu\'un serveur plus gros (**scaling vertical**, limité et coûteux), on ajoute **plusieurs serveurs identiques** (**scaling horizontal**).',
          'Le **load balancer** devient l\'unique point d\'entrée : les clients ne connaissent que lui, et il répartit les requêtes entre les serveurs. Sur AWS c\'est un **ALB** (couche 7, HTTP) ou un **NLB** (couche 4, TCP) ; sur Azure, **Application Gateway** ou **Azure Load Balancer** ; dans Kubernetes, un **Service** ou un **Ingress**.',
          'Chaque serveur supporte environ 26 req/s. Combien en faut-il pour 70 req/s sans erreur, avec une marge pour les variations du trafic ?'
        ],
        setup: { servers: 2, rps: 70, algo: 'rr' },
        controls: ['rps', 'servers'],
        goal: { text: 'Tiens 70 req/s avec moins de 1 % d\'erreurs.', test: (m, c) => c.rps >= 70 && m.err < 0.01 && m.n > 8 },
        hint: 'Avec 2 serveurs (~53 req/s de capacité), ça déborde. Ajoute des serveurs avec le bouton « + », puis attends qu\'ils aient démarré.'
      },
      {
        title: 'Algorithmes : round robin ou moins de connexions ?',
        body: [
          '**Round robin** envoie les requêtes à tour de rôle : 1, 2, 3, 1, 2, 3… C\'est simple et équitable, à condition que **tous les serveurs soient identiques**.',
          'Ici, le **serveur 3 est un ancien modèle** : 2 requêtes en parallèle et 300 ms chacune. Il reçoit pourtant un tiers du trafic et sature.',
          '**Moins de connexions** (*least outstanding requests* sur un ALB) envoie chaque requête au serveur qui en traite le moins. Un serveur lent garde ses connexions plus longtemps, donc il en reçoit naturellement moins.',
          '**Hachage IP** envoie toujours le même client au même serveur. **Aléatoire** donne en moyenne le même résultat que le round robin.'
        ],
        setup: { servers: 3, rps: 45, algo: 'rr', specs: [null, null, { label: 'Serveur 3 (ancien)', cap: 2, svc: 3000, qmax: 4 }] },
        controls: ['rps', 'algo'],
        goal: { text: 'À 45 req/s, trouve l\'algorithme qui ramène les erreurs sous 1 %.', test: (m, c) => c.rps >= 45 && m.err < 0.01 && m.n > 8 },
        hint: 'Essaie « Moins de connexions » et regarde la barre de charge du serveur 3.'
      },
      {
        title: 'Health checks : ne plus envoyer de trafic à un serveur mort',
        body: [
          'Un serveur peut tomber à tout moment : crash de l\'application, mémoire saturée, machine perdue. **Clique sur un serveur pour le mettre en panne.**',
          'Sans contrôle, le load balancer continue de lui envoyer sa part de requêtes. Elles **expirent** au bout de 250 ms (erreur **504 Gateway Timeout**) : un utilisateur sur trois voit une erreur.',
          'Avec les **health checks**, le load balancer appelle régulièrement une URL comme `/health`. Après **2 échecs consécutifs**, le serveur est **retiré du pool**. Après **2 succès**, il est réintégré. Sur un ALB, ces deux seuils s\'appellent *unhealthy threshold* et *healthy threshold*.'
        ],
        setup: { servers: 3, rps: 40, algo: 'rr', health: false },
        controls: ['rps', 'kill', 'health'],
        goal: { text: 'Avec un serveur en panne, ramène les erreurs à 0 %.', test: (m, c, s) => s.servers().some(x => !x.up) && c.health && m.err === 0 && m.n > 8 },
        hint: 'Mets un serveur en panne d\'un clic, observe les 504, puis active « Health checks ».'
      },
      {
        title: 'Auto-scaling : suivre la demande',
        body: [
          'Le trafic varie : creux la nuit, pic au lancement d\'une promotion. Payer en permanence pour le pic coûte cher, et rester calibré pour le creux fait tomber le site.',
          'L\'**auto-scaling** mesure la charge et ajuste le nombre de serveurs. Ici, au-dessus de **75 %**, il lance un serveur. Sous **30 %** pendant un moment, il en **vide** un (*draining* : il termine ses requêtes en cours) puis l\'arrête.',
          'Un nouveau serveur n\'est **pas instantané**. Il démarre, puis doit passer les health checks avant de recevoir du trafic. Le pic doit donc être absorbé par la **marge** des serveurs déjà en place. Sur AWS, c\'est un **Auto Scaling Group** ; dans Kubernetes, le **HorizontalPodAutoscaler**.'
        ],
        setup: { servers: 2, rps: 30, algo: 'least', health: true, autoscale: false, minServers: 2 },
        controls: ['rps', 'spike', 'autoscale'],
        goal: { text: 'Active l\'auto-scaling et tiens 120 req/s avec moins de 2 % d\'erreurs.', test: (m, c) => c.autoscale && c.rps >= 120 && m.err < 0.02 && m.n > 16 },
        hint: 'Active l\'auto-scaling, puis monte progressivement le trafic. Si tu montes d\'un coup, les serveurs n\'ont pas le temps de démarrer.'
      },
      {
        title: 'Sessions : rester connecté d\'un serveur à l\'autre',
        body: [
          'Tes 8 utilisateurs (une couleur chacun) sont connectés. Leur **session** (panier, identité) est stockée **dans la mémoire du serveur** qui les a reçus.',
          'Avec le round robin, la requête suivante arrive sur **un autre serveur**, qui ne les connaît pas : l\'utilisateur est **déconnecté**.',
          'Il y a deux solutions. Les **sessions collantes** (*sticky sessions*, ou hachage IP) renvoient toujours un même client vers le même serveur. Mais si ce serveur tombe, ses sessions sont perdues, et la charge peut devenir déséquilibrée. L\'autre solution rend les serveurs **sans état** (*stateless*) : la session est stockée dans un magasin partagé comme **Redis** (ElastiCache, Azure Cache for Redis). C\'est la bonne pratique, car n\'importe quel serveur peut alors répondre.'
        ],
        setup: { servers: 3, rps: 30, algo: 'rr', session: 'local' },
        controls: ['rps', 'algo', 'session', 'kill'],
        goal: { text: 'Plus aucune session perdue pendant 3 secondes.', test: m => m.lost === 0 && m.n > 8, hold: 6 },
        hint: 'Essaie l\'algorithme « Hachage IP », puis les sessions « Partagées (Redis) ». Mets ensuite un serveur en panne dans chacun des deux cas.'
      }
    ],
    quiz: [
      { q: 'Tes serveurs n\'ont pas tous la même puissance. Quel algorithme répartit le mieux la charge ?', options: ['Round robin', 'Moins de connexions (least outstanding requests)', 'Aléatoire', 'Hachage IP'], answer: 1, why: 'Un serveur lent garde ses requêtes plus longtemps : il a plus de connexions ouvertes, donc il en reçoit moins. Round robin et aléatoire l\'ignorent.' },
      { q: 'Sans health checks, que se passe-t-il quand un serveur sur trois tombe ?', options: ['Le load balancer le détecte immédiatement', 'Environ un tiers des requêtes expire (504)', 'Toutes les requêtes échouent', 'Rien, les autres serveurs compensent automatiquement'], answer: 1, why: 'Le load balancer continue à lui envoyer sa part des requêtes, qui expirent faute de réponse.' },
      { q: 'Pourquoi retirer un serveur du pool seulement après plusieurs échecs consécutifs ?', options: ['Pour économiser de la bande passante', 'Pour éviter de le retirer à cause d\'un incident ponctuel (faux positif)', 'Parce que le premier contrôle échoue toujours', 'Pour laisser le temps à l\'auto-scaling'], answer: 1, why: 'Un seuil (unhealthy threshold) évite que des oscillations retirent et réintègrent un serveur en boucle.' },
      { q: 'Quelle est la meilleure solution pour que les utilisateurs restent connectés quel que soit le serveur qui répond ?', options: ['Sessions collantes', 'Augmenter la taille des serveurs', 'Stocker les sessions dans un magasin partagé (Redis)', 'Désactiver le load balancer'], answer: 2, why: 'Des serveurs sans état sont interchangeables. Une panne ou un scale-in ne déconnecte personne, et la charge reste bien répartie.' },
      { q: 'Pourquoi un pic de trafic soudain peut-il provoquer des erreurs malgré l\'auto-scaling ?', options: ['L\'auto-scaling ne fonctionne que la nuit', 'Les nouveaux serveurs mettent du temps à démarrer et à passer les health checks', 'Le load balancer limite le nombre de serveurs à 2', 'Parce que le round robin est obligatoire'], answer: 1, why: 'Le scaling est réactif et prend du temps : il faut garder de la marge, ou anticiper avec un scaling planifié ou prédictif.' },
      { q: 'Que signifie « draining » (connection draining / deregistration delay) ?', options: ['Vider le cache du load balancer', 'Laisser un serveur terminer ses requêtes en cours avant de l\'arrêter', 'Supprimer les logs', 'Redémarrer tous les serveurs'], answer: 1, why: 'Le serveur ne reçoit plus de nouvelles requêtes, mais celles en cours se terminent normalement : aucun utilisateur n\'est coupé.' }
    ]
  },
  {
    id: 'cache', icon: '⚡', kind: 'cache',
    title: 'Cache : soulager la base de données',
    summary: 'Voir une base saturer, poser un cache devant (cache-aside), régler sa taille grâce à la loi de Pareto, gérer le TTL et les données périmées, survivre à la panne du cache.',
    courses: ['aws-saa', 'aws-dva', 'az-204', 'spring-boot', 'aws-sap', 'az-305'],
    chapters: [
      {
        title: 'La base de données est le goulot',
        body: [
          'Chaque page produit demande une lecture en **base de données**. La base n\'accepte que **4 connexions simultanées** et chaque requête prend **150 ms**. Elle sert donc au plus ~**26 lectures par seconde**.',
          'L\'application, elle, est légère et facile à multiplier. C\'est presque toujours la base qui sature en premier : elle est difficile à scaler, car elle contient l\'**état**.'
        ],
        setup: { cacheSize: 0, rps: 10, writes: 0 },
        controls: ['rps'],
        goal: { text: 'Monte le trafic jusqu\'à saturer la base (latence p95 > 800 ms ou erreurs > 5 %).', test: (m, c) => c.rps >= 35 && (m.err > 0.05 || m.p95 > 800) && m.n > 6, hold: 3 },
        hint: 'Pousse le trafic au-delà de 35 req/s et regarde la file de la base de données.'
      },
      {
        title: 'Cache-aside : demander d\'abord au cache',
        body: [
          'Le motif **cache-aside** (*lazy loading*) fonctionne ainsi. L\'application demande d\'abord au **cache** (Redis, en mémoire : ~1 ms). S\'il a la réponse, c\'est un **hit** : on répond tout de suite.',
          'Sinon, c\'est un **miss** : l\'application lit la base, **range le résultat dans le cache**, puis répond. La prochaine demande pour la même donnée sera un hit.',
          'Active le cache avec quelques dizaines de clés et observe la charge de la base chuter.'
        ],
        setup: { cacheSize: 0, rps: 50, writes: 0, ttl: 10 },
        controls: ['rps', 'cacheSize'],
        goal: { text: 'À 50 req/s, obtiens une latence p95 < 400 ms et moins de 1 % d\'erreurs.', test: (m, c) => c.rps >= 50 && c.cacheSize > 0 && m.p95 < 400 && m.err < 0.01 && m.n > 8 },
        hint: 'Monte « Taille du cache » à 30 clés ou plus.'
      },
      {
        title: 'Pas besoin de tout cacher : la loi de Pareto',
        body: [
          'Les 200 produits ne sont pas consultés autant les uns que les autres. Quelques-uns sont **très populaires**, et la majorité forme une **longue traîne** (loi de Zipf).',
          'C\'est pourquoi **10 % des clés** peuvent suffire à servir **plus de la moitié des lectures**. Agrandir le cache rapporte de moins en moins : chaque clé ajoutée est moins demandée que la précédente.',
          'Quand le cache est plein, il **évince** la clé utilisée le moins récemment (**LRU**, *Least Recently Used*).'
        ],
        setup: { cacheSize: 10, rps: 40, writes: 0, ttl: 10 },
        controls: ['rps', 'cacheSize'],
        goal: { text: 'Atteins un taux de hit d\'au moins 80 % avec le cache le plus petit possible.', test: m => m.hit >= 0.8 && m.n > 8 },
        hint: 'Augmente la taille du cache par petits pas : 20, 30, 40, 50… Note le taux de hit à chaque fois.'
      },
      {
        title: 'TTL et données périmées',
        body: [
          'Quand une donnée est **modifiée en base**, le cache garde l\'**ancienne version** jusqu\'à son expiration (**TTL**, *Time To Live*). Le client lit alors une donnée **périmée** (*stale*).',
          'Un **TTL court** limite la péremption mais provoque plus de misses. Un **TTL long** est très efficace mais montre des données dépassées.',
          'La solution classique est d\'**invalider** la clé (la supprimer du cache) à chaque écriture : la lecture suivante relit la base. Un TTL reste conseillé comme filet de sécurité.'
        ],
        setup: { cacheSize: 60, rps: 30, writes: 0.1, ttl: 10, invalidate: false },
        controls: ['rps', 'ttl', 'writes', 'invalidate'],
        goal: { text: 'Avec 10 % d\'écritures : moins de 1 % de lectures périmées ET un taux de hit > 60 %.', test: (m, c) => c.writes > 0 && m.stale < 0.01 && m.hit > 0.6 && m.n > 8 },
        hint: 'Compare « TTL 0,2 s » et « Invalider à l\'écriture ». Lequel garde un bon taux de hit ?'
      },
      {
        title: 'Quand le cache tombe : l\'effet troupeau',
        body: [
          'Le système tient grâce au cache, qui absorbe la majorité des lectures. **Clique sur le cache pour le mettre en panne.**',
          'Toutes les lectures retombent d\'un coup sur la base, qui n\'a jamais été dimensionnée pour ça : c\'est l\'effet **thundering herd** (troupeau). Ensuite, **relance le cache** : il redémarre **à froid**, vide, et se remplit progressivement.',
          'Pour s\'en protéger : un cache **répliqué** (Multi-AZ), un **coalescing** des requêtes identiques, de la **limitation de débit**, et un **préchauffage** du cache au démarrage.'
        ],
        setup: { cacheSize: 60, rps: 45, writes: 0, ttl: 10 },
        controls: ['rps', 'kill'],
        goal: { text: 'Fais tomber le cache, relance-le, puis attends le retour à la normale (hit > 70 %, erreurs < 1 %).', test: (m, c, s) => s.nodes.cache.crashes > 0 && s.nodes.cache.up && m.hit > 0.7 && m.err < 0.01 && m.n > 8 },
        hint: 'Un clic sur le cache le fait tomber, un second clic le relance.'
      }
    ],
    quiz: [
      { q: 'Dans le motif cache-aside, que fait l\'application après un cache miss ?', options: ['Elle renvoie une erreur', 'Elle lit la base, écrit la valeur dans le cache puis répond', 'Elle attend que le cache se remplisse tout seul', 'Elle vide le cache'], answer: 1, why: 'L\'application remplit le cache à la demande (lazy loading).' },
      { q: 'Pourquoi un petit cache suffit-il souvent à absorber l\'essentiel des lectures ?', options: ['Parce que Redis compresse les données', 'Parce que la popularité des données est très inégale (loi de Pareto ou de Zipf)', 'Parce que la base est lente', 'Parce que le TTL est long'], answer: 1, why: 'Quelques clés très demandées représentent la majorité des accès.' },
      { q: 'Un produit change de prix et des clients voient encore l\'ancien prix. Quelle est la cause ?', options: ['Le cache est trop petit', 'La valeur en cache est périmée : pas d\'invalidation, et un TTL trop long', 'La base est en panne', 'Le load balancer'], answer: 1, why: 'Invalider la clé à l\'écriture, ou réduire le TTL, corrige le problème.' },
      { q: 'Quel est le risque principal quand un cache très sollicité tombe en panne ?', options: ['Aucun, le cache est optionnel', 'La base reçoit d\'un coup toutes les lectures et sature (thundering herd)', 'Les données sont corrompues', 'Les utilisateurs sont déconnectés'], answer: 1, why: 'La base n\'est souvent dimensionnée que pour la part de lectures que le cache laisse passer.' },
      { q: 'Quelle politique d\'éviction retire la clé utilisée le moins récemment ?', options: ['FIFO', 'LRU', 'TTL', 'Write-through'], answer: 1, why: 'LRU signifie Least Recently Used. C\'est la politique allkeys-lru de Redis.' }
    ]
  },
  {
    id: 'queue', icon: '📬', kind: 'queue',
    title: 'Files de messages : absorber les pics',
    summary: 'Voir un traitement synchrone s\'effondrer pendant un pic, découpler avec une file (SQS, Service Bus), rattraper le retard avec plus de consommateurs, scaler sur la profondeur de file, isoler les messages empoisonnés en DLQ.',
    courses: ['aws-saa', 'aws-dva', 'az-204', 'aws-sap', 'az-305', 'nodejs'],
    explainer: 'queue',
    chapters: [
      {
        title: 'Le traitement synchrone',
        body: [
          'Chaque commande déclenche un traitement lourd : facture PDF, e-mail, mise à jour du stock. Il prend **250 ms** et il y a **3 workers**, chacun traitant une commande à la fois.',
          'En **synchrone**, l\'API attend que le worker ait fini avant de répondre au client. Le système ne peut donc absorber que ce que les workers traitent **à l\'instant même** : environ 12 commandes par seconde.',
          'Déclenche un **pic ×5** (une campagne promotionnelle) et observe.'
        ],
        setup: { mode: 'sync', workers: 3, rps: 8 },
        controls: ['rps', 'spike'],
        goal: { text: 'Déclenche un pic et observe plus de 10 % d\'erreurs.', test: m => m.err > 0.1 && m.n > 6, hold: 2 },
        hint: 'Clique sur « ⚡ Pic ×5 ».'
      },
      {
        title: 'Découpler avec une file de messages',
        body: [
          'Avec une **file de messages**, l\'API se contente de **déposer** la commande dans la file et répond aussitôt **202 Accepted** (« reçu, ce sera traité »). Les workers **consomment** les messages à leur rythme.',
          'Pendant le pic, la file **grossit** au lieu de rejeter des commandes, puis se **résorbe** une fois le pic passé. Le producteur et le consommateur sont **découplés** : chacun peut tomber, ralentir ou être mis à l\'échelle sans bloquer l\'autre.',
          'Sur AWS : **SQS** ; sur Azure : **Service Bus** ou **Storage Queues** ; en open source : **RabbitMQ**.'
        ],
        setup: { mode: 'sync', workers: 3, rps: 8 },
        controls: ['rps', 'spike', 'mode'],
        goal: { text: 'Active la file, déclenche un pic et garde moins de 1 % d\'erreurs.', test: (m, c, s) => c.mode === 'async' && s.mult > 1 && m.err < 0.01 && m.n > 8, hold: 4 },
        hint: 'Coche « File de messages », puis « ⚡ Pic ×5 ». Regarde la profondeur de la file.'
      },
      {
        title: 'Rattraper le retard : ajouter des consommateurs',
        body: [
          'Une file absorbe un pic **temporaire**. Mais si le trafic **dépasse durablement** la capacité des workers, la file grandit sans fin. L\'**âge du plus ancien message** est l\'indicateur à surveiller : c\'est le retard pris par le système.',
          'Ici, 20 commandes par seconde arrivent pour 3 workers capables d\'en traiter ~12. Combien de workers faut-il pour que la file **reste vide** ?',
          'Sur AWS, surveille `ApproximateAgeOfOldestMessage` et `ApproximateNumberOfMessagesVisible` dans CloudWatch.'
        ],
        setup: { mode: 'async', workers: 3, rps: 20 },
        controls: ['rps', 'workers'],
        goal: { text: 'À 20 commandes/s, garde moins de 10 messages en attente.', test: (m, c) => c.rps >= 20 && m.depth < 10 && m.done >= 18 && m.n > 8 },
        hint: 'Chaque worker traite ~4 commandes/s. Il faut une capacité supérieure à 20/s, avec une marge.'
      },
      {
        title: 'Scaler les consommateurs sur la profondeur de file',
        body: [
          'Plutôt que de dimensionner à la main, on **scale sur la profondeur de la file** (le *backlog* par worker). Quand trop de messages attendent, on ajoute des workers. Quand la file est vide, on en retire.',
          'Sur AWS, une politique de *target tracking* sur « messages par instance » ; dans Kubernetes, **KEDA** sait scaler des pods directement sur une file SQS, Service Bus, RabbitMQ ou Kafka.'
        ],
        setup: { mode: 'async', workers: 2, rps: 12, autoscale: false },
        controls: ['rps', 'spike', 'autoscale'],
        goal: { text: 'Active l\'auto-scaling, déclenche un pic, et ramène la file sous 5 messages.', test: (m, c, s) => c.autoscale && s.spikes > 0 && s.mult === 1 && m.depth < 5 && m.n > 8 },
        hint: 'Active l\'auto-scaling, puis « ⚡ Pic ×5 ». Les workers arrivent un par un.'
      },
      {
        title: 'Messages empoisonnés et dead-letter queue',
        body: [
          'Certains messages font **échouer le traitement à chaque fois** (donnée invalide, bug) : ce sont des **messages empoisonnés**. Sans protection, ils reviennent indéfiniment et occupent les workers.',
          'Après **3 tentatives** (*maxReceiveCount* sur SQS), le message est déplacé dans une **DLQ** (*dead-letter queue*), une file à part qu\'on analyse et qu\'on rejoue après correction.',
          'Mets aussi **un worker en panne** pendant un traitement. Son message n\'est **pas acquitté** : il redevient visible après le **délai de visibilité** et un autre worker le reprend. La livraison est donc **au moins une fois** (*at-least-once*) : un message peut être traité deux fois, d\'où l\'importance de traitements **idempotents**.'
        ],
        setup: { mode: 'async', workers: 4, rps: 15, poison: true },
        controls: ['rps', 'poison', 'kill', 'workers'],
        goal: { text: 'Observe au moins 2 messages isolés dans la DLQ.', test: m => m.dlq >= 2, hold: 1 },
        hint: 'Attends quelques secondes : environ 1 message sur 10 est empoisonné dans ce scénario (une proportion volontairement exagérée).'
      }
    ],
    quiz: [
      { q: 'Avec une file de messages, que répond typiquement l\'API au client ?', options: ['200 OK une fois le traitement terminé', '202 Accepted dès que le message est déposé', '503 si un worker est occupé', '301 vers le worker'], answer: 1, why: 'Le traitement se fait plus tard, de manière asynchrone : l\'API confirme seulement la prise en charge.' },
      { q: 'Quel indicateur montre le mieux le retard pris par les consommateurs ?', options: ['Le CPU de l\'API', 'L\'âge du plus ancien message dans la file', 'Le nombre de clients', 'La taille des messages'], answer: 1, why: 'L\'âge du plus ancien message indique combien de temps une commande attend avant d\'être traitée.' },
      { q: 'À quoi sert une dead-letter queue ?', options: ['À stocker les messages traités', 'À isoler les messages qui échouent de façon répétée pour les analyser', 'À accélérer la file principale', 'À chiffrer les messages'], answer: 1, why: 'Elle empêche un message empoisonné de bloquer les workers indéfiniment.' },
      { q: 'Un worker tombe pendant un traitement. Que devient le message sur SQS ?', options: ['Il est perdu', 'Il redevient visible après le délai de visibilité et un autre worker le reprend', 'Il part directement dans la DLQ', 'Le producteur doit le renvoyer'], answer: 1, why: 'Faute d\'acquittement (suppression), le message réapparaît : c\'est une livraison au moins une fois.' },
      { q: 'Pourquoi les traitements consommant une file standard doivent-ils être idempotents ?', options: ['Pour aller plus vite', 'Parce qu\'un message peut être livré plus d\'une fois', 'Parce que SQS l\'exige à la création', 'Pour réduire la facture'], answer: 1, why: 'Avec une livraison au moins une fois, traiter deux fois le même message ne doit pas, par exemple, débiter deux fois un client.' }
    ]
  }
];
