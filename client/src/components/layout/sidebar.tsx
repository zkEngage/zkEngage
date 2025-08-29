import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  Trophy, 
  Target, 
  Medal, 
  User, 
  Settings, 
  Shield,
  BarChart3
} from "lucide-react";

interface User {
  id: string;
  username: string;
  profileImage?: string;
  level: number;
  xp: number;
  walletAddress?: string;
}

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users/me"],
  });

  const navigation = [
    { 
      name: "Dashboard", 
      href: "/", 
      icon: BarChart3,
      current: location === "/" 
    },
    { 
      name: "Leaderboard", 
      href: "/leaderboard", 
      icon: Trophy,
      current: location === "/leaderboard" 
    },
    { 
      name: "Challenges", 
      href: "/challenges", 
      icon: Target,
      current: location === "/challenges" 
    },
    { 
      name: "Achievements", 
      href: "/achievements", 
      icon: Medal,
      current: location === "/achievements" 
    },
    { 
      name: "Profile", 
      href: "/profile", 
      icon: User,
      current: location === "/profile" 
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: Settings,
      current: location === "/settings" 
    },
  ];

  // Calculate XP progress to next level
  const getXPProgress = (level: number, xp: number) => {
    const baseXP = 1000;
    const xpForCurrentLevel = Math.floor(baseXP * Math.pow(1.5, level - 1));
    const xpForNextLevel = Math.floor(baseXP * Math.pow(1.5, level));
    const currentLevelXP = xp - (level > 1 ? xpForCurrentLevel : 0);
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return Math.min((currentLevelXP / xpNeeded) * 100, 100);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8" data-testid="sidebar-logo">
        <div className="w-10 h-10 zkverify-gradient rounded-lg flex items-center justify-center">
          <Shield className="text-primary-foreground" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">zkEngage</h1>
          <p className="text-xs text-muted-foreground">Proof of Engagement</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 mb-8">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                  item.current
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-6 left-6 right-6">
        {user ? (
          <div className="bg-muted/30 rounded-lg p-4 border border-border" data-testid="user-profile">
            <div className="flex items-center gap-3 mb-3">
              <img 
                src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.username} 
                className="w-10 h-10 rounded-full"
                data-testid="user-avatar"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground text-sm truncate" data-testid="user-name">
                  @{user.username}
                </p>
                {user.walletAddress && (
                  <p className="text-xs text-muted-foreground truncate" data-testid="user-wallet">
                    {`${user.walletAddress.substring(0, 6)}...${user.walletAddress.slice(-4)}`}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Level {user.level}</span>
              <span className="text-primary font-medium" data-testid="user-xp">
                {user.xp?.toLocaleString() || 0} XP
              </span>
            </div>
            
            <Progress 
              value={getXPProgress(user.level, user.xp)} 
              className="h-1.5"
              data-testid="user-progress"
            />
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg p-4 border border-border text-center" data-testid="connect-prompt">
            <Shield className="mx-auto text-muted-foreground mb-2" size={24} />
            <p className="text-sm text-muted-foreground mb-3">Connect to get started</p>
            <Badge variant="outline" className="text-xs">
              Not Connected
            </Badge>
          </div>
        )}
      </div>
    </aside>
  );
}
