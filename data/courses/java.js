ACADEMY.courses.push({
  id: 'java', phase: 1, kind: 'tech', order: 2,
  title: 'Java 17+ Approfondissement', icon: '☕', category: 'Langage',
  hours: '~30h', priority: 4,
  subtitle: "Le Java moderne : records, sealed classes, pattern matching, streams, Optional, concurrence et JVM.",
  description: "Vous lirez et relirez beaucoup de Java/Spring en revue d'architecture. Ce cours se concentre sur ce qui a changé depuis Java 8 jusqu'aux LTS 17 et 21 : types modernes, programmation fonctionnelle avec les streams, gestion des erreurs, collections, concurrence (y compris les threads virtuels de Java 21) et fonctionnement de la JVM.",
  searchTerm: 'Java 17 nouveautés', searchTermEn: 'Java 17 21 modern features',
  outcomes: [
    "Écrire du Java idiomatique avec var, records, text blocks et switch expressions",
    "Modéliser un domaine avec sealed interfaces et pattern matching",
    "Manipuler les collections avec l'API Stream et les Collectors",
    "Utiliser Optional correctement et gérer les exceptions",
    "Comprendre equals/hashCode, immutabilité et génériques",
    "Écrire du code concurrent : ExecutorService, CompletableFuture, threads virtuels",
    "Comprendre la JVM : heap, GC, JIT, options mémoire en conteneur"
  ],
  prerequisites: ["Bases de la programmation orientée objet", "JDK 17 ou 21 installé (Temurin recommandé)"],
  resources: [
    { label: 'dev.java — tutoriels officiels', url: 'https://dev.java/learn/' },
    { label: 'Documentation de l\'API Java 21', url: 'https://docs.oracle.com/en/java/javase/21/docs/api/' },
    { label: 'Eclipse Temurin (JDK gratuit)', url: 'https://adoptium.net/' }
  ],
  modules: [
    {
      title: 'Le langage moderne',
      lessons: [
        {
          title: 'Records, var, text blocks et switch expressions',
          sections: [
            { h: 'Les versions LTS', p: "Java sort une version tous les 6 mois ; les versions **LTS** (support long) sont 11, 17, 21, puis 25. En entreprise, visez 17 ou 21. Spring Boot 3 exige au minimum Java 17." },
            { h: 'Les records', p: "Un **record** déclare une classe de données **immuable** : constructeur, accesseurs, `equals`, `hashCode` et `toString` sont générés.", code: { lang: 'java', src: 'public record Client(String nom, String email, int age) {\n    // constructeur compact : validation\n    public Client {\n        if (age < 0) throw new IllegalArgumentException("age négatif");\n        email = email.toLowerCase();\n    }\n}\n\nvar c = new Client("Ada", "ADA@EXEMPLE.FR", 36);\nSystem.out.println(c.email()); // ada@exemple.fr' } },
            { h: 'var, text blocks, switch', bullets: ["`var` : inférence de type pour les variables locales (le type reste statique)", "Text blocks `\"\"\"` : chaînes multilignes (JSON, SQL) lisibles", "Switch expression avec `->` : renvoie une valeur, pas de fall-through", "`yield` pour renvoyer une valeur depuis un bloc de switch"], code: { lang: 'java', src: 'String sql = """\n    SELECT id, nom\n    FROM client\n    WHERE actif = true\n    """;\n\nint jours = switch (mois) {\n    case FEVRIER -> 28;\n    case AVRIL, JUIN, SEPTEMBRE, NOVEMBRE -> 30;\n    default -> 31;\n};' } }
          ],
          keypoints: ["LTS : 17 et 21 (25 en 2025)", "record = classe de données immuable", "switch expression : ->, pas de break, renvoie une valeur"]
        },
        {
          title: 'Sealed classes et pattern matching',
          sections: [
            { h: 'Hiérarchies fermées', p: "Une interface **sealed** liste explicitement ses implémentations autorisées. Le compilateur sait alors que la liste est exhaustive.", code: { lang: 'java', src: 'public sealed interface Paiement permits Carte, Virement, Especes {}\npublic record Carte(String numero, double montant) implements Paiement {}\npublic record Virement(String iban, double montant) implements Paiement {}\npublic record Especes(double montant) implements Paiement {}\n\n// Java 21 : pattern matching dans le switch, exhaustif sans default\ndouble frais(Paiement p) {\n    return switch (p) {\n        case Carte c when c.montant() > 1000 -> c.montant() * 0.01;\n        case Carte c -> 0.5;\n        case Virement v -> 0;\n        case Especes e -> 0;\n    };\n}' } },
            { h: 'Pattern matching pour instanceof', p: "`if (obj instanceof String s && !s.isBlank())` : le test et le cast sont faits en une fois, la variable `s` est utilisable directement." },
            { h: "Pourquoi c'est important en architecture", bullets: ["Modéliser des **états métier** fermés (commande : créée, payée, expédiée)", "Le compilateur signale un cas oublié lors d'un ajout", "Remplace avantageusement les hiérarchies de `if/else instanceof`", "Record patterns (Java 21) : déstructurer `case Carte(var num, var montant)`"] }
          ],
          keypoints: ["sealed + permits = hiérarchie fermée", "switch sur un type sealed = exhaustivité vérifiée", "Gardes avec `when`"]
        },
        {
          title: 'Objets, égalité, génériques et exceptions',
          sections: [
            { h: 'equals et hashCode', p: "Deux objets égaux selon `equals` **doivent** avoir le même `hashCode`, sinon `HashMap` et `HashSet` se comportent mal. Les records le garantissent automatiquement." },
            { h: 'Immutabilité', bullets: ["Champs `final`, pas de setters", "Copies défensives des collections : `List.copyOf(liste)`", "Collections immuables : `List.of`, `Set.of`, `Map.of`", "Objets immuables = partageables sans risque entre threads"] },
            { h: 'Génériques', p: "Les génériques garantissent le typage à la compilation (effacés à l'exécution). Règle **PECS** : *Producer Extends, Consumer Super*.", code: { lang: 'java', src: 'double somme(List<? extends Number> nombres) { // producteur : on lit\n    return nombres.stream().mapToDouble(Number::doubleValue).sum();\n}\nvoid remplir(List<? super Integer> cible) {     // consommateur : on écrit\n    cible.add(42);\n}' } },
            { h: 'Exceptions', bullets: ["**Checked** (IOException) : à déclarer ou attraper", "**Unchecked** (RuntimeException) : erreurs de programmation ou métier", "`try-with-resources` ferme automatiquement les ressources `AutoCloseable`", "Ne jamais avaler une exception en silence : loguer ou relancer avec la cause"] }
          ],
          keypoints: ["equals ⇒ même hashCode", "List.of = immuable", "PECS : extends pour lire, super pour écrire", "try-with-resources"]
        }
      ]
    },
    {
      title: 'Programmation fonctionnelle et collections',
      lessons: [
        {
          title: 'Lambdas et API Stream',
          sections: [
            { h: 'Interfaces fonctionnelles', bullets: ["`Function<T,R>` : transforme", "`Predicate<T>` : teste", "`Supplier<T>` : fournit", "`Consumer<T>` : consomme", "Références de méthode : `String::toUpperCase`, `Client::nom`"] },
            { h: 'Le pipeline Stream', p: "Un stream = **source** → opérations **intermédiaires** (paresseuses) → opération **terminale**.", code: { lang: 'java', src: 'Map<String, Double> caParVille = commandes.stream()\n    .filter(c -> c.statut() == Statut.PAYEE)\n    .collect(Collectors.groupingBy(\n        Commande::ville,\n        Collectors.summingDouble(Commande::montant)));\n\nList<String> top3 = clients.stream()\n    .sorted(Comparator.comparing(Client::ca).reversed())\n    .limit(3)\n    .map(Client::nom)\n    .toList(); // Java 16+' } },
            { h: 'Collectors utiles', bullets: ["`toList()`, `toSet()`, `toMap(k, v)`", "`groupingBy`, `partitioningBy`, `counting`, `joining(\", \")`", "`flatMap` pour aplatir des listes de listes", "Attention : un stream ne se consomme qu'une fois ; éviter les effets de bord dans `map`"] }
          ],
          keypoints: ["Intermédiaires paresseuses, terminale déclenche", "groupingBy = GROUP BY en mémoire", "Pas d'effets de bord dans les lambdas de stream"]
        },
        {
          title: 'Optional et collections',
          sections: [
            { h: 'Optional', p: "`Optional<T>` exprime qu'une valeur **peut être absente**. À utiliser en **type de retour**, pas en champ ni en paramètre.", code: { lang: 'java', src: 'Optional<Client> trouve = repo.findByEmail(email);\n\nString nom = trouve.map(Client::nom).orElse("inconnu");\nClient c = trouve.orElseThrow(() -> new ClientIntrouvable(email));\ntrouve.ifPresent(cl -> notifier(cl));\n// À éviter : trouve.get() sans vérification' } },
            { h: 'Choisir la bonne collection', bullets: ["`ArrayList` : accès indexé rapide (cas par défaut)", "`HashMap` / `HashSet` : recherche O(1) en moyenne", "`LinkedHashMap` : conserve l'ordre d'insertion", "`TreeMap` : trié par clé", "`ConcurrentHashMap` : accès concurrent sûr", "`ArrayDeque` : pile ou file"] }
          ],
          keypoints: ["Optional en retour de méthode uniquement", "orElseThrow plutôt que get()", "HashMap par défaut, TreeMap si tri, ConcurrentHashMap si threads"]
        }
      ]
    },
    {
      title: 'Concurrence et JVM',
      lessons: [
        {
          title: 'Concurrence : executors, CompletableFuture, threads virtuels',
          sections: [
            { h: 'Ne créez pas vos threads à la main', p: "Utilisez un **ExecutorService** qui gère un pool de threads, et `CompletableFuture` pour composer des traitements asynchrones.", code: { lang: 'java', src: 'CompletableFuture<Profil> profil = CompletableFuture.supplyAsync(() -> api.profil(id));\nCompletableFuture<List<Commande>> cmds = CompletableFuture.supplyAsync(() -> api.commandes(id));\n\nVue vue = profil.thenCombine(cmds, Vue::new)\n    .orTimeout(2, TimeUnit.SECONDS)\n    .join();' } },
            { h: 'Threads virtuels (Java 21)', p: "Les **threads virtuels** sont très légers (des millions possibles) : idéal pour les applications I/O intensives (appels HTTP, base de données). Avec Spring Boot 3.2+, `spring.threads.virtual.enabled=true`.", code: { lang: 'java', src: 'try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    urls.forEach(url -> executor.submit(() -> telecharger(url)));\n} // attend la fin de toutes les tâches' } },
            { h: 'Pièges classiques', bullets: ["**Race condition** : état partagé modifié sans synchronisation", "**Deadlock** : deux threads qui s'attendent mutuellement", "Préférer l'immutabilité, `AtomicInteger`, `ConcurrentHashMap`", "`synchronized` ou `ReentrantLock` pour les sections critiques"] }
          ],
          keypoints: ["ExecutorService plutôt que new Thread()", "CompletableFuture pour composer l'asynchrone", "Threads virtuels : I/O massives, Java 21"]
        },
        {
          title: 'La JVM : mémoire, GC et conteneurs',
          sections: [
            { h: 'Du code source au code machine', bullets: ["`javac` compile en **bytecode** (.class)", "La JVM interprète puis compile à chaud avec le **JIT** (C1, C2)", "Le **class loader** charge les classes à la demande"] },
            { h: 'La mémoire', bullets: ["**Heap** : les objets ; jeune génération et vieille génération", "**Stack** : une par thread, variables locales et appels", "**Metaspace** : métadonnées des classes", "**Garbage collectors** : G1 (défaut), ZGC (pauses très courtes), Parallel (débit)"] },
            { h: 'JVM et conteneurs', p: "La JVM détecte les limites du conteneur. Pilotez le heap en pourcentage plutôt qu'en valeur fixe.", code: { lang: 'bash', src: 'java -XX:MaxRAMPercentage=75 -XX:+UseG1GC -jar app.jar\n\n# diagnostic\njcmd <pid> GC.heap_info\njcmd <pid> Thread.print     # dump des threads\njfr / JDK Mission Control   # profilage en production' } }
          ],
          keypoints: ["Bytecode + JIT", "G1 par défaut, ZGC pour faible latence", "MaxRAMPercentage en conteneur"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Kata « Commandes » : records, sealed et streams',
      goal: "Modéliser des commandes avec des records et une interface sealed, puis produire des statistiques avec des streams.",
      minutes: 60, env: 'JDK 21 + IDE (IntelliJ IDEA Community ou VS Code)',
      steps: [
        { t: "Créez un fichier `Kata.java` (exécutable directement avec `java Kata.java`)." },
        { t: "Déclarez `sealed interface Statut permits Creee, Payee, Expediee` et les records correspondants (`Payee` porte une date).", lang: 'java', cmd: 'sealed interface Statut permits Creee, Payee, Expediee {}\nrecord Creee() implements Statut {}\nrecord Payee(java.time.LocalDate le) implements Statut {}\nrecord Expediee(String transporteur) implements Statut {}' },
        { t: "Déclarez `record Commande(String client, String ville, double montant, Statut statut)` et une liste de 8 commandes de test." },
        { t: "Calculez le chiffre d'affaires par ville des commandes payées ou expédiées (groupingBy + summingDouble)." },
        { t: "Écrivez `String libelle(Statut s)` avec un switch exhaustif par pattern matching (sans default).", hint: "`case Payee p -> \"Payée le \" + p.le();`" },
        { t: "Trouvez le meilleur client (somme des montants) avec `Optional` et affichez-le ou « aucun ».", check: "Le programme affiche le CA par ville et le meilleur client." }
      ],
      solution: { lang: 'java', src: 'import java.time.LocalDate;\nimport java.util.*;\nimport java.util.stream.*;\n\nsealed interface Statut permits Creee, Payee, Expediee {}\nrecord Creee() implements Statut {}\nrecord Payee(LocalDate le) implements Statut {}\nrecord Expediee(String transporteur) implements Statut {}\nrecord Commande(String client, String ville, double montant, Statut statut) {}\n\npublic class Kata {\n    static String libelle(Statut s) {\n        return switch (s) {\n            case Creee c -> "Créée";\n            case Payee p -> "Payée le " + p.le();\n            case Expediee e -> "Expédiée via " + e.transporteur();\n        };\n    }\n    public static void main(String[] args) {\n        var cmds = List.of(\n            new Commande("Ada", "Paris", 120, new Payee(LocalDate.now())),\n            new Commande("Alan", "Lyon", 80, new Creee()),\n            new Commande("Ada", "Paris", 60, new Expediee("Colissimo")),\n            new Commande("Grace", "Lille", 200, new Payee(LocalDate.now())));\n\n        Map<String, Double> ca = cmds.stream()\n            .filter(c -> !(c.statut() instanceof Creee))\n            .collect(Collectors.groupingBy(Commande::ville, TreeMap::new,\n                     Collectors.summingDouble(Commande::montant)));\n        System.out.println(ca);\n\n        String meilleur = cmds.stream()\n            .collect(Collectors.groupingBy(Commande::client, Collectors.summingDouble(Commande::montant)))\n            .entrySet().stream().max(Map.Entry.comparingByValue())\n            .map(Map.Entry::getKey).orElse("aucun");\n        System.out.println("Meilleur client : " + meilleur);\n        cmds.forEach(c -> System.out.println(c.client() + " : " + libelle(c.statut())));\n    }\n}' }
    }
  ],
  quiz: [
    { q: "Que génère automatiquement un record Java ?", options: ["Constructeur canonique, accesseurs, equals, hashCode et toString", "Uniquement des getters et setters", "Un builder et des setters", "Rien : c'est une interface"], answer: 0, explain: "Les records sont immuables : pas de setters." },
    { q: "Quel est l'intérêt principal d'une interface sealed ?", options: ["Restreindre les implémentations autorisées et permettre des switch exhaustifs", "Rendre l'interface plus rapide", "Interdire les méthodes par défaut", "Rendre les implémentations sérialisables"], answer: 0, explain: "Le compilateur connaît tous les sous-types : il peut vérifier l'exhaustivité." },
    { q: "Quelle affirmation sur les opérations de Stream est vraie ?", options: ["Les opérations intermédiaires sont paresseuses et ne s'exécutent qu'à l'appel d'une opération terminale", "Un stream peut être consommé plusieurs fois", "map() modifie la collection source", "filter() est une opération terminale"], answer: 0, explain: "Rien ne se passe tant qu'on n'appelle pas collect, toList, forEach, count…" },
    { q: "Où utiliser Optional selon les bonnes pratiques ?", options: ["Comme type de retour d'une méthode qui peut ne rien trouver", "Comme type de champ d'une entité", "Comme paramètre de méthode", "Dans les collections"], answer: 0, explain: "Optional a été conçu pour les valeurs de retour." },
    { q: "Si a.equals(b) est vrai, que doit-on garantir ?", options: ["a.hashCode() == b.hashCode()", "a == b", "a.toString().equals(b.toString())", "a.compareTo(b) > 0"], answer: 0, explain: "Contrat equals/hashCode indispensable pour HashMap/HashSet." },
    { q: "Quel est le principal avantage des threads virtuels de Java 21 ?", options: ["Gérer un très grand nombre de tâches bloquantes (I/O) à faible coût", "Accélérer les calculs CPU intensifs", "Supprimer le besoin de synchronisation", "Remplacer le garbage collector"], answer: 0, explain: "Ils sont montés/démontés sur des threads porteurs pendant les attentes d'I/O." },
    { q: "Quel garbage collector est utilisé par défaut dans les JVM modernes (serveur) ?", options: ["G1", "Serial", "CMS", "Epsilon"], answer: 0, explain: "G1 est le GC par défaut depuis Java 9. CMS a été supprimé." },
    { q: "Que signifie la règle PECS ?", options: ["Producer Extends, Consumer Super", "Public Extends, Class Super", "Parallel Execution, Concurrent Streams", "Primitive Equals, Compare Strings"], answer: 0, explain: "? extends T pour lire, ? super T pour écrire." },
    { q: "Quelle option JVM adapte la taille du heap aux limites mémoire d'un conteneur ?", options: ["-XX:MaxRAMPercentage", "-Xss", "-XX:+PrintGC", "-XX:MetaspaceSize"], answer: 0, explain: "Exemple : -XX:MaxRAMPercentage=75 utilise 75 % de la mémoire du conteneur pour le heap." },
    { q: "Quelle version minimale de Java exige Spring Boot 3 ?", options: ["Java 17", "Java 8", "Java 11", "Java 21"], answer: 0, explain: "Spring Boot 3 / Spring Framework 6 ont pour base Java 17 et Jakarta EE." }
  ],
  flashcards: [
    ["Versions LTS de Java", "8, 11, 17, 21, 25"],
    ["record", "Classe de données immuable : constructeur, accesseurs, equals/hashCode/toString générés"],
    ["Constructeur compact d'un record", "public Client { /* validation */ } — sans liste de paramètres"],
    ["sealed … permits …", "Hiérarchie fermée : seuls les types listés peuvent implémenter/étendre"],
    ["Garde dans un switch pattern", "case Carte c when c.montant() > 1000 -> …"],
    ["Contrat equals / hashCode", "Objets égaux ⇒ même hashCode"],
    ["PECS", "Producer Extends, Consumer Super"],
    ["Opérations Stream paresseuses", "Les intermédiaires (filter, map, sorted) ne s'exécutent qu'à l'opération terminale"],
    ["Grouper et sommer avec les streams", "collect(groupingBy(Cle, summingDouble(Valeur)))"],
    ["Optional : que faire / ne pas faire", "Retour de méthode ; map/orElse/orElseThrow · pas en champ ni paramètre, éviter get()"],
    ["try-with-resources", "try (var in = ...) { } ferme automatiquement les AutoCloseable"],
    ["Threads virtuels", "Executors.newVirtualThreadPerTaskExecutor() — Java 21, idéal pour l'I/O"],
    ["Composer deux appels asynchrones", "cf1.thenCombine(cf2, (a, b) -> …)"],
    ["GC par défaut / faible latence", "G1 par défaut · ZGC pour des pauses très courtes"],
    ["Heap en conteneur", "-XX:MaxRAMPercentage=75"],
    ["Collections immuables", "List.of, Set.of, Map.of, List.copyOf"]
  ]
});
