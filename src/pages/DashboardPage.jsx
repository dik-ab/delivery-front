import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTrips } from '../hooks/useTrips'
import { useMatches } from '../hooks/useMatches'
import StatsCard from '../components/StatsCard'
import TripCard from '../components/TripCard'
import MatchCard from '../components/MatchCard'
import './DashboardPage.css'

function DashboardPage() {
  const { user } = useAuth()
  const { trips } = useTrips()
  const { matches } = useMatches()
  const navigate = useNavigate()

  const isTransportCompany = user?.role === 'transport_company' || user?.role === 'driver'

  const myTrips = trips.filter((t) => t.driver_id === user?.id)
  const myMatches = matches.filter(
    (m) =>
      (isTransportCompany && m.trip?.driver_id === user?.id) ||
      (user?.role === 'shipper' && m.shipper_id === user?.id)
  )

  const pendingMatches = myMatches.filter((m) => m.status === 'pending')
  const activeTrips = myTrips.filter(
    (t) => t.status === 'open' || t.status === 'matched' || t.status === 'in_transit'
  )

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>ダッシュボード</h1>
          <p className="dashboard-greeting">
            {isTransportCompany ? '運送会社' : '荷主'}様、お疲れ様です！
          </p>
        </div>

        {/* Stats Section */}
        <div className="stats-grid">
          {isTransportCompany ? (
            <>
              <StatsCard
                icon="📋"
                label="登録済み便数"
                value={myTrips.length}
                color="blue"
              />
              <StatsCard
                icon="🚗"
                label="アクティブ便"
                value={activeTrips.length}
                color="green"
              />
              <StatsCard
                icon="📝"
                label="マッチング待機"
                value={pendingMatches.length}
                color="yellow"
              />
              <StatsCard
                icon="✅"
                label="マッチング済み"
                value={myMatches.filter((m) => m.status === 'approved').length}
                color="purple"
              />
            </>
          ) : (
            <>
              <StatsCard
                icon="📝"
                label="マッチングリクエスト"
                value={myMatches.length}
                color="blue"
              />
              <StatsCard
                icon="⏳"
                label="待機中"
                value={pendingMatches.length}
                color="yellow"
              />
              <StatsCard
                icon="✅"
                label="承認済み"
                value={myMatches.filter((m) => m.status === 'approved').length}
                color="green"
              />
              <StatsCard
                icon="🔍"
                label="便を探す"
                value="→"
                color="purple"
              />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {isTransportCompany ? (
            <>
              {/* Active Trips */}
              <section className="dashboard-section">
                <div className="section-header">
                  <h2>アクティブ便</h2>
                  <button
                    className="btn-secondary"
                    onClick={() => navigate('/trips/new')}
                  >
                    新しい便を登録
                  </button>
                </div>
                {activeTrips.length > 0 ? (
                  <div className="trips-list">
                    {activeTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>アクティブな便がありません</p>
                    <button
                      className="btn-primary-outline"
                      onClick={() => navigate('/trips/new')}
                    >
                      今すぐ便を登録
                    </button>
                  </div>
                )}
              </section>

              {/* Pending Matches */}
              {pendingMatches.length > 0 && (
                <section className="dashboard-section">
                  <div className="section-header">
                    <h2>マッチング待機中 ({pendingMatches.length})</h2>
                    <button
                      className="btn-secondary"
                      onClick={() => navigate('/my-matches')}
                    >
                      マッチング管理へ
                    </button>
                  </div>
                  <div className="matches-list">
                    {pendingMatches.map((match) => (
                      <MatchCard key={match.id} match={match} showActions={false} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              {/* Call to Action */}
              <section className="dashboard-section cta-section">
                <div className="cta-content">
                  <h2>便を探す</h2>
                  <p>
                    全国のドライバーが登録している帰り便から、あなたの荷物にぴったりな便を探してマッチングしましょう。
                  </p>
                  <button
                    className="btn-primary-large"
                    onClick={() => navigate('/trips/search')}
                  >
                    便を探す →
                  </button>
                </div>
                <div className="cta-icon">🔍</div>
              </section>

              {/* Recent Requests */}
              {myMatches.length > 0 && (
                <section className="dashboard-section">
                  <div className="section-header">
                    <h2>マッチングリクエスト ({myMatches.length})</h2>
                  </div>
                  <div className="matches-list">
                    {myMatches.slice(0, 5).map((match) => (
                      <MatchCard key={match.id} match={match} showActions={false} />
                    ))}
                  </div>
                  {myMatches.length > 5 && (
                    <button
                      className="btn-secondary"
                      onClick={() => navigate('/my-matches')}
                    >
                      すべて表示
                    </button>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
