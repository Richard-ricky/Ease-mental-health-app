import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "././ui/card.tsx";
import { Button } from "././ui/button.tsx";
import { Badge } from "././ui/badge.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "././ui/tabs.tsx";
import { RefreshCw, Heart, Share2, BookmarkPlus, Sparkles, Sun, Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface MotivationItem {
  id: string;
  type: 'quote' | 'verse' | 'affirmation';
  content: string;
  author?: string;
  source?: string;
  category: string;
  isFavorite?: boolean;
}

export function DailyMotivation() {
  const [dailyMotivation, setDailyMotivation] = useState<MotivationItem | null>(null);
  const [favorites, setFavorites] = useState<MotivationItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const motivationalContent: MotivationItem[] = [
    // Inspirational Quotes
    {
      id: '1',
      type: 'quote',
      content: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.",
      author: "Unknown",
      category: 'self-care'
    },
    {
      id: '2',
      type: 'quote',
      content: "It's okay to not be okay. It's not okay to stay that way.",
      author: "Unknown",
      category: 'hope'
    },
    {
      id: '3',
      type: 'quote',
      content: "You are stronger than you think, braver than you feel, and more loved than you know.",
      author: "Unknown",
      category: 'strength'
    },
    {
      id: '4',
      type: 'quote',
      content: "Progress, not perfection. Every small step forward is worth celebrating.",
      author: "Unknown",
      category: 'progress'
    },
    {
      id: '5',
      type: 'quote',
      content: "Your current situation is not your final destination. Keep moving forward.",
      author: "Unknown",
      category: 'hope'
    },

    // Memory Verses & Spiritual Content
    {
      id: '6',
      type: 'verse',
      content: "Cast all your anxiety on Him because He cares for you.",
      source: "1 Peter 5:7",
      category: 'anxiety'
    },
    {
      id: '7',
      type: 'verse',
      content: "For I know the plans I have for you, plans to prosper you and not to harm you, to give you hope and a future.",
      source: "Jeremiah 29:11",
      category: 'hope'
    },
    {
      id: '8',
      type: 'verse',
      content: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
      source: "Joshua 1:9",
      category: 'strength'
    },
    {
      id: '9',
      type: 'verse',
      content: "The Lord your God is with you, the Mighty Warrior who saves. He will take great delight in you; in His love He will no longer rebuke you, but will rejoice over you with singing.",
      source: "Zephaniah 3:17",
      category: 'love'
    },

    // Daily Affirmations
    {
      id: '10',
      type: 'affirmation',
      content: "I am worthy of love, respect, and happiness. I choose to treat myself with kindness today.",
      category: 'self-love'
    },
    {
      id: '11',
      type: 'affirmation',
      content: "I have the power to create positive change in my life. Each day brings new opportunities for growth.",
      category: 'empowerment'
    },
    {
      id: '12',
      type: 'affirmation',
      content: "I am resilient and capable of overcoming any challenge. My strength grows with each obstacle I face.",
      category: 'resilience'
    },
    {
      id: '13',
      type: 'affirmation',
      content: "I choose peace over worry, hope over fear, and love over judgment. Today is a gift.",
      category: 'peace'
    },
    {
      id: '14',
      type: 'affirmation',
      content: "My feelings are valid and temporary. I have the courage to sit with difficult emotions and grow from them.",
      category: 'emotional-intelligence'
    },

    // More quotes for variety
    {
      id: '15',
      type: 'quote',
      content: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, frustrated, scared and anxious. Having feelings doesn't make you a negative person. It makes you human.",
      author: "Lori Deschene",
      category: 'acceptance'
    },
    {
      id: '16',
      type: 'quote',
      content: "Healing isn't linear. Some days you'll feel like you're flying, other days you'll feel like you're dying. Both are okay.",
      author: "Unknown",
      category: 'healing'
    },
    {
      id: '17',
      type: 'quote',
      content: "Your mental health is everything - prioritize it. Make the time like your life depends on it, because it does.",
      author: "Mel Robbins",
      category: 'prioritization'
    }
  ];

  useEffect(() => {
    loadDailyMotivation();
    loadFavorites();
  }, []);

  const loadDailyMotivation = () => {
    // Get today's date to ensure consistency
    const today = new Date().toDateString();
    const savedDaily = localStorage.getItem(`daily-motivation-${today}`);
    
    if (savedDaily) {
      setDailyMotivation(JSON.parse(savedDaily));
    } else {
      // Select a random motivation for today
      const randomIndex = Math.floor(Math.random() * motivationalContent.length);
      const todaysMotivation = motivationalContent[randomIndex];
      setDailyMotivation(todaysMotivation);
      localStorage.setItem(`daily-motivation-${today}`, JSON.stringify(todaysMotivation));
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('motivation-favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const refreshMotivation = async () => {
    setIsRefreshing(true);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const randomIndex = Math.floor(Math.random() * motivationalContent.length);
    const newMotivation = motivationalContent[randomIndex];
    setDailyMotivation(newMotivation);
    
    // Update today's motivation in localStorage
    const today = new Date().toDateString();
    localStorage.setItem(`daily-motivation-${today}`, JSON.stringify(newMotivation));
    
    setIsRefreshing(false);
  };

  const addToFavorites = (item: MotivationItem) => {
    const newFavorites = [...favorites, { ...item, isFavorite: true }];
    setFavorites(newFavorites);
    localStorage.setItem('motivation-favorites', JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (itemId: string) => {
    const newFavorites = favorites.filter(item => item.id !== itemId);
    setFavorites(newFavorites);
    localStorage.setItem('motivation-favorites', JSON.stringify(newFavorites));
  };

  const shareMotivation = async (item: MotivationItem) => {
    const shareText = `${item.content} ${item.author ? `- ${item.author}` : ''} ${item.source ? `(${item.source})` : ''}\n\nShared from Ease Mental Health App`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Motivation from Ease',
          text: shareText
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareText);
      console.log('Copied to clipboard!');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quote':
        return <Quote className="w-5 h-5" />;
      case 'verse':
        return <BookmarkPlus className="w-5 h-5" />;
      case 'affirmation':
        return <Star className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'quote':
        return 'bg-blue-100 text-blue-700';
      case 'verse':
        return 'bg-purple-100 text-purple-700';
      case 'affirmation':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredContent = currentCategory === 'all' 
    ? motivationalContent 
    : motivationalContent.filter(item => item.category === currentCategory);

  const categories = ['all', 'hope', 'strength', 'self-care', 'anxiety', 'love', 'peace', 'healing'];

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6 space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl">
          <Sun className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Daily Motivation</h2>
          <p className="text-gray-600">Start your day with inspiration and hope</p>
        </div>
      </div>

      {/* Today's Featured Motivation */}
      {dailyMotivation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-orange-600" />
                  <span>Today's Inspiration</span>
                </CardTitle>
                <Badge className={getTypeColor(dailyMotivation.type)}>
                  {getTypeIcon(dailyMotivation.type)}
                  <span className="ml-1 capitalize">{dailyMotivation.type}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.blockquote 
                key={dailyMotivation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="pl-4 text-lg italic text-gray-800 border-l-4 border-orange-400"
              >
                "{dailyMotivation.content}"
              </motion.blockquote>
              
              {(dailyMotivation.author || dailyMotivation.source) && (
                <p className="text-right text-gray-600">
                  — {dailyMotivation.author || dailyMotivation.source}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={refreshMotivation}
                  disabled={isRefreshing}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>New Inspiration</span>
                </Button>
                
                <Button
                  onClick={() => addToFavorites(dailyMotivation)}
                  variant="outline"
                  disabled={favorites.some(f => f.id === dailyMotivation.id)}
                  className="flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4" />
                  <span>Save</span>
                </Button>
                
                <Button
                  onClick={() => shareMotivation(dailyMotivation)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse More</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites ({favorites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={currentCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getTypeColor(item.type)} variant="secondary">
                          {getTypeIcon(item.type)}
                          <span className="ml-1 capitalize">{item.type}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <blockquote className="text-sm italic text-gray-700">
                        "{item.content}"
                      </blockquote>
                      
                      {(item.author || item.source) && (
                        <p className="text-xs text-gray-500">
                          — {item.author || item.source}
                        </p>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addToFavorites(item)}
                          disabled={favorites.some(f => f.id === item.id)}
                        >
                          <Heart className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareMotivation(item)}
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          <div className="space-y-4">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">No favorites yet</h3>
                  <p className="text-gray-600">Save inspirational content to access it anytime</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {favorites.map((item) => (
                  <Card key={item.id} className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getTypeColor(item.type)} variant="secondary">
                          {getTypeIcon(item.type)}
                          <span className="ml-1 capitalize">{item.type}</span>
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromFavorites(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <blockquote className="text-sm italic text-gray-700">
                        "{item.content}"
                      </blockquote>
                      
                      {(item.author || item.source) && (
                        <p className="text-xs text-gray-500">
                          — {item.author || item.source}
                        </p>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => shareMotivation(item)}
                        className="w-full"
                      >
                        <Share2 className="w-3 h-3 mr-2" />
                        Share
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}