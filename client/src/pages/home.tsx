import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import StatsCard from "@/components/common/stats-card";
import QuestCard from "@/components/quests/quest-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function Home() {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [proofCount, setProofCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [isNewUser, setIsNewUser] = useState(true);
  const [showQuests, setShowQuests] = useState(false);
  const [email, setEmail] = useState("");

  // Load persisted data from localStorage
  useEffect(() => {
    const storedXp = localStorage.getItem("xp") || "0";
    const storedStreak = localStorage.getItem("streak") || "0";
    const storedProofs = localStorage.getItem("proofs") || "0";
    const storedTasks = localStorage.getItem("tasks") || "0";
    const enrolled = localStorage.getItem("enrolled");
    setXp(parseInt(storedXp));
    setStreak(parseInt(storedStreak));
    setProofCount(parseInt(storedProofs));
    setTaskCount(parseInt(storedTasks));
    setIsNewUser(!enrolled);

    // Check daily streak
    const lastLogin = localStorage.getItem("lastLogin");
    const today = new Date().toDateString();
    if (lastLogin !== today && user) {
      setStreak(streak + 1);
      setXp(xp + 5); // Assume 5 XP per streak day (from admin config)
      localStorage.setItem("streak", (streak + 1).toString());
      localStorage.setItem("xp", (xp + 5).toString());
      localStorage.setItem("lastLogin", today);
    }
  }, [user, streak, xp]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/users/stats"],
  });

  const { data: recentQuests, isLoading: questsLoading } = useQuery({
    queryKey: ["/api/quests/user"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const completeQuest = (points: number) => {
    setXp(xp + points);
    setTaskCount(taskCount + 1);
    localStorage.setItem("xp", (xp + points).toString());
    localStorage.setItem("tasks", (taskCount + 1).toString());
    if (isNewUser) {
      localStorage.setItem("enrolled", "true");
      setIsNewUser(false);
    }
    setShowQuests(false);
  };

  const generateProof = () => {
    setProofCount(proofCount + 1);
    setXp(xp + 5); // Assume 5 XP per proof (from admin config)
    localStorage.setItem("proofs", (proofCount + 1).toString());
    localStorage.setItem("xp", (xp + 5).toString());
  };

  const zkEchoQuest = () => {
    completeQuest(15); // Unique 15 XP for zkEcho
    console.log("zkEcho proof submitted (simulated)");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-0">
        <MobileHeader />
        <div className="p-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
              Welcome back, {user?.firstName || "Developer"}! 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to continue your zkVerify journey? Here's what's happening today.
            </p>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <StatsCard
                  title="Total XP"
                  value={(stats?.totalXP || 0 + xp).toLocaleString()} // Add local XP
                  icon="fas fa-star"
                  color="primary"
                  gradient
                  testId="stats-total-xp"
                />
                <StatsCard
                  title="Quests Completed"
                  value={(stats?.completedQuests || 0 + taskCount).toString()} // Add local tasks
                  icon="fas fa-check"
                  color="success"
                  testId="stats-completed-quests"
                />
                <StatsCard
                  title="Current Streak"
                  value={`${streak || stats?.streak || 0} days`} // Prioritize local streak
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
              </>
            )}
          </motion.div>

          {/* Active Quests with New User Quests */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-map text-primary" />
                      <span>Continue Your Quests</span>
                    </CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/quests" data-testid="link-view-all-quests">
                        View All
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {questsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-4 border border-border rounded-lg">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-48 mb-3" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : recentQuests?.filter((uq: any) => !uq.isCompleted).slice(0, 3).length === 0 && isNewUser ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-map text-4xl mb-4 opacity-50" />
                      <p>No active quests yet. Start your first quest!</p>
                      <Button className="mt-4" onClick={() => setShowQuests(true)}>
                        Start New User Quests
                      </Button>
                      {showQuests && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <Input
                              type="email"
                              placeholder="Verify Email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <Button
                              onClick={() => completeQuest(10)}
                              className="ml-2 mt-2"
                            >
                              Verify (10 XP)
                            </Button>
                          </div>
                          <Button onClick={() => completeQuest(10)} className="mt-2">
                            Connect Discord (10 XP)
                          </Button>
                          <Button onClick={zkEchoQuest} className="mt-2">
                            Complete zkEcho (15 XP)
                          </Button>
                          <Button onClick={generateProof} className="mt-2">
                            Generate Proof (5 XP)
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentQuests?.filter((uq: any) => !uq.isCompleted)
                        .slice(0, 3)
                        .map((userQuest: any) => (
                          <QuestCard
                            key={userQuest.quest.id}
                            quest={userQuest.quest}
                            progress={{
                              current: userQuest.currentStep,
                              total: userQuest.quest.maxSteps,
                            }}
                            compact
                          />
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-clock text-accent" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-3 w-24 mb-1" />
                            <Skeleton className="h-2 w-32" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-clock text-4xl mb-4 opacity-50" />
                      <p>No recent activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities?.map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3"
                          data-testid={`activity-${activity.id}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activity.type === "quest_completed"
                                ? "bg-success/20"
                                : activity.type === "achievement_unlocked"
                                ? "bg-primary/20"
                                : activity.type === "level_up"
                                ? "bg-accent/20"
                                : "bg-muted"
                            }`}
                          >
                            <i
                              className={`text-sm ${
                                activity.type === "quest_completed"
                                  ? "fas fa-check text-success"
                                  : activity.type === "achievement_unlocked"
                                  ? "fas fa-trophy text-primary"
                                  : activity.type === "level_up"
                                  ? "fas fa-arrow-up text-accent"
                                  : "fas fa-clock text-muted-foreground"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p
                              className="font-medium text-sm"
                              data-testid={`text-activity-title-${activity.id}`}
                            >
                              {activity.title}
                            </p>
                            <p
                              className="text-xs text-muted-foreground"
                              data-testid={`text-activity-description-${activity.id}`}
                            >
                              {activity.description}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions with NFT Minting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-2"
                    asChild
                  >
                    <Link href="/quests" data-testid="button-explore-quests">
                      <i className="fas fa-map text-xl text-primary" />
                      <span>Explore Quests</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-2"
                    asChild
                  >
                    <Link
                      href="/achievements"
                      data-testid="button-view-achievements"
                    >
                      <i className="fas fa-trophy text-xl text-accent" />
                      <span>Achievements</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-2"
                    asChild
                  >
                    <Link
                      href="/leaderboard"
                      data-testid="button-view-leaderboard"
                    >
                      <i className="fas fa-crown text-xl text-yellow-500" />
                      <span>Leaderboard</span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col space-y-2"
                    onClick={() =>
                      xp >= 50000
                        ? console.log("NFT Minted!")
                        : alert("Need 50,000 XP to mint NFT")
                    }
                    disabled={xp < 50000}
                  >
                    <i className="fas fa-gem text-xl text-success" />
                    <span>Mint NFT</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
