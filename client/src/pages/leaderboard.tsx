import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, Users } from "lucide-react";

interface LeaderboardUser {
  id: string;
  username: string;
  twitterUsername: string;
  profileImage?: string;
  level: number;
  xp: number;
  totalProofs: number;
  rank: number;
}

interface LeaderboardStats {
  totalUsers: number;
  totalProofs: number;
  avgLevel: number;
  topUser: LeaderboardUser | null;
}

export default function LeaderboardPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all");

  const { data: leaderboard, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard", timeframe],
  });

  const { data: stats } = useQuery<LeaderboardStats>({
    queryKey: ["/api/leaderboard/stats"],
  });

  const timeframeOptions = [
    { value: "all", label: "All Time", active: timeframe === "all" },
    { value: "month", label: "This Month", active: timeframe === "month" },
    { value: "week", label: "This Week", active: timeframe === "week" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header 
          onConnectWallet={() => setShowAuthModal(true)}
          title="Leaderboard"
          description="Top performers in the zkEngage community"
        />
        
        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-total-proofs">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Proofs</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalProofs?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <Trophy className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-avg-level">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Average Level</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.avgLevel?.toFixed(1) || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Medal className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-top-user">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Leader</p>
                    <p className="text-lg font-bold text-foreground truncate">
                      {stats?.topUser?.username || "None"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stats?.topUser?.xp?.toLocaleString() || "0"} XP
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Award className="text-yellow-500 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Top Performers</CardTitle>
                  <p className="text-muted-foreground">
                    Rankings based on verified zkProof completions
                  </p>
                </div>
                <div className="flex gap-2">
                  {timeframeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={option.active ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe(option.value as any)}
                      className={option.active ? "zkverify-gradient" : ""}
                      data-testid={`filter-${option.value}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <LeaderboardTable 
                data={leaderboard || []} 
                isLoading={isLoading}
                timeframe={timeframe}
              />
            </CardContent>
          </Card>

          {/* Achievement Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <p className="text-muted-foreground">Latest zkProof verifications</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* This would show recent proof activities */}
                  <div className="text-center py-8">
                    <Trophy className="mx-auto text-muted-foreground mb-2" size={32} />
                    <p className="text-muted-foreground">Recent activities will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hall of Fame</CardTitle>
                <p className="text-muted-foreground">All-time achievements</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                    <Trophy className="mx-auto text-yellow-500 mb-2" size={24} />
                    <p className="font-semibold text-sm">Most Proofs</p>
                    <p className="text-xs text-muted-foreground">
                      {stats?.topUser?.totalProofs || 0} zkProofs
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
                    <Medal className="mx-auto text-purple-500 mb-2" size={24} />
                    <p className="font-semibold text-sm">Highest Level</p>
                    <p className="text-xs text-muted-foreground">
                      Level {stats?.topUser?.level || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
