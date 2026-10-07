"""Assemble index.html (version autonome) et les CSV d'import Notion à partir de template.html et data-exemple.json."""
import csv, json, os, sys
here = os.path.dirname(os.path.abspath(__file__))
seed = json.load(open(os.path.join(here, "data-exemple.json"), encoding="utf-8"))
tpl = open(os.path.join(here, "template.html"), encoding="utf-8").read()
page = tpl.replace("/*SEED*/null", json.dumps(seed, ensure_ascii=False, separators=(",", ":")))
artifact_out = sys.argv[1] if len(sys.argv) > 1 else None
if artifact_out:
    open(artifact_out, "w", encoding="utf-8").write(page)
open(os.path.join(here, "index.html"), "w", encoding="utf-8").write(
    '<!doctype html>\n<html lang="fr">\n<meta charset="utf-8">\n' + page + "\n</html>\n")

apps = {a["id"]: a for a in seed["apps"]}
app_cols = [("nom","Nom"),("code","Code"),("domaine","Domaine"),("description","Description"),("cycle","Cycle de vie"),
  ("sante","Santé"),("criticite","Criticité"),("dicp","DICP"),("hebergement","Hébergement"),("techno","Technologies"),
  ("equipe","Équipe"),("cao","Statut CAO"),("caoDate","Date CAO"),("ssi","Conformité SSI"),("dette","Dette technique (1-5)"),
  ("version","Version"),("jalon","Prochain jalon"),("jalonDate","Date jalon"),("finSupport","Fin de support"),("notes","Notes")]
t_cols = [("titre","Titre"),("cle","Clé"),("app","Application"),("type","Type"),("statut","Statut"),
  ("priorite","Priorité"),("echeance","Échéance"),("porteur","Porteur"),("description","Description")]
nd = os.path.join(here, "notion")
os.makedirs(nd, exist_ok=True)
with open(os.path.join(nd, "Applications.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f); w.writerow([c[1] for c in app_cols])
    for a in seed["apps"]: w.writerow([a.get(k, "") for k, _ in app_cols])
with open(os.path.join(nd, "Tickets.csv"), "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f); w.writerow([c[1] for c in t_cols])
    for t in seed["tickets"]:
        w.writerow([apps[t["appId"]]["nom"] if k == "app" else t.get(k, "") for k, _ in t_cols])
print("ok")

# --- Import Jira Cloud (un seul CSV : les applications en Epic, les tickets en enfants) ---
JIRA_TYPE = {"Évolution": "Story", "Incident": "Bug"}
JIRA_PRIO = {"Critique": "Highest", "Haute": "High", "Moyenne": "Medium", "Basse": "Low"}
jcols = ["Issue Id", "Parent", "Issue Type", "Summary", "Description", "Status", "Priority", "Due Date", "Labels",
         "Code application", "Domaine", "Cycle de vie", "Santé", "Criticité", "DICP", "Hébergement", "Technologies",
         "Équipe", "Statut CAO", "Date CAO", "Conformité SSI", "Dette technique", "Version", "Prochain jalon",
         "Date jalon", "Fin de support", "Catégorie", "Porteur"]
jd = os.path.join(here, "jira")
os.makedirs(jd, exist_ok=True)
ids = {}
with open(os.path.join(jd, "import-jira.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(jcols)
    for i, a in enumerate(seed["apps"], 1):
        ids[a["id"]] = str(i)
        w.writerow([i, "", "Epic", f'{a["code"]} · {a["nom"]}', a["description"], "En cours", "Medium", a.get("jalonDate", ""),
                    "application", a["code"], a["domaine"], a["cycle"], a["sante"], a["criticite"], a["dicp"],
                    a["hebergement"], a["techno"], a["equipe"], a["cao"], a.get("caoDate", ""), a["ssi"], a["dette"],
                    a["version"], a["jalon"], a.get("jalonDate", ""), a.get("finSupport", ""), "", ""])
    for j, t in enumerate(seed["tickets"], 1):
        w.writerow([100 + j, ids[t["appId"]], JIRA_TYPE.get(t["type"], "Task"), t["titre"], t["description"], t["statut"],
                    JIRA_PRIO[t["priorite"]], t["echeance"], "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
                    "", "", "", t["type"], t["porteur"]])
