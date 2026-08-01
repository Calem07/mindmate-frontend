import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout, Field } from "@/components/AuthLayout";
import { authApi } from "@/lib/api/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset password — MindMate" },
      { name: "description", content: "Reset your MindMate password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authApi.forgotPassword({
        email,
        resetUrl: `${window.location.origin}/reset-password`,
      });
      setSent(true);
      toast.success("Check your email for the reset link 💌");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="We'll send you a link to reset it."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/signin" className="font-semibold text-primary">Sign in</Link>
        </>
      }
    >
      <div className="glass-strong rounded-3xl p-5">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="text-sm text-foreground/90">
              If <span className="font-semibold">{email}</span> has an account, a reset link is on its way.
            </p>
            <p className="text-xs text-muted-foreground">Don't forget to check spam.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Email" icon={Mail}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple/30 disabled:opacity-60"
            >
              Send reset link
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
