import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import Podium from "@/components/leaderboard/podium";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Leaderboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("all");

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

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const { data: userRank } = useQuery({
    queryKey: ["/api/leaderboard/rank"],
  });

  const periods = [
    { id: "all", name: "All Time" },
    { id: "month", name: "This Month" },
    { id: "week", name: "This Week" },
    { id: "friends", name: "Friends" },
  ];

  const currentUserRank = userRank?.rank || 0;
  const currentUser = leaderboard?.find((u: any) => u.id === user?.id);

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage="leaderboard" />
      
      <main className="flex-1 md:ml-0">
        <MobileHeader />
        
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Leaderboard</h1>
            <p className="text-muted-foreground">
              Compete with the zkVerify community
            </p>
          </motion.div>

          {/* Leaderboard Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-4 mb-8"
          >
            {periods.map((period) => (
              <Button
                key={period.id}
                variant={selectedPeriod === period.id ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period.id)}
                className="font-medium"
                data-testid={`filter-${period.id}`}
              >
                {period.name}
              </Button>
            ))}
          </motion.div>

          {/* Top 3 Podium */}
          {leaderboardLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border text-center">
                  <CardContent className="p-6">
                    <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-24 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : leaderboard?.length >= 3 ? (
            <Podium
              topThree={leaderboard.slice(0, 3)}
              currentUserId={user?.id}
            />
          ) : null}

          {/* Current User Position (if not in top 3) */}
          {!leaderboardLoading && currentUser && currentUserRank > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Your Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-l-4 border-l-primary">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 flex items-center justify-center text-primary font-bold">
                        <span data-testid="text-current-user-rank">#{currentUserRank}</span>
                      </div>
                      <Avatar className="w-10 h-10 border-2 border-primary">
                        <AvatarImage src={currentUser.profileImageUrl} />
                        <AvatarFallback>
                          {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-primary" data-testid="text-current-user-name">
                          {currentUser.firstName} {currentUser.lastName} (You)
                        </p>
                        <p className="text-sm text-muted-foreground">Level {currentUser.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary" data-testid="text-current-user-xp">
                        {currentUser.totalXP?.toLocaleString()} XP
                      </p>
                      <p className="text-sm text-muted-foreground">Keep climbing!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Full Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Full Rankings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {leaderboardLoading ? (
                  <div className="space-y-0">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-b-0">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-8 h-8" />
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : leaderboard?.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-crown text-6xl text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Rankings Available</h3>
                    <p className="text-muted-foreground">
                      Start completing quests to appear on the leaderboard!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {leaderboard.map((userEntry: any, index: number) => {
                      const rank = index + 1;
                      const isCurrentUser = userEntry.id === user?.id;
                      
                      return (
                        <motion.div
                          key={userEntry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-all duration-200 ${
                            isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                          }`}
                          data-testid={`leaderboard-row-${userEntry.id}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 flex items-center justify-center font-bold ${
                              rank <= 3 ? 'text-yellow-500' : 
                              isCurrentUser ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              <span data-testid={`text-rank-${userEntry.id}`}>
                                {rank <= 3 && <i className="fas fa-medal mr-1" />}
                                {rank}
                              </span>
                            </div>
                            <Avatar className={`w-10 h-10 ${
                              rank <= 3 ? 'border-4 border-yellow-500' : 
                              isCurrentUser ? 'border-2 border-primary' : 'border-2 border-border'
                            }`}>
                              <AvatarImage src={userEntry.profileImageUrl} />
                              <AvatarFallback>
                                {userEntry.firstName?.[0]}{userEntry.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`} data-testid={`text-name-${userEntry.id}`}>
                                {userEntry.firstName} {userEntry.lastName}
                                {isCurrentUser && ' (You)'}
                              </p>
                              <p className="text-sm text-muted-foreground" data-testid={`text-level-${userEntry.id}`}>
                                Level {userEntry.level}
                              </p>
                            </div>
                            {rank <= 3 && (
                              <Badge variant="secondary" className="ml-2">
                                {rank === 1 ? '🥇 Champion' : rank === 2 ? '🥈 Runner-up' : '🥉 Third Place'}
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`} data-testid={`text-xp-${userEntry.id}`}>
                              {userEntry.totalXP?.toLocaleString() || 0} XP
                            </p>
                            <p className="text-sm text-muted-foreground">
                              +{Math.floor(Math.random() * 500)} today
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
