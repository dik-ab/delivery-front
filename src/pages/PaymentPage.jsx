import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { paymentsApi } from '../api/payments'
import './PaymentPage.css'

/**
 * Stripe.js を CDN からロードするヘルパー
 * @returns {Promise<Stripe>}
 */
function loadStripe() {
  return new Promise((resolve, reject) => {
    if (window.Stripe) {
      resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.onload = () => {
      if (window.Stripe) {
        resolve(window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''))
      } else {
        reject(new Error('Stripe.js の読み込みに失敗しました'))
      }
    }
    script.onerror = () => reject(new Error('Stripe.js の読み込みに失敗しました'))
    document.head.appendChild(script)
  })
}

function PaymentPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [payments, setPayments] = useState([])
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Stripe.js 関連
  const [stripeInstance, setStripeInstance] = useState(null)
  const [cardElement, setCardElement] = useState(null)
  const [clientSecret, setClientSecret] = useState(null)
  const [showCardForm, setShowCardForm] = useState(false)
  const cardRef = useRef(null)

  // Stripe.js 初期化
  useEffect(() => {
    loadStripe()
      .then((stripe) => setStripeInstance(stripe))
      .catch((err) => console.error('Stripe load error:', err))
  }, [])

  // Stripe Elements をマウント
  useEffect(() => {
    if (!stripeInstance || !showCardForm || !cardRef.current) return
    if (cardElement) return // 既にマウント済み

    const elements = stripeInstance.elements()
    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1f2937',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444',
        },
      },
      hidePostalCode: true, // 日本では郵便番号不要
    })
    card.mount(cardRef.current)
    setCardElement(card)

    return () => {
      card.destroy()
      setCardElement(null)
    }
  }, [stripeInstance, showCardForm])

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

  // Step 1: Payment Intent を作成して client_secret を取得
  const handleCreatePayment = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const amountNum = parseInt(amount)
    if (!amountNum || amountNum < 50) {
      setError('金額は50円以上で入力してください（Stripe最低額）')
      return
    }

    setCreating(true)
    try {
      const result = await paymentsApi.createPaymentIntent(parseInt(matchId), amountNum)
      setClientSecret(result.client_secret)
      setShowCardForm(true)
      setSuccess('決済インテントを作成しました。カード情報を入力してください。')
    } catch (err) {
      setError(err.message || '決済の作成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  // Step 2: カード情報を使って決済を確定（3Dセキュア自動対応）
  const handleConfirmCardPayment = async () => {
    if (!stripeInstance || !cardElement || !clientSecret) {
      setError('Stripe の初期化が完了していません')
      return
    }

    setError(null)
    setSuccess(null)
    setPaying(true)

    try {
      // confirmCardPayment は 3Dセキュアが必要な場合、
      // 自動的に認証ポップアップを表示してくれる
      const { error: stripeError, paymentIntent } =
        await stripeInstance.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        })

      if (stripeError) {
        // 3Dセキュア認証失敗やカード拒否など
        if (stripeError.type === 'card_error' || stripeError.type === 'validation_error') {
          setError(stripeError.message)
        } else {
          setError('決済処理中にエラーが発生しました: ' + stripeError.message)
        }
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess('決済が完了しました！')
        setShowCardForm(false)
        setClientSecret(null)
        setAmount('')
        fetchPayments() // 一覧を更新
      } else if (paymentIntent.status === 'requires_action') {
        // 通常は confirmCardPayment 内で自動処理されるが、念のため
        setError('追加の認証が必要です。ブラウザの認証画面に従ってください。')
      } else {
        setSuccess(`決済ステータス: ${paymentIntent.status}`)
      }
    } catch (err) {
      setError('決済処理中にエラーが発生しました')
    } finally {
      setPaying(false)
    }
  }

  // デモ用: 手動で決済確認（Webhook未設定時のフォールバック）
  const handleManualConfirm = async (paymentId) => {
    setError(null)
    try {
      await paymentsApi.confirmPayment(paymentId)
      setSuccess('決済を手動確認しました')
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

        <h1>決済</h1>
        <p className="payment-subtitle">マッチング ID: {matchId}</p>

        {error && <div className="payment-error">{error}</div>}
        {success && <div className="payment-success">{success}</div>}

        {/* Step 1: 金額入力 → Payment Intent 作成 */}
        {!showCardForm && (
          <section className="payment-section">
            <h2>決済を開始</h2>
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
                    min="50"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-create-payment"
                  disabled={creating}
                >
                  {creating ? '処理中...' : 'カード入力へ進む'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Step 2: Stripe Elements カード入力フォーム */}
        {showCardForm && (
          <section className="payment-section">
            <h2>カード情報を入力</h2>
            <p className="payment-amount-display">
              お支払い金額: <strong>¥{parseInt(amount).toLocaleString()}</strong>
            </p>

            <div className="stripe-card-wrapper">
              <div ref={cardRef} className="stripe-card-element" />
            </div>

            <p className="card-form-note">
              ※ 3Dセキュア認証が必要な場合は、カード会社の認証画面が自動で表示されます
            </p>

            <div className="card-form-actions">
              <button
                type="button"
                className="btn-cancel-card"
                onClick={() => {
                  setShowCardForm(false)
                  setClientSecret(null)
                }}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="btn-pay"
                onClick={handleConfirmCardPayment}
                disabled={paying || !stripeInstance}
              >
                {paying ? '決済処理中...' : `¥${parseInt(amount).toLocaleString()} を支払う`}
              </button>
            </div>
          </section>
        )}

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
                        onClick={() => handleManualConfirm(payment.id)}
                      >
                        手動確認（Webhook未設定時）
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

        {/* Stripe 連携情報 */}
        <section className="payment-section">
          <div className="payment-info-box">
            <h3>決済フローについて</h3>
            <p>この画面は Stripe.js + Payment Intent API で実装されています。</p>
            <ul>
              <li>カード情報はStripe.jsが直接Stripeサーバーに送信（PCI DSS準拠）</li>
              <li>3Dセキュア認証はStripe.jsが自動的に処理</li>
              <li>決済完了はStripe Webhook（POST /api/v1/webhook/stripe）で自動通知</li>
              <li>Webhook未設定時は「手動確認」ボタンで代替可能</li>
            </ul>
            <p className="env-note">
              環境変数: VITE_STRIPE_PUBLISHABLE_KEY（フロント）、STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET（バックエンド）
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PaymentPage
