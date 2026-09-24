ACADEMY.courses.push({
  id: 'aws-security', phase: 4, kind: 'cert', order: 2,
  title: 'AWS Security Specialty', icon: '🛡️',
  vendor: 'AWS', level: 'Specialty', code: 'SCS-C02',
  hours: '~90h', cost: '~300€', priority: 5,
  subtitle: "Sécurité AWS en profondeur : détection, réponse aux incidents, journalisation, infrastructure, identités, protection des données et gouvernance.",
  description: "La spécialité qui fait de vous un architecte de confiance. Chaque domaine est vu sous l'angle « prévenir, détecter, répondre, récupérer » : politiques IAM avancées, chiffrement KMS de bout en bout, sécurité réseau et edge, détection (GuardDuty, Security Hub, Detective), investigation et confinement automatisés.",
  searchTerm: 'AWS Security Specialty SCS-C02', searchTermEn: 'AWS Certified Security Specialty SCS-C02',
  exam: {
    duration: '170 min', questions: '65 QCM', passing: '750/1000',
    domains: [['Détection des menaces et réponse aux incidents', '14%'], ['Journalisation et supervision de la sécurité', '18%'], ["Sécurité de l'infrastructure", '20%'], ['Gestion des identités et des accès', '16%'], ['Protection des données', '18%'], ['Gestion et gouvernance de la sécurité', '14%']],
    notes: "AWS fait évoluer régulièrement cette spécialité : vérifiez la version du guide d'examen (C02 ou suivante) au moment de réserver."
  },
  outcomes: [
    "Écrire et déboguer des politiques IAM complexes (conditions, boundaries, sessions, inter-comptes)",
    "Concevoir la journalisation de sécurité centralisée et immuable",
    "Détecter les menaces avec GuardDuty, Inspector, Macie, Security Hub et Detective",
    "Automatiser la réponse aux incidents (confinement d'instance, révocation de clés)",
    "Sécuriser réseau et edge : SG, NACL, Network Firewall, WAF, Shield, PrivateLink",
    "Protéger les données avec KMS, CloudHSM, Secrets Manager, ACM et Object Lock",
    "Gouverner à l'échelle : Organizations, Control Tower, Config, Audit Manager"
  ],
  prerequisites: ["AWS SAA (indispensable)", "Expérience sécurité (IAM, réseau, chiffrement)"],
  resources: [
    { label: 'Page officielle Security Specialty', url: 'https://aws.amazon.com/certification/certified-security-specialty/' },
    { label: 'AWS Security Incident Response Guide', url: 'https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-response-guide/welcome.html' },
    { label: "Logique d'évaluation des politiques IAM", url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html' },
    { label: 'AWS KMS — bonnes pratiques', url: 'https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html' }
  ],
  modules: [
    {
      title: 'Identités et accès',
      lessons: [
        {
          title: 'IAM avancé',
          sections: [
            { h: 'Les couches de politiques', bullets: ["SCP / RCP (Organizations) → **permission boundary** → politique d'identité → politique de ressource → **session policy**", "Dans un même compte : Allow dans l'identité OU la ressource suffit (sauf Deny)", "**Inter-comptes** : il faut un Allow des DEUX côtés (identité dans le compte A ET ressource/rôle dans le compte B)", "Les politiques de clé KMS et les rôles de confiance sont des politiques de ressource"] },
            { h: 'Conditions essentielles', code: { lang: 'json', src: '{\n  "Effect": "Allow",\n  "Action": ["ec2:StartInstances", "ec2:StopInstances"],\n  "Resource": "*",\n  "Condition": {\n    "StringEquals": { "aws:ResourceTag/equipe": "${aws:PrincipalTag/equipe}" },\n    "Bool": { "aws:MultiFactorAuthPresent": "true" },\n    "IpAddress": { "aws:SourceIp": "203.0.113.0/24" }\n  }\n}' }, bullets: ["**ABAC** : autoriser selon les tags du principal et de la ressource (`aws:PrincipalTag`, `aws:ResourceTag`, `aws:RequestTag`)", "`aws:SecureTransport`, `aws:SourceVpce`, `aws:PrincipalOrgID`, `aws:CalledVia`", "Rôles de confiance : `sts:ExternalId` contre le **confused deputy**, `aws:SourceArn`/`aws:SourceAccount` pour les services"] },
            { h: 'Déléguer sans risque', bullets: ["**Permission boundaries** : un développeur peut créer des rôles, mais jamais plus puissants que la boundary", "`iam:PassRole` limité à des rôles précis", "**Identity Center** + permission sets, sessions courtes, MFA", "Accès d'urgence (**break glass**) surveillé", "**IAM Access Analyzer** : accès externes, accès inutilisés, validation et génération de politiques à partir de CloudTrail"] },
            { h: 'Déboguer un refus', bullets: ["Lire le message : type de politique qui refuse (SCP, boundary, ressource…)", "`aws sts decode-authorization-message`", "**IAM Policy Simulator**", "CloudTrail : `errorCode = AccessDenied`"] }
          ],
          keypoints: ["Inter-comptes = Allow des deux côtés", "Permission boundary limite la délégation", "ExternalId contre le confused deputy", "ABAC avec PrincipalTag = ResourceTag"]
        },
        {
          title: 'Fédération et identités applicatives',
          sections: [
            { h: 'Humains', bullets: ["**IAM Identity Center** fédéré à un IdP (Entra ID, Okta) via SAML 2.0 + provisioning SCIM", "Rôles IAM avec fédération SAML directe (historique)", "Attributs de session pour l'ABAC (département, projet)"] },
            { h: 'Applications et utilisateurs finaux', bullets: ["**Cognito** User Pools (authentification, MFA, protection avancée) + Identity Pools (identifiants AWS)", "**Verified Permissions** : autorisation fine avec le langage **Cedar**", "Charges de travail : rôles d'instance, rôles de tâche ECS, **EKS Pod Identity** / IRSA, **IAM Roles Anywhere** (serveurs on-premises avec certificats X.509)", "CI/CD : OIDC (GitHub, GitLab) avec conditions sur `sub` (dépôt, branche)"] }
          ],
          keypoints: ["Identity Center + SAML + SCIM", "Roles Anywhere pour l'on-premises", "OIDC CI restreint par sub", "Verified Permissions = Cedar"]
        }
      ]
    },
    {
      title: 'Détection, journalisation et réponse',
      lessons: [
        {
          title: 'Journalisation de sécurité',
          sections: [
            { h: 'Les sources', bullets: ["**CloudTrail** : trail d'organisation, événements de données S3/Lambda, **validation d'intégrité**, CloudTrail Lake", "**VPC Flow Logs**, **Route 53 Resolver query logs**, logs ELB/CloudFront/WAF, logs S3 (server access)", "**Config** : historique de configuration", "Logs applicatifs et d'OS (agent CloudWatch)"] },
            { h: 'Architecture centralisée et immuable', bullets: ["Compte **log archive** : bucket S3 avec **Object Lock** (compliance), versioning, chiffrement SSE-KMS, politique de bucket stricte", "SCP interdisant `cloudtrail:StopLogging`, `DeleteTrail`, la modification des buckets de logs", "**Amazon Security Lake** : normalise les logs au format **OCSF** pour les SIEM", "Analyse : Athena, OpenSearch, SIEM tiers"] },
            { h: 'Dépanner la journalisation', bullets: ["Pas de logs CloudTrail dans S3 → politique de bucket ou de clé KMS n'autorisant pas cloudtrail.amazonaws.com", "Pas de Flow Logs → rôle IAM de livraison ou politique de ressource CloudWatch Logs", "Logs manquants de l'agent → rôle d'instance, configuration de l'agent, connectivité"] }
          ],
          keypoints: ["Log archive + Object Lock + SCP", "Validation d'intégrité CloudTrail", "Security Lake = OCSF", "Échec de livraison = politique bucket/clé"]
        },
        {
          title: 'Détecter les menaces et répondre aux incidents',
          sections: [
            { h: 'Les détecteurs', bullets: ["**GuardDuty** : CloudTrail, Flow Logs, DNS + protections S3, EKS, RDS, Lambda, **Malware Protection** (EBS, S3), Runtime Monitoring", "**Inspector** : vulnérabilités EC2, images ECR, Lambda ; score contextualisé", "**Macie** : données sensibles dans S3", "**Security Hub** : agrège, normalise (ASFF/OCSF), contrôles CIS / FSBP, actions automatisées", "**Detective** : graphe d'investigation à partir des findings", "**Config** + **Firewall Manager** pour la conformité"] },
            { h: 'Cycle de réponse', bullets: ["**Préparer** : runbooks, rôles d'investigation, comptes forensics, automatisations testées", "**Détecter et analyser** : findings, Detective, CloudTrail Lake", "**Confiner** : isoler l'instance (SG sans règles), révoquer les sessions du rôle (politique `aws:TokenIssueTime`), désactiver les clés d'accès", "**Éradiquer et récupérer** : AMI saine, rotation des secrets, correctifs", "**Retour d'expérience**"] },
            { h: 'Confinement automatisé', p: "EventBridge capte un finding GuardDuty de gravité élevée → **Step Functions** ou SSM Automation : 1) snapshot des volumes EBS (preuve), 2) tag `quarantaine`, 3) remplacement des Security Groups par un SG d'isolation, 4) détachement de l'ASG, 5) notification. **Ne pas terminer l'instance** : on perdrait la mémoire et les preuves.", code: { lang: 'json', src: '{\n  "source": ["aws.guardduty"],\n  "detail-type": ["GuardDuty Finding"],\n  "detail": { "severity": [{ "numeric": [">=", 7] }] }\n}' } },
            { h: 'Clés d\'accès compromises', bullets: ["Désactiver la clé (ne pas la supprimer tout de suite : utile pour l'enquête)", "Révoquer les sessions actives des rôles concernés", "Analyser CloudTrail : ce qui a été fait avec la clé", "Vérifier les ressources créées (instances de minage, utilisateurs IAM)", "Ouvrir un cas au support AWS si nécessaire"] }
          ],
          keypoints: ["GuardDuty détecte ; Security Hub agrège ; Detective enquête", "Isoler (SG vide) et snapshot, ne pas terminer", "Révoquer les sessions : aws:TokenIssueTime", "EventBridge → Step Functions pour la réponse"]
        }
      ]
    },
    {
      title: 'Infrastructure et données',
      lessons: [
        {
          title: "Sécurité de l'infrastructure et de l'edge",
          sections: [
            { h: 'Réseau', bullets: ["Security Groups (stateful, références entre SG) et NACL (stateless, Deny explicite pour bloquer une IP)", "**AWS Network Firewall** : filtrage stateful, IPS Suricata, filtrage de domaines en sortie", "**Route 53 Resolver DNS Firewall** : bloquer les domaines malveillants", "Endpoints VPC + **politiques d'endpoint** ; PrivateLink pour exposer un service", "Pas d'accès SSH : **Session Manager** ; **EC2 Instance Connect Endpoint**"] },
            { h: 'Edge', bullets: ["**WAF** : règles managées (OWASP, bots, IP reputation), **rate-based rules**, géo-blocage, sur CloudFront/ALB/API Gateway/AppSync/Cognito", "**Shield Standard** (gratuit, L3/L4) vs **Shield Advanced** (DRT, protection des coûts, L7 automatique avec WAF)", "**Firewall Manager** : déployer WAF, Shield, SG, Network Firewall sur toute l'organisation", "CloudFront : OAC, signed URLs/cookies, **field-level encryption**, TLS minimum"] },
            { h: 'Calcul', bullets: ["**IMDSv2** obligatoire (protection contre le SSRF)", "AMI durcies (CIS), Inspector, Patch Manager", "Conteneurs : scan ECR, non-root, lecture seule, GuardDuty Runtime Monitoring", "Lambda : rôle minimal, variables chiffrées, VPC si accès privé"] }
          ],
          keypoints: ["NACL pour bloquer une IP précise", "Network Firewall pour le filtrage de domaines", "WAF rate-based + règles managées", "IMDSv2 contre le SSRF"]
        },
        {
          title: 'Protection des données : KMS, HSM, secrets',
          sections: [
            { h: 'KMS en profondeur', bullets: ["Types : clés gérées par AWS, **gérées par le client** (CMK), clés importées (BYOK), **key store externe (XKS)**, key store CloudHSM", "**Politique de clé** = contrôle principal (sans elle, même un admin IAM ne peut rien) ; **grants** pour des délégations temporaires (EBS, services)", "Rotation automatique (annuelle ou période personnalisée) : les anciennes versions restent pour déchiffrer", "Clés **multi-régions** ; clés asymétriques et HMAC", "Suppression planifiée (7 à 30 jours) — irréversible : préférer la désactivation", "Contexte de chiffrement (`kms:EncryptionContext`) pour lier le chiffré à son usage", "`kms:ViaService` : n'autoriser la clé que via un service donné"] },
            { h: 'CloudHSM', p: "HSM dédié, mono-locataire, validé **FIPS 140-2 niveau 3**, clés sous votre contrôle exclusif (AWS n'y a pas accès). Cas : exigences réglementaires strictes, TLS offload, Oracle TDE, PKI. Déployer en cluster sur plusieurs AZ." },
            { h: 'Données au repos et en transit', bullets: ["S3 : SSE-KMS avec **S3 Bucket Keys** (moins d'appels KMS), blocage de l'accès public au niveau compte, **Object Lock**, Macie", "EBS chiffré par défaut (paramètre de compte) ; snapshot chiffré partagé = partager aussi la clé", "RDS : chiffrement à la création (sinon snapshot → copie chiffrée → restauration)", "**ACM** (certificats publics gratuits, renouvellement auto) ; **Private CA** pour le mTLS interne", "**Secrets Manager** (rotation Lambda, réplication) vs **Parameter Store**", "**Nitro Enclaves** pour traiter des données très sensibles isolées"] }
          ],
          keypoints: ["Politique de clé obligatoire", "Grants pour la délégation temporaire", "CloudHSM = FIPS 140-2 niveau 3, contrôle exclusif", "RDS non chiffré → snapshot, copie chiffrée, restauration"]
        },
        {
          title: 'Gouvernance de la sécurité',
          sections: [
            { h: 'À l\'échelle de l\'organisation', bullets: ["**Control Tower** : contrôles préventifs, détectifs, proactifs", "**Config** : conformance packs, agrégateur, remédiation", "**Security Hub** : standards et score de sécurité ; administrateur délégué", "**Audit Manager** : collecte automatisée de preuves pour les audits (ISO, PCI, RGPD)", "**Artifact** : rapports de conformité AWS"] },
            { h: 'Sécuriser le déploiement', bullets: ["IaC analysée (cfn-guard, Checkov) ; hooks CloudFormation proactifs", "Pipelines avec rôles distincts et approbations", "**Service Catalog** pour des produits conformes par construction", "Tag policies + SCP pour imposer classification des données et propriétaire"] }
          ],
          keypoints: ["Audit Manager = preuves d'audit", "Contrôles préventifs / détectifs / proactifs", "Conformité par construction : Service Catalog, IaC analysée"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Réponse automatisée à une instance compromise',
      goal: "Activer GuardDuty, générer des findings d'exemple et construire une automatisation qui isole l'instance, prend un snapshot et notifie.",
      minutes: 90, env: 'Compte AWS de test',
      steps: [
        { t: "Activez GuardDuty et Security Hub (standard AWS Foundational Security Best Practices)." },
        { t: "Créez un Security Group `isolation` sans règle entrante ni sortante." },
        { t: "Écrivez une Lambda (Python/boto3) qui, pour un `instanceId` : crée un snapshot de chaque volume, tague l'instance `quarantaine=true`, remplace ses SG par `isolation`, et publie un message SNS." },
        { t: "Créez une règle EventBridge sur les findings GuardDuty de sévérité ≥ 7 de type EC2 vers la Lambda." },
        { t: "Lancez une instance de test puis générez des findings d'exemple.", cmd: "aws guardduty create-sample-findings --detector-id $(aws guardduty list-detectors --query 'DetectorIds[0]' --output text) \\\n  --finding-types 'Backdoor:EC2/C&CActivity.B!DNS'", hint: "Les findings d'exemple ne ciblent pas votre instance : testez la Lambda avec un événement construit contenant l'ID de votre instance." },
        { t: "Vérifiez : SG remplacé, snapshot créé, tag posé, notification reçue.", check: "L'instance n'a plus aucun accès réseau mais n'est pas terminée." },
        { t: "Écrivez une politique IAM qui révoque les sessions d'un rôle émises avant maintenant (`aws:TokenIssueTime`)." }
      ],
      cleanup: "Supprimez instance, snapshots, Lambda, règle et désactivez GuardDuty si le compte est un compte de test."
    }
  ],
  quiz: [
    { q: "Un utilisateur du compte A doit lire un bucket du compte B. Que faut-il ?", options: ["Un Allow dans la politique IAM de l'utilisateur (compte A) ET dans la bucket policy (compte B)", "Seulement la bucket policy", "Seulement la politique IAM", "Une SCP dans le compte B"], answer: 0, explain: "En inter-comptes, les deux côtés doivent autoriser." },
    { q: "Comment permettre aux développeurs de créer des rôles IAM sans risque d'élévation de privilèges ?", options: ["Imposer une permission boundary sur les rôles qu'ils créent", "Leur donner AdministratorAccess", "Utiliser une SCP qui autorise tout", "Désactiver IAM"], answer: 0, explain: "Condition iam:PermissionsBoundary sur iam:CreateRole." },
    { q: "Quel mécanisme protège contre le problème du « confused deputy » quand un tiers assume un rôle dans votre compte ?", options: ["La condition sts:ExternalId dans la politique de confiance", "La MFA", "Un NACL", "Le chiffrement SSE-S3"], answer: 0, explain: "L'ExternalId unique empêche un autre client du tiers d'utiliser votre rôle." },
    { q: "GuardDuty signale une instance compromise. Quelle est la première action recommandée ?", options: ["L'isoler avec un Security Group restrictif et prendre des snapshots, sans la terminer", "La terminer immédiatement", "La redémarrer", "Supprimer le VPC"], answer: 0, explain: "Terminer détruirait les preuves (mémoire, disques)." },
    { q: "Comment invalider immédiatement les identifiants temporaires déjà émis pour un rôle compromis ?", options: ["Ajouter une politique Deny avec la condition aws:TokenIssueTime antérieure à maintenant", "Supprimer la politique de confiance", "Changer le nom du rôle", "Attendre l'expiration"], answer: 0, explain: "C'est ce que fait « Revoke active sessions » dans la console." },
    { q: "Les fichiers CloudTrail n'arrivent plus dans le bucket S3 chiffré par une CMK. Cause probable ?", options: ["La politique de clé KMS n'autorise pas cloudtrail.amazonaws.com", "Le bucket est versionné", "CloudTrail est gratuit", "Le trail est multi-région"], answer: 0, explain: "Le service doit pouvoir utiliser la clé (GenerateDataKey)." },
    { q: "Comment garantir que les logs d'audit ne puissent être ni modifiés ni supprimés pendant 7 ans, même par un administrateur ?", options: ["S3 Object Lock en mode compliance avec rétention de 7 ans", "Le versioning seul", "Une bucket policy Deny", "Le chiffrement SSE-KMS"], answer: 0, explain: "Le mode compliance empêche toute suppression avant la fin de rétention, y compris par root." },
    { q: "Quelle solution de chiffrement garantit qu'AWS n'a jamais accès aux clés, avec FIPS 140-2 niveau 3 ?", options: ["AWS CloudHSM", "KMS avec clé gérée par AWS", "SSE-S3", "ACM"], answer: 0, explain: "CloudHSM est mono-locataire et sous contrôle exclusif du client." },
    { q: "Comment chiffrer une base RDS existante non chiffrée ?", options: ["Snapshot → copie du snapshot avec chiffrement → restauration", "Activer le chiffrement dans les paramètres", "Chiffrer le volume EBS sous-jacent", "Utiliser SSE-S3"], answer: 0, explain: "Le chiffrement RDS se choisit à la création." },
    { q: "Comment bloquer une adresse IP malveillante précise au niveau du sous-réseau ?", options: ["Une règle Deny dans la NACL", "Une règle Deny dans le Security Group", "Une route blackhole vers l'IGW", "GuardDuty"], answer: 0, explain: "Les Security Groups n'ont pas de règles Deny." },
    { q: "Comment limiter l'effet d'un SSRF permettant de lire les identifiants de l'instance ?", options: ["Imposer IMDSv2 (jetons de session, limite de sauts)", "Désactiver CloudTrail", "Utiliser une instance plus grande", "Activer le Detailed Monitoring"], answer: 0, explain: "IMDSv2 exige un jeton obtenu par une requête PUT." },
    { q: "Quel service collecte automatiquement des preuves de conformité pour préparer un audit ?", options: ["AWS Audit Manager", "AWS Artifact", "Amazon Detective", "AWS Trusted Advisor"], answer: 0, explain: "Artifact fournit les rapports d'AWS ; Audit Manager collecte VOS preuves." }
  ],
  flashcards: [
    ["Ordre des couches de politiques", "SCP/RCP → permission boundary → identité ↔ ressource → session policy (Deny explicite partout gagne)"],
    ["Inter-comptes", "Allow requis côté identité (compte A) ET côté ressource/rôle (compte B)"],
    ["Permission boundary", "Plafond de permissions d'une identité IAM (délégation sûre)"],
    ["Confused deputy", "sts:ExternalId (tiers) ; aws:SourceArn / aws:SourceAccount (services)"],
    ["ABAC", "Autoriser si aws:PrincipalTag/x = aws:ResourceTag/x"],
    ["Révoquer des sessions actives", "Deny si aws:TokenIssueTime < maintenant"],
    ["IAM Roles Anywhere", "Identifiants AWS temporaires pour des serveurs hors AWS via certificats X.509"],
    ["Logs inaltérables", "S3 Object Lock mode compliance + SCP de protection + validation CloudTrail"],
    ["Security Lake", "Lac de données de sécurité normalisé OCSF"],
    ["GuardDuty / Inspector / Macie / Detective", "Menaces · vulnérabilités · données sensibles · investigation"],
    ["Instance compromise : étapes", "Snapshot, tag, SG d'isolation, détacher de l'ASG, investiguer — ne pas terminer"],
    ["Bloquer une IP", "NACL Deny (ou WAF IP set sur la couche 7)"],
    ["Shield Standard vs Advanced", "Standard : gratuit L3/L4 · Advanced : DRT, protection des coûts, mitigation L7"],
    ["Firewall Manager", "Déploie WAF, Shield Advanced, SG, Network Firewall sur l'organisation"],
    ["IMDSv2", "Métadonnées avec jeton de session : protège contre le SSRF"],
    ["Politique de clé KMS", "Contrôle d'accès principal à la clé (obligatoire)"],
    ["Grants KMS", "Délégations d'usage temporaires et programmatiques"],
    ["kms:ViaService", "N'autoriser la clé que lorsqu'elle est utilisée via un service donné"],
    ["CloudHSM", "HSM dédié FIPS 140-2 niveau 3, contrôle exclusif des clés"],
    ["Chiffrer une base RDS existante", "Snapshot → copie chiffrée → restauration"]
  ]
});
