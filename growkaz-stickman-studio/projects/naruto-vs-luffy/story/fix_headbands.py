"""Free, local fix: paint out any engraved symbol on Naruto's silver forehead-protector plate in clip frames.

  python3 story/fix_headbands.py build/clipframes            (in place, all beats)
  python3 story/fix_headbands.py in.jpg out.jpg              (one frame, for testing)
How: silver plate = low-saturation light-grey blob that is wider than tall with yellow hair right above/around it.
Inside that plate (eroded, so the plate's own outline stays), every non-silver pixel is an engraving -> inpainted
with the surrounding steel. Golden-form plates are handled by still-picture overrides instead (see build_shots.py).
"""
import os, sys
import cv2
import numpy as np


def fix(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    silver = ((S < 60) & (V >= 135) & (V <= 248)).astype(np.uint8)
    orange = ((H >= 5) & (H <= 17) & (S > 150) & (V > 150)).astype(np.uint8)
    yellow = ((H >= 15) & (H <= 35) & (S > 60) & (V > 160)).astype(np.uint8)
    m = cv2.morphologyEx(silver, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    out = img.copy(); fixed = 0
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 250 or a > img.shape[0] * img.shape[1] * 0.08 or h < 8: continue
        if a / (w * h) < 0.45: continue
        if 1.3 <= w / h <= 5.5:          # forehead plate: yellow hair just above it
            y0, x0, x1 = max(0, y - int(1.2 * h)), max(0, x - int(0.3 * w)), min(img.shape[1], x + w + int(0.3 * w))
            if y0 >= y or yellow[y0:y, x0:x1].mean() < 0.18: continue
        elif 0.6 <= w / h <= 1.6 and a < img.shape[0] * img.shape[1] * 0.01 and h >= 14:   # round sleeve patch on the jacket
            Y0, Y1, X0, X1 = max(0, y - h), min(img.shape[0], y + 2 * h), max(0, x - w), min(img.shape[1], x + 2 * w)
            ring = orange[Y0:Y1, X0:X1].mean(), (V[Y0:Y1, X0:X1] < 70).mean()
            if ring[0] < 0.03 or ring[0] + ring[1] < 0.3: continue
            comp = (lab == i).astype(np.uint8); filled = comp.copy()
            cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(filled, cnts, -1, 1, thickness=cv2.FILLED)
            inner = cv2.erode(filled, np.ones((5, 5), np.uint8)).astype(bool)
            if inner.sum() < 30 or V[inner].std() < 12: continue          # plain patch: leave it
            out[inner] = np.median(out[inner], axis=0).astype(np.uint8); fixed += 1
            continue
        else: continue
        comp = (lab == i).astype(np.uint8)
        filled = comp.copy()
        cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(filled, cnts, -1, 1, thickness=cv2.FILLED)
        k = max(3, int(min(w, h) * 0.12)) | 1
        inner = cv2.erode(filled, np.ones((k, k), np.uint8))
        marks = (inner & (1 - silver)).astype(np.uint8)
        if marks.sum() < 6: continue
        marks = cv2.dilate(marks, np.ones((3, 3), np.uint8))
        out = cv2.inpaint(out, marks * 255, max(3, int(h * 0.15)), cv2.INPAINT_TELEA); fixed += 1
    # round sleeve patch (spiral crest): own pass with a looser grey mask and no closing, so it doesn't merge with the sky
    grey = ((S < 75) & (V >= 120) & (V <= 240)).astype(np.uint8)
    grey = cv2.morphologyEx(grey, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n2, lab2, st2, _ = cv2.connectedComponentsWithStats(grey, 8)
    for i in range(1, n2):
        x, y, w, h, a = st2[i]
        if not (14 <= h <= 160 and 0.6 <= w / h <= 1.7): continue
        comp = (lab2 == i).astype(np.uint8); filled = comp.copy()
        cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(filled, cnts, -1, 1, thickness=cv2.FILLED)
        fa = filled.sum()
        if fa / (w * h) < 0.62 or fa / (w * h) > 0.9: continue        # roughly a disc (pi/4 = 0.785)
        per = cv2.arcLength(cnts[0], True); circ = 4 * np.pi * fa / (per * per + 1e-6)
        if circ < 0.55: continue
        Y0, Y1, X0, X1 = max(0, y - h), min(img.shape[0], y + 2 * h), max(0, x - w), min(img.shape[1], x + 2 * w)
        jacket = orange[Y0:Y1, X0:X1].mean() + (V[Y0:Y1, X0:X1] < 75).mean()
        if jacket < 0.35 or orange[Y0:Y1, X0:X1].mean() < 0.02: continue
        inner = cv2.erode(filled, np.ones((5, 5), np.uint8)).astype(bool)
        if inner.sum() < 30 or V[inner].std() < 14: continue
        out[inner] = np.median(out[inner], axis=0).astype(np.uint8); fixed += 1
    return out, fixed


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1].endswith(".jpg"):
        o, f = fix(cv2.imread(sys.argv[1])); cv2.imwrite(sys.argv[2], o, [cv2.IMWRITE_JPEG_QUALITY, 92]); print("plates fixed:", f)
    else:
        root = sys.argv[1]; tot = 0
        for g in sorted(os.listdir(root)):
            d = os.path.join(root, g); c = 0
            for f in sorted(os.listdir(d)):
                p = os.path.join(d, f); o, k = fix(cv2.imread(p))
                if k: cv2.imwrite(p, o, [cv2.IMWRITE_JPEG_QUALITY, 92]); c += 1
            print(g, "frames touched:", c, flush=True); tot += c
        print("total frames touched:", tot)
