/**
 * Medixus Clinic — 紹介ランディングページ。
 * ほぼ無人・待ち時間ゼロ・医師は診察だけ、のスマートクリニック構想を紹介し、
 * テストドライブ（仮想受診）へ誘導する。
 */

import { useEffect, useRef, type ReactNode } from 'react';
import { ClinicWorld } from '../testdrive/world';
import { PERSONAS, STEPS } from '../testdrive/script';
import { Wordmark } from '../components/Wordmark';
import './landing.css';

/** スクロールで現れるラッパー */
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('in');
            io.disconnect();
          }
        });
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="reveal" style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

const PILLARS = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <path d="M14 14h3v3h-3zM20 14h1M14 20h1M20 20h1" />
      </svg>
    ),
    title: '受付は、無人。',
    body: '受付QRをかざして3秒でチェックイン。本人確認も自動で終わり、受付番号が発行されます。受付カウンターに人は立っていません。',
    tag: 'QR受付 3秒',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.6" fill="#0f766e" stroke="none" />
      </svg>
    ),
    title: '医師は、診察だけ。',
    body: 'AIが診察の会話を聞き取り、SOAPカルテと処方候補を下書き。医師は目の前の患者に集中し、最後に確認して署名するだけ。事務作業はありません。',
    tag: 'AIカルテ（医師確認必須）',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12l5 5L20 6" />
      </svg>
    ),
    title: '会計も薬も、待たない。',
    body: '診察室を出た瞬間には算定・保険点数照合・キャッシュレス決済まで完了。電子処方箋は薬局へ先回りし、着く頃にはお薬の準備ができています。',
    tag: '会計0分 × 処方先回り',
  },
];

const NUMBERS = [
  { value: '3', unit: '秒', label: 'チェックイン' },
  { value: '0', unit: '分', label: '会計の待ち時間' },
  { value: '12', unit: '分', label: '再診の滞在時間' },
  { value: '0', unit: '人', label: '受付・会計スタッフ' },
];

export default function Landing() {
  // ジャーニーはテストドライブのステップ定義をそのまま見せる（STEP 1〜再診）
  const journey = STEPS.slice(1, STEPS.length - 1);

  return (
    <div className="lp-root">
      {/* ── nav ── */}
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#/" style={{ textDecoration: 'none' }} aria-label="Medixus Clinic">
            <Wordmark />
          </a>
          <div className="lp-nav-links">
            <a href="#concept">コンセプト</a>
            <a href="#journey">通院体験</a>
            <a href="#numbers">数字で見る</a>
          </div>
          <a className="lp-nav-cta" href="#/test-drive">
            仮想受診する <span aria-hidden>→</span>
          </a>
        </div>
      </nav>

      {/* ── hero ── */}
      <header className="lp-hero">
        <div className="lp-container">
          <Reveal>
            <span className="lp-eyebrow">MEDIXUS CLINIC — AIスマートクリニック構想</span>
            <h1>
              待たない。並ばない。
              <br />
              医師は、<em>診るだけ。</em>
            </h1>
            <p className="lead">
              受付3秒、会計0分、薬は先回り。
              <br />
              AIがクリニック運営を裏側で担う、ほぼ無人のスマートクリニック。
              <br />
              人の時間は、診察のためだけに使います。
            </p>
            <div className="lp-hero-ctas">
              <a className="lp-btn-primary" href="#/test-drive">
                仮想受診してみる <span className="arrow" aria-hidden>→</span>
              </a>
              <a className="lp-btn-ghost" href="#concept">
                コンセプトを見る
              </a>
            </div>
            <div className="lp-hero-note">所要 約2分・登録不要・すべて合成データのデモです</div>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="lp-hero-visual">
            <div className="lp-hero-world">
              <ClinicWorld fluid flows={['kiosk', 'exam', 'billing', 'pharmacy']} marker={null} step={8} />
            </div>
            <span className="lp-float" style={{ top: '58%', left: '6%' }}>
              <span className="dot" /> チェックイン <strong>3秒</strong>
            </span>
            <span className="lp-float" style={{ top: '18%', left: '14%', animationDelay: '1.2s' }}>
              <span className="dot" /> AIカルテ <strong>下書き 6.8秒</strong>
            </span>
            <span className="lp-float" style={{ top: '64%', right: '18%', animationDelay: '2.1s' }}>
              <span className="dot" /> 会計待ち <strong>0分</strong>
            </span>
            <span className="lp-float" style={{ top: '30%', right: '5%', animationDelay: '3s' }}>
              <span className="dot" /> 処方箋 <strong>薬局へ先回り</strong>
            </span>
          </div>
        </Reveal>
      </header>

      {/* ── concept pillars ── */}
      <section className="lp-section" id="concept">
        <Reveal>
          <div className="lp-section-head">
            <span className="lp-eyebrow">CONCEPT</span>
            <h2>クリニックから「待つ」をなくす</h2>
            <p>
              通院時間の大半は、診察ではなく「待ち時間と手続き」です。
              Medixus Clinic は受付・カルテ・会計・調剤連携を自動化し、
              人と人の時間を診察に返します。
            </p>
          </div>
        </Reveal>
        <div className="lp-pillars">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 120}>
              <div className="lp-pillar">
                <div className="icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <span className="tag">✦ {p.tag}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── journey ── */}
      <section className="lp-section" id="journey">
        <Reveal>
          <div className="lp-section-head">
            <span className="lp-eyebrow">PATIENT JOURNEY</span>
            <h2>ある日の通院は、こう流れる</h2>
            <p>初診でも滞在18分。再診なら12分。その間、書類を書くことは一度もありません。</p>
          </div>
        </Reveal>
        <div className="lp-journey">
          {journey.map((s, i) => (
            <Reveal key={s.id} delay={i * 60}>
              <div className="lp-journey-item">
                <div className="lp-journey-num">{i + 1}</div>
                <div className="lp-journey-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  {s.hud && (
                    <span className="lp-journey-chip">
                      {s.hud.label}: {s.hud.value}
                    </span>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── numbers ── */}
      <section className="lp-numbers" id="numbers">
        <div className="lp-numbers-inner">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.label} delay={i * 100}>
              <div className="lp-number">
                <div className="value">
                  {n.value}
                  <span className="unit">{n.unit}</span>
                </div>
                <div className="label">{n.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="lp-numbers-note">
          ※ 数値はコンセプト設計に基づく目標値です（合成データによるデモ）。
        </div>
      </section>

      {/* ── test drive CTA ── */}
      <section className="lp-cta-section" id="test-drive-cta">
        <Reveal>
          <div className="lp-cta-card">
            <span className="lp-eyebrow">TEST DRIVE</span>
            <h2>あなたの分身で、仮想受診。</h2>
            <p>
              3人の患者から分身を選んで、受付から診察・会計・おくすりまでを一周。
              スマートクリニックの「速さ」を、画面の中で体験できます。
            </p>
            <div className="lp-cta-personas" aria-hidden>
              {PERSONAS.map((p) => (
                <svg key={p.id} viewBox="-30 -34 60 64">
                  <circle cx={0} cy={2} r={27} fill={p.color} opacity={0.15} />
                  <rect x={-13} y={-6} width={26} height={30} rx={13} fill={p.color} />
                  <circle cx={0} cy={-15} r={11} fill="#f3d9c3" />
                  <path d="M -11 -17 A 11 11 0 0 1 11 -17 L 11 -13.5 L -11 -13.5 Z" fill={p.colorDark} />
                </svg>
              ))}
            </div>
            <div className="lp-cta-actions">
              <a className="lp-btn-primary" href="#/test-drive">
                テストドライブをはじめる <span className="arrow" aria-hidden>→</span>
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div>
            <Wordmark size="sm" />
            <small style={{ marginTop: '0.5rem' }}>
              ほぼ無人のAIスマートクリニック構想 — コンセプトサイト
            </small>
          </div>
          <small>
            本サイトの画面・数値はすべて合成データによるデモです。
            <br />© 2026 Medixus
          </small>
        </div>
      </footer>
    </div>
  );
}
