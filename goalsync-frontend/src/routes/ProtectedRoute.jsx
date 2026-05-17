import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fb]">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-slate-200 border-t-[#0d6e63] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold" style={{ fontFamily: 'Hanken Grotesk, sans-serif' }}>Loading GoalSync...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    const roleRedirects = { employee: '/employee/dashboard', manager: '/manager/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={roleRedirects[user?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
