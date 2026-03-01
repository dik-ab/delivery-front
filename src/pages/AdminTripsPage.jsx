import { useState, useEffect } from 'react'
import adminApi from '../api/admin'
import './AdminTripsPage.css'

function AdminTripsPage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await adminApi.getTrips()
        setTrips(response.data || response || [])
      } catch (err) {
        setError(err.message || '便の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  const filteredTrips =
    statusFilter === 'all'
      ? trips
      : trips.filter((t) => t.status === statusFilter)

  const getStatusLabel = (status) => {
    const labels = {
      open: '募集中',
      matched: 'マッチ済み',
      in_transit: '輸送中',
      completed: '完了',
      cancelled: 'キャンセル'
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      open: '#3b82f6',
      matched: '#eab308',
      in_transit: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  if (loading) {
    return (
      <div className="admin-trips-page">
        <div className="loading">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-trips-page">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-trips-page">
      <div className="admin-container">
        <h1>便管理</h1>

        <div className="filter-section">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">すべてのステータス</option>
            <option value="open">募集中</option>
            <option value="matched">マッチ済み</option>
            <option value="in_transit">輸送中</option>
            <option value="completed">完了</option>
            <option value="cancelled">キャンセル</option>
          </select>
          <span className="filter-count">{filteredTrips.length} 件</span>
        </div>

        <div className="trips-table-wrapper">
          <table className="trips-table">
            <thead>
              <tr>
                <th>便ID</th>
                <th>ルート</th>
                <th>ドライバー</th>
                <th>出発日時</th>
                <th>車両</th>
                <th>積載量</th>
                <th>料金</th>
                <th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>#{trip.id}</td>
                  <td className="trip-route">
                    {trip.origin} → {trip.destination}
                  </td>
                  <td>
                    <div>
                      <div className="driver-name">{trip.driver?.name || '-'}</div>
                      {trip.driver?.company && (
                        <div className="driver-company">{trip.driver.company}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    {trip.departure_time
                      ? new Date(trip.departure_time).toLocaleString('ja-JP')
                      : '-'}
                  </td>
                  <td>{trip.vehicle_type || '-'}</td>
                  <td>{trip.available_weight}kg</td>
                  <td>¥{trip.price?.toLocaleString()}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(trip.status) }}
                    >
                      {getStatusLabel(trip.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTrips.length === 0 && (
          <div className="empty-state">
            <p>便がありません</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTripsPage
