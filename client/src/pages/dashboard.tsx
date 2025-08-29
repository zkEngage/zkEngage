import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthModal } from "@/components/auth/auth-modal";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { useState } from "react";
import { Shield, Users, Clock, CheckCircle, Trophy, Share, ShieldCheck } from "lucide-react";

interface DashboardStats {
  totalProofs: number;
  activeUsers: number;
  avgProofTime: string;
  successRate: string;
}

interface RecentAchievement {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string;
}

interface ActiveChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  maxProgress: number;
  reward: number;
  status: string;
}

export default function Dashboard() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: recentAchievements } = useQuery<RecentAchievement[]>({
    queryKey: ["/api/achievements/recent"],
  });

  const { data: activeChallenges } = useQuery<ActiveChallenge[]>({
    queryKey: ["/api/challenges/active"],
  });

  if (statsLoading) {
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
        <Header onConnectWallet={() => setShowAuthModal(true)} />
        
        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="stat-card" data-testid="stat-total-proofs">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Proofs</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.totalProofs?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Shield className="text-primary text-xl" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    +12.5% from last week
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-active-users">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Users</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.activeUsers?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <Users className="text-secondary text-xl" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    +8.2% from last week
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-avg-proof-time">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Avg. Proof Time</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.avgProofTime || "0s"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Clock className="text-accent text-xl" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    -0.3s improved
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-success-rate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.successRate || "0%"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-green-500 text-xl" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    +0.1% from last week
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <p className="text-muted-foreground">Start engaging and earning zkProofs</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="zkverify-gradient h-20 text-left justify-start p-6"
                    data-testid="button-connect-twitter"
                    onClick={() => setShowAuthModal(true)}
                  >
                    <div className="flex items-center gap-4">
                      <Share className="text-2xl" />
                      <div>
                        <div className="font-semibold">Connect Twitter</div>
                        <div className="text-sm opacity-80">Link your X account to start</div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-20 text-left justify-start p-6 border-primary/20 hover:bg-primary/10"
                    data-testid="button-generate-proof"
                  >
                    <div className="flex items-center gap-4">
                      <Shield className="text-primary text-2xl" />
                      <div>
                        <div className="font-semibold">Generate zkProof</div>
                        <div className="text-sm text-muted-foreground">Test proof generation</div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-20 text-left justify-start p-6 border-secondary/20 hover:bg-secondary/10"
                    data-testid="button-view-challenges"
                  >
                    <div className="flex items-center gap-4">
                      <Trophy className="text-secondary text-2xl" />
                      <div>
                        <div className="font-semibold">View Challenges</div>
                        <div className="text-sm text-muted-foreground">Complete tasks for XP</div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="h-20 text-left justify-start p-6 border-accent/20 hover:bg-accent/10"
                    data-testid="button-view-achievements"
                  >
                    <div className="flex items-center gap-4">
                      <ShieldCheck className="text-accent text-2xl" />
                      <div>
                        <div className="font-semibold">View Achievements</div>
                        <div className="text-sm text-muted-foreground">See your badges</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Challenges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeChallenges?.slice(0, 3).map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge} 
                      compact 
                    />
                  )) || (
                    <div className="text-center py-8">
                      <Trophy className="mx-auto text-muted-foreground mb-2" size={32} />
                      <p className="text-muted-foreground">No active challenges</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        data-testid="button-browse-challenges"
                      >
                        Browse Challenges
                      </Button>
                    </div>
                  )}
                  
                  {activeChallenges && activeChallenges.length > 3 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      data-testid="button-view-all-challenges"
                    >
                      View All Challenges ({activeChallenges.length})
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentAchievements?.length ? (
                    <div className="space-y-3">
                      {recentAchievements.slice(0, 3).map((achievement) => (
                        <AchievementCard 
                          key={achievement.id}
                          achievement={achievement}
                          compact
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShieldCheck className="mx-auto text-muted-foreground mb-2" size={32} />
                      <p className="text-muted-foreground">No achievements yet</p>
                      <p className="text-sm text-muted-foreground">Complete challenges to earn badges</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* zkVerify Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">zkVerify Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full zkproof-pulse"></div>
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                      <span className="text-xs text-muted-foreground">API: 609...c1b</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-muted/30 rounded-lg" data-testid="zkverify-proof-time">
                        <p className="text-lg font-bold">1.2s</p>
                        <p className="text-xs text-muted-foreground">Avg Proof Time</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg" data-testid="zkverify-success-rate">
                        <p className="text-lg font-bold">99.8%</p>
                        <p className="text-xs text-muted-foreground">Success Rate</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      data-testid="button-test-proof"
                    >
                      Test Proof Generation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
