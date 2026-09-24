# I THOUGHT YOU WERE DEAD!

A Cleveland Bob story. An arcade tragedy set in Detroit.

## ▶ [PLAY IT IN YOUR BROWSER](https://anderspartnersck.github.io/ITHOUGHTYOUWEREDEAD/)

A Castle Killscreen game by **Anders & Partners**.

> ### ⚠︎ Working build — not a finished game
>
> The duel engine works and the shape is there. The cabinet art and the run's middle stretch are the unfinished parts.
>
> The finished Castle Killscreen titles are **[SUCK UP](https://anderspartnersck.github.io/suck-up/)**
> and **[ONE-TIMER: THE HIGH TABLE](https://anderspartnersck.github.io/high-table/)**. This repo
> exists so the work can happen in the open, not because the work is done.

## About

A fight with **no combos and no cheese** — the whole fight is a read. Bob, an
accountant, discovers when the world ends that he is preternaturally good at
killing people in duels, and the half of him that's still a normal man cannot
survive the notoriety.

**You are meant to lose.** It's a descent: about 96% of runs die before the table.
A good run is the rare thing the crowd comes to see. Legend pays in points but
tilts your ending toward death — the high-score chase and the good ending pull
against each other.

## How to play

**W / S** or **↑ / ↓** to read and commit; **Y / N** answer the prompts; **C** continues.
The game tells you what it wants on screen — it's built to be picked up cold.

The bare URL boots the game. The MEAN STREETS cabinet, with the baked panel art,
is at **[cab_desktop.html](cab_desktop.html)**.

## What still needs work

- The ASCII cabinet is still on the roadmap; the desktop cab is the finished-looking one.
- Only the cabinet plates are shipped as art — the game itself draws procedurally.

## Rebuilding this bundle

This repo is **generated** — never edit it directly. Everything here is built from the
private Castle Killscreen tree:

```
cd "ANDERS CASTLE KILLSCREEN/I THOUGHT YOU WERE DEAD"
python3 tools/build_pages.py
```

The bundler shrinks art by **resolution, not by pruning**: these engines build most asset
paths by string concatenation, so a static scan can't see what's used, and a wrongly-cut
sprite doesn't error — it just silently fails to draw.

## Credits

Created by **Joseph Coleman**, with Claude and ChatGPT.
Anders & Partners.

<sub>Generated from the private Castle Killscreen tree. Edit there, not here.</sub>
