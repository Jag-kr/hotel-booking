import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="container-fluid">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <span className="navbar-hotel-name">Trinity Suites</span>
            <span className="navbar-hotel-address">Bangalore</span>
          </Link>

          <div className="navbar-actions">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
              </>
            ) : (
              <>
                {isAdmin && <Link to="/admin" className="btn btn-secondary btn-sm">Admin Dashboard</Link>}
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">Logout</button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
