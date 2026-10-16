# Decisions.md — choix faits en autonomie

Ce document liste les décisions prises seul, sans validation, pour construire **ArchiPath Academy**, la plateforme de formation locale du parcours Architecte Cloud & DevOps (5 phases, avril 2026 → février 2028).

## 1. Architecture technique

| Décision | Pourquoi |
|---|---|
| **HTML + CSS + JavaScript pur, aucune dépendance, aucun build** | Le site doit tourner en local sans installation. On ouvre `index.html` par double-clic et ça marche, y compris hors ligne. Rien à installer, rien à mettre à jour, aucune faille de dépendance. |
| **Scripts classiques (pas de modules ES)** | Les modules ES sont bloqués par les navigateurs en `file://` (CORS). Avec des scripts classiques, le double-clic fonctionne. Un serveur local facultatif est fourni (`start.sh` / `start.bat`). |
| **Application monopage avec routeur par hash (`#/cours/docker`)** | Fonctionne en `file://`, garde l'historique (bouton retour) et donne des liens qu'on peut mettre en favori. |
| **Un fichier de données par formation (`data/courses/*.js`)** | Chaque formation se relit et s'enrichit de façon indépendante. Ajouter une formation = créer un fichier + ajouter une ligne `<script>` dans `index.html`. |
| **Identifiants des leçons générés automatiquement (`1-2` = section 1, leçon 2)** | Le contenu s'écrit plus simplement. Contrepartie assumée : insérer une leçon au milieu d'une section décale la progression des leçons suivantes. |

## 2. « Formations vidéo » sans vidéos hébergées

Il n'était pas possible de fournir de vraies vidéos. L'accès réseau à YouTube était bloqué dans l'environnement de construction : je ne pouvais donc pas vérifier des liens de vidéos précis, et je n'ai pas voulu risquer des liens inventés ou morts. Voici ce que j'ai fait à la place :

1. **Un lecteur vidéo narré, 100 % local** (`js/player.js`). Chaque leçon devient une vidéo : des diapositives animées dont les puces apparaissent au rythme de la narration, une voix française (synthèse vocale du navigateur, Web Speech API), des sous-titres, une barre de progression cliquable avec des repères de diapositives, des vitesses de 0,75× à 2×, le plein écran et des raccourcis clavier. Quand la vidéo se termine, la leçon est marquée comme terminée et la leçon suivante est proposée.
   - Sans voix disponible, la vidéo continue en **mode silencieux minuté avec sous-titres** (détection automatique).
   - La qualité de la voix dépend du système. Chrome/Edge et Windows proposent de bonnes voix françaises, qu'on peut choisir dans ⚙️ Paramètres.
2. **Onglet « Vidéos & ressources » dans chaque leçon** :
   - un lien YouTube ou un **fichier vidéo de votre disque** se rattache à la leçon. Le fichier est stocké dans IndexedDB : il reste disponible et il est lu dans la page ;
   - des liens de **recherche** YouTube (FR/EN) et Udemy, construits à partir du titre de la leçon : ce sont toujours des URL valides, jamais des vidéos inventées ;
   - la documentation officielle de chaque technologie.

## 3. Pédagogie : apprendre « par cœur »

Inspiré d'Udemy (page de cours avec bandeau, « Ce que vous apprendrez », sommaire en accordéon, lecteur avec la liste des leçons à droite, onglets sous la vidéo), avec en plus des outils de mémorisation :

- **Théorie** : tout le texte narré, repris et enrichi, avec des exemples de code colorés et copiables.
- **Points clés** en fin de leçon, qui forment aussi la diapositive récapitulative de la vidéo.
- **Labs guidés** : des étapes à cocher, des commandes, des indices, des vérifications, une solution et le nettoyage des ressources.
- **Quiz** : un mode entraînement (explication immédiate) et un mode examen (chronomètre d'environ 1 min 30 par question, correction à la fin, seuil de 72 %). Les questions **et** les réponses sont mélangées à chaque tentative, pour mémoriser le fond plutôt que la position de la bonne réponse. L'historique des scores est conservé.
- **Flashcards à répétition espacée (système de Leitner)**, avec des intervalles de 1, 2, 4, 8, 16 et 32 jours. Une file « Révisions du jour » regroupe toutes les formations et un badge dans l'en-tête indique le nombre de cartes dues. Tout se fait au clavier (Espace, 1, 2, 3).
- **Notes par leçon**, sauvegardées automatiquement et exportables en Markdown.
- **Recherche globale** dans les formations, les leçons et les flashcards (touche `/`).

## 4. Contenu

- **30 formations** : 12 certifications et 18 technologies, exactement celles du plan fourni, avec les heures, les coûts, les étoiles de priorité, les périodes, les résumés et les « milestones » repris des captures.
- **173 leçons**, **35 labs**, **326 questions de quiz**, **487 flashcards**. Tout le contenu a été rédigé pour ce projet, en français.
- Une **page Roadmap** qui reproduit la maquette fournie : onglets de phase, cases à cocher « acquis », détails et milestone. Elle est synchronisée avec le bouton « Certification obtenue / Technologie maîtrisée » des pages de cours.
- La page d'accueil détecte la **phase en cours** d'après la date du jour et calcule la **charge hebdomadaire estimée** de la phase.

### Honnêteté sur le volume

Les heures affichées (~40 h, ~120 h…) sont celles du plan : c'est le temps total de préparation. Les vidéos narrées ne durent que quelques minutes par leçon, car elles condensent l'essentiel à retenir. Le reste du temps va aux labs, aux quiz, aux révisions, à la documentation officielle et aux examens blancs, signalés dans chaque cours. Ce site ne remplace pas un examen blanc officiel.

### Points à vérifier signalés dans le contenu

- **AZ-305** : le titre *Azure Solutions Architect Expert* exige aussi **AZ-104**, qui **manque dans votre plan**. C'est signalé en encadré sur la page du cours. AZ-204 ne le remplace pas.
- **AZ-400** : il exige AZ-104 **ou** AZ-204 : votre AZ-204 de la phase 2 suffit.
- **SOA-C02** : AWS l'a remplacé fin 2025 par *CloudOps Engineer – Associate (SOA-C03)*. Je garde l'intitulé de votre plan, avec une note.
- **PMP** : la répartition des domaines affichée est celle du nouveau référentiel annoncé par PMI pour 2026 (l'ancien est indiqué en note).
- **Security Specialty, CKA (prix), Evidently, taille des messages SQS** : ces informations évoluent. Une note invite à vérifier la source officielle.
- **Kubernetes (CKA)** et **TOGAF** sont classés en « technologies », comme dans votre plan, mais leur page affiche aussi les informations d'examen.

## 5. Stockage et vie privée

- **Aucun compte, aucun serveur, aucune donnée envoyée.** La progression (leçons, labs, quiz, cartes, notes, réglages) est dans `localStorage` et les vidéos locales dans IndexedDB.
- Comme ces données appartiennent à un navigateur précis, les **Paramètres** permettent d'**exporter et d'importer la progression en JSON**, et de tout réinitialiser.
- Thème clair/sombre (automatique, selon le système), interface adaptée au mobile.

## 6. Qualité

- Un script de validation a vérifié le schéma de chaque formation : champs obligatoires, index de réponse de chaque question, format des cartes.
- Un test automatisé dans Chromium (Playwright) a parcouru **298 pages** (chaque cours, chaque leçon avec ses 5 onglets, chaque lab, chaque quiz et chaque paquet de flashcards) **sans aucune erreur JavaScript**. Il a aussi joué les parcours complets (leçon terminée, quiz en mode examen, session de flashcards au clavier, case de la roadmap, notes) et vérifié que tout était bien enregistré.
- Bugs trouvés et corrigés pendant ces tests :
  - sans voix de synthèse, la vidéo défilait d'un coup ;
  - un re-rendu interne coupait le chronomètre du quiz et les raccourcis des flashcards ;
  - des défauts d'affichage de diapositives et de badges.

## 7. Limites connues (non traitées volontairement)

- La synthèse vocale n'est pas une voix humaine. Pour de vraies vidéos, rattachez vos propres fichiers ou liens dans l'onglet « Vidéos ».
- Pas de synchronisation entre appareils, seulement l'export/import manuel : c'est la conséquence du « sans compte ».
- Les labs cloud s'exécutent sur votre propre compte AWS/Azure et peuvent coûter quelques euros. Chaque lab indique les avertissements et le nettoyage à faire.

## 8. Animations « Comprendre en 1 minute » (ajout)

Inspirées des reels pédagogiques (« Online Payments », « DNS Server »), où l'on voit ce qui circule entre les composants.

- **Moteur maison** (`js/explainer.js`), sans dépendance et sans fichier vidéo. Chaque animation est un schéma SVG animé : des jetons circulent entre les composants, des compteurs changent (« 60 € bloqués »), des badges apparaissent (« PAYÉ ✓ »), et les liens actifs s'illuminent. Une narration vocale et des sous-titres accompagnent chaque étape. Contrôles : lecture/pause, étape par étape, vitesse, plein écran, clavier.
- **Pilotées par les données** (`data/explainers.js`) : une animation, ce sont des nœuds, des liens et des étapes. En ajouter une ne demande aucun code.
- **Mode portrait automatique** sur téléphone : le schéma est transposé (le flux gauche → droite devient haut → bas), comme un reel vertical, pour garder les textes lisibles.
- Chaque animation se termine par une **fiche mémo** façon infographie. Elle est reliée aux formations concernées : on la retrouve sur la page du cours, dans la barre latérale des leçons, sur l'accueil et dans la recherche.
- **12 animations** : DNS, paiement par carte (autorisation / capture / règlement), HTTPS/TLS, de l'URL à la page, load balancer et autoscaling, OAuth 2.0/OIDC, file de messages, pipeline CI/CD, réconciliation Kubernetes, architecture événementielle (Kafka), RAG pour les LLM, boucle d'événements Node.js. Trois d'entre elles (événementiel, RAG, OAuth) couvrent des compétences demandées par l'offre INTERPOL de Solution Architect.

## 9. Mise en ligne sur AWS (étude)

- **Architecture choisie** : S3 privé (Paris) + CloudFront (OAC, HTTPS, en-têtes de sécurité, redirection www → apex) + Route 53 + ACM, avec un déploiement GitHub Actions par OIDC, sans clé stockée. Raison : l'application est entièrement statique (aucune requête réseau dans le code), donc aucun serveur ni base de données n'est justifié.
- **Coûts** : calculés à partir de l'API officielle AWS Price List (relevé du 14/10/2026), dans un script reproductible (`docs/aws/estimation_couts.py`). Environ 0,50 $/mois pour un usage personnel. Le premier poste de coût à forte audience est le nombre de requêtes (39 fichiers par visite).
- **Infrastructure en code** : deux piles CloudFormation, car le certificat CloudFront doit être en us-east-1. Elles sont validées par `cfn-lint` ; le workflow est validé contre le schéma GitHub ; la CSP a été testée sur 110 écrans sans aucune violation.
- **Workflow manuel** (`workflow_dispatch`) pour que rien ne s'exécute ni n'échoue tant que l'infrastructure n'existe pas.
- **Corrections faites pendant l'étude** : retrait de 6 captures d'écran de tests commitées par erreur (elles auraient été publiées) ; rôle de déploiement aligné sur la vraie branche du dépôt (il n'existe pas de branche `main`) et sur la casse exacte du nom du dépôt.
- **Non vérifiable depuis mon environnement** : prix exact des noms de domaine, détails des forfaits CloudFront flat-rate, déploiement réel (pas de compte AWS). C'est listé dans `docs/aws/README.md` § 10.

## 10. Animations plus naturelles (refonte)

- **Temps forts (beats)** : chaque étape est une suite de phrases courtes, chacune avec ses actions visuelles. Elles sont déclenchées au moment précis où la phrase commence, ce qui supprime le décalage entre la voix et l'écran.
- **Rythme** : une phrase par énoncé de synthèse vocale, des pauses dosées (0,32 s par défaut, plus longues pour le suspense) et un débit légèrement réduit (0,95).
- **Focus visuel** : les éléments hors sujet sont assombris, l'élément actif pulse, les étiquettes apparaissent en fondu et les sous-titres s'affichent façon karaoké. Le tout respecte `prefers-reduced-motion`.
- **Prononciation** : un dictionnaire appliqué à la voix seulement (Node.js, libuv, kubectl, etcd, JSON, PKCE, www., .fr…) ; les sous-titres gardent l'orthographe exacte.
- **Voix réalistes** : les voix neuronales « Online (Natural) » d'Edge sont choisies automatiquement quand elles sont disponibles. Des voix professionnelles enregistrées sont possibles via `audio/<id>/<étape>.mp3` et `audio: true`, avec repli automatique sur la synthèse si un fichier manque. Je n'ai généré aucun audio ElevenLabs ou Azure : il faut un compte, une clé, et un accès réseau que je n'ai pas.
- **Scripts réécrits** dans un ton parlé pour les 12 animations, plus une nouvelle : « Docker : du Dockerfile au conteneur ».
- **Storyboard** (`docs/animations/STORYBOARD.md`) généré depuis les données : il reste donc toujours fidèle à ce qui est joué.

## 11. Simulateurs interactifs, dans l'esprit de freesystemdesign.com

- **Source d'inspiration et limite** : le site freesystemdesign.com n'a pas pu être ouvert depuis mon environnement (résolution DNS refusée, proxy). Je me suis basé sur sa description publique : des composants sur un canevas, une simulation de trafic en direct pour trouver les points faibles, et une leçon « Load Balancer » couvrant les algorithmes, les health checks, l'auto-scaling et les sessions. Le résultat est **inspiré** de ce principe, pas une copie de son interface.
- **Les animations narrées sont conservées**, et je n'en ai pas fait des simulations. Elles expliquent un mécanisme. Les simulateurs le font **manipuler**. Chaque animation liée (autoscaling, queue) renvoie vers son simulateur via un bouton « À toi de jouer ».
- **Format d'une leçon** (`#/simulateur/<id>/apprendre/<n>`) :
  - des chapitres courts, chacun avec la théorie à gauche et un scénario préréglé à droite ;
  - un **objectif mesuré**. Par exemple « tenir 70 req/s avec moins de 1 % d'erreurs » : il est validé automatiquement quand la condition tient 3 secondes ;
  - un indice et une lecture à voix haute.
  
  Puis viennent un **bac à sable** avec tous les réglages et un **quiz** expliqué. La progression est enregistrée dans `localStorage` (`sims`).
- **Trois leçons, 16 chapitres** :
  - **Load balancer** : saturation, scaling horizontal, round robin vs moins de connexions, health checks (seuils 2/2), auto-scaling avec démarrage et draining, sessions en mémoire / collantes / partagées dans Redis ;
  - **Cache** : base goulot, cache-aside, loi de Zipf et LRU, TTL, données périmées et invalidation, panne du cache et effet troupeau ;
  - **Files de messages** : synchrone vs asynchrone (202), backlog et âge du plus ancien message, scaling sur la profondeur de file, messages empoisonnés et DLQ, redélivrance at-least-once.
- **Une vraie simulation, pas une animation scriptée** :
  - arrivées de Poisson, capacité et file d'attente par composant, expiration à 250 ms ;
  - choix du serveur par l'algorithme réel, popularité des clés selon la loi de Zipf, LRU ;
  - les métriques (débit, p95, taux d'erreur, hit ratio…) sont **calculées sur les requêtes simulées** d'une fenêtre glissante.
- **Ralenti ×10, affiché à l'écran** : il permet de suivre chaque requête. Les chiffres sont reconvertis en temps réel équivalent. Les durées de démarrage des serveurs sont volontairement compressées, et la proportion de messages empoisonnés (10 %) volontairement exagérée. Le texte de la leçon le signale.
- **Vérifié** : un script Playwright joue la solution de chacun des 16 chapitres et vérifie que l'objectif est atteignable. C'est ainsi que j'ai trouvé et corrigé un bug de particules perdues, une case à cocher initialisée à tort et un TTL qui rendait un objectif impossible. Aucune erreur JS ; pas de débordement horizontal sur mobile, où le canevas défile horizontalement. Non-régression : 298 pages, 13 animations.

## 12. Refonte « Concepts » d'après les vidéos de freesystemdesign.com

Les 5 vidéos fournies (environ 2 minutes au total) ont été analysées image par image (une image toutes les 2 s, plus des gros plans en pleine résolution). Ce que j'ai reproduit :

- **Mode Apprendre** (`#/concept/<id>/apprendre/<n>`) :
  - un fond quasi noir ;
  - à gauche, la tuile d'icône, l'étiquette mono « CONCEPT 04 · SCALABILITÉ », le grand titre, la phrase d'accroche, puis des sections numérotées « 01, 02… » ;
  - des boutons « ← Précédent », « Suivant → » et « Passer au défi → », et la pilule blanche « Construis-le toi-même → » à la dernière section ;
  - l'encart « OU PASSE DIRECTEMENT À » vers le concept suivant, et une barre de progression segmentée ;
  - en haut, le fil d'Ariane et les concepts précédent et suivant ;
  - à droite, un **canevas vivant** dont le schéma change à chaque section, avec un glissement des composants communs, le titre de la section en légende mono, et une navigation au clavier ← →.
- **Composants** :
  - cartes compactes : tuile d'icône colorée par type, nom, sous-titre ou débit (« 150 r/s ») ;
  - mini-barre et compteur « charge/capacité » (« 29/30 ») ;
  - **croix rouge ✕** pour mettre en panne ou relancer ;
  - bordure rose lumineuse quand le composant est surchargé ;
  - flèches fines, et **points colorés** qui circulent en continu selon le débit.
- **Mode Construire** (`#/concept/<id>/construire`) :
  - palette « GLISSER POUR PLACER » et mode d'emploi ;
  - objectif en haut à gauche, boutons Réinitialiser / ▶ Play / Solution ;
  - « MÉTRIQUES EN DIRECT » (statut, composants, liens, traitées, rejetées, surchargés, débit, latence), encart **FEEDBACK** contextuel et journal ;
  - glisser-déposer à la souris ou au doigt (toucher la palette ajoute aussi) ;
  - connexion en tirant la poignée « + », suppression au double-clic, clic droit ou appui long ;
  - architecture sauvegardée localement. Le défi est validé quand la condition tient 3 secondes sous trafic.
- **Moteur** (`js/flow.js`) : un **modèle de flux** (requêtes/s propagées dans le graphe), qui remplace le simulateur à événements discrets de la section 11. Il est générique, donc il fonctionne sur n'importe quelle architecture construite par l'utilisateur, et il est déterministe : les objectifs ne dépendent plus du hasard. Il gère :
  - la capacité de chaque composant, avec rejet de l'excédent ;
  - les algorithmes de répartition et les health checks (détection en ~2 s) ;
  - l'auto-scaling, avec démarrage puis contrôles de santé ;
  - les sessions perdues, calculées comme 1 − Σ parts² ;
  - le cache : taux de hit selon la loi de Zipf, le TTL (formule r·T/(1+r·T)), les données périmées et l'invalidation, le redémarrage à froid ;
  - les files : profondeur, âge, workers, DLQ ;
  - la latence estimée par une file M/M/1 plafonnée ;
  - en mode « géographique » (CDN), la distance sur l'écran donne la latence.
- **Contenu** :
  - 4 concepts interactifs avec défi : **CDN** (nouveau, comme dans la vidéo), Load balancer, Cache (le défi reprend exactement celui de la vidéo : 150 r/s, base à 30 r/s), Files de messages (vagues 20/80 r/s) ;
  - les **13 animations** deviennent des concepts « Apprendre » : titres de section ajoutés, schéma dans le nouveau style, lecture section par section, points continus et voix optionnelle. Leur **version vidéo narrée** reste accessible (`#/animation/<id>/video`, bouton 🎬) ;
  - 17 concepts au total, classés en 7 catégories.
- **Anciennes adresses** (`#/animations`, `#/animation/<id>`, `#/simulateurs`, `#/simulateur/...`) : elles redirigent vers les concepts.
- **Choix assumés** :
  - les libellés sont en français ;
  - pas de police Google : le site doit tourner hors ligne, et la CSP l'interdit ;
  - sur téléphone, le schéma passe au-dessus du texte et défile horizontalement à une taille lisible.
- **Vérifications** :
  - les 16 objectifs de section sont atteints par un script, et aucun n'est validé sans action ;
  - les 4 défis échouent avec le graphe de départ et réussissent avec la solution. Pour les files, 3 workers sont refusés et 4 acceptés ;
  - le parcours réel à la souris a été testé : glisser, relier, Play, réussite, suppression d'une flèche, persistance après rechargement ;
  - mobile sans débordement, CSP sans violation sur 137 écrans, non-régression sur 298 pages sans erreur.
