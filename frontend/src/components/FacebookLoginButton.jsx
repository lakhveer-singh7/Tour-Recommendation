import React from 'react';
import { FacebookLoginButton } from 'react-social-login-buttons';

const CustomFacebookLoginButton = ({ onClick }) => {
  return (
    <FacebookLoginButton 
      onClick={onClick}
      text="Continue with Facebook"
    />
  );
};

export default CustomFacebookLoginButton;