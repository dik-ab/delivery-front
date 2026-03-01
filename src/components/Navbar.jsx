import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Navbar.css'

function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMobileMenuOpen(false)
  }

  const getRoleLabel = (role) => {
    const labels = {
      driver: 'ドライバー',
      shipper: '荷主',
      admin: '管理者'
    }
    return labels[role] || role
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">🚚</span>
          帰り便シェア
        </Link>

        <button
          className={`navbar-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link
              to="/dashboard"
              className="navbar-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              ダッシュボード
            </Link>
          </li>

          {user?.role === 'driver' && (
            <>
              <li className="navbar-item">
                <Link
                  to="/trips/new"
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  便を登録
                </Link>
              </li>
              <li className="navbar-item">
                <Link
                  to="/my-trips"
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  マイ便
                </Link>
              </li>
            </>
          )}

          {user?.role === 'shipper' && (
            <>
              <li className="navbar-item">
                <Link
                  to="/trips/search"
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  便を探す
                </Link>
              </li>
              <li className="navbar-item">
                <Link
                  to="/my-matches"
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  マイリクエスト
                </Link>
              </li>
            </>
          )}

          {isAdmin && (
            <>
              <li className="navbar-item">
                <Link
                  to="/admin"
                  className="navbar-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  管理パネル
                </Link>
              </li>
            </>
          )}

          <li className="navbar-item navbar-divider">
            <div className="user-info">
              {user && (
                <>
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{getRoleLabel(user.role)}</span>
                </>
              )}
            </div>
          </li>

          <li className="navbar-item">
            <button className="navbar-logout" onClick={handleLogout}>
              ログアウト
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
