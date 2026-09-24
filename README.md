# 🎓 ArchiPath Academy

Plateforme de formation **100 % locale, sans compte**, inspirée d'Udemy, pour le parcours **Architecte Cloud & DevOps** en 5 phases (avril 2026 → février 2028) : 12 certifications et 18 technologies.

## Lancer

- **Le plus simple** : double-cliquez sur `index.html`. Il fonctionne dans Chrome, Edge ou Firefox, même hors ligne.
- **Avec un serveur local** (facultatif) : `./start.sh` (macOS/Linux) ou `start.bat` (Windows), puis ouvrez http://localhost:8000.

## Ce que contient le site

- 🎬 **Leçons vidéo narrées** : diapositives animées, voix française, sous-titres, vitesse réglable, plein écran.
- 📖 **Théorie** et exemples de code à copier, 💡 points clés, 📝 notes par leçon.
- 🧪 **Labs pratiques guidés**, ❓ **quiz** en mode entraînement ou examen, 🧠 **flashcards à répétition espacée**.
- 🗺️ **Roadmap** des 5 phases, avec suivi des certifications obtenues.
- 🎥 Possibilité de rattacher vos propres vidéos (lien YouTube ou fichier local) à chaque leçon.

La progression est enregistrée dans le navigateur. Exportez-la depuis ⚙️ Paramètres pour la sauvegarder ou changer de machine.

## Structure

```
index.html            point d'entrée
css/style.css         styles (clair / sombre, responsive)
js/utils.js           utilitaires, coloration syntaxique
js/store.js           persistance (localStorage + IndexedDB)
js/player.js          lecteur vidéo narré
js/app.js             pages et routeur
data/phases.js        les 5 phases
data/courses/*.js     une formation par fichier
Decisions.md          choix faits pendant la construction
```

Pour ajouter une formation, copiez un fichier de `data/courses/`, modifiez-le, puis ajoutez sa balise `<script>` dans `index.html`.
