import { Badge as UIBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationBadgeProps {
  id: string;
  name: string;
  description?: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  category: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  animated?: boolean;
  className?: string;
}

export function GamificationBadge({
  id,
  name,
  description,
  icon,
  rarity,
  category,
  isUnlocked,
  unlockedAt,
  progress,
  maxProgress,
  size = "md",
  showDetails = true,
  animated = true,
  className
}: GamificationBadgeProps) {
  const getRarityStyles = () => {
    switch (rarity) {
      case "legendary":
        return {
          background: "bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-red-500/20",
          border: "border-yellow-500/40",
          glow: "shadow-[0_0_20px_rgba(251,191,36,0.4)]",
          text: "text-yellow-400"
        };
      case "epic":
        return {
          background: "bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-indigo-500/20",
          border: "border-purple-500/40",
          glow: "shadow-[0_0_20px_rgba(147,51,234,0.4)]",
          text: "text-purple-400"
        };
      case "rare":
        return {
          background: "bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20",
          border: "border-blue-500/40",
          glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]",
          text: "text-blue-400"
        };
      default:
        return {
          background: "bg-gradient-to-br from-gray-500/20 via-slate-500/20 to-zinc-500/20",
          border: "border-gray-500/40",
          glow: "shadow-[0_0_10px_rgba(107,114,128,0.3)]",
          text: "text-gray-400"
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          container: "h-16 w-16",
          icon: "text-2xl",
          text: "text-xs"
        };
      case "lg":
        return {
          container: "h-32 w-32",
          icon: "text-5xl",
          text: "text-base"
        };
      default:
        return {
          container: "h-24 w-24",
          icon: "text-4xl",
          text: "text-sm"
        };
    }
  };

  const rarityStyles = getRarityStyles();
  const sizeStyles = getSizeStyles();
  const progressPercentage = progress && maxProgress ? (progress / maxProgress) * 100 : 0;

  if (!showDetails) {
    // Compact badge display
    return (
      <div 
        className={cn(
          "relative rounded-full flex items-center justify-center transition-all duration-300",
          sizeStyles.container,
          isUnlocked ? rarityStyles.background : "bg-muted/50",
          isUnlocked ? rarityStyles.border : "border-muted",
          isUnlocked && animated ? `${rarityStyles.glow} hover:scale-110` : "",
          !isUnlocked && "opacity-60",
          "border-2",
          className
        )}
        data-testid={`badge-${id}`}
      >
        {isUnlocked ? (
          <span className={cn(sizeStyles.icon, rarityStyles.text)}>
            {icon}
          </span>
        ) : (
          <Lock className={cn("text-muted-foreground", size === "lg" ? "w-8 h-8" : "w-6 h-6")} />
        )}

        {isUnlocked && animated && (
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "animate-shimmer opacity-0 hover:opacity-100 transition-opacity"
          )} />
        )}

        {/* Rarity indicator */}
        <UIBadge 
          className={cn(
            "absolute -top-1 -right-1 text-xs px-1 py-0",
            `badge-${rarity}`
          )}
        >
          {rarity.charAt(0).toUpperCase()}
        </UIBadge>
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        "relative transition-all duration-300",
        isUnlocked ? rarityStyles.background : "bg-muted/20",
        isUnlocked ? rarityStyles.border : "border-muted",
        isUnlocked && animated ? `${rarityStyles.glow} hover:scale-105` : "",
        !isUnlocked && "opacity-60",
        className
      )}
      data-testid={`badge-card-${id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {/* Icon */}
          <div className={cn(
            "rounded-full flex items-center justify-center flex-shrink-0",
            "w-12 h-12",
            isUnlocked ? rarityStyles.background : "bg-muted/50",
            isUnlocked ? rarityStyles.border : "border-muted",
            "border-2"
          )}>
            {isUnlocked ? (
              <span className={cn("text-2xl", rarityStyles.text)}>
                {icon}
              </span>
            ) : (
              <Lock className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Badge Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                "font-semibold truncate",
                isUnlocked ? "text-foreground" : "text-muted-foreground"
              )}>
                {name}
              </h4>
              <UIBadge className={cn(`badge-${rarity}`, "text-xs")}>
                {rarity}
              </UIBadge>
            </div>

            {description && (
              <p className={cn(
                "text-xs line-clamp-2",
                isUnlocked ? "text-muted-foreground" : "text-muted-foreground/70"
              )}>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Progress for locked badges */}
        {!isUnlocked && progress !== undefined && maxProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs text-muted-foreground">
                {progress}/{maxProgress}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  rarityStyles.background.replace("/20", "/60")
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <UIBadge variant="outline" className="text-xs capitalize">
            {category}
          </UIBadge>

          {isUnlocked && unlockedAt && (
            <div className="flex items-center gap-1">
              <Sparkles size={12} className={rarityStyles.text} />
              <span className="text-xs text-muted-foreground">
                {new Date(unlockedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Unlock animation overlay */}
        {isUnlocked && animated && (
          <div className={cn(
            "absolute inset-0 pointer-events-none rounded-lg",
            "bg-gradient-to-r from-transparent via-white/10 to-transparent",
            "opacity-0 hover:opacity-100 transition-opacity animate-shimmer"
          )} />
        )}
      </CardContent>
    </Card>
  );
}
