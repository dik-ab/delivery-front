# 配達ルート管理システム - React フロントエンド学習カリキュラム

## 概要

このドキュメントは、配達ルート管理アプリケーションの React フロントエンドについて、初学者を対象とした詳細な学習教材です。プロジェクト全体の構成、各ファイルの役割、React の重要な概念、Google Maps API の統合方法について、段階的に説明します。

---

## 1. プロジェクト構造とアーキテクチャ

### 1.1 全体構成

```
delivery-frontend/
├── src/
│   ├── index.jsx                 # アプリケーションエントリーポイント
│   ├── App.jsx                   # メインコンポーネント
│   ├── App.css                   # 全体スタイル
│   ├── index.css                 # グローバルスタイル
│   │
│   ├── api/
│   │   └── client.js            # Axios設定とAPI通信
│   │
│   ├── hooks/
│   │   └── useDeliveries.js      # 配送データ管理用カスタムフック
│   │
│   ├── types/
│   │   └── delivery.js          # 型定義と定数
│   │
│   └── components/
│       ├── Header.jsx            # ヘッダーコンポーネント
│       ├── Header.css
│       ├── Map.jsx               # Google Maps コンポーネント
│       ├── Map.css
│       ├── DeliveryList.jsx       # 配送リスト（サイドバー）
│       ├── DeliveryList.css
│       ├── DeliveryForm.jsx       # 配送追加・編集フォーム
│       ├── DeliveryForm.css
│       ├── DeliveryDetail.jsx     # 配送詳細モーダル
│       ├── DeliveryDetail.css
│       ├── OriginSetting.jsx      # 配送元設定コンポーネント
│       ├── OriginSetting.css
│       ├── StatusBadge.jsx        # ステータス表示コンポーネント
│       └── StatusBadge.css
│
├── vite.config.js                # Viteビルド設定
├── package.json                  # 依存パッケージ管理
├── .env.example                  # 環境変数テンプレート
└── index.html                    # HTMLエントリーポイント
```

### 1.2 アーキテクチャの特徴

このアプリケーションは以下の設計原則に基づいています。

- **コンポーネント指向**: UI要素を独立した再利用可能なコンポーネントに分割
- **カスタムフック**: `useDeliveries` で状態管理を一元化
- **API通信層**: `api/client.js` で API 呼び出しを統一管理
- **環境変数管理**: Vite の環境変数機能で API キーを管理
- **Google Maps API の活用**: 地図表示、ジオコーディング、ルート計算

### 1.3 データフロー

```
App.jsx（メインコンポーネント）
  ↓
useDeliveries フック
  ↓
api/client.js（Axios インスタンス）
  ↓
バックエンド API
  ↓
配送データ返却
```

各コンポーネントは App.jsx から Props 経由でデータとコールバック関数を受け取り、ユーザー操作に応じて App.jsx の関数を呼び出すことでデータを更新します。

---

## 2. 各ファイルの詳細説明

### 2.1 src/index.jsx - アプリケーションエントリーポイント

**役割**: React アプリケーションを DOM にマウントするエントリーポイント

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**詳細説明**:

1. **ReactDOM.createRoot()**
   - React 18 以降の新しい API
   - HTML ファイルの `<div id="root"></div>` 要素を取得
   - React アプリケーションをレンダリングする「ルート」を作成

2. **React.StrictMode**
   - 開発時にのみ有効な開発者向け機能
   - 潜在的なバグを検出するために、コンポーネントを意図的に 2 回レンダリング
   - 以下をチェック：
     - 不完全なライフサイクル使用
     - 安全でないレガシー API の使用
     - 予期しない副作用

3. **App コンポーネント**
   - メインアプリケーションコンポーネントをレンダリング

**学習ポイント**: エントリーポイントは最小限に保つべき。ここは React アプリケーションを初期化するだけの役割。

---

### 2.2 src/App.jsx - メインコンポーネント

**役割**: アプリケーション全体の状態管理とコンポーネント間の通信を行う最上位コンポーネント

```javascript
import { useState, useCallback } from 'react'
import { useDeliveries } from './hooks/useDeliveries'
import Header from './components/Header'
import DeliveryList from './components/DeliveryList'
import OriginSetting from './components/OriginSetting'
import Map from './components/Map'
import DeliveryForm from './components/DeliveryForm'
import DeliveryDetail from './components/DeliveryDetail'
import './App.css'

function App() {
  // ===== State Management (状態管理) =====

  // useDeliveries: 配送データの CRUD 操作を管理
  const { deliveries, loading, error, createDelivery, updateDelivery, deleteDelivery, refetch } = useDeliveries()

  // UI状態の管理
  const [selectedDelivery, setSelectedDelivery] = useState(null)      // 選択中の配送
  const [showForm, setShowForm] = useState(false)                     // フォーム表示状態
  const [editingDelivery, setEditingDelivery] = useState(null)        // 編集中の配送
  const [showDetail, setShowDetail] = useState(false)                 // 詳細表示状態
  const [appError, setAppError] = useState(null)                      // エラーメッセージ
  const [origin, setOrigin] = useState(null)                          // 配送元情報

  // ===== イベントハンドラー =====

  // 新規配送追加ボタンクリック
  const handleAddNew = useCallback(() => {
    setEditingDelivery(null)
    setShowForm(true)
    setShowDetail(false)
  }, [])

  // フォーム送信時（新規作成または更新）
  const handleFormSubmit = useCallback(
    async (formData) => {
      try {
        setAppError(null)
        if (editingDelivery) {
          // 編集モード：既存データを更新
          await updateDelivery(editingDelivery.id, formData)
        } else {
          // 新規モード：新しいデータを作成
          await createDelivery(formData)
        }
        setShowForm(false)
        setEditingDelivery(null)
      } catch (err) {
        setAppError(err.message || '操作に失敗しました')
      }
    },
    [editingDelivery, createDelivery, updateDelivery]
  )

  // フォームキャンセル
  const handleFormCancel = useCallback(() => {
    setShowForm(false)
    setEditingDelivery(null)
  }, [])

  // リスト内の配送をクリック（詳細表示）
  const handleSelectDelivery = useCallback((delivery) => {
    setSelectedDelivery(delivery)
    setShowDetail(true)
    setShowForm(false)
  }, [])

  // 編集ボタンクリック
  const handleEditDelivery = useCallback((delivery) => {
    setEditingDelivery(delivery)
    setShowDetail(false)
    setShowForm(true)
  }, [])

  // 削除ボタンクリック
  const handleDeleteDelivery = useCallback(
    async (id) => {
      try {
        setAppError(null)
        await deleteDelivery(id)
        // 削除後、選択中の配送が削除された場合は詳細表示を閉じる
        if (selectedDelivery?.id === id) {
          setSelectedDelivery(null)
          setShowDetail(false)
        }
      } catch (err) {
        setAppError(err.message || '削除に失敗しました')
      }
    },
    [deleteDelivery, selectedDelivery]
  )

  // 詳細表示を閉じる
  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
  }, [])

  // 地図クリック時（将来の機能拡張用）
  const handleMapClick = useCallback((coordinates) => {
    if (editingDelivery || showForm) {
      console.log('Map clicked at:', coordinates)
    }
  }, [editingDelivery, showForm])

  // ===== Render =====

  return (
    <div className="app-container">
      {/* ヘッダー */}
      <Header deliveryCount={deliveries.length} />

      {/* メインレイアウト：サイドバー + 地図 */}
      <div className="app-main">
        {/* 左サイドバー */}
        <div className="app-sidebar">
          {/* 配送元設定 */}
          <OriginSetting origin={origin} onOriginChange={setOrigin} />

          {/* 配送リスト */}
          <DeliveryList
            deliveries={deliveries}
            selectedDelivery={selectedDelivery}
            onSelectDelivery={handleSelectDelivery}
            onAddNew={handleAddNew}
            onEdit={handleEditDelivery}
            onDelete={handleDeleteDelivery}
            isLoading={loading}
          />
        </div>

        {/* 右側：地図 */}
        <div className="app-map">
          <Map
            deliveries={deliveries}
            selectedDelivery={selectedDelivery}
            origin={origin}
            onMarkerClick={handleSelectDelivery}
            onMapClick={handleMapClick}
          />
        </div>
      </div>

      {/* エラーメッセージ表示 */}
      {appError && (
        <div className="app-error">
          {appError}
          <button onClick={() => setAppError(null)}>✕</button>
        </div>
      )}

      {/* フォーム（新規追加または編集） */}
      {showForm && (
        <DeliveryForm
          delivery={editingDelivery}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          onLocationSelect={handleMapClick}
        />
      )}

      {/* 詳細表示モーダル */}
      {showDetail && selectedDelivery && (
        <DeliveryDetail
          delivery={selectedDelivery}
          onClose={handleCloseDetail}
          onEdit={handleEditDelivery}
          onDelete={handleDeleteDelivery}
        />
      )}

      {/* 読み込みエラー表示（初期読み込み時） */}
      {error && (
        <div className="app-error">
          読み込みエラー: {error}
          <button onClick={() => refetch()}>再試行</button>
        </div>
      )}
    </div>
  )
}

export default App
```

**詳細説明**:

#### 状態の種類

| 状態 | 用途 | 型 |
|------|------|-----|
| `deliveries` | すべての配送データ | 配列 |
| `selectedDelivery` | 現在選択中の配送 | オブジェクト \| null |
| `showForm` | フォーム表示フラグ | 真偽値 |
| `editingDelivery` | 編集中の配送（null=新規） | オブジェクト \| null |
| `showDetail` | 詳細表示モーダル表示フラグ | 真偽値 |
| `appError` | エラーメッセージ | 文字列 \| null |
| `origin` | 配送元情報 | オブジェクト \| null |

#### useCallback について

`useCallback` は関数をメモ化（キャッシュ）する React フック。

```javascript
const handleFormSubmit = useCallback(
  async (formData) => {
    // 処理
  },
  [editingDelivery, createDelivery, updateDelivery]  // 依存配列
)
```

**なぜ必要か**:
- 子コンポーネントへ関数を Props で渡す場合、毎回新しい関数インスタンスを作成するとパフォーマンス低下
- `useCallback` により、依存配列の値が変わらない限り同じ関数参照を保持

**依存配列**:
- 関数内で使用する外部変数を記載
- これらが変わると新しい関数を再作成

#### アーキテクチャの設計思想

App.jsx は以下の原則に従って構成：

1. **親が全状態を管理**: すべての重要な状態は App で管理
2. **子コンポーネントは表示のみ**: 子は与えられた Props を表示するだけ
3. **コールバック経由で通信**: ユーザー操作は親の関数を呼び出す
4. **モーダルの排他制御**: フォームと詳細表示は同時に表示しない

**学習ポイント**:
- 大規模プロジェクトでは状態管理ライブラリ（Redux、Zustand など）の使用を検討
- 小～中規模プロジェクトでは useState + useCallback で十分

---

### 2.3 src/api/client.js - API クライアント設定

**役割**: バックエンド API との通信を統一管理。Axios インスタンスの設定とインターセプター処理

```javascript
import axios from 'axios'

// 環境変数から API URL を取得。デフォルトはローカル開発サーバー
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

// Axios インスタンスを作成し、基本設定を適用
const client = axios.create({
  baseURL: API_BASE,              // すべてのリクエストのベース URL
  timeout: 10000,                 // リクエストタイムアウト（ミリ秒）
  headers: {
    'Content-Type': 'application/json'  // JSON 送受信を指定
  }
})

// ===== リクエストインターセプター =====
client.interceptors.request.use(
  (config) => config,              // リクエスト前の処理（現在は無処理）
  (error) => Promise.reject(error)
)

// ===== レスポンスインターセプター =====
client.interceptors.response.use(
  (response) => response.data,      // 成功時：レスポンスボディのみを返却
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)    // エラーはそのまま throw
  }
)

// ===== API メソッド =====

export const deliveryApi = {
  /** 全配送先を取得 */
  getDeliveries: () => client.get('/deliveries'),

  /** 配送先を 1 件取得 */
  getDelivery: (id) => client.get(`/deliveries/${id}`),

  /** 配送先を作成 */
  createDelivery: (delivery) => client.post('/deliveries', delivery),

  /** 配送先を更新 */
  updateDelivery: (id, delivery) => client.put(`/deliveries/${id}`, delivery),

  /** 配送先を削除 */
  deleteDelivery: (id) => client.delete(`/deliveries/${id}`)
}

export default client
```

**詳細説明**:

#### Axios について

Axios は HTTP クライアントライブラリ。fetch API より簡潔で使いやすい。

```javascript
// fetch API の場合
const response = await fetch('/api/deliveries')
const data = await response.json()

// Axios の場合（より簡潔）
const data = await client.get('/deliveries')
```

#### インターセプター

すべてのリクエスト・レスポンスを横取りして共通処理を実行。

**リクエストインターセプター**:
- 認証トークンをヘッダーに追加（現在は未実装）
- リクエストログ出力

**レスポンスインターセプター**:
- 成功時は `response.data` のみを返却（API レスポンスボディ）
- エラー時はコンソール出力して Promise を reject

#### 環境変数

```javascript
import.meta.env.VITE_API_URL
```

Vite では `import.meta.env` で環境変数にアクセス。変数名は `VITE_` で始まる必要がある。

#### REST API 設計

RESTful な設計に従っている：

| メソッド | エンドポイント | 操作 |
|---------|----------------|------|
| GET | /deliveries | 全取得 |
| GET | /deliveries/{id} | 1件取得 |
| POST | /deliveries | 新規作成 |
| PUT | /deliveries/{id} | 更新 |
| DELETE | /deliveries/{id} | 削除 |

**学習ポイント**:
- API 通信層を分離することで、ロジックの再利用性が向上
- インターセプターで全リクエストに共通処理を適用可能

---

### 2.4 src/hooks/useDeliveries.js - カスタムフック

**役割**: 配送データの CRUD 操作と状態管理をカプセル化したカスタムフック

```javascript
import { useState, useCallback, useEffect } from 'react'
import { deliveryApi } from '../api/client'

/**
 * Custom hook for managing deliveries
 * @returns {Object} Deliveries state and actions
 */
export const useDeliveries = () => {
  // ===== State =====
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ===== 非同期データ取得 =====

  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await deliveryApi.getDeliveries()
      // API レスポンスが response.data または response 直接の可能性に対応
      setDeliveries(response.data || response)
    } catch (err) {
      setError(err.message || 'Failed to fetch deliveries')
      console.error('Error fetching deliveries:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ===== CRUD 操作 =====

  // Create: 新規配送を作成
  const createDelivery = useCallback(async (delivery) => {
    try {
      // id と タイムスタンプはサーバーで生成されるので、リクエストから除外
      const { id, created_at, updated_at, ...payload } = delivery
      const response = await deliveryApi.createDelivery(payload)
      const newDelivery = response.data || response
      // 新規配送を配列に追加
      setDeliveries((prev) => [...prev, newDelivery])
      return newDelivery
    } catch (err) {
      setError(err.message || 'Failed to create delivery')
      throw err
    }
  }, [])

  // Update: 既存配送を更新
  const updateDelivery = useCallback(async (id, delivery) => {
    try {
      const response = await deliveryApi.updateDelivery(id, delivery)
      const updatedDelivery = response.data || response
      // 該当する配送のみ置き換え
      setDeliveries((prev) =>
        prev.map((d) => (d.id === id ? updatedDelivery : d))
      )
      return updatedDelivery
    } catch (err) {
      setError(err.message || 'Failed to update delivery')
      throw err
    }
  }, [])

  // Delete: 配送を削除
  const deleteDelivery = useCallback(async (id) => {
    try {
      await deliveryApi.deleteDelivery(id)
      // 削除対象を配列から除外
      setDeliveries((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete delivery')
      throw err
    }
  }, [])

  // Refetch: データを再取得
  const refetch = useCallback(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  // ===== ライフサイクル =====

  // マウント時にデータを取得
  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  // ===== 戻り値 =====

  return {
    deliveries,
    loading,
    error,
    createDelivery,
    updateDelivery,
    deleteDelivery,
    refetch
  }
}
```

**詳細説明**:

#### カスタムフックとは

React フック（useState、useEffect など）を組み合わせて、再利用可能なロジックをカプセル化したもの。

**メリット**:
- ロジックを複数のコンポーネントで再利用
- コンポーネントをシンプルに保つ
- テストが容易

#### useCallback の役割

`fetchDeliveries` を `useCallback` でメモ化しているのは、`useEffect` の依存配列に含めるため。`useCallback` がなければ毎回新しい関数が作成され、`useEffect` が無限ループになる。

```javascript
const fetchDeliveries = useCallback(async () => {
  // ...
}, [])  // 依存なし = 初回作成後、同じ参照を保持

// useEffect 内で使用
useEffect(() => {
  fetchDeliveries()  // マウント時に1回だけ実行
}, [fetchDeliveries])
```

#### 楽観的更新（Optimistic Update）

現在のコードは以下のように動作：

```
1. API にリクエスト送信
2. レスポンス受信
3. 状態を更新
```

**より良い UX**:

```
1. 即座に状態を更新（UI に反映）
2. API にリクエスト送信
3. 失敗時はロールバック
```

これは高度なテクニックなので、初学者は現在の実装で十分。

#### エラーハンドリング

各操作は `try-catch` で囲まれており、エラーは：
- 内部の `error` 状態に格納
- 呼び出し元に `throw` で例外を渡す

これにより、フック内でも呼び出し元でも対応可能。

**学習ポイント**:
- カスタムフックは状態ロジックの再利用のための強力なパターン
- 複雑な状態管理は Context API や Redux へのステップアップの足がかり

---

### 2.5 src/types/delivery.js - 型定義と定数

**役割**: 配送データの型定義と、アプリケーション全体で使用する定数を一元管理

```javascript
/**
 * @typedef {Object} Delivery
 * @property {number} id - Unique identifier
 * @property {string} name - Delivery recipient name
 * @property {string} address - Full address
 * @property {number} lat - GPS latitude
 * @property {number} lng - GPS longitude
 * @property {string} status - Status: 'pending' | 'in_progress' | 'completed'
 * @property {string} [note] - Optional notes
 * @property {string} [created_at] - ISO timestamp
 * @property {string} [updated_at] - ISO timestamp
 */

// ===== ステータス定義 =====

export const DELIVERY_STATUS = {
  PENDING: 'pending',          // 未配送
  IN_PROGRESS: 'in_progress',  // 配送中
  COMPLETED: 'completed'       // 配送完了
}

// ===== ステータス表示ラベル =====

export const STATUS_LABELS = {
  pending: '未配送',
  in_progress: '配送中',
  completed: '配送完了'
}

// ===== ステータス色定義 =====

export const STATUS_COLORS = {
  pending: '#94a3b8',       // グレー
  in_progress: '#3b82f6',   // 青
  completed: '#22c55e'      // 緑
}

// ===== マーカーアイコン URL =====

export const MARKER_COLORS = {
  pending: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',      // 赤
  in_progress: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png', // 黄
  completed: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'   // 緑
}

// ===== デフォルト値 =====

/**
 * @type {Delivery}
 */
export const EMPTY_DELIVERY = {
  id: '',
  name: '',
  address: '',
  lat: 0,
  lng: 0,
  status: DELIVERY_STATUS.PENDING,
  note: ''
}
```

**詳細説明**:

#### JSDoc コメント

```javascript
/**
 * @typedef {Object} Delivery
 * @property {number} id
 */
```

JavaScript の標準コメント形式 JSDoc を使用。IDE（VS Code など）に型情報を提供し、オートコンプリートを有効化する。

#### マジックナンバーを避ける

悪い例：
```javascript
if (status === 'pending') { ... }  // 文字列がハードコーディング
if (color === '#94a3b8') { ... }  // 色コードがハードコーディング
```

良い例：
```javascript
import { DELIVERY_STATUS, STATUS_COLORS } from '../types/delivery'

if (status === DELIVERY_STATUS.PENDING) { ... }
const bgColor = STATUS_COLORS[status]
```

定数として一元管理することで：
- バグが減る（綴り間違いを防止）
- 変更が容易（1か所だけ修正）
- 可読性向上（定数名がドキュメント）

#### EMPTY_DELIVERY の用途

新規フォーム表示時の初期値として使用。

```javascript
const [formData, setFormData] = useState(delivery || EMPTY_DELIVERY)
```

編集時は `delivery` オブジェクト、新規時は `EMPTY_DELIVERY` で初期化。

**学習ポイント**:
- 定数と型定義を分離して管理することで、コードの保守性が大幅に向上
- TypeScript を使用する場合は、ここで type や interface を定義

---

### 2.6 src/components/Map.jsx - Google Maps 統合コンポーネント

**役割**: Google Maps を表示し、配送先のマーカーとルートを可視化

```javascript
import { useEffect, useState, useCallback, useRef } from 'react'
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  useJsApiLoader
} from '@react-google-maps/api'
import { MARKER_COLORS, STATUS_LABELS } from '../types/delivery'
import './Map.css'

// ===== 定数 =====

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

// デフォルト中心座標（東京）
const defaultCenter = {
  lat: 35.6762,
  lng: 139.6503
}

// 地図オプション
const mapOptions = {
  zoom: 12,
  gestureHandling: 'cooperative',  // スクロール時に Ctrl キーが必要
  mapTypeControl: true,            // 地図タイプ切り替えボタン表示
  fullscreenControl: true,         // フルスクリーンボタン表示
  streetViewControl: false,        // ストリートビューボタン非表示
  styles: [
    {
      featureType: 'poi',         // Point of Interest（駅など）
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]  // ラベルを非表示
    }
  ]
}

// Google Maps API で使用するライブラリ
const LIBRARIES = ['places', 'geometry']

/**
 * Google Maps component showing delivery markers and routes
 * @param {Object} props
 * @param {Array} props.deliveries - 配送先リスト
 * @param {Object|null} props.selectedDelivery - 選択中の配送
 * @param {Object|null} props.origin - 配送元（配送ルート表示に必要）
 * @param {Function} props.onMarkerClick - マーカークリック時コールバック
 * @param {Function} props.onMapClick - 地図クリック時コールバック
 */
function Map({ deliveries, selectedDelivery, origin, onMarkerClick, onMapClick }) {
  // ===== Google Maps API ローディング =====

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  })

  // ===== State =====

  const [map, setMap] = useState(null)                // 地図インスタンス
  const [infoWindow, setInfoWindow] = useState(null)  // 開いている InfoWindow
  const [directions, setDirections] = useState(null)  // ルート情報
  const [routeError, setRouteError] = useState(null)  // ルート取得エラー
  const [routeKey, setRouteKey] = useState(0)         // DirectionsRenderer 再レンダリング用キー
  const directionsServiceRef = useRef(null)           // DirectionsService インスタンス

  // ===== 地図のロード完了 =====

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance)
    if (deliveries.length > 0) {
      fitBounds(mapInstance, deliveries, origin)
    }
  }, [deliveries, origin])

  // ===== ユーティリティ関数 =====

  // 複数の点を収めるように地図を自動ズーム・パン
  const fitBounds = (mapInstance, points, orig) => {
    const allPoints = [...points.filter((p) => p.lat && p.lng)]
    if (orig && orig.lat && orig.lng) {
      allPoints.push(orig)
    }
    if (allPoints.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()
    allPoints.forEach((point) => {
      bounds.extend(new window.google.maps.LatLng(point.lat, point.lng))
    })
    mapInstance.fitBounds(bounds, { padding: 100 })
  }

  // ===== 選択配送の詳細表示 =====

  // 配送をクリックしたとき、その位置に地図をズーム・パン
  useEffect(() => {
    if (selectedDelivery && map && selectedDelivery.lat && selectedDelivery.lng) {
      map.setZoom(15)
      map.panTo({
        lat: selectedDelivery.lat,
        lng: selectedDelivery.lng
      })
    }
  }, [selectedDelivery, map])

  // ===== ルート計算（Directions API） =====

  /**
   * 配送元 → 配送先1 → 配送先2 → ... → 配送先N のルートを計算
   *
   * Directions API の仕様：
   * - origin: 出発地
   * - destination: 目的地
   * - waypoints: 経由地（最大 25 個）
   * - optimizeWaypoints: true で自動最適化
   */
  useEffect(() => {
    if (!isLoaded) return

    const validDeliveries = deliveries.filter((d) => d.lat && d.lng)

    // 前のルートをクリア
    setDirections(null)

    // 配送元がないか、配送先が 0 件ならルート表示しない
    if (!origin || !origin.lat || !origin.lng || validDeliveries.length === 0) {
      setRouteError(null)
      return
    }

    // DirectionsService インスタンスを初期化
    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService()
    }

    // ルート計算リクエスト構築
    const destination = validDeliveries[validDeliveries.length - 1]
    const waypoints = validDeliveries.slice(0, -1).map((d) => ({
      location: { lat: d.lat, lng: d.lng },
      stopover: true
    }))

    directionsServiceRef.current.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,  // 自動車ルート
        optimizeWaypoints: true,                             // 経由地を最適化
        language: 'ja'                                       // レスポンス言語を日本語
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result)
          setRouteKey((prev) => prev + 1)  // DirectionsRenderer を再作成
          setRouteError(null)

          // ルート全体が収まるように地図を調整
          if (map) {
            const bounds = new window.google.maps.LatLngBounds()
            result.routes[0].legs.forEach((leg) => {
              bounds.extend(leg.start_location)
              bounds.extend(leg.end_location)
            })
            map.fitBounds(bounds, { padding: 80 })
          }
        } else {
          console.error('Directions API error:', status)
          setDirections(null)
          setRouteError('ルートの取得に失敗しました')
        }
      }
    )
  }, [isLoaded, origin, deliveries, map])

  // ===== イベントハンドラー =====

  const handleMarkerClick = (delivery) => {
    setInfoWindow(delivery.id)
    onMarkerClick?.(delivery)
  }

  const handleMapClick = (event) => {
    if (onMapClick) {
      onMapClick({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      })
    }
  }

  // ===== Render =====

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <p>地図を読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="map-wrapper">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={
          selectedDelivery && selectedDelivery.lat
            ? { lat: selectedDelivery.lat, lng: selectedDelivery.lng }
            : origin && origin.lat
            ? { lat: origin.lat, lng: origin.lng }
            : defaultCenter
        }
        zoom={12}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* ルート表示（DirectionsRenderer） */}
        {directions && (
          <DirectionsRenderer
            key={`route-${routeKey}`}
            directions={directions}
            options={{
              suppressMarkers: true,           // Google のデフォルトマーカーを非表示
              polylineOptions: {
                strokeColor: '#3b82f6',       // 青色
                strokeOpacity: 0.8,
                strokeWeight: 5               // 線幅
              }
            }}
          />
        )}

        {/* 配送元マーカー（青） */}
        {origin && origin.lat && origin.lng && (
          <Marker
            position={{ lat: origin.lat, lng: origin.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            title={`配送元: ${origin.address}`}
            zIndex={1000}  // 他のマーカーより前面
          >
            {infoWindow === 'origin' && (
              <InfoWindow onCloseClick={() => setInfoWindow(null)}>
                <div className="info-window">
                  <h3 className="info-title">配送元</h3>
                  <p className="info-address">{origin.address}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* 配送先マーカー */}
        {deliveries
          .filter((d) => d.lat && d.lng)
          .map((delivery, index) => (
            <Marker
              key={delivery.id}
              position={{ lat: delivery.lat, lng: delivery.lng }}
              icon={{
                url: MARKER_COLORS[delivery.status] || MARKER_COLORS.pending,
                scaledSize: new window.google.maps.Size(32, 32)
              }}
              label={{
                text: String(index + 1),              // 番号ラベル（1, 2, 3...）
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
              onClick={() => handleMarkerClick(delivery)}
              title={delivery.name}
            >
              {/* マーカークリック時に情報ウィンドウを表示 */}
              {infoWindow === delivery.id && (
                <InfoWindow
                  onCloseClick={() => setInfoWindow(null)}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -32)  // マーカーの上に表示
                  }}
                >
                  <div className="info-window">
                    <h3 className="info-title">{delivery.name}</h3>
                    <p className="info-address">{delivery.address}</p>
                    <p className="info-status">
                      状態: <strong>{STATUS_LABELS[delivery.status]}</strong>
                    </p>
                    {delivery.note && <p className="info-note">{delivery.note}</p>}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
      </GoogleMap>

      {/* ルート取得エラー */}
      {routeError && (
        <div className="route-error">
          {routeError}
        </div>
      )}

      {/* メッセージ：配送元がない場合 */}
      {!origin && deliveries.length > 0 && (
        <div className="map-empty">
          <p>配送元を設定するとルートが表示されます</p>
        </div>
      )}

      {/* メッセージ：配送がない場合 */}
      {deliveries.length === 0 && (
        <div className="map-empty">
          <p>配達情報がありません。新規追加してください。</p>
        </div>
      )}
    </div>
  )
}

export default Map
```

**詳細説明**:

#### useJsApiLoader フック

```javascript
const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: LIBRARIES
})
```

Google Maps JavaScript API を非同期でロード。`isLoaded` が true になるまで地図は表示しない。

#### Directions API の流れ

```
1. directionsServiceRef.current.route() でリクエスト
2. Google サーバーがルート計算
3. コールバック関数が result と status で呼ばれる
4. status === 'OK' ならルート情報を state に保存
5. DirectionsRenderer がルートを地図に描画
```

#### マーカーの色分け

```javascript
icon={{
  url: MARKER_COLORS[delivery.status],  // ステータスに応じた色
  scaledSize: new window.google.maps.Size(32, 32)
}}
```

ステータス：
- 未配送（pending）→ 赤
- 配送中（in_progress）→ 黄
- 配送完了（completed）→ 緑

#### 番号ラベル

```javascript
label={{
  text: String(index + 1),  // 1, 2, 3, ...
  color: 'white',
  fontSize: '11px',
  fontWeight: 'bold'
}}
```

各マーカーに到着順序を示すラベルを表示。

**学習ポイント**:
- Google Maps API の複雑な処理は @react-google-maps/api ラッパーで簡潔に実装
- Directions API を活用することで、経由地の最適化ルート表示が可能

---

### 2.7 src/components/DeliveryList.jsx - 配送リスト（サイドバー）

**役割**: 配送先データを一覧表示。フィルタリング、新規追加、編集、削除機能を提供

```javascript
import { useState } from 'react'
import { DELIVERY_STATUS, STATUS_LABELS } from '../types/delivery'
import StatusBadge from './StatusBadge'
import './DeliveryList.css'

/**
 * Sidebar list of deliveries
 * @param {Object} props
 * @param {Delivery[]} props.deliveries - List of deliveries
 * @param {Delivery|null} [props.selectedDelivery] - Currently selected delivery
 * @param {Function} props.onSelectDelivery - Callback when a delivery is clicked
 * @param {Function} props.onAddNew - Callback when add button is clicked
 * @param {Function} [props.onEdit] - Callback when edit button is clicked
 * @param {Function} [props.onDelete] - Callback when delete button is clicked
 * @param {boolean} [props.isLoading] - Loading state
 * @returns {React.ReactElement}
 */
function DeliveryList({
  deliveries,
  selectedDelivery,
  onSelectDelivery,
  onAddNew,
  onEdit,
  onDelete,
  isLoading
}) {
  // ===== State =====

  // フィルター状態（'all' または ステータス値）
  const [filterStatus, setFilterStatus] = useState('all')

  // ===== 計算済み値 =====

  // フィルター条件に基づいて配送先をフィルタリング
  const filteredDeliveries =
    filterStatus === 'all'
      ? deliveries
      : deliveries.filter((d) => d.status === filterStatus)

  // ===== イベントハンドラー =====

  const handleDelete = (e, id) => {
    e.stopPropagation()  // 親の onClick に伝播しないようにする
    if (window.confirm('この配達情報を削除しますか？')) {
      onDelete?.(id)
    }
  }

  const handleEdit = (e, delivery) => {
    e.stopPropagation()  // 親の onClick に伝播しないようにする
    onEdit?.(delivery)
  }

  // ===== Render =====

  return (
    <div className="delivery-list-container">
      {/* ヘッダー：新規追加ボタン */}
      <div className="list-header">
        <button className="btn-add-new" onClick={onAddNew}>
          + 新規追加
        </button>
      </div>

      {/* フィルター選択肢 */}
      <div className="list-filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">すべて ({deliveries.length})</option>
          <option value={DELIVERY_STATUS.PENDING}>
            {STATUS_LABELS.pending} (
            {deliveries.filter((d) => d.status === DELIVERY_STATUS.PENDING).length})
          </option>
          <option value={DELIVERY_STATUS.IN_PROGRESS}>
            {STATUS_LABELS.in_progress} (
            {deliveries.filter((d) => d.status === DELIVERY_STATUS.IN_PROGRESS).length})
          </option>
          <option value={DELIVERY_STATUS.COMPLETED}>
            {STATUS_LABELS.completed} (
            {deliveries.filter((d) => d.status === DELIVERY_STATUS.COMPLETED).length})
          </option>
        </select>
      </div>

      {/* メインコンテンツ */}
      {isLoading ? (
        /* ローディング中 */
        <div className="list-empty">
          <p>読み込み中...</p>
        </div>
      ) : filteredDeliveries.length === 0 ? (
        /* 配送がない場合 */
        <div className="list-empty">
          <p>配達情報がありません</p>
          <button onClick={onAddNew} className="btn-empty-add">
            新規追加
          </button>
        </div>
      ) : (
        /* 配送リスト */
        <div className="deliveries-scroll">
          <div className="deliveries-list">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className={`delivery-card ${
                  selectedDelivery?.id === delivery.id ? 'active' : ''
                }`}
                onClick={() => onSelectDelivery(delivery)}
              >
                {/* カード：ヘッダー（名前 + ステータス） */}
                <div className="card-header">
                  <h3 className="card-name">{delivery.name}</h3>
                  <StatusBadge status={delivery.status} />
                </div>

                {/* カード：住所 */}
                <div className="card-address">
                  {delivery.address}
                </div>

                {/* カード：備考（省略版） */}
                {delivery.note && (
                  <div className="card-note">
                    {delivery.note.length > 50
                      ? delivery.note.substring(0, 50) + '...'
                      : delivery.note}
                  </div>
                )}

                {/* カード：アクション（編集・削除） */}
                <div className="card-actions">
                  {onEdit && (
                    <button
                      className="card-btn-edit"
                      onClick={(e) => handleEdit(e, delivery)}
                      title="編集"
                    >
                      ✏️
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="card-btn-delete"
                      onClick={(e) => handleDelete(e, delivery.id)}
                      title="削除"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DeliveryList
```

**詳細説明**:

#### イベント伝播の制御

```javascript
const handleDelete = (e, id) => {
  e.stopPropagation()  // 親の onClick に伝播しないようにする
  if (window.confirm('この配達情報を削除しますか？')) {
    onDelete?.(id)
  }
}
```

削除ボタンをクリックすると：
1. 削除ボタンの onClick が発火
2. stopPropagation で親の delivery-card の onClick へ伝播しない
3. そのため、onSelectDelivery が呼ばれない

`e.stopPropagation()` がなければ、削除と同時に詳細表示も開く。

#### 確認ダイアログ

```javascript
if (window.confirm('この配達情報を削除しますか？')) {
  onDelete?.(id)
}
```

`window.confirm()` でユーザーに確認。キャンセルされた場合は削除しない。

本来は React コンポーネントとしたカスタムモーダルが望ましい（ネイティブ確認ダイアログはカスタマイズできない）。

#### 条件付きレンダリング

```javascript
{isLoading ? (
  <div>ローディング中...</div>
) : filteredDeliveries.length === 0 ? (
  <div>配達情報がありません</div>
) : (
  <div>配送リスト</div>
)}
```

三項演算子のネストで複数条件を制御。可読性を重視すれば、if-else を使った方がよい場合もある。

**学習ポイント**:
- フィルタリング機能は状態管理の基本パターン
- イベント伝播の制御は複雑な UI で重要

---

### 2.8 src/components/DeliveryForm.jsx - 配送追加・編集フォーム

**役割**: 配送先の情報を入力・編集するモーダルフォーム。ジオコーディング機能搭載。

**重要**: このコンポーネントは**フロントエンド側**で Geocoding API を直接呼び出している（セキュリティに注意が必要）

```javascript
import { useState, useEffect } from 'react'
import { DELIVERY_STATUS, EMPTY_DELIVERY, STATUS_LABELS } from '../types/delivery'
import './DeliveryForm.css'

/**
 * Geocode an address using Google Maps Geocoding API
 * このコンポーネント内で直接 Geocoding API を呼び出している点に注意。
 * 本番環境では、バックエンド経由で呼び出すことを推奨。
 *
 * @param {string} address
 * @returns {Promise<{lat: number, lng: number}>}
 */
async function geocodeAddress(address) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=ja`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error('住所が見つかりませんでした')
  }

  const location = data.results[0].geometry.location
  return { lat: location.lat, lng: location.lng }
}

/**
 * Form for creating and editing deliveries
 */
function DeliveryForm({ delivery, onSubmit, onCancel, onLocationSelect }) {
  // ===== State =====

  const [formData, setFormData] = useState(delivery || EMPTY_DELIVERY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [geocodingError, setGeocodingError] = useState(null)

  // ===== ライフサイクル =====

  // delivery prop が変わったときにフォームをリセット
  useEffect(() => {
    if (delivery) {
      setFormData(delivery)
    } else {
      setFormData(EMPTY_DELIVERY)
    }
    setError(null)
    setGeocodingError(null)
  }, [delivery])

  // ===== イベントハンドラー =====

  // 入力フィールド変更
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // 住所から緯度経度を取得（ジオコーディング）
  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) {
      setGeocodingError('住所を入力してください')
      return
    }

    setLoading(true)
    setGeocodingError(null)

    try {
      const { lat, lng } = await geocodeAddress(formData.address)
      setFormData((prev) => ({
        ...prev,
        lat,
        lng
      }))
    } catch (err) {
      setGeocodingError('住所の検索に失敗しました。別の住所を試してください。')
      console.error('Geocoding error:', err)
    } finally {
      setLoading(false)
    }
  }

  // フォーム送信
  const handleSubmit = async (e) => {
    e.preventDefault()

    // バリデーション
    if (!formData.name.trim()) {
      setError('受取人名は必須です')
      return
    }

    if (!formData.address.trim()) {
      setError('住所は必須です')
      return
    }

    if (!formData.lat || !formData.lng) {
      setError('住所を検索して緯度・経度を取得してください')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit(formData)
    } catch (err) {
      setError(err.message || '送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 新規フラグ（id がなければ新規）
  const isNew = !delivery || !delivery.id

  // ===== Render =====

  return (
    // モーダルオーバーレイ（背景）
    <div className="delivery-form-overlay" onClick={onCancel}>
      {/* モーダルコンテナ（背景クリックで閉じない） */}
      <div className="delivery-form-container" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="form-header">
          <h2 className="form-title">
            {isNew ? '新規配達を作成' : '配達情報を編集'}
          </h2>
          <button className="close-button" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="delivery-form">
          {/* エラー表示 */}
          {error && <div className="form-error">{error}</div>}
          {geocodingError && <div className="form-warning">{geocodingError}</div>}

          {/* 受取人名 */}
          <div className="form-group">
            <label htmlFor="name">受取人名 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="山田太郎"
              required
            />
          </div>

          {/* 住所 + ジオコーディングボタン */}
          <div className="form-group">
            <label htmlFor="address">住所 *</label>
            <div className="address-input-group">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="東京都渋谷区道玄坂..."
                required
              />
              <button
                type="button"
                onClick={handleGeocodeAddress}
                disabled={loading || !formData.address.trim()}
                className="geocode-button"
              >
                {loading ? '検索中...' : '検索'}
              </button>
            </div>
          </div>

          {/* 緯度経度（読み取り専用） */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lat">緯度</label>
              <input
                type="number"
                id="lat"
                name="lat"
                value={formData.lat || ''}
                readOnly
                placeholder="35.6762"
                step="0.0001"
              />
              <small>住所検索で自動取得します</small>
            </div>
            <div className="form-group">
              <label htmlFor="lng">経度</label>
              <input
                type="number"
                id="lng"
                name="lng"
                value={formData.lng || ''}
                readOnly
                placeholder="139.6503"
                step="0.0001"
              />
              <small>住所検索で自動取得します</small>
            </div>
          </div>

          {/* ステータス */}
          <div className="form-group">
            <label htmlFor="status">ステータス</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {Object.entries(DELIVERY_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          {/* 備考 */}
          <div className="form-group">
            <label htmlFor="note">備考</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="配達時の注意事項など..."
              rows="3"
            />
          </div>

          {/* ボタン */}
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              キャンセル
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? '送信中...' : '保存'}
            </button>
          </div>
        </form>

        {/* ヒント */}
        {onLocationSelect && (
          <div className="form-hint">
            <small>地図をクリックして位置を選択することもできます</small>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryForm
```

**詳細説明**:

#### フロントエンド側のジオコーディング

```javascript
async function geocodeAddress(address) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=...&key=${apiKey}`
  const response = await fetch(url)
  // ...
}
```

**セキュリティの問題**:
- API キーがフロントエンドに露出（ブラウザの DevTools で見える）
- 本来は**バックエンド経由**で呼び出すべき

**改善案**:

```javascript
// フロントエンド
const result = await fetch('/api/geocode?address=...')

// バックエンド（Node.js）
app.get('/api/geocode', async (req, res) => {
  const { address } = req.query
  const result = await googleMapsClient.geocode({ address })
  res.json(result)
})
```

バックエンド側で API キーを管理することで、安全になる。

#### モーダルの実装

```javascript
<div className="delivery-form-overlay" onClick={onCancel}>
  <div className="delivery-form-container" onClick={(e) => e.stopPropagation()}>
    {/* コンテンツ */}
  </div>
</div>
```

- 背景をクリック → `overlay` の onClick が発火 → `onCancel()` 実行
- コンテナ内をクリック → `e.stopPropagation()` で `overlay` の onClick に伝播しない

#### バリデーション

フォーム送信前に以下をチェック：

1. 受取人名が空でないか
2. 住所が空でないか
3. 緯度経度が取得されているか

**学習ポイント**:
- ジオコーディング API はバックエンド経由で呼び出すべき
- フォームバリデーションは複数段階で実施（クライアント + サーバー）

---

### 2.9 src/components/DeliveryDetail.jsx - 配送詳細モーダル

**役割**: 選択中の配送の詳細情報を表示。編集・削除ボタンを備えたモーダル

```javascript
import { STATUS_LABELS } from '../types/delivery'
import StatusBadge from './StatusBadge'
import './DeliveryDetail.css'

/**
 * Detail view for a single delivery
 * @param {Object} props
 * @param {Delivery} props.delivery - Delivery to display
 * @param {Function} props.onClose - Callback when closing detail view
 * @param {Function} [props.onEdit] - Callback when edit button is clicked
 * @param {Function} [props.onDelete] - Callback when delete button is clicked
 * @returns {React.ReactElement}
 */
function DeliveryDetail({ delivery, onClose, onEdit, onDelete }) {
  // ===== イベントハンドラー =====

  const handleDelete = () => {
    if (window.confirm('この配達情報を削除しますか？')) {
      onDelete?.(delivery.id)
    }
  }

  // ===== Render =====

  return (
    // モーダルオーバーレイ
    <div className="delivery-detail-overlay" onClick={onClose}>
      {/* モーダルコンテナ */}
      <div className="delivery-detail-container" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="detail-header">
          <h2 className="detail-title">{delivery.name}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="detail-content">
          {/* 基本情報セクション */}
          <div className="detail-section">
            <h3 className="section-title">基本情報</h3>
            <div className="detail-item">
              <span className="detail-label">受取人名</span>
              <span className="detail-value">{delivery.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">住所</span>
              <span className="detail-value address">{delivery.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">ステータス</span>
              <div className="detail-value">
                <StatusBadge status={delivery.status} />
              </div>
            </div>
          </div>

          {/* 位置情報セクション */}
          <div className="detail-section">
            <h3 className="section-title">位置情報</h3>
            <div className="detail-item">
              <span className="detail-label">緯度</span>
              <span className="detail-value coordinate">{delivery.lat?.toFixed(6)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">経度</span>
              <span className="detail-value coordinate">{delivery.lng?.toFixed(6)}</span>
            </div>
            <div className="detail-item">
              {/* 外部リンク：Google Maps で位置を表示 */}
              <a
                href={`https://www.google.com/maps/@${delivery.lat},${delivery.lng},15z`}
                target="_blank"
                rel="noopener noreferrer"
                className="map-link"
              >
                📍 Google Maps で表示
              </a>
            </div>
          </div>

          {/* 備考セクション */}
          {delivery.note && (
            <div className="detail-section">
              <h3 className="section-title">備考</h3>
              <p className="detail-note">{delivery.note}</p>
            </div>
          )}

          {/* タイムスタンプセクション */}
          {(delivery.created_at || delivery.updated_at) && (
            <div className="detail-section">
              <h3 className="section-title">タイムスタンプ</h3>
              {delivery.created_at && (
                <div className="detail-item">
                  <span className="detail-label">作成日時</span>
                  <span className="detail-value timestamp">
                    {new Date(delivery.created_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              )}
              {delivery.updated_at && (
                <div className="detail-item">
                  <span className="detail-label">更新日時</span>
                  <span className="detail-value timestamp">
                    {new Date(delivery.updated_at).toLocaleString('ja-JP')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="detail-actions">
          {onEdit && (
            <button onClick={() => onEdit(delivery)} className="btn-edit">
              編集
            </button>
          )}
          {onDelete && (
            <button onClick={handleDelete} className="btn-delete">
              削除
            </button>
          )}
          <button onClick={onClose} className="btn-close">
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeliveryDetail
```

**詳細説明**:

#### 日時フォーマット

```javascript
new Date(delivery.created_at).toLocaleString('ja-JP')
```

ISO 8601 形式（`2024-01-15T10:30:00Z`）を日本語ローカル形式に変換。

結果例：
```
2024年1月15日 10:30:00
```

#### Google Maps リンク

```javascript
href={`https://www.google.com/maps/@${delivery.lat},${delivery.lng},15z`}
```

配送先の緯度経度を使って、Google Maps で位置を開くリンク。

**学習ポイント**:
- モーダルは情報表示用のシンプルな構成
- 外部サービスへのリンク時は `target="_blank"` と `rel="noopener noreferrer"` を付ける

---

### 2.10 src/components/OriginSetting.jsx - 配送元設定

**役割**: 配送元（営業所など）の住所を設定。ジオコーディングで自動的に座標を取得

```javascript
import { useState } from 'react'
import './OriginSetting.css'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

/**
 * Geocode an address using Google Maps Geocoding API
 */
async function geocodeAddress(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}&language=ja`
  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK' || !data.results || data.results.length === 0) {
    throw new Error('住所が見つかりませんでした')
  }

  const location = data.results[0].geometry.location
  return {
    lat: location.lat,
    lng: location.lng,
    formattedAddress: data.results[0].formatted_address
  }
}

/**
 * Component for setting delivery origin (e.g., warehouse)
 */
function OriginSetting({ origin, onOriginChange }) {
  // ===== State =====

  const [address, setAddress] = useState(origin?.address || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(!origin)  // 初期状態で origin がなければ編集モード

  // ===== イベントハンドラー =====

  const handleSearch = async () => {
    if (!address.trim()) return

    setLoading(true)
    setError(null)

    try {
      const result = await geocodeAddress(address)
      const newOrigin = {
        address: result.formattedAddress || address,
        lat: result.lat,
        lng: result.lng
      }
      onOriginChange(newOrigin)
      setAddress(newOrigin.address)
      setIsEditing(false)
    } catch (err) {
      setError('住所の検索に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  // ===== Render =====

  // 設定済みで編集モードでない場合：表示のみ
  if (!isEditing && origin) {
    return (
      <div className="origin-setting">
        <div className="origin-display">
          <div className="origin-label">配送元</div>
          <div className="origin-address">{origin.address}</div>
          <button className="origin-edit-btn" onClick={() => setIsEditing(true)}>
            変更
          </button>
        </div>
      </div>
    )
  }

  // 編集モード（初期状態または「変更」ボタンクリック後）
  return (
    <div className="origin-setting">
      <div className="origin-label">配送元を設定</div>
      {error && <div className="origin-error">{error}</div>}
      <div className="origin-input-group">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="営業所の住所を入力..."
          className="origin-input"
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !address.trim()}
          className="origin-search-btn"
        >
          {loading ? '...' : '設定'}
        </button>
        {origin && (
          <button className="origin-cancel-btn" onClick={() => setIsEditing(false)}>
            戻る
          </button>
        )}
      </div>
    </div>
  )
}

export default OriginSetting
```

**詳細説明**:

#### 状態遷移

```
初期状態（origin がない）
  ↓ isEditing = true（自動的に編集モード）
入力フィールド表示
  ↓ 「設定」ボタン
ジオコーディング実行
  ↓ 成功
origin に値をセット、isEditing = false
  ↓
住所のみ表示（「変更」ボタン付き）
  ↓ 「変更」ボタンクリック
isEditing = true（編集モード）
  ↓
入力フィールド表示
```

#### Enter キーで検索

```javascript
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    handleSearch()
  }
}
```

ユーザー体験向上のため、入力欄で Enter キーを押すと検索実行。

**学習ポイント**:
- コンポーネントが表示モードと編集モードを切り替える実装
- ジオコーディングはこのコンポーネント内でも重複実装（本来は共通関数に抽出すべき）

---

### 2.11 src/components/Header.jsx - ヘッダーコンポーネント

**役割**: アプリケーション全体のヘッダーを表示。配送件数のサマリーを表示

```javascript
import './Header.css'

/**
 * Application header component
 * @param {Object} props
 * @param {number} [props.deliveryCount] - Total deliveries count
 * @returns {React.ReactElement}
 */
function Header({ deliveryCount = 0 }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title-section">
          <h1 className="header-title">配達ルート管理システム</h1>
          <p className="header-subtitle">Delivery Route Management System</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">配達件数</span>
            <span className="stat-value">{deliveryCount}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
```

**詳細説明**:

シンプルなプレゼンテーションコンポーネント。Props で受け取った `deliveryCount` を表示するだけ。

**今後の拡張**:
- ステータスごとの件数表示
- リロードボタン
- ユーザーメニュー

**学習ポイント**:
- プレゼンテーションコンポーネント（ロジックなし）は最もシンプル
- Props only の場合は関数型コンポーネントで十分

---

### 2.12 src/components/StatusBadge.jsx - ステータスバッジ

**役割**: 配送ステータスをカラフルなバッジで表示する再利用可能なコンポーネント

```javascript
import { STATUS_LABELS, STATUS_COLORS } from '../types/delivery'
import './StatusBadge.css'

/**
 * Status badge component
 * @param {Object} props
 * @param {string} props.status - Delivery status
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement}
 */
function StatusBadge({ status, className = '' }) {
  const label = STATUS_LABELS[status] || status
  const color = STATUS_COLORS[status] || '#999'

  return (
    <span
      className={`status-badge ${className}`}
      style={{ backgroundColor: color }}
    >
      {label}
    </span>
  )
}

export default StatusBadge
```

**詳細説明**:

#### インラインスタイル

```javascript
style={{ backgroundColor: color }}
```

`STATUS_COLORS` で定義した色を、インラインスタイルで動的に適用。

**CSS Classes の方が良い**（本来）:

```javascript
const colorClass = {
  pending: 'badge-pending',
  in_progress: 'badge-in-progress',
  completed: 'badge-completed'
}[status]

return <span className={`status-badge ${colorClass}`}>{label}</span>
```

CSS Classes の方が以下の点で優れている：
- CSS-in-JS が不要
- スタイルの管理が容易
- テーマ切り替えが簡単

#### 再利用性

このコンポーネントは複数の場所で使用：
- DeliveryList の各カード
- DeliveryDetail の詳細表示
- Map の InfoWindow

1 か所だけの変更で、全体が反映される。

**学習ポイント**:
- 小さく、単一責任のコンポーネントは高い再利用性を持つ

---

### 2.13 CSS ファイル概要

各コンポーネントに対応する CSS ファイルがあり、スコープ化されたスタイルを管理。

| ファイル | 役割 |
|---------|------|
| `index.css` | グローバルスタイル（リセット、フォント等） |
| `App.css` | メインレイアウト（グリッド、フレックスボックス） |
| `components/Header.css` | ヘッダースタイル |
| `components/Map.css` | 地図コンポーネントスタイル |
| `components/DeliveryList.css` | リストスタイル（スクロール、カード） |
| `components/DeliveryForm.css` | フォームスタイル（入力フィールド、モーダル） |
| `components/DeliveryDetail.css` | 詳細表示スタイル（モーダル） |
| `components/OriginSetting.css` | 配送元設定スタイル |
| `components/StatusBadge.css` | バッジスタイル |

---

## 3. Google Maps API 詳細説明

### 3.1 Google Maps JavaScript API

**役割**: ウェブページに対話的な地図を埋め込む

#### 使用コンポーネント

`@react-google-maps/api` ライブラリを通じて使用：

```javascript
import {
  GoogleMap,      // 地図コンテナ
  Marker,         // マーカー（点）
  InfoWindow,     // マーカークリック時の情報ウィンドウ
  DirectionsRenderer,  // ルート表示
  useJsApiLoader  // API ロード管理フック
} from '@react-google-maps/api'
```

#### API キーの設定

```javascript
const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: LIBRARIES
})
```

環境変数から API キーを読み込み。`isLoaded` が true になるまで地図は非表示。

#### マーカー

```javascript
<Marker
  position={{ lat: delivery.lat, lng: delivery.lng }}
  icon={{
    url: MARKER_COLORS[delivery.status],
    scaledSize: new window.google.maps.Size(32, 32)
  }}
  label={{
    text: String(index + 1),
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold'
  }}
  onClick={() => handleMarkerClick(delivery)}
/>
```

各配送先を地図上に点で表示。色とラベルでステータスと順序を表現。

#### InfoWindow

```javascript
{infoWindow === delivery.id && (
  <InfoWindow onCloseClick={() => setInfoWindow(null)}>
    <div className="info-window">
      <h3>{delivery.name}</h3>
      <p>{delivery.address}</p>
    </div>
  </InfoWindow>
)}
```

マーカークリック時に表示される情報ウィンドウ。HTML コンテンツをカスタマイズ可能。

---

### 3.2 Geocoding API

**役割**: 住所 ⇔ 緯度経度の相互変換

#### 実装

```javascript
async function geocodeAddress(address) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=ja`

  const response = await fetch(url)
  const data = await response.json()

  if (data.status !== 'OK') {
    throw new Error('住所が見つかりませんでした')
  }

  const location = data.results[0].geometry.location
  return { lat: location.lat, lng: location.lng }
}
```

**動作**:
1. 住所を URL エンコード
2. HTTP リクエストで Geocoding API を呼び出し
3. JSON レスポンスを解析
4. 最初の結果から緯度経度を抽出

**レスポンス例**:
```json
{
  "status": "OK",
  "results": [
    {
      "formatted_address": "東京都渋谷区道玄坂1丁目",
      "geometry": {
        "location": {
          "lat": 35.6595,
          "lng": 139.7004
        }
      }
    }
  ]
}
```

#### 使用個所

- `DeliveryForm.jsx`: 住所入力後、「検索」ボタンで実行
- `OriginSetting.jsx`: 配送元の住所で実行

---

### 3.3 Directions API

**役割**: 複数の地点を経由するルートを計算し、距離・移動時間を取得

#### 実装

```javascript
directionsServiceRef.current.route(
  {
    origin: { lat: origin.lat, lng: origin.lng },          // 出発地
    destination: { lat: destination.lat, lng: destination.lng },  // 目的地
    waypoints: validDeliveries.slice(0, -1).map((d) => ({
      location: { lat: d.lat, lng: d.lng },
      stopover: true
    })),
    travelMode: window.google.maps.TravelMode.DRIVING,     // 移動手段
    optimizeWaypoints: true,                               // 経由地を最適化
    language: 'ja'
  },
  (result, status) => {
    if (status === 'OK') {
      // ルート情報を取得
      setDirections(result)
    }
  }
)
```

**パラメータ説明**:

| パラメータ | 説明 |
|-----------|------|
| `origin` | 出発地点の座標 |
| `destination` | 目的地点の座標 |
| `waypoints` | 経由地点の配列 |
| `travelMode` | 移動手段（DRIVING, WALKING, BICYCLING, TRANSIT） |
| `optimizeWaypoints` | true で経由地を最適化（最短ルート） |
| `language` | レスポンス言語 |

#### DirectionsRenderer

```javascript
{directions && (
  <DirectionsRenderer
    key={`route-${routeKey}`}
    directions={directions}
    options={{
      suppressMarkers: true,       // デフォルトマーカーを非表示
      polylineOptions: {
        strokeColor: '#3b82f6',   // 青色
        strokeOpacity: 0.8,
        strokeWeight: 5
      }
    }}
  />
)}
```

Directions API の結果を地図上に経路として描画。

#### レスポンス構造

```javascript
result = {
  routes: [
    {
      legs: [
        {
          start_location: { lat, lng },
          end_location: { lat, lng },
          distance: { text: '1.5 km', value: 1500 },
          duration: { text: '5 分', value: 300 },
          steps: [
            {
              distance: { ... },
              duration: { ... },
              html_instructions: '東に向かって進む'
            }
          ]
        }
      ]
    }
  ]
}
```

`legs` は各区間（経由地間）の情報。`steps` は詳細なナビゲーション指示。

---

### 3.4 API キーの管理

#### 環境変数設定

`.env` ファイル（ローカル開発用）:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...xxxxx
VITE_API_URL=http://localhost:8080/api/v1
```

`.env.production` ファイル（本番環境用）:
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...yyyyy
VITE_API_URL=https://api.example.com/api/v1
```

#### アクセス方法

```javascript
import.meta.env.VITE_GOOGLE_MAPS_API_KEY
import.meta.env.VITE_API_URL
```

Vite では `import.meta.env` で環境変数にアクセス。`VITE_` プレフィックスが必須。

#### セキュリティ上の注意

**現在の実装の問題**:
- Geocoding API をフロントエンドから直接呼び出し
- API キーがブラウザに露出

**本番環境での推奨**:
- Geocoding API はバックエンド経由で呼び出し
- API キーをサーバーで管理
- フロントエンドからは API キー不要

```javascript
// セキュアな実装
const result = await fetch('/api/geocode?address=...')
```

---

## 4. 状態管理フロー

### 4.1 データフロー図

```
┌─────────────────────────────────────────────────────┐
│                   App.jsx                           │
│  (状態管理、イベントハンドラー)                     │
└────────────────┬──────────────────────────────────┘
                 │
    ┌────────────┼────────────────────────┐
    │            │                        │
    ▼            ▼                        ▼
Header      DeliveryList            OriginSetting
(表示)       (リスト表示)            (配送元設定)
            (フィルター)
                 │
            ┌────┴─────┐
            │           │
            ▼           ▼
        DeliveryCard  DeliveryForm
        (クリック)    (新規/編集)
                 │
                 ▼
          DeliveryDetail
          (詳細表示)


         ┌───────────────┐
         │  useDeliveries│
         │  (カスタム     │
         │   フック)      │
         └────────┬──────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
    api/client.js     (state管理)
    (Axios設定)       deliveries[]
                      loading
                      error
```

### 4.2 CRUD 操作のフロー

#### Create（新規配送作成）

```
1. DeliveryList の「新規追加」ボタンをクリック
   └→ App.jsx: handleAddNew()
   └→ setShowForm(true)

2. DeliveryForm が表示される
   └→ delivery prop は null（新規フラグ）

3. ユーザーがフォーム入力

4. 「保存」ボタンをクリック
   └→ DeliveryForm: handleSubmit()
   └→ App.jsx: handleFormSubmit(formData)
   └→ useDeliveries: createDelivery(formData)
   └→ api/client: POST /deliveries
   └→ バックエンド: 新規 ID を付与して保存
   └→ フロントエンド: state に新規配送を追加
   └→ DeliveryForm を閉じる
```

#### Update（配送更新）

```
1. DeliveryList でカード上の「編集」ボタンをクリック
   └→ App.jsx: handleEditDelivery(delivery)
   └→ setEditingDelivery(delivery)
   └→ setShowForm(true)

2. DeliveryForm が表示される
   └→ delivery prop に値が入る（編集フラグ）
   └→ フォームが既存データで初期化

3. ユーザーが値を変更

4. 「保存」ボタンをクリック
   └→ DeliveryForm: handleSubmit()
   └→ App.jsx: handleFormSubmit(formData)
   └→ editingDelivery が null でないため UPDATE 判定
   └→ useDeliveries: updateDelivery(id, formData)
   └→ api/client: PUT /deliveries/{id}
   └→ バックエンド: 該当 ID のデータを更新
   └→ フロントエンド: state の該当配送を置き換え
   └→ DeliveryForm を閉じる
```

#### Delete（配送削除）

```
1. DeliveryList カード上または DeliveryDetail で「削除」ボタンをクリック
   └→ window.confirm('削除しますか？')

2. ユーザーが「OK」をクリック
   └→ App.jsx: handleDeleteDelivery(id)
   └→ useDeliveries: deleteDelivery(id)
   └→ api/client: DELETE /deliveries/{id}
   └→ バックエンド: 該当 ID を削除
   └→ フロントエンド: state から該当配送を削除
   └→ 選択中の配送が削除された場合、詳細表示を閉じる
```

#### Read（配送一覧取得）

```
1. App マウント時
   └→ useDeliveries フック初期化
   └→ useEffect が fetchDeliveries() を実行
   └→ api/client: GET /deliveries
   └→ バックエンド: 全配送データを返却
   └→ フロントエンド: state に保存
   └→ コンポーネント再レンダリング
   └→ DeliveryList に配送データ表示
```

### 4.3 origin（配送元）の状態管理

```
App.jsx で管理：
  const [origin, setOrigin] = useState(null)

OriginSetting コンポーネントから：
  onOriginChange(newOrigin)
  └→ App.jsx: setOrigin(newOrigin)

Map コンポーネントで使用：
  origin prop で受け取る
  └→ マーカー表示
  └→ Directions API でルート計算
```

origin が変わると、自動的に Map が再レンダリングされルート計算が実行される。

---

## 5. Vite 設定と環境変数

### 5.1 vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,      // 開発サーバーポート
    open: true       // サーバー起動時にブラウザを自動開く
  }
})
```

**説明**:
- `react()` プラグイン：JSX を自動的にトランスパイル
- `port: 3000`：`npm run dev` で http://localhost:3000 で起動
- `open: true`：起動時にブラウザが自動的にウィンドウを開く

### 5.2 環境変数管理

#### .env.example（テンプレート）

```
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

開発者が `.env` ファイルを作成する際のテンプレート。機密情報は含めない。

#### .env（ローカル開発）

```
VITE_API_URL=http://localhost:8080/api/v1
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...xxxxx
```

開発環境の設定。**.gitignore に含める**（Git リポジトリに含めない）。

#### .env.production（本番環境）

```
VITE_API_URL=https://api.example.com/api/v1
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...yyyyy
```

本番環境の設定。ビルド時に使用。

#### アクセス方法

```javascript
// 開発環境（VITE_API_URL）
const apiUrl = import.meta.env.VITE_API_URL

// 環境別自動選択
const isDev = import.meta.env.DEV       // true (dev mode)
const isProd = import.meta.env.PROD     // true (production)
```

---

## 6. 学習のロードマップ

### Level 1: 基礎理解（1 週間）

1. React の基本概念
   - JSX 構文
   - コンポーネント（関数型）
   - Props と State

2. React Hooks
   - useState
   - useEffect
   - useCallback

3. このプロジェクトの流れ
   - App.jsx の構造
   - 各コンポーネント間の通信

### Level 2: API 統合（1 週間）

1. HTTP 通信
   - fetch API
   - Axios の基本

2. 非同期処理
   - async/await
   - Promise

3. このプロジェクト
   - api/client.js の役割
   - useDeliveries フックの理解

### Level 3: Google Maps API（1 週間）

1. Google Maps 基本
   - 地図の表示
   - マーカー
   - InfoWindow

2. 高度な機能
   - Geocoding API
   - Directions API

3. このプロジェクト
   - Map.jsx の実装
   - ルート計算ロジック

### Level 4: 実装力向上（継続）

1. エラーハンドリング
2. パフォーマンス最適化
3. アクセシビリティ
4. テスト（Jest、React Testing Library）

---

## 7. よくある質問と解説

### Q: useCallback はなぜ必要か？

A: 関数をメモ化して、不必要な再レンダリングを防ぐため。

```javascript
// useCallback なし（毎回新しい関数インスタンスが作成される）
const handleClick = () => { ... }

// useCallback あり（依存配列の値が変わるまで同じ参照）
const handleClick = useCallback(() => { ... }, [dependency])
```

子コンポーネントへ関数を Props で渡す場合、関数参照が変わると不必要な再レンダリングが発生。

### Q: State と Props の使い分け？

A:
- **State**: コンポーネント内部で変更される値
- **Props**: 親から受け取る読み取り専用値

```javascript
// App.jsx
const [deliveries, setDeliveries] = useState([])
<DeliveryList deliveries={deliveries} />  // Props

// DeliveryList.jsx
function DeliveryList({ deliveries }) {    // Props として受け取る
  const [filterStatus, setFilterStatus] = useState('all')  // State
}
```

### Q: なぜ API 通信をフックで管理するのか？

A: 複数のコンポーネントで同じロジックを再利用するため。

```javascript
// 1 回目のコンポーネント
const { deliveries } = useDeliveries()

// 2 回目のコンポーネント
const { deliveries, createDelivery } = useDeliveries()

// 同じロジック、異なる用途で再利用可能
```

### Q: Directions API の optimizeWaypoints は何か？

A: 経由地を自動最適化して最短ルートを計算する機能。

```javascript
optimizeWaypoints: true
// 配送1 → 配送2 → 配送3 の順序が自動的に
// 最短距離になるよう入れ替わる可能性あり
```

運送業での活用例。

### Q: 環境変数が .env にあると Git で見える？

A: `.gitignore` に `.env` を追加することで、Git リポジトリに含めない。

```bash
# .gitignore
.env
.env.local
```

---

## 8. まとめ

このカリキュラムで学習した内容：

| 項目 | 学習内容 |
|------|---------|
| **React** | コンポーネント、Hooks、状態管理、Props |
| **API 統合** | Axios、RESTful API、非同期処理 |
| **Google Maps** | 地図表示、ジオコーディング、ルート計算 |
| **アーキテクチャ** | コンポーネント設計、データフロー、分割統治 |
| **開発環境** | Vite、環境変数、ビルドプロセス |

次のステップ：

1. **TypeScript への移行**: 型安全性を向上
2. **状態管理ライブラリの導入**: Context API、Redux、Zustand
3. **テスト**: Jest、React Testing Library で自動テスト
4. **本番環境構築**: Docker、CI/CD、デプロイ
5. **パフォーマンス最適化**: Code Splitting、Lazy Loading、メモ化

---

このドキュメントを通じて、配達ルート管理システムのフロントエンド実装を深く理解できることを願っています。各セクションを何度も読み返し、実際のコードと照らし合わせることで、学習が定着します。

頑張ってください！
