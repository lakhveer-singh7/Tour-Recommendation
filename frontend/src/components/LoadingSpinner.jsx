import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingSpinner = ({ size = 25, color = '#3B82F6' }) => {
  return <ClipLoader size={size} color={color} />;
};

export default LoadingSpinner;