import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute - Path:", location.pathname, "User:", user ? user.email : "null", "Loading Auth:", loading);

  if (loading) {
    console.log("ProtectedRoute - Auth is loading, rendering loading message.");
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    console.log("ProtectedRoute - User is null (auth check complete), redirecting to login from:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("ProtectedRoute - User logged in and auth check complete, rendering children.");
  return children;
};

export default ProtectedRoute;

