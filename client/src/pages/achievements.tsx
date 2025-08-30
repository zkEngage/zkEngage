import { Sidebar } from "../components/layout/sidebar";
import { Header } from "../components/layout/header";
import { AchievementCard } from "../components/achievements/achievement-card";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { useState } from "react";
import { AuthModal } from "../components/auth/auth-modal";
import { useQuery } from "@tanstack/react-query";
import { Medal, Trophy, Star, Award, Lock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirements: any;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface AchievementStats {
  totalUnlocked: number;
  totalAvailable: number;
  rareUnlocked: number;
  epicUnlocked: number;
  legendaryUnlocked: number;
  completionRate: number;
}

export default function AchievementsPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [category, setCategory] = useState<"all" | "social" | "proof" | "engagement" | "milestone">("all");

  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements", filter, category],
  });

  const { data: stats } = useQuery<AchievementStats>({
    queryKey: ["/api/achievements/stats"],
  });

  const filterOptions = [
    { value: "all", label: "All", active: filter === "all" },
    { value: "unlocked", label: "Unlocked", active: filter === "unlocked" },
    { value: "locked", label: "Locked", active: filter === "locked" },
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories", active: category === "all" },
    { value: "social", label: "Social", active: category === "social" },
    { value: "proof", label: "zkProof", active: category === "proof" },
    { value: "engagement", label: "Engagement", active: category === "engagement" },
    { value: "milestone", label: "Milestone", active: category === "milestone" },
  ];

  const filteredAchievements = achievements?.filter(achievement => {
    if (filter === "unlocked" && !achievement.isUnlocked) return false;
    if (filter === "locked" && achievement.isUnlocked) return false;
    if (category !== "all" && achievement.category !== category) return false;
    return true;
  }) || [];

  const rarityStats = [
    {
      rarity: "legendary",
      count: stats?.legendaryUnlocked || 0,
      total: achievements?.filter(a => a.rarity === "legendary").length || 0,
      color: "from-yellow-500 to-orange-500",
      icon: Trophy,
    },
    {
      rarity: "epic",
      count: stats?.epicUnlocked || 0,
      total: achievements?.filter(a => a.rarity === "epic").length || 0,
      color: "from-purple-500 to-pink-500",
      icon: Award,
    },
    {
      rarity: "rare",
      count: stats?.rareUnlocked || 0,
      total: achievements?.filter(a => a.rarity === "rare").length || 0,
      color: "from-blue-500 to-cyan-500",
      icon: Star,
    },
    {
      rarity: "common",
      count: (stats?.totalUnlocked || 0) - (stats?.rareUnlocked || 0) - (stats?.epicUnlocked || 0) - (stats?.legendaryUnlocked || 0),
      total: achievements?.filter(a => a.rarity === "common").length || 0,
      color: "from-gray-500 to-gray-600",
      icon: Medal,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header 
          onConnectWallet={() => setShowAuthModal(true)}
          title="Achievements"
          description="Unlock badges and showcase your zkEngage journey"
        />
        
        <main className="p-6 space-y-6">
          {/* Progress Overview */}
          <Card className="zkverify-gradient text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Achievement Progress</h2>
                  <p className="opacity-90">
                    {stats?.totalUnlocked || 0} of {stats?.totalAvailable || 0} achievements unlocked
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {stats?.completionRate?.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm opacity-90">Complete</div>
                </div>
              </div>
              <Progress 
                value={stats?.completionRate || 0} 
                className="h-3 bg-white/20"
                data-testid="achievement-progress"
              />
            </CardContent>
          </Card>

          {/* Rarity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rarityStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.rarity} className="stat-card" data-testid={`stat-${stat.rarity}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="text-white text-xl" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {stat.count}/{stat.total}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{stat.rarity}</span>
                        <span className="text-xs text-muted-foreground">
                          {stat.total > 0 ? Math.round((stat.count / stat.total) * 100) : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={stat.total > 0 ? (stat.count / stat.total) * 100 : 0} 
                        className="h-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Filters and Achievements */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Badge Collection</CardTitle>
                  <p className="text-muted-foreground">
                    Earn badges by completing challenges and generating zkProofs
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={option.active ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(option.value as any)}
                      className={option.active ? "zkverify-gradient" : ""}
                      data-testid={`filter-${option.value}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                  <div className="w-px bg-border mx-2"></div>
                  {categoryOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={option.active ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCategory(option.value as any)}
                      data-testid={`category-${option.value}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="loading-shimmer h-40 rounded-lg"></div>
                  ))}
                </div>
              ) : filteredAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAchievements.map((achievement) => (
                    <AchievementCard 
                      key={achievement.id} 
                      achievement={achievement}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lock className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No achievements found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or complete more challenges to unlock badges
                  </p>
                  <Button 
                    onClick={() => {
                      setFilter("all");
                      setCategory("all");
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Achievement Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-primary" size={20} />
                How to Earn Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Trophy className="text-primary" size={20} />
                  </div>
                  <h4 className="font-semibold mb-2">Social</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect accounts, share content, engage with community
                  </p>
                </div>

                <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                  <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Medal className="text-secondary" size={20} />
                  </div>
                  <h4 className="font-semibold mb-2">zkProof</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate and verify zero-knowledge proofs
                  </p>
                </div>

                <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="text-accent" size={20} />
                  </div>
                  <h4 className="font-semibold mb-2">Engagement</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete challenges and maintain activity
                  </p>
                </div>

                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="text-green-500" size={20} />
                  </div>
                  <h4 className="font-semibold mb-2">Milestone</h4>
                  <p className="text-sm text-muted-foreground">
                    Reach XP, level, and community milestones
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
