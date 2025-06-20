import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode to safely decode tokens

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Default to true, means we are checking auth status

  useEffect(() => {
    console.log("AuthContext: useEffect triggered for session check.");
    const checkUserSession = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            console.warn("AuthContext: Token expired. Logging out.");
            logout();
            return; // Exit after logout, which sets loading to false
          }

          // Fetch full user profile from backend
          // Ensure axios instance or direct call is configured to hit http://localhost:5002/api
          const response = await axios.get('http://localhost:5002/api/auth/profile', { // Explicitly use full URL
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(response.data);
          console.log("AuthContext: User profile fetched successfully:", response.data.email, "Preferences:", response.data.preferences);
        } catch (error) {
          console.error("AuthContext: Failed to fetch user profile or invalid token:", error.response?.data?.message || error.message);
          logout(); // Clear token if profile fetch fails or invalid
        }
      } else {
        setUser(null);
        console.log("AuthContext: No token found. User not logged in.");
      }
      setLoading(false); // Authentication check is complete
    };

    checkUserSession();
  }, []); // Empty dependency array: runs only once on mount

  const login = async (userData, token, rememberMe) => {
    if (token) {
      if (rememberMe) {
        localStorage.setItem('token', token);
        console.log("AuthContext: Token saved to localStorage.");
      } else {
        sessionStorage.setItem('token', token);
        console.log("AuthContext: Token saved to sessionStorage.");
      }
      try {
        const response = await axios.get('http://localhost:5002/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        console.log("AuthContext: User profile fetched after login:", response.data.email, "Preferences:", response.data.preferences);
        return;
      } catch (error) {
        setUser(userData); // fallback
        console.error("AuthContext: Failed to fetch user profile after login:", error.message);
        return;
      }
    }
    setUser(userData);
  };

  const logout = () => {
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