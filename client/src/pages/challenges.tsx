import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ChallengeCard } from "@/components/challenges/challenge-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AuthModal } from "../components/auth/auth-modal";
import { useQuery } from "@tanstack/react-query";
import { Target, Clock, Star, Trophy } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  requirements: any;
  reward: number;
  status: "active" | "completed" | "new";
  progress?: number;
  maxProgress?: number;
  timeRemaining?: string;
  difficulty: "easy" | "medium" | "hard";
}

export default function ChallengesPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");

  const { data: challenges, isLoading } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges", filter, difficulty],
  });

  const filterOptions = [
    { value: "all", label: "All", active: filter === "all" },
    { value: "active", label: "Active", active: filter === "active" },
    { value: "completed", label: "Completed", active: filter === "completed" },
  ];

  const difficultyOptions = [
    { value: "all", label: "All Levels", active: difficulty === "all" },
    { value: "easy", label: "Easy", active: difficulty === "easy" },
    { value: "medium", label: "Medium", active: difficulty === "medium" },
    { value: "hard", label: "Hard", active: difficulty === "hard" },
  ];

  const filteredChallenges = challenges?.filter(challenge => {
    if (filter !== "all" && challenge.status !== filter) return false;
    if (difficulty !== "all" && challenge.difficulty !== difficulty) return false;
    return true;
  }) || [];

  const activeChallenges = challenges?.filter(c => c.status === "active") || [];
  const completedChallenges = challenges?.filter(c => c.status === "completed") || [];
  const totalRewards = activeChallenges.reduce((sum, c) => sum + c.reward, 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header 
          onConnectWallet={() => setShowAuthModal(true)}
          title="Challenges"
          description="Complete tasks to earn XP and unlock achievements"
        />
        
        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="stat-card" data-testid="stat-active-challenges">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active</p>
                    <p className="text-2xl font-bold text-foreground">
                      {activeChallenges.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Target className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-completed-challenges">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Completed</p>
                    <p className="text-2xl font-bold text-foreground">
                      {completedChallenges.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Trophy className="text-green-500 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-available-rewards">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Available XP</p>
                    <p className="text-2xl font-bold text-foreground">
                      {totalRewards.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <Star className="text-secondary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card" data-testid="stat-time-sensitive">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Expiring Soon</p>
                    <p className="text-2xl font-bold text-foreground">
                      {activeChallenges.filter(c => c.timeRemaining).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Clock className="text-accent text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Available Challenges</CardTitle>
                  <p className="text-muted-foreground">
                    Complete challenges to earn XP and generate zkProofs
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
                  {difficultyOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={option.active ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setDifficulty(option.value as any)}
                      data-testid={`difficulty-${option.value}`}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="loading-shimmer h-48 rounded-lg"></div>
                  ))}
                </div>
              ) : filteredChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges.map((challenge) => (
                    <ChallengeCard 
                      key={challenge.id} 
                      challenge={challenge}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No challenges found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or check back later for new challenges
                  </p>
                  <Button 
                    onClick={() => {
                      setFilter("all");
                      setDifficulty("all");
                    }}
                    data-testid="button-clear-filters"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Challenge Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="text-primary" size={20} />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <Badge variant="outline" className="shrink-0">1</Badge>
                  <p className="text-sm">Complete daily challenges for bonus XP</p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="shrink-0">2</Badge>
                  <p className="text-sm">Chain challenges together for multipliers</p>
                </div>
                <div className="flex gap-3">
                  <Badge variant="outline" className="shrink-0">3</Badge>
                  <p className="text-sm">zkProofs are generated automatically upon completion</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="text-secondary" size={20} />
                  Reward System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Easy challenges</span>
                  <Badge className="badge-common">100-300 XP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Medium challenges</span>
                  <Badge className="badge-rare">400-800 XP</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hard challenges</span>
                  <Badge className="badge-epic">900-1500 XP</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
