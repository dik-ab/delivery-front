import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import { useAuth } from '../hooks/useAuth'
import TripCard from '../components/TripCard'
import './MyTripsPage.css'

function MyTripsPage() {
  const { trips } = useTrips()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('all')

  const myTrips = trips.filter((t) => t.driver_id === user?.id)

  const filteredTrips =
    statusFilter === 'all'
      ? myTrips
      : myTrips.filter((t) => t.status === statusFilter)

  const statusOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'open', label: '募集中' },
    { value: 'matched', label: 'マッチ済み' },
    { value: 'in_transit', label: '輸送中' },
    { value: 'completed', label: '完了' },
    { value: 'cancelled', label: 'キャンセル' }
  ]

  return (
    <div className="my-trips-page">
      <div className="my-trips-container">
        <div className="page-header">
          <h1>マイ便</h1>
          <button
            className="btn-primary"
            onClick={() => navigate('/trips/new')}
          >
            新しい便を登録
          </button>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="status-filter">ステータス:</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-count">
            {filteredTrips.length} 件
          </div>
        </div>

        {filteredTrips.length > 0 ? (
          <div className="trips-list">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onClick={() => navigate(`/trips/${trip.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {statusFilter === 'all'
                ? 'まだ便を登録していません'
                : `${statusOptions.find((o) => o.value === statusFilter)?.label}の便がありません`}
            </p>
            <button
              className="btn-primary-outline"
              onClick={() => navigate('/trips/new')}
            >
              今すぐ便を登録
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTripsPage
