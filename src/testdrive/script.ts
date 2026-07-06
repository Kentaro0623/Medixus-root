/**
 * Test Drive scenario data — personas, steps, camera work, and all copy.
 * すべて合成データ。実在の患者・診療情報は含まない。
 */

export type Vec = { x: number; y: number };

/** World coordinate space (SVG viewBox). */
export const WORLD_W = 1800;
export const WORLD_H = 1150;

export type ChatLine = { who: 'dr' | 'pt'; text: string };

export type Persona = {
  id: string;
  name: string;
  kana: string;
  age: number;
  role: string;
  complaint: string;
  color: string;
  colorDark: string;
  /** 受付番号 */
  queueNo: number;
  intake: ChatLine[];
  intakeSummary: string;
  chat: ChatLine[];
  soap: { s: string; o: string; a: string; p: string };
  rxCandidates: string[];
  labCandidates: string[];
  points: number;
  yen: number;
  rxItems: number;
  revisitSummary: string[];
  revisitPlan: string;
};

export const PERSONAS: Persona[] = [
  {
    id: 'ren',
    name: '佐藤 蓮',
    kana: 'サトウ レン',
    age: 32,
    role: '会社員',
    complaint: 'のどの痛みと発熱',
    color: '#2f8f9d',
    colorDark: '#1d6570',
    queueNo: 23,
    intake: [
      { who: 'dr', text: '今日はどのような症状がありますか？' },
      { who: 'pt', text: '昨日の夜からのどが痛くて、熱が38度くらいあります' },
      { who: 'dr', text: '咳や鼻水はありますか？' },
      { who: 'pt', text: '咳が少しだけ。鼻水はないです' },
    ],
    intakeSummary: '主訴: 咽頭痛・発熱（昨夜から / 自宅38.2℃）。咳嗽 軽度、鼻汁なし。',
    chat: [
      { who: 'dr', text: '昨日の夜から、のどの痛みと熱があるんですね。' },
      { who: 'pt', text: 'はい、つばを飲むのも痛くて。熱は38度2分ありました。' },
      { who: 'dr', text: 'のどを見せてくださいね。……扁桃が少し腫れていますね。' },
      { who: 'pt', text: '仕事は行かないほうがいいでしょうか？' },
      { who: 'dr', text: '念のため溶連菌の検査をして、お薬を出しますね。今日は安静に。' },
    ],
    soap: {
      s: '昨夜からの咽頭痛と発熱（自宅で38.2℃）。嚥下時痛あり。咳嗽は軽度、鼻汁なし。',
      o: '体温38.1℃。咽頭発赤、両側扁桃腫大あり、白苔なし。頸部リンパ節に軽度圧痛。',
      a: '急性咽頭炎の疑い。溶連菌性咽頭炎の鑑別を要する。',
      p: '溶連菌迅速抗原検査を実施。対症療法（解熱鎮痛・トラネキサム酸）。水分摂取と安静を指導。',
    },
    rxCandidates: ['カロナール錠500mg 頓用', 'トラネキサム酸錠250mg 3日分'],
    labCandidates: ['溶連菌迅速抗原検査'],
    points: 620,
    yen: 1860,
    rxItems: 2,
    revisitSummary: [
      '前回（7日前）: 急性咽頭炎の疑い。溶連菌迅速検査は陰性。',
      '処方: カロナール錠 / トラネキサム酸錠 — 服薬遵守良好。',
      '経過: 発熱は2日で解熱。咽頭痛も改善傾向と問診で回答。',
    ],
    revisitPlan: '症状消失を確認。治癒として経過観察終了。',
  },
  {
    id: 'misaki',
    name: '田中 美咲',
    kana: 'タナカ ミサキ',
    age: 34,
    role: 'デザイナー',
    complaint: '2週間つづく頭痛',
    color: '#d97757',
    colorDark: '#a44f35',
    queueNo: 24,
    intake: [
      { who: 'dr', text: '今日はどのような症状がありますか？' },
      { who: 'pt', text: '2週間くらい頭痛が続いています。夕方にひどくなります' },
      { who: 'dr', text: '吐き気や、目の見えにくさはありますか？' },
      { who: 'pt', text: 'それはないです。肩こりはひどいです' },
    ],
    intakeSummary: '主訴: 頭痛（約2週間持続 / 夕方増悪）。悪心・視覚症状なし。肩こり著明。',
    chat: [
      { who: 'dr', text: '2週間ほど頭痛が続いているんですね。どのあたりが痛みますか？' },
      { who: 'pt', text: '後頭部から首にかけて、締め付けられる感じです。夕方がつらくて。' },
      { who: 'dr', text: 'お仕事はPC作業が長いですか？睡眠はとれていますか？' },
      { who: 'pt', text: '納期前で1日中PCの前に。睡眠は5時間くらいです。' },
      { who: 'dr', text: '診察上、危険なタイプの頭痛の所見はありません。まずお薬と生活の工夫で様子を見ましょう。' },
    ],
    soap: {
      s: '約2週間前から後頭部〜頸部の締め付けられるような頭痛。夕方に増悪。長時間のPC作業、睡眠5時間程度。',
      o: '血圧118/74、脈拍68整。神経学的異常所見なし。項部・僧帽筋に圧痛あり。',
      a: '緊張型頭痛が最も考えられる。二次性頭痛を示唆する所見（red flag）なし。',
      p: '鎮痛薬の頓用処方。作業間の休憩・ストレッチ・睡眠確保を指導。2週間で改善なければ再診。',
    },
    rxCandidates: ['ロキソプロフェン錠60mg 頓用', 'レバミピド錠100mg'],
    labCandidates: [],
    points: 470,
    yen: 1410,
    rxItems: 2,
    revisitSummary: [
      '前回（7日前）: 緊張型頭痛。red flag所見なし。',
      '処方: ロキソプロフェン錠 頓用 — 使用は週2回程度に減少。',
      '経過: 休憩・ストレッチ導入後、頭痛頻度は改善傾向。',
    ],
    revisitPlan: '頻度・強度ともに改善。頓用継続とし、セルフケアを継続指導。',
  },
  {
    id: 'kiyoshi',
    name: '山本 清',
    kana: 'ヤマモト キヨシ',
    age: 68,
    role: '高血圧で定期通院',
    complaint: '血圧の定期チェック',
    color: '#7c6bb0',
    colorDark: '#57487f',
    queueNo: 25,
    intake: [
      { who: 'dr', text: '今日は定期受診ですね。体調の変化はありますか？' },
      { who: 'pt', text: '特にありません。朝の血圧は130くらいです' },
      { who: 'dr', text: 'お薬の飲み忘れはありませんか？' },
      { who: 'pt', text: 'ありません。毎朝飲んでいます' },
    ],
    intakeSummary: '定期受診（高血圧）。自宅血圧 朝130前後。服薬遵守良好、自覚症状なし。',
    chat: [
      { who: 'dr', text: '山本さん、血圧手帳を見せてくださいね。朝は130前後で安定していますね。' },
      { who: 'pt', text: 'はい、散歩も毎日続けています。' },
      { who: 'dr', text: 'すばらしいです。めまいや動悸はありませんか？' },
      { who: 'pt', text: 'ありません。調子はいいです。' },
      { who: 'dr', text: 'では今のお薬を続けましょう。次回は血液検査で腎臓と脂質も見ておきますね。' },
    ],
    soap: {
      s: '高血圧の定期受診。自宅血圧は朝130前後で安定。服薬遵守良好。めまい・動悸・浮腫の自覚なし。',
      o: '血圧128/78、脈拍72整。心音・呼吸音に異常なし。下腿浮腫なし。',
      a: '本態性高血圧、コントロール良好。',
      p: '現行処方を継続。運動習慣の継続を支持。次回受診時に採血（腎機能・脂質）を予定。',
    },
    rxCandidates: ['アムロジピン錠5mg 30日分'],
    labCandidates: ['次回: 血液検査（腎機能・脂質）'],
    points: 400,
    yen: 1200,
    rxItems: 1,
    revisitSummary: [
      '前回（30日前）: 本態性高血圧、コントロール良好（128/78）。',
      '処方: アムロジピン錠5mg 30日分 — 残薬なし。',
      '予定: 今回は血液検査（腎機能・脂質）を実施予定。',
    ],
    revisitPlan: '血圧安定。予定どおり採血を実施し、現行処方を継続。',
  },
];

/* ── World landmarks (shared by walk paths / camera / FX) ── */

export const SPOTS = {
  streetStart: { x: 250, y: 1000 },
  entranceOut: { x: 620, y: 995 },
  entranceIn: { x: 620, y: 895 },
  kiosk: { x: 508, y: 822 },
  waitingSeat: { x: 942, y: 842 },
  corridorMid: { x: 620, y: 632 },
  examDoor: { x: 352, y: 610 },
  examSeat: { x: 342, y: 442 },
  checkout: { x: 726, y: 872 },
  pharmacyDoor: { x: 1578, y: 990 },
  pharmacyIn: { x: 1578, y: 866 },
  core: { x: 1242, y: 352 },
  monitor: { x: 292, y: 360 },
  boardWall: { x: 940, y: 686 },
} as const;

export type OverlayKind =
  | 'phone-intake'
  | 'kiosk'
  | 'board'
  | 'monitor'
  | 'phone-pay'
  | 'pharmacy'
  | 'revisit'
  | null;

export type StepDef = {
  id: number;
  shortTitle: string;
  title: string;
  desc: string;
  note?: string;
  /** camera target: world coords + zoom (1 = whole world fits) */
  camera: { x: number; y: number; scale: number };
  walk?: Vec[];
  overlay: OverlayKind;
  hud?: { label: string; value: string };
  flows?: Array<'kiosk' | 'exam' | 'billing' | 'pharmacy'>;
  interstitial?: string;
};

export const STEPS: StepDef[] = [
  {
    id: 0,
    shortTitle: '患者を選ぶ',
    title: 'あなたの分身を選ぼう',
    desc: '今日はこの方になりきって、スマートクリニックを仮想受診します。',
    camera: { x: 880, y: 620, scale: 1.05 },
    overlay: null,
  },
  {
    id: 1,
    shortTitle: '来院前',
    title: '予約も問診も、スマホで完結',
    desc: 'AI問診が症状をカルテの言葉に整理し、受付QRを発行。クリニックに着く前に、受付の準備は終わっています。',
    note: 'AI問診 → 受付QR発行',
    camera: { x: 560, y: 900, scale: 2.0 },
    walk: [SPOTS.streetStart, { x: 470, y: 1000 }],
    overlay: 'phone-intake',
    hud: { label: '事前受付', value: 'スマホで完了' },
  },
  {
    id: 2,
    shortTitle: 'チェックイン',
    title: '受付は、かざして3秒',
    desc: '受付QRをキオスクにかざすだけ。本人確認もその場で終わり、受付番号が発行されます。受付に人は立っていません。',
    note: '受付QR × 本人確認',
    camera: { x: 560, y: 800, scale: 2.35 },
    walk: [{ x: 470, y: 1000 }, SPOTS.entranceOut, SPOTS.entranceIn, SPOTS.kiosk],
    overlay: 'kiosk',
    hud: { label: '受付にかかった時間', value: '3秒' },
    flows: ['kiosk'],
  },
  {
    id: 3,
    shortTitle: '待合',
    title: '「あとどれくらい」が、見える',
    desc: '院内ディスプレイとスマホ通知で呼出をお知らせ。番号で呼ばれるので、名前が待合に響くことはありません。',
    note: '院内ディスプレイ × 音声呼出',
    camera: { x: 950, y: 790, scale: 1.85 },
    walk: [SPOTS.kiosk, { x: 700, y: 830 }, SPOTS.waitingSeat],
    overlay: 'board',
    hud: { label: '予想待ち時間', value: '約8分' },
  },
  {
    id: 4,
    shortTitle: '診察',
    title: '医師は、あなたと話すだけ',
    desc: 'AIが診察の会話を聞き取り、SOAPカルテと処方候補を下書き。医師は目の前のあなたに集中し、最後に確認して署名するだけです。',
    note: 'AIでSOAP自動生成（医師確認必須）',
    camera: { x: 350, y: 400, scale: 2.0 },
    walk: [SPOTS.waitingSeat, { x: 700, y: 830 }, { x: 620, y: 700 }, SPOTS.corridorMid, SPOTS.examDoor, SPOTS.examSeat],
    overlay: 'monitor',
    hud: { label: 'カルテ入力の待ち時間', value: '0分' },
    flows: ['exam'],
  },
  {
    id: 5,
    shortTitle: '会計',
    title: '診察室を出たら、会計は終わっていた',
    desc: '算定から保険点数の照合、キャッシュレス決済まで全自動。精算機の前を、そのまま通り過ぎて帰れます。',
    note: '自動算定 × ORCA照合 × キャッシュレス',
    camera: { x: 640, y: 840, scale: 2.0 },
    walk: [SPOTS.examSeat, SPOTS.examDoor, SPOTS.corridorMid, { x: 620, y: 780 }, SPOTS.checkout],
    overlay: 'phone-pay',
    hud: { label: '会計の待ち時間', value: '0分' },
    flows: ['billing'],
  },
  {
    id: 6,
    shortTitle: 'おくすり',
    title: '薬局には、処方箋が先回り',
    desc: '電子処方箋は診察終了と同時に薬局の調剤キューへ。あなたが着いた頃には、お薬の準備ができています。',
    note: '電子処方箋 → 調剤キュー',
    camera: { x: 1560, y: 800, scale: 2.0 },
    walk: [SPOTS.checkout, { x: 620, y: 900 }, SPOTS.entranceOut, { x: 1100, y: 1000 }, SPOTS.pharmacyDoor, SPOTS.pharmacyIn],
    overlay: 'pharmacy',
    hud: { label: '薬局での待ち時間', value: '約1分' },
    flows: ['pharmacy'],
  },
  {
    id: 7,
    shortTitle: '再診',
    title: '2回目は、もっとスムーズ',
    desc: '受付3秒、問診は変化の確認だけ。AIが前回カルテを要約して医師に手渡すので、診察はすぐ本題から始まります。',
    note: 'AI過去カルテ要約',
    camera: { x: 380, y: 430, scale: 1.9 },
    walk: [SPOTS.entranceOut, SPOTS.entranceIn, SPOTS.kiosk, { x: 620, y: 780 }, SPOTS.corridorMid, SPOTS.examDoor, SPOTS.examSeat],
    overlay: 'revisit',
    hud: { label: '滞在時間', value: '12分（初回18分）' },
    flows: ['kiosk', 'exam', 'billing', 'pharmacy'],
    interstitial: '─ 1週間後 ─',
  },
  {
    id: 8,
    shortTitle: 'まとめ',
    title: '診察のあいだに、すべてが終わるクリニック',
    desc: '',
    camera: { x: 900, y: 620, scale: 1.0 },
    walk: [SPOTS.examSeat, SPOTS.examDoor, SPOTS.corridorMid, { x: 620, y: 900 }, SPOTS.entranceOut],
    overlay: null,
    flows: ['kiosk', 'exam', 'billing', 'pharmacy'],
  },
];

/** フィナーレ（院長ビュー）KPI — 合成値 */
export const FINALE_KPIS = [
  { label: '本日の来院', value: '42', unit: '人', delta: '+18%' },
  { label: '平均待ち時間', value: '8', unit: '分', delta: '−63%' },
  { label: 'カルテ作成時間', value: '1.2', unit: '分/件', delta: '−78%' },
  { label: 'AI下書き反映 p50', value: '6.8', unit: '秒', delta: 'リアルタイム' },
  { label: 'レセプト照合済', value: '100', unit: '%', delta: '自動' },
  { label: '受付・会計スタッフ', value: '0', unit: '人', delta: 'ほぼ無人' },
];

export const CLINIC_NAME = 'Medixus Clinic';
export const DOCTOR_ROOM1 = '山田';
export const DOCTOR_ROOM2 = '佐々木';
