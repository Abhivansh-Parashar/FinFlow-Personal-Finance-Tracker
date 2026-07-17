import React, { useState, useRef, useCallback } from 'react'
import {
  Upload, Sparkles, FileImage, X, CheckCircle2, AlertCircle,
  Zap, RotateCcw, ArrowRight, Receipt, Camera, Brain,
  ShoppingCart, Calendar, Building2, Tag, DollarSign, Plus
} from 'lucide-react'
import { categoryService, transactionService, getApiList, addTransactionNotification } from '../services/api'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

// ── Receipt API helper ────────────────────────────────────────────────────────
const extractReceipt = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/receipts/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// ── Step indicators ───────────────────────────────────────────────────────────
const STEPS = ['Upload', 'AI Analysis', 'Review & Save']

function StepIndicator({ current }) {
  return (
    <div className="receipt-steps">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`step-item ${i < current ? 'done' : i === current ? 'active' : ''}`}>
            <div className="step-dot">
              {i < current ? <CheckCircle2 size={14} /> : <span>{i + 1}</span>}
            </div>
            <span className="step-label">{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Drop zone ─────────────────────────────────────────────────────────────────
function DropZone({ onFile, uploading }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) onFile(file)
  }, [onFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  return (
    <div
      className={`drop-zone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !uploading && inputRef.current?.click()}
    >
      {/* Animated corner accents */}
      <span className="corner tl" /><span className="corner tr" />
      <span className="corner bl" /><span className="corner br" />

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => { const f = e.target.files[0]; if (f) onFile(f) }} />

      <div className="drop-zone-inner">
        <div className="drop-icon-wrap">
          <div className="drop-icon-ring" />
          <div className="drop-icon-ring ring2" />
          <FileImage size={38} className="drop-icon" />
        </div>
        <div className="drop-title">
          {dragging ? 'Release to upload' : 'Drop your receipt here'}
        </div>
        <div className="drop-sub">or click to browse — JPG, PNG, WEBP, PDF supported</div>
        <button className="btn btn-secondary drop-btn" type="button">
          <Camera size={15} /> Choose Image
        </button>
      </div>
    </div>
  )
}

// ── AI thinking animation ─────────────────────────────────────────────────────
function AIThinking({ preview }) {
  const bullets = [
    'Detecting receipt structure…',
    'Reading merchant name…',
    'Parsing amount and date…',
    'Suggesting category…',
    'Finalising extraction…',
  ]
  const [visible, setVisible] = React.useState(0)

  React.useEffect(() => {
    const id = setInterval(() => setVisible(v => Math.min(v + 1, bullets.length - 1)), 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="ai-thinking fade-in">
      {preview && (
        <div className="ai-preview-wrap">
          <img src={preview} alt="Receipt preview" className="ai-preview-img" />
          <div className="ai-scan-line" />
        </div>
      )}
      <div className="ai-status-panel">
        <div className="ai-brain-icon">
          <Brain size={28} />
          <div className="brain-pulse" />
        </div>
        <div className="ai-status-title">
          <Sparkles size={16} /> Gemini AI is reading your receipt
        </div>
        <div className="ai-bullets">
          {bullets.slice(0, visible + 1).map((b, i) => (
            <div key={b} className={`ai-bullet ${i === visible ? 'active' : 'done'}`}>
              {i < visible ? <CheckCircle2 size={13} /> : <div className="ai-dot-spin" />}
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Result review panel ───────────────────────────────────────────────────────
function ReviewPanel({ result, categories, onConfirm, onReset, confirming }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    description: result.merchant || '',
    amount: result.amount ? String(result.amount) : '',
    date: result.date || today,
    categoryId: '',
    note: result.rawModelNotes || '',
  })

  const expenseCats = categories.filter(c => c.type === 'EXPENSE')

  // try to auto-match suggestedCategory
  React.useEffect(() => {
    if (result.suggestedCategory && expenseCats.length) {
      const match = expenseCats.find(c =>
        c.name.toLowerCase().includes(result.suggestedCategory.toLowerCase()) ||
        result.suggestedCategory.toLowerCase().includes(c.name.toLowerCase())
      )
      if (match) setForm(f => ({ ...f, categoryId: String(match.id) }))
    }
  }, [result.suggestedCategory, categories])

  const fieldInfo = [
    { icon: Building2, label: 'Merchant / Description', key: 'description', type: 'text', placeholder: 'e.g. Swiggy, Zomato' },
    { icon: DollarSign, label: 'Amount (₹)', key: 'amount', type: 'number', placeholder: '0.00' },
    { icon: Calendar, label: 'Date', key: 'date', type: 'date', placeholder: '' },
  ]

  return (
    <div className="review-panel fade-in">
      <div className="review-header">
        <div className="review-badge">
          <Sparkles size={13} /> AI Extracted
        </div>
        <h3 className="review-title">Review & Confirm</h3>
        <p className="review-sub">AI has read your receipt. Edit any fields before saving.</p>
      </div>

      {result.suggestedCategory && (
        <div className="ai-suggestion-chip">
          <Tag size={12} />
          AI suggests: <strong>{result.suggestedCategory}</strong>
        </div>
      )}

      <div className="review-fields">
        {fieldInfo.map(({ icon: Icon, label, key, type, placeholder }) => (
          <div className="form-group" key={key}>
            <label className="form-label">
              <Icon size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {label}
            </label>
            <input
              className="form-input"
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={e => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}

        <div className="form-group">
          <label className="form-label">
            <Tag size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Category
          </label>
          <select className="form-input" value={form.categoryId}
            onChange={e => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select expense category</option>
            {expenseCats.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <Receipt size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Note (AI Notes)
          </label>
          <input className="form-input" placeholder="AI notes or your custom note..."
            value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
        </div>
      </div>

      <div className="review-actions">
        <button className="btn btn-secondary" onClick={onReset} disabled={confirming}>
          <RotateCcw size={14} /> Upload Another
        </button>
        <button
          className="btn btn-primary review-save-btn"
          onClick={() => onConfirm(form)}
          disabled={confirming || !form.amount || !form.description || !form.categoryId}
        >
          {confirming ? (
            <><div className="btn-spinner" /> Saving…</>
          ) : (
            <><Plus size={15} /> Save Expense</>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Success state ─────────────────────────────────────────────────────────────
function SuccessState({ merchant, amount, onReset }) {
  return (
    <div className="success-state fade-in">
      <div className="success-ring">
        <CheckCircle2 size={48} />
        <div className="success-ring-anim" />
      </div>
      <h3 className="success-title">Expense Saved!</h3>
      <p className="success-sub">
        <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> from{' '}
        <strong>{merchant || 'Receipt'}</strong> has been added to your expenses.
      </p>
      <button className="btn btn-primary" onClick={onReset}>
        <Upload size={15} /> Upload Another Receipt
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UploadReceipt() {
  const { user } = useAuth()
  const [step, setStep] = useState(0)           // 0=upload, 1=analysing, 2=review
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [saved, setSaved] = useState(null)

  // Load categories once
  React.useEffect(() => {
    categoryService.getAll().then(res => setCategories(getApiList(res))).catch(() => {})
  }, [])

  const handleFile = useCallback(async (file) => {
    setError('')
    setPreview(URL.createObjectURL(file))
    setStep(1)
    setUploading(true)
    try {
      const res = await extractReceipt(file)
      const data = res?.data?.data ?? res?.data ?? res
      setResult(data)
      setStep(2)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to extract receipt. Please try a clearer image.'
      )
      setStep(0)
    } finally {
      setUploading(false)
    }
  }, [])

  const handleConfirm = useCallback(async (form) => {
    if (!form.amount || !form.description || !form.categoryId) return
    setConfirming(true)
    try {
      await transactionService.create({
        transactionType: 'EXPENSE',
        categoryId: Number(form.categoryId),
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
        note: form.note,
      })
      addTransactionNotification({
        type: 'EXPENSE',
        description: form.description,
        amount: Number(form.amount),
      }, { monthlyBudget: user?.monthlyBudget })
      setSaved({ merchant: form.description, amount: form.amount })
    } catch (err) {
      setError('Failed to save expense. Please try again.')
    } finally {
      setConfirming(false)
    }
  }, [user])

  const handleReset = useCallback(() => {
    setStep(0)
    setPreview(null)
    setResult(null)
    setError('')
    setSaved(null)
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="receipt-title-icon">
              <Receipt size={20} />
            </div>
            Upload Receipt
          </div>
          <div className="page-subtitle">Let Gemini AI read your receipt and log the expense instantly</div>
        </div>
        <div className="ai-badge-pill">
          <Zap size={13} />
          Powered by AI
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="receipt-error fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      <div className="receipt-layout">
        {/* Left: main interaction panel */}
        <div className="receipt-main">
          <StepIndicator current={step} />

          <div className="receipt-panel card">
            {saved ? (
              <SuccessState merchant={saved.merchant} amount={saved.amount} onReset={handleReset} />
            ) : step === 0 ? (
              <DropZone onFile={handleFile} uploading={uploading} />
            ) : step === 1 ? (
              <AIThinking preview={preview} />
            ) : (
              <ReviewPanel
                result={result}
                categories={categories}
                onConfirm={handleConfirm}
                onReset={handleReset}
                confirming={confirming}
              />
            )}
          </div>
        </div>

        {/* Right: tips / info sidebar */}
        <div className="receipt-sidebar">
          <div className="card receipt-tips-card">
            <div className="tips-title">
              <Sparkles size={15} /> How it works
            </div>
            {[
              { icon: Upload, text: 'Upload a photo of your receipt — any angle works.' },
              { icon: Brain, text: 'AI extracts merchant, amount, date & category.' },
              { icon: ShoppingCart, text: 'Review the extracted data and confirm to save.' },
              { icon: CheckCircle2, text: 'Expense is logged instantly with full details.' },
            ].map(({ icon: Icon, text }, i) => (
              <div className="tip-row" key={i}>
                <div className="tip-icon"><Icon size={14} /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="card receipt-tips-card" style={{ marginTop: 16 }}>
            <div className="tips-title">
              <Camera size={15} /> Tips for best results
            </div>
            {[
              'Ensure good lighting — avoid glare',
              'Capture the full receipt in frame',
              'Make sure text is sharp and readable',
              'Works with printed & handwritten receipts',
            ].map((tip, i) => (
              <div className="tip-row" key={i}>
                <ArrowRight size={12} style={{ color: 'var(--accent-green)', flexShrink: 0, marginTop: 2 }} />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {preview && step >= 1 && (
            <div className="card" style={{ padding: 12, marginTop: 16 }}>
              <div className="tips-title" style={{ marginBottom: 10 }}>
                <FileImage size={14} /> Preview
              </div>
              <img
                src={preview}
                alt="Uploaded receipt"
                style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 240 }}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ── Page chrome ─────────────────────────────────────────────────── */
        .receipt-title-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, var(--accent-green-dim), rgba(0,200,150,0.05));
          border: 1px solid rgba(0,200,150,0.3);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent-green);
          box-shadow: 0 0 20px rgba(0,200,150,0.15);
        }
        .ai-badge-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.05));
          border: 1px solid rgba(167,139,250,0.3);
          border-radius: 100px;
          font-size: 0.8rem; font-weight: 600;
          color: var(--accent-purple);
          animation: badgeGlow 3s ease-in-out infinite;
        }
        @keyframes badgeGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(167,139,250,0.1); }
          50% { box-shadow: 0 0 20px rgba(167,139,250,0.3); }
        }
        .receipt-error {
          display: flex; align-items: center; gap: 10px;
          background: var(--accent-red-dim);
          border: 1px solid rgba(255,92,122,0.3);
          color: var(--accent-red);
          padding: 12px 16px; border-radius: 10px; margin-bottom: 20px;
        }
        .receipt-error button {
          background: transparent; color: var(--accent-red); margin-left: auto;
          display: flex; align-items: center;
        }

        /* ── Layout ──────────────────────────────────────────────────────── */
        .receipt-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .receipt-layout { grid-template-columns: 1fr; }
          .receipt-sidebar { order: -1; }
        }
        .receipt-main { display: flex; flex-direction: column; gap: 20px; }
        .receipt-panel { padding: 32px; min-height: 380px; display: flex; align-items: stretch; }

        /* ── Step indicator ──────────────────────────────────────────────── */
        .receipt-steps {
          display: flex; align-items: center; gap: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px 24px;
        }
        .step-item {
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
        }
        .step-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 2px solid var(--border-light);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700;
          color: var(--text-muted);
          transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .step-item.active .step-dot {
          border-color: var(--accent-green);
          color: var(--accent-green);
          background: var(--accent-green-dim);
          box-shadow: 0 0 12px rgba(0,200,150,0.3);
          animation: stepPulse 1.5s ease-in-out infinite;
        }
        .step-item.done .step-dot {
          border-color: var(--accent-green);
          background: var(--accent-green);
          color: #000;
        }
        @keyframes stepPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(0,200,150,0.3); }
          50% { box-shadow: 0 0 20px rgba(0,200,150,0.5); }
        }
        .step-label {
          font-size: 0.8rem; font-weight: 500;
          color: var(--text-muted);
          transition: color 0.3s;
        }
        .step-item.active .step-label { color: var(--text-primary); }
        .step-item.done .step-label { color: var(--accent-green); }
        .step-line {
          flex: 1; height: 2px; margin: 0 12px;
          background: var(--border);
          border-radius: 2px;
          transition: background 0.5s;
          position: relative;
          overflow: hidden;
        }
        .step-line.done { background: var(--accent-green); }
        .step-line::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,200,150,0.6), transparent);
          animation: lineShimmer 2s ease-in-out infinite;
        }
        @keyframes lineShimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        /* ── Drop zone ───────────────────────────────────────────────────── */
        .drop-zone {
          flex: 1; border-radius: 14px;
          border: 2px dashed var(--border-light);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
        }
        .drop-zone:hover {
          border-color: var(--accent-green);
          background: linear-gradient(135deg, rgba(0,200,150,0.04) 0%, var(--bg-card) 100%);
          box-shadow: 0 0 30px rgba(0,200,150,0.1), inset 0 0 30px rgba(0,200,150,0.03);
        }
        .drop-zone.dragging {
          border-color: var(--accent-green);
          background: rgba(0,200,150,0.07);
          box-shadow: 0 0 50px rgba(0,200,150,0.2), inset 0 0 40px rgba(0,200,150,0.05);
          transform: scale(1.01);
        }
        /* Corner accents */
        .corner {
          position: absolute; width: 20px; height: 20px;
          border-color: var(--accent-green); border-style: solid;
          transition: all 0.3s; opacity: 0;
        }
        .drop-zone:hover .corner, .drop-zone.dragging .corner { opacity: 1; }
        .corner.tl { top: 10px; left: 10px; border-width: 2px 0 0 2px; }
        .corner.tr { top: 10px; right: 10px; border-width: 2px 2px 0 0; }
        .corner.bl { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; }
        .corner.br { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; }
        .drop-zone-inner {
          display: flex; flex-direction: column; align-items: center; gap: 12px;
          padding: 40px 24px; text-align: center;
        }
        .drop-icon-wrap {
          position: relative; width: 80px; height: 80px;
          display: flex; align-items: center; justify-content: center;
        }
        .drop-icon-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid rgba(0,200,150,0.2);
          animation: ringExpand 2s ease-out infinite;
        }
        .drop-icon-ring.ring2 { animation-delay: 1s; }
        @keyframes ringExpand {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .drop-icon {
          color: var(--accent-green);
          filter: drop-shadow(0 0 8px rgba(0,200,150,0.4));
        }
        .drop-title {
          font-family: var(--font-display); font-size: 1.2rem; font-weight: 700;
          color: var(--text-primary);
        }
        .drop-sub { font-size: 0.82rem; color: var(--text-muted); }
        .drop-btn { margin-top: 8px; }

        /* ── AI Thinking ─────────────────────────────────────────────────── */
        .ai-thinking {
          flex: 1; display: flex; gap: 24px; align-items: center;
          flex-wrap: wrap; justify-content: center;
        }
        .ai-preview-wrap {
          width: 160px; height: 200px;
          border-radius: 12px; overflow: hidden;
          position: relative; flex-shrink: 0;
          border: 1px solid var(--border-light);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .ai-preview-img {
          width: 100%; height: 100%; object-fit: cover;
          filter: brightness(0.85);
        }
        .ai-scan-line {
          position: absolute; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
          box-shadow: 0 0 10px var(--accent-green);
          animation: scanDown 1.8s ease-in-out infinite;
        }
        @keyframes scanDown {
          0% { top: 0%; opacity: 1; }
          90% { top: 100%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .ai-status-panel {
          flex: 1; min-width: 240px; display: flex; flex-direction: column; gap: 14px;
        }
        .ai-brain-icon {
          position: relative; width: 52px; height: 52px;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.05));
          border: 1px solid rgba(167,139,250,0.3); border-radius: 14px;
          color: var(--accent-purple);
          box-shadow: 0 0 20px rgba(167,139,250,0.15);
        }
        .brain-pulse {
          position: absolute; inset: -4px; border-radius: 18px;
          border: 1px solid rgba(167,139,250,0.4);
          animation: brainPulse 1.4s ease-in-out infinite;
        }
        @keyframes brainPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        .ai-status-title {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-display); font-size: 1rem; font-weight: 700;
          color: var(--text-primary);
        }
        .ai-bullets { display: flex; flex-direction: column; gap: 8px; }
        .ai-bullet {
          display: flex; align-items: center; gap: 10px;
          font-size: 0.85rem; color: var(--text-muted);
          transition: color 0.3s;
        }
        .ai-bullet.active { color: var(--text-primary); }
        .ai-bullet.done { color: var(--accent-green); }
        .ai-dot-spin {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid rgba(0,200,150,0.3);
          border-top-color: var(--accent-green);
          animation: spin 0.8s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Review panel ────────────────────────────────────────────────── */
        .review-panel { flex: 1; display: flex; flex-direction: column; gap: 20px; }
        .review-header { display: flex; flex-direction: column; gap: 6px; }
        .review-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 100px;
          background: var(--accent-purple-dim); color: var(--accent-purple);
          font-size: 0.75rem; font-weight: 600; width: fit-content;
          border: 1px solid rgba(167,139,250,0.2);
        }
        .review-title { font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; }
        .review-sub { font-size: 0.83rem; color: var(--text-secondary); }
        .ai-suggestion-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px;
          background: var(--accent-green-dim); color: var(--accent-green);
          font-size: 0.8rem; border: 1px solid rgba(0,200,150,0.2);
          width: fit-content;
        }
        .review-fields { display: flex; flex-direction: column; gap: 14px; }
        .review-actions {
          display: flex; gap: 12px; margin-top: auto; padding-top: 8px;
        }
        .review-save-btn {
          flex: 1; justify-content: center;
          background: linear-gradient(135deg, var(--accent-green), #00dfa8);
          color: #000;
        }
        .btn-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(0,0,0,0.3); border-top-color: #000;
          animation: spin 0.6s linear infinite;
        }

        /* ── Success state ───────────────────────────────────────────────── */
        .success-state {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; text-align: center; padding: 24px;
        }
        .success-ring {
          position: relative; width: 80px; height: 80px;
          display: flex; align-items: center; justify-content: center;
          color: var(--accent-green);
        }
        .success-ring-anim {
          position: absolute; inset: -6px; border-radius: 50%;
          border: 2px solid var(--accent-green);
          animation: successRing 1.2s ease-out forwards;
        }
        @keyframes successRing {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .success-title {
          font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;
          color: var(--accent-green);
        }
        .success-sub { font-size: 0.9rem; color: var(--text-secondary); max-width: 300px; }

        /* ── Right sidebar tips ──────────────────────────────────────────── */
        .receipt-sidebar { display: flex; flex-direction: column; }
        .receipt-tips-card { padding: 20px; }
        .tips-title {
          display: flex; align-items: center; gap: 7px;
          font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;
          margin-bottom: 14px; color: var(--text-primary);
        }
        .tip-row {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 7px 0; border-top: 1px solid var(--border);
          font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;
        }
        .tip-row:first-of-type { border-top: none; }
        .tip-icon {
          width: 26px; height: 26px; border-radius: 8px;
          background: var(--accent-green-dim);
          border: 1px solid rgba(0,200,150,0.2);
          display: flex; align-items: center; justify-content: center;
          color: var(--accent-green); flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
