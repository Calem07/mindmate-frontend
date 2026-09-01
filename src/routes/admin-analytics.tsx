import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { LunaAvatar } from "@/components/LunaAvatar";
import { LoadingState, ErrorState } from "@/components/StateViews";
import { useAuth } from "@/components/AuthProvider";
import { adminAnalyticsApi, type UsageAnalytics } from "@/lib/api/adminAnalytics";

export const Route = createFileRoute("/admin-analytics")({
  head: () => ({
    meta: [
      { title: "Usage analytics — MindMate" },
      {
        name: "description",
        content: "Private aggregate usage analytics for MindMate administrators.",
      },
    ],
  }),
  component: AdminAnalytics,
});

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function AdminAnalytics() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState(30);
  const [data, setData] = useState<UsageAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.roles?.includes("ADMIN") ?? false;

  const load = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (range - 1));
    setError(null);
    void adminAnalyticsApi
      .usage({ from: isoDate(from), to: isoDate(to) })
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load usage analytics"),
      );
  };

  useEffect(() => {
    if (!loading && !isAdmin) void navigate({ to: "/", replace: true });
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) load();
    // The selected range is intentionally the only reload dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, range]);

  const maxFeature = useMemo(
    () => Math.max(1, ...(data?.features.map((item) => item.count) ?? [])),
    [data],
  );

  if (loading || !isAdmin) return <div className="min-h-[100dvh] bg-background" aria-busy="true" />;

  return (
    <main className="min-h-[100dvh] bg-background px-4 py-6 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LunaAvatar size="sm" mood="focused" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-purple">
                MindMate Admin
              </p>
              <h1 className="text-2xl font-bold tracking-tight">Usage analytics</h1>
              <p className="text-sm text-muted-foreground">
                Aggregate product activity. No private content is shown.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="analytics-range">
              Analytics range
            </label>
            <select
              id="analytics-range"
              value={range}
              onChange={(event) => setRange(Number(event.target.value))}
              className="glass rounded-xl px-3 py-2 text-sm outline-none"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              type="button"
              onClick={load}
              className="glass flex h-10 w-10 items-center justify-center rounded-xl"
              aria-label="Refresh analytics"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {error ? (
          <ErrorState title="Analytics unavailable" body={error} onRetry={load} />
        ) : !data ? (
          <LoadingState label="Luna is preparing the numbers…" />
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Metric icon={Users} label="Total users" value={data.overview.totalUsers} />
              <Metric
                icon={ShieldCheck}
                label="Active accounts"
                value={data.overview.activeUsers}
              />
              <Metric icon={Users} label="New in range" value={data.overview.newUsers} />
              <Metric
                icon={BarChart3}
                label="Active in range"
                value={data.overview.activeUsersInPeriod}
              />
              <Metric
                icon={BarChart3}
                label="Interactions"
                value={data.overview.totalInteractions}
              />
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="glass-strong rounded-3xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Daily activity</h2>
                    <p className="text-xs text-muted-foreground">Active users and core actions</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {data.from} to {data.to}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] text-left text-xs">
                    <thead className="border-b border-border text-muted-foreground">
                      <tr>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Active</th>
                        <th className="pb-3">Check-ins</th>
                        <th className="pb-3">Habits</th>
                        <th className="pb-3">Luna</th>
                        <th className="pb-3">Journal</th>
                        <th className="pb-3">Focus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.daily
                        .slice()
                        .reverse()
                        .map((day) => (
                          <tr key={day.date} className="border-b border-border/50 last:border-0">
                            <td className="py-3 font-medium">{day.date}</td>
                            <td>{day.activeUsers}</td>
                            <td>{day.checkIns}</td>
                            <td>{day.habitCompletions}</td>
                            <td>{day.lunaMessages}</td>
                            <td>{day.journalEntries}</td>
                            <td>{day.focusSessions}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="glass-strong rounded-3xl p-5">
                <h2 className="font-semibold">Feature usage</h2>
                <p className="mb-5 text-xs text-muted-foreground">
                  Actions recorded in the selected range
                </p>
                <div className="space-y-4">
                  {data.features.map((item) => (
                    <div key={item.feature}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>{item.feature}</span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full gradient-primary"
                          style={{ width: `${(item.count / maxFeature) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to MindMate
        </Link>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="glass-strong rounded-2xl p-4">
      <Icon className="mb-3 h-4 w-4 text-primary" />
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
