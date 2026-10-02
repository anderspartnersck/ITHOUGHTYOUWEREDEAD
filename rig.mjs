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
  animFrame: 70,                        // painted sprite animations: the draw (3 frames), per frame
  fallFrame: 420,                       // down → down2 (the fall), and winged_hit → winged_idle
  sceneMinBeforeSkip: 250,              // a cutscene beat can't be skipped faster than this
  cylinderTick: 90, cylinderSpins: 14,  // the roulette spin
};

// ---------------------------------------------------------------- EYES (the overlay)
// ^ ^ = looking HIGH (your head) · • • = level (center) · v v = LOW (the wing) · ◉ ◉ = straight at Bob.
// (0928 QA: the first glyphs ˙ ˙ / . . were nearly invisible at play size — the eyes ARE the read.)
export const EYES = { idle:"o o", HEAD:"^ ^", CENTER:"• •", WING:"v v", BOB:"◉ ◉", BLIND:"   ", DEAD:"x x", SHUT:"- -" };
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
// Each beat: { img?, art?, h?, text?, ms, cls? }. img = the painted still (sprites/attract/, cut from Joe's 0928
// sheet); art = the ASCII fallback shown if the image is missing or fails. {name}/{winged} are filled by the caller (vars).
// ms = how long the beat holds; any key skips after TIMING.sceneMinBeforeSkip.
export const SCENES = {
  // THE COLD OPEN (1002, Joe's order): kitchen work → popcorn for a film → PRESIDENT IN COMA on TV → BANG outside → a purple flash
  // (foreshadowing) → the rear-ender at the light turns into road rage, Bob sees it → the cop sees Bob see it →
  // the throw and the gun at his feet, LAYERED on PLATE 1 → the city goes LIVE → his family watching → duel 1.
  // A beat with `stage` is a layered shot: a painted plate (slow push) + cutouts; x/y = % of the frame
  // (x = centre, y = feet up from the bottom), h = % of frame height, fx = arc (thrown) | drop (lands) | sway.
  cold_open: [
    { h:". . .", text:"DEAD-EYE — slow and warm. a lullaby before it was a theme.", ms:1600 },
    { img:"sprites/coldopen/kitchen_morning.jpg", art:A.kitchen, h:"FRAME ONE", text:"an ordinary morning for an Anders & Partners man. the books. a note on the fridge: still here.", ms:3400, cls:"warm" },
    { img:"sprites/coldopen/popcorn.jpg", art:A.kitchen, text:"the work can wait. a bowl of popcorn. a film.", ms:2600, cls:"warm" },
    { img:"sprites/coldopen/president_coma.jpg", art:A.camera, h:"BREAKING", text:"the film never starts. the President of Michigan, in a coma.", ms:2800 },
    { stage:{ plate:"sprites/coldopen/popcorn.jpg", dim:true, layers:[
        { src:"sprites/coldopen/bob_couch_spill.png", x:50, y:-4, h:100 } ] },
      art:A.kitchen, h:"BANG.", text:"outside.", ms:1800, cls:"lethal", flash:"white" },
    { img:"sprites/coldopen/kitchen_dusk_flash.jpg", art:A.kitchen_grey, ms:650, flash:"purple" },
    { img:"sprites/coldopen/accident_wide.jpg", art:A.street, text:"a rear-ender at the light on Maple.", ms:2400 },
    { img:"sprites/coldopen/accident_rage.jpg", art:A.street, text:"then it wasn't an accident anymore.", ms:2600, cls:"lethal" },
    { img:"sprites/coldopen/accident_looks.jpg", art:A.street, text:"the cop looks up. he saw Bob see it.", ms:2600 },
    { stage:{ plate:"sprites/plates/plate1.jpg", layers:[
        { src:"sprites/coldopen/cop_laugh.png", x:62, y:30, h:40 },
        { src:"sprites/coldopen/bob_back.png", x:30, y:-12, h:98 } ] },
      art:A.street, text:"he laughs. an accountant. unarmed.", ms:2600 },
    { stage:{ plate:"sprites/plates/plate1.jpg", layers:[
        { src:"sprites/coldopen/cop_laugh.png", x:62, y:30, h:40 },
        { src:"sprites/coldopen/bob_catch.png", x:30, y:-12, h:98 },
        { src:"sprites/coldopen/revolver.png", x:51, y:52, h:8, fx:"arc" } ] },
      art:A.street, text:"\"go on, Bob. catch.\"", ms:2200 },
    { stage:{ plate:"sprites/plates/plate1.jpg", layers:[
        { src:"sprites/duel1c/cop_idleA.png", x:62, y:30, h:40 },
        { src:"sprites/coldopen/bob_reach.png", x:27, y:-14, h:96 },
        { src:"sprites/coldopen/revolver.png", x:50, y:4, h:9, fx:"drop" } ] },
      art:A.street, text:"it lands at his feet. the man across the street is already ready.", ms:2600, cls:"lethal" },
    { img:"sprites/attract/redo_5_drone_live.png", art:A.camera, text:"the city is already recording. LIVE.", ms:2800, cls:"lethal" },
    { img:"sprites/attract/redo_6_kids_watching.png", art:A.kitchen_grey, text:"at home, his family is watching Channel 6.", ms:3200 },
    { h:"I THOUGHT YOU WERE DEAD!", text:"a CLEVELAND BOB story", ms:1800 },
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
    { img:"sprites/attract/redo_1_kitchen.png", art:A.kitchen, h:"THE MAN", text:"she pulls him from the chamber. back to frame one — the kitchen.", ms:3400, cls:"warm" },
  ],
  the_man_alone: [
    { h:"— click.", text:"empty. both times.", ms:1600 },
    { img:"sprites/attract/cold_open_8_empty.png", art:A.kitchen_grey, h:"THE MAN, ALONE", text:"he walks out of the chamber. she saw the gut shots. nobody is waiting.", ms:3600 },
  ],
  the_chamber: [
    { h:"BANG.", ms:1200, cls:"lethal" },
    { img:"sprites/attract/cold_open_8_empty.png", art:A.kitchen_grey, h:"THE CHAMBER", text:"the crowd got its count. the man is gone.", ms:3400 },
  ],
  died: [ { art:A.body, h:"DIED", text:"{name}", ms:2400, cls:"lethal" } ],
};

// BOB — seen from across the street (the 2P view: the gunman's player looks AT Bob). Glasses; eyes overlay.
export const BOB_ART = String.raw`      _____
     |     |
    [{L}]-[{R}]
     |  - |
      \__/
     /|▓▓|\__(◎)
      |▓▓|
      /  \ `;
export function bobFrame(eyes){ const e = (eyes && EYES[eyes] !== undefined ? EYES[eyes] : EYES.idle);
  return BOB_ART.replace("{L}", e[0]).replace("{R}", e[2]); }

// ---------------------------------------------------------------- PAINTED SPRITES (0928: the first sheet)
// A character with an entry here draws his painted frames instead of ASCII; everyone else stays ASCII
// until his sheet arrives. Frames cut by tools/cut_duel_sheet.py; eyes = sockets measured per frame.
export const SPRITES = {
  // (0929) HUNTER 1 = the laughing cop from the cold open, in color — the full turn cycle
  "HUNTER 1": { base:"sprites/duel1c/cop_", meta:"sprites/duel1c/cop.json",
    states:["idleA","twitch","draw1","draw2","draw3","draw","fire","winged_hit","winged_idle","winged_draw",
            "hit_center","hit_head","down","down2"],
    anim:{ draw:["draw1","draw2","draw3","draw"], down:["down","down2"], winged:["winged_hit","winged_idle"] } },
};
export const HAND_SPRITES = { base:"sprites/duel1/hand_", states:["idle","aim","recoil","recoil2","fan","feint","hurt"] };
export const FX_SPRITES = { base:"sprites/duel1/fx_", names:["flash1","flash2","flash3","blood","dust","flashbulb"] };
export const EYE_CLOSEUPS = { base:"sprites/duel1/eyes_", looks:["idle","HEAD","CENTER","WING","BOB","DEAD"] };
