// I THOUGHT YOU WERE DEAD! — THE ASCII RIG + CUTSCENES + TIMINGS (0928).
// The mechanical test bench AND the sprite-mapping surface: every character is a RIG of NAMED STATES,
// every cutscene is a list of TIMED BEATS, and every millisecond the game waits lives in TIMING.
// When the paintings arrive, each (rig, state) maps to ONE sprite and each scene beat to ONE still —
// the game code never changes. Rules this file keeps (Joe, locked 0928):
//   * EYES ARE NEVER BAKED INTO A BODY FRAME. Every face carries {E}; the eye overlay is gameplay data.
//   * WINGED is a second BASE condition (winged_idle / winged_draw), not bespoke injury animations.
//   * Held drawings, abrupt changes — a filmstrip, not 60fps.
// Presentation only: nothing here touches the engine or its RNG.

// ---------------------------------------------------------------- TIMING (ms unless noted)
export const TIMING = {
  steadyMin: 700,  steadyRand: 1500,   // "steady…" before DRAW! (fire in here = FALSE START)
  breath: 620,                          // idle A <-> idle B (he's alive the whole time)
  twitch: 240,                          // a feint: the false hand-twitch frame
  falseStartCrack: 450, falseStartStare: 700,
  drawTimeout: 1500,                    // no squeeze by now = you never drew
  swayTau: 0.25, swayAmp: 0.055, swaySettled: 0.004, swayShaky: 0.03,    // (s, fraction of scene height); shaky = CRITICAL
  whoaWindow: 600,                      // the lit WHOA! button
  readWindow: 1600, readWindowPair: 1400, readWindowSmile: 1000,
  shoulderAt: 0.55,                     // fraction of the read window when the honest shoulder swings
  firePose: 220,                        // his muzzle flash frame
  hitPose: 380,                         // hit_head / hit_center held before the drop
  freeze: 650,                          // the READ / CLEAN freeze-frame
  bannerBeat: 450,
  cameraLens: 800,                      // DID YOU SEE THAT? — the lens turns toward Bob
  sceneMinBeforeSkip: 250,              // a cutscene beat can't be skipped faster than this
  cylinderTick: 90, cylinderSpins: 14,  // the roulette spin
};

// ---------------------------------------------------------------- EYES (the overlay)
// ˙ ˙ = looking HIGH (your head) · • • = level (center) · . . = LOW (the wing) · ◉ ◉ = straight at Bob.
export const EYES = { idle:"o o", HEAD:"˙ ˙", CENTER:"• •", WING:". .", BOB:"◉ ◉", BLIND:"   ", DEAD:"x x", SHUT:"- -" };
export const EYE_WORD = { HEAD:"↑ high", CENTER:"→ level", WING:"↓ low" };

// ---------------------------------------------------------------- HATS (the per-hunter read at a glance)
const HATS = {
  bare:   "      .-''-.",
  cap:    "     _.===._",
  brim:   "   __.----.__",
  stare:  "      .-==-.",
  seven:  "     _[ 7 ]_",
  earpc:  "      .-''-.)",
  mars:   "      ._==_.",
  hair:   "     .~~~~~.",          // a gunwoman (pron "she") — the template body until her own sprite
};

// ---------------------------------------------------------------- THE HUNTER RIG (the template body)
// Every human opponent is this body + a hat + the eye overlay, until his own sprite exists.
const HUNTER = {
  idleA: String.raw`{H}
      | {E}|
      |  - |
      '-,,-'
     /|████|\
    / |████| \
      |████|╕
      _|    |_
     (__|  |__)`,
  idleB: String.raw`{H}
      | {E}|
      |  - |
      '-,,-'
      /|███|\
     / |███| \
      |████|╕
      _|    |_
     (__|  |__)`,
  twitch: String.raw`{H}
      | {E}|
      |  o |
      '-,,-'
     /|████|\
    / |████|\
      |████|╛╕
      _|    |_
     (__|  |__)`,
  draw: String.raw`{H}
      | {E}|
      |  o |
      '-,,-'
     /|████|\__
    / |████|  (◎)
      |████|
      _|    |_
     (__|  |__)`,
  fire: String.raw`{H}
      | {E}|
      |  O |
      '-,,-'   \|/
     /|████|\__-✶-
    / |████|  (◎)
      |████|   /|\
      _|    |_
     (__|  |__)`,
  winged_idle: String.raw`{H}
      | {E}|
      |  ~ |
      '-,,-'
      \|██▓(
       )██▒|
       |██▒|
      _|   |_
     (__) '-)`,
  winged_draw: String.raw`{H}
      | {E}|
      |  ~ |
      '-,,-'
      \|██▓(__
       )██▒| (◎)
       |██▒|
      _|   |_
     (__) '-)`,
  hit_center: String.raw`{H}
      | {E}|
      |  O |
      '-,,-'
   \  /|█▓█|\  /
     ( |▓✶▓| )
      |████|
      _|    |_
     (__|  |__)`,
  hit_head: String.raw`{H}
   *\  | {E}|  /*
      |  O |
      '-,,-'
     /|████|\
    / |████| \
      |████|
      _|    |_
     (__|  |__)`,
  down: String.raw`
         x   x
          '-,-'
    . _____)V(_____ .
   '                 '
  --- the street takes it ---`,
};

// ---------------------------------------------------------------- BOSSES + SPECIALS (own bodies)
const MARSHAL = {
  idleA: String.raw`      ._==_.
      |{E}|
      |=  =|
     /|[★]|\
  ·==[=|██|=]
      |████|
      |_  _|
     /__||__\ `,
  idleB: String.raw`      ._==_.
      |{E}|
      |=  =|
     /|[★]|\
   ·=[=|██|=]
      |████|
      |_  _|
     /__||__\ `,
  draw: String.raw`      ._==_.
      |{E}|
      |=  =|
     /|[★]|\__
  ·==[=|██| (◎)
      |████|
      |_  _|
     /__||__\ `,
  fire: String.raw`      ._==_.
      |{E}|      \|/
      |=  =|    -✶-
     /|[★]|\__ /|\
  ·==[=|██| (◎)
      |████|
      |_  _|
     /__||__\ `,
  winged_idle: String.raw`      ._==_.
      |{E}|
      |=  =|
     \|[▓]|
   ·=[=|▒█|=)
      |██▒|
      |_  _|
     /__||_\ `,
  winged_draw: String.raw`      ._==_.
      |{E}|
      |=  =|
     \|[▓]|__
   ·=[=|▒█| (◎)
      |██▒|
      |_  _|
     /__||_\ `,
};
const BATTER = {
  idleA: String.raw`  ╪╪═╗  .--.
      \ |{E}|
        | vv|
        |███|≡
       /|███|
        |███|
       _|   |_
      (__| |__)`,
  idleB: String.raw`   ╪╪═╗ .--.
      \ |{E}|
        | vv|
        |███|≡
       /|███|
        |███|
       _|   |_
      (__| |__)`,
  draw: String.raw`╪╪═══╗   .--.
       \ |{E}|
         \| vv|
        |███|≡
       /|███|
        |███|
       _|   |_
      (__| |__)`,
  fire: String.raw`        .--.  ╔══╪╪
        |{E}|//  ✶
        | VV|/
        |███|≡
       /|███|
        |███|
       _|   |_
      (__| |__)`,
  winged_idle: String.raw`  ╪╪═╗  .--.
      \ |{E}|
        | ~~|
        |▓██(
       \|▒██
        |▒██|
       _|   |_
      (__) '_)`,
  winged_draw: String.raw` ╪╪══╗  .--.
      \|{E}|
        | ~~|
        |▓██(
       \|▒██
        |▒██|
       _|   |_
      (__) '_)`,
};
const PHOTOGRAPHER = {
  idleA: String.raw`      .-''-.
     [▣=(◎)]    <- a camera where his face should be
      '-,,-'
     /|████|\
    / |████| \
      |████|
      _|    |_
     (__|  |__)`,
  flash: String.raw`   \  .-''-.  /
  -- [▣=(✺)] --
   /  '-,,-'  \
     /|████|\
    / |████| \
      |████|
      _|    |_
     (__|  |__)`,
  draw: String.raw`      .-''-.
      | {E}|
      |  - |
      '-,,-'   [▣]
     /|████|\__/
    / |████|  (◎)
      |████|
      _|    |_
     (__|  |__)`,
  fire: String.raw`      .-''-.
      | {E}|
      |  - |
      '-,,-'   \|/
     /|████|\__-✶-
    / |████|  (◎)
      |████|   /|\
      _|    |_
     (__|  |__)`,
};
PHOTOGRAPHER.idleB = PHOTOGRAPHER.idleA;
export const PRESIDENT_ART = {
  idle: String.raw`   ___
  |{E}|    THE PRESIDENT
  | - |    of Michigan
 /|[#]|\
  |###|
  |   |
 _|   |_`,
  down: String.raw`
    x x
  ._\_/_.   the President
 '  ###  '  of Michigan
   on the broadcast`,
};

// which rig a character wears (until his own sprite exists), and his hat
const RIGS = { hunter: HUNTER, marshal: MARSHAL, batter: BATTER, photographer: PHOTOGRAPHER };
export function rigFor(char){
  const n = (char && char.name) || "";
  if (n === "THE MARSHAL") return { rig:"marshal", hat:"mars" };
  if (n === "THE BATTER") return { rig:"batter", hat:"bare" };
  if (n === "THE PHOTOGRAPHER") return { rig:"photographer", hat:"bare" };
  if (n === "SEVEN-JOHN" && char.pron !== "she") return { rig:"hunter", hat:"seven" };
  if (n === "THE PRESIDENT'S MAN") return { rig:"hunter", hat:"earpc" };
  if (char && char.pron === "she") return { rig:"hunter", hat:"hair" };
  if (n === "HUNTER 1") return { rig:"hunter", hat:"bare" };
  if (n === "HUNTER 2") return { rig:"hunter", hat:"cap" };
  if (n === "HUNTER 3") return { rig:"hunter", hat:"brim" };
  if (n === "HUNTER 4") return { rig:"hunter", hat:"stare" };
  return { rig:"hunter", hat: ["bare","cap","brim"][(n.length) % 3] };
}
// frame(char, state, eyes) — the ONE lookup the game uses. Missing states fall back sensibly
// (a boss without a hit frame borrows the template's), so a partial sprite set still plays.
export function frame(char, state, eyes){
  const { rig, hat } = rigFor(char);
  const R = RIGS[rig];
  let art = R[state] || HUNTER[state] || (state.startsWith("winged") ? (R.winged_idle || HUNTER.winged_idle) : (R.idleA || HUNTER.idleA));
  const e = eyes && EYES[eyes] !== undefined ? EYES[eyes] : (state.startsWith("winged") || state==="hit_center" || state==="hit_head" ? EYES.DEAD : EYES.idle);
  return art.replace("{H}", HATS[hat]).replace("{E}", e);
}

// ---------------------------------------------------------------- BOB'S HAND (first-person foreground)
export const HAND = { idle:"════╝", aim:"═══╪═▷", recoil:"═══*✦▷", recoil2:"════╝▹", fan:"≡≡≡✦▷✦", hurt:"═~═╝", feint:"══╗╝↘" };

// ---------------------------------------------------------------- CUTSCENE ART
const A = {
  kitchen: String.raw`
     _______________________________
    |  ___      |  .-.   window  .  |
    | |cof|  .--|--(   )--.  sun    |
    |  ‾‾‾   |  |   '-'  |  ~~~     |
    |   ___  |  | ledger |  ___     |
    |  (o o) |  |  $$$$  | (o o)    |
    |  /|█|\ |__|________|_/|▓|\    |
    |___|_|______________|__|_|_____|
         BOB      the table   HER`,
  kitchen_grey: String.raw`
     _______________________________
    |  ___      |  .-.   window  .  |
    | |   |  .--|--(   )--.   ·     |
    |  ‾‾‾   |  |   '-'  |          |
    |        |  |        |          |
    |   /    |  | ledger |          |
    |  /     |__|________|_         |
    |_/___________________\_________|
      the chair, pushed out. coffee, cold.`,
  street: String.raw`
   ▓▓   ▓▓▓    ▓▓  RENCEN  ▓▓    ▓▓▓   ▓▓
   ▓▓ ▓ ▓▓▓ ▓  ▓▓  ▓▓██▓▓  ▓▓  ▓ ▓▓▓ ▓ ▓▓
  ═══════════════════════════════════════
        o                        .-''-.
       /|\          . .          | o o|
       / \        (the street)   /|██|\
  ═══════════════════════════════════════`,
  camera: String.raw`
          ___________
         |  ◉  REC ● |
         |___________|
              ||
       ___    ||    ___
      |cam|===##===|cam|     the lens turns.
                             toward you.`,
  podium: String.raw`
       ╔══════════════════════╗
       ║  SEAL OF THE PRESIDENT ║
       ║      OF  MICHIGAN      ║
       ╚══════════╦═══════════╝
           .-.    ║    .-''-.
          |o o|   ║    | o o|)   his man
          /|#|\   ║    /|██|\
      THE PRESIDENT          `,
  broadcast: String.raw`
   ┌────────────────────────────────┐
   │ ● LIVE   OFFICE OF AUTONOMOUS  │
   │          OVERSIGHT — GREAT LAKES│
   │                                │
   │      x x      THE PRESIDENT     │
   │    ._\_/_.    OF MICHIGAN       │
   │               — DEAD —          │
   │   "DID YOU SEE THAT?"           │
   └────────────────────────────────┘`,
  railyard: String.raw`
       ║        ║        ║        ║
   ════╬════════╬════════╬════════╬════  THE LAST
   ────╫────────╫────────╫────────╫────  OPTION
       ║   ___  ║        ║  ___   ║      TERMINAL
   ════╬══|___|═╬════════╬═|___|══╬════
       ║        ║   ↑    ║        ║
                  the train out`,
  johns: String.raw`
      _[ 7 ]_            _[ 7 ]_
      | o o|              | o o|
      /|██|\              /|██|\
     you know a Seven-John when you see one.
          he's the one still standing.
                there are two.`,
  crowd: String.raw`
   mnhñmnhmñnhmnñhmnhñmnhmñnhmnñhmnhñmnh
   DID YOU SEE THAT?!   DID YOU SEE THAT?!
   mnhñmnhmñnhmnñhmnhñmnhmñnhmnñhmnhñmnh`,
  body: String.raw`
         x   x
          '-,-'      an unfinished sonnet.
    . _____)V(_____ .
   '                 '`,
  wound: String.raw`
     .-''-.
     | o o|   "…you should see the OTHER guy.
     |  ~ |      …he's also dead."
     '-,,-'
            SUBJECT: CLEVELAND, male. FLAGGED.`,
  anders: String.raw`
     ┌──────────────────────────┐
     │ ANDERS & PARTNERS        │
     │ accounting · est. before │
     │ ░░░░ records scrubbed ░░ │
     └──────────────────────────┘`,
};

// ---------------------------------------------------------------- CUTSCENES (timed beats)
// Each beat: { art?, h?, text?, ms, cls? }. {name}/{winged} are filled by the caller (vars).
// ms = how long the beat holds; any key skips after TIMING.sceneMinBeforeSkip.
export const SCENES = {
  cold_open: [
    { h:". . .", text:"DEAD-EYE — slow and warm. a lullaby before it was a theme.", ms:1600 },
    { art:A.kitchen, h:"FRAME ONE", text:"a kitchen. morning light. his wife pours the coffee. an ordinary day for an Anders & Partners man.", ms:3200, cls:"warm" },
    { art:A.kitchen_grey, text:"sirens, far off. the color bleeds out of the room.", ms:2200 },
    { art:A.street, h:"HARD CUT —", text:"a street. a man across from him, hand already moving.", ms:1800 },
    { h:"KILL.", text:"one mismatch. he didn't even try. the look on his face is HORROR, not triumph.", ms:1700, cls:"blood" },
    { art:A.camera, h:"\"DID YOU SEE THAT?!\"", text:"the CITY says it first. already recording. already the wrong man.", ms:2000, cls:"lethal" },
    { h:"I THOUGHT YOU WERE DEAD!", text:"a CLEVELAND BOB story", ms:1800 },
    { art:A.kitchen_grey, text:"…back to the kitchen. the theme folds back to the lullaby, and waits.", ms:2200 },
  ],
  stage1: [ { art:A.street, h:"STAGE 1: DEAD-EYE", text:"he fights for FAMILY. — learn to read people.", ms:2200 } ],
  stage2: [ { art:A.street, h:"STAGE 2: THE RECORD", text:"he fights for SURVIVAL & FOOD. — now they read Bob.", ms:2200 } ],
  stage3: [ { art:A.crowd, h:"STAGE 3: THE COUNT", text:"THE VOLTA. nothing left now but the count.", ms:2600, cls:"gold" } ],
  stage4: [ { art:A.railyard, h:"STAGE 4: THE LAST OPTION", text:"he fights for a WAY OUT. the rail yard at the edge of the city.", ms:2600 } ],
  returns: [
    { art:A.street, h:"a figure walks back into the street —", text:"{name}{winged}", ms:1700 },
    { h:"I THOUGHT YOU WERE DEAD!", text:"you didn't finish it. he did not forget.", ms:1500, cls:"lethal" },
  ],
  camera: [ { art:A.camera, h:"DID YOU SEE THAT?", ms:TIMING.cameraLens, cls:"gold" } ],
  wound: [ { art:A.wound, h:"THE CLEVELAND WOUND", text:"it's not even the right city. it doesn't matter. it sticks.", ms:3000 } ],
  anders: [ { art:A.anders, h:"ANDERS & PARTNERS", text:"\"We're sorry, Bob. It's all we can do. We're dying slowly. You're living in the moment.\"", ms:3000 } ],
  president: [
    { art:A.podium, h:"THE PRESIDENT OF MICHIGAN", text:"\"Don't kill him, Bob. Just… let them see it.\"", ms:2800 },
    { h:"two fights.", text:"his man draws on you. the President stands right there. you could.", ms:2000, cls:"dim" },
  ],
  president_dead: [ { art:A.broadcast, h:"DID YOU SEE THAT?", text:"the President of Michigan, dead on the broadcast. the count loves it. the camera will remember your face.", ms:3200, cls:"lethal" } ],
  president_held: [ { art:A.podium, h:"YOU NEVER AIMED AT THE SUIT", text:"nothing for the cameras. the hunters slow down.", ms:2400 } ],
  johns: [ { art:A.johns, h:"THE SEVEN-JOHNS", text:"one draw. two men. one pull each.", ms:2600 } ],
  the_man: [
    { art:A.crowd, h:"— click.", text:"empty. both times.", ms:1600 },
    { art:A.kitchen, h:"THE MAN", text:"she pulls him from the chamber. back to frame one — the kitchen.", ms:3400, cls:"warm" },
  ],
  the_chamber: [
    { h:"BANG.", ms:1200, cls:"lethal" },
    { art:A.kitchen_grey, h:"THE CHAMBER", text:"the crowd got its count. the man is gone.", ms:3400 },
  ],
  died: [ { art:A.body, h:"DIED", text:"{name}", ms:2400, cls:"lethal" } ],
};

// BOB — seen from across the street (the 2P view: the gunman's player looks AT Bob). Glasses; eyes overlay.
export const BOB_ART = String.raw`      _____
     |     |
    [{L}]-[{R}]      CLEVELAND BOB
     |  - |       Anders & Partners
      \__/
     /|▓▓|\__(◎)
      |▓▓|
      /  \ `;
export function bobFrame(eyes){ const e = (eyes && EYES[eyes] !== undefined ? EYES[eyes] : EYES.idle);
  return BOB_ART.replace("{L}", e[0]).replace("{R}", e[2]); }
