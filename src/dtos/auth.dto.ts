import { z } from 'zod';

/**
 * Login Validation Schema
 *
 * Shared validation schema for login form used on both client and server.
 * Using a shared schema ensures consistent validation across the application.
 *
 * Validation Rules:
 * - Email: Required, valid email format, trimmed of whitespace
 * - Password: Required, minimum 6 characters
 *
 * @example
 * // Client-side with React Hook Form
 * const { register, handleSubmit } = useForm({
 *   resolver: zodResolver(loginSchema)
 * });
 *
 * @example
 * // Server-side validation
 * const result = loginSchema.safeParse({ email, password });
 * if (!result.success) {
 *   // Handle validation errors
 * }
 */
export const loginSchema = z.object({
  /**
   * User's email address - must be valid email format.
   *
   * Trimmed before the format check, not after: string checks run in chain
   * order, so a trailing `.trim()` would have validated the raw input and
   * rejected " user@example.com ". `z.email()` is piped rather than chained
   * because `.email()` on a string schema is deprecated in Zod 4.
   */
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .pipe(z.email('Please enter a valid email address')),

  /** User's password - minimum 6 characters */
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

/**
 * Login Form Data Type
 *
 * TypeScript type automatically inferred from the login schema.
 * Ensures type safety across the application.
 */
export type LoginFormData = z.infer<typeof loginSchema>;
