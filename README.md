# Medixus Clinic — コンセプトサイト

「ほぼ無人・待ち時間ゼロ・医師は診察だけ」のAIスマートクリニック構想 **Medixus Clinic** の紹介サイトです。
smooth.city/test-drive をリファレンスに、LP + インタラクティブな仮想受診デモ（テストドライブ）で構成しています。

- `/#/` — ランディングページ（コンセプト・通院体験・数字・CTA）
- `/#/test-drive` — テストドライブ: 患者ペルソナを選び、俯瞰のクリニックを移動しながら
  来院前AI問診 → QR受付3秒 → 待合 → AIカルテ(SOAP) → 自動会計 → 調剤先回り → 再診 → 院長ビュー を約2分で体験

すべて合成データで、外部API・バックエンドには一切アクセスしません（Medixus OS本体とは独立）。

## 開発

```bash
npm install
npm run dev        # http://localhost:4200
```

## ビルド / デプロイ

```bash
npm run build      # dist/ に静的ファイルを出力（gzip合計 約82KB）
npm run preview    # ビルド結果の確認
```

`dist/` を Vercel / Netlify / Cloudflare Pages / S3 など任意の静的ホスティングに置くだけで公開できます。

## 構成

```
src/
  landing/Landing.tsx     # LP（コンセプト・ジャーニー・数字・CTA）
  testdrive/
    TestDrive.tsx         # デモエンジン（カメラワーク・歩行・ステップ制御）
    world.tsx             # 俯瞰SVGクリニック（LPヒーローでも再利用）
    overlays.tsx          # スマホ/キオスク/待合ボード/医師モニター等のズームUI
    script.ts             # ペルソナ3人・全ステップのコピー・KPI（文言調整はここ）
  components/Wordmark.tsx # ロゴ
```

文言・ペルソナ・数値の変更はほぼ `src/testdrive/script.ts` と `src/landing/Landing.tsx` で完結します。
