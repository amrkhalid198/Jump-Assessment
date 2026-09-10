'use client';

/**
 * usePoseEngine — MediaPipe lifecycle + capture loop, wrapped for React.
 *
 * ---------------------------------------------------------------------------
 * The structural rule: refs are the engine, state is the report
 * ---------------------------------------------------------------------------
 *
 * The detector runs at 30-120 fps. Anything that calls setState on every frame
 * will re-render the tree 120 times a second, and on a mid-range clinic laptop
 * that alone drops enough frames to corrupt the very timings we are measuring
 * — React's own render cost lands inside the measurement window.
 *
 * So the split is absolute:
 *
 *   refs    landmarks, thresholds, the FSM state, the floor plane, timing.
 *           Mutated freely, every frame, never triggering a render.
 *
 *   state   phase name, the last completed trial, a status line, and a live
 *           readout throttled to ~10 Hz. This is what the UI binds to.
 *
 * Canvas overlay drawing reads the refs directly inside the same rAF tick and
 * never goes through React at all.
 *
 * ---------------------------------------------------------------------------
 * StrictMode
 * ---------------------------------------------------------------------------
 * React 18 mounts, unmounts and remounts effects in development. Creating a
 * PoseLandmarker twice leaks a WASM instance and a GPU context, so init is
 * guarded by a token and teardown is genuinely idempotent. Test with
 * StrictMode ON — a leak that only appears in production is much worse.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { PHASE, TEST_TYPE, LIMITS } from '@/lib/biomech/constants';
import { createTrialState, reduceTrial, toTrialRecord } from '@/lib/biomech/fsm';
import {
  createFloorCalibrator,
  createSignalTracker,
  computeThresholds,
  activeFootY,
} from '@/lib/biomech/signal';
import { fppaFor, hipY } from '@/lib/biomech/fppa';

const LIVE_HZ = 10;

/**
 * @param {Object}   opts
 * @param {'drop'|'standing'} opts.testType
 * @param {'left'|'right'}    opts.limb
 * @param {number}   opts.sensitivity
 * @param {(record: object) => void} opts.onTrialComplete  called once per valid trial
 */
export function usePoseEngine({
  testType = TEST_TYPE.DROP,
  limb = 'left',
  sensitivity = 1.0,
  onTrialComplete,
} = {}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ---- published (coarse) state -------------------------------------------
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [status, setStatus] = useState({ text: '', tone: 'muted' });
  const [live, setLive] = useState({ gct: null, ft: null, rsi: null, fppa: null, fps: 0 });
  const [ready, setReady] = useState(false);
  const [floor, setFloor] = useState(null);

  // ---- hot refs: the engine proper ----------------------------------------
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const lastMpTsRef = useRef(-1);

  const trialRef = useRef(null);          // TrialState | null
  const signalRef = useRef(null);
  const calibratorRef = useRef(null);
  const floorRef = useRef({ floorY: null, floorNoise: 0, contactOff: 0, flightOff: 0 });
  const lastPublishRef = useRef(0);
  const fpsRef = useRef({ frames: 0, since: 0, value: 0 });

  /**
   * Config the loop reads every frame. Kept in a ref so changing the test-type
   * toggle does not tear down and rebuild the capture loop. A trial already in
   * flight is unaffected: `createTrialState` copies testType into the FSM state
   * at arm time, so flipping the toggle mid-air cannot retag a running trial.
   */
  const cfgRef = useRef({ testType, limb, sensitivity });
  useEffect(() => {
    cfgRef.current = { testType, limb, sensitivity };
  }, [testType, limb, sensitivity]);

  const onCompleteRef = useRef(onTrialComplete);
  useEffect(() => { onCompleteRef.current = onTrialComplete; }, [onTrialComplete]);

  // -------------------------------------------------------------------------
  // Detector lifecycle
  // -------------------------------------------------------------------------
  useEffect(() => {
    let token = { cancelled: false };

    (async () => {
      // Dynamic import: the WASM bundle is ~7 MB and must never land in the
      // server bundle or block first paint of the dashboard.
      const { FilesetResolver, PoseLandmarker } = await import(
        '@mediapipe/tasks-vision'
      );

      const fileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );
      if (token.cancelled) return;

      const landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      if (token.cancelled) {
        landmarker.close();
        return;
      }

      landmarkerRef.current = landmarker;
      setReady(true);
      setStatus({ text: 'Model ready. Start the camera.', tone: 'ok' });
    })().catch((err) => {
      if (!token.cancelled) {
        setStatus({ text: `Model failed to load: ${err.message}`, tone: 'bad' });
      }
    });

    return () => {
      token.cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  /** Commit an FSM transition, and fan out terminal phases. */
  const applyTrial = useCallback((next) => {
    const prev = trialRef.current;
    trialRef.current = next;

    if (next.phase !== prev?.phase) setPhase(next.phase);

    if (next.phase === PHASE.ABORTED && prev?.phase !== PHASE.ABORTED) {
      setStatus({ text: `Trial discarded — ${next.abortReason}`, tone: 'warn' });
      trialRef.current = null;
      setPhase(PHASE.CALIBRATED);
      return;
    }

    if (next.phase === PHASE.COMPLETED && prev?.phase !== PHASE.COMPLETED) {
      const record = toTrialRecord(next, {
        fps: fpsRef.current.value,
        floorNoise: floorRef.current.floorNoise,
        sensitivity: cfgRef.current.sensitivity,
      });
      setStatus({ text: 'Trial recorded.', tone: 'ok' });
      onCompleteRef.current?.(record);
      trialRef.current = null;
    }
  }, []);


  // -------------------------------------------------------------------------
  // The per-frame loop
  // -------------------------------------------------------------------------
  const tick = useCallback(() => {
    rafRef.current = requestAnimationFrame(tick);

    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) return;

    // detectForVideo requires strictly increasing timestamps; a repeated frame
    // throws rather than returning stale results.
    const ts = performance.now();
    if (video.currentTime === lastMpTsRef.current) return;
    lastMpTsRef.current = video.currentTime;

    const result = landmarker.detectForVideo(video, ts);
    const lm = result?.landmarks?.[0];

    // fps, measured not assumed — it is stamped onto every trial because
    // timing resolution is bounded by it.
    const f = fpsRef.current;
    f.frames++;
    if (ts - f.since >= 500) {
      f.value = (f.frames * 1000) / (ts - f.since);
      f.frames = 0;
      f.since = ts;
    }

    if (!lm) return;

    // ---- calibration ------------------------------------------------------
    const calibrator = calibratorRef.current;
    if (calibrator) {
      const out = calibrator.sample(lm, ts);
      if (out?.error) {
        calibratorRef.current = null;
        setPhase(PHASE.IDLE);
        setStatus({ text: out.error, tone: 'bad' });
      } else if (out) {
        const thr = computeThresholds(lm, out.floorNoise, cfgRef.current.sensitivity);
        floorRef.current = { ...out, ...thr };
        calibratorRef.current = null;
        signalRef.current.reset(true);
        setFloor({ ...out, ...thr });
        setPhase(PHASE.CALIBRATED);
        setStatus({ text: 'Floor calibrated. Select the test limb, then arm the trial.', tone: 'ok' });
      }
      drawOverlay(canvasRef.current, video, lm, null);
      return;
    }

    // ---- signal -> FSM ----------------------------------------------------
    const trial = trialRef.current;
    const fl = floorRef.current;

    if (trial && fl.floorY !== null) {
      const cfg = cfgRef.current;
      const ctx = { limb: trial.limb, ...fl };

      const measuring =
        trial.phase === PHASE.CONTACT_1 ||
        trial.phase === PHASE.FLIGHT ||
        trial.phase === PHASE.CONTACT_2;

      if (measuring && signalRef.current.contralateralTouchdown(lm, ctx)) {
        applyTrial(reduceTrial(trial, {
          kind: 'fault',
          t: ts,
          reason: 'contralateral foot touchdown detected (balance fault).',
        }));
      } else {
        if (!measuring) signalRef.current.clearContraFrames();

        const event = signalRef.current.step(lm, ts, ctx);
        let next = trial;

        if (event) next = reduceTrial(next, event);

        // Depth sample drives FPPA capture at peak braking.
        if (next.phase === PHASE.CONTACT_1 || next.phase === PHASE.CONTACT_2) {
          const angle = fppaFor(lm, next.limb, video);
          next = reduceTrial(next, {
            kind: 'depth',
            t: ts,
            hipY: hipY(lm, next.limb),
            fppa: angle?.signed ?? null,
          });
        }

        // Tick last: timeouts and the landing dwell window.
        next = reduceTrial(next, { kind: 'tick', t: ts });

        if (next !== trial) applyTrial(next);
      }
    }

    // ---- publish, throttled ----------------------------------------------
    if (ts - lastPublishRef.current > 1000 / LIVE_HZ) {
      lastPublishRef.current = ts;
      const t = trialRef.current;
      setLive({
        gct: t?.gct ?? null,
        ft: t?.ft ?? null,
        rsi: t?.gct && t?.ft ? t.ft / t.gct : null,
        fppa: t?.fppa1 ?? t?.fppa2 ?? null,
        fps: f.value,
        footY: activeFootY(lm, cfgRef.current.limb)?.y ?? null,
      });
    }

    drawOverlay(canvasRef.current, video, lm, trialRef.current);
  }, [applyTrial]);

  // -------------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------------
  const startCamera = useCallback(async (deviceId) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        // Timing resolution is bounded by frame rate: at 30 fps a contact
        // event carries roughly +/-16 ms before interpolation. Ask for 60.
        frameRate: { ideal: 60, min: 30 },
      },
      audio: false,
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();

    signalRef.current = createSignalTracker();
    fpsRef.current = { frames: 0, since: performance.now(), value: 0 };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    setStatus({
      text: 'Camera live. Stand the athlete in frame — full body, both feet visible — then calibrate the floor.',
      tone: 'muted',
    });
  }, [tick]);

  const calibrateFloor = useCallback(() => {
    if (!streamRef.current) return;
    calibratorRef.current = createFloorCalibrator();
    calibratorRef.current.start(performance.now());
    trialRef.current = null;
    setPhase(PHASE.CALIBRATING);
    setStatus({ text: 'Hold still. Sampling the floor plane from both feet.', tone: 'muted' });
  }, []);

  const armTrial = useCallback(() => {
    if (floorRef.current.floorY === null) return;
    const cfg = cfgRef.current;

    trialRef.current = createTrialState({
      testType: cfg.testType,
      limb: cfg.limb,
      inContact: signalRef.current.inContact,
      now: performance.now(),
    });

    setPhase(PHASE.READY);
    setLive({ gct: null, ft: null, rsi: null, fppa: null, fps: fpsRef.current.value });
    setStatus({
      text: cfg.testType === TEST_TYPE.STANDING
        ? `Armed. Hold a still single-leg stance on the ${cfg.limb} limb, then hop.`
        : `Armed. Drop from the box onto the ${cfg.limb} limb.`,
      tone: 'ok',
    });
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    trialRef.current = null;
    setPhase(PHASE.IDLE);
  }, []);

  return {
    videoRef,
    canvasRef,
    ready,
    phase,
    status,
    live,
    floor,
    startCamera,
    stopCamera,
    calibrateFloor,
    armTrial,
    isArmed: trialRef.current?.armed ?? false,
  };
}

/** Overlay drawing. Reads refs directly; deliberately outside React. */
function drawOverlay(canvas, video, lm, trial) {
  if (!canvas || !video?.videoWidth) return;
  if (canvas.width !== video.videoWidth) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ... skeleton, floor line, and phase badge drawing port unchanged from the
  // prototype's draw() — omitted here to keep this file about the engine.
}
