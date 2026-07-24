import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthDetails = {
  client?: { name?: string; client_id?: string; redirect_uris?: string[] } | null;
  scope?: string;
  redirect_url?: string;
  redirect_to?: string;
};
type OAuthResult = { data: OAuthDetails | null; error: { message: string } | null };
const oauth = () =>
  (supabase.auth as unknown as {
    oauth: {
      getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
      approveAuthorization: (id: string) => Promise<OAuthResult>;
      denyAuthorization: (id: string) => Promise<OAuthResult>;
    };
  }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/signin", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center p-6 text-center">
      <h1 className="text-lg font-semibold">Couldn't load this authorization</h1>
      <p className="mt-2 text-sm text-muted-foreground">{String((error as Error)?.message ?? error)}</p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "an app";
  const scopes = details?.scope?.split(/\s+/).filter(Boolean) ?? [];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <div className="glass-strong rounded-3xl p-6">
        <h1 className="text-xl font-semibold">Connect {clientName} to MindMate</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This lets <span className="font-medium text-foreground">{clientName}</span> use MindMate as
          you — reading your Luna chats and profile, and sending messages to Luna on your behalf.
        </p>

        {scopes.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {scopes.map((s: string) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          This does not bypass MindMate's permissions — data stays scoped to your account.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="glass flex-1 rounded-2xl py-3 text-sm font-semibold disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 rounded-2xl gradient-primary py-3 text-sm font-semibold text-white shadow-lg shadow-purple/30 disabled:opacity-60"
          >
            {busy ? "Connecting…" : "Approve"}
          </button>
        </div>
      </div>
    </main>
  );
}
