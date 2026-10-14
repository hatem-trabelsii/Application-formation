/* Animations « Comprendre en 1 minute ». Coordonnées sur un canevas 1000 × 560 (x : 100–900, y : 90–470).
   Actions d'une étape : move 'a>b' (+ token, c, delay, offset, keep), value [id, texte], badge [id, texte, ok|bad|warn|info],
   show / hide (id ou liste), glow (id ou liste). */
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
      { say: "Vous tapez www.exemple.fr. Mais sur Internet, les machines ne se trouvent que par leur adresse IP : il faut traduire ce nom.", do: [{ glow: 'browser' }, { badge: ['browser', 'www.exemple.fr ?', 'warn'] }] },
      { say: "Le navigateur regarde d'abord dans son cache. Il est vide : il pose la question au résolveur DNS de votre box ou de votre fournisseur d'accès.", do: [{ glow: 'cache' }, { move: 'browser>resolver', token: 'exemple.fr ?' }] },
      { say: "Le résolveur ne connaît pas la réponse. Il demande au serveur racine, qui ne connaît que les extensions : il renvoie vers les serveurs du point fr.", do: [{ move: 'resolver>root', token: '?' }, { move: 'root>resolver', token: '→ .fr', delay: 1700, offset: 18, c: 'purple' }] },
      { say: "Le serveur du point fr ne connaît pas l'adresse non plus, mais il sait qui gère exemple point fr : il renvoie l'adresse du serveur faisant autorité.", do: [{ move: 'resolver>tld', token: '?' }, { move: 'tld>resolver', token: 'NS exemple.fr', delay: 1700, offset: 18, c: 'purple' }] },
      { say: "Le serveur faisant autorité possède la zone. Il répond avec l'enregistrement A : l'adresse IP 93.184.216.34.", do: [{ glow: 'auth' }, { move: 'resolver>auth', token: '?' }, { move: 'auth>resolver', token: 'A 93.184.216.34', delay: 1700, offset: 18, c: 'green' }] },
      { say: "Le résolveur garde la réponse en cache pendant la durée du TTL, puis la renvoie au navigateur, qui la mémorise aussi.", do: [{ badge: ['resolver', 'cache TTL 300 s', 'info'] }, { move: 'resolver>browser', token: '93.184.216.34', c: 'green' }, { value: ['cache', '93.184.216.34'] }, { badge: ['browser', null] }] },
      { say: "Le navigateur peut enfin contacter le serveur web. Les visites suivantes sautent toutes ces étapes grâce au cache : c'est pour ça que le DNS est rapide.", do: [{ show: 'web' }, { move: 'browser>web', token: 'GET /' }, { move: 'web>browser', token: 'page HTML', delay: 1700, offset: 18, c: 'cyan' }, { badge: ['browser', 'connecté ✓', 'ok'] }] }
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
      { say: "Vous cliquez sur Payer 60 euros. La boutique ne touche jamais à votre argent : elle transmet la demande à son prestataire de paiement.", do: [{ move: 'client>shop', token: '60 €' }, { move: 'shop>psp', token: 'autoriser 60 €', delay: 1600 }] },
      { say: "Le prestataire envoie la demande au réseau de cartes, qui la route vers votre banque.", do: [{ move: 'psp>network', token: 'autorisation' }, { move: 'network>issuer', token: 'autorisation', delay: 1600 }] },
      { say: "Votre banque vérifie le solde, les règles anti-fraude, le 3-D Secure… et bloque 60 euros. C'est l'autorisation : rien n'est encore débité.", do: [{ glow: 'issuer' }, { value: ['hold', '60 €'] }, { badge: ['issuer', '3-D Secure ✓', 'ok'] }] },
      { say: "L'accord revient en une ou deux secondes. La boutique affiche Payé : elle a la garantie d'être payée, pas encore l'argent.", do: [{ move: 'issuer>network', token: 'OK', c: 'green', offset: 18 }, { move: 'network>psp', token: 'OK', c: 'green', delay: 1400, offset: 18 }, { move: 'psp>shop', token: 'autorisé ✓', c: 'green', delay: 2800, offset: 18 }, { badge: ['shop', 'PAYÉ ✓', 'ok'] }] },
      { say: "Quand la commande est expédiée, le marchand déclenche la capture : il confirme qu'il prend réellement les 60 euros.", do: [{ badge: ['shop', 'EXPÉDIÉ 📦', 'info'] }, { move: 'shop>psp', token: 'capture 60 €', c: 'orange' }] },
      { say: "Les captures de la journée sont regroupées en lots, puis compensées entre les banques, souvent la nuit. C'est le règlement.", do: [{ move: 'psp>network', token: 'lot de captures', c: 'orange' }, { move: 'network>issuer', token: 'débiter', delay: 1600, c: 'orange' }] },
      { say: "Votre banque transforme le blocage en débit, et l'argent arrive sur le compte du marchand, un à trois jours plus tard, moins les frais.", do: [{ value: ['hold', '0 €'] }, { badge: ['issuer', 'débité 60 €', 'warn'] }, { move: 'issuer>network', token: '60 €', c: 'green', offset: 18 }, { move: 'network>acquirer', token: '60 €', c: 'green', delay: 1600 }, { value: ['settled', '59,10 €'] }] },
      { say: "Et si la capture n'arrive jamais ? L'autorisation expire au bout de quelques jours et les 60 euros sont simplement débloqués.", do: [{ badge: ['hold', 'expire après ≈ 7 j', 'info'] }] }
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
      { say: "Avant d'envoyer votre mot de passe, le navigateur et le serveur doivent se mettre d'accord sur une clé secrète. Problème : quelqu'un écoute peut-être le réseau.", do: [{ show: 'spy' }, { badge: ['spy', 'écoute tout 👂', 'bad'] }] },
      { say: "Client Hello : le navigateur propose ses versions de TLS, ses algorithmes, et envoie sa part publique de l'échange de clés.", do: [{ move: 'browser>server', token: 'ClientHello + part publique A', dur: 2000 }] },
      { say: "Server Hello : le serveur choisit l'algorithme, envoie sa propre part publique et son certificat.", do: [{ move: 'server>browser', token: 'ServerHello + certificat + part B', dur: 2000, offset: 18, c: 'green' }] },
      { say: "Le navigateur vérifie le certificat : signé par une autorité de confiance ? pour ce nom de domaine ? pas expiré ? Sinon, alerte de sécurité.", do: [{ glow: 'ca' }, { move: 'browser>ca', token: 'signature ?' }, { move: 'ca>browser', token: 'de confiance ✓', delay: 1600, c: 'green', offset: 18 }, { badge: ['browser', 'certificat ✓', 'ok'] }] },
      { say: "Chacun combine sa clé privée avec la part publique de l'autre. Magie de Diffie-Hellman : ils obtiennent la même clé secrète, qui n'a jamais circulé sur le réseau.", do: [{ badge: ['browser', '🔑 clé K', 'ok'] }, { badge: ['server', '🔑 clé K', 'ok'] }, { badge: ['spy', 'A et B seuls : inutiles', 'warn'] }] },
      { say: "Désormais tout est chiffré avec cette clé. L'espion ne voit passer que du bruit, et la moindre modification serait détectée.", do: [{ move: 'browser>server', token: '▓▒░▓▒░▓▒ chiffré', c: 'green' }, { move: 'server>browser', token: '░▓▒░▓▒ chiffré', c: 'green', delay: 1600, offset: 18 }, { badge: ['spy', '?!#@ illisible', 'bad'] }] }
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
      { say: "D'abord, le DNS traduit le nom du site en adresse IP. Ici, elle pointe vers le point de présence CDN le plus proche de vous.", do: [{ move: 'browser>dns', token: 'boutique.fr ?' }, { move: 'dns>browser', token: 'IP du CDN', delay: 1600, c: 'purple', offset: 18 }] },
      { say: "Le navigateur ouvre une connexion TCP puis TLS avec le CDN, et envoie la requête HTTP.", do: [{ move: 'browser>cdn', token: 'GET /api/produits' }] },
      { say: "Pour les images et le JavaScript, le CDN a déjà une copie : réponse immédiate. Pour l'API, pas de cache : il transmet au load balancer.", do: [{ badge: ['cdn', 'cache : /api → miss', 'warn'] }, { move: 'cdn>lb', token: 'GET /api/produits' }] },
      { say: "Le load balancer choisit une instance saine. L'API numéro 1 est saturée, il envoie donc la requête à l'API numéro 2.", do: [{ badge: ['app1', 'CPU 95 %', 'bad'] }, { glow: 'app2' }, { move: 'lb>app2', token: 'requête' }] },
      { say: "L'API exécute la logique métier et interroge la base de données.", do: [{ move: 'app2>db', token: 'SELECT …' }, { move: 'db>app2', token: '42 lignes', delay: 1600, c: 'pink', offset: 18 }] },
      { say: "La réponse JSON remonte toute la chaîne jusqu'au navigateur, qui affiche la page. Le tout en quelques centaines de millisecondes.", do: [{ move: 'app2>lb', token: 'JSON', c: 'green', offset: 18 }, { move: 'lb>cdn', token: 'JSON', c: 'green', delay: 1300, offset: 18 }, { move: 'cdn>browser', token: '200 OK', c: 'green', delay: 2600, offset: 18 }, { badge: ['browser', 'page affichée ✓', 'ok'] }] }
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
      { say: "En temps normal, le load balancer répartit les requêtes entre deux instances. Le CPU moyen est à 40 pour cent.", do: [{ move: 'users>lb', token: 'requêtes' }, { move: 'lb>a1', token: 'req', delay: 1500 }, { move: 'lb>a2', token: 'req', delay: 1500 }] },
      { say: "Soudain, une campagne marketing fait exploser le trafic. Le CPU grimpe à 85 pour cent : les temps de réponse se dégradent.", do: [{ move: 'users>lb', token: '× 5 requêtes', c: 'red' }, { value: ['cpu', '85 %'] }, { badge: ['a1', 'surchargée', 'bad'] }, { badge: ['a2', 'surchargée', 'bad'] }] },
      { say: "L'alarme CloudWatch dépasse son seuil plusieurs minutes de suite et déclenche la politique de scaling du groupe.", do: [{ glow: 'cpu' }, { badge: ['cpu', 'ALARME', 'bad'] }, { move: 'cpu>asg', token: 'scale out +1', c: 'red' }] },
      { say: "Le groupe lance une nouvelle instance à partir du modèle de lancement. Tant que son health check n'est pas vert, elle ne reçoit aucun trafic.", do: [{ show: 'a3' }, { value: ['asg', '3 / max 4'] }, { badge: ['a3', 'démarrage…', 'warn'] }] },
      { say: "Health check réussi : le load balancer l'ajoute. La charge se répartit sur trois instances et le CPU redescend.", do: [{ badge: ['a3', 'healthy ✓', 'ok'] }, { move: 'lb>a3', token: 'req' }, { move: 'lb>a1', token: 'req' }, { move: 'lb>a2', token: 'req' }, { value: ['cpu', '55 %'] }, { badge: ['a1', null] }, { badge: ['a2', null] }, { badge: ['cpu', null] }] },
      { say: "Si une instance plante, le load balancer la retire immédiatement et l'Auto Scaling la remplace : c'est l'auto-réparation.", do: [{ badge: ['a1', 'health check ✗', 'bad'] }, { badge: ['asg', 'remplacement…', 'warn'] }] },
      { say: "Quand le pic retombe, le groupe supprime les instances en trop. Vous ne payez la capacité que lorsqu'elle sert.", do: [{ badge: ['a1', null] }, { badge: ['asg', null] }, { value: ['cpu', '35 %'] }, { hide: 'a3' }, { value: ['asg', '2 / max 4'] }] }
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
      { say: "Vous cliquez sur Se connecter. L'application ne vous demande pas de mot de passe : elle vous redirige vers le fournisseur d'identité, avec un défi PKCE.", do: [{ move: 'user>app', token: 'Se connecter' }, { move: 'app>user', token: '302 → IdP + PKCE', delay: 1500, offset: 18, c: 'cyan' }, { move: 'user>idp', token: 'client_id, scope', delay: 3000 }] },
      { say: "Vous vous authentifiez directement chez le fournisseur d'identité : mot de passe, MFA, accès conditionnel. L'application ne voit rien de tout cela.", do: [{ glow: 'idp' }, { badge: ['idp', 'mot de passe + MFA ✓', 'ok'] }] },
      { say: "Le fournisseur vous renvoie vers l'application avec un code d'autorisation à usage unique, valable quelques secondes.", do: [{ move: 'idp>user', token: 'code=xyz', c: 'purple', offset: 18 }, { move: 'user>app', token: 'code=xyz', delay: 1600, c: 'purple' }] },
      { say: "En coulisse, l'application échange ce code, et la preuve PKCE, contre des jetons. Un vol du code seul ne servirait à rien.", do: [{ move: 'app>idp', token: 'code + verifier' }, { move: 'idp>app', token: 'ID token + access token', delay: 1700, c: 'purple', offset: 18 }] },
      { say: "L'ID token dit qui vous êtes : c'est OpenID Connect. L'access token dit ce que l'application a le droit de faire en votre nom : c'est OAuth.", do: [{ badge: ['app', 'connecté : Ada ✓', 'ok'] }] },
      { say: "L'application appelle l'API avec l'access token. L'API vérifie la signature, l'émetteur, l'audience, l'expiration et les scopes, sans appeler personne.", do: [{ move: 'app>api', token: 'Bearer eyJhbGci…' }, { badge: ['api', 'JWT vérifié ✓', 'ok'] }, { move: 'api>app', token: '200 données', delay: 1700, c: 'green', offset: 18 }] },
      { say: "Les access tokens vivent quelques minutes. À l'expiration, l'application utilise un refresh token, sans vous redemander de vous connecter.", do: [{ badge: ['app', 'token expiré → refresh', 'warn'] }, { move: 'app>idp', token: 'refresh token' }, { move: 'idp>app', token: 'nouvel access token', delay: 1600, c: 'purple', offset: 18 }] }
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
      { say: "Un client valide sa commande. Au lieu de tout traiter tout de suite, le site dépose un message dans une file et répond immédiatement : commande reçue.", do: [{ move: 'shop>queue', token: 'commande #1' }, { value: ['queue', '1 message'] }, { badge: ['shop', 'reçue ✓ (50 ms)', 'ok'] }] },
      { say: "Un worker interroge la file, récupère le message et le traite : paiement, stock, e-mail. Pendant ce temps, le message devient invisible pour les autres.", do: [{ move: 'queue>w1', token: 'commande #1' }, { value: ['queue', '0 message'] }, { badge: ['w1', 'traitement…', 'warn'] }] },
      { say: "Une fois le traitement réussi, le worker supprime le message. S'il plante avant, le message réapparaît et sera retraité : rien n'est perdu.", do: [{ badge: ['w1', 'supprimé ✓', 'ok'] }] },
      { say: "Pic de trafic : 500 commandes en une minute. Le site reste rapide, les messages s'accumulent simplement dans la file.", do: [{ move: 'shop>queue', token: '× 500', c: 'red' }, { value: ['queue', '500 messages'] }, { badge: ['w1', 'débordé', 'bad'] }] },
      { say: "La profondeur de la file déclenche l'autoscaling des workers. Un deuxième worker arrive, la file se vide deux fois plus vite.", do: [{ show: 'w2' }, { move: 'queue>w1', token: 'lot' }, { move: 'queue>w2', token: 'lot' }, { value: ['queue', '120 messages'] }, { badge: ['w1', null] }] },
      { say: "Un message mal formé échoue trois fois de suite. Plutôt que de bloquer la file, il part dans la dead-letter queue pour analyse.", do: [{ move: 'queue>dlq', token: 'commande #318 ✗', c: 'red' }, { value: ['dlq', '1'] }, { value: ['queue', '0 message'] }] }
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
      { say: "La développeuse pousse son code et ouvre une merge request. GitLab déclenche automatiquement le pipeline.", do: [{ move: 'dev>git', token: 'git push' }, { badge: ['git', 'pipeline #812', 'info'] }] },
      { say: "Le code est compilé et 312 tests unitaires s'exécutent en parallèle. Un seul test rouge et tout s'arrête.", do: [{ move: 'git>build', token: 'commit a1b2c3' }, { badge: ['build', '312 tests ✓', 'ok'] }] },
      { say: "SonarQube analyse le nouveau code : bugs, vulnérabilités, couverture. La quality gate doit être verte.", do: [{ move: 'git>sonar', token: 'analyse' }, { badge: ['sonar', 'gate ✓ couverture 84 %', 'ok'] }] },
      { say: "L'image Docker est construite, scannée, puis poussée dans le registre avec un tag immuable : le SHA du commit.", do: [{ move: 'build>registry', token: 'image' }, { move: 'sonar>registry', token: '✓', c: 'purple' }, { badge: ['registry', 'api:a1b2c3', 'info'] }] },
      { say: "Déploiement automatique en staging, suivi de tests de fumée. Même image, configuration différente.", do: [{ move: 'registry>staging', token: 'api:a1b2c3' }, { badge: ['staging', 'smoke tests ✓', 'ok'] }] },
      { say: "Pour la production, une approbation est requise. Puis déploiement canary : 10 % du trafic d'abord, sous surveillance des métriques.", do: [{ badge: ['prod', 'approuvé 👍', 'info'] }, { move: 'registry>prod', token: 'canary 10 %' }, { badge: ['prod', 'canary 10 % …', 'warn'] }] },
      { say: "Les erreurs restent basses : bascule à 100 %. Si une alarme s'était déclenchée, le rollback aurait été automatique.", do: [{ badge: ['prod', '100 % ✓ en prod', 'ok'] }] }
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
      { say: "Vous déclarez un état souhaité : trois répliques de votre API. Vous ne dites pas comment, seulement quoi.", do: [{ move: 'user>api', token: 'Deployment ×3' }] },
      { say: "L'API server valide la demande et enregistre cet état souhaité dans etcd, la mémoire du cluster.", do: [{ move: 'api>etcd', token: 'désiré : 3' }, { value: ['etcd', '3 répliques'] }] },
      { say: "Le contrôleur compare en boucle le souhaité et le réel : zéro pod sur trois. Il crée trois pods à placer.", do: [{ glow: 'ctrl' }, { badge: ['ctrl', 'réel 0 / désiré 3', 'warn'] }, { move: 'ctrl>api', token: '+3 pods' }] },
      { say: "Le scheduler choisit un nœud pour chaque pod, selon le CPU et la mémoire demandés, et les contraintes d'affinité.", do: [{ move: 'api>sched', token: '3 pods en attente' }, { move: 'sched>n1', token: 'pod', delay: 1600 }, { move: 'sched>n2', token: 'pod', delay: 1600 }, { value: ['n1', '2 pods'] }, { value: ['n2', '1 pod'] }, { badge: ['ctrl', 'réel 3 / désiré 3 ✓', 'ok'] }] },
      { say: "Panne : le nœud 2 disparaît, avec son pod. Le réel tombe à deux sur trois.", do: [{ value: ['n2', 'HORS LIGNE'] }, { badge: ['n2', 'NotReady', 'bad'] }, { badge: ['ctrl', 'réel 2 / désiré 3', 'bad'] }] },
      { say: "Personne n'intervient. Le contrôleur détecte l'écart et recrée un pod, que le scheduler place sur le nœud 1. L'état réel rejoint l'état souhaité.", do: [{ move: 'ctrl>api', token: '+1 pod' }, { move: 'sched>n1', token: 'pod', delay: 1600 }, { value: ['n1', '3 pods'] }, { badge: ['ctrl', 'réel 3 / désiré 3 ✓', 'ok'] }] }
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
      { say: "Une commande est créée. Le service Commandes n'appelle personne : il publie un événement, un fait qui s'est produit, dans un topic Kafka.", do: [{ move: 'orders>topic', token: 'CommandeCréée #42' }, { value: ['topic', 'offset 1'] }] },
      { say: "Le topic est un journal ordonné et durable. Les événements y restent, même après avoir été lus.", do: [{ glow: 'topic' }, { badge: ['topic', 'rétention 7 jours', 'info'] }] },
      { say: "La facturation et le stock lisent l'événement, chacun à son rythme, chacun avec sa propre position de lecture, l'offset.", do: [{ move: 'topic>billing', token: '#42' }, { move: 'topic>stock', token: '#42' }, { badge: ['billing', 'facture ✓', 'ok'] }, { badge: ['stock', 'stock −1 ✓', 'ok'] }] },
      { say: "Le service Stock tombe en panne. Les commandes continuent d'être publiées : personne n'est bloqué.", do: [{ badge: ['stock', 'en panne', 'bad'] }, { move: 'orders>topic', token: '#43, #44, #45' }, { value: ['topic', 'offset 4'] }, { move: 'topic>billing', token: '#43–45', delay: 1600 }] },
      { say: "Au redémarrage, le stock reprend exactement là où il s'était arrêté, grâce à son offset. Aucun événement perdu.", do: [{ badge: ['stock', 'rattrape 43→45 ✓', 'ok'] }, { move: 'topic>stock', token: '#43–45' }] },
      { say: "Nouveau besoin : envoyer des notifications. On ajoute un consommateur, sans toucher au producteur, et il peut même relire tout l'historique.", do: [{ show: 'notif' }, { move: 'topic>notif', token: 'rejeu #42–45' }, { badge: ['notif', 'e-mails ✓', 'ok'] }] }
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
      { say: "Préparation : les documents sont découpés en petits passages, puis chacun est transformé en vecteur, une liste de nombres qui représente son sens.", do: [{ move: 'docs>embed', token: '1 240 passages' }, { move: 'embed>vdb', token: '[0.12, -0.83, …]', delay: 1700, c: 'purple' }, { value: ['vdb', '1 240 vecteurs'] }] },
      { say: "Un utilisateur pose une question : quelle est la procédure en cas de perte de badge ?", do: [{ move: 'user>app', token: 'badge perdu ?' }] },
      { say: "La question est elle aussi transformée en vecteur, avec le même modèle.", do: [{ move: 'app>embed', token: 'question' }, { move: 'embed>app', token: '[0.10, -0.79, …]', delay: 1600, c: 'purple', offset: 18 }] },
      { say: "La base vectorielle trouve les passages dont le sens est le plus proche : une recherche par similarité, pas par mots-clés.", do: [{ move: 'app>vdb', token: 'top 3 similaires ?' }, { move: 'vdb>app', token: '3 passages', delay: 1700, c: 'orange', offset: 18 }, { badge: ['vdb', 'similarité 0,91', 'info'] }] },
      { say: "L'application construit le prompt : consignes, passages trouvés et question. Le LLM rédige la réponse en s'appuyant uniquement sur ces sources.", do: [{ move: 'app>llm', token: 'consignes + 3 passages + question', dur: 2000 }, { move: 'llm>app', token: 'réponse + sources', delay: 2200, c: 'green', offset: 18 }] },
      { say: "L'utilisateur reçoit une réponse citant ses sources. On filtre les documents selon ses droits d'accès, et on évalue régulièrement la qualité.", do: [{ move: 'app>user', token: 'réponse [doc 12]', c: 'green', offset: 18 }, { badge: ['user', 'sources citées ✓', 'ok'] }] }
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
      { say: "Une requête arrive. Le code JavaScript s'exécute sur un seul thread, dans la pile d'appels.", do: [{ value: ['stack', 'handler()'] }] },
      { say: "Le code demande une lecture en base. Node ne l'attend pas : il délègue l'opération au système via libuv, et la pile se libère.", do: [{ move: 'stack>libuv', token: 'db.query(…)' }, { value: ['stack', 'vide'] }, { badge: ['libuv', 'I/O en cours…', 'warn'] }] },
      { say: "Pendant ce temps, le thread sert d'autres requêtes. C'est tout le secret : il n'attend jamais les entrées-sorties.", do: [{ value: ['stack', 'requête 2, 3, 4…'] }, { badge: ['stack', 'jamais bloqué', 'ok'] }] },
      { say: "La base répond. libuv place le callback dans la file. Une promesse résolue, elle, va dans la file prioritaire des microtâches.", do: [{ move: 'libuv>macro', token: 'callback db' }, { value: ['macro', 'callback db'] }, { move: 'stack>micro', token: 'Promise.then', delay: 800 }, { value: ['micro', 'Promise.then'] }, { badge: ['libuv', null] }] },
      { say: "Dès que la pile est vide, la boucle exécute d'abord toutes les microtâches, puis le callback suivant.", do: [{ value: ['stack', 'vide'] }, { glow: 'loop' }, { move: 'micro>loop', token: 'Promise.then' }, { move: 'loop>stack', token: 'microtâche', delay: 1500 }, { value: ['micro', '—'] }, { move: 'macro>loop', token: 'callback', delay: 3000 }, { move: 'loop>stack', token: 'callback db', delay: 4500 }, { value: ['macro', '—'] }] },
      { say: "Le piège : un calcul lourd et synchrone occupe la pile. Plus rien ne passe, toutes les requêtes attendent. Solution : worker threads ou service dédié.", do: [{ value: ['stack', 'calcul 2 s ⛔'] }, { badge: ['stack', 'BLOQUÉ', 'bad'] }, { value: ['macro', '57 en attente'] }] }
    ],
    recap: ["**Un thread** pour le JavaScript, **libuv** pour les I/O", "Les I/O sont **déléguées** : le thread n'attend jamais", "**Microtâches** (promesses) avant les **callbacks**", "Ne **jamais** bloquer : pas de `*Sync`, pas de gros calcul dans une requête", "CPU intensif → **worker_threads** ou autre service", "Idéal : API, BFF, temps réel ; moins pour le calcul"]
  }
];
