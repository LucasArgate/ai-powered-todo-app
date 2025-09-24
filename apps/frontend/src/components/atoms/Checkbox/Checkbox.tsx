import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const checkboxClasses = `
    h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded
    ${error ? 'border-red-300' : ''}
    ${className}
  `.trim();

  return (
    <div className="flex items-center">
      <input
        id={checkboxId}
        type="checkbox"
        className={checkboxClasses}
        {...props}
      />
      {label && (
        <label htmlFor={checkboxId} className="ml-2 block text-sm text-secondary-700">
          {label}
        </label>
      )}
      {error && (
        <p className="ml-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Checkbox;
