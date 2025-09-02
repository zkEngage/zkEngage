import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import AchievementBadge from "@/components/achievements/achievement-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Achievements() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

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

  if (!isLoading && !isAuthenticated) {
    return null;
  }

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
              Unlock badges and showcase your zkVerify expertise
            </p>
          </motion.div>

          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold" data-testid="text-progress-title">
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
                <div 
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${achievements?.length ? (unlockedCount / achievements.length) * 100 : 0}%` 
                  }}
                  data-testid="progress-bar"
                />
              </div>
            </div>
          </motion.div>

          {/* Achievement Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.3 }}
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
                <i className="fas fa-trophy text-6xl text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Achievements Found</h3>
                <p className="text-muted-foreground">
                  Try selecting a different category or check back later!
                </p>
              </div>
            ) : (
              filteredAchievements.map((achievement: any) => {
                const userAchievement = unlockedMap[achievement.id];
                return (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={!!userAchievement}
                    unlockedAt={userAchievement?.unlockedAt}
                    progress={userAchievement?.progress}
                    maxProgress={userAchievement?.maxProgress}
                  />
                );
              })
            )}
          </motion.div>

          {/* Achievement Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-star text-primary text-xl" />
              </div>
              <div className="text-2xl font-bold mb-1" data-testid="text-rare-achievements">
                {achievements?.filter((a: any) => a.category === 'milestones').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Rare Achievements</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-success/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-trophy text-success text-xl" />
              </div>
              <div className="text-2xl font-bold mb-1" data-testid="text-unlocked-count">
                {unlockedCount}
              </div>
              <p className="text-sm text-muted-foreground">Unlocked Badges</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-medal text-accent text-xl" />
              </div>
              <div className="text-2xl font-bold mb-1" data-testid="text-total-xp-earned">
                {userAchievements?.reduce((sum: number, ua: any) => sum + (ua.achievement?.xpReward || 0), 0) || 0}
              </div>
              <p className="text-sm text-muted-foreground">XP from Achievements</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
