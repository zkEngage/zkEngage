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
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Leaderboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("all");

  // Mock data for when API isn't available
  const mockLeaderboard = [
    {
      id: 1,
      firstName: "Alice",
      lastName: "Johnson", 
      profileImageUrl: null,
      level: 15,
      totalXP: 12500,
      rank: 1
    },
    {
      id: 2,
      firstName: "Bob",
      lastName: "Smith",
      profileImageUrl: null, 
      level: 14,
      totalXP: 11200,
      rank: 2
    },
    {
      id: 3,
      firstName: "Carol",
      lastName: "Davis",
      profileImageUrl: null,
      level: 13, 
      totalXP: 9800,
      rank: 3
    },
    {
      id: 4,
      firstName: "David",
      lastName: "Wilson",
      profileImageUrl: null,
      level: 12,
      totalXP: 8500,
      rank: 4
    },
    {
      id: 5,
      firstName: "Eve",
      lastName: "Brown",
      profileImageUrl: null,
      level: 11,
      totalXP: 7200,
      rank: 5
    }
  ];

  const { data: leaderboard = mockLeaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    enabled: false, // Disable API call, use mock data
  });

  const { data: userRank } = useQuery({
    queryKey: ["/api/leaderboard/rank"],
    enabled: false,
  });

  const periods = [
    { id: "all", name: "All Time" },
    { id: "month", name: "This Month" },
    { id: "week", name: "This Week" },
    { id: "friends", name: "Friends" },
  ];

  const currentUserRank = userRank?.rank || 4;
  const currentUser = leaderboard?.find((u: any) => u.id === user?.id) || leaderboard[3];

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
              Compete with the zkEngage community and climb the rankings
            </p>
          </motion.div>

          {/* Motivational Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Ready to rise in the ranks?</h3>
                    <p className="text-muted-foreground">Complete quests, earn XP, and show your ZK expertise!</p>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Start Quest
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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
          {leaderboard?.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {/* Second Place */}
              <Card className="border-gray-400/50 bg-gray-50/50 dark:bg-gray-900/50 order-2 md:order-1">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 mx-auto border-4 border-gray-400">
                      <AvatarImage src={leaderboard[1].profileImageUrl} />
                      <AvatarFallback className="text-lg">
                        {leaderboard[1].firstName?.[0]}{leaderboard[1].lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{leaderboard[1].firstName} {leaderboard[1].lastName}</h3>
                  <p className="text-muted-foreground text-sm mb-2">Level {leaderboard[1].level}</p>
                  <p className="font-bold text-xl">{leaderboard[1].totalXP?.toLocaleString()} XP</p>
                  <Badge variant="secondary" className="mt-2">Silver Champion</Badge>
                </CardContent>
              </Card>

              {/* First Place */}
              <Card className="border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-900/20 order-1 md:order-2 scale-105">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 mx-auto border-4 border-yellow-400">
                      <AvatarImage src={leaderboard[0].profileImageUrl} />
                      <AvatarFallback className="text-xl">
                        {leaderboard[0].firstName?.[0]}{leaderboard[0].lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                      👑
                    </div>
                  </div>
                  <h3 className="font-semibold text-xl">{leaderboard[0].firstName} {leaderboard[0].lastName}</h3>
                  <p className="text-muted-foreground mb-2">Level {leaderboard[0].level}</p>
                  <p className="font-bold text-2xl gradient-text">{leaderboard[0].totalXP?.toLocaleString()} XP</p>
                  <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-orange-400">Gold Champion</Badge>
                </CardContent>
              </Card>

              {/* Third Place */}
              <Card className="border-amber-600/50 bg-amber-50/50 dark:bg-amber-900/20 order-3">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-20 h-20 mx-auto border-4 border-amber-600">
                      <AvatarImage src={leaderboard[2].profileImageUrl} />
                      <AvatarFallback className="text-lg">
                        {leaderboard[2].firstName?.[0]}{leaderboard[2].lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{leaderboard[2].firstName} {leaderboard[2].lastName}</h3>
                  <p className="text-muted-foreground text-sm mb-2">Level {leaderboard[2].level}</p>
                  <p className="font-bold text-xl">{leaderboard[2].totalXP?.toLocaleString()} XP</p>
                  <Badge variant="secondary" className="mt-2 bg-amber-600/20 text-amber-800">Bronze Champion</Badge>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Current User Position (if not in top 3) */}
          {currentUser && currentUserRank > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <span className="mr-2">🎯</span>
                    Your Position
                  </CardTitle>
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
                      <p className="text-sm text-muted-foreground">
                        {currentUserRank <= 10 ? "Top 10! Keep it up!" : "Keep climbing!"}
                      </p>
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
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🏆</span>
                  Full Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
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
                              {rank <= 3 && <span className="mr-1">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>}
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
                              {rank === 1 ? '👑 Champion' : rank === 2 ? '🥈 Runner-up' : '🥉 Third Place'}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isCurrentUser ? 'text-primary' : ''}`} data-testid={`text-xp-${userEntry.id}`}>
                            {userEntry.totalXP?.toLocaleString() || 0} XP
                          </p>
                          <p className="text-sm text-muted-foreground">
                            +{Math.floor(Math.random() * 500 + 100)} this week
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Competition Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏃‍♀️</span>
                </div>
                <h3 className="font-semibold mb-2">Weekly Sprint</h3>
                <p className="text-sm text-muted-foreground">
                  Top 3 this week get bonus rewards!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-success/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎁</span>
                </div>
                <h3 className="font-semibold mb-2">Exclusive Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Unlock special badges and titles
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔥</span>
                </div>
                <h3 className="font-semibold mb-2">Streak Bonus</h3>
                <p className="text-sm text-muted-foreground">
                  Daily activity multiplies your XP
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}