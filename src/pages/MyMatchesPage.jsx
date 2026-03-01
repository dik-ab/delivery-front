import { useNavigate } from 'react-router-dom'
import { useMatches } from '../hooks/useMatches'
import { useAuth } from '../hooks/useAuth'
import MatchCard from '../components/MatchCard'
import './MyMatchesPage.css'

function MyMatchesPage() {
  const { matches, approveMatch, rejectMatch, completeMatch } = useMatches()
  const { user } = useAuth()
  const navigate = useNavigate()

  const myMatches = matches.filter(
    (m) =>
      (user?.role === 'driver' && m.driver_id === user?.id) ||
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
          {user?.role === 'driver'
            ? 'マッチングリクエスト'
            : 'マイリクエスト'}
        </h1>

        {myMatches.length > 0 ? (
          <div className="matches-list">
            {myMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onApprove={() => handleApprove(match.id)}
                onReject={() => handleReject(match.id)}
                onComplete={() => handleComplete(match.id)}
                showActions={
                  user?.role === 'driver' &&
                  (match.status === 'pending' || match.status === 'approved')
                }
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>
              {user?.role === 'driver'
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
