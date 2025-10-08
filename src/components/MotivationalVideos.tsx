import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Play, Search, Heart, Share2, Clock, Eye, ThumbsUp, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  youtubeId: string;
  category: string;
  tags: string[];
  views: string;
  likes: string;
  channel: string;
  uploadDate: string;
  isFavorite?: boolean;
}

export function MotivationalVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    loadVideos();
    loadFavorites();
  }, []);

  const loadVideos = () => {
    // Curated mental health and motivational videos
    const mentalHealthVideos: Video[] = [
      {
        id: '1',
        title: 'You Are Not Your Thoughts - Mental Health Motivation',
        description: 'A powerful reminder that your thoughts don\'t define you. Learn to observe your thoughts without judgment.',
        duration: '5:32',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ', // Replace with actual video IDs
        category: 'mental-health',
        tags: ['anxiety', 'mindfulness', 'thoughts'],
        views: '2.3M',
        likes: '45K',
        channel: 'Therapy in a Nutshell',
        uploadDate: '2023-10-15'
      },
      {
        id: '2',
        title: 'The Power of Self-Compassion | Kristin Neff',
        description: 'Learn how to treat yourself with the same kindness you would show a good friend.',
        duration: '18:47',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'self-compassion',
        tags: ['self-love', 'kindness', 'healing'],
        views: '1.8M',
        likes: '38K',
        channel: 'TEDx Talks',
        uploadDate: '2023-09-22'
      },
      {
        id: '3',
        title: '10 Minute Morning Meditation for Positive Energy',
        description: 'Start your day with this calming meditation designed to boost positive energy and mindfulness.',
        duration: '10:15',
        thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'meditation',
        tags: ['morning', 'energy', 'mindfulness'],
        views: '5.2M',
        likes: '89K',
        channel: 'The Honest Guys',
        uploadDate: '2023-11-01'
      },
      {
        id: '4',
        title: 'Overcoming Depression: Tools and Techniques',
        description: 'Practical strategies and coping mechanisms for managing depression symptoms.',
        duration: '15:23',
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'depression',
        tags: ['depression', 'coping', 'healing'],
        views: '892K',
        likes: '22K',
        channel: 'Psych2Go',
        uploadDate: '2023-10-08'
      },
      {
        id: '5',
        title: 'Breathing Exercise for Anxiety Relief - 4-7-8 Technique',
        description: 'Simple but powerful breathing technique to calm anxiety and promote relaxation.',
        duration: '8:12',
        thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'anxiety',
        tags: ['breathing', 'relaxation', 'calm'],
        views: '1.5M',
        likes: '31K',
        channel: 'Yoga with Adriene',
        uploadDate: '2023-09-30'
      },
      {
        id: '6',
        title: 'Building Resilience: Bouncing Back from Life\'s Challenges',
        description: 'Discover strategies to build mental resilience and cope with life\'s inevitable challenges.',
        duration: '12:45',
        thumbnail: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'resilience',
        tags: ['strength', 'growth', 'challenges'],
        views: '743K',
        likes: '18K',
        channel: 'School of Life',
        uploadDate: '2023-11-12'
      },
      {
        id: '7',
        title: 'Guided Sleep Meditation for Deep Rest and Healing',
        description: 'Peaceful meditation to help you fall asleep and promote restorative rest.',
        duration: '30:00',
        thumbnail: 'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'sleep',
        tags: ['sleep', 'relaxation', 'healing'],
        views: '3.8M',
        likes: '67K',
        channel: 'Jason Stephenson',
        uploadDate: '2023-10-25'
      },
      {
        id: '8',
        title: 'Understanding Social Anxiety: You\'re Not Alone',
        description: 'Normalize social anxiety and learn practical strategies for social situations.',
        duration: '11:33',
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'social-anxiety',
        tags: ['social', 'confidence', 'support'],
        views: '654K',
        likes: '15K',
        channel: 'Kati Morton',
        uploadDate: '2023-11-05'
      },
      {
        id: '9',
        title: 'Daily Affirmations for Self-Love and Confidence',
        description: 'Powerful affirmations to boost self-esteem and cultivate self-love.',
        duration: '7:18',
        thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'self-love',
        tags: ['affirmations', 'confidence', 'self-esteem'],
        views: '1.2M',
        likes: '28K',
        channel: 'Rising Higher Meditation',
        uploadDate: '2023-10-18'
      },
      {
        id: '10',
        title: 'Mindfulness in Daily Life: Simple Practices',
        description: 'Easy mindfulness techniques you can practice throughout your day.',
        duration: '9:42',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
        youtubeId: 'dQw4w9WgXcQ',
        category: 'mindfulness',
        tags: ['daily', 'practice', 'awareness'],
        views: '987K',
        likes: '21K',
        channel: 'Mindful',
        uploadDate: '2023-11-08'
      }
    ];

    setVideos(mentalHealthVideos);
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('video-favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const saveFavorites = (newFavorites: Video[]) => {
    localStorage.setItem('video-favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (video: Video) => {
    const isFavorite = favorites.some(f => f.id === video.id);
    if (isFavorite) {
      const newFavorites = favorites.filter(f => f.id !== video.id);
      saveFavorites(newFavorites);
    } else {
      const newFavorites = [...favorites, { ...video, isFavorite: true }];
      saveFavorites(newFavorites);
    }
  };

  const shareVideo = async (video: Video) => {
    const shareText = `Check out this helpful video: "${video.title}" from ${video.channel}\n\nShared from Ease Mental Health App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: shareText,
          url: `https://www.youtube.com/watch?v=${video.youtubeId}`
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\nhttps://www.youtube.com/watch?v=${video.youtubeId}`);
      console.log('Video link copied to clipboard!');
    }
  };

  const categories = ['all', 'mental-health', 'meditation', 'anxiety', 'depression', 'self-love', 'mindfulness', 'sleep', 'resilience'];

  const filteredVideos = videos.filter(video => {
    const matchesCategory = currentCategory === 'all' || video.category === currentCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openVideoModal = (video: Video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6 space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
          <Play className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Motivational Videos</h2>
          <p className="text-gray-600">Curated mental health and wellness content</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            placeholder="Search videos by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={currentCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentCategory(category)}
              className="capitalize"
            >
              {category.replace('-', ' ')}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Videos</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites ({favorites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full transition-all duration-200 cursor-pointer hover:shadow-lg group">
                  <div className="relative overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="object-cover w-full h-48 transition-transform duration-200 group-hover:scale-105"
                      onClick={() => openVideoModal(video)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black bg-opacity-0 group-hover:bg-opacity-30">
                      <Play className="w-12 h-12 text-white transition-opacity duration-200 opacity-0 group-hover:opacity-100" />
                    </div>
                    <div className="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-75 rounded bottom-2 right-2">
                      {video.duration}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{video.channel}</span>
                      <span>•</span>
                      <span>{video.views} views</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {video.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{video.views}</span>
                        <ThumbsUp className="w-4 h-4 ml-2" />
                        <span>{video.likes}</span>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFavorite(video)}
                          className={favorites.some(f => f.id === video.id) ? 'text-red-500' : ''}
                        >
                          <Heart className={`w-4 h-4 ${favorites.some(f => f.id === video.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareVideo(video)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="space-y-4">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">No favorites yet</h3>
                  <p className="text-gray-600">Save videos to watch them anytime</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((video) => (
                  <Card key={video.id} className="h-full">
                    <div className="relative overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="object-cover w-full h-48 transition-transform duration-200 cursor-pointer hover:scale-105"
                        onClick={() => openVideoModal(video)}
                      />
                      <div className="absolute px-2 py-1 text-xs text-white bg-black bg-opacity-75 rounded bottom-2 right-2">
                        {video.duration}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFavorite(video)}
                          className="text-red-500"
                        >
                          <Heart className="w-4 h-4 mr-1 fill-current" />
                          Remove
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openVideoModal(video)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Watch
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <Button
                onClick={closeVideoModal}
                className="absolute z-10 top-4 right-4"
                variant="outline"
                size="sm"
              >
                ✕
              </Button>
              
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                  title={selectedVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold">{selectedVideo.title}</h3>
                <p className="mb-4 text-gray-600">{selectedVideo.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{selectedVideo.channel}</span>
                    <span>{selectedVideo.views} views</span>
                    <span>{selectedVideo.likes} likes</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFavorite(selectedVideo)}
                      className={favorites.some(f => f.id === selectedVideo.id) ? 'text-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${favorites.some(f => f.id === selectedVideo.id) ? 'fill-current' : ''}`} />
                      {favorites.some(f => f.id === selectedVideo.id) ? 'Saved' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => shareVideo(selectedVideo)}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}