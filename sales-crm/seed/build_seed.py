"""Convert the Google Sheet export (seed/*.tsv) into ArtifactData batch files.

Usage: python3 -I seed/build_seed.py   (writes seed/out/batch-NN.json)
Each batch is a list of {op, collection, doc_id, data} writes (max 50).
"""
import csv, json, os, re, sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
NOW = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")
OWNER = {"B": "Bee", "G": "Nungning", "T": "Toon", "N": "Ness", "P": "Poxpax"}
CH = {"C": "Call", "R": "Relationship", "O": "Old Customer", "M": "Martech", "": ""}
TEMP = {"H": "Hot", "W": "Warm", "C": "Cold", "": ""}
STAGE = {"W": "Closed Won", "L": "Closed Lost", "LI": "Lead In", "PS": "Proposal Sent",
         "QS": "Quotation Sent", "P": "Prospect"}
DEF_PROB = {"Prospect": 10, "Lead In": 20, "Proposal Sent": 40, "Quotation Sent": 60,
            "Negotiation": 80, "Closed Won": 100, "Closed Lost": 0}


def rows(name):
    with open(os.path.join(HERE, name), encoding="utf8") as f:
        r = list(csv.reader(f, delimiter="\t"))
    head = r[0]
    return [dict(zip(head, x + [""] * (len(head) - len(x)))) for x in r[1:] if any(c.strip() for c in x)]


def ym(v):
    v = v.strip()
    return "20" + v if re.fullmatch(r"\d\d-\d\d", v) else ""


def key(name):
    return re.sub(r"\s+", " ", name.strip().lower())


accounts = {}  # key -> doc


def account(name, owner=""):
    k = key(name)
    if k not in accounts:
        accounts[k] = {"id": "a%03d" % (len(accounts) + 1), "name": name.strip(), "owner": owner,
                       "industry": "", "lists": [], "stage": "Prospect", "temp": "", "remark": "",
                       "contacts": [], "existing": False, "createdAt": NOW, "updatedAt": NOW,
                       "updatedBy": None}
    elif owner and not accounts[k]["owner"]:
        accounts[k]["owner"] = owner
    return accounts[k]


deals = []
for i, r in enumerate(rows("pipeline.tsv"), 1):
    stage = STAGE[r["stage"]]
    owner = OWNER[r["owner"]]
    a = account(r["customer"], owner)
    if r["ch"] == "O":
        a["existing"] = True
    prob = int(r["prob"]) if r["prob"].strip() else DEF_PROB[stage]
    if stage == "Closed Won":
        prob = 100
    if stage == "Closed Lost":
        prob = 0
    deals.append({"id": "d%03d" % i, "customer": r["customer"].strip(), "accountId": a["id"],
                  "product": r["product"].strip(), "bu": r["bu"].strip().replace("SeTech", "SETech"),
                  "billing": float(r["billing"] or 0), "gp": float(r["gp"] or 0), "stage": stage,
                  "prob": prob, "temp": TEMP[r["temp"]], "channel": CH[r["ch"]],
                  "leadMonth": ym(r["lead"]), "closeMonth": ym(r["close"]), "owner": owner,
                  "nextStep": "", "nextDate": "", "action": r["action"].strip(),
                  "note": r["note"].strip(), "lostReason": "", "gpMonth": "", "spread": 1,
                  "history": [], "createdAt": NOW, "updatedAt": NOW, "updatedBy": None,
                  "source": "Google Sheet: Sales_Pipeline"})

for r in rows("prospects.tsv"):
    a = account(r["name"], OWNER[r["owner"]])
    if r["list"] and r["list"] not in a["lists"]:
        a["lists"].append(r["list"])
    a["industry"] = a["industry"] or r["industry"]
    a["temp"] = a["temp"] or TEMP[r["temp"]]
    a["stage"] = r["stage"] or a["stage"]
    if r["remark"] and r["remark"] not in a["remark"]:
        a["remark"] = (a["remark"] + " / " if a["remark"] else "") + r["remark"]

for r in rows("contacts.tsv"):
    a = account(r["account"])
    c = {k: r[k].strip() for k in ("name", "role", "tel", "email")}
    if c not in a["contacts"]:
        a["contacts"].append(c)

writes = []
for d in deals:
    writes.append({"op": "set", "collection": "deals", "doc_id": d.pop("id"), "data": d})
for a in accounts.values():
    writes.append({"op": "set", "collection": "accounts", "doc_id": a.pop("id"), "data": a})
writes.append({"op": "set", "collection": "config", "doc_id": "settings", "data": {
    "year": 2026, "newAcctPerMonth": 2, "actPerWeek": 15,
    "sales": [{"name": "Bee", "active": True, "monthly": [800000] * 12},
              {"name": "Nungning", "active": True, "monthly": [800000] * 12}],
    "bus": ["SETech", "TPS", "TPM", "Goodtech", "GGEZ", "Code Play", "Snaptech", "SYD"],
    "products": ["MA", "KOL", "Ads", "Event", "Production", "Campaign", "CRM", "PR", "Live",
                 "Fandom Marketing", "IP Collab", "Games", "Management Fee 10%",
                 "Management Fee 15%", "Strategy", "Seeding", "Website", "AI", "Media Plan"],
    "updatedAt": NOW, "updatedBy": None}})

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))
for b in range(0, len(writes), 50):
    with open(os.path.join(OUT, "batch-%02d.json" % (b // 50 + 1)), "w", encoding="utf8") as f:
        json.dump(writes[b:b + 50], f, ensure_ascii=False)
with open(os.path.join(OUT, "all.json"), "w", encoding="utf8") as f:
    json.dump(writes, f, ensure_ascii=False)
print(len(deals), "deals,", len(accounts), "accounts,", len(writes), "writes")
