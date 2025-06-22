import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios'; // Import the custom axios instance
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to safely decode tokens

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Default to true, means we are checking auth status

  useEffect(() => {
    console.log("AuthContext: useEffect triggered for session check.");
    const checkUserSession = async () => {
      // Check both localStorage and sessionStorage for tokens
      const localToken = localStorage.getItem('token');
      const sessionToken = sessionStorage.getItem('token');
      const token = localToken || sessionToken;
      
      console.log("AuthContext: Token check - localStorage:", !!localToken, "sessionStorage:", !!sessionToken);
      
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          console.log("AuthContext: Token decoded successfully, exp:", new Date(decodedToken.exp * 1000));
          
          if (decodedToken.exp * 1000 < Date.now()) {
            console.warn("AuthContext: Token expired. Logging out.");
            logout();
            return; // Exit after logout, which sets loading to false
          }

          // Check if backend URL is available
          const backendUrl = process.env.REACT_APP_BACKEND_URL;
          console.log("AuthContext: Backend URL available:", !!backendUrl);
          
          if (!backendUrl) {
            console.warn("AuthContext: Backend URL not set. Using token data only.");
            // Use token data as fallback
            const userData = {
              email: decodedToken.email,
              name: decodedToken.name,
              id: decodedToken.id,
              preferences: decodedToken.preferences || {}
            };
            setUser(userData);
            console.log("AuthContext: User set from token data:", userData.email);
            // Add a small delay to ensure state is properly set
            setTimeout(() => setLoading(false), 100);
            return;
          }

          // Use the custom axios instance which has the correct base URL and auth interceptor
          console.log("AuthContext: Attempting to fetch user profile from backend...");
          const response = await axios.get('/api/auth/profile');
          setUser(response.data);
          console.log("AuthContext: User profile fetched successfully:", response.data.email, "Preferences:", response.data.preferences);
          // Add a small delay to ensure state is properly set
          setTimeout(() => setLoading(false), 100);
        } catch (error) {
          console.error("AuthContext: Failed to fetch user profile or invalid token:", error.response?.data?.message || error.message);
          const status = error.response?.status;
          if (status === 401 || status === 403) {
            console.error("AuthContext: Invalid/expired token, logging out.");
            logout();
          } else {
            // Network or other error: keep user, but show warning
            setUser(null);
            console.error("AuthContext: Network or unknown error during profile fetch:", error.message);
          }
        }
      } else {
        setUser(null);
        console.log("AuthContext: No token found. User not logged in.");
        // Add a small delay to ensure state is properly set
        setTimeout(() => setLoading(false), 100);
      }
    };

    checkUserSession();
  }, []); // Empty dependency array: runs only once on mount

  const login = async (userData, token, rememberMe) => {
    console.log("AuthContext: Login called with rememberMe:", rememberMe, "token length:", token?.length);
    
    if (token) {
      // Always store in both places for redundancy
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
      console.log("AuthContext: Token saved to both localStorage and sessionStorage.");
      
      // Check if backend URL is available
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log("AuthContext: Backend URL available for login:", !!backendUrl);
      
      if (!backendUrl) {
        console.warn("AuthContext: Backend URL not set. Using provided user data.");
        setUser(userData);
        setLoading(false);
        return;
      }
      
      try {
        // Use the custom axios instance here as well
        console.log("AuthContext: Attempting to fetch user profile after login...");
        const response = await axios.get('/api/auth/profile');
        setUser(response.data);
        console.log("AuthContext: User profile fetched after login:", response.data.email, "Preferences:", response.data.preferences);
        return;
      } catch (error) {
        console.error("AuthContext: Failed to fetch user profile after login:", error.message);
        console.log("AuthContext: Using provided user data as fallback");
        setUser(userData); // fallback
        return;
      }
    }
    setUser(userData);
  };

  const logout = () => {
    console.log("AuthContext: Logout called");
    setUser(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    console.log("AuthContext: User logged out, tokens cleared.");
  };

  // New function to update only the user data without changing token
  const updateUser = (newUserData) => {
    setUser(newUserData);
    console.log("AuthContext: User data updated.", newUserData.email, "Preferences:", newUserData.preferences);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}