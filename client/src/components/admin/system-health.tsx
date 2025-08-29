import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  Server, 
  Database, 
  Wifi, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { SiX } from "react-icons/si";

interface SystemHealthData {
  zkVerify: {
    connected: boolean;
    responseTime?: number;
    lastVerification?: string;
    totalProofs?: number;
    successRate?: number;
    apiKey: string;
  };
  twitter: {
    connected: boolean;
    rateLimitRemaining?: number;
    rateLimitReset?: number;
    apiVersion: string;
  };
  database: {
    connected: boolean;
    users?: number;
    proofs?: number;
    timestamp?: string;
    error?: string;
  };
}

export function SystemHealth() {
  const { data: healthData, isLoading, refetch } = useQuery<SystemHealthData>({
    queryKey: ["/api/admin/system-health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (connected: boolean) => {
    return connected ? (
      <CheckCircle className="text-green-500" size={20} />
    ) : (
      <AlertTriangle className="text-red-500" size={20} />
    );
  };

  const getStatusColor = (connected: boolean) => {
    return connected ? "health-online" : "health-offline";
  };

  const formatLastReset = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Health Monitor</CardTitle>
              <p className="text-muted-foreground">
                Real-time status of all system components
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              data-testid="refresh-health"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* zkVerify Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server size={20} />
            zkVerify Blockchain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${getStatusColor(healthData?.zkVerify.connected || false)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData?.zkVerify.connected || false)}
                <span className="font-medium">
                  {healthData?.zkVerify.connected ? "Connected" : "Offline"}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                API: {healthData?.zkVerify.apiKey || "Not configured"}
              </Badge>
            </div>

            {healthData?.zkVerify.connected && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="zkverify-response-time">
                  <div className="text-lg font-bold">
                    {healthData.zkVerify.responseTime || 0}ms
                  </div>
                  <div className="text-xs text-muted-foreground">Response Time</div>
                </div>
                
                <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="zkverify-total-proofs">
                  <div className="text-lg font-bold">
                    {healthData.zkVerify.totalProofs?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Proofs</div>
                </div>
                
                <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="zkverify-success-rate">
                  <div className="text-lg font-bold">
                    {healthData.zkVerify.successRate?.toFixed(1) || "0"}%
                  </div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </div>
                
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <Button size="sm" variant="outline" className="w-full">
                    <ExternalLink size={14} className="mr-1" />
                    Explorer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Twitter API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SiX size={20} />
            Twitter/X API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${getStatusColor(healthData?.twitter.connected || false)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData?.twitter.connected || false)}
                <span className="font-medium">
                  {healthData?.twitter.connected ? "Online" : "Offline"}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                API {healthData?.twitter.apiVersion || "v2"}
              </Badge>
            </div>

            {healthData?.twitter.connected && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Rate Limit Status</span>
                  <span className="text-sm font-medium">
                    {healthData.twitter.rateLimitRemaining || 0}/900 requests
                  </span>
                </div>
                <Progress 
                  value={((healthData.twitter.rateLimitRemaining || 0) / 900) * 100} 
                  className="h-2"
                  data-testid="twitter-rate-limit-progress"
                />
                <div className="text-xs text-muted-foreground">
                  Resets at: {formatLastReset(healthData.twitter.rateLimitReset)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={20} />
            PostgreSQL Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg ${getStatusColor(healthData?.database.connected || false)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData?.database.connected || false)}
                <span className="font-medium">
                  {healthData?.database.connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              {healthData?.database.timestamp && (
                <Badge variant="outline" className="text-xs">
                  Last check: {new Date(healthData.database.timestamp).toLocaleTimeString()}
                </Badge>
              )}
            </div>

            {healthData?.database.connected ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="database-users">
                  <div className="text-lg font-bold">
                    {healthData.database.users?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
                
                <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="database-proofs">
                  <div className="text-lg font-bold">
                    {healthData.database.proofs?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-muted-foreground">Proofs</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-400">
                {healthData?.database.error || "Connection failed"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {healthData?.zkVerify.responseTime || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
              <Progress 
                value={Math.min(100, Math.max(0, 100 - ((healthData?.zkVerify.responseTime || 0) / 10)))} 
                className="h-2 mt-2"
              />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {healthData?.zkVerify.successRate?.toFixed(1) || "0"}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <Progress 
                value={healthData?.zkVerify.successRate || 0} 
                className="h-2 mt-2"
              />
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {Math.round(((healthData?.twitter.rateLimitRemaining || 0) / 900) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">API Quota</div>
              <Progress 
                value={((healthData?.twitter.rateLimitRemaining || 0) / 900) * 100} 
                className="h-2 mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
