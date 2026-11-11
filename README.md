> **STATUS: WORKING BUILD, LIVE ON GITHUB PAGES. Not a finished game.**
> - The game: <https://anderspartnersck.github.io/ITHOUGHTYOUWEREDEAD/>
> - The MEAN STREETS desktop cabinet: <https://anderspartnersck.github.io/ITHOUGHTYOUWEREDEAD/cab_desktop.html>
>
> The duel engine works and the whole run plays start to finish. The art is partly done.

# I THOUGHT YOU WERE DEAD!

A Cleveland Bob story. An arcade tragedy set in Detroit.

A Castle Killscreen game by **Anders & Partners**. The finished Castle Killscreen titles are
**[SUCK UP](https://anderspartnersck.github.io/suck-up/3d.html?arcade)** and
**[ONE-TIMER: THE HIGH TABLE](https://anderspartnersck.github.io/high-table/)**. This repo exists so the
work can happen in the open, not because the work is done.

## About

A fight with **no combos and no cheese**. The whole fight is a read. Bob, an accountant, finds out when
the world ends that he is very good at killing people in duels, and the half of him that's still a
normal man cannot survive the notoriety.

**You are meant to lose.** Most runs die before the end. Legend pays in points but tilts your ending
toward death, so the high score and the good ending pull against each other.

Four stages of three duels, the President, and a last roulette. A kill removes a man. A gut shot
(the low lane) wounds him and costs you DISHONOR. A block postpones him: he walks back in later.
After stages 1, 2 and 3 you pick **one of two perks**.

## How to play

Click or press any key at INSERT COIN. After HOW TO PLAY, the **HOW MANY?** screen asks:

| Key | Mode |
|---|---|
| **1** (or any other key) | One player: the story |
| **2** | Two players: THE TOURNAMENT |
| **B** | Two players: BANGKOK RULES |
| **R** | THE ROSTER: one practice bout against any gunman (ESC back) |

**One player.** Watch the man. His body says *when*: fire during *steady…* and it's a false start.
His eyes say *where*, but not always honestly.

| Action | Keyboard | Mouse | Gamepad |
|---|---|---|---|
| Aim (moves the crosshair on DRAW!; picks your guard when he's first) | **↑ / W / 1** head · **C / 2** center · **↓ / S / 3** gut | point | stick or d-pad up / down |
| Fire | **Space** | left-click | A (bottom button) |
| Sell your shoulder (feint) during *steady…* | **F** | middle-click | X (left button) |
| WHOA! (fan the hammer, right after you win the draw) | **E** or **Q** | right-click | B (right button) |
| DID YOU SEE THAT? | **Y** yes · **N** / Enter / Space no | tap the button | |
| Pick a perk | **1** / **2** | tap the button | |
| Pause (between duels only; a live draw can't pause) | **Esc** or **P** | | Start |

The pause menu has RESUME, HOW TO PLAY and QUIT TO TITLE.

**Two players, one screen.** P2 plays every gunman in the lineup, then the seats swap and whoever's Bob
gets further wins. Picks are hidden keypresses, so one screen is fair.

| Seat | Draw | Aim / guard (head · center · gut) | Feint |
|---|---|---|---|
| P1 | Left Shift | W · S · X | Q |
| P2 | Right Shift or Enter | I · K · M | U |

Gamepads 1 and 2 also work (standard layout): stick up/down aims, A draws, Y aims center, X feints.

## The pages

- **[index.html](index.html)** (the bare URL): the game, edge to edge.
- **[cab_desktop.html](cab_desktop.html)**: the MEAN STREETS cabinet. A slow push into the cabinet art, the logo, then the live
  game over the control deck. `?view=cab` shows the whole cabinet, `?nointro` skips the intro, `?bare` shows the screen alone.
  `cab.html` and `cab_1up.html` just redirect here.

## What still needs work

- Art is partial. The cold open, one gunman (the laughing cop), Bob's gun hand, the eye close-ups and the big-moment stills
  are painted. The rest of the cast is still drawn in ASCII.
- Built for a desktop browser with a mouse or keyboard (or a gamepad).
- The high-score table is kept only in your own browser.

## Rebuilding this bundle

This repo is **generated**. Never edit it directly. Everything here is built from the private Castle
Killscreen tree, and this README's source is `tools/PAGES_README.md` there:

```
cd "ANDERS CASTLE KILLSCREEN/I THOUGHT YOU WERE DEAD"
python3 tools/build_pages.py
```

The bundler shrinks art by **resolution, not by pruning**: these engines build most asset paths by
string concatenation, so a static scan can't see what's used, and a wrongly-cut sprite doesn't error.
It just silently fails to draw.

## Credits

Created by **Joseph Coleman**, with Claude, ChatGPT, and Blender.
Anders & Partners.

<sub>Generated from the private Castle Killscreen tree. Edit there, not here.</sub>
