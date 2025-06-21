import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { TourProvider } from './context/TourContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Preference from './pages/Preference';
import Explore from './pages/Explore';
import SavedTours from './pages/Tours';
import Destinations from './pages/Destinations';
import PlanYourTour from './pages/PlanYourTour';
import ProtectedRoute from './components/ProtectedRoute';
import Recommendation from './pages/Recommendation';
import CompleteProfile from './pages/CompleteProfile';
import Profile from './pages/Profile';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from './context/AuthContext';

// Get Google Client ID from environment (ensure this is in frontend/.env.local)
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const queryClient = new QueryClient();

function App() {
  // Add a check to console.error if the CLIENT_ID is missing
  if (!GOOGLE_CLIENT_ID) {
    console.error("REACT_APP_GOOGLE_CLIENT_ID is not defined in frontend/.env.local. Google OAuth will not work.");
    // You might want to render a fallback UI or throw an error here in a production app
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* IMPORTANT: Wrap your entire application with GoogleOAuthProvider */}
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <AuthProvider>
            <TourProvider>
              <AppContent />
            </TourProvider>
          </AuthProvider>
        </Router>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const showNavbar = location.pathname !== '/';

  console.log("AppContent Render - Path:", location.pathname, "Auth User:", user ? user.email : "null", "Auth Loading:", loading);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/preference" element={
          <ProtectedRoute>
            <Preference />
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <Explore />
          </ProtectedRoute>
        } />
        <Route path="/saved-tours" element={
          <ProtectedRoute>
            <SavedTours />
          </ProtectedRoute>
        } />
        <Route path="/recommendation" element={
          <ProtectedRoute>
            <Recommendation />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/plan-tour" element={
          <ProtectedRoute>
            <PlanYourTour />
          </ProtectedRoute>
        } />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/google-auth-success" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/destinations" element={<Destinations />} />
      </Routes>
    </>
  );
}

export default App;