#!/usr/bin/env node
// Génère docs/animations/STORYBOARD.md à partir de data/explainers.js (source unique de vérité).
// Usage : node docs/animations/generer_storyboard.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..', '..');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'data/explainers.js'), 'utf8'), ctx);
const X = ctx.window.EXPLAINERS;

const courses = {};
fs.readdirSync(path.join(root, 'data/courses')).forEach(f => {
  const m = fs.readFileSync(path.join(root, 'data/courses', f), 'utf8').match(/title: '([^']+)'/);
  courses[f.replace('.js', '')] = m ? m[1] : f;
});

const lbl = (x, id) => (x.nodes[id] ? x.nodes[id].label : id);
function action(x, a) {
  if (a.move) {
    const [f, t] = a.move.split('>');
    const extra = [a.delay ? `après ${a.delay / 1000} s` : '', a.dur ? `durée ${a.dur / 1000} s` : ''].filter(Boolean).join(', ');
    return `jeton « ${a.token || '●'} » : ${lbl(x, f)} → ${lbl(x, t)}${extra ? ` (${extra})` : ''}`;
  }
  if (a.value) return `compteur « ${lbl(x, a.value[0])} » = **${a.value[1]}**`;
  if (a.badge) return a.badge[1] ? `étiquette sur ${lbl(x, a.badge[0])} : « ${a.badge[1]} »${a.badge[2] ? ` (${a.badge[2]})` : ''}` : `étiquette de ${lbl(x, a.badge[0])} retirée`;
  if (a.show) return `apparition : ${[].concat(a.show).map(id => lbl(x, id)).join(', ')}`;
  if (a.hide) return `disparition : ${[].concat(a.hide).map(id => lbl(x, id)).join(', ')}`;
  if (a.glow) return `${[].concat(a.glow).map(id => lbl(x, id)).join(', ')} pulse (focus)`;
  return JSON.stringify(a);
}
const words = s => s.split(/\s+/).filter(Boolean).length;
const md = s => s.replace(/\|/g, '\\|');

let out = `# Storyboard des animations « Comprendre en 1 minute »

> Fichier **généré** depuis \`data/explainers.js\` par \`node docs/animations/generer_storyboard.js\` : ne pas le modifier à la main.
> ${X.length} animations · ${X.reduce((s, x) => s + x.steps.length, 0)} étapes · ${X.reduce((s, x) => s + x.steps.reduce((a, st) => a + st.beats.length, 0), 0)} temps forts.

## Comment c'est construit

- **Une animation = une scène** (des composants reliés), puis des **étapes**. Chaque étape est découpée en **temps forts** : une phrase courte de voix off, et les actions visuelles qui démarrent **au moment où cette phrase commence**.
- **Focus** : pendant une phrase, tout ce qui n'y participe pas est assombri ; l'élément concerné pulse.
- **Pauses** : un silence de 0,32 s sépare les phrases par défaut. Les pauses plus longues sont indiquées \`[pause x s]\` (effet de suspense, temps pour lire un chiffre).
- **Sous-titres karaoké** : la phrase prononcée est en blanc, les autres atténuées.
- **Mobile** : la scène est transposée en format vertical (façon reel).

## Rendre la voix plus naturelle

1. **Sans rien installer** : ouvre l'application dans **Microsoft Edge**, puis ⚙️ Paramètres › Voix de narration : choisis une voix **« … Online (Natural) »** (par exemple Denise ou Henri). Le lecteur les sélectionne d'ailleurs automatiquement quand elles existent. Ce sont des voix neuronales Microsoft, gratuites dans Edge, nettement moins robotiques ; comme les voix « Google » de Chrome, elles fonctionnent en ligne (le texte lu est envoyé au service de Microsoft).
2. **Voix professionnelle enregistrée** (ElevenLabs, Azure AI Speech, OpenAI TTS…) :
   - génère **un fichier MP3 par étape** avec le texte de la colonne « Voix off » ci-dessous ; les \`[pause x s]\` se traduisent en \`<break time="x s"/>\` pour Azure (SSML) et ElevenLabs (selon le modèle utilisé), ou en points de suspension pour les outils sans balises ;
   - nomme-les \`audio/<id>/<n° d'étape>.mp3\` (ex. \`audio/eventloop/1.mp3\`) à la racine du projet ;
   - ajoute \`audio: true\` à l'animation dans \`data/explainers.js\`.
   Le lecteur joue alors l'enregistrement et déclenche les actions au prorata des mots de chaque phrase. Si un fichier manque, il revient automatiquement à la voix du navigateur.
3. **Conseils d'écriture déjà appliqués** : phrases de 21 mots maximum, une idée par phrase, mots-clés en fin de phrase, questions rhétoriques, chiffres concrets, prononciation forcée pour Node.js, libuv, kubectl, etcd, JSON, PKCE…

`;

X.forEach((x, n) => {
  const nbW = x.steps.reduce((s, st) => s + st.beats.reduce((a, b) => a + words(b.say), 0), 0);
  out += `---\n\n## ${n + 1}. ${x.icon} ${x.title}\n\n`;
  out += `- **Identifiant** : \`${x.id}\` · **Question d'accroche** : ${x.question}\n`;
  out += `- **Formations liées** : ${(x.courses || []).map(c => courses[c] || c).join(', ') || '—'}\n`;
  out += `- **Durée de voix** : ≈ ${Math.round(nbW / 2.4)} s (${nbW} mots à ~145 mots/min, hors animations)${x.audio ? ' · **voix enregistrée activée**' : ''}\n`;
  out += `- **Éléments à l'écran** : ${Object.values(x.nodes).map(o => `${o.icon || '▭'} ${o.label}${o.kind === 'panel' ? ` (compteur, départ « ${o.value} »)` : ''}${o.hidden ? ' *(apparaît plus tard)*' : ''}`).join(' · ')}\n\n`;
  x.steps.forEach((st, k) => {
    out += `### Étape ${k + 1}${st.t ? ` — ${st.t}` : ""}\n\n| Voix off (texte exact) | À l'écran, au même moment |\n|---|---|\n`;
    st.beats.forEach(b => {
      out += `| ${md(b.say)}${b.pause != null && b.pause !== 320 ? ` \`[pause ${b.pause / 1000} s]\`` : ''} | ${(b.do || []).map(a => md(action(x, a))).join('<br>') || '*(plan inchangé)*'} |\n`;
    });
    out += '\n';
  });
  out += `**Fiche mémo finale** :\n${(x.recap || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\n`;
});

fs.writeFileSync(path.join(__dirname, 'STORYBOARD.md'), out);
console.log(`STORYBOARD.md généré : ${X.length} animations, ${out.length} caractères.`);
