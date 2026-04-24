import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-6 py-16">
      <SignIn appearance={{ elements: { rootBox: 'mx-auto' } }} />
    </main>
  );
}
