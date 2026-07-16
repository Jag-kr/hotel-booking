import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('admin@hotelbooking.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">🏨</div>
        <h2 className="admin-login-title">Admin Portal</h2>
        <p className="admin-login-subtitle">Trinity Suites — Staff Access Only</p>

        <div style={{
          background: 'var(--bg-light)',
          border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          marginBottom: '1.25rem',
          fontSize: '0.78rem',
          textAlign: 'left',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--brand)', marginBottom: '0.2rem' }}>🔑 Default Admin Credentials:</div>
          <div><strong>Email:</strong> admin@hotelbooking.com</div>
          <div><strong>Password:</strong> Admin@123</div>
        </div>

        {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="admin@hotelbooking.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          This portal is restricted to authorized hotel staff only.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
