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
CLIPS = {}
if os.path.exists(os.path.join(HERE, "clips.json")):
    for g in json.load(open(os.path.join(HERE, "clips.json"))):
        for sid_ in g["shots"]: CLIPS[sid_] = g
for i, k in enumerate(plan["shots"]):
    sid, d = k["id"], k["dur"]
    fx = []
    v = 1 + i % 2
    L = lambda n: f"../../../sfx-library/{n}_{v}.mp3"          # ElevenLabs anime SFX library (repo root)
    desc = k["desc"].lower()
    if k["flash"]:
        if sid in BOOM:
            fx += [{"at": 0.0, "name": L("punch_heavy"), "gain": -4}, {"at": 0.02, "name": L("boom"), "gain": -7}]
        else:
            fx += [{"at": 0.0, "name": L("kick" if "kick" in desc or i % 3 == 0 else "punch"), "gain": -5},
                   {"at": 0.0, "name": L("impact_frame"), "gain": -9}]
            if d > 0.5: fx.append({"at": round(d * 0.55, 2), "name": L("kick" if i % 2 else "punch"), "gain": -10})
    elif HIT_WORDS.search(desc):
        fx += [{"at": 0.04, "name": L("punch"), "gain": -6}]
    elif FAST_WORDS.search(desc) or i % 2 == 0:
        fx += [{"at": 0.0, "name": L("whoosh_big" if d > 0.6 else "whoosh"), "gain": -10}]
    if sid in BOOM and not k["flash"]:
        fx += [{"at": 0.0, "name": L("boom"), "gain": -6}]
    # signature sounds
    if any(w in desc for w in ("crater", "ground", "rubble", "rock", "slamming both palms")):
        fx += [{"at": 0.05, "name": L("rock_crumble" if "crater" in desc or "rubble" in desc else "ground_slam"), "gain": -9}]
    if "shuriken" in desc or "chakra sphere" in desc:
        fx += [{"at": 0.0, "name": L("rasengan"), "gain": -9}]
    if "haki" in desc or "lightning" in desc:
        fx += [{"at": 0.0, "name": L("electric"), "gain": -11}]
    if sid in POWER:
        fx += [{"at": 0.0, "name": L("gold_aura" if any(w in desc for w in ("gold", "ninja", "nature", "chakra", "pigment")) else "aura_charge"), "gain": -9}]
    if sid in RISER:
        fx += [{"at": 0.0, "name": L("riser"), "gain": -9}]
    if "smoke" in desc and ("puff" in desc or "popping" in desc or "bursting" in desc):
        fx += [{"at": 0.0, "name": L("smoke_pop_multi" if "line of" in desc or "dozens" in desc else "smoke_pop"), "gain": -8}]
    if "heartbeat" in desc:
        fx += [{"at": 0.0, "name": L("drums"), "gain": -5}]
    if "rubber" in desc or "bounc" in desc or "trampoline" in desc:
        fx += [{"at": 0.0, "name": L("bounce" if "bounc" in desc or "trampoline" in desc else "rubber_stretch"), "gain": -8}]
    if "victorious" in desc:
        fx += [{"at": 0.0, "name": L("stinger"), "gain": -6}]
    amb = None
    shots.append({"id": sid, "start": round(k["start"], 3), "end": round(k["start"] + d, 3), "line": k["desc"][:90],
                  "in": {"type": "cut"}, "sfx": fx[:4], "vignette": True,
                  "params": {"kf": True, "i": i, "kind": k["kind"], "flash": k["flash"], "v": bool(k["prompt916"]),
                             "sepia": sid in SEPIA,
                             **({"g": CLIPS[sid]["id"], "gStart": CLIPS[sid]["start"], "gLen": CLIPS[sid]["len"],
                                 "gFrames": CLIPS[sid].get("frames", 0)} if sid in CLIPS else {})}})

beds = [{"name": "../../../sfx-library/wind_field_1.mp3", "start": 0, "end": END, "gain": -28},
        {"name": "../../../sfx-library/rumble_1.mp3", "start": 28.0, "end": 60.5, "gain": -22}]
out = {"title": old.get("title", "Naruto vs Luffy"), "duration": END, "shots": shots, "music": old["music"], "sfx": [], "beds": beds}
json.dump(out, open(os.path.join(HERE, "shots.json"), "w"), indent=1)
n = sum(len(s["sfx"]) for s in shots)
hits = sum(1 for s in shots for f in s["sfx"] if any(w in f["name"] for w in ("punch", "kick", "boom")))
print(f"{len(shots)} shots, {n} SFX cues ({hits} hits/booms = {hits / END:.2f}/s)")
