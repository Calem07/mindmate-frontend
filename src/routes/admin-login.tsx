import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout, Field } from "@/components/AuthLayout";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin login — MindMate" },
      { name: "description", content: "Restricted access for MindMate administrators." },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("No user returned");

      // Verify admin role via user_roles table
      const { data: roles, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (roleErr) throw roleErr;
      if (!roles) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }

      toast.success("Welcome, admin 🛡️");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Admin sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Admin login"
      subtitle="Restricted area. Authorized personnel only."
      footer={
        <>
          Not an admin?{" "}
          <Link to="/signin" className="font-semibold text-primary">Regular sign in</Link>
        </>
      }
    >
      <div className="glass-strong rounded-3xl p-5">
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-purple/10 px-4 py-3 text-[11px] text-purple">
          <Shield className="h-4 w-4 shrink-0" />
          <span>Admin credentials required. Unauthorized attempts are logged.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Admin email" icon={Mail}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </Field>
          <Field label="Password" icon={Lock}>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your admin password"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple/30 disabled:opacity-60"
          >
            Sign in as admin
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
