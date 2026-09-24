ACADEMY.courses.push({
  id: 'nodejs', phase: 4, kind: 'tech', order: 3,
  title: 'Node.js — Backend', icon: '🟢', category: 'Backend JS',
  hours: '~30h', priority: 3,
  subtitle: "Comprendre et construire des services Node.js : boucle d'événements, asynchrone, API HTTP, validation, tests, sécurité et exploitation.",
  description: "Node.js est omniprésent (BFF, fonctions Lambda, outillage). Vous comprendrez son modèle d'exécution mono-thread à boucle d'événements, écrirez une API REST robuste (Fastify/Express), la testerez, la sécuriserez et la rendrez exploitable en production (logs, arrêt gracieux, conteneur) — pour juger en connaissance de cause quand Node est le bon choix face à Java.",
  searchTerm: 'Node.js cours backend', searchTermEn: 'Node.js backend event loop',
  outcomes: [
    "Expliquer la boucle d'événements, libuv et le modèle d'I/O non bloquant",
    "Maîtriser l'asynchrone : Promises, async/await, gestion d'erreurs, concurrence",
    "Organiser un projet : modules ES, npm, configuration, variables d'environnement",
    "Construire une API REST avec Fastify ou Express, validation et gestion d'erreurs",
    "Tester avec le test runner natif / Vitest et Supertest",
    "Sécuriser et exploiter : logs structurés, arrêt gracieux, clustering, conteneur",
    "Écrire des fonctions serverless Node (Lambda, Azure Functions)"
  ],
  prerequisites: ["JavaScript moderne", "npm (cours Maven & NPM)", "Node.js LTS installé"],
  resources: [
    { label: 'Documentation Node.js', url: 'https://nodejs.org/docs/latest/api/' },
    { label: "Guide officiel : la boucle d'événements", url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick' },
    { label: 'Fastify', url: 'https://fastify.dev/' },
    { label: 'Node.js Best Practices (GitHub)', url: 'https://github.com/goldbergyoni/nodebestpractices' }
  ],
  modules: [
    {
      title: 'Le modèle Node.js',
      lessons: [
        {
          title: "La boucle d'événements",
          sections: [
            { h: 'Un seul thread pour votre code', p: "Node exécute votre JavaScript sur **un seul thread**. Les opérations d'I/O (réseau, fichiers, base) sont déléguées au système ou au pool de threads de **libuv** ; quand elles se terminent, leurs callbacks sont placés en file et exécutés par la **boucle d'événements**. Résultat : des milliers de connexions simultanées avec peu de mémoire… tant que personne ne bloque le thread." },
            { h: 'Les phases de la boucle', bullets: ["**timers** (`setTimeout`, `setInterval`)", "**pending callbacks**, **poll** (nouvelles I/O), **check** (`setImmediate`), **close callbacks**", "Entre chaque callback : les **microtâches** (`process.nextTick` puis Promises) sont vidées", "Conséquence : un calcul CPU de 2 secondes bloque TOUTES les requêtes pendant 2 secondes"] },
            { h: 'Ne pas bloquer', code: { lang: 'js', src: '// ❌ bloque la boucle\nconst data = fs.readFileSync("gros.json");\nconst hash = crypto.pbkdf2Sync(mdp, sel, 600000, 64, "sha512");\n\n// ✅ non bloquant\nconst data2 = await fs.promises.readFile("gros.json");\nconst hash2 = await util.promisify(crypto.pbkdf2)(mdp, sel, 600000, 64, "sha512");\n\n// ✅ calcul lourd : worker thread\nimport { Worker } from "node:worker_threads";\nconst w = new Worker(new URL("./calcul.js", import.meta.url), { workerData: lot });' }, bullets: ["CPU intensif → **worker threads**, un service dédié, ou un autre langage", "Mesurer : `perf_hooks.monitorEventLoopDelay`, `--inspect`, clinic.js", "Node excelle en I/O (API, BFF, temps réel) ; Java excelle aussi en calcul et en écosystème d'entreprise"] }
          ],
          keypoints: ["Un thread pour le JS, libuv pour l'I/O", "Microtâches entre chaque callback", "Jamais de *Sync ni de calcul lourd dans une requête", "Worker threads pour le CPU"]
        },
        {
          title: 'Asynchrone, modules et configuration',
          sections: [
            { h: 'async / await et erreurs', code: { lang: 'js', src: '// séquentiel (lent si indépendants)\nconst client = await getClient(id);\nconst cmds = await getCommandes(id);\n\n// parallèle\nconst [client2, cmds2] = await Promise.all([getClient(id), getCommandes(id)]);\n\n// tolérant aux échecs partiels\nconst resultats = await Promise.allSettled(urls.map(u => fetch(u)));\n\n// timeout avec AbortSignal\nconst r = await fetch(url, { signal: AbortSignal.timeout(2000) });\n\n// toujours gérer les erreurs\ntry { await payer(cmd); }\ncatch (err) { logger.error({ err, cmdId: cmd.id }, "paiement échoué"); throw err; }' }, bullets: ["Une Promise rejetée non gérée fait **planter le processus** (comportement par défaut)", "Limiter la concurrence (p-limit) pour ne pas saturer une base ou une API", "`fetch` est natif depuis Node 18"] },
            { h: 'Modules et projet', bullets: ["**ES modules** (`\"type\": \"module\"`, `import`/`export`) vs CommonJS (`require`)", "Préfixe `node:` pour les modules natifs (`node:fs`, `node:crypto`)", "Versions **LTS paires** (20, 22, 24) en production ; `.nvmrc` / `engines`", "**TypeScript** fortement recommandé (tsc, tsx ; Node 22.6+ peut exécuter du TS simple nativement avec l'option de type stripping)"] },
            { h: 'Configuration', bullets: ["Variables d'environnement (`process.env`), `node --env-file=.env` (Node 20.6+)", "Valider la configuration au démarrage (Zod) et échouer tôt", "Secrets depuis Secrets Manager / Key Vault, jamais dans le dépôt"] }
          ],
          keypoints: ["Promise.all pour le parallèle", "Rejet non géré = crash", "AbortSignal.timeout", "ES modules + LTS paire + TypeScript"]
        }
      ]
    },
    {
      title: 'Construire et exploiter une API',
      lessons: [
        {
          title: 'API REST avec Fastify',
          sections: [
            { h: 'Pourquoi Fastify ?', p: "**Express** est historique et omniprésent ; **Fastify** est plus performant, intègre la validation par **JSON Schema**, la sérialisation rapide, les plugins encapsulés et un logger structuré (**pino**). NestJS apporte une architecture inspirée d'Angular/Spring pour les grandes équipes." },
            { h: 'Une route validée', code: { lang: 'js', src: 'import Fastify from "fastify";\n\nconst app = Fastify({ logger: true });\n\nconst schemaCreation = {\n  body: {\n    type: "object",\n    required: ["client", "montant"],\n    properties: {\n      client: { type: "string", minLength: 1 },\n      montant: { type: "number", exclusiveMinimum: 0 }\n    },\n    additionalProperties: false\n  }\n};\n\napp.post("/api/commandes", { schema: schemaCreation }, async (req, reply) => {\n  const cmd = await depot.creer(req.body);\n  return reply.code(201).send(cmd);\n});\n\napp.get("/api/commandes/:id", async (req, reply) => {\n  const cmd = await depot.trouver(req.params.id);\n  if (!cmd) return reply.code(404).send({ title: "Commande introuvable" });\n  return cmd;\n});\n\napp.get("/health", async () => ({ status: "UP" }));\n\nawait app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });' } },
            { h: 'Données et architecture', bullets: ["Accès aux données : **Prisma**, Drizzle, Knex ou pilote natif (`pg`) ; pool de connexions", "Couches : routes → services → dépôts (testables séparément)", "Erreurs : gestionnaire centralisé (`setErrorHandler`), format ProblemDetails", "Documentation : `@fastify/swagger` à partir des schémas"] }
          ],
          keypoints: ["Fastify : JSON Schema + pino", "additionalProperties: false", "Routes → services → dépôts", "host 0.0.0.0 en conteneur"]
        },
        {
          title: 'Tests, sécurité et production',
          sections: [
            { h: 'Tester', code: { lang: 'js', src: 'import { test } from "node:test";\nimport assert from "node:assert/strict";\nimport { construireApp } from "../src/app.js";\n\ntest("POST /api/commandes refuse un montant négatif", async () => {\n  const app = construireApp({ depot: depotEnMemoire() });\n  const res = await app.inject({ method: "POST", url: "/api/commandes",\n                                 payload: { client: "Ada", montant: -5 } });\n  assert.equal(res.statusCode, 400);\n});' }, bullets: ["Runner natif `node --test` ou **Vitest** / Jest", "`app.inject` (Fastify) ou **Supertest** (Express) sans ouvrir de port", "Testcontainers existe aussi pour Node"] },
            { h: 'Sécurité', bullets: ["`npm audit`, Dependabot/Renovate, lockfile committé, `npm ci`", "Valider TOUTES les entrées ; requêtes SQL paramétrées", "En-têtes (`@fastify/helmet`), CORS explicite, **rate limiting**", "Pas de `eval`, attention aux attaques de pollution de prototype et aux regex catastrophiques (ReDoS)", "Exécuter en utilisateur non root dans le conteneur"] },
            { h: 'Exploitation', code: { lang: 'js', src: '// arrêt gracieux : Kubernetes envoie SIGTERM avant de tuer le pod\nfor (const sig of ["SIGTERM", "SIGINT"]) {\n  process.on(sig, async () => {\n    app.log.info({ sig }, "arrêt en cours");\n    await app.close();          // termine les requêtes en cours, ferme le serveur\n    await pool.end();           // ferme les connexions à la base\n    process.exit(0);\n  });\n}' }, bullets: ["Logs JSON (pino) avec identifiant de requête ; traces **OpenTelemetry**", "Un processus par conteneur, scaler horizontalement (plutôt que le module `cluster`)", "Image : `node:22-alpine` ou distroless, `NODE_ENV=production`, `npm ci --omit=dev`", "Lambda Node : initialiser les clients hors du handler, bundler (esbuild) pour réduire le cold start"] }
          ],
          keypoints: ["app.inject pour tester sans port", "Validation + helmet + rate limit", "Arrêt gracieux sur SIGTERM", "Un processus par conteneur"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Microservice Node conteneurisé',
      goal: "Créer un microservice Fastify « notifications » validé, testé, avec arrêt gracieux, et l'exécuter dans Docker aux côtés de l'API Java.",
      minutes: 75, env: 'Node.js LTS + Docker',
      steps: [
        { t: "Initialisez le projet en ES modules.", cmd: "mkdir notif && cd notif && npm init -y && npm pkg set type=module\nnpm i fastify pino" },
        { t: "Créez `src/app.js` exportant `construireApp({ depot })` avec `POST /notifications` (schéma : destinataire e-mail, message ≤ 500 caractères) et `GET /health`." },
        { t: "Créez `src/server.js` qui démarre l'app et gère SIGTERM/SIGINT (arrêt gracieux)." },
        { t: "Écrivez 3 tests avec `node:test` et `app.inject` (201, 400 schéma, 404).", cmd: "node --test" },
        { t: "Ajoutez un endpoint qui simule un calcul lourd synchrone et mesurez l'impact sur `/health` avec `autocannon`, puis déplacez le calcul dans un worker thread.", cmd: "npx autocannon -c 50 -d 10 http://localhost:3000/health", check: "La latence de /health redevient faible avec le worker." },
        { t: "Écrivez un Dockerfile multi-stage (`npm ci --omit=dev`, `USER node`) et lancez le service.", cmd: "docker build -t notif:1.0 . && docker run -p 3000:3000 notif:1.0" },
        { t: "Vérifiez l'arrêt gracieux : `docker stop` doit produire le log « arrêt en cours » avant la sortie." }
      ]
    }
  ],
  quiz: [
    { q: "Pourquoi un calcul CPU de 2 secondes dans un gestionnaire de requête pose-t-il problème ?", options: ["Il bloque la boucle d'événements : toutes les autres requêtes attendent", "Il fait fuir la mémoire", "Il ferme les connexions", "Il n'a aucun impact"], answer: 0, explain: "Le JavaScript de Node s'exécute sur un seul thread." },
    { q: "Comment exécuter deux appels indépendants en parallèle ?", options: ["await Promise.all([a(), b()])", "await a(); await b();", "a().then(b)", "setTimeout(a); setTimeout(b)"], answer: 0, explain: "Deux await successifs sont séquentiels." },
    { q: "Que se passe-t-il par défaut sur un rejet de Promise non géré (Node 15+) ?", options: ["Le processus se termine avec une erreur", "Il est ignoré", "Il est automatiquement réessayé", "Il est converti en avertissement uniquement"], answer: 0, explain: "D'où l'importance de gérer toutes les erreurs asynchrones." },
    { q: "Quelle solution pour un traitement CPU intensif dans un service Node ?", options: ["Worker threads (ou un service dédié)", "Plus de callbacks", "process.nextTick", "Augmenter la taille du heap"], answer: 0, explain: "Le calcul s'exécute sur un autre thread sans bloquer la boucle." },
    { q: "Quel avantage de Fastify pour la validation des entrées ?", options: ["Validation déclarative par JSON Schema intégrée", "Aucune validation possible", "Validation uniquement côté client", "Il remplace la base de données"], answer: 0, explain: "Le schéma sert aussi à la documentation et à la sérialisation rapide." },
    { q: "Comment tester une route Fastify sans ouvrir de port réseau ?", options: ["app.inject()", "curl", "Un navigateur", "Un load balancer"], answer: 0, explain: "L'injection simule la requête en mémoire." },
    { q: "Pourquoi gérer SIGTERM dans un service conteneurisé ?", options: ["Pour terminer proprement les requêtes et connexions avant l'arrêt du pod", "Pour empêcher l'arrêt", "Pour redémarrer plus vite", "Ce n'est pas nécessaire"], answer: 0, explain: "Kubernetes envoie SIGTERM puis SIGKILL après le délai de grâce." },
    { q: "Quelle commande installer en production dans l'image Docker ?", options: ["npm ci --omit=dev", "npm install", "npm update", "npm install --global"], answer: 0, explain: "Installation exacte depuis le lockfile, sans dépendances de développement." },
    { q: "Quelle affirmation sur les versions de Node en production est correcte ?", options: ["Utiliser une version LTS (numéro pair)", "Toujours la version impaire la plus récente", "Node 12 suffit", "La version n'a pas d'importance"], answer: 0, explain: "Les versions paires deviennent LTS avec un support long." }
  ],
  flashcards: [
    ["Modèle d'exécution Node", "JS mono-thread + boucle d'événements + libuv pour l'I/O"],
    ["Phases de la boucle", "timers → pending → poll → check (setImmediate) → close ; microtâches entre chaque callback"],
    ["process.nextTick vs Promise", "nextTick passe avant les Promises dans la file des microtâches"],
    ["Paralléliser des Promises", "Promise.all (échoue au premier rejet) / Promise.allSettled (tous les résultats)"],
    ["Timeout sur fetch", "fetch(url, { signal: AbortSignal.timeout(ms) })"],
    ["CPU intensif en Node", "worker_threads ou service dédié"],
    ["ESM vs CommonJS", "import/export + \"type\": \"module\" vs require/module.exports"],
    ["Charger un .env nativement", "node --env-file=.env app.js (Node 20.6+)"],
    ["Fastify : valider une requête", "Option schema (JSON Schema) sur la route"],
    ["Tester sans port", "Fastify app.inject / Express + Supertest"],
    ["Arrêt gracieux", "process.on('SIGTERM') → app.close() → fermer les pools → exit"],
    ["Image Node de production", "Multi-stage, npm ci --omit=dev, USER node, NODE_ENV=production"],
    ["Logger structuré", "pino (JSON), avec identifiant de requête"]
  ]
});
