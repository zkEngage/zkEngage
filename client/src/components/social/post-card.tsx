import { motion } from "framer-motion";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl?: string;
      level: number;
    };
    isLiked?: boolean;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`);
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 20) return "bg-primary/20 text-primary";
    if (level >= 15) return "bg-accent/20 text-accent";
    if (level >= 10) return "bg-success/20 text-success";
    return "bg-muted text-muted-foreground";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 border-b border-border last:border-b-0"
      data-testid={`post-${post.id}`}
    >
      <div className="flex items-start space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.user.profileImageUrl} />
          <AvatarFallback>
            {post.user.firstName?.[0]}{post.user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium" data-testid={`text-post-author-${post.id}`}>
              {post.user.firstName} {post.user.lastName}
            </span>
            <span className="text-sm text-muted-foreground" data-testid={`text-post-time-${post.id}`}>
              {formatTimeAgo(post.createdAt)}
            </span>
            <Badge className={getLevelBadgeColor(post.user.level)} data-testid={`badge-post-level-${post.id}`}>
              Level {post.user.level}
            </Badge>
          </div>
          
          <p className="text-sm mb-3" data-testid={`text-post-content-${post.id}`}>
            {post.content}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`p-0 h-auto ${isLiked ? 'text-red-500' : 'hover:text-red-500'} transition-colors`}
              data-testid={`button-like-post-${post.id}`}
            >
              <i className={`${isLiked ? 'fas' : 'far'} fa-heart mr-1`} />
              <span data-testid={`text-post-likes-${post.id}`}>
                {post.likes + (isLiked && !post.isLiked ? 1 : !isLiked && post.isLiked ? -1 : 0)}
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:text-primary transition-colors"
              data-testid={`button-comment-post-${post.id}`}
            >
              <i className="far fa-comment mr-1" />
              <span data-testid={`text-post-comments-${post.id}`}>
                {post.comments}
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto hover:text-primary transition-colors"
              data-testid={`button-share-post-${post.id}`}
            >
              <i className="fas fa-share mr-1" />
              <span data-testid={`text-post-shares-${post.id}`}>
                {post.shares}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
