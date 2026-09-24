ACADEMY.courses.push({
  id: 'gitlab-ci', phase: 2, kind: 'tech', order: 1,
  title: 'GitLab CI/CD', icon: '🦊', category: 'CI/CD',
  hours: '~35h', priority: 5,
  subtitle: "Concevoir des pipelines .gitlab-ci.yml industriels : stages, règles, cache, artefacts, environnements, sécurité.",
  description: "GitLab CI/CD est au cœur de votre objectif d'automatisation. Ce cours va du premier job au pipeline d'entreprise : templates réutilisables, pipelines parents-enfants, environnements et déploiements, runners, secrets, et intégration de la qualité (SonarQube) et de la sécurité (SAST, scan de conteneurs).",
  searchTerm: 'GitLab CI CD tutoriel', searchTermEn: 'GitLab CI/CD pipeline',
  outcomes: [
    "Écrire un .gitlab-ci.yml : stages, jobs, scripts, images",
    "Contrôler l'exécution avec rules, needs (DAG), when et only-on-changes",
    "Accélérer avec cache et artefacts ; comprendre la différence",
    "Réutiliser avec include, extends, !reference et les composants CI/CD",
    "Déployer vers des environnements avec approbations et rollback",
    "Gérer runners, tags et exécuteurs (Docker, Kubernetes)",
    "Sécuriser : variables masquées/protégées, OIDC vers AWS/Azure, scans de sécurité"
  ],
  prerequisites: ["Git", "Notions de Docker (utile)", "Un compte gitlab.com gratuit ou une instance GitLab"],
  resources: [
    { label: 'Documentation GitLab CI/CD', url: 'https://docs.gitlab.com/ee/ci/' },
    { label: 'Référence de la syntaxe .gitlab-ci.yml', url: 'https://docs.gitlab.com/ee/ci/yaml/' },
    { label: 'Catalogue de composants CI/CD', url: 'https://gitlab.com/explore/catalog' }
  ],
  modules: [
    {
      title: 'Les bases du pipeline',
      lessons: [
        {
          title: 'Anatomie d\'un pipeline GitLab',
          sections: [
            { h: 'Vocabulaire', bullets: ["**Pipeline** : exécution complète déclenchée par un push, une MR, un tag, un planning ou l'API", "**Stage** : étape ; les stages s'exécutent en séquence", "**Job** : unité de travail ; les jobs d'un même stage tournent en parallèle", "**Runner** : agent qui exécute les jobs (partagé gitlab.com ou le vôtre)", "Un job échoué arrête les stages suivants (sauf `allow_failure`)"] },
            { h: 'Un premier .gitlab-ci.yml', code: { lang: 'yaml', src: 'stages: [build, test, package, deploy]\n\ndefault:\n  image: maven:3.9-eclipse-temurin-21\n\nvariables:\n  MAVEN_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository"\n\ncompile:\n  stage: build\n  script: mvn -B -q compile\n\nunit-tests:\n  stage: test\n  script: mvn -B verify\n  artifacts:\n    when: always\n    reports:\n      junit: target/surefire-reports/TEST-*.xml\n\ndocker-image:\n  stage: package\n  image: docker:27\n  services: [docker:27-dind]\n  script:\n    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY\n    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA .\n    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA' } },
            { h: 'Variables prédéfinies utiles', bullets: ["`CI_COMMIT_SHA`, `CI_COMMIT_SHORT_SHA`, `CI_COMMIT_BRANCH`, `CI_COMMIT_TAG`", "`CI_DEFAULT_BRANCH`, `CI_PIPELINE_SOURCE` (push, merge_request_event, schedule…)", "`CI_REGISTRY_IMAGE` : registre de conteneurs du projet", "`CI_PROJECT_DIR`, `CI_JOB_TOKEN` (jeton éphémère du job)"] }
          ],
          keypoints: ["Stages en séquence, jobs d'un stage en parallèle", "Rapports JUnit visibles dans la MR", "Variables prédéfinies CI_*"]
        },
        {
          title: 'Contrôler l\'exécution : rules, needs, when',
          sections: [
            { h: 'rules (remplace only/except)', p: "Les `rules` sont évaluées dans l'ordre : la **première qui correspond** décide si le job est ajouté et comment.", code: { lang: 'yaml', src: 'workflow:\n  rules:   # éviter les pipelines en double (branche + MR)\n    - if: $CI_PIPELINE_SOURCE == "merge_request_event"\n    - if: $CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS\n      when: never\n    - if: $CI_COMMIT_BRANCH\n    - if: $CI_COMMIT_TAG\n\ndeploy-prod:\n  stage: deploy\n  script: ./deploy.sh prod\n  rules:\n    - if: $CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+$/\n      when: manual\n    - when: never\n\nlint-front:\n  script: npm run lint\n  rules:\n    - changes: ["front/**/*"]' } },
            { h: 'needs : le graphe acyclique (DAG)', p: "`needs` permet à un job de démarrer **dès que ses dépendances sont terminées**, sans attendre la fin du stage : les pipelines deviennent beaucoup plus rapides. `needs: []` démarre immédiatement." },
            { h: 'Autres contrôles', bullets: ["`when`: on_success (défaut), on_failure, always, manual, delayed, never", "`allow_failure: true` : l'échec n'est pas bloquant", "`retry: 2` sur les erreurs d'infrastructure", "`timeout`, `interruptible: true` (annuler les pipelines obsolètes)", "`resource_group` : empêcher deux déploiements simultanés sur le même environnement"] }
          ],
          keypoints: ["rules : première correspondance gagnante", "workflow:rules évite les doubles pipelines", "needs = DAG, pipeline plus rapide", "resource_group pour sérialiser les déploiements"]
        }
      ]
    },
    {
      title: 'Performance et réutilisation',
      lessons: [
        {
          title: 'Cache vs artefacts',
          sections: [
            { h: 'La différence essentielle', bullets: ["**Cache** : accélère — dépendances téléchargées (`.m2`, `.npm`), best-effort, peut être absent", "**Artefacts** : transmettent — résultats d'un job (JAR, rapports) aux jobs suivants, garantis, téléchargeables", "Ne jamais compter sur le cache pour la **justesse** du build"] },
            { h: 'Cache bien configuré', code: { lang: 'yaml', src: 'build-front:\n  image: node:20\n  cache:\n    key:\n      files: [package-lock.json]   # nouvelle clé si le lockfile change\n    paths: [.npm/]\n    policy: pull-push\n  script:\n    - npm ci --cache .npm --prefer-offline\n    - npm run build\n  artifacts:\n    paths: [dist/]\n    expire_in: 1 week\n\ntest-front:\n  needs: [build-front]\n  cache:\n    key: { files: [package-lock.json] }\n    paths: [.npm/]\n    policy: pull              # lecture seule : plus rapide\n  script: npm test' } },
            { h: 'Autres accélérateurs', bullets: ["Images de build préconstruites avec les outils déjà installés", "`parallel: 4` pour découper les tests ; `parallel:matrix` pour tester plusieurs versions", "Pipelines de MR ne lançant que ce qui a changé (`rules:changes`)", "Cache Docker : `--cache-from` ou BuildKit avec cache dans le registre"] }
          ],
          keypoints: ["Cache = vitesse, artefacts = transmission", "Clé de cache = hash du lockfile", "policy: pull pour les jobs consommateurs", "parallel:matrix pour les combinaisons"]
        },
        {
          title: 'Templates : include, extends, composants',
          sections: [
            { h: 'Factoriser', code: { lang: 'yaml', src: 'include:\n  - project: "plateforme/ci-templates"\n    ref: v3.2.0\n    file: "/templates/java.yml"\n  - component: $CI_SERVER_FQDN/plateforme/components/sonar@1.4.0\n    inputs:\n      project_key: commandes-api\n  - template: Jobs/SAST.gitlab-ci.yml\n\n.deploy-base:          # job caché (préfixe point)\n  image: alpine/k8s:1.30.2\n  script:\n    - kubectl apply -f k8s/$ENV/\n  resource_group: $ENV\n\ndeploy-staging:\n  extends: .deploy-base\n  variables: { ENV: staging }\n  environment: { name: staging, url: https://staging.exemple.fr }' } },
            { h: 'Les mécanismes', bullets: ["`include:local|project|remote|template|component`", "Jobs cachés `.nom` + `extends` (fusion profonde)", "`!reference [.job, script]` : réutiliser un morceau précis", "Ancres YAML `&` / `*` (limitées au fichier)", "**Composants CI/CD** : templates versionnés avec `inputs` typés, publiés dans le catalogue"] },
            { h: 'Pipelines parent-enfant et multi-projets', bullets: ["`trigger: include:` : pipeline enfant (monorepo : un pipeline par service)", "Pipeline enfant **généré dynamiquement** à partir d'un artefact", "`trigger: project:` : déclencher le pipeline d'un autre projet", "`strategy: depend` : le parent attend le résultat de l'enfant"] }
          ],
          keypoints: ["Épinglez les includes sur une version (ref/tag)", "extends + jobs cachés", "Composants avec inputs = standard moderne", "Parent-enfant pour les monorepos"]
        }
      ]
    },
    {
      title: 'Déploiement et sécurité',
      lessons: [
        {
          title: 'Environnements, déploiements et runners',
          sections: [
            { h: 'Environnements', bullets: ["`environment: name/url` : historique des déploiements, lien dans la MR", "**Environnements protégés** : seuls certains rôles déploient, approbations requises", "**Review apps** : un environnement éphémère par MR (`on_stop` pour le détruire)", "Rollback : relancer le job de déploiement d'un commit précédent", "Stratégies : rolling, blue/green, canary (souvent côté Kubernetes / Argo Rollouts)"] },
            { h: 'Les runners', bullets: ["Types : partagés (instance), de groupe, de projet", "**Exécuteurs** : shell, **docker**, **kubernetes** (un pod par job), docker-autoscaler", "**Tags** : diriger un job vers un runner précis (`tags: [aws, docker]`)", "Runner sur votre infrastructure pour accéder aux réseaux privés", "Privilégié/dind = risque : préférer Kaniko, Buildah ou BuildKit rootless"], code: { lang: 'bash', src: 'gitlab-runner register \\\n  --url https://gitlab.com \\\n  --token glrt-XXXXXXXX \\\n  --executor docker \\\n  --docker-image alpine:3.20' } },
            { h: 'GitOps', p: "Alternative au déploiement « push » depuis la CI : la CI met à jour un dépôt de configuration, et un agent dans le cluster (**Argo CD**, **Flux** ou l'agent GitLab pour Kubernetes) **tire** et applique l'état souhaité. Avantages : audit par Git, pas d'accès cluster depuis la CI, dérive corrigée automatiquement." }
          ],
          keypoints: ["Environnements protégés + approbations pour la prod", "Review apps éphémères par MR", "Exécuteur Kubernetes = un pod par job", "GitOps = pull depuis le cluster"]
        },
        {
          title: 'Sécuriser la chaîne CI/CD',
          sections: [
            { h: 'Variables et secrets', bullets: ["Variables **masquées** (cachées dans les logs) et **protégées** (disponibles seulement sur branches/tags protégés)", "Variables de type **fichier** pour les kubeconfig, certificats", "Jamais de secret dans le `.gitlab-ci.yml` ni dans l'image", "Gestionnaires externes : HashiCorp Vault, AWS Secrets Manager, Azure Key Vault"] },
            { h: 'OIDC : plus de clés cloud stockées', p: "GitLab émet un **jeton d'identité** (`id_tokens`) que AWS STS ou Entra ID échangent contre des identifiants temporaires, restreints au projet et à la branche.", code: { lang: 'yaml', src: 'deploy-aws:\n  image: amazon/aws-cli:2.17.0\n  id_tokens:\n    AWS_TOKEN:\n      aud: https://gitlab.com\n  script:\n    - >\n      export $(printf "AWS_ACCESS_KEY_ID=%s AWS_SECRET_ACCESS_KEY=%s AWS_SESSION_TOKEN=%s"\n      $(aws sts assume-role-with-web-identity\n      --role-arn $ROLE_ARN --role-session-name gitlab-$CI_JOB_ID\n      --web-identity-token $AWS_TOKEN --duration-seconds 3600\n      --query "Credentials.[AccessKeyId,SecretAccessKey,SessionToken]" --output text))\n    - aws sts get-caller-identity' } },
            { h: 'Scans intégrés (DevSecOps)', bullets: ["**SAST** (code), **Secret Detection**, **Dependency Scanning**, **Container Scanning**, **DAST**, IaC scanning", "Résultats dans la MR ; politiques d'approbation si vulnérabilité critique", "Qualité : SonarQube avec **quality gate** bloquante", "Signature d'images (Cosign) et SBOM pour la chaîne d'approvisionnement"] }
          ],
          keypoints: ["Masquée ≠ protégée : utilisez les deux", "OIDC + AssumeRoleWithWebIdentity = zéro clé stockée", "SAST, Secret Detection, Dependency & Container Scanning"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Pipeline complet pour une API Spring Boot',
      goal: "Construire un pipeline build → test → qualité → image → déploiement avec cache, artefacts, rapports JUnit, règles et environnement protégé.",
      minutes: 90, env: 'gitlab.com (runners partagés) + projet Spring Boot du cours précédent',
      steps: [
        { t: "Poussez votre API Spring Boot sur un nouveau projet gitlab.com." },
        { t: "Créez un `.gitlab-ci.yml` avec les stages `build`, `test`, `package`, `deploy` et un cache Maven dont la clé dépend de `pom.xml`." },
        { t: "Ajoutez le job `unit-tests` qui publie le rapport JUnit ; ouvrez une MR et vérifiez l'onglet Tests.", check: "Le widget de tests apparaît dans la MR." },
        { t: "Ajoutez `workflow:rules` pour éviter les pipelines en double sur les MR." },
        { t: "Ajoutez un job `docker-image` utilisant Kaniko pour pousser dans le registre du projet.", lang: 'yaml', cmd: "docker-image:\n  stage: package\n  image:\n    name: gcr.io/kaniko-project/executor:v1.23.2-debug\n    entrypoint: [\"\"]\n  script:\n    - /kaniko/executor --context $CI_PROJECT_DIR\n      --destination $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA\n  rules:\n    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH" },
        { t: "Ajoutez `deploy-staging` (automatique sur main) et `deploy-prod` (manuel, sur tag vX.Y.Z) avec `environment` et `resource_group`. Le script peut être un simple `echo` à ce stade." },
        { t: "Dans Settings › CI/CD › Protected environments, protégez `production` avec une approbation requise." },
        { t: "Utilisez `needs` pour que `docker-image` démarre dès la fin des tests, et comparez la durée du pipeline." }
      ]
    }
  ],
  quiz: [
    { q: "Comment s'exécutent les jobs d'un même stage ?", options: ["En parallèle", "En séquence dans l'ordre du fichier", "Aléatoirement", "Un seul job par stage est autorisé"], answer: 0, explain: "Les stages sont séquentiels ; les jobs d'un stage sont parallèles (selon les runners disponibles)." },
    { q: "Quelle est la différence entre cache et artefacts ?", options: ["Le cache accélère (best-effort), les artefacts transmettent des résultats garantis entre jobs", "Aucune", "Le cache est garanti, les artefacts non", "Les artefacts ne servent qu'aux rapports"], answer: 0, explain: "Ne jamais dépendre du cache pour la justesse d'un build." },
    { q: "Quel mot-clé permet à un job de démarrer sans attendre la fin de tout le stage précédent ?", options: ["needs", "dependencies", "extends", "stage: .pre"], answer: 0, explain: "needs crée un DAG entre jobs." },
    { q: "Comment les `rules` sont-elles évaluées ?", options: ["Dans l'ordre ; la première règle correspondante s'applique", "Toutes doivent correspondre", "La dernière gagne", "Aléatoirement"], answer: 0, explain: "Pensez à terminer par `- when: never` si nécessaire." },
    { q: "Quelle option empêche deux déploiements simultanés sur le même environnement ?", options: ["resource_group", "interruptible", "retry", "parallel"], answer: 0, explain: "resource_group sérialise les jobs qui partagent la même ressource." },
    { q: "Une variable « protégée » est disponible…", options: ["uniquement dans les pipelines de branches ou tags protégés", "uniquement pour les mainteneurs dans l'interface", "masquée dans les logs", "dans tous les pipelines, y compris les forks"], answer: 0, explain: "Masquée = cachée dans les logs ; protégée = limitée aux refs protégées." },
    { q: "Quelle approche évite de stocker des clés AWS dans GitLab ?", options: ["OIDC avec id_tokens et AssumeRoleWithWebIdentity", "Variables masquées", "Chiffrer les clés dans le dépôt", "Utiliser le compte root"], answer: 0, explain: "Le jeton OIDC du job est échangé contre des identifiants temporaires." },
    { q: "À quoi sert `extends` ?", options: ["Hériter de la configuration d'un autre job (souvent caché)", "Étendre la durée du timeout", "Inclure un fichier distant", "Déclencher un pipeline enfant"], answer: 0, explain: "Couplé aux jobs cachés `.template`, il factorise la configuration." },
    { q: "Quel exécuteur de runner crée un pod par job ?", options: ["kubernetes", "shell", "docker", "virtualbox"], answer: 0, explain: "L'exécuteur Kubernetes est idéal pour l'élasticité des runners." },
    { q: "Qu'est-ce que le GitOps ?", options: ["Un agent dans le cluster tire l'état souhaité depuis Git et l'applique", "Pousser directement en production depuis un poste", "Un synonyme de GitFlow", "Stocker les secrets dans Git"], answer: 0, explain: "Argo CD, Flux ou l'agent GitLab réconcilient en continu le cluster avec Git." }
  ],
  flashcards: [
    ["Stage vs job", "Stages : séquentiels · jobs d'un stage : parallèles"],
    ["Cache vs artefacts", "Cache : accélérer, best-effort · Artefacts : transmettre des résultats garantis"],
    ["Clé de cache robuste", "cache:key:files: [package-lock.json] (ou pom.xml)"],
    ["needs", "Dépendances entre jobs (DAG) : démarrage sans attendre le stage complet"],
    ["Éviter les pipelines en double MR/branche", "workflow:rules avec CI_PIPELINE_SOURCE et CI_OPEN_MERGE_REQUESTS"],
    ["Job caché", "Nom préfixé par un point (.template) — non exécuté, réutilisé via extends"],
    ["!reference", "Réutiliser une section précise d'un autre job : !reference [.job, script]"],
    ["Composants CI/CD", "Templates versionnés avec inputs typés, publiés dans le catalogue"],
    ["Pipeline parent-enfant", "trigger: include: — idéal pour les monorepos"],
    ["resource_group", "Sérialise les jobs sur un environnement partagé"],
    ["Variable masquée vs protégée", "Masquée : cachée dans les logs · Protégée : seulement sur branches/tags protégés"],
    ["OIDC GitLab → AWS", "id_tokens + sts assume-role-with-web-identity"],
    ["Build d'image sans Docker privilégié", "Kaniko, Buildah, BuildKit rootless"],
    ["Scans DevSecOps GitLab", "SAST, Secret Detection, Dependency Scanning, Container Scanning, DAST, IaC"],
    ["Review app", "Environnement éphémère par MR, détruit via on_stop"]
  ]
});
