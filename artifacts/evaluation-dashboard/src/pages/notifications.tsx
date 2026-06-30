import { useState } from "react";
import {
  useGetNotifications,
  getGetNotificationsQueryKey,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useCreateNotification,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bell, CheckCheck, Trash2, Check, Plus, Download, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from "@/lib/export-csv";
import { Input } from "@/components/ui/input";

const TYPE_COLORS: Record<string, string> = {
  Placement: "bg-red-500/10 text-red-400 border-red-500/30",
  Result: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Event: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const TYPE_PRIORITY: Record<string, string> = {
  Placement: "P3",
  Result: "P2",
  Event: "P1",
};

const createSchema = z.object({
  studentIds: z.string().min(1, "Enter at least one student ID"),
  type: z.enum(["Placement", "Result", "Event"]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
});

type CreateForm = z.infer<typeof createSchema>;

export default function Notifications() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [createOpen, setCreateOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = {
    ...(typeFilter !== "all" ? { type: typeFilter as "Placement" | "Result" | "Event" } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as "read" | "unread" } : {}),
  };

  const { data, isLoading } = useGetNotifications(params, {
    query: { queryKey: getGetNotificationsQueryKey(params) },
  });

  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotif = useDeleteNotification();
  const createNotif = useCreateNotification();

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { studentIds: "", type: "Placement", title: "", message: "" },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });

  const handleMarkRead = (id: string) => {
    markRead.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Marked as read" }); },
    });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: (res) => {
        invalidate();
        toast({ title: `Marked ${res.updatedCount} notifications as read` });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteNotif.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Notification deleted" }); },
    });
  };

  const handleExport = () => {
    const rows = (data?.data ?? []).map((n) => ({
      "Rank": n.rank,
      "Type": n.type,
      "Priority": TYPE_PRIORITY[n.type] ?? "",
      "Student ID": n.studentId,
      "Title": n.title,
      "Message": n.message,
      "Status": n.isRead ? "Read" : "Unread",
      "Created At": new Date(n.createdAt).toLocaleString(),
      "Read At": n.readAt ? new Date(n.readAt).toLocaleString() : "",
    }));
    exportToCsv("notifications.csv", rows);
  };

  const onSubmit = (values: CreateForm) => {
    const studentIds = values.studentIds.split(",").map((s) => parseInt(s.trim(), 10)).filter(Boolean);
    createNotif.mutate(
      { data: { studentIds, type: values.type, title: values.title, message: values.message } },
      {
        onSuccess: (res) => {
          invalidate();
          setCreateOpen(false);
          form.reset();
          toast({ title: `Created ${res.createdCount} notification(s)` });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Priority Inbox</h1>
          <p className="text-muted-foreground mt-2">Notifications ranked by type priority and recency.</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  const allNotifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const query = search.trim().toLowerCase();
  const notifications = query
    ? allNotifications.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      )
    : allNotifications;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Priority Inbox</h1>
          <p className="text-muted-foreground mt-2">
            {unreadCount > 0 ? (
              <span>{unreadCount} unread — sorted by Placement &gt; Result &gt; Event, then recency.</span>
            ) : (
              <span>All notifications read.</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={notifications.length === 0}
            data-testid="button-export-notifications"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-1" /> Mark All Read
            </Button>
          )}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-notification">
                <Plus className="h-4 w-4 mr-1" /> New Notification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Notification</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student IDs (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="1042, 1043, 1044" {...field} data-testid="input-student-ids" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-notification-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Placement">Placement</SelectItem>
                            <SelectItem value="Result">Result</SelectItem>
                            <SelectItem value="Event">Event</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Notification title" {...field} data-testid="input-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notification message..." {...field} data-testid="input-message" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createNotif.isPending} data-testid="button-submit-notification">
                      {createNotif.isPending ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search title or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
            data-testid="input-search"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40" data-testid="select-type-filter">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Placement">Placement</SelectItem>
            <SelectItem value="Result">Result</SelectItem>
            <SelectItem value="Event">Event</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No notifications found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card
              key={notif.id}
              className={`border-border/50 transition-all ${notif.isRead ? "bg-card/30 opacity-70" : "bg-card/60 backdrop-blur"}`}
              data-testid={`card-notification-${notif.id}`}
            >
              <CardContent className="py-4 px-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        #{notif.rank}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold px-2 py-0.5 ${TYPE_COLORS[notif.type]}`}
                        >
                          {notif.type} · {TYPE_PRIORITY[notif.type]}
                        </Badge>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          Student #{notif.studentId}
                        </span>
                      </div>
                      <p className="font-semibold text-sm truncate">{notif.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.createdAt).toLocaleString()}
                        {notif.readAt && (
                          <span className="ml-2">· Read {new Date(notif.readAt).toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleMarkRead(notif.id)}
                        disabled={markRead.isPending}
                        data-testid={`button-mark-read-${notif.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(notif.id)}
                      disabled={deleteNotif.isPending}
                      data-testid={`button-delete-${notif.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
