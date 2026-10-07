# Portefeuille Applicatif

Tableau de bord de type JIRA pour piloter les 20 applications d'un périmètre d'architecte solution.

## Ouvrir

Double-cliquez sur `index.html` : il fonctionne hors ligne, sans serveur. Les modifications sont enregistrées dans le navigateur.

## Vues

- **Synthèse** : indicateurs (incidents, tickets bloqués, retards, CAO, fins de support), tableau de signalisation des 20 applis, échéances à 14 jours, jalons, santé par domaine, obsolescence.
- **Applications** : table filtrable et triable (domaine, cycle de vie, santé, criticité / DICP, hébergement, CAO, SSI, dette technique, fin de support). Un clic ouvre la fiche éditable et ses tickets.
- **Tableau** : Kanban glisser-déposer (À faire, En cours, En revue, Bloqué, Terminé), filtres par application, type et priorité.
- **Feuille de route** : 9 mois de jalons, passages CAO, fins de support et échéances de tickets.
- **Export Notion** : génère `Applications.csv` et `Tickets.csv` et explique la reconstruction dans Notion.

## Fichiers

```
index.html            dashboard autonome (généré)
template.html         source du dashboard
data-exemple.json     20 applications et 30 tickets fictifs
build.py              régénère index.html et notion/*.csv
notion/               CSV à importer dans Notion + GUIDE-NOTION.md
```

Les données fournies sont des exemples fictifs : remplacez-les par vos applications depuis les fiches, ou modifiez `data-exemple.json` puis lancez `python3 build.py`.
