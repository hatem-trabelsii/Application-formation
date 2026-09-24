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
