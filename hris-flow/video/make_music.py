"""Synthesize an original 45-second background track for hris-45s.mp4.

Soft corporate pop in C major at 104 BPM: pad -> arpeggio -> bass -> light drums,
building with the video's scenes, with a chime on each scene change and a fade at the end.
Usage: python3 make_music.py out.wav
"""
import sys, wave
import numpy as np

SR = 44100
DUR = 45.0
BPM = 104
BEAT = 60 / BPM
BAR = 4 * BEAT
N = int(SR * DUR)
t_all = np.arange(N) / SR
SCENES = [0, 5.5, 12, 20, 28, 34.5, 41]

def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)

# Cmaj7, Am7, Fmaj7, G6sus (midi notes, octave 4 voicing)
CHORDS = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 55, 62]]
ROOTS = [36, 33, 29, 31]

def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

def add(buf, start, sig):
    i = int(start * SR)
    if i >= N: return
    j = min(N, i + len(sig))
    buf[i:j] += sig[: j - i]

def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for k in range(len(x)):
        acc = (1 - a) * x[k] + a * acc
        y[k] = acc
    return y

pad = np.zeros(N); arp = np.zeros(N); bass = np.zeros(N); drums = np.zeros(N); fx = np.zeros(N)
rng = np.random.default_rng(7)

n_bars = int(np.ceil(DUR / BAR)) + 1
for b in range(n_bars):
    start = b * BAR
    if start >= DUR: break
    chord = CHORDS[b % 4]
    last = start + BAR >= 41.0
    length = BAR + 0.6 if not last else DUR - start
    n = int(length * SR); t = np.arange(n) / SR
    # pad: softly detuned saw-like tones (few harmonics) with slow swell
    s = np.zeros(n)
    for m in chord + ([chord[0] + 14] if last else []):
        f = hz(m + 12)
        for det in (-0.12, 0.12):
            ff = f * 2 ** (det / 12)
            for h, amp in ((1, 1.0), (2, 0.35), (3, 0.15)):
                s += amp / h * np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28))
    add(pad, start, s * env_adsr(n, 0.5, 0.6) * 0.022)

    # bass from 12s: root on beats 1 and 3
    if start >= 11.9:
        for k in (0, 2):
            bn = int(BEAT * 1.8 * SR); bt = np.arange(bn) / SR; f = hz(ROOTS[b % 4])
            sig = (np.sin(2 * np.pi * f * bt) + 0.3 * np.sin(2 * np.pi * 2 * f * bt)) * np.exp(-bt * 2.2)
            add(bass, start + k * BEAT, sig * env_adsr(bn, 0.01, 0.08) * 0.20)

    # arpeggio from 5.5s: 8th-note plucks over chord tones, one octave up
    if start + BAR > 5.5:
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for k, idx in enumerate(pattern):
            ts = start + k * BEAT / 2
            if ts < 5.5 or ts > 42.6: continue
            f = hz(chord[idx] + 24); pn = int(0.45 * SR); pt = np.arange(pn) / SR
            sig = (np.sin(2 * np.pi * f * pt) + 0.25 * np.sin(2 * np.pi * 2 * f * pt)) * np.exp(-pt * 9)
            vel = 0.075 if k % 2 == 0 else 0.055
            add(arp, ts, sig * env_adsr(pn, 0.003, 0.02) * vel)

    # drums: kick on every beat 20s-41s, hats on off-beats from 28s
    for k in range(4):
        ts = start + k * BEAT
        if 20.0 <= ts < 41.0:
            kn = int(0.3 * SR); kt = np.arange(kn) / SR
            freq = 45 + 75 * np.exp(-kt * 30)
            sig = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-kt * 9)
            add(drums, ts, sig * 0.32)
        th = ts + BEAT / 2
        if 28.0 <= th < 41.0:
            hn = int(0.06 * SR); noise = rng.standard_normal(hn)
            noise = noise - lowpass(noise, 6000)
            add(drums, th, noise * np.exp(-np.arange(hn) / SR * 60) * 0.05)

# chime + soft swell on each scene change
for i, s in enumerate(SCENES[1:]):
    cn = int(1.8 * SR); ct = np.arange(cn) / SR; f = hz([76, 79, 81, 84, 79, 72][i])
    bell = sum(a * np.sin(2 * np.pi * f * r * ct) * np.exp(-ct * d) for r, a, d in ((1, 1, 2.5), (2.76, .35, 4), (5.4, .15, 7)))
    add(fx, s, bell * 0.05)
    sn = int(0.9 * SR); noise = lowpass(rng.standard_normal(sn), 2500)
    swell = noise * np.linspace(0, 1, sn) ** 2 * 0.06
    add(fx, s - 0.9, swell)

mix = pad + arp + bass + drums + fx
fade = np.ones(N)
fi, fo = int(1.2 * SR), int(2.5 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
mix *= fade
mix = np.tanh(mix * 1.2) / np.tanh(1.2)            # gentle glue / limiting
mix = mix / np.max(np.abs(mix)) * 0.7               # headroom; it sits under the visuals
# simple stereo width: pad/arp slightly offset between channels
right = np.roll(mix, int(0.012 * SR)) * 0.5 + mix * 0.5
stereo = np.stack([mix, right], axis=1)
pcm = (stereo * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", sys.argv[1])
