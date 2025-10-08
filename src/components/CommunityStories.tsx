import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Badge } from "./ui/badge.tsx";
import { Avatar, AvatarFallback } from "./ui/avatar.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { BookOpen, Plus, Heart, MessageCircle, Share2, EyeOff, Clock, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiCall } from "../../utils/supabase/client.ts";
import { toast } from "sonner";

interface Story {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  isAnonymous: boolean;
  createdAt: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  tags: string[];
  readTime: number;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  isAnonymous: boolean;
  createdAt: string;
  likes: number;
}

interface CommunityStoriesProps {
  user?: any;
}

export function CommunityStories({ user }: CommunityStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newStory, setNewStory] = useState<Partial<Story>>({
    category: 'personal-growth',
    isAnonymous: false,
    tags: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    loadStories();
    // Refresh stories every 30 seconds
    const interval = setInterval(loadStories, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDemoStories = () => {
    const demoStories: Story[] = [
      {
        id: 'demo-1',
        title: 'Finding Light in Dark Times',
        content: `After struggling with anxiety for years, I finally found techniques that work for me. Daily meditation, journaling, and connecting with this supportive community have been game-changers. Remember: progress isn't always linear, and that's okay. Every small step forward counts, even on days when it feels like you're moving backwards.

The journey to better mental health is deeply personal, and what works for one person might not work for another. I've learned to be patient with myself and celebrate small victories. Today, I'm sharing my story in hopes that it might help someone else feel less alone.`,
        category: 'personal-growth',
        authorId: 'demo-user-1',
        authorName: 'Sarah M.',
        authorAvatar: '🌸',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 42,
        likedBy: [],
        comments: [],
        tags: ['anxiety', 'mindfulness', 'self-care'],
        readTime: 2
      },
      {
        id: 'demo-2',
        title: 'My College Anxiety Journey',
        content: `Being a college student comes with unique pressures. Between exams, social expectations, and figuring out my future, anxiety became overwhelming. But I've learned that asking for help isn't weakness—it's strength. The campus counseling center, peer support groups, and this amazing app have all played crucial roles in my recovery.`,
        category: 'student-life',
        authorId: 'demo-user-2',
        authorName: 'Alex K.',
        authorAvatar: '🎓',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 28,
        likedBy: [],
        comments: [],
        tags: ['college', 'support', 'recovery'],
        readTime: 1
      },
      {
        id: 'demo-3',
        title: 'Breaking the Silence',
        content: `For the longest time, I felt like I had to hide my struggles with depression. Sharing anonymously here gave me the courage to eventually open up to friends and family. You are not alone, and your feelings are valid. There's no shame in seeking help.`,
        category: 'depression',
        authorId: 'demo-user-3',
        authorName: 'Anonymous',
        authorAvatar: '🎭',
        isAnonymous: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 56,
        likedBy: [],
        comments: [],
        tags: ['depression', 'courage', 'hope'],
        readTime: 1
      },
      {
        id: 'demo-4',
        title: 'Work-Life Balance and Mental Health',
        content: `Burnout hit me hard last year. I was working 60+ hour weeks and my mental health suffered. Learning to set boundaries, take breaks, and prioritize self-care wasn't selfish—it was necessary. Now I'm more productive AND happier.`,
        category: 'workplace',
        authorId: 'demo-user-4',
        authorName: 'Jamie L.',
        authorAvatar: '💼',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 34,
        likedBy: [],
        comments: [],
        tags: ['burnout', 'boundaries', 'self-care'],
        readTime: 2
      }
    ];
    
    setStories(demoStories);
    setDemoMode(true);
    setError(null);
  };

  const loadStories = async () => {
    try {
      setError(null);
      const response = await apiCall('/stories?limit=50');
      if (response.success && Array.isArray(response.stories)) {
        setStories(response.stories);
        setError(null);
        setDemoMode(false);
      } else {
        console.warn('No stories found or invalid response format');
        setStories([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a network error - automatically switch to demo mode
      if (errorMessage.includes('Failed to fetch')) {
        console.log('ℹ️ Backend not available - Loading demo stories for Community feature');
        loadDemoStories();
        return; // Don't set error, just use demo mode
      } else {
        console.error('Error loading stories:', error);
        setError('Failed to load stories. Please try again later.');
        setStories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const createStory = async () => {
    if (demoMode) {
      toast.error('Story creation requires backend deployment. Currently in demo mode.');
      return;
    }

    if (!newStory.title?.trim() || !newStory.content?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user) {
      toast.error('Please sign in to share a story');
      return;
    }

    try {
      const response = await apiCall('/stories', {
        method: 'POST',
        body: JSON.stringify({
          title: newStory.title,
          content: newStory.content,
          category: newStory.category || 'personal-growth',
          isAnonymous: newStory.isAnonymous || false,
          tags: newStory.tags || []
        })
      });

      if (response.success) {
        setStories([response.story, ...stories]);
        setNewStory({ category: 'personal-growth', isAnonymous: false, tags: [] });
        setShowCreateDialog(false);
        toast.success('Story shared successfully! 🎉');
      }
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to share story');
    }
  };

  const toggleLike = async (storyId: string) => {
    if (demoMode) {
      toast.info('Liking stories requires backend deployment. Currently in demo mode.');
      return;
    }

    if (!user) {
      toast.error('Please sign in to like stories');
      return;
    }

    try {
      const response = await apiCall(`/stories/${storyId}/like`, {
        method: 'PUT'
      });

      if (response.success) {
        setStories(stories.map(story => 
          story.id === storyId ? response.story : story
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'personal-growth': 'bg-green-100 text-green-700 border-green-200',
      'anxiety': 'bg-blue-100 text-blue-700 border-blue-200',
      'depression': 'bg-purple-100 text-purple-700 border-purple-200',
      'student-life': 'bg-orange-100 text-orange-700 border-orange-200',
      'relationships': 'bg-pink-100 text-pink-700 border-pink-200',
      'workplace': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const filteredStories = (stories || [])
    .filter(story => {
      if (!story) return false;
      const matchesSearch = (story.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (story.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (story.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = !selectedCategory || selectedCategory === 'all' || story.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
        case 'comments':
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-semibold">Community Stories</h2>
              {demoMode && (
                <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                  Demo Mode
                </Badge>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {demoMode ? 'Viewing sample stories (backend not connected)' : 'Share your journey and inspire others'}
            </p>
          </div>
        </div>
        
        {user && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Share Your Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Share Your Story</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Give your story a compelling title..."
                  value={newStory.title || ''}
                  onChange={(e) => setNewStory({...newStory, title: e.target.value})}
                />
                
                <Select value={newStory.category} onValueChange={(value) => setNewStory({...newStory, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal-growth">Personal Growth</SelectItem>
                    <SelectItem value="anxiety">Anxiety</SelectItem>
                    <SelectItem value="depression">Depression</SelectItem>
                    <SelectItem value="student-life">Student Life</SelectItem>
                    <SelectItem value="relationships">Relationships</SelectItem>
                    <SelectItem value="workplace">Workplace</SelectItem>
                  </SelectContent>
                </Select>
                
                <Textarea
                  placeholder="Share your story... Your experiences could help someone else feel less alone."
                  value={newStory.content || ''}
                  onChange={(e) => setNewStory({...newStory, content: e.target.value})}
                  className="min-h-48"
                />
                
                <Input
                  placeholder="Tags (comma-separated, e.g., healing, hope, therapy)"
                  value={newStory.tags?.join(', ') || ''}
                  onChange={(e) => setNewStory({
                    ...newStory, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                />
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newStory.isAnonymous}
                    onChange={(e) => setNewStory({...newStory, isAnonymous: e.target.checked})}
                  />
                  <label htmlFor="anonymous" className="text-sm">Share anonymously</label>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={createStory} className="flex-1">
                    Share Story
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            placeholder="Search stories by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory || undefined} onValueChange={(value) => setSelectedCategory(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="personal-growth">Personal Growth</SelectItem>
            <SelectItem value="anxiety">Anxiety</SelectItem>
            <SelectItem value="depression">Depression</SelectItem>
            <SelectItem value="student-life">Student Life</SelectItem>
            <SelectItem value="relationships">Relationships</SelectItem>
            <SelectItem value="workplace">Workplace</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="likes">Most Liked</SelectItem>
            <SelectItem value="comments">Most Discussed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700">
          <CardContent className="py-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full dark:bg-yellow-900/30">
              <BookOpen className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Connection Issue
            </h3>
            <p className="max-w-md mx-auto mb-4 text-yellow-700 dark:text-yellow-300">
              {error}
            </p>
            <Button 
              onClick={loadStories}
              variant="outline"
              className="text-yellow-700 border-yellow-300 dark:border-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stories */}
      <div className="space-y-6">
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading stories...</p>
            </CardContent>
          </Card>
        ) : !error ? (
          <AnimatePresence>
            {filteredStories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2 text-xl font-semibold">No stories found</h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-300">
                      {searchQuery || selectedCategory ? 'Try adjusting your search filters' : 'Be the first to share your story with the community'}
                    </p>
                    {!searchQuery && !selectedCategory && user && (
                      <Button onClick={() => setShowCreateDialog(true)}>
                        Share Your Story
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{story.authorAvatar || '😊'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{story.authorName || 'Anonymous'}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{getTimeAgo(story.createdAt)}</span>
                              <span>•</span>
                              <span>{story.readTime} min read</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`border ${getCategoryColor(story.category)}`}>
                            {story.category.replace('-', ' ')}
                          </Badge>
                          {story.isAnonymous && (
                            <Badge variant="outline" className="text-xs">
                              <EyeOff className="w-3 h-3 mr-1" />
                              Anonymous
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-xl">{story.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="prose-sm prose max-w-none">
                        <p className="leading-relaxed text-gray-700 whitespace-pre-line dark:text-gray-300">
                          {story.content.length > 500 
                            ? story.content.slice(0, 500) + '...'
                            : story.content
                          }
                        </p>
                      </div>
                      
                      {story.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {story.tags.map((tag, tagIndex) => (
                            <Badge key={tagIndex} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(story.id)}
                            className={`${user && story.likedBy?.includes(user.id) ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                            disabled={!user}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${user && story.likedBy?.includes(user.id) ? 'fill-current' : ''}`} />
                            {story.likes}
                          </Button>
                          
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {story.comments?.length || 0}
                          </Button>
                        </div>
                        
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
}
