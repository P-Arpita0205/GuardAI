import { useState } from 'react'
import axios from 'axios'
import { Shield, AlertTriangle, CheckCircle, Search, User, Users, Info } from 'lucide-react'

const SAMPLES = [
  {
    username: "sarah_designer",
    followers: 1240,
    following: 850,
    bio: "UI/UX Designer | Nature Lover | Coffee Addict ☕",
    image_url: "/normal.png",
    type: "Normal"
  },
  {
    username: "win_crypto_fast_99",
    followers: 45,
    following: 2500,
    bio: "DM for crypto signals! 💸 Link in bio for 1000% returns!!! 🔥🔥🔥",
    image_url: "/suspicious.png",
    type: "Suspicious"
  },
  {
    username: "unknown_user_x",
    followers: 12,
    following: 1200,
    bio: "...",
    image_url: "/attacker.png",
    type: "Attfunction App() {
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loadingStage, setLoadingStage] = useState("")

  const scanProfile = async (profile) => {
    setSelectedProfile(profile)
    setLoading(true)
    setLoadingStage("Initializing AI...")
    setResult(null)
    setError(null)

    const timer = setTimeout(() => setLoadingStage("VLM Analysis..."), 1000)

    try {
      const response = await axios.post('http://localhost:8000/analyze-profile', {
        username: profile.username,
        followers: profile.followers,
        following: profile.following,
        bio: profile.bio,
        image_url: window.location.origin + profile.image_url
      })
      setResult(response.data)
    } catch (err) {
      setError("Backend connection failure.")
    } finally {
      clearTimeout(timer)
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      {/* Sidebar: System Status */}
      <div className="glass" style={{ width: '280px', padding: '1.5rem', textAlign: 'left', height: 'fit-content', position: 'sticky', top: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#3b82f6' }}>
          <div className="pulse" style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '50%' }}></div>
          SYSTEM STATUS: ONLINE
        </h3>
        <hr style={{ border: '0.5px solid rgba(255,255,255,0.05)', margin: '1rem 0' }} />
        
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem' }}>AI CORE</p>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
            <div style={{ width: '85%', height: '100%', background: '#3b82f6', borderRadius: '2px' }}></div>
          </div>
        </div>

        <h4 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>Recent Alerts</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', fontSize: '0.75rem', color: '#ef4444', borderLeft: '3px solid #ef4444' }}>
            High Risk: @attacker_x
          </div>
          <div style={{ padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', fontSize: '0.75rem', color: '#f59e0b', borderLeft: '3px solid #f59e0b' }}>
            Suspicious: @crypto_bot
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        <header style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <h1>GuardAI</h1>
          <p className="subtitle">Enterprise-grade profile threat intelligence</p>
        </header>

        <div className="container">
          {SAMPLES.map((profile) => (
            <div 
              key={profile.username} 
              className={`glass profile-card ${selectedProfile?.username === profile.username ? 'active' : ''}`}
              onClick={() => setSelectedProfile(profile)}
            >
              <img src={profile.image_url} alt={profile.username} className="profile-image" />
              <h3 style={{ margin: '0.5rem 0' }}>@{profile.username}</h3>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-value">{profile.followers}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{profile.following}</span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
              <button 
                className="scan-button"
                onClick={(e) => { e.stopPropagation(); scanProfile(profile); }}
                disabled={loading}
              >
                {loading && selectedProfile?.username === profile.username ? loadingStage : "Scan Profile"}
              </button>
            </div>
          ))}
        </div>

        {result && (
          <div className="glass results-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                  <Shield className="text-blue-500" />
                </div>
                <div>
                  <h2 style={{ margin: 0 }}>Threat Analysis</h2>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>REPORT ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
              </div>
              <div className={`risk-badge ${getRiskClass(result.risk_score)}`}>
                {result.label} • {result.risk_score}% RISK
              </div>
            </div>
            
            <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', border: 'none', background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', lineHeight: '1.6' }}>
                "{result.explanation}"
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Intent', value: result.intent, icon: <AlertTriangle size={16} /> },
                { label: 'Visual', value: result.visual, icon: <User size={16} /> },
                { label: 'Confidence', value: `${(result.confidence * 100).toFixed(0)}%`, icon: <CheckCircle size={16} /> },
                { label: 'Behavior', value: `${result.behavior_score}/100`, icon: <Users size={16} /> }
              ].map((item) => (
                <div key={item.label} className="glass" style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                    {item.icon} {item.label}
                  </div>
                  <div style={{ color: '#fff', fontWeight: '700' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <h4 style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.75rem', marginBottom: '1rem' }}>Red Flag Indicators</h4>
            <div className="reasons-list">
              {result.reasons.map((reason, i) => (
                <div key={i} className="reason-item">
                  <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></div>
                  {reason}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
