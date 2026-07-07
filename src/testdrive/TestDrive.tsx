/**
 * Test Drive engine — スマートクリニック仮想体験。
 * 俯瞰のクリニックをシネマティックカメラで移動しながら、
 * 患者アバターが 来院前 → 受付 → 待合 → 診察 → 会計 → 薬局 → 再診 を一周する。
 * すべて合成データ。
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ClinicWorld } from './world';
import {
  PERSONAS,
  STEPS,
  FINALE_KPIS,
  WORLD_W,
  WORLD_H,
  SPOTS,
  stepsForPersona,
  type Persona,
  type Vec,
} from './script';
import {
  PhoneIntakeOverlay,
  KioskOverlay,
  BoardOverlay,
  MonitorOverlay,
  MatchingOverlay,
  PhonePayOverlay,
  PharmacyOverlay,
  RevisitOverlay,
} from './overlays';
import { Wordmark } from '../components/Wordmark';
import './test-drive.css';

type Cam = { x: number; y: number; scale: number };

const WALK_SPEED = 300; // world units / sec

function segLengths(path: Vec[]): { lens: number[]; total: number } {
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const l = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
    lens.push(l);
    total += l;
  }
  return { lens, total };
}

function pointAt(path: Vec[], lens: number[], dist: number): { p: Vec; dx: number } {
  let d = dist;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const t = lens[i] === 0 ? 0 : Math.min(1, d / lens[i]);
      const a = path[i];
      const b = path[i + 1];
      return { p: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, dx: b.x - a.x };
    }
    d -= lens[i];
  }
  const last = path[path.length - 1];
  return { p: last, dx: 0 };
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function TestDrive() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'travel' | 'show'>('show');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [selectedId, setSelectedId] = useState<string>(PERSONAS[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [interstitial, setInterstitial] = useState<string | null>(null);
  const [walking, setWalking] = useState(false);

  // ペルソナのジャーニーでステップ列が変わる（specialist-revisit は再診後にマッチング）
  const activePersona = persona ?? PERSONAS.find((p) => p.id === selectedId) ?? PERSONAS[0];
  const steps = stepsForPersona(activePersona);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;
  const lastStep = steps.length - 1;

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<SVGGElement>(null);
  const avatarDirRef = useRef<SVGGElement>(null);

  const camTargetRef = useRef<Cam>(STEPS[0].camera);
  const camNowRef = useRef<Cam>({ ...STEPS[0].camera });
  const avatarPosRef = useRef<Vec>({ ...SPOTS.streetStart });
  /** 遷移の世代。新しい goTo が走ると古い遷移は静かに中断する */
  const genRef = useRef(0);
  const rafRef = useRef(0);
  const aliveRef = useRef(true);
  const reducedRef = useRef(false);

  /* ── camera ── */

  const fitScale = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return 0.5;
    return Math.min(el.clientWidth / WORLD_W, el.clientHeight / WORLD_H);
  }, []);

  const applyCamera = useCallback(
    (cam: Cam, glide: boolean) => {
      const el = viewportRef.current;
      const world = worldRef.current;
      if (!el || !world) return;
      const s = cam.scale * fitScale();
      world.classList.toggle('td-world-glide', glide);
      world.style.transform = `translate(${el.clientWidth / 2 - cam.x * s}px, ${el.clientHeight / 2 - cam.y * s}px) scale(${s})`;
      camNowRef.current = { ...cam };
    },
    [fitScale],
  );

  const setAvatar = useCallback((p: Vec, dx?: number) => {
    avatarPosRef.current = { ...p };
    if (avatarRef.current) {
      avatarRef.current.setAttribute('transform', `translate(${p.x} ${p.y})`);
    }
    if (avatarDirRef.current && dx !== undefined && Math.abs(dx) > 0.5) {
      avatarDirRef.current.setAttribute('transform', `scale(${dx < 0 ? -1 : 1},1)`);
    }
  }, []);

  /* ── walking (RAF, camera follows) ── */

  const walkPath = useCallback(
    (rawPath: Vec[], camScale: number, gen: number) =>
      new Promise<void>((resolve) => {
        const start = avatarPosRef.current;
        const path = Math.hypot(rawPath[0].x - start.x, rawPath[0].y - start.y) > 8
          ? [start, ...rawPath]
          : [{ ...start }, ...rawPath.slice(1)];
        const { lens, total } = segLengths(path);
        if (total < 4) {
          resolve();
          return;
        }
        const duration = Math.min(6200, Math.max(1000, (total / WALK_SPEED) * 1000));
        const t0 = performance.now();
        let prev = t0;
        setWalking(true);
        const tick = (now: number) => {
          if (!aliveRef.current) return;
          if (genRef.current !== gen) {
            // 新しい遷移に追い越された — この歩行は打ち切る
            setWalking(false);
            resolve();
            return;
          }
          const dt = now - prev;
          prev = now;
          const t = Math.min(1, (now - t0) / duration);
          const { p, dx } = pointAt(path, lens, easeInOut(t) * total);
          setAvatar(p, dx);
          // camera chases the avatar; time-based smoothing so throttled tabs converge
          const cam = camNowRef.current;
          const target: Cam = { x: p.x, y: p.y - 30, scale: camScale };
          const a = 1 - Math.exp(-dt / 220);
          applyCamera(
            {
              x: cam.x + (target.x - cam.x) * a,
              y: cam.y + (target.y - cam.y) * a,
              scale: cam.scale + (target.scale - cam.scale) * a,
            },
            false,
          );
          if (t < 1) {
            rafRef.current = requestAnimationFrame(tick);
          } else {
            setWalking(false);
            resolve();
          }
        };
        rafRef.current = requestAnimationFrame(tick);
      }),
    [applyCamera, setAvatar],
  );

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  /* ── step transitions ── */

  const goTo = useCallback(
    async (next: number, jump = false) => {
      if (next < 0 || next > stepsRef.current.length - 1) return;
      const gen = ++genRef.current;
      const alive = () => aliveRef.current && genRef.current === gen;
      setMenuOpen(false);
      setPhase('travel');
      const def = stepsRef.current[next];
      setStep(next);

      const walkEnd = def.walk ? def.walk[def.walk.length - 1] : null;

      if (def.interstitial && !jump) {
        setInterstitial(def.interstitial);
        await sleep(1500);
        if (!alive()) return;
        if (def.walk) setAvatar(def.walk[0], 1);
        applyCamera({ ...def.camera, x: def.walk ? def.walk[0].x : def.camera.x, y: def.walk ? def.walk[0].y - 30 : def.camera.y }, false);
        setInterstitial(null);
        await sleep(250);
        if (!alive()) return;
      }

      if (def.walk && !jump && !reducedRef.current) {
        await walkPath(def.walk, def.camera.scale, gen);
      } else if (walkEnd) {
        setAvatar(walkEnd, 1);
      }
      if (!alive()) return;

      applyCamera(def.camera, true);
      await sleep(reducedRef.current ? 150 : def.walk && !jump ? 700 : 450);
      if (!alive()) return;
      setPhase('show');
    },
    [applyCamera, setAvatar, walkPath],
  );

  const advance = useCallback(() => {
    void goTo(step + 1);
  }, [goTo, step]);

  const jumpTo = useCallback(
    (i: number) => {
      if (i === step) return;
      if (!persona && i > 0) {
        setPersona(PERSONAS.find((p) => p.id === selectedId) ?? PERSONAS[0]);
      }
      void goTo(i, true);
    },
    [goTo, persona, selectedId, step],
  );

  const start = useCallback(() => {
    const p = PERSONAS.find((pp) => pp.id === selectedId) ?? PERSONAS[0];
    setPersona(p);
    setAvatar(SPOTS.streetStart, 1);
    void goTo(1);
  }, [goTo, selectedId, setAvatar]);

  const restart = useCallback(() => {
    genRef.current++;
    setPersona(null);
    setStep(0);
    setPhase('show');
    setMenuOpen(false);
    setInterstitial(null);
    setWalking(false);
    setAvatar(SPOTS.streetStart, 1);
    applyCamera(stepsRef.current[0].camera, true);
  }, [applyCamera, setAvatar]);

  /* ── mount / resize ── */

  useLayoutEffect(() => {
    aliveRef.current = true;
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setAvatar(SPOTS.streetStart, 1);
    applyCamera(STEPS[0].camera, false);
    const onResize = () => applyCamera(camTargetRef.current, false);
    window.addEventListener('resize', onResize);
    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [applyCamera, setAvatar]);

  // keep last "intent" camera for resize re-apply
  useEffect(() => {
    camTargetRef.current = steps[step].camera;
  }, [steps, step]);


  /* ── derived UI state ── */

  const def = steps[step];
  const showCard = phase === 'show' && step >= 1 && step < lastStep && persona !== null;
  const showIntro = step === 0;
  const showFinale = step === lastStep && phase === 'show';
  const marker =
    phase === 'show' && persona && step >= 1 && step < lastStep
      ? steps[step + 1]?.walk?.[steps[step + 1].walk!.length - 1] ?? null
      : null;
  const flows = phase === 'show' || step === lastStep ? def.flows ?? [] : [];

  const overlayNode = (() => {
    if (!persona || phase !== 'show') return null;
    switch (def.overlay) {
      case 'phone-intake':
        return <PhoneIntakeOverlay key={`o${step}`} persona={persona} />;
      case 'kiosk':
        return <KioskOverlay key={`o${step}`} persona={persona} />;
      case 'board':
        return <BoardOverlay key={`o${step}`} persona={persona} />;
      case 'monitor':
        return <MonitorOverlay key={`o${step}`} persona={persona} />;
      case 'matching':
        return <MatchingOverlay key={`o${step}`} persona={persona} />;
      case 'phone-pay':
        return <PhonePayOverlay key={`o${step}`} persona={persona} />;
      case 'pharmacy':
        return <PharmacyOverlay key={`o${step}`} persona={persona} />;
      case 'revisit':
        return <RevisitOverlay key={`o${step}`} persona={persona} />;
      default:
        return null;
    }
  })();

  const overlayAlign =
    def.overlay === 'monitor' || def.overlay === 'board' || def.overlay === 'revisit'
      ? 'center'
      : def.overlay === 'pharmacy'
        ? 'left'
        : 'right';

  return (
    <div className="td-root">
      <div className="td-backdrop" />

      {/* ── world ── */}
      <div ref={viewportRef} className="td-viewport">
        <div ref={worldRef} className="td-world" style={{ width: WORLD_W, height: WORLD_H }}>
          <ClinicWorld
            flows={flows}
            marker={marker}
            onMarkerClick={advance}
            step={step}
          >
            {persona && (
              <g ref={avatarRef} style={{ pointerEvents: 'none' }}>
                <g ref={avatarDirRef}>
                  <g className={walking ? 'td-avatar-bob' : undefined}>
                    <ellipse cx={0} cy={20} rx={13} ry={5} fill="rgba(16,34,29,0.18)" />
                    <circle cx={0} cy={4} r={17} fill="#ffffff" opacity={0.55} />
                    <rect x={-10} y={-7} width={20} height={25} rx={10} fill={persona.color} stroke="#ffffff" strokeWidth={2.5} />
                    <circle cx={0} cy={-15} r={8.5} fill="#f3d9c3" stroke="#ffffff" strokeWidth={2} />
                    <path d="M -8.5 -16.5 A 8.5 8.5 0 0 1 8.5 -16.5 L 8.5 -14 L -8.5 -14 Z" fill={persona.colorDark} />
                  </g>
                </g>
              </g>
            )}
          </ClinicWorld>
        </div>
      </div>

      {/* ── device overlays ── */}
      {overlayNode && (
        <div className={`td-overlay-layer ${overlayAlign}`}>{overlayNode}</div>
      )}

      {/* ── top chrome ── */}
      <div className="td-topbar">
        <a className="td-logo" href="#/" aria-label="Medixus Clinic トップへ">
          <Wordmark size="sm" />
          <span className="td-logo-tag">TEST DRIVE</span>
        </a>
        <div className="td-dots" role="tablist" aria-label="ステップ">
          {steps.map((s, i) => (
            <button
              key={s.id}
              className={`td-dot ${i === step ? 'active' : i < step ? 'done' : ''}`}
              onClick={() => jumpTo(i)}
              aria-label={`Step ${i}: ${s.shortTitle}`}
              title={s.shortTitle}
            />
          ))}
        </div>
        <button className="td-menu-btn" onClick={() => setMenuOpen((v) => !v)}>
          <span aria-hidden>☰</span> メニュー
        </button>
      </div>

      {menuOpen && (
        <div className="td-menu">
          {steps.map((s, i) => (
            <button key={s.id} className={i === step ? 'current' : undefined} onClick={() => jumpTo(i)}>
              <span className="td-menu-step">STEP {i}</span>
              {s.shortTitle}
            </button>
          ))}
          <button onClick={restart}>
            <span className="td-menu-step">↺</span>最初からやり直す
          </button>
          <button onClick={() => { window.location.hash = '#/'; }}>
            <span className="td-menu-step">←</span>Medixus Clinic トップへ
          </button>
        </div>
      )}

      {/* ── HUD ── */}
      {persona && !showIntro && (
        <div className="td-hud">
          <span className="td-hud-chip">
            <span
              style={{
                width: '0.7rem',
                height: '0.7rem',
                borderRadius: 999,
                background: persona.color,
                display: 'inline-block',
              }}
            />
            体験中: <strong>{persona.name}</strong>（{persona.complaint}）
          </span>
          {phase === 'show' && def.hud && (
            <span className="td-hud-chip" key={`hud${step}`}>
              {def.hud.label}: <strong>{def.hud.value}</strong>
            </span>
          )}
          {phase === 'show' && (def.flows?.length ?? 0) > 0 && step < lastStep && (
            <span className="td-ai-toast" key={`ai${step}`}>
              <span className="spark" aria-hidden>✦</span>
              Medixus Core が裏側で自動処理中
            </span>
          )}
        </div>
      )}

      {/* ── step card ── */}
      <div className={`td-card ${showCard ? 'visible' : ''}`} aria-hidden={!showCard}>
        <span className="td-card-step">STEP {step}</span>
        <h2>{def.title}</h2>
        <p>{def.desc}</p>
        {def.note && (
          <div className="td-card-note">
            <span aria-hidden>✦</span> {def.note}
          </div>
        )}
        <div className="td-card-actions">
          {step > 1 && (
            <button className="td-back-btn" onClick={() => jumpTo(step - 1)}>
              戻る
            </button>
          )}
          <button className="td-next-btn" onClick={advance}>
            次へ <span className="arrow" aria-hidden>→</span>
          </button>
        </div>
      </div>

      {/* ── intro (STEP 0) ── */}
      {showIntro && (
        <div className="td-intro">
          <div className="td-intro-head">
            <span className="td-card-step">MEDIXUS CLINIC — TEST DRIVE</span>
            <h1>スマートクリニックを、仮想受診しよう</h1>
            <p>
              あなたの分身を選んでください。受付から診察・会計・おくすりまで約2分。
              <br />
              4人それぞれで、違う「待たないクリニック」の顔が見られます。
            </p>
          </div>
          <div className="td-personas">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                className={`td-persona ${selectedId === p.id ? 'selected' : ''}`}
                onClick={() => setSelectedId(p.id)}
              >
                <span className="check" aria-hidden>✓</span>
                <svg className="avatar" viewBox="-30 -34 60 64" aria-hidden>
                  <circle cx={0} cy={2} r={27} fill={p.color} opacity={0.15} />
                  <rect x={-13} y={-6} width={26} height={30} rx={13} fill={p.color} />
                  <circle cx={0} cy={-15} r={11} fill="#f3d9c3" />
                  <path d="M -11 -17 A 11 11 0 0 1 11 -17 L 11 -13.5 L -11 -13.5 Z" fill={p.colorDark} />
                </svg>
                <span className="name">{p.name}</span>
                <span className="meta">{p.age}歳・{p.role}</span>
                <span className="complaint">{p.complaint}</span>
                <span className="tagline">{p.tagline}</span>
              </button>
            ))}
          </div>
          <button className="td-intro-start" onClick={start}>
            この患者で受診する <span aria-hidden>→</span>
          </button>
          <div style={{ fontSize: '0.66rem', color: 'var(--mx-subtle)', fontWeight: 600 }}>
            登録不要・すべて合成データのデモです
          </div>
        </div>
      )}

      {/* ── finale (STEP 8) ── */}
      {showFinale && (
        <div className="td-finale">
          <div className="td-finale-head">
            <span className="eyebrow">院長ビュー — 本日の流れ</span>
            <h1>診察のあいだに、すべてが終わるクリニック</h1>
            <p>
              あなたが体験した1回の通院の裏側で、受付・カルテ・算定・調剤が自動で流れていました。
              <br />
              Medixus Clinic は、医療AIが運営を支える「ほぼ無人」のスマートクリニックです。
            </p>
          </div>
          <div className="td-kpis">
            {FINALE_KPIS.map((k, i) => (
              <div key={k.label} className="td-kpi" style={{ animationDelay: `${0.08 * i + 0.15}s` }}>
                <div className="label">{k.label}</div>
                <div className="value">
                  {k.value}
                  <span className="unit">{k.unit}</span>
                </div>
                <span className="delta">{k.delta}</span>
              </div>
            ))}
          </div>
          <div className="td-finale-ctas">
            <a className="td-cta-primary" href="#/">
              Medixus Clinic について <span aria-hidden>→</span>
            </a>
            <button className="td-cta-ghost" onClick={restart}>
              ↺ 別の患者でもう一度
            </button>
          </div>
        </div>
      )}

      {/* ── interstitial（1週間後…） ── */}
      {interstitial && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 60,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(250, 250, 247, 0.96)',
            animation: 'td-pop 0.5s ease',
          }}
        >
          <div style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 900, color: 'var(--mx-ink)', letterSpacing: '0.2em' }}>
            {interstitial}
          </div>
        </div>
      )}
    </div>
  );
}
