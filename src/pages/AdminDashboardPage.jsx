import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import adminApi from '../api/admin'
import StatsCard from '../components/StatsCard'
import TripCard from '../components/TripCard'
import './AdminDashboardPage.css'

function AdminDashboardPage() {
  const [stats, setStats] = useState(null)
  const [trips, setTrips] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tripsRes, matchesRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getTrips(),
          adminApi.getMatches()
        ])

        setStats(statsRes.data || statsRes)
        setTrips((tripsRes.data || tripsRes).slice(0, 5))
        setMatches((matchesRes.data || matchesRes).slice(0, 5))
      } catch (err) {
        setError(err.message || 'データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="loading">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard-page">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>管理パネル</h1>
          <p>プラットフォーム統計</p>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="stats-grid">
            <StatsCard
              icon="👥"
              label="総ユーザー数"
              value={stats.total_users || 0}
              color="blue"
            />
            <StatsCard
              icon="🚚"
              label="総便数"
              value={stats.total_trips || 0}
              color="green"
            />
            <StatsCard
              icon="📋"
              label="総マッチング数"
              value={stats.total_matches || 0}
              color="yellow"
            />
            <StatsCard
              icon="🚗"
              label="アクティブ便"
              value={stats.active_trips || 0}
              color="purple"
            />
            <StatsCard
              icon="⏳"
              label="待機中マッチング"
              value={stats.pending_matches || 0}
              color="red"
            />
            <StatsCard
              icon="✅"
              label="完了マッチング"
              value={stats.completed_matches || 0}
              color="green"
            />
          </div>
        )}

        {/* Management Links */}
        <div className="management-section">
          <h2>管理</h2>
          <div className="management-links">
            <Link to="/admin/users" className="management-link">
              <span className="link-icon">👥</span>
              <span className="link-text">ユーザー管理</span>
              <span className="link-arrow">→</span>
            </Link>
            <Link to="/admin/trips" className="management-link">
              <span className="link-icon">🚚</span>
              <span className="link-text">便管理</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* Recent Trips */}
        {trips.length > 0 && (
          <div className="recent-section">
            <div className="section-header">
              <h2>最近の便</h2>
              <Link to="/admin/trips" className="view-all-link">
                すべて表示
              </Link>
            </div>
            <div className="items-list">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Matches */}
        {matches.length > 0 && (
          <div className="recent-section">
            <div className="section-header">
              <h2>最近のマッチング</h2>
            </div>
            <div className="matches-table">
              <table>
                <thead>
                  <tr>
                    <th>便ID</th>
                    <th>ルート</th>
                    <th>ステータス</th>
                    <th>作成日</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id}>
                      <td>#{match.id}</td>
                      <td>
                        {match.trip?.origin} → {match.trip?.destination}
                      </td>
                      <td>
                        <span className={`status-badge status-${match.status}`}>
                          {getStatusLabel(match.status)}
                        </span>
                      </td>
                      <td>
                        {match.created_at
                          ? new Date(match.created_at).toLocaleDateString('ja-JP')
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusLabel(status) {
  const labels = {
    pending: '待機中',
    approved: '承認済み',
    rejected: '拒否',
    completed: '完了'
  }
  return labels[status] || status
}

export default AdminDashboardPage
