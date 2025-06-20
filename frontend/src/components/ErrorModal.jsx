import React from 'react';

const ErrorModal = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md">
        <h3 className="text-lg font-bold text-red-500">Error</h3>
        <p className="my-4">{error}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;