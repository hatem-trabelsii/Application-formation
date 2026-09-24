ACADEMY.courses.push({
  id: 'az-305', phase: 4, kind: 'cert', order: 3,
  title: 'Azure Solutions Architect Expert', icon: '🏰',
  vendor: 'Azure', level: 'Expert', code: 'AZ-305',
  hours: '~100h', cost: '~165€', priority: 4,
  subtitle: "Concevoir des solutions Azure : identité, gouvernance, supervision, données, continuité d'activité et infrastructure.",
  description: "AZ-305 fait de vous l'architecte bimodal AWS + Azure. On raisonne avec le Cloud Adoption Framework et le Well-Architected Framework d'Azure : landing zones, choix des bases de données et du stockage, stratégies de haute disponibilité et de reprise, calcul, réseau, migration et intégration applicative.",
  searchTerm: 'AZ-305 Azure Solutions Architect', searchTermEn: 'AZ-305 Azure Solutions Architect Expert',
  exam: {
    duration: '100 min', questions: '40–60 (+ études de cas)', passing: '700/1000',
    domains: [["Concevoir l'identité, la gouvernance et la supervision", '25–30%'], ['Concevoir le stockage de données', '20–25%'], ['Concevoir la continuité d\'activité', '15–20%'], ["Concevoir l'infrastructure", '30–35%']],
    notes: "⚠️ Le titre Azure Solutions Architect Expert exige **AZ-104 (Azure Administrator)** en plus d'AZ-305. AZ-104 ne figure pas dans votre plan : prévoyez-le (≈ 50–60 h) avant ou pendant la phase 4. AZ-204 ne remplace pas AZ-104 ici."
  },
  outcomes: [
    "Concevoir identité et accès : Entra ID, rôles, PIM, identités managées, B2B/B2C",
    "Concevoir la gouvernance : groupes d'administration, Policy, landing zones (CAF)",
    "Concevoir supervision et journalisation : Azure Monitor, Log Analytics, alertes",
    "Choisir le bon stockage et la bonne base : Blob, Files, SQL (DB, MI, VM), Cosmos DB, PostgreSQL",
    "Concevoir haute disponibilité et reprise : zones, paires de régions, Site Recovery, Backup",
    "Concevoir calcul, réseau (hub-spoke, Virtual WAN, Private Link) et intégration applicative",
    "Planifier la migration avec Azure Migrate et Database Migration Service"
  ],
  prerequisites: ["**AZ-104** (obligatoire pour le titre Expert)", "AZ-204 et AWS SAA/SAP pour la vision comparée"],
  resources: [
    { label: 'Page officielle Azure Solutions Architect Expert', url: 'https://learn.microsoft.com/fr-fr/credentials/certifications/azure-solutions-architect/' },
    { label: 'Azure Architecture Center', url: 'https://learn.microsoft.com/fr-fr/azure/architecture/' },
    { label: 'Cloud Adoption Framework', url: 'https://learn.microsoft.com/fr-fr/azure/cloud-adoption-framework/' },
    { label: 'Azure Well-Architected Framework', url: 'https://learn.microsoft.com/fr-fr/azure/well-architected/' }
  ],
  modules: [
    {
      title: 'Identité, gouvernance et supervision',
      lessons: [
        {
          title: 'Identité et accès',
          sections: [
            { h: 'Concevoir l\'identité', bullets: ["**Microsoft Entra ID** comme plan de contrôle d'identité unique", "Hybride : **Entra Connect Sync** ou **Cloud Sync** ; authentification par **synchronisation de hash** (recommandée, résiliente), **pass-through** ou fédération", "Partenaires : **B2B** (invités) ; clients : **External ID** (ex-B2C)", "Applications : inscriptions d'applications, **identités managées** pour les ressources Azure"] },
            { h: 'Accès privilégiés', bullets: ["**RBAC Azure** : rôles intégrés (Propriétaire, Contributeur, Lecteur, rôles de service) ou personnalisés, à l'étendue la plus basse", "**Privileged Identity Management (PIM)** : élévation juste-à-temps, approbation, durée limitée, justification", "**Accès conditionnel** : MFA, appareils conformes, emplacements, risque de connexion", "**Access reviews** : recertifier périodiquement les accès", "Comptes d'urgence (break glass) exclus des règles risquées et surveillés"] },
            { h: 'Secrets et clés', bullets: ["**Key Vault** (standard/premium avec HSM) ou **Managed HSM** (mono-locataire, FIPS 140-3 niveau 3)", "Clés gérées par le client (CMK) pour Storage, SQL, disques", "Rotation automatique, alertes d'expiration"] }
          ],
          keypoints: ["Password hash sync recommandé", "PIM = juste-à-temps", "Accès conditionnel + MFA", "Identités managées : zéro secret"]
        },
        {
          title: 'Gouvernance, landing zones et supervision',
          sections: [
            { h: 'Landing zone Azure (CAF)', bullets: ["Hiérarchie de **groupes d'administration** : Plateforme (Identité, Gestion, Connectivité), Landing zones (Corp, Online), Sandbox, Décommissionné", "Un **abonnement** par application ou par environnement : unité de mise à l'échelle et de facturation", "**Azure Policy** assignées au niveau des groupes d'administration (initiatives), effets `deny`, `audit`, `deployIfNotExists`, `modify`", "Implémentation de référence : **Azure Landing Zones** (Bicep / Terraform)"] },
            { h: 'Conformité et coûts', bullets: ["Tags imposés par Policy (héritage depuis le groupe de ressources)", "**Microsoft Defender for Cloud** : score de sécurité, conformité réglementaire", "**Cost Management** : budgets, alertes, allocation par tag", "**Azure Resource Graph** : inventaire requêtable (KQL) de tout le patrimoine"] },
            { h: 'Supervision', bullets: ["**Azure Monitor** : métriques, **Log Analytics workspaces** (un central ou par région/souveraineté), paramètres de diagnostic imposés par Policy", "**Application Insights** (APM), **Container Insights**, **VM Insights**", "Alertes (métriques, logs KQL, journal d'activité) → **groupes d'actions**", "**Azure Monitor Agent** + règles de collecte de données (DCR)", "Archivage : exports vers stockage, Event Hubs vers SIEM (**Microsoft Sentinel**)"] }
          ],
          keypoints: ["MG : Plateforme / Landing zones / Sandbox", "Abonnement = unité d'échelle", "Policy deployIfNotExists pour imposer les diagnostics", "Log Analytics central + Sentinel"]
        }
      ]
    },
    {
      title: 'Stockage de données',
      lessons: [
        {
          title: 'Choisir le stockage et la base de données',
          sections: [
            { h: 'Données non relationnelles', bullets: ["**Blob** : objets, niveaux Hot/Cool/Cold/Archive, immutabilité (WORM), **Data Lake Storage Gen2** (espace de noms hiérarchique) pour l'analytique", "**Azure Files** : SMB/NFS managé, Azure File Sync pour l'hybride ; **Azure NetApp Files** pour la haute performance", "Disques managés : Standard HDD/SSD, Premium SSD (v2), **Ultra Disk**", "Redondance : LRS, ZRS, GRS, GZRS (+ RA-)"] },
            { h: 'Bases relationnelles', bullets: ["**Azure SQL Database** : PaaS ; modèles **DTU** ou **vCore** ; niveaux General Purpose, Business Critical, **Hyperscale** (jusqu'à 128 To) ; **serverless** ; **elastic pools** pour de nombreuses petites bases", "**SQL Managed Instance** : quasi 100 % compatible SQL Server (SQL Agent, CLR, requêtes inter-bases) — idéal pour le lift-and-shift", "**SQL Server sur VM** : contrôle total de l'OS", "**Azure Database for PostgreSQL / MySQL — Flexible Server**"] },
            { h: 'NoSQL et analytique', bullets: ["**Cosmos DB** : multi-modèle, distribution mondiale, multi-écriture, 5 niveaux de cohérence, SLA de latence", "**Azure Cache for Redis**", "Analytique : **Microsoft Fabric**, Synapse, Databricks, Data Factory (ETL/ELT)", "Streaming : Event Hubs + Stream Analytics"] },
            { h: 'Arbre de décision rapide', bullets: ["Migration SQL Server avec fonctionnalités d'instance → **Managed Instance**", "Nouvelle application SaaS multi-locataires avec centaines de petites bases → **elastic pool**", "Base > 4 To, montée en charge rapide → **Hyperscale**", "Distribution mondiale, latence < 10 ms, schéma flexible → **Cosmos DB**", "Données analytiques massives → Data Lake Gen2 + Fabric/Synapse"] }
          ],
          keypoints: ["SQL MI = compatibilité SQL Server maximale", "Elastic pool = nombreuses petites bases", "Hyperscale = très grandes bases", "Data Lake Gen2 = espace de noms hiérarchique"]
        }
      ]
    },
    {
      title: 'Continuité d\'activité',
      lessons: [
        {
          title: 'Haute disponibilité, sauvegarde et reprise',
          sections: [
            { h: 'Haute disponibilité', bullets: ["**Zones de disponibilité** : services zonaux (VM dans une zone) vs **redondants interzones** (ZRS, SQL zone-redundant, App Service zone redundancy)", "Groupes à haute disponibilité (availability sets) : domaines d'erreur et de mise à jour dans un datacenter", "SLA composite : multiplier les SLA des composants en série ; ajouter de la redondance en parallèle"] },
            { h: 'Sauvegarde', bullets: ["**Azure Backup** : VM, disques, Files, SQL/SAP HANA dans VM, Blob ; coffres Recovery Services / Backup vault", "Stratégies de rétention (quotidienne, hebdomadaire, mensuelle, annuelle)", "**Suppression réversible** et **immutabilité** des coffres, protection multi-utilisateur (Resource Guard) contre les rançongiciels", "Sauvegardes géoredondantes et **restauration interrégion**"] },
            { h: 'Reprise après sinistre', bullets: ["**Azure Site Recovery** : réplication de VM (Azure → Azure, VMware/Hyper-V → Azure), plans de récupération, **tests de basculement** sans impact", "SQL : **failover groups** (bascule automatique, écouteur unique) / géoréplication active", "Cosmos DB : multi-régions, basculement automatique", "Stockage : GRS/GZRS + basculement du compte", "Trafic : **Front Door** / **Traffic Manager** (priorité, pondéré, performance, géographique)"] },
            { h: 'Aligner avec les exigences', p: "Pour chaque charge : définir **RTO/RPO**, puis choisir : sauvegarde seule (heures), Site Recovery (minutes), actif/passif avec failover group, actif/actif multi-région (Front Door + Cosmos DB multi-écriture). Tester régulièrement." }
          ],
          keypoints: ["Zonal vs zone-redundant", "Backup : immuable + soft delete", "Site Recovery : tests de basculement sans impact", "SQL failover groups = écouteur unique"]
        }
      ]
    },
    {
      title: 'Infrastructure',
      lessons: [
        {
          title: 'Calcul et intégration applicative',
          sections: [
            { h: 'Choisir le calcul', bullets: ["**VM / VM Scale Sets** : contrôle total, lift-and-shift ; **Azure Virtual Desktop**", "**App Service** : web/API PaaS ; **Functions** : événementiel", "**Container Apps** : microservices serverless (KEDA, Dapr) ; **AKS** : Kubernetes complet", "**Azure Batch** / HPC ; **Azure Spring Apps** en retrait → Container Apps", "Critères : contrôle, compétences, montée en charge, coût, portabilité"] },
            { h: "Intégration d'applications", bullets: ["**API Management** : façade unique, sécurité, quotas, versions", "Messagerie : **Service Bus** (transactions, ordre), **Event Grid** (événements réactifs), **Event Hubs** (streaming)", "**Logic Apps** : workflows et connecteurs (intégration SaaS, B2B)", "Mise en cache : Redis ; CDN / Front Door"] },
            { h: 'Migration', bullets: ["**Azure Migrate** : découverte, évaluation (dimensionnement, coûts, dépendances), migration de serveurs", "**Database Migration Service** : SQL Server → SQL MI/DB (en ligne ou hors ligne)", "**Data Box** pour les gros volumes hors ligne ; AzCopy / Storage Mover en ligne", "App Service Migration Assistant pour les applications web"] }
          ],
          keypoints: ["Container Apps vs AKS : simplicité vs contrôle", "Service Bus / Event Grid / Event Hubs", "Azure Migrate = découverte + évaluation + migration"]
        },
        {
          title: 'Réseau',
          sections: [
            { h: 'Topologies', bullets: ["**Hub-and-spoke** : VNet hub (pare-feu, passerelles, Bastion) + spokes appairés ; routage via **UDR** vers **Azure Firewall**", "**Virtual WAN** : hub managé par Microsoft, transit automatique, grand nombre de sites/succursales", "**VNet peering** (non transitif) ; peering global entre régions", "Plan d'adressage IP sans chevauchement avec l'on-premises"] },
            { h: 'Connectivité et accès privé', bullets: ["**ExpressRoute** (circuits, peering privé et Microsoft, Global Reach, FastPath) ; **VPN Gateway** (S2S, P2S)", "**Private Endpoint** (Private Link) : exposer un PaaS sur une IP privée + zones DNS privées `privatelink.*`", "**Service endpoints** : plus simples, trafic sur le backbone, mais le PaaS garde son IP publique", "**Azure Bastion** : RDP/SSH sans IP publique", "**DNS Private Resolver** pour le DNS hybride"] },
            { h: 'Équilibrage et sécurité', bullets: ["Global HTTP → **Front Door** (WAF, CDN) ; Global non-HTTP → **Traffic Manager** (DNS)", "Régional HTTP → **Application Gateway** (WAF) ; régional L4 → **Load Balancer**", "**Azure Firewall** (Standard/Premium : IDPS, inspection TLS), **NSG** et **ASG**, **DDoS Protection**", "Correspondance AWS : TGW ↔ Virtual WAN/hub ; PrivateLink ↔ Private Link ; Network Firewall ↔ Azure Firewall"] }
          ],
          keypoints: ["Hub-spoke + Azure Firewall + UDR", "Private Endpoint + DNS privé", "Front Door (global HTTP) / Traffic Manager (DNS) / App Gateway (régional L7) / LB (L4)", "Virtual WAN pour beaucoup de sites"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Étude de cas : architecture Azure d\'une application critique',
      goal: "Concevoir, sur le modèle des études de cas de l'examen, l'architecture Azure d'une application critique avec justification de chaque choix. Exercice de conception, sans coût.",
      minutes: 120, env: 'Draw.io / Excalidraw + éditeur',
      steps: [
        { t: "Contexte : application web .NET + SQL Server avec SQL Agent et requêtes inter-bases, 3 To, utilisateurs en Europe, RTO 30 min / RPO 5 min, authentification des employés via l'AD local, exigence : aucune base exposée sur Internet." },
        { t: "Dessinez la hiérarchie de **groupes d'administration** et d'abonnements (landing zone CAF) et 3 Azure Policy clés." },
        { t: "Concevez l'**identité** : synchronisation Entra Connect (hash), accès conditionnel, PIM pour les administrateurs." },
        { t: "Choisissez la **base** (indice : SQL Agent + inter-bases) et justifiez le niveau de service." },
        { t: "Concevez le **réseau** : hub-spoke, Azure Firewall, Private Endpoints + DNS privé, Front Door avec WAF, ExpressRoute ou VPN." },
        { t: "Concevez la **continuité** : zones, failover group SQL vers la région jumelée, Site Recovery ou redéploiement IaC, Azure Backup immuable." },
        { t: "Définissez la **supervision** : Log Analytics central, diagnostics imposés par Policy, Application Insights, alertes et groupes d'actions." },
        { t: "Comparez avec l'équivalent AWS que vous auriez conçu (SAP) : mettez les services en correspondance.", check: "Chaque exigence du contexte est couverte par au moins un choix justifié." }
      ]
    }
  ],
  quiz: [
    { q: "Quelle certification faut-il en plus d'AZ-305 pour obtenir le titre Azure Solutions Architect Expert ?", options: ["AZ-104", "AZ-204", "AZ-900", "AZ-400"], answer: 0, explain: "AZ-104 (Administrator Associate) est le prérequis obligatoire." },
    { q: "Une application utilise SQL Agent et des requêtes inter-bases. Quelle cible PaaS minimise les changements ?", options: ["Azure SQL Managed Instance", "Azure SQL Database single", "Cosmos DB", "Azure Database for MySQL"], answer: 0, explain: "MI offre les fonctionnalités de niveau instance de SQL Server." },
    { q: "Une plateforme SaaS héberge 500 petites bases aux pics d'activité non simultanés. Quelle option est la plus économique ?", options: ["Un elastic pool Azure SQL", "500 bases Business Critical", "SQL Server sur 500 VM", "Hyperscale pour chaque base"], answer: 0, explain: "Les bases partagent les ressources du pool." },
    { q: "Quel service donne un accès administrateur juste-à-temps, avec approbation et durée limitée ?", options: ["Privileged Identity Management (PIM)", "Accès conditionnel", "Azure Policy", "Entra Connect"], answer: 0, explain: "PIM active un rôle pour une durée définie après justification." },
    { q: "Comment rendre un compte de stockage accessible uniquement via une IP privée de votre VNet ?", options: ["Private Endpoint avec zone DNS privée, et désactivation de l'accès public", "Service endpoint seul", "NSG sur le compte de stockage", "Une SAS"], answer: 0, explain: "Le Private Endpoint attribue une IP privée au service PaaS." },
    { q: "Quel service d'équilibrage global pour une application HTTP multi-région avec WAF et cache ?", options: ["Azure Front Door", "Traffic Manager", "Load Balancer", "Application Gateway"], answer: 0, explain: "Traffic Manager est DNS (non HTTP-aware) ; App Gateway est régional." },
    { q: "Quelle méthode d'authentification hybride est recommandée pour sa résilience ?", options: ["Synchronisation du hash de mot de passe", "Fédération AD FS", "Authentification pass-through seule", "Comptes cloud séparés"], answer: 0, explain: "Elle ne dépend pas de l'infrastructure locale pour s'authentifier." },
    { q: "Comment garantir un écouteur unique et une bascule automatique d'Azure SQL vers une autre région ?", options: ["Un failover group (groupe de basculement automatique)", "La géoréplication de Blob", "Azure Backup", "Site Recovery pour SQL Database"], answer: 0, explain: "Les applications utilisent le point de terminaison du groupe, qui suit la bascule." },
    { q: "Quel effet Azure Policy déploie automatiquement les paramètres de diagnostic manquants ?", options: ["deployIfNotExists", "deny", "audit", "disabled"], answer: 0, explain: "Il nécessite une identité managée pour la remédiation." },
    { q: "Une entreprise a 80 succursales à relier à Azure avec transit automatique. Quelle topologie ?", options: ["Azure Virtual WAN", "VNet peering entre 80 VNets", "Un seul VPN Gateway basique", "Service endpoints"], answer: 0, explain: "Virtual WAN gère le transit et la connectivité à grande échelle." },
    { q: "Comment tester une reprise Azure Site Recovery sans impacter la production ?", options: ["Un test de basculement dans un réseau isolé", "Arrêter la production", "Supprimer la réplication", "Un basculement non planifié"], answer: 0, explain: "Le test failover crée des VM dans un VNet de test." },
    { q: "Quelle option protège les sauvegardes Azure contre la suppression malveillante par un administrateur ?", options: ["Coffre immuable + soft delete + Resource Guard (autorisation multi-utilisateur)", "Stockage LRS", "Un tag", "Un rôle Lecteur"], answer: 0, explain: "Ces protections limitent l'impact d'un compte administrateur compromis." }
  ],
  flashcards: [
    ["Prérequis du titre Azure Solutions Architect Expert", "AZ-104 + AZ-305"],
    ["Groupes d'administration CAF", "Plateforme (Identité, Gestion, Connectivité), Landing zones (Corp, Online), Sandbox, Décommissionné"],
    ["Effets Azure Policy", "deny, audit, append, modify, deployIfNotExists, auditIfNotExists, disabled"],
    ["PIM", "Élévation de privilèges juste-à-temps, approuvée, limitée dans le temps"],
    ["Authentification hybride recommandée", "Password hash synchronization (+ SSO transparent)"],
    ["SQL Database vs Managed Instance", "DB : PaaS base unique · MI : compatibilité instance SQL Server (Agent, inter-bases, CLR)"],
    ["Niveaux vCore Azure SQL", "General Purpose, Business Critical, Hyperscale"],
    ["Elastic pool", "Ressources partagées entre de nombreuses bases aux pics non simultanés"],
    ["Data Lake Storage Gen2", "Blob + espace de noms hiérarchique pour l'analytique"],
    ["Zonal vs zone-redundant", "Zonal : épinglé à une zone · Zone-redundant : réparti automatiquement sur les zones"],
    ["Site Recovery", "Réplication et basculement de VM, plans de récupération, tests sans impact"],
    ["SQL failover group", "Bascule automatique multi-région avec écouteur lecture-écriture unique"],
    ["Équilibreurs Azure", "Front Door (global HTTP) · Traffic Manager (DNS) · App Gateway (régional L7) · Load Balancer (L4)"],
    ["Private Endpoint vs Service endpoint", "PE : IP privée pour le PaaS · SE : trafic sur le backbone, IP publique conservée"],
    ["Hub-spoke", "Hub : pare-feu, passerelles, Bastion · Spokes appairés, UDR vers le pare-feu"],
    ["Azure Migrate", "Découverte, évaluation (dimensionnement, coûts, dépendances), migration"]
  ]
});
