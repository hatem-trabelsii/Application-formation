ACADEMY.courses.push({
  id: 'pmp', phase: 5, kind: 'cert', order: 1,
  title: 'Project Management Professional', icon: '📋',
  vendor: 'PMI', level: 'Expert', code: 'PMP',
  hours: '~150h', cost: '~555€', priority: 5,
  subtitle: "Diriger des projets prédictifs, agiles et hybrides : personnes, processus et environnement métier — et réussir le PMP.",
  description: "Le PMP certifie votre capacité à piloter des projets quelle que soit l'approche. L'examen est situationnel : « que doit faire le chef de projet EN PREMIER ? ». Vous apprendrez l'état d'esprit PMI (servant leader, proactif, orienté valeur), les techniques clés (planification, valeur acquise, risques, parties prenantes) et l'agilité (Scrum, Kanban), avec plus de la moitié des questions en contexte agile ou hybride.",
  searchTerm: 'PMP préparation examen', searchTermEn: 'PMP exam prep',
  exam: {
    duration: '230 min', questions: '180 questions', passing: 'Non publié (≈ 70 % estimé)',
    domains: [['Personnes (People)', '33%'], ['Processus (Process)', '41%'], ['Environnement métier (Business Environment)', '26%']],
    notes: "Répartition du référentiel (ECO) annoncé par PMI pour 2026 ; l'ancien référentiel était 42 % / 50 % / 8 %. Vérifiez sur pmi.org avant de réserver. Éligibilité : 35 h de formation en management de projet + 36 mois d'expérience de direction de projets (avec un diplôme bac+4) ou 60 mois (sinon). Tarif ≈ 405 $ membre PMI / 575 $ non-membre : l'adhésion est souvent rentable."
  },
  outcomes: [
    "Adopter l'état d'esprit PMI : leadership serviteur, valeur, éthique, proactivité",
    "Choisir une approche prédictive, agile ou hybride selon le contexte",
    "Mener l'équipe : constitution, motivation, conflits, négociation, coaching",
    "Planifier et maîtriser périmètre, délais, coûts (valeur acquise), qualité",
    "Gérer risques, parties prenantes, communications, approvisionnements et changements",
    "Appliquer Scrum et Kanban ; gérer backlog, vélocité, releases",
    "Aligner le projet sur la stratégie, les bénéfices et la conformité",
    "Répondre aux questions situationnelles avec la logique PMI"
  ],
  prerequisites: ["35 heures de formation certifiante en management de projet (ce cours + une formation reconnue par PMI)", "Expérience de conduite de projets (36 ou 60 mois selon le diplôme)"],
  resources: [
    { label: 'Page officielle PMP (PMI)', url: 'https://www.pmi.org/certifications/project-management-pmp' },
    { label: 'PMI Standards (PMBOK Guide)', url: 'https://www.pmi.org/standards/pmbok' },
    { label: 'Agile Practice Guide / ressources agiles PMI', url: 'https://www.pmi.org/disciplined-agile' },
    { label: 'Guide Scrum officiel (FR)', url: 'https://scrumguides.org/' }
  ],
  modules: [
    {
      title: 'Fondamentaux et état d\'esprit',
      lessons: [
        {
          title: 'Projets, valeur et approches de développement',
          sections: [
            { h: 'Définitions', bullets: ["**Projet** : effort temporaire pour créer un produit, service ou résultat unique", "**Programme** : projets liés gérés ensemble pour des bénéfices communs ; **portefeuille** : ensemble aligné sur la stratégie", "**PMO** : support, contrôle ou directif", "Structures : fonctionnelle, matricielle (faible, équilibrée, forte), par projet — le pouvoir du chef de projet varie"] },
            { h: "Le PMBOK Guide actuel", p: "Le PMBOK est passé d'une logique de processus à une logique de **principes** et de **domaines de performance**, orientée **livraison de valeur**.", bullets: ["12 principes : intendance (stewardship), équipe, parties prenantes, valeur, pensée systémique, leadership, adaptation au contexte (tailoring), qualité, complexité, risques, adaptabilité et résilience, changement", "8 domaines de performance : parties prenantes, équipe, approche de développement et cycle de vie, planification, travail du projet, livraison, mesure, incertitude"] },
            { h: 'Prédictif, agile ou hybride ?', bullets: ["**Prédictif** (cascade) : exigences stables, fortes contraintes réglementaires, coût du changement élevé", "**Agile** : exigences incertaines, livraison incrémentale de valeur, feedback fréquent", "**Hybride** : combinaison (ex. infrastructure en prédictif, applicatif en agile)", "Outil : **filtre d'adéquation agile** (culture, équipe, nature du projet)"] },
            { h: "L'état d'esprit PMI pour l'examen", bullets: ["Le chef de projet est un **leader serviteur** : il facilite, supprime les obstacles, protège l'équipe", "**Analyser avant d'agir** : comprendre la situation, consulter les documents (registre des risques, plan…)", "Parler **directement** et en privé à la personne concernée avant d'escalader", "Suivre le **processus de gestion des changements**, jamais de modification non approuvée", "Éthique (Code de déontologie PMI) : responsabilité, respect, équité, honnêteté"] }
          ],
          keypoints: ["Projet = temporaire + unique", "12 principes, 8 domaines de performance", "Choisir l'approche selon l'incertitude", "Analyser d'abord, escalader en dernier"]
        }
      ]
    },
    {
      title: 'Personnes (People)',
      lessons: [
        {
          title: 'Diriger et développer l\'équipe',
          sections: [
            { h: 'Constituer et faire grandir l\'équipe', bullets: ["**Tuckman** : forming, storming, norming, performing, adjourning", "**Charte d'équipe** (team charter) : valeurs, règles de fonctionnement, prise de décision", "Équipes virtuelles : outils, fuseaux, rituels explicites", "Développer les compétences : formation, mentorat, **équipes en T** (polyvalence)"] },
            { h: 'Motiver', bullets: ["**Maslow** (besoins), **Herzberg** (facteurs d'hygiène vs motivation), **McClelland** (accomplissement, affiliation, pouvoir), **McGregor** (X/Y)", "**Pink** (Drive) : autonomie, maîtrise, sens", "Reconnaissance et récompenses alignées sur les comportements attendus", "Intelligence émotionnelle : conscience de soi, maîtrise de soi, conscience sociale, gestion des relations"] },
            { h: 'Gérer les conflits', p: "Le conflit est normal ; on traite le **problème**, pas les personnes, en privé d'abord. Techniques (Thomas-Kilmann) :", bullets: ["**Collaborer / résoudre le problème** : gagnant-gagnant, solution durable (préférée à l'examen)", "**Compromis** : chacun cède quelque chose", "**Adoucir / accommoder** : insister sur les points d'accord", "**Forcer / diriger** : urgence, sécurité", "**Éviter / se retirer** : temporairement, si l'enjeu est faible ou pour laisser retomber la tension"] },
            { h: 'Leadership et pouvoir', bullets: ["Styles : serviteur, transformationnel, situationnel (Hersey-Blanchard : diriger, coacher, soutenir, déléguer)", "Sources de pouvoir : légitime, expert, référent, récompense, coercition — privilégier expert et référent", "Négociation gagnant-gagnant ; prise de décision de groupe (vote, poing de cinq, Delphi)", "Soutenir les membres en difficulté : écouter, comprendre la cause, coacher avant tout recadrage formel"] }
          ],
          keypoints: ["Tuckman : forming → storming → norming → performing → adjourning", "Collaborer = meilleure résolution de conflit", "Pouvoir expert/référent plutôt que coercitif", "Leadership situationnel"]
        }
      ]
    },
    {
      title: 'Processus (Process)',
      lessons: [
        {
          title: 'Initialiser et planifier (prédictif)',
          sections: [
            { h: 'Démarrer', bullets: ["**Charte du projet** : autorise le projet et le chef de projet ; signée par le **sponsor**", "Business case et plan de gestion des bénéfices (en amont)", "**Registre des parties prenantes** : identifier tôt ; grille pouvoir/intérêt", "Hypothèses et contraintes consignées"] },
            { h: 'Planifier le périmètre, les délais, les coûts', bullets: ["Recueil des exigences → **matrice de traçabilité**", "Énoncé du périmètre → **WBS** (organigramme des tâches) → dictionnaire du WBS ; la **référence de base du périmètre** = énoncé + WBS + dictionnaire", "Ordonnancement : liens FS/SS/FF/SF, avance/retard, **chemin critique** (marge totale nulle), estimation à trois points (PERT : (O + 4M + P) / 6)", "Compression : **crashing** (ajouter des ressources, coûte plus) vs **fast tracking** (paralléliser, plus de risque)", "Coûts : estimation analogique, paramétrique, ascendante ; **réserves pour aléas** (risques connus) vs **réserves de management** (inconnus, hors référence de base)"] },
            { h: 'Le plan de management', p: "Le **plan de management du projet** intègre les plans subsidiaires (périmètre, calendrier, coûts, qualité, ressources, communications, risques, approvisionnements, parties prenantes) et les **références de base** (périmètre, calendrier, coûts). Toute modification des références de base passe par le **contrôle intégré des modifications** (CCB)." }
          ],
          keypoints: ["Charte signée par le sponsor", "WBS : décomposition en livrables", "Chemin critique = marge nulle", "Crashing (coût) vs fast tracking (risque)", "Réserves pour aléas vs de management"]
        },
        {
          title: 'Maîtriser : valeur acquise, qualité, risques, changements',
          sections: [
            { h: 'La valeur acquise (EVM)', p: "Trois mesures : **PV** (valeur planifiée), **EV** (valeur acquise = travail réalisé × budget), **AC** (coût réel). **BAC** = budget à l'achèvement.", code: { lang: 'text', src: 'SV  = EV − PV        (écart de délai ; < 0 = en retard)\nCV  = EV − AC        (écart de coût ; < 0 = dépassement)\nSPI = EV / PV        (< 1 = en retard)\nCPI = EV / AC        (< 1 = au-dessus du budget)\nEAC = BAC / CPI      (estimation à l\'achèvement, tendance actuelle)\nETC = EAC − AC       (reste à dépenser)\nVAC = BAC − EAC\nTCPI = (BAC − EV) / (BAC − AC)   (performance requise pour tenir le BAC)\n\nExemple : BAC 100 k€, 40 % réalisé (EV 40), PV 50, AC 45\nSV = −10 (retard) · CV = −5 · SPI = 0,8 · CPI ≈ 0,89 · EAC ≈ 112,5 k€' } },
            { h: 'Qualité', bullets: ["Qualité = conformité aux exigences et adéquation à l'usage ; **prévention plutôt qu'inspection**", "**Coût de la qualité** : conformité (prévention, évaluation) vs non-conformité (défaillances internes, externes)", "Outils : diagramme de Pareto (80/20), Ishikawa (causes-effets), cartes de contrôle (règle des 7 points), histogrammes", "Gérer la qualité (processus, audits) vs maîtriser la qualité (vérifier les livrables)"] },
            { h: 'Risques', bullets: ["Identifier (ateliers, SWOT, hypothèses) → analyse **qualitative** (probabilité × impact) → **quantitative** (Monte-Carlo, valeur monétaire attendue = P × impact)", "Réponses aux **menaces** : éviter, transférer (assurance, contrat), atténuer, **accepter** (active : réserve ; passive) , escalader", "Réponses aux **opportunités** : exploiter, partager, améliorer, accepter, escalader", "**Propriétaire** de chaque risque ; déclencheurs ; risques résiduels et secondaires ; plans de repli", "Un risque qui se réalise devient un **problème** (issue log) → appliquer la réponse prévue"] },
            { h: 'Changements et clôture', bullets: ["Demande de changement → **analyser l'impact** → soumettre au CCB → décision → mettre à jour plans et informer", "Validation du périmètre (acceptation formelle par le client) vs maîtrise du périmètre (éviter le **scope creep**)", "Approvisionnements : contrats forfaitaires (risque au vendeur), en régie / cost-plus (risque à l'acheteur), temps et matériel", "Clôture : acceptation finale, transfert, **leçons apprises**, archivage, libération des ressources"] }
          ],
          keypoints: ["CPI/SPI < 1 = mauvais", "EAC = BAC / CPI", "Prévention > inspection", "Menaces : éviter, transférer, atténuer, accepter, escalader", "Changement : analyser l'impact AVANT le CCB"]
        },
        {
          title: 'Agile et hybride en pratique',
          sections: [
            { h: 'Scrum', bullets: ["Rôles : **Product Owner** (valeur, backlog), **Scrum Master** (leader serviteur, processus, obstacles), **Developers**", "Événements : **Sprint** (≤ 1 mois), Sprint Planning, **Daily Scrum** (15 min, pour les développeurs), Sprint Review (inspection de l'incrément avec les parties prenantes), **Rétrospective** (amélioration de l'équipe)", "Artefacts : Product Backlog (objectif produit), Sprint Backlog (objectif de sprint), Incrément (**Definition of Done**)"] },
            { h: 'Pratiques agiles', bullets: ["User stories (INVEST), critères d'acceptation, **Definition of Ready**", "Estimation relative : points d'histoire, planning poker, taille de t-shirt", "**Vélocité** pour prévoir (jamais pour comparer des équipes) ; burndown / burnup", "**Kanban** : visualiser, **limiter le WIP**, gérer le flux (lead time, cycle time)", "MVP, incréments, feedback fréquent ; priorisation MoSCoW, valeur/effort", "Mise à l'échelle : SAFe, LeSS, Scrum of Scrums, Disciplined Agile"] },
            { h: 'Réflexes situationnels agiles', bullets: ["Un membre dépasse la timebox du daily → le Scrum Master rappelle la règle, discussion après", "Le PO veut ajouter du travail en cours de sprint → négocier avec l'équipe ; l'objectif de sprint ne doit pas être mis en danger", "L'équipe est bloquée par une dépendance externe → le SM/chef de projet lève l'obstacle", "Qualité insuffisante → renforcer la Definition of Done, rétrospective", "Partie prenante absente des reviews → la réengager, montrer la valeur"] }
          ],
          keypoints: ["PO = valeur ; SM = processus et obstacles", "Daily = pour les développeurs, 15 min", "Kanban : limiter le WIP", "Vélocité = prévision interne"]
        }
      ]
    },
    {
      title: 'Environnement métier',
      lessons: [
        {
          title: 'Stratégie, bénéfices, conformité et changement organisationnel',
          sections: [
            { h: 'Aligner et livrer de la valeur', bullets: ["Relier le projet aux **objectifs stratégiques** et au **business case**", "**Plan de gestion des bénéfices** : quand et comment les bénéfices seront réalisés et mesurés (souvent après le projet)", "Indicateurs : ROI, VAN (NPV), TRI (IRR), délai de récupération", "Réévaluer régulièrement : un projet qui ne crée plus de valeur doit être réorienté ou arrêté"] },
            { h: 'Conformité et environnement', bullets: ["Identifier les exigences réglementaires (RGPD, sécurité, normes sectorielles) dès le début", "Classer et suivre les exigences de conformité, auditer", "Facteurs environnementaux (EEF) et actifs organisationnels (OPA)", "Durabilité et impacts ESG de plus en plus attendus"] },
            { h: 'Accompagner le changement', bullets: ["Modèles : **ADKAR** (Awareness, Desire, Knowledge, Ability, Reinforcement), **Kotter** (8 étapes), courbe du changement", "Évaluer la culture et la maturité de l'organisation", "Communication, formation, parrains du changement, mesure de l'adoption", "Gérer les changements externes (marché, réglementation) : analyser l'impact et adapter la feuille de route"] },
            { h: 'Méthode pour les 180 questions', bullets: ["Lire la **dernière phrase** en premier : que demande-t-on ? (EN PREMIER, MEILLEURE action, PROCHAINE étape)", "Identifier le contexte : prédictif ou agile", "Éliminer : escalader trop tôt, ignorer, agir sans analyser, enfreindre le processus", "Gestion du temps : ~76 s par question ; 2 pauses de 10 min"] }
          ],
          keypoints: ["Plan de gestion des bénéfices", "VAN > 0, TRI > coût du capital", "ADKAR / Kotter", "Lire d'abord la question posée"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Plan de projet complet : migration cloud de 22 applications',
      goal: "Produire les livrables clés d'un projet hybride réel (votre contexte) : charte, WBS, planning avec chemin critique, registre des risques, EVM et backlog agile.",
      minutes: 180, env: 'Tableur + outil de diagramme (ou Jira/Azure Boards gratuit)',
      steps: [
        { t: "Rédigez la **charte** : objectifs SMART, périmètre haut niveau, jalons, budget, risques majeurs, sponsor, critères de succès." },
        { t: "Construisez le **registre des parties prenantes** avec une grille pouvoir/intérêt et la stratégie d'engagement de chacune." },
        { t: "Élaborez un **WBS** à 3 niveaux (landing zone, pipelines, migration par vagues, formation, clôture)." },
        { t: "Planifiez 15 activités avec durées (PERT) et dépendances ; identifiez le **chemin critique** à la main.", hint: "Calcul aller (dates au plus tôt) puis retour (dates au plus tard) ; marge = tard − tôt." },
        { t: "Créez un **registre des risques** (10 risques) : probabilité, impact, score, réponse, propriétaire, déclencheur." },
        { t: "Simulez l'**EVM** au mois 4 (BAC, PV, EV, AC fictifs) : calculez SV, CV, SPI, CPI, EAC, TCPI et rédigez 5 lignes d'analyse." },
        { t: "Pour la partie applicative, rédigez 8 **user stories** INVEST avec critères d'acceptation, estimez en points et planifiez 2 sprints." },
        { t: "Rédigez une **demande de changement** (ajout d'une 23e application) avec analyse d'impact sur délais, coûts, risques.", check: "Chaque livrable est cohérent avec la charte et les références de base." }
      ]
    }
  ],
  quiz: [
    { q: "Deux membres de l'équipe sont en conflit sur une solution technique. Que doit faire le chef de projet EN PREMIER ?", options: ["Les réunir en privé pour comprendre les points de vue et chercher une solution ensemble", "Escalader au sponsor", "Choisir lui-même la solution", "Ignorer, ils sont adultes"], answer: 0, explain: "Collaborer / résoudre le problème directement, avant toute escalade." },
    { q: "Un projet a EV = 40 k€, PV = 50 k€, AC = 45 k€. Quelle est sa situation ?", options: ["En retard et au-dessus du budget", "En avance et sous le budget", "En retard mais sous le budget", "Dans les temps et le budget"], answer: 0, explain: "SPI = 0,8 (< 1, retard) ; CPI ≈ 0,89 (< 1, dépassement)." },
    { q: "BAC = 200 k€ et CPI = 0,8. Quelle est l'EAC si la tendance continue ?", options: ["250 k€", "160 k€", "200 k€", "240 k€"], answer: 0, explain: "EAC = BAC / CPI = 200 / 0,8 = 250 k€." },
    { q: "Un client demande une nouvelle fonctionnalité en cours de projet prédictif. Que faire d'abord ?", options: ["Analyser l'impact puis soumettre une demande de changement au CCB", "L'ajouter immédiatement pour satisfaire le client", "Refuser catégoriquement", "Demander à l'équipe de faire des heures supplémentaires"], answer: 0, explain: "Toute modification des références de base passe par le contrôle intégré des modifications." },
    { q: "Quelle technique de compression ajoute des ressources aux activités critiques, avec un surcoût ?", options: ["Le crashing", "Le fast tracking", "Le nivellement des ressources", "La décomposition"], answer: 0, explain: "Le fast tracking parallélise des activités (plus de risque, pas forcément plus de coût)." },
    { q: "Qui est responsable de maximiser la valeur du produit et d'ordonner le Product Backlog ?", options: ["Le Product Owner", "Le Scrum Master", "Le sponsor", "Les développeurs"], answer: 0, explain: "Le Scrum Master est responsable de l'efficacité de l'équipe et du cadre Scrum." },
    { q: "Pendant le Daily Scrum, un développeur se lance dans une longue discussion technique. Que fait le Scrum Master ?", options: ["Rappelle la timebox et propose de poursuivre après le daily avec les personnes concernées", "Annule le daily", "Laisse la discussion se poursuivre", "Signale le développeur à son manager"], answer: 0, explain: "Le daily reste de 15 minutes, centré sur l'objectif de sprint." },
    { q: "Un risque identifié se produit. Quelle est la première action ?", options: ["Mettre en œuvre la réponse prévue dans le registre des risques", "Informer le sponsor et attendre", "Créer un nouveau plan de projet", "Ignorer si l'impact est faible"], answer: 0, explain: "Le risque devient un problème : on applique la réponse planifiée et on met à jour les registres." },
    { q: "Quelle réponse à une menace consiste à souscrire une assurance ?", options: ["Transférer", "Éviter", "Atténuer", "Exploiter"], answer: 0, explain: "Le transfert déplace l'impact financier vers un tiers." },
    { q: "Quel document autorise formellement le projet et donne son autorité au chef de projet ?", options: ["La charte du projet", "Le plan de management du projet", "Le WBS", "Le registre des parties prenantes"], answer: 0, explain: "Elle est émise par le sponsor ou l'initiateur." },
    { q: "Dans une équipe Kanban, le travail s'accumule en « test ». Quelle action est la plus appropriée ?", options: ["Respecter la limite de WIP et aider à terminer les éléments en test avant d'en commencer d'autres", "Commencer plus d'éléments en développement", "Supprimer la colonne test", "Augmenter la limite de WIP partout"], answer: 0, explain: "Stop starting, start finishing : on règle le goulot d'étranglement." },
    { q: "À quoi sert principalement le plan de gestion des bénéfices ?", options: ["Définir comment et quand les bénéfices seront réalisés et mesurés", "Lister les tâches du projet", "Suivre les coûts réels", "Planifier les réunions"], answer: 0, explain: "La réalisation des bénéfices se poursuit souvent après la clôture du projet." },
    { q: "Selon PMI, où se situe l'accent de la gestion de la qualité ?", options: ["La prévention plutôt que l'inspection", "L'inspection finale de tous les livrables", "La réduction des coûts de prévention", "Les tests uniquement par le client"], answer: 0, explain: "Il coûte moins cher de prévenir que de corriger." },
    { q: "Estimation à trois points : O = 4 j, M = 6 j, P = 14 j. Quelle est l'estimation bêta (PERT) ?", options: ["7 jours", "8 jours", "6 jours", "24 jours"], answer: 0, explain: "(4 + 4×6 + 14) / 6 = 42 / 6 = 7 jours." }
  ],
  flashcards: [
    ["Projet", "Effort temporaire entrepris pour créer un produit, service ou résultat unique"],
    ["Répartition des domaines PMP (ECO 2026 annoncé)", "Personnes 33 %, Processus 41 %, Environnement métier 26 %"],
    ["Éligibilité PMP", "35 h de formation + 36 mois d'expérience (bac+4) ou 60 mois (sans)"],
    ["Tuckman", "Forming, storming, norming, performing, adjourning"],
    ["Meilleure technique de résolution de conflit", "Collaborer / résoudre le problème (gagnant-gagnant)"],
    ["Référence de base du périmètre", "Énoncé du périmètre + WBS + dictionnaire du WBS"],
    ["Chemin critique", "Plus long chemin du réseau ; marge totale nulle ; détermine la durée du projet"],
    ["PERT (bêta)", "(O + 4M + P) / 6"],
    ["Crashing vs fast tracking", "Crashing : + ressources, + coût · Fast tracking : en parallèle, + risque"],
    ["SV, CV", "SV = EV − PV · CV = EV − AC (négatif = mauvais)"],
    ["SPI, CPI", "SPI = EV / PV · CPI = EV / AC (< 1 = mauvais)"],
    ["EAC (tendance), ETC, VAC", "EAC = BAC / CPI · ETC = EAC − AC · VAC = BAC − EAC"],
    ["TCPI", "(BAC − EV) / (BAC − AC)"],
    ["Réserve pour aléas vs réserve de management", "Aléas : risques identifiés, dans la référence de base · Management : inconnus, hors référence de base"],
    ["Réponses aux menaces", "Escalader, éviter, transférer, atténuer, accepter"],
    ["Réponses aux opportunités", "Escalader, exploiter, partager, améliorer, accepter"],
    ["Valeur monétaire attendue (EMV)", "Probabilité × impact"],
    ["Coût de la qualité", "Conformité (prévention + évaluation) + non-conformité (défaillances internes + externes)"],
    ["Contrat forfaitaire vs cost-plus", "Forfait : risque au vendeur · Cost-plus : risque à l'acheteur"],
    ["Rôles Scrum", "Product Owner, Scrum Master, Developers"],
    ["Événements Scrum", "Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective"],
    ["Kanban : principe clé", "Visualiser le flux et limiter le travail en cours (WIP)"],
    ["ADKAR", "Awareness, Desire, Knowledge, Ability, Reinforcement"],
    ["Leadership serviteur", "Faciliter, supprimer les obstacles, développer et protéger l'équipe"]
  ]
});
