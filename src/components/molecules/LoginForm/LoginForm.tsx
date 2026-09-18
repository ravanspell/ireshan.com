'use client';

import { useState } from 'react';
import { unstable_rethrow } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/atoms/Input/Input';
import { loginSchema, LoginFormData } from '@dtos/auth.dto';

export interface LoginFormProps {
  /**
   * Callback function called when the form is submitted with valid data
   * @param credentials - Object containing email and password
   * @returns Promise resolving to an object with optional errors or error message
   */
  onSubmit: (
    credentials: LoginFormData,
  ) => Promise<{ errors?: Record<string, string>; error?: string }>;
}

/**
 * LoginForm Component
 *
 * A complete login form with client-side validation using React Hook Form and Zod.
 */
const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [serverError, setServerError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validates when user leaves a field (better UX)
  });

  /**
   * Handles form submission
   * - Clears previous server errors
   * - Calls the onSubmit callback with typed data
   * - Displays server errors if authentication fails
   *
   * @param data - Validated form data from React Hook Form
   */
  const onFormSubmit = async (data: LoginFormData): Promise<void> => {
    setServerError(undefined);
    setIsSubmitting(true);

    try {
      // Call the server action with typed data
      const result = await onSubmit(data);

      // Display server error if authentication fails
      if (result?.error) {
        setServerError(result.error);
      }
    } catch (error) {
      // A successful login redirects from the server action, and Next.js
      // rejects the client-side action promise with a NEXT_REDIRECT error.
      // Rethrow it so the router navigates instead of showing an error.
      unstable_rethrow(error);
      setServerError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-card rounded-lg border border-border shadow-lg">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          disabled={isSubmitting}
          error={errors.email?.message}
          testId="login-email"
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          disabled={isSubmitting}
          error={errors.password?.message}
          testId="login-password"
          {...register('password')}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full
            relative
            justify-center
            inline-flex
            items-center
            gap-2
            text-center
            font-medium
            rounded-md
            outline-none
            transition-all
            border
            text-primary-foreground
            bg-primary
            hover:bg-primary/90
            border-primary
            focus-visible:ring-2
            focus-visible:ring-ring
            px-4
            py-2.5
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
          data-testid="login-submit"
        >
          <svg
            className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            {isSubmitting ? (
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
            ) : null}
            {isSubmitting ? (
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                stroke="currentColor"
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            )}
          </svg>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
