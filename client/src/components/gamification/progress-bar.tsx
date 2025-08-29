import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GamificationProgressProps {
  current: number;
  target: number;
  label?: string;
  showPercentage?: boolean;
  showNumbers?: boolean;
  variant?: "default" | "xp" | "level" | "achievement";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function GamificationProgress({
  current,
  target,
  label,
  showPercentage = true,
  showNumbers = true,
  variant = "default",
  size = "md",
  animated = false,
  className
}: GamificationProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);
  
  const getVariantStyles = () => {
    switch (variant) {
      case "xp":
        return {
          progress: "bg-gradient-to-r from-blue-500 to-purple-500",
          container: "border-blue-500/20 bg-blue-500/10",
          text: "text-blue-400"
        };
      case "level":
        return {
          progress: "bg-gradient-to-r from-green-500 to-emerald-500",
          container: "border-green-500/20 bg-green-500/10",
          text: "text-green-400"
        };
      case "achievement":
        return {
          progress: "bg-gradient-to-r from-yellow-500 to-orange-500",
          container: "border-yellow-500/20 bg-yellow-500/10",
          text: "text-yellow-400"
        };
      default:
        return {
          progress: "zkverify-gradient",
          container: "border-primary/20 bg-primary/10",
          text: "text-primary"
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          height: "h-1",
          text: "text-xs",
          padding: "p-2"
        };
      case "lg":
        return {
          height: "h-3",
          text: "text-base",
          padding: "p-4"
        };
      default:
        return {
          height: "h-2",
          text: "text-sm",
          padding: "p-3"
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div 
      className={cn(
        "rounded-lg border transition-all duration-300",
        variantStyles.container,
        sizeStyles.padding,
        animated && "hover:scale-[1.02]",
        className
      )}
      data-testid="gamification-progress"
    >
      {label && (
        <div className={cn("font-medium mb-2", sizeStyles.text)}>
          {label}
        </div>
      )}

      <div className="flex items-center justify-between mb-1">
        {showNumbers && (
          <div className={cn("font-medium", sizeStyles.text, variantStyles.text)}>
            {current.toLocaleString()} / {target.toLocaleString()}
          </div>
        )}
        
        {showPercentage && (
          <Badge 
            variant="outline" 
            className={cn("text-xs", variantStyles.text)}
          >
            {percentage.toFixed(1)}%
          </Badge>
        )}
      </div>

      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn(sizeStyles.height, "relative overflow-hidden")}
          data-testid="progress-bar"
        />
        
        {animated && percentage > 0 && (
          <div 
            className={cn(
              "absolute inset-0 rounded-full opacity-60",
              "bg-gradient-to-r from-transparent via-white/30 to-transparent",
              "animate-shimmer"
            )}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      {current >= target && (
        <div className="flex items-center justify-center mt-2">
          <Badge 
            className={cn(
              "animate-badge-unlock",
              variantStyles.progress
            )}
          >
            ✨ Complete!
          </Badge>
        </div>
      )}
    </div>
  );
}
