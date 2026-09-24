ACADEMY.courses.push({
  id: 'git', phase: 1, kind: 'tech', order: 1,
  title: 'Git', icon: '🔀', category: 'Versioning',
  hours: '~15h', priority: 5,
  subtitle: "Versionner proprement : modèle interne, branches, merge vs rebase, workflows d'équipe et récupération d'erreurs.",
  description: "Git est le socle de toute la chaîne CI/CD que vous construirez en phase 2. Ce cours part du modèle interne (commits, arbres, références) pour que chaque commande devienne logique, puis couvre les workflows d'équipe (GitFlow, trunk-based), la résolution de conflits et la récupération d'erreurs.",
  searchTerm: 'Git tutoriel', searchTermEn: 'Git',
  outcomes: [
    "Comprendre les 3 zones : répertoire de travail, index, dépôt",
    "Écrire des commits atomiques avec des messages conventionnels",
    "Créer, fusionner et rebaser des branches en toute confiance",
    "Résoudre des conflits de fusion",
    "Choisir entre GitFlow, GitHub Flow et trunk-based development",
    "Annuler sans rien perdre : restore, reset, revert, reflog",
    "Travailler avec des dépôts distants, merge requests et tags de version"
  ],
  prerequisites: ["Utiliser un terminal (cd, ls)", "Git installé (git --version)"],
  resources: [
    { label: 'Pro Git (livre officiel, gratuit, en français)', url: 'https://git-scm.com/book/fr/v2' },
    { label: 'Learn Git Branching (exercices interactifs)', url: 'https://learngitbranching.js.org/?locale=fr_FR' },
    { label: 'Conventional Commits', url: 'https://www.conventionalcommits.org/fr/' }
  ],
  modules: [
    {
      title: 'Les fondamentaux',
      lessons: [
        {
          title: 'Le modèle de Git : 3 zones et des instantanés',
          sections: [
            { h: 'Des instantanés, pas des différences', p: "Chaque **commit** est un instantané complet du projet, identifié par un hash SHA-1 (ou SHA-256), qui pointe vers son ou ses parents. Git stocke des **blobs** (contenu des fichiers), des **trees** (répertoires) et des **commits**." },
            { h: 'Les trois zones', bullets: ["**Working directory** : vos fichiers modifiés", "**Index (staging area)** : ce qui partira dans le prochain commit", "**Dépôt (.git)** : l'historique des commits"] },
            { h: 'Le cycle de base', code: { lang: 'bash', src: 'git init mon-projet && cd mon-projet\ngit config --global user.name "Prénom Nom"\ngit config --global user.email "moi@exemple.fr"\n\ngit status                # que se passe-t-il ?\ngit add fichier.txt       # working dir -> index\ngit add -p                # ajouter morceau par morceau\ngit commit -m "feat: ajoute la page d\'accueil"\ngit log --oneline --graph --all' } },
            { h: 'Les bons réflexes', bullets: ["Commits **atomiques** : un changement logique par commit", "Messages **Conventional Commits** : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`", "Un fichier `.gitignore` dès le début (build, secrets, IDE)", "Ne jamais committer de secret : s'il y en a un, considérez-le compromis et changez-le"] }
          ],
          keypoints: ["Commit = instantané + parents + auteur + message", "add → index ; commit → dépôt", "git add -p pour des commits propres"]
        },
        {
          title: 'Branches, HEAD et fusion',
          sections: [
            { h: "Une branche n'est qu'un pointeur", p: "Une **branche** est un fichier qui contient le hash d'un commit. **HEAD** pointe vers la branche courante. Créer une branche est donc instantané et gratuit.", code: { lang: 'bash', src: 'git switch -c feature/login     # créer et basculer\ngit branch -vv                  # lister avec suivi distant\ngit switch main\ngit merge feature/login         # fusionner dans main\ngit branch -d feature/login     # supprimer la branche fusionnée' } },
            { h: 'Fast-forward vs commit de fusion', bullets: ["**Fast-forward** : main n'a pas bougé, Git avance simplement le pointeur", "**Merge commit** : les deux branches ont divergé, Git crée un commit à deux parents", "`--no-ff` force un commit de fusion pour garder la trace de la branche"] },
            { h: 'Résoudre un conflit', p: "Un conflit survient quand les deux branches modifient les mêmes lignes. Git insère des marqueurs `<<<<<<<`, `=======`, `>>>>>>>` : éditez le fichier, gardez la bonne version, puis `git add` et `git commit` (ou `git merge --continue`).", bullets: ["`git merge --abort` pour tout annuler", "`git diff` montre les zones en conflit", "Un bon outil : l'éditeur de fusion de VS Code / IntelliJ"] }
          ],
          keypoints: ["Branche = pointeur ; HEAD = où je suis", "Fast-forward si pas de divergence", "Conflit : éditer, add, continuer"]
        }
      ]
    },
    {
      title: "Travail d'équipe",
      lessons: [
        {
          title: 'Rebase, historique propre et remotes',
          sections: [
            { h: 'Le rebase', p: "`git rebase main` rejoue vos commits **au-dessus** de main : l'historique devient linéaire. Les commits sont **réécrits** (nouveaux hash).", bullets: ["Règle d'or : **ne jamais rebaser des commits déjà partagés** sur une branche commune", "`git rebase -i HEAD~3` : réordonner, fusionner (squash), renommer des commits", "`git pull --rebase` évite les commits de fusion inutiles"] },
            { h: 'Dépôts distants', code: { lang: 'bash', src: 'git clone git@gitlab.com:equipe/app.git\ngit remote -v\ngit fetch origin                 # récupérer sans fusionner\ngit pull --rebase origin main    # fetch + rebase\ngit push -u origin feature/login # publier et suivre\ngit push --force-with-lease      # forcer prudemment après un rebase' } },
            { h: 'Tags et versions', p: "Un **tag annoté** marque une version livrée : `git tag -a v1.2.0 -m \"Release 1.2.0\"` puis `git push origin v1.2.0`. Suivez le **versionnage sémantique** : MAJEUR.MINEUR.CORRECTIF." }
          ],
          keypoints: ["Rebase = historique linéaire, mais réécrit", "Jamais de rebase sur une branche partagée", "--force-with-lease plutôt que --force"]
        },
        {
          title: 'Workflows : GitFlow, GitHub Flow, trunk-based',
          sections: [
            { h: 'GitFlow', p: "Branches `main` (production), `develop` (intégration), `feature/*`, `release/*`, `hotfix/*`. Adapté aux livraisons planifiées et versionnées, mais lourd pour le déploiement continu." },
            { h: 'GitHub Flow / GitLab Flow', p: "Une branche `main` toujours déployable, des branches de fonctionnalité courtes, une **merge request** revue et testée par la CI, puis fusion et déploiement. GitLab Flow ajoute des branches d'environnement (`staging`, `production`)." },
            { h: 'Trunk-based development', p: "Tout le monde intègre dans `main` au moins une fois par jour, avec des branches de quelques heures. Les fonctionnalités inachevées sont masquées par des **feature flags**. C'est le modèle des équipes DevOps les plus performantes (DORA).", bullets: ["Branches courtes = moins de conflits", "CI rapide obligatoire", "Revue de code légère mais systématique"] },
            { h: 'Protéger la branche principale', bullets: ["Branches protégées : pas de push direct sur main", "Merge request obligatoire avec approbation", "Pipeline CI vert obligatoire avant fusion", "Squash des commits à la fusion si l'historique de la branche est brouillon"] }
          ],
          keypoints: ["GitFlow = releases planifiées", "Trunk-based + feature flags = livraison continue", "Branche main protégée + MR + CI verte"]
        },
        {
          title: "Annuler et récupérer : restore, reset, revert, reflog",
          sections: [
            { h: 'La bonne commande pour chaque cas', bullets: ["Annuler une modif non indexée : `git restore fichier`", "Désindexer : `git restore --staged fichier`", "Corriger le dernier commit (non poussé) : `git commit --amend`", "Annuler un commit **déjà partagé** : `git revert <hash>` (crée un commit inverse)", "Revenir en arrière localement : `git reset --soft|--mixed|--hard <hash>`"] },
            { h: 'Les trois modes de reset', bullets: ["`--soft` : déplace la branche, garde index et fichiers", "`--mixed` (défaut) : vide l'index, garde les fichiers", "`--hard` : écrase tout — dangereux"] },
            { h: 'Le filet de sécurité : reflog', p: "Le **reflog** enregistre tous les déplacements de HEAD pendant ~90 jours. Un commit « perdu » après un reset ou un rebase raté se retrouve presque toujours.", code: { lang: 'bash', src: 'git reflog                      # historique des positions de HEAD\ngit switch -c sauvetage HEAD@{3}  # recréer une branche sur un état passé\n\ngit stash push -m "wip"         # mettre de côté\ngit stash list && git stash pop\n\ngit bisect start                # trouver le commit fautif par dichotomie\ngit bisect bad && git bisect good v1.0.0' } }
          ],
          keypoints: ["Partagé → revert ; local → reset", "reset --hard efface les modifications non commitées", "reflog retrouve (presque) tout"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Branches, conflit et rebase interactif',
      goal: "Provoquer et résoudre un conflit, puis nettoyer un historique avec un rebase interactif.",
      minutes: 35, env: 'Terminal local',
      steps: [
        { t: "Créez un dépôt avec un fichier `app.txt` contenant « version: 1 » et commitez.", cmd: "mkdir lab-git && cd lab-git && git init\necho 'version: 1' > app.txt\ngit add . && git commit -m 'chore: init'" },
        { t: "Sur une branche `feature/a`, remplacez par « version: 2-A » et commitez.", cmd: "git switch -c feature/a\necho 'version: 2-A' > app.txt && git commit -am 'feat: version A'" },
        { t: "Retournez sur main, écrivez « version: 2-B » et commitez.", cmd: "git switch main\necho 'version: 2-B' > app.txt && git commit -am 'feat: version B'" },
        { t: "Fusionnez `feature/a` dans main : constatez le conflit, résolvez-le en gardant « version: 3 », terminez la fusion.", cmd: "git merge feature/a\n# éditez app.txt puis :\ngit add app.txt && git commit", check: "`git log --oneline --graph` montre un commit à deux parents." },
        { t: "Créez 3 petits commits « wip » puis fusionnez-les en un seul avec un rebase interactif.", cmd: "for i in 1 2 3; do echo $i >> notes.txt; git add .; git commit -m \"wip $i\"; done\ngit rebase -i HEAD~3   # remplacez 'pick' par 'squash' sur les lignes 2 et 3", check: "Un seul commit remplace les trois." },
        { t: "Faites un `git reset --hard HEAD~2`, puis récupérez l'état perdu avec le reflog.", cmd: "git reset --hard HEAD~2\ngit reflog\ngit reset --hard HEAD@{1}" }
      ]
    }
  ],
  quiz: [
    { q: "Que fait `git add` ?", options: ["Copie les modifications du répertoire de travail vers l'index", "Crée un commit", "Envoie les commits vers le dépôt distant", "Crée une branche"], answer: 0, explain: "L'index (staging) prépare le prochain commit." },
    { q: "Quelle commande annule un commit déjà poussé sur une branche partagée sans réécrire l'historique ?", options: ["git revert", "git reset --hard", "git commit --amend", "git rebase -i"], answer: 0, explain: "revert crée un nouveau commit inverse : l'historique partagé reste intact." },
    { q: "Qu'est-ce qu'une branche dans Git ?", options: ["Un pointeur mobile vers un commit", "Une copie complète du dépôt", "Un dossier séparé", "Un tag immuable"], answer: 0, explain: "Une branche est une simple référence contenant un hash de commit." },
    { q: "Quelle est la règle d'or du rebase ?", options: ["Ne pas rebaser des commits déjà publiés sur une branche partagée", "Toujours rebaser main sur les features", "Rebaser uniquement avec --hard", "Ne jamais rebaser en local"], answer: 0, explain: "Le rebase réécrit les hash : les collègues se retrouveraient avec un historique divergent." },
    { q: "Quel mode de `git reset` supprime aussi les modifications du répertoire de travail ?", options: ["--hard", "--soft", "--mixed", "--keep"], answer: 0, explain: "--hard réinitialise branche, index et fichiers." },
    { q: "Vous avez perdu un commit après un rebase raté. Quel outil le retrouve ?", options: ["git reflog", "git stash", "git blame", "git clean"], answer: 0, explain: "Le reflog trace chaque déplacement de HEAD." },
    { q: "Quel modèle de branches consiste à intégrer dans main au moins une fois par jour avec des feature flags ?", options: ["Trunk-based development", "GitFlow", "Forking workflow", "Release branching"], answer: 0, explain: "Trunk-based : branches très courtes, intégration continue réelle." },
    { q: "Pourquoi préférer `git push --force-with-lease` à `--force` ?", options: ["Il refuse d'écraser des commits distants que vous n'avez pas encore récupérés", "Il est plus rapide", "Il crée une sauvegarde automatique", "Il fusionne au lieu d'écraser"], answer: 0, explain: "Il vérifie que la branche distante est dans l'état attendu avant d'écraser." },
    { q: "Quel préfixe Conventional Commits pour une correction de bug ?", options: ["fix:", "feat:", "chore:", "refactor:"], answer: 0, explain: "fix: déclenche un incrément de version CORRECTIF en semver automatisé." },
    { q: "Quelle commande trouve par dichotomie le commit qui a introduit un bug ?", options: ["git bisect", "git blame", "git log -S", "git cherry-pick"], answer: 0, explain: "bisect teste l'historique en coupant en deux à chaque étape." }
  ],
  flashcards: [
    ["Les 3 zones de Git", "Répertoire de travail → index (staging) → dépôt"],
    ["Qu'est-ce que HEAD ?", "Une référence vers la branche (ou le commit) courant"],
    ["Fast-forward", "Fusion sans commit de merge : la branche cible avance simplement jusqu'au commit de la source"],
    ["merge vs rebase", "merge : conserve l'historique, commit à 2 parents · rebase : rejoue les commits, historique linéaire mais réécrit"],
    ["revert vs reset", "revert : nouveau commit inverse (sûr si partagé) · reset : déplace la branche (local)"],
    ["reset --soft / --mixed / --hard", "soft : garde index+fichiers · mixed : garde fichiers · hard : écrase tout"],
    ["Récupérer un commit perdu", "git reflog puis git switch -c sauvetage HEAD@{n}"],
    ["Mettre de côté un travail en cours", "git stash push -m \"msg\" / git stash pop"],
    ["Squasher 3 commits", "git rebase -i HEAD~3 puis 'squash' (ou 's') sur les commits à fusionner"],
    ["Annuler la dernière modification d'un fichier non indexé", "git restore fichier"],
    ["Conventional Commits : types principaux", "feat, fix, docs, style, refactor, perf, test, build, ci, chore"],
    ["Versionnage sémantique", "MAJEUR (rupture) . MINEUR (fonctionnalité compatible) . CORRECTIF (bug)"],
    ["GitFlow : branches", "main, develop, feature/*, release/*, hotfix/*"],
    ["Trunk-based development", "Intégration dans main ≥ 1×/jour, branches courtes, feature flags"],
    ["git fetch vs git pull", "fetch : récupère sans toucher vos branches · pull : fetch + merge (ou rebase)"]
  ]
});
