import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { lunaToast } from "@/lib/lunaToast";
import { AuthLayout, Field } from "@/components/AuthLayout";
import { authApi } from "@/lib/api/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — MindMate" },
      { name: "description", content: "Choose a new password for your MindMate account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(Boolean(new URLSearchParams(window.location.search).get("token")));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      const token = new URLSearchParams(window.location.search).get("token");
      if (!token) throw new Error("Reset link is missing or invalid");
      await authApi.resetPassword({ token, password });
      lunaToast("Password updated 🎉");
      navigate({ to: "/signin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Pick something memorable but strong."
      footer={
        <>
          Back to{" "}
          <Link to="/signin" className="font-semibold text-primary">
            Sign in
          </Link>
        </>
      }
    >
      <div className="glass-strong rounded-3xl p-5">
        {!ready ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Verifying your reset link…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="New password" icon={Lock}>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>
            <Field label="Confirm password" icon={Lock}>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple/30 disabled:opacity-60"
            >
              Update password
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
