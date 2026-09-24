ACADEMY.courses.push({
  id: 'aws-devops-pro', phase: 3, kind: 'cert', order: 2,
  title: 'AWS DevOps Engineer Professional', icon: '♾️',
  vendor: 'AWS', level: 'Professional', code: 'DOP-C02',
  hours: '~90h', cost: '~300€', priority: 4,
  subtitle: "Automatiser tout le cycle de vie sur AWS : CI/CD multi-comptes, IaC, résilience, observabilité, réponse aux incidents et conformité.",
  description: "Niveau Professional : scénarios longs, plusieurs réponses plausibles, il faut choisir la plus automatisée, la plus sûre et la moins coûteuse en exploitation. Ce cours consolide DVA et SysOps et ajoute la vision d'entreprise : pipelines multi-comptes, stratégies de déploiement avancées, gouvernance automatisée et remédiation événementielle.",
  searchTerm: 'AWS DevOps Engineer Professional DOP-C02', searchTermEn: 'AWS DevOps Engineer Professional DOP-C02',
  exam: {
    duration: '180 min', questions: '75 QCM', passing: '750/1000',
    domains: [['Automatisation du SDLC', '22%'], ['Gestion de configuration et IaC', '17%'], ['Solutions cloud résilientes', '15%'], ['Supervision et journalisation', '15%'], ['Réponse aux incidents et événements', '14%'], ['Sécurité et conformité', '17%']],
    notes: "Gérez votre temps : ~2 min 20 par question. Les mots-clés « le moins d'effort opérationnel », « le plus rapide à restaurer » ou « sans interruption » départagent souvent deux réponses correctes."
  },
  outcomes: [
    "Concevoir des pipelines CodePipeline multi-comptes et multi-régions",
    "Choisir et implémenter blue/green, canary, rolling, immutable selon la plateforme (EC2, ECS, Lambda)",
    "Industrialiser l'IaC : CloudFormation avancé, StackSets, CDK, Service Catalog",
    "Construire des architectures auto-réparatrices et multi-régions",
    "Centraliser logs et métriques multi-comptes et automatiser la réponse aux incidents",
    "Automatiser la conformité : Config, Security Hub, Organizations, Control Tower"
  ],
  prerequisites: ["AWS DVA et SysOps (ou expérience équivalente)", "2 ans d'exploitation AWS recommandés"],
  resources: [
    { label: 'Page officielle DOP-C02', url: 'https://aws.amazon.com/certification/certified-devops-engineer-professional/' },
    { label: 'Livre blanc : Practicing CI/CD on AWS', url: 'https://docs.aws.amazon.com/whitepapers/latest/practicing-continuous-integration-continuous-delivery/welcome.html' },
    { label: 'AWS Deployment strategies', url: 'https://docs.aws.amazon.com/whitepapers/latest/overview-deployment-options/deployment-strategies.html' }
  ],
  modules: [
    {
      title: 'Automatisation du SDLC',
      lessons: [
        {
          title: 'Pipelines CodePipeline d\'entreprise',
          sections: [
            { h: 'Architecture multi-comptes', p: "Pattern de référence : un compte **outillage** héberge le pipeline ; il assume des **rôles inter-comptes** dans les comptes dev, staging, prod. Les artefacts sont dans un bucket S3 chiffré par une **clé KMS gérée client** dont la politique autorise les comptes cibles.", bullets: ["Source : CodeCommit (en fin de commercialisation), GitHub/GitLab via **CodeConnections**, S3, ECR", "Build/Test : CodeBuild (buildspec, rapports de tests, cache S3 ou local)", "Approbation manuelle avant la prod (notification SNS)", "Déploiement : CodeDeploy, CloudFormation, ECS, Elastic Beanstalk, S3", "Actions **inter-régions** : bucket d'artefacts par région"] },
            { h: 'Déclencheurs et variables', bullets: ["Déclenchement par événement (EventBridge) plutôt que par polling", "Pipeline V2 : déclencheurs par branche/tag/chemin, variables au niveau pipeline", "Exécutions parallèles ou en file (`QUEUED`, `SUPERSEDED`, `PARALLEL`)", "Notifications (CodeStar Notifications → SNS / Chatbot)"] },
            { h: 'Qualité et sécurité dans le pipeline', bullets: ["Tests unitaires, intégration, **CodeGuru Reviewer** / Amazon Q pour la revue de code", "Scan d'images ECR (Inspector) et de dépendances", "cfn-lint, cfn-guard / **CloudFormation Guard** pour valider l'IaC", "Artefacts dans **CodeArtifact** (upstream npm, PyPI, Maven Central)"] }
          ],
          keypoints: ["Compte outillage + rôles inter-comptes + KMS partagé", "Déclenchement EventBridge", "Approbation manuelle avant prod", "Bucket d'artefacts par région"]
        },
        {
          title: 'Stratégies de déploiement par plateforme',
          sections: [
            { h: 'EC2 / on-premises avec CodeDeploy', bullets: ["**In-place** : AllAtOnce, HalfAtATime, OneAtATime, configurations personnalisées", "**Blue/green** : nouveau ASG derrière le même ELB, bascule, conservation de l'ancien pour rollback", "Hooks `appspec.yml` : ApplicationStop, BeforeInstall, AfterInstall, ApplicationStart, **ValidateService**", "Rollback automatique sur **alarme CloudWatch** ou échec de déploiement"] },
            { h: 'ECS et Lambda', bullets: ["ECS **rolling update** (minimumHealthyPercent / maximumPercent) + **circuit breaker** avec rollback", "ECS **blue/green** via CodeDeploy : deux target groups, écoute de test, Canary/Linear/AllAtOnce", "Lambda : alias pondérés via CodeDeploy (Canary, Linear), hooks `BeforeAllowTraffic` / `AfterAllowTraffic`", "Feature flags avec **AppConfig** (déploiement progressif de configuration avec rollback sur alarme)"] },
            { h: 'Elastic Beanstalk', bullets: ["All at once, Rolling, Rolling with additional batch, **Immutable**, **Traffic splitting**", "Blue/green : cloner l'environnement puis **swap des CNAME**", "`.ebextensions` et hooks de plateforme pour personnaliser"] },
            { h: 'Choisir', bullets: ["Zéro interruption + rollback instantané → blue/green", "Réduire le risque progressivement → canary", "Pas de capacité supplémentaire → rolling", "Instances neuves garanties → immutable"] }
          ],
          keypoints: ["CodeDeploy rollback sur alarme CloudWatch", "ECS circuit breaker", "Lambda : alias + Canary/Linear", "AppConfig pour les feature flags"]
        }
      ]
    },
    {
      title: 'IaC et gestion de configuration',
      lessons: [
        {
          title: 'CloudFormation avancé, CDK et Service Catalog',
          sections: [
            { h: 'CloudFormation avancé', bullets: ["**Nested stacks** (réutilisation) vs **cross-stack references** (Export/ImportValue)", "**Custom resources** (Lambda) pour ce que CFN ne sait pas faire", "**Macros** et transforms ; **modules** ; **registre** de types et hooks", "**Stack policies** : protéger des ressources critiques contre les mises à jour", "`AWS::CloudFormation::WaitCondition`, `DependsOn`, paramètres SSM dynamiques (`{{resolve:ssm:...}}`, `{{resolve:secretsmanager:...}}`)"] },
            { h: 'CDK', code: { lang: 'ts', src: 'import * as cdk from "aws-cdk-lib";\nimport * as ecsp from "aws-cdk-lib/aws-ecs-patterns";\n\nexport class CommandesStack extends cdk.Stack {\n  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {\n    super(scope, id, props);\n    new ecsp.ApplicationLoadBalancedFargateService(this, "Api", {\n      cpu: 512, memoryLimitMiB: 1024, desiredCount: 2,\n      taskImageOptions: { image: cdk.aws_ecs.ContainerImage.fromRegistry("nginx:1.27"), containerPort: 80 },\n      circuitBreaker: { rollback: true },\n    });\n  }\n}' }, bullets: ["Constructs L1 (CFN brut), L2 (défauts sensés), L3 (patterns)", "`cdk synth`, `cdk diff`, `cdk deploy` ; **CDK Pipelines** auto-mutable"] },
            { h: 'Gouvernance du provisionnement', bullets: ["**Service Catalog** : produits approuvés (templates) en libre-service avec contraintes de lancement (rôle)", "**Control Tower Account Factory** (+ AFT avec Terraform) pour créer des comptes standardisés", "**StackSets** avec déploiement automatique aux nouveaux comptes d'une OU", "**Systems Manager** : State Manager, Distributor, OpsWorks (en fin de vie) → Ansible/SSM"] }
          ],
          keypoints: ["Nested stacks vs Export/Import", "Custom resource = Lambda", "Stack policy protège", "Service Catalog = libre-service gouverné"]
        }
      ]
    },
    {
      title: 'Résilience, observabilité et incidents',
      lessons: [
        {
          title: 'Architectures auto-réparatrices et multi-régions',
          sections: [
            { h: 'Auto-réparation', bullets: ["ASG + health checks ELB + **lifecycle hooks** (drainer, sauvegarder des logs avant terminaison)", "**Warm pools** : instances pré-initialisées pour scaler plus vite", "Route 53 health checks + failover ; **Application Recovery Controller** (contrôle de routage, readiness checks)", "DynamoDB Global Tables, Aurora Global Database, S3 CRR pour les données", "**AWS Fault Injection Service** : chaos engineering contrôlé"] },
            { h: 'Choisir RTO/RPO', p: "Même grille qu'en SAA (backup/restore, pilot light, warm standby, actif/actif), mais l'examen attend l'**automatisation** : bascule par Route 53/ARC, infrastructure recréée par IaC, runbooks SSM, tests réguliers de reprise." }
          ],
          keypoints: ["Lifecycle hooks pour drainer proprement", "Warm pools pour scaler vite", "ARC pour contrôler la bascule multi-région", "FIS pour tester la résilience"]
        },
        {
          title: 'Observabilité multi-comptes et réponse aux incidents',
          sections: [
            { h: 'Centraliser', bullets: ["**CloudWatch cross-account observability** : un compte de supervision voit métriques, logs et traces des comptes sources", "Logs centralisés : subscription filters → Kinesis Data Firehose → S3 / OpenSearch", "Trail d'organisation vers un compte **log archive** ; S3 Object Lock", "**X-Ray** / ADOT pour le traçage distribué ; **CloudWatch Application Signals** pour les SLO", "**Synthetics** (canaris) et **RUM** pour l'expérience utilisateur"] },
            { h: 'Répondre automatiquement', bullets: ["EventBridge : règles sur événements de service (EC2 state change, Health, GuardDuty findings, CodePipeline)", "Cibles : **SSM Automation**, Lambda, Step Functions, SNS, **Incident Manager** (plans de réponse, astreintes)", "**AWS Health** : événements planifiés (maintenance, retrait d'instance) → automatisation", "Exemple : alarme 5xx après déploiement → rollback CodeDeploy automatique"] },
            { h: 'Dépannage typique', bullets: ["Pipeline bloqué → rôle CodePipeline/CodeBuild sans permission KMS/S3 inter-comptes", "CodeDeploy échoue → agent absent, rôle d'instance sans accès S3, hook `ValidateService` en échec", "Stack en `UPDATE_ROLLBACK_FAILED` → *continue rollback* en ignorant la ressource", "Lambda throttlée → concurrence réservée, quotas"] }
          ],
          keypoints: ["Cross-account observability", "Logs → Firehose → S3/OpenSearch", "EventBridge + SSM Automation / Incident Manager", "AWS Health events automatisables"]
        }
      ]
    },
    {
      title: 'Sécurité et conformité automatisées',
      lessons: [
        {
          title: 'Gouvernance à l\'échelle',
          sections: [
            { h: 'Les briques', bullets: ["**Organizations** : SCP, politiques de tags, politiques de sauvegarde", "**Control Tower** : contrôles préventifs (SCP), détectifs (Config), proactifs (hooks CloudFormation)", "**Config** : conformance packs, agrégateur d'organisation, remédiation automatique", "**Security Hub** : standards (CIS, AWS Foundational Security Best Practices), findings centralisés, actions automatiques", "**IAM Identity Center** ; permission sets ; **IAM Access Analyzer** (politiques inutilisées, validation)"] },
            { h: 'Secrets et données', bullets: ["Secrets Manager avec rotation (Lambda), réplication multi-régions", "KMS : clés multi-régions, politiques de clé pour l'inter-comptes, grants", "Macie pour les données sensibles S3 ; Inspector pour EC2/ECR/Lambda", "Chiffrement imposé via SCP et Config (`encrypted-volumes`, `s3-bucket-server-side-encryption-enabled`)"] },
            { h: 'Réflexes de l\'examen', bullets: ["« Empêcher » → SCP ou permission boundary (préventif)", "« Détecter et corriger » → Config + SSM Automation (détectif + remédiation)", "« Vue unique multi-comptes » → Security Hub / agrégateurs / compte délégué", "« Sans stocker de secret » → rôles, OIDC, Secrets Manager"] }
          ],
          keypoints: ["Préventif = SCP ; détectif = Config ; proactif = hooks", "Security Hub centralise", "Administrateur délégué pour les services de sécurité"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Déploiement blue/green ECS avec rollback automatique',
      goal: "Mettre en place un pipeline qui déploie un service ECS Fargate en blue/green via CodeDeploy, avec rollback sur alarme 5xx.",
      minutes: 120, env: 'AWS (CDK ou console)',
      warning: "ALB et Fargate sont facturés à l'heure : nettoyez le jour même.",
      steps: [
        { t: "Déployez un service ECS Fargate derrière un ALB avec **deux target groups** (blue et green) et un écouteur de test (port 8080)." },
        { t: "Créez une application CodeDeploy de type ECS avec la configuration `CodeDeployDefault.ECSCanary10Percent5Minutes`." },
        { t: "Écrivez `appspec.yaml` (TaskDefinition, ContainerName, ContainerPort) et `taskdef.json` avec le placeholder `<IMAGE1_NAME>`." },
        { t: "Créez un pipeline : source (dépôt) → CodeBuild (build + push ECR + `imageDetail.json`) → action **Amazon ECS (Blue/Green)**." },
        { t: "Créez une alarme CloudWatch sur `HTTPCode_Target_5XX_Count` du target group et associez-la au déploiement (rollback automatique)." },
        { t: "Poussez une version saine : observez la bascule 10 % puis 100 %.", check: "Le trafic passe sur le nouveau target group." },
        { t: "Poussez une version qui renvoie des 500 : l'alarme déclenche le rollback.", check: "CodeDeploy indique « Rolled back » et le trafic revient sur l'ancienne version." }
      ],
      cleanup: "Supprimez pipeline, application CodeDeploy, service et cluster ECS, ALB, dépôt ECR."
    }
  ],
  quiz: [
    { q: "Un pipeline dans un compte outillage doit déployer dans un compte de production. Quelle configuration est nécessaire ?", options: ["Un rôle dans le compte prod assumable par le pipeline, et une clé KMS gérée client autorisant ce compte pour le bucket d'artefacts", "Des clés d'accès IAM du compte prod stockées dans CodeBuild", "Rendre le bucket d'artefacts public", "Utiliser la clé KMS gérée par AWS par défaut"], answer: 0, explain: "La clé aws/s3 par défaut ne peut pas être partagée entre comptes." },
    { q: "Comment annuler automatiquement un déploiement CodeDeploy si le taux d'erreurs augmente ?", options: ["Associer une alarme CloudWatch au groupe de déploiement avec rollback sur alarme", "Ajouter une approbation manuelle", "Utiliser AllAtOnce", "Activer X-Ray"], answer: 0, explain: "CodeDeploy surveille les alarmes pendant le déploiement et revient en arrière." },
    { q: "Quel mécanisme ECS annule automatiquement un rolling update dont les tâches ne démarrent pas ?", options: ["Le deployment circuit breaker avec rollback", "Les lifecycle hooks", "Service Auto Scaling", "Capacity providers"], answer: 0, explain: "Le circuit breaker détecte les échecs répétés et revient à la dernière version stable." },
    { q: "Comment activer progressivement une fonctionnalité en production avec rollback automatique sur alarme, sans redéployer le code ?", options: ["AWS AppConfig feature flags avec stratégie de déploiement et alarme", "CodeDeploy AllAtOnce", "CloudFormation change set", "Lambda layers"], answer: 0, explain: "AppConfig déploie la configuration progressivement et surveille des alarmes." },
    { q: "Il faut exécuter une action (sauvegarder des logs) avant qu'une instance soit terminée par Auto Scaling. Que faire ?", options: ["Utiliser un lifecycle hook de terminaison", "Une alarme CloudWatch", "Une règle Config", "Un warm pool"], answer: 0, explain: "Le hook met l'instance en attente (Terminating:Wait) le temps de l'action." },
    { q: "Comment offrir aux équipes un catalogue de produits d'infrastructure approuvés en libre-service ?", options: ["AWS Service Catalog", "CloudFormation StackSets", "AWS Config", "AWS Organizations"], answer: 0, explain: "Les contraintes de lancement permettent de provisionner sans droits élevés." },
    { q: "Comment empêcher, dans tous les comptes, la désactivation de CloudTrail ?", options: ["Une SCP refusant cloudtrail:StopLogging et DeleteTrail", "Une règle AWS Config", "Une alarme CloudWatch", "Une politique IAM sur chaque utilisateur"], answer: 0, explain: "Préventif = SCP. Config ne ferait que détecter." },
    { q: "Comment visualiser dans un seul compte les métriques et traces de 30 comptes applicatifs ?", options: ["CloudWatch cross-account observability", "Copier les métriques avec Lambda", "Un tableau de bord par compte", "CloudTrail Lake"], answer: 0, explain: "Un compte de supervision est lié aux comptes sources via OAM." },
    { q: "Quelle solution de ressource personnalisée pour exécuter une logique non supportée nativement par CloudFormation ?", options: ["Une custom resource adossée à une fonction Lambda", "Une stack policy", "Un change set", "Un paramètre SSM"], answer: 0, explain: "La Lambda reçoit les événements Create/Update/Delete et renvoie une réponse." },
    { q: "Une stack est en UPDATE_ROLLBACK_FAILED. Quelle action ?", options: ["Corriger la cause puis « Continue update rollback », en ignorant éventuellement la ressource bloquante", "Supprimer le compte", "Créer un change set", "Relancer la mise à jour telle quelle"], answer: 0, explain: "L'option resources-to-skip permet de débloquer la stack." },
    { q: "Comment tester la résilience d'une application en injectant des pannes contrôlées ?", options: ["AWS Fault Injection Service", "AWS Config", "Trusted Advisor", "CloudWatch Synthetics"], answer: 0, explain: "FIS propose des expériences (arrêt d'instances, latence réseau…) avec conditions d'arrêt." },
    { q: "Quelle stratégie Elastic Beanstalk réalise un blue/green ?", options: ["Cloner l'environnement puis échanger les CNAME (swap URLs)", "Rolling with additional batch", "All at once", "Immutable"], answer: 0, explain: "Immutable et traffic splitting restent dans le même environnement." }
  ],
  flashcards: [
    ["Pipeline multi-comptes : ingrédients", "Compte outillage, rôles inter-comptes, bucket d'artefacts chiffré avec CMK partagée"],
    ["Rollback CodeDeploy automatique", "Sur échec de déploiement ou sur alarme CloudWatch"],
    ["Hooks appspec EC2 (ordre clé)", "ApplicationStop → BeforeInstall → AfterInstall → ApplicationStart → ValidateService"],
    ["Hooks Lambda CodeDeploy", "BeforeAllowTraffic, AfterAllowTraffic"],
    ["ECS circuit breaker", "Détecte un rolling update en échec et revient en arrière"],
    ["Blue/green Elastic Beanstalk", "Cloner l'environnement + swap des CNAME"],
    ["AppConfig", "Configuration et feature flags déployés progressivement avec rollback sur alarme"],
    ["Nested stacks vs Export/ImportValue", "Nested : réutiliser des composants · Export/Import : partager des sorties entre stacks indépendantes"],
    ["Stack policy", "Empêche la mise à jour/remplacement de ressources critiques d'une stack"],
    ["Custom resource", "Ressource CloudFormation implémentée par une Lambda (ou SNS)"],
    ["Lifecycle hook ASG", "Pause au lancement ou à la terminaison pour exécuter une action"],
    ["Warm pool", "Instances pré-initialisées (arrêtées ou en veille) pour accélérer le scale-out"],
    ["Préventif / détectif / proactif (Control Tower)", "SCP / règles Config / hooks CloudFormation"],
    ["Centraliser des logs multi-comptes", "Subscription filter → Firehose → S3 (ou OpenSearch) dans le compte log archive"],
    ["Incident Manager", "Plans de réponse, contacts d'astreinte, escalade, runbooks SSM"],
    ["Fault Injection Service", "Chaos engineering managé avec conditions d'arrêt"]
  ]
});
