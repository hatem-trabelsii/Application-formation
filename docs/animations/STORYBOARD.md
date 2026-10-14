# Storyboard des animations « Comprendre en 1 minute »

> Fichier **généré** depuis `data/explainers.js` par `node docs/animations/generer_storyboard.js` : ne pas le modifier à la main.
> 13 animations · 85 étapes · 223 temps forts.

## Comment c'est construit

- **Une animation = une scène** (des composants reliés), puis des **étapes**. Chaque étape est découpée en **temps forts** : une phrase courte de voix off, et les actions visuelles qui démarrent **au moment où cette phrase commence**.
- **Focus** : pendant une phrase, tout ce qui n'y participe pas est assombri ; l'élément concerné pulse.
- **Pauses** : un silence de 0,32 s sépare les phrases par défaut. Les pauses plus longues sont indiquées `[pause x s]` (effet de suspense, temps pour lire un chiffre).
- **Sous-titres karaoké** : la phrase prononcée est en blanc, les autres atténuées.
- **Mobile** : la scène est transposée en format vertical (façon reel).

## Rendre la voix plus naturelle

1. **Sans rien installer** : ouvre l'application dans **Microsoft Edge**, puis ⚙️ Paramètres › Voix de narration : choisis une voix **« … Online (Natural) »** (par exemple Denise ou Henri). Le lecteur les sélectionne d'ailleurs automatiquement quand elles existent. Ce sont des voix neuronales Microsoft, gratuites dans Edge, nettement moins robotiques ; comme les voix « Google » de Chrome, elles fonctionnent en ligne (le texte lu est envoyé au service de Microsoft).
2. **Voix professionnelle enregistrée** (ElevenLabs, Azure AI Speech, OpenAI TTS…) :
   - génère **un fichier MP3 par étape** avec le texte de la colonne « Voix off » ci-dessous ; les `[pause x s]` se traduisent en `<break time="x s"/>` pour Azure (SSML) et ElevenLabs (selon le modèle utilisé), ou en points de suspension pour les outils sans balises ;
   - nomme-les `audio/<id>/<n° d'étape>.mp3` (ex. `audio/eventloop/1.mp3`) à la racine du projet ;
   - ajoute `audio: true` à l'animation dans `data/explainers.js`.
   Le lecteur joue alors l'enregistrement et déclenche les actions au prorata des mots de chaque phrase. Si un fichier manque, il revient automatiquement à la voix du navigateur.
3. **Conseils d'écriture déjà appliqués** : phrases de 21 mots maximum, une idée par phrase, mots-clés en fin de phrase, questions rhétoriques, chiffres concrets, prononciation forcée pour Node.js, libuv, kubectl, etcd, JSON, PKCE…

---

## 1. 🌐 Comment un nom de domaine devient une adresse IP

- **Identifiant** : `dns` · **Question d'accroche** : Que se passe-t-il quand vous tapez www.exemple.fr ?
- **Formations liées** : AWS Cloud Practitioner, Azure Fundamentals, AWS Solutions Architect Associate, AWS SysOps Administrator
- **Durée de voix** : ≈ 78 s (186 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 💻 Navigateur · ▭ Cache local (compteur, départ « vide ») · 🔁 Résolveur DNS · 🌍 Serveur racine · 🏷️ Serveur .fr · 📗 Serveur autoritaire · 🖥️ Serveur web *(apparaît plus tard)*

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Vous tapez www.exemple.fr, et vous validez. | Navigateur pulse (focus)<br>étiquette sur Navigateur : « www.exemple.fr ? » (warn) |
| Problème : sur Internet, les machines ne se trouvent pas par leur nom… `[pause 0.2 s]` | *(plan inchangé)* |
| mais par une adresse IP. Il faut donc traduire. `[pause 0.5 s]` | *(plan inchangé)* |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Premier réflexe : le navigateur regarde dans son cache. | Cache local pulse (focus) |
| Il est vide. `[pause 0.4 s]` | *(plan inchangé)* |
| Il demande alors au résolveur DNS, celui de votre box ou de votre opérateur. | jeton « exemple.fr ? » : Navigateur → Résolveur DNS |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le résolveur ne connaît pas la réponse non plus. `[pause 0.2 s]` | *(plan inchangé)* |
| Il commence par le sommet : le serveur racine. | jeton « ? » : Résolveur DNS → Serveur racine |
| La racine ne connaît que les extensions. Elle répond : demandez aux serveurs du point fr. | jeton « → .fr » : Serveur racine → Résolveur DNS |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le résolveur interroge donc le serveur du point fr. | jeton « ? » : Résolveur DNS → Serveur .fr |
| Lui ne connaît pas l'adresse… mais il sait qui gère exemple point fr. | jeton « NS exemple.fr » : Serveur .fr → Résolveur DNS |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Dernière question, au serveur qui fait autorité sur ce domaine. | jeton « ? » : Résolveur DNS → Serveur autoritaire |
| Cette fois, c'est la bonne réponse : l'enregistrement A. `[pause 0.5 s]` | Serveur autoritaire pulse (focus)<br>jeton « A 93.184.216.34 » : Serveur autoritaire → Résolveur DNS |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le résolveur garde cette réponse en mémoire, pendant une durée appelée le TTL. | étiquette sur Résolveur DNS : « cache TTL 300 s » (info) |
| Puis il la renvoie au navigateur, qui la mémorise à son tour. | jeton « 93.184.216.34 » : Résolveur DNS → Navigateur<br>compteur « Cache local » = **93.184.216.34**<br>étiquette de Navigateur retirée |

### Étape 7

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Enfin, le navigateur peut contacter le serveur web. | apparition : Serveur web<br>jeton « GET / » : Navigateur → Serveur web |
| La page arrive. `[pause 0.4 s]` | jeton « page HTML » : Serveur web → Navigateur<br>étiquette sur Navigateur : « connecté ✓ » (ok) |
| Et la prochaine fois ? Tout ce trajet est sauté, grâce au cache. C'est pour ça que le DNS paraît instantané. | *(plan inchangé)* |

**Fiche mémo finale** :
1. DNS = annuaire d'Internet : **nom → adresse IP**
2. Résolution : résolveur → racine → TLD (.fr) → serveur **autoritaire**
3. Enregistrements : **A/AAAA** (IP), **CNAME** (alias), **MX** (mail), **NS**, **TXT**
4. **TTL** = durée de mise en cache d'une réponse
5. AWS **Route 53**, **Azure DNS** ; Alias/apex, routage par latence ou failover
6. Dépanner : `dig`, `nslookup`, `dig +trace`

---

## 2. 💳 Paiement par carte : pourquoi « payé » arrive avant l'argent

- **Identifiant** : `paiement` · **Question d'accroche** : Que se passe-t-il quand vous cliquez sur « Payer 60 € » ?
- **Formations liées** : Spring Boot 3, Node.js — Backend, AWS Developer Associate
- **Durée de voix** : ≈ 75 s (179 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 🧑 Vous · 🏪 Boutique · ⚙️ Prestataire · 💳 Réseau carte · 🏦 Votre banque · ▭ Bloqué (votre compte) (compteur, départ « 0 € ») · 🏦 Banque du marchand · ▭ Reçu (marchand) (compteur, départ « 0 € »)

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Vous cliquez sur « Payer 60 euros ». | jeton « 60 € » : Vous → Boutique |
| Surprise : la boutique ne touche jamais à votre argent. `[pause 0.4 s]` | *(plan inchangé)* |
| Elle transmet simplement la demande à son prestataire de paiement. | jeton « autoriser 60 € » : Boutique → Prestataire |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le prestataire l'envoie au réseau de cartes… | jeton « autorisation » : Prestataire → Réseau carte |
| qui la route jusqu'à votre banque. | jeton « autorisation » : Réseau carte → Votre banque |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Votre banque vérifie : le solde, la fraude, le 3-D Secure. | Votre banque pulse (focus)<br>étiquette sur Votre banque : « 3-D Secure ✓ » (ok) |
| Puis elle bloque 60 euros. `[pause 0.5 s]` | compteur « Bloqué (votre compte) » = **60 €** |
| Bloqué, pas débité. C'est ce qu'on appelle l'autorisation. | *(plan inchangé)* |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'accord fait le chemin inverse, en une ou deux secondes. | jeton « OK » : Votre banque → Réseau carte<br>jeton « OK » : Réseau carte → Prestataire (après 1.4 s)<br>jeton « autorisé ✓ » : Prestataire → Boutique (après 2.8 s) |
| La boutique affiche « Payé ». `[pause 0.4 s]` | étiquette sur Boutique : « PAYÉ ✓ » (ok) |
| Elle a la garantie d'être payée… mais toujours pas l'argent. | *(plan inchangé)* |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Quelques jours plus tard, la commande est expédiée. | étiquette sur Boutique : « EXPÉDIÉ 📦 » (info) |
| Le marchand déclenche alors la capture : il confirme qu'il prend les 60 euros. | jeton « capture 60 € » : Boutique → Prestataire |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Les captures de la journée sont regroupées en lots… | jeton « lot de captures » : Prestataire → Réseau carte |
| puis compensées entre les banques, souvent la nuit. C'est le règlement. | jeton « débiter » : Réseau carte → Votre banque |

### Étape 7

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Votre banque transforme le blocage en vrai débit. | compteur « Bloqué (votre compte) » = **0 €**<br>étiquette sur Votre banque : « débité 60 € » (warn) |
| Et l'argent arrive enfin chez le marchand, un à trois jours après votre clic, moins les frais. | jeton « 60 € » : Votre banque → Réseau carte<br>jeton « 60 € » : Réseau carte → Banque du marchand (après 1.5 s)<br>compteur « Reçu (marchand) » = **59,10 €** |

### Étape 8

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Et si la capture n'arrive jamais ? `[pause 0.4 s]` | *(plan inchangé)* |
| Au bout de quelques jours, l'autorisation expire, et vos 60 euros sont simplement débloqués. | étiquette sur Bloqué (votre compte) : « expire après ≈ 7 j » (info) |

**Fiche mémo finale** :
1. **Autorisation** = l'argent est bloqué, pas débité
2. **Capture** = le marchand confirme (souvent à l'expédition)
3. **Règlement** = compensation entre banques, J+1 à J+3
4. « Payé » à l'écran = garantie d'autorisation
5. **Idempotence** : une clé unique par paiement, contre les doubles débits
6. Données de carte : **PCI DSS**, tokenisation chez le prestataire

---

## 3. 🔒 HTTPS / TLS : comment le cadenas protège vos données

- **Identifiant** : `https` · **Question d'accroche** : Comment deux machines inventent-elles une clé secrète devant un espion ?
- **Formations liées** : AWS Security Specialty, AWS Solutions Architect Associate, Azure Developer Associate, Spring Boot 3
- **Durée de voix** : ≈ 69 s (165 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 💻 Navigateur · 🖥️ Serveur · 🏛️ Autorité de certif. · 🕵️ Espion *(apparaît plus tard)*

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Vous allez envoyer votre mot de passe. | Navigateur pulse (focus) |
| Mais sur ce Wi-Fi public, quelqu'un écoute peut-être tout ce qui passe. `[pause 0.5 s]` | apparition : Espion<br>étiquette sur Espion : « écoute tout 👂 » (bad) |
| Il faut donc une clé secrète… sans jamais l'envoyer sur le réseau. | *(plan inchangé)* |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Premier message : le Client Hello. | jeton « ClientHello + part publique A » : Navigateur → Serveur (durée 2 s) |
| Le navigateur propose ses algorithmes, et donne sa moitié publique de l'échange de clés. | *(plan inchangé)* |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Réponse du serveur : le Server Hello. | jeton « ServerHello + certificat + part B » : Serveur → Navigateur (durée 2 s) |
| Il choisit l'algorithme, envoie sa propre moitié publique… et son certificat. | *(plan inchangé)* |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le navigateur vérifie ce certificat. | Autorité de certif. pulse (focus)<br>jeton « signature ? » : Navigateur → Autorité de certif. |
| Est-il signé par une autorité de confiance ? Pour ce domaine ? Encore valide ? `[pause 0.3 s]` | *(plan inchangé)* |
| Oui. On sait maintenant à qui on parle vraiment. | jeton « de confiance ✓ » : Autorité de certif. → Navigateur<br>étiquette sur Navigateur : « certificat ✓ » (ok) |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Et voici l'astuce de Diffie et Hellman. `[pause 0.3 s]` | *(plan inchangé)* |
| Chacun combine sa clé privée avec la moitié publique de l'autre. | étiquette sur Navigateur : « 🔑 clé K » (ok)<br>étiquette sur Serveur : « 🔑 clé K » (ok) |
| Résultat : la même clé secrète des deux côtés. Elle n'a jamais circulé. `[pause 0.3 s]` | *(plan inchangé)* |
| L'espion a vu passer A et B… et ça ne lui sert à rien. | étiquette sur Espion : « A et B seuls : inutiles » (warn) |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| À partir de là, tout est chiffré avec cette clé. | jeton « ▓▒░▓▒░▓▒ chiffré » : Navigateur → Serveur<br>jeton « ░▓▒░▓▒ chiffré » : Serveur → Navigateur (après 1.5 s) |
| L'espion ne voit que du bruit. Et la moindre modification serait détectée. | étiquette sur Espion : « ?!#@ illisible » (bad) |

**Fiche mémo finale** :
1. TLS = **confidentialité + intégrité + authentification** du serveur
2. Certificat signé par une **CA** : nom de domaine + validité
3. Échange de clés **éphémère** (ECDHE) : la clé ne circule jamais
4. TLS 1.3 : poignée de main en **1 aller-retour**
5. Certificats : **AWS ACM**, **Azure Key Vault**, Let's Encrypt
6. **mTLS** : le client présente aussi un certificat (service à service)

---

## 4. 🧭 De l'URL à la page : le voyage d'une requête

- **Identifiant** : `url` · **Question d'accroche** : Que se passe-t-il entre « Entrée » et l'affichage de la page ?
- **Formations liées** : AWS Solutions Architect Associate, AWS Cloud Practitioner, React — Frontend, Spring Boot 3
- **Durée de voix** : ≈ 52 s (125 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 💻 Navigateur · 🌐 DNS · ⚡ CDN · ⚖️ Load balancer · 🟩 API #1 · 🟩 API #2 · 🗄️ Base

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Vous appuyez sur Entrée. Chronomètre lancé. `[pause 0.4 s]` | Navigateur pulse (focus) |
| D'abord, le DNS traduit le nom du site en adresse IP. | jeton « boutique.fr ? » : Navigateur → DNS |
| Ici, l'adresse du point de présence CDN le plus proche de chez vous. | jeton « IP du CDN » : DNS → Navigateur |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le navigateur ouvre une connexion sécurisée avec ce CDN… | CDN pulse (focus) |
| et envoie sa requête. | jeton « GET /api/produits » : Navigateur → CDN |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Les images et le JavaScript ? Le CDN les a déjà en copie : réponse immédiate. `[pause 0.3 s]` | *(plan inchangé)* |
| Mais une API, c'est des données fraîches : pas de cache. | étiquette sur CDN : « cache : /api → miss » (warn) |
| La requête continue jusqu'au load balancer. | jeton « GET /api/produits » : CDN → Load balancer |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le load balancer doit choisir un serveur. | Load balancer pulse (focus) |
| L'API numéro 1 est saturée. `[pause 0.3 s]` | étiquette sur API #1 : « CPU 95 % » (bad) |
| Il envoie donc la requête à l'API numéro 2. | API #2 pulse (focus)<br>jeton « requête » : Load balancer → API #2 |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'API exécute la logique métier… | API #2 pulse (focus) |
| et interroge la base de données. | jeton « SELECT … » : API #2 → Base<br>jeton « 42 lignes » : Base → API #2 (après 1.6 s) |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| La réponse remonte toute la chaîne… | jeton « JSON » : API #2 → Load balancer<br>jeton « JSON » : Load balancer → CDN (après 1.3 s)<br>jeton « 200 OK » : CDN → Navigateur (après 2.6 s) |
| et la page s'affiche. `[pause 0.3 s]` | étiquette sur Navigateur : « page affichée ✓ » (ok) |
| Tout ça, en quelques centaines de millisecondes. | *(plan inchangé)* |

**Fiche mémo finale** :
1. DNS → TCP → TLS → HTTP : **4 étapes** avant la réponse
2. **CDN** : cache près de l'utilisateur pour le contenu statique
3. **Load balancer** : répartit et évite les instances malades (health checks)
4. Instances **sans état** derrière le LB = scalabilité horizontale
5. La base est souvent le goulot : **cache**, réplicas, index
6. Mesurer : latence p95, codes HTTP, traces distribuées

---

## 5. 📈 Load balancer et autoscaling face à un pic de trafic

- **Identifiant** : `autoscaling` · **Question d'accroche** : Comment une application encaisse-t-elle un pic de trafic sans tomber ?
- **Formations liées** : AWS Solutions Architect Associate, AWS SysOps Administrator, Azure Developer Associate, Kubernetes — CKA, CloudWatch & AWS Ops
- **Durée de voix** : ≈ 59 s (141 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 👥 Utilisateurs · ⚖️ Load balancer · 🖥️ Instance 1 · 🖥️ Instance 2 · 🖥️ Instance 3 *(apparaît plus tard)* · ▭ CPU moyen · alarme 70 % (compteur, départ « 40 % ») · ▭ Auto Scaling group (compteur, départ « 2 / max 4 »)

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Journée calme. | jeton « requêtes » : Utilisateurs → Load balancer |
| Le load balancer répartit les requêtes entre deux instances. | jeton « req » : Load balancer → Instance 1<br>jeton « req » : Load balancer → Instance 2 |
| Le processeur tourne à 40 pour cent. Tout va bien. | CPU moyen · alarme 70 % pulse (focus) |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Et soudain… une campagne marketing. `[pause 0.4 s]` | jeton « × 5 requêtes » : Utilisateurs → Load balancer |
| Le trafic est multiplié par cinq. | compteur « CPU moyen · alarme 70 % » = **85 %** |
| Les deux instances saturent, les pages ralentissent. | étiquette sur Instance 1 : « surchargée » (bad)<br>étiquette sur Instance 2 : « surchargée » (bad) |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'alarme reste au-dessus du seuil plusieurs minutes de suite. | CPU moyen · alarme 70 % pulse (focus)<br>étiquette sur CPU moyen · alarme 70 % : « ALARME » (bad) |
| Elle déclenche la politique de scaling. | jeton « scale out +1 » : CPU moyen · alarme 70 % → Auto Scaling group |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le groupe lance une troisième instance, à partir d'un modèle. | apparition : Instance 3<br>compteur « Auto Scaling group » = **3 / max 4** |
| Attention : tant que son contrôle de santé n'est pas vert, elle ne reçoit rien. | étiquette sur Instance 3 : « démarrage… » (warn) |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Contrôle réussi. `[pause 0.2 s]` | étiquette sur Instance 3 : « healthy ✓ » (ok) |
| Le load balancer l'ajoute à la rotation. | jeton « req » : Load balancer → Instance 3<br>jeton « req » : Load balancer → Instance 1<br>jeton « req » : Load balancer → Instance 2 |
| La charge se répartit sur trois instances, et le processeur redescend. | compteur « CPU moyen · alarme 70 % » = **55 %**<br>étiquette de Instance 1 retirée<br>étiquette de Instance 2 retirée<br>étiquette de CPU moyen · alarme 70 % retirée |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Et si une instance plante ? `[pause 0.3 s]` | étiquette sur Instance 1 : « health check ✗ » (bad) |
| Le load balancer arrête aussitôt de lui envoyer du trafic, et le groupe la remplace. | étiquette sur Auto Scaling group : « remplacement… » (warn) |
| C'est l'auto-réparation. | *(plan inchangé)* |

### Étape 7

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le soir, le pic retombe. | étiquette de Instance 1 retirée<br>étiquette de Auto Scaling group retirée<br>compteur « CPU moyen · alarme 70 % » = **35 %** |
| Le groupe supprime l'instance en trop. | disparition : Instance 3<br>compteur « Auto Scaling group » = **2 / max 4** |
| Vous ne payez la capacité que lorsqu'elle sert. | *(plan inchangé)* |

**Fiche mémo finale** :
1. **Load balancer** : répartit et n'envoie qu'aux cibles saines
2. **Auto Scaling** : min / désiré / max, réparti sur plusieurs **AZ**
3. Déclencheur : **target tracking** (ex. CPU 50 %) ou alarme
4. Nouvelle instance = trafic seulement après **health check**
5. **Auto-réparation** : instance malade remplacée
6. Équivalents : VM Scale Sets (Azure), HPA (Kubernetes)

---

## 6. 🔐 « Se connecter avec… » : OAuth 2.0 et OpenID Connect

- **Identifiant** : `oauth` · **Question d'accroche** : Comment une application vous connecte sans jamais voir votre mot de passe ?
- **Formations liées** : AWS Developer Associate, Azure Developer Associate, Spring Boot 3, AWS Security Specialty, React — Frontend
- **Durée de voix** : ≈ 67 s (161 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 🧑 Navigateur · 🛒 Application · 🔐 Fournisseur d'identité · 🗄️ API

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Vous cliquez sur « Se connecter ». | jeton « Se connecter » : Navigateur → Application |
| L'application ne vous demande pas votre mot de passe. `[pause 0.3 s]` | *(plan inchangé)* |
| Elle vous redirige vers le fournisseur d'identité, avec un petit défi secret, le PKCE. | jeton « 302 → IdP + PKCE » : Application → Navigateur<br>jeton « client_id, scope » : Navigateur → Fournisseur d'identité (après 1.5 s) |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| C'est chez lui, et seulement chez lui, que vous vous authentifiez. | Fournisseur d'identité pulse (focus) |
| Mot de passe, double authentification, règles d'accès. | étiquette sur Fournisseur d'identité : « mot de passe + MFA ✓ » (ok) |
| L'application ne voit rien de tout ça. | *(plan inchangé)* |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le fournisseur vous renvoie vers l'application… | jeton « code=xyz » : Fournisseur d'identité → Navigateur |
| avec un code à usage unique, valable quelques secondes. | jeton « code=xyz » : Navigateur → Application |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| En coulisse, l'application échange ce code, plus la réponse au défi PKCE… | jeton « code + verifier » : Application → Fournisseur d'identité |
| contre des jetons. `[pause 0.3 s]` | jeton « ID token + access token » : Fournisseur d'identité → Application |
| Quelqu'un qui volerait le code seul n'en ferait rien. | *(plan inchangé)* |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'ID token dit qui vous êtes : c'est OpenID Connect. | étiquette sur Application : « connecté : Ada ✓ » (ok) |
| L'access token dit ce que l'application peut faire en votre nom : c'est OAuth. | *(plan inchangé)* |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'application appelle l'API avec ce jeton. | jeton « Bearer eyJhbGci… » : Application → API |
| L'API vérifie la signature, l'émetteur, l'expiration et les droits… sans appeler personne. | API pulse (focus)<br>étiquette sur API : « JWT vérifié ✓ » (ok) |
| Et elle répond. | jeton « 200 données » : API → Application |

### Étape 7

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Un access token ne vit que quelques minutes. | étiquette sur Application : « token expiré → refresh » (warn) |
| À l'expiration, l'application utilise un refresh token… | jeton « refresh token » : Application → Fournisseur d'identité |
| et vous restez connecté, sans rien retaper. | jeton « nouvel access token » : Fournisseur d'identité → Application |

**Fiche mémo finale** :
1. **OAuth 2.0** = autorisation déléguée ; **OIDC** = identité (ID token)
2. Flux **Authorization Code + PKCE** pour les applications web et mobiles
3. Le mot de passe ne va **que** chez le fournisseur d'identité
4. Access token **JWT** vérifié par l'API : signature, iss, aud, exp, scopes
5. Jetons courts + **refresh token**
6. Service à service : flux **client credentials**

---

## 7. 📬 Découpler avec une file de messages

- **Identifiant** : `queue` · **Question d'accroche** : Comment absorber 500 commandes d'un coup sans faire tomber le site ?
- **Formations liées** : AWS Solutions Architect Associate, AWS Developer Associate, Azure Developer Associate
- **Durée de voix** : ≈ 60 s (145 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 🛒 Site web · ▭ File SQS / Service Bus (compteur, départ « 0 message ») · ⚙️ Worker 1 · ⚙️ Worker 2 *(apparaît plus tard)* · ▭ Dead-letter queue (compteur, départ « 0 »)

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Un client valide sa commande. | Site web pulse (focus) |
| Plutôt que de tout traiter tout de suite, le site dépose un message dans une file… | jeton « commande #1 » : Site web → File SQS / Service Bus<br>compteur « File SQS / Service Bus » = **1 message** |
| et répond aussitôt : commande reçue. | étiquette sur Site web : « reçue ✓ (50 ms) » (ok) |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| De l'autre côté, un worker récupère le message. | jeton « commande #1 » : File SQS / Service Bus → Worker 1<br>compteur « File SQS / Service Bus » = **0 message** |
| Il fait le travail : paiement, stock, e-mail. | étiquette sur Worker 1 : « traitement… » (warn) |
| Pendant ce temps, le message est invisible pour les autres. | *(plan inchangé)* |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Une fois le travail réussi, le worker supprime le message. | étiquette sur Worker 1 : « supprimé ✓ » (ok) |
| Et s'il plante avant ? Le message réapparaît, et sera retraité. `[pause 0.3 s]` | *(plan inchangé)* |
| Rien n'est perdu. | *(plan inchangé)* |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Maintenant, le grand jeu : 500 commandes en une minute. | jeton « × 500 » : Site web → File SQS / Service Bus<br>compteur « File SQS / Service Bus » = **500 messages** |
| Le site reste rapide. Les messages s'accumulent simplement dans la file. | étiquette sur Worker 1 : « débordé » (bad) |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| La longueur de la file déclenche l'arrivée d'un deuxième worker. | apparition : Worker 2 |
| La file se vide deux fois plus vite. | jeton « lot » : File SQS / Service Bus → Worker 1<br>jeton « lot » : File SQS / Service Bus → Worker 2<br>compteur « File SQS / Service Bus » = **120 messages**<br>étiquette de Worker 1 retirée |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Un message mal formé échoue une fois, deux fois, trois fois. `[pause 0.3 s]` | File SQS / Service Bus pulse (focus) |
| Plutôt que de bloquer tout le monde, il part dans la file des messages en échec, pour analyse. | jeton « commande #318 ✗ » : File SQS / Service Bus → Dead-letter queue<br>compteur « Dead-letter queue » = **1**<br>compteur « File SQS / Service Bus » = **0 message** |

**Fiche mémo finale** :
1. La file **découple** producteur et consommateur
2. Le site répond vite ; le traitement est **asynchrone**
3. **Visibility timeout** : message invisible pendant le traitement
4. Supprimer après succès → **au moins une fois** → traitement **idempotent**
5. Scaler les workers sur la **profondeur de file**
6. **DLQ** pour les messages en échec ; FIFO si l'ordre compte

---

## 8. 🚀 Du commit à la production : un pipeline CI/CD

- **Identifiant** : `cicd` · **Question d'accroche** : Que se passe-t-il après un git push ?
- **Formations liées** : GitLab CI/CD, Jenkins, Azure DevOps Engineer Expert, AWS DevOps Engineer Professional, SonarQube, Docker & Docker Registry
- **Durée de voix** : ≈ 54 s (130 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 👩‍💻 Développeuse · 🦊 GitLab · 🔨 Build + tests · 🔍 SonarQube · 📦 Registre · 🧪 Staging · 🏭 Production

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| La développeuse pousse son code, et ouvre une merge request. | jeton « git push » : Développeuse → GitLab |
| Aussitôt, GitLab lance le pipeline. | GitLab pulse (focus)<br>étiquette sur GitLab : « pipeline #812 » (info) |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le code est compilé… | jeton « commit a1b2c3 » : GitLab → Build + tests |
| et 312 tests unitaires tournent en parallèle. | Build + tests pulse (focus)<br>étiquette sur Build + tests : « 312 tests ✓ » (ok) |
| Un seul test rouge, et tout s'arrête. | *(plan inchangé)* |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| En parallèle, SonarQube analyse le nouveau code : bugs, failles, couverture. | jeton « analyse » : GitLab → SonarQube |
| La quality gate est verte. | étiquette sur SonarQube : « gate ✓ couverture 84 % » (ok) |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'image Docker est construite, scannée… | jeton « image » : Build + tests → Registre<br>jeton « ✓ » : SonarQube → Registre |
| puis rangée dans le registre, avec une étiquette qui ne changera jamais : l'identifiant du commit. | étiquette sur Registre : « api:a1b2c3 » (info) |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Déploiement automatique en staging. | jeton « api:a1b2c3 » : Registre → Staging |
| Des tests de fumée vérifient que l'essentiel fonctionne. `[pause 0.3 s]` | étiquette sur Staging : « smoke tests ✓ » (ok) |
| Même image qu'en production. Seule la configuration change. | *(plan inchangé)* |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Pour la production, un humain approuve. `[pause 0.3 s]` | étiquette sur Production : « approuvé 👍 » (info) |
| Puis déploiement canari : dix pour cent du trafic d'abord, sous surveillance. | jeton « canary 10 % » : Registre → Production<br>étiquette sur Production : « canary 10 % … » (warn) |

### Étape 7

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Les erreurs restent basses : on passe à cent pour cent. | Production pulse (focus)<br>étiquette sur Production : « 100 % ✓ en prod » (ok) |
| Si une alarme s'était déclenchée, le retour arrière aurait été automatique. | *(plan inchangé)* |

**Fiche mémo finale** :
1. **CI** : chaque commit est construit et testé automatiquement
2. **Quality gate** bloquante (SonarQube) et scans de sécurité
3. Une **image immuable** taguée par commit, promue d'environnement en environnement
4. Staging automatique, **prod avec approbation**
5. Déploiement progressif : **canary** / blue-green + **rollback** sur alarme
6. Indicateurs **DORA** : fréquence, lead time, taux d'échec, MTTR

---

## 9. ☸️ Kubernetes : la boucle de réconciliation

- **Identifiant** : `k8s` · **Question d'accroche** : Comment Kubernetes répare-t-il tout seul une application ?
- **Formations liées** : Kubernetes — CKA, Docker & Docker Registry
- **Durée de voix** : ≈ 51 s (122 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : ⌨️ kubectl apply · 🧠 API server · ▭ etcd : état souhaité (compteur, départ « — ») · 🔁 Controller · 📅 Scheduler · ▭ Nœud 1 (compteur, départ « 0 pod ») · ▭ Nœud 2 (compteur, départ « 0 pod »)

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Vous déclarez ce que vous voulez : trois copies de votre API. | jeton « Deployment ×3 » : kubectl apply → API server |
| Vous ne dites pas comment. Seulement quoi. | *(plan inchangé)* |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'API server valide la demande… | API server pulse (focus) |
| et l'inscrit dans etcd, la mémoire du cluster. | jeton « désiré : 3 » : API server → etcd : état souhaité<br>compteur « etcd : état souhaité » = **3 répliques** |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le contrôleur compare sans cesse ce qui est voulu, et ce qui existe. | Controller pulse (focus) |
| Voulu : trois. Réel : zéro. `[pause 0.3 s]` | étiquette sur Controller : « réel 0 / désiré 3 » (warn) |
| Il demande trois pods. | jeton « +3 pods » : Controller → API server |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le scheduler choisit où les placer, selon la place disponible sur chaque nœud. | jeton « 3 pods en attente » : API server → Scheduler |
| Deux ici, un là. | jeton « pod » : Scheduler → Nœud 1<br>jeton « pod » : Scheduler → Nœud 2<br>compteur « Nœud 1 » = **2 pods**<br>compteur « Nœud 2 » = **1 pod** |
| Réel : trois. Tout est en ordre. | étiquette sur Controller : « réel 3 / désiré 3 ✓ » (ok) |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Panne. `[pause 0.3 s]` | *(plan inchangé)* |
| Le nœud 2 disparaît, et son pod avec lui. | compteur « Nœud 2 » = **HORS LIGNE**<br>étiquette sur Nœud 2 : « NotReady » (bad) |
| Réel : deux sur trois. | étiquette sur Controller : « réel 2 / désiré 3 » (bad) |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Personne n'intervient. `[pause 0.3 s]` | *(plan inchangé)* |
| Le contrôleur voit l'écart, et redemande un pod. | Controller pulse (focus)<br>jeton « +1 pod » : Controller → API server |
| Le scheduler le place sur le nœud 1. | jeton « pod » : Scheduler → Nœud 1<br>compteur « Nœud 1 » = **3 pods** |
| La réalité a rejoint la demande. C'est ça, la réconciliation. | étiquette sur Controller : « réel 3 / désiré 3 ✓ » (ok) |

**Fiche mémo finale** :
1. Modèle **déclaratif** : on décrit l'état souhaité
2. **etcd** stocke l'état ; seul l'**API server** y accède
3. **Contrôleurs** : boucle souhaité vs réel → corrigent l'écart
4. **Scheduler** : place les pods selon requests, taints, affinités
5. **kubelet** démarre les conteneurs sur chaque nœud
6. Résultat : auto-réparation, rolling updates, scaling

---

## 10. 📜 Architecture orientée événements avec Kafka

- **Identifiant** : `events` · **Question d'accroche** : Comment des services réagissent-ils sans se connaître ?
- **Formations liées** : AWS Solutions Architect Associate, Azure Developer Associate, AWS Solutions Architect Professional, Spring Boot 3
- **Durée de voix** : ≈ 53 s (128 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 🛒 Service Commandes · ▭ Topic « commandes » (compteur, départ « offset 0 ») · 🧾 Facturation · 📦 Stock · ✉️ Notifications *(apparaît plus tard)*

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Une commande vient d'être créée. | Service Commandes pulse (focus) |
| Le service Commandes n'appelle personne. `[pause 0.3 s]` | *(plan inchangé)* |
| Il publie un événement, un fait : « commande créée ». | jeton « CommandeCréée #42 » : Service Commandes → Topic « commandes »<br>compteur « Topic « commandes » » = **offset 1** |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Cet événement atterrit dans un topic Kafka. | Topic « commandes » pulse (focus) |
| Un journal ordonné, et durable : les événements y restent, même après lecture. | étiquette sur Topic « commandes » : « rétention 7 jours » (info) |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| La facturation lit l'événement, et prépare la facture. | jeton « #42 » : Topic « commandes » → Facturation<br>étiquette sur Facturation : « facture ✓ » (ok) |
| Le stock le lit aussi, de son côté. | jeton « #42 » : Topic « commandes » → Stock<br>étiquette sur Stock : « stock −1 ✓ » (ok) |
| Chacun avance à son rythme, avec son propre marque-page : l'offset. | *(plan inchangé)* |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Coup dur : le service Stock tombe en panne. `[pause 0.3 s]` | étiquette sur Stock : « en panne » (bad) |
| Les commandes, elles, continuent d'arriver. | jeton « #43, #44, #45 » : Service Commandes → Topic « commandes »<br>compteur « Topic « commandes » » = **offset 4** |
| La facturation suit normalement. Personne n'est bloqué. | jeton « #43–45 » : Topic « commandes » → Facturation |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le stock redémarre. | Stock pulse (focus) |
| Il reprend exactement là où il s'était arrêté, grâce à son offset. | jeton « #43–45 » : Topic « commandes » → Stock<br>étiquette sur Stock : « rattrape 43→45 ✓ » (ok) |
| Aucun événement perdu. | *(plan inchangé)* |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Nouveau besoin : envoyer des notifications. | apparition : Notifications |
| On ajoute un consommateur, sans toucher au producteur. `[pause 0.3 s]` | *(plan inchangé)* |
| Et il peut même relire tout l'historique. | jeton « rejeu #42–45 » : Topic « commandes » → Notifications<br>étiquette sur Notifications : « e-mails ✓ » (ok) |

**Fiche mémo finale** :
1. Le producteur **publie un fait**, sans connaître les consommateurs
2. **Topic** = journal durable, partitionné, ordonné par **clé**
3. Chaque **groupe de consommateurs** a son **offset**
4. Panne d'un consommateur = **retard**, pas de perte
5. Ajouter un service sans modifier les autres ; **rejeu** possible
6. Livraison **au moins une fois** → consommateurs **idempotents** (Kafka, EventBridge, Event Hubs)

---

## 11. 🤖 RAG : brancher un LLM sur vos propres documents

- **Identifiant** : `rag` · **Question d'accroche** : Comment un assistant IA répond-il avec VOS documents, sans les inventer ?
- **Formations liées** : Python — Scripting & ML Prep, AWS Solutions Architect Professional, Azure Solutions Architect Expert
- **Durée de voix** : ≈ 55 s (132 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 📚 Documents · 🔢 Modèle d'embedding · ▭ Base vectorielle (compteur, départ « 0 vecteur ») · 🧑 Utilisateur · 🧩 Application RAG · 🧠 LLM

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| D'abord, on prépare le terrain. | Documents pulse (focus) |
| Les documents sont découpés en petits passages. | jeton « 1 240 passages » : Documents → Modèle d'embedding |
| Chacun devient un vecteur : une liste de nombres qui représente son sens. | jeton « [0.12, -0.83, …] » : Modèle d'embedding → Base vectorielle<br>compteur « Base vectorielle » = **1 240 vecteurs** |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Un utilisateur pose une question : `[pause 0.2 s]` | Utilisateur pulse (focus) |
| « Que faire si je perds mon badge ? » | jeton « badge perdu ? » : Utilisateur → Application RAG |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| La question, elle aussi, est transformée en vecteur… | jeton « question » : Application RAG → Modèle d'embedding |
| avec exactement le même modèle. | jeton « [0.10, -0.79, …] » : Modèle d'embedding → Application RAG |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| La base vectorielle cherche les passages dont le sens est le plus proche. | jeton « top 3 similaires ? » : Application RAG → Base vectorielle |
| Pas une recherche par mots-clés : une recherche par idées. | jeton « 3 passages » : Base vectorielle → Application RAG<br>étiquette sur Base vectorielle : « similarité 0,91 » (info) |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'application construit la consigne : les règles, les passages trouvés, et la question. | jeton « consignes + 3 passages + question » : Application RAG → LLM (durée 2 s) |
| Le modèle rédige sa réponse en s'appuyant uniquement sur ces sources. | LLM pulse (focus)<br>jeton « réponse + sources » : LLM → Application RAG (après 1.2 s) |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| L'utilisateur reçoit une réponse, avec ses sources citées. | jeton « réponse [doc 12] » : Application RAG → Utilisateur<br>étiquette sur Utilisateur : « sources citées ✓ » (ok) |
| Deux règles d'or : on ne cherche que dans les documents auxquels il a droit… `[pause 0.2 s]` | *(plan inchangé)* |
| et on mesure régulièrement la qualité des réponses. | *(plan inchangé)* |

**Fiche mémo finale** :
1. **RAG** = Retrieval-Augmented Generation : chercher puis générer
2. **Embeddings** : le sens d'un texte sous forme de vecteur
3. **Base vectorielle** : pgvector, OpenSearch, Azure AI Search…
4. Réponses **ancrées** sur vos documents, avec **citations**
5. Sécurité : filtrer par **droits d'accès**, données sensibles hors des prompts
6. **MCP** : protocole standard pour brancher outils et données à un assistant IA

---

## 12. 🔄 Node.js : la boucle d'événements

- **Identifiant** : `eventloop` · **Question d'accroche** : Comment un seul thread sert-il des milliers de requêtes ?
- **Formations liées** : Node.js — Backend, React — Frontend
- **Durée de voix** : ≈ 61 s (147 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : ▭ Pile d'appels (1 thread) (compteur, départ « vide ») · ⏱️ libuv / OS · ▭ File des microtâches (compteur, départ « — ») · ▭ File des callbacks (compteur, départ « — ») · 🔄 Boucle d'événements

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Une requête arrive sur votre serveur Node.js. | Pile d'appels (1 thread) pulse (focus) |
| Son code s'exécute sur un seul et unique fil d'exécution : la pile d'appels. | compteur « Pile d'appels (1 thread) » = **handler()** |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le code a besoin de la base de données. `[pause 0.2 s]` | *(plan inchangé)* |
| Node ne va pas attendre bêtement. `[pause 0.3 s]` | *(plan inchangé)* |
| Il confie la lecture au système, via libuv… | jeton « db.query(…) » : Pile d'appels (1 thread) → libuv / OS<br>étiquette sur libuv / OS : « I/O en cours… » (warn) |
| et libère aussitôt la pile. | compteur « Pile d'appels (1 thread) » = **vide** |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Pendant que la base cherche, le fil sert d'autres requêtes. | Pile d'appels (1 thread) pulse (focus)<br>compteur « Pile d'appels (1 thread) » = **requête 2, 3, 4…** |
| Voilà tout le secret : il n'attend jamais les entrées-sorties. | étiquette sur Pile d'appels (1 thread) : « jamais bloqué » (ok) |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| La base répond. | étiquette de libuv / OS retirée |
| libuv dépose le callback dans la file d'attente. | jeton « callback db » : libuv / OS → File des callbacks<br>compteur « File des callbacks » = **callback db** |
| Une promesse résolue, elle, va dans une file prioritaire : celle des microtâches. | jeton « Promise.then » : Pile d'appels (1 thread) → File des microtâches<br>compteur « File des microtâches » = **Promise.then** |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Dès que la pile est vide, la boucle d'événements prend le relais. | compteur « Pile d'appels (1 thread) » = **vide**<br>Boucle d'événements pulse (focus) |
| D'abord, toutes les microtâches. | jeton « Promise.then » : File des microtâches → Boucle d'événements<br>jeton « microtâche » : Boucle d'événements → Pile d'appels (1 thread) (après 1.5 s)<br>compteur « File des microtâches » = **—** |
| Ensuite seulement, le callback suivant. | jeton « callback » : File des callbacks → Boucle d'événements<br>jeton « callback db » : Boucle d'événements → Pile d'appels (1 thread) (après 1.5 s)<br>compteur « File des callbacks » = **—** |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le piège, maintenant. `[pause 0.3 s]` | *(plan inchangé)* |
| Un gros calcul, synchrone, occupe la pile pendant deux secondes. | compteur « Pile d'appels (1 thread) » = **calcul 2 s ⛔**<br>étiquette sur Pile d'appels (1 thread) : « BLOQUÉ » (bad) |
| Plus rien ne passe. Toutes les requêtes attendent. `[pause 0.3 s]` | compteur « File des callbacks » = **57 en attente** |
| La solution : des worker threads, ou un service dédié au calcul. | *(plan inchangé)* |

**Fiche mémo finale** :
1. **Un thread** pour le JavaScript, **libuv** pour les I/O
2. Les I/O sont **déléguées** : le thread n'attend jamais
3. **Microtâches** (promesses) avant les **callbacks**
4. Ne **jamais** bloquer : pas de `*Sync`, pas de gros calcul dans une requête
5. CPU intensif → **worker_threads** ou autre service
6. Idéal : API, BFF, temps réel ; moins pour le calcul

---

## 13. 🐳 Docker : du Dockerfile au conteneur

- **Identifiant** : `docker` · **Question d'accroche** : Que se passe-t-il entre « docker build » et une application qui tourne ?
- **Formations liées** : Docker & Docker Registry, Kubernetes — CKA, GitLab CI/CD
- **Durée de voix** : ≈ 79 s (190 mots à ~145 mots/min, hors animations)
- **Éléments à l'écran** : 📄 Dockerfile · 🔨 docker build · ▭ Image (couches) (compteur, départ « 0 couche ») · 📦 Registre · 🖥️ Serveur · ▭ Conteneur (compteur, départ « aucun ») · 🐧 Noyau Linux

### Étape 1

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Tout commence par un Dockerfile. | Dockerfile pulse (focus) |
| C'est une recette : une image de départ, des fichiers à copier, des commandes à lancer. | étiquette sur Dockerfile : « FROM · COPY · RUN » (info) |

### Étape 2

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| La commande docker build lit la recette, ligne par ligne. | jeton « docker build » : Dockerfile → docker build |
| Chaque instruction produit une couche, en lecture seule. `[pause 0.3 s]` | docker build pulse (focus)<br>compteur « Image (couches) » = **4 couches** |
| Au build suivant, les couches qui n'ont pas changé viennent du cache : quelques secondes au lieu de quelques minutes. | étiquette sur docker build : « cache ✓ » (ok) |

### Étape 3

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Le résultat, c'est une image. | jeton « api:1.4.2 » : docker build → Image (couches) |
| Un paquet figé, identifié par une empreinte unique : son digest. | étiquette sur Image (couches) : « sha256:9f2c… » (info) |

### Étape 4

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| On pousse l'image dans un registre. | jeton « docker push » : Image (couches) → Registre |
| Elle devient disponible pour tous les serveurs autorisés. | étiquette sur Registre : « api:1.4.2 ✓ » (ok) |

### Étape 5

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Sur le serveur, on lance docker run. | Serveur pulse (focus) |
| Docker télécharge l'image… seulement les couches qui lui manquent. | jeton « docker pull » : Registre → Serveur |
| Puis il démarre un conteneur : l'image, plus une fine couche d'écriture. | jeton « docker run » : Serveur → Conteneur<br>compteur « Conteneur » = **en marche** |

### Étape 6

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Attention : un conteneur n'est pas une machine virtuelle. `[pause 0.3 s]` | *(plan inchangé)* |
| C'est un simple processus, isolé par le noyau Linux. | Noyau Linux pulse (focus)<br>jeton « processus » : Conteneur → Noyau Linux |
| Les namespaces lui donnent sa propre vue : ses processus, son réseau, ses fichiers. | étiquette sur Noyau Linux : « namespaces : isolation » (info) |
| Les cgroups limitent ce qu'il consomme : processeur et mémoire. | étiquette sur Noyau Linux : « cgroups : 1 CPU · 512 Mo » (info) |

### Étape 7

| Voix off (texte exact) | À l'écran, au même moment |
|---|---|
| Si on supprime le conteneur, sa couche d'écriture disparaît avec lui. `[pause 0.3 s]` | compteur « Conteneur » = **supprimé**<br>étiquette sur Conteneur : « données perdues ✗ » (bad) |
| Les données à garder vont donc dans un volume. | étiquette sur Conteneur : « volume = données gardées » (ok) |
| Et pour redéployer ? On relance la même image. Identique, partout. | jeton « docker run » : Serveur → Conteneur<br>compteur « Conteneur » = **en marche** |

**Fiche mémo finale** :
1. **Dockerfile** = recette ; chaque instruction crée une **couche**
2. Le **cache de couches** accélère les builds : dépendances avant le code
3. **Image** immuable, identifiée par son **digest** ; taguée par version
4. **Registre** (ECR, ACR, GitLab) : push puis pull des seules couches manquantes
5. **Conteneur** = processus isolé : **namespaces** (vue) + **cgroups** (limites)
6. Couche d'écriture **éphémère** → données dans un **volume**

