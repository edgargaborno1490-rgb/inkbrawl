"""Real animation: turn the keyframes into ~30 moving clips with Gemini Omni Flash (Interactions API).

  python3 story/clips.py gen [g01 g02 ...]   -> clips/gNN.mp4 (720p, 16:9, with Omni's own audio, not used in the mix)
  python3 story/clips.py frames              -> build/clipframes/gNN/0001.jpg ... (24 fps) for the renderer
  python3 story/clips.py plan                -> story/clips.json (groups, times, prompts)
Each group = consecutive shots of one story beat; its first keyframe is the start frame; the prompt lists the beat's
shots in order so Omni animates them as one fast-cut sequence. The proxy injects the Gemini key.
"""
import base64, json, math, os, subprocess, sys, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.dirname(HERE)
plan = json.load(open(os.path.join(HERE, "keyframes.json")))
SH = {s["id"]: s for s in plan["shots"]}
# (first shot, last shot, start keyframe, beat summary)
GROUPS = [
 ("k001", "k005", "k001", "hook: the two fighters charge at each other across the field, fists collide, then close-ups of both grinning"),
 ("k006", "k011", "k010", "the final forms: white-haired form and golden ninja power up and clash in a giant white-and-gold explosion"),
 ("k012", "k016", "k015", "the straw-hat man crouches, steam bursts from his body as he powers up"),
 ("k017", "k022", "k017", "a stretching rubber fist rockets across the field and slams into the blond ninja's face; he skids back"),
 ("k023", "k025", "k024", "the blond ninja wipes his mouth, makes a cross hand sign, a big smoke puff bursts"),
 ("k026", "k029", "k026", "an army of hundreds of identical blond ninjas charges and surrounds the straw-hat man"),
 ("k030", "k035", "k032", "the straw-hat man calmly dodges every ninja's punch and kick as if he sees the future"),
 ("k036", "k039", "k036", "his body inflates into a huge pumped-up dark form, arms coated in black haki, red steam"),
 ("k040", "k043", "k040", "black haki punches curve like snakes around rocks and slam into ninjas from behind"),
 ("k044", "k046", "k044", "a line of ninjas is punched one after another, each bursting into a smoke puff"),
 ("k047", "k052", "k050", "orange streams of light flow from the smoke puffs into the real ninja hiding on a cliff; his eyes snap open"),
 ("k053", "k055", "k054", "the ninja meditates, then opens eyes ringed with orange pigment, sage mode, red cloak flapping"),
 ("k056", "k058", "k057", "golden fire-like chakra erupts and wraps him in a glowing golden cloak"),
 ("k059", "k061", "k060", "a spinning chakra sphere grows into a huge wind shuriken that he throws across the field"),
 ("k062", "k065", "k063", "the straw-hat man clenches his fist, it turns glossy black with red lightning, he leaps forward"),
 ("k066", "k069", "k066", "TEST"),
 ("k070", "k073", "k072", "a heartbeat like drums pulses from his chest, his hair turns white, clouds spiral up around him"),
 ("k074", "k076", "k074", "the white-haired form laughs wildly, floats, then slams both palms into the ground"),
 ("k077", "k079", "k079", "the ground turns to rubber, waves ripple and the whole arena bounces like a trampoline"),
 ("k080", "k082", "k080", "the golden ninja is launched high into the air, tumbling upside down"),
 ("k083", "k085", "k084", "the white-haired man flings the stretchy ground, a giant rubbery fist smashes the golden ninja into a crater"),
 ("k086", "k089", "k088", "the white-haired man still grins but pants and sweats; his white hair and cloud halo flicker and fade"),
 ("k090", "k093", "k090", "flashback: he fights a tall man in a yellow striped suit firing light beams, then collapses, shriveled and drained"),
 ("k094", "k097", "k097", "the golden ninja rises; nine colored chakra flames orbit him and nine giant animal spirits appear behind him"),
 ("k098", "k101", "k099", "his eyes glow gold, he rises in his final form, nine black orbs circle him and form a black staff"),
 ("k102", "k104", "k103", "the calm golden ninja stands tall over the exhausted, panting white-haired man"),
 ("k105", "k107", "k105", "the golden ninja stands victorious in warm light; the straw-hat man back to normal kneels and grins"),
 ("k108", "k111", "k108", "a black haki punch lands with a huge burst; then the golden ninja breathes, his aura towers to the clouds"),
 ("k112", "k114", "k112", "an army of blond ninjas piles onto the straw-hat man; then both stand side by side, grinning and battered"),
 ("k115", "k118", "k117", "both fighters grin and point at the camera, then walk away together across the misty field"),
]
STYLE = ("Animate this exact 2D Japanese TV-anime frame into a moving anime sequence. Keep the art style, thick black line art, "
         "flat cel colors, glowing outlines and the character designs exactly as in the image (same faces, hair, outfits, skin tones). "
         "Hand-drawn TV-anime motion: fast dynamic action, smears and speed lines, impact frames, camera shake on hits. "
         "No text, no letters, no logos, no symbols on headbands or clothes. No dialogue, no music.")
END = plan["shots"][-1]["start"] + plan["shots"][-1]["dur"]


def groups():
    ids = [s["id"] for s in plan["shots"]]; out = []
    for n, (a, b, kf, beat) in enumerate(GROUPS, 1):
        sl = ids[ids.index(a): ids.index(b) + 1]
        start = SH[a]["start"]; end = SH[b]["start"] + SH[b]["dur"]; ln = end - start
        dur = max(3, math.ceil(ln * 1.15))
        chars = []
        for i in sl:
            for c in [r for r in SH[i]["refs"]] + (["KIZARU"] if "yellow striped" in SH[i]["desc"] else []):
                if c not in chars: chars.append(c)
        shots = " ".join(f"({k+1}) {SH[i]['desc']}." for k, i in enumerate(sl))
        who = " ".join(f"[{plan['chars'][c]}]" for c in chars)
        prompt = (f"{STYLE} About {dur} seconds, {len(sl)} quick cuts of roughly {ln/len(sl):.1f} s each. Beat: {beat}. "
                  f"Shots in order: {shots} Characters: {who} Sound effects only: punches, impacts, whooshes, rumble.")
        out.append({"id": f"g{n:02d}", "shots": sl, "start": round(start, 3), "end": round(end, 3), "len": round(ln, 3),
                    "dur": dur, "keyframe": kf, "prompt": prompt})
    return out


def call(g):
    img = base64.b64encode(open(os.path.join(P, "keyframes", "169", g["keyframe"] + ".png"), "rb").read()).decode()
    body = {"model": os.environ.get("OMNI", "gemini-omni-1.2-flash"),
            "input": [{"type": "image", "data": img, "mime_type": "image/png"}, {"type": "text", "text": g["prompt"]}],
            "response_format": {"type": "video", "duration": f"{g['dur']}s", "aspect_ratio": "16:9", "resolution": "720p"}}
    req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/interactions", json.dumps(body).encode(),
                                 {"Content-Type": "application/json"})
    for attempt in range(5):
        try:
            r = json.load(urllib.request.urlopen(req, timeout=900)); break
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:400]
            if e.code in (429, 500, 502, 503, 504) and attempt < 4: time.sleep(20 * (attempt + 1)); continue
            raise RuntimeError(f"{g['id']} HTTP {e.code}: {msg}")
        except (urllib.error.URLError, TimeoutError):
            if attempt < 4: time.sleep(20); continue
            raise
    for st in r.get("steps", []):
        for c in st.get("content", []) or []:
            if c.get("type") == "video" and c.get("data"):
                return base64.b64decode(c["data"])
    raise RuntimeError(f"{g['id']}: no video in response: {json.dumps(r)[:300]}")


def gen(ids):
    os.makedirs(os.path.join(P, "clips"), exist_ok=True)
    todo = [g for g in groups() if (not ids or g["id"] in ids)]
    def one(g):
        dst = os.path.join(P, "clips", g["id"] + ".mp4")
        if os.path.exists(dst) and not os.environ.get("FORCE"): return
        if g["prompt"].endswith("TEST.") or "Beat: TEST" in g["prompt"]:
            src = os.path.join(P, "clips", "test-k066-haki-vs-rasenshuriken.mp4")
            open(dst, "wb").write(open(src, "rb").read()); print("ok (test clip)", g["id"], flush=True); return
        try:
            data = call(g); open(dst, "wb").write(data); print("ok", g["id"], flush=True)
        except Exception as e:
            print("FAIL", e, flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(one, todo))


def frames():
    for g in groups():
        src = os.path.join(P, "clips", g["id"] + ".mp4"); out = os.path.join(P, "build", "clipframes", g["id"])
        if not os.path.exists(src): print("missing", g["id"]); continue
        os.makedirs(out, exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "fps=24,scale=1920:1080:flags=lanczos", "-q:v", "3",
                        os.path.join(out, "%04d.jpg")], check=True)
        n = len(os.listdir(out)); g["frames"] = n
    json.dump(groups_with_frames(), open(os.path.join(HERE, "clips.json"), "w"), indent=1)


def groups_with_frames():
    gs = groups()
    for g in gs:
        d = os.path.join(P, "build", "clipframes", g["id"])
        g["frames"] = len(os.listdir(d)) if os.path.isdir(d) else 0
    return gs


if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "plan":
        gs = groups(); json.dump(gs, open(os.path.join(HERE, "clips.json"), "w"), indent=1)
        print(len(gs), "clips,", sum(g["dur"] for g in gs), "s requested")
    elif mode == "gen": gen(sys.argv[2:])
    elif mode == "frames": frames()
