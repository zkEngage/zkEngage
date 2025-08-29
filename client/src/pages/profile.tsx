import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Trophy, 
  Shield, 
  Calendar, 
  MapPin, 
  Link as LinkIcon,
  Settings,
  Edit
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  profileImage?: string;
  level: number;
  xp: number;
  totalProofs: number;
  walletAddress?: string;
  walletType?: string;
  createdAt: string;
  stats: {
    challengesCompleted: number;
    achievementsUnlocked: number;
    rank: number;
    totalUsers: number;
  };
}

interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  unlockedAt: string;
}

export default function ProfilePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "achievements" | "activity">("overview");

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users/me"],
  });

  const { data: achievements } = useQuery<UserAchievement[]>({
    queryKey: ["/api/users/me/achievements"],
  });

  // Calculate XP progress to next level
  const getXPProgress = (level: number, xp: number) => {
    const baseXP = 1000;
    const xpForCurrentLevel = Math.floor(baseXP * Math.pow(1.5, level - 1));
    const xpForNextLevel = Math.floor(baseXP * Math.pow(1.5, level));
    const currentLevelXP = xp - (level > 1 ? xpForCurrentLevel : 0);
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    return {
      current: currentLevelXP,
      needed: xpNeeded,
      percentage: Math.min((currentLevelXP / xpNeeded) * 100, 100)
    };
  };

  const xpProgress = profile ? getXPProgress(profile.level, profile.xp) : null;

  const tabs = [
    { value: "overview", label: "Overview", active: activeTab === "overview" },
    { value: "achievements", label: "Achievements", active: activeTab === "achievements" },
    { value: "activity", label: "Activity", active: activeTab === "activity" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64">
          <Header onConnectWallet={() => setShowAuthModal(true)} />
          <main className="p-6">
            <div className="text-center py-12">
              <User className="mx-auto text-muted-foreground mb-4" size={48} />
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-muted-foreground mb-4">
                Please connect your account to view your profile
              </p>
              <Button onClick={() => setShowAuthModal(true)}>
                Connect Account
              </Button>
            </div>
          </main>
        </div>
        <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header 
          onConnectWallet={() => setShowAuthModal(true)}
          title="Profile"
          description="Manage your zkEngage account and view your progress"
        />
        
        <main className="p-6 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                  <img 
                    src={profile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                    alt={profile.username}
                    className="w-24 h-24 rounded-full border-4 border-primary/20"
                    data-testid="profile-avatar"
                  />
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl font-bold text-foreground" data-testid="profile-username">
                      @{profile.username}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                      <Badge className="zkverify-gradient">
                        Level {profile.level}
                      </Badge>
                      <Badge variant="outline">
                        Rank #{profile.stats.rank}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="stat-xp">
                    <div className="text-xl font-bold text-foreground">
                      {profile.xp.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="stat-proofs">
                    <div className="text-xl font-bold text-foreground">
                      {profile.totalProofs}
                    </div>
                    <div className="text-xs text-muted-foreground">zkProofs</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="stat-challenges">
                    <div className="text-xl font-bold text-foreground">
                      {profile.stats.challengesCompleted}
                    </div>
                    <div className="text-xs text-muted-foreground">Challenges</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg" data-testid="stat-achievements">
                    <div className="text-xl font-bold text-foreground">
                      {profile.stats.achievementsUnlocked}
                    </div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Button>
                </div>
              </div>

              {/* Level Progress */}
              {xpProgress && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Level {profile.level} Progress
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {xpProgress.current.toLocaleString()} / {xpProgress.needed.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress 
                    value={xpProgress.percentage} 
                    className="h-2"
                    data-testid="level-progress"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {(xpProgress.needed - xpProgress.current).toLocaleString()} XP to Level {profile.level + 1}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User size={20} />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="text-foreground">@{profile.username}</p>
                  </div>
                  
                  {profile.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground">{profile.email}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-foreground flex items-center gap-2">
                      <Calendar size={16} />
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {profile.walletAddress && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Connected Wallet</label>
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-primary" />
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {`${profile.walletAddress.substring(0, 8)}...${profile.walletAddress.slice(-6)}`}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {profile.walletType}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy size={20} />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements && achievements.length > 0 ? (
                    <div className="space-y-3">
                      {achievements.slice(0, 3).map((achievement) => (
                        <AchievementCard 
                          key={achievement.id}
                          achievement={achievement}
                          compact
                        />
                      ))}
                      {achievements.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setActiveTab("achievements")}
                        >
                          View All ({achievements.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Trophy className="mx-auto text-muted-foreground mb-2" size={32} />
                      <p className="text-muted-foreground">No achievements yet</p>
                      <p className="text-sm text-muted-foreground">Complete challenges to earn your first badge</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "achievements" && (
            <Card>
              <CardHeader>
                <CardTitle>All Achievements</CardTitle>
                <p className="text-muted-foreground">
                  Your complete badge collection ({achievements?.length || 0} unlocked)
                </p>
              </CardHeader>
              <CardContent>
                {achievements && achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {achievements.map((achievement) => (
                      <AchievementCard 
                        key={achievement.id}
                        achievement={achievement}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="mx-auto text-muted-foreground mb-4" size={48} />
                    <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start completing challenges to unlock your first achievements
                    </p>
                    <Button>Browse Challenges</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "activity" && (
            <Card>
              <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <p className="text-muted-foreground">Your recent zkEngage activity</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="text-lg font-semibold mb-2">Activity tracking coming soon</h3>
                  <p className="text-muted-foreground">
                    Detailed activity logs and analytics will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
