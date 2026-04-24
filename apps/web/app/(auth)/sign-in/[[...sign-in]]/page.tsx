import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="bg-brand-bg flex min-h-screen items-center justify-center px-6 py-16">
      <SignIn appearance={{ elements: { rootBox: 'mx-auto' } }} />
    </main>
  );
}
