"""Ink Brawl sample sheet: 5 hand-drawn stick men on notebook paper.
Writes samples/sample-stickmen.svg; render to PNG with render_samples.mjs (Playwright)."""
import math, random, os

W, H = 1920, 1080
rnd = random.Random(7)

def wob(points, amp=2.2):
    """Jittered polyline through points, drawn twice for a pen look."""
    out = []
    for pass_ in range(2):
        pts = []
        for (x0, y0), (x1, y1) in zip(points, points[1:]):
            n = max(2, int(math.hypot(x1 - x0, y1 - y0) / 18))
            for i in range(n):
                t = i / n
                pts.append((x0 + (x1 - x0) * t + rnd.uniform(-amp, amp),
                            y0 + (y1 - y0) * t + rnd.uniform(-amp, amp)))
        pts.append((points[-1][0] + rnd.uniform(-amp, amp), points[-1][1] + rnd.uniform(-amp, amp)))
        d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        out.append((d, pass_))
    return out

def path(points, color="#151515", w=7, amp=2.2):
    s = ""
    for d, p in wob(points, amp):
        s += f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{w if p == 0 else w*0.45}" ' \
             f'stroke-linecap="round" stroke-linejoin="round" opacity="{1 if p == 0 else 0.6}"/>'
    return s

def circle(cx, cy, r, color="#151515", w=7, fill="none"):
    pts = []
    start = rnd.uniform(0, 6.28)
    for i in range(0, 380, 12):  # slight overshoot like a pen
        a = start + math.radians(i)
        rr = r + rnd.uniform(-2, 2)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    s = ""
    if fill != "none":
        s += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/>'
    return s + path(pts, color, w, 1.0)

def stickman(ox, oy, pose, color, name, item, face, name_dy=0):
    J = {k: (ox + x, oy + y) for k, (x, y) in pose.items()}
    g = ""
    hx, hy = J["head"]
    # body + limbs
    g += path([J["neck"], J["hip"]])
    g += path([J["neck"], J["le"], J["lh"]])
    g += path([J["neck"], J["re"], J["rh"]])
    g += path([J["hip"], J["lk"], J["lf"]])
    g += path([J["hip"], J["rk"], J["rf"]])
    g += circle(hx, hy, 38, fill="#fbf8ef")
    g += item(J, color)
    g += face(hx, hy)
    # name in marker
    g += (f'<text x="{hx}" y="{hy - 78 + name_dy}" text-anchor="middle" class="name" fill="{color}">{name}</text>')
    return g

# ---------- accent items ----------
def headband(J, c):
    hx, hy = J["head"]
    s = path([(hx - 38, hy - 12), (hx + 38, hy - 16)], c, 12, 1.2)
    s += path([(hx - 36, hy - 12), (hx - 70, hy + 4), (hx - 92, hy - 6)], c, 8)
    s += path([(hx - 36, hy - 10), (hx - 74, hy + 18), (hx - 96, hy + 16)], c, 8)
    return s

def scarf(J, c):
    nx, ny = J["neck"]
    s = path([(nx - 22, ny - 4), (nx + 22, ny + 2)], c, 14, 1.2)
    s += path([(nx + 10, ny), (nx + 60, ny - 30), (nx + 110, ny - 22), (nx + 150, ny - 50)], c, 11)
    return s

def cap(J, c):
    hx, hy = J["head"]
    pts = [(hx - 38, hy - 6)] + [(hx + 38 * math.cos(math.radians(a)), hy - 6 - 40 * math.sin(math.radians(a)))
                                  for a in range(180, -1, -15)]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
    s = f'<path d="{d}" fill="{c}" opacity="0.9"/>'
    s += path([(hx - 10, hy - 8), (hx + 62, hy - 4)], c, 12)
    return s

def bandana(J, c):
    hx, hy = J["head"]
    pts = [(hx - 30, hy + 10), (hx + 30, hy + 10), (hx, hy + 40)]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
    s = f'<path d="{d}" fill="{c}"/>'
    s += path([(hx - 34, hy + 8), (hx + 34, hy + 8)], c, 8)
    return s

def cape(J, c):
    nx, ny = J["neck"]
    hx2, hy2 = J["hip"]
    pts = [(nx - 20, ny), (nx + 20, ny), (hx2 + 70, hy2 + 40), (hx2 + 20, hy2 + 60), (hx2 - 30, hy2 + 50), (hx2 - 70, hy2 + 30)]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
    return f'<path d="{d}" fill="{c}" opacity="0.75"/>' + path(pts + [pts[0]], c, 4)

# ---------- faces ----------
def angry(hx, hy):
    return (path([(hx - 22, hy - 16), (hx - 6, hy - 8)], w=5) + path([(hx + 22, hy - 16), (hx + 6, hy - 8)], w=5)
            + f'<circle cx="{hx-12}" cy="{hy-2}" r="4.5" fill="#151515"/><circle cx="{hx+12}" cy="{hy-2}" r="4.5" fill="#151515"/>'
            + path([(hx - 12, hy + 18), (hx + 12, hy + 16)], w=5))

def grin(hx, hy):
    return (f'<circle cx="{hx-12}" cy="{hy-6}" r="4.5" fill="#151515"/><circle cx="{hx+12}" cy="{hy-6}" r="4.5" fill="#151515"/>'
            + path([(hx - 18, hy + 8), (hx - 6, hy + 20), (hx + 8, hy + 20), (hx + 18, hy + 8)], w=5))

def focused(hx, hy):
    return (path([(hx - 20, hy - 4), (hx - 6, hy - 2)], w=5) + path([(hx + 6, hy - 2), (hx + 20, hy - 4)], w=5)
            + path([(hx - 8, hy + 16), (hx + 8, hy + 16)], w=4))

def shout(hx, hy):
    return (path([(hx - 20, hy - 14), (hx - 6, hy - 6)], w=5) + path([(hx + 20, hy - 14), (hx + 6, hy - 6)], w=5)
            + f'<circle cx="{hx-12}" cy="{hy}" r="4" fill="#151515"/><circle cx="{hx+12}" cy="{hy}" r="4" fill="#151515"/>'
            + f'<ellipse cx="{hx}" cy="{hy+20}" rx="9" ry="7" fill="#151515"/>')

def wink(hx, hy):
    return (f'<circle cx="{hx-12}" cy="{hy-6}" r="4.5" fill="#151515"/>' + path([(hx + 6, hy - 6), (hx + 20, hy - 6)], w=5)
            + path([(hx - 16, hy + 10), (hx, hy + 20), (hx + 16, hy + 10)], w=5))

# ---------- poses (relative to the fighter's anchor) ----------
P_GUARD = dict(head=(0, -230), neck=(0, -190), hip=(0, -80), le=(-40, -150), lh=(-10, -205), re=(45, -150),
               rh=(30, -210), lk=(-40, -30), lf=(-55, 40), rk=(40, -30), rf=(60, 40))
P_KICK = dict(head=(-30, -250), neck=(-20, -210), hip=(10, -110), le=(-70, -220), lh=(-110, -190), re=(25, -240),
              rh=(50, -270), lk=(-10, -40), lf=(-30, 30), rk=(80, -140), rf=(160, -175))
P_CHARGE = dict(head=(0, -235), neck=(0, -195), hip=(0, -85), le=(-60, -170), lh=(-80, -110), re=(60, -170),
                rh=(80, -110), lk=(-55, -30), lf=(-80, 40), rk=(55, -30), rf=(80, 40))
P_PUNCH = dict(head=(25, -225), neck=(15, -185), hip=(-15, -85), le=(-30, -150), lh=(-5, -165), re=(80, -185),
               rh=(150, -190), lk=(40, -35), lf=(70, 40), rk=(-60, -40), rf=(-110, 30))
P_WIN = dict(head=(0, -235), neck=(0, -195), hip=(0, -85), le=(-45, -240), lh=(-60, -295), re=(45, -240),
             rh=(60, -295), lk=(-30, -30), lf=(-40, 40), rk=(30, -30), rf=(40, 40))

def extras_kick(ox, oy):  # speed lines behind kick foot
    return "".join(path([(ox + 60 - i * 8, oy - 200 + i * 18), (ox + 10 - i * 8, oy - 190 + i * 18)], "#151515", 3)
                   for i in range(3))

def extras_charge(ox, oy, c):  # aura scribble + sparks
    s = ""
    for i in range(10):
        a = math.radians(i * 36 + rnd.uniform(-8, 8))
        r1, r2 = 150, 185
        s += path([(ox + r1 * math.cos(a), oy - 130 + r1 * math.sin(a)),
                   (ox + r2 * math.cos(a), oy - 130 + r2 * math.sin(a))], c, 5)
    return s

def extras_punch(ox, oy):  # impact star at fist
    cx, cy = ox + 175, oy - 190
    pts = []
    for i in range(17):
        r = 42 if i % 2 == 0 else 18
        a = math.radians(i * 22.5)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
    return f'<path d="{d}" fill="#ffd23f" stroke="#151515" stroke-width="4"/>'

def extras_win(ox, oy, c):  # crown
    hx, hy = ox, oy - 235
    pts = [(hx - 30, hy - 42), (hx - 34, hy - 80), (hx - 15, hy - 58), (hx, hy - 88), (hx + 15, hy - 58),
           (hx + 34, hy - 80), (hx + 30, hy - 42)]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"
    return f'<path d="{d}" fill="#ffd23f" stroke="#151515" stroke-width="4"/>'

def ground_scribble(ox, oy):
    return path([(ox - 110, oy + 48), (ox - 40, oy + 52), (ox + 30, oy + 46), (ox + 110, oy + 50)], "#8a8a8a", 3, 3)

fighters = [  # (x, pose, color, placeholder name, item, face, extra)
    (230, P_GUARD, "#e63946", "@Fighter_01", headband, angry, None),
    (590, P_KICK, "#1d7fe0", "@Fighter_02", scarf, focused, "kick"),
    (960, P_CHARGE, "#2a9d4b", "@Fighter_03", cap, shout, "charge"),
    (1320, P_PUNCH, "#f28c28", "@Fighter_04", bandana, grin, "punch"),
    (1690, P_WIN, "#8e44ad", "@Fighter_05", cape, wink, "win"),
]

def build(FIGHTERS_ONLY):
    global rnd
    rnd.seed(7)
    base_y = 900
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
           """<defs>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.40  0 0 0 0 0.30  0 0 0 0.10 0"/></filter>
      <style>
        .name{font-family:'Permanent Marker','Comic Sans MS',cursive;font-size:34px}
        .title{font-family:'Permanent Marker','Comic Sans MS',cursive;font-size:76px;fill:#151515}
        .sub{font-family:'Permanent Marker','Comic Sans MS',cursive;font-size:30px;fill:#555}
      </style></defs>""",
           f'<rect width="{W}" height="{H}" fill="#fbf8ef"/>']
    for y in range(150, H, 46):
        svg.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="#a9c6e8" stroke-width="2"/>')
    svg.append(f'<line x1="120" y1="0" x2="120" y2="{H}" stroke="#e88b8b" stroke-width="3"/>')
    for y in (260, 540, 820):  # binder holes
        svg.append(f'<circle cx="55" cy="{y}" r="18" fill="#e6e1d3"/>')
    svg.append(f'<rect width="{W}" height="{H}" filter="url(#grain)"/>')
    svg.append('<text x="960" y="95" text-anchor="middle" class="title">INK BRAWL</text>')
    svg.append(path([(780, 112), (1140, 108)], "#e63946", 6, 2))
    svg.append('<text x="960" y="1050" text-anchor="middle" class="sub">5 sample fighters · one accent color + @name each</text>')

    fg_start = len(svg)
    for x, pose, c, name, item, face, extra in fighters:
        svg.append(f'<ellipse cx="{x}" cy="{base_y + 42}" rx="120" ry="16" fill="#000" opacity="0.18" filter="url(#soft)"/>' if FIGHTERS_ONLY else ground_scribble(x, base_y))
        if extra == "charge":
            svg.append(extras_charge(x, base_y, c))
        if extra == "kick":
            svg.append(extras_kick(x, base_y))
        svg.append(stickman(x, base_y, pose, c, name, item, face, {"charge": -55, "win": -45}.get(extra, 0)))
        if extra == "punch":
            svg.append(extras_punch(x, base_y))
        if extra == "win":
            svg.append(extras_win(x, base_y, c))
    svg.append("</svg>")

    fg = svg[fg_start:]
    return_svg = svg

    if FIGHTERS_ONLY:
        return "\n".join([svg[0], svg[1].replace('<style>', '<filter id="soft"><feGaussianBlur stdDeviation="6"/></filter><style>')] + fg)
    return "\n".join(svg)

d = os.path.dirname(os.path.abspath(__file__))
for only, name in ((False, "sample-stickmen.svg"), (True, "fighters-layer.svg")):
    open(os.path.join(d, name), "w").write(build(only))
    print("wrote", name)
