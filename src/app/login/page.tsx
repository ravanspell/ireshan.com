import LoginForm from '@/components/molecules/LoginForm/LoginForm';
import { loginAction } from '@/app/actions/auth';
import { NEXT_PARAM, resolveNextPath } from '@/lib/auth/redirect';

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Login Page
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const raw = params[NEXT_PARAM];
  // A repeated query parameter (?next=a&next=b) arrives as an array.
  const next = resolveNextPath(Array.isArray(raw) ? raw[0] : raw);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <LoginForm onSubmit={loginAction.bind(null, next)} />
    </div>
  );
}
