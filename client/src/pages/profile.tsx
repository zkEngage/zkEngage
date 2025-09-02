import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: userStats } = useQuery({
    queryKey: ["/api/users/stats"],
  });

  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements/user"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/activities"],
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      title: user?.title || "",
      bio: user?.bio || "",
      githubUrl: user?.githubUrl || "",
      twitterUrl: user?.twitterUrl || "",
      websiteUrl: user?.websiteUrl || "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        title: user.title || "",
        bio: user.bio || "",
        githubUrl: user.githubUrl || "",
        twitterUrl: user.twitterUrl || "",
        websiteUrl: user.websiteUrl || "",
      });
    }
  }, [user, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      await apiRequest("PUT", "/api/users/profile", profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated!",
        description: "Your profile has been successfully updated.",
      });
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage="profile" />
      
      <main className="flex-1 md:ml-0">
        <MobileHeader />
        
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Profile</h1>
            <p className="text-muted-foreground">
              Manage your zkEngage profile and showcase your achievements
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="border-border">
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                      <Avatar className="w-24 h-24 border-4 border-primary mx-auto">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="text-2xl">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full p-0"
                        data-testid="button-change-avatar"
                      >
                        <i className="fas fa-camera text-sm" />
                      </Button>
                    </div>
                    <h2 className="text-xl font-bold mb-1" data-testid="text-profile-name">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-muted-foreground mb-2" data-testid="text-profile-title">
                      {user?.title || "ZK Developer"}
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        Level {userStats?.level || 1}
                      </Badge>
                      <span className="text-muted-foreground">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total XP</span>
                      <span className="font-semibold gradient-text" data-testid="text-total-xp">
                        {userStats?.totalXP?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Achievements</span>
                      <span className="font-semibold" data-testid="text-achievements-count">
                        {userAchievements?.length || 0}/24
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quests Completed</span>
                      <span className="font-semibold" data-testid="text-quests-completed">
                        {userStats?.completedQuests || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Global Rank</span>
                      <span className="font-semibold" data-testid="text-global-rank">
                        #{userStats?.rank || 0}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {user?.bio && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="font-semibold mb-2">Bio</h3>
                      <p className="text-sm text-muted-foreground" data-testid="text-profile-bio">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {/* Social Links */}
                  {(user?.githubUrl || user?.twitterUrl || user?.websiteUrl) && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h3 className="font-semibold mb-3">Links</h3>
                      <div className="space-y-2">
                        {user.githubUrl && (
                          <a 
                            href={user.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            data-testid="link-github"
                          >
                            <i className="fab fa-github w-4" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {user.twitterUrl && (
                          <a 
                            href={user.twitterUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            data-testid="link-twitter"
                          >
                            <i className="fab fa-twitter w-4" />
                            <span>Twitter</span>
                          </a>
                        )}
                        {user.websiteUrl && (
                          <a 
                            href={user.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            data-testid="link-website"
                          >
                            <i className="fas fa-globe w-4" />
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Edit Profile Form */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Profile Information */}
                    <div>
                      <h4 className="font-medium mb-4">Profile Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            {...register("firstName")}
                            data-testid="input-first-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            {...register("lastName")}
                            data-testid="input-last-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            {...register("username")}
                            data-testid="input-username"
                          />
                        </div>
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            {...register("title")}
                            placeholder="e.g., ZK Developer"
                            data-testid="input-title"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        {...register("bio")}
                        rows={3}
                        placeholder="Tell us about yourself..."
                        data-testid="input-bio"
                      />
                    </div>

                    {/* Social Links */}
                    <div>
                      <h4 className="font-medium mb-4">Social Links</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <i className="fab fa-github text-muted-foreground w-6" />
                          <Input
                            {...register("githubUrl")}
                            placeholder="GitHub profile URL"
                            data-testid="input-github-url"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="fab fa-twitter text-muted-foreground w-6" />
                          <Input
                            {...register("twitterUrl")}
                            placeholder="Twitter profile URL"
                            data-testid="input-twitter-url"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <i className="fas fa-globe text-muted-foreground w-6" />
                          <Input
                            {...register("websiteUrl")}
                            placeholder="Website URL"
                            data-testid="input-website-url"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-save-profile"
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-start space-x-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-48 mb-2" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-clock text-4xl mb-4 opacity-50" />
                      <p>No recent activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activities?.map((activity: any) => (
                        <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'quest_completed' ? 'bg-success/20' :
                            activity.type === 'achievement_unlocked' ? 'bg-primary/20' :
                            activity.type === 'level_up' ? 'bg-accent/20' :
                            'bg-muted'
                          }`}>
                            <i className={`${
                              activity.type === 'quest_completed' ? 'fas fa-check text-success' :
                              activity.type === 'achievement_unlocked' ? 'fas fa-trophy text-primary' :
                              activity.type === 'level_up' ? 'fas fa-arrow-up text-accent' :
                              'fas fa-clock text-muted-foreground'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-1" data-testid={`text-activity-title-${activity.id}`}>
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2" data-testid={`text-activity-description-${activity.id}`}>
                              {activity.description}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Achievement Gallery */}
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Achievement Gallery</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/achievements" data-testid="link-view-all-achievements">
                        View All
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {achievementsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="text-center">
                          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-2" />
                          <Skeleton className="h-3 w-20 mx-auto" />
                        </div>
                      ))}
                    </div>
                  ) : userAchievements?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <i className="fas fa-trophy text-4xl mb-4 opacity-50" />
                      <p>No achievements unlocked yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {userAchievements?.slice(0, 4).map((userAchievement: any) => (
                        <div key={userAchievement.id} className="text-center" data-testid={`achievement-${userAchievement.achievement.id}`}>
                          <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center animate-glow ${
                            userAchievement.achievement.iconColor === 'primary' ? 'bg-gradient-to-br from-primary to-accent' :
                            userAchievement.achievement.iconColor === 'success' ? 'bg-gradient-to-br from-success to-green-400' :
                            userAchievement.achievement.iconColor === 'accent' ? 'bg-gradient-to-br from-accent to-blue-400' :
                            'bg-gradient-to-br from-yellow-500 to-orange-400'
                          }`}>
                            <i className={`${userAchievement.achievement.icon} text-white text-lg`} />
                          </div>
                          <p className="text-xs font-medium" data-testid={`text-achievement-title-${userAchievement.achievement.id}`}>
                            {userAchievement.achievement.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Stats */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold gradient-text mb-1" data-testid="text-stat-quests">
                        {userStats?.completedQuests || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Quests Done</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success mb-1" data-testid="text-stat-xp">
                        {userStats?.totalXP?.toLocaleString() || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Total XP</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent mb-1" data-testid="text-stat-streak">
                        {userStats?.streak || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Day Streak</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400 mb-1" data-testid="text-stat-rank">
                        {userStats?.rank || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Global Rank</p>
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
