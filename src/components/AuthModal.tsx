import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Eye, EyeOff, Mail, Lock, User, Heart, Sparkles, Shield, ArrowLeft } from "lucide-react";
import { supabase, apiCall } from "../../utils/supabase/client.ts";
import { toast } from "sonner";
import { User as UserType } from "../../utils/appHelpers.ts";

interface AuthModalProps {
  onAuthSuccess: (user: UserType) => void;
  onBack: () => void;
}

export function AuthModal({ onAuthSuccess, onBack }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        toast.error("Please enter your name");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        // Sign up flow
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          // Create user profile via API
          try {
            const profileData = await apiCall('/user/profile', {
              method: 'POST',
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                preferences: {
                  theme: 'light',
                  notifications: true,
                  privacy: {
                    anonymousMode: false,
                    dataSharing: false
                  }
                }
              })
            });

            onAuthSuccess(profileData.user);
            toast.success(`Welcome to Ease, ${formData.name}! 🎉`);
          } catch (apiError) {
            console.error('Error creating profile:', apiError);
            // Fallback to basic user data
            const basicUser = {
              id: data.user.id,
              name: formData.name,
              email: formData.email,
              preferences: {
                theme: 'light' as const,
                notifications: true,
                privacy: {
                  anonymousMode: false,
                  dataSharing: false
                }
              }
            };
            onAuthSuccess(basicUser);
            toast.success(`Welcome to Ease, ${formData.name}! 🎉`);
          }
        }
      } else {
        // Sign in flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          // Get user profile from API
          try {
            const profileData = await apiCall('/user/profile');
            onAuthSuccess(profileData.user);
            toast.success("Welcome back! 🎉");
          } catch (apiError) {
            console.error('Error fetching profile:', apiError);
            // Fallback to basic user data
            const basicUser = {
              id: data.user.id,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              preferences: {
                theme: 'light' as const,
                notifications: true,
                privacy: {
                  anonymousMode: false,
                  dataSharing: false
                }
              }
            };
            onAuthSuccess(basicUser);
            toast.success("Welcome back! 🎉");
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('Email not confirmed')) {
        toast.error("Please check your email and confirm your account before signing in.");
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message?.includes('User already registered')) {
        toast.error("An account with this email already exists. Please sign in instead.");
        setIsSignUp(false);
      } else {
        toast.error(error.message || "Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute rounded-full top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 dark:from-purple-600/20 dark:to-pink-600/20 filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute rounded-full bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-blue-300/30 to-cyan-300/30 dark:from-blue-600/20 dark:to-cyan-600/20 filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        <Card className="border shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-white/20 dark:border-gray-700/30">
          <CardHeader className="space-y-6 text-center">
            <motion.div
              className="flex items-center justify-center w-20 h-20 mx-auto shadow-lg bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-700 rounded-2xl"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Heart className="w-10 h-10 text-white drop-shadow-lg" />
            </motion.div>

            <div>
              <CardTitle className="text-2xl text-transparent bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">
                {isSignUp ? "Join Ease" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                {isSignUp 
                  ? "Start your mental wellness journey today" 
                  : "Continue your wellness journey"
                }
              </CardDescription>
            </div>

            {/* Features Preview */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Privacy First</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>AI Powered</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="pl-10"
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          className="pl-10"
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 rounded-full border-white/20 border-t-white animate-spin" />
                      <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                    </div>
                  ) : (
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  )}
                </Button>
              </motion.div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                  }}
                  className="text-sm text-purple-600 transition-colors dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  {isSignUp 
                    ? "Already have an account? Sign in" 
                    : "Don't have an account? Sign up"
                  }
                </button>
              </div>
            </form>

            {/* Privacy Notice */}
            <div className="p-4 mt-6 rounded-lg bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p className="mb-1 font-medium">Your privacy is our priority</p>
                  <p>All data is encrypted and we never share your personal information. You can delete your account at any time.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}