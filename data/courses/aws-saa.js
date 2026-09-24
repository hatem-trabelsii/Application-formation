ACADEMY.courses.push({
  id: 'aws-saa', phase: 2, kind: 'cert', order: 1,
  title: 'AWS Solutions Architect Associate', icon: '🏗️',
  vendor: 'AWS', level: 'Associate', code: 'SAA-C03',
  hours: '~80-100h', cost: '~150€', priority: 5,
  subtitle: "Concevoir des architectures AWS sécurisées, résilientes, performantes et optimisées en coûts.",
  description: "La certification pivot de votre parcours d'architecte. On raisonne en compromis : quel service, quelle topologie réseau, quelle stratégie de reprise, quel modèle de coût. Chaque leçon se termine par les réflexes « mot-clé de la question → service attendu » qui font gagner des points à l'examen.",
  searchTerm: 'AWS Solutions Architect Associate SAA-C03', searchTermEn: 'AWS Solutions Architect Associate SAA-C03',
  exam: {
    duration: '130 min', questions: '65 QCM/QCM multiples', passing: '720/1000',
    domains: [['Concevoir des architectures sécurisées', '30%'], ['Concevoir des architectures résilientes', '26%'], ['Concevoir des architectures performantes', '24%'], ['Concevoir des architectures optimisées en coûts', '20%']],
    notes: "Questions longues à scénario : repérez la contrainte principale (coût, latence, opérationnel minimal, haute disponibilité) avant de lire les réponses."
  },
  outcomes: [
    "Concevoir un VPC multi-AZ avec sous-réseaux publics/privés, NAT, endpoints",
    "Sécuriser avec IAM (rôles, politiques, SCP), KMS et chiffrement au repos / en transit",
    "Rendre une application hautement disponible : ELB, Auto Scaling, multi-AZ",
    "Choisir la bonne stratégie de reprise : backup/restore, pilot light, warm standby, multi-site",
    "Sélectionner stockage et bases de données selon les patterns d'accès",
    "Découpler avec SQS, SNS, EventBridge, Kinesis",
    "Optimiser la performance avec cache (CloudFront, ElastiCache, DAX)",
    "Réduire les coûts : modèles d'achat, classes S3, rightsizing"
  ],
  prerequisites: ["AWS Cloud Practitioner (ou connaissances équivalentes)", "Notions réseau : CIDR, routage, DNS"],
  resources: [
    { label: 'Page officielle SAA-C03', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/' },
    { label: 'AWS Architecture Center', url: 'https://aws.amazon.com/architecture/' },
    { label: 'Livre blanc : Disaster Recovery of Workloads on AWS', url: 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-workloads-on-aws.html' },
    { label: 'AWS Skill Builder — examen blanc officiel', url: 'https://skillbuilder.aws/' }
  ],
  modules: [
    {
      title: 'Architectures sécurisées',
      lessons: [
        {
          title: 'IAM avancé et gouvernance multi-comptes',
          sections: [
            { h: "L'évaluation d'une requête IAM", p: "Par défaut tout est **refusé**. Un Allow explicite autorise ; un **Deny explicite l'emporte toujours**. Plusieurs couches s'additionnent : SCP d'Organizations, permission boundaries, politiques d'identité, politiques de ressource, politiques de session.", bullets: ["Politique **d'identité** : attachée à un utilisateur, groupe ou rôle", "Politique **de ressource** : attachée à la ressource (bucket S3, file SQS, clé KMS) avec un `Principal`", "Accès **inter-comptes** : politique de ressource OU rôle assumé via `sts:AssumeRole`"] },
            { h: 'Rôles partout', bullets: ["**Rôle d'instance EC2** (instance profile) plutôt que des clés d'accès sur la machine", "Rôle d'exécution **Lambda**, rôle de tâche **ECS**, IRSA / Pod Identity pour **EKS**", "Fédération : IAM Identity Center (SSO), SAML 2.0, OIDC (Cognito pour les utilisateurs finaux)"] },
            { h: 'AWS Organizations et Control Tower', bullets: ["**OU** (unités organisationnelles) : Production, Dev, Sécurité, Sandbox", "**SCP** : garde-fous qui LIMITENT les permissions maximales (ne donnent jamais de droits)", "**Control Tower** : landing zone multi-comptes prête à l'emploi, avec contrôles préventifs et détectifs", "Compte de **log archive** et compte **audit** séparés"], code: { lang: 'json', src: '{\n  "Sid": "InterdireHorsEurope",\n  "Effect": "Deny",\n  "Action": "*",\n  "Resource": "*",\n  "Condition": {\n    "StringNotEquals": { "aws:RequestedRegion": ["eu-west-1", "eu-west-3", "eu-central-1"] }\n  }\n}' } }
          ],
          keypoints: ["Deny explicite > Allow > Deny implicite", "SCP = plafond de permissions, ne donne rien", "Rôles, jamais de clés d'accès dans le code ou sur EC2", "Inter-comptes : AssumeRole ou politique de ressource"]
        },
        {
          title: 'Réseau VPC en profondeur',
          sections: [
            { h: 'Anatomie d\'un VPC de production', bullets: ["CIDR du VPC (ex. `10.0.0.0/16`), un sous-réseau public et un privé **par AZ**", "Sous-réseau public = table de routage vers l'**Internet Gateway**", "Sous-réseau privé = route `0.0.0.0/0` vers une **NAT Gateway** (une par AZ pour la haute disponibilité)", "5 adresses IP réservées par sous-réseau", "Bastion remplacé par **SSM Session Manager**"] },
            { h: 'Accéder aux services AWS en privé', bullets: ["**Gateway endpoint** : S3 et DynamoDB, gratuit, via la table de routage", "**Interface endpoint** (PrivateLink) : ENI privée pour la plupart des services, payant", "Évite de payer la NAT Gateway pour le trafic vers S3"] },
            { h: 'Relier des réseaux', bullets: ["**VPC Peering** : 1-à-1, non transitif, CIDR sans chevauchement", "**Transit Gateway** : hub central, transitif, des milliers de VPC et VPN", "**PrivateLink** : exposer UN service à d'autres VPC sans ouvrir tout le réseau", "**Site-to-Site VPN** (rapide à mettre en place) vs **Direct Connect** (débit et latence stables) ; VPN au-dessus de DX pour chiffrer"] },
            { h: 'Filtrer et observer', bullets: ["Security Groups (stateful, peuvent référencer d'autres SG) et NACL (stateless, Deny possible)", "**VPC Flow Logs** vers CloudWatch Logs ou S3", "**AWS Network Firewall** pour l'inspection centralisée", "**WAF** sur ALB, CloudFront, API Gateway ; **Shield Advanced** contre les DDoS"] }
          ],
          keypoints: ["NAT Gateway par AZ pour la HA", "Gateway endpoint S3/DynamoDB = gratuit", "Peering non transitif → Transit Gateway au-delà de quelques VPC", "PrivateLink = exposer un service, pas un réseau"]
        },
        {
          title: 'Protection des données : KMS, chiffrement, secrets',
          sections: [
            { h: 'KMS', bullets: ["Clés **gérées par AWS** (aws/s3), **gérées par le client** (CMK, rotation, politique de clé) ou importées", "**Chiffrement d'enveloppe** : KMS chiffre une clé de données, qui chiffre les données", "La **politique de clé** contrôle qui peut utiliser la clé (même un admin IAM a besoin d'être autorisé)", "Clés multi-régions pour la reprise après sinistre", "**CloudHSM** : HSM dédié mono-locataire (FIPS 140-2 niveau 3, contrôle total des clés)"] },
            { h: 'Chiffrer S3', bullets: ["SSE-S3 (par défaut), **SSE-KMS** (audit CloudTrail, contrôle d'accès à la clé), DSSE-KMS, SSE-C (clé fournie par le client)", "Forcer HTTPS : condition `aws:SecureTransport = false` → Deny", "**S3 Object Lock** / Glacier Vault Lock : WORM pour la conformité", "Accès temporaire : **URL présignée**"] },
            { h: 'Secrets et certificats', bullets: ["**Secrets Manager** : rotation automatique (RDS natif), payant", "**SSM Parameter Store** : configuration et secrets simples (SecureString), gratuit en standard", "**ACM** : certificats TLS gratuits pour ALB, CloudFront, API Gateway (pas directement sur EC2)"] }
          ],
          keypoints: ["SSE-KMS = auditabilité + contrôle d'accès à la clé", "Rotation automatique = Secrets Manager", "ACM : certificats gratuits pour services managés", "Object Lock = WORM"]
        }
      ]
    },
    {
      title: 'Architectures résilientes',
      lessons: [
        {
          title: 'Haute disponibilité : ELB, Auto Scaling, multi-AZ',
          sections: [
            { h: 'Les load balancers', bullets: ["**ALB** (couche 7) : HTTP/HTTPS, routage par chemin/hôte/en-tête, cibles EC2, IP, Lambda, conteneurs", "**NLB** (couche 4) : TCP/UDP/TLS, millions de requêtes/s, **IP statique** / Elastic IP", "**GWLB** : insérer des appliances de sécurité tierces", "Health checks, stickiness, cross-zone load balancing"] },
            { h: 'Auto Scaling', bullets: ["Groupe avec min / désiré / max, réparti sur plusieurs AZ", "**Target tracking** (ex. CPU à 50 %), step scaling, scheduled, **predictive**", "Launch template : AMI, type, user data", "Remplace automatiquement les instances en mauvaise santé (health check ELB)"] },
            { h: 'Découpler pour résister', p: "Un système couplé tombe en bloc. Une **file SQS** entre le front et les workers absorbe les pics : les workers s'adaptent au nombre de messages en attente (métrique `ApproximateNumberOfMessagesVisible`).", bullets: ["SQS Standard (au moins une fois, ordre non garanti) vs **FIFO** (ordre, exactement une fois, débit limité)", "**Dead-letter queue** pour les messages en échec", "**SNS + SQS fan-out** : un événement → plusieurs consommateurs", "**EventBridge** : routage par règles, intégrations SaaS"] }
          ],
          keypoints: ["ALB = HTTP ; NLB = TCP/UDP + IP statique", "ASG multi-AZ + health check ELB", "SQS absorbe les pics ; FIFO si ordre requis", "Fan-out = SNS → plusieurs SQS"]
        },
        {
          title: 'Reprise après sinistre (DR) : RPO, RTO et stratégies',
          sections: [
            { h: 'RPO et RTO', bullets: ["**RPO** (Recovery Point Objective) : combien de données peut-on perdre ? (fréquence des sauvegardes/réplications)", "**RTO** (Recovery Time Objective) : combien de temps d'interruption acceptable ?", "Plus RPO et RTO sont faibles, plus c'est cher"] },
            { h: 'Les 4 stratégies', bullets: ["**Backup & Restore** : sauvegardes vers une autre région ; RPO/RTO en heures ; le moins cher", "**Pilot Light** : données répliquées, cœur minimal éteint ou réduit ; RTO en dizaines de minutes", "**Warm Standby** : copie réduite mais fonctionnelle, qu'on agrandit ; RTO en minutes", "**Multi-site actif/actif** : pleine capacité dans 2 régions ; RTO proche de zéro ; le plus cher"] },
            { h: 'Les briques', bullets: ["**AWS Backup** : politiques centralisées, copies inter-régions et inter-comptes", "RDS : Multi-AZ (HA, synchrone) ≠ Read Replica (lecture, asynchrone, promouvable)", "**Aurora Global Database** : réplication inter-régions < 1 s", "**DynamoDB Global Tables** : multi-région actif/actif", "S3 Cross-Region Replication, **Route 53 failover** avec health checks", "**Elastic Disaster Recovery** : réplication continue de serveurs"] }
          ],
          keypoints: ["RPO = perte de données ; RTO = durée d'arrêt", "Backup/Restore < Pilot Light < Warm Standby < Multi-site (coût et rapidité)", "RDS Multi-AZ = HA, pas scalabilité en lecture"]
        }
      ]
    },
    {
      title: 'Architectures performantes',
      lessons: [
        {
          title: 'Choisir stockage et bases de données',
          sections: [
            { h: 'Stockage bloc EBS', bullets: ["**gp3** : usage général, IOPS et débit réglables indépendamment (défaut recommandé)", "**io2 Block Express** : IOPS provisionnées très élevées, bases critiques, Multi-Attach", "**st1** (débit, big data) / **sc1** (froid) : HDD, non bootables", "Snapshots incrémentaux dans S3, copiables entre régions"] },
            { h: 'Fichiers et objets', bullets: ["**EFS** : NFS Linux multi-AZ, classes Standard/IA, mode élastique", "**FSx for Windows** (SMB, AD), **FSx for Lustre** (HPC, lié à S3), **FSx for NetApp ONTAP**", "**S3** : performance par préfixe (3 500 écritures / 5 500 lectures par seconde et par préfixe), multipart upload, **Transfer Acceleration**"] },
            { h: 'Bases de données : le bon outil', bullets: ["Relationnel transactionnel → **RDS / Aurora** (Aurora Serverless v2 pour charge variable)", "Clé-valeur à grande échelle, latence ms → **DynamoDB** (+ **DAX** pour la microseconde)", "Cache, sessions, classements → **ElastiCache Redis/Valkey**", "Analytique → **Redshift** ; requêtes SQL ad hoc sur S3 → **Athena**", "Graphe → Neptune ; séries temporelles → Timestream ; registre immuable → QLDB (en fin de vie : préférer Aurora + audit)"] }
          ],
          keypoints: ["gp3 par défaut, io2 pour IOPS extrêmes", "EFS = Linux partagé ; FSx Windows = SMB", "DynamoDB + DAX ; RDS + ElastiCache", "Athena = SQL serverless sur S3"]
        },
        {
          title: 'Mise en cache, diffusion et calcul',
          sections: [
            { h: 'Mettre en cache à chaque couche', bullets: ["**CloudFront** : cache aux edge locations, **OAC** pour protéger l'origine S3, signed URLs/cookies", "**API Gateway** : cache de réponses", "**ElastiCache** : cache applicatif (lazy loading, write-through, TTL)", "**DAX** : cache devant DynamoDB sans changer le code d'accès", "Réplicas en lecture RDS pour décharger les lectures"] },
            { h: 'Global Accelerator vs CloudFront', p: "**CloudFront** met en cache du contenu HTTP(S). **Global Accelerator** fournit 2 IP anycast statiques et achemine le trafic TCP/UDP par le réseau AWS vers le point de terminaison sain le plus proche, sans cache." },
            { h: 'Choisir le calcul', bullets: ["Charge stable, contrôle de l'OS → EC2 (+ Savings Plans)", "Événementiel, courte durée (≤ 15 min) → Lambda", "Conteneurs sans gestion de serveur → ECS/EKS sur **Fargate**", "Batch massif → AWS Batch sur Spot", "Calcul HPC → placement group **cluster** + EFA", "Placement groups : **cluster** (latence), **spread** (isolation, 7 instances/AZ), **partition** (Hadoop, Kafka)"] }
          ],
          keypoints: ["CloudFront + OAC pour S3 privé", "Global Accelerator = IP statiques anycast, TCP/UDP, pas de cache", "Placement groups : cluster / spread / partition"]
        }
      ]
    },
    {
      title: 'Architectures optimisées en coûts',
      lessons: [
        {
          title: 'Optimiser les coûts sans sacrifier la fiabilité',
          sections: [
            { h: 'Calcul', bullets: ["**Compute Savings Plans** : EC2 + Fargate + Lambda, flexible (famille, région, OS)", "**EC2 Instance Savings Plans / RI** : remise maximale, moins flexibles", "**Spot** pour tout ce qui est interruptible (Spot Fleet, mixed instances ASG)", "**Graviton** (ARM) : jusqu'à ~40 % de meilleur rapport prix/performance", "**Compute Optimizer** pour le rightsizing ; arrêter la nuit les environnements hors production"] },
            { h: 'Stockage', bullets: ["**S3 Lifecycle** : Standard → IA → Glacier → Deep Archive", "**Intelligent-Tiering** quand le pattern d'accès est inconnu", "EBS gp2 → gp3 (-20 %), supprimer volumes et snapshots orphelins", "Réduire le transfert de données : endpoints VPC, CloudFront, rester dans la même AZ quand c'est possible"] },
            { h: 'Réseau et architecture', bullets: ["Une NAT Gateway coûte à l'heure + au Go : gateway endpoints pour S3/DynamoDB", "Serverless pour les charges intermittentes (pas de coût au repos)", "DynamoDB **on-demand** (imprévisible) vs **provisionné + auto scaling** (prévisible)", "Tags de coûts, **Budgets**, **Cost Anomaly Detection**"] },
            { h: 'Réflexes « mot-clé → réponse »', bullets: ["« Le moins d'effort opérationnel » → service managé / serverless", "« Le moins cher pour des données rarement lues, restauration en 12 h » → Glacier Deep Archive", "« Traitement interruptible » → Spot", "« Découpler » → SQS ; « temps réel, streaming » → Kinesis", "« IP fixe pour liste blanche » → NLB ou Global Accelerator"] }
          ],
          keypoints: ["Compute Savings Plans = le plus flexible", "Lifecycle S3 + Intelligent-Tiering", "Gateway endpoints pour éviter les frais NAT", "Graviton = meilleur prix/performance"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Application web hautement disponible (VPC + ALB + ASG + RDS)',
      goal: "Déployer une architecture 3-tiers multi-AZ et vérifier qu'elle survit à la perte d'une instance.",
      minutes: 120, env: 'Console AWS (attention aux coûts : NAT Gateway et RDS sont payants)',
      warning: "Ce lab génère quelques euros de frais si vous le laissez tourner. Faites-le d'une traite et nettoyez tout à la fin.",
      steps: [
        { t: "Avec l'assistant **VPC and more**, créez un VPC `10.0.0.0/16` sur 2 AZ avec 2 sous-réseaux publics, 2 privés et **1 NAT Gateway**." },
        { t: "Créez 3 Security Groups : `sg-alb` (80 depuis 0.0.0.0/0), `sg-app` (80 depuis sg-alb uniquement), `sg-db` (5432 depuis sg-app uniquement).", hint: "Référencer un SG comme source est plus robuste qu'une plage IP." },
        { t: "Créez un **launch template** Amazon Linux 2023 (t3.micro, sg-app, rôle SSM) avec ce user data :", cmd: "#!/bin/bash\ndnf install -y nginx\necho \"<h1>Servi par $(hostname -f)</h1>\" > /usr/share/nginx/html/index.html\nsystemctl enable --now nginx" },
        { t: "Créez un **Auto Scaling Group** (min 2, max 4) dans les sous-réseaux privés, attaché à un nouvel **ALB** public avec target group HTTP et health check `/`." },
        { t: "Ajoutez une politique **target tracking** CPU à 50 %." },
        { t: "Créez une base **RDS PostgreSQL** Multi-AZ (db.t4g.micro) dans les sous-réseaux privés avec `sg-db`." },
        { t: "Ouvrez le DNS de l'ALB plusieurs fois : le nom d'hôte alterne entre les instances.", check: "Deux noms d'hôte différents apparaissent." },
        { t: "Terminez manuellement une instance : observez l'ASG en relancer une nouvelle et l'ALB continuer à servir.", check: "Le site reste disponible pendant le remplacement." },
        { t: "Bonus : lancez un **failover** RDS (Reboot with failover) et mesurez la coupure." }
      ],
      cleanup: "Supprimez dans l'ordre : ASG, ALB, target group, RDS (sans snapshot final), NAT Gateway, Elastic IP, VPC."
    },
    {
      title: 'Découplage SNS → SQS fan-out avec DLQ',
      goal: "Publier un événement unique consommé par deux files, avec gestion des messages en échec.",
      minutes: 30, env: 'AWS CLI',
      steps: [
        { t: "Créez un topic SNS `commandes` et deux files SQS `facturation` et `logistique`, plus une DLQ `commandes-dlq`.", cmd: "aws sns create-topic --name commandes\nfor q in facturation logistique commandes-dlq; do aws sqs create-queue --queue-name $q; done" },
        { t: "Configurez une **redrive policy** sur `facturation` (maxReceiveCount = 3 vers la DLQ)." },
        { t: "Abonnez les deux files au topic et ajoutez la politique d'accès SQS autorisant SNS à y écrire.", hint: "Dans la console, « Subscribe to Amazon SNS topic » depuis la file crée la politique automatiquement." },
        { t: "Publiez un message et lisez-le dans chaque file.", cmd: "aws sns publish --topic-arn ARN_TOPIC --message '{\"id\":42}'\naws sqs receive-message --queue-url URL_FACTURATION", check: "Le même message est présent dans les deux files." },
        { t: "Recevez 3 fois le message de `facturation` sans le supprimer : il part en DLQ." }
      ],
      cleanup: "Supprimez le topic et les trois files."
    }
  ],
  quiz: [
    { q: "Une application sur EC2 doit lire un bucket S3. Quelle est la méthode la plus sécurisée ?", options: ["Attacher un rôle IAM à l'instance (instance profile)", "Stocker des clés d'accès dans le code", "Rendre le bucket public", "Stocker les clés dans les user data"], answer: 0, explain: "Le rôle fournit des identifiants temporaires renouvelés automatiquement." },
    { q: "Des instances dans des sous-réseaux privés doivent télécharger des correctifs sur Internet sans être joignables depuis Internet. Que faut-il ?", options: ["Une NAT Gateway dans un sous-réseau public", "Une Internet Gateway attachée aux sous-réseaux privés", "Un VPC endpoint de type gateway", "Des Elastic IP sur chaque instance"], answer: 0, explain: "La NAT permet le trafic sortant initié par les instances, pas l'entrant." },
    { q: "Comment réduire les frais de NAT Gateway pour un trafic massif vers S3 depuis des sous-réseaux privés ?", options: ["Créer un VPC gateway endpoint pour S3", "Utiliser Direct Connect", "Passer à une NAT instance", "Activer S3 Transfer Acceleration"], answer: 0, explain: "Le gateway endpoint S3 est gratuit et garde le trafic dans le réseau AWS." },
    { q: "Il faut connecter 40 VPC entre eux et à un datacenter, avec un routage transitif. Quelle solution ?", options: ["AWS Transit Gateway", "VPC Peering en maillage complet", "PrivateLink", "Internet Gateway"], answer: 0, explain: "Le peering est non transitif et devient ingérable à grande échelle." },
    { q: "Une application exige un RTO de quelques minutes à coût modéré, avec une copie réduite mais fonctionnelle dans une autre région. Quelle stratégie DR ?", options: ["Warm Standby", "Backup & Restore", "Pilot Light", "Multi-site actif/actif"], answer: 0, explain: "Warm standby : environnement réduit qui tourne déjà, qu'on met à l'échelle." },
    { q: "Quelle affirmation sur RDS Multi-AZ est correcte ?", options: ["Il fournit une réplique synchrone en standby pour la haute disponibilité", "La réplique sert les lectures", "La réplication est asynchrone", "Il réplique vers une autre région"], answer: 0, explain: "Pour scaler les lectures : Read Replicas (asynchrones). Pour la HA : Multi-AZ." },
    { q: "Un client exige une IP statique pour mettre votre application en liste blanche, trafic TCP. Quel service ?", options: ["Network Load Balancer avec Elastic IP", "Application Load Balancer", "CloudFront", "API Gateway"], answer: 0, explain: "Le NLB supporte une IP fixe par AZ. Global Accelerator est aussi une option." },
    { q: "Les commandes doivent être traitées dans l'ordre exact et sans doublon. Quel service ?", options: ["SQS FIFO", "SQS Standard", "SNS Standard", "Kinesis Firehose"], answer: 0, explain: "FIFO garantit l'ordre (par groupe de messages) et la déduplication." },
    { q: "Quel type de volume EBS est recommandé par défaut pour la plupart des charges ?", options: ["gp3", "io2", "st1", "sc1"], answer: 0, explain: "gp3 : bon rapport prix/performance, IOPS et débit ajustables séparément." },
    { q: "Une table DynamoDB subit une forte charge en lecture et nécessite une latence de l'ordre de la microseconde. Que faire ?", options: ["Ajouter DynamoDB Accelerator (DAX)", "Ajouter ElastiCache Memcached", "Passer en mode on-demand", "Créer une Read Replica"], answer: 0, explain: "DAX est un cache en mémoire compatible avec l'API DynamoDB." },
    { q: "Comment servir un bucket S3 privé via CloudFront sans le rendre public ?", options: ["Origin Access Control (OAC) + bucket policy autorisant CloudFront", "Activer l'hébergement statique public", "URL présignées sur chaque objet", "Un NLB devant S3"], answer: 0, explain: "OAC (successeur d'OAI) signe les requêtes de CloudFront vers S3." },
    { q: "Des données d'audit doivent être conservées 7 ans, rarement consultées, restauration acceptable en 48 h, coût minimal. Quelle classe S3 ?", options: ["S3 Glacier Deep Archive", "S3 Standard-IA", "S3 Intelligent-Tiering", "S3 One Zone-IA"], answer: 0, explain: "Deep Archive : le stockage le moins cher, restauration en 12 à 48 h." },
    { q: "Que fait une SCP (Service Control Policy) ?", options: ["Elle limite les permissions maximales des comptes d'une OU", "Elle accorde des permissions aux utilisateurs", "Elle chiffre les données", "Elle remplace les rôles IAM"], answer: 0, explain: "Une SCP ne donne jamais de droits : elle définit un plafond." },
    { q: "Quel plan d'économies couvre EC2, Fargate et Lambda avec le plus de flexibilité ?", options: ["Compute Savings Plans", "EC2 Instance Savings Plans", "Standard Reserved Instances", "Spot Instances"], answer: 0, explain: "Compute Savings Plans s'appliquent quelle que soit la famille, la région ou l'OS." },
    { q: "Un traitement de 30 minutes est déclenché par l'arrivée d'un fichier dans S3. Quel service de calcul ?", options: ["Une tâche ECS sur Fargate (ou AWS Batch)", "AWS Lambda", "Une instance EC2 réservée 3 ans", "CloudFront Functions"], answer: 0, explain: "Lambda est limitée à 15 minutes d'exécution." }
  ],
  flashcards: [
    ["Ordre d'évaluation IAM", "Deny explicite > Allow explicite > Deny implicite (par défaut)"],
    ["SCP", "Plafond de permissions sur les comptes d'une OU — n'accorde rien"],
    ["NAT Gateway : HA", "Une NAT Gateway par AZ, chaque sous-réseau privé route vers celle de son AZ"],
    ["Gateway endpoint vs Interface endpoint", "Gateway : S3 et DynamoDB, gratuit, via table de routage · Interface : PrivateLink, ENI, payant, la plupart des services"],
    ["VPC Peering : limites", "1-à-1, non transitif, pas de CIDR qui se chevauchent"],
    ["Transit Gateway", "Hub réseau régional transitif pour VPC, VPN et Direct Connect"],
    ["ALB vs NLB vs GWLB", "ALB : couche 7 HTTP · NLB : couche 4, IP statique, très haute perf · GWLB : appliances de sécurité"],
    ["RPO / RTO", "RPO : quantité de données perdues acceptable · RTO : durée d'interruption acceptable"],
    ["4 stratégies DR (du moins cher au plus cher)", "Backup & Restore → Pilot Light → Warm Standby → Multi-site actif/actif"],
    ["RDS Multi-AZ vs Read Replica", "Multi-AZ : standby synchrone pour la HA · Read Replica : asynchrone, lectures, promouvable, inter-région possible"],
    ["Aurora Global Database", "Réplication inter-régions < 1 s, promotion d'une région secondaire en < 1 min"],
    ["SQS Standard vs FIFO", "Standard : débit illimité, au moins une fois, ordre best-effort · FIFO : ordre + exactement une fois"],
    ["Fan-out", "SNS topic → plusieurs files SQS abonnées"],
    ["DAX", "Cache en mémoire pour DynamoDB, latence microseconde, compatible API"],
    ["CloudFront vs Global Accelerator", "CloudFront : cache HTTP · Global Accelerator : 2 IP anycast statiques, TCP/UDP, pas de cache"],
    ["OAC", "Origin Access Control : CloudFront seul peut lire un bucket S3 privé"],
    ["Placement groups", "Cluster (faible latence, 1 AZ) · Spread (instances isolées, 7/AZ) · Partition (grands systèmes distribués)"],
    ["Performances S3 par préfixe", "3 500 PUT/COPY/POST/DELETE et 5 500 GET/HEAD par seconde"],
    ["Secrets Manager vs Parameter Store", "Secrets Manager : rotation auto, payant · Parameter Store : config/secrets simples, gratuit (standard)"],
    ["Lambda : durée max", "15 minutes"],
    ["EBS : types", "gp3/gp2 (SSD général) · io2/io1 (IOPS provisionnées) · st1 (HDD débit) · sc1 (HDD froid)"],
    ["Compute Savings Plans", "Remise sur EC2, Fargate et Lambda, indépendamment de la famille, la région et l'OS"]
  ]
});
