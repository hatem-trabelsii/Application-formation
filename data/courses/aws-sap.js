ACADEMY.courses.push({
  id: 'aws-sap', phase: 4, kind: 'cert', order: 1,
  title: 'AWS Solutions Architect Professional', icon: '🏛️',
  vendor: 'AWS', level: 'Professional', code: 'SAP-C02',
  hours: '~120h', cost: '~300€', priority: 5,
  subtitle: "Architecturer à l'échelle de l'entreprise : organisations multi-comptes, réseau hybride, migration, modernisation et amélioration continue.",
  description: "La certification la plus exigeante du parcours AWS. Les scénarios mêlent gouvernance, réseau hybride, sécurité, performance, coûts et migration ; plusieurs réponses fonctionnent, une seule respecte TOUTES les contraintes. Vous y validez votre posture d'architecte capable de décider et de justifier en COA.",
  searchTerm: 'AWS Solutions Architect Professional SAP-C02', searchTermEn: 'AWS Solutions Architect Professional SAP-C02',
  exam: {
    duration: '180 min', questions: '75 QCM', passing: '750/1000',
    domains: [['Concevoir pour la complexité organisationnelle', '26%'], ['Concevoir de nouvelles solutions', '29%'], ['Amélioration continue des solutions existantes', '25%'], ['Accélérer la migration et la modernisation', '20%']],
    notes: "Questions de 150 à 250 mots. Méthode : 1) identifier LA contrainte dominante, 2) éliminer ce qui la viole, 3) départager par le coût et l'effort opérationnel."
  },
  outcomes: [
    "Concevoir une landing zone multi-comptes (Organizations, Control Tower, SCP, Identity Center)",
    "Architecturer un réseau hybride global : Transit Gateway, Direct Connect, VPN, Cloud WAN, DNS hybride",
    "Partager des ressources entre comptes (RAM, PrivateLink) et centraliser sécurité et journalisation",
    "Concevoir de nouvelles solutions résilientes, performantes, sécurisées et économes",
    "Améliorer l'existant : fiabilité, performance, sécurité, coûts, excellence opérationnelle",
    "Planifier et exécuter des migrations massives (7 R, MGN, DMS, Snow, DataSync) et moderniser"
  ],
  prerequisites: ["AWS SAA (indispensable) et idéalement DevOps Pro", "2 ans de conception d'architectures AWS"],
  resources: [
    { label: 'Page officielle SAP-C02', url: 'https://aws.amazon.com/certification/certified-solutions-architect-professional/' },
    { label: 'AWS Prescriptive Guidance', url: 'https://aws.amazon.com/prescriptive-guidance/' },
    { label: 'Organizing Your AWS Environment Using Multiple Accounts', url: 'https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.html' },
    { label: 'AWS Migration Hub / stratégies de migration', url: 'https://aws.amazon.com/migration-hub/' }
  ],
  modules: [
    {
      title: 'Complexité organisationnelle',
      lessons: [
        {
          title: 'Landing zone multi-comptes',
          sections: [
            { h: 'Pourquoi plusieurs comptes', bullets: ["Le compte AWS est la **frontière d'isolation** la plus forte (sécurité, quotas, facturation)", "Séparer par environnement, par charge de travail, par exigence réglementaire", "Structure d'OU recommandée : **Security** (log archive, audit), **Infrastructure** (réseau, services partagés), **Workloads** (prod / non-prod), **Sandbox**, **Policy Staging**, **Suspended**"] },
            { h: 'Les services de gouvernance', bullets: ["**Organizations** : SCP, **RCP** (Resource Control Policies, plafond sur les ressources), politiques de tags, de sauvegarde, d'IA", "**Control Tower** : landing zone, Account Factory, contrôles, tableau de conformité", "**IAM Identity Center** : SSO, permission sets, fédération avec Entra ID/Okta (SCIM)", "**Administrateur délégué** : GuardDuty, Security Hub, Config, Firewall Manager gérés depuis le compte sécurité", "**AWS RAM** : partager sous-réseaux (VPC partagé), Transit Gateway, règles Route 53 Resolver, licences"] },
            { h: 'Périmètres de données', p: "Un **data perimeter** garantit que seules des **identités de confiance** accèdent à des **ressources de confiance** depuis des **réseaux attendus**, en combinant SCP, RCP, politiques de ressources et d'endpoints avec les clés de condition `aws:PrincipalOrgID`, `aws:ResourceOrgID`, `aws:SourceVpce`.", code: { lang: 'json', src: '{\n  "Sid": "SeulementMonOrganisation",\n  "Effect": "Deny",\n  "Principal": "*",\n  "Action": "s3:*",\n  "Resource": ["arn:aws:s3:::donnees-rh", "arn:aws:s3:::donnees-rh/*"],\n  "Condition": {\n    "StringNotEqualsIfExists": { "aws:PrincipalOrgID": "o-abc123xyz" },\n    "BoolIfExists": { "aws:PrincipalIsAWSService": "false" }\n  }\n}' } },
            { h: 'Coûts à l\'échelle', bullets: ["Facturation consolidée, partage des remises RI/Savings Plans (désactivable par compte)", "Tags de répartition imposés par politique de tags + SCP", "Cost Categories, Cost Anomaly Detection, CUR 2.0 + Athena/QuickSight", "Budgets par compte avec actions automatiques (appliquer une SCP de blocage)"] }
          ],
          keypoints: ["Compte = frontière d'isolation", "OU : Security, Infrastructure, Workloads, Sandbox", "Administrateur délégué pour les services de sécurité", "Data perimeter : aws:PrincipalOrgID, aws:SourceVpce"]
        },
        {
          title: 'Réseau hybride et multi-régions',
          sections: [
            { h: 'Connectivité hybride', bullets: ["**Direct Connect** : dedicated (1/10/100 Gbit/s) ou hosted ; **VIF** privée (VPC), publique (services publics AWS), **transit** (Transit Gateway)", "**Direct Connect Gateway** : une connexion DX vers des VPC/TGW de plusieurs régions", "Résilience : 2 DX sur 2 emplacements différents (maximum resiliency) ou DX + **VPN de secours**", "Chiffrement sur DX : **MACsec** (10/100G) ou VPN IPsec par-dessus", "**Site-to-Site VPN** vers TGW avec **ECMP** pour agréger la bande passante ; Accelerated VPN"] },
            { h: 'Architectures de hub', bullets: ["**Transit Gateway** : tables de routage multiples pour segmenter (prod ne voit pas dev), **peering inter-régions**", "**Inspection centralisée** : VPC d'inspection avec Network Firewall ou GWLB + appliances, *appliance mode* activé", "**Egress centralisé** : NAT Gateways mutualisées dans un VPC de sortie", "**AWS Cloud WAN** : réseau global piloté par politique (segments, régions)", "**VPC Lattice** : connectivité et autorisation service-à-service entre VPC et comptes"] },
            { h: 'DNS hybride', bullets: ["**Route 53 Resolver inbound endpoint** : on-premises résout les zones privées AWS", "**Outbound endpoint + règles de transfert** : AWS résout les domaines on-premises", "Partage des règles via RAM ; zones hébergées privées associées à plusieurs VPC/comptes"] }
          ],
          keypoints: ["DX : VIF privée / publique / transit", "DX Gateway = multi-régions", "Résilience : 2 DX ou DX + VPN", "TGW : tables de routage pour segmenter", "Resolver inbound/outbound pour le DNS hybride"]
        }
      ]
    },
    {
      title: 'Nouvelles solutions et amélioration continue',
      lessons: [
        {
          title: 'Concevoir de nouvelles solutions',
          sections: [
            { h: 'Grille de décision', bullets: ["Exigences : fonctionnelles, **RTO/RPO**, latence, débit, conformité, budget, compétences de l'équipe", "Préférer **managé / serverless** si « effort opérationnel minimal »", "Découpler (SQS, SNS, EventBridge, Kinesis, Step Functions)", "Données : bon moteur pour le bon accès (polyglot persistence)", "Sécurité intégrée dès la conception : chiffrement, moindre privilège, réseau privé"] },
            { h: 'Patterns à maîtriser', bullets: ["Multi-région actif/actif : Route 53 latence + DynamoDB Global Tables / Aurora Global + S3 CRR", "Traitement d'événements à grande échelle : Kinesis Data Streams → Lambda / Managed Flink → S3/Redshift", "Lac de données : S3 + Glue Data Catalog + **Lake Formation** (permissions fines) + Athena", "Microservices : ECS/EKS, API Gateway, App Mesh remplacé par **VPC Lattice** / Service Connect", "HPC : ParallelCluster, FSx for Lustre, EFA, placement group cluster, Spot", "Diffusion vidéo/contenu : CloudFront, S3, MediaConvert"] },
            { h: 'Sécurité des nouvelles solutions', bullets: ["Chiffrement de bout en bout (KMS, ACM, TLS mutuel)", "Identités temporaires partout (rôles, Pod Identity, Cognito)", "WAF + Shield Advanced + Firewall Manager pour les expositions publiques", "Clés KMS multi-régions pour le chiffrement côté client répliqué"] }
          ],
          keypoints: ["Contrainte dominante d'abord", "Managé/serverless si effort minimal", "Lake Formation pour les permissions fines du data lake", "VPC Lattice pour le service-à-service"]
        },
        {
          title: 'Améliorer l\'existant',
          sections: [
            { h: 'Fiabilité', bullets: ["Supprimer les points uniques de défaillance (instance unique, NAT unique, base mono-AZ)", "Tests de charge et de chaos (FIS) ; quotas surveillés (Service Quotas + alarmes)", "Idempotence, retries avec backoff, circuit breakers, files tampons"] },
            { h: 'Performance', bullets: ["Caches : CloudFront, ElastiCache, DAX, API Gateway", "Bases : réplicas, Aurora Serverless v2, RDS Proxy, partitionnement DynamoDB", "Calcul : Graviton, familles récentes, autoscaling prédictif", "Réseau : placement groups, ENA, Global Accelerator"] },
            { h: 'Coûts', bullets: ["Rightsizing (Compute Optimizer), Savings Plans, Spot", "S3 Intelligent-Tiering, lifecycle ; EBS gp3 ; suppression des orphelins", "Architecture : serverless pour l'intermittent, endpoints VPC contre les frais NAT, réduction du transfert inter-AZ/inter-région"] },
            { h: 'Excellence opérationnelle et sécurité', bullets: ["IaC, CI/CD, déploiements progressifs, runbooks", "Observabilité centralisée ; SLO", "Security Hub, GuardDuty, Inspector, Macie ; remédiation automatique", "Patching automatisé (SSM Patch Manager), AMI dorées (Image Builder)"] }
          ],
          keypoints: ["Chasser les SPOF", "Service Quotas + alarmes", "Caches à chaque couche", "Endpoints VPC contre les frais NAT"]
        }
      ]
    },
    {
      title: 'Migration et modernisation',
      lessons: [
        {
          title: 'Planifier et exécuter une migration',
          sections: [
            { h: 'Les phases', bullets: ["**Évaluer** : Migration Evaluator (business case, TCO), Application Discovery Service (agents / sans agent), Migration Hub", "**Mobiliser** : landing zone, compétences, plan par vagues, stratégie 7 R par application", "**Migrer et moderniser** : exécution par vagues, tests, bascule"] },
            { h: 'Les outils', bullets: ["**AWS Application Migration Service (MGN)** : rehost de serveurs par réplication continue au niveau bloc, bascule avec coupure minimale", "**DMS** : migration de bases (homogène ou hétérogène) avec **CDC** (réplication continue) ; **SCT** / DMS Schema Conversion pour convertir les schémas (Oracle → Aurora PostgreSQL)", "**DataSync** : transfert de fichiers en ligne (NFS/SMB/HDFS → S3/EFS/FSx), planifié, avec vérification", "**Transfer Family** : SFTP/FTPS managé vers S3/EFS", "**Snowball Edge** : transfert hors ligne de dizaines/centaines de To (quand le réseau est insuffisant)", "**Storage Gateway** : hybride (File, Volume, Tape)"] },
            { h: 'Calculer : réseau ou Snow ?', code: { lang: 'text', src: '100 To à transférer, lien de 1 Gbit/s utilisable à 80 %\n→ 100 × 8 × 10^12 bits / (0,8 × 10^9 bit/s) ≈ 1 000 000 s ≈ 11,6 jours\nSi l\'échéance est de 7 jours → Snowball Edge (plusieurs appareils en parallèle)\nSi le lien est de 10 Gbit/s → ~1,2 jour → DataSync en ligne' } },
            { h: 'Moderniser', bullets: ["Replatform : bases vers RDS/Aurora, applications vers Elastic Beanstalk/ECS", "Refactor : microservices, serverless, événementiel (pattern **strangler fig**)", "Conteneurisation d'applications Java/.NET existantes (App2Container)", "Mainframe : AWS Mainframe Modernization ; .NET : Porting Assistant / Transform", "Bases commerciales → open source (Babelfish pour SQL Server vers Aurora PostgreSQL)"] }
          ],
          keypoints: ["MGN = rehost serveurs", "DMS + CDC = bases avec coupure minimale ; SCT pour l'hétérogène", "DataSync en ligne vs Snowball hors ligne", "Strangler fig pour moderniser progressivement"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Étude de cas : dossier d\'architecture d\'une migration',
      goal: "Produire un dossier d'architecture (type COA) pour migrer une application 3-tiers on-premises vers AWS multi-comptes, en justifiant chaque choix. Exercice papier/diagramme, sans coût cloud.",
      minutes: 120, env: 'Outil de diagramme (draw.io, Excalidraw) + éditeur de texte',
      steps: [
        { t: "Contexte : application Java sur 6 VM, base Oracle 4 To, fichiers partagés NFS 30 To, 2 000 utilisateurs internes, RTO 1 h / RPO 15 min, lien 1 Gbit/s, budget contraint." },
        { t: "Dessinez la **landing zone** : OU, comptes (réseau, sécurité, log archive, prod, non-prod), SCP clés." },
        { t: "Concevez le **réseau hybride** : Direct Connect + VPN de secours, Transit Gateway avec tables prod/non-prod, DNS hybride Resolver." },
        { t: "Choisissez une stratégie **7 R** par composant et justifiez (ex. VM → MGN rehost puis ECS ; Oracle → Aurora PostgreSQL avec DMS + SCT ; NFS → FSx/EFS avec DataSync)." },
        { t: "Calculez la durée de transfert des 30 To sur le lien et décidez DataSync ou Snowball." },
        { t: "Décrivez la **stratégie de reprise** respectant RTO 1 h / RPO 15 min (pilot light ou warm standby dans une seconde région) et son coût relatif." },
        { t: "Listez les **risques** et les mesures (bascule, rollback, tests de charge, sécurité)." },
        { t: "Comparez votre dossier avec les 6 piliers Well-Architected et notez les compromis assumés.", check: "Chaque choix est relié à une exigence (coût, RTO/RPO, sécurité, effort)." }
      ]
    }
  ],
  quiz: [
    { q: "Une entreprise veut empêcher tout accès à ses buckets S3 par des identités extérieures à son organisation AWS. Quelle solution scalable ?", options: ["Une RCP/politique de ressource avec la condition aws:PrincipalOrgID", "Lister chaque compte dans chaque bucket policy", "Chiffrer avec SSE-S3", "Activer le versioning"], answer: 0, explain: "aws:PrincipalOrgID évite de maintenir la liste des comptes." },
    { q: "Des VPC de 3 régions doivent être joints depuis le datacenter via une seule connexion Direct Connect. Que faut-il ?", options: ["Un Direct Connect Gateway avec une VIF privée ou transit", "Une VIF publique par région", "Trois connexions Direct Connect", "VPC peering inter-régions"], answer: 0, explain: "Le DX Gateway est un objet global reliant plusieurs régions." },
    { q: "Comment garantir la connectivité si le Direct Connect tombe, au moindre coût ?", options: ["Un Site-to-Site VPN de secours", "Une seconde connexion DX sur le même emplacement", "CloudFront", "Un VPC peering"], answer: 0, explain: "La résilience maximale serait 2 DX sur 2 emplacements, mais plus chère." },
    { q: "Les serveurs on-premises doivent résoudre des noms de zones hébergées privées Route 53. Que déployer ?", options: ["Un Route 53 Resolver inbound endpoint et un transfert conditionnel on-premises", "Un outbound endpoint", "Une zone publique", "Un NAT Gateway"], answer: 0, explain: "Inbound = requêtes entrant dans AWS depuis l'extérieur." },
    { q: "Il faut migrer 60 serveurs physiques et VM vers EC2 avec une coupure minimale et sans modifier les applications. Quel service ?", options: ["AWS Application Migration Service (MGN)", "AWS DMS", "AWS DataSync", "AWS Snowball"], answer: 0, explain: "MGN réplique en continu au niveau bloc puis bascule." },
    { q: "Migration d'Oracle vers Aurora PostgreSQL avec une interruption de quelques minutes. Quelle combinaison ?", options: ["Conversion de schéma (SCT/DMS SC) + DMS avec CDC", "Export/import Data Pump uniquement", "MGN", "Snowball Edge"], answer: 0, explain: "Le CDC maintient la cible à jour jusqu'à la bascule." },
    { q: "400 To doivent arriver dans S3 sous 2 semaines, lien Internet de 500 Mbit/s. Que choisir ?", options: ["Plusieurs appareils Snowball Edge", "DataSync sur Internet", "S3 Transfer Acceleration", "Un VPN plus rapide"], answer: 0, explain: "500 Mbit/s ≈ 5,4 To/jour : plus de 70 jours par le réseau." },
    { q: "Comment permettre à plusieurs comptes de déployer des ressources dans des sous-réseaux gérés centralement par l'équipe réseau ?", options: ["Partager les sous-réseaux avec AWS RAM (VPC partagé)", "Créer un VPC par compte en peering", "Donner les droits administrateur réseau à chaque équipe", "Utiliser des Elastic IP"], answer: 0, explain: "Les comptes participants créent leurs ressources dans des sous-réseaux possédés par le compte réseau." },
    { q: "Il faut inspecter tout le trafic entre VPC et vers Internet avec des appliances tierces. Quelle architecture ?", options: ["VPC d'inspection avec Gateway Load Balancer, routé par Transit Gateway (appliance mode)", "Security Groups sur chaque instance", "NACL restrictives", "VPC peering maillé"], answer: 0, explain: "L'appliance mode garantit la symétrie des flux à travers les AZ." },
    { q: "Quel service gère les permissions fines (colonnes, lignes) sur un data lake S3 interrogé par Athena ?", options: ["AWS Lake Formation", "AWS Glue DataBrew", "Amazon Macie", "S3 Access Points seuls"], answer: 0, explain: "Lake Formation centralise les permissions sur le Glue Data Catalog." },
    { q: "Pour gérer GuardDuty et Security Hub de 200 comptes sans utiliser le compte de gestion, que faire ?", options: ["Désigner un compte de sécurité comme administrateur délégué", "Activer les services manuellement dans chaque compte", "Utiliser le compte racine de chaque compte", "Créer un utilisateur IAM par compte"], answer: 0, explain: "Bonne pratique : minimiser l'usage du compte de gestion." },
    { q: "Quel pattern permet de moderniser un monolithe progressivement en remplaçant ses fonctions une à une ?", options: ["Strangler fig", "Big bang rewrite", "Lift and shift", "Retain"], answer: 0, explain: "Une façade (API Gateway, ALB) route progressivement vers les nouveaux services." }
  ],
  flashcards: [
    ["OU recommandées", "Security, Infrastructure, Workloads (Prod/SDLC), Sandbox, Policy Staging, Suspended"],
    ["SCP vs RCP", "SCP : plafond sur les principaux des comptes · RCP : plafond sur les ressources des comptes"],
    ["Data perimeter : clés de condition", "aws:PrincipalOrgID, aws:ResourceOrgID, aws:SourceVpce, aws:SourceIp"],
    ["AWS RAM", "Partager des ressources entre comptes : sous-réseaux, TGW, règles Resolver, licences…"],
    ["Types de VIF Direct Connect", "Privée (VPC/VGW ou DXGW) · Publique (services publics AWS) · Transit (TGW via DXGW)"],
    ["Direct Connect Gateway", "Relie une connexion DX à des VPC/TGW de plusieurs régions"],
    ["Chiffrer Direct Connect", "MACsec (10/100 Gbit/s) ou VPN IPsec par-dessus"],
    ["Agréger plusieurs VPN", "VPN vers Transit Gateway avec ECMP"],
    ["DNS hybride", "Inbound endpoint (on-prem → AWS) · Outbound endpoint + règles (AWS → on-prem)"],
    ["Inspection centralisée", "VPC d'inspection + GWLB/Network Firewall + TGW en appliance mode"],
    ["MGN", "Rehost par réplication continue au niveau bloc"],
    ["DMS + CDC", "Migration de base avec réplication continue jusqu'à la bascule"],
    ["SCT", "Conversion de schéma hétérogène (Oracle → PostgreSQL…)"],
    ["DataSync vs Snowball", "DataSync : en ligne, planifié · Snowball : hors ligne quand le réseau est trop lent"],
    ["Débit utile d'un lien de 1 Gbit/s", "≈ 10 To/jour à 100 %, ~8 To/jour à 80 %"],
    ["Strangler fig", "Remplacer un monolithe fonction par fonction derrière une façade"],
    ["Cloud WAN", "Réseau global géré par politique (segments) au-dessus des régions AWS"],
    ["VPC Lattice", "Connectivité + autorisation service-à-service entre VPC et comptes"]
  ]
});
