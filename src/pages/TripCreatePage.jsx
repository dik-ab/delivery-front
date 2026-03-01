import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
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
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showMap, setShowMap] = useState(false)

  const { createTrip } = useTrips()
  const navigate = useNavigate()

  const vehicleTypes = ['軽トラ', '2t', '4t', '10t', '大型']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
            dest_lng: lng
          }))
        } else {
          setFormData((prev) => ({
            ...prev,
            origin_lat: lat,
            origin_lng: lng
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
      await createTrip({
        origin: formData.origin,
        origin_lat: parseFloat(formData.origin_lat),
        origin_lng: parseFloat(formData.origin_lng),
        destination: formData.destination,
        dest_lat: parseFloat(formData.dest_lat),
        dest_lng: parseFloat(formData.dest_lng),
        vehicle_type: formData.vehicle_type,
        available_weight: parseInt(formData.available_weight),
        departure_time: new Date(formData.departure_time).toISOString(),
        price: parseInt(formData.price),
        delay_minutes: parseInt(formData.delay_minutes),
        note: formData.note,
        status: 'open'
      })

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

          <section className="form-section">
            <h2>車両・積載情報</h2>

            <div className="form-row">
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
            </div>
          </section>

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
                <label htmlFor="price">料金 (円) *</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="10000"
                  required
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
              {loading ? '登録中...' : '便を登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TripCreatePage
