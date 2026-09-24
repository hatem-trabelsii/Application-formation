ACADEMY.courses.push({
  id: 'jenkins', phase: 2, kind: 'tech', order: 6,
  title: 'Jenkins', icon: '🤖', category: 'CI/CD',
  hours: '~25h', priority: 3,
  subtitle: "Pipelines déclaratifs Jenkinsfile, agents, shared libraries, credentials et intégration avec l'écosystème existant.",
  description: "Beaucoup de SI historiques tournent encore sur Jenkins. Savoir le lire, le maintenir et le moderniser (pipelines as code, agents éphémères Kubernetes, configuration as code) est indispensable pour piloter une transition progressive vers GitLab CI ou des pipelines cloud.",
  searchTerm: 'Jenkins pipeline Jenkinsfile', searchTermEn: 'Jenkins declarative pipeline',
  outcomes: [
    "Comprendre l'architecture contrôleur / agents et les exécuteurs",
    "Écrire des Jenkinsfile déclaratifs : stages, steps, post, when, parallel",
    "Gérer les credentials de façon sûre",
    "Utiliser des agents Docker et Kubernetes éphémères",
    "Factoriser avec les shared libraries",
    "Industrialiser : Multibranch, JCasC (Configuration as Code), plugins maîtrisés",
    "Comparer Jenkins et GitLab CI et planifier une migration"
  ],
  prerequisites: ["Git", "Maven ou npm", "Docker"],
  resources: [
    { label: 'Documentation Jenkins — Pipeline', url: 'https://www.jenkins.io/doc/book/pipeline/' },
    { label: 'Syntaxe du pipeline déclaratif', url: 'https://www.jenkins.io/doc/book/pipeline/syntax/' },
    { label: 'Jenkins Configuration as Code', url: 'https://www.jenkins.io/projects/jcasc/' }
  ],
  modules: [
    {
      title: 'Jenkins et le pipeline as code',
      lessons: [
        {
          title: 'Architecture et premiers pipelines',
          sections: [
            { h: 'Contrôleur et agents', bullets: ["**Contrôleur** (ex-master) : interface, planification, configuration — ne doit pas exécuter de builds", "**Agents** : machines ou conteneurs qui exécutent les jobs, avec des **labels**", "**Exécuteurs** : nombre de builds simultanés par agent", "**Plugins** : toute la richesse… et toute la fragilité de Jenkins (versions, sécurité)"] },
            { h: 'Types de jobs', bullets: ["Freestyle : configuration par l'interface — à éviter aujourd'hui", "**Pipeline** : défini par un `Jenkinsfile` versionné", "**Multibranch Pipeline** : un pipeline par branche/PR détectée automatiquement", "**Organization folder** : scanne tout un groupe GitLab/GitHub"] },
            { h: 'Un Jenkinsfile déclaratif', code: { lang: 'groovy', src: 'pipeline {\n  agent { label \'linux\' }\n  options {\n    timeout(time: 30, unit: \'MINUTES\')\n    buildDiscarder(logRotator(numToKeepStr: \'20\'))\n    disableConcurrentBuilds()\n  }\n  environment {\n    IMAGE = "registry.exemple.fr/commandes-api:${env.GIT_COMMIT.take(7)}"\n  }\n  stages {\n    stage(\'Build & tests\') {\n      steps { sh \'./mvnw -B clean verify\' }\n      post { always { junit \'target/surefire-reports/*.xml\' } }\n    }\n    stage(\'Image\') {\n      when { branch \'main\' }\n      steps { sh \'docker build -t $IMAGE . && docker push $IMAGE\' }\n    }\n  }\n  post {\n    failure { echo "Échec : ${env.BUILD_URL}" }\n    cleanup { cleanWs() }\n  }\n}' } }
          ],
          keypoints: ["Pas de build sur le contrôleur", "Pipeline as code = Jenkinsfile dans le dépôt", "Multibranch pour les branches et PR", "post { always / success / failure / cleanup }"]
        },
        {
          title: 'Contrôle de flux, parallélisme et credentials',
          sections: [
            { h: 'Conditions et parallélisme', code: { lang: 'groovy', src: 'stage(\'Tests\') {\n  parallel {\n    stage(\'Unitaires\')    { steps { sh \'./mvnw -B test\' } }\n    stage(\'Intégration\')  { steps { sh \'./mvnw -B verify -Pit\' } }\n    stage(\'Front\')        { agent { docker { image \'node:20\' } }\n                            steps { sh \'npm ci && npm test\' } }\n  }\n}\nstage(\'Déploiement prod\') {\n  when { allOf { branch \'main\'; tag pattern: \'v\\\\d+\\\\.\\\\d+\\\\.\\\\d+\', comparator: \'REGEXP\' } }\n  input { message \'Déployer en production ?\'; submitter \'ops\' }\n  steps { sh \'./deploy.sh prod\' }\n}' } },
            { h: 'Credentials', bullets: ["Stockés dans le magasin de credentials Jenkins (chiffré), référencés par **ID**", "`withCredentials([...])` ou `credentials('id')` dans `environment`", "Masqués automatiquement dans les logs", "Préférer des identifiants éphémères : rôles cloud des agents, OIDC, Vault"], code: { lang: 'groovy', src: 'withCredentials([usernamePassword(credentialsId: \'registry\',\n                  usernameVariable: \'USER\', passwordVariable: \'PASS\')]) {\n  sh \'echo "$PASS" | docker login -u "$USER" --password-stdin registry.exemple.fr\'\n}' }, note: "Utilisez des guillemets simples dans `sh` pour que ce soit le shell (et non Groovy) qui interpole le secret : cela évite de l'exposer." }
          ],
          keypoints: ["parallel { } pour accélérer", "when { branch / tag / expression }", "input pour une approbation manuelle", "withCredentials + guillemets simples"]
        }
      ]
    },
    {
      title: 'Industrialiser Jenkins',
      lessons: [
        {
          title: 'Agents éphémères, shared libraries et JCasC',
          sections: [
            { h: 'Agents Docker et Kubernetes', p: "Un agent éphémère démarre pour un build puis disparaît : environnement propre et reproductible, pas de dérive des machines.", code: { lang: 'groovy', src: 'pipeline {\n  agent {\n    kubernetes {\n      yaml """\n        apiVersion: v1\n        kind: Pod\n        spec:\n          containers:\n            - name: maven\n              image: maven:3.9-eclipse-temurin-21\n              command: [sleep, infinity]\n            - name: kaniko\n              image: gcr.io/kaniko-project/executor:debug\n              command: [sleep, infinity]\n      """\n    }\n  }\n  stages {\n    stage(\'Build\') { steps { container(\'maven\') { sh \'mvn -B verify\' } } }\n  }\n}' } },
            { h: 'Shared libraries', bullets: ["Dépôt Git avec `vars/` (étapes globales) et `src/` (classes Groovy)", "Chargée par `@Library('ci-lib@v2') _`", "Un pipeline standard d'entreprise en une ligne : `pipelineJava(sonar: true)`", "Versionner la bibliothèque et l'épingler sur un tag"], code: { lang: 'groovy', src: '// vars/pipelineJava.groovy dans le dépôt de la bibliothèque\ndef call(Map cfg = [:]) {\n  pipeline {\n    agent { label \'linux\' }\n    stages {\n      stage(\'Build\') { steps { sh \'./mvnw -B verify\' } }\n      stage(\'Sonar\') {\n        when { expression { cfg.sonar } }\n        steps { withSonarQubeEnv(\'sonar\') { sh \'./mvnw -B sonar:sonar\' } }\n      }\n    }\n  }\n}\n\n// Jenkinsfile d\'un projet\n@Library(\'ci-lib@v2\') _\npipelineJava(sonar: true)' } },
            { h: 'Jenkins as code', bullets: ["**JCasC** : toute la configuration du contrôleur en YAML (`jenkins.yaml`)", "Liste de plugins figée (`plugins.txt`) dans une image Docker du contrôleur", "Sauvegarde de `JENKINS_HOME`, mises à jour LTS régulières", "Sécurité : matrice d'autorisations, SSO, pas d'exécution sur le contrôleur, script approval"] }
          ],
          keypoints: ["Agents éphémères Kubernetes = builds propres", "Shared library épinglée sur un tag", "JCasC + plugins.txt = contrôleur reproductible"]
        },
        {
          title: 'Jenkins vs GitLab CI : coexister et migrer',
          sections: [
            { h: 'Comparaison', bullets: ["**Jenkins** : extrêmement flexible, énorme écosystème de plugins, auto-hébergé, maintenance lourde", "**GitLab CI** : intégré au dépôt, YAML, runners simples, sécurité et registre intégrés", "Jenkins `stage` ≈ GitLab `stage/job` ; `agent` ≈ `image`/`tags` ; shared library ≈ `include`/composants ; `post` ≈ `after_script`/`when`", "`input` ≈ `when: manual` + environnements protégés"] },
            { h: 'Stratégie de migration', bullets: ["Inventorier les jobs (le script `Jenkinsfile` ou la config XML des freestyle)", "Classer : simples (migration directe), complexes (plugins spécifiques), à abandonner", "Construire d'abord des **templates GitLab** équivalents aux shared libraries", "Migrer par vagues d'applications, en parallèle (double run) avant de couper", "Mesurer : durée de pipeline, taux d'échec, temps de maintenance (indicateurs DORA)"] }
          ],
          keypoints: ["Correspondances Jenkins ↔ GitLab", "Migrer par vagues avec double run", "Templates d'abord, applications ensuite"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Jenkins local avec pipeline Multibranch',
      goal: "Lancer Jenkins dans Docker, créer un pipeline Multibranch sur votre dépôt et écrire un Jenkinsfile avec tests parallèles, credentials et approbation.",
      minutes: 60, env: 'Docker',
      steps: [
        { t: "Démarrez Jenkins LTS.", cmd: "docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \\\n  -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts-jdk21\ndocker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword" },
        { t: "Terminez l'assistant (plugins suggérés + Pipeline, Docker Pipeline, JUnit)." },
        { t: "Créez un credential « Username with password » d'ID `registry` (valeurs factices)." },
        { t: "Ajoutez un `Jenkinsfile` à votre projet Maven avec : build, tests en `parallel`, publication JUnit, stage conditionnel sur `main` avec `input`." },
        { t: "Créez un job **Multibranch Pipeline** pointant sur votre dépôt Git et lancez le scan.", check: "Un job par branche apparaît ; le build de main s'arrête sur l'approbation." },
        { t: "Utilisez `withCredentials` pour afficher la longueur du mot de passe (et vérifiez qu'il est masqué dans les logs)." }
      ],
      cleanup: "docker rm -f jenkins && docker volume rm jenkins_home"
    }
  ],
  quiz: [
    { q: "Pourquoi ne pas exécuter de builds sur le contrôleur Jenkins ?", options: ["Pour des raisons de sécurité et de stabilité : un build pourrait accéder à la configuration et aux secrets", "Parce que c'est techniquement impossible", "Pour économiser des licences", "Parce que le contrôleur ne supporte pas Git"], answer: 0, explain: "Mettez le nombre d'exécuteurs du contrôleur à 0 et utilisez des agents." },
    { q: "Quel type de job crée automatiquement un pipeline par branche et par PR ?", options: ["Multibranch Pipeline", "Freestyle", "Pipeline simple", "Matrix"], answer: 0, explain: "Le scan détecte les branches contenant un Jenkinsfile." },
    { q: "Quel bloc s'exécute systématiquement à la fin, quel que soit le résultat ?", options: ["post { always { } }", "post { success { } }", "finally { }", "stage('end')"], answer: 0, explain: "cleanup s'exécute aussi toujours, en dernier." },
    { q: "Comment exécuter trois stages de tests en même temps ?", options: ["Les placer dans un bloc parallel", "Utiliser trois Jenkinsfile", "Utiliser input", "Mettre agent none"], answer: 0, explain: "parallel { stage(...) stage(...) }" },
    { q: "Pourquoi utiliser des guillemets simples dans `sh` avec un secret ?", options: ["Pour que le shell interpole la variable et que Groovy n'expose pas le secret", "Pour accélérer le build", "Parce que Groovy interdit les guillemets doubles", "Pour désactiver le masquage"], answer: 0, explain: "L'interpolation Groovy peut divulguer le secret dans la commande enregistrée." },
    { q: "Qu'est-ce qu'une shared library Jenkins ?", options: ["Un dépôt de code Groovy réutilisable chargé par @Library", "Un plugin payant", "Un agent partagé", "Un dossier de credentials"], answer: 0, explain: "Elle permet de standardiser les pipelines de l'entreprise." },
    { q: "Quel est l'intérêt de JCasC ?", options: ["Décrire la configuration du contrôleur en YAML versionné et reproductible", "Accélérer les builds Java", "Remplacer les agents", "Chiffrer les logs"], answer: 0, explain: "Jenkins Configuration as Code évite la configuration manuelle par l'interface." },
    { q: "Quel est l'équivalent GitLab CI de l'étape `input` de Jenkins ?", options: ["when: manual (avec environnement protégé)", "needs", "cache", "include"], answer: 0, explain: "Un job manuel sur un environnement protégé nécessite une action (et éventuellement une approbation)." }
  ],
  flashcards: [
    ["Contrôleur vs agent", "Contrôleur : orchestration et UI · Agent : exécute les builds (labels, exécuteurs)"],
    ["Structure d'un pipeline déclaratif", "pipeline { agent · options · environment · stages { stage { steps } } · post }"],
    ["Conditions post", "always, success, failure, unstable, changed, fixed, aborted, cleanup"],
    ["Stage conditionnel", "when { branch 'main' } / when { tag '…' } / when { expression { … } }"],
    ["Approbation manuelle", "input { message '…'; submitter 'groupe' }"],
    ["Utiliser un secret", "withCredentials([usernamePassword(credentialsId: 'id', …)]) { sh '…' }"],
    ["Charger une shared library", "@Library('nom@version') _"],
    ["Dossiers d'une shared library", "vars/ (étapes globales) et src/ (classes Groovy)"],
    ["Agent éphémère Kubernetes", "agent { kubernetes { yaml '…pod…' } } + container('nom') { … }"],
    ["JCasC", "Configuration du contrôleur Jenkins en YAML (jenkins.yaml)"],
    ["Publier des résultats de tests", "junit 'target/surefire-reports/*.xml'"],
    ["Jenkins → GitLab : shared library", "include / composants CI/CD"]
  ]
});
