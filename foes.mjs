// THE NEXT SEVEN — the next enemies (1026, Joe: "the next enemies for the levels").
// Names and quoted lines are verbatim from Joe's Detroit gang roster (iCloud ENGINES/GAME SPECIFIC BRAIN/ESCAPE FROM
// DETROIT/Escape_From_Detroit_Last_Option_Gangs_Pitch.txt): the seven nobody had used yet. Spinmom's car is "burned-out"
// here (no brand marks).
//
// Each one's DUEL SIGNATURE is a DRAFT translation of his board trait into the knobs ch() already has (tell / lie_to /
// feint / steadiness / read_skill). No new engine rule: engine.mjs, engine.py and parity are untouched, and none of them
// is in the sonnet LINEUP (which slot, if any, is Joe's call: docs/DETROIT-LORE-REFRESH.md P1). Today they fight in
// THE ROSTER (index.html, key R at HOW MANY?) and walk the levels of the Gunslinger Engine (../gunslinger_engine).
//
//   read   = the one thing the player has to learn about him (shown on THE ROSTER card)
//   street = what he does in the Gunslinger Engine's world (the engine there implements it; DRAFT)
import { ch, GUN, CENTER, WING } from "./engine.mjs";

const f = (name, title, o) => ch(name, title, GUN, o);

export const ZIP_NEUTRON = f("ZIP NEUTRON", "hacked scooters, rigged to blow",
  { steadiness: 0.06, read_skill: 0.35, tell: 1.0, feint: 0.55 });
export const SPINMOM = f("SPINMOM", "a burned-out car stenciled PUBLIC STATEMENT",
  { steadiness: 0.0, read_skill: 0.45, tell: 0.45, lie_to: CENTER, feint: 0.10, pron: "she" });
export const PHOEBE_PHREAK = f("PHOEBE PHREAK", "illegal narrative-enhancement chips",
  { steadiness: 0.03, read_skill: 0.62, tell: 0.80, feint: 0.20, pron: "she" });
export const COUNCILWOMAN_GHOST = f("COUNCILWOMAN GHOST", "a hologram of a former city official",
  { steadiness: -0.02, read_skill: 0.50, tell: 0.35, feint: 0.0, pron: "she" });
export const TOW_TRADER = f("THE TOW TRADER", "a tow truck full of stolen storylines",
  { steadiness: -0.05, read_skill: 0.60, tell: 0.85, feint: 0.15 });
export const DETROIT_JESUS = f("DETROIT JESUS", "the reborn spirit of the city",
  { steadiness: 0.07, read_skill: 0.30, tell: 1.0, feint: 0.0 });
export const BANKRUPTCY_BOY = f("BANKRUPTCY BOY", "survived six personal collapses",
  { steadiness: 0.01, read_skill: 0.66, tell: 0.70, lie_to: WING, feint: 0.25 });

// Display + design notes. `line` = Joe's roster words; `read` and `street` = DRAFT (placeholders until Joe says).
export const NEXT_SEVEN = [
  { char: ZIP_NEUTRON, hat: "zip", glyph: "Z",
    line: "Slings hacked electric scooters rigged to explode on contact.",
    read: "honest eyes, all twitch, and the fastest hand in Detroit. don't bite; be quick.",
    street: "rides a scooter: two steps a turn." },
  { char: SPINMOM, hat: "spin", glyph: "S",
    line: "Her child was fake. Her posts are real.",
    read: "her eyes post LEVEL whether it's true or not. trust the shoulder, never the face.",
    street: "OPTICS EMERGENCY: while she can see you, she is a camera." },
  { char: PHOEBE_PHREAK, hat: "chip", glyph: "F",
    line: "Augmented with illegal narrative-enhancement chips.",
    read: "she reads your record like a feed. break your pattern or she guards it.",
    street: "rolls a d6 every turn she's awake; on a 6 she swaps places with someone in the street." },
  { char: COUNCILWOMAN_GHOST, hat: "ghost", glyph: "G",
    line: "A hologram of a former city official, running campaigns out of memory archives. Can fake votes.",
    read: "a hologram's eyes are static: they go anywhere. no twitch. read the shoulder, late.",
    street: "cameras can't see her and neither can you past three steps. kill her once and the votes get recounted: she comes back." },
  { char: TOW_TRADER, hat: "tow", glyph: "W",
    line: "Drives a tow truck full of stolen storylines. Can salvage fallen players' assets.",
    read: "slow on the draw, sharp on the read. beat him to it and he's yours.",
    street: "drives to the men you've dropped and tows them off. a towed man comes back with the next contract." },
  { char: DETROIT_JESUS, hat: "halo", glyph: "J",
    line: "Claims to be the reborn spirit of the city. Boosts Clean play, but might be a scam.",
    read: "his eyes never lie and he never twitches. the scam is how fast he is.",
    street: "never walks to you. meet him CLEAN (no gut shots) and he'll bless you: Trace down. or it's a scam." },
  { char: BANKRUPTCY_BOY, hat: "debt", glyph: "$",
    line: "Survived six personal collapses. Knows how to cheat the Algorithm, but it's watching him.",
    read: "the best reader on the street; when his eyes lie, they look low.",
    street: "the Algorithm watches him: wherever he stands is a camera eye. drop him once and he gets back up (collapse number seven)." },
];
export const NEXT_BY_NAME = Object.fromEntries(NEXT_SEVEN.map(x => [x.char.name, x]));
