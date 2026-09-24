ACADEMY.courses.push({
  id: 'aws-clf', phase: 1, kind: 'cert', order: 1,
  title: 'AWS Cloud Practitioner', icon: '☁️',
  vendor: 'AWS', level: 'Foundational', code: 'CLF-C02',
  hours: '~40h', cost: '~100€', priority: 5,
  subtitle: "Comprendre le cloud AWS de bout en bout : concepts, services clés, sécurité, facturation — et réussir le CLF-C02.",
  description: "Cette formation pose les fondations : pourquoi le cloud, comment AWS est organisé (régions, zones de disponibilité), les grandes familles de services (calcul, stockage, réseau, bases de données), le modèle de responsabilité partagée, IAM, la tarification et le support. Chaque notion est reliée aux questions typiques de l'examen.",
  searchTerm: 'AWS Cloud Practitioner CLF-C02', searchTermEn: 'AWS Certified Cloud Practitioner CLF-C02',
  exam: {
    duration: '90 min', questions: '65 QCM', passing: '700/1000',
    domains: [['Concepts du cloud', '24%'], ['Sécurité et conformité', '30%'], ['Technologies et services cloud', '34%'], ['Facturation, tarifs et support', '12%']],
    notes: "50 questions notées + 15 non notées (non identifiées). Pas de pénalité pour mauvaise réponse : ne laissez jamais de question vide."
  },
  outcomes: [
    "Expliquer les 6 avantages du cloud et les modèles IaaS / PaaS / SaaS",
    "Décrire l'infrastructure mondiale : régions, AZ, edge locations",
    "Choisir entre EC2, Lambda, ECS/Fargate, Elastic Beanstalk",
    "Différencier S3, EBS, EFS et les classes de stockage S3",
    "Appliquer le modèle de responsabilité partagée",
    "Sécuriser un compte avec IAM, MFA et le principe du moindre privilège",
    "Lire une facture, utiliser Cost Explorer, Budgets et le Pricing Calculator",
    "Connaître les plans de support et le Well-Architected Framework"
  ],
  prerequisites: ["Aucune expérience AWS requise", "Culture informatique générale (serveur, réseau, base de données)"],
  resources: [
    { label: "Guide officiel de l'examen CLF-C02", url: 'https://aws.amazon.com/certification/certified-cloud-practitioner/' },
    { label: 'AWS Skill Builder — Cloud Practitioner Essentials (gratuit)', url: 'https://skillbuilder.aws/' },
    { label: 'AWS Well-Architected Framework', url: 'https://aws.amazon.com/architecture/well-architected/' },
    { label: 'AWS Pricing Calculator', url: 'https://calculator.aws/' }
  ],
  modules: [
    {
      title: 'Concepts du cloud',
      lessons: [
        {
          title: "Qu'est-ce que le cloud computing ?",
          intro: "On pose les bases : définition, modèles de service et de déploiement, et les avantages que l'examen vous demandera de reconnaître.",
          sections: [
            { h: 'Définition', p: "Le cloud computing est la mise à disposition **à la demande** de ressources informatiques (calcul, stockage, bases de données, réseau) via Internet, avec une **tarification à l'usage**. Au lieu d'acheter et d'exploiter des serveurs, vous louez exactement ce dont vous avez besoin, quand vous en avez besoin.", bullets: ["Libre-service à la demande", "Accès réseau large", "Mutualisation des ressources", "Élasticité rapide", "Service mesuré (paiement à l'usage)"] },
            { h: 'Les modèles de service', p: "Plus on monte dans les couches, plus le fournisseur gère à votre place.", bullets: ["**IaaS** : vous gérez l'OS et au-dessus (ex. Amazon EC2)", "**PaaS** : vous gérez le code et les données (ex. Elastic Beanstalk)", "**SaaS** : vous consommez une application finie (ex. Amazon WorkMail, Gmail)"] },
            { h: 'Les modèles de déploiement', bullets: ["**Cloud public** : tout chez AWS", "**On-premises / cloud privé** : dans votre datacenter", "**Hybride** : relié entre les deux (VPN, Direct Connect, Outposts)"] },
            { h: 'Les 6 avantages du cloud selon AWS', p: "Retenez cette liste mot pour mot, elle tombe très souvent à l'examen.", bullets: ["Remplacer les dépenses d'investissement (CAPEX) par des dépenses variables (OPEX)", "Bénéficier d'économies d'échelle massives", "Arrêter de deviner la capacité", "Gagner en rapidité et en agilité", "Arrêter de dépenser pour faire tourner des datacenters", "Se déployer mondialement en quelques minutes"] }
          ],
          keypoints: ["Cloud = à la demande + paiement à l'usage", "IaaS / PaaS / SaaS : la frontière de responsabilité se déplace", "Les 6 avantages : CAPEX→OPEX, économies d'échelle, fin du capacity guessing, agilité, pas de datacenter, global en minutes"],
          practice: "Classez ces services en IaaS / PaaS / SaaS : EC2, Elastic Beanstalk, Amazon WorkSpaces, RDS, Lambda. (Réponse : IaaS ; PaaS ; SaaS/DaaS ; PaaS managé ; FaaS/serverless proche du PaaS.)"
        },
        {
          title: "L'infrastructure mondiale d'AWS",
          sections: [
            { h: 'Régions', p: "Une **région** est une zone géographique (ex. `eu-west-3` Paris) contenant plusieurs datacenters isolés. On choisit une région selon quatre critères.", bullets: ["Conformité et souveraineté des données", "Latence vis-à-vis des utilisateurs", "Disponibilité des services (tous ne sont pas partout)", "Prix (variables selon la région)"] },
            { h: 'Zones de disponibilité (AZ)', p: "Chaque région contient au moins 3 **AZ** : un ou plusieurs datacenters avec alimentation, réseau et refroidissement indépendants, reliés par un réseau à faible latence. Déployer sur plusieurs AZ = **haute disponibilité**.", bullets: ["Nommage : eu-west-3a, eu-west-3b, eu-west-3c", "Séparées physiquement de plusieurs kilomètres", "Une panne d'AZ ne doit pas faire tomber votre application multi-AZ"] },
            { h: 'Edge locations et services associés', p: "Les **points de présence** (edge locations) rapprochent le contenu des utilisateurs : CloudFront (CDN), Route 53 (DNS), AWS Global Accelerator, Lambda@Edge.", bullets: ["Local Zones : AWS au plus près des grandes villes", "Wavelength : AWS dans les réseaux 5G", "Outposts : racks AWS dans votre propre datacenter"] }
          ],
          keypoints: ["Région = géographie, AZ = datacenters isolés, edge = cache/latence", "Critères de choix de région : conformité, latence, services, prix", "Haute disponibilité = multi-AZ ; reprise après sinistre = multi-région"]
        },
        {
          title: 'Le Well-Architected Framework et le CAF',
          sections: [
            { h: 'Les 6 piliers Well-Architected', bullets: ["**Excellence opérationnelle** : automatiser, petits changements réversibles", "**Sécurité** : traçabilité, moindre privilège, chiffrement", "**Fiabilité** : récupération automatique, montée en charge horizontale", "**Efficacité des performances** : bon service au bon endroit, serverless", "**Optimisation des coûts** : payer seulement ce qui est utilisé", "**Durabilité** : réduire l'empreinte environnementale"] },
            { h: 'Cloud Adoption Framework (CAF)', p: "Le **CAF** guide la transformation d'une organisation vers le cloud à travers 6 perspectives.", bullets: ["Métier, Personnes, Gouvernance (côté business)", "Plateforme, Sécurité, Opérations (côté technique)"] },
            { h: 'Les stratégies de migration : les 7 R', bullets: ["Retire (supprimer), Retain (conserver)", "Rehost (lift and shift), Relocate (ex. VMware Cloud on AWS)", "Replatform (lift, tinker and shift), Repurchase (passer à un SaaS)", "Refactor / Re-architect (repenser en cloud natif)"] }
          ],
          keypoints: ["6 piliers : Ops, Sécurité, Fiabilité, Performance, Coûts, Durabilité", "CAF : 6 perspectives (3 business, 3 techniques)", "7 R de migration — Rehost = lift & shift"]
        }
      ]
    },
    {
      title: 'Services cloud essentiels',
      lessons: [
        {
          title: 'Calcul : EC2, Lambda, conteneurs',
          sections: [
            { h: 'Amazon EC2', p: "**EC2** fournit des machines virtuelles (instances). Vous choisissez l'AMI (image), le type d'instance (CPU/RAM), le stockage (EBS), le réseau et les groupes de sécurité.", bullets: ["Familles : usage général (t, m), calcul (c), mémoire (r, x), stockage (i, d), accéléré (p, g)", "Auto Scaling ajuste le nombre d'instances", "Elastic Load Balancing répartit le trafic (ALB, NLB, GWLB)"] },
            { h: "Modèles d'achat EC2", p: "Question classique de l'examen : quel modèle pour quel usage ?", bullets: ["**On-Demand** : à la seconde, sans engagement — charges imprévisibles", "**Savings Plans / Reserved Instances** : engagement 1 ou 3 ans, jusqu'à ~72 % de remise", "**Spot** : capacité inutilisée, jusqu'à 90 % moins cher, peut être interrompue — batch, tolérant aux pannes", "**Dedicated Hosts** : serveur physique dédié — licences liées au matériel, conformité"] },
            { h: 'Serverless et conteneurs', bullets: ["**Lambda** : exécute du code sur événement, facturé à la milliseconde, 15 min max", "**ECS** : orchestrateur de conteneurs AWS ; **EKS** : Kubernetes managé", "**Fargate** : conteneurs sans gérer de serveurs", "**Elastic Beanstalk** : PaaS, vous déposez le code, AWS gère le reste", "**Lightsail** : VPS simple à prix fixe"] }
          ],
          keypoints: ["EC2 = IaaS ; Lambda = serverless événementiel", "Spot = pas cher mais interruptible", "Reserved/Savings Plans = engagement 1–3 ans", "Fargate = conteneurs sans serveurs à gérer"]
        },
        {
          title: 'Stockage : S3, EBS, EFS, Glacier',
          sections: [
            { h: 'Amazon S3', p: "**S3** est un stockage objet quasi illimité : des objets (fichiers jusqu'à 5 To) dans des **buckets** au nom unique mondialement. Durabilité de **11 neuf** (99,999999999 %).", bullets: ["Versioning, réplication inter-régions, cycle de vie", "Hébergement de site web statique", "Chiffrement côté serveur par défaut"] },
            { h: 'Classes de stockage S3', bullets: ["**Standard** : accès fréquent", "**Intelligent-Tiering** : déplace automatiquement selon l'usage", "**Standard-IA / One Zone-IA** : accès peu fréquent", "**Glacier Instant / Flexible Retrieval / Deep Archive** : archivage, du milliseconde à 12 h de restauration"] },
            { h: 'Stockage bloc et fichier', bullets: ["**EBS** : disque bloc attaché à UNE instance EC2, dans UNE AZ, avec snapshots", "**Instance Store** : disque éphémère, perdu à l'arrêt", "**EFS** : système de fichiers NFS partagé, multi-AZ, Linux", "**FSx** : Windows File Server, Lustre (HPC), NetApp ONTAP", "**Storage Gateway** : relie on-premises et S3 (hybride)", "**Snow Family** : transfert physique de données massives"] }
          ],
          keypoints: ["S3 = objet, EBS = bloc (1 AZ), EFS = fichier partagé (multi-AZ)", "11 neuf de durabilité pour S3", "Glacier Deep Archive = le moins cher, restauration la plus lente"]
        },
        {
          title: 'Réseau et bases de données',
          sections: [
            { h: 'Réseau : VPC et connectivité', p: "Le **VPC** est votre réseau privé virtuel dans une région, découpé en **sous-réseaux** publics et privés.", bullets: ["Internet Gateway : accès Internet du VPC", "NAT Gateway : sortie Internet pour les sous-réseaux privés", "Security Group : pare-feu **stateful** au niveau de l'instance", "Network ACL : pare-feu **stateless** au niveau du sous-réseau", "VPN Site-to-Site (via Internet) vs **Direct Connect** (ligne privée dédiée)"] },
            { h: 'DNS et diffusion de contenu', bullets: ["**Route 53** : DNS managé, routage par latence, géolocalisation, failover", "**CloudFront** : CDN mondial avec cache aux edge locations", "**Global Accelerator** : accélère le trafic via le réseau AWS"] },
            { h: 'Bases de données managées', bullets: ["**RDS** : relationnel managé (MySQL, PostgreSQL, MariaDB, Oracle, SQL Server)", "**Aurora** : relationnel AWS, compatible MySQL/PostgreSQL, très performant", "**DynamoDB** : NoSQL clé-valeur serverless, latence en millisecondes", "**ElastiCache** : cache en mémoire (Redis, Memcached)", "**Redshift** : entrepôt de données (analytique)", "**Neptune** (graphe), **DocumentDB** (documents compatibles MongoDB)"] }
          ],
          keypoints: ["Security Group = stateful/instance ; NACL = stateless/sous-réseau", "Direct Connect = lien privé, pas via Internet", "RDS/Aurora = relationnel ; DynamoDB = NoSQL ; Redshift = analytique"]
        },
        {
          title: 'Autres services à connaître',
          sections: [
            { h: 'Intégration et messagerie', bullets: ["**SQS** : file d'attente, découplage", "**SNS** : notifications pub/sub (e-mail, SMS, HTTP)", "**EventBridge** : bus d'événements", "**Step Functions** : orchestration de workflows"] },
            { h: 'Supervision et gestion', bullets: ["**CloudWatch** : métriques, logs, alarmes", "**CloudTrail** : journal de TOUS les appels API (qui a fait quoi)", "**AWS Config** : historique et conformité des configurations", "**Systems Manager** : gestion de parc, patch, sessions", "**CloudFormation** : infrastructure as code", "**Trusted Advisor** : recommandations (coûts, sécurité, performance, tolérance aux pannes, quotas)"] },
            { h: 'Analytique et IA', bullets: ["Athena (SQL sur S3), Glue (ETL), Kinesis (streaming), QuickSight (BI)", "SageMaker (machine learning), Rekognition (images), Comprehend (texte), Polly (voix), Lex (chatbots), Bedrock (IA générative)"] }
          ],
          keypoints: ["CloudTrail = audit des API ; CloudWatch = métriques et logs ; Config = conformité", "SQS = file, SNS = pub/sub", "Trusted Advisor = conseils automatisés"]
        }
      ]
    },
    {
      title: 'Sécurité et conformité',
      lessons: [
        {
          title: 'Modèle de responsabilité partagée',
          sections: [
            { h: 'Le principe', p: "AWS est responsable de la sécurité **DU** cloud ; le client est responsable de la sécurité **DANS** le cloud.", bullets: ["AWS : datacenters, matériel, hyperviseur, réseau physique", "Client : données, IAM, configuration OS, pare-feu, chiffrement"] },
            { h: 'Ça dépend du service', p: "Plus le service est managé, plus AWS en prend en charge.", bullets: ["EC2 : vous patchez l'OS invité", "RDS : AWS patche le moteur, vous gérez les accès et les données", "Lambda : AWS gère le runtime, vous gérez le code et les permissions", "Contrôles partagés : gestion des patchs, configuration, formation"] },
            { h: 'Conformité', bullets: ["**AWS Artifact** : télécharger les rapports de conformité (ISO, SOC, PCI)", "Programmes : RGPD, HDS, SecNumCloud (selon services)", "La conformité de VOTRE application reste votre responsabilité"] }
          ],
          keypoints: ["AWS = sécurité DU cloud ; client = DANS le cloud", "Patch de l'OS invité EC2 = client", "AWS Artifact = rapports de conformité"]
        },
        {
          title: 'IAM et services de sécurité',
          sections: [
            { h: 'IAM : identités et permissions', bullets: ["**Utilisateur racine** : à protéger par MFA, ne pas utiliser au quotidien", "**Utilisateurs** et **groupes** : pour les humains (préférez IAM Identity Center)", "**Rôles** : identités temporaires pour services, applications, fédération", "**Politiques** JSON : Allow/Deny sur des actions et ressources", "Principe du **moindre privilège** ; un Deny explicite l'emporte toujours"] },
            { h: 'Exemple de politique IAM', p: "Cette politique autorise uniquement la lecture d'un bucket précis.", code: { lang: 'json', src: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": ["s3:GetObject", "s3:ListBucket"],\n    "Resource": [\n      "arn:aws:s3:::mon-bucket",\n      "arn:aws:s3:::mon-bucket/*"\n    ]\n  }]\n}' } },
            { h: 'Services de sécurité', bullets: ["**Organizations** + SCP : gouverner plusieurs comptes", "**KMS** : clés de chiffrement ; **CloudHSM** : HSM dédié", "**Shield** (anti-DDoS, Standard gratuit / Advanced payant), **WAF** (pare-feu applicatif)", "**GuardDuty** : détection de menaces par analyse des logs", "**Inspector** : scan de vulnérabilités ; **Macie** : données sensibles dans S3", "**Security Hub** : vue centralisée ; **Secrets Manager** : rotation des secrets"] }
          ],
          keypoints: ["Racine = MFA + ne jamais l'utiliser au quotidien", "Rôle IAM = identifiants temporaires", "GuardDuty = menaces ; Inspector = vulnérabilités ; Macie = données sensibles"]
        }
      ]
    },
    {
      title: 'Facturation, tarifs et support',
      lessons: [
        {
          title: 'Tarification et gestion des coûts',
          sections: [
            { h: 'Les principes de tarification', bullets: ["Payer à l'usage", "Payer moins en réservant (engagement)", "Payer moins par unité en consommant plus (paliers)", "Le transfert de données **entrant** est gratuit, le **sortant** est payant"] },
            { h: 'Outils de coûts', bullets: ["**Pricing Calculator** : estimer AVANT de déployer", "**Cost Explorer** : analyser et prévoir les dépenses passées", "**Budgets** : alertes quand un seuil est dépassé", "**Cost and Usage Report** : le détail le plus fin", "**Tags de répartition des coûts** : ventiler par projet/équipe", "**Consolidated billing** (Organizations) : une facture, remises agrégées"] },
            { h: 'Free Tier', bullets: ["Toujours gratuit (ex. 1 million de requêtes Lambda/mois)", "12 mois gratuits pour certains services (selon la date de création du compte)", "Essais gratuits ponctuels", "Créez un Budget dès le premier jour !"] }
          ],
          keypoints: ["Estimer = Pricing Calculator ; analyser = Cost Explorer ; alerter = Budgets", "Trafic entrant gratuit, sortant payant", "Consolidated billing via Organizations"]
        },
        {
          title: 'Plans de support et stratégie d\'examen',
          sections: [
            { h: 'Les plans de support', bullets: ["**Basic** : gratuit, documentation, Trusted Advisor limité", "**Developer** : support par e-mail en heures ouvrées", "**Business** : 24/7, réponse < 1 h si production en panne, Trusted Advisor complet", "**Enterprise On-Ramp** : réponse < 30 min sur panne critique", "**Enterprise** : < 15 min, **TAM** (Technical Account Manager) dédié, Concierge"] },
            { h: 'Autres aides', bullets: ["AWS Marketplace : logiciels tiers", "AWS Partner Network, AWS Professional Services", "re:Post (forum), Knowledge Center, AWS IQ"] },
            { h: "Stratégie pour le jour J", bullets: ["Lire la question en entier, repérer les mots-clés (« le moins cher », « le plus managé »)", "Éliminer les réponses absurdes d'abord", "Marquer les questions douteuses et y revenir", "Viser 80 % aux examens blancs avant de programmer l'examen"] }
          ],
          keypoints: ["TAM = plan Enterprise", "Business = premier plan avec support 24/7 et Trusted Advisor complet", "Mots-clés : « managé », « moins cher », « haute disponibilité »"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Sécuriser son compte AWS et poser un budget',
      goal: "Créer un compte AWS propre : MFA sur la racine, utilisateur d'administration via IAM Identity Center, et alerte budgétaire.",
      minutes: 40, env: 'Console AWS (compte gratuit)',
      warning: "Créez l'alerte budgétaire AVANT toute expérimentation. Supprimez les ressources à la fin de chaque lab.",
      steps: [
        { t: "Créez un compte AWS sur aws.amazon.com (carte bancaire requise, Free Tier).", check: "Vous accédez à la console." },
        { t: "Dans **IAM > Tableau de bord**, activez la MFA sur l'utilisateur racine (application d'authentification).", hint: "Menu du compte en haut à droite › Security credentials › Assign MFA device." },
        { t: "Activez **IAM Identity Center** et créez un utilisateur avec le jeu de permissions `AdministratorAccess`.", check: "Vous vous connectez via l'URL du portail d'accès, sans la racine." },
        { t: "Dans **Billing › Budgets**, créez un budget mensuel de 5 € avec alerte e-mail à 80 %.", check: "Le budget apparaît avec le statut OK." },
        { t: "Ouvrez **Cost Explorer** et activez-le (données disponibles sous 24 h)." },
        { t: "Installez l'AWS CLI et vérifiez votre identité.", cmd: "aws configure sso\naws sts get-caller-identity --profile mon-profil", check: "La commande renvoie votre Account et votre Arn." }
      ],
      cleanup: "Rien à supprimer : ces réglages sont gratuits et doivent rester actifs."
    },
    {
      title: 'Héberger un site statique sur S3',
      goal: "Créer un bucket S3, y déposer une page HTML et la publier comme site web.",
      minutes: 30, env: 'Console AWS ou AWS CLI',
      steps: [
        { t: "Créez un fichier `index.html` contenant « Bonjour depuis S3 »." },
        { t: "Créez un bucket au nom unique dans `eu-west-3`.", cmd: "aws s3 mb s3://mon-site-$RANDOM --region eu-west-3" },
        { t: "Désactivez le « Block Public Access » du bucket (uniquement pour ce lab) et ajoutez une bucket policy de lecture publique.", lang: 'json', cmd: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow", "Principal": "*",\n    "Action": "s3:GetObject",\n    "Resource": "arn:aws:s3:::NOM-DU-BUCKET/*"\n  }]\n}' },
        { t: "Activez l'hébergement de site statique (Properties › Static website hosting, document d'index `index.html`)." },
        { t: "Téléversez la page et ouvrez l'URL du site.", cmd: "aws s3 cp index.html s3://NOM-DU-BUCKET/", check: "La page s'affiche dans le navigateur." },
        { t: "Bonus : placez CloudFront devant le bucket et notez la différence d'URL et de latence." }
      ],
      cleanup: "Videz puis supprimez le bucket : `aws s3 rb s3://NOM-DU-BUCKET --force`."
    }
  ],
  quiz: [
    { q: "Quel avantage du cloud correspond au passage d'un investissement initial à un paiement à l'usage ?", options: ["Remplacer les dépenses CAPEX par des dépenses variables (OPEX)", "Bénéficier d'économies d'échelle", "Se déployer mondialement en quelques minutes", "Gagner en agilité"], answer: 0, explain: "Payer à l'usage plutôt qu'acheter du matériel = passer du CAPEX à l'OPEX." },
    { q: "Selon le modèle de responsabilité partagée, qui est responsable de l'application des correctifs de l'OS invité d'une instance EC2 ?", options: ["Le client", "AWS", "Les deux à parts égales", "Le partenaire AWS"], answer: 0, explain: "Sur EC2 (IaaS), l'OS invité est à la charge du client. AWS gère l'hyperviseur et le matériel." },
    { q: "Quel modèle d'achat EC2 convient le mieux à un traitement batch tolérant aux interruptions, au coût le plus bas ?", options: ["Instances Spot", "Instances On-Demand", "Dedicated Hosts", "Reserved Instances"], answer: 0, explain: "Spot : jusqu'à 90 % de remise, mais AWS peut reprendre la capacité avec 2 minutes de préavis." },
    { q: "Quel service enregistre tous les appels API effectués dans un compte AWS ?", options: ["AWS CloudTrail", "Amazon CloudWatch", "AWS Config", "Amazon Inspector"], answer: 0, explain: "CloudTrail = qui a fait quoi, quand, depuis où. CloudWatch = métriques et logs applicatifs." },
    { q: "Quelle affirmation décrit une zone de disponibilité (AZ) ?", options: ["Un ou plusieurs datacenters isolés au sein d'une région", "Un point de présence CloudFront", "Une région AWS dédiée au gouvernement", "Un réseau privé virtuel"], answer: 0, explain: "Une région contient plusieurs AZ, chacune avec alimentation et réseau indépendants." },
    { q: "Quel service permet d'estimer le coût d'une architecture AVANT de la déployer ?", options: ["AWS Pricing Calculator", "AWS Cost Explorer", "AWS Budgets", "AWS Cost and Usage Report"], answer: 0, explain: "Cost Explorer analyse les coûts passés ; le Pricing Calculator estime les coûts futurs." },
    { q: "Quel plan de support inclut un Technical Account Manager (TAM) dédié ?", options: ["Enterprise", "Business", "Developer", "Basic"], answer: 0, explain: "Le TAM dédié est réservé au plan Enterprise (Enterprise On-Ramp donne accès à un pool de TAM)." },
    { q: "Quel stockage fournit un système de fichiers partagé entre plusieurs instances EC2 Linux sur plusieurs AZ ?", options: ["Amazon EFS", "Amazon EBS", "Instance Store", "S3 Glacier"], answer: 0, explain: "EFS est un NFS managé multi-AZ. EBS s'attache à une instance dans une seule AZ." },
    { q: "Quelle est la différence entre un Security Group et une Network ACL ?", options: ["Le Security Group est stateful au niveau instance, la NACL est stateless au niveau sous-réseau", "Le Security Group est stateless, la NACL est stateful", "Les deux sont identiques", "La NACL s'applique à une instance, le Security Group à un VPC"], answer: 0, explain: "Stateful : la réponse d'un flux autorisé est automatiquement autorisée. Une NACL demande des règles dans les deux sens." },
    { q: "Quel service détecte les menaces en analysant les journaux CloudTrail, les flux VPC et le DNS ?", options: ["Amazon GuardDuty", "Amazon Macie", "AWS Shield", "AWS Artifact"], answer: 0, explain: "GuardDuty = détection de menaces par machine learning sur les logs." },
    { q: "Où télécharger les rapports de conformité d'AWS (SOC, ISO, PCI) ?", options: ["AWS Artifact", "AWS Trusted Advisor", "AWS Security Hub", "AWS Organizations"], answer: 0, explain: "AWS Artifact est le portail libre-service des rapports et accords de conformité." },
    { q: "Une entreprise veut une connexion réseau privée et dédiée entre son datacenter et AWS, sans passer par Internet. Que choisir ?", options: ["AWS Direct Connect", "AWS Site-to-Site VPN", "Amazon CloudFront", "Internet Gateway"], answer: 0, explain: "Le VPN passe par Internet (chiffré). Direct Connect est une liaison physique dédiée." },
    { q: "Quel service NoSQL serverless offre une latence de l'ordre de la milliseconde à toute échelle ?", options: ["Amazon DynamoDB", "Amazon RDS", "Amazon Redshift", "Amazon Aurora"], answer: 0, explain: "DynamoDB est la base clé-valeur/document serverless d'AWS." },
    { q: "Quelle stratégie de migration consiste à déplacer une application telle quelle vers EC2 ?", options: ["Rehost (lift and shift)", "Refactor", "Repurchase", "Retire"], answer: 0, explain: "Rehost = lift and shift, sans modification de l'application." }
  ],
  flashcards: [
    ["Les 6 avantages du cloud (AWS)", "CAPEX→OPEX · économies d'échelle · arrêter de deviner la capacité · vitesse/agilité · plus de dépenses de datacenter · global en minutes"],
    ["Région vs AZ vs Edge location", "Région = zone géographique ; AZ = datacenter(s) isolé(s) dans une région ; Edge = point de présence (CloudFront, Route 53)"],
    ["4 critères de choix d'une région", "Conformité, latence, disponibilité des services, prix"],
    ["Responsabilité partagée en une phrase", "AWS : sécurité DU cloud. Client : sécurité DANS le cloud"],
    ["Spot vs On-Demand vs Reserved", "Spot : -90 %, interruptible · On-Demand : flexible, sans engagement · Reserved/Savings Plans : engagement 1-3 ans, jusqu'à -72 %"],
    ["Dedicated Host : quand ?", "Licences liées aux cœurs/sockets physiques, exigences de conformité"],
    ["Durabilité de S3", "99,999999999 % (11 neuf)"],
    ["EBS vs EFS vs S3", "EBS : bloc, 1 instance, 1 AZ · EFS : fichiers NFS partagés multi-AZ · S3 : objets, illimité"],
    ["CloudTrail vs CloudWatch vs Config", "CloudTrail : audit des appels API · CloudWatch : métriques, logs, alarmes · Config : historique et conformité des configurations"],
    ["GuardDuty / Inspector / Macie", "GuardDuty : menaces · Inspector : vulnérabilités (EC2, ECR, Lambda) · Macie : données sensibles dans S3"],
    ["Shield Standard vs Advanced", "Standard : anti-DDoS gratuit et automatique · Advanced : payant, protection étendue + équipe DRT + protection des coûts"],
    ["Pricing Calculator vs Cost Explorer vs Budgets", "Estimer avant · analyser/prévoir après · alerter sur seuil"],
    ["Plan de support avec TAM dédié", "Enterprise"],
    ["Les 6 piliers Well-Architected", "Excellence opérationnelle, Sécurité, Fiabilité, Efficacité des performances, Optimisation des coûts, Durabilité"],
    ["Les 7 R de migration", "Retire, Retain, Rehost, Relocate, Replatform, Repurchase, Refactor"],
    ["Security Group vs NACL", "SG : stateful, instance, règles Allow uniquement · NACL : stateless, sous-réseau, Allow et Deny"],
    ["Direct Connect vs VPN", "Direct Connect : liaison privée dédiée · VPN Site-to-Site : tunnel chiffré via Internet"],
    ["AWS Artifact", "Portail des rapports de conformité (SOC, ISO, PCI) et des accords"],
    ["Transfert de données : entrant / sortant", "Entrant gratuit, sortant vers Internet payant"],
    ["Trusted Advisor : 5 catégories", "Optimisation des coûts, performance, sécurité, tolérance aux pannes, limites de service (+ excellence opérationnelle)"]
  ]
});
