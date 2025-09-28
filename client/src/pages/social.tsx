import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import PostCard from "@/components/social/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function Social() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
  });

  const { data: onlineFriends, isLoading: friendsLoading } = useQuery({
    queryKey: ["/api/users/friends/online"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/posts", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setPostContent("");
      toast({
        title: "Post Created! 🎉",
        description: "Your post has been shared with the community.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePost = () => {
    if (!postContent.trim()) return;
    createPostMutation.mutate(postContent);
  };

  const trendingTopics = [
    "#zkproofs", "#groth16", "#tutorial", "#gasoptimization", "#risc0"
  ];

  const communityStats = {
    activeUsers: 2847,
    postsToday: 156,
    proofsVerified: 45892,
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage="social" />
      
      <main className="flex-1 md:ml-0">
        <MobileHeader />
        
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Community Hub</h1>
            <p className="text-muted-foreground">
              Connect, share, and learn with the zkEngage community
            </p>
          </motion.div>

          {/* Community Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Share Your ZK Journey</h3>
                    <p className="text-muted-foreground">
                      Connect with fellow developers, share insights, and build the future of zero-knowledge together
                    </p>
                  </div>
                  <div className="text-3xl">🌟</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-2xl">💬</span>
                    <span>Community Feed</span>
                  </CardTitle>
                  
                  {/* Post Composer */}
                  <div className="flex space-x-3 mt-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your ZK discoveries, ask questions, or celebrate wins..."
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="resize-none"
                        rows={3}
                        data-testid="input-post-content"
                      />
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" data-testid="button-add-image" title="Add Image">
                            <span className="text-lg">📷</span>
                          </Button>
                          <Button variant="ghost" size="sm" data-testid="button-add-code" title="Add Code">
                            <span className="text-lg">💻</span>
                          </Button>
                          <Button variant="ghost" size="sm" data-testid="button-add-poll" title="Create Poll">
                            <span className="text-lg">📊</span>
                          </Button>
                        </div>
                        <Button 
                          onClick={handlePost}
                          disabled={!postContent.trim() || createPostMutation.isPending}
                          data-testid="button-create-post"
                        >
                          {createPostMutation.isPending ? "Posting..." : "Share"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Feed Posts */}
                <CardContent className="p-0">
                  {postsLoading ? (
                    <div className="space-y-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-6 border-b border-border">
                          <div className="flex items-start space-x-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                              <Skeleton className="h-4 w-full mb-3" />
                              <div className="flex items-center space-x-4">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts?.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🚀</div>
                      <h3 className="text-xl font-semibold mb-2">Be the First to Share!</h3>
                      <p className="text-muted-foreground">
                        Start the conversation by sharing your ZK insights with the community
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {posts?.map((post: any, index: number) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <PostCard post={post} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Online Friends */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <span className="mr-2 text-green-500">🟢</span>
                    Online Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {friendsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-3 w-20 mb-1" />
                            <Skeleton className="h-2 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : onlineFriends?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="text-2xl mb-2">👋</div>
                      <p className="text-sm">No one online right now</p>
                      <p className="text-xs mt-1">Check back later!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {onlineFriends?.slice(0, 5).map((friend: any) => (
                        <div key={friend.id} className="flex items-center space-x-3 hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer" data-testid={`friend-${friend.id}`}>
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={friend.profileImageUrl} />
                              <AvatarFallback className="text-xs">
                                {friend.firstName?.[0]}{friend.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-card" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium" data-testid={`text-friend-name-${friend.id}`}>
                              {friend.firstName} {friend.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Level {friend.level}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trending Topics */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <span className="mr-2">🔥</span>
                    Trending Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic, index) => (
                      <Badge
                        key={topic}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        data-testid={`trending-topic-${index}`}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <p>💡 Click on topics to see related posts</p>
                  </div>
                </CardContent>
              </Card>

              {/* Community Stats */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <span className="mr-2">📊</span>
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Users</span>
                      <span className="text-sm font-medium text-green-600" data-testid="text-active-users">
                        {communityStats.activeUsers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Posts Today</span>
                      <span className="text-sm font-medium text-blue-600" data-testid="text-posts-today">
                        {communityStats.postsToday}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Proofs Verified</span>
                      <span className="text-sm font-medium text-purple-600" data-testid="text-proofs-verified">
                        {communityStats.proofsVerified.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community Guidelines */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <span className="mr-2">📖</span>
                    Community Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start space-x-2">
                      <span>•</span>
                      <span>Be respectful and constructive</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span>•</span>
                      <span>Share knowledge and learn together</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span>•</span>
                      <span>Help newcomers get started</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span>•</span>
                      <span>Keep discussions ZK-focused</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}