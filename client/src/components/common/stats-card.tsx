import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  color: "primary" | "success" | "accent" | "yellow" | "destructive";
  gradient?: boolean;
  testId?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  gradient = false,
  testId 
}: StatsCardProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary": return "bg-primary/20 text-primary";
      case "success": return "bg-success/20 text-success";
      case "accent": return "bg-accent/20 text-accent";
      case "yellow": return "bg-yellow-500/20 text-yellow-500";
      case "destructive": return "bg-destructive/20 text-destructive";
      default: return "bg-primary/20 text-primary";
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-border hover:border-primary/30 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground" data-testid={`text-stats-title-${testId}`}>
                {title}
              </p>
              <p 
                className={`text-2xl font-bold ${gradient ? 'gradient-text' : ''}`}
                data-testid={`text-stats-value-${testId}`}
              >
                {value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(color)}`}>
              <i className={`${icon} text-lg`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
