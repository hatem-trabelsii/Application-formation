ACADEMY.courses.push({
  id: 'spring-boot', phase: 1, kind: 'tech', order: 4,
  title: 'Spring Boot 3', icon: '🍃', category: 'Framework',
  hours: '~40h', priority: 4,
  subtitle: "Construire des API REST prêtes pour la production : injection de dépendances, Spring Data JPA, validation, sécurité, Actuator.",
  description: "Spring Boot est le framework Java dominant en entreprise. Vous apprendrez à créer une API REST complète, à la connecter à une base de données, à la sécuriser, à la tester et à l'exposer à la supervision — exactement ce que vous conteneuriserez et déploierez dans les phases suivantes.",
  searchTerm: 'Spring Boot 3 tutoriel', searchTermEn: 'Spring Boot 3',
  outcomes: [
    "Comprendre l'inversion de contrôle, l'injection de dépendances et l'auto-configuration",
    "Créer une API REST avec @RestController, validation et gestion d'erreurs",
    "Persister des données avec Spring Data JPA et gérer les migrations Flyway",
    "Externaliser la configuration avec les profils et variables d'environnement",
    "Sécuriser une API avec Spring Security (JWT / OAuth2 resource server)",
    "Tester avec @SpringBootTest, @WebMvcTest, MockMvc et Testcontainers",
    "Exposer santé et métriques avec Actuator et Micrometer"
  ],
  prerequisites: ["Java 17+ (cours précédent)", "Maven", "Notions HTTP et SQL"],
  resources: [
    { label: 'Spring Initializr', url: 'https://start.spring.io/' },
    { label: 'Documentation Spring Boot', url: 'https://docs.spring.io/spring-boot/index.html' },
    { label: 'Guides officiels Spring', url: 'https://spring.io/guides' }
  ],
  modules: [
    {
      title: 'Les fondations de Spring',
      lessons: [
        {
          title: 'IoC, injection de dépendances et auto-configuration',
          sections: [
            { h: "L'inversion de contrôle", p: "Au lieu de créer vous-même vos objets (`new`), vous déclarez des **beans** et Spring les instancie, les relie et gère leur cycle de vie dans l'**ApplicationContext**.", bullets: ["Stéréotypes : `@Component`, `@Service`, `@Repository`, `@Controller`", "`@Configuration` + `@Bean` pour déclarer des beans manuellement", "Portée par défaut : **singleton**"] },
            { h: "L'injection par constructeur", p: "C'est la forme recommandée : dépendances explicites, champs `final`, testabilité.", code: { lang: 'java', src: '@Service\npublic class CommandeService {\n    private final CommandeRepository repo;\n    private final Clock clock;\n\n    // un seul constructeur : @Autowired est implicite\n    public CommandeService(CommandeRepository repo, Clock clock) {\n        this.repo = repo;\n        this.clock = clock;\n    }\n}' } },
            { h: 'La magie de Spring Boot', bullets: ["**Starters** : `spring-boot-starter-web`, `-data-jpa`, `-security`, `-actuator`…", "**Auto-configuration** : Boot configure ce qu'il trouve dans le classpath (conditions `@ConditionalOnClass`, `@ConditionalOnMissingBean`)", "**Serveur embarqué** (Tomcat) : un JAR exécutable `java -jar app.jar`", "`@SpringBootApplication` = `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`"] }
          ],
          keypoints: ["Bean = objet géré par Spring", "Injection par constructeur, champs final", "Starters + auto-configuration + serveur embarqué"]
        },
        {
          title: 'Configuration, profils et secrets',
          sections: [
            { h: 'application.yml', code: { lang: 'yaml', src: 'server:\n  port: 8080\nspring:\n  datasource:\n    url: ${DB_URL:jdbc:postgresql://localhost:5432/commandes}\n    username: ${DB_USER:app}\n    password: ${DB_PASSWORD}\n  jpa:\n    open-in-view: false\napp:\n  facturation:\n    delai-jours: 30\n---\nspring:\n  config:\n    activate:\n      on-profile: prod\nlogging:\n  level:\n    root: WARN' } },
            { h: 'Ordre de priorité', p: "Les variables d'environnement et arguments de ligne de commande **surchargent** les fichiers. C'est ce qui permet la même image Docker dans tous les environnements (principe **12-factor**).", bullets: ["`SPRING_PROFILES_ACTIVE=prod` active un profil", "`SPRING_DATASOURCE_URL` surcharge `spring.datasource.url`", "Jamais de secret en clair dans le dépôt : variables d'environnement, Vault, AWS Secrets Manager, Azure Key Vault"] },
            { h: 'Configuration typée', p: "`@ConfigurationProperties(prefix = \"app.facturation\")` sur un record lie proprement un bloc de configuration, avec validation possible." }
          ],
          keypoints: ["${VAR:defaut} dans le YAML", "Variables d'env > fichiers", "Profils : dev, test, prod", "@ConfigurationProperties pour la config typée"]
        }
      ]
    },
    {
      title: 'Construire une API REST',
      lessons: [
        {
          title: 'Contrôleurs REST, validation et erreurs',
          sections: [
            { h: 'Un contrôleur REST', code: { lang: 'java', src: '@RestController\n@RequestMapping("/api/commandes")\npublic class CommandeController {\n    private final CommandeService service;\n    public CommandeController(CommandeService service) { this.service = service; }\n\n    @GetMapping("/{id}")\n    public CommandeDto get(@PathVariable Long id) {\n        return service.trouver(id);\n    }\n\n    @PostMapping\n    @ResponseStatus(HttpStatus.CREATED)\n    public CommandeDto creer(@Valid @RequestBody NouvelleCommande cmd) {\n        return service.creer(cmd);\n    }\n}\n\npublic record NouvelleCommande(\n    @NotBlank String client,\n    @Positive BigDecimal montant) {}' } },
            { h: 'Bonnes pratiques REST', bullets: ["Ressources au pluriel, verbes HTTP : GET, POST, PUT, PATCH, DELETE", "Codes : 200, 201 Created, 204, 400, 401, 403, 404, 409, 500", "**DTO** distincts des entités JPA", "Pagination : `Pageable` → `?page=0&size=20&sort=date,desc`", "Documentation OpenAPI avec springdoc (`/swagger-ui.html`)"] },
            { h: 'Gestion centralisée des erreurs', p: "Un `@RestControllerAdvice` transforme les exceptions en réponses **ProblemDetail** (RFC 9457), le format standard supporté nativement par Spring 6.", code: { lang: 'java', src: '@RestControllerAdvice\nclass ErreursApi {\n    @ExceptionHandler(CommandeIntrouvable.class)\n    ProblemDetail introuvable(CommandeIntrouvable e) {\n        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());\n    }\n}' } }
          ],
          keypoints: ["@RestController + @RequestMapping", "@Valid + contraintes Jakarta Validation", "DTO ≠ entité", "ProblemDetail pour les erreurs"]
        },
        {
          title: 'Spring Data JPA et Flyway',
          sections: [
            { h: 'Entités et repositories', code: { lang: 'java', src: '@Entity\n@Table(name = "commande")\npublic class Commande {\n    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;\n    private String client;\n    private BigDecimal montant;\n    @Enumerated(EnumType.STRING)\n    private Statut statut;\n    // getters, constructeur protégé pour JPA...\n}\n\npublic interface CommandeRepository extends JpaRepository<Commande, Long> {\n    List<Commande> findByClientAndStatut(String client, Statut statut); // requête dérivée\n\n    @Query("select c from Commande c where c.montant > :min")\n    Page<Commande> grosses(@Param("min") BigDecimal min, Pageable page);\n}' } },
            { h: 'Transactions et performances', bullets: ["`@Transactional` sur la couche service (lecture seule : `readOnly = true`)", "Attention au problème **N+1** : utiliser `JOIN FETCH` ou `@EntityGraph`", "Relations `LAZY` par défaut pour les collections", "`spring.jpa.open-in-view=false` pour éviter les requêtes cachées dans la vue"] },
            { h: 'Migrations avec Flyway', p: "Le schéma se versionne comme le code : des scripts `V1__init.sql`, `V2__ajout_statut.sql` dans `src/main/resources/db/migration`, appliqués au démarrage. En production : `spring.jpa.hibernate.ddl-auto=validate`." }
          ],
          keypoints: ["JpaRepository = CRUD gratuit + requêtes dérivées", "@Transactional sur les services", "N+1 → JOIN FETCH", "Flyway versionne le schéma ; ddl-auto=validate en prod"]
        }
      ]
    },
    {
      title: 'Production-ready',
      lessons: [
        {
          title: 'Sécurité avec Spring Security',
          sections: [
            { h: 'La chaîne de filtres', p: "Spring Security intercepte chaque requête via une chaîne de filtres : **authentification** (qui êtes-vous ?) puis **autorisation** (avez-vous le droit ?). Dès qu'il est dans le classpath, tout est protégé par défaut." },
            { h: 'API stateless avec JWT (OAuth2 Resource Server)', code: { lang: 'java', src: '@Configuration\n@EnableMethodSecurity\nclass SecuriteConfig {\n    @Bean\n    SecurityFilterChain api(HttpSecurity http) throws Exception {\n        return http\n            .csrf(csrf -> csrf.disable())            // API stateless\n            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))\n            .authorizeHttpRequests(auth -> auth\n                .requestMatchers("/actuator/health").permitAll()\n                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")\n                .anyRequest().authenticated())\n            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))\n            .build();\n    }\n}' }, note: "Configurez l'émetteur des jetons avec `spring.security.oauth2.resourceserver.jwt.issuer-uri` (Keycloak, Entra ID, Cognito…)." },
            { h: 'Les incontournables', bullets: ["Mots de passe : `BCryptPasswordEncoder` (jamais en clair)", "`@PreAuthorize(\"hasRole('ADMIN')\")` au niveau méthode", "CORS configuré explicitement pour le front", "HTTPS de bout en bout, en-têtes de sécurité"] }
          ],
          keypoints: ["Authentification puis autorisation", "SecurityFilterChain en bean", "JWT via oauth2ResourceServer", "BCrypt pour les mots de passe"]
        },
        {
          title: 'Tests, Actuator et observabilité',
          sections: [
            { h: 'La pyramide de tests Spring', bullets: ["Tests unitaires purs (JUnit 5 + Mockito) : rapides, sans Spring", "`@WebMvcTest` : couche web seule avec **MockMvc**", "`@DataJpaTest` : couche JPA seule", "`@SpringBootTest` : contexte complet", "**Testcontainers** : une vraie base PostgreSQL dans Docker pour les tests d'intégration"], code: { lang: 'java', src: '@WebMvcTest(CommandeController.class)\nclass CommandeControllerTest {\n    @Autowired MockMvc mvc;\n    @MockitoBean CommandeService service; // @MockBean avant Boot 3.4\n\n    @Test\n    void renvoie404SiAbsente() throws Exception {\n        when(service.trouver(42L)).thenThrow(new CommandeIntrouvable(42L));\n        mvc.perform(get("/api/commandes/42"))\n           .andExpect(status().isNotFound());\n    }\n}' } },
            { h: 'Actuator', p: "Le starter **Actuator** expose des endpoints d'exploitation. Essentiel pour Kubernetes et le monitoring.", bullets: ["`/actuator/health` (+ `liveness` et `readiness` pour Kubernetes)", "`/actuator/info`, `/actuator/metrics`, `/actuator/prometheus`", "N'exposez que le nécessaire : `management.endpoints.web.exposure.include=health,info,prometheus`"] },
            { h: 'Observabilité', bullets: ["**Micrometer** : façade de métriques (Prometheus, Datadog, CloudWatch)", "Traces distribuées : Micrometer Tracing + OpenTelemetry", "Logs structurés JSON (Spring Boot 3.4+ : `logging.structured.format.console=ecs`)", "Image Docker optimisée : `mvn spring-boot:build-image` (Buildpacks)"] }
          ],
          keypoints: ["@WebMvcTest + MockMvc pour la couche web", "Testcontainers pour de vraies dépendances", "Actuator health/liveness/readiness", "Micrometer → Prometheus/Datadog/CloudWatch"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'API « commandes » complète',
      goal: "Créer une API REST Spring Boot avec PostgreSQL, validation, migrations Flyway, tests et Actuator.",
      minutes: 120, env: 'JDK 21, Maven, Docker',
      steps: [
        { t: "Sur start.spring.io, générez un projet Maven Java 21 avec : Spring Web, Validation, Spring Data JPA, PostgreSQL Driver, Flyway, Actuator, Testcontainers." },
        { t: "Démarrez PostgreSQL avec Docker.", cmd: "docker run -d --name pg -e POSTGRES_DB=commandes -e POSTGRES_USER=app \\\n  -e POSTGRES_PASSWORD=secret -p 5432:5432 postgres:16" },
        { t: "Configurez `application.yml` (datasource avec variables d'environnement, `ddl-auto: validate`, `open-in-view: false`)." },
        { t: "Écrivez `V1__init.sql` créant la table `commande` (id, client, montant, statut, cree_le).", lang: 'sql', cmd: "CREATE TABLE commande (\n  id BIGSERIAL PRIMARY KEY,\n  client VARCHAR(100) NOT NULL,\n  montant NUMERIC(10,2) NOT NULL,\n  statut VARCHAR(20) NOT NULL,\n  cree_le TIMESTAMP NOT NULL DEFAULT now()\n);" },
        { t: "Créez l'entité, le repository, le service `@Transactional`, le contrôleur (GET liste paginée, GET par id, POST validé) et un `@RestControllerAdvice`." },
        { t: "Testez à la main.", cmd: "curl -s -X POST localhost:8080/api/commandes -H 'Content-Type: application/json' \\\n  -d '{\"client\":\"Ada\",\"montant\":120.5}'\ncurl -s 'localhost:8080/api/commandes?page=0&size=10'\ncurl -s localhost:8080/actuator/health", check: "201 Created puis la commande dans la liste ; health = UP." },
        { t: "Écrivez un test `@WebMvcTest` (400 si montant négatif) et un test `@SpringBootTest` avec Testcontainers PostgreSQL.", hint: "Avec Boot 3.1+, annotez un bean `PostgreSQLContainer` avec `@ServiceConnection`." },
        { t: "Construisez l'image OCI.", cmd: "./mvnw spring-boot:build-image\ndocker images | grep commande" }
      ],
      cleanup: "docker rm -f pg"
    }
  ],
  quiz: [
    { q: "Quelle forme d'injection de dépendances est recommandée ?", options: ["Injection par constructeur", "Injection par champ avec @Autowired", "Injection par setter systématique", "Lookup manuel dans le contexte"], answer: 0, explain: "Dépendances explicites, champs final, tests unitaires sans Spring." },
    { q: "Que combine @SpringBootApplication ?", options: ["@Configuration, @EnableAutoConfiguration et @ComponentScan", "@Controller, @Service et @Repository", "@Bean et @Autowired", "@Transactional et @Entity"], answer: 0, explain: "C'est la méta-annotation de la classe principale." },
    { q: "Comment surcharger `spring.datasource.url` sans modifier le fichier de configuration ?", options: ["Avec la variable d'environnement SPRING_DATASOURCE_URL", "En recompilant l'application", "Avec un profil Maven", "C'est impossible"], answer: 0, explain: "La liaison relâchée (relaxed binding) mappe les variables d'environnement sur les propriétés." },
    { q: "Quelle annotation déclenche la validation d'un corps de requête ?", options: ["@Valid", "@RequestBody seule", "@Validated sur la classe entité", "@NotNull sur le contrôleur"], answer: 0, explain: "@Valid @RequestBody applique les contraintes (@NotBlank, @Positive…) du DTO." },
    { q: "Qu'est-ce que le problème N+1 en JPA ?", options: ["Une requête pour la liste puis une requête par élément pour charger une relation", "Une limite de N+1 connexions", "Un bug de pagination", "Une erreur de migration Flyway"], answer: 0, explain: "Solution : JOIN FETCH, @EntityGraph ou requêtes de projection." },
    { q: "Quelle valeur de `ddl-auto` convient en production avec Flyway ?", options: ["validate", "create-drop", "update", "create"], answer: 0, explain: "Flyway gère le schéma ; Hibernate se contente de vérifier la cohérence." },
    { q: "Quelle annotation de test ne charge que la couche web avec MockMvc ?", options: ["@WebMvcTest", "@SpringBootTest", "@DataJpaTest", "@JsonTest"], answer: 0, explain: "Test de tranche (slice) : rapide et ciblé." },
    { q: "Quel endpoint Actuator Kubernetes utilise-t-il pour savoir si le pod peut recevoir du trafic ?", options: ["/actuator/health/readiness", "/actuator/info", "/actuator/env", "/actuator/beans"], answer: 0, explain: "readiness = prêt à recevoir du trafic ; liveness = le processus est-il vivant." },
    { q: "Pour une API REST stateless protégée par JWT, quelle configuration est adaptée ?", options: ["oauth2ResourceServer().jwt() avec sessions STATELESS", "formLogin() avec session HTTP", "Basic auth avec mot de passe en clair", "Désactiver Spring Security"], answer: 0, explain: "Le serveur de ressources valide la signature et l'émetteur du jeton à chaque requête." },
    { q: "Quel format standard Spring 6 propose-t-il pour les réponses d'erreur HTTP ?", options: ["ProblemDetail (RFC 9457)", "SOAP Fault", "Un String brut", "HTML Whitelabel"], answer: 0, explain: "ProblemDetail : type, title, status, detail, instance." }
  ],
  flashcards: [
    ["IoC / DI en une phrase", "Spring crée et relie les objets (beans) ; les classes reçoivent leurs dépendances au lieu de les créer"],
    ["@SpringBootApplication", "@Configuration + @EnableAutoConfiguration + @ComponentScan"],
    ["Stéréotypes Spring", "@Component, @Service, @Repository, @Controller/@RestController"],
    ["Valeur par défaut dans application.yml", "${DB_URL:jdbc:postgresql://localhost/db}"],
    ["Activer un profil", "SPRING_PROFILES_ACTIVE=prod (ou --spring.profiles.active=prod)"],
    ["Valider un DTO entrant", "@Valid @RequestBody + contraintes @NotBlank, @Positive, @Email…"],
    ["Gestion globale des erreurs", "@RestControllerAdvice + @ExceptionHandler → ProblemDetail"],
    ["Requête dérivée Spring Data", "findByClientAndStatut(String client, Statut s)"],
    ["Problème N+1 : solutions", "JOIN FETCH, @EntityGraph, projections DTO"],
    ["Flyway : nommage", "V1__description.sql, V2__…, dans db/migration"],
    ["Tests de tranche", "@WebMvcTest (web), @DataJpaTest (JPA), @JsonTest ; @SpringBootTest = contexte complet"],
    ["Endpoints Actuator pour Kubernetes", "/actuator/health/liveness et /actuator/health/readiness"],
    ["Micrometer", "Façade de métriques vers Prometheus, Datadog, CloudWatch…"],
    ["Construire une image sans Dockerfile", "mvn spring-boot:build-image (Cloud Native Buildpacks)"],
    ["Encoder un mot de passe", "BCryptPasswordEncoder (jamais en clair, jamais MD5/SHA simple)"]
  ]
});
