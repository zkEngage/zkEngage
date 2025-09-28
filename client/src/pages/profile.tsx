import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import StatsCard from "@/components/common/stats-card";
import QuestCard from "@/components/quests/quest-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Quests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats } = useQuery({
    queryKey: ["/api/users/stats"],
  });

  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ["/api/quests"],
  });

  const { data: userQuests, isLoading: userQuestsLoading } = useQuery({
    queryKey: ["/api/quests/user"],
  });

  const startQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      await apiRequest("POST", `/api/quests/${questId}/start`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests/user"] });
      toast({
        title: "Quest Started!",
        description: "Good luck on your journey!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to start quest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      await apiRequest("POST", `/api/quests/${questId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      toast({
        title: "Quest Completed! 🎉",
        description: "You've earned XP and unlocked new possibilities!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to complete quest. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create a map of user quest progress
  const userQuestMap = userQuests?.reduce((acc: any, uq: any) => {
    acc[uq.questId] = uq;
    return acc;
  }, {}) || {};

  const categories = [
    { id: "all", name: "All Quests", color: "primary" },
    { id: "beginner", name: "Beginner", color: "success" },
    { id: "social", name: "Social", color: "accent" },
    { id: "advanced", name: "Advanced", color: "destructive" },
    { id: "educational", name: "Educational", color: "yellow" },
  ];

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage="quests" />
      
      <main className="flex-1 md:ml-0">
        <MobileHeader />
        
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Active Quests</h1>
            <p className="text-muted-foreground">
              Complete challenges to earn XP and unlock achievements
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <StatsCard
              title="Total XP"
              value={stats?.totalXP?.toLocaleString() || "0"}
              icon="fas fa-star"
              color="primary"
              gradient
              testId="stats-total-xp"
            />
            <StatsCard
              title="Quests Completed"
              value={stats?.completedQuests?.toString() || "0"}
              icon="fas fa-check"
              color="success"
              testId="stats-completed-quests"
            />
            <StatsCard
              title="Current Streak"
              value={`${stats?.streak || 0} days`}
              icon="fas fa-fire"
              color="accent"
              testId="stats-current-streak"
            />
            <StatsCard
              title="Global Rank"
              value={`#${stats?.rank || 0}`}
              icon="fas fa-crown"
              color="yellow"
              testId="stats-global-rank"
            />
          </motion.div>

          {/* Quest Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                data-testid={`filter-${category.id}`}
              >
                {category.name}
              </Badge>
            ))}
          </motion.div>

          {/* Quest Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {questsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              quests?.map((quest: any) => {
                const userQuest = userQuestMap[quest.id];
                return (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    progress={userQuest ? {
                      current: userQuest.currentStep,
                      total: quest.maxSteps,
                    } : undefined}
                    isCompleted={userQuest?.isCompleted}
                    onStart={() => startQuestMutation.mutate(quest.id)}
                    onComplete={() => completeQuestMutation.mutate(quest.id)}
                    isStarting={startQuestMutation.isPending}
                    isCompleting={completeQuestMutation.isPending}
                  />
                );
              })
            )}
          </motion.div>

          {quests?.length === 0 && !questsLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-12"
            >
              <i className="fas fa-map text-6xl text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Quests Available</h3>
              <p className="text-muted-foreground">
                Check back later for new challenges and adventures!
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
