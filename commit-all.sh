#!/bin/bash
# 1ファイルずつコミットするスクリプト（Frontend）
# 使い方: bash commit-all.sh

set -e

echo "🚀 Frontend: 1ファイルずつコミット開始"

# Config
git add .gitignore
git commit -m "🙈 .gitignore: node_modules・ビルド成果物・環境変数を除外"

git add package.json
git commit -m "📦 deps: React + Vite + react-router-dom + Google Maps + Axios"

git add vite.config.js
git commit -m "⚙️ config: Vite設定（ポート3000, React plugin）"

git add eslint.config.js
git commit -m "🔧 lint: ESLint設定"

git add .env.example
git commit -m "⚙️ config: 環境変数テンプレート（API URL + Google Maps Key）"

git add Dockerfile
git commit -m "🐳 docker: Nginx配信用マルチステージビルド"

# Entry files
git add index.html
git commit -m "🏠 entry: HTMLエントリーポイント"

git add public/index.html
git commit -m "🏠 public: HTMLテンプレート"

git add src/index.jsx
git commit -m "🏠 entry: React エントリーポイント（StrictMode）"

git add src/index.css
git commit -m "🎨 style: グローバルCSS"

# Types & Constants
git add src/types/delivery.js
git commit -m "📝 types: 配送ステータス定数・型定義"

# API Layer
git add src/api/client.js
git commit -m "🔌 api: Axiosクライアント（JWT認証ヘッダー自動付与）"

for f in src/api/auth.js src/api/trips.js src/api/matches.js src/api/tracking.js src/api/admin.js; do
  if [ -f "$f" ]; then
    name=$(basename "$f" .js)
    git add "$f"
    git commit -m "🔌 api: ${name} APIモジュール" || true
  fi
done

# Context
if [ -f src/context/AuthContext.jsx ]; then
  git add src/context/AuthContext.jsx
  git commit -m "🔐 context: 認証コンテキスト（ログイン状態管理・JWT保存）"
fi

# Hooks
git add src/hooks/useDeliveries.js
git commit -m "🪝 hook: useDeliveries（配送先CRUD）"

for f in src/hooks/useAuth.js src/hooks/useTrips.js src/hooks/useMatches.js; do
  if [ -f "$f" ]; then
    name=$(basename "$f" .js)
    git add "$f"
    git commit -m "🪝 hook: ${name}" || true
  fi
done

# Existing Components
git add src/components/Map.jsx src/components/Map.css
git commit -m "🗺️ component: Google Maps（マーカー + Directions APIルート表示）"

git add src/components/DeliveryList.jsx src/components/DeliveryList.css
git commit -m "📋 component: 配送先リスト（サイドバー + フィルター）"

git add src/components/DeliveryForm.jsx src/components/DeliveryForm.css
git commit -m "📝 component: 配送先フォーム（Geocoding API住所検索）"

git add src/components/DeliveryDetail.jsx src/components/DeliveryDetail.css
git commit -m "🔍 component: 配送先詳細モーダル"

git add src/components/OriginSetting.jsx src/components/OriginSetting.css
git commit -m "📍 component: 配送元設定（住所入力 + ジオコーディング）"

git add src/components/Header.jsx src/components/Header.css
git commit -m "🎯 component: ヘッダー"

git add src/components/StatusBadge.jsx src/components/StatusBadge.css
git commit -m "🏷️ component: ステータスバッジ"

# New Components
for f in src/components/Layout.jsx src/components/Navbar.jsx src/components/ProtectedRoute.jsx src/components/TripCard.jsx src/components/MatchCard.jsx src/components/StatsCard.jsx src/components/TripMap.jsx src/components/TrackingMap.jsx; do
  if [ -f "$f" ]; then
    name=$(basename "$f" .jsx)
    css="${f%.jsx}.css"
    if [ -f "$css" ]; then
      git add "$f" "$css"
    else
      git add "$f"
    fi
    git commit -m "✨ component: ${name}" || true
  fi
done

# Pages
for f in src/pages/LoginPage.jsx src/pages/RegisterPage.jsx src/pages/DashboardPage.jsx src/pages/TripSearchPage.jsx src/pages/TripCreatePage.jsx src/pages/TripDetailPage.jsx src/pages/MyTripsPage.jsx src/pages/MyMatchesPage.jsx src/pages/TrackingPage.jsx src/pages/AdminDashboardPage.jsx src/pages/AdminUsersPage.jsx src/pages/AdminTripsPage.jsx; do
  if [ -f "$f" ]; then
    name=$(basename "$f" .jsx)
    css="${f%.jsx}.css"
    if [ -f "$css" ]; then
      git add "$f" "$css"
    else
      git add "$f"
    fi
    git commit -m "📄 page: ${name}" || true
  fi
done

# App
git add src/App.jsx src/App.css
git commit -m "🏗️ app: メインApp（React Router全ルーティング + 認証統合）"

# CI/CD
git add .github/workflows/ci.yml
git commit -m "🔄 ci: GitHub Actions（lint → build → docker）"

# Documentation
git add README.md
git commit -m "📝 docs: README（セットアップ手順）"

for f in PLATFORM_GUIDE.md IMPLEMENTATION_SUMMARY.md QUICKSTART.md; do
  if [ -f "$f" ]; then
    git add "$f"
    git commit -m "📝 docs: ${f%.md}" || true
  fi
done

git add docs/ 2>/dev/null && git commit -m "📚 docs: カリキュラム・イシュードキュメント" || true

# Catch any remaining files
git add -A 2>/dev/null && git commit -m "📦 misc: その他ファイル" || true

echo "✅ Frontend: 全ファイルのコミット完了！"
echo ""
echo "次のコマンドでpush:"
echo "  git push -u origin main"
