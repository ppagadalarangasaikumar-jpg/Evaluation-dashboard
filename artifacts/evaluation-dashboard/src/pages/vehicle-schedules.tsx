import { useGetVehicleSchedules, getGetVehicleSchedulesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, Zap, Building2 } from "lucide-react";

export default function VehicleSchedules() {
  const { data, isLoading } = useGetVehicleSchedules({
    query: { queryKey: getGetVehicleSchedulesQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Maintenance Scheduler</h1>
          <p className="text-muted-foreground mt-2">Knapsack-optimized task selection per depot.</p>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const efficiencyColor = (eff: number) => {
    if (eff >= 80) return "text-emerald-400";
    if (eff >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Maintenance Scheduler</h1>
        <p className="text-muted-foreground mt-2">
          Knapsack-optimized maintenance task selection across {data.depotCount} depots, {data.vehicleTaskCount} tasks available.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Depots</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.depotCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Task Pool</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.vehicleTaskCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.schedules.length > 0
                ? Math.round(data.schedules.reduce((s, d) => s + d.efficiency, 0) / data.schedules.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {data.schedules.map((depot) => (
          <Card key={depot.depotId} className="border-border/50 bg-card/50 backdrop-blur" data-testid={`card-depot-${depot.depotId}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{depot.depotName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Depot ID: {depot.depotId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    Impact: {depot.totalImpact}
                  </Badge>
                  <span className={`text-2xl font-bold ${efficiencyColor(depot.efficiency)}`}>
                    {depot.efficiency}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Mechanic Hours Used
                  </span>
                  <span className="font-medium">{depot.usedHours} / {depot.mechanicHours}h</span>
                </div>
                <Progress value={(depot.usedHours / depot.mechanicHours) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{depot.usedHours}h used</span>
                  <span>{depot.remainingHours}h remaining</span>
                </div>
              </div>

              {depot.selectedTasks.length > 0 ? (
                <div>
                  <p className="text-sm font-medium mb-3">Selected Tasks ({depot.selectedTasks.length})</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {depot.selectedTasks.map((task) => (
                      <div
                        key={task.taskId}
                        className="border border-border/60 rounded-md p-2 bg-background/50"
                        data-testid={`task-card-${task.taskId}`}
                      >
                        <p className="text-xs font-mono font-medium text-primary">{task.taskId}</p>
                        <div className="mt-1 text-xs text-muted-foreground space-y-0.5">
                          <div className="flex justify-between">
                            <span>Duration</span>
                            <span className="font-medium text-foreground">{task.duration}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Impact</span>
                            <span className="font-medium text-foreground">{task.impact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No tasks fit within available mechanic hours.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
