ACADEMY.courses.push({
  id: 'docker', phase: 2, kind: 'tech', order: 4,
  title: 'Docker & Docker Registry', icon: '🐳', category: 'Containers',
  hours: '~30h', priority: 5,
  subtitle: "Conteneuriser des applications : images, Dockerfile optimisé multi-stage, réseaux, volumes, Compose, registres et sécurité.",
  description: "Le conteneur est l'unité de déploiement standard. Vous comprendrez ce qu'est réellement un conteneur (namespaces, cgroups), écrirez des Dockerfile petits, rapides et sûrs, orchestrerez un environnement local avec Docker Compose et publierez vos images dans des registres (GitLab, ECR, ACR, Harbor) avec scan et signature.",
  searchTerm: 'Docker tutoriel complet', searchTermEn: 'Docker Dockerfile best practices',
  outcomes: [
    "Expliquer conteneur vs VM : namespaces, cgroups, couches d'image",
    "Maîtriser le cycle de vie : run, exec, logs, inspect, stop, rm",
    "Écrire des Dockerfile multi-stage optimisés (cache, taille, sécurité)",
    "Gérer réseaux, volumes et variables d'environnement",
    "Décrire un environnement multi-conteneurs avec Docker Compose",
    "Taguer, pousser et gérer des images dans un registre (ECR, ACR, GitLab)",
    "Sécuriser : utilisateur non root, images minimales, scan (Trivy), SBOM, signature"
  ],
  prerequisites: ["Linux en ligne de commande", "Docker Desktop ou Docker Engine installé"],
  resources: [
    { label: 'Documentation Docker', url: 'https://docs.docker.com/' },
    { label: 'Bonnes pratiques Dockerfile', url: 'https://docs.docker.com/build/building/best-practices/' },
    { label: 'Trivy (scanner de vulnérabilités)', url: 'https://trivy.dev/' },
    { label: 'Play with Docker (bac à sable en ligne)', url: 'https://labs.play-with-docker.com/' }
  ],
  modules: [
    {
      title: 'Fondamentaux',
      lessons: [
        {
          title: "Qu'est-ce qu'un conteneur ?",
          sections: [
            { h: 'Conteneur vs machine virtuelle', p: "Une VM embarque un **système d'exploitation complet** sur un hyperviseur. Un conteneur est un **processus isolé** qui partage le noyau de l'hôte : démarrage en millisecondes, empreinte de quelques Mo, densité élevée.", bullets: ["**Namespaces** : isolation de ce que voit le processus (PID, réseau, montages, utilisateurs, hostname)", "**cgroups** : limitation de ce qu'il consomme (CPU, mémoire, I/O)", "**Union filesystem** : image en couches en lecture seule + couche d'écriture du conteneur"] },
            { h: 'Image, conteneur, registre', bullets: ["**Image** : modèle immuable en couches, identifiée par `nom:tag` et un **digest** sha256", "**Conteneur** : instance en cours d'exécution d'une image", "**Registre** : stockage et distribution des images (Docker Hub, ECR, ACR, GitLab)", "Standard **OCI** : images et runtimes interopérables (containerd, CRI-O, Podman)"] },
            { h: 'Les commandes du quotidien', code: { lang: 'bash', src: 'docker run -d --name web -p 8080:80 nginx:1.27-alpine\ndocker ps                        # conteneurs actifs (-a : tous)\ndocker logs -f web\ndocker exec -it web sh           # shell dans le conteneur\ndocker inspect web | less\ndocker stats                     # CPU / mémoire en direct\ndocker stop web && docker rm web\ndocker image ls && docker system prune   # nettoyage' } }
          ],
          keypoints: ["Conteneur = processus isolé partageant le noyau", "Namespaces = isolation ; cgroups = limites", "Image immuable en couches ; digest = identité exacte"]
        },
        {
          title: 'Écrire un Dockerfile de qualité',
          sections: [
            { h: 'Instructions principales', bullets: ["`FROM` image de base ; `WORKDIR` ; `COPY` (préférer à `ADD`)", "`RUN` : exécute au build et crée une couche", "`ENV` / `ARG` : variables d'exécution / de build", "`EXPOSE` : documentation du port", "`USER` : utilisateur d'exécution", "`ENTRYPOINT` (exécutable) + `CMD` (arguments par défaut), en **forme exec** JSON"] },
            { h: 'Multi-stage : image finale minimale', code: { lang: 'dockerfile', src: '# ---- étape de build ----\nFROM maven:3.9-eclipse-temurin-21 AS build\nWORKDIR /src\nCOPY pom.xml .\nRUN mvn -B -q dependency:go-offline        # couche mise en cache tant que pom.xml ne change pas\nCOPY src ./src\nRUN mvn -B -q package -DskipTests\n\n# ---- image d\'exécution ----\nFROM eclipse-temurin:21-jre-alpine\nWORKDIR /app\nRUN addgroup -S app && adduser -S app -G app\nCOPY --from=build /src/target/*.jar app.jar\nUSER app\nEXPOSE 8080\nENV JAVA_OPTS="-XX:MaxRAMPercentage=75"\nHEALTHCHECK CMD wget -qO- http://localhost:8080/actuator/health || exit 1\nENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]' } },
            { h: 'Optimiser le cache et la taille', bullets: ["Copier d'abord les fichiers de dépendances, puis le code source", "Regrouper les `RUN` et nettoyer dans la même couche (`apt-get … && rm -rf /var/lib/apt/lists/*`)", "`.dockerignore` : exclure `.git`, `target`, `node_modules`, secrets", "Images de base minimales : `-alpine`, `-slim`, **distroless**", "Épingler les versions (tag précis, voire digest)", "BuildKit : `--mount=type=cache` pour les caches de paquets, `--mount=type=secret` pour les secrets de build"] }
          ],
          keypoints: ["Multi-stage : build lourd, runtime minimal", "Dépendances avant le code pour le cache", "USER non root, forme exec, .dockerignore", "Jamais de secret dans une couche"]
        }
      ]
    },
    {
      title: 'Exécution et environnements',
      lessons: [
        {
          title: 'Réseaux, volumes et configuration',
          sections: [
            { h: 'Réseaux', bullets: ["**bridge** (défaut) : réseau privé sur l'hôte ; `-p hôte:conteneur` pour publier", "Réseau bridge **personnalisé** : résolution DNS par nom de conteneur", "**host** : partage la pile réseau de l'hôte (Linux)", "**none** : aucun réseau", "overlay : multi-hôtes (Swarm)"], code: { lang: 'bash', src: 'docker network create app-net\ndocker run -d --name db --network app-net -e POSTGRES_PASSWORD=secret postgres:16\ndocker run -d --name api --network app-net -e DB_URL=jdbc:postgresql://db:5432/postgres -p 8080:8080 api:1.0' } },
            { h: 'Persistance', bullets: ["La couche d'écriture du conteneur **disparaît** avec lui", "**Volume nommé** (géré par Docker) : `-v pgdata:/var/lib/postgresql/data` — recommandé pour les données", "**Bind mount** : dossier de l'hôte, pratique en développement", "**tmpfs** : en mémoire"] },
            { h: 'Configuration et ressources', bullets: ["Variables : `-e`, `--env-file .env`", "Limites : `--memory 512m --cpus 1.5` (cgroups)", "Politique de redémarrage : `--restart unless-stopped`", "Lecture seule : `--read-only` + tmpfs pour `/tmp`", "Moins de privilèges : `--cap-drop ALL`, jamais `--privileged` sans raison forte"] }
          ],
          keypoints: ["Réseau personnalisé = DNS par nom", "Volume nommé pour les données", "Limiter mémoire et CPU", "cap-drop, read-only, pas de privileged"]
        },
        {
          title: 'Docker Compose',
          sections: [
            { h: 'Décrire une stack locale', code: { lang: 'yaml', src: 'services:\n  api:\n    build: .\n    ports: ["8080:8080"]\n    environment:\n      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/commandes\n      SPRING_DATASOURCE_USERNAME: app\n      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:?définir DB_PASSWORD}\n    depends_on:\n      db:\n        condition: service_healthy\n  db:\n    image: postgres:16\n    environment:\n      POSTGRES_DB: commandes\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\n    volumes: [pgdata:/var/lib/postgresql/data]\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U app -d commandes"]\n      interval: 5s\n      retries: 10\n  adminer:\n    image: adminer\n    ports: ["8081:8080"]\n    profiles: [outils]\nvolumes:\n  pgdata:' } },
            { h: 'Commandes', code: { lang: 'bash', src: 'docker compose up -d --build\ndocker compose ps\ndocker compose logs -f api\ndocker compose --profile outils up -d   # démarre aussi adminer\ndocker compose down            # -v pour supprimer aussi les volumes' } },
            { h: 'Bonnes pratiques', bullets: ["`depends_on` + `condition: service_healthy` pour l'ordre de démarrage réel", "Fichier `.env` pour les variables locales (non commité)", "`compose.override.yaml` pour les spécificités de développement", "Compose = développement et tests d'intégration ; en production : Kubernetes, ECS, Container Apps"] }
          ],
          keypoints: ["depends_on + healthcheck", "Un réseau et un DNS par projet Compose", "down -v supprime les volumes", "Compose pour le dev, orchestrateur pour la prod"]
        }
      ]
    },
    {
      title: 'Registres et sécurité',
      lessons: [
        {
          title: 'Registres : tags, ECR, ACR, GitLab',
          sections: [
            { h: 'Stratégie de tags', bullets: ["Le tag `latest` n'est qu'un nom par défaut : **ne jamais déployer `latest`**", "Tags immuables : version sémantique (`1.4.2`) + SHA de commit (`a1b2c3d`)", "Déployer par **digest** (`image@sha256:…`) pour une reproductibilité totale", "Tags mutables autorisés seulement pour les environnements (`staging`) si besoin"] },
            { h: 'Pousser vers un registre cloud', code: { lang: 'bash', src: '# AWS ECR\naws ecr create-repository --repository-name commandes-api --image-scanning-configuration scanOnPush=true\naws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.eu-west-3.amazonaws.com\ndocker tag commandes-api:1.0.0 123456789012.dkr.ecr.eu-west-3.amazonaws.com/commandes-api:1.0.0\ndocker push 123456789012.dkr.ecr.eu-west-3.amazonaws.com/commandes-api:1.0.0\n\n# Azure ACR\naz acr login -n acrcommandes && docker push acrcommandes.azurecr.io/commandes-api:1.0.0\n\n# GitLab\ndocker login registry.gitlab.com && docker push registry.gitlab.com/groupe/projet:1.0.0' } },
            { h: 'Gestion du registre', bullets: ["**Lifecycle policies** (ECR) / tâches de purge (ACR) : supprimer les images anciennes", "Immutabilité des tags activée (ECR `IMMUTABLE`)", "Réplication inter-régions pour la reprise", "Registre **privé** + accès par rôle (pull depuis EKS/ECS/AKS avec identité)", "Harbor : registre auto-hébergé avec scan et réplication"] },
            { h: 'Images multi-architectures', p: "Avec `docker buildx build --platform linux/amd64,linux/arm64 --push`, un même tag sert x86 et ARM (Graviton, Mac Apple Silicon) grâce à un **manifest list**." }
          ],
          keypoints: ["Jamais latest en production", "SemVer + SHA ; digest pour la reproductibilité", "Lifecycle policies + tags immuables", "buildx multi-arch pour Graviton"]
        },
        {
          title: 'Sécurité des conteneurs et de la supply chain',
          sections: [
            { h: 'Durcir l\'image', bullets: ["Base minimale (distroless, alpine, chiseled) = moins de CVE", "**Utilisateur non root** (`USER`)", "Aucun outil inutile (curl, gcc, shell) dans l'image finale", "Mises à jour régulières de l'image de base (rebuild automatique)"] },
            { h: 'Scanner', code: { lang: 'bash', src: '# vulnérabilités de l\'image\ntrivy image --severity HIGH,CRITICAL --exit-code 1 commandes-api:1.0.0\n# mauvaises configurations du Dockerfile\ntrivy config .\n# linter Dockerfile\nhadolint Dockerfile' } },
            { h: 'Supply chain', bullets: ["**SBOM** (Software Bill of Materials) : `docker buildx build --sbom=true` ou `syft`", "**Signature** d'images : Cosign (Sigstore), vérification à l'admission dans Kubernetes", "**Provenance** SLSA : attestations de build", "Politiques d'admission : n'autoriser que les images signées de registres approuvés (Kyverno, Gatekeeper)"] },
            { h: "À l'exécution", bullets: ["Système de fichiers en lecture seule, capabilities supprimées", "Profils seccomp / AppArmor", "Détection runtime : Falco", "Secrets injectés à l'exécution (variables, fichiers montés), jamais dans l'image"] }
          ],
          keypoints: ["Non root + base minimale", "Trivy en CI avec exit-code bloquant", "SBOM + Cosign", "Secrets à l'exécution uniquement"]
        }
      ]
    }
  ],
  labs: [
    {
      title: "Conteneuriser l'API et sa base avec Compose",
      goal: "Écrire un Dockerfile multi-stage non root pour l'API Spring Boot, orchestrer API + PostgreSQL avec Compose, scanner et pousser l'image.",
      minutes: 75, env: 'Docker, projet Spring Boot',
      steps: [
        { t: "Créez un `.dockerignore` (target, .git, .idea, *.md)." },
        { t: "Écrivez le Dockerfile multi-stage de la leçon et construisez l'image.", cmd: "docker build -t commandes-api:1.0.0 .\ndocker image ls commandes-api", check: "Image finale < 250 Mo." },
        { t: "Vérifiez que le processus ne tourne pas en root.", cmd: "docker run --rm --entrypoint id commandes-api:1.0.0", check: "uid différent de 0." },
        { t: "Écrivez `compose.yaml` (api + db avec healthcheck + volume) et un fichier `.env` avec DB_PASSWORD." },
        { t: "Démarrez la stack et testez l'API.", cmd: "docker compose up -d --build\ncurl -s localhost:8080/actuator/health" },
        { t: "Modifiez une classe Java et reconstruisez : observez quelles couches sont reprises du cache." },
        { t: "Scannez l'image avec Trivy et corrigez une vulnérabilité (mise à jour de l'image de base).", cmd: "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image commandes-api:1.0.0" },
        { t: "Poussez l'image dans le registre de votre projet GitLab (ou ECR) avec un tag de version ET un tag de commit." }
      ],
      cleanup: "docker compose down -v"
    }
  ],
  quiz: [
    { q: "Quel mécanisme du noyau Linux limite la mémoire et le CPU d'un conteneur ?", options: ["Les cgroups", "Les namespaces", "Le chroot", "SELinux"], answer: 0, explain: "Namespaces = isolation de la vue ; cgroups = limitation des ressources." },
    { q: "Pourquoi copier pom.xml (ou package.json) avant le code source dans un Dockerfile ?", options: ["Pour que la couche d'installation des dépendances reste en cache tant qu'ils ne changent pas", "Parce que Docker l'exige", "Pour réduire la taille de l'image finale", "Pour la sécurité"], answer: 0, explain: "Une modification du code n'invalide alors que les couches suivantes." },
    { q: "Quel est l'intérêt principal d'un build multi-stage ?", options: ["Produire une image finale minimale sans les outils de build", "Construire plusieurs images en parallèle", "Remplacer Docker Compose", "Chiffrer l'image"], answer: 0, explain: "Le JDK, Maven et le code source restent dans l'étape de build." },
    { q: "Comment deux conteneurs se joignent-ils par leur nom ?", options: ["En étant sur le même réseau bridge personnalisé", "Sur le réseau bridge par défaut automatiquement", "Avec --network none", "Via EXPOSE"], answer: 0, explain: "Le DNS intégré de Docker fonctionne sur les réseaux définis par l'utilisateur (et dans Compose)." },
    { q: "Où stocker les données d'une base PostgreSQL conteneurisée ?", options: ["Dans un volume nommé", "Dans la couche d'écriture du conteneur", "Dans l'image", "Dans une variable d'environnement"], answer: 0, explain: "La couche d'écriture disparaît avec le conteneur." },
    { q: "Pourquoi ne pas déployer le tag `latest` ?", options: ["Il est mutable et ne permet pas de savoir quelle version tourne ni de revenir en arrière", "Il est plus lent", "Il est interdit par Docker Hub", "Il ne fonctionne pas avec Kubernetes"], answer: 0, explain: "Utilisez des tags immuables (version, SHA) ou des digests." },
    { q: "Comment Compose peut-il attendre qu'une base soit réellement prête ?", options: ["depends_on avec condition: service_healthy et un healthcheck", "depends_on seul", "restart: always", "links"], answer: 0, explain: "depends_on seul n'attend que le démarrage du conteneur, pas la disponibilité du service." },
    { q: "Quelle forme de CMD/ENTRYPOINT est recommandée ?", options: ["La forme exec JSON : [\"java\", \"-jar\", \"app.jar\"]", "La forme shell : java -jar app.jar", "Les deux sont identiques", "Aucune, utiliser RUN"], answer: 0, explain: "La forme exec fait du processus le PID 1 qui reçoit correctement les signaux (SIGTERM)." },
    { q: "Quel outil scanne une image pour trouver des CVE et peut faire échouer la CI ?", options: ["Trivy", "Hadolint", "Docker Compose", "BuildKit"], answer: 0, explain: "Hadolint est un linter de Dockerfile ; Trivy scanne images, fichiers et IaC." },
    { q: "Comment construire une image utilisable à la fois sur x86 et sur ARM (Graviton) ?", options: ["docker buildx build --platform linux/amd64,linux/arm64", "docker build --arch all", "Deux Dockerfile différents obligatoires", "Ce n'est pas possible"], answer: 0, explain: "buildx publie un manifest list multi-architecture." }
  ],
  flashcards: [
    ["Namespaces vs cgroups", "Namespaces : ce que le processus voit (isolation) · cgroups : ce qu'il consomme (limites)"],
    ["Image vs conteneur", "Image : modèle immuable en couches · Conteneur : instance en exécution avec une couche d'écriture"],
    ["COPY vs ADD", "Préférer COPY ; ADD décompresse les archives et accepte des URL (effets surprenants)"],
    ["ENTRYPOINT vs CMD", "ENTRYPOINT : l'exécutable · CMD : arguments par défaut (surchargeables)"],
    ["Forme exec", "[\"java\",\"-jar\",\"app.jar\"] — PID 1, reçoit SIGTERM"],
    ["Optimiser le cache de build", "Copier les fichiers de dépendances et installer AVANT de copier le code"],
    ["Multi-stage", "FROM … AS build puis COPY --from=build dans une image d'exécution minimale"],
    ["Secret au build", "RUN --mount=type=secret,id=… (BuildKit), jamais ARG/ENV"],
    ["DNS entre conteneurs", "Réseau bridge personnalisé (ou Compose) : résolution par nom de service"],
    ["Volume nommé vs bind mount", "Volume : géré par Docker (données) · Bind mount : dossier de l'hôte (dev)"],
    ["Compose : attendre la base", "depends_on: db: condition: service_healthy + healthcheck"],
    ["Tag vs digest", "Tag : nom mutable · Digest sha256 : identité immuable du contenu"],
    ["Connexion à ECR", "aws ecr get-login-password | docker login --username AWS --password-stdin <registre>"],
    ["Scanner une image", "trivy image --severity HIGH,CRITICAL --exit-code 1 image:tag"],
    ["SBOM", "Inventaire des composants logiciels de l'image (syft, buildx --sbom)"],
    ["Signer une image", "Cosign (Sigstore) + politique d'admission qui vérifie la signature"]
  ]
});
