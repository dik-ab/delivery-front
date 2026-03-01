# 配達ルート管理システム (Delivery Route Management System)

React で構築された、Google Maps を使用した配達ルート管理アプリケーションです。

## 機能

- **Google Maps 統合**: リアルタイムで配達ポイントをマップ上に表示
- **配達管理**: 配達情報の作成・編集・削除
- **ステータス管理**: 未配送、配送中、配送完了のステータス管理
- **ルート可視化**: 配達順序に基づいて経路線を描画
- **レスポンシブデザイン**: デスクトップとモバイルに対応
- **住所ジオコーディング**: 住所から自動的に緯度経度を取得

## 技術スタック

- **フロントエンド**:
  - React 18
  - Vite (ビルドツール)
  - @react-google-maps/api (Google Maps)
  - Axios (HTTP クライアント)

- **スタイリング**:
  - CSS3 (Plain CSS、Tailwind なし)

## セットアップ

### 必須

- Node.js 16 以上
- npm または yarn
- Google Maps API キー

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd delivery-frontend

# 依存パッケージをインストール
npm install
```

### 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください:

```
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Google Maps API キーの取得方法**:
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. Maps JavaScript API を有効化
4. API キーを作成

## 開発

開発サーバーを起動:

```bash
npm run dev
```

ブラウザが自動的に http://localhost:3000 で開きます。

## ビルド

本番環境用にビルド:

```bash
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

## プレビュー

ビルド後のプレビュー:

```bash
npm run preview
```

## Linting

コード品質チェック:

```bash
npm run lint
```

## Docker で実行

### イメージのビルド

```bash
docker build -t delivery-frontend:latest .
```

### コンテナの実行

```bash
docker run -p 80:80 delivery-frontend:latest
```

http://localhost で アプリケーションにアクセスできます。

## API エンドポイント

アプリケーションは以下の API エンドポイントを期待しています:

```
GET    /api/v1/deliveries         # すべての配達を取得
GET    /api/v1/deliveries/:id     # 指定の配達を取得
POST   /api/v1/deliveries         # 新規配達を作成
PUT    /api/v1/deliveries/:id     # 配達を更新
DELETE /api/v1/deliveries/:id     # 配達を削除
GET    /api/v1/geocode            # 住所から座標を取得 (query: address)
```

## プロジェクト構造

```
src/
├── components/          # React コンポーネント
│   ├── Map.jsx
│   ├── DeliveryList.jsx
│   ├── DeliveryForm.jsx
│   ├── DeliveryDetail.jsx
│   ├── Header.jsx
│   └── StatusBadge.jsx
├── hooks/              # カスタム hooks
│   └── useDeliveries.js
├── api/                # API クライアント
│   └── client.js
├── types/              # 型定義 (JSDoc)
│   └── delivery.js
├── App.jsx
├── App.css
├── index.js
└── index.css
```

## ステータスの説明

- **未配送** (pending): 配達予定の状態
- **配送中** (in_progress): 現在配送中の状態
- **配送完了** (completed): 配達完了の状態

## トラブルシューティング

### Google Maps が読み込まれない場合

1. API キーが正しく設定されているか確認
2. Google Cloud Console で Maps JavaScript API が有効になっているか確認
3. API キーに適切な制限が設定されているか確認

### API に接続できない場合

1. `VITE_API_URL` が正しいか確認
2. バックエンド API が起動しているか確認
3. CORS が正しく設定されているか確認

## ライセンス

MIT

## お問い合わせ

質問や問題がある場合は、GitHub Issues でお知らせください。
