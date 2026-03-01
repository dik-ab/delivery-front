import { useState } from 'react'
import './OriginSetting.css'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

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

function OriginSetting({ origin, onOriginChange }) {
  const [address, setAddress] = useState(origin?.address || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(!origin)

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
