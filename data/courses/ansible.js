ACADEMY.courses.push({
  id: 'ansible', phase: 3, kind: 'tech', order: 2,
  title: 'Ansible', icon: '🔧', category: 'Config Mgmt',
  hours: '~30h', priority: 4,
  subtitle: "Automatiser la configuration de serveurs et d'applications : inventaires, playbooks, rôles, Vault, idempotence et tests.",
  description: "Terraform crée l'infrastructure ; Ansible la configure. Sans agent, via SSH (ou WinRM), Ansible décrit l'état souhaité des machines en YAML. Vous écrirez des playbooks idempotents, structurerez des rôles réutilisables, protégerez les secrets avec Ansible Vault, piloterez des inventaires dynamiques cloud et testerez avec Molecule.",
  searchTerm: 'Ansible tutoriel playbook', searchTermEn: 'Ansible playbook roles',
  outcomes: [
    "Comprendre l'architecture sans agent : nœud de contrôle, inventaire, modules",
    "Écrire des inventaires statiques et dynamiques (AWS, Azure)",
    "Écrire des playbooks idempotents avec handlers, conditions et boucles",
    "Utiliser variables, facts, templates Jinja2 et précédence des variables",
    "Structurer en rôles et collections (Ansible Galaxy)",
    "Protéger les secrets avec Ansible Vault",
    "Tester (ansible-lint, --check, Molecule) et intégrer en CI"
  ],
  prerequisites: ["Linux et SSH", "YAML", "Python installé sur le poste de contrôle"],
  resources: [
    { label: 'Documentation Ansible', url: 'https://docs.ansible.com/' },
    { label: 'Ansible Galaxy', url: 'https://galaxy.ansible.com/' },
    { label: 'Molecule', url: 'https://ansible.readthedocs.io/projects/molecule/' }
  ],
  modules: [
    {
      title: 'Les bases',
      lessons: [
        {
          title: 'Architecture, inventaire et commandes ad hoc',
          sections: [
            { h: 'Sans agent', bullets: ["Un **nœud de contrôle** (Linux/macOS/WSL) exécute Ansible", "Les **nœuds gérés** n'ont besoin que de SSH et Python (WinRM/SSH pour Windows)", "Les **modules** sont copiés, exécutés puis supprimés", "Mode **push** : on lance l'exécution depuis le contrôleur (ou AWX / Automation Controller)"] },
            { h: "L'inventaire", code: { lang: 'yaml', src: '# inventaire/prod.yml\nall:\n  vars:\n    ansible_user: ec2-user\n  children:\n    web:\n      hosts:\n        web-1.exemple.fr:\n        web-2.exemple.fr:\n    db:\n      hosts:\n        db-1.exemple.fr:\n          postgres_version: 16\n\n# inventaire dynamique AWS : inventaire/aws_ec2.yml\n# plugin: amazon.aws.aws_ec2\n# regions: [eu-west-3]\n# keyed_groups:\n#   - key: tags.role\n#     prefix: role' } },
            { h: 'Commandes ad hoc', code: { lang: 'bash', src: 'ansible all -i inventaire/prod.yml -m ping\nansible web -i inventaire/prod.yml -m shell -a "uptime"\nansible web -i inventaire/prod.yml -b -m dnf -a "name=nginx state=latest"\nansible-inventory -i inventaire/aws_ec2.yml --graph' }, bullets: ["`-b` (become) : élévation de privilèges (sudo)", "`ansible.cfg` : inventaire par défaut, utilisateur, forks, options SSH", "Préférer un module dédié plutôt que `shell`/`command`"] }
          ],
          keypoints: ["Sans agent : SSH + Python", "Inventaire statique ou dynamique (plugins cloud)", "become pour sudo", "Modules plutôt que shell"]
        },
        {
          title: 'Playbooks idempotents',
          sections: [
            { h: 'Un playbook complet', code: { lang: 'yaml', src: '- name: Configurer les serveurs web\n  hosts: web\n  become: true\n  vars:\n    app_port: 8080\n  tasks:\n    - name: Installer nginx\n      ansible.builtin.dnf:\n        name: nginx\n        state: present\n\n    - name: Déployer la configuration du site\n      ansible.builtin.template:\n        src: templates/site.conf.j2\n        dest: /etc/nginx/conf.d/site.conf\n        mode: "0644"\n        validate: nginx -t -c %s\n      notify: Recharger nginx\n\n    - name: Démarrer et activer nginx\n      ansible.builtin.service:\n        name: nginx\n        state: started\n        enabled: true\n\n  handlers:\n    - name: Recharger nginx\n      ansible.builtin.service:\n        name: nginx\n        state: reloaded' } },
            { h: "L'idempotence", p: "Exécuter deux fois le même playbook doit donner le même résultat, et la seconde exécution ne doit rien changer (**changed=0**). Les modules décrivent un **état** (`state: present`) plutôt qu'une action. Avec `command`/`shell`, utilisez `creates`, `removes` ou `changed_when`." },
            { h: 'Contrôle d\'exécution', bullets: ["**Handlers** : exécutés une fois, à la fin, seulement si notifiés", "`when:` conditions ; `loop:` boucles ; `register:` capturer un résultat", "`block` / `rescue` / `always` pour la gestion d'erreurs", "`tags` pour exécuter une partie ; `serial` pour les déploiements par lots", "`--check --diff` : simulation avec affichage des différences"] }
          ],
          keypoints: ["État, pas action", "Handlers pour les redémarrages", "changed=0 au 2e passage", "--check --diff avant d'appliquer"]
        }
      ]
    },
    {
      title: 'Structurer et sécuriser',
      lessons: [
        {
          title: 'Variables, facts et templates Jinja2',
          sections: [
            { h: 'Où placer les variables', bullets: ["`group_vars/<groupe>.yml`, `host_vars/<hôte>.yml` à côté de l'inventaire", "`defaults/main.yml` du rôle (priorité la plus faible) vs `vars/main.yml` (élevée)", "Extra vars `-e` : **priorité maximale**", "Règle pratique : valeurs par défaut dans le rôle, spécificités dans group_vars"] },
            { h: 'Facts', p: "Au début d'un play, Ansible collecte des **facts** sur chaque hôte (`ansible_facts['distribution']`, mémoire, IP…). `gather_facts: false` accélère quand ils sont inutiles ; `set_fact` crée des variables dynamiques." },
            { h: 'Templates Jinja2', code: { lang: 'text', src: '# templates/site.conf.j2\nupstream app {\n{% for h in groups[\'app\'] %}\n  server {{ hostvars[h].ansible_host }}:{{ app_port }};\n{% endfor %}\n}\nserver {\n  listen 80;\n  server_name {{ domaine | default(\'_\') }};\n  location / { proxy_pass http://app; }\n}' }, bullets: ["Filtres : `default`, `upper`, `to_nice_json`, `regex_replace`, `password_hash`", "Tests : `is defined`, `is succeeded`", "Lookups : `lookup('env', 'HOME')`, `lookup('file', ...)`"] }
          ],
          keypoints: ["defaults < group_vars < host_vars < extra vars", "Facts collectés au début du play", "Templates .j2 avec boucles et filtres"]
        },
        {
          title: 'Rôles, collections et Ansible Vault',
          sections: [
            { h: 'Les rôles', code: { lang: 'bash', src: 'ansible-galaxy role init roles/nginx\n# roles/nginx/\n#   tasks/main.yml  handlers/main.yml  templates/  files/\n#   defaults/main.yml  vars/main.yml  meta/main.yml  tests/\n\n# site.yml\n# - hosts: web\n#   roles: [commun, nginx, app]' }, bullets: ["Un rôle = une responsabilité (installer et configurer nginx)", "`meta/main.yml` : dépendances et plateformes", "**Collections** : paquets de rôles, modules et plugins (`amazon.aws`, `community.general`)", "`requirements.yml` + `ansible-galaxy install -r` avec versions épinglées"] },
            { h: 'Ansible Vault', code: { lang: 'bash', src: 'ansible-vault create group_vars/prod/vault.yml\nansible-vault edit group_vars/prod/vault.yml\nansible-vault encrypt_string \'S3cr3t!\' --name db_password\nansible-playbook site.yml --ask-vault-pass\nansible-playbook site.yml --vault-password-file ~/.vault_pass   # CI : fichier ou script' }, bullets: ["Convention : `vault_db_password` dans vault.yml, référencée par `db_password: \"{{ vault_db_password }}\"`", "`no_log: true` sur les tâches qui manipulent des secrets", "Alternative : lookups vers HashiCorp Vault, AWS Secrets Manager, Azure Key Vault"] }
          ],
          keypoints: ["Rôle = tasks, handlers, templates, defaults, meta", "Collections versionnées via requirements.yml", "Vault chiffre fichiers ou chaînes", "no_log sur les secrets"]
        },
        {
          title: 'Tester, industrialiser et combiner avec Terraform',
          sections: [
            { h: 'Qualité', bullets: ["**ansible-lint** : bonnes pratiques (noms FQCN, handlers, modes de fichiers)", "`--syntax-check`, `--check --diff`", "**Molecule** : créer une instance (Docker/Podman), appliquer le rôle, vérifier l'idempotence, tester, détruire", "Tests de vérification : module `assert`, ou Testinfra"] },
            { h: 'À grande échelle', bullets: ["**AWX / Red Hat Ansible Automation Platform** : interface, RBAC, planification, journaux, credentials", "`forks` pour le parallélisme ; `serial` et `max_fail_percentage` pour des déploiements progressifs", "Stratégie `free` vs `linear`", "Pipelining SSH et ControlPersist pour la performance"] },
            { h: 'Terraform + Ansible', p: "Pattern courant : **Terraform** crée les VM et tague les instances ; l'**inventaire dynamique** Ansible les découvre par tags ; Ansible les configure. Pour des architectures immuables, Ansible peut aussi construire des images (avec **Packer**) plutôt que configurer des serveurs vivants." }
          ],
          keypoints: ["ansible-lint + Molecule", "AWX pour la gouvernance", "serial pour les rolling updates", "Terraform crée, Ansible configure (ou Packer + Ansible = images)"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Rôle nginx idempotent testé avec Molecule',
      goal: "Configurer 2 conteneurs « serveurs » avec un rôle nginx, prouver l'idempotence, chiffrer un secret et tester avec Molecule.",
      minutes: 75, env: 'Python + Ansible + Docker',
      steps: [
        { t: "Installez les outils.", cmd: "python3 -m venv .venv && source .venv/bin/activate\npip install ansible ansible-lint molecule molecule-plugins[docker]" },
        { t: "Lancez deux conteneurs cibles avec SSH (ou utilisez directement le connecteur docker).", cmd: "docker run -d --name web1 rockylinux:9 sleep infinity\ndocker run -d --name web2 rockylinux:9 sleep infinity" },
        { t: "Écrivez un inventaire utilisant `ansible_connection: community.docker.docker`.", lang: 'yaml', cmd: "web:\n  hosts:\n    web1: {}\n    web2: {}\n  vars:\n    ansible_connection: community.docker.docker" },
        { t: "Créez le rôle `nginx` (installation, template de page d'accueil affichant `inventory_hostname`, service démarré — sous conteneur, lancez nginx sans systemd si nécessaire)." },
        { t: "Exécutez deux fois le playbook.", cmd: "ansible-playbook -i inventaire.yml site.yml\nansible-playbook -i inventaire.yml site.yml", check: "Le second passage affiche changed=0." },
        { t: "Chiffrez une variable `api_key` avec `ansible-vault encrypt_string` et affichez sa longueur dans une tâche `debug` avec `no_log` sur la tâche sensible." },
        { t: "Initialisez un scénario Molecule dans le rôle et lancez `molecule test`.", cmd: "cd roles/nginx && molecule init scenario -d docker\nmolecule test", check: "Converge, idempotence et verify réussissent." },
        { t: "Corrigez les remarques de `ansible-lint`." }
      ],
      cleanup: "docker rm -f web1 web2"
    }
  ],
  quiz: [
    { q: "Que faut-il installer sur les nœuds Linux gérés par Ansible ?", options: ["Seulement SSH et Python", "Un agent Ansible", "Ansible complet", "Docker"], answer: 0, explain: "Ansible est sans agent." },
    { q: "Qu'est-ce que l'idempotence dans Ansible ?", options: ["Réexécuter un playbook ne change rien si l'état souhaité est déjà atteint", "Exécuter les tâches en parallèle", "Chiffrer les variables", "Collecter les facts"], answer: 0, explain: "Le second passage doit afficher changed=0." },
    { q: "Quand un handler s'exécute-t-il ?", options: ["À la fin du play, une seule fois, s'il a été notifié par une tâche ayant changé", "Après chaque tâche", "Au début du play", "Uniquement en mode --check"], answer: 0, explain: "Idéal pour redémarrer un service après un changement de configuration." },
    { q: "Quelle source de variables a la priorité la plus élevée ?", options: ["Les extra vars (-e)", "defaults/main.yml du rôle", "group_vars/all", "Les facts"], answer: 0, explain: "Les extra vars l'emportent toujours." },
    { q: "Comment chiffrer un mot de passe dans un fichier de variables versionné ?", options: ["Ansible Vault", "Base64", "Un fichier .gitignore", "Le module copy"], answer: 0, explain: "ansible-vault encrypt ou encrypt_string." },
    { q: "Comment simuler l'exécution d'un playbook et voir les différences ?", options: ["--check --diff", "--syntax-check", "--list-tasks", "-vvv"], answer: 0, explain: "Le mode check n'applique rien ; diff montre les changements de fichiers." },
    { q: "Comment éviter que le module `command` rapporte toujours « changed » ?", options: ["Utiliser creates/removes ou changed_when", "Ajouter become: true", "Utiliser loop", "Utiliser gather_facts: false"], answer: 0, explain: "Sinon le playbook n'est pas idempotent du point de vue du rapport." },
    { q: "Quel outil teste un rôle dans un environnement jetable, y compris l'idempotence ?", options: ["Molecule", "ansible-inventory", "ansible-galaxy", "AWX"], answer: 0, explain: "Séquence : create, converge, idempotence, verify, destroy." },
    { q: "Comment déployer sur 2 serveurs à la fois dans un groupe de 10 ?", options: ["serial: 2", "forks: 2 uniquement", "strategy: free", "loop"], answer: 0, explain: "serial découpe le play en lots successifs (rolling update)." },
    { q: "Quel plugin permet de construire l'inventaire à partir des instances EC2 taguées ?", options: ["amazon.aws.aws_ec2", "community.general.ini", "ansible.builtin.yaml", "host_vars"], answer: 0, explain: "Les keyed_groups créent des groupes à partir des tags." }
  ],
  flashcards: [
    ["Prérequis d'un nœud géré Linux", "SSH + Python"],
    ["Commande ad hoc", "ansible GROUPE -i INVENTAIRE -m MODULE -a \"arguments\" [-b]"],
    ["Handler", "Tâche exécutée en fin de play si notifiée par une tâche « changed »"],
    ["Idempotence d'une commande shell", "creates / removes / changed_when"],
    ["Gestion d'erreurs", "block / rescue / always"],
    ["Précédence (simplifiée)", "role defaults < inventaire/group_vars < host_vars < play vars < role vars < set_fact < extra vars"],
    ["Simuler", "ansible-playbook … --check --diff"],
    ["Arborescence d'un rôle", "tasks, handlers, templates, files, defaults, vars, meta"],
    ["Chiffrer une valeur", "ansible-vault encrypt_string 'valeur' --name nom"],
    ["Masquer une tâche sensible dans les logs", "no_log: true"],
    ["Déploiement par lots", "serial: N (et max_fail_percentage)"],
    ["Inventaire dynamique AWS", "plugin amazon.aws.aws_ec2 avec keyed_groups sur les tags"],
    ["Molecule", "Tests de rôles : create → converge → idempotence → verify → destroy"],
    ["Terraform + Ansible", "Terraform provisionne et tague ; Ansible configure via inventaire dynamique"]
  ]
});
