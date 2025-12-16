import React, { useState } from 'react'
import axios from 'axios'
import { X, Mail, Lock } from 'lucide-react'
import './Auth.css'

function Login({ onClose, onSwitchToRegister, onSwitchToForgot, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        onLoginSuccess(response.data.user)
        onClose()
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose || undefined}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h2>Đăng nhập</h2>
          {onClose && (
            <button className="auth-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="auth-input-group">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="auth-input-group">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="auth-footer">
          <button className="auth-link" onClick={onSwitchToForgot}>
            Quên mật khẩu?
          </button>
          <span>Chưa có tài khoản? <button className="auth-link" onClick={onSwitchToRegister}>Đăng ký</button></span>
        </div>
      </div>
    </div>
  )
}

export default Login

