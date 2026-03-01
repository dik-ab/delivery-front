import { useEffect, useState, useCallback, useRef } from 'react'
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  useJsApiLoader
} from '@react-google-maps/api'
import { MARKER_COLORS, STATUS_LABELS } from '../types/delivery'
import './Map.css'

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: 35.6762,
  lng: 139.6503
}

const mapOptions = {
  zoom: 12,
  gestureHandling: 'cooperative',
  mapTypeControl: true,
  fullscreenControl: true,
  streetViewControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

const LIBRARIES = ['places', 'geometry']

/**
 * Google Maps component showing delivery markers and routes
 * @param {Object} props
 * @param {Object|null} props.origin - 配送元 { address, lat, lng }
 */
function Map({ deliveries, selectedDelivery, origin, onMarkerClick, onMapClick }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  })

  const [map, setMap] = useState(null)
  const [infoWindow, setInfoWindow] = useState(null)
  const [directions, setDirections] = useState(null)
  const [routeError, setRouteError] = useState(null)
  const [routeKey, setRouteKey] = useState(0)
  const directionsServiceRef = useRef(null)

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance)
    if (deliveries.length > 0) {
      fitBounds(mapInstance, deliveries, origin)
    }
  }, [deliveries, origin])

  const fitBounds = (mapInstance, points, orig) => {
    const allPoints = [...points.filter((p) => p.lat && p.lng)]
    if (orig && orig.lat && orig.lng) {
      allPoints.push(orig)
    }
    if (allPoints.length === 0) return
    const bounds = new window.google.maps.LatLngBounds()
    allPoints.forEach((point) => {
      bounds.extend(new window.google.maps.LatLng(point.lat, point.lng))
    })
    mapInstance.fitBounds(bounds, { padding: 100 })
  }

  // Fit bounds when selected delivery changes
  useEffect(() => {
    if (selectedDelivery && map && selectedDelivery.lat && selectedDelivery.lng) {
      map.setZoom(15)
      map.panTo({
        lat: selectedDelivery.lat,
        lng: selectedDelivery.lng
      })
    }
  }, [selectedDelivery, map])

  // Directions API: 配送元 → 配送先1 → 配送先2 → ... のルート計算
  useEffect(() => {
    if (!isLoaded) return

    const validDeliveries = deliveries.filter((d) => d.lat && d.lng)

    // まず前のルートをクリア
    setDirections(null)

    // 配送元がないか、配送先が0件ならルート消す
    if (!origin || !origin.lat || !origin.lng || validDeliveries.length === 0) {
      setRouteError(null)
      return
    }

    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new window.google.maps.DirectionsService()
    }

    const destination = validDeliveries[validDeliveries.length - 1]
    const waypoints = validDeliveries.slice(0, -1).map((d) => ({
      location: { lat: d.lat, lng: d.lng },
      stopover: true
    }))

    directionsServiceRef.current.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
        language: 'ja'
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result)
          setRouteKey((prev) => prev + 1)
          setRouteError(null)
          if (map) {
            const bounds = new window.google.maps.LatLngBounds()
            result.routes[0].legs.forEach((leg) => {
              bounds.extend(leg.start_location)
              bounds.extend(leg.end_location)
            })
            map.fitBounds(bounds, { padding: 80 })
          }
        } else {
          console.error('Directions API error:', status)
          setDirections(null)
          setRouteError('ルートの取得に失敗しました')
        }
      }
    )
  }, [isLoaded, origin, deliveries, map])

  const handleMarkerClick = (delivery) => {
    setInfoWindow(delivery.id)
    onMarkerClick?.(delivery)
  }

  const handleMapClick = (event) => {
    if (onMapClick) {
      onMapClick({
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      })
    }
  }

  if (!isLoaded) {
    return (
      <div className="map-loading">
        <p>地図を読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="map-wrapper">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={
          selectedDelivery && selectedDelivery.lat
            ? { lat: selectedDelivery.lat, lng: selectedDelivery.lng }
            : origin && origin.lat
            ? { lat: origin.lat, lng: origin.lng }
            : defaultCenter
        }
        zoom={12}
        onLoad={onMapLoad}
        onClick={handleMapClick}
        options={mapOptions}
      >
        {/* Directions route */}
        {directions && (
          <DirectionsRenderer
            key={`route-${routeKey}`}
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeWeight: 5
              }
            }}
          />
        )}

        {/* Origin marker */}
        {origin && origin.lat && origin.lng && (
          <Marker
            position={{ lat: origin.lat, lng: origin.lng }}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            title={`配送元: ${origin.address}`}
            zIndex={1000}
          >
            {infoWindow === 'origin' && (
              <InfoWindow onCloseClick={() => setInfoWindow(null)}>
                <div className="info-window">
                  <h3 className="info-title">配送元</h3>
                  <p className="info-address">{origin.address}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Delivery markers */}
        {deliveries
          .filter((d) => d.lat && d.lng)
          .map((delivery, index) => (
            <Marker
              key={delivery.id}
              position={{ lat: delivery.lat, lng: delivery.lng }}
              icon={{
                url: MARKER_COLORS[delivery.status] || MARKER_COLORS.pending,
                scaledSize: new window.google.maps.Size(32, 32)
              }}
              label={{
                text: String(index + 1),
                color: 'white',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
              onClick={() => handleMarkerClick(delivery)}
              title={delivery.name}
            >
              {infoWindow === delivery.id && (
                <InfoWindow
                  onCloseClick={() => setInfoWindow(null)}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -32)
                  }}
                >
                  <div className="info-window">
                    <h3 className="info-title">{delivery.name}</h3>
                    <p className="info-address">{delivery.address}</p>
                    <p className="info-status">
                      状態: <strong>{STATUS_LABELS[delivery.status]}</strong>
                    </p>
                    {delivery.note && <p className="info-note">{delivery.note}</p>}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
      </GoogleMap>

      {routeError && (
        <div className="route-error">
          {routeError}
        </div>
      )}

      {!origin && deliveries.length > 0 && (
        <div className="map-empty">
          <p>配送元を設定するとルートが表示されます</p>
        </div>
      )}

      {deliveries.length === 0 && (
        <div className="map-empty">
          <p>配達情報がありません。新規追加してください。</p>
        </div>
      )}
    </div>
  )
}

export default Map
