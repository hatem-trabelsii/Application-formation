ACADEMY.courses.push({
  id: 'maven-npm', phase: 1, kind: 'tech', order: 3,
  title: 'Maven & NPM', icon: '📦', category: 'Build Tools',
  hours: '~10h', priority: 3,
  subtitle: "Construire, tester et publier : cycle de vie Maven, gestion des dépendances, scripts NPM et lockfiles.",
  description: "Toute pipeline CI commence par un build reproductible. Maven pour l'écosystème Java, NPM pour JavaScript : vous saurez lire un pom.xml et un package.json, comprendre les versions, résoudre les conflits de dépendances et accélérer les builds en CI.",
  searchTerm: 'Maven NPM tutoriel', searchTermEn: 'Maven npm build tools',
  outcomes: [
    "Lire et écrire un pom.xml (coordonnées, dépendances, plugins)",
    "Maîtriser le cycle de vie Maven : validate → compile → test → package → verify → install → deploy",
    "Gérer les scopes, le BOM et les conflits de versions",
    "Structurer un projet Maven multi-modules",
    "Utiliser npm : package.json, scripts, semver, package-lock.json",
    "Choisir npm ci en intégration continue",
    "Mettre en cache les dépendances et publier vers un registre privé"
  ],
  prerequisites: ["Bases de Java et de JavaScript", "JDK + Maven + Node.js LTS installés"],
  resources: [
    { label: 'Maven — Introduction au cycle de vie', url: 'https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html' },
    { label: 'Documentation npm', url: 'https://docs.npmjs.com/' },
    { label: 'Calculateur semver npm', url: 'https://semver.npmjs.com/' }
  ],
  modules: [
    {
      title: 'Maven',
      lessons: [
        {
          title: 'Le POM et le cycle de vie',
          sections: [
            { h: 'Convention plutôt que configuration', p: "Maven impose une structure standard : `src/main/java`, `src/main/resources`, `src/test/java`, et produit ses artefacts dans `target/`. Un projet est identifié par ses **coordonnées** : `groupId:artifactId:version`." },
            { h: 'Un pom.xml minimal', code: { lang: 'xml', src: '<project xmlns="http://maven.apache.org/POM/4.0.0">\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>fr.exemple</groupId>\n  <artifactId>commande-api</artifactId>\n  <version>1.0.0-SNAPSHOT</version>\n  <packaging>jar</packaging>\n\n  <properties>\n    <maven.compiler.release>21</maven.compiler.release>\n  </properties>\n\n  <dependencies>\n    <dependency>\n      <groupId>org.junit.jupiter</groupId>\n      <artifactId>junit-jupiter</artifactId>\n      <version>5.10.2</version>\n      <scope>test</scope>\n    </dependency>\n  </dependencies>\n</project>' } },
            { h: 'Le cycle de vie par défaut', p: "Lancer une phase exécute **toutes les phases précédentes**.", bullets: ["`validate` → `compile` → `test` → `package` → `verify` → `install` → `deploy`", "`mvn package` : compile, teste et crée le JAR", "`mvn install` : copie l'artefact dans le dépôt local `~/.m2`", "`mvn deploy` : publie dans un dépôt distant (Nexus, Artifactory, GitLab)", "Cycle `clean` séparé : `mvn clean verify` est le classique de la CI"] },
            { h: 'SNAPSHOT vs release', p: "Une version `-SNAPSHOT` est une version de développement mutable ; une release (`1.0.0`) est immuable et ne doit jamais être republiée." }
          ],
          keypoints: ["GAV = groupId:artifactId:version", "Une phase lance toutes les précédentes", "mvn clean verify en CI", "SNAPSHOT = mutable ; release = immuable"]
        },
        {
          title: 'Dépendances, scopes, BOM et multi-modules',
          sections: [
            { h: 'Les scopes', bullets: ["`compile` (défaut) : partout", "`provided` : fourni par l'environnement d'exécution (ex. API servlet)", "`runtime` : seulement à l'exécution (ex. driver JDBC)", "`test` : uniquement pour les tests", "`import` : importer un BOM dans `dependencyManagement`"] },
            { h: 'Dépendances transitives et conflits', p: "Maven résout les conflits par la règle du **plus proche** dans l'arbre. Diagnostiquez avec l'arbre de dépendances, et imposez une version via `dependencyManagement`.", code: { lang: 'bash', src: 'mvn dependency:tree -Dincludes=com.fasterxml.jackson.core\nmvn versions:display-dependency-updates\nmvn -q -DskipTests package      # build rapide\nmvn -pl api -am verify          # un module et ses dépendances' } },
            { h: 'BOM (Bill of Materials)', p: "Un BOM centralise des versions cohérentes. Spring Boot en fournit un : vous déclarez les dépendances **sans version**." },
            { h: 'Projet multi-modules', bullets: ["Un POM parent `packaging=pom` liste les `<modules>`", "Les enfants héritent de `dependencyManagement` et `pluginManagement`", "Découpage typique : `domaine`, `infrastructure`, `api`", "Le **Maven Wrapper** (`mvnw`) fige la version de Maven du projet"] }
          ],
          keypoints: ["Scopes : compile, provided, runtime, test, import", "dependency:tree pour diagnostiquer", "BOM = versions alignées", "mvnw = version de Maven figée"]
        }
      ]
    },
    {
      title: 'NPM et builds en CI',
      lessons: [
        {
          title: 'package.json, semver et lockfile',
          sections: [
            { h: 'Le package.json', code: { lang: 'json', src: '{\n  "name": "front-commandes",\n  "version": "1.4.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "test": "vitest run",\n    "lint": "eslint ."\n  },\n  "dependencies": { "react": "^18.3.1" },\n  "devDependencies": { "vite": "^5.2.0", "vitest": "^1.5.0" },\n  "engines": { "node": ">=20" }\n}' } },
            { h: 'Semver dans npm', bullets: ["`^1.4.2` : accepte 1.x.x ≥ 1.4.2 (mineures et correctifs)", "`~1.4.2` : accepte 1.4.x ≥ 1.4.2 (correctifs seulement)", "`1.4.2` : version exacte", "`dependencies` (runtime) vs `devDependencies` (build, tests)"] },
            { h: 'Le lockfile', p: "`package-lock.json` fige l'arbre exact des versions installées. **Il se commite.** En CI, utilisez `npm ci` : installation propre, stricte, conforme au lockfile, et plus rapide.", code: { lang: 'bash', src: 'npm install axios        # ajoute une dépendance\nnpm install -D eslint    # dépendance de dev\nnpm ci                   # CI : installation exacte depuis le lockfile\nnpm run build            # lance un script\nnpm outdated && npm audit\nnpx cowsay "bonjour"     # exécuter un binaire sans l\'installer' } }
          ],
          keypoints: ["^ = mineures, ~ = correctifs", "package-lock.json se commite", "npm ci en CI, npm install en dev"]
        },
        {
          title: 'Builds rapides et sûrs en CI',
          sections: [
            { h: 'Mettre en cache', bullets: ["Maven : cacher `~/.m2/repository` (clé = hash des pom.xml)", "npm : cacher `~/.npm` (clé = hash du package-lock.json), pas `node_modules`", "Utiliser un **proxy de dépôt** (Nexus, Artifactory) pour la vitesse et la résilience"] },
            { h: 'Reproductibilité et sécurité', bullets: ["Versions figées (lockfile, pas de `LATEST`)", "`mvn -B` (batch) et `--no-transfer-progress` pour des logs lisibles", "Scanner les dépendances : `npm audit`, OWASP Dependency-Check, Dependabot/Renovate", "Publier des artefacts versionnés et immuables dans un registre"] },
            { h: 'Exemple de job GitLab CI', code: { lang: 'yaml', src: 'build-java:\n  image: maven:3.9-eclipse-temurin-21\n  variables:\n    MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"\n  cache:\n    key:\n      files: [pom.xml]\n    paths: [.m2/repository]\n  script:\n    - mvn -B --no-transfer-progress clean verify\n  artifacts:\n    paths: [target/*.jar]' } }
          ],
          keypoints: ["Cache ~/.m2 et ~/.npm, clé = fichier de dépendances", "npm audit / Dependency-Check", "mvn -B en CI"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Du projet vide au JAR testé',
      goal: "Générer un projet Maven, ajouter une dépendance, écrire un test, construire le JAR et analyser l'arbre de dépendances.",
      minutes: 30, env: 'JDK 21 + Maven',
      steps: [
        { t: "Générez un projet depuis l'archetype quickstart.", cmd: "mvn archetype:generate -DgroupId=fr.lab -DartifactId=lab-maven \\\n  -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false\ncd lab-maven" },
        { t: "Passez le compilateur en Java 21 via la propriété `maven.compiler.release`." },
        { t: "Ajoutez la dépendance `com.google.guava:guava` (dernière version) et utilisez `Strings.repeat` dans App.java." },
        { t: "Lancez le build complet.", cmd: "mvn -B clean verify", check: "BUILD SUCCESS et un JAR dans target/." },
        { t: "Affichez l'arbre de dépendances et identifiez les dépendances transitives de Guava.", cmd: "mvn dependency:tree" },
        { t: "Ajoutez le Maven Wrapper et relancez avec.", cmd: "mvn wrapper:wrapper\n./mvnw -v" }
      ]
    },
    {
      title: 'Projet npm reproductible',
      goal: "Créer un projet Node, comprendre la différence entre npm install et npm ci, auditer les dépendances.",
      minutes: 20, env: 'Node.js LTS',
      steps: [
        { t: "Initialisez un projet.", cmd: "mkdir lab-npm && cd lab-npm && npm init -y" },
        { t: "Installez `dayjs` et `vitest` en dev, puis observez package.json et package-lock.json.", cmd: "npm install dayjs\nnpm install -D vitest" },
        { t: "Ajoutez un script `test` qui lance `vitest run` et un test minimal `date.test.js`." },
        { t: "Supprimez `node_modules` puis réinstallez avec `npm ci` ; chronométrez.", cmd: "rm -rf node_modules && time npm ci" },
        { t: "Lancez `npm audit` et `npm outdated`, interprétez le résultat." }
      ]
    }
  ],
  quiz: [
    { q: "Que se passe-t-il quand vous lancez `mvn package` ?", options: ["Les phases validate, compile, test puis package s'exécutent", "Seule la phase package s'exécute", "Le projet est publié sur Maven Central", "Le dépôt local est nettoyé"], answer: 0, explain: "Chaque phase déclenche toutes les phases précédentes du cycle de vie." },
    { q: "Quel scope Maven pour un driver JDBC nécessaire uniquement à l'exécution ?", options: ["runtime", "provided", "test", "compile"], answer: 0, explain: "runtime : absent du classpath de compilation, présent à l'exécution." },
    { q: "Quelle commande installe exactement les versions du lockfile, idéale en CI ?", options: ["npm ci", "npm install", "npm update", "npx install"], answer: 0, explain: "npm ci échoue si package.json et le lockfile divergent : reproductibilité garantie." },
    { q: "Que signifie `^2.3.1` dans un package.json ?", options: ["Toute version 2.x.x supérieure ou égale à 2.3.1", "Exactement 2.3.1", "Toute version 2.3.x", "Toute version supérieure à 2.3.1, y compris 3.0.0"], answer: 0, explain: "Le caret autorise les mises à jour mineures et correctifs, pas les majeures." },
    { q: "Quelle commande Maven aide à diagnostiquer un conflit de versions ?", options: ["mvn dependency:tree", "mvn clean", "mvn site", "mvn help:system"], answer: 0, explain: "L'arbre montre d'où vient chaque dépendance transitive." },
    { q: "À quoi sert un BOM ?", options: ["Centraliser des versions cohérentes de dépendances", "Compiler plus vite", "Signer les artefacts", "Générer la documentation"], answer: 0, explain: "On l'importe en scope import dans dependencyManagement." },
    { q: "Faut-il committer package-lock.json ?", options: ["Oui, pour des installations reproductibles", "Non, il est généré", "Seulement pour les bibliothèques", "Seulement en production"], answer: 0, explain: "Le lockfile garantit que tout le monde (et la CI) installe le même arbre." },
    { q: "Quelle différence entre une version 1.2.0-SNAPSHOT et 1.2.0 ?", options: ["SNAPSHOT est une version de développement mutable, 1.2.0 est une release immuable", "Aucune", "SNAPSHOT est plus stable", "1.2.0 peut être republiée à volonté"], answer: 0, explain: "Une release publiée ne doit jamais changer de contenu." },
    { q: "Que mettre en cache pour accélérer un build npm en CI ?", options: ["Le cache npm (~/.npm), avec une clé basée sur package-lock.json", "Le dossier dist", "Le fichier package.json", "Rien, npm est toujours rapide"], answer: 0, explain: "npm ci supprime node_modules : c'est le cache ~/.npm qui accélère." },
    { q: "Quel est le rôle du Maven Wrapper (mvnw) ?", options: ["Figer la version de Maven utilisée par le projet", "Remplacer le JDK", "Publier les artefacts", "Chiffrer les dépendances"], answer: 0, explain: "Tous les développeurs et la CI utilisent la même version de Maven." }
  ],
  flashcards: [
    ["Cycle de vie Maven (par défaut)", "validate → compile → test → package → verify → install → deploy"],
    ["mvn install vs mvn deploy", "install : dépôt local ~/.m2 · deploy : dépôt distant (Nexus, Artifactory…)"],
    ["Scopes Maven", "compile, provided, runtime, test, system, import"],
    ["Règle de résolution de conflit Maven", "La dépendance la plus proche dans l'arbre gagne (nearest wins)"],
    ["Imposer une version transitive", "La déclarer dans <dependencyManagement>"],
    ["Commande CI Maven classique", "mvn -B --no-transfer-progress clean verify"],
    ["^ vs ~ en semver npm", "^1.2.3 : < 2.0.0 · ~1.2.3 : < 1.3.0"],
    ["npm ci vs npm install", "ci : strict, depuis le lockfile, supprime node_modules · install : résout et peut modifier le lockfile"],
    ["dependencies vs devDependencies", "Nécessaires à l'exécution vs uniquement au build/tests"],
    ["npx", "Exécute le binaire d'un paquet sans l'installer globalement"],
    ["Cache CI Maven / npm", "~/.m2/repository (clé pom.xml) · ~/.npm (clé package-lock.json)"],
    ["Structure Maven standard", "src/main/java, src/main/resources, src/test/java, target/"]
  ]
});
