import React, { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Wallet, ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import api from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-logo"><Wallet size={20} color="#000" strokeWidth={2.5} /></div>
            <span className="auth-logo-text">FinFlow</span>
          </div>
          <div className="auth-hero">
            <h1>Invalid Reset Link</h1>
            <p>The password reset link is invalid or has expired.</p>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, background: 'var(--accent-red-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertCircle size={28} color="var(--accent-red)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 10 }}>Invalid Reset Link</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
                The password reset link is missing or has expired. Please request a new one.
              </p>
              <Link to="/forgot-password" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Request New Link
              </Link>
            </div>
          </div>
        </div>

        <style>{`
          .auth-page { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; background:var(--bg-primary); }
          .auth-left { background: linear-gradient(135deg, #0d1f15 0%, #091810 100%); padding:48px; display:flex; flex-direction:column; justify-content:space-between; border-right:1px solid var(--border); position:relative; overflow:hidden; }
          .auth-left::before { content:''; position:absolute; top:-100px; right:-100px; width:400px; height:400px; background:radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 70%); pointer-events:none; }
          .auth-brand { display:flex; align-items:center; gap:10px; }
          .auth-logo { width:36px; height:36px; background:var(--accent-green); border-radius:10px; display:flex; align-items:center; justify-content:center; }
          .auth-logo-text { font-family:var(--font-display); font-size:1.3rem; font-weight:800; color:var(--text-primary); }
          .auth-hero { flex:1; display:flex; flex-direction:column; justify-content:center; }
          .auth-hero h1 { font-size:2.6rem; font-weight:800; line-height:1.1; letter-spacing:-0.03em; margin-bottom:16px; color:var(--text-primary); }
          .auth-hero p { font-size:1rem; color:var(--text-secondary); line-height:1.6; max-width:380px; }
          .auth-right { display:flex; align-items:center; justify-content:center; padding:48px 40px; }
          .auth-card { width:100%; max-width:400px; }
          @media(max-width:768px) { .auth-page { grid-template-columns:1fr; } .auth-left { display:none; } }
        `}</style>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo"><Wallet size={20} color="#000" strokeWidth={2.5} /></div>
          <span className="auth-logo-text">FinFlow</span>
        </div>
        <div className="auth-hero">
          <h1>Create a new <span className="hero-accent">password.</span></h1>
          <p>Set a strong password to secure your account.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 28, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to sign in
          </Link>

          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, background: 'var(--accent-green-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={28} color="var(--accent-green)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 10 }}>Password reset successful</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Sign in
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Reset password</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter your new password below.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={{ paddingLeft: 36, paddingRight: 36 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      style={{ paddingLeft: 36, paddingRight: 36 }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{ color: 'var(--accent-red)', fontSize: '0.82rem', background: 'var(--accent-red-dim)', padding: '8px 12px', borderRadius: 8 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px', justifyContent: 'center', fontSize: '0.95rem' }}
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        .auth-page { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; background:var(--bg-primary); }
        .auth-left { background: linear-gradient(135deg, #0d1f15 0%, #091810 100%); padding:48px; display:flex; flex-direction:column; justify-content:space-between; border-right:1px solid var(--border); position:relative; overflow:hidden; }
        .auth-left::before { content:''; position:absolute; top:-100px; right:-100px; width:400px; height:400px; background:radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 70%); pointer-events:none; }
        .auth-brand { display:flex; align-items:center; gap:10px; }
        .auth-logo { width:36px; height:36px; background:var(--accent-green); border-radius:10px; display:flex; align-items:center; justify-content:center; }
        .auth-logo-text { font-family:var(--font-display); font-size:1.3rem; font-weight:800; color:var(--text-primary); }
        .auth-hero { flex:1; display:flex; flex-direction:column; justify-content:center; }
        .auth-hero h1 { font-size:2.6rem; font-weight:800; line-height:1.1; letter-spacing:-0.03em; margin-bottom:16px; color:var(--text-primary); }
        .hero-accent { color:var(--accent-green); }
        .auth-hero p { font-size:1rem; color:var(--text-secondary); line-height:1.6; max-width:380px; }
        .auth-right { display:flex; align-items:center; justify-content:center; padding:48px 40px; }
        .auth-card { width:100%; max-width:400px; }
        @media(max-width:768px) { .auth-page { grid-template-columns:1fr; } .auth-left { display:none; } }
      `}</style>
    </div>
  )
}
