ACADEMY.courses.push({
  id: 'az-204', phase: 2, kind: 'cert', order: 3,
  title: 'Azure Developer Associate', icon: '🧩',
  vendor: 'Azure', level: 'Associate', code: 'AZ-204',
  hours: '~60h', cost: '~165€', priority: 3,
  subtitle: "Développer pour Azure : App Service, Functions, conteneurs, Cosmos DB, Blob Storage, sécurité, messagerie et supervision.",
  description: "AZ-204 est le pendant Azure de DVA et le prérequis d'AZ-400 (DevOps Engineer Expert) en phase 3. On y construit et déploie des applications sur App Service, Functions et Container Apps, on stocke dans Blob et Cosmos DB, on sécurise avec Entra ID, Managed Identity et Key Vault, et on intègre avec Service Bus, Event Grid et API Management.",
  searchTerm: 'AZ-204 Azure Developer', searchTermEn: 'AZ-204 Azure Developer Associate',
  exam: {
    duration: '100 min', questions: '40–60 (+ étude de cas)', passing: '700/1000',
    domains: [['Développer des solutions de calcul Azure', '25–30%'], ['Développer pour le stockage Azure', '15–20%'], ['Implémenter la sécurité Azure', '15–20%'], ['Superviser, dépanner et optimiser', '5–10%'], ['Se connecter aux services Azure et tiers', '20–25%']],
    notes: "Examen « open book » : accès à Microsoft Learn pendant l'épreuve (temps limité). Renouvellement annuel gratuit en ligne."
  },
  outcomes: [
    "Déployer des applications web sur App Service (slots, autoscale, configuration)",
    "Écrire des Azure Functions (déclencheurs, liaisons, plans d'hébergement, Durable Functions)",
    "Publier des conteneurs dans ACR et les exécuter sur Container Apps / ACI",
    "Programmer Blob Storage (SDK, SAS, cycle de vie) et Cosmos DB (partitionnement, cohérence, change feed)",
    "Sécuriser avec Entra ID (MSAL), Managed Identity, Key Vault et App Configuration",
    "Intégrer via API Management, Event Grid, Event Hubs, Service Bus et Queue Storage",
    "Superviser avec Application Insights"
  ],
  prerequisites: ["AZ-900", "1–2 ans de développement (C#, Java, Python ou JavaScript)"],
  resources: [
    { label: 'Page officielle AZ-204', url: 'https://learn.microsoft.com/fr-fr/credentials/certifications/azure-developer/' },
    { label: 'Parcours Microsoft Learn AZ-204', url: 'https://learn.microsoft.com/fr-fr/training/courses/az-204t00' },
    { label: 'Documentation Azure Functions', url: 'https://learn.microsoft.com/fr-fr/azure/azure-functions/' },
    { label: 'Documentation Cosmos DB', url: 'https://learn.microsoft.com/fr-fr/azure/cosmos-db/' }
  ],
  modules: [
    {
      title: 'Solutions de calcul',
      lessons: [
        {
          title: 'Azure App Service',
          sections: [
            { h: "Plans App Service", p: "Une application web tourne dans un **App Service Plan** qui définit la région, la taille et le nombre d'instances. Toutes les apps d'un plan partagent ses ressources.", bullets: ["Free / Shared : tests, pas de SLA", "Basic : dev/test, scale manuel", "**Standard** : autoscale, **slots de déploiement**, sauvegardes", "Premium v3 : plus de performance, VNet, plus de slots", "Isolated (App Service Environment) : réseau dédié"] },
            { h: 'Slots de déploiement', p: "Un **slot** (ex. `staging`) est une app à part entière. On y déploie, on préchauffe, puis on fait un **swap** avec la production : zéro interruption et retour arrière immédiat par un nouveau swap.", bullets: ["Paramètres **« slot setting »** (collants) : restent attachés au slot lors du swap (ex. chaîne de connexion de staging)", "Routage d'un pourcentage du trafic vers un slot (testing in production)"] },
            { h: 'Configuration et déploiement', code: { lang: 'bash', src: 'az webapp up --name app-commandes --runtime "JAVA:21-java21" --sku S1\naz webapp config appsettings set -g rg -n app-commandes \\\n  --settings SPRING_PROFILES_ACTIVE=prod\naz webapp deployment slot create -g rg -n app-commandes --slot staging\naz webapp deployment slot swap -g rg -n app-commandes --slot staging' }, bullets: ["Les **App settings** deviennent des variables d'environnement", "Autoscale sur métrique (CPU, file) ou planning", "Journaux : `az webapp log tail`", "Authentification intégrée « Easy Auth » (Entra ID, Google…)"] }
          ],
          keypoints: ["Slots dès le niveau Standard", "Swap = zéro interruption + rollback", "Slot settings collants", "App settings = variables d'environnement"]
        },
        {
          title: 'Azure Functions et Durable Functions',
          sections: [
            { h: 'Déclencheurs et liaisons', p: "Une fonction a **un seul déclencheur** (HTTP, Timer, Queue, Blob, Service Bus, Event Grid, Event Hub, Cosmos DB…) et des **liaisons** d'entrée/sortie déclaratives qui évitent d'écrire le code d'accès.", code: { lang: 'python', src: 'import azure.functions as func\napp = func.FunctionApp()\n\n@app.route(route="commandes", methods=["POST"], auth_level=func.AuthLevel.FUNCTION)\n@app.queue_output(arg_name="msg", queue_name="commandes", connection="AzureWebJobsStorage")\ndef creer(req: func.HttpRequest, msg: func.Out[str]) -> func.HttpResponse:\n    msg.set(req.get_body().decode())\n    return func.HttpResponse("acceptée", status_code=202)' } },
            { h: "Plans d'hébergement", bullets: ["**Consommation** : paiement à l'exécution, scale à zéro, timeout 5 min par défaut (10 max)", "**Flex Consumption** : scale rapide, VNet, instances toujours prêtes optionnelles", "**Premium** : instances préchauffées (pas de cold start), VNet, durée illimitée", "**Dedicated** (App Service Plan) : coûts prévisibles", "`host.json` configure le runtime ; `local.settings.json` les paramètres locaux (non commité)"] },
            { h: 'Durable Functions', p: "Pour des workflows avec état : une fonction **orchestrateur** (code déterministe, rejoué) appelle des fonctions **activité**.", bullets: ["Patterns : chaînage, **fan-out/fan-in**, API HTTP asynchrone, surveillance, interaction humaine", "Entités durables pour de petits états", "L'orchestrateur ne doit pas faire d'I/O ni utiliser l'heure système directement"] }
          ],
          keypoints: ["Un déclencheur, plusieurs liaisons", "Consommation = scale à zéro, cold start ; Premium = préchauffé", "Durable : orchestrateur déterministe + activités"]
        },
        {
          title: 'Conteneurs : ACR, ACI et Container Apps',
          sections: [
            { h: 'Azure Container Registry', bullets: ["Niveaux Basic, Standard, **Premium** (géoréplication, Private Link, confiance de contenu)", "`az acr build` : construire l'image dans Azure sans Docker local", "**ACR Tasks** : builds automatiques sur commit ou mise à jour de l'image de base", "Authentification par Managed Identity (rôle `AcrPull`)"], code: { lang: 'bash', src: 'az acr create -g rg -n acrcommandes --sku Standard\naz acr build -r acrcommandes -t commandes:1.0 .\naz containerapp up -n commandes -g rg \\\n  --image acrcommandes.azurecr.io/commandes:1.0 \\\n  --ingress external --target-port 8080' } },
            { h: 'Où exécuter un conteneur ?', bullets: ["**ACI** : un conteneur ou un groupe, démarrage rapide, facturé à la seconde — tâches ponctuelles", "**Container Apps** : microservices serverless sur Kubernetes managé, **révisions**, scale à zéro avec **KEDA**, Dapr intégré", "**AKS** : contrôle complet de Kubernetes", "App Service for Containers : app web conteneurisée simple"] }
          ],
          keypoints: ["az acr build = build dans le cloud", "ACI = ponctuel ; Container Apps = microservices serverless (KEDA, révisions)", "Managed Identity + AcrPull"]
        }
      ]
    },
    {
      title: 'Stockage',
      lessons: [
        {
          title: 'Blob Storage et Cosmos DB',
          sections: [
            { h: 'Blob Storage par le code', bullets: ["Hiérarchie : compte › conteneur › blob (block, append, page)", "SDK : `BlobServiceClient` › `BlobContainerClient` › `BlobClient`", "Propriétés système et **métadonnées** personnalisées", "**Stratégie de cycle de vie** : déplacer vers Cool/Cold/Archive, supprimer", "**Baux** (leases) pour verrouiller un blob en écriture"] },
            { h: 'Signatures d\'accès partagé (SAS)', bullets: ["**User delegation SAS** : signée avec des identifiants Entra ID — la plus sûre", "**Service SAS** / **Account SAS** : signées avec la clé du compte", "**Stored access policy** : révoquer ou modifier des SAS de service a posteriori", "Toujours : durée courte, permissions minimales, HTTPS"] },
            { h: 'Cosmos DB', p: "Base NoSQL distribuée mondialement, plusieurs API (**NoSQL**, MongoDB, Cassandra, Gremlin, Table, PostgreSQL). Le choix de la **clé de partition** est crucial : forte cardinalité et répartition homogène des requêtes.", bullets: ["Débit en **RU/s** (Request Units) : provisionné, autoscale ou serverless", "5 niveaux de cohérence : **Strong**, **Bounded staleness**, **Session** (défaut), **Consistent prefix**, **Eventual**", "**Change feed** : flux des modifications (déclencheur Azure Functions)", "Procédures stockées et déclencheurs en JavaScript, transactionnels dans une partition logique"] }
          ],
          keypoints: ["User delegation SAS = la plus sûre", "Cosmos : clé de partition = décision n°1", "Cohérence : Strong › Bounded › Session (défaut) › Prefix › Eventual", "Change feed → Functions"]
        }
      ]
    },
    {
      title: 'Sécurité, intégration et supervision',
      lessons: [
        {
          title: 'Identité, Managed Identity et Key Vault',
          sections: [
            { h: 'Microsoft identity platform', bullets: ["Inscription d'application (app registration) : client ID, secrets/certificats, redirections", "**MSAL** : bibliothèque pour obtenir des jetons (OAuth 2.0 / OpenID Connect)", "Flux : authorization code + PKCE (apps utilisateurs), client credentials (service à service)", "**Microsoft Graph** : API unifiée des données Microsoft 365 et Entra"] },
            { h: 'Managed Identity : zéro secret', bullets: ["**Affectée par le système** : liée au cycle de vie de la ressource", "**Affectée par l'utilisateur** : ressource indépendante, partageable", "`DefaultAzureCredential` : même code en local (Azure CLI) et dans Azure (identité managée)"], code: { lang: 'python', src: 'from azure.identity import DefaultAzureCredential\nfrom azure.keyvault.secrets import SecretClient\n\ncred = DefaultAzureCredential()\nkv = SecretClient(vault_url="https://kv-commandes.vault.azure.net", credential=cred)\nmot_de_passe = kv.get_secret("db-password").value' } },
            { h: 'Key Vault et App Configuration', bullets: ["**Key Vault** : secrets, clés, certificats ; accès par **RBAC** ; suppression réversible (soft delete) et protection contre la purge", "Référence Key Vault dans les App settings : `@Microsoft.KeyVault(SecretUri=...)`", "**App Configuration** : configuration centralisée et **feature flags**, liée à Key Vault pour les secrets"] }
          ],
          keypoints: ["Managed Identity + DefaultAzureCredential = aucun secret dans le code", "Client credentials = service à service", "Références Key Vault dans App Service"]
        },
        {
          title: 'API Management, événements, messages et Application Insights',
          sections: [
            { h: 'API Management', bullets: ["Passerelle, portail développeur, **produits** et **abonnements** (clés)", "**Stratégies** XML en `inbound`, `backend`, `outbound`, `on-error` : `rate-limit`, `quota`, `validate-jwt`, `set-header`, cache, réécriture", "Versions et révisions d'API"] },
            { h: 'Événements ou messages ?', bullets: ["**Event Grid** : événements discrets réactifs (un blob créé), push, filtrage, schéma CloudEvents", "**Event Hubs** : flux massifs de télémétrie (millions/s), partitions, groupes de consommateurs, compatible Kafka", "**Service Bus** : messages d'entreprise — files et **topics/abonnements**, sessions (ordre FIFO), transactions, dead-letter, détection des doublons", "**Queue Storage** : file simple et bon marché, messages ≤ 64 Ko, > 80 Go de file"] },
            { h: 'Application Insights', bullets: ["APM d'Azure Monitor : requêtes, dépendances, exceptions, traces, **carte d'application**", "Instrumentation via **OpenTelemetry** (distro Azure Monitor) ou autoinstrumentation", "**Tests de disponibilité** (ping standard depuis plusieurs régions)", "Requêtes **KQL** dans Log Analytics ; alertes"], code: { lang: 'text', src: 'requests\n| where timestamp > ago(1h)\n| summarize total = count(), echecs = countif(success == false), p95 = percentile(duration, 95) by name\n| order by echecs desc' } }
          ],
          keypoints: ["Event Grid = événements réactifs ; Event Hubs = streaming massif ; Service Bus = messagerie d'entreprise", "Service Bus sessions = ordre FIFO", "APIM : politiques inbound/outbound", "App Insights + KQL"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Web app avec slot de staging, Key Vault et Managed Identity',
      goal: "Déployer une application sur App Service, lire un secret Key Vault sans aucun secret dans le code, et basculer via un swap.",
      minutes: 60, env: 'Azure CLI (Cloud Shell)',
      steps: [
        { t: "Créez un groupe, un plan S1 et une web app.", cmd: "az group create -n rg-az204 -l francecentral\naz appservice plan create -g rg-az204 -n plan-az204 --sku S1 --is-linux\naz webapp create -g rg-az204 -p plan-az204 -n app-az204-$RANDOM --runtime \"PYTHON:3.12\"" },
        { t: "Activez l'identité managée affectée par le système.", cmd: "az webapp identity assign -g rg-az204 -n NOM_APP" },
        { t: "Créez un Key Vault (RBAC) et un secret, puis donnez le rôle **Key Vault Secrets User** à l'identité de l'app.", cmd: "az keyvault create -g rg-az204 -n kv-az204-$RANDOM --enable-rbac-authorization true\naz keyvault secret set --vault-name NOM_KV -n message --value 'Bonjour depuis Key Vault'\naz role assignment create --assignee PRINCIPAL_ID --role \"Key Vault Secrets User\" --scope ID_DU_KV" },
        { t: "Ajoutez un App setting qui référence le secret.", cmd: "az webapp config appsettings set -g rg-az204 -n NOM_APP \\\n  --settings MESSAGE=\"@Microsoft.KeyVault(SecretUri=https://NOM_KV.vault.azure.net/secrets/message)\"" },
        { t: "Déployez une mini-app qui affiche `os.environ['MESSAGE']`.", check: "La page affiche le texte du secret." },
        { t: "Créez un slot `staging`, déployez une version 2, vérifiez-la sur l'URL du slot puis effectuez le swap.", cmd: "az webapp deployment slot create -g rg-az204 -n NOM_APP --slot staging\naz webapp deployment slot swap -g rg-az204 -n NOM_APP --slot staging" }
      ],
      cleanup: "az group delete -n rg-az204 --yes --no-wait"
    }
  ],
  quiz: [
    { q: "Quel est le niveau App Service minimal qui propose les slots de déploiement ?", options: ["Standard", "Free", "Shared", "Basic"], answer: 0, explain: "Les slots et l'autoscale arrivent au niveau Standard." },
    { q: "Lors d'un swap, comment garder une chaîne de connexion propre au slot staging ?", options: ["La marquer comme « deployment slot setting »", "La mettre dans le code", "La stocker dans host.json", "Ce n'est pas possible"], answer: 0, explain: "Les paramètres collants ne suivent pas le code lors du swap." },
    { q: "Quel plan Azure Functions élimine les cold starts grâce à des instances préchauffées ?", options: ["Premium", "Consommation", "Free", "Shared"], answer: 0, explain: "Le plan Premium garde des instances toujours prêtes." },
    { q: "Quel pattern Durable Functions exécute des activités en parallèle puis agrège les résultats ?", options: ["Fan-out/fan-in", "Chaînage de fonctions", "Monitor", "Interaction humaine"], answer: 0, explain: "L'orchestrateur lance N activités puis attend Task.WhenAll / context.task_all." },
    { q: "Quel niveau de cohérence Cosmos DB est appliqué par défaut ?", options: ["Session", "Strong", "Eventual", "Bounded staleness"], answer: 0, explain: "Session garantit « lire ses propres écritures » pour un client." },
    { q: "Quel type de SAS est le plus sécurisé pour Blob Storage ?", options: ["User delegation SAS", "Account SAS", "Service SAS", "Clé du compte de stockage"], answer: 0, explain: "Signée avec des identifiants Entra ID, pas avec la clé du compte." },
    { q: "Comment une application App Service peut-elle lire Key Vault sans stocker de secret ?", options: ["Avec une identité managée et un rôle RBAC sur le Key Vault", "Avec la clé du compte de stockage", "Avec un mot de passe dans appsettings.json", "Avec une SAS"], answer: 0, explain: "L'identité managée obtient un jeton Entra ID automatiquement." },
    { q: "Il faut ingérer des millions d'événements de télémétrie par seconde avec plusieurs consommateurs indépendants. Quel service ?", options: ["Event Hubs", "Event Grid", "Service Bus Queue", "Queue Storage"], answer: 0, explain: "Event Hubs est conçu pour le streaming massif avec partitions et groupes de consommateurs." },
    { q: "Des messages doivent être traités dans l'ordre pour un même client, avec gestion des doublons. Quel service ?", options: ["Service Bus avec sessions et détection des doublons", "Event Grid", "Queue Storage", "Event Hubs Basic"], answer: 0, explain: "Les sessions Service Bus garantissent un traitement FIFO par clé de session." },
    { q: "Dans API Management, où placer une stratégie `rate-limit` pour limiter les appels entrants ?", options: ["Dans la section inbound", "Dans la section outbound", "Dans on-error", "Dans le backend uniquement"], answer: 0, explain: "La limitation s'applique à la requête entrante, avant l'appel du backend." },
    { q: "Quelle commande construit une image conteneur directement dans Azure ?", options: ["az acr build", "docker build", "az webapp up", "az aks create"], answer: 0, explain: "ACR Tasks construit l'image dans le cloud et la pousse dans le registre." },
    { q: "Quelle classe d'identifiants permet au même code de fonctionner en local et dans Azure ?", options: ["DefaultAzureCredential", "ClientSecretCredential", "UsernamePasswordCredential", "StorageSharedKeyCredential"], answer: 0, explain: "Elle essaie variables d'env, identité managée, Azure CLI, VS Code… dans l'ordre." }
  ],
  flashcards: [
    ["Slots App Service", "Niveau Standard+, swap sans interruption, rollback par re-swap"],
    ["Slot setting (collant)", "Paramètre qui reste attaché au slot lors du swap"],
    ["Plans Functions", "Consommation (scale à zéro), Flex Consumption, Premium (préchauffé, VNet), Dedicated"],
    ["Timeout Functions Consommation", "5 min par défaut, 10 min max"],
    ["Durable Functions : patterns", "Chaînage, fan-out/fan-in, API HTTP async, monitor, interaction humaine"],
    ["Règle de l'orchestrateur", "Code déterministe : pas d'I/O ni d'heure système directe (il est rejoué)"],
    ["ACI vs Container Apps vs AKS", "ACI : conteneur ponctuel · Container Apps : microservices serverless (KEDA, révisions) · AKS : Kubernetes complet"],
    ["5 niveaux de cohérence Cosmos DB", "Strong, Bounded staleness, Session (défaut), Consistent prefix, Eventual"],
    ["Unité de débit Cosmos DB", "RU/s (Request Units par seconde)"],
    ["Change feed", "Flux ordonné des modifications d'un conteneur Cosmos DB (déclencheur Functions)"],
    ["Types de SAS", "User delegation (Entra ID, la plus sûre), Service, Account"],
    ["Stored access policy", "Permet de modifier/révoquer des SAS de service a posteriori"],
    ["Managed Identity : 2 types", "Système (liée à la ressource) · Utilisateur (indépendante, partageable)"],
    ["Référence Key Vault dans App Service", "@Microsoft.KeyVault(SecretUri=https://…/secrets/nom)"],
    ["Event Grid / Event Hubs / Service Bus", "Événements réactifs · streaming massif · messagerie d'entreprise (files, topics, sessions)"],
    ["Queue Storage : limite de message", "64 Ko"],
    ["APIM : sections de stratégie", "inbound, backend, outbound, on-error"],
    ["Flux OAuth service à service", "Client credentials"]
  ]
});
