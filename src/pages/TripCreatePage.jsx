import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import TripRouteMap from '../components/TripRouteMap'
import './TripCreatePage.css'

function TripCreatePage() {
  const [formData, setFormData] = useState({
    origin: '',
    origin_lat: '',
    origin_lng: '',
    destination: '',
    dest_lat: '',
    dest_lng: '',
    vehicle_type: '軽トラ',
    available_weight: '',
    departure_time: '',
    price: '',
    delay_minutes: '30',
    note: '',
    trip_type: 'outbound',
    is_public: true,
    is_solo_mode: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [routeData, setRouteData] = useState(null) // Directions API response

  const { createTrip } = useTrips()
  const navigate = useNavigate()

  const vehicleTypes = ['軽トラ', '2t', '4t', '10t', '大型']

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const geocodeAddress = async (address, isDestination = false) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location
        if (isDestination) {
          setFormData((prev) => ({
            ...prev,
            dest_lat: lat,
            dest_lng: lng,
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            origin_lat: lat,
            origin_lng: lng,
          }))
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err)
    }
  }

  const handleOriginBlur = () => {
    if (formData.origin) {
      geocodeAddress(formData.origin, false)
    }
  }

  const handleDestinationBlur = () => {
    if (formData.destination) {
      geocodeAddress(formData.destination, true)
    }
  }

  // TripRouteMapからルートデータを受け取るコールバック
  const handleRouteCalculated = useCallback((result) => {
    if (result && result.routes && result.routes[0]) {
      const route = result.routes[0]
      const leg = route.legs[0]

      // ステップ情報をJSON化（予測位置で使用）
      const steps = leg.steps.map((step) => ({
        start_lat: step.start_location.lat(),
        start_lng: step.start_location.lng(),
        end_lat: step.end_location.lat(),
        end_lng: step.end_location.lng(),
        duration_sec: step.duration.value,
        distance_m: step.distance.value,
        polyline: step.polyline?.points || '',
      }))

      setRouteData({
        route_polyline: route.overview_polyline,
        route_duration_sec: leg.duration.value,
        route_steps_json: JSON.stringify(steps),
        estimated_arrival: leg.duration.value, // 秒数（出発時刻に加算して到着予定を算出）
        distance_text: leg.distance.text,
        duration_text: leg.duration.text,
      })
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.origin || !formData.destination) {
      setError('出発地と到着地は必須です')
      return
    }

    if (!formData.origin_lat || !formData.origin_lng) {
      setError('出発地の位置情報を取得してください')
      return
    }

    if (!formData.dest_lat || !formData.dest_lng) {
      setError('到着地の位置情報を取得してください')
      return
    }

    setLoading(true)

    try {
      // 出発時刻からestimated_arrivalを計算
      const departureAt = new Date(formData.departure_time)
      let estimatedArrival = null
      if (routeData && routeData.estimated_arrival) {
        estimatedArrival = new Date(
          departureAt.getTime() + routeData.estimated_arrival * 1000
        ).toISOString()
      }

      const tripPayload = {
        origin_address: formData.origin,
        origin_lat: parseFloat(formData.origin_lat),
        origin_lng: parseFloat(formData.origin_lng),
        destination_address: formData.destination,
        destination_lat: parseFloat(formData.dest_lat),
        destination_lng: parseFloat(formData.dest_lng),
        vehicle_type: formData.vehicle_type,
        available_weight: parseInt(formData.available_weight) || 0,
        departure_at: departureAt.toISOString(),
        price: parseInt(formData.price) || 0,
        delay_minutes: parseInt(formData.delay_minutes) || 0,
        note: formData.note,
        status: 'open',
        trip_type: formData.trip_type,
        is_public: formData.is_public,
        is_solo_mode: formData.is_solo_mode,
      }

      // ルートデータがあれば追加
      if (routeData) {
        tripPayload.route_polyline = routeData.route_polyline
        tripPayload.route_duration_sec = routeData.route_duration_sec
        tripPayload.route_steps_json = routeData.route_steps_json
      }

      if (estimatedArrival) {
        tripPayload.estimated_arrival = estimatedArrival
      }

      await createTrip(tripPayload)
      navigate('/my-trips')
    } catch (err) {
      setError(err.message || '便の登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="trip-create-page">
      <div className="trip-create-container">
        <h1>新しい便を登録</h1>

        {error && <div className="form-error">{error}</div>}

        <form className="trip-form" onSubmit={handleSubmit}>
          {/* 便の種類・設定 */}
          <section className="form-section">
            <h2>便の種類・設定</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="trip_type">便種別 *</label>
                <select
                  id="trip_type"
                  name="trip_type"
                  value={formData.trip_type}
                  onChange={handleChange}
                >
                  <option value="outbound">往路（配送便）</option>
                  <option value="return">帰り便（空車）</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="vehicle_type">車両タイプ *</label>
                <select
                  id="vehicle_type"
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  required
                >
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.trip_type === 'return' && (
              <div className="return-trip-note">
                帰り便（空車）として登録します。荷主からのマッチングリクエストを受け付けることができます。
              </div>
            )}

            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-text">
                  外部公開する
                  <span className="toggle-description">
                    ONにすると、他の荷主・運送会社から検索可能になります
                  </span>
                </span>
              </label>
            </div>

            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="is_solo_mode"
                  checked={formData.is_solo_mode}
                  onChange={handleChange}
                />
                <span className="toggle-switch"></span>
                <span className="toggle-text">
                  ソロモード（自社管理用）
                  <span className="toggle-description">
                    自社の便情報を管理するだけで、マッチングは行いません
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* ルート情報 */}
          <section className="form-section">
            <h2>ルート情報</h2>

            <div className="form-group">
              <label htmlFor="origin">出発地 *</label>
              <div className="input-wrapper">
                <input
                  id="origin"
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  onBlur={handleOriginBlur}
                  placeholder="東京都渋谷区"
                  required
                />
                {formData.origin_lat && (
                  <span className="input-check">✓</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="destination">到着地 *</label>
              <div className="input-wrapper">
                <input
                  id="destination"
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  onBlur={handleDestinationBlur}
                  placeholder="大阪府大阪市"
                  required
                />
                {formData.dest_lat && (
                  <span className="input-check">✓</span>
                )}
              </div>
            </div>
          </section>

          {/* ルートプレビュー */}
          {(formData.origin_lat || formData.dest_lat) && (
            <section className="form-section">
              <h2>ルートプレビュー</h2>
              <TripRouteMap
                origin={
                  formData.origin_lat
                    ? {
                        lat: parseFloat(formData.origin_lat),
                        lng: parseFloat(formData.origin_lng),
                      }
                    : null
                }
                destination={
                  formData.dest_lat
                    ? {
                        lat: parseFloat(formData.dest_lat),
                        lng: parseFloat(formData.dest_lng),
                      }
                    : null
                }
                originLabel={formData.origin}
                destinationLabel={formData.destination}
                onRouteCalculated={handleRouteCalculated}
              />

              {/* ルートデータ表示 */}
              {routeData && (
                <div className="route-data-summary">
                  <span>距離: {routeData.distance_text}</span>
                  <span>所要時間: {routeData.duration_text}</span>
                  <span className="route-data-saved">ルートデータ保存済み</span>
                </div>
              )}
            </section>
          )}

          {/* 車両・積載情報 */}
          <section className="form-section">
            <h2>積載情報</h2>

            <div className="form-group">
              <label htmlFor="available_weight">利用可能重量 (kg) *</label>
              <input
                id="available_weight"
                type="number"
                name="available_weight"
                value={formData.available_weight}
                onChange={handleChange}
                placeholder="500"
                required
              />
            </div>
          </section>

          {/* 日時・価格 */}
          <section className="form-section">
            <h2>日時・価格</h2>

            <div className="form-group">
              <label htmlFor="departure_time">出発日時 *</label>
              <input
                id="departure_time"
                type="datetime-local"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">
                  {formData.is_solo_mode ? '参考料金 (円)' : '料金 (円) *'}
                </label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="10000"
                  required={!formData.is_solo_mode}
                />
              </div>

              <div className="form-group">
                <label htmlFor="delay_minutes">想定遅延時間 (分)</label>
                <input
                  id="delay_minutes"
                  type="number"
                  name="delay_minutes"
                  value={formData.delay_minutes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* その他 */}
          <section className="form-section">
            <h2>その他</h2>

            <div className="form-group">
              <label htmlFor="note">備考</label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="特別な注意事項などがあれば記入してください"
                rows="4"
              ></textarea>
            </div>
          </section>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              キャンセル
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? '登録中...'
                : formData.is_solo_mode
                ? '自社便を登録'
                : formData.trip_type === 'return'
                ? '帰り便を登録'
                : '便を登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TripCreatePage
