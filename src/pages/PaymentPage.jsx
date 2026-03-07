import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { paymentsApi } from '../api/payments'
import './PaymentPage.css'

function PaymentPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await paymentsApi.getPaymentsByMatch(matchId)
      setPayments(Array.isArray(data) ? data : data.data || [])
    } catch (err) {
      setError('決済情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [matchId])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleCreatePayment = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const amountNum = parseInt(amount)
    if (!amountNum || amountNum <= 0) {
      setError('金額を正しく入力してください')
      return
    }

    setCreating(true)
    try {
      const result = await paymentsApi.createPaymentIntent(parseInt(matchId), amountNum)
      setSuccess(`決済インテント作成完了 (ID: ${result.payment?.stripe_payment_id || result.stripe_payment_id || 'N/A'})`)
      setAmount('')
      fetchPayments()
    } catch (err) {
      setError(err.message || '決済の作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const handleConfirmPayment = async (paymentId) => {
    setError(null)
    try {
      await paymentsApi.confirmPayment(paymentId)
      setSuccess('決済を確認しました')
      fetchPayments()
    } catch (err) {
      setError(err.message || '決済確認に失敗しました')
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: '未決済',
      succeeded: '決済完了',
      failed: '失敗',
      refunded: '返金済み',
    }
    return labels[status] || status
  }

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      succeeded: 'status-succeeded',
      failed: 'status-failed',
      refunded: 'status-refunded',
    }
    return classes[status] || ''
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← 戻る
        </button>

        <h1>決済管理</h1>
        <p className="payment-subtitle">マッチング ID: {matchId}</p>

        {error && <div className="payment-error">{error}</div>}
        {success && <div className="payment-success">{success}</div>}

        {/* 決済作成フォーム */}
        <section className="payment-section">
          <h2>新しい決済を作成</h2>
          <form className="payment-form" onSubmit={handleCreatePayment}>
            <div className="payment-form-row">
              <div className="form-group">
                <label htmlFor="amount">金額 (円)</label>
                <input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10000"
                  min="1"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-create-payment"
                disabled={creating}
              >
                {creating ? '処理中...' : '決済インテント作成'}
              </button>
            </div>
          </form>
          <p className="payment-note">
            ※ Stripe Payment Intentを作成します。本番環境ではStripe.jsのカード入力UIを使用してください。
          </p>
        </section>

        {/* 決済履歴 */}
        <section className="payment-section">
          <h2>決済履歴</h2>
          {loading ? (
            <p className="payment-loading">読み込み中...</p>
          ) : payments.length > 0 ? (
            <div className="payment-list">
              {payments.map((payment) => (
                <div key={payment.id} className="payment-card">
                  <div className="payment-card-header">
                    <span className="payment-amount">
                      ¥{payment.amount?.toLocaleString()}
                    </span>
                    <span className={`payment-status ${getStatusClass(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                  <div className="payment-card-body">
                    <div className="payment-detail">
                      <span className="payment-label">Stripe ID</span>
                      <span className="payment-value">
                        {payment.stripe_payment_id || '-'}
                      </span>
                    </div>
                    <div className="payment-detail">
                      <span className="payment-label">通貨</span>
                      <span className="payment-value">
                        {(payment.currency || 'jpy').toUpperCase()}
                      </span>
                    </div>
                    <div className="payment-detail">
                      <span className="payment-label">作成日時</span>
                      <span className="payment-value">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleString('ja-JP')
                          : '-'}
                      </span>
                    </div>
                  </div>
                  {payment.status === 'pending' && (
                    <div className="payment-card-actions">
                      <button
                        className="btn-confirm-payment"
                        onClick={() => handleConfirmPayment(payment.id)}
                      >
                        決済確認（デモ）
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="payment-empty">決済履歴はありません</p>
          )}
        </section>

        <section className="payment-section">
          <div className="payment-info-box">
            <h3>Stripe連携について</h3>
            <p>
              この画面は学習用のデモ実装です。本番環境では以下の実装が必要です：
            </p>
            <ul>
              <li>Stripe.js によるカード情報入力UI</li>
              <li>Stripe Webhook による決済ステータス自動更新</li>
              <li>3Dセキュア認証対応</li>
              <li>返金処理の実装</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PaymentPage
