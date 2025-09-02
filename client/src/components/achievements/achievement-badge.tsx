import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface AchievementBadgeProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    iconColor: string;
    xpReward: number;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export default function AchievementBadge({
  achievement,
  isUnlocked,
  unlockedAt,
  progress,
  maxProgress,
}: AchievementBadgeProps) {
  const getIconColorClass = (color: string, unlocked: boolean) => {
    if (!unlocked) return "bg-muted text-muted-foreground";
    
    switch (color) {
      case "primary": return "bg-gradient-to-br from-primary to-accent animate-glow";
      case "success": return "bg-gradient-to-br from-success to-green-400";
      case "accent": return "bg-gradient-to-br from-accent to-blue-400";
      case "yellow": return "bg-gradient-to-br from-yellow-500 to-orange-400";
      case "purple": return "bg-gradient-to-br from-purple-500 to-pink-500";
      default: return "bg-gradient-to-br from-primary to-accent";
    }
  };

  const getBorderClass = (color: string, unlocked: boolean) => {
    if (!unlocked) return "border-border";
    
    switch (color) {
      case "primary": return "border-2 border-primary";
      case "success": return "border-2 border-success";
      case "accent": return "border-2 border-accent";
      case "yellow": return "border-2 border-yellow-500";
      case "purple": return "border-2 border-purple-500";
      default: return "border-2 border-primary";
    }
  };

  const hasProgress = progress !== undefined && maxProgress !== undefined && maxProgress > 1;
  const progressPercentage = hasProgress ? (progress! / maxProgress!) * 100 : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`achievement-badge text-center transition-all duration-300 ${
          getBorderClass(achievement.iconColor, isUnlocked)
        } ${!isUnlocked ? 'opacity-60' : ''}`}
        data-testid={`achievement-${achievement.id}`}
      >
        <CardContent className="p-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            getIconColorClass(achievement.iconColor, isUnlocked)
          }`}>
            {isUnlocked ? (
              <i className={`${achievement.icon} text-white text-2xl`} />
            ) : (
              <i className="fas fa-lock text-2xl" />
            )}
          </div>
          
          <h3 className="font-semibold mb-2" data-testid={`text-achievement-title-${achievement.id}`}>
            {achievement.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3" data-testid={`text-achievement-description-${achievement.id}`}>
            {achievement.description}
          </p>

          {hasProgress && !isUnlocked ? (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-accent to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-accent" data-testid={`text-achievement-progress-${achievement.id}`}>
                {progress}/{maxProgress} progress
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span className={`text-xs ${isUnlocked ? 'text-success' : 'text-muted-foreground'}`}>
                {isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground" data-testid={`text-achievement-xp-${achievement.id}`}>
                +{achievement.xpReward} XP
              </span>
            </div>
          )}

          {isUnlocked && unlockedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
