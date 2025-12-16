import React, { useState } from 'react'
import axios from 'axios'
import { X, Mail, Lock, Key } from 'lucide-react'
import './Auth.css'

function ForgotPassword({ onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Vui lòng nhập email')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/auth/forgot-password', { email })
      setMessage(response.data.message)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi mã thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!code || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/auth/reset-password', {
        email,
        code,
        new_password: newPassword
      })
      setMessage(response.data.message)
      setTimeout(() => {
        onSwitchToLogin()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Đặt lại mật khẩu thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={onClose || undefined}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h2>Quên mật khẩu</h2>
          {onClose && (
            <button className="auth-close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleSendCode} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            
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
            
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}
            
            <div className="auth-input-group">
              <Key size={18} />
              <input
                type="text"
                placeholder="Mã xác nhận (6 số)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            
            <div className="auth-input-group">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="auth-input-group">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}
        
        <div className="auth-footer">
          <button className="auth-link" onClick={onSwitchToLogin}>
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword

