ACADEMY.courses.push({
  id: 'kubernetes', phase: 2, kind: 'tech', order: 5,
  title: 'Kubernetes — CKA', icon: '☸️', category: 'Orchestration', code: 'CKA',
  hours: '~60h', priority: 5,
  subtitle: "Orchestrer des conteneurs en production et réussir la certification pratique CKA (Certified Kubernetes Administrator).",
  description: "Kubernetes est le système d'exploitation du cloud. Ce cours couvre l'architecture du cluster, les objets de charge de travail, le réseau (Services, Ingress, NetworkPolicies), le stockage, la sécurité (RBAC), l'ordonnancement, la maintenance (etcd, mises à jour kubeadm) et le dépannage — exactement les domaines de l'examen CKA, qui est 100 % pratique en ligne de commande.",
  searchTerm: 'Kubernetes CKA formation', searchTermEn: 'CKA Certified Kubernetes Administrator',
  exam: {
    duration: '2 h', questions: '15–20 tâches pratiques', passing: '66%',
    domains: [['Dépannage', '30%'], ['Architecture, installation et configuration du cluster', '25%'], ['Services et réseau', '20%'], ['Workloads et ordonnancement', '15%'], ['Stockage', '10%']],
    notes: "Examen pratique en terminal, surveillé à distance. Documentation kubernetes.io autorisée. Prix ≈ 445 $ avec un second essai inclus (vérifiez le tarif en vigueur) ; accès au simulateur killer.sh inclus."
  },
  outcomes: [
    "Décrire l'architecture : control plane (API server, etcd, scheduler, controller manager) et nœuds (kubelet, kube-proxy, runtime)",
    "Déployer et mettre à jour des applications : Deployments, ReplicaSets, rolling updates, rollbacks",
    "Configurer avec ConfigMaps, Secrets, probes, requêtes/limites de ressources",
    "Exposer avec Services, Ingress / Gateway API et sécuriser avec NetworkPolicies",
    "Gérer le stockage : PV, PVC, StorageClass",
    "Contrôler l'accès avec RBAC et ServiceAccounts",
    "Maintenir le cluster : sauvegarde/restauration etcd, mise à jour kubeadm, drain",
    "Dépanner pods, nœuds, réseau et control plane rapidement"
  ],
  prerequisites: ["Docker (cours précédent)", "Linux et YAML à l'aise", "Un cluster local : kind, minikube ou k3d"],
  resources: [
    { label: 'Documentation Kubernetes (FR)', url: 'https://kubernetes.io/fr/docs/home/' },
    { label: 'Programme officiel CKA', url: 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/' },
    { label: 'Aide-mémoire kubectl', url: 'https://kubernetes.io/docs/reference/kubectl/quick-reference/' },
    { label: 'kind (Kubernetes in Docker)', url: 'https://kind.sigs.k8s.io/' }
  ],
  modules: [
    {
      title: 'Architecture et objets de base',
      lessons: [
        {
          title: 'Architecture du cluster',
          sections: [
            { h: 'Le control plane', bullets: ["**kube-apiserver** : porte d'entrée unique (REST), authentification, autorisation, admission", "**etcd** : base clé-valeur qui stocke TOUT l'état du cluster — à sauvegarder", "**kube-scheduler** : choisit le nœud de chaque nouveau pod", "**kube-controller-manager** : boucles de réconciliation (Deployments, nœuds, jobs…)", "**cloud-controller-manager** : intégration avec le cloud (load balancers, volumes)"] },
            { h: 'Les nœuds de travail', bullets: ["**kubelet** : agent qui fait tourner les pods décrits par l'API server", "**kube-proxy** : règles réseau des Services (iptables/IPVS) — parfois remplacé par le CNI (Cilium)", "**Container runtime** : containerd ou CRI-O via l'interface CRI", "**CNI** : plugin réseau des pods (Calico, Cilium, Flannel)"] },
            { h: 'Le modèle déclaratif', p: "Vous déclarez l'**état souhaité** (YAML) ; les contrôleurs comparent en permanence à l'**état réel** et corrigent l'écart. C'est la **boucle de réconciliation**, le cœur de Kubernetes.", code: { lang: 'bash', src: 'kubectl get nodes -o wide\nkubectl get pods -n kube-system\nkubectl api-resources            # tous les types d\'objets\nkubectl explain deployment.spec.strategy\n\n# alias indispensables pour l\'examen\nalias k=kubectl\nexport do="--dry-run=client -o yaml"\nk create deploy web --image=nginx $do > web.yaml' } }
          ],
          keypoints: ["etcd = état du cluster", "API server = seul composant qui parle à etcd", "Scheduler place, kubelet exécute", "État souhaité vs état réel → réconciliation"]
        },
        {
          title: 'Pods, Deployments et configuration',
          sections: [
            { h: 'De Pod à Deployment', bullets: ["**Pod** : plus petite unité ; un ou plusieurs conteneurs partageant réseau et volumes", "**ReplicaSet** : maintient N répliques", "**Deployment** : gère les ReplicaSets, **rolling update** et **rollback**", "**StatefulSet** : identité et stockage stables (bases de données)", "**DaemonSet** : un pod par nœud (agents de logs, monitoring)", "**Job** / **CronJob** : tâches ponctuelles ou planifiées"] },
            { h: 'Un Deployment de production', code: { lang: 'yaml', src: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: commandes-api\n  labels: { app: commandes-api }\nspec:\n  replicas: 3\n  selector:\n    matchLabels: { app: commandes-api }\n  strategy:\n    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }\n  template:\n    metadata:\n      labels: { app: commandes-api }\n    spec:\n      containers:\n        - name: api\n          image: registry.exemple.fr/commandes-api:1.4.2\n          ports: [{ containerPort: 8080 }]\n          envFrom:\n            - configMapRef: { name: commandes-config }\n            - secretRef: { name: commandes-secret }\n          resources:\n            requests: { cpu: 250m, memory: 512Mi }\n            limits: { memory: 768Mi }\n          readinessProbe:\n            httpGet: { path: /actuator/health/readiness, port: 8080 }\n          livenessProbe:\n            httpGet: { path: /actuator/health/liveness, port: 8080 }\n            initialDelaySeconds: 30' } },
            { h: 'Mises à jour et configuration', code: { lang: 'bash', src: 'k set image deploy/commandes-api api=registry.exemple.fr/commandes-api:1.4.3\nk rollout status deploy/commandes-api\nk rollout history deploy/commandes-api\nk rollout undo deploy/commandes-api --to-revision=2\nk scale deploy/commandes-api --replicas=5\n\nk create configmap commandes-config --from-literal=LOG_LEVEL=info\nk create secret generic commandes-secret --from-literal=DB_PASSWORD=s3cr3t' }, bullets: ["**requests** : réservé pour l'ordonnancement ; **limits** : plafond (dépassement mémoire → OOMKilled)", "**readiness** : prêt à recevoir du trafic ; **liveness** : redémarrer si bloqué ; **startup** : démarrages lents", "Secrets seulement encodés en base64 : activer le chiffrement d'etcd, ou External Secrets / CSI"] }
          ],
          keypoints: ["Deployment → ReplicaSet → Pods", "rollout status / history / undo", "requests pour planifier, limits pour plafonner", "readiness ≠ liveness"]
        }
      ]
    },
    {
      title: 'Réseau et stockage',
      lessons: [
        {
          title: 'Services, Ingress et NetworkPolicies',
          sections: [
            { h: 'Les Services', bullets: ["**ClusterIP** (défaut) : IP virtuelle interne + nom DNS `svc.namespace.svc.cluster.local`", "**NodePort** : port 30000–32767 sur chaque nœud", "**LoadBalancer** : load balancer du cloud (NLB, Azure LB)", "**Headless** (`clusterIP: None`) : DNS vers chaque pod (StatefulSets)", "Le Service sélectionne les pods par **labels** ; les **EndpointSlices** listent leurs IP"], code: { lang: 'bash', src: 'k expose deploy commandes-api --port 80 --target-port 8080\nk get svc,endpointslices\nk run tmp --rm -it --image=busybox:1.36 -- wget -qO- http://commandes-api' } },
            { h: 'Ingress et Gateway API', p: "Un **Ingress** route le trafic HTTP(S) externe vers des Services selon l'hôte et le chemin, via un **Ingress Controller** (NGINX, Traefik, AWS Load Balancer Controller). La **Gateway API** (GatewayClass, Gateway, HTTPRoute) est son successeur, plus expressif et orienté rôles.", code: { lang: 'yaml', src: 'apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: commandes\nspec:\n  ingressClassName: nginx\n  tls: [{ hosts: [api.exemple.fr], secretName: api-tls }]\n  rules:\n    - host: api.exemple.fr\n      http:\n        paths:\n          - path: /commandes\n            pathType: Prefix\n            backend: { service: { name: commandes-api, port: { number: 80 } } }' } },
            { h: 'NetworkPolicies', p: "Par défaut, **tous les pods peuvent se parler**. Une NetworkPolicy sélectionne des pods et n'autorise que les flux listés (le CNI doit les supporter).", code: { lang: 'yaml', src: 'apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: db-depuis-api, namespace: prod }\nspec:\n  podSelector: { matchLabels: { app: postgres } }\n  policyTypes: [Ingress]\n  ingress:\n    - from:\n        - podSelector: { matchLabels: { app: commandes-api } }\n      ports: [{ port: 5432 }]' } }
          ],
          keypoints: ["ClusterIP / NodePort / LoadBalancer / Headless", "DNS : service.namespace.svc.cluster.local", "Ingress = HTTP L7 via un controller ; Gateway API = successeur", "NetworkPolicy : deny par sélection, allow explicite"]
        },
        {
          title: 'Stockage persistant',
          sections: [
            { h: 'PV, PVC, StorageClass', bullets: ["**PersistentVolume** : un morceau de stockage (EBS, Azure Disk, NFS)", "**PersistentVolumeClaim** : demande de stockage par une application", "**StorageClass** : provisionnement **dynamique** (driver CSI, type de disque)", "Modes d'accès : **RWO** (un nœud), **ROX**, **RWX** (plusieurs nœuds : EFS, Azure Files), RWOP", "**reclaimPolicy** : Delete (défaut dynamique) ou Retain"] },
            { h: 'Exemple', code: { lang: 'yaml', src: 'apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata: { name: pgdata }\nspec:\n  accessModes: [ReadWriteOnce]\n  storageClassName: gp3\n  resources: { requests: { storage: 20Gi } }\n---\n# dans le pod\nvolumes:\n  - name: data\n    persistentVolumeClaim: { claimName: pgdata }\ncontainers:\n  - name: db\n    volumeMounts: [{ name: data, mountPath: /var/lib/postgresql/data }]' } },
            { h: 'Volumes éphémères', bullets: ["`emptyDir` : partagé entre conteneurs du pod, supprimé avec lui", "`configMap` / `secret` montés en fichiers", "`hostPath` : à éviter (sauf agents système)", "Un PVC en `Pending` → pas de StorageClass par défaut, ou capacité/zone introuvable"] }
          ],
          keypoints: ["PVC demande, PV fournit, StorageClass automatise", "RWO vs RWX", "reclaimPolicy Retain pour les données critiques"]
        }
      ]
    },
    {
      title: 'Sécurité, ordonnancement et maintenance',
      lessons: [
        {
          title: 'RBAC, ServiceAccounts et ordonnancement',
          sections: [
            { h: 'RBAC', bullets: ["**Role** (namespace) / **ClusterRole** (cluster) : verbes sur des ressources", "**RoleBinding** / **ClusterRoleBinding** : lie un rôle à un utilisateur, groupe ou ServiceAccount", "**ServiceAccount** : identité des pods vers l'API", "Vérifier : `kubectl auth can-i`"], code: { lang: 'bash', src: 'k create sa deployer -n prod\nk create role deploy-mgr -n prod --verb=get,list,update,patch --resource=deployments\nk create rolebinding deployer-rb -n prod --role=deploy-mgr --serviceaccount=prod:deployer\nk auth can-i update deployments -n prod --as=system:serviceaccount:prod:deployer   # yes\nk auth can-i delete pods -n prod --as=system:serviceaccount:prod:deployer         # no' } },
            { h: "Contrôler l'ordonnancement", bullets: ["`nodeSelector` : exiger des labels de nœud", "**Affinité / anti-affinité** de nœuds et de pods (répartir les répliques sur les zones)", "**Taints** sur les nœuds + **tolerations** sur les pods (nœuds dédiés, GPU)", "`topologySpreadConstraints` : répartition homogène entre zones", "**PriorityClass** et préemption ; `ResourceQuota` et `LimitRange` par namespace"] },
            { h: 'Sécuriser les pods', bullets: ["**Pod Security Standards** : privileged, baseline, **restricted** (labels de namespace)", "`securityContext` : `runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false`, capabilities drop ALL", "Politiques d'admission : Kyverno, OPA Gatekeeper", "Identité cloud des pods : IRSA / EKS Pod Identity, Azure Workload Identity"] }
          ],
          keypoints: ["Role + RoleBinding (namespace) ; ClusterRole + ClusterRoleBinding (cluster)", "kubectl auth can-i --as", "Taint repousse, toleration accepte", "Pod Security Standards : restricted"]
        },
        {
          title: 'Maintenance : etcd, mises à jour, nœuds',
          sections: [
            { h: 'Sauvegarder et restaurer etcd', code: { lang: 'bash', src: 'ETCDCTL_API=3 etcdctl snapshot save /opt/etcd-backup.db \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key\n\n# restauration dans un nouveau répertoire de données\netcdutl snapshot restore /opt/etcd-backup.db --data-dir /var/lib/etcd-restore\n# puis pointer le manifeste statique etcd (/etc/kubernetes/manifests/etcd.yaml) vers ce répertoire' }, note: "Les chemins des certificats se lisent dans `/etc/kubernetes/manifests/etcd.yaml`." },
            { h: 'Mettre à jour un cluster kubeadm', bullets: ["Une version mineure à la fois (1.30 → 1.31)", "Control plane d'abord : mettre à jour le paquet `kubeadm`, `kubeadm upgrade plan`, `kubeadm upgrade apply v1.31.x`", "Puis `kubelet` et `kubectl`, `systemctl restart kubelet`", "Nœuds de travail : `kubectl drain`, `kubeadm upgrade node`, mise à jour kubelet, `kubectl uncordon`"] },
            { h: 'Maintenance des nœuds', code: { lang: 'bash', src: 'k cordon worker-1                     # plus de nouveaux pods\nk drain worker-1 --ignore-daemonsets --delete-emptydir-data\n# ... maintenance ...\nk uncordon worker-1' }, bullets: ["**PodDisruptionBudget** : garantir un minimum de répliques pendant un drain", "Pods **statiques** : manifestes dans `/etc/kubernetes/manifests`, gérés par le kubelet", "Clusters managés (EKS, AKS) : le fournisseur gère le control plane et etcd"] }
          ],
          keypoints: ["etcdctl snapshot save / etcdutl snapshot restore", "Upgrade : control plane puis nœuds, une mineure à la fois", "cordon / drain / uncordon", "PDB protège la disponibilité"]
        },
        {
          title: 'Dépannage méthodique (30 % de l\'examen)',
          sections: [
            { h: 'Un pod ne démarre pas', bullets: ["`Pending` → ressources insuffisantes, taints, PVC non lié, nodeSelector impossible → `k describe pod`", "`ImagePullBackOff` → nom/tag d'image, registre privé sans `imagePullSecrets`", "`CrashLoopBackOff` → l'application plante : `k logs --previous`", "`OOMKilled` → limite mémoire trop basse", "`CreateContainerConfigError` → ConfigMap ou Secret manquant"] },
            { h: 'La boîte à outils', code: { lang: 'bash', src: 'k get pods -A -o wide | grep -v Running\nk describe pod NOM            # événements en bas !\nk logs NOM -c conteneur --previous\nk get events -A --sort-by=.lastTimestamp\nk exec -it NOM -- sh\nk debug -it NOM --image=busybox:1.36 --target=api   # conteneur éphémère\nk top pods / k top nodes      # metrics-server requis' } },
            { h: 'Un nœud ou le control plane est en panne', bullets: ["Nœud `NotReady` → `ssh` puis `systemctl status kubelet`, `journalctl -u kubelet -f`", "Certificats, chemin du runtime, swap activé, config kubelet erronée", "Composants du control plane = **pods statiques** : vérifier `/etc/kubernetes/manifests/*.yaml`", "`crictl ps` / `crictl logs` quand l'API server ne répond plus", "Service sans endpoints → labels du sélecteur ≠ labels des pods, ou pods non ready"] }
          ],
          keypoints: ["describe → événements ; logs --previous → crash", "Pending / ImagePullBackOff / CrashLoopBackOff / OOMKilled", "kubelet : systemctl + journalctl", "Service sans endpoints = sélecteur ou readiness"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'Déployer, exposer et sécuriser une application',
      goal: "Sur un cluster kind local : déployer l'API, la configurer, l'exposer par Ingress, limiter les flux par NetworkPolicy et donner un accès RBAC restreint.",
      minutes: 90, env: 'Docker + kind + kubectl',
      steps: [
        { t: "Créez un cluster kind à 3 nœuds.", lang: 'yaml', cmd: "# kind.yaml\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nnodes:\n  - role: control-plane\n  - role: worker\n  - role: worker", hint: "`kind create cluster --config kind.yaml`" },
        { t: "Créez le namespace `prod` et déployez nginx en 3 répliques avec requêtes, limites et readinessProbe (générez le YAML avec `--dry-run=client -o yaml`)." },
        { t: "Faites un rolling update vers une autre version, puis un rollback.", cmd: "k -n prod set image deploy/web nginx=nginx:1.27-alpine\nk -n prod rollout status deploy/web\nk -n prod rollout undo deploy/web" },
        { t: "Exposez en ClusterIP et testez depuis un pod temporaire.", cmd: "k -n prod expose deploy web --port 80\nk -n prod run tmp --rm -it --image=busybox:1.36 -- wget -qO- web" },
        { t: "Appliquez une NetworkPolicy « deny all ingress » puis autorisez uniquement les pods `role=frontend`.", hint: "kind utilise kindnet, qui ne gère pas les NetworkPolicies : installez Calico, ou créez le cluster avec `disableDefaultCNI: true` + Calico." },
        { t: "Créez un ServiceAccount `lecteur` avec un Role en lecture seule sur les pods de `prod` et vérifiez avec `auth can-i`." },
        { t: "Provoquez un `ImagePullBackOff` (tag inexistant) et un `CrashLoopBackOff` (commande `exit 1`), diagnostiquez chacun." },
        { t: "Drainez un worker et observez la redistribution des pods, puis uncordon.", cmd: "k drain NOM_WORKER --ignore-daemonsets\nk -n prod get pods -o wide\nk uncordon NOM_WORKER" }
      ],
      cleanup: "kind delete cluster"
    },
    {
      title: 'Entraînement examen : sauvegarde etcd et mise à jour',
      goal: "Reproduire deux tâches classiques du CKA sur un cluster kubeadm (VM locales ou killercoda.com).",
      minutes: 60, env: 'Cluster kubeadm (Killercoda propose des scénarios CKA gratuits)',
      steps: [
        { t: "Repérez les certificats etcd dans `/etc/kubernetes/manifests/etcd.yaml`." },
        { t: "Sauvegardez etcd dans `/opt/backup.db` et vérifiez le snapshot.", cmd: "etcdutl snapshot status /opt/backup.db -w table" },
        { t: "Créez un déploiement `test`, puis restaurez le snapshot dans `/var/lib/etcd-restore` et modifiez le hostPath du manifeste etcd.", check: "Le déploiement `test` a disparu : l'état est revenu à la sauvegarde." },
        { t: "Mettez à jour le control plane d'une version mineure avec kubeadm, puis un worker (drain / upgrade node / uncordon)." }
      ]
    }
  ],
  quiz: [
    { q: "Quel composant stocke l'état complet du cluster ?", options: ["etcd", "kube-scheduler", "kubelet", "kube-proxy"], answer: 0, explain: "Seul l'API server lit et écrit dans etcd." },
    { q: "Quel composant décide sur quel nœud un nouveau pod sera placé ?", options: ["kube-scheduler", "kube-controller-manager", "kubelet", "etcd"], answer: 0, explain: "Le kubelet du nœud choisi exécute ensuite le pod." },
    { q: "Un pod est en CrashLoopBackOff. Quelle commande montre la sortie du conteneur qui vient de planter ?", options: ["kubectl logs POD --previous", "kubectl get events", "kubectl top pod", "kubectl describe node"], answer: 0, explain: "--previous affiche les logs de l'instance précédente du conteneur." },
    { q: "Quelle différence entre readinessProbe et livenessProbe ?", options: ["Readiness retire le pod du Service ; liveness redémarre le conteneur", "Aucune", "Liveness retire le pod du Service ; readiness le redémarre", "Readiness ne concerne que les Jobs"], answer: 0, explain: "Un pod non ready ne reçoit plus de trafic mais n'est pas redémarré." },
    { q: "Quel type de Service expose une application via le load balancer du fournisseur cloud ?", options: ["LoadBalancer", "ClusterIP", "Headless", "ExternalName"], answer: 0, explain: "Le cloud-controller-manager provisionne le load balancer." },
    { q: "Par défaut, sans NetworkPolicy, quels pods peuvent communiquer entre eux ?", options: ["Tous les pods de tous les namespaces", "Seulement les pods d'un même namespace", "Aucun", "Seulement les pods d'un même nœud"], answer: 0, explain: "Le réseau Kubernetes est plat par défaut." },
    { q: "Comment empêcher tout pod de s'exécuter sur un nœud, sauf ceux qui l'acceptent explicitement ?", options: ["Ajouter un taint au nœud et une toleration aux pods autorisés", "Un nodeSelector sur le nœud", "Une NetworkPolicy", "Un ResourceQuota"], answer: 0, explain: "Le taint repousse ; la toleration permet l'exception." },
    { q: "Quelle commande vérifie si un ServiceAccount peut supprimer des pods ?", options: ["kubectl auth can-i delete pods --as=system:serviceaccount:ns:sa", "kubectl get rolebindings", "kubectl describe sa", "kubectl check rbac"], answer: 0, explain: "auth can-i avec --as simule l'identité." },
    { q: "Dans quel ordre mettre à jour un cluster kubeadm ?", options: ["Control plane d'abord, puis les nœuds de travail, une version mineure à la fois", "Les nœuds d'abord", "Tout en même temps", "Sauter directement plusieurs versions mineures"], answer: 0, explain: "Le kubelet ne doit jamais être plus récent que l'API server." },
    { q: "Avant une maintenance de nœud, quelle commande évacue les pods ?", options: ["kubectl drain", "kubectl cordon", "kubectl delete node", "kubectl taint"], answer: 0, explain: "cordon empêche seulement les nouveaux pods ; drain évacue les existants." },
    { q: "Un PVC reste en Pending. Quelle cause est probable ?", options: ["Aucune StorageClass par défaut ou aucun PV compatible", "Le pod a trop de mémoire", "L'image est introuvable", "Le Service n'a pas d'endpoints"], answer: 0, explain: "Vérifiez `kubectl get sc` et `kubectl describe pvc`." },
    { q: "Un Service n'a aucun endpoint. Quelle est la cause la plus fréquente ?", options: ["Le sélecteur du Service ne correspond pas aux labels des pods (ou les pods ne sont pas ready)", "Le port du nœud est fermé", "etcd est corrompu", "Le Service est de type ClusterIP"], answer: 0, explain: "Comparez `k get svc -o yaml` (selector) et `k get pods --show-labels`." }
  ],
  flashcards: [
    ["Composants du control plane", "kube-apiserver, etcd, kube-scheduler, kube-controller-manager (+ cloud-controller-manager)"],
    ["Composants d'un nœud", "kubelet, kube-proxy, container runtime (containerd), CNI"],
    ["Générer un YAML sans créer l'objet", "kubectl create … --dry-run=client -o yaml > fichier.yaml"],
    ["Rollback d'un Deployment", "kubectl rollout undo deploy/NOM [--to-revision=N]"],
    ["requests vs limits", "requests : réservation pour l'ordonnancement · limits : plafond (mémoire dépassée → OOMKilled)"],
    ["Types de Service", "ClusterIP, NodePort (30000-32767), LoadBalancer, ExternalName, Headless"],
    ["DNS d'un Service", "nom.namespace.svc.cluster.local"],
    ["Ingress vs Gateway API", "Ingress : routage HTTP simple via un controller · Gateway API : successeur plus expressif (Gateway, HTTPRoute)"],
    ["NetworkPolicy par défaut", "Aucune = tout est autorisé ; dès qu'un pod est sélectionné, seul ce qui est listé passe"],
    ["Modes d'accès des volumes", "RWO (1 nœud), ROX, RWX (plusieurs nœuds), RWOP (1 pod)"],
    ["Role vs ClusterRole", "Role : un namespace · ClusterRole : tout le cluster ou ressources non namespacées"],
    ["Taint / toleration", "Taint sur le nœud repousse ; toleration sur le pod autorise"],
    ["Sauvegarde etcd", "ETCDCTL_API=3 etcdctl snapshot save FICHIER --endpoints --cacert --cert --key"],
    ["Maintenance de nœud", "cordon → drain --ignore-daemonsets → maintenance → uncordon"],
    ["Pods statiques", "Manifestes dans /etc/kubernetes/manifests, gérés directement par le kubelet"],
    ["Nœud NotReady : premier réflexe", "systemctl status kubelet + journalctl -u kubelet"],
    ["ImagePullBackOff", "Image/tag introuvable ou registre privé sans imagePullSecrets"],
    ["Conteneur de debug éphémère", "kubectl debug -it POD --image=busybox --target=CONTENEUR"],
    ["Répartir des répliques sur plusieurs zones", "podAntiAffinity ou topologySpreadConstraints (topologyKey: topology.kubernetes.io/zone)"],
    ["PodDisruptionBudget", "Garantit un minimum de pods disponibles pendant les perturbations volontaires (drain)"]
  ]
});
