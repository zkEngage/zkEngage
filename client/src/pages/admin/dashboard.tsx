import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TaskManager } from "@/components/admin/task-manager";
import { SystemHealth } from "@/components/admin/system-health";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useRef } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { useQuery } from "@tanstack/react-query";
import { 
  Settings, 
  Users, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database
} from "lucide-react";
import gsap from "gsap";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProofs: number;
  systemHealth: "healthy" | "warning" | "error";
  tasksActive: number;
  tasksCompleted: number;
}

interface SystemStatus {
  zkVerify: { status: "online" | "offline" | "warning"; responseTime?: number };
  twitter: { status: "online" | "offline" | "warning"; rateLimit?: number };
  database: { status: "online" | "offline" | "warning"; connections?: number };
}

export default function AdminDashboard() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "health" | "analytics">("overview");

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ["/api/admin/system-health"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const tabs = [
    { value: "overview", label: "Overview", active: activeTab === "overview" },
    { value: "tasks", label: "Task Management", active: activeTab === "tasks" },
    { value: "health", label: "System Health", active: activeTab === "health" },
    { value: "analytics", label: "Analytics", active: activeTab === "analytics" },
  ];

  const cardsRef = useRef<HTMLDivElement[]>([]);
  useEffect(() => {
    if (cardsRef.current.length > 0) {
      gsap.fromTo(cardsRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" });
    }
  }, [stats, systemStatus, activeTab]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
      case "healthy":
        return <CheckCircle className="text-green-500" size={16} />;
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case "offline":
      case "error":
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <AlertTriangle className="text-gray-500" size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header 
          onConnectWallet={() => setShowAuthModal(true)}
          title="Admin Dashboard"
          description="Manage zkEngage platform and monitor system performance"
        />
        
        <main className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div ref={el => (cardsRef.current[0] = el!)}>
              <Card className="stat-card" data-testid="stat-total-users">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.totalUsers?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Users className="text-primary text-xl" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="outline" className="text-green-500 border-green-500/30">
                      {stats?.activeUsers || 0} active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div ref={el => (cardsRef.current[1] = el!)}>
              <Card className="stat-card" data-testid="stat-total-proofs">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">zkProofs Generated</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.totalProofs?.toLocaleString() || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <Shield className="text-secondary text-xl" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="text-green-500" size={12} />
                    <span className="text-green-500 text-sm">+15% this week</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div ref={el => (cardsRef.current[2] = el!)}>
              <Card className="stat-card" data-testid="stat-tasks">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Active Tasks</p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.tasksActive || "0"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                      <Activity className="text-accent text-xl" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Badge variant="outline" className="text-blue-500 border-blue-500/30">
                      {stats?.tasksCompleted || 0} completed today
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div ref={el => (cardsRef.current[3] = el!)}>
              <Card className="stat-card" data-testid="stat-system-health">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">System Health</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(stats?.systemHealth || "error")}
                        <span className="text-lg font-bold text-foreground capitalize">
                          {stats?.systemHealth || "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Database className="text-green-500 text-xl" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Status Bar */}
          {systemStatus && (
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">System Status</h3>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.zkVerify.status)}
                      <span className="text-sm">zkVerify</span>
                      {systemStatus.zkVerify.responseTime && (
                        <Badge variant="outline" className="text-xs">
                          {systemStatus.zkVerify.responseTime}ms
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.twitter.status)}
                      <span className="text-sm">Twitter API</span>
                      {systemStatus.twitter.rateLimit && (
                        <Badge variant="outline" className="text-xs">
                          {systemStatus.twitter.rateLimit}/900
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(systemStatus.database.status)}
                      <span className="text-sm">Database</span>
                      {systemStatus.database.connections && (
                        <Badge variant="outline" className="text-xs">
                          {systemStatus.database.connections} conn
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                variant={tab.active ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.value as any)}
                className={tab.active ? "zkverify-gradient" : ""}
                data-testid={`tab-${tab.value}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={20} />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="mr-2" size={16} />
                    Create New Task
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2" size={16} />
                    View User Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="mr-2" size={16} />
                    Test zkVerify Connection
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="mr-2" size={16} />
                    Export Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">New user registered</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                          <Shield size={16} className="text-secondary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">zkProof verified</p>
                          <p className="text-xs text-muted-foreground">5 minutes ago</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                          <Activity size={16} className="text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Task completed</p>
                          <p className="text-xs text-muted-foreground">8 minutes ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "tasks" && <TaskManager />}
          {activeTab === "health" && <SystemHealth />}
          {activeTab === "analytics" && <AnalyticsPanel />}
        </main>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
