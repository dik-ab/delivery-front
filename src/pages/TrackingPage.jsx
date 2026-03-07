import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tripsApi } from '../api/trips'
import PredictedLocationMap from '../components/PredictedLocationMap'
import './TrackingPage.css'

function TrackingPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTrip = useCallback(async () => {
    try {
      const data = await tripsApi.getTrip(tripId)
      setTrip(data)
    } catch (err) {
      setError('便情報の取得に失敗しました')
    }
  }, [tripId])

  const fetchPrediction = useCallback(async () => {
    try {
      const data = await tripsApi.getPredictedLocation(tripId)
      setPrediction(data.prediction)
    } catch (err) {
      // Prediction might not be available yet
      setPrediction(null)
    }
  }, [tripId])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchTrip()
      await fetchPrediction()
      setLoading(false)
    }
    init()
  }, [fetchTrip, fetchPrediction])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPrediction()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchPrediction])

  if (loading) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="tracking-page">
        <div className="tracking-container">
          <p className="not-found">{error || '便が見つかりません'}</p>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            ダッシュボードに戻る
          </button>
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

        <h1>予測位置トラッキング</h1>

        <div className="tracking-grid">
          <div className="tracking-map">
            <PredictedLocationMap
              trip={trip}
              prediction={prediction}
              onRefresh={fetchPrediction}
            />
          </div>

          <div className="tracking-info-panel">
            <section className="info-section">
              <h2>便情報</h2>
              <div className="info-rows">
                <div className="info-row">
                  <span className="label">ルート</span>
                  <span className="value">
                    {trip.origin_address} → {trip.destination_address}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">出発時刻</span>
                  <span className="value">
                    {new Date(trip.departure_at).toLocaleString('ja-JP')}
                  </span>
                </div>
                {trip.estimated_arrival && (
                  <div className="info-row">
                    <span className="label">到着予定</span>
                    <span className="value">
                      {new Date(trip.estimated_arrival).toLocaleString('ja-JP')}
                    </span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">ステータス</span>
                  <span className={`status-badge status-${trip.status}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">便種別</span>
                  <span className="value">
                    {trip.trip_type === 'return' ? '帰り便（空車）' : '往路'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">車両</span>
                  <span className="value">{trip.vehicle_type || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">運送会社</span>
                  <span className="value">{trip.driver?.company || trip.driver?.name || '-'}</span>
                </div>
              </div>
            </section>

            <section className="info-section">
              <h2>予測位置情報</h2>
              {prediction ? (
                <div className="info-rows">
                  <div className="info-row">
                    <span className="label">進捗</span>
                    <span className="value">{prediction.progress_percent}%</span>
                  </div>
                  <div className="info-row">
                    <span className="label">予測座標</span>
                    <span className="value">
                      {prediction.lat}, {prediction.lng}
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="label">経過時間</span>
                    <span className="value">{formatDuration(prediction.elapsed_seconds)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">残り時間</span>
                    <span className="value">{formatDuration(prediction.remaining_seconds)}</span>
                  </div>
                </div>
              ) : (
                <div className="update-info">
                  <p className="no-data">
                    予測位置データなし。ルートデータが登録されていないか、出発前の便です。
                  </p>
                </div>
              )}
            </section>

            {trip.delay_minutes > 0 && (
              <section className="info-section">
                <h2>遅延情報</h2>
                <div className="delay-alert">
                  約 {trip.delay_minutes} 分の遅延が報告されています
                </div>
              </section>
            )}

            <section className="info-section">
              <p className="tracking-note">
                ※ この位置情報はGPSではなく、出発時刻・到着予定時刻・ルート情報をもとにした予測値です。
                休憩・渋滞等で実際の位置とは異なる場合があります。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0分'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}時間${m}分`
  return `${m}分`
}

export default TrackingPage
