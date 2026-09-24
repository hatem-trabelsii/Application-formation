ACADEMY.courses.push({
  id: 'az-900', phase: 1, kind: 'cert', order: 2,
  title: 'Azure Fundamentals', icon: '🔷',
  vendor: 'Azure', level: 'Foundational', code: 'AZ-900',
  hours: '~20h', cost: '~165€', priority: 4,
  subtitle: "Les fondamentaux de Microsoft Azure : concepts cloud, architecture, services principaux, gouvernance et coûts.",
  description: "AZ-900 valide que vous savez parler d'Azure avec vos interlocuteurs : hiérarchie des ressources, régions, services de calcul et de stockage, identité avec Microsoft Entra ID, gouvernance (Policy, RBAC, verrous) et gestion des coûts. En parallèle d'AWS CP, vous construisez un vocabulaire bimodal AWS ↔ Azure.",
  searchTerm: 'Azure Fundamentals AZ-900', searchTermEn: 'AZ-900 Azure Fundamentals',
  exam: {
    duration: '45 min', questions: '40–60', passing: '700/1000',
    domains: [['Décrire les concepts du cloud', '25–30%'], ["Décrire l'architecture et les services Azure", '35–40%'], ['Décrire la gestion et la gouvernance Azure', '30–35%']],
    notes: "Formats variés : QCM, glisser-déposer, oui/non en série. La certification Fundamentals n'expire pas."
  },
  outcomes: [
    "Expliquer IaaS, PaaS, SaaS et le modèle de responsabilité partagée côté Azure",
    "Décrire la hiérarchie : groupes d'administration › abonnements › groupes de ressources › ressources",
    "Situer régions, paires de régions et zones de disponibilité",
    "Choisir entre VM, App Service, Container Instances, AKS et Functions",
    "Différencier les options de stockage et de redondance (LRS, ZRS, GRS, GZRS)",
    "Comprendre Microsoft Entra ID, MFA, accès conditionnel et Zero Trust",
    "Gouverner avec Azure Policy, RBAC, verrous de ressources et tags",
    "Maîtriser les coûts : calculatrice de prix, TCO, Cost Management"
  ],
  prerequisites: ["Aucun prérequis technique", "Idéalement : avoir suivi le module AWS Cloud Practitioner (vocabulaire commun)"],
  resources: [
    { label: 'Page officielle AZ-900 (Microsoft Learn)', url: 'https://learn.microsoft.com/fr-fr/credentials/certifications/azure-fundamentals/' },
    { label: 'Parcours gratuit Microsoft Learn AZ-900', url: 'https://learn.microsoft.com/fr-fr/training/courses/az-900t00' },
    { label: "Évaluation d'entraînement officielle", url: 'https://learn.microsoft.com/fr-fr/credentials/certifications/azure-fundamentals/practice/assessment?assessment-type=practice&assessmentId=23' },
    { label: 'Calculatrice de prix Azure', url: 'https://azure.microsoft.com/fr-fr/pricing/calculator/' }
  ],
  modules: [
    {
      title: 'Concepts du cloud (vus par Azure)',
      lessons: [
        {
          title: 'Modèles cloud et responsabilité partagée',
          sections: [
            { h: 'Les bénéfices du cloud selon Microsoft', bullets: ["**Haute disponibilité** et **fiabilité** (SLA)", "**Scalabilité** : verticale (plus gros) ou horizontale (plus nombreux)", "**Élasticité** : ajustement automatique à la demande", "**Prévisibilité** des performances et des coûts", "**Sécurité** et **gouvernance**", "**Gérabilité** : du cloud (surveillance) et dans le cloud (portail, CLI, API)"] },
            { h: 'CapEx vs OpEx et modèle de consommation', p: "Le cloud transforme les **dépenses d'investissement** (CapEx : acheter des serveurs) en **dépenses opérationnelles** (OpEx : payer ce qu'on consomme). On ne paie pas de capacité inutilisée." },
            { h: 'Responsabilité partagée', p: "Quel que soit le modèle, le client reste **toujours** responsable de ses **données**, de ses **appareils** et de ses **comptes/identités**. Microsoft est toujours responsable du **physique** (datacenter, réseau, hôtes).", bullets: ["IaaS : vous gérez OS, middleware, applications", "PaaS : vous gérez applications et données", "SaaS : vous gérez surtout les accès et les données"] },
            { h: 'Modèles de déploiement', bullets: ["Public, privé, **hybride**", "**Multicloud** : plusieurs fournisseurs", "**Azure Arc** : gérer depuis Azure des ressources on-premises ou d'autres clouds", "**Azure VMware Solution** : exécuter VMware dans Azure"] }
          ],
          keypoints: ["Client toujours responsable : données, appareils, identités", "Scalabilité = capacité à grandir ; élasticité = ajustement automatique", "Azure Arc = gestion hybride et multicloud"]
        }
      ]
    },
    {
      title: 'Architecture et services Azure',
      lessons: [
        {
          title: 'Infrastructure physique et hiérarchie des ressources',
          sections: [
            { h: 'Régions et zones', bullets: ["**Région** : ensemble de datacenters (ex. France Central à Paris)", "**Paire de régions** : deux régions d'une même géographie, mises à jour séquentiellement, priorité de reprise", "**Zones de disponibilité** : au moins 3 datacenters séparés dans une région compatible", "**Régions souveraines** : Azure Government, Azure China (21Vianet)"] },
            { h: 'La hiérarchie de gestion', p: "À connaître par cœur, de haut en bas :", bullets: ["**Groupes d'administration** (jusqu'à 6 niveaux sous la racine)", "**Abonnements** : frontière de facturation et de contrôle d'accès", "**Groupes de ressources** : conteneur logique ; une ressource appartient à UN seul groupe", "**Ressources** : VM, compte de stockage, base de données…", "Les permissions et stratégies **héritent** vers le bas"] },
            { h: 'Azure Resource Manager (ARM)', p: "Toutes les demandes (portail, CLI, PowerShell, SDK) passent par **ARM**, la couche de déploiement et de gestion. Les modèles ARM (JSON) et **Bicep** permettent l'infrastructure as code.", code: { lang: 'bash', src: '# Créer un groupe de ressources puis une VM avec Azure CLI\naz group create --name rg-demo --location francecentral\naz vm create --resource-group rg-demo --name vm-demo \\\n  --image Ubuntu2204 --admin-username azureuser --generate-ssh-keys' } }
          ],
          keypoints: ["Hiérarchie : MG › Abonnement › RG › Ressource", "Supprimer un groupe de ressources supprime tout son contenu", "ARM = point d'entrée unique ; Bicep/ARM templates = IaC"]
        },
        {
          title: 'Calcul et réseau',
          sections: [
            { h: 'Options de calcul', bullets: ["**Machines virtuelles** : IaaS, contrôle total", "**Virtual Machine Scale Sets** : groupe de VM identiques avec autoscaling", "**Availability Sets** : domaines d'erreur et de mise à jour", "**Azure Virtual Desktop** : postes de travail virtualisés", "**Azure Container Instances** : un conteneur sans orchestrateur ; **Container Apps** : microservices serverless", "**AKS** : Kubernetes managé", "**App Service** : PaaS pour applications web et API", "**Azure Functions** : serverless événementiel"] },
            { h: 'Réseau', bullets: ["**Virtual Network (VNet)** et sous-réseaux ; **peering** entre VNets", "**VPN Gateway** (via Internet) vs **ExpressRoute** (connexion privée)", "**Azure DNS** ; **NSG** (Network Security Group) pour filtrer", "Points de terminaison publics vs **Private Endpoint** (Private Link)", "Load Balancer (couche 4), Application Gateway (couche 7), Front Door (global)"] },
            { h: 'Correspondances AWS ↔ Azure', bullets: ["EC2 ↔ Virtual Machines ; Auto Scaling ↔ VM Scale Sets", "Lambda ↔ Functions ; Elastic Beanstalk ↔ App Service", "EKS ↔ AKS ; VPC ↔ VNet ; Direct Connect ↔ ExpressRoute", "IAM Identity Center ↔ Microsoft Entra ID"] }
          ],
          keypoints: ["App Service = PaaS web ; Functions = serverless", "ExpressRoute = privé, ne passe pas par Internet", "NSG ≈ Security Group AWS"]
        },
        {
          title: 'Stockage et bases de données',
          sections: [
            { h: 'Le compte de stockage', p: "Un **compte de stockage** regroupe plusieurs services : **Blob** (objets), **Files** (partages SMB/NFS), **Queue** (messages), **Table** (NoSQL simple), et les **disques managés** pour les VM." },
            { h: "Niveaux d'accès Blob", bullets: ["**Hot** : accès fréquent", "**Cool** : ≥ 30 jours", "**Cold** : ≥ 90 jours", "**Archive** : ≥ 180 jours, hors ligne, réhydratation en heures"] },
            { h: 'Redondance', bullets: ["**LRS** : 3 copies dans un datacenter", "**ZRS** : 3 copies réparties sur 3 zones", "**GRS** : LRS + copie asynchrone dans la région jumelée", "**GZRS** : ZRS + région jumelée", "Variantes **RA-** : lecture possible dans la région secondaire"] },
            { h: 'Migration et bases de données', bullets: ["**AzCopy**, **Storage Explorer**, **Azure File Sync**", "**Azure Migrate** : évaluer et migrer ; **Data Box** : transfert physique", "Azure SQL Database, Azure Database for PostgreSQL/MySQL, **Cosmos DB** (NoSQL multi-modèle mondial)"] }
          ],
          keypoints: ["Blob : Hot / Cool / Cold / Archive", "LRS < ZRS < GRS < GZRS en résilience", "Cosmos DB = NoSQL distribué mondialement"]
        },
        {
          title: 'Identité, accès et sécurité',
          sections: [
            { h: 'Microsoft Entra ID', p: "Anciennement Azure Active Directory : le service d'**identité cloud** de Microsoft (utilisateurs, groupes, applications, SSO).", bullets: ["**Entra Connect** : synchronise l'AD local avec Entra ID", "**Entra Domain Services** : services de domaine managés (LDAP, Kerberos)", "**B2B** (invités partenaires) et **External ID / B2C** (clients)"] },
            { h: "Méthodes d'authentification", bullets: ["**MFA** : quelque chose que je sais, que j'ai, que je suis", "**Sans mot de passe** : Windows Hello, Authenticator, clés FIDO2", "**Accès conditionnel** : règles si/alors sur le signal (utilisateur, lieu, appareil, risque)", "**SSO** : une seule connexion pour plusieurs applications"] },
            { h: 'Modèles de sécurité', bullets: ["**Zero Trust** : vérifier explicitement, moindre privilège, supposer la compromission", "**Défense en profondeur** : physique, identité, périmètre, réseau, calcul, application, données", "**Microsoft Defender for Cloud** : posture de sécurité et protection des charges", "**RBAC Azure** : rôles Propriétaire, Contributeur, Lecteur… attribués à une étendue"] }
          ],
          keypoints: ["Entra ID = identité cloud (ex-Azure AD)", "Accès conditionnel = si/alors basé sur des signaux", "Zero Trust : vérifier explicitement, moindre privilège, supposer la brèche"]
        }
      ]
    },
    {
      title: 'Gestion et gouvernance',
      lessons: [
        {
          title: 'Coûts, gouvernance et conformité',
          sections: [
            { h: 'Facteurs de coût et outils', bullets: ["Facteurs : type de ressource, consommation, maintenance, région, bande passante (sortante), réservations", "**Calculatrice de prix** : estimer des services Azure", "**Calculatrice TCO** : comparer on-premises et Azure", "**Microsoft Cost Management** : analyser, budgets, alertes", "**Tags** : ventiler les coûts par projet, environnement, propriétaire"] },
            { h: 'Gouvernance', bullets: ["**Microsoft Purview** : gouvernance et conformité des données", "**Azure Policy** : imposer des règles (ex. régions autorisées), audit et remédiation", "**Verrous de ressources** : `CanNotDelete` ou `ReadOnly`, même pour un propriétaire", "**Service Trust Portal** : rapports de conformité Microsoft"] },
            { h: 'Outils de gestion et de supervision', bullets: ["Portail Azure, **Cloud Shell**, Azure CLI, PowerShell", "**Modèles ARM / Bicep** : IaC déclaratif", "**Azure Advisor** : recommandations (fiabilité, sécurité, performances, coûts, excellence opérationnelle)", "**Azure Service Health** : état des services et incidents qui vous concernent", "**Azure Monitor** : métriques, **Log Analytics**, alertes, **Application Insights**"] },
            { h: 'SLA', p: "Un **SLA** (contrat de niveau de service) garantit une disponibilité (ex. 99,9 %). Combiner deux services en série multiplie les SLA (99,9 % × 99,95 % ≈ 99,85 %). Les services en préversion n'ont pas de SLA." }
          ],
          keypoints: ["Policy = règles sur les ressources ; RBAC = qui peut faire quoi ; Lock = empêcher suppression/modif", "Advisor = recommandations ; Service Health = incidents Azure", "TCO calculator = comparer avec l'on-premises"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Premiers pas avec Azure CLI dans Cloud Shell',
      goal: "Créer un groupe de ressources, un compte de stockage et un conteneur Blob, puis tout supprimer proprement.",
      minutes: 30, env: 'Portail Azure + Cloud Shell (compte gratuit)',
      steps: [
        { t: "Créez un compte gratuit Azure (crédit offert le premier mois) et ouvrez **Cloud Shell** (Bash) depuis le portail." },
        { t: "Créez un groupe de ressources en France Central.", cmd: "az group create -n rg-az900-lab -l francecentral" },
        { t: "Créez un compte de stockage LRS (nom unique, minuscules et chiffres).", cmd: "az storage account create -n staz900$RANDOM -g rg-az900-lab -l francecentral --sku Standard_LRS" },
        { t: "Créez un conteneur et téléversez un fichier.", cmd: "echo 'Bonjour Azure' > hello.txt\naz storage container create --account-name NOM_COMPTE -n demo --auth-mode login\naz storage blob upload --account-name NOM_COMPTE -c demo -f hello.txt -n hello.txt --auth-mode login", hint: "Si l'upload est refusé, attribuez-vous le rôle « Storage Blob Data Contributor » sur le compte de stockage." },
        { t: "Ajoutez un **verrou** `CanNotDelete` sur le groupe de ressources et tentez de le supprimer : observez le refus.", cmd: "az lock create -n no-delete -g rg-az900-lab --lock-type CanNotDelete\naz group delete -n rg-az900-lab --yes" },
        { t: "Ajoutez un tag `env=lab` au groupe et retrouvez-le dans Cost Management." , cmd: "az group update -n rg-az900-lab --set tags.env=lab" }
      ],
      cleanup: "Supprimez le verrou puis le groupe : `az lock delete -n no-delete -g rg-az900-lab && az group delete -n rg-az900-lab --yes`."
    }
  ],
  quiz: [
    { q: "Dans quel ordre s'organise la hiérarchie Azure, du plus large au plus fin ?", options: ["Groupes d'administration › Abonnements › Groupes de ressources › Ressources", "Abonnements › Groupes d'administration › Ressources › Groupes de ressources", "Groupes de ressources › Abonnements › Ressources", "Régions › Zones › Abonnements › Ressources"], answer: 0, explain: "Les stratégies et rôles appliqués en haut héritent vers le bas." },
    { q: "Quel service Azure est l'équivalent le plus proche d'AWS Lambda ?", options: ["Azure Functions", "Azure App Service", "Azure Container Instances", "Azure Batch"], answer: 0, explain: "Functions = code serverless déclenché par événements." },
    { q: "Quelle option de redondance réplique les données sur 3 zones de disponibilité de la région principale ET dans la région jumelée ?", options: ["GZRS", "GRS", "ZRS", "LRS"], answer: 0, explain: "GZRS = ZRS dans la région primaire + réplication géographique." },
    { q: "Quelle fonctionnalité empêche la suppression accidentelle d'une ressource, même par un propriétaire ?", options: ["Un verrou de ressource CanNotDelete", "Une stratégie Azure Policy", "Un rôle RBAC Lecteur", "Un tag"], answer: 0, explain: "Les verrous s'appliquent à tous les utilisateurs, y compris les propriétaires, jusqu'à leur retrait." },
    { q: "Quel service permet d'imposer que les ressources ne soient créées que dans les régions européennes ?", options: ["Azure Policy", "Azure Advisor", "Microsoft Entra ID", "Azure Service Health"], answer: 0, explain: "Azure Policy évalue et impose des règles de conformité sur les ressources." },
    { q: "Dans le modèle de responsabilité partagée, de quoi le client est-il TOUJOURS responsable ?", options: ["Les données, les appareils et les comptes/identités", "Les hôtes physiques", "Le réseau physique du datacenter", "L'hyperviseur"], answer: 0, explain: "Quel que soit le modèle (IaaS, PaaS, SaaS), ces trois éléments restent au client." },
    { q: "Quel outil compare le coût d'une infrastructure on-premises à son équivalent dans Azure ?", options: ["La calculatrice TCO", "La calculatrice de prix", "Azure Advisor", "Cost Management budgets"], answer: 0, explain: "TCO = Total Cost of Ownership." },
    { q: "Quelle connexion relie un datacenter à Azure par un lien privé qui ne passe pas par Internet ?", options: ["ExpressRoute", "VPN Gateway", "Azure Front Door", "VNet peering"], answer: 0, explain: "ExpressRoute ≈ AWS Direct Connect." },
    { q: "Quel principe NE fait PAS partie du modèle Zero Trust ?", options: ["Faire confiance à tout ce qui est dans le réseau interne", "Vérifier explicitement", "Utiliser l'accès du moindre privilège", "Supposer la compromission"], answer: 0, explain: "Zero Trust supprime la confiance implicite liée à la position réseau." },
    { q: "Quel service affiche les incidents et maintenances Azure qui affectent VOS ressources ?", options: ["Azure Service Health", "Azure Monitor Metrics", "Azure Advisor", "Microsoft Defender for Cloud"], answer: 0, explain: "Service Health personnalise l'état d'Azure selon vos abonnements et régions." },
    { q: "Quel niveau d'accès Blob est hors ligne et nécessite une réhydratation ?", options: ["Archive", "Cold", "Cool", "Hot"], answer: 0, explain: "Archive : stockage le moins cher, lecture après réhydratation (jusqu'à plusieurs heures)." },
    { q: "Quelle fonctionnalité d'Entra ID applique des règles « si / alors » selon l'emplacement, l'appareil ou le risque ?", options: ["L'accès conditionnel", "Le SSO", "Entra Connect", "Les unités administratives"], answer: 0, explain: "L'accès conditionnel peut exiger la MFA ou bloquer l'accès selon des signaux." }
  ],
  flashcards: [
    ["Hiérarchie Azure (haut → bas)", "Groupes d'administration › Abonnements › Groupes de ressources › Ressources"],
    ["Paire de régions : intérêt", "Réplication (GRS), mises à jour séquentielles, priorité de reprise en cas de panne majeure"],
    ["LRS / ZRS / GRS / GZRS", "LRS : 3 copies 1 datacenter · ZRS : 3 zones · GRS : LRS + région jumelée · GZRS : ZRS + région jumelée"],
    ["Niveaux Blob et durées minimales", "Hot · Cool (30 j) · Cold (90 j) · Archive (180 j, hors ligne)"],
    ["Entra ID, c'est…", "Le service d'identité cloud de Microsoft (ex-Azure Active Directory)"],
    ["Zero Trust : 3 principes", "Vérifier explicitement · moindre privilège · supposer la compromission"],
    ["Azure Policy vs RBAC", "Policy : QUE peut-on créer/configurer · RBAC : QUI peut faire quoi"],
    ["Types de verrous", "CanNotDelete (lecture/modif OK, pas de suppression) · ReadOnly (lecture seule)"],
    ["Advisor vs Service Health", "Advisor : recommandations d'optimisation · Service Health : incidents et maintenances Azure qui vous concernent"],
    ["ExpressRoute vs VPN Gateway", "ExpressRoute : lien privé dédié · VPN Gateway : tunnel chiffré via Internet"],
    ["Azure Arc", "Gérer depuis Azure des serveurs, Kubernetes et bases hors Azure (on-prem, autres clouds)"],
    ["Calculatrice de prix vs TCO", "Prix : estimer des services Azure · TCO : comparer on-premises vs Azure"],
    ["Scalabilité vs élasticité", "Scalabilité : capacité à monter en charge · Élasticité : ajustement automatique à la demande"],
    ["Équivalents AWS → Azure : EC2, Lambda, VPC, EKS", "Virtual Machines, Functions, VNet, AKS"],
    ["Défense en profondeur : couches", "Physique, identité & accès, périmètre, réseau, calcul, application, données"],
    ["SLA composite de deux services en série", "Produit des SLA (ex. 99,9 % × 99,95 % ≈ 99,85 %)"]
  ]
});
