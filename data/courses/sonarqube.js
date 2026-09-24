ACADEMY.courses.push({
  id: 'sonarqube', phase: 2, kind: 'tech', order: 2,
  title: 'SonarQube', icon: '🔍', category: 'Qualité Code',
  hours: '~15h', priority: 4,
  subtitle: "Mesurer et imposer la qualité du code : règles, quality gates, couverture, dette technique et intégration CI.",
  description: "SonarQube analyse le code à chaque commit pour détecter bugs, vulnérabilités, code smells, duplications et manque de couverture. En tant qu'architecte, vous définissez les quality profiles et quality gates qui conditionnent la mise en production — une brique clé de vos pipelines GitLab et Jenkins.",
  searchTerm: 'SonarQube tutoriel quality gate', searchTermEn: 'SonarQube quality gate',
  outcomes: [
    "Comprendre les types de problèmes : bugs, vulnérabilités, security hotspots, code smells",
    "Lire les notes de fiabilité, sécurité et maintenabilité",
    "Appliquer l'approche « Clean as You Code » sur le nouveau code",
    "Configurer quality profiles et quality gates",
    "Intégrer la couverture de tests (JaCoCo, LCOV)",
    "Analyser depuis Maven, Gradle, npm ou sonar-scanner dans GitLab CI et Jenkins",
    "Décorer les merge requests et bloquer un pipeline sur quality gate"
  ],
  prerequisites: ["Maven ou npm", "GitLab CI (cours précédent)", "Docker pour l'instance locale"],
  resources: [
    { label: 'Documentation SonarQube Server', url: 'https://docs.sonarsource.com/sonarqube-server/latest/' },
    { label: 'Règles SonarSource (Java, JS, Python…)', url: 'https://rules.sonarsource.com/' },
    { label: 'SonarQube for IDE (ex-SonarLint)', url: 'https://www.sonarsource.com/products/sonarlint/' }
  ],
  modules: [
    {
      title: 'Concepts de qualité',
      lessons: [
        {
          title: 'Ce que mesure SonarQube',
          sections: [
            { h: "L'analyse statique", p: "SonarQube inspecte le code **sans l'exécuter** grâce à des milliers de règles par langage. Il combine ces résultats avec des rapports externes (couverture de tests, lint) et suit l'évolution dans le temps." },
            { h: 'Les types de problèmes', bullets: ["**Bug** : code probablement faux (NPE, ressource non fermée) → Fiabilité", "**Vulnérabilité** : faille exploitable (injection SQL) → Sécurité", "**Security hotspot** : code sensible à **revoir manuellement** (crypto, regex) → Revue de sécurité", "**Code smell** : problème de maintenabilité (complexité, duplication) → Maintenabilité", "Les versions récentes parlent aussi d'**attributs de code propre** (consistant, intentionnel, adaptable, responsable) et de qualités logicielles impactées"] },
            { h: 'Les métriques clés', bullets: ["Notes **A à E** : fiabilité, sécurité, maintenabilité, revue des hotspots", "**Dette technique** : temps estimé pour corriger les code smells ; ratio de dette", "**Couverture** de lignes et de conditions (issue des rapports de tests)", "**Duplications** : pourcentage de lignes dupliquées", "**Complexité cyclomatique** et **cognitive**"] }
          ],
          keypoints: ["Bug → fiabilité ; vulnérabilité → sécurité ; smell → maintenabilité", "Hotspot = à revoir, pas forcément une faille", "Notes A à E + dette + couverture + duplications"]
        },
        {
          title: 'Clean as You Code, profils et quality gates',
          sections: [
            { h: 'Clean as You Code', p: "Plutôt que d'exiger de corriger tout l'historique, on impose que **le nouveau code** (défini par la **new code period** : version précédente, nombre de jours ou branche de référence) soit propre. La qualité globale s'améliore naturellement au fil des modifications." },
            { h: 'Quality profile', p: "Ensemble de **règles actives** par langage. Le profil **Sonar way** est le point de départ recommandé ; créez un profil qui en **hérite** pour ajouter ou désactiver des règles, plutôt qu'un profil entièrement personnalisé." },
            { h: 'Quality gate', p: "Ensemble de **conditions** qui décident si le projet est livrable. La gate **Sonar way** porte sur le nouveau code :", bullets: ["Aucun nouveau problème (ou note A en fiabilité/sécurité/maintenabilité)", "Tous les nouveaux security hotspots revus", "Couverture du nouveau code ≥ **80 %**", "Duplication du nouveau code ≤ **3 %**"] },
            { h: "Le rôle de l'architecte", bullets: ["Définir une gate d'entreprise commune, versionnée et expliquée", "Rendre la gate **bloquante** dans la CI pour les branches principales", "Suivre les portefeuilles d'applications (vos 22 applications) — édition Enterprise", "Traiter les faux positifs avec « Accepter / Faux positif » plutôt que désactiver la règle globalement"] }
          ],
          keypoints: ["Clean as You Code = focus sur le nouveau code", "Quality profile = règles ; quality gate = conditions de livraison", "Sonar way : couverture nouveau code ≥ 80 %, duplication ≤ 3 %"]
        }
      ]
    },
    {
      title: 'Intégration CI/CD',
      lessons: [
        {
          title: 'Lancer une analyse et intégrer la couverture',
          sections: [
            { h: 'Installer une instance locale', code: { lang: 'bash', src: 'docker run -d --name sonarqube -p 9000:9000 sonarqube:community\n# http://localhost:9000  (admin / admin au premier démarrage)\n# Créer un projet local, puis générer un jeton d\'analyse' } },
            { h: 'Analyse Maven avec couverture JaCoCo', code: { lang: 'bash', src: '# pom.xml : plugin jacoco-maven-plugin (goals prepare-agent + report)\nmvn -B clean verify sonar:sonar \\\n  -Dsonar.projectKey=commandes-api \\\n  -Dsonar.host.url=http://localhost:9000 \\\n  -Dsonar.token=$SONAR_TOKEN\n# JaCoCo produit target/site/jacoco/jacoco.xml, détecté automatiquement' } },
            { h: 'Autres scanners', bullets: ["**sonar-scanner** CLI avec un fichier `sonar-project.properties`", "JavaScript/TypeScript : `sonar.javascript.lcov.reportPaths=coverage/lcov.info`", "Python : `sonar.python.coverage.reportPaths=coverage.xml`", "Gradle : plugin `org.sonarqube`", ".NET : `dotnet sonarscanner begin/end`"] }
          ],
          keypoints: ["Couverture = rapport externe (JaCoCo, LCOV, coverage.xml)", "Jeton d'analyse, jamais le mot de passe admin", "mvn verify sonar:sonar"]
        },
        {
          title: 'Quality gate bloquante dans GitLab et Jenkins',
          sections: [
            { h: 'GitLab CI', code: { lang: 'yaml', src: 'sonarqube-check:\n  stage: test\n  image: maven:3.9-eclipse-temurin-21\n  variables:\n    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"\n    GIT_DEPTH: "0"              # historique complet pour le blame et le nouveau code\n  cache:\n    key: "${CI_JOB_NAME}"\n    paths: [.sonar/cache]\n  script:\n    - mvn -B verify sonar:sonar -Dsonar.qualitygate.wait=true\n  rules:\n    - if: $CI_PIPELINE_SOURCE == "merge_request_event"\n    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH' }, note: "`sonar.qualitygate.wait=true` fait échouer le job si la gate est rouge. `SONAR_TOKEN` et `SONAR_HOST_URL` sont des variables CI masquées." },
            { h: 'Jenkins', code: { lang: 'groovy', src: 'stage(\'Analyse Sonar\') {\n  steps {\n    withSonarQubeEnv(\'sonar-entreprise\') {\n      sh \'mvn -B verify sonar:sonar\'\n    }\n  }\n}\nstage(\'Quality Gate\') {\n  steps {\n    timeout(time: 10, unit: \'MINUTES\') {\n      waitForQualityGate abortPipeline: true   // webhook SonarQube → Jenkins\n    }\n  }\n}' } },
            { h: 'Aller plus loin', bullets: ["**Décoration de MR/PR** : commentaires et statut dans GitLab/GitHub (Developer Edition+ pour les branches et MR)", "**SonarQube for IDE** en mode connecté : mêmes règles dans l'IDE que dans la CI", "Exclusions (`sonar.exclusions`, `sonar.coverage.exclusions`) pour le code généré — avec parcimonie", "Suivre la tendance de dette dans les revues d'architecture"] }
          ],
          keypoints: ["sonar.qualitygate.wait=true dans GitLab", "waitForQualityGate + webhook dans Jenkins", "GIT_DEPTH 0 pour une analyse correcte du nouveau code", "SonarQube for IDE = feedback avant commit"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Analyser un projet et faire échouer la gate',
      goal: "Monter SonarQube en local, analyser l'API Spring Boot avec couverture, puis provoquer et corriger un échec de quality gate.",
      minutes: 45, env: 'Docker + Maven',
      steps: [
        { t: "Lancez SonarQube Community en local et connectez-vous (changez le mot de passe admin).", cmd: "docker run -d --name sonarqube -p 9000:9000 sonarqube:community" },
        { t: "Créez un projet « commandes-api » et générez un jeton." },
        { t: "Ajoutez le plugin JaCoCo au pom.xml.", lang: 'xml', cmd: '<plugin>\n  <groupId>org.jacoco</groupId>\n  <artifactId>jacoco-maven-plugin</artifactId>\n  <version>0.8.12</version>\n  <executions>\n    <execution><goals><goal>prepare-agent</goal></goals></execution>\n    <execution><id>report</id><phase>verify</phase><goals><goal>report</goal></goals></execution>\n  </executions>\n</plugin>' },
        { t: "Lancez l'analyse.", cmd: "mvn -B clean verify sonar:sonar -Dsonar.projectKey=commandes-api \\\n  -Dsonar.host.url=http://localhost:9000 -Dsonar.token=VOTRE_JETON" },
        { t: "Ajoutez volontairement une méthode non testée avec un bug (ex. comparaison de chaînes avec `==`) et un bloc dupliqué ; relancez.", check: "La quality gate passe au rouge sur le nouveau code." },
        { t: "Corrigez (equals, test unitaire, factorisation) et relancez jusqu'au vert." },
        { t: "Créez une quality gate « Entreprise » (copie de Sonar way + condition : aucune nouvelle vulnérabilité) et assignez-la au projet." }
      ],
      cleanup: "docker rm -f sonarqube"
    }
  ],
  quiz: [
    { q: "Qu'est-ce qu'un security hotspot ?", options: ["Un code sensible qui doit être revu manuellement pour décider s'il est sûr", "Une vulnérabilité confirmée", "Un bug de fiabilité", "Une duplication de code"], answer: 0, explain: "Le hotspot n'est pas forcément une faille : il demande une revue humaine." },
    { q: "Que signifie « Clean as You Code » ?", options: ["Imposer la qualité sur le nouveau code plutôt que sur tout l'historique", "Nettoyer tout le code avant chaque release", "Supprimer les règles gênantes", "Exécuter les tests à chaque sauvegarde"], answer: 0, explain: "La qualité globale s'améliore à mesure que le code est modifié." },
    { q: "Quelle est la différence entre quality profile et quality gate ?", options: ["Le profile définit les règles actives, la gate les conditions de livraison", "Ce sont des synonymes", "La gate définit les règles, le profile les seuils", "Le profile ne concerne que la couverture"], answer: 0, explain: "Profile = quoi détecter ; gate = seuils go/no-go." },
    { q: "D'où provient la couverture de tests affichée dans SonarQube ?", options: ["D'un rapport externe généré par l'outil de test (JaCoCo, LCOV…)", "SonarQube exécute lui-même les tests", "Du nombre de fichiers de test", "Du compilateur"], answer: 0, explain: "SonarQube importe les rapports de couverture ; il n'exécute pas les tests." },
    { q: "Quelle propriété fait échouer le job GitLab si la quality gate est rouge ?", options: ["sonar.qualitygate.wait=true", "sonar.verbose=true", "sonar.exclusions", "sonar.scm.disabled=true"], answer: 0, explain: "Le scanner attend le résultat de la gate et renvoie un code d'erreur." },
    { q: "Dans Jenkins, quelle étape attend le résultat de la quality gate ?", options: ["waitForQualityGate", "withSonarQubeEnv", "junit", "input"], answer: 0, explain: "Elle nécessite un webhook SonarQube vers Jenkins." },
    { q: "Pourquoi fixer GIT_DEPTH à 0 pour l'analyse ?", options: ["Pour que SonarQube dispose de l'historique complet (blame, détection du nouveau code)", "Pour accélérer le clone", "Pour désactiver Git", "Pour éviter le cache"], answer: 0, explain: "Un clone superficiel fausse l'attribution des lignes au nouveau code." },
    { q: "Quel seuil de couverture du nouveau code impose la gate Sonar way ?", options: ["80 %", "50 %", "100 %", "30 %"], answer: 0, explain: "Et au plus 3 % de duplication sur le nouveau code." },
    { q: "Comment traiter un faux positif ?", options: ["Le marquer comme faux positif dans SonarQube (avec justification)", "Désactiver la règle pour toute l'entreprise", "Supprimer le fichier de l'analyse", "Ignorer la quality gate"], answer: 0, explain: "Garder la règle active pour les autres cas." },
    { q: "Quel outil apporte les mêmes règles directement dans l'IDE ?", options: ["SonarQube for IDE (ex-SonarLint)", "SonarCloud CLI", "JaCoCo", "Checkstyle"], answer: 0, explain: "En mode connecté, il synchronise le quality profile du serveur." }
  ],
  flashcards: [
    ["4 types de problèmes SonarQube", "Bug (fiabilité), Vulnérabilité (sécurité), Security hotspot (revue), Code smell (maintenabilité)"],
    ["Security hotspot", "Code sensible à revoir manuellement — pas forcément une faille"],
    ["Clean as You Code", "Exiger un nouveau code propre ; l'ancien s'améliore au fil des modifications"],
    ["New code period", "Référence du « nouveau code » : version précédente, N jours ou branche de référence"],
    ["Quality profile", "Ensemble de règles actives par langage (partir de Sonar way par héritage)"],
    ["Quality gate", "Conditions go/no-go de livraison"],
    ["Gate Sonar way (nouveau code)", "Aucun nouveau problème, hotspots revus, couverture ≥ 80 %, duplication ≤ 3 %"],
    ["Couverture Java", "JaCoCo → target/site/jacoco/jacoco.xml"],
    ["Couverture JS/TS", "sonar.javascript.lcov.reportPaths=coverage/lcov.info"],
    ["Bloquer GitLab CI sur la gate", "-Dsonar.qualitygate.wait=true"],
    ["Bloquer Jenkins sur la gate", "waitForQualityGate abortPipeline: true (+ webhook)"],
    ["Dette technique", "Temps estimé pour corriger les code smells"]
  ]
});
