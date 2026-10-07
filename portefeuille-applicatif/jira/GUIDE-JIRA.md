# Construire le Portefeuille Applicatif dans Jira Cloud

Objectif : retrouver dans Jira Cloud les 5 vues du dashboard (Synthèse, Applications, Tableau, Feuille de route, Export).

> Pré-requis : être **administrateur du projet** pour les tableaux et filtres, et **administrateur Jira** (ou passer
> par lui) pour les champs personnalisés, le type de projet et le workflow. Dans une grande organisation, ces deux
> étapes passent souvent par l'équipe outillage Jira.

## Ce qui se retrouve à l'identique

| Dashboard | Jira Cloud | Résultat |
|---|---|---|
| Fiche application (20 fiches) | 1 ticket **Epic** par application + champs personnalisés | Identique |
| Tickets reliés à une application | Tickets enfants de l'Epic (champ **Parent**) | Identique |
| Kanban glisser-déposer | **Tableau Kanban** avec workflow à 5 statuts, couloirs par application | Identique |
| Table filtrable et triable | **Filtre JQL** en vue liste | Identique |
| Feuille de route | **Chronologie** du projet (Standard) ou **Plans** (Premium) | Identique |
| Indicateurs de la Synthèse | **Tableau de bord** Jira avec gadgets | Proche |
| Tableau de signalisation 🟢🟠🔴 | Gadget *Statistiques de filtre à 2 dimensions* (Domaine × Santé) | Proche |
| Tickets ouverts par application | Barre de progression de l'Epic + automatisation | Proche |
| Couleurs, polices, pastilles animées | Thème Jira | Non reproductible sans application du Marketplace |

## Deux architectures possibles

**Option A (recommandée, fonctionne partout)** : un projet dédié `PAPP`, où chaque application est un **Epic**
et chaque ticket est un enfant de cet Epic. Simple, compatible avec tous les plans Jira.

**Option B (si votre site a Jira Service Management Premium / Assets)** : les 20 applications deviennent des
**objets Assets** (une vraie CMDB), et chaque ticket porte un champ *Application* de type Assets.
C'est plus propre pour un référentiel, mais nécessite une licence et des droits d'administration Assets.
Le reste du guide décrit l'option A ; les tableaux, filtres et tableaux de bord sont identiques en option B.

## Étape 1. Créer le projet

1. **Projets → Créer un projet → Kanban**, type **géré par l'entreprise** (company-managed).
2. Nom `Portefeuille Applicatif`, clé `PAPP`.

## Étape 2. Le workflow à 5 statuts

**Paramètres du projet → Workflows → Modifier** :

| Statut | Catégorie Jira |
|---|---|
| À faire | À faire |
| En cours | En cours |
| En revue | En cours |
| Bloqué | En cours |
| Terminé | Terminé |

Cochez « Autoriser toutes les transitions » pour permettre le glisser-déposer libre, comme dans le dashboard.

## Étape 3. Les types de ticket

| Type du dashboard | Type Jira |
|---|---|
| Application | **Epic** |
| Support / incident | Bug |
| Appel d'offres, DAL, DAT, Slides CAO, DICP / PréK-SSI, Revue d'architecture, Note de décision, Atelier / réunion, Étude / veille | Task + champ **Catégorie** (le type de livrable) |
| Étapes du livrable (ex. « Remplir la trame CAO ») | **Sous-tâches** du ticket |

Le CSV d'import crée déjà les sous-tâches types de chaque livrable. Pour les nouveaux tickets, une règle
d'automatisation peut les créer automatiquement (voir l'étape 10, règle n°6).

## Étape 4. Les champs personnalisés

**Paramètres → Tickets → Champs personnalisés → Créer**, puis associez-les à l'écran du projet `PAPP`.

| Champ | Type Jira | Valeurs | Sur |
|---|---|---|---|
| Code application | Texte court | ex. `VIG` | Epic |
| Domaine | Liste de sélection | Voyageurs, Gares & Réseau, Production, Circulation, Maintenance, Distribution, Fret, RH, Finance, Achats, Data, Pilotage, Transverse | Epic |
| Cycle de vie | Liste de sélection | Projet, Build, Run, Décommissionnement | Epic |
| Santé | Liste de sélection | OK, Vigilance, Incident | Epic |
| Criticité | Liste de sélection | Critique, Élevée, Moyenne, Faible | Epic |
| DICP | Texte court | `D-I-C-P`, ex. `3-3-2-2` | Epic |
| Hébergement | Liste de sélection | Cloud AWS, Cloud Azure, On-premise, Hybride, SaaS | Epic |
| Technologies | Texte court | | Epic |
| Équipe | Texte court (ou champ *Équipe* natif) | | Epic |
| Statut CAO | Liste de sélection | À passer, En cours, Validé, Non requis | Epic |
| Date CAO | Date | | Epic |
| Conformité SSI | Liste de sélection | Conforme, Écarts, À évaluer | Epic |
| Dette technique | Nombre | 1 à 5 | Epic |
| Version | Texte court | | Epic |
| Prochain jalon | Texte court | | Epic |
| Date jalon | Date | | Epic |
| Fin de support | Date | | Epic |
| Catégorie | Liste de sélection | Appel d'offres, DAL, DAT, Slides CAO, DICP / PréK-SSI, Revue d'architecture, Note de décision, Atelier / réunion, Support / incident, Étude / veille | Tickets |
| Porteur | Texte court (ou champ *Responsable* natif) | | Tickets |

Pour la **Feuille de route**, activez aussi les champs natifs **Date de début** et **Date d'échéance**.

## Étape 5. Importer les 20 applications et les tickets

Le fichier `import-jira.csv` (dans ce dossier) contient les 20 Epics et les 30 tickets, déjà reliés.

1. **Paramètres Jira → Système → Importation de systèmes externes → CSV**.
2. Choisissez `import-jira.csv`, encodage **UTF-8**, séparateur **virgule**, format de date **`yyyy-MM-dd`**.
3. Projet de destination : `PAPP`.
4. Associez les colonnes :
   - `Issue Id` → **Issue ID** ; `Parent` → **Parent** (c'est ce qui relie chaque ticket à son application) ;
   - `Issue Type`, `Summary`, `Description`, `Status`, `Priority`, `Due Date`, `Labels` → champs natifs du même nom ;
   - les autres colonnes → les champs personnalisés de l'étape 4.
5. Cochez « Associer les valeurs de champ » pour **Status** et **Priority** : vérifiez que *Highest / High / Medium / Low*
   correspondent bien aux priorités de votre site.
6. Lancez l'import, puis vérifiez qu'un Epic (ex. `VIG · Vigie`) affiche bien ses tickets enfants.

Les données du fichier sont des **exemples fictifs** : remplacez-les par vos 20 applications avant l'import, ou importez
puis modifiez les Epics dans Jira.

## Étape 5 bis. La vue « Mes tickets »

Filtre `PAPP · Mes tickets` : `project = PAPP AND issuetype not in (Epic, Sub-task) AND statusCategory != Done ORDER BY duedate ASC`.
Sur le tableau de bord, ajoutez 4 gadgets *Résultats de filtre* : En retard (`duedate < now()`), Cette semaine
(`duedate >= now() AND duedate <= 7d`), Semaine prochaine (`duedate > 7d AND duedate <= 14d`), Plus tard
(`duedate > 14d OR duedate is EMPTY`), plus un *Graphique circulaire* sur *Catégorie*. La colonne *Progression*
des sous-tâches s'affiche dans les résultats de filtre.

## Étape 6. Les filtres JQL

Créez ces filtres (**Filtres → Recherche avancée**), enregistrez-les et partagez-les avec le projet.

| Nom du filtre | JQL |
|---|---|
| PAPP · Applications | `project = PAPP AND issuetype = Epic ORDER BY "Santé" DESC, summary ASC` |
| PAPP · Applications en incident | `project = PAPP AND issuetype = Epic AND "Santé" = Incident` |
| PAPP · Applications en vigilance ou incident | `project = PAPP AND issuetype = Epic AND "Santé" in (Vigilance, Incident)` |
| PAPP · Tickets ouverts | `project = PAPP AND issuetype != Epic AND statusCategory != Done` |
| PAPP · Tickets bloqués | `project = PAPP AND status = "Bloqué"` |
| PAPP · Échéances dépassées | `project = PAPP AND issuetype != Epic AND duedate < now() AND statusCategory != Done` |
| PAPP · À traiter sous 14 jours | `project = PAPP AND issuetype != Epic AND duedate <= 14d AND statusCategory != Done ORDER BY duedate ASC` |
| PAPP · Passages CAO | `project = PAPP AND issuetype = Epic AND "Statut CAO" in ("À passer", "En cours") ORDER BY "Date CAO" ASC` |
| PAPP · Fins de support à 12 mois | `project = PAPP AND issuetype = Epic AND "Fin de support" <= 365d ORDER BY "Fin de support" ASC` |
| PAPP · Prochains jalons | `project = PAPP AND issuetype = Epic AND "Date jalon" >= -7d AND "Date jalon" <= 60d ORDER BY "Date jalon" ASC` |

Selon votre site, les champs personnalisés s'écrivent parfois `cf[10050]` au lieu de `"Santé"` : l'autocomplétion
JQL vous propose la bonne forme.

## Étape 7. Le tableau Kanban (vue « Tableau »)

**Tableau → Paramètres du tableau** :

- **Colonnes** : À faire · En cours · En revue · Bloqué · Terminé (une colonne par statut).
- **Filtre du tableau** : `project = PAPP AND issuetype != Epic ORDER BY Rank`.
- **Couloirs** : *Epics* → un couloir par application.
- **Filtres rapides** :
  - Incidents : `issuetype = Bug`
  - Slides CAO : `"Catégorie" = "Slides CAO"`
  - DAL / DAT : `"Catégorie" in (DAL, DAT)`
  - Appels d'offres : `"Catégorie" = "Appel d'offres"`
  - Critique et haute : `priority in (Highest, High)`
  - En retard : `duedate < now()`
- **Couleurs des cartes** : par *Priorité* (rappel du liseré coloré du dashboard).
- **Disposition des cartes** : ajoutez *Date d'échéance* et *Catégorie*.

## Étape 8. La feuille de route

- **Jira Standard** : vue **Chronologie** du projet. Renseignez *Date de début* / *Date d'échéance* sur chaque Epic
  (= le prochain jalon) et sur les tickets.
- **Jira Premium** : **Plans** (ex-Advanced Roadmaps), avec regroupement par *Domaine* et marqueurs pour les
  passages CAO et les fins de support.

## Étape 9. Le tableau de bord « Synthèse »

**Tableaux de bord → Créer un tableau de bord** → `Portefeuille Applicatif`, disposition **3 colonnes**, puis ajoutez :

| Bloc du dashboard | Gadget Jira | Réglages |
|---|---|---|
| Applications en incident | **Résultats de filtre** (ou *Compteur*) | Filtre `PAPP · Applications en incident` |
| Tickets bloqués | **Résultats de filtre** | `PAPP · Tickets bloqués` |
| Échéances dépassées | **Résultats de filtre** | `PAPP · Échéances dépassées` |
| Tableau de signalisation | **Statistiques de filtre à 2 dimensions** | Filtre `PAPP · Applications`, axe X *Santé*, axe Y *Domaine* |
| Santé du portefeuille | **Graphique circulaire** | Filtre `PAPP · Applications`, statistique *Santé* |
| Tickets ouverts par type | **Graphique circulaire** | Filtre `PAPP · Tickets ouverts`, statistique *Catégorie* |
| Tickets par application | **Statistiques de filtre** | Filtre `PAPP · Tickets ouverts`, statistique *Epic / Parent* |
| À traiter sous 14 jours | **Résultats de filtre** | `PAPP · À traiter sous 14 jours`, colonnes Clé, Résumé, Parent, Statut, Échéance |
| Prochains jalons | **Résultats de filtre** | `PAPP · Prochains jalons` |
| Passages CAO | **Résultats de filtre** | `PAPP · Passages CAO` |
| Obsolescence | **Résultats de filtre** | `PAPP · Fins de support à 12 mois` |
| Calendrier des échéances | **Calendrier Jira** (si disponible sur votre site) | `PAPP · Tickets ouverts` |

## Étape 10. Les automatisations

**Paramètres du projet → Automatisation → Créer une règle** :

1. **Incident sur une application**
   Déclencheur *Champ modifié : Santé* → Condition `Santé = Incident` → Action *Envoyer une notification*
   (e-mail ou Teams/Slack) à l'architecte, avec `{{issue.summary}} est passée en incident`.
2. **Ticket bloqué**
   Déclencheur *Ticket transitionné vers Bloqué* → Action *Ajouter un commentaire sur le parent* :
   `{{issue.key}} est bloqué : {{issue.summary}}`.
3. **Échéance dépassée** (planifiée chaque matin)
   Déclencheur *Planifié* avec le JQL `PAPP · Échéances dépassées` → Action *Ajouter l'étiquette* `en-retard`.
4. **Compteur de tickets ouverts sur l'Epic**
   Déclencheur *Ticket créé ou transitionné* → Branche *Parent* → Action *Modifier le champ* « Tickets ouverts » (champ
   Nombre) avec `{{lookupIssues.size}}` après une action *Rechercher des tickets* sur
   `parent = {{issue.key}} AND statusCategory != Done`.
5. **Rappel fin de support** (planifiée chaque lundi)
   JQL `"Fin de support" <= 180d` → notification à l'architecte.
6. **Étapes types d'un livrable**
   Déclencheur *Ticket créé* → Condition `Catégorie = Slides CAO` → Action *Créer des sous-tâches* :
   Remplir la trame CAO, Schémas d'architecture, Analyse DICP et risques SSI, Répétition avec le chef de projet,
   Envoi au secrétariat CAO. Dupliquez la règle pour DAL, DAT, Appel d'offres, etc. (listes dans le dashboard).

## Ce que Jira ne fait pas nativement, et comment s'en approcher

- **Pastilles colorées animées et thème sur mesure** : impossible en natif. Des applications du Marketplace
  (*Custom Charts for Jira*, *Dashboard Hub*, *Rich Filters*) donnent des tuiles colorées et des KPI plus visuels,
  sous réserve de validation par votre DSI.
- **Rollups natifs** (compter les enfants d'un Epic par statut) : remplacés par l'automatisation n°4 ou la barre de
  progression de l'Epic.
- **Graphique Santé par domaine empilé** : le gadget à 2 dimensions affiche un tableau de chiffres, pas des barres.
