# Reproduire le Portefeuille Applicatif dans Notion

Le dashboard se reconstruit dans Notion avec **deux bases de données reliées** : `Applications` et `Tickets`.
Les données, les champs, les vues (table, Kanban, chronologie, galerie) et les indicateurs sont les mêmes.
Ce qui change : le rendu visuel est celui de Notion (pas de couleurs ni de polices sur mesure, pas de lampes animées).

| Dans le dashboard | Dans Notion | Résultat |
|---|---|---|
| Fiches des 20 applications | Base `Applications` (une page par appli) | Identique |
| Tickets reliés à une application | Base `Tickets` + propriété Relation | Identique |
| Tableau Kanban glisser-déposer | Vue Tableau groupée par Statut | Identique |
| Tableau filtrable et triable | Vue Table avec filtres enregistrés | Identique |
| Feuille de route | Vue Chronologie | Identique |
| Tickets ouverts / bloqués par appli | Rollups filtrés | Identique |
| Indicateurs (KPI, barres) | Vues Graphique | Proche |
| Tableau de signalisation | Vue Galerie + formule 🟢🟠🔴 | Proche |
| Thème, couleurs, animations | Thème Notion | Non reproductible |

## 1. Importer les données

1. Créez une page `Portefeuille Applicatif`.
2. Tapez `/import`, choisissez **CSV**, importez `Applications.csv` (dans ce dossier).
3. Recommencez avec `Tickets.csv`.

Les deux CSV contiennent les 20 applications et 30 tickets d'exemple. Remplacez-les par vos applications
(ou exportez vos propres données depuis l'onglet **Export Notion** du dashboard, qui génère les mêmes fichiers).

## 2. Typer les propriétés de `Applications`

| Propriété | Type Notion | Options et couleurs |
|---|---|---|
| Nom | Titre | |
| Code | Texte | |
| Domaine | Sélection | Voyageurs, Gares & Réseau, Production, Circulation, Maintenance, Distribution, Fret, RH, Finance, Achats, Data, Pilotage, Transverse |
| Cycle de vie | Sélection | Projet (bleu), Build (violet), Run (gris), Décommissionnement (orange) |
| Santé | Sélection | OK (vert), Vigilance (orange), Incident (rouge) |
| Criticité | Sélection | Critique (rouge), Élevée (orange), Moyenne (jaune), Faible (gris) |
| DICP | Texte | format `D-I-C-P`, ex. `3-3-2-2` |
| Hébergement | Sélection | Cloud AWS, Cloud Azure, On-premise, Hybride, SaaS |
| Statut CAO | Sélection | À passer (orange), En cours (bleu), Validé (vert), Non requis (gris) |
| Date CAO | Date | |
| Conformité SSI | Sélection | Conforme (vert), Écarts (rouge), À évaluer (orange) |
| Dette technique (1-5) | Nombre | |
| Prochain jalon | Texte | |
| Date jalon | Date | |
| Fin de support | Date | |
| Technologies, Équipe, Version, Description, Notes | Texte | |

## 3. Typer les propriétés de `Tickets`

| Propriété | Type Notion | Options |
|---|---|---|
| Titre | Titre | |
| Clé | Texte | ex. `VIG-1` |
| Application | **Relation** → `Applications` (cochez « Afficher sur Applications ») | Notion relie chaque ticket par le nom |
| Statut | **Statut** | À faire : À faire · En cours : En cours, En revue, Bloqué · Terminé : Terminé |
| Type | Sélection | Évolution, Incident, Dette technique, Sécurité, Gouvernance / CAO, Décision d'architecture |
| Priorité | Sélection | Critique (rouge), Haute (orange), Moyenne (bleu), Basse (gris) |
| Échéance | Date | |
| Porteur | Texte (ou Personne si vos collègues sont dans Notion) | |

## 4. Formules et rollups dans `Applications`

**Tickets ouverts** : Rollup → relation `Tickets` → propriété `Statut` → *Compter* → filtre `Statut` n'est pas `Terminé`.

**Tickets bloqués** : Rollup → relation `Tickets` → propriété `Statut` → *Compter* → filtre `Statut` est `Bloqué`.

**Signal** (la lampe du tableau de signalisation) :

```
if(prop("Santé") == "Incident", "🔴", if(prop("Santé") == "Vigilance", "🟠", "🟢")) + " " + prop("Code")
```

**Fin de support < 12 mois** :

```
not empty(prop("Fin de support")) and dateBetween(prop("Fin de support"), now(), "days") <= 365
```

**Jours avant le jalon** :

```
if(empty(prop("Date jalon")), "", format(dateBetween(prop("Date jalon"), now(), "days")) + " j")
```

Dans `Tickets`, ajoutez **En retard** :

```
not empty(prop("Échéance")) and prop("Échéance") < today() and prop("Statut") != "Terminé"
```

## 5. Créer les vues

| Vue | Base | Type | Réglages |
|---|---|---|---|
| Applications | Applications | Table | Tri : Santé (Incident en premier), puis Nom |
| Signalisation | Applications | Galerie | Aperçu : aucun · Propriétés : Signal, Nom, Santé · Groupé par Santé |
| Kanban | Tickets | Tableau | Groupé par Statut · Propriétés visibles : Clé, Application, Type, Priorité, Échéance |
| Feuille de route | Applications | Chronologie | Date : Date jalon · Groupé par Domaine |
| Échéances | Tickets | Chronologie | Date : Échéance · Filtre : Statut ≠ Terminé |
| À traiter sous 14 jours | Tickets | Liste | Filtre : Échéance dans les 2 prochaines semaines ET Statut ≠ Terminé · Tri : Échéance |
| CAO à venir | Applications | Liste | Filtre : Statut CAO est À passer ou En cours · Tri : Date CAO |

## 6. Page d'accueil « Synthèse »

En haut de la page `Portefeuille Applicatif`, ajoutez des **vues liées** de type **Graphique** (`/graphique`) :

1. **Chiffre** « Applications en incident » : base Applications, filtre Santé = Incident.
2. **Chiffre** « Tickets bloqués » : base Tickets, filtre Statut = Bloqué.
3. **Chiffre** « Échéances dépassées » : base Tickets, filtre En retard = coché.
4. **Barres empilées** « Santé par domaine » : base Applications, axe X Domaine, empilé par Santé.
5. **Anneau** « Tickets ouverts par type » : base Tickets, filtre Statut ≠ Terminé, groupé par Type.

Placez-les sur 2 ou 3 colonnes (glisser un bloc à côté d'un autre), puis en dessous les vues
`Signalisation`, `À traiter sous 14 jours` et `CAO à venir`.

## 7. Bonnes pratiques

- Un **modèle de page** dans `Applications` (Nouveau ▾ → Nouveau modèle) avec les sections : Contexte, Architecture (schéma), DAT / DAL, Risques SSI, Décisions, Contacts.
- Un modèle dans `Tickets` de type « Décision d'architecture » avec : Contexte, Options, Décision, Conséquences (format ADR).
- Une **automatisation** Notion : quand Statut passe à `Bloqué`, notifier l'architecte.
- Si vous utilisez déjà JIRA, l'intégration **Jira Sync** de Notion peut alimenter la base `Tickets` directement depuis vos projets JIRA.
