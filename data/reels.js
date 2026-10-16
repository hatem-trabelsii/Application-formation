/* Concepts au format « reel » (rendu par js/reel.js).
   « Kafka vs RabbitMQ » : inspiré d'un reel de Krishna Chaitanya (@krishnachaytanyaa, créateur de freesystemdesign.com),
   réécrit et vérifié :
   - RabbitMQ Streams : lecture non destructive ; le consommateur choisit où commencer (x-stream-offset :
     first, last, next, un offset ou une date) — https://www.rabbitmq.com/docs/streams
   - Kafka share groups (KIP-932, « Queues for Kafka ») : les enregistrements sont répartis entre les consommateurs
     d'un groupe ; chaque enregistrement acquis est verrouillé 30 s par défaut (group.share.record.lock.duration.ms),
     puis relâché pour un autre consommateur — Javadoc KafkaShareConsumer (Kafka 4.1). */
window.REELS = [
  {
    id: 'kafka-rabbit', icon: 'queue', cat: 'Messages & événements',
    title: 'Kafka vs RabbitMQ',
    tagline: 'Round 2 : RabbitMQ sait rejouer, Kafka sait répartir le travail comme une file.',
    handle: '@archipath · d\'après @krishnachaytanyaa',
    kicker: '8 REJOUÉES · 0 PERDUE',
    sub: 'round 2 : chacun a appris le métier de l\'autre',
    courses: ['aws-saa', 'aws-dva', 'az-204', 'aws-sap', 'spring-boot', 'nodejs'],
    credit: 'Inspiré d\'un reel de **Krishna Chaitanya** (@krishnachaytanyaa), créateur de freesystemdesign.com. Script réécrit en français et faits vérifiés dans les documentations officielles.',
    sections: [
      {
        t: 'Huit rejouées, zéro perdue : comment ?',
        body: [
          'Longtemps, la frontière était nette. **RabbitMQ** était une file : un message lu et confirmé est supprimé, impossible de le relire. **Kafka** était un journal : on peut tout relire, mais au sein d\'un groupe de consommateurs, une partition n\'est lue que par un seul membre, ce qui n\'est pas une vraie file de travail.',
          'Les deux ont appris le métier de l\'autre. Ce concept montre comment, avec un scénario de commandes : 8 rejouées à un nouveau service, et 0 perdue malgré la panne d\'un worker.'
        ],
        beats: [
          { say: 'Kafka contre RabbitMQ, **deuxième** round.', do: [{ header: true }, { cam: 'all' }] },
          { say: 'Avant, RabbitMQ effaçait chaque commande lue. Et Kafka ne savait pas partager le travail comme une **file**.' },
          { say: 'Aujourd\'hui : huit commandes rejouées, zéro perdue. **Comment ?**', do: [{ card: '8 REJOUÉES, 0 PERDUE. COMMENT ?' }], pause: 900 }
        ]
      },
      {
        t: 'Un stream garde chaque commande',
        body: [
          'Depuis la version 3.9, RabbitMQ propose les **streams** : une structure en **journal**, où chaque message est ajouté à la suite des autres et numéroté par un **offset**.',
          'Différence clé avec une file classique : la lecture est **non destructive**. Les messages restent, jusqu\'à ce que la politique de rétention (taille ou âge) les supprime. N\'importe quel nombre de consommateurs peut relire les mêmes messages.'
        ],
        beats: [
          { say: 'Premier round : RabbitMQ, avec les **streams**.', do: [{ card: null }, { header: false }, { cam: 'log' }] },
          { say: 'Le service commandes publie. Chaque commande s\'empile dans un journal, **numérotée**.', do: [{ fill: [1, 2, 3, 4, 5, 6, 7, 8] }] },
          { say: 'Et surtout, elles **restent** après lecture.' }
        ]
      },
      {
        t: 'Lire sans effacer',
        body: [
          'La commande #6 part vers le service **e-mail**. Le stream lui en envoie une **copie** : l\'original reste dans le journal.',
          'L\'e-mail confirme le traitement (ACK). Dans une file classique, cette confirmation **supprime** le message. Dans un stream, elle ne supprime rien : seule la **position** du consommateur avance (son marque-page, ou offset).',
          'C\'est le consommateur qui garde sa position : côté client, ou côté serveur avec le protocole stream, qui sait la stocker.'
        ],
        beats: [
          { say: 'La commande six part vers le service **e-mail**.', do: [{ cam: 'mid' }, { cons: ['right', { label: 'EMAIL', color: 'green' }] }, { travel: { slot: 6, to: 'right' } }, { bookmark: ['email', 6, 'green'] }] },
          { say: 'RabbitMQ envoie une **copie**. L\'original reste à sa place.', do: [{ slot: [6, 'glow'] }] },
          { say: 'L\'e-mail répond : c\'est fait.', do: [{ ack: 'right' }] },
          { say: 'Dans une file classique, cette confirmation **effaçait** la commande.', do: [{ slot: [6, 'deleted'] }] },
          { say: 'Dans un stream, seul le **marque-page** de l\'e-mail avance. La commande six reste.', do: [{ slot: [6, 'normal'] }, { bookmark: ['email', 7] }] }
        ]
      },
      {
        t: 'Un retardataire rejoue tout',
        body: [
          'Un service d\'**analytique** est déployé après coup. Il s\'abonne au stream en demandant à commencer au **début** (`x-stream-offset: first`).',
          'RabbitMQ lui livre les 8 commandes déjà publiées, sans gêner l\'e-mail, qui garde sa propre position. Avec une file classique, il n\'aurait rien reçu : les messages étaient déjà consommés et supprimés.',
          'Autres points de départ possibles : `last`, `next` (par défaut), un offset précis ou une date.'
        ],
        beats: [
          { say: 'Puis un service d\'**analytique** arrive en retard.', do: [{ cam: 'mid' }, { cons: ['left', { label: 'ANALYTICS', color: 'orange' }] }, { counters: { replayed: 0, lost: 0 } }] },
          { say: 'Son marque-page démarre au **début** du journal.', do: [{ bookmark: ['analytics', 1, 'orange'] }] },
          { say: 'RabbitMQ lui rejoue les **huit** commandes.', do: [{ replay: { from: 1, to: 8, cons: 'left', counter: 'replayed', bookmark: 'analytics' } }] },
          { say: 'Avec une file classique, il aurait reçu : **zéro**.' }
        ]
      },
      {
        t: 'Kafka répartit le travail comme une file',
        body: [
          'Côté Kafka, les **share groups** (KIP-932, « Queues for Kafka ») changent la règle des groupes classiques. Les consommateurs d\'un même share group se **partagent les enregistrements**, chacun traité par un seul consommateur à la fois, comme dans une file. On n\'est plus limité à un consommateur par partition.',
          'Quand un worker **acquiert** un enregistrement, celui-ci est **verrouillé** pour lui : **30 secondes par défaut** (`group.share.record.lock.duration.ms`). Pendant ce temps, personne d\'autre ne le reçoit.'
        ],
        beats: [
          { say: 'Deuxième round : Kafka, avec les **share groups**.', do: [{ broker: 'kafka' }, { bookmark: ['email', null] }, { bookmark: ['analytics', null] }, { cons: ['left', { label: 'WORKER 1', color: 'blue', down: false }] }, { cons: ['right', { label: 'WORKER 2', color: 'blue' }] }, { slots: [[1, 2, 3, 4, 5, 6], 'done'] }, { cam: 'mid' }] },
          { say: 'Les commandes sont **réparties** entre les workers. Chacune à un seul. Comme une file.' },
          { say: 'Le worker un demande en premier, et reçoit la commande **sept**.', do: [{ slot: [7, 'taken'] }, { travel: { slot: 7, to: 'left' } }, { hold: ['left', 7] }] },
          { say: 'Avec un **verrou** de trente secondes.', do: [{ lease: { slot: 7, who: 'WORKER 1' } }, { cam: 'top' }] }
        ]
      },
      {
        t: 'La panne, puis l\'expiration du verrou',
        body: [
          'Le worker 1 **plante** en tenant la commande #7. Tant que le verrou court, aucun autre worker ne la reçoit : la commande attend.',
          'À l\'**expiration** du verrou, Kafka **relâche** l\'enregistrement, qui redevient disponible. Le worker 2 l\'acquiert et la traite. Rien n\'est perdu.',
          'Revers de la médaille : la #7 a pu être **partiellement traitée** par le worker 1 avant sa panne. La livraison est donc **au moins une fois** : le traitement doit être **idempotent**. Par exemple, ne pas débiter deux fois un client pour la même commande.'
        ],
        beats: [
          { say: 'Et là, le worker un **plante**, en tenant toujours la commande sept.', do: [{ down: 'left' }, { slot: [7, 'stuck'] }, { cam: 'mid' }] },
          { say: 'Personne d\'autre ne peut la prendre. Le client **attend**.' },
          { say: 'Le verrou **expire**.', do: [{ cam: 'top' }, { leaseRun: 2600 }] },
          { say: 'Kafka remet la commande sept en jeu. Le worker deux la **prend**.', do: [{ cam: 'mid' }, { release: 'left' }, { lease: null }, { slot: [7, 'taken'] }, { travel: { slot: 7, to: 'right' } }, { hold: ['right', 7] }] },
          { say: 'Huit rejouées, **zéro** perdue.', do: [{ card: '8 REJOUÉES · 0 PERDUE' }], pause: 900 }
        ]
      },
      {
        t: 'À retenir',
        body: [
          '**RabbitMQ Streams** : un journal relisable, non destructif. Chaque consommateur garde sa position, et un nouveau venu peut repartir du début.',
          '**Kafka share groups** : une file de travail sur un topic Kafka. Les enregistrements sont distribués, verrouillés pendant le traitement (30 s par défaut), puis relâchés si le consommateur disparaît.',
          'Les deux mondes convergent. Le choix se fait donc sur le reste : écosystème, débit, routage fin (exchanges RabbitMQ), rétention longue et traitement de flux (Kafka), et compétences de l\'équipe. Dans les deux cas, la livraison est au moins une fois.'
        ],
        beats: [
          { say: 'Un stream RabbitMQ, c\'est un **journal** qu\'on peut relire.', do: [{ card: null }, { cam: 'all' }] },
          { say: 'Un share group Kafka, c\'est une **file** avec verrou. Trente secondes, par défaut.' },
          { say: 'Et dans les deux cas : traitements **idempotents**.' }
        ]
      }
    ],
    recap: [
      'RabbitMQ **Streams** : lecture **non destructive**, rejouable (`x-stream-offset: first`)',
      'File classique : l\'ACK **supprime** le message ; stream : il ne fait qu\'avancer la position',
      'Kafka **share groups** (KIP-932) : enregistrements **répartis** entre consommateurs, comme une file',
      'Verrou d\'acquisition : **30 s** par défaut (`group.share.record.lock.duration.ms`), puis relâché',
      'Livraison **au moins une fois** : traitements **idempotents**'
    ],
    build: {
      goal: 'Les commandes arrivent à **15 r/s** dans un topic Kafka consommé par un **share group**. Un worker traite **10 r/s**. Pendant Play, **tue un worker** avec sa croix ✕ : aucune commande ne doit être perdue, et le retard doit se résorber.',
      palette: ['worker'],
      start: { nodes: [{ id: 'c', type: 'client', x: 110, y: 280, rps: 15, label: 'Commandes' }, { id: 'q', type: 'queue', x: 400, y: 280, label: 'Topic (share group)', locked: true }], edges: [['c', 'q']] },
      reference: { nodes: [{ id: 'c', type: 'client', x: 110, y: 280, rps: 15, label: 'Commandes' }, { id: 'q', type: 'queue', x: 400, y: 280, label: 'Topic (share group)' }, { id: 'w1', type: 'worker', x: 720, y: 160 }, { id: 'w2', type: 'worker', x: 720, y: 280 }, { id: 'w3', type: 'worker', x: 720, y: 400 }], edges: [['c', 'q'], ['q', 'w1'], ['q', 'w2'], ['q', 'w3']] },
      check(m, fc, ctx) {
        const ws = fc.byType('worker');
        if (!ws.length) return { msg: 'Glisse des **Workers** et relie le topic à chacun (poignée **+**).' };
        if (m.drop > 0) return { msg: `${Math.round(m.drop)} r/s perdues : vérifie les liens.`, tone: 'bad' };
        if (!ctx.kills) return { msg: `${ws.length} worker(s) consomment le topic. Maintenant, **tue un worker** avec sa croix ✕.`, tone: 'info', partial: true };
        const alive = ws.filter(w => w.alive).reduce((a, w) => a + w.cap, 0);
        if (alive < 15) return { msg: `Les workers restants ne traitent que ${alive} r/s pour 15 r/s : le retard grossit (${Math.round(m.depth)} messages). Rien n'est perdu, mais il faut de la marge : N+1.`, tone: 'warn' };
        if (ctx.sinceKill < 4) return { msg: 'Panne en cours… les messages du worker tombé repassent aux autres.', tone: 'info', partial: true };
        if (m.depth > 5) return { msg: `Retard en cours de résorption : ${Math.round(m.depth)} messages en attente.`, tone: 'info', partial: true };
        return { ok: true, msg: 'Aucune commande perdue malgré la panne, et le retard est résorbé : le share group a redistribué le travail.' };
      }
    },
    quiz: [
      { q: 'Dans un stream RabbitMQ, que provoque la confirmation (ACK) d\'un consommateur ?', options: ['Le message est supprimé', 'Rien n\'est supprimé : seule la position du consommateur avance', 'Le message part en DLQ', 'Le stream est vidé'], answer: 1, why: 'La lecture d\'un stream est non destructive ; les messages ne disparaissent qu\'avec la politique de rétention.' },
      { q: 'Un service déployé en retard veut recevoir toutes les commandes passées. Quel réglage ?', options: ['x-stream-offset: next', 'x-stream-offset: first', 'Un TTL plus long', 'Un exchange fanout'], answer: 1, why: '« first » démarre au premier message encore conservé dans le stream. « next » (par défaut) ne livre que les nouveaux.' },
      { q: 'Que sont les share groups de Kafka (KIP-932) ?', options: ['Un mécanisme de réplication', 'Des groupes dont les membres se partagent les enregistrements, comme une file', 'Un format de compression', 'Un outil de monitoring'], answer: 1, why: 'Les enregistrements sont distribués entre consommateurs et verrouillés le temps du traitement : c\'est le comportement d\'une file.' },
      { q: 'Un worker d\'un share group plante en tenant un enregistrement. Que se passe-t-il ?', options: ['L\'enregistrement est perdu', 'Il est relâché à l\'expiration du verrou (30 s par défaut) et un autre consommateur le reçoit', 'Kafka redémarre le worker', 'Le topic est bloqué définitivement'], answer: 1, why: 'Le verrou d\'acquisition (group.share.record.lock.duration.ms) expire et l\'enregistrement redevient disponible.' },
      { q: 'Pourquoi le traitement doit-il être idempotent ?', options: ['Pour aller plus vite', 'Parce qu\'un message peut être livré plus d\'une fois (au moins une fois)', 'Parce que Kafka l\'impose', 'Pour économiser du stockage'], answer: 1, why: 'Le worker tombé a pu traiter partiellement le message avant sa panne ; le suivant le retraite.' }
    ]
  }
];
