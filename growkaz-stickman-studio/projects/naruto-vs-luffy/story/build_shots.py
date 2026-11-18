"""Build story/shots.json for the keyframe version from story/keyframes.json (+ dense SFX plan like ref4).

  python3 story/build_shots.py
Shots: one per keyframe. SFX (our generated ones from audio/sfx.py): hits/kicks on contacts and flash frames,
deep 'impact' booms on the big moments, whoosh/swish on most other cuts, powerup/riser on transformations,
wind bed throughout plus a low 'thunder' rumble under the big middle section.
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
plan = json.load(open(os.path.join(HERE, "keyframes.json")))
old = json.load(open(os.path.join(HERE, "shots.json")))
if not os.path.exists(os.path.join(HERE, "shots-2d.json")) and old["shots"] and old["shots"][0]["id"].startswith("s"):
    json.dump(old, open(os.path.join(HERE, "shots-2d.json"), "w"), indent=1)

def ids(*subs):
    return {k["id"] for k in plan["shots"] if any(x in k["desc"] for x in subs)}
BOOM = ids("charge at each other", "clash point", "slamming into the blond ninja", "punching straight into the spinning",
           "inverted black-and-white", "huge dome explosion", "white form's face, huge laughing", "bouncing upward like a trampoline",
           "smashing the golden ninja", "nine giant glowing animal", "final form's eyes", "standing victorious", "haki punch landing")
POWER = ids("steam bursting off his body", "body inflating", "nature energy", "orange pigment", "golden fire-like chakra",
            "hair turning white", "tower of white steam", "nine differently colored", "rising into the sky")
RISER = ids("glowing heartbeat pulse", "sun mark")
SEPIA = ids("sepia")
HIT_WORDS = re.compile(r"fist|punch|kick|slam|hit|smash|collid|clash|impact|bounc|launched", re.I)
FAST_WORDS = re.compile(r"blur|charg|leap|launch|stretch|curv|thrown|flinging|whipping|duck|lean", re.I)

shots, END = [], plan["shots"][-1]["start"] + plan["shots"][-1]["dur"]
for i, k in enumerate(plan["shots"]):
    sid, d = k["id"], k["dur"]
    fx = []
    if k["flash"]:
        if sid in BOOM:
            fx += [{"at": 0.0, "name": "impact", "gain": -6, "seed": i}, {"at": 0.0, "name": "hit", "gain": -9, "seed": i + 7}]
        else:
            fx += [{"at": 0.0, "name": "hit" if i % 3 else "kick", "gain": -8, "seed": i}]
            if d > 0.5: fx.append({"at": round(d * 0.55, 2), "name": "kick" if i % 2 else "hit", "gain": -13, "seed": i + 3})
    elif HIT_WORDS.search(k["desc"]):
        fx += [{"at": 0.04, "name": "hit", "gain": -10, "seed": i}]
    elif FAST_WORDS.search(k["desc"]) or i % 2 == 0:
        fx += [{"at": 0.0, "name": "whoosh" if d > 0.6 else "swish", "gain": -14, "seed": i, "dur": min(0.7, max(0.3, d))}]
    if sid in BOOM and not k["flash"]:
        fx += [{"at": 0.0, "name": "impact", "gain": -7, "seed": i}]
    if sid in POWER:
        fx += [{"at": 0.0, "name": "powerup", "gain": -12, "seed": i}]
    if sid in RISER:
        fx += [{"at": 0.0, "name": "riser", "gain": -12, "dur": 1.6}]
    if "smoke" in k["desc"] and "puff" in k["desc"]:
        fx += [{"at": 0.0, "name": "pop", "gain": -10, "seed": i}]
    if "heartbeat" in k["desc"]:
        fx += [{"at": 0.05, "name": "heartbeat", "gain": -6, "bpm": 100}]
    amb = {"name": "thunder", "gain": -24} if 28.0 <= k["start"] < 60.5 else {"name": "wind", "gain": -26}
    shots.append({"id": sid, "start": round(k["start"], 3), "end": round(k["start"] + d, 3), "line": k["desc"][:90],
                  "in": {"type": "cut"}, "sfx": fx[:3], "amb": amb, "vignette": True,
                  "params": {"kf": True, "i": i, "kind": k["kind"], "flash": k["flash"], "v": bool(k["prompt916"]),
                             "sepia": sid in SEPIA}})

out = {"title": old.get("title", "Naruto vs Luffy"), "duration": END, "shots": shots, "music": old["music"], "sfx": []}
json.dump(out, open(os.path.join(HERE, "shots.json"), "w"), indent=1)
n = sum(len(s["sfx"]) for s in shots)
hits = sum(1 for s in shots for f in s["sfx"] if f["name"] in ("hit", "kick", "impact"))
print(f"{len(shots)} shots, {n} SFX cues ({hits} hits/booms = {hits / END:.2f}/s)")
