import { useParams, useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import './TrackingPage.css'

function TrackingPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { trips } = useTrips()

  const trip = trips.find((t) => t.id === tripId)

  if (!trip) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <p className="not-found">便が見つかりません</p>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            ダッシュボードに戻る
          </button>
        </div>
      </div>
    )
  }

  if (trip.status !== 'in_transit') {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <h1>ライブトラッキング</h1>
          <div className="tracking-info">
            <p>この便は現在輸送中ではありません。</p>
            <p>ステータス: {trip.status}</p>
            <button className="btn-secondary" onClick={() => navigate(`/trips/${trip.id}`)}>
              便の詳細へ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← 戻る
        </button>

        <h1>ライブトラッキング</h1>

        <div className="tracking-grid">
          <div className="tracking-map">
            <div className="map-placeholder">
              <p>🗺️ ここに Google Map が表示されます</p>
              <p className="map-note">
                ドライバーの現在位置: {trip.origin} 付近
              </p>
            </div>
          </div>

          <div className="tracking-info-panel">
            <section className="info-section">
              <h2>便情報</h2>
              <div className="info-rows">
                <div className="info-row">
                  <span className="label">ルート</span>
                  <span className="value">{trip.origin} → {trip.destination}</span>
                </div>
                <div className="info-row">
                  <span className="label">出発</span>
                  <span className="value">
                    {new Date(trip.departure_time).toLocaleString('ja-JP')}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">ドライバー</span>
                  <span className="value">{trip.driver?.name}</span>
                </div>
              </div>
            </section>

            <section className="info-section">
              <h2>位置情報更新</h2>
              <div className="update-info">
                <p className="last-update">
                  最終更新: <span>--:-- --</span>
                </p>
                <div className="location-display">
                  <div className="coord">経度: {trip.origin_lng}</div>
                  <div className="coord">緯度: {trip.origin_lat}</div>
                </div>
              </div>
            </section>

            <section className="info-section">
              <h2>トラッキング履歴</h2>
              <div className="tracking-history">
                <p className="no-data">トラッキングデータが利用可能になると、ここに表示されます</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackingPage
