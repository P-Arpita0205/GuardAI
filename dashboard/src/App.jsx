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
    type: "Attacker"
  }
]

function App() {
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const [loadingStage, setLoadingStage] = useState("")

  const scanProfile = async (profile) => {
    setSelectedProfile(profile)
    setLoading(true)
    setLoadingStage("Scanning bio & behavior...")
    setResult(null)
    setError(null)

    // Simulate multi-stage for better UX
    const timer = setTimeout(() => {
      setLoadingStage("Analyzing profile image...")
    }, 1200)

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
      setError("Could not connect to backend. Make sure it's running on port 8000.")
      console.error(err)
    } finally {
      clearTimeout(timer)
      setLoading(false)
      setLoadingStage("")
    }
  }

  const getRiskIcon = (score) => {
    if (score < 30) return <CheckCircle className="text-emerald-500" />
    if (score < 70) return <AlertTriangle className="text-amber-500" />
    return <Shield className="text-red-500" />
  }

  const getRiskClass = (score) => {
    if (score < 35) return "risk-safe"
    if (score < 75) return "risk-suspicious"
    return "risk-high"
  }

  return (
    <div>
      <header>
        <h1>GuardAI</h1>
        <p className="subtitle">Real-time Instagram Profile Threat Detection</p>
      </header>

      <div className="container">
        {SAMPLES.map((profile) => (
          <div 
            key={profile.username} 
            className={`glass profile-card ${selectedProfile?.username === profile.username ? 'active' : ''}`}
            onClick={() => setSelectedProfile(profile)}
          >
            <img src={profile.image_url} alt={profile.username} className="profile-image" />
            <h3>@{profile.username}</h3>
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
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', minHeight: '3rem' }}>{profile.bio}</p>
            <button 
              className="scan-button"
              onClick={(e) => {
                e.stopPropagation()
                scanProfile(profile)
              }}
              disabled={loading}
              style={{ background: loading && selectedProfile?.username === profile.username ? '#475569' : '' }}
            >
              {loading && selectedProfile?.username === profile.username ? loadingStage : "Scan with GuardAI"}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <div className="glass" style={{ marginTop: '2rem', padding: '1rem', color: '#ef4444', borderColor: '#ef4444' }}>
          {error}
        </div>
      )}

      {result && (
        <div className="glass results-panel animate-fade-in" style={{ 
          borderLeft: `8px solid ${result.risk_score > 75 ? '#ef4444' : result.risk_score > 35 ? '#f59e0b' : '#10b981'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {getRiskIcon(result.risk_score)} Analysis Result
            </h2>
            <div className={`risk-badge ${getRiskClass(result.risk_score)}`}>
              {result.label} ({result.risk_score}%)
            </div>
          </div>
          
          <p style={{ margin: '0.5rem 0 1.5rem 0', fontStyle: 'italic', color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.4' }}>
            "{result.explanation}"
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
            <div>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                <Info size={18} className="text-blue-400" /> <strong>Intent:</strong> <span style={{ color: '#fff' }}>{result.intent}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                <User size={18} className="text-purple-400" /> <strong>Visual:</strong> <span style={{ color: '#fff' }}>{result.visual}</span>
              </p>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
              <p style={{ margin: '0.5rem 0' }}><strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%</p>
              <p style={{ margin: '0.5rem 0' }}><strong>Behavior Score:</strong> {result.behavior_score}/100</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ color: '#94a3b8', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>Detection Reasons</h4>
            <ul className="reasons-list">
              {result.reasons.map((reason, i) => (
                <li key={i} className="reason-item">
                  <div style={{ minWidth: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
