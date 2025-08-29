import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardUser {
  id: string;
  username: string;
  twitterUsername?: string;
  profileImage?: string;
  level: number;
  xp: number;
  totalProofs: number;
  rank: number;
}

interface LeaderboardTableProps {
  data: LeaderboardUser[];
  isLoading: boolean;
  timeframe: string;
}

export function LeaderboardTable({ data, isLoading, timeframe }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={20} />;
      case 2:
        return <Medal className="text-gray-400" size={20} />;
      case 3:
        return <Award className="text-amber-600" size={20} />;
      default:
        return <span className="w-6 text-center text-muted-foreground font-medium">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "leaderboard-rank-1";
      case 2:
        return "leaderboard-rank-2";
      case 3:
        return "leaderboard-rank-3";
      default:
        return "";
    }
  };

  const getBadges = (user: LeaderboardUser) => {
    const badges = [];
    
    if (user.level >= 50) {
      badges.push({ text: "ZK Master", variant: "default" as const });
    } else if (user.level >= 25) {
      badges.push({ text: "Proof Pioneer", variant: "secondary" as const });
    } else if (user.level >= 10) {
      badges.push({ text: "Engagement Pro", variant: "outline" as const });
    }

    if (user.totalProofs >= 1000) {
      badges.push({ text: "Verified", variant: "default" as const });
    }

    return badges;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="loading-shimmer h-16 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="mx-auto text-muted-foreground mb-4" size={48} />
        <h3 className="text-lg font-semibold text-foreground mb-2">No rankings available</h3>
        <p className="text-muted-foreground">
          Be the first to complete challenges and appear on the leaderboard!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top 3 - Special Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {data.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className={`p-4 rounded-lg border ${getRankStyle(user.rank)}`}
            data-testid={`leaderboard-rank-${user.rank}`}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                {getRankIcon(user.rank)}
              </div>
              
              <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-primary/20">
                <AvatarImage 
                  src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                />
                <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <h3 className="font-semibold text-foreground mb-1">@{user.username}</h3>
              
              <div className="flex flex-wrap gap-1 justify-center mb-3">
                {getBadges(user).map((badge, index) => (
                  <Badge key={index} variant={badge.variant} className="text-xs">
                    {badge.text}
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">
                  {user.xp.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">XP</p>
                <p className="text-xs text-muted-foreground">
                  {user.totalProofs} zkProofs
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the leaderboard - Table Format */}
      {data.length > 3 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Level</TableHead>
              <TableHead className="hidden lg:table-cell">Proofs</TableHead>
              <TableHead className="text-right">XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(3).map((user) => (
              <TableRow key={user.id} data-testid={`leaderboard-row-${user.rank}`}>
                <TableCell className="font-medium">
                  <div className="flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage 
                        src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.username}
                      />
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">@{user.username}</p>
                      <div className="flex gap-1 mt-1">
                        {getBadges(user).slice(0, 2).map((badge, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {badge.text}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell className="hidden md:table-cell">
                  <Badge variant="secondary">Level {user.level}</Badge>
                </TableCell>
                
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {user.totalProofs}
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="font-bold text-foreground">
                    {user.xp.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">XP</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
