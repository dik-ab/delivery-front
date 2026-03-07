import { useNavigate } from 'react-router-dom'
import { useMatches } from '../hooks/useMatches'
import { useAuth } from '../hooks/useAuth'
import MatchCard from '../components/MatchCard'
import './MyMatchesPage.css'

function MyMatchesPage() {
  const { matches, approveMatch, rejectMatch, completeMatch } = useMatches()
  const { user } = useAuth()
  const navigate = useNavigate()

  const isTransportCompany = user?.role === 'transport_company' || user?.role === 'driver'

  const myMatches = matches.filter(
    (m) =>
      (isTransportCompany && m.driver_id === user?.id) ||
      (user?.role === 'shipper' && m.shipper_id === user?.id)
  )

  const handleApprove = async (matchId) => {
    try {
      await approveMatch(matchId)
      alert('マッチングを承認しました')
    } catch (err) {
      alert(err.message || 'エラーが発生しました')
    }
  }

  const handleReject = async (matchId) => {
    try {
      await rejectMatch(matchId)
      alert('マッチングを拒否しました')
    } catch (err) {
      alert(err.message || 'エラーが発生しました')
    }
  }

  const handleComplete = async (matchId) => {
    try {
      await completeMatch(matchId)
      alert('マッチングを完了しました')
    } catch (err) {
      alert(err.message || 'エラーが発生しました')
    }
  }

  return (
    <div className="my-matches-page">
      <div className="my-matches-container">
        <h1>
          {isTransportCompany
            ? 'マッチングリクエスト'
            : 'マイリクエスト'}
        </h1>

        {myMatches.length > 0 ? (
          <div className="matches-list">
            {myMatches.map((match) => (
              <div key={match.id} className="match-wrapper">
                <MatchCard
                  match={match}
                  onApprove={() => handleApprove(match.id)}
                  onReject={() => handleReject(match.id)}
                  onComplete={() => handleComplete(match.id)}
                  showActions={
                    isTransportCompany &&
                    (match.status === 'pending' || match.status === 'approved')
                  }
                />
                {match.status === 'approved' && (
                  <button
                    className="btn-payment"
                    onClick={() => navigate(`/payment/${match.id}`)}
                  >
                    決済へ進む
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {isTransportCompany
                ? 'マッチングリクエストがありません'
                : 'マッチングリクエストを送信していません'}
            </p>
            {user?.role === 'shipper' && (
              <button
                className="btn-primary-outline"
                onClick={() => navigate('/trips/search')}
              >
                便を探す
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyMatchesPage
