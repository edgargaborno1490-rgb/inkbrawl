#!/usr/bin/env python3
"""Offline forced alignment of a known script to the voiceover with PocketSphinx.

Fallback for tools/transcribe.py when the Whisper model can't be downloaded (no access to huggingface.co).
The PocketSphinx wheel ships its English acoustic model, so nothing is fetched at run time.

  python tools/align_sphinx.py --project projects/<slug> [--script projects/<slug>/input/script.txt]
      [--lex "naruto=N AA R UW T OW" ...]

Keeps the script's exact words (with punctuation) and writes timeline/words.json, sentences.json, transcript.txt.
"""
import argparse, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(__file__))
from common import load_json, norm_word, sentences_from_words, write_timeline  # noqa: E402

# Pronunciations for names the CMU dictionary lacks (anime names come up a lot on this channel).
LEX = {
    "naruto": "N AA R UW T OW", "luffy": "L AH F IY", "luffy's": "L AH F IY Z",
    "chakra": "CH AA K R AH", "haki": "HH AA K IY", "kizaru": "K IY Z AA R UW",
    "kurama": "K UH R AA M AH", "kurama's": "K UH R AA M AH Z",
    "rasenshuriken": "R AA S EH N SH UH R IH K EH N", "snakeman": "S N EY K M AE N",
    "rasengan": "R AA S EH N G AA N", "truthseeking": "T R UW TH S IY K IH NG", "sasuke": "S AA S K EY", "gojo": "G OW JH OW",
    "zoro": "Z AO R OW", "susanoo": "S UW S AA N OW", "itachi": "IY T AA CH IY",
}


def pcm16k(path):
    return subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                          check=True, capture_output=True).stdout


def guess_phones(word):
    """Crude letter-to-phone fallback for unknown words (better than failing)."""
    m = {"a": "AA", "e": "EH", "i": "IY", "o": "OW", "u": "UW", "y": "IY", "b": "B", "c": "K", "d": "D",
         "f": "F", "g": "G", "h": "HH", "j": "JH", "k": "K", "l": "L", "m": "M", "n": "N", "p": "P", "q": "K",
         "r": "R", "s": "S", "t": "T", "v": "V", "w": "W", "x": "K S", "z": "Z"}
    return " ".join(m[c] for c in word if c in m)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project", required=True)
    ap.add_argument("--script")
    ap.add_argument("--audio")
    ap.add_argument("--lex", nargs="*", default=[], help='extra pronunciations, "word=PH ON ES"')
    a = ap.parse_args()
    from pocketsphinx import Decoder, get_model_path

    cfg = load_json(os.path.join(a.project, "config.json"))
    audio = a.audio or os.path.join(a.project, cfg.get("voiceover", "audio/voiceover.mp3"))
    if not os.path.exists(audio):
        audio = os.path.join(a.project, "audio", os.path.basename(cfg.get("voiceover", "")))
    script = a.script or os.path.join(a.project, "input", "script.txt")
    raw_toks = open(script, encoding="utf-8").read().split()
    toks = [t for t in raw_toks if norm_word(t)]

    lex = dict(LEX)
    for kv in a.lex:
        k, v = kv.split("=", 1)
        lex[k.strip().lower()] = v.strip()
    dic = set()
    for line in open(os.path.join(get_model_path(), "en-us", "cmudict-en-us.dict"), encoding="utf-8"):
        dic.add(line.split()[0].split("(")[0])

    dec = Decoder(samprate=16000, bestpath=False, loglevel="FATAL")
    words = [norm_word(t).replace("_", "") for t in toks]
    for w in sorted(set(words)):
        if w not in dic:
            ph = lex.get(w) or guess_phones(w)
            print(f"  added pronunciation: {w} = {ph}")
            dec.add_word(w, ph, True)
    dec.set_align_text(" ".join(words))
    dec.start_utt()
    dec.process_raw(pcm16k(audio), full_utt=True)
    dec.end_utt()
    segs = [s for s in dec.seg() if s.word not in ("<s>", "</s>", "<sil>") and not s.word.startswith("[")]
    if len(segs) != len(toks):
        sys.exit(f"alignment failed: {len(segs)} aligned words vs {len(toks)} script words")
    out = []
    for t, s in zip(toks, segs):
        if norm_word(s.word.split("(")[0]) != norm_word(t):
            sys.exit(f"alignment order mismatch at {t!r} vs {s.word!r}")
        out.append({"word": t, "start": round(s.start_frame / 100, 3), "end": round((s.end_frame + 1) / 100, 3)})
    print(f"script alignment: {len(out)}/{len(toks)} script words force-aligned (100%)")
    write_timeline(os.path.join(a.project, "timeline"), out, sentences_from_words(out), "pocketsphinx-align")


if __name__ == "__main__":
    main()
