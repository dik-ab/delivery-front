import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './AuthPages.css'

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'driver',
    company: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)

    try {
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.company,
        formData.phone
      )
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">帰り便シェア</h1>
          <p className="auth-subtitle">ドライバーと荷主をマッチングするプラットフォーム</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>新規登録</h2>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">名前</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="山田太郎"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">役割</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="driver">ドライバー</option>
              <option value="shipper">荷主</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="company">会社名 (任意)</label>
            <input
              id="company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="会社名を入力"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">電話番号 (任意)</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="090-1234-5678"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">パスワード確認</label>
            <input
              id="passwordConfirm"
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '登録中...' : '登録'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            既にアカウントを持っている場合は <Link to="/login">こちら</Link> からログインしてください
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
