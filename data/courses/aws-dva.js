ACADEMY.courses.push({
  id: 'aws-dva', phase: 2, kind: 'cert', order: 2,
  title: 'AWS Developer Associate', icon: '👩‍💻',
  vendor: 'AWS', level: 'Associate', code: 'DVA-C02',
  hours: '~60-80h', cost: '~150€', priority: 4,
  subtitle: "Développer, sécuriser, déployer et déboguer des applications cloud natives sur AWS.",
  description: "Là où SAA vous fait penser en architecte, DVA vous fait penser en développeur : SDK et gestion des identifiants, Lambda et API Gateway, DynamoDB en profondeur, messagerie, Cognito, chaîne CI/CD AWS (CodePipeline, CodeBuild, CodeDeploy), SAM/CloudFormation, et observabilité avec X-Ray.",
  searchTerm: 'AWS Developer Associate DVA-C02', searchTermEn: 'AWS Certified Developer Associate DVA-C02',
  exam: {
    duration: '130 min', questions: '65 QCM', passing: '720/1000',
    domains: [['Développement avec les services AWS', '32%'], ['Sécurité', '26%'], ['Déploiement', '24%'], ['Dépannage et optimisation', '18%']]
  },
  outcomes: [
    "Utiliser le SDK AWS et la chaîne de résolution des identifiants",
    "Développer des fonctions Lambda performantes (cold start, concurrence, destinations)",
    "Exposer des API avec API Gateway (stages, autorisations, throttling)",
    "Modéliser et interroger DynamoDB (clés, index, capacité, streams)",
    "Authentifier des utilisateurs avec Cognito (User Pools / Identity Pools)",
    "Déployer avec SAM, CloudFormation, CodePipeline et CodeDeploy (canary, blue/green)",
    "Tracer et déboguer avec CloudWatch Logs, métriques et X-Ray"
  ],
  prerequisites: ["AWS Cloud Practitioner", "Savoir programmer (Python, Java ou JavaScript)"],
  resources: [
    { label: 'Page officielle DVA-C02', url: 'https://aws.amazon.com/certification/certified-developer-associate/' },
    { label: 'Guide du développeur AWS Lambda', url: 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html' },
    { label: 'Guide du développeur DynamoDB', url: 'https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html' },
    { label: 'AWS SAM', url: 'https://docs.aws.amazon.com/serverless-application-model/' }
  ],
  modules: [
    {
      title: 'Développer avec les services AWS',
      lessons: [
        {
          title: 'SDK, identifiants et bonnes pratiques d\'appel',
          sections: [
            { h: "La chaîne de résolution des identifiants", p: "Le SDK cherche les identifiants dans un ordre précis : paramètres explicites du code → **variables d'environnement** (`AWS_ACCESS_KEY_ID`…) → fichiers `~/.aws/credentials` et `config` (profils, SSO) → **rôle du conteneur** (ECS) → **rôle d'instance** EC2 (IMDS). En production, seuls les rôles sont acceptables." },
            { h: 'Appels robustes', bullets: ["Erreurs **429 / ThrottlingException** et 5xx : réessayer avec **exponential backoff + jitter** (intégré au SDK)", "Pagination : suivre `NextToken` / `LastEvaluatedKey` (ou les paginateurs du SDK)", "Réutiliser les clients SDK (ne pas les recréer à chaque appel)", "Timeouts explicites"], code: { lang: 'python', src: 'import boto3\nfrom botocore.config import Config\n\ncfg = Config(retries={"max_attempts": 10, "mode": "adaptive"})\ns3 = boto3.client("s3", config=cfg)\n\npaginator = s3.get_paginator("list_objects_v2")\nfor page in paginator.paginate(Bucket="mon-bucket", Prefix="factures/"):\n    for obj in page.get("Contents", []):\n        print(obj["Key"], obj["Size"])' } },
            { h: 'S3 côté développeur', bullets: ["**URL présignée** : accès temporaire en lecture ou écriture sans identifiants", "**Multipart upload** : recommandé > 100 Mo, obligatoire > 5 Go", "**S3 Event Notifications** vers Lambda, SQS, SNS ou EventBridge", "Cohérence forte en lecture après écriture (depuis 2020)"] }
          ],
          keypoints: ["Ordre : code → env → fichiers → rôle conteneur → rôle instance", "Backoff exponentiel + jitter sur throttling", "URL présignée pour accès temporaire"]
        },
        {
          title: 'AWS Lambda en profondeur',
          sections: [
            { h: 'Modèles d\'invocation', bullets: ["**Synchrone** : API Gateway, ALB, SDK `RequestResponse` — l'appelant gère les erreurs", "**Asynchrone** : S3, SNS, EventBridge — Lambda réessaie 2 fois, puis **DLQ** ou **destinations** (succès/échec)", "**Event source mapping** (polling) : SQS, Kinesis, DynamoDB Streams — traitement par lots, `ReportBatchItemFailures`"] },
            { h: 'Performance et limites', bullets: ["Mémoire 128 Mo → 10 Go ; le **CPU est proportionnel à la mémoire**", "Timeout max **15 min** ; `/tmp` jusqu'à 10 Go ; payload synchrone 6 Mo", "**Cold start** : initialiser les clients HORS du handler ; **Provisioned Concurrency** ou **SnapStart** (Java) pour le réduire", "**Reserved concurrency** : garantit ET plafonne la concurrence d'une fonction", "Quota de concurrence par région (1 000 par défaut, augmentable)"] },
            { h: 'Un handler propre', code: { lang: 'python', src: 'import json, os, boto3\n\ntable = boto3.resource("dynamodb").Table(os.environ["TABLE"])  # initialisé une fois\n\ndef handler(event, context):\n    body = json.loads(event.get("body") or "{}")\n    table.put_item(Item={"pk": body["id"], "montant": body["montant"]})\n    return {"statusCode": 201, "body": json.dumps({"ok": True})}' } },
            { h: 'Packaging et configuration', bullets: ["**Layers** : partager des dépendances entre fonctions (5 max)", "Image conteneur jusqu'à 10 Go", "**Versions** immuables et **alias** (`prod` → v7) pour le routage pondéré", "Variables d'environnement chiffrées avec KMS ; secrets via Secrets Manager / Parameter Store", "Lambda dans un VPC : accède aux ressources privées ; pour Internet, NAT Gateway"] }
          ],
          keypoints: ["Async : 2 retries puis DLQ/destinations", "CPU ∝ mémoire", "Init hors handler ; SnapStart/Provisioned Concurrency contre le cold start", "Alias + versions = déploiement progressif"]
        },
        {
          title: 'DynamoDB pour développeurs',
          sections: [
            { h: 'Les clés', bullets: ["**Clé de partition** seule ou **partition + tri** (clé composite)", "Choisir une clé de partition à **forte cardinalité** pour éviter les partitions chaudes", "Élément max **400 Ko**", "**Single-table design** : plusieurs entités dans une table, clés génériques `PK`/`SK`"] },
            { h: 'Lire efficacement', bullets: ["**GetItem** (une clé), **Query** (une partition, filtre sur la clé de tri) — efficaces", "**Scan** : parcourt toute la table — à éviter", "**LSI** : même clé de partition, autre clé de tri, créé à la création de la table", "**GSI** : autre clé de partition et de tri, ajout possible à tout moment, cohérence à terme", "Lectures **fortement cohérentes** (x2 coût) vs **à terme** (défaut)"] },
            { h: 'Capacité', p: "Mode **on-demand** ou **provisionné**. Calculs d'examen : **1 WCU** = 1 écriture/s d'1 Ko ; **1 RCU** = 1 lecture fortement cohérente/s de 4 Ko (ou 2 lectures à terme). Les transactions coûtent le double.", code: { lang: 'text', src: 'Exemple : 10 lectures/s fortement cohérentes d\'éléments de 6 Ko\n→ 6 Ko arrondi à 8 Ko = 2 unités de 4 Ko → 2 RCU par lecture\n→ 10 × 2 = 20 RCU (10 RCU en cohérence à terme)\n\n20 écritures/s d\'éléments de 1,5 Ko\n→ arrondi à 2 Ko = 2 WCU par écriture → 40 WCU' } },
            { h: 'Fonctionnalités avancées', bullets: ["**Écritures conditionnelles** et **verrouillage optimiste** (attribut version)", "**TransactWriteItems** : tout ou rien sur plusieurs éléments", "**TTL** : expiration automatique", "**DynamoDB Streams** → Lambda pour réagir aux changements", "`ProjectionExpression` pour ne lire que certains attributs"] }
          ],
          keypoints: ["Query > Scan", "GSI ajout à tout moment ; LSI à la création", "1 WCU = 1 Ko/s ; 1 RCU = 4 Ko/s fortement cohérent", "Streams + Lambda = réaction aux changements"]
        },
        {
          title: 'API Gateway, messagerie et orchestration',
          sections: [
            { h: 'API Gateway', bullets: ["**REST API** (fonctionnalités complètes : cache, clés d'API, plans d'usage) vs **HTTP API** (moins cher, plus simple, JWT natif) vs **WebSocket**", "**Stages** (dev, prod) et **stage variables**", "Intégration **proxy Lambda** : tout l'événement HTTP est transmis", "Throttling : 10 000 req/s par défaut par région, **429 Too Many Requests**", "Erreurs : 502 (réponse Lambda mal formée), 504 (timeout d'intégration, 29 s par défaut)"] },
            { h: 'Autorisation d\'une API', bullets: ["**IAM** (SigV4) : appels entre services AWS", "**Cognito User Pool authorizer** : utilisateurs finaux avec jetons JWT", "**Lambda authorizer** : logique personnalisée (jeton tiers, en-têtes)", "Clés d'API : identification et quotas, **pas** une méthode d'authentification"] },
            { h: 'Messagerie et workflows', bullets: ["SQS : **visibility timeout**, **long polling** (`WaitTimeSeconds` jusqu'à 20 s), taille de message limitée (256 Ko historiquement, relevée à 1 Mio en 2025 : vérifiez la doc) — pattern *claim check* avec S3 au-delà", "SNS : filtrage des abonnements par attributs", "**Kinesis Data Streams** : shards, ordre par clé de partition, rejeu", "**Step Functions** : machines à états, retries, erreurs, Standard (longue durée) vs Express (haut débit)"] }
          ],
          keypoints: ["HTTP API = moins cher ; REST API = plus de fonctionnalités", "504 = timeout 29 s ; 502 = réponse mal formée", "Clé d'API ≠ authentification", "Long polling réduit les coûts SQS"]
        }
      ]
    },
    {
      title: 'Sécurité applicative',
      lessons: [
        {
          title: 'Cognito, STS et chiffrement côté développeur',
          sections: [
            { h: 'Cognito', bullets: ["**User Pool** : annuaire d'utilisateurs, inscription/connexion, MFA, fédération (Google, SAML) → émet des **JWT**", "**Identity Pool** : échange un jeton contre des **identifiants AWS temporaires** (accès direct à S3, DynamoDB)", "Moyen mnémotechnique : User Pool = authentification ; Identity Pool = autorisation AWS"] },
            { h: 'STS', bullets: ["`AssumeRole` : identifiants temporaires (accès inter-comptes, élévation ponctuelle)", "`AssumeRoleWithWebIdentity` : fédération OIDC (GitHub Actions, GitLab CI, EKS)", "`GetSessionToken` : sessions avec MFA", "`decode-authorization-message` : comprendre un refus d'accès encodé"] },
            { h: 'Chiffrement', bullets: ["KMS `Encrypt` limité à **4 Ko** → au-delà, `GenerateDataKey` et **chiffrement d'enveloppe**", "Quotas KMS : le chiffrement côté client massif peut générer du throttling ; utiliser le cache de clés de données", "Chiffrement en transit : TLS partout ; ACM pour les certificats"] }
          ],
          keypoints: ["User Pool = qui êtes-vous (JWT) ; Identity Pool = identifiants AWS", "KMS Encrypt ≤ 4 Ko → GenerateDataKey", "AssumeRoleWithWebIdentity pour l'OIDC des CI"]
        }
      ]
    },
    {
      title: 'Déploiement et dépannage',
      lessons: [
        {
          title: 'SAM, CloudFormation et CI/CD AWS',
          sections: [
            { h: 'Infrastructure as code', bullets: ["**CloudFormation** : templates YAML/JSON, stacks, **change sets**, rollback automatique, `Outputs` et `!ImportValue`", "Fonctions : `!Ref`, `!GetAtt`, `!Sub`, `!FindInMap`", "**SAM** : extension serverless (`Transform: AWS::Serverless-2016-10-31`), `sam build`, `sam local invoke`, `sam deploy --guided`", "**CDK** : IaC en TypeScript, Python, Java, synthétisée en CloudFormation"], code: { lang: 'yaml', src: 'AWSTemplateFormatVersion: "2010-09-09"\nTransform: AWS::Serverless-2016-10-31\nResources:\n  CommandesFn:\n    Type: AWS::Serverless::Function\n    Properties:\n      Handler: app.handler\n      Runtime: python3.12\n      AutoPublishAlias: live\n      DeploymentPreference:\n        Type: Canary10Percent5Minutes\n      Environment:\n        Variables: { TABLE: !Ref Commandes }\n      Policies:\n        - DynamoDBCrudPolicy: { TableName: !Ref Commandes }\n      Events:\n        Api:\n          Type: HttpApi\n          Properties: { Path: /commandes, Method: post }\n  Commandes:\n    Type: AWS::Serverless::SimpleTable' } },
            { h: 'La chaîne Code*', bullets: ["**CodeBuild** : build et tests, fichier `buildspec.yml` (phases install, pre_build, build, post_build ; artifacts ; cache)", "**CodeDeploy** : EC2/on-prem (fichier `appspec.yml` + hooks), Lambda et ECS (bascule de trafic)", "**CodePipeline** : orchestration source → build → test → déploiement, approbations manuelles", "**CodeArtifact** : dépôt de paquets (Maven, npm, PyPI)"] },
            { h: 'Stratégies de déploiement', bullets: ["**All at once** : rapide, interruption", "**Rolling** / rolling with additional batch", "**Blue/Green** : nouvel environnement, bascule instantanée, rollback facile", "**Canary** (10 % puis 100 %) et **Linear** (10 % toutes les N minutes) pour Lambda/ECS", "Elastic Beanstalk : all at once, rolling, rolling with batch, immutable, traffic splitting"] }
          ],
          keypoints: ["SAM = CloudFormation simplifié pour le serverless", "buildspec.yml (CodeBuild) ; appspec.yml (CodeDeploy)", "Canary / Linear / All-at-once pour Lambda", "Blue/Green = rollback instantané"]
        },
        {
          title: 'Observabilité et dépannage',
          sections: [
            { h: 'CloudWatch pour développeurs', bullets: ["Logs Lambda automatiques dans `/aws/lambda/<fonction>`", "**Embedded Metric Format** : publier des métriques via des logs JSON", "Métriques personnalisées `PutMetricData` (résolution standard 60 s ou haute 1 s)", "**Logs Insights** pour requêter les logs", "Alarmes → SNS, Auto Scaling, actions EC2"] },
            { h: 'AWS X-Ray', bullets: ["Traces distribuées : **segments**, **sous-segments**, **service map**", "**Annotations** (indexées, filtrables) vs **metadata** (non indexées)", "Activer le **tracing actif** sur Lambda / API Gateway ; démon X-Ray ou ADOT collector sur EC2/ECS", "Échantillonnage pour maîtriser les coûts", "AWS Distro for OpenTelemetry (ADOT) : alternative standard"] },
            { h: 'Pannes typiques', bullets: ["`AccessDenied` → politique du rôle d'exécution, politique de ressource, clé KMS", "Timeout Lambda dans un VPC → pas de route vers Internet/endpoint", "`ProvisionedThroughputExceededException` → partition chaude, backoff, on-demand", "Messages SQS traités deux fois → visibility timeout < durée du traitement ; rendre le traitement **idempotent**"] }
          ],
          keypoints: ["X-Ray : annotations indexées, metadata non", "EMF pour des métriques via logs", "Idempotence contre les doubles traitements"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'API serverless avec SAM : API Gateway + Lambda + DynamoDB',
      goal: "Déployer une API de commandes serverless avec déploiement canary et traçage X-Ray.",
      minutes: 75, env: 'AWS CLI + SAM CLI + Python 3.12',
      steps: [
        { t: "Initialisez un projet SAM.", cmd: "sam init --runtime python3.12 --name api-commandes --app-template hello-world\ncd api-commandes" },
        { t: "Remplacez le template par une fonction `CommandesFn` (HttpApi POST /commandes), une `SimpleTable` et la politique `DynamoDBCrudPolicy` (voir la leçon SAM)." },
        { t: "Écrivez le handler qui insère la commande dans la table avec l'id reçu." },
        { t: "Testez localement.", cmd: "sam build\nsam local invoke CommandesFn -e events/event.json" },
        { t: "Déployez.", cmd: "sam deploy --guided", check: "Un endpoint HTTP API est affiché dans les Outputs." },
        { t: "Appelez l'API et vérifiez l'élément dans DynamoDB.", cmd: "curl -X POST $URL/commandes -d '{\"id\":\"c-1\",\"montant\":42}'\naws dynamodb scan --table-name NOM_TABLE" },
        { t: "Ajoutez `Tracing: Active` dans Globals, redéployez, et observez la service map dans X-Ray." },
        { t: "Ajoutez `AutoPublishAlias: live` + `DeploymentPreference: Canary10Percent5Minutes`, modifiez le code et suivez le déploiement dans CodeDeploy." }
      ],
      cleanup: "sam delete"
    }
  ],
  quiz: [
    { q: "Une fonction Lambda invoquée de façon asynchrone échoue. Que fait Lambda par défaut ?", options: ["Elle réessaie 2 fois puis envoie l'événement à la DLQ/destination si configurée", "Elle réessaie indéfiniment", "Elle ne réessaie jamais", "Elle renvoie une erreur 500 à S3"], answer: 0, explain: "Invocation asynchrone : 2 nouvelles tentatives, puis destination on-failure ou DLQ." },
    { q: "Comment réduire les cold starts d'une fonction Lambda Java sans coût permanent élevé ?", options: ["Activer SnapStart", "Augmenter le timeout", "Réduire la mémoire", "Utiliser une DLQ"], answer: 0, explain: "SnapStart restaure un instantané de l'environnement initialisé. Provisioned Concurrency est l'autre option (payante en continu)." },
    { q: "Combien de RCU faut-il pour 10 lectures fortement cohérentes par seconde d'éléments de 6 Ko ?", options: ["20", "10", "15", "60"], answer: 0, explain: "6 Ko → 2 blocs de 4 Ko = 2 RCU par lecture × 10 = 20 RCU." },
    { q: "Quel index DynamoDB peut être ajouté à une table existante ?", options: ["Global Secondary Index (GSI)", "Local Secondary Index (LSI)", "Les deux", "Aucun"], answer: 0, explain: "Les LSI ne peuvent être créés qu'à la création de la table." },
    { q: "API Gateway renvoie une erreur 504. Quelle est la cause la plus probable ?", options: ["Le backend a dépassé le délai d'intégration (29 s par défaut)", "L'utilisateur n'est pas authentifié", "Le throttling est atteint", "La réponse Lambda est mal formée"], answer: 0, explain: "504 Gateway Timeout. Une réponse mal formée donne 502, le throttling 429." },
    { q: "Quel composant Cognito fournit des identifiants AWS temporaires pour accéder directement à S3 ?", options: ["Identity Pool", "User Pool", "Hosted UI", "App client"], answer: 0, explain: "Le User Pool authentifie (JWT) ; l'Identity Pool échange ce jeton contre des identifiants STS." },
    { q: "Un fichier de 10 Ko doit être chiffré avec KMS. Quelle approche ?", options: ["GenerateDataKey puis chiffrement d'enveloppe localement", "KMS Encrypt directement", "Stocker la clé KMS dans le code", "Utiliser SSE-C"], answer: 0, explain: "L'API Encrypt est limitée à 4 Ko de données." },
    { q: "Quel fichier décrit les phases de build dans CodeBuild ?", options: ["buildspec.yml", "appspec.yml", "template.yaml", "Dockerfile"], answer: 0, explain: "appspec.yml sert à CodeDeploy." },
    { q: "Dans X-Ray, quelle donnée permet de filtrer les traces par un attribut métier (ex. client_id) ?", options: ["Une annotation", "Une metadata", "Un segment", "Un sampling rule"], answer: 0, explain: "Les annotations sont indexées ; les metadata ne le sont pas." },
    { q: "Des messages SQS sont traités deux fois. Quelle est la correction principale ?", options: ["Augmenter le visibility timeout au-delà du temps de traitement et rendre le traitement idempotent", "Passer en long polling", "Réduire la taille des messages", "Activer le chiffrement SSE"], answer: 0, explain: "Si le traitement dépasse le visibility timeout, le message redevient visible et est repris." },
    { q: "Quelle stratégie de déploiement Lambda envoie 10 % du trafic à la nouvelle version, puis 100 % après 5 minutes ?", options: ["Canary10Percent5Minutes", "Linear10PercentEvery1Minute", "AllAtOnce", "Blue/Green immuable"], answer: 0, explain: "Canary = deux étapes ; Linear = augmentation par paliers réguliers." },
    { q: "Dans quel ordre le SDK AWS cherche-t-il les identifiants ?", options: ["Code, variables d'environnement, fichiers de profil, rôle du conteneur, rôle d'instance", "Rôle d'instance en premier", "Fichiers de profil puis variables d'environnement uniquement", "Uniquement les variables d'environnement"], answer: 0, explain: "La chaîne par défaut s'arrête au premier fournisseur trouvé." }
  ],
  flashcards: [
    ["Chaîne d'identifiants du SDK", "Code → variables d'env → ~/.aws (profils/SSO) → rôle conteneur ECS → rôle instance EC2"],
    ["Throttling : réaction", "Retries avec backoff exponentiel + jitter"],
    ["Lambda : limites clés", "15 min, 10 Go RAM, /tmp 10 Go, payload sync 6 Mo, 5 layers"],
    ["Lambda asynchrone : échecs", "2 retries, puis DLQ ou destination on-failure"],
    ["Réduire un cold start", "Init hors handler, moins de dépendances, SnapStart (Java), Provisioned Concurrency"],
    ["Reserved concurrency", "Réserve ET plafonne la concurrence d'une fonction"],
    ["1 RCU / 1 WCU", "RCU : 1 lecture fortement cohérente/s de 4 Ko (2 à terme) · WCU : 1 écriture/s de 1 Ko"],
    ["GSI vs LSI", "GSI : autre PK+SK, ajout à tout moment, cohérence à terme · LSI : même PK, autre SK, à la création"],
    ["Query vs Scan", "Query : une partition, efficace · Scan : toute la table, coûteux"],
    ["Verrouillage optimiste DynamoDB", "Écriture conditionnelle sur un attribut version"],
    ["API Gateway 502 / 504 / 429", "502 : réponse backend invalide · 504 : timeout (29 s) · 429 : throttling"],
    ["REST API vs HTTP API", "REST : cache, clés d'API, plans d'usage, transformations · HTTP : moins cher, plus rapide, JWT natif"],
    ["Cognito User Pool vs Identity Pool", "User Pool : authentification, JWT · Identity Pool : identifiants AWS temporaires"],
    ["KMS Encrypt : limite", "4 Ko → au-delà GenerateDataKey + chiffrement d'enveloppe"],
    ["buildspec.yml vs appspec.yml", "buildspec : CodeBuild · appspec : CodeDeploy (hooks de déploiement)"],
    ["Déploiements Lambda via CodeDeploy", "Canary, Linear, AllAtOnce (avec alias et versions)"],
    ["X-Ray : annotations vs metadata", "Annotations indexées et filtrables · metadata non indexées"],
    ["SQS : long polling", "WaitTimeSeconds jusqu'à 20 s — moins d'appels vides, moins cher"],
    ["Message SQS trop volumineux", "Pattern claim-check : stocker dans S3, envoyer la référence (Extended Client Library)"],
    ["SAM : tester localement", "sam build puis sam local invoke / sam local start-api"]
  ]
});
