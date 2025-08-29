import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Star, Target, CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

interface ChallengeCardProps {
  challenge: Challenge;
  compact?: boolean;
}

export function ChallengeCard({ challenge, compact = false }: ChallengeCardProps) {
  const { toast } = useToast();

  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty) {
      case "hard":
        return {
          badge: "bg-red-500/20 text-red-400 border-red-500/30",
          accent: "border-red-500/30",
        };
      case "medium":
        return {
          badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          accent: "border-yellow-500/30",
        };
      default:
        return {
          badge: "bg-green-500/20 text-green-400 border-green-500/30",
          accent: "border-green-500/30",
        };
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return {
          card: "bg-green-500/10 border-green-500/20",
          icon: CheckCircle,
          iconColor: "text-green-500",
        };
      case "new":
        return {
          card: "bg-accent/10 border-accent/20",
          icon: Star,
          iconColor: "text-accent",
        };
      default:
        return {
          card: "bg-primary/10 border-primary/20",
          icon: Target,
          iconColor: "text-primary",
        };
    }
  };

  const difficultyStyles = getDifficultyStyles(challenge.difficulty);
  const statusStyles = getStatusStyles(challenge.status);
  const StatusIcon = statusStyles.icon;

  const progressPercentage = challenge.progress && challenge.maxProgress 
    ? (challenge.progress / challenge.maxProgress) * 100 
    : 0;

  const handleStartChallenge = async () => {
    try {
      // This would start the challenge or navigate to challenge details
      toast({
        title: "Challenge Started",
        description: `Starting "${challenge.title}"`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start challenge",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:scale-105",
        statusStyles.card,
        compact && "h-auto"
      )}
      data-testid={`challenge-${challenge.id}`}
    >
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn(statusStyles.iconColor, compact ? "w-4 h-4" : "w-5 h-5")} />
            <CardTitle className={cn(
              "text-foreground",
              compact ? "text-sm" : "text-base"
            )}>
              {challenge.title}
            </CardTitle>
          </div>
          
          <div className="flex gap-1">
            <Badge 
              className={cn(difficultyStyles.badge, compact ? "text-xs" : "text-xs")}
              data-testid={`challenge-difficulty-${challenge.difficulty}`}
            >
              {challenge.difficulty}
            </Badge>
            
            {challenge.status === "new" && (
              <Badge className="task-new">New</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("pt-0", compact && "space-y-2")}>
        <p className={cn(
          "text-muted-foreground mb-4",
          compact ? "text-xs mb-2" : "text-sm"
        )}>
          {challenge.description}
        </p>

        {/* Progress bar for active challenges */}
        {challenge.status === "active" && challenge.progress !== undefined && challenge.maxProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {challenge.progress}/{challenge.maxProgress}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              data-testid={`challenge-progress-${challenge.id}`}
            />
          </div>
        )}

        {/* Time remaining for time-limited challenges */}
        {challenge.timeRemaining && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
            <Clock size={16} className="text-accent" />
            <span className="text-sm font-medium">
              {challenge.timeRemaining} remaining
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="text-secondary" size={16} />
            <span className={cn(
              "font-semibold text-secondary",
              compact ? "text-sm" : "text-base"
            )}>
              +{challenge.reward.toLocaleString()} XP
            </span>
          </div>

          {challenge.status === "completed" ? (
            <Badge className="task-completed">
              <CheckCircle size={12} className="mr-1" />
              Completed
            </Badge>
          ) : (
            <Button 
              size={compact ? "sm" : "default"}
              onClick={handleStartChallenge}
              className="zkverify-gradient"
              data-testid={`challenge-start-${challenge.id}`}
            >
              <Play size={16} className="mr-2" />
              {challenge.status === "active" ? "Continue" : "Start"}
            </Button>
          )}
        </div>

        {/* Challenge type indicator */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <Badge variant="outline" className="text-xs">
            {challenge.type.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
