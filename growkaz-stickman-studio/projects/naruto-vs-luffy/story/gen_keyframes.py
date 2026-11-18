"""Generate character sheets / keyframes with the Gemini image API (Nano Banana).

The network proxy injects the key (x-goog-api-key) for generativelanguage.googleapis.com; no key here.
  python3 story/gen_keyframes.py sheets [ID ...]          -> keyframes/sheets/<ID>.png
  python3 story/gen_keyframes.py shots k001 k005 ...      -> keyframes/169/<id>.png (refs = approved sheets)
  python3 story/gen_keyframes.py shots916 k002 ...        -> keyframes/916/<id>.png
Options via env: MODEL (default gemini-3.1-flash-image), SIZE (1K/2K), FORCE=1 to redo.
"""
import base64, json, os, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "keyframes")
MODEL = os.environ.get("MODEL", "gemini-3.1-flash-image")
SIZE = os.environ.get("SIZE", "1K")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"


def call(prompt, aspect, refs=()):
    parts = [{"inline_data": {"mime_type": "image/png", "data": base64.b64encode(open(r, "rb").read()).decode()}}
             for r in refs]
    if refs:
        prompt = ("Use the attached character reference sheets for the characters' exact look "
                  "(hair, outfit, colors, brown skin). Do not copy the sheet layout. " + prompt)
    parts.append({"text": prompt})
    body = {"contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"],
                                 "imageConfig": {"aspectRatio": aspect, "imageSize": SIZE}}}
    req = urllib.request.Request(URL, json.dumps(body).encode(), {"Content-Type": "application/json"})
    try:
        res = json.load(urllib.request.urlopen(req, timeout=300))
    except urllib.error.HTTPError as e:
        raise SystemExit(f"HTTP {e.code}: {e.read().decode()[:800]}")
    for c in res.get("candidates", []):
        for p in c.get("content", {}).get("parts", []):
            d = p.get("inlineData") or p.get("inline_data")
            if d:
                return base64.b64decode(d["data"])
    raise RuntimeError("no image returned: " + json.dumps(res)[:800])


def main():
    plan = json.load(open(os.path.join(HERE, "keyframes.json")))
    mode, ids = sys.argv[1], sys.argv[2:]
    if mode == "sheets":
        items = [(s["id"], s["prompt"], "16:9", []) for s in plan["sheets"] if not ids or s["id"] in ids]
        sub = "sheets"
    else:
        key = "prompt169" if mode == "shots" else "prompt916"
        aspect = "16:9" if mode == "shots" else "9:16"
        sub = "169" if mode == "shots" else "916"
        sheet = lambda r: os.path.join(OUT, "sheets", r + ".png")
        items = [(s["id"], s[key], aspect, [sheet(r) for r in s["refs"] if os.path.exists(sheet(r))])
                 for s in plan["shots"] if s[key] and (not ids or s["id"] in ids)]
    os.makedirs(os.path.join(OUT, sub), exist_ok=True)
    for i, p, aspect, refs in items:
        dst = os.path.join(OUT, sub, i + ".png")
        if os.path.exists(dst) and not os.environ.get("FORCE"):
            continue
        img = call(p, aspect, refs)
        open(dst, "wb").write(img)
        print("ok", dst, flush=True)


if __name__ == "__main__":
    main()
