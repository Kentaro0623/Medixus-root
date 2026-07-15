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
  /** 選択カードに出す「このペルソナで伝わるMedixusの魅力」ひとこと */
  tagline: string;
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
  /** 再診画面「本日の流れ」の行（省略時は標準の再診フロー） */
  revisitFlow?: Array<{ label: string; sub: string }>;
  /** 再診ステップの幕間テキスト（省略時はステップ定義のまま） */
  revisitInterstitial?: string;
  /** 専門医マッチング（specialist-revisit のみ使用。simple では省略可） */
  matching?: {
    specialty: string;
    doctor: string;
    reason: string;
    advice: string;
    /** マッチングの根拠（AI問診 / 診察所見 / 院内検査） */
    inputs: { intake: string; exam: string; test: string };
    /**
     * 多科にまたがる鑑別の候補。指定すると照合中に候補が1つずつ並び、
     * matched の科へ収束する演出になる（腹部症状など「何科かわからない」主訴用）。
     */
    candidates?: Array<{ specialty: string; note: string; matched?: boolean }>;
  };
  /**
   * ステップ構成。
   * - 'simple': 専門医マッチングなしで完結（軽症・定期通院の等身大ストーリー）
   * - 'specialist-revisit': 初期治療で改善せず、再診時に専門医マッチングが起動
   * 専門医マッチングは「全員に使う」のではなく、必要な患者にだけ発動する。
   */
  journey?: 'simple' | 'specialist-revisit';
};

export const PERSONAS: Persona[] = [
  {
    id: 'ren',
    name: '佐藤 蓮',
    kana: 'サトウ レン',
    age: 32,
    role: '会社員',
    complaint: '高熱とふしぶしの痛み',
    tagline: '仕事の合間に、待たずに18分で完結',
    color: '#2f8f9d',
    colorDark: '#1d6570',
    queueNo: 23,
    intake: [
      { who: 'dr', text: '今日はどのような症状がありますか？' },
      { who: 'pt', text: '昨日の夜から39度近い熱があって、ふしぶしが痛いです。せきも出ます' },
      { who: 'dr', text: '周りに同じ症状の方はいますか？これまでの病気で伝えておくことは？' },
      { who: 'pt', text: '職場でインフルが流行っています。子どもの頃、喘息と言われていました' },
    ],
    intakeSummary: '主訴: 発熱38.9℃・関節痛・咳嗽（昨夜から）。職場でインフルエンザ流行。小児喘息の既往（現在治療なし）。',
    chat: [
      { who: 'dr', text: '昨夜から高い熱と、ふしぶしの痛みですね。職場で流行っているなら、まずインフルエンザの検査をしましょう。' },
      { who: 'pt', text: 'はい。仕事をどれくらい休むことになるかも知りたくて。' },
      { who: 'dr', text: '結果が出ました。インフルエンザA型、陽性です。抗インフルエンザ薬を出しますね。' },
      { who: 'pt', text: 'せきが強いのが少し心配です。昔、喘息だったので。' },
      { who: 'dr', text: '大事な情報ですね。念のため発作時用の吸入薬も出しておきます。せきが強くなったり息苦しさが出たら、すぐ来てください。' },
    ],
    soap: {
      s: '昨夜からの発熱（自宅38.9℃）・関節痛・咳嗽。職場でインフルエンザ流行。小児喘息の既往（現在治療なし）。',
      o: '体温38.7℃、SpO2 98%。咽頭発赤軽度。肺音清、喘鳴なし。インフルエンザ迅速抗原: A型陽性。',
      a: 'インフルエンザA型。喘息既往があり、気道症状の増悪に留意。',
      p: '抗インフルエンザ薬・解熱鎮痛薬を処方。自宅療養と出勤再開の目安を説明。咳の増悪・呼吸苦があれば早期再診。',
    },
    rxCandidates: ['ゾフルーザ錠20mg（抗インフルエンザ薬）', 'カロナール錠500mg 頓用', 'サルタノール吸入（発作時用）'],
    labCandidates: ['インフルエンザ迅速抗原検査'],
    points: 840,
    yen: 2520,
    rxItems: 3,
    revisitSummary: [
      '前回（7日前）: インフルエンザA型。抗インフルエンザ薬・解熱鎮痛薬を処方。',
      '経過: 発熱は2日で解熱。咳も改善し、喘鳴・呼吸苦の出現なし。',
      '喘息の再燃なし — 発作時用の吸入薬は未使用のまま経過良好。',
    ],
    revisitPlan: '治癒を確認。出勤再開OK。喘息症状が出たときのみ早めの受診を指導。',
    revisitInterstitial: '─ 1週間後・治りぐあいの確認 ─',
    journey: 'simple',
  },
  {
    id: 'misaki',
    name: '田中 美咲',
    kana: 'タナカ ミサキ',
    age: 34,
    role: 'デザイナー',
    complaint: '2週間つづく頭痛',
    tagline: '治らない頭痛に、専門医の答えを',
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
      { who: 'pt', text: '納期前で1日中PCの前に。それに、スマホで調べると怖い病気ばかり出てきて、不安で…' },
      { who: 'dr', text: '診察では危険なタイプの頭痛のサインはありません。まずはお薬と生活の工夫で2週間様子を見ましょう。もし良くならなければ、脳の専門の先生に一緒に診てもらえますから、安心してください。' },
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
      '前回（14日前）: 緊張型頭痛の疑い。頓用薬・生活指導で経過観察。',
      '経過: 頭痛の頻度・強さは改善乏しく、頓用薬の使用が週4回に増加。',
      '問診: 「重い病気ではないか」という不安の訴えが強い。',
    ],
    revisitPlan: '初期治療で改善が乏しい — 前回カルテと経過をもとに、専門医マッチングを起動します。',
    revisitFlow: [
      { label: '受付（セルフ受付・3秒）', sub: '再診は本人確認もワンタップ' },
      { label: '問診: 改善が乏しいことをAIが確認', sub: '「治っていない」を診察前に検出' },
      { label: '前回カルテと経過を自動照合 → 治療反応性を評価', sub: '頓用薬の使用回数が増加' },
      { label: '専門医マッチングを起動', sub: '提携医師プールから頭痛の専門医を照合 →' },
    ],
    revisitInterstitial: '─ 2週間後・頭痛がつづく ─',
    journey: 'specialist-revisit',
    matching: {
      specialty: '脳神経内科',
      doctor: '藤井医師',
      reason: '2週間の初期治療で改善が乏しい頭痛。危険な頭痛（red flag）の再評価と治療方針の見直しに、専門医の評価を要する',
      advice: '経過を拝見しました。いまも危険なサイン（red flag）はありません。ただ改善が乏しいので、緊張型だけでなく片頭痛の要素を考えて、予防を含めたお薬の調整を提案します。必要なら画像検査も、このまま当院で手配できます。もう、一人で調べて不安にならなくて大丈夫ですよ。',
      inputs: {
        intake: '頭痛が4週間持続・頓用薬の使用が増加・強い不安',
        exam: '神経学的異常なし・項部/僧帽筋の圧痛が持続',
        test: '血圧・脈拍は正常域／前回からのバイタル変化なし',
      },
    },
  },
  {
    id: 'kiyoshi',
    name: '山本 清',
    kana: 'ヤマモト キヨシ',
    age: 68,
    role: '元中学教師',
    complaint: '高血圧の定期チェック',
    tagline: '毎月の通院を、5分の習慣に',
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
      { who: 'dr', text: '山本さん、血圧手帳アプリの記録が自動で届いています。朝は130前後で安定していますね。' },
      { who: 'pt', text: '手帳を持ってくる必要がないのは、本当に楽ですね。散歩も毎日続けています。' },
      { who: 'dr', text: 'すばらしいです。めまいや動悸はありませんか？お薬の残りは、アプリの記録どおりで合っていますか？' },
      { who: 'pt', text: 'ありません、調子はいいです。薬もアプリの通知で飲み忘れなしです。' },
      { who: 'dr', text: 'では今のお薬を続けましょう。次回は血液検査で腎臓と脂質も見ておきますね。結果はスマホに届きます。' },
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
      '処方: アムロジピン錠5mg 30日分 — アプリ記録で服薬遵守・残薬なしを確認。',
      '予定: 本日は血液検査（腎機能・脂質）を実施。結果はスマホへ自動送付。',
    ],
    revisitPlan: '血圧は30日間安定（アプリ自動集計）。予定どおり採血を実施し、現行処方を継続。',
    revisitInterstitial: '─ 30日後・定期受診 ─',
    journey: 'simple',
  },
  {
    id: 'aoi',
    name: '鈴木 葵',
    kana: 'スズキ アオイ',
    age: 38,
    role: '営業職',
    complaint: 'つづく腹痛と吐き気',
    tagline: '原因がわからなくても、ここで完結',
    color: '#c1666b',
    colorDark: '#8e4247',
    queueNo: 26,
    journey: 'specialist-revisit',
    intake: [
      { who: 'dr', text: '今日はどのような症状がありますか？' },
      { who: 'pt', text: '3日前からお腹が痛くて、吐き気もあります。食事もあまり取れていません' },
      { who: 'dr', text: '下痢や発熱、血便はありますか？' },
      { who: 'pt', text: 'どれもないです。ただ、ずっとムカムカしていて…' },
    ],
    intakeSummary: '主訴: 腹痛・悪心（3日前から持続）。食思不振あり。下痢・発熱・血便なし。',
    chat: [
      { who: 'dr', text: '3日前からの腹痛と吐き気ですね。おなかを診せてください。' },
      { who: 'pt', text: 'はい。みぞおちのあたりが、ずっと重い感じです。' },
      { who: 'dr', text: '押すと少し痛みますが、強い所見はありません。念のためエコーと血液検査をしておきましょう。' },
      { who: 'pt', text: 'お願いします。仕事にも集中できなくて。' },
      { who: 'dr', text: 'エコーは異常なしです。まず胃腸を整えるお薬で様子を見て、改善がなければ1週間以内に来てください。血液検査の詳しい結果はその時に一緒に確認します。' },
    ],
    soap: {
      s: '3日前からの腹痛（心窩部優位）と悪心。食思不振あり。下痢・発熱・血便なし。',
      o: '腹部平坦・軟。心窩部に軽度圧痛、反跳痛なし。腹部エコー: 明らかな異常なし。院内迅速血液検査: 炎症反応なし（ホルモン等の精密項目は外注）。',
      a: '急性胃腸炎の疑い。現時点で緊急性を示す所見なし。',
      p: '整腸剤・制吐薬を処方し経過観察。改善なければ1週間以内に再診。外注血液検査の結果は再診時に照合。',
    },
    rxCandidates: ['ビオフェルミン配合散（整腸剤）7日分', 'ドンペリドン錠10mg（制吐薬）頓用'],
    labCandidates: ['腹部エコー検査', '血液検査（院内迅速＋外注精密）'],
    points: 890,
    yen: 2670,
    rxItems: 2,
    revisitSummary: [
      '前回（7日前）: 急性胃腸炎の疑い。整腸剤・制吐薬を処方。',
      '検査: 腹部エコー異常なし。外注血液検査で甲状腺ホルモンに異常値（TSH低値・FT4高値）。',
      '経過: 腹痛・吐き気は改善せず。体重−2kg、動悸を新たに自覚。',
    ],
    revisitPlan: '症状が持続 — 検査結果と経過をもとに、専門医マッチングを起動します。',
    revisitFlow: [
      { label: '受付（セルフ受付・3秒）', sub: '再診は本人確認もワンタップ' },
      { label: '問診: 症状が続いていることをAIが確認', sub: '「改善していない」を診察前に検出' },
      { label: '前回の検査結果を自動照合 → 異常値を検出', sub: '外注血液検査: 甲状腺ホルモンに異常' },
      { label: '専門医マッチングを起動', sub: '提携医師プールから最適な専門医を照合 →' },
    ],
    matching: {
      specialty: '内分泌内科',
      doctor: '三宅医師',
      reason: '血液検査の甲状腺ホルモン異常（TSH低値・FT4高値）に、症状の持続・頻脈・体重減少を総合し、内分泌疾患の評価を最優先',
      advice: '検査結果を拝見しました。吐き気や腹痛は、甲状腺ホルモンが出すぎる病気（甲状腺機能亢進症）でも起こります。数値と症状はその可能性を示しています。追加の採血と甲状腺エコーを、このまま当院で手配しますね。胃腸のお薬だけで様子を見る段階は、今日で終わりにしましょう。',
      inputs: {
        intake: '腹痛・吐き気が1週間以上持続・体重−2kg・動悸',
        exam: '腹部所見は軽度で限局せず／脈拍102・整',
        test: '腹部エコー異常なし／TSH低値・FT4高値（外注血液検査）',
      },
      candidates: [
        { specialty: '消化器内科', note: 'エコー異常なし・症状持続で単独では説明困難' },
        { specialty: '婦人科', note: '月経周期との関連なし' },
        { specialty: '脳神経内科', note: '神経学的所見なし' },
        { specialty: '内分泌内科', note: 'TSH低値・FT4高値 ＋ 頻脈・体重減少', matched: true },
      ],
    },
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
  | 'matching'
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
    shortTitle: '専門医マッチング',
    title: 'その場で、専門医が現れる',
    desc: '「どの科に行けばいいかわからない」でも大丈夫。AI問診・診察の所見・院内の一般検査の結果をもとに、提携医療法人の医師プールから最適な専門医が選ばれ、診察室のモニターにオンラインで合流します。別の病院への移動も、紹介状も不要です。',
    note: '医師プール × オンライン合流 — たらい回しゼロ',
    camera: { x: 380, y: 400, scale: 1.9 },
    overlay: 'matching',
    hud: { label: '専門医にかかるまで', value: '0日（その場で合流）' },
    flows: ['exam'],
  },
  {
    id: 6,
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
    id: 7,
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
    id: 8,
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
    id: 9,
    shortTitle: 'まとめ',
    title: '診察のあいだに、すべてが終わるクリニック',
    desc: '',
    camera: { x: 900, y: 620, scale: 1.0 },
    walk: [SPOTS.examSeat, SPOTS.examDoor, SPOTS.corridorMid, { x: 620, y: 900 }, SPOTS.entranceOut],
    overlay: null,
    flows: ['kiosk', 'exam', 'billing', 'pharmacy'],
  },
];

/**
 * specialist-revisit ジャーニー:
 * 初診（診察・検査・処方）ではいったん経過観察になり、改善せず再診 →
 * 経過と検査結果から専門医マッチングが起動する。
 * 専門医マッチングは全員には使わない — 「治らない」「専門医でないと判断が
 * 難しい」症例にだけ発動するのが Medixus の設計思想。
 * ステップ数は10（順序と文言をペルソナごとに差し替える）。
 */
type RevisitJourneyCopy = {
  step4Desc: string;
  step4Note: string;
  revisitTitle: string;
  revisitDesc: string;
  interstitial: string;
  matchTitle: string;
  matchDesc: string;
  matchNote: string;
};

function specialistRevisitSteps(c: RevisitJourneyCopy): StepDef[] {
  return [
    STEPS[0],
    STEPS[1],
    STEPS[2],
    STEPS[3],
    {
      ...STEPS[4],
      title: '医師は、あなたと話すだけ',
      desc: c.step4Desc,
      note: c.step4Note,
    },
    { ...STEPS[6], id: 5 },
    { ...STEPS[7], id: 6 },
    {
      ...STEPS[8],
      id: 7,
      shortTitle: '再診',
      title: c.revisitTitle,
      desc: c.revisitDesc,
      note: 'AI過去カルテ要約 × 経過・検査結果の自動照合',
      hud: { label: '前回カルテの照合', value: '自動（診察前に完了）' },
      interstitial: c.interstitial,
    },
    {
      ...STEPS[5],
      id: 8,
      shortTitle: '専門医マッチング',
      title: c.matchTitle,
      desc: c.matchDesc,
      note: c.matchNote,
      hud: { label: '専門医にかかるまで', value: '0日・0院（院内で完結）' },
      walk: undefined,
    },
    STEPS[9],
  ];
}

const AOI_STEPS = specialistRevisitSteps({
  step4Desc:
    'AIが診察の会話を聞き取り、SOAPカルテと処方候補を下書き。この日はエコーと血液検査を行い、まず胃腸を整えるお薬で様子を見ることになりました。',
  step4Note: 'AIでSOAP自動生成 × 院内検査（結果は自動でカルテへ）',
  revisitTitle: '「治っていない」を、見逃さない',
  revisitDesc:
    'お薬で様子を見ても、腹痛と吐き気が続いています。AIが前回のカルテと検査結果を自動で照合し、「治療がうまくいっていない」ことを診察の前に医師へ知らせます。',
  interstitial: '─ 1週間後・症状がつづく ─',
  matchTitle: 'その原因が何科かは、探さなくていい',
  matchDesc:
    '腹部の症状の原因は、消化器・内分泌・脳神経・婦人科…と複数の科にまたがります。Medixus は検査結果と経過から可能性を絞り込み、提携医療法人の医師プールにいる最適な専門医を、診察室のモニターへその場で呼びます。病院を探し回る必要はありません。',
  matchNote: '多科の鑑別 × 医師プール — Medixus Clinic 内で完結',
});

const MISAKI_STEPS = specialistRevisitSteps({
  step4Desc:
    'AIが診察の会話を聞き取り、SOAPカルテを下書き。危険なサインがないことを確認したうえで、まずはお薬と生活の工夫で2週間様子を見る方針になりました。',
  step4Note: 'AIでSOAP自動生成（医師確認必須）',
  revisitTitle: '「治っていない」に、次の一手を',
  revisitDesc:
    '2週間たっても、頭痛は良くなっていません。AIが前回のカルテと経過を照合し、「初期治療で改善が乏しい」ことを診察の前に医師へ知らせます。ここではじめて、専門医の出番です。',
  interstitial: '─ 2週間後・頭痛がつづく ─',
  matchTitle: '必要になった、その時だけ。',
  matchDesc:
    'Medixusは、最初から何でも専門医に送りません。かかりつけ医で治る人はそのまま完結し、治らない・判断が難しい症例だけ、提携医療法人の専門医が診察室のモニターに合流します。医療資源は大切に、でも必要な人には最短で。',
  matchNote: '「治らない」にだけ発動 — 適切な専門医アクセス',
});

/** simple ジャーニー: 専門医マッチングなしで完結する9ステップ */
const SIMPLE_STEPS: StepDef[] = [
  STEPS[0],
  STEPS[1],
  STEPS[2],
  STEPS[3],
  STEPS[4],
  { ...STEPS[6], id: 5 },
  { ...STEPS[7], id: 6 },
  { ...STEPS[8], id: 7 },
  { ...STEPS[9], id: 8 },
];

/** ペルソナのジャーニーに応じたステップ列を返す（identityはペルソナ単位で安定） */
const personaStepsCache = new Map<string, StepDef[]>();
export function stepsForPersona(persona: Persona | null): StepDef[] {
  if (!persona) return STEPS;
  const cached = personaStepsCache.get(persona.id);
  if (cached) return cached;
  let base: StepDef[];
  if (persona.journey === 'specialist-revisit') {
    base = persona.id === 'misaki' ? MISAKI_STEPS : AOI_STEPS;
  } else if (persona.journey === 'simple') {
    base = SIMPLE_STEPS;
  } else {
    base = STEPS;
  }
  const steps = persona.revisitInterstitial
    ? base.map((st) =>
        st.overlay === 'revisit' && !st.interstitial
          ? { ...st, interstitial: persona.revisitInterstitial }
          : st.overlay === 'revisit'
            ? { ...st, interstitial: persona.revisitInterstitial ?? st.interstitial }
            : st,
      )
    : base;
  personaStepsCache.set(persona.id, steps);
  return steps;
}

/** フィナーレ（院長ビュー）KPI — 合成値 */
export const FINALE_KPIS = [
  { label: '本日の来院', value: '42', unit: '人', delta: '+18%' },
  { label: '平均待ち時間', value: '8', unit: '分', delta: '−63%' },
  { label: 'カルテ作成時間', value: '1.2', unit: '分/件', delta: '−78%' },
  { label: '専門医にかかるまで', value: '0', unit: '日', delta: 'その場で合流' },
  { label: 'レセプト照合済', value: '100', unit: '%', delta: '自動' },
  { label: '受付・会計スタッフ', value: '0', unit: '人', delta: 'ほぼ無人' },
];

export const CLINIC_NAME = 'Medixus Clinic';
export const DOCTOR_ROOM1 = '山田';
export const DOCTOR_ROOM2 = '佐々木';
