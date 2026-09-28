// CLEVELAND BOB — engine, JS port of engine.py. Bit-exact to the Python source of truth
// (proven by web/parity.mjs). The RNG-call ORDER and every short-circuit must match Python
// exactly, or the seeded odds diverge. Keep this file a faithful mirror of engine.py.
import { PyRandom } from "./pyrandom.mjs";

// ---- RULES ----
export const HEAD = "HEAD", CENTER = "CENTER", WING = "WING";
export const STRONG = "STRONG", OFF = "OFF";
export const GRAZE = "GRAZE", KILL = "KILL", WINGED = "WINGED", MISFIRE = "MISFIRE";
export const LANES = [HEAD, CENTER, WING], STANCES = [STRONG, OFF];

export const DRAW_LO = 0.25, DRAW_HI = 0.55;   // the CPU's draw window (s) — human-sized
export const WINGED_SLOW = 0.08;                 // a wounded man draws slower
export const FALSE_START = Infinity;             // fire during "steady..." and you've given him the draw
export const FEINT_COST = 0.04;                  // Bob's unbought shoulder feint: slower AND open low (a wing kills)

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
// + THE BODY IS THE INTERFACE: tell (eyes honest this often; null = no tell), lie_to (where lying
//   eyes go), feint (false twitch before the draw), showboat (can WHOA!). Mirrors engine.py.
export const ch = (name, title, weapon, o = {}) => ({
  name, title, weapon,
  steadiness: o.steadiness || 0, read_skill: o.read_skill || 0,
  winged_second: !!o.winged_second, wing_kills: !!o.wing_kills,
  tell: o.tell === undefined ? 1.0 : o.tell, lie_to: o.lie_to || null, feint: o.feint || 0, showboat: !!o.showboat,
});
export const BOB = ch("CLEVELAND BOB", "Anders & Partners, Accounting", GUN, { steadiness: 0.03, read_skill: 0.55, winged_second: true, showboat: true });
export const MARSHAL = ch("THE MARSHAL", "Hope County, retired", GUN, { steadiness: -0.02, read_skill: 0.65, tell: 0.65, feint: 0.30 });
export const BATTER = ch("THE BATTER", "came down the interstate", BAT, { steadiness: -0.03, wing_kills: true, tell: 0.85 });

const _h = (name, title, tell, feint, steadiness, read_skill, lie_to = null) =>
  ch(name, title, GUN, { steadiness, read_skill, tell, lie_to, feint });
// THE LINEUP — stage 1 is a visual tutorial: eyes carry info / trust the eyes over the body / the info can lie.
export const H1_SCARED = _h("HUNTER 1", "scared stiff",            1.00, 0.00, -0.08, 0.30);
export const H2_QUIET  = _h("HUNTER 2", "all nerves, honest eyes", 1.00, 0.45, -0.02, 0.35);
export const H3_LIAR   = _h("HUNTER 3", "looks high, shoots low",  0.55, 0.15, -0.05, 0.40, HEAD);
export const H4_STARE  = _h("HUNTER 4", "the stare",               0.75, 0.60,  0.02, 0.45);
export const H5        = _h("HUNTER 5", "sent by the record",      0.75, 0.30,  0.02, 0.45);
export const H7        = _h("HUNTER 7", "sent by the record",      0.70, 0.35,  0.03, 0.50);
export const H8        = _h("HUNTER 8", "sent by the record",      0.70, 0.35,  0.03, 0.50);
export const H10       = _h("HUNTER 10", "sent by the record",     0.65, 0.40,  0.04, 0.55);
export const H11       = _h("HUNTER 11", "sent by the record",     0.65, 0.40,  0.04, 0.55);
export const SEVEN_JOHN   = _h("SEVEN-JOHN", "the one still standing", 0.75, 0.00, 0.02, 0.45);
export const SEVEN_JOHN_2 = _h("SEVEN-JOHN", "the other one",          0.75, 0.00, 0.02, 0.45);
export const PRESIDENT = ch("THE PRESIDENT", "of Michigan", GUN, { read_skill: 0.50 });
export const PRESIDENTS_MAN = _h("THE PRESIDENT'S MAN", "his security", 0.85, 0.15, -0.03, 0.50);
export const PHOTOGRAPHER = ch("THE PHOTOGRAPHER", "HEY BOB, SMILE!", GUN, { read_skill: 0.50, tell: null });

function _most(seq) {                            // most-common; ties -> earliest (matches engine.py)
  if (!seq.length) return null;
  let best = seq[0], bestC = -1;
  for (const x of seq) { const c = seq.filter(y => y === x).length; if (c > bestC) { bestC = c; best = x; } }
  return best;
}

// ---- CONTROLLERS ----
export class AIController {
  get is_human() { return false; }
  reflex(char, rng) { return Math.max(0.0, rng.uniform(DRAW_LO, DRAW_HI) - char.steadiness); }
  attack_lane(char, oppReads, rng) {
    const common = _most(oppReads);
    if (common && rng.random() < 0.5) return rng.choice(LANES.filter(l => l !== common));
    return rng.choice(LANES);
  }
  defend_read(char, oppAttacks, rng, tell = null) {      // the floor ignores the eyes (guards by habit)
    const common = _most(oppAttacks);
    if (common && rng.random() < (char.read_skill || 0.4)) return common;
    return rng.choice(LANES);
  }
  want_whoa(char, can, rng) { return can && char.showboat && rng.random() < 0.45; }
  whoa(char, rng) { return [rng.choice(STANCES), rng.choice(LANES)]; }
  whoa_read(char, rng) { return [rng.choice(STANCES), rng.choice(LANES)]; }
  bites(char, rng) { return rng.random() < Math.max(0.03, 0.9 - 1.3 * (char.read_skill || 0.0)); }
  want_feint(char, rng) { return char.showboat && rng.random() < 0.20; }
  pick_target(char, rng) { return rng.random() < 0.25; }
  spin_again(char, bullets, rng) { return rng.random() < 0.5; }
}

export class SkilledController extends AIController {   // the skill ceiling (matches engine.py)
  reflex(char, rng) { return Math.max(0.0, rng.uniform(0.22, 0.36) - char.steadiness); }
  defend_read(char, oppAttacks, rng, tell = null) {
    if (tell !== null && rng.random() < 0.9) return tell;
    const c = _most(oppAttacks);
    return (c && rng.random() < 0.9) ? c : rng.choice(LANES);
  }
  want_whoa(char, can, rng) { return can && char.showboat && rng.random() < 0.3; }
  bites(char, rng) { return rng.random() < 0.08; }
  want_feint(char, rng) { return false; }
  pick_target(char, rng) { return false; }
  spin_again(char, bullets, rng) { return bullets === 1; }
}

export class Side {
  constructor(char, ctrl) { this.char = char; this.ctrl = ctrl; this.alive = true; this.winged = false; this.whoa_available = true; this.lethal_wing = false; this.exposed = false; this.attacks = []; this.reads = []; }
}

// ---- ENGINE ----
export class Engine {
  constructor(seed, present) { this.rng = new PyRandom(seed); this.present = present || (() => {}); this.last_duel_exchanges = 0; }
  STALL_CAP = 64;

  _resolve(attacker, lane, read, reader = null) {
    const out = resolveStrike(lane, read);
    if (out === WINGED && (attacker.char.wing_kills || attacker.lethal_wing || (reader !== null && reader.exposed))) return KILL;
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

  // the EYES (mirror of engine.py _tell): honest `tell` of the time, else lie to lie_to / anywhere else.
  _tell(attacker, lane) {
    const t = attacker.char.tell;
    let eyes;
    if (t === null) eyes = null;
    else if (t >= 1.0 || this.rng.random() < t) eyes = lane;
    else if (attacker.char.lie_to !== null && attacker.char.lie_to !== lane) eyes = attacker.char.lie_to;
    else eyes = this.rng.choice(LANES.filter(l => l !== lane));
    this.present("tell", { attacker, lane: eyes });
    return eyes;
  }
  // the BODY: a false twitch; if it baits the mark, the mark false-starts.
  _feint(feinter, mark) {
    let tries;
    if (feinter.char.showboat) tries = feinter.ctrl.want_feint(feinter.char, this.rng);
    else tries = !!feinter.char.feint && this.rng.random() < feinter.char.feint;
    if (!tries) return null;
    this.present("feint", { feinter, mark });
    if (mark.ctrl.bites(mark.char, this.rng)) { this.present("false_start", { side: mark }); return "bit"; }
    if (feinter.char.showboat) { feinter.exposed = true; this.present("feint_miss", { feinter }); }
    return "miss";
  }

  exchange(a, b, alt = null, first = null) {
    let attacker;
    a.exposed = b.exposed = false;
    if (first === null) {
      let ta = a.ctrl.reflex(a.char, this.rng), tb = b.ctrl.reflex(b.char, this.rng);
      if (a.winged) ta += WINGED_SLOW;
      if (b.winged) tb += WINGED_SLOW;
      if (this._feint(b, a) === "bit") ta = FALSE_START;
      const fa = this._feint(a, b);
      if (fa === "bit") tb = FALSE_START;
      else if (fa === "miss" && a.char.showboat) ta += FEINT_COST;
      if (ta === tb) attacker = this.rng.choice([a, b]);
      else attacker = ta < tb ? a : b;
    } else attacker = first;
    const reader = attacker === a ? b : a;
    this.present("draw", { attacker, reader });

    if (!(attacker.ctrl.want_whoa(attacker.char, attacker.whoa_available, this.rng) && attacker.whoa_available)) {
      if (alt !== null && alt.alive && attacker === a && a.ctrl.pick_target(a.char, this.rng)) {
        alt.alive = false; this.present("alt_kill", { attacker: a, target: alt }); return alt;
      }
      const lane = attacker.ctrl.attack_lane(attacker.char, reader.reads, this.rng);
      const tell = this._tell(attacker, lane);
      const read = reader.ctrl.defend_read(reader.char, attacker.attacks, this.rng, tell);
      attacker.attacks.push(lane); reader.reads.push(read);
      const out = this._resolve(attacker, lane, read, reader);
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
    const read = reader.ctrl.defend_read(reader.char, attacker.attacks, this.rng, this._tell(attacker, lane));
    const out2 = this._resolve(attacker, lane, read, reader);
    this.present("second", { attacker, reader, lane, read, out: out2, signature: attacker.char.winged_second });
    return this._land(reader, out2) ? reader : null;
  }

  // TWO MEN AT ONCE (THE SEVEN-JOHNS) — mirror of engine.py exchange_pair. Ties go to Bob (index 0).
  exchange_pair(bob, j1, j2) {
    let tb = bob.ctrl.reflex(bob.char, this.rng);
    const t1 = j1.ctrl.reflex(j1.char, this.rng);
    const t2 = j2.ctrl.reflex(j2.char, this.rng);
    if (bob.winged) tb += WINGED_SLOW;
    const order = [[tb, 0, bob], [t1, 1, j1], [t2, 2, j2]]
      .sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : x[1] - y[1]));
    this.present("draw_pair", { order: order.map(o => o[2]) });
    for (const [, , who] of order) {
      if (who === bob) {
        for (const j of [j1, j2]) {
          if (j.alive) {
            const lane = bob.ctrl.attack_lane(bob.char, j.reads, this.rng);
            const read = j.ctrl.defend_read(j.char, bob.attacks, this.rng, this._tell(bob, lane));
            bob.attacks.push(lane); j.reads.push(read);
            const out = this._resolve(bob, lane, read);
            this.present("strike", { attacker: bob, reader: j, lane, read, out });
            this._land(j, out);
          }
        }
      } else if (who.alive) {
        const lane = who.ctrl.attack_lane(who.char, bob.reads, this.rng);
        const read = bob.ctrl.defend_read(bob.char, who.attacks, this.rng, this._tell(who, lane));
        who.attacks.push(lane); bob.reads.push(read);
        const out = this._resolve(who, lane, read);
        this.present("strike", { attacker: who, reader: bob, lane, read, out });
        if (this._land(bob, out)) return bob;
      }
    }
    return null;
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

// ---- STRUCTURE: the sonnet — 4 stages x 3 duels + the couplet = 14 (mirror of engine.py) ----
export const DECISIONS_PER_STAGE = 3;
export const STAGES = [["DEAD-EYE", "for FAMILY"], ["THE RECORD", "for SURVIVAL & FOOD"],
                       ["THE COUNT", "for GLADIATOR COUNTS"], ["THE LAST OPTION", "for a WAY OUT"]];
export const SONNET_LENGTH = STAGES.length * DECISIONS_PER_STAGE + 2;   // 14
export const LINEUP = [[H1_SCARED, H2_QUIET, H3_LIAR], [H4_STARE, H5, MARSHAL], [H7, H8, BATTER], [H10, H11, null]];
export const RETURN_BEAT = 1;
export const PAIR_SLOT = [3, 2];

// who's across the street: a survivor takes the return slot; the stage-4 boss is a PAIR (array of 2 Sides)
export function beatOpponent(si, bi, pool, present) {
  if (si >= 1 && bi === RETURN_BEAT && pool.length) {
    const back = pool.shift();
    (present || (() => {}))("returns", { side: back });
    return back;
  }
  if (si === PAIR_SLOT[0] && bi === PAIR_SLOT[1]) return [new Side(SEVEN_JOHN, new AIController()), new Side(SEVEN_JOHN_2, new AIController())];
  return new Side(LINEUP[si][bi], new AIController());
}
// one line of the poem; true if Bob died. A single man who walks away is still out there (queued).
export function fightBeat(eng, bob, opp, pool) {
  if (Array.isArray(opp)) return eng.exchange_pair(bob, opp[0], opp[1]) === bob;
  const dead = eng.exchange(bob, opp);
  if (dead === bob) return true;
  if (opp.alive) pool.push(opp);
  return false;
}

// MY LAST RITES — RUSSIAN ROULETTE (mirror of engine.py). Bullets side by side in 6 chambers.
// 1 bullet: SPIN is right (1/6 vs 1/5). 3 bullets: DON'T spin (1/3 vs 3/6). A quiet man gets 1, a legend 3.
export const CHAMBERS = 6, LEGEND_LOUD = 3;
export const bulletsFor = legend => (legend >= LEGEND_LOUD ? 3 : 1);
export function roulette(eng, bob, bullets, present = () => {}) {
  const chambers = [0, 1, 2, 3, 4, 5];
  let pos = eng.rng.choice(chambers);
  let live = pos < bullets;
  present("pull", { n: 1, bullets, pos, live, spun: true });
  if (live) return false;
  const spin = bob.ctrl.spin_again(bob.char, bullets, eng.rng);
  pos = spin ? eng.rng.choice(chambers) : (pos + 1) % CHAMBERS;
  live = pos < bullets;
  present("pull", { n: 2, bullets, pos, live, spun: spin });
  return !live;
}
export function couplet(eng, bob, bullets = 1) {
  return roulette(eng, bob, bullets, eng.present) ? "THE MAN" : "THE CHAMBER";
}

export function runSonnet(bobCtrl, seed) {
  const eng = new Engine(seed);
  const bob = new Side(BOB, bobCtrl);
  let cleared = 0;
  const pool = [];
  for (let si = 0; si < STAGES.length; si++) {
    bob.whoa_available = true;
    for (let bi = 0; bi < DECISIONS_PER_STAGE; bi++) {
      if (fightBeat(eng, bob, beatOpponent(si, bi, pool), pool)) return [cleared, "DIED"];
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
