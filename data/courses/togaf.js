ACADEMY.courses.push({
  id: 'togaf', phase: 5, kind: 'tech', order: 1,
  title: 'TOGAF — Architecture Enterprise', icon: '🏛️', category: 'Framework', code: 'TOGAF',
  hours: '~80h', priority: 4,
  subtitle: "Le cadre de référence de l'architecture d'entreprise : ADM, contenu, gouvernance, parties prenantes et transition — avec ArchiMate.",
  description: "TOGAF (The Open Group Architecture Framework) structure le travail d'architecte d'entreprise : une méthode itérative (ADM) pour passer d'une vision à une feuille de route de transformation, un cadre de contenu (livrables, artefacts, briques), et une gouvernance (comité d'architecture, contrats, conformité). Ce cours suit le TOGAF Standard 10e édition et prépare les certifications Foundation et Practitioner.",
  searchTerm: 'TOGAF 10 ADM formation', searchTermEn: 'TOGAF 10 ADM',
  exam: {
    duration: '60 min (Foundation) · 90 min (Practitioner)', questions: '40 QCM · 8 scénarios', passing: '60 % chacun',
    notes: "Deux niveaux : **TOGAF Enterprise Architecture Foundation** (QCM, livre fermé) et **Practitioner** (8 scénarios à réponses graduées 5/3/1/0 points, livre ouvert). Passables séparément ou en examen combiné. Vérifiez les modalités actuelles sur opengroup.org."
  },
  outcomes: [
    "Expliquer ce qu'est l'architecture d'entreprise et la valeur qu'elle apporte",
    "Dérouler les phases de l'ADM (Préliminaire, A à H, gestion des exigences) et leurs livrables",
    "Adapter (tailoring) l'ADM : itérations, niveaux, partitionnement",
    "Utiliser le cadre de contenu : livrables, artefacts, briques (ABB/SBB), métamodèle",
    "Définir des principes d'architecture et mener une analyse d'écarts (gap analysis)",
    "Mettre en place la gouvernance : comité d'architecture, contrats, revues de conformité",
    "Planifier la transition : architectures de transition, planification par capacités, feuille de route",
    "Modéliser avec ArchiMate"
  ],
  prerequisites: ["Expérience d'architecture de solutions (phases 2 à 4)", "PMP (en parallèle) pour la gestion de programme"],
  resources: [
    { label: 'The TOGAF Standard, 10th Edition (The Open Group)', url: 'https://www.opengroup.org/togaf' },
    { label: 'Certifications TOGAF', url: 'https://www.opengroup.org/certifications/togaf' },
    { label: 'ArchiMate', url: 'https://www.opengroup.org/archimate-forum/archimate-overview' },
    { label: 'Archi (outil ArchiMate gratuit)', url: 'https://www.archimatetool.com/' }
  ],
  modules: [
    {
      title: 'Fondamentaux',
      lessons: [
        {
          title: "Architecture d'entreprise et structure de TOGAF",
          sections: [
            { h: "Pourquoi une architecture d'entreprise ?", p: "L'**architecture d'entreprise** décrit la structure de l'organisation (métier, données, applications, technologie) et pilote sa **transformation** de l'état actuel (**baseline**) vers un état cible (**target**) aligné sur la stratégie. Bénéfices : décisions cohérentes, réduction de la complexité et des coûts, agilité, maîtrise des risques." },
            { h: 'Les quatre domaines d\'architecture', bullets: ["**Métier** : stratégie, gouvernance, organisation, processus, capacités", "**Données** : structure des actifs de données et leur gestion", "**Applications** : applications, interactions, relation avec les processus", "**Technologie** : infrastructure logicielle et matérielle (réseau, cloud, middleware)", "Données + Applications = **architectures des systèmes d'information** (phase C)"] },
            { h: 'Organisation du TOGAF Standard 10', bullets: ["**Fundamental Content** : concepts, ADM, techniques, contenu, capacité d'architecture — stable", "**Series Guides** : guides pratiques (agilité, sécurité, architecture métier, digital…) — évoluent plus vite", "Concepts clés : **Enterprise Continuum** (classer les actifs du générique au spécifique), **Architecture Repository**, **capacité d'architecture**", "Un cadre à **adapter** (tailoring), pas à appliquer à la lettre"] }
          ],
          keypoints: ["Baseline → cible, aligné sur la stratégie", "4 domaines : Métier, Données, Applications, Technologie", "TOGAF 10 : contenu fondamental + guides", "Adapter le cadre au contexte"]
        },
        {
          title: "L'ADM : la méthode de développement d'architecture",
          sections: [
            { h: 'Le cycle', p: "L'**ADM** (Architecture Development Method) est une méthode **itérative** en phases, avec la **gestion des exigences** au centre, qui alimente et reçoit chaque phase.", bullets: ["**Préliminaire** : préparer la capacité d'architecture (principes, cadre, organisation, outils)", "**A — Vision** : périmètre, parties prenantes, vision, **déclaration de travail d'architecture** approuvée", "**B — Métier**, **C — Systèmes d'information** (données, applications), **D — Technologie** : baseline, cible, **analyse d'écarts**, feuilles de route candidates", "**E — Opportunités et solutions** : regrouper en paquets de travail, **architectures de transition**", "**F — Planification de la migration** : feuille de route et plan de mise en œuvre et de migration finalisés", "**G — Gouvernance de la mise en œuvre** : **contrats d'architecture**, revues de conformité", "**H — Gestion du changement d'architecture** : surveiller, décider d'un nouveau cycle"] },
            { h: 'Itérer', bullets: ["**Itération de contexte** (Préliminaire, A) : établir la capacité et le périmètre", "**Itération de définition** (B, C, D) : développer l'architecture", "**Itération de transition** (E, F) : planifier", "**Itération de gouvernance** (G, H) : piloter", "Les cycles s'emboîtent : **stratégie → segment → capacité** (niveaux de détail)"] },
            { h: 'Livrables clés à retenir', bullets: ["**Request for Architecture Work** (déclencheur de la phase A)", "**Statement of Architecture Work** (fin de A, signé)", "**Architecture Vision**, **Architecture Definition Document**, **Architecture Requirements Specification**", "**Architecture Roadmap**, **Implementation and Migration Plan**", "**Architecture Contract**, **Compliance Assessment**, **Change Request**"] }
          ],
          keypoints: ["Préliminaire, A→H, exigences au centre", "A produit le Statement of Architecture Work", "B-C-D : baseline, cible, gap", "E-F : transition et migration ; G : contrats ; H : changement"]
        }
      ]
    },
    {
      title: 'Contenu, techniques et gouvernance',
      lessons: [
        {
          title: 'Cadre de contenu, briques et principes',
          sections: [
            { h: 'Livrables, artefacts, briques', bullets: ["**Livrable** : produit contractuel, revu et validé par les parties prenantes", "**Artefact** : vue précise — **catalogue** (liste), **matrice** (relations), **diagramme**", "**Brique** (building block) : composant réutilisable ; **ABB** (Architecture Building Block, le « quoi », indépendant des produits) vs **SBB** (Solution Building Block, le « comment », produit/composant concret)", "**Métamodèle de contenu** : entités (acteur, rôle, processus, service, application, donnée, composant technologique…) et relations"] },
            { h: 'Principes d\'architecture', p: "Un principe se décrit par un **nom**, un **énoncé**, une **justification** (rationale) et ses **implications**. Exemple :", code: { lang: 'text', src: 'Nom            : Cloud d\'abord (Cloud First)\nÉnoncé         : Toute nouvelle solution est déployée sur les plateformes cloud\n                 de l\'entreprise (AWS ou Azure), sauf dérogation du comité.\nJustification  : Agilité, élasticité, sécurité mutualisée, coût à l\'usage.\nImplications   : - Compétences cloud à développer (plan de formation)\n                 - Landing zones et services partagés à maintenir\n                 - Processus de dérogation documenté\n                 - Critères FinOps dans les dossiers d\'architecture' } },
            { h: 'Parties prenantes et points de vue', bullets: ["**Cartographie des parties prenantes** : pouvoir / intérêt → gérer étroitement, satisfaire, tenir informé, surveiller", "**Préoccupations** (concerns) → **points de vue** (viewpoints) → **vues** (views) adaptées à chaque partie prenante", "Un DSI, un responsable sécurité et une équipe de développement n'ont pas besoin de la même vue"] }
          ],
          keypoints: ["Livrable / artefact / brique", "ABB = quoi ; SBB = comment", "Principe : nom, énoncé, justification, implications", "Préoccupations → points de vue → vues"]
        },
        {
          title: 'Techniques : gap analysis, capacités, migration',
          sections: [
            { h: "L'analyse d'écarts", p: "On compare les briques de la **baseline** et de la **cible** dans une matrice. Chaque écart est classé :", bullets: ["Présent dans les deux → **conservé** (tel quel ou amélioré)", "Seulement en baseline → **éliminé** (intentionnellement ? sinon oubli à corriger)", "Seulement en cible → **nouveau** : à développer ou acquérir", "Les écarts alimentent les **paquets de travail** de la phase E"] },
            { h: 'Planification par capacités', bullets: ["Organiser la transformation autour des **capacités métier** (ce que l'entreprise sait faire) plutôt que des projets", "**Carte des capacités** et niveau de maturité actuel/cible", "Incréments de capacité livrés par des **architectures de transition** successives", "Évaluation de la **préparation à la transformation** (Business Transformation Readiness)"] },
            { h: 'Autres techniques', bullets: ["**Matrice d'interopérabilité** et exigences d'interopérabilité", "**Gestion des risques** : risque initial → mesures → risque résiduel", "Analyse **coût/bénéfice**, **tableau de migration consolidée** (gaps, solutions, dépendances)", "Scénarios métier pour dériver les exigences", "Architecture de sécurité intégrée à chaque phase (guide dédié)"] }
          ],
          keypoints: ["Gap : conservé, éliminé, nouveau", "Capacités métier au cœur de la planification", "Architectures de transition = étapes intermédiaires", "Risque initial vs résiduel"]
        },
        {
          title: 'Gouvernance et capacité d\'architecture',
          sections: [
            { h: 'Gouverner', bullets: ["**Comité d'architecture** (Architecture Board) : valide, arbitre, accorde les dérogations, suit la conformité", "**Contrats d'architecture** : accords entre architectes, équipes de réalisation et sponsors (phase G)", "**Revues de conformité** : niveaux — irrelevant, consistent, compliant, conformant, fully conformant, non-conformant", "**Dispense (dispensation)** : dérogation temporaire et encadrée", "Registre des décisions d'architecture"] },
            { h: 'Capacité et référentiel', bullets: ["**Architecture Repository** : métamodèle, **paysage d'architecture** (stratégique, segment, capacité), bibliothèque de référence, référentiel de standards, journal de gouvernance", "**Enterprise Continuum** : du fondamental (générique) au commun, à l'industrie, à l'organisation", "Modèles de référence : TRM (technique), III-RM (information intégrée)", "Maturité de la capacité d'architecture ; compétences (skills framework)"] },
            { h: 'TOGAF, l\'agilité et votre rôle', bullets: ["Articuler l'ADM avec les équipes agiles : architecture « juste assez », **intentional architecture**, runway", "Les principes et garde-fous (landing zones, Policy, SCP) incarnent l'architecture dans le cloud", "Le COA de votre entreprise joue le rôle de comité d'architecture : contrats = dossiers d'architecture validés", "Lien PMP : l'ADM planifie la transformation, le management de programme/projet l'exécute (phases F et G)"] }
          ],
          keypoints: ["Comité d'architecture + contrats + conformité", "Architecture Repository", "Enterprise Continuum : générique → spécifique", "ADM agile : juste assez d'architecture"]
        }
      ]
    },
    {
      title: 'ArchiMate et mise en pratique',
      lessons: [
        {
          title: 'Modéliser avec ArchiMate',
          sections: [
            { h: 'Le langage', p: "**ArchiMate** (The Open Group) est le langage de modélisation compagnon de TOGAF. Il organise les éléments en **couches** et en **aspects**.", bullets: ["Couches : **Stratégie** (capacité, ressource, chaîne de valeur), **Métier**, **Application**, **Technologie**, **Physique**, **Implémentation et migration** (paquet de travail, plateau, écart)", "Aspects : **structure active** (qui : acteur, composant), **comportement** (quoi : processus, fonction, service), **structure passive** (sur quoi : objet métier, donnée)", "Relations : composition, agrégation, affectation, réalisation, service (serving), accès, flux, déclenchement…"] },
            { h: 'Vues utiles pour un architecte cloud', bullets: ["Vue **coopération d'applications** : flux entre vos 22 applications", "Vue **utilisation de la technologie** : applications ↔ services cloud (AWS/Azure)", "Vue **carte des capacités** avec heatmap de maturité", "Vue **migration** : plateaux (baseline, transition 1, 2, cible) et écarts", "Outil gratuit : **Archi** ; modèles versionnables (format d'échange)"] }
          ],
          keypoints: ["Couches : Stratégie, Métier, Application, Technologie, Physique, Implémentation", "Aspects : structure active, comportement, structure passive", "Plateaux et écarts pour la migration"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Cycle ADM appliqué à votre SI (22 applications)',
      goal: "Dérouler un cycle ADM allégé sur un cas réaliste : moderniser le SI de 22 applications vers le cloud bimodal AWS/Azure, en produisant les artefacts clés.",
      minutes: 180, env: 'Archi (gratuit) ou draw.io + tableur',
      steps: [
        { t: "**Préliminaire** : rédigez 5 principes d'architecture (nom, énoncé, justification, implications) — ex. Cloud First, Sécurité par conception, Données comme actif, Réutilisation, Automatisation." },
        { t: "**Phase A** : cartographie des parties prenantes (pouvoir/intérêt), vision d'architecture en une page, et un Statement of Architecture Work (périmètre, livrables, calendrier)." },
        { t: "**Phase B** : carte des capacités métier (10–15) avec maturité actuelle et cible." },
        { t: "**Phase C** : catalogue des 22 applications (criticité, technologie, hébergement) et vue de coopération d'applications ArchiMate." },
        { t: "**Phase D** : baseline et cible technologiques (on-premises → landing zones AWS/Azure, Kubernetes, CI/CD) ; **matrice d'analyse d'écarts**.", hint: "Colonnes : briques cibles ; lignes : briques baseline ; dernière ligne « nouveau », dernière colonne « éliminé »." },
        { t: "**Phases E/F** : regroupez les écarts en paquets de travail, définissez 2 architectures de transition et une feuille de route sur 18 mois (vagues de migration, stratégie 7 R par application)." },
        { t: "**Phase G** : rédigez un modèle de contrat d'architecture et une checklist de revue de conformité pour le COA." },
        { t: "**Phase H** : définissez les indicateurs qui déclencheraient un nouveau cycle (nouvelle réglementation, dette, coûts).", check: "Chaque artefact est traçable vers un principe ou une exigence." }
      ]
    }
  ],
  quiz: [
    { q: "Quelle phase de l'ADM produit le Statement of Architecture Work ?", options: ["Phase A — Vision de l'architecture", "Phase Préliminaire", "Phase E", "Phase G"], answer: 0, explain: "Il définit le périmètre et l'approche et doit être approuvé en fin de phase A." },
    { q: "Qu'est-ce qui se trouve au centre du cycle ADM ?", options: ["La gestion des exigences", "La phase Préliminaire", "Le comité d'architecture", "L'Enterprise Continuum"], answer: 0, explain: "Les exigences sont gérées en continu et alimentent chaque phase." },
    { q: "Quelle phase met en place les contrats d'architecture et les revues de conformité ?", options: ["Phase G — Gouvernance de la mise en œuvre", "Phase F", "Phase H", "Phase B"], answer: 0, explain: "La phase G supervise la réalisation." },
    { q: "Quelle est la différence entre ABB et SBB ?", options: ["L'ABB décrit la capacité requise indépendamment des produits ; le SBB est le composant concret qui la réalise", "Ce sont des synonymes", "L'ABB est technique, le SBB métier", "Le SBB est plus abstrait"], answer: 0, explain: "ABB = le quoi ; SBB = le comment (produit, solution)." },
    { q: "Dans une analyse d'écarts, une brique présente dans la cible mais pas dans la baseline est…", options: ["Nouvelle : à développer ou acquérir", "Éliminée", "Conservée", "Un doublon à ignorer"], answer: 0, explain: "Elle générera un paquet de travail." },
    { q: "Quels éléments décrivent un principe d'architecture selon TOGAF ?", options: ["Nom, énoncé, justification, implications", "Titre, coût, délai", "Acteur, rôle, processus", "Risque, impact, probabilité"], answer: 0, explain: "La justification explique le pourquoi, les implications le coût de sa mise en œuvre." },
    { q: "Quelle phase définit les architectures de transition et regroupe les écarts en paquets de travail ?", options: ["Phase E — Opportunités et solutions", "Phase D", "Phase A", "Phase H"], answer: 0, explain: "La phase F finalise ensuite la planification de la migration." },
    { q: "Quel est le rôle de la phase H ?", options: ["Gérer le changement d'architecture et décider d'un nouveau cycle", "Définir l'architecture technologique", "Rédiger la vision", "Former les équipes"], answer: 0, explain: "Elle surveille les évolutions (technologiques, métier) et leur impact." },
    { q: "Que sont les livrables, artefacts et briques ?", options: ["Livrable : produit contractuel validé ; artefact : catalogue/matrice/diagramme ; brique : composant réutilisable", "Trois noms du même concept", "Des phases de l'ADM", "Des niveaux de conformité"], answer: 0, explain: "C'est le cadre de contenu de TOGAF." },
    { q: "Dans ArchiMate, à quel aspect appartient un « composant applicatif » ?", options: ["Structure active", "Comportement", "Structure passive", "Motivation"], answer: 0, explain: "Il réalise des comportements (fonctions, services applicatifs)." }
  ],
  flashcards: [
    ["Phases de l'ADM", "Préliminaire, A Vision, B Métier, C Systèmes d'information, D Technologie, E Opportunités & solutions, F Planification de la migration, G Gouvernance de la mise en œuvre, H Gestion du changement + Exigences au centre"],
    ["Déclencheur de la phase A", "Request for Architecture Work"],
    ["Sortie approuvée de la phase A", "Statement of Architecture Work (+ Architecture Vision)"],
    ["Phase C", "Architectures des systèmes d'information : données et applications"],
    ["Phase E", "Opportunités et solutions : paquets de travail, architectures de transition"],
    ["Phase F", "Feuille de route et plan de mise en œuvre et de migration finalisés"],
    ["Phase G", "Contrats d'architecture et revues de conformité"],
    ["4 domaines d'architecture", "Métier, Données, Applications, Technologie"],
    ["ABB vs SBB", "ABB : quoi, indépendant des produits · SBB : comment, solution concrète"],
    ["Types d'artefacts", "Catalogues, matrices, diagrammes"],
    ["Structure d'un principe", "Nom, énoncé, justification, implications"],
    ["Analyse d'écarts : 3 cas", "Conservé (dans les deux), éliminé (baseline seule), nouveau (cible seule)"],
    ["Enterprise Continuum", "Classement des actifs : fondamental → commun → industrie → organisation"],
    ["Architecture Repository", "Métamodèle, paysage, bibliothèque de référence, standards, journal de gouvernance, capacité"],
    ["Comité d'architecture", "Valide, arbitre, accorde les dispenses, suit la conformité"],
    ["Préoccupation / point de vue / vue", "Besoin d'une partie prenante → modèle de représentation → représentation concrète"],
    ["Couches ArchiMate", "Stratégie, Métier, Application, Technologie, Physique, Implémentation & migration"],
    ["Examens TOGAF", "Foundation : 40 QCM, 60 min, 60 % · Practitioner : 8 scénarios, 90 min, 60 %, livre ouvert"]
  ]
});
