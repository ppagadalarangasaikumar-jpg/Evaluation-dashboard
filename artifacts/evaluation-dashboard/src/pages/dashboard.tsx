import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Truck, Bell, Clock, Activity, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats({
    query: {
      queryKey: getGetDashboardStatsQueryKey()
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p className="text-muted-foreground mt-2">Live metrics from all evaluation systems.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Depots",
      value: stats.totalDepots,
      icon: Building2,
      description: "Active regional maintenance hubs"
    },
    {
      title: "Vehicle Tasks",
      value: stats.totalVehicleTasks,
      icon: Truck,
      description: "Scheduled maintenance operations"
    },
    {
      title: "Total Notifications",
      value: stats.totalNotifications,
      icon: Bell,
      description: "Messages across all priorities"
    },
    {
      title: "Unread Messages",
      value: stats.unreadNotifications,
      icon: AlertCircle,
      description: "Pending user attention",
      highlight: stats.unreadNotifications > 0
    },
    {
      title: "Avg Mechanic Hours",
      value: `${stats.avgMechanicHoursUsed.toFixed(1)}h`,
      icon: Clock,
      description: "Per depot utilization"
    },
    {
      title: "Avg Impact Score",
      value: stats.avgImpactScore.toFixed(0),
      icon: Activity,
      description: "Optimization effectiveness"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
        <p className="text-muted-foreground mt-2">Live metrics from all evaluation systems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className={`border-border/50 bg-card/50 backdrop-blur ${stat.highlight ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Notification Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "Placement (P3)", dot: "bg-red-500", total: stats.placementNotifications },
                { label: "Result (P2)",    dot: "bg-amber-500", total: stats.resultNotifications },
                { label: "Event (P1)",     dot: "bg-blue-500",  total: stats.eventNotifications },
              ].map(({ label, dot, total }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${dot}`} />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{total}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Unread by Type
              {stats.unreadNotifications > 0 && (
                <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {stats.unreadNotifications} total unread
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.unreadNotifications === 0 ? (
              <p className="text-sm text-muted-foreground italic">All caught up — no unread notifications.</p>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Placement (P3)", dot: "bg-red-500",    bar: "bg-red-500/60",    count: stats.unreadPlacement, total: stats.placementNotifications },
                  { label: "Result (P2)",    dot: "bg-amber-500",  bar: "bg-amber-500/60",  count: stats.unreadResult,    total: stats.resultNotifications },
                  { label: "Event (P1)",     dot: "bg-blue-500",   bar: "bg-blue-500/60",   count: stats.unreadEvent,     total: stats.eventNotifications },
                ].map(({ label, dot, bar, count, total }) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                        <span className="font-medium">{label}</span>
                      </div>
                      <span className={`font-semibold tabular-nums ${count > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                        {count} <span className="text-xs font-normal text-muted-foreground">/ {total}</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${bar}`}
                        style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
