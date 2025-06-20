import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../api/auth';
import { GoogleLogin } from '@react-oauth/google';
import LoadingSpinner from "../components/LoadingSpinner";
import axios from 'axios';
import { verifyGoogleToken } from '../api/auth';

const PLACE_TYPES = ["museum", "park", "temple", "monument", "shopping", "food"];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSuccess = async (response) => {
    console.log("Google signup success (frontend received token):", response);
    setLoading(true);
    try {
        const backendResponse = await axios.post('/api/auth/google-verify', {
            credential: response.credential,
        });

        console.log("Backend response:", backendResponse.data);

        if (backendResponse.data.isNewUser) {
            // Redirect to complete profile page
            navigate('/complete-profile', { 
                state: { userData: backendResponse.data.userData }
            });
        } else {
            // Existing user, proceed with login
            const { user, token } = backendResponse.data;
            login(user, token, true);
            navigate('/dashboard', { replace: true });
        }
    } catch (error) {
        console.error("Error verifying Google token with backend:", error);
        setError(error.response?.data?.message || "Google signup failed. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleError = (errorResponse) => {
    console.error("Google signup failed (frontend error):", errorResponse);
    setError("Google signup failed. Please try again.");
    setLoading(false);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userDataString = params.get('user');

    if (token && userDataString) {
        try {
            const userData = JSON.parse(decodeURIComponent(userDataString));
            login(userData, token, true);
            navigate('/dashboard', { replace: true });
        } catch (e) {
            console.error("Error parsing Google OAuth redirect data:", e);
            setError("Failed to log in with Google. Please try again.");
        }
    }
  }, [location.search, login, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const userData = { name, email, password };
      await registerUser(userData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? <LoadingSpinner size="small" /> : 'Register'}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center space-x-2 mt-6">
          <span className="h-px flex-grow bg-gray-200"></span>
          <span className="text-gray-400 text-sm">OR</span>
          <span className="h-px flex-grow bg-gray-200"></span>
        </div>

        <div className="mt-6 text-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={false}
          />
        </div>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}