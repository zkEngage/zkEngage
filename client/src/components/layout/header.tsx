import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ui/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { Moon, Sun, Wifi, WifiOff } from "lucide-react";

interface ZkVerifyStatus {
  connected: boolean;
  responseTime?: number;
}

interface HeaderProps {
  onConnectWallet: () => void;
  title?: string;
  description?: string;
}

export function Header({ 
  onConnectWallet, 
  title = "Dashboard", 
  description = "Track verified achievements and zkProof completions" 
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  
  const { data: zkVerifyStatus } = useQuery<ZkVerifyStatus>({
    queryKey: ["/api/zkverify/status"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { data: user } = useQuery({
    queryKey: ["/api/users/me"],
  });

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="bg-card border-b border-border p-6 flex items-center justify-between">
      <div className="flex items-center gap-4" data-testid="header-title">
        <img src={require('../../assets/zkEngagelogo.png')} alt="zkEngage Logo" className="h-10 w-10 object-contain" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
  {/* Banner Image (optional, can be moved elsewhere) */}
  <img src={require('../../assets/zkEngagebanner.png')} alt="zkEngage Banner" className="h-10 object-contain hidden md:block" />
  {/* zkVerify Status Indicator */}
        <div 
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
            zkVerifyStatus?.connected 
              ? "bg-green-500/10 text-green-500" 
              : "bg-red-500/10 text-red-500"
          }`}
          data-testid="zkverify-status"
        >
          {zkVerifyStatus?.connected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full zkproof-pulse"></div>
              <span className="text-sm font-medium">zkVerify Connected</span>
              {zkVerifyStatus.responseTime && (
                <Badge variant="outline" className="text-xs">
                  {zkVerifyStatus.responseTime}ms
                </Badge>
              )}
            </>
          ) : (
            <>
              <WifiOff size={12} />
              <span className="text-sm font-medium">zkVerify Offline</span>
            </>
          )}
        </div>
        
        {/* Theme Toggle */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={toggleTheme}
          data-testid="theme-toggle"
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
        
        {/* Connect Wallet Button */}
        {!user ? (
          <Button 
            onClick={onConnectWallet}
            className="zkverify-gradient text-primary-foreground hover:opacity-90 transition-opacity"
            data-testid="button-connect-wallet"
          >
            Connect Wallet
          </Button>
        ) : (
          <div className="flex items-center gap-2" data-testid="user-connected">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Connected
            </Badge>
            <img 
              src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}
      </div>
    </header>
  );
}
