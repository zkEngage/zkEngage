import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import StatsCard from "@/components/common/stats-card";
import QuestCard from "@/components/quests/quest-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Quests() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");

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
        title: "Quest Started! 🚀",
        description: "Good luck on your journey! Check your progress anytime.",
      });
    },
    onError: (error) => {
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
        description: "Amazing work! You've earned XP and unlocked new possibilities!",
      });
    },
    onError: (error) => {
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
    { id: "all", name: "All Quests", color: "primary", icon: "🎯" },
    { id: "beginner", name: "Beginner", color: "success", icon: "🌱" },
    { id: "social", name: "Social", color: "accent", icon: "👥" },
    { id: "advanced", name: "Advanced", color: "destructive", icon: "🔥" },
    { id: "educational", name: "Educational", color: "yellow", icon: "📚" },
  ];

  const filteredQuests = quests?.filter((quest: any) => 
    selectedCategory === "all" || quest.category === selectedCategory
  ) || [];

  const completedQuests = userQuests?.filter((uq: any) => uq.isCompleted).length || 0;
  const activeQuests = userQuests?.filter((uq: any) => !uq.isCompleted).length || 0;

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
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Quest Hub</h1>
            <p className="text-muted-foreground">
              Embark on exciting challenges, earn XP, and master the art of zero-knowledge proofs
            </p>
          </motion.div>

          {/* Motivational Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1 flex items-center">
                      Your ZK Journey Awaits
                    </h3>
                    <p className="text-muted-foreground">
                      Every quest completed is a step closer to becoming a ZK expert. Start your next adventure!
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-3xl">⚡</div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Active Quests</p>
                      <p className="text-2xl font-bold">{activeQuests}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="font-medium"
                data-testid={`filter-${category.id}`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </motion.div>

          {/* Quest Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                    <div className="mt-4">
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredQuests.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold mb-2">No Quests Available</h3>
                <p className="text-muted-foreground">
                  {selectedCategory === "all" 
                    ? "Check back later for new challenges and adventures!"
                    : `No ${selectedCategory} quests available right now. Try a different category!`
                  }
                </p>
              </div>
            ) : (
              filteredQuests.map((quest: any, index: number) => {
                const userQuest = userQuestMap[quest.id];
                return (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <QuestCard
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
                  </motion.div>
                );
              })
            )}
          </motion.div>

          {/* Quest Progress Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">📈</span>
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Completed Quests</span>
                    <span className="font-semibold text-success">{completedQuests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Quests</span>
                    <span className="font-semibold text-primary">{activeQuests}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Available Quests</span>
                    <span className="font-semibold">{quests?.length - completedQuests - activeQuests || 0}</span>
                  </div>
                  {completedQuests > 0 && (
                    <div className="pt-4 border-t border-border">
                      <div className="text-sm text-muted-foreground">
                        Completion Rate: {Math.round((completedQuests / (quests?.length || 1)) * 100)}%
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div 
                          className="bg-success h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(completedQuests / (quests?.length || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">💡</span>
                  Quest Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <span>Start with beginner quests to build your foundation</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <span>Complete daily quests to maintain your streak</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <span>Advanced quests offer higher XP rewards</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <span>Join the community for quest tips and help</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span>•</span>
                    <span>Some quests unlock exclusive achievements</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" className="w-full" onClick={() => setSelectedCategory("beginner")}>
                    View Beginner Quests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quest Categories Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Quest Categories</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Different types of quests to match your learning style and interests
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {categories.filter(cat => cat.id !== "all").map((category) => (
                    <div 
                      key={category.id}
                      className="text-center p-4 rounded-lg border border-border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h4 className="font-medium mb-1">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {filteredQuests.filter(q => q.category === category.id).length} quests
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}