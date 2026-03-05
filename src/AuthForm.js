import React, { useState } from 'react';

function AuthForm({ mode, setMode, formData, setFormData, handleAuth }) {
  const [focused, setFocused] = useState(null);

  return (
    <div style={containerStyle}>
      {/* Left Side: Branding & Illustration */}
      <div style={leftSideStyle}>
        <div style={illustrationArea}>
          <div style={logoBadge}>🅿️ SmartPark</div>
          <h1 style={taglineStyle}>Smart Parking for <span style={{color: '#2ecc71'}}>Smart Cities.</span></h1>
          <p style={subTagline}>Revolutionizing the way PCMC parks. Real-time availability, instant payments, and seamless navigation.</p>
        </div>
        {/* Background Decorative Circles */}
        <div style={circle1}></div>
        <div style={circle2}></div>
      </div>

      {/* Right Side: Glassmorphism Login Card */}
      <div style={rightSideStyle}>
        <div style={glassCard}>
          <h2 style={cardTitle}>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          <p style={cardSubtitle}>Please enter your details to continue</p>

          <form onSubmit={handleAuth} style={formStyle}>
            {mode === 'register' && (
              <div style={inputWrapper}>
                <span style={iconStyle}>👤</span>
                <input
                  style={{...inputStyle, borderColor: focused === 'name' ? '#2ecc71' : 'rgba(255,255,255,0.1)'}}
                  type="text"
                  placeholder="Full Name"
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            )}

            <div style={inputWrapper}>
              <span style={iconStyle}>📧</span>
              <input
                style={{...inputStyle, borderColor: focused === 'email' ? '#2ecc71' : 'rgba(255,255,255,0.1)'}}
                type="email"
                placeholder="Email Address"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div style={inputWrapper}>
              <span style={iconStyle}>🔒</span>
              <input
                style={{...inputStyle, borderColor: focused === 'pass' ? '#2ecc71' : 'rgba(255,255,255,0.1)'}}
                type="password"
                placeholder="Password"
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" style={glowButtonStyle}>
              {mode === 'login' ? 'Access Dashboard' : 'Join Now'}
            </button>
          </form>

          <p style={toggleTextStyle}>
            {mode === 'login' ? "New here?" : "Already a member?"}
            <span 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
              style={toggleLinkStyle}
            >
              {mode === 'login' ? ' Create account' : ' Login instead'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// --- STARTUP THEME STYLES ---

const containerStyle = {
  height: '100vh',
  display: 'flex',
  backgroundColor: '#0f172a', // Dark slate background
  fontFamily: "'Inter', sans-serif",
  color: '#f8fafc',
  overflow: 'hidden'
};

const leftSideStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '80px',
  position: 'relative',
  background: 'radial-gradient(circle at top left, #1e293b, #0f172a)',
  '@media (max-width: 768px)': { display: 'none' } // Hide on mobile
};

const rightSideStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  zIndex: 10
};

const glassCard = {
  background: 'rgba(30, 41, 59, 0.7)', // Semi-transparent
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  padding: '40px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  textAlign: 'center'
};

const illustrationArea = { zIndex: 2 };

const logoBadge = {
  display: 'inline-block',
  background: 'rgba(46, 204, 113, 0.1)',
  color: '#2ecc71',
  padding: '8px 16px',
  borderRadius: '100px',
  fontSize: '14px',
  fontWeight: 'bold',
  marginBottom: '20px',
  border: '1px solid rgba(46, 204, 113, 0.3)'
};

const taglineStyle = {
  fontSize: '48px',
  fontWeight: '800',
  lineHeight: '1.1',
  marginBottom: '20px'
};

const subTagline = {
  fontSize: '18px',
  color: '#94a3b8',
  maxWidth: '450px',
  lineHeight: '1.6'
};

const cardTitle = { fontSize: '28px', fontWeight: '700', marginBottom: '8px' };
const cardSubtitle = { color: '#94a3b8', marginBottom: '30px', fontSize: '14px' };

const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px' };

const inputWrapper = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const iconStyle = {
  position: 'absolute',
  left: '15px',
  fontSize: '18px',
  opacity: 0.7
};

const inputStyle = {
  width: '100%',
  padding: '14px 14px 14px 45px',
  borderRadius: '12px',
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
  transition: 'all 0.3s ease'
};

const glowButtonStyle = {
  background: '#2ecc71',
  color: '#000',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '10px',
  transition: 'all 0.3s ease',
  boxShadow: '0 0 15px rgba(46, 204, 113, 0.4)'
};

const toggleTextStyle = { marginTop: '25px', fontSize: '14px', color: '#94a3b8' };
const toggleLinkStyle = { color: '#2ecc71', fontWeight: '600', cursor: 'pointer' };

// Decorative elements
const circle1 = {
  position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px',
  borderRadius: '50%', background: 'rgba(46, 204, 113, 0.05)', filter: 'blur(80px)'
};
const circle2 = {
  position: 'absolute', bottom: '10%', right: '10%', width: '200px', height: '200px',
  borderRadius: '50%', background: 'rgba(52, 152, 219, 0.05)', filter: 'blur(60px)'
};

export default AuthForm;