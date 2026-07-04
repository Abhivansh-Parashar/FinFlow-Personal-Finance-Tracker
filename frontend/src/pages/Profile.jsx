import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService, getApiPayload, getNotificationSettings, setNotificationSettings } from '../services/api'
import { Edit2, Save, Shield, LogOut, CheckCircle } from 'lucide-react'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saveOk, setSaveOk]     = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm] = useState({
    name:          user?.name          ?? '',
    email:         user?.email         ?? '',
    phone:         user?.phone         ?? '',
    currency:      user?.currency      ?? '₹',
    monthlyBudget: user?.monthlyBudget ?? '',
  })

  useEffect(() => {
    userService.getProfile().then(res => {
      const data = getApiPayload(res)
      if (data) {
        setUser(prev => ({ ...prev, ...data }))
        setForm({
          name:          data.name          ?? '',
          email:         data.email         ?? '',
          phone:         data.phone         ?? '',
          currency:      data.currency      ?? '₹',
          monthlyBudget: data.monthlyBudget ?? '',
        })
      }
    }).catch(err => console.error('Failed to fetch profile', err))
  }, [setUser])

  // Password change state
  const [pwForm, setPwForm]       = useState({ oldPassword: '', newPassword: '', confirm: '' })
  const [pwSaving, setPwSaving]   = useState(false)
  const [pwError, setPwError]     = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  // Notification toggles
  const [notifs, setNotifs] = useState(() => {
    const settings = getNotificationSettings()
    return [
      { key: 'budgetAlerts',      label: 'Budget Alerts',           desc: "Get notified when you're close to your budget limit", enabled: settings.budgetAlerts },
      { key: 'txnReminders',      label: 'Transaction Reminders',   desc: 'Show a notification whenever you add a transaction', enabled: settings.txnReminders },
      { key: 'monthlySummary',    label: 'Monthly Summary',         desc: 'Show a monthly summary update in the app', enabled: settings.monthlySummary },
      { key: 'largeTxnAlert',     label: 'Large Transaction Alert', desc: 'Alert for transactions above ₹10,000', enabled: settings.largeTxnAlert },
      { key: 'weeklyReport',      label: 'Weekly Report',           desc: 'Show weekly report updates in the app', enabled: settings.weeklyReport },
    ]
  })

  useEffect(() => {
    setNotificationSettings(notifs.reduce((acc, item) => {
      acc[item.key] = item.enabled
      return acc
    }, {}))
  }, [notifs])

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  // FIX: Save now calls the real API
  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      const res = await userService.updateProfile({
        name:          form.name,
        currency:      form.currency,
        monthlyBudget: form.monthlyBudget ? Number(form.monthlyBudget) : undefined,
      })
      const updated = getApiPayload(res)
      if (updated) setUser({ ...user, ...updated })
      else setUser({ ...user, name: form.name, currency: form.currency, monthlyBudget: form.monthlyBudget })
      setEditing(false)
      setSaveOk(true)
      setTimeout(() => setSaveOk(false), 3000)
    } catch (err) {
      setError('Failed to save changes. Check that the backend /users/me endpoint is implemented.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    setPwError('')
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError('New passwords do not match')
      return
    }
    try {
      setPwSaving(true)
      await userService.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
      setPwSuccess(true)
      setPwForm({ oldPassword: '', newPassword: '', confirm: '' })
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (err) {
      setPwError(err.response?.data?.message ?? 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  const toggleNotif = (key) => {
    setNotifs(prev => prev.map(n => n.key === key ? { ...n, enabled: !n.enabled } : n))
  }

  return (
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">Profile</div>
            <div className="page-subtitle">Manage your account and preferences</div>
          </div>
        </div>

        {saveOk && (
            <div style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', padding: '10px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} /> Profile saved successfully
            </div>
        )}
        {error && (
            <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '10px 16px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
          {/* Left panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ width: 80, height: 80, background: 'var(--accent-green-dim)', border: '3px solid rgba(0,200,150,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-green)', margin: '0 auto 16px' }}>
                {initials}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>{user?.email}</div>
              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>✓ Verified Account</span>
            </div>

            <div className="card" style={{ padding: '8px' }}>
              <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 10 }} onClick={logout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div>
            <div className="card fade-in" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>Personal Information</div>
                {editing
                    ? <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={handleSave} disabled={saving}>
                      <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    : <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => setEditing(true)}>
                      <Edit2 size={14} /> Edit
                    </button>
                }
              </div>

              <div className="grid-2" style={{ gap: 18 }}>
                {[
                  { label: 'Full Name',    key: 'name',   type: 'text',   placeholder: 'Your full name' },
                  { label: 'Email',        key: 'email',  type: 'email',  placeholder: 'your@email.com', disabled: true },
                  { label: 'Phone',        key: 'phone',  type: 'tel',    placeholder: '+91 xxxxx xxxxx' },
                  { label: 'Monthly Budget (₹)', key: 'monthlyBudget', type: 'number', placeholder: '50000' },
                ].map(field => (
                    <div key={field.key} className="form-group">
                      <label className="form-label">{field.label}</label>
                      <input type={field.type} className="form-input"
                             value={form[field.key] || ''}
                             onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                             disabled={!editing || field.disabled}
                             placeholder={field.placeholder}
                             style={{ opacity: (editing && !field.disabled) ? 1 : 0.6 }}
                      />
                    </div>
                ))}
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-input" value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} disabled={!editing} style={{ opacity: editing ? 1 : 0.6 }}>
                    <option value="₹">₹ Indian Rupee (INR)</option>
                    <option value="$">$ US Dollar (USD)</option>
                    <option value="€">€ Euro (EUR)</option>
                    <option value="£">£ British Pound (GBP)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card fade-in" style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 24 }}>Security Settings</div>
              {pwError && <div style={{ background: 'var(--accent-red-dim)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{pwError}</div>}
              {pwSuccess && <div style={{ background: 'var(--accent-green-dim)', color: 'var(--accent-green)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>Password changed successfully!</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" placeholder="Enter current password"
                         value={pwForm.oldPassword} onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Enter new password"
                         value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" placeholder="Confirm new password"
                         value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
                </div>
                <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={handlePasswordChange} disabled={pwSaving}>
                  <Shield size={14} /> {pwSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            <div className="card fade-in">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 24 }}>Notification Settings</div>
              {notifs.map(notif => (
                  <div key={notif.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', marginBottom: 2 }}>{notif.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{notif.desc}</div>
                    </div>
                    <div onClick={() => toggleNotif(notif.key)} style={{ width: 40, height: 22, borderRadius: 100, background: notif.enabled ? 'var(--accent-green)' : 'var(--bg-secondary)', border: `1px solid ${notif.enabled ? 'var(--accent-green)' : 'var(--border)'}`, position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'var(--transition)' }}>
                      <div style={{ position: 'absolute', top: 2, left: notif.enabled ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: notif.enabled ? '#000' : 'var(--text-muted)', transition: 'left 0.2s ease' }} />
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  )
}
