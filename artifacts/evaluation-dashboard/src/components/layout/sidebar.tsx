import { useTheme } from "@/components/theme-provider";
import { Link, useLocation } from "wouter";
import { useGetNotifications, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { LayoutDashboard, Truck, Bell, FileCode2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  const { data: notificationsData } = useGetNotifications({ status: 'unread' }, {
    query: {
      queryKey: getGetNotificationsQueryKey({ status: 'unread' })
    }
  });

  const unreadCount = notificationsData?.unreadCount || 0;

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vehicle-schedules", label: "Vehicle Scheduler", icon: Truck },
    { 
      href: "/notifications", 
      label: "Priority Inbox", 
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined 
    },
    { href: "/system-design", label: "System Design", icon: FileCode2 },
  ];

  return (
    <div className="w-64 h-screen border-r border-border bg-sidebar flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary tracking-tight">EvalDash</h1>
        <p className="text-sm text-muted-foreground mt-1">Mission Control</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <Icon className="h-5 w-5" />
              <span className="flex-1">{link.label}</span>
              {link.badge !== undefined && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-bold">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <><Sun className="h-4 w-4 mr-2" /> Light Mode</>
          ) : (
            <><Moon className="h-4 w-4 mr-2" /> Dark Mode</>
          )}
        </Button>
      </div>
    </div>
  );
}
