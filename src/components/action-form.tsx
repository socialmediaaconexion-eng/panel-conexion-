"use client";

import { useActionState } from "react";

type Estado = { error?: string; ok?: string } | null;

// Form wired to a server action that returns { error } or { ok }; shows the message under the fields.
export function ActionForm({
  action,
  children,
  submit,
  className = "stack",
}: {
  action: (prev: Estado, formData: FormData) => Promise<Estado>;
  children: React.ReactNode;
  submit: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children}
      <button type="submit" disabled={pending}>{pending ? "Guardando…" : submit}</button>
      {state?.error && <div className="alert error" role="alert">{state.error}</div>}
      {state?.ok && <div className="alert ok" role="status">{state.ok}</div>}
    </form>
  );
}
