ACADEMY.courses.push({
  id: 'react', phase: 4, kind: 'tech', order: 2,
  title: 'React — Frontend', icon: '⚛️', category: 'Frontend',
  hours: '~50h', priority: 3,
  subtitle: "Comprendre et construire des interfaces modernes : composants, hooks, état, appels d'API, routage, tests et déploiement.",
  description: "Comprendre le front-end complète votre vision full-stack d'architecte. Vous construirez une application React avec Vite et TypeScript : composants et props, hooks, gestion d'état et de données serveur, routage, formulaires, tests avec Vitest et Testing Library, puis build et déploiement sur S3/CloudFront ou Azure Static Web Apps.",
  searchTerm: 'React cours complet', searchTermEn: 'React tutorial hooks TypeScript',
  outcomes: [
    "Comprendre JSX, composants, props et rendu déclaratif",
    "Gérer l'état local avec useState, useReducer et les effets avec useEffect",
    "Appeler des API proprement (TanStack Query) : cache, chargement, erreurs",
    "Structurer une application : routage, contexte, composition",
    "Construire des formulaires validés et accessibles",
    "Tester avec Vitest et React Testing Library",
    "Optimiser et déployer (Vite, S3 + CloudFront, Azure Static Web Apps)"
  ],
  prerequisites: ["JavaScript moderne (ES2020+)", "HTML/CSS de base", "Node.js LTS"],
  resources: [
    { label: 'Documentation officielle React (react.dev)', url: 'https://react.dev/learn' },
    { label: 'Vite', url: 'https://vitejs.dev/' },
    { label: 'TanStack Query', url: 'https://tanstack.com/query/latest' },
    { label: 'Testing Library', url: 'https://testing-library.com/docs/react-testing-library/intro/' }
  ],
  modules: [
    {
      title: 'Les fondamentaux',
      lessons: [
        {
          title: 'Composants, JSX et props',
          sections: [
            { h: 'Le modèle de React', p: "L'interface est une **fonction de l'état** : `UI = f(état)`. Vous décrivez ce qui doit être affiché ; React calcule les différences et met à jour le DOM efficacement. Une application est un **arbre de composants** réutilisables." },
            { h: 'Démarrer un projet', code: { lang: 'bash', src: 'npm create vite@latest front-commandes -- --template react-ts\ncd front-commandes && npm install\nnpm run dev      # http://localhost:5173' } },
            { h: 'Un composant typé', code: { lang: 'tsx', src: 'type Commande = { id: string; client: string; montant: number; statut: "CREEE" | "PAYEE" };\n\ntype Props = { commande: Commande; onSelect?: (id: string) => void };\n\nexport function CarteCommande({ commande, onSelect }: Props) {\n  const payee = commande.statut === "PAYEE";\n  return (\n    <article className={payee ? "carte payee" : "carte"} onClick={() => onSelect?.(commande.id)}>\n      <h3>{commande.client}</h3>\n      <p>{commande.montant.toFixed(2)} €</p>\n      {payee && <span className="badge">Payée</span>}\n    </article>\n  );\n}\n\nexport function ListeCommandes({ commandes }: { commandes: Commande[] }) {\n  if (commandes.length === 0) return <p>Aucune commande.</p>;\n  return (\n    <ul>\n      {commandes.map(c => <li key={c.id}><CarteCommande commande={c} /></li>)}\n    </ul>\n  );\n}' } },
            { h: 'Règles essentielles', bullets: ["Un composant = une fonction qui renvoie du JSX ; nom en **PascalCase**", "Les **props** sont en lecture seule", "Listes : une **`key` stable et unique** (pas l'index si l'ordre change)", "Rendu conditionnel : `&&`, opérateur ternaire, retour anticipé", "`className` au lieu de `class`, événements en camelCase (`onClick`)"] }
          ],
          keypoints: ["UI = f(état)", "Props en lecture seule", "key stable dans les listes", "Vite + TypeScript pour démarrer"]
        },
        {
          title: 'État et hooks',
          sections: [
            { h: 'useState', p: "`useState` conserve une valeur entre deux rendus ; la modifier via le setter déclenche un nouveau rendu. L'état est **immuable** : créez un nouvel objet/tableau plutôt que de muter l'existant.", code: { lang: 'tsx', src: 'function Panier() {\n  const [lignes, setLignes] = useState<Ligne[]>([]);\n  const total = lignes.reduce((s, l) => s + l.prix * l.qte, 0);   // valeur dérivée : pas d\'état\n\n  const ajouter = (p: Produit) =>\n    setLignes(prev => {\n      const existe = prev.find(l => l.id === p.id);\n      return existe\n        ? prev.map(l => (l.id === p.id ? { ...l, qte: l.qte + 1 } : l))\n        : [...prev, { ...p, qte: 1 }];\n    });\n\n  return <Resume lignes={lignes} total={total} onAjouter={ajouter} />;\n}' } },
            { h: 'useEffect', bullets: ["Synchroniser avec un système **extérieur** (abonnement, minuterie, API du navigateur)", "Tableau de **dépendances** : l'effet se relance quand elles changent", "Renvoyer une fonction de **nettoyage**", "Ne PAS utiliser un effet pour calculer une valeur dérivée ou réagir à un clic", "En développement, StrictMode exécute les effets deux fois pour détecter les oublis de nettoyage"] },
            { h: 'Autres hooks', bullets: ["`useReducer` : logique d'état complexe (actions)", "`useContext` : partager une valeur (thème, utilisateur) sans passer les props à chaque niveau", "`useRef` : valeur mutable sans rendu / référence DOM", "`useMemo` / `useCallback` : mémoïsation — seulement quand un profil montre un problème", "**Hooks personnalisés** (`useCommandes`) pour réutiliser une logique", "Règles des hooks : au premier niveau, jamais dans une condition ou une boucle"] }
          ],
          keypoints: ["État immuable : nouveaux objets", "Valeur dérivée ≠ état", "useEffect pour l'extérieur, avec nettoyage", "Hooks au premier niveau uniquement"]
        }
      ]
    },
    {
      title: 'Application complète',
      lessons: [
        {
          title: 'Données serveur, routage et formulaires',
          sections: [
            { h: 'Appeler une API avec TanStack Query', p: "Les données serveur ont des besoins spécifiques (cache, rafraîchissement, états de chargement et d'erreur, invalidation). Une bibliothèque dédiée évite d'écrire des `useEffect` fragiles.", code: { lang: 'tsx', src: 'const api = (url: string, init?: RequestInit) =>\n  fetch(import.meta.env.VITE_API_URL + url, init).then(r => {\n    if (!r.ok) throw new Error(`HTTP ${r.status}`);\n    return r.json();\n  });\n\nexport function PageCommandes() {\n  const qc = useQueryClient();\n  const { data, isPending, error } = useQuery({ queryKey: ["commandes"], queryFn: () => api("/api/commandes") });\n  const creer = useMutation({\n    mutationFn: (c: NouvelleCommande) => api("/api/commandes", { method: "POST",\n      headers: { "Content-Type": "application/json" }, body: JSON.stringify(c) }),\n    onSuccess: () => qc.invalidateQueries({ queryKey: ["commandes"] }),\n  });\n  if (isPending) return <p>Chargement…</p>;\n  if (error) return <p role="alert">Erreur : {error.message}</p>;\n  return <ListeCommandes commandes={data.content} />;\n}' } },
            { h: 'Routage', bullets: ["**React Router** : `createBrowserRouter`, routes imbriquées, paramètres (`/commandes/:id`), `loader`", "Routes protégées selon l'authentification", "Hébergement statique : rediriger les 404 vers `index.html` (SPA)", "Frameworks : **Next.js** (rendu serveur, SSR/SSG) quand le SEO ou le temps d'affichage initial comptent"] },
            { h: 'Formulaires et accessibilité', bullets: ["Composants contrôlés ou **React Hook Form** + validation **Zod**", "`<label htmlFor>`, messages d'erreur liés (`aria-describedby`), focus visible", "Boutons désactivés pendant l'envoi, retour visuel", "Ne jamais faire confiance au client : la validation serveur reste obligatoire"] }
          ],
          keypoints: ["TanStack Query : cache + invalidation", "import.meta.env pour la config Vite", "React Router : routes imbriquées", "Validation client ET serveur"]
        },
        {
          title: 'Tests, performance, sécurité et déploiement',
          sections: [
            { h: 'Tester comme un utilisateur', code: { lang: 'tsx', src: 'import { render, screen } from "@testing-library/react";\nimport userEvent from "@testing-library/user-event";\n\ntest("sélectionner une commande appelle onSelect", async () => {\n  const onSelect = vi.fn();\n  render(<CarteCommande commande={{ id: "c1", client: "Ada", montant: 42, statut: "PAYEE" }} onSelect={onSelect} />);\n\n  expect(screen.getByText("Payée")).toBeInTheDocument();\n  await userEvent.click(screen.getByRole("heading", { name: "Ada" }));\n  expect(onSelect).toHaveBeenCalledWith("c1");\n});' }, bullets: ["**Vitest** + **React Testing Library** : requêtes par rôle et libellé (comme un utilisateur)", "**MSW** (Mock Service Worker) pour simuler l'API", "**Playwright** pour quelques parcours end-to-end"] },
            { h: 'Performance', bullets: ["Découpage du code : `React.lazy` + `Suspense` par route", "Éviter les rendus inutiles : état au bon niveau, mémoïsation ciblée", "Images optimisées, polices, Core Web Vitals (LCP, INP, CLS)", "Analyse du bundle (`vite-bundle-visualizer`)"] },
            { h: 'Sécurité', bullets: ["React échappe le texte par défaut ; éviter `dangerouslySetInnerHTML` (XSS)", "Aucun secret dans le bundle : tout ce qui est dans `VITE_*` est public", "Jetons : cookies `HttpOnly`/`Secure`/`SameSite` ou flux OIDC avec PKCE (MSAL, Cognito)", "En-têtes : Content-Security-Policy, HSTS (via CloudFront / Front Door)"] },
            { h: 'Déployer', code: { lang: 'bash', src: 'npm run build                          # génère dist/\naws s3 sync dist/ s3://front-commandes --delete\naws cloudfront create-invalidation --distribution-id E123 --paths "/index.html"\n# fichiers JS/CSS hachés : cache long ; index.html : cache court\n\n# Azure : Static Web Apps (CI GitHub intégrée) ou Storage static website + Front Door' } }
          ],
          keypoints: ["Testing Library : requêtes par rôle", "MSW pour l'API", "Pas de secret dans VITE_*", "S3 + CloudFront : assets hachés en cache long"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Front des commandes branché sur votre API',
      goal: "Construire une SPA React + TypeScript qui liste, crée et affiche des commandes depuis l'API Spring Boot, avec tests et build de production.",
      minutes: 120, env: 'Node.js LTS + API Spring Boot (ou json-server)',
      steps: [
        { t: "Créez le projet Vite React TS et installez les dépendances.", cmd: "npm create vite@latest front-commandes -- --template react-ts\ncd front-commandes\nnpm i @tanstack/react-query react-router-dom\nnpm i -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom" },
        { t: "Configurez `VITE_API_URL` dans `.env.development` et activez CORS sur l'API (origine http://localhost:5173).", hint: "Sans backend : `npx json-server db.json --port 8080`." },
        { t: "Créez les routes `/commandes` (liste) et `/commandes/:id` (détail) avec React Router." },
        { t: "Implémentez la liste avec `useQuery` (états chargement/erreur) et un formulaire de création avec `useMutation` + invalidation." },
        { t: "Ajoutez la validation (client non vide, montant > 0) avec des messages accessibles." },
        { t: "Écrivez 3 tests Testing Library (affichage, validation, clic).", cmd: "npx vitest run" },
        { t: "Construisez et prévisualisez la version de production.", cmd: "npm run build && npm run preview", check: "L'application fonctionne sur le port de prévisualisation." },
        { t: "Bonus : déployez `dist/` sur un bucket S3 derrière CloudFront (OAC) ou sur Azure Static Web Apps." }
      ]
    }
  ],
  quiz: [
    { q: "Que se passe-t-il quand on appelle le setter d'un useState ?", options: ["React planifie un nouveau rendu du composant avec la nouvelle valeur", "Le DOM est modifié immédiatement sans rendu", "La page se recharge", "Rien, il faut appeler render()"], answer: 0, explain: "Les mises à jour sont regroupées (batching) puis le composant est rendu à nouveau." },
    { q: "Pourquoi utiliser une key stable dans une liste ?", options: ["Pour que React associe correctement chaque élément entre deux rendus", "Pour le SEO", "Pour la sécurité", "C'est facultatif et sans effet"], answer: 0, explain: "Avec l'index comme key, réordonner la liste peut mélanger l'état des éléments." },
    { q: "Comment ajouter un élément à un tableau d'état ?", options: ["setListe(prev => [...prev, nouvel])", "liste.push(nouvel)", "liste[liste.length] = nouvel", "setListe(liste.push(nouvel))"], answer: 0, explain: "L'état doit être remplacé par une nouvelle référence." },
    { q: "Quel est le bon usage de useEffect ?", options: ["Synchroniser le composant avec un système extérieur (abonnement, minuterie, API)", "Calculer une valeur dérivée de l'état", "Gérer un clic sur un bouton", "Remplacer useState"], answer: 0, explain: "Les valeurs dérivées se calculent pendant le rendu ; les clics dans les gestionnaires d'événements." },
    { q: "Pourquoi utiliser TanStack Query pour les données serveur ?", options: ["Il gère cache, états de chargement/erreur, rafraîchissement et invalidation", "Il remplace le backend", "Il est obligatoire avec React", "Il chiffre les requêtes"], answer: 0, explain: "L'état serveur est différent de l'état d'interface." },
    { q: "Une variable VITE_API_KEY est-elle secrète ?", options: ["Non : elle est incluse dans le bundle JavaScript public", "Oui, Vite la chiffre", "Oui, si le dépôt est privé", "Seulement en production"], answer: 0, explain: "Tout ce qui arrive dans le navigateur est lisible par l'utilisateur." },
    { q: "Quelle règle des hooks est correcte ?", options: ["Les appeler au premier niveau du composant, jamais dans une condition", "Les appeler dans des boucles pour chaque élément", "Les appeler dans des fonctions utilitaires classiques", "Les appeler uniquement dans des classes"], answer: 0, explain: "React s'appuie sur l'ordre des appels de hooks à chaque rendu." },
    { q: "Comment Testing Library recommande-t-elle de trouver un élément ?", options: ["Par son rôle et son libellé accessibles (getByRole)", "Par sa classe CSS", "Par son ID interne", "Par XPath"], answer: 0, explain: "Cela teste l'application comme un utilisateur (et améliore l'accessibilité)." },
    { q: "Quelle API React présente un risque XSS si elle reçoit du contenu non fiable ?", options: ["dangerouslySetInnerHTML", "useState", "className", "key"], answer: 0, explain: "Le texte interpolé dans le JSX est échappé automatiquement." },
    { q: "Pour une SPA sur CloudFront, quelle stratégie de cache est adaptée ?", options: ["Cache long pour les fichiers hachés (JS/CSS), cache court pour index.html", "Aucun cache", "Cache long pour index.html", "Invalider tout le cache à chaque requête"], answer: 0, explain: "Le nom haché change à chaque build, index.html référence les nouveaux fichiers." }
  ],
  flashcards: [
    ["Principe de React", "UI = f(état) : rendu déclaratif, React calcule les différences"],
    ["Props", "Entrées d'un composant, en lecture seule"],
    ["key dans une liste", "Identifiant stable et unique (pas l'index si l'ordre change)"],
    ["Mettre à jour un objet d'état", "setX(prev => ({ ...prev, champ: valeur }))"],
    ["Valeur dérivée", "Calculée pendant le rendu, pas stockée dans l'état"],
    ["useEffect", "Synchronisation avec l'extérieur ; dépendances ; fonction de nettoyage"],
    ["useRef", "Valeur mutable persistante sans rendu, ou référence DOM"],
    ["useContext", "Partager une valeur dans l'arbre sans « prop drilling »"],
    ["Règles des hooks", "Premier niveau uniquement, dans des composants ou hooks personnalisés"],
    ["TanStack Query", "useQuery (lecture + cache) / useMutation + invalidateQueries"],
    ["Variables d'environnement Vite", "import.meta.env.VITE_* — publiques dans le bundle"],
    ["Découpage du code", "React.lazy + Suspense"],
    ["Testing Library : requête préférée", "getByRole(…, { name })"],
    ["Simuler l'API en test", "MSW (Mock Service Worker)"],
    ["Quand choisir Next.js", "SEO, rendu serveur (SSR/SSG), temps d'affichage initial"]
  ]
});
