import React from 'react';

const ErrorMessage = ({ message }) => {
  return message ? (
    <div className="text-red-500 text-sm mt-1">{message}</div>
  ) : null;
};

export default ErrorMessage;