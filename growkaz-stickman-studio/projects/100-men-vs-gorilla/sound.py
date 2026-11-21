"""Sound for 100 Men vs 1 Gorilla: owner's voiceover + sfx-library hits + generated light music (ducked under the
voice), loudness-normalised for TikTok (-14 LUFS), muxed onto out/video-silent.mp4 -> out/100-men-vs-gorilla.mp4.
Usage (from growkaz-stickman-studio/): python3 projects/100-men-vs-gorilla/sound.py
"""
import json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__))
STUDIO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(STUDIO, 'audio'))
from music import render_score          # noqa: E402
from dsp import write_wav               # noqa: E402

LIB = os.path.join(STUDIO, '..', 'sfx-library')
END = 64.0
words = json.load(open(os.path.join(HERE, 'timeline', 'words.json')))['words']
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
def T(word, n=1):
    c = 0
    for w in words:
        if norm(w['word']) == norm(word):
            c += 1
            if c == n: return w['start']
    raise KeyError(word)

K = dict(meet=T('Meet'), stronger1=T('stronger'), fangs=T('fangs'), wave1=T('Wave'), swing=T('swing'), flying=T('flying'),
         wave2=T('Wave', 2), slams=T('slams'), ground=T('ground'), gone=T('Gone'), pile=T('fifty'), over=T('over'),
         stands=T('Then', 2), explodes=T('explodes'), run=T('run'), wins=T('wins'), works=T("Here's"), name=T('name'),
         comment1=T('comment'), levels=T('levels'), stronger2=T('stronger', 2), ten=T('Ten'), fifty=T('Fifty', 2),
         hundred=T('hundred', 4), rematch=T('rematch'), ninja=T('Ninja'), samurai=T('Samurai'), caveman=T('Caveman'),
         anything=T('Anything'), drawn=T('drawn'))

SFX = [  # time, sound, volume
    (0.0, 'drums_1', .55), (0.0, 'whoosh_big_1', .55), (T('One', 2), 'impact_frame_1', .6), (T('Who'), 'stinger_1', .55),
    (K['meet'], 'aura_charge_1', .9), (K['meet'] + .05, 'ground_slam_1', .45), (K['stronger1'], 'punch_heavy_1', .7), (K['fangs'], 'aura_charge_2', .6),
    (K['wave1'], 'kick_combo_1', .45), (K['wave1'], 'whoosh_1', .45), (K['swing'] - .1, 'whoosh_big_2', .6), (K['swing'], 'punch_heavy_1', .95),
    (K['swing'], 'impact_frame_2', .6), (K['flying'], 'kick_1', .95), (K['flying'], 'punch_heavy_2', .7), (K['swing'] + 1.45, 'smoke_pop_multi_1', .5),
    (K['wave2'], 'whoosh_2', .5), (K['wave2'] + .2, 'kick_combo_2', .5), (K['slams'], 'riser_1', .45), (K['ground'], 'ground_slam_2', 1.0),
    (K['ground'], 'boom_1', .9), (K['ground'] + .1, 'rock_crumble_1', .6), (K['ground'] + 1.45, 'smoke_pop_multi_2', .5),
    (K['pile'], 'kick_combo_1', .5), (K['pile'] + .7, 'kick_combo_2', .5), (K['over'], 'heartbeat_1', .9), (K['stands'], 'heartbeat_2', .9),
    (K['stands'], 'rumble_1', .6), (K['explodes'], 'boom_2', 1.0), (K['explodes'], 'shockwave_1', .9), (K['explodes'], 'impact_frame_1', .7),
    (K['explodes'] + 1.5, 'smoke_pop_multi_1', .5), (K['run'], 'whoosh_1', .5), (K['run'] + .2, 'whoosh_2', .45),
    (K['wins'] - .3, 'stinger_2', .9), (K['wins'] - .2, 'gold_aura_1', .5),
    (K['works'], 'whoosh_big_1', .45), (K['levels'], 'gold_aura_2', .6), (K['stronger2'], 'aura_charge_1', .5),
    (K['ten'], 'impact_frame_1', .5), (K['fifty'], 'impact_frame_2', .5), (K['hundred'], 'impact_frame_1', .55),
    (K['rematch'], 'aura_charge_2', .55), (K['rematch'] + .1, 'stinger_1', .6),
    (K['ninja'], 'smoke_pop_1', .45), (K['samurai'], 'smoke_pop_2', .45), (K['caveman'], 'smoke_pop_1', .45), (K['anything'], 'smoke_pop_2', .45),
    (K['drawn'], 'stinger_2', .55),
] + [(K['comment1'] + i * .33 + .5, 'bounce_1' if i % 2 else 'smoke_pop_1', .3) for i in range(9)]

MUSIC = [{"start": 0, "end": K['meet'], "mood": "tension", "intensity": .5},
         {"start": K['meet'], "end": K['wave1'], "mood": "dark", "intensity": .6},
         {"start": K['wave1'], "end": K['wins'] - .3, "mood": "action", "intensity": .85},
         {"start": K['wins'] - .3, "end": K['works'], "mood": "epic", "intensity": .7},
         {"start": K['works'], "end": END, "mood": "playful", "intensity": .5}]

out = os.path.join(HERE, 'out')
music_wav = os.path.join(out, 'music.wav')
write_wav(music_wav, render_score(MUSIC, END, seed=7))
ins, chains = [], []
for i, (t, name, vol) in enumerate(SFX):
    ins += ['-i', os.path.join(LIB, name + '.mp3')]
    chains.append(f'[{i + 3}:a]aformat=channel_layouts=stereo,adelay={int(t * 1000)}:all=1,volume={vol}[s{i}]')
graph = ';'.join(chains) + ';' + ''.join(f'[s{i}]' for i in range(len(SFX))) + f'amix=inputs={len(SFX)}:normalize=0,volume=0.6[sfx];'
graph += ('[1:a]aformat=channel_layouts=stereo,asplit=2[vo][vosc];'
          '[2:a]volume=0.55[mu];[mu][vosc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=350[mud];'
          f'[vo][sfx][mud]amix=inputs=3:normalize=0,alimiter=limit=0.95,apad,atrim=0:{END},loudnorm=I=-14:TP=-1.5:LRA=11[aout]')
final = os.path.join(out, '100-men-vs-gorilla.mp4')
cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(out, 'video-silent.mp4'), '-i', os.path.join(HERE, 'audio', 'voiceover.mp3'),
       '-i', music_wav] + ins + ['-filter_complex', graph, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
       '-ar', '48000', '-t', str(END), '-movflags', '+faststart', final]
subprocess.run(cmd, check=True)
print('wrote', final)
