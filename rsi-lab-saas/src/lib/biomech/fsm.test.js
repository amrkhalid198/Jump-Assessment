/**
 * FSM tests. Because the reducer is pure, a whole trial is a list of events —
 * no camera, no athlete, no plyo box.
 *
 *   node --test src/lib/biomech/fsm.test.js
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { PHASE, TEST_TYPE, LIMITS } from './constants.js';
import { createTrialState, reduceTrial, toTrialRecord, jumpHeightCm } from './fsm.js';

/** Replays events, recording every phase the machine passes through. */
function run(state, events) {
  const visited = [state.phase];
  let s = state;
  for (const e of events) {
    s = reduceTrial(s, e);
    if (s.phase !== visited.at(-1)) visited.push(s.phase);
  }
  return { state: s, visited };
}

// ---------------------------------------------------------------------------
// Drop jump
// ---------------------------------------------------------------------------

test('drop jump: full path produces gct and rsi', () => {
  // Athlete starts ON the box, i.e. not in contact with the floor.
  const s0 = createTrialState({
    testType: TEST_TYPE.DROP, limb: 'left', inContact: false, now: 0,
  });
  assert.equal(s0.armed, true, 'off the floor arms a drop jump immediately');

  const { state, visited } = run(s0, [
    { kind: 'contact', t: 1000 },  // lands from the box
    { kind: 'tick', t: 1100 },
    { kind: 'takeoff', t: 1220 },  // gct = 220 ms
    { kind: 'tick', t: 1400 },
    { kind: 'contact', t: 1700 },  // ft = 480 ms
    { kind: 'tick', t: 2000 },
    { kind: 'tick', t: 2400 },     // dwell satisfied
  ]);

  assert.deepEqual(visited, [
    PHASE.READY, PHASE.CONTACT_1, PHASE.FLIGHT, PHASE.CONTACT_2, PHASE.COMPLETED,
  ]);
  assert.equal(state.gct, 220);
  assert.equal(state.ft, 480);

  const rec = toTrialRecord(state, { fps: 60 });
  assert.equal(rec.test_type, 'drop');
  assert.equal(rec.gct_ms, 220);
  assert.equal(rec.rsi, Number((480 / 220).toFixed(3)));
  assert.ok(rec.jump_height_cm > 0);
});

test('drop jump: a takeoff in READY arms rather than starting the trial', () => {
  // Athlete is standing on the floor when the trial is armed.
  const s0 = createTrialState({
    testType: TEST_TYPE.DROP, limb: 'left', inContact: true, now: 0,
  });
  assert.equal(s0.armed, false);

  // Stepping up onto the box.
  const armed = reduceTrial(s0, { kind: 'takeoff', t: 500 });
  assert.equal(armed.armed, true);
  assert.equal(armed.phase, PHASE.READY, 'still READY — this was not the jump');

  const dropped = reduceTrial(armed, { kind: 'contact', t: 2000 });
  assert.equal(dropped.phase, PHASE.CONTACT_1);
});

test('drop jump: out-of-range contact time aborts', () => {
  const s0 = createTrialState({
    testType: TEST_TYPE.DROP, limb: 'left', inContact: false, now: 0,
  });
  const contact = reduceTrial(s0, { kind: 'contact', t: 1000 });
  const aborted = reduceTrial(contact, { kind: 'takeoff', t: 1030 }); // 30 ms

  assert.equal(aborted.phase, PHASE.ABORTED);
  assert.match(aborted.abortReason, /contact time/);
  assert.equal(toTrialRecord(aborted), null, 'aborted trials are never persistable');
});

// ---------------------------------------------------------------------------
// Standing hop — the new mode
// ---------------------------------------------------------------------------

test('standing hop: bypasses CONTACT_1 and leaves gct and rsi null', () => {
  // Athlete is standing on the floor.
  const s0 = createTrialState({
    testType: TEST_TYPE.STANDING, limb: 'right', inContact: true, now: 0,
  });
  assert.equal(s0.armed, true, 'on the floor arms a standing hop');

  const { state, visited } = run(s0, [
    { kind: 'tick', t: 400 },
    { kind: 'takeoff', t: 500 },   // the hop itself
    { kind: 'tick', t: 700 },
    { kind: 'contact', t: 940 },   // ft = 440 ms
    { kind: 'tick', t: 1200 },
    { kind: 'tick', t: 1600 },     // dwell satisfied
  ]);

  assert.deepEqual(visited, [
    PHASE.READY, PHASE.FLIGHT, PHASE.CONTACT_2, PHASE.COMPLETED,
  ]);
  assert.ok(!visited.includes(PHASE.CONTACT_1), 'CONTACT_1 must never be entered');

  assert.equal(state.gct, null);
  assert.equal(state.ft, 440);

  const rec = toTrialRecord(state, { fps: 60 });
  assert.equal(rec.test_type, 'standing');
  assert.equal(rec.gct_ms, null);
  assert.equal(rec.rsi, null, 'RSI is undefined without a contact phase');
  assert.equal(rec.flight_ms, 440);
  assert.ok(rec.jump_height_cm > 0, 'jump height still derives from flight time');
});

test('standing hop: an unsettled takeoff is a setup shuffle, not the hop', () => {
  // Athlete not yet planted when the trial is armed.
  const s0 = createTrialState({
    testType: TEST_TYPE.STANDING, limb: 'right', inContact: false, now: 0,
  });
  assert.equal(s0.armed, false);

  // Foot lands, but they lift again before settling.
  const planted = reduceTrial(s0, { kind: 'contact', t: 100 });
  const early = reduceTrial(planted, { kind: 'takeoff', t: 200 }); // 100 ms < settle

  assert.equal(early.phase, PHASE.READY, 'ignored — still waiting for a stable stance');
  assert.equal(early.settledSince, null, 'settle timer reset');

  // Plant again and hold past the settle window.
  let s = reduceTrial(early, { kind: 'contact', t: 300 });
  s = reduceTrial(s, { kind: 'tick', t: 300 + LIMITS.STANDING_SETTLE_MS + 1 });
  assert.equal(s.armed, true);

  s = reduceTrial(s, { kind: 'takeoff', t: 800 });
  assert.equal(s.phase, PHASE.FLIGHT, 'now it counts');
});

test('standing hop: a shuffle below the flight floor aborts', () => {
  const s0 = createTrialState({
    testType: TEST_TYPE.STANDING, limb: 'left', inContact: true, now: 0,
  });
  let s = reduceTrial(s0, { kind: 'takeoff', t: 500 });
  s = reduceTrial(s, { kind: 'contact', t: 560 }); // 60 ms < MIN_FT_STANDING

  assert.equal(s.phase, PHASE.ABORTED);
  assert.match(s.abortReason, /flight time/);
});

// ---------------------------------------------------------------------------
// Shared guards
// ---------------------------------------------------------------------------

test('contralateral touchdown voids a trial in either mode', () => {
  for (const testType of [TEST_TYPE.DROP, TEST_TYPE.STANDING]) {
    const s0 = createTrialState({
      testType, limb: 'left', inContact: testType === TEST_TYPE.STANDING, now: 0,
    });
    let s = testType === TEST_TYPE.DROP
      ? reduceTrial(reduceTrial(s0, { kind: 'contact', t: 100 }), { kind: 'takeoff', t: 300 })
      : reduceTrial(s0, { kind: 'takeoff', t: 300 });

    assert.equal(s.phase, PHASE.FLIGHT);
    s = reduceTrial(s, { kind: 'fault', t: 400, reason: 'balance fault' });
    assert.equal(s.phase, PHASE.ABORTED, `${testType} must abort on a balance fault`);
  }
});

test('an unstable landing does not count as a completed trial', () => {
  const s0 = createTrialState({
    testType: TEST_TYPE.STANDING, limb: 'left', inContact: true, now: 0,
  });
  let s = reduceTrial(s0, { kind: 'takeoff', t: 500 });
  s = reduceTrial(s, { kind: 'contact', t: 940 });
  assert.equal(s.phase, PHASE.CONTACT_2);

  // Hops out again before the dwell window closes.
  s = reduceTrial(s, { kind: 'takeoff', t: 1100 });
  assert.equal(s.phase, PHASE.ABORTED);
  assert.match(s.abortReason, /unstable landing/);
});

test('terminal states are absorbing', () => {
  const s0 = createTrialState({
    testType: TEST_TYPE.DROP, limb: 'left', inContact: false, now: 0,
  });
  const aborted = reduceTrial(s0, { kind: 'fault', t: 10, reason: 'x' });
  assert.equal(reduceTrial(aborted, { kind: 'contact', t: 20 }), aborted);
});

test('jump height matches the flight-time formula', () => {
  // h = g t^2 / 8; 500 ms -> 9.81 * 0.25 / 8 = 0.3066 m
  assert.ok(Math.abs(jumpHeightCm(500) - 30.66) < 0.01);
});
