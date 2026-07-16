import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ManageBooking from './pages/ManageBooking';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated || !isAdmin) return <Navigate to="/admin/login" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes — no auth needed */}
        <Route path="/" element={<Home />} />
        <Route path="/manage-booking" element={<ManageBooking />} />

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin protected */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
