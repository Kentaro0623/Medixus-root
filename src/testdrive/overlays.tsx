/**
 * Device overlays — カメラが寄った先に現れる「巨大デバイスUI」。
 * スマホ問診 / キオスク受付 / 待合ボード / 医師モニター(AIカルテ) / 会計 / 調剤キュー / 再診。
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { CLINIC_NAME, DOCTOR_ROOM1, type Persona } from './script';

/* ═══════════ timing helpers ═══════════ */

/** delays[i] ミリ秒後に stage が i+1 になる累進タイムライン */
function useStages(delays: number[]): number {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let acc = 0;
    delays.forEach((d, i) => {
      acc += d;
      timers.push(setTimeout(() => setStage(i + 1), acc));
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return stage;
}

function TypeText({
  text,
  active,
  cps = 32,
  showCaret = true,
  onDone,
}: {
  text: string;
  active: boolean;
  cps?: number;
  showCaret?: boolean;
  onDone?: () => void;
}) {
  const [n, setN] = useState(0);
  const doneRef = useRef(false);
  useEffect(() => {
    if (!active) return;
    // 経過時間ベースで文字数を決める（バックグラウンドでtimerが間引かれても追いつく）
    const t0 = performance.now();
    const iv = setInterval(() => {
      const chars = Math.min(text.length, Math.floor(((performance.now() - t0) / 1000) * cps));
      setN(chars);
      if (chars >= text.length) {
        clearInterval(iv);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      }
    }, 1000 / cps);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  const typing = active && n < text.length;
  return (
    <span>
      {text.slice(0, n)}
      {typing && showCaret && <span className="td-caret" />}
    </span>
  );
}

function Wave() {
  return (
    <span className="td-wave" aria-hidden>
      <i /><i /><i /><i /><i />
    </span>
  );
}

/** 完了チェック行（順番に✓が付いていく） */
function CheckRow({ label, done, sub }: { label: string; done: boolean; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', padding: '0.42rem 0' }}>
      <span
        style={{
          width: '1.05rem',
          height: '1.05rem',
          borderRadius: 999,
          flex: '0 0 auto',
          display: 'grid',
          placeItems: 'center',
          fontSize: '0.6rem',
          fontWeight: 900,
          color: '#fff',
          background: done ? 'var(--mx-success)' : '#d7dbd4',
          transition: 'background .3s',
          marginTop: '0.05rem',
        }}
      >
        ✓
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: done ? 'var(--mx-ink)' : 'var(--mx-subtle)', transition: 'color .3s' }}>
          {label}
        </div>
        {sub && done && <div style={{ fontSize: '0.6rem', color: 'var(--mx-muted)', marginTop: '0.1rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

/** 疑似QRコード（決定論的パターン） */
function QRSvg({ seed, size = 96 }: { seed: number; size?: number }) {
  const cells = useMemo(() => {
    let s = (seed * 2654435761) % 4294967296;
    const rnd = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    const n = 21;
    const grid: boolean[][] = [];
    for (let y = 0; y < n; y++) {
      grid.push([]);
      for (let x = 0; x < n; x++) grid[y].push(rnd() > 0.52);
    }
    return grid;
  }, [seed]);
  const n = 21;
  const u = size / n;
  const finder = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={fx * u} y={fy * u} width={7 * u} height={7 * u} fill="#10221d" />
      <rect x={(fx + 1) * u} y={(fy + 1) * u} width={5 * u} height={5 * u} fill="#fff" />
      <rect x={(fx + 2) * u} y={(fy + 2) * u} width={3 * u} height={3 * u} fill="#10221d" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <rect width={size} height={size} fill="#fff" />
      {cells.map((row, y) =>
        row.map((c, x) => {
          const inFinder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
          return c && !inFinder ? <rect key={`${x}-${y}`} x={x * u} y={y * u} width={u} height={u} fill="#10221d" /> : null;
        }),
      )}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </svg>
  );
}

function ScreenHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="td-screen-header">
      <div>
        <div className="title">{title}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const bubbleBase: CSSProperties = {
  maxWidth: '85%',
  borderRadius: '0.85rem',
  padding: '0.45rem 0.65rem',
  fontSize: '0.7rem',
  lineHeight: 1.55,
  animation: 'td-pop 0.3s cubic-bezier(0.2, 1.2, 0.4, 1)',
};

/* ═══════════ STEP 1: スマホ問診 → 受付QR ═══════════ */

export function PhoneIntakeOverlay({ persona }: { persona: Persona }) {
  const stage = useStages([700, 1100, 1100, 1100, 900, 1300]);
  const shownLines = Math.min(stage, persona.intake.length);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [stage]);

  return (
    <div className="td-device td-phone">
      <div className="td-phone-screen">
        <div className="td-phone-notch" />
        <div className="td-phone-status">
          <span>9:12</span>
          <span>●●●</span>
        </div>
        <div style={{ padding: '0.3rem 0.9rem 0.2rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>患者ポータル</div>
          <div style={{ fontSize: '0.58rem', color: 'var(--mx-muted)', fontWeight: 600 }}>予約一覧・問診・チェックイン</div>
        </div>
        <div ref={bodyRef} className="td-phone-body" style={{ overflowY: 'auto', gap: '0.45rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {persona.intake.slice(0, shownLines).map((line, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: line.who === 'pt' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    ...bubbleBase,
                    background: line.who === 'pt' ? 'var(--mx-teal)' : '#fff',
                    color: line.who === 'pt' ? '#fff' : 'var(--mx-ink)',
                    border: line.who === 'pt' ? 'none' : '1px solid var(--mx-border-light)',
                  }}
                >
                  {line.who === 'dr' && <span className="td-chip-ai" style={{ marginRight: '0.35rem' }}>✦ AI問診</span>}
                  {line.text}
                </div>
              </div>
            ))}

            {stage >= 5 && (
              <div
                style={{
                  background: 'var(--mx-teal-light)',
                  border: '1px solid var(--mx-teal-border)',
                  borderRadius: '0.7rem',
                  padding: '0.55rem 0.65rem',
                  animation: 'td-pop 0.3s cubic-bezier(0.2,1.2,0.4,1)',
                }}
              >
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--mx-teal-dark)', marginBottom: '0.25rem' }}>
                  ✦ AIが問診票を作成しました
                </div>
                <div style={{ fontSize: '0.66rem', lineHeight: 1.6, color: 'var(--mx-ink)' }}>
                  <TypeText text={persona.intakeSummary} active cps={45} />
                </div>
              </div>
            )}

            {stage >= 6 && (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid var(--mx-border)',
                  borderRadius: '0.8rem',
                  padding: '0.7rem',
                  textAlign: 'center',
                  animation: 'td-pop 0.35s cubic-bezier(0.2,1.2,0.4,1)',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 800 }}>受付QRを発行しました</div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                  <QRSvg seed={persona.queueNo} size={92} />
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--mx-muted)', fontWeight: 600 }}>
                  本日 10:30　内科　担当: {DOCTOR_ROOM1}医師
                </div>
                <div style={{ fontSize: '0.58rem', color: 'var(--mx-subtle)', marginTop: '0.2rem' }}>
                  クリニックのセルフ受付にかざしてください
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ STEP 2: キオスク受付 ═══════════ */

export function KioskOverlay({ persona }: { persona: Persona }) {
  const stage = useStages([1300, 500, 500, 500, 900, 900]);
  const checks = [
    { label: '生年月日', value: '19**年**月**日' },
    { label: '携帯番号 下4桁', value: '**76' },
    { label: '姓名カナ', value: persona.kana },
  ];

  return (
    <div className="td-device td-kiosk">
      <div className="td-kiosk-screen">
        <ScreenHeader title="受付チェックイン" sub={CLINIC_NAME} />
        <div style={{ flex: 1, padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {stage < 5 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <div style={{ position: 'relative', flex: '0 0 auto' }}>
                  <QRSvg seed={persona.queueNo} size={86} />
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      height: 3,
                      background: 'var(--mx-teal)',
                      boxShadow: '0 0 10px rgba(15,118,110,0.8)',
                      animation: stage === 0 ? 'td-scanline 1.1s ease-in-out infinite alternate' : 'none',
                      opacity: stage === 0 ? 1 : 0,
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                    {stage === 0 ? '受付QRを読み取っています…' : 'QRを確認しました'}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: 'var(--mx-muted)', marginTop: '0.2rem' }}>
                    暗号化トークンで照合します。個人IDは表示されません。
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--mx-border-light)', borderRadius: '0.7rem', padding: '0.55rem 0.75rem' }}>
                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--mx-muted)', marginBottom: '0.15rem' }}>本人確認</div>
                {checks.map((c, i) => (
                  <div key={c.label} className="td-row" style={{ padding: '0.3rem 0', opacity: stage >= i + 1 ? 1 : 0.3, transition: 'opacity .3s' }}>
                    <span style={{ fontSize: '0.66rem', color: 'var(--mx-muted)', fontWeight: 600 }}>{c.label}</span>
                    <span style={{ fontSize: '0.66rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {c.value}
                      {stage >= i + 1 && <span style={{ color: 'var(--mx-success)', fontWeight: 900 }}>✓</span>}
                    </span>
                  </div>
                ))}
              </div>

              {stage >= 4 && (
                <button
                  className="td-next-btn"
                  style={{ background: 'var(--mx-teal)', animation: 'td-pop .3s', transform: 'scale(0.98)' }}
                >
                  この内容で受付する
                </button>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
              <svg width={54} height={54} viewBox="0 0 54 54">
                <circle cx={27} cy={27} r={25} fill="var(--mx-success-light)" stroke="var(--mx-success)" strokeWidth={2.5} />
                <path d="M 16 27 L 24 35 L 39 19" fill="none" stroke="var(--mx-success)" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" className="td-check-anim" />
              </svg>
              <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>受付が完了しました</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--mx-muted)', fontWeight: 600 }}>受付番号</div>
              <div style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1, color: 'var(--mx-teal-dark)', fontVariantNumeric: 'tabular-nums', animation: 'td-pop .4s cubic-bezier(0.2,1.4,0.4,1)' }}>
                {persona.queueNo}
              </div>
              <div style={{ fontSize: '0.64rem', color: 'var(--mx-muted)' }}>
                院内ディスプレイとスマホ通知でお呼びします
              </div>
              <div className="td-chip-ai">✦ 所要 3秒 — 受付スタッフの操作なし</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ STEP 3: 待合ディスプレイ ═══════════ */

export function BoardOverlay({ persona }: { persona: Persona }) {
  const stage = useStages([2400, 900]);
  const called = stage >= 1;
  const q = persona.queueNo;

  const cell = (num: number, kind: 'call' | 'consult' | 'wait', room?: string, highlight = false): ReactNode => (
    <div
      key={`${kind}-${num}`}
      style={{
        border: `2px solid ${kind === 'call' ? '#d97706' : kind === 'consult' ? 'var(--mx-teal)' : 'var(--mx-border)'}`,
        background: kind === 'call' ? '#fffaf0' : kind === 'consult' ? 'var(--mx-teal-light)' : '#fff',
        borderRadius: '0.6rem',
        padding: '0.45rem 0.6rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        boxShadow: highlight ? '0 0 0 4px rgba(217,119,6,0.25)' : 'none',
        animation: highlight ? 'td-pop 0.5s cubic-bezier(0.2,1.4,0.4,1)' : undefined,
      }}
    >
      <span style={{ fontSize: kind === 'wait' ? '1.3rem' : '1.9rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {num}
      </span>
      {room && (
        <span style={{ fontSize: '0.6rem', fontWeight: 800, color: kind === 'call' ? '#9a3412' : 'var(--mx-teal-dark)' }}>
          {room}
        </span>
      )}
    </div>
  );

  return (
    <div className="td-device td-board" style={{ position: 'relative' }}>
      <div className="td-board-screen">
        <ScreenHeader
          title="Medixus 待合表示"
          sub={CLINIC_NAME}
          right={<span style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.9 }}>音声呼出 ON</span>}
        />
        <div style={{ padding: '0.8rem 0.9rem', display: 'grid', gap: '0.7rem' }}>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#9a3412', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>お呼び出し中</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {cell(21, 'call', '第2診察室')}
              {called && cell(q, 'call', '第1診察室', true)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--mx-teal-dark)', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>診察中</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {cell(19, 'consult', '第1')}
                {cell(20, 'consult', '第2')}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--mx-muted)', letterSpacing: '0.1em', marginBottom: '0.35rem' }}>待合中</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {!called && cell(q, 'wait')}
                {cell(q + 1, 'wait')}
                {cell(q + 3, 'wait')}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.58rem', color: 'var(--mx-subtle)', fontWeight: 600 }}>
            患者名は表示していません — 番号でお呼びします
          </div>
        </div>
      </div>

      {called && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-1.4rem',
            transform: 'translateX(-50%)',
            width: 'max-content',
            maxWidth: '92%',
            background: '#10221d',
            color: '#ecfeff',
            borderRadius: 999,
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '0.45rem 0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 0.8rem 1.8rem rgba(16,34,29,0.35)',
            animation: 'td-pop 0.4s cubic-bezier(0.2,1.2,0.4,1)',
          }}
        >
          <span aria-hidden>🔔</span>
          スマホに呼出通知 — {q}番の方、第1診察室へお入りください
        </div>
      )}
    </div>
  );
}

/* ═══════════ STEP 4: 医師モニター（AIカルテ） ═══════════ */

export function MonitorOverlay({ persona }: { persona: Persona }) {
  const chat = persona.chat;
  // chatは1.35s間隔 → その後 SOAP typewrite（完了に同期して確認フローが進む）
  const chatDelays = chat.map(() => 1350);
  const stage = useStages([900, ...chatDelays, 400]);
  const n = chat.length;
  const shownChat = Math.max(0, Math.min(stage - 1, n));
  const soapStart = stage >= n + 1;
  const [soapDone, setSoapDone] = useState(0);
  const [confirmStage, setConfirmStage] = useState(0);
  // SOAP4項目のタイピングが終わってから 医師確認 → 反映済 → 会計送付
  useEffect(() => {
    if (soapDone < 4) return;
    const t1 = setTimeout(() => setConfirmStage(1), 500);
    const t2 = setTimeout(() => setConfirmStage(2), 1800);
    const t3 = setTimeout(() => setConfirmStage(3), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [soapDone]);
  const candidates = soapDone >= 2;
  const confirmReady = confirmStage >= 1;
  const confirmed = confirmStage >= 2;
  const flowDone = confirmStage >= 3;

  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [shownChat]);

  const soapFields: Array<{ key: 'S' | 'O' | 'A' | 'P'; label: string; text: string }> = [
    { key: 'S', label: 'S（Subjective）: 主訴・病歴', text: persona.soap.s },
    { key: 'O', label: 'O（Objective）: 所見・検査', text: persona.soap.o },
    { key: 'A', label: 'A（Assessment）: 評価・診断', text: persona.soap.a },
    { key: 'P', label: 'P（Plan）: 計画・処置', text: persona.soap.p },
  ];

  return (
    <div className="td-device td-monitor">
      <div className="td-monitor-screen">
        <ScreenHeader
          title="医師ワークスペース — 診察"
          sub={`${persona.name}（${persona.age}）・第1診察室・${DOCTOR_ROOM1}医師`}
          right={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6rem', fontWeight: 800 }}>
              <Wave /> 音声入力中
            </span>
          }
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)', minHeight: '20rem' }}>
          {/* 左: 会話（診察時メモ / 音声文字起こし） */}
          <div style={{ borderRight: '1px solid var(--mx-border-light)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ padding: '0.5rem 0.7rem', fontSize: '0.6rem', fontWeight: 800, color: 'var(--mx-muted)', borderBottom: '1px solid var(--mx-border-light)' }}>
              診察時メモ / 音声文字起こし
            </div>
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '17rem' }}>
              {chat.slice(0, shownChat).map((line, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: line.who === 'pt' ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      ...bubbleBase,
                      fontSize: '0.64rem',
                      background: line.who === 'pt' ? '#eef6f3' : '#fff',
                      border: '1px solid var(--mx-border-light)',
                    }}
                  >
                    <span style={{ fontSize: '0.52rem', fontWeight: 800, color: 'var(--mx-subtle)', display: 'block', marginBottom: '0.1rem' }}>
                      {line.who === 'pt' ? persona.name : `${DOCTOR_ROOM1}医師`}
                    </span>
                    {line.text}
                  </div>
                </div>
              ))}
              {shownChat < n && (
                <div style={{ fontSize: '0.6rem', color: 'var(--mx-teal-dark)', fontWeight: 700, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <Wave /> 聞き取り中…
                </div>
              )}
            </div>
          </div>

          {/* 右: SOAP + AI候補 */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div className="td-row" style={{ padding: '0.5rem 0.7rem', borderBottom: '1px solid var(--mx-border-light)' }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--mx-muted)' }}>カルテ（SOAP）</span>
              <span className="td-chip-ai">✦ AIでSOAP自動生成 — 医師確認必須</span>
            </div>
            <div style={{ flex: 1, padding: '0.55rem 0.7rem', display: 'grid', gap: '0.45rem', overflowY: 'auto' }}>
              {soapFields.map((f, i) => (
                <div key={f.key} style={{ background: '#fff', border: '1px solid var(--mx-border-light)', borderRadius: '0.5rem', padding: '0.4rem 0.55rem' }}>
                  <div style={{ fontSize: '0.54rem', fontWeight: 800, color: 'var(--mx-teal-dark)', marginBottom: '0.15rem' }}>{f.label}</div>
                  <div style={{ fontSize: '0.62rem', lineHeight: 1.55, color: 'var(--mx-ink)', minHeight: '0.9rem' }}>
                    {soapStart && soapDone >= i ? (
                      <TypeText text={f.text} active cps={55} onDone={() => setSoapDone((d) => Math.max(d, i + 1))} />
                    ) : (
                      <span style={{ color: 'var(--mx-subtle)' }}>—</span>
                    )}
                  </div>
                </div>
              ))}

              {candidates && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', animation: 'td-pop .35s' }}>
                  <div style={{ background: 'var(--mx-teal-light)', border: '1px solid var(--mx-teal-border)', borderRadius: '0.5rem', padding: '0.4rem 0.55rem' }}>
                    <div style={{ fontSize: '0.54rem', fontWeight: 800, color: 'var(--mx-teal-dark)' }}>処方候補</div>
                    {persona.rxCandidates.map((rx) => (
                      <div key={rx} style={{ fontSize: '0.6rem', fontWeight: 600, marginTop: '0.2rem' }}>・{rx}</div>
                    ))}
                  </div>
                  <div style={{ background: '#fff', border: '1px solid var(--mx-border-light)', borderRadius: '0.5rem', padding: '0.4rem 0.55rem' }}>
                    <div style={{ fontSize: '0.54rem', fontWeight: 800, color: 'var(--mx-muted)' }}>検査候補</div>
                    {persona.labCandidates.length > 0 ? (
                      persona.labCandidates.map((lab) => (
                        <div key={lab} style={{ fontSize: '0.6rem', fontWeight: 600, marginTop: '0.2rem' }}>・{lab}</div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.6rem', color: 'var(--mx-subtle)', marginTop: '0.2rem' }}>提案なし（経過観察）</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="td-row" style={{ padding: '0.5rem 0.7rem', borderTop: '1px solid var(--mx-border-light)', background: 'var(--mx-off-white)' }}>
              {!confirmed ? (
                <>
                  <span style={{ fontSize: '0.58rem', color: 'var(--mx-muted)', fontWeight: 600 }}>
                    {confirmReady ? 'AI下書きが完成しました' : 'AIが下書きを作成中…'}
                  </span>
                  <button
                    style={{
                      border: 'none',
                      borderRadius: 999,
                      padding: '0.35rem 0.9rem',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      cursor: 'default',
                      color: '#fff',
                      background: confirmReady ? 'var(--mx-teal)' : '#cbd5d1',
                      boxShadow: confirmReady ? '0 0 0 5px rgba(15,118,110,0.18)' : 'none',
                      transition: 'all .3s',
                    }}
                  >
                    医師確認
                  </button>
                </>
              ) : (
                <>
                  <span className="mx-chip mx-chip-active" style={{ fontSize: '0.6rem' }}>SOAP反映済</span>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, color: flowDone ? 'var(--mx-success)' : 'var(--mx-muted)', transition: 'color .3s' }}>
                    カルテ署名 ✓ {flowDone && ' → 会計送付（自動） ✓'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="td-monitor-foot" />
    </div>
  );
}

/* ═══════════ STEP 5: 専門医マッチング ═══════════ */

export function MatchingOverlay({ persona }: { persona: Persona }) {
  const m = persona.matching;
  const stage = useStages([1900, 1500, 1200, 5200, 800]);
  // 0: 検索中 / 1: マッチ / 2: 招待→接続 / 3: 専門医が話す / 4: カルテ追記 / 5: まとめチップ
  const searching = stage === 0;
  const matched = stage >= 1;
  const connected = stage >= 3;
  const noted = stage >= 4;

  return (
    <div className="td-device" style={{ width: 'min(24rem, 90vw)' }}>
      <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: '1.1rem', overflow: 'hidden', border: '1px solid var(--mx-border-light)' }}>
        <ScreenHeader
          title="専門医マッチング"
          sub="提携医療法人 — 医師プール"
          right={
            searching ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.6rem', fontWeight: 800 }}>
                <Wave /> 検索中
              </span>
            ) : (
              <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>✓ マッチ</span>
            )
          }
        />
        <div style={{ padding: '0.85rem 0.95rem', display: 'grid', gap: '0.6rem' }}>
          {/* 検索条件 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {['検査結果', 'AI問診サマリ', '本日の所見'].map((c) => (
              <span key={c} className="td-chip-ai">✦ {c}</span>
            ))}
          </div>

          {searching && (
            <div style={{ background: 'var(--mx-off-white)', border: '1px solid var(--mx-border-light)', borderRadius: '0.7rem', padding: '0.7rem 0.8rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--mx-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Wave /> 全国の提携医師プールから最適な専門医を検索しています…
            </div>
          )}

          {matched && (
            <div style={{ background: '#fff', border: '1px solid var(--mx-border)', borderRadius: '0.8rem', padding: '0.7rem 0.8rem', animation: 'td-pop .35s cubic-bezier(0.2,1.2,0.4,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <svg width={40} height={40} viewBox="-30 -34 60 64" aria-hidden style={{ flex: '0 0 auto' }}>
                  <circle cx={0} cy={2} r={27} fill="var(--mx-teal)" opacity={0.12} />
                  <rect x={-13} y={-6} width={26} height={30} rx={13} fill="#e8f4f1" stroke="var(--mx-teal)" strokeWidth={2} />
                  <circle cx={0} cy={-15} r={11} fill="#f3d9c3" />
                  <path d="M -11 -17 A 11 11 0 0 1 11 -17 L 11 -13.5 L -11 -13.5 Z" fill="#3f3a36" />
                </svg>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--mx-teal-dark)' }}>{m.specialty}</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900 }}>{m.doctor}</div>
                  <div style={{ fontSize: '0.58rem', fontWeight: 700, color: connected ? 'var(--mx-success)' : 'var(--mx-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: '0.45rem', height: '0.45rem', borderRadius: 999, background: connected ? 'var(--mx-success)' : '#d97706', display: 'inline-block' }} />
                    {connected ? 'モニターに合流中（オンライン）' : stage >= 2 ? 'モニターに招待しています…' : 'オンライン待機中'}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.62rem', lineHeight: 1.65, color: 'var(--mx-muted)', borderTop: '1px dashed var(--mx-border-light)', paddingTop: '0.45rem' }}>
                推奨理由: {m.reason}
              </div>
            </div>
          )}

          {connected && (
            <div style={{ background: '#10221d', color: '#f0fbf8', borderRadius: '0.8rem', padding: '0.7rem 0.8rem', animation: 'td-pop .35s cubic-bezier(0.2,1.2,0.4,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#9ff0e2' }}>● LIVE — {m.specialty} {m.doctor}</span>
                <span style={{ color: '#9ff0e2' }}><Wave /></span>
              </div>
              <div style={{ fontSize: '0.68rem', lineHeight: 1.7 }}>
                <TypeText text={`「${m.advice}」`} active cps={26} />
              </div>
            </div>
          )}

          {noted && (
            <div style={{ display: 'grid', gap: '0.4rem', animation: 'td-pop .3s' }}>
              <CheckRow label="専門医の所見をカルテに自動追記" sub="AI下書き・主治医の確認済み" done />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {['移動ゼロ', '紹介状ゼロ', 'たらい回しゼロ'].map((c) => (
                  <span key={c} style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--mx-success)', background: 'var(--mx-success-light)', border: '1px solid var(--mx-success-border)', borderRadius: 999, padding: '0.2rem 0.6rem' }}>
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ STEP 6: 会計（スマホ領収） ═══════════ */

export function PhonePayOverlay({ persona }: { persona: Persona }) {
  const stage = useStages([700, 800, 800, 800, 900]);
  const rows = [
    { label: '算定候補の自動生成', sub: '診療内容から自動作成' },
    { label: '保険点数の照合・確定', sub: `保険点数 ${persona.points}点（3割負担）` },
    { label: 'キャッシュレス決済', sub: '登録済みの支払い方法で自動精算' },
    { label: '領収証・診療明細書の発行', sub: 'スマホでいつでも表示できます' },
  ];
  const done = stage >= rows.length + 1;

  return (
    <div className="td-device td-phone">
      <div className="td-phone-screen">
        <div className="td-phone-notch" />
        <div className="td-phone-status">
          <span>11:02</span>
          <span>●●●</span>
        </div>
        <div className="td-phone-body" style={{ gap: '0.6rem', paddingTop: '0.6rem' }}>
          <div style={{ textAlign: 'center', marginTop: '0.4rem' }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--mx-muted)', letterSpacing: '0.12em' }}>お会計</div>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, fontVariantNumeric: 'tabular-nums', marginTop: '0.2rem' }}>
              ¥{persona.yen.toLocaleString()}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginTop: '0.4rem',
                background: done ? 'var(--mx-success-light)' : 'var(--mx-off-white)',
                border: `1px solid ${done ? 'var(--mx-success-border)' : 'var(--mx-border)'}`,
                color: done ? 'var(--mx-success)' : 'var(--mx-muted)',
                borderRadius: 999,
                fontSize: '0.66rem',
                fontWeight: 800,
                padding: '0.28rem 0.8rem',
                transition: 'all .4s',
              }}
            >
              {done ? '✓ 支払い完了 — 窓口に並ぶ必要はありません' : '自動精算を処理中…'}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--mx-border-light)', borderRadius: '0.8rem', padding: '0.5rem 0.75rem' }}>
            {rows.map((r, i) => (
              <CheckRow key={r.label} label={r.label} sub={r.sub} done={stage >= i + 1} />
            ))}
          </div>

          {done && (
            <button
              style={{
                border: '1px solid var(--mx-border)',
                background: '#fff',
                borderRadius: 999,
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--mx-ink)',
                padding: '0.5rem',
                animation: 'td-pop .3s',
              }}
            >
              領収書を表示
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ STEP 6: 調剤キュー（薬局） ═══════════ */

export function PharmacyOverlay({ persona }: { persona: Persona }) {
  const stage = useStages([800, 900, 900, 1100]);
  const steps = ['受付', '確認中', '服薬指導中', '調剤済'];
  const cur = Math.min(stage, steps.length - 1);

  return (
    <div className="td-device td-board">
      <div className="td-board-screen">
        <ScreenHeader title="調剤キュー" sub="処方箋薬局（門前）— 薬剤師ワークスペース" />
        <div style={{ padding: '0.8rem 0.9rem', display: 'grid', gap: '0.65rem' }}>
          <div
            style={{
              background: 'var(--mx-teal-light)',
              border: '1px solid var(--mx-teal-border)',
              borderRadius: '0.6rem',
              padding: '0.5rem 0.7rem',
              fontSize: '0.66rem',
              fontWeight: 700,
              color: 'var(--mx-teal-dark)',
            }}
          >
            ✦ 電子処方箋を受信しました — 診察終了と同時（患者到着の9分前）
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--mx-border)', borderRadius: '0.7rem', padding: '0.65rem 0.8rem' }}>
            <div className="td-row">
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{persona.name}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--mx-muted)', fontWeight: 600, marginTop: '0.1rem' }}>
                  処方箋 #R-2417 ・ 薬剤 {persona.rxItems}品目 ・ {DOCTOR_ROOM1}医師（{CLINIC_NAME}）
                </div>
              </div>
              <span className={`mx-chip ${cur >= 3 ? 'mx-chip-active' : 'mx-chip-waiting'}`} style={{ fontSize: '0.6rem' }}>
                {steps[cur]}
              </span>
            </div>

            {/* stepper */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.7rem' }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : '0 0 auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', minWidth: '3.2rem' }}>
                    <span
                      style={{
                        width: '1.15rem',
                        height: '1.15rem',
                        borderRadius: 999,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '0.58rem',
                        fontWeight: 900,
                        color: '#fff',
                        background: i <= cur ? 'var(--mx-teal)' : '#d7dbd4',
                        transition: 'background .35s',
                      }}
                    >
                      {i < cur ? '✓' : i + 1}
                    </span>
                    <span style={{ fontSize: '0.54rem', fontWeight: 700, color: i <= cur ? 'var(--mx-teal-dark)' : 'var(--mx-subtle)' }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: i < cur ? 'var(--mx-teal)' : '#e3e6e0', margin: '0 0.3rem 0.9rem', transition: 'background .35s' }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.6rem', color: 'var(--mx-muted)', marginTop: '0.3rem' }}>
              禁忌・相互作用チェック済み ✓ ／ 在庫引当済み ✓
            </div>
          </div>

          {stage >= 4 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#10221d',
                color: '#ecfeff',
                borderRadius: 999,
                fontSize: '0.66rem',
                fontWeight: 700,
                padding: '0.45rem 0.9rem',
                justifySelf: 'center',
                animation: 'td-pop 0.4s cubic-bezier(0.2,1.2,0.4,1)',
              }}
            >
              <span aria-hidden>📱</span> {persona.name}さんのスマホに通知 — お薬の準備ができました
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ STEP 7: 再診（AI過去カルテ要約） ═══════════ */

export function RevisitOverlay({ persona }: { persona: Persona }) {
  const stage = useStages([600, 700, 700, 900, 600, 600, 600, 800]);
  const flowRows = [
    { label: '受付（セルフ受付・3秒）', sub: '再診は本人確認もワンタップ' },
    { label: '問診: 前回からの変化を確認', sub: '質問はAIが前回カルテから自動生成' },
    { label: 'AI下書き → 医師確認 → カルテ署名', sub: '' },
    { label: '会計送付 → 支払確定（自動）', sub: '滞在 12分で完了' },
  ];

  return (
    <div className="td-device td-monitor" style={{ width: 'min(34rem, 94vw)' }}>
      <div className="td-monitor-screen">
        <ScreenHeader title="医師ワークスペース — 再診" sub={`${persona.name}（${persona.age}）・第1診察室`} />
        <div style={{ padding: '0.75rem 0.85rem', display: 'grid', gap: '0.6rem' }}>
          <div style={{ background: 'var(--mx-teal-light)', border: '1px solid var(--mx-teal-border)', borderRadius: '0.7rem', padding: '0.6rem 0.75rem' }}>
            <div className="td-row" style={{ marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--mx-teal-dark)' }}>✦ AI過去カルテ要約</span>
              <span style={{ fontSize: '0.54rem', fontWeight: 700, color: 'var(--mx-subtle)' }}>診察前に自動生成</span>
            </div>
            {persona.revisitSummary.map((line, i) => (
              <div key={i} style={{ fontSize: '0.64rem', lineHeight: 1.6, color: 'var(--mx-ink)', opacity: stage >= i + 1 ? 1 : 0.15, transition: 'opacity .4s' }}>
                ・{line}
              </div>
            ))}
            {stage >= 4 && (
              <div style={{ marginTop: '0.4rem', fontSize: '0.64rem', fontWeight: 800, color: 'var(--mx-teal-dark)', animation: 'td-pop .3s' }}>
                → {persona.revisitPlan}
              </div>
            )}
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--mx-border-light)', borderRadius: '0.7rem', padding: '0.4rem 0.75rem' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, color: 'var(--mx-muted)', padding: '0.25rem 0' }}>本日の流れ</div>
            {flowRows.map((r, i) => (
              <CheckRow key={r.label} label={r.label} sub={r.sub || undefined} done={stage >= i + 5} />
            ))}
          </div>
        </div>
      </div>
      <div className="td-monitor-foot" />
    </div>
  );
}
