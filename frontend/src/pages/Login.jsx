import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from "../context/AuthContext";
import { loginUser } from '../api/auth';
import GoogleLoginButton from "../components/GoogleLoginButton";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { validateEmail, validatePassword } from "../utils/validators";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  console.log("Login Component Render - Email:", email, "Password:", password, "Errors:", errors, "isSubmitting:", isSubmitting, "Auth User:", user);

  useEffect(() => {
    if (!loading && user) {
      console.log("User already logged in. Redirecting to dashboard.");
      navigate(from, { replace: true });
    }

    const newErrors = {};
    if (email && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (password && !validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    console.log("Validation useEffect - newErrors:", newErrors);
  }, [email, password, user, loading, navigate, from]);

  const { mutate: loginMutation, error: apiError } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log("Login Mutation Success:", data);
      login(data.user, data.token, rememberMe);
      navigate('/dashboard', { replace: true });
    },
    onError: (error) => {
      console.error("Login Mutation Error:", error);
      console.log("Error object message:", error.message);
      const errorMessage = error.message;

      if (errorMessage === "User not found.") {
        setErrors({ general: "User doesn't exist." });
      } else if (errorMessage === "Invalid credentials.") {
        setErrors({ general: "Password is wrong." });
      } else {
        setErrors({ general: errorMessage || 'Login failed.' });
      }
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("handleSubmit called");
    setIsSubmitting(true);

    const validationErrors = {};
    if (!email) validationErrors.email = 'Email is required';
    else if (!validateEmail(email)) validationErrors.email = 'Invalid email format';
    if (!password) validationErrors.password = 'Password is required';
    else if (!validatePassword(password)) validationErrors.password = 'Password too short';

    console.log("handleSubmit - validationErrors before setting:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      console.log("handleSubmit - Validation failed. Not calling loginMutation.");
      return;
    }

    console.log("handleSubmit - Validation passed. Calling loginMutation.");
    loginMutation({ email, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="text-center">
            <h2 className="mt-6 text-4xl font-extrabold text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {errors.general && (
            <ErrorMessage 
              message={errors.general}
              className="mb-4"
            />
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`block w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  to="/forgot-password" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Login'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <GoogleLoginButton />
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90">
          <div className="absolute inset-0 flex items-center justify-center text-white p-12">
            <div className="max-w-lg">
              <h2 className="text-4xl font-bold mb-6">Discover Your Next Adventure</h2>
              <p className="text-lg mb-8">
                Join our community of travelers and get personalized recommendations for your next journey.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-4 text-lg">Personalized travel recommendations</p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-4 text-lg">Expert local insights</p>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-4 text-lg">Seamless travel planning</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
          alt="Travel"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;