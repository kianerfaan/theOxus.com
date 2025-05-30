import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Users, TrendingUp, Clock, User, ArrowLeft, Plus, LogIn, Heart, Reply, ChevronUp, ChevronDown, Timer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function Forum() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const [sortBy, setSortBy] = useState<'recent' | 'upvotes' | 'downvotes' | 'soon-to-delete'>('recent');
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  // Fetch forum posts from API
  const { data: posts = [], isLoading: postsLoading } = useQuery<any[]>({
    queryKey: ["/api/forum-posts"],
    enabled: true,
  });

  // Fetch community members count
  const { data: communityData } = useQuery({
    queryKey: ['/api/community-members-count'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/forum-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Failed to create post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      setPostContent("");
      setShowNewPost(false);
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: number; voteType: 'up' | 'down' }) => {
      const response = await fetch(`/api/forum-posts/${postId}/vote`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (!response.ok) throw new Error("Failed to vote");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
    },
  });

  const categories = [
    { id: "all", name: "All Topics", count: 0, color: "bg-blue-500" },
    { id: "general", name: "General Discussion", count: 0, color: "bg-green-500" },
    { id: "news", name: "News Analysis", count: 0, color: "bg-purple-500" },
    { id: "tech", name: "Technology", count: 0, color: "bg-orange-500" },
    { id: "politics", name: "Politics & World Events", count: 0, color: "bg-red-500" }
  ];

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter((post: any) => post.category === selectedCategory);

  const sortedPosts = [...filteredPosts].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'upvotes':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case 'downvotes':
        return (a.upvotes - a.downvotes) - (b.upvotes - b.downvotes);
      case 'soon-to-delete':
        return new Date(a.deleteAt).getTime() - new Date(b.deleteAt).getTime();
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const isAuthenticated = !!user;

  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    if (!isAuthenticated) return;
    
    const currentVote = userVotes[postId];
    
    // If user already voted the same way, do nothing
    if (currentVote === voteType) return;
    
    // Update user votes locally for immediate feedback
    setUserVotes(prev => ({
      ...prev,
      [postId]: voteType
    }));
    
    // Submit vote to API
    voteMutation.mutate({ postId, voteType });
  };

  const getTimeUntilDeletion = (deleteAt: string) => {
    const now = new Date().getTime();
    const deleteTime = new Date(deleteAt).getTime();
    const timeLeft = deleteTime - now;
    
    if (timeLeft <= 0) return "Expired";
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleSubmitPost = () => {
    if (!postContent.trim() || !isAuthenticated) return;
    
    createPostMutation.mutate(postContent.trim());
    console.log("Post submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="w-fit">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold">Community Forum</h1>
                <Badge variant="destructive" className="ml-2 text-xs">New!</Badge>
              </div>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect with the theOxus community • Share insights • Discuss current events
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {!isAuthenticated && <GoogleSignInButton />}
            <Button 
              onClick={() => setShowNewPost(!showNewPost)} 
              className="gap-2"
              disabled={!isAuthenticated}
              variant={isAuthenticated ? "default" : "secondary"}
            >
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {communityData?.activeMembersLast7Days ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Community Members (Last 7 Days)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{sortedPosts.length}</p>
                  <p className="text-sm text-muted-foreground">Posts This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Post Form */}
        {showNewPost && isAuthenticated && (
          <Card className="mb-6 lg:mb-8">
            <CardHeader>
              <CardTitle>Share with the Community</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Share your thoughts, insights, or questions with the theOxus community..."
                  rows={6}
                  className="min-h-[150px] resize-none"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    className="flex-1 sm:flex-none"
                    onClick={handleSubmitPost}
                    disabled={!postContent.trim() || createPostMutation.isPending}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {createPostMutation.isPending ? "Posting..." : "Post to Forum"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowNewPost(false);
                      setPostContent("");
                    }} 
                    className="flex-1 sm:flex-none"
                    disabled={createPostMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Community Posts</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="upvotes">Most Upvoted</SelectItem>
                <SelectItem value="downvotes">Most Downvoted</SelectItem>
                <SelectItem value="soon-to-delete">Soon to Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          {/* Authentication Overlay */}
          {!isAuthenticated && (
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-background/30 flex items-center justify-center">
              <Card className="p-8 text-center">
                <CardContent>
                  <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Sign in to join the discussion</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with the theOxus community and share your insights
                  </p>
                  <GoogleSignInButton />
                </CardContent>
              </Card>
            </div>
          )}

          <div className={`${!isAuthenticated ? 'blur-sm' : ''}`}>
            {/* Forum Posts */}
            <div className="space-y-4">
              {sortedPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to start a discussion in the community!
                    </p>
                    <Button 
                      onClick={() => setShowNewPost(true)}
                      disabled={!isAuthenticated}
                    >
                      Create First Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                sortedPosts.map((post: any) => (
                  <Card key={post.id} className="transition-all duration-200 hover:shadow-md">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <button 
                              onClick={() => handleVote(post.id, 'up')}
                              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                userVotes[post.id] === 'up' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'hover:bg-green-100 hover:text-green-600'
                              }`}
                              disabled={!isAuthenticated}
                            >
                              <ChevronUp className="h-5 w-5" />
                            </button>
                            <span className="text-sm font-semibold">
                              {post.upvotes - post.downvotes}
                            </span>
                            <button 
                              onClick={() => handleVote(post.id, 'down')}
                              className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                userVotes[post.id] === 'down' 
                                  ? 'bg-red-100 text-red-600' 
                                  : 'hover:bg-red-100 hover:text-red-600'
                              }`}
                              disabled={!isAuthenticated}
                            >
                              <ChevronDown className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed">{post.content}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
                          <span className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            Auto-deletes in {getTimeUntilDeletion(post.deleteAt)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Community Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">✅ Please Do:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Keep discussions respectful and constructive</li>
                  <li>• Share reliable sources and fact-check information</li>
                  <li>• Use appropriate categories for your posts</li>
                  <li>• Search before posting to avoid duplicates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">❌ Please Don't:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Share misinformation or unverified claims</li>
                  <li>• Engage in personal attacks or harassment</li>
                  <li>• Post spam or promotional content</li>
                  <li>• Share content that violates our terms of service</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}