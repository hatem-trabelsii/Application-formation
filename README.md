# 🎓 ArchiPath Academy

Plateforme de formation **100 % locale, sans compte**, inspirée d'Udemy, pour le parcours **Architecte Cloud & DevOps** en 5 phases (avril 2026 → février 2028) : 12 certifications et 18 technologies.

## Lancer

1. **Récupérez les fichiers sur votre ordinateur.** Sur GitHub : bouton **Code › Download ZIP** sur la branche `claude/local-cloud-training-platform-e7bo51`, puis décompressez l'archive. Ou bien : `git clone` du dépôt.
2. **Double-cliquez sur `index.html`.** C'est tout : ça fonctionne dans Chrome, Edge ou Firefox, même hors ligne, sans serveur.

Facultatif : `start.bat` (Windows) ou `./start.sh` (macOS/Linux) démarre un petit serveur sur http://localhost:8000. Laissez sa fenêtre ouverte tant que vous utilisez le site. Sans Python, le script ouvre directement `index.html`.

> « localhost n'autorise pas la connexion » (ERR_CONNECTION_REFUSED) veut dire qu'aucun serveur ne tourne sur votre machine : lancez `start.bat` / `start.sh` depuis le dossier décompressé et gardez la fenêtre ouverte, ou ouvrez simplement `index.html`.

## Ce que contient le site

- 🎬 **Leçons vidéo narrées** : diapositives animées, voix française, sous-titres, vitesse réglable, plein écran.
- 📖 **Théorie** et exemples de code à copier, 💡 points clés, 📝 notes par leçon.
- 🧪 **Labs pratiques guidés**, ❓ **quiz** en mode entraînement ou examen, 🧠 **flashcards à répétition espacée**.
- 🎞️ **Animations « Comprendre en 1 minute »** : schémas animés et narrés (DNS, paiement par carte, TLS, OAuth, Kafka, RAG…), en format vertical sur téléphone.
- 🗺️ **Roadmap** des 5 phases, avec suivi des certifications obtenues.
- 🎥 Possibilité de rattacher vos propres vidéos (lien YouTube ou fichier local) à chaque leçon.

La progression est enregistrée dans le navigateur. Exportez-la depuis ⚙️ Paramètres pour la sauvegarder ou changer de machine.

## Mettre le site en ligne sur AWS

Architecture, schéma, coûts vérifiés, étapes et infrastructure en code (CloudFormation + GitHub Actions) : voir [`docs/aws/README.md`](docs/aws/README.md).

## Structure

```
index.html            point d'entrée
css/style.css         styles (clair / sombre, responsive)
js/utils.js           utilitaires, coloration syntaxique
js/store.js           persistance (localStorage + IndexedDB)
js/player.js          lecteur vidéo narré
js/explainer.js       moteur des animations explicatives
js/app.js             pages et routeur
data/phases.js        les 5 phases
data/courses/*.js     une formation par fichier
data/explainers.js    les animations (nœuds, liens, étapes)
Decisions.md          choix faits pendant la construction
docs/aws/             mise en ligne sur AWS (schéma, coûts, CloudFormation)
.github/workflows/    déploiement manuel vers AWS
```

Pour ajouter une formation, copiez un fichier de `data/courses/`, modifiez-le, puis ajoutez sa balise `<script>` dans `index.html`.
