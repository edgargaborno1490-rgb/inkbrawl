"""Trace the owner's sprite sheets (reference/sprites/*-sheet.png) into vector sprites for the 3D arena.

Each sheet = 8 poses (2 rows x 4): idle, punch, kick, hit, fly, ko, run, win.
For each pose: black ink lines, white body fill (everything enclosed by the lines), grey details (cap shine).
The sheet's own grey floor shadows are dropped (the arena draws its own). Output: sprites.js
Usage: python3 trace_sprites.py   (needs potrace, numpy, scipy, Pillow)
"""
import json, os, re, subprocess, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, '..', '..', 'reference', 'sprites')
POSES = ['idle', 'punch', 'kick', 'hit', 'fly', 'ko', 'run', 'win']
PARTNERS = {'trainer'}  # sheets where each pose has a companion drawn beside the character (merged per grid cell)
UP = 3  # upscale before tracing for smoother curves

def potrace_paths(mask):
    """Trace a boolean mask with potrace; return SVG path 'd' strings in mask pixel coordinates."""
    if not mask.any():
        return ''
    img = Image.fromarray(np.where(mask, 0, 255).astype(np.uint8)).resize((mask.shape[1] * UP, mask.shape[0] * UP), Image.LANCZOS)
    img = img.point(lambda v: 0 if v < 128 else 255).convert('1')
    with tempfile.TemporaryDirectory() as td:
        bmp, svg = os.path.join(td, 'm.bmp'), os.path.join(td, 'm.svg')
        img.save(bmp)
        subprocess.run(['potrace', bmp, '-s', '-o', svg, '--turdsize', '6', '--alphamax', '1.1', '--opttolerance', '0.3', '--flat'], check=True)
        txt = open(svg).read()
    g = re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>', txt, re.S)
    paths = ''.join(re.findall(r'd="([^"]+)"', g.group(2)))
    return f'<g transform="scale({1 / UP}) {g.group(1)}"><path d="{paths}"/></g>'

def trace_sheet(name):
    im = np.asarray(Image.open(os.path.join(REF, f'{name}-sheet.png')).convert('L')).astype(np.int16)
    ink = im < 110                      # black lines
    free = ~ink
    lab, n = ndimage.label(free)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])))
    border.discard(0)                   # label 0 = ink lines; a drawing touching the edge is not 'outside'
    outside = np.isin(lab, list(border))
    body = ~outside                     # lines + everything they enclose
    grey = body & ~ink & (im < 225)     # grey details inside the drawing (cap shine)
    comp, m = ndimage.label(body)
    sizes = ndimage.sum(np.ones_like(comp), comp, range(1, m + 1))
    big = [i + 1 for i, s in enumerate(sizes) if s > 6000]
    anchor_mask = {}
    if name in PARTNERS:                # character + partner (husky) per pose: one figure per grid cell
        H, W = im.shape
        cell = lambda c: (int(c[0] * 2 // H), int(c[1] * 4 // W))
        groups = {}
        for b in big:
            groups.setdefault(cell(ndimage.center_of_mass(comp == b)), []).append(b)
        for bs in groups.values():      # merge all big pieces of a cell into its largest (the character)
            bs.sort(key=lambda b: -sizes[b - 1])
            anchor_mask[bs[0]] = comp == bs[0]          # foot anchor = the character alone, not the partner
            for extra in bs[1:]:
                comp[comp == extra] = bs[0]
        big = [bs[0] for bs in groups.values()]
    if len(big) > 8:                    # a separate big piece (sword, headband tail): the 8 largest are the characters
        big = sorted(big, key=lambda b: -sizes[b - 1])[:8]
    cents = {b: ndimage.center_of_mass(comp == b) for b in big}
    dist_to = {b: ndimage.distance_transform_edt(comp != b) for b in big}
    owner = np.zeros_like(comp)
    for i in range(1, m + 1):           # effect marks belong to the nearest character in the same row band
        if i in big:
            owner[comp == i] = i; continue
        mark = comp == i
        if not mark.any():              # merged into a character above
            continue
        dists = {b: dist_to[b][mark].min() for b in big}         # pixel distance from the mark to each character
        best = min(big, key=dists.get)
        g = dists[best]
        if g < 130 and (g < 70 or mark.sum() > 120):            # tiny far-off specks are stray marks from a neighbour
            owner[mark] = best
    order = sorted(big, key=lambda b: (cents[b][0] > im.shape[0] / 2, cents[b][1]))  # row by row, left to right
    assert len(order) == 8, f'{name}: found {len(order)} characters, expected 8'
    out = {}
    for pose, b in zip(POSES, order):
        mine = owner == b
        main = comp == b if pose == 'fly' else anchor_mask.get(b, comp == b)   # flying: partner stays on the floor
        ys, xs = np.nonzero(mine)
        y0, y1, x0, x1 = max(0, ys.min() - 4), ys.max() + 5, max(0, xs.min() - 4), xs.max() + 5   # clamp at the sheet edge
        sl = (slice(y0, y1), slice(x0, x1))
        mys, mxs = np.nonzero(main)
        foot_y = mys.max()                                    # anchor: bottom centre of the body
        foot_x = mxs[mys >= foot_y - 8].mean()
        out[pose] = {
            'w': int(x1 - x0), 'h': int(y1 - y0), 'ax': float(foot_x - x0), 'ay': float(foot_y - y0),
            'top': float(mys.min() - y0),
            'fill': potrace_paths(mine[sl] & body[sl]),
            'grey': potrace_paths(mine[sl] & grey[sl]),
            'ink': potrace_paths(mine[sl] & ink[sl]),
        }
        print(name, pose, out[pose]['w'], 'x', out[pose]['h'])
    return out

GRIDS = {   # extra sheets: 8 named pieces in a 2x4 grid; every mark goes to the grid cell it sits in
    'husky': (['cmd', 'cheer', 'dummy', 'run', 'leap', 'bite', 'tug', 'down'], 'row'),   # trainer's husky vs the bite dummy
    'forest': (['pine', 'pine_small', 'tree', 'bush', 'post', 'stump', 'rock', 'grass'], 'main'),  # scenery
}

def trace_grid(name):
    """Anchor 'main' = bottom centre of the biggest piece; 'row' = cell centre on the row's ground line,
    so pieces keep their drawn positions relative to each other (the dummy stays where it stands)."""
    poses, mode = GRIDS[name]
    im = np.asarray(Image.open(os.path.join(REF, f'{name}-sheet.png')).convert('L')).astype(np.int16)
    H, W = im.shape
    ink = im < 110
    lab, n = ndimage.label(~ink)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))); border.discard(0)
    body = ~np.isin(lab, list(border))
    grey = body & ~ink & (im < 225)
    comp, m = ndimage.label(body)
    sizes = ndimage.sum(np.ones_like(comp), comp, range(1, m + 1))
    cells = np.full(comp.shape, -1)
    cell_of = lambda i: (lambda c: int(c[0] * 2 // H) * 4 + int(c[1] * 4 // W))(ndimage.center_of_mass(comp == i))
    big = {i: cell_of(i) for i in range(1, m + 1) if sizes[i - 1] > 3000}
    near = {i: ndimage.distance_transform_edt(comp != i) for i in big}
    for i in range(1, m + 1):
        if sizes[i - 1] < 40: continue
        c = big.get(i)
        if c is None:                   # a mark (speed line, dust puff, sweat): it belongs to the nearest big piece
            c = cell_of(i)
            if any(v == c for v in big.values()):
                c = big[min(big, key=lambda b: near[b][comp == i].min())]
        cells[comp == i] = c
    out = {}
    for k, pose in enumerate(poses):
        mine = cells == k
        ys, xs = np.nonzero(mine)
        assert len(ys), f'{name}: cell {k} ({pose}) is empty'
        y0, y1, x0, x1 = max(0, ys.min() - 4), ys.max() + 5, max(0, xs.min() - 4), xs.max() + 5
        sl = (slice(y0, y1), slice(x0, x1))
        if mode == 'row':
            row = cells // 4 == k // 4
            foot_y = np.nonzero(row)[0].max(); foot_x = (k % 4 + .5) * W / 4
        else:
            ids, cnt = np.unique(comp[mine], return_counts=True)
            main = comp == ids[cnt.argmax()]
            mys, mxs = np.nonzero(main); foot_y = mys.max(); foot_x = mxs[mys >= foot_y - 8].mean()
        out[pose] = {'w': int(x1 - x0), 'h': int(y1 - y0), 'ax': float(foot_x - x0), 'ay': float(foot_y - y0),
                     'top': float(ys.min() - y0), 'fill': potrace_paths(mine[sl] & body[sl]),
                     'grey': potrace_paths(mine[sl] & grey[sl]), 'ink': potrace_paths(mine[sl] & ink[sl])}
        print(name, pose, out[pose]['w'], 'x', out[pose]['h'])
    return out

sprites = {n: trace_sheet(n) for n in ['capguy', 'tee', 'gorilla', 'caveman', 'samurai', 'ninja', 'trainer']}
sprites.update({n: trace_grid(n) for n in GRIDS})
with open(os.path.join(HERE, 'sprites.js'), 'w') as f:
    f.write('// Generated by trace_sprites.py from reference/sprites/*-sheet.png. Do not edit by hand.\n')
    f.write('const SPRITES = ' + json.dumps(sprites) + ';\n')
print('wrote sprites.js', os.path.getsize(os.path.join(HERE, 'sprites.js')) // 1024, 'KB')
