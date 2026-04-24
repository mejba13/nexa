import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const user = await currentUser();
  const first = user?.firstName ?? 'there';

  return (
    <div className="mx-auto max-w-5xl px-8 py-12">
      <h1 className="font-display text-4xl font-semibold">
        Welcome back, <span className="text-gradient-brand">{first}</span>
      </h1>
      <p className="text-brand-muted mt-2">
        Your AI team is ready. Pick an agent from the sidebar to start a conversation.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {['Trading', 'Music', 'Content', 'Life Coach'].map((label) => (
          <div key={label} className="border-brand-border bg-brand-elevated rounded-2xl border p-6">
            <h3 className="font-display text-lg font-semibold">{label}</h3>
            <p className="text-brand-muted mt-1 text-sm">Phase 2 — coming online.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
