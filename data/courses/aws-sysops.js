ACADEMY.courses.push({
  id: 'aws-sysops', phase: 3, kind: 'cert', order: 1,
  title: 'AWS SysOps Administrator', icon: '🛠️',
  vendor: 'AWS', level: 'Associate', code: 'SOA-C02',
  hours: '~70h', cost: '~150€', priority: 4,
  subtitle: "Exploiter AWS au quotidien : supervision, remédiation automatique, fiabilité, déploiement, sécurité, réseau et coûts.",
  description: "La certification des opérations. Vous apprenez à faire tourner des charges de production : observer (CloudWatch, CloudTrail, Config), remédier automatiquement (EventBridge, Systems Manager Automation), garantir la continuité (Backup, multi-AZ), provisionner (CloudFormation, StackSets), sécuriser et optimiser. Excellent socle avant DevOps Professional.",
  searchTerm: 'AWS SysOps Administrator SOA-C02', searchTermEn: 'AWS SysOps Administrator Associate CloudOps',
  exam: {
    duration: '130 min', questions: '65 QCM', passing: '720/1000',
    domains: [['Supervision, journalisation et remédiation', '20%'], ['Fiabilité et continuité d\'activité', '16%'], ['Déploiement, provisionnement et automatisation', '18%'], ['Sécurité et conformité', '16%'], ['Réseau et diffusion de contenu', '18%'], ['Optimisation des coûts et des performances', '12%']],
    notes: "Fin 2025, AWS a remplacé SOA-C02 par **AWS Certified CloudOps Engineer – Associate (SOA-C03)**, qui ajoute notamment conteneurs (ECS/EKS) et observabilité multi-comptes. Vérifiez la version en vigueur sur la page officielle avant de réserver : le contenu de ce cours couvre le socle commun."
  },
  outcomes: [
    "Collecter métriques et logs (agent CloudWatch), créer alarmes et tableaux de bord",
    "Auditer avec CloudTrail et AWS Config, remédier automatiquement",
    "Gérer un parc avec Systems Manager : Session Manager, Patch Manager, Run Command, Automation",
    "Assurer sauvegarde, restauration et haute disponibilité",
    "Provisionner avec CloudFormation (StackSets, drift) et gérer les AMI",
    "Diagnostiquer le réseau : VPC Flow Logs, Reachability Analyzer, Route 53",
    "Optimiser coûts et performances (Compute Optimizer, Trusted Advisor, gp3, S3)"
  ],
  prerequisites: ["AWS SAA (fortement recommandé)", "Administration Linux de base"],
  resources: [
    { label: 'Certifications AWS (page Associate)', url: 'https://aws.amazon.com/certification/' },
    { label: 'Documentation AWS Systems Manager', url: 'https://docs.aws.amazon.com/systems-manager/' },
    { label: 'Documentation Amazon CloudWatch', url: 'https://docs.aws.amazon.com/cloudwatch/' }
  ],
  modules: [
    {
      title: 'Supervision et remédiation',
      lessons: [
        {
          title: 'CloudWatch : métriques, agent, alarmes',
          sections: [
            { h: 'Métriques', bullets: ["Métriques EC2 par défaut toutes les **5 min** ; **supervision détaillée** : 1 min (payant)", "La **mémoire** et l'**espace disque** ne sont PAS des métriques par défaut : il faut l'**agent CloudWatch**", "Métriques personnalisées : résolution standard (60 s) ou haute résolution (1 s)", "Dimensions (InstanceId, AutoScalingGroupName) ; rétention jusqu'à 15 mois"] },
            { h: "L'agent CloudWatch", p: "Installé via Systems Manager, configuré par un JSON stocké dans **Parameter Store**, il envoie métriques système (mémoire, disque, procstat) et fichiers de logs.", code: { lang: 'json', src: '{\n  "metrics": {\n    "append_dimensions": { "InstanceId": "${aws:InstanceId}" },\n    "metrics_collected": {\n      "mem":  { "measurement": ["mem_used_percent"] },\n      "disk": { "measurement": ["used_percent"], "resources": ["/"] }\n    }\n  },\n  "logs": {\n    "logs_collected": { "files": { "collect_list": [\n      { "file_path": "/var/log/nginx/error.log", "log_group_name": "nginx-error" }\n    ] } }\n  }\n}' } },
            { h: 'Alarmes', bullets: ["États : **OK**, **ALARM**, **INSUFFICIENT_DATA**", "Évaluation : période, nombre de points, « M sur N » pour éviter les faux positifs", "Actions : SNS, Auto Scaling, **actions EC2** (stop, terminate, reboot, **recover**)", "**Alarmes composites** : combiner plusieurs alarmes (réduire le bruit)", "Détection d'anomalies (bande de valeurs attendues)"] }
          ],
          keypoints: ["Mémoire et disque = agent CloudWatch", "Supervision détaillée = 1 min", "Action EC2 recover sur StatusCheckFailed_System", "Alarmes composites contre le bruit"]
        },
        {
          title: 'Logs, CloudTrail, Config et EventBridge',
          sections: [
            { h: 'CloudWatch Logs', bullets: ["Groupes et flux de logs ; **rétention** configurable (par défaut : jamais d'expiration !)", "**Metric filters** : transformer des motifs de logs en métriques (ex. nombre d'erreurs 5xx)", "**Logs Insights** : requêtes interactives", "**Subscription filters** : flux temps réel vers Lambda, Kinesis, OpenSearch", "Export vers S3 (non temps réel) pour l'archivage"] },
            { h: 'CloudTrail', bullets: ["Événements de **gestion** (activés par défaut, 90 jours dans l'historique) et de **données** (S3 objets, Lambda — payants)", "**Trail multi-région** et **trail d'organisation** vers un bucket S3 central", "**Validation d'intégrité** des fichiers de logs (hash)", "CloudTrail Lake : requêtes SQL sur les événements ; Insights : activité API inhabituelle"] },
            { h: 'AWS Config', bullets: ["Inventaire et **historique de configuration** des ressources", "**Règles** managées ou personnalisées : conformité (ex. volumes EBS chiffrés, SG sans 0.0.0.0/0 en SSH)", "**Remédiation automatique** via documents SSM Automation", "**Conformance packs** et agrégateurs multi-comptes"] },
            { h: 'Remédier automatiquement', p: "Pattern clé : **événement** (EventBridge, alarme, règle Config) → **cible** (Lambda, SSM Automation, SNS). Exemple : un Security Group ouvre le port 22 au monde → règle EventBridge sur l'appel API `AuthorizeSecurityGroupIngress` → Lambda qui retire la règle et notifie." }
          ],
          keypoints: ["Rétention des logs à définir (sinon infinie)", "Metric filter = logs → métrique", "CloudTrail = qui a fait quoi ; Config = état et conformité", "EventBridge → Lambda/SSM pour la remédiation"]
        },
        {
          title: 'Systems Manager : gérer un parc',
          sections: [
            { h: 'Prérequis', bullets: ["**Agent SSM** (préinstallé sur Amazon Linux et AMI Windows récentes)", "Rôle d'instance avec la politique `AmazonSSMManagedInstanceCore`", "Connectivité vers les endpoints SSM (Internet/NAT ou **VPC endpoints** ssm, ssmmessages, ec2messages)", "Fonctionne aussi on-premises (activation hybride)"] },
            { h: 'Les fonctionnalités à connaître', bullets: ["**Session Manager** : shell sans SSH, sans port ouvert, sans bastion, sessions journalisées", "**Run Command** : exécuter une commande sur un parc (par tags)", "**Patch Manager** : baselines, groupes de patchs, **maintenance windows**", "**Automation** : runbooks (ex. `AWS-RestartEC2Instance`, créer une AMI)", "**Parameter Store** : configuration et secrets", "**Inventory**, **State Manager** (maintenir une configuration), **OpsCenter** (OpsItems)"], code: { lang: 'bash', src: 'aws ssm start-session --target i-0abc123\n\naws ssm send-command --document-name "AWS-RunShellScript" \\\n  --targets "Key=tag:env,Values=prod" \\\n  --parameters commands="sudo dnf -y update nginx"\n\naws ssm start-automation-execution --document-name "AWS-CreateImage" \\\n  --parameters InstanceId=i-0abc123' } }
          ],
          keypoints: ["SSM : agent + rôle + connectivité", "Session Manager remplace SSH et bastion", "Patch Manager + maintenance windows", "Automation runbooks pour remédier"]
        }
      ]
    },
    {
      title: 'Fiabilité, déploiement et réseau',
      lessons: [
        {
          title: 'Sauvegarde, haute disponibilité et provisionnement',
          sections: [
            { h: 'Sauvegardes', bullets: ["**AWS Backup** : plans de sauvegarde (fréquence, rétention, copie inter-régions), coffres (vault lock)", "Snapshots EBS (Data Lifecycle Manager), snapshots RDS automatiques (PITR) vs manuels", "S3 versioning + réplication ; **restaurer régulièrement** pour tester"] },
            { h: 'Haute disponibilité opérationnelle', bullets: ["ASG multi-AZ avec health checks ELB", "RDS Multi-AZ ; basculement automatique (~60–120 s), DNS inchangé", "Route 53 health checks + failover", "Récupération automatique d'instance (EC2 auto recovery)"] },
            { h: 'CloudFormation en exploitation', bullets: ["**Change sets** : prévisualiser avant d'appliquer", "**Drift detection** : repérer les modifications manuelles", "**StackSets** : déployer sur plusieurs comptes et régions", "`DeletionPolicy: Retain/Snapshot`, `UpdateReplacePolicy`", "Erreur `UPDATE_ROLLBACK_FAILED` : corriger la ressource puis *continue update rollback*", "`cfn-init`, `cfn-signal` et **CreationPolicy** pour attendre la fin du bootstrap"] },
            { h: 'AMI et images', bullets: ["**EC2 Image Builder** : pipelines d'AMI « dorées » patchées et testées", "Copie d'AMI entre régions ; partage entre comptes (attention à la clé KMS)", "Préférer immuable : remplacer les instances plutôt que les patcher à la main"] }
          ],
          keypoints: ["AWS Backup centralise", "Drift detection + change sets", "StackSets multi-comptes/régions", "DeletionPolicy Retain/Snapshot"]
        },
        {
          title: 'Réseau, DNS et diffusion de contenu en exploitation',
          sections: [
            { h: 'Diagnostiquer le réseau', bullets: ["**VPC Flow Logs** : ACCEPT/REJECT par interface (pas le contenu)", "**Reachability Analyzer** : vérifier un chemin entre deux ressources sans envoyer de trafic", "Checklist : table de routage, SG (stateful), NACL (stateless, ports éphémères 1024-65535), IGW/NAT, endpoint", "Timeout = souvent SG/NACL ; *connection refused* = service arrêté"] },
            { h: 'Route 53', bullets: ["Politiques de routage : simple, **pondérée**, **latence**, **failover**, géolocalisation, géoproximité, multivaleur, IP-based", "**Alias** : vers ALB, CloudFront, S3 (gratuit, possible à l'apex du domaine) vs CNAME (pas à l'apex)", "Health checks (y compris calculés et sur alarme CloudWatch)", "Resolver endpoints pour le DNS hybride"] },
            { h: 'CloudFront et S3 en exploitation', bullets: ["Invalidation de cache (`/*`) ou, mieux, noms de fichiers versionnés", "TTL, politiques de cache, en-têtes d'origine", "Erreurs 403 : OAC/bucket policy ; 504 : origine injoignable", "S3 : **Event Notifications**, **Replication** (versioning requis), **Lifecycle**, **Requester Pays**, **Storage Lens**"] }
          ],
          keypoints: ["Flow Logs = métadonnées de trafic", "Reachability Analyzer = test de chemin sans trafic", "Alias à l'apex, CNAME non", "NACL : penser aux ports éphémères"]
        }
      ]
    },
    {
      title: 'Sécurité et coûts',
      lessons: [
        {
          title: 'Sécurité opérationnelle et optimisation',
          sections: [
            { h: 'Sécurité au quotidien', bullets: ["IAM Access Analyzer : accès externes et politiques inutilisées", "Credential report (utilisateurs, âge des clés, MFA)", "Security Hub + GuardDuty + Inspector, consolidés dans un compte de sécurité", "KMS : rotation automatique annuelle des clés gérées client", "Certificats ACM : renouvellement automatique si validés par DNS"] },
            { h: 'Coûts et performances', bullets: ["**Compute Optimizer** : rightsizing EC2, EBS, Lambda, ECS", "**Trusted Advisor** : instances sous-utilisées, EIP non attachées, volumes orphelins", "EBS : gp2 → gp3, surveiller `VolumeQueueLength` et les crédits burst", "EC2 : familles récentes et Graviton ; placement groups pour HPC", "RDS : Performance Insights, **RDS Proxy** (pool de connexions, Lambda)", "S3 : Intelligent-Tiering, multipart, Transfer Acceleration"] },
            { h: 'Pièges fréquents à l\'examen', bullets: ["Instance bloquée en `pending`/`terminated` immédiatement → quota, volume EBS chiffré sans accès KMS, AMI corrompue", "`InsufficientInstanceCapacity` → autre AZ ou type", "Burstable (t3) lent → crédits CPU épuisés → mode unlimited ou autre famille", "Impossible de joindre une instance privée → Session Manager + VPC endpoints"] }
          ],
          keypoints: ["Compute Optimizer = rightsizing", "RDS Proxy pour les connexions massives", "Crédits CPU t3", "Access Analyzer et credential report"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Supervision et remédiation automatique d\'un parc EC2',
      goal: "Installer l'agent CloudWatch via SSM, créer une alarme mémoire, et remédier automatiquement l'ouverture du port SSH au monde.",
      minutes: 75, env: 'Console AWS + CLI',
      steps: [
        { t: "Lancez 2 instances Amazon Linux avec un rôle contenant `AmazonSSMManagedInstanceCore` et `CloudWatchAgentServerPolicy`, taguées `env=lab`." },
        { t: "Vérifiez qu'elles apparaissent dans **Fleet Manager** et ouvrez une session sans SSH.", cmd: "aws ssm start-session --target i-XXXXXXXX" },
        { t: "Stockez la configuration de l'agent dans Parameter Store (`AmazonCloudWatch-linux`) puis installez/configurez l'agent avec Run Command (`AWS-ConfigureAWSPackage` puis `AmazonCloudWatch-ManageAgent`)." },
        { t: "Créez une alarme sur `mem_used_percent > 80 %` (2 points sur 3) avec notification SNS par e-mail." },
        { t: "Générez de la charge mémoire et observez l'alarme.", cmd: "sudo dnf install -y stress-ng && stress-ng --vm 1 --vm-bytes 85% -t 300s" },
        { t: "Créez une règle EventBridge sur `AuthorizeSecurityGroupIngress` (via CloudTrail) qui déclenche une Lambda retirant toute règle `0.0.0.0/0` sur le port 22.", hint: "Motif d'événement : source aws.ec2, detail-type « AWS API Call via CloudTrail », detail.eventName = AuthorizeSecurityGroupIngress." },
        { t: "Ouvrez le port 22 au monde sur un SG de test et vérifiez que la règle disparaît en moins d'une minute.", check: "La règle est retirée et vous recevez une notification." },
        { t: "Activez la règle AWS Config `restricted-ssh` et constatez l'état de conformité." }
      ],
      cleanup: "Supprimez instances, alarmes, règle EventBridge, Lambda, rôle et règle Config."
    }
  ],
  quiz: [
    { q: "Comment superviser l'utilisation mémoire d'une instance EC2 ?", options: ["Installer l'agent CloudWatch", "Activer la supervision détaillée", "Elle est disponible par défaut", "Via CloudTrail"], answer: 0, explain: "La mémoire est une métrique interne à l'OS, invisible pour l'hyperviseur." },
    { q: "Quelle action d'alarme redémarre une instance sur un nouvel hôte après une défaillance matérielle ?", options: ["EC2 recover sur StatusCheckFailed_System", "EC2 reboot sur CPUUtilization", "Auto Scaling scale-in", "SNS notification"], answer: 0, explain: "Recover conserve l'ID, les IP privées et les volumes EBS." },
    { q: "Comment transformer le nombre de lignes « ERROR » d'un groupe de logs en métrique ?", options: ["Un metric filter", "Une subscription filter", "Logs Insights", "Un export S3"], answer: 0, explain: "Le metric filter crée une métrique personnalisée à partir d'un motif." },
    { q: "Quel service donne l'historique de configuration d'un Security Group et sa conformité à des règles ?", options: ["AWS Config", "CloudTrail", "CloudWatch", "Trusted Advisor"], answer: 0, explain: "CloudTrail dit qui a appelé l'API ; Config montre l'état avant/après et évalue la conformité." },
    { q: "Quels éléments faut-il pour gérer une instance privée avec Session Manager, sans NAT ?", options: ["Agent SSM, rôle AmazonSSMManagedInstanceCore et VPC endpoints SSM", "Un bastion et une clé SSH", "Une IP publique", "Un VPN Site-to-Site"], answer: 0, explain: "Endpoints ssm, ssmmessages et ec2messages." },
    { q: "Comment détecter qu'une ressource d'une stack CloudFormation a été modifiée à la main ?", options: ["Drift detection", "Change set", "StackSets", "Stack policy"], answer: 0, explain: "Le change set prévisualise une mise à jour ; la détection de dérive compare réel et template." },
    { q: "Comment déployer le même template dans 20 comptes et 3 régions ?", options: ["CloudFormation StackSets", "Nested stacks", "Change sets", "Cfn-init"], answer: 0, explain: "StackSets s'intègre à Organizations pour le déploiement automatique." },
    { q: "Une instance t3 devient très lente l'après-midi sans changement de charge. Cause probable ?", options: ["Épuisement des crédits CPU", "Panne d'AZ", "Quota de VPC atteint", "Clé KMS expirée"], answer: 0, explain: "Les instances burstables consomment des crédits au-dessus de leur ligne de base." },
    { q: "Quel enregistrement Route 53 pointe l'apex du domaine (exemple.fr) vers un ALB ?", options: ["Un enregistrement Alias", "Un CNAME", "Un enregistrement MX", "Un enregistrement TXT"], answer: 0, explain: "Un CNAME est interdit à l'apex ; l'Alias est aussi gratuit en requêtes." },
    { q: "Quel outil vérifie la connectivité entre une instance et une base RDS sans envoyer de paquets ?", options: ["VPC Reachability Analyzer", "VPC Flow Logs", "Traceroute", "CloudWatch Synthetics"], answer: 0, explain: "Il analyse la configuration (routes, SG, NACL) et indique le composant bloquant." },
    { q: "Des fonctions Lambda saturent les connexions d'une base RDS. Quelle solution ?", options: ["RDS Proxy", "Read Replicas", "Multi-AZ", "Augmenter la mémoire Lambda"], answer: 0, explain: "RDS Proxy mutualise et réutilise les connexions." },
    { q: "Par défaut, combien de temps sont conservés les logs d'un nouveau groupe CloudWatch Logs ?", options: ["Indéfiniment", "30 jours", "90 jours", "1 an"], answer: 0, explain: "D'où l'importance de définir une rétention pour maîtriser les coûts." }
  ],
  flashcards: [
    ["Métriques EC2 non fournies par défaut", "Mémoire, espace disque, processus → agent CloudWatch"],
    ["Supervision basique vs détaillée", "5 min (gratuit) vs 1 min (payant)"],
    ["États d'une alarme", "OK, ALARM, INSUFFICIENT_DATA"],
    ["Metric filter vs subscription filter", "Metric filter : logs → métrique · Subscription : flux temps réel vers Lambda/Kinesis/OpenSearch"],
    ["CloudTrail : types d'événements", "Gestion (par défaut) · Données (S3 objets, Lambda, payants) · Insights"],
    ["AWS Config : remédiation", "Règle non conforme → document SSM Automation"],
    ["Prérequis SSM", "Agent, rôle AmazonSSMManagedInstanceCore, accès aux endpoints SSM"],
    ["Patch Manager", "Baselines + groupes de patchs + maintenance windows"],
    ["Change set vs drift", "Change set : prévisualiser une mise à jour · Drift : écart réel vs template"],
    ["StackSets", "Déploiement CloudFormation multi-comptes et multi-régions"],
    ["CreationPolicy + cfn-signal", "Attendre que le bootstrap de l'instance réussisse avant de valider la ressource"],
    ["Alias vs CNAME", "Alias : ressources AWS, apex autorisé, gratuit · CNAME : pas à l'apex"],
    ["NACL et ports éphémères", "Autoriser 1024-65535 en sortie pour les réponses (stateless)"],
    ["Reachability Analyzer", "Analyse statique d'un chemin réseau entre deux ressources"],
    ["RDS Proxy", "Pool de connexions managé (Lambda, pics de connexions), bascule plus rapide"],
    ["SOA-C02 → successeur", "AWS Certified CloudOps Engineer – Associate (SOA-C03)"]
  ]
});
