import { useState, useEffect, useCallback } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  InfoWindow,
} from '@react-google-maps/api'
import './PredictedLocationMap.css'

const containerStyle = {
  width: '100%',
  height: '500px',
}

function PredictedLocationMap({ trip, prediction, onRefresh }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

  const [directions, setDirections] = useState(null)
  const [showInfo, setShowInfo] = useState(true)

  const hasOrigin = trip?.origin_lat && trip?.origin_lng
  const hasDestination = trip?.destination_lat && trip?.destination_lng
  const hasPrediction = prediction?.lat && prediction?.lng

  // ルート取得
  useEffect(() => {
    if (!isLoaded || !hasOrigin || !hasDestination) return

    const directionsService = new window.google.maps.DirectionsService()
    directionsService.route(
      {
        origin: { lat: trip.origin_lat, lng: trip.origin_lng },
        destination: { lat: trip.destination_lat, lng: trip.destination_lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result)
        }
      }
    )
  }, [isLoaded, hasOrigin, hasDestination, trip?.origin_lat, trip?.origin_lng, trip?.destination_lat, trip?.destination_lng])

  const getCenter = useCallback(() => {
    if (hasPrediction) return { lat: prediction.lat, lng: prediction.lng }
    if (hasOrigin && hasDestination) {
      return {
        lat: (trip.origin_lat + trip.destination_lat) / 2,
        lng: (trip.origin_lng + trip.destination_lng) / 2,
      }
    }
    return { lat: 36.2048, lng: 138.2529 }
  }, [hasPrediction, hasOrigin, hasDestination, prediction, trip])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}時間${m}分`
    return `${m}分`
  }

  if (!isLoaded) return <div className="predicted-map-loading">マップを読み込み中...</div>

  return (
    <div className="predicted-location-map">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={getCenter()}
        zoom={hasPrediction ? 10 : 7}
      >
        {/* ルート描画 */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#94a3b8',
                strokeWeight: 4,
                strokeOpacity: 0.6,
              },
              suppressMarkers: true,
            }}
          />
        )}

        {/* 出発地マーカー */}
        {hasOrigin && (
          <Marker
            position={{ lat: trip.origin_lat, lng: trip.origin_lng }}
            label={{ text: '出発', color: '#fff', fontSize: '11px' }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            }}
          />
        )}

        {/* 到着地マーカー */}
        {hasDestination && (
          <Marker
            position={{ lat: trip.destination_lat, lng: trip.destination_lng }}
            label={{ text: '到着', color: '#fff', fontSize: '11px' }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: '#ef4444',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            }}
          />
        )}

        {/* 予測位置マーカー */}
        {hasPrediction && (
          <>
            <Marker
              position={{ lat: prediction.lat, lng: prediction.lng }}
              onClick={() => setShowInfo(!showInfo)}
              icon={{
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 8,
                fillColor: '#2563eb',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
                rotation: 0,
              }}
            />
            {showInfo && (
              <InfoWindow
                position={{ lat: prediction.lat, lng: prediction.lng }}
                onCloseClick={() => setShowInfo(false)}
              >
                <div className="predict-info-window">
                  <strong>予測現在地</strong>
                  <p>進捗: {prediction.progress_percent}%</p>
                  <p>残り: {formatTime(prediction.remaining_seconds)}</p>
                </div>
              </InfoWindow>
            )}
          </>
        )}
      </GoogleMap>

      {/* 予測情報バー */}
      {prediction && (
        <div className="prediction-info-bar">
          <div className="prediction-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${prediction.progress_percent}%` }}
              />
            </div>
            <span className="progress-text">{prediction.progress_percent}%</span>
          </div>
          <div className="prediction-details">
            <span>経過: {formatTime(prediction.elapsed_seconds)}</span>
            <span>残り: {formatTime(prediction.remaining_seconds)}</span>
          </div>
          {onRefresh && (
            <button className="refresh-btn" onClick={onRefresh}>
              更新
            </button>
          )}
        </div>
      )}

      {!prediction && (
        <div className="prediction-info-bar no-data">
          <p>予測位置データがありません。出発時刻を過ぎるとここに表示されます。</p>
        </div>
      )}
    </div>
  )
}

export default PredictedLocationMap
