/** Medixus Clinic ワードマーク（十字アイコン + ロゴタイプ） */
export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 30 : size === 'sm' ? 18 : 22;
  const fs = size === 'lg' ? '1.35rem' : size === 'sm' ? '0.85rem' : '1.02rem';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5em' }}>
      <svg width={s} height={s} viewBox="0 0 32 32" aria-hidden>
        <circle cx={16} cy={16} r={15} fill="var(--mx-teal)" />
        <rect x={8} y={13} width={16} height={6} rx={2} fill="#fff" />
        <rect x={13} y={8} width={6} height={16} rx={2} fill="#fff" />
      </svg>
      <span style={{ fontSize: fs, fontWeight: 800, letterSpacing: '0.01em', color: 'var(--mx-ink)', whiteSpace: 'nowrap' }}>
        Medixus <span style={{ color: 'var(--mx-teal-dark)' }}>Clinic</span>
      </span>
    </span>
  );
}
