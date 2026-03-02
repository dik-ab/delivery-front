import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import TripCard from '../components/TripCard'
import TripRouteMap from '../components/TripRouteMap'
import './TripSearchPage.css'

function TripSearchPage() {
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    origin_lat: '',
    origin_lng: '',
    dest_lat: '',
    dest_lng: '',
    radius: '50',
    date: '',
    includeReverse: false
  })
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState(null)

  const { searchTrips } = useTrips()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSearchParams((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location
        return { lat, lng }
      }
      return null
    } catch (err) {
      console.error('Geocoding error:', err)
      return null
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    setError(null)
    setSearching(true)

    try {
      // Geocode origin
      const originCoords = await geocodeAddress(searchParams.origin)
      if (!originCoords) {
        setError('出発地が見つかりません')
        setSearching(false)
        return
      }

      // Geocode destination
      const destCoords = await geocodeAddress(searchParams.destination)
      if (!destCoords) {
        setError('到着地が見つかりません')
        setSearching(false)
        return
      }

      // Build search params
      const params = {
        origin_lat: originCoords.lat,
        origin_lng: originCoords.lng,
        dest_lat: destCoords.lat,
        dest_lng: destCoords.lng,
        radius: searchParams.radius
      }

      if (searchParams.date) {
        params.date = searchParams.date
      }

      // Perform search
      const results = await searchTrips(params)
      setSearchResults(results)
      setSearched(true)
    } catch (err) {
      setError(err.message || '検索に失敗しました')
    } finally {
      setSearching(false)
    }
  }

  const [searching, setSearching] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)

  return (
    <div className="trip-search-page">
      <div className="trip-search-container">
        <h1>便を探す</h1>

        <form className="search-form" onSubmit={handleSearch}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="origin">出発地 *</label>
              <input
                id="origin"
                type="text"
                name="origin"
                value={searchParams.origin}
                onChange={handleChange}
                placeholder="東京都渋谷区"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">到着地 *</label>
              <input
                id="destination"
                type="text"
                name="destination"
                value={searchParams.destination}
                onChange={handleChange}
                placeholder="大阪府大阪市"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">出発日（任意）</label>
              <input
                id="date"
                type="date"
                name="date"
                value={searchParams.date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="radius">検索範囲 (km)</label>
              <select
                id="radius"
                name="radius"
                value={searchParams.radius}
                onChange={handleChange}
              >
                <option value="10">10km</option>
                <option value="25">25km</option>
                <option value="50">50km</option>
                <option value="100">100km</option>
                <option value="500">全国</option>
              </select>
            </div>
          </div>

          <div className="form-checkbox">
            <input
              id="includeReverse"
              type="checkbox"
              name="includeReverse"
              checked={searchParams.includeReverse}
              onChange={handleChange}
            />
            <label htmlFor="includeReverse">
              帰り便も検索する（帰り便シェアで往路を検索）
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary-large"
            disabled={searching}
          >
            {searching ? '検索中...' : '便を検索'}
          </button>
        </form>

        {searched && (
          <div className="search-results">
            <h2>
              検索結果 ({searchResults.length} 件)
            </h2>

            {/* 選択した便のルートマップ */}
            {selectedTrip && selectedTrip.origin_lat && selectedTrip.destination_lat && (
              <div className="selected-trip-map">
                <h3>ルートプレビュー: {selectedTrip.origin_address} → {selectedTrip.destination_address}</h3>
                <TripRouteMap
                  origin={{ lat: selectedTrip.origin_lat, lng: selectedTrip.origin_lng }}
                  destination={{ lat: selectedTrip.destination_lat, lng: selectedTrip.destination_lng }}
                  originLabel={selectedTrip.origin_address}
                  destinationLabel={selectedTrip.destination_address}
                />
              </div>
            )}

            {searchResults.length > 0 ? (
              <div className="results-list">
                {searchResults.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    onMapClick={() => setSelectedTrip(trip)}
                    isSelected={selectedTrip?.id === trip.id}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>該当する便が見つかりませんでした</p>
                <p>別の条件で検索してみてください</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TripSearchPage
