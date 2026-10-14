#!/usr/bin/env python3
"""Estimation des coûts mensuels AWS d'ArchiPath Academy (site statique S3 + CloudFront).

Prix : AWS Price List API (pricing.us-east-1.amazonaws.com), relevés le 14/10/2026,
région S3 eu-west-3 (Paris), CloudFront zone « Europe », tarification à l'usage (pay-as-you-go).
Montants en USD, hors TVA (AWS facture en dollars ; TVA française de 20 % pour un particulier).
Relancez : python3 docs/aws/estimation_couts.py
"""

# ---- Mesures de l'application (relevées sur le dépôt) --------------------------------
FICHIERS_PAR_VISITE = 39          # index.html + 1 CSS + 5 JS moteur + 32 JS de données
KIO_PAR_VISITE_COMPRESSEE = 269   # gzip niveau 9 ; brotli (CloudFront) fait un peu mieux → estimation prudente
MO_STOCKES = 2.1                  # taille des fichiers publiés
DEPLOIEMENTS_PAR_MOIS = 10

# ---- Prix officiels (USD) ------------------------------------------------------------
CF_GRATUIT_GO, CF_GRATUIT_REQ = 1024, 10_000_000      # offre gratuite permanente CloudFront / mois
CF_PRIX_GO_EUROPE = 0.085                              # premiers 10 To
CF_PRIX_REQ_HTTPS_EUROPE = 0.0120 / 10_000
CF_FONCTIONS_GRATUITES, CF_PRIX_FONCTION = 2_000_000, 0.10 / 1_000_000
CF_INVALIDATIONS_GRATUITES = 1000                      # chemins / mois ; "/*" compte pour 1
S3_PRIX_GO_MOIS = 0.024                                # Standard, Paris
S3_PRIX_PUT = 0.0053 / 1000                            # PUT, COPY, POST, LIST
S3_PRIX_GET = 0.0042 / 10_000                          # GET et autres
R53_ZONE_MOIS = 0.50                                   # 25 premières zones hébergées
R53_REQUETES_ALIAS = 0.0                               # requêtes vers des enregistrements Alias : gratuites
WAF_ACL_MOIS, WAF_REGLE_MOIS, WAF_PAR_MILLION = 5.00, 1.00, 0.60   # option


def cout_mensuel(visites, waf=False, regles_waf=3, fichiers=FICHIERS_PAR_VISITE):
    go = visites * KIO_PAR_VISITE_COMPRESSEE / 1024 / 1024
    req = visites * fichiers
    lignes = {
        "CloudFront – transfert": max(0, go - CF_GRATUIT_GO) * CF_PRIX_GO_EUROPE,
        "CloudFront – requêtes HTTPS": max(0, req - CF_GRATUIT_REQ) * CF_PRIX_REQ_HTTPS_EUROPE,
        # la fonction viewer-request s'exécute à CHAQUE requête, pas seulement pour www
        "CloudFront Function": max(0, req - CF_FONCTIONS_GRATUITES) * CF_PRIX_FONCTION,
        # 1 chemin "/*" par déploiement : très en dessous des 1 000 chemins gratuits
        "CloudFront – invalidations": max(0, DEPLOIEMENTS_PAR_MOIS - CF_INVALIDATIONS_GRATUITES) * 0.005,
        # stockage : version courante + anciennes versions (≤ 30 j, une par déploiement) — majorant
        "S3 – stockage": (MO_STOCKES * (1 + DEPLOIEMENTS_PAR_MOIS) / 1024) * S3_PRIX_GO_MOIS,
        # PUT : 39 fichiers par déploiement + quelques LIST du sync
        "S3 – écritures (déploiements)": DEPLOIEMENTS_PAR_MOIS * (FICHIERS_PAR_VISITE + 5) * S3_PRIX_PUT,
        # lectures d'origine : majorant = 39 fichiers × 30 jours × 20 caches régionaux/edge
        "S3 – lectures par CloudFront": min(req, FICHIERS_PAR_VISITE * 30 * 20) * S3_PRIX_GET,
        "Route 53 – zone hébergée": R53_ZONE_MOIS,
        "Route 53 – requêtes (Alias)": R53_REQUETES_ALIAS,
        "ACM – certificat public": 0.0,
        "Shield Standard (anti-DDoS)": 0.0,
        "Budgets (2 budgets)": 0.0,
    }
    if waf:
        lignes["WAF (option)"] = WAF_ACL_MOIS + regles_waf * WAF_REGLE_MOIS + req / 1e6 * WAF_PAR_MILLION
    return go, req, lignes


SCENARIOS = [
    ("Usage personnel (1 apprenant, 60 sessions)", 60),
    ("Petit groupe (500 apprenants × 20 sessions)", 10_000),
    ("Communauté (20 000 × 20 sessions)", 400_000),
    ("Très forte audience (2 millions de sessions)", 2_000_000),
]

def n(x, d=0):
    return f"{x:,.{d}f}".replace(",", "\u202f").replace(".", ",")


if __name__ == "__main__":
    print("| Scénario | Sessions/mois | Données | Requêtes | Sans WAF | Avec WAF (3 règles) | Fichiers regroupés (3/visite), sans WAF |")
    print("|---|---:|---:|---:|---:|---:|---:|")
    for nom, v in SCENARIOS:
        go, req, l = cout_mensuel(v)
        _, _, lw = cout_mensuel(v, waf=True)
        _, _, lo = cout_mensuel(v, fichiers=3)
        print(f"| {nom} | {n(v)} | {n(go, 1)} Go | {n(req)} | {n(sum(l.values()), 2)} $ | {n(sum(lw.values()), 2)} $ | {n(sum(lo.values()), 2)} $ |")
    print("\nDétail du scénario « Communauté » (sans WAF) :")
    for k, val in cout_mensuel(400_000)[2].items():
        print(f"  {k:<34} {val:>8.4f} $")
