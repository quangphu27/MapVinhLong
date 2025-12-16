import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from '../config'
import { User, LogOut, Settings, X } from 'lucide-react'
import Login from './Auth/Login'
import Register from './Auth/Register'
import ForgotPassword from './Auth/ForgotPassword'
import Profile from './Auth/Profile'
import './UserMenu.css'

function UserMenu({ user, onLogout, onLoginSuccess, autoShowLogin = false }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showLogin, setShowLogin] = useState(autoShowLogin)
  const [showRegister, setShowRegister] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (autoShowLogin && !user) {
      setShowLogin(true)
    }
  }, [autoShowLogin, user])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (error) {
      }
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
    setShowMenu(false)
  }

  const handleLoginSuccess = (userData) => {
    onLoginSuccess(userData)
    setShowLogin(false)
  }

  const handleRegisterSuccess = () => {
    setShowRegister(false)
    setShowLogin(true)
  }

  if (!user) {
    return (
      <>
        <div className="user-menu-container">
          <button className="user-menu-btn" onClick={() => setShowLogin(true)}>
            <User size={20} />
            <span>Đăng nhập</span>
          </button>
        </div>

        {showLogin && (
          <Login
            onClose={autoShowLogin ? undefined : () => setShowLogin(false)}
            onSwitchToRegister={() => {
              setShowLogin(false)
              setShowRegister(true)
            }}
            onSwitchToForgot={() => {
              setShowLogin(false)
              setShowForgot(true)
            }}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {showRegister && (
          <Register
            onClose={() => setShowRegister(false)}
            onSwitchToLogin={() => {
              setShowRegister(false)
              setShowLogin(true)
            }}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {showForgot && (
          <ForgotPassword
            onClose={() => setShowForgot(false)}
            onSwitchToLogin={() => {
              setShowForgot(false)
              setShowLogin(true)
            }}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="user-menu-container" ref={menuRef}>
        <button className="user-menu-btn" onClick={() => setShowMenu(!showMenu)}>
          <div className="user-avatar">
            {user.ten ? user.ten.charAt(0).toUpperCase() : 'U'}
          </div>
          <span>{user.ten || 'User'}</span>
        </button>

        {showMenu && (
          <div className="user-dropdown">
            <div className="user-info">
              <div className="user-name">{user.ten}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <div className="user-menu-divider"></div>
            <button className="user-menu-item" onClick={() => {
              setShowProfile(true)
              setShowMenu(false)
            }}>
              <Settings size={18} />
              <span>Thông tin cá nhân</span>
            </button>
            <button className="user-menu-item" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>

      {showProfile && (
        <Profile
          onClose={() => setShowProfile(false)}
          user={user}
          onUpdateSuccess={() => {
            const token = localStorage.getItem('token')
            if (token) {
              fetch(`${API_BASE_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
              })
                .then(res => res.json())
                .then(data => {
                  if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user))
                    onLoginSuccess(data.user)
                  }
                })
            }
          }}
        />
      )}
    </>
  )
}

export default UserMenu

