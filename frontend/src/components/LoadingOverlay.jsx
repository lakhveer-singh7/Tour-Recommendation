import React from 'react';
import { ClipLoader } from 'react-spinners';

const LoadingOverlay = ({ isLoading, text = 'Loading...' }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg text-center">
        <ClipLoader size={50} color="#3B82F6" />
        <p className="mt-4 text-xl">{text}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;