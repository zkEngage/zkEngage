import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  Shield, 
  Calendar,
  Download,
  BarChart3
} from "lucide-react";

interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
  };
  proofMetrics: {
    totalProofs: number;
    successfulProofs: number;
    failedProofs: number;
    avgProofTime: number;
  };
  engagementMetrics: {
    tasksCompleted: number;
    challengesActive: number;
    achievementsUnlocked: number;
    avgEngagementScore: number;
  };
  timeSeriesData: Array<{
    date: string;
    users: number;
    proofs: number;
    engagement: number;
  }>;
}

export function AnalyticsPanel() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [metric, setMetric] = useState<"users" | "proofs" | "engagement">("users");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics", timeframe],
    queryFn: async () => {
      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`);
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const timeframeOptions = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
  ];

  const metricOptions = [
    { value: "users", label: "Users", icon: Users },
    { value: "proofs", label: "zkProofs", icon: Shield },
    { value: "engagement", label: "Engagement", icon: Activity },
  ];

  const exportData = () => {
    // This would trigger a download of analytics data
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Date,Users,Proofs,Engagement\n" +
      (analytics?.timeSeriesData.map(row => 
        `${row.date},${row.users},${row.proofs},${row.engagement}`
      ).join("\n") || "");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zkEngage-analytics-${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="text-green-500" size={16} />
    ) : (
      <TrendingDown className="text-red-500" size={16} />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? "text-green-500" : "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="loading-shimmer h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <p className="text-muted-foreground">
                Track platform performance and user engagement
              </p>
            </div>
            
            <div className="flex gap-2">
              <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                <SelectTrigger className="w-40" data-testid="timeframe-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={exportData} data-testid="export-data">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card" data-testid="metric-total-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.userMetrics.totalUsers?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Users className="text-primary text-xl" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon(analytics?.userMetrics.userGrowth || 0)}
              <span className={`text-sm ${getTrendColor(analytics?.userMetrics.userGrowth || 0)}`}>
                {analytics?.userMetrics.userGrowth?.toFixed(1) || "0"}% vs last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" data-testid="metric-active-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Active Users</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.userMetrics.activeUsers?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Activity className="text-secondary text-xl" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="outline" className="text-xs">
                {analytics?.userMetrics.newUsers || 0} new this period
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" data-testid="metric-total-proofs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">zkProofs Generated</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.proofMetrics.totalProofs?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                <Shield className="text-accent text-xl" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                {((analytics?.proofMetrics.successfulProofs || 0) / (analytics?.proofMetrics.totalProofs || 1) * 100).toFixed(1)}% success
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card" data-testid="metric-engagement">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Engagement Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {analytics?.engagementMetrics.avgEngagementScore?.toFixed(1) || "0"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-green-500 text-xl" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-muted-foreground">
                {analytics?.engagementMetrics.tasksCompleted || 0} tasks completed
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              User Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Total Registrations</span>
                <span className="font-bold">{analytics?.userMetrics.totalUsers || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Daily Active Users</span>
                <span className="font-bold">{analytics?.userMetrics.activeUsers || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">New Users ({timeframe})</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{analytics?.userMetrics.newUsers || 0}</span>
                  {getTrendIcon(analytics?.userMetrics.userGrowth || 0)}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Growth Rate</span>
                <span className={`font-bold ${getTrendColor(analytics?.userMetrics.userGrowth || 0)}`}>
                  {analytics?.userMetrics.userGrowth?.toFixed(1) || "0"}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* zkProof Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              zkProof Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Total Proofs</span>
                <span className="font-bold">{analytics?.proofMetrics.totalProofs || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Successful Verifications</span>
                <span className="font-bold text-green-500">
                  {analytics?.proofMetrics.successfulProofs || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Failed Verifications</span>
                <span className="font-bold text-red-500">
                  {analytics?.proofMetrics.failedProofs || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Avg Proof Time</span>
                <span className="font-bold">
                  {analytics?.proofMetrics.avgProofTime?.toFixed(2) || "0"}s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-2xl font-bold text-foreground mb-2">
                {analytics?.engagementMetrics.tasksCompleted || 0}
              </div>
              <div className="text-sm text-muted-foreground mb-2">Tasks Completed</div>
              <Badge className="task-completed">Active</Badge>
            </div>
            
            <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/20">
              <div className="text-2xl font-bold text-foreground mb-2">
                {analytics?.engagementMetrics.challengesActive || 0}
              </div>
              <div className="text-sm text-muted-foreground mb-2">Active Challenges</div>
              <Badge className="task-active">Live</Badge>
            </div>
            
            <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="text-2xl font-bold text-foreground mb-2">
                {analytics?.engagementMetrics.achievementsUnlocked || 0}
              </div>
              <div className="text-sm text-muted-foreground mb-2">Achievements Unlocked</div>
              <Badge variant="outline">Total</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Series Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trends Over Time</CardTitle>
            <Select value={metric} onValueChange={(value: any) => setMetric(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">Chart Visualization</h3>
            <p className="text-muted-foreground mb-4">
              Interactive charts showing {metric} trends over {timeframe} will be displayed here
            </p>
            <Badge variant="outline">Chart integration coming soon</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
