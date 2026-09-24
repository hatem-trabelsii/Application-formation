ACADEMY.courses.push({
  id: 'python', phase: 2, kind: 'tech', order: 3,
  title: 'Python — Scripting & ML Prep', icon: '🐍', category: 'Langage',
  hours: '~50h', priority: 5,
  subtitle: "Automatiser l'infrastructure avec Python (boto3, API, fichiers) et poser les bases data/ML (pandas, scikit-learn).",
  description: "Python est la langue commune de l'automatisation cloud et du machine learning. Vous écrirez des scripts robustes et testés pour piloter AWS/Azure, appeler des API, traiter des fichiers YAML/JSON/CSV, puis vous préparerez le terrain ML avec NumPy, pandas et scikit-learn.",
  searchTerm: 'Python automatisation cours', searchTermEn: 'Python automation boto3 pandas',
  outcomes: [
    "Maîtriser la syntaxe moderne : types, compréhensions, f-strings, dataclasses, typage",
    "Structurer un projet : environnements virtuels, pyproject.toml, modules, tests pytest",
    "Écrire des CLI robustes : argparse, logging, gestion d'erreurs, codes de sortie",
    "Automatiser AWS avec boto3 et appeler des API REST avec requests/httpx",
    "Manipuler JSON, YAML, CSV et fichiers de manière sûre",
    "Analyser des données avec pandas et visualiser",
    "Entraîner et évaluer un premier modèle scikit-learn"
  ],
  prerequisites: ["Notions de programmation (Java suffit)", "Python 3.12+ installé"],
  resources: [
    { label: 'Tutoriel officiel Python (FR)', url: 'https://docs.python.org/fr/3/tutorial/' },
    { label: 'Documentation boto3', url: 'https://boto3.amazonaws.com/v1/documentation/api/latest/index.html' },
    { label: 'pandas — 10 minutes to pandas', url: 'https://pandas.pydata.org/docs/user_guide/10min.html' },
    { label: 'scikit-learn — tutoriels', url: 'https://scikit-learn.org/stable/tutorial/index.html' }
  ],
  modules: [
    {
      title: 'Python moderne',
      lessons: [
        {
          title: 'Syntaxe essentielle et structures de données',
          sections: [
            { h: 'Types de base', bullets: ["`int`, `float`, `str`, `bool`, `None`", "`list` (ordonnée, mutable), `tuple` (immuable), `dict` (clé → valeur), `set` (unicité)", "L'indentation définit les blocs (4 espaces)", "Tout est objet ; typage dynamique mais **annotations de type** recommandées"] },
            { h: 'Idiomes pythoniques', code: { lang: 'python', src: 'serveurs = [{"nom": "web-1", "cpu": 82}, {"nom": "web-2", "cpu": 35}, {"nom": "db-1", "cpu": 91}]\n\n# compréhensions\nsatures = [s["nom"] for s in serveurs if s["cpu"] > 80]\npar_nom = {s["nom"]: s["cpu"] for s in serveurs}\n\n# f-strings et déballage\nfor i, s in enumerate(serveurs, start=1):\n    print(f"{i}. {s[\'nom\']:<6} {s[\'cpu\']:>3}%")\n\npremier, *reste = satures\ncpu_max = max(serveurs, key=lambda s: s["cpu"])\nprint(par_nom.get("web-9", "inconnu"))' } },
            { h: 'Fonctions et dataclasses', code: { lang: 'python', src: 'from dataclasses import dataclass, field\n\n@dataclass(frozen=True)\nclass Instance:\n    id: str\n    type: str\n    tags: dict[str, str] = field(default_factory=dict)\n\n    @property\n    def env(self) -> str:\n        return self.tags.get("env", "inconnu")\n\ndef filtrer(instances: list[Instance], env: str = "prod") -> list[Instance]:\n    """Renvoie les instances d\'un environnement."""\n    return [i for i in instances if i.env == env]' }, bullets: ["Paramètres par défaut, `*args`, `**kwargs`, arguments nommés", "Piège : jamais de valeur par défaut mutable (`def f(x=[])`)", "Générateurs `yield` pour traiter de gros volumes en flux"] }
          ],
          keypoints: ["list/tuple/dict/set", "Compréhensions et f-strings", "dataclass pour les objets de données", "Pas de défaut mutable"]
        },
        {
          title: 'Projet propre : venv, dépendances, tests',
          sections: [
            { h: 'Environnements isolés', code: { lang: 'bash', src: 'python3 -m venv .venv\nsource .venv/bin/activate        # Windows : .venv\\Scripts\\activate\npip install boto3 requests pytest\npip freeze > requirements.txt\n\n# alternative moderne et très rapide\nuv init outils-infra && cd outils-infra\nuv add boto3 httpx && uv add --dev pytest ruff\nuv run pytest' } },
            { h: 'Structure recommandée', bullets: ["`pyproject.toml` : métadonnées, dépendances, config des outils", "`src/mon_paquet/` + `tests/`", "**ruff** : lint + formatage ultra-rapide ; **mypy** : vérification des types", "`if __name__ == \"__main__\":` pour les scripts exécutables"] },
            { h: 'Tester avec pytest', code: { lang: 'python', src: '# tests/test_filtre.py\nimport pytest\nfrom outils.inventaire import Instance, filtrer\n\n@pytest.fixture\ndef parc():\n    return [Instance("i-1", "t3.micro", {"env": "prod"}),\n            Instance("i-2", "t3.micro", {"env": "dev"})]\n\ndef test_filtre_prod(parc):\n    assert [i.id for i in filtrer(parc)] == ["i-1"]\n\n@pytest.mark.parametrize("env,attendu", [("dev", 1), ("qa", 0)])\ndef test_filtre_param(parc, env, attendu):\n    assert len(filtrer(parc, env)) == attendu' } }
          ],
          keypoints: ["Un venv par projet", "pyproject.toml + uv/pip", "pytest : fixtures et parametrize", "ruff + mypy en CI"]
        }
      ]
    },
    {
      title: "Automatisation d'infrastructure",
      lessons: [
        {
          title: 'Scripts robustes : CLI, logs, erreurs, fichiers',
          sections: [
            { h: 'Une CLI professionnelle', code: { lang: 'python', src: 'import argparse, json, logging, sys\nfrom pathlib import Path\n\nlog = logging.getLogger("audit")\n\ndef main(argv: list[str] | None = None) -> int:\n    p = argparse.ArgumentParser(description="Audit d\'inventaire")\n    p.add_argument("fichier", type=Path)\n    p.add_argument("--seuil", type=int, default=80)\n    p.add_argument("-v", "--verbose", action="store_true")\n    args = p.parse_args(argv)\n    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,\n                        format="%(asctime)s %(levelname)s %(message)s")\n    try:\n        data = json.loads(args.fichier.read_text(encoding="utf-8"))\n    except (FileNotFoundError, json.JSONDecodeError) as e:\n        log.error("Lecture impossible : %s", e)\n        return 2\n    alertes = [s for s in data if s["cpu"] > args.seuil]\n    for s in alertes:\n        log.warning("%s à %s%%", s["nom"], s["cpu"])\n    return 1 if alertes else 0\n\nif __name__ == "__main__":\n    sys.exit(main())' } },
            { h: 'Fichiers et formats', bullets: ["`pathlib.Path` plutôt que les chaînes de chemins", "`with open(...) as f:` ferme toujours le fichier", "JSON : module `json` ; YAML : `yaml.safe_load` (**jamais** `yaml.load` non sûr)", "CSV : `csv.DictReader` ; gros volumes : pandas", "Exécuter une commande : `subprocess.run([...], check=True, capture_output=True, text=True)` — pas de `shell=True` avec des entrées utilisateur"] },
            { h: 'Codes de sortie et idempotence', p: "Un script d'automatisation doit renvoyer **0** en cas de succès et un code non nul sinon (la CI s'arrête), journaliser ce qu'il fait, et être **idempotent** : le relancer ne doit rien casser." }
          ],
          keypoints: ["argparse + logging + sys.exit(code)", "yaml.safe_load", "subprocess.run(check=True), pas de shell=True", "Scripts idempotents"]
        },
        {
          title: 'Piloter AWS avec boto3 et appeler des API',
          sections: [
            { h: 'Client vs resource', bullets: ["**client** : API bas niveau, 1:1 avec les appels AWS, renvoie des dictionnaires", "**resource** : API orientée objet (S3, DynamoDB, EC2), plus concise", "**Session** avec profil et région : `boto3.Session(profile_name=\"prod\", region_name=\"eu-west-3\")`", "Paginateurs et **waiters** (`instance_running`, `bucket_exists`)"] },
            { h: 'Exemple : rapport des instances non taguées', code: { lang: 'python', src: 'import boto3, csv\nfrom botocore.exceptions import ClientError\n\nec2 = boto3.client("ec2", region_name="eu-west-3")\nlignes = []\ntry:\n    for page in ec2.get_paginator("describe_instances").paginate(\n            Filters=[{"Name": "instance-state-name", "Values": ["running"]}]):\n        for r in page["Reservations"]:\n            for i in r["Instances"]:\n                tags = {t["Key"]: t["Value"] for t in i.get("Tags", [])}\n                if "owner" not in tags:\n                    lignes.append({"id": i["InstanceId"], "type": i["InstanceType"],\n                                   "nom": tags.get("Name", "-")})\nexcept ClientError as e:\n    raise SystemExit(f"Erreur AWS : {e.response[\'Error\'][\'Code\']}")\n\nwith open("sans_owner.csv", "w", newline="") as f:\n    w = csv.DictWriter(f, fieldnames=["id", "type", "nom"])\n    w.writeheader(); w.writerows(lignes)' } },
            { h: 'API REST', code: { lang: 'python', src: 'import httpx\n\nwith httpx.Client(base_url="https://gitlab.com/api/v4",\n                  headers={"PRIVATE-TOKEN": token}, timeout=10) as api:\n    r = api.get("/projects/123/pipelines", params={"status": "failed", "per_page": 20})\n    r.raise_for_status()\n    for p in r.json():\n        print(p["id"], p["ref"], p["web_url"])' }, bullets: ["Toujours un **timeout** et `raise_for_status()`", "Retries avec backoff (bibliothèque `tenacity` ou `urllib3.Retry`)", "Jetons lus depuis l'environnement (`os.environ`), jamais en dur", "Azure : `azure-identity` + `azure-mgmt-*` avec `DefaultAzureCredential`"] }
          ],
          keypoints: ["client = bas niveau ; resource = objet", "Paginateurs + waiters", "ClientError pour les erreurs AWS", "timeout + raise_for_status"]
        }
      ]
    },
    {
      title: 'Préparation au machine learning',
      lessons: [
        {
          title: 'NumPy et pandas',
          sections: [
            { h: 'NumPy', p: "Tableaux multidimensionnels **vectorisés** : les opérations s'appliquent à tout le tableau sans boucle Python, en C, donc très vite. C'est la base de pandas et scikit-learn." },
            { h: 'pandas : DataFrame', code: { lang: 'python', src: 'import pandas as pd\n\ndf = pd.read_csv("couts_aws.csv", parse_dates=["date"])\ndf.info(); df.describe()\n\n# nettoyer\ndf = df.dropna(subset=["service"]).assign(cout=lambda d: d["cout"].clip(lower=0))\n\n# filtrer, grouper, agréger\nmensuel = (df[df["env"] == "prod"]\n           .groupby([pd.Grouper(key="date", freq="MS"), "service"])["cout"]\n           .sum()\n           .unstack(fill_value=0))\ntop = df.groupby("service")["cout"].sum().nlargest(5)\n\n# joindre\ndf = df.merge(pd.read_csv("equipes.csv"), on="compte", how="left")\nmensuel.plot(kind="area", title="Coûts prod par service")' } },
            { h: "L'essentiel à retenir", bullets: ["`loc` (par libellé) vs `iloc` (par position)", "`groupby` + `agg` = GROUP BY SQL", "`merge` = JOIN ; `concat` = UNION", "Éviter `apply` ligne à ligne si une opération vectorisée existe", "Visualisation : matplotlib, seaborn, plotly"] }
          ],
          keypoints: ["NumPy = calcul vectorisé", "DataFrame : loc/iloc, groupby, merge", "Vectoriser plutôt que boucler"]
        },
        {
          title: 'Premier modèle avec scikit-learn',
          sections: [
            { h: 'Le vocabulaire ML', bullets: ["**Supervisé** : on apprend à prédire une étiquette connue (classification, régression)", "**Non supervisé** : trouver des structures (clustering, détection d'anomalies)", "**Features** (X) et **cible** (y)", "**Surapprentissage** : le modèle apprend par cœur l'entraînement et généralise mal", "Séparer **train / test** (et validation croisée)"] },
            { h: 'Le workflow complet', code: { lang: 'python', src: 'from sklearn.model_selection import train_test_split, cross_val_score\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.metrics import classification_report\n\n# prédire si un déploiement va échouer à partir de métriques de pipeline\nX = df[["nb_fichiers", "lignes_modifiees", "couverture", "duree_build"]]\ny = df["echec"]\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)\n\nmodele = make_pipeline(StandardScaler(), RandomForestClassifier(n_estimators=200, random_state=42))\nprint(cross_val_score(modele, X_train, y_train, cv=5, scoring="f1").mean())\nmodele.fit(X_train, y_train)\nprint(classification_report(y_test, modele.predict(X_test)))' } },
            { h: 'Évaluer correctement', bullets: ["Classification : **précision**, **rappel**, **F1**, matrice de confusion, AUC", "Régression : MAE, RMSE, R²", "Classes déséquilibrées : l'accuracy est trompeuse", "Vers la production : SageMaker, Azure Machine Learning, MLflow pour le suivi des expériences"] }
          ],
          keypoints: ["train_test_split + pipeline + cross_val_score", "Précision / rappel / F1", "Surapprentissage = écart train/test", "MLflow, SageMaker, Azure ML pour la production"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Outil CLI d\'audit AWS testé',
      goal: "Écrire un outil en ligne de commande qui liste les ressources non conformes (instances sans tag owner, buckets sans chiffrement par défaut explicite), avec tests pytest utilisant des mocks.",
      minutes: 90, env: 'Python 3.12, compte AWS (lecture seule suffit)',
      steps: [
        { t: "Créez le projet avec uv (ou venv) : dépendances `boto3`, dev `pytest`, `moto`, `ruff`.", cmd: "uv init audit-aws && cd audit-aws\nuv add boto3 && uv add --dev pytest moto ruff" },
        { t: "Écrivez `audit.py` avec argparse : sous-commandes `instances` et `buckets`, option `--region`, sortie CSV ou JSON." },
        { t: "Implémentez `instances` avec un paginateur et le filtre `running` (voir la leçon boto3)." },
        { t: "Implémentez `buckets` : `list_buckets` puis `get_bucket_encryption` ; gérez `ClientError`." },
        { t: "Écrivez des tests avec **moto** (AWS simulé) : créez 2 instances dont une taguée, vérifiez le résultat.", lang: 'python', cmd: "from moto import mock_aws\nimport boto3\nfrom audit import instances_sans_owner\n\n@mock_aws\ndef test_instances():\n    ec2 = boto3.client(\"ec2\", region_name=\"eu-west-3\")\n    ec2.run_instances(ImageId=\"ami-12345678\", MinCount=2, MaxCount=2)\n    assert len(instances_sans_owner(\"eu-west-3\")) == 2" },
        { t: "Lancez lint et tests, puis exécutez l'outil sur votre compte.", cmd: "uv run ruff check . && uv run pytest -q\nuv run python audit.py instances --region eu-west-3 --format csv", check: "Tests verts et un CSV produit." },
        { t: "Bonus : ajoutez un job GitLab CI qui exécute ruff et pytest." }
      ]
    },
    {
      title: 'Analyse de coûts avec pandas',
      goal: "Analyser un export de coûts (CSV) : top services, évolution mensuelle, anomalies.",
      minutes: 45, env: 'Python + pandas + matplotlib (Jupyter recommandé)',
      steps: [
        { t: "Générez un jeu de données de 12 mois (ou exportez un CSV depuis Cost Explorer).", lang: 'python', cmd: "import pandas as pd, numpy as np\nrng = np.random.default_rng(1)\ndates = pd.date_range(\"2026-01-01\", periods=365)\nservices = [\"EC2\", \"S3\", \"RDS\", \"Lambda\", \"CloudWatch\"]\ndf = pd.DataFrame([{\"date\": d, \"service\": s, \"env\": rng.choice([\"prod\", \"dev\"]),\n                    \"cout\": abs(rng.normal(20 if s == \"EC2\" else 5, 2))}\n                   for d in dates for s in services])\ndf.to_csv(\"couts_aws.csv\", index=False)" },
        { t: "Calculez le coût total par service et le top 3." },
        { t: "Construisez un tableau mensuel par service et tracez-le." },
        { t: "Détectez les jours anormaux : coût > moyenne + 3 écarts-types par service.", hint: "groupby('service')['cout'].transform('mean') et 'std'." }
      ]
    }
  ],
  quiz: [
    { q: "Pourquoi ne jamais écrire `def f(x=[])` ?", options: ["La liste par défaut est créée une seule fois et partagée entre les appels", "C'est une erreur de syntaxe", "Les listes ne peuvent pas être des paramètres", "Cela ralentit l'interpréteur"], answer: 0, explain: "Utilisez `x=None` puis `x = x or []` (ou `field(default_factory=list)` dans une dataclass)." },
    { q: "Quelle fonction charger pour lire un YAML non fiable en toute sécurité ?", options: ["yaml.safe_load", "yaml.load sans Loader", "eval", "json.loads"], answer: 0, explain: "yaml.load avec un chargeur complet peut instancier des objets Python arbitraires." },
    { q: "Quelle est la différence entre boto3.client et boto3.resource ?", options: ["client est bas niveau (dictionnaires), resource est orienté objet", "resource est plus bas niveau", "client ne fonctionne que pour S3", "Aucune"], answer: 0, explain: "resource n'existe que pour certains services (S3, EC2, DynamoDB…)." },
    { q: "Comment parcourir tous les résultats d'un appel AWS paginé ?", options: ["Utiliser un paginateur (get_paginator)", "Augmenter MaxResults à l'infini", "Appeler une seule fois", "Utiliser un waiter"], answer: 0, explain: "Le paginateur gère NextToken automatiquement." },
    { q: "Quel code de sortie doit renvoyer un script d'automatisation en cas de succès ?", options: ["0", "1", "-1", "200"], answer: 0, explain: "Toute valeur non nulle signale une erreur à la CI ou au shell." },
    { q: "En pandas, quelle différence entre loc et iloc ?", options: ["loc sélectionne par libellé, iloc par position entière", "Aucune", "iloc est plus lent", "loc ne fonctionne que sur les colonnes"], answer: 0, explain: "df.loc['2026-01', 'cout'] vs df.iloc[0, 2]." },
    { q: "Pourquoi séparer les données en train et test ?", options: ["Pour estimer la performance sur des données jamais vues", "Pour accélérer l'entraînement", "Pour réduire la mémoire", "C'est obligatoire pour pandas"], answer: 0, explain: "Évaluer sur les données d'entraînement masque le surapprentissage." },
    { q: "Avec des classes très déséquilibrées (1 % d'échecs), quelle métrique est trompeuse ?", options: ["L'accuracy", "Le rappel", "Le F1-score", "La matrice de confusion"], answer: 0, explain: "Un modèle qui prédit toujours « succès » a 99 % d'accuracy mais ne sert à rien." },
    { q: "Comment exécuter une commande système en toute sécurité ?", options: ["subprocess.run(['cmd', 'arg'], check=True)", "os.system(chaine_utilisateur)", "subprocess.run(chaine, shell=True) avec entrée utilisateur", "eval(commande)"], answer: 0, explain: "Une liste d'arguments sans shell évite l'injection de commandes." },
    { q: "Quel outil simule les services AWS pour tester du code boto3 ?", options: ["moto", "pytest-cov", "ruff", "tox"], answer: 0, explain: "Le décorateur @mock_aws intercepte les appels boto3." }
  ],
  flashcards: [
    ["Créer et activer un venv", "python3 -m venv .venv && source .venv/bin/activate"],
    ["Compréhension de dictionnaire", "{k: v for k, v in items if cond}"],
    ["Défaut mutable : solution", "def f(x=None): x = x or []  (ou default_factory dans une dataclass)"],
    ["dataclass immuable", "@dataclass(frozen=True)"],
    ["pytest : réutiliser un jeu de données", "@pytest.fixture"],
    ["pytest : tester plusieurs cas", "@pytest.mark.parametrize(\"a,b\", [(1, 2), …])"],
    ["Lire un YAML sûrement", "yaml.safe_load(f)"],
    ["boto3 : parcourir des résultats paginés", "client.get_paginator(\"describe_instances\").paginate(...)"],
    ["boto3 : attendre un état", "Waiters : client.get_waiter(\"instance_running\").wait(...)"],
    ["Erreur AWS dans boto3", "botocore.exceptions.ClientError → e.response['Error']['Code']"],
    ["Appel HTTP robuste", "timeout explicite + raise_for_status() + retries avec backoff"],
    ["pandas : GROUP BY", "df.groupby(\"col\")[\"val\"].sum() / .agg(...)"],
    ["pandas : JOIN", "df.merge(autre, on=\"cle\", how=\"left\")"],
    ["Surapprentissage", "Très bon sur l'entraînement, mauvais sur le test"],
    ["Précision vs rappel", "Précision : parmi les prédits positifs, combien le sont vraiment · Rappel : parmi les vrais positifs, combien sont trouvés"],
    ["Pipeline scikit-learn", "make_pipeline(StandardScaler(), Modele()) — évite la fuite de données"]
  ]
});
