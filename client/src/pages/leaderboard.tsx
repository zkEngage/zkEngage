import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import AchievementBadge from "@/components/achievements/achievement-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: achievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const { data: userAchievements, isLoading: userAchievementsLoading } = useQuery({
    queryKey: ["/api/achievements/user"],
  });

  // Create a map of unlocked achievements
  const unlockedMap = userAchievements?.reduce((acc: any, ua: any) => {
    acc[ua.achievementId] = ua;
    return acc;
  }, {}) || {};

  const categories = [
    { id: "all", name: "All", color: "primary" },
    { id: "development", name: "Development", color: "success" },
    { id: "social", name: "Social", color: "accent" },
    { id: "educational", name: "Educational", color: "yellow" },
    { id: "milestones", name: "Milestones", color: "destructive" },
  ];

  const filteredAchievements = achievements?.filter((achievement: any) => 
    selectedCategory === "all" || achievement.category === selectedCategory
  ) || [];

  const unlockedCount = achievements?.filter((achievement: any) => 
    unlockedMap[achievement.id]
  ).length || 0;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage="achievements" />
      
      <main className="flex-1 md:ml-0">
        <MobileHeader />
        
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Achievements</h1>
            <p className="text-muted-foreground">
              Unlock badges and showcase your zkEngage expertise to the world
            </p>
          </motion.div>

          {/* Motivation Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-primary/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Every achievement tells your story</h3>
                  <p className="text-muted-foreground">Complete quests, contribute to the community, and master ZK proofs to earn exclusive badges</p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            </div>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold flex items-center" data-testid="text-progress-title">
                    <span className="mr-2">📊</span>
                    Achievement Progress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {unlockedCount} of {achievements?.length || 0} achievements unlocked
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text" data-testid="text-progress-percentage">
                    {achievements?.length ? Math.round((unlockedCount / achievements.length) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${achievements?.length ? (unlockedCount / achievements.length) * 100 : 0}%` 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  data-testid="progress-bar"
                />
              </div>
              {unlockedCount > 0 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  You're doing great! Keep unlocking more achievements 🌟
                </p>
              )}
            </div>
          </motion.div>

          {/* Achievement Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="font-medium"
                data-testid={`filter-${category.id}`}
              >
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* Achievements Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {achievementsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6 text-center">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-4 w-24 mx-auto mb-2" />
                  <Skeleton className="h-3 w-32 mx-auto mb-3" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))
            ) : filteredAchievements.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No Achievements Found</h3>
                <p className="text-muted-foreground">
                  Try selecting a different category or check back later for new achievements!
                </p>
              </div>
            ) : (
              filteredAchievements.map((achievement: any, index: number) => {
                const userAchievement = unlockedMap[achievement.id];
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <AchievementBadge
                      achievement={achievement}
                      isUnlocked={!!userAchievement}
                      unlockedAt={userAchievement?.unlockedAt}
                      progress={userAchievement?.progress}
                      maxProgress={userAchievement?.maxProgress}
                    />
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Achievement Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-card rounded-lg border border-border p-6 text-center hover:shadow-lg transition-all">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="text-2xl font-bold mb-1" data-testid="text-rare-achievements">
                {achievements?.filter((a: any) => a.category === 'milestones').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Rare Achievements</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 text-center hover:shadow-lg transition-all">
              <div className="w-12 h-12 mx-auto mb-4 bg-success/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="text-2xl font-bold mb-1 text-success" data-testid="text-unlocked-count">
                {unlockedCount}
              </div>
              <p className="text-sm text-muted-foreground">Unlocked Badges</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 text-center hover:shadow-lg transition-all">
              <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💎</span>
              </div>
              <div className="text-2xl font-bold mb-1 text-accent" data-testid="text-total-xp-earned">
                {userAchievements?.reduce((sum: number, ua: any) => sum + (ua.achievement?.xpReward || 0), 0) || 0}
              </div>
              <p className="text-sm text-muted-foreground">XP from Achievements</p>
            </div>
          </motion.div>

          {/* Achievement Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Quick Tips to Earn More Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Complete daily quests to maintain your streak</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Engage with the community in social features</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Master different ZK proof techniques</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span>•</span>
                  <span>Help other community members succeed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}