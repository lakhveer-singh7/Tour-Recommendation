import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - Path:", location.pathname, "User:", user ? user.email : "null", "Loading Auth:", loading);

  if (loading) {
    console.log("ProtectedRoute - Auth is loading, rendering loading spinner.");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - User is null (auth check complete), redirecting to login from:", location.pathname);
    console.log("ProtectedRoute - This should not happen if user is logged in!");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoute - User logged in and auth check complete, rendering children.");
  return children;
};

export default ProtectedRoute;

