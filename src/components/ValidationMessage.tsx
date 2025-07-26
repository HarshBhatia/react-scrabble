import React from 'react';
import './ValidationMessage.css';

interface ValidationMessageProps {
  error: string | null;
  isValidating: boolean;
}

const ValidationMessage: React.FC<ValidationMessageProps> = ({ error, isValidating }) => {
  if (isValidating) {
    return (
      <div className="validation-message validating">
        <div className="spinner"></div>
        Validating word...
      </div>
    );
  }

  if (error) {
    return (
      <div className="validation-message error">
        <span className="error-icon">⚠️</span>
        {error}
      </div>
    );
  }

  return null;
};

export default ValidationMessage;