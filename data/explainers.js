/* Animations « Comprendre en 1 minute ».
   Canevas 1000 × 560 (x : 100–900, y : 90–470) ; transposé automatiquement en portrait sur téléphone.
   Une étape = des « temps forts » (beats) : { say, do, pause }. Les actions d'un temps fort démarrent
   au moment où sa phrase commence à être prononcée ; pause = silence (ms) après la phrase (320 par défaut).
   Actions : move 'a>b' (+ token, c, delay, dur, offset, keep) · value [id, texte] · badge [id, texte, ok|bad|warn|info]
             show / hide (id ou liste) · glow (id ou liste : l'élément pulse).
   Voix enregistrée optionnelle : audio: true + fichiers audio/<id>/<n° d'étape>.mp3 (voir docs/animations/STORYBOARD.md). */
window.EXPLAINERS = [
  {
    id: 'dns', icon: '🌐', title: 'Comment un nom de domaine devient une adresse IP',
    question: 'Que se passe-t-il quand vous tapez www.exemple.fr ?',
    courses: ['aws-clf', 'az-900', 'aws-saa', 'aws-sysops'],
    nodes: {
      browser: { x: 120, y: 280, icon: '💻', label: 'Navigateur', c: 'blue' },
      cache: { x: 120, y: 450, kind: 'panel', label: 'Cache local', value: 'vide', c: 'grey' },
      resolver: { x: 400, y: 280, icon: '🔁', label: 'Résolveur DNS', sub: 'box, FAI, 8.8.8.8…', c: 'orange' },
      root: { x: 640, y: 100, icon: '🌍', label: 'Serveur racine', sub: '« . »', c: 'purple' },
      tld: { x: 860, y: 230, icon: '🏷️', label: 'Serveur .fr', sub: 'domaine de 1er niveau', c: 'purple' },
      auth: { x: 860, y: 420, icon: '📗', label: 'Serveur autoritaire', sub: 'zone exemple.fr', c: 'green' },
      web: { x: 400, y: 460, icon: '🖥️', label: 'Serveur web', sub: '93.184.216.34', c: 'cyan', hidden: true }
    },
    links: ['browser-resolver', 'resolver-root', 'resolver-tld', 'resolver-auth', 'browser-web', 'browser-cache'],
    steps: [
      { beats: [
        { say: "Vous tapez www.exemple.fr, et vous validez.", do: [{ glow: 'browser' }, { badge: ['browser', 'www.exemple.fr ?', 'warn'] }] },
        { say: "Problème : sur Internet, les machines ne se trouvent pas par leur nom…", pause: 200 },
        { say: "mais par une adresse IP. Il faut donc traduire.", pause: 500 }
      ] },
      { beats: [
        { say: "Premier réflexe : le navigateur regarde dans son cache.", do: [{ glow: 'cache' }] },
        { say: "Il est vide.", pause: 400 },
        { say: "Il demande alors au résolveur DNS, celui de votre box ou de votre opérateur.", do: [{ move: 'browser>resolver', token: 'exemple.fr ?' }] }
      ] },
      { beats: [
        { say: "Le résolveur ne connaît pas la réponse non plus.", pause: 200 },
        { say: "Il commence par le sommet : le serveur racine.", do: [{ move: 'resolver>root', token: '?' }] },
        { say: "La racine ne connaît que les extensions. Elle répond : demandez aux serveurs du point fr.", do: [{ move: 'root>resolver', token: '→ .fr', offset: 18, c: 'purple' }] }
      ] },
      { beats: [
        { say: "Le résolveur interroge donc le serveur du point fr.", do: [{ move: 'resolver>tld', token: '?' }] },
        { say: "Lui ne connaît pas l'adresse… mais il sait qui gère exemple point fr.", do: [{ move: 'tld>resolver', token: 'NS exemple.fr', offset: 18, c: 'purple' }] }
      ] },
      { beats: [
        { say: "Dernière question, au serveur qui fait autorité sur ce domaine.", do: [{ move: 'resolver>auth', token: '?' }] },
        { say: "Cette fois, c'est la bonne réponse : l'enregistrement A.", do: [{ glow: 'auth' }, { move: 'auth>resolver', token: 'A 93.184.216.34', offset: 18, c: 'green' }], pause: 500 }
      ] },
      { beats: [
        { say: "Le résolveur garde cette réponse en mémoire, pendant une durée appelée le TTL.", do: [{ badge: ['resolver', 'cache TTL 300 s', 'info'] }] },
        { say: "Puis il la renvoie au navigateur, qui la mémorise à son tour.", do: [{ move: 'resolver>browser', token: '93.184.216.34', c: 'green' }, { value: ['cache', '93.184.216.34'] }, { badge: ['browser', null] }] }
      ] },
      { beats: [
        { say: "Enfin, le navigateur peut contacter le serveur web.", do: [{ show: 'web' }, { move: 'browser>web', token: 'GET /' }] },
        { say: "La page arrive.", do: [{ move: 'web>browser', token: 'page HTML', offset: 18, c: 'cyan' }, { badge: ['browser', 'connecté ✓', 'ok'] }], pause: 400 },
        { say: "Et la prochaine fois ? Tout ce trajet est sauté, grâce au cache. C'est pour ça que le DNS paraît instantané." }
      ] }
    ],
    recap: ["DNS = annuaire d'Internet : **nom → adresse IP**", "Résolution : résolveur → racine → TLD (.fr) → serveur **autoritaire**", "Enregistrements : **A/AAAA** (IP), **CNAME** (alias), **MX** (mail), **NS**, **TXT**", "**TTL** = durée de mise en cache d'une réponse", "AWS **Route 53**, **Azure DNS** ; Alias/apex, routage par latence ou failover", "Dépanner : `dig`, `nslookup`, `dig +trace`"]
  },
  {
    id: 'paiement', icon: '💳', title: 'Paiement par carte : pourquoi « payé » arrive avant l\'argent',
    question: "Que se passe-t-il quand vous cliquez sur « Payer 60 € » ?",
    courses: ['spring-boot', 'nodejs', 'aws-dva'],
    nodes: {
      client: { x: 120, y: 110, icon: '🧑', label: 'Vous', sub: 'carte •••• 4242', c: 'blue' },
      shop: { x: 120, y: 340, icon: '🏪', label: 'Boutique', c: 'cyan' },
      psp: { x: 400, y: 340, icon: '⚙️', label: 'Prestataire', sub: 'Stripe, Adyen…', c: 'purple' },
      network: { x: 620, y: 110, icon: '💳', label: 'Réseau carte', sub: 'Visa, Mastercard', c: 'purple' },
      issuer: { x: 870, y: 110, icon: '🏦', label: 'Votre banque', sub: 'émettrice', c: 'orange' },
      hold: { x: 870, y: 290, kind: 'panel', label: 'Bloqué (votre compte)', value: '0 €', c: 'orange' },
      acquirer: { x: 620, y: 460, icon: '🏦', label: 'Banque du marchand', sub: 'acquéreuse', c: 'green' },
      settled: { x: 870, y: 460, kind: 'panel', label: 'Reçu (marchand)', value: '0 €', c: 'green' }
    },
    links: ['client-shop', 'shop-psp', 'psp-network', 'network-issuer', 'issuer-hold', 'network-acquirer', 'acquirer-settled'],
    steps: [
      { beats: [
        { say: "Vous cliquez sur « Payer 60 euros ».", do: [{ move: 'client>shop', token: '60 €' }] },
        { say: "Surprise : la boutique ne touche jamais à votre argent.", pause: 400 },
        { say: "Elle transmet simplement la demande à son prestataire de paiement.", do: [{ move: 'shop>psp', token: 'autoriser 60 €' }] }
      ] },
      { beats: [
        { say: "Le prestataire l'envoie au réseau de cartes…", do: [{ move: 'psp>network', token: 'autorisation' }] },
        { say: "qui la route jusqu'à votre banque.", do: [{ move: 'network>issuer', token: 'autorisation' }] }
      ] },
      { beats: [
        { say: "Votre banque vérifie : le solde, la fraude, le 3-D Secure.", do: [{ glow: 'issuer' }, { badge: ['issuer', '3-D Secure ✓', 'ok'] }] },
        { say: "Puis elle bloque 60 euros.", do: [{ value: ['hold', '60 €'] }], pause: 500 },
        { say: "Bloqué, pas débité. C'est ce qu'on appelle l'autorisation." }
      ] },
      { beats: [
        { say: "L'accord fait le chemin inverse, en une ou deux secondes.", do: [{ move: 'issuer>network', token: 'OK', c: 'green', offset: 18 }, { move: 'network>psp', token: 'OK', c: 'green', delay: 1400, offset: 18 }, { move: 'psp>shop', token: 'autorisé ✓', c: 'green', delay: 2800, offset: 18 }] },
        { say: "La boutique affiche « Payé ».", do: [{ badge: ['shop', 'PAYÉ ✓', 'ok'] }], pause: 400 },
        { say: "Elle a la garantie d'être payée… mais toujours pas l'argent." }
      ] },
      { beats: [
        { say: "Quelques jours plus tard, la commande est expédiée.", do: [{ badge: ['shop', 'EXPÉDIÉ 📦', 'info'] }] },
        { say: "Le marchand déclenche alors la capture : il confirme qu'il prend les 60 euros.", do: [{ move: 'shop>psp', token: 'capture 60 €', c: 'orange' }] }
      ] },
      { beats: [
        { say: "Les captures de la journée sont regroupées en lots…", do: [{ move: 'psp>network', token: 'lot de captures', c: 'orange' }] },
        { say: "puis compensées entre les banques, souvent la nuit. C'est le règlement.", do: [{ move: 'network>issuer', token: 'débiter', c: 'orange' }] }
      ] },
      { beats: [
        { say: "Votre banque transforme le blocage en vrai débit.", do: [{ value: ['hold', '0 €'] }, { badge: ['issuer', 'débité 60 €', 'warn'] }] },
        { say: "Et l'argent arrive enfin chez le marchand, un à trois jours après votre clic, moins les frais.", do: [{ move: 'issuer>network', token: '60 €', c: 'green', offset: 18 }, { move: 'network>acquirer', token: '60 €', c: 'green', delay: 1500 }, { value: ['settled', '59,10 €'] }] }
      ] },
      { beats: [
        { say: "Et si la capture n'arrive jamais ?", pause: 400 },
        { say: "Au bout de quelques jours, l'autorisation expire, et vos 60 euros sont simplement débloqués.", do: [{ badge: ['hold', 'expire après ≈ 7 j', 'info'] }] }
      ] }
    ],
    recap: ["**Autorisation** = l'argent est bloqué, pas débité", "**Capture** = le marchand confirme (souvent à l'expédition)", "**Règlement** = compensation entre banques, J+1 à J+3", "« Payé » à l'écran = garantie d'autorisation", "**Idempotence** : une clé unique par paiement, contre les doubles débits", "Données de carte : **PCI DSS**, tokenisation chez le prestataire"]
  },
  {
    id: 'https', icon: '🔒', title: 'HTTPS / TLS : comment le cadenas protège vos données',
    question: "Comment deux machines inventent-elles une clé secrète devant un espion ?",
    courses: ['aws-security', 'aws-saa', 'az-204', 'spring-boot'],
    nodes: {
      browser: { x: 140, y: 270, icon: '💻', label: 'Navigateur', c: 'blue' },
      server: { x: 860, y: 270, icon: '🖥️', label: 'Serveur', sub: 'api.exemple.fr', c: 'green' },
      ca: { x: 500, y: 100, icon: '🏛️', label: 'Autorité de certif.', sub: 'CA de confiance', c: 'purple' },
      spy: { x: 500, y: 450, icon: '🕵️', label: 'Espion', sub: 'Wi-Fi public', c: 'red', hidden: true }
    },
    links: ['browser-server', 'browser-ca', 'spy-browser'],
    steps: [
      { beats: [
        { say: "Vous allez envoyer votre mot de passe.", do: [{ glow: 'browser' }] },
        { say: "Mais sur ce Wi-Fi public, quelqu'un écoute peut-être tout ce qui passe.", do: [{ show: 'spy' }, { badge: ['spy', 'écoute tout 👂', 'bad'] }], pause: 500 },
        { say: "Il faut donc une clé secrète… sans jamais l'envoyer sur le réseau." }
      ] },
      { beats: [
        { say: "Premier message : le Client Hello.", do: [{ move: 'browser>server', token: 'ClientHello + part publique A', dur: 2000 }] },
        { say: "Le navigateur propose ses algorithmes, et donne sa moitié publique de l'échange de clés." }
      ] },
      { beats: [
        { say: "Réponse du serveur : le Server Hello.", do: [{ move: 'server>browser', token: 'ServerHello + certificat + part B', dur: 2000, offset: 18, c: 'green' }] },
        { say: "Il choisit l'algorithme, envoie sa propre moitié publique… et son certificat." }
      ] },
      { beats: [
        { say: "Le navigateur vérifie ce certificat.", do: [{ glow: 'ca' }, { move: 'browser>ca', token: 'signature ?' }] },
        { say: "Est-il signé par une autorité de confiance ? Pour ce domaine ? Encore valide ?", pause: 300 },
        { say: "Oui. On sait maintenant à qui on parle vraiment.", do: [{ move: 'ca>browser', token: 'de confiance ✓', c: 'green', offset: 18 }, { badge: ['browser', 'certificat ✓', 'ok'] }] }
      ] },
      { beats: [
        { say: "Et voici l'astuce de Diffie et Hellman.", pause: 300 },
        { say: "Chacun combine sa clé privée avec la moitié publique de l'autre.", do: [{ badge: ['browser', '🔑 clé K', 'ok'] }, { badge: ['server', '🔑 clé K', 'ok'] }] },
        { say: "Résultat : la même clé secrète des deux côtés. Elle n'a jamais circulé.", pause: 300 },
        { say: "L'espion a vu passer A et B… et ça ne lui sert à rien.", do: [{ badge: ['spy', 'A et B seuls : inutiles', 'warn'] }] }
      ] },
      { beats: [
        { say: "À partir de là, tout est chiffré avec cette clé.", do: [{ move: 'browser>server', token: '▓▒░▓▒░▓▒ chiffré', c: 'green' }, { move: 'server>browser', token: '░▓▒░▓▒ chiffré', c: 'green', delay: 1500, offset: 18 }] },
        { say: "L'espion ne voit que du bruit. Et la moindre modification serait détectée.", do: [{ badge: ['spy', '?!#@ illisible', 'bad'] }] }
      ] }
    ],
    recap: ["TLS = **confidentialité + intégrité + authentification** du serveur", "Certificat signé par une **CA** : nom de domaine + validité", "Échange de clés **éphémère** (ECDHE) : la clé ne circule jamais", "TLS 1.3 : poignée de main en **1 aller-retour**", "Certificats : **AWS ACM**, **Azure Key Vault**, Let's Encrypt", "**mTLS** : le client présente aussi un certificat (service à service)"]
  },
  {
    id: 'url', icon: '🧭', title: "De l'URL à la page : le voyage d'une requête",
    question: "Que se passe-t-il entre « Entrée » et l'affichage de la page ?",
    courses: ['aws-saa', 'aws-clf', 'react', 'spring-boot'],
    nodes: {
      browser: { x: 110, y: 290, icon: '💻', label: 'Navigateur', c: 'blue' },
      dns: { x: 300, y: 100, icon: '🌐', label: 'DNS', sub: 'Route 53', c: 'purple' },
      cdn: { x: 330, y: 360, icon: '⚡', label: 'CDN', sub: 'CloudFront / Front Door', c: 'orange' },
      lb: { x: 560, y: 360, icon: '⚖️', label: 'Load balancer', c: 'cyan' },
      app1: { x: 760, y: 200, icon: '🟩', label: 'API #1', c: 'green' },
      app2: { x: 760, y: 460, icon: '🟩', label: 'API #2', c: 'green' },
      db: { x: 900, y: 330, icon: '🗄️', label: 'Base', sub: 'PostgreSQL', c: 'pink' }
    },
    links: ['browser-dns', 'browser-cdn', 'cdn-lb', 'lb-app1', 'lb-app2', 'app2-db', 'app1-db'],
    steps: [
      { beats: [
        { say: "Vous appuyez sur Entrée. Chronomètre lancé.", do: [{ glow: 'browser' }], pause: 400 },
        { say: "D'abord, le DNS traduit le nom du site en adresse IP.", do: [{ move: 'browser>dns', token: 'boutique.fr ?' }] },
        { say: "Ici, l'adresse du point de présence CDN le plus proche de chez vous.", do: [{ move: 'dns>browser', token: 'IP du CDN', c: 'purple', offset: 18 }] }
      ] },
      { beats: [
        { say: "Le navigateur ouvre une connexion sécurisée avec ce CDN…", do: [{ glow: 'cdn' }] },
        { say: "et envoie sa requête.", do: [{ move: 'browser>cdn', token: 'GET /api/produits' }] }
      ] },
      { beats: [
        { say: "Les images et le JavaScript ? Le CDN les a déjà en copie : réponse immédiate.", pause: 300 },
        { say: "Mais une API, c'est des données fraîches : pas de cache.", do: [{ badge: ['cdn', 'cache : /api → miss', 'warn'] }] },
        { say: "La requête continue jusqu'au load balancer.", do: [{ move: 'cdn>lb', token: 'GET /api/produits' }] }
      ] },
      { beats: [
        { say: "Le load balancer doit choisir un serveur.", do: [{ glow: 'lb' }] },
        { say: "L'API numéro 1 est saturée.", do: [{ badge: ['app1', 'CPU 95 %', 'bad'] }], pause: 300 },
        { say: "Il envoie donc la requête à l'API numéro 2.", do: [{ glow: 'app2' }, { move: 'lb>app2', token: 'requête' }] }
      ] },
      { beats: [
        { say: "L'API exécute la logique métier…", do: [{ glow: 'app2' }] },
        { say: "et interroge la base de données.", do: [{ move: 'app2>db', token: 'SELECT …' }, { move: 'db>app2', token: '42 lignes', delay: 1600, c: 'pink', offset: 18 }] }
      ] },
      { beats: [
        { say: "La réponse remonte toute la chaîne…", do: [{ move: 'app2>lb', token: 'JSON', c: 'green', offset: 18 }, { move: 'lb>cdn', token: 'JSON', c: 'green', delay: 1300, offset: 18 }, { move: 'cdn>browser', token: '200 OK', c: 'green', delay: 2600, offset: 18 }] },
        { say: "et la page s'affiche.", do: [{ badge: ['browser', 'page affichée ✓', 'ok'] }], pause: 300 },
        { say: "Tout ça, en quelques centaines de millisecondes." }
      ] }
    ],
    recap: ["DNS → TCP → TLS → HTTP : **4 étapes** avant la réponse", "**CDN** : cache près de l'utilisateur pour le contenu statique", "**Load balancer** : répartit et évite les instances malades (health checks)", "Instances **sans état** derrière le LB = scalabilité horizontale", "La base est souvent le goulot : **cache**, réplicas, index", "Mesurer : latence p95, codes HTTP, traces distribuées"]
  },
  {
    id: 'autoscaling', icon: '📈', title: 'Load balancer et autoscaling face à un pic de trafic',
    question: 'Comment une application encaisse-t-elle un pic de trafic sans tomber ?',
    courses: ['aws-saa', 'aws-sysops', 'az-204', 'kubernetes', 'cloudwatch'],
    nodes: {
      users: { x: 110, y: 290, icon: '👥', label: 'Utilisateurs', c: 'blue' },
      lb: { x: 350, y: 290, icon: '⚖️', label: 'Load balancer', c: 'cyan' },
      a1: { x: 610, y: 120, icon: '🖥️', label: 'Instance 1', c: 'green' },
      a2: { x: 610, y: 290, icon: '🖥️', label: 'Instance 2', c: 'green' },
      a3: { x: 610, y: 460, icon: '🖥️', label: 'Instance 3', c: 'green', hidden: true },
      cpu: { x: 870, y: 160, kind: 'panel', label: 'CPU moyen · alarme 70 %', value: '40 %', c: 'orange' },
      asg: { x: 870, y: 400, kind: 'panel', label: 'Auto Scaling group', value: '2 / max 4', c: 'purple' }
    },
    links: ['users-lb', 'lb-a1', 'lb-a2', 'lb-a3', 'cpu-asg'],
    steps: [
      { beats: [
        { say: "Journée calme.", do: [{ move: 'users>lb', token: 'requêtes' }] },
        { say: "Le load balancer répartit les requêtes entre deux instances.", do: [{ move: 'lb>a1', token: 'req' }, { move: 'lb>a2', token: 'req' }] },
        { say: "Le processeur tourne à 40 pour cent. Tout va bien.", do: [{ glow: 'cpu' }] }
      ] },
      { beats: [
        { say: "Et soudain… une campagne marketing.", do: [{ move: 'users>lb', token: '× 5 requêtes', c: 'red' }], pause: 400 },
        { say: "Le trafic est multiplié par cinq.", do: [{ value: ['cpu', '85 %'] }] },
        { say: "Les deux instances saturent, les pages ralentissent.", do: [{ badge: ['a1', 'surchargée', 'bad'] }, { badge: ['a2', 'surchargée', 'bad'] }] }
      ] },
      { beats: [
        { say: "L'alarme reste au-dessus du seuil plusieurs minutes de suite.", do: [{ glow: 'cpu' }, { badge: ['cpu', 'ALARME', 'bad'] }] },
        { say: "Elle déclenche la politique de scaling.", do: [{ move: 'cpu>asg', token: 'scale out +1', c: 'red' }] }
      ] },
      { beats: [
        { say: "Le groupe lance une troisième instance, à partir d'un modèle.", do: [{ show: 'a3' }, { value: ['asg', '3 / max 4'] }] },
        { say: "Attention : tant que son contrôle de santé n'est pas vert, elle ne reçoit rien.", do: [{ badge: ['a3', 'démarrage…', 'warn'] }] }
      ] },
      { beats: [
        { say: "Contrôle réussi.", do: [{ badge: ['a3', 'healthy ✓', 'ok'] }], pause: 200 },
        { say: "Le load balancer l'ajoute à la rotation.", do: [{ move: 'lb>a3', token: 'req' }, { move: 'lb>a1', token: 'req' }, { move: 'lb>a2', token: 'req' }] },
        { say: "La charge se répartit sur trois instances, et le processeur redescend.", do: [{ value: ['cpu', '55 %'] }, { badge: ['a1', null] }, { badge: ['a2', null] }, { badge: ['cpu', null] }] }
      ] },
      { beats: [
        { say: "Et si une instance plante ?", do: [{ badge: ['a1', 'health check ✗', 'bad'] }], pause: 300 },
        { say: "Le load balancer arrête aussitôt de lui envoyer du trafic, et le groupe la remplace.", do: [{ badge: ['asg', 'remplacement…', 'warn'] }] },
        { say: "C'est l'auto-réparation." }
      ] },
      { beats: [
        { say: "Le soir, le pic retombe.", do: [{ badge: ['a1', null] }, { badge: ['asg', null] }, { value: ['cpu', '35 %'] }] },
        { say: "Le groupe supprime l'instance en trop.", do: [{ hide: 'a3' }, { value: ['asg', '2 / max 4'] }] },
        { say: "Vous ne payez la capacité que lorsqu'elle sert." }
      ] }
    ],
    recap: ["**Load balancer** : répartit et n'envoie qu'aux cibles saines", "**Auto Scaling** : min / désiré / max, réparti sur plusieurs **AZ**", "Déclencheur : **target tracking** (ex. CPU 50 %) ou alarme", "Nouvelle instance = trafic seulement après **health check**", "**Auto-réparation** : instance malade remplacée", "Équivalents : VM Scale Sets (Azure), HPA (Kubernetes)"]
  },
  {
    id: 'oauth', icon: '🔐', title: '« Se connecter avec… » : OAuth 2.0 et OpenID Connect',
    question: "Comment une application vous connecte sans jamais voir votre mot de passe ?",
    courses: ['aws-dva', 'az-204', 'spring-boot', 'aws-security', 'react'],
    nodes: {
      user: { x: 120, y: 290, icon: '🧑', label: 'Navigateur', sub: 'vous', c: 'blue' },
      app: { x: 470, y: 110, icon: '🛒', label: 'Application', sub: 'client OAuth', c: 'cyan' },
      idp: { x: 470, y: 450, icon: '🔐', label: "Fournisseur d'identité", sub: 'Entra ID, Cognito, Keycloak', c: 'purple' },
      api: { x: 860, y: 290, icon: '🗄️', label: 'API', sub: 'resource server', c: 'green' }
    },
    links: ['user-app', 'user-idp', 'app-idp', 'app-api'],
    steps: [
      { beats: [
        { say: "Vous cliquez sur « Se connecter ».", do: [{ move: 'user>app', token: 'Se connecter' }] },
        { say: "L'application ne vous demande pas votre mot de passe.", pause: 300 },
        { say: "Elle vous redirige vers le fournisseur d'identité, avec un petit défi secret, le PKCE.", do: [{ move: 'app>user', token: '302 → IdP + PKCE', offset: 18, c: 'cyan' }, { move: 'user>idp', token: 'client_id, scope', delay: 1500 }] }
      ] },
      { beats: [
        { say: "C'est chez lui, et seulement chez lui, que vous vous authentifiez.", do: [{ glow: 'idp' }] },
        { say: "Mot de passe, double authentification, règles d'accès.", do: [{ badge: ['idp', 'mot de passe + MFA ✓', 'ok'] }] },
        { say: "L'application ne voit rien de tout ça." }
      ] },
      { beats: [
        { say: "Le fournisseur vous renvoie vers l'application…", do: [{ move: 'idp>user', token: 'code=xyz', c: 'purple', offset: 18 }] },
        { say: "avec un code à usage unique, valable quelques secondes.", do: [{ move: 'user>app', token: 'code=xyz', c: 'purple' }] }
      ] },
      { beats: [
        { say: "En coulisse, l'application échange ce code, plus la réponse au défi PKCE…", do: [{ move: 'app>idp', token: 'code + verifier' }] },
        { say: "contre des jetons.", do: [{ move: 'idp>app', token: 'ID token + access token', c: 'purple', offset: 18 }], pause: 300 },
        { say: "Quelqu'un qui volerait le code seul n'en ferait rien." }
      ] },
      { beats: [
        { say: "L'ID token dit qui vous êtes : c'est OpenID Connect.", do: [{ badge: ['app', 'connecté : Ada ✓', 'ok'] }] },
        { say: "L'access token dit ce que l'application peut faire en votre nom : c'est OAuth." }
      ] },
      { beats: [
        { say: "L'application appelle l'API avec ce jeton.", do: [{ move: 'app>api', token: 'Bearer eyJhbGci…' }] },
        { say: "L'API vérifie la signature, l'émetteur, l'expiration et les droits… sans appeler personne.", do: [{ glow: 'api' }, { badge: ['api', 'JWT vérifié ✓', 'ok'] }] },
        { say: "Et elle répond.", do: [{ move: 'api>app', token: '200 données', c: 'green', offset: 18 }] }
      ] },
      { beats: [
        { say: "Un access token ne vit que quelques minutes.", do: [{ badge: ['app', 'token expiré → refresh', 'warn'] }] },
        { say: "À l'expiration, l'application utilise un refresh token…", do: [{ move: 'app>idp', token: 'refresh token' }] },
        { say: "et vous restez connecté, sans rien retaper.", do: [{ move: 'idp>app', token: 'nouvel access token', c: 'purple', offset: 18 }] }
      ] }
    ],
    recap: ["**OAuth 2.0** = autorisation déléguée ; **OIDC** = identité (ID token)", "Flux **Authorization Code + PKCE** pour les applications web et mobiles", "Le mot de passe ne va **que** chez le fournisseur d'identité", "Access token **JWT** vérifié par l'API : signature, iss, aud, exp, scopes", "Jetons courts + **refresh token**", "Service à service : flux **client credentials**"]
  },
  {
    id: 'queue', icon: '📬', title: 'Découpler avec une file de messages',
    question: "Comment absorber 500 commandes d'un coup sans faire tomber le site ?",
    courses: ['aws-saa', 'aws-dva', 'az-204'],
    nodes: {
      shop: { x: 120, y: 260, icon: '🛒', label: 'Site web', c: 'cyan' },
      queue: { x: 440, y: 260, kind: 'panel', label: 'File SQS / Service Bus', value: '0 message', c: 'orange' },
      w1: { x: 760, y: 140, icon: '⚙️', label: 'Worker 1', c: 'green' },
      w2: { x: 760, y: 380, icon: '⚙️', label: 'Worker 2', c: 'green', hidden: true },
      dlq: { x: 440, y: 450, kind: 'panel', label: 'Dead-letter queue', value: '0', c: 'red' }
    },
    links: ['shop-queue', 'queue-w1', 'queue-w2', 'queue-dlq'],
    steps: [
      { beats: [
        { say: "Un client valide sa commande.", do: [{ glow: 'shop' }] },
        { say: "Plutôt que de tout traiter tout de suite, le site dépose un message dans une file…", do: [{ move: 'shop>queue', token: 'commande #1' }, { value: ['queue', '1 message'] }] },
        { say: "et répond aussitôt : commande reçue.", do: [{ badge: ['shop', 'reçue ✓ (50 ms)', 'ok'] }] }
      ] },
      { beats: [
        { say: "De l'autre côté, un worker récupère le message.", do: [{ move: 'queue>w1', token: 'commande #1' }, { value: ['queue', '0 message'] }] },
        { say: "Il fait le travail : paiement, stock, e-mail.", do: [{ badge: ['w1', 'traitement…', 'warn'] }] },
        { say: "Pendant ce temps, le message est invisible pour les autres." }
      ] },
      { beats: [
        { say: "Une fois le travail réussi, le worker supprime le message.", do: [{ badge: ['w1', 'supprimé ✓', 'ok'] }] },
        { say: "Et s'il plante avant ? Le message réapparaît, et sera retraité.", pause: 300 },
        { say: "Rien n'est perdu." }
      ] },
      { beats: [
        { say: "Maintenant, le grand jeu : 500 commandes en une minute.", do: [{ move: 'shop>queue', token: '× 500', c: 'red' }, { value: ['queue', '500 messages'] }] },
        { say: "Le site reste rapide. Les messages s'accumulent simplement dans la file.", do: [{ badge: ['w1', 'débordé', 'bad'] }] }
      ] },
      { beats: [
        { say: "La longueur de la file déclenche l'arrivée d'un deuxième worker.", do: [{ show: 'w2' }] },
        { say: "La file se vide deux fois plus vite.", do: [{ move: 'queue>w1', token: 'lot' }, { move: 'queue>w2', token: 'lot' }, { value: ['queue', '120 messages'] }, { badge: ['w1', null] }] }
      ] },
      { beats: [
        { say: "Un message mal formé échoue une fois, deux fois, trois fois.", do: [{ glow: 'queue' }], pause: 300 },
        { say: "Plutôt que de bloquer tout le monde, il part dans la file des messages en échec, pour analyse.", do: [{ move: 'queue>dlq', token: 'commande #318 ✗', c: 'red' }, { value: ['dlq', '1'] }, { value: ['queue', '0 message'] }] }
      ] }
    ],
    recap: ["La file **découple** producteur et consommateur", "Le site répond vite ; le traitement est **asynchrone**", "**Visibility timeout** : message invisible pendant le traitement", "Supprimer après succès → **au moins une fois** → traitement **idempotent**", "Scaler les workers sur la **profondeur de file**", "**DLQ** pour les messages en échec ; FIFO si l'ordre compte"]
  },
  {
    id: 'cicd', icon: '🚀', title: 'Du commit à la production : un pipeline CI/CD',
    question: "Que se passe-t-il après un git push ?",
    courses: ['gitlab-ci', 'jenkins', 'az-400', 'aws-devops-pro', 'sonarqube', 'docker'],
    nodes: {
      dev: { x: 110, y: 290, icon: '👩‍💻', label: 'Développeuse', c: 'blue' },
      git: { x: 300, y: 290, icon: '🦊', label: 'GitLab', sub: 'merge request', c: 'orange' },
      build: { x: 500, y: 110, icon: '🔨', label: 'Build + tests', c: 'cyan' },
      sonar: { x: 500, y: 460, icon: '🔍', label: 'SonarQube', sub: 'quality gate', c: 'purple' },
      registry: { x: 680, y: 290, icon: '📦', label: 'Registre', sub: 'image Docker', c: 'cyan' },
      staging: { x: 880, y: 130, icon: '🧪', label: 'Staging', c: 'green' },
      prod: { x: 880, y: 440, icon: '🏭', label: 'Production', c: 'pink' }
    },
    links: ['dev-git', 'git-build', 'git-sonar', 'build-registry', 'sonar-registry', 'registry-staging', 'registry-prod'],
    steps: [
      { beats: [
        { say: "La développeuse pousse son code, et ouvre une merge request.", do: [{ move: 'dev>git', token: 'git push' }] },
        { say: "Aussitôt, GitLab lance le pipeline.", do: [{ glow: 'git' }, { badge: ['git', 'pipeline #812', 'info'] }] }
      ] },
      { beats: [
        { say: "Le code est compilé…", do: [{ move: 'git>build', token: 'commit a1b2c3' }] },
        { say: "et 312 tests unitaires tournent en parallèle.", do: [{ glow: 'build' }, { badge: ['build', '312 tests ✓', 'ok'] }] },
        { say: "Un seul test rouge, et tout s'arrête." }
      ] },
      { beats: [
        { say: "En parallèle, SonarQube analyse le nouveau code : bugs, failles, couverture.", do: [{ move: 'git>sonar', token: 'analyse' }] },
        { say: "La quality gate est verte.", do: [{ badge: ['sonar', 'gate ✓ couverture 84 %', 'ok'] }] }
      ] },
      { beats: [
        { say: "L'image Docker est construite, scannée…", do: [{ move: 'build>registry', token: 'image' }, { move: 'sonar>registry', token: '✓', c: 'purple' }] },
        { say: "puis rangée dans le registre, avec une étiquette qui ne changera jamais : l'identifiant du commit.", do: [{ badge: ['registry', 'api:a1b2c3', 'info'] }] }
      ] },
      { beats: [
        { say: "Déploiement automatique en staging.", do: [{ move: 'registry>staging', token: 'api:a1b2c3' }] },
        { say: "Des tests de fumée vérifient que l'essentiel fonctionne.", do: [{ badge: ['staging', 'smoke tests ✓', 'ok'] }], pause: 300 },
        { say: "Même image qu'en production. Seule la configuration change." }
      ] },
      { beats: [
        { say: "Pour la production, un humain approuve.", do: [{ badge: ['prod', 'approuvé 👍', 'info'] }], pause: 300 },
        { say: "Puis déploiement canari : dix pour cent du trafic d'abord, sous surveillance.", do: [{ move: 'registry>prod', token: 'canary 10 %' }, { badge: ['prod', 'canary 10 % …', 'warn'] }] }
      ] },
      { beats: [
        { say: "Les erreurs restent basses : on passe à cent pour cent.", do: [{ glow: 'prod' }, { badge: ['prod', '100 % ✓ en prod', 'ok'] }] },
        { say: "Si une alarme s'était déclenchée, le retour arrière aurait été automatique." }
      ] }
    ],
    recap: ["**CI** : chaque commit est construit et testé automatiquement", "**Quality gate** bloquante (SonarQube) et scans de sécurité", "Une **image immuable** taguée par commit, promue d'environnement en environnement", "Staging automatique, **prod avec approbation**", "Déploiement progressif : **canary** / blue-green + **rollback** sur alarme", "Indicateurs **DORA** : fréquence, lead time, taux d'échec, MTTR"]
  },
  {
    id: 'k8s', icon: '☸️', title: 'Kubernetes : la boucle de réconciliation',
    question: "Comment Kubernetes répare-t-il tout seul une application ?",
    courses: ['kubernetes', 'docker'],
    nodes: {
      user: { x: 110, y: 290, icon: '⌨️', label: 'kubectl apply', sub: 'replicas: 3', c: 'blue' },
      api: { x: 330, y: 290, icon: '🧠', label: 'API server', c: 'cyan' },
      etcd: { x: 330, y: 470, kind: 'panel', label: 'etcd : état souhaité', value: '—', c: 'purple' },
      ctrl: { x: 560, y: 110, icon: '🔁', label: 'Controller', sub: 'Deployment', c: 'orange' },
      sched: { x: 560, y: 450, icon: '📅', label: 'Scheduler', c: 'orange' },
      n1: { x: 860, y: 160, kind: 'panel', label: 'Nœud 1', value: '0 pod', c: 'green' },
      n2: { x: 860, y: 400, kind: 'panel', label: 'Nœud 2', value: '0 pod', c: 'green' }
    },
    links: ['user-api', 'api-etcd', 'api-ctrl', 'api-sched', 'sched-n1', 'sched-n2'],
    steps: [
      { beats: [
        { say: "Vous déclarez ce que vous voulez : trois copies de votre API.", do: [{ move: 'user>api', token: 'Deployment ×3' }] },
        { say: "Vous ne dites pas comment. Seulement quoi." }
      ] },
      { beats: [
        { say: "L'API server valide la demande…", do: [{ glow: 'api' }] },
        { say: "et l'inscrit dans etcd, la mémoire du cluster.", do: [{ move: 'api>etcd', token: 'désiré : 3' }, { value: ['etcd', '3 répliques'] }] }
      ] },
      { beats: [
        { say: "Le contrôleur compare sans cesse ce qui est voulu, et ce qui existe.", do: [{ glow: 'ctrl' }] },
        { say: "Voulu : trois. Réel : zéro.", do: [{ badge: ['ctrl', 'réel 0 / désiré 3', 'warn'] }], pause: 300 },
        { say: "Il demande trois pods.", do: [{ move: 'ctrl>api', token: '+3 pods' }] }
      ] },
      { beats: [
        { say: "Le scheduler choisit où les placer, selon la place disponible sur chaque nœud.", do: [{ move: 'api>sched', token: '3 pods en attente' }] },
        { say: "Deux ici, un là.", do: [{ move: 'sched>n1', token: 'pod' }, { move: 'sched>n2', token: 'pod' }, { value: ['n1', '2 pods'] }, { value: ['n2', '1 pod'] }] },
        { say: "Réel : trois. Tout est en ordre.", do: [{ badge: ['ctrl', 'réel 3 / désiré 3 ✓', 'ok'] }] }
      ] },
      { beats: [
        { say: "Panne.", pause: 300 },
        { say: "Le nœud 2 disparaît, et son pod avec lui.", do: [{ value: ['n2', 'HORS LIGNE'] }, { badge: ['n2', 'NotReady', 'bad'] }] },
        { say: "Réel : deux sur trois.", do: [{ badge: ['ctrl', 'réel 2 / désiré 3', 'bad'] }] }
      ] },
      { beats: [
        { say: "Personne n'intervient.", pause: 300 },
        { say: "Le contrôleur voit l'écart, et redemande un pod.", do: [{ glow: 'ctrl' }, { move: 'ctrl>api', token: '+1 pod' }] },
        { say: "Le scheduler le place sur le nœud 1.", do: [{ move: 'sched>n1', token: 'pod' }, { value: ['n1', '3 pods'] }] },
        { say: "La réalité a rejoint la demande. C'est ça, la réconciliation.", do: [{ badge: ['ctrl', 'réel 3 / désiré 3 ✓', 'ok'] }] }
      ] }
    ],
    recap: ["Modèle **déclaratif** : on décrit l'état souhaité", "**etcd** stocke l'état ; seul l'**API server** y accède", "**Contrôleurs** : boucle souhaité vs réel → corrigent l'écart", "**Scheduler** : place les pods selon requests, taints, affinités", "**kubelet** démarre les conteneurs sur chaque nœud", "Résultat : auto-réparation, rolling updates, scaling"]
  },
  {
    id: 'events', icon: '📜', title: 'Architecture orientée événements avec Kafka',
    question: "Comment des services réagissent-ils sans se connaître ?",
    courses: ['aws-saa', 'az-204', 'aws-sap', 'spring-boot'],
    nodes: {
      orders: { x: 120, y: 290, icon: '🛒', label: 'Service Commandes', sub: 'producteur', c: 'cyan' },
      topic: { x: 430, y: 290, kind: 'panel', label: 'Topic « commandes »', value: 'offset 0', c: 'orange' },
      billing: { x: 790, y: 110, icon: '🧾', label: 'Facturation', sub: 'groupe A', c: 'green' },
      stock: { x: 790, y: 290, icon: '📦', label: 'Stock', sub: 'groupe B', c: 'green' },
      notif: { x: 790, y: 460, icon: '✉️', label: 'Notifications', sub: 'groupe C (nouveau)', c: 'pink', hidden: true }
    },
    links: ['orders-topic', 'topic-billing', 'topic-stock', 'topic-notif'],
    steps: [
      { beats: [
        { say: "Une commande vient d'être créée.", do: [{ glow: 'orders' }] },
        { say: "Le service Commandes n'appelle personne.", pause: 300 },
        { say: "Il publie un événement, un fait : « commande créée ».", do: [{ move: 'orders>topic', token: 'CommandeCréée #42' }, { value: ['topic', 'offset 1'] }] }
      ] },
      { beats: [
        { say: "Cet événement atterrit dans un topic Kafka.", do: [{ glow: 'topic' }] },
        { say: "Un journal ordonné, et durable : les événements y restent, même après lecture.", do: [{ badge: ['topic', 'rétention 7 jours', 'info'] }] }
      ] },
      { beats: [
        { say: "La facturation lit l'événement, et prépare la facture.", do: [{ move: 'topic>billing', token: '#42' }, { badge: ['billing', 'facture ✓', 'ok'] }] },
        { say: "Le stock le lit aussi, de son côté.", do: [{ move: 'topic>stock', token: '#42' }, { badge: ['stock', 'stock −1 ✓', 'ok'] }] },
        { say: "Chacun avance à son rythme, avec son propre marque-page : l'offset." }
      ] },
      { beats: [
        { say: "Coup dur : le service Stock tombe en panne.", do: [{ badge: ['stock', 'en panne', 'bad'] }], pause: 300 },
        { say: "Les commandes, elles, continuent d'arriver.", do: [{ move: 'orders>topic', token: '#43, #44, #45' }, { value: ['topic', 'offset 4'] }] },
        { say: "La facturation suit normalement. Personne n'est bloqué.", do: [{ move: 'topic>billing', token: '#43–45' }] }
      ] },
      { beats: [
        { say: "Le stock redémarre.", do: [{ glow: 'stock' }] },
        { say: "Il reprend exactement là où il s'était arrêté, grâce à son offset.", do: [{ move: 'topic>stock', token: '#43–45' }, { badge: ['stock', 'rattrape 43→45 ✓', 'ok'] }] },
        { say: "Aucun événement perdu." }
      ] },
      { beats: [
        { say: "Nouveau besoin : envoyer des notifications.", do: [{ show: 'notif' }] },
        { say: "On ajoute un consommateur, sans toucher au producteur.", pause: 300 },
        { say: "Et il peut même relire tout l'historique.", do: [{ move: 'topic>notif', token: 'rejeu #42–45' }, { badge: ['notif', 'e-mails ✓', 'ok'] }] }
      ] }
    ],
    recap: ["Le producteur **publie un fait**, sans connaître les consommateurs", "**Topic** = journal durable, partitionné, ordonné par **clé**", "Chaque **groupe de consommateurs** a son **offset**", "Panne d'un consommateur = **retard**, pas de perte", "Ajouter un service sans modifier les autres ; **rejeu** possible", "Livraison **au moins une fois** → consommateurs **idempotents** (Kafka, EventBridge, Event Hubs)"]
  },
  {
    id: 'rag', icon: '🤖', title: 'RAG : brancher un LLM sur vos propres documents',
    question: "Comment un assistant IA répond-il avec VOS documents, sans les inventer ?",
    courses: ['python', 'aws-sap', 'az-305'],
    nodes: {
      docs: { x: 120, y: 110, icon: '📚', label: 'Documents', sub: 'procédures, wikis, PDF', c: 'blue' },
      embed: { x: 400, y: 110, icon: '🔢', label: "Modèle d'embedding", c: 'purple' },
      vdb: { x: 700, y: 110, kind: 'panel', label: 'Base vectorielle', value: '0 vecteur', c: 'orange' },
      user: { x: 120, y: 440, icon: '🧑', label: 'Utilisateur', c: 'blue' },
      app: { x: 400, y: 440, icon: '🧩', label: 'Application RAG', c: 'cyan' },
      llm: { x: 820, y: 440, icon: '🧠', label: 'LLM', sub: 'Claude, GPT, Mistral…', c: 'green' }
    },
    links: ['docs-embed', 'embed-vdb', 'user-app', 'app-embed', 'app-vdb', 'app-llm'],
    steps: [
      { beats: [
        { say: "D'abord, on prépare le terrain.", do: [{ glow: 'docs' }] },
        { say: "Les documents sont découpés en petits passages.", do: [{ move: 'docs>embed', token: '1 240 passages' }] },
        { say: "Chacun devient un vecteur : une liste de nombres qui représente son sens.", do: [{ move: 'embed>vdb', token: '[0.12, -0.83, …]', c: 'purple' }, { value: ['vdb', '1 240 vecteurs'] }] }
      ] },
      { beats: [
        { say: "Un utilisateur pose une question :", do: [{ glow: 'user' }], pause: 200 },
        { say: "« Que faire si je perds mon badge ? »", do: [{ move: 'user>app', token: 'badge perdu ?' }] }
      ] },
      { beats: [
        { say: "La question, elle aussi, est transformée en vecteur…", do: [{ move: 'app>embed', token: 'question' }] },
        { say: "avec exactement le même modèle.", do: [{ move: 'embed>app', token: '[0.10, -0.79, …]', c: 'purple', offset: 18 }] }
      ] },
      { beats: [
        { say: "La base vectorielle cherche les passages dont le sens est le plus proche.", do: [{ move: 'app>vdb', token: 'top 3 similaires ?' }] },
        { say: "Pas une recherche par mots-clés : une recherche par idées.", do: [{ move: 'vdb>app', token: '3 passages', c: 'orange', offset: 18 }, { badge: ['vdb', 'similarité 0,91', 'info'] }] }
      ] },
      { beats: [
        { say: "L'application construit la consigne : les règles, les passages trouvés, et la question.", do: [{ move: 'app>llm', token: 'consignes + 3 passages + question', dur: 2000 }] },
        { say: "Le modèle rédige sa réponse en s'appuyant uniquement sur ces sources.", do: [{ glow: 'llm' }, { move: 'llm>app', token: 'réponse + sources', delay: 1200, c: 'green', offset: 18 }] }
      ] },
      { beats: [
        { say: "L'utilisateur reçoit une réponse, avec ses sources citées.", do: [{ move: 'app>user', token: 'réponse [doc 12]', c: 'green', offset: 18 }, { badge: ['user', 'sources citées ✓', 'ok'] }] },
        { say: "Deux règles d'or : on ne cherche que dans les documents auxquels il a droit…", pause: 200 },
        { say: "et on mesure régulièrement la qualité des réponses." }
      ] }
    ],
    recap: ["**RAG** = Retrieval-Augmented Generation : chercher puis générer", "**Embeddings** : le sens d'un texte sous forme de vecteur", "**Base vectorielle** : pgvector, OpenSearch, Azure AI Search…", "Réponses **ancrées** sur vos documents, avec **citations**", "Sécurité : filtrer par **droits d'accès**, données sensibles hors des prompts", "**MCP** : protocole standard pour brancher outils et données à un assistant IA"]
  },
  {
    id: 'eventloop', icon: '🔄', title: "Node.js : la boucle d'événements",
    question: "Comment un seul thread sert-il des milliers de requêtes ?",
    courses: ['nodejs', 'react'],
    nodes: {
      stack: { x: 140, y: 290, kind: 'panel', label: "Pile d'appels (1 thread)", value: 'vide', c: 'blue' },
      libuv: { x: 500, y: 110, icon: '⏱️', label: 'libuv / OS', sub: 'I/O, timers, threads', c: 'purple' },
      micro: { x: 500, y: 460, kind: 'panel', label: 'File des microtâches', value: '—', c: 'pink' },
      macro: { x: 860, y: 460, kind: 'panel', label: 'File des callbacks', value: '—', c: 'orange' },
      loop: { x: 860, y: 110, icon: '🔄', label: "Boucle d'événements", c: 'green' }
    },
    links: ['stack-libuv', 'libuv-macro', 'macro-loop', 'loop-stack', 'stack-micro', 'micro-loop'],
    steps: [
      { beats: [
        { say: "Une requête arrive sur votre serveur Node.js.", do: [{ glow: 'stack' }] },
        { say: "Son code s'exécute sur un seul et unique fil d'exécution : la pile d'appels.", do: [{ value: ['stack', 'handler()'] }] }
      ] },
      { beats: [
        { say: "Le code a besoin de la base de données.", pause: 200 },
        { say: "Node ne va pas attendre bêtement.", pause: 300 },
        { say: "Il confie la lecture au système, via libuv…", do: [{ move: 'stack>libuv', token: 'db.query(…)' }, { badge: ['libuv', 'I/O en cours…', 'warn'] }] },
        { say: "et libère aussitôt la pile.", do: [{ value: ['stack', 'vide'] }] }
      ] },
      { beats: [
        { say: "Pendant que la base cherche, le fil sert d'autres requêtes.", do: [{ glow: 'stack' }, { value: ['stack', 'requête 2, 3, 4…'] }] },
        { say: "Voilà tout le secret : il n'attend jamais les entrées-sorties.", do: [{ badge: ['stack', 'jamais bloqué', 'ok'] }] }
      ] },
      { beats: [
        { say: "La base répond.", do: [{ badge: ['libuv', null] }] },
        { say: "libuv dépose le callback dans la file d'attente.", do: [{ move: 'libuv>macro', token: 'callback db' }, { value: ['macro', 'callback db'] }] },
        { say: "Une promesse résolue, elle, va dans une file prioritaire : celle des microtâches.", do: [{ move: 'stack>micro', token: 'Promise.then' }, { value: ['micro', 'Promise.then'] }] }
      ] },
      { beats: [
        { say: "Dès que la pile est vide, la boucle d'événements prend le relais.", do: [{ value: ['stack', 'vide'] }, { glow: 'loop' }] },
        { say: "D'abord, toutes les microtâches.", do: [{ move: 'micro>loop', token: 'Promise.then' }, { move: 'loop>stack', token: 'microtâche', delay: 1500 }, { value: ['micro', '—'] }] },
        { say: "Ensuite seulement, le callback suivant.", do: [{ move: 'macro>loop', token: 'callback' }, { move: 'loop>stack', token: 'callback db', delay: 1500 }, { value: ['macro', '—'] }] }
      ] },
      { beats: [
        { say: "Le piège, maintenant.", pause: 300 },
        { say: "Un gros calcul, synchrone, occupe la pile pendant deux secondes.", do: [{ value: ['stack', 'calcul 2 s ⛔'] }, { badge: ['stack', 'BLOQUÉ', 'bad'] }] },
        { say: "Plus rien ne passe. Toutes les requêtes attendent.", do: [{ value: ['macro', '57 en attente'] }], pause: 300 },
        { say: "La solution : des worker threads, ou un service dédié au calcul." }
      ] }
    ],
    recap: ["**Un thread** pour le JavaScript, **libuv** pour les I/O", "Les I/O sont **déléguées** : le thread n'attend jamais", "**Microtâches** (promesses) avant les **callbacks**", "Ne **jamais** bloquer : pas de `*Sync`, pas de gros calcul dans une requête", "CPU intensif → **worker_threads** ou autre service", "Idéal : API, BFF, temps réel ; moins pour le calcul"]
  },
  {
    id: 'docker', icon: '🐳', title: 'Docker : du Dockerfile au conteneur',
    question: "Que se passe-t-il entre « docker build » et une application qui tourne ?",
    courses: ['docker', 'kubernetes', 'gitlab-ci'],
    nodes: {
      dockerfile: { x: 120, y: 140, icon: '📄', label: 'Dockerfile', sub: 'la recette', c: 'blue' },
      build: { x: 380, y: 140, icon: '🔨', label: 'docker build', sub: 'BuildKit', c: 'cyan' },
      image: { x: 640, y: 140, kind: 'panel', label: 'Image (couches)', value: '0 couche', c: 'orange' },
      registry: { x: 880, y: 140, icon: '📦', label: 'Registre', sub: 'ECR, ACR, GitLab', c: 'purple' },
      host: { x: 880, y: 420, icon: '🖥️', label: 'Serveur', sub: 'Docker Engine', c: 'cyan' },
      container: { x: 560, y: 420, kind: 'panel', label: 'Conteneur', value: 'aucun', c: 'green' },
      kernel: { x: 240, y: 420, icon: '🐧', label: 'Noyau Linux', sub: 'namespaces + cgroups', c: 'grey' }
    },
    links: ['dockerfile-build', 'build-image', 'image-registry', 'registry-host', 'host-container', 'container-kernel'],
    steps: [
      { beats: [
        { say: "Tout commence par un Dockerfile.", do: [{ glow: 'dockerfile' }] },
        { say: "C'est une recette : une image de départ, des fichiers à copier, des commandes à lancer.", do: [{ badge: ['dockerfile', 'FROM · COPY · RUN', 'info'] }] }
      ] },
      { beats: [
        { say: "La commande docker build lit la recette, ligne par ligne.", do: [{ move: 'dockerfile>build', token: 'docker build' }] },
        { say: "Chaque instruction produit une couche, en lecture seule.", do: [{ glow: 'build' }, { value: ['image', '4 couches'] }], pause: 300 },
        { say: "Au build suivant, les couches qui n'ont pas changé viennent du cache : quelques secondes au lieu de quelques minutes.", do: [{ badge: ['build', 'cache ✓', 'ok'] }] }
      ] },
      { beats: [
        { say: "Le résultat, c'est une image.", do: [{ move: 'build>image', token: 'api:1.4.2' }] },
        { say: "Un paquet figé, identifié par une empreinte unique : son digest.", do: [{ badge: ['image', 'sha256:9f2c…', 'info'] }] }
      ] },
      { beats: [
        { say: "On pousse l'image dans un registre.", do: [{ move: 'image>registry', token: 'docker push' }] },
        { say: "Elle devient disponible pour tous les serveurs autorisés.", do: [{ badge: ['registry', 'api:1.4.2 ✓', 'ok'] }] }
      ] },
      { beats: [
        { say: "Sur le serveur, on lance docker run.", do: [{ glow: 'host' }] },
        { say: "Docker télécharge l'image… seulement les couches qui lui manquent.", do: [{ move: 'registry>host', token: 'docker pull' }] },
        { say: "Puis il démarre un conteneur : l'image, plus une fine couche d'écriture.", do: [{ move: 'host>container', token: 'docker run' }, { value: ['container', 'en marche'] }] }
      ] },
      { beats: [
        { say: "Attention : un conteneur n'est pas une machine virtuelle.", pause: 300 },
        { say: "C'est un simple processus, isolé par le noyau Linux.", do: [{ glow: 'kernel' }, { move: 'container>kernel', token: 'processus' }] },
        { say: "Les namespaces lui donnent sa propre vue : ses processus, son réseau, ses fichiers.", do: [{ badge: ['kernel', 'namespaces : isolation', 'info'] }] },
        { say: "Les cgroups limitent ce qu'il consomme : processeur et mémoire.", do: [{ badge: ['kernel', 'cgroups : 1 CPU · 512 Mo', 'info'] }] }
      ] },
      { beats: [
        { say: "Si on supprime le conteneur, sa couche d'écriture disparaît avec lui.", do: [{ value: ['container', 'supprimé'] }, { badge: ['container', 'données perdues ✗', 'bad'] }], pause: 300 },
        { say: "Les données à garder vont donc dans un volume.", do: [{ badge: ['container', 'volume = données gardées', 'ok'] }] },
        { say: "Et pour redéployer ? On relance la même image. Identique, partout.", do: [{ move: 'host>container', token: 'docker run' }, { value: ['container', 'en marche'] }] }
      ] }
    ],
    recap: ["**Dockerfile** = recette ; chaque instruction crée une **couche**", "Le **cache de couches** accélère les builds : dépendances avant le code", "**Image** immuable, identifiée par son **digest** ; taguée par version", "**Registre** (ECR, ACR, GitLab) : push puis pull des seules couches manquantes", "**Conteneur** = processus isolé : **namespaces** (vue) + **cgroups** (limites)", "Couche d'écriture **éphémère** → données dans un **volume**"]
  }
];

/* Mode « Apprendre » (concepts) : catégorie et titre de chaque section, dans l'ordre des étapes. */
(function () {
  const T = {
    dns: ['Réseau & Web', ['Un nom, mais pas d\'adresse', 'Le cache, puis le résolveur', 'Le serveur racine', 'Le serveur du domaine de premier niveau', 'Le serveur qui fait autorité', 'Mémoriser la réponse : le TTL', 'Enfin, la page']],
    url: ['Réseau & Web', ['Le DNS mène au CDN', 'Connexion sécurisée et requête', 'Ce que le CDN garde, et ce qu\'il transmet', 'Le load balancer choisit un serveur', 'Logique métier et base de données', 'Le retour, en quelques centaines de millisecondes']],
    https: ['Sécurité & identité', ['Le problème du Wi-Fi public', 'Client Hello', 'Server Hello et certificat', 'Vérifier le certificat', 'L\'astuce de Diffie-Hellman', 'Tout est chiffré']],
    autoscaling: ['Scalabilité', ['Une journée calme', 'Le pic de trafic', 'L\'alarme déclenche le scaling', 'Une nouvelle instance démarre', 'Ajoutée à la rotation', 'L\'auto-réparation', 'Le soir, on réduit']],
    oauth: ['Sécurité & identité', ['Redirection vers le fournisseur', 'L\'authentification chez lui seul', 'Le code à usage unique', 'Échanger le code contre des jetons', 'ID token et access token', 'Appeler l\'API avec le jeton', 'Rafraîchir sans retaper']],
    paiement: ['Sécurité & identité', ['Le clic sur « Payer »', 'Du prestataire au réseau de cartes', 'L\'autorisation', '« Payé »… mais pas encore encaissé', 'La capture', 'Compensation et règlement', 'L\'argent arrive enfin', 'Et si la capture n\'arrive jamais ?']],
    queue: ['Messages & événements', ['Déposer un message et répondre', 'Un worker prend le message', 'Acquitter, ou réessayer', 'Le grand pic', 'Plus de workers', 'Les messages en échec']],
    events: ['Messages & événements', ['Publier un fait, pas un appel', 'Le topic : un journal durable', 'Chaque consommateur à son rythme', 'Une panne ne bloque personne', 'Reprendre grâce à l\'offset', 'Ajouter un consommateur']],
    cicd: ['Conteneurs & DevOps', ['Le push déclenche le pipeline', 'Build et tests', 'La quality gate', 'L\'image et son étiquette immuable', 'Staging et tests de fumée', 'Approbation et canari', 'Passage à 100 %']],
    docker: ['Conteneurs & DevOps', ['Le Dockerfile, une recette', 'docker build et les couches', 'L\'image et son digest', 'Le registre', 'docker run : le conteneur', 'Un processus isolé, pas une VM', 'Volumes et redéploiement']],
    k8s: ['Conteneurs & DevOps', ['Déclarer ce qu\'on veut', 'L\'API server et etcd', 'Le contrôleur compare', 'Le scheduler place les pods', 'Une panne', 'La réconciliation']],
    eventloop: ['Runtime & IA', ['Un seul fil d\'exécution', 'Déléguer les entrées-sorties', 'Ne jamais attendre', 'Les files de callbacks et de microtâches', 'La boucle d\'événements', 'Le piège : bloquer la pile']],
    rag: ['Runtime & IA', ['Préparer : découper et vectoriser', 'La question', 'La question devient un vecteur', 'Recherche par le sens', 'La consigne et la réponse', 'Sources et règles d\'or']]
  };
  (window.EXPLAINERS || []).forEach(x => {
    const t = T[x.id]; if (!t) return;
    x.cat = t[0];
    x.steps.forEach((s, i) => { s.t = t[1][i] || ('Étape ' + (i + 1)); });
  });
})();
