import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { authService, getAuthPayload, getGoogleAuthUrl } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    const oauthError = params.get('error')

    if (token) {
      const userId = params.get('userId')
      const user = {
        id: userId ? Number(userId) : null,
        name: params.get('name') || '',
        email: params.get('email') || '',
      }

      login(user, token)
      navigate('/dashboard', { replace: true })
      return
    }

    if (oauthError) {
      setError(oauthError)
      navigate('/login', { replace: true })
    }
  }, [location.search, login, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await authService.login({ email: form.email, password: form.password })
      const { token, user } = getAuthPayload(response)

      if (!token || !user) {
        throw new Error('Invalid login response from server')
      }

      login(user, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.assign(getGoogleAuthUrl())
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo"><Wallet size={20} color="#000" strokeWidth={2.5} /></div>
          <span className="auth-logo-text">FinFlow</span>
        </div>
        <div className="auth-hero">
          <h1>Take control of your <span className="hero-accent">finances.</span></h1>
          <p>Track income, manage expenses, set budgets, and get powerful insights — all in one place.</p>
        </div>
        <div className="auth-features">
          {['📊 Real-time analytics & reports', '🎯 Smart budget management', '🔐 Bank-grade security', '📱 Works on all devices'].map(f => (
            <div key={f} className="auth-feature">{f}</div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Welcome back</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to your FinFlow account</p>
          </div>

          {/* Removed demo credentials hint — use real credentials or register */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: 16 }}
          >
            <span style={{ display: 'inline-flex', width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#fff', color: '#111', fontWeight: 800, fontSize: '0.8rem' }}>G</span>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>


          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 40 }} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6 }}>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                Forgot password?
              </Link>
            </div>

            {error && <div style={{ color: 'var(--accent-red)', fontSize: '0.82rem', background: 'var(--accent-red-dim)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', justifyContent: 'center', fontSize: '0.95rem', marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 20 }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--bg-primary);
        }
        .auth-left {
          background: linear-gradient(135deg, #0d1f15 0%, #091810 100%);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(0,200,150,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-brand {
          display: flex; align-items: center; gap: 10px;
        }
        .auth-logo {
          width: 36px; height: 36px;
          background: var(--accent-green);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .auth-logo-text {
          font-family: var(--font-display);
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .auth-hero {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .auth-hero h1 {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
          color: var(--text-primary);
        }
        .hero-accent { color: var(--accent-green); }
        .auth-hero p {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 380px;
        }
        .auth-features {
          display: flex; flex-direction: column; gap: 10px;
        }
        .auth-feature {
          font-size: 0.85rem;
          color: var(--text-secondary);
          padding: 10px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 10px;
        }
        .auth-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        .auth-card {
          width: 100%;
          max-width: 400px;
        }
        @media(max-width: 768px) {
          .auth-page { grid-template-columns: 1fr; }
          .auth-left { display: none; }
        }
      `}</style>
    </div>
  )
}
