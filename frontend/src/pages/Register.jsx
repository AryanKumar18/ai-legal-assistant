import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/register', formData)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-paper font-sans">

      {/* ───────────────── Left: Form ───────────────── */}
      <div className="w-full lg:w-[44%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative">

        {/* Brand mark */}
        <div className="absolute top-8 left-6 sm:left-12 lg:left-16 flex items-center gap-2.5 animate-fade-up">
          <div className="w-8 h-8 rounded-md bg-ink-900 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF7A" strokeWidth="1.75">
              <path d="M12 3v18M5 7l-3 6a4 4 0 0 0 8 0l-3-6M19 7l-3 6a4 4 0 0 0 8 0l-3-6M5 7h14M12 21h6M12 3a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-serif text-[15px] text-ink-900 tracking-tight">Verita</span>
        </div>

        <div className="max-w-sm mx-auto w-full">

          <div className="mb-10 animate-fade-up" style={{ animationDelay: '80ms' }}>
            <p className="text-xs uppercase tracking-[0.18em] text-gold-600 font-medium mb-3">
              Document Intelligence
            </p>
            <h1 className="font-serif text-[2.1rem] leading-tight text-ink-900 mb-2">
              Create your account
            </h1>
            <p className="text-[15px] text-slate-500">
              Start reviewing contracts in minutes, not hours.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-5 border border-red-100 animate-fade-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-up" style={{ animationDelay: '160ms' }}>
            <div>
              <label className="block text-[13px] font-medium text-ink-800 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Aryan Kumar"
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[14.5px] text-ink-900 placeholder-slate-400 outline-none transition-all duration-150 focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink-800 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@firm.com"
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-[14.5px] text-ink-900 placeholder-slate-400 outline-none transition-all duration-150 focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-ink-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-11 bg-white border border-slate-200 rounded-lg text-[14.5px] text-ink-900 placeholder-slate-400 outline-none transition-all duration-150 focus:border-ink-900 focus:ring-4 focus:ring-ink-900/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink-700 transition-colors"
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <p className="text-[12px] text-slate-400 mt-1.5">
                At least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-ink-900 text-white py-3 rounded-lg font-medium text-[14.5px] transition-all duration-200 hover:bg-ink-800 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account
                </>
              ) : (
                <>
                  Create account
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className="transition-transform duration-200 group-hover:translate-x-0.5">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[13.5px] text-slate-500 mt-8 animate-fade-up" style={{ animationDelay: '220ms' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-ink-900 font-medium hover:text-gold-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* ───────────────── Right: Signature panel ───────────────── */}
      <div className="hidden lg:flex w-[56%] relative bg-ink-900 overflow-hidden items-center justify-center">

        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-gold-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] bg-indigo-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md px-12 text-center">

          {/* Document scan signature element */}
          <div className="relative w-72 h-80 mx-auto mb-12">

            {/* Reader figure — seated, reviewing the document */}
            <svg
              className="absolute -left-14 bottom-0 w-28 h-44 animate-fade-up"
              style={{ animationDelay: '350ms' }}
              viewBox="0 0 100 160"
              fill="none"
              aria-hidden="true"
            >
              {/* chair / shoulders base */}
              <path d="M20 158 L20 110 Q20 96 34 96 L66 96 Q80 96 80 110 L80 158" stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeLinecap="round" />
              {/* torso */}
              <path d="M28 158 V120 Q28 100 50 100 Q72 100 72 120 V158" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
              {/* head + subtle reading nod */}
              <g style={{ transformOrigin: '50px 78px' }} className="animate-nod">
                <circle cx="50" cy="78" r="16" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
                {/* gaze line toward the document */}
                <line x1="50" y1="80" x2="68" y2="86" stroke="#D4AF7A" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              </g>
              {/* arm reaching toward document */}
              <path d="M68 122 Q86 122 92 108" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" />
            </svg>

            <div className="absolute inset-0 left-8 rounded-xl bg-ink-800 border border-white/10 shadow-2xl overflow-hidden">

              {/* Document lines, "highlighting" as scan passes */}
              <div className="p-6 pt-8 space-y-3">
                <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-5/6 bg-white/10 rounded-full" />
                <div className="h-px w-full bg-white/5 my-4" />
                <div className="h-2 w-2/3 bg-gold-500/40 rounded-full" />
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-4/5 bg-white/10 rounded-full" />
                <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                <div className="h-px w-full bg-white/5 my-4" />
                <div className="h-2 w-full bg-white/10 rounded-full" />
                <div className="h-2 w-3/5 bg-gold-500/40 rounded-full" />
                <div className="h-2 w-5/6 bg-white/10 rounded-full" />
              </div>

              {/* Scan line sweep */}
              <div className="absolute left-0 right-0 h-16 pointer-events-none animate-scan"
                style={{
                  background: 'linear-gradient(180deg, transparent, rgba(212,175,122,0.18) 45%, rgba(212,175,122,0.35) 50%, rgba(212,175,122,0.18) 55%, transparent)',
                }}
              />
              <div className="absolute left-0 right-0 h-px bg-gold-400/70 animate-scan"
                style={{ boxShadow: '0 0 12px 1px rgba(212,175,122,0.6)' }}
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -right-2 top-10 bg-ink-700/95 backdrop-blur border border-white/10 rounded-lg px-3 py-2 shadow-xl animate-fade-up" style={{ animationDelay: '550ms' }}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                <span className="text-[11px] text-white/80 font-medium">Set up in 2 minutes</span>
              </div>
            </div>
          </div>

          <h2 className="font-serif text-2xl text-white mb-3 leading-snug">
            Your first document, summarized free.
          </h2>
          <p className="text-white/50 text-[14.5px] leading-relaxed">
            Upload a contract and Verita will summarize it, flag risk, and answer your questions — no credit card required.
          </p>
        </div>
      </div>
    </div>
  )
}