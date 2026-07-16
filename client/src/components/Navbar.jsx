import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container-fluid">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">
            <span className="navbar-hotel-name">Trinity Suites</span>
            <span className="navbar-hotel-address">Bangalore, Karnataka, India</span>
          </Link>

          <div className="navbar-links">
            <a href="#" className="navbar-link">Property Info</a>
            <a href="#" className="navbar-link">Photo Gallery</a>
            <a href="#" className="navbar-link">Facilities</a>
            <a href="#" className="navbar-link">Location</a>
          </div>

          <div className="navbar-actions">
            <Link to="/manage-booking" className="btn btn-secondary btn-sm">
              Manage My Booking
            </Link>
            {/* Admin link — discreet, only visible when logged in as admin */}
            {isAdmin && (
              <Link to="/admin" className="btn btn-secondary btn-sm">Admin</Link>
            )}
            {isAdmin && (
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            )}
            {/* Hidden admin login — accessible via /admin/login only */}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
