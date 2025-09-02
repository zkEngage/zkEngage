import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import ZkEngageLogo from "@/assets/logo";

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Home", id: "home" },
    { path: "/quests", icon: "fas fa-map", label: "Quests", id: "quests", hasNotification: true },
    { path: "/achievements", icon: "fas fa-trophy", label: "Achievements", id: "achievements" },
    { path: "/leaderboard", icon: "fas fa-crown", label: "Leaderboard", id: "leaderboard" },
    { path: "/social", icon: "fas fa-users", label: "Social", id: "social" },
    { path: "/profile", icon: "fas fa-user", label: "Profile", id: "profile" },
    { path: "/settings", icon: "fas fa-cog", label: "Settings", id: "settings" },
  ];

  if (user?.isAdmin) {
    navItems.push({
      path: "/admin",
      icon: "fas fa-shield-alt",
      label: "Admin",
      id: "admin",
    });
  }

  const isActive = (path: string, id: string) => {
    if (currentPage) return currentPage === id;
    return location === path || (path === "/" && location === "/");
  };

  return (
    <aside 
      className="sidebar-nav w-64 bg-card border-r border-border fixed left-0 top-0 h-full z-40 md:relative md:translate-x-0"
      data-testid="sidebar"
    >
      <div className="p-6">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 mb-8"
        >
          <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
            <ZkEngageLogo className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text" data-testid="text-app-title">
            zkEngage
          </span>
        </motion.div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={item.path}>
                <div
                  className={`nav-item flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative ${
                    isActive(item.path, item.id)
                      ? "active text-foreground bg-muted"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  data-testid={`nav-${item.id}`}
                >
                  <i className={`${item.icon} text-lg w-5`} />
                  <span className="font-medium">{item.label}</span>
                  {item.hasNotification && (
                    <div className="notification-dot absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-primary">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" data-testid="text-sidebar-user-name">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground" data-testid="text-sidebar-user-level">
                  Level {user?.level || 1}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-xs"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
