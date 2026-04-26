import { FormEvent, useState } from 'react';

interface LoginPanelProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (input: {
    username: string;
    password: string;
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
  }) => Promise<void>;
  onForgotPassword: (username: string, newPassword: string) => Promise<void>;
  onLogout: () => Promise<void>;
  loggedInUsername: string | undefined;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginPanel({ onLogin, onRegister, onForgotPassword, onLogout, loggedInUsername }: LoginPanelProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        await onRegister({ username, password, fullName, phone, homeCity, bio });
        setMode('login');
        return;
      }

      if (mode === 'forgot') {
        await onForgotPassword(username, password);
        setMode('login');
        return;
      }

      await onLogin(username, password);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel panel-login auth-frame-card">
      <div className="auth-card-top">
        <div className="auth-logo-wrap">
          <img src="/logo.svg" alt="PlacesToStay" className="auth-logo" />
        </div>
        <span className="auth-kicker">Secure travel access</span>
        <h2>{mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset password' : 'Welcome back'}</h2>
        <p>{loggedInUsername ? `Logged in as ${loggedInUsername}` : 'Login, create a new account, or reset password from the same design.'}</p>
      </div>

      {!loggedInUsername ? (
        <div className="auth-mode-tabs">
          <button type="button" className={mode === 'login' ? 'auth-mode-tab active' : 'auth-mode-tab'} onClick={() => setMode('login')}>Login</button>
          <button type="button" className={mode === 'register' ? 'auth-mode-tab active' : 'auth-mode-tab'} onClick={() => setMode('register')}>Register</button>
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="stack auth-form">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={mode === 'forgot' ? 'New password' : 'Password'}
          required
        />
        {mode === 'register' ? (
          <div className="auth-extra-grid">
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              required
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone"
              required
            />
            <input
              value={homeCity}
              onChange={(event) => setHomeCity(event.target.value)}
              placeholder="Home city"
              required
            />
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Short bio"
              rows={3}
              maxLength={320}
            />
          </div>
        ) : null}
        <div className="auth-actions-row">
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : mode === 'forgot' ? 'Reset password' : 'Login'}
          </button>
          {mode === 'login' && !loggedInUsername ? (
            <button type="button" className="auth-inline-link" onClick={() => setMode('forgot')}>
              Forgot password?
            </button>
          ) : null}
        </div>
        {loggedInUsername ? (
          <button type="button" className="auth-logout" onClick={() => void onLogout()}>
            Logout
          </button>
        ) : null}
      </form>
    </section>
  );
}
