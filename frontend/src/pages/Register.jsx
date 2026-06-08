import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Wallet, Eye, EyeOff, ArrowRight, Check } from 'lucide-react'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordChecks = [
    { label: 'At least 8 characters', ok: form.password.length >= 8 },
    { label: 'Contains number', ok: /\d/.test(form.password) },
    { label: 'Passwords match', ok: form.password && form.password === form.confirm },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    // Simulate server-side registration
    await new Promise(r => setTimeout(r, 900))
    const token = `local-${Date.now()}`
    login({ id: Date.now(), name: form.name, email: form.email, currency: '₹', monthlyBudget: 50000 }, token)
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo"><Wallet size={20} color="#000" strokeWidth={2.5} /></div>
          <span className="auth-logo-text">FinFlow</span>
        </div>
        <div className="auth-hero">
          <h1>Start your financial journey <span className="hero-accent">today.</span></h1>
          <p>Join thousands of users who use FinFlow to build better money habits and achieve financial freedom.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { num: '10K+', label: 'Active Users' },
            { num: '₹5Cr+', label: 'Tracked Monthly' },
            { num: '4.9★', label: 'User Rating' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-green)', fontSize: '1.1rem' }}>{s.num}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 6 }}>Create account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Abhivansh Singh"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} className="form-input" placeholder="Min. 8 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: 40 }} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Repeat password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>

            {/* Password checks */}
            {form.password && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {passwordChecks.map(check => (
                  <div key={check.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: check.ok ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    <Check size={12} />
                    {check.label}
                  </div>
                ))}
              </div>
            )}

            {error && <div style={{ color: 'var(--accent-red)', fontSize: '0.82rem', background: 'var(--accent-red-dim)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', justifyContent: 'center', fontSize: '0.95rem', marginTop: 6 }} disabled={loading}>
              {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={15} /></>}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              By registering, you agree to our <a href="#" style={{ color: 'var(--accent-green)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent-green)' }}>Privacy Policy</a>
            </p>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 20 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Sign in</Link>
          </p>
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
        .auth-hero h1 { font-size:2.4rem; font-weight:800; line-height:1.1; letter-spacing:-0.03em; margin-bottom:16px; color:var(--text-primary); }
        .hero-accent { color:var(--accent-green); }
        .auth-hero p { font-size:0.95rem; color:var(--text-secondary); line-height:1.6; max-width:380px; margin-bottom: 24px; }
        .auth-right { display:flex; align-items:center; justify-content:center; padding:48px 40px; }
        .auth-card { width:100%; max-width:400px; }
        @media(max-width:768px) { .auth-page { grid-template-columns:1fr; } .auth-left { display:none; } }
      `}</style>
    </div>
  )
}
