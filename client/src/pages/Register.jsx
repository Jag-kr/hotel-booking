import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>Trinity Suites</h1>
          <p>Create an account to track your bookings effortlessly.</p>
        </div>
      </div>
      <div className="auth-right">
        <h2 className="auth-form-title">Create Account</h2>
        <p className="auth-form-subtitle">Join us for exclusive offers and easy booking.</p>
        
        {error && <div className="form-error mb-2">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required className="form-control" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" required className="form-control" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required className="form-control" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary btn-block mt-2">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
