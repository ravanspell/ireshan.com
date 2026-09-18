import { InputHTMLAttributes, forwardRef } from 'react';

/**
 * Props for the Input component
 * Extends all standard HTML input attributes
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input field */
  label?: string;
  /** Error message displayed below the input field. When present, the input shows error styling */
  error?: string;
  /** Test identifier for automated testing */
  testId?: string;
}

/**
 * Input Component
 *
 * A reusable, accessible input field component with built-in label and error handling.
 * Uses forwardRef to work seamlessly with React Hook Form and other form libraries.
 *
 * @component
 * @example
 * // Basic usage
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 * />
 *
 * @example
 * // With error
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password is required"
 * />
 *
 * @example
 * // With React Hook Form
 * <Input
 *   label="Username"
 *   {...register('username')}
 *   error={errors.username?.message}
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, testId, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {/* Label - Only rendered if label prop is provided */}
        {label && <label className="block text-sm font-medium text-foreground mb-2">{label}</label>}

        {/* Input Field - Styled with error state support */}
        <input
          ref={ref}
          data-testid={testId}
          className={`
            w-full
            px-4
            py-2
            text-sm
            rounded-md
            border
            bg-field
            text-foreground
            border-input
            outline-none
            transition-all
            focus:border-border-stronger
            focus:ring-2
            focus:ring-ring
            ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/50' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Error Message - Only rendered if error prop is provided */}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
