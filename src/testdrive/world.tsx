/**
 * ClinicWorld — 俯瞰で見るスマートクリニックの街区（SVG）。
 * カメラ（親のtransform）でパン・ズームされる世界。人物・設備・AIデータフローを描く。
 * fluid=true のときは親幅にフィットする装飾用（LPヒーロー等）。
 */

import { memo, type ReactNode } from 'react';
import { WORLD_W, WORLD_H, SPOTS, CLINIC_NAME, DOCTOR_ROOM1, DOCTOR_ROOM2, type Vec } from './script';

/* ── tiny drawing helpers ── */

function Person({
  x,
  y,
  color,
  hair = '#3f3a36',
  flip = false,
  dim = false,
}: {
  x: number;
  y: number;
  color: string;
  hair?: string;
  flip?: boolean;
  dim?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})${flip ? ' scale(-1,1)' : ''}`} opacity={dim ? 0.55 : 1}>
      <ellipse cx={0} cy={17} rx={11} ry={4} fill="rgba(16,34,29,0.14)" />
      <rect x={-9} y={-6} width={18} height={22} rx={9} fill={color} />
      <circle cx={0} cy={-13} r={7.5} fill="#f3d9c3" />
      <path d="M -7.5 -14.5 A 7.5 7.5 0 0 1 7.5 -14.5 L 7.5 -12.5 L -7.5 -12.5 Z" fill={hair} />
    </g>
  );
}

function Chair({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-16} y={-12} width={32} height={26} rx={7} fill="#e3efe9" stroke="#c2ddd3" strokeWidth={2} />
      <rect x={-16} y={-16} width={32} height={7} rx={3.5} fill="#c2ddd3" />
    </g>
  );
}

function Plant({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={14} rx={12} ry={4} fill="rgba(16,34,29,0.10)" />
      <path d="M -8 12 L 8 12 L 6 24 L -6 24 Z" fill="#c8b99a" />
      <ellipse cx={-7} cy={2} rx={7} ry={11} fill="#7fb59a" transform="rotate(-24 -7 2)" />
      <ellipse cx={7} cy={2} rx={7} ry={11} fill="#8fc3a6" transform="rotate(22 7 2)" />
      <ellipse cx={0} cy={-4} rx={7} ry={13} fill="#6ca88b" />
    </g>
  );
}

function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={26} rx={20} ry={6} fill="rgba(16,34,29,0.10)" />
      <rect x={-3.5} y={2} width={7} height={24} rx={3} fill="#a08a68" />
      <circle cx={0} cy={-8} r={24} fill="#8fc3a6" />
      <circle cx={-14} cy={0} r={15} fill="#7fb59a" />
      <circle cx={13} cy={-2} r={14} fill="#9ccdb2" />
    </g>
  );
}

function Desk({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={8} fill="#efe8da" stroke="#ded2b8" strokeWidth={2.5} />;
}

function Bed({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={0} width={54} height={104} rx={10} fill="#ffffff" stroke="#d9d5c9" strokeWidth={2.5} />
      <rect x={7} y={8} width={40} height={22} rx={8} fill="#e3efe9" />
      <rect x={7} y={38} width={40} height={58} rx={8} fill="#f2f7f4" />
    </g>
  );
}

function DeviceScreen({ x, y, w, h, on }: { x: number; y: number; w: number; h: number; on: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="#17211f" />
      <rect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 5} rx={2.5}
        style={{ fill: on ? '#1ba99a' : '#233230', transition: 'fill .5s' }} />
      {on && <rect x={x + 2.5} y={y + 2.5} width={w - 5} height={h - 5} rx={2.5} fill="#d9f7f0" opacity={0.35} />}
    </g>
  );
}

function Kiosk({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={26} rx={18} ry={5} fill="rgba(16,34,29,0.12)" />
      <rect x={-5} y={0} width={10} height={24} rx={4} fill="#2c3634" />
      <g transform="rotate(-8)">
        <rect x={-19} y={-26} width={38} height={28} rx={5} fill="#17211f" />
        <rect x={-15.5} y={-22.5} width={31} height={21} rx={3} style={{ fill: on ? '#1ba99a' : '#2e3d3a', transition: 'fill .5s' }} />
        {on && <rect x={-15.5} y={-22.5} width={31} height={21} rx={3} fill="#d9f7f0" opacity={0.4} />}
      </g>
    </g>
  );
}

function Shelf({ x, y, w }: { x: number; y: number; w: number }) {
  const bottles = [] as ReactNode[];
  const colors = ['#8fc3a6', '#e5b96f', '#d98f7a', '#9db8dd'];
  for (let i = 0; i < Math.floor((w - 16) / 16); i++) {
    bottles.push(
      <rect key={i} x={x + 10 + i * 16} y={y + 6} width={9} height={12} rx={2.5} fill={colors[i % colors.length]} />,
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={24} rx={5} fill="#efe8da" stroke="#ded2b8" strokeWidth={2.5} />
      {bottles}
    </g>
  );
}

/* ── AI data-flow paths (spot → Medixus Core) ── */

const FLOW_PATHS: Record<string, string> = {
  kiosk: `M ${SPOTS.kiosk.x} ${SPOTS.kiosk.y - 30} C 640 600, 940 430, ${SPOTS.core.x - 30} ${SPOTS.core.y + 6}`,
  exam: `M ${SPOTS.monitor.x + 30} ${SPOTS.monitor.y - 20} C 620 250, 960 270, ${SPOTS.core.x - 30} ${SPOTS.core.y - 6}`,
  billing: `M ${SPOTS.checkout.x + 10} ${SPOTS.checkout.y - 26} C 920 660, 1130 500, ${SPOTS.core.x - 16} ${SPOTS.core.y + 22}`,
  pharmacy: `M ${SPOTS.core.x + 16} ${SPOTS.core.y + 22} C 1440 520, 1570 640, ${SPOTS.pharmacyIn.x} ${SPOTS.pharmacyIn.y - 60}`,
};

export type ClinicWorldProps = {
  flows: string[];
  marker: Vec | null;
  onMarkerClick?: () => void;
  /** 診察室モニタ・キオスク等の点灯制御に使う現在ステップ */
  step: number;
  /** 親幅にフィットさせる（LPヒーロー等の装飾用） */
  fluid?: boolean;
  children?: ReactNode;
};

function ClinicWorldBase({ flows, marker, onMarkerClick, step, fluid, children }: ClinicWorldProps) {
  const kioskOn = step >= 2;
  const monitorOn = step === 4 || step === 5 || step >= 8;
  const boardOn = step >= 2;

  return (
    <svg
      width={fluid ? undefined : WORLD_W}
      height={fluid ? undefined : WORLD_H}
      viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
      style={fluid ? { display: 'block', width: '100%', height: 'auto' } : { display: 'block' }}
      aria-hidden
    >
      <defs>
        <pattern id="td-floor" width={46} height={46} patternUnits="userSpaceOnUse">
          <circle cx={23} cy={23} r={1.4} fill="rgba(32,40,39,0.05)" />
        </pattern>
        <linearGradient id="td-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe3e0" />
          <stop offset="1" stopColor="#d5dad6" />
        </linearGradient>
      </defs>

      {/* ── street ── */}
      <rect x={0} y={945} width={WORLD_W} height={80} fill="#eae8dd" />
      <rect x={0} y={1025} width={WORLD_W} height={125} fill="url(#td-road)" />
      <line x1={0} y1={1024} x2={WORLD_W} y2={1024} stroke="#c9cec9" strokeWidth={3} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <rect key={i} x={60 + i * 200} y={1084} width={72} height={7} rx={3.5} fill="#f5f4ec" opacity={0.9} />
      ))}

      {/* ── clinic building ── */}
      <rect x={158} y={166} width={1190} height={790} rx={26} fill="rgba(16,34,29,0.10)" />
      <rect x={150} y={150} width={1190} height={790} rx={26} fill="#fdfcf9" stroke="#d8d3c5" strokeWidth={5} />
      <rect x={150} y={150} width={1190} height={790} rx={26} fill="url(#td-floor)" />

      {/* clinic sign */}
      <g transform="translate(745 118)">
        <circle cx={-170} cy={-4} r={16} fill="#0f766e" />
        <rect x={-176} y={-7} width={12} height={6} rx={2} fill="#fff" />
        <rect x={-173} y={-10} width={6} height={12} rx={2} fill="#fff" />
        <text x={-140} y={6} fontSize={32} fontWeight={800} fill="#3c4644" letterSpacing={3}>
          {CLINIC_NAME}
        </text>
      </g>

      {/* ── rooms ── */}
      {/* 診察室1 */}
      <rect x={192} y={192} width={330} height={350} rx={14} fill="#ffffff" stroke="#e4e0d4" strokeWidth={3} />
      <text x={214} y={228} fontSize={17} fontWeight={700} fill="#9aa29e" letterSpacing={3}>第1診察室</text>
      <text x={214} y={250} fontSize={12.5} fontWeight={600} fill="#b9bfba" letterSpacing={1}>担当: {DOCTOR_ROOM1}医師</text>
      <Desk x={228} y={300} w={120} h={62} />
      <DeviceScreen x={268} y={308} w={44} h={26} on={monitorOn} />
      <Bed x={452} y={220} />
      <Person x={300} y={398} color="#eef4f2" hair="#4a4440" />
      <rect x={286} y={380} width={28} height={9} rx={4} fill="#8fb8ae" opacity={0.9} />
      <Plant x={492} y={498} s={0.9} />

      {/* 診察室2 */}
      <rect x={556} y={192} width={330} height={350} rx={14} fill="#ffffff" stroke="#e4e0d4" strokeWidth={3} />
      <text x={578} y={228} fontSize={17} fontWeight={700} fill="#9aa29e" letterSpacing={3}>第2診察室</text>
      <text x={578} y={250} fontSize={12.5} fontWeight={600} fill="#b9bfba" letterSpacing={1}>担当: {DOCTOR_ROOM2}医師</text>
      <Desk x={592} y={300} w={120} h={62} />
      <DeviceScreen x={632} y={308} w={44} h={26} on />
      <Bed x={816} y={220} />
      <Person x={664} y={398} color="#eef4f2" hair="#5c5148" />
      <Person x={716} y={448} color="#c9b8d8" dim />

      {/* 処置・検査室 */}
      <rect x={920} y={192} width={236} height={350} rx={14} fill="#ffffff" stroke="#e4e0d4" strokeWidth={3} />
      <text x={942} y={228} fontSize={17} fontWeight={700} fill="#9aa29e" letterSpacing={3}>処置・検査室</text>
      <Bed x={952} y={250} />
      <Desk x={1050} y={260} w={80} h={40} />
      <Person x={1064} y={420} color="#f0e0e6" hair="#6b5a52" dim />
      <Plant x={1120} y={498} s={0.85} />

      {/* Medixus Core (server room) */}
      <rect x={1190} y={192} width={122} height={350} rx={14} fill="#f4faf8" stroke="#cfe5de" strokeWidth={3} />
      <text x={1251} y={228} fontSize={13} fontWeight={800} fill="#0f766e" letterSpacing={2} textAnchor="middle">MEDIXUS</text>
      <text x={1251} y={246} fontSize={11} fontWeight={700} fill="#6fa79e" letterSpacing={2} textAnchor="middle">CORE</text>
      <g transform={`translate(${SPOTS.core.x} ${SPOTS.core.y})`}>
        <circle r={44} fill="none" stroke="#0f766e" strokeWidth={2} opacity={0.25} className="td-core-pulse" />
        <circle r={30} fill="none" stroke="#0f766e" strokeWidth={2} opacity={0.4} />
        <circle r={20} fill="#123f36" />
        <circle r={20} fill="none" stroke="#2dd4bf" strokeWidth={2} opacity={0.7} />
        <text y={6} fontSize={17} fontWeight={900} fill="#5eead4" textAnchor="middle">M</text>
      </g>
      <rect x={1210} y={430} width={82} height={86} rx={8} fill="#e7f1ee" stroke="#cfe5de" strokeWidth={2} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={1220} y={442 + i * 24} width={62} height={14} rx={4} fill="#123f36" />
          <circle cx={1230} cy={449 + i * 24} r={2.6} fill="#2dd4bf" />
          <circle cx={1240} cy={449 + i * 24} r={2.6} fill="#5eead4" opacity={0.6} />
        </g>
      ))}

      {/* ── corridor divider & waiting display board ── */}
      <line x1={192} y1={700} x2={770} y2={700} stroke="#eee9dd" strokeWidth={4} />
      <line x1={1180} y1={700} x2={1310} y2={700} stroke="#eee9dd" strokeWidth={4} />
      <g>
        <rect x={862} y={664} width={156} height={44} rx={8} fill="#17211f" />
        <rect x={868} y={670} width={144} height={32} rx={5} fill={boardOn ? '#0e2b26' : '#233230'} />
        {boardOn && (
          <g fontSize={15} fontWeight={800} fill="#5eead4" textAnchor="middle">
            <text x={896} y={692}>21</text>
            <text x={940} y={692} opacity={0.75}>23</text>
            <text x={984} y={692} opacity={0.5}>24</text>
          </g>
        )}
        <text x={940} y={652} fontSize={12.5} fontWeight={700} fill="#9aa29e" letterSpacing={2} textAnchor="middle">待合表示</text>
      </g>

      {/* ── reception zone ── */}
      <text x={214} y={742} fontSize={17} fontWeight={700} fill="#9aa29e" letterSpacing={3}>受付</text>
      <Desk x={210} y={756} w={220} h={64} />
      <DeviceScreen x={250} y={766} w={38} h={22} on />
      <Person x={330} y={742} color="#f4e3cf" hair="#4a4440" />
      <Kiosk x={SPOTS.kiosk.x} y={SPOTS.kiosk.y - 30} on={kioskOn} />
      <text x={SPOTS.kiosk.x} y={SPOTS.kiosk.y + 42} fontSize={12.5} fontWeight={700} fill="#b9bfba" letterSpacing={1} textAnchor="middle">セルフ受付</text>
      <Plant x={230} y={880} />

      {/* 自動精算機 */}
      <g transform={`translate(${SPOTS.checkout.x} ${SPOTS.checkout.y - 18})`}>
        <rect x={-24} y={-22} width={48} height={44} rx={7} fill="#17211f" />
        <rect x={-17} y={-15} width={34} height={20} rx={4} fill="#1ba99a" opacity={0.9} />
        <rect x={-12} y={10} width={24} height={6} rx={3} fill="#3d4a47" />
      </g>
      <text x={SPOTS.checkout.x} y={SPOTS.checkout.y + 44} fontSize={12.5} fontWeight={700} fill="#b9bfba" letterSpacing={1} textAnchor="middle">自動精算機</text>

      {/* ── waiting area ── */}
      <text x={820} y={742} fontSize={17} fontWeight={700} fill="#9aa29e" letterSpacing={3}>待合</text>
      {[840, 910, 980, 1050, 1120].map((cx) => (
        <Chair key={`r1-${cx}`} x={cx} y={790} />
      ))}
      {[840, 910, 980, 1050, 1120].map((cx) => (
        <Chair key={`r2-${cx}`} x={cx} y={882} />
      ))}
      <Person x={910} y={784} color="#b8c9dd" dim />
      <Person x={1120} y={876} color="#d8ccb8" dim />
      <Plant x={1180} y={760} />
      <Plant x={790} y={880} s={0.9} />

      {/* ── entrance ── */}
      <rect x={556} y={928} width={128} height={20} fill="#fdfcf9" />
      <rect x={560} y={932} width={56} height={12} rx={5} fill="#bfe0d7" opacity={0.9} />
      <rect x={624} y={932} width={56} height={12} rx={5} fill="#bfe0d7" opacity={0.9} />
      <rect x={572} y={950} width={96} height={26} rx={9} fill="#d8e6df" />

      {/* facade planters */}
      <Plant x={528} y={890} s={0.85} />

      {/* ── pharmacy building ── */}
      <rect x={1428} y={716} width={320} height={240} rx={20} fill="rgba(16,34,29,0.10)" />
      <rect x={1420} y={700} width={320} height={240} rx={20} fill="#fdfcf9" stroke="#d8d3c5" strokeWidth={5} />
      <rect x={1420} y={700} width={320} height={240} rx={20} fill="url(#td-floor)" />
      <g transform="translate(1580 672)">
        <rect x={-88} y={-18} width={30} height={30} rx={7} fill="#3f8f6d" />
        <text x={-73} y={4} fontSize={19} fontWeight={900} fill="#fff" textAnchor="middle">薬</text>
        <text x={-48} y={2} fontSize={23} fontWeight={800} fill="#3c4644" letterSpacing={3}>処方箋薬局</text>
      </g>
      <Shelf x={1448} y={716} w={120} />
      <Shelf x={1600} y={716} w={120} />
      <Desk x={1452} y={790} w={256} h={48} />
      <DeviceScreen x={1560} y={798} w={40} h={24} on />
      <Person x={1520} y={776} color="#e7f0ec" hair="#5c5148" />
      <rect x={1506} y={758} width={28} height={9} rx={4} fill="#7fb59a" opacity={0.9} />
      <rect x={1536} y={928} width={88} height={20} fill="#fdfcf9" />
      <rect x={1540} y={932} width={80} height={12} rx={5} fill="#bfe0d7" opacity={0.9} />
      <Plant x={1700} y={900} s={0.9} />

      {/* ── street furniture ── */}
      <Tree x={120} y={980} />
      <Tree x={1060} y={984} />
      <Tree x={1350} y={982} />

      {/* ── AI data flows ── */}
      {Object.entries(FLOW_PATHS).map(([id, d]) => (
        <path
          key={id}
          d={d}
          fill="none"
          stroke="#0f766e"
          strokeWidth={3.5}
          strokeLinecap="round"
          className={flows.includes(id) ? 'td-dataflow' : undefined}
          style={{ opacity: flows.includes(id) ? 0.7 : 0, transition: 'opacity .6s' }}
        />
      ))}

      {/* avatar + extras slot */}
      {children}

      {/* ── interaction marker ── */}
      {marker && (
        <g
          className="td-marker"
          transform={`translate(${marker.x} ${marker.y})`}
          onClick={onMarkerClick}
          role="button"
        >
          <circle className="ring" r={26} fill="none" stroke="#0f766e" strokeWidth={3} />
          <circle className="core-circle" r={20} fill="#0f766e" opacity={0.92} />
          <path d="M -6 0 L 5 0 M 1 -5 L 6 0 L 1 5" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}
    </svg>
  );
}

export const ClinicWorld = memo(ClinicWorldBase);
