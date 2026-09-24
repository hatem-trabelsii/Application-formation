ACADEMY.courses.push({
  id: 'cloudwatch', phase: 3, kind: 'tech', order: 4,
  title: 'CloudWatch & AWS Ops', icon: '👁️', category: 'Monitoring Cloud',
  hours: '~20h', priority: 5,
  subtitle: "L'observabilité native AWS en pratique : Logs Insights, métriques EMF, alarmes composites, Container Insights, Application Signals et opérations.",
  description: "Complément opérationnel de SysOps et de Datadog : comment tirer le maximum de CloudWatch (souvent déjà payé) pour superviser vos 22 applications, quand le compléter par Datadog, et comment industrialiser tableaux de bord, alarmes et runbooks en code.",
  searchTerm: 'Amazon CloudWatch Logs Insights', searchTermEn: 'Amazon CloudWatch observability',
  outcomes: [
    "Écrire des requêtes CloudWatch Logs Insights efficaces",
    "Publier des métriques applicatives avec l'Embedded Metric Format",
    "Concevoir des alarmes utiles : M sur N, composites, détection d'anomalies, métriques mathématiques",
    "Superviser conteneurs et Lambda : Container Insights, Lambda Insights, Application Signals",
    "Surveiller l'expérience utilisateur avec Synthetics et RUM",
    "Industrialiser : dashboards et alarmes en IaC, observabilité multi-comptes, runbooks SSM"
  ],
  prerequisites: ["AWS SysOps (en parallèle ou avant)", "Terraform ou CloudFormation"],
  resources: [
    { label: 'Guide utilisateur CloudWatch', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/WhatIsCloudWatch.html' },
    { label: 'Syntaxe Logs Insights', url: 'https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html' },
    { label: 'AWS Observability Best Practices', url: 'https://aws-observability.github.io/observability-best-practices/' }
  ],
  modules: [
    {
      title: 'Logs et métriques',
      lessons: [
        {
          title: 'Logs Insights : interroger ses logs',
          sections: [
            { h: 'La syntaxe', p: "Une requête enchaîne des commandes séparées par `|` : `fields`, `filter`, `parse`, `stats`, `sort`, `limit`, `dedup`. Les champs JSON sont découverts automatiquement.", code: { lang: 'text', src: '# Top 10 des endpoints les plus lents (logs JSON d\'une API)\nfields @timestamp, path, status, duration_ms\n| filter status >= 200\n| stats avg(duration_ms) as moy, pct(duration_ms, 95) as p95, count(*) as n by path\n| sort p95 desc\n| limit 10\n\n# Erreurs par tranche de 5 minutes\nfilter level = "ERROR"\n| stats count(*) as erreurs by bin(5m)\n\n# Lambda : durée et mémoire réellement utilisée\nfilter @type = "REPORT"\n| stats max(@maxMemoryUsed / 1000 / 1000) as memMaxMo, avg(@duration) as dureeMoy by bin(1h)\n\n# Extraire d\'un log texte\nparse @message "user=* action=* ms=*" as user, action, ms\n| stats count(*) by action' } },
            { h: 'Bonnes pratiques de logs', bullets: ["Logs **structurés JSON** avec `service`, `env`, `trace_id`, `level`", "Rétention par groupe (7, 30, 90 jours…) ; archive S3 pour le long terme", "Classe **Infrequent Access** pour les logs rarement lus (moins chère)", "**Data protection policies** : masquer les données sensibles", "Requêtes sauvegardées et ajoutées aux tableaux de bord"] },
            { h: 'Live Tail et anomalies', bullets: ["**Live Tail** : suivre les logs en temps réel pendant un incident", "**Log anomaly detection** et **patterns** : regrouper automatiquement les messages similaires", "Contributor Insights : top N des contributeurs (IP, utilisateurs) d'un phénomène"] }
          ],
          keypoints: ["fields | filter | stats | sort | limit", "stats … by bin(5m)", "Logs JSON structurés", "Rétention + Infrequent Access"]
        },
        {
          title: 'Métriques applicatives et Embedded Metric Format',
          sections: [
            { h: 'Trois façons de publier', bullets: ["`PutMetricData` (API) : simple mais appels synchrones et coût par requête", "**Metric filters** sur des logs existants", "**EMF** : écrire un log JSON au format EMF, CloudWatch en extrait les métriques **de façon asynchrone** — idéal pour Lambda et conteneurs"] },
            { h: 'Exemple EMF', code: { lang: 'json', src: '{\n  "_aws": {\n    "Timestamp": 1767000000000,\n    "CloudWatchMetrics": [{\n      "Namespace": "Commandes",\n      "Dimensions": [["Service", "Env"]],\n      "Metrics": [{ "Name": "CommandesCreees", "Unit": "Count" },\n                  { "Name": "MontantPanier", "Unit": "None" }]\n    }]\n  },\n  "Service": "commandes-api",\n  "Env": "prod",\n  "CommandesCreees": 1,\n  "MontantPanier": 84.5,\n  "commandeId": "c-9812"\n}' }, bullets: ["Le champ `commandeId` reste dans le log (recherchable) sans devenir une dimension", "Bibliothèques : aws-embedded-metrics (Java, Python, Node), Powertools for AWS Lambda", "Attention au nombre de dimensions : chaque combinaison = une métrique facturée"] },
            { h: 'Metric math et requêtes', bullets: ["**Metric math** : taux d'erreur = `100 * m5xx / mRequetes`", "**Metrics Insights** : requêtes SQL sur les métriques (`SELECT AVG(CPUUtilization) FROM SCHEMA(\"AWS/EC2\", InstanceId) GROUP BY InstanceId ORDER BY AVG() DESC LIMIT 10`)", "Statistiques : Average, Sum, Min, Max, SampleCount, **percentiles** (p95, p99)"] }
          ],
          keypoints: ["EMF = métriques via logs, asynchrone", "Metric math pour les ratios", "Metrics Insights en SQL", "Dimensions = coût"]
        }
      ]
    },
    {
      title: 'Alarmes et observabilité applicative',
      lessons: [
        {
          title: 'Des alarmes utiles et sans bruit',
          sections: [
            { h: 'Configurer finement', bullets: ["**M sur N** : 3 points en alarme sur 5 pour ignorer les pics isolés", "Traitement des données manquantes : `notBreaching`, `breaching`, `ignore`, `missing`", "Alarmes sur **metric math** (taux d'erreur plutôt que nombre brut)", "**Détection d'anomalies** : bande attendue apprise (saisonnalité horaire/hebdomadaire)", "Percentiles (p99 de latence) plutôt que moyenne"] },
            { h: 'Alarmes composites', p: "Une **alarme composite** combine d'autres alarmes avec AND/OR/NOT : `ALARM(latence-elevee) AND ALARM(erreurs-elevees)`. Elle réduit le bruit et peut **supprimer** les notifications des alarmes enfants pendant une panne connue.", code: { lang: 'hcl', src: 'resource "aws_cloudwatch_metric_alarm" "taux_5xx" {\n  alarm_name          = "commandes-api-taux-5xx"\n  comparison_operator = "GreaterThanThreshold"\n  evaluation_periods  = 5\n  datapoints_to_alarm = 3\n  threshold           = 2\n  treat_missing_data  = "notBreaching"\n  alarm_actions       = [aws_sns_topic.ops.arn]\n\n  metric_query {\n    id          = "taux"\n    expression  = "100 * erreurs / requetes"\n    label       = "Taux 5xx (%)"\n    return_data = true\n  }\n  metric_query {\n    id = "erreurs"\n    metric {\n      namespace   = "AWS/ApplicationELB"\n      metric_name = "HTTPCode_Target_5XX_Count"\n      period      = 60\n      stat        = "Sum"\n      dimensions  = { LoadBalancer = var.alb_suffix }\n    }\n  }\n  metric_query {\n    id = "requetes"\n    metric {\n      namespace   = "AWS/ApplicationELB"\n      metric_name = "RequestCount"\n      period      = 60\n      stat        = "Sum"\n      dimensions  = { LoadBalancer = var.alb_suffix }\n    }\n  }\n}' } },
            { h: 'Des actions, pas seulement des e-mails', bullets: ["SNS → e-mail, SMS, Chatbot (Slack/Teams), PagerDuty", "Actions Auto Scaling et EC2 (recover, reboot)", "**Systems Manager Incident Manager** / OpsCenter (OpsItems)", "EventBridge sur changement d'état d'alarme → Lambda / SSM Automation (auto-remédiation)"] }
          ],
          keypoints: ["M sur N + données manquantes", "Taux (metric math) > compte brut", "Composites contre le bruit", "Alarme → EventBridge → remédiation"]
        },
        {
          title: 'Conteneurs, Lambda, Application Signals et expérience utilisateur',
          sections: [
            { h: 'Insights spécialisés', bullets: ["**Container Insights** (ECS, EKS) : CPU/mémoire par cluster, service, tâche, pod ; mode observabilité améliorée pour EKS", "**Lambda Insights** : mémoire, CPU, cold starts, via une extension", "**Database Insights** / Performance Insights pour RDS et Aurora", "**Internet Monitor** et **Network Monitor** pour la connectivité"] },
            { h: 'Application Signals', p: "**CloudWatch Application Signals** instrumente automatiquement les applications (via ADOT / OpenTelemetry) et fournit tableaux de bord de services, carte des dépendances et **SLO** (disponibilité, latence) directement dans CloudWatch, reliés aux traces X-Ray." },
            { h: 'Expérience utilisateur', bullets: ["**Synthetics** : canaris (scripts Node.js/Python Puppeteer/Playwright/Selenium) planifiés — API, parcours, liens cassés, comparaison visuelle", "**RUM** : données réelles des navigateurs (Web Vitals, erreurs JS, sessions)", "**Evidently** : AWS a annoncé sa fin de support — préférer AppConfig pour les feature flags"] }
          ],
          keypoints: ["Container Insights / Lambda Insights", "Application Signals = APM + SLO natifs", "Synthetics = canaris ; RUM = vrais utilisateurs"]
        }
      ]
    },
    {
      title: 'Industrialiser les opérations',
      lessons: [
        {
          title: 'Observabilité multi-comptes, IaC et CloudWatch vs Datadog',
          sections: [
            { h: 'Multi-comptes', bullets: ["**Cross-account observability** (OAM) : un compte de supervision voit métriques, logs, traces de comptes sources", "Tableaux de bord **inter-comptes et inter-régions**", "Centralisation des logs : subscription → Firehose → S3 (Athena) / OpenSearch", "Tagging homogène pour filtrer par application/équipe"] },
            { h: 'Tout en code', bullets: ["Dashboards (`aws_cloudwatch_dashboard`, JSON), alarmes, metric filters, requêtes sauvegardées en Terraform/CloudFormation", "Alarmes standard générées par module (ex. un module « service-web » crée toujours 5xx, latence p99, saturation)", "Runbooks SSM Automation versionnés et liés aux alarmes", "Revue mensuelle : alarmes jamais déclenchées ou toujours en alarme = à revoir"] },
            { h: 'CloudWatch ou Datadog ?', bullets: ["**CloudWatch** : natif, sans agent pour les services managés, facturation à l'usage, intégration directe aux actions AWS", "**Datadog** : multi-cloud et on-premises, UX de corrélation très riche, APM et profilage avancés, coût par hôte/volume", "Pattern fréquent : CloudWatch pour les métriques de services managés et les actions automatiques ; Datadog comme vue unifiée multi-cloud pour les équipes", "Standardiser sur **OpenTelemetry** pour éviter l'enfermement"] }
          ],
          keypoints: ["OAM = observabilité inter-comptes", "Module IaC = alarmes standard par service", "OpenTelemetry pour rester portable", "CloudWatch natif + Datadog unifié"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Tableau de bord et alarme de taux d\'erreur pour une Lambda',
      goal: "Instrumenter une Lambda avec EMF, analyser ses logs avec Logs Insights et créer une alarme composite, le tout en Terraform.",
      minutes: 60, env: 'AWS + Terraform',
      steps: [
        { t: "Déployez une Lambda Python qui simule des commandes et échoue aléatoirement dans 5 % des cas, en publiant des métriques EMF (Powertools : `from aws_lambda_powertools import Metrics`)." },
        { t: "Invoquez-la 500 fois.", cmd: "for i in $(seq 1 500); do aws lambda invoke --function-name commandes-sim /dev/null >/dev/null; done" },
        { t: "Dans Logs Insights, calculez la durée p95 et le nombre d'erreurs par tranche de 5 minutes." },
        { t: "En Terraform, créez une alarme sur le **taux** d'erreur (metric math Errors/Invocations) avec 3 points sur 5." },
        { t: "Créez une deuxième alarme sur la durée p95, puis une **alarme composite** AND des deux." },
        { t: "Créez un dashboard (`aws_cloudwatch_dashboard`) avec les métriques EMF et le widget de requête Logs Insights.", check: "Le dashboard affiche les commandes créées et le taux d'erreur." },
        { t: "Ajoutez une règle EventBridge « alarme composite en ALARM » → notification SNS." }
      ],
      cleanup: "terraform destroy"
    }
  ],
  quiz: [
    { q: "Quelle commande Logs Insights agrège des résultats par tranche de temps ?", options: ["stats count(*) by bin(5m)", "group by time(5m)", "window 5m", "histogram(5m)"], answer: 0, explain: "bin() crée des intervalles temporels." },
    { q: "Quel est l'avantage principal de l'Embedded Metric Format pour Lambda ?", options: ["Publier des métriques de façon asynchrone via les logs, sans appel API bloquant", "Des métriques gratuites", "Remplacer X-Ray", "Chiffrer les logs"], answer: 0, explain: "CloudWatch extrait les métriques des logs JSON au format EMF." },
    { q: "Comment éviter qu'une alarme se déclenche sur un pic isolé ?", options: ["Configurer « M sur N » points de données (ex. 3 sur 5)", "Réduire la période à 10 s", "Supprimer l'action SNS", "Utiliser la moyenne sur 1 jour"], answer: 0, explain: "datapoints_to_alarm avec evaluation_periods." },
    { q: "Pourquoi alerter sur un taux d'erreur plutôt que sur un nombre d'erreurs ?", options: ["Le taux reste pertinent quel que soit le volume de trafic", "C'est moins cher", "Le nombre n'est pas disponible", "Les taux sont plus rapides"], answer: 0, explain: "50 erreurs sur 100 requêtes ≠ 50 erreurs sur 1 million." },
    { q: "Quelle fonctionnalité combine plusieurs alarmes avec des opérateurs logiques ?", options: ["Les alarmes composites", "La détection d'anomalies", "Les metric filters", "Contributor Insights"], answer: 0, explain: "Exemple : ALARM(a) AND ALARM(b)." },
    { q: "Quel outil CloudWatch exécute des scripts planifiés simulant un parcours utilisateur ?", options: ["CloudWatch Synthetics (canaris)", "CloudWatch RUM", "Container Insights", "Logs Insights"], answer: 0, explain: "RUM mesure les utilisateurs réels ; Synthetics simule." },
    { q: "Comment voir dans un seul compte les métriques de plusieurs comptes AWS ?", options: ["CloudWatch cross-account observability", "Copier les métriques avec une Lambda", "CloudTrail", "AWS Config aggregator"], answer: 0, explain: "Configuré via Observability Access Manager (OAM)." },
    { q: "Quel traitement des données manquantes évite une alarme quand une Lambda n'est simplement pas invoquée ?", options: ["notBreaching", "breaching", "missing", "ignore sur une seule période"], answer: 0, explain: "L'absence de données (pas d'erreurs) est alors considérée comme normale." }
  ],
  flashcards: [
    ["Structure d'une requête Logs Insights", "fields … | filter … | stats … by … | sort … | limit …"],
    ["Agréger par intervalle", "stats count(*) by bin(5m)"],
    ["Mémoire max Lambda dans les logs", "filter @type = \"REPORT\" | stats max(@maxMemoryUsed)"],
    ["EMF", "Log JSON avec bloc _aws.CloudWatchMetrics → métriques extraites de façon asynchrone"],
    ["Metric math : taux d'erreur", "100 * erreurs / requetes"],
    ["Metrics Insights", "Requêtes SQL sur les métriques (SELECT … FROM SCHEMA(…) GROUP BY …)"],
    ["M sur N", "datapoints_to_alarm = M, evaluation_periods = N"],
    ["Données manquantes", "notBreaching, breaching, ignore, missing"],
    ["Alarme composite", "Combinaison AND/OR/NOT d'alarmes, réduit le bruit"],
    ["Application Signals", "APM natif CloudWatch (OpenTelemetry) avec SLO et carte des services"],
    ["Synthetics vs RUM", "Canaris planifiés vs utilisateurs réels"],
    ["Observabilité multi-comptes", "OAM : compte de supervision + comptes sources liés"],
    ["Logs rarement consultés moins chers", "Classe de groupe de logs Infrequent Access"]
  ]
});
