ACADEMY.courses.push({
  id: 'az-400', phase: 3, kind: 'cert', order: 3,
  title: 'Azure DevOps Engineer Expert', icon: '🔁',
  vendor: 'Azure', level: 'Expert', code: 'AZ-400',
  hours: '~70h', cost: '~165€', priority: 3,
  subtitle: "Concevoir les processus DevOps sur Azure : collaboration, contrôle de source, pipelines YAML, sécurité, conformité et instrumentation.",
  description: "AZ-400 valide votre capacité à concevoir une démarche DevOps complète avec Azure DevOps et GitHub : organisation du travail, stratégie de branches, pipelines YAML multi-étapes, gestion des artefacts et des dépendances, DevSecOps et observabilité. La certification Expert exige d'avoir AZ-104 **ou** AZ-204 : votre AZ-204 de la phase 2 remplit cette condition.",
  searchTerm: 'AZ-400 Azure DevOps', searchTermEn: 'AZ-400 DevOps Engineer Expert',
  exam: {
    duration: '100 min', questions: '40–60 (+ étude de cas)', passing: '700/1000',
    domains: [['Configurer les processus et les communications', '10–15%'], ['Concevoir et implémenter une stratégie de contrôle de source', '10–15%'], ['Concevoir et implémenter des pipelines de build et de release', '50–55%'], ['Développer un plan de sécurité et de conformité', '10–15%'], ['Implémenter une stratégie d\'instrumentation', '5–10%']],
    notes: "Prérequis pour obtenir le titre Expert : AZ-104 ou AZ-204. Les pipelines représentent plus de la moitié de l'examen."
  },
  outcomes: [
    "Organiser le travail avec Azure Boards / GitHub Projects et mesurer le flux (DORA, lead time)",
    "Définir une stratégie de branches, de politiques de branches et de gestion des dépôts",
    "Écrire des pipelines YAML multi-étapes avec templates, environnements et approbations",
    "Gérer artefacts, versions et dépendances (Azure Artifacts, GitHub Packages)",
    "Déployer avec des stratégies progressives (slots, canary, anneaux, feature flags)",
    "Intégrer sécurité et conformité : secrets, analyse de code et de dépendances, identités de charge de travail",
    "Instrumenter avec Azure Monitor, Application Insights et KQL"
  ],
  prerequisites: ["AZ-204 (validé en phase 2)", "Git, CI/CD (GitLab CI)", "Notions d'IaC (Bicep ou Terraform)"],
  resources: [
    { label: 'Page officielle AZ-400', url: 'https://learn.microsoft.com/fr-fr/credentials/certifications/devops-engineer/' },
    { label: 'Documentation Azure Pipelines (YAML)', url: 'https://learn.microsoft.com/fr-fr/azure/devops/pipelines/yaml-schema/' },
    { label: 'Documentation GitHub Actions', url: 'https://docs.github.com/fr/actions' }
  ],
  modules: [
    {
      title: 'Processus et contrôle de source',
      lessons: [
        {
          title: 'Processus, flux et métriques DevOps',
          sections: [
            { h: 'Organiser le travail', bullets: ["**Azure Boards** : epics › features › user stories/PBI › tâches ; processus Agile, Scrum, CMMI, Basic", "Tableaux Kanban, sprints, requêtes, tableaux de bord", "Traçabilité : lier commits, PR et builds aux éléments de travail (`AB#123`)", "GitHub Projects et Issues ; intégration Boards ↔ GitHub"] },
            { h: 'Mesurer ce qui compte', bullets: ["**DORA** : fréquence de déploiement, délai de mise en production (lead time for changes), taux d'échec des changements, temps de restauration", "**Lead time** (de la demande à la livraison) vs **cycle time** (du début du travail à la livraison)", "Diagrammes de flux cumulés (CFD), vélocité, burndown", "Tableaux de bord partagés et **wikis** (documentation as code)"] },
            { h: 'Communication', bullets: ["Notifications et intégrations Teams/Slack", "Webhooks et service hooks", "Release notes générées automatiquement depuis les éléments de travail"] }
          ],
          keypoints: ["4 métriques DORA", "Lead time ≠ cycle time", "AB#id relie commit et élément de travail"]
        },
        {
          title: 'Stratégie de branches et gestion des dépôts',
          sections: [
            { h: 'Stratégies de branches', bullets: ["**Trunk-based** avec branches de fonctionnalité courtes et feature flags (recommandé)", "**GitFlow** pour des releases planifiées", "**Release branches** pour maintenir plusieurs versions", "Forks pour les contributions externes"] },
            { h: 'Politiques de branches (Azure Repos)', bullets: ["Nombre minimal de relecteurs, relecteurs obligatoires par chemin", "**Validation de build** obligatoire avant fusion", "Éléments de travail liés requis ; résolution des commentaires", "Types de fusion autorisés (squash, rebase, merge)", "GitHub : **branch protection rules** / **rulesets**, CODEOWNERS, status checks"] },
            { h: 'Dépôts à grande échelle', bullets: ["**Git LFS** pour les gros fichiers binaires", "Scalar / sparse checkout / clones partiels pour les monorepos", "Purger un secret de l'historique : `git filter-repo` ou BFG — puis **révoquer le secret** (il est compromis)", "Autorisations par dépôt et par branche ; tags de release signés"] }
          ],
          keypoints: ["Politique : relecteurs + build de validation", "CODEOWNERS / relecteurs par chemin", "Git LFS pour les binaires", "Secret dans l'historique = révoquer d'abord"]
        }
      ]
    },
    {
      title: 'Pipelines de build et de release (50–55 %)',
      lessons: [
        {
          title: 'Azure Pipelines YAML',
          sections: [
            { h: 'Structure', bullets: ["`trigger` (CI), `pr` (validation), `schedules`, déclencheurs de ressources (pipeline, conteneur)", "Hiérarchie : **stages** › **jobs** › **steps** (tâches ou scripts)", "Agents : **hébergés par Microsoft** ou **auto-hébergés** (pools, VMSS, conteneurs)", "`dependsOn` et `condition` pour contrôler l'ordre"] },
            { h: 'Un pipeline multi-étapes', code: { lang: 'yaml', src: 'trigger:\n  branches: { include: [main] }\npr: [main]\n\nvariables:\n  - group: commandes-commun        # groupe de variables (lié à Key Vault possible)\n  - name: imageTag\n    value: $(Build.BuildId)\n\nstages:\n  - stage: Build\n    jobs:\n      - job: build\n        pool: { vmImage: ubuntu-latest }\n        steps:\n          - task: Maven@4\n            inputs: { goals: verify, publishJUnitResults: true }\n          - task: Docker@2\n            inputs:\n              containerRegistry: acr-connexion\n              repository: commandes-api\n              command: buildAndPush\n              tags: $(imageTag)\n\n  - stage: Prod\n    dependsOn: Build\n    condition: and(succeeded(), eq(variables[\'Build.SourceBranch\'], \'refs/heads/main\'))\n    jobs:\n      - deployment: deployProd\n        environment: production          # approbations et vérifications ici\n        strategy:\n          runOnce:\n            deploy:\n              steps:\n                - task: AzureWebAppContainer@1\n                  inputs:\n                    azureSubscription: azure-prod-oidc\n                    appName: app-commandes\n                    containers: monacr.azurecr.io/commandes-api:$(imageTag)' } },
            { h: 'Réutiliser', bullets: ["**Templates** : `template:` de steps, jobs, stages ou variables, avec **paramètres** typés", "`extends` : imposer un template de sécurité à tous les pipelines", "Dépôts de templates référencés via `resources: repositories`", "Expressions à la compilation `${{ }}` vs à l'exécution `$[ ]` vs macros `$( )`"] },
            { h: 'Environnements et vérifications', bullets: ["**Environments** : historique des déploiements, **approvals and checks** (approbation, heures ouvrées, requête Azure Monitor, template requis)", "Stratégies de job `deployment` : **runOnce**, **rolling**, **canary**", "**Service connections** : préférer la **fédération d'identité de charge de travail** (OIDC), sans secret"] }
          ],
          keypoints: ["stages › jobs › steps", "Templates + extends pour standardiser", "${{ }} compilation, $[ ] exécution, $( ) macro", "Environments = approbations et vérifications", "Service connection OIDC"]
        },
        {
          title: 'GitHub Actions, artefacts et stratégies de déploiement',
          sections: [
            { h: 'GitHub Actions', code: { lang: 'yaml', src: 'name: ci\non:\n  push: { branches: [main] }\n  pull_request:\npermissions:\n  id-token: write      # OIDC vers Azure\n  contents: read\njobs:\n  build:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix: { java: [17, 21] }\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-java@v4\n        with: { distribution: temurin, java-version: "${{ matrix.java }}", cache: maven }\n      - run: ./mvnw -B verify\n  deploy:\n    needs: build\n    if: github.ref == \'refs/heads/main\'\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - uses: azure/login@v2\n        with:\n          client-id: ${{ vars.AZURE_CLIENT_ID }}\n          tenant-id: ${{ vars.AZURE_TENANT_ID }}\n          subscription-id: ${{ vars.AZURE_SUBSCRIPTION_ID }}' }, bullets: ["Workflows réutilisables (`workflow_call`) et actions composites", "Runners hébergés ou auto-hébergés ; environnements avec relecteurs requis", "Épingler les actions tierces sur un SHA de commit"] },
            { h: 'Artefacts et versions', bullets: ["**Azure Artifacts** : flux NuGet, npm, Maven, Python, Universal ; **upstream sources** ; **vues** (@prerelease, @release)", "Artefacts de pipeline vs paquets versionnés", "Versionnage sémantique automatique (GitVersion) ; conteneurs dans ACR", "Rétention des builds et des artefacts"] },
            { h: 'Déploiements progressifs', bullets: ["**Blue/green** (slots App Service, swap)", "**Canary** et **anneaux de déploiement** (ring 0 interne → ring 1 early adopters → tous)", "**Feature flags** (Azure App Configuration) : découpler déploiement et activation", "**A/B testing** ; déploiement progressif sur AKS (Flagger, Argo Rollouts)", "Bases de données : migrations rétrocompatibles (expand/contract)"] },
            { h: 'Infrastructure as code', bullets: ["**Bicep** / ARM (mode incrémental vs complet), **what-if**", "Terraform avec état distant dans un compte de stockage", "**Azure Deployment Environments** en libre-service", "DSC / Azure Machine Configuration pour la configuration des VM"] }
          ],
          keypoints: ["OIDC : permissions id-token: write", "Azure Artifacts : upstream sources et vues", "Anneaux + feature flags", "Bicep what-if avant déploiement"]
        }
      ]
    },
    {
      title: 'Sécurité, conformité et instrumentation',
      lessons: [
        {
          title: 'DevSecOps et observabilité',
          sections: [
            { h: 'Secrets et identités', bullets: ["**Key Vault** lié aux groupes de variables, tâche AzureKeyVault", "Variables secrètes masquées ; **secure files** pour certificats", "Service connections par **workload identity federation** : aucun secret à faire tourner", "Identités managées pour les agents auto-hébergés"] },
            { h: 'Analyser le code et les dépendances', bullets: ["**GitHub Advanced Security** (et GHAS for Azure DevOps) : **code scanning** (CodeQL), **secret scanning** avec push protection, **dependency review** / Dependabot", "**Microsoft Defender for Cloud** DevOps security : posture des dépôts et pipelines", "Analyse de licences open source ; SBOM", "Scan des conteneurs et de l'IaC (Defender, Trivy, Checkov)"] },
            { h: 'Instrumenter', bullets: ["**Azure Monitor** : métriques, **Log Analytics** (KQL), alertes, groupes d'actions", "**Application Insights** : dépendances, performances, disponibilité, carte d'application", "**Container Insights** / VM Insights", "Alertes dans le pipeline : vérification « Azure Monitor query » avant la promotion", "Tableaux de bord et classeurs (workbooks)"], code: { lang: 'text', src: '// Taux d\'échec des requêtes par version déployée\nrequests\n| where timestamp > ago(24h)\n| summarize total = count(), echecs = countif(success == false) by application_Version\n| extend taux = round(100.0 * echecs / total, 2)\n| order by taux desc' } }
          ],
          keypoints: ["Workload identity federation", "CodeQL + secret scanning + Dependabot", "Vérification Azure Monitor avant promotion", "KQL : summarize … by"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Pipeline YAML multi-étapes avec approbation et OIDC',
      goal: "Dans Azure DevOps (organisation gratuite), construire un pipeline Build → Staging → Prod avec template, environnements, approbation et service connection sans secret.",
      minutes: 90, env: 'Azure DevOps + abonnement Azure',
      steps: [
        { t: "Créez une organisation Azure DevOps gratuite et un projet ; importez votre dépôt Spring Boot dans Azure Repos." },
        { t: "Créez une **service connection** Azure Resource Manager de type *Workload identity federation (automatic)*.", check: "Aucun secret n'est stocké dans la connexion." },
        { t: "Créez les environnements `staging` et `production` ; ajoutez une **approbation** sur production." },
        { t: "Écrivez un template `templates/deploy.yml` avec paramètres `environment` et `appName`, utilisé par les deux stages de déploiement." },
        { t: "Écrivez `azure-pipelines.yml` : stage Build (Maven + tests publiés), puis Staging et Prod via le template.", hint: "Utilisez `condition` pour ne déployer que depuis main." },
        { t: "Ajoutez une **politique de branche** sur main : 1 relecteur + validation de build." },
        { t: "Ouvrez une PR, fusionnez-la, approuvez le déploiement en production et consultez l'historique de l'environnement." }
      ],
      cleanup: "Supprimez les ressources Azure créées (groupe de ressources)."
    }
  ],
  quiz: [
    { q: "Quelle certification est requise, en plus d'AZ-400, pour obtenir le titre Azure DevOps Engineer Expert ?", options: ["AZ-104 ou AZ-204", "AZ-900", "AZ-305", "AZ-500"], answer: 0, explain: "L'une des deux certifications Associate suffit." },
    { q: "Quelle métrique DORA mesure le temps entre un commit et sa mise en production ?", options: ["Lead time for changes", "Fréquence de déploiement", "Taux d'échec des changements", "Temps de restauration"], answer: 0, explain: "Délai de mise en production des changements." },
    { q: "Où configure-t-on une approbation manuelle avant un déploiement en production dans Azure Pipelines YAML ?", options: ["Dans les « approvals and checks » de l'environnement", "Dans le fichier YAML avec une tâche d'approbation obligatoire", "Dans la politique de branche", "Dans Azure Boards"], answer: 0, explain: "Les vérifications sont portées par la ressource environnement, pas par le YAML." },
    { q: "Quel type de service connection évite de stocker un secret de principal de service ?", options: ["Workload identity federation (OIDC)", "Service principal avec secret", "Jeton d'accès personnel", "Certificat publié dans le dépôt"], answer: 0, explain: "Le pipeline échange un jeton OIDC contre un jeton Entra ID." },
    { q: "Quelle syntaxe est évaluée à la compilation du pipeline YAML ?", options: ["${{ }}", "$[ ]", "$( )", "{{ }}"], answer: 0, explain: "$[ ] est évaluée à l'exécution ; $( ) est une macro remplacée juste avant chaque tâche." },
    { q: "Comment imposer qu'un template de sécurité soit utilisé par tous les pipelines ?", options: ["extends + vérification « required template » sur les ressources protégées", "Un groupe de variables", "Une politique de branche", "Un wiki"], answer: 0, explain: "La vérification refuse tout pipeline qui n'étend pas le template requis." },
    { q: "Un secret a été committé il y a 3 mois. Que faire en premier ?", options: ["Révoquer/renouveler le secret", "Réécrire l'historique Git", "Rendre le dépôt privé", "Supprimer le fichier dans un nouveau commit"], answer: 0, explain: "Le secret doit être considéré comme compromis ; nettoyer l'historique vient ensuite." },
    { q: "Quelle fonctionnalité d'Azure Artifacts permet de mettre en cache des paquets de npmjs.com ?", options: ["Les upstream sources", "Les vues", "Les Universal Packages", "Les secure files"], answer: 0, explain: "Le flux proxifie et conserve les paquets publics consommés." },
    { q: "Quelle stratégie déploie d'abord pour les équipes internes, puis pour des utilisateurs pilotes, puis pour tous ?", options: ["Déploiement par anneaux (rings)", "Blue/green", "Recreate", "All at once"], answer: 0, explain: "Chaque anneau élargit l'exposition après validation." },
    { q: "Pour GitHub Actions avec OIDC vers Azure, quelle permission faut-il accorder au workflow ?", options: ["id-token: write", "contents: write", "packages: write", "actions: write"], answer: 0, explain: "Elle permet au job de demander un jeton OIDC." }
  ],
  flashcards: [
    ["Prérequis du titre AZ-400 Expert", "AZ-104 ou AZ-204"],
    ["4 métriques DORA", "Fréquence de déploiement, lead time for changes, taux d'échec des changements, temps de restauration"],
    ["Lead time vs cycle time", "Lead time : de la demande à la livraison · Cycle time : du début du travail à la livraison"],
    ["Politiques de branche Azure Repos", "Relecteurs min., relecteurs par chemin, validation de build, éléments liés, commentaires résolus"],
    ["Hiérarchie Azure Pipelines", "Stages › jobs › steps"],
    ["Expressions YAML", "${{ }} compilation · $[ ] exécution · $( ) macro"],
    ["Stratégies de job deployment", "runOnce, rolling, canary"],
    ["Environments : checks", "Approbations, heures ouvrées, requête Azure Monitor, template requis, verrou exclusif"],
    ["Service connection sans secret", "Workload identity federation (OIDC)"],
    ["Azure Artifacts : upstream sources / vues", "Proxy des registres publics · @prerelease / @release pour promouvoir"],
    ["Déploiement par anneaux", "Exposition progressive : interne → pilotes → tous"],
    ["GitHub : workflow réutilisable", "on: workflow_call"],
    ["GitHub Advanced Security", "Code scanning (CodeQL), secret scanning + push protection, dependency review"],
    ["Bicep : prévisualiser", "az deployment group what-if"]
  ]
});
