ACADEMY.courses.push({
  id: 'datadog', phase: 3, kind: 'tech', order: 3,
  title: 'Datadog — APM & Monitoring', icon: '📊', category: 'Monitoring',
  hours: '~25h', priority: 4,
  subtitle: "Observer 22 applications de bout en bout : métriques, logs, traces APM, tableaux de bord, monitors et SLO.",
  description: "Datadog unifie métriques d'infrastructure, logs, traces distribuées, synthétiques et expérience utilisateur. En tant qu'architecte, vous définissez la stratégie d'observabilité : conventions de tags, instrumentation APM, monitors actionnables, SLO et maîtrise des coûts. Le cours suit la démarche des certifications Datadog Fundamentals / APM.",
  searchTerm: 'Datadog APM monitoring', searchTermEn: 'Datadog APM monitoring tutorial',
  outcomes: [
    "Comprendre les trois piliers : métriques, logs, traces — et leur corrélation",
    "Déployer l'agent Datadog (hôtes, Docker, Kubernetes) et les intégrations cloud",
    "Appliquer le tagging unifié (env, service, version)",
    "Instrumenter une application Java/Python en APM et lire une flame graph",
    "Gérer les logs : pipelines, index, exclusion, archives",
    "Créer des monitors actionnables, des SLO et des tableaux de bord",
    "Maîtriser les coûts d'observabilité"
  ],
  prerequisites: ["Docker et Kubernetes (bases)", "Une application à observer (API Spring Boot du parcours)"],
  resources: [
    { label: 'Documentation Datadog', url: 'https://docs.datadoghq.com/' },
    { label: 'Datadog Learning Center (gratuit)', url: 'https://learn.datadoghq.com/' },
    { label: 'Tagging unifié', url: 'https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging/' }
  ],
  modules: [
    {
      title: 'Fondamentaux de l\'observabilité',
      lessons: [
        {
          title: "Les trois piliers et l'agent Datadog",
          sections: [
            { h: 'Supervision vs observabilité', p: "La **supervision** répond à des questions connues (le CPU dépasse-t-il 80 % ?). L'**observabilité** permet de répondre à des questions **nouvelles** sur un système distribué, en corrélant **métriques** (combien), **logs** (quoi, en détail) et **traces** (où, dans quel service, combien de temps)." },
            { h: "L'agent", bullets: ["Collecte métriques système, **checks** d'intégrations (PostgreSQL, nginx, JMX…), logs, traces (port 8126), processus", "Installation : paquet sur l'hôte, conteneur, **Helm chart / Datadog Operator** sur Kubernetes (DaemonSet + Cluster Agent)", "**Autodiscovery** : configuration des intégrations par annotations de pods", "**DogStatsD** (port 8125/UDP) pour les métriques personnalisées", "Intégrations cloud **AWS / Azure** par API (CloudWatch, Azure Monitor) sans agent"], code: { lang: 'bash', src: 'helm repo add datadog https://helm.datadoghq.com\nhelm install datadog datadog/datadog \\\n  --set datadog.apiKey=$DD_API_KEY \\\n  --set datadog.site=datadoghq.eu \\\n  --set datadog.logs.enabled=true \\\n  --set datadog.logs.containerCollectAll=true \\\n  --set datadog.apm.portEnabled=true \\\n  --set clusterAgent.enabled=true' } },
            { h: 'Les types de métriques', bullets: ["**gauge** (valeur instantanée), **count**, **rate**", "**histogram** / **distribution** (percentiles globaux p50, p95, p99)", "Agrégation dans le temps et dans l'espace (`avg by {service}`)", "**Cardinalité** : chaque combinaison de tags = une série temporelle facturée"] }
          ],
          keypoints: ["Métriques / logs / traces corrélés", "Agent + Cluster Agent sur Kubernetes", "DogStatsD pour les métriques custom", "Cardinalité = coût"]
        },
        {
          title: 'Le tagging unifié : la clé de tout',
          sections: [
            { h: 'env, service, version', p: "Trois tags réservés relient toutes les données d'un même service : **`env`**, **`service`**, **`version`**. Ils permettent de passer d'un pic de latence (métrique) à la trace lente puis aux logs de cette requête, et de comparer les versions après un déploiement.", code: { lang: 'yaml', src: '# Deployment Kubernetes\nmetadata:\n  labels:\n    tags.datadoghq.com/env: prod\n    tags.datadoghq.com/service: commandes-api\n    tags.datadoghq.com/version: "1.4.2"\nspec:\n  template:\n    metadata:\n      labels:\n        tags.datadoghq.com/env: prod\n        tags.datadoghq.com/service: commandes-api\n        tags.datadoghq.com/version: "1.4.2"\n      annotations:\n        admission.datadoghq.com/java-lib.version: "v1"   # injection automatique de l\'APM\n    # alternative : variables DD_ENV, DD_SERVICE, DD_VERSION' } },
            { h: 'Convention de tags d\'entreprise', bullets: ["`team`, `application`, `cost_center`, `criticite` en plus des tags réservés", "Mêmes clés qu'en tags cloud (AWS/Azure) pour corréler coûts et performance", "Pas d'identifiant unique (user_id, request_id) en tag de métrique : explosion de cardinalité", "Documenter la convention et la vérifier en CI"] }
          ],
          keypoints: ["env / service / version partout", "Convention de tags alignée sur le cloud", "Jamais d'ID unique en tag de métrique"]
        }
      ]
    },
    {
      title: 'APM, logs et expérience utilisateur',
      lessons: [
        {
          title: 'APM et traçage distribué',
          sections: [
            { h: 'Vocabulaire', bullets: ["**Trace** : parcours complet d'une requête ; **span** : une opération (requête HTTP, requête SQL)", "**Service** et **ressource** (endpoint `GET /api/commandes/{id}`)", "Métriques RED automatiques : **Rate**, **Errors**, **Duration**", "**Service Map** : dépendances entre services", "Propagation du contexte (en-têtes W3C `traceparent`, Datadog)"] },
            { h: 'Instrumenter', code: { lang: 'bash', src: '# Java : agent de traçage\njava -javaagent:/opt/dd-java-agent.jar \\\n  -Ddd.service=commandes-api -Ddd.env=prod -Ddd.version=1.4.2 \\\n  -Ddd.logs.injection=true -Ddd.profiling.enabled=true \\\n  -jar app.jar\n\n# Python\npip install ddtrace\nDD_SERVICE=facturation DD_ENV=prod ddtrace-run gunicorn app:app' }, bullets: ["Instrumentation automatique des frameworks (Spring, JDBC, requests, Django…)", "**Injection des identifiants de trace dans les logs** pour la corrélation", "**Continuous Profiler** : CPU, mémoire, verrous au niveau du code", "OpenTelemetry supporté (OTLP vers l'agent)"] },
            { h: 'Lire une trace', bullets: ["**Flame graph** : largeur = durée ; repérer le span le plus large", "Requêtes N+1 : dizaines de spans SQL identiques", "Temps passé dans des appels externes vs code applicatif", "Échantillonnage : règles d'ingestion et de rétention (retention filters)"] }
          ],
          keypoints: ["Trace = spans ; métriques RED", "Agent Java / ddtrace-run", "logs.injection = corrélation logs-traces", "Flame graph : chercher le span le plus large"]
        },
        {
          title: 'Logs, synthétiques et RUM',
          sections: [
            { h: 'Gestion des logs', bullets: ["**Pipelines** : parsing (Grok), remappage de statut, date, service ; enrichissement", "**Facets** et **measures** pour filtrer et agréger", "**Index** (logs recherchables, payants) avec **filtres d'exclusion** (ex. health checks)", "**Archives** vers S3/Azure Blob (économiques) et **rehydration** au besoin", "**Logs to metrics** : garder la tendance sans indexer les volumes", "**Sensitive Data Scanner** : masquer les données personnelles"] },
            { h: 'Synthétiques et RUM', bullets: ["**Tests API** (HTTP, SSL, DNS, TCP) depuis des emplacements mondiaux", "**Tests navigateur** : parcours utilisateur enregistrés (connexion, commande)", "Tests synthétiques dans la CI (bloquer un déploiement)", "**RUM** : performance réelle côté navigateur/mobile, Core Web Vitals, sessions"] }
          ],
          keypoints: ["Indexer peu, archiver tout", "Exclure les logs de health check", "Logs to metrics pour les tendances", "Synthetics = proactif ; RUM = utilisateurs réels"]
        }
      ]
    },
    {
      title: 'Alerter et piloter',
      lessons: [
        {
          title: 'Monitors, SLO et tableaux de bord',
          sections: [
            { h: 'Des monitors actionnables', bullets: ["Types : métrique, **APM**, logs, **anomalie**, **outlier**, **forecast**, composite, synthétique, processus", "**Multi-alert** par `service` ou `host` : un seul monitor pour tous", "Seuils warning / critical, fenêtre d'évaluation, délai de récupération", "Message avec contexte : variables `{{service.name}}`, lien vers le runbook, `@pagerduty-…` / `@slack-…`", "Downtimes planifiés pour les maintenances", "Alerter sur les **symptômes** (latence, erreurs utilisateur) plutôt que sur les causes (CPU)"] },
            { h: 'SLI, SLO et budget d\'erreur', p: "Un **SLI** mesure la qualité (ex. % de requêtes < 500 ms et non en erreur). Un **SLO** fixe l'objectif (99,5 % sur 30 jours). Le **budget d'erreur** (0,5 %) indique combien d'échecs on peut « dépenser » : s'il est consommé trop vite, on privilégie la fiabilité aux nouvelles fonctionnalités.", bullets: ["SLO basés sur les métriques ou sur les monitors", "Alertes de **burn rate** : le budget se consomme 14× trop vite → page", "SLO par parcours métier, pas par serveur"] },
            { h: 'Tableaux de bord', bullets: ["Un dashboard **service** (RED + saturation) et un dashboard **métier** par application", "Variables de template (`$env`, `$service`) pour un seul dashboard réutilisable", "Dashboards et monitors **as code** avec le provider Terraform `datadog`", "Tableau de bord de synthèse pour vos 22 applications : SLO, incidents, déploiements"], code: { lang: 'hcl', src: 'resource "datadog_monitor" "latence_api" {\n  name    = "[{{service.name}}] Latence p95 élevée"\n  type    = "query alert"\n  query   = "percentile(last_10m):p95:trace.servlet.request{env:prod} by {service} > 0.8"\n  message = "La p95 dépasse 800 ms. Runbook : https://wiki/runbooks/latence @slack-ops"\n  monitor_thresholds {\n    critical = 0.8\n    warning  = 0.5\n  }\n  tags = ["team:plateforme", "env:prod"]\n}' } },
            { h: 'Maîtriser les coûts', bullets: ["Hôtes et conteneurs facturés : n'installer l'APM que là où il sert", "Logs : filtres d'exclusion, rétention courte, archives", "Métriques custom : limiter la cardinalité (Metrics without Limits)", "Tableau de bord **Usage** et attribution par tag `team`"] }
          ],
          keypoints: ["Multi-alert + message avec runbook", "Alerter sur les symptômes", "SLO + budget d'erreur + burn rate", "Monitors et dashboards en Terraform"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Observer l\'API Spring Boot de bout en bout',
      goal: "Avec un compte d'essai Datadog : agent Docker, APM Java, corrélation logs-traces, monitor de latence et SLO.",
      minutes: 75, env: 'Docker + compte d\'essai Datadog (14 jours)',
      steps: [
        { t: "Créez un compte d'essai (site EU) et récupérez une clé d'API." },
        { t: "Lancez l'agent en conteneur.", cmd: "docker run -d --name dd-agent \\\n  -e DD_API_KEY=$DD_API_KEY -e DD_SITE=datadoghq.eu \\\n  -e DD_APM_ENABLED=true -e DD_APM_NON_LOCAL_TRAFFIC=true \\\n  -e DD_LOGS_ENABLED=true -e DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL=true \\\n  -v /var/run/docker.sock:/var/run/docker.sock:ro \\\n  -v /proc/:/host/proc/:ro -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \\\n  -p 8126:8126 datadog/agent:7" },
        { t: "Ajoutez `dd-java-agent.jar` à l'image de l'API et démarrez-la avec `DD_SERVICE`, `DD_ENV=lab`, `DD_VERSION`, `DD_AGENT_HOST=dd-agent`, `DD_LOGS_INJECTION=true` (même réseau Docker que l'agent)." },
        { t: "Générez du trafic, dont quelques erreurs 404 et 500.", cmd: "for i in $(seq 1 500); do curl -s localhost:8080/api/commandes/$((RANDOM % 20)) > /dev/null; done" },
        { t: "Dans APM, ouvrez le service, une trace lente, puis cliquez sur ses logs associés.", check: "Les logs affichent dd.trace_id et sont reliés à la trace." },
        { t: "Créez un monitor multi-alert sur la p95 par service avec un message contenant un lien de runbook." },
        { t: "Créez un SLO « 99 % des requêtes sans erreur sur 7 jours » et un dashboard avec la variable `$service`." },
        { t: "Bonus : exportez le monitor en Terraform (`datadog_monitor`)." }
      ],
      cleanup: "docker rm -f dd-agent et arrêtez l'essai si vous n'en avez plus besoin."
    }
  ],
  quiz: [
    { q: "Quels sont les trois tags réservés du tagging unifié Datadog ?", options: ["env, service, version", "host, region, team", "app, owner, cost", "cluster, namespace, pod"], answer: 0, explain: "Ils relient métriques, traces et logs d'un même service." },
    { q: "Pourquoi ne pas utiliser un user_id comme tag de métrique ?", options: ["Explosion de la cardinalité (une série par utilisateur) et donc des coûts", "Datadog interdit les nombres", "Les tags sont limités à 3", "Cela désactive l'APM"], answer: 0, explain: "Chaque combinaison de valeurs de tags crée une série temporelle." },
    { q: "Que représentent les métriques RED en APM ?", options: ["Rate, Errors, Duration", "Read, Execute, Delete", "Requests, Events, Data", "Redundancy, Elasticity, Durability"], answer: 0, explain: "Le trio de base pour superviser un service orienté requêtes." },
    { q: "Comment corréler automatiquement un log avec la trace de la requête ?", options: ["Activer l'injection des identifiants de trace dans les logs (DD_LOGS_INJECTION)", "Ajouter un tag host", "Indexer tous les logs", "Utiliser un monitor composite"], answer: 0, explain: "dd.trace_id et dd.span_id sont ajoutés aux logs." },
    { q: "Comment réduire le coût des logs de health check très fréquents tout en gardant une tendance ?", options: ["Filtre d'exclusion d'index + logs to metrics", "Augmenter la rétention", "Les envoyer en métriques custom haute cardinalité", "Désactiver l'agent"], answer: 0, explain: "Les logs exclus ne sont pas indexés, la métrique conserve le volume." },
    { q: "Un SLO de 99,9 % sur 30 jours laisse un budget d'erreur de…", options: ["0,1 % des requêtes (≈ 43 min d'indisponibilité)", "1 %", "0,01 %", "10 %"], answer: 0, explain: "30 j × 24 h × 60 min × 0,001 ≈ 43 minutes." },
    { q: "Quel type de monitor utiliser pour être alerté quand une métrique sort de son comportement habituel (saisonnalité) ?", options: ["Anomaly", "Threshold simple", "Process", "Composite"], answer: 0, explain: "La détection d'anomalies apprend la tendance et la saisonnalité." },
    { q: "Sur Kubernetes, quel composant Datadog allège la charge de l'API server et gère les métriques de cluster ?", options: ["Le Cluster Agent", "DogStatsD", "Le Continuous Profiler", "Les synthétiques"], answer: 0, explain: "Les agents de nœud interrogent le Cluster Agent plutôt que l'API server." },
    { q: "Quelle est la bonne pratique pour les alertes qui réveillent l'astreinte ?", options: ["Alerter sur les symptômes visibles par l'utilisateur (erreurs, latence, SLO)", "Alerter sur chaque pic de CPU", "Alerter sur chaque log d'erreur", "Ne jamais alerter la nuit"], answer: 0, explain: "Les causes (CPU, mémoire) vont plutôt dans des tableaux de bord ou des alertes non urgentes." },
    { q: "Comment versionner monitors et dashboards ?", options: ["Avec le provider Terraform datadog", "En captures d'écran", "Via l'agent", "Ce n'est pas possible"], answer: 0, explain: "L'observabilité as code se revoit en merge request comme le reste." }
  ],
  flashcards: [
    ["3 piliers de l'observabilité", "Métriques (combien), logs (quoi), traces (où et combien de temps)"],
    ["Tags réservés Datadog", "env, service, version"],
    ["Port des traces / de DogStatsD", "8126 (APM) · 8125/UDP (DogStatsD)"],
    ["Types de métriques", "gauge, count, rate, histogram, distribution"],
    ["Cardinalité", "Nombre de séries = combinaisons de valeurs de tags → coût"],
    ["Trace vs span", "Trace : requête complète · Span : une opération dans la trace"],
    ["Métriques RED", "Rate, Errors, Duration"],
    ["Corrélation logs ↔ traces", "DD_LOGS_INJECTION=true (trace_id dans les logs)"],
    ["Indexer vs archiver les logs", "Index : recherchable, cher · Archive S3/Blob : économique, réhydratable"],
    ["Logs to metrics", "Générer une métrique à partir de logs sans les indexer"],
    ["SLI / SLO / budget d'erreur", "Mesure / objectif / marge d'échec autorisée (1 − SLO)"],
    ["Alerte de burn rate", "Le budget d'erreur se consomme N fois trop vite"],
    ["Monitor multi-alert", "Un monitor, une alerte par groupe (by {service})"],
    ["Synthetics vs RUM", "Synthetics : tests robots proactifs · RUM : utilisateurs réels"]
  ]
});
