import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          block w-full px-3 py-2 border border-border-light rounded-xl 
          bg-surface-light text-text-primary-light placeholder-text-secondary-light
          focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent
          dark:border-border-dark dark:bg-surface-dark dark:text-text-primary-dark 
          dark:placeholder-text-secondary-dark dark:focus:ring-primary-dark
          ${error ? 'border-danger-light dark:border-danger-dark' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-light dark:text-danger-dark">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;