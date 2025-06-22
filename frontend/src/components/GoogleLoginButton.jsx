import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { verifyGoogleToken } from '../api/auth';

const GoogleLoginButton = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // First verify the token with our backend
      const response = await verifyGoogleToken(credentialResponse.credential);
      // If verification successful, handle new or existing user
      if (response.isNewUser && response.userData) {
        navigate('/complete-profile', { state: { userData: response.userData } });
      } else if (response.user && response.token) {
        login(response.user, response.token, true);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Google Login Failed:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.error('Google Login Failed')}
      theme="filled_blue"
      size="large"
      useOneTap
    />
  );
};

export default GoogleLoginButton;