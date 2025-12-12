import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      // Log the login (Fire & Forget)
      // We retrieve user ID from auth context or directly if possible. 
      // Since 'login' returns boolean, we might need to rely on the effect or just fetch user again?
      // Actually, 'login' in context sets the user state. But state update is async.
      // Better way: let 'login' return the user object or just delay logging?
      // Quick fix for MVP: Context likely has the user immediately after await if it was updated,
      // BUT React batching might block it.
      // Let's modify: we can just fetch the user from supabase or trust the session exists.
      
      // Let's import userService and supabase client directly here or use a small timeout?
      // Safest: The AuthContext 'login' should probably return the user, but let's check it.
      // Assumption: 'login' handles auth state.
      // Let's try to get session directly to get ID for logging.
      
      try {
        const { data: { user } } = await import('../supabase').then(m => m.supabase.auth.getUser());
        if (user) {
             await import('../services/userService').then(m => m.userService.logLogin(user.id));
        }
      } catch (err) {
        console.error("Login log failed", err);
      }

      navigate('/');
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-light)'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-white)',
        padding: '3rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-md)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          backgroundColor: '#FFF5F2',
          borderRadius: '50%',
          marginBottom: '1.5rem',
          color: 'var(--primary)'
        }}>
          <Store size={48} />
        </div>

        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.875rem' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Sign in to manage your Point of Sale
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                outline: 'none',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                outline: 'none',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.875rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <p>Demo Credentials:</p>
          <p>User: <strong>admin</strong> | Pass: <strong>admin1</strong></p>
        </div>
      </div>
    </div>
  );
}
