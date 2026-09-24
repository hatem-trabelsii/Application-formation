ACADEMY.courses.push({
  id: 'junit', phase: 4, kind: 'tech', order: 1,
  title: 'JUnit 5 + Tests qualité', icon: '🧪', category: 'Tests',
  hours: '~15h', priority: 4,
  subtitle: "Écrire des tests qui protègent vraiment : JUnit 5, AssertJ, Mockito, tests paramétrés, Testcontainers, couverture et mutation testing.",
  description: "La qualité logicielle se construit par les tests. Vous maîtriserez JUnit 5 (Jupiter), les assertions expressives, les doublures avec Mockito, les tests d'intégration avec Testcontainers, puis vous apprendrez à juger la qualité des tests eux-mêmes (couverture, mutation testing) et à définir une stratégie de tests en tant qu'architecte.",
  searchTerm: 'JUnit 5 Mockito tutoriel', searchTermEn: 'JUnit 5 Mockito testing',
  outcomes: [
    "Situer tests unitaires, d'intégration, de contrat et end-to-end (pyramide, trophée)",
    "Écrire des tests JUnit 5 lisibles (Given/When/Then, @DisplayName, @Nested)",
    "Utiliser assertions AssertJ et tests paramétrés",
    "Isoler avec Mockito : mocks, stubs, spies, captors, verify",
    "Tester l'intégration réelle avec Testcontainers",
    "Mesurer avec JaCoCo et évaluer avec le mutation testing (PIT)",
    "Définir une stratégie de tests et des quality gates d'entreprise"
  ],
  prerequisites: ["Java 17+", "Maven", "Spring Boot (pour la partie intégration)"],
  resources: [
    { label: 'Guide utilisateur JUnit 5', url: 'https://junit.org/junit5/docs/current/user-guide/' },
    { label: 'AssertJ', url: 'https://assertj.github.io/doc/' },
    { label: 'Mockito', url: 'https://site.mockito.org/' },
    { label: 'Testcontainers for Java', url: 'https://java.testcontainers.org/' },
    { label: 'PIT mutation testing', url: 'https://pitest.org/' }
  ],
  modules: [
    {
      title: 'JUnit 5 et assertions',
      lessons: [
        {
          title: 'Stratégie de tests et anatomie d\'un bon test',
          sections: [
            { h: 'Pyramide de tests', bullets: ["**Unitaires** : nombreux, rapides (ms), isolés — la logique métier", "**Intégration** : composants réels ensemble (base, broker) — moins nombreux", "**Contrat** : API entre services (Pact, Spring Cloud Contract)", "**End-to-end** : parcours complet — peu nombreux, lents, fragiles", "Le « trophée de tests » met l'accent sur l'intégration pour les applications web : l'important est la confiance obtenue par minute de CI"] },
            { h: 'Un bon test (FIRST)', bullets: ["**F**ast, **I**ndependent, **R**epeatable, **S**elf-validating, **T**imely", "Structure **Given / When / Then** (ou Arrange / Act / Assert)", "Un comportement par test, nom explicite", "Tester le **comportement** public, pas l'implémentation"] },
            { h: 'Premier test JUnit 5', code: { lang: 'java', src: 'import org.junit.jupiter.api.*;\nimport static org.assertj.core.api.Assertions.*;\n\n@DisplayName("Calcul des frais de livraison")\nclass FraisLivraisonTest {\n    private FraisLivraison calcul;\n\n    @BeforeEach\n    void init() { calcul = new FraisLivraison(); }\n\n    @Test\n    @DisplayName("gratuits au-delà de 50 €")\n    void gratuitsAuDela50() {\n        // Given\n        var panier = new Panier(new BigDecimal("75.00"));\n        // When\n        var frais = calcul.pour(panier);\n        // Then\n        assertThat(frais).isEqualByComparingTo("0");\n    }\n\n    @Test\n    void panierVideInterdit() {\n        assertThatThrownBy(() -> calcul.pour(new Panier(BigDecimal.ZERO)))\n            .isInstanceOf(IllegalArgumentException.class)\n            .hasMessageContaining("vide");\n    }\n}' } }
          ],
          keypoints: ["Pyramide : beaucoup d'unitaires, peu d'E2E", "Given/When/Then", "Tester le comportement, pas l'implémentation", "FIRST"]
        },
        {
          title: 'Fonctionnalités avancées de JUnit 5',
          sections: [
            { h: 'Cycle de vie et organisation', bullets: ["`@BeforeEach` / `@AfterEach`, `@BeforeAll` / `@AfterAll` (statiques)", "`@Nested` : regrouper des tests par contexte", "`@Tag(\"lent\")` + filtrage Maven Surefire (`groups` / `excludedGroups`)", "`@Disabled` (avec raison), `@Timeout`, `assumeTrue`", "Architecture : JUnit Platform + moteur Jupiter (+ Vintage pour JUnit 4)"] },
            { h: 'Tests paramétrés', code: { lang: 'java', src: '@ParameterizedTest(name = "{0} € → {1} € de frais")\n@CsvSource({\n    "10.00, 4.90",\n    "49.99, 4.90",\n    "50.00, 0.00",\n    "120.00, 0.00"\n})\nvoid fraisSelonMontant(BigDecimal montant, BigDecimal attendu) {\n    assertThat(calcul.pour(new Panier(montant))).isEqualByComparingTo(attendu);\n}\n\n@ParameterizedTest\n@EnumSource(value = Statut.class, names = {"ANNULEE", "REMBOURSEE"})\nvoid pasDeFacturePourStatutsTerminaux(Statut s) { /* ... */ }\n\n@ParameterizedTest\n@MethodSource("paniersInvalides")\nvoid refuseLesPaniersInvalides(Panier p) { /* ... */ }' } },
            { h: 'Assertions', bullets: ["**AssertJ** : fluide et lisible — `assertThat(liste).hasSize(3).extracting(Client::nom).containsExactly(...)`", "`assertAll(...)` : plusieurs vérifications rapportées ensemble", "`assertThatThrownBy` / `assertThrows` pour les exceptions", "Comparaison récursive d'objets : `usingRecursiveComparison()`", "Extensions : `@ExtendWith` (Mockito, Spring, Testcontainers)"] }
          ],
          keypoints: ["@Nested, @Tag, @DisplayName", "@ParameterizedTest + CsvSource / MethodSource / EnumSource", "AssertJ fluide", "@ExtendWith pour les extensions"]
        }
      ]
    },
    {
      title: 'Isolation, intégration et qualité des tests',
      lessons: [
        {
          title: 'Doublures de test avec Mockito',
          sections: [
            { h: 'Les types de doublures', bullets: ["**Dummy** : remplit un paramètre", "**Stub** : renvoie des réponses prédéfinies", "**Mock** : vérifie les interactions", "**Spy** : objet réel partiellement surchargé", "**Fake** : implémentation simplifiée (base en mémoire)"] },
            { h: 'Mockito en pratique', code: { lang: 'java', src: '@ExtendWith(MockitoExtension.class)\nclass CommandeServiceTest {\n    @Mock CommandeRepository repo;\n    @Mock Notifier notifier;\n    @InjectMocks CommandeService service;\n    @Captor ArgumentCaptor<Commande> captor;\n\n    @Test\n    void creeEtNotifie() {\n        when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));\n\n        service.creer(new NouvelleCommande("Ada", new BigDecimal("42")));\n\n        verify(repo).save(captor.capture());\n        assertThat(captor.getValue().client()).isEqualTo("Ada");\n        verify(notifier, times(1)).commandeCreee(any());\n        verifyNoMoreInteractions(notifier);\n    }\n\n    @Test\n    void propageUneErreurDeStockage() {\n        when(repo.save(any())).thenThrow(new DataAccessResourceFailureException("down"));\n        assertThatThrownBy(() -> service.creer(new NouvelleCommande("Ada", BigDecimal.TEN)))\n            .isInstanceOf(ServiceIndisponible.class);\n    }\n}' } },
            { h: 'Bonnes pratiques', bullets: ["Ne mocker que ce que vous possédez (vos interfaces), pas les bibliothèques tierces", "Pas de mock des objets valeur (records)", "Trop de mocks = conception trop couplée : c'est un signal", "Préférer les stubs + assertions sur le résultat aux `verify` systématiques", "Temps : injecter un `Clock` plutôt que mocker `LocalDate.now()`"] }
          ],
          keypoints: ["Stub = réponses ; mock = interactions", "@Mock, @InjectMocks, @Captor", "Ne mocker que ce qu'on possède", "Injecter un Clock"]
        },
        {
          title: 'Tests d\'intégration avec Testcontainers',
          sections: [
            { h: 'Le principe', p: "**Testcontainers** démarre de vraies dépendances (PostgreSQL, Kafka, Redis, LocalStack pour AWS) dans des conteneurs Docker éphémères pendant les tests : fini les bases H2 qui se comportent différemment de la production." },
            { h: 'Avec Spring Boot 3.1+', code: { lang: 'java', src: '@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)\n@Testcontainers\nclass CommandeApiIT {\n    @Container\n    @ServiceConnection   // configure automatiquement spring.datasource.*\n    static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");\n\n    @Autowired TestRestTemplate http;\n\n    @Test\n    void creepuisRelitUneCommande() {\n        var creee = http.postForEntity("/api/commandes",\n            Map.of("client", "Ada", "montant", 42), CommandeDto.class);\n        assertThat(creee.getStatusCode()).isEqualTo(HttpStatus.CREATED);\n\n        var lue = http.getForObject("/api/commandes/" + creee.getBody().id(), CommandeDto.class);\n        assertThat(lue.client()).isEqualTo("Ada");\n    }\n}' } },
            { h: 'Organisation', bullets: ["Tests d'intégration nommés `*IT` exécutés par **Failsafe** (`mvn verify`), unitaires `*Test` par **Surefire**", "Conteneurs **partagés** entre classes (champ statique, singleton) pour la vitesse", "Données de test isolées par test (transactions annulées ou nettoyage)", "En CI : Docker disponible sur le runner (ou Testcontainers Cloud)"] }
          ],
          keypoints: ["Vraies dépendances en conteneurs", "@ServiceConnection (Boot 3.1+)", "*IT via Failsafe", "Conteneurs partagés pour la vitesse"]
        },
        {
          title: 'Mesurer la qualité des tests',
          sections: [
            { h: 'La couverture et ses limites', p: "**JaCoCo** mesure les lignes et branches exécutées. Utile pour trouver du code non testé, mais une couverture élevée ne prouve pas que les tests **vérifient** quelque chose : un test sans assertion couvre aussi." },
            { h: 'Le mutation testing', p: "**PIT** modifie le code (mutants : `>` devient `>=`, un `return` renvoie null…) et relance les tests. Un mutant **tué** = un test l'a détecté. Le **score de mutation** mesure la vraie capacité de détection.", code: { lang: 'bash', src: 'mvn org.pitest:pitest-maven:mutationCoverage \\\n  -DtargetClasses="fr.exemple.commandes.domaine.*" \\\n  -DtargetTests="fr.exemple.commandes.*Test"\n# rapport HTML : target/pit-reports/index.html' } },
            { h: 'Stratégie d\'architecte', bullets: ["Quality gate : couverture du **nouveau code** ≥ 80 % (SonarQube) plutôt qu'un seuil global", "Mutation testing sur le **cœur métier** (domaine), pas partout", "Tests de contrat entre microservices ; tests d'architecture avec **ArchUnit** (règles de dépendances entre couches)", "Tests flaky : les traquer et les corriger, jamais les ignorer durablement", "Temps de CI budgété : unitaires < 5 min"], code: { lang: 'java', src: '@AnalyzeClasses(packages = "fr.exemple.commandes")\nclass ArchitectureTest {\n    @ArchTest\n    static final ArchRule domainePur = noClasses()\n        .that().resideInAPackage("..domaine..")\n        .should().dependOnClassesThat().resideInAnyPackage("..infrastructure..", "org.springframework..");\n}' } }
          ],
          keypoints: ["Couverture ≠ qualité des assertions", "PIT : score de mutation", "ArchUnit pour les règles d'architecture", "Tests flaky = dette prioritaire"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Kata TDD + mutation testing',
      goal: "Développer en TDD un calculateur de remises, puis mesurer la couverture JaCoCo et le score de mutation PIT, et renforcer les tests jusqu'à tuer tous les mutants.",
      minutes: 75, env: 'JDK 21 + Maven + IDE',
      steps: [
        { t: "Règles : 5 % dès 100 €, 10 % dès 500 €, +5 % pour les clients fidèles (plafond 15 %), montant négatif interdit." },
        { t: "Cycle TDD **rouge → vert → refactor** : écrivez d'abord un test qui échoue pour la règle la plus simple, puis le code minimal, puis refactorez." },
        { t: "Couvrez les cas limites avec un `@ParameterizedTest` + `@CsvSource` (99,99 / 100 / 499,99 / 500…)." },
        { t: "Ajoutez JaCoCo et vérifiez 100 % de couverture de lignes.", cmd: "mvn verify && open target/site/jacoco/index.html" },
        { t: "Lancez PIT et consultez les mutants **survivants**.", cmd: "mvn org.pitest:pitest-maven:mutationCoverage", check: "Des mutants de bornes (> vs >=) survivent souvent malgré 100 % de couverture." },
        { t: "Ajoutez les tests manquants jusqu'à un score de mutation de 100 % sur la classe." },
        { t: "Ajoutez une règle ArchUnit : le package `domaine` ne dépend pas de Spring." }
      ]
    }
  ],
  quiz: [
    { q: "Selon la pyramide de tests, quel type de test doit être le plus nombreux ?", options: ["Les tests unitaires", "Les tests end-to-end", "Les tests manuels", "Les tests de charge"], answer: 0, explain: "Rapides et ciblés, ils forment la base." },
    { q: "Quelle annotation JUnit 5 exécute un test pour chaque ligne d'un jeu de données CSV ?", options: ["@ParameterizedTest avec @CsvSource", "@RepeatedTest", "@TestFactory", "@Nested"], answer: 0, explain: "@RepeatedTest répète sans paramètres ; @TestFactory crée des tests dynamiques." },
    { q: "Quelle est la différence entre un stub et un mock ?", options: ["Le stub fournit des réponses ; le mock vérifie les interactions", "Aucune", "Le mock est une vraie implémentation", "Le stub ne peut pas lever d'exception"], answer: 0, explain: "Mockito crée des objets utilisables comme stubs (when) et comme mocks (verify)." },
    { q: "Pourquoi 100 % de couverture ne garantit-il pas des tests efficaces ?", options: ["Un code peut être exécuté sans que son résultat soit vérifié", "La couverture est toujours fausse", "JaCoCo ne compte pas les branches", "Les tests paramétrés ne comptent pas"], answer: 0, explain: "Le mutation testing révèle cette faiblesse." },
    { q: "Que signifie un mutant « survivant » dans PIT ?", options: ["Aucun test n'a échoué malgré la modification du code", "Le code ne compile plus", "Le test est trop lent", "Le mutant a été détecté"], answer: 0, explain: "Il faut ajouter ou renforcer un test." },
    { q: "Quel est l'intérêt de Testcontainers par rapport à une base H2 en mémoire ?", options: ["Tester contre le vrai moteur utilisé en production", "Des tests sans Docker", "Des tests plus rapides que les unitaires", "Éviter d'écrire des assertions"], answer: 0, explain: "H2 a des différences de dialecte et de comportement." },
    { q: "Par défaut, quel plugin Maven exécute les classes *IT ?", options: ["maven-failsafe-plugin", "maven-surefire-plugin", "maven-jar-plugin", "jacoco-maven-plugin"], answer: 0, explain: "Failsafe tourne en phase integration-test/verify." },
    { q: "Comment tester du code qui dépend de la date du jour ?", options: ["Injecter un java.time.Clock et utiliser Clock.fixed en test", "Changer l'horloge du système", "Utiliser Thread.sleep", "Ne pas le tester"], answer: 0, explain: "Le temps devient une dépendance explicite et contrôlable." },
    { q: "Quel outil vérifie automatiquement des règles de dépendances entre couches ?", options: ["ArchUnit", "Mockito", "PIT", "AssertJ"], answer: 0, explain: "Exemple : le domaine ne doit pas dépendre de l'infrastructure." },
    { q: "Que faire d'un test « flaky » (qui échoue aléatoirement) ?", options: ["Le diagnostiquer et le corriger en priorité", "L'ignorer définitivement", "Relancer la CI jusqu'à ce qu'il passe", "Supprimer la fonctionnalité"], answer: 0, explain: "Les tests instables détruisent la confiance dans la CI." }
  ],
  flashcards: [
    ["Pyramide de tests", "Beaucoup d'unitaires, moins d'intégration, peu d'E2E"],
    ["FIRST", "Fast, Independent, Repeatable, Self-validating, Timely"],
    ["Structure d'un test", "Given / When / Then (Arrange / Act / Assert)"],
    ["Cycle de vie JUnit 5", "@BeforeAll, @BeforeEach, @Test, @AfterEach, @AfterAll"],
    ["Grouper des tests par contexte", "@Nested sur une classe interne"],
    ["Sources de tests paramétrés", "@ValueSource, @CsvSource, @CsvFileSource, @EnumSource, @MethodSource"],
    ["Tester une exception (AssertJ)", "assertThatThrownBy(() -> …).isInstanceOf(X.class).hasMessageContaining(\"…\")"],
    ["Mockito : injecter les mocks", "@ExtendWith(MockitoExtension.class) + @Mock + @InjectMocks"],
    ["Capturer un argument", "@Captor ArgumentCaptor<T> + verify(mock).methode(captor.capture())"],
    ["Stub vs mock", "Stub : réponses prédéfinies · Mock : vérification des interactions"],
    ["@ServiceConnection", "Relie automatiquement un conteneur Testcontainers à la configuration Spring Boot"],
    ["Surefire vs Failsafe", "Surefire : *Test (unitaires) · Failsafe : *IT (intégration)"],
    ["Mutation testing", "PIT modifie le code ; les tests doivent échouer (mutant tué)"],
    ["ArchUnit", "Tests d'architecture : règles de dépendances entre packages/couches"],
    ["TDD", "Rouge (test qui échoue) → Vert (code minimal) → Refactor"]
  ]
});
