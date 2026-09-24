// CLEVELAND BOB — engine, JS port of engine.py. Bit-exact to the Python source of truth
// (proven by web/parity.mjs). The RNG-call ORDER and every short-circuit must match Python
// exactly, or the seeded odds diverge. Keep this file a faithful mirror of engine.py.
import { PyRandom } from "./pyrandom.mjs";

// ---- RULES ----
export const HEAD = "HEAD", CENTER = "CENTER", WING = "WING";
export const STRONG = "STRONG", OFF = "OFF";
export const GRAZE = "GRAZE", KILL = "KILL", WINGED = "WINGED", MISFIRE = "MISFIRE";
export const LANES = [HEAD, CENTER, WING], STANCES = [STRONG, OFF];

export function resolveStrike(attack, read) {
  if (attack === read) return GRAZE;
  return attack === WING ? WINGED : KILL;
}
export function resolveWhoa(aSt, aLane, rSt, rLane) {
  const s = aSt === rSt, l = aLane === rLane;
  if (s && l) return MISFIRE;
  if (!s && !l) return KILL;
  return WINGED;
}

// weapon labels (POV words); GUN/BAT change only the words
export const GUN = { name: "REVOLVER", lanes: { HEAD: "the dome piece", CENTER: "center mass", WING: "the wing" } };
export const BAT = { name: "BARBED BAT", lanes: { HEAD: "the skull", CENTER: "the ribs", WING: "the arm" } };
export const label = (w, lane) => w.lanes[lane] || lane;

// Character: weapon + ONE signature (no stat soup)
const ch = (name, title, weapon, o = {}) => ({
  name, title, weapon,
  steadiness: o.steadiness || 0, read_skill: o.read_skill || 0,
  winged_second: !!o.winged_second, wing_kills: !!o.wing_kills,
});
export const BOB = ch("CLEVELAND BOB", "Anders & Partners, Accounting", GUN, { steadiness: 0.03, read_skill: 0.55, winged_second: true });
export const MARSHAL = ch("THE MARSHAL", "Hope County, retired", GUN, { steadiness: -0.02, read_skill: 0.65 });
export const BATTER = ch("THE BATTER", "came down the interstate", BAT, { steadiness: -0.03, wing_kills: true });

function _most(seq) {                            // most-common; ties -> earliest (matches engine.py)
  if (!seq.length) return null;
  let best = seq[0], bestC = -1;
  for (const x of seq) { const c = seq.filter(y => y === x).length; if (c > bestC) { bestC = c; best = x; } }
  return best;
}

// ---- CONTROLLERS ----
export class AIController {
  get is_human() { return false; }
  reflex(char, rng) { return Math.max(0.0, rng.uniform(0.05, 0.35) - char.steadiness); }
  attack_lane(char, oppReads, rng) {
    const common = _most(oppReads);
    if (common && rng.random() < 0.5) return rng.choice(LANES.filter(l => l !== common));
    return rng.choice(LANES);
  }
  defend_read(char, oppAttacks, rng) {
    const common = _most(oppAttacks);
    if (common && rng.random() < (char.read_skill || 0.4)) return common;
    return rng.choice(LANES);
  }
  want_whoa(char, can, rng) { return can && rng.random() < 0.45; }
  whoa(char, rng) { return [rng.choice(STANCES), rng.choice(LANES)]; }
  whoa_read(char, rng) { return [rng.choice(STANCES), rng.choice(LANES)]; }
}

export class SkilledController extends AIController {   // the skill ceiling (matches engine.py)
  reflex(char, rng) { return Math.max(0.0, rng.uniform(0.02, 0.16) - char.steadiness); }
  defend_read(char, oppAttacks, rng) {
    const c = _most(oppAttacks);
    return (c && rng.random() < 0.9) ? c : rng.choice(LANES);
  }
  want_whoa(char, can, rng) { return can && rng.random() < 0.3; }
}

export class Side {
  constructor(char, ctrl) { this.char = char; this.ctrl = ctrl; this.alive = true; this.winged = false; this.whoa_available = true; this.attacks = []; this.reads = []; }
}

// ---- ENGINE ----
export class Engine {
  constructor(seed, present) { this.rng = new PyRandom(seed); this.present = present || (() => {}); this.last_duel_exchanges = 0; }
  STALL_CAP = 64;

  _resolve(attacker, lane, read) {
    const out = resolveStrike(lane, read);
    if (out === WINGED && attacker.char.wing_kills) return KILL;
    return out;
  }
  _land(reader, out) {
    if (out === KILL) { reader.alive = false; return true; }
    if (out === WINGED) {
      if (reader.winged) { reader.alive = false; return true; }
      reader.winged = true;
    }
    return false;
  }

  exchange(a, b) {
    const ta = a.ctrl.reflex(a.char, this.rng), tb = b.ctrl.reflex(b.char, this.rng);
    let attacker;
    if (ta === tb) attacker = this.rng.choice([a, b]);
    else attacker = ta < tb ? a : b;
    const reader = attacker === a ? b : a;
    this.present("draw", { attacker, reader });

    if (!(attacker.ctrl.want_whoa(attacker.char, attacker.whoa_available, this.rng) && attacker.whoa_available)) {
      const lane = attacker.ctrl.attack_lane(attacker.char, reader.reads, this.rng);
      const read = reader.ctrl.defend_read(reader.char, attacker.attacks, this.rng);
      attacker.attacks.push(lane); reader.reads.push(read);
      const out = this._resolve(attacker, lane, read);
      this.present("strike", { attacker, reader, lane, read, out });
      return this._land(reader, out) ? reader : null;
    }
    // WHOA
    attacker.whoa_available = false;
    const [aSt, aLane] = attacker.ctrl.whoa(attacker.char, this.rng);
    const [rSt, rLane] = reader.ctrl.whoa_read(reader.char, this.rng);
    const out = resolveWhoa(aSt, aLane, rSt, rLane);
    this.present("whoa", { attacker, reader, stance: aSt, lane: aLane, out });
    if (out === KILL) { reader.alive = false; return reader; }
    if (out === MISFIRE) return null;
    if (!(attacker.char.winged_second || this.rng.random() < 0.5)) { this.present("no_second", { attacker }); return null; }
    const lane = attacker.ctrl.attack_lane(attacker.char, reader.reads, this.rng);
    const read = reader.ctrl.defend_read(reader.char, attacker.attacks, this.rng);
    const out2 = this._resolve(attacker, lane, read);
    this.present("second", { attacker, reader, lane, read, out: out2, signature: attacker.char.winged_second });
    return this._land(reader, out2) ? reader : null;
  }

  duel(a, b) {
    this.last_duel_exchanges = 0; let stall = 0;
    while (a.alive && b.alive) {
      a.whoa_available = b.whoa_available = true;
      const dead = this.exchange(a, b);
      this.last_duel_exchanges++;
      if (dead !== null) return dead === a ? b : a;
      if (++stall >= this.STALL_CAP) { const loser = this.rng.choice([a, b]); loser.alive = false; this.present("forced", { loser }); return loser === a ? b : a; }
    }
    return a.alive ? a : b;
  }

  // ---- BANGKOK RULES (the 2-player versus mode) — bit-exact mirror of engine.py.
  // Simultaneous volley, make-or-die clock. RNG call order MUST match Python exactly:
  // a.attack, a.read, b.attack, b.read; appends after; resolution/landing use no rng.
  bangkok_volley(a, b) {
    const a_lane = a.ctrl.attack_lane(a.char, b.reads, this.rng);
    const a_read = a.ctrl.defend_read(a.char, b.attacks, this.rng);
    const b_lane = b.ctrl.attack_lane(b.char, a.reads, this.rng);
    const b_read = b.ctrl.defend_read(b.char, a.attacks, this.rng);
    a.attacks.push(a_lane); a.reads.push(a_read);
    b.attacks.push(b_lane); b.reads.push(b_read);
    const out_a = this._resolve(a, a_lane, b_read);
    const out_b = this._resolve(b, b_lane, a_read);
    const b_died = this._land(b, out_a);
    const a_died = this._land(a, out_b);
    this.present("volley", { a, b, a_lane, a_read, out_a, b_lane, b_read, out_b, a_died, b_died });
    return [a_died, b_died];
  }

  bangkok_duel(a, b, shots = BANGKOK_SHOTS) {
    this.last_duel_exchanges = 0;
    for (let i = 0; i < shots; i++) {
      const [a_died, b_died] = this.bangkok_volley(a, b);
      this.last_duel_exchanges++;
      if (a_died || b_died) {
        if (a_died && b_died) { this.present("double", { a, b }); return null; }
        return a_died ? b : a;
      }
    }
    if (a.winged !== b.winged) {
      const loser = a.winged ? a : b;
      this.present("forfeit", { loser });
      return loser === a ? b : a;
    }
    this.present("forfeit_double", { a, b });
    return null;
  }
}

// ---- STRUCTURE: the sonnet ----
export const DECISIONS_PER_STAGE = 4;
export const SONNET_LENGTH = 3 * DECISIONS_PER_STAGE + 2;   // 14
export const STAGES = [["DEAD-EYE", "for FAMILY"], ["THE RECORD", "for SURVIVAL & FOOD"], ["THE COUNT", "for GLADIATOR COUNTS"]];

export function hunter(beatN) {
  return new Side(ch(`HUNTER ${beatN}`, "sent by the record", GUN,
    { steadiness: Math.min(0.05, 0.004 * beatN), read_skill: Math.min(0.60, 0.30 + 0.025 * beatN) }), new AIController());
}

export function couplet(eng, bob) {
  const moment = new Side(ch("THE MOMENT", "the crowd, the chamber", GUN, { read_skill: 0.50 }), new AIController());
  let wins = 0;
  for (let i = 0; i < 2; i++) {
    const lane = bob.ctrl.attack_lane(bob.char, moment.reads, eng.rng);
    const read = moment.ctrl.defend_read(moment.char, bob.attacks, eng.rng);
    bob.attacks.push(lane); moment.reads.push(read);
    if (resolveStrike(lane, read) === KILL) wins++;
  }
  return wins >= 1 ? "THE MAN" : "THE CHAMBER";
}

export function runSonnet(bobCtrl, seed) {
  const eng = new Engine(seed);
  const bob = new Side(BOB, bobCtrl);
  let cleared = 0;
  for (let si = 0; si < STAGES.length; si++) {
    bob.whoa_available = true;
    for (let bi = 0; bi < DECISIONS_PER_STAGE; bi++) {
      const dead = eng.exchange(bob, hunter(si * DECISIONS_PER_STAGE + bi + 1));
      if (dead === bob) return [cleared, "DIED"];
      cleared++;
    }
  }
  return [cleared + 2, couplet(eng, bob)];
}

// ---- STRUCTURE: BANGKOK RULES (the 2-player versus mode) — mirror of engine.py ----
export const BANGKOK_SHOTS = 3;        // shot clock per round — make-or-die
export const BANGKOK_WINS = 2;         // first to 2 clean wins takes the match
export const BANGKOK_ROUND_CAP = 7;    // washes don't count → sudden death, but bounded

export function bangkokRound(eng, p1, p2) {
  p1.winged = p2.winged = false;
  p1.alive = p2.alive = true;
  return eng.bangkok_duel(p1, p2);
}

export function bangkokMatch(p1Ctrl, p2Ctrl, p1Char = BOB, p2Char = BATTER, seed) {
  const eng = new Engine(seed);
  const p1 = new Side(p1Char, p1Ctrl), p2 = new Side(p2Char, p2Ctrl);
  let w1 = 0, w2 = 0;
  for (let n = 1; n <= BANGKOK_ROUND_CAP; n++) {
    const winner = bangkokRound(eng, p1, p2);
    if (winner === p1) w1++;
    else if (winner === p2) w2++;
    if (w1 >= BANGKOK_WINS || w2 >= BANGKOK_WINS) break;
  }
  const winner = w1 > w2 ? 1 : w2 > w1 ? 2 : null;
  return [w1, w2, winner];
}

// the Bangkok skill ceiling — a SHOOTER (lethal lanes only, aim off the guard). Mirror of engine.py.
export class BangkokShooter extends AIController {
  attack_lane(char, oppReads, rng) {
    const LETHAL = [HEAD, CENTER];
    const common = _most(oppReads);
    const choices = LETHAL.filter(l => l !== common);
    const pool = choices.length ? choices : LETHAL;
    if (common && rng.random() < 0.85) return rng.choice(pool);
    return rng.choice(LETHAL);
  }
}
