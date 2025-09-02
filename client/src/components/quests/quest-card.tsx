import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface QuestCardProps {
  quest: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    xpReward: number;
    icon: string;
    iconColor: string;
    maxSteps: number;
  };
  progress?: {
    current: number;
    total: number;
  };
  isCompleted?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  isStarting?: boolean;
  isCompleting?: boolean;
  compact?: boolean;
}

export default function QuestCard({
  quest,
  progress,
  isCompleted,
  onStart,
  onComplete,
  isStarting,
  isCompleting,
  compact = false,
}: QuestCardProps) {
  const progressPercentage = progress ? (progress.current / progress.total) * 100 : 0;
  const canComplete = progress && progress.current >= progress.total;

  const getIconColorClass = (color: string) => {
    switch (color) {
      case "primary": return "bg-primary/20 text-primary";
      case "success": return "bg-success/20 text-success";
      case "accent": return "bg-accent/20 text-accent";
      case "yellow": return "bg-yellow-500/20 text-yellow-500";
      case "purple": return "bg-purple-500/20 text-purple-500";
      default: return "bg-primary/20 text-primary";
    }
  };

  const getXpBadgeColor = (color: string) => {
    switch (color) {
      case "primary": return "bg-primary/20 text-primary";
      case "success": return "bg-success/20 text-success";
      case "accent": return "bg-accent/20 text-accent";
      case "yellow": return "bg-yellow-500/20 text-yellow-500";
      case "purple": return "bg-purple-500/20 text-purple-500";
      default: return "bg-primary/20 text-primary";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`quest-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer ${
          isCompleted ? 'opacity-75' : ''
        }`}
        data-testid={`quest-card-${quest.id}`}
      >
        <CardContent className={compact ? "p-4" : "p-6"}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColorClass(quest.iconColor)}`}>
                <i className={`${quest.icon} text-lg`} />
              </div>
              <div>
                <h3 className="font-semibold" data-testid={`text-quest-title-${quest.id}`}>
                  {quest.title}
                </h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {quest.difficulty}
                </p>
              </div>
            </div>
            <Badge className={getXpBadgeColor(quest.iconColor)} data-testid={`text-quest-xp-${quest.id}`}>
              +{quest.xpReward} XP
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground mb-4" data-testid={`text-quest-description-${quest.id}`}>
            {quest.description}
          </p>

          {/* Progress Section */}
          <div className="space-y-2">
            {progress ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span data-testid={`text-quest-progress-${quest.id}`}>
                    {progress.current}/{progress.total} steps
                  </span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                  data-testid={`progress-quest-${quest.id}`}
                />
                {!isCompleted && canComplete && (
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={onComplete}
                    disabled={isCompleting}
                    data-testid={`button-complete-quest-${quest.id}`}
                  >
                    {isCompleting ? "Completing..." : "Complete Quest"}
                  </Button>
                )}
                {isCompleted && (
                  <div className="flex items-center justify-center text-success text-sm font-medium mt-3">
                    <i className="fas fa-check mr-2" />
                    Completed
                  </div>
                )}
              </>
            ) : (
              <Button
                size="sm"
                className="w-full"
                onClick={onStart}
                disabled={isStarting}
                data-testid={`button-start-quest-${quest.id}`}
              >
                {isStarting ? "Starting..." : "Start Quest"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
