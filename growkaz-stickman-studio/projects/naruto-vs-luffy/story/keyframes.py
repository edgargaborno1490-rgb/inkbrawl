"""Keyframe plan for the Nano Banana (Gemini image) version of Naruto vs Luffy.

Run: python3 story/keyframes.py  ->  story/keyframes.json + story/keyframes.md
Each shot = one AI keyframe (16:9). Kinds: CU close-up (also generated natively in 9:16),
M medium, W wide (9:16 = pan/recrop of the 16:9 frame), FX impact/crater.
flash=True -> 1-2 white/inverted frames at the cut + hit SFX.
Characters are described by look only (no names, no logos) and always with the same brown skin.
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))

STYLE = ("2D Japanese TV-anime key frame, hand-drawn cel animation look, thick black ink outlines, "
         "flat cel colors with one hard shadow tone, strong glowing colored outline around each fighter, "
         "extreme dramatic perspective, speed lines where there is motion, painted misty green grass field "
         "with soft hazy pale sky and distant blue hills in the background. No text, no letters, no logos, "
         "no watermark, no symbols on clothing.")
SKIN = "warm medium-brown skin (#8D5B3E)"

CHAR = {
 "N_BASE": f"a young ninja man with {SKIN}, spiky bright yellow-blond hair, bright blue eyes, three thin "
           "whisker marks on each cheek, orange-and-black zip-up jacket, black pants, plain steel forehead "
           "protector on a dark blue headband (blank plate, no symbol); orange glowing outline",
 "N_SAGE": f"the same blond ninja ({SKIN}, whisker marks, orange-and-black outfit) in sage form: orange "
           "pigment around the eyes, golden eyes with horizontal bar pupils, short red cloak with black "
           "flame hem; orange glowing outline",
 "N_KURAMA": f"the same blond ninja ({SKIN}, whisker marks) wrapped in a bright glowing golden-yellow "
             "chakra cloak covering the whole body with black swirl and line patterns, flame-like golden "
             "edges, glowing orange eyes; golden glowing outline",
 "N_SIX": f"the same blond ninja ({SKIN}, whisker marks) in his final form: glowing golden-orange body "
          "cloak with a long flowing coat whose collar has a ring of black comma-shaped marks, a glowing "
          "sun mark on one palm, golden eyes, nine floating black orbs in a ring behind his back; "
          "golden glowing outline",
 "L_BASE": f"a lean young man with {SKIN}, messy short black hair, a small scar under his left eye, "
           "an X-shaped scar on his chest, a straw hat with a red band, open red sleeveless vest, blue "
           "knee-length shorts with white cuffs, yellow sash, sandals, a huge toothy grin; red glowing outline",
 "L_GEAR2": "the same straw-hat young man in the same straw hat, red vest, blue shorts and yellow sash, his skin still warm medium brown with only a slight red flush, thick white-pink steam rising from his whole body, crouched low; red glowing outline",
 "L_HAKI": "the same straw-hat young man in exactly the same outfit (round straw hat with red band, open red vest, blue shorts with white cuffs, yellow sash, sandals), both forearms and fists coated in glossy black armor-like haki with crackling red-black lightning; red glowing outline",
 "L_SNAKE": f"the same young man ({SKIN}) in a pumped-up form: huge muscular upper body, arms coated in "
            "glossy black haki with red flame patterns, dark red steam floating like a scarf around his shoulders, straw hat hanging on his back, blue shorts with white cuffs, yellow sash, sharp narrow eyes, menacing grin; dark red glowing outline",
 "L_G5": f"the same young man ({SKIN}) in his white form: pure white hair rising like flames, white "
         "eyebrows, white vest and white shorts, wisps of white cloud forming a halo ring around his "
         "shoulders, huge laughing grin, wide cartoonish glowing eyes; bright white glowing outline",
 "L_DRAINED": f"the same young man ({SKIN}) completely drained: shriveled thin body, wrinkled old-looking "
              "face, sunken eyes, sweating, limp white hair, still wearing his white vest and white shorts, clearly the same young man shrunken and aged by exhaustion, kneeling",
 "KIZARU": "a tall man in a yellow striped suit and dark sunglasses firing beams of golden light from his feet",
}

# Character reference sheets (generated first, owner OK, then attached to every keyframe).
SHEETS = {
 "N_BASE": "Naruto base", "N_SAGE": "Naruto Sage Mode", "N_KURAMA": "Naruto Kurama cloak",
 "N_SIX": "Naruto Six Paths", "L_BASE": "Luffy base", "L_GEAR2": "Luffy Gear 2",
 "L_SNAKE": "Luffy Gear 4 Snakeman", "L_HAKI": "Luffy Haki fists", "L_G5": "Luffy Gear 5",
 "L_DRAINED": "Luffy drained",
}
SHEET_PROMPT = ("Character reference sheet, no text labels anywhere, plain light grey background: full-body front view, 3/4 view, "
                "back view, plus three face close-ups (grin, angry shout, glowing-eyed power-up). ")

# (start s, kind, flash, chars, description). Times come from timeline/words.json.
S = [
 # HOOK
 (0.00, "W", True,  ["N_BASE", "L_BASE"], "both fighters face off across the misty grass field, the blond ninja on the left with an orange aura, the straw-hat man on the right with a red aura, low-angle wide shot, wind blowing the grass"),
 (0.45, "CU", False, ["N_BASE"], "extreme close-up of the blond ninja's face, confident grin, blue eyes shining, hair whipping in the wind"),
 (0.70, "CU", True,  ["N_BASE", "L_BASE"], "two fists colliding dead center, an orange-sleeved fist from the left and a bare brown fist from the right, shockwave ring and sparks"),
 (1.10, "CU", False, ["L_BASE"], "extreme close-up of the straw-hat man's face, hat brim shading his eyes, huge toothy grin"),
 (1.70, "M",  False, ["L_BASE"], "the straw-hat man holding his hat down with one hand, low angle, wind tugging his red vest"),
 (2.10, "CU", True,  ["L_G5"], "extreme close-up of the white-haired form's eyes glowing white, white hair flames rising"),
 (2.80, "W",  False, ["L_G5"], "the white-haired man floating above the field with a ring of white clouds behind him, sun glare"),
 (3.30, "CU", True,  ["N_SIX"], "extreme close-up of the golden form's eyes glowing gold, golden light pouring off his face"),
 (3.85, "W",  False, ["N_SIX"], "the golden ninja floating above the field, nine black orbs in a ring behind him, golden glow lighting the mist"),
 (4.50, "W",  True,  ["N_SIX", "L_G5"], "the golden ninja and the white-haired man charge at each other from opposite sides, a huge white-and-gold clash in the middle of the field"),
 (5.05, "FX", True,  ["N_SIX", "L_G5"], "the clash point up close, gold and white energy shattering outward, cracks in the air, debris"),
 # OPENING CLASH
 (5.75, "M",  False, ["L_BASE"], "the straw-hat man leaning forward into a fighting stance, grinning, fists up"),
 (6.10, "CU", False, ["L_BASE"], "close-up of a sandaled foot digging into the grass, dirt clods flying"),
 (6.50, "CU", False, ["L_BASE"], "close-up of the straw-hat man's eyes narrowing with focus"),
 (7.25, "M",  True,  ["L_GEAR2"], "the straw-hat man crouched low, legs pumping, thick steam bursting off his body"),
 (7.75, "CU", False, ["L_GEAR2"], "close-up of steam venting from his forearm, skin glowing reddish"),
 (8.30, "CU", True,  ["L_GEAR2"], "a fist stretching straight at the camera with extreme foreshortening, the arm a long blur behind it, speed lines"),
 (8.70, "W",  True,  ["L_GEAR2"], "a red blur of a stretched arm shooting across the field, a shockwave ring tearing the grass"),
 (9.20, "M",  False, ["N_BASE"], "the blond ninja turning, eyes wide, a blurred punch whipping past his face"),
 (9.70, "CU", False, ["L_GEAR2"], "dozens of motion-blurred fists filling the frame, afterimages everywhere"),
 (10.30, "FX", True, ["N_BASE"], "a fist slamming into the blond ninja's cheek, impact frame, shockwave burst, spit flying"),
 (10.75, "W", False, ["N_BASE"], "the blond ninja skidding backwards across the grass, a long dirt trail behind him"),
 (11.30, "CU", False, ["N_BASE"], "the blond ninja wiping his mouth with his thumb, grinning back"),
 (11.80, "CU", False, ["N_BASE"], "close-up of the blond ninja's hands making a cross-shaped hand sign, fingers glowing orange"),
 (12.45, "CU", True, ["N_BASE"], "a big white smoke puff bursting open with a silhouette inside"),
 (13.10, "W", True,  ["N_BASE"], "a huge army of hundreds of identical blond ninjas spread across the misty field, wide aerial view"),
 (13.80, "M", False, ["N_BASE"], "a row of identical blond ninjas charging straight at the camera, low angle"),
 (14.30, "CU", True, ["N_BASE"], "several identical blond ninja faces shouting at once, packed together"),
 (14.75, "W", False, ["N_BASE", "L_BASE"], "overhead view: a ring of identical blond ninjas closing in on the lone straw-hat man in the center"),
 # COUNTER
 (15.20, "CU", True, ["L_BASE"], "extreme close-up of the straw-hat man's eye, iris glowing red, calm"),
 (15.95, "M", False, ["L_BASE", "N_BASE"], "his vision: ghostly see-through red afterimages of the ninjas showing where each one will strike"),
 (16.30, "M", False, ["L_BASE", "N_BASE"], "the straw-hat man leaning aside as a ninja's punch misses his face by an inch"),
 (16.80, "M", False, ["L_BASE", "N_BASE"], "the straw-hat man ducking under a flying kick from another ninja"),
 (17.25, "CU", False, ["L_BASE"], "close-up of the straw-hat man smirking, eyes closed"),
 (17.75, "W", False, ["L_BASE", "N_BASE"], "the blond ninjas frozen mid-leap all around him, time almost stopped"),
 (18.65, "M", True,  ["L_SNAKE"], "the young man's body inflating, muscles bulging, black haki spreading over his arms, steam blasting"),
 (19.20, "CU", False, ["L_SNAKE"], "close-up of a huge black haki arm with red flame patterns, red steam curling"),
 (19.50, "M", True,  ["L_SNAKE"], "the pumped-up dark form standing tall, red steam scarf, menacing grin, full body"),
 (20.30, "CU", False, ["L_SNAKE"], "close-up of the pumped-up form's face, narrow glowing eyes"),
 (20.70, "W", False, ["L_SNAKE"], "a black haki fist launched, the arm curving through the air like a snake"),
 (21.30, "CU", False, ["L_SNAKE"], "the black fist bending sharply around a stone pillar, speed lines"),
 (21.75, "M", False, ["L_SNAKE", "N_BASE"], "the curving punch swinging around a blond ninja and hitting him from behind"),
 (22.20, "FX", True, ["N_BASE"], "impact frame, a blond ninja doubled over by a black fist, white shockwave"),
 (22.70, "W", True,  ["N_BASE"], "a line of blond ninjas getting hit one after another, each bursting into a white smoke puff"),
 (23.25, "CU", True, ["N_BASE"], "a smoke puff exploding outward where a ninja just was"),
 (23.80, "W", False, [], "the grass field covered with drifting white smoke clouds"),
 (24.55, "CU", False, ["N_BASE"], "the real blond ninja's eye opening sharply, half hidden behind a rock"),
 (25.10, "M", False, ["N_BASE"], "one last ninja popping into smoke, a glowing orange thread of light flowing out of the puff"),
 (25.50, "CU", True, ["N_BASE"], "a smoke puff popping with an orange spark"),
 (26.05, "W", False, ["N_BASE"], "glowing orange streams flowing across the field from many smoke puffs into the real blond ninja crouched on a cliff"),
 (26.50, "CU", False, ["N_BASE"], "the blond ninja touching his temple, eyes closed, orange glow of memories"),
 (27.20, "CU", False, ["N_BASE"], "the blond ninja's eyes snapping open, determined"),
 # POWER-UP
 (28.10, "M", False, ["N_BASE"], "the blond ninja sitting cross-legged on a rock, meditating, green-gold nature energy swirling"),
 (28.70, "CU", True, ["N_SAGE"], "extreme close-up of his face with orange pigment around the eyes and golden eyes with bar pupils"),
 (29.40, "W", False, ["N_SAGE"], "the sage ninja standing on a rock, red cloak flapping, mist swirling"),
 (29.90, "M", False, ["N_KURAMA"], "golden fire-like chakra erupting around the ninja, lighting the field"),
 (30.40, "CU", True, ["N_KURAMA"], "close-up of the ninja in the glowing golden cloak, black swirl markings, orange eyes"),
 (31.15, "W", False, ["N_KURAMA"], "the glowing golden ninja shining across the misty field like a sun, light beams"),
 (31.50, "CU", False, ["N_KURAMA"], "close-up of his palm forming a spinning blue-white chakra sphere"),
 (31.90, "M", True,  ["N_KURAMA"], "the golden ninja holding a huge spinning white-blue wind shuriken of chakra above his head, wind ripping"),
 (32.60, "W", False, ["N_KURAMA", "L_BASE"], "the wind shuriken thrown across the field toward the straw-hat man, grass torn up in its path"),
 (33.20, "CU", False, ["L_HAKI"], "close-up of the straw-hat man clenching his fist, glaring"),
 (33.70, "CU", True, ["L_HAKI"], "close-up of his fist turning glossy black, red lightning crackling"),
 (34.50, "CU", True, ["L_HAKI"], "red-black lightning crackling over the black arm, sparks, the air distorting"),
 (35.10, "M", False, ["L_HAKI"], "the straw-hat man leaping forward fist-first toward the spinning shuriken"),
 (35.55, "FX", True, ["L_HAKI"], "a black haki fist punching straight into the spinning wind shuriken, explosion of white light"),
 (36.00, "FX", True, ["L_HAKI", "N_KURAMA"], "impact frame: inverted black-and-white silhouettes of both fighters inside a blast"),
 (36.40, "W", True,  [], "a huge dome explosion over the grass field, shockwave flattening the grass"),
 (36.80, "W", False, ["L_HAKI", "N_KURAMA"], "a smoking crater, both fighters standing at opposite edges"),
 # TURNING POINT
 (37.10, "CU", False, ["L_BASE"], "close-up of the straw-hat man's chest, a glowing heartbeat pulse"),
 (37.50, "CU", True, ["L_BASE"], "a heartbeat shockwave ring radiating out from his chest"),
 (37.90, "M", False, ["L_G5"], "his hair turning white from the roots, a peaceful smile, eyes closed"),
 (38.40, "W", False, ["L_G5"], "a tower of white steam and clouds spiraling up around him"),
 (38.80, "CU", True, ["L_G5"], "extreme close-up of the white form's face, huge laughing grin, wide cartoonish eyes"),
 (39.40, "W", False, ["L_G5"], "the white-haired man floating, full body, white hair flames, cloud halo ring, glowing white outline"),
 (40.00, "M", False, ["L_G5"], "the white-haired man slamming both palms into the ground"),
 (40.75, "CU", False, [], "the grass ground rippling like rubber waves"),
 (41.20, "W", False, ["L_G5"], "the whole field stretching like a rubber sheet, hills bending"),
 (41.85, "W", True,  ["L_G5", "N_KURAMA"], "the arena bouncing upward like a trampoline, rocks flying, cartoon wobble lines"),
 (42.40, "M", False, ["N_KURAMA"], "the golden ninja launched into the air, shocked face"),
 (42.85, "W", False, ["N_KURAMA", "L_G5"], "the whole arena warping like rubber, the golden ninja tiny in the sky"),
 (43.70, "CU", False, ["N_KURAMA"], "the golden ninja upside down in mid-air, eyes wide"),
 (44.55, "CU", False, ["L_G5"], "the white-haired man grabbing the stretchy ground and flinging it like a bedsheet, laughing"),
 (45.00, "M", True,  ["N_KURAMA", "L_G5"], "a giant rubbery white fist smashing the golden ninja into the ground"),
 (45.40, "CU", False, ["N_KURAMA"], "the golden ninja on his knees in a crater, gasping, sweat"),
 # STAMINA
 (46.25, "CU", False, ["L_G5"], "the white form's laughing face, a drop of sweat on his temple"),
 (46.65, "CU", False, ["L_G5"], "his white hair flames flickering and fading at the tips"),
 (47.45, "M", False, ["L_G5"], "the white-haired man panting, sweat dripping, still grinning"),
 (48.25, "CU", False, ["L_G5"], "the white cloud halo breaking apart into wisps"),
 (49.25, "M", True,  ["L_G5", "KIZARU"], "flashback in faded sepia tones: the white-haired man fighting the man in the yellow striped suit, golden light beams"),
 (50.20, "M", False, ["L_G5", "KIZARU"], "sepia flashback: a beam of light kick colliding with a rubbery white arm"),
 (50.70, "CU", False, ["L_DRAINED"], "sepia flashback: close-up of the shriveled, wrinkled, exhausted face"),
 (51.50, "W", False, ["L_DRAINED"], "sepia flashback: the tiny shriveled figure collapsed on rubble"),
 (52.45, "CU", False, ["N_KURAMA"], "the golden ninja rising to his feet, eyes sharp"),
 (53.30, "W", False, ["N_KURAMA"], "nine differently colored chakra flames orbiting the ninja"),
 (54.10, "CU", False, ["N_SIX"], "close-up of his palm with a glowing sun mark, nine colored wisps circling it"),
 (54.70, "W", True,  ["N_SIX"], "nine giant glowing animal spirits towering behind him in the mist (a fox, a turtle, an ox, a slug, a monkey, a horse, a beetle, a cat, a raccoon dog), all in glowing outlines"),
 (55.85, "CU", True, ["N_SIX"], "extreme close-up of the final form's eyes glowing gold"),
 (56.30, "W", False, ["N_SIX"], "the golden ninja rising into the sky, coat flowing, nine black orbs in a ring"),
 (57.00, "CU", False, ["N_SIX"], "close-up of floating black orbs with a glowing outline"),
 (57.60, "M", True,  ["N_SIX"], "the black orbs morphing into a long black staff in his hand"),
 (58.35, "M", False, ["N_SIX"], "the golden ninja standing calm, coat flowing"),
 (59.30, "W", False, ["N_SIX", "L_G5"], "the golden ninja standing tall over the panting white-haired man"),
 (59.90, "CU", False, ["N_SIX"], "the golden ninja's calm half-smile"),
 # VERDICT
 (60.55, "W", True,  ["N_SIX"], "the golden ninja standing victorious on the field, warm sunset light"),
 (61.80, "M", False, ["L_BASE"], "the straw-hat man back to normal, kneeling, grinning, holding his hat"),
 (62.95, "CU", False, ["L_BASE"], "close-up of the straw-hat man's grin, a cut on his cheek"),
 (63.50, "FX", True, ["L_HAKI"], "a black haki punch landing, huge impact burst"),
 (64.05, "CU", False, ["L_G5"], "the white form laughing, quick flash of memory"),
 (64.85, "CU", False, ["N_SIX"], "the golden ninja taking a deep breath, glow pulsing"),
 (65.55, "W", False, ["N_SIX"], "the golden ninja with a towering golden aura reaching the clouds"),
 (66.30, "W", False, ["N_BASE"], "an army of blond ninjas lined up behind him across the field"),
 (67.05, "M", True,  ["N_BASE", "L_BASE"], "a pile of blond ninjas dogpiling the straw-hat man"),
 (68.25, "W", False, ["N_BASE", "L_BASE"], "both fighters standing side by side on the misty field, grinning, battered"),
 (68.80, "CU", False, ["N_BASE"], "the blond ninja pointing straight at the camera, grinning"),
 (69.35, "CU", False, ["L_BASE"], "the straw-hat man pointing straight at the camera, grinning"),
 (70.00, "W", False, ["N_BASE", "L_BASE"], "both fighters walking away across the field toward the hazy horizon"),
 (71.00, "W", False, [], "an empty misty field with two new shadowy glowing silhouettes in the far distance"),
]
END = 73.0


def prompt(desc, chars, aspect):
    who = " ".join(f"[{CHAR[c]}]" for c in chars)
    frame = "16:9 widescreen frame." if aspect == "16:9" else "9:16 vertical frame."
    return f"{STYLE} {frame} Scene: {desc}. Characters: {who}".strip()


def main():
    shots = []
    for i, (t, kind, flash, chars, desc) in enumerate(S):
        nxt = S[i + 1][0] if i + 1 < len(S) else END
        shots.append({
            "id": f"k{i+1:03d}", "start": t, "dur": round(nxt - t, 2), "kind": kind, "flash": flash,
            "refs": [c for c in chars if c in SHEETS], "desc": desc,
            "prompt169": prompt(desc, chars, "16:9"),
            "prompt916": prompt(desc, chars, "9:16") if kind in ("CU", "FX") else None,
        })
    sheets = [{"id": k, "label": v, "prompt": SHEET_PROMPT + STYLE + " Character: " + CHAR[k]} for k, v in SHEETS.items()]
    json.dump({"style": STYLE, "chars": CHAR, "sheets": sheets, "shots": shots},
              open(os.path.join(HERE, "keyframes.json"), "w"), indent=1)
    durs = sorted(s["dur"] for s in shots)
    n9 = sum(1 for s in shots if s["prompt916"])
    md = ["# Naruto vs Luffy: Nano Banana keyframe plan", "",
          f"{len(shots)} shots over {END} s, median {durs[len(durs)//2]} s, {sum(s['flash'] for s in shots)} with flash frames, "
          f"{sum(s['kind']=='CU' for s in shots)} close-ups. {len(sheets)} character sheets. {n9} close-ups/impacts also generated in 9:16.", "",
          "## Style lock", "", STYLE, "", "## Character sheets", ""]
    md += [f"- **{s['label']}** (`{s['id']}`): {CHAR[s['id']]}" for s in sheets]
    md += ["", "## Shots", "", "| id | start | dur | kind | flash | refs | shot |", "|---|---|---|---|---|---|---|"]
    md += [f"| {s['id']} | {s['start']:.2f} | {s['dur']:.2f} | {s['kind']} | {'⚡' if s['flash'] else ''} | {', '.join(s['refs'])} | {s['desc']} |" for s in shots]
    open(os.path.join(HERE, "keyframes.md"), "w").write("\n".join(md) + "\n")
    print(md[2])


if __name__ == "__main__":
    main()
