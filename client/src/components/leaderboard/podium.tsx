import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PodiumProps {
  topThree: Array<{
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    level: number;
    totalXP: number;
  }>;
  currentUserId?: string;
}

export default function Podium({ topThree, currentUserId }: PodiumProps) {
  const positions = [
    { user: topThree[1], rank: 2, height: "h-32", medal: "🥈", color: "border-gray-400" },
    { user: topThree[0], rank: 1, height: "h-40", medal: "🥇", color: "border-primary", crown: true },
    { user: topThree[2], rank: 3, height: "h-28", medal: "🥉", color: "border-amber-600" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
    >
      {positions.map((position, index) => {
        if (!position.user) return null;
        
        const isCurrentUser = position.user.id === currentUserId;
        
        return (
          <motion.div
            key={position.user.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`order-${index + 1} md:order-${position.rank === 1 ? 2 : position.rank === 2 ? 1 : 3}`}
          >
            <Card 
              className={`border-border text-center relative ${
                position.rank === 1 ? 'border-2 border-primary' : ''
              } ${isCurrentUser ? 'ring-2 ring-accent' : ''}`}
              data-testid={`podium-${position.rank}`}
            >
              {position.crown && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-crown text-white text-sm" />
                  </div>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className={`w-${position.rank === 1 ? '24' : '20'} h-${position.rank === 1 ? '24' : '20'} mx-auto mb-4 relative`}>
                  <Avatar className={`w-full h-full ${position.color} border-4 ${
                    position.rank === 1 ? 'animate-glow' : ''
                  }`}>
                    <AvatarImage src={position.user.profileImageUrl} />
                    <AvatarFallback className="text-lg">
                      {position.user.firstName?.[0]}{position.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -top-2 -right-2 w-${position.rank === 1 ? '10' : '8'} h-${position.rank === 1 ? '10' : '8'} ${
                    position.rank === 1 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                      : position.rank === 2 
                        ? 'bg-gray-400' 
                        : 'bg-amber-600'
                  } rounded-full flex items-center justify-center text-white font-bold ${
                    position.rank === 1 ? 'text-base' : 'text-sm'
                  }`}>
                    {position.rank}
                  </div>
                </div>
                
                <h3 className="font-semibold mb-1" data-testid={`text-podium-name-${position.rank}`}>
                  {position.user.firstName} {position.user.lastName}
                  {isCurrentUser && " (You)"}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-2" data-testid={`text-podium-level-${position.rank}`}>
                  Level {position.user.level}
                </p>
                
                <p className={`${position.rank === 1 ? 'text-xl' : 'text-lg'} font-bold gradient-text`} data-testid={`text-podium-xp-${position.rank}`}>
                  {position.user.totalXP?.toLocaleString()} XP
                </p>
                
                <div className="text-sm text-muted-foreground mt-2">
                  {position.medal} {position.rank === 1 ? 'Champion' : position.rank === 2 ? 'Runner-up' : 'Third Place'}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
