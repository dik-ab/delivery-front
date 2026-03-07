import { useState, useCallback, useEffect } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
} from '@react-google-maps/api'
import './TripRouteMap.css'

const containerStyle = {
  width: '100%',
  height: '400px',
}

const defaultCenter = { lat: 36.2048, lng: 138.2529 } // 日本中心

function TripRouteMap({ origin, destination, originLabel, destinationLabel, onRouteCalculated }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

  const [directions, setDirections] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)

  const hasOrigin = origin && origin.lat && origin.lng
  const hasDestination = destination && destination.lat && destination.lng
  const canRoute = hasOrigin && hasDestination

  // ルート取得
  useEffect(() => {
    if (!isLoaded || !canRoute) {
      setDirections(null)
      setRouteInfo(null)
      return
    }

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result)
          const leg = result.routes[0].legs[0]
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
          })
          // ルートデータを親コンポーネントに通知
          if (onRouteCalculated) {
            onRouteCalculated(result)
          }
        } else {
          console.error('Directions request failed:', status)
          setDirections(null)
          setRouteInfo(null)
        }
      }
    )
  }, [isLoaded, canRoute, origin?.lat, origin?.lng, destination?.lat, destination?.lng])

  // マップの中心を計算
  const getCenter = () => {
    if (hasOrigin && hasDestination) {
      return {
        lat: (origin.lat + destination.lat) / 2,
        lng: (origin.lng + destination.lng) / 2,
      }
    }
    if (hasOrigin) return { lat: origin.lat, lng: origin.lng }
    if (hasDestination) return { lat: destination.lat, lng: destination.lng }
    return defaultCenter
  }

  if (!isLoaded) return <div className="trip-route-map-loading">マップを読み込み中...</div>

  return (
    <div className="trip-route-map">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={getCenter()}
        zoom={canRoute ? 7 : hasOrigin || hasDestination ? 12 : 5}
      >
        {/* ルートがあればDirectionsRendererで描画 */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: '#2563eb',
                strokeWeight: 5,
              },
            }}
          />
        )}

        {/* ルートが取得できない場合はマーカーだけ表示 */}
        {!directions && hasOrigin && (
          <Marker
            position={{ lat: origin.lat, lng: origin.lng }}
            label="出"
          />
        )}
        {!directions && hasDestination && (
          <Marker
            position={{ lat: destination.lat, lng: destination.lng }}
            label="着"
          />
        )}
      </GoogleMap>

      {/* ルート情報 */}
      {routeInfo && (
        <div className="route-info-bar">
          <span className="route-info-item">
            📏 距離: <strong>{routeInfo.distance}</strong>
          </span>
          <span className="route-info-item">
            ⏱ 所要時間: <strong>{routeInfo.duration}</strong>
          </span>
        </div>
      )}

      {/* ラベル */}
      {(originLabel || destinationLabel) && (
        <div className="route-labels">
          {originLabel && <span className="route-label origin">出発: {originLabel}</span>}
          {destinationLabel && <span className="route-label destination">到着: {destinationLabel}</span>}
        </div>
      )}
    </div>
  )
}

export default TripRouteMap
