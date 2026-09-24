ACADEMY.courses.push({
  id: 'terraform', phase: 3, kind: 'tech', order: 1,
  title: 'Terraform', icon: '🏗️', category: 'IaC',
  hours: '~40h', priority: 5,
  subtitle: "Coder l'infrastructure multi-cloud : HCL, state, modules, workspaces, tests, CI/CD et bonnes pratiques d'équipe.",
  description: "Terraform (et son fork open source OpenTofu) est le standard de l'infrastructure as code multi-cloud. Vous apprendrez le workflow plan/apply, la gestion de l'état à distance, l'écriture de modules réutilisables, les tests, l'intégration dans GitLab CI et les pratiques qui évitent les catastrophes en production. Le contenu prépare aussi la certification HashiCorp Terraform Associate.",
  searchTerm: 'Terraform tutoriel', searchTermEn: 'Terraform',
  outcomes: [
    "Écrire du HCL : providers, ressources, variables, outputs, locals, data sources",
    "Maîtriser le workflow init → plan → apply → destroy",
    "Gérer l'état distant (S3, Azure Storage, HCP) avec verrouillage",
    "Utiliser count, for_each, expressions et fonctions",
    "Concevoir des modules réutilisables et versionnés",
    "Importer, déplacer et refactorer des ressources sans les détruire",
    "Tester et intégrer Terraform en CI/CD avec contrôles de sécurité (tflint, Checkov, policy as code)"
  ],
  prerequisites: ["AWS ou Azure (bases)", "Git", "Terraform ≥ 1.6 ou OpenTofu installé"],
  resources: [
    { label: 'Tutoriels officiels Terraform', url: 'https://developer.hashicorp.com/terraform/tutorials' },
    { label: 'Registre Terraform (providers et modules)', url: 'https://registry.terraform.io/' },
    { label: 'OpenTofu', url: 'https://opentofu.org/' },
    { label: 'Certification Terraform Associate', url: 'https://developer.hashicorp.com/certifications/infrastructure-automation' }
  ],
  modules: [
    {
      title: 'Les fondamentaux',
      lessons: [
        {
          title: 'HCL, providers et workflow',
          sections: [
            { h: 'Déclaratif', p: "Vous décrivez l'**état souhaité** ; Terraform calcule un **plan** (créer, modifier, remplacer, détruire) en comparant la configuration, l'**état** (state) et la réalité, puis l'applique en respectant le **graphe de dépendances**." },
            { h: 'Premier fichier', code: { lang: 'hcl', src: 'terraform {\n  required_version = ">= 1.6"\n  required_providers {\n    aws = { source = "hashicorp/aws", version = "~> 5.0" }\n  }\n}\n\nprovider "aws" {\n  region = var.region\n  default_tags { tags = { projet = "commandes", gere_par = "terraform" } }\n}\n\nvariable "region" {\n  type    = string\n  default = "eu-west-3"\n}\n\nresource "aws_s3_bucket" "logs" {\n  bucket = "commandes-logs-${data.aws_caller_identity.moi.account_id}"\n}\n\ndata "aws_caller_identity" "moi" {}\n\noutput "bucket_arn" {\n  value = aws_s3_bucket.logs.arn\n}' } },
            { h: 'Le workflow', code: { lang: 'bash', src: 'terraform init        # télécharge providers et modules, configure le backend\nterraform fmt -recursive\nterraform validate\nterraform plan -out=tfplan\nterraform apply tfplan\nterraform output bucket_arn\nterraform destroy' }, bullets: ["`.terraform.lock.hcl` fige les versions de providers : **à committer**", "Symboles du plan : `+` créer, `~` modifier, `-/+` remplacer, `-` détruire", "Toujours relire le plan, surtout les **remplacements**"] }
          ],
          keypoints: ["init → plan → apply", "Lockfile des providers à committer", "-/+ = remplacement (danger pour les données)", "default_tags pour taguer partout"]
        },
        {
          title: 'Variables, expressions, count et for_each',
          sections: [
            { h: 'Entrées, sorties, locals', bullets: ["**variable** : type, default, description, `validation`, `sensitive`", "Valeurs via `terraform.tfvars`, `*.auto.tfvars`, `-var`, variables d'environnement `TF_VAR_nom`", "**locals** : valeurs calculées réutilisées", "**output** : exposer des valeurs (entre modules, vers la CI)"] },
            { h: 'Répéter : count vs for_each', code: { lang: 'hcl', src: 'variable "sous_reseaux" {\n  type = map(object({ cidr = string, az = string, public = bool }))\n}\n\nresource "aws_subnet" "this" {\n  for_each                = var.sous_reseaux          # clé stable = nom\n  vpc_id                  = aws_vpc.main.id\n  cidr_block              = each.value.cidr\n  availability_zone       = each.value.az\n  map_public_ip_on_launch = each.value.public\n  tags                    = { Name = each.key }\n}\n\nlocals {\n  publics = [for k, s in aws_subnet.this : s.id if var.sous_reseaux[k].public]\n}\n\nresource "aws_nat_gateway" "nat" {\n  count         = var.activer_nat ? 1 : 0              # ressource conditionnelle\n  subnet_id     = local.publics[0]\n  allocation_id = aws_eip.nat[0].id\n}' }, bullets: ["**count** : indexé par position — retirer un élément au milieu décale et recrée les suivants", "**for_each** : indexé par clé — stable, à préférer pour les collections", "Blocs **dynamic** pour générer des sous-blocs répétés"] },
            { h: 'Fonctions et cycle de vie', bullets: ["Fonctions : `merge`, `lookup`, `cidrsubnet`, `templatefile`, `jsonencode`, `try`, `coalesce`", "`lifecycle { prevent_destroy = true }` pour les données critiques", "`create_before_destroy`, `ignore_changes`, `replace_triggered_by`", "`depends_on` seulement pour les dépendances invisibles"] }
          ],
          keypoints: ["for_each > count pour les collections", "count = 0/1 pour une ressource conditionnelle", "prevent_destroy sur les bases et buckets critiques", "TF_VAR_x pour passer une variable"]
        }
      ]
    },
    {
      title: 'État et modules',
      lessons: [
        {
          title: "L'état (state) : distant, verrouillé, sensible",
          sections: [
            { h: "Pourquoi l'état ?", p: "Le fichier d'état associe chaque ressource du code à son objet réel (ID), mémorise les attributs et les dépendances. **Il peut contenir des secrets en clair** : il doit être stocké à distance, chiffré, avec un accès restreint." },
            { h: 'Backend distant', code: { lang: 'hcl', src: 'terraform {\n  backend "s3" {\n    bucket       = "entreprise-tfstate"\n    key          = "commandes/prod/terraform.tfstate"\n    region       = "eu-west-3"\n    encrypt      = true\n    use_lockfile = true   # verrou natif S3 (Terraform >= 1.10) ; avant : dynamodb_table\n  }\n}\n\n# Azure\n# backend "azurerm" { resource_group_name = "rg-tfstate"  storage_account_name = "sttfstate"\n#                     container_name = "tfstate"  key = "commandes/prod.tfstate" }' } },
            { h: 'Manipuler l\'état', bullets: ["`terraform state list` / `state show`", "Blocs **`moved`** pour renommer/déplacer sans détruire (préférés à `state mv`)", "Blocs **`import`** (+ `terraform plan -generate-config-out=gen.tf`) pour adopter une ressource existante", "Blocs **`removed`** pour ne plus gérer une ressource sans la détruire", "`terraform plan -refresh-only` pour détecter la **dérive**", "`force-unlock` en dernier recours après un verrou orphelin"] },
            { h: 'Découper les états', bullets: ["Un état par environnement ET par couche (réseau, données, applications) : rayon d'impact réduit, plans plus rapides", "Partager des sorties : `terraform_remote_state` ou, mieux, data sources / paramètres SSM", "Workspaces CLI : même code, états multiples — pratiques pour des environnements identiques, mais des dossiers séparés sont plus explicites pour dev/prod"] }
          ],
          keypoints: ["État distant + chiffré + verrouillé", "L'état contient des secrets", "moved / import / removed plutôt que state mv", "Un état par environnement et par couche"]
        },
        {
          title: 'Modules réutilisables',
          sections: [
            { h: "Anatomie d'un module", bullets: ["`main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`, `README.md`, `examples/`", "Entrées minimales avec valeurs par défaut sûres ; sorties utiles", "Ne pas configurer le `provider` dans le module (le passer depuis la racine)", "Versionner (tags Git) et documenter (terraform-docs)"] },
            { h: 'Consommer un module', code: { lang: 'hcl', src: 'module "vpc" {\n  source  = "terraform-aws-modules/vpc/aws"\n  version = "~> 5.8"\n\n  name            = "commandes-prod"\n  cidr            = "10.20.0.0/16"\n  azs             = ["eu-west-3a", "eu-west-3b", "eu-west-3c"]\n  private_subnets = [for i in range(3) : cidrsubnet("10.20.0.0/16", 4, i)]\n  public_subnets  = [for i in range(3) : cidrsubnet("10.20.0.0/16", 8, 200 + i)]\n  enable_nat_gateway = true\n  single_nat_gateway = false\n}\n\nmodule "api" {\n  source     = "git::https://gitlab.exemple.fr/plateforme/tf-ecs-service.git?ref=v2.3.0"\n  vpc_id     = module.vpc.vpc_id\n  subnet_ids = module.vpc.private_subnets\n}' } },
            { h: 'Organisation d\'un dépôt', bullets: ["`modules/` (briques internes) et `live/<env>/<couche>/` (compositions)", "Registre privé (GitLab, HCP Terraform) pour publier les modules", "**Terragrunt** ou Terramate pour factoriser backends et variables entre environnements", "Compositions fines : un module = une responsabilité"] }
          ],
          keypoints: ["Épingler la version des modules", "Pas de provider dans un module", "modules/ + live/env/couche", "terraform-docs pour le README"]
        }
      ]
    },
    {
      title: 'Terraform en équipe',
      lessons: [
        {
          title: 'Tests, sécurité et CI/CD',
          sections: [
            { h: 'Qualité et sécurité statiques', bullets: ["`terraform fmt -check` et `validate`", "**tflint** : erreurs spécifiques aux providers (type d'instance inexistant)", "**Checkov** / **Trivy config** / tfsec : mauvaises configurations de sécurité", "**Policy as code** : OPA/Conftest, Sentinel (HCP Terraform) sur le plan JSON", "**Infracost** : coût estimé du changement dans la MR"] },
            { h: 'Tests', bullets: ["`terraform test` (fichiers `.tftest.hcl`) : assertions sur plan ou apply", "Terratest (Go) pour des tests d'intégration complets", "Environnements éphémères par MR, détruits automatiquement"], code: { lang: 'hcl', src: '# tests/bucket.tftest.hcl\nrun "bucket_chiffre_et_nomme" {\n  command = plan\n  assert {\n    condition     = startswith(aws_s3_bucket.logs.bucket, "commandes-logs-")\n    error_message = "Le bucket doit suivre la convention de nommage"\n  }\n}' } },
            { h: 'Pipeline GitLab', code: { lang: 'yaml', src: 'stages: [validate, plan, apply]\n\n.tf:\n  image: { name: hashicorp/terraform:1.9, entrypoint: [""] }\n  before_script: [cd live/prod/reseau, terraform init -input=false]\n\nvalidate:\n  extends: .tf\n  stage: validate\n  script: [terraform fmt -check -recursive, terraform validate]\n\nplan:\n  extends: .tf\n  stage: plan\n  script: [terraform plan -input=false -out=tfplan]\n  artifacts: { paths: [live/prod/reseau/tfplan], expire_in: 1 day }\n\napply:\n  extends: .tf\n  stage: apply\n  script: [terraform apply -input=false tfplan]\n  environment: production\n  rules:\n    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH\n      when: manual' }, bullets: ["Appliquer **exactement le plan relu** (artefact tfplan)", "Identifiants cloud par **OIDC**, rôle distinct plan (lecture) / apply (écriture)", "Un seul chemin vers la prod : la CI (pas d'apply depuis un poste)", "Détection de dérive planifiée (pipeline nocturne `plan -detailed-exitcode`)"] }
          ],
          keypoints: ["fmt, validate, tflint, Checkov", "terraform test", "apply du plan sauvegardé", "OIDC + rôle plan ≠ rôle apply", "Dérive détectée chaque nuit"]
        }
      ]
    }
  ],
  labs: [
    {
      title: 'VPC + instance web avec état distant et module local',
      goal: "Créer un backend S3 verrouillé, un module réseau local réutilisable, puis déployer une instance web ; pratiquer moved, import et destroy.",
      minutes: 90, env: 'Terraform + compte AWS',
      steps: [
        { t: "Créez manuellement (ou avec un petit projet Terraform local) un bucket S3 versionné et chiffré pour l'état." },
        { t: "Initialisez un projet avec le backend S3 (`use_lockfile = true`).", cmd: "terraform init" },
        { t: "Créez `modules/reseau` : VPC, 2 sous-réseaux publics via `for_each`, Internet Gateway, table de routage ; sorties `vpc_id` et `subnet_ids`." },
        { t: "Dans la racine, appelez le module puis créez un Security Group (80 entrant) et une instance t3.micro avec un `user_data` qui installe nginx.", hint: "Utilisez la data source `aws_ami` avec un filtre sur al2023-ami-*-x86_64." },
        { t: "Planifiez, relisez, appliquez ; testez l'IP publique.", cmd: "terraform plan -out=tfplan && terraform apply tfplan\ncurl http://$(terraform output -raw ip_publique)" },
        { t: "Renommez la ressource `aws_instance.web` en `aws_instance.frontal` avec un bloc `moved` : le plan ne doit rien détruire.", lang: 'hcl', cmd: "moved {\n  from = aws_instance.web\n  to   = aws_instance.frontal\n}" },
        { t: "Créez un bucket à la main dans la console puis adoptez-le avec un bloc `import` et `-generate-config-out`." },
        { t: "Ajoutez `tflint` et `checkov -d .` ; corrigez au moins un avertissement." }
      ],
      cleanup: "terraform destroy, puis supprimez le bucket d'état si vous n'en avez plus besoin."
    }
  ],
  quiz: [
    { q: "Pourquoi préférer for_each à count pour une liste de sous-réseaux nommés ?", options: ["Les ressources sont indexées par clé stable : retirer un élément ne recrée pas les autres", "for_each est plus rapide", "count ne fonctionne pas avec les sous-réseaux", "for_each chiffre l'état"], answer: 0, explain: "Avec count, supprimer l'élément 1 décale les index 2, 3… qui sont remplacés." },
    { q: "Que signifie `-/+` dans un plan Terraform ?", options: ["La ressource sera détruite puis recréée (remplacement)", "La ressource sera modifiée en place", "La ressource sera importée", "Aucun changement"], answer: 0, explain: "Attention aux ressources contenant des données (bases, disques)." },
    { q: "Pourquoi l'état Terraform doit-il être protégé ?", options: ["Il peut contenir des secrets en clair et il est indispensable à la gestion des ressources", "Il contient le code source", "Il est exécuté par le provider", "Il remplace le lockfile"], answer: 0, explain: "Backend distant chiffré, accès restreint, versioning." },
    { q: "Quel mécanisme empêche deux apply simultanés sur le même état ?", options: ["Le verrouillage de l'état (lock)", "Le lockfile .terraform.lock.hcl", "terraform fmt", "Les workspaces"], answer: 0, explain: "Le lockfile fige les versions de providers ; c'est différent du verrou d'état." },
    { q: "Comment renommer une ressource dans le code sans la détruire ?", options: ["Un bloc moved", "terraform taint", "terraform destroy -target", "Modifier le fichier d'état à la main"], answer: 0, explain: "Le bloc moved est versionné et relu en revue de code." },
    { q: "Comment adopter une ressource créée manuellement ?", options: ["Un bloc import (avec génération de configuration possible)", "terraform refresh", "terraform state rm", "Un bloc removed"], answer: 0, explain: "terraform plan -generate-config-out=fichier.tf aide à écrire la configuration." },
    { q: "Quelle option protège une base de données contre une destruction accidentelle ?", options: ["lifecycle { prevent_destroy = true }", "depends_on", "ignore_changes = all", "count = 0"], answer: 0, explain: "Terraform refuse alors tout plan qui détruirait la ressource." },
    { q: "Dans une pipeline, pourquoi appliquer le fichier tfplan produit à l'étape plan ?", options: ["Pour appliquer exactement ce qui a été relu et approuvé", "Parce que apply ne fonctionne pas sans", "Pour accélérer le téléchargement des providers", "Pour chiffrer l'état"], answer: 0, explain: "Un nouvel apply sans plan pourrait inclure des changements survenus entre-temps." },
    { q: "Quel outil détecte des mauvaises configurations de sécurité (bucket public, SG ouvert) dans du code Terraform ?", options: ["Checkov", "terraform fmt", "terraform-docs", "Terragrunt"], answer: 0, explain: "Checkov, Trivy config ou tfsec analysent le code et le plan." },
    { q: "Comment détecter une dérive entre l'état et la réalité sans rien modifier ?", options: ["terraform plan -refresh-only", "terraform apply -auto-approve", "terraform init -upgrade", "terraform graph"], answer: 0, explain: "Il montre les différences entre la réalité et l'état enregistré." }
  ],
  flashcards: [
    ["Workflow Terraform", "init → fmt/validate → plan → apply (→ destroy)"],
    ["Fichier à committer : .terraform.lock.hcl ?", "Oui : il fige les versions et hashes des providers"],
    ["Symboles du plan", "+ créer · ~ modifier · -/+ remplacer · - détruire · <= lire (data)"],
    ["count vs for_each", "count : index numériques (fragile) · for_each : clés stables (préféré)"],
    ["Ressource conditionnelle", "count = var.activer ? 1 : 0"],
    ["Passer une variable par l'environnement", "TF_VAR_nom=valeur"],
    ["lifecycle utiles", "prevent_destroy, create_before_destroy, ignore_changes, replace_triggered_by"],
    ["Backend S3 : verrou", "use_lockfile = true (≥ 1.10) ou table DynamoDB (historique)"],
    ["Renommer sans détruire", "Bloc moved { from = … to = … }"],
    ["Adopter une ressource existante", "Bloc import + terraform plan -generate-config-out=gen.tf"],
    ["Ne plus gérer sans détruire", "Bloc removed (ou terraform state rm)"],
    ["Détecter la dérive", "terraform plan -refresh-only (ou -detailed-exitcode en CI)"],
    ["Structure d'un module", "main.tf, variables.tf, outputs.tf, versions.tf, README, examples/"],
    ["Tests natifs", "terraform test avec des fichiers .tftest.hcl (run + assert)"],
    ["Outils de qualité IaC", "tflint, Checkov, Trivy config, Conftest/OPA, Infracost"],
    ["OpenTofu", "Fork open source de Terraform (licence MPL), compatible CLI tofu"]
  ]
});
