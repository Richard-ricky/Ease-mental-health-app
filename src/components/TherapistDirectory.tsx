import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Stethoscope, MapPin, Clock, Phone, Video, Star, Heart, Calendar, Filter, Search, Users } from "lucide-react";
import { motion } from "framer-motion";

interface Therapist {
  id: string;
  name: string;
  title: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  availability: string[];
  acceptsInsurance: boolean;
  languages: string[];
  sessionTypes: ('in-person' | 'video' | 'phone')[];
  bio: string;
  photo: string;
  pricing: {
    individual: number;
    couples: number;
    group: number;
  };
}

export function TherapistDirectory() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadTherapists();
    loadFavorites();
  }, []);

  const loadTherapists = () => {
    // Mock data - in real app, fetch from API
    const mockTherapists: Therapist[] = [
      {
        id: '1',
        name: 'Dr. Sarah Chen',
        title: 'Licensed Clinical Psychologist',
        specialties: ['Anxiety', 'Depression', 'CBT', 'Mindfulness'],
        rating: 4.9,
        reviewCount: 127,
        location: 'Downtown Seattle',
        distance: '0.5 miles',
        availability: ['Monday', 'Wednesday', 'Friday'],
        acceptsInsurance: true,
        languages: ['English', 'Mandarin'],
        sessionTypes: ['in-person', 'video'],
        bio: 'Dr. Chen specializes in cognitive behavioral therapy and mindfulness-based interventions for anxiety and depression.',
        photo: '👩‍⚕️',
        pricing: {
          individual: 150,
          couples: 200,
          group: 75
        }
      },
      {
        id: '2',
        name: 'Dr. Michael Rodriguez',
        title: 'Licensed Marriage & Family Therapist',
        specialties: ['Couples Therapy', 'Family Counseling', 'Relationship Issues'],
        rating: 4.8,
        reviewCount: 89,
        location: 'Bellevue',
        distance: '3.2 miles',
        availability: ['Tuesday', 'Thursday', 'Saturday'],
        acceptsInsurance: true,
        languages: ['English', 'Spanish'],
        sessionTypes: ['in-person', 'video'],
        bio: 'Experienced in helping couples and families navigate relationship challenges and improve communication.',
        photo: '👨‍⚕️',
        pricing: {
          individual: 140,
          couples: 180,
          group: 70
        }
      },
      {
        id: '3',
        name: 'Dr. Emily Johnson',
        title: 'Licensed Clinical Social Worker',
        specialties: ['Trauma Therapy', 'PTSD', 'EMDR', 'Youth Counseling'],
        rating: 4.9,
        reviewCount: 156,
        location: 'Capitol Hill',
        distance: '1.8 miles',
        availability: ['Monday', 'Tuesday', 'Thursday'],
        acceptsInsurance: false,
        languages: ['English'],
        sessionTypes: ['in-person', 'video', 'phone'],
        bio: 'Specialized in trauma-informed care and EMDR therapy for adults and adolescents.',
        photo: '👩‍💼',
        pricing: {
          individual: 160,
          couples: 220,
          group: 80
        }
      },
      {
        id: '4',
        name: 'Dr. James Park',
        title: 'Licensed Professional Counselor',
        specialties: ['ADHD', 'Autism Spectrum', 'Behavioral Therapy', 'Social Skills'],
        rating: 4.7,
        reviewCount: 73,
        location: 'Redmond',
        distance: '8.5 miles',
        availability: ['Wednesday', 'Friday', 'Sunday'],
        acceptsInsurance: true,
        languages: ['English', 'Korean'],
        sessionTypes: ['video', 'phone'],
        bio: 'Focused on neurodevelopmental differences and helping individuals develop coping strategies.',
        photo: '👨‍🔬',
        pricing: {
          individual: 130,
          couples: 170,
          group: 65
        }
      }
    ];
    setTherapists(mockTherapists);
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('therapist-favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    localStorage.setItem('therapist-favorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (therapistId: string) => {
    const newFavorites = favorites.includes(therapistId)
      ? favorites.filter(id => id !== therapistId)
      : [...favorites, therapistId];
    saveFavorites(newFavorites);
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         therapist.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpecialty = !selectedSpecialty || therapist.specialties.includes(selectedSpecialty);
    const matchesLocation = !selectedLocation || therapist.location.includes(selectedLocation);
    const matchesSessionType = !selectedSessionType || therapist.sessionTypes.includes(selectedSessionType as any);
    
    return matchesSearch && matchesSpecialty && matchesLocation && matchesSessionType;
  });

  const specialties = Array.from(new Set(therapists.flatMap(t => t.specialties))).sort();
  const locations = Array.from(new Set(therapists.map(t => t.location.split(' ')[0]))).sort();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 shadow-2xl bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text">
              Therapist Directory
            </h2>
            <p className="text-gray-600 dark:text-gray-300">Find licensed mental health professionals in your area</p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          <Input
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <SelectValue placeholder="All specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All specialties</SelectItem>
              {specialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <SelectValue placeholder="All locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
            <SelectTrigger className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <SelectValue placeholder="Session type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="in-person">In-Person</SelectItem>
              <SelectItem value="video">Video Call</SelectItem>
              <SelectItem value="phone">Phone Call</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialty('');
              setSelectedLocation('');
              setSelectedSessionType('');
            }}
            className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </motion.div>

      {/* Results Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Users className="w-5 h-5 text-violet-600" />
                <span className="font-medium">
                  Found {filteredTherapists.length} therapist{filteredTherapists.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <Heart className="w-4 h-4" />
                <span>{favorites.length} favorites</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Therapist Cards */}
      <div className="grid gap-6">
        {filteredTherapists.map((therapist, index) => (
          <motion.div
            key={therapist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* Photo and Basic Info */}
                  <div className="flex flex-col items-center space-y-4 lg:items-start">
                    <div className="flex items-center justify-center w-24 h-24 text-4xl rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900">
                      {therapist.photo}
                    </div>
                    <div className="text-center lg:text-left">
                      <h3 className="text-xl font-semibold">{therapist.name}</h3>
                      <p className="font-medium text-violet-600 dark:text-violet-400">{therapist.title}</p>
                      <div className="flex items-center justify-center mt-2 space-x-1 lg:justify-start">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{therapist.rating}</span>
                        <span className="text-gray-500">({therapist.reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 space-y-4">
                    <p className="text-gray-600 dark:text-gray-300">{therapist.bio}</p>
                    
                    {/* Specialties */}
                    <div>
                      <h4 className="mb-2 font-medium">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {therapist.specialties.map(specialty => (
                          <Badge key={specialty} variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{therapist.location} • {therapist.distance}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>Available: {therapist.availability.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {therapist.acceptsInsurance ? (
                            <Badge className="text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-200">
                              Accepts Insurance
                            </Badge>
                          ) : (
                            <Badge variant="outline">Private Pay</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Languages: </span>
                          {therapist.languages.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Session Types: </span>
                          {therapist.sessionTypes.map(type => (
                            <Badge key={type} variant="outline" className="mr-1 text-xs">
                              {type === 'in-person' && <Users className="w-3 h-3 mr-1" />}
                              {type === 'video' && <Video className="w-3 h-3 mr-1" />}
                              {type === 'phone' && <Phone className="w-3 h-3 mr-1" />}
                              {type.replace('-', ' ')}
                            </Badge>
                          ))}
                        </div>
                        <div>
                          <span className="font-medium">Individual: </span>
                          ${therapist.pricing.individual}/session
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-3 lg:w-48">
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Consultation
                    </Button>
                    <Button variant="outline">
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => toggleFavorite(therapist.id)}
                      className={favorites.includes(therapist.id) ? 'text-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${favorites.includes(therapist.id) ? 'fill-current' : ''}`} />
                      {favorites.includes(therapist.id) ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTherapists.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <Stethoscope className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold">No therapists found</h3>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Try adjusting your search filters to find more options
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('');
                  setSelectedLocation('');
                  setSelectedSessionType('');
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}