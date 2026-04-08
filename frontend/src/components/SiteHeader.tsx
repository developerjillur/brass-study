"use client";

import { useEffect, useState } from "react";
import { Sun, Shield, LogIn, LayoutDashboard, LogOut, MessageSquare, Bell, UserCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  metadata: Record<string, any>;
}

const SiteHeader = () => {
  const { user, userRole, signOut } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Unread messages
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    const fetchUnread = async () => {
      try {
        const messages = await apiClient.get("/api/messages");
        const unread = (messages as any[] ?? []).filter((m: any) => !m.is_read && m.recipient_id === user.id);
        setUnreadCount(unread.length);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnread();


  }, [user]);

  // Notifications
  useEffect(() => {
    if (!user) { setNotifCount(0); setNotifications([]); return; }

    const fetchNotifications = async () => {
      try {
        const data = await apiClient.get("/api/notifications/mine");
        const unread = (data as any[] ?? []).filter((n: any) => !n.is_read);
        setNotifications(unread.slice(0, 10) as Notification[]);
        setNotifCount(unread.length);
      } catch {
        setNotifications([]);
        setNotifCount(0);
      }
    };

    fetchNotifications();


  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    try {
      await apiClient.put("/api/notifications/mark-all-read", {});
    } catch {
      // ignore
    }
    setNotifications([]);
    setNotifCount(0);
  };

  const handleNotificationClick = async (notif: Notification) => {
    await apiClient.put(`/api/notifications/${notif.id}`, { is_read: true });
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    setNotifCount((prev) => Math.max(0, prev - 1));
    setPopoverOpen(false);
    if (notif.type === "assessment_due") {
      router.push("/assessments");
    }
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="header-accent" />
      <div className="bg-card/95 backdrop-blur-sm border-b border-border shadow-soft">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary shadow-soft p-1.5">
              <img src="/flower-of-life.svg" alt="" className="w-full h-full invert" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground leading-tight tracking-tight">PBM Study</span>
              <span className="text-[11px] text-muted-foreground leading-tight hidden sm:block font-medium">Quantum University</span>
            </div>
          </Link>

        <nav className="flex items-center gap-2 md:gap-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">About Study</span>
          </Link>

          {/* Accessibility toolbar */}
          <AccessibilityToolbar />

          {user ? (
            <>
              {/* Notification bell */}
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="relative flex items-center justify-center w-9 h-9 rounded-lg text-foreground hover:bg-secondary transition-colors">
                    <Bell className="w-4 h-4" />
                    {notifCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] justify-center">
                        {notifCount}
                      </Badge>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-3 border-b border-border">
                    <h4 className="text-sm font-bold text-foreground">Notifications</h4>
                    {notifCount > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="max-h-[300px]">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No new notifications</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                          >
                            <p className="text-sm font-medium text-foreground">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notif.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <Link
                href="/messages"
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-sm text-foreground">
                <UserCircle className="w-4 h-4 text-primary" />
                <span className="font-medium max-w-[120px] truncate">
                  {user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "User"}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Study Login</span>
            </Link>
          )}
        </nav>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
