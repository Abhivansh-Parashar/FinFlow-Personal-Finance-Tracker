import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      // Always show success to avoid user enumeration (even on 404)
      // Only show error on network / server failure
      if (err.response?.status === 500 || !err.response) {
        setError('Something went wrong. Please try again later.')
      } else {
        setSent(true)
      }
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
          <h1>Reset your <span className="hero-accent">password.</span></h1>
          <p>Enter your email and we'll send you a link to get back into your account.</p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 28, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to sign in
          </Link>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 56, height: 56, background: 'var(--accent-green-dim)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={28} color="var(--accent-green)" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 10 }}>Check your email</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 24 }}>
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly. Check your spam folder if you don't see it.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Forgot password?</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No worries, we'll send you reset instructions.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ paddingLeft: 36 }}
                      required
                    />
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
