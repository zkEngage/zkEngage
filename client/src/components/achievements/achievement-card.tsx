import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirements?: any;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (achievement.isUnlocked && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.7)" }
      );
    }
  }, [achievement.isUnlocked]);

  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return {
          card: "border-gradient-to-r from-yellow-500 to-orange-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/10",
          badge: "badge-legendary",
          glow: achievement.isUnlocked ? "shadow-glow-lg" : "",
        };
      case "epic":
        return {
          card: "border-purple-500/30 bg-purple-500/10",
          badge: "badge-epic",
          glow: achievement.isUnlocked ? "shadow-glow" : "",
        };
      case "rare":
        return {
          card: "border-blue-500/30 bg-blue-500/10",
          badge: "badge-rare",
          glow: achievement.isUnlocked ? "shadow-glow" : "",
        };
      default:
        return {
          card: "border-gray-500/30 bg-gray-500/10",
          badge: "badge-common",
          glow: "",
        };
    }
  };

  const styles = getRarityStyles(achievement.rarity);
  const progressPercentage = achievement.progress && achievement.maxProgress 
    ? (achievement.progress / achievement.maxProgress) * 100 
    : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "transition-all duration-300 hover:scale-105",
        styles.card,
        styles.glow,
        !achievement.isUnlocked && "opacity-60",
        compact ? "p-3" : ""
      )}
      data-testid={`achievement-${achievement.id}`}
    >
      <CardContent className={cn("p-6", compact && "p-3")}>
        <div className={cn("flex gap-4", compact && "gap-3")}>
          {/* Icon */}
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0",
            compact && "w-10 h-10 text-xl",
            achievement.isUnlocked 
              ? "bg-primary/20 text-primary" 
              : "bg-muted/50 text-muted-foreground"
          )}>
            {achievement.isUnlocked ? (
              <span>{achievement.icon}</span>
            ) : (
              <Lock size={compact ? 16 : 20} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={cn(
                "font-semibold text-foreground truncate",
                compact ? "text-sm" : "text-base"
              )}>
                {achievement.name}
              </h3>
              <Badge 
                className={cn(styles.badge, compact ? "text-xs" : "text-xs")}
                data-testid={`achievement-rarity-${achievement.rarity}`}
              >
                {achievement.rarity}
              </Badge>
            </div>

            <p className={cn(
              "text-muted-foreground mb-3",
              compact ? "text-xs line-clamp-2" : "text-sm"
            )}>
              {achievement.description}
            </p>

            {/* Progress bar for locked achievements */}
            {!achievement.isUnlocked && achievement.progress !== undefined && achievement.maxProgress && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs text-muted-foreground">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-1.5"
                  data-testid={`achievement-progress-${achievement.id}`}
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className={cn("capitalize", compact ? "text-xs" : "text-xs")}
              >
                {achievement.category}
              </Badge>

              {achievement.isUnlocked && achievement.unlockedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>{formatDate(achievement.unlockedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unlock animation effect */}
        {achievement.isUnlocked && (
          <div className={cn(
            "absolute inset-0 pointer-events-none",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "animate-shimmer"
          )} />
        )}
      </CardContent>
    </Card>
  );
}
