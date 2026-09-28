// CLEVELAND BOB — game layer, JS port of cleveland_bob.py (play_run). Bit-exact to Python
// (proven by web/parity.mjs): same bosses, story beats, on-record RNG, scoring, and the
// legend-tilted couplet. The cab UI drives this; an AI Bob + auto-record reproduces the
// Python descent exactly. Keep the RNG-call order a faithful mirror of cleveland_bob.play_run.
import { Engine, Side, AIController, BOB, GUN, STAGES, DECISIONS_PER_STAGE, SONNET_LENGTH,
         resolveStrike, GRAZE, KILL, PRESIDENT, PRESIDENTS_MAN, PHOTOGRAPHER, beatOpponent, fightBeat, ch, roulette, bulletsFor, LEGEND_LOUD } from "./engine.mjs";

export const SCORE_DUEL = [100, 250, 500, 750];        // a KILL; a wing pays half, a block a quarter
export const SCORE_ON_RECORD = 150, SCORE_REACH_TABLE = 1000, SCORE_THE_MAN = 5000, SCORE_THE_CHAMBER = 750;
export const BONUS_BASE = [300, 500, 700];
export const SCORE_PRESIDENT = 2000;

// KILL removes a problem (full). WING changes it (half). BLOCK postpones it (a quarter). Mirror of _beat_score.
export function beatScore(si, opp) {
  const men = Array.isArray(opp) ? opp : [opp];
  let tot = 0;
  for (const m of men) tot += !m.alive ? SCORE_DUEL[si] : m.winged ? Math.floor(SCORE_DUEL[si] / 2) : Math.floor(SCORE_DUEL[si] / 4);
  return tot;
}

// THE PRESIDENT — two fights, the President in frame. Shoot HIM and he dies on the broadcast. true = Bob died.
export function thePresident(eng, bob, run) {
  const president = new Side(PRESIDENT, new AIController());
  const whoa = bob.whoa_available;
  bob.whoa_available = false;
  bob.lethal_wing = run.legend >= LEGEND_LOUD;
  for (let i = 0; i < 2; i++) {
    const guard = new Side(PRESIDENTS_MAN, new AIController());
    const dead = eng.exchange(bob, guard, president.alive ? president : null);
    if (dead === bob) { bob.whoa_available = whoa; return true; }
    if (dead === president) { run.president_dead = true; run.legend += 3; run.score += SCORE_PRESIDENT; }
    else if (!guard.alive) run.score += Math.floor(SCORE_DUEL[1] / 2);
  }
  bob.whoa_available = whoa;
  if (!run.president_dead) run.surveillance = Math.max(0, run.surveillance - 2);
  return false;
}

// HEY BOB, SMILE! — the flash takes the draw; no tell. true = Bob died.
export function heyBobSmile(eng, bob, run) {
  bob.lethal_wing = run.legend >= LEGEND_LOUD;
  const shooter = new Side(PHOTOGRAPHER, new AIController());
  return eng.exchange(bob, shooter, null, shooter) === bob;
}

// MY LAST RITES — the roulette; Bob's record loads it (a quiet man 1 bullet, a legend 3).
export function lastRites(eng, bob, run) {
  return roulette(eng, bob, bulletsFor(run.legend), eng.present) ? "THE MAN" : "THE CHAMBER";
}

// hooks: callbacks let the cab render; headless parity passes no-ops + an auto-record policy.
export function playRun(bobCtrl, seed, { autoRecord = null, onRecordAsk = null, hooks = {} } = {}) {
  const eng = new Engine(seed, hooks.present);
  const run = { legend: 0, score: 0, cleared: 0, surveillance: 0, anders_scrubs: 2, president_dead: false };
  const bob = new Side(BOB, bobCtrl);
  const askRecord = onRecordAsk || (() => eng.rng.random() < autoRecord);   // human button OR auto policy

  hooks.coldOpen && hooks.coldOpen();
  const pool = [];
  const die = (ending) => { const r = { ...run, ending }; hooks.gameOver && hooks.gameOver(r); return r; };
  for (let si = 0; si < STAGES.length; si++) {
    bob.whoa_available = true;
    hooks.stage && hooks.stage(si, STAGES[si]);
    for (let bi = 0; bi < DECISIONS_PER_STAGE; bi++) {
      run.surveillance += 1;
      bob.lethal_wing = run.legend >= LEGEND_LOUD;      // a legend doesn't wound — and loads 3 bullets
      const opp = beatOpponent(si, bi, pool, hooks.present);
      hooks.beat && hooks.beat(run, opp);
      if (fightBeat(eng, bob, opp, pool)) return die(`DIED — stage ${si + 1}, beat ${bi + 1}`);
      run.cleared += 1; run.score += beatScore(si, opp);
      if (askRecord(run)) { run.legend += 1; run.surveillance += 1; run.score += SCORE_ON_RECORD; }
    }
    if (si === 1 && thePresident(eng, bob, run)) return die("DIED — THE PRESIDENT'S MAN");
    if (si === 2 && run.president_dead && heyBobSmile(eng, bob, run)) return die("DIED — HEY BOB, SMILE!");
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
