// CLEVELAND BOB — game layer, JS port of cleveland_bob.py (play_run). Bit-exact to Python
// (proven by web/parity.mjs): same bosses, story beats, on-record RNG, scoring, and the
// legend-tilted couplet. The cab UI drives this; an AI Bob + auto-record reproduces the
// Python descent exactly. Keep the RNG-call order a faithful mirror of cleveland_bob.play_run.
import { Engine, Side, AIController, BOB, MARSHAL, BATTER, GUN, STAGES, DECISIONS_PER_STAGE,
         SONNET_LENGTH, hunter, resolveStrike, GRAZE, KILL } from "./engine.mjs";

const ch = (name, title, weapon, o = {}) => ({ name, title, weapon, steadiness: o.steadiness || 0, read_skill: o.read_skill || 0, winged_second: !!o.winged_second, wing_kills: !!o.wing_kills });

export const STAGE_BOSS = [null, MARSHAL, BATTER];
export const SCORE_DUEL = [100, 250, 500];
export const SCORE_ON_RECORD = 150, SCORE_REACH_TABLE = 1000, SCORE_THE_MAN = 5000, SCORE_THE_CHAMBER = 750;
export const BONUS_BASE = [300, 500];

// non-lethal will-fight vs the President (end of stage 2): win by NOT drawing (hold = GRAZE).
function theMeeting(eng, bob, run) {
  const moment = new Side(ch("THE PRESIDENT", "of Michigan", GUN, { read_skill: 0.50 }), new AIController());
  let holds = 0;
  for (let i = 0; i < 2; i++) {
    const lane = bob.ctrl.attack_lane(bob.char, moment.reads, eng.rng);
    const read = moment.ctrl.defend_read(moment.char, bob.attacks, eng.rng);
    bob.attacks.push(lane); moment.reads.push(read);
    if (resolveStrike(lane, read) === GRAZE) holds++;
  }
  if (holds >= 1) run.surveillance = Math.max(0, run.surveillance - 2);
  else run.legend += 3;
}

// MY LAST RITES — the couplet, ~50/50 tilted by legend (the famous die harder).
export function lastRites(eng, bob, run) {
  const tilt = Math.min(0.85, 0.50 + 0.03 * run.legend);
  const moment = new Side(ch("THE MOMENT", "the crowd, the chamber", GUN, { read_skill: tilt }), new AIController());
  let wins = 0;
  for (let i = 0; i < 2; i++) {
    const lane = bob.ctrl.attack_lane(bob.char, moment.reads, eng.rng);
    const read = moment.ctrl.defend_read(moment.char, bob.attacks, eng.rng);
    bob.attacks.push(lane); moment.reads.push(read);
    if (resolveStrike(lane, read) !== GRAZE) wins++;
  }
  return wins >= 1 ? "THE MAN" : "THE CHAMBER";
}

// hooks: callbacks let the cab render; headless parity passes no-ops + an auto-record policy.
export function playRun(bobCtrl, seed, { autoRecord = null, onRecordAsk = null, hooks = {} } = {}) {
  const eng = new Engine(seed, hooks.present);
  const run = { legend: 0, score: 0, cleared: 0, surveillance: 0, anders_scrubs: 2 };
  const bob = new Side(BOB, bobCtrl);
  const askRecord = onRecordAsk || (() => eng.rng.random() < autoRecord);   // human button OR auto policy

  hooks.coldOpen && hooks.coldOpen();
  for (let si = 0; si < STAGES.length; si++) {
    bob.whoa_available = true;
    hooks.stage && hooks.stage(si, STAGES[si]);
    for (let bi = 0; bi < DECISIONS_PER_STAGE; bi++) {
      run.surveillance += 1;
      const boss = bi === DECISIONS_PER_STAGE - 1 ? STAGE_BOSS[si] : null;
      const opp = boss ? new Side(boss, new AIController()) : hunter(si * DECISIONS_PER_STAGE + bi + 1);
      hooks.beat && hooks.beat(run, opp, !!boss);
      const dead = eng.exchange(bob, opp);
      if (dead === bob) { const r = { ...run, ending: `DIED — stage ${si + 1}, beat ${bi + 1}` }; hooks.gameOver && hooks.gameOver(r); return r; }
      run.cleared += 1; run.score += SCORE_DUEL[si];
      if (askRecord(run)) { run.legend += 1; run.surveillance += 1; run.score += SCORE_ON_RECORD; }
    }
    if (si === 1) theMeeting(eng, bob, run);
    if (si < STAGES.length - 1) {
      if (run.anders_scrubs > 0 && run.surveillance > 0) { run.anders_scrubs -= 1; run.surveillance = Math.max(0, run.surveillance - 3); }
      hooks.bonus && hooks.bonus(si, BONUS_BASE[si]);
      run.score += BONUS_BASE[si];
    }
  }
  run.score += SCORE_REACH_TABLE;
  const ending = lastRites(eng, bob, run);
  run.cleared += 2;
  run.score += ending === "THE MAN" ? SCORE_THE_MAN : SCORE_THE_CHAMBER;
  run.ending = ending;
  hooks.gameOver && hooks.gameOver(run);
  return run;
}
