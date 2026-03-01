import { useState, useEffect } from 'react'
import { DELIVERY_STATUS, EMPTY_DELIVERY, STATUS_LABELS } from '../types/delivery'
import './DeliveryForm.css'

/**
 * Geocode an address using Google Maps Geocoding API
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
  const [formData, setFormData] = useState(delivery || EMPTY_DELIVERY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [geocodingError, setGeocodingError] = useState(null)

  useEffect(() => {
    if (delivery) {
      setFormData(delivery)
    } else {
      setFormData(EMPTY_DELIVERY)
    }
    setError(null)
    setGeocodingError(null)
  }, [delivery])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()

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

  const isNew = !delivery || !delivery.id

  return (
    <div className="delivery-form-overlay" onClick={onCancel}>
      <div className="delivery-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2 className="form-title">
            {isNew ? '新規配達を作成' : '配達情報を編集'}
          </h2>
          <button className="close-button" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="delivery-form">
          {error && <div className="form-error">{error}</div>}
          {geocodingError && <div className="form-warning">{geocodingError}</div>}

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

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              キャンセル
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? '送信中...' : '保存'}
            </button>
          </div>
        </form>

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
